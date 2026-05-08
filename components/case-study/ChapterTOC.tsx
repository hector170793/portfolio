/**
 * ChapterTOC — sticky chapter table of contents with IntersectionObserver scroll-spy.
 * [spec 2.2]  Chapter navigation (sticky TOC) SHOULD be present.
 * [design §3.2] Server renders sticky list; tiny [C] wrapper adds scroll-spy.
 *
 * Server part: renders 5 chapter labels from messages. Static HTML, no JS.
 * Client part: ChapterTOCClient attaches IntersectionObserver to activate current chapter.
 *
 * Cobalto indicator on active chapter. [spec 2.2, design §3.2]
 * Reduced motion: still works (no animation on indicator, just instant class change).
 */

import { getTranslations } from 'next-intl/server';
import { ChapterTOCClient } from './ChapterTOCClient';

/** Canonical chapter order [spec 2.2] */
export const CHAPTERS = ['brief', 'approach', 'solution', 'outcome', 'stack'] as const;
export type Chapter = (typeof CHAPTERS)[number];

type ChapterTOCProps = {
  locale: string;
};

export async function ChapterTOC({ locale }: ChapterTOCProps) {
  const t = await getTranslations({ locale, namespace: 'caseStudy' });

  const chapterLabels: Record<Chapter, string> = {
    brief: t('chapters.brief'),
    approach: t('chapters.approach'),
    solution: t('chapters.solution'),
    outcome: t('chapters.outcome'),
    stack: t('chapters.stack'),
  };

  return (
    /*
     * Sticky TOC positioned on left side at large viewports.
     * On mobile: horizontal bar at top. [design §3.2]
     */
    <nav
      aria-label="Chapter navigation"
      style={{
        position: 'sticky',
        top: 'clamp(4rem, 8vh, 6rem)',
        alignSelf: 'start',
        padding: 'clamp(1rem, 2vw, 2rem) 0',
        zIndex: 5,
      }}
    >
      <ChapterTOCClient chapters={CHAPTERS} labels={chapterLabels} />
    </nav>
  );
}
