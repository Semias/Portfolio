import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mockMatchMedia } from '../../../../testing/media';
import { Hero } from './hero';

describe('Hero', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    mockMatchMedia();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Hero);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  it('is the first stop of the network, labelled by its title', () => {
    const section = element.querySelector('section.hero');
    expect(section?.getAttribute('data-hub')).toBe('0');
    expect(section?.getAttribute('aria-labelledby')).toBe('hero-title');
  });

  it('highlights part of the title in the accent colour', () => {
    const title = element.querySelector('h1#hero-title');
    expect(title?.textContent?.trim()).toBe("Hi, I'm Stefan. I love building digital products.");
    expect(title?.querySelector('.accent')?.textContent).toBe('digital products');
    expect(element.querySelector('.subline')?.textContent).toBe(
      'And turning ideas into solutions that create real value.',
    );
  });

  it('offers the accent picker', () => {
    expect(element.querySelector('app-accent-picker.picker')).not.toBeNull();
  });

  it('loads the portrait with alt text and high priority', () => {
    const img = element.querySelector('.portrait img');
    expect(img?.getAttribute('alt')).toBe('Portrait of Stefan Gall');
    expect(img?.getAttribute('src')).toBe('/images/portrait.webp');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
  });
});
