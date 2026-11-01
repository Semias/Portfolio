import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import en from '../../../core/i18n/en.json';
import { About } from './about';

describe('About', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(About);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('is the first section, labelled by its heading', () => {
    const section = element.querySelector('section#about');
    expect(section?.getAttribute('data-hub')).toBe('1');
    expect(section?.getAttribute('aria-labelledby')).toBe('about-heading');
    expect(element.querySelector('#about-heading')?.textContent).toBe('About me');
    expect(element.querySelector('app-section-kicker .number')?.textContent).toBe('01');
  });

  it('shows the lead next to one paragraph per body text', () => {
    expect(element.querySelector('.lead')?.textContent).toBe(en.about.lead);
    expect([...element.querySelectorAll('.body p')].map((p) => p.textContent)).toEqual(
      en.about.body,
    );
  });
});
