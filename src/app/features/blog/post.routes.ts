import { inject } from '@angular/core';
import { CanMatchFn, ResolveFn, Route, UrlSegment } from '@angular/router';
import { Post } from '../../content/post';
import { PostsService } from '../../content/posts.service';
import { Alternates } from '../../core/i18n/language.service';
import { Lang } from '../../core/i18n/paths';

/** Alles, was die Beitragsseite braucht, vor dem Anzeigen geladen */
export interface PostView {
  post: Post;
  html: string;
  related: Post[];
}

function slugOf(segments: UrlSegment[]): string {
  return segments[segments.length - 1]?.path ?? '';
}

/** Unbekannte oder noch nicht veröffentlichte Beiträge fallen auf die 404-Seite durch */
export function postExists(lang: Lang): CanMatchFn {
  return (_route, segments) => inject(PostsService).find(slugOf(segments), lang) !== undefined;
}

export function postViewResolver(lang: Lang): ResolveFn<PostView> {
  return async (route) => {
    const posts = inject(PostsService);
    const post = posts.find(route.paramMap.get('slug') ?? '', lang);
    if (!post) throw new Error(`Beitrag ${route.paramMap.get('slug')} (${lang}) fehlt`);
    return { post, html: await posts.body(post), related: posts.related(post) };
  };
}

/** Sprachumschalter und hreflang: nur Sprachen, in denen es den Beitrag gibt */
export const postAlternatesResolver: ResolveFn<Alternates> = (route) =>
  inject(PostsService).alternates(route.paramMap.get('slug') ?? '');

export function postRouteExtras(lang: Lang): Partial<Route> {
  return {
    canMatch: [postExists(lang)],
    resolve: { view: postViewResolver(lang), alternates: postAlternatesResolver },
  };
}
