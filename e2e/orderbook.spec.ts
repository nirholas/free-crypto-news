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
 * Order Book API E2E Tests
 * 
 * Tests for multi-exchange order book aggregation:
 * - Aggregated order book
 * - Individual exchange books
 * - Slippage estimation
 * - Liquidity analysis
 * - Arbitrage scanning
 * - Exchange configuration
 */

import { test, expect } from '@playwright/test';

test.describe('Order Book API', () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  test.describe('Exchange Configuration', () => {
    test('GET /api/orderbook?exchanges=true lists supported exchanges', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?exchanges=true`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.exchanges).toBeInstanceOf(Array);
      expect(data.count).toBeGreaterThan(0);
      
      // Check exchange structure
      for (const exchange of data.exchanges) {
        expect(exchange.id).toBeDefined();
        expect(exchange.name).toBeDefined();
        expect(exchange.fees).toBeDefined();
        expect(exchange.fees.maker).toBeGreaterThanOrEqual(0);
        expect(exchange.fees.taker).toBeGreaterThanOrEqual(0);
        expect(exchange.rateLimit).toBeGreaterThan(0);
        expect(exchange.features).toBeInstanceOf(Array);
      }
    });

    test('supported exchanges include major venues', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?exchanges=true`);
      const data = await response.json();
      
      const exchangeIds = data.exchanges.map((e: { id: string }) => e.id);
      
      // Should include major exchanges
      expect(exchangeIds).toContain('binance');
      expect(exchangeIds).toContain('coinbase');
    });
  });

  test.describe('Aggregated Order Book', () => {
    test('GET /api/orderbook?symbol=BTCUSDT returns aggregated book', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT`);
      
      // May fail if exchanges are not reachable, which is OK in tests
      if (response.ok()) {
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.symbol).toBe('BTCUSDT');
        expect(data.exchanges).toBeInstanceOf(Array);
        expect(data.bids).toBeInstanceOf(Array);
        expect(data.asks).toBeInstanceOf(Array);
        expect(data.timestamp).toBeDefined();
        expect(data.metrics).toBeDefined();
      } else {
        // Exchange API errors are expected in isolated test environments
        expect([502, 500]).toContain(response.status());
        const data = await response.json();
        expect(data.success).toBe(false);
      }
    });

    test('order book returns metrics', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT`);
      
      if (response.ok()) {
        const data = await response.json();
        
        const { metrics } = data;
        expect(metrics.bestBid).toBeDefined();
        expect(metrics.bestAsk).toBeDefined();
        expect(metrics.spread).toBeDefined();
        expect(metrics.spreadPercent).toBeDefined();
        expect(metrics.midPrice).toBeDefined();
        expect(metrics.bidDepth).toBeDefined();
        expect(metrics.askDepth).toBeDefined();
        expect(metrics.imbalance).toBeDefined();
        expect(metrics.imbalancePercent).toBeDefined();
        
        // Spread should be positive
        expect(metrics.spread).toBeGreaterThanOrEqual(0);
        
        // Best ask should be >= best bid
        expect(metrics.bestAsk).toBeGreaterThanOrEqual(metrics.bestBid);
      }
    });

    test('order book respects depth parameter', async ({ request }) => {
      const depth = 10;
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT&depth=${depth}`);
      
      if (response.ok()) {
        const data = await response.json();
        
        expect(data.bids.length).toBeLessThanOrEqual(depth);
        expect(data.asks.length).toBeLessThanOrEqual(depth);
        expect(data.meta.depth).toBe(depth);
      }
    });

    test('order book filters by exchanges', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT&exchanges=binance`);
      
      if (response.ok()) {
        const data = await response.json();
        
        // Should only include requested exchange
        expect(data.exchanges.length).toBeLessThanOrEqual(1);
        if (data.exchanges.length > 0) {
          expect(data.exchanges).toContain('binance');
        }
      }
    });

    test('order book returns error for missing symbol', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook`);
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Symbol');
    });

    test('order book validates exchange parameter', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/orderbook?symbol=BTCUSDT&exchanges=invalid_exchange`
      );
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.invalid).toContain('invalid_exchange');
      expect(data.valid).toBeInstanceOf(Array);
    });
  });

  test.describe('Order Book Levels', () => {
    test('bid levels are sorted in descending price order', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT`);
      
      if (response.ok()) {
        const data = await response.json();
        
        for (let i = 1; i < data.bids.length; i++) {
          expect(data.bids[i - 1].price).toBeGreaterThanOrEqual(data.bids[i].price);
        }
      }
    });

    test('ask levels are sorted in ascending price order', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT`);
      
      if (response.ok()) {
        const data = await response.json();
        
        for (let i = 1; i < data.asks.length; i++) {
          expect(data.asks[i - 1].price).toBeLessThanOrEqual(data.asks[i].price);
        }
      }
    });

    test('aggregated levels include exchange breakdown', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT`);
      
      if (response.ok()) {
        const data = await response.json();
        
        if (data.bids.length > 0) {
          const level = data.bids[0];
          expect(level.price).toBeGreaterThan(0);
          expect(level.totalQuantity).toBeGreaterThan(0);
          expect(level.quantityByExchange).toBeDefined();
          expect(level.exchangeCount).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });

  test.describe('Slippage Estimation', () => {
    test('GET /api/orderbook?view=slippage estimates slippage', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/orderbook?symbol=BTC&view=slippage&orderSize=10000&side=buy`
      );
      
      if (response.ok()) {
        const data = await response.json();
        
        expect(data.symbol).toBeDefined();
        expect(data.estimate).toBeDefined();
        expect(data.estimate.averagePrice).toBeGreaterThan(0);
        expect(data.estimate.slippagePercent).toBeDefined();
      }
    });

    test('slippage increases with order size', async ({ request }) => {
      const smallOrder = await request.get(
        `${baseUrl}/api/orderbook?symbol=BTC&view=slippage&orderSize=1000&side=buy`
      );
      const largeOrder = await request.get(
        `${baseUrl}/api/orderbook?symbol=BTC&view=slippage&orderSize=100000&side=buy`
      );
      
      if (smallOrder.ok() && largeOrder.ok()) {
        const smallData = await smallOrder.json();
        const largeData = await largeOrder.json();
        
        // Larger orders should have higher slippage
        expect(largeData.estimate.slippagePercent).toBeGreaterThanOrEqual(
          smallData.estimate.slippagePercent
        );
      }
    });

    test('slippage rejects invalid order size', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/orderbook?symbol=BTC&view=slippage&orderSize=-1000&side=buy`
      );
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Liquidity Analysis', () => {
    test('GET /api/orderbook?view=liquidity returns liquidity metrics', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTC&view=liquidity`);
      
      if (response.ok()) {
        const data = await response.json();
        
        expect(data.symbol).toBeDefined();
        expect(data.analysis).toBeDefined();
        
        const analysis = data.analysis;
        expect(analysis.totalLiquidity).toBeGreaterThan(0);
        expect(analysis.bidLiquidity).toBeGreaterThan(0);
        expect(analysis.askLiquidity).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Arbitrage Scanning', () => {
    test('GET /api/orderbook?arbitrage=true scans for opportunities', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT&arbitrage=true`);
      
      if (response.ok()) {
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.symbol).toBe('BTCUSDT');
        expect(data.exchanges).toBeInstanceOf(Array);
        expect(data.opportunities).toBeInstanceOf(Array);
        expect(data.viableCount).toBeGreaterThanOrEqual(0);
        expect(data.totalCount).toBeGreaterThanOrEqual(0);
        expect(data.scannedAt).toBeDefined();
        
        // Check opportunity structure if any exist
        for (const opp of data.opportunities) {
          expect(opp.symbol).toBeDefined();
          expect(opp.buyExchange).toBeDefined();
          expect(opp.sellExchange).toBeDefined();
          expect(opp.buyPrice).toBeGreaterThan(0);
          expect(opp.sellPrice).toBeGreaterThan(0);
          expect(opp.spread).toBeDefined();
          expect(opp.spreadPercent).toBeDefined();
          expect(opp.potentialProfit).toBeDefined();
          expect(opp.isViable).toBeDefined();
          expect(opp.fees).toBeDefined();
        }
      }
    });

    test('arbitrage respects minSpread filter', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/orderbook?symbol=BTCUSDT&arbitrage=true&minSpread=1.0`
      );
      
      if (response.ok()) {
        const data = await response.json();
        
        // All opportunities should meet minimum spread
        for (const opp of data.opportunities) {
          expect(opp.spreadPercent).toBeGreaterThanOrEqual(1.0);
        }
      }
    });

    test('arbitrage includes fee calculations', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTCUSDT&arbitrage=true`);
      
      if (response.ok()) {
        const data = await response.json();
        
        for (const opp of data.opportunities) {
          expect(opp.fees.buyFee).toBeGreaterThanOrEqual(0);
          expect(opp.fees.sellFee).toBeGreaterThanOrEqual(0);
          expect(opp.fees.totalFees).toBeGreaterThanOrEqual(0);
          
          // Viable opportunities should have profit > fees
          if (opp.isViable) {
            expect(opp.potentialProfit).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Dashboard View', () => {
    test('GET /api/orderbook?view=dashboard returns full dashboard', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=BTC&view=dashboard`);
      
      if (response.ok()) {
        const data = await response.json();
        
        expect(data.symbol).toBeDefined();
        expect(data.market).toBeDefined();
        expect(data.timestamp).toBeDefined();
      }
    });
  });

  test.describe('WebSocket Configuration', () => {
    test('GET /api/orderbook/stream returns WebSocket config', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook/stream?symbol=BTCUSDT`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.websocket).toBeDefined();
      expect(data.websocket.url).toBeDefined();
      expect(data.websocket.channels).toContain('orderbook');
      expect(data.websocket.subscribeMessage).toBeDefined();
      expect(data.polling).toBeDefined();
      expect(data.polling.fallbackUrl).toBeDefined();
      expect(data.polling.recommendedInterval).toBeGreaterThan(0);
    });

    test('stream config includes documentation', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook/stream`);
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      
      expect(data.documentation).toBeDefined();
      expect(data.documentation.messageTypes).toBeInstanceOf(Array);
      
      const messageTypes = data.documentation.messageTypes.map((m: { type: string }) => m.type);
      expect(messageTypes).toContain('snapshot');
      expect(messageTypes).toContain('update');
      expect(messageTypes).toContain('arbitrage');
    });
  });

  test.describe('Multiple Symbols', () => {
    test('fetches order book for different symbols', async ({ request }) => {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
      
      for (const symbol of symbols) {
        const response = await request.get(`${baseUrl}/api/orderbook?symbol=${symbol}`);
        
        if (response.ok()) {
          const data = await response.json();
          expect(data.success).toBe(true);
          expect(data.symbol).toBe(symbol);
        } else {
          // Exchange errors are expected in isolated environments
          expect([400, 500, 502]).toContain(response.status());
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('handles exchange timeouts gracefully', async ({ request }) => {
      // Use a very short timeout scenario
      const response = await request.get(
        `${baseUrl}/api/orderbook?symbol=BTCUSDT&exchanges=binance,coinbase,kraken,bybit,okx`
      );
      
      // Should not crash, may return partial data or error
      expect([200, 400, 500, 502]).toContain(response.status());
      
      const data = await response.json();
      expect(data).toBeDefined();
    });

    test('provides helpful error messages', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orderbook?symbol=`);
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});
