import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockMatchMedia } from '../../../testing/media';
import { ScrollService } from '../../core/scroll/scroll.service';
import { SNAP_POINTER_QUERY, SectionSnap } from './section-snap.directive';

@Component({
  hostDirectives: [SectionSnap],
  template: `
    <section data-hub="0"></section>
    <section data-hub="1"></section>
    <section data-hub="2"></section>
    <input />
    <button type="button">Button</button>
  `,
})
class Host {}

describe('SectionSnap', () => {
  let fixture: ComponentFixture<Host>;
  let scroll: ScrollService;
  let animate: ReturnType<typeof vi.spyOn>;

  async function setup(media: Record<string, boolean> = { [SNAP_POINTER_QUERY]: true }) {
    mockMatchMedia(media);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const sections = (fixture.nativeElement as HTMLElement).querySelectorAll('section');
    sections.forEach((section, i) => {
      section.getBoundingClientRect = () => ({ top: i * 1000 - window.scrollY }) as DOMRect;
      Object.defineProperty(section, 'offsetHeight', { configurable: true, value: 1000 });
    });
    scroll = TestBed.inject(ScrollService);
    animate = vi.spyOn(scroll, 'animateTo').mockReturnValue(1400);
  }

  function wheel(deltaY: number, init: WheelEventInit = {}) {
    const event = new WheelEvent('wheel', { deltaY, cancelable: true, ...init });
    window.dispatchEvent(event);
    return event;
  }

  function key(key: string, target: EventTarget = window, init: KeyboardEventInit = {}) {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true, ...init });
    target.dispatchEvent(event);
    return event;
  }

  afterEach(() => {
    fixture?.destroy();
    vi.restoreAllMocks();
  });

  it('jumps to the next section on wheel down', async () => {
    await setup();
    const event = wheel(120);
    expect(animate).toHaveBeenCalledWith(1000);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores tiny wheel movements and pinch zoom', async () => {
    await setup();
    expect(wheel(2).defaultPrevented).toBe(false);
    expect(wheel(120, { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(animate).not.toHaveBeenCalled();
  });

  it('swallows wheel events while a jump is running', async () => {
    await setup();
    vi.spyOn(scroll, 'isLocked').mockReturnValue(true);
    expect(wheel(120).defaultPrevented).toBe(true);
    expect(animate).not.toHaveBeenCalled();
  });

  it('jumps with the keyboard', async () => {
    await setup();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1000 });
    expect(key('PageDown').defaultPrevented).toBe(true);
    expect(animate).toHaveBeenLastCalledWith(2000);
    key('ArrowUp');
    expect(animate).toHaveBeenLastCalledWith(0);
    key(' ', window, { shiftKey: true });
    expect(animate).toHaveBeenCalledTimes(3);
  });

  it('leaves keys to inputs, buttons and shortcuts', async () => {
    await setup();
    const element = fixture.nativeElement as HTMLElement;
    key('ArrowDown', element.querySelector('input') as HTMLElement);
    key(' ', element.querySelector('button') as HTMLElement);
    key('PageDown', window, { ctrlKey: true });
    key('ArrowLeft');
    expect(animate).not.toHaveBeenCalled();
    // Pfeiltasten auf einem Button scrollen wie gewohnt seitenweise
    key('ArrowDown', element.querySelector('button') as HTMLElement);
    expect(animate).toHaveBeenCalledOnce();
  });

  it('scrolls normally on touch devices', async () => {
    await setup({ [SNAP_POINTER_QUERY]: false });
    expect(wheel(120).defaultPrevented).toBe(false);
    expect(key('PageDown').defaultPrevented).toBe(false);
    expect(animate).not.toHaveBeenCalled();
  });

  it('scrolls normally when reduced motion is requested', async () => {
    await setup({ [SNAP_POINTER_QUERY]: true, '(prefers-reduced-motion: reduce)': true });
    expect(wheel(120).defaultPrevented).toBe(false);
    expect(animate).not.toHaveBeenCalled();
  });

  it('stops listening when the page is left', async () => {
    await setup();
    fixture.destroy();
    wheel(120);
    expect(animate).not.toHaveBeenCalled();
  });
});
