'use server';

/**
 * app/actions/newsletter.ts — Server Action for newsletter signup.
 * [spec 3.4] Collects email + optional name; calls Resend Audiences API with double opt-in.
 * [design §8] Newsletter pipeline: validate → addToAudience → return result.
 * [design §14] Node runtime (Resend SDK uses Node primitives).
 *
 * MUST NOT require RESEND_API_KEY at build time — fails gracefully if missing at runtime.
 * [task 9.3] Duplicate email returns { ok: false, error: 'duplicate' } (Resend 422).
 */

import { addToAudience, isResendDuplicateError } from '@/lib/resend';
import { newsletterSchema } from '@/lib/schemas/newsletter';

export type NewsletterResult =
  | { ok: true }
  | { ok: false; error: 'validation'; fieldErrors: Record<string, string[]> }
  | { ok: false; error: 'duplicate' }
  | { ok: false; error: 'unknown' };

export async function subscribeNewsletter(input: unknown): Promise<NewsletterResult> {
  // [spec 3.4] Server-side validation with shared Zod schema.
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'validation',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await addToAudience({
      email: parsed.data.email,
      firstName: parsed.data.name,
    });
    return { ok: true };
  } catch (e) {
    // Resend 422 → duplicate contact [task 9.3]
    if (isResendDuplicateError(e)) {
      return { ok: false, error: 'duplicate' };
    }
    console.error('[newsletter] Subscription failed:', e);
    return { ok: false, error: 'unknown' };
  }
}
