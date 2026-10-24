import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GlassCard } from './glass-card/glass-card';
import { PillButton } from './pill-button.directive';
import { SectionKicker } from './section-kicker/section-kicker';
import { Tag } from './tag/tag';

@Component({
  imports: [GlassCard, SectionKicker, Tag, PillButton],
  template: `
    <app-glass-card><p>inside</p></app-glass-card>
    <app-section-kicker number="03" label="Projects" />
    <app-tag>commerce</app-tag>
    <a appPillButton="primary" href="#">Primary</a>
    <a appPillButton href="#">Secondary</a>
  `,
})
class Host {}

describe('shared UI', () => {
  it('renders the building blocks', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-glass-card p')?.textContent).toBe('inside');
    const kicker = element.querySelector('app-section-kicker');
    expect(kicker?.querySelector('.number')?.textContent).toBe('03');
    expect(kicker?.querySelector('.line')?.getAttribute('aria-hidden')).toBe('true');
    expect(kicker?.textContent).toContain('Projects');
    expect(element.querySelector('app-tag')?.textContent).toBe('commerce');

    const [primary, secondary] = element.querySelectorAll('a');
    expect(primary.className).toBe('pill is-primary');
    expect(secondary.className).toBe('pill');
  });
});
