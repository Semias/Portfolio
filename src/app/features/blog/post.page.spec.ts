import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { mockMatchMedia } from '../../../testing/media';
import { fakePost, providePosts } from '../../../testing/posts';
import { routes } from '../../app.routes';
import { serverRoutes } from '../../app.routes.server';
import { LanguageService } from '../../core/i18n/language.service';
import { NotFoundPage } from '../not-found/not-found.page';
import { PostPage } from './post.page';

const posts = [
  fakePost({
    slug: 'roles',
    title: 'Roles without pain',
    titleParts: [
      { text: 'Roles without ', accent: false },
      { text: 'pain', accent: true },
    ],
    teaser: 'Why ownership matters.',
    category: 'Identity',
    date: '2026-09-12',
    readingMinutes: 4,
    tags: ['RBAC', 'TypeScript'],
    toc: [
      { id: 'first', label: 'First', n: '01' },
      { id: 'second', label: 'Second', n: '02' },
    ],
  }),
  fakePost({ slug: 'roles', lang: 'de', title: 'Rollen', category: 'Identity' }),
  fakePost({ slug: 'other', title: 'Other identity post', category: 'Identity' }),
  fakePost({ slug: 'soon', title: 'Soon', published: false, date: null }),
  fakePost({ slug: 'english-only', title: 'Only English', tags: [], toc: [] }),
];

describe('PostPage', () => {
  async function render(url: string) {
    mockMatchMedia();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding()), providePosts(posts)],
    });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(url);
    return { harness, component, page: harness.routeNativeElement as HTMLElement };
  }

  afterEach(() => vi.restoreAllMocks());

  it('renders head, contents, body and tags of a post', async () => {
    const { component, page } = await render('/blog/roles');
    expect(component).toBeInstanceOf(PostPage);

    expect(page.querySelector('.back')?.getAttribute('href')).toBe('/#writing');
    expect(page.querySelector('.category')?.textContent).toBe('Identity');
    expect(page.querySelector('time')?.getAttribute('datetime')).toBe('2026-09-12');
    expect(page.querySelector('time')?.textContent).toBe('Sep 12, 2026');
    expect(page.querySelector('.meta')?.textContent).toContain('4 min read');
    expect(page.querySelector('h1')?.textContent?.trim()).toBe('Roles without pain');
    expect(page.querySelector('h1 .accent')?.textContent).toBe('pain');
    expect(page.querySelector('.teaser')?.textContent).toBe('Why ownership matters.');

    const toc = [...page.querySelectorAll<HTMLAnchorElement>('.toc a')];
    expect(toc.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['01First', '/blog/roles#first'],
      ['02Second', '/blog/roles#second'],
    ]);
    expect(page.querySelector('app-post-body')?.innerHTML).toBe('<p>Body of en/roles</p>');
    expect([...page.querySelectorAll('.tags app-tag')].map((t) => t.textContent)).toEqual([
      'RBAC',
      'TypeScript',
    ]);
  });

  it('suggests related posts and links to the contact section', async () => {
    const { page } = await render('/blog/roles');
    expect([...page.querySelectorAll('.more h3')].map((h) => h.textContent?.trim())).toEqual([
      'Other identity post',
      'Only English',
    ]);
    const cta = page.querySelector<HTMLAnchorElement>('.cta a');
    expect(cta?.getAttribute('href')).toBe('/#contact');
    expect(cta?.textContent?.trim()).toBe('Get in touch');
  });

  it('renders German posts with German labels', async () => {
    const { page } = await render('/de/blog/roles');
    expect(page.querySelector('h1')?.textContent?.trim()).toBe('Rollen');
    expect(page.querySelector('.back')?.textContent?.trim()).toBe('Alle Beiträge');
    expect(page.querySelector('.back')?.getAttribute('href')).toBe('/de#writing');
    expect(page.querySelector('time')?.textContent).toBe('12. Sep 2026');
    expect(page.querySelector('.meta')?.textContent).toContain('3 Min. Lesezeit');
  });

  it('switches language to the same post or, if missing, to the other home page', async () => {
    const { harness } = await render('/blog/roles');
    const language = TestBed.inject(LanguageService);
    expect(language.page()).toBe('post');
    expect(language.switchTarget()).toEqual({ lang: 'de', path: '/de/blog/roles' });

    await harness.navigateByUrl('/blog/english-only');
    expect(language.switchTarget()).toEqual({ lang: 'de', path: '/de' });
  });

  it('leaves out contents, tags and related posts when there are none', async () => {
    TestBed.resetTestingModule();
    mockMatchMedia();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        providePosts([fakePost({ slug: 'alone', tags: [], toc: [] })]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/blog/alone');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('.toc')).toBeNull();
    expect(page.querySelector('.tags')).toBeNull();
    expect(page.querySelector('.more')).toBeNull();
  });

  it.each(['/blog/soon', '/blog/missing', '/de/blog/english-only'])(
    'shows the not-found page for %s',
    async (url) => {
      const { component } = await render(url);
      expect(component).toBeInstanceOf(NotFoundPage);
    },
  );
});

describe('server routes', () => {
  it('prerender every published post per language', async () => {
    TestBed.configureTestingModule({ providers: providePosts(posts) });
    const params = async (path: string) => {
      const route = serverRoutes.find((r) => r.path === path) as {
        getPrerenderParams: () => Promise<Record<string, string>[]>;
      };
      return TestBed.runInInjectionContext(() => route.getPrerenderParams());
    };
    expect(await params('blog/:slug')).toEqual([
      { slug: 'roles' },
      { slug: 'other' },
      { slug: 'english-only' },
    ]);
    expect(await params('de/blog/:slug')).toEqual([{ slug: 'roles' }]);
  });
});
