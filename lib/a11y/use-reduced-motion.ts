'use client';

/**
 * useReducedMotion — SSR-safe re-export of Framer Motion's hook.
 * [design §12.3] — wraps FM useReducedMotion with `?? false` default.
 *
 * FM's hook returns `null` during SSR (no window.matchMedia available).
 * The `?? false` default ensures animations run on first server render
 * (no-motion fallback would suppress all animation including hydration),
 * then the correct value hydrates from the client's media query.
 *
 * Consumers: LenisProvider (skips init), animation components (static fallback).
 * [spec 7.7] — prefers-reduced-motion:reduce disables ALL animations.
 */

import { useReducedMotion as fmUseReducedMotion } from 'framer-motion';

export const useReducedMotion = (): boolean => fmUseReducedMotion() ?? false;
