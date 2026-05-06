# ADR-009: Charting Library — Recharts

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

The admin dashboard is one of two core deliverables (alongside the public site). It provides Go&C Partners with buyer intent insights through seven chart views:

1. **Area demand line chart** — Time series of views + saves by area over configurable date range
2. **Use case distribution pie/donut chart** — Breakdown of buyer intentions
3. **Design style preferences bar chart** — Style popularity from quiz results
4. **Price range histogram** — Budget distribution across brackets
5. **Renovation feature ranking bar chart** — Feature popularity
6. **Cross-tabulation heatmap** — Area × Property Type (or any two taxonomy dimensions)
7. **Overview sparklines** — Key metrics with trend indicators on the dashboard home

The charting library must render these seven views with responsive behavior, consistent styling aligned with the shadcn/ui design system, and acceptable performance on Kaz and Shiun's devices.

## Options Considered

### Option A: Recharts
**Pros:**
- Built on React and D3; renders as SVG (crisp at any resolution)
- Declarative API with React components (`<LineChart>`, `<PieChart>`, `<BarChart>`)
- Built-in responsive container (`<ResponsiveContainer>`)
- Customizable tooltips and legends via React component override
- shadcn/ui Charts component is built on Recharts (direct integration)
- Active maintenance with 24K+ GitHub stars
- Sufficient chart types for all seven dashboard views
- Good TypeScript support
- Reasonable bundle size (~60KB for commonly used charts)

**Cons:**
- Limited to standard chart types; exotic visualizations (network graphs, Sankey diagrams) not supported
- Heatmap is not a built-in chart type; must be composed from custom rectangles or cells
- Performance can degrade with 1000+ data points on a single chart (mitigated by aggregated data)
- Less customizable than D3 for pixel-perfect control

**Cost:** Free (MIT license).

### Option B: Chart.js (via react-chartjs-2)
**Pros:**
- Canvas-based rendering (performant for large datasets)
- Wide variety of built-in chart types
- Mature library with large community
- Smaller bundle than Recharts for equivalent functionality

**Cons:**
- Canvas rendering produces blurry charts on high-DPI displays without explicit scaling
- React integration via react-chartjs-2 is a wrapper, not native React components
- Imperative configuration style (`options` object) conflicts with declarative React patterns
- No direct shadcn/ui integration
- Tooltip and legend customization requires more boilerplate

**Cost:** Free (MIT license).

### Option C: D3.js (Direct)
**Pros:**
- Maximum flexibility; any visualization is possible
- Industry standard for data visualization
- SVG-based; crisp on all displays
- Best choice for the cross-tabulation heatmap

**Cons:**
- Imperative DOM manipulation conflicts with React's declarative model
- Steep learning curve; significant development time for each chart
- Must build responsive behavior, tooltips, legends, and interactions from scratch
- No pre-built React components; must wrap D3 logic in useEffect hooks
- Estimated 3 to 5 days additional development per chart type vs Recharts

**Cost:** Free (BSD license).

### Option D: Nivo
**Pros:**
- Built on D3 with React-native components
- Excellent built-in heatmap component (directly solves cross-tabulation view)
- Beautiful default themes with rich animation
- Server-side rendering support

**Cons:**
- Larger bundle size than Recharts (~100KB+ for commonly used charts)
- Less widely adopted; smaller community means fewer examples
- Opinionated styling may conflict with shadcn/ui theme
- Some chart types have limited customization options

**Cost:** Free (MIT license).

## Decision

**Recharts as the primary charting library.**

## Justification

Recharts is the right choice for Japanoma's admin dashboard because:

1. **shadcn/ui integration.** The shadcn/ui Charts component is built on top of Recharts. Using Recharts directly means charts automatically inherit the project's color palette, typography, and spacing through CSS variables. The dashboard charts look native to the rest of the admin UI without custom theming work.

2. **Declarative React API.** Charts are composed from React components, matching the rest of the codebase:

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={areaDemandData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip content={<CustomTooltip />} />
    <Line dataKey="views" stroke="var(--chart-1)" />
    <Line dataKey="saves" stroke="var(--chart-2)" />
  </LineChart>
</ResponsiveContainer>
```

This is readable, maintainable, and testable with standard React patterns.

3. **Coverage of 6 of 7 chart types.** Recharts natively supports line charts (area demand), pie/donut charts (use case distribution), bar charts (design preferences, renovation features, price range), and composed charts (sparklines). The cross-tabulation heatmap requires a custom approach using Recharts' `<ScatterChart>` with custom cell shapes, or a lightweight custom SVG component.

4. **Performance is adequate for aggregated data.** Dashboard charts display daily/weekly/monthly aggregated data, typically 30 to 365 data points per chart. Recharts handles this volume comfortably. Raw event data is never rendered directly in charts.

5. **Team velocity.** Recharts' declarative API means each chart view can be built in 2 to 4 hours, fitting the admin dashboard development within the Phase 2 (Core Development) timeline.

**Heatmap solution:** For the cross-tabulation view (e.g., 10 areas × 6 property types = 60 cells), a custom SVG grid component using Tailwind CSS colors is simpler and more maintainable than pulling in a second charting library. The grid maps each cell's intensity to a color scale derived from the shadcn/ui palette.

## Consequences

**Positive:**
- Consistent visual language between charts and the rest of the admin UI via shadcn/ui theme
- Fast development cycle for standard chart types (line, bar, pie)
- Responsive by default with `<ResponsiveContainer>`
- Custom tooltips enable showing taxonomy-specific context (area name, count, percentage)

**Negative/Trade-offs:**
- Cross-tabulation heatmap requires custom implementation (estimated 4 to 6 hours)
- Chart animations on initial render add minor performance overhead (can be disabled for dashboard)
- Recharts bundle (~60KB) is included in the admin dashboard bundle (not loaded on public pages)

**Risks:**
- If future dashboard requirements include exotic chart types (Sankey, network graph, geographic heatmap), a second library may be needed (acceptable as post-launch scope)
- SVG rendering of charts with many data series (10+ areas on one line chart) may cause readability issues (mitigated by defaulting to top 5 areas with an "other" category)

---

*Cross-references: [ADR-005](005-analytics-tracking.md) (Data pipeline feeding dashboard charts), [ADR-007](007-ui-components.md) (shadcn/ui chart integration), [User Stories: Admin Dashboard](../user-stories/admin-dashboard.md) (7 chart views), [Data Model](../architecture/data-model.md) (Aggregation tables queried by dashboard)*
