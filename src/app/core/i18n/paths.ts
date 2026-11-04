// URLs je Sprache. Englisch liegt unter /, Deutsch unter /de.

export type Lang = 'en' | 'de';
export type StaticPage = 'home' | 'imprint' | 'privacy' | 'notFound';
export type PageKey = StaticPage | 'post';

export const LANGS: readonly Lang[] = ['en', 'de'];
export const DEFAULT_LANG: Lang = 'en';

const STATIC_PATHS: Record<Lang, Record<StaticPage, string>> = {
  en: { home: '/', imprint: '/imprint', privacy: '/privacy', notFound: '/404' },
  de: { home: '/de', imprint: '/de/impressum', privacy: '/de/datenschutz', notFound: '/de/404' },
};

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'de';
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'de' : 'en';
}

export function langPrefix(lang: Lang): string {
  return lang === DEFAULT_LANG ? '' : `/${lang}`;
}

export function pagePath(page: StaticPage, lang: Lang): string {
  return STATIC_PATHS[lang][page];
}

export function postPath(slug: string, lang: Lang): string {
  return `${langPrefix(lang)}/blog/${slug}`;
}

/** Pfad für die Router-Konfiguration: ohne führenden Schrägstrich und ohne Sprachpräfix */
export function routePath(path: string, lang: Lang): string {
  return path.slice(langPrefix(lang).length).replace(/^\//, '');
}
