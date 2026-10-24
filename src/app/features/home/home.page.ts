import { Component, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-home-page',
  styleUrl: './home.page.scss',
  templateUrl: './home.page.html',
})
export class HomePage {
  protected readonly t = inject(LanguageService).t;
}
