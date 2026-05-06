# Non-Functional Requirements

**Project:** Japanoma (Buyer Insight Platform for Japan Property Investment)
**Client:** Go&C Partners (Kaz + Shiun)
**Builder:** Craefto (Obi, Developer; Sara, Project Manager)
**Budget:** $8,640 AUD | **Timeline:** 13 weeks | **Team:** 2 persons

This document defines the non-functional requirements that govern quality, reliability, and operational characteristics of the Japanoma platform. All requirements are calibrated to the project's constraints: a $8,640 AUD budget, a 13-week timeline, and a two-person delivery team. Where trade-offs exist, the document notes the v1 target and the path to a stricter standard post-launch.

---

## 1. Performance

Performance targets are set to meet Google's Core Web Vitals thresholds and to deliver a fast, responsive experience for Australian users researching Japan property investment.

### 1.1 Core Web Vitals

| Metric | Target | Measurement | Notes |
|--------|--------|-------------|-------|
| Largest Contentful Paint (LCP) | < 2.5 s | Vercel Speed Insights, Lighthouse | Measured on ISR-cached content pages (area guides, articles) |
| First Input Delay (FID) / Interaction to Next Paint (INP) | < 100 ms | Chrome UX Report, Lighthouse | Critical for quiz interactions and filter controls |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse, Speed Insights | Image dimensions must be explicit; font loading must use `font-display: swap` |

### 1.2 Server-Side Performance

| Metric | Target | Context |
|--------|--------|---------|
| Time to First Byte (TTFB) | < 600 ms | ISR-cached pages served from Vercel Edge Network |
| TTFB (uncached / dynamic) | < 1.2 s | First request after ISR revalidation or admin dashboard pages |
| API response (public endpoints) | < 300 ms | Content queries, taxonomy lookups, bookmark operations |
| API response (admin endpoints) | < 1 s | Dashboard aggregation queries, CSV export generation |

### 1.3 Client-Side Performance

| Metric | Target | Context |
|--------|--------|---------|
| Dashboard chart render | < 2 s | Initial paint of Recharts visualizations with up to 90 days of aggregated data |
| Quiz interaction latency | < 50 ms | Step transitions, selection feedback, result calculation |
| Filter application | < 200 ms | URL parameter update and content list re-render via TanStack Query |
| Image delivery | < 500 ms | Sanity CDN with automatic WebP conversion and responsive `srcset` |

### 1.4 Bundle Performance

| Metric | Target | Strategy |
|--------|--------|----------|
| Initial JS bundle | < 150 KB gzipped | Tree-shaking, dynamic imports for Recharts and quiz components |
| Route-level code splitting | Automatic | Next.js App Router default behavior |
| Font loading | < 100 ms perceived | `next/font` with `font-display: swap`, preloaded from Google Fonts or self-hosted |

### 1.5 Performance Budget Enforcement

- Lighthouse CI checks integrated into Vercel preview deploys during the Core Development phase.
- Performance regression alerts via Vercel Speed Insights (available on Pro plan).
- Image optimization enforced at the CMS layer: Sanity's image pipeline handles format conversion, resizing, and CDN caching automatically.

---

## 2. SEO

Organic search is the primary acquisition channel for Japanoma. The platform must rank for buyer-intent keywords in the Australian market for Japan property investment. SEO requirements are built into the technical architecture (see ADR-011: Dynamic Metadata + JSON-LD + ISR).

### 2.1 Target Keywords

| Category | Example Keywords |
|----------|-----------------|
| Primary (national) | "Japan property investment Australia", "buying property in Japan from Australia", "Japan real estate for Australians" |
| Area-specific | "buying property in Hakuba", "Niseko investment property", "Kyoto akiya renovation", "Nara kominka for sale" |
| Niche / long-tail | "Japan akiya for Australians", "Japandi renovation costs", "Japan ski property investment", "Tokyo apartment investment guide" |
| Informational | "Japan property buying process", "Japan property tax for foreigners", "akiya bank explained" |

### 2.2 Structured Data (JSON-LD)

Every page must include appropriate JSON-LD structured data. Schema types by page:

| Page Type | JSON-LD Schema | Required Properties |
|-----------|---------------|---------------------|
| Article / Blog | `Article` | headline, author, datePublished, dateModified, image, publisher |
| Area Guide | `Place` + `Article` | name, geo (latitude/longitude), description, image |
| All pages | `BreadcrumbList` | itemListElement with position, name, item URL |
| FAQ sections | `FAQPage` | mainEntity with Question + acceptedAnswer |
| Site-wide | `Organization` | name, url, logo, contactPoint |

### 2.3 Technical SEO

| Requirement | Implementation |
|-------------|---------------|
| Dynamic XML sitemap | Generated at `/sitemap.xml` via Next.js `generateSitemaps()`, includes all published articles, area guides, and static pages |
| Canonical URLs | `<link rel="canonical">` on every page; self-referencing for unique content, pointing to base URL for paginated or filtered views |
| Meta robots | `noindex, nofollow` on pages with query parameters (filters, search), `index, follow` on all canonical content pages |
| Open Graph metadata | `og:title`, `og:description`, `og:image` (1200x630), `og:url`, `og:type` on every page |
| Twitter Card metadata | `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image` |
| Robots.txt | Permit all crawlers; disallow `/admin`, `/api` (except `/api/og`); reference sitemap URL |
| Page titles | Format: `{Page Title} | Japanoma` (max 60 characters) |
| Meta descriptions | Unique per page, 120 to 160 characters, include target keyword |

### 2.4 Content SEO Enforcement

- CMS validation: articles require a minimum 120-character meta description.
- CMS validation: slug must be URL-safe, lowercase, hyphenated.
- Internal linking: area guides link to related articles; articles link back to area guides.
- Heading hierarchy enforced in CMS rich text: one H1 per page (auto-generated from title), H2/H3 for body sections.

---

## 3. Accessibility

Japanoma targets WCAG 2.1 Level AA compliance. Given the two-person team and 13-week timeline, accessibility is built into the component layer (shadcn/ui provides accessible defaults) rather than pursued as a separate workstream.

### 3.1 Perceivable

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Color contrast (text) | 4.5:1 minimum (AA) | Enforced in design system; tested with axe-core |
| Color contrast (large text) | 3:1 minimum (AA) | Large text defined as 18px+ or 14px+ bold |
| Non-text contrast | 3:1 for UI components and graphical objects | Chart colors, form borders, button outlines |
| Alt text on images | Required | Enforced as required field in Sanity CMS image schema |
| Decorative images | `alt=""` or CSS background | No empty alt attributes on meaningful images |
| Text resizing | Content readable at 200% zoom | Tested at 200% on all breakpoints |
| Media alternatives | Captions for any future video content | Deferred to v2 (no video in v1) |

### 3.2 Operable

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Keyboard navigation | All interactive elements reachable via Tab/Shift+Tab | shadcn/ui components include keyboard support by default |
| Focus indicators | Visible focus ring on all interactive elements | Tailwind `ring` utility, minimum 2px, high contrast |
| Skip navigation | "Skip to main content" link | First focusable element on every page |
| No keyboard traps | User can navigate away from any component | Modal dialogs include Escape key dismissal and focus trap with exit |
| Touch targets | 44px minimum tap target size | Enforced in component design for mobile viewports |
| Motion | Reduced motion preference respected | `prefers-reduced-motion` media query disables animations |

### 3.3 Understandable

| Requirement | Implementation |
|-------------|----------------|
| Language attribute | `<html lang="en-AU">` on all pages |
| Error identification | Form errors announced to screen readers, associated with inputs via `aria-describedby` |
| Labels | All form inputs have visible labels (not placeholder-only) |
| Consistent navigation | Same navigation pattern on all pages |
| Help text | Quizzes and forms include instructional text before interactive sections |

### 3.4 Robust

| Requirement | Implementation |
|-------------|----------------|
| Valid HTML | Semantic elements (`<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`) |
| ARIA usage | ARIA roles, states, and properties where semantic HTML is insufficient (e.g., `role="tablist"` for quiz steps) |
| Screen reader compatibility | Tested with VoiceOver (macOS/iOS) during QA + Launch phase |
| Component library | shadcn/ui built on Radix UI primitives, which implement WAI-ARIA patterns |

### 3.5 Testing Strategy

- Automated: axe-core integrated into development workflow.
- Manual: keyboard-only navigation test for all pages during QA + Launch phase.
- Screen reader: VoiceOver walkthrough of critical user journeys (homepage to article to quiz to bookmark).

---

## 4. Browser Support

Browser targets are set based on the expected audience: Australian professionals aged 30 to 55 researching Japan property investment. This demographic skews toward modern browsers on both desktop and mobile.

### 4.1 Desktop Browsers

| Browser | Minimum Version | Market Share (AU) | Notes |
|---------|----------------|-------------------|-------|
| Chrome | 120+ | ~65% | Primary development browser |
| Safari | 17+ | ~18% | Critical for macOS users |
| Firefox | 120+ | ~4% | Tested but not primary |
| Edge | 120+ | ~8% | Chromium-based, follows Chrome support |

### 4.2 Mobile Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| iOS Safari | 17+ | ~45% of mobile traffic; required for App Clip / PWA compatibility |
| Chrome Android | 120+ | ~50% of mobile traffic |
| Samsung Internet | 23+ | Best-effort support, not actively tested |

### 4.3 Responsive Breakpoints

| Breakpoint | Width Range | Layout |
|-----------|-------------|--------|
| Mobile | 320px to 639px | Single column, hamburger navigation, stacked cards |
| Tablet | 640px to 1023px | Two-column grid, side navigation on dashboard |
| Desktop | 1024px to 1439px | Three-column grid, full navigation, sidebar |
| Wide | 1440px to 2560px | Max-width container (1280px), centered layout |

### 4.4 Progressive Enhancement

- Core content (articles, area guides) is server-rendered and functional without JavaScript.
- Interactive features (quizzes, bookmarks, compare, dashboard) require JavaScript.
- No polyfills for pre-ES2020 environments. Users on unsupported browsers see a graceful fallback message.

### 4.5 Touch and Input

- All interactive elements have a minimum 44x44px touch target.
- Hover states are supplemented with focus and active states for touch and keyboard users.
- No hover-only interactions; all hover-revealed content is accessible via tap or keyboard.

---

## 5. Security

Security requirements follow the OWASP Top 10 framework, adapted for the Japanoma stack (Next.js, Supabase, Vercel). The platform does not process payments or store highly sensitive personal data in v1, which narrows the attack surface. However, user accounts and session data require robust protection.

### 5.1 Transport Security

| Requirement | Implementation |
|-------------|----------------|
| HTTPS everywhere | Enforced by Vercel; automatic TLS certificate provisioning and renewal |
| HSTS header | `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| Secure cookies | `httpOnly`, `secure`, `sameSite=lax` on all session cookies |

### 5.2 Input Validation

| Requirement | Implementation |
|-------------|----------------|
| Server-side validation | Zod schemas on all API route handlers |
| Client-side validation | React Hook Form with Zod resolver (mirrors server schemas) |
| SQL injection prevention | Drizzle ORM parameterized queries; no raw SQL string concatenation |
| XSS prevention | React default output escaping; Content Security Policy headers |

### 5.3 Authentication and Session Security

| Requirement | Implementation |
|-------------|----------------|
| Password hashing | bcrypt via NextAuth.js credentials provider |
| Session management | NextAuth.js JWT strategy with short-lived tokens |
| CSRF protection | NextAuth.js built-in CSRF token on state-changing requests |
| Session migration | Anonymous session data (bookmarks, quiz results) merged on sign-up/login |
| Rate limiting | Per-endpoint rate limits: auth endpoints (5 requests/minute), public API (60 requests/minute), admin API (30 requests/minute) |

### 5.4 Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://cdn.sanity.io data:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://plausible.io;
  frame-ancestors 'none';
```

Note: `unsafe-inline` for scripts may be required by Next.js in development; production CSP will be tightened during the QA + Launch phase.

### 5.5 Dependency Security

| Requirement | Implementation |
|-------------|----------------|
| Dependency auditing | `npm audit` run before each sprint deploy |
| Lock file | `package-lock.json` committed and used for deterministic installs |
| Minimal dependencies | Prefer standard library and framework features over third-party packages |
| Environment variables | All secrets stored in Vercel environment variables; never committed to repository |
| Client-side code | No API keys, database credentials, or secrets exposed in client bundles; Supabase anon key is the only client-visible credential (RLS-protected) |

### 5.6 Infrastructure Security

| Requirement | Implementation |
|-------------|----------------|
| Vercel deployment | Immutable deployments; no SSH access to production |
| Supabase RLS | Row Level Security policies on all user-facing tables |
| Admin access | Protected by NextAuth.js session with role check; admin routes return 403 for non-admin users |
| Logging | No PII in application logs; structured error logging via Sentry (server-side) |

---

## 6. Privacy

Privacy is a foundational design principle for Japanoma (see ADR-012: Privacy-First Architecture). The platform operates across three jurisdictions: Japan (APPI), Australia (Privacy Act 1988 + APPs), and the EU (GDPR, for any incidental European visitors). The architecture is designed to comply with the strictest applicable standard.

### 6.1 Data Collection Principles

| Principle | Implementation |
|-----------|----------------|
| Data minimization | Collect only what is necessary for the stated purpose |
| Purpose limitation | Each data point tied to a specific purpose (analytics, personalization, account management) |
| Lawful basis | Consent for tracking; legitimate interest for essential functionality; contract for account services |

### 6.2 Analytics and Tracking

| Requirement | Implementation |
|-------------|----------------|
| Cookieless traffic analytics | Plausible Analytics (no cookies, no PII, GDPR-compliant by default) |
| Custom event tracking | Consent-gated; events stored in Supabase `buyer_events` table |
| Event payloads | No PII in event data; events reference anonymous session IDs, taxonomy IDs, and content slugs |
| Consent mechanism | Banner on first visit; three states: not yet decided, accepted, declined |
| Consent persistence | Stored in `localStorage` (not a cookie) and synced to user profile on account creation |

### 6.3 Data Storage and Residency

| Data Type | Storage Location | Residency |
|-----------|-----------------|-----------|
| User accounts | Supabase (ap-southeast-2, Sydney) | Australia |
| Buyer events | Supabase (ap-southeast-2, Sydney) | Australia |
| Aggregated analytics | Supabase (ap-southeast-2, Sydney) | Australia |
| Traffic analytics | Plausible Cloud (EU) | EU (no PII transferred) |
| CMS content | Sanity Cloud (US/EU) | No PII; public content only |
| Session tokens | Vercel Edge (global) | Encrypted JWT; no PII in payload |

No cross-border transfer of personally identifiable information. Supabase hosted in Sydney ensures Australian user data remains in Australia, satisfying both APPI and Australian Privacy Act requirements for data about Japan property investment activities.

### 6.4 Data Retention

| Data Category | Retention Period | Deletion Method |
|--------------|-----------------|-----------------|
| Raw buyer events | 90 days | Automated database cleanup job (cron or Supabase function) |
| Aggregated daily stats | Indefinite | Anonymized; no PII content |
| User accounts | Until deletion requested | Hard delete with cascading removal of associated events |
| Session data (anonymous) | 30 days inactive | Automatic expiry |
| Consent records | Duration of account + 1 year | Retained for compliance audit trail |

### 6.5 User Rights

| Right | Implementation |
|-------|----------------|
| Access | User profile page shows stored data; admin can export user data on request |
| Rectification | Users can update profile information |
| Deletion | Account deletion removes all PII and associated events |
| Portability | v2: Data export in machine-readable format (JSON) |
| Objection | Users can withdraw consent at any time; tracking stops immediately |

### 6.6 Privacy Documentation

- Privacy policy page at `/privacy` (client responsibility for legal review; Craefto provides template structure).
- Cookie/tracking consent banner with clear accept/decline options.
- Contact information for privacy inquiries (Go&C Partners contact details).

---

## 7. Scalability

Scalability requirements are set conservatively for v1, reflecting the expected audience of a niche content platform in its first months. The architecture is designed to scale without re-platforming.

### 7.1 User Load

| Metric | v1 Target | Design Ceiling | Scaling Strategy |
|--------|-----------|----------------|------------------|
| Concurrent users | 100 | 500+ | Vercel Edge Network handles static/ISR pages; Supabase connection pooling for dynamic requests |
| Daily active users | 500 | 5,000+ | ISR reduces origin server load; most pages served from CDN |
| Peak simultaneous sessions | 50 | 200+ | Serverless functions auto-scale on Vercel |

### 7.2 Data Volume

| Metric | v1 Target | Design Ceiling | Scaling Strategy |
|--------|-----------|----------------|------------------|
| Daily buyer events | 5,000 | 50,000+ | Batch inserts; daily aggregation reduces query load |
| Total buyer events (raw) | 450,000 (90 days) | 4,500,000 | 90-day retention policy; indexed queries on aggregated tables |
| Content items (articles + guides) | 50 | 500+ | ISR handles cache invalidation; Sanity CDN for media |
| Database size | 500 MB (free tier) | 8 GB (Pro tier) | Supabase plan upgrade; no schema changes required |

### 7.3 Infrastructure Scaling Path

| Component | v1 Tier | Scale-Up Tier | Trigger |
|-----------|---------|---------------|---------|
| Vercel | Hobby / Pro | Pro / Enterprise | >100 GB bandwidth or >1,000 builds/month |
| Supabase | Free | Pro ($25/month) | >500 MB database or >50,000 monthly active users |
| Sanity | Free | Growth ($99/month) | >100,000 API requests/month or >5 GB assets |
| Plausible | Growth ($9/month) | Business ($19/month) | >10,000 monthly pageviews |

### 7.4 Content Delivery

| Requirement | Implementation |
|-------------|----------------|
| CDN bandwidth | 100 GB/month (Vercel included) + Sanity CDN for images |
| ISR revalidation | Content pages revalidate on CMS publish via webhook; stale-while-revalidate for uninterrupted user experience |
| Static generation | Homepage, about page, and other static pages generated at build time |
| Image CDN | Sanity image pipeline: automatic WebP conversion, responsive sizing, global CDN |

### 7.5 Database Scalability

- Connection pooling via Supabase's built-in PgBouncer (transaction mode).
- Indexed queries on `buyer_events` by `session_id`, `event_type`, `created_at`, and taxonomy foreign keys.
- Aggregation tables (`daily_stats`) pre-compute dashboard metrics, reducing query complexity from O(n) to O(days).
- No full-table scans on user-facing endpoints; all queries use indexed lookups.

---

## 8. Observability

Observability is scoped to the tools available within the project's budget. The goal is to detect errors quickly, understand user behavior at a high level, and monitor performance trends.

### 8.1 Error Tracking

| Requirement | Implementation |
|-------------|----------------|
| Error capture | Sentry (Next.js SDK) for both server-side and client-side errors |
| Source maps | Uploaded to Sentry on each deploy for readable stack traces |
| Alert thresholds | Email notification on >10 errors/hour (configurable) |
| Error context | User session ID (anonymous), page URL, browser, and device type attached to error events |
| PII scrubbing | Sentry configured to strip email addresses and other PII from error payloads |

### 8.2 Traffic Analytics

| Requirement | Implementation |
|-------------|----------------|
| Pageview tracking | Plausible Analytics (cookieless, privacy-compliant) |
| Custom goals | Plausible goals for key conversions: quiz completion, contact form submission, bookmark action |
| UTM tracking | Plausible captures UTM parameters for campaign attribution |
| Dashboard access | Plausible dashboard shared with Go&C Partners via public link or team invite |

### 8.3 Performance Monitoring

| Requirement | Implementation |
|-------------|----------------|
| Web Vitals | Vercel Speed Insights (Real User Monitoring) |
| Build performance | Vercel build logs with timing for each route |
| API latency | Logged in Vercel function logs; reviewed during sprint retrospectives |

### 8.4 Application Health

| Requirement | Implementation |
|-------------|----------------|
| Health endpoint | `GET /api/health` returns `{ status: "ok", timestamp, version }` |
| Database check | Health endpoint verifies Supabase connectivity |
| CMS check | Health endpoint verifies Sanity API reachability |
| Uptime monitoring | Vercel's built-in monitoring or a free external service (e.g., UptimeRobot) |

### 8.5 Development-Time Observability

| Requirement | Implementation |
|-------------|----------------|
| Database query logging | Drizzle ORM query logging enabled in development mode |
| API request logging | Next.js middleware logs request method, path, and duration in development |
| Component render tracking | React DevTools Profiler for development-time performance analysis |
| Bundle analysis | `@next/bundle-analyzer` available for on-demand bundle size inspection |

---

## 9. Content Requirements

Content is the primary product of Japanoma. These requirements ensure that content is optimized for both readers and search engines, and that the CMS enforces quality standards without burdening non-technical editors (Kaz and Shiun).

### 9.1 Image Requirements

| Specification | Requirement |
|--------------|-------------|
| Upload format | JPEG, PNG, or WebP accepted |
| Delivery format | WebP (auto-converted by Sanity image pipeline); JPEG fallback for unsupported browsers |
| Maximum upload size | 10 MB per image |
| Hero images | 1920x1080 px recommended |
| Card thumbnails | 800x600 px recommended |
| Open Graph images | 1200x630 px (required for social sharing) |
| Alt text | Required field in CMS; validation prevents publishing without alt text |
| Lazy loading | All below-the-fold images use `loading="lazy"` |
| Responsive images | `srcset` with 400px, 800px, 1200px, and 1600px widths generated by Sanity |

### 9.2 Article and Guide Requirements

| Specification | Requirement |
|--------------|-------------|
| Minimum word count | 300 words per article (SEO baseline for indexing) |
| Recommended word count | 800 to 1,500 words for area guides; 500 to 1,000 words for articles |
| Required CMS fields | Title, slug, excerpt (120 to 160 characters), body (Portable Text), at least one area tag |
| Optional CMS fields | Author, featured image, property type tags, use case tags, FAQ section, related articles |
| Slug format | Lowercase, hyphen-separated, no special characters (auto-generated from title, editable) |
| Excerpt | Used as meta description and card preview text; must be manually written (not auto-truncated) |

### 9.3 Taxonomy Tagging

Every content item must be tagged with at least one dimension from the taxonomy:

| Taxonomy Dimension | Examples | Required |
|-------------------|----------|----------|
| Area / Region | Hakuba, Niseko, Kyoto, Tokyo, Osaka, Nara | Yes (at least one) |
| Property Type | Akiya, Kominka, Apartment, Ski Chalet | No (recommended) |
| Use Case | Renovation, Investment, Holiday Home, Retirement | No (recommended) |
| Buyer Persona | First-time, Experienced Investor, Lifestyle Buyer | No (recommended) |

### 9.4 Content Freshness

| Requirement | Implementation |
|-------------|----------------|
| Published date | Displayed on all articles; used in JSON-LD `datePublished` |
| Modified date | Updated on edit; used in JSON-LD `dateModified` and sitemap `lastmod` |
| Evergreen content | Area guides reviewed quarterly (post-launch responsibility of Go&C Partners) |
| Stale content indicator | v2: CMS flag for content not updated in 6+ months |

---

## 10. Internationalization

Japanoma v1 is an English-language platform targeting Australian buyers. However, the subject matter (Japan property investment) inherently involves Japanese language, currency, and cultural context. The architecture prepares for future multi-language support without requiring it in v1.

### 10.1 Language

| Requirement | Implementation |
|-------------|----------------|
| Primary language | English (en-AU) |
| HTML lang attribute | `<html lang="en-AU">` |
| Japanese names | Taxonomy items store `nameJa` alongside English `name` (e.g., "Hakuba" / "白馬") |
| Japanese in content | Inline Japanese terms rendered with `<span lang="ja">` for screen readers |
| Future: hreflang | Tags prepared in metadata template; activated when Japanese version launches |
| Future: locale routing | `/en/...` and `/ja/...` prefixed routes; default redirect based on `Accept-Language` header |

### 10.2 Currency

| Requirement | Implementation |
|-------------|----------------|
| Primary currency | JPY (Japanese Yen) for property-related figures |
| Secondary currency | AUD (Australian Dollar) for approximate conversions |
| Conversion rates | Static or periodically updated approximation; not live market rates |
| Display format | JPY: `¥12,000,000`; AUD: `A$150,000` |
| Conversion disclaimer | All AUD figures displayed with "approximate" label and last-updated date |

### 10.3 Date and Number Formatting

| Requirement | Format | Example |
|-------------|--------|---------|
| Dates | DD MMM YYYY (Australian convention) | 15 Mar 2026 |
| Times | 12-hour with AM/PM | 2:30 PM |
| Numbers | Commas for thousands separator | 12,000,000 |
| Decimal | Period as decimal separator | 3.5% |

### 10.4 Internationalization Architecture Readiness

The following are not implemented in v1 but are supported by the architecture:

- **Translation keys:** Content stored in Sanity supports localized fields (add `_i18n` suffix).
- **Locale detection:** Next.js middleware can read `Accept-Language` header for future routing.
- **RTL support:** Not required (English and Japanese are both LTR).
- **Character encoding:** UTF-8 throughout; Japanese characters (kanji, hiragana, katakana) render correctly in all components.
- **Font support:** Selected font families include Japanese character coverage or fall back to system fonts for `lang="ja"` spans.

---

## Compliance Matrix

Summary of compliance targets and their verification method:

| Standard | Target | Verification | Phase |
|----------|--------|-------------- |-------|
| Core Web Vitals | All green | Lighthouse CI, Vercel Speed Insights | QA + Launch |
| WCAG 2.1 AA | Full compliance | axe-core automated + manual keyboard/VoiceOver testing | QA + Launch |
| OWASP Top 10 | Addressed | Architecture review, dependency audit, CSP headers | Core Development |
| APPI (Japan) | Compliant | Privacy-first architecture, no cross-border PII transfer | Discovery + Design |
| Australian Privacy Act | Compliant | Consent mechanism, data residency in Sydney | Discovery + Design |
| GDPR | Compliant by design | Cookieless analytics, consent-gated tracking, data minimization | Discovery + Design |
| SEO best practices | All pages pass | Lighthouse SEO audit, structured data validation | QA + Launch |

---

*Document version: 1.0*
*Last updated: 27 February 2026*
*Author: Craefto (Obi)*
*Reviewed by: Sara (PM)*
