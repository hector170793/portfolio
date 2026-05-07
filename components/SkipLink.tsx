/**
 * SkipLink — visually hidden skip-to-content link.
 * [spec 8.1] First focusable element on every page. Links to #main-content.
 * [design §12.1] Becomes visible on :focus-visible. z-index 70 (above SplashLoader).
 * [design §2.7] z-index layering: 70 = skip-link.
 *
 * Server Component (no interactivity needed — pure CSS `:focus-visible` behavior).
 * All UI strings from messages catalog [spec 5.10].
 */

import { getTranslations } from 'next-intl/server';

export default async function SkipLink() {
  // [spec 5.10] UI string from messages catalog.
  const t = await getTranslations();

  return (
    <a
      href="#main-content"
      // sr-only pattern: visually hidden by default. focus:not-sr-only makes it visible.
      // [design §12.1] position fixed top-3 left-3 on focus; z-index 70.
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-3
        focus:left-3
        focus:z-[70]
        focus:rounded
        focus:bg-[var(--accent-base)]
        focus:px-4
        focus:py-2
        focus:text-sm
        focus:font-medium
        focus:text-[var(--accent-fg)]
        focus:outline-none
        focus:ring-2
        focus:ring-[var(--accent-base)]
        focus:ring-offset-2
      "
    >
      {t('skipLink')}
    </a>
  );
}
