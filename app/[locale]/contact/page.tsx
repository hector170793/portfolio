/**
 * Contact page stub — app/[locale]/contact/page.tsx
 * [spec 4] Contact form host.
 * [spec 9.1] Exports generateMetadata for OG/SEO.
 *
 * STUB: Real form (React Hook Form + Zod + Turnstile + Server Action)
 * is implemented in Slice 10.
 *
 * Renders an empty <section> so the route resolves at build time for both locales.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return buildMetadata({
    locale: locale as 'es' | 'en',
    title: `${t('title')} — Hector Reyes Pérez`,
    description: t('subtitle'),
    path: '/contact',
    ogParams: {
      title: t('title'),
      subtitle: 'Hector Reyes Pérez',
    },
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  // [design §5] Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    // [spec 8.5] Semantic <section> wrapping the contact form area.
    <section aria-labelledby="contact-heading" className="mx-auto max-w-2xl px-6 py-24">
      <h1
        id="contact-heading"
        className="font-display text-[var(--fs-h1)] text-[var(--foreground)]"
      >
        {t('title')}
      </h1>
      <p className="mt-4 text-[var(--muted-foreground)]">{t('subtitle')}</p>
      {/* Slice 10: <ContactForm /> renders here */}
    </section>
  );
}
