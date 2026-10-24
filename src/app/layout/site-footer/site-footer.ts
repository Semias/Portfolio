import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { pagePath } from '../../core/i18n/paths';
import { ScrollService } from '../../core/scroll/scroll.service';
import { isModifiedClick } from '../../shared/events';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  styleUrl: './site-footer.scss',
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  private readonly language = inject(LanguageService);
  private readonly scroll = inject(ScrollService);
  protected readonly t = this.language.t;
  protected readonly year = new Date().getFullYear();
  protected readonly imprintPath = computed(() => pagePath('imprint', this.language.lang()));
  protected readonly topHref = computed(() => `${this.language.path()}#top`);

  protected toTop(event: MouseEvent): void {
    if (isModifiedClick(event)) return;
    event.preventDefault();
    this.scroll.animateTo(0, this.language.page() === 'home' ? undefined : 600);
  }
}
