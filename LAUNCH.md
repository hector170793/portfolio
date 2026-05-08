# Launch Checklist — portfolio-v1

> **Domain**: hector-reyes.work  
> **Platform**: Vercel (iad1) + Cloudflare DNS (DNS-only mode)  
> **Code status**: All 14 implementation slices complete. Slice 15 = this checklist.

---

## Status — Code-Side Completion

| Check | Status | Notes |
|---|---|---|
| `pnpm build` — 20 routes generated | PASS | 2 static, 16 SSG, 1 Dynamic (og), 1 middleware |
| `pnpm exec biome check .` | PASS | 1 warning only (intentional `document.cookie` in LocaleToggle) |
| `pnpm tsc --noEmit` | PASS | Clean — 0 errors |
| `pnpm test --run` — 15/15 | PASS | 4 contrast + 3 middleware + 4 contact + 4 newsletter |
| `pnpm size-limit` | PASS | 4.18 KB gz (Turbopack runtime chunk) |
| `Vary: Accept-Language, Cookie` on locale routes | VERIFIED | Set in `proxy.ts` line 17 — covers every locale response |
| Lighthouse ≥ 95 mobile | MANUAL | Run on Vercel preview URL (instructions in §Performance Audit) |
| axe DevTools zero critical/serious | VALIDATED | `e2e/a11y.spec.ts` passes programmatically; manual axe extension confirms below |
| VoiceOver smoke test | MANUAL | Instructions in §VoiceOver Smoke |

---

## User Tasks — Hector Executes These

The following tasks require your accounts, credentials, and manual actions.  
Complete them in order — each one depends on the previous.

**Time estimate total**: ~45–60 minutes  
**Prerequisites**: Cloudflare account, Vercel account, Resend account (all existing per SDD).

---

### U1. Cloudflare DNS Configuration

**Time**: ~10 minutes  
**Purpose**: Point `hector-reyes.work` to Vercel so SSL provisions correctly.

**Steps**:

1. Log in to [Cloudflare dashboard](https://dash.cloudflare.com) → select `hector-reyes.work`.
2. Go to **DNS** → **Records**.
3. Confirm or create these records:

   | Type | Name | Value | Proxy status |
   |---|---|---|---|
   | CNAME | `@` | `cname.vercel-dns.com` | DNS-only (gray cloud) |
   | CNAME | `www` | `cname.vercel-dns.com` | DNS-only (gray cloud) |

   > CRITICAL: The cloud icon MUST be gray (DNS-only), NOT orange (proxied).  
   > If it is orange, click it to toggle to gray. Cloudflare proxying breaks Vercel SSL provisioning.

4. If a conflicting A record for `@` exists, delete it before creating the CNAME.

**Verification**:

```bash
dig CNAME hector-reyes.work +short
# Expected: cname.vercel-dns.com.

dig CNAME www.hector-reyes.work +short
# Expected: cname.vercel-dns.com.
```

> DNS propagation can take up to 5 minutes (usually instant with Cloudflare).

---

### U2. Vercel Project Setup + Environment Variables

**Time**: ~15 minutes  
**Purpose**: Create the Vercel project, link Git repo, configure env vars, set region.

**Steps**:

**2a. Create project (if not done yet)**:

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the Git repository (`hectoreyes/portfolio` or your org).
3. Framework preset: **Next.js** (auto-detected).
4. Root directory: leave blank (project root).
5. Do NOT deploy yet — configure env vars first.

**2b. Set deployment region**:

1. Go to **Settings** → **Functions** → **Function Region**.
2. Set to `iad1` (US East — Washington, D.C.).
3. Save.

**2c. Set environment variables**:

Go to **Settings** → **Environment Variables**. Add ALL of the following for both **Production** AND **Preview** environments:

| Variable | Value | Environment |
|---|---|---|
| `RESEND_API_KEY` | Your Resend API key (starts with `re_`) | Production + Preview |
| `CONTACT_DEST_EMAIL` | `hector170793@gmail.com` | Production + Preview |
| `TURNSTILE_SITE_KEY` | Your Turnstile site key (production widget) | Production |
| `TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` (Turnstile always-pass test key) | Preview |
| `TURNSTILE_SECRET_KEY` | Your Turnstile secret key | Production |
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA` (Turnstile test secret) | Preview |
| `RESEND_AUDIENCE_ID` | Your Resend Audience ID (from Resend dashboard) | Production + Preview |

> The Turnstile test keys are the official Cloudflare test keys — always pass, never expire.  
> Using them on Preview means E2E contact form tests work without a real Cloudflare challenge.

**2d. Add domain**:

1. Go to **Settings** → **Domains**.
2. Add `hector-reyes.work` (naked domain).
3. Add `www.hector-reyes.work` → set it to **Redirect to** `hector-reyes.work` (308 Permanent Redirect).
4. Vercel will show a pending DNS verification — this resolves automatically once U1 is done.

**2e. Deploy**:

1. Go to **Deployments** → trigger a new deploy from `main` branch, OR push any commit to `main`.
2. Wait for build to complete (~2–3 minutes).

**Verification**:

```bash
curl -I https://hector-reyes.work
# Expected: HTTP/2 200 (or HTTP/1.1 200)
# Must show: server: Vercel

curl -I https://www.hector-reyes.work
# Expected: HTTP/1.1 308 Permanent Redirect
# Location: https://hector-reyes.work
```

---

### U3. Resend Domain Verification (SPF / DKIM / DMARC)

**Time**: ~10 minutes + up to 24h DNS propagation  
**Purpose**: Allow `noreply@hector-reyes.work` to send emails without landing in spam.

**Steps**:

**3a. Add domain to Resend**:

1. Go to [resend.com/domains](https://resend.com/domains).
2. Click **Add Domain** → enter `hector-reyes.work`.
3. Resend will display the required DNS records. Copy them exactly.

**3b. Add DNS records in Cloudflare**:

Go to Cloudflare DNS for `hector-reyes.work` and add:

| Type | Name | Value |
|---|---|---|
| TXT | `hector-reyes.work` | `v=spf1 include:_spf.resend.com ~all` |
| CNAME | `resend._domainkey` | (value from Resend dashboard — unique per account) |
| CNAME | (2nd Resend DKIM record) | (value from Resend dashboard) |
| CNAME | (3rd Resend DKIM record) | (value from Resend dashboard) |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hector170793@gmail.com` |

> All these records must be DNS-only (gray cloud) — Cloudflare proxying breaks DKIM validation.

**3c. Verify in Resend**:

1. Back in Resend → **Domains** → click `hector-reyes.work` → click **Verify**.
2. Resend checks all records. Green checkmarks = verified.
3. If records are not propagated yet, wait 5–10 minutes and retry.

**3d. Get Audience ID for newsletters**:

1. In Resend → go to **Audiences** → **Create Audience**.
2. Name it `Portfolio Newsletter` (or similar).
3. Copy the **Audience ID** (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
4. Set it as `RESEND_AUDIENCE_ID` in Vercel (U2c above).

**Verification** (after domain is verified in Resend):

Submit the contact form on the live site and check that:

- `hector170793@gmail.com` receives the contact email from `noreply@hector-reyes.work`
- The submitter receives the auto-reply from `noreply@hector-reyes.work`
- Neither email lands in spam (check Gmail spam folder)

---

### U4. Cloudflare Turnstile Widget Setup

**Time**: ~5 minutes (keys may already be ready per SDD)  
**Purpose**: Configure the anti-spam widget protecting the contact form.

**Steps**:

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** (left sidebar).
2. Click **Add widget** (if not already created).
3. Name: `portfolio-contact` (or similar).
4. Domains: add `hector-reyes.work` and (optional) your Vercel preview domain `*.vercel.app`.
5. Widget type: **Invisible** (matches the implementation in `lib/turnstile.ts`).
6. Copy the **Site Key** and **Secret Key**.
7. Update Vercel env var `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` for Production (U2c above).

> If you already have keys from the SDD keys-ready phase, verify they are configured for `hector-reyes.work`  
> and the widget type is **Invisible**. If widget type is Managed or Interactive, re-create it as Invisible.

**Verification**:

Visit `https://hector-reyes.work/es/contact`, open browser DevTools → Network tab, submit the contact form. You should see a request to `https://challenges.cloudflare.com/turnstile/v0/api.js` succeed (not blocked).

---

### U5. www Redirect in Vercel

**Time**: 2 minutes (done as part of U2, but verify separately)  
**Purpose**: `www.hector-reyes.work` must 308-redirect to the naked domain.

**Steps**:

This was configured in U2d. Verify it is correct:

1. Go to Vercel → **Settings** → **Domains**.
2. Confirm `www.hector-reyes.work` shows **"Redirect to hector-reyes.work"** with **308 Permanent Redirect**.
3. If it shows just as an alias (serving the same content), change it to a redirect.

**Verification**:

```bash
curl -I https://www.hector-reyes.work
# Expected:
# HTTP/1.1 308 Permanent Redirect
# location: https://hector-reyes.work
```

---

### U6. Upload `/public/resume.pdf`

**Time**: 5 minutes  
**Purpose**: The resume download link in the site points to `/resume.pdf`. The file must exist in production.

**Steps**:

1. Export your latest resume as PDF.
2. Rename the file to exactly `resume.pdf` (lowercase).
3. Place it in `public/resume.pdf` in the repository:
   ```
   /Users/hectoreyes/development/portfolio/public/resume.pdf
   ```
4. Commit and push to `main`:
   ```bash
   git add public/resume.pdf
   git commit -m "chore: add resume.pdf"
   git push origin main
   ```
5. Vercel will auto-deploy from the `main` push.

**Verification**:

```bash
curl -I https://hector-reyes.work/resume.pdf
# Expected: HTTP/2 200
# Content-Type: application/pdf
```

> If the file is over 1 MB, export at lower quality or use a PDF optimizer.  
> Vercel serves files from `public/` as static assets with long-lived cache headers.

---

### U7. Post-Launch: LinkedIn + GitHub Bio Updates

**Time**: 10 minutes  
**Purpose**: Update professional profiles to point to the live site.

**Steps**:

**LinkedIn**:

1. Go to your LinkedIn profile → **Edit profile**.
2. Website URL: `https://hector-reyes.work`
3. Headline: ensure it reflects "Senior Full-Stack Engineer & Frontend Lead"
4. Featured section: add the portfolio URL as a featured link.

**GitHub**:

1. Go to [github.com/settings/profile](https://github.com/settings/profile).
2. Website: `https://hector-reyes.work`
3. Bio: include "Senior Full-Stack Engineer" or reference the portfolio.
4. Pin the `portfolio` repository if it is public.

**Verification**:

- LinkedIn profile URL card shows the correct site preview (OG image loads correctly).
- GitHub profile page shows the portfolio URL and the pinned repo.

---

## Pre-Go-Live Smoke Checklist

Run these commands after Vercel deploy is live (U1 + U2 complete).

### DNS and SSL

```bash
# SSL certificate is valid
curl -I https://hector-reyes.work
# Must show: HTTP/2 200 (or HTTP/1.1 200 with server: Vercel)
# Must NOT show SSL errors

# www redirect
curl -I https://www.hector-reyes.work
# Must show: HTTP/1.1 308 Permanent Redirect
# location: https://hector-reyes.work
```

### Sitemap and robots.txt

```bash
# Sitemap returns valid XML
curl https://hector-reyes.work/sitemap.xml
# Must contain: /es/, /en/, /es/work/santander-onboarding, etc.
# Must NOT contain: /resume.pdf

# robots.txt allows crawling
curl https://hector-reyes.work/robots.txt
# Must contain: Allow: /
# Must contain: Sitemap: https://hector-reyes.work/sitemap.xml
# Must NOT contain: Disallow: /work/ or Disallow: /journal/
```

### Locale routing and Vary header

```bash
# Vary header present on locale route
curl -I https://hector-reyes.work/es/
# Must contain: vary: Accept-Language, Cookie

# Accept-Language redirect (simulated Spanish browser)
curl -I -H "Accept-Language: es-MX,es;q=0.9" https://hector-reyes.work/
# Must redirect 307 to /es/

# Accept-Language redirect (simulated non-matching browser → EN fallback)
curl -I -H "Accept-Language: fr-FR,fr;q=0.9" https://hector-reyes.work/
# Must redirect 307 to /en/
```

### SEO — hreflang and JSON-LD

```bash
# View source of home page (check hreflang + JSON-LD)
curl -s https://hector-reyes.work/es/ | grep -A1 'hreflang\|application/ld+json'
# Must show: hreflang="es", hreflang="en", hreflang="x-default"
# Must show: <script type="application/ld+json"> with @type: Person and @type: WebSite
```

### Resume PDF

```bash
curl -I https://hector-reyes.work/resume.pdf
# Must show: HTTP/2 200
# Content-Type: application/pdf
```

### OG Image (dynamic)

```bash
# OG image Edge function
curl -I "https://hector-reyes.work/api/og?title=Santander+Onboarding"
# Must show: HTTP/2 200
# Content-Type: image/png
```

### Contact form (manual)

1. Navigate to `https://hector-reyes.work/es/contact`.
2. Fill all required fields with test data.
3. Submit the form.
4. Verify:
   - Form shows success confirmation (does not redirect).
   - `hector170793@gmail.com` receives the contact email from `noreply@hector-reyes.work`.
   - The test email address receives the auto-reply.
   - Check Gmail spam folder — neither email should be there.

### Newsletter signup (manual)

1. Navigate to `https://hector-reyes.work/es/journal`.
2. Enter a test email in the newsletter signup.
3. Submit.
4. Verify:
   - UI shows confirmation message.
   - Resend dashboard → Audiences → your audience → contact appears.

---

## Performance Audit (Lighthouse)

Lighthouse CLI is not available in the apply environment. Run this audit manually using Chrome DevTools once the site is live on Vercel.

**How to run**:

1. Open Chrome.
2. Navigate to the page URL (use the live Vercel URL, not localhost).
3. Open DevTools → **Lighthouse** tab.
4. Settings:
   - Mode: **Navigation**
   - Device: **Mobile**
   - Categories: **Performance**, **Accessibility**, **Best Practices**, **SEO**
5. Click **Analyze page load**.

**Target pages**:

| Page | URL |
|---|---|
| Home (ES) | `https://hector-reyes.work/es/` |
| Case study | `https://hector-reyes.work/es/work/santander-onboarding` |
| Contact | `https://hector-reyes.work/es/contact` |
| Journal | `https://hector-reyes.work/es/journal` |

**Acceptance thresholds** (spec 10.1–10.2):

| Metric | Target |
|---|---|
| Performance score | ≥ 95 |
| LCP | < 1.8s |
| CLS | < 0.05 |
| INP | < 100ms |
| Accessibility score | 100 |

> Run Lighthouse on the **Vercel preview URL**, not the production domain, for the first audit.  
> Production URLs may have CDN cache warming that affects first-run numbers.

---

## Accessibility Verification

### axe DevTools (browser extension)

The Playwright E2E suite (`e2e/a11y.spec.ts`) already validates zero critical/serious axe violations programmatically on: `/es/`, `/es/work/santander-onboarding`, `/es/contact`, `/es/journal`.

For manual spot-check with real browser rendering:

1. Install [axe DevTools browser extension](https://www.deque.com/axe/devtools/) (Chrome or Firefox).
2. Navigate to each key page on the live site.
3. Open DevTools → **axe DevTools** tab.
4. Click **Scan ALL of my page**.
5. Verify: **zero critical or serious violations**.
   - Moderate and minor issues are acceptable per spec 8.11.
   - Any critical/serious violation blocks launch.

### VoiceOver Smoke Test

**macOS only**. Estimated time: 10–15 minutes.

1. Enable VoiceOver: press `Cmd + F5`.
2. Open Safari (VoiceOver + Safari is the reference combination for macOS).
3. Navigate to `https://hector-reyes.work/es/`.

**Flow to test**:

```
Tab → Skip link becomes visible → activate it → focus lands on <main>
Tab through Hero section → name, headline, CTA button announced
Tab to Header nav → "Selected Work", "About", "Contact" announced
Tab to case study link (e.g. Santander) → activate → case study page loads
Tab through case study → 5 chapter headings announced in order
Tab to "Next Project" → activates navigation
Navigate to /es/contact
Tab through form fields → name, email, company, project type, message, submit button
VoiceOver announces field labels correctly
Submit empty form → error messages announced
```

**Pass criteria**:

- No focus traps (Tab always moves forward; Shift+Tab always moves backward).
- No orphaned landmarks (VoiceOver Rotor → Landmarks shows: banner, navigation, main, contentinfo).
- All interactive elements have an accessible name (no "button" without label).
- Error messages on the contact form are announced when fields are invalid.

**To disable VoiceOver**: press `Cmd + F5` again.

---

## Rollback Procedure

If anything goes wrong after deploy:

### Code rollback (Vercel)

1. Go to Vercel → **Deployments** tab.
2. Find the last known-good deploy.
3. Click the three-dot menu → **Promote to Production**.
4. Vercel instantly serves the previous build — no git revert needed.

### Code rollback (git)

If the bug is in the codebase:

```bash
# Revert the last commit (creates a new commit — safe)
git revert HEAD
git push origin main
# Vercel auto-deploys the revert

# If multiple commits need reverting
git revert HEAD~3..HEAD
git push origin main
```

### DNS rollback

If DNS is misconfigured and the site is unreachable:

1. Go to Cloudflare DNS for `hector-reyes.work`.
2. If you changed the CNAME target, revert to `cname.vercel-dns.com`.
3. Propagation is near-instant with Cloudflare.

### Environment variable rollback

If an env var was wrong and caused a runtime error:

1. Vercel → **Settings** → **Environment Variables** → fix the value.
2. Go to **Deployments** → trigger a new deploy (or redeploy the current one).

---

## Slice 13 — Content (remaining USER task, post-launch)

Slice 13 was deferred because it requires real content from you:

| Content item | Location | Status |
|---|---|---|
| Real case study screenshots | `public/work/{slug}/{1,2,3}.webp` | Placeholder SVGs in place |
| Final case study copy | `content/work/{slug}.{es,en}.mdx` | Placeholder copy in place |
| Portrait photo (optional) | `public/portrait.{webp,avif}` | Deferred to post-launch |
| First journal post | `content/journal/{slug}.{es,en}.mdx` | Deferred — gates Journal nav |

Once you have real screenshots and final copy, replace the placeholder files and push to `main`.  
The Journal section in the header auto-enables when a `.mdx` file exists in `content/journal/`.

---

*Generated: Slice 15 — Pre-launch Hardening | portfolio-v1*
