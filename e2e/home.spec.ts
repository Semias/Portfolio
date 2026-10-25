import {
  SCROLL_TIMEOUT,
  disableWebGL,
  expect,
  scrollY,
  settle,
  storeTheme,
  test,
  topOf,
} from './fixtures';

test.describe('Startseite', () => {
  test('zeigt Hero, Info-Leiste und alle Sektionen in der richtigen Reihenfolge', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Stefan Gall · Software Engineer');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      "Hi, I'm Stefan. I love building digital products.",
    );
    await expect(page.getByRole('img', { name: 'Portrait of Stefan Gall' })).toBeVisible();
    await expect(page.locator('h2')).toHaveText([
      'About me',
      'Curriculum',
      'Projects',
      'Blog',
      "Let's talk.",
    ]);
    await expect(page.locator('#work li')).toHaveCount(5);
    await expect(page.locator('#writing app-post-card')).toHaveCount(3);
  });

  test('springt mit dem Mausrad von Sektion zu Sektion', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => scrollY(page), SCROLL_TIMEOUT).toBe(await topOf(page, '#about'));
    await page.waitForTimeout(400);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => scrollY(page), SCROLL_TIMEOUT).toBe(await topOf(page, '#cv'));
  });

  test('springt mit Bild ab und Pfeil hoch', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    await page.locator('body').press('PageDown');
    await expect.poll(() => scrollY(page), SCROLL_TIMEOUT).toBe(await topOf(page, '#about'));
    await page.waitForTimeout(400);
    await page.locator('body').press('ArrowUp');
    await expect.poll(() => scrollY(page), SCROLL_TIMEOUT).toBe(0);
  });

  test('scrollt bei „Bewegung reduzieren“ normal und ohne Animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await settle(page);
    await page.mouse.move(720, 450);
    await page.mouse.wheel(0, 120);
    await expect.poll(() => scrollY(page)).toBe(120);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'CV' }).click();
    // Ohne Animation sofort am Ziel
    expect(await scrollY(page)).toBe(await topOf(page, '#cv'));
  });

  test('scrollt über die Navigation animiert zur Sektion', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    const positions = await page.evaluateHandle(() => {
      const seen: number[] = [];
      addEventListener('scroll', () => seen.push(Math.round(window.scrollY)));
      return seen;
    });
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Projects' })
      .click();
    const target = await topOf(page, '#work');
    await expect.poll(() => scrollY(page), SCROLL_TIMEOUT).toBe(target);
    // Animiert heißt: unterwegs gab es Zwischenstände
    const seen = await positions.jsonValue();
    expect(seen.some((y) => y > 0 && y < target)).toBe(true);
    await expect(page).toHaveURL('/');
  });

  test('macht den Header beim Scrollen kompakt und blendet die Navigation aus', async ({
    page,
  }) => {
    await page.goto('/');
    const header = page.locator('header.site-header');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(header).not.toHaveClass(/is-compact/);
    await expect(nav).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveClass(/is-compact/);
    await expect(nav).toBeHidden();
    await expect.poll(async () => (await header.boundingBox())?.height).toBe(52);

    // Für die Tastatur kommt die Navigation zurück
    await page.getByRole('link', { name: 'Stefan Gall, home' }).focus();
    await expect(nav).toBeVisible();
  });

  test('„nach oben“ im Footer scrollt zurück zum Anfang', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole('link', { name: '↑ back to top' }).click();
    await expect.poll(() => scrollY(page), SCROLL_TIMEOUT).toBe(0);
  });
});

test.describe('3D-Hintergrund', () => {
  test.use({ webgl: true });

  test('zeigt die 3D-Szene hinter der Startseite', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-network-background canvas')).toHaveCount(1, {
      timeout: 10_000,
    });
    await expect(page.locator('app-network-background')).toHaveAttribute('aria-hidden', 'true');
  });

  test('bleibt ohne WebGL beim normalen Hintergrund', async ({ page }) => {
    await disableWebGL(page);
    await page.goto('/');
    await settle(page);
    await expect(page.locator('app-network-background canvas')).toHaveCount(0);
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Theme und Akzentfarbe', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`folgt ohne eigene Wahl der Systemeinstellung (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    });
  }

  test('schaltet um, merkt sich die Wahl und setzt theme-color', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 248, 250)');
    await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
      'content',
      '#f7f8fa',
    );

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('setzt Theme und Akzent schon vor Angular (kein Aufblitzen)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('sg-portfolio-theme', 'light');
      localStorage.setItem('sg-portfolio-accent', 'red');
      localStorage.setItem(
        'sg-portfolio-palette',
        JSON.stringify({
          dark: { acc: '#ff563c', soft: '#ff8f79', onAcc: '#0e1014' },
          light: { acc: '#cd2a11', soft: '#952314', onAcc: '#ffffff' },
        }),
      );
    });
    // Ohne JavaScript-Bundles läuft nur das Inline-Skript aus index.html
    await page.route(/\.js$/, (route) =>
      route.fulfill({ contentType: 'text/javascript', body: '' }),
    );
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--acc'),
      ),
    ).toBe('#cd2a11');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(247, 248, 250)');
  });

  test('wechselt die Akzentfarbe und merkt sie sich', async ({ page }) => {
    await storeTheme(page, 'dark');
    await page.goto('/');
    const accent = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acc'));
    await page.getByRole('button', { name: 'Teal' }).click();
    await expect(page.getByRole('button', { name: 'Teal' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await accent()).toBe('#2fd0c0');

    await page.reload();
    await expect(page.getByRole('button', { name: 'Teal' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await accent()).toBe('#2fd0c0');
  });

  test('übernimmt eine freie Farbe', async ({ page }) => {
    await storeTheme(page, 'dark');
    await page.goto('/');
    // Eingaben vor der Hydrierung gehen verloren, Klicks dagegen spielt Angular nach
    await settle(page);
    await page.getByLabel('Custom colour').fill('#12ab34');
    await expect
      .poll(() =>
        page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acc')),
      )
      .toBe('#12ab34');
    await expect(page.getByRole('button', { name: 'Blue' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

test.describe('Sprache', () => {
  test('wechselt auf die deutsche Startseite und zurück', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'DE, Deutsche Version' }).click();
    await expect(page).toHaveURL('/de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('digitale Produkte');

    await page.getByRole('link', { name: 'EN, English version' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('leitet nicht nach Browsersprache um', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'de-DE' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await context.close();
  });
});

test.describe('Mobil @mobile', () => {
  test('zeigt die Navigation in einer eigenen Zeile und scrollt normal', async ({ page }) => {
    await page.goto('/de');
    await settle(page);
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
    expect((await page.locator('header.site-header').boundingBox())?.height).toBe(100);

    // Kein Sektions-Springen auf Touch-Geräten
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);
    expect(await scrollY(page)).toBe(300);
  });

  test('passt ohne seitliches Scrollen auf den Bildschirm', async ({ page }) => {
    for (const path of ['/', '/de/blog/modelling-roles', '/de/impressum']) {
      await page.goto(path);
      await settle(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(0);
    }
  });
});
