/**
 * Normalizacja i match wyszukiwarki mapy (port z arkusz-mapa/phase6).
 */

export function normalizeForAddressSearch(text: string): string {
  let s = text.normalize('NFD').replace(/\p{M}/gu, '');
  s = s
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'l')
    .replace(/ą/g, 'a')
    .replace(/Ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/Ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/Ę/g, 'e')
    .replace(/ń/g, 'n')
    .replace(/Ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/Ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/Ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/Ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/Ż/g, 'z');
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Match po nazwie pełnej, skróconej i adresie.
 * Pusty query = wszystkie punkty.
 */
export function mapPointMatchesSearch(
  nazwaPelna: string,
  nazwaSkrocona: string,
  adres: string,
  query: string,
): boolean {
  const q = normalizeForAddressSearch(query);
  if (!q) {
    return true;
  }
  if (normalizeForAddressSearch(adres).includes(q)) {
    return true;
  }
  if (normalizeForAddressSearch(nazwaPelna).includes(q)) {
    return true;
  }
  if (normalizeForAddressSearch(nazwaSkrocona).includes(q)) {
    return true;
  }
  return false;
}

export type ColorFilterMode = 'wszystkie' | 'cd' | 'plac' | 'puste' | 'bolecin';

export function mapPointMatchesColorFilter(
  colorKind: string,
  mode: ColorFilterMode,
): boolean {
  return mode === 'wszystkie' || colorKind === mode;
}
