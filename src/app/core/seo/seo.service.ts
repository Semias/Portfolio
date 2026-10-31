import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LanguageService } from '../i18n/language.service';
import { DEFAULT_LANG, LANGS, Lang } from '../i18n/paths';
import { SITE } from '../site';

export interface PageMeta {
  title: string;
  description: string;
  type?: 'website' | 'article';
  /** Nicht indexieren, z. B. die 404-Seite */
  noindex?: boolean;
  /** JJJJ-MM-TT, für Beiträge */
  publishedTime?: string | null;
}

const OG_LOCALE: Record<Lang, string> = { en: 'en_US', de: 'de_DE' };

/** Titel, Description, Canonical, hreflang und Open Graph je Seite. theme-color setzt der ThemeService. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly language = inject(LanguageService);

  set(page: PageMeta): void {
    const lang = this.language.lang();
    const alternates = this.language.alternates();
    const canonical = page.noindex ? null : absolute(alternates[lang] ?? this.language.path());

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    if (page.noindex) this.meta.updateTag({ name: 'robots', content: 'noindex' });
    else this.meta.removeTag('name="robots"');

    this.meta.updateTag({ property: 'og:site_name', content: SITE.name });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:type', content: page.type ?? 'website' });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALE[lang] });
    this.meta.removeTag('property="og:locale:alternate"');
    for (const other of LANGS.filter((l) => l !== lang && alternates[l])) {
      this.meta.addTag({ property: 'og:locale:alternate', content: OG_LOCALE[other] });
    }
    if (canonical) this.meta.updateTag({ property: 'og:url', content: canonical });
    else this.meta.removeTag('property="og:url"');
    if (page.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: page.publishedTime });
    } else {
      this.meta.removeTag('property="article:published_time"');
    }
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });

    this.setLinks(canonical, page.noindex ? {} : alternates);
  }

  private setLinks(canonical: string | null, alternates: Partial<Record<Lang, string>>): void {
    const head = this.document.head;
    head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
      .forEach((link) => link.remove());
    if (canonical) head.appendChild(this.link({ rel: 'canonical', href: canonical }));
    for (const lang of LANGS) {
      const path = alternates[lang];
      if (path)
        head.appendChild(this.link({ rel: 'alternate', hreflang: lang, href: absolute(path) }));
    }
    const fallback = alternates[DEFAULT_LANG];
    if (fallback) {
      head.appendChild(
        this.link({ rel: 'alternate', hreflang: 'x-default', href: absolute(fallback) }),
      );
    }
  }

  private link(attributes: Record<string, string>): HTMLLinkElement {
    const link = this.document.createElement('link');
    for (const [name, value] of Object.entries(attributes)) link.setAttribute(name, value);
    return link;
  }
}

function absolute(path: string): string {
  return path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`;
}

/** Meta-Daten einer Seite, aktualisiert sich mit Sprache und Inhalt. Im Konstruktor aufrufen. */
export function pageMeta(factory: () => PageMeta): void {
  const seo = inject(SeoService);
  effect(() => seo.set(factory()));
}
