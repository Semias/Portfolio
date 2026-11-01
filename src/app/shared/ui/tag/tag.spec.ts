import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tag } from './tag';

@Component({
  imports: [Tag],
  template: '<app-tag>commerce</app-tag>',
})
class Host {}

describe('Tag', () => {
  it('projects its text', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-tag')?.textContent).toBe('commerce');
  });
});
