// Akzentfarben und Kontrastberechnung.
// Die Datei hat bewusst keine Imports: Die Node-Tests in scripts/tests laden sie direkt.

export type Theme = 'dark' | 'light';
export type PresetAccent = 'coral' | 'blue' | 'teal' | 'purple' | 'red';
export type Accent = PresetAccent | 'custom';

export interface AccentPalette {
  /** Flächen, Rahmen, Portrait-Ring, große Schrift */
  acc: string;
  /** Links und kleine Akzent-Schrift */
  soft: string;
  /** Schrift auf Akzent-Flächen */
  onAcc: string;
}

/** Standardfarbe, solange niemand eine andere wählt. Bei einer Änderung auch --acc in _tokens.scss anpassen. */
export const DEFAULT_ACCENT: PresetAccent = 'coral';

/** Mindestkontrast für Text (WCAG AA) */
export const MIN_CONTRAST = 4.5;

/**
 * Werte aus src/styles/_tokens.scss, die für die Berechnung gebraucht werden.
 * `hover` ist die Fläche mit dem geringsten Abstand zur Akzentfarbe und damit der Maßstab für den Kontrast.
 */
export const THEME_SURFACES: Record<Theme, { bg: string; ink: string; hover: string }> = {
  dark: { bg: '#0e1014', ink: '#eef0f4', hover: '#151820' },
  light: { bg: '#f7f8fa', ink: '#11141a', hover: '#eceef3' },
};

/** Farben aus dem Design. `dark`/`darkSoft` gelten im dunklen Theme, `light` ist die dunklere Variante fürs helle. */
export const ACCENT_PRESETS: Record<
  PresetAccent,
  { dark: string; darkSoft: string; light: string }
> = {
  // Standard: im Farbwähler gewählt (#ff7a66), übrige Töne wie bei einer freien Farbe berechnet
  coral: { dark: '#ff7a66', darkSoft: '#ffafa3', light: '#a85143' },
  blue: { dark: '#4d9fff', darkSoft: '#8fc2ff', light: '#1f6fd1' },
  teal: { dark: '#2fd0c0', darkSoft: '#82e6db', light: '#0f8f84' },
  purple: { dark: '#b89cff', darkSoft: '#d6c7ff', light: '#7a5cc7' },
  red: { dark: '#ff563c', darkSoft: '#ff8f79', light: '#ec3013' },
};

export const PRESET_ACCENTS = Object.keys(ACCENT_PRESETS) as PresetAccent[];

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value);
}

export function isPresetAccent(value: unknown): value is PresetAccent {
  return typeof value === 'string' && Object.hasOwn(ACCENT_PRESETS, value);
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb: readonly number[]): string {
  return '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/** Mischt `hex` zu `amount` (0–1) mit `target`, wie color-mix() in sRGB. */
export function mix(hex: string, target: string, amount: number): string {
  const a = channels(hex);
  const b = channels(target);
  return toHex(a.map((v, i) => v + (b[i] - v) * amount));
}

/** Relative Leuchtdichte nach WCAG 2 */
export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Hellt `hex` auf (dunkles Theme) bzw. dunkelt ab (helles Theme), bis der Kontrast zu `surface`
 * mindestens `min` beträgt. Farben, die schon reichen, bleiben unverändert.
 */
export function ensureContrast(hex: string, surface: string, min = MIN_CONTRAST): string {
  const target = luminance(surface) > 0.5 ? '#000000' : '#ffffff';
  for (let step = 0; step <= 100; step++) {
    const candidate = mix(hex, target, step / 100);
    if (contrast(candidate, surface) >= min) return candidate;
  }
  return target;
}

/** Weiß oder die dunkle Grundfarbe, je nachdem, was auf `hex` besser lesbar ist */
export function readableOn(hex: string): string {
  const dark = THEME_SURFACES.dark.bg;
  return contrast(hex, '#ffffff') >= contrast(hex, dark) ? '#ffffff' : dark;
}

/**
 * Berechnet die Akzentfarben für ein Theme.
 * Dunkel: Soft-Ton wie im Design (freie Farbe: 40 % Weiß beigemischt).
 * Hell: dunklere Variante, Soft-Ton noch etwas tiefer. Alle Töne halten 4,5 : 1 zur Fläche.
 */
export function accentPalette(
  theme: Theme,
  accent: Accent,
  customHex?: string | null,
): AccentPalette {
  const surface = THEME_SURFACES[theme];
  const custom = accent === 'custom' && isHexColor(customHex) ? customHex.toLowerCase() : null;
  const preset = ACCENT_PRESETS[isPresetAccent(accent) ? accent : DEFAULT_ACCENT];

  if (theme === 'dark') {
    const acc = ensureContrast(custom ?? preset.dark, surface.hover);
    const soft = ensureContrast(custom ? mix(acc, '#ffffff', 0.4) : preset.darkSoft, surface.hover);
    return { acc, soft, onAcc: readableOn(acc) };
  }

  const acc = ensureContrast(custom ?? preset.light, surface.hover);
  const soft = ensureContrast(mix(acc, surface.ink, 0.3), surface.hover);
  return { acc, soft, onAcc: readableOn(acc) };
}
