/**
 * JsonLd — base server component for injecting JSON-LD structured data.
 * [spec 9.4] JSON-LD MUST be injected per route via <script type="application/ld+json">.
 * [design §10.1] Embedded via <JsonLd> server component.
 *
 * Usage:
 *   import { JsonLd } from '@/components/seo/JsonLd';
 *   <JsonLd data={personJsonLd(locale)} />
 *
 * Security: JSON.stringify output is safe here because the data object
 * is constructed server-side from known values — not from user input.
 * The <script> tag renders only in <head> via Next.js metadata mechanism.
 */

type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Renders a <script type="application/ld+json"> tag with the given data.
 * Must be used inside a Next.js Server Component and placed in <head> context.
 * [design §10.1]
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: standard JSON-LD pattern — data is server-constructed, never from user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
