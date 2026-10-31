import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';

@Component({
  selector: 'app-cv',
  imports: [GlassCard, SectionKicker],
  template: `
    <section id="cv" data-hub="2" aria-labelledby="cv-heading">
      <app-glass-card>
        <app-section-kicker number="02" [label]="t().cv.kicker" />
        <h2 id="cv-heading">{{ t().cv.heading }}</h2>
        <ol class="timeline">
          @for (entry of t().cv.entries; track entry.from; let first = $first) {
            <li [class.is-current]="first">
              <span class="dot" aria-hidden="true"></span>
              <p class="period">{{ entry.from }} → {{ entry.to ?? t().cv.now }}</p>
              <h3>{{ entry.title }}</h3>
              <p class="company">{{ entry.company }}</p>
              <p class="text">{{ entry.text }}</p>
            </li>
          }
        </ol>
      </app-glass-card>
    </section>
  `,
  styleUrl: './cv.scss',
})
export class Cv {
  protected readonly t = inject(LanguageService).t;
}
