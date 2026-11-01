import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Post } from '../../../content/post';
import { fakePost, providePosts } from '../../../../testing/posts';
import { BlogTeasers, HOME_TEASER_COUNT } from './blog-teasers';

describe('BlogTeasers', () => {
  async function render(posts: Post[]) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), providePosts(posts)] });
    const fixture = TestBed.createComponent(BlogTeasers);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('is the fourth section, labelled by its heading', async () => {
    const element = await render([fakePost()]);
    const section = element.querySelector('section#writing');
    expect(section?.getAttribute('data-hub')).toBe('4');
    expect(section?.getAttribute('aria-labelledby')).toBe('writing-heading');
    expect(element.querySelector('#writing-heading')?.textContent).toBe('Blog');
    expect(element.querySelector('.note')?.textContent).toBe('notes, irregular');
    expect(element.querySelector('app-section-kicker .number')?.textContent).toBe('04');
  });

  it('shows the newest posts of the current language as cards', async () => {
    const posts = ['a', 'b', 'c', 'd'].map((slug) => fakePost({ slug, title: slug }));
    posts.push(fakePost({ slug: 'de-only', lang: 'de', title: 'Deutsch' }));
    const element = await render(posts);
    const cards = [...element.querySelectorAll('app-post-card')];
    expect(cards).toHaveLength(HOME_TEASER_COUNT);
    expect(cards.map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
