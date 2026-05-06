# ADR-011: SEO Strategy — Dynamic Metadata + JSON-LD + ISR

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Organic search is the primary traffic acquisition channel for Japanoma. Australian investors researching Japan property investment will discover the platform through Google searches like "buying property in Hakuba," "Japan akiya for Australians," "Japandi renovation cost," and "best areas to invest in Japan property." SEO is not a nice-to-have; it is the mechanism by which the platform reaches its audience and generates the buyer signals that power the admin dashboard.

The platform's content structure (area pages, articles, guides) maps naturally to search intent. Each area page targets geographic queries; each article targets informational queries; each quiz landing page targets intent-based queries. Technical SEO must maximize the discoverability of this content.

## Options Considered

### Option A: Full Technical SEO Architecture (Dynamic Metadata + JSON-LD + Sitemap + ISR)
**Pros:**
- `generateMetadata()` in Next.js App Router produces unique title, description, and Open Graph tags per page from CMS data
- JSON-LD structured data (Article, Place, FAQPage, BreadcrumbList schemas) helps Google display rich snippets
- Dynamic XML sitemap generated at build time and updated on content publish
- ISR ensures Google always crawls fresh content without waiting for a full redeploy
- `robots.txt` and canonical URLs prevent duplicate content issues
- Hreflang tags lay groundwork for future Japanese metadata (even if full translation is post-launch)

**Cons:**
- JSON-LD schemas must be maintained as content structure evolves
- Dynamic sitemap generation adds a maintenance point
- SEO results take 3 to 6 months to materialize; no immediate traffic from SEO alone

**Cost:** $0 (all built into the application layer).

### Option B: Basic SEO (Static Metadata + Sitemap)
**Pros:**
- Simpler implementation: hardcoded metadata per page template
- Static sitemap with known routes

**Cons:**
- Same metadata across all area pages reduces search differentiation
- No structured data means no rich snippets in Google results
- Cannot target long-tail keywords effectively
- Misses the primary traffic strategy

**Cost:** $0 but significantly reduced SEO effectiveness.

### Option C: SEO Plugin/Service (Yoast-equivalent, ContentKing)
**Pros:**
- Automated SEO auditing and recommendations
- Content readability analysis

**Cons:**
- No Yoast equivalent for Next.js (it is WordPress-specific)
- ContentKing or similar services add monthly cost ($50+)
- SEO is a technical concern best handled in code for a headless CMS architecture
- External tools cannot generate JSON-LD or dynamic metadata

**Cost:** $50 to 200/month depending on service.

## Decision

**Full technical SEO architecture with dynamic metadata, JSON-LD structured data, dynamic XML sitemap, and ISR-based content freshness.**

## Justification

SEO architecture is built into every layer of Japanoma:

### 1. Route Structure for Search Intent

```
/                           → "Japan property investment for Australians"
/areas                      → "Best areas to buy property in Japan"
/areas/nagano               → "Buying property in Nagano Prefecture"
/areas/nagano/hakuba        → "Hakuba property investment guide"
/content/[slug]             → Long-tail article keywords
/quiz/area                  → "Which area in Japan should I buy property"
/quiz/design                → "What Japanese design style suits me"
```

Each route targets a distinct search intent cluster. The URL hierarchy signals topic relationships to search engines.

### 2. Dynamic Metadata per Page

```typescript
// app/areas/[prefecture]/[city]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const area = await getArea(params.prefecture, params.city);
  return {
    title: `${area.name} Property Guide | Japan Investment | Japanoma`,
    description: `Explore ${area.name} for property investment. Learn about lifestyle, pricing, and opportunities in ${area.prefecture.name}, Japan.`,
    openGraph: {
      title: `${area.name} – Japan Property Investment`,
      description: area.excerpt,
      images: [{ url: area.featuredImage, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://japatak.com/areas/${params.prefecture}/${params.city}`,
    },
  };
}
```

### 3. JSON-LD Structured Data

Each content type emits appropriate structured data:

- **Area pages:** `Place` schema with geographic coordinates, description, and breadcrumb
- **Articles:** `Article` schema with author, datePublished, dateModified, and breadcrumb
- **FAQ sections:** `FAQPage` schema for common questions about buying in Japan
- **Breadcrumbs:** `BreadcrumbList` on every page for search result navigation trails
- **Organization:** `Organization` schema on the homepage for brand knowledge panel

### 4. XML Sitemap

A dynamic sitemap at `/sitemap.xml` is generated via Next.js `sitemap()` function, pulling all published content slugs from Sanity CMS. Priority and changeFrequency are set based on content type:

| Content Type | Priority | Change Frequency |
|-------------|----------|-----------------|
| Homepage | 1.0 | weekly |
| Area pages | 0.9 | weekly |
| Content hub | 0.8 | weekly |
| Articles | 0.7 | monthly |
| Quiz pages | 0.5 | monthly |
| Legal pages | 0.3 | yearly |

### 5. ISR for Content Freshness

ISR revalidation on CMS publish (see ADR-004, ADR-010) ensures Google crawls current content. Stale pages serve immediately from cache while fresh versions generate in the background, maintaining excellent crawl performance.

### 6. i18n Foundation

While full Japanese translation is post-launch, the architecture includes:
- `hreflang="en-AU"` on all pages (primary language)
- Taxonomy items store `nameJa` alongside `name` for future Japanese metadata
- URL structure supports locale prefix (`/ja/areas/nagano`) when translation is implemented

## Consequences

**Positive:**
- Every content page is individually optimized for its target keywords
- Structured data enables rich snippets (breadcrumbs, article dates, FAQ dropdowns)
- Dynamic sitemap ensures all published content is discoverable
- ISR keeps cached pages fresh for both users and crawlers
- i18n foundation prevents architectural rework when Japanese is added

**Negative/Trade-offs:**
- JSON-LD schemas must be updated when content structure changes
- SEO results take 3 to 6 months to materialize; initial traffic will be minimal
- Metadata generation adds complexity to page components

**Risks:**
- Google algorithm changes could affect ranking strategies (mitigated: focus on content quality and technical fundamentals rather than tactics)
- Thin content pages (areas without sufficient content) may be penalized (mitigated: minimum content requirements in CMS validation before publish)
- Duplicate content risk from taxonomy filter URLs (mitigated: canonical tags point to unfiltered page; filter parameters use `robots: noindex` where appropriate)
