import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE } from '../../../core/site';
import { Contact } from './contact';

describe('Contact', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Contact);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('is the fifth section, labelled by its heading', () => {
    const section = element.querySelector('section#contact');
    expect(section?.getAttribute('data-hub')).toBe('5');
    expect(section?.getAttribute('aria-labelledby')).toBe('contact-heading');
    expect(element.querySelector('#contact-heading')?.textContent).toBe("Let's talk.");
    expect(element.querySelector('app-section-kicker .number')?.textContent).toBe('05');
  });

  it('offers e-mail as the primary action', () => {
    const mail = element.querySelector<HTMLAnchorElement>('a.is-primary');
    expect(mail?.getAttribute('href')).toBe(`mailto:${SITE.email}`);
    expect(mail?.textContent?.trim()).toBe('E-Mail');
    expect(mail?.querySelector('app-icon')).not.toBeNull();
  });

  it('opens the profiles in a new tab', () => {
    const [, github, linkedin] = element.querySelectorAll<HTMLAnchorElement>('a.pill');
    expect(github.getAttribute('href')).toBe(SITE.github);
    expect(linkedin.getAttribute('href')).toBe(SITE.linkedin);
    for (const link of [github, linkedin]) {
      expect(link.classList.contains('is-primary')).toBe(false);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noreferrer');
    }
  });
});
