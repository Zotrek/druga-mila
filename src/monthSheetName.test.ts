import { describe, expect, it } from 'vitest';
import {
  monthSheetNameFromDataOdbioru,
  monthSheetNameFromParts,
  parseDataOdbioru,
} from './monthSheetName.js';

describe('parseDataOdbioru', () => {
  it('test_parseDataOdbioru_valid_dd_mm_yyyy_returns_parts', () => {
    expect(parseDataOdbioru('03.08.2026')).toEqual({ day: 3, month: 8, year: 2026 });
  });

  it('test_parseDataOdbioru_single_digit_day_month_ok', () => {
    expect(parseDataOdbioru('1.9.2026')).toEqual({ day: 1, month: 9, year: 2026 });
  });

  it('test_parseDataOdbioru_empty_returns_null', () => {
    expect(parseDataOdbioru('')).toBeNull();
  });

  it('test_parseDataOdbioru_invalid_format_returns_null', () => {
    expect(parseDataOdbioru('2026-08-03')).toBeNull();
    expect(parseDataOdbioru('03/08/2026')).toBeNull();
  });

  it('test_parseDataOdbioru_month_out_of_range_returns_null', () => {
    expect(parseDataOdbioru('01.13.2026')).toBeNull();
    expect(parseDataOdbioru('01.00.2026')).toBeNull();
  });
});

describe('monthSheetNameFromParts', () => {
  it('test_monthSheetNameFromParts_august_2026_sierpien', () => {
    expect(monthSheetNameFromParts(8, 2026)).toBe('Sierpień 2026');
  });

  it('test_monthSheetNameFromParts_january_styczen', () => {
    expect(monthSheetNameFromParts(1, 2027)).toBe('Styczeń 2027');
  });
});

describe('monthSheetNameFromDataOdbioru', () => {
  const fallback = { day: 15, month: 7, year: 2026 };

  it('test_monthSheetNameFromDataOdbioru_uses_data_odbioru', () => {
    expect(monthSheetNameFromDataOdbioru('03.08.2026', fallback)).toBe('Sierpień 2026');
  });

  it('test_monthSheetNameFromDataOdbioru_empty_uses_fallback', () => {
    expect(monthSheetNameFromDataOdbioru('', fallback)).toBe('Lipiec 2026');
  });

  it('test_monthSheetNameFromDataOdbioru_invalid_uses_fallback', () => {
    expect(monthSheetNameFromDataOdbioru('nie-data', fallback)).toBe('Lipiec 2026');
  });
});
