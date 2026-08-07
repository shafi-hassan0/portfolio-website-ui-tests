# Portfolio UI Test Suite

A Playwright end-to-end suite covering every page of [shafihassan.com](https://shafihassan.com) — the Angular frontend behind the [Portfolio Frontend](https://github.com/shafi-hassan0/portfolio-website-ui) repo.

## Highlights

- Every page checked, including the skills/experience detail dialogs, image sliders, resume PDF download, contact form validation, and all six Playground mini-games
- Content is cross-checked live against the [REST API](https://github.com/shafi-hassan0/portfolio-website-api) rather than hardcoded — catches real rendering bugs without becoming brittle to legitimate content updates
- Runs across desktop Chrome, WebKit, and mobile Chrome — 200+ test runs per suite execution
- Runs automatically on every push to the UI repo, nightly against production, and on every pull request — with results reported back to the UI repo as a commit status
- Part of a fully automated cross-repo pipeline: a frontend deploy dispatches this suite and waits for the real pass/fail before the deploy is considered successful

---

## For Developers

### Stack

- Playwright Test
- TypeScript

### Running locally

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

### The contact form's live-write test

`contact.spec.ts`'s "sends a real message end to end" test is tagged `@live-write` and excluded from the default run (see `grepInvert` in `playwright.config.ts`) — a real pass creates a real `Contact` document and sends a real email through EmailJS, which shouldn't happen on every run. This mirrors `ContactApiTest.acceptsAValidSubmission` in [portfolio-website-api-tests](https://github.com/shafi-hassan0/portfolio-website-api-tests).

Run it deliberately:

```bash
npm run test:live
```

Every other contact-form test mocks the `POST /api/contact` call, so the default suite is safe to run against production.

### CI

GitHub Actions runs the default (non-live-write) suite on every push/PR to `main`. See `.github/workflows/tests.yml`.
