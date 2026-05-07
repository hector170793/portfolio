/**
 * Locale layout — app/[locale]/layout.tsx
 * [design §1, §2.3, §6.1] [spec 5.6, 6.9, 8.1, 8.4, 8.5, 10.7]
 *
 * Owns <html>/<body> so that <html lang={locale}> can be set statically per
 * locale (spec 5.6, 8.4) without forcing dynamic rendering — preserves SSG
 * via setRequestLocale (spec 10.7).
 *
 * Responsibilities:
 * - Set <html lang={locale}> from URL params
 * - next/font declarations: Fraunces (preload:true), Inter, JetBrains Mono
 * - No-flash inline theme script — runs before first paint
 * - Mount ThemeProvider + NextIntlClientProvider
 * - Render SkipLink (first focusable), Header, <main id="main-content">, Footer
 * - Cache-Control: public, s-maxage=60, stale-while-revalidate=86400
 */

import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SkipLink from '@/components/SkipLink';
import { ThemeProvider } from '@/components/ThemeProvider';
import { journalEnabled } from '@/lib/content/journal-enabled';
import { routing } from '@/lib/i18n/routing';

/* ── next/font declarations [design §2.3] [spec 10.6] ──────────────
   Fraunces: preload:true (display weight used in hero — critical path)
   Inter:    preload:false (body copy — font-display swap, non-blocking)
   JetBrains Mono: preload:false (code snippets — non-blocking)
──────────────────────────────────────────────────────────────────── */
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
  display: 'swap',
  weight: 'variable',
  preload: true,
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: 'variable',
  preload: false,
});

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbmono',
  display: 'swap',
  weight: 'variable',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Hector Reyes Pérez — Senior Full-Stack Engineer',
  description:
    'Senior Full-Stack Engineer & Frontend Lead. Fintech, product, and LATAM-focused development.',
};

/**
 * Inline no-flash theme script (~280 bytes). [design §6.1] [spec 6.9]
 * Priority order: (1) localStorage → (2) prefers-color-scheme → (3) 'dark'
 * Runs before first paint (beforeInteractive strategy). No external deps.
 */
const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(_){document.documentElement.classList.add('dark');}})();`;

// [design §5] Cache-Control: public, s-maxage=60, stale-while-revalidate=86400.
// Locale pages are mostly static; 60s CDN TTL + 24h stale-while-revalidate.
export const revalidate = 60;

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale — redirect to 404 if unsupported. [spec 5.4]
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // [spec 10.7] Enable static rendering by populating request locale cache
  // before any next-intl APIs that read locale are called.
  setRequestLocale(locale);

  // [spec 5.10] Load messages for NextIntlClientProvider.
  const messages = await getMessages();

  // [spec 1.14] Journal nav link only when at least one published post exists.
  const isJournalEnabled = journalEnabled();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} ${jbMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* No-flash theme script — blocking, before first paint [design §6.1] [spec 6.9] */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
        />
      </head>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {/* [spec 8.1] SkipLink MUST be first focusable element on every page */}
            <SkipLink />

            {/* [design §3.5] Header is Client (scroll-spy + ThemeToggle + LocaleToggle) */}
            <Header journalEnabled={isJournalEnabled} />

            {/* [spec 8.5] <main id="main-content"> — skip link target [design §12.1] */}
            <main id="main-content">{children}</main>

            {/* [design §3.5] Footer is Server Component */}
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
