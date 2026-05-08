/**
 * e2e/theme-toggle.spec.ts — Theme persistence E2E tests.
 * [spec 6.3] Toggle switches theme with View Transitions API (or fallback).
 * [spec 6.5] Theme persists across page navigation.
 * [spec 6.8] localStorage key 'theme' is the persistence mechanism.
 * [design §6] ThemeToggle button has aria-pressed and aria-label.
 *
 * Assumes server running at http://localhost:3000 (via webServer in playwright.config.ts).
 */

import { expect, test } from '@playwright/test';

test.describe('Theme toggle [spec 6.3–6.5]', () => {
  test('clicking ThemeToggle changes <html> class to "light" [spec 6.3]', async ({ page }) => {
    await page.goto('/es/');

    // The page starts in dark mode (default theme per spec 6.8 priority 3)
    // or whatever localStorage says — we force dark first to have a known baseline.
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });

    // Find theme toggle: button with aria-label containing "theme" (case-insensitive)
    // Design §12.5: <button aria-pressed={theme==='dark'} aria-label={t('toggleTheme')}>
    const toggle = page.locator('button[aria-label*="theme" i], button[aria-label*="tema" i]');
    await expect(toggle).toBeVisible();
    await toggle.click();

    // After clicking, html should have 'light' class
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('light');
    expect(htmlClass).not.toContain('dark');
  });

  test('theme persists after page reload [spec 6.5]', async ({ page }) => {
    await page.goto('/es/');

    // Force light theme and verify localStorage is set
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });

    const toggle = page.locator('button[aria-label*="theme" i], button[aria-label*="tema" i]');
    await toggle.click();

    // Verify light mode applied
    await expect(page.locator('html')).toHaveClass(/light/);

    // Reload the page — inline script in <head> should restore theme before first paint
    await page.reload();

    // [spec 6.9] No flash — theme restored from localStorage before first paint
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('light');
  });

  test('toggling back returns to dark mode [spec 6.3]', async ({ page }) => {
    await page.goto('/es/');

    // Set to light mode first
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });

    // Reload to apply from localStorage (simulates real visit)
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/light/);

    // Toggle back to dark
    const toggle = page.locator('button[aria-label*="theme" i], button[aria-label*="tema" i]');
    await toggle.click();

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('dark');
    expect(htmlClass).not.toContain('light');
  });
});
