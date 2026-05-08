'use client';

/**
 * CustomCursor — replaces the OS cursor on desktop/mouse devices.
 * [spec 7.5.E.1] idle: 8px circle; hover data-cursor target: 32px + label.
 * [spec 7.6]     Only mounts when useCursorEnabled() returns true (pointer:fine + no reduced-motion).
 * [spec 8.7]     aria-hidden="true" on the cursor element.
 * [design §2.7]  z-index 60 (always above content).
 * [design §3.1]  mix-blend-mode: difference.
 *
 * Position: translate3d via requestAnimationFrame — no style.left/top (avoids layout thrash).
 * Cursor label: reads data-cursor="..." attribute from hovered element (walk up to 5 ancestors).
 *
 * Loaded via dynamic({ssr:false}) from AnimationProviders — never in initial bundle. [spec 10.4]
 * Hides OS cursor via `cursor: none` on body when mounted; restores on unmount.
 */

import { useEffect, useRef, useState } from 'react';
import { useCursorEnabled } from '@/lib/a11y/use-cursor-enabled';

/** Max ancestors to walk when looking for data-cursor attribute. */
const MAX_ANCESTOR_DEPTH = 5;

function findCursorLabel(target: Element | null): string | null {
  let current: Element | null = target;
  let depth = 0;
  while (current && depth < MAX_ANCESTOR_DEPTH) {
    const label = current.getAttribute('data-cursor');
    if (label) return label;
    current = current.parentElement;
    depth++;
  }
  return null;
}

/** Idle cursor size (px). [spec 7.5.E.1] */
const IDLE_SIZE = 8;
/** Hover cursor size (px). [spec 7.5.E.1] */
const HOVER_SIZE = 32;

export default function CustomCursor(): React.ReactElement | null {
  const enabled = useCursorEnabled();

  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const [label, setLabel] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Hide OS cursor while custom cursor is active. Restores on cleanup.
    document.body.style.cursor = 'none';

    function scheduleDraw(x: number, y: number): void {
      posRef.current = { x, y };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = cursorRef.current;
        if (!el) return;
        el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      });
    }

    function onMouseMove(e: MouseEvent): void {
      scheduleDraw(e.clientX, e.clientY);
    }

    function onMouseOver(e: MouseEvent): void {
      const target = e.target instanceof Element ? e.target : null;
      const found = findCursorLabel(target);
      setLabel(found);
      setIsHovering(found !== null);
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled]);

  // Do NOT render when cursor should not be active.
  if (!enabled) return null;

  const size = isHovering ? HOVER_SIZE : IDLE_SIZE;

  return (
    /*
     * aria-hidden="true" — purely decorative pointer visual. [spec 8.7]
     * pointer-events: none — must not intercept clicks or hover events.
     * position: fixed + z-index 60 — floats above all content. [design §2.7]
     * mix-blend-mode: difference — inverts against underlying color. [design §3.1]
     * will-change: transform — hint to compositor for promoted layer.
     */
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--foreground)',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
        zIndex: 60,
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Translate origin: cursor top-left is already at (0,0); shift by -50% to center on pointer.
        translate: `-50% -50%`,
        transition: `width 200ms cubic-bezier(0.22,1,0.36,1), height 200ms cubic-bezier(0.22,1,0.36,1)`,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      {isHovering && label && (
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-inter, sans-serif)',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--background)',
            mixBlendMode: 'difference',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
