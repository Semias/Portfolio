import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { FINE_POINTER_QUERY, ScrollService } from '../../core/scroll/scroll.service';
import { keyDirection, snapTarget } from './snap';

/** Nur mit Maus oder Touchpad als Hauptzeiger, auf Touch-Geräten wird normal gescrollt */
export const SNAP_POINTER_QUERY = FINE_POINTER_QUERY;

/** In diesen Elementen gehören die Tasten dem Element, nicht dem Sektions-Springen */
const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const ACTIVATABLE = 'button, a[href], summary, [role="button"], [role="checkbox"], label';

/**
 * Mausrad, Pfeiltasten, Bild auf/ab und Leertaste springen animiert von Sektion ([data-hub]) zu
 * Sektion. Nur auf dem Desktop und nicht bei „Bewegung reduzieren“ (Entscheidung C).
 * Springt es nicht, z. B. innerhalb einer hohen Sektion, scrollt das Mausrad weich (ScrollService).
 */
@Directive({ selector: '[appSectionSnap]' })
export class SectionSnap {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly scroll = inject(ScrollService);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const win = this.document.defaultView;
      if (!win) return;
      const releaseWheel = this.scroll.interceptWheel(this.onWheel);
      win.addEventListener('keydown', this.onKey);
      destroyRef.onDestroy(() => {
        releaseWheel();
        win.removeEventListener('keydown', this.onKey);
      });
    });
  }

  private enabled(): boolean {
    const pointer = this.document.defaultView?.matchMedia?.(SNAP_POINTER_QUERY);
    return !!pointer?.matches && !this.scroll.reducedMotion();
  }

  /** true: Das Mausrad springt (oder ein Sprung läuft noch) und scrollt deshalb nicht */
  private readonly onWheel = (event: WheelEvent): boolean => {
    if (!this.enabled() || event.ctrlKey || Math.abs(event.deltaY) < 4) return false;
    // Während eines Sprungs schluckt das Mausrad weitere Ausschläge (Touchpad-Nachlauf)
    return this.scroll.isLocked() || this.jump(event.deltaY > 0 ? 1 : -1);
  };

  private readonly onKey = (event: KeyboardEvent) => {
    if (!this.enabled() || event.defaultPrevented) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(EDITABLE)) return;
    if (event.key === ' ' && target?.closest(ACTIVATABLE)) return;
    const dir = keyDirection(event);
    if (!dir) return;
    if (this.scroll.isLocked() || this.jump(dir)) event.preventDefault();
  };

  private jump(dir: 1 | -1): boolean {
    const win = this.document.defaultView;
    if (!win) return false;
    const scrollY = win.scrollY;
    const sections = [...this.host.nativeElement.querySelectorAll<HTMLElement>('[data-hub]')].map(
      (section) => ({
        top: section.getBoundingClientRect().top + scrollY,
        height: section.offsetHeight,
      }),
    );
    const target = snapTarget(sections, scrollY, win.innerHeight, dir);
    if (target === null) return false;
    this.scroll.animateTo(target);
    return true;
  }
}
