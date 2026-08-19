/**
 * Ręcznie dodane wpisy (JSON w repo) — scalane z Excel przy buildzie.
 * Plik: data/manual-overlay.json — commit + push utrwala dane dla wszystkich.
 */

import { readFileSync, existsSync } from 'node:fs';
import { classifyPointColor } from './classify.js';
import type { LoadPoint } from './readPoints.js';
import type { PodwykoEntry } from './readPodwyko.js';

export interface ManualLoadEntry {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  typ: string;
  rodzajZbiorki: string;
}

export interface ManualListEntry {
  label: string;
  value: string;
}

export interface ManualOverlay {
  zaladunek: ManualLoadEntry[];
  przewoznicy: ManualListEntry[];
  miejscaDostawy: ManualListEntry[];
}

export const EMPTY_MANUAL_OVERLAY: ManualOverlay = {
  zaladunek: [],
  przewoznicy: [],
  miejscaDostawy: [],
};

function str(v: unknown): string {
  if (v == null) {
    return '';
  }
  return String(v).trim();
}

/** Parsuje wpis załadunku z JSON; null gdy brak adresu. */
export function parseManualLoadEntry(raw: unknown): ManualLoadEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const adres = str(o.adres);
  if (!adres) {
    return null;
  }
  return {
    nazwaPelna: str(o.nazwaPelna),
    nazwaSkrocona: str(o.nazwaSkrocona),
    adres,
    typ: str(o.typ),
    rodzajZbiorki: str(o.rodzajZbiorki),
  };
}

/** Parsuje wpis listy (przewoźnik / miejsce dostawy); null gdy brak etykiety. */
export function parseManualListEntry(raw: unknown): ManualListEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const label = str(o.label);
  if (!label) {
    return null;
  }
  const value = str(o.value) || label;
  return { label, value };
}

/** Waliduje i normalizuje obiekt overlay z pliku JSON. */
export function normalizeManualOverlay(raw: unknown): ManualOverlay {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_MANUAL_OVERLAY };
  }
  const o = raw as Record<string, unknown>;
  const zaladunek: ManualLoadEntry[] = [];
  const przewoznicy: ManualListEntry[] = [];
  const miejscaDostawy: ManualListEntry[] = [];

  if (Array.isArray(o.zaladunek)) {
    for (const item of o.zaladunek) {
      const entry = parseManualLoadEntry(item);
      if (entry) {
        zaladunek.push(entry);
      }
    }
  }
  if (Array.isArray(o.przewoznicy)) {
    for (const item of o.przewoznicy) {
      const entry = parseManualListEntry(item);
      if (entry) {
        przewoznicy.push(entry);
      }
    }
  }
  if (Array.isArray(o.miejscaDostawy)) {
    for (const item of o.miejscaDostawy) {
      const entry = parseManualListEntry(item);
      if (entry) {
        miejscaDostawy.push(entry);
      }
    }
  }

  return { zaladunek, przewoznicy, miejscaDostawy };
}

/**
 * Odczytuje data/manual-overlay.json.
 * Brak pliku → pusty overlay (bez błędu).
 */
export function readManualOverlay(jsonPath: string): ManualOverlay {
  if (!existsSync(jsonPath)) {
    return { ...EMPTY_MANUAL_OVERLAY };
  }
  const text = readFileSync(jsonPath, 'utf-8');
  if (!text.trim()) {
    return { ...EMPTY_MANUAL_OVERLAY };
  }
  return normalizeManualOverlay(JSON.parse(text) as unknown);
}

function loadPointKey(p: Pick<LoadPoint, 'adres' | 'nazwaPelna'>): string {
  return `${p.adres.trim().toLowerCase()}|${p.nazwaPelna.trim().toLowerCase()}`;
}

function listEntryKey(e: Pick<PodwykoEntry, 'label'>): string {
  return e.label.trim().toLowerCase();
}

/** Konwertuje wpis overlay na LoadPoint z colorKind. */
export function manualLoadToPoint(entry: ManualLoadEntry): LoadPoint {
  return {
    ...entry,
    colorKind: classifyPointColor(entry),
  };
}

/**
 * Scala punkty załadunku z Excel + overlay (bez duplikatów po adres+nazwaPelna).
 * Wpisy z overlay mają pierwszeństwo przy kolizji klucza.
 */
export function mergeLoadPoints(base: LoadPoint[], overlay: ManualLoadEntry[]): LoadPoint[] {
  const byKey = new Map<string, LoadPoint>();
  for (const p of base) {
    byKey.set(loadPointKey(p), p);
  }
  for (const entry of overlay) {
    byKey.set(loadPointKey(entry), manualLoadToPoint(entry));
  }
  return [...byKey.values()];
}

/**
 * Scala listę przewoźników / miejsc dostawy (bez duplikatów po label).
 * Wpisy z overlay mają pierwszeństwo przy kolizji klucza.
 */
export function mergeListEntries(
  base: PodwykoEntry[],
  overlay: ManualListEntry[],
): PodwykoEntry[] {
  const byKey = new Map<string, PodwykoEntry>();
  for (const e of base) {
    byKey.set(listEntryKey(e), e);
  }
  for (const entry of overlay) {
    byKey.set(listEntryKey(entry), { label: entry.label, value: entry.value });
  }
  return [...byKey.values()];
}
