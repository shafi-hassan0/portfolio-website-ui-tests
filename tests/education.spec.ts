import { test } from '@playwright/test';
import { expectSliderMatchesApi, expectSliderNavigatesAndImagesRender } from './slider-page';

interface Education {
  degree: string;
  field: string;
}

test('education page shows every entry from the API', async ({ page }) => {
  await expectSliderMatchesApi<Education>(
    page,
    '/api/education',
    '/education',
    (e) => `${e.degree} in ${e.field}`,
  );
});

test('education slider navigates and every image renders', async ({ page }) => {
  await expectSliderNavigatesAndImagesRender(page, '/education');
});
