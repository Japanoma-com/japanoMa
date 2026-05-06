# Accessibility — known findings backlog

Scope-boundaries non-functional.md targets **WCAG 2.1 Level AA** across all
shipped routes. The Playwright axe suite (`e2e/a11y.spec.ts`) fails only on
CRITICAL issues today; everything below is tracked here for design-system
review.

Last swept: 2026-04-23 against `main`.

## Serious — requires design-system decisions

### Color contrast on `stone-on-shoji` small text — PARTIALLY RESOLVED

**Update 2026-04-23:** Option A applied — `--stone` darkened from
`#8A8279` (3.6:1) to `#6A645C` (≈4.7:1 on shoji, 4.5:1 on washi).
Color-contrast violations cleared on Privacy, Terms, Quiz. Remaining
flags on Home / Content hub / Areas index / Contact come from other
muted elements (likely `--ash` at `#C4BDB4` used on placeholder /
meta text, which is still below AA). Next step: audit and darken
`--ash` or restrict its use to decorative surfaces only.

**Routes affected:** Home, Content hub, Areas index, Contact (as of
2026-04-23). Repeats on every page via the overline/caption style.

**axe rule:** `color-contrast` (WCAG 1.4.3 AA — minimum 4.5:1 for body,
3:1 for large text ≥18pt or 14pt bold).

**Specifics:**

| Token        | Value     | Contrast on `--washi` (#F5F0E8) | Contrast on `--shoji` (#FAFAF7) |
|--------------|-----------|---------------------------------|---------------------------------|
| `--stone`    | `#8A8279` | 3.58 : 1                        | 3.61 : 1                        |
| `--ash`      | `#C4BDB4` | 1.81 : 1                        | 1.82 : 1                        |

Both fall short of AA for small text (the 10px overline and 11–13px captions
that use them). The overline spec in `typography.css` is 10px bold, which
never qualifies as "large text" — it needs a 4.5:1 foreground.

**Options for the fix, all design-system-level:**

1. **Darken `--stone` to ~`#6A645C`** (≈ 4.7 : 1 on `--shoji`). Smallest
   visual change; preserves the muted-caption intent.
2. **Swap overlines + captions to `--sumi-light`** (`#3D3833`). Higher
   contrast (~10 : 1), looks slightly more emphatic than today.
3. **Enlarge the overline scale** to 14px bold (qualifies as "large text",
   3 : 1 suffices). Breaks the editorial typography but perfectly legible.

Pick one, update `src/styles/tokens.css` / `typography.css`, remove this
entry once axe stops flagging it on all routes.

## Serious — component bugs

### List semantics — `<ul>` with non-`<li>` children / orphan `<li>`

**Routes affected:** `/`, `/changelog`, possibly others rendering editorial
components.

**axe rules:** `list` + `listitem`.

**Cause (most likely):** A `<ul>` wrapper is rendered with `<ScrollReveal>`
or `<div>` children interleaved, so the direct children of the list are
not `<li>` elements. Alternately, a styled card pattern uses `<li>` outside
any list container to inherit list styling.

**Fix pattern:** audit the first two dozen selectors axe reports (all live
under `.scroll-reveal`, `.items-baseline`, `.grid-cols-[...]`). Either:

- Wrap the `<li>` children in a `<ul role="list">`, OR
- Change the `<li>` elements to `<div>` if they're not genuinely a list.

Not usually a big job — it's a rendering mistake, not a design decision.

### `<select>` missing accessible name

**Routes affected:** `/content`.

**axe rule:** `select-name` (CRITICAL when present).

**Status:** FIXED in `src/components/content/filter-bar.tsx` — each filter
`<select>` now has an `aria-label={"Filter by …"}`.

## Notes on the baseline

- `@axe-core/playwright` runs against the DOM served by `next dev`. The
  report will slightly change under `next start` (production build) —
  always run the suite against the mode you care about.
- The a11y spec is fully green for CRITICAL today. As serious findings get
  resolved, tighten `e2e/a11y.spec.ts` to also fail on `serious`.
