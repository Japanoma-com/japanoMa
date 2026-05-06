# System Architecture Overview

**Project:** Japanoma — Buyer Insight Platform for Japan Property Investment
**Version:** 1.0
**Date:** 2026-02-27
**Author:** Obi (Technical Lead, Craefto)

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph Browser["Client (Browser)"]
        PS["Public Site<br/>Content Pages, Quizzes, Compare"]
        AD["Admin Dashboard<br/>Analytics, Export"]
    end

    subgraph Vercel["Vercel Platform"]
        RSC["React Server Components<br/>Content rendering, SEO"]
        CC["Client Components<br/>Quizzes, Compare, Tracking"]
        API["Next.js API Routes<br/>/api/events, /api/saves, /api/admin/*"]
        MW["Middleware<br/>Auth, Session, Rate Limiting"]
        ISR["ISR Cache<br/>Content pages, Area pages"]
    end

    subgraph Sanity["Sanity CMS"]
        Studio["Sanity Studio<br/>Content editing (Kaz/Shiun)"]
        CDN["Sanity CDN<br/>Images, Content API"]
        WH["Webhooks<br/>On-publish revalidation"]
    end

    subgraph Supabase["Supabase (Sydney Region)"]
        PG["PostgreSQL 16<br/>Taxonomy, Users, Events, Aggregates"]
        Auth["Supabase Auth Adapter<br/>Session storage"]
        Storage["Supabase Storage<br/>User uploads (future)"]
        Pooler["Supavisor<br/>Connection pooling"]
    end

    subgraph External["External Services"]
        Plausible["Plausible Analytics<br/>Traffic metrics (cookieless)"]
        Sentry["Sentry<br/>Error tracking"]
        Resend["Resend<br/>Transactional email"]
    end

    PS --> RSC
    PS --> CC
    AD --> CC
    RSC --> API
    CC --> API
    MW --> API
    API --> Pooler
    Pooler --> PG
    API --> Auth
    RSC --> CDN
    WH --> ISR
    Studio --> CDN
    CC --> Plausible
    API --> Sentry
    API --> Resend
```

## 2. Component Responsibilities

| Component | Responsibility | Technology | ADR |
|-----------|---------------|------------|-----|
| Public Site | Content display, SEO pages, educational content | Next.js 15 RSC | ADR-001 |
| Admin Dashboard | Analytics views, chart rendering, data export | Next.js 15 Client Components + Recharts | ADR-009 |
| API Routes | Event ingestion, CRUD operations, auth, analytics queries | Next.js API Routes + Drizzle ORM | ADR-002 |
| Middleware | Session creation, auth verification, rate limiting, CSRF | Next.js Middleware | ADR-003 |
| ISR Cache | Cached content pages, revalidated on CMS publish | Vercel Edge Cache | ADR-010 |
| Sanity CMS | Content authoring, taxonomy tagging, media management | Sanity Studio + GROQ | ADR-004 |
| Sanity CDN | Image delivery with transformations, content API | Sanity Asset Pipeline | ADR-004 |
| PostgreSQL | Taxonomy, users, sessions, events, aggregates | Supabase PostgreSQL 16 | ADR-002 |
| Auth Adapter | Session persistence, user storage for NextAuth.js | Supabase + NextAuth v5 | ADR-003 |
| Connection Pooler | Serverless connection management | Supavisor (Supabase) | ADR-002 |
| Plausible | Traffic analytics (sessions, referrers, devices) | Plausible Cloud (cookieless) | ADR-005 |
| Sentry | Error tracking, performance monitoring | Sentry Cloud | — |
| Resend | Welcome emails, contact form notifications | Resend API | — |

## 3. Client Architecture

```mermaid
graph TB
    subgraph ServerLayer["Server Components (Zero Client JS)"]
        HP["Homepage"]
        AP["Area Pages"]
        CP["Content Pages"]
        CH["Content Hub"]
        LP["Legal Pages"]
    end

    subgraph ClientLayer["Client Components (Interactive)"]
        Quiz["Quiz Components<br/>Multi-step forms"]
        Compare["Comparison Tool<br/>Side-by-side view"]
        Save["Save/Bookmark<br/>Toggle + list"]
        Track["Tracking Provider<br/>Event dispatch"]
        Budget["Budget Selector<br/>JPY/AUD display"]
        Consent["Consent Banner<br/>Cookie preferences"]
        DashCharts["Dashboard Charts<br/>Recharts + shadcn"]
        DashFilters["Dashboard Filters<br/>Date range, dimensions"]
    end

    subgraph StateLayer["State Management"]
        TQ["TanStack Query<br/>Server state cache"]
        ZS["Zustand Stores<br/>Client-only state"]
        NQ["nuqs<br/>URL search params"]
        LS["localStorage<br/>Anonymous saves"]
    end

    ServerLayer --> ClientLayer
    Quiz --> ZS
    Quiz --> TQ
    Compare --> ZS
    Compare --> LS
    Save --> TQ
    Save --> LS
    Track --> TQ
    Budget --> ZS
    DashCharts --> TQ
    DashFilters --> NQ
    Consent --> LS
```

### State Layer Mapping

| Feature | Server State (TanStack Query) | Client State (Zustand) | URL State (nuqs) | Local Storage |
|---------|------------------------------|----------------------|------------------|--------------|
| Content listing | Content items, pagination | — | Filters (area, type, price) | — |
| Area pages | Area data, related content | — | — | — |
| Save/bookmark | Saved items (authenticated) | — | — | Saves (anonymous) |
| Quiz | Recommendations (result) | Current step, answers | Quiz type | — |
| Comparison tool | — | Selected items (up to 3) | — | Selected items |
| Budget selector | — | Selected range | — | — |
| Admin dashboard | Analytics data, aggregates | — | Date range, dimensions, granularity | — |
| Consent | — | — | — | Consent preference |

## 4. Data Flow Diagrams

### 4.1 Anonymous Visitor Browsing and Event Tracking

```mermaid
sequenceDiagram
    participant V as Visitor Browser
    participant MW as Next.js Middleware
    participant RSC as Server Component
    participant API as /api/events
    participant DB as PostgreSQL

    V->>MW: GET /areas/nagano/hakuba
    MW->>MW: Check for jt_session cookie
    alt No session cookie
        MW->>MW: Generate session ID
        MW->>V: Set-Cookie: jt_session=abc123
    end
    MW->>RSC: Forward request with session
    RSC->>RSC: Fetch area data from Sanity
    RSC->>V: Render area page (HTML)

    Note over V: Page loads, Client Components hydrate

    V->>API: POST /api/events
    Note right of V: { eventType: "CONTENT_VIEW",<br/>sessionId: "abc123",<br/>payload: { areas: ["hakuba"],<br/>prefecture: "nagano",<br/>propertyTypes: ["house"] } }
    API->>DB: INSERT INTO events
    API->>V: 200 OK

    Note over V: User clicks "Save" button
    V->>API: POST /api/events
    Note right of V: { eventType: "SAVE",<br/>payload: { contentId: "...",<br/>areas: ["hakuba"] } }
    API->>DB: INSERT INTO events
    V->>V: Save to localStorage (anonymous)
```

### 4.2 Quiz Completion Flow

```mermaid
sequenceDiagram
    participant U as User
    participant QC as Quiz Component
    participant ZS as Zustand Store
    participant API as /api/quiz/submit
    participant DB as PostgreSQL

    U->>QC: Navigate to /quiz/area
    QC->>ZS: Initialize quiz state { step: 0, answers: {} }

    loop Each question (5 to 8 steps)
        QC->>U: Display question + options
        U->>QC: Select answer
        QC->>ZS: Update answers { climate: "temperate" }
        QC->>QC: Advance to next step
    end

    QC->>API: POST /api/quiz/submit
    Note right of QC: { quizType: "AREA_PREFERENCE",<br/>sessionId: "abc123",<br/>responses: { climate: "temperate",<br/>proximity: "rural", ... } }
    API->>DB: INSERT INTO quiz_responses
    API->>DB: INSERT INTO events (QUIZ_COMPLETE)
    API->>API: Calculate recommendations
    API->>QC: { recommendations: ["hakuba", "karuizawa", "niseko"] }
    QC->>U: Display recommended areas with links
```

### 4.3 Save/Bookmark Flow (Anonymous to Authenticated)

```mermaid
sequenceDiagram
    participant U as User
    participant SC as Save Component
    participant LS as localStorage
    participant API as /api/saves
    participant Auth as NextAuth.js
    participant DB as PostgreSQL

    Note over U: Anonymous user saves content
    U->>SC: Click "Save" on content card
    SC->>LS: Add contentId to savedItems[]
    SC->>API: POST /api/events { eventType: "SAVE" }
    SC->>U: Show filled bookmark icon

    Note over U: Later, user decides to register
    U->>Auth: POST /api/auth/register { email, password, consent }
    Auth->>DB: INSERT INTO users
    Auth->>DB: UPDATE sessions SET userId = newUser.id

    Note over U: Session migration
    Auth->>LS: Read savedItems from localStorage
    Auth->>API: POST /api/saves/migrate { items: [...] }
    API->>DB: INSERT INTO saves (userId, contentId) for each item
    API->>DB: UPDATE events SET userId WHERE sessionId = "abc123"
    Auth->>LS: Clear savedItems from localStorage
    Auth->>U: Login complete, saves persisted
```

### 4.4 Contact/Inquiry Form Submission

```mermaid
sequenceDiagram
    participant U as User
    participant FC as Form Component
    participant API as /api/contact
    participant DB as PostgreSQL
    participant Email as Resend
    participant Track as /api/events

    U->>FC: Fill out contact form
    Note right of U: name, email, message,<br/>interests (areas, use cases),<br/>consent checkbox ✓

    FC->>FC: Client-side Zod validation
    FC->>API: POST /api/contact
    API->>API: Server-side Zod validation
    API->>DB: INSERT INTO form_submissions
    Note right of API: Stores: email, name, message,<br/>interests, consent=true

    API->>Track: Log event (no PII)
    Note right of Track: { eventType: "FORM_SUBMIT",<br/>payload: { formType: "contact",<br/>interests: ["hakuba", "seasonal-living"] } }

    API->>Email: Send notification to admin
    Note right of Email: To: kaz@goandcpartners.com<br/>Subject: New inquiry from [name]
    API->>Email: Send confirmation to user
    Note right of Email: To: user@email.com<br/>Subject: Thanks for your inquiry

    API->>U: 200 { success: true }
    FC->>U: Show success message
```

### 4.5 Admin Analytics Data Flow

```mermaid
sequenceDiagram
    participant Cron as Cron Job (daily 2am AEST)
    participant DB as PostgreSQL
    participant Admin as Admin Dashboard
    participant API as /api/admin/analytics
    participant TQ as TanStack Query

    Note over Cron: Daily aggregation (2:00 AM AEST)
    Cron->>DB: SELECT from events WHERE date = yesterday
    Cron->>DB: GROUP BY area, taxonomy dimensions
    Cron->>DB: UPSERT INTO daily_area_stats
    Cron->>DB: UPSERT INTO daily_taxonomy_stats
    Cron->>DB: DELETE FROM events WHERE created_at < 90 days ago

    Note over Admin: Kaz opens admin dashboard
    Admin->>API: GET /api/admin/analytics/area-demand?start=2026-03-01&end=2026-03-31
    API->>DB: SELECT from daily_area_stats WHERE date BETWEEN ...
    DB->>API: Aggregated area demand data
    API->>TQ: Cache response (staleTime: 5min)
    TQ->>Admin: Render area demand line chart

    Admin->>API: GET /api/admin/analytics/cross-tab?dim1=area&dim2=use_case
    API->>DB: SELECT area, use_case, SUM(count) FROM daily_taxonomy_stats ...
    DB->>API: Cross-tabulation matrix
    API->>TQ: Cache response
    TQ->>Admin: Render heatmap
```

### 4.6 Content Publishing Flow (CMS to Live Site)

```mermaid
sequenceDiagram
    participant S as Shiun (Editor)
    participant Studio as Sanity Studio
    participant WH as Sanity Webhook
    participant Vercel as Vercel API
    participant ISR as ISR Cache
    participant User as Site Visitor

    S->>Studio: Edit article, add taxonomy tags
    S->>Studio: Click "Publish"
    Studio->>Studio: Validate content (required fields, min length)
    Studio->>WH: Trigger webhook on publish

    WH->>Vercel: POST /api/revalidate?secret=xxx
    Note right of WH: { type: "article",<br/>slug: "hakuba-winter-guide",<br/>areas: ["hakuba"] }

    Vercel->>ISR: Revalidate /content/hakuba-winter-guide
    Vercel->>ISR: Revalidate /areas/nagano/hakuba (related area)
    Vercel->>ISR: Revalidate /content (listing page)
    Vercel->>ISR: Regenerate sitemap.xml

    Note over User: Next visitor request
    User->>ISR: GET /content/hakuba-winter-guide
    ISR->>User: Serve freshly generated page
```

## 5. Deployment Architecture

```mermaid
graph LR
    subgraph Development
        Dev["Local Dev<br/>next dev<br/>Supabase local"]
    end

    subgraph Preview
        PR["Pull Request"]
        PD["Vercel Preview<br/>Unique URL per PR<br/>Supabase dev branch"]
    end

    subgraph Production
        Main["main branch"]
        Prod["Vercel Production<br/>japatak.com<br/>Supabase prod"]
    end

    Dev -->|"git push branch"| PR
    PR -->|"Auto deploy"| PD
    PD -->|"Kaz/Shiun review"| PR
    PR -->|"Merge to main"| Main
    Main -->|"Auto deploy"| Prod

    style Dev fill:#f0f0f0
    style PD fill:#fff3cd
    style Prod fill:#d4edda
```

### Environment Configuration

| Environment | URL | Database | CMS | Purpose |
|-------------|-----|----------|-----|---------|
| Development | localhost:3000 | Supabase local (Docker) | Sanity dev dataset | Feature development |
| Preview | pr-[N].vercel.app | Supabase dev branch | Sanity dev dataset | Sprint review with Kaz/Shiun |
| Production | japatak.com | Supabase prod (Sydney) | Sanity prod dataset | Live site |

## 6. Caching Strategy

| Resource | Cache Location | TTL | Invalidation |
|----------|---------------|-----|-------------|
| Content pages (area, article) | Vercel ISR Edge Cache | 1 hour default | On-demand via Sanity webhook |
| Content listing pages | Vercel ISR Edge Cache | 1 hour | On-demand via Sanity webhook |
| Sanity images | Sanity CDN | 365 days | URL-based (content-hash in URL) |
| Static assets (JS, CSS) | Vercel CDN | Immutable (content-hash) | New deploy generates new hashes |
| API responses (public) | TanStack Query client cache | 5 minutes | Background refetch |
| API responses (admin) | TanStack Query client cache | 5 minutes | Manual refresh button |
| Taxonomy data | TanStack Query client cache | 30 minutes | Infrequent changes |
| User saves | TanStack Query client cache | 0 (always fresh) | Optimistic update on save/unsave |
| Anonymous saves | localStorage | Indefinite | Cleared on session migration |
| Consent preference | Cookie (jt_consent) | 365 days | User changes via footer link |

## 7. Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | Server Components for content pages; Sanity CDN for images with `loading="eager"` on hero |
| FID (First Input Delay) / INP | < 100ms | Minimal client JS on content pages; dynamic imports for interactive components |
| CLS (Cumulative Layout Shift) | < 0.1 | Explicit dimensions on images; font-display: swap with preloaded fonts |
| TTFB (Time to First Byte) | < 600ms | ISR cached pages; Vercel Edge in Sydney |
| Bundle size (content pages) | < 80KB JS | Server Components eliminate client-side React for static content |
| Bundle size (dashboard) | < 200KB JS | Dynamic imports for Recharts; code-split per dashboard view |
| API response time (public) | < 300ms | Indexed queries; Supavisor connection pooling |
| API response time (admin) | < 1s | Aggregated tables; no raw event queries in API |
| Image delivery | < 500ms | Sanity CDN with WebP format; responsive `srcset` |

## 8. SEO Architecture

### Route Structure

```
/                                    → Homepage (content platform overview)
/about                               → About Go&C Partners, mission
/areas                               → Area listing (all prefectures/cities)
/areas/[prefecture]                  → Prefecture overview
/areas/[prefecture]/[city]           → City/area detail page
/content                             → Content hub (all articles/guides)
/content/[slug]                      → Individual article/guide
/quiz/area                           → Area preference quiz
/quiz/use-case                       → Use case quiz
/quiz/design                         → Design style quiz
/compare                             → Comparison tool
/saved                               → Saved items (user or localStorage)
/contact                             → Contact/inquiry form
/privacy                             → Privacy policy
/terms                               → Terms of service
/admin                               → Dashboard home (protected)
/admin/areas                         → Area demand analytics
/admin/use-cases                     → Use case distribution
/admin/design                        → Design preferences
/admin/pricing                       → Price range analysis
/admin/cross-tab                     → Cross-tabulation views
/admin/export                        → Data export
```

### Metadata Strategy

| Page Type | Title Pattern | Description Source | Structured Data |
|-----------|--------------|-------------------|----------------|
| Homepage | "Japanoma — Japan Property Investment Insights" | Static | Organization, WebSite |
| Area listing | "Explore Japan Property Areas — Japanoma" | Static | BreadcrumbList |
| Area detail | "{Area Name} Property Guide — Japanoma" | Sanity CMS excerpt | Place, BreadcrumbList |
| Article | "{Title} — Japanoma" | Sanity CMS excerpt | Article, BreadcrumbList |
| Quiz | "Find Your Ideal {Quiz Type} — Japanoma" | Static | BreadcrumbList |
| Contact | "Get in Touch — Japanoma" | Static | BreadcrumbList |

### Sitemap Generation

Dynamic `sitemap.xml` generated via Next.js `sitemap()` function. Pulls all published content slugs from Sanity at build time and regenerates on content publish via ISR.

---

*Cross-references: [ADR-001](../adr/001-framework-nextjs-15.md) (Framework), [ADR-002](../adr/002-database-and-orm.md) (Database), [ADR-004](../adr/004-cms-choice.md) (CMS), [ADR-005](../adr/005-analytics-tracking.md) (Analytics), [ADR-010](../adr/010-deployment.md) (Deployment), [ADR-011](../adr/011-seo-strategy.md) (SEO), [Data Model](data-model.md), [Auth Spec](auth-spec.md)*
