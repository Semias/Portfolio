// Abgleich zwischen src/styles/_tokens.scss und src/app/core/theme/color.ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_ACCENT,
  MIN_CONTRAST,
  THEME_SURFACES,
  accentPalette,
  contrast,
} from '../../src/app/core/theme/color.ts';
import { read, tokenBlock } from './helpers.mjs';

const scss = read('src/styles/_tokens.scss');
const themes = { dark: tokenBlock(scss, 'dark'), light: tokenBlock(scss, 'light') };
const TEXT_TOKENS = ['ink', 'ink2', 'ink3', 'mute', 'mute2', 'mute3', 'acc', 'acc-soft'];
const SURFACES = ['bg', 'field', 'hover'];

for (const [theme, tokens] of Object.entries(themes)) {
  describe(`_tokens.scss (${theme})`, () => {
    it('uses the same surfaces as color.ts', () => {
      assert.equal(tokens.bg, THEME_SURFACES[theme].bg);
      assert.equal(tokens.ink, THEME_SURFACES[theme].ink);
      assert.equal(tokens.hover, THEME_SURFACES[theme].hover);
    });

    it('defines the default accent exactly like accentPalette()', () => {
      const palette = accentPalette(theme, DEFAULT_ACCENT);
      assert.deepEqual(
        { acc: tokens.acc, soft: tokens['acc-soft'], onAcc: tokens['on-acc'] },
        palette,
        `Standard-Akzent geändert? Dann --acc, --acc-soft und --on-acc im ${theme}-Block anpassen.`,
      );
    });

    for (const text of TEXT_TOKENS) {
      for (const surface of SURFACES) {
        it(`--${text} keeps ${MIN_CONTRAST}:1 on --${surface}`, () => {
          const ratio = contrast(tokens[text], tokens[surface]);
          assert.ok(
            ratio >= MIN_CONTRAST,
            `${tokens[text]} auf ${tokens[surface]}: ${ratio.toFixed(2)}`,
          );
        });
      }
    }

    it('keeps the accent button text readable', () => {
      assert.ok(contrast(tokens['on-acc'], tokens.acc) >= MIN_CONTRAST);
    });
  });
}

describe('index.html', () => {
  const html = read('src/index.html');

  it('uses the theme backgrounds for theme-color', () => {
    assert.match(
      html,
      new RegExp(`media="\\(prefers-color-scheme: light\\)" content="${THEME_SURFACES.light.bg}"`),
    );
    assert.match(
      html,
      new RegExp(`media="\\(prefers-color-scheme: dark\\)" content="${THEME_SURFACES.dark.bg}"`),
    );
    assert.ok(
      html.includes(`'${THEME_SURFACES.light.bg}'`) && html.includes(`'${THEME_SURFACES.dark.bg}'`),
    );
  });
});
