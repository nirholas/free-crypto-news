/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { NextResponse } from 'next/server';
import { COINGECKO_BASE } from '@/lib/constants';

import { resilientFetch } from '@/lib/resilient-fetch';
import { staleCache } from '@/lib/cache';
export const revalidate = 300; // 5 minutes

/**
 * GET /api/exchange-rates
 *
 * Proxies CoinGecko exchange rates so client components never call
 * external APIs directly from the browser.
 */
const STALE_KEY = 'exchange-rates:coingecko';

export async function GET() {
  try {
    // There is no keyless equivalent for BTC-denominated rates, so resilience
    // here means the last good table rather than a second provider: this feeds
    // a currency selector, and a 429 propagated as a 500 broke the selector on
    // every page it appears on.
    const { data, stale } = await resilientFetch<Record<string, unknown>>(
      `${COINGECKO_BASE}/exchange_rates`,
      {
        service: 'coingecko',
        timeoutMs: 8000,
        retries: 1,
        staleCache,
        staleCacheKey: STALE_KEY,
        next: { revalidate: 300 },
      },
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        ...(stale ? { 'X-Data-Stale': '1' } : {}),
      },
    });
  } catch (error: unknown) {
    // Nothing cached and the upstream is down. An empty rates table is a state
    // the selector already handles (it falls back to USD); an error is not.
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[exchange-rates] upstream unavailable, serving an empty table:', message);
    return NextResponse.json(
      { rates: {}, degraded: true },
      { headers: { 'Cache-Control': 'public, s-maxage=60', 'X-Data-Degraded': '1' } },
    );
  }
}
