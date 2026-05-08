/**
 * Dynamic sitemap — app/sitemap.ts
 * [spec 9.5] MUST generate a sitemap including all routes × all locales.
 * [spec 9.5] /resume.pdf MUST NOT appear in the sitemap.
 * [design §10.3] Covers home, contact, journal index, case studies, journal posts.
 */

import type { MetadataRoute } from 'next';
import { journal, work } from '../.velite';

const SITE_URL = 'https://hector-reyes.work';
const LOCALES = ['es', 'en'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Home — highest priority, monthly freshness.
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    });

    // Contact page.
    entries.push({
      url: `${SITE_URL}/${locale}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    });

    // Journal index — always present even when empty [spec 3.1].
    entries.push({
      url: `${SITE_URL}/${locale}/journal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });

    // Work case studies for this locale — non-draft only.
    const workEntries = work.filter((w) => w.locale === locale && !w.draft);
    for (const w of workEntries) {
      entries.push({
        url: `${SITE_URL}/${locale}/work/${w.slug}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.8,
      });
    }

    // Journal posts for this locale — non-draft only.
    // Empty in v1, but infra is compatible for future posts [spec A].
    const journalEntries = journal.filter((j) => j.locale === locale && !j.draft);
    for (const j of journalEntries) {
      entries.push({
        url: `${SITE_URL}/${locale}/journal/${j.slug}`,
        lastModified: new Date(j.date),
        changeFrequency: 'never',
        priority: 0.7,
      });
    }
  }

  return entries;
}
