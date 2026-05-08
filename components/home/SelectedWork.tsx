/**
 * SelectedWork — Work list section. [Server Component]
 * [spec 1.5]  Exactly 4 case studies in a list/grid layout.
 *              Order: santander-onboarding, samsung-members, orbistrack, geofile.
 * [spec 1.6]  ImageRevealOnHover wraps each card [C child for hover interactivity].
 * [spec 1.7]  Tag list rendered inside <Marquee> — infinite horizontal, pauses on hover.
 * [spec 1.8]  Each card links to /[locale]/work/[slug].
 * [spec 8.5]  <section id="work"> landmark, <article> per card, heading hierarchy.
 * [design §3.3] SelectedWork is [S]; ImageRevealOnHover and Marquee are [C] children.
 * [spec 5.10] UI strings from messages — no hardcoded text.
 *
 * Gallery image src: velite stores './1.svg' (relative to MDX file).
 * We construct the public URL as /work/{slug}/1.svg from the slug.
 * NOTE: placeholder images are SVGs — cannot use next/image without dangerouslyAllowSVG.
 * Slice 13 (real assets) will swap to next/image when WebP/AVIF files are uploaded.
 *
 * Card order enforced by SLUG_ORDER constant — matches spec 1.5 and tasks §7A.2.
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ImageRevealOnHover } from '@/components/animation/ImageRevealOnHover';
import { Marquee } from '@/components/animation/Marquee';
import { work } from '../../.velite';

/** Canonical card order. [spec 1.5] [task §7A.2] */
const SLUG_ORDER = ['santander-onboarding', 'samsung-members', 'orbistrack', 'geofile'] as const;

type SelectedWorkProps = {
  locale: string;
};

/**
 * Resolve the first gallery image's public URL from velite's relative path.
 * Velite stores './1.svg' relative to content/work/{slug}.{locale}.mdx.
 * Actual public path: /work/{slug}/1.svg (files live in public/work/{slug}/).
 * [task §7A.2 — gallery[0] used for reveal]
 */
function resolveGalleryImage(slug: string, galleryEntry: string): string {
  // If already an absolute/root path, return as-is.
  if (galleryEntry.startsWith('/') || galleryEntry.startsWith('http')) {
    return galleryEntry;
  }
  // Strip './' prefix and build the public URL.
  const filename = galleryEntry.replace(/^\.\//, '');
  return `/work/${slug}/${filename}`;
}

export async function SelectedWork({ locale }: SelectedWorkProps) {
  // [spec 5.10] Work section strings from messages.
  const t = await getTranslations({ locale, namespace: 'work' });

  // Filter velite work collection by locale, then sort by SLUG_ORDER. [spec 1.5]
  const allWork = work.filter((w) => w.locale === locale && !w.draft);

  const orderedWork = SLUG_ORDER.map((slug) => allWork.find((w) => w.slug === slug)).filter(
    (w): w is NonNullable<typeof w> => w !== undefined,
  );

  return (
    /*
     * [spec 8.5] <section id="work"> — scroll-spy + header nav target [spec 1.13].
     * [spec 1.12] Contact section separately owns #contact.
     */
    <section
      id="work"
      aria-labelledby="work-heading"
      style={{
        padding: 'clamp(6rem, 10vw, 12rem) clamp(1.5rem, 5vw, 5rem)',
      }}
    >
      {/* Section heading — h2 (below h1 in hero). [spec 8.5] */}
      <h2
        id="work-heading"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-h2)',
          lineHeight: 'var(--lh-h2)',
          letterSpacing: 'var(--ls-h2)',
          color: 'var(--foreground)',
          fontWeight: 300,
          marginBottom: 'clamp(4rem, 8vw, 10rem)',
        }}
      >
        {t('title')}
      </h2>

      {/*
       * Work card grid — 2 columns at lg breakpoint, 1 column at mobile.
       * Generous vertical gap using clamp rhythm. [design §3.3]
       */}
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(4rem, 8vw, 10rem)',
        }}
        aria-label={t('title')}
      >
        {orderedWork.map((project, index) => {
          // Construct first gallery image public URL for ImageRevealOnHover.
          const firstImage = project.gallery[0]
            ? resolveGalleryImage(project.slug, project.gallery[0])
            : `/work/${project.slug}/placeholder.svg`;

          return (
            /*
             * Each work card — <article> for semantic case study item. [spec 8.5]
             * [spec 1.6] data-cursor="view" set by ImageRevealOnHover on pointer enter.
             * [spec 1.8] Link wraps the entire article → /[locale]/work/[slug].
             */
            <li key={project.slug}>
              <article aria-labelledby={`work-title-${project.slug}`}>
                {/*
                 * ImageRevealOnHover [C] — wraps card content.
                 * [spec 1.6] Masked image appears following cursor within card.
                 * [design §3.1] clip-path circle expand 420ms on pointerenter.
                 * [spec 7.7] Disabled under pointer:coarse / reduced-motion.
                 * [spec 8.7] Image layer aria-hidden="true" (decorative).
                 */}
                <ImageRevealOnHover src={firstImage} alt={`${project.title} — placeholder image`}>
                  <Link
                    href={`/${locale}/work/${project.slug}`}
                    style={{
                      display: 'block',
                      padding: 'clamp(2rem, 4vw, 3.5rem)',
                      textDecoration: 'none',
                      color: 'inherit',
                      borderTop: '1px solid var(--border)',
                      position: 'relative',
                    }}
                    /*
                     * [spec 1.5] data-cursor="view" — CustomCursor reads this attribute
                     * to switch to the contextual "view" state. [spec 7.2.B.3]
                     * NOTE: ImageRevealOnHover also sets data-cursor="view" on pointerenter
                     * via its own event handler. Setting it here statically as well ensures
                     * the CustomCursor state is applied even if ImageRevealOnHover is
                     * disabled (reduced-motion). Both setting sites are intentional.
                     */
                    data-cursor="view"
                  >
                    {/* Card number — editorial index label */}
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--fs-small)',
                        color: 'var(--muted-foreground)',
                        marginBottom: '1.5rem',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Project title — h3 (below h2 section heading). [spec 8.5] */}
                    <h3
                      id={`work-title-${project.slug}`}
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--fs-h2)',
                        lineHeight: 'var(--lh-h2)',
                        letterSpacing: 'var(--ls-h2)',
                        color: 'var(--foreground)',
                        fontWeight: 300,
                        margin: 0,
                      }}
                    >
                      {project.title}
                    </h3>

                    {/* Client + year — meta info */}
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--fs-small)',
                        color: 'var(--accent-text)',
                        marginTop: '0.75rem',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {project.client} · {project.year}
                    </p>

                    {/* Summary — brief description */}
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--fs-body)',
                        lineHeight: 'var(--lh-body)',
                        color: 'var(--muted-foreground)',
                        marginTop: '1rem',
                        maxWidth: '52ch',
                      }}
                    >
                      {project.summary}
                    </p>
                  </Link>
                </ImageRevealOnHover>

                {/*
                 * Tag marquee — outside the ImageRevealOnHover so tags scroll
                 * independently and don't clip the reveal image.
                 * [spec 1.7] Infinite horizontal marquee; pauses on hover.
                 * [task §7A.3] <Marquee> wraps the tag list.
                 * [design §12.5] role="presentation" + srLabel for AT.
                 */}
                <div
                  style={{
                    marginTop: '1.5rem',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '1.5rem',
                    overflow: 'hidden',
                  }}
                >
                  <Marquee
                    duration={20}
                    srLabel={`${project.title} — ${t('tagsSrLabel')}: ${project.tags.join(', ')}`}
                  >
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          marginRight: '1.5rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--fs-small)',
                          color: 'var(--muted-foreground)',
                          whiteSpace: 'nowrap',
                          padding: '0.25rem 0.75rem',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </Marquee>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
