import { Component, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { de } from './de';
import { en } from './en';
import { LanguageService, PAGE_STATE_KEY } from './language.service';

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

  it('hands the state of each page to the browser', async () => {
    await harness.navigateByUrl('/de/impressum');
    expect(TestBed.inject(TransferState).get(PAGE_STATE_KEY, null)).toEqual({
      lang: 'de',
      page: 'imprint',
      alternates: { en: '/imprint', de: '/de/impressum' },
      path: '/de/impressum',
    });
  });
});

describe('LanguageService before the first navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('starts with the state of the prerendered page', () => {
    TestBed.inject(TransferState).set(PAGE_STATE_KEY, {
      lang: 'de',
      page: 'post',
      alternates: { en: '/blog/a', de: '/de/blog/a' },
      path: '/de/blog/a',
    });
    const service = TestBed.inject(LanguageService);
    expect(service.lang()).toBe('de');
    expect(service.switchTarget()).toEqual({ lang: 'en', path: '/blog/a' });
  });

  it('falls back to the router without a prerendered page', () => {
    const service = TestBed.inject(LanguageService);
    expect(service.lang()).toBe('en');
    expect(service.page()).toBe('notFound');
  });
});
