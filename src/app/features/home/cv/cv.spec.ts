import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import en from '../../../core/i18n/en.json';
import { Cv } from './cv';

describe('Cv', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Cv);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('is the second section, labelled by its heading', () => {
    const section = element.querySelector('section#cv');
    expect(section?.getAttribute('data-hub')).toBe('2');
    expect(section?.getAttribute('aria-labelledby')).toBe('cv-heading');
    expect(element.querySelector('#cv-heading')?.textContent).toBe('Curriculum');
    expect(element.querySelector('app-section-kicker .number')?.textContent).toBe('02');
  });

  it('lists the positions as a timeline, the current one first', () => {
    const entries = element.querySelectorAll('ol.timeline li');
    expect(entries).toHaveLength(en.cv.entries.length);
    expect(entries[0].classList.contains('is-current')).toBe(true);
    expect(entries[1].classList.contains('is-current')).toBe(false);
    expect(entries[0].querySelector('.period')?.textContent).toBe('2023 → today');
    expect(entries[0].querySelector('.dot')?.getAttribute('aria-hidden')).toBe('true');
    expect(entries[0].querySelector('h3')?.textContent).toBe(en.cv.entries[0].title);
    expect(entries[1].querySelector('.period')?.textContent).toBe('2018 → 2023');
    expect(entries[1].querySelector('.company')?.textContent).toBe('@cm city media GmbH');
    expect(entries[1].querySelector('.text')?.textContent).toBe(en.cv.entries[1].text);
  });
});
