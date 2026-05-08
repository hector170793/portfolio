/**
 * PersonJsonLd — server component that injects Person schema for the home page.
 * [spec 9.4] Home MUST include Person schema (name, url, jobTitle, sameAs).
 * [spec 9.3] Scenario: <script type="application/ld+json"> with @type: "Person"
 *            and jobTitle: "Senior Full-Stack Engineer".
 * [design §10.1] Wrappers live in components/seo/.
 */

import { JsonLd } from '@/components/seo/JsonLd';
import { personJsonLd } from '@/lib/seo/jsonld';

type PersonJsonLdProps = {
  locale: 'es' | 'en';
};

/**
 * Renders the Person JSON-LD structured data block.
 * Place inside <head> of the home page (server component context).
 * [spec 9.4]
 */
export function PersonJsonLd({ locale }: PersonJsonLdProps) {
  return <JsonLd data={personJsonLd(locale)} />;
}
