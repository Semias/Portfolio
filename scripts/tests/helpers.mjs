import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

/** Liest die CSS-Variablen aus einem `@mixin name { … }`-Block von _tokens.scss */
export function tokenBlock(scss, name) {
  const match = scss.match(new RegExp(`@mixin ${name} \\{([\\s\\S]*?)\\n\\}`));
  if (!match) throw new Error(`@mixin ${name} nicht gefunden`);
  const tokens = {};
  for (const [, key, value] of match[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens[key] = normalizeHex(value.trim());
  }
  return tokens;
}

export function normalizeHex(value) {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
  if (short)
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : value;
}
