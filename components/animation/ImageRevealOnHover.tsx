'use client';

/**
 * ImageRevealOnHover — signature feature: masked image appears following cursor within card.
 * [spec 1.6]    Image reveals via clip-path expand, follows cursor position within container.
 *                Disabled on pointer:coarse OR prefers-reduced-motion:reduce.
 * [spec 7.2.B.1] Image reveal on hover (SelectedWork card hover).
 * [spec 7.5.E.1] Sets data-cursor="view" on pointer enter — CustomCursor reads this for context.
 * [design §3.1]  clip-path: circle(0 at x y) → circle(360px at x y), 420ms cubic-bezier(0.22,1,0.36,1).
 * [design §4.2]  Math: x=e.clientX-rect.left, y=e.clientY-rect.top; throttled in rAF.
 * [spec 8.7]    Image overlay element has aria-hidden="true" (decorative reveal layer).
 *
 * Interaction disabled when useCursorEnabled() returns false (touch / reduced-motion).
 * On disable: container is still navigable; image reveal simply doesn't appear.
 *
 * Props:
 *   src      — image URL for the reveal layer
 *   alt      — accessible alt text (image is decorative in context; caller decides)
 *   children — the card content rendered behind/below the reveal layer
 */

import Image from 'next/image';
import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { useCursorEnabled } from '@/lib/a11y/use-cursor-enabled';

/** Reveal clip-path final radius in px. [design §3.1] */
const REVEAL_RADIUS = 360;
/** Exit clip-path radius — effectively hidden. */
const HIDE_RADIUS = 0;
/** Transition spec for clip-path animation. [design §3.1] */
const CLIP_TRANSITION = '420ms cubic-bezier(0.22,1,0.36,1)';
/** Scale applied to image on hover enter. [design §3.1] */
const HOVER_SCALE = '1.05';

interface ImageRevealOnHoverProps {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
}

export function ImageRevealOnHover({
  src,
  alt,
  children,
  className,
}: ImageRevealOnHoverProps): React.ReactElement {
  const cursorEnabled = useCursorEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  // Track latest pointer position for rAF flush.
  const pointerRef = useRef({ x: 0, y: 0 });
  const isInsideRef = useRef(false);

  // Set clip-path on image wrapper directly (no React re-render in hot path).
  const applyClip = useCallback((x: number, y: number, radius: number): void => {
    const el = imageWrapperRef.current;
    if (!el) return;
    el.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
  }, []);

  useEffect(() => {
    if (!cursorEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Capture container as non-null (null guard is above). Closures below capture this ref.
    // TypeScript strict mode loses narrowing inside nested function declarations, so we
    // re-reference `el` (guaranteed non-null at this scope) via closure over the local `el`.
    const el: HTMLDivElement = container;

    // Schedule rAF-throttled clip-path update. [design §4.2]
    function scheduleUpdate(): void {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (isInsideRef.current) {
          applyClip(pointerRef.current.x, pointerRef.current.y, REVEAL_RADIUS);
        }
      });
    }

    function onPointerMove(e: PointerEvent): void {
      const rect = el.getBoundingClientRect();
      // [design §4.2] Compute pointer position relative to container.
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      scheduleUpdate();
    }

    function onPointerEnter(e: PointerEvent): void {
      isInsideRef.current = true;
      // Set data-cursor="view" for CustomCursor to read. [spec 7.5.E.1] [spec 7.2.B.3]
      el.setAttribute('data-cursor', 'view');

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointerRef.current = { x, y };

      // Reveal: expand clip-path from pointer position. [design §3.1]
      const imgEl = imageWrapperRef.current;
      if (imgEl) {
        imgEl.style.transition = `clip-path ${CLIP_TRANSITION}`;
        imgEl.style.transform = `scale(${HOVER_SCALE})`;
        // Trigger next frame to ensure transition applies after reset.
        requestAnimationFrame(() => {
          applyClip(x, y, REVEAL_RADIUS);
        });
      }
    }

    function onPointerLeave(): void {
      isInsideRef.current = false;
      el.removeAttribute('data-cursor');

      const imgEl = imageWrapperRef.current;
      if (imgEl) {
        // Collapse clip-path back to last known pointer position (natural exit feel).
        imgEl.style.clipPath = `circle(${HIDE_RADIUS}px at ${pointerRef.current.x}px ${pointerRef.current.y}px)`;
        imgEl.style.transform = 'scale(1)';
      }
    }

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerenter', onPointerEnter, { passive: true });
    el.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerenter', onPointerEnter);
      el.removeEventListener('pointerleave', onPointerLeave);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [cursorEnabled, applyClip]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Card content — always visible. Navigation still works on touch. */}
      {children}

      {/*
       * Reveal image layer — sits above children via absolute positioning.
       * clip-path updated directly via DOM; no React re-renders in hot path.
       * aria-hidden="true" — decorative hover effect. [spec 8.7]
       * Disabled (not rendered) when cursorEnabled is false (touch/reduced-motion). [spec 1.6]
       */}
      {cursorEnabled && (
        <div
          ref={imageWrapperRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            // Initial state: fully hidden (zero-radius circle). [design §4.2]
            clipPath: `circle(${HIDE_RADIUS}px at 50% 50%)`,
            transition: `clip-path ${CLIP_TRANSITION}, transform 420ms cubic-bezier(0.22,1,0.36,1)`,
            pointerEvents: 'none',
            zIndex: 1,
            willChange: 'clip-path, transform',
            transformOrigin: 'center center',
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}
