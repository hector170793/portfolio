// [spec 5.1–5.4] next-intl routing configuration.
// [design §5] defineRouting with localePrefix 'always', defaultLocale 'en',
// localeDetection: true to honor Accept-Language header.
// [spec 5.3] Cookie name NEXT_LOCALE, max-age 31536000 (1 year).

import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // [spec 5.1] All routes MUST be prefixed: /es/... and /en/...
  localePrefix: 'always',
  // [spec 5.2–5.3] Honor Accept-Language; cookie overrides.
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
    // [spec 5.5] TTL >= 365 days (31536000 seconds = 1 year).
    maxAge: 60 * 60 * 24 * 365,
  },
});
