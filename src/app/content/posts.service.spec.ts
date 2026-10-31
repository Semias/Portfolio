import { TestBed } from '@angular/core/testing';
import { fakePost, providePosts } from '../../testing/posts';
import { POSTS } from './posts.generated';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  const posts = [
    fakePost({ slug: 'newest', category: 'Ops', date: '2026-10-01' }),
    fakePost({ slug: 'rbac', category: 'Identity', date: '2026-09-12' }),
    fakePost({ slug: 'rbac', lang: 'de', category: 'Identity', date: '2026-09-12' }),
    fakePost({ slug: 'older', category: 'Identity', date: '2025-01-01' }),
    fakePost({ slug: 'teaser', category: 'Identity', date: null, published: false }),
    fakePost({ slug: 'only-en', category: 'Ops', date: '2024-01-01' }),
  ];
  let service: PostsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: providePosts(posts) });
    service = TestBed.inject(PostsService);
  });

  it('filters by language and keeps the order', () => {
    expect(service.forLang('en').map((p) => p.slug)).toEqual([
      'newest',
      'rbac',
      'older',
      'teaser',
      'only-en',
    ]);
    expect(service.forLang('de').map((p) => p.slug)).toEqual(['rbac']);
  });

  it('finds published posts only', () => {
    expect(service.find('rbac', 'de')?.lang).toBe('de');
    expect(service.find('teaser', 'en')).toBeUndefined();
    expect(service.find('missing', 'en')).toBeUndefined();
    expect(service.publishedSlugs('en')).toEqual(['newest', 'rbac', 'older', 'only-en']);
  });

  it('loads the body lazily', async () => {
    await expect(service.body(posts[1])).resolves.toBe('<p>Body of en/rbac</p>');
    await expect(service.body(posts[4])).rejects.toThrow('Kein Text');
  });

  it('suggests the same category first, then published posts, then the newest', () => {
    expect(service.related(posts[1]).map((p) => p.slug)).toEqual(['older', 'teaser']);
    expect(service.related(posts[0], 3).map((p) => p.slug)).toEqual(['only-en', 'rbac', 'older']);
    expect(service.related(posts[2])).toEqual([]);
  });

  it('lists the languages a post exists in', () => {
    expect(service.alternates('rbac')).toEqual({ en: '/blog/rbac', de: '/de/blog/rbac' });
    expect(service.alternates('only-en')).toEqual({ en: '/blog/only-en' });
    expect(service.alternates('teaser')).toEqual({});
  });
});

describe('generated posts', () => {
  it('come from content/blog', () => {
    expect(POSTS.length).toBeGreaterThan(0);
    expect(POSTS.every((post) => post.title && post.category)).toBe(true);
  });
});
