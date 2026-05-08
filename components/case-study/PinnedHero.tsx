'use client';

/**
 * PinnedHero — case study hero with GSAP ScrollTrigger pin.
 * [spec 2.4]  Hero section stays fixed while first chapter content scrolls over it.
 * [design §3.2] pin:true, start:'top top', end:'+=100%', scrub:false, anticipatePin:1, pinSpacing:true.
 * [spec 10.9] Hero image has priority (LCP). [spec 10.3] GSAP lazy-imported.
 * [spec 7.7]  Reduced motion: static render, no pin.
 * [spec 8.5]  <header> with h1, semantic structure.
 * [design §4 table] Pinned hero row — GSAP ScrollTrigger, scrub-based, kill on route exit.
 */

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';

interface PinnedHeroProps {
  title: string;
  client: string;
  year: number;
  heroImage: string;
  tags?: string[];
}

export function PinnedHero({
  title,
  client,
  year,
  heroImage,
  tags,
}: PinnedHeroProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // [spec 7.7] No pin under reduced motion — render static.
    if (reducedMotion) return;

    let scrollTriggerInstance: { kill: () => void } | null = null;

    // GSAP + ScrollTrigger are lazy-imported to keep them out of initial bundle. [spec 10.4]
    async function initPin(): Promise<void> {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      if (!section) return;

      // [design §3.2] Pin config: anticipatePin:1 smooths fast-scroll handoff on Safari.
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: section,
        pin: true,
        start: 'top top',
        end: '+=100%',
        scrub: false,
        anticipatePin: 1,
        pinSpacing: true,
      });
    }

    initPin().catch(console.error);

    // [design §3.2] Cleanup: kill ScrollTrigger on unmount / route exit.
    return () => {
      scrollTriggerInstance?.kill();
    };
  }, [reducedMotion]);

  return (
    /*
     * [spec 8.5] Semantic <header> inside <article> — provides role context for hero.
     * min-height: 100dvh ensures the pinned section fills the viewport.
     */
    <header
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        backgroundColor: 'var(--background)',
        overflow: 'hidden',
      }}
    >
      {/* Meta bar — client + year + tags */}
      <div
        style={{
          padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 5vw, 5rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          zIndex: 2,
          position: 'relative',
        }}
      >
        {/* Client + year */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-small)',
            color: 'var(--accent-text)',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          {client} · {year}
        </p>

        {/* Tag list */}
        {tags && tags.length > 0 && (
          <ul
            aria-label="Project tags"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            {tags.map((tag) => (
              <li
                key={tag}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-small)',
                  color: 'var(--muted-foreground)',
                  padding: '0.2rem 0.6rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-pill)',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hero image — full-bleed, LCP candidate [spec 10.9] */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '60dvh',
        }}
      >
        <Image
          src={heroImage}
          alt={`${title} — hero image`}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />

        {/* Title overlay — absolute on top of image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 'clamp(2rem, 5vw, 5rem) clamp(1.5rem, 5vw, 5rem)',
            background:
              'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 40%, transparent 100%)',
            zIndex: 1,
          }}
        >
          <h1
            id="case-study-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--fs-hero)',
              lineHeight: 'var(--lh-hero)',
              letterSpacing: 'var(--ls-hero)',
              color: 'var(--foreground)',
              fontWeight: 300,
              margin: 0,
              maxWidth: '18ch',
            }}
          >
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
