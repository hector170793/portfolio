'use client';

/**
 * Lenis smooth scroll provider.
 * [design §4.5] — duration 1.2s, easeOutExpo easing function form.
 * [spec 10.4]  — loaded via dynamic({ssr:false}) from [locale]/layout.tsx.
 * [spec 7.7]   — NOT initialized when prefers-reduced-motion:reduce.
 * [design §4.6] — calls syncLenisToGSAP on mount to wire GSAP ticker.
 *
 * Tree shaken from initial bundle; appears only in async chunk.
 *
 * NOTE: file extension is .tsx (not .ts) because the LenisProvider
 * component returns JSX. Biome and TypeScript both require .tsx for JSX.
 * The design spec listed lib/lenis.ts — deviation is intentional and safe.
 */

import Lenis from 'lenis';
import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { syncLenisToGSAP } from '@/lib/animation/gsap-init';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LenisContext = createContext<Lenis | null>(null);

/**
 * useLenis — returns the active Lenis instance, or null if not mounted
 * (e.g. on SSR, or when reduced motion is active). [design §4.5]
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface LenisProviderProps {
  children: ReactNode;
}

/**
 * LenisProvider — mounts Lenis smooth scroll on the page.
 * Must be a direct ancestor of all scroll-dependent components.
 * Conditionally skips init when the user prefers reduced motion. [spec 7.7]
 */
export function LenisProvider({ children }: LenisProviderProps): ReactNode {
  const prefersReducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // [spec 7.4] — Lenis disabled under prefers-reduced-motion:reduce.
    if (prefersReducedMotion) return;

    // [design §4.5] — Lenis config: easeOutExpo function form.
    // smoothTouch:false preserves native iOS momentum scroll. [design §4.5 rationale]
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => 1 - 2 ** (-10 * t), // easeOutExpo [design §4.5]
      smoothWheel: true,
      // syncTouch:false — native iOS momentum scroll preferred over Lenis interpolation.
      // In Lenis 1.x, syncTouch=false is the default (no smooth-touch emulation).
      // Design spec §4.5: smoothTouch:false / syncTouch:false — same intent. [design §4.5]
      syncTouch: false,
    });

    lenisRef.current = lenis;

    // Wire Lenis scroll position into GSAP ticker. [design §4.6]
    syncLenisToGSAP(lenis);

    // Cleanup: destroy Lenis and remove listeners on unmount or when
    // reduced-motion preference changes. [design §4.5]
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  return <LenisContext.Provider value={lenisRef.current}>{children}</LenisContext.Provider>;
}
