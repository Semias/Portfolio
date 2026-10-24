import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pagePath } from '../../core/i18n/paths';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  styleUrl: './not-found.page.scss',
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {
  private readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly homePath = computed(() => pagePath('home', this.language.lang()));
}
