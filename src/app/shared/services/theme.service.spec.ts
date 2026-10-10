import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
describe('ThemeService', () => {
  beforeEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); document.documentElement.removeAttribute('color-scheme'); });
  it('restores a valid saved theme and persists toggles', () => {
    localStorage.setItem('theme', 'dark');
    const service = TestBed.inject(ThemeService);
    expect(service.currentTheme()).toBe('dark');
    service.toggleTheme();
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('color-scheme')).toBe('light');
  });
  it('ignores an invalid saved theme', () => {
    localStorage.setItem('theme', 'invalid');
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(TestBed.inject(ThemeService).currentTheme()).toBe('dark');
    vi.unstubAllGlobals();
  });
  it('works when reading and writing storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const service = TestBed.inject(ThemeService);
    const original = service.currentTheme();
    expect(() => service.toggleTheme()).not.toThrow();
    expect(service.currentTheme()).not.toBe(original);
  });
});
