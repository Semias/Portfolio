import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { mockMatchMedia } from '../../../testing/media';
import { ScrollService } from '../../core/scroll/scroll.service';
import { ThemeService } from '../../core/theme/theme.service';
import { SiteHeader } from './site-header';

@Component({ template: '' })
class Blank {}

describe('SiteHeader', () => {
  let fixture: ComponentFixture<SiteHeader>;
  let router: Router;
  let element: HTMLElement;

  async function go(url: string) {
    await router.navigateByUrl(url);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    mockMatchMedia();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'de',
            children: [
              {
                path: '',
                pathMatch: 'full',
                component: Blank,
                data: { lang: 'de', page: 'home', alternates: { en: '/', de: '/de' } },
              },
            ],
          },
          {
            path: '',
            pathMatch: 'full',
            component: Blank,
            data: { lang: 'en', page: 'home', alternates: { en: '/', de: '/de' } },
          },
          {
            path: 'imprint',
            component: Blank,
            data: { lang: 'en', page: 'imprint', alternates: { en: '/imprint' } },
          },
          { path: 'blog/a-post', component: Blank, data: { lang: 'en', page: 'post' } },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SiteHeader);
    element = fixture.nativeElement;
    await go('/');
  });

  afterEach(() => vi.restoreAllMocks());

  function navLinks() {
    return [...element.querySelectorAll<HTMLAnchorElement>('.site-nav a')];
  }

  it('lists the five sections of the home page', () => {
    expect(navLinks().map((a) => [a.textContent?.trim(), a.getAttribute('href')])).toEqual([
      ['About', '/#about'],
      ['CV', '/#cv'],
      ['Projects', '/#work'],
      ['Blog', '/#writing'],
      ['Contact', '/#contact'],
    ]);
  });

  it('uses German labels and paths under /de', async () => {
    await go('/de');
    expect(navLinks()[0].textContent?.trim()).toBe('Über mich');
    expect(navLinks()[0].getAttribute('href')).toBe('/de#about');
    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Hauptnavigation');
  });

  it('scrolls to the section on the home page', () => {
    const scroll = TestBed.inject(ScrollService);
    const spy = vi.spyOn(scroll, 'scrollToId').mockReturnValue(true);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    navLinks()[1].dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith('cv');
    expect(event.defaultPrevented).toBe(true);
  });

  it('navigates to the home page section from other pages', async () => {
    await go('/imprint');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    navLinks()[2].click();
    expect(navigate).toHaveBeenCalledWith('/#work');
  });

  it('leaves modified clicks to the browser', () => {
    const scroll = TestBed.inject(ScrollService);
    const spy = vi.spyOn(scroll, 'scrollToId');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    navLinks()[0].dispatchEvent(event);
    expect(spy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('scrolls to the top via the logo on the home page and navigates home elsewhere', async () => {
    const scroll = TestBed.inject(ScrollService);
    const animate = vi.spyOn(scroll, 'animateTo').mockReturnValue(0);
    const logo = element.querySelector<HTMLAnchorElement>('.logo');
    expect(logo?.getAttribute('aria-label')).toBe('Stefan Gall, home');
    logo?.click();
    expect(animate).toHaveBeenCalledWith(0);

    await go('/imprint');
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    element.querySelector<HTMLAnchorElement>('.logo')?.click();
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('toggles the theme with a descriptive label', async () => {
    const theme = TestBed.inject(ThemeService);
    const button = element.querySelector<HTMLButtonElement>('.theme-toggle');
    expect(button?.getAttribute('aria-label')).toBe('Switch to light theme');

    button?.click();
    await fixture.whenStable();
    expect(theme.theme()).toBe('light');
    expect(button?.getAttribute('aria-label')).toBe('Switch to dark theme');

    await go('/de');
    expect(button?.getAttribute('aria-label')).toBe('Zu dunklem Design wechseln');
  });

  it('switches to the same page in the other language', async () => {
    const link = () => element.querySelector<HTMLAnchorElement>('.lang-switch');
    expect(link()?.getAttribute('href')).toBe('/de');
    expect(link()?.textContent?.trim()).toBe('DE');
    expect(link()?.getAttribute('hreflang')).toBe('de');
    expect(link()?.getAttribute('aria-label')).toBe('DE, Deutsche Version');

    await go('/de');
    expect(link()?.getAttribute('href')).toBe('/');
    expect(link()?.textContent?.trim()).toBe('EN');
  });

  it('falls back to the other home page when a page exists in one language only', async () => {
    await go('/imprint');
    expect(element.querySelector('.lang-switch')?.getAttribute('href')).toBe('/de');
  });

  it('becomes compact after scrolling', async () => {
    const header = element.querySelector('header');
    expect(header?.classList.contains('is-compact')).toBe(false);

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 200 });
    window.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await fixture.whenStable();
    expect(header?.classList.contains('is-compact')).toBe(true);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  it('shows the reading progress only on posts', async () => {
    expect(element.querySelector('.progress')).toBeNull();
    await go('/blog/a-post');
    expect(element.querySelector('.progress')).not.toBeNull();
  });
});
