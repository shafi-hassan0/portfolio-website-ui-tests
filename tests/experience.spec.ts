import { test, expect } from '@playwright/test';
import { expectSliderMatchesApi, expectSliderNavigatesAndImagesRender } from './slider-page';

interface Experience {
  role: string;
  company: string;
  responsibilities: string[];
}

test('experience page shows every entry from the API', async ({ page }) => {
  await expectSliderMatchesApi<Experience>(
    page,
    '/api/experiences',
    '/experience',
    (e) => `${e.role} · ${e.company}`,
  );
});

test('experience slider navigates and every image renders', async ({ page }) => {
  await expectSliderNavigatesAndImagesRender(page, '/experience');
});

test('experience dialog shows the correct responsibilities', async ({ page }) => {
  const response = await page.request.get('/api/experiences');
  expect(response.ok()).toBe(true);
  const { data: experiences } = (await response.json()) as { data: Experience[] };

  await page.goto('/experience');

  const modal = page.locator('.modal-card');

  for (const exp of experiences) {
    const title = `${exp.role} · ${exp.company}`;

    await page.getByText(title, { exact: true }).click();
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-title')).toHaveText(title);

    const modalBody = await modal.locator('.modal-body').innerText();
    if (exp.responsibilities.length > 0) {
      for (const item of exp.responsibilities) {
        expect(modalBody).toContain(item);
      }
    } else {
      expect(modalBody).toContain('No responsibilities listed for this role.');
    }

    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).not.toBeVisible();
  }
});
