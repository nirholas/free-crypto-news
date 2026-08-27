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
 * @fileoverview Automated console-error scanner for every page.
 *
 * Instead of opening the browser DevTools on each page manually, run:
 *
 *   bunx playwright test e2e/console-errors.spec.ts --project=chromium
 *
 * For a quick scan of a single page:
 *   bunx playwright test e2e/console-errors.spec.ts --project=chromium -g "/en/markets"
 *
 * What it checks on every page:
 *   - Console errors & warnings (JS exceptions, React errors, etc.)
 *   - Uncaught page-level exceptions (window.onerror)
 *   - Failed network requests (HTTP 4xx/5xx, network failures)
 *   - Page crash events
 *
 * The test deliberately does NOT fail on warnings — only errors.
 * Failed resource loads for external services (analytics, ads) are also excluded
 * from the error count to reduce noise.
 */

import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

// ─── Configuration ───────────────────────────────────────────────────────────

/** How long to wait for the page to settle after navigation (ms) */
const SETTLE_TIME = 3_000;

/** Max time to wait for page load (ms) */
const NAV_TIMEOUT = 30_000;

/**
 * Domains whose failed network requests we ignore (analytics, ads, 3rd-party
 * widgets that are expected to fail in dev/test environments).
 */
const IGNORED_DOMAINS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'plausible.io',
  'vercel-insights.com',
  'vitals.vercel-insights.com',
  'cloudflareinsights.com',
  'sentry.io',
  'hotjar.com',
  'intercom.io',
  'crisp.chat',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unsplash.com',
];

/**
 * Console message text patterns to ignore. These are common harmless messages
 * from Next.js dev mode, browser extensions, or 3rd-party scripts.
 */
const IGNORED_CONSOLE_PATTERNS = [
  /download the react devtools/i,
  /third-party cookie/i,
  /deprecated.*api/i,
  /webpack/i,
  /hot module replacement/i,
  /fast refresh/i,
  /hydration/i, // Next.js hydration warnings in dev mode
  /did not expect server html/i,
  /extra attributes from the server/i,
  /punycode/i,
  /prop.*did not match/i,
  /cannot update a component/i, // React strict-mode double-render warning
  /finddomnode is deprecated/i,
  /each child in a list should have a unique/i, // key warning — useful but not a hard error
  /act\(\.\.\.\)/i, // React testing warnings leaking
  /next-intl/i, // next-intl locale messages loading
  /NEXT_REDIRECT/i, // Next.js redirect signals
  /text content does not match/i, // SSR/client date mismatch
];

// ─── All static routes (no dynamic params) ───────────────────────────────────

const STATIC_PAGES: string[] = [
  '/en',
  '/en/about',
  '/en/admin',
  '/en/ai',
  '/en/ai/brief',
  '/en/ai/counter',
  '/en/ai/debate',
  '/en/ai/oracle',
  '/en/ai-agent',
  '/en/airdrops',
  '/en/analytics',
  '/en/analytics/headlines',
  '/en/arbitrage',
  '/en/article',
  '/en/authors',
  '/en/backtest',
  '/en/billing',
  '/en/blog',
  '/en/bookmarks',
  '/en/buzz',
  '/en/calculator',
  '/en/category',
  '/en/charts',
  '/en/citations',
  '/en/claims',
  '/en/clickbait',
  '/en/coin',
  '/en/compare',
  '/en/contact',
  '/en/correlation',
  '/en/coverage-gap',
  '/en/defi',
  '/en/developers',
  '/en/digest',
  '/en/dominance',
  '/en/editorial',
  '/en/entities',
  '/en/events',
  '/en/examples',
  '/en/examples/cards',
  '/en/exchanges',
  '/en/factcheck',
  '/en/fear-greed',
  '/en/funding',
  '/en/gas',
  '/en/heatmap',
  '/en/influencers',
  '/en/install',
  '/en/learn',
  '/en/learn/glossary',
  '/en/liquidations',
  '/en/markets',
  '/en/markets/categories',
  '/en/markets/exchanges',
  '/en/markets/gainers',
  '/en/markets/losers',
  '/en/markets/new',
  '/en/markets/trending',
  '/en/movers',
  '/en/narratives',
  '/en/offline',
  '/en/onchain',
  '/en/options',
  '/en/oracle',
  '/en/orderbook',
  '/en/origins',
  '/en/portfolio',
  '/en/predictions',
  '/en/press',
  '/en/pricing',
  '/en/pricing/premium',
  '/en/pricing/upgrade',
  '/en/privacy',
  '/en/protocol-health',
  '/en/read',
  '/en/regulatory',
  '/en/saved',
  '/en/screener',
  '/en/search',
  '/en/sentiment',
  '/en/settings',
  '/en/share',
  '/en/signals',
  '/en/source',
  '/en/sources',
  '/en/status',
  '/en/tags',
  '/en/terms',
  '/en/topic',
  '/en/topics',
  '/en/trending',
  '/en/unlocks',
  '/en/videos',
  '/en/watchlist',
  '/en/whales',
  '/en/bitcoin',
  '/en/ethereum',
  '/en/solana',
  '/en/stablecoins',
  '/en/l2',
  '/en/nft',
  '/en/derivatives',
  '/en/macro',
  '/en/regulation',
  '/en/research',
  '/en/alerts',
  // Non-locale pages
  '/ask',
  '/blog',
  '/docs/api',
];

/** Dynamic routes with sample params for smoke testing */
const DYNAMIC_PAGES: string[] = [
  '/en/coin/bitcoin',
  '/en/coin/ethereum',
  '/en/topic/defi',
  '/en/source/coindesk',
  '/en/tags/bitcoin',
  '/en/category/markets',
  '/en/defi/protocol/aave',
  '/en/defi/chain/ethereum',
  '/en/markets/categories/smart-contract-platform',
  '/en/markets/exchanges/binance',
];

const ALL_PAGES = [...STATIC_PAGES, ...DYNAMIC_PAGES];

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface PageError {
  type: 'console-error' | 'page-error' | 'request-failed' | 'crash';
  message: string;
  url?: string;
}

function isIgnoredDomain(url: string): boolean {
  return IGNORED_DOMAINS.some((d) => url.includes(d));
}

function isIgnoredConsoleMessage(text: string): boolean {
  return IGNORED_CONSOLE_PATTERNS.some((p) => p.test(text));
}

async function collectPageErrors(page: Page, path: string): Promise<PageError[]> {
  const errors: PageError[] = [];

  // Listen for console errors
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isIgnoredConsoleMessage(text)) return;
    errors.push({ type: 'console-error', message: text });
  });

  // Listen for uncaught page exceptions
  page.on('pageerror', (err) => {
    const text = err.message || String(err);
    if (isIgnoredConsoleMessage(text)) return;
    errors.push({ type: 'page-error', message: text });
  });

  // Listen for failed network requests
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (isIgnoredDomain(url)) return;
    const failure = req.failure();
    errors.push({
      type: 'request-failed',
      message: `${req.method()} ${url} — ${failure?.errorText ?? 'unknown'}`,
      url,
    });
  });

  // Listen for responses with error status codes
  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && !isIgnoredDomain(url)) {
      // Ignore 404s for source-maps and __nextjs_ internal routes
      if (url.includes('.map') || url.includes('__nextjs')) return;
      // Ignore 401/403 for premium/auth endpoints (expected in test env)
      if ((status === 401 || status === 403) && url.includes('/api/premium')) return;
      errors.push({
        type: 'request-failed',
        message: `HTTP ${status}: ${res.request().method()} ${url}`,
        url,
      });
    }
  });

  // Listen for page crashes
  page.on('crash', () => {
    errors.push({ type: 'crash', message: `Page crashed on ${path}` });
  });

  // Navigate
  try {
    await page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT,
    });
  } catch (navErr) {
    errors.push({
      type: 'page-error',
      message: `Navigation failed: ${navErr instanceof Error ? navErr.message : String(navErr)}`,
    });
    return errors;
  }

  // Let async scripts, lazy-loaded components, and timers settle
  await page.waitForTimeout(SETTLE_TIME);

  return errors;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Console Error Scanner', () => {
  // Run in serial so we get a clear per-page report
  test.describe.configure({ mode: 'parallel' });

  for (const path of ALL_PAGES) {
    test(`no console errors on ${path}`, async ({ page }) => {
      const errors = await collectPageErrors(page, path);

      // Build a readable report
      if (errors.length > 0) {
        const report = errors
          .map((e, i) => `  ${i + 1}. [${e.type}] ${e.message}`)
          .join('\n');

        // Fail with a clear message showing ALL errors on this page
        expect(
          errors.length,
          `Found ${errors.length} error(s) on ${path}:\n${report}`
        ).toBe(0);
      }
    });
  }
});

// ─── Summary test: scan ALL pages and print a single report ──────────────────

test('full site error report (summary)', async ({ page }) => {
  const allResults: { path: string; errors: PageError[] }[] = [];
  let totalErrors = 0;

  for (const path of ALL_PAGES) {
    // Remove all listeners from previous iteration
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.removeAllListeners('requestfailed');
    page.removeAllListeners('response');
    page.removeAllListeners('crash');

    const errors = await collectPageErrors(page, path);
    if (errors.length > 0) {
      allResults.push({ path, errors });
      totalErrors += errors.length;
    }
  }

  // Print the full report regardless of pass/fail
  if (allResults.length > 0) {
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  CONSOLE ERROR REPORT');
    console.log('══════════════════════════════════════════════════════\n');

    for (const { path, errors } of allResults) {
      console.log(`❌ ${path} (${errors.length} error${errors.length > 1 ? 's' : ''}):`);
      for (const e of errors) {
        console.log(`   [${e.type}] ${e.message}`);
      }
      console.log('');
    }

    console.log(`Total: ${totalErrors} error(s) across ${allResults.length} page(s)`);
    console.log(`Clean: ${ALL_PAGES.length - allResults.length} page(s) with no errors`);
    console.log('══════════════════════════════════════════════════════\n');
  } else {
    console.log('\n✅ All pages clean — no console errors found!\n');
  }

  // Soft-fail: report exists, but don't block CI
  // Change to expect(totalErrors).toBe(0) to make it a hard gate
  test.info().annotations.push({
    type: 'errors',
    description: `${totalErrors} error(s) across ${allResults.length}/${ALL_PAGES.length} pages`,
  });
});
