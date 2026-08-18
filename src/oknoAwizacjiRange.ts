/**
 * Zakres dat do kolumny „OKNO AWIZACJI” (tylko Google).
 * Format: `14.08/17.08.26` (pierwsza: dd.mm, druga: dd.mm.rr).
 * Kolejność dowolna; obie daty wymagane do złożenia zakresu.
 */

import { formatLoadDates } from './wordFileName.js';

/**
 * Składa zakres z dwóch wartości ISO (`yyyy-mm-dd`) lub `dd.mm.rrrr`.
 * Brak którejkolwiek daty / nieparsowalna → `''`.
 */
export function formatOknoAwizacjiRange(od: string, doDate: string): string {
  const left = formatLoadDates(String(od || '').trim());
  const right = formatLoadDates(String(doDate || '').trim());
  if (!left.doc || !right.doc) return '';
  const leftDm = left.file.slice(0, 5); // dd.mm
  if (!/^\d{2}\.\d{2}$/.test(leftDm) || !/^\d{2}\.\d{2}\.\d{2}$/.test(right.file)) {
    return '';
  }
  return `${leftDm}/${right.file}`;
}
