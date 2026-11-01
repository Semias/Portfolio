import { interpolate } from './interpolate';

describe('interpolate', () => {
  it('fills in every placeholder', () => {
    expect(interpolate('{minutes} min read', { minutes: 3 })).toBe('3 min read');
    expect(interpolate('{a} and {b}, {a}', { a: 'x', b: 'y' })).toBe('x and y, x');
  });

  it('keeps unknown placeholders and plain text', () => {
    expect(interpolate('{missing} left', {})).toBe('{missing} left');
    expect(interpolate('no placeholder', { minutes: 3 })).toBe('no placeholder');
  });
});
