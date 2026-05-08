/**
 * JournalPreview — latest journal posts preview. [Server Component]
 * [spec 1.11] Conditionally rendered: ONLY when journalEnabled() returns true (caller guards).
 *             This component assumes at least one post exists when it renders.
 *             When no posts exist the section is COMPLETELY ABSENT from the DOM.
 * [spec 1.1]  Section position: after Capabilities, before Contact CTA.
 * [spec 8.5]  Semantic <section> landmark with aria-labelledby + <h2>.
 * [spec 5.10] All strings from messages/journal.preview — no hardcoded text.
 * [design §3.3] Server component — reads velite collection at build time.
 *
 * Data: reads velite journal collection, filters by locale + non-draft,
 * sorts by date desc, shows up to 3 latest posts.
 * Each post: title, date, excerpt (summary), reading time, link to /[locale]/journal/[slug].
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { journal } from '../../.velite';

type JournalPreviewProps = {
  locale: string;
};

export async function JournalPreview({ locale }: JournalPreviewProps) {
  // [spec 5.10] Load journal.preview namespace from messages/{locale}.json
  const t = await getTranslations({ locale, namespace: 'journal.preview' });

  // Filter by locale + non-draft, sort by date desc, cap at 3.
  // [spec 1.11] Component assumes posts exist — caller (page.tsx) guards with journalEnabled().
  const posts = journal
    .filter((p) => p.locale === locale && !p.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const tJournal = await getTranslations({ locale, namespace: 'journal.index' });

  return (
    /*
     * [spec 8.5] <section> landmark.
     * id="journal" provides scroll-spy anchor [spec 1.13] when the section is rendered.
     * [spec 1.11] Section is absent from DOM when not rendered — enforced by caller.
     */
    <section
      id="journal"
      aria-labelledby="journal-heading"
      style={{
        paddingTop: 'clamp(6rem, 10vw, 12rem)',
        paddingBottom: 'clamp(6rem, 10vw, 12rem)',
        paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
        paddingRight: 'clamp(1.5rem, 5vw, 5rem)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Section header: mono label + h2 + "View all" link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: 'clamp(3rem, 5vw, 5rem)',
        }}
      >
        <div>
          {/* Mono accent label — editorial flourish */}
          <p
            aria-hidden="true"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono)',
              lineHeight: 'var(--lh-mono)',
              color: 'var(--accent-text)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            03 / Journal
          </p>

          {/*
           * [spec 8.5] <h2> heading.
           * [design §2.3] Fraunces display, --fs-h1 clamp range.
           */}
          <h2
            id="journal-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 2vw + 1.75rem, 4.5rem)',
              lineHeight: '1.04',
              letterSpacing: '-0.025em',
              color: 'var(--foreground)',
              fontWeight: 300,
            }}
          >
            {t('heading')}
          </h2>
        </div>

        {/* View all link */}
        <Link
          href={`/${locale}/journal`}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--accent-text)',
            textDecoration: 'underline',
            textUnderlineOffset: '0.25em',
            whiteSpace: 'nowrap',
          }}
        >
          {t('viewAll')} →
        </Link>
      </div>

      {/* Post list — up to 3 entries */}
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}
      >
        {posts.map((post, index) => (
          <li
            key={post.slug}
            style={{
              borderTop: index === 0 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <article>
              <Link
                href={`/${locale}/journal/${post.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: 'clamp(1.5rem, 3vw, 2.5rem) 0',
                  textDecoration: 'none',
                  transition: 'opacity 160ms ease',
                }}
              >
                {/* Date + reading time meta — mono style */}
                <div
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-mono)',
                    color: 'var(--muted-foreground)',
                    letterSpacing: '0.02em',
                  }}
                >
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  <span>{tJournal('readingTime', { minutes: post.readingTime })}</span>
                </div>

                {/* Post title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.375rem, 0.8vw + 1.25rem, 2rem)',
                    lineHeight: '1.22',
                    letterSpacing: '-0.015em',
                    color: 'var(--foreground)',
                    fontWeight: 300,
                  }}
                >
                  {post.title}
                </h3>

                {/* Excerpt / summary */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--fs-body)',
                    lineHeight: 'var(--lh-body)',
                    color: 'var(--muted-foreground)',
                    maxWidth: '60ch',
                  }}
                >
                  {post.summary}
                </p>
              </Link>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
