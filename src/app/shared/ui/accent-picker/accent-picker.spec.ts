import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mockMatchMedia } from '../../../../testing/media';
import { DEFAULT_ACCENT, accentPalette } from '../../../core/theme/color';
import { ThemeService } from '../../../core/theme/theme.service';
import { AccentPicker } from './accent-picker';

describe('AccentPicker', () => {
  let fixture: ComponentFixture<AccentPicker>;
  let element: HTMLElement;
  let theme: ThemeService;

  beforeEach(async () => {
    localStorage.clear();
    mockMatchMedia();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    theme = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(AccentPicker);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => vi.restoreAllMocks());

  const swatches = () => [...element.querySelectorAll<HTMLButtonElement>('button.swatch')];

  it('offers the preset colours as labelled toggle buttons, the default first', () => {
    expect(element.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe(
      'Accent colour',
    );
    expect(swatches().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Coral',
      'Blue',
      'Teal',
      'Purple',
      'Red',
    ]);
    expect(swatches().map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'true',
      'false',
      'false',
      'false',
      'false',
    ]);
    expect(swatches()[2].style.getPropertyValue('--swatch')).toBe(
      accentPalette('dark', 'teal').acc,
    );
  });

  it('picks a preset colour', async () => {
    swatches()[4].click();
    await fixture.whenStable();
    expect(theme.accent()).toBe('red');
    expect(swatches()[4].getAttribute('aria-pressed')).toBe('true');
    expect(swatches()[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('shows the swatches in the colours of the active theme', async () => {
    theme.toggleTheme();
    await fixture.whenStable();
    expect(swatches()[2].style.getPropertyValue('--swatch')).toBe(
      accentPalette('light', 'teal').acc,
    );
  });

  it('accepts a free colour from the colour input', async () => {
    const input = element.querySelector<HTMLInputElement>('input[type="color"]');
    if (!input) throw new Error('colour input missing');
    expect(input.getAttribute('aria-label')).toBe('Custom colour');
    expect(input.value).toBe(accentPalette('dark', DEFAULT_ACCENT).acc);

    input.value = '#12ab34';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(theme.accent()).toBe('custom');
    expect(theme.customHex()).toBe('#12ab34');
    expect(element.querySelector('label.custom')?.classList.contains('is-active')).toBe(true);
    expect(swatches().every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
  });
});
