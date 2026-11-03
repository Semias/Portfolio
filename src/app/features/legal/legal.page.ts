import { Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';
import { Lang } from '../../core/i18n/paths';
import { pageMeta } from '../../core/seo/seo.service';
import { IMPRINT, LegalLine, PRIVACY } from './legal-content';

export type LegalPageKey = 'imprint' | 'privacy';

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

  protected readonly doc = computed(
    () => (this.page() === 'privacy' ? PRIVACY : IMPRINT)[this.lang()],
  );

  constructor() {
    const t = inject(LanguageService).t;
    pageMeta(() =>
      this.page() === 'privacy'
        ? { title: t().meta.privacyTitle, description: t().meta.privacyDescription }
        : { title: t().meta.imprintTitle, description: t().meta.imprintDescription },
    );
  }

  protected isLink(line: LegalLine): line is { text: string; href: string } {
    return typeof line !== 'string';
  }
}
