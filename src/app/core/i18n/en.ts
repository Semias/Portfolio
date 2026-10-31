import { Messages } from './messages';

export const en: Messages = {
  langName: 'English',
  meta: {
    siteName: 'Stefan Gall',
    homeTitle: 'Stefan Gall · Software Engineer',
    homeDescription:
      'Stefan Gall, Solution Expert and Software Engineer. Transforming complex requirements into excellent products with TypeScript, Node and SQL.',
    imprintTitle: 'Imprint · Stefan Gall',
    imprintDescription: 'Legal notice for gall-stefan.de.',
    privacyTitle: 'Privacy policy · Stefan Gall',
    privacyDescription: 'How gall-stefan.de handles your data.',
    notFoundTitle: 'Page not found · Stefan Gall',
  },
  header: {
    skipLink: 'Skip to content',
    homeLabel: 'Stefan Gall, home',
    navLabel: 'Main',
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    switchLangShort: 'DE',
    switchLang: 'Deutsche Version',
    readingProgress: 'Reading progress',
  },
  nav: {
    about: 'About',
    cv: 'CV',
    work: 'Projects',
    writing: 'Blog',
    contact: 'Contact',
  },
  hero: {
    titleBefore: "Hi, I'm Stefan. I love building ",
    titleAccent: 'digital products',
    titleAfter: '.',
    subline: 'Transforming complex requirements into excellent products.',
    portraitAlt: 'Portrait of Stefan Gall',
    pickerLabel: 'Accent colour',
    customColor: 'Custom colour',
    accents: { coral: 'Coral', blue: 'Blue', teal: 'Teal', purple: 'Purple', red: 'Red' },
  },
  info: {
    role: 'Solution Expert · Software Engineer',
    stack: 'TypeScript · Node · SQL',
  },
  about: {
    kicker: 'About',
    heading: 'About me',
    lead: 'I come from the web — TYPO3, templates, live operations — and moved step by step deeper into systems: data models, interfaces, platforms.',
    body: 'Today I work where domain and technology meet. I care about software that runs reliably day to day, stays maintainable for years and feels simple to the people using it. TODO(text): add something personal — what drives you, what you do outside work.',
  },
  cv: {
    kicker: 'CV',
    heading: 'Curriculum',
    now: 'today',
    entries: [
      {
        from: '2023',
        to: null,
        title: 'Solution Expert · Software Engineer',
        company: '@PlanB. GmbH',
        text: 'Owning product solutions end to end: clarifying requirements, cutting the architecture, implementing, shipping. Focus on identity, commerce and production-adjacent systems.',
      },
      {
        from: '2021',
        to: '2023',
        title: 'Web Developer',
        company: '@cm city media GmbH',
        text: 'Building websites and editorial systems with HTML, CSS, JavaScript and TYPO3 — templates, integrations and live maintenance.',
      },
    ],
  },
  work: {
    kicker: 'Projects',
    heading: 'Projects',
    projects: [
      {
        title: 'Identity Management Platform',
        text: 'Central management of users, roles and permissions across several applications.',
        tag: 'auth · rbac',
      },
      {
        title: 'Webshop for lenses & prescription values',
        text: 'Configurator and checkout that turns real prescription values into orderable products.',
        tag: 'commerce',
      },
      {
        title: 'AI product recommendations',
        text: 'Recommendation logic as a service behind existing shop surfaces.',
        tag: 'data · api',
      },
      {
        title: 'Production solution for garbage bins',
        text: 'Digital support along manufacturing — from order to finished bin.',
        tag: 'manufacturing',
      },
      {
        title: 'Location access management',
        text: 'Granting, logging and revoking access to physical sites.',
        tag: 'access · iot',
      },
    ],
  },
  writing: {
    kicker: 'Blog',
    heading: 'Blog',
    note: 'notes, irregular',
    comingSoon: 'Coming soon',
  },
  contact: {
    kicker: 'Contact',
    heading: "Let's talk.",
    email: 'E-Mail',
  },
  footer: {
    imprint: 'Imprint',
    privacy: 'Privacy',
    backToTop: '↑ back to top',
  },
  post: {
    back: 'All posts',
    contents: 'Contents',
    readingTime: (minutes) => `${minutes} min read`,
    tags: 'Tags',
    more: 'Keep reading',
    ctaTitle: 'Similar problem on your desk?',
    ctaLabel: 'Get in touch',
  },
  notFound: {
    kicker: '404',
    heading: 'Page not found.',
    text: 'This page does not exist or has moved.',
    home: 'Back to the homepage',
  },
};
