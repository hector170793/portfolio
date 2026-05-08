/**
 * app/[locale]/contact/page.tsx — Contact page.
 * [spec 4] Hosts the contact form (React Hook Form + Zod + Turnstile + Server Action).
 * [spec 9.1] Exports generateMetadata via buildMetadata factory.
 * [spec 9.4] BreadcrumbJsonLd: Home → Contact.
 * [design §7] Form pipeline: see ContactForm.tsx + app/actions/contact.ts.
 */

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { ContactForm } from './ContactForm';

const SITE_URL = 'https://hector-reyes.work';

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

  // [spec 9.4] BreadcrumbList: Home → Contact.
  const breadcrumb = breadcrumbJsonLd([
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${SITE_URL}/${locale}` },
    { name: t('title'), url: `${SITE_URL}/${locale}/contact` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* [spec 8.5] Semantic section wrapping contact form area */}
      <section aria-labelledby="contact-heading" className="mx-auto max-w-2xl px-6 py-24">
        <h1
          id="contact-heading"
          className="font-display text-[var(--fs-h1)] text-[var(--foreground)]"
        >
          {t('title')}
        </h1>
        <p className="mt-4 mb-10 text-[var(--muted-foreground)]">{t('subtitle')}</p>

        {/* [design §7] Contact form — RHF + Zod + Turnstile + Server Action */}
        <ContactForm />
      </section>
    </>
  );
}
