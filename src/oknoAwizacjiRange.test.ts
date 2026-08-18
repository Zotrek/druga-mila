import { describe, it, expect } from 'vitest';
import { formatOknoAwizacjiRange } from './oknoAwizacjiRange.js';

describe('oknoAwizacjiRange', () => {
  it('test_formatOknoAwizacjiRange_iso_compact', () => {
    expect(formatOknoAwizacjiRange('2026-08-14', '2026-08-17')).toBe('14.08/17.08.26');
  });

  it('test_formatOknoAwizacjiRange_non_consecutive', () => {
    expect(formatOknoAwizacjiRange('2026-08-13', '2026-08-20')).toBe('13.08/20.08.26');
  });

  it('test_formatOknoAwizacjiRange_any_order', () => {
    expect(formatOknoAwizacjiRange('2026-08-17', '2026-08-14')).toBe('17.08/14.08.26');
  });

  it('test_formatOknoAwizacjiRange_dotted_input', () => {
    expect(formatOknoAwizacjiRange('14.08.2026', '17.08.2026')).toBe('14.08/17.08.26');
  });

  it('test_formatOknoAwizacjiRange_missing_do_returns_empty', () => {
    expect(formatOknoAwizacjiRange('2026-08-14', '')).toBe('');
  });

  it('test_formatOknoAwizacjiRange_missing_od_returns_empty', () => {
    expect(formatOknoAwizacjiRange('', '2026-08-17')).toBe('');
  });
});
