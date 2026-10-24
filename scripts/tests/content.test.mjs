import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  ContentError,
  buildPosts,
  countWords,
  parseFileName,
  parsePost,
  readingMinutes,
  renderMarkdown,
  slugify,
  sortPosts,
  titleParts,
  toModules,
} from '../lib/content.mjs';
import { root } from './helpers.mjs';

const frontmatter = (fields, body = '') => `---\n${fields}\n---\n${body}`;
const BASIC = 'title: Hello *world*\nteaser: Long teaser.\ncategory: Identity';

describe('parseFileName', () => {
  it('reads slug and language', () => {
    assert.deepEqual(parseFileName('modelling-roles.de.md'), {
      slug: 'modelling-roles',
      lang: 'de',
    });
  });

  it('rejects other names', () => {
    for (const name of ['post.md', 'Post.en.md', 'post.fr.md', 'my_post.en.md']) {
      assert.throws(() => parseFileName(name), ContentError, name);
    }
  });
});

describe('helpers', () => {
  it('splits accent parts of a title', () => {
    assert.deepEqual(titleParts('Roles without *painting yourself in*.'), [
      { text: 'Roles without ', accent: false },
      { text: 'painting yourself in', accent: true },
      { text: '.', accent: false },
    ]);
    assert.deepEqual(titleParts('Plain'), [{ text: 'Plain', accent: false }]);
  });

  it('builds URL-safe ids, also from German umlauts', () => {
    assert.equal(slugify('Rollen sind die Oberfläche'), 'rollen-sind-die-oberflaeche');
    assert.equal(slugify('Größe & Maß!'), 'groesse-mass');
    assert.equal(slugify('Café déjà vu'), 'cafe-deja-vu');
  });

  it('counts words and reading time (about 200 words per minute, at least 1)', () => {
    assert.equal(countWords('<p>one two</p>\n<p>three &amp; four</p>'), 4);
    assert.equal(countWords(''), 0);
    assert.equal(readingMinutes(0), 1);
    assert.equal(readingMinutes(200), 1);
    assert.equal(readingMinutes(201), 2);
  });
});

describe('renderMarkdown', () => {
  it('numbers h2 headings and builds the table of contents', () => {
    const { html, toc } = renderMarkdown(
      '## First part\n\nText\n\n## Second *part* {toc="Short"}\n\n### Detail\n\n## First part',
    );
    assert.deepEqual(toc, [
      { id: 'first-part', label: 'First part', n: '01' },
      { id: 'second-part', label: 'Short', n: '02' },
      { id: 'first-part-2', label: 'First part', n: '03' },
    ]);
    assert.match(
      html,
      /<h2 id="second-part"><span class="heading-number" aria-hidden="true">02<\/span>Second <em>part<\/em><\/h2>/,
    );
    assert.match(html, /<h3 id="detail">Detail<\/h3>/);
    assert.doesNotMatch(html, /\{toc=/);
  });

  it('highlights known languages with classes only', () => {
    const { html } = renderMarkdown('```ts\nconst a = "x"; // note\n```');
    assert.match(html, /<pre><code class="hljs language-typescript">/);
    assert.match(html, /<span class="hljs-keyword">const<\/span>/);
    assert.match(html, /<span class="hljs-string">&quot;x&quot;<\/span>/);
    assert.match(html, /<span class="hljs-comment">\/\/ note<\/span>/);
    assert.doesNotMatch(html, /style=/);
  });

  it('escapes code in unknown languages', () => {
    const { html } = renderMarkdown('```brainfuck\n<script>alert(1)</script>\n```');
    assert.match(html, /<pre><code class="hljs">&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  });

  it('renders quotes, lists and inline code', () => {
    const { html } = renderMarkdown('> Quote\n\n- one\n- two\n\nUse `code`.');
    assert.match(html, /<blockquote>\n<p>Quote<\/p>\n<\/blockquote>/);
    assert.match(html, /<ul>\n<li>one<\/li>\n<li>two<\/li>\n<\/ul>/);
    assert.match(html, /<code>code<\/code>/);
  });

  it('reserves # for the title', () => {
    assert.throws(() => renderMarkdown('# Title'), ContentError);
  });

  // Die App setzt das HTML ohne Angulars Sanitizer ein, deshalb muss es hier sicher werden
  it('rejects raw HTML', () => {
    assert.throws(() => renderMarkdown('<script>alert(1)</script>'), /HTML im Markdown/);
    assert.throws(() => renderMarkdown('Text <img src=x onerror=alert(1)> text'), ContentError);
  });

  it('allows only safe link and image targets', () => {
    const { html } = renderMarkdown(
      '[a](https://example.com) [b](mailto:me@example.com) [c](/de/impressum) [d](#part) ![e](/images/x.webp)',
    );
    assert.match(html, /href="https:\/\/example.com"/);
    assert.match(html, /href="mailto:me@example.com"/);
    assert.match(html, /href="\/de\/impressum"/);
    assert.match(html, /<img src="\/images\/x.webp" alt="e">/);
    assert.throws(() => renderMarkdown('[x](javascript:alert(1))'), /unsicheres Link-Ziel/);
    assert.throws(() => renderMarkdown('[x](JAVASCRIPT:alert(1))'), ContentError);
    assert.throws(() => renderMarkdown('![x](data:text/html,boom)'), /unsichere Bildquelle/);
  });
});

describe('parsePost', () => {
  it('reads frontmatter and body', () => {
    const post = parsePost(
      'hello.en.md',
      frontmatter(
        `${BASIC}\nexcerpt: Short.\ndate: 2026-09-12\ntags: [A, B]`,
        '\nIntro.\n\n## Part\n\nText.',
      ),
    );
    assert.equal(post.slug, 'hello');
    assert.equal(post.lang, 'en');
    assert.equal(post.title, 'Hello world');
    assert.deepEqual(post.titleParts, [
      { text: 'Hello ', accent: false },
      { text: 'world', accent: true },
    ]);
    assert.equal(post.teaser, 'Long teaser.');
    assert.equal(post.excerpt, 'Short.');
    assert.equal(post.category, 'Identity');
    assert.equal(post.date, '2026-09-12');
    assert.deepEqual(post.tags, ['A', 'B']);
    assert.equal(post.readingMinutes, 1);
    assert.equal(post.published, true);
    assert.equal(post.toc.length, 1);
    assert.match(post.html, /^<p>Intro.<\/p>/);
  });

  it('treats posts without body as teaser only', () => {
    const post = parsePost('soon.de.md', frontmatter(BASIC));
    assert.equal(post.published, false);
    assert.equal(post.html, '');
    assert.equal(post.readingMinutes, null);
    assert.equal(post.date, null);
    assert.equal(post.excerpt, 'Long teaser.');
  });

  it('lets the frontmatter override the reading time', () => {
    const post = parsePost(
      'x.en.md',
      frontmatter(`${BASIC}\ndate: 2026-01-01\nreadingTime: 6`, 'Text'),
    );
    assert.equal(post.readingMinutes, 6);
  });

  it('reports missing or invalid fields with the file name', () => {
    const cases = [
      ['no frontmatter', 'Just text'],
      ['missing title', frontmatter('teaser: t\ncategory: c')],
      ['missing teaser', frontmatter('title: t\ncategory: c')],
      ['missing category', frontmatter('title: t\nteaser: t')],
      ['invalid yaml', frontmatter('title: [unclosed')],
      ['bad date', frontmatter(`${BASIC}\ndate: 12.09.2026`, 'Text')],
      ['body without date', frontmatter(BASIC, 'Text')],
      ['bad tags', frontmatter(`${BASIC}\ntags: nope`)],
      ['bad reading time', frontmatter(`${BASIC}\ndate: 2026-01-01\nreadingTime: -1`, 'Text')],
    ];
    for (const [name, source] of cases) {
      assert.throws(
        () => parsePost('broken.en.md', source),
        (error) => error instanceof ContentError && error.message.startsWith('broken.en.md'),
        name,
      );
    }
  });
});

describe('sorting and modules', () => {
  const posts = buildPosts([
    { name: 'old.en.md', source: frontmatter(`${BASIC}\ndate: 2025-01-01`, 'Text') },
    { name: 'teaser.en.md', source: frontmatter(BASIC) },
    { name: 'new.en.md', source: frontmatter(`${BASIC}\ndate: 2026-01-01`, 'Text') },
    { name: 'new.de.md', source: frontmatter(`${BASIC}\ndate: 2026-01-01`, 'Text') },
  ]);

  it('sorts newest first and teasers last', () => {
    assert.deepEqual(
      posts.map((post) => `${post.lang}/${post.slug}`),
      ['de/new', 'en/new', 'en/old', 'en/teaser'],
    );
    assert.deepEqual(sortPosts([...posts].reverse()), posts);
  });

  it('writes metadata and one lazy body module per published post', () => {
    const { index, bodies } = toModules(posts);
    assert.match(index, /import type \{ Post \} from '\.\/post';/);
    assert.doesNotMatch(index, /"html"/);
    assert.match(
      index,
      /'en\/new': \(\) => import\('\.\/bodies\/new\.en'\)\.then\(\(m\) => m\.html\),/,
    );
    assert.deepEqual(
      bodies.map((body) => body.file),
      ['new.de.ts', 'new.en.ts', 'old.en.ts'],
    );
    assert.match(
      bodies[0].code,
      /^\/\/ Automatisch erzeugt[\s\S]*export const html = "<p>Text<\/p>";/,
    );
  });
});

describe('content/blog', () => {
  const dir = join(root, 'content', 'blog');
  const files = readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ name, source: readFileSync(join(dir, name), 'utf8') }));
  const posts = buildPosts(files);

  it('parses all real posts', () => {
    assert.ok(posts.length > 0);
  });
});
