/**
 * Odczyt arkusza Rozładunek z data/druga-mila.xlsx → miejsca dostawy.
 */

import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import {
  COL_ADRES,
  COL_NAZWA_PELNA,
  COL_NAZWA_SKROCONA,
  COL_TYP,
  SHEET_NAME_ROZLADUNEK,
} from './config.js';
import {
  deliveryToComboboxOption,
  type ComboboxOption,
  type DeliveryPlaceRecord,
} from './referenceFormats.js';

export type PodwykoEntry = ComboboxOption;

function cellStr(row: unknown[], col: number): string {
  const v = row[col];
  if (v == null) {
    return '';
  }
  return String(v).trim();
}

/**
 * Parsuje wiersz Rozładunek.
 * null gdy brak etykiety lub adresu.
 */
export function parseDeliveryPlaceRow(row: unknown[]): DeliveryPlaceRecord | null {
  const adres = cellStr(row, COL_ADRES);
  const nazwaSkrocona = cellStr(row, COL_NAZWA_SKROCONA);
  const nazwaPelna = cellStr(row, COL_NAZWA_PELNA);
  const label = nazwaSkrocona || nazwaPelna;
  if (!label || !adres) {
    return null;
  }
  return {
    nazwaPelna: nazwaPelna || nazwaSkrocona,
    nazwaSkrocona: nazwaSkrocona || nazwaPelna,
    adres,
    typ: cellStr(row, COL_TYP),
  };
}

/** @deprecated użyj parseDeliveryPlaceRow */
export function parseUnloadDeliveryRow(row: unknown[]): PodwykoEntry | null {
  const record = parseDeliveryPlaceRow(row);
  return record ? deliveryToComboboxOption(record) : null;
}

/** Odczytuje miejsca dostawy jako rekordy strukturalne. */
export function readDeliveryPlaces(xlsxPath: string): DeliveryPlaceRecord[] {
  const buf = readFileSync(xlsxPath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames.includes(SHEET_NAME_ROZLADUNEK)
    ? SHEET_NAME_ROZLADUNEK
    : undefined;
  if (!sheetName) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
    header: 1,
    defval: '',
    raw: false,
  });

  const entries: DeliveryPlaceRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      continue;
    }
    const entry = parseDeliveryPlaceRow(row);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

/** Odczytuje miejsca dostawy jako opcje combobox. */
export function readUnloadDelivery(xlsxPath: string): PodwykoEntry[] {
  return readDeliveryPlaces(xlsxPath).map(deliveryToComboboxOption);
}
