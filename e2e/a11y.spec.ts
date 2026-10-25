import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, settle, storeTheme, test, type Theme } from './fixtures';

const PAGES = [
  '/',
  '/de',
  '/blog/modelling-roles',
  '/de/blog/modelling-roles',
  '/imprint',
  '/de/datenschutz',
  '/gibt-es-nicht',
];

const ACCENTS = ['blue', 'teal', 'purple', 'red'];

const THEMES: Theme[] = ['dark', 'light'];

/** Verstöße als lesbare Zeilen, damit die Fehlermeldung zeigt, was wo kaputt ist */
async function violations(page: Page, rules?: string[]): Promise<string[]> {
  const builder = new AxeBuilder({ page });
  if (rules) builder.withRules(rules);
  else builder.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']);
  const { violations } = await builder.analyze();
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`),
  );
}

for (const theme of THEMES) {
  test.describe(`Barrierefreiheit (${theme})`, () => {
    for (const path of PAGES) {
      test(`${path} hat keine axe-Verstöße`, async ({ page }) => {
        await storeTheme(page, theme);
        await page.goto(path);
        await settle(page);
        expect(await violations(page)).toEqual([]);
      });
    }

    for (const accent of ACCENTS) {
      test(`Akzentfarbe ${accent} hat genug Kontrast`, async ({ page }) => {
        await storeTheme(page, theme);
        await page.addInitScript(
          (value) => localStorage.setItem('sg-portfolio-accent', value),
          accent,
        );
        await page.goto('/');
        await settle(page);
        expect(await violations(page, ['color-contrast'])).toEqual([]);
      });
    }
  });
}
