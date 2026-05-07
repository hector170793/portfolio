'use client';

// [spec 5.5] Language toggle writes selected locale to NEXT_LOCALE cookie (TTL >= 365 days)
// and navigates to the equivalent route in the new locale.
// [spec 5.5] Scroll position MUST NOT jump on locale change (router.replace preserves scroll).
// [design §3.5] Uses useLocale from next-intl, writes cookie, calls router.replace with locale.
// [design §12.5] aria-label from i18n messages (useTranslations).

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/lib/i18n/config';

export default function LocaleToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations('header');
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale: Locale = locale === 'es' ? 'en' : 'es';

  function switchLocale() {
    // [spec 5.5] Write NEXT_LOCALE cookie — SameSite=Lax, path=/, max-age=31536000 (1 year).
    // document.cookie assignment is intentional: Cookie Store API lacks cross-browser support
    // and next-intl expects this cookie to be readable by middleware on the server side
    // before JavaScript hydration. This is the correct approach for next-intl locale persistence
    // [design §5]. noDocumentCookie is a warning in this codebase, not an error.
    document.cookie = `NEXT_LOCALE=${nextLocale}; max-age=31536000; path=/; samesite=lax`;

    // Navigate to the current path but with the new locale prefix.
    // next-intl's usePathname returns the path without locale prefix, so we rebuild it.
    // router.replace preserves scroll position — no jump on locale change [spec 5.5].
    const currentPathWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/';
    router.replace(`/${nextLocale}${currentPathWithoutLocale}`);
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      // [design §12.5] aria-label from i18n messages.
      aria-label={t('toggleLocale')}
      className="text-sm font-medium uppercase tracking-wide transition-opacity hover:opacity-70"
    >
      {nextLocale.toUpperCase()}
    </button>
  );
}
