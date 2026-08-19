/**
 * Unit: readManualOverlay — parsowanie, merge, deduplikacja.
 */

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  mergeLoadPoints,
  mergeListEntries,
  normalizeManualOverlay,
  parseManualLoadEntry,
  parseManualListEntry,
  readManualOverlay,
} from './readManualOverlay.js';
import { PROJECT_ROOT } from './config.js';

describe('parseManualLoadEntry', () => {
  it('test_parseManualLoadEntry_skips_empty_address', () => {
    expect(parseManualLoadEntry({ nazwaPelna: 'X', adres: '' })).toBeNull();
  });

  it('test_parseManualLoadEntry_returns_entry', () => {
    const e = parseManualLoadEntry({
      nazwaPelna: 'CD Nowy',
      nazwaSkrocona: 'NOWY',
      adres: '00-001 Warszawa',
      typ: 'CD',
    });
    expect(e).toEqual({
      nazwaPelna: 'CD Nowy',
      nazwaSkrocona: 'NOWY',
      adres: '00-001 Warszawa',
      typ: 'CD',
      rodzajZbiorki: '',
    });
  });
});

describe('parseManualListEntry', () => {
  it('test_parseManualListEntry_skips_empty_label', () => {
    expect(parseManualListEntry({ label: '', value: 'x' })).toBeNull();
  });

  it('test_parseManualListEntry_uses_label_as_value_fallback', () => {
    expect(parseManualListEntry({ label: 'FIRMA' })).toEqual({
      label: 'FIRMA',
      value: 'FIRMA',
    });
  });
});

describe('mergeLoadPoints', () => {
  it('test_mergeLoadPoints_adds_overlay_without_duplicates', () => {
    const base = [
      {
        nazwaPelna: 'A',
        nazwaSkrocona: 'A',
        adres: 'Adres 1',
        typ: 'CD',
        rodzajZbiorki: '',
        colorKind: 'cd' as const,
      },
    ];
    const merged = mergeLoadPoints(base, [
      { nazwaPelna: 'B', nazwaSkrocona: 'B', adres: 'Adres 2', typ: 'PLAC', rodzajZbiorki: '' },
      { nazwaPelna: 'A', nazwaSkrocona: 'A', adres: 'Adres 1', typ: 'PLAC', rodzajZbiorki: '' },
    ]);
    expect(merged).toHaveLength(2);
    const updated = merged.find((p) => p.adres === 'Adres 1');
    expect(updated?.typ).toBe('PLAC');
    expect(updated?.colorKind).toBe('plac');
  });
});

describe('mergeListEntries', () => {
  it('test_mergeListEntries_overlay_overrides_label', () => {
    const merged = mergeListEntries(
      [{ label: 'BLUE', value: 'old' }],
      [{ label: 'BLUE', value: 'new' }],
    );
    expect(merged).toEqual([{ label: 'BLUE', value: 'new' }]);
  });
});

describe('readManualOverlay', () => {
  it('test_readManualOverlay_reads_committed_file', () => {
    const overlay = readManualOverlay(join(PROJECT_ROOT, 'data', 'manual-overlay.json'));
    expect(Array.isArray(overlay.zaladunek)).toBe(true);
    expect(Array.isArray(overlay.przewoznicy)).toBe(true);
    expect(Array.isArray(overlay.miejscaDostawy)).toBe(true);
  });

  it('test_normalizeManualOverlay_ignores_invalid_rows', () => {
    const o = normalizeManualOverlay({
      zaladunek: [{ adres: '' }, { adres: 'X', nazwaPelna: 'Y' }],
      przewoznicy: [{ label: 'OK', value: 'V' }, {}],
      miejscaDostawy: 'invalid',
    });
    expect(o.zaladunek).toHaveLength(1);
    expect(o.przewoznicy).toHaveLength(1);
    expect(o.miejscaDostawy).toHaveLength(0);
  });
});
