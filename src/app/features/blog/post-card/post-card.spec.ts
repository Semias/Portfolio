import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { fakePost } from '../../../../testing/posts';
import { PostCard } from './post-card';

describe('PostCard', () => {
  async function render(post = fakePost()) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(PostCard);
    fixture.componentRef.setInput('post', post);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('links published posts by their title', async () => {
    const element = await render(fakePost({ slug: 'rbac', title: 'Roles', excerpt: 'Short.' }));
    expect(element.classList.contains('is-link')).toBe(true);
    expect(element.querySelector('.tag')?.textContent?.trim()).toBe('#identity');
    const time = element.querySelector('time');
    expect(time?.textContent).toBe('Sep 12, 2026');
    expect(time?.getAttribute('datetime')).toBe('2026-09-12');
    const link = element.querySelector('h3 a');
    expect(link?.textContent?.trim()).toBe('Roles');
    expect(link?.getAttribute('href')).toBe('/blog/rbac');
    expect(element.querySelector('.excerpt')?.textContent).toBe('Short.');
    expect(element.querySelector('.soon')).toBeNull();
  });

  it('links German posts under /de', async () => {
    const element = await render(fakePost({ slug: 'rbac', lang: 'de' }));
    expect(element.querySelector('h3 a')?.getAttribute('href')).toBe('/de/blog/rbac');
    expect(element.querySelector('time')?.textContent).toBe('12. Sep 2026');
  });

  it('shows teaser-only posts without link', async () => {
    const element = await render(fakePost({ published: false, title: 'Later', date: null }));
    expect(element.classList.contains('is-link')).toBe(false);
    expect(element.querySelector('time')).toBeNull();
    expect(element.querySelector('a')).toBeNull();
    expect(element.querySelector('h3')?.textContent?.trim()).toBe('Later');
    expect(element.querySelector('.soon')?.textContent?.trim()).toBe('Coming soon');
  });
});
