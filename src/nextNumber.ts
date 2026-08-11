/**
 * Inkrement numeracji alfanumerycznej (lustro Apps Script).
 * Pusty → null (caller używa START_NUMBER = DM1).
 */

export function incrementAlphanumeric(value: string): string | null {
  const s = value.trim();
  if (!s) {
    return null;
  }
  const m = s.match(/^(.*?)(\d+)$/);
  if (!m) {
    return null;
  }
  const prefix = m[1]!;
  const numStr = m[2]!;
  const next = String(Number(numStr) + 1);
  return `${prefix}${next}`;
}

export interface ParsedNumber {
  prefix: string;
  num: number;
  raw: string;
}

export function parseAlphanumeric(value: string): ParsedNumber | null {
  const s = value.trim();
  if (!s) {
    return null;
  }
  const m = s.match(/^(.*?)(\d+)$/);
  if (!m) {
    return null;
  }
  return { prefix: m[1]!, num: Number(m[2]), raw: s };
}

/** Max po liczbie końcowej; remis → późniejszy wiersz (ostatni w tablicy). */
export function maxAlphanumeric(values: string[]): string | null {
  let best: ParsedNumber | null = null;
  for (const v of values) {
    const parsed = parseAlphanumeric(v);
    if (!parsed) {
      continue;
    }
    if (!best || parsed.num > best.num || (parsed.num === best.num && true)) {
      best = parsed;
    }
  }
  return best?.raw ?? null;
}

export function nextNumberFromSheet(values: string[], startNumber: string): string {
  const max = maxAlphanumeric(values);
  if (!max) {
    return startNumber;
  }
  return incrementAlphanumeric(max) ?? startNumber;
}

/** True gdy numer ma dokładny prefiks (np. GMH1 → GMH). */
export function hasExactPrefix(value: string, prefix: string): boolean {
  const parsed = parseAlphanumeric(value);
  return parsed != null && parsed.prefix === prefix;
}

/** Max po końcówce, tylko wartości z dokładnym prefiksem (seria GMH). */
export function maxAlphanumericWithPrefix(values: string[], prefix: string): string | null {
  return maxAlphanumeric(values.filter((v) => hasExactPrefix(v, prefix)));
}

/** Max po końcówce, pomijając wartości z wykluczonym prefiksem (DM skan bez GMH). */
export function maxAlphanumericExcludingPrefix(values: string[], excludePrefix: string): string | null {
  return maxAlphanumeric(values.filter((v) => !hasExactPrefix(v, excludePrefix)));
}

export function nextNumberWithPrefix(
  values: string[],
  prefix: string,
  startNumber: string,
): string {
  const max = maxAlphanumericWithPrefix(values, prefix);
  if (!max) {
    return startNumber;
  }
  return incrementAlphanumeric(max) ?? startNumber;
}

export function nextNumberExcludingPrefix(
  values: string[],
  excludePrefix: string,
  startNumber: string,
): string {
  const max = maxAlphanumericExcludingPrefix(values, excludePrefix);
  if (!max) {
    return startNumber;
  }
  return incrementAlphanumeric(max) ?? startNumber;
}
