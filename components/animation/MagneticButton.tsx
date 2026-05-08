'use client';

/**
 * MagneticButton — wraps children and applies a magnetic pull toward the cursor.
 * [spec 7.5.E.2]  button moves ≤ 30% toward cursor within a 30px radius.
 * [design §3.1]   Math: dx=pointerX-centerX; dy=pointerY-centerY; dist=hypot(dx,dy).
 *                 If dist <= radius: translate(dx*strength, dy*strength).
 * [design §4.3]   FM spring stiffness:220, damping:22 on pointerleave reset.
 * [spec 7.7]      No-op under useReducedMotion() — static pass-through.
 * [spec 8.7]      aria-hidden on wrapper div (design §12.5 — wrapper is transform host only).
 *
 * Inner element keeps full semantic role (button, anchor, etc.) — this wrapper
 * only applies a CSS transform. No role or tabIndex manipulation.
 */

import { motion, useSpring } from 'framer-motion';
import { type PointerEvent, type ReactNode, useRef } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';

interface MagneticButtonProps {
  children: ReactNode;
  /** Fraction of delta distance to translate. Default: 0.3. [design §4.3] */
  strength?: number;
  /** Radius in px within which the magnetic effect is active. Default: 30. [design §4.3] */
  radius?: number;
  className?: string;
}

/** FM spring config for snap-back on pointer leave. [design §4.3] */
const SPRING = { stiffness: 220, damping: 22 };

export function MagneticButton({
  children,
  strength = 0.3,
  radius = 30,
  className,
}: MagneticButtonProps): React.ReactElement {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // FM springs for smooth position tracking. Start at 0,0 (origin).
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>): void {
    if (reducedMotion) return;
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    // [design §4.3] Only translate within the radius.
    if (dist <= radius) {
      x.set(dx * strength);
      y.set(dy * strength);
    }
  }

  function handlePointerLeave(): void {
    // Spring interpolates back to origin. [design §4.3]
    x.set(0);
    y.set(0);
  }

  // Under reduced motion: render children with no wrapping transform. [spec 7.7]
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    /*
     * motion.div applies the spring-driven transform.
     * aria-hidden is NOT set here — the wrapper is a layout host; semantic
     * children (button/anchor) inside must remain accessible. [design §12.5]
     */
    <motion.div
      ref={wrapperRef}
      className={className}
      style={{ x, y, display: 'inline-block' }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  );
}
