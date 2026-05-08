/**
 * Work case study page — app/[locale]/work/[slug]/page.tsx
 * [spec 2.1]  4 case studies × 2 locales = 8 static pages (SSG).
 * [spec 2.2]  5 chapters in order: Brief → Approach → Solution → Outcome → Stack.
 * [spec 2.3]  Exactly 3 images from gallery frontmatter.
 * [spec 2.4]  PinnedHero with GSAP ScrollTrigger pin.
 * [spec 2.5]  Stat counters in Outcome chapter (FM useMotionValue + useInView).
 * [spec 2.6]  ParallaxGallery with GSAP ScrollTrigger (disabled under reduced-motion).
 * [spec 2.7]  NextProject at bottom with View Transitions API shared element transition.
 * [spec 2.8]  generateStaticParams from velite work collection.
 * [spec 2.9]  Stack chapter renders frontmatter stack[] as structured tag list.
 * [spec 9.1]  generateMetadata with buildMetadata factory.
 * [spec 9.4]  Article + BreadcrumbList JSON-LD injected.
 * [design §3.2] Component architecture: PinnedHero → ChapterTOC + MDX body → ParallaxGallery
 *               → StatCounters (Outcome) → NextProject.
 * [design §10.1] articleJsonLd, breadcrumbJsonLd generators.
 *
 * "Next project" cycling order: santander → samsung → orbistrack → geofile → santander (wrap).
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChapterTOC } from '@/components/case-study/ChapterTOC';
import { NextProject } from '@/components/case-study/NextProject';
import { ParallaxGallery } from '@/components/case-study/ParallaxGallery';
import { PinnedHero } from '@/components/case-study/PinnedHero';
import { StatCounter } from '@/components/case-study/StatCounter';
import { MDXContent } from '@/components/MDXContent';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { work } from '../../../../.velite';

const SITE_URL = 'https://hector-reyes.work';

/** Canonical slug order for "next project" cycling. [spec 2.7, task §8.6] */
const SLUG_ORDER = ['santander-onboarding', 'samsung-members', 'orbistrack', 'geofile'] as const;

type Slug = (typeof SLUG_ORDER)[number];

/**
 * Determine the next case study slug by cycling through SLUG_ORDER.
 * santander → samsung → orbistrack → geofile → santander (wrap around).
 * [task §8.6]
 */
function getNextSlug(currentSlug: string): Slug {
  const idx = SLUG_ORDER.indexOf(currentSlug as Slug);
  if (idx === -1) return 'santander-onboarding';
  const next = SLUG_ORDER[(idx + 1) % SLUG_ORDER.length];
  if (!next) return 'santander-onboarding';
  return next;
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * [spec 2.8] Generate all 8 static param combinations from velite work collection.
 */
export function generateStaticParams() {
  return work.map((entry) => ({
    locale: entry.locale,
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const entry = work.find((w) => w.slug === slug && w.locale === locale);
  if (!entry) return {};

  return buildMetadata({
    locale: locale as 'es' | 'en',
    title: `${entry.title} — Hector Reyes Pérez`,
    description: entry.summary,
    path: `/work/${slug}`,
    ogParams: {
      title: entry.title,
      subtitle: `${entry.client} · ${entry.year}`,
      type: 'work',
      slug,
    },
  });
}

export default async function WorkPage({ params }: Props) {
  const { locale, slug } = await params;

  // [design §5] Enable static rendering.
  setRequestLocale(locale);

  // Find the case study matching locale + slug.
  const entry = work.find((w) => w.slug === slug && w.locale === locale);

  // [spec 2.1] 404 if not found.
  if (!entry) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'caseStudy' });

  // Determine next project for cycling navigation. [task §8.6]
  const nextSlug = getNextSlug(slug);
  const nextEntry = work.find((w) => w.slug === nextSlug && w.locale === locale);

  // Resolve hero and gallery image public URLs.
  // Velite stores relative paths like './placeholder.svg' relative to content/work/.
  // Public URL convention: /work/{slug}/{filename}.
  function resolveWorkImage(slug: string, relativePath: string): string {
    if (relativePath.startsWith('/') || relativePath.startsWith('http')) return relativePath;
    const filename = relativePath.replace(/^\.\//, '');
    return `/work/${slug}/${filename}`;
  }

  const heroImageUrl = resolveWorkImage(slug, entry.hero_image);

  const galleryImages = entry.gallery.map((src, i) => ({
    src: resolveWorkImage(slug, src),
    alt: `${entry.title} — gallery image ${i + 1}`,
  }));

  // JSON-LD breadcrumb segments. [spec 9.4]
  const breadcrumbSegments = [
    {
      name: locale === 'es' ? 'Inicio' : 'Home',
      url: `${SITE_URL}/${locale}`,
    },
    {
      name: locale === 'es' ? 'Proyectos' : 'Work',
      url: `${SITE_URL}/${locale}#work`,
    },
    {
      name: entry.title,
      url: `${SITE_URL}/${locale}/work/${slug}`,
    },
  ];

  return (
    <>
      {/* [spec 9.4] Article + BreadcrumbList JSON-LD */}
      <ArticleJsonLd
        title={entry.title}
        date={`${entry.year}-01-01`}
        slug={slug}
        summary={entry.summary}
        locale={locale as 'es' | 'en'}
        type="work"
      />
      <BreadcrumbJsonLd segments={breadcrumbSegments} />

      {/*
       * [spec 8.5] <article> for case study content. [design §12.5]
       * Layout: PinnedHero fills viewport → content body below → NextProject.
       */}
      <article aria-labelledby="case-study-title">
        {/*
         * [spec 2.4] PinnedHero: GSAP ScrollTrigger pin.
         * [design §3.2] pin:true, start:'top top', end:'+=100%', anticipatePin:1.
         * Tags passed from frontmatter.
         */}
        {/*
         * [task 12.3] slug passed so PinnedHero can set view-transition-name:
         * next-project-{slug} — matching the NextProject anchor on the previous page.
         * This enables the shared element transition (card expands → full-screen hero).
         * [spec 2.7] [design §3.2]
         */}
        <PinnedHero
          title={entry.title}
          client={entry.client}
          year={entry.year}
          heroImage={heroImageUrl}
          tags={entry.tags}
          slug={slug}
        />

        {/*
         * Case study body: TOC + chapter sections.
         * Two-column layout at large viewports (TOC left, content right).
         */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'min(14rem, 25%) 1fr',
            gap: 'clamp(3rem, 6vw, 8rem)',
            maxWidth: '90rem',
            margin: '0 auto',
            padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 5vw, 5rem)',
          }}
        >
          {/*
           * [spec 2.2] ChapterTOC: sticky left column with scroll-spy.
           * [design §3.2] Server renders labels; tiny [C] wrapper adds IntersectionObserver.
           */}
          <aside
            style={{
              display: 'none', // hidden on mobile, shown at large viewport via media query
            }}
          >
            <ChapterTOC locale={locale} />
          </aside>

          {/*
           * Chapter content — main reading area.
           *
           * The MDX body owns the chapter structure (## Brief, ## Approach,
           * ## Solution, ## Outcome, ## Stack). Custom h2 in MDXContent
           * auto-generates slug IDs ("Brief" → id="brief") so ChapterTOC
           * scroll-spy can target each chapter without rehype-slug in velite.
           *
           * Stats counters and Stack tag list render as structured callouts
           * AFTER the MDX (visually distinct from the narrative chapters).
           * [spec 2.5] [spec 2.9]
           */}
          <div
            style={{
              gridColumn: '1 / -1', // full width on mobile; JS-free responsive
              maxWidth: '60rem',
            }}
          >
            {/*
             * MDX body — renders all 5 chapters with auto-id h2 anchors.
             * [spec 2.2] 5 chapters in order: Brief → Approach → Solution → Outcome → Stack.
             */}
            <div className="prose-content">
              <MDXContent code={entry.body} />
            </div>

            {/*
             * [spec 2.5] Key outcomes callout — animated stat counters.
             * Positioned after MDX as a structured "key facts" panel.
             * FM useMotionValue + useInView({ once:true }). [design §3.2]
             */}
            {entry.stats && entry.stats.length > 0 && (
              <section
                aria-labelledby="key-outcomes-heading"
                style={{
                  marginTop: 'clamp(4rem, 8vw, 8rem)',
                  paddingTop: 'clamp(3rem, 5vw, 5rem)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <h3
                  id="key-outcomes-heading"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-small)',
                    color: 'var(--accent-text)',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: '2.5rem',
                  }}
                >
                  {t('keyOutcomes')}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'clamp(2rem, 5vw, 5rem)',
                  }}
                >
                  {entry.stats.map((stat) => (
                    <StatCounter
                      key={stat.label}
                      to={stat.value}
                      suffix={stat.suffix}
                      label={stat.label}
                    />
                  ))}
                </div>
              </section>
            )}

            {/*
             * [spec 2.9] Stack tag list — structured tech tags from frontmatter.
             * Positioned as a callout after stats; visually distinct from MDX prose.
             */}
            <section
              aria-labelledby="stack-list-heading"
              style={{
                marginTop: 'clamp(4rem, 8vw, 8rem)',
                paddingTop: 'clamp(3rem, 5vw, 5rem)',
                borderTop: '1px solid var(--border)',
              }}
            >
              <h3
                id="stack-list-heading"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-small)',
                  color: 'var(--accent-text)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '2rem',
                }}
              >
                {t('stackList')}
              </h3>
              <ul
                aria-label="Technology stack"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                {entry.stack.map((tech) => (
                  <li
                    key={tech}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-small)',
                      color: 'var(--foreground)',
                      padding: '0.4rem 1rem',
                      border: '1px solid var(--accent-base)',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'transparent',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/*
         * [spec 2.6] ParallaxGallery: 3 images with GSAP ScrollTrigger parallax.
         * Positioned below the chapter body (after Stack section).
         * [design §3.2] y: -40→40px, scale: 0.96→1.02, scrub: 1.2.
         * [spec 10.9] loading="lazy" for all 3 below-fold images.
         */}
        <div
          style={{
            maxWidth: '90rem',
            margin: '0 auto',
            padding: '0 clamp(1.5rem, 5vw, 5rem)',
          }}
        >
          <ParallaxGallery images={galleryImages} />
        </div>

        {/*
         * [spec 2.7] NextProject: shared element transition to next case study.
         * Cycles: santander → samsung → orbistrack → geofile → santander.
         * [design §3.2] view-transition-name + FM layoutId fallback.
         */}
        {nextEntry && (
          <NextProject
            nextSlug={nextSlug}
            nextTitle={nextEntry.title}
            nextHeroImage={resolveWorkImage(nextSlug, nextEntry.hero_image)}
            locale={locale}
            label={t('nextProject')}
          />
        )}
      </article>
    </>
  );
}
