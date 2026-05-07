/**
 * Root layout — app/layout.tsx
 * [design §1] [spec 5.6, 8.4]
 *
 * Pass-through. The actual <html>/<body>, fonts, theme script, and
 * ThemeProvider live in app/[locale]/layout.tsx so that <html lang={locale}>
 * can be set statically per-locale, preserving SSG (spec 10.7).
 *
 * This pattern is the canonical next-intl + App Router setup with i18n routing.
 */

import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
