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
  templateUrl: './blog-teasers.html',
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
