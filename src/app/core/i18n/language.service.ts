import { DOCUMENT } from '@angular/common';
import {
  Injectable,
  TransferState,
  computed,
  effect,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { de } from './de';
import { en } from './en';
import { Messages } from './messages';
import { DEFAULT_LANG, Lang, PageKey, isLang, otherLang, pagePath } from './paths';

const MESSAGES: Record<Lang, Messages> = { en, de };

/** Dieselbe Seite in den Sprachen, in denen es sie gibt */
export type Alternates = Partial<Record<Lang, string>>;

/** Daten, die jede Route mitbringt (siehe app.routes.ts). `alternates` kann auch ein Resolver liefern. */
export interface PageRouteData {
  lang: Lang;
  page: PageKey;
  alternates?: Alternates;
}

export interface PageState extends Required<PageRouteData> {
  /** Aktueller Pfad ohne Query und Fragment */
  path: string;
}

/**
 * Zustand der vorgerenderten Seite. Im Browser gilt er, bis der Router seine erste Navigation
 * abgeschlossen hat; sonst zeigten Header und Sprachumschalter beim Hydrieren kurz Englisch und
 * die Startseite.
 */
export const PAGE_STATE_KEY = makeStateKey<PageState>('page');

/** Sprache und Seite kommen aus der URL. Es gibt keine Weiterleitung nach Browsersprache. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly transferState = inject(TransferState);
  private readonly state = signal<PageState>(
    this.transferState.get(PAGE_STATE_KEY, null) ?? this.read(),
  );

  readonly lang = computed(() => this.state().lang);
  readonly page = computed(() => this.state().page);
  readonly path = computed(() => this.state().path);
  readonly alternates = computed(() => this.state().alternates);
  readonly t = computed(() => MESSAGES[this.lang()]);

  /** Ziel des Sprachumschalters: dieselbe Seite in der anderen Sprache, sonst deren Startseite */
  readonly switchTarget = computed(() => {
    const target = otherLang(this.lang());
    return { lang: target, path: this.alternates()[target] ?? pagePath('home', target) };
  });

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const state = this.read();
      this.state.set(state);
      // Auf dem Server landet der Zustand so im HTML (ng-state) für den Browser
      this.transferState.set(PAGE_STATE_KEY, state);
    });

    effect(() => {
      this.document.documentElement.lang = this.lang();
    });
  }

  messagesFor(lang: Lang): Messages {
    return MESSAGES[lang];
  }

  private read(): PageState {
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const { lang, page, alternates } = route.data;
    return {
      lang: isLang(lang) ? lang : DEFAULT_LANG,
      page: typeof page === 'string' ? (page as PageKey) : 'notFound',
      alternates: alternates && typeof alternates === 'object' ? (alternates as Alternates) : {},
      path: this.router.url.split(/[?#]/)[0] || '/',
    };
  }
}
