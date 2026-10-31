import { Component } from '@angular/core';

/** Kleine Pille für Schlagworte */
@Component({
  selector: 'app-tag',
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-block;
      padding: 4px 10px;
      border: 1px solid var(--rule);
      border-radius: 999px;
      color: var(--mute2);
      font-size: 12px;
      line-height: 1.4;
      white-space: nowrap;
    }
  `,
})
export class Tag {}
