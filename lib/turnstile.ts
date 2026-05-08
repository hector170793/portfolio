/**
 * lib/turnstile.ts — Cloudflare Turnstile siteverify wrapper.
 * [design §7.5] Server-side token verification for the contact form.
 * [spec 4.9] Bot-protection MUST silently degrade (not crash) when TURNSTILE_SECRET_KEY is absent.
 *
 * Defensive: if TURNSTILE_SECRET_KEY is not set at runtime, returns success:false
 * with reason 'missing-secret'. Build never fails without the key.
 *
 * Dev test values (always-pass):
 *   Site key:   1x00000000000000000000AA
 *   Secret key: 1x0000000000000000000000000000000AA
 */

interface TurnstileVerifyResult {
  success: boolean;
  reason?: string;
}

interface CloudflareSiteverifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

/**
 * Verifies a Turnstile token with Cloudflare's siteverify endpoint.
 * [design §7.5] Called server-side inside the submitContact Server Action.
 *
 * @returns { success: true } on valid token.
 * @returns { success: false, reason } on invalid token, missing env var, or network error.
 */
export async function verifyTurnstile(token: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: false, reason: 'missing-secret' };
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });

    const data = (await res.json()) as CloudflareSiteverifyResponse;
    return {
      success: data.success,
      reason: data['error-codes']?.join(','),
    };
  } catch (e) {
    console.error('[turnstile] siteverify request failed:', e);
    return { success: false, reason: 'verify-error' };
  }
}
