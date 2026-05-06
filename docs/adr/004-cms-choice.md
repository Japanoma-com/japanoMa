# ADR-004: CMS Choice — Sanity Studio (Hosted)

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

This is the most consequential ADR for Japanoma's long-term success. The CMS choice directly affects whether Kaz and Shiun can manage content independently post-launch, which is a critical requirement stated in both the kickoff meeting and Shiun's roadmap document.

Shiun's roadmap explicitly states: "Allow content to be added weekly without dev support" and "CMS usability for non-technical updates." Post-launch, Shiun will be the primary content creator, publishing area guides, articles, and lifestyle content on a weekly cadence. The CMS must:

1. Be usable by non-technical editors (Kaz and Shiun have no developer background)
2. Support taxonomy tagging per content item (area, property type, use case, design style, price range)
3. Handle media management for property photography
4. Trigger Next.js ISR revalidation on publish
5. Work within the $8,640 budget (prefer free tier)
6. Support structured content blocks for flexible page layouts

## Options Considered

### Option A: Sanity (Hosted Studio)
**Pros:**
- Generous free tier: 100K API CDN requests/month, 1M API requests/month, 10GB bandwidth, 500K assets
- Real-time collaborative editing with presence indicators
- Customizable Studio (React-based) can be embedded or hosted separately
- GROQ query language is powerful for taxonomy-filtered content retrieval
- Portable Text format for rich content (structured, not HTML blobs)
- Image pipeline with on-the-fly transformations (resize, crop, format conversion)
- Webhook support for ISR revalidation on content publish
- Schema-as-code enables version-controlled content models
- Excellent TypeScript support with generated types

**Cons:**
- GROQ is a proprietary query language (learning curve for Obi, but well-documented)
- Hosted service dependency (content lives on Sanity's infrastructure)
- Studio customization requires React knowledge (but default UI is already excellent for editors)
- Free tier has fair usage limits; high-traffic sites may need paid plan ($15/month for Growth)

**Cost:** Free tier covers development and initial production. Growth plan at $15/month/user if needed.

### Option B: Strapi (Self-Hosted)
**Pros:**
- Open source, self-hostable (full data ownership)
- Admin panel is intuitive for non-technical users out of the box
- REST and GraphQL APIs built in
- Content Type Builder for visual schema definition
- Plugin ecosystem for media, i18n, roles

**Cons:**
- Requires hosting: additional server to deploy, maintain, and monitor
- Self-hosted means Obi manages updates, security patches, database backups
- Performance under load requires careful configuration (Node.js server)
- Media handling needs additional storage (S3 or Cloudinary integration)
- Strapi Cloud pricing starts at $29/month (eliminates self-hosting burden but adds cost)
- Admin UI, while usable, is less polished than Sanity Studio for rich content editing

**Cost:** Free (self-hosted on Railway: ~$5 to 10/month for server + database). Strapi Cloud: $29/month.

### Option C: Payload CMS (Self-Hosted, Next.js Native)
**Pros:**
- Built on Next.js; can be embedded in the same codebase
- Uses the same database (PostgreSQL) for content and application data
- Admin panel is developer-friendly with full TypeScript support
- No external API calls; content queries are direct database reads
- Rich text editor with custom blocks

**Cons:**
- Admin UI, while functional, prioritizes developer experience over editor experience
- Kaz and Shiun would interact with a more technical-feeling interface
- Self-hosted: same operational burden as Strapi
- Newer project; smaller community and fewer production references
- Combining CMS and application in one codebase increases deployment complexity
- Media handling needs separate storage configuration

**Cost:** Free (MIT license). Payload Cloud: $35/month.

### Option D: MDX Files in Repository
**Pros:**
- Zero infrastructure cost
- Content versioned in Git alongside code
- Full control over rendering

**Cons:**
- Kaz and Shiun cannot edit content without developer help (dealbreaker)
- No media management pipeline
- No taxonomy tagging UI; would need manual frontmatter editing
- No real-time preview or collaborative editing
- Violates the core requirement of non-technical content management

**Cost:** Free.

### Option E: Database-Managed Content (Custom Admin)
**Pros:**
- Full control over content model and editing experience
- No external dependency
- Content lives in same database as everything else

**Cons:**
- Must build an entire content editing UI from scratch (rich text editor, media upload, taxonomy selector, preview)
- Estimated 3 to 4 weeks of additional development time; incompatible with 13-week timeline
- Maintenance burden: every CMS feature must be custom built and maintained
- Editor experience will be inferior to purpose-built CMS solutions

**Cost:** Free (but significant development time cost).

## Decision

**Sanity with hosted Sanity Studio.**

## Justification

Sanity wins on the dimension that matters most for Japanoma: **editor experience for non-technical users.**

1. **Shiun and Kaz can publish independently.** Sanity Studio provides a polished, intuitive editing interface. Content types (Article, Area Guide, Lifestyle Page) are presented with clear forms. Taxonomy tags are selectable from dropdowns. Media uploads support drag-and-drop with automatic optimization. No code, no Git, no terminal.

2. **Taxonomy tagging is native.** Each content document includes reference fields to taxonomy documents (Prefecture, PropertyType, UseCase, DesignStyle, PriceRange). In the Studio, editors select from pre-populated lists. This ensures every piece of content is properly tagged for the analytics pipeline.

3. **ISR revalidation on publish.** Sanity webhooks trigger Next.js on-demand revalidation when content is published. New articles appear on the live site within seconds without any developer action.

4. **Image pipeline eliminates media management overhead.** Sanity's CDN serves property images with automatic format conversion (WebP), responsive sizing, and crop control. This is critical for a property-focused platform where image quality directly affects trust.

5. **Free tier covers the project.** 100K CDN requests/month is ample for initial traffic. The 500K asset limit accommodates hundreds of property images.

6. **Budget alignment.** Strapi Cloud ($29/month) and Payload Cloud ($35/month) add recurring costs. Self-hosting either adds operational burden to a 2-person team. Sanity's free tier eliminates both concerns.

MDX is eliminated because it violates the non-technical editing requirement. Database-managed content is eliminated because building a CMS from scratch would consume 25 to 30% of the project timeline.

## Consequences

**Positive:**
- Kaz and Shiun gain content independence from day one post-launch
- Structured content (Portable Text) enables flexible rendering across different page templates
- Image CDN eliminates need to manage image optimization in the application
- Schema-as-code means content model changes are version-controlled and reviewable in PRs
- Webhooks enable seamless ISR revalidation

**Negative/Trade-offs:**
- Content lives on Sanity's infrastructure (mitigated: Sanity provides export tools; content is structured JSON)
- GROQ query language has a learning curve (mitigated: well-documented, similar to GraphQL in power)
- Two data sources: Sanity for content, Supabase for application data (requires clear data ownership boundaries)

**Risks:**
- Sanity free tier limits could be reached if the site gains significant traffic (mitigated: Growth plan at $15/month is well within budget)
- Sanity service outage would affect content delivery (mitigated: ISR-cached pages continue serving from Vercel's edge cache even if Sanity is temporarily unavailable)
- Content model changes require developer involvement to update the schema (acceptable: content model changes are infrequent and should be deliberate)

---

*Cross-references: [ADR-001](001-framework-nextjs-15.md) (ISR revalidation), [ADR-010](010-deployment.md) (Vercel deployment for preview and ISR), [ADR-011](011-seo-strategy.md) (SEO metadata sourced from CMS), [Data Model](../architecture/data-model.md) (Content table synced from Sanity), [System Overview](../architecture/system-overview.md) (Content publishing flow)*
