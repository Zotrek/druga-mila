/**
 * Budowa payloadu seedReferenceData — Excel + overlay → Google Sheets.
 */

import type { AppConfig } from './config.js';
import { readPoints } from './readPoints.js';
import { readPrzewoznicy } from './readPodwyko.js';
import { readDeliveryPlaces } from './readUnloadDelivery.js';
import {
  mergeListEntries,
  mergeLoadPoints,
  readManualOverlay,
} from './readManualOverlay.js';
import { attachCoords, geocodeAddresses } from './geocode.js';
import type { DeliveryPlaceRecord, PrzewoznikRecord } from './referenceFormats.js';
import { parseLegacyPodwykoValue } from './referenceFormats.js';

export interface ReferenceSeedZaladunek {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  typ: string;
  rodzajZbiorki: string;
  lat: number | null;
  lon: number | null;
}

export interface ReferenceSeedPayload {
  mode: 'seedReferenceData';
  zaladunek: ReferenceSeedZaladunek[];
  przewoznicy: PrzewoznikRecord[];
  miejscaDostawy: DeliveryPlaceRecord[];
}

function mergePrzewoznicy(
  base: PrzewoznikRecord[],
  overlay: Array<{ label: string; value: string } & Partial<PrzewoznikRecord>>,
): PrzewoznikRecord[] {
  const byKey = new Map<string, PrzewoznikRecord>();
  for (const e of base) {
    byKey.set(e.nazwaWyswietlana.trim().toLowerCase(), e);
  }
  for (const raw of overlay) {
    const parsed =
      raw.nazwaDoProtokolu != null || raw.adres != null
        ? {
            nazwaWyswietlana: raw.nazwaWyswietlana ?? raw.label,
            nazwaDoProtokolu: raw.nazwaDoProtokolu ?? raw.label,
            adres: raw.adres ?? '',
            nip: raw.nip ?? '',
            bdo: raw.bdo ?? '',
          }
        : parseLegacyPodwykoValue(raw.label, raw.value);
    byKey.set(parsed.nazwaWyswietlana.trim().toLowerCase(), parsed);
  }
  return [...byKey.values()];
}

function mergeDeliveryPlaces(
  base: DeliveryPlaceRecord[],
  overlay: Array<Partial<DeliveryPlaceRecord> & { label?: string; value?: string }>,
): DeliveryPlaceRecord[] {
  const byKey = new Map<string, DeliveryPlaceRecord>();
  for (const e of base) {
    byKey.set(`${e.adres.trim().toLowerCase()}|${e.nazwaPelna.trim().toLowerCase()}`, e);
  }
  for (const raw of overlay) {
    const entry: DeliveryPlaceRecord = {
      nazwaPelna: raw.nazwaPelna ?? raw.label ?? '',
      nazwaSkrocona: raw.nazwaSkrocona ?? raw.label ?? '',
      adres: raw.adres ?? '',
      typ: raw.typ ?? '',
    };
    if (!entry.adres) {
      continue;
    }
    if (!entry.nazwaPelna && !entry.nazwaSkrocona) {
      continue;
    }
    if (!entry.nazwaPelna) {
      entry.nazwaPelna = entry.nazwaSkrocona;
    }
    if (!entry.nazwaSkrocona) {
      entry.nazwaSkrocona = entry.nazwaPelna;
    }
    byKey.set(
      `${entry.adres.trim().toLowerCase()}|${entry.nazwaPelna.trim().toLowerCase()}`,
      entry,
    );
  }
  return [...byKey.values()];
}

/** Zbiera dane z Excela (+ overlay) i geokoduje tylko adresy załadunku. */
export async function buildReferenceSeedPayload(cfg: AppConfig): Promise<ReferenceSeedPayload> {
  const manualOverlay = readManualOverlay(cfg.manualOverlayPath);
  const points = mergeLoadPoints(readPoints(cfg.pointsXlsxPath), manualOverlay.zaladunek);
  const przewoznicy = mergePrzewoznicy(
    readPrzewoznicy(cfg.podwykoXlsxPath, { referenceJsonPath: cfg.referencePrzewoznicyPath }),
    manualOverlay.przewoznicy,
  );
  const delivery = mergeDeliveryPlaces(
    readDeliveryPlaces(cfg.pointsXlsxPath),
    manualOverlay.miejscaDostawy,
  );

  const zalAddresses = points.map((p) => p.adres);
  const { results } = await geocodeAddresses([...new Set(zalAddresses)], {
    cachePath: cfg.geocodeCachePath,
    userAgent: cfg.nominatimUserAgent,
  });

  const withCoords = attachCoords(points, results);

  return {
    mode: 'seedReferenceData',
    zaladunek: withCoords.map((p) => ({
      nazwaPelna: p.nazwaPelna,
      nazwaSkrocona: p.nazwaSkrocona,
      adres: p.adres,
      typ: p.typ,
      rodzajZbiorki: p.rodzajZbiorki,
      lat: p.lat ?? null,
      lon: p.lon ?? null,
    })),
    przewoznicy: przewoznicy.map((p) => ({
      nazwaWyswietlana: p.nazwaWyswietlana,
      nazwaDoProtokolu: p.nazwaDoProtokolu,
      adres: p.adres,
      nip: p.nip,
      bdo: p.bdo,
      lat: null,
      lon: null,
    })),
    miejscaDostawy: delivery,
  };
}
