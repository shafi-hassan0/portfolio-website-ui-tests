import { test, expect } from '@playwright/test';
import { expectSliderMatchesApi, expectSliderNavigatesAndImagesRender } from './slider-page';

interface Project {
  title: string;
  githubUrl?: string;
  demoUrl?: string;
}

test('projects page shows every project from the API', async ({ page }) => {
  await expectSliderMatchesApi<Project>(page, '/api/projects', '/projects', (p) => p.title);
});

test('projects slider navigates and every image renders', async ({ page }) => {
  await expectSliderNavigatesAndImagesRender(page, '/projects');
});

test('project links point to a real, reachable GitHub/demo URL', async ({ page }) => {
  const response = await page.request.get('/api/projects');
  expect(response.ok()).toBe(true);
  const { data: projects } = (await response.json()) as { data: Project[] };

  await page.goto('/projects');

  for (const project of projects) {
    const expectedLink = project.demoUrl || project.githubUrl;
    if (!expectedLink) continue;

    const card = page.locator('mat-card').filter({
      has: page.getByText(project.title, { exact: true }),
    });
    const link = card.locator('.card-link');
    await expect(link).toHaveAttribute('href', expectedLink);

    const linkResponse = await page.request.get(expectedLink);
    expect(linkResponse.ok()).toBe(true);
  }
});
