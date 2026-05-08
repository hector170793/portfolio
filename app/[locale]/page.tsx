/**
 * Home page — app/[locale]/page.tsx
 * [spec 1.1] Home page renders at /[locale]/ and contains sections in order:
 *            Hero → Selected Work → About → Capabilities → Contact CTA.
 * [spec 8.5] All section anchors present for scroll-spy [spec 1.13] and nav links.
 * [spec 9.1] Exports generateMetadata via buildMetadata factory [design §10.5].
 * [spec 10.7] SSG — setRequestLocale enables static rendering.
 *
 * Slice 7A implements: Hero + SelectedWork.
 * Slice 7B stubs remain: About (#about), Capabilities (#capabilities),
 * Journal Preview (#journal — conditional), and Contact CTA (#contact).
 */

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/home/Hero';
import { SelectedWork } from '@/components/home/SelectedWork';
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
        ? 'Senior Full-Stack Engineer & Frontend Lead. Entrega de producto fintech para LATAM y mercados globales.'
        : 'Senior Full-Stack Engineer & Frontend Lead. Fintech-grade product delivery for LATAM and global markets.',
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
       * [spec 1.2] Hero — landing section. Full name, headline, metrics, CTA → #contact.
       * [task §7A.1] Implemented by <Hero> [S] wrapping <HeroReveal> [C].
       */}
      <Hero locale={locale} />

      {/*
       * [spec 1.5] Selected Work — 4 case studies in order.
       * [task §7A.2] Implemented by <SelectedWork> [S].
       * id="work" provides the scroll-spy anchor for header nav [spec 1.13].
       */}
      <SelectedWork locale={locale} />

      {/*
       * Slice 7B stubs — real content implemented in Slice 7B.
       * IDs are required for Header scroll-spy [spec 1.13] and nav links.
       * [spec 8.5] Semantic <section> elements with meaningful min-height
       * so IntersectionObserver has visible targets during development.
       */}

      {/* [spec 1.9] About section stub */}
      <section
        id="about"
        aria-label="About"
        style={{ minHeight: '100svh', borderTop: '1px solid var(--border)' }}
      />

      {/* [spec 1.10] Capabilities section stub */}
      <section
        id="capabilities"
        aria-label="Capabilities"
        style={{ minHeight: '60vh', borderTop: '1px solid var(--border)' }}
      />

      {/*
       * [spec 1.11] Journal Preview — conditionally rendered in Slice 7B.
       * Stub anchor only; content gated by journal-enabled.ts build-time helper.
       */}
      <section id="journal" aria-label="Journal preview" />

      {/*
       * [spec 1.12] Contact CTA anchor — scroll target for in-page #contact links
       * from header nav and Hero CTA. [spec 1.2] [design §3.3]
       */}
      <section
        id="contact"
        aria-label="Contact"
        style={{ minHeight: '50vh', borderTop: '1px solid var(--border)' }}
      />
    </>
  );
}
