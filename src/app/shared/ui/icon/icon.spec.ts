import { TestBed } from '@angular/core/testing';
import { Icon, IconName } from './icon';

describe('Icon', () => {
  const names: IconName[] = ['sun', 'moon', 'mail', 'arrow-left', 'github', 'linkedin'];

  it.each(names)('renders the %s icon as a decorative inline SVG', async (name) => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('size', 20);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.style.width).toBe('20px');
    const svg = host.querySelector('svg');
    expect(svg).not.toBeNull();
    // Farbe kommt immer vom umgebenden Text
    expect(svg?.outerHTML).toContain('currentColor');
  });
});
