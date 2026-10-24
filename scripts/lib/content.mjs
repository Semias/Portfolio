// Wandelt die Beiträge in content/blog/<slug>.<lang>.md in Daten für die App um.
// Genutzt von scripts/build-content.mjs, getestet in scripts/tests/content.test.mjs.
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import scss from 'highlight.js/lib/languages/scss';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yamlLang from 'highlight.js/lib/languages/yaml';
import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';

for (const [name, language] of Object.entries({
  bash,
  css,
  javascript,
  json,
  scss,
  sql,
  typescript,
  xml,
  yaml: yamlLang,
})) {
  hljs.registerLanguage(name, language);
}
hljs.registerAliases(['ts'], { languageName: 'typescript' });
hljs.registerAliases(['js'], { languageName: 'javascript' });
hljs.registerAliases(['sh', 'shell'], { languageName: 'bash' });
hljs.registerAliases(['html'], { languageName: 'xml' });
hljs.registerAliases(['yml'], { languageName: 'yaml' });

export const LANGS = ['en', 'de'];
export const WORDS_PER_MINUTE = 200;

const FILE_NAME = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(en|de)\.md$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const TOC_LABEL = /^(#{2,6}[ \t]+.*?)[ \t]*\{toc="([^"]+)"\}[ \t]*$/gm;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Links ohne Schema (relativ) oder mit http(s) bzw. mailto, nichts wie javascript: */
const SAFE_URL = /^(?:https?:|mailto:|(?![a-z][a-z0-9+.-]*:))/i;

export class ContentError extends Error {}

/** Zerlegt einen Dateinamen wie `rollen.de.md` in Slug und Sprache */
export function parseFileName(fileName) {
  const match = FILE_NAME.exec(fileName);
  if (!match) {
    throw new ContentError(
      `${fileName}: Dateiname muss <slug>.<en|de>.md lauten (slug in kebab-case)`,
    );
  }
  return { slug: match[1], lang: match[2] };
}

/** „Text mit *Akzent*“ -> Teile für die Überschrift, der markierte Teil erscheint in der Akzentfarbe */
export function titleParts(title) {
  return title
    .split('*')
    .map((text, i) => ({ text, accent: i % 2 === 1 }))
    .filter((part) => part.text.length > 0);
}

/** URL-taugliche ID aus einer Überschrift, deutsche Umlaute werden umschrieben */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Text ohne Markdown-Auszeichnung, z. B. für das Inhaltsverzeichnis */
function plainText(markdown) {
  return markdown
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

export function countWords(html) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

export function readingMinutes(words) {
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/**
 * Markdown -> HTML. Zwischenüberschriften (##) werden nummeriert und landen im Inhaltsverzeichnis.
 * Mit `## Lange Überschrift {toc="Kurz"}` bekommt das Inhaltsverzeichnis einen kürzeren Eintrag.
 */
export function renderMarkdown(markdown, source = 'Markdown') {
  const tocLabels = new Map();
  const prepared = markdown.replace(TOC_LABEL, (_line, heading, label) => {
    tocLabels.set(heading.replace(/^#+[ \t]+/, '').trim(), label);
    return heading;
  });

  const toc = [];
  const usedIds = new Set();
  const uniqueId = (text) => {
    const base = slugify(text) || 'abschnitt';
    let id = base;
    for (let i = 2; usedIds.has(id); i++) id = `${base}-${i}`;
    usedIds.add(id);
    return id;
  };

  const marked = new Marked({
    gfm: true,
    renderer: {
      // Die App setzt das HTML ungeprüft ein (sonst fehlen die IDs der Überschriften).
      // Deshalb kein rohes HTML im Markdown und nur sichere Link-Ziele.
      html(token) {
        const snippet = token.text.trim().slice(0, 40);
        throw new ContentError(`${source}: HTML im Markdown ist nicht erlaubt (${snippet})`);
      },
      link(token) {
        if (!SAFE_URL.test(token.href)) {
          throw new ContentError(`${source}: unsicheres Link-Ziel ${token.href}`);
        }
        return false;
      },
      image(token) {
        if (!SAFE_URL.test(token.href)) {
          throw new ContentError(`${source}: unsichere Bildquelle ${token.href}`);
        }
        return false;
      },
      heading(token) {
        if (token.depth === 1) {
          throw new ContentError(
            `${source}: # ist für den Titel reserviert, im Text mit ## beginnen`,
          );
        }
        const inner = this.parser.parseInline(token.tokens);
        const text = plainText(token.text);
        const id = uniqueId(text);
        if (token.depth !== 2) return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
        const n = String(toc.length + 1).padStart(2, '0');
        toc.push({ id, label: tocLabels.get(token.text.trim()) ?? text, n });
        return `<h2 id="${id}"><span class="heading-number" aria-hidden="true">${n}</span>${inner}</h2>\n`;
      },
      code(token) {
        const lang = (token.lang ?? '').trim().split(/\s+/)[0];
        const known = lang && hljs.getLanguage(lang);
        const body = known
          ? hljs.highlight(token.text, { language: lang, ignoreIllegals: true }).value
          : escapeHtml(token.text);
        const className = known
          ? `hljs language-${hljs.getLanguage(lang).name.toLowerCase()}`
          : 'hljs';
        return `<pre><code class="${className}">${body}</code></pre>\n`;
      },
    },
  });

  const html = marked.parse(prepared).trim();
  return { html, toc, words: countWords(html) };
}

function requireString(data, key, source) {
  const value = data[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new ContentError(`${source}: Feld "${key}" fehlt im Frontmatter`);
  }
  return value.trim();
}

/** Liest eine Beitragsdatei. Ohne Text nach dem Frontmatter ist der Beitrag nur ein Teaser. */
export function parsePost(fileName, source) {
  const { slug, lang } = parseFileName(fileName);
  const match = FRONTMATTER.exec(source);
  if (!match) throw new ContentError(`${fileName}: Frontmatter zwischen --- fehlt`);

  let data;
  try {
    data = parseYaml(match[1]) ?? {};
  } catch (error) {
    throw new ContentError(`${fileName}: Frontmatter ist kein gültiges YAML (${error.message})`);
  }

  const title = requireString(data, 'title', fileName);
  const teaser = requireString(data, 'teaser', fileName);
  const category = requireString(data, 'category', fileName);
  const excerpt =
    typeof data.excerpt === 'string' && data.excerpt.trim() ? data.excerpt.trim() : teaser;
  const body = match[2].trim();
  const published = body.length > 0;

  const date = data.date == null ? null : String(data.date);
  if (date !== null && !DATE.test(date)) {
    throw new ContentError(`${fileName}: "date" muss das Format JJJJ-MM-TT haben`);
  }
  if (published && date === null) {
    throw new ContentError(`${fileName}: Beiträge mit Text brauchen ein "date"`);
  }

  const tags = data.tags ?? [];
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
    throw new ContentError(`${fileName}: "tags" muss eine Liste von Texten sein`);
  }

  const override = data.readingTime;
  if (override != null && !(Number.isInteger(override) && override > 0)) {
    throw new ContentError(`${fileName}: "readingTime" muss eine ganze Zahl größer 0 sein`);
  }

  const rendered = published ? renderMarkdown(body, fileName) : { html: '', toc: [], words: 0 };
  const parts = titleParts(title);

  return {
    slug,
    lang,
    title: parts.map((part) => part.text).join(''),
    titleParts: parts,
    teaser,
    excerpt,
    category,
    date,
    readingMinutes: published ? (override ?? readingMinutes(rendered.words)) : null,
    tags,
    toc: rendered.toc,
    html: rendered.html,
    published,
  };
}

/** Neueste zuerst, Beiträge ohne Datum am Ende, sonst nach Slug */
export function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.date !== b.date) {
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      return a.date < b.date ? 1 : -1;
    }
    return a.slug.localeCompare(b.slug) || a.lang.localeCompare(b.lang);
  });
}

export function buildPosts(files) {
  const posts = files.map(({ name, source }) => parsePost(name, source));
  return sortPosts(posts);
}

/** Schlüssel für Beitragstexte, z. B. "de/rollen" */
export function bodyKey(post) {
  return `${post.lang}/${post.slug}`;
}

const HEADER =
  '// Automatisch erzeugt von scripts/build-content.mjs aus content/blog. Nicht von Hand ändern.';

/**
 * Erzeugt die TypeScript-Dateien: posts.generated.ts mit den Metadaten aller Beiträge und je
 * veröffentlichtem Beitrag eine Datei in bodies/, die erst auf der Beitragsseite geladen wird.
 */
export function toModules(posts) {
  const published = posts.filter((post) => post.published);
  const meta = posts.map(({ html: _html, ...rest }) => rest);
  const loaders = published.map(
    (post) =>
      `  '${bodyKey(post)}': () => import('./bodies/${post.slug}.${post.lang}').then((m) => m.html),`,
  );
  const index = [
    HEADER,
    "import type { Post } from './post';",
    '',
    `export const POSTS: readonly Post[] = ${JSON.stringify(meta, null, 2)};`,
    '',
    '/** Beitragstexte als eigene Chunks, geladen von der Beitragsseite */',
    'export const POST_BODIES: Readonly<Record<string, () => Promise<string>>> = {',
    ...loaders,
    '};',
    '',
  ].join('\n');
  const bodies = published.map((post) => ({
    file: `${post.slug}.${post.lang}.ts`,
    code: [HEADER, `export const html = ${JSON.stringify(post.html)};`, ''].join('\n'),
  }));
  return { index, bodies };
}
