'use client';

/**
 * PageTransition — wraps route segments with a quick opacity fade.
 * [design §3.1] [design §4, table row "Page transitions"] [spec 7.4.D.1]
 *
 * Strategy: subtle opacity fade overlay on every route change.
 *   - Overlay fades in to ~85% bg cover, then fades out
 *   - Total duration 320ms (peak at ~150ms)
 *   - Refined / editorial — no full vertical curtain
 *
 * Why opacity fade vs full curtain: the original 480ms vertical curtain
 * covered 100% of viewport for half a second on every navigation, which
 * felt heavy. A brief opacity fade to ~85% gives the visual cue that a
 * transition happened without locking the user out of perceiving the
 * destination content immediately.
 *
 * Future upgrade path: when Next 16's unstable_ViewTransition stabilizes,
 * swap to native View Transitions API for the smoothest experience
 * (browser-managed snapshot + crossfade).
 *
 * Z-index 20 matches the page transition layer. [design §2.7]
 *
 * [spec 10.4] Loaded via dynamic({ssr:false}) from [locale]/layout.tsx.
 * [spec 7.7]  Reduced motion: FM detects prefers-reduced-motion and runs
 *             transitions instantly — no special handling needed.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps): ReactNode {
  const pathname = usePathname();

  return (
    <>
      {/* Route content — renders immediately, overlay sits above it */}
      {children}

      {/*
       * Opacity-fade overlay. Keyframes: 0 → 0.85 → 0 over 320ms.
       * key={pathname} forces a new AnimatePresence cycle per route change.
       */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.95, 0] }}
          transition={{
            duration: 0.4,
            times: [0, 0.5, 1],
            ease: 'easeInOut',
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--background)',
            zIndex: 20, // page transition curtain layer [design §2.7]
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </AnimatePresence>
    </>
  );
}
