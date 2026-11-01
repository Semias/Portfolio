import { TestBed } from '@angular/core/testing';
import { SectionKicker } from './section-kicker';

describe('SectionKicker', () => {
  it('shows number, decorative line and label', async () => {
    const fixture = TestBed.createComponent(SectionKicker);
    fixture.componentRef.setInput('number', '03');
    fixture.componentRef.setInput('label', 'Projects');
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.number')?.textContent).toBe('03');
    expect(element.querySelector('.line')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.textContent).toContain('Projects');
  });
});
