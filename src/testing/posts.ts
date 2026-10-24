import { Provider } from '@angular/core';
import { Post } from '../app/content/post';
import { POSTS_DATA, POST_BODY_LOADERS } from '../app/content/posts.service';

export function fakePost(overrides: Partial<Post> = {}): Post {
  const title = overrides.title ?? 'A post';
  return {
    slug: 'a-post',
    lang: 'en',
    title,
    titleParts: [{ text: title, accent: false }],
    teaser: 'Long teaser.',
    excerpt: 'Short teaser.',
    category: 'Identity',
    date: '2026-09-12',
    readingMinutes: 3,
    tags: ['RBAC'],
    toc: [],
    published: true,
    ...overrides,
  };
}

/** Feste Beiträge statt content/blog, Text eines Beitrags ist „<p>Body of sprache/slug</p>“ */
export function providePosts(posts: Post[]): Provider[] {
  return [
    { provide: POSTS_DATA, useValue: posts },
    {
      provide: POST_BODY_LOADERS,
      useValue: Object.fromEntries(
        posts
          .filter((post) => post.published)
          .map((post) => [
            `${post.lang}/${post.slug}`,
            () => Promise.resolve(`<p>Body of ${post.lang}/${post.slug}</p>`),
          ]),
      ),
    },
  ];
}
