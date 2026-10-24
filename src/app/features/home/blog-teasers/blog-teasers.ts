import { Component, computed, inject } from '@angular/core';
import { PostsService } from '../../../content/posts.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { GlassCard } from '../../../shared/ui/glass-card/glass-card';
import { SectionKicker } from '../../../shared/ui/section-kicker/section-kicker';
import { PostCard } from '../../blog/post-card/post-card';

/** Höchstens so viele Teaser auf der Startseite (wie im Design) */
export const HOME_TEASER_COUNT = 3;

@Component({
  selector: 'app-blog-teasers',
  imports: [GlassCard, SectionKicker, PostCard],
  template: `
    <section id="writing" data-hub="4" aria-labelledby="writing-heading">
      <app-glass-card>
        <app-section-kicker number="04" [label]="t().writing.kicker" />
        <div class="head">
          <h2 id="writing-heading">{{ t().writing.heading }}</h2>
          <p class="note">{{ t().writing.note }}</p>
        </div>
        <div class="cards">
          @for (post of posts(); track post.slug) {
            <app-post-card [post]="post" />
          }
        </div>
      </app-glass-card>
    </section>
  `,
  styleUrl: './blog-teasers.scss',
})
export class BlogTeasers {
  private readonly language = inject(LanguageService);
  private readonly postsService = inject(PostsService);
  protected readonly t = this.language.t;
  protected readonly posts = computed(() =>
    this.postsService.forLang(this.language.lang()).slice(0, HOME_TEASER_COUNT),
  );
}
