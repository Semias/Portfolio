import { de } from './de';
import { en } from './en';
import { isLang, langPrefix, otherLang, pagePath, postPath, routePath } from './paths';

describe('paths', () => {
  it('keeps English at the root and German under /de', () => {
    expect(pagePath('home', 'en')).toBe('/');
    expect(pagePath('home', 'de')).toBe('/de');
    expect(pagePath('imprint', 'en')).toBe('/imprint');
    expect(pagePath('imprint', 'de')).toBe('/de/impressum');
    expect(pagePath('privacy', 'en')).toBe('/privacy');
    expect(pagePath('privacy', 'de')).toBe('/de/datenschutz');
    expect(postPath('some-post', 'en')).toBe('/blog/some-post');
    expect(postPath('some-post', 'de')).toBe('/de/blog/some-post');
  });

  it('derives router paths without prefix and leading slash', () => {
    expect(routePath('/', 'en')).toBe('');
    expect(routePath('/imprint', 'en')).toBe('imprint');
    expect(routePath('/de', 'de')).toBe('');
    expect(routePath('/de/impressum', 'de')).toBe('impressum');
  });

  it('knows both languages', () => {
    expect(isLang('en')).toBe(true);
    expect(isLang('de')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(otherLang('en')).toBe('de');
    expect(otherLang('de')).toBe('en');
    expect(langPrefix('en')).toBe('');
    expect(langPrefix('de')).toBe('/de');
  });
});

describe('messages', () => {
  // Gleiche Struktur in beiden Sprachen, damit nirgends ein Text fehlt
  function shape(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(shape);
    if (typeof value === 'function') return 'function';
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]));
    }
    return typeof value;
  }

  it('have the same keys and list lengths in English and German', () => {
    expect(shape(de)).toEqual(shape(en));
  });

  it('format reading times', () => {
    expect(en.post.readingTime(3)).toBe('3 min read');
    expect(de.post.readingTime(3)).toBe('3 Min. Lesezeit');
  });
});
