/**
 * OG URL helper — lib/seo/og.ts
 * [spec 9.2] OG images MUST be dynamically generated via /api/og Edge route.
 * [design §10.2] One route handler covers home, case studies, and journal posts.
 *
 * buildOgUrl() constructs the full absolute URL passed to openGraph.images.
 * Used by buildMetadata() in lib/seo/metadata.ts.
 */

const SITE_URL = 'https://hector-reyes.work';

export interface OgParams {
  title: string;
  subtitle?: string;
  type?: 'home' | 'work' | 'journal' | 'contact';
  slug?: string;
}

/**
 * Build the absolute OG image URL for a given set of params.
 * The /api/og Edge route parses these query params and renders the image.
 */
export function buildOgUrl(params: OgParams): string {
  const search = new URLSearchParams();
  search.set('title', params.title);
  if (params.subtitle) search.set('subtitle', params.subtitle);
  if (params.type) search.set('type', params.type);
  if (params.slug) search.set('slug', params.slug);
  return `${SITE_URL}/api/og?${search.toString()}`;
}
