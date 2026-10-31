import { Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';
import { Lang } from '../../core/i18n/paths';
import { pageMeta } from '../../core/seo/seo.service';
import { LEGAL, LegalKind, LegalLine } from './legal-content';

/** Schlichte Textseite für Impressum und Datenschutz: kein 3D, keine Glas-Karte, keine Animation */
@Component({
  selector: 'app-legal-page',
  template: `
    <article class="legal" aria-labelledby="legal-title">
      <h1 id="legal-title">{{ doc().heading }}</h1>
      @for (section of doc().sections; track section.heading) {
        <section>
          <h2>{{ section.heading }}</h2>
          <p>
            @for (line of section.lines; track $index) {
              @if (isLink(line)) {
                <a [href]="line.href">{{ line.text }}</a>
              } @else {
                {{ line }}
              }
              @if (!$last) {
                <br />
              }
            }
          </p>
        </section>
      }
    </article>
  `,
  styleUrl: './legal.page.scss',
})
export class LegalPage {
  /** Aus den Routendaten (app.routes.ts) */
  readonly page = input.required<LegalKind>();
  readonly lang = input.required<Lang>();

  protected readonly doc = computed(() => LEGAL[this.page()][this.lang()]);

  constructor() {
    const t = inject(LanguageService).t;
    pageMeta(() =>
      this.page() === 'imprint'
        ? { title: t().meta.imprintTitle, description: t().meta.imprintDescription }
        : { title: t().meta.privacyTitle, description: t().meta.privacyDescription },
    );
  }

  protected isLink(line: LegalLine): line is { text: string; href: string } {
    return typeof line !== 'string';
  }
}
