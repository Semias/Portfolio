import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { de } from './de';
import { en } from './en';
import { Messages } from './messages';
import { DEFAULT_LANG, Lang, PageKey, isLang } from './paths';

const MESSAGES: Record<Lang, Messages> = { en, de };

/** Daten, die jede Route mitbringt (siehe app.routes.ts) */
export interface PageRouteData {
  lang: Lang;
  page: PageKey;
}

/** Sprache und Seite kommen aus der URL. Es gibt keine Weiterleitung nach Browsersprache. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly state = signal<PageRouteData>({ lang: DEFAULT_LANG, page: 'home' });

  readonly lang = computed(() => this.state().lang);
  readonly page = computed(() => this.state().page);
  readonly t = computed(() => MESSAGES[this.lang()]);

  constructor() {
    this.state.set(readRouteData(this.router.routerState.snapshot.root));
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.state.set(readRouteData(this.router.routerState.snapshot.root)));

    effect(() => {
      this.document.documentElement.lang = this.lang();
    });
  }

  messagesFor(lang: Lang): Messages {
    return MESSAGES[lang];
  }
}

function readRouteData(root: ActivatedRouteSnapshot): PageRouteData {
  let route = root;
  while (route.firstChild) route = route.firstChild;
  const lang = route.data['lang'];
  const page = route.data['page'];
  return {
    lang: isLang(lang) ? lang : DEFAULT_LANG,
    page: typeof page === 'string' ? (page as PageKey) : 'notFound',
  };
}
