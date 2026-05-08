/**
 * lib/resend.ts — Resend client singleton + helpers.
 * [design §8] Newsletter pipeline: addToAudience() → resend.contacts.create().
 * [spec 3.4] Double opt-in via Resend Audiences.
 *
 * Defensive: RESEND_API_KEY and RESEND_AUDIENCE_ID are optional at build time.
 * If missing at runtime, helpers throw a descriptive error (caller catches it).
 * [task 9.2] Build MUST NOT fail when env vars are absent.
 */

/**
 * Lazy-initialize the Resend client to avoid importing the SDK at build time
 * (keeps cold-start small and prevents SSR/build failures when env is absent).
 * [design §14] Node runtime only — never called in Edge routes.
 */
async function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      '[resend] RESEND_API_KEY is not set. Configure it in .env.local or Vercel environment variables.',
    );
  }
  const { Resend } = await import('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Send an email via Resend.
 * Stub used by Slice 10 (contact form) — receives arbitrary send params.
 * Slice 10 will call this with full email payloads.
 * [design §7.3] contact.ts Server Action will call this.
 */
export async function sendEmail(params: {
  from: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<void> {
  const client = await getResendClient();
  const { error } = await client.emails.send(params);
  if (error) {
    throw new Error(`[resend] sendEmail failed: ${error.message}`);
  }
}

/**
 * Add a contact to the Resend Audience (newsletter subscribers).
 * [spec 3.4] Resend Audiences double opt-in.
 * [design §8] resend.contacts.create({ audienceId, email, firstName, unsubscribed: false })
 *
 * Throws on failure — caller (newsletter Server Action) handles error type.
 */
export async function addToAudience({
  email,
  firstName,
}: {
  email: string;
  firstName?: string;
}): Promise<void> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    throw new Error(
      '[resend] RESEND_AUDIENCE_ID is not set. Configure it in .env.local or Vercel environment variables.',
    );
  }

  const client = await getResendClient();
  const { error } = await client.contacts.create({
    audienceId,
    email,
    firstName: firstName ?? undefined,
    unsubscribed: false,
  });

  if (error) {
    throw error;
  }
}

/**
 * Detect Resend's 422 / "Contact already exists" error.
 * Resend returns a 422 with name "validation_error" or message containing "already exists".
 * [task 9.3] Used in the Server Action to return { ok: false, error: 'duplicate' }.
 */
export function isResendDuplicateError(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const err = e as Record<string, unknown>;
  // Resend SDK surfaces status code in err.statusCode
  if (typeof err.statusCode === 'number' && err.statusCode === 422) return true;
  // Fallback: message check
  if (typeof err.message === 'string') {
    return err.message.toLowerCase().includes('already exists');
  }
  return false;
}
