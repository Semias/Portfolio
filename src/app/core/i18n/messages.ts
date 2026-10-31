import { PresetAccent } from '../theme/color';

// Platzhalter für Texte, die noch fehlen, sind mit TODO(text) markiert. Der Prod-Deploy bricht ab,
// solange einer davon auf einer Seite steht (siehe .github/workflows/deploy.yml).

export interface CvEntry {
  from: string;
  to: string | null;
  title: string;
  company: string;
  text: string;
}

export interface Project {
  title: string;
  text: string;
  tag: string;
}

export interface Messages {
  /** Name der Sprache in ihr selbst, für den Sprachumschalter */
  langName: string;
  meta: {
    siteName: string;
    homeTitle: string;
    homeDescription: string;
    imprintTitle: string;
    imprintDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    notFoundTitle: string;
  };
  header: {
    skipLink: string;
    homeLabel: string;
    navLabel: string;
    toLight: string;
    toDark: string;
    /** Kurzlabel der anderen Sprache, z. B. „DE“ auf der englischen Seite */
    switchLangShort: string;
    switchLang: string;
    readingProgress: string;
  };
  nav: {
    about: string;
    cv: string;
    work: string;
    writing: string;
    contact: string;
  };
  hero: {
    titleBefore: string;
    titleAccent: string;
    titleAfter: string;
    subline: string;
    portraitAlt: string;
    pickerLabel: string;
    customColor: string;
    accents: Record<PresetAccent, string>;
  };
  info: {
    role: string;
    stack: string;
  };
  about: {
    kicker: string;
    heading: string;
    lead: string;
    body: string;
  };
  cv: {
    kicker: string;
    heading: string;
    now: string;
    entries: CvEntry[];
  };
  work: {
    kicker: string;
    heading: string;
    projects: Project[];
  };
  writing: {
    kicker: string;
    heading: string;
    note: string;
    comingSoon: string;
  };
  contact: {
    kicker: string;
    heading: string;
    email: string;
  };
  footer: {
    imprint: string;
    privacy: string;
    backToTop: string;
  };
  post: {
    back: string;
    contents: string;
    readingTime: (minutes: number) => string;
    tags: string;
    more: string;
    ctaTitle: string;
    ctaLabel: string;
  };
  notFound: {
    kicker: string;
    heading: string;
    text: string;
    home: string;
  };
}
