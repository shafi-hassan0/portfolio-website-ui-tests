import { test, expect } from '@playwright/test';

const PAGE_SIZE = 9;

interface SkillListItem {
  _id: string;
  name: string;
}

interface SkillDetail {
  name: string;
  description: string;
  yearsExperience: number;
  relatedProjects: { title: string }[];
  relatedExperience: { role: string; company: string }[];
}

test('skills page shows every skill and its detail dialog matches the API', async ({ page }) => {
  const listResponse = await page.request.get('/api/skills');
  expect(listResponse.ok()).toBe(true);
  const { data: skills } = (await listResponse.json()) as { data: SkillListItem[] };

  await page.goto('/skills');

  // Skills render as a paginated grid rather than a slider, but — like the
  // slider — every page's cards sit in the DOM at once (CSS-transformed for
  // pagination), so a plain count check finds all of them regardless of the
  // currently-visible page.
  const renderedNames = page.locator('.skill-name');
  await expect(renderedNames).toHaveCount(skills.length);

  const normalizedNames = (await renderedNames.allTextContents()).map((n) => n.trim());
  for (const skill of skills) {
    expect(normalizedNames).toContain(skill.name);
  }

  const modal = page.locator('.modal-card');
  let currentPage = 0;

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    const targetPage = Math.floor(i / PAGE_SIZE);

    // The pagination is a CSS transform, not real scrolling, so a card on a
    // page that isn't current wouldn't actually be clickable by a real user —
    // advance page by page rather than reaching across pages directly.
    while (currentPage < targetPage) {
      await page.getByRole('button', { name: 'Next' }).click();
      currentPage++;
    }

    const detailResponse = await page.request.get(
      `/api/skills/${skill._id}?expand=projects,experience`,
    );
    expect(detailResponse.ok()).toBe(true);
    const { data: detail } = (await detailResponse.json()) as { data: SkillDetail };

    // exact:true avoids substring collisions between similarly-named skills
    // (e.g. "Git" is a substring of both "GitHub Actions" and "GitLab CI/CD").
    await page.getByText(skill.name, { exact: true }).click();
    await expect(modal).toBeVisible();

    const modalBody = await modal.locator('.modal-body').innerText();

    expect(modalBody).toContain(detail.description);

    const yearsLabel = `${detail.yearsExperience} ${detail.yearsExperience === 1 ? 'year' : 'years'} of experience`;
    expect(modalBody).toContain(yearsLabel);

    if (detail.relatedProjects.length > 0) {
      for (const project of detail.relatedProjects) {
        expect(modalBody).toContain(project.title);
      }
    } else {
      expect(modalBody).toContain('No related projects yet.');
    }

    if (detail.relatedExperience.length > 0) {
      for (const exp of detail.relatedExperience) {
        expect(modalBody).toContain(`${exp.role} · ${exp.company}`);
      }
    } else {
      expect(modalBody).toContain('No related experience yet.');
    }

    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).not.toBeVisible();
  }
});
