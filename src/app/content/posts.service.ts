import { Injectable, InjectionToken, inject } from '@angular/core';
import { Alternates } from '../core/i18n/language.service';
import { LANGS, Lang, postPath } from '../core/i18n/paths';
import { Post } from './post';
import { POSTS, POST_BODIES } from './posts.generated';

/** Alle Beiträge (ohne Text), in Tests austauschbar */
export const POSTS_DATA = new InjectionToken<readonly Post[]>('POSTS_DATA', {
  providedIn: 'root',
  factory: () => POSTS,
});

/** Lader für die Beitragstexte, Schlüssel „sprache/slug“ */
export const POST_BODY_LOADERS = new InjectionToken<
  Readonly<Record<string, () => Promise<string>>>
>('POST_BODY_LOADERS', { providedIn: 'root', factory: () => POST_BODIES });

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly posts = inject(POSTS_DATA);
  private readonly bodies = inject(POST_BODY_LOADERS);

  /** Beiträge einer Sprache, neueste zuerst, reine Teaser am Ende */
  forLang(lang: Lang): Post[] {
    return this.posts.filter((post) => post.lang === lang);
  }

  /** Veröffentlichter Beitrag, sonst undefined */
  find(slug: string, lang: Lang): Post | undefined {
    return this.posts.find((post) => post.slug === slug && post.lang === lang && post.published);
  }

  /** Slugs aller veröffentlichten Beiträge einer Sprache, für das Prerendering */
  publishedSlugs(lang: Lang): string[] {
    return this.forLang(lang)
      .filter((post) => post.published)
      .map((post) => post.slug);
  }

  /** Lädt den HTML-Text eines veröffentlichten Beitrags (eigener Chunk) */
  async body(post: Post): Promise<string> {
    const load = this.bodies[`${post.lang}/${post.slug}`];
    if (!load) throw new Error(`Kein Text für ${post.lang}/${post.slug}`);
    return load();
  }

  /** „Weiterlesen“: zuerst dieselbe Kategorie, dann veröffentlichte vor Teasern, dann die neuesten */
  related(post: Post, count = 2): Post[] {
    const others = this.forLang(post.lang).filter((other) => other.slug !== post.slug);
    const rank = (other: Post) =>
      (other.category === post.category ? 0 : 2) + (other.published ? 0 : 1);
    return others
      .map((other, index) => ({ other, index }))
      .sort((a, b) => rank(a.other) - rank(b.other) || a.index - b.index)
      .slice(0, count)
      .map(({ other }) => other);
  }

  /** Pfade desselben Beitrags in den Sprachen, in denen er veröffentlicht ist */
  alternates(slug: string): Alternates {
    return Object.fromEntries(
      LANGS.filter((lang) => this.find(slug, lang)).map((lang) => [lang, postPath(slug, lang)]),
    );
  }
}
