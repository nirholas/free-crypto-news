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
 * Premium API v1 - Global Market Data Endpoint
 *
 * Returns global cryptocurrency market statistics and trending coins
 * Requires x402 payment or valid API key
 *
 * @price $0.002 per request
 */

import { type NextRequest, NextResponse } from 'next/server';
import { hybridAuthMiddleware } from '@/lib/x402';
import { ApiError } from '@/lib/api-error';
import { createRequestLogger } from '@/lib/logger';
import { COINGECKO_BASE } from '@/lib/constants';

import { getGlobalMarketData } from '@/lib/market-data';
import { resilientFetchResponse } from '@/lib/resilient-fetch';
const ENDPOINT = '/api/v1/market-data';

export async function GET(request: NextRequest) {
  const logger = createRequestLogger(request);
  const startTime = Date.now();

  // Check authentication
  const authResponse = await hybridAuthMiddleware(request, ENDPOINT);
  if (authResponse) return authResponse;

  try {
    logger.info('Fetching global market data');

    // Two independent upstreams, so settle rather than all: one being throttled
    // must not take the other's data down with it.
    const headers = { Accept: 'application/json', 'User-Agent': 'CryptoDataAggregator/1.0' };
    const [globalResult, trendingResult] = await Promise.allSettled([
      resilientFetchResponse(`${COINGECKO_BASE}/global`, {
        service: 'coingecko',
        timeoutMs: 8000,
        retries: 1,
        headers,
        next: { revalidate: 120 },
      }),
      resilientFetchResponse(`${COINGECKO_BASE}/search/trending`, {
        service: 'coingecko',
        timeoutMs: 8000,
        retries: 1,
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    const okBody = async (result: PromiseSettledResult<Response>) =>
      result.status === 'fulfilled' && result.value.ok ? await result.value.json() : null;

    let globalData = await okBody(globalResult);
    const trendingData = await okBody(trendingResult);

    // CoinGecko throttled the global call: the data layer's CoinPaprika chain
    // answers the same question, so the response degrades a field at a time
    // instead of returning null for the whole market picture.
    if (!globalData?.data) {
      const fallbackGlobal = await getGlobalMarketData().catch(() => null);
      if (fallbackGlobal) globalData = { data: fallbackGlobal };
    }

    // Transform global data
    const global = globalData?.data
      ? {
          active_cryptocurrencies: globalData.data.active_cryptocurrencies,
          upcoming_icos: globalData.data.upcoming_icos,
          ongoing_icos: globalData.data.ongoing_icos,
          ended_icos: globalData.data.ended_icos,
          markets: globalData.data.markets,
          total_market_cap: globalData.data.total_market_cap,
          total_volume: globalData.data.total_volume,
          market_cap_percentage: globalData.data.market_cap_percentage,
          market_cap_change_percentage_24h_usd:
            globalData.data.market_cap_change_percentage_24h_usd,
          updated_at: globalData.data.updated_at,
        }
      : null;

    // Transform trending data
    const trending =
      trendingData?.coins?.map(
        (c: {
          item: {
            id: string;
            symbol: string;
            name: string;
            market_cap_rank: number;
            thumb: string;
            score: number;
          };
        }) => ({
          id: c.item.id,
          symbol: c.item.symbol,
          name: c.item.name,
          market_cap_rank: c.item.market_cap_rank,
          thumb: c.item.thumb,
          score: c.item.score,
        }),
      ) || [];

    // Calculate additional metrics
    const btcDominance = global?.market_cap_percentage?.btc || 0;
    const ethDominance = global?.market_cap_percentage?.eth || 0;
    const totalMarketCapUsd = global?.total_market_cap?.usd || 0;
    const totalVolumeUsd = global?.total_volume?.usd || 0;

    logger.request(request.method, request.nextUrl.pathname, 200, Date.now() - startTime);

    return NextResponse.json(
      {
        success: true,
        data: {
          global,
          trending,
          summary: {
            total_market_cap_usd: totalMarketCapUsd,
            total_volume_usd: totalVolumeUsd,
            btc_dominance: btcDominance,
            eth_dominance: ethDominance,
            altcoin_dominance: 100 - btcDominance - ethDominance,
            market_cap_change_24h: global?.market_cap_change_percentage_24h_usd || 0,
            active_cryptocurrencies: global?.active_cryptocurrencies || 0,
            markets: global?.markets || 0,
          },
          timestamp: new Date().toISOString(),
        },
        meta: {
          endpoint: ENDPOINT,
          cached: true,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
          'X-Data-Source': 'CoinGecko',
        },
      },
    );
  } catch (error) {
    logger.error('Failed to fetch market data', error);
    return ApiError.upstream('CoinGecko', error);
  }
}
