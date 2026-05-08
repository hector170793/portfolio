/**
 * Home page — app/[locale]/page.tsx
 * [spec 1.1] Home page renders at /[locale]/ and contains sections in order:
 *            Hero → Selected Work → About → Capabilities → Journal Preview (conditional) → Contact CTA.
 * [spec 8.5]  All section anchors present for scroll-spy [spec 1.13] and nav links.
 * [spec 9.1]  Exports generateMetadata via buildMetadata factory [design §10.5].
 * [spec 9.4]  JSON-LD Person + WebSite schemas injected for home page.
 * [spec 10.7] SSG — setRequestLocale enables static rendering.
 *
 * Slice 7A: Hero + SelectedWork.
 * Slice 7B: About + Capabilities + JournalPreview (conditional) + ContactCTA + JsonLd.
 */

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { About } from '@/components/home/About';
import { Capabilities } from '@/components/home/Capabilities';
import { ContactCTA } from '@/components/home/ContactCTA';
import { Hero } from '@/components/home/Hero';
import { JournalPreview } from '@/components/home/JournalPreview';
import { SelectedWork } from '@/components/home/SelectedWork';
import { PersonJsonLd } from '@/components/seo/PersonJsonLd';
import { WebSiteJsonLd } from '@/components/seo/WebSiteJsonLd';
import { journalEnabled } from '@/lib/content/journal-enabled';
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

  // [spec 1.11] Journal gating — auto-detected at build time from velite collection.
  // JournalPreview is absent from DOM entirely when false [spec 1.11].
  const isJournalEnabled = journalEnabled();

  return (
    <>
      {/*
       * [spec 9.4] JSON-LD structured data — Person + WebSite schemas.
       * Server components; rendered into <head> by Next.js.
       * [spec 9.3] Scenario: @type: "Person", jobTitle: "Senior Full-Stack Engineer".
       */}
      <PersonJsonLd locale={locale as 'es' | 'en'} />
      <WebSiteJsonLd locale={locale as 'es' | 'en'} />

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
       * [spec 1.9] About — professional narrative, hardware → frontend arc.
       * [task §7B.1] Server Component. No skill bars, no ratings.
       * id="about" provides scroll-spy anchor [spec 1.13].
       */}
      <About locale={locale} />

      {/*
       * [spec 1.10] Capabilities — 4 grouped skill categories, no levels.
       * [task §7B.2] Server Component.
       * id="capabilities" provides scroll-spy anchor [spec 1.13].
       */}
      <Capabilities locale={locale} />

      {/*
       * [spec 1.11] Journal Preview — conditionally rendered.
       * Only shown when at least one non-draft post exists in content/journal/.
       * Section is COMPLETELY ABSENT from DOM when false — no empty placeholder.
       * [task §7B.3] Caller (this page) guards with journalEnabled().
       */}
      {isJournalEnabled && <JournalPreview locale={locale} />}

      {/*
       * [spec 1.12] Contact CTA — scroll target for #contact links.
       * Hero CTA (href="#contact") and header nav ("Contact") both anchor here.
       * Also entry point to the full contact form at /[locale]/contact.
       * [task §7B.4] Server Component with MagneticButton CTA.
       */}
      <ContactCTA locale={locale} />
    </>
  );
}
