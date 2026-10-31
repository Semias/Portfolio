import { keyDirection, snapTarget } from './snap';

describe('snapTarget', () => {
  const vh = 1000;
  // Hero (kürzer als der Bildschirm), drei volle Sektionen, eine hohe Sektion
  const sections = [
    { top: 0, height: 820 },
    { top: 1000, height: 1000 },
    { top: 2000, height: 1000 },
    { top: 3000, height: 1600 },
  ];

  it('jumps from section to section', () => {
    expect(snapTarget(sections, 0, vh, 1)).toBe(1000);
    expect(snapTarget(sections, 1000, vh, 1)).toBe(2000);
    expect(snapTarget(sections, 2000, vh, -1)).toBe(1000);
    expect(snapTarget(sections, 1000, vh, -1)).toBe(0);
  });

  it('counts a section as current once its top is in the upper third', () => {
    // Bei 600 ist noch der Hero aktuell, bei 700 schon „Über mich“, das aber noch nicht ganz zu sehen ist
    expect(snapTarget(sections, 600, vh, 1)).toBe(1000);
    expect(snapTarget(sections, 700, vh, 1)).toBeNull();
    expect(snapTarget(sections, 996, vh, 1)).toBe(2000);
  });

  it('scrolls normally through tall sections until their end is visible', () => {
    expect(snapTarget(sections, 3000, vh, 1)).toBeNull();
    expect(snapTarget(sections, 3300, vh, -1)).toBeNull();
    expect(snapTarget(sections, 3000, vh, -1)).toBe(2000);
  });

  it('lands at the end of a tall section when going up into it', () => {
    const withTall = [
      { top: 0, height: 800 },
      { top: 1000, height: 1600 },
      { top: 2600, height: 1000 },
    ];
    expect(snapTarget(withTall, 2600, vh, -1)).toBe(1600);
  });

  it('lets the footer scroll in after the last section', () => {
    expect(snapTarget(sections.slice(0, 3), 2000, vh, 1)).toBeNull();
  });

  it('goes back to the very top from the first section', () => {
    expect(snapTarget(sections, 3, vh, -1)).toBe(0);
    expect(snapTarget(sections, 0, vh, -1)).toBeNull();
    // Mitten im Hero wird normal nach oben gescrollt
    expect(snapTarget(sections, 100, vh, -1)).toBeNull();
  });

  it('does nothing without sections', () => {
    expect(snapTarget([], 0, vh, 1)).toBeNull();
  });
});

describe('keyDirection', () => {
  it('maps the navigation keys', () => {
    expect(keyDirection({ key: 'PageDown', shiftKey: false })).toBe(1);
    expect(keyDirection({ key: 'ArrowDown', shiftKey: false })).toBe(1);
    expect(keyDirection({ key: ' ', shiftKey: false })).toBe(1);
    expect(keyDirection({ key: ' ', shiftKey: true })).toBe(-1);
    expect(keyDirection({ key: 'PageUp', shiftKey: false })).toBe(-1);
    expect(keyDirection({ key: 'ArrowUp', shiftKey: false })).toBe(-1);
    expect(keyDirection({ key: 'ArrowLeft', shiftKey: false })).toBeNull();
    expect(keyDirection({ key: 'Enter', shiftKey: false })).toBeNull();
  });
});
