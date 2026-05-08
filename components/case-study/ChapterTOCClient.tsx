'use client';

/**
 * ChapterTOCClient — client-side IntersectionObserver scroll-spy for ChapterTOC.
 * [design §3.2] Tiny [C] wrapper: IntersectionObserver scroll-spy activates current chapter class.
 * [spec 2.2]   Active chapter gets cobalto indicator.
 * [spec 7.7]   Reduced-motion: still works — no animation on class change, just instant swap.
 *
 * Observes <section id="chapter-{id}"> elements in the page.
 * Updates active chapter state when a section enters the viewport.
 */

import { useEffect, useState } from 'react';
import type { Chapter } from './ChapterTOC';

interface ChapterTOCClientProps {
  chapters: readonly Chapter[];
  labels: Record<Chapter, string>;
}

export function ChapterTOCClient({ chapters, labels }: ChapterTOCClientProps): React.ReactElement {
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const chapter of chapters) {
      // MDX h2 auto-generates slug IDs from heading text ("Brief" → "brief")
      // via MDXContent's default H2WithSlug component.
      const el = document.getElementById(chapter);
      if (!el) continue;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveChapter(chapter);
            }
          }
        },
        {
          // Activate when section is 20% visible from the top 40% of viewport.
          rootMargin: '-10% 0px -50% 0px',
          threshold: 0,
        },
      );

      observer.observe(el);
      observers.push(observer);
    }

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [chapters]);

  return (
    <ol
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      {chapters.map((chapter) => {
        const isActive = activeChapter === chapter;

        return (
          <li key={chapter}>
            <a
              href={`#${chapter}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-small)',
                color: isActive ? 'var(--accent-text)' : 'var(--muted-foreground)',
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                // No transition under reduced-motion (CSS handles this via media query).
                transition: 'color 200ms ease, background-color 200ms ease',
                backgroundColor: isActive ? 'rgba(61, 107, 224, 0.08)' : 'transparent',
                letterSpacing: '0.04em',
              }}
            >
              {/* Cobalto indicator dot — active chapter [spec 2.2] */}
              <span
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--accent-base)' : 'transparent',
                  border: isActive ? 'none' : '1px solid var(--border)',
                  flexShrink: 0,
                  transition: 'background-color 200ms ease',
                }}
              />
              {labels[chapter]}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
