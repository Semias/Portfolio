// Läuft nach ng build (npm run build):
// - /404 und /de/404 werden zu 404.html und de/404.html (Cloudflare not_found_handling: 404-page, nginx)
// - sitemap.xml aus Canonical und hreflang der vorgerenderten Seiten
// - bricht ab, wenn einer Seite Titel, Description oder Canonical fehlt
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPage, notFoundTarget, readHead, routeFile, sitemap } from './lib/postbuild.mjs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const routes = Object.keys(
  JSON.parse(readFileSync(join(dist, 'prerendered-routes.json'), 'utf8')).routes,
);

const pages = [];
const problems = [];
for (const route of routes) {
  const file = join(dist, routeFile(route));
  if (!existsSync(file)) {
    problems.push(`${route}: ${routeFile(route)} fehlt`);
    continue;
  }
  const head = readHead(readFileSync(file, 'utf8'));
  problems.push(...checkPage(route, head));

  const target = notFoundTarget(route);
  if (target) {
    renameSync(file, join(dist, target));
    rmSync(dirname(file), { recursive: true, force: true });
    continue;
  }
  pages.push(head);
}

if (problems.length) {
  console.error(`postbuild:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

writeFileSync(join(dist, 'sitemap.xml'), sitemap(pages));
console.log(`postbuild: 404-Seiten verschoben, sitemap.xml mit ${pages.length} Seiten geschrieben`);
