/**
 * ContactCTA — editorial contact call-to-action section. [Server Component]
 * [spec 1.12] MUST be anchor id="contact" — scroll target for in-page #contact links
 *             from hero CTA and header nav [spec 1.2] [design §3.3].
 * [spec 1.1]  Section order position: last section on home page.
 * [spec 8.5]  Semantic <section> landmark with aria-labelledby + <h2>.
 * [spec 5.10] All strings from messages/contactCta — no hardcoded text.
 * [design §3.3] Server component. Primary CTA wrapped in <MagneticButton> [C].
 *
 * Editorial visual language:
 *   - Large display heading in Fraunces (--fs-h1 or larger)
 *   - Brief subtitle in Inter muted
 *   - Primary CTA: MagneticButton → Link to /[locale]/contact (cobalto button)
 *   - Secondary: small mailto link below the primary
 *   - Mono accent label ("04 / Contact") before heading
 *   - Generous vertical padding: clamp(8rem, 12vw, 16rem) for "finale" weight
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { MagneticButton } from '@/components/animation/MagneticButton';

type ContactCTAProps = {
  locale: string;
};

export async function ContactCTA({ locale }: ContactCTAProps) {
  // [spec 5.10] Load contactCta namespace from messages/{locale}.json
  const t = await getTranslations({ locale, namespace: 'contactCta' });

  return (
    /*
     * [spec 1.12] id="contact" — this is the scroll target for in-page #contact links.
     * Hero CTA (href="#contact") and header nav ("Contact" link href="/{locale}#contact")
     * both land here. Also the entry point to the full contact form page.
     * [spec 8.5] <section> landmark.
     */
    <section
      id="contact"
      aria-labelledby="contact-heading"
      style={{
        paddingTop: 'clamp(8rem, 12vw, 16rem)',
        paddingBottom: 'clamp(8rem, 12vw, 16rem)',
        paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
        paddingRight: 'clamp(1.5rem, 5vw, 5rem)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/*
       * Content column — centered editorial layout for the finale section.
       * [design §3.3] max-width gives room for large display type without overflowing.
       */}
      <div style={{ maxWidth: '56rem' }}>
        {/*
         * Mono accent label — editorial flourish.
         * [design §2.3] JetBrains Mono, --fs-mono scale.
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
          04 / Contact
        </p>

        {/*
         * [spec 8.5] <h2> heading — editorial display type, inviting register.
         * Large Fraunces for visual weight as the page finale.
         * [design §2.3] --fs-h1 clamp range (same as About and Capabilities headings).
         */}
        <h2
          id="contact-heading"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.25rem, 2vw + 1.75rem, 4.5rem)',
            lineHeight: '1.04',
            letterSpacing: '-0.025em',
            color: 'var(--foreground)',
            fontWeight: 300,
            marginBottom: 'clamp(1.5rem, 2.5vw, 2.5rem)',
          }}
        >
          {t('heading')}
        </h2>

        {/* Subtitle — brief context sentence */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-h3)',
            lineHeight: 'var(--lh-h3)',
            letterSpacing: 'var(--ls-body)',
            color: 'var(--muted-foreground)',
            maxWidth: '44ch',
            marginBottom: 'clamp(2.5rem, 4vw, 4rem)',
          }}
        >
          {t('subtitle')}
        </p>

        {/* CTA block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1.25rem',
          }}
        >
          {/*
           * Primary CTA — Link to /[locale]/contact wrapped in MagneticButton.
           * [design §3.1] MagneticButton is [C] — spring-driven toward cursor.
           * [spec 7.5.E.2] ≤ 30% translation within 30px radius.
           * [spec 8.2] Focus ring from globals.css :focus-visible.
           * Consistent visual language with Hero CTA (cobalto fill, accent-fg text).
           */}
          <MagneticButton>
            <Link
              href={`/${locale}/contact`}
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
              {t('primary')}
            </Link>
          </MagneticButton>

          {/*
           * Secondary CTA — direct mailto link.
           * Shown small below the primary to offer an alternative channel.
           * [spec 5.10] Email shown as static text (not from messages — it's a constant).
           */}
          <a
            href="mailto:hector170793@gmail.com"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-mono)',
              lineHeight: 'var(--lh-mono)',
              color: 'var(--muted-foreground)',
              textDecoration: 'underline',
              textUnderlineOffset: '0.25em',
              letterSpacing: '0.02em',
            }}
          >
            {t('secondary')}
          </a>
        </div>
      </div>
    </section>
  );
}
