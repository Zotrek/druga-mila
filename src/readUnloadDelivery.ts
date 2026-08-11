/**
 * Odczyt arkusza Rozładunek z data/druga-mila.xlsx → opcje „Miejsce dostawy”.
 * Etykieta = nazwa skrócona (fallback: pełna); value = adres.
 * Wiersze bez etykiety lub bez adresu — pomijane.
 */

import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import {
  COL_ADRES,
  COL_NAZWA_PELNA,
  COL_NAZWA_SKROCONA,
  SHEET_NAME_ROZLADUNEK,
} from './config.js';
import type { PodwykoEntry } from './readPodwyko.js';

function cellStr(row: unknown[], col: number): string {
  const v = row[col];
  if (v == null) {
    return '';
  }
  return String(v).trim();
}

/**
 * Parsuje wiersz Rozładunek do opcji comboboxa dostawy.
 * null gdy brak etykiety lub adresu.
 */
export function parseUnloadDeliveryRow(row: unknown[]): PodwykoEntry | null {
  const adres = cellStr(row, COL_ADRES);
  const nazwaSkrocona = cellStr(row, COL_NAZWA_SKROCONA);
  const nazwaPelna = cellStr(row, COL_NAZWA_PELNA);
  const label = nazwaSkrocona || nazwaPelna;
  if (!label || !adres) {
    return null;
  }
  return { label, value: adres };
}

/**
 * Odczytuje miejsca dostawy z arkusza Rozładunek.
 * Pomija nagłówek oraz wiersze bez nazwy lub adresu.
 */
export function readUnloadDelivery(xlsxPath: string): PodwykoEntry[] {
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

  const entries: PodwykoEntry[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      continue;
    }
    const entry = parseUnloadDeliveryRow(row);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}
