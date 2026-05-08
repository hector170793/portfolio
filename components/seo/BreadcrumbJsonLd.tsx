/**
 * BreadcrumbJsonLd — server component for BreadcrumbList schema JSON-LD.
 * [spec 9.4]  All pages: BreadcrumbList MUST reflect the actual URL hierarchy.
 * [design §10.1] Embedded via <JsonLd> server component using breadcrumbJsonLd() generator.
 *
 * Usage:
 *   <BreadcrumbJsonLd segments={[
 *     { name: 'Home', url: 'https://hector-reyes.work/en' },
 *     { name: 'Work', url: 'https://hector-reyes.work/en/work' },
 *     { name: 'Santander Digital Onboarding', url: 'https://hector-reyes.work/en/work/santander-onboarding' },
 *   ]} />
 */

import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from './JsonLd';

interface BreadcrumbJsonLdProps {
  segments: { name: string; url: string }[];
}

/**
 * Renders BreadcrumbList JSON-LD for any page.
 * [spec 9.4] [design §10.1]
 */
export function BreadcrumbJsonLd({ segments }: BreadcrumbJsonLdProps) {
  return <JsonLd data={breadcrumbJsonLd(segments)} />;
}
