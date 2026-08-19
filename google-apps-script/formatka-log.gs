/**
 * Formatka Druga Mila — Web App dla mapy druga-mila (GitHub Pages).
 * Wdrożenie: Extensions → Apps Script → wklej → Deploy → Web app
 *   Execute as: Me | Who has access: Anyone
 *
 * GET ?action=modalData          → { ok, numer }  (podgląd DM* — NIE rezerwuje)
 * GET ?action=previewNumber      → { ok, numer }  (jak wyżej)
 * GET ?action=previewNumberHarm  → { ok, numer }  (podgląd DMH* — NIE rezerwuje)
 * GET ?action=listPlanowane      → { ok, rows: [...] }
 * GET ?action=listHarmonogram    → { ok, rows: [...] }  (II Adres/Nazwa jeśli w arkuszu)
 * GET ?action=listReferenceData  → { ok, zaladunek, przewoznicy, miejscaDostawy }
 * POST (body JSON, Content-Type: text/plain) — wg body.mode:
 *   (brak)/commit → append miesiąca + Bolęcin (seria DM*)
 *   plan          → append Planowane (bez Bolęcina, czyProtokol=nie)
 *   realize       → miesiąc + Bolęcin + delete z Planowane (ten sam numer)
 *   updatePlan    → nadpis wiersza Planowane
 *   deletePlan    → usunięcie z Planowane
 *   addHarmonogram → append do Harmonogram (szablon stały, bez numeru)
 *   commitHarm    → append miesiąca + Bolęcin (seria DMH*; Harmonogram bez zmian)
 *   addReferenceZaladunek → append do „Miejsca załadunku”
 *   addReferencePrzewoznik → append do „Przewoźnicy”
 *   addReferenceDostawa → append do „Miejsca dostawy”
 *   seedReferenceData → nadpisuje 3 zakładki danymi z Excel (npm run seed:sheets)
 *
 * Zakładki miesięczne: przy pierwszym transporcie miesiąca tworzona jest zakładka
 * „Sierpień 2026” (z dataOdbioru / Data załadunku). Numeracja DM* ciągła — skan zakładek
 * (w tym „Planowane”), z pominięciem numerów DMH*. Seria DMH* osobna (start DMH1).
 *
 * Transport do Bolęcina (Biosystem / Bolęcin w miejscu zrzutu lub adresie dostawy):
 * dodatkowo wiersz do arkusza BOLECIN_SHEETS_ID (węższe kolumny, też zakładki miesięczne).
 * Zapis commit/realize/commitHarm: formatka główna + (jeśli Bolęcin) drugi arkusz.
 *
 * Źródło prawdy numeracji = kolumna „Nr zlecenia” we wszystkich zakładkach formatki głównej.
 * Start DM: DM1 | Start DMH: DMH1. Kolumna uwagi (D w układzie Sierpień) tylko formatka / Planowane — nie Bolęcin.
 *
 * Dokumentacja: docs/FORMATKA_SHEET.md
 */

var COL = {
  numerFaktury: 1,
  stawka: 2,
  czyProtokolZrobiony: 3,
  uwagi: 4,
  numerZlecenia: 5,
  oknoAwizacji: 6,
  adresOdbioru: 7,
  nazwaKontrahenta: 8,
  dataOdbioru: 9,
  ktoOdbiera: 10,
  miejsceZrzutu: 11,
  rodzajZbiorki: 12,
  ileWorkow: 13,
  rodzajTransportu: 14,
  awizacja: 15,
  znacznikMiejsca: 16,
};

/** Kolejność jak zakładka Sierpień 2026 — uwagi PRZED nr zlecenia. */
var HEADER_ROW = [
  'Numer faktury',
  'Stawka',
  'Czy protokół zrobiony',
  'uwagi',
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
var HARMONOGRAM_SHEET_NAME = 'Harmonogram';

/** Słownik referencyjny — trwałe miejsca załadunku / przewoźnicy / dostawa. */
var REF_ZAL_SHEET_NAME = 'Miejsca załadunku';
var REF_PRZ_SHEET_NAME = 'Przewoźnicy';
var REF_DOS_SHEET_NAME = 'Miejsca dostawy';

var OLD_REF_SHEET_NAMES = {
  'Dane ręczne - Załadunek': REF_ZAL_SHEET_NAME,
  'Dane ręczne - Przewoźnicy': REF_PRZ_SHEET_NAME,
  'Dane ręczne - Dostawa': REF_DOS_SHEET_NAME,
};

var REF_ZAL_HEADER = ['Nazwa pełna', 'Nazwa skrócona', 'Adres', 'Typ', 'Rodzaj zbiórki', 'Lat', 'Lon'];
var REF_DOS_HEADER = ['Nazwa pełna', 'Nazwa skrócona', 'Adres', 'Typ'];
var REF_PRZ_HEADER = [
  'Nazwa wyświetlana',
  'Nazwa do protokołu',
  'Adres',
  'NIP',
  'nr BDO',
  'Lat',
  'Lon',
];

/** NIP i nr BDO — format tekstowy (@), inaczej Sheets obcina wiodące zera (000011660 → 11660). */
var REF_PRZ_NIP_COL = 4;
var REF_PRZ_BDO_COL = 5;

function ensureRefPrzTextColumns_(sheet) {
  var maxRows = sheet.getMaxRows();
  sheet.getRange(2, REF_PRZ_NIP_COL, maxRows, 1).setNumberFormat('@');
  sheet.getRange(2, REF_PRZ_BDO_COL, maxRows, 1).setNumberFormat('@');
}

/** NIP jako tekst 10 cyfr — Sheets/Excel obcina wiodące zero (np. 0123456789 → 123456789). */
function normalizeNip_(value) {
  var s = cellStr_(value);
  if (!s) {
    return '';
  }
  s = s.replace(/^\s*nip\s*:?\s*/i, '').replace(/^\s*pl\s*/i, '').replace(/\s/g, '');
  s = s.replace(/\D/g, '');
  if (!s) {
    return '';
  }
  if (s.length < 10) {
    s = ('0000000000' + s).slice(-10);
  }
  return s;
}

function normalizeBdo_(value) {
  var s = cellStr_(value);
  if (!s) {
    return '';
  }
  s = s.replace(/^\s*bdo\s*:?\s*/i, '').replace(/\s/g, '');
  return s;
}

function writeRefPrzIdentifierCells_(sheet, row, nip, bdo) {
  sheet.getRange(row, REF_PRZ_NIP_COL).setValue(String(nip));
  sheet.getRange(row, REF_PRZ_BDO_COL).setValue(String(bdo));
}

/**
 * Kolumny zakładki Harmonogram — szablon stałych odbiorów.
 * Odczyt/zapis mapuje po nagłówkach (kolejność może się różnić na istniejących arkuszach).
 * II* = opcjonalne drugie miejsce → generacja jak protokół łączony (1 wiersz / 2× Word).
 */
var HARM_COL = {
  stawka: 1,
  uwagi: 2,
  adresOdbioru: 3,
  nazwaKontrahenta: 4,
  adresOdbioruIi: 5,
  nazwaKontrahentaIi: 6,
  dzienOdbioru: 7,
  ktoOdbiera: 8,
  miejsceZrzutu: 9,
  rodzajZbiorki: 10,
  ileWorkow: 11,
  rodzajTransportu: 12,
  awizacja: 13,
  znacznikMiejsca: 14,
};

var HARMONOGRAM_HEADER_ROW = [
  'Stawka',
  'uwagi',
  'Adres odbioru',
  'Nazwa kontrahenta / podmiot handlowy',
  'II Adres odbioru',
  'II Nazwa kontrahenta / podmiot handlowy',
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
var START_NUMBER_HARM = 'DMH1';
var HARM_NUMBER_PREFIX = 'DMH';

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
    if (action === 'listReferenceData') {
      return jsonResponse({ ok: true, data: listReferenceData_() });
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
    if (mode === 'addReferenceZaladunek') {
      return handleAddReferenceZaladunekPost_(body);
    }
    if (mode === 'addReferencePrzewoznik') {
      return handleAddReferencePrzewoznikPost_(body);
    }
    if (mode === 'addReferenceDostawa') {
      return handleAddReferenceDostawaPost_(body);
    }
    if (mode === 'seedReferenceData') {
      return handleSeedReferenceDataPost_(body);
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
      : String(sheet.getRange(rowIndex, findNumerZleceniaCol_(sheet)).getValue() || '').trim();
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
  var existingNumer = String(sheet.getRange(rowIndex, findNumerZleceniaCol_(sheet)).getValue() || '').trim();
  var numer =
    body && body.numer != null && String(body.numer).trim() !== ''
      ? String(body.numer).trim()
      : existingNumer;
  if (!numer) {
    throw new Error('updatePlan requires numer');
  }
  var planBody = mergeBody_(body, { czyProtokolZrobiony: 'nie' });
  // getRange(row, column, numRows, numColumns) — 3./4. to liczba wierszy/kolumn, NIE endRow/endCol
  var rowVals = buildFormatkaRowValuesForSheet_(sheet, numer, planBody);
  sheet.getRange(rowIndex, 1, 1, rowVals.length).setValues([rowVals]);
  return jsonResponse({ ok: true, numer: String(numer) });
}

function handleDeletePlanPost_(body) {
  var rowIndex = parsePlanowaneRowIndex_(body);
  var sheet = getOrCreatePlanowaneSheet_();
  if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
    throw new Error('planowaneRow out of range');
  }
  var numer = String(sheet.getRange(rowIndex, findNumerZleceniaCol_(sheet)).getValue() || '').trim();
  sheet.deleteRow(rowIndex);
  syncCounterAfterWrite_(numer);
  return jsonResponse({ ok: true, numer: numer || undefined });
}

function handleAddHarmonogramPost_(body) {
  var sheet = getOrCreateHarmonogramSheet_();
  sheet.appendRow(buildHarmonogramRowValuesForSheet_(sheet, body));
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

function isReferenceSheetName_(name) {
  return (
    name === REF_ZAL_SHEET_NAME ||
    name === REF_PRZ_SHEET_NAME ||
    name === REF_DOS_SHEET_NAME
  );
}

var refSheetsMigrated_ = false;

function ensureReferenceSheetsMigrated_() {
  if (refSheetsMigrated_) {
    return;
  }
  refSheetsMigrated_ = true;
  migrateOldReferenceSheetNames_();
}

function migrateOldReferenceSheetNames_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var oldName in OLD_REF_SHEET_NAMES) {
    if (!Object.prototype.hasOwnProperty.call(OLD_REF_SHEET_NAMES, oldName)) {
      continue;
    }
    var newName = OLD_REF_SHEET_NAMES[oldName];
    var oldSheet = ss.getSheetByName(oldName);
    var newSheet = ss.getSheetByName(newName);
    if (oldSheet && !newSheet) {
      oldSheet.setName(newName);
    }
  }
}

function clearSheetDataRows_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

function replaceRefZalSheet_(entries) {
  var sheet = getOrCreateRefZalSheet_();
  clearSheetDataRows_(sheet);
  if (!entries || !entries.length) {
    return 0;
  }
  var rows = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i] || {};
    var adres = cellStr_(e.adres);
    if (!adres) {
      continue;
    }
    var nazwaPelna = cellStr_(e.nazwaPelna);
    var nazwaSkrocona = cellStr_(e.nazwaSkrocona);
    if (!nazwaPelna && !nazwaSkrocona) {
      continue;
    }
    if (!nazwaPelna) {
      nazwaPelna = nazwaSkrocona;
    }
    if (!nazwaSkrocona) {
      nazwaSkrocona = nazwaPelna;
    }
    var lat = e.lat != null && e.lat !== '' ? parseFloat(e.lat) : '';
    var lon = e.lon != null && e.lon !== '' ? parseFloat(e.lon) : '';
    if (isNaN(lat)) {
      lat = '';
    }
    if (isNaN(lon)) {
      lon = '';
    }
    rows.push([
      nazwaPelna,
      nazwaSkrocona,
      adres,
      cellStr_(e.typ),
      cellStr_(e.rodzajZbiorki),
      lat,
      lon,
    ]);
  }
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, REF_ZAL_HEADER.length).setValues(rows);
  }
  return rows.length;
}

function replaceRefDosSheet_(entries) {
  var sheet = getOrCreateRefDosSheet_();
  clearSheetDataRows_(sheet);
  if (!entries || !entries.length) {
    return 0;
  }
  var rows = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i] || {};
    var adres = cellStr_(e.adres);
    if (!adres) {
      continue;
    }
    var nazwaPelna = cellStr_(e.nazwaPelna);
    var nazwaSkrocona = cellStr_(e.nazwaSkrocona);
    if (!nazwaPelna && !nazwaSkrocona) {
      continue;
    }
    if (!nazwaPelna) {
      nazwaPelna = nazwaSkrocona;
    }
    if (!nazwaSkrocona) {
      nazwaSkrocona = nazwaPelna;
    }
    rows.push([nazwaPelna, nazwaSkrocona, adres, cellStr_(e.typ)]);
  }
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, REF_DOS_HEADER.length).setValues(rows);
  }
  return rows.length;
}

function replaceRefPrzSheet_(entries) {
  var sheet = getOrCreateRefPrzSheet_();
  clearSheetDataRows_(sheet);
  if (!entries || !entries.length) {
    return 0;
  }
  var rows = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i] || {};
    var label = cellStr_(e.nazwaWyswietlana) || cellStr_(e.label);
    if (!label) {
      continue;
    }
    var lat = '';
    var lon = '';
    rows.push([
      label,
      cellStr_(e.nazwaDoProtokolu) || label,
      cellStr_(e.adres),
      normalizeNip_(e.nip),
      normalizeBdo_(e.bdo),
      lat,
      lon,
    ]);
  }
  if (rows.length) {
    ensureRefPrzTextColumns_(sheet);
    sheet.getRange(2, 1, rows.length, REF_PRZ_HEADER.length).setValues(rows);
    for (var j = 0; j < rows.length; j++) {
      writeRefPrzIdentifierCells_(sheet, 2 + j, rows[j][3], rows[j][4]);
    }
  }
  return rows.length;
}

function handleSeedReferenceDataPost_(body) {
  ensureReferenceSheetsMigrated_();
  var zalCount = replaceRefZalSheet_(body && body.zaladunek);
  var przCount = replaceRefPrzSheet_(body && body.przewoznicy);
  var dosCount = replaceRefDosSheet_(body && body.miejscaDostawy);
  return jsonResponse({
    ok: true,
    counts: {
      zaladunek: zalCount,
      przewoznicy: przCount,
      miejscaDostawy: dosCount,
    },
  });
}

function ensureRefZalRodzajColumn_(sheet) {
  if (!sheet) {
    return;
  }
  var h5 = String(sheet.getRange(1, 5).getValue() || '').trim();
  if (h5 === 'Lat') {
    sheet.insertColumnAfter(4);
    sheet.getRange(1, 5).setValue('Rodzaj zbiórki');
  } else if (sheet.getLastColumn() < 5) {
    sheet.getRange(1, 5).setValue('Rodzaj zbiórki');
  }
}

function getOrCreateRefZalSheet_() {
  ensureReferenceSheetsMigrated_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REF_ZAL_SHEET_NAME);
  if (sheet) {
    ensureRefZalRodzajColumn_(sheet);
    return sheet;
  }
  sheet = ss.insertSheet(REF_ZAL_SHEET_NAME);
  sheet.getRange(1, 1, 1, REF_ZAL_HEADER.length).setValues([REF_ZAL_HEADER]);
  return sheet;
}

function getOrCreateRefDosSheet_() {
  ensureReferenceSheetsMigrated_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REF_DOS_SHEET_NAME);
  if (sheet) {
    return sheet;
  }
  sheet = ss.insertSheet(REF_DOS_SHEET_NAME);
  sheet.getRange(1, 1, 1, REF_DOS_HEADER.length).setValues([REF_DOS_HEADER]);
  return sheet;
}

function getOrCreateRefPrzSheet_() {
  ensureReferenceSheetsMigrated_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REF_PRZ_SHEET_NAME);
  if (sheet) {
    ensureRefPrzTextColumns_(sheet);
    return sheet;
  }
  sheet = ss.insertSheet(REF_PRZ_SHEET_NAME);
  sheet.getRange(1, 1, 1, REF_PRZ_HEADER.length).setValues([REF_PRZ_HEADER]);
  ensureRefPrzTextColumns_(sheet);
  return sheet;
}

function getOrCreateRefListSheet_(sheetName, headerRow) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    return sheet;
  }
  sheet = ss.insertSheet(sheetName);
  sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
  return sheet;
}

function refZalKey_(nazwaPelna, adres) {
  return String(adres || '').trim().toLowerCase() + '|' + String(nazwaPelna || '').trim().toLowerCase();
}

function refListKey_(label) {
  return String(label || '').trim().toLowerCase();
}

function listReferenceZaladunek_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REF_ZAL_SHEET_NAME);
  if (!sheet) {
    return [];
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, REF_ZAL_HEADER.length).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var adres = cellStr_(r[2]);
    if (!adres) {
      continue;
    }
    var nazwaPelna = cellStr_(r[0]);
    var nazwaSkrocona = cellStr_(r[1]);
    if (!nazwaPelna && !nazwaSkrocona) {
      continue;
    }
    if (!nazwaPelna) {
      nazwaPelna = nazwaSkrocona;
    }
    if (!nazwaSkrocona) {
      nazwaSkrocona = nazwaPelna;
    }
    var latRaw = r[5];
    var lonRaw = r[6];
    var lat = latRaw != null && latRaw !== '' ? parseFloat(latRaw) : null;
    var lon = lonRaw != null && lonRaw !== '' ? parseFloat(lonRaw) : null;
    out.push({
      nazwaPelna: nazwaPelna,
      nazwaSkrocona: nazwaSkrocona,
      adres: adres,
      typ: cellStr_(r[3]),
      rodzajZbiorki: cellStr_(r[4]),
      lat: isNaN(lat) ? null : lat,
      lon: isNaN(lon) ? null : lon,
    });
  }
  return out;
}

function refPrzKey_(label) {
  return String(label || '').trim().toLowerCase();
}

function refDosKey_(nazwaPelna, adres) {
  return refZalKey_(nazwaPelna, adres);
}

function listReferencePrzewoznicy_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REF_PRZ_SHEET_NAME);
  if (!sheet) {
    return [];
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  var numDataRows = lastRow - 1;
  var lastCol = Math.max(sheet.getLastColumn(), REF_PRZ_HEADER.length);
  var values = sheet.getRange(2, 1, numDataRows, lastCol).getValues();
  var display = sheet.getRange(2, 1, numDataRows, lastCol).getDisplayValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var d = display[i];
    var label = cellStr_(r[0]);
    if (!label) {
      continue;
    }
    out.push({
      nazwaWyswietlana: label,
      nazwaDoProtokolu: cellStr_(r[1]) || label,
      adres: cellStr_(r[2]),
      nip: normalizeNip_(d[3] !== '' && d[3] != null ? d[3] : r[3]),
      bdo: normalizeBdo_(d[4] !== '' && d[4] != null ? d[4] : r[4]),
      lat: null,
      lon: null,
    });
  }
  return out;
}

function listReferenceDostawa_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REF_DOS_SHEET_NAME);
  if (!sheet) {
    return [];
  }
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, REF_DOS_HEADER.length).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var adres = cellStr_(r[2]);
    if (!adres) {
      continue;
    }
    var nazwaPelna = cellStr_(r[0]);
    var nazwaSkrocona = cellStr_(r[1]);
    if (!nazwaPelna && !nazwaSkrocona) {
      continue;
    }
    if (!nazwaPelna) {
      nazwaPelna = nazwaSkrocona;
    }
    if (!nazwaSkrocona) {
      nazwaSkrocona = nazwaPelna;
    }
    out.push({
      nazwaPelna: nazwaPelna,
      nazwaSkrocona: nazwaSkrocona,
      adres: adres,
      typ: cellStr_(r[3]),
    });
  }
  return out;
}

function listReferenceData_() {
  ensureReferenceSheetsMigrated_();
  return {
    zaladunek: listReferenceZaladunek_(),
    przewoznicy: listReferencePrzewoznicy_(),
    miejscaDostawy: listReferenceDostawa_(),
  };
}

function refPrzExists_(sheet, label) {
  var key = refPrzKey_(label);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (refPrzKey_(cellStr_(values[i][0])) === key) {
      return true;
    }
  }
  return false;
}

function refDosExists_(sheet, nazwaPelna, adres) {
  var key = refDosKey_(nazwaPelna, adres);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, 3).getValues();
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    if (refDosKey_(cellStr_(r[0]), cellStr_(r[2])) === key) {
      return true;
    }
  }
  return false;
}

function handleAddReferencePrzewoznikPost_(body) {
  var label = cellStr_(body && body.nazwaWyswietlana) || cellStr_(body && body.label);
  var nazwaDoProtokolu = cellStr_(body && body.nazwaDoProtokolu) || label;
  var adres = cellStr_(body && body.adres);
  var nip = normalizeNip_(body && body.nip);
  var bdo = normalizeBdo_(body && body.bdo);
  if (!label) {
    throw new Error('nazwaWyswietlana required');
  }
  var sheet = getOrCreateRefPrzSheet_();
  if (refPrzExists_(sheet, label)) {
    return jsonResponse({ ok: false, error: 'duplicate' });
  }
  ensureRefPrzTextColumns_(sheet);
  var newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1, 1, REF_PRZ_HEADER.length).setValues([
    [label, nazwaDoProtokolu, adres, nip, bdo, '', ''],
  ]);
  writeRefPrzIdentifierCells_(sheet, newRow, nip, bdo);
  return jsonResponse({
    ok: true,
    entry: {
      nazwaWyswietlana: label,
      nazwaDoProtokolu: nazwaDoProtokolu,
      adres: adres,
      nip: nip,
      bdo: bdo,
      lat: null,
      lon: null,
    },
  });
}

function handleAddReferenceDostawaPost_(body) {
  var nazwaPelna = cellStr_(body && body.nazwaPelna);
  var nazwaSkrocona = cellStr_(body && body.nazwaSkrocona);
  var adres = cellStr_(body && body.adres);
  var typ = cellStr_(body && body.typ);
  if (!adres) {
    throw new Error('adres required');
  }
  if (!nazwaPelna && !nazwaSkrocona) {
    throw new Error('nazwa required');
  }
  if (!nazwaPelna) {
    nazwaPelna = nazwaSkrocona;
  }
  if (!nazwaSkrocona) {
    nazwaSkrocona = nazwaPelna;
  }
  var sheet = getOrCreateRefDosSheet_();
  if (refDosExists_(sheet, nazwaPelna, adres)) {
    return jsonResponse({ ok: false, error: 'duplicate' });
  }
  sheet.appendRow([nazwaPelna, nazwaSkrocona, adres, typ]);
  return jsonResponse({
    ok: true,
    entry: {
      nazwaPelna: nazwaPelna,
      nazwaSkrocona: nazwaSkrocona,
      adres: adres,
      typ: typ,
    },
  });
}

function refZalExists_(sheet, nazwaPelna, adres) {
  var key = refZalKey_(nazwaPelna, adres);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, 3).getValues();
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    if (refZalKey_(cellStr_(r[0]), cellStr_(r[2])) === key) {
      return true;
    }
  }
  return false;
}

function refListExists_(sheet, label) {
  return refPrzExists_(sheet, label);
}

function handleAddReferenceZaladunekPost_(body) {
  var nazwaPelna = cellStr_(body && body.nazwaPelna);
  var nazwaSkrocona = cellStr_(body && body.nazwaSkrocona);
  var adres = cellStr_(body && body.adres);
  var typ = cellStr_(body && body.typ);
  var rodzajZbiorki = cellStr_(body && body.rodzajZbiorki);
  if (!adres) {
    throw new Error('adres required');
  }
  if (!nazwaPelna && !nazwaSkrocona) {
    throw new Error('nazwa required');
  }
  if (!nazwaPelna) {
    nazwaPelna = nazwaSkrocona;
  }
  if (!nazwaSkrocona) {
    nazwaSkrocona = nazwaPelna;
  }
  var sheet = getOrCreateRefZalSheet_();
  if (refZalExists_(sheet, nazwaPelna, adres)) {
    return jsonResponse({ ok: false, error: 'duplicate' });
  }
  var lat = body && body.lat != null && body.lat !== '' ? parseFloat(body.lat) : '';
  var lon = body && body.lon != null && body.lon !== '' ? parseFloat(body.lon) : '';
  if (isNaN(lat)) {
    lat = '';
  }
  if (isNaN(lon)) {
    lon = '';
  }
  sheet.appendRow([nazwaPelna, nazwaSkrocona, adres, typ, rodzajZbiorki, lat, lon]);
  return jsonResponse({
    ok: true,
    entry: {
      nazwaPelna: nazwaPelna,
      nazwaSkrocona: nazwaSkrocona,
      adres: adres,
      typ: typ,
      rodzajZbiorki: rodzajZbiorki,
      lat: lat === '' ? null : lat,
      lon: lon === '' ? null : lon,
    },
  });
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
 * Podgląd DM*: skan zakładek z pominięciem DMH* → max + 1. NIE zapisuje property.
 */
function getPreviewNumber_() {
  var last = scanMaxNumberFromAllSheets_();
  if (last == null) {
    return START_NUMBER;
  }
  var next = incrementAlphanumeric_(last);
  return next != null ? next : START_NUMBER;
}

/** Podgląd DMH*: tylko seria DMH. NIE rezerwuje. */
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
function partsFromDayMonthYear_(dayRaw, monthRaw, yearRaw) {
  var day = parseInt(dayRaw, 10);
  var month = parseInt(monthRaw, 10);
  var year = parseInt(yearRaw, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { day: day, month: month, year: year };
}

/** `dd.mm.rrrr` albo zakres `dd.mm/dd.mm.rrrr` (miesiąc zakładki z Od). */
function parseDataOdbioru_(value) {
  var s = String(value || '').trim();
  var range = s.match(/^(\d{1,2})\.(\d{1,2})\/(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (range) {
    return partsFromDayMonthYear_(range[1], range[2], range[5]);
  }
  var m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) {
    return null;
  }
  return partsFromDayMonthYear_(m[1], m[2], m[3]);
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
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, lastCol).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var obj = { rowIndex: i + 2 };
    for (var c = 0; c < headers.length; c++) {
      var key = fieldKeyFromHeader_(headers[c]);
      if (!key) {
        continue;
      }
      var val = cellStr_(r[c]);
      if (key === 'numer') {
        obj.numer = val;
      } else {
        obj[key] = val;
      }
    }
    rows.push(obj);
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
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var numDataRows = lastRow - 1;
  var values = sheet.getRange(2, 1, numDataRows, lastCol).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var obj = { rowIndex: i + 2 };
    for (var c = 0; c < headers.length; c++) {
      var key = fieldKeyFromHeader_(headers[c]);
      if (!key || key === 'numer') {
        continue;
      }
      obj[key] = cellStr_(r[c]);
    }
    if (!obj.nazwaKontrahenta && !obj.adresOdbioru) {
      continue;
    }
    rows.push(obj);
  }
  return rows;
}

/** Kanoniczna kolejność nagłówków Harmonogram (z kolumnami II). */
function buildHarmonogramRowValues_(body) {
  return [
    body.stawka != null ? String(body.stawka) : '',
    body.uwagi != null ? String(body.uwagi) : '',
    body.adresOdbioru != null ? String(body.adresOdbioru) : '',
    body.nazwaKontrahenta != null ? String(body.nazwaKontrahenta) : '',
    body.adresOdbioruIi != null ? String(body.adresOdbioruIi) : '',
    body.nazwaKontrahentaIi != null ? String(body.nazwaKontrahentaIi) : '',
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

/** Buduje wiersz Harmonogramu wg rzeczywistych nagłówków zakładki. */
function buildHarmonogramRowValuesForSheet_(sheet, body) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    return buildHarmonogramRowValues_(body);
  }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var hasRecognized = false;
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = fieldKeyFromHeader_(headers[i]);
    if (key) {
      hasRecognized = true;
    }
    if (key && body[key] != null) {
      row.push(String(body[key]));
    } else {
      row.push('');
    }
  }
  if (!hasRecognized) {
    return buildHarmonogramRowValues_(body);
  }
  return row;
}

/**
 * Kanoniczna kolejność (Sierpień 2026): uwagi w kolumnie D, nr zlecenia w E.
 * Starsze zakładki (Lipiec / Planowane) mogą mieć inny układ — użyj buildFormatkaRowValuesForSheet_.
 */
function buildFormatkaRowValues_(numer, body) {
  return [
    body.numerFaktury != null ? String(body.numerFaktury) : '',
    body.stawka != null ? String(body.stawka) : '',
    body.czyProtokolZrobiony != null ? String(body.czyProtokolZrobiony) : 'tak',
    body.uwagi != null ? String(body.uwagi) : '',
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

function normalizeHeaderKey_(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Mapuje nagłówek kolumny → klucz body / 'numer'. */
function fieldKeyFromHeader_(h) {
  var n = normalizeHeaderKey_(h);
  if (!n) {
    return '';
  }
  if (n.indexOf('numer faktury') >= 0) {
    return 'numerFaktury';
  }
  if (n === 'stawka') {
    return 'stawka';
  }
  if (n.indexOf('protok') >= 0) {
    return 'czyProtokolZrobiony';
  }
  if (n === 'uwagi' || n.indexOf('uwagi') === 0) {
    return 'uwagi';
  }
  if (n.indexOf('nr zlecenia') >= 0 || n.indexOf('zlecenia transport') >= 0) {
    return 'numer';
  }
  if (n.indexOf('okno') >= 0) {
    return 'oknoAwizacji';
  }
  // II* przed zwykłym Adres/Nazwa — inaczej „II Adres odbioru” mapuje się na I.
  if (n.indexOf('ii ') === 0) {
    if (n.indexOf('adres') >= 0) {
      return 'adresOdbioruIi';
    }
    if (n.indexOf('nazwa') >= 0 || n.indexOf('podmiot') >= 0) {
      return 'nazwaKontrahentaIi';
    }
  }
  if (n.indexOf('adres odbioru') >= 0) {
    return 'adresOdbioru';
  }
  if (n.indexOf('nazwa kontrahenta') >= 0 || n.indexOf('podmiot handlowy') >= 0) {
    return 'nazwaKontrahenta';
  }
  if (n.indexOf('dzie') >= 0 && n.indexOf('odbior') >= 0) {
    return 'dzienOdbioru';
  }
  if (n.indexOf('data odbioru') >= 0) {
    return 'dataOdbioru';
  }
  if (n.indexOf('kto odbiera') >= 0) {
    return 'ktoOdbiera';
  }
  if (n.indexOf('miejsce zrzutu') >= 0) {
    return 'miejsceZrzutu';
  }
  if (n.indexOf('rodzaj zbi') >= 0) {
    return 'rodzajZbiorki';
  }
  if (n.indexOf('ile work') >= 0) {
    return 'ileWorkow';
  }
  if (n.indexOf('traport') >= 0 || n.indexOf('transport') >= 0) {
    return 'rodzajTransportu';
  }
  if (n === 'awizacja') {
    return 'awizacja';
  }
  if (n.indexOf('znacznik') >= 0) {
    return 'znacznikMiejsca';
  }
  return '';
}

/**
 * Buduje wiersz wg rzeczywistych nagłówków zakładki (Sierpień: uwagi@D;
 * Lipiec/Planowane: numer@D, Uwagi na końcu lub brak).
 */
function buildFormatkaRowValuesForSheet_(sheet, numer, body) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    return buildFormatkaRowValues_(numer, body);
  }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var hasRecognized = false;
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = fieldKeyFromHeader_(headers[i]);
    if (key) {
      hasRecognized = true;
    }
    if (key === 'numer') {
      row.push(numer);
    } else if (key === 'czyProtokolZrobiony') {
      row.push(
        body.czyProtokolZrobiony != null ? String(body.czyProtokolZrobiony) : 'tak',
      );
    } else if (key && body[key] != null) {
      row.push(String(body[key]));
    } else {
      row.push('');
    }
  }
  if (!hasRecognized) {
    return buildFormatkaRowValues_(numer, body);
  }
  return row;
}

function findNumerZleceniaCol_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    return COL.numerZlecenia;
  }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (fieldKeyFromHeader_(headers[i]) === 'numer') {
      return i + 1;
    }
  }
  return COL.numerZlecenia;
}

function appendFormatkaRow_(numer, body) {
  var sheet = getOrCreateMonthSheet_(body);
  sheet.appendRow(buildFormatkaRowValuesForSheet_(sheet, numer, body));
}

function appendPlanowaneRow_(numer, body) {
  var sheet = getOrCreatePlanowaneSheet_();
  sheet.appendRow(buildFormatkaRowValuesForSheet_(sheet, numer, body));
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
 * z pominięciem numerów serii DMH* (osobna pula). Remis → późniejszy wiersz.
 * Mieszane prefiksy poza DMH OK (ABC100 wygrywa z DM5).
 */
function scanMaxNumberFromAllSheets_() {
  return scanMaxNumberFiltered_(function(s) {
    return !isHarmNumber_(s);
  });
}

/** Skan tylko numerów z dokładnym prefiksem (np. DMH). */
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
    if (name === HARMONOGRAM_SHEET_NAME || isReferenceSheetName_(name)) {
      continue;
    }
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      continue;
    }
    var numDataRows = lastRow - 1;
    var numerCol = findNumerZleceniaCol_(sheet);
    var values = sheet.getRange(2, numerCol, numDataRows, 1).getValues();
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
