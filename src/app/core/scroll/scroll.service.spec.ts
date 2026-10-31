import { TestBed } from '@angular/core/testing';
import { mockMatchMedia } from '../../../testing/media';
import { ScrollService, easeInOutCubic, navigationDuration } from './scroll.service';

const REDUCED = '(prefers-reduced-motion: reduce)';

describe('ScrollService', () => {
  let frames: FrameRequestCallback[];
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
    const pending = frames;
    frames = [];
    pending.forEach((callback) => callback(time));
  }

  beforeEach(() => {
    frames = [];
    now = 0;
    setScroll(0);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
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
    expect(frames).toHaveLength(0);
  });

  it('jumps without animation when reduced motion is requested', () => {
    mockMatchMedia({ [REDUCED]: true });
    const service = TestBed.inject(ScrollService);
    expect(service.reducedMotion()).toBe(true);

    expect(service.animateTo(800)).toBe(0);
    expect(window.scrollY).toBe(800);
    expect(frames).toHaveLength(0);
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
});
