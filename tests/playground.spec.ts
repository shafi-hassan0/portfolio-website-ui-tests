import { test, expect } from '@playwright/test';
import { GAMES } from './games';

test.describe('playground', () => {
  for (const game of GAMES) {
    test(`opens ${game.title}`, async ({ page }) => {
      await page.goto('/playground');

      // Each card's accessible name is icon+title+description concatenated,
      // so an exact match on the button itself won't work — target the
      // title span specifically, which bubbles up to the card's click handler.
      await page.locator('.game-grid').getByText(game.title, { exact: true }).click();

      const modal = page.locator('.modal-card');
      await expect(modal).toBeVisible();
      await expect(modal.locator('.modal-title')).toHaveText(game.title);

      // Confirms the correct game component actually mounted inside the
      // modal, not just that a modal opened.
      await expect(modal.locator(game.selector)).toBeVisible();

      await modal.getByRole('button', { name: 'Close' }).click();
      await expect(modal).not.toBeVisible();
    });
  }
});
