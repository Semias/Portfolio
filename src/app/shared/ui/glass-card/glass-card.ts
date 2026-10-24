import { Component } from '@angular/core';

/** Halbtransparente Karte über dem 3D-Hintergrund */
@Component({
  selector: 'app-glass-card',
  template: '<ng-content />',
  styleUrl: './glass-card.scss',
})
export class GlassCard {}
