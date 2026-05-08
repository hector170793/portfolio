/**
 * e2e/contact-form.spec.ts — Contact form E2E tests.
 * [spec 4.1] Happy path: all required fields → success message.
 * [spec 4.2] Client-side required field validation: aria-invalid on empty submit.
 * [spec 4.7] aria-invalid + aria-describedby per invalid field.
 *
 * CI REQUIREMENT: Set these env vars to Cloudflare always-pass test keys:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
 *   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
 * Without them, the happy path test will fail on Turnstile verification.
 *
 * Assumes server running at http://localhost:3000 (via webServer in playwright.config.ts).
 */

import { expect, test } from '@playwright/test';

test.describe('Contact form [spec 4.1–4.2, 4.7]', () => {
  test('submitting empty form shows aria-invalid errors on required fields [spec 4.2, 4.7]', async ({
    page,
  }) => {
    await page.goto('/es/contact');

    // Find and click the submit button without filling any fields
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Required fields must show aria-invalid="true" [spec 4.7]
    // name field
    const nameInput = page.locator('input[name="name"], input[id="name"]');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');

    // email field
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // message field (textarea)
    const messageTextarea = page.locator('textarea[name="message"], textarea[id="message"]');
    await expect(messageTextarea).toHaveAttribute('aria-invalid', 'true');
  });

  test('happy path: valid form submission shows success message [spec 4.1]', async ({ page }) => {
    await page.goto('/es/contact');

    // Fill required fields
    await page.fill('input[name="name"], input[id="name"]', 'Test User');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');

    // project_type select — select 'other' option
    const projectTypeSelect = page.locator(
      'select[name="project_type"], [id="project_type"], button[role="combobox"]',
    );
    if ((await projectTypeSelect.count()) > 0) {
      // Radix Select or native select
      const tagName = await projectTypeSelect.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await projectTypeSelect.selectOption('other');
      } else {
        // Radix combobox: click to open, then select option
        await projectTypeSelect.click();
        await page
          .locator('[role="option"]')
          .filter({ hasText: /other|otro/i })
          .click();
      }
    }

    // message — must be >= 10 chars [spec 4.1 + design §7.2 min(10)]
    await page.fill(
      'textarea[name="message"], textarea[id="message"]',
      'Test message that is at least ten characters long.',
    );

    // Submit — Turnstile uses always-pass keys on CI so siteverify succeeds
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // [spec 4.10] On success: confirmation message visible, form resets
    // Wait up to 10s for the server action to complete
    const successMessage = page
      .locator('[data-testid="contact-success"], [role="status"], [aria-live]')
      .filter({ hasText: /success|gracias|sent|enviado/i });
    await expect(successMessage.first()).toBeVisible({ timeout: 10_000 });
  });
});
