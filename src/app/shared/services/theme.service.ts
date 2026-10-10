import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
export type Theme = 'light' | 'dark';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly theme = signal<Theme>(this.initialTheme());
  readonly currentTheme = this.theme.asReadonly();
  constructor() { this.applyTheme(); }
  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
    this.applyTheme();
    try { this.document.defaultView?.localStorage.setItem('theme', this.theme()); }
    catch { /* Theme switching works even when storage is unavailable. */ }
  }
  private initialTheme(): Theme {
    const browser = this.document.defaultView;
    try {
      const stored = browser?.localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* Fall back to the system preference. */ }
    return browser?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  private applyTheme(): void {
    this.document.documentElement.setAttribute('color-scheme', this.theme());
  }
}
