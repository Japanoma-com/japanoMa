# ADR-001: Framework — Next.js 15 with App Router

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Japanoma is a content-driven buyer insight platform for Japan property investment. The public site needs to be SEO-optimized (organic search is the primary traffic channel), fast-loading, and capable of rendering rich content pages (area guides, articles, property type overviews). Simultaneously, the platform needs interactive client-side features: preference quizzes, comparison tools, save/bookmark functionality, and a full admin analytics dashboard.

The framework must support both static/server-rendered content for SEO and dynamic client interactivity. With a $8,640 AUD budget, 13-week timeline, and a 2-person Craefto team, we need a framework that maximizes developer productivity and minimizes infrastructure complexity.

## Options Considered

### Option A: Next.js 15 (App Router)
**Pros:**
- React Server Components (RSC) enable zero-JS content pages, ideal for SEO-heavy area/article pages
- Incremental Static Regeneration (ISR) perfect for CMS-driven content that updates periodically
- App Router provides nested layouts, parallel routes, and streaming SSR
- Native image optimization via `next/image` critical for property photography
- Largest React ecosystem, extensive community resources, fastest time-to-resolution for issues
- Vercel deployment is zero-config with preview deploys for sprint demos
- Team familiarity from prior projects (GlobFam used Next.js successfully)
- Built-in API routes eliminate need for separate backend service

**Cons:**
- App Router patterns still evolving; some edge cases in caching behavior
- Tight coupling to Vercel for optimal deployment (addressed in ADR-010)
- Server Component vs Client Component boundary requires careful architecture

**Cost:** Free (MIT license). Hosting on Vercel free tier supports initial traffic.

### Option B: Remix (React Router v7)
**Pros:**
- Progressive enhancement philosophy, strong form handling
- Nested routes with loaders provide excellent data fetching patterns
- Good SEO support through SSR

**Cons:**
- Smaller ecosystem than Next.js; fewer third-party integrations
- No equivalent to ISR for content revalidation without full redeployment
- Team would need to learn new patterns, adding 1 to 2 weeks of ramp-up time
- Less mature image optimization story
- Deployment flexibility comes at cost of more configuration

**Cost:** Free (MIT license). Deployment on Fly.io or similar adds configuration overhead.

### Option C: Astro
**Pros:**
- Excellent for content-heavy sites with minimal JavaScript
- Islands architecture ships zero JS by default
- Outstanding build performance and page speed scores

**Cons:**
- React integration via islands is an afterthought, not native
- Interactive features (quizzes, comparison tool, dashboard) would fight the architecture
- Limited support for complex state management patterns
- Smaller community for full-stack patterns
- API routes are supported via Astro endpoints, but the ecosystem for full-stack patterns (auth, ORM integration, middleware) is less mature than Next.js

**Cost:** Free (MIT license).

### Option D: SvelteKit
**Pros:**
- Excellent performance, small bundle sizes
- Simpler mental model than React for some patterns
- Good SSR and SSG support

**Cons:**
- Team has zero Svelte experience; significant learning curve
- Much smaller ecosystem for UI components, charting, forms
- Hiring/handoff difficulty if client needs future development
- Fewer resources for Japan-specific patterns (i18n, currency formatting)

**Cost:** Free (MIT license).

## Decision

**Next.js 15 with App Router.**

## Justification

Next.js 15 is the clear winner for Japanoma because it uniquely serves both halves of the platform:

1. **Content pages as Server Components:** Area pages, article pages, and the content hub render entirely on the server with zero client JavaScript. This is critical for SEO (Google indexes server-rendered HTML immediately) and performance (LCP targets of < 2.5s are easily achievable).

2. **ISR for CMS content:** When Kaz or Shiun publish new content through the CMS (see ADR-004), ISR revalidates affected pages without a full redeploy. This means content updates go live within minutes without developer intervention.

3. **Client Components for interactivity:** Quizzes, the comparison tool, save/bookmark, and the admin dashboard use Client Components with the full React ecosystem (TanStack Query, Zustand, Recharts).

4. **Team velocity:** Obi has shipped production Next.js applications (GlobFam). Zero ramp-up time is critical with only 13 weeks.

5. **Sprint demo workflow:** Vercel preview deploys generate a unique URL per pull request. Kaz and Shiun can review every sprint's work on a live URL without any deployment steps.

6. **Budget alignment:** Free framework + Vercel free tier + Supabase free tier keeps infrastructure costs at $0 during development, with production costs under $50/month.

Remix lacks ISR (a dealbreaker for CMS-driven content). Astro's island architecture creates friction for the dashboard and interactive features. SvelteKit's ecosystem gap and team unfamiliarity make it too risky for a 13-week timeline.

## Consequences

**Positive:**
- Server Components reduce client JavaScript by 60 to 70% on content pages
- ISR provides near-instant content updates without redeploys
- Preview deploys streamline the client review workflow
- Shared codebase for public site and admin dashboard
- Team can start building immediately with existing Next.js knowledge

**Negative/Trade-offs:**
- Deployment is optimized for Vercel; migration to other platforms (Netlify, self-hosted) requires additional configuration
- App Router caching semantics require careful handling of dynamic data (analytics, user state)
- Server/Client Component boundary must be well-defined in the component architecture

**Risks:**
- Next.js 15 caching behavior may require workarounds for real-time admin dashboard data (mitigated by using `revalidate: 0` or client-side fetching for dashboard)
- Vercel vendor lock-in is low-risk for a project of this scale but noted for transparency
