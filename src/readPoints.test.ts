/**
 * Unit: readPoints / parseLoadRow — pomijanie pustego C, klasyfikacja.
 */

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { parseLoadRow, readPoints } from './readPoints.js';
import { PROJECT_ROOT } from './config.js';

describe('parseLoadRow', () => {
  it('test_parseLoadRow_skips_empty_address', () => {
    expect(parseLoadRow(['Firma', 'SKR', '', 'CD'])).toBeNull();
    expect(parseLoadRow(['Firma', 'SKR', '   ', 'CD'])).toBeNull();
  });

  it('test_parseLoadRow_returns_point_with_color', () => {
    const p = parseLoadRow(['CD Test', 'TEST', '00-001 Warszawa ul. A 1', 'CD']);
    expect(p).not.toBeNull();
    expect(p!.nazwaPelna).toBe('CD Test');
    expect(p!.nazwaSkrocona).toBe('TEST');
    expect(p!.adres).toBe('00-001 Warszawa ul. A 1');
    expect(p!.typ).toBe('CD');
    expect(p!.colorKind).toBe('cd');
  });

  it('test_parseLoadRow_bolecin_empty_typ', () => {
    const p = parseLoadRow(['BIOSYSTEM Bolęcin', 'BIOSYSTEM', '32-540 Bolęcin Fabryczna 5', '']);
    expect(p!.colorKind).toBe('bolecin');
  });
});

describe('readPoints', () => {
  const xlsxPath = join(PROJECT_ROOT, 'data', 'druga-mila.xlsx');

  it('test_readPoints_skips_rows_without_address', () => {
    const points = readPoints(xlsxPath);
    expect(points.length).toBeGreaterThan(0);
    expect(points.every((p) => p.adres.trim().length > 0)).toBe(true);
  });

  it('test_readPoints_includes_bolecin_point', () => {
    const points = readPoints(xlsxPath);
    const bolecin = points.filter((p) => p.colorKind === 'bolecin');
    expect(bolecin.length).toBeGreaterThanOrEqual(1);
    expect(bolecin.some((p) => /bol[eę]cin/i.test(p.nazwaPelna + p.adres))).toBe(true);
  });

  it('test_readPoints_classifies_cd_and_plac', () => {
    const points = readPoints(xlsxPath);
    expect(points.some((p) => p.colorKind === 'cd')).toBe(true);
    expect(points.some((p) => p.colorKind === 'plac')).toBe(true);
  });
});
