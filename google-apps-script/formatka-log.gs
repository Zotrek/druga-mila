/**
 * Formatka Druga Mila — Web App dla mapy druga-mila (GitHub Pages).
 * Wdrożenie: Extensions → Apps Script → wklej → Deploy → Web app
 *   Execute as: Me | Who has access: Anyone
 *
 * GET ?action=modalData          → { ok, numer }  (podgląd DM* — NIE rezerwuje)
 * GET ?action=previewNumber      → { ok, numer }  (jak wyżej)
 * GET ?action=previewNumberHarm  → { ok, numer }  (podgląd GMH* — NIE rezerwuje)
 * GET ?action=listPlanowane      → { ok, rows: [...] }
 * GET ?action=listHarmonogram    → { ok, rows: [...] }
 * POST (body JSON, Content-Type: text/plain) — wg body.mode:
 *   (brak)/commit → append miesiąca + Bolęcin (seria DM*)
 *   plan          → append Planowane (bez Bolęcina, czyProtokol=nie)
 *   realize       → miesiąc + Bolęcin + delete z Planowane (ten sam numer)
 *   updatePlan    → nadpis wiersza Planowane
 *   deletePlan    → usunięcie z Planowane
 *   addHarmonogram → append do Harmonogram (szablon stały, bez numeru)
 *   commitHarm    → append miesiąca + Bolęcin (seria GMH*; Harmonogram bez zmian)
 *
 * Zakładki miesięczne: przy pierwszym transporcie miesiąca tworzona jest zakładka
 * „Sierpień 2026” (z dataOdbioru / Data załadunku). Numeracja DM* ciągła — skan zakładek
 * (w tym „Planowane”), z pominięciem numerów GMH*. Seria GMH* osobna (start GMH1).
 *
 * Transport do Bolęcina (Biosystem / Bolęcin w miejscu zrzutu lub adresie dostawy):
 * dodatkowo wiersz do arkusza BOLECIN_SHEETS_ID (węższe kolumny, też zakładki miesięczne).
 * Zapis commit/realize/commitHarm: formatka główna + (jeśli Bolęcin) drugi arkusz.
 *
 * Źródło prawdy numeracji = kolumna „Nr zlecenia” we wszystkich zakładkach formatki głównej.
 * Start DM: DM1 | Start GMH: GMH1. Kolumna Uwagi (16) tylko formatka / Planowane — nie Bolęcin.
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
  uwagi: 16,
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
  'Uwagi',
];

var PLANOWANE_SHEET_NAME = 'Planowane';
var HARMONOGRAM_SHEET_NAME = 'Harmonogram';

/** Kolumny zakładki Harmonogram (A–L) — szablon stałych odbiorów. */
var HARM_COL = {
  stawka: 1,
  uwagi: 2,
  adresOdbioru: 3,
  nazwaKontrahenta: 4,
  dzienOdbioru: 5,
  ktoOdbiera: 6,
  miejsceZrzutu: 7,
  rodzajZbiorki: 8,
  ileWorkow: 9,
  rodzajTransportu: 10,
  awizacja: 11,
  znacznikMiejsca: 12,
};

var HARMONOGRAM_HEADER_ROW = [
  'Stawka',
  'uwagi',
  'Adres odbioru',
  'Nazwa kontrahenta / podmiot handlowy',
  'Dzień odbioru',
  'Kto odbiera',
  'Miejsce zrzutu',
  'Rodzaj zbiórki',
  'Ile worków',
  'rodzaj traportu',
  'awizacja',
  'znacznik miejsca',
];

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
var START_NUMBER_HARM = 'GMH1';
var HARM_NUMBER_PREFIX = 'GMH';

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    if (action === 'modalData' || action === 'previewNumber') {
      return jsonResponse({ ok: true, numer: String(getPreviewNumber_()) });
    }
    if (action === 'previewNumberHarm') {
      return jsonResponse({ ok: true, numer: String(getPreviewNumberHarm_()) });
    }
    if (action === 'listPlanowane') {
      return jsonResponse({ ok: true, rows: listPlanowaneRows_() });
    }
    if (action === 'listHarmonogram') {
      return jsonResponse({ ok: true, rows: listHarmonogramRows_() });
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
    if (mode === 'addHarmonogram') {
      return handleAddHarmonogramPost_(body);
    }
    if (mode === 'commitHarm') {
      return handleCommitHarmPost_(body);
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

function handleAddHarmonogramPost_(body) {
  var sheet = getOrCreateHarmonogramSheet_();
  sheet.appendRow(buildHarmonogramRowValues_(body));
  return jsonResponse({ ok: true });
}

function handleCommitHarmPost_(body) {
  var numer = resolveHarmNumber_(body);
  var commitBody = mergeBody_(body, { czyProtokolZrobiony: 'tak', numer: numer });
  appendFormatkaRow_(numer, commitBody);
  if (isBolecinDestination_(commitBody)) {
    appendBolecinRow_(commitBody);
  }
  syncCounterAfterWrite_(numer);
  return jsonResponse({ ok: true, numer: String(numer) });
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
 * Podgląd DM*: skan zakładek z pominięciem GMH* → max + 1. NIE zapisuje property.
 */
function getPreviewNumber_() {
  var last = scanMaxNumberFromAllSheets_();
  if (last == null) {
    return START_NUMBER;
  }
  var next = incrementAlphanumeric_(last);
  return next != null ? next : START_NUMBER;
}

/** Podgląd GMH*: tylko seria GMH. NIE rezerwuje. */
function getPreviewNumberHarm_() {
  var last = scanMaxNumberWithPrefix_(HARM_NUMBER_PREFIX);
  if (last == null) {
    return START_NUMBER_HARM;
  }
  var next = incrementAlphanumeric_(last);
  return next != null ? next : START_NUMBER_HARM;
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

function resolveHarmNumber_(body) {
  var manual = body && body.numer != null ? String(body.numer).trim() : '';
  if (manual !== '') {
    return manual;
  }
  return getPreviewNumberHarm_();
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

function getOrCreateHarmonogramSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HARMONOGRAM_SHEET_NAME);
  if (sheet) {
    return sheet;
  }
  sheet = ss.insertSheet(HARMONOGRAM_SHEET_NAME);
  sheet.getRange(1, 1, 1, HARMONOGRAM_HEADER_ROW.length).setValues([HARMONOGRAM_HEADER_ROW]);
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
      uwagi: cellStr_(r[COL.uwagi - 1]),
    });
  }
  return rows;
}

function listHarmonogramRows_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HARMONOGRAM_SHEET_NAME);
  if (!sheet) {
    return [];
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, HARMONOGRAM_HEADER_ROW.length).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var nazwa = cellStr_(r[HARM_COL.nazwaKontrahenta - 1]);
    var adres = cellStr_(r[HARM_COL.adresOdbioru - 1]);
    if (!nazwa && !adres) {
      continue;
    }
    rows.push({
      rowIndex: i + 2,
      stawka: cellStr_(r[HARM_COL.stawka - 1]),
      uwagi: cellStr_(r[HARM_COL.uwagi - 1]),
      adresOdbioru: adres,
      nazwaKontrahenta: nazwa,
      dzienOdbioru: cellStr_(r[HARM_COL.dzienOdbioru - 1]),
      ktoOdbiera: cellStr_(r[HARM_COL.ktoOdbiera - 1]),
      miejsceZrzutu: cellStr_(r[HARM_COL.miejsceZrzutu - 1]),
      rodzajZbiorki: cellStr_(r[HARM_COL.rodzajZbiorki - 1]),
      ileWorkow: cellStr_(r[HARM_COL.ileWorkow - 1]),
      rodzajTransportu: cellStr_(r[HARM_COL.rodzajTransportu - 1]),
      awizacja: cellStr_(r[HARM_COL.awizacja - 1]),
      znacznikMiejsca: cellStr_(r[HARM_COL.znacznikMiejsca - 1]),
    });
  }
  return rows;
}

function buildHarmonogramRowValues_(body) {
  return [
    body.stawka != null ? String(body.stawka) : '',
    body.uwagi != null ? String(body.uwagi) : '',
    body.adresOdbioru != null ? String(body.adresOdbioru) : '',
    body.nazwaKontrahenta != null ? String(body.nazwaKontrahenta) : '',
    body.dzienOdbioru != null ? String(body.dzienOdbioru) : '',
    body.ktoOdbiera != null ? String(body.ktoOdbiera) : '',
    body.miejsceZrzutu != null ? String(body.miejsceZrzutu) : '',
    body.rodzajZbiorki != null ? String(body.rodzajZbiorki) : '',
    body.ileWorkow != null ? String(body.ileWorkow) : '',
    body.rodzajTransportu != null ? String(body.rodzajTransportu) : '',
    body.awizacja != null ? String(body.awizacja) : '',
    body.znacznikMiejsca != null ? String(body.znacznikMiejsca) : '',
  ];
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
    body.uwagi != null ? String(body.uwagi) : '',
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
 * Skan kolumny Nr zlecenia na zakładkach formatki: największa liczba końcowa,
 * z pominięciem numerów serii GMH* (osobna pula). Remis → późniejszy wiersz.
 * Mieszane prefiksy poza GMH OK (ABC100 wygrywa z DM5).
 */
function scanMaxNumberFromAllSheets_() {
  return scanMaxNumberFiltered_(function(s) {
    return !isHarmNumber_(s);
  });
}

/** Skan tylko numerów z dokładnym prefiksem (np. GMH). */
function scanMaxNumberWithPrefix_(prefix) {
  return scanMaxNumberFiltered_(function(s) {
    var m = String(s || '').trim().match(/^(.*?)(\d+)$/);
    return m != null && m[1] === prefix;
  });
}

function isHarmNumber_(s) {
  var m = String(s || '').trim().match(/^(.*?)(\d+)$/);
  return m != null && m[1] === HARM_NUMBER_PREFIX;
}

function scanMaxNumberFiltered_(acceptFn) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var best = null;
  var bestNum = -1;
  var bestSheetIndex = -1;
  var bestRow = -1;
  for (var si = 0; si < sheets.length; si++) {
    var sheet = sheets[si];
    var name = sheet.getName();
    if (name === HARMONOGRAM_SHEET_NAME) {
      continue;
    }
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
      if (!acceptFn(s)) {
        continue;
      }
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
