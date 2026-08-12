/**
 * Unit: readUnloadDelivery / parseUnloadDeliveryRow.
 */

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  parseUnloadDeliveryRow,
  readUnloadDelivery,
} from './readUnloadDelivery.js';
import { findPodwykoByLabel } from './readPodwyko.js';
import { PROJECT_ROOT } from './config.js';

describe('parseUnloadDeliveryRow', () => {
  it('test_parseUnloadDeliveryRow_skips_empty_label', () => {
    expect(parseUnloadDeliveryRow(['', '', '00-001 Warszawa', 'PLAC'])).toBeNull();
  });

  it('test_parseUnloadDeliveryRow_skips_empty_address', () => {
    expect(parseUnloadDeliveryRow(['Firma', 'SKR', '', 'PLAC'])).toBeNull();
  });

  it('test_parseUnloadDeliveryRow_uses_short_name_and_full_name_plus_address', () => {
    const e = parseUnloadDeliveryRow([
      'BIOSYSTEM Bolęcin',
      'BIOSYSTEM',
      '32-540 Bolęcin Fabryczna 5',
      'BOLĘCIN',
    ]);
    expect(e).toEqual({
      label: 'BIOSYSTEM',
      value: 'BIOSYSTEM Bolęcin 32-540 Bolęcin Fabryczna 5',
    });
  });

  it('test_parseUnloadDeliveryRow_falls_back_to_full_name', () => {
    const e = parseUnloadDeliveryRow(['Sortownia X', '', '00-001 Miasto', 'SORTOWNIA']);
    expect(e).toEqual({
      label: 'Sortownia X',
      value: 'Sortownia X 00-001 Miasto',
    });
  });

  it('test_parseUnloadDeliveryRow_word_value_falls_back_to_short_name', () => {
    const e = parseUnloadDeliveryRow(['', 'SKR', '00-001 Warszawa', 'PLAC']);
    expect(e).toEqual({
      label: 'SKR',
      value: 'SKR 00-001 Warszawa',
    });
  });
});

describe('readUnloadDelivery', () => {
  const path = join(PROJECT_ROOT, 'data', 'druga-mila.xlsx');

  it('test_readUnloadDelivery_loads_entries_with_address', () => {
    const entries = readUnloadDelivery(path);
    expect(entries.length).toBeGreaterThan(5);
    expect(entries.every((e) => e.label.trim() && e.value.trim())).toBe(true);
  });

  it('test_readUnloadDelivery_includes_biosystem', () => {
    const entries = readUnloadDelivery(path);
    const bio = findPodwykoByLabel(entries, 'BIOSYSTEM');
    expect(bio).toBeDefined();
    expect(bio!.value.toLowerCase()).toMatch(/bol[eę]cin/);
  });
});
