import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';
import { Tag } from '../../../shared/ui/tag/tag';

@Component({
  selector: 'app-projects',
  imports: [GlassCard, SectionKicker, Tag],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  protected readonly t = inject(LanguageService).t;
}
