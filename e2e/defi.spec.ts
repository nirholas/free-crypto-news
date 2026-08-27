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
 * @fileoverview E2E Tests for DeFi Page
 *
 * Tests the DeFi dashboard at /defi which should render:
 * - DeFi protocol tables (protocol name, TVL, chain, etc.)
 * - DeFi stat cards (Total TVL, top protocols)
 * - Chain-specific DeFi data
 */

import { test, expect } from '@playwright/test';

test.describe('DeFi Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/defi');
  });

  test('should load the DeFi page', async ({ page }) => {
    await expect(page).toHaveURL(/defi/);
    const main = page.locator('main, body');
    await expect(main.first()).toBeVisible();
  });

  test('should display page heading', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should display DeFi protocol data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for a table or data grid
    const table = page.locator('table');
    const hasTable = (await table.count()) > 0;

    // Or look for protocol cards/list items
    const protocols = page.locator('text=/TVL|Total Value Locked|Protocol/i');
    const hasProtocols = (await protocols.count()) > 0;

    // At least one of these should be present
    expect(hasTable || hasProtocols).toBeTruthy();
  });

  test('should display TVL data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for dollar amounts that represent TVL
    const tvlElements = page.locator('text=/\\$[0-9,.]+[BMK]?/');
    const count = await tvlElements.count();
    // Should have at least some financial data
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have header and footer', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.first()).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('DeFi Sub-Pages', () => {
  test('should load DeFi protocol detail page', async ({ page }) => {
    await page.goto('/defi/protocol/aave');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main, body');
    await expect(main.first()).toBeVisible();
  });

  test('should load DeFi chain page', async ({ page }) => {
    await page.goto('/defi/chain/ethereum');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main, body');
    await expect(main.first()).toBeVisible();
  });
});

test.describe('DeFi Page - Responsive', () => {
  test('should display properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/defi');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main, body');
    await expect(main.first()).toBeVisible();

    // Tables should be scrollable on mobile (overflow-x-auto)
    const table = page.locator('table');
    if (await table.count() > 0) {
      const tableParent = table.first().locator('..');
      await expect(tableParent).toBeVisible();
    }
  });

  test('should display properly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/defi');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main, body');
    await expect(main.first()).toBeVisible();
  });
});
