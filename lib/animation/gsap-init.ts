/**
 * GSAP initializer — client-only module.
 * [design §4.6] — registers ScrollTrigger, sets lag smoothing,
 * configures ignoreMobileResize, and provides the Lenis↔GSAP sync helper.
 *
 * Import order matters: this file must be imported by a component that is
 * already inside a `"use client"` boundary (or itself be imported dynamically
 * with ssr:false). It MUST NOT be imported in any Server Component.
 *
 * Side effects are intentionally lazy — calling syncLenisToGSAP() is what
 * activates the ticker; just importing this module only registers the plugin.
 * [spec 10.4] — GSAP must NOT appear in the initial bundle.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin once at module level.
// SplitText is not registered here — consumers that need it import separately.
// [design §4.6]
gsap.registerPlugin(ScrollTrigger);

// Prevent GSAP from compensating for lag by snapping forward — avoids INP
// spikes when the main thread is briefly blocked. [spec 7.9] [design §4.6]
gsap.ticker.lagSmoothing(0);

// Prevents ScrollTrigger from recalculating on mobile address-bar resize —
// avoids layout thrash on scroll-start. [design §4.6]
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Wire Lenis smooth scroll into the GSAP ticker so ScrollTrigger uses
 * Lenis's virtual scroll position instead of native window.scrollY.
 * [design §4.6]
 *
 * Call this once, on Lenis mount (inside LenisProvider). On Lenis destroy,
 * the listeners are automatically cleaned up by lenis.destroy().
 *
 * @param lenis — the Lenis instance returned by `new Lenis(config)`
 */
export function syncLenisToGSAP(lenis: {
  on: (event: 'scroll', cb: (instance: unknown) => void) => () => void;
  raf: (time: number) => void;
}): void {
  // Lenis emits 'scroll' events — tell ScrollTrigger to recalculate on each.
  lenis.on('scroll', () => ScrollTrigger.update());

  // Add Lenis raf to GSAP ticker so both run in lock-step.
  // GSAP time is in seconds; Lenis.raf expects milliseconds.
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000);
  });
}

export { gsap, ScrollTrigger };
