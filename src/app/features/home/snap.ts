/** Lage einer Sektion, `top` gemessen vom Seitenanfang */
export interface SnapSection {
  top: number;
  height: number;
}

/**
 * Ziel für einen Sprung zur nächsten (dir 1) oder vorherigen (dir -1) Sektion, wie im Prototyp.
 * null heißt: nicht springen, normal scrollen. Das passiert, solange eine hohe Sektion noch nicht
 * ganz zu sehen war, und nach der letzten Sektion (dort folgt der Footer).
 */
export function snapTarget(
  sections: readonly SnapSection[],
  scrollY: number,
  viewport: number,
  dir: 1 | -1,
): number | null {
  if (!sections.length) return null;

  // Aktuelle Sektion: die letzte, deren Anfang im oberen Drittel oder darüber liegt
  let current = 0;
  sections.forEach((section, i) => {
    if (section.top <= scrollY + viewport * 0.35) current = i;
  });

  const top = sections[current].top - scrollY;
  const bottom = top + sections[current].height;
  if (dir > 0 && bottom > viewport + 4) return null;
  if (dir < 0 && top < -4) return null;

  const next = Math.max(0, Math.min(sections.length - 1, current + dir));
  if (next === current) return dir < 0 && scrollY > 2 ? 0 : null;
  if (next === 0) return 0;

  const target = sections[next];
  // Nach oben in eine hohe Sektion: an deren Ende landen, nicht am Anfang
  return dir < 0 && target.height > viewport ? target.top + target.height - viewport : target.top;
}

const KEYS: Record<string, 1 | -1> = {
  PageDown: 1,
  ArrowDown: 1,
  ' ': 1,
  PageUp: -1,
  ArrowUp: -1,
};

/** Richtung für eine Taste, Umschalt+Leertaste geht nach oben */
export function keyDirection(event: Pick<KeyboardEvent, 'key' | 'shiftKey'>): 1 | -1 | null {
  const dir = KEYS[event.key];
  if (!dir) return null;
  return event.key === ' ' && event.shiftKey ? -1 : dir;
}
