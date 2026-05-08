/**
 * Journal post page — app/[locale]/journal/[slug]/page.tsx
 * [spec 3.3] Renders MDX post: title, date, reading time, body, newsletter signup.
 * [spec 3.5] SSG — static at build time via generateStaticParams.
 * [spec 3.6] Per-locale MDX variants: {slug}.{locale}.mdx.
 * [spec 9.1] generateMetadata via buildMetadata factory.
 * [spec 9.4] ArticleJsonLd + BreadcrumbJsonLd injected.
 * [design §8] SignupForm at end of post.
 *
 * generateStaticParams returns [] when no posts exist (v1 — journal is empty).
 * No static routes generated for journal posts in v1.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MDXContent } from '@/components/MDXContent';
import { SignupForm } from '@/components/Newsletter/SignupForm';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { journal } from '../../../../.velite';

const SITE_URL = 'https://hector-reyes.work';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * [spec 3.5] Generate static params from velite journal collection.
 * Returns [] when no posts exist — no static routes generated for journal in v1.
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

  // 404 for unknown slugs — should not happen given generateStaticParams, but defensive.
  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'journal' });

  // Breadcrumb segments for JSON-LD [spec 9.4]
  const breadcrumbs = [
    { name: 'Home', url: `${SITE_URL}/${locale}` },
    { name: t('index.heading'), url: `${SITE_URL}/${locale}/journal` },
    { name: post.title, url: `${SITE_URL}/${locale}/journal/${slug}` },
  ];

  const formattedDate = new Date(post.date).toLocaleDateString(
    locale === 'es' ? 'es-MX' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <>
      {/* [spec 9.4] Article + Breadcrumb JSON-LD */}
      <ArticleJsonLd
        title={post.title}
        date={post.date}
        slug={slug}
        summary={post.summary}
        locale={locale as 'es' | 'en'}
        type="journal"
      />
      <BreadcrumbJsonLd segments={breadcrumbs} />

      <main id="main-content">
        {/* [spec 8.5] <article> for journal post content */}
        <article aria-labelledby="post-heading" className="mx-auto max-w-2xl px-6 py-24">
          <header className="mb-12">
            {/* Date + reading time meta */}
            <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
              <time dateTime={post.date}>{formattedDate}</time>
              <span aria-hidden="true">·</span>
              <span>{t('index.readingTime', { minutes: post.readingTime })}</span>
            </div>

            {/* [spec 8.5] h1 appears exactly once */}
            <h1
              id="post-heading"
              className="mt-4 font-display text-[var(--fs-h1)] leading-tight text-[var(--foreground)]"
            >
              {post.title}
            </h1>

            {/* Excerpt / summary */}
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">{post.summary}</p>
          </header>

          {/* MDX body content [spec 3.3] */}
          <div className="prose prose-neutral max-w-none text-[var(--foreground)]">
            <MDXContent code={post.body} />
          </div>

          {/* [spec 3.3] Newsletter signup at end of every post */}
          <footer className="mt-16 border-t border-[var(--border)] pt-12">
            <SignupForm />
          </footer>
        </article>
      </main>
    </>
  );
}
