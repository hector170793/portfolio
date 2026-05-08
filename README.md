# Hector Reyes Pérez — Portfolio

Personal portfolio site for Hector Reyes Pérez, Senior Full-Stack Engineer & Frontend Lead.

**Stack**: Next.js 15 + TypeScript + Tailwind v4 + Biome + lefthook

---

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

See `.env.example` for all required variables with descriptions. You need:

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key for email delivery |
| `CONTACT_DEST_EMAIL` | Email address receiving contact form submissions |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile public site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server-only) |
| `RESEND_AUDIENCE_ID` | Resend Audiences list ID for newsletter |

For local development, the Turnstile test keys already in `.env.example` work out of the box.

### Run dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Lint and format

```bash
pnpm lint        # Biome lint check
pnpm format      # Biome format (writes)
pnpm biome       # Biome check + fix (lint + format)
pnpm typecheck   # TypeScript type check
```

### Build

```bash
pnpm build
```

### Bundle analysis

```bash
ANALYZE=true pnpm build
```

Opens an interactive bundle visualization after build.

---

## Pre-commit hooks

lefthook runs Biome and tsc in parallel on every commit. Install once after cloning:

```bash
pnpm lefthook install
```

(Also runs automatically via the `prepare` script on `pnpm install`.)

---

## Pre-launch checklist

See [`LAUNCH.md`](./LAUNCH.md) for the step-by-step pre-launch checklist covering:
- Cloudflare DNS configuration
- Vercel project setup and environment variables
- Resend domain verification (SPF/DKIM/DMARC)
- Cloudflare Turnstile widget setup
- www redirect, resume PDF upload, and post-launch profile updates
- Full pre-go-live smoke commands

---

## Deploy

The site is deployed to [Vercel](https://vercel.com).

1. Push to `main` triggers a production deploy to `https://hector-reyes.work`.
2. Any non-main branch gets a Vercel preview deploy URL.
3. All 5 environment variables from `.env.example` must be set in the Vercel project dashboard under **Settings → Environment Variables** for both Production and Preview environments.

### Vercel project settings

- **Region**: `iad1` (US East)
- **Production branch**: `main`
- **Framework preset**: Next.js

### DNS

Domain is registered in Cloudflare. DNS is set to DNS-only mode (gray cloud) with:

```
CNAME @ → cname.vercel-dns.com
```

Cloudflare SSL is NOT proxied — Vercel handles SSL provisioning.
