/**
 * lib/schemas/contact-form.ts — shared Zod schema for the contact form.
 * [spec 4] Single source of truth for RHF client validation and Server Action server-side parse.
 * [design §7.2] contactSchema — 5 visible fields + turnstileToken.
 *
 * Shared between:
 *   - app/[locale]/contact/ContactForm.tsx (RHF zodResolver, client-side)
 *   - app/actions/contact.ts (safeParse, server-side)
 */

import { z } from 'zod';

/** [design §7.2] Allowed values for the project_type dropdown. */
export const PROJECT_TYPES = ['full-time', 'contract', 'consulting', 'other'] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/**
 * [design §7.2] Contact form schema — 5 visible fields + hidden Turnstile token.
 *
 * - name:          required, 1–120 chars
 * - email:         required, valid email, max 254 chars
 * - company:       optional — accepts empty string or undefined
 * - project_type:  required enum from PROJECT_TYPES
 * - message:       required, min 10 chars (so single-word messages are rejected), max 4000
 * - turnstileToken: required for bot-protection; validated server-side via siteverify
 */
export const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  company: z.string().max(120).optional().or(z.literal('')),
  project_type: z.enum(PROJECT_TYPES),
  message: z.string().min(10).max(4000),
  turnstileToken: z.string().min(1),
});

export type ContactInput = z.infer<typeof contactSchema>;
