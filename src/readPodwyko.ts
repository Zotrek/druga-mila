/**
 * Odczyt listy przewoźników:
 * - preferowany: data/reference-przewoznicy.json (sync z Google Sheets)
 * - fallback: docs/podwyko lista.xlsx (A=etykieta, B=legacy Dane → parsowane)
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import { COL_PODWYKO_UI, COL_PODWYKO_WORD, DEFAULT_REFERENCE_PRZEWOZNICY_PATH } from './config.js';
import {
  formatPrzewoznikForWord,
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

function normalizePrzewoznikRecord(raw: Partial<PrzewoznikRecord>): PrzewoznikRecord | null {
  const nazwaWyswietlana = String(raw.nazwaWyswietlana ?? '').trim();
  if (!nazwaWyswietlana) {
    return null;
  }
  const nazwaDoProtokolu = String(raw.nazwaDoProtokolu ?? nazwaWyswietlana).trim();
  return {
    nazwaWyswietlana,
    nazwaDoProtokolu,
    adres: String(raw.adres ?? '').trim(),
    nip: String(raw.nip ?? '').trim(),
    bdo: String(raw.bdo ?? '').trim(),
  };
}

/** Odczyt strukturalnej listy przewoźników z JSON (pull z Google Sheets). */
export function readPrzewoznicyFromJson(jsonPath: string): PrzewoznikRecord[] {
  if (!existsSync(jsonPath)) {
    return [];
  }
  const parsed = JSON.parse(readFileSync(jsonPath, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${jsonPath}: oczekiwana tablica przewoźników`);
  }
  const out: PrzewoznikRecord[] = [];
  for (const item of parsed) {
    const record = normalizePrzewoznikRecord(item as Partial<PrzewoznikRecord>);
    if (record) {
      out.push(record);
    }
  }
  return out;
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

function readPrzewoznicyFromXlsx(xlsxPath: string): PrzewoznikRecord[] {
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

export interface ReadPrzewoznicyOptions {
  referenceJsonPath?: string;
}

/**
 * Odczytuje przewoźników jako rekordy strukturalne.
 * Gdy istnieje reference-przewoznicy.json — używa go zamiast heurystyki z Excela.
 */
export function readPrzewoznicy(
  xlsxPath: string,
  options?: ReadPrzewoznicyOptions,
): PrzewoznikRecord[] {
  const jsonPath = options?.referenceJsonPath ?? DEFAULT_REFERENCE_PRZEWOZNICY_PATH;
  const fromJson = readPrzewoznicyFromJson(jsonPath);
  if (fromJson.length > 0) {
    return fromJson;
  }
  return readPrzewoznicyFromXlsx(xlsxPath);
}

/** Nadpisuje podwyko lista.xlsx kolumną B wygenerowaną ze strukturalnych pól. */
export function syncPodwykoXlsxFromReference(
  referenceJsonPath: string,
  xlsxPath: string,
): void {
  const records = readPrzewoznicyFromJson(referenceJsonPath);
  if (!records.length) {
    throw new Error(`Brak danych w ${referenceJsonPath}`);
  }

  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error('podwyko xlsx: brak arkusza');
  }

  const existing = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName]!, {
    header: 1,
    defval: '',
  });
  const header = existing[0] ?? ['Nazwa', 'Dane'];

  const rows: unknown[][] = [header];
  for (const r of records) {
    rows.push([r.nazwaWyswietlana, formatPrzewoznikForWord(r)]);
  }

  wb.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(rows);
  writeFileSync(xlsxPath, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  console.log(`[druga-mila] sync podwyko: ${records.length} wierszy → ${xlsxPath}`);
}

/**
 * Odczytuje listę przewoźników jako opcje combobox (label + value do Word).
 */
export function readPodwyko(
  xlsxPath: string,
  options?: ReadPrzewoznicyOptions,
): PodwykoEntry[] {
  return readPrzewoznicy(xlsxPath, options).map(przewoznikToComboboxOption);
}

/** Znajdź wpis po etykiecie (case-insensitive). */
export function findPodwykoByLabel(
  entries: PodwykoEntry[],
  label: string,
): PodwykoEntry | undefined {
  const needle = label.trim().toLowerCase();
  return entries.find((e) => e.label.trim().toLowerCase() === needle);
}
