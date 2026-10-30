import { SCROLL_TIMEOUT, expect, scrollY, settle, test } from './fixtures';

const POST = '/blog/modelling-roles';

test.describe('Blog', () => {
  test('öffnet einen Beitrag über die Karte auf der Startseite', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Modelling roles without painting yourself in' }).click();
    await expect(page).toHaveURL(POST);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Modelling roles without painting yourself in',
    );
    await expect(page).toHaveTitle('Modelling roles without painting yourself in · Stefan Gall');
  });

  test('zeigt Kopf, Inhaltsverzeichnis, Code, Zitat, Liste und Tags', async ({ page }) => {
    await page.goto(POST);
    // Kopf des Beitrags, nicht die Karten unter „Weiterlesen“
    const meta = page.locator('header.head .meta');
    await expect(meta).toContainText('Identity');
    await expect(meta.locator('time')).toHaveText('Sep 12, 2026');
    await expect(meta).toContainText('min read');
    await expect(page.locator('.toc a')).toHaveText([
      '01Roles are the surface',
      '02Ownership first',
      '03In operation',
      '04Takeaway',
    ]);
    await expect(page.locator('app-post-body pre code .hljs-keyword').first()).toBeVisible();
    await expect(page.locator('app-post-body blockquote')).toContainText('The role answers');
    await expect(page.locator('app-post-body ul li')).toHaveCount(3);
    await expect(page.locator('.tags app-tag')).toHaveText(['RBAC', 'Multi-Tenant', 'TypeScript']);
  });

  test('springt über das Inhaltsverzeichnis unter den Header', async ({ page }) => {
    await page.goto(POST);
    await settle(page);
    await page.locator('.toc').getByRole('link', { name: '04 Takeaway' }).click();
    await expect(page).toHaveURL(`${POST}#takeaway`);
    await expect
      .poll(() =>
        page.evaluate(() => document.getElementById('takeaway')?.getBoundingClientRect().top),
      )
      .toBeGreaterThanOrEqual(52);
    expect(await scrollY(page)).toBeGreaterThan(0);
  });

  test('zeigt den Lesefortschritt im Header', async ({ page }) => {
    await page.goto(POST);
    const progress = page.locator('header .progress');
    await expect(progress).toHaveAttribute('style', /scaleX\(0\)/);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(progress).toHaveAttribute('style', /scaleX\(1\)/);
  });

  test('schlägt zwei weitere Beiträge vor und verlinkt den Kontakt', async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator('.more app-post-card')).toHaveCount(2);
    await page.getByRole('link', { name: 'Get in touch' }).click();
    await expect(page).toHaveURL('/#contact');
    await expect
      .poll(
        () => page.evaluate(() => document.getElementById('contact')?.getBoundingClientRect().top),
        SCROLL_TIMEOUT,
      )
      .toBeLessThan(200);
  });

  test('führt mit „Alle Beiträge“ zurück zum Blog der Startseite', async ({ page }) => {
    await page.goto(`/de${POST}`);
    await page.getByRole('link', { name: 'Alle Beiträge' }).click();
    await expect(page).toHaveURL('/de#writing');
  });

  test('wechselt auf dieselbe Beitragsseite in der anderen Sprache', async ({ page }) => {
    await page.goto(POST);
    await page.getByRole('link', { name: 'DE, Deutsche Version' }).click();
    await expect(page).toHaveURL(`/de${POST}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Rollen modellieren, ohne sich zu verbauen',
    );
    await expect(page.locator('header.head time')).toHaveText('12. Sep 2026');
  });

  test('behält Sprache und Umschalter, solange der Beitragstext noch lädt', async ({ page }) => {
    // Den Chunk mit dem Text zurückhalten: Angular hydriert, die erste Navigation hängt
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    let requested!: () => void;
    const bodyRequested = new Promise<void>((resolve) => (requested = resolve));
    await page.route(/\/chunk-[\w-]+\.js$/, async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes('editor_region_nord_readonly')) {
        requested();
        await held;
      }
      await route.fulfill({ response, body });
    });

    await page.goto(`/de${POST}`, { waitUntil: 'commit' });
    await bodyRequested;
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(
      page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('link').first(),
    ).toHaveText('Über mich');
    const toEnglish = page.getByRole('link', { name: 'EN, English version' });
    await expect(toEnglish).toHaveAttribute('href', POST);

    await toEnglish.click();
    release();
    await expect(page).toHaveURL(POST);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Modelling roles without painting yourself in',
    );
  });

  test('zeigt Beiträge ohne Text nur als Teaser ohne eigene Seite', async ({ page }) => {
    await page.goto('/');
    const teaser = page.locator('#writing app-post-card', { hasText: 'From TYPO3 to TypeScript' });
    await expect(teaser).toContainText('Coming soon');
    await expect(teaser.getByRole('link')).toHaveCount(0);

    const response = await page.goto('/blog/from-typo3-to-typescript');
    expect(response?.status()).toBe(404);
  });
});
