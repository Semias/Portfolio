import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { SITE } from '../../../core/site';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { Icon } from '../../../shared/ui/icon/icon';
import { PillButton } from '../../../shared/ui/pill-button.directive';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';

@Component({
  selector: 'app-contact',
  imports: [GlassCard, SectionKicker, PillButton, Icon],
  template: `
    <section id="contact" data-hub="5" aria-labelledby="contact-heading">
      <app-glass-card>
        <app-section-kicker number="05" [label]="t().contact.kicker" />
        <h2 id="contact-heading">{{ t().contact.heading }}</h2>
        <div class="actions">
          <a appPillButton="primary" [href]="'mailto:' + site.email"
            ><app-icon name="mail" [size]="20" />{{ t().contact.email }}</a
          >
          <a appPillButton [href]="site.github" target="_blank" rel="noreferrer"
            ><app-icon name="github" />GitHub</a
          >
          <a appPillButton [href]="site.linkedin" target="_blank" rel="noreferrer"
            ><app-icon name="linkedin" />LinkedIn</a
          >
        </div>
      </app-glass-card>
    </section>
  `,
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly t = inject(LanguageService).t;
  protected readonly site = SITE;
}
