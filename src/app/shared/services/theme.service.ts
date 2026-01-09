import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _document = inject(DOCUMENT);

  // Signal for the current theme in the application
  readonly currentTheme = signal<Theme>('light');

  constructor() {
    this.initializeTheme();

    // Effect that runs whenever currentTheme changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      localStorage.setItem('theme', theme);
    });
  }

  toggleTheme() {
    this.currentTheme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  private initializeTheme() {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      this.currentTheme.set(storedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Optional: Detect system preference
      this.currentTheme.set('dark');
    }
  }

  private applyTheme(theme: Theme) {
    // Set the attribute on the html element
    this._document.documentElement.setAttribute('color-scheme', theme);
  }
}
