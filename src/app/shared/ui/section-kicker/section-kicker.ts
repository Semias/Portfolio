import { Component, input } from '@angular/core';

/** Nummer, Linie und Name über einer Sektionsüberschrift, z. B. „01 —— Über mich“ */
@Component({
  selector: 'app-section-kicker',
  template: `
    <span class="number">{{ number() }}</span>
    <span class="line" aria-hidden="true"></span>
    <span>{{ label() }}</span>
  `,
  styleUrl: './section-kicker.scss',
})
export class SectionKicker {
  readonly number = input.required<string>();
  readonly label = input.required<string>();
}
