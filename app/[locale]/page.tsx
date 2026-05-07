/**
 * Home page stub — app/[locale]/page.tsx
 * [spec 1.1] Home page renders at /[locale]/.
 * [spec 8.5] Section anchors present for scroll-spy and in-page navigation.
 *
 * STUB: Real home sections (Hero, SelectedWork, About, Capabilities, etc.)
 * are implemented in Slice 7.
 *
 * Provides the section anchor <div>s so that:
 *  - Header scroll-spy IntersectionObserver has targets to observe [spec 1.13]
 *  - Header nav links (#work, #about, #capabilities, #contact) resolve correctly
 *  - Build compiles and generates static pages for both locales
 */

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale: locale as 'es' | 'en',
    title: 'Hector Reyes Pérez — Senior Full-Stack Engineer & Frontend Lead',
    description:
      locale === 'es'
        ? 'Senior Full-Stack Engineer & Frontend Lead. Fintech, plataformas y desarrollo orientado a LATAM.'
        : 'Senior Full-Stack Engineer & Frontend Lead. Fintech, platforms, and LATAM-focused development.',
    path: '',
    ogParams: {
      title: 'Hector Reyes Pérez',
      subtitle: 'Senior Full-Stack Engineer & Frontend Lead',
    },
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  // [design §5] Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <>
      {/*
       * Section stubs — real content implemented in Slice 7.
       * IDs are required for Header scroll-spy [spec 1.13] and nav links.
       * [spec 8.5] Each section uses semantic <section> with a meaningful min-height
       * so IntersectionObserver has visible targets during development.
       */}

      {/* [spec 1.2] Hero section */}
      <section id="hero" aria-label="Hero" className="min-h-screen" />

      {/* [spec 1.5] Selected Work section */}
      <section id="work" aria-label="Work" className="min-h-screen" />

      {/* [spec 1.9] About section */}
      <section id="about" aria-label="About" className="min-h-screen" />

      {/* [spec 1.10] Capabilities section */}
      <section id="capabilities" aria-label="Capabilities" className="min-h-screen" />

      {/* [spec 1.12] Contact CTA — anchor for header nav and in-page links */}
      <section id="contact" aria-label="Contact" className="min-h-[50vh]" />
    </>
  );
}
