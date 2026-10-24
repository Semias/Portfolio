// Liefert dist/ aus wie Cloudflare (not_found_handling: 404-page) und nginx:
// /pfad -> pfad/index.html oder pfad.html, unbekannte Pfade -> nächstgelegene 404.html mit Status 404.
// Für Playwright und zum lokalen Anschauen des Builds: node scripts/serve-dist.mjs [port]
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const port = Number(process.argv[2] ?? process.env.PORT ?? 4300);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/** Sucht die Datei zu einem URL-Pfad, ohne dist/ zu verlassen */
export async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const base = join(root, clean);
  if (!base.startsWith(root)) return null;
  for (const candidate of [base, join(base, 'index.html'), `${base}.html`]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

/** Nächstgelegene 404.html, z. B. /de/foo -> dist/de/404.html, sonst dist/404.html */
async function notFoundPage(urlPath) {
  const segments = urlPath.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const candidate = join(root, ...segments.slice(0, i), '404.html');
    if (candidate.startsWith(root) && (await isFile(candidate))) return candidate;
  }
  return (await isFile(join(root, '404.html'))) ? join(root, '404.html') : null;
}

function send(res, status, file) {
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600',
  });
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  const file = await resolveFile(pathname);
  if (file) return send(res, 200, file);
  const fallback = await notFoundPage(pathname);
  if (fallback) return send(res, 404, fallback);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
});

server.listen(port, () => console.log(`dist/ läuft auf http://localhost:${port}`));
