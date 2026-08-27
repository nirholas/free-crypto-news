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

import { resilientFetchResponse } from '@/lib/resilient-fetch';
export const runtime = 'edge';

interface CoinGlassData {
  symbol: string;
  longLiquidationUsd: number;
  shortLiquidationUsd: number;
  totalLiquidationUsd: number;
}

interface Liquidation {
  id: string;
  exchange: string;
  symbol: string;
  side: 'long' | 'short';
  amount: number;
  price: number;
  timestamp: number;
}

// Fetch from CoinGlass public API
async function fetchFromCoinGlass(): Promise<CoinGlassData[]> {
  try {
    const response = await resilientFetchResponse(
      'https://open-api.coinglass.com/public/v2/liquidation_history?time_type=h24',
      {
        service: 'coinglass',
        timeoutMs: 8000,
        retries: 1,
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    if (data.code !== '0' || !data.data) return [];

    return data.data.map(
      (item: { symbol: string; longLiquidationUsd: number; shortLiquidationUsd: number }) => ({
        symbol: item.symbol,
        longLiquidationUsd: item.longLiquidationUsd || 0,
        shortLiquidationUsd: item.shortLiquidationUsd || 0,
        totalLiquidationUsd: (item.longLiquidationUsd || 0) + (item.shortLiquidationUsd || 0),
      }),
    );
  } catch (error) {
    console.error('CoinGlass fetch error:', error);
    return [];
  }
}

// Fetch from Binance Futures forced orders
async function fetchFromBinance(): Promise<Liquidation[]> {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'];
  const liquidations: Liquidation[] = [];

  try {
    for (const symbol of symbols) {
      const response = await resilientFetchResponse(
        `https://fapi.binance.com/fapi/v1/allForceOrders?symbol=${symbol}&limit=50`,
        { service: 'binance', timeoutMs: 8000, retries: 1, next: { revalidate: 30 } },
      );

      if (!response.ok) continue;

      const orders = await response.json();
      if (!Array.isArray(orders)) continue;

      orders.forEach(
        (order: {
          orderId: number;
          symbol: string;
          side: string;
          origQty: string;
          price: string;
          time: number;
        }) => {
          const qty = parseFloat(order.origQty);
          const price = parseFloat(order.price);
          const usdValue = qty * price;

          if (usdValue > 1000) {
            liquidations.push({
              id: `binance-${order.orderId}`,
              exchange: 'Binance',
              symbol: order.symbol.replace('USDT', ''),
              side: order.side === 'SELL' ? 'long' : 'short',
              amount: usdValue,
              price: price,
              timestamp: order.time,
            });
          }
        },
      );

      // Rate limit delay
      await new Promise((r) => setTimeout(r, 50));
    }
  } catch (error) {
    console.error('Binance fetch error:', error);
  }

  return liquidations.sort((a, b) => b.timestamp - a.timestamp);
}

// Generate individual events from aggregated data
function generateEventsFromAggregated(data: CoinGlassData[]): Liquidation[] {
  const events: Liquidation[] = [];
  const exchanges = ['Binance', 'Bybit', 'OKX', 'Bitget', 'dYdX'];
  const now = Date.now();

  data.slice(0, 15).forEach((coin, coinIndex) => {
    if (coin.totalLiquidationUsd < 10000) return;

    const eventCount = Math.min(3, Math.max(1, Math.ceil(coin.totalLiquidationUsd / 20000000)));
    const longRatio =
      coin.totalLiquidationUsd > 0 ? coin.longLiquidationUsd / coin.totalLiquidationUsd : 0.5;

    for (let i = 0; i < eventCount; i++) {
      const isLong = i / eventCount < longRatio;
      const baseAmount = isLong
        ? coin.longLiquidationUsd / eventCount
        : coin.shortLiquidationUsd / eventCount;

      events.push({
        id: `agg-${coin.symbol}-${i}-${now}`,
        exchange: exchanges[coinIndex % exchanges.length],
        symbol: coin.symbol,
        side: isLong ? 'long' : 'short',
        amount: Math.round(baseAmount),
        price: 0,
        timestamp: now - (coinIndex * 60000 + i * 120000),
      });
    }
  });

  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export async function GET() {
  try {
    // Try multiple sources
    const [coinglassData, binanceEvents] = await Promise.all([
      fetchFromCoinGlass(),
      fetchFromBinance(),
    ]);

    // Calculate totals
    const totals = coinglassData.reduce(
      (acc, coin) => {
        acc.totalLongs += coin.longLiquidationUsd;
        acc.totalShorts += coin.shortLiquidationUsd;
        acc.totalUsd += coin.totalLiquidationUsd;
        return acc;
      },
      { totalLongs: 0, totalShorts: 0, totalUsd: 0 },
    );

    // Generate events from aggregated data if Binance didn't return much
    let recentEvents = binanceEvents;
    if (recentEvents.length < 10 && coinglassData.length > 0) {
      const aggregatedEvents = generateEventsFromAggregated(coinglassData);
      // Merge, preferring Binance real data
      const existingIds = new Set(recentEvents.map((e) => e.id));
      aggregatedEvents.forEach((e) => {
        if (!existingIds.has(e.id)) {
          recentEvents.push(e);
        }
      });
      recentEvents = recentEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
    }

    return NextResponse.json({
      bySymbol: coinglassData,
      recentEvents,
      totals,
      source:
        coinglassData.length > 0 ? 'CoinGlass' : binanceEvents.length > 0 ? 'Binance' : 'none',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Liquidations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch liquidation data' }, { status: 500 });
  }
}
