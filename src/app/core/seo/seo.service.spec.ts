import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { mockMatchMedia } from '../../../testing/media';
import { fakePost, providePosts } from '../../../testing/posts';
import { routes } from '../../app.routes';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let harness: RouterTestingHarness;

  const head = () => document.head;
  const meta = (selector: string) =>
    head().querySelector(`meta[${selector}]`)?.getAttribute('content');
  const links = (rel: string) =>
    [...head().querySelectorAll(`link[rel="${rel}"]`)].map((link) =>
      [link.getAttribute('hreflang'), link.getAttribute('href')].filter(Boolean).join(' '),
    );

  async function go(url: string) {
    await harness.navigateByUrl(url);
    TestBed.tick();
  }

  beforeEach(async () => {
    document.head.innerHTML = '';
    mockMatchMedia();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        providePosts([
          fakePost({ slug: 'roles', title: 'Roles', teaser: 'Teaser.', date: '2026-09-12' }),
          fakePost({ slug: 'roles', lang: 'de', title: 'Rollen' }),
          fakePost({ slug: 'english', title: 'English only' }),
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => vi.restoreAllMocks());

  it('describes the home page with canonical URL and both languages', async () => {
    await go('/');
    expect(document.title).toBe('Stefan Gall · Software Engineer');
    expect(meta('name="description"')).toContain('Solution Expert and Software Engineer');
    expect(links('canonical')).toEqual(['https://gall-stefan.de/']);
    expect(links('alternate')).toEqual([
      'en https://gall-stefan.de/',
      'de https://gall-stefan.de/de',
      'x-default https://gall-stefan.de/',
    ]);
    expect(meta('property="og:url"')).toBe('https://gall-stefan.de/');
    expect(meta('property="og:type"')).toBe('website');
    expect(meta('property="og:locale"')).toBe('en_US');
    expect(meta('property="og:locale:alternate"')).toBe('de_DE');
    expect(meta('name="twitter:card"')).toBe('summary');
    expect(meta('name="robots"')).toBeUndefined();
  });

  it('switches to German meta data under /de', async () => {
    await go('/de/impressum');
    expect(document.title).toBe('Impressum · Stefan Gall');
    expect(links('canonical')).toEqual(['https://gall-stefan.de/de/impressum']);
    expect(meta('property="og:locale"')).toBe('de_DE');
  });

  it('marks posts as articles and links only existing translations', async () => {
    await go('/blog/roles');
    expect(document.title).toBe('Roles · Stefan Gall');
    expect(meta('name="description"')).toBe('Teaser.');
    expect(meta('property="og:type"')).toBe('article');
    expect(meta('property="article:published_time"')).toBe('2026-09-12');
    expect(links('alternate')).toHaveLength(3);

    await go('/blog/english');
    expect(links('alternate')).toEqual([
      'en https://gall-stefan.de/blog/english',
      'x-default https://gall-stefan.de/blog/english',
    ]);
    expect(head().querySelector('meta[property="og:locale:alternate"]')).toBeNull();
  });

  it('keeps the 404 page out of search results', async () => {
    await go('/blog/roles');
    await go('/gibt-es-nicht');
    expect(document.title).toBe('Page not found · Stefan Gall');
    expect(meta('name="robots"')).toBe('noindex');
    expect(links('canonical')).toEqual([]);
    expect(links('alternate')).toEqual([]);
    expect(head().querySelector('meta[property="og:url"]')).toBeNull();
    expect(head().querySelector('meta[property="article:published_time"]')).toBeNull();

    await go('/');
    expect(meta('name="robots"')).toBeUndefined();
  });

  it('can be set directly', () => {
    TestBed.inject(SeoService).set({ title: 'X', description: 'Y', noindex: true });
    expect(document.title).toBe('X');
    expect(meta('name="description"')).toBe('Y');
  });
});
