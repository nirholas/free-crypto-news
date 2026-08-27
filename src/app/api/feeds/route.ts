/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * GET /api/feeds
 *
 * Every RSS and Atom feed this site publishes, one row per topic.
 *
 * The aggregator has always indexed every category, and /api/news has always
 * accepted `?category=`, but only three feeds resolved and none of them were
 * listed anywhere: a reader who wanted just Solana or just regulation had no
 * way to discover that such a feed existed. This endpoint is that index, built
 * from the same source registry the feeds themselves resolve against, so it can
 * never drift from what actually works.
 *
 * No auth, no key, CORS open: a feed directory is only useful if a reader's app
 * can fetch it.
 */

import { NextResponse } from 'next/server';

import { feedSlugs } from '@/app/api/_feed-utils';
import { getCategories } from '@/lib/crypto-news';

export const runtime = 'nodejs';
export const revalidate = 3600;

const BASE_URL = 'https://cryptocurrency.cv';

function label(slug: string, categories: ReturnType<typeof getCategories>['categories']) {
  if (slug === 'all') {
    return { name: 'All Sources', description: 'Every article, across every category' };
  }
  const hit = categories.find((c) => c.id === slug);
  if (hit) return { name: hit.name, description: hit.description };
  const name = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { name, description: `${name} news aggregated from top crypto sources` };
}

export async function GET() {
  const { categories } = getCategories();
  const feeds = feedSlugs().map((slug) => {
    const { name, description } = label(slug, categories);
    const query = slug === 'all' ? '' : `?feed=${encodeURIComponent(slug)}`;
    return {
      slug,
      name,
      description,
      rss: `${BASE_URL}/api/rss${query}`,
      atom: `${BASE_URL}/api/atom${query}`,
      json: `${BASE_URL}/api/news${slug === 'all' ? '' : `?category=${encodeURIComponent(slug)}`}`,
    };
  });

  return NextResponse.json(
    {
      count: feeds.length,
      // Both parameter spellings work; naming them here saves a round trip.
      usage: {
        limit: 'Append &limit=N (max 50) to any feed URL.',
        formats: ['rss', 'atom', 'json'],
      },
      feeds,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}
