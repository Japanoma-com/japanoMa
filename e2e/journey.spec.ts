import { test, expect } from '@playwright/test';

test.describe('D2L journey — anonymous flow', () => {
  test('header chip renders the empty state on /', async ({ page }) => {
    await page.goto('/');
    // Chip mounts at md+ breakpoint via the header layout
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.reload();

    const chip = page.getByRole('button', { name: /open journey map/i });
    await expect(chip).toBeVisible();
    await expect(chip).toContainText(/Step 1 of 6/);
    await expect(chip).toContainText(/Decide First/);
  });

  test('chip opens the journey sheet with all 6 steps', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    await page.getByRole('button', { name: /open journey map/i }).click();

    // The dialog opens
    await expect(page.getByRole('dialog', { name: /your journey map/i })).toBeVisible();

    // All 6 steps visible
    for (const label of ['Decide First', 'Choose Area', 'Shortlist Homes', 'Check Risks', 'Make Offer', 'Prepare Closing']) {
      await expect(page.getByText(label).first()).toBeVisible();
    }

    // ESC closes
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /your journey map/i })).not.toBeVisible();
  });

  test('Content Hub primary row shows "Showing all steps" for anon', async ({ page }) => {
    await page.goto('/content');
    await expect(page.getByText(/Showing all steps/i)).toBeVisible();
    await expect(page.getByText(/Choose a step/i)).toBeVisible();
  });

  test('phase URL param filters the Content Hub', async ({ page }) => {
    await page.goto('/content?phase=5_due_diligence');
    // Top row shows the chosen phase
    await expect(page.getByText(/Check Risks/i)).toBeVisible();
    // "View all phases" escape link is present
    await expect(page.getByRole('link', { name: /view all phases/i })).toBeVisible();
  });

  test('Compare landing renders the inline stepper', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/compare');
    // No cities selected → landing CTA
    await expect(page.getByRole('heading', { name: /compare areas/i })).toBeVisible();
    // Stepper "Next:" caption visible
    await expect(page.getByText(/Next:/i).first()).toBeVisible();
  });
});
