import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GlassCard } from './glass-card';

@Component({
  imports: [GlassCard],
  template: '<app-glass-card><p>inside</p></app-glass-card>',
})
class Host {}

describe('GlassCard', () => {
  it('projects its content', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-glass-card p')?.textContent).toBe('inside');
  });
});
