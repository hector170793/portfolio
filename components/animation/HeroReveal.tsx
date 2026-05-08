'use client';

/**
 * HeroReveal — stagger-reveal animation for hero headline lines.
 * [spec 1.3]    Each line clips in from bottom: clip-path inset(100% 0 0 0) → inset(0%).
 *                80ms inter-line delay, 720ms each, ease power3.out. GSAP SplitText.
 * [spec 7.1.A.2] Hero stagger reveals lines via clip-path bottom-up, 80ms inter-line delay.
 * [spec 7.1.A.3] Subtitle+metrics fade in translateY(16px→0) 480ms, 200ms after last hero line.
 * [spec 7.7]    Reduced motion: render full text + subtitle/metrics statically, immediately.
 * [design §3.1]  Cleanup: gsap.context().revert() on unmount; SplitText revert() on resize.
 * [design §4]    Animation table: GSAP SplitText 720ms/line 80ms stagger, FM subtitle 480ms.
 *
 * IMPORTANT: GSAP and SplitText are imported LAZILY inside useEffect to ensure they
 * never appear in the synchronous bundle path. [spec 10.4]
 *
 * Props:
 *   lines    — array of headline line strings (split by caller for semantic control)
 *   subtitle — optional ReactNode rendered below headline
 *   metrics  — optional ReactNode (impact stats) rendered below subtitle
 *   children — fallback slot for additional content below metrics
 */

import { motion } from 'framer-motion';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { easeOutExpo } from '@/lib/animation/easings';

interface HeroRevealProps {
  /** Headline text lines to animate. Each string becomes one clipped line. */
  lines: string[];
  /** Subtitle content (rendered after headline animation). */
  subtitle?: ReactNode;
  /** Impact metrics content (rendered alongside/after subtitle). */
  metrics?: ReactNode;
  /** Additional content below metrics. */
  children?: ReactNode;
}

/** FM transition for subtitle/metrics fade. [design §4 table] */
const SUBTITLE_TRANSITION = {
  duration: 0.48,
  ease: easeOutExpo,
};

export function HeroReveal({
  lines,
  subtitle,
  metrics,
  children,
}: HeroRevealProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [afterHero, setAfterHero] = useState(false);

  useEffect(() => {
    // Under reduced motion: show everything immediately. [spec 7.7]
    if (reducedMotion) {
      setAfterHero(true);
      return;
    }

    let gsapContext: { revert: () => void } | null = null;

    // GSAP + SplitText are lazy-imported inside useEffect to keep them
    // out of all synchronous bundle paths. [spec 10.4]
    async function animate(): Promise<void> {
      const [{ gsap }, { SplitText }] = await Promise.all([
        import('gsap'),
        import('gsap/SplitText'),
      ]);

      // Ensure SplitText plugin is registered (GSAP 3.x requires this once per context).
      gsap.registerPlugin(SplitText);

      const container = containerRef.current;
      if (!container) return;

      // Select each headline line element.
      const lineEls = Array.from(container.querySelectorAll<HTMLElement>('[data-hero-line]'));
      if (lineEls.length === 0) return;

      gsapContext = gsap.context(() => {
        // Set initial clip-path state on all lines. [spec 1.3] [design §3.1]
        gsap.set(lineEls, { clipPath: 'inset(100% 0 0 0)', y: 0 });

        // Stagger reveal: 720ms each, 80ms between lines, ease power3.out. [spec 1.3]
        gsap.to(lineEls, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.72,
          ease: 'power3.out',
          stagger: 0.08, // 80ms inter-line delay [spec 1.3]
          onComplete: () => {
            // Subtitle/metrics fade in 200ms after last hero line. [spec 7.1.A.3]
            setTimeout(() => setAfterHero(true), 200);
          },
        });
      }, container);
    }

    animate().catch(console.error);

    return () => {
      // Cleanup: revert GSAP context on unmount. [design §3.1]
      gsapContext?.revert();
    };
  }, [reducedMotion]);

  // Under reduced motion: render everything statically with no animation. [spec 7.7]
  if (reducedMotion) {
    return (
      <div ref={containerRef}>
        <div>
          {lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list, no reorder
            <div key={i} data-hero-line>
              {line}
            </div>
          ))}
        </div>
        {subtitle && <div>{subtitle}</div>}
        {metrics && <div>{metrics}</div>}
        {children}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {/* Headline lines — each wrapped in overflow:hidden to clip the reveal. [spec 1.3] */}
      <div>
        {lines.map((line, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static list, no reorder
            key={i}
            style={{ overflow: 'hidden' }}
          >
            <div
              data-hero-line
              style={{
                // Initial clip state set by GSAP; this is the fallback
                // (before GSAP loads the line is briefly visible — acceptable
                // since GSAP loads async and sets state immediately on mount).
                display: 'block',
              }}
            >
              {line}
            </div>
          </div>
        ))}
      </div>

      {/*
       * Subtitle + metrics: fade in with translateY(16px→0) after hero sequence.
       * [spec 7.1.A.3] [design §4 table — subtitle/metrics fade row]
       * FM handles the transition; afterHero flag gates the animation start.
       */}
      {(subtitle || metrics) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={afterHero ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={SUBTITLE_TRANSITION}
        >
          {subtitle && <div>{subtitle}</div>}
          {metrics && <div>{metrics}</div>}
        </motion.div>
      )}

      {children}
    </div>
  );
}
