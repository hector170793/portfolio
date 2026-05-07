/**
 * Journal post page — app/[locale]/journal/[slug]/page.tsx
 * [spec 3.3] Renders MDX post content with title, date, reading time, body, newsletter.
 * [spec 3.5] Statically generated at build time.
 * [spec 3.6] Per-locale MDX variants: {slug}.{locale}.mdx.
 * [spec 9.1] Exports generateMetadata.
 *
 * STUB: When journal is empty (v1), generateStaticParams returns [].
 * Real post layout with newsletter signup in Slice 9.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo/metadata';
import { journal } from '../../../../.velite';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * [spec 3.5] Generate static params from velite journal collection.
 * Returns [] when no posts exist — that is correct; no journal pages generated.
 */
export function generateStaticParams() {
  return journal
    .filter((p) => !p.draft)
    .map((post) => ({
      locale: post.locale,
      slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const post = journal.find((p) => p.slug === slug && p.locale === locale);
  if (!post) return {};

  return buildMetadata({
    locale: locale as 'es' | 'en',
    title: `${post.title} — Hector Reyes Pérez`,
    description: post.summary,
    path: `/journal/${slug}`,
    ogParams: {
      title: post.title,
      subtitle: 'Hector Reyes Pérez',
      type: 'journal',
      slug,
    },
  });
}

export default async function JournalPostPage({ params }: Props) {
  const { locale, slug } = await params;

  // [design §5] Enable static rendering for this locale.
  setRequestLocale(locale);

  const post = journal.find((p) => p.slug === slug && p.locale === locale);

  // 404 for unknown slugs — should not happen given generateStaticParams.
  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'journal' });

  return (
    // [spec 8.5] <article> for journal post content.
    <article aria-labelledby="post-heading" className="mx-auto max-w-2xl px-6 py-24">
      <header className="mb-12">
        <time dateTime={post.date} className="text-sm text-[var(--muted-foreground)]">
          {new Date(post.date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {post.readingTime && (
          <span className="ml-4 text-sm text-[var(--muted-foreground)]">
            {t('index.readingTime', { minutes: post.readingTime })}
          </span>
        )}
        <h1
          id="post-heading"
          className="mt-4 font-display text-[var(--fs-h1)] leading-tight text-[var(--foreground)]"
        >
          {post.title}
        </h1>
        <p className="mt-4 text-[var(--muted-foreground)]">{post.summary}</p>
      </header>

      {/*
       * MDX body content.
       * Slice 9: full MDXContent renderer + newsletter signup at end.
       */}
      <div className="prose prose-neutral max-w-none">{/* Slice 9 renders MDX body here */}</div>

      {/* [spec 3.3] Newsletter signup at end of post — Slice 9 */}
      <footer className="mt-16 border-t border-[var(--border)] pt-8">
        <p className="text-sm text-[var(--muted-foreground)]">{t('signupCta')}</p>
        {/* Slice 9: <NewsletterSignupForm /> */}
      </footer>
    </article>
  );
}
