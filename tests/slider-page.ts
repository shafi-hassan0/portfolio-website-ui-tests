import { expect, type Page } from '@playwright/test';

/**
 * Confirms a slider-based list page (Projects, Certifications, Education,
 * Experience) renders exactly the items the API returns, by comparing card
 * titles against the API response rather than hardcoding expected content —
 * so this stays correct as the real portfolio data changes over time.
 */
export async function expectSliderMatchesApi<T>(
  page: Page,
  apiPath: string,
  pagePath: string,
  titleOf: (item: T) => string,
): Promise<void> {
  const response = await page.request.get(apiPath);
  expect(response.ok()).toBe(true);
  const { data } = (await response.json()) as { data: T[] };

  await page.goto(pagePath);

  const renderedTitles = page.locator('mat-card-title');
  await expect(renderedTitles).toHaveCount(data.length);

  const normalized = (await renderedTitles.allTextContents()).map((t) => t.trim());
  for (const item of data) {
    expect(normalized).toContain(titleOf(item));
  }
}

/**
 * Confirms every image inside a slider actually loaded (not a broken src),
 * and that the Previous/Next buttons and dots correctly step through every
 * slide in order, disabling at each end. Works for any page using
 * <app-slider>, including ones with zero images (e.g. Now) — the image
 * check loop is just a no-op there.
 */
export async function expectSliderNavigatesAndImagesRender(
  page: Page,
  pagePath: string,
): Promise<void> {
  await page.goto(pagePath);

  const images = page.locator('.slides-container img');
  const imageCount = await images.count();
  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i);
    await expect(img).toHaveJSProperty('complete', true);
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  }

  const slideCount = await page.locator('.slides-container .slide').count();
  if (slideCount <= 1) return;

  const nextBtn = page.getByRole('button', { name: 'Next' });
  const prevBtn = page.getByRole('button', { name: 'Previous' });
  const dots = page.locator('.dot');

  await expect(prevBtn).toBeDisabled();
  await expect(dots.nth(0)).toHaveClass(/active/);

  for (let i = 1; i < slideCount; i++) {
    await nextBtn.click();
    await expect(dots.nth(i)).toHaveClass(/active/);
  }
  await expect(nextBtn).toBeDisabled();

  for (let i = slideCount - 2; i >= 0; i--) {
    await prevBtn.click();
    await expect(dots.nth(i)).toHaveClass(/active/);
  }
  await expect(prevBtn).toBeDisabled();
}
