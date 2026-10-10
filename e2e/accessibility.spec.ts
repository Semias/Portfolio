import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 1280]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`accessible routes at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      for (const path of ['/', '/about', '/projects', '/cv', '/contact', '/missing']) {
        await page.goto(path);
        await expect(page.locator('main')).toBeVisible();
        await expect(page).toHaveTitle(/Stefan Gall/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(results.violations).toEqual([]);
      }
    });
  }
}
test('keyboard navigation, current page, theme persistence and unknown route', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('main')).toBeFocused();
  await expect(page.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('aria-current', 'page');
  const button = page.getByRole('button', { name: 'Dark mode' });
  const previous = await button.getAttribute('aria-pressed');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', previous === 'true' ? 'false' : 'true');
  await page.reload();
  await expect(button).toHaveAttribute('aria-pressed', previous === 'true' ? 'false' : 'true');
  await page.goto('/missing');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Return home' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stefan Gall');
});
