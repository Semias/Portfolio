// Prüft das Inline-Skript in src/index.html, das Theme und Akzent vor dem ersten Zeichnen setzt.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import vm from 'node:vm';
import { THEME_SURFACES, accentPalette } from '../../src/app/core/theme/color.ts';
import { read } from './helpers.mjs';

const html = read('src/index.html');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const KEYS = Object.fromEntries(
  [...read('src/app/core/theme/theme.service.ts').matchAll(/(\w+): '(sg-portfolio-[\w-]+)'/g)].map(
    ([, name, key]) => [name, key],
  ),
);

/** Führt das Skript mit gespeicherten Werten und Systemeinstellung aus und liefert, was es setzt */
function run({ storage = {}, systemLight = false, matchMedia = true, storageThrows = false } = {}) {
  const attributes = {};
  const style = {};
  const metas = [{}, {}].map((meta) => ({
    setAttribute: (name, value) => (meta[name] = value),
    meta,
  }));
  const document = {
    documentElement: {
      setAttribute: (name, value) => (attributes[name] = value),
      style: { setProperty: (name, value) => (style[name] = value) },
    },
    querySelectorAll: () => metas,
  };
  const localStorage = {
    getItem(key) {
      if (storageThrows) throw new Error('blocked');
      return storage[key] ?? null;
    },
  };
  const window = {};
  if (matchMedia)
    window.matchMedia = (query) => ({
      matches: systemLight && query === '(prefers-color-scheme: light)',
    });
  vm.runInNewContext(script, { document, localStorage, window });
  return { theme: attributes['data-theme'], style, themeColors: metas.map((m) => m.meta.content) };
}

describe('inline theme script', () => {
  it('uses the storage keys of ThemeService', () => {
    assert.deepEqual(Object.keys(KEYS).sort(), ['accent', 'hex', 'palette', 'theme']);
    for (const key of [KEYS.theme, KEYS.accent, KEYS.palette])
      assert.ok(script.includes(`'${key}'`), key);
  });

  it('falls back to dark without storage and system preference', () => {
    assert.equal(run().theme, 'dark');
    assert.equal(run({ matchMedia: false }).theme, 'dark');
  });

  it('follows the system preference', () => {
    const result = run({ systemLight: true });
    assert.equal(result.theme, 'light');
    assert.deepEqual(result.themeColors, [THEME_SURFACES.light.bg, THEME_SURFACES.light.bg]);
  });

  it('prefers the stored theme and ignores invalid values', () => {
    assert.equal(run({ systemLight: true, storage: { [KEYS.theme]: 'dark' } }).theme, 'dark');
    assert.equal(run({ storage: { [KEYS.theme]: 'light' } }).theme, 'light');
    assert.equal(run({ storage: { [KEYS.theme]: 'sepia' } }).theme, 'dark');
  });

  it('leaves the accent to the CSS defaults without a stored choice', () => {
    assert.deepEqual(run().style, {});
  });

  it('applies the cached palette of the active theme', () => {
    const cache = { dark: accentPalette('dark', 'red'), light: accentPalette('light', 'red') };
    const storage = {
      [KEYS.theme]: 'light',
      [KEYS.accent]: 'red',
      [KEYS.palette]: JSON.stringify(cache),
    };
    assert.deepEqual(run({ storage }).style, {
      '--acc': cache.light.acc,
      '--acc-soft': cache.light.soft,
      '--on-acc': cache.light.onAcc,
    });
  });

  it('rejects a broken or manipulated cache', () => {
    const bad = { dark: { acc: 'red;background:url(x)', soft: '#ffffff', onAcc: '#000000' } };
    assert.deepEqual(
      run({ storage: { [KEYS.accent]: 'custom', [KEYS.palette]: JSON.stringify(bad) } }).style,
      {},
    );
    assert.deepEqual(
      run({ storage: { [KEYS.accent]: 'custom', [KEYS.palette]: '{oops' } }).style,
      {},
    );
  });

  it('survives blocked storage', () => {
    assert.equal(run({ storageThrows: true, systemLight: true }).theme, 'light');
  });
});
