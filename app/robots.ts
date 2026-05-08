/**
 * robots.ts — app/robots.ts
 * [spec 9.6] MUST allow crawling of all content routes.
 * [spec 9.6] MUST include the sitemap URL.
 * [spec 9.6] MUST NOT disallow /work/ or /journal/.
 * [design §10.4] Only disallows /api/ routes.
 */

import type { MetadataRoute } from 'next';

const SITE_URL = 'https://hector-reyes.work';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // [spec 9.6] MUST NOT disallow /work/ or /journal/.
        // Only /api/ is excluded from crawling.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
