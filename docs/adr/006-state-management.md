# ADR-006: State Management — TanStack Query + Zustand + nuqs

**Status:** Accepted
**Date:** 2026-02-27
**Decision Makers:** Obi (Technical Lead), Sara (PM)

## Context

Japanoma has three distinct state categories that require different management patterns:

1. **Server state** — Content from Sanity CMS, taxonomy data, user saves, admin analytics data. This data originates on the server and needs caching, background refetching, and optimistic updates.

2. **Client state** — Quiz progress (current question, selected answers), comparison tool selection (up to 3 items), sidebar/modal visibility, form state. This data is ephemeral and UI-specific.

3. **URL state** — Taxonomy filters on content listing pages (area, property type, use case, price range), date range on admin dashboard, sort order, pagination. This state must be shareable via URL and preserved on browser navigation.

The architecture uses React Server Components for content pages (no client state needed) and Client Components for interactive features. State management must work cleanly within this split.

## Options Considered

### Option A: TanStack Query + Zustand + nuqs
**Pros:**
- **TanStack Query** handles all server state: caching, background refetching, optimistic updates, pagination, infinite scroll. Eliminates boilerplate for data fetching in Client Components.
- **Zustand** provides minimal client state stores with no boilerplate, no providers, and direct subscription. Bundle size is ~1KB.
- **nuqs** provides type-safe URL search parameter management that syncs with React state. Perfect for taxonomy filters and dashboard date ranges.
- Each tool does one thing well; no overlap or conflict.
- All three are lightweight; combined bundle impact is ~15KB.
- TanStack Query's `queryClient` can be seeded from Server Components, enabling instant hydration.

**Cons:**
- Three libraries to learn and maintain (though each is simple individually)
- nuqs is less widely known; smaller community than alternatives

**Cost:** All three are free (MIT license).

### Option B: Redux Toolkit + RTK Query
**Pros:**
- Single library for all state management needs
- RTK Query handles data fetching with caching
- Redux DevTools for debugging
- Very large community and ecosystem

**Cons:**
- Significant boilerplate for slices, reducers, and selectors
- Bundle size (~11KB for Redux + RTK Query) is larger than the combined alternative
- Overkill for a project with limited client state needs
- Redux patterns add complexity without proportional benefit for this use case
- URL state still requires a separate solution

**Cost:** Free (MIT license).

### Option C: Jotai / Recoil + TanStack Query
**Pros:**
- Jotai's atomic state model is elegant for fine-grained reactivity
- Works well with Server Components
- TanStack Query handles server state

**Cons:**
- Jotai's atom-based model is less intuitive for structured stores (quiz progress, comparison state)
- No URL state solution included
- Less team familiarity than Zustand

**Cost:** Free (MIT license).

## Decision

**TanStack Query for server state + Zustand for client state + nuqs for URL state.**

## Justification

Each tool maps directly to a specific Japanoma need:

**TanStack Query** for all data that comes from APIs:
- Content listing with taxonomy filters: cache by filter combination, refetch on filter change
- User saved items: optimistic add/remove with rollback on error
- Admin dashboard data: stale-while-revalidate for responsive dashboard interactions
- Quiz recommendations: fetch on quiz completion, cache result

**Zustand** for UI-only state that does not persist across page loads:
- Quiz progress: `{ currentStep: 2, answers: { climate: 'warm', proximity: 'rural' } }`
- Comparison tool: `{ selectedItems: ['content-id-1', 'content-id-2'] }` (also persisted to localStorage)
- Save/bookmark state for anonymous users: synced to localStorage before registration

**nuqs** for URL-reflected state:
- Content filters: `/content?area=hakuba&useCase=seasonal-living&priceRange=15m-30m`
- Admin dashboard: `/admin/areas?startDate=2026-03-01&endDate=2026-03-31&granularity=week`
- Shareable URLs ensure Kaz can share a specific dashboard view with Shiun via link

This three-layer approach avoids the common pitfall of forcing all state into one tool. Server state (async, cached, shared) behaves differently from client state (synchronous, ephemeral, local) and URL state (serialized, shareable, navigable). Using the right tool for each layer keeps the codebase simple and maintainable.

## Consequences

**Positive:**
- Server state is automatically cached and deduplicated across components
- Optimistic updates for save/bookmark provide instant UI feedback
- URL state enables shareable taxonomy filter combinations and dashboard views
- Combined bundle size (~15KB) is smaller than Redux Toolkit alone
- Each tool's API is small and focused; easy for any future developer to understand

**Negative/Trade-offs:**
- Three dependencies to keep updated (though all are stable and actively maintained)
- Developers must understand which state layer to use for each feature
- nuqs has a smaller community; edge cases may require more investigation

**Risks:**
- TanStack Query cache invalidation must be carefully configured for admin dashboard data (stale data would mislead analytics)
- Zustand localStorage sync for anonymous saves must handle storage quota limits and private browsing mode
- URL state serialization must handle special characters in taxonomy slugs (Japanese romanization)

---

*Cross-references: [ADR-001](001-framework-nextjs-15.md) (RSC/Client Component boundary), [ADR-007](007-ui-components.md) (shadcn/ui component library), [System Overview](../architecture/system-overview.md) (Client architecture and state layer mapping)*
