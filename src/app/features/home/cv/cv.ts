import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';

@Component({
  selector: 'app-cv',
  imports: [GlassCard, SectionKicker],
  templateUrl: './cv.html',
  styleUrl: './cv.scss',
})
export class Cv {
  protected readonly t = inject(LanguageService).t;
}
