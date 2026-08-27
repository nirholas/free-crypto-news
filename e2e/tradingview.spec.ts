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
 * TradingView API E2E Tests
 * 
 * Tests for TradingView UDF (Universal Data Feed) protocol compliance:
 * - Config endpoint
 * - Symbol resolution
 * - Symbol search
 * - Historical data (bars)
 * - Real-time quotes
 * - Marks (news events)
 * - Widget configuration
 */

import { test, expect } from '@playwright/test';

test.describe('TradingView UDF API', () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  test.describe('Configuration', () => {
    test('GET /api/tradingview?action=config returns valid UDF config', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tradingview?action=config`);
      
      expect(response.ok()).toBeTruthy();
      
      const config = await response.json();
      
      // Required UDF fields
      expect(config.supports_search).toBe(true);
      expect(config.supports_group_request).toBeDefined();
      expect(config.supports_marks).toBeDefined();
      expect(config.supports_timescale_marks).toBeDefined();
      expect(config.supports_time).toBe(true);
      
      // Exchanges
      expect(config.exchanges).toBeInstanceOf(Array);
      expect(config.exchanges.length).toBeGreaterThan(0);
      expect(config.exchanges[0]).toHaveProperty('value');
      expect(config.exchanges[0]).toHaveProperty('name');
      expect(config.exchanges[0]).toHaveProperty('desc');
      
      // Symbol types
      expect(config.symbols_types).toBeInstanceOf(Array);
      expect(config.symbols_types.length).toBeGreaterThan(0);
      
      // Supported resolutions
      expect(config.supported_resolutions).toBeInstanceOf(Array);
      expect(config.supported_resolutions).toContain('D');
      expect(config.supported_resolutions).toContain('1');
      expect(config.supported_resolutions).toContain('60');
      expect(config.supported_resolutions).toContain('W');
    });

    test('GET /api/tradingview?action=time returns server time', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tradingview?action=time`);
      
      expect(response.ok()).toBeTruthy();
      
      const timeText = await response.text();
      const serverTime = parseInt(timeText, 10);
      
      // Should be within 60 seconds of current time
      const currentTime = Math.floor(Date.now() / 1000);
      expect(Math.abs(serverTime - currentTime)).toBeLessThan(60);
    });
  });

  test.describe('Symbol Resolution', () => {
    test('GET /api/tradingview?action=symbols&symbol=BTC/USD resolves symbol', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tradingview?action=symbols&symbol=BTC/USD`);
      
      expect(response.ok()).toBeTruthy();
      
      const symbol = await response.json();
      
      // Required UDF symbol fields
      expect(symbol.name).toBe('BTC/USD');
      expect(symbol.ticker).toBe('BTC/USD');
      expect(symbol.description).toBeDefined();
      expect(symbol.type).toBe('crypto');
      expect(symbol.session).toBe('24x7');
      expect(symbol.timezone).toBe('Etc/UTC');
      expect(symbol.exchange).toBeDefined();
      expect(symbol.minmov).toBe(1);
      expect(symbol.pricescale).toBeGreaterThan(0);
      expect(symbol.has_intraday).toBe(true);
      expect(symbol.has_daily).toBe(true);
      expect(symbol.has_weekly_and_monthly).toBe(true);
      expect(symbol.supported_resolutions).toBeInstanceOf(Array);
      expect(symbol.volume_precision).toBeGreaterThanOrEqual(0);
      expect(symbol.data_status).toBe('streaming');
    });

    test('resolves ETH symbol with different formats', async ({ request }) => {
      const formats = ['ETH/USD', 'ETHUSD', 'ETH-USD'];
      
      for (const format of formats) {
        const response = await request.get(
          `${baseUrl}/api/tradingview?action=symbols&symbol=${encodeURIComponent(format)}`
        );
        
        expect(response.ok()).toBeTruthy();
        
        const symbol = await response.json();
        expect(symbol.name).toContain('ETH');
        expect(symbol.type).toBe('crypto');
      }
    });

    test('resolves multiple crypto symbols', async ({ request }) => {
      const symbols = ['SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD'];
      
      for (const sym of symbols) {
        const response = await request.get(
          `${baseUrl}/api/tradingview?action=symbols&symbol=${encodeURIComponent(sym)}`
        );
        
        expect(response.ok()).toBeTruthy();
        
        const symbol = await response.json();
        expect(symbol.name).toBe(sym);
      }
    });

    test('returns error for missing symbol parameter', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tradingview?action=symbols`);
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.s).toBe('error');
      expect(data.errmsg).toContain('Symbol required');
    });
  });

  test.describe('Symbol Search', () => {
    test('GET /api/tradingview?action=search&query=BTC returns results', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tradingview?action=search&query=BTC`);
      
      expect(response.ok()).toBeTruthy();
      
      const results = await response.json();
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      
      // Check result structure
      const firstResult = results[0];
      expect(firstResult.symbol).toBeDefined();
      expect(firstResult.full_name).toBeDefined();
      expect(firstResult.description).toBeDefined();
      expect(firstResult.exchange).toBeDefined();
      expect(firstResult.ticker).toBeDefined();
      expect(firstResult.type).toBeDefined();
      
      // Should contain BTC
      expect(firstResult.symbol.toUpperCase()).toContain('BTC');
    });

    test('search filters by type', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=search&query=&type=crypto`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const results = await response.json();
      
      for (const result of results) {
        expect(result.type).toBe('crypto');
      }
    });

    test('search filters by exchange', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=search&query=&exchange=AGGREGATED`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const results = await response.json();
      
      for (const result of results) {
        expect(result.exchange).toBe('AGGREGATED');
      }
    });

    test('search respects limit parameter', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=search&query=&limit=5`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const results = await response.json();
      expect(results.length).toBeLessThanOrEqual(5);
    });

    test('search is case-insensitive', async ({ request }) => {
      const lowerResponse = await request.get(`${baseUrl}/api/tradingview?action=search&query=btc`);
      const upperResponse = await request.get(`${baseUrl}/api/tradingview?action=search&query=BTC`);
      
      expect(lowerResponse.ok()).toBeTruthy();
      expect(upperResponse.ok()).toBeTruthy();
      
      const lowerResults = await lowerResponse.json();
      const upperResults = await upperResponse.json();
      
      expect(lowerResults.length).toBe(upperResults.length);
    });
  });

  test.describe('Historical Data', () => {
    test('GET /api/tradingview?action=history returns OHLCV data', async ({ request }) => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60; // 30 days
      
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=history&symbol=BTC/USD&from=${from}&to=${to}&resolution=D`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      
      expect(data.s).toBe('ok');
      expect(data.t).toBeInstanceOf(Array);
      expect(data.o).toBeInstanceOf(Array);
      expect(data.h).toBeInstanceOf(Array);
      expect(data.l).toBeInstanceOf(Array);
      expect(data.c).toBeInstanceOf(Array);
      expect(data.v).toBeInstanceOf(Array);
      
      // All arrays should have same length
      expect(data.o.length).toBe(data.t.length);
      expect(data.h.length).toBe(data.t.length);
      expect(data.l.length).toBe(data.t.length);
      expect(data.c.length).toBe(data.t.length);
      expect(data.v.length).toBe(data.t.length);
      
      // Verify OHLC relationship: low <= open,close <= high
      for (let i = 0; i < data.t.length; i++) {
        expect(data.l[i]).toBeLessThanOrEqual(data.o[i]);
        expect(data.l[i]).toBeLessThanOrEqual(data.c[i]);
        expect(data.h[i]).toBeGreaterThanOrEqual(data.o[i]);
        expect(data.h[i]).toBeGreaterThanOrEqual(data.c[i]);
        expect(data.v[i]).toBeGreaterThanOrEqual(0);
      }
    });

    test('history supports countback parameter', async ({ request }) => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 365 * 24 * 60 * 60; // 1 year
      
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=history&symbol=ETH/USD&from=${from}&to=${to}&resolution=D&countback=100`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.s).toBe('ok');
      expect(data.t.length).toBeLessThanOrEqual(100);
    });

    test('history supports different resolutions', async ({ request }) => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 7 * 24 * 60 * 60; // 1 week
      
      const resolutions = ['1', '5', '15', '60', '240', 'D'];
      
      for (const resolution of resolutions) {
        const response = await request.get(
          `${baseUrl}/api/tradingview?action=history&symbol=BTC/USD&from=${from}&to=${to}&resolution=${resolution}&countback=50`
        );
        
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.s).toBe('ok');
      }
    });

    test('history returns error for missing symbol', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=history&from=0&to=1000000000&resolution=D`
      );
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.s).toBe('error');
    });
  });

  test.describe('Quotes', () => {
    test('GET /api/tradingview?action=quotes returns live quotes', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=quotes&symbols=BTC/USD,ETH/USD`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      
      expect(data.s).toBe('ok');
      expect(data.d).toBeInstanceOf(Array);
      expect(data.d.length).toBe(2);
      
      // Check quote structure
      for (const quote of data.d) {
        expect(quote.s).toBe('ok');
        expect(quote.n).toBeDefined(); // symbol name
        expect(quote.v).toBeDefined(); // values
        
        const values = quote.v;
        expect(values.lp).toBeGreaterThan(0); // last price
        expect(values.ch).toBeDefined(); // change
        expect(values.chp).toBeDefined(); // change percent
        expect(values.open_price).toBeDefined();
        expect(values.high_price).toBeDefined();
        expect(values.low_price).toBeDefined();
        expect(values.volume).toBeDefined();
      }
    });

    test('quotes handles single symbol', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=quotes&symbols=SOL/USD`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.s).toBe('ok');
      expect(data.d.length).toBe(1);
      expect(data.d[0].n).toBe('SOL/USD');
    });

    test('quotes returns error for missing symbols', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tradingview?action=quotes`);
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.s).toBe('error');
    });
  });

  test.describe('Marks', () => {
    test('GET /api/tradingview?action=marks returns chart marks', async ({ request }) => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 7 * 24 * 60 * 60; // 1 week
      
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=marks&symbol=BTC/USD&from=${from}&to=${to}&resolution=D`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const marks = await response.json();
      
      expect(marks).toBeInstanceOf(Array);
      
      // If marks exist, verify structure
      for (const mark of marks) {
        expect(mark.id).toBeDefined();
        expect(mark.time).toBeDefined();
        expect(mark.color).toBeDefined();
        expect(mark.text).toBeDefined();
        expect(mark.label).toBeDefined();
        expect(mark.labelFontColor).toBeDefined();
        expect(mark.minSize).toBeDefined();
        
        // Time should be in range
        expect(mark.time).toBeGreaterThanOrEqual(from);
        expect(mark.time).toBeLessThanOrEqual(to);
      }
    });

    test('GET /api/tradingview?action=timescale_marks returns timeline marks', async ({ request }) => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60; // 30 days
      
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=timescale_marks&symbol=BTC/USD&from=${from}&to=${to}&resolution=D`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const marks = await response.json();
      
      expect(marks).toBeInstanceOf(Array);
      
      for (const mark of marks) {
        expect(mark.id).toBeDefined();
        expect(mark.time).toBeDefined();
        expect(mark.color).toBeDefined();
        expect(mark.label).toBeDefined();
        expect(mark.tooltip).toBeInstanceOf(Array);
      }
    });
  });

  test.describe('Widget Configuration', () => {
    test('GET /api/tradingview?action=widget_config returns widget config', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=widget_config&symbol=BTC/USD&theme=dark`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const config = await response.json();
      
      expect(config.symbol).toBe('BTC/USD');
      expect(config.theme).toBe('dark');
      expect(config.interval).toBeDefined();
      expect(config.timezone).toBeDefined();
      expect(config.datafeed).toBeDefined();
      expect(config.container_id).toBeDefined();
      expect(config.autosize).toBeDefined();
      expect(config.disabled_features).toBeInstanceOf(Array);
      expect(config.enabled_features).toBeInstanceOf(Array);
    });

    test('widget config uses light theme when specified', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=widget_config&theme=light`
      );
      
      expect(response.ok()).toBeTruthy();
      
      const config = await response.json();
      expect(config.theme).toBe('light');
    });
  });

  test.describe('Error Handling', () => {
    test('returns error for unknown action', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tradingview?action=unknown`);
      
      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('Unknown action');
      expect(data.validActions).toBeInstanceOf(Array);
    });

    test('handles malformed parameters gracefully', async ({ request }) => {
      const response = await request.get(
        `${baseUrl}/api/tradingview?action=history&symbol=BTC/USD&from=invalid&to=invalid&resolution=D`
      );
      
      // Should return error response, not crash
      expect([200, 400, 500]).toContain(response.status());
    });
  });
});
