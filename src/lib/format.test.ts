import { describe, expect, it } from 'vitest';

import { delta, num, pValue, pct } from './format';

/**
 * Formatting matters more than it looks: the thesis text uses the decimal comma, and a dashboard
 * that prints 8.78 next to a report that prints 8,78 invites transcription errors in the results
 * chapter.
 */
describe('format', () => {
  // Peru's own CLDR locale uses the decimal POINT, so this must not be left to `es-PE`.
  it('uses the decimal comma of the thesis document, not of the country locale', () => {
    expect(num(8.784, 2)).toBe('8,78');
    expect(pct(93.333, 1)).toBe('93,3 %');
  });

  it('renders missing values as an em dash rather than zero', () => {
    expect(num(null)).toBe('—');
    expect(num(undefined)).toBe('—');
    expect(num(Number.NaN)).toBe('—');
    expect(pct(null)).toBe('—');
  });

  it('signs the relative change so the direction is unambiguous', () => {
    expect(delta(-31.4)).toBe('-31,4 %');
    expect(delta(21.7)).toBe('+21,7 %');
  });

  it('reports very small p-values with the convention of the results chapter', () => {
    expect(pValue(0.0000004)).toBe('< 0,001');
    expect(pValue(0.0228)).toBe('0,0228');
    expect(pValue(null)).toBe('—');
  });
});
