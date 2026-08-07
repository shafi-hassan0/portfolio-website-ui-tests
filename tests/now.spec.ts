import { test, expect } from '@playwright/test';
import { expectSliderNavigatesAndImagesRender } from './slider-page';

interface NowUpdate {
  currentlyLearning: string[];
  currentlyBuilding: string[];
  recentlyCompleted: string[];
}

test('now page reflects the latest update from the API', async ({ page }) => {
  const response = await page.request.get('/api/now');
  expect(response.ok()).toBe(true);
  const { data } = (await response.json()) as { data: NowUpdate };

  await page.goto('/now');

  // The Now page always shows exactly 3 fixed slides — the check here is that
  // each slide's body matches the corresponding API list, not a count/title
  // match like the other slider pages. allTextContents() doesn't auto-wait,
  // so wait for the cards to actually render first (async fetch + Angular
  // render happens after goto() resolves) or this reads an empty DOM.
  const cardBodies = page.locator('mat-card-content p');
  await expect(cardBodies).toHaveCount(3);
  const descriptions = (await cardBodies.allTextContents()).map((d) => d.trim());

  expect(descriptions).toContain(data.currentlyLearning.join('\n'));
  expect(descriptions).toContain(data.currentlyBuilding.join('\n'));
  expect(descriptions).toContain(data.recentlyCompleted.join('\n'));
});

test('now slider navigates through its 3 fixed slides', async ({ page }) => {
  await expectSliderNavigatesAndImagesRender(page, '/now');
});
