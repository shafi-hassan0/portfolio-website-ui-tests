import { test, expect } from '@playwright/test';
import { expectSliderMatchesApi, expectSliderNavigatesAndImagesRender } from './slider-page';

interface Certification {
  name: string;
  credentialUrl?: string;
}

test('certifications page shows every certification from the API', async ({ page }) => {
  await expectSliderMatchesApi<Certification>(
    page,
    '/api/certifications',
    '/certifications',
    (c) => c.name,
  );
});

test('certifications slider navigates and every image renders', async ({ page }) => {
  await expectSliderNavigatesAndImagesRender(page, '/certifications');
});

test('credential links point to a real, reachable URL', async ({ page }) => {
  const response = await page.request.get('/api/certifications');
  expect(response.ok()).toBe(true);
  const { data: certifications } = (await response.json()) as { data: Certification[] };

  await page.goto('/certifications');

  for (const cert of certifications) {
    if (!cert.credentialUrl) continue;

    const card = page.locator('mat-card').filter({
      has: page.getByText(cert.name, { exact: true }),
    });
    const link = card.locator('.card-link');
    await expect(link).toHaveAttribute('href', cert.credentialUrl);

    const linkResponse = await page.request.get(cert.credentialUrl);
    expect(linkResponse.ok()).toBe(true);
  }
});
