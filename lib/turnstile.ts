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
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not set in env — check .env.local');
    return { success: false, reason: 'missing-secret' };
  }

  // Log helpful diagnostics (no secrets) so dev can pinpoint why verification fails.
  const secretPreview = `${secret.slice(0, 8)}…(${secret.length} chars)`;
  const tokenPreview = `${token.slice(0, 12)}…(${token.length} chars)`;

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });

    const data = (await res.json()) as CloudflareSiteverifyResponse;

    if (!data.success) {
      console.error('[turnstile] siteverify REJECTED token:', {
        errorCodes: data['error-codes'],
        secretPreview,
        tokenPreview,
        hint: data['error-codes']?.includes('invalid-input-secret')
          ? 'TURNSTILE_SECRET_KEY does not match the widget. Check that site key + secret key are from the SAME pair in Cloudflare dashboard.'
          : data['error-codes']?.includes('invalid-input-response')
            ? 'Token rejected — likely site key + secret key mismatch (different widgets), OR the widget is configured for a hostname that does not include localhost. Add localhost to allowed hostnames in Cloudflare Turnstile widget settings, OR use the always-pass test keys: site=1x00000000000000000000AA, secret=1x0000000000000000000000000000000AA.'
            : data['error-codes']?.includes('timeout-or-duplicate')
              ? 'Token expired or already used. Tokens are single-use and last 5 minutes — refresh the page and try again.'
              : 'Unknown error — check Cloudflare Turnstile docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes',
      });
    }

    return {
      success: data.success,
      reason: data['error-codes']?.join(','),
    };
  } catch (e) {
    console.error('[turnstile] siteverify request failed:', e);
    return { success: false, reason: 'verify-error' };
  }
}
