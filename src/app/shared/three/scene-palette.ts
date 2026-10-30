import { THEME_SURFACES, Theme } from '../../core/theme/color';

/**
 * Farben und Deckkraft der 3D-Szene je Theme.
 * Dunkel: leuchtende Linien und Punkte durch additive Überblendung, voller Sternenhimmel.
 * Hell: normale Überblendung (additiv wäre auf hellem Grund fast unsichtbar), dunklere Akzentfarbe,
 * weniger Deckkraft, nur wenige feine dunkle Sterne und sehr blasse Nebel.
 */
export interface ScenePalette {
  mode: Theme;
  /** Farbe des Nebels (Fog), gleich dem Seitenhintergrund */
  background: string;
  accent: string;
  blending: 'additive' | 'normal';
  lineOpacity: number;
  pointOpacity: number;
  routeOpacity: number;
  travelledOpacity: number;
  /** Wird mit den Sternfarben multipliziert */
  starTint: string;
  starOpacity: number;
  /** Die beiden großen Sternschichten (Milchstraße), nur im Dunkeln */
  denseStars: boolean;
  dustColor: string;
  dustOpacity: number;
  nebulaOpacity: number;
  pulseColor: string;
}

export function scenePalette(theme: Theme, accent: string): ScenePalette {
  const surfaces = THEME_SURFACES[theme];
  if (theme === 'dark') {
    return {
      mode: 'dark',
      background: surfaces.bg,
      accent,
      blending: 'additive',
      lineOpacity: 0.075,
      pointOpacity: 0.8,
      routeOpacity: 0.22,
      travelledOpacity: 0.9,
      starTint: '#ffffff',
      starOpacity: 1,
      denseStars: true,
      dustColor: '#dfe6ff',
      dustOpacity: 0.58,
      nebulaOpacity: 1,
      pulseColor: '#ffffff',
    };
  }
  return {
    mode: 'light',
    background: surfaces.bg,
    accent,
    blending: 'normal',
    lineOpacity: 0.11,
    pointOpacity: 0.5,
    routeOpacity: 0.16,
    travelledOpacity: 0.7,
    starTint: '#5b6272',
    starOpacity: 0.35,
    denseStars: false,
    dustColor: '#8a91a0',
    dustOpacity: 0.3,
    nebulaOpacity: 0.18,
    pulseColor: accent,
  };
}
