import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with key hero content', async ({ page }) => {
    await page.goto('/');

    // Title is set from root layout metadata
    await expect(page).toHaveTitle(/Japanoma/i);

    // Hero copy the editorial design leads with
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Primary navigation into the product surfaces
    await expect(page.getByRole('link', { name: /quiz/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /areas/i }).first()).toBeVisible();
  });

  test('footer exposes Privacy and Terms', async ({ page }) => {
    await page.goto('/');

    // Footer is below the fold — scroll to it and assert presence + target.
    // Multiple matches exist on some pages; use .last() to hit the footer copy.
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/privacy'
    );
    await expect(footer.getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/terms'
    );
  });

  test('consent banner shows on first visit', async ({ page, context }) => {
    // Fresh context — no prior consent decision
    await context.clearCookies();
    await page.goto('/');

    const dialog = page.getByRole('dialog', { name: /privacy/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /allow/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /decline/i })).toBeVisible();
  });
});
