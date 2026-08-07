import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.describe('resume page', () => {
  test('renders the PDF preview', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.getByRole('heading', { name: 'Resume' })).toBeVisible();

    // Playwright can't inspect the rendered PDF content inside the iframe, so
    // confirm the iframe itself is present, then verify the file it points at
    // is actually a real PDF via a direct request.
    await expect(page.locator('iframe[title="Resume preview"]')).toBeVisible();

    const response = await page.request.get('/resume.pdf');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('downloads the resume', async ({ page }) => {
    await page.goto('/resume');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download Resume' }).click();
    const download = await downloadPromise;

    // Browsers aren't fully consistent about honoring the `download` attribute's
    // suggested filename (some fall back to the URL's own filename instead) —
    // the markup itself is correct either way, so just confirm it's a .pdf
    // and lean on the byte check below for the download actually working.
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    const path = await download.path();
    expect(path).not.toBeNull();
    const bytes = readFileSync(path!);
    expect(bytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });
});
