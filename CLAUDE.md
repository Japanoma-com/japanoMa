# Japanoma -- Developer Guide

## What This Project Is

Japanoma is a **decision-aid platform** (NOT a marketplace) that helps Australian ski-lovers decide whether to buy a home base in Northern Japan snow country. It provides transparent total-cost models, practical due diligence, and introductions to licensed local professionals.

**Brand promise:** Own a Japan ski home base with clarity -- not guesswork.
**We are NOT:** A listings portal, buyer's agent, akiya bargain site, or hype-driven broker.

**Client:** Go&C Partners (Kaz Yasumura, Director; Shiun, CMO)
**Builder:** Craefto (Obi, Technical Lead; Sara, Project Manager)
**Target:** ~184,500 Australian skiers | Focus: Nagano, Niigata, Hokkaido

## Design System: Ma Space v4

The visual language is **Ma Space** -- meaningful emptiness as the primary design material. Japanese restraint (wabi-sabi) combined with Scandinavian clarity (Japandi fusion).

**Full spec:** `docs/plans/2026-03-09-ma-space-design-system-v4.md`

> **2026-04-09 refresh:** Primary accent merged into `--ai` indigo (#3D5A7A). The previous `--sugi` cedar token was deleted. Default `--radius` changed from 2px override to 6px. See `docs/superpowers/specs/2026-04-09-indigo-rounded-motion-refresh.md` for details.

### Design Tokens (CSS Custom Properties)

```css
/* Core palette: Sumi & Indigo */
--sumi: #1A1816;          /* Headings, primary text */
--sumi-light: #3D3833;    /* Body text */
--stone: #8A8279;          /* Secondary text, captions */
--ash: #C4BDB4;            /* Muted text, placeholders */
--washi: #F5F0E8;          /* Page background */
--shoji: #FAFAF7;          /* Card surfaces */
--kinu: #FFFFFF;           /* Input fields */
--border: #E5E0D8;         /* Dividers, borders */

/* Primary accent + semantic palette */
--ai: #3D5A7A;             /* THE accent -- CTAs, focus rings, info */
--ai-deep: #2C4562;        /* Accent hover/pressed */
--matsu: #4A6B52;          /* Success / pine */
--kohaku: #A67B3D;         /* Warning / amber */
--beni: #8B3A3A;           /* Error / crimson */

/* Typography */
--font-editorial: 'Shippori Mincho B1', serif;
--font-ui: 'Satoshi', sans-serif;
--font-jp-fallback: 'Noto Sans JP', sans-serif;

/* Spacing (8px base) */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-6: 24px;  --space-8: 32px;
--space-12: 48px; --space-16: 64px; --space-24: 96px;
--space-32: 128px; /* Ma zones */

/* Layout */
--max-content: 680px;
--max-page: 1120px;
--radius: 6px;            /* Subtle Japandi rounding — not pill, not sharp */
--shadow-card: 0 1px 3px rgba(26,24,22,0.05);

/* Motion */
--ease-settle: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Color Rule

Max 3 colors active per screen: sumi + washi + one accent or semantic. Need a fourth? Remove something.

### Typography Rules

- **Shippori Mincho B1** -- headings only (H1, H2). Always Regular 400. Never bold. Authority comes from size + surrounding space.
- **Satoshi** -- everything else (H3, body, data, captions, UI). Bold 700 for H3 and overlines only.
- Body line-height: 1.8 (generous -- Ma in text)
- Data values: `font-variant-numeric: tabular-nums`
- Overlines: Satoshi 700, 10px, uppercase, 0.15em tracking

### Layout Rules

- Max content width: 680px. Max page width: 1120px.
- Single column default. Multi-column only for comparison tools / data grids.
- 12-column grid, content uses center 8 columns. Outer columns for full-bleed photos.
- Border radius: 6px default (`--radius`). Larger scales available via `--radius-md` 8px, `--radius-lg` 12px, `--radius-xl` 16px — opt in per component where needed.
- Cards: no visible border. Defined by shadow + surrounding space.
- Ma zones (128px) between major page acts. Mobile: 64px.
- **One primary button per viewport.** If two compete, one becomes secondary.

### Motion Rules

- **Tier 1 (always on):** Functional micro-interactions, 150-300ms, ease-settle curve
- **Tier 2 (editorial pages only):** Scroll reveals, parallax, seasonal particles, shoji transitions
- Tier 2 disabled when `prefers-reduced-motion: reduce`
- Motion budget: < 15KB JS total. CSS transforms + opacity only. No layout thrashing.
- Score counter: 800ms count-up (the one "showy" interaction -- it's the core product moment)

### Photography Rules

- Full-bleed only. No thumbnails, no card images.
- Max 2-3 per page, separated by text/data in Ma space.
- Desaturate 10-15%, slight warm shift (+5 temperature).
- Subject: found moments, empty scenes, single details. No posed shots, no stock.
- B&W option for due diligence pages.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, RSC, ISR) | 15.x |
| Language | TypeScript | 5.x |
| UI | shadcn/ui + Tailwind CSS | v4 |
| Database | Supabase PostgreSQL (Sydney region) | -- |
| ORM | Drizzle | 0.3x |
| Auth | NextAuth.js (anonymous-first sessions) | 5.x |
| CMS | Sanity (non-technical editors) | Free tier |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| Charts | Recharts | 2.x |
| State | TanStack Query + Zustand + nuqs | Latest |
| Hosting | Vercel | Pro |
| Analytics | Plausible (cookieless, privacy-first) | Cloud |
| Errors | Sentry | Free tier |

**ADRs:** `docs/adr/001-012` cover all architectural decisions with full rationale.

## Project Structure

```
docs/
  adr/                    # 12 Architecture Decision Records
  architecture/           # System overview, data model, auth spec
  personas/               # 4 user personas
  user-stories/           # 60+ stories across 6 feature areas
  requirements/           # Non-functional reqs, scope boundaries
  plans/                  # Design docs and implementation plans
wireframes/               # 34 HTML wireframes + design tokens
  design-system.html      # Current wireframe design system ref
  shared.css              # Wireframe-era tokens (superseded by Ma Space v4)
artifacts/                # Pre-kickoff planning docs
scripts/                  # Utilities (docgen)
```

### Application Code Structure (Phase 2)

```
src/
  styles/
    tokens.css            # CSS custom properties
    typography.css         # Font imports, type scale
    motion.css             # Tier 1 keyframes + utilities
    ma.css                 # Ma spacing utilities
  components/
    ui/                    # shadcn/ui primitives (rethemed)
    japandi/               # Bespoke Ma Space components
      decision-signal.tsx
      red-flag-panel.tsx
      content-card.tsx
      ma-divider.tsx
      seasonal-overlay.tsx
      shoji-transition.tsx
      score-counter.tsx
    photography/
      full-bleed-image.tsx
      ken-burns-hero.tsx
  lib/
    motion/
      seasonal.ts          # Canvas 2D particles (<15KB)
      scroll-reveal.ts     # IntersectionObserver stagger
      score-animate.ts     # Counter animation
    tokens.ts              # TS token exports for Recharts
  hooks/
    use-reduced-motion.ts
    use-season.ts
```

## Component Conventions

### shadcn/ui Mapping

| Component | Base | Customisation |
|-----------|------|---------------|
| Buttons | shadcn Button | Retheme (indigo accent, 6px radius) |
| Badges | shadcn Badge | Retheme (washi bg, faint semantic tints) |
| Tables | shadcn Table | Retheme + 48px row height |
| Accordions | shadcn Accordion | Retheme + 300ms motion |
| Tooltips | shadcn Tooltip | Retheme (150ms fade) |
| Inputs | shadcn Input | Retheme (bottom-border only) |
| Decision Signal | -- | Fully custom |
| Red Flag Panel | shadcn Alert | Heavy custom (left border, no tint) |
| Content Card | shadcn Card | Heavy custom (no border, Shippori titles) |
| Ma Divider | -- | Fully custom (intentional emptiness) |
| Seasonal Overlay | -- | Fully custom (Canvas 2D) |
| Score Counter | -- | Fully custom (animated count) |

### Naming

- Custom components in `components/japandi/`
- Use kebab-case filenames: `decision-signal.tsx`
- Export PascalCase components: `DecisionSignal`
- Prefix hooks with `use-`: `use-reduced-motion.ts`

## Brand Voice (For Content & Copy)

**Personality:** Calm Expert + Pragmatic Aussie Guide
- Conservative, transparent, friendly, never hype
- Use ranges and assumptions ("typically", "expect", "worst-case")
- Show tradeoffs. Short sentences. Clear headings. Useful checklists.
- Avoid: "guaranteed", "no brainer", "easy money", "bargain"

**Key messages:**
- "Decide First. Buy Second."
- "Tools and truth before you talk to anyone selling."
- "See the full cost: purchase, taxes, upkeep, management, winter reality."

**Five pillars:** Clarity, Financial Realism, Risk Control, Local Execution, Lifestyle Fit

## Audience Personas

- **P1 Weekend Warriors** -- 2-5 snow days/yr, mostly domestic
- **P2 Family Pilgrims** -- 7-14 days/yr, repeat JP/NZ, wants a base
- **P3 Powder Chasers** -- 10-20 days/yr, JP focused, multiple trips
- **P4 Value Optimisers** -- cost/queue pain, gear storage, predictable trips
- **P5 Lifestyle Integrators** -- onsen, summer use, remote work, second-home life

Full personas: `docs/personas/personas.md`

## Key References

| Document | Path |
|----------|------|
| Ma Space Design System v4 | `docs/plans/2026-03-09-ma-space-design-system-v4.md` |
| System Architecture | `docs/architecture/system-overview.md` |
| Data Model + ERD | `docs/architecture/data-model.md` |
| Auth Specification | `docs/architecture/auth-spec.md` |
| Scope Boundaries (v1 vs v2) | `docs/requirements/scope-boundaries.md` |
| Non-Functional Requirements | `docs/requirements/non-functional.md` |
| User Stories | `docs/user-stories/` (6 files, 60+ stories) |
| User Flow Diagrams | `wireframes/diagrams/` (6 Mermaid + PNG) |
| Discovery Summary | `docs/plans/discovery-summary.md` |

## Workflow Notes

- **Supabase MCP** available for database operations (schema, migrations, SQL, edge functions)
- **Figma MCP** available for design-to-code workflow
- **Privacy-first:** APPI/Privacy Act/GDPR compliant, cookieless analytics, anonymous-first sessions
- **Content:** Sanity CMS for non-technical editors (Kaz and Shiun)
- **Deployment:** Vercel with preview deploys and ISR
- **Testing:** Accessibility (WCAG 2.1 AA), performance budget per non-functional reqs
- **i18n ready:** Shippori Mincho B1 supports JP natively, architecture supports EN->JP expansion
