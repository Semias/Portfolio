import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { SITE } from '../../../core/site';
import { Icon } from '../../../shared/ui/icon/icon';

/** Glas-Leiste unter dem Hero: Rolle, Stack, Profile */
@Component({
  selector: 'app-info-strip',
  imports: [Icon],
  template: `
    <div class="strip">
      <span>{{ t().info.role }}</span>
      <span class="mark" aria-hidden="true"></span>
      <span>{{ t().info.stack }}</span>
      <span class="mark" aria-hidden="true"></span>
      <span class="profiles">
        <a [href]="site.github" target="_blank" rel="noreferrer"
          ><app-icon name="github" [size]="14" />GitHub</a
        >
        <span class="slash" aria-hidden="true"></span>
        <a [href]="site.linkedin" target="_blank" rel="noreferrer"
          ><app-icon name="linkedin" [size]="14" />LinkedIn</a
        >
      </span>
    </div>
  `,
  styleUrl: './info-strip.scss',
})
export class InfoStrip {
  protected readonly t = inject(LanguageService).t;
  protected readonly site = SITE;
}
