import { test, expect } from '@playwright/test';
import { PAGES } from './pages';

test.describe('home page', () => {
  test('loads with the page title and heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle("Shafi's Portfolio");
    await expect(page.getByRole('heading', { name: "Shafi's Portfolio" })).toBeVisible();
  });

  test.describe('desktop room scene furniture links route correctly', () => {
    for (const item of PAGES) {
      test(`routes to ${item.path}`, async ({ page, isMobile }) => {
        test.skip(isMobile, 'the isometric room scene is desktop-only (md:flex)');

        await page.goto('/');
        // routerlink (lowercase) fails to match in WebKit: SVG attributes are
        // case-sensitive per XML rules, so Angular's routerLink stays camelCase
        // there. href matches both the desktop furniture link and the (CSS-hidden
        // but still-present) mobile grid link, so .first() picks the desktop one.
        await page.locator(`a[href="${item.path}"]`).first().click();
        await expect(page).toHaveURL(item.path);
      });
    }
  });

  test.describe('mobile icon grid links route correctly', () => {
    for (const item of PAGES) {
      test(`routes to ${item.path}`, async ({ page, isMobile }) => {
        test.skip(!isMobile, 'the icon grid is mobile-only (md:hidden)');

        await page.goto('/');
        await page.getByRole('link', { name: item.label, exact: true }).click();
        await expect(page).toHaveURL(item.path);
      });
    }
  });
});
