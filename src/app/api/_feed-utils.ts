/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * Shared utilities for RSS/Atom feed generation.
 */

import {
  getLatestNews,
  getDefiNews,
  getBitcoinNews,
  getNewsByCategory,
  getFeedCategoryIds,
  getCategories,
} from '@/lib/crypto-news';

const BASE_URL = 'https://cryptocurrency.cv';

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface FeedMeta {
  title: string;
  description: string;
  feedUrl: string;
}

/**
 * Every feed slug this endpoint serves: the two hand-written variants plus one
 * per category the source registry actually carries. The registry is the source
 * of truth, so a category added to RSS_SOURCES gets a syndicatable feed with no
 * change here.
 */
export function feedSlugs(): string[] {
  return [...new Set(['all', 'defi', 'bitcoin', ...getFeedCategoryIds()])];
}

/** Human-readable name and blurb for a category slug, for the feed's channel. */
function categoryMeta(slug: string): { name: string; description: string } {
  const hit = getCategories().categories.find((c) => c.id === slug);
  if (hit) return { name: hit.name, description: hit.description };
  const name = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { name, description: `${name} news aggregated from top crypto sources` };
}

/**
 * Fetch articles and return metadata for the requested feed variant.
 *
 * Only `all`, `defi` and `bitcoin` used to resolve, so the other categories the
 * aggregator already indexes had no syndicatable feed even though /api/news
 * accepted them as a filter. Any slug in `feedSlugs()` now resolves; an unknown
 * slug returns null so the caller can answer 400 rather than silently serving
 * the firehose under the wrong title.
 *
 * @param feed  a slug from `feedSlugs()`
 * @param format  "rss" | "atom", controls the feedUrl API path
 * @param limit  max articles to fetch
 */
export async function resolveFeed(
  feed: string,
  format: 'rss' | 'atom',
  limit: number,
): Promise<{
  articles: Awaited<ReturnType<typeof getLatestNews>>['articles'];
  meta: FeedMeta;
} | null> {
  const path = `/api/${format}`;
  switch (feed) {
    case 'defi': {
      const data = await getDefiNews(limit);
      return {
        articles: data.articles,
        meta: {
          title: 'Crypto Vision News - DeFi Feed',
          description: 'DeFi news aggregated from top crypto sources',
          feedUrl: `${BASE_URL}${path}?feed=defi`,
        },
      };
    }
    case 'bitcoin': {
      const data = await getBitcoinNews(limit);
      return {
        articles: data.articles,
        meta: {
          title: 'Crypto Vision News - Bitcoin Feed',
          description: 'Bitcoin news aggregated from top crypto sources',
          feedUrl: `${BASE_URL}${path}?feed=bitcoin`,
        },
      };
    }
    case '':
    case 'all': {
      const data = await getLatestNews(limit);
      return {
        articles: data.articles,
        meta: {
          title: 'Crypto Vision News - All Sources',
          description: 'Crypto news aggregated from 200+ top sources - 100% FREE',
          feedUrl: `${BASE_URL}${path}`,
        },
      };
    }
    default: {
      if (!getFeedCategoryIds().includes(feed)) return null;
      const { name, description } = categoryMeta(feed);
      const data = await getNewsByCategory(feed, limit);
      return {
        articles: data.articles,
        meta: {
          title: `Crypto Vision News - ${name} Feed`,
          description,
          feedUrl: `${BASE_URL}${path}?feed=${encodeURIComponent(feed)}`,
        },
      };
    }
  }
}
