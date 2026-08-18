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

function partsFromDayMonthYear(
  dayRaw: string,
  monthRaw: string,
  yearRaw: string,
): ParsedDayMonthYear | null {
  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { day, month, year };
}

/** Parsuje `dd.mm.rrrr` albo zakres `dd.mm/dd.mm.rrrr` (miesiąc z Od). Invalid → null. */
export function parseDataOdbioru(value: string): ParsedDayMonthYear | null {
  const s = value.trim();
  const range = s.match(/^(\d{1,2})\.(\d{1,2})\/(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (range) {
    return partsFromDayMonthYear(range[1]!, range[2]!, range[5]!);
  }
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) {
    return null;
  }
  return partsFromDayMonthYear(m[1]!, m[2]!, m[3]!);
}

/** `{MiesiącPL} {YYYY}` z już sparsowanej daty. */
export function monthSheetNameFromParts(month: number, year: number): string {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`);
  }
  return `${MONTH_NAMES_PL[month - 1]} ${year}`;
}

/**
 * Nazwa zakładki z `dataOdbioru` (`dd.mm.rrrr` lub `dd.mm/dd.mm.rrrr`).
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
