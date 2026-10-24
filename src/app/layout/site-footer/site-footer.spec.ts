import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ScrollService } from '../../core/scroll/scroll.service';
import { SiteFooter } from './site-footer';

@Component({ template: '' })
class Blank {}

describe('SiteFooter', () => {
  let fixture: ComponentFixture<SiteFooter>;
  let router: Router;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', pathMatch: 'full', component: Blank, data: { lang: 'en', page: 'home' } },
          { path: 'de/impressum', component: Blank, data: { lang: 'de', page: 'imprint' } },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(SiteFooter);
    element = fixture.nativeElement;
    await router.navigateByUrl('/');
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the copyright with the current year', () => {
    expect(element.textContent).toContain(`© ${new Date().getFullYear()} Stefan Gall`);
  });

  it('links to the imprint in the current language', async () => {
    const imprint = () => element.querySelectorAll('a')[0];
    expect(imprint().textContent?.trim()).toBe('Imprint');
    expect(imprint().getAttribute('href')).toBe('/imprint');

    await router.navigateByUrl('/de/impressum');
    await fixture.whenStable();
    expect(imprint().textContent?.trim()).toBe('Impressum');
    expect(imprint().getAttribute('href')).toBe('/de/impressum');
  });

  it('scrolls back to the top', async () => {
    const scroll = TestBed.inject(ScrollService);
    const animate = vi.spyOn(scroll, 'animateTo').mockReturnValue(0);
    const top = element.querySelectorAll('a')[1];
    expect(top.getAttribute('href')).toBe('/#top');
    top.click();
    expect(animate).toHaveBeenCalledWith(0, undefined);

    await router.navigateByUrl('/de/impressum');
    await fixture.whenStable();
    expect(top.textContent?.trim()).toBe('↑ nach oben');
    expect(top.getAttribute('href')).toBe('/de/impressum#top');
    top.click();
    expect(animate).toHaveBeenLastCalledWith(0, 600);
  });
});
