// Erzeugt src/app/content/posts.generated.ts und src/app/content/bodies/*.ts aus content/blog/*.md.
// Läuft automatisch vor start, build und test. Mit --watch bei jeder Änderung neu.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  watch,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContentError, buildPosts, toModules } from './lib/content.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(root, 'content', 'blog');
const targetDir = join(root, 'src', 'app', 'content');
const bodiesDir = join(targetDir, 'bodies');

/** Schreibt nur bei Änderungen, sonst baut ng serve unnötig neu */
function writeIfChanged(file, code) {
  if (existsSync(file) && readFileSync(file, 'utf8') === code) return;
  writeFileSync(file, code);
}

function build() {
  const files = existsSync(contentDir)
    ? readdirSync(contentDir)
        .filter((name) => name.endsWith('.md'))
        .sort()
        .map((name) => ({ name, source: readFileSync(join(contentDir, name), 'utf8') }))
    : [];
  const { index, bodies } = toModules(buildPosts(files));

  mkdirSync(bodiesDir, { recursive: true });
  const expected = new Set(bodies.map((body) => body.file));
  for (const stale of readdirSync(bodiesDir).filter((file) => !expected.has(file))) {
    rmSync(join(bodiesDir, stale));
  }
  for (const body of bodies) writeIfChanged(join(bodiesDir, body.file), body.code);
  writeIfChanged(join(targetDir, 'posts.generated.ts'), index);

  console.log(`content: ${files.length} Datei(en) aus content/blog verarbeitet`);
}

function run() {
  try {
    build();
    return true;
  } catch (error) {
    if (!(error instanceof ContentError)) throw error;
    console.error(`content: ${error.message}`);
    return false;
  }
}

if (process.argv.includes('--watch')) {
  run();
  let timer;
  watch(contentDir, () => {
    clearTimeout(timer);
    timer = setTimeout(run, 50);
  });
  console.log('content: beobachte content/blog …');
} else if (!run()) {
  process.exit(1);
}
