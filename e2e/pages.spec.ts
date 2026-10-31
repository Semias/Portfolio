import { SCROLL_TIMEOUT, expect, test } from './fixtures';

test.describe('Impressum und Datenschutz', () => {
  test('sind über den Footer erreichbar, schlicht und ohne 3D', async ({ page }) => {
    await page.goto('/de');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Impressum' }).click();
    await expect(page).toHaveURL('/de/impressum');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Impressum');
    await expect(page).toHaveTitle('Impressum · Stefan Gall');
    await expect(page.locator('app-network-background, app-glass-card')).toHaveCount(0);

    await page.getByRole('contentinfo').getByRole('link', { name: 'Datenschutz' }).click();
    await expect(page).toHaveURL('/de/datenschutz');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Datenschutzerklärung');
  });

  test('wechseln die Sprache auf die passende Seite', async ({ page }) => {
    await page.goto('/imprint');
    await page.getByRole('link', { name: 'DE, Deutsche Version' }).click();
    await expect(page).toHaveURL('/de/impressum');
    await page.goto('/de/datenschutz');
    await page.getByRole('link', { name: 'EN, English version' }).click();
    await expect(page).toHaveURL('/privacy');
  });

  test('führen über die Navigation zur Sektion der Startseite', async ({ page }) => {
    await page.goto('/imprint');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Projects' })
      .click();
    await expect(page).toHaveURL('/#work');
    await expect
      .poll(
        () => page.evaluate(() => document.getElementById('work')?.getBoundingClientRect().top),
        SCROLL_TIMEOUT,
      )
      .toBeLessThan(200);
  });

  test('springen zur Sektion, auch wenn die Seite beim Klick noch lädt', async ({ page }) => {
    // Den Chunk der Rechtsseite zurückhalten: Der Header ist bedienbar, die App aber noch nicht stabil
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    let requested!: () => void;
    const chunkRequested = new Promise<void>((resolve) => (requested = resolve));
    await page.route(/\/chunk-[\w-]+\.js$/, async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes('app-legal-page')) {
        requested();
        await held;
      }
      await route.fulfill({ response, body });
    });

    await page.goto('/imprint', { waitUntil: 'commit' });
    await chunkRequested;
    await page.waitForTimeout(500);
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Projects' })
      .click();
    await expect(page).toHaveURL('/#work');
    await expect
      .poll(
        () => page.evaluate(() => document.getElementById('work')?.getBoundingClientRect().top),
        SCROLL_TIMEOUT,
      )
      .toBeLessThan(200);
    release();
  });
});

test.describe('404', () => {
  for (const [path, heading] of [
    ['/gibt-es-nicht', 'Page not found.'],
    ['/de/gibt-es-nicht', 'Seite nicht gefunden.'],
    ['/blog/unbekannt', 'Page not found.'],
  ]) {
    test(`${path} liefert Status 404 und die passende Seite`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
      // Die Seite ist nach dem Laden voll bedienbar (Hydrierung an fremder URL)
      await page.getByRole('link', { name: /Back to the homepage|Zur Startseite/ }).click();
      await expect(page).toHaveURL(path.startsWith('/de') ? '/de' : '/');
    });
  }
});

test.describe('SEO', () => {
  test('liefert Canonical, hreflang und Open Graph im vorgerenderten HTML', async ({ request }) => {
    const html = await (await request.get('/de/impressum')).text();
    expect(html).toContain('<html lang="de"');
    expect(html).toContain('<link rel="canonical" href="https://gall-stefan.de/de/impressum">');
    expect(html).toContain(
      '<link rel="alternate" hreflang="en" href="https://gall-stefan.de/imprint">',
    );
    expect(html).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://gall-stefan.de/imprint">',
    );
    expect(html).toContain('<meta property="og:locale" content="de_DE">');
    expect(html).toContain('<meta name="theme-color" media="(prefers-color-scheme: dark)"');
  });

  test('hat eine Sitemap und robots.txt', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('<loc>https://gall-stefan.de/</loc>');
    expect(sitemap).toContain('<loc>https://gall-stefan.de/de/blog/modelling-roles</loc>');
    expect(sitemap).not.toContain('404');
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Sitemap: https://gall-stefan.de/sitemap.xml');
  });

  test('leitet Adressen mit Schrägstrich am Ende auf die kanonische um', async ({ request }) => {
    const response = await request.get('/de/impressum/?x=1', { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()['location']).toBe('/de/impressum?x=1');
  });
});
