import { interpolate } from '../../core/i18n/interpolate';
import { Lang } from '../../core/i18n/paths';
import { SITE } from '../../core/site';
import de from './legal.de.json';
import en from './legal.en.json';

/** Ein Text oder ein Link */
export type LegalLine = string | { text: string; href: string };

/** Ein Abschnitt, wie er in legal.de.json und legal.en.json steht */
interface LegalSectionSource {
  heading: string;
  /** Ein Absatz, die Zeilen durch Zeilenumbrüche getrennt, z. B. Name und Land */
  lines?: LegalLine[];
  /** Fließtext, ein Eintrag je Absatz */
  paragraphs?: LegalLine[];
  /** Aufzählung unter den Absätzen */
  list?: string[];
}

interface LegalDocumentSource {
  heading: string;
  sections: LegalSectionSource[];
}

/** Ein Abschnitt, wie ihn die Seite anzeigt */
export interface LegalSection {
  heading: string;
  /** Je Absatz seine Zeilen */
  paragraphs: LegalLine[][];
  list: string[];
}

export interface LegalDocument {
  heading: string;
  sections: LegalSection[];
}

export type LegalPageKey = 'imprint' | 'privacy';

// Die Texte stehen in legal.de.json und legal.en.json. Platzhalter wie {email} kommen aus SITE.
// Was die Texte abdecken und wann sie angepasst werden müssen: docs/legal.md

const fill = (text: string) => interpolate(text, { email: SITE.email });

const fillLine = (line: LegalLine): LegalLine =>
  typeof line === 'string' ? fill(line) : { text: fill(line.text), href: fill(line.href) };

function withSiteData(doc: LegalDocumentSource): LegalDocument {
  return {
    heading: doc.heading,
    sections: doc.sections.map(({ heading, lines, paragraphs = [], list = [] }) => ({
      heading,
      paragraphs: [...(lines ? [lines] : []), ...paragraphs.map((p) => [p])].map((p) =>
        p.map(fillLine),
      ),
      list: list.map(fill),
    })),
  };
}

export const LEGAL: Record<LegalPageKey, Record<Lang, LegalDocument>> = {
  imprint: { de: withSiteData(de.imprint), en: withSiteData(en.imprint) },
  privacy: { de: withSiteData(de.privacy), en: withSiteData(en.privacy) },
};
