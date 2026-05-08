'use client';

/**
 * NextProject — "Next project" navigation at the bottom of each case study.
 * [spec 2.7]  Bottom of each case study MUST render a Next Project element.
 *              Click triggers shared element transition: view-transition-name or FM layoutId fallback.
 * [design §3.2] view-transition-name: next-project-{slug}; FM layoutId="hero-{slug}".
 *               Click: prefer document.startViewTransition; fallback: router.push.
 * [spec 7.4.D.3] Shared element transition: work list card image → case study hero.
 * [design §4 table] Next Project transition: View Transitions API + FM layoutId, 540ms easeInOutQuart.
 *
 * Editorial: large heading "Next" + project name as primary link.
 * Uses ImageRevealOnHover for consistent hover behavior with home work cards.
 *
 * Props:
 *   nextSlug      — slug of the next case study
 *   nextTitle     — display title of the next case study
 *   nextHeroImage — hero image URL of the next case study
 *   locale        — current locale for constructing the href
 *   label         — localized "Next project" label from messages
 */

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ImageRevealOnHover } from '@/components/animation/ImageRevealOnHover';

interface NextProjectProps {
  nextSlug: string;
  nextTitle: string;
  nextHeroImage: string;
  locale: string;
  label: string;
}

export function NextProject({
  nextSlug,
  nextTitle,
  nextHeroImage,
  locale,
  label,
}: NextProjectProps): React.ReactElement {
  const router = useRouter();
  const href = `/${locale}/work/${nextSlug}`;

  /**
   * Click handler: prefer View Transitions API for shared element transition;
   * fall back to router.push for browsers without API support (Firefox).
   * [spec 2.7] [design §3.2] [design §4 table — Next Project transition row]
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If View Transitions API is available, use it for the shared element transition.
      if ('startViewTransition' in document) {
        e.preventDefault();
        // biome-ignore lint/suspicious/noExplicitAny: View Transitions API is a modern Web API
        (document as any).startViewTransition(() => {
          router.push(href);
        });
      }
      // Else: let native anchor navigation proceed (cross-document navigation).
    },
    [href, router],
  );

  return (
    <section
      aria-label={label}
      style={{
        padding: 'clamp(6rem, 10vw, 12rem) clamp(1.5rem, 5vw, 5rem)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* "Next project" mono label */}
      <p
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-small)',
          color: 'var(--muted-foreground)',
          letterSpacing: '0.05em',
          marginBottom: '2rem',
        }}
      >
        {label}
      </p>

      {/*
       * ImageRevealOnHover wraps the link — consistent with SelectedWork home cards.
       * [spec 2.7] Shared element transition: view-transition-name on the anchor.
       * [design §3.2] FM layoutId as fallback.
       */}
      <ImageRevealOnHover src={nextHeroImage} alt={`${nextTitle} — preview`}>
        <a
          href={href}
          onClick={handleClick}
          data-cursor="view"
          style={{
            /*
             * [spec 2.7] view-transition-name for shared element transition.
             * [design §3.2] Named `next-project-{slug}` on the anchor wrapper.
             */
            viewTransitionName: `next-project-${nextSlug}`,
            display: 'block',
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--fs-hero)',
              lineHeight: 'var(--lh-hero)',
              letterSpacing: 'var(--ls-hero)',
              color: 'var(--foreground)',
              fontWeight: 300,
              margin: 0,
              maxWidth: '20ch',
            }}
          >
            {nextTitle}
          </h2>

          {/* Arrow indicator — editorial touch */}
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              marginTop: '1.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-body)',
              color: 'var(--accent-text)',
              letterSpacing: '0.05em',
            }}
          >
            ↗
          </span>
        </a>
      </ImageRevealOnHover>
    </section>
  );
}
