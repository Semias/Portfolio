import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import en from '../../../core/i18n/en.json';
import { Projects } from './projects';

describe('Projects', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Projects);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('is the third section, labelled by its heading', () => {
    const section = element.querySelector('section#work');
    expect(section?.getAttribute('data-hub')).toBe('3');
    expect(section?.getAttribute('aria-labelledby')).toBe('work-heading');
    expect(element.querySelector('#work-heading')?.textContent).toBe('Projects');
    expect(element.querySelector('app-section-kicker .number')?.textContent).toBe('03');
  });

  it('numbers the projects with two digits and tags each one', () => {
    const projects = [...element.querySelectorAll('ol.projects li')];
    expect(projects.map((p) => p.querySelector('.number')?.textContent)).toEqual(
      en.work.projects.map((_, i) => String(i + 1).padStart(2, '0')),
    );
    expect(projects.map((p) => p.querySelector('h3')?.textContent)).toEqual(
      en.work.projects.map((p) => p.title),
    );
    expect(projects.map((p) => p.querySelector('app-tag')?.textContent?.trim())).toEqual(
      en.work.projects.map((p) => p.tag),
    );
    expect(projects[0].querySelector('.body p')?.textContent).toBe(en.work.projects[0].text);
  });
});
