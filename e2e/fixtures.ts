import { Page, expect, test as base } from '@playwright/test';

export { expect };

export type Theme = 'dark' | 'light';

/** Meldungen der Software-GPU im Headless-Browser, keine Fehler der Seite */
const IGNORED_CONSOLE = [/GL Driver Message/, /GPU stall due to ReadPixels/];

interface Fixtures {
  /**
   * 3D-Szene zulassen. Standardmäßig ist WebGL aus: Ohne GPU rendert die Szene auf der CPU,
   * mehrere Browser gleichzeitig bremsen sich dann bis zum Timeout aus.
   */
  webgl: boolean;
  /** Sammelt Konsolenfehler und Seitenfehler; der Test schlägt am Ende fehl, wenn welche da sind */
  consoleErrors: string[];
}

export const test = base.extend<Fixtures>({
  webgl: [false, { option: true }],
  page: async ({ page, webgl }, use) => {
    if (!webgl) await disableWebGL(page);
    await use(page);
  },
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      // Die 404-Seite kommt absichtlich mit Status 404, das meldet Chrome als Ladefehler
      let notFoundDocument = false;
      page.on('response', (response) => {
        if (response.request().isNavigationRequest()) notFoundDocument = response.status() === 404;
      });
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return;
        if (notFoundDocument && /status of 404/.test(text)) return;
        errors.push(text);
      });
      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
      await use(errors);
      expect(errors, 'Konsolenfehler').toEqual([]);
    },
    { auto: true },
  ],
});

/** Gespeichertes Theme setzen, bevor die Seite lädt */
export async function storeTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((value) => localStorage.setItem('sg-portfolio-theme', value), theme);
}

/** WebGL abschalten: ohne 3D-Szene sind Screenshots und Kontrastprüfung reproduzierbar */
export async function disableWebGL(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith('webgl')) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
    } as typeof original;
  });
}

/** Warten, bis Schriften, Bilder und Angular fertig sind */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((img) =>
        img.complete ? undefined : new Promise((resolve) => img.addEventListener('load', resolve)),
      ),
    );
  });
}

/** Sprünge dauern bis zu 2,6 s; unter Last liefert der Browser die Animationsframes verzögert */
export const SCROLL_TIMEOUT = { timeout: 10_000 };

export function scrollY(page: Page): Promise<number> {
  return page.evaluate(() => Math.round(window.scrollY));
}

/** Oberkante eines Elements relativ zur Seite */
export function topOf(page: Page, selector: string): Promise<number> {
  return page.evaluate(
    (sel) =>
      Math.round((document.querySelector(sel)?.getBoundingClientRect().top ?? 0) + window.scrollY),
    selector,
  );
}
