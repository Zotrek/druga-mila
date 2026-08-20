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
/** E — Rodzaj zbiórki (manualna / automatyczna / manualna i automatyczna) */
export const COL_RODZAJ_ZBIORKI = 4;

/** Dozwolone wartości kolumny E — jak w modalu protokołu. */
export const RODZAJ_ZBIORKI_VALUES = [
  'manualna',
  'automatyczna',
  'manualna i automatyczna',
] as const;

export type RodzajZbiorki = (typeof RODZAJ_ZBIORKI_VALUES)[number];

// --- Kolumny podwyko lista.xlsx ---
/** A — etykieta UI */
export const COL_PODWYKO_UI = 0;
/** B — treść do Word */
export const COL_PODWYKO_WORD = 1;

/** Nazwa arkusza z punktami (pierwszy arkusz jeśli brak dokładnej nazwy). */
export const SHEET_NAME_ZALADUNEK = 'Załadunek';

/** Nazwa arkusza miejsc rozładunku → combobox „Miejsce dostawy”. */
export const SHEET_NAME_ROZLADUNEK = 'Rozładunek';

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
export const DEFAULT_MANUAL_OVERLAY_PATH = join(PROJECT_ROOT, 'data', 'manual-overlay.json');
export const DEFAULT_REFERENCE_PRZEWOZNICY_PATH = join(
  PROJECT_ROOT,
  'data',
  'reference-przewoznicy.json',
);
export const DEFAULT_OUTPUT_HTML = join(PROJECT_ROOT, 'index.html');
export const DEFAULT_POINTS_XLSX = join(PROJECT_ROOT, 'data', 'druga-mila.xlsx');
export const DEFAULT_PODWYKO_XLSX = join(PROJECT_ROOT, 'docs', 'podwyko lista.xlsx');
export const DEFAULT_WORD_TEMPLATE = join(PROJECT_ROOT, 'docs', 'pusty.docx');
export const DEFAULT_FAVICON_PATH = join(PROJECT_ROOT, 'docs', 'favicon.png');

export const DEFAULT_NOMINATIM_USER_AGENT =
  'druga-mila/1.0 (https://github.com/zotrek/druga-mila; lokalny build mapy)';

export interface AppConfig {
  /** URL Web App formatki; pusty = Word bez POST / bez podglądu numeru. */
  webAppUrl: string;
  formatkaSheetsId: string;
  geocodeCachePath: string;
  manualOverlayPath: string;
  /** Strukturalna lista przewoźników (sync z Google Sheets); ma pierwszeństwo nad Excel. */
  referencePrzewoznicyPath: string;
  outputHtml: string;
  pointsXlsxPath: string;
  podwykoXlsxPath: string;
  wordTemplatePath: string;
  faviconPath: string;
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
    manualOverlayPath:
      process.env.MANUAL_OVERLAY_PATH?.trim() ?? DEFAULT_MANUAL_OVERLAY_PATH,
    referencePrzewoznicyPath:
      process.env.REFERENCE_PRZEWOZNICY_PATH?.trim() ?? DEFAULT_REFERENCE_PRZEWOZNICY_PATH,
    outputHtml: process.env.OUTPUT_HTML?.trim() ?? DEFAULT_OUTPUT_HTML,
    pointsXlsxPath: process.env.POINTS_XLSX_PATH?.trim() ?? DEFAULT_POINTS_XLSX,
    podwykoXlsxPath: process.env.PODWYKO_XLSX_PATH?.trim() ?? DEFAULT_PODWYKO_XLSX,
    wordTemplatePath: process.env.WORD_TEMPLATE_PATH?.trim() ?? DEFAULT_WORD_TEMPLATE,
    faviconPath: process.env.FAVICON_PATH?.trim() ?? DEFAULT_FAVICON_PATH,
    nominatimUserAgent:
      process.env.NOMINATIM_USER_AGENT?.trim() ?? DEFAULT_NOMINATIM_USER_AGENT,
  };
}

/** URL Web App formatki — pusty gdy brak env. */
export function getWebAppUrl(): string {
  return process.env.DRUGA_MILA_WEBAPP_URL?.trim() ?? '';
}
