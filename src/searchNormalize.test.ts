/**
 * Unit: searchNormalize.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeForAddressSearch,
  mapPointMatchesSearch,
  mapPointMatchesColorFilter,
} from './searchNormalize.js';

describe('normalizeForAddressSearch', () => {
  it('test_normalizeForAddressSearch_folds_polish_diacritics', () => {
    expect(normalizeForAddressSearch('Łódź')).toBe('lodz');
    expect(normalizeForAddressSearch('  Sokółka  ')).toBe('sokolka');
  });
});

describe('mapPointMatchesSearch', () => {
  it('test_mapPointMatchesSearch_empty_query_matches_all', () => {
    expect(mapPointMatchesSearch('A', 'B', 'C', '  ')).toBe(true);
  });

  it('test_mapPointMatchesSearch_matches_nazwa_or_adres', () => {
    expect(mapPointMatchesSearch('CD Jaskółka Sokółka', 'SOKÓŁKA', '16-100 Sokółka', 'sokolka')).toBe(
      true,
    );
    expect(mapPointMatchesSearch('X', 'Y', 'Radom', 'warszawa')).toBe(false);
  });
});

describe('mapPointMatchesColorFilter', () => {
  it('test_mapPointMatchesColorFilter_wszystkie_and_kind', () => {
    expect(mapPointMatchesColorFilter('cd', 'wszystkie')).toBe(true);
    expect(mapPointMatchesColorFilter('cd', 'cd')).toBe(true);
    expect(mapPointMatchesColorFilter('plac', 'cd')).toBe(false);
  });
});
