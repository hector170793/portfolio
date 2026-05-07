// [spec 5.1] Exactly two locales: es and en.
// [spec 5.4] Default locale is en (fallback when neither cookie nor Accept-Language matches).
// [design §5] localePrefix: 'always' — both /es/... and /en/... are always prefixed.

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
