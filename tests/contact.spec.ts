import { test, expect, type Page } from '@playwright/test';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

async function fillContactForm(page: Page, data: ContactFormData) {
  await page.getByLabel('Name').fill(data.name);
  await page.getByLabel('Email').fill(data.email);
  await page.getByLabel('Message').fill(data.message);
}

test.describe('contact form', () => {
  test('rejects an empty submission with an inline error toast', async ({ page }) => {
    await page.goto('/contact');

    // The native `required` attributes would block submission before Angular's own
    // validation runs, so fill and clear one field to get past that and exercise
    // the component's own "Please fill out all fields." check.
    await page.getByLabel('Name').fill('Playwright');
    await page.getByLabel('Name').fill('');
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('alert')).toContainText('Please fill out all fields.');
  });

  test('blocks submission for an invalid email format', async ({ page }) => {
    await page.goto('/contact');
    await fillContactForm(page, {
      name: 'Playwright Bot',
      email: 'not-an-email',
      message: 'This is an automated end-to-end test message.',
    });
    await page.getByRole('button', { name: 'Send Message' }).click();

    // type="email" triggers the browser's own constraint validation, which blocks
    // the submit event entirely — Angular's sendEmail() never runs, so there's no
    // app-level toast to check, just the input's native validity state.
    const emailIsValid = await page
      .getByLabel('Email')
      .evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(emailIsValid).toBe(false);

    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('alert')).not.toBeVisible();
  });

  test('shows a success toast for a valid submission', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { message: 'Message sent successfully!' } }),
      });
    });

    await page.goto('/contact');
    await fillContactForm(page, {
      name: 'Playwright Bot',
      email: 'playwright@example.com',
      message: 'This is an automated end-to-end test message.',
    });
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('alert')).toContainText('Message sent successfully!');
  });

  test('shows an error toast when the API call fails', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Failed to send message. Please try again later.' } }),
      });
    });

    await page.goto('/contact');
    await fillContactForm(page, {
      name: 'Playwright Bot',
      email: 'playwright@example.com',
      message: 'This is an automated end-to-end test message.',
    });
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('alert')).toContainText('Failed to send message');
  });

  test(
    'sends a real message end to end',
    { tag: '@live-write' },
    async ({ page }) => {
      // Not part of the default run (see grepInvert in playwright.config.ts) — a real pass
      // here creates a real Contact document and sends a real email via EmailJS. Run
      // deliberately with `npm run test:live`, matching portfolio-api-tests' ContactApiTest.
      await page.goto('/contact');
      await fillContactForm(page, {
        name: 'Playwright E2E',
        email: 'playwright-e2e@example.com',
        message: 'Live end-to-end check from portfolio-website-ui-tests.',
      });
      await page.getByRole('button', { name: 'Send Message' }).click();

      await expect(page.getByRole('alert')).toContainText('Message sent successfully!', {
        timeout: 15_000,
      });
    },
  );
});
