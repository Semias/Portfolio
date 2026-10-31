import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pagePath } from '../../core/i18n/paths';
import { pageMeta } from '../../core/seo/seo.service';

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

  constructor() {
    pageMeta(() => ({
      title: this.t().meta.notFoundTitle,
      description: this.t().notFound.text,
      noindex: true,
    }));
  }
}
