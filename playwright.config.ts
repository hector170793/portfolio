/**
 * playwright.config.ts — Playwright E2E test configuration.
 * [spec 8.11] axe DevTools zero violations gate.
 * [spec 5.2–5.5] i18n locale switching E2E.
 * [spec 6.3–6.5] Theme persistence E2E.
 * [spec 4.1] Contact form happy path E2E.
 * [design §13.4] CI runs chromium only for speed; firefox optional.
 *
 * Assumes the Next.js dev/prod server is running at http://localhost:3000.
 * On CI, webServer builds and starts the app automatically.
 *
 * CI env vars required for contact form E2E:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA (always-pass test key)
 *   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA (always-pass secret)
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Serial: one test at a time to avoid race conditions against the single dev server.
  fullyParallel: false,
  // Fail fast on CI if someone accidentally left `.only` in a test.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    // Build + start for CI; reuse existing server in local dev.
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
