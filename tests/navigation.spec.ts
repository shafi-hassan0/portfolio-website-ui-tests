import { test, expect } from '@playwright/test';
import { PAGES } from './pages';

test.describe('primary navigation', () => {
  test.describe('navigates via the nav bar', () => {
    for (const item of PAGES) {
      test(`routes to ${item.path}`, async ({ page, isMobile }) => {
        // Below the lg breakpoint, links sit behind the hamburger toggle rather
        // than being directly clickable — that flow is covered separately by
        // "mobile menu toggles and navigates" below.
        test.skip(isMobile, 'nav links are collapsed behind the mobile menu toggle');

        // The nav bar is deliberately hidden on the exact home route (app.html's
        // @if (!isHomeRoute())), since home has its own room-scene navigation
        // instead — so these tests need to start from any other route.
        await page.goto('/about');
        await page.getByRole('link', { name: item.label, exact: true }).first().click();
        await expect(page).toHaveURL(new RegExp(`${item.path}$`));
      });
    }
  });

  test('logo link returns to the home page', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: "Shafi's Personal Portfolio" }).click();
    await expect(page).toHaveURL('/');
  });

  test.describe('mobile menu toggles and navigates', () => {
    for (const item of PAGES) {
      test(`routes to ${item.path}`, async ({ page, isMobile }) => {
        test.skip(!isMobile, 'mobile nav toggle only renders below the lg breakpoint');

        // Same as above — the mobile toggle lives in the nav bar, which is hidden
        // on the exact home route.
        await page.goto('/about');
        await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
        await page.getByRole('link', { name: item.label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${item.path}$`));
      });
    }
  });
});

test.describe('unknown routes', () => {
  test('shows the not-found page and can navigate back home', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    await expect(page.getByRole('heading', { name: "This room isn't on the map" })).toBeVisible();
    await expect(page.getByText('/this-page-does-not-exist')).toBeVisible();

    await page.getByRole('link', { name: 'Back to the room' }).click();
    await expect(page).toHaveURL('/');
  });
});
