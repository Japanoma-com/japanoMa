# User Stories: Taxonomy & Content (F1)

**Project:** Japanoma — Buyer Insight Platform for Japan Property Investment
**Date:** 2026-02-27
**Feature Area:** F1 — Taxonomy & Content

This feature area covers the content hub, area listings, taxonomy navigation, CMS publishing workflows, and SEO foundations that power the Japanoma platform. Content is the primary vehicle through which buyer signals are captured. Every article, guide, and area page is tagged with a rich taxonomy (area, property type, use case, design style, price range) that feeds the insight engine. The stories below define how each persona discovers, browses, filters, and manages content across the platform.

---

### US-01: Browse Content Hub with Pagination
**As a** David Chen (Australian Property Investor)
**I want to** browse the content hub with paginated articles and guides
**So that** I can explore Japan property investment topics at my own pace without being overwhelmed by a single long page

**Acceptance Criteria:**
1. GIVEN David visits the content hub page WHEN the page loads THEN the first 12 articles are displayed as cards with thumbnail, title, excerpt, and taxonomy tags
2. GIVEN 50 published articles exist WHEN David scrolls to the bottom of the page THEN a "Load More" button or pagination controls appear showing page numbers
3. GIVEN David clicks page 2 WHEN the page transitions THEN the next 12 articles load and the URL updates to include the page parameter (e.g., `/content?page=2`)
4. GIVEN the content hub is displayed WHEN David views a content card THEN each card shows the area tag, property type tag, and a human-readable publish date
5. GIVEN David is on a paginated page WHEN he refreshes the browser THEN the same page of results is displayed based on the URL parameter

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-02: Filter Content Hub by Taxonomy
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** filter the content hub by area, property type, use case, design style, and price range
**So that** I can narrow down articles relevant to my specific interest in Hokkaido ski properties

**Acceptance Criteria:**
1. GIVEN Yuki visits the content hub WHEN the page loads THEN filter dropdowns or tag selectors are visible for area, property type, use case, design style, and price range
2. GIVEN Yuki selects "Hokkaido/Niseko" from the area filter WHEN the filter is applied THEN only articles tagged with "Hokkaido" or "Niseko" are displayed
3. GIVEN Yuki selects both "Hokkaido/Niseko" and "Ski/Winter" use case WHEN the combined filter is applied THEN only articles matching both criteria are shown (AND logic)
4. GIVEN filters are active WHEN Yuki views the results THEN an active filter indicator shows each applied filter with an "x" to remove it individually
5. GIVEN Yuki applies filters WHEN the URL updates THEN the filter state is encoded in query parameters so the filtered view can be shared or bookmarked
6. GIVEN Yuki clears all filters WHEN the hub resets THEN all published articles are displayed again in default order

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-03: View Area Listing Page with Prefecture Organization
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** view all Japan investment areas organized by prefecture/region
**So that** I can get an overview of where property investment opportunities exist across Japan

**Acceptance Criteria:**
1. GIVEN Emma navigates to the areas listing page WHEN the page loads THEN areas are grouped by region (e.g., Kanto, Kansai, Chubu, Hokkaido, Tohoku)
2. GIVEN regions are displayed WHEN Emma views a region group THEN each area within the group shows a thumbnail image, area name, prefecture, and a brief one-line description
3. GIVEN the area listing page is loaded WHEN Emma counts the visible areas THEN all published areas are present with no missing entries
4. GIVEN Emma clicks on "Hakuba" under the Chubu/Nagano region WHEN the click registers THEN she is navigated to the Hakuba area detail page
5. GIVEN Emma is browsing on a mobile device WHEN the area listing page renders THEN the regional groupings collapse into an accordion or vertically stacked layout that is easy to scroll

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-04: View Area Detail Page with Taxonomy Context
**As a** David Chen (Australian Property Investor)
**I want to** view an area detail page that provides rich context about a specific area including taxonomy relationships
**So that** I can understand what types of properties, use cases, and design styles are common in that area before investing

**Acceptance Criteria:**
1. GIVEN David navigates to the Niseko area detail page WHEN the page loads THEN the page displays the area name, prefecture (Hokkaido), hero image, and a long-form description
2. GIVEN the Niseko area page is loaded WHEN David scrolls down THEN he sees sections for common property types (e.g., Ski Lodge, Akiya Renovation), popular use cases (e.g., Rental Income, Holiday Home), and prevalent design styles (e.g., Japandi, Seasonal Living)
3. GIVEN the area detail page is displayed WHEN David views the related content section THEN at least 3 related articles tagged with "Niseko" or "Hokkaido" are shown with links
4. GIVEN the area page includes a price context section WHEN David views it THEN a typical price range for the area is displayed in both JPY and AUD (e.g., "Typical range: ¥15M to ¥50M / ~A$150K to A$500K")
5. GIVEN the area page is rendered WHEN David views the breadcrumb navigation THEN it shows Home > Areas > Hokkaido > Niseko
6. GIVEN the area page loads WHEN the page view event fires THEN the event payload includes the area slug, prefecture, and region for tracking purposes

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-05: View Content Detail Page with Taxonomy Tags
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** read a full article with all taxonomy tags clearly displayed
**So that** I can understand the context of the article and navigate to related taxonomy pages

**Acceptance Criteria:**
1. GIVEN Yuki opens an article titled "Renovating an Akiya in Nara: A Complete Guide" WHEN the page loads THEN the full article body renders with formatted headings, images, and paragraphs
2. GIVEN the article detail page is displayed WHEN Yuki views the taxonomy section THEN tags are shown for area (Nara), property type (Akiya), use case (Renovation Project), design style (Wabi-sabi), and price range (¥5M to ¥15M)
3. GIVEN taxonomy tags are displayed WHEN Yuki clicks the "Nara" area tag THEN she is navigated to the Nara area detail page
4. GIVEN taxonomy tags are displayed WHEN Yuki clicks the "Akiya" property type tag THEN she is navigated to a filtered content hub view showing all Akiya articles
5. GIVEN the article detail page is loaded WHEN Yuki scrolls to the bottom THEN a "Related Articles" section displays 3 to 5 articles that share at least one taxonomy tag with the current article

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-06: CMS Publishing Workflow
**As a** Kaz/Shiun (Go&C Admin)
**I want to** create, tag, and publish an article through the CMS so it appears on the live content hub
**So that** I can keep the platform content fresh and properly categorized for buyer insight tracking

**Acceptance Criteria:**
1. GIVEN Shiun logs into the CMS (Sanity) WHEN he creates a new article document THEN the editor presents fields for title, slug, excerpt, body (rich text), hero image, and publish date
2. GIVEN Shiun is editing a new article WHEN he views the taxonomy fields THEN he can select one or more values from each taxonomy dimension: area, property type, use case, design style, and price range
3. GIVEN Shiun has completed the article and assigned tags WHEN he sets the status to "Published" and clicks save THEN the article is marked for inclusion in the live site content
4. GIVEN the article has been published in the CMS WHEN the site rebuilds or revalidates THEN the article appears on the content hub page within 5 minutes
5. GIVEN the published article appears on the live site WHEN Shiun verifies it THEN all taxonomy tags assigned in the CMS are displayed on the article detail page
6. GIVEN Shiun changes the article status back to "Draft" WHEN the site revalidates THEN the article is removed from the content hub and returns a 404 on direct URL access

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-07: Taxonomy Navigation via Sidebar or Menu
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** navigate content using taxonomy categories from a sidebar or navigation menu
**So that** I can explore content by specific dimensions like property type or design style without using the main filters

**Acceptance Criteria:**
1. GIVEN Emma is on any page of the site WHEN she views the main navigation THEN a "Discover" or "Explore" dropdown/menu is visible with taxonomy category links (Areas, Property Types, Use Cases, Design Styles)
2. GIVEN Emma clicks "Design Styles" in the navigation WHEN the page loads THEN she sees a landing page listing all design styles (Japandi, Dark Japandi, Wabi-sabi, Seasonal Living, etc.) with thumbnail images and descriptions
3. GIVEN Emma clicks "Japandi" from the design styles page WHEN the filtered view loads THEN all content tagged with the Japandi design style is displayed
4. GIVEN the taxonomy navigation is rendered on desktop WHEN Emma views the layout THEN taxonomy categories are accessible via a mega-menu or dropdown with visual hierarchy
5. GIVEN the taxonomy navigation is rendered on mobile WHEN Emma opens the mobile menu THEN taxonomy categories are organized in collapsible accordion sections

**Priority:** Should Have
**Feature:** F1
**Phase:** Core Development

---

### US-08: Search and Discovery of Content
**As a** David Chen (Australian Property Investor)
**I want to** search for content using keywords
**So that** I can quickly find articles about specific topics like "Hakuba rental yield" without manually browsing

**Acceptance Criteria:**
1. GIVEN David is on any page WHEN he clicks the search icon in the header THEN a search input field or overlay appears with focus on the input
2. GIVEN David types "Hakuba rental" into the search field WHEN at least 3 characters have been entered THEN search suggestions appear in a dropdown showing matching article titles and area names
3. GIVEN David submits the search query WHEN the results page loads THEN matching articles are displayed ranked by relevance, each showing title, excerpt, and taxonomy tags
4. GIVEN no articles match the query "xyz123" WHEN the results page loads THEN a friendly "No results found" message is displayed with suggestions to browse areas or the content hub
5. GIVEN David searches for "Tokyo investment guide" WHEN results are returned THEN the search covers article titles, body content, and taxonomy tag names

**Priority:** Should Have
**Feature:** F1
**Phase:** Core Development

---

### US-09: SEO Dynamic Metadata and Structured Data
**As a** Kaz/Shiun (Go&C Admin)
**I want to** have every page automatically generate appropriate meta tags, Open Graph data, and structured data
**So that** the platform ranks well in search engines and content displays correctly when shared on social media

**Acceptance Criteria:**
1. GIVEN a content article page is rendered WHEN the HTML head is inspected THEN it includes a unique `<title>`, `<meta name="description">`, and `<meta name="keywords">` derived from the article title, excerpt, and taxonomy tags
2. GIVEN an area detail page is rendered WHEN the HTML head is inspected THEN Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) are present and correctly populated
3. GIVEN any content page is rendered WHEN structured data is inspected THEN a JSON-LD `Article` or `WebPage` schema is embedded with author, datePublished, and headline fields
4. GIVEN the site is crawled WHEN a search engine requests the sitemap THEN `/sitemap.xml` returns a valid sitemap including all published article URLs, area page URLs, and taxonomy landing pages
5. GIVEN Shiun publishes a new article WHEN the sitemap regenerates THEN the new article URL appears in the sitemap within 24 hours
6. GIVEN a content page is shared on LinkedIn or Facebook WHEN the platform fetches the preview THEN the correct title, description, and hero image are displayed

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-10: Content Hub Featured and Recent Articles
**As a** Emma Westbrook (Casual Browser/Researcher)
**I want to** see featured and recently published articles prominently on the content hub
**So that** I can quickly find the most important or newest content without searching

**Acceptance Criteria:**
1. GIVEN Emma visits the content hub WHEN the page loads THEN a "Featured" section at the top displays 1 to 3 editorially selected articles with larger card layouts
2. GIVEN Shiun marks an article as "Featured" in the CMS WHEN the site revalidates THEN that article appears in the featured section on the content hub
3. GIVEN the featured section is displayed WHEN Emma scrolls past it THEN a "Recent Articles" section shows the latest 6 published articles sorted by publish date descending
4. GIVEN a new article is published WHEN Emma visits the content hub THEN the new article appears first in the recent articles section
5. GIVEN no articles are marked as featured WHEN Emma visits the content hub THEN the featured section is hidden and recent articles fill the top of the page

**Priority:** Should Have
**Feature:** F1
**Phase:** Core Development

---

### US-11: Area and Lifestyle Page Templates
**As a** Kaz/Shiun (Go&C Admin)
**I want to** use structured page templates for area pages and lifestyle guides in the CMS
**So that** every area and lifestyle page maintains a consistent layout and I can create new ones efficiently

**Acceptance Criteria:**
1. GIVEN Shiun creates a new area page in the CMS WHEN the editor loads THEN a structured template is presented with defined sections: Hero, Overview, Property Types, Use Cases, Design Styles, Price Context, Gallery, Related Content
2. GIVEN Shiun fills in the Kyoto area page template WHEN he enters content for each section THEN validation ensures required fields (name, slug, prefecture, overview, hero image) are completed before publishing
3. GIVEN Shiun creates a lifestyle guide page (e.g., "Living in Hokkaido") WHEN the editor loads THEN a lifestyle template is available with sections: Hero, Introduction, Climate & Seasons, Local Amenities, Property Market Overview, Related Areas
4. GIVEN a lifestyle page is published WHEN it renders on the front end THEN the layout matches the defined template structure with consistent typography, spacing, and section ordering
5. GIVEN Shiun duplicates an existing area page WHEN the duplicate is created THEN all template sections are copied and Shiun can modify the content while retaining the structure

**Priority:** Should Have
**Feature:** F1
**Phase:** Core Development

---

### US-12: Content Taxonomy Tag Management in CMS
**As a** Kaz/Shiun (Go&C Admin)
**I want to** manage taxonomy values (add, edit, archive) directly in the CMS
**So that** I can expand or refine the taxonomy as new areas or property types become relevant

**Acceptance Criteria:**
1. GIVEN Shiun navigates to the taxonomy management section in Sanity WHEN the page loads THEN he sees lists for each taxonomy dimension: Areas, Property Types, Use Cases, Design Styles, Price Ranges
2. GIVEN Shiun adds a new area "Karuizawa" to the Areas taxonomy WHEN he saves the new entry THEN "Karuizawa" becomes available as a selectable tag in all content documents
3. GIVEN Shiun edits the display name of a design style from "Modern Japanese" to "Contemporary Japanese" WHEN he saves the change THEN all content tagged with that style reflects the updated name on the front end
4. GIVEN Shiun archives the "Budget Under ¥3M" price range WHEN the archive is saved THEN the tag is no longer selectable for new content but existing content retains the tag
5. GIVEN taxonomy values are managed WHEN Shiun views any taxonomy list THEN each value shows a count of how many content items reference it

**Priority:** Must Have
**Feature:** F1
**Phase:** Core Development

---

### US-13: Bilingual Content Support
**As a** Yuki Tanaka (Japanese-Australian Buyer)
**I want to** see Japanese place names and terminology rendered correctly alongside English content
**So that** I can recognize familiar Japanese terms and feel confident the information is authentic

**Acceptance Criteria:**
1. GIVEN Yuki views an area page for Kyoto WHEN the page loads THEN the area name is displayed in English with the Japanese characters alongside (e.g., "Kyoto (京都)")
2. GIVEN an article references Japanese architectural terms WHEN the term appears in the article body THEN it is presented with a brief inline explanation or tooltip (e.g., "engawa (縁側) — a covered veranda")
3. GIVEN Yuki views taxonomy tags WHEN Japanese proper nouns are used THEN the rendering supports Japanese characters without encoding issues or font fallback problems
4. GIVEN the CMS supports bilingual fields WHEN Shiun enters a Japanese name for an area THEN the field accepts and stores Unicode characters correctly

**Priority:** Could Have
**Feature:** F1
**Phase:** Core Development

---

### US-14: Content Hub Mobile Responsiveness
**As a** David Chen (Australian Property Investor)
**I want to** browse the content hub comfortably on my mobile phone
**So that** I can research Japan property investment during my commute or while travelling

**Acceptance Criteria:**
1. GIVEN David opens the content hub on a mobile device (viewport width under 768px) WHEN the page renders THEN content cards stack in a single column with full-width layout
2. GIVEN David is on mobile WHEN he interacts with taxonomy filters THEN filters are presented in a bottom sheet or modal rather than inline dropdowns to maximize screen space
3. GIVEN David scrolls through articles on mobile WHEN he views a content card THEN the card displays a thumbnail, title, and truncated excerpt with a clear "Read more" call to action
4. GIVEN David taps on an article card on mobile WHEN the article detail page loads THEN the full article is readable with appropriate font size (minimum 16px body text), line height, and image scaling
5. GIVEN the mobile layout is tested WHEN Lighthouse mobile audit runs THEN the content hub scores above 90 for accessibility and above 80 for performance

**Priority:** Must Have
**Feature:** F1
**Phase:** QA + Launch
