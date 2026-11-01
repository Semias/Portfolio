import { Component, inject, input } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { SITE } from '../../../core/site';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { Icon } from '../../../shared/ui/icon/icon';
import { PillButton } from '../../../shared/ui/pill-button.directive';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';

@Component({
  selector: 'app-contact',
  imports: [GlassCard, SectionKicker, PillButton, Icon],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  /** Nummer der Sektion, hängt davon ab, ob der Blog davor steht */
  readonly number = input('05');
  protected readonly t = inject(LanguageService).t;
  protected readonly site = SITE;
}
