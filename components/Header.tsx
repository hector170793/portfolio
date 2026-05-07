'use client';

/**
 * Header — primary navigation shell.
 * [design §3.5] Client Component: scroll-spy via IntersectionObserver + ThemeToggle + LocaleToggle.
 * [spec 1.13] Scroll-spy: active nav item gets cobalto background indicator.
 * [spec 1.14] Journal link only visible when journalEnabled === true.
 * [design §2.7] Sticky position, top: 0, z-index: 10.
 * [design §12.5] <nav aria-label="Primary">
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import LocaleToggle from '@/components/LocaleToggle';
import ThemeToggle from '@/components/ThemeToggle';

// Section IDs that the scroll-spy tracks [spec 1.13]
const SECTION_IDS = ['work', 'about', 'capabilities', 'contact'] as const;
type SectionId = (typeof SECTION_IDS)[number];

type Props = {
  /** Passed from server [locale]/layout.tsx via journalEnabled() [spec 1.14] */
  journalEnabled: boolean;
};

export default function Header({ journalEnabled }: Props) {
  const t = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  // IntersectionObserver refs — one observer instance, refreshed on pathname change
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll-spy: watch all section anchors and highlight the one most in viewport.
  // [spec 1.13] Active nav item highlighted with cobalto background indicator.
  useEffect(() => {
    // Only run scroll-spy on the home page where sections exist.
    const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
    if (!isHome) {
      setActiveSection(null);
      return;
    }

    // Disconnect previous observer before creating a new one.
    observerRef.current?.disconnect();

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sections.length === 0) return;

    // Track intersection ratios to determine the "most visible" section.
    const ratioMap = new Map<SectionId, number>(SECTION_IDS.map((id) => [id, 0]));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratioMap.set(entry.target.id as SectionId, entry.intersectionRatio);
        }
        // Activate the section with the highest intersection ratio.
        let best: SectionId | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratioMap) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        setActiveSection(bestRatio > 0 ? best : null);
      },
      {
        // rootMargin: slight top offset so header doesn't overlap detection zone.
        rootMargin: '-64px 0px -40% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const section of sections) {
      observerRef.current.observe(section);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [pathname, locale]);

  // Nav items (always visible) mapped to in-page anchors on home, full paths elsewhere.
  // [design §3.5] Work → #work, About → #about, Capabilities → #capabilities, Contact → #contact
  const navItems: { id: SectionId; label: string; href: string }[] = [
    { id: 'work', label: t('nav.work'), href: `/${locale}#work` },
    { id: 'about', label: t('nav.about'), href: `/${locale}#about` },
    { id: 'capabilities', label: t('nav.capabilities'), href: `/${locale}#capabilities` },
    { id: 'contact', label: t('nav.contact'), href: `/${locale}#contact` },
  ];

  return (
    <header
      // [design §2.7] sticky top-0, z-index 10.
      className="sticky top-0 z-10 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-[var(--backdrop-blur)]"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Site wordmark / home link */}
        <Link
          href={`/${locale}`}
          className="font-display text-sm font-semibold tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-70"
        >
          Hector Reyes
        </Link>

        {/* Primary navigation [design §12.5] */}
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1">
            {navItems.map(({ id, label, href }) => {
              const isActive = activeSection === id;
              return (
                <li key={id}>
                  <Link
                    href={href}
                    // [spec 1.13] Active section: cobalto background indicator (CSS class swap).
                    className={[
                      'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[var(--accent-base)] text-[var(--accent-fg)]'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                    ].join(' ')}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}

            {/* [spec 1.14] Journal link — only rendered when journalEnabled === true */}
            {journalEnabled && (
              <li>
                <Link
                  href={`/${locale}/journal`}
                  className="rounded px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  {t('nav.journal')}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Controls: ThemeToggle + LocaleToggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </div>
    </header>
  );
}
