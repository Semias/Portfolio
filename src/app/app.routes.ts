import { Route, Routes } from '@angular/router';
import { Alternates, PageRouteData } from './core/i18n/language.service';
import { LANGS, Lang, PageKey, StaticPage, pagePath, postPath, routePath } from './core/i18n/paths';
import { postRouteExtras } from './features/blog/post.routes';

const loadHome = () => import('./features/home/home.page').then((m) => m.HomePage);
const loadPost = () => import('./features/blog/post.page').then((m) => m.PostPage);
const loadLegal = () => import('./features/legal/legal.page').then((m) => m.LegalPage);
const loadNotFound = () =>
  import('./features/not-found/not-found.page').then((m) => m.NotFoundPage);

function page(lang: Lang, key: PageKey, path: string, extra: Partial<Route> = {}): Route {
  const data: PageRouteData = { lang, page: key, ...extra.data };
  const route: Route = { ...extra, path, data };
  return path === '' ? { ...route, pathMatch: 'full' } : route;
}

function staticPage(lang: Lang, key: StaticPage, loadComponent: Route['loadComponent']): Route {
  const alternates: Alternates = Object.fromEntries(LANGS.map((l) => [l, pagePath(key, l)]));
  return page(lang, key, routePath(pagePath(key, lang), lang), {
    loadComponent,
    data: { alternates },
  });
}

/** Seiten einer Sprache. Englisch liegt ohne Präfix unter /, Deutsch unter /de. */
function localizedRoutes(lang: Lang): Routes {
  return [
    staticPage(lang, 'home', loadHome),
    page(lang, 'post', routePath(postPath(':slug', lang), lang), {
      loadComponent: loadPost,
      ...postRouteExtras(lang),
    }),
    staticPage(lang, 'imprint', loadLegal),
    staticPage(lang, 'privacy', loadLegal),
    // Wird als 404.html vorgerendert (scripts/postbuild.mjs)
    page(lang, 'notFound', routePath(pagePath('notFound', lang), lang), {
      loadComponent: loadNotFound,
    }),
    page(lang, 'notFound', '**', { loadComponent: loadNotFound }),
  ];
}

export const routes: Routes = [
  { path: 'de', children: localizedRoutes('de') },
  ...localizedRoutes('en'),
];
