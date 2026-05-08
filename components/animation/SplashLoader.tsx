'use client';

/**
 * SplashLoader — full-viewport boot screen shown only on slow loads.
 * [spec 1.4]    Only appears when page load time exceeds thresholdMs (default 300ms).
 * [spec 7.1.A.1] SplashLoader renders only if load > 300ms.
 * [spec 7.7]    Under prefers-reduced-motion: never mounts (skips to unmounted).
 * [design §4.1] State machine: idle → measuring → visible → exiting → unmounted.
 * [design §2.7] z-index 50 (covers everything during boot).
 *
 * Exit animation: FM opacity fade 320ms easeOutExpo. [design §4 table — splash row]
 * Hard cap: 1500ms max visibility even if readyState never fires. [design §4.1]
 * Unmounts on onAnimationComplete to remove from DOM completely.
 *
 * Loaded via dynamic({ssr:false}) from AnimationProviders — never in initial bundle. [spec 10.4]
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { easeOutExpo } from '@/lib/animation/easings';

type SplashState = 'idle' | 'measuring' | 'visible' | 'exiting' | 'unmounted';

interface SplashLoaderProps {
  /**
   * Load time threshold in ms. If performance.now() at hydration is below this,
   * the splash is skipped entirely. [spec 1.4] Default: 300.
   */
  thresholdMs?: number;
}

/** Hard cap: splash never shows more than this regardless of readyState. [design §4.1] */
const HARD_CAP_MS = 1500;

/** Exit fade duration in ms. [design §4 table] */
const EXIT_DURATION_S = 0.32;

export default function SplashLoader({
  thresholdMs = 300,
}: SplashLoaderProps): React.ReactElement | null {
  const reducedMotion = useReducedMotion();
  const [splashState, setSplashState] = useState<SplashState>('idle');

  useEffect(() => {
    // Under reduced motion: skip splash entirely. [spec 7.7]
    if (reducedMotion) {
      setSplashState('unmounted');
      return;
    }

    setSplashState('measuring');

    // [spec 1.4] performance.now() at hydration boundary — time since page navigation start.
    // If elapsed time is less than threshold, page is fast — skip splash.
    const elapsed = performance.now();
    if (elapsed < thresholdMs) {
      setSplashState('unmounted');
      return;
    }

    // Threshold exceeded — show splash. [design §4.1]
    setSplashState('visible');

    let hardCapTimer: ReturnType<typeof setTimeout> | null = null;

    function triggerExit(): void {
      if (hardCapTimer) {
        clearTimeout(hardCapTimer);
        hardCapTimer = null;
      }
      setSplashState('exiting');
    }

    // [design §4.1] Exit when document is fully loaded.
    if (document.readyState === 'complete') {
      triggerExit();
      return;
    }

    const onLoad = (): void => triggerExit();
    window.addEventListener('load', onLoad, { once: true });

    // [design §4.1] Hard cap — exit after HARD_CAP_MS even if load never fires.
    hardCapTimer = setTimeout(triggerExit, HARD_CAP_MS);

    return () => {
      window.removeEventListener('load', onLoad);
      if (hardCapTimer) clearTimeout(hardCapTimer);
    };
  }, [reducedMotion, thresholdMs]);

  // Do not render during idle, measuring, or after unmount.
  if (splashState === 'idle' || splashState === 'measuring' || splashState === 'unmounted') {
    return null;
  }

  return (
    /*
     * motion.div: renders while visible OR exiting.
     * When state transitions to 'exiting', the animate prop changes to opacity:0,
     * triggering FM's exit animation. onAnimationComplete then fires setSplashState('unmounted').
     * [design §4.1] [spec 1.4]
     *
     * aria-hidden="true" — loading indicator is decorative. [spec 8.7]
     * z-index 50 — above all content but below CustomCursor (60). [design §2.7]
     */
    <motion.div
      initial={{ opacity: 1 }}
      animate={splashState === 'exiting' ? { opacity: 0 } : { opacity: 1 }}
      transition={{
        duration: EXIT_DURATION_S,
        ease: easeOutExpo,
      }}
      onAnimationComplete={() => {
        if (splashState === 'exiting') {
          setSplashState('unmounted');
        }
      }}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--background)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/*
       * Minimal loading indicator — small cobalto dot.
       * Decorative; aria-hidden on parent covers this element. [spec 8.7]
       */}
      <span
        style={{
          display: 'block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-base)',
          opacity: 0.8,
        }}
      />
    </motion.div>
  );
}
