import { formatDate } from './format-date';

describe('formatDate', () => {
  it('formats like the design in both languages', () => {
    expect(formatDate('2026-09-12', 'en')).toBe('Sep 12, 2026');
    expect(formatDate('2026-09-12', 'de')).toBe('12. Sep 2026');
  });

  it('uses German month names', () => {
    expect(formatDate('2026-03-01', 'de')).toBe('1. Mär 2026');
    expect(formatDate('2026-10-31', 'de')).toBe('31. Okt 2026');
    expect(formatDate('2026-12-24', 'en')).toBe('Dec 24, 2026');
  });
});
