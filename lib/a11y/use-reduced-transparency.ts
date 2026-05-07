'use client';

/**
 * useReducedTransparency — matchMedia hook for prefers-reduced-transparency.
 * [design §12.4] [spec 8.9] — CSS already handles via media query in globals.css;
 * this hook is for JS-driven blur or opacity effects that can't rely on CSS vars.
 *
 * SSR-safe: returns false on server (no window.matchMedia).
 * Adds/removes event listener on change so the value stays in sync.
 */

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-transparency: reduce)';

export function useReducedTransparency(): boolean {
  const [value, setValue] = useState(false);

  useEffect(() => {
    // Guard: matchMedia is not available in SSR or non-browser environments.
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia(QUERY);
    setValue(media.matches);

    const handler = (e: MediaQueryListEvent): void => setValue(e.matches);
    media.addEventListener('change', handler);

    return () => media.removeEventListener('change', handler);
  }, []);

  return value;
}
