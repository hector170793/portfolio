/**
 * Root layout — app/layout.tsx
 * [design §1] [design §6.1] [design §2.3]
 *
 * Responsibilities:
 * - next/font declarations: Fraunces (preload:true), Inter, JetBrains Mono (preload:false)
 * - Inject CSS font variable classes on <html>
 * - No-flash inline theme script — runs before first paint [design §6.1] [spec 6.9]
 * - Mount ThemeProvider
 * - Root <html> has NO lang attribute — locale layout sets it [design §1]
 */

import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

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
 * Runs before first paint (beforeInteractive strategy).
 * No external deps — must be self-contained.
 */
const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t;}catch(_){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // biome-ignore lint/a11y/useHtmlLang: lang is set on [locale]/layout.tsx — root shell has no locale context [design §1]
    <html
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
