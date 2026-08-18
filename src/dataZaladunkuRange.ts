/**
 * Data załadunku z opcjonalnym zakresem Od–Do.
 * Tylko Od → `13.08.2026`. Od i Do → `13.08/14.08.2026`.
 * Daty nie muszą być kolejne; kolejność jak w polach Od / Do.
 */

import { formatLoadDates } from './wordFileName.js';

export interface DataZaladunkuParts {
  /** `dd.mm.rrrr` albo puste */
  od: string;
  /** `dd.mm.rrrr` albo puste */
  doDate: string;
}

/**
 * Składa wartość do Word / Google / UI z dwóch ISO (`yyyy-mm-dd`) lub `dd.mm.rrrr`.
 * Brak Od → `''`. Brak Do (lub ta sama data) → pojedyncza `dd.mm.rrrr`.
 */
export function formatDataZaladunkuRange(od: string, doDate: string): string {
  const left = formatLoadDates(String(od || '').trim());
  if (!left.doc) return '';
  const right = formatLoadDates(String(doDate || '').trim());
  if (!right.doc || right.doc === left.doc) return left.doc;
  const leftDm = left.doc.slice(0, 5); // dd.mm
  if (!/^\d{2}\.\d{2}$/.test(leftDm) || !/^\d{2}\.\d{2}\.\d{4}$/.test(right.doc)) {
    return left.doc;
  }
  return `${leftDm}/${right.doc}`;
}

/** Rozbija `13.08/14.08.2026` albo pojedynczą datę na pola Od / Do. */
export function splitDataZaladunkuRange(value: string): DataZaladunkuParts {
  const s = String(value || '').trim();
  const range = s.match(/^(\d{1,2})\.(\d{1,2})\/(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (range) {
    const yyyy = range[5]!;
    const od = `${range[1]!.padStart(2, '0')}.${range[2]!.padStart(2, '0')}.${yyyy}`;
    const doDate = `${range[3]!.padStart(2, '0')}.${range[4]!.padStart(2, '0')}.${yyyy}`;
    return { od, doDate };
  }
  return { od: formatLoadDates(s).doc, doDate: '' };
}
