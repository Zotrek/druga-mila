/**
 * Nazwa zakładki miesięcznej formatki Google (lustro Apps Script).
 * Format: „Sierpień 2026”.
 */

export const MONTH_NAMES_PL = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
] as const;

export interface ParsedDayMonthYear {
  day: number;
  month: number;
  year: number;
}

/** Parsuje `dd.mm.rrrr` (1–2 cyfry dzień/miesiąc). Invalid → null. */
export function parseDataOdbioru(value: string): ParsedDayMonthYear | null {
  const s = value.trim();
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) {
    return null;
  }
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { day, month, year };
}

/** `{MiesiącPL} {YYYY}` z już sparsowanej daty. */
export function monthSheetNameFromParts(month: number, year: number): string {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }
  return `${MONTH_NAMES_PL[month - 1]} ${year}`;
}

/**
 * Nazwa zakładki z `dataOdbioru` (`dd.mm.rrrr`).
 * Puste / nieparsowalne → `fallback` (zwykle „dziś”).
 */
export function monthSheetNameFromDataOdbioru(
  dataOdbioru: string,
  fallback: ParsedDayMonthYear,
): string {
  const parsed = parseDataOdbioru(dataOdbioru);
  const d = parsed ?? fallback;
  return monthSheetNameFromParts(d.month, d.year);
}
