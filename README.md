# Japanoma

A decision-aid platform helping Australian ski-lovers decide whether — and where — to buy a home base in Northern Japan snow country. Transparent total-cost models, practical due diligence, and introductions to licensed local professionals.

**Brand promise:** *Own a Japan ski home base with clarity — not guesswork.*

> Japanoma is **not** a listings portal, buyer's agent, akiya bargain site, or hype-driven broker. See [docs/requirements/scope-boundaries.md](docs/requirements/scope-boundaries.md).

**Operator:** Go&C Partners (Kaz Yasumura, Director · Shiun, CMO)
**Audience:** Australian buyers exploring Nagano, Niigata, Hokkaido and Tōhoku.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router · React 19 · RSC · ISR) |
| Language | TypeScript 5 |
| UI | shadcn/ui + Tailwind CSS v4 + custom Japandi components |
| Database | Supabase Postgres (Sydney region) |
| ORM | Drizzle |
| Auth | Supabase Auth (anonymous-first sessions, email/password, OAuth-ready) |
| CMS | Sanity (production dataset) |
| Forms | React Hook Form + Zod |
| 3D map | three.js + @react-three/fiber + drei |
| Email | Resend |
| Analytics | Plausible (cookieless) |
| Error monitoring | Sentry |
| Hosting | Vercel |

Architecture decisions are documented in [docs/adr/](docs/adr/). Data model: [docs/architecture/data-model.md](docs/architecture/data-model.md). Auth: [docs/architecture/auth-spec.md](docs/architecture/auth-spec.md).

---

## Local setup

**Prerequisites**
- Node.js 20 LTS (or 22)
- npm 10+
- Access to: a Supabase project, a Sanity project, Resend (optional in dev), Plausible (optional in dev), Sentry (optional in dev)

**1. Install**

```bash
npm install
```

**2. Configure environment**

```bash
cp .env.example .env.local
```

Fill in the values — see comments in `.env.example` for what each one is and how to generate the secrets.

**3. Apply database migrations**

Migrations live in `supabase/migrations/` (SQL files, sequentially numbered). Apply them in order to your Supabase Postgres:

- **Via the Supabase dashboard** — SQL Editor → paste each migration in order.
- **Via the Supabase CLI** — `supabase db push` after configuring `supabase/config.toml`.
- **Via the Supabase MCP** (during development) — `mcp__supabase__apply_migration` per file.

**4. Run dev server**

```bash
npm run dev
```

Opens on `http://localhost:3000`. To run on another port:

```bash
PORT=3001 npm run dev
```

---

## Common scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (HMR, React Server Components in dev mode) |
| `npm run build` | Production build (Next.js, type-check, lint) |
| `npm start` | Run the production build locally |
| `npm test` | Jest unit tests |
| `npm run e2e` | Playwright end-to-end tests (`e2e/`) |
| `npm run lint` | Next.js lint |
| `npx tsc --noEmit` | Full TypeScript type-check |

---

## Project structure

```
src/
  app/                    Next.js App Router routes
    (auth)/               login / signup / password reset
    account/              authenticated user dashboard
    admin/                Go&C internal admin (gated)
    areas/                area directory + 3D map + city detail pages
    content/              editorial Content Hub (Sanity-backed)
    quiz/                 7-step recommendation quiz + results
    contact/              contact form
    privacy/  terms/      legal pages
  components/
    japandi/              bespoke Ma Space design-system components
    ui/                   shadcn/ui primitives, themed
    journey/              D2L journey UI (filters, nav, notes)
    legal/                legal-page shell + ToC
    photography/          full-bleed image, ken burns hero
    quiz/                 quiz step rendering
    layout/               header / footer / shells
  lib/                    server + shared utilities
    db/                   Drizzle schema + queries
    supabase/             Supabase client wrappers (server, service, middleware)
    journey/              D2L state machine + scoring
    quiz/                 quiz scoring + contact-context extraction
    policies/             Terms & Privacy versioning + acknowledgment log
    lead-capture/         consent records + leads
    sanity/               Sanity client + queries + image builder
    seo/                  json-ld helpers
    format/               currency / flight-time / origin formatters
  data/                   build-time data (e.g. area image blurs)
  hooks/                  shared React hooks
  stores/                 Zustand stores (quiz answers)
  styles/                 design tokens, motion utilities, Ma spacing
  test-mocks/             Jest module shims for ESM-only deps

supabase/migrations/      sequential SQL migrations (apply in order)
sanity/schemas/           Sanity content type definitions
public/                   static assets (hero images, fonts, OG art)
docs/                     ADRs, architecture, requirements, personas, user stories
e2e/                      Playwright tests
scripts/                  build / data scripts
```

The full design system is documented in [CLAUDE.md](CLAUDE.md) — keep that file as the canonical developer guide.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions covering:

- Creating the GitHub repository
- Creating the Supabase project (or pointing at an existing one)
- Applying the migration set
- Configuring the Sanity project
- Configuring Resend, Plausible, Sentry
- Connecting Vercel and setting environment variables
- DNS / custom domain configuration

---

## Documentation map

| Doc | What it is |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Developer guide — design system, conventions, gotchas. Read this first. |
| [CHANGELOG.md](CHANGELOG.md) | Release notes (Keep a Changelog format). |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Step-by-step deploy from scratch. |
| [docs/adr/](docs/adr/) | 12 Architecture Decision Records — *why* we chose each technology. |
| [docs/architecture/](docs/architecture/) | System overview, data model (ERD), auth spec. |
| [docs/personas/](docs/personas/) | Five user personas (P1–P5). |
| [docs/user-stories/](docs/user-stories/) | 60+ stories across six feature areas. |
| [docs/requirements/](docs/requirements/) | Non-functional requirements, scope boundaries (v1 vs v2). |
| [docs/taxonomy/](docs/taxonomy/) | Prefecture / city / area taxonomy reference. |
| [docs/a11y/](docs/a11y/) | Accessibility checklist. |

---

## Compliance notes

- **Privacy Policy** + **Terms & Conditions** are at `/privacy` and `/terms`. Both are flagged on-page as **awaiting legal review** — wording must be finalised by qualified counsel before public release. Versioning lives in `src/lib/policies/versions.ts`.
- **Acknowledgment audit log** — `policy_acknowledgments` table records every signup acceptance with version + IP + UA. Append-only, retained indefinitely.
- **Privacy-respecting analytics** — Plausible (cookieless, no cross-site tracking).
- **Anonymous-first sessions** — visitors can use the quiz, browse areas, and explore costs before sharing any personal data.
- **APPI / Privacy Act 1988 / GDPR** — see Privacy Policy structure (§1–§11) and `docs/adr/012-privacy-compliance.md`.

---

## License

Proprietary — © Go&C Partners. All rights reserved.
