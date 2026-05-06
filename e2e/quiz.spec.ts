import { test, expect } from '@playwright/test';

test.describe('Lifestyle quiz', () => {
  test('quiz page loads with a visible question prompt', async ({ page }) => {
    await page.goto('/quiz');

    // The quiz page should render a question heading and at least one
    // selectable answer. We don't walk the whole flow here — the scoring
    // and navigation logic is covered in Jest unit tests
    // (src/app/quiz/actions.test.ts, src/lib/quiz/scoring.test.ts).
    // This is a smoke test that the route boots without error.
    await page.waitForLoadState('networkidle');
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('quiz results route renders for a direct visit', async ({ page }) => {
    // Even without having taken the quiz, the /quiz/results route should
    // not 500 — it gracefully handles empty state.
    const response = await page.goto('/quiz/results');
    expect(response?.status()).toBeLessThan(500);
  });
});
