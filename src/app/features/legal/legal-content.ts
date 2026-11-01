import { interpolate } from '../../core/i18n/interpolate';
import { Lang } from '../../core/i18n/paths';
import { SITE } from '../../core/site';
import de from './legal.de.json';
import en from './legal.en.json';

/** Eine Zeile: Text oder Link */
export type LegalLine = string | { text: string; href: string };

export interface LegalSection {
  heading: string;
  lines: LegalLine[];
}

export interface LegalDocument {
  heading: string;
  sections: LegalSection[];
}

// Die Texte stehen in legal.de.json und legal.en.json. Platzhalter wie {email} kommen aus SITE.
//
// TODO(text): Anschrift ergänzen.

const fill = (text: string) => interpolate(text, { email: SITE.email });

function withSiteData(doc: LegalDocument): LegalDocument {
  return {
    heading: doc.heading,
    sections: doc.sections.map(({ heading, lines }) => ({
      heading,
      lines: lines.map((line) =>
        typeof line === 'string' ? fill(line) : { text: fill(line.text), href: fill(line.href) },
      ),
    })),
  };
}

export const IMPRINT: Record<Lang, LegalDocument> = {
  de: withSiteData(de.imprint),
  en: withSiteData(en.imprint),
};
