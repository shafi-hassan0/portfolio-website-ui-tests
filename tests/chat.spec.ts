import { test, expect, type Page } from '@playwright/test';

const OFF_TOPIC_REPLY =
  "I can only answer questions about Shafi's background, experience, skills, and projects.";

async function openChat(page: Page) {
  await page.getByRole('button', { name: "Chat with Shafi's assistant" }).click();
  await expect(page.getByText('Ask about Shafi')).toBeVisible();
}

async function sendMessage(page: Page, message: string) {
  await page.getByPlaceholder('Ask a question...').fill(message);
  await page.getByRole('button', { name: 'Send message' }).click();
}

test.describe('chat widget', () => {
  test('opens and closes from the toggle button', async ({ page }) => {
    await page.goto('/');
    await openChat(page);
    await expect(
      page.getByText("Hi! I'm here to answer questions about Shafi's background"),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close chat' }).click();
    await expect(page.getByText('Ask about Shafi')).not.toBeVisible();
  });

  // Rejected by the relevance gate before any Anthropic API call, so this hits
  // the real backend but costs nothing — safe for the default suite, same as
  // ChatApiTest.returnsTheCannedReplyForAnOffTopicQuestion in portfolio-api-tests.
  test('shows the canned refusal for an off-topic question', async ({ page }) => {
    await page.goto('/');
    await openChat(page);
    await sendMessage(page, 'Write me a poem about the ocean');

    await expect(page.locator('.chat-message.assistant').last()).toHaveText(OFF_TOPIC_REPLY, {
      timeout: 15_000,
    });
  });

  test('renders the reply once the backend responds', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { reply: 'Mocked assistant reply for testing.' } }),
      });
    });

    await page.goto('/');
    await openChat(page);
    await sendMessage(page, 'What projects has Shafi worked on?');

    await expect(page.locator('.chat-message.user').last()).toHaveText(
      'What projects has Shafi worked on?',
    );
    await expect(page.locator('.chat-message.assistant').last()).toHaveText(
      'Mocked assistant reply for testing.',
    );
  });

  test('shows a friendly message when rate-limited', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many messages, please wait a moment and try again.',
          },
        }),
      });
    });

    await page.goto('/');
    await openChat(page);
    await sendMessage(page, 'What projects has Shafi worked on?');

    await expect(page.locator('.chat-error')).toContainText('sending messages a bit fast');
  });

  test('shows a generic error message when the request fails', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: 'Failed to get a response. Please try again later.' },
        }),
      });
    });

    await page.goto('/');
    await openChat(page);
    await sendMessage(page, 'What projects has Shafi worked on?');

    await expect(page.locator('.chat-error')).toContainText('Failed to get a response');
  });

  test(
    'answers a real on-topic question end to end',
    { tag: '@live-write' },
    async ({ page }) => {
      // Not part of the default run (see grepInvert in playwright.config.ts) — a
      // real pass here calls the Anthropic API and spends real tokens. Run
      // deliberately with `npm run test:live`, matching portfolio-api-tests'
      // ChatApiTest.answersARealOnTopicQuestion.
      await page.goto('/');
      await openChat(page);
      await sendMessage(page, 'What projects has Shafi worked on?');

      const reply = page.locator('.chat-message.assistant').last();
      await expect(reply).not.toHaveText(OFF_TOPIC_REPLY, { timeout: 20_000 });
      await expect(reply).not.toBeEmpty();
    },
  );
});
