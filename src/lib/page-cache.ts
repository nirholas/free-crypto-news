/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * Page-level stale-while-revalidate cache.
 *
 * Every page under `app/[locale]` renders dynamically on each request because
 * the locale layout reads `headers()` for the CSP nonce, so `export const
 * revalidate` never yields an ISR page. The only thing that keeps a page fast
 * is what the server process already holds in memory. This helper gives a
 * page's expensive server work (RSS aggregation, DefiLlama dumps, AI digests)
 * a proper SWR window on top of the in-process `MemoryCache`:
 *
 * - fresh hit: return immediately
 * - stale hit: return immediately and refresh once in the background
 * - miss: fetch (deduplicated across concurrent renders) and store
 *
 * A result that fails `shouldCache` (an empty aggregate after every upstream
 * timed out) is returned to the caller but never stored, so the next request
 * retries instead of serving nothing for an hour.
 *
 * Built only on `@/lib/cache` so it is safe in both the Node and Edge runtimes.
 */

import MemoryCache from '@/lib/cache';

interface SwrEntry<T> {
  data: T;
  freshUntil: number;
}

export const pageCache = new MemoryCache(300);

const inflight = new Map<string, Promise<unknown>>();

export interface SwrOptions<T> {
  /** Seconds a value is served without triggering a refresh. */
  fresh: number;
  /** Seconds a value stays servable (stale) while a refresh runs. Default 1 h. */
  maxAge?: number;
  /** Return false to skip storing a result (defaults to storing everything). */
  shouldCache?: (data: T) => boolean;
}

export async function swrCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: SwrOptions<T>,
): Promise<T> {
  const { fresh, maxAge = 3600, shouldCache = () => true } = options;

  const entry = pageCache.get<SwrEntry<T>>(key);
  if (entry && entry.freshUntil > Date.now()) return entry.data;

  const refresh = (): Promise<T> => {
    const existing = inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetchFn()
      .then((data) => {
        if (shouldCache(data)) {
          pageCache.set<SwrEntry<T>>(
            key,
            { data, freshUntil: Date.now() + fresh * 1000 },
            Math.max(maxAge, fresh),
          );
        }
        return data;
      })
      .finally(() => {
        inflight.delete(key);
      });

    inflight.set(key, promise);
    return promise;
  };

  if (entry) {
    refresh().catch(() => {
      // Background refresh failed: the stale value stays servable until maxAge.
    });
    return entry.data;
  }

  return refresh();
}

/** Article-list results are only worth remembering when they carry articles. */
export function hasArticles(data: { articles: unknown[] } | null | undefined): boolean {
  return Array.isArray(data?.articles) && data.articles.length > 0;
}
