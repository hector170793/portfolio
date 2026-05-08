/**
 * Journal index page — app/[locale]/journal/page.tsx
 * [spec 3.1] Always renders at /[locale]/journal regardless of post count (not a 404).
 * [spec 3.2] Lists published posts by date desc when posts exist.
 * [spec 3.4] Newsletter signup rendered in both empty-state and populated state.
 * [spec 3.5] SSG — static at build time.
 * [spec 9.1] Exports generateMetadata via buildMetadata factory.
 * [design §8] SignupForm displayed at end of page always.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SignupForm } from '@/components/Newsletter/SignupForm';
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

  // [design §5] Enable static rendering for this locale.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'journal' });

  // Filter published posts for this locale, sorted date desc. [spec 3.2]
  const posts = journal
    .filter((p) => !p.draft && p.locale === locale)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main id="main-content">
      <section aria-labelledby="journal-heading" className="mx-auto max-w-2xl px-6 py-24">
        {/* [spec 8.5] h1 heading — appears exactly once on this page */}
        <h1
          id="journal-heading"
          className="font-display text-[var(--fs-h1)] leading-tight text-[var(--foreground)]"
        >
          {t('index.heading')}
        </h1>

        {posts.length === 0 ? (
          // [spec 3.1] Empty-state UI — renders with HTTP 200, no 404.
          <div className="mt-12 space-y-4">
            <p className="font-display text-[var(--fs-h3)] text-[var(--foreground)]">
              {t('empty.title')}
            </p>
            <p className="text-[var(--muted-foreground)]">{t('empty.subtitle')}</p>
          </div>
        ) : (
          // [spec 3.2] Post list: title, date, excerpt, reading time, link.
          <ol className="mt-12 space-y-10">
            {posts.map((post) => (
              <li key={`${post.slug}-${post.locale}`}>
                <article aria-labelledby={`post-${post.slug}`}>
                  <Link href={`/${locale}/journal/${post.slug}`} className="group block space-y-2">
                    {/* Date + reading time meta */}
                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString(
                          locale === 'es' ? 'es-MX' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' },
                        )}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span>{t('index.readingTime', { minutes: post.readingTime })}</span>
                    </div>

                    {/* Title */}
                    <h2
                      id={`post-${post.slug}`}
                      className="font-display text-[var(--fs-h2)] leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--accent-text)]"
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-[var(--muted-foreground)]">{post.summary}</p>
                  </Link>
                </article>
              </li>
            ))}
          </ol>
        )}

        {/* [spec 3.4] Newsletter signup always rendered — both empty and populated states */}
        <div className="mt-16 border-t border-[var(--border)] pt-12">
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
