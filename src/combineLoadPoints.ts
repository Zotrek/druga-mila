/**
 * Sklejanie dwóch miejsc załadunku w protokół łączony.
 * Separator: `-` (Adres1-Adres2, Nazwa1-Nazwa2, …).
 */

import { buildMiejsceZaladunkuWord } from './wordFileName.js';

export const COMBINE_SEP = '-';

export interface CombinableLoadPoint {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  typ: string;
}

/** Wynik sklejenia — kształt jak LoadPoint + pole Word. */
export interface CombinedLoadPoint {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  typ: string;
  miejsceZaladunkuWord: string;
}

/** Skleja niepuste fragmenty separatorem `-`. */
export function joinWithDash(parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join(COMBINE_SEP);
}

/**
 * Znacznik miejsca: ten sam typ → jeden; różne → oba (`CD-PLAC`);
 * puste pomijane.
 */
export function combineZnacznikMiejsca(typA: string, typB: string): string {
  const a = typA.trim();
  const b = typB.trim();
  if (a && b) {
    return a === b ? a : joinWithDash([a, b]);
  }
  return a || b;
}

/**
 * Buduje zbiorczy punkt z dwóch miejsc (kolejność = kolejność argumentów).
 */
export function combineLoadPoints(
  a: CombinableLoadPoint,
  b: CombinableLoadPoint,
): CombinedLoadPoint {
  const shortA = (a.nazwaSkrocona || a.nazwaPelna).trim();
  const shortB = (b.nazwaSkrocona || b.nazwaPelna).trim();
  return {
    nazwaPelna: joinWithDash([a.nazwaPelna, b.nazwaPelna]),
    nazwaSkrocona: joinWithDash([shortA, shortB]),
    adres: joinWithDash([a.adres, b.adres]),
    typ: combineZnacznikMiejsca(a.typ, b.typ),
    miejsceZaladunkuWord: joinWithDash([
      buildMiejsceZaladunkuWord(a.nazwaPelna, a.adres),
      buildMiejsceZaladunkuWord(b.nazwaPelna, b.adres),
    ]),
  };
}
