import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

/** Dauer eines Sprungs zwischen zwei Sektionen (wie im Design) */
export const SNAP_DURATION_MS = 1400;

/** Ab dieser Scroll-Position wird der Header kompakt */
const SCROLLED_THRESHOLD = 8;

/** Maus oder Touchpad als Hauptzeiger. Auf Touch-Geräten bleibt das Scrollen nativ. */
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/** Weiches Mausrad: Anteil des Restwegs, der je Frame (bei 60 fps) zurückgelegt wird */
export const WHEEL_EASE = 0.075;

const FRAME_MS = 1000 / 60;

/** Meldet der Browser das Mausrad in Zeilen: eine Raste (3 Zeilen) wie in Chrome 100 px */
const WHEEL_LINE_PX = 100 / 3;

/** Mausrad-Ausschlag in Pixeln. deltaY vor deltaMode lesen, dann liefert auch Firefox Pixel. */
export function wheelPixels(event: Pick<WheelEvent, 'deltaY' | 'deltaMode'>, page: number): number {
  const delta = event.deltaY;
  if (event.deltaMode === 1) return delta * WHEEL_LINE_PX;
  if (event.deltaMode === 2) return delta * page;
  return delta;
}

/** Entscheidet vor dem weichen Scrollen über ein Mausrad-Ereignis. true heißt: übernommen. */
export type WheelInterceptor = (event: WheelEvent) => boolean;

/** Weiches Ein- und Ausschwingen (easeInOutCubic) */
export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Dauer für Navigations-Sprünge: länger bei weiten Wegen, höchstens 2,6 s */
export function navigationDuration(distance: number): number {
  return Math.min(2600, 1200 + Math.abs(distance) * 0.25);
}

/**
 * Scroll-Position, Lesefortschritt und animiertes Scrollen.
 * Das Mausrad scrollt mit Maus oder Touchpad weich nach, statt in Stufen zu springen.
 * Bei „Bewegung reduzieren“ springen alle Animationen sofort ans Ziel und das Mausrad bleibt nativ.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly position = signal(0);
  private readonly ratio = signal(0);
  private readonly reduced = signal(false);
  private readonly wheelInterceptors = new Set<WheelInterceptor>();
  private finePointer?: MediaQueryList;
  private animationFrame = 0;
  private measureFrame = 0;
  private lockedUntil = 0;
  /** Weiches Mausrad: Ziel, ungerundete Position, scrollY nach dem letzten eigenen Schritt */
  private wheelFrame = 0;
  private wheelTarget = 0;
  private wheelY = 0;
  private wheelSetY = 0;
  private wheelTime = 0;

  readonly y = this.position.asReadonly();
  readonly scrolled = computed(() => this.position() > SCROLLED_THRESHOLD);
  /** Anteil der Seite, der schon gescrollt ist (0–1) */
  readonly progress = this.ratio.asReadonly();
  readonly reducedMotion = this.reduced.asReadonly();

  constructor() {
    if (!this.isBrowser || !this.window) return;
    const win = this.window;
    const onScroll = () => this.scheduleMeasure();
    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', onScroll, { passive: true });
    win.addEventListener('wheel', this.onWheel, { passive: false });

    const motion = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMotion = (event: MediaQueryListEvent) => this.reduced.set(event.matches);
    if (motion) {
      this.reduced.set(motion.matches);
      motion.addEventListener('change', onMotion);
    }
    this.finePointer = win.matchMedia?.(FINE_POINTER_QUERY);

    this.measure();
    inject(DestroyRef).onDestroy(() => {
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', onScroll);
      win.removeEventListener('wheel', this.onWheel);
      motion?.removeEventListener('change', onMotion);
      win.cancelAnimationFrame(this.animationFrame);
      win.cancelAnimationFrame(this.measureFrame);
      this.stopWheel();
    });
  }

  /**
   * `handler` entscheidet vor dem weichen Scrollen über jedes Mausrad-Ereignis, z. B. das
   * Sektions-Springen. Liefert er true, scrollt das Mausrad nicht. Gibt die Abmeldung zurück.
   */
  interceptWheel(handler: WheelInterceptor): () => void {
    this.wheelInterceptors.add(handler);
    return () => this.wheelInterceptors.delete(handler);
  }

  /** Scrollt animiert zu `top` (px vom Seitenanfang). Gibt die tatsächliche Dauer zurück. */
  animateTo(top: number, duration = SNAP_DURATION_MS): number {
    const win = this.window;
    if (!win) return 0;
    win.cancelAnimationFrame(this.animationFrame);
    this.stopWheel();
    const from = win.scrollY;
    const distance = top - from;

    if (this.reduced() || duration <= 0 || Math.abs(distance) < 1) {
      win.scrollTo(0, top);
      this.measure();
      return 0;
    }

    this.lock(duration + 150);
    const start = win.performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      win.scrollTo(0, from + distance * easeInOutCubic(k));
      if (k < 1) this.animationFrame = win.requestAnimationFrame(step);
    };
    this.animationFrame = win.requestAnimationFrame(step);
    return duration;
  }

  /** Scrollt animiert zum Element mit der ID `id`. Liefert false, wenn es das Element nicht gibt. */
  scrollToId(id: string): boolean {
    const element = this.document.getElementById(id);
    if (!element || !this.window) return false;
    const top = element.getBoundingClientRect().top + this.window.scrollY;
    this.animateTo(top, navigationDuration(top - this.window.scrollY));
    return true;
  }

  /** Solange gesperrt, ignoriert das Sektions-Springen weitere Mausrad- und Tastatureingaben */
  lock(ms: number): void {
    this.lockedUntil = Math.max(this.lockedUntil, Date.now() + ms);
  }

  isLocked(): boolean {
    return Date.now() < this.lockedUntil;
  }

  private readonly onWheel = (event: WheelEvent) => {
    for (const intercept of this.wheelInterceptors) {
      if (intercept(event)) {
        event.preventDefault();
        return;
      }
    }
    this.smoothWheel(event);
  };

  /** Sammelt den Ausschlag im Ziel, die Seite gleitet dann Frame für Frame dorthin */
  private smoothWheel(event: WheelEvent): void {
    const win = this.window;
    if (!win || this.reduced() || !this.finePointer?.matches || event.defaultPrevented) return;
    // Zoomen und seitliches Scrollen bleiben beim Browser
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const delta = wheelPixels(event, win.innerHeight);
    if (!delta) return;
    // Während eines Sprungs nicht dagegen anscrollen
    if (this.isLocked()) {
      event.preventDefault();
      return;
    }
    if (canScrollInside(event.target, delta, win)) return;

    const base = this.wheelFrame ? this.wheelTarget : win.scrollY;
    const target = Math.min(this.maxScroll(), Math.max(0, base + delta));
    // Am Seitenanfang oder -ende bleibt es beim Browser (z. B. Gummiband-Effekt)
    if (!this.wheelFrame && Math.abs(target - win.scrollY) < 1) return;

    event.preventDefault();
    this.wheelTarget = target;
    if (!this.wheelFrame) {
      this.wheelY = this.wheelSetY = win.scrollY;
      this.wheelTime = 0;
      this.wheelFrame = win.requestAnimationFrame(this.wheelStep);
    }
  }

  private readonly wheelStep = (now: number) => {
    const win = this.window;
    if (!win) return;
    // Hat inzwischen etwas anderes gescrollt (Scrollbalken, Tastatur, Router), gibt das Mausrad ab
    if (Math.abs(win.scrollY - this.wheelSetY) > 2) {
      this.wheelFrame = 0;
      return;
    }
    // Gleich schnell bei 60 und 144 Hz, nach einem Hänger kein Riesensprung
    const elapsed = this.wheelTime ? Math.min(100, Math.max(0, now - this.wheelTime)) : FRAME_MS;
    this.wheelTime = now;
    this.wheelY +=
      (this.wheelTarget - this.wheelY) * (1 - Math.pow(1 - WHEEL_EASE, elapsed / FRAME_MS));
    const done = Math.abs(this.wheelTarget - this.wheelY) < 0.5;
    if (done) this.wheelY = this.wheelTarget;

    win.scrollTo(0, this.wheelY);
    this.wheelSetY = win.scrollY;
    this.wheelFrame = done ? 0 : win.requestAnimationFrame(this.wheelStep);
  };

  private stopWheel(): void {
    if (!this.wheelFrame) return;
    this.window?.cancelAnimationFrame(this.wheelFrame);
    this.wheelFrame = 0;
  }

  private maxScroll(): number {
    const element = this.document.scrollingElement ?? this.document.documentElement;
    return Math.max(0, element.scrollHeight - element.clientHeight);
  }

  private scheduleMeasure(): void {
    if (this.measureFrame || !this.window) return;
    this.measureFrame = this.window.requestAnimationFrame(() => {
      this.measureFrame = 0;
      this.measure();
    });
  }

  private measure(): void {
    const win = this.window;
    if (!win) return;
    const max = this.maxScroll();
    const y = win.scrollY;
    this.position.set(y);
    this.ratio.set(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
  }
}

/** Kann ein Element zwischen Ziel und Seite selbst in diese Richtung scrollen, gehört ihm das Mausrad */
function canScrollInside(target: EventTarget | null, delta: number, win: Window): boolean {
  const root = win.document.documentElement;
  for (let el = target instanceof Element ? target : null; el; el = el.parentElement) {
    if (el === root || el === win.document.body) return false;
    if (el.scrollHeight <= el.clientHeight) continue;
    const overflow = win.getComputedStyle(el).overflowY;
    if (overflow !== 'auto' && overflow !== 'scroll') continue;
    const room = delta > 0 ? el.scrollHeight - el.clientHeight - el.scrollTop : el.scrollTop;
    if (room > 1) return true;
  }
  return false;
}
