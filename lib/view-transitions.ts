/**
 * lib/view-transitions.ts
 * Theme toggle animation: View Transitions API + Framer Motion masked overlay fallback.
 * [design §6.4] [spec 6.6] [spec 6.7]
 *
 * applyThemeWithFallback(next, origin):
 *   - If document.startViewTransition is available (Chromium/Safari) → use View Transitions API
 *     with circle clip-path expand from origin point [design §4.4]
 *   - Otherwise (Firefox) → Framer Motion portal overlay fallback [design §6.4]
 */

import type { Theme } from '@/components/ThemeProvider';

export interface TransitionOrigin {
  x: number;
  y: number;
}

/**
 * Applies the theme class directly to <html>.
 * Called inside startViewTransition callback so the browser
 * captures the before/after snapshots correctly.
 * [design §4.4]
 */
function applyTheme(next: Theme): void {
  const html = document.documentElement;
  html.classList.remove('dark', 'light');
  html.classList.add(next);
  html.style.colorScheme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // private browsing — silent
  }
}

/**
 * Framer Motion masked overlay fallback for browsers without
 * View Transitions API (Firefox). [design §6.4] [spec 6.7]
 *
 * Mounts a portal <div> with a clip-path animation:
 *   circle(0 at x y) → circle(150% at x y) over 480ms
 * Swaps theme at 50% progress (240ms), then unmounts.
 */
async function fmMaskedOverlay(origin: TransitionOrigin, next: Theme): Promise<void> {
  // Dynamic import — framer-motion only loaded as fallback [design §11.2]
  const { animate } = await import('framer-motion');

  return new Promise<void>((resolve) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      `z-index:${getComputedStyle(document.documentElement).getPropertyValue('--z-theme-overlay').trim() || '30'}`,
      `background:${next === 'dark' ? '#0a0a0a' : '#faf7f2'}`,
      `clip-path:circle(0 at ${origin.x}px ${origin.y}px)`,
      'pointer-events:none',
    ].join(';');

    document.body.appendChild(overlay);

    // Swap theme at midpoint (240ms of 480ms total) [design §6.4]
    const swapTimer = setTimeout(() => applyTheme(next), 240);

    animate(
      overlay,
      {
        clipPath: [
          `circle(0 at ${origin.x}px ${origin.y}px)`,
          `circle(150% at ${origin.x}px ${origin.y}px)`,
        ],
      },
      { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
    ).then(() => {
      clearTimeout(swapTimer);
      applyTheme(next); // ensure theme applied even if timer drifted
      overlay.remove();
      resolve();
    });
  });
}

/**
 * Primary entry point used by ThemeToggle.
 * [design §6.4] [spec 6.6] [spec 6.7]
 *
 * @param next    - target theme ('dark' | 'light')
 * @param origin  - button click coordinates (for circle expand origin)
 * @param onDone  - callback fired after theme is fully applied (optional)
 */
export async function applyThemeWithFallback(
  next: Theme,
  origin: TransitionOrigin,
  onDone?: () => void,
): Promise<void> {
  if ('startViewTransition' in document) {
    // View Transitions API path [design §4.4]
    const html = document.documentElement;
    html.style.setProperty('--vt-x', `${origin.x}px`);
    html.style.setProperty('--vt-y', `${origin.y}px`);

    const transition = document.startViewTransition(() => applyTheme(next));
    await transition.finished;
    onDone?.();
  } else {
    // Framer Motion fallback for Firefox [design §6.4]
    await fmMaskedOverlay(origin, next);
    onDone?.();
  }
}
