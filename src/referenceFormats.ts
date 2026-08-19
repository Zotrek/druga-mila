/**
 * Formatowanie wpisów referencyjnych (przewoźnik, miejsce dostawy) do protokołu Word.
 */

export interface PrzewoznikRecord {
  /** Etykieta comboboxa. */
  nazwaWyswietlana: string;
  nazwaDoProtokolu: string;
  adres: string;
  nip: string;
  bdo: string;
  lat?: number | null;
  lon?: number | null;
}

export interface DeliveryPlaceRecord {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  typ: string;
}

export interface ComboboxOption {
  label: string;
  value: string;
}

function clean(s: string): string {
  return String(s ?? '').trim();
}

/** Skleja pola przewoźnika do tagu {{przewoznik}} w Word. */
export function formatPrzewoznikForWord(r: PrzewoznikRecord): string {
  const parts: string[] = [];
  const nazwa = clean(r.nazwaDoProtokolu);
  const adres = clean(r.adres);
  const nip = clean(r.nip);
  const bdo = clean(r.bdo);

  if (nazwa) {
    parts.push(nazwa);
  }
  if (adres) {
    parts.push(adres);
  }
  if (bdo) {
    parts.push(/^bdo\b/i.test(bdo) ? bdo : `BDO ${bdo}`);
  }
  if (nip) {
    parts.push(/^nip\b/i.test(nip) ? nip : `NIP ${nip}`);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/** Skleja pola miejsca dostawy do tagu {{miejsce_dostawy}} w Word. */
export function formatMiejsceDostawyForWord(r: DeliveryPlaceRecord): string {
  const nazwa = clean(r.nazwaPelna) || clean(r.nazwaSkrocona);
  const adres = clean(r.adres);
  return [nazwa, adres].filter(Boolean).join(' ');
}

export function przewoznikToComboboxOption(r: PrzewoznikRecord): ComboboxOption {
  const label = clean(r.nazwaWyswietlana) || clean(r.nazwaDoProtokolu);
  return {
    label,
    value: formatPrzewoznikForWord({ ...r, nazwaWyswietlana: label }),
  };
}

export function deliveryToComboboxOption(r: DeliveryPlaceRecord): ComboboxOption {
  const label = clean(r.nazwaSkrocona) || clean(r.nazwaPelna);
  return {
    label,
    value: formatMiejsceDostawyForWord(r),
  };
}

/** Etykieta comboboxa miejsca dostawy. */
export function deliveryComboboxLabel(r: DeliveryPlaceRecord): string {
  return clean(r.nazwaSkrocona) || clean(r.nazwaPelna);
}

/** Klucz deduplikacji przewoźnika. */
export function przewoznikKey(r: Pick<PrzewoznikRecord, 'nazwaWyswietlana'>): string {
  return clean(r.nazwaWyswietlana).toLowerCase();
}

/** Klucz deduplikacji miejsca dostawy (adres + nazwa pełna). */
export function deliveryPlaceKey(r: Pick<DeliveryPlaceRecord, 'adres' | 'nazwaPelna'>): string {
  return `${clean(r.adres).toLowerCase()}|${clean(r.nazwaPelna).toLowerCase()}`;
}

/**
 * Parsuje legacy kolumnę „Dane” z podwyko lista.xlsx do pól strukturalnych.
 * Heurystyka: wyciąga NIP/BDO regexem; reszta → nazwa + adres (split przy „ ul.”).
 */
export function parseLegacyPodwykoValue(
  nazwaWyswietlana: string,
  legacyValue: string,
): PrzewoznikRecord {
  let rest = clean(legacyValue);
  let nip = '';
  let bdo = '';

  const bdoMatch = rest.match(/\bBDO\s*(\d[\d\s]*)/i);
  if (bdoMatch) {
    bdo = bdoMatch[1]!.replace(/\s/g, '');
    rest = rest.replace(bdoMatch[0], ' ').trim();
  }
  const nipMatch = rest.match(/\bNIP\s*([\d\s]{9,14})/i);
  if (nipMatch) {
    nip = nipMatch[1]!.replace(/\s/g, '');
    rest = rest.replace(nipMatch[0], ' ').trim();
  }

  rest = rest.replace(/\s+/g, ' ').trim();
  const ulMatch = rest.match(/\s(ul\.?\s.+)$/i);
  if (ulMatch && ulMatch.index != null && ulMatch.index > 0) {
    return {
      nazwaWyswietlana: clean(nazwaWyswietlana),
      nazwaDoProtokolu: rest.slice(0, ulMatch.index).trim(),
      adres: ulMatch[1]!.trim(),
      nip,
      bdo,
    };
  }

  return {
    nazwaWyswietlana: clean(nazwaWyswietlana),
    nazwaDoProtokolu: rest || clean(nazwaWyswietlana),
    adres: '',
    nip,
    bdo,
  };
}

/** JS wstrzykiwany do index.html — te same reguły co w Node. */
export function referenceFormatsBrowserScript(): string {
  return `
    function formatPrzewoznikForWordJs(r) {
      var parts = [];
      var nazwa = String(r.nazwaDoProtokolu || '').trim();
      var adres = String(r.adres || '').trim();
      var nip = String(r.nip || '').trim();
      var bdo = String(r.bdo || '').trim();
      if (nazwa) parts.push(nazwa);
      if (adres) parts.push(adres);
      if (bdo) parts.push(/^bdo\\b/i.test(bdo) ? bdo : ('BDO ' + bdo));
      if (nip) parts.push(/^nip\\b/i.test(nip) ? nip : ('NIP ' + nip));
      return parts.join(' ').replace(/\\s+/g, ' ').trim();
    }
    function formatMiejsceDostawyForWordJs(r) {
      var nazwa = String(r.nazwaPelna || r.nazwaSkrocona || '').trim();
      var adres = String(r.adres || '').trim();
      return [nazwa, adres].filter(Boolean).join(' ');
    }
    function przewoznikToComboboxJs(r) {
      var label = String(r.nazwaWyswietlana || r.nazwaDoProtokolu || '').trim();
      return { label: label, value: formatPrzewoznikForWordJs(r) };
    }
    function deliveryToComboboxJs(r) {
      var label = String(r.nazwaSkrocona || r.nazwaPelna || '').trim();
      return { label: label, value: formatMiejsceDostawyForWordJs(r) };
    }
    function przewoznikKeyJs(r) {
      return String(r.nazwaWyswietlana || '').trim().toLowerCase();
    }
    function deliveryPlaceKeyJs(r) {
      return String(r.adres || '').trim().toLowerCase() + '|' + String(r.nazwaPelna || '').trim().toLowerCase();
    }
`;
}
