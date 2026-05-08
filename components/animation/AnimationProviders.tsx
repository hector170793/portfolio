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
 * [spec 10.4] — GSAP, Lenis, SplashLoader, CustomCursor must NOT appear in the
 * initial bundle. The `dynamic({ssr:false})` calls here ensure they are only
 * loaded in async chunks after first paint.
 *
 * [design §3.5] — JSX order: LenisProvider wraps children, GrainOverlay is
 * a sibling after the main content tree.
 * [task 6B.7] — SplashLoader renders first (covers boot), CustomCursor renders
 * last (always above content, z-index 60). [design §2.7]
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

/**
 * SplashLoader — full-viewport boot screen for slow loads (> 300ms).
 * [spec 1.4] [spec 7.1.A.1] [design §4.1]
 * Renders FIRST in the tree — covers all content during boot. z-index 50.
 */
const SplashLoader = dynamic(() => import('@/components/animation/SplashLoader'), {
  ssr: false,
  loading: () => null,
});

/**
 * CustomCursor — replaces OS cursor on desktop/mouse devices.
 * [spec 7.5.E.1] [spec 7.6] [design §3.1]
 * Renders LAST — always above content. z-index 60. [design §2.7]
 * Only mounts when useCursorEnabled() is true (pointer:fine + no reduced-motion).
 */
const CustomCursor = dynamic(() => import('@/components/animation/CustomCursor'), {
  ssr: false,
  loading: () => null,
});

interface AnimationProvidersProps {
  children: ReactNode;
}

/**
 * Shell that wraps app content with Lenis, GrainOverlay, SplashLoader, and CustomCursor.
 * Used in [locale]/layout.tsx inside ThemeProvider.
 *
 * Render order (by z-index intent):
 *   1. SplashLoader (z:50) — shown during boot, unmounts after load
 *   2. LenisProvider > children — page content
 *   3. GrainOverlay (z:0) — fixed decorative texture
 *   4. CustomCursor (z:60) — floating above everything [design §2.7]
 */
export function AnimationProviders({ children }: AnimationProvidersProps): ReactNode {
  return (
    <>
      {/*
       * SplashLoader: covers boot sequence. Placed before children so it
       * renders above content in DOM order (plus explicit z-index 50). [task 6B.7]
       * Unmounts automatically after load or 1500ms cap. [design §4.1]
       */}
      <SplashLoader />

      <LenisProvider>{children}</LenisProvider>

      {/*
       * GrainOverlay is outside LenisProvider — no scroll dependency.
       * Positioned after children so it renders above content via CSS z-index.
       * [design §3.1] [spec 8.7]
       */}
      <GrainOverlay />

      {/*
       * CustomCursor: always last in tree — sits above all content. [design §2.7]
       * Handles its own mounting guard (useCursorEnabled). [spec 7.6]
       * aria-hidden="true" on the cursor element itself. [spec 8.7]
       */}
      <CustomCursor />
    </>
  );
}
