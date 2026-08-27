/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * Stale-while-revalidate wrappers around the RSS aggregators in crypto-news.
 *
 * The aggregators hold their own 90 s in-memory cache, after which the next
 * caller pays a cold aggregation (up to the 20 s feed timeout). Pages and
 * routes that read through these wrappers keep serving the last result while
 * a background refresh runs, so only the very first request on a fresh server
 * process ever waits, and `warmNewsCaches()` takes even that hit at boot.
 */

import {
  getHomepageNews,
  getLatestNews,
  getNewsByCategory,
  getOpinionNews,
  type NewsResponse,
} from '@/lib/crypto-news';
import { hasArticles, swrCached } from '@/lib/page-cache';

const FRESH_SECONDS = 300;

export function getCachedLatestNews(limit: number): Promise<NewsResponse> {
  return swrCached(`news:latest:${limit}`, () => getLatestNews(limit), {
    fresh: FRESH_SECONDS,
    shouldCache: hasArticles,
  });
}

export function getCachedCategoryNews(category: string, limit: number): Promise<NewsResponse> {
  return swrCached(
    `news:category:${category.toLowerCase()}:${limit}`,
    () => getNewsByCategory(category, limit),
    { fresh: FRESH_SECONDS, shouldCache: hasArticles },
  );
}

export function getCachedOpinionNews(
  limit: number,
  options?: { category?: string; page?: number; perPage?: number },
): Promise<NewsResponse> {
  const key = [
    'news:opinion',
    limit,
    options?.category ?? 'all',
    options?.page ?? 1,
    options?.perPage ?? limit,
  ].join(':');
  return swrCached(key, () => getOpinionNews(limit, options), {
    fresh: FRESH_SECONDS,
    shouldCache: hasArticles,
  });
}

export type HomepageNews = Awaited<ReturnType<typeof getHomepageNews>>;

export function getCachedHomepageNews(options?: {
  latestLimit?: number;
  breakingLimit?: number;
  trendingLimit?: number;
}): Promise<HomepageNews> {
  const key = [
    'news:homepage',
    options?.latestLimit ?? 50,
    options?.breakingLimit ?? 5,
    options?.trendingLimit ?? 10,
  ].join(':');
  return swrCached(key, () => getHomepageNews(options), {
    fresh: FRESH_SECONDS,
    shouldCache: (data) => hasArticles(data.latest),
  });
}

/**
 * Pre-fill the aggregates every landing page depends on. Called once from
 * `instrumentation.ts` when a production server process starts so the first
 * visitor after a deploy or a Cloud Run restart does not pay the aggregation.
 */
export async function warmNewsCaches(): Promise<void> {
  await Promise.allSettled([
    getCachedHomepageNews({ latestLimit: 50, trendingLimit: 10 }),
    getCachedLatestNews(100),
    getCachedLatestNews(50),
  ]);
}
