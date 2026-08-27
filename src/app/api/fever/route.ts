/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 *
 * This file is part of cryptocurrency.cv.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * Fever API endpoint: point any Fever-compatible RSS reader at
 * https://cryptocurrency.cv/api/fever and it subscribes to all 200+ sources.
 *
 * Query params (Fever sends them on the query string, credentials in the body):
 *   groups, feeds, favicons, items, links, unread_item_ids, saved_item_ids
 *   items also accepts since_id, max_id, with_ids
 *
 * Read and saved state is not stored server-side (the API is keyless and has no
 * per-user rows), so `mark` requests are accepted and ignored and clients keep
 * that state locally. Every other field is the live feed.
 *
 * Spec: https://web.archive.org/web/20161217042229/https://feedafever.com/api
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getLatestNews, getSources, getCategories } from '@/lib/crypto-news';
import { createRequestLogger } from '@/lib/logger';
import {
  FEVER_API_VERSION,
  buildFeedIds,
  groupId,
  siteUrlOf,
  toFeverItem,
  type FeverFeed,
  type FeverFeedsGroup,
  type FeverGroup,
  type FeverItem,
} from '@/lib/fever';

export const revalidate = 60;

/** Fever caps a single items response at 50. */
const ITEMS_PER_PAGE = 50;

/** How many articles to pull before filtering, so a since_id page still fills. */
const FETCH_POOL = 50;

function feverResponse(body: Record<string, unknown>): NextResponse {
  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}

/**
 * The public deployment authenticates nobody: it is a free, keyless API, so any
 * client that presents an api_key is accepted. A self-hoster who sets
 * FEVER_API_KEY gets the real check instead, which is the only reason to run
 * this endpoint behind a credential at all.
 */
function isAuthorized(apiKey: string | null): boolean {
  const expected = process.env.FEVER_API_KEY;
  if (expected) return apiKey === expected;
  return Boolean(apiKey);
}

async function readApiKey(request: NextRequest): Promise<string | null> {
  const fromQuery = request.nextUrl.searchParams.get('api_key');
  if (fromQuery) return fromQuery;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const body = await request.text();
      return new URLSearchParams(body).get('api_key');
    }
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const value = form.get('api_key');
      return typeof value === 'string' ? value : null;
    }
  } catch {
    // A malformed body is an unauthenticated request, not a 500.
  }
  return null;
}

/** Presentable title for a source category the catalogue does not describe. */
function titleCase(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseIdList(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

async function handle(request: NextRequest): Promise<NextResponse> {
  const logger = createRequestLogger(request);
  const params = request.nextUrl.searchParams;
  const apiKey = await readApiKey(request);

  if (!isAuthorized(apiKey)) {
    return feverResponse({ api_version: FEVER_API_VERSION, auth: 0 });
  }

  const body: Record<string, unknown> = {
    api_version: FEVER_API_VERSION,
    auth: 1,
    last_refreshed_on_time: Math.floor(Date.now() / 1000),
  };

  try {
    const wantsGroups = params.has('groups');
    const wantsFeeds = params.has('feeds');
    const wantsItems = params.has('items');
    const wantsUnreadIds = params.has('unread_item_ids');
    const wantsSavedIds = params.has('saved_item_ids');
    const wantsLinks = params.has('links');
    const wantsFavicons = params.has('favicons');

    // A client's first sync asks for groups and feeds together; both need the
    // source list, so it is fetched once and shared.
    const needsSources = wantsGroups || wantsFeeds || wantsItems || wantsUnreadIds;
    const sources = needsSources ? (await getSources()).sources : [];
    const feedIds = buildFeedIds(sources.map((s) => s.key));
    const nowSeconds = Math.floor(Date.now() / 1000);

    // Clients read groups and feeds_groups together: a feeds_groups row naming a
    // group that groups never declared leaves those feeds unreachable in the
    // sidebar, so both are built from one pass over the source list. Sources
    // carry category slugs that getCategories() does not describe, so the
    // declared set is the union, titled from the catalogue where possible.
    if (wantsGroups || wantsFeeds) {
      const titles = new Map(
        getCategories().categories.map((category) => [category.id, category.name]),
      );
      const byGroup = new Map<number, { slug: string; feedIds: number[] }>();
      for (const source of sources) {
        const id = groupId(source.category);
        const bucket = byGroup.get(id) ?? { slug: source.category, feedIds: [] };
        bucket.feedIds.push(feedIds.get(source.key) as number);
        byGroup.set(id, bucket);
      }

      if (wantsGroups) {
        body.groups = [...byGroup.entries()].map(([id, bucket]): FeverGroup => ({
          id,
          title: titles.get(bucket.slug) ?? titleCase(bucket.slug),
        }));
      }

      body.feeds_groups = [...byGroup.entries()].map(
        ([id, bucket]): FeverFeedsGroup => ({
          group_id: id,
          feed_ids: bucket.feedIds.join(','),
        }),
      );

      if (wantsFeeds) {
        body.feeds = sources.map(
          (source): FeverFeed => ({
            id: feedIds.get(source.key) as number,
            favicon_id: 0,
            title: source.name,
            url: source.url,
            site_url: siteUrlOf(source.url),
            is_spark: 0,
            last_updated_on_time: nowSeconds,
          }),
        );
      }
    }

    if (wantsFavicons) {
      // No per-source favicons are stored, and inventing ids would make clients
      // request images that do not exist. An empty set is the honest answer.
      body.favicons = [];
    }

    if (wantsLinks) {
      // "Hot links" is a Fever feature with no equivalent here.
      body.links = [];
    }

    if (wantsItems || wantsUnreadIds) {
      const news = await getLatestNews(FETCH_POOL);
      let items: FeverItem[] = news.articles.map((article) => toFeverItem(article, feedIds));

      const withIds = parseIdList(params.get('with_ids'));
      if (withIds.length > 0) {
        const wanted = new Set(withIds);
        items = items.filter((item) => wanted.has(item.id));
      } else {
        const sinceId = Number.parseInt(params.get('since_id') ?? '', 10);
        const maxId = Number.parseInt(params.get('max_id') ?? '', 10);
        if (Number.isFinite(sinceId)) items = items.filter((item) => item.id > sinceId);
        if (Number.isFinite(maxId)) items = items.filter((item) => item.id < maxId);
      }

      // Fever orders items by id ascending and returns at most 50 per page.
      items.sort((a, b) => a.id - b.id);

      if (wantsItems) {
        body.items = items.slice(0, ITEMS_PER_PAGE);
        body.total_items = items.length;
      }
      if (wantsUnreadIds) {
        // Nothing is marked read server-side, so every served item is unread.
        body.unread_item_ids = items.map((item) => item.id).join(',');
      }
    }

    if (wantsSavedIds) {
      // Saved state lives in the client; the server has none to report.
      body.saved_item_ids = '';
    }

    return feverResponse(body);
  } catch (error) {
    logger.error('Fever API request failed', error);
    // A Fever client that receives a non-Fever error body reports the account as
    // broken and stops syncing, so failures still answer in-protocol.
    return feverResponse({
      ...body,
      groups: [],
      feeds: [],
      feeds_groups: [],
      items: [],
      total_items: 0,
      unread_item_ids: '',
      saved_item_ids: '',
    });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}

/** Fever clients POST credentials; `mark` writes are accepted and ignored. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}
