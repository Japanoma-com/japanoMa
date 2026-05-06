# ADR-007: UI Components — shadcn/ui + Tailwind CSS

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Japanoma needs a UI component library that serves two distinct interfaces:

1. **Public site** — Content-focused, educational tone (per Shiun's vision: "no hard selling"), property photography emphasis, Japan aesthetic with clean typography and generous whitespace. Must feel trustworthy and professional to Australian investors considering significant financial decisions.

2. **Admin dashboard** — Data-dense, functional interface with charts, tables, filters, date pickers, and export controls. Kaz and Shiun need to navigate analytics views efficiently.

With no dedicated designer on the team (Obi handles design decisions, Sara handles QA), the component library must provide strong defaults that look professional without extensive custom design work. The 13-week timeline leaves no room for building a design system from scratch.

## Options Considered

### Option A: shadcn/ui + Tailwind CSS
**Pros:**
- Components are copied into the project (not an npm dependency); full ownership and customization
- Built on Radix UI primitives (accessible, keyboard-navigable, ARIA-compliant)
- Tailwind CSS integration means components use the same utility classes as the rest of the project
- Excellent default styling with a clean, modern aesthetic
- Theme customization via CSS variables (colors, radii, spacing)
- Comprehensive component set: Dialog, Dropdown, Tabs, Accordion, Toast, DataTable, DatePicker, Command palette
- Active community with constant additions (Charts component wrapping Recharts)
- No version conflicts or breaking changes from library updates (code lives in project)
- Works perfectly with both Server Components (static parts) and Client Components (interactive parts)

**Cons:**
- Must manually add each component needed (not auto-included)
- No pre-built layout templates; must compose layouts from primitives
- Customization requires Tailwind CSS knowledge (team has this)

**Cost:** Free (MIT license).

### Option B: Radix UI + Custom Styling
**Pros:**
- Maximum design flexibility; no pre-determined visual style
- Same accessibility primitives as shadcn/ui (shadcn/ui is built on Radix)
- Minimal bundle size (only primitives, no styling overhead)

**Cons:**
- Must design and style every component from scratch
- Significantly more development time for the same component coverage
- Without a designer, custom styling risks inconsistency
- No pre-built complex components (DataTable, DateRangePicker)

**Cost:** Free (MIT license).

### Option C: Chakra UI
**Pros:**
- Full component library with built-in styling
- Dark mode support out of the box
- Good documentation and large community

**Cons:**
- Runtime CSS-in-JS (Emotion) conflicts with React Server Components
- Bundle size is significantly larger (~40KB+ for the core)
- Styling system is different from Tailwind CSS (would need to choose one or mix approaches)
- Less customizable than shadcn/ui; components have a recognizable "Chakra" look

**Cost:** Free (MIT license).

### Option D: Mantine
**Pros:**
- Comprehensive component library with excellent TypeScript support
- Built-in hooks library for common patterns
- Good form integration and data display components

**Cons:**
- Large dependency footprint
- Styling system (CSS Modules + PostCSS) would conflict with Tailwind CSS approach
- Learning curve for Mantine-specific patterns
- Server Component compatibility requires careful configuration

**Cost:** Free (MIT license).

## Decision

**shadcn/ui with Tailwind CSS.**

## Justification

shadcn/ui is the ideal choice for Japanoma for four reasons:

1. **Professional defaults without a designer.** shadcn/ui's default theme provides a clean, neutral aesthetic that suits both the public content site and the admin dashboard. For the public site, the theme can be warmed slightly (softer grays, warmer whites) to evoke the educational, trustworthy tone Shiun's vision calls for. For the admin dashboard, the default data-dense components (DataTable, Charts, Tabs) work out of the box.

2. **Accessibility is built in.** Radix UI primitives ensure keyboard navigation, screen reader compatibility, and ARIA attributes across all interactive components. This addresses WCAG 2.1 AA requirements without additional development effort.

3. **Component ownership.** Components live in the project at `src/components/ui/`. When a Japan-specific customization is needed (e.g., a currency display component showing both ¥ and A$, or a prefecture selector with Japanese names), the component can be modified directly without fighting a library's API.

4. **Tailwind CSS alignment.** The entire project uses Tailwind CSS (see ADR-001). shadcn/ui components use the same utility classes, ensuring visual consistency. There is no context-switching between styling approaches.

Key components for Japanoma:
- **Public site:** Card, Carousel (property images), Accordion (FAQ), Tabs (area info), Badge (taxonomy tags), Dialog (save confirmation), Toast (action feedback)
- **Admin dashboard:** DataTable (analytics), DateRangePicker (filtering), Select (dimension chooser), Tabs (dashboard views), Chart (via shadcn/ui Charts wrapping Recharts)
- **Forms:** Input, Textarea, Select, Checkbox (consent), RadioGroup (quiz options), Button

## Consequences

**Positive:**
- Consistent, professional UI across public site and admin dashboard
- Accessible by default (keyboard, screen reader, ARIA)
- Full control over component code; no library version dependency
- Tailwind CSS theming enables Japan-inspired aesthetic customization
- shadcn/ui Charts component simplifies Recharts integration for admin dashboard

**Negative/Trade-offs:**
- Must manually add each component via `npx shadcn@latest add <component>` (minor overhead)
- No pre-built page templates; must compose layouts manually
- Component updates from shadcn/ui upstream require manual diffing (rare and optional)

**Risks:**
- Design consistency depends on disciplined use of design tokens (CSS variables). Sara's QA role includes visual consistency checks during sprint reviews.
- The "no designer" constraint means some visual polish may be deferred to QA + Launch phase (acceptable per phase plan)
