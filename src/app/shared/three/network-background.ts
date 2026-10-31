import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  InjectionToken,
  Injector,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { ScrollService } from '../../core/scroll/scroll.service';
import { ThemeService } from '../../core/theme/theme.service';
import { hubProgress } from './hub-progress';
import type { NetworkSceneOptions } from './network-scene';
import { ScenePalette, scenePalette } from './scene-palette';

/** Was die Komponente von der Szene braucht. In Tests durch eine Attrappe ersetzbar. */
export interface SceneHandle {
  setProgress(progress: number): void;
  setPalette(palette: ScenePalette): void;
  dispose(): void;
}

export type SceneFactory = (host: HTMLElement, options: NetworkSceneOptions) => SceneHandle;

/** Lädt three.js erst im Browser und in einem eigenen Chunk */
export const NETWORK_SCENE_LOADER = new InjectionToken<() => Promise<SceneFactory>>(
  'NETWORK_SCENE_LOADER',
  {
    providedIn: 'root',
    factory: () => () =>
      import('./network-scene').then(
        ({ NetworkScene }) =>
          (host: HTMLElement, options: NetworkSceneOptions) =>
            new NetworkScene(host, options),
      ),
  },
);

/** Ein Knoten je Sektion der Startseite, abwechselnd rechts und links */
const HUB_COUNT = 6;
export const HUB_SIDES: readonly number[] = Array.from({ length: HUB_COUNT }, (_, i) =>
  i % 2 ? -1 : 1,
);

/** Mobilgeräte bekommen weniger Sterne und eine begrenzte Pixel-Ratio */
const LOW_QUALITY_QUERY = '(max-width: 719.98px), (pointer: coarse)';

export function supportsWebGL(document: Document): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Fixierter 3D-Hintergrund der Startseite. Ohne WebGL bleibt der normale Hintergrund,
 * bei „Bewegung reduzieren“ gibt es ein ruhiges Standbild.
 */
@Component({
  selector: 'app-network-background',
  host: { 'aria-hidden': 'true' },
  template: '<div #stage class="stage"></div>',
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    .stage {
      position: absolute;
      inset: 0;
    }
  `,
})
export class NetworkBackground {
  private readonly document = inject(DOCUMENT);
  private readonly loader = inject(NETWORK_SCENE_LOADER);
  private readonly theme = inject(ThemeService);
  private readonly scroll = inject(ScrollService);
  private readonly injector = inject(Injector);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private scene?: SceneHandle;
  private destroyed = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.document.defaultView?.removeEventListener('resize', this.updateProgress);
      this.scene?.dispose();
    });
    // Erst nach dem ersten Zeichnen und wenn der Browser Luft hat, damit die Seite schnell da ist
    afterNextRender(() => this.whenIdle(() => void this.start()));
  }

  private whenIdle(callback: () => void): void {
    const win = this.document.defaultView;
    if (win && 'requestIdleCallback' in win) win.requestIdleCallback(callback, { timeout: 1500 });
    else setTimeout(callback, 0);
  }

  private async start(): Promise<void> {
    const win = this.document.defaultView;
    if (this.destroyed || !win || !supportsWebGL(this.document)) return;
    const animate = !this.scroll.reducedMotion();
    const quality = win.matchMedia?.(LOW_QUALITY_QUERY).matches ? 'low' : 'high';

    let factory: SceneFactory;
    try {
      factory = await this.loader();
    } catch {
      return;
    }
    if (this.destroyed) return;

    try {
      this.scene = factory(this.stage().nativeElement, {
        sides: HUB_SIDES,
        palette: this.currentPalette(),
        quality,
        animate,
      });
    } catch {
      // WebGL-Kontext nicht verfügbar: normaler Hintergrund bleibt
      return;
    }

    effect(() => this.scene?.setPalette(this.currentPalette()), { injector: this.injector });
    if (!animate) return;
    effect(
      () => {
        this.scroll.y();
        this.updateProgress();
      },
      { injector: this.injector },
    );
    win.addEventListener('resize', this.updateProgress, { passive: true });
  }

  private currentPalette(): ScenePalette {
    return scenePalette(this.theme.theme(), this.theme.palette().acc);
  }

  /** Bildschirmmitte relativ zu den Mittelpunkten der Sektionen -> Position der Kamera */
  private readonly updateProgress = () => {
    const win = this.document.defaultView;
    if (!win || !this.scene) return;
    const centers = [...this.document.querySelectorAll('[data-hub]')].map((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    this.scene.setProgress(hubProgress(centers, win.innerHeight / 2));
  };
}
