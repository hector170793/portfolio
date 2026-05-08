/**
 * About — editorial section presenting Hector's professional narrative. [Server Component]
 * [spec 1.9]  MUST NOT contain skill level bars or rating widgets.
 * [spec 1.1]  Section order: Hero → Work → About → Capabilities → Journal → Contact.
 * [spec 8.5]  Semantic <section> landmark with aria-labelledby + <h2> heading hierarchy.
 * [spec 5.10] All strings from messages/about — no hardcoded text.
 * [design §3.3] Server component — pure content, no client interactivity.
 *
 * Editorial visual language:
 *   - Heading: Fraunces display (--font-display), --fs-h1 scale
 *   - Body: Inter (--font-body), generous line-height (~1.6), max-width ~58ch
 *   - Mono accent label ("01 / About") in JetBrains Mono before the heading
 *   - Cobalto hairline top-border for rhythm continuity with SelectedWork
 *   - Vertical padding: clamp(6rem, 10vw, 12rem) — matches Hero / SelectedWork rhythm
 */

import { getTranslations } from 'next-intl/server';

type AboutProps = {
  locale: string;
};

export async function About({ locale }: AboutProps) {
  // [spec 5.10] Load about namespace from messages/{locale}.json
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    /*
     * [spec 8.5] <section> landmark with aria-labelledby pointing to the <h2>.
     * id="about" provides the scroll-spy anchor [spec 1.13] and nav href target.
     */
    <section
      id="about"
      aria-labelledby="about-heading"
      style={{
        paddingTop: 'clamp(6rem, 10vw, 12rem)',
        paddingBottom: 'clamp(6rem, 10vw, 12rem)',
        paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
        paddingRight: 'clamp(1.5rem, 5vw, 5rem)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/*
       * Content column — max-width constrains the editorial measure (~58ch for body).
       * max-w-3xl ≈ 48rem ≈ 58ch at ~1rem font-size. Adjust to taste.
       */}
      <div style={{ maxWidth: '52rem' }}>
        {/*
         * Mono accent label — editorial flourish.
         * [design §2.3] JetBrains Mono (--font-mono), --fs-mono scale.
         * Cobalto accent-text for subtle brand color [spec 6.5].
         */}
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
          01 / About
        </p>

        {/*
         * [spec 8.5] <h2> — not skipping from h1 (hero-heading).
         * Fraunces display weight for editorial hierarchy.
         * [design §2.3] --fs-h1, --lh-h1, --ls-h1
         */}
        <h2
          id="about-heading"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.25rem, 2vw + 1.75rem, 4.5rem)',
            lineHeight: '1.04',
            letterSpacing: '-0.025em',
            color: 'var(--foreground)',
            fontWeight: 300,
            marginBottom: 'clamp(2rem, 4vw, 4rem)',
          }}
        >
          {t('title')}
        </h2>

        {/*
         * [spec 1.9] 3 body paragraphs — narrative content only, no bars or ratings.
         * [design §2.3] Inter body font, lh-body 1.6, max-width ~58ch for readability.
         * Content-strategy hook: hardware → firmware → frontend pivot narrative.
         */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(1.25rem, 2vw, 2rem)',
          }}
        >
          {[t('bodyParagraph1'), t('bodyParagraph2'), t('bodyParagraph3')].map((paragraph, i) => (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: static ordered list
              key={i}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--fs-body)',
                lineHeight: 'var(--lh-body)',
                letterSpacing: 'var(--ls-body)',
                color: 'var(--muted-foreground)',
                maxWidth: '58ch',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
