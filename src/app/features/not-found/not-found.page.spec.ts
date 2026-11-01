import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { NotFoundPage } from './not-found.page';

describe('NotFoundPage', () => {
  async function render(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(url);
    return { component, page: harness.routeNativeElement as HTMLElement };
  }

  it.each([
    ['/does-not-exist', 'Page not found.', 'Back to the homepage', '/'],
    ['/de/gibt-es-nicht', 'Seite nicht gefunden.', 'Zur Startseite', '/de'],
  ])('%s explains the error and links home', async (url, heading, home, homePath) => {
    const { component, page } = await render(url);
    expect(component).toBeInstanceOf(NotFoundPage);
    expect(page.querySelector('.kicker')?.textContent).toBe('404');
    expect(page.querySelector('h1')?.textContent).toBe(heading);
    const link = page.querySelector('a.home-link');
    expect(link?.textContent).toBe(home);
    expect(link?.getAttribute('href')).toBe(homePath);
  });

  it('keeps the page out of search engines', async () => {
    await render('/de/gibt-es-nicht');
    expect(document.title).toBe('Seite nicht gefunden · Stefan Gall');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
