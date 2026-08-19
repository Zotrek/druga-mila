/**
 * Unit: buildReferenceSeedPayload — liczba wpisów z Excela.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConfig } from './config.js';
import { buildReferenceSeedPayload } from './buildReferenceSeedPayload.js';

vi.mock('./geocode.js', () => ({
  geocodeAddresses: vi.fn(async (addresses: string[]) => ({
    results: addresses.map((address) => ({
      address,
      lat: 52.1,
      lon: 19.4,
      status: 'ok' as const,
      fromCache: true,
    })),
    stats: {
      unique: addresses.length,
      cacheHits: addresses.length,
      fetched: 0,
      ok: addresses.length,
      fail: 0,
    },
  })),
  attachCoords: <T extends { adres: string }>(points: T[], results: { address: string; lat: number | null; lon: number | null; status: 'ok' | 'fail' }[]) => {
    const byKey = new Map(results.map((r) => [r.address.trim().toLowerCase(), r]));
    return points.map((p) => {
      const hit = byKey.get(p.adres.trim().toLowerCase());
      return {
        ...p,
        lat: hit?.lat ?? null,
        lon: hit?.lon ?? null,
        geocodeStatus: hit?.status ?? 'fail',
      };
    });
  },
}));

describe('buildReferenceSeedPayload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('test_buildReferenceSeedPayload_includes_structured_rows', async () => {
    const payload = await buildReferenceSeedPayload(getConfig());
    expect(payload.mode).toBe('seedReferenceData');
    expect(payload.zaladunek.length).toBeGreaterThan(0);
    expect(payload.przewoznicy.length).toBeGreaterThan(0);
    expect(payload.miejscaDostawy.length).toBeGreaterThan(0);
    expect(payload.zaladunek[0]).toMatchObject({
      nazwaPelna: expect.any(String),
      adres: expect.any(String),
      typ: expect.any(String),
    });
    expect(payload.przewoznicy[0]).toMatchObject({
      nazwaWyswietlana: expect.any(String),
      nazwaDoProtokolu: expect.any(String),
    });
    expect(payload.miejscaDostawy[0]).toMatchObject({
      nazwaPelna: expect.any(String),
      adres: expect.any(String),
      typ: expect.any(String),
    });
  });
});
