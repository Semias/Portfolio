import { THEME_SURFACES } from '../../core/theme/color';
import { hubProgress } from './hub-progress';
import { gaussian, seededRandom } from './random';
import { scenePalette } from './scene-palette';

describe('seededRandom', () => {
  it('is deterministic for the same seed', () => {
    const a = seededRandom(20260);
    const b = seededRandom(20260);
    const first = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(first);
    expect(Array.from({ length: 5 }, seededRandom(1))).not.toEqual(first);
  });

  it('stays within [0, 1)', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('produces roughly normal values', () => {
    const random = seededRandom(3);
    const values = Array.from({ length: 4000 }, () => gaussian(random));
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    expect(Math.abs(mean)).toBeLessThan(0.1);
  });
});

describe('hubProgress', () => {
  const centers = [100, 300, 500];

  it('maps the viewport centre between the section centres', () => {
    expect(hubProgress(centers, 50)).toBe(0);
    expect(hubProgress(centers, 100)).toBe(0);
    expect(hubProgress(centers, 200)).toBe(0.25);
    expect(hubProgress(centers, 300)).toBe(0.5);
    expect(hubProgress(centers, 400)).toBe(0.75);
    expect(hubProgress(centers, 500)).toBe(1);
    expect(hubProgress(centers, 900)).toBe(1);
  });

  it('needs at least two sections', () => {
    expect(hubProgress([], 10)).toBe(0);
    expect(hubProgress([100], 500)).toBe(0);
  });
});

describe('scenePalette', () => {
  it('glows additively on the dark background', () => {
    const palette = scenePalette('dark', '#4d9fff');
    expect(palette.mode).toBe('dark');
    expect(palette.blending).toBe('additive');
    expect(palette.background).toBe(THEME_SURFACES.dark.bg);
    expect(palette.accent).toBe('#4d9fff');
    expect(palette.denseStars).toBe(true);
  });

  it('uses normal blending, fewer dark stars and pale nebulae in the light theme', () => {
    const dark = scenePalette('dark', '#4d9fff');
    const light = scenePalette('light', '#1e6bc9');
    expect(light.blending).toBe('normal');
    expect(light.background).toBe(THEME_SURFACES.light.bg);
    expect(light.denseStars).toBe(false);
    expect(light.pointOpacity).toBeLessThan(dark.pointOpacity);
    expect(light.travelledOpacity).toBeLessThan(dark.travelledOpacity);
    expect(light.nebulaOpacity).toBeLessThan(dark.nebulaOpacity);
    expect(light.starOpacity).toBeLessThan(dark.starOpacity);
    expect(light.edgeColor).toBe(THEME_SURFACES.light.ink);
    expect(light.pulseColor).toBe('#1e6bc9');
  });
});
