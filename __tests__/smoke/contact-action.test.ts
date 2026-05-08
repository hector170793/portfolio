/**
 * __tests__/smoke/contact-action.test.ts — submitContact Server Action unit tests.
 * [spec 4.1–4.4] Happy path + error branches WITHOUT real API calls.
 * [design §7.3] Pipeline: Zod → Turnstile → Resend × 2.
 *
 * Mocks:
 *   - @/lib/turnstile → vi.mock (controls verifyTurnstile result)
 *   - @/lib/resend    → vi.mock (controls sendEmail result)
 *
 * No real network calls are made. Env vars are irrelevant for these tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist mocks before any imports that would pull in the real modules.
vi.mock('@/lib/turnstile', () => ({
  verifyTurnstile: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendEmail: vi.fn(),
}));

import { submitContact } from '@/app/actions/contact';
import { sendEmail } from '@/lib/resend';
import { verifyTurnstile } from '@/lib/turnstile';

// ── Typed mock helpers ───────────────────────────────────────────────────────

const mockVerifyTurnstile = verifyTurnstile as ReturnType<typeof vi.fn>;
const mockSendEmail = sendEmail as ReturnType<typeof vi.fn>;

// ── Valid input fixture ──────────────────────────────────────────────────────

const validInput = {
  name: 'Test User',
  email: 'test@example.com',
  company: '',
  project_type: 'other' as const,
  message: 'This is a test message that is at least ten characters long.',
  turnstileToken: 'valid-token-abc',
};

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('submitContact [spec 4.1–4.4]', () => {
  it('valid input + Turnstile pass + Resend success → { ok: true } [spec 4.1]', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce({ success: true });
    mockSendEmail.mockResolvedValue(undefined);

    const result = await submitContact(validInput);

    expect(result).toEqual({ ok: true });
    // Both emails sent (notification + auto-reply) [design §7.3]
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
  });

  it('missing required field → { ok: false, error: "validation" } [spec 4.3]', async () => {
    const invalidInput = { ...validInput, name: '' };

    const result = await submitContact(invalidInput);

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        error: 'validation',
      }),
    );
    // No Turnstile or Resend calls on Zod failure [spec 4.3]
    expect(mockVerifyTurnstile).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('Turnstile rejects token → { ok: false, error: "turnstile" } [spec 4.4]', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce({ success: false, reason: 'invalid-input-response' });

    const result = await submitContact(validInput);

    expect(result).toEqual({ ok: false, error: 'turnstile' });
    // No email sent on Turnstile failure [spec 4.4]
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('Resend throws → { ok: false, error: "send" } [design §7.3]', async () => {
    mockVerifyTurnstile.mockResolvedValueOnce({ success: true });
    mockSendEmail.mockRejectedValue(new Error('Resend network error'));

    const result = await submitContact(validInput);

    expect(result).toEqual({ ok: false, error: 'send' });
  });
});
