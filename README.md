# portfolio-website-ui-tests

Playwright end-to-end suite for [shafihassan.com](https://shafihassan.com) — the Angular frontend behind the portfolio site.

## Stack

- Playwright Test
- TypeScript

## Running locally

By default, tests run against production (`https://shafihassan.com`):

```bash
npm test
```

To point at a local dev server instead (`ng serve` in the [portfolio-website-ui](https://github.com/shafi-hassan0/portfolio-website-ui) repo, default port 4200):

```bash
BASE_URL=http://localhost:4200 npm test
```

Other useful commands:

```bash
npm run test:ui      # interactive UI mode
npm run report        # open the last HTML report
```

## The contact form's live-write test

`contact.spec.ts`'s "sends a real message end to end" test is tagged `@live-write` and excluded from the default run (see `grepInvert` in `playwright.config.ts`) — a real pass creates a real `Contact` document and sends a real email through EmailJS, which shouldn't happen on every run. This mirrors `ContactApiTest.acceptsAValidSubmission` in [portfolio-website-api-tests](https://github.com/shafi-hassan0/portfolio-website-api-tests).

Run it deliberately:

```bash
npm run test:live
```

Every other contact-form test mocks the `POST /api/contact` call, so the default suite is safe to run against production.

## CI

GitHub Actions runs the default (non-live-write) suite on every push/PR to `main`. See `.github/workflows/tests.yml`.
