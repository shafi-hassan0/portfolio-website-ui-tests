import { test, expect } from '@playwright/test';

const NAV_LINKS = [
  { path: '/experience', label: 'Experience' },
  { path: '/skills', label: 'Skills' },
  { path: '/certifications', label: 'Certifications' },
  { path: '/education', label: 'Education' },
  { path: '/projects', label: 'Projects' },
  { path: '/about', label: 'About' },
  { path: '/now', label: 'Now' },
  { path: '/playground', label: 'Playground' },
  { path: '/resume', label: 'Resume' },
  { path: '/contact', label: 'Contact' },
];

test.describe('primary navigation', () => {
  for (const link of NAV_LINKS) {
    test(`navigates to ${link.path} via the nav bar`, async ({ page, isMobile }) => {
      // Below the lg breakpoint, links sit behind the hamburger toggle rather
      // than being directly clickable — that flow is covered separately by
      // "mobile menu toggles and navigates" below.
      test.skip(isMobile, 'nav links are collapsed behind the mobile menu toggle');

      // The nav bar is deliberately hidden on the exact home route (app.html's
      // @if (!isHomeRoute())), since home has its own room-scene navigation
      // instead — so these tests need to start from any other route.
      await page.goto('/about');
      await page.getByRole('link', { name: link.label, exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`${link.path}$`));
    });
  }

  test('logo link returns to the home page', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: "Shafi's Personal Portfolio" }).click();
    await expect(page).toHaveURL('/');
  });

  test('mobile menu toggles and navigates', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile nav toggle only renders below the lg breakpoint');

    // Same as above — the mobile toggle lives in the nav bar, which is hidden
    // on the exact home route.
    await page.goto('/about');
    await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
    await page.getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL('/contact');
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
