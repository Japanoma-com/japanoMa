import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility smoke tests — runs axe-core against each key route and
 * fails on CRITICAL violations. `serious` and below are surfaced as
 * warnings in the report but don't block CI while the design system is
 * iterated on — see docs/a11y/known-findings.md for the current
 * backlog (color contrast on stone-on-shoji small text, a few list
 * semantic issues in editorial components).
 *
 * Scope-boundaries non-functional.md requires WCAG 2.1 AA; the long
 * game is to get every rule to pass, not just critical.
 */

const ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/content', label: 'Content hub' },
  { path: '/areas', label: 'Areas index' },
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/contact', label: 'Contact' },
  { path: '/quiz', label: 'Quiz' },
];

for (const { path, label } of ROUTES) {
  test(`${label} (${path}) — no critical axe violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');

    // Log serious findings for visibility without failing.
    if (serious.length > 0) {
      console.log(
        `\n[a11y] ${label} has ${serious.length} SERIOUS findings (non-blocking):\n` +
          serious.map((v) => `  - ${v.id}: ${v.help}`).join('\n')
      );
    }

    expect(critical, formatCritical(critical)).toEqual([]);
  });
}

function formatCritical(
  violations: Array<{ id: string; help: string; nodes: Array<{ target: unknown[] }> }>
): string {
  if (violations.length === 0) return 'No critical violations.';
  return (
    `\n\n${violations.length} CRITICAL a11y issues — fix before merging:\n\n` +
    violations
      .map(
        (v, i) =>
          `#${i + 1} ${v.id}: ${v.help}\n` +
          v.nodes.map((n) => `   ${JSON.stringify(n.target)}`).join('\n')
      )
      .join('\n\n')
  );
}
