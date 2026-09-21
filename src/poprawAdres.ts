/**
 * Rejestr „Popraw adres” — ręcznie zweryfikowane współrzędne (Google Sheet).
 * Klucz: adres | nazwaPelna | nazwaSkrocona (znormalizowane).
 */

import type { GeocodeCache, GeocodeCacheEntry } from './geocode.js';
import { normalizeAddressKey } from './geocode.js';

export interface PoprawAdresEntry {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  lat: number;
  lon: number;
  uwagi?: string;
  updatedAt?: string;
  author?: string;
}

export interface PoprawAdresPointRef {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
}

function normalizeKeyPart(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/\s+/g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Klucz lookup / upsert (adres + nazwy). */
export function buildPoprawAdresLookupKey(
  adres: string,
  nazwaPelna = '',
  nazwaSkrocona = '',
): string {
  return `${normalizeKeyPart(adres)}\0${normalizeKeyPart(nazwaPelna)}\0${normalizeKeyPart(nazwaSkrocona)}`;
}

/** PL locale: "50,39196" → 50.39196 */
export function parsePoprawCoord(raw: unknown): number {
  if (typeof raw === 'number') {
    return raw;
  }
  const normalized = String(raw ?? '')
    .trim()
    .replace(',', '.');
  return Number.parseFloat(normalized);
}

function parseLatLon(rawLat: unknown, rawLon: unknown): { lat: number; lon: number } | null {
  const lat = parsePoprawCoord(rawLat);
  const lon = parsePoprawCoord(rawLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  return { lat, lon };
}

function strField(v: unknown): string {
  if (v == null) {
    return '';
  }
  return String(v).trim();
}

/** Parsuje wpis z API / JSON (toleruje lon/lng). */
export function parsePoprawAdresEntry(raw: unknown): PoprawAdresEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const adres = strField(o.adres);
  const coords = parseLatLon(o.lat, o.lon != null ? o.lon : o.lng);
  if (!adres || !coords) {
    return null;
  }
  return {
    nazwaPelna: strField(o.nazwaPelna),
    nazwaSkrocona: strField(o.nazwaSkrocona),
    adres,
    lat: coords.lat,
    lon: coords.lon,
    uwagi: strField(o.uwagi) || undefined,
    updatedAt: strField(o.updatedAt) || undefined,
    author: strField(o.author) || undefined,
  };
}

export function buildPoprawAdresIndex(
  entries: PoprawAdresEntry[],
): Map<string, PoprawAdresEntry> {
  const index = new Map<string, PoprawAdresEntry>();
  for (const entry of entries) {
    const key = buildPoprawAdresLookupKey(
      entry.adres,
      entry.nazwaPelna,
      entry.nazwaSkrocona,
    );
    index.set(key, entry);
  }
  return index;
}

/**
 * Dopasowanie: pełny klucz → sam adres (puste nazwy) → częściowe
 * (puste części klucza = wildcard).
 */
export function findPoprawAdresMatch(
  index: Map<string, PoprawAdresEntry>,
  point: PoprawAdresPointRef,
): PoprawAdresEntry | undefined {
  const fullKey = buildPoprawAdresLookupKey(
    point.adres,
    point.nazwaPelna,
    point.nazwaSkrocona,
  );
  const fullHit = index.get(fullKey);
  if (fullHit) {
    return fullHit;
  }

  const addressOnlyKey = buildPoprawAdresLookupKey(point.adres, '', '');
  const addressOnlyHit = index.get(addressOnlyKey);
  if (addressOnlyHit) {
    return addressOnlyHit;
  }

  const adresNorm = normalizeKeyPart(point.adres);
  const pelnaNorm = normalizeKeyPart(point.nazwaPelna);
  const skroconaNorm = normalizeKeyPart(point.nazwaSkrocona);

  for (const [key, entry] of index.entries()) {
    const parts = key.split('\0');
    const keyAdres = parts[0] ?? '';
    if (keyAdres !== adresNorm) {
      continue;
    }
    const keyPelna = parts[1] ?? '';
    const keySkrocona = parts[2] ?? '';
    if (keyPelna && pelnaNorm !== keyPelna) {
      continue;
    }
    if (keySkrocona && skroconaNorm !== keySkrocona) {
      continue;
    }
    return entry;
  }

  return undefined;
}

/**
 * Nadpisuje wpisy geocode-cache kluczami adresów z poprawek.
 * Zwraca liczbę zaktualizowanych / dodanych kluczy.
 */
export function mergePoprawAdresIntoGeocodeCache(
  cache: GeocodeCache,
  entries: PoprawAdresEntry[],
  queriedAt: string = new Date().toISOString(),
): number {
  let n = 0;
  for (const entry of entries) {
    const key = normalizeAddressKey(entry.adres);
    if (!key) {
      continue;
    }
    const next: GeocodeCacheEntry = {
      lat: entry.lat,
      lon: entry.lon,
      status: 'ok',
      displayName: entry.adres,
      queriedAt,
    };
    cache[key] = next;
    n += 1;
  }
  return n;
}

/** Filtruje i parsuje tablicę z listReferenceData.poprawAdres. */
export function parsePoprawAdresList(raw: unknown): PoprawAdresEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: PoprawAdresEntry[] = [];
  for (const item of raw) {
    const entry = parsePoprawAdresEntry(item);
    if (entry) {
      out.push(entry);
    }
  }
  return out;
}
