// velite.config.ts — content pipeline for portfolio-v1
// Schema source: design §9 (sdd/portfolio-v1/design, obs #25)
// Locale is derived from filename: {slug}.{locale}.mdx → locale field via transform

import { defineCollection, defineConfig, s } from 'velite';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive locale from the file path suffix.
 * pattern: content/work/some-slug.es.mdx → 'es'
 *          content/work/some-slug.en.mdx → 'en'
 * [design §9, spec 5.9]
 */
const localeFromPath = (path: string): 'es' | 'en' => {
  const m = path.match(/\.(es|en)\.mdx$/);
  if (!m?.[1]) throw new Error(`Cannot derive locale from path: ${path}`);
  return m[1] as 'es' | 'en';
};

// ---------------------------------------------------------------------------
// Work collection — 4 case studies × 2 locales = 8 documents [spec 2.1]
// Uses s.string() for hero_image / gallery instead of s.image() to support
// SVG-or-WebP-or-AVIF without format restrictions.
// [design §9 risk note, task 5.5: "use s.string() for hero_image/gallery to
//  keep flexibility for SVG-or-WebP-or-AVIF"]
// ---------------------------------------------------------------------------

const work = defineCollection({
  name: 'Work',
  pattern: 'content/work/*.{es,en}.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      client: s.string(),
      year: s.number().int().min(2018).max(2030),
      // s.slug() returns ZodEffects — cannot chain .max(), use s.string() + .max() instead
      slug: s.string().max(80),
      // locale: optional in frontmatter — derived from filename via transform
      locale: s.enum(['es', 'en']).optional(),
      tags: s.array(s.string()).min(1).max(12),
      summary: s.string().max(280),
      // s.string() instead of s.image() → accepts SVG, WebP, AVIF paths [task 5.5]
      hero_image: s.string(),
      gallery: s.array(s.string()).length(3),
      stats: s
        .array(
          s.object({
            label: s.string(),
            value: s.number(),
            suffix: s.string().optional(),
          }),
        )
        .optional(),
      stack: s.array(s.string()).min(1),
      draft: s.boolean().default(false),
      body: s.mdx(),
    })
    .transform((data, ctx) => ({
      ...data,
      // Always derive locale from filename — frontmatter locale is overridden
      locale: localeFromPath((ctx as { meta: { path: string } }).meta.path),
    })),
});

// ---------------------------------------------------------------------------
// Journal collection — empty in v1, schema ready for first post [spec 3, §9]
// ---------------------------------------------------------------------------

const journal = defineCollection({
  name: 'Journal',
  pattern: 'content/journal/*.{es,en}.mdx',
  schema: s
    .object({
      title: s.string().max(140),
      date: s.isodate(),
      // s.slug() returns ZodEffects — cannot chain .max()
      slug: s.string().max(80),
      locale: s.enum(['es', 'en']).optional(),
      summary: s.string().max(280),
      tags: s.array(s.string()).max(8).optional(),
      draft: s.boolean().default(false),
      body: s.mdx(),
    })
    .transform((data, ctx) => {
      const meta = (ctx as { meta: { path: string; content?: string; plain?: string } }).meta;
      // Word count from raw plain text (~230 wpm) [design §9]
      const wordCount = (meta.plain ?? meta.content ?? '').split(/\s+/).filter(Boolean).length;
      return {
        ...data,
        locale: localeFromPath(meta.path),
        readingTime: Math.max(1, Math.ceil(wordCount / 230)),
      };
    }),
});

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export default defineConfig({
  root: '.',
  output: {
    data: '.velite',
    assets: 'public/.velite',
    base: '/.velite/',
    name: '[name]-[hash:8][ext]',
    clean: true,
  },
  collections: { work, journal },
});
