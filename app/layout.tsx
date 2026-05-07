import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hector Reyes Pérez — Senior Full-Stack Engineer',
  description:
    'Senior Full-Stack Engineer & Frontend Lead. Fintech, product, and LATAM-focused development.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // biome-ignore lint/a11y/useHtmlLang: lang is set on [locale]/layout.tsx — root shell has no locale context
    <html>
      <body>{children}</body>
    </html>
  );
}
