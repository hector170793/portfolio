'use client';

/**
 * GrainOverlay — fixed full-viewport SVG noise texture.
 * [design §3.1] — feTurbulence SVG filter, opacity from --grain-opacity CSS var.
 * [spec 8.7]   — aria-hidden="true" (decorative, no accessible meaning).
 * [spec 8.9]   — opacity is 0 under prefers-reduced-transparency (CSS handles it).
 * [design §2.2] — --grain-opacity: 0.05 dark / 0.04 light, 0 under reduced-transparency.
 *
 * Intentionally lightweight: no JS state, no motion deps. Opacity is driven
 * entirely by the CSS variable set in globals.css, which already includes the
 * reduced-transparency media query override. This component only needs to mount.
 *
 * Loaded via dynamic({ssr:false}) from [locale]/layout.tsx. [spec 10.4]
 */

const FILTER_ID = 'portfolio-grain-filter';

export default function GrainOverlay(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        // opacity driven by CSS var; CSS handles reduced-transparency automatically.
        // [design §2.2] [spec 8.9]
        opacity: 'var(--grain-opacity, 0.05)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <filter
        id={FILTER_ID}
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        {/*
         * feTurbulence generates the noise pattern.
         * baseFrequency 0.65 gives a fine-grain look matching the editorial aesthetic.
         * numOctaves 3 adds depth without excessive compute.
         * type="fractalNoise" is smoother than "turbulence" for overlay use.
         */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves={3}
          stitchTiles="stitch"
        />
      </filter>
      {/* Full-viewport rect with the noise filter applied */}
      <rect width="100%" height="100%" filter={`url(#${FILTER_ID})`} />
    </svg>
  );
}
