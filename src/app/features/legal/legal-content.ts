import { Lang } from '../../core/i18n/paths';
import { SITE } from '../../core/site';

export type LegalKind = 'imprint' | 'privacy';

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

const email: LegalLine = { text: SITE.email, href: `mailto:${SITE.email}` };

// TODO(text): Anschrift und E-Mail-Adresse ergänzen (Impressum), Datenschutzerklärung schreiben.
//
// Was die Datenschutzerklärung nach heutigem Stand abdecken muss:
// - Verantwortlicher (wie im Impressum)
// - Hosting: Cloudflare Workers (gall-stefan.de) bzw. eigener Server mit nginx (Docker),
//   dabei technisch nötige Server-Logs (IP-Adresse, Zeitpunkt, aufgerufene Seite)
// - Keine Cookies, kein Tracking, keine Analyse, Schriften selbst gehostet (kein Abruf bei Google)
// - localStorage nur im Browser: Theme (sg-portfolio-theme) und Akzentfarbe (sg-portfolio-accent,
//   -hex, -palette); nichts davon wird übertragen
// - Links zu GitHub und LinkedIn: Daten fließen erst beim Klick, dann gelten deren Regeln
// - Kontakt per E-Mail
// - Rechte der Betroffenen, Beschwerderecht bei der Aufsichtsbehörde
export const LEGAL: Record<LegalKind, Record<Lang, LegalDocument>> = {
  imprint: {
    de: {
      heading: 'Impressum',
      sections: [
        {
          heading: 'Angaben gemäß § 5 DDG',
          lines: [
            'Stefan Gall',
            'TODO(text): Straße und Hausnummer',
            'TODO(text): PLZ und Ort',
            'Deutschland',
          ],
        },
        { heading: 'Kontakt', lines: [email] },
        {
          heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
          lines: ['Stefan Gall, Anschrift wie oben'],
        },
      ],
    },
    en: {
      heading: 'Imprint',
      sections: [
        {
          heading: 'Information according to § 5 DDG',
          lines: [
            'Stefan Gall',
            'TODO(text): street and number',
            'TODO(text): postcode and city',
            'Germany',
          ],
        },
        { heading: 'Contact', lines: [email] },
        {
          heading: 'Responsible for the content according to § 18 (2) MStV',
          lines: ['Stefan Gall, address as above'],
        },
      ],
    },
  },
  privacy: {
    de: {
      heading: 'Datenschutzerklärung',
      sections: [
        { heading: 'Verantwortlicher', lines: ['Stefan Gall, Anschrift siehe Impressum'] },
        { heading: 'Datenverarbeitung', lines: ['TODO(text): Datenschutzerklärung folgt.'] },
      ],
    },
    en: {
      heading: 'Privacy policy',
      sections: [
        { heading: 'Controller', lines: ['Stefan Gall, address see imprint'] },
        { heading: 'Data processing', lines: ['TODO(text): privacy policy to follow.'] },
      ],
    },
  },
};
