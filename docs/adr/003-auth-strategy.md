# ADR-003: Auth Strategy — Supabase Auth (revised)

**Status:** Accepted (revised from 2026-02-27)
**Date:** 2026-04-08
**Decision Makers:** Obi (Technical Lead)
**Supersedes:** The original 2026-02-27 version of this ADR which chose NextAuth v5 with Supabase Adapter

## Context

The original 2026-02-27 ADR chose NextAuth v5 with the Supabase Adapter. The motivation was: native Next.js App Router integration, JWT sessions, custom credentials provider, and the option to layer anonymous session tracking via a separate cookie.

Six weeks later (2026-04-08), the auth implementation status was: backend infrastructure built (config, route handler, custom `users` and `sessions` tables, bcrypt password hashing) but **zero user-facing pages**. The MVP gap analysis surfaced that the platform claimed "full auth system" but no user could actually sign up, log in, or reset a password. The original ADR's choice was sound at the time but had two practical failures by April:

1. **Effort accumulation.** Building all 7 auth pages (login, signup, verify, forgot, reset, profile, account deletion) on top of NextAuth Credentials provider would require hand-rolling: email verification token storage, password reset token storage, transactional email integration, rate limiting, and 7 server actions. Most of this is already solved by Supabase Auth.

2. **Database impedance mismatch.** The custom `users` table (Drizzle) and Supabase's `auth.users` table coexisted in the same database without talking to each other. RLS policies couldn't use `auth.uid()` cleanly. Anonymous-to-authenticated session migration would require a custom transition layer.

Both problems compound when Phase 3 (Admin Dashboard) and Phase 4 (Post-Purchase Survey) try to use authenticated context. Switching now (no real users exist, no UI built) is the cheapest moment.

## Decision

**Switch to Supabase Auth.** Drop the custom `users` and `sessions` tables. Use `auth.users` as the source of truth. Build the 7 auth pages in Phase 2 Plan B using `@supabase/ssr` server and browser clients. Magic-link admin auth (Phase 3) sits on top of the same `auth.users` table with an env-var allowlist for role gating.

## Options Considered (revised)

### Option A: Stay on NextAuth + add an email provider (Resend or SendGrid)
- **Pros:** No data migration, ADR unchanged, full control over auth flow, no vendor lock-in beyond NextAuth.
- **Cons:** Hand-roll all 7 auth flows, manage email tokens in custom tables, integrate a third-party email vendor, write rate limiting.
- **Verdict:** Rejected. The hand-rolled work duplicates what Supabase Auth provides for free.

### Option B: Switch to Supabase Auth (CHOSEN)
- **Pros:** Built-in email verification, password reset, magic links, transactional email (SMTP configurable), `auth.uid()` works in RLS, fewer lines of code, no separate email vendor for v1. Tighter integration with the Supabase database the project already uses.
- **Cons:** ADR-003 rewritten (this document), `users`/`sessions` tables dropped, custom session migration logic for anonymous saves needs to be written (one server action). Vendor lock to Supabase deepens, but the project was already deeply locked in.
- **Verdict:** Accepted.

### Option C: Defer auth to v1.1
- **Pros:** Ship the rest of MVP faster.
- **Cons:** No way to identify return visitors, no admin dashboard (Phase 3 depends on auth), no post-purchase survey (Phase 4 doesn't strictly need auth but the admin views do).
- **Verdict:** Rejected. Phases 3 and 4 are part of MVP scope.

## Consequences

**Positive:**
- 7 auth pages can use Supabase SDK calls instead of hand-rolled token tables and email integration
- Future RLS policies can use `auth.uid()` natively
- Email templates managed in the Supabase dashboard, editable without code changes
- Account deletion uses `supabase.auth.admin.deleteUser()` instead of custom cascade logic

**Negative:**
- The custom `users` and `sessions` tables are dropped (verified empty of user accounts 2026-04-08; 716 anonymous session rows, 109 events, and 25 quiz_responses existed but were all confirmed as internal testing data and truncated during migration 007)
- Anonymous session tracking now uses a cookie-only `jt_session` UUID (no DB row); the analytics queries in Phase 3 need to group by this cookie value, not by a sessions table FK
- `next-auth`, `@auth/drizzle-adapter`, `bcryptjs`, `@types/bcryptjs` removed from `package.json`
- `events.session_id` and `quiz_responses.session_id` columns kept but FK constraints dropped — they're now plain UUIDs grouped by the cookie value
- Anyone reading the original 2026-02-27 ADR needs to know it's superseded (this document supersedes it)

**Neutral:**
- Phase 2 still ships under the `NEXT_PUBLIC_AUTH_UI_ENABLED` env flag for incremental rollout
- The admin role concept moves from the dropped `users.role` column to an `ADMIN_EMAILS` env-var allowlist (Phase 3)

## Implementation

See `docs/superpowers/specs/2026-04-08-phase-2-auth-supabase-design.md` for the full design.

- Plan A (foundation): `docs/superpowers/plans/2026-04-08-phase-2-plan-a-auth-foundation.md` — tear-out + Supabase client setup. No UI.
- Plan B (UI + integration): To be written after Plan A completes. Builds the 7 user-facing pages and wires up authentication state.

The original NextAuth implementation was deleted in commits `aa422a1` through `891f71b` (Phase 2 Plan A tasks 1–5).
