/**
 * Work case study page — app/[locale]/work/[slug]/page.tsx
 * [spec 2.1] 4 case studies × 2 locales = 8 static pages.
 * [spec 2.8] SSG via generateStaticParams from velite work collection.
 * [spec 9.1] Exports generateMetadata for OG/SEO.
 * [design §1] Minimal stub; real case study layout in Slice 8.
 *
 * Completes task 5.7 that was deferred from Slice 5.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo/metadata';
import { work } from '../../../../.velite';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * [spec 2.8] Generate all static param combinations from velite work collection.
 * Filters by locale to produce locale-matched pairs.
 */
export function generateStaticParams() {
  return work.map((entry) => ({
    locale: entry.locale,
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const entry = work.find((w) => w.slug === slug && w.locale === locale);
  if (!entry) return {};

  return buildMetadata({
    locale: locale as 'es' | 'en',
    title: `${entry.title} — Hector Reyes Pérez`,
    description: entry.summary,
    path: `/work/${slug}`,
    ogParams: {
      title: entry.title,
      subtitle: `${entry.client} · ${entry.year}`,
      type: 'work',
      slug,
    },
  });
}

export default async function WorkPage({ params }: Props) {
  const { locale, slug } = await params;

  // [design §5] Enable static rendering for this locale.
  setRequestLocale(locale);

  // Find the case study matching locale + slug.
  const entry = work.find((w) => w.slug === slug && w.locale === locale);

  // [spec 2.1] 404 if slug/locale combo doesn't exist in velite collection.
  if (!entry) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'caseStudy' });

  return (
    // [spec 8.5] <article> for case study content [design §12.5].
    <article aria-labelledby="case-study-heading" className="mx-auto max-w-4xl px-6 py-24">
      <header className="mb-12">
        <p className="text-sm font-medium text-[var(--accent-text)]">
          {entry.client} · {entry.year}
        </p>
        <h1
          id="case-study-heading"
          className="mt-2 font-display text-[var(--fs-h1)] leading-tight text-[var(--foreground)]"
        >
          {entry.title}
        </h1>
        <p className="mt-4 text-[var(--muted-foreground)]">{entry.summary}</p>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Project tags">
            {entry.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[var(--radius-pill)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      {/*
       * Case study chapters stub.
       * [spec 2.2] Full 5-chapter layout (Brief/Approach/Solution/Outcome/Stack)
       * with PinnedHero, StatCounter, ParallaxGallery, and NextProject
       * will be implemented in Slice 8.
       */}
      <div className="space-y-16">
        {(['brief', 'approach', 'solution', 'outcome', 'stack'] as const).map((chapter) => (
          <section key={chapter} aria-labelledby={`chapter-${chapter}`}>
            <h2
              id={`chapter-${chapter}`}
              className="font-display text-[var(--fs-h2)] text-[var(--foreground)]"
            >
              {t(`chapters.${chapter}`)}
            </h2>
            {/* Slice 8: MDX body content rendered here */}
          </section>
        ))}
      </div>
    </article>
  );
}
