/**
 * __tests__/smoke/newsletter-action.test.ts — subscribeNewsletter Server Action unit tests.
 * [spec 3.3–3.4] Happy path + error branches WITHOUT real API calls.
 * [design §8] Newsletter pipeline: Zod → addToAudience.
 *
 * Mocks:
 *   - @/lib/resend → vi.mock (controls addToAudience + isResendDuplicateError)
 *
 * No real network calls. Env vars irrelevant for these tests.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Hoist mocks before any imports that would pull in the real modules.
vi.mock('@/lib/resend', () => ({
  addToAudience: vi.fn(),
  isResendDuplicateError: vi.fn(),
}));

import { subscribeNewsletter } from '@/app/actions/newsletter';
import { addToAudience, isResendDuplicateError } from '@/lib/resend';

// ── Typed mock helpers ───────────────────────────────────────────────────────

const mockAddToAudience = addToAudience as ReturnType<typeof vi.fn>;
const mockIsResendDuplicateError = isResendDuplicateError as ReturnType<typeof vi.fn>;

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('subscribeNewsletter [spec 3.3–3.4]', () => {
  it('valid email → { ok: true } [spec 3.3]', async () => {
    mockAddToAudience.mockResolvedValueOnce(undefined);

    const result = await subscribeNewsletter({ email: 'subscriber@example.com' });

    expect(result).toEqual({ ok: true });
    expect(mockAddToAudience).toHaveBeenCalledOnce();
    expect(mockAddToAudience).toHaveBeenCalledWith({
      email: 'subscriber@example.com',
      firstName: undefined,
    });
  });

  it('invalid email → { ok: false, error: "validation" } [spec 3.4]', async () => {
    const result = await subscribeNewsletter({ email: 'not-an-email' });

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        error: 'validation',
      }),
    );
    // No API call on client-detectable validation failure
    expect(mockAddToAudience).not.toHaveBeenCalled();
  });

  it('Resend duplicate (422) → { ok: false, error: "duplicate" } [task 9.3]', async () => {
    const duplicateError = new Error('Contact already exists');
    mockAddToAudience.mockRejectedValueOnce(duplicateError);
    mockIsResendDuplicateError.mockReturnValueOnce(true);

    const result = await subscribeNewsletter({ email: 'existing@example.com' });

    expect(result).toEqual({ ok: false, error: 'duplicate' });
  });

  it('Resend throws unknown → { ok: false, error: "unknown" } [design §8]', async () => {
    const unknownError = new Error('Unknown server error');
    mockAddToAudience.mockRejectedValueOnce(unknownError);
    mockIsResendDuplicateError.mockReturnValueOnce(false);

    const result = await subscribeNewsletter({ email: 'user@example.com' });

    expect(result).toEqual({ ok: false, error: 'unknown' });
  });
});
