/**
 * ArticleJsonLd — server component for Article schema JSON-LD.
 * [spec 9.4]  Case studies MUST have Article schema + BreadcrumbList.
 * [design §10.1] Embedded via <JsonLd> server component using articleJsonLd() generator.
 *
 * Usage:
 *   <ArticleJsonLd title={entry.title} date={`${entry.year}-01-01`} slug={entry.slug}
 *     summary={entry.summary} locale={locale} type="work" />
 */

import { articleJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from './JsonLd';

interface ArticleJsonLdProps {
  title: string;
  /** ISO date string — e.g. '2024-01-01' */
  date: string;
  slug: string;
  summary: string;
  locale: 'es' | 'en';
  type: 'work' | 'journal';
}

/**
 * Renders Article JSON-LD for case studies and journal posts.
 * [spec 9.4] [design §10.1]
 */
export function ArticleJsonLd(props: ArticleJsonLdProps) {
  return <JsonLd data={articleJsonLd(props)} />;
}
