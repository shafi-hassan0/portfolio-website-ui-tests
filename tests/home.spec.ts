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
        // href-based, not label-based: the home page's own item labels (e.g.
        // "About Me") deliberately differ from the shared PAGES labels used
        // elsewhere (e.g. the persistent nav bar's "About"). href matches both
        // the (CSS-hidden but still-present) desktop furniture link and the
        // mobile grid link, so .last() picks the mobile one — mirroring the
        // desktop test's .first() above.
        await page.locator(`a[href="${item.path}"]`).last().click();
        await expect(page).toHaveURL(item.path);
      });
    }
  });
});
