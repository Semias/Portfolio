import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaController, mockMatchMedia } from '../../../testing/media';
import { DEFAULT_ACCENT, accentPalette } from '../../core/theme/color';
import { ThemeService } from '../../core/theme/theme.service';
import {
  HUB_SIDES,
  NETWORK_SCENE_LOADER,
  NetworkBackground,
  SceneHandle,
  supportsWebGL,
} from './network-background';
import type { NetworkSceneOptions } from './network-scene';
import { scenePalette } from './scene-palette';

@Component({
  imports: [NetworkBackground],
  template: `
    <app-network-background />
    <section data-hub="0"></section>
    <section data-hub="1"></section>
  `,
})
class Host {}

describe('NetworkBackground', () => {
  let media: MediaController;
  let handle: { [K in keyof SceneHandle]: ReturnType<typeof vi.fn> };
  let created: { host: HTMLElement; options: NetworkSceneOptions }[];
  let loader: ReturnType<typeof vi.fn>;
  let fixture: ComponentFixture<Host>;

  function setup(
    options: { webgl?: boolean; media?: Record<string, boolean>; factoryThrows?: boolean } = {},
  ) {
    localStorage.clear();
    media = mockMatchMedia(options.media);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() =>
      options.webgl === false ? null : {}) as never);
    handle = { setProgress: vi.fn(), setPalette: vi.fn(), dispose: vi.fn() };
    created = [];
    loader = vi.fn(async () => (host: HTMLElement, sceneOptions: NetworkSceneOptions) => {
      if (options.factoryThrows) throw new Error('no context');
      created.push({ host, options: sceneOptions });
      return handle;
    });
    TestBed.configureTestingModule({
      providers: [{ provide: NETWORK_SCENE_LOADER, useValue: loader }],
    });
  }

  /** Erstes Zeichnen, Leerlauf-Callback und das Laden der Szene abwarten */
  async function render() {
    fixture = TestBed.createComponent(Host);
    for (let i = 0; i < 3; i++) {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  function sectionAt(index: number, top: number, height: number) {
    const section = fixture.nativeElement.querySelectorAll('section')[index] as HTMLElement;
    section.getBoundingClientRect = () => ({ top, height }) as DOMRect;
  }

  afterEach(() => vi.restoreAllMocks());

  it('creates the scene with one node per section in the theme palette', async () => {
    setup();
    await render();
    expect(loader).toHaveBeenCalledOnce();
    expect(created).toHaveLength(1);
    const { host, options } = created[0];
    expect(host.classList.contains('stage')).toBe(true);
    expect(options.sides).toEqual(HUB_SIDES);
    expect(HUB_SIDES).toEqual([1, -1, 1, -1, 1, -1]);
    expect(options.palette).toEqual(
      scenePalette('dark', accentPalette('dark', DEFAULT_ACCENT).acc),
    );
    expect(options.quality).toBe('high');
    expect(options.animate).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('app-network-background')
        ?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('passes theme and accent changes to the scene', async () => {
    setup();
    await render();
    const theme = TestBed.inject(ThemeService);

    theme.toggleTheme();
    TestBed.tick();
    expect(handle.setPalette).toHaveBeenLastCalledWith(
      scenePalette('light', accentPalette('light', DEFAULT_ACCENT).acc),
    );

    theme.setAccent('red');
    TestBed.tick();
    expect(handle.setPalette).toHaveBeenLastCalledWith(
      scenePalette('light', accentPalette('light', 'red').acc),
    );
  });

  it('moves the camera with the scroll position', async () => {
    setup();
    await render();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    sectionAt(0, -400, 800); // Mitte bei 0
    sectionAt(1, 400, 800); // Mitte bei 800

    window.dispatchEvent(new Event('resize'));
    expect(handle.setProgress).toHaveBeenLastCalledWith(0.5);
  });

  it('shows a still image without progress updates when motion is reduced', async () => {
    setup({ media: { '(prefers-reduced-motion: reduce)': true } });
    await render();
    expect(created[0].options.animate).toBe(false);
    window.dispatchEvent(new Event('resize'));
    expect(handle.setProgress).not.toHaveBeenCalled();
  });

  it('uses the low quality setting on small or touch screens', async () => {
    setup({ media: { '(max-width: 719.98px), (pointer: coarse)': true } });
    await render();
    expect(created[0].options.quality).toBe('low');
    expect(media).toBeDefined();
  });

  it('keeps the normal background without WebGL', async () => {
    setup({ webgl: false });
    await render();
    expect(loader).not.toHaveBeenCalled();
  });

  it('survives a scene that cannot be created', async () => {
    setup({ factoryThrows: true });
    await render();
    expect(created).toHaveLength(0);
    fixture.destroy();
  });

  it('disposes the scene when the page is left', async () => {
    setup();
    await render();
    fixture.destroy();
    expect(handle.dispose).toHaveBeenCalledOnce();
  });

  it('detects WebGL support', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) =>
      type === 'webgl' ? {} : null) as never);
    expect(supportsWebGL(document)).toBe(true);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => {
      throw new Error('blocked');
    }) as never);
    expect(supportsWebGL(document)).toBe(false);
  });
});
