# User Stories: Admin Dashboard (F5)

**Project:** Japanoma — Buyer Insight Platform for Japan Property Investment
**Date:** 2026-02-27
**Feature Area:** F5 — Admin Dashboard

This feature area covers the admin dashboard that surfaces aggregated buyer insight data to the Go&C team. The dashboard transforms raw event tracking data into actionable visualizations: demand trends by area, use case distributions, design style preferences, price range histograms, renovation feature rankings, and cross-tabulation heatmaps. All views support date range filtering and data export (CSV, PDF). The dashboard is the primary tool through which Kaz and the Shiun team extract value from the platform's behavioral data, informing business decisions about which areas to develop, which content to produce, and which buyer segments to prioritize.

---

### US-01: Dashboard Overview Metrics
**As a** Kaz/Shiun (Go&C Admin)
**I want to** see a dashboard overview page with key metrics at a glance
**So that** I can quickly assess platform health and buyer engagement without navigating to individual charts

**Acceptance Criteria:**
1. GIVEN Shiun logs into the admin dashboard WHEN the overview page loads THEN the following summary cards are displayed: Total Signals (all tracked events), Active Sessions (unique sessions in the selected period), Total Saves, Total Quiz Completions, and Total Form Submissions
2. GIVEN the overview page is loaded WHEN Shiun views the "Top Areas" widget THEN the 5 most-viewed areas are listed with view counts, ranked in descending order (e.g., 1. Niseko: 1,240 views, 2. Hakuba: 980 views)
3. GIVEN the overview page is loaded WHEN Shiun views the "Trends" widget THEN a sparkline chart shows total daily signals over the last 30 days to indicate engagement trajectory
4. GIVEN the overview page is loaded WHEN Shiun views the "Recent Activity" feed THEN the last 10 events are listed showing event type, content title, and timestamp (e.g., "content_save: Akiya Guide Nara, 2 min ago")
5. GIVEN the overview page loads WHEN all widgets finish rendering THEN the total load time is under 3 seconds for the complete dashboard view
6. GIVEN the overview page is loaded WHEN Shiun applies a date range filter THEN all summary cards and widgets update to reflect only data within the selected range

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-02: Area Demand Line Chart with Date Range Filtering
**As a** Kaz/Shiun (Go&C Admin)
**I want to** view a line chart showing area demand (content views and saves) over time with date range controls
**So that** I can identify demand trends, seasonal patterns, and emerging interest in specific areas

**Acceptance Criteria:**
1. GIVEN Shiun navigates to the "Area Demand" section WHEN the page loads THEN a line chart is displayed with the x-axis showing dates and the y-axis showing event count (views + saves)
2. GIVEN the line chart is displayed WHEN Shiun selects specific areas (e.g., Niseko, Hakuba, Kyoto) THEN each selected area is rendered as a separate colored line on the chart with a legend
3. GIVEN the chart is displayed WHEN Shiun changes the date range to "Last 7 days" THEN the chart re-renders showing only data from the last 7 days with the x-axis labels adjusted accordingly
4. GIVEN the chart is displayed WHEN Shiun selects "Last 90 days" THEN data points are aggregated weekly to keep the chart readable (rather than showing 90 individual daily points)
5. GIVEN Shiun hovers over a data point on the Niseko line WHEN the tooltip appears THEN it shows the exact date, area name, and count (e.g., "Niseko, Jan 15 2026: 87 views, 12 saves")
6. GIVEN custom date range is selected WHEN Shiun sets start date to 2026-01-01 and end date to 2026-01-31 THEN the chart shows only January 2026 data with daily granularity

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-03: Area Demand Ranking and Comparison
**As a** Kaz/Shiun (Go&C Admin)
**I want to** view a ranked list of areas by total demand signals
**So that** I can compare which areas generate the most buyer interest and prioritize business development accordingly

**Acceptance Criteria:**
1. GIVEN Shiun navigates to "Area Ranking" WHEN the page loads THEN a horizontal bar chart displays all areas ranked by total demand signals (views + saves + quiz recommendations) in descending order
2. GIVEN the ranking is displayed WHEN Shiun views each bar THEN the bar shows the area name, total count, and a breakdown tooltip showing views, saves, and quiz recommendations separately
3. GIVEN the ranking is displayed WHEN Shiun applies a date range filter THEN the ranking recalculates using only data from the selected period
4. GIVEN the ranking is displayed WHEN Shiun toggles between "All signals", "Views only", "Saves only" THEN the ranking re-sorts based on the selected signal type
5. GIVEN the ranking data includes at least 10 areas WHEN Shiun views the chart THEN all areas are visible with scrolling if necessary, and the top 3 areas are visually highlighted with a distinct color or badge
6. GIVEN Shiun clicks on an area bar (e.g., Niseko) WHEN the click registers THEN the dashboard navigates to the area demand line chart pre-filtered to that area

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-04: Use Case Distribution Pie/Donut Chart
**As a** Kaz/Shiun (Go&C Admin)
**I want to** view a pie or donut chart showing the distribution of use case preferences
**So that** I can understand what buyers are primarily looking for (holiday home, rental income, renovation, etc.)

**Acceptance Criteria:**
1. GIVEN Shiun navigates to "Use Case Insights" WHEN the page loads THEN a donut chart displays the distribution of use cases based on quiz responses and content interaction data
2. GIVEN the chart is displayed WHEN Shiun views the segments THEN each use case is labeled: Holiday Home, Rental Income, Renovation Project (Akiya), Lifestyle/Retirement, Investment (Capital Growth), with percentage and count
3. GIVEN the chart is displayed WHEN Shiun hovers over the "Rental Income" segment THEN a tooltip shows the exact count and percentage (e.g., "Rental Income: 342 signals, 28.5%")
4. GIVEN the chart is displayed WHEN Shiun applies an area filter (e.g., Niseko only) THEN the donut chart recalculates to show use case distribution for Niseko specifically
5. GIVEN the donut chart is displayed alongside a data table WHEN Shiun views the table THEN each row shows the use case, signal count, percentage, and change from the previous period (e.g., "+12% vs. last month")
6. GIVEN date range filtering is applied WHEN Shiun selects "Last 30 days" THEN the chart and table reflect only the selected period

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-05: Design Style Preferences Bar Chart
**As a** Kaz/Shiun (Go&C Admin)
**I want to** view a bar chart showing design style preferences aggregated from quiz results and content interactions
**So that** I can understand which aesthetics resonate most with buyers and guide content creation

**Acceptance Criteria:**
1. GIVEN Shiun navigates to "Design Style Insights" WHEN the page loads THEN a vertical bar chart shows all design styles (Japandi, Dark Japandi, Wabi-sabi, Seasonal Living, Contemporary Japanese) ranked by total signals
2. GIVEN the chart is displayed WHEN Shiun views each bar THEN the bar label shows the style name and count, with quiz-derived signals and content-view-derived signals stacked or color-coded for distinction
3. GIVEN the chart is displayed WHEN Shiun applies a date range filter THEN the bars update to reflect only signals within the selected period
4. GIVEN the chart is rendered WHEN Shiun views the "Japandi" bar THEN a tooltip shows: total count, quiz selections count, content view count, and the percentage share of all design style signals
5. GIVEN the chart is displayed WHEN Shiun applies an area filter (e.g., Kyoto) THEN the chart shows design style preferences specific to visitors who also viewed Kyoto content
6. GIVEN all design styles have data WHEN the chart renders THEN bars are sorted by total signal count descending, with the most popular style on the left

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-06: Price Range Histogram
**As a** Kaz/Shiun (Go&C Admin)
**I want to** view a histogram of budget/price range selections
**So that** I can understand the investment capacity distribution of platform visitors and align property recommendations accordingly

**Acceptance Criteria:**
1. GIVEN Shiun navigates to "Price Insights" WHEN the page loads THEN a histogram displays price range buckets: Under ¥5M, ¥5M to ¥15M, ¥15M to ¥30M, ¥30M to ¥50M, ¥50M+ with the count of selections for each bucket
2. GIVEN the histogram is displayed WHEN Shiun views each bar THEN the bar label shows both the JPY range and the approximate AUD equivalent (e.g., "¥15M to ¥30M / ~A$150K to A$300K")
3. GIVEN the histogram is displayed WHEN Shiun hovers over the "¥5M to ¥15M" bar THEN a tooltip shows the exact count, percentage of total, and the most common area associated with that price range
4. GIVEN the histogram is displayed WHEN Shiun applies a date range filter THEN the histogram updates to reflect only budget selections within the selected period
5. GIVEN the histogram is displayed alongside a summary WHEN Shiun views the summary THEN the median budget range and the most popular budget range are highlighted (e.g., "Most popular: ¥15M to ¥30M, 35% of selections")

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-07: Renovation Feature Ranking
**As a** Kaz/Shiun (Go&C Admin)
**I want to** view a ranking of renovation features and attributes that buyers are most interested in
**So that** I can advise property developers on which renovation features to prioritize in project planning

**Acceptance Criteria:**
1. GIVEN Shiun navigates to "Renovation Insights" WHEN the page loads THEN a ranked list or bar chart shows renovation-related attributes sorted by interest signal count (e.g., "Traditional tatami rooms", "Modern kitchen", "Onsen/hot spring bath", "Garden/engawa", "Energy efficiency")
2. GIVEN the ranking is displayed WHEN Shiun views each item THEN the count reflects content views and saves on articles tagged with each renovation feature
3. GIVEN the ranking is displayed WHEN Shiun applies an area filter (e.g., Nara) THEN the renovation features re-rank based on signals from visitors who also showed interest in Nara
4. GIVEN the ranking is displayed WHEN Shiun applies a date range filter THEN the ranking recalculates using only data from the selected period
5. GIVEN the ranking includes at least 8 renovation features WHEN Shiun views the chart THEN all features are visible with clear labels and count values
6. GIVEN Shiun clicks on a renovation feature (e.g., "Onsen/hot spring bath") WHEN the click registers THEN a detail panel shows which articles reference this feature and their individual view/save counts

**Priority:** Should Have
**Feature:** F5
**Phase:** Core Development

---

### US-08: Cross-Tabulation Heatmap
**As a** Kaz/Shiun (Go&C Admin)
**I want to** view a cross-tabulation heatmap showing the relationship between two taxonomy dimensions
**So that** I can discover patterns like "Rental Income interest is highest in Niseko" or "Wabi-sabi style is most popular with Akiya property types"

**Acceptance Criteria:**
1. GIVEN Shiun navigates to "Cross-Tab Analysis" WHEN the page loads THEN a heatmap is displayed with Area on one axis and Property Type on the other, with cell intensity showing signal count
2. GIVEN the heatmap is displayed WHEN Shiun views a high-intensity cell (e.g., Area: Niseko, Property Type: Ski Lodge) THEN the cell shows the signal count and the color saturation reflects the relative intensity
3. GIVEN Shiun selects different dimensions from dropdown menus WHEN he changes axes to "Area x Use Case" THEN the heatmap re-renders with Area on one axis and Use Case on the other
4. GIVEN dimension options are available WHEN Shiun views the dropdowns THEN available dimensions include: Area, Property Type, Use Case, Design Style, and Price Range
5. GIVEN the heatmap is rendered WHEN Shiun hovers over a cell THEN a tooltip displays the exact count, both dimension values, and the percentage of total signals
6. GIVEN the heatmap is displayed WHEN Shiun applies a date range filter THEN the heatmap recalculates and re-renders with the filtered data
7. GIVEN the heatmap has more than 10 items on an axis WHEN the chart renders THEN the heatmap is scrollable or zoomable to accommodate all labels without overlap

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-09: CSV Export of Any Data View
**As a** Kaz/Shiun (Go&C Admin)
**I want to** export the underlying data of any chart or data view as a CSV file
**So that** I can perform further analysis in Excel or Google Sheets and share raw data with stakeholders

**Acceptance Criteria:**
1. GIVEN Shiun is viewing the Area Demand line chart WHEN he clicks the "Export CSV" button THEN a CSV file is downloaded containing columns: date, area, view_count, save_count, total_signals
2. GIVEN Shiun is viewing the Use Case donut chart WHEN he clicks "Export CSV" THEN a CSV is downloaded with columns: use_case, signal_count, percentage
3. GIVEN Shiun is viewing the Cross-Tab heatmap (Area x Use Case) WHEN he clicks "Export CSV" THEN a CSV is downloaded with columns: area, use_case, signal_count
4. GIVEN a date range filter is applied WHEN Shiun exports CSV THEN the exported data reflects only the filtered date range, and the filename includes the date range (e.g., "area_demand_2026-01-01_2026-01-31.csv")
5. GIVEN the exported CSV is opened in Excel WHEN Shiun reviews the data THEN all values are correctly formatted (numbers as numbers, dates as ISO dates, no encoding issues with Japanese characters)
6. GIVEN any dashboard view is displayed WHEN Shiun looks for the export option THEN every chart and data table includes a visible "Export CSV" button in the upper-right corner of the component

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-10: PDF Export of Charts
**As a** Kaz/Shiun (Go&C Admin)
**I want to** export dashboard charts as PDF documents
**So that** I can include visualizations in reports and presentations for Go&C leadership and partners

**Acceptance Criteria:**
1. GIVEN Shiun is viewing the Area Demand line chart WHEN he clicks "Export PDF" THEN a PDF file is generated containing the chart image, title, date range, and a data summary table below the chart
2. GIVEN Shiun is viewing the Cross-Tab heatmap WHEN he clicks "Export PDF" THEN the PDF renders the heatmap at print-quality resolution with legible axis labels and a color legend
3. GIVEN a date range filter is active WHEN Shiun exports a PDF THEN the PDF header includes the selected date range and the platform name "Japanoma"
4. GIVEN Shiun exports a PDF WHEN the PDF is generated THEN it uses A4 landscape orientation for charts and includes the export timestamp in the footer
5. GIVEN the chart contains many data points WHEN the PDF is generated THEN the chart scales appropriately to fit the page without truncating labels or data points

**Priority:** Should Have
**Feature:** F5
**Phase:** Core Development

---

### US-11: Date Range Filtering Across All Views
**As a** Kaz/Shiun (Go&C Admin)
**I want to** apply a consistent date range filter that persists across all dashboard views
**So that** I can analyze a specific time period without re-selecting the range on every page

**Acceptance Criteria:**
1. GIVEN Shiun is on the dashboard WHEN he views the date range selector THEN preset options are available: Today, Last 7 Days, Last 30 Days, Last 90 Days, Year to Date, and Custom Range
2. GIVEN Shiun selects "Last 30 Days" on the overview page WHEN he navigates to the Area Demand chart THEN the date range remains set to "Last 30 Days"
3. GIVEN Shiun selects a custom range (2026-01-15 to 2026-02-15) WHEN the range is applied THEN all charts, metrics, and data tables across the dashboard reflect only data within that range
4. GIVEN Shiun changes the date range WHEN the change is applied THEN all visible components re-fetch data and update within 2 seconds
5. GIVEN Shiun refreshes the browser WHEN the dashboard reloads THEN the date range resets to the default (Last 30 Days) unless a URL parameter preserves the selection
6. GIVEN Shiun selects a date range with no data WHEN the filter is applied THEN all charts show empty states with a message: "No data available for the selected period"

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development

---

### US-12: Dashboard Loading Performance
**As a** Kaz/Shiun (Go&C Admin)
**I want to** have the dashboard load quickly even with large datasets
**So that** I can use the analytics tool efficiently without waiting for slow queries

**Acceptance Criteria:**
1. GIVEN the dashboard overview page is requested WHEN the page loads THEN the initial render (summary cards and sparkline) completes within 2 seconds
2. GIVEN the Area Demand line chart is requested for the last 90 days across all areas WHEN the chart renders THEN the data fetch and render completes within 3 seconds
3. GIVEN the Cross-Tab heatmap is requested with Area x Use Case (12 areas, 5 use cases = 60 cells) WHEN the chart renders THEN it loads within 2 seconds
4. GIVEN all dashboard data is queried WHEN the queries execute THEN they read from the pre-aggregated `daily_metrics` table rather than scanning raw events
5. GIVEN the dashboard is loaded WHEN individual chart components load THEN each chart shows a loading skeleton or spinner while data is being fetched, so the page feels responsive
6. GIVEN the dashboard handles 6+ months of aggregated data WHEN any chart is rendered THEN the performance remains within the specified thresholds (no query exceeds 3 seconds)
7. GIVEN Shiun navigates between dashboard views WHEN client-side navigation occurs THEN previously fetched data is cached and re-used if the date range has not changed

**Priority:** Should Have
**Feature:** F5
**Phase:** QA + Launch

---

### US-13: Dashboard Access Control
**As a** Kaz/Shiun (Go&C Admin)
**I want to** ensure the admin dashboard is accessible only to authorized Go&C team members
**So that** sensitive buyer insight data is not exposed to unauthorized users or the public

**Acceptance Criteria:**
1. GIVEN an unauthenticated user navigates to `/admin/dashboard` WHEN the page is requested THEN they are redirected to the admin login page
2. GIVEN a registered user without admin privileges attempts to access the dashboard WHEN the authorization check fails THEN a 403 Forbidden page is displayed: "You do not have permission to access this page"
3. GIVEN Shiun logs in with admin credentials WHEN the authentication succeeds THEN the dashboard loads normally with full access to all views and export functions
4. GIVEN an admin session has been idle for 60 minutes WHEN Shiun interacts with the dashboard THEN he is prompted to re-authenticate before proceeding
5. GIVEN admin access logs are maintained WHEN Shiun logs in or performs an export THEN the action is logged with timestamp, admin user ID, and action type for audit purposes

**Priority:** Must Have
**Feature:** F5
**Phase:** Core Development
