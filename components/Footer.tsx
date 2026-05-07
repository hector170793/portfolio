/**
 * Footer — site footer.
 * [design §3.5] Server Component.
 * [design §12.5] <nav aria-label="Footer"> for social links.
 * [spec 5.10] All UI strings from messages catalog.
 *
 * Includes:
 *  - Social links with rel="me" [design §3.5]
 *  - Newsletter signup placeholder slot (wired in Slice 9)
 *  - Copyright text from messages
 *  - "Built with Next.js" attribution
 */

import { getTranslations } from 'next-intl/server';

export default async function Footer() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear().toString();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Left: brand + copyright */}
          <div className="flex flex-col gap-3">
            <p className="font-display text-sm font-semibold tracking-tight text-[var(--foreground)]">
              Hector Reyes Pérez
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">{t('copyright', { year })}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t('builtWith')}</p>
          </div>

          {/* Center: social links [design §3.5] */}
          <nav aria-label="Footer">
            <ul className="flex items-center gap-6">
              <li>
                <a
                  href="https://github.com/hector170793"
                  rel="me noopener noreferrer"
                  target="_blank"
                  className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/hector-reyes-perez"
                  rel="me noopener noreferrer"
                  target="_blank"
                  className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </nav>

          {/* Right: newsletter signup placeholder slot [design §3.5] */}
          {/* Real signup wired in Slice 9 (Newsletter/SignupForm.tsx) */}
          <section aria-label={t('signupCta')}>
            {/* Slice 9 will render <NewsletterSignupForm /> here */}
            <p className="text-xs text-[var(--muted-foreground)]">{t('signupCta')}</p>
          </section>
        </div>
      </div>
    </footer>
  );
}
