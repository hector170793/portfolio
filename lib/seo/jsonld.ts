/**
 * JSON-LD generators — lib/seo/jsonld.ts
 * [spec 9.4] JSON-LD MUST be injected per route:
 *   - Home: Person schema + WebSite schema [spec 9.4]
 *   - Case studies: Article + BreadcrumbList (Slice 8)
 *   - Journal posts: Article + BreadcrumbList (Slice 12)
 * [design §10.1] Generator functions exported for server components.
 *
 * This file implements the Home-page generators (Person + WebSite).
 * Article and Breadcrumb generators are stubs for Slices 8 and 12.
 *
 * [spec 9.3] Scenario: home page MUST contain Person schema with
 *   @type: "Person", jobTitle: "Senior Full-Stack Engineer".
 */

const SITE_URL = 'https://hector-reyes.work';

/** [spec 9.4] Person schema for the home page. */
export function personJsonLd(locale: 'es' | 'en'): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Hector Reyes Pérez',
    url: `${SITE_URL}/${locale}`,
    jobTitle: 'Senior Full-Stack Engineer & Frontend Lead',
    // sameAs: replace with real profile URLs in Slice 13 (real copy).
    sameAs: ['https://github.com/hector-reyes', 'https://www.linkedin.com/in/hector-reyes-perez'],
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'Angular',
      'Node.js',
      'NestJS',
      'Fintech',
      'Frontend Architecture',
    ],
  };
}

/** [spec 9.4] WebSite schema for the home page. */
export function websiteJsonLd(locale: 'es' | 'en'): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hector Reyes Pérez',
    url: `${SITE_URL}/${locale}`,
    description:
      locale === 'es'
        ? 'Senior Full-Stack Engineer & Frontend Lead. Entrega de producto fintech para LATAM y mercados globales.'
        : 'Senior Full-Stack Engineer & Frontend Lead. Fintech-grade product delivery for LATAM and global markets.',
    inLanguage: locale === 'es' ? 'es-MX' : 'en-US',
    author: {
      '@type': 'Person',
      name: 'Hector Reyes Pérez',
    },
  };
}

/**
 * Article schema stub — implemented in Slice 8 (case studies) and Slice 12 (journal).
 * Exported here to keep the generators co-located [design §10.1].
 */
export function articleJsonLd(params: {
  title: string;
  date: string;
  slug: string;
  summary: string;
  locale: 'es' | 'en';
  type: 'work' | 'journal';
}): Record<string, unknown> {
  const path = params.type === 'work' ? `work/${params.slug}` : `journal/${params.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.summary,
    datePublished: params.date,
    url: `${SITE_URL}/${params.locale}/${path}`,
    author: {
      '@type': 'Person',
      name: 'Hector Reyes Pérez',
    },
    publisher: {
      '@type': 'Person',
      name: 'Hector Reyes Pérez',
      url: SITE_URL,
    },
  };
}

/**
 * BreadcrumbList schema stub — implemented per page in Slices 8 / 12.
 * [spec 9.4] All pages: BreadcrumbList MUST reflect actual URL hierarchy.
 */
export function breadcrumbJsonLd(
  segments: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((seg, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: seg.name,
      item: seg.url,
    })),
  };
}
