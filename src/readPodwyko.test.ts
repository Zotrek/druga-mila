/**
 * Unit: readPodwyko.
 */

import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  parsePodwykoRow,
  readPodwyko,
  findPodwykoByLabel,
} from './readPodwyko.js';
import { PROJECT_ROOT } from './config.js';

describe('parsePodwykoRow', () => {
  it('test_parsePodwykoRow_skips_empty_label', () => {
    expect(parsePodwykoRow(['', 'dane'])).toBeNull();
  });

  it('test_parsePodwykoRow_uses_label_as_value_fallback', () => {
    const e = parsePodwykoRow(['Biosystem', '']);
    expect(e).toEqual({ label: 'Biosystem', value: 'Biosystem' });
  });

  it('test_parsePodwykoRow_reads_label_and_value', () => {
    const e = parsePodwykoRow(['Biosystem', '32-540 Bolęcin, ul Fabryczna 5']);
    expect(e!.label).toBe('Biosystem');
    expect(e!.value).toContain('Bolęcin');
  });
});

describe('readPodwyko', () => {
  const path = join(PROJECT_ROOT, 'docs', 'podwyko lista.xlsx');

  it('test_readPodwyko_loads_entries', () => {
    const entries = readPodwyko(path);
    expect(entries.length).toBeGreaterThan(5);
  });

  it('test_readPodwyko_includes_biosystem', () => {
    const entries = readPodwyko(path);
    const bio = findPodwykoByLabel(entries, 'Biosystem');
    expect(bio).toBeDefined();
    expect(bio!.value.toLowerCase()).toMatch(/bol[eę]cin/);
  });
});
