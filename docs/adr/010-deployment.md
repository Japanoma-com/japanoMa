# ADR-010: Deployment — Vercel

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Japanoma is a Next.js 15 application (see ADR-001) that requires:

1. **Preview deployments** for every pull request, enabling Kaz and Shiun to review sprint work on a live URL
2. **ISR (Incremental Static Regeneration)** for CMS-driven content pages that revalidate on publish
3. **Edge caching** for fast global delivery (Australian users accessing Japan-related content)
4. **Serverless functions** for API routes (event tracking, auth, analytics)
5. **Minimal DevOps overhead** for a 2-person team with no dedicated infrastructure engineer
6. **Custom domain** support with automatic SSL

## Options Considered

### Option A: Vercel
**Pros:**
- Zero-config deployment for Next.js (same company builds both)
- Automatic preview deployments per pull request with unique URLs
- Native ISR support with on-demand revalidation (critical for CMS content updates)
- Global Edge Network with 20+ regions (Sydney PoP for Australian users)
- Serverless Functions with automatic scaling
- Built-in Web Analytics and Speed Insights (basic; supplements Plausible)
- GitHub integration: push to deploy
- Generous free tier: 100GB bandwidth, 100 hours serverless function execution
- Preview deployments are shared via URL; perfect for sprint demo workflow with Kaz and Shiun

**Cons:**
- Vendor lock-in for advanced features (ISR, middleware, edge functions)
- Free tier limited to 1 team member (Hobby plan); Pro at $20/month per member
- Serverless function cold starts (mitigated by Drizzle ORM's small bundle, see ADR-002)
- Bandwidth overages on free tier are hard-capped (no unexpected bills, but site goes down)

**Cost:** Free (Hobby plan) for development. Pro plan at $20/month per member for production.

### Option B: Netlify
**Pros:**
- Good Next.js support via Netlify Next.js Runtime
- Free tier with 100GB bandwidth
- Preview deployments per branch
- Netlify Functions for serverless

**Cons:**
- Next.js ISR support is via adapter, not native; historically laggy behind Vercel's implementation
- App Router features (Server Actions, streaming) may have compatibility gaps
- Serverless function execution is more limited on free tier
- Build times historically slower for Next.js projects

**Cost:** Free tier available. Pro at $19/month per member.

### Option C: Railway
**Pros:**
- Full control: deploy as a Node.js server (not serverless)
- No cold starts; persistent server process
- Can run background jobs (cron for analytics aggregation) on the same instance
- Predictable pricing based on resource usage

**Cons:**
- No automatic preview deployments per PR (must configure manually)
- No built-in CDN/edge caching; must add Cloudflare or similar
- Must manage scaling, health checks, and process management
- No native ISR; must implement revalidation differently
- More DevOps overhead for a 2-person team
- Hosting a persistent server costs more at low traffic than serverless

**Cost:** Starter plan: $5/month base + usage. Estimated $10 to 20/month for this project.

## Decision

**Vercel.**

## Justification

Vercel is the natural deployment target for a Next.js application, and its features directly map to Japanoma's workflow:

1. **Preview deployments are the sprint demo tool.** Every pull request generates a unique URL. Sara shares this URL with Kaz and Shiun in the weekly async update. They can click through the latest work on their phones or laptops without any setup. This is the primary mechanism for the "demo working software" sprint review rhythm established in the kickoff meeting.

2. **ISR makes content publishing instant.** When Shiun publishes a new article in Sanity, a webhook hits the Vercel revalidation endpoint. The affected page is regenerated in the background while the stale version continues serving. The new version appears within seconds. No redeploy, no build step, no developer involvement.

3. **Zero DevOps.** Push to `main` triggers production deployment. Push to a PR branch triggers preview deployment. SSL certificates are automatic. Scaling is automatic. The team spends zero time on infrastructure.

4. **Performance for Australian users.** Vercel's Sydney Point of Presence ensures static assets and ISR-cached pages are served from Australia, meeting LCP < 2.5s targets.

5. **Cost alignment.** The Hobby (free) plan supports the entire development phase. For production, the Pro plan at $20/month (one seat for Obi) is required, as the Hobby plan prohibits commercial use. The Pro plan is within budget.

Railway is a strong option for long-running processes but adds operational complexity (CDN configuration, scaling management) that is unjustified when Vercel handles it automatically. Netlify's Next.js support, while improved, historically lags behind Vercel's implementation of newer features.

## Consequences

**Positive:**
- Zero-config deployments reduce time spent on infrastructure to near zero
- Preview URLs streamline the client review workflow
- ISR revalidation enables instant content publishing from Sanity CMS
- Automatic scaling handles traffic spikes without intervention
- Built-in analytics and speed insights provide baseline monitoring

**Negative/Trade-offs:**
- Vendor lock-in for ISR and edge middleware (mitigated: core application logic is portable to any Node.js host)
- Serverless function cold starts affect API response times (mitigated: Drizzle ORM's small bundle, see ADR-002)
- Pro plan adds $20/month to operating costs

**Risks:**
- Vercel pricing changes could increase costs (mitigated: application is a standard Next.js app deployable on Netlify or Railway with configuration changes)
- Free tier bandwidth limit (100GB) could be reached with heavy property image traffic (mitigated: images served from Sanity CDN, not Vercel)
- Serverless function timeout (10s on Hobby, 60s on Pro) could affect complex analytics aggregation queries (mitigated: aggregation runs as a cron job, not user-facing API)

**Cron Job Hosting:** Vercel Pro plan includes Cron Jobs (up to 10 cron configurations). The daily aggregation job (2:00 AM AEST) and session/event cleanup job are hosted as Vercel Cron Jobs invoking Next.js API routes. This eliminates the need for a separate cron hosting service. See [ADR-005](005-analytics-tracking.md) for the aggregation strategy.
