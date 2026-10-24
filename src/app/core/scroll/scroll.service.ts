import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

/** Dauer eines Sprungs zwischen zwei Sektionen (wie im Design) */
export const SNAP_DURATION_MS = 1400;

/** Ab dieser Scroll-Position wird der Header kompakt */
const SCROLLED_THRESHOLD = 8;

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
 * Bei „Bewegung reduzieren“ springen alle Animationen sofort ans Ziel.
 */
@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly position = signal(0);
  private readonly ratio = signal(0);
  private readonly reduced = signal(false);
  private animationFrame = 0;
  private measureFrame = 0;
  private lockedUntil = 0;

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

    const motion = win.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMotion = (event: MediaQueryListEvent) => this.reduced.set(event.matches);
    if (motion) {
      this.reduced.set(motion.matches);
      motion.addEventListener('change', onMotion);
    }

    this.measure();
    inject(DestroyRef).onDestroy(() => {
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', onScroll);
      motion?.removeEventListener('change', onMotion);
      win.cancelAnimationFrame(this.animationFrame);
      win.cancelAnimationFrame(this.measureFrame);
    });
  }

  /** Scrollt animiert zu `top` (px vom Seitenanfang). Gibt die tatsächliche Dauer zurück. */
  animateTo(top: number, duration = SNAP_DURATION_MS): number {
    const win = this.window;
    if (!win) return 0;
    win.cancelAnimationFrame(this.animationFrame);
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
    const element = this.document.scrollingElement ?? this.document.documentElement;
    const max = element.scrollHeight - element.clientHeight;
    const y = win.scrollY;
    this.position.set(y);
    this.ratio.set(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
  }
}
