# Changelog

All notable changes to Japanoma. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
