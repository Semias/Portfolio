import { Directive, input } from '@angular/core';

/** Runder Button-Link. Styles in src/styles/_buttons.scss. */
@Directive({
  selector: 'a[appPillButton], button[appPillButton]',
  host: { class: 'pill', '[class.is-primary]': 'appPillButton() === "primary"' },
})
export class PillButton {
  readonly appPillButton = input<'primary' | 'secondary' | ''>('');
}
