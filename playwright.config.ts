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

  // @live-write exclusion lives in the "test" npm script (--grep-invert), not
  // here — Playwright ANDs config-level grep/grepInvert with CLI grep, so a
  // grepInvert baked in here would silently cancel out `--grep @live-write`
  // and "npm run test:live" would always find zero tests.

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  // WebKit dropped — Chromium coverage (desktop + mobile) catches the vast
  // majority of real issues, and running a third full browser engine on a
  // single CI worker was a big chunk of the suite's runtime.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
