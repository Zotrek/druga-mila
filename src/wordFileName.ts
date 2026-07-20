/**
 * Nazwa pliku .docx + format daty jak arkusz-mapa (dd.mm.rrrr / dd.mm.rr).
 * `{nazwa_skrócona} {dd.mm.rr} {fragment_adresu}.docx`
 */

export function sanitizeFileNamePart(text: string): string {
  return text
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface FormattedLoadDates {
  /** Do Word i Google: `dd.mm.rrrr` (jak arkusz-mapa `dz`) */
  doc: string;
  /** Do nazwy pliku: `dd.mm.rr` (jak arkusz-mapa `dzPlik`) */
  file: string;
}

/**
 * Konwertuje wartość z <input type="date"> (`yyyy-mm-dd`) lub już `dd.mm.rrrr`
 * na formaty jak w mapie plomb.
 */
export function formatLoadDates(dataZaladunku: string): FormattedLoadDates {
  const s = dataZaladunku.trim();
  if (!s) {
    return { doc: '', file: '' };
  }

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const yyyy = iso[1]!;
    const mm = iso[2]!;
    const dd = iso[3]!;
    const y = Number(yyyy);
    const mo = Number(mm) - 1;
    const d = Number(dd);
    const chk = new Date(y, mo, d);
    if (chk.getFullYear() !== y || chk.getMonth() !== mo || chk.getDate() !== d) {
      return { doc: s, file: sanitizeFileNamePart(s) };
    }
    return {
      doc: `${dd}.${mm}.${yyyy}`,
      file: `${dd}.${mm}.${yyyy.slice(-2)}`,
    };
  }

  const dotted = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted) {
    const dd = dotted[1]!.padStart(2, '0');
    const mm = dotted[2]!.padStart(2, '0');
    const yyyy = dotted[3]!;
    return {
      doc: `${dd}.${mm}.${yyyy}`,
      file: `${dd}.${mm}.${yyyy.slice(-2)}`,
    };
  }

  const short = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (short) {
    const dd = short[1]!.padStart(2, '0');
    const mm = short[2]!.padStart(2, '0');
    const rr = short[3]!;
    return {
      doc: `${dd}.${mm}.20${rr}`,
      file: `${dd}.${mm}.${rr}`,
    };
  }

  return { doc: s, file: sanitizeFileNamePart(s) };
}

/** Data do Word / Sheets: `dd.mm.rrrr`. */
export function formatDateForDoc(dataZaladunku: string): string {
  return formatLoadDates(dataZaladunku).doc;
}

/** Segment nazwy pliku: `dd.mm.rr`. */
export function formatDateForFileName(dataZaladunku: string): string {
  return formatLoadDates(dataZaladunku).file;
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
