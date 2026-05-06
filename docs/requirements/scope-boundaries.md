# Scope Boundaries: v1 MVP vs v2 Post-Launch

**Project:** Japanoma (Buyer Insight Platform for Japan Property Investment)
**Client:** Go&C Partners (Kaz + Shiun)
**Builder:** Craefto (Obi, Developer; Sara, Project Manager)
**Budget:** $8,640 AUD | **Timeline:** 13 weeks | **Team:** 2 persons

This document defines what is included in the v1 MVP (13-week delivery) and what is deferred to v2 (post-launch). The boundary is driven by three constraints: the $8,640 AUD budget, the 13-week timeline, and the two-person team (Obi on development, Sara on project management). Scope boundaries are aligned with Shiun's roadmap phases: Phase 1.5 (Discovery + Design), Phase 1 (Core Development + QA + Launch), and Post-Launch enhancements.

Every feature area below is presented as a comparison table. The v1 column represents what will be delivered within the 13-week engagement. The v2 column represents future enhancements that the architecture supports but that are not built, tested, or documented in v1.

---

## 1. Content and CMS

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Sanity CMS as the content management platform | Same platform, extended schemas |
| Article content type with Portable Text rich editor | Long-form guide content type with chapter structure |
| Area guide content type with structured fields (description, images, taxonomy tags) | Editorial layouts with custom block types (callouts, comparison tables, image galleries) |
| Core static pages: Homepage, About, Contact, Privacy Policy | User journey content grouping (e.g., "Getting Started" series, "Area Deep Dives") |
| CMS preview via Sanity's built-in preview pane | Live preview integration with Next.js draft mode |
| Image management with Sanity's asset pipeline (auto WebP, CDN delivery) | Video content hosting and embedding |
| Required field validation: title, slug, excerpt, body, at least one area tag | Advanced editorial workflow (draft, review, scheduled publish) |
| Webhook-triggered ISR revalidation on content publish | Granular cache invalidation per content type |
| CMS training for Kaz and Shiun (one session + documentation) | Self-service editorial guidelines embedded in CMS |

---

## 2. Taxonomy and Navigation

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Full taxonomy hierarchy: Area/Region, Property Type, Use Case, Buyer Persona, Price Range, Lifestyle Tag | Additional taxonomy dimensions as content grows |
| Taxonomy items stored with English name and Japanese name (`nameJa`, e.g., "Hakuba" / "白馬") | Taxonomy synonyms and aliases for search matching |
| Filter by any single dimension on content listing pages | Content clusters (topic hubs grouping related articles and guides) |
| Multi-dimension filtering via URL parameters (nuqs) | Advanced full-text search with relevance ranking |
| Breadcrumb navigation reflecting taxonomy hierarchy | Related content algorithms (content-based or collaborative filtering) |
| Area-based navigation (e.g., Hakuba, Niseko, Kyoto, Tokyo, Osaka, Nara) | Personalized navigation based on user behavior |
| Static navigation: header menu, footer links | Dynamic "You might also like" recommendations |
| Sitemap reflecting all published content and taxonomy pages | Faceted search with combined filters and sort options |

---

## 3. User Interactions

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Save/bookmark articles and area guides (anonymous and authenticated) | Advanced recommendation engine based on saved items |
| Compare feature: select up to 3 area guides side-by-side | Extended compare (up to 5 items, exportable comparison) |
| 3 interactive quizzes: Area Preference, Use Case, Design Style | Additional quizzes (Investment Style, Renovation Scope, Visa Requirements) |
| Budget selector component (JPY/AUD ranges mapped to property types and areas) | Personalized content feed based on quiz results and browsing history |
| Quiz results stored in session (anonymous) and user profile (authenticated) | Quiz result sharing via unique URL or social media |
| Session migration: anonymous bookmarks and quiz results transfer on sign-up | Saved search alerts (notify when new content matches criteria) |
| Optimistic UI updates for bookmark/compare actions | Offline support for saved content (PWA) |

---

## 4. Event Tracking and Analytics

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Custom event tracking stored in Supabase `buyer_events` table | Real-time event streaming and live dashboard |
| Events tagged with full taxonomy context (area, property type, use case, etc.) | Predictive analytics (content performance forecasting) |
| Daily aggregation job computes `daily_stats` from raw events | Funnel analysis (multi-step conversion tracking) |
| Plausible Analytics for cookieless traffic measurement | Cohort analysis (user segment behavior over time) |
| Event types: page_view, article_read, quiz_start, quiz_complete, bookmark_add, bookmark_remove, compare_add, compare_remove, filter_apply, contact_form_submit | Event types expanded: scroll_depth, time_on_page, video_play, download, share |
| Consent-gated custom event tracking (Plausible runs without consent) | Event replay for UX research |
| 90-day raw event retention, indefinite aggregated retention | Configurable retention periods per event type |

---

## 5. Admin Dashboard

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Protected admin route (`/admin`) with role-based access | Granular role permissions (editor, analyst, admin) |
| 7 chart views: Overview (KPIs), Content Performance (bar), Area Interest (geo/bar), Quiz Completion (funnel), Event Timeline (line), Taxonomy Heatmap (heatmap), Traffic Sources (pie/donut) | Custom dimension builder (create ad-hoc chart views) |
| Date range filtering (7d, 30d, 90d, custom) | Scheduled email reports (weekly/monthly digest to Kaz and Shiun) |
| CSV export of filtered dashboard data | PDF report generation with branding |
| Recharts-based visualizations with shadcn/ui styling | Predictive insights (trend detection, anomaly alerts) |
| TanStack Query for data fetching with caching | Real-time dashboard updates via Supabase Realtime subscriptions |
| Responsive dashboard layout (desktop-optimized, tablet-functional) | Embeddable chart widgets for external presentations |

---

## 6. User Accounts

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Email/password authentication via NextAuth.js v5 | Social login: Google OAuth |
| Anonymous-first design: full browsing, bookmarking, and quiz completion without sign-up | Magic link (passwordless) authentication |
| Session migration on sign-up: anonymous data transfers to authenticated profile | User segments (tag users based on behavior for targeted content) |
| User profile page: saved bookmarks, quiz results, account settings | Profile enrichment (investment preferences, budget range, timeline) |
| Password reset via email | Two-factor authentication (TOTP) |
| Secure session cookies (httpOnly, secure, sameSite) | Account linking (merge social and email accounts) |
| Admin role for Go&C Partners (Kaz and Shiun) | Multi-tier roles (contributor, editor, analyst, admin) |

---

## 7. SEO

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Dynamic metadata generation per page (title, description, OG, Twitter Card) | A/B testing for page titles and meta descriptions |
| JSON-LD structured data: Article, Place, BreadcrumbList, FAQPage, Organization | Additional schema types: HowTo, Review, Event |
| Dynamic XML sitemap generated from all published content | Sitemap index with segmented sitemaps (articles, guides, taxonomy pages) |
| ISR for content pages (revalidate on CMS publish) | Content cluster architecture (pillar pages with supporting content) |
| Canonical URLs on all pages | Internal link optimization (automated suggestion of related links) |
| Meta robots: noindex on filtered/parameter pages | Programmatic SEO pages (auto-generated from taxonomy combinations) |
| Robots.txt with sitemap reference | Advanced crawl budget optimization |
| Image alt text enforcement in CMS | Image SEO (structured data for images, lazy loading audit) |

---

## 8. Privacy and Compliance

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Consent banner (accept/decline custom event tracking) | Cookie preference center with granular controls |
| Privacy policy page (template provided; legal review is client responsibility) | Automated Data Subject Access Request (DSAR) workflow |
| APPI (Japan) compliance: no cross-border PII transfer, data minimization | Data export in machine-readable format (JSON/CSV) for portability |
| Australian Privacy Act compliance: data stored in Sydney (ap-southeast-2) | Automated compliance audit (quarterly self-assessment report) |
| GDPR compliance by design: cookieless analytics, consent-gated tracking | Privacy impact assessment documentation |
| No PII in analytics event payloads | Consent version tracking (re-prompt on policy changes) |
| 90-day raw data retention with automated cleanup | Configurable retention per data category |
| Account deletion capability (hard delete with cascade) | Right to be forgotten: automated PII scrubbing across all systems |

---

## 9. Lead and Conversion

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Contact form on dedicated page with consent checkbox | Multi-step inquiry form (area interest, budget, timeline, contact details) |
| Form submissions stored in Supabase with timestamp and consent record | Downloadable PDF guides (area reports, buying process checklists) |
| Email notification to Go&C Partners on form submission (via Supabase Edge Function or webhook) | Newsletter/email capture with double opt-in |
| Event tracking on form submission (`contact_form_submit`) | Lead tagging automation (tag leads by area interest, budget range) |
| Thank you page with next-steps messaging | CRM integration (push leads to HubSpot, Salesforce, or similar) |
| Basic form validation (Zod schema: name, email, message, consent) | Lead scoring based on engagement signals (quiz completion, content depth) |
| Rate limiting on form submission endpoint | Automated follow-up email sequences |

---

## 10. Platform Growth

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| English-only content (en-AU) | Multi-language support: English to Japanese (hreflang, locale-prefixed routes) |
| Single-site deployment on Vercel | CRM integration for lead management |
| Public content accessible without authentication | Member-only content area (gated articles, premium guides) |
| Open taxonomy (all areas, property types visible to all users) | Property-related modules (not listings, but structured property data comparisons) |
| Go&C Partners branding throughout | White-label capability for partner sites |
| Manual content publishing by Kaz and Shiun | Contributor portal (guest authors, partner content submissions) |
| Single analytics dashboard for Go&C internal use | Client-facing analytics (share insights with prospective buyers) |

---

## 11. Performance and Infrastructure

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| Vercel Hobby or Pro plan for hosting and deployment | CDN optimization (custom cache headers, edge middleware for personalization) |
| Supabase Free or Pro plan for database, auth, and storage | Database partitioning (time-based partitioning on `buyer_events`) |
| Sanity Free plan for CMS | Multi-region deployment (Asia-Pacific edge for Japanese visitors) |
| Plausible Growth plan for traffic analytics | Dedicated database instance for high-traffic scenarios |
| Sentry for error tracking | Advanced APM (Application Performance Monitoring) |
| Vercel preview deploys for sprint demos | Staging environment with production-mirrored data |
| Single-region database (Sydney, ap-southeast-2) | Read replicas for analytics queries |
| Manual dependency updates | Automated dependency updates via Renovate or Dependabot |

---

## 12. Design and UX

| v1 MVP (13 Weeks) | v2 Post-Launch |
|--------------------|----------------|
| shadcn/ui component library with Tailwind CSS | A/B testing for CTAs and conversion-critical components |
| Responsive design: 320px to 2560px | Advanced animations (page transitions, micro-interactions) |
| Japan-inspired design theme (wabi-sabi aesthetics, muted earth tones, clean typography) | Video content support (embedded and hosted) |
| Dark mode support (system preference detection) | Customizable theme preferences per user |
| Mobile-first layout with 44px minimum touch targets | Interactive maps (Mapbox or Google Maps integration for area guides) |
| Consistent navigation pattern across all pages | Advanced data visualization (interactive charts, zoomable maps) |
| Loading states and skeleton screens for async content | Guided tours for first-time visitors |
| Error states with helpful messaging and recovery actions | Personalized homepage layout based on user preferences |

---

## Explicitly Deferred

The following features and capabilities are explicitly excluded from both v1 and the immediate v2 roadmap. They may be considered for future phases but are not part of the current architectural planning, budget allocation, or timeline. Deferral decisions are driven by the $8,640 AUD budget, the 13-week timeline, and the two-person team constraint.

| Deferred Item | Reason for Deferral |
|--------------|---------------------|
| Payment processing | No transactional revenue model in v1; platform is content and insight focused |
| Real-time property listings feed | Requires third-party data provider integration, ongoing data licensing costs, and significant development effort beyond budget |
| Machine learning recommendations | Insufficient data volume at launch; requires months of behavioral data before ML models are viable |
| Full Japanese site translation | Requires professional translation of all content, UI strings, and legal pages; estimated as a standalone project |
| Mobile native app | Web platform provides full mobile experience via responsive design; native app unjustified until audience scale warrants it |
| CRM integration | No CRM currently in use by Go&C Partners; contact form provides adequate lead capture for v1 volume |
| Newsletter/email capture (beyond contact form) | Requires email service provider integration, template design, and compliance (CAN-SPAM, ACMA); deferred to reduce v1 scope |
| Downloadable PDF resources | Requires PDF generation pipeline, design templates, and content creation effort |
| Member-only content area | All v1 content is public to maximize SEO indexing and organic discovery |
| A/B testing | Insufficient traffic volume at launch to achieve statistical significance; premature optimization |
| Lead tagging automation | Requires CRM or marketing automation platform; manual tagging sufficient for v1 lead volume |
| Automated email reports | Dashboard access provides adequate insight for v1; email automation adds infrastructure complexity |

---

## Scope Change Process

Any request to move a v2 item into v1 must be evaluated against three criteria:

1. **Budget impact:** Does it require additional development hours beyond the $8,640 AUD allocation?
2. **Timeline impact:** Does it extend the 13-week delivery timeline?
3. **Quality impact:** Does it reduce the quality or completeness of existing v1 features?

Scope changes are raised by Sara (PM), evaluated by Obi (Developer), and approved by Go&C Partners (Kaz and Shiun). Changes that affect budget or timeline require a written change request with revised estimates before work begins.

---

*Document version: 1.0*
*Last updated: 27 February 2026*
*Author: Craefto (Obi)*
*Reviewed by: Sara (PM)*
