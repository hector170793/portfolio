/**
 * Capabilities — grouped skill categories section. [Server Component]
 * [spec 1.10] Skills in grouped categories. NO numeric levels, NO star ratings,
 *             NO progress bars. Groups: Frontend, Backend, Architecture, Tooling/DevOps.
 * [spec 1.1]  Section order position: after About, before Journal Preview.
 * [spec 8.5]  Semantic <section> landmark with aria-labelledby + <h2>.
 * [spec 5.10] All strings from messages/capabilities — no hardcoded text.
 * [design §3.3] Server component — pure content, no interactivity.
 *
 * Editorial visual language:
 *   - Heading: Fraunces display, --fs-h1 scale
 *   - Group names: Inter semi-bold, --fs-h3 scale
 *   - Skills: Inter body, --fs-body, generous leading
 *   - Mono accent label ("02 / Capabilities") before heading
 *   - 2-column grid at lg+ (Frontend | Backend row 1, Architecture | Tooling row 2)
 *   - Single column on mobile
 *   - Cobalto bullet (·) as subtle mono marker before each skill
 */

import { getTranslations } from 'next-intl/server';

type CapabilitiesProps = {
  locale: string;
};

export async function Capabilities({ locale }: CapabilitiesProps) {
  // [spec 5.10] Load capabilities namespace from messages/{locale}.json
  const t = await getTranslations({ locale, namespace: 'capabilities' });

  // [spec 1.10] 4 groups — labels from messages, skills arrays from messages.
  // [design §3.3] No levels, no ratings — clean list per group.
  const groups = [
    {
      label: t('groups.frontend.label'),
      skills: t.raw('groups.frontend.skills') as string[],
    },
    {
      label: t('groups.backend.label'),
      skills: t.raw('groups.backend.skills') as string[],
    },
    {
      label: t('groups.architecture.label'),
      skills: t.raw('groups.architecture.skills') as string[],
    },
    {
      label: t('groups.tooling.label'),
      skills: t.raw('groups.tooling.skills') as string[],
    },
  ];

  return (
    /*
     * [spec 8.5] <section> landmark.
     * id="capabilities" provides scroll-spy anchor [spec 1.13] and nav href target.
     */
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      style={{
        paddingTop: 'clamp(6rem, 10vw, 12rem)',
        paddingBottom: 'clamp(6rem, 10vw, 12rem)',
        paddingLeft: 'clamp(1.5rem, 5vw, 5rem)',
        paddingRight: 'clamp(1.5rem, 5vw, 5rem)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/*
       * Mono accent label — editorial flourish.
       * [design §2.3] JetBrains Mono, --fs-mono scale.
       */}
      <p
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-mono)',
          lineHeight: 'var(--lh-mono)',
          color: 'var(--accent-text)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}
      >
        02 / Capabilities
      </p>

      {/*
       * [spec 8.5] <h2> heading — continues from h1 (hero-heading), h2 (about-heading).
       * Fraunces display weight.
       * [design §2.3] --fs-h1 clamp range.
       */}
      <h2
        id="capabilities-heading"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.25rem, 2vw + 1.75rem, 4.5rem)',
          lineHeight: '1.04',
          letterSpacing: '-0.025em',
          color: 'var(--foreground)',
          fontWeight: 300,
          marginBottom: 'clamp(3rem, 5vw, 6rem)',
        }}
      >
        {t('title')}
      </h2>

      {/*
       * [spec 1.10] 2-column grid at lg+ (≥ 1024px), single column below.
       * Row 1: Frontend | Backend. Row 2: Architecture | Tooling.
       * CSS Grid auto-fill with minmax for responsive adaptation.
       */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 22rem), 1fr))',
          gap: 'clamp(2.5rem, 5vw, 5rem) clamp(2rem, 6vw, 6rem)',
          maxWidth: '72rem',
        }}
      >
        {groups.map((group) => (
          <div key={group.label}>
            {/*
             * Group name — Inter semi-bold, --fs-h3 scale.
             * Acts as a visual heading for its skill list.
             * [design §2.3]
             */}
            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--fs-h3)',
                lineHeight: 'var(--lh-h3)',
                letterSpacing: '-0.01em',
                color: 'var(--foreground)',
                fontWeight: 600,
                marginBottom: '1.25rem',
              }}
            >
              {group.label}
            </h3>

            {/*
             * Skill list — [spec 1.10] plain list, no levels/bars/ratings.
             * <ul>/<li> semantics for screen readers.
             * Cobalto "·" mono marker as subtle accent.
             */}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.625rem',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--fs-body)',
                    lineHeight: 'var(--lh-body)',
                    letterSpacing: 'var(--ls-body)',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {/*
                   * Cobalto mono accent marker — decorative, hidden from AT.
                   * [design §2.3] JetBrains Mono, accent-text color.
                   */}
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-mono)',
                      color: 'var(--accent-text)',
                      flexShrink: 0,
                      lineHeight: 1,
                      userSelect: 'none',
                    }}
                  >
                    ·
                  </span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
