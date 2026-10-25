import type { Page } from '@playwright/test';
import { expect, settle, storeTheme, test, type Theme } from './fixtures';

// Screenshot-Vergleiche nur im Playwright-Docker-Image: npm run e2e:visual (siehe playwright.config.ts)

const THEMES: Theme[] = ['dark', 'light'];

const DESKTOP_PAGES = [
  ['startseite', '/'],
  ['beitrag', '/blog/modelling-roles'],
  ['impressum', '/de/impressum'],
  ['404', '/gibt-es-nicht'],
];

const MOBILE_PAGES = [
  ['startseite', '/de'],
  ['beitrag', '/de/blog/modelling-roles'],
];

async function compare(page: Page, name: string, path: string, theme: Theme): Promise<void> {
  await storeTheme(page, theme);
  await page.goto(path);
  await settle(page);
  await expect(page).toHaveScreenshot(`${name}-${theme}.png`, {
    fullPage: true,
    // Die Jahreszahl im Footer ändert sich jedes Jahr
    mask: [page.getByText(/© \d{4} Stefan Gall/)],
  });
}

for (const theme of THEMES) {
  test.describe(`Screenshots ${theme} @visual`, () => {
    for (const [name, path] of DESKTOP_PAGES) {
      test(name, ({ page }) => compare(page, name, path, theme));
    }
  });

  test.describe(`Screenshots ${theme} @visual @mobile`, () => {
    for (const [name, path] of MOBILE_PAGES) {
      test(name, ({ page }) => compare(page, name, path, theme));
    }
  });
}
