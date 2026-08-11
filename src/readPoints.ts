/**
 * Odczyt punktów z data/druga-mila.xlsx (arkusz Załadunek).
 * Wiersze bez adresu (C) — pomijane.
 */

import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import {
  COL_ADRES,
  COL_NAZWA_PELNA,
  COL_NAZWA_SKROCONA,
  COL_TYP,
  SHEET_NAME_ZALADUNEK,
  type PointColorKind,
} from './config.js';
import { classifyPointColor } from './classify.js';

export interface LoadPoint {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  typ: string;
  colorKind: PointColorKind;
}

function cellStr(row: unknown[], col: number): string {
  const v = row[col];
  if (v == null) {
    return '';
  }
  return String(v).trim();
}

/**
 * Parsuje wiersz danych Załadunek (bez nagłówka).
 * Zwraca null gdy brak adresu (kolumna C).
 */
export function parseLoadRow(row: unknown[]): LoadPoint | null {
  const adres = cellStr(row, COL_ADRES);
  if (!adres) {
    return null;
  }

  const nazwaPelna = cellStr(row, COL_NAZWA_PELNA);
  const nazwaSkrocona = cellStr(row, COL_NAZWA_SKROCONA);
  const typ = cellStr(row, COL_TYP);

  return {
    nazwaPelna,
    nazwaSkrocona,
    adres,
    typ,
    colorKind: classifyPointColor({ nazwaPelna, nazwaSkrocona, adres, typ }),
  };
}

/**
 * Odczytuje punkty z pliku XLSX (arkusz Załadunek).
 * Pomija wiersz nagłówka i wiersze bez adresu.
 */
export function readPoints(xlsxPath: string): LoadPoint[] {
  const buf = readFileSync(xlsxPath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames.includes(SHEET_NAME_ZALADUNEK)
    ? SHEET_NAME_ZALADUNEK
    : wb.SheetNames[0];
  if (!sheetName) {
    return [];
  }

  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  const points: LoadPoint[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      continue;
    }
    const point = parseLoadRow(row);
    if (point) {
      points.push(point);
    }
  }
  return points;
}
