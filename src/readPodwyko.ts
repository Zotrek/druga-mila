/**
 * Odczyt listy przewoźników z docs/podwyko lista.xlsx.
 * Legacy: A=Nazwa wyświetlana, B=sklejone Dane → parsowane do pól strukturalnych.
 */

import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import { COL_PODWYKO_UI, COL_PODWYKO_WORD } from './config.js';
import {
  parseLegacyPodwykoValue,
  przewoznikToComboboxOption,
  type ComboboxOption,
  type PrzewoznikRecord,
} from './referenceFormats.js';

export type PodwykoEntry = ComboboxOption;

function cellStr(row: unknown[], col: number): string {
  const v = row[col];
  if (v == null) {
    return '';
  }
  return String(v).trim();
}

/** Parsuje wiersz legacy podwyko; null gdy brak etykiety. */
export function parsePrzewoznikRow(row: unknown[]): PrzewoznikRecord | null {
  const label = cellStr(row, COL_PODWYKO_UI);
  if (!label) {
    return null;
  }
  const legacyValue = cellStr(row, COL_PODWYKO_WORD);
  if (!legacyValue) {
    return {
      nazwaWyswietlana: label,
      nazwaDoProtokolu: label,
      adres: '',
      nip: '',
      bdo: '',
    };
  }
  return parseLegacyPodwykoValue(label, legacyValue);
}

/** @deprecated użyj parsePrzewoznikRow */
export function parsePodwykoRow(row: unknown[]): PodwykoEntry | null {
  const record = parsePrzewoznikRow(row);
  return record ? przewoznikToComboboxOption(record) : null;
}

/** Odczytuje przewoźników jako rekordy strukturalne. */
export function readPrzewoznicy(xlsxPath: string): PrzewoznikRecord[] {
  const buf = readFileSync(xlsxPath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
    header: 1,
    defval: '',
    raw: false,
  });

  const entries: PrzewoznikRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      continue;
    }
    const entry = parsePrzewoznikRow(row);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

/**
 * Odczytuje listę przewoźników jako opcje combobox (label + value do Word).
 */
export function readPodwyko(xlsxPath: string): PodwykoEntry[] {
  return readPrzewoznicy(xlsxPath).map(przewoznikToComboboxOption);
}

/** Znajdź wpis po etykiecie (case-insensitive). */
export function findPodwykoByLabel(
  entries: PodwykoEntry[],
  label: string,
): PodwykoEntry | undefined {
  const needle = label.trim().toLowerCase();
  return entries.find((e) => e.label.trim().toLowerCase() === needle);
}
