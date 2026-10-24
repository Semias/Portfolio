import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { HomePage } from './features/home/home.page';
import { NotFoundPage } from './features/not-found/not-found.page';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('wraps the routed page in header, main landmark and footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-site-header header')).not.toBeNull();
    expect(element.querySelector('main#main router-outlet')).not.toBeNull();
    expect(element.querySelector('app-site-footer footer')).not.toBeNull();
  });

  it('offers a skip link that moves focus to the main content', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/de');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const skip = element.querySelector<HTMLAnchorElement>('.skip-link');
    const main = element.querySelector<HTMLElement>('main');
    if (!skip || !main) throw new Error('skip link or main missing');
    main.scrollIntoView = vi.fn();

    expect(skip.textContent?.trim()).toBe('Zum Inhalt springen');
    expect(skip.getAttribute('href')).toBe('/de#main');
    skip.click();
    expect(document.activeElement).toBe(main);
  });
});

describe('routes', () => {
  async function render(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(url);
    return { harness, component };
  }

  it.each([
    ['/', HomePage],
    ['/de', HomePage],
    ['/404', NotFoundPage],
    ['/de/404', NotFoundPage],
    ['/does-not-exist', NotFoundPage],
    ['/de/gibt-es-nicht', NotFoundPage],
  ])('%s shows the expected page', async (url, page) => {
    const { component } = await render(url);
    expect(component).toBeInstanceOf(page);
  });

  it('renders German texts under /de', async () => {
    const { harness } = await render('/de/gibt-es-nicht');
    expect(harness.routeNativeElement?.textContent).toContain('Seite nicht gefunden');
  });
});
