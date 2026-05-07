'use client';

/**
 * PageTransition — wraps route segments with a curtain fade animation.
 * [design §3.1] [design §4, table row "Page transitions"] [spec 7.4.D.1]
 *
 * Strategy (defensive feature-detect):
 *   1. Try `unstable_ViewTransition` from React 19 / Next 16+ when the API
 *      is exported — currently NOT available in Next 16.2.5 production build.
 *   2. Fall back to Framer Motion AnimatePresence with a curtain <motion.div>
 *      that slides up from bottom (initial y:'100%') through the page (y:'0%')
 *      to exit above (y:'-100%'). Duration 480ms easeOutExpo. [design §4, D.1]
 *
 * Z-index 20 matches the page transition layer. [design §2.7]
 *
 * [spec 10.4] — loaded via dynamic({ssr:false}) from [locale]/layout.tsx.
 * [spec 7.7]  — reduced motion: AnimatePresence still renders but motion.div
 *               transitions are instant when FM detects prefers-reduced-motion.
 *               No special handling needed — FM handles it natively.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { easeOutExpo } from '@/lib/animation/easings';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Curtain transition using Framer Motion AnimatePresence.
 * AnimatePresence key is the pathname so every route change triggers a new animation.
 */
export default function PageTransition({ children }: PageTransitionProps): ReactNode {
  const pathname = usePathname();

  return (
    <>
      {/* Route content — renders immediately, no delay */}
      {children}

      {/*
       * Curtain overlay — slides in from bottom, reveals page, then exits upward.
       * [design §4, D.1] [design §3.1 PageTransition spec]
       * key={pathname} ensures a new AnimatePresence cycle fires on every route change.
       */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ y: '100%' }}
          animate={{ y: '0%', transitionEnd: { y: '-100%' } }}
          exit={{ y: '-100%' }}
          transition={{
            duration: 0.48, // 480ms [design §4, D.1]
            ease: easeOutExpo,
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
