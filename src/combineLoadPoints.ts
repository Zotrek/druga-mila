/**
 * Sklejanie dwóch miejsc załadunku w protokół łączony.
 * Nazwy / znacznik: `-` (Nazwa1-Nazwa2, CD-PLAC).
 * Adresy (i miejsce Word): `; ` — żeby nie kolidować z kodem pocztowym `00-001`.
 */

import { buildMiejsceZaladunkuWord } from './wordFileName.js';

export const COMBINE_SEP = '-';
/** Separator adresów / miejsc w protokole łączonym. */
export const COMBINE_ADDR_SEP = '; ';

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

/** Skleja niepuste fragmenty podanym separatorem. */
export function joinParts(parts: string[], sep: string): string {
  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join(sep);
}

/** Skleja niepuste fragmenty separatorem `-` (nazwy, znacznik). */
export function joinWithDash(parts: string[]): string {
  return joinParts(parts, COMBINE_SEP);
}

/** Skleja niepuste fragmenty separatorem `; ` (adresy). */
export function joinWithAddrSep(parts: string[]): string {
  return joinParts(parts, COMBINE_ADDR_SEP);
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
    adres: joinWithAddrSep([a.adres, b.adres]),
    typ: combineZnacznikMiejsca(a.typ, b.typ),
    miejsceZaladunkuWord: joinWithAddrSep([
      buildMiejsceZaladunkuWord(a.nazwaPelna, a.adres),
      buildMiejsceZaladunkuWord(b.nazwaPelna, b.adres),
    ]),
  };
}
