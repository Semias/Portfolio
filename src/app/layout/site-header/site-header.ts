import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { Messages } from '../../core/i18n/messages';
import { pagePath } from '../../core/i18n/paths';
import { ScrollService } from '../../core/scroll/scroll.service';
import { ThemeService } from '../../core/theme/theme.service';
import { isModifiedClick } from '../../shared/events';
import { Icon } from '../../shared/ui/icon/icon';

/** Sektionen der Startseite in der Reihenfolge der Navigation */
export const SECTION_IDS = ['about', 'cv', 'work', 'writing', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, Icon],
  styleUrl: './site-header.scss',
  templateUrl: './site-header.html',
})
export class SiteHeader {
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);
  protected readonly scroll = inject(ScrollService);
  protected readonly theme = inject(ThemeService);
  protected readonly t = this.language.t;

  protected readonly homePath = computed(() => pagePath('home', this.language.lang()));
  protected readonly navItems = computed(() => {
    const nav: Messages['nav'] = this.t().nav;
    const home = this.homePath();
    return SECTION_IDS.map((id) => ({ id, label: nav[id], href: `${home}#${id}` }));
  });
  protected readonly isDark = computed(() => this.theme.theme() === 'dark');
  protected readonly themeLabel = computed(() =>
    this.isDark() ? this.t().header.toLight : this.t().header.toDark,
  );
  protected readonly switchTarget = this.language.switchTarget;
  protected readonly switchLabel = computed(
    () => `${this.t().header.switchLangShort}, ${this.t().header.switchLang}`,
  );
  /** Lesefortschritt nur auf Beitragsseiten */
  protected readonly showProgress = computed(() => this.language.page() === 'post');

  /** Auf der Startseite animiert zur Sektion scrollen, sonst dorthin navigieren */
  protected onNav(event: MouseEvent, id: SectionId): void {
    if (isModifiedClick(event)) return;
    event.preventDefault();
    if (this.language.page() === 'home' && this.scroll.scrollToId(id)) return;
    void this.router.navigateByUrl(`${this.homePath()}#${id}`);
  }

  protected onLogo(event: MouseEvent): void {
    if (isModifiedClick(event)) return;
    event.preventDefault();
    if (this.language.page() === 'home') this.scroll.animateTo(0);
    else void this.router.navigateByUrl(this.homePath());
  }
}
