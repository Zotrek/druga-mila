/**
 * Formatka Druga Mila — Web App dla mapy druga-mila (GitHub Pages).
 * Wdrożenie: Extensions → Apps Script → wklej → Deploy → Web app
 *   Execute as: Me | Who has access: Anyone
 *
 * GET ?action=modalData     → { ok, numer }  (podgląd — NIE rezerwuje numeru)
 * GET ?action=previewNumber → { ok, numer }  (jak wyżej)
 * POST (body JSON, Content-Type: text/plain) — append wiersza + numer dopiero po zapisie
 *
 * Źródło prawdy numeracji = kolumna „Nr zlecenia” w arkuszu (nie „palenie” przy podglądzie).
 * Usunięcie wierszy → następny numer cofa się automatycznie (skan przy preview/POST).
 * Start (pusty arkusz): DM1
 *
 * Dokumentacja: docs/FORMATKA_SHEET.md
 */

var COL = {
  numerFaktury: 1,
  stawka: 2,
  czyProtokolZrobiony: 3,
  numerZlecenia: 4,
  adresOdbioru: 5,
  nazwaKontrahenta: 6,
  dataOdbioru: 7,
  ktoOdbiera: 8,
  miejsceZrzutu: 9,
  rodzajZbiorki: 10,
  ileWorkow: 11,
  rodzajTransportu: 12,
  awizacja: 13,
  znacznikMiejsca: 14,
};

/** Cache pomocniczy — synchronizowany po udanym zapisie; preview liczy ze skanu arkusza. */
var FORMATKA_LAST_NUMBER_KEY = 'formatkaLastNumber';
var START_NUMBER = 'DM1';

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    if (action === 'modalData' || action === 'previewNumber') {
      return jsonResponse({ ok: true, numer: String(getPreviewNumber_()) });
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
    var numer = resolveFormatkaNumber_(body);
    appendFormatkaRow_(numer, body);
    syncCounterAfterWrite_(numer);
    return jsonResponse({ ok: true, numer: String(numer) });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  } finally {
    lock.releaseLock();
  }
}

/** Opcjonalnie: Run po dużej ręcznej edycji — i tak preview/POST skanują arkusz. */
function rebuildFormatkaCounterFromSheet() {
  var result = scanMaxNumberFromSheet_();
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

function getDataSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
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
 * Podgląd: skan arkusza → max + 1. NIE zapisuje property (numer nie jest „palony”).
 * Po usunięciu wierszy następny numer wraca (np. było DM1..DM5, skasowano DM5 → preview DM5).
 */
function getPreviewNumber_() {
  var last = scanMaxNumberFromSheet_();
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

/** Po udanym append — zsynchronizuj cache z max w arkuszu (lub zapisanym numerem). */
function syncCounterAfterWrite_(numer) {
  var fromSheet = scanMaxNumberFromSheet_();
  if (fromSheet != null) {
    setStoredLastNumber_(fromSheet);
    return;
  }
  if (numer && String(numer).trim() !== '') {
    setStoredLastNumber_(String(numer).trim());
  }
}

function appendFormatkaRow_(numer, body) {
  var sheet = getDataSheet_();
  var row = [
    body.numerFaktury != null ? String(body.numerFaktury) : '',
    body.stawka != null ? String(body.stawka) : '',
    body.czyProtokolZrobiony != null ? String(body.czyProtokolZrobiony) : 'tak',
    numer,
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
  sheet.appendRow(row);
}

/**
 * Skan kolumny Nr zlecenia (D): największa liczba końcowa;
 * przy remisie — późniejszy wiersz. Mieszane prefiksy OK (ABC100 wygrywa z DM5).
 */
function scanMaxNumberFromSheet_() {
  var sheet = getDataSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }
  var values = sheet.getRange(2, COL.numerZlecenia, lastRow, COL.numerZlecenia).getValues();
  var best = null;
  var bestNum = -1;
  var bestRow = -1;
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
    if (n > bestNum || (n === bestNum && rowIndex > bestRow)) {
      bestNum = n;
      best = s;
      bestRow = rowIndex;
    }
  }
  return best;
}
