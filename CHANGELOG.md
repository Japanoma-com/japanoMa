# Changelog

All notable changes to Japanoma. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2026-05-07] — MVP handover: clean repo, GitHub + Vercel deploy, quiz cascade polish

### Added

- **Handover repo** at `~/Desktop/japanoma-handover/` — fresh git history, 459 tracked files (vs 1001 in Craefto live), single squash commit. Strips all private business artefacts (Contract/, Documentation/, Go&C/, artifacts/, dist/, wireframes/, root .docx/.jpg/.pdf binaries, docs/superpowers/, internal Claude session prompts) and keeps only production code + technical docs (a11y, adr, architecture, personas, requirements, taxonomy, user-stories).
- **README.md** — project overview, stack table, local setup steps, common scripts, project structure, doc map, compliance summary.
- **DEPLOYMENT.md** — end-to-end deploy guide covering GitHub repo creation, Supabase + migrations, Sanity, Resend, Plausible, Sentry, Vercel env-var setup, custom domain, post-deploy smoke tests, and a troubleshooting section.
- **Defensive `.gitignore`** in both Craefto live and the handover repo — blocks all binary working-document formats (`**/*.docx`, `**/*.pdf`, `**/*.xlsx`, `**/*.key`, `**/*.pages`, `**/*.numbers`, `**/*.pptx`) anywhere in the tree by default, with explicit `!public/` and `!sanity/` negations so runtime assets still ship. Also blocks `**/superpowers/`, screenshot patterns, editor junk (.idea/, .vscode/, *.swp). Stops `git add -A` from sweeping in private docs.
- **`vercel.json`** at the handover repo root pinning the Next.js framework preset + build/output directories so future deploys don't fall back to Vercel's "Other" auto-detect (which would serve `public/` as static and break the App Router).
- **Quiz step entrance cascade** — new `animate-quiz-rise` keyframe (6px translate + opacity, 480ms ease-settle) staggered across the question render: title (0ms) → subtitle (70ms) → answer cards (140ms + 35ms each). Replaces the flat 150ms opacity flash. Respects `prefers-reduced-motion`.
- **Step-counter remount animation** — the active "X" in "X / 7" is keyed on `currentStep` so React swaps the node and `animate-fade-in` plays on every advance. Subtle but draws the eye to the new progress.

### Changed

- **Quiz subtitle** — typography upgraded to italic Shippori Mincho at 15–16px / 1.6 leading. Reads as a poetic guide's voice instead of generic body copy.
- **Quiz step header** breathing room expanded (`mb-ma-12 → mb-ma-16`) and overline tracking tightened (`0.16em → 0.18em`) to match the more deliberate cadence below.
- **Vercel deployment protection** disabled on the handover project via API patch (`ssoProtection: null`) so the test deploy is publicly accessible.
- **GitHub repo visibility** — handover repo flipped to **public** at owner request.

### Fixed

- **Quiz subtitle spacing** — was `mb-ma-10`, which doesn't exist in the project's Ma scale (1/2/3/4/6/8/12/16/24/32 only). Tailwind silently emits zero CSS for unknown spacing tokens, so the subtitle was jamming straight into the answer cards on every question. Now `mb-ma-12` (48px). Real breath.
- **Webpack `.next` cache corruption** — recurring during dev session led to stale-chunk MIME errors in browser. Fixed by clearing `.next` and restarting; flagged for future Turbopack switch (`next dev --turbo`) which bypasses the failing PackFileCacheStrategy entirely.

### Deployment

- **GitHub** → https://github.com/Japanoma-com/japanoMa (public, on the `Japanoma-com` org under the new `Japanoma` GitHub account).
- **Vercel** → https://japanoma-japanoma-2058s-projects.vercel.app (project `prj_Nh8920RLGqbfUUx2lkz9TiehZj41` on team `japanoma-2058's projects`).
- **Env vars** set on production + development scopes: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET (rotated, fresh 64-char hex), AUTH_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WEBHOOK_SECRET (rotated), CONSENT_IP_HASH_SALT (rotated), AUTH_UI_ENABLED, RESEND_API_KEY, EMAIL_FROM, EMAIL_NOTIFICATIONS_TO. **Preview-scope vars not set** due to a Vercel CLI 50.41.0 bug with non-interactive preview adds — can be added via the dashboard later if branch previews are needed.
- **Email notifications** target `kaz@goandcpartners.com, craefto@gmail.com, admin@japanoma.com.au`.
- **All public routes verified** returning 200: `/`, `/quiz`, `/areas`, `/content`, `/contact`, `/privacy`, `/terms`, `/login`, `/signup`.

### Notes for handover

- Resend domain (`japanoma.com.au`) verification is on the team — DKIM, SPF, DMARC records in DNS, then `noreply@japanoma.com.au` will accept sends. Until verified, contact-form sends silently no-op.
- Plausible and Sentry env vars are unset; add when those services are provisioned.
- The Craefto-side `refactor/quiz-rise-cascade` branch carrying today's quiz polish is committed locally but not pushed (gh auth is on the new `Japanoma` account; would need `gh auth switch` to push). The handover repo carries the same change — that's what's deployed.

## [2026-05-06] — Late session: Auth contrast, Japanese copy chips, Deactivate, taxonomy cleanup

### Added

- **`<JaCopyChip />`** — click-to-copy chip for Japanese place names (Noto Sans JP), with a 1.8s matsu-green check feedback and aria-live announcement. Beneath each chip, a small **"Search on"** row links to **Hazard Map** (GSI Disaster Portal) and **Yukiyama** so visitors can paste the freshly-copied name straight into those partner sites' search fields. Wired into the 3D-map InfoPanel (HoverPreview compact / ActiveView full), TownCard rows, and a dedicated *"Japanese names · click to copy"* block on the city detail page. Outbound list extensible via `DEFAULT_OUTBOUND_SITES`. (#60)

### Changed

- **"Delete account" → "Deactivate account"** with reversible behaviour. The action now flags `user_metadata.deactivated_at` via `admin.auth.admin.updateUserById` and signs the user out — **zero rows deleted**. All saves, quiz responses, journey notes, bookmarks, leads, and policy acknowledgments stay intact. The `signIn` action auto-clears the flag on return: the act of authenticating is the reactivation signal, no separate "are you sure you want to come back" prompt. Sidebar tone shifted from beni red to stone (no longer destructive); modal drops the *"Type DELETE to confirm"* gate. New lock-in test asserts the action calls `updateUserById` and never `deleteUser`. (#61)
- **Auth card surface** changed from `bg-kinu` (white) to `bg-shoji` (#FAFAF7) so the kinu inputs no longer disappear into the card. Restores the documented Ma Space 3-level surface hierarchy: **washi** (page) → **shoji** (card) → **kinu** (input). One-line edit covers all five auth pages (login / signup / forgot-password / reset-password / verify-email). (#58)

### Removed

- **Shimotakai-gun** removed from the taxonomy. Was the only district (-gun / 郡) entry in `cities`; everything else is official municipalities. Live DB migration 024 deletes the row; `area-blurs.ts`, `update-hero-images.sql`, `area-image-prompts.md`, and the `/public/areas/shimotakai.{avif,jpg}` assets cleaned up. User-generated rows that reference the slug (1 save, 1 lead) intentionally preserved. (#62)
- **Unified List + Map flow on /areas reverted** — the binary view toggle is back. The unified flow shipped earlier in #57; testing showed the toggle is the preferred UX. The `externalActiveSlug` prop on `Japan3DMap` was also removed since nothing was passing it. (#59)

### Schema

- Migration **023** (`policy_acknowledgments`) checked in — was applied live earlier today but the SQL file wasn't committed. Repo migration history now matches the live database.
- Migration **024** (`remove_shimotakai_taxonomy`) — `DELETE FROM cities WHERE slug = 'shimotakai'`.

## [2026-05-06] — Compliance, Quiz Polish & Map Unification

### Added

- **T&C / Privacy acknowledgment system.** Required tickbox at signup, append-only `policy_acknowledgments` audit log (user_id · doc_type · version · IP · UA · context), service-role-only INSERT path, RLS read-own. `/account` sidebar surfaces accepted versions with a kohaku amber stale-version cue. Single source of truth for versions in `src/lib/policies/versions.ts`. (#56)
- **Privacy Policy** restructured to the 11-section ToC: Types of PI Collected · How We Collect · How We Use · How We Disclose · International Transfer · Security · Retention · Choices and Rights · Other · Jurisdiction-Specific (AU/JP/EU/UK/CA) · Contact. Sticky desktop ToC, anchor links, version + last-updated header. Starter copy aligned with Privacy Act 1988, APPI, GDPR — flagged as **pending legal review**. (#56)
- **Terms & Conditions** restructured with 12-section ToC (Acceptance · What We Are · Educational Nature · No Transactions · Referrals · Acceptable Use · IP · Disclaimers · Limitation of Liability · Termination · Governing Law · Contact). (#56)
- **Quiz family-composition question** (Solo / Couple / Young Family / Teen Family / Empty Nest / Multi-generational) with explicit subtitle copy explaining the cultural-fit motivation. Light 0–10 affinity scoring against region archetypes. Surfaces in the contact form's pre-filled panel. (#48)
- **Speedometer-style difficulty gauge** on the quiz Condition step — replaces the 5-dot indicator with a coloured-zone arc + needle. Same metaphor every consumer device uses, no legend needed. (#51)
- **Bidirectional snow-country legend** overlaid on the 3D Japan map (top-left). Lists only P1 prefectures sorted N→S; hover/click drives the polygon, hover/click a polygon drives the chip. (#34, refined #35–#39)
- **Recommended-area cards on /account** now lead with 16:9 hero imagery via the same AVIF+JPG `<picture>` pattern as the /areas directory. Backed by a join on the cities table so swapping a hero image flows through to existing accounts. (#32)
- **Sidebar "Legal" block** in `/account` showing accepted T&C and Privacy versions with date.

### Changed

- **/areas: List and Map merged into one unified experience.** The binary toggle is gone — cards render at the top, the 3D silhouette below them. Picking a prefecture chip pops the matching polygon and smooth-scrolls the canvas into view, giving instant geographic confirmation. (#57)
- **Quiz icons** swapped from hand-drawn SVGs to Lucide (industry standard, used by shadcn/ui, Linear, Vercel) for consistent 2px stroke and rounded joins. Kominka and Land got bespoke icons drawn in the same vocabulary: kominka with chigi + gable + posts, land as four diamond parcels in aerial-plan orientation. (#50, #52, #55)
- **Quiz step cards** modernised — borderless `bg-shoji shadow-card` at rest, `bg-kinu` lift on hover, `ring-1 ring-ai/40` on selected. Single hairline progress rail with smooth gradient fill replaces the 7-segment blip bar. Editorial overline + step counter header. (#49)
- **Phase filter on /content** rebuilt as a journey timeline: 6 numbered nodes connected by a hairline track, your inferred step marked with an indigo ring, active filter scaled-up with a soft glow. Caption beneath does triple duty (filter status / your step link / hint). (#44)
- **/content secondary filters** (Area · Property Type · Use Case · Buyer Type) switched to the borderless pill vocabulary — `shadow-card` resting, `ring-1 ring-ai/40` when set. (#43)
- **Auth pages and inputs site-wide** moved to a filled-card style: `bg-kinu rounded-lg shadow-card` with a low-alpha indigo focus halo (no thick ring, no border line). `AuthShell` lost its border, gained `rounded-2xl` + deeper shadow. New `form-styles.ts` keeps login/signup/forgot/reset locked together. (#46)
- **Contact page** modernised — two-column Name+Email row, editorial `<Field>` component with reserved error slot, indigo-checkmark success state, source banner reduced to a small pill, lede + privacy copy moved to the page hero. (#45)
- **3D Japan map** is now sticky on scroll on desktop. When the InfoPanel grows past the map height (after a prefecture is selected), the silhouette stays anchored while the panel scrolls. Sticky offset matches `/account` sidebar pattern (`top-ma-32` = 64px header + 64px breath). (#41)
- **Prefecture borders** on the 3D map default to ON. Visitors see Japan's structure on first paint; the corner toggle still hides them. (#33)
- **Recommended-area cards** dropped the 4-sided border for the modern shadow + ring vocabulary (matches the rest of the site). (#7498faf)

### Fixed

- **Hover panel jitter on 3D map.** With the map sticky on scroll, hovering different prefectures was changing the right column's height and making the page jump under the cursor. Panel now locks to the active selection once a prefecture is clicked; hover only updates the polygon and legend chip. Pre-click hovers floor the panel at `min-h-[560px]`. (#42)
- **Sidebar sticky** at `/account` was sliding under the fixed header. Bumped offset from `top-ma-12` to `top-ma-32` (64px header + 64px breath). (#31)
- **Notes-by-phase** loaded only the current phase's notes server-side; clicking other phases showed a placeholder. Now loads all six phases in parallel and shows `+ Add note` on every phase. (#88994e1)
- **Phase override** silently failed for first-time users — RLS only had UPDATE policy, no INSERT. Switched `setPhaseOverride` to the service-role client. (#7498faf)
- **Contact form copy.** Removed the *"We won't share your details with third parties"* claim from the page hero and consent label — inaccurate now that we share with introduced partners under T&Cs. (#47)

### Removed

- D2L journey stepper from `/areas` — the page is for finding places, not tracking your journey state. (#40)
- List/Map binary view toggle on `/areas` — replaced by the unified flow above. (#57)
- "Try this → hover any tinted prefecture" onboarding hint on the 3D map — the new visible legend made it redundant. (#37)
- Full 47-prefecture legend — replaced by snow-country-only overlay (the others were inert filler). (#35)

### Schema

- New table `public.policy_acknowledgments` (migration 023). Append-only audit log; RLS read-own; index on `(user_id, doc_type, acknowledged_at DESC)` for O(log n) "latest per doc" lookups.

### Notes for the legal team

The expanded `/privacy` and `/terms` pages ship with starter copy aligned with Privacy Act 1988, APPI, GDPR, and Australian Consumer Law. The on-page **"Awaiting legal review"** banner is shown above the content. Your pass should refine wording without disturbing the section structure or anchor IDs (each section's `id=` is referenced by the sticky ToC). When wording is finalised, increment `TERMS_VERSION` / `PRIVACY_VERSION` in `src/lib/policies/versions.ts` — every existing user's acknowledgment becomes "stale" and they'll be prompted to re-accept on next signin (re-acknowledgment middleware to be wired in a follow-up phase).
