import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { de } from './de';
import { en } from './en';
import { LanguageService } from './language.service';

@Component({ template: '' })
class Blank {}

describe('LanguageService', () => {
  let harness: RouterTestingHarness;
  let service: LanguageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'de',
            children: [
              { path: '', pathMatch: 'full', component: Blank, data: { lang: 'de', page: 'home' } },
              {
                path: 'impressum',
                component: Blank,
                data: {
                  lang: 'de',
                  page: 'imprint',
                  alternates: { en: '/imprint', de: '/de/impressum' },
                },
              },
            ],
          },
          { path: '', pathMatch: 'full', component: Blank, data: { lang: 'en', page: 'home' } },
          { path: 'without-data', component: Blank },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    service = TestBed.inject(LanguageService);
  });

  it('defaults to English under /', async () => {
    await harness.navigateByUrl('/');
    expect(service.lang()).toBe('en');
    expect(service.page()).toBe('home');
    expect(service.t()).toBe(en);
  });

  it('reads language and page from the deepest route', async () => {
    await harness.navigateByUrl('/de/impressum');
    expect(service.lang()).toBe('de');
    expect(service.page()).toBe('imprint');
    expect(service.t()).toBe(de);
  });

  it('sets the lang attribute of the document', async () => {
    await harness.navigateByUrl('/de');
    TestBed.tick();
    expect(document.documentElement.lang).toBe('de');

    await harness.navigateByUrl('/');
    TestBed.tick();
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to English and the not-found page for routes without data', async () => {
    await harness.navigateByUrl('/without-data');
    expect(service.lang()).toBe('en');
    expect(service.page()).toBe('notFound');
  });

  it('exposes the current path without query and fragment', async () => {
    await harness.navigateByUrl('/de/impressum?x=1#top');
    expect(service.path()).toBe('/de/impressum');
  });

  it('switches to the same page in the other language when it exists', async () => {
    await harness.navigateByUrl('/de/impressum');
    expect(service.alternates()).toEqual({ en: '/imprint', de: '/de/impressum' });
    expect(service.switchTarget()).toEqual({ lang: 'en', path: '/imprint' });
  });

  it('switches to the home page of the other language otherwise', async () => {
    await harness.navigateByUrl('/');
    expect(service.alternates()).toEqual({});
    expect(service.switchTarget()).toEqual({ lang: 'de', path: '/de' });
  });

  it('gives access to the messages of the other language', () => {
    expect(service.messagesFor('de')).toBe(de);
  });
});
