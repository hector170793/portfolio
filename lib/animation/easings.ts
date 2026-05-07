/**
 * Named easing constants for Framer Motion and GSAP consumers.
 * [design §4] — animation sequencing table uses these by name.
 *
 * Format: cubic-bezier control points [x1, y1, x2, y2]
 * Compatible with FM `transition.ease` (accepts array) and
 * can be used as `cubic-bezier(...)` arguments in CSS.
 */

/** easeOutExpo — very fast start, asymptote tail. Primary portfolio curve. */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/** easeInOutQuart — symmetric acceleration/deceleration. Used in Next Project transitions. */
export const easeInOutQuart = [0.76, 0, 0.24, 1] as const;

/** easeOutCubic — moderate out easing. Used in subtitle/metrics fade. */
export const easeOutCubic = [0.33, 1, 0.68, 1] as const;
