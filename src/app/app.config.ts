import { DOCUMENT, ViewportScroller, isPlatformBrowser } from '@angular/common';
import {
  ApplicationConfig,
  PLATFORM_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
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
  ],
};
