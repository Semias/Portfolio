import { Lang } from '../core/i18n/paths';

/** Teil des Titels. Der mit *Sternchen* markierte Teil erscheint in der Akzentfarbe. */
export interface TitlePart {
  text: string;
  accent: boolean;
}

export interface TocEntry {
  id: string;
  label: string;
  /** Laufende Nummer, z. B. „01“ */
  n: string;
}

/** Ein Beitrag in einer Sprache, erzeugt von scripts/build-content.mjs */
export interface Post {
  slug: string;
  lang: Lang;
  title: string;
  titleParts: TitlePart[];
  /** Ausführlicher Anreißer für den Kopf der Beitragsseite und die Meta-Description */
  teaser: string;
  /** Kurzer Anreißer für die Karten */
  excerpt: string;
  category: string;
  /** JJJJ-MM-TT, bei reinen Teasern optional */
  date: string | null;
  readingMinutes: number | null;
  tags: string[];
  toc: TocEntry[];
  /** false: nur Teaser, noch ohne Text und ohne eigene Seite */
  published: boolean;
}
