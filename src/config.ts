/**
 * Konfiguracja buildu Druga Mila.
 * Env, ścieżki, kolory pinezek, UA Nominatim, nazwy arkuszy Excel.
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

/** Katalog pakietu `druga-mila` (nad `src/`) — niezależnie od `process.cwd()`. */
export const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- Kolumny arkusza Załadunek (data/druga-mila.xlsx) ---
/** A — Nazwa pełna */
export const COL_NAZWA_PELNA = 0;
/** B — Nazwa skrócona */
export const COL_NAZWA_SKROCONA = 1;
/** C — Adres */
export const COL_ADRES = 2;
/** D — Typ (CD / PLAC / puste) */
export const COL_TYP = 3;

// --- Kolumny podwyko lista.xlsx ---
/** A — etykieta UI */
export const COL_PODWYKO_UI = 0;
/** B — treść do Word */
export const COL_PODWYKO_WORD = 1;

/** Nazwa arkusza z punktami (pierwszy arkusz jeśli brak dokładnej nazwy). */
export const SHEET_NAME_ZALADUNEK = 'Załadunek';

/** Kolory pinezek (SPEC). */
export const COLOR_BOLECIN = '#fd7e14';
export const COLOR_CD = '#0d6efd';
export const COLOR_PLAC = '#198754';
export const COLOR_PUSTE = '#6f42c1';

export type PointColorKind = 'bolecin' | 'cd' | 'plac' | 'puste';

export const POINT_COLOR_HEX: Record<PointColorKind, string> = {
  bolecin: COLOR_BOLECIN,
  cd: COLOR_CD,
  plac: COLOR_PLAC,
  puste: COLOR_PUSTE,
};

/** Numer startowy formatki (pusty arkusz). */
export const START_NUMBER = 'DM1';

export const DEFAULT_FORMATKA_SHEETS_ID = '1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0';

export const DEFAULT_GEOCODE_CACHE_PATH = join(PROJECT_ROOT, 'data', 'geocode-cache.json');
export const DEFAULT_OUTPUT_HTML = join(PROJECT_ROOT, 'index.html');
export const DEFAULT_POINTS_XLSX = join(PROJECT_ROOT, 'data', 'druga-mila.xlsx');
export const DEFAULT_PODWYKO_XLSX = join(PROJECT_ROOT, 'docs', 'podwyko lista.xlsx');
export const DEFAULT_WORD_TEMPLATE = join(PROJECT_ROOT, 'docs', 'pusty.docx');

export const DEFAULT_NOMINATIM_USER_AGENT =
  'druga-mila/1.0 (https://github.com/zotrek/druga-mila; lokalny build mapy)';

export interface AppConfig {
  /** URL Web App formatki; pusty = Word bez POST / bez podglądu numeru. */
  webAppUrl: string;
  formatkaSheetsId: string;
  geocodeCachePath: string;
  outputHtml: string;
  pointsXlsxPath: string;
  podwykoXlsxPath: string;
  wordTemplatePath: string;
  nominatimUserAgent: string;
}

/**
 * Konfiguracja z env (.env lub process.env).
 * `DRUGA_MILA_WEBAPP_URL` opcjonalny — bez niego generate nadal buduje mapę.
 */
export function getConfig(): AppConfig {
  return {
    webAppUrl: process.env.DRUGA_MILA_WEBAPP_URL?.trim() ?? '',
    formatkaSheetsId:
      process.env.GOOGLE_FORMATKA_SHEETS_ID?.trim() ?? DEFAULT_FORMATKA_SHEETS_ID,
    geocodeCachePath:
      process.env.GEOCODE_CACHE_PATH?.trim() ?? DEFAULT_GEOCODE_CACHE_PATH,
    outputHtml: process.env.OUTPUT_HTML?.trim() ?? DEFAULT_OUTPUT_HTML,
    pointsXlsxPath: process.env.POINTS_XLSX_PATH?.trim() ?? DEFAULT_POINTS_XLSX,
    podwykoXlsxPath: process.env.PODWYKO_XLSX_PATH?.trim() ?? DEFAULT_PODWYKO_XLSX,
    wordTemplatePath: process.env.WORD_TEMPLATE_PATH?.trim() ?? DEFAULT_WORD_TEMPLATE,
    nominatimUserAgent:
      process.env.NOMINATIM_USER_AGENT?.trim() ?? DEFAULT_NOMINATIM_USER_AGENT,
  };
}

/** URL Web App formatki — pusty gdy brak env. */
export function getWebAppUrl(): string {
  return process.env.DRUGA_MILA_WEBAPP_URL?.trim() ?? '';
}
