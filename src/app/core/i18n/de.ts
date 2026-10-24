import { en } from './en';
import { Messages } from './messages';

export const de: Messages = {
  langName: 'Deutsch',
  meta: {
    siteName: 'Stefan Gall',
    homeTitle: 'Stefan Gall · Software Engineer',
    homeDescription:
      'Stefan Gall, Solution Expert und Software Engineer. Ich verwandle komplexe Anforderungen in exzellente Produkte, mit TypeScript, Node und SQL.',
    imprintTitle: 'Impressum · Stefan Gall',
    imprintDescription: 'Impressum von gall-stefan.de.',
    privacyTitle: 'Datenschutzerklärung · Stefan Gall',
    privacyDescription: 'Wie gall-stefan.de mit deinen Daten umgeht.',
    notFoundTitle: 'Seite nicht gefunden · Stefan Gall',
  },
  header: {
    skipLink: 'Zum Inhalt springen',
    homeLabel: 'Stefan Gall, Startseite',
    navLabel: 'Hauptnavigation',
    toLight: 'Zu hellem Design wechseln',
    toDark: 'Zu dunklem Design wechseln',
    switchLangShort: 'EN',
    switchLang: 'English version',
    readingProgress: 'Lesefortschritt',
  },
  nav: {
    about: 'Über mich',
    cv: 'Lebenslauf',
    work: 'Projekte',
    writing: 'Blog',
    contact: 'Kontakt',
  },
  hero: {
    titleBefore: 'Hi, ich bin Stefan. Ich liebe es, ',
    titleAccent: 'digitale Produkte',
    titleAfter: ' zu bauen.',
    subline: 'Ich verwandle komplexe Anforderungen in exzellente Produkte.',
    portraitAlt: 'Porträt von Stefan Gall',
    pickerLabel: 'Akzentfarbe',
    customColor: 'Eigene Farbe',
    accents: { blue: 'Blau', teal: 'Türkis', purple: 'Lila', red: 'Rot' },
  },
  info: {
    role: 'Solution Expert · Software Engineer',
    stack: 'TypeScript · Node · SQL',
  },
  about: {
    kicker: 'Über mich',
    heading: 'Über mich',
    lead: 'Ich komme aus dem Web — TYPO3, Templates, Livebetrieb — und bin von dort Schritt für Schritt tiefer in Systeme gewandert: Datenmodelle, Schnittstellen, Plattformen.',
    body: 'Heute arbeite ich an der Stelle, wo Fachlichkeit und Technik aufeinandertreffen. Mich interessiert Software, die im Alltag verlässlich läuft, lange wartbar bleibt und für die Menschen, die sie nutzen, einfach wirkt. TODO(text): Persönliches ergänzen — z. B. was dich antreibt, was du neben der Arbeit machst.',
  },
  cv: {
    kicker: 'Lebenslauf',
    heading: 'Lebenslauf',
    now: 'heute',
    entries: [
      {
        from: '2023',
        to: null,
        title: 'Solution Expert · Software Engineer',
        company: '@PlanB. GmbH',
        text: 'Fachliche und technische Verantwortung für Produktlösungen: Anforderungen klären, Architektur schneiden, implementieren, ausrollen. Schwerpunkte Identity, Commerce und produktionsnahe Systeme.',
      },
      {
        from: '2021',
        to: '2023',
        title: 'Web Developer',
        company: '@cm city media GmbH',
        text: 'Umsetzung von Websites und Redaktionssystemen mit HTML, CSS, JavaScript und TYPO3 — Templates, Integrationen, Pflege im Livebetrieb.',
      },
    ],
  },
  work: {
    kicker: 'Projekte',
    heading: 'Projekte',
    // TODO(text): deutsche Projekttitel. Bis dahin gelten die englischen.
    projects: [
      {
        title: en.work.projects[0].title,
        text: 'Zentrale Verwaltung von Benutzern, Rollen und Rechten über mehrere Anwendungen.',
        tag: 'auth · rbac',
      },
      {
        title: en.work.projects[1].title,
        text: 'Konfigurator und Bestellstrecke, die echte Sehwerte in bestellbare Produkte übersetzt.',
        tag: 'commerce',
      },
      {
        title: en.work.projects[2].title,
        text: 'Empfehlungslogik als Service hinter bestehenden Shop-Oberflächen.',
        tag: 'data · api',
      },
      {
        title: en.work.projects[3].title,
        text: 'Digitale Begleitung der Fertigung — vom Auftrag bis zum fertigen Behälter.',
        tag: 'manufacturing',
      },
      {
        title: en.work.projects[4].title,
        text: 'Zutritt zu Standorten vergeben, protokollieren und wieder entziehen.',
        tag: 'access · iot',
      },
    ],
  },
  writing: {
    kicker: 'Blog',
    heading: 'Blog',
    note: 'notizen, unregelmäßig',
    comingSoon: 'Folgt bald',
  },
  contact: {
    kicker: 'Kontakt',
    heading: 'Lass uns sprechen.',
    email: 'E-Mail',
  },
  footer: {
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    backToTop: '↑ nach oben',
  },
  post: {
    back: 'Alle Beiträge',
    contents: 'Inhalt',
    readingTime: (minutes) => `${minutes} Min. Lesezeit`,
    tags: 'Tags',
    more: 'Weiterlesen',
    ctaTitle: 'Ähnliches Problem auf dem Tisch?',
    ctaLabel: 'Kontakt',
  },
  notFound: {
    kicker: '404',
    heading: 'Seite nicht gefunden.',
    text: 'Diese Seite gibt es nicht oder nicht mehr.',
    home: 'Zur Startseite',
  },
};
