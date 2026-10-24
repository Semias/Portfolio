import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../core/i18n/format-date';
import { LanguageService } from '../../core/i18n/language.service';
import { pagePath, postPath } from '../../core/i18n/paths';
import { Icon } from '../../shared/ui/icon/icon';
import { PillButton } from '../../shared/ui/pill-button.directive';
import { Tag } from '../../shared/ui/tag/tag';
import { PostBody } from './post-body/post-body';
import { PostCard } from './post-card/post-card';
import { PostView } from './post.routes';

/** Beitragsseite: Kopf, Artikel mit Inhaltsverzeichnis, Weiterlesen und Kontakt-Aufruf */
@Component({
  selector: 'app-post-page',
  imports: [RouterLink, Icon, PillButton, Tag, PostBody, PostCard],
  templateUrl: './post.page.html',
  styleUrl: './post.page.scss',
})
export class PostPage {
  /** Vom Resolver, siehe post.routes.ts */
  readonly view = input.required<PostView>();

  private readonly language = inject(LanguageService);
  protected readonly t = this.language.t;
  protected readonly post = computed(() => this.view().post);
  protected readonly homePath = computed(() => pagePath('home', this.language.lang()));
  protected readonly path = computed(() => postPath(this.post().slug, this.post().lang));
  protected readonly date = computed(() => {
    const date = this.post().date;
    return date ? formatDate(date, this.post().lang) : null;
  });
}
