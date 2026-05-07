// [design §5] next-intl getRequestConfig — loads message catalog per locale.
// [spec 5.10] All UI strings live in messages/{es,en}.json.

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // next-intl provides the requested locale; fall back to defaultLocale if absent.
  let locale = await requestLocale;

  // Validate that the incoming locale is one we support.
  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (
      (await import(`../../messages/${locale}.json`)) as { default: Record<string, unknown> }
    ).default,
  };
});
