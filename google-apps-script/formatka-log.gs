/**
 * Formatka Druga Mila — Web App dla mapy druga-mila (GitHub Pages).
 * Wdrożenie: Extensions → Apps Script → wklej → Deploy → Web app
 *   Execute as: Me | Who has access: Anyone
 *
 * GET ?action=modalData     → { ok, numer }  (podgląd — NIE rezerwuje numeru)
 * GET ?action=previewNumber → { ok, numer }  (jak wyżej)
 * GET ?action=listPlanowane → { ok, rows: [...] }
 * POST (body JSON, Content-Type: text/plain) — wg body.mode:
 *   (brak)/commit → append miesiąca + Bolęcin
 *   plan          → append Planowane (bez Bolęcina, czyProtokol=nie)
 *   realize       → miesiąc + Bolęcin + delete z Planowane (ten sam numer)
 *   updatePlan    → nadpis wiersza Planowane
 *   deletePlan    → usunięcie z Planowane
 *
 * Zakładki miesięczne: przy pierwszym transporcie miesiąca tworzona jest zakładka
 * „Sierpień 2026” (z dataOdbioru / Data załadunku). Numeracja ciągła — skan WSZYSTKICH zakładek
 * (w tym „Planowane”).
 *
 * Transport do Bolęcina (Biosystem / Bolęcin w miejscu zrzutu lub adresie dostawy):
 * dodatkowo wiersz do arkusza BOLECIN_SHEETS_ID (węższe kolumny, też zakładki miesięczne).
 * Zapis commit/realize: formatka główna + (jeśli Bolęcin) drugi arkusz. Plan: tylko Planowane.
 *
 * Źródło prawdy numeracji = kolumna „Nr zlecenia” we wszystkich zakładkach formatki głównej.
 * Start (pusty arkusz): DM1
 *
 * Dokumentacja: docs/FORMATKA_SHEET.md
 */

var COL = {
  numerFaktury: 1,
  stawka: 2,
  czyProtokolZrobiony: 3,
  numerZlecenia: 4,
  oknoAwizacji: 5,
  adresOdbioru: 6,
  nazwaKontrahenta: 7,
  dataOdbioru: 8,
  ktoOdbiera: 9,
  miejsceZrzutu: 10,
  rodzajZbiorki: 11,
  ileWorkow: 12,
  rodzajTransportu: 13,
  awizacja: 14,
  znacznikMiejsca: 15,
};

var HEADER_ROW = [
  'Numer faktury',
  'Stawka',
  'Czy protokół zrobiony',
  'Nr zlecenia transportowego',
  'OKNO AWIZACJI',
  'Adres odbioru',
  'Nazwa kontrahenta / podmiot handlowy',
  'Data odbioru',
  'Kto odbiera',
  'Miejsce zrzutu',
  'Rodzaj zbiórki',
  'Ile worków',
  'rodzaj traportu',
  'awizacja',
  'znacznik miejsca',
];

var PLANOWANE_SHEET_NAME = 'Planowane';

/** Arkusz dodatkowy — tylko transporty do Bolęcina / Biosystem. */
var BOLECIN_SHEETS_ID = '14NhJtyAwwM0OVEbzP6gN7DYyA1kJZfzyVEA1N5EL3sc';

var BOLECIN_HEADER_ROW = [
  'Okno awizacji',
  'Adres odbioru',
  'Nazwa kontrahenta / podmiot handlowy',
  'Data odbioru',
  'Kto odbiera',
  'Miejsce zrzutu',
  'Rodzaj zbiórki',
  'Ile worków',
  'rodzaj traportu',
  'awizacja',
];

var MONTH_NAMES_PL = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

/** Cache pomocniczy — synchronizowany po udanym zapisie; preview liczy ze skanu arkusza. */
var FORMATKA_LAST_NUMBER_KEY = 'formatkaLastNumber';
var START_NUMBER = 'DM1';

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    if (action === 'modalData' || action === 'previewNumber') {
      return jsonResponse({ ok: true, numer: String(getPreviewNumber_()) });
    }
    if (action === 'listPlanowane') {
      return jsonResponse({ ok: true, rows: listPlanowaneRows_() });
    }
    return jsonResponse({ ok: false, error: 'unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}';
    var body = JSON.parse(raw);
    var mode = body && body.mode != null ? String(body.mode).trim() : '';
    if (mode === '' || mode === 'commit') {
      return handleCommitPost_(body);
    }
    if (mode === 'plan') {
      return handlePlanPost_(body);
    }
    if (mode === 'realize') {
      return handleRealizePost_(body);
    }
    if (mode === 'updatePlan') {
      return handleUpdatePlanPost_(body);
    }
    if (mode === 'deletePlan') {
      return handleDeletePlanPost_(body);
    }
    return jsonResponse({ ok: false, error: 'unknown mode: ' + mode }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  } finally {
    lock.releaseLock();
  }
}

function handleCommitPost_(body) {
  var numer = resolveFormatkaNumber_(body);
  appendFormatkaRow_(numer, body);
  if (isBolecinDestination_(body)) {
    appendBolecinRow_(body);
  }
  syncCounterAfterWrite_(numer);
  return jsonResponse({ ok: true, numer: String(numer) });
}

function mergeBody_(body, overrides) {
  var out = {};
  var src = body || {};
  for (var k in src) {
    if (Object.prototype.hasOwnProperty.call(src, k)) {
      out[k] = src[k];
    }
  }
  var ov = overrides || {};
  for (var ok in ov) {
    if (Object.prototype.hasOwnProperty.call(ov, ok)) {
      out[ok] = ov[ok];
    }
  }
  return out;
}

function handlePlanPost_(body) {
  var numer = resolveFormatkaNumber_(body);
  var planBody = mergeBody_(body, { czyProtokolZrobiony: 'nie' });
  appendPlanowaneRow_(numer, planBody);
  syncCounterAfterWrite_(numer);
  return jsonResponse({ ok: true, numer: String(numer) });
}

function handleRealizePost_(body) {
  var rowIndex = parsePlanowaneRowIndex_(body);
  var sheet = getOrCreatePlanowaneSheet_();
  if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
    throw new Error('planowaneRow out of range');
  }
  var numer =
    body && body.numer != null && String(body.numer).trim() !== ''
      ? String(body.numer).trim()
      : String(sheet.getRange(rowIndex, COL.numerZlecenia).getValue() || '').trim();
  if (!numer) {
    throw new Error('realize requires numer');
  }
  var commitBody = mergeBody_(body, { czyProtokolZrobiony: 'tak', numer: numer });
  appendFormatkaRow_(numer, commitBody);
  if (isBolecinDestination_(commitBody)) {
    appendBolecinRow_(commitBody);
  }
  sheet.deleteRow(rowIndex);
  syncCounterAfterWrite_(numer);
  return jsonResponse({ ok: true, numer: String(numer) });
}

function handleUpdatePlanPost_(body) {
  var rowIndex = parsePlanowaneRowIndex_(body);
  var sheet = getOrCreatePlanowaneSheet_();
  if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
    throw new Error('planowaneRow out of range');
  }
  var existingNumer = String(sheet.getRange(rowIndex, COL.numerZlecenia).getValue() || '').trim();
  var numer =
    body && body.numer != null && String(body.numer).trim() !== ''
      ? String(body.numer).trim()
      : existingNumer;
  if (!numer) {
    throw new Error('updatePlan requires numer');
  }
  var planBody = mergeBody_(body, { czyProtokolZrobiony: 'nie' });
  // getRange(row, column, numRows, numColumns) — 3./4. to liczba wierszy/kolumn, NIE endRow/endCol
  sheet.getRange(rowIndex, 1, 1, HEADER_ROW.length).setValues([buildFormatkaRowValues_(numer, planBody)]);
  return jsonResponse({ ok: true, numer: String(numer) });
}

function handleDeletePlanPost_(body) {
  var rowIndex = parsePlanowaneRowIndex_(body);
  var sheet = getOrCreatePlanowaneSheet_();
  if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
    throw new Error('planowaneRow out of range');
  }
  var numer = String(sheet.getRange(rowIndex, COL.numerZlecenia).getValue() || '').trim();
  sheet.deleteRow(rowIndex);
  syncCounterAfterWrite_(numer);
  return jsonResponse({ ok: true, numer: numer || undefined });
}

function parsePlanowaneRowIndex_(body) {
  var raw = body && body.planowaneRow != null ? body.planowaneRow : body && body.rowIndex;
  var n = parseInt(raw, 10);
  if (isNaN(n)) {
    throw new Error('planowaneRow required');
  }
  return n;
}

/** Opcjonalnie: Run po dużej ręcznej edycji — i tak preview/POST skanują arkusz. */
function rebuildFormatkaCounterFromSheet() {
  var result = scanMaxNumberFromAllSheets_();
  if (result == null) {
    PropertiesService.getScriptProperties().deleteProperty(FORMATKA_LAST_NUMBER_KEY);
  } else {
    setStoredLastNumber_(result);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function setStoredLastNumber_(value) {
  PropertiesService.getScriptProperties().setProperty(FORMATKA_LAST_NUMBER_KEY, String(value));
}

/**
 * Inkrement: "DM1" → "DM2", "asd123" → "asd124", "9" → "10", "ABC100" → "ABC101".
 * Pusty / brak match → null (caller używa START_NUMBER).
 */
function incrementAlphanumeric_(value) {
  var s = String(value || '').trim();
  if (!s) {
    return null;
  }
  var m = s.match(/^(.*?)(\d+)$/);
  if (!m) {
    return null;
  }
  var prefix = m[1];
  var numStr = m[2];
  var next = String(parseInt(numStr, 10) + 1);
  return prefix + next;
}

/**
 * Podgląd: skan WSZYSTKICH zakładek → max + 1. NIE zapisuje property (numer nie jest „palony”).
 * Po usunięciu wierszy następny numer wraca (np. było DM1..DM5, skasowano DM5 → preview DM5).
 */
function getPreviewNumber_() {
  var last = scanMaxNumberFromAllSheets_();
  if (last == null) {
    return START_NUMBER;
  }
  var next = incrementAlphanumeric_(last);
  return next != null ? next : START_NUMBER;
}

/**
 * Mapa zawsze bierze auto-numer (ignoruje body.numer jeśli pusty).
 * Niepuste body.numer = awaryjny nadpis ręczny (API); i tak numer „żyje” dopiero po append.
 */
function resolveFormatkaNumber_(body) {
  var manual = body && body.numer != null ? String(body.numer).trim() : '';
  if (manual !== '') {
    return manual;
  }
  return getPreviewNumber_();
}

/** Po udanym append — zsynchronizuj cache z max we wszystkich zakładkach (lub zapisanym numerem). */
function syncCounterAfterWrite_(numer) {
  var fromSheet = scanMaxNumberFromAllSheets_();
  if (fromSheet != null) {
    setStoredLastNumber_(fromSheet);
    return;
  }
  if (numer && String(numer).trim() !== '') {
    setStoredLastNumber_(String(numer).trim());
  }
}

/** Parsuje dd.mm.rrrr → { day, month, year } lub null. */
function parseDataOdbioru_(value) {
  var s = String(value || '').trim();
  var m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) {
    return null;
  }
  var day = parseInt(m[1], 10);
  var month = parseInt(m[2], 10);
  var year = parseInt(m[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { day: day, month: month, year: year };
}

/** Dziś w timezone skryptu (fallback gdy brak dataOdbioru). */
function todayParts_() {
  var now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

/** „Sierpień 2026” z dataOdbioru; puste/złe → dziś. */
function monthSheetNameFromBody_(body) {
  var raw = body && body.dataOdbioru != null ? String(body.dataOdbioru) : '';
  var parsed = parseDataOdbioru_(raw);
  var d = parsed != null ? parsed : todayParts_();
  return MONTH_NAMES_PL[d.month - 1] + ' ' + d.year;
}

function normalizeBolecinText_(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .trim();
}

/**
 * Cel = Bolęcin gdy etykieta/adres zawiera „bolęcin” lub „biosystem”
 * (Biosystem = pozycja listy dostawy z adresem w Bolęcinie).
 */
function isBolecinDestination_(body) {
  var label = body && body.miejsceZrzutu != null ? String(body.miejsceZrzutu) : '';
  var adres =
    body && body.miejsceDostawyAdres != null ? String(body.miejsceDostawyAdres) : '';
  var combined = normalizeBolecinText_(label + ' ' + adres);
  if (!combined) {
    return false;
  }
  return combined.indexOf('bolecin') >= 0 || combined.indexOf('biosystem') >= 0;
}

/**
 * Zakładka miesiąca w podanym arkuszu: create + nagłówki jeśli brak.
 */
function getOrCreateMonthSheetInSs_(ss, body, headerRow) {
  var name = monthSheetNameFromBody_(body);
  var sheet = ss.getSheetByName(name);
  if (sheet) {
    return sheet;
  }
  sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
  return sheet;
}

/**
 * Zakładka miesiąca formatki głównej (aktywny spreadsheet Web App).
 */
function getOrCreateMonthSheet_(body) {
  return getOrCreateMonthSheetInSs_(
    SpreadsheetApp.getActiveSpreadsheet(),
    body,
    HEADER_ROW,
  );
}

function getOrCreatePlanowaneSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PLANOWANE_SHEET_NAME);
  if (sheet) {
    return sheet;
  }
  sheet = ss.insertSheet(PLANOWANE_SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
  return sheet;
}

function cellStr_(value) {
  if (value == null || value === '') {
    return '';
  }
  if (Object.prototype.toString.call(value) === '[object Date]') {
    var d = value;
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    return dd + '.' + mm + '.' + yyyy;
  }
  return String(value).trim();
}

function listPlanowaneRows_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PLANOWANE_SHEET_NAME);
  if (!sheet) {
    return [];
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, HEADER_ROW.length).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    rows.push({
      rowIndex: i + 2,
      numerFaktury: cellStr_(r[COL.numerFaktury - 1]),
      stawka: cellStr_(r[COL.stawka - 1]),
      czyProtokolZrobiony: cellStr_(r[COL.czyProtokolZrobiony - 1]),
      numer: cellStr_(r[COL.numerZlecenia - 1]),
      oknoAwizacji: cellStr_(r[COL.oknoAwizacji - 1]),
      adresOdbioru: cellStr_(r[COL.adresOdbioru - 1]),
      nazwaKontrahenta: cellStr_(r[COL.nazwaKontrahenta - 1]),
      dataOdbioru: cellStr_(r[COL.dataOdbioru - 1]),
      ktoOdbiera: cellStr_(r[COL.ktoOdbiera - 1]),
      miejsceZrzutu: cellStr_(r[COL.miejsceZrzutu - 1]),
      rodzajZbiorki: cellStr_(r[COL.rodzajZbiorki - 1]),
      ileWorkow: cellStr_(r[COL.ileWorkow - 1]),
      rodzajTransportu: cellStr_(r[COL.rodzajTransportu - 1]),
      awizacja: cellStr_(r[COL.awizacja - 1]),
      znacznikMiejsca: cellStr_(r[COL.znacznikMiejsca - 1]),
    });
  }
  return rows;
}

function buildFormatkaRowValues_(numer, body) {
  return [
    body.numerFaktury != null ? String(body.numerFaktury) : '',
    body.stawka != null ? String(body.stawka) : '',
    body.czyProtokolZrobiony != null ? String(body.czyProtokolZrobiony) : 'tak',
    numer,
    body.oknoAwizacji != null ? String(body.oknoAwizacji) : '',
    body.adresOdbioru != null ? String(body.adresOdbioru) : '',
    body.nazwaKontrahenta != null ? String(body.nazwaKontrahenta) : '',
    body.dataOdbioru != null ? String(body.dataOdbioru) : '',
    body.ktoOdbiera != null ? String(body.ktoOdbiera) : '',
    body.miejsceZrzutu != null ? String(body.miejsceZrzutu) : '',
    body.rodzajZbiorki != null ? String(body.rodzajZbiorki) : '',
    body.ileWorkow != null ? String(body.ileWorkow) : '',
    body.rodzajTransportu != null ? String(body.rodzajTransportu) : '',
    body.awizacja != null ? String(body.awizacja) : '',
    body.znacznikMiejsca != null ? String(body.znacznikMiejsca) : '',
  ];
}

function appendFormatkaRow_(numer, body) {
  var sheet = getOrCreateMonthSheet_(body);
  sheet.appendRow(buildFormatkaRowValues_(numer, body));
}

function appendPlanowaneRow_(numer, body) {
  var sheet = getOrCreatePlanowaneSheet_();
  sheet.appendRow(buildFormatkaRowValues_(numer, body));
}

/** Węższy wiersz do arkusza Bolęcin (bez numeracji / stawki / znacznika). */
function appendBolecinRow_(body) {
  var ss = SpreadsheetApp.openById(BOLECIN_SHEETS_ID);
  var sheet = getOrCreateMonthSheetInSs_(ss, body, BOLECIN_HEADER_ROW);
  var row = [
    body.oknoAwizacji != null ? String(body.oknoAwizacji) : '',
    body.adresOdbioru != null ? String(body.adresOdbioru) : '',
    body.nazwaKontrahenta != null ? String(body.nazwaKontrahenta) : '',
    body.dataOdbioru != null ? String(body.dataOdbioru) : '',
    body.ktoOdbiera != null ? String(body.ktoOdbiera) : '',
    body.miejsceZrzutu != null ? String(body.miejsceZrzutu) : '',
    body.rodzajZbiorki != null ? String(body.rodzajZbiorki) : '',
    body.ileWorkow != null ? String(body.ileWorkow) : '',
    body.rodzajTransportu != null ? String(body.rodzajTransportu) : '',
    body.awizacja != null ? String(body.awizacja) : '',
  ];
  sheet.appendRow(row);
}

/**
 * Skan kolumny Nr zlecenia (D) na WSZYSTKICH zakładkach formatki głównej: największa liczba końcowa;
 * przy remisie — późniejszy wiersz (kolejność: indeks zakładki, potem wiersz).
 * Mieszane prefiksy OK (ABC100 wygrywa z DM5).
 */
function scanMaxNumberFromAllSheets_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var best = null;
  var bestNum = -1;
  var bestSheetIndex = -1;
  var bestRow = -1;
  for (var si = 0; si < sheets.length; si++) {
    var sheet = sheets[si];
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      continue;
    }
    var numDataRows = lastRow - 1;
    var values = sheet.getRange(2, COL.numerZlecenia, numDataRows, 1).getValues();
    for (var i = 0; i < values.length; i++) {
      var raw = values[i][0];
      if (raw == null || raw === '') {
        continue;
      }
      var s = String(raw).trim();
      var m = s.match(/^(.*?)(\d+)$/);
      if (!m) {
        continue;
      }
      var n = parseInt(m[2], 10);
      var rowIndex = i + 2;
      var better =
        n > bestNum ||
        (n === bestNum && si > bestSheetIndex) ||
        (n === bestNum && si === bestSheetIndex && rowIndex > bestRow);
      if (better) {
        bestNum = n;
        best = s;
        bestSheetIndex = si;
        bestRow = rowIndex;
      }
    }
  }
  return best;
}
