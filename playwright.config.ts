import { defineConfig, devices } from '@playwright/test';

// Mirrors portfolio-website-api-tests: defaults to hitting production, override
// for local dev with BASE_URL=http://localhost:4200 (after `ng serve` in portfolio-website-ui).
const baseURL = process.env['BASE_URL'] || 'https://shafihassan.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',

  // @live-write tests (e.g. a real contact-form submission) send real emails and
  // must be run deliberately via `npm run test:live`, never as part of the default suite.
  grepInvert: /@live-write/,

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
