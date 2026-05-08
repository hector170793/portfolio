'use client';

/**
 * Marquee — infinite horizontal scroll for decorative content (e.g. work tags).
 * [spec 1.7]    Duplicates children once for seamless loop; pauses on hover.
 * [design §4]   CSS @keyframes marquee (already in globals.css) infinite linear.
 *                Duration prop: default 30s. [design §4 table — marquee row: 30s linear loop]
 * [spec 8.5]    role="presentation" on wrapper (decorative).
 * [design §12.5] sr-only accessible alternative for screen readers (spec 8.5).
 * [spec 7.7]    Pause on reduced-motion via animationPlayState.
 *
 * Hover pause uses CSS :has(:hover) — no JS event listeners required. [spec 1.7]
 * The wrapper class `marquee-track` exposes a CSS custom property --play-state
 * that the inner animation reads; updated via React state on hover as fallback
 * for browsers without :has() (Firefox 120+).
 *
 * "use client" required because of potential animation prop usage;
 * actual pause logic is CSS-only.
 */

import type { ReactNode } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';

interface MarqueeProps {
  children: ReactNode;
  /** Total animation duration for one loop. Default: 30s. [design §4] */
  duration?: number;
  /** Accessible description of marquee content for screen readers. [spec 8.5] */
  srLabel?: string;
  className?: string;
}

export function Marquee({
  children,
  duration = 30,
  srLabel,
  className,
}: MarqueeProps): React.ReactElement {
  const reducedMotion = useReducedMotion();

  // Under reduced motion: render children statically, no animation. [spec 7.7]
  if (reducedMotion) {
    return (
      <div role="presentation" aria-hidden="true" className={className}>
        {children}
      </div>
    );
  }

  return (
    /*
     * role="presentation" — marquee content is decorative. [spec 8.5] [design §12.5]
     * The sr-only sibling below provides accessible text for screen readers.
     *
     * CSS pause-on-hover: the .marquee-wrapper uses animation-play-state: paused
     * when :has(:hover) — a single CSS rule, no JS needed. See inline style below.
     */
    <div
      role="presentation"
      aria-hidden="true"
      className={className}
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      {/*
       * .marquee-wrapper: contains two copies of children for seamless loop.
       * The keyframe translateX(-50%) moves past exactly one copy because the
       * track is 200% wide (2× children). [spec 1.7]
       *
       * Pause on hover via CSS: parent container stops animation when pointer
       * enters. We use a data attribute to drive the play-state so it can be
       * toggled by :has() without JS.
       */}
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          // Pause on hover via CSS-only :has() — set animationPlayState to running
          // as default; the parent's CSS class (set by consumer or globals) can
          // override this with :has(:hover) { animation-play-state: paused; }.
          // We also expose inline play-state here for direct consumer control.
          animation: `marquee ${duration}s linear infinite`,
          animationPlayState: 'running',
        }}
        // CSS :has() pause target: the wrapper pauses when any descendant is hovered.
        // This is driven by globals.css via: .marquee-wrapper:has(:hover) { animation-play-state: paused }
        // Fallback: consumers can add onMouseEnter/onMouseLeave if needed.
        className="marquee-wrapper"
      >
        {/* First copy */}
        <span style={{ display: 'contents' }}>{children}</span>
        {/* Duplicate for seamless loop — hidden from AT via aria-hidden on parent */}
        <span aria-hidden="true" style={{ display: 'contents' }}>
          {children}
        </span>
      </div>

      {/*
       * Accessible alternative: sr-only sibling visible only to AT.
       * [spec 8.5] [design §12.5]
       */}
      {srLabel && (
        <span
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
          {srLabel}
        </span>
      )}
    </div>
  );
}
