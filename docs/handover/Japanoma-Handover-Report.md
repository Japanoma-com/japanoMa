---
title: "Japanoma — MVP Handover Report"
subtitle: "Decision-aid platform for Australian buyers in Northern Japan"
author: "Craefto · Built for Go&C Partners"
date: "2026-05-07"
toc: true
toc-depth: 3
geometry: margin=2.4cm
mainfont: "Helvetica Neue"
linestretch: 1.35
colorlinks: true
linkcolor: "[RGB]{61,90,122}"
urlcolor: "[RGB]{61,90,122}"
---

\newpage

# 1 · Executive Summary

**Japanoma** is a decision-aid platform that helps Australian ski-lovers decide whether — and where — to buy a home base in Northern Japan snow country. It provides transparent total-cost models, practical due diligence, and introductions to licensed local professionals.

**Brand promise:** *Own a Japan ski home base with clarity — not guesswork.*

**Operator:** Go&C Partners (Kaz Yasumura, Director · Shiun, CMO).
**Builder:** Craefto (Obi, Technical Lead · Sara, Project Manager).

## What "MVP" means in this handover

The MVP is **functionally complete**, **production-deployed**, and **gated behind a coming-soon page** until Kaz signs off. Specifically:

- All 24 user-facing routes are built and verified returning **HTTP 200** in production.
- 24 Postgres migrations applied to the live Supabase project.
- 459 tracked source files in the handover repository, build verified clean.
- Two production deployments running:
  - `japanoma.vercel.app` — original Craefto-account deploy, full site live.
  - `japanoma-japanoma-2058s-projects.vercel.app` — new Japanoma-account handover deploy, pre-launch with a coming-soon gate; reviewers bypass via `?preview=<key>` cookie.
- Compliance scaffolding present (Privacy + Terms 11-section ToC, append-only acknowledgment audit log), **flagged on-page as awaiting legal review** before public release.
- Resend transactional email wired up; notifications routed to `kaz@goandcpartners.com`, `craefto@gmail.com`, `admin@japanoma.com.au`.

## What's deferred (not blocking handover)

- **Legal counsel review** of `/privacy` and `/terms` wording. Page banner is visible until lifted.
- **Domain DNS** — `japanoma.com.au` apex/www records to be pointed at Vercel.
- **Resend domain verification** — DKIM, SPF, DMARC records on `japanoma.com.au` for `noreply@japanoma.com.au`.
- **Sentry / Plausible** — env keys unset; add when those services are provisioned.
- **Preview-scope env vars** — Vercel CLI 50.41.0 has a non-interactive preview-scope add bug; preview env vars can be added via the Vercel dashboard if branch previews are needed.

## How to read this document

Sections 2–4 give a technical reviewer enough to inspect the system end-to-end. Sections 5–7 are operations-focused (deploy, env, day-2). Section 8 captures pending work + tech debt. Section 9 lists every visible feature. Appendix A is the diagram set.

\newpage

# 2 · Architecture

## 2.1 Tech stack at a glance

| Layer                | Choice                                                       |
| -------------------- | ------------------------------------------------------------ |
| Framework            | Next.js 15 · App Router · React 19 · React Server Components |
| Language             | TypeScript 5                                                 |
| UI                   | shadcn/ui + Tailwind CSS v4 + bespoke "Ma Space" components  |
| Database             | Supabase Postgres (Sydney `ap-southeast-2`)                  |
| ORM                  | Drizzle 0.3x                                                 |
| Auth                 | Supabase Auth (email + password, anonymous-first sessions)   |
| CMS                  | Sanity (production dataset)                                  |
| Forms                | React Hook Form + Zod                                        |
| Charts               | Recharts                                                     |
| State                | TanStack Query + Zustand (quiz answers) + nuqs               |
| 3D map               | three.js + @react-three/fiber + drei                         |
| Email                | Resend                                                       |
| Analytics            | Plausible (cookieless)                                       |
| Errors               | Sentry                                                       |
| Hosting              | Vercel                                                       |

Architectural decisions are documented in `docs/adr/001-012` with rationale.

## 2.2 System architecture

![System architecture](../diagrams/01-system-architecture.png)

The browser hits Vercel's edge, where Next.js middleware enforces three responsibilities in order:

1. **Pre-launch gate** — when `LAUNCH_MODE=coming_soon`, every public route 307-redirects to `/coming-soon` unless the visitor has the `jt_preview_unlock` cookie. Auth surfaces stay open.
2. **Auth refresh** — Supabase session cookie refreshed in-place via `updateSession`.
3. **Analytics session** — first-party `jt_session` UUID cookie set for anonymous event grouping.

Once past the gate, the request reaches a Next.js page (RSC by default). Server actions handle mutations (signup, quiz submit, lead capture, journey signal capture, contact form). API routes handle a small set of cross-component endpoints (`/api/journey/signal`, `/api/og`).

Outbound services are minimal:

- **Supabase** — auth and Postgres for all user data, journey state, leads, consent records, and the policy acknowledgment audit log.
- **Sanity** — editorial articles for the Content Hub (Kaz and Shiun edit there).
- **Resend** — transactional email for contact form + lead notifications.
- **Plausible** — page-view analytics, cookieless.
- **Sentry** — error monitoring (server + client + edge).

## 2.3 Deployment topology

![Deployment topology](../diagrams/02-deployment-topology.png)

Each `git push` to `main` triggers a Vercel build via webhook. CI (GitHub Actions) runs `tsc --noEmit`, `jest`, `next lint`, and Lighthouse CI in parallel. A successful build creates an immutable production deployment; the `*.vercel.app` alias is updated atomically. Custom domain `japanoma.com.au` (when configured) is mapped via Vercel's DNS records.

Sanity Studio is deployed separately (`sanity deploy`). When an editor publishes a document, a webhook triggers Vercel ISR revalidation for the affected routes (`/content`, `/content/[slug]`, etc.), so editorial changes go live within seconds.

\newpage

# 3 · Codebase Structure

```
src/
  app/                      Next.js App Router routes
    (auth)/                 login · signup · password reset · verify email
    account/                authenticated user dashboard
    admin/                  Go&C internal admin (gated by app_metadata.is_admin)
    areas/                  area directory · 3D map · city detail pages
    content/                editorial Content Hub (Sanity-backed)
    quiz/                   7-step recommendation quiz + results
    contact/                contact form
    coming-soon/            pre-launch brand page
    privacy/  terms/        legal pages with sticky ToC
    changelog/              user-facing release history (commit-derived)
    api/                    journey/signal · og · auth/confirm
  components/
    japandi/                bespoke Ma Space design system
    ui/                     shadcn/ui primitives, themed
    journey/                D2L journey UI (filters, nav, notes, bookmarks)
    legal/                  legal-page shell + sticky ToC
    photography/            full-bleed image, ken-burns hero
    quiz/                   quiz step rendering, icons, gauge
    layout/                 header / footer / shells
    brand/                  LogoMark + LogoLockup
  lib/
    db/                     Drizzle schema + queries
    supabase/               server / service / middleware clients
    journey/                state machine, scoring, signal capture
    quiz/                   scoring algorithm + contact-context extraction
    policies/               T&C / Privacy versioning + acknowledgment log
    lead-capture/           consent records + leads
    sanity/                 client + GROQ queries + image builder
    seo/                    JSON-LD helpers
    format/                 currency / flight-time / origin formatters
  data/                     build-time data (e.g. area image blurs)
  hooks/                    shared React hooks
  stores/                   Zustand stores (quiz answers)
  styles/                   design tokens, motion utilities, Ma spacing
  test-mocks/               Jest module shims for ESM-only deps

supabase/migrations/        24 sequential SQL migrations (apply in order)
sanity/schemas/             Sanity content type definitions
public/                     static assets (hero photography, fonts, OG art)
docs/                       ADRs, architecture, requirements, personas, user stories
e2e/                        Playwright tests
scripts/                    build / data scripts
```

The full design-system reference is **`CLAUDE.md`** at the repo root — the canonical developer guide. Every new dev should read it first.

\newpage

# 4 · Data Model

## 4.1 ERD overview

![Database ERD](../diagrams/03-database-erd.png)

Supabase's `auth.users` is the canonical identity. Domain tables fan out from there with `user_id` foreign keys, almost all governed by Row-Level Security policies that restrict reads to `auth.uid() = user_id`.

## 4.2 Migration history

24 sequential SQL files in `supabase/migrations/`:

| #     | File                                          | What it adds |
| ----- | --------------------------------------------- | ------------ |
| 001   | `init_schema.sql`                             | Initial taxonomy + content scaffolding |
| 002   | `add_areas_to_personas.sql`                   | Persona-area join |
| 003   | `auth_users.sql`                              | Auth integration scaffolding |
| 004   | `seed_taxonomy.sql`                           | Initial prefecture + city + region seeding |
| 005   | `cities_lat_lng.sql` (early)                  | Lat/lng on cities |
| 006   | `quiz_responses.sql`                          | Quiz response jsonb storage |
| 007   | `events.sql`                                  | Anonymous event tracking |
| 008   | `saves.sql`                                   | Saves table for content + areas |
| 009   | `consent_text_versions.sql`                   | Versioned consent text |
| 010   | `consent_records.sql`                         | Per-user consent capture |
| 011   | `leads.sql`                                   | Lead pipeline |
| 012   | `taxonomy_cra76_refresh.sql`                  | Taxonomy update CRA-76 |
| 013   | `taxonomy_cra76_refresh_data.sql`             | Data for above |
| 014   | `cities_hero_image_path.sql`                  | Hero image paths on cities |
| 015   | `cities_municipality_population.sql`          | Municipality URL + population |
| 016   | `taxonomy_cra76_25apr_data.sql`               | April taxonomy refresh |
| 017   | `form_submissions.sql`                        | Contact form + lead source storage |
| 018   | `cities_lat_lng.sql`                          | Lat/lng coordinates for the 3D map |
| 019   | `fix_yamanouchi_spelling.sql`                 | Typo fix |
| 020   | `taxonomy_latest_sync.sql`                    | Latest taxonomy sync |
| 021   | `journey_tables.sql`                          | D2L journey: state, signals, notes, bookmarks, og_cache |
| 022   | `rate_limit.sql`                              | Token-bucket rate limit table |
| 023   | `policy_acknowledgments.sql`                  | T&C / Privacy audit log (append-only) |
| 024   | `remove_shimotakai_taxonomy.sql`              | Removed irregular district listing |

To apply on a fresh Supabase project: run each file in order via the Supabase SQL Editor or `supabase db push`. Migration order is significant — later migrations reference earlier tables.

## 4.3 Notable data conventions

- **Anonymous-first sessions.** Quiz responses + saves can be created without an account. On signup, a server action migrates anonymous rows to the new `user_id` via a session-cookie match.
- **Consent records are append-only.** A "withdrawal" sets `withdrawn_at`, never deletes. Same for `policy_acknowledgments`.
- **Account deactivation is reversible.** `auth.users.user_metadata.deactivated_at` is the soft-delete flag; on next signin the flag clears automatically.
- **RLS is the boundary.** Service-role writes are reserved for server actions that need to bypass RLS (e.g. signup-time policy log inserts). Public API never has service-role.

\newpage

# 5 · Authentication & Compliance

## 5.1 Signup flow with policy capture

![Auth and signup flow](../diagrams/04-auth-and-signup.png)

The required tickbox on `/signup` enforces acknowledgment of both Terms & Conditions and Privacy Policy via Zod (`acknowledgePolicies: z.literal(true)`). On successful `auth.signUp`, a server-only helper writes one row per doc type into `policy_acknowledgments`:

```text
user_id · doc_type ('terms'|'privacy') · version · ip_address ·
user_agent · context ('signup'|'reacknowledgment') · acknowledged_at
```

Rows are **never updated or deleted**. Account deletion sets `user_id = NULL` (anonymises) but the audit row survives indefinitely — that's the legal record of what version the user accepted, when, and from where.

## 5.2 Versioning and re-acknowledgment

Single source of truth: `src/lib/policies/versions.ts`.

```ts
export const TERMS_VERSION = '1.0';
export const TERMS_LAST_UPDATED = '2026-05-06';
export const PRIVACY_VERSION = '1.0';
export const PRIVACY_LAST_UPDATED = '2026-05-06';
```

When counsel finalises wording, the team:

1. Updates the version constant + `lastUpdated`.
2. Removes the on-page "Awaiting legal review" banner from `LegalShell`.
3. Deploys.

A version mismatch between a user's last `policy_acknowledgments` row and the live `TERMS_VERSION` / `PRIVACY_VERSION` surfaces in the `/account` sidebar in **kohaku amber** as "Stale". Re-acknowledgment middleware that prompts on next signin is a planned follow-up phase.

## 5.3 Privacy Policy structure

The 11 sections per regulatory ToC structure:

1. Types of Personal Information We Collect and Why
2. How We Collect Your Personal Information
3. How We Use Your Personal Information
4. How We Disclose Your Personal Information
5. International Transfer of Personal Information
6. How We Secure Your Personal Information
7. How We Retain Your Personal Information
8. Your Choices and Rights
9. Other Important Information
10. Jurisdiction-Specific Notices (AU · JP · EU/UK · CA)
11. Contact Us

The page renders with a sticky desktop ToC, anchor links per section, and a version + last-updated header. The starter copy aligns with the **Privacy Act 1988 (AU)**, **APPI (JP)**, and **GDPR / UK GDPR** principles.

## 5.4 Lead capture and consent

![Lead capture flow](../diagrams/06-lead-capture.png)

The Express-Interest button on each recommended-area card triggers one of two paths:

- **Existing active consent** → `createLeadWithExistingConsent` reads the latest active `consent_records` row, inserts a `leads` row, fires a Resend notification.
- **First-time interest** → `recordConsentAndCreateLead` opens a consent modal showing the current `consent_text_versions` row. On confirm, a `consent_records` row is inserted with the version, body hash, scope, IP hash (salted via `CONSENT_IP_HASH_SALT`), and UA. Then the lead is inserted referencing that consent record.

Withdrawal sets `withdrawn_at` on the consent row + cascades to all leads under it; the user sees confirmation. The append-only audit chain is preserved.

\newpage

# 6 · Key User Journeys

## 6.1 Decision-to-Living (D2L) journey

![D2L user journey](../diagrams/05-d2l-journey.png)

The D2L model maps the buyer's full decision lifecycle into **11 backend phases** (`0_anon` → `10_revisit`). The visible UI collapses these to **6 user-facing labels** (Decide · Area · Shortlist · Risks · Offer · Closing) so the buyer doesn't see internal granularity.

### Phase advancement is monotonic forward by signal.

User actions emit signals through `captureSignal`:

| Signal                  | Inferred phase advance |
| ----------------------- | ---------------------- |
| `quiz_started`          | → `1_decision`         |
| `quiz_completed`        | → `2_research`         |
| `area_saved`            | → `3_area`             |
| `comparison_viewed`     | → `4_shortlist`        |
| `red_flag_panel_viewed` | → `5_due_diligence`    |
| `lead_submitted`        | → `6_offer`            |

`inferNextPhase(current, signal)` is **pure and monotonic** — a signal can advance the phase but never regress it. This protects against accidental rollbacks (e.g. a user re-takes the quiz at phase 6 — they don't get demoted to phase 2).

### Manual override.

`setPhaseOverride` (server action, rate-limited via `rate_limit` table) lets a user pin their phase explicitly via the journey nav-map sheet. Sets `phase_set_via='override'` so analytics can distinguish inferred vs. self-reported state.

## 6.2 Recommendation quiz

![Quiz flow](../diagrams/08-quiz-flow.png)

The 7-step quiz is the platform's primary conversion surface. Each step uses a measured cascade entrance (title 0ms → subtitle 70ms → answer cards 140ms + 35ms each) for an editorial reveal cadence.

### Scoring breakdown (out of 100, normalised from /98).

| Dimension                              | Weight | Source                                  |
| -------------------------------------- | ------ | --------------------------------------- |
| Purpose × region affinity              | 0–22   | `PURPOSE_AFFINITY` lookup               |
| Proximity × ski_season                 | 0–22   | `carToSlopeMin` weighted by `SEASON_WEIGHT` |
| Property type × region                 | 0–13   | `TYPE_AFFINITY` lookup, best of selection |
| Budget × content priority              | 0–13   | `scoreBudget`                           |
| Priority tiebreaker                    | 0–18   | `scorePriority`                         |
| Family composition × municipal culture | 0–10   | `FAMILY_AFFINITY` lookup                |

Top 3 cities are persisted as a JSONB snapshot to `quiz_responses.responses` and rendered on `/quiz/results`, the `/account` recommended-areas grid, and pre-fill the `/contact?source=quiz` form.

## 6.3 Content Hub filtering

![Content Hub filter](../diagrams/07-content-filter.png)

Two-tier filter UX:

- **Tier 1** — phase timeline with 6 numbered nodes connected by a hairline track. Inferred user phase highlighted with an indigo ring; active filter scaled-up with a soft glow. Click any node → `?phase=...` query param.
- **Tier 2** — secondary chips for Area, Property Type, Use Case, Buyer Type. Multi-select, additive.

Sanity-side, articles are tagged with `phaseTag[]` and `buyerTypeTag[]` document references. The GROQ query in `getFilteredArticles` filters on the URL params and returns the matched documents. Search is title + body + tag full-text.

\newpage

# 7 · Operations Runbook

## 7.1 Deploy a code change

```bash
# Local check
npm run build         # Next.js + lint
npm test              # Jest
npm run e2e           # Playwright (when relevant)

# Ship
git checkout -b <branch>
# ... commit ...
gh pr create --base main --title "..." --body "..."
gh pr merge <num> --merge
# Vercel auto-deploys on merge to main.
```

## 7.2 Apply a Supabase migration

Place a new SQL file in `supabase/migrations/NNN_description.sql`. Apply via:

- **Dashboard** — Supabase SQL Editor (paste, run).
- **CLI** — `supabase db push` after `supabase link --project-ref <ref>`.
- **MCP** — `mcp__supabase__apply_migration` (Claude Code dev sessions).

Always re-generate types after schema changes:

```bash
# Supabase CLI:
supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
```

Or via MCP: `mcp__supabase__generate_typescript_types`.

## 7.3 Bump a policy version

```ts
// src/lib/policies/versions.ts
export const TERMS_VERSION = '1.1';                // was '1.0'
export const TERMS_LAST_UPDATED = '2026-06-15';
```

Then:

1. Remove the `reviewNotice` prop from `<LegalShell>` in the affected page (privacy or terms) once counsel has finalised wording.
2. Push and deploy.
3. Existing user acknowledgments are now "stale" — surfaced in `/account` sidebar. The re-acknowledgment middleware (planned) will gate next signin.

## 7.4 Rotate the Vercel preview-bypass key

```bash
cd ~/Desktop/japanoma-handover  # only relevant for the handover deploy
NEW_KEY=$(openssl rand -hex 16)
echo "$NEW_KEY"   # copy this — it's the new bypass URL parameter
npx vercel env rm  PREVIEW_KEY production --yes
npx vercel env rm  PREVIEW_KEY development --yes
printf '%s' "$NEW_KEY" | npx vercel env add PREVIEW_KEY production
printf '%s' "$NEW_KEY" | npx vercel env add PREVIEW_KEY development
npx vercel --prod --yes
```

Old `jt_preview_unlock` cookies remain valid until they expire (30 days) — to revoke immediately, the user clears their cookies or you change cookie name in `src/middleware.ts`.

## 7.5 Take the site live (lift the coming-soon gate)

Two options on the handover Vercel deploy:

- **Remove the env var** entirely (recommended): `npx vercel env rm LAUNCH_MODE production` then redeploy.
- **Set to a non-`coming_soon` value**: `printf 'live' | npx vercel env add LAUNCH_MODE production`.

Either takes effect on the next request — no rebuild needed (the env is read at runtime in middleware).

## 7.6 Read deploy logs

```bash
# Specific deploy by URL slug or ID
npx vercel logs <deploy-url>

# All recent deploys (status + duration)
npx vercel ls
```

## 7.7 View Supabase logs

`mcp__supabase__get_logs` with one of: `api · postgres · edge-function · auth · storage · realtime`. Or via Supabase Dashboard → Logs.

\newpage

# 8 · Environment Reference

Required env vars, copied from `.env.example`. **Never commit `.env.local`** — `.gitignore` blocks it; `git add -A` defences also block accidental binary-doc commits.

## 8.1 Database + Supabase

| Var                              | Required | Where             | Description                                          |
| -------------------------------- | -------- | ----------------- | ---------------------------------------------------- |
| `DATABASE_URL`                   | yes      | server            | Supabase pooler URL for Drizzle queries              |
| `NEXT_PUBLIC_SUPABASE_URL`       | yes      | client + server   | `https://<ref>.supabase.co`                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | yes      | client + server   | Public anon key                                      |
| `SUPABASE_SERVICE_ROLE_KEY`      | yes      | **server only**   | Service-role key — bypasses RLS; production scope only |

## 8.2 Auth

| Var                    | Required | Description                                                            |
| ---------------------- | -------- | ---------------------------------------------------------------------- |
| `AUTH_SECRET`          | yes      | 32-byte hex; rotate per environment                                    |
| `AUTH_URL`             | yes      | Public site URL (used in PKCE redirect targets)                        |
| `AUTH_UI_ENABLED`      | yes      | `'true'` to expose `/login`, `/signup`, etc. Otherwise routes 404.     |

## 8.3 Sanity

| Var                              | Required | Description                                  |
| -------------------------------- | -------- | -------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | yes      | Sanity project ID                            |
| `NEXT_PUBLIC_SANITY_DATASET`     | yes      | Usually `production`                         |
| `SANITY_WEBHOOK_SECRET`          | yes      | Secret used to verify Sanity → Vercel ISR webhook |

## 8.4 Observability + analytics

| Var                              | Required | Description                                |
| -------------------------------- | -------- | ------------------------------------------ |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`   | optional | Plausible domain; omit to skip analytics   |
| `NEXT_PUBLIC_SENTRY_DSN`         | optional | Sentry DSN; omit to skip error monitoring  |
| `NEXT_PUBLIC_SITE_URL`           | yes      | Canonical site URL for OG tags + sitemap   |

## 8.5 Lead capture + email

| Var                              | Required | Description                                                                  |
| -------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `CONSENT_IP_HASH_SALT`           | yes      | 64-char hex. **Lifetime-stable** — rotating breaks IP correlation across consent records |
| `RESEND_API_KEY`                 | optional | Resend API key. If unset, sends silently no-op (dev-safe)                    |
| `EMAIL_FROM`                     | yes if Resend | `Japanoma <noreply@japanoma.com.au>` style. Sending domain must be verified in Resend |
| `EMAIL_NOTIFICATIONS_TO`         | yes if Resend | Comma-separated internal recipients                                          |

## 8.6 Pre-launch gate (handover deploy only)

| Var            | Required          | Description                                                                                  |
| -------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `LAUNCH_MODE`  | optional          | `coming_soon` redirects all public routes to `/coming-soon`. Anything else (or unset) = live |
| `PREVIEW_KEY`  | required if gate on | Random 32-char hex. `?preview=<KEY>` sets a 30-day cookie that bypasses the gate            |

\newpage

# 9 · Feature Inventory

## 9.1 Public surfaces

| Route                                | What it does                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `/`                                  | Editorial hero, value prop, three featured calculators                       |
| `/quiz`                              | 7-step recommendation quiz with cascade entrance + scoring                   |
| `/quiz/results`                      | Top-3 area cards with AVIF imagery + AUD prices + flight time                |
| `/areas`                             | Searchable directory + 3D Japan map view (toggleable)                        |
| `/areas/[prefecture]/[city]`         | City detail page with hero, stats, JA copy chip + outbound search links      |
| `/content`                           | Editorial Content Hub with phase timeline + secondary filters                |
| `/content/[slug]`                    | Article reader with phase tag + buyer-type chips                             |
| `/contact`                           | Contact form with editorial Field component, Resend integration              |
| `/privacy` · `/terms`                | Compliance pages with sticky ToC; awaiting legal review banner               |
| `/changelog`                         | Commit-derived release history                                               |
| `/about`                             | Operator + brand story                                                       |
| `/coming-soon`                       | Pre-launch brand page (only visible behind LAUNCH_MODE gate)                 |

## 9.2 Authenticated user surfaces

| Route                  | What it does                                                                 |
| ---------------------- | ---------------------------------------------------------------------------- |
| `/account`             | Concierge sidebar + recommended areas grid + saved items + journey notes + bookmarks + export |
| `/login`               | Email + password sign in with auto-reactivation                              |
| `/signup`              | Account creation with required T&C / Privacy tickbox                         |
| `/verify-email`        | Email verification holding screen                                            |
| `/forgot-password` · `/reset-password` | Password recovery flow                                          |

## 9.3 Admin surfaces (gated by `app_metadata.is_admin`)

| Route               | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `/admin`            | Hub for internal Go&C tools                               |
| `/admin/leads`      | Lead pipeline with CSV export                             |
| `/admin/quiz-stats` | Quiz response analytics                                   |

## 9.4 Calculator tools

The home page features three flagship calculators:

- **Total Cost of Ownership** — annual upkeep (taxes, management, snow load insurance, utilities) layered onto purchase price.
- **AUD ↔ JPY** — converter with real-time rate (manually maintained: `JPY_AUD_RATE` constant in `src/lib/quiz/questions.ts`).
- **Flight Time** — Sydney/Melbourne/Brisbane/Perth/Adelaide → nearest Japan airport.

\newpage

# 10 · Compliance Summary

| Requirement                                          | State                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Privacy Policy structure (11 sections)               | ✓ Built. **Awaiting legal counsel review** of wording.                                              |
| Terms & Conditions                                   | ✓ Built (12 sections). **Awaiting legal counsel review** of wording.                                |
| Required signup acknowledgment with audit log        | ✓ Built. `policy_acknowledgments` append-only, retained indefinitely.                               |
| Cookieless analytics                                 | ✓ Plausible (when key is set).                                                                      |
| Anonymous-first sessions                             | ✓ Quiz, browse, save — no account required.                                                         |
| Consent-gated lead capture                           | ✓ `consent_records` versioned, IP-hashed via `CONSENT_IP_HASH_SALT`, withdrawable.                  |
| Right to access / correct / delete data              | ✓ `/account` page; deactivation reversible; account deletion in roadmap.                            |
| Australian Privacy Act 1988                          | Aligned (subject to counsel sign-off).                                                              |
| Japan APPI                                           | Aligned (subject to counsel sign-off).                                                              |
| EU GDPR / UK GDPR                                    | Aligned (subject to counsel sign-off).                                                              |
| California CCPA / CPRA                               | "Do not sell" — we don't.                                                                           |
| WCAG 2.1 AA                                          | In progress. `inert` attribute on closed mobile menu, focus trap on modals, aria-live announcements on copy chips. |

\newpage

# 11 · Pending Work & Tech Debt

## 11.1 Blocking pre-launch

- **Legal counsel review** of `/privacy` and `/terms` wording. Lift the on-page banner once finalised.
- **DNS** for `japanoma.com.au` apex + www to be pointed at Vercel.
- **Resend domain verification** for `noreply@japanoma.com.au` (DKIM, SPF, DMARC).
- **Sanity content backfill** — currently 4/11 articles auto-tagged at high confidence; remaining 7 need editor pass.

## 11.2 Useful-but-not-blocking

- **Re-acknowledgment middleware** — when a user's last `policy_acknowledgments.version` differs from the current `TERMS_VERSION`/`PRIVACY_VERSION`, gate the next signin to a re-accept screen.
- **Sentry + Plausible env keys** to be set when those services are provisioned.
- **Preview-scope env vars** — Vercel CLI 50.41.0 has a non-interactive preview-scope add bug. Add via dashboard if branch previews are needed.
- **Custom domain for handover deploy** — currently a `*.vercel.app` URL. When `japanoma.com.au` DNS is configured, point to whichever deploy is the production one and update `AUTH_URL` + `NEXT_PUBLIC_SITE_URL`.

## 11.3 Known issues

- **Vercel CLI `--force` flag** doesn't always work for preview-scope env adds (CLI 50.41.0 bug). Workaround: `vercel env rm` + add. Documented in deploy runbook.
- **THREE.js deprecation warnings** in console (`THREE.Clock` → `THREE.Timer`, `PCFSoftShadowMap` → `PCFShadowMap`). Third-party from `@react-three/fiber` + `drei`. Resolved by a coordinated package upgrade — separate session.
- **Webpack `.next` cache occasionally corrupts** during long dev sessions. `rm -rf .next` and restart fixes. Future: switch dev to Turbopack (`next dev --turbo`) which bypasses the failing PackFileCacheStrategy.
- **2 pre-existing TypeScript test errors** in `actions.test.ts` files — non-blocking, slated for cleanup.

## 11.4 Roadmap suggestions

- **Browser-side PDF download** of quiz results + journey export. Currently MD-only.
- **Email digest** — weekly summary to interested users showing new content matched to their phase.
- **Sanity → Slack integration** for new article notifications.
- **JP-locale** version using the existing Shippori Mincho B1 + Noto Sans JP fonts. Sanity dataset already supports `language` field.

\newpage

# 12 · Handover Checklist

For the receiving team:

- [ ] Receive GitHub repo invite (push access to `Japanoma-com/japanoMa` and/or `ObiBat/Japa-Tak`).
- [ ] Receive Vercel project access — `japanoma-2058` scope or transfer to a new team.
- [ ] Receive Supabase project access — currently project ref `dfbyywvogeaxrxsriahp`.
- [ ] Receive Sanity Studio access — currently project ID `ljeqozrv`, dataset `production`.
- [ ] Receive Resend account access (or be added to the team).
- [ ] Optional: provision Sentry, Plausible, set env vars.
- [ ] Read `CLAUDE.md` (developer guide).
- [ ] Read `DEPLOYMENT.md` (step-by-step setup from scratch).
- [ ] Read `CHANGELOG.md` (release history).
- [ ] Walk through `/quiz` end-to-end on the live site.
- [ ] Trigger a contact-form submission and confirm Resend email arrives.
- [ ] Review the 8 diagrams in `docs/handover/diagrams/` (the source of this report).
- [ ] Schedule legal-counsel review of `/privacy` and `/terms`.
- [ ] Configure `japanoma.com.au` DNS.
- [ ] Verify Resend sending domain (DKIM, SPF, DMARC).
- [ ] Lift the `LAUNCH_MODE=coming_soon` env var when ready to go public.

\newpage

# Appendix A · Diagrams (full set)

The 8 architecture diagrams in this report, listed with source file paths. All are in Mermaid (text source) → rendered to PNG (1600w, embed-ready) and SVG (crisp print + Figma-importable).

| # | Title                          | Source                                                    |
| - | ------------------------------ | --------------------------------------------------------- |
| 1 | System architecture            | `diagrams/01-system-architecture.mmd`                     |
| 2 | Deployment topology            | `diagrams/02-deployment-topology.mmd`                     |
| 3 | Database ERD                   | `diagrams/03-database-erd.mmd`                            |
| 4 | Auth and signup flow           | `diagrams/04-auth-and-signup.mmd`                         |
| 5 | D2L user journey               | `diagrams/05-d2l-journey.mmd`                             |
| 6 | Lead capture and consent flow  | `diagrams/06-lead-capture.mmd`                            |
| 7 | Content Hub filter             | `diagrams/07-content-filter.mmd`                          |
| 8 | Quiz flow                      | `diagrams/08-quiz-flow.mmd`                               |

To re-render after editing a source:

```bash
mmdc -i diagrams/<file>.mmd -o diagrams/<file>.png -b "#FAFAF7" -w 1600
mmdc -i diagrams/<file>.mmd -o diagrams/<file>.svg -b "#FAFAF7"
```

\newpage

# Appendix B · Document set

This handover package includes:

| File                                  | Format | Purpose                                                                |
| ------------------------------------- | ------ | ---------------------------------------------------------------------- |
| `Japanoma-Handover-Report.md`         | Markdown | Master text source — what you're reading                               |
| `Japanoma-Handover-Report.docx`       | Word     | Pandoc render of the master, with embedded PNG diagrams                |
| `Japanoma-Handover-Report.pdf`        | PDF      | Pandoc render of the master, with embedded PNG diagrams                |
| `Japanoma-Handover-Deck.pptx`         | PowerPoint | Marp executive slide deck — exec-summary cut for stakeholder review |
| `Japanoma-Handover-Deck.pdf`          | PDF      | Same deck as PDF                                                       |
| `diagrams/*.mmd`                      | Mermaid  | Text source for all 8 diagrams                                         |
| `diagrams/*.png` / `*.svg`            | Image    | Rendered diagrams                                                      |

---

*End of report. For questions, contact Craefto · obibatbileg@gmail.com.*
