'use client';

/**
 * AnimationProviders — thin Client Component shell for animation-related
 * dynamic imports. Required because Next 16 Turbopack forbids `dynamic({ssr:false})`
 * in Server Components (including async Server Components like [locale]/layout.tsx).
 *
 * This component is the only place `dynamic({ ssr: false })` is used for
 * animation providers. It is itself imported normally (not dynamically) in
 * [locale]/layout.tsx — its `"use client"` boundary is the isolation point.
 *
 * [spec 10.4] — GSAP, Lenis (and their deps) must NOT appear in the initial
 * bundle. The `dynamic({ssr:false})` calls here ensure Lenis and GrainOverlay
 * are only loaded in async chunks after first paint.
 *
 * [design §3.5] — JSX order: LenisProvider wraps children, GrainOverlay is
 * a sibling after the main content tree.
 */

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

/** Lenis smooth scroll. Skips init under prefers-reduced-motion. [design §4.5] */
const LenisProvider = dynamic(
  () => import('@/lib/lenis').then((m) => ({ default: m.LenisProvider })),
  { ssr: false },
);

/**
 * Fixed full-viewport SVG grain texture. CSS var drives opacity.
 * [design §3.1] [spec 8.7] aria-hidden inside the component.
 */
const GrainOverlay = dynamic(() => import('@/components/animation/GrainOverlay'), { ssr: false });

interface AnimationProvidersProps {
  children: ReactNode;
}

/**
 * Shell that wraps app content with Lenis and renders GrainOverlay.
 * Used in [locale]/layout.tsx inside ThemeProvider.
 */
export function AnimationProviders({ children }: AnimationProvidersProps): ReactNode {
  return (
    <>
      <LenisProvider>{children}</LenisProvider>
      {/*
       * GrainOverlay is outside LenisProvider — no scroll dependency.
       * Positioned after children so it renders above content via CSS z-index.
       * [design §3.1] [spec 8.7]
       */}
      <GrainOverlay />
    </>
  );
}
