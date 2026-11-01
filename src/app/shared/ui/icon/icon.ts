import { Component, input } from '@angular/core';

export type IconName = 'sun' | 'moon' | 'mail' | 'arrow-left' | 'github' | 'linkedin';

/**
 * Inline-SVG mit currentColor, damit Icons die Theme-Farben übernehmen.
 * Rein dekorativ (aria-hidden): Die Beschriftung gehört an den Button oder Link drumherum.
 */
@Component({
  selector: 'app-icon',
  host: { 'aria-hidden': 'true', '[style.width.px]': 'size()', '[style.height.px]': 'size()' },
  styleUrl: './icon.scss',
  templateUrl: './icon.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(16);
}
