import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE } from '../../../core/site';
import { InfoStrip } from './info-strip';

describe('InfoStrip', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(InfoStrip);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows role and stack between decorative marks', () => {
    const strip = element.querySelector('.strip');
    expect(strip?.textContent).toContain('Solution Expert · Full-Stack Software Engineer');
    expect(strip?.textContent).toContain('Angular · NestJS · TypeScript · Node.js');
    const marks = [...element.querySelectorAll('.mark, .slash')];
    expect(marks).toHaveLength(3);
    expect(marks.every((mark) => mark.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('links the profiles in a new tab', () => {
    const links = [...element.querySelectorAll<HTMLAnchorElement>('.profiles a')];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['GitHub', 'LinkedIn']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([SITE.github, SITE.linkedin]);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noreferrer');
    }
  });
});
