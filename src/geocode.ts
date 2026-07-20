/**
 * Geokodowanie Nominatim + cache JSON (uproszczony wzorzec arkusz-mapa).
 * Rate limit: 1 req/s (polityka Nominatim).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export type GeocodeStatus = 'ok' | 'fail';

export interface GeocodeCacheEntry {
  lat: number | null;
  lon: number | null;
  status: GeocodeStatus;
  displayName?: string;
  queriedAt?: string;
}

export type GeocodeCache = Record<string, GeocodeCacheEntry>;

export interface GeocodeResult {
  address: string;
  lat: number | null;
  lon: number | null;
  status: GeocodeStatus;
  fromCache: boolean;
}

export interface GeocodeOptions {
  cachePath: string;
  userAgent: string;
  /** Opóźnienie między requestami Nominatim (ms). Domyślnie 1100. */
  rateLimitMs?: number;
  sleepFn?: (ms: number) => Promise<void>;
  fetchFn?: typeof fetch;
}

const DEFAULT_RATE_LIMIT_MS = 1100;

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Klucz cache = znormalizowany adres (trim, spacje, lower). */
export function normalizeAddressKey(address: string): string {
  return address
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function loadGeocodeCache(cachePath: string): Promise<GeocodeCache> {
  try {
    const raw = await readFile(cachePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const out: GeocodeCache = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object') {
        continue;
      }
      const e = value as Partial<GeocodeCacheEntry>;
      if (e.status !== 'ok' && e.status !== 'fail') {
        continue;
      }
      out[key] = {
        lat: typeof e.lat === 'number' ? e.lat : null,
        lon: typeof e.lon === 'number' ? e.lon : null,
        status: e.status,
        displayName: typeof e.displayName === 'string' ? e.displayName : undefined,
        queriedAt: typeof e.queriedAt === 'string' ? e.queriedAt : undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}

export async function saveGeocodeCache(
  cachePath: string,
  cache: GeocodeCache,
): Promise<void> {
  await mkdir(dirname(cachePath), { recursive: true });
  const sorted: GeocodeCache = {};
  for (const key of Object.keys(cache).sort()) {
    sorted[key] = cache[key]!;
  }
  await writeFile(cachePath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf-8');
}

function buildNominatimUrl(query: string): string {
  return `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query,
  )}&format=json&limit=1&countrycodes=pl`;
}

/**
 * Warianty zapytań: arkusz ma „XX-XXX Miasto Ulica Numer”,
 * Nominatim lepiej bierze „Ulica Numer, XX-XXX Miasto”.
 */
export function buildGeocodeQueryVariants(address: string): string[] {
  const trimmed = address.trim().replace(/\s+/g, ' ');
  const out: string[] = [];
  const push = (q: string): void => {
    const v = q.trim();
    if (v && !out.includes(v)) {
      out.push(v);
    }
  };

  push(`${trimmed}, Polska`);

  const withNumber = trimmed.match(
    /^(\d{2}-\d{3})\s+(.+?)\s+(\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?)?)$/u,
  );
  if (withNumber) {
    const postcode = withNumber[1]!;
    const middle = withNumber[2]!;
    const number = withNumber[3]!;
    const tokens = middle.split(/\s+/).filter(Boolean);
    for (let streetWords = 1; streetWords <= Math.min(3, tokens.length - 1); streetWords++) {
      const street = tokens.slice(-streetWords).join(' ');
      const city = tokens.slice(0, -streetWords).join(' ');
      if (!city) {
        continue;
      }
      push(`${street} ${number}, ${postcode} ${city}, Polska`);
      push(`${street} ${number}, ${city}, Polska`);
    }
    if (tokens.length >= 1) {
      push(`${postcode} ${tokens[0]}, Polska`);
      push(`${postcode} ${tokens.slice(0, Math.min(2, tokens.length)).join(' ')}, Polska`);
    }
  } else {
    const postcodeCity = trimmed.match(/^(\d{2}-\d{3})\s+(.+)$/u);
    if (postcodeCity) {
      push(`${postcodeCity[1]} ${postcodeCity[2]}, Polska`);
      push(`${postcodeCity[2]}, Polska`);
    }
  }

  return out;
}

interface NominatimHit {
  lat?: string;
  lon?: string;
  display_name?: string;
}

async function queryNominatimOnce(
  query: string,
  userAgent: string,
  fetchFn: typeof fetch,
): Promise<GeocodeCacheEntry | null> {
  const url = buildNominatimUrl(query);
  const response = await fetchFn(url, {
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as NominatimHit[];
  const hit = Array.isArray(payload) ? payload[0] : undefined;
  if (!hit?.lat || !hit?.lon) {
    return null;
  }
  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return {
    lat,
    lon,
    status: 'ok',
    displayName: hit.display_name,
    queriedAt: new Date().toISOString(),
  };
}

async function queryNominatim(
  address: string,
  userAgent: string,
  fetchFn: typeof fetch,
  sleepFn: (ms: number) => Promise<void>,
  rateLimitMs: number,
): Promise<GeocodeCacheEntry> {
  const variants = buildGeocodeQueryVariants(address);
  for (let i = 0; i < variants.length; i++) {
    const hit = await queryNominatimOnce(variants[i]!, userAgent, fetchFn);
    if (hit) {
      return hit;
    }
    if (i < variants.length - 1) {
      await sleepFn(rateLimitMs);
    }
  }
  return { lat: null, lon: null, status: 'fail', queriedAt: new Date().toISOString() };
}

/**
 * Geokoduje listę adresów z cache + Nominatim.
 * Zwraca wyniki w tej samej kolejności co unikalne adresy wejściowe.
 */
export async function geocodeAddresses(
  addresses: string[],
  options: GeocodeOptions,
): Promise<{ results: GeocodeResult[]; cache: GeocodeCache; stats: GeocodeStats }> {
  const rateLimitMs = options.rateLimitMs ?? DEFAULT_RATE_LIMIT_MS;
  const sleepFn = options.sleepFn ?? defaultSleep;
  const fetchFn = options.fetchFn ?? fetch;

  const cache = await loadGeocodeCache(options.cachePath);
  const uniqueKeys: string[] = [];
  const keyToOriginal = new Map<string, string>();

  for (const address of addresses) {
    const trimmed = address.trim();
    if (!trimmed) {
      continue;
    }
    const key = normalizeAddressKey(trimmed);
    if (!keyToOriginal.has(key)) {
      keyToOriginal.set(key, trimmed);
      uniqueKeys.push(key);
    }
  }

  const results: GeocodeResult[] = [];
  let cacheHits = 0;
  let fetched = 0;
  let ok = 0;
  let fail = 0;

  for (const key of uniqueKeys) {
    const original = keyToOriginal.get(key)!;
    const cached = cache[key];
    // Używaj cache tylko dla OK — fail ponawiamy (lepsze warianty zapytań).
    if (cached?.status === 'ok') {
      cacheHits += 1;
      ok += 1;
      results.push({
        address: original,
        lat: cached.lat,
        lon: cached.lon,
        status: cached.status,
        fromCache: true,
      });
      continue;
    }

    const entry = await queryNominatim(
      original,
      options.userAgent,
      fetchFn,
      sleepFn,
      rateLimitMs,
    );
    cache[key] = entry;
    fetched += 1;
    if (entry.status === 'ok') {
      ok += 1;
    } else {
      fail += 1;
    }
    results.push({
      address: original,
      lat: entry.lat,
      lon: entry.lon,
      status: entry.status,
      fromCache: false,
    });
    await sleepFn(rateLimitMs);
  }

  await saveGeocodeCache(options.cachePath, cache);

  return {
    results,
    cache,
    stats: {
      unique: uniqueKeys.length,
      cacheHits,
      fetched,
      ok,
      fail,
    },
  };
}

export interface GeocodeStats {
  unique: number;
  cacheHits: number;
  fetched: number;
  ok: number;
  fail: number;
}

/** Dołącza współrzędne do punktów po adresie. */
export function attachCoords<T extends { adres: string }>(
  points: T[],
  results: GeocodeResult[],
): Array<T & { lat: number | null; lon: number | null; geocodeStatus: GeocodeStatus }> {
  const byKey = new Map<string, GeocodeResult>();
  for (const r of results) {
    byKey.set(normalizeAddressKey(r.address), r);
  }
  return points.map((p) => {
    const hit = byKey.get(normalizeAddressKey(p.adres));
    return {
      ...p,
      lat: hit?.lat ?? null,
      lon: hit?.lon ?? null,
      geocodeStatus: hit?.status ?? 'fail',
    };
  });
}
