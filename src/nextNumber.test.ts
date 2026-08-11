import { describe, it, expect } from 'vitest';
import {
  incrementAlphanumeric,
  nextNumberFromSheet,
  maxAlphanumeric,
  nextNumberWithPrefix,
  nextNumberExcludingPrefix,
  maxAlphanumericWithPrefix,
} from './nextNumber.js';

describe('nextNumber', () => {
  it('test_increment_DM1_to_DM2', () => {
    expect(incrementAlphanumeric('DM1')).toBe('DM2');
  });

  it('test_increment_asd123_to_asd124', () => {
    expect(incrementAlphanumeric('asd123')).toBe('asd124');
  });

  it('test_increment_ABC100_to_ABC101', () => {
    expect(incrementAlphanumeric('ABC100')).toBe('ABC101');
  });

  it('test_increment_empty_returns_null', () => {
    expect(incrementAlphanumeric('')).toBeNull();
  });

  it('test_nextNumberFromSheet_empty_returns_DM1', () => {
    expect(nextNumberFromSheet([], 'DM1')).toBe('DM1');
  });

  it('test_nextNumberFromSheet_after_delete_cools_to_gap', () => {
    expect(nextNumberFromSheet(['DM1', 'DM2', 'DM3'], 'DM1')).toBe('DM4');
    expect(nextNumberFromSheet(['DM1', 'DM2', 'DM3'], 'DM1')).toBe('DM4');
    expect(maxAlphanumeric(['DM1', 'DM2', 'DM3'])).toBe('DM3');
    expect(nextNumberFromSheet(['DM1', 'DM2', 'DM3'], 'DM1')).toBe('DM4');
    // po usunięciu DM4/DM5 zostaje max DM3 → next DM4
    expect(nextNumberFromSheet(['DM1', 'DM2', 'DM3'], 'DM1')).toBe('DM4');
  });

  it('test_max_by_trailing_number_mixed_prefix', () => {
    expect(maxAlphanumeric(['ABC100', 'DM50', 'XYZ99'])).toBe('ABC100');
    expect(nextNumberFromSheet(['ABC100', 'DM50'], 'DM1')).toBe('ABC101');
  });

  it('test_nextNumberWithPrefix_GMH_start_and_increment', () => {
    expect(nextNumberWithPrefix([], 'GMH', 'GMH1')).toBe('GMH1');
    expect(nextNumberWithPrefix(['GMH1', 'GMH2'], 'GMH', 'GMH1')).toBe('GMH3');
    expect(maxAlphanumericWithPrefix(['DM350', 'GMH2', 'GMH10'], 'GMH')).toBe('GMH10');
  });

  it('test_nextNumberExcludingPrefix_ignores_GMH_for_DM_series', () => {
    expect(nextNumberExcludingPrefix(['DM350', 'GMH400'], 'GMH', 'DM1')).toBe('DM351');
    expect(nextNumberExcludingPrefix(['GMH1', 'GMH99'], 'GMH', 'DM1')).toBe('DM1');
  });
});
