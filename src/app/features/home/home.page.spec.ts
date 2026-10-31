import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { mockMatchMedia } from '../../../testing/media';
import { fakePost, providePosts } from '../../../testing/posts';
import { routes } from '../../app.routes';
import { SITE } from '../../core/site';

describe('HomePage', () => {
  async function render(url: string, posts = [fakePost()]) {
    mockMatchMedia();
    TestBed.configureTestingModule({ providers: [provideRouter(routes), providePosts(posts)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return harness.routeNativeElement as HTMLElement;
  }

  afterEach(() => vi.restoreAllMocks());

  it('renders hero, info strip and the five sections in order', async () => {
    const page = await render('/');
    expect(page.querySelector('h1')?.textContent).toContain("Hi, I'm Stefan.");
    expect(page.querySelector('h1 .accent')?.textContent).toBe('digital products');
    expect([...page.querySelectorAll('[data-hub]')].map((s) => s.id || 'hero')).toEqual([
      'hero',
      'about',
      'cv',
      'work',
      'writing',
      'contact',
    ]);
    expect([...page.querySelectorAll('[data-hub]')].map((s) => s.getAttribute('data-hub'))).toEqual(
      ['0', '1', '2', '3', '4', '5'],
    );
    expect([...page.querySelectorAll('h2')].map((h) => h.textContent?.trim())).toEqual([
      'About me',
      'Curriculum',
      'Projects',
      'Blog',
      "Let's talk.",
    ]);
  });

  it('labels every section by its heading', async () => {
    const page = await render('/');
    for (const section of page.querySelectorAll('section[aria-labelledby]')) {
      const id = section.getAttribute('aria-labelledby') ?? '';
      expect(page.querySelector(`#${id}`), id).not.toBeNull();
    }
  });

  it('shows the portrait with alt text and high priority', async () => {
    const page = await render('/de');
    const img = page.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Porträt von Stefan Gall');
    expect(img?.getAttribute('src')).toBe('/images/portrait.webp');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
  });

  it('numbers the sections and projects', async () => {
    const page = await render('/');
    expect(
      [...page.querySelectorAll('app-section-kicker .number')].map((n) => n.textContent),
    ).toEqual(['01', '02', '03', '04', '05']);
    const projects = page.querySelectorAll('#work li');
    expect(projects).toHaveLength(5);
    expect(projects[0].querySelector('.number')?.textContent).toBe('01');
    expect(projects[4].querySelector('h3')?.textContent).toBe('Location access management');
    expect(projects[4].querySelector('app-tag')?.textContent?.trim()).toBe('access · iot');
  });

  it('shows the CV timeline with the current position first', async () => {
    const page = await render('/de');
    const entries = page.querySelectorAll('#cv li');
    expect(entries).toHaveLength(2);
    expect(entries[0].classList.contains('is-current')).toBe(true);
    expect(entries[0].querySelector('.period')?.textContent).toBe('2023 → heute');
    expect(entries[1].querySelector('.period')?.textContent).toBe('2021 → 2023');
    expect(entries[1].querySelector('.company')?.textContent).toBe('@cm city media GmbH');
  });

  it('shows at most three posts of the current language', async () => {
    const posts = ['a', 'b', 'c', 'd'].map((slug) => fakePost({ slug, title: slug }));
    posts.push(fakePost({ slug: 'de-only', lang: 'de', title: 'Deutsch' }));
    const page = await render('/', posts);
    expect([...page.querySelectorAll('#writing h3')].map((h) => h.textContent?.trim())).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('links e-mail, GitHub and LinkedIn in the contact section', async () => {
    const page = await render('/');
    const links = [...page.querySelectorAll<HTMLAnchorElement>('#contact a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      `mailto:${SITE.email}`,
      SITE.github,
      SITE.linkedin,
    ]);
    expect(links[0].classList).toContain('is-primary');
    expect(links[1].getAttribute('rel')).toBe('noreferrer');
  });

  it('links the profiles in the info strip', async () => {
    const page = await render('/');
    const links = [...page.querySelectorAll<HTMLAnchorElement>('app-info-strip a')];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['GitHub', 'LinkedIn']);
  });

  it('switches every text to German under /de', async () => {
    const page = await render('/de');
    expect(page.querySelector('h1')?.textContent).toContain('digitale Produkte');
    expect(page.querySelector('#about-heading')?.textContent).toBe('Über mich');
    expect(page.querySelector('#contact-heading')?.textContent).toBe('Lass uns sprechen.');
    expect(page.querySelector('#writing .note')?.textContent).toBe('notizen, unregelmäßig');
  });
});
