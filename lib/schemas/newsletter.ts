/**
 * lib/schemas/newsletter.ts — shared Zod schema for newsletter signup.
 * [spec 3.4] Email + optional name, single source of truth for RHF client and Server Action.
 * [design §8] Used in both SignupForm.tsx (client) and app/actions/newsletter.ts (server).
 */

import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(120).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
