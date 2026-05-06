# ADR-002: Database & ORM — Supabase PostgreSQL + Drizzle ORM

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Japanoma requires a relational database to store taxonomy hierarchies (Prefecture > City > LocalArea), content with many-to-many taxonomy relationships, user interactions (saves, quiz responses), event tracking data, and aggregated analytics. The data model involves deep joins across taxonomy dimensions (e.g., "show all content in Nagano Prefecture tagged with 'Seasonal Living' use case and 'Japandi' design style") and analytics aggregation queries (e.g., "daily area demand by views + saves, grouped by week").

The ORM choice affects developer velocity, query performance on Vercel serverless functions (cold start sensitivity), bundle size, and long-term maintainability. The tech spec drafts used Prisma, but this is not a locked decision. Obi used Drizzle successfully on GlobFam.

Supabase is chosen as the managed PostgreSQL provider (see justification below) because it bundles auth, storage, and real-time capabilities alongside the database, reducing the number of services to manage on a $8,640 budget.

## Options Considered

### ORM Option A: Drizzle ORM
**Pros:**
- SQL-like syntax that maps closely to actual queries; no "magic" abstraction layer
- Significantly smaller bundle size (~7.4KB) vs Prisma (~300KB+ engine), critical for Vercel serverless cold starts
- No separate query engine binary; runs as pure TypeScript
- Excellent TypeScript inference with zero codegen step
- Schema-as-code with `drizzle-kit` migrations that generate standard SQL
- First-class support for Supabase/PostgreSQL, including JSONB operations
- Relational query API handles nested joins cleanly for taxonomy queries
- Team familiarity: Obi used Drizzle on GlobFam successfully
- Active development with growing ecosystem

**Cons:**
- Smaller community than Prisma; fewer Stack Overflow answers and tutorials
- Relational query API is newer and less battle-tested than Prisma's include/select
- No equivalent to Prisma Studio for visual database browsing (Supabase Studio fills this gap)
- Migration tooling is functional but less polished than Prisma Migrate

**Cost:** Free (Apache 2.0 license).

### ORM Option B: Prisma ORM
**Pros:**
- Largest ORM community in the TypeScript ecosystem
- Prisma Studio provides visual data browsing and editing
- Mature migration system with `prisma migrate`
- Excellent documentation and tutorial coverage
- `include` and `select` API is intuitive for nested relations

**Cons:**
- Large binary engine (~15MB Rust binary) adds 300 to 500ms to Vercel serverless cold starts
- Bundle size significantly larger, impacting function initialization time
- Prisma Client generation step adds build complexity
- Connection pooling requires PgBouncer or Prisma Accelerate (additional service/cost)
- Schema language (`.prisma`) is a DSL, not TypeScript; no programmatic schema composition
- Many-to-many implicit join tables lack fine-grained control over the join table itself

**Cost:** Free (Apache 2.0 license). Prisma Accelerate for connection pooling: $0 for 25K monthly queries, then usage-based.

### Database Option A: Supabase (Managed PostgreSQL)
**Pros:**
- Full PostgreSQL 16 with no restrictions (extensions, RLS, functions, triggers)
- Built-in Auth, Storage, and Realtime alongside the database
- Supabase Studio provides visual table editor, SQL runner, and RLS policy manager
- Generous free tier: 500MB database, 1GB storage, 50K auth MAU
- Row Level Security (RLS) can enforce access patterns at the database level
- Connection pooling via Supavisor included (critical for serverless)
- Supabase branches for preview environments (aligns with Vercel preview deploys)

**Cons:**
- Free tier has pause-after-inactivity policy (7 days)
- Vendor-specific features (RLS policies, Edge Functions) create some lock-in
- Less control over PostgreSQL version upgrades and extensions compared to self-hosted

**Cost:** Free tier for development. Pro plan at $25/month for production (8GB database, 100GB storage).

### Database Option B: PlanetScale (MySQL)
**Pros:**
- Excellent branching workflow for schema changes
- Generous free tier

**Cons:**
- MySQL, not PostgreSQL; loses JSONB (critical for event payloads), advanced indexing, and RLS
- No bundled auth or storage; would need separate services
- Foreign key constraints handled differently (no traditional FK enforcement)

**Cost:** Free tier available. Pro at $29/month.

### Database Option C: Neon (Serverless PostgreSQL)
**Pros:**
- True serverless PostgreSQL with scale-to-zero
- Branching for preview environments
- Compatible with any PostgreSQL ORM

**Cons:**
- No bundled auth, storage, or realtime
- Newer service with less proven production track record
- Would need to add separate auth (Clerk/NextAuth) and storage (S3/Cloudflare R2) services

**Cost:** Free tier: 0.5GB storage. Pro at $19/month.

## Decision

**Supabase PostgreSQL + Drizzle ORM.**

## Justification

**Drizzle over Prisma** for three critical reasons specific to Japanoma:

1. **Serverless cold start performance:** Every Vercel serverless function invocation matters for user experience. Prisma's ~15MB Rust engine adds 300 to 500ms cold start overhead. Drizzle, as pure TypeScript, adds negligible overhead. For an SEO-focused platform where Google measures Time to First Byte, this difference is material.

2. **Complex taxonomy queries:** Japanoma's core value is cross-taxonomy querying (e.g., "content in Kyoto × Seasonal Living × Japandi × Under ¥15M"). Drizzle's SQL-like syntax makes these multi-join, multi-filter queries transparent and debuggable. When a dashboard query is slow, the Drizzle query reads almost like the SQL that will execute, making optimization straightforward.

3. **Team velocity:** Obi's prior Drizzle experience on GlobFam eliminates ramp-up time. The SQL-like mental model means less "fighting the ORM" when building analytics aggregation queries.

**Supabase over alternatives** because it consolidates three services into one:
- Database (PostgreSQL 16)
- Auth provider (used by NextAuth adapter, see ADR-003)
- File storage (property images, content media)

On a $8,640 budget, reducing the number of services to configure, monitor, and pay for is essential. Supabase's free tier covers the entire development phase, and production at $25/month is well within budget.

## Consequences

**Positive:**
- 60 to 70% faster serverless cold starts compared to Prisma
- SQL-transparent queries simplify debugging and optimization of analytics queries
- Supabase Studio provides visual database management (replaces need for Prisma Studio)
- Supabase connection pooling (Supavisor) handles serverless connection limits automatically
- Single provider for database + auth + storage reduces operational complexity
- Schema-as-TypeScript enables programmatic schema composition and type inference

**Negative/Trade-offs:**
- Smaller Drizzle community means fewer pre-built examples; team must be comfortable reading source code
- Drizzle migration tooling requires more manual SQL review compared to Prisma's guided migrations
- Supabase free tier pauses after 7 days of inactivity (mitigated by cron health check in production)

**Risks:**
- Drizzle's relational query API is newer; complex nested queries may require falling back to raw SQL via `sql` template tag (acceptable; Drizzle makes this ergonomic)
- Supabase pricing changes could affect long-term costs (mitigated by standard PostgreSQL compatibility; database is portable to any PostgreSQL host)
- Event tracking table will grow rapidly; must implement retention policy (90-day raw events, see data model) and consider partitioning if volume exceeds expectations
