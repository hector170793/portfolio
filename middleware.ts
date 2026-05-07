// [spec 5.2] Intercept requests to unprefixed root / and redirect to /es/ or /en/.
// [spec 5.3] Cookie NEXT_LOCALE overrides Accept-Language detection.
// [spec 5.4] Fallback locale is en (not es).
// [spec 5.8] Vary: Accept-Language, Cookie on every locale-routed response.
// [design §5] Uses createMiddleware from next-intl; matcher excludes /api, /_next, static files.

import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const res = intlMiddleware(req);

  // [spec 5.8] Add Vary header so Vercel CDN does not serve cross-locale cached responses.
  res.headers.set('Vary', 'Accept-Language, Cookie');

  return res;
}

export const config = {
  // [design §5] Matcher: root + locale-prefixed routes, excluding /api, /_next, and static files.
  matcher: ['/', '/(es|en)/:path*', '/((?!api|_next|_static|.*\\..*).*)'],
};
