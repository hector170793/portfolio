/**
 * e2e/locale-switch.spec.ts — Locale switching and persistence E2E tests.
 * [spec 5.3] Cookie overrides Accept-Language.
 * [spec 5.4] Language toggle persists choice via NEXT_LOCALE cookie.
 * [spec 5.5] Cookie TTL >= 365 days.
 * [design §5] LocaleToggle writes cookie and calls router.replace.
 *
 * Assumes server running at http://localhost:3000 (via webServer in playwright.config.ts).
 */

import { expect, test } from '@playwright/test';

test.describe('Locale switching [spec 5.3–5.5]', () => {
  test('clicking LocaleToggle on /es/ navigates to /en/ [spec 5.5]', async ({ page }) => {
    // Clear any existing locale cookie for a clean state
    await page.context().clearCookies();
    await page.goto('/es/');

    // Find locale toggle button — aria-label contains "locale" or "idioma" (ES label)
    // Design §12.5: <button aria-label={t('toggleLocale')}>
    const localeToggle = page.locator(
      'button[aria-label*="locale" i], button[aria-label*="idioma" i], button[aria-label*="language" i]',
    );
    await expect(localeToggle).toBeVisible();
    await localeToggle.click();

    // URL should change to /en/
    await page.waitForURL('**/en/**');
    expect(page.url()).toContain('/en/');
  });

  test('NEXT_LOCALE cookie is set after locale switch [spec 5.3]', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/es/');

    const localeToggle = page.locator(
      'button[aria-label*="locale" i], button[aria-label*="idioma" i], button[aria-label*="language" i]',
    );
    await localeToggle.click();
    await page.waitForURL('**/en/**');

    // Verify cookie was set
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
    expect(localeCookie).toBeDefined();
    expect(localeCookie?.value).toBe('en');
    // [spec 5.5] TTL >= 365 days — Playwright returns maxAge in seconds
    // Cookie may have expires or maxAge; check either
    if (localeCookie?.expires) {
      const maxAgeSeconds = localeCookie.expires - Date.now() / 1000;
      // Should be approximately 365 days (allow 1 day tolerance for timing)
      expect(maxAgeSeconds).toBeGreaterThan(364 * 24 * 60 * 60);
    }
  });

  test('middleware redirects to /en/ when NEXT_LOCALE=en cookie persists [spec 5.3]', async ({
    page,
  }) => {
    // Set the cookie manually before navigating to /
    // Playwright addCookies uses 'expires' (Unix timestamp), not maxAge.
    // Set to 1 year from now.
    const oneYearFromNow = Math.floor(Date.now() / 1000) + 31536000;
    await page.context().addCookies([
      {
        name: 'NEXT_LOCALE',
        value: 'en',
        domain: 'localhost',
        path: '/',
        expires: oneYearFromNow,
      },
    ]);

    // Navigate to root — middleware should redirect to /en/ because cookie is set [spec 5.3]
    await page.goto('/');
    await page.waitForURL('**/en/**');
    expect(page.url()).toContain('/en/');
  });
});
