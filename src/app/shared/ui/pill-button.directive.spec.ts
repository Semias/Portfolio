import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PillButton } from './pill-button.directive';

@Component({
  imports: [PillButton],
  template: `
    <a appPillButton="primary" href="#">Primary</a>
    <a appPillButton href="#">Secondary</a>
  `,
})
class Host {}

describe('PillButton', () => {
  it('styles links as pills, the primary one highlighted', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [primary, secondary] = (fixture.nativeElement as HTMLElement).querySelectorAll('a');
    expect(primary.className).toBe('pill is-primary');
    expect(secondary.className).toBe('pill');
  });
});
