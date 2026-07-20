/**
 * Unit: classify — kolejność Bolęcin / CD / PLAC / puste.
 */

import { describe, it, expect } from 'vitest';
import { classifyPointColor, classifyPointHex, mentionsBolecin } from './classify.js';
import { COLOR_BOLECIN, COLOR_CD, COLOR_PLAC, COLOR_PUSTE } from './config.js';

describe('classifyPointColor', () => {
  it('test_classify_bolecin_by_name_overrides_cd', () => {
    expect(
      classifyPointColor({
        nazwaPelna: 'BIOSYSTEM Bolęcin',
        adres: '32-540 Fabryczna 5',
        typ: 'CD',
      }),
    ).toBe('bolecin');
  });

  it('test_classify_bolecin_by_address_ascii', () => {
    expect(
      classifyPointColor({
        nazwaPelna: 'X',
        adres: '32-540 Bolecin Fabryczna 5',
        typ: 'PLAC',
      }),
    ).toBe('bolecin');
  });

  it('test_classify_cd_when_typ_cd', () => {
    expect(
      classifyPointColor({
        nazwaPelna: 'CD Jaskółka',
        adres: '16-100 Sokółka',
        typ: 'CD',
      }),
    ).toBe('cd');
  });

  it('test_classify_cd_case_insensitive', () => {
    expect(
      classifyPointColor({
        nazwaPelna: 'A',
        adres: 'Warszawa',
        typ: 'cd',
      }),
    ).toBe('cd');
  });

  it('test_classify_plac_when_typ_plac', () => {
    expect(
      classifyPointColor({
        nazwaPelna: 'ITUM',
        adres: '44-200 Rybnik',
        typ: 'PLAC',
      }),
    ).toBe('plac');
  });

  it('test_classify_puste_when_typ_empty', () => {
    expect(
      classifyPointColor({
        nazwaPelna: 'Inny punkt',
        adres: '00-001 Warszawa',
        typ: '',
      }),
    ).toBe('puste');
  });

  it('test_classify_puste_when_typ_unknown', () => {
    expect(
      classifyPointColor({
        nazwaPelna: 'X',
        adres: 'Kraków',
        typ: 'INNE',
      }),
    ).toBe('puste');
  });

  it('test_classify_hex_matches_spec', () => {
    expect(classifyPointHex({ nazwaPelna: 'Bolęcin', adres: 'x', typ: '' })).toBe(COLOR_BOLECIN);
    expect(classifyPointHex({ nazwaPelna: 'A', adres: 'x', typ: 'CD' })).toBe(COLOR_CD);
    expect(classifyPointHex({ nazwaPelna: 'A', adres: 'x', typ: 'PLAC' })).toBe(COLOR_PLAC);
    expect(classifyPointHex({ nazwaPelna: 'A', adres: 'x', typ: '' })).toBe(COLOR_PUSTE);
  });
});

describe('mentionsBolecin', () => {
  it('test_mentions_bolecin_polish_and_ascii', () => {
    expect(mentionsBolecin('Bolęcin')).toBe(true);
    expect(mentionsBolecin('Bolecin')).toBe(true);
    expect(mentionsBolecin('Warszawa')).toBe(false);
  });
});
