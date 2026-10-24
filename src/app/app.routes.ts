import { Route, Routes } from '@angular/router';
import { PageRouteData } from './core/i18n/language.service';
import { Lang, PageKey, StaticPage, pagePath, routePath } from './core/i18n/paths';

const loadHome = () => import('./features/home/home.page').then((m) => m.HomePage);
const loadNotFound = () =>
  import('./features/not-found/not-found.page').then((m) => m.NotFoundPage);

function page(
  lang: Lang,
  key: PageKey,
  path: string,
  loadComponent: Route['loadComponent'],
): Route {
  const data: PageRouteData = { lang, page: key };
  return path === ''
    ? { path, pathMatch: 'full', loadComponent, data }
    : { path, loadComponent, data };
}

function staticPage(lang: Lang, key: StaticPage, loadComponent: Route['loadComponent']): Route {
  return page(lang, key, routePath(pagePath(key, lang), lang), loadComponent);
}

/** Seiten einer Sprache. Englisch liegt ohne Präfix unter /, Deutsch unter /de. */
function localizedRoutes(lang: Lang): Routes {
  return [
    staticPage(lang, 'home', loadHome),
    // Wird als 404.html vorgerendert (scripts/postbuild.mjs)
    staticPage(lang, 'notFound', loadNotFound),
    page(lang, 'notFound', '**', loadNotFound),
  ];
}

export const routes: Routes = [
  { path: 'de', children: localizedRoutes('de') },
  ...localizedRoutes('en'),
];
