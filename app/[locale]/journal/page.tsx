/**
 * Journal index page — app/[locale]/journal/page.tsx
 * [spec 3.1] Always renders at /[locale]/journal, regardless of post count.
 * [spec 3.1] When no posts exist: renders empty-state UI (not a 404).
 * [spec 9.1] Exports generateMetadata.
 * [spec 3.5] Page is static (SSG).
 *
 * STUB: Real post listing and empty-state (with newsletter signup) in Slice 9.
 * For now: renders empty-state message when no posts, post count when posts exist.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo/metadata';
import { journal } from '../../../.velite';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'journal' });

  return buildMetadata({
    locale: locale as 'es' | 'en',
    title: `${t('index.heading')} — Hector Reyes Pérez`,
    description:
      locale === 'es'
        ? 'Artículos sobre ingeniería, arquitectura y desarrollo frontend.'
        : 'Articles on engineering, architecture, and frontend development.',
    path: '/journal',
    ogParams: {
      title: t('index.heading'),
      subtitle: 'Hector Reyes Pérez',
    },
  });
}

export default async function JournalIndexPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'journal' });

  // [design §5] Enable static rendering for this locale.
  setRequestLocale(locale);

  // Filter published posts for this locale.
  const posts = journal.filter((p) => !p.draft && p.locale === locale);

  return (
    <section aria-labelledby="journal-heading" className="mx-auto max-w-2xl px-6 py-24">
      <h1
        id="journal-heading"
        className="font-display text-[var(--fs-h1)] text-[var(--foreground)]"
      >
        {t('index.heading')}
      </h1>

      {posts.length === 0 ? (
        // [spec 3.1] Empty-state UI — no 404.
        <div className="mt-12 space-y-4">
          <p className="text-[var(--fs-h3)] font-display text-[var(--foreground)]">
            {t('empty.title')}
          </p>
          <p className="text-[var(--muted-foreground)]">{t('empty.subtitle')}</p>
          {/* Slice 9: <NewsletterSignupForm /> renders here */}
        </div>
      ) : (
        // [spec 3.2] Post list — full implementation in Slice 9.
        <ul className="mt-12 space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <article>
                <h2 className="font-display text-[var(--fs-h2)] text-[var(--foreground)]">
                  {post.title}
                </h2>
                <p className="mt-2 text-[var(--muted-foreground)]">{post.summary}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
