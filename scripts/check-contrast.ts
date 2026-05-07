/**
 * scripts/check-contrast.ts — WCAG contrast validation (Vitest)
 * [design §12.6] [spec 8.10] [spec 8.2]
 *
 * Validates the 4 token pairs mandated in design §12.6.
 * Runs via: pnpm test
 *
 * WCAG 2.1 relative luminance formula (hand-rolled — no external dep needed):
 *   L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 *   where R,G,B are sRGB values linearized with:
 *     c <= 0.04045 → c/12.92
 *     c > 0.04045  → ((c+0.055)/1.055)^2.4
 *
 * Contrast ratio = (L1 + 0.05) / (L2 + 0.05)  (L1 >= L2)
 */

import { describe, expect, it } from 'vitest';

// ── WCAG math ───────────────────────────────────────────────────────────────

function hexToSrgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.slice(0, 2), 16) / 255;
  const g = Number.parseInt(h.slice(2, 4), 16) / 255;
  const b = Number.parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToSrgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function wcagContrast(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Token pairs from design §12.6 ───────────────────────────────────────────

describe('Design token contrast — WCAG AA compliance [design §12.6]', () => {
  /**
   * Pair 1: --accent-text dark mode (#4B7BE6) on dark background (#0A0A0A)
   * Expected: ≥ 4.5:1 (AA normal text)
   * Design §2.1 originally specified #3D6BE0 with claimed 6.51:1 — actual: 4.13:1 (FAIL).
   * Corrected to #4B7BE6 (4.97:1 PASS AA). Deviation documented in apply-progress-slice-2.
   */
  it('dark mode accent-text (#4B7BE6) on dark bg (#0A0A0A) — ≥ 4.5:1 AA [design §2.1 corrected]', () => {
    const ratio = wcagContrast('#4B7BE6', '#0A0A0A');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * Pair 2: --accent-text light mode (#1B3D9C) on light background (#FAF7F2)
   * Expected: ≥ 4.5:1 (AA normal text)
   * Design validation: 9.84:1 [design §2.1]
   */
  it('light mode accent-text (#1B3D9C) on light bg (#FAF7F2) — ≥ 4.5:1 AA [design §2.1]', () => {
    const ratio = wcagContrast('#1B3D9C', '#FAF7F2');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * Pair 3: --foreground dark (#EDE7DA) on dark bg (#0A0A0A)
   * Expected: ≥ 7:1 (AAA) — primary body text must be highest contrast
   * [spec 8.10]
   */
  it('dark mode foreground (#EDE7DA) on dark bg (#0A0A0A) — ≥ 7:1 AAA [spec 8.10]', () => {
    const ratio = wcagContrast('#EDE7DA', '#0A0A0A');
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  /**
   * Pair 4: --foreground light (#15120E) on light bg (#FAF7F2)
   * Expected: ≥ 7:1 (AAA) — primary body text
   * [spec 8.10]
   */
  it('light mode foreground (#15120E) on light bg (#FAF7F2) — ≥ 7:1 AAA [spec 8.10]', () => {
    const ratio = wcagContrast('#15120E', '#FAF7F2');
    expect(ratio).toBeGreaterThanOrEqual(7);
  });
});
