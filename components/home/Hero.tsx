/**
 * Hero — landing section of the home page. [Server Component]
 * [spec 1.1]  Home page sections order: Hero → Selected Work → …
 * [spec 1.2]  Hero: full name, positioning headline, impact metrics, primary CTA → #contact.
 * [spec 1.3]  Stagger-reveal via <HeroReveal> (lines[] prop). Subtitle + metrics fade after.
 * [spec 7.7]  Reduced motion: HeroReveal renders statically.
 * [design §3.3] Hero is [S] — wraps client <HeroReveal>; pulls copy from messages.
 * [design §3.1] <MagneticButton> wraps the CTA anchor.
 * [spec 8.5]  Semantic <section> landmark; h1 sr-only for heading hierarchy.
 * [spec 5.10] All UI strings from messages — no hardcoded text.
 *
 * Headline lines (HeroReveal stagger):
 *   ES: ["Senior Full-Stack Engineer", "& Frontend Lead —", "entrega de producto fintech."]
 *   EN: ["Senior Full-Stack Engineer", "& Frontend Lead —", "fintech-grade product delivery."]
 *   Coordinated via messages.hero.headlineLines (string[]).
 *
 * Metrics: messages.hero.metrics.{1,2,3}.{value,label}
 * CTA: messages.hero.ctaPrimary → <MagneticButton> wrapping <a href="#contact">
 */

import { getTranslations } from 'next-intl/server';
import { HeroReveal } from '@/components/animation/HeroReveal';
import { MagneticButton } from '@/components/animation/MagneticButton';

type HeroProps = {
  locale: string;
};

export async function Hero({ locale }: HeroProps) {
  // [spec 5.10] Load hero namespace from messages/{locale}.json
  const t = await getTranslations({ locale, namespace: 'hero' });

  // Array of headline lines — passed to HeroReveal for stagger animation.
  // [spec 1.3] [design §3.1] t.raw() returns the raw JSON value (string[]).
  const lines = t.raw('headlineLines') as string[];

  // [spec 1.2] Impact metrics — 3 stat cells with value + label.
  const metrics = [
    { value: t('metrics.1.value'), label: t('metrics.1.label') },
    { value: t('metrics.2.value'), label: t('metrics.2.label') },
    { value: t('metrics.3.value'), label: t('metrics.3.label') },
  ];

  return (
    /*
     * [spec 8.5] <section> landmark. The hero is the landing section — no
     * scroll-spy anchor id needed here. Scroll-spy targets live on #work,
     * #about, #capabilities, #contact sections further down the page.
     */
    <section
      aria-labelledby="hero-heading"
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 5vw, 5rem)',
        position: 'relative',
      }}
    >
      {/*
       * [spec 8.5] Visually hidden h1 — screen readers read this.
       * Visual headline is rendered by HeroReveal as animated <div> elements.
       * This pattern separates animation concerns from document semantics.
       */}
      <h1
        id="hero-heading"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {t('name')} — {lines.join(' ')}
      </h1>

      {/*
       * Typography wrapper — applies hero type scale to HeroReveal's line elements.
       * [data-hero-line] divs inside HeroReveal inherit font-family/size/spacing.
       * [design §2.3] --fs-hero, --lh-hero, --ls-hero
       */}
      <div
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-hero)',
          lineHeight: 'var(--lh-hero)',
          letterSpacing: 'var(--ls-hero)',
          color: 'var(--foreground)',
          fontWeight: 300,
        }}
      >
        {/*
         * HeroReveal [C] handles:
         *   - GSAP clip-path stagger on `lines` [spec 1.3]
         *   - FM subtitle/metrics fade 200ms after last line [spec 7.1.A.3]
         *   - Reduced motion: static render [spec 7.7]
         * [design §3.1]
         */}
        <HeroReveal
          lines={lines}
          subtitle={
            /*
             * [spec 1.2] Subtitle — brief positioning statement.
             * Inherits body font (not display) to contrast with headline.
             * [design §2.3]
             */
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--fs-h3)',
                lineHeight: 'var(--lh-h3)',
                letterSpacing: 'var(--ls-body)',
                color: 'var(--muted-foreground)',
                marginTop: '2rem',
                maxWidth: '48ch',
              }}
            >
              {t('subtitle')}
            </p>
          }
          metrics={
            /*
             * [spec 1.2] Impact metrics — 3 stat cells, horizontal flex.
             * [spec 8.5] <ul>/<li> for semantic list of stats.
             */
            <ul
              aria-label="Impact metrics"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(1.5rem, 3vw, 3rem)',
                listStyle: 'none',
                padding: 0,
                margin: '2.5rem 0 0',
              }}
            >
              {metrics.map((metric) => (
                <li
                  key={metric.value}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--fs-h2)',
                      lineHeight: 'var(--lh-h2)',
                      letterSpacing: 'var(--ls-h2)',
                      color: 'var(--foreground)',
                    }}
                  >
                    {metric.value}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--fs-small)',
                      lineHeight: 'var(--lh-small)',
                      color: 'var(--muted-foreground)',
                      maxWidth: '24ch',
                    }}
                  >
                    {metric.label}
                  </span>
                </li>
              ))}
            </ul>
          }
        >
          {/*
           * CTA — [spec 1.2] anchors to #contact. Wrapped in <MagneticButton>.
           * [design §3.1] MagneticButton is [C] — spring-driven translate toward cursor.
           * [spec 7.5.E.2] ≤ 30% translation within 30px radius.
           * [spec 8.2]  Focus ring from globals.css :focus-visible.
           */}
          <div style={{ marginTop: '3rem' }}>
            <MagneticButton>
              <a
                href="#contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.875rem 2.25rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--fs-body)',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  color: 'var(--accent-fg)',
                  backgroundColor: 'var(--accent-base)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  border: '1px solid var(--accent-base)',
                  transition: 'background-color 160ms ease, border-color 160ms ease',
                }}
              >
                {t('ctaPrimary')}
              </a>
            </MagneticButton>
          </div>
        </HeroReveal>
      </div>
    </section>
  );
}
