import { DOCUMENT, ViewportScroller, isPlatformBrowser } from '@angular/common';
import {
  ApplicationConfig,
  ApplicationRef,
  PLATFORM_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  Router,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

/** Anker-Sprünge des Routers halten denselben Abstand wie scroll-padding-top (fixierter Header) */
function headerOffset(): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
  const root = inject(DOCUMENT).documentElement;
  inject(ViewportScroller).setOffset(() => [
    0,
    parseFloat(getComputedStyle(root).scrollPaddingTop) || 0,
  ]);
}

/**
 * Der Router scrollt nach Navigationen erst, wenn die App nach dem Hydrieren stabil ist. Wer vorher
 * schon weiternavigiert (etwa vom Impressum zu /#work), bliebe sonst an der alten Stelle stehen.
 * Die erste Navigation hat der Browser mit der vorgerenderten Seite bereits erledigt.
 */
function scrollAfterHydration(): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
  const router = inject(Router);
  const scroller = inject(ViewportScroller);
  void inject(ApplicationRef)
    .whenStable()
    .then(() => {
      const navigation = router.lastSuccessfulNavigation();
      if (!navigation || navigation.id === 1 || navigation.trigger === 'popstate') return;
      const anchor = navigation.finalUrl?.fragment;
      if (anchor) scroller.scrollToAnchor(anchor);
      else scroller.scrollToPosition([0, 0]);
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withComponentInputBinding(),
    ),
    provideClientHydration(),
    provideAppInitializer(headerOffset),
    provideAppInitializer(scrollAfterHydration),
  ],
};
