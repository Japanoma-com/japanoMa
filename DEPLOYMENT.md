# Deployment Guide

End-to-end steps to deploy a fresh Japanoma instance. Allow ~2 hours for a clean run-through if you've never set up the underlying services.

---

## 0. Prerequisites

You'll need:

- A **GitHub account** (organisation or personal — the repo lives here).
- A **Vercel account** linked to that GitHub.
- A **Supabase account** (free tier works for staging).
- A **Sanity account**.
- A **Resend account** (transactional email).
- *Optional but recommended:* Plausible Analytics, Sentry.

You'll need to copy values between these services into Vercel's env vars. Keep `.env.example` open as a checklist.

---

## 1. Create the GitHub repository

```bash
# In a fresh terminal, from the repo root:
gh repo create <org>/japanoma --private --source=. --remote=origin
git push -u origin main
```

Or via the GitHub UI: create the repo, then in the local repo:

```bash
git remote add origin git@github.com:<org>/japanoma.git
git branch -M main
git push -u origin main
```

---

## 2. Set up Supabase

### 2.1 Create the project

- Region: **Sydney (`ap-southeast-2`)** for AU latency.
- Save the **project URL**, **anon key**, and **service role key** — you'll need these in Vercel.

### 2.2 Apply migrations in order

Migrations live in `supabase/migrations/`, sequentially numbered.

**Easiest path: SQL Editor**

1. Open the Supabase Dashboard → SQL Editor.
2. Apply each migration in numeric order: `001_*` first, `002_*` next, … through the highest-numbered file.
3. Run each one separately so failures are easy to spot.

**CLI path** (if you prefer):

```bash
# Install: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### 2.3 Configure Auth

In Supabase Dashboard → Authentication → Providers:

- **Email** — enable. Set "Confirm email" to **on** (the auth flow expects it).
- **Site URL** — `https://<your-vercel-domain>` (update after step 6).
- **Redirect URLs** — add:
  - `https://<your-vercel-domain>/auth/confirm`
  - `http://localhost:3000/auth/confirm` (dev)
  - `http://localhost:3001/auth/confirm` (alternate dev port)

### 2.4 Seed taxonomy data

After migrations apply, the `cities`, `prefectures`, etc. tables are empty. The seed scripts live in `scripts/seed-taxonomy.sql` and the `004_seed_taxonomy.sql` migration handles the initial seeding (depending on whether you start fresh or import existing data).

### 2.5 Promote first admin

Once signed up, mark Kaz / Shiun as admins:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin":true}'::jsonb
WHERE email IN ('kaz@goandcpartners.com', 'shiun@goandcpartners.com');
```

---

## 3. Set up Sanity

### 3.1 Create the project

- New project at sanity.io/manage.
- Dataset name: **`production`**.
- Save the **project ID**.

### 3.2 Push schema

```bash
cd sanity
npx sanity@latest deploy        # deploys the Studio
npx sanity@latest schema deploy # deploys schema
```

Or run the Studio locally for editing:

```bash
cd sanity
npx sanity dev
```

### 3.3 Add CORS origin

In the Sanity dashboard → API → CORS Origins, add:

- `https://<your-vercel-domain>`
- `http://localhost:3000`

### 3.4 Create a write token (only if you need server-to-Sanity writes)

Sanity → API → Tokens → Create token → **Editor** permissions. Save as `SANITY_WRITE_TOKEN` in Vercel (keep it out of public repos).

---

## 4. Resend (transactional email)

1. Sign up at resend.com.
2. Verify the sending domain you'll use (e.g. `japanoma.com.au`) — DKIM, SPF, DMARC.
3. Create an API key. Save as `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to your verified sender (e.g. `Japanoma <noreply@japanoma.com.au>`).
5. Set `EMAIL_NOTIFICATIONS_TO` to a comma-separated list of internal recipients.

If `RESEND_API_KEY` is unset, sends are silently skipped — dev-safe.

---

## 5. Optional: Plausible + Sentry

**Plausible** — sign up, add your site, copy the domain into `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

**Sentry** — create a Next.js project, copy the DSN into `NEXT_PUBLIC_SENTRY_DSN`. The `instrumentation.ts` and `instrumentation-client.ts` files at the repo root will pick it up automatically.

---

## 6. Deploy to Vercel

### 6.1 Import the repo

- Vercel Dashboard → **Add New… → Project**.
- Import the GitHub repo from step 1.
- Framework preset: **Next.js**.
- Root directory: leave default.
- Build command: `npm run build`.
- Output directory: leave default (`.next`).

### 6.2 Set environment variables

In Project Settings → Environment Variables, add **every variable from `.env.example`**, in **all three scopes** (Production, Preview, Development):

```
DATABASE_URL                       postgres://… (Supabase pooler URL)
NEXT_PUBLIC_SUPABASE_URL           https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY      eyJ…
SUPABASE_SERVICE_ROLE_KEY          eyJ…   (Production only — keep tight)

AUTH_SECRET                        (32-byte random hex, regenerate per env)
AUTH_URL                           https://<your-vercel-domain>

NEXT_PUBLIC_SANITY_PROJECT_ID      <project-id>
NEXT_PUBLIC_SANITY_DATASET         production
SANITY_WEBHOOK_SECRET              (random 32-char hex)

NEXT_PUBLIC_PLAUSIBLE_DOMAIN       japanoma.com.au
NEXT_PUBLIC_SENTRY_DSN             https://…@sentry.io/…
NEXT_PUBLIC_SITE_URL               https://<your-vercel-domain>

CONSENT_IP_HASH_SALT               (64-char hex, lifetime-stable)

RESEND_API_KEY                     re_…
EMAIL_FROM                         Japanoma <noreply@japanoma.com.au>
EMAIL_NOTIFICATIONS_TO             kaz@goandcpartners.com,shiun@goandcpartners.com

AUTH_UI_ENABLED                    true
```

Generate cryptographic secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6.3 Deploy

Click **Deploy**. First build takes ~3–5 minutes.

### 6.4 Configure custom domain

Vercel Dashboard → Project → Domains → Add `<your-domain>`. Vercel will provide DNS records for your registrar.

### 6.5 Update Site URL in Supabase

Once you have a Vercel domain, return to **Supabase → Authentication → URL Configuration** and update **Site URL** to your real domain. Update **Redirect URLs** likewise.

---

## 7. Post-deploy smoke test

- `/` loads — the home hero renders the snow village photo.
- `/quiz` — walk through all 7 steps, get to /quiz/results without errors.
- `/areas` — list and map both render. Click a prefecture → highlighted polygon + InfoPanel.
- `/areas/<pref>/<city>` — a sample city page renders.
- `/content` — Sanity articles list renders (after at least one is published).
- `/contact` — form submits, you receive the Resend email.
- `/login` + `/signup` — flow completes; new user lands on `/account` after email confirmation.
- `/account` — sidebar shows accepted T&Cs / Privacy versions.

---

## 8. Going live

Before public launch:

1. **Legal review** — `/privacy` and `/terms` ship with starter copy and a "pending legal review" banner. Counsel must finalise wording. Once finalised, remove the `reviewNotice` prop on `LegalShell` in `src/app/privacy/page.tsx` + `src/app/terms/page.tsx`.
2. **Rotate `CONSENT_IP_HASH_SALT`** — only do this *before* anyone has consented, never after. After the first consent record exists, the salt is permanent for the lifetime of the feature.
3. **Run Lighthouse CI** locally: `npx lhci autorun`. Targets are in `.lighthouserc.json`.
4. **Verify Sentry receiving events** — trigger an intentional error in a preview deploy.
5. **Verify Plausible** — visit a few pages, check that pageviews show up in the dashboard.
6. **Check email deliverability** — send a test contact form and confirm it lands in the inbox.
7. **Backup policy** — Supabase Pro tier or higher includes daily backups. Confirm your plan covers your retention requirement.

---

## Troubleshooting

**Build fails: `Cannot find module '@/lib/...`** — run `npm install`. The lockfile resolves these paths.

**Build fails: Type error in `actions.test.ts`** — there are two pre-existing test type errors that don't break the build (the build excludes `.test.ts`). They're listed in `CHANGELOG.md` and slated for cleanup.

**`Supabase URL is not configured`** — `NEXT_PUBLIC_SUPABASE_URL` missing in the active Vercel environment. Re-add and redeploy.

**Auth callback 500** — verify `Site URL` and `Redirect URLs` in Supabase exactly match the deployed URL (including `https://`). The `/auth/confirm` route must be in the redirect allow-list.

**Sanity articles return empty** — your `production` dataset is empty. Either import a backup or create a starter article in the Studio.

**`CONTEXT_LOST` in console on the 3D map** — third-party `three`/`@react-three/fiber` / `drei` deprecation noise; not actionable in our code without a coordinated package upgrade. Browser self-recovers.

---

For anything else, read [CLAUDE.md](CLAUDE.md) — it's the developer guide that documents conventions, gotchas, and the design system.
