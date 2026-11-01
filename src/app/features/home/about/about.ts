import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';

@Component({
  selector: 'app-about',
  imports: [GlassCard, SectionKicker],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly t = inject(LanguageService).t;
}
