// [spec 9.1] Every page MUST export generateMetadata (or static metadata) with:
// title, description, openGraph.*, twitter.*, canonical.
// [spec 5.7] Every page MUST include hreflang alternates for both locales + x-default → en.
// [spec 9.8] Canonical URL MUST be absolute (scheme + host).
// [design §10.5] Factory: buildMetadata({ locale, title, description, path, ogParams })

import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { buildOgUrl, type OgParams } from '@/lib/seo/og';

const SITE_URL = 'https://hector-reyes.work';

export interface BuildMetadataParams {
  locale: Locale;
  title: string;
  description: string;
  /** Path segment after the locale prefix, e.g. '' for home, '/work/santander-onboarding' */
  path: string;
  /** Query params passed to the /api/og edge route [spec 9.2] */
  ogParams?: OgParams;
}

/**
 * Factory that returns a Next.js Metadata object with:
 * - Absolute canonical URL [spec 9.8]
 * - Hreflang alternates for es, en, and x-default (→ en) [spec 5.7]
 * - OG image URL pointing to /api/og edge route via buildOgUrl() [spec 9.2]
 * - Twitter card summary_large_image [spec 9.1]
 */
export function buildMetadata({
  locale,
  title,
  description,
  path,
  ogParams,
}: BuildMetadataParams): Metadata {
  // [spec 9.8] Canonical must be absolute.
  const canonical = `${SITE_URL}/${locale}${path}`;

  const esUrl = `${SITE_URL}/es${path}`;
  const enUrl = `${SITE_URL}/en${path}`;

  // [spec 9.2] OG image URL — delegates to /api/og Edge route via buildOgUrl().
  // Default OG params when none provided: use the page title + description as subtitle.
  const resolvedOgParams: OgParams = ogParams ?? { title, subtitle: description };
  const ogImageUrl = buildOgUrl(resolvedOgParams);

  return {
    title,
    description,
    alternates: {
      canonical,
      // [spec 5.7] hreflang alternates for es, en, and x-default → en.
      languages: {
        es: esUrl,
        en: enUrl,
        'x-default': enUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
