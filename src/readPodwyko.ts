/**
 * Odczyt listy podwykonawców z docs/podwyko lista.xlsx (A=UI, B=Word).
 */

import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import { COL_PODWYKO_UI, COL_PODWYKO_WORD } from './config.js';

export interface PodwykoEntry {
  /** Etykieta comboboxa (kolumna Nazwa). */
  label: string;
  /** Pełne dane do Word / Sheets (kolumna Dane). */
  value: string;
}

function cellStr(row: unknown[], col: number): string {
  const v = row[col];
  if (v == null) {
    return '';
  }
  return String(v).trim();
}

/** Parsuje wiersz podwyko; null gdy brak etykiety. */
export function parsePodwykoRow(row: unknown[]): PodwykoEntry | null {
  const label = cellStr(row, COL_PODWYKO_UI);
  if (!label) {
    return null;
  }
  return {
    label,
    value: cellStr(row, COL_PODWYKO_WORD) || label,
  };
}

/**
 * Odczytuje listę przewoźników / miejsc dostawy.
 * Używa pierwszego arkusza (zwykle „przewoźnicy”).
 */
export function readPodwyko(xlsxPath: string): PodwykoEntry[] {
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

  const entries: PodwykoEntry[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      continue;
    }
    const entry = parsePodwykoRow(row);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

/** Znajdź wpis po etykiecie (case-insensitive). */
export function findPodwykoByLabel(
  entries: PodwykoEntry[],
  label: string,
): PodwykoEntry | undefined {
  const needle = label.trim().toLowerCase();
  return entries.find((e) => e.label.trim().toLowerCase() === needle);
}
