/**
 * Unit: geocode — normalize, cache load/save, geocode z mock fetch.
 */

import { describe, it, expect, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  normalizeAddressKey,
  buildGeocodeQueryVariants,
  loadGeocodeCache,
  saveGeocodeCache,
  geocodeAddresses,
  attachCoords,
} from './geocode.js';

describe('normalizeAddressKey', () => {
  it('test_normalizeAddressKey_collapses_whitespace_and_case', () => {
    expect(normalizeAddressKey('  16-100   Sokółka,  Przemysłowa 20 ')).toBe(
      '16-100 sokółka przemysłowa 20',
    );
  });
});

describe('buildGeocodeQueryVariants', () => {
  it('test_buildGeocodeQueryVariants_street_first_for_pl_sheet_format', () => {
    const variants = buildGeocodeQueryVariants('16-100 Sokółka Przemysłowa 20');
    expect(variants.some((v) => v.startsWith('Przemysłowa 20,'))).toBe(true);
    expect(variants[0]).toContain('Polska');
  });
});

describe('geocode cache + Nominatim', () => {
  it('test_save_and_load_geocode_cache', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dm-geo-'));
    const path = join(dir, 'cache.json');
    try {
      await saveGeocodeCache(path, {
        'a b': { lat: 1, lon: 2, status: 'ok' },
      });
      const loaded = await loadGeocodeCache(path);
      expect(loaded['a b']).toEqual({ lat: 1, lon: 2, status: 'ok' });
      const raw = await readFile(path, 'utf-8');
      expect(raw.trim().startsWith('{')).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('test_geocodeAddresses_uses_cache_without_fetch', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dm-geo-'));
    const path = join(dir, 'cache.json');
    try {
      await saveGeocodeCache(path, {
        [normalizeAddressKey('Warszawa Test 1')]: {
          lat: 52.2,
          lon: 21.0,
          status: 'ok',
        },
      });
      const fetchFn = vi.fn();
      const { results, stats } = await geocodeAddresses(['Warszawa Test 1'], {
        cachePath: path,
        userAgent: 'test',
        fetchFn: fetchFn as unknown as typeof fetch,
        sleepFn: async () => undefined,
      });
      expect(fetchFn).not.toHaveBeenCalled();
      expect(stats.cacheHits).toBe(1);
      expect(stats.fetched).toBe(0);
      expect(results[0]).toMatchObject({
        status: 'ok',
        lat: 52.2,
        lon: 21.0,
        fromCache: true,
      });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('test_geocodeAddresses_fetches_and_caches_ok', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dm-geo-'));
    const path = join(dir, 'cache.json');
    try {
      const fetchFn = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ lat: '50.1', lon: '19.9', display_name: 'Test' }],
      });
      const { results, stats } = await geocodeAddresses(['Kraków ul. Test 1'], {
        cachePath: path,
        userAgent: 'test-ua',
        fetchFn: fetchFn as unknown as typeof fetch,
        sleepFn: async () => undefined,
        rateLimitMs: 0,
      });
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(stats.fetched).toBe(1);
      expect(stats.ok).toBe(1);
      expect(results[0]!.status).toBe('ok');
      expect(results[0]!.fromCache).toBe(false);

      const cached = await loadGeocodeCache(path);
      expect(cached[normalizeAddressKey('Kraków ul. Test 1')]?.status).toBe('ok');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('test_attachCoords_maps_by_normalized_address', () => {
    const attached = attachCoords(
      [{ adres: '  Foo  Bar ', id: 1 }],
      [
        {
          address: 'foo bar',
          lat: 1,
          lon: 2,
          status: 'ok',
          fromCache: true,
        },
      ],
    );
    expect(attached[0]).toMatchObject({ id: 1, lat: 1, lon: 2, geocodeStatus: 'ok' });
  });
});
