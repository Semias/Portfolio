import {
  ACCENT_PRESETS,
  MIN_CONTRAST,
  PRESET_ACCENTS,
  THEME_SURFACES,
  Theme,
  accentPalette,
  contrast,
  ensureContrast,
  isHexColor,
  isPresetAccent,
  luminance,
  mix,
  readableOn,
} from './color';

const THEMES: Theme[] = ['dark', 'light'];

describe('color', () => {
  describe('mix', () => {
    it('mixes like color-mix in sRGB', () => {
      expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
      expect(mix('#4d9fff', '#ffffff', 0)).toBe('#4d9fff');
      expect(mix('#4d9fff', '#ffffff', 1)).toBe('#ffffff');
    });

    it('matches the 40 % white mix from the design prototype', () => {
      // mixW() aus Portfolio-Netz.dc.html
      const mixW = (hex: string, p: number) =>
        '#' +
        [1, 3, 5]
          .map((i) => {
            const v = parseInt(hex.slice(i, i + 2), 16);
            return Math.round(v + (255 - v) * p)
              .toString(16)
              .padStart(2, '0');
          })
          .join('');
      for (const hex of ['#12ab34', '#ff00aa', '#4d9fff']) {
        expect(mix(hex, '#ffffff', 0.4)).toBe(mixW(hex, 0.4));
      }
    });
  });

  describe('contrast', () => {
    it('follows the WCAG formula', () => {
      expect(luminance('#000000')).toBe(0);
      expect(luminance('#ffffff')).toBeCloseTo(1);
      expect(contrast('#000000', '#ffffff')).toBeCloseTo(21);
      expect(contrast('#ffffff', '#000000')).toBeCloseTo(21);
      expect(contrast('#777777', '#777777')).toBeCloseTo(1);
    });

    it('leaves colours alone that already reach the minimum', () => {
      expect(ensureContrast('#4d9fff', THEME_SURFACES.dark.hover)).toBe('#4d9fff');
    });

    it('darkens on light surfaces and lightens on dark ones', () => {
      const darkened = ensureContrast('#2fd0c0', THEME_SURFACES.light.hover);
      expect(luminance(darkened)).toBeLessThan(luminance('#2fd0c0'));
      expect(contrast(darkened, THEME_SURFACES.light.hover)).toBeGreaterThanOrEqual(MIN_CONTRAST);

      const lightened = ensureContrast('#1a2b5c', THEME_SURFACES.dark.hover);
      expect(luminance(lightened)).toBeGreaterThan(luminance('#1a2b5c'));
      expect(contrast(lightened, THEME_SURFACES.dark.hover)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });

    it('picks the more readable text colour for accent buttons', () => {
      expect(readableOn('#4d9fff')).toBe(THEME_SURFACES.dark.bg);
      expect(readableOn('#1e6bc9')).toBe('#ffffff');
    });
  });

  describe('accentPalette', () => {
    it('uses the design values for presets in the dark theme', () => {
      for (const accent of PRESET_ACCENTS) {
        const palette = accentPalette('dark', accent);
        expect(palette.acc).toBe(ACCENT_PRESETS[accent].dark);
        expect(palette.soft).toBe(ACCENT_PRESETS[accent].darkSoft);
      }
    });

    it('uses the darker design variants in the light theme, adjusted to 4.5:1', () => {
      for (const accent of PRESET_ACCENTS) {
        const palette = accentPalette('light', accent);
        expect(luminance(palette.acc)).toBeLessThanOrEqual(luminance(ACCENT_PRESETS[accent].light));
        expect(palette.soft).not.toBe(palette.acc);
      }
    });

    it('keeps every accent text colour at 4.5:1 in both themes', () => {
      const customs = ['#ffd400', '#1a2b5c', '#ffffff', '#000000', '#00ff00', '#ff00ff'];
      for (const theme of THEMES) {
        const surfaces = THEME_SURFACES[theme];
        const palettes = [
          ...PRESET_ACCENTS.map((accent) => accentPalette(theme, accent)),
          ...customs.map((hex) => accentPalette(theme, 'custom', hex)),
        ];
        for (const { acc, soft, onAcc } of palettes) {
          for (const surface of [surfaces.bg, surfaces.hover]) {
            expect(contrast(acc, surface)).toBeGreaterThanOrEqual(MIN_CONTRAST);
            expect(contrast(soft, surface)).toBeGreaterThanOrEqual(MIN_CONTRAST);
          }
          expect(contrast(onAcc, acc)).toBeGreaterThanOrEqual(MIN_CONTRAST);
        }
      }
    });

    it('mixes the soft tone of a custom colour with 40 % white in the dark theme', () => {
      expect(accentPalette('dark', 'custom', '#12ab34')).toEqual({
        acc: '#12ab34',
        soft: mix('#12ab34', '#ffffff', 0.4),
        onAcc: THEME_SURFACES.dark.bg,
      });
    });

    it('normalises custom colours to lower case', () => {
      expect(accentPalette('dark', 'custom', '#12AB34').acc).toBe('#12ab34');
    });

    it('falls back to the default accent for invalid input', () => {
      expect(accentPalette('dark', 'custom', 'red')).toEqual(accentPalette('dark', 'blue'));
      expect(accentPalette('dark', 'custom', null)).toEqual(accentPalette('dark', 'blue'));
    });
  });

  it('validates hex colours and accent names', () => {
    expect(isHexColor('#a1B2c3')).toBe(true);
    expect(isHexColor('#abc')).toBe(false);
    expect(isHexColor('a1b2c3')).toBe(false);
    expect(isHexColor(null)).toBe(false);
    expect(isPresetAccent('teal')).toBe(true);
    expect(isPresetAccent('custom')).toBe(false);
    expect(isPresetAccent('toString')).toBe(false);
  });
});
