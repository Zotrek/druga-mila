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
