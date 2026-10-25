// Startet die Screenshot-Vergleiche (@visual) im Playwright-Docker-Image, damit Schriften und
// Rendering überall gleich sind wie in der CI. Vorher npm run build.
// node scripts/e2e-visual.mjs [weitere Playwright-Argumente, z. B. --update-snapshots]
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const { version } = createRequire(import.meta.url)('@playwright/test/package.json');
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--ipc=host',
    '-v',
    `${process.cwd()}:/work`,
    '-w',
    '/work',
    image,
    'node',
    'node_modules/@playwright/test/cli.js',
    'test',
    '--grep',
    '@visual',
    ...process.argv.slice(2),
  ],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error(`Docker nicht gefunden oder nicht gestartet: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
