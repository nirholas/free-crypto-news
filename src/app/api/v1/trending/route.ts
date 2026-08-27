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
 * Premium API v1 - Trending Coins Endpoint
 *
 * Returns currently trending cryptocurrencies
 * Requires x402 payment or valid API key
 *
 * @price $0.001 per request
 */

import { type NextRequest, NextResponse } from 'next/server';
import { hybridAuthMiddleware } from '@/lib/x402';
import { ApiError } from '@/lib/api-error';
import { createRequestLogger } from '@/lib/logger';
import { COINGECKO_BASE } from '@/lib/constants';

import { getTrending } from '@/lib/market-data';
import { resilientFetchResponse } from '@/lib/resilient-fetch';
const ENDPOINT = '/api/v1/trending';

export async function GET(request: NextRequest) {
  const logger = createRequestLogger(request);
  const startTime = Date.now();

  // Check authentication
  const authResponse = await hybridAuthMiddleware(request, ENDPOINT);
  if (authResponse) return authResponse;

  try {
    logger.info('Fetching trending coins');

    const response = await resilientFetchResponse(`${COINGECKO_BASE}/search/trending`, {
      service: 'coingecko',
      timeoutMs: 8000,
      retries: 1,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'CryptoDataAggregator/1.0',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Upstream API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform trending coins
    const coins =
      data.coins?.map(
        (
          c: {
            item: {
              id: string;
              coin_id: number;
              symbol: string;
              name: string;
              market_cap_rank: number;
              thumb: string;
              small: string;
              large: string;
              slug: string;
              price_btc: number;
              score: number;
            };
          },
          index: number,
        ) => ({
          rank: index + 1,
          id: c.item.id,
          symbol: c.item.symbol?.toUpperCase(),
          name: c.item.name,
          market_cap_rank: c.item.market_cap_rank,
          price_btc: c.item.price_btc,
          score: c.item.score,
          images: {
            thumb: c.item.thumb,
            small: c.item.small,
            large: c.item.large,
          },
        }),
      ) || [];

    // Transform trending NFTs if available
    const nfts =
      data.nfts
        ?.slice(0, 5)
        .map(
          (n: {
            id: string;
            name: string;
            symbol: string;
            thumb: string;
            floor_price_in_native_currency: number;
            floor_price_24h_percentage_change: number;
          }) => ({
            id: n.id,
            name: n.name,
            symbol: n.symbol,
            thumb: n.thumb,
            floor_price: n.floor_price_in_native_currency,
            floor_price_change_24h: n.floor_price_24h_percentage_change,
          }),
        ) || [];

    logger.request(request.method, request.nextUrl.pathname, 200, Date.now() - startTime);

    return NextResponse.json(
      {
        success: true,
        data: {
          coins,
          nfts,
          categories: data.categories?.slice(0, 5) || [],
        },
        meta: {
          endpoint: ENDPOINT,
          coinCount: coins.length,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Data-Source': 'CoinGecko',
        },
      },
    );
  } catch (error) {
    // CoinGecko's keyless tier throttles hard, and this endpoint used to answer
    // 502 the moment it did. getTrending() carries the CoinCap fallback the
    // data layer already implements, so a throttle costs the NFT and category
    // sections (CoinGecko-only data) rather than the whole response.
    logger.error('Trending upstream failed, falling back to the data layer', error);
    try {
      const fallbackCoins = await getTrending();
      if (fallbackCoins.length) {
        return NextResponse.json(
          {
            success: true,
            data: {
              coins: fallbackCoins.map((c, index) => ({
                rank: index + 1,
                id: c.id,
                symbol: c.symbol?.toUpperCase(),
                name: c.name,
                market_cap_rank: c.market_cap_rank,
                price_btc: c.price_btc,
                score: c.score,
                images: { thumb: c.thumb, small: c.small, large: c.large },
              })),
              nfts: [],
              categories: [],
            },
            meta: {
              endpoint: ENDPOINT,
              coinCount: fallbackCoins.length,
              degraded: true,
              timestamp: new Date().toISOString(),
            },
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
              'X-Data-Source': 'fallback',
              'X-Data-Degraded': '1',
            },
          },
        );
      }
    } catch (fallbackError) {
      logger.error('Trending fallback failed too', fallbackError);
    }
    return ApiError.upstream('CoinGecko', error);
  }
}
