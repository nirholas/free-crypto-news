/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 */

import { describe, it, expect } from 'vitest';
import MemoryCache, { withCache, staleCache } from '@/lib/cache';

describe('withCache shouldCache', () => {
  it('does not poison the cache with a result the caller rejects', async () => {
    const cache = new MemoryCache();
    const key = 'agg:test:empty-first';
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return calls === 1 ? [] : ['article'];
    };
    const opts = { shouldCache: (v: string[]) => v.length > 0 };

    expect(await withCache(cache, key, 60, fetcher, opts)).toEqual([]);
    // Empty result was not cached, so the next call fetches again
    expect(await withCache(cache, key, 60, fetcher, opts)).toEqual(['article']);
    // Non-empty result is cached
    expect(await withCache(cache, key, 60, fetcher, opts)).toEqual(['article']);
    expect(calls).toBe(2);
  });

  it('serves the last known-good value instead of a rejected empty result', async () => {
    const cache = new MemoryCache();
    const key = 'agg:test:stale-fallback';
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return calls === 1 ? ['good'] : [];
    };
    const opts = { shouldCache: (v: string[]) => v.length > 0 };

    expect(await withCache(cache, key, 1, fetcher, opts)).toEqual(['good']);
    cache.delete(key); // simulate TTL expiry while the stale copy survives
    expect(staleCache.get<string[]>(key)).toEqual(['good']);
    expect(await withCache(cache, key, 1, fetcher, opts)).toEqual(['good']);
    expect(calls).toBe(2);
  });
});
