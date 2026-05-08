/**
 * WebSiteJsonLd — server component that injects WebSite schema for the home page.
 * [spec 9.4] Home MUST include WebSite schema.
 * [design §10.1] Wrappers live in components/seo/.
 */

import { JsonLd } from '@/components/seo/JsonLd';
import { websiteJsonLd } from '@/lib/seo/jsonld';

type WebSiteJsonLdProps = {
  locale: 'es' | 'en';
};

/**
 * Renders the WebSite JSON-LD structured data block.
 * Place inside <head> of the home page (server component context).
 * [spec 9.4]
 */
export function WebSiteJsonLd({ locale }: WebSiteJsonLdProps) {
  return <JsonLd data={websiteJsonLd(locale)} />;
}
