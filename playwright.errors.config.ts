/**
 * Playwright config for the console-error scanner.
 * Does NOT start a web server — expects one to already be running.
 *
 * Usage:
 *   bun run dev                                        # start dev server first
 *   bunx playwright test e2e/console-errors.spec.ts --config=playwright.errors.config.ts --project=chromium
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  workers: 4,
  reporter: [['line'], ['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer — we expect `bun run dev` to be running already
});
