import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';

@Component({
  selector: 'app-about',
  imports: [GlassCard, SectionKicker],
  template: `
    <section id="about" data-hub="1" aria-labelledby="about-heading">
      <app-glass-card>
        <app-section-kicker number="01" [label]="t().about.kicker" />
        <h2 id="about-heading">{{ t().about.heading }}</h2>
        <div class="columns">
          <p class="lead">{{ t().about.lead }}</p>
          <p class="body">{{ t().about.body }}</p>
        </div>
      </app-glass-card>
    </section>
  `,
  styleUrl: './about.scss',
})
export class About {
  protected readonly t = inject(LanguageService).t;
}
