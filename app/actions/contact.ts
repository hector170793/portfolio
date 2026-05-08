'use server';

/**
 * app/actions/contact.ts — Server Action for the contact form.
 * [spec 4.3] Server Action: validate → verify bot token → send emails.
 * [design §7.3] Pipeline: Zod parse → Turnstile siteverify → Promise.all(Resend × 2)
 * [design §14]  Node runtime — Resend SDK uses Node primitives.
 *
 * Pipeline (exact order per design §7.3):
 *   1. Zod parse — if fail → { ok:false, error:'validation', fieldErrors }. NO emails sent.
 *   2. Turnstile verify — if fail → { ok:false, error:'turnstile' }. NO emails sent.
 *   3. Promise.all — two Resend sends in parallel (notification + auto-reply).
 *   4. Catch any send error → { ok:false, error:'send' }. Logs to console.
 *   5. Success → { ok:true }.
 *
 * MUST NOT require RESEND_API_KEY or TURNSTILE_SECRET_KEY at build time.
 * Fails gracefully at runtime when env vars are absent [spec 4.11].
 */

import { sendEmail } from '@/lib/resend';
import { contactSchema } from '@/lib/schemas/contact-form';
import { verifyTurnstile } from '@/lib/turnstile';

/** [design §7.3] Typed result union for the submitContact Server Action. */
export type ContactResult =
  | { ok: true }
  | { ok: false; error: 'validation'; fieldErrors: Record<string, string[]> }
  | { ok: false; error: 'turnstile' }
  | { ok: false; error: 'send' }
  | { ok: false; error: 'unknown' };

/**
 * Submit the contact form.
 * Called from ContactForm.tsx (client component) via React Server Action binding.
 *
 * @param input - Raw (unknown) form data. Zod validates before any side effects.
 */
export async function submitContact(input: unknown): Promise<ContactResult> {
  // ── 1. Zod validation ────────────────────────────────────────────────────────
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'validation',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, company, project_type, message, turnstileToken } = parsed.data;

  // ── 2. Turnstile verification ────────────────────────────────────────────────
  // [design §7.3] NO emails sent before this passes.
  const turnstile = await verifyTurnstile(turnstileToken);
  if (!turnstile.success) {
    return { ok: false, error: 'turnstile' };
  }

  // ── 3. Send emails (parallel) ────────────────────────────────────────────────
  const destEmail = process.env.CONTACT_DEST_EMAIL ?? 'hector170793@gmail.com';
  const fromAddress = 'noreply@hector-reyes.work';

  // [design §7.4] Notification email to Hector (HTML table with all fields)
  const notificationHtml = buildNotificationEmail({ name, email, company, project_type, message });

  // [design §7.4] Auto-reply to the sender
  const autoReplyHtml = buildAutoReplyEmail({ name, message });

  try {
    await Promise.all([
      sendEmail({
        from: fromAddress,
        to: destEmail,
        replyTo: email,
        subject: `New brief from ${name} — ${project_type}`,
        html: notificationHtml,
      }),
      sendEmail({
        from: fromAddress,
        to: email,
        subject: 'Got your brief — Hector Reyes',
        html: autoReplyHtml,
      }),
    ]);

    return { ok: true };
  } catch (e) {
    console.error('[contact] Email send failed:', e);
    return { ok: false, error: 'send' };
  }
}

// ── Email template builders ──────────────────────────────────────────────────

/**
 * [design §7.4] Notification email to Hector — semantic HTML table.
 * Reply-To is set to input.email at the sendEmail call site.
 */
function buildNotificationEmail(data: {
  name: string;
  email: string;
  company?: string;
  project_type: string;
  message: string;
}): string {
  const escapedMessage = data.message.replace(/\n/g, '<br>');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New brief</title></head>
<body style="font-family: sans-serif; color: #15120E; background: #FAF7F2; padding: 24px;">
  <h1 style="font-size: 24px; margin-bottom: 24px;">New brief</h1>
  <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
    <tr>
      <th style="text-align:left; padding: 8px 12px; background:#F1ECE3; border: 1px solid #DDD5C8; width: 120px;">Name</th>
      <td style="padding: 8px 12px; border: 1px solid #DDD5C8;">${data.name}</td>
    </tr>
    <tr>
      <th style="text-align:left; padding: 8px 12px; background:#F1ECE3; border: 1px solid #DDD5C8;">Email</th>
      <td style="padding: 8px 12px; border: 1px solid #DDD5C8;"><a href="mailto:${data.email}">${data.email}</a></td>
    </tr>
    <tr>
      <th style="text-align:left; padding: 8px 12px; background:#F1ECE3; border: 1px solid #DDD5C8;">Company</th>
      <td style="padding: 8px 12px; border: 1px solid #DDD5C8;">${data.company || '—'}</td>
    </tr>
    <tr>
      <th style="text-align:left; padding: 8px 12px; background:#F1ECE3; border: 1px solid #DDD5C8;">Type</th>
      <td style="padding: 8px 12px; border: 1px solid #DDD5C8;">${data.project_type}</td>
    </tr>
    <tr>
      <th style="text-align:left; padding: 8px 12px; background:#F1ECE3; border: 1px solid #DDD5C8; vertical-align: top;">Message</th>
      <td style="padding: 8px 12px; border: 1px solid #DDD5C8; white-space: pre-wrap;">${escapedMessage}</td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * [design §7.4] Auto-reply to the person who submitted the form.
 * Editorial 2-paragraph confirmation + quoted submitted message + signed "— Hector".
 */
function buildAutoReplyEmail(data: { name: string; message: string }): string {
  const escapedMessage = data.message.replace(/\n/g, '<br>');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Got your brief</title></head>
<body style="font-family: sans-serif; color: #15120E; background: #FAF7F2; padding: 24px; max-width: 600px;">
  <p style="font-size: 16px; line-height: 1.6;">Hi ${data.name},</p>
  <p style="font-size: 16px; line-height: 1.6;">
    I received your brief and I'm looking forward to reading through it. I'll get back to you
    within 48 hours with initial thoughts.
  </p>
  <p style="font-size: 16px; line-height: 1.6;">
    In the meantime — if anything changes or you want to add context, just reply to this email.
  </p>
  <blockquote style="border-left: 3px solid #1E47B8; margin: 24px 0; padding: 12px 16px; color: #6B655B; font-style: italic; background: #F1ECE3;">
    ${escapedMessage}
  </blockquote>
  <p style="font-size: 16px; line-height: 1.6;">— Hector</p>
</body>
</html>`;
}
