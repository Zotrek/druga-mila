import { describe, it, expect } from 'vitest';
import { formatDataZaladunkuRange, splitDataZaladunkuRange } from './dataZaladunkuRange.js';

describe('formatDataZaladunkuRange', () => {
  it('test_formatDataZaladunkuRange_only_od_single_full_year', () => {
    expect(formatDataZaladunkuRange('2026-08-13', '')).toBe('13.08.2026');
  });

  it('test_formatDataZaladunkuRange_od_and_do_compact_full_year', () => {
    expect(formatDataZaladunkuRange('2026-08-13', '2026-08-14')).toBe('13.08/14.08.2026');
  });

  it('test_formatDataZaladunkuRange_non_consecutive', () => {
    expect(formatDataZaladunkuRange('2026-08-13', '2026-08-20')).toBe('13.08/20.08.2026');
  });

  it('test_formatDataZaladunkuRange_dotted_input', () => {
    expect(formatDataZaladunkuRange('13.08.2026', '14.08.2026')).toBe('13.08/14.08.2026');
  });

  it('test_formatDataZaladunkuRange_same_day_stays_single', () => {
    expect(formatDataZaladunkuRange('2026-08-13', '2026-08-13')).toBe('13.08.2026');
  });

  it('test_formatDataZaladunkuRange_missing_od_returns_empty', () => {
    expect(formatDataZaladunkuRange('', '2026-08-14')).toBe('');
  });
});

describe('splitDataZaladunkuRange', () => {
  it('test_splitDataZaladunkuRange_range_to_od_do', () => {
    expect(splitDataZaladunkuRange('13.08/14.08.2026')).toEqual({
      od: '13.08.2026',
      doDate: '14.08.2026',
    });
  });

  it('test_splitDataZaladunkuRange_single_keeps_od_only', () => {
    expect(splitDataZaladunkuRange('13.08.2026')).toEqual({
      od: '13.08.2026',
      doDate: '',
    });
  });

  it('test_splitDataZaladunkuRange_empty', () => {
    expect(splitDataZaladunkuRange('')).toEqual({ od: '', doDate: '' });
  });
});
