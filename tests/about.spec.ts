import { test, expect } from '@playwright/test';

interface StoryChapter {
  title: string;
  content: string;
}

test('about page shows every chapter title and its content', async ({ page }) => {
  const response = await page.request.get('/api/story-chapters');
  expect(response.ok()).toBe(true);
  const { data } = (await response.json()) as { data: StoryChapter[] };

  await page.goto('/about');

  // The timeline only renders after the cover book is "opened" — a ~2.2s
  // animation gate — so give the count assertion enough headroom to wait
  // through that rather than a fixed sleep.
  await page.getByRole('button', { name: 'My Journey in Tech' }).click();

  const timeline = page.locator('.timeline');
  const timelineTitles = timeline.locator('.timeline-title');
  await expect(timelineTitles).toHaveCount(data.length, { timeout: 5_000 });

  const book = page.locator('.page-text');

  for (const chapter of data) {
    // Scoped to .timeline specifically — the currently-active chapter's title
    // also appears in the book's own <h2>, so an unscoped exact-text lookup
    // would be ambiguous once that chapter is showing.
    await timeline.getByText(chapter.title, { exact: true }).click();

    await expect(book.locator('h2')).toHaveText(chapter.title);

    // The component renders one <p> per '\n\n'-separated paragraph, in order —
    // mirror that split here rather than just checking the content is present
    // somewhere, so this also catches a paragraph rendering out of order.
    const expectedParagraphs = chapter.content.split('\n\n').map((p) => p.trim());
    const renderedParagraphs = (await book.locator('p').allTextContents()).map((p) => p.trim());
    expect(renderedParagraphs).toEqual(expectedParagraphs);
  }
});
