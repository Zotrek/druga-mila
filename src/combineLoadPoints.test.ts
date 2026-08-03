import { describe, it, expect } from 'vitest';
import {
  joinWithDash,
  joinWithAddrSep,
  combineZnacznikMiejsca,
  combineLoadPoints,
} from './combineLoadPoints.js';

describe('combineLoadPoints', () => {
  it('test_joinWithDash_joins_non_empty_with_dash', () => {
    expect(joinWithDash(['A', 'B'])).toBe('A-B');
    expect(joinWithDash(['  A  ', '', 'B'])).toBe('A-B');
    expect(joinWithDash(['', ''])).toBe('');
  });

  it('test_joinWithAddrSep_joins_non_empty_with_semicolon', () => {
    expect(joinWithAddrSep(['A', 'B'])).toBe('A; B');
    expect(joinWithAddrSep(['  A  ', '', 'B'])).toBe('A; B');
    expect(joinWithAddrSep(['', ''])).toBe('');
  });

  it('test_combineZnacznikMiejsca_same_type_returns_one', () => {
    expect(combineZnacznikMiejsca('CD', 'CD')).toBe('CD');
    expect(combineZnacznikMiejsca('PLAC', 'PLAC')).toBe('PLAC');
  });

  it('test_combineZnacznikMiejsca_different_types_returns_both', () => {
    expect(combineZnacznikMiejsca('CD', 'PLAC')).toBe('CD-PLAC');
    expect(combineZnacznikMiejsca('PLAC', 'CD')).toBe('PLAC-CD');
  });

  it('test_combineZnacznikMiejsca_empty_falls_back', () => {
    expect(combineZnacznikMiejsca('CD', '')).toBe('CD');
    expect(combineZnacznikMiejsca('', 'PLAC')).toBe('PLAC');
    expect(combineZnacznikMiejsca('', '')).toBe('');
  });

  it('test_combineLoadPoints_joins_names_addresses_and_word_place', () => {
    const combined = combineLoadPoints(
      {
        nazwaPelna: 'Centrum A',
        nazwaSkrocona: 'A',
        adres: '00-001 Wawa',
        typ: 'CD',
      },
      {
        nazwaPelna: 'Centrum B',
        nazwaSkrocona: 'B',
        adres: '30-001 Kraków',
        typ: 'PLAC',
      },
    );
    expect(combined.adres).toBe('00-001 Wawa; 30-001 Kraków');
    expect(combined.nazwaPelna).toBe('Centrum A-Centrum B');
    expect(combined.nazwaSkrocona).toBe('A-B');
    expect(combined.typ).toBe('CD-PLAC');
    expect(combined.miejsceZaladunkuWord).toBe(
      'Centrum A 00-001 Wawa; Centrum B 30-001 Kraków',
    );
  });

  it('test_combineLoadPoints_same_typ_keeps_single_znacznik', () => {
    const combined = combineLoadPoints(
      { nazwaPelna: 'X', nazwaSkrocona: 'X', adres: 'a1', typ: 'CD' },
      { nazwaPelna: 'Y', nazwaSkrocona: 'Y', adres: 'a2', typ: 'CD' },
    );
    expect(combined.typ).toBe('CD');
  });
});
