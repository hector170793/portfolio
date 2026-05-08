/**
 * __tests__/smoke/middleware.test.ts — i18n routing config smoke test.
 * [spec 5.1] Exactly 'es' and 'en' locales.
 * [spec 5.4] defaultLocale = 'en' (fallback when no match).
 * [spec 5.5] NEXT_LOCALE cookie with >= 365 day TTL.
 * [design §5] defineRouting config.
 *
 * Tests the routing config object, NOT the middleware function itself.
 * Middleware integration (HTTP redirects) is covered by e2e/locale-switch.spec.ts.
 */

import { describe, expect, it } from 'vitest';
import { routing } from '@/lib/i18n/routing';

describe('i18n routing config [spec 5.1–5.5]', () => {
  it('supports exactly es and en locales [spec 5.1]', () => {
    expect(routing.locales).toEqual(['es', 'en']);
  });

  it('defaults to en (per spec 5.4 fallback — not es) [spec 5.4]', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('uses NEXT_LOCALE cookie with year-long max-age [spec 5.5]', () => {
    // [spec 5.5] TTL must be >= 365 days = 31536000 seconds
    expect(routing.localeCookie).toMatchObject({
      name: 'NEXT_LOCALE',
      maxAge: 31536000,
    });
  });
});
