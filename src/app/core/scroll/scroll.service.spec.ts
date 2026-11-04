import { TestBed } from '@angular/core/testing';
import { mockMatchMedia } from '../../../testing/media';
import {
  FINE_POINTER_QUERY,
  ScrollService,
  easeInOutCubic,
  navigationDuration,
  wheelPixels,
} from './scroll.service';

const REDUCED = '(prefers-reduced-motion: reduce)';

describe('ScrollService', () => {
  let frames: Map<number, FrameRequestCallback>;
  let lastFrame: number;
  let now: number;

  function setScroll(y: number, scrollHeight = 3000, clientHeight = 1000) {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: scrollHeight,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: clientHeight,
    });
  }

  function flushFrames(time: number) {
    now = time;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(time));
  }

  beforeEach(() => {
    frames = new Map();
    lastFrame = 0;
    now = 0;
    setScroll(0);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.set(++lastFrame, callback);
      return lastFrame;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => frames.delete(id));
    vi.spyOn(window.performance, 'now').mockImplementation(() => now);
    vi.spyOn(window, 'scrollTo').mockImplementation(((_x: number, y: number) =>
      setScroll(y)) as typeof window.scrollTo);
  });

  afterEach(() => vi.restoreAllMocks());

  it('eases in and out', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
    expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
  });

  it('takes longer for longer navigation jumps, capped at 2.6 s', () => {
    expect(navigationDuration(0)).toBe(1200);
    expect(navigationDuration(-800)).toBe(1400);
    expect(navigationDuration(100_000)).toBe(2600);
  });

  it('tracks position, compact state and reading progress', () => {
    mockMatchMedia();
    const service = TestBed.inject(ScrollService);
    expect(service.scrolled()).toBe(false);

    setScroll(1000);
    window.dispatchEvent(new Event('scroll'));
    flushFrames(16);

    expect(service.y()).toBe(1000);
    expect(service.scrolled()).toBe(true);
    expect(service.progress()).toBe(0.5);
  });

  it('animates to a target and locks section snapping meanwhile', () => {
    mockMatchMedia();
    const service = TestBed.inject(ScrollService);

    expect(service.animateTo(1000, 1000)).toBe(1000);
    expect(service.isLocked()).toBe(true);

    flushFrames(0);
    expect(window.scrollY).toBe(0);
    flushFrames(500);
    expect(window.scrollY).toBe(500);
    flushFrames(1000);
    expect(window.scrollY).toBe(1000);
    expect(frames.size).toBe(0);
  });

  it('jumps without animation when reduced motion is requested', () => {
    mockMatchMedia({ [REDUCED]: true });
    const service = TestBed.inject(ScrollService);
    expect(service.reducedMotion()).toBe(true);

    expect(service.animateTo(800)).toBe(0);
    expect(window.scrollY).toBe(800);
    expect(frames.size).toBe(0);
    expect(service.isLocked()).toBe(false);
  });

  it('follows changes of the reduced-motion setting', () => {
    const media = mockMatchMedia();
    const service = TestBed.inject(ScrollService);
    media.set(REDUCED, true);
    expect(service.reducedMotion()).toBe(true);
  });

  it('scrolls to an element by id', () => {
    mockMatchMedia();
    const service = TestBed.inject(ScrollService);
    const target = document.createElement('section');
    target.id = 'cv';
    target.getBoundingClientRect = () => ({ top: 1200 }) as DOMRect;
    document.body.append(target);

    expect(service.scrollToId('cv')).toBe(true);
    flushFrames(0);
    flushFrames(5000);
    expect(window.scrollY).toBe(1200);
    expect(service.scrollToId('missing')).toBe(false);
    target.remove();
  });

  describe('smooth wheel', () => {
    function wheel(deltaY: number, init: WheelEventInit = {}, target: EventTarget = window) {
      const event = new WheelEvent('wheel', { deltaY, cancelable: true, bubbles: true, ...init });
      target.dispatchEvent(event);
      return event;
    }

    /** Frames im 60-fps-Takt, bis nichts mehr läuft */
    function glide(from = 16): number[] {
      const seen: number[] = [];
      for (let time = from; frames.size && time < 10_000; time += 16) {
        flushFrames(time);
        seen.push(window.scrollY);
      }
      return seen;
    }

    function setup(media: Record<string, boolean> = { [FINE_POINTER_QUERY]: true }) {
      mockMatchMedia(media);
      return TestBed.inject(ScrollService);
    }

    it('glides to the target instead of jumping there', () => {
      setup();
      expect(wheel(100).defaultPrevented).toBe(true);
      expect(window.scrollY).toBe(0);

      const seen = glide();
      expect(seen[0]).toBeGreaterThan(0);
      expect(seen[0]).toBeLessThan(20);
      expect(seen.filter((y) => y > 0 && y < 100).length).toBeGreaterThan(10);
      expect(window.scrollY).toBe(100);
      expect(frames.size).toBe(0);
    });

    it('adds up wheel steps and stays within the page', () => {
      setup();
      wheel(100);
      flushFrames(16);
      wheel(100);
      glide(32);
      expect(window.scrollY).toBe(200);

      wheel(5000);
      glide();
      expect(window.scrollY).toBe(2000);
    });

    it('converts lines and pages to pixels', () => {
      expect(wheelPixels({ deltaY: 3, deltaMode: 1 }, 900)).toBe(100);
      expect(wheelPixels({ deltaY: -1, deltaMode: 2 }, 900)).toBe(-900);
      expect(wheelPixels({ deltaY: 42, deltaMode: 0 }, 900)).toBe(42);
    });

    it('leaves zoom, sideways scrolling and the page edges to the browser', () => {
      setup();
      expect(wheel(100, { ctrlKey: true }).defaultPrevented).toBe(false);
      expect(wheel(100, { shiftKey: true }).defaultPrevented).toBe(false);
      expect(wheel(10, { deltaX: 100 }).defaultPrevented).toBe(false);
      expect(wheel(-100).defaultPrevented).toBe(false);
      expect(frames.size).toBe(0);
    });

    it('scrolls natively on touch devices and with reduced motion', () => {
      setup({ [FINE_POINTER_QUERY]: false });
      expect(wheel(100).defaultPrevented).toBe(false);
      TestBed.resetTestingModule();
      setup({ [FINE_POINTER_QUERY]: true, [REDUCED]: true });
      expect(wheel(100).defaultPrevented).toBe(false);
      expect(frames.size).toBe(0);
    });

    it('leaves the wheel to elements that scroll themselves', () => {
      setup();
      const box = document.createElement('div');
      box.style.overflowY = 'auto';
      Object.defineProperty(box, 'scrollHeight', { configurable: true, value: 500 });
      Object.defineProperty(box, 'clientHeight', { configurable: true, value: 200 });
      document.body.append(box);

      expect(wheel(100, {}, box).defaultPrevented).toBe(false);
      // Ganz unten angekommen, scrollt wieder die Seite
      Object.defineProperty(box, 'scrollTop', { configurable: true, value: 300 });
      expect(wheel(100, {}, box).defaultPrevented).toBe(true);
      box.remove();
    });

    it('lets interceptors such as section snapping decide first', () => {
      const service = setup();
      const release = service.interceptWheel(() => true);
      expect(wheel(100).defaultPrevented).toBe(true);
      expect(frames.size).toBe(0);

      release();
      wheel(100);
      expect(frames.size).toBe(1);
    });

    it('swallows the wheel while a jump is running', () => {
      const service = setup();
      service.lock(1000);
      expect(wheel(100).defaultPrevented).toBe(true);
      expect(frames.size).toBe(0);
    });

    it('gives way to animated jumps and to other scrolling', () => {
      const service = setup();
      wheel(500);
      flushFrames(16);
      service.animateTo(1000, 1000);
      // Nur noch der Sprung läuft, das Ausgleiten ist abgebrochen
      expect(frames.size).toBe(1);
      flushFrames(2000);
      expect(window.scrollY).toBe(1000);
      expect(frames.size).toBe(0);

      vi.spyOn(service, 'isLocked').mockReturnValue(false);
      wheel(500);
      flushFrames(16);
      // Scrollbalken, Tastatur oder Router verschieben die Seite: Das Mausrad gibt ab
      setScroll(300);
      glide(32);
      expect(window.scrollY).toBe(300);
    });
  });
});
