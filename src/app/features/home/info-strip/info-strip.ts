import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { SITE } from '../../../core/site';
import { Icon } from '../../../shared/ui/icon/icon';

/** Glas-Leiste unter dem Hero: Rolle, Stack, Profile */
@Component({
  selector: 'app-info-strip',
  imports: [Icon],
  templateUrl: './info-strip.html',
  styleUrl: './info-strip.scss',
})
export class InfoStrip {
  protected readonly t = inject(LanguageService).t;
  protected readonly site = SITE;
}
