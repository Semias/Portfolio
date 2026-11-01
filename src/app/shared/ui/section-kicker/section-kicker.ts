import { Component, input } from '@angular/core';

/** Nummer, Linie und Name über einer Sektionsüberschrift, z. B. „01 —— Über mich“ */
@Component({
  selector: 'app-section-kicker',
  templateUrl: './section-kicker.html',
  styleUrl: './section-kicker.scss',
})
export class SectionKicker {
  readonly number = input.required<string>();
  readonly label = input.required<string>();
}
