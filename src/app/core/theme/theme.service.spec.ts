import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mockMatchMedia } from '../../../testing/media';
import { THEME_SURFACES, accentPalette } from './color';
import { THEME_STORAGE_KEYS, ThemeService } from './theme.service';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

describe('ThemeService', () => {
  const root = document.documentElement;

  function create(): ThemeService {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    root.removeAttribute('data-theme');
    root.removeAttribute('style');
    root.className = '';
    document.head.innerHTML =
      '<meta name="theme-color" media="(prefers-color-scheme: light)" content="x">' +
      '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="x">';
  });

  afterEach(() => vi.restoreAllMocks());

  it('falls back to dark without a stored choice or system preference', () => {
    mockMatchMedia();
    const service = create();
    expect(service.theme()).toBe('dark');
    expect(root.dataset['theme']).toBe('dark');
  });

  it('follows the system preference without a stored choice', () => {
    mockMatchMedia({ [LIGHT_QUERY]: true });
    expect(create().theme()).toBe('light');
  });

  it('follows live system changes until the visitor picks a theme', () => {
    const media = mockMatchMedia();
    const service = create();

    media.set(LIGHT_QUERY, true);
    TestBed.tick();
    expect(service.theme()).toBe('light');
    expect(root.dataset['theme']).toBe('light');

    service.toggleTheme();
    TestBed.tick();
    expect(service.theme()).toBe('dark');

    media.set(LIGHT_QUERY, false);
    media.set(LIGHT_QUERY, true);
    TestBed.tick();
    expect(service.theme()).toBe('dark');
  });

  it('prefers a stored theme over the system preference', () => {
    mockMatchMedia({ [LIGHT_QUERY]: true });
    localStorage.setItem(THEME_STORAGE_KEYS.theme, 'dark');
    expect(create().theme()).toBe('dark');
  });

  it('ignores invalid stored values', () => {
    mockMatchMedia();
    localStorage.setItem(THEME_STORAGE_KEYS.theme, 'sepia');
    localStorage.setItem(THEME_STORAGE_KEYS.accent, 'gold');
    const service = create();
    expect(service.theme()).toBe('dark');
    expect(service.accent()).toBe('blue');
  });

  it('stores the toggled theme and updates the page', () => {
    mockMatchMedia();
    const service = create();
    service.toggleTheme();
    TestBed.tick();

    expect(localStorage.getItem(THEME_STORAGE_KEYS.theme)).toBe('light');
    expect(root.dataset['theme']).toBe('light');
    expect(root.style.getPropertyValue('--acc')).toBe(accentPalette('light', 'blue').acc);
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      expect(meta.getAttribute('content')).toBe(THEME_SURFACES.light.bg);
    });
  });

  it('cross-fades only when switching, not on first load', () => {
    vi.useFakeTimers();
    mockMatchMedia();
    const service = create();
    expect(root.classList.contains('theme-switching')).toBe(false);

    service.toggleTheme();
    TestBed.tick();
    expect(root.classList.contains('theme-switching')).toBe(true);

    vi.advanceTimersByTime(300);
    expect(root.classList.contains('theme-switching')).toBe(false);
    vi.useRealTimers();
  });

  it('applies and stores a preset accent including the palette cache for the inline script', () => {
    mockMatchMedia();
    const service = create();
    service.setAccent('teal');
    TestBed.tick();

    expect(root.style.getPropertyValue('--acc')).toBe(accentPalette('dark', 'teal').acc);
    expect(root.style.getPropertyValue('--acc-soft')).toBe(accentPalette('dark', 'teal').soft);
    expect(root.style.getPropertyValue('--on-acc')).toBe(accentPalette('dark', 'teal').onAcc);
    expect(localStorage.getItem(THEME_STORAGE_KEYS.accent)).toBe('teal');
    expect(JSON.parse(localStorage.getItem(THEME_STORAGE_KEYS.palette) ?? '{}')).toEqual({
      dark: accentPalette('dark', 'teal'),
      light: accentPalette('light', 'teal'),
    });
  });

  it('applies a custom colour and ignores invalid ones', () => {
    mockMatchMedia();
    const service = create();
    service.setCustomColor('#12AB34');
    TestBed.tick();
    expect(service.accent()).toBe('custom');
    expect(service.customHex()).toBe('#12ab34');
    expect(localStorage.getItem(THEME_STORAGE_KEYS.hex)).toBe('#12ab34');
    expect(root.style.getPropertyValue('--acc')).toBe('#12ab34');

    service.setCustomColor('not-a-colour');
    TestBed.tick();
    expect(service.customHex()).toBe('#12ab34');
  });

  it('restores a stored custom colour', () => {
    mockMatchMedia();
    localStorage.setItem(THEME_STORAGE_KEYS.accent, 'custom');
    localStorage.setItem(THEME_STORAGE_KEYS.hex, '#12ab34');
    const service = create();
    expect(service.accent()).toBe('custom');
    expect(service.palette().acc).toBe('#12ab34');
  });

  it('keeps working when localStorage is blocked', () => {
    mockMatchMedia();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const service = create();
    service.toggleTheme();
    service.setAccent('red');
    TestBed.tick();
    expect(service.theme()).toBe('light');
    expect(service.accent()).toBe('red');
  });

  it('provides palettes for the swatches of the current theme', () => {
    mockMatchMedia();
    const service = create();
    expect(service.paletteFor('purple')).toEqual(accentPalette('dark', 'purple'));
    expect(service.paletteFor('purple', 'light')).toEqual(accentPalette('light', 'purple'));
  });

  it('does not touch the document on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const service = create();
    expect(service.theme()).toBe('dark');
    expect(root.hasAttribute('data-theme')).toBe(false);
  });
});
