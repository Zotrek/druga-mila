/**
 * Nazwa pliku .docx (SPEC / SZABLON_WORD_tagi).
 * `{nazwa_skrócona} {dd.mm.rr} {fragment_adresu}.docx`
 */

export function sanitizeFileNamePart(text: string): string {
  return text
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Data z modala (`dd.mm.rrrr` lub `yyyy-mm-dd`) → segment `dd.mm.rr` albo pusty.
 */
export function formatDateForFileName(dataZaladunku: string): string {
  const s = dataZaladunku.trim();
  if (!s) {
    return '';
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return `${iso[3]}.${iso[2]}.${iso[1]!.slice(2)}`;
  }
  const dotted = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotted) {
    return `${dotted[1]}.${dotted[2]}.${dotted[3]!.slice(2)}`;
  }
  const dottedShort = s.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (dottedShort) {
    return s;
  }
  return sanitizeFileNamePart(s);
}

/** Data do Word / Sheets: `dd.mm.rrrr`. */
export function formatDateForDoc(dataZaladunku: string): string {
  const s = dataZaladunku.trim();
  if (!s) {
    return '';
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return `${iso[3]}.${iso[2]}.${iso[1]}`;
  }
  return s;
}

export function buildDocxDownloadName(
  nazwaSkrocona: string,
  dataZaladunku: string,
  adres: string,
  maxBaseLen = 80,
): string {
  const name = sanitizeFileNamePart(nazwaSkrocona) || 'protokol';
  const datePart = formatDateForFileName(dataZaladunku);
  const addr = sanitizeFileNamePart(adres);
  let base = [name, datePart, addr].filter((x) => x.length > 0).join(' ');
  if (base.length > maxBaseLen) {
    base = `${base.slice(0, maxBaseLen - 3).trim()}...`;
  }
  return `${base}.docx`;
}

/** Miejsce załadunku do Word: pełna nazwa + adres. */
export function buildMiejsceZaladunkuWord(nazwaPelna: string, adres: string): string {
  return [nazwaPelna.trim(), adres.trim()].filter(Boolean).join(' ');
}
