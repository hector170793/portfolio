// lib/content/journal-enabled.ts
// Build-time gating helper for the Journal section and nav link.
// Decision: auto-detection of content/journal/ files (NOT an env flag).
// [design §15, spec 1.11, spec 1.14, spec 3.7]
//
// Returns true when at least one non-draft journal post exists in the velite
// collection. Called at build time by:
//   - home/JournalPreview.tsx — to conditionally render the section
//   - Header.tsx — to conditionally render the "Journal" nav link
//   - app/[locale]/journal/page.tsx — to choose list vs. empty-state

import { journal } from '../../.velite';

/**
 * Returns true if at least one published (non-draft) journal post exists.
 * This is evaluated at build time — velite generates `.velite/index.js`
 * before Next.js compiles pages.
 */
export function journalEnabled(): boolean {
  return journal.filter((p) => !p.draft).length > 0;
}
