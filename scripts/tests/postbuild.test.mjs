import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkPage, notFoundTarget, readHead, routeFile, sitemap } from '../lib/postbuild.mjs';

const page = (head) => `<!DOCTYPE html><html><head>${head}</head><body></body></html>`;

describe('postbuild', () => {
  it('maps routes to prerendered files', () => {
    assert.equal(routeFile('/'), 'index.html');
    assert.equal(routeFile('/de'), 'de/index.html');
    assert.equal(routeFile('/de/blog/x'), 'de/blog/x/index.html');
  });

  it('turns the 404 routes into 404.html files', () => {
    assert.equal(notFoundTarget('/404'), '404.html');
    assert.equal(notFoundTarget('/de/404'), 'de/404.html');
    assert.equal(notFoundTarget('/de'), null);
    assert.equal(notFoundTarget('/blog/404-stories'), null);
  });

  it('reads canonical, alternates, robots and description', () => {
    const head = readHead(
      page(
        '<title>T</title><meta name="description" content="D">' +
          '<link rel="icon" href="favicon.ico">' +
          '<link rel="canonical" href="https://x.de/de">' +
          '<link rel="alternate" hreflang="en" href="https://x.de/">' +
          '<link rel="alternate" hreflang="de" href="https://x.de/de">' +
          '<link rel="alternate" type="application/rss+xml" href="/feed.xml">',
      ),
    );
    assert.deepEqual(head, {
      title: 'T',
      canonical: 'https://x.de/de',
      alternates: [
        { hreflang: 'en', href: 'https://x.de/' },
        { hreflang: 'de', href: 'https://x.de/de' },
      ],
      noindex: false,
      description: 'D',
    });
    assert.equal(readHead(page('<meta name="robots" content="noindex">')).noindex, true);
  });

  it('reports pages without title, description or canonical', () => {
    assert.deepEqual(checkPage('/x', readHead(page(''))), [
      '/x: <title> fehlt',
      '/x: Meta-Description fehlt',
      '/x: Canonical fehlt',
    ]);
    const notFound = readHead(
      page(
        '<title>404</title><meta name="description" content="D"><meta name="robots" content="noindex">',
      ),
    );
    assert.deepEqual(checkPage('/404', notFound), []);
  });

  it('writes a sitemap with alternates and without noindex pages', () => {
    const xml = sitemap([
      {
        canonical: 'https://x.de/de',
        alternates: [{ hreflang: 'en', href: 'https://x.de/?a&b' }],
        noindex: false,
      },
      { canonical: 'https://x.de/', alternates: [], noindex: false },
      { canonical: null, alternates: [], noindex: true },
    ]);
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.deepEqual(
      [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
      ['https://x.de/', 'https://x.de/de'],
    );
    assert.match(
      xml,
      /<xhtml:link rel="alternate" hreflang="en" href="https:\/\/x.de\/\?a&amp;b"\/>/,
    );
  });
});
