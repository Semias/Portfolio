import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../../content/post';
import { formatDate } from '../../../core/i18n/format-date';
import { LanguageService } from '../../../core/i18n/language.service';
import { postPath } from '../../../core/i18n/paths';

/** Karte für einen Beitrag. Reine Teaser (ohne Text) zeigen „Coming soon“ statt eines Links. */
@Component({
  selector: 'app-post-card',
  imports: [RouterLink],
  host: { '[class.is-link]': 'post().published' },
  template: `
    <article>
      <p class="meta">
        <span class="tag">#{{ tag() }}</span>
        @if (date(); as date) {
          <time [attr.datetime]="post().date">{{ date }}</time>
        }
      </p>
      <h3>
        @if (post().published) {
          <a [routerLink]="path()">{{ post().title }}</a>
        } @else {
          {{ post().title }}
        }
      </h3>
      <p class="excerpt">{{ post().excerpt }}</p>
      @if (!post().published) {
        <p class="soon">{{ t().writing.comingSoon }}</p>
      }
    </article>
  `,
  styleUrl: './post-card.scss',
})
export class PostCard {
  readonly post = input.required<Post>();
  protected readonly t = inject(LanguageService).t;
  protected readonly tag = computed(() => this.post().category.toLowerCase());
  protected readonly date = computed(() => {
    const date = this.post().date;
    return date ? formatDate(date, this.post().lang) : null;
  });
  protected readonly path = computed(() => postPath(this.post().slug, this.post().lang));
}
