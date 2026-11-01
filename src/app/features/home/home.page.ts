import { Component, computed, inject } from '@angular/core';
import { PostsService } from '../../content/posts.service';
import { LanguageService } from '../../core/i18n/language.service';
import { pageMeta } from '../../core/seo/seo.service';
import { NetworkBackground } from '../../shared/three/network-background';
import { About } from './about/about';
import { BlogTeasers } from './blog-teasers/blog-teasers';
import { Contact } from './contact/contact';
import { Cv } from './cv/cv';
import { Hero } from './hero/hero';
import { InfoStrip } from './info-strip/info-strip';
import { Projects } from './projects/projects';
import { SectionSnap } from './section-snap.directive';

@Component({
  selector: 'app-home-page',
  hostDirectives: [SectionSnap],
  imports: [NetworkBackground, Hero, InfoStrip, About, Cv, Projects, BlogTeasers, Contact],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly language = inject(LanguageService);
  private readonly posts = inject(PostsService);
  /** Ohne Beiträge entfällt die Blog-Sektion, der Kontakt rückt eine Nummer vor */
  protected readonly hasPosts = computed(() => this.posts.hasPosts(this.language.lang()));

  constructor() {
    const t = this.language.t;
    pageMeta(() => ({ title: t().meta.homeTitle, description: t().meta.homeDescription }));
  }
}
