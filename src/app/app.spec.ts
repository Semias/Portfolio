import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { HomePage } from './features/home/home.page';
import { NotFoundPage } from './features/not-found/not-found.page';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('renders the routed page inside the main landmark', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const main = (fixture.nativeElement as HTMLElement).querySelector('main#main');
    expect(main).not.toBeNull();
    expect(main?.querySelector('router-outlet')).not.toBeNull();
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
