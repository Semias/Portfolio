import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { mockMatchMedia } from '../../../testing/media';
import { routes } from '../../app.routes';
import { SITE } from '../../core/site';
import { LEGAL } from './legal-content';
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
    ['/imprint', 'Imprint'],
    ['/de/impressum', 'Impressum'],
    ['/privacy', 'Privacy policy'],
    ['/de/datenschutz', 'Datenschutzerklärung'],
  ])('%s shows %s as a plain text page', async (url, heading) => {
    const { component, page } = await render(url);
    expect(component).toBeInstanceOf(LegalPage);
    expect(page.querySelector('h1')?.textContent).toBe(heading);
    expect(page.querySelector('app-glass-card, app-network-background')).toBeNull();
  });

  it('lists the imprint details line by line with a mail link', async () => {
    const { page } = await render('/de/impressum');
    const sections = [...page.querySelectorAll('section')];
    expect(sections.map((s) => s.querySelector('h2')?.textContent)).toEqual(
      LEGAL.imprint.de.sections.map((s) => s.heading),
    );
    expect(sections[0].querySelectorAll('br')).toHaveLength(3);
    expect(sections[0].textContent).toContain('Stefan Gall');
    expect(sections[1].querySelector('a')?.getAttribute('href')).toBe(`mailto:${SITE.email}`);
  });

  it('has the same structure in both languages', () => {
    for (const kind of ['imprint', 'privacy'] as const) {
      expect(LEGAL[kind].en.sections.map((s) => s.lines.length)).toEqual(
        LEGAL[kind].de.sections.map((s) => s.lines.length),
      );
    }
  });
});
