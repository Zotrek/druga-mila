/**
 * Unit: searchNormalize.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeForAddressSearch,
  mapPointMatchesSearch,
  mapPointMatchesColorFilter,
  normalizeWgHarmonogramu,
  mapPointMatchesWgHarmonogramuFilter,
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

describe('normalizeWgHarmonogramu', () => {
  it('test_normalizeWgHarmonogramu_tak_nie_and_empty', () => {
    expect(normalizeWgHarmonogramu('tak')).toBe('tak');
    expect(normalizeWgHarmonogramu(' Tak ')).toBe('tak');
    expect(normalizeWgHarmonogramu('NIE')).toBe('nie');
    expect(normalizeWgHarmonogramu('')).toBe('');
    expect(normalizeWgHarmonogramu('może')).toBe('');
  });
});

describe('mapPointMatchesWgHarmonogramuFilter', () => {
  it('test_mapPointMatchesWgHarmonogramuFilter_modes', () => {
    expect(mapPointMatchesWgHarmonogramuFilter('tak', 'wszystkie')).toBe(true);
    expect(mapPointMatchesWgHarmonogramuFilter('', 'wszystkie')).toBe(true);
    expect(mapPointMatchesWgHarmonogramuFilter('tak', 'tak')).toBe(true);
    expect(mapPointMatchesWgHarmonogramuFilter('nie', 'tak')).toBe(false);
    expect(mapPointMatchesWgHarmonogramuFilter('nie', 'nie')).toBe(true);
    expect(mapPointMatchesWgHarmonogramuFilter('', 'nie')).toBe(false);
  });
});
