import { test, expect } from '@playwright/test';

/**
 * Admin gate is enforced at the layout level via `notFound()`, which
 * renders the not-found UI. In Next.js dev the HTTP status is 200 even
 * when notFound() is called from a layout — see the note in
 * src/middleware.ts. The security property we care about is that none
 * of the admin-only UI leaks into the HTML for anonymous visitors, so
 * we assert on DOM content, not status.
 *
 * The /api/admin/export/leads route is a separate story: it's a route
 * handler that returns a real 404 Response, so we assert status there.
 */

test.describe('Admin access control', () => {
  test('anonymous visitor cannot see the admin header on /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('Japanoma · Admin')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^leads$/i })).toHaveCount(0);
  });

  test('anonymous visitor cannot see admin content on any sub-route', async ({ page }) => {
    const routes = [
      '/admin/leads',
      '/admin/content',
      '/admin/quiz',
      '/admin/timeline',
      '/admin/areas',
      '/admin/taxonomy',
      '/admin/traffic',
    ];
    for (const route of routes) {
      await page.goto(route);
      await expect(
        page.getByText('Japanoma · Admin'),
        `${route} leaked admin header`
      ).toHaveCount(0);
    }
  });

  test('anonymous visitor gets 404 on leads export endpoint', async ({ request }) => {
    const response = await request.get('/api/admin/export/leads');
    expect(response.status()).toBe(404);
  });
});
