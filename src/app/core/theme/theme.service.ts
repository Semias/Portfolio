import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  Accent,
  AccentPalette,
  DEFAULT_ACCENT,
  PresetAccent,
  THEME_SURFACES,
  Theme,
  accentPalette,
  isHexColor,
  isPresetAccent,
} from './color';

export { DEFAULT_ACCENT };

export const THEME_STORAGE_KEYS = {
  theme: 'sg-portfolio-theme',
  accent: 'sg-portfolio-accent',
  hex: 'sg-portfolio-hex',
  /** Fertig berechnete Farben beider Themes, damit das Inline-Skript in index.html nichts rechnen muss */
  palette: 'sg-portfolio-palette',
} as const;

/** Etwas länger als die 200 ms Überblendung in _base.scss */
const SWITCH_CLASS_MS = 260;

/**
 * Theme (hell/dunkel) und Akzentfarbe. Ohne eigene Wahl folgt das Theme live der Systemeinstellung.
 * Auf dem Server passiert nichts: Die vorgerenderten Seiten bekommen Theme und Akzent vom Inline-Skript.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly chosenTheme = signal<Theme | null>(null);
  private readonly systemTheme = signal<Theme>('dark');
  private readonly accentState = signal<Accent>(DEFAULT_ACCENT);
  private readonly customHexState = signal<string | null>(null);
  private appliedTheme: Theme | null = null;
  private switchTimer?: ReturnType<typeof setTimeout>;

  readonly theme = computed<Theme>(() => this.chosenTheme() ?? this.systemTheme());
  readonly accent = this.accentState.asReadonly();
  readonly customHex = this.customHexState.asReadonly();
  readonly palette = computed<AccentPalette>(() =>
    accentPalette(this.theme(), this.accentState(), this.customHexState()),
  );

  constructor() {
    if (!this.isBrowser) return;
    this.restore();
    this.followSystem();
    effect(() => this.apply(this.theme(), this.palette()));
    inject(DestroyRef).onDestroy(() => clearTimeout(this.switchTimer));
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.chosenTheme.set(next);
    this.write(THEME_STORAGE_KEYS.theme, next);
  }

  setAccent(accent: PresetAccent): void {
    this.accentState.set(accent);
    this.write(THEME_STORAGE_KEYS.accent, accent);
    this.cachePalette();
  }

  setCustomColor(hex: string): void {
    if (!isHexColor(hex)) return;
    const value = hex.toLowerCase();
    this.customHexState.set(value);
    this.accentState.set('custom');
    this.write(THEME_STORAGE_KEYS.accent, 'custom');
    this.write(THEME_STORAGE_KEYS.hex, value);
    this.cachePalette();
  }

  /** Farben für ein bestimmtes Theme, z. B. für die Farbmuster im Farbwähler */
  paletteFor(accent: Accent, theme = this.theme()): AccentPalette {
    return accentPalette(theme, accent, this.customHexState());
  }

  private restore(): void {
    const theme = this.read(THEME_STORAGE_KEYS.theme);
    if (theme === 'light' || theme === 'dark') this.chosenTheme.set(theme);

    const accent = this.read(THEME_STORAGE_KEYS.accent);
    const hex = this.read(THEME_STORAGE_KEYS.hex);
    if (isHexColor(hex)) this.customHexState.set(hex.toLowerCase());
    if (isPresetAccent(accent)) this.accentState.set(accent);
    else if (accent === 'custom' && isHexColor(hex)) this.accentState.set('custom');
  }

  private followSystem(): void {
    const query = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: light)');
    if (!query) return;
    this.systemTheme.set(query.matches ? 'light' : 'dark');
    const onChange = (event: MediaQueryListEvent) =>
      this.systemTheme.set(event.matches ? 'light' : 'dark');
    query.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
  }

  private apply(theme: Theme, palette: AccentPalette): void {
    const root = this.document.documentElement;
    // Überblenden nur beim Wechsel, nicht beim ersten Anwenden
    if (this.appliedTheme && this.appliedTheme !== theme) this.markSwitching(root);
    this.appliedTheme = theme;

    root.setAttribute('data-theme', theme);
    root.style.setProperty('--acc', palette.acc);
    root.style.setProperty('--acc-soft', palette.soft);
    root.style.setProperty('--on-acc', palette.onAcc);
    this.document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', THEME_SURFACES[theme].bg));
  }

  private markSwitching(root: HTMLElement): void {
    root.classList.add('theme-switching');
    clearTimeout(this.switchTimer);
    this.switchTimer = setTimeout(() => root.classList.remove('theme-switching'), SWITCH_CLASS_MS);
  }

  private cachePalette(): void {
    const accent = this.accentState();
    const hex = this.customHexState();
    const cache = {
      dark: accentPalette('dark', accent, hex),
      light: accentPalette('light', accent, hex),
    };
    this.write(THEME_STORAGE_KEYS.palette, JSON.stringify(cache));
  }

  private read(key: string): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      this.document.defaultView?.localStorage.setItem(key, value);
    } catch {
      // Ohne Speicher (z. B. privates Fenster) gilt die Wahl nur bis zum Neuladen
    }
  }
}
