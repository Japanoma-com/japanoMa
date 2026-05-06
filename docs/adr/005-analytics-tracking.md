# ADR-005: Analytics & Event Tracking — Custom Event Tracking (DB-Stored) + Plausible

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Event tracking is the core product value of Japanoma. The admin dashboard provides Go&C Partners with buyer intent insights derived from user interactions. Unlike standard web analytics (page views, bounce rates), Japanoma needs taxonomy-tagged events: "User viewed content about Hakuba Village tagged with Seasonal Living use case and Japandi design style in the ¥15M to ¥30M price range."

This means standard analytics tools alone are insufficient. The platform needs:

1. **Custom event tracking** with rich taxonomy payloads stored in the database for cross-tabulation queries
2. **Daily aggregation** for performant dashboard queries
3. **Standard web analytics** for traffic overview (sessions, referrers, devices)
4. **Privacy-first design** compliant with APPI (Japan), Australian Privacy Act, and GDPR (see ADR-012)

## Options Considered

### Option A: Custom Event Tracking (Supabase PostgreSQL) + Plausible
**Pros:**
- Full control over event schema and taxonomy payload structure
- Events stored in same database as content and taxonomy, enabling SQL joins for cross-tabulation
- Aggregation queries run directly on PostgreSQL (no external API latency)
- Plausible provides privacy-first traffic analytics (cookieless, no consent required)
- Plausible dashboard covers standard metrics (sessions, referrers, countries, devices) without custom development
- Custom events in Plausible can mirror key actions for real-time overview
- Total separation of concerns: custom DB events for taxonomy insights, Plausible for traffic overview

**Cons:**
- Must build event ingestion API, aggregation cron, and dashboard queries from scratch
- Database storage grows with event volume; requires retention policy and potential partitioning
- No pre-built funnel analysis or user journey visualization (would need custom development)

**Cost:** Plausible Cloud: $9/month (10K monthly pageviews). Self-hosted Plausible: $0 but adds operational burden.

### Option B: PostHog (Self-Serve)
**Pros:**
- Full-featured product analytics: events, funnels, session recordings, feature flags
- Generous free tier: 1M events/month
- Self-serve or cloud options
- Can store custom properties per event (taxonomy tags)
- Built-in dashboard and visualization tools

**Cons:**
- Event data lives in PostHog's infrastructure; cross-tabulation with internal taxonomy requires API calls or data export
- PostHog's query language is not SQL; complex cross-taxonomy queries (Area × UseCase × PriceRange) are limited
- Overkill for the use case: session recordings, feature flags, and experimentation tools add complexity without value for v1
- Dashboard visualizations are PostHog's generic charts, not the purpose-built admin experience Go&C needs

**Cost:** Free tier: 1M events/month. Beyond that, usage-based pricing.

### Option C: Mixpanel
**Pros:**
- Purpose-built for event analytics with custom properties
- Powerful funnel and retention analysis
- Good documentation and SDKs

**Cons:**
- Free tier limited to 20M events/month (generous) but data retention limited
- Event data in Mixpanel's cloud; same cross-tabulation limitation as PostHog
- Cannot run SQL joins between Mixpanel events and internal taxonomy tables
- Monthly cost increases with event volume and data retention needs
- Privacy: Mixpanel stores data in US by default (APPI cross-border considerations)

**Cost:** Free tier available. Growth at $28/month.

### Option D: Custom Event Tracking Only (No External Analytics)
**Pros:**
- Complete data ownership and control
- No external service dependency or cost
- All queries are SQL against the same database

**Cons:**
- Must build traffic analytics from scratch (sessions, referrers, device detection, country detection)
- Significantly more development time for standard metrics that Plausible provides out of the box
- No real-time traffic overview without custom WebSocket implementation

**Cost:** $0 external, but 2 to 3 additional weeks of development time.

## Decision

**Custom event tracking stored in Supabase PostgreSQL for taxonomy-tagged buyer signals, combined with Plausible for standard traffic analytics.**

## Justification

The hybrid approach plays to each tool's strength:

**Custom DB events for buyer insights (the product):**
Every user interaction (content view, save, quiz completion, budget selection, comparison) is stored as an event row in PostgreSQL with a JSONB payload containing all taxonomy tags. This enables the SQL queries that power the admin dashboard:

```sql
-- Cross-tabulation: Area × Use Case
SELECT area_name, use_case_name, COUNT(*) as signal_count
FROM events e
JOIN content_taxonomy ct ON e.payload->>'contentId' = ct.content_id
WHERE e.event_type = 'CONTENT_VIEW'
  AND e.created_at BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY area_name, use_case_name
```

This query is impossible (or extremely cumbersome) with external analytics services where taxonomy data lives in a separate database.

**Plausible for traffic overview (operational analytics):**
Plausible provides sessions, unique visitors, referral sources, device breakdown, and country distribution with zero development effort. Its cookieless approach means no consent banner is needed for basic analytics (see ADR-012). Kaz and Shiun get a simple traffic dashboard from day one without waiting for the custom admin dashboard to be built.

**Why not PostHog or Mixpanel alone?**
The fundamental problem is data locality. Japanoma's taxonomy hierarchy lives in Supabase. Cross-tabulation queries (Area × Property Type × Use Case) require joining event data with taxonomy tables. External analytics services cannot run these joins natively; they would require ETL pipelines or API-based data sync, adding complexity and latency incompatible with a 13-week timeline.

## Consequences

**Positive:**
- Full SQL access to event data enables any cross-tabulation query the admin dashboard needs
- Taxonomy-tagged events are the foundation for buyer intent scoring
- Plausible provides immediate traffic visibility without custom development
- Cookieless Plausible requires no consent banner (privacy advantage)
- No vendor lock-in for the core analytics data (it is standard PostgreSQL)

**Negative/Trade-offs:**
- Must build event ingestion API endpoint (estimated 1 to 2 days)
- Must build daily aggregation cron job (estimated 1 to 2 days). Cron is hosted via Vercel Cron Jobs (available on Pro plan, see [ADR-010](010-deployment.md)), which supports scheduled serverless function invocations
- Must implement event retention policy (90-day raw events, indefinite aggregates)
- Plausible adds $9/month to operating costs
- No built-in funnel analysis; must build custom if needed post-launch

**Risks:**
- Event table growth could impact database performance at high volume (mitigated: daily aggregation reduces query load; table partitioning by month can be added if needed)
- Event tracking client-side code must be resilient to ad blockers (mitigated: events are sent to same-origin API route `/api/events`, not a third-party domain)
- Plausible script may be blocked by some ad blockers (mitigated: proxy through Next.js API route or custom domain)
