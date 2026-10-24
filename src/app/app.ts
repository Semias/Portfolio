import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/i18n/language.service';
import { ThemeService } from './core/theme/theme.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor() {
    // Beide Services sollen vom Start an laufen, auch wenn noch keine Seite sie braucht
    inject(ThemeService);
    inject(LanguageService);
  }
}
