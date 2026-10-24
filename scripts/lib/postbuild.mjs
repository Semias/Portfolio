// Nacharbeiten am statischen Build in dist/, genutzt von scripts/postbuild.mjs.

/** Pfad der vorgerenderten Datei zu einer Route, relativ zu dist/ */
export function routeFile(route) {
  return route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`;
}

/** /404 -> 404.html, /de/404 -> de/404.html (Cloudflare und nginx liefern die nächstgelegene aus) */
export function notFoundTarget(route) {
  return route.endsWith('/404') ? `${route.replace(/^\//, '')}.html` : null;
}

function attribute(tag, name) {
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return match ? match[1] : null;
}

/** Liest Canonical, hreflang-Alternativen, robots und Description aus dem <head> einer Seite */
export function readHead(html) {
  const head = /<head>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? '';
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => tag);
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag);
  const canonical = links.find((tag) => attribute(tag, 'rel') === 'canonical');
  const alternates = links
    .filter((tag) => attribute(tag, 'rel') === 'alternate' && attribute(tag, 'hreflang'))
    .map((tag) => ({ hreflang: attribute(tag, 'hreflang'), href: attribute(tag, 'href') }));
  const robots = metas.find((tag) => attribute(tag, 'name') === 'robots');
  const description = metas.find((tag) => attribute(tag, 'name') === 'description');
  return {
    title: /<title>([^<]*)<\/title>/i.exec(head)?.[1] ?? '',
    canonical: canonical ? attribute(canonical, 'href') : null,
    alternates,
    noindex: !!robots && /noindex/.test(attribute(robots, 'content') ?? ''),
    description: description ? attribute(description, 'content') : null,
  };
}

/** Prüft, dass jede indexierbare Seite Titel, Description und Canonical hat */
export function checkPage(route, head) {
  const problems = [];
  if (!head.title) problems.push('<title> fehlt');
  if (!head.description) problems.push('Meta-Description fehlt');
  if (!head.noindex && !head.canonical) problems.push('Canonical fehlt');
  return problems.map((problem) => `${route}: ${problem}`);
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** sitemap.xml mit hreflang-Alternativen, ohne noindex-Seiten */
export function sitemap(pages) {
  const urls = pages
    .filter((page) => !page.noindex && page.canonical)
    .sort((a, b) => a.canonical.localeCompare(b.canonical))
    .map((page) => {
      const links = page.alternates.map(
        ({ hreflang, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`,
      );
      return [`  <url>`, `    <loc>${escapeXml(page.canonical)}</loc>`, ...links, `  </url>`].join(
        '\n',
      );
    });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
