'use client';

/**
 * StatCounter — animated number counter that triggers on viewport entry.
 * [spec 2.5]  Counter values MUST animate from 0 to final using FM useMotionValue + useTransform.
 *              Animation MUST only trigger when counter enters viewport (once:true).
 * [spec 2.3 scenario] Stat counter animates 0 → final when scrolled in; no re-animation on re-entry.
 * [design §3.2] FM useMotionValue + useTransform + useInView({ once:true, margin:'-20%' }).
 * [design §4 table] Duration 1200ms easeOutExpo; FM stat counter row.
 * [spec 7.7]  Reduced motion: renders final value statically immediately.
 * [design §12.5] aria-label with spelled-out number for screen readers.
 *
 * Props:
 *   from      — start value (default 0)
 *   to        — target value (required)
 *   suffix    — optional suffix string appended after number (e.g. "+", "k")
 *   durationMs — animation duration in ms (default 1200)
 *   label     — accessible label describing what the number represents
 */

import { animate, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { easeOutExpo } from '@/lib/animation/easings';

interface StatCounterProps {
  from?: number;
  to: number;
  suffix?: string;
  durationMs?: number;
  label: string;
}

export function StatCounter({
  from = 0,
  to,
  suffix = '',
  durationMs = 1200,
  label,
}: StatCounterProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // [design §3.2] useInView with once:true — animation triggers only on first viewport entry.
  const inView = useInView(ref, { once: true, margin: '-20%' });

  // FM motion value driving the displayed number. [design §3.2]
  const count = useMotionValue(reducedMotion ? to : from);

  // Round to integer for display (whole numbers look cleaner for counters). [spec 2.5]
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    // [spec 7.7] Reduced motion: show final value immediately without animation.
    if (reducedMotion) {
      count.set(to);
      return;
    }

    if (!inView) return;

    // [design §4 table] Animate from → to when entering viewport.
    const controls = animate(count, to, {
      duration: durationMs / 1000,
      ease: easeOutExpo,
    });

    return () => controls.stop();
  }, [inView, reducedMotion, count, to, durationMs]);

  // Sync display value to motion value updates.
  // We use a DOM ref and a subscription to update the span text directly
  // to avoid re-renders in the hot animation path.
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = `${v}${suffix}`;
      }
    });
    return unsubscribe;
  }, [rounded, suffix]);

  return (
    /*
     * [design §12.5] aria-label spells out the full number for screen readers.
     * Visual display shows abbreviated/formatted value; AT reads the full label.
     */
    <div
      ref={ref}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      {/*
       * [design §12.5] Screen reader text: spells out full number + label.
       * Visually hidden — animated display below provides visual value.
       */}
      <span className="sr-only">{`${to}${suffix ? ` ${suffix.trim()}` : ''} ${label}`}</span>

      {/* Counter number — updated via DOM for performance [spec 2.5] */}
      <span
        ref={displayRef}
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-h1)',
          lineHeight: 'var(--lh-h1)',
          letterSpacing: 'var(--ls-h1)',
          color: 'var(--foreground)',
          fontWeight: 300,
        }}
      >
        {reducedMotion ? `${to}${suffix}` : `${from}${suffix}`}
      </span>

      {/* Label */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-small)',
          color: 'var(--muted-foreground)',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
    </div>
  );
}
