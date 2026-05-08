/**
 * e2e/a11y.spec.ts — axe DevTools accessibility validation.
 * [spec 8.11] axe MUST report zero critical or serious violations on:
 *   - /es/ (home)
 *   - /es/work/santander-onboarding
 *   - /es/contact
 *   - /es/journal
 *
 * Uses @axe-core/playwright. Only 'critical' and 'serious' impacts block the build.
 * 'moderate' and 'minor' violations are logged but do not fail the test (v1 pragmatism).
 *
 * Assumes server running at http://localhost:3000 (via webServer in playwright.config.ts).
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** Axe violation impact values — 'null' means unknown, treated as non-blocking. */
type AxeImpact = 'critical' | 'serious' | 'moderate' | 'minor' | null;

/** Minimal axe violation shape for our filter. */
interface AxeViolation {
  id: string;
  impact?: AxeImpact;
  description: string;
}

/** Filter to only blocking violation severities per [spec 8.11]. */
function getBlockingViolations(violations: AxeViolation[]): AxeViolation[] {
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

test.describe('axe a11y — zero critical/serious violations [spec 8.11]', () => {
  test('no axe violations on /es/ (home)', async ({ page }) => {
    await page.goto('/es/');

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = getBlockingViolations(results.violations);

    if (blocking.length > 0) {
      console.error(
        'Axe blocking violations on /es/:',
        blocking.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
      );
    }

    expect(blocking).toEqual([]);
  });

  test('no axe violations on /es/work/santander-onboarding', async ({ page }) => {
    await page.goto('/es/work/santander-onboarding');

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = getBlockingViolations(results.violations);

    if (blocking.length > 0) {
      console.error(
        'Axe blocking violations on /es/work/santander-onboarding:',
        blocking.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
      );
    }

    expect(blocking).toEqual([]);
  });

  test('no axe violations on /es/contact', async ({ page }) => {
    await page.goto('/es/contact');

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = getBlockingViolations(results.violations);

    if (blocking.length > 0) {
      console.error(
        'Axe blocking violations on /es/contact:',
        blocking.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
      );
    }

    expect(blocking).toEqual([]);
  });

  test('no axe violations on /es/journal', async ({ page }) => {
    await page.goto('/es/journal');

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = getBlockingViolations(results.violations);

    if (blocking.length > 0) {
      console.error(
        'Axe blocking violations on /es/journal:',
        blocking.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
      );
    }

    expect(blocking).toEqual([]);
  });
});
