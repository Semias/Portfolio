import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';
import { Tag } from '../../../shared/ui/tag/tag';

@Component({
  selector: 'app-projects',
  imports: [GlassCard, SectionKicker, Tag],
  template: `
    <section id="work" data-hub="3" aria-labelledby="work-heading">
      <app-glass-card>
        <app-section-kicker number="03" [label]="t().work.kicker" />
        <h2 id="work-heading">{{ t().work.heading }}</h2>
        <ol class="projects">
          @for (project of t().work.projects; track project.title; let i = $index) {
            <li>
              <span class="number">{{ (i + 1).toString().padStart(2, '0') }}</span>
              <div class="body">
                <h3>{{ project.title }}</h3>
                <p>{{ project.text }}</p>
              </div>
              <app-tag class="tag">{{ project.tag }}</app-tag>
            </li>
          }
        </ol>
      </app-glass-card>
    </section>
  `,
  styleUrl: './projects.scss',
})
export class Projects {
  protected readonly t = inject(LanguageService).t;
}
