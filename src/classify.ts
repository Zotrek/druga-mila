/**
 * Klasyfikacja koloru pinezki (SPEC): Bolęcin → CD → PLAC → puste.
 */

import { POINT_COLOR_HEX, type PointColorKind } from './config.js';

const BOLECIN_RE = /bol[eę]cin/i;

export interface ClassifyInput {
  nazwaPelna: string;
  nazwaSkrocona?: string;
  adres: string;
  typ: string;
}

/**
 * Zwraca rodzaj koloru wg kolejności reguł SPEC.
 * Bolęcin ma pierwszeństwo przed typem CD/PLAC/puste.
 */
export function classifyPointColor(input: ClassifyInput): PointColorKind {
  const haystack = `${input.nazwaPelna} ${input.nazwaSkrocona ?? ''} ${input.adres}`;
  if (BOLECIN_RE.test(haystack)) {
    return 'bolecin';
  }

  const typ = input.typ.trim().toUpperCase();
  if (typ === 'CD') {
    return 'cd';
  }
  if (typ === 'PLAC') {
    return 'plac';
  }
  return 'puste';
}

/** Hex koloru dla pinezki. */
export function classifyPointHex(input: ClassifyInput): string {
  return POINT_COLOR_HEX[classifyPointColor(input)];
}

/** Czy tekst wskazuje na Bolęcin (nazwa lub adres). */
export function mentionsBolecin(...parts: string[]): boolean {
  return BOLECIN_RE.test(parts.join(' '));
}
