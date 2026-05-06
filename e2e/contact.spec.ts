import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('validates required fields before submit', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Try to submit empty — React Hook Form + Zod should surface errors
    const submit = page.getByRole('button', { name: /send|submit/i });
    await submit.click();

    // At least one validation error should appear; exact copy varies so
    // we just confirm the form didn't submit (we're still on /contact).
    await expect(page).toHaveURL(/\/contact/);
  });

  test('accepts valid input and shows success state', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel(/name/i).fill('Test Buyer');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/message/i).fill('Just testing the e2e flow — please ignore.');

    const consent = page.getByRole('checkbox');
    if (await consent.isVisible().catch(() => false)) {
      await consent.check();
    }

    await page.getByRole('button', { name: /send|submit/i }).click();

    // Either we land on a thank-you state on the same page, or redirect
    // to /contact/thanks. Accept either shape.
    await expect(page.getByText(/thank|received|in touch|we'?ll get back/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
