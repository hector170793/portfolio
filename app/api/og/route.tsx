/**
 * Dynamic OG image route — app/api/og/route.tsx
 * [spec 9.2] OG images MUST be dynamically generated via this Edge Runtime route.
 * [design §10.2] Edge runtime; @vercel/og ImageResponse; 1200×630.
 * [design §11.5] Cache-Control: public, immutable, no-transform, max-age=31536000.
 *
 * Template visual:
 * - Background: #0A0A0A (off-black)
 * - Accent: #3D6BE0 (cobalto AA-safe on dark — design §2.1, §cobalt-base-dark-adjustment)
 * - Title: Fraunces serif (fetched from Google Fonts CDN; Georgia fallback on fetch error)
 * - Subtitle: Inter-style sans (system fallback)
 * - Footer: URL mono label — hector-reyes.work
 * - Cobalto bar at top and bottom
 *
 * Query params:
 * - title    (string, required) — main heading
 * - subtitle (string, optional) — secondary text
 * - type     ('home' | 'work' | 'journal' | 'contact', optional) — for future type-specific styling
 * - slug     (string, optional) — passed through, unused visually in v1
 */

import { ImageResponse, type ImageResponseOptions } from '@vercel/og';

export const runtime = 'edge';

// [design §11.5] OG images are parameterized; params define cache identity.
// Cache-Control set explicitly in response headers.
const CACHE_CONTROL = 'public, immutable, no-transform, max-age=31536000';

// Brand colors — [design §2.1, §cobalt-base-dark-adjustment]
const BG = '#0A0A0A';
const COBALT = '#3D6BE0'; // AA-safe on dark bg (6.51:1 ratio — design §2.1)
const FG_PRIMARY = '#EDE7DA'; // warm white on dark
const FG_MUTED = '#9A9489'; // muted on dark
const SITE_LABEL = 'hector-reyes.work';

/**
 * Attempt to fetch Fraunces Variable from Google Fonts CDN.
 * Falls back gracefully to system serif (Georgia) if the fetch fails.
 * [design §10.2] Font strategy — Edge environments cannot use next/font runtime.
 */
async function fetchFrauncesFont(): Promise<ArrayBuffer | null> {
  try {
    // Google Fonts CSS2 API: fetch the static TTF for Fraunces weight 700.
    // We use the direct font file URL for binary fetch instead of the CSS API.
    const url =
      'https://fonts.gstatic.com/s/fraunces/v31/6NUh8FyLNQOQZAnv9bYEvDiIdE9Eqcbzs7Uh0JlvlUhfYmLg.ttf';
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    // Network error or timeout — use system serif fallback.
    return null;
  }
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') ?? 'Hector Reyes Pérez';
  const subtitle = searchParams.get('subtitle') ?? 'Senior Full-Stack Engineer & Frontend Lead';
  // type and slug are available for future type-specific styling
  // const type = searchParams.get('type');
  // const slug = searchParams.get('slug');

  // Attempt Fraunces font fetch — fallback is handled via fontFamily stack.
  const frauncesData = await fetchFrauncesFont();

  const fonts: ImageResponseOptions['fonts'] = frauncesData
    ? [
        {
          name: 'Fraunces',
          data: frauncesData,
          weight: 700,
          style: 'normal',
        },
      ]
    : [];

  // Font family: use Fraunces if loaded, else system serif Georgia.
  const displayFont = frauncesData ? 'Fraunces, Georgia, serif' : 'Georgia, serif';

  const image = new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BG,
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top cobalto accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: COBALT,
        }}
      />

      {/* Bottom cobalto accent bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '6px',
          backgroundColor: COBALT,
        }}
      />

      {/* Subtle noise/grain texture via SVG feTurbulence */}
      {/* @vercel/og supports SVG elements including filters */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
        }}
      >
        {/* [design §12.5] aria-hidden — decorative grain texture, no semantic meaning */}
        <svg
          aria-hidden="true"
          width="1200"
          height="630"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="1200" height="630" filter="url(#noise)" />
        </svg>
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px 80px 96px',
        }}
      >
        {/* Cobalto small label / eyebrow */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '16px',
            color: COBALT,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          {SITE_LABEL}
        </div>

        {/* Main title — Fraunces display serif */}
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: title.length > 40 ? '52px' : '68px',
            lineHeight: 1.04,
            color: FG_PRIMARY,
            letterSpacing: '-0.025em',
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Subtitle — sans-serif */}
        {subtitle && (
          <div
            style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: '28px',
              color: FG_MUTED,
              letterSpacing: '-0.005em',
              maxWidth: '800px',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Footer bar — cobalto divider + URL */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 96px 40px 96px',
          borderTop: `1px solid #2A2724`,
          paddingTop: '24px',
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            color: FG_MUTED,
            letterSpacing: '0.04em',
          }}
        >
          {SITE_LABEL}
        </div>

        {/* Cobalto dot accent */}
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: COBALT,
          }}
        />
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );

  // [design §11.5] Cache-Control: params determine cache identity (URL includes params).
  const headers = new Headers(image.headers);
  headers.set('Cache-Control', CACHE_CONTROL);

  return new Response(image.body, {
    status: image.status,
    headers,
  });
}
