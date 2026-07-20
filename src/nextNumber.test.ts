import { describe, it, expect } from 'vitest';
import {
  incrementAlphanumeric,
  nextNumberFromSheet,
  maxAlphanumeric,
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
});
