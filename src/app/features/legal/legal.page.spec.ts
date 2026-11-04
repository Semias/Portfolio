import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { mockMatchMedia } from '../../../testing/media';
import { routes } from '../../app.routes';
import { SITE } from '../../core/site';
import { LEGAL } from './legal-content';
import de from './legal.de.json';
import en from './legal.en.json';
import { LegalPage } from './legal.page';

describe('LegalPage', () => {
  async function render(url: string) {
    mockMatchMedia();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
    });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(url);
    return { component, page: harness.routeNativeElement as HTMLElement };
  }

  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['/imprint', 'Imprint', 'Imprint · Stefan Gall'],
    ['/de/impressum', 'Impressum', 'Impressum · Stefan Gall'],
    ['/privacy', 'Privacy Policy', 'Privacy · Stefan Gall'],
    ['/de/datenschutz', 'Datenschutzerklärung', 'Datenschutz · Stefan Gall'],
  ])('%s shows %s as a plain text page', async (url, heading, title) => {
    const { component, page } = await render(url);
    expect(component).toBeInstanceOf(LegalPage);
    expect(page.querySelector('h1')?.textContent).toBe(heading);
    expect(TestBed.inject(Title).getTitle()).toBe(title);
    expect(page.querySelector('app-glass-card, app-network-background')).toBeNull();
  });

  it('lists the imprint details line by line with a mail link', async () => {
    const { page } = await render('/de/impressum');
    const sections = [...page.querySelectorAll('section')];
    expect(sections.map((s) => s.querySelector('h2')?.textContent)).toEqual(
      LEGAL.imprint.de.sections.map((s) => s.heading),
    );
    expect(sections[0].querySelectorAll('p')).toHaveLength(1);
    expect(sections[0].querySelectorAll('br')).toHaveLength(
      de.imprint.sections[0].lines.length - 1,
    );
    expect(sections[0].textContent).toContain('Stefan Gall');
    expect(sections[1].querySelector('a')?.getAttribute('href')).toBe(`mailto:${SITE.email}`);
  });

  it('shows the privacy policy as paragraphs and lists', async () => {
    const { page } = await render('/de/datenschutz');
    const sections = [...page.querySelectorAll('section')];
    expect(sections).toHaveLength(LEGAL.privacy.de.sections.length);

    const controller = sections[0];
    expect(controller.querySelector('a')?.getAttribute('href')).toBe(`mailto:${SITE.email}`);
    expect(controller.textContent).toContain('Stefan Gall');

    const hosting = sections.find((s) => s.querySelector('h2')?.textContent?.includes('Hosting'));
    expect(hosting?.querySelectorAll('p').length).toBeGreaterThan(1);
    expect(hosting?.querySelector('br')).toBeNull();
    expect(hosting?.querySelector('a')?.getAttribute('href')).toBe(
      'https://www.cloudflare.com/privacypolicy/',
    );

    const rights = sections.find((s) => s.querySelector('h2')?.textContent === 'Ihre Rechte');
    expect(rights?.querySelectorAll('li').length).toBe(6);
    expect(rights?.textContent).toContain(SITE.email);
    expect(page.textContent).not.toMatch(/\{\w+\}/);
  });

  it('has the same structure in both languages', () => {
    // Gleiche Abschnitte, Zeilen, Absätze und Listen, damit keine Übersetzung fehlt
    function shape(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(shape);
      if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]));
      }
      return typeof value;
    }
    expect(shape(en)).toEqual(shape(de));
  });
});
