'use client';

/**
 * ThemeToggle — header toggle button for dark/light mode.
 * [design §6.3] [design §4.4] [spec 6.6] [spec 6.7]
 * [design §12.5] — aria-pressed + aria-label pattern
 *
 * On click:
 *   1. Reads click coordinates as View Transition origin
 *   2. Calls applyThemeWithFallback(next, origin) from lib/view-transitions.ts
 *   3. Updates ThemeContext via setTheme()
 *
 * CSS circle-reveal keyframe is defined in globals.css [design §4.4].
 * Framer Motion is lazy-loaded only in the fallback branch [design §11.2].
 */

import type { MouseEvent } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { applyThemeWithFallback } from '@/lib/view-transitions';

// Accessible label — i18n messages integration deferred to Slice 3
const ARIA_LABELS = {
  dark: 'Switch to light mode',
  light: 'Switch to dark mode',
} as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const origin = { x: e.clientX, y: e.clientY };

    // Apply with View Transitions API or FM fallback [design §6.4]
    await applyThemeWithFallback(next, origin, () => {
      // Sync React context after DOM is updated [design §6.2]
      setTheme(next);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={theme === 'dark'}
      aria-label={ARIA_LABELS[theme]}
      style={{
        // Minimal inline style — only layout/positioning, no theming
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: '0.5rem',
        color: 'inherit',
      }}
    >
      {/* Sun icon (visible in dark mode → clicking switches to light) */}
      {theme === 'dark' ? (
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Sun</title>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        /* Moon icon (visible in light mode → clicking switches to dark) */
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Moon</title>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
