import { Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';
import { Lang } from '../../core/i18n/paths';
import { pageMeta } from '../../core/seo/seo.service';
import { LEGAL, LegalLine, LegalPageKey } from './legal-content';

/** Schlichte Textseite für Impressum und Datenschutz: kein 3D, keine Glas-Karte, keine Animation */
@Component({
  selector: 'app-legal-page',
  templateUrl: './legal.page.html',
  styleUrl: './legal.page.scss',
})
export class LegalPage {
  /** Aus den Routendaten (app.routes.ts) */
  readonly lang = input.required<Lang>();
  readonly page = input.required<LegalPageKey>();

  protected readonly doc = computed(() => LEGAL[this.page()][this.lang()]);

  constructor() {
    const t = inject(LanguageService).t;
    pageMeta(() => {
      const meta = t().meta;
      return this.page() === 'privacy'
        ? { title: meta.privacyTitle, description: meta.privacyDescription }
        : { title: meta.imprintTitle, description: meta.imprintDescription };
    });
  }

  protected isLink(line: LegalLine): line is { text: string; href: string } {
    return typeof line !== 'string';
  }
}
