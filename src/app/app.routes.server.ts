import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { PostsService } from './content/posts.service';
import { Lang } from './core/i18n/paths';

/** Jeder veröffentlichte Beitrag wird eine eigene vorgerenderte Seite */
function postParams(lang: Lang) {
  return async () =>
    inject(PostsService)
      .publishedSlugs(lang)
      .map((slug) => ({ slug }));
}

export const serverRoutes: ServerRoute[] = [
  { path: 'blog/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: postParams('en') },
  { path: 'de/blog/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: postParams('de') },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
