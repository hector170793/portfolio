'use client';

/**
 * useCursorEnabled — returns true only when BOTH conditions hold:
 *   1. pointer: fine (precision pointing device — mouse/trackpad, NOT touch)
 *   2. prefers-reduced-motion: no-preference (user has not requested reduced motion)
 *
 * [spec 7.6] — custom cursor MUST be enabled only when both conditions are true.
 * [spec 8.7] — cursor element has aria-hidden="true".
 *
 * SSR-safe: returns false on server (no window.matchMedia). This intentionally
 * ensures the cursor is never rendered during SSR, which is correct — cursor
 * position requires a live browser environment.
 */

import { useEffect, useState } from 'react';

const POINTER_FINE = '(pointer: fine)';
const NO_REDUCED_MOTION = '(prefers-reduced-motion: no-preference)';

export function useCursorEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const pointerMedia = window.matchMedia(POINTER_FINE);
    const motionMedia = window.matchMedia(NO_REDUCED_MOTION);

    const update = (): void => {
      setEnabled(pointerMedia.matches && motionMedia.matches);
    };

    update(); // Sync initial state

    pointerMedia.addEventListener('change', update);
    motionMedia.addEventListener('change', update);

    return () => {
      pointerMedia.removeEventListener('change', update);
      motionMedia.removeEventListener('change', update);
    };
  }, []);

  return enabled;
}
