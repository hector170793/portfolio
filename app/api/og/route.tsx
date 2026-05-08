/**
 * Dynamic OG image route — app/api/og/route.tsx
 * [spec 9.2] OG images MUST be dynamically generated via this Edge Runtime route.
 * [design §10.2] Edge runtime; ImageResponse; 1200×630.
 * [design §11.5] Cache-Control: public, immutable, no-transform, max-age=31536000.
 *
 * Uses Next.js 16 native `next/og` (replaces deprecated `@vercel/og`).
 *
 * Font strategy: Georgia (system serif). Fraunces CDN fetch was causing
 * intermittent Edge-runtime crashes ("Empty reply from server") — deferred
 * to a follow-up once we have a stable baseline. Georgia is a quality
 * editorial serif on macOS/Windows/iOS and renders cleanly across the
 * platforms that show OG previews (LinkedIn, Twitter, Slack, etc.).
 *
 * Satori (engine behind ImageResponse) only supports a SUBSET of CSS:
 * - Use explicit top/left/right/bottom (no `inset` shorthand)
 * - Every <div> with multiple children MUST have `display: flex`
 * - No SVG filters / feTurbulence / no grid
 * - Single-color backgrounds, simple borders, simple text
 *
 * Query params:
 * - title    (string, required) — main heading
 * - subtitle (string, optional) — secondary text
 * - type     (optional) — reserved for future type-specific styling
 * - slug     (string, optional) — passed through, unused visually in v1
 */

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const CACHE_CONTROL = 'public, immutable, no-transform, max-age=31536000';

// Brand colors — [design §2.1, §cobalt-base-dark-adjustment]
const BG = '#0A0A0A';
const COBALT = '#3D6BE0';
const FG_PRIMARY = '#EDE7DA';
const FG_MUTED = '#9A9489';
const BORDER = '#2A2724';
const SITE_LABEL = 'hector-reyes.work';

const DISPLAY_FONT = 'Georgia, "Times New Roman", serif';
const BODY_FONT = 'system-ui, -apple-system, sans-serif';
const MONO_FONT = 'ui-monospace, monospace';

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') ?? 'Hector Reyes Pérez';
  const subtitle = searchParams.get('subtitle') ?? 'Senior Full-Stack Engineer & Frontend Lead';

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BG,
        fontFamily: BODY_FONT,
      }}
    >
      {/* Top cobalto accent bar */}
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '6px',
          backgroundColor: COBALT,
        }}
      />

      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
        }}
      >
        {/* Cobalto eyebrow label */}
        <div
          style={{
            display: 'flex',
            fontFamily: MONO_FONT,
            fontSize: '18px',
            color: COBALT,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '40px',
          }}
        >
          {SITE_LABEL}
        </div>

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: title.length > 40 ? '60px' : '76px',
            lineHeight: 1.05,
            color: FG_PRIMARY,
            letterSpacing: '-2px',
            marginBottom: '32px',
            maxWidth: '1000px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              color: FG_MUTED,
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Footer divider */}
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '1px',
          backgroundColor: BORDER,
        }}
      />

      {/* Footer row — URL + cobalto dot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 96px 40px 96px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: MONO_FONT,
            fontSize: '20px',
            color: FG_MUTED,
            letterSpacing: '1px',
          }}
        >
          {SITE_LABEL}
        </div>

        {/* Cobalto dot accent */}
        <div
          style={{
            display: 'flex',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: COBALT,
          }}
        />
      </div>

      {/* Bottom cobalto accent bar */}
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '6px',
          backgroundColor: COBALT,
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': CACHE_CONTROL,
      },
    },
  );
}
