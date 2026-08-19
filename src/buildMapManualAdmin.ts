/**
 * Panel ręcznego dodawania miejsc załadunku, przewoźników i miejsc dostawy.
 * Trwały zapis: Google Sheets przez Apps Script (jak transporty).
 */

import type { ManualOverlay } from './readManualOverlay.js';

export function manualAdminCss(): string {
  return `
    .map-manual-add-btn { width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #6f42c1; background: #6f42c1; color: #fff; cursor: pointer; margin-top: 6px; }
    .map-manual-add-btn:hover { filter: brightness(1.05); }
    .manual-admin-tabs { display: flex; gap: 4px; margin-bottom: 12px; flex-wrap: wrap; }
    .manual-admin-tabs button { flex: 1; min-width: 0; padding: 8px 6px; font-size: 12px; border: 1px solid #ccc; background: #f8f8f8; border-radius: 6px; cursor: pointer; }
    .manual-admin-tabs button.active { background: #0d6efd; color: #fff; border-color: #0d6efd; }
    .manual-admin-panel { display: none; }
    .manual-admin-panel.active { display: block; }
    .manual-admin-panel label { display: block; font-size: 12px; font-weight: 600; margin: 8px 0 4px; color: #333; }
    .manual-admin-panel input, .manual-admin-panel select, .manual-admin-panel textarea { width: 100%; padding: 8px 10px; font-size: 13px; border: 1px solid #ccc; border-radius: 6px; }
    .manual-admin-panel textarea { min-height: 72px; resize: vertical; }
    .manual-admin-hint { font-size: 11px; color: #666; margin: 4px 0 0; line-height: 1.4; }
    .manual-admin-status { font-size: 12px; margin: 10px 0 0; min-height: 1.2em; color: #0d6efd; }
    .manual-admin-status.is-error { color: #b02a37; }
    .manual-admin-status.is-warn { color: #664d03; }
    .manual-admin-warn { margin-top: 10px; padding: 8px 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; font-size: 12px; color: #664d03; line-height: 1.4; }
    .manual-admin-coords-row { display: flex; gap: 8px; margin-top: 8px; }
    .manual-admin-coords-row > div { flex: 1; min-width: 0; }
    .manual-admin-link-btn { background: none; border: none; padding: 0; font-size: 11px; color: #0d6efd; cursor: pointer; text-decoration: underline; }
    .manual-admin-secondary-btn { width: 100%; margin-top: 8px; padding: 8px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #ccc; background: #f8f8f8; cursor: pointer; }
    .manual-admin-panel button.primary.is-busy { opacity: 0.75; cursor: wait; }
  `;
}

export function manualAdminHtml(): string {
  return `  <div id="manual-admin-modal" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="manual-admin-title">
      <h3 id="manual-admin-title">Dodaj dane ręcznie</h3>
      <p class="manual-admin-hint">Wpisy zapisują się na stałe w arkuszu Google — zakładki „Miejsca załadunku”, „Przewoźnicy”, „Miejsca dostawy”.</p>
      <div class="manual-admin-tabs" role="tablist">
        <button type="button" id="manual-admin-tab-zal" class="active" data-tab="zal">Miejsce załadunku</button>
        <button type="button" id="manual-admin-tab-prz" data-tab="prz">Przewoźnik</button>
        <button type="button" id="manual-admin-tab-dos" data-tab="dos">Miejsce dostawy</button>
      </div>
      <div id="manual-admin-panel-zal" class="manual-admin-panel active">
        <label for="manual-admin-zal-pelna">Nazwa pełna</label>
        <input type="text" id="manual-admin-zal-pelna" autocomplete="off" />
        <label for="manual-admin-zal-skrocona">Nazwa skrócona</label>
        <input type="text" id="manual-admin-zal-skrocona" autocomplete="off" />
        <label for="manual-admin-zal-adres">Adres</label>
        <input type="text" id="manual-admin-zal-adres" autocomplete="off" placeholder="np. 32-540 Bolęcin Fabryczna 5" />
        <label for="manual-admin-zal-typ">Typ pinezki</label>
        <select id="manual-admin-zal-typ">
          <option value="">Puste</option>
          <option value="CD">CD</option>
          <option value="PLAC">PLAC</option>
        </select>
        <label for="manual-admin-zal-zbiorka">Rodzaj zbiórki</label>
        <select id="manual-admin-zal-zbiorka">
          <option value="">—</option>
          <option value="manualna">manualna</option>
          <option value="automatyczna">automatyczna</option>
          <option value="manualna i automatyczna">manualna i automatyczna</option>
        </select>
        <p class="manual-admin-hint">Pinezka pojawi się na mapie po geokodowaniu adresu lub po podaniu współrzędnych ręcznie.</p>
        <p class="manual-admin-hint">
          <button type="button" id="manual-admin-zal-toggle-coords" class="manual-admin-link-btn">Współrzędne ręczne (opcjonalnie)</button>
        </p>
        <div id="manual-admin-zal-coords-wrap" hidden>
          <div class="manual-admin-coords-row">
            <div>
              <label for="manual-admin-zal-lat">Lat (szer.)</label>
              <input type="text" id="manual-admin-zal-lat" inputmode="decimal" autocomplete="off" placeholder="np. 50.061947" />
            </div>
            <div>
              <label for="manual-admin-zal-lon">Lon (dł.)</label>
              <input type="text" id="manual-admin-zal-lon" inputmode="decimal" autocomplete="off" placeholder="np. 19.936856" />
            </div>
          </div>
          <p class="manual-admin-hint">Format dziesiętny (jak w Google Maps). Gdy podane — pomija geokodowanie.</p>
        </div>
        <div id="manual-admin-zal-geocode-fail" class="manual-admin-warn" hidden role="alert">
          Geokodowanie nie powiodło się. Sprawdź adres albo podaj współrzędne ręcznie powyżej i kliknij „Zapisz” ponownie.
        </div>
        <button type="button" id="manual-admin-zal-submit" class="primary" style="width:100%;margin-top:10px">Zapisz miejsce załadunku</button>
        <button type="button" id="manual-admin-zal-submit-no-pin" class="manual-admin-secondary-btn" hidden>Zapisz bez pinezki (tylko lista)</button>
      </div>
      <div id="manual-admin-panel-prz" class="manual-admin-panel">
        <label for="manual-admin-prz-wysw">Nazwa wyświetlana (combobox)</label>
        <input type="text" id="manual-admin-prz-wysw" autocomplete="off" placeholder="np. BLUECARGO" />
        <label for="manual-admin-prz-protokol">Nazwa do protokołu</label>
        <input type="text" id="manual-admin-prz-protokol" autocomplete="off" placeholder="np. BLUECARGO Sp. z o.o." />
        <label for="manual-admin-prz-adres">Adres</label>
        <input type="text" id="manual-admin-prz-adres" autocomplete="off" placeholder="np. Rajska 3, 54-028 Wrocław" />
        <label for="manual-admin-prz-nip">NIP</label>
        <input type="text" id="manual-admin-prz-nip" autocomplete="off" />
        <label for="manual-admin-prz-bdo">nr BDO</label>
        <input type="text" id="manual-admin-prz-bdo" autocomplete="off" />
        <p class="manual-admin-hint">Adres jest geokodowany (Lat/Lon) przy zapisie.</p>
        <button type="button" id="manual-admin-prz-submit" class="primary" style="width:100%;margin-top:10px">Zapisz przewoźnika</button>
      </div>
      <div id="manual-admin-panel-dos" class="manual-admin-panel">
        <label for="manual-admin-dos-pelna">Nazwa pełna</label>
        <input type="text" id="manual-admin-dos-pelna" autocomplete="off" />
        <label for="manual-admin-dos-skrocona">Nazwa skrócona</label>
        <input type="text" id="manual-admin-dos-skrocona" autocomplete="off" />
        <label for="manual-admin-dos-adres">Adres</label>
        <input type="text" id="manual-admin-dos-adres" autocomplete="off" placeholder="np. 32-540 Bolęcin Fabryczna 5" />
        <label for="manual-admin-dos-typ">Typ</label>
        <input type="text" id="manual-admin-dos-typ" autocomplete="off" placeholder="np. BOLĘCIN, SORTOWNIA…" />
        <button type="button" id="manual-admin-dos-submit" class="primary" style="width:100%;margin-top:10px">Zapisz miejsce dostawy</button>
      </div>
      <p id="manual-admin-status" class="manual-admin-status" aria-live="polite"></p>
      <div class="doc-modal-actions">
        <button type="button" id="manual-admin-close">Zamknij</button>
      </div>
    </div>
  </div>
`;
}

/** Skrypt panelu admin — zapis/odczyt przez Apps Script Web App. */
export function manualAdminBrowserScript(): string {
  return `
    function classifyColorKindAdmin(nazwaPelna, nazwaSkrocona, adres, typ) {
      var hay = String(nazwaPelna || '') + ' ' + String(nazwaSkrocona || '') + ' ' + String(adres || '');
      if (/bol[eę]cin/i.test(hay)) return 'bolecin';
      var t = String(typ || '').trim().toUpperCase();
      if (t === 'CD') return 'cd';
      if (t === 'PLAC') return 'plac';
      return 'puste';
    }

    function colorHexForKindAdmin(kind) {
      if (kind === 'bolecin') return '${'#fd7e14'}';
      if (kind === 'cd') return '${'#0d6efd'}';
      if (kind === 'plac') return '${'#198754'}';
      return '${'#6f42c1'}';
    }

    function loadPointKeyAdmin(p) {
      return String(p.adres || '').trim().toLowerCase() + '|' + String(p.nazwaPelna || '').trim().toLowerCase();
    }

    function listKeyAdmin(e) {
      return String(e.label || '').trim().toLowerCase();
    }

    function postReferenceData(payload) {
      if (!WEBAPP_URL) {
        return Promise.resolve({ ok: false, error: 'no_webapp' });
      }
      return fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).then(function(res) { return res.json(); });
    }

    function setManualAdminStatus(msg, kind) {
      var el = document.getElementById('manual-admin-status');
      if (!el) return;
      el.textContent = msg || '';
      el.classList.remove('is-error', 'is-warn');
      if (kind === 'error') el.classList.add('is-error');
      else if (kind === 'warn') el.classList.add('is-warn');
    }

    function showZalCoordsSection(show) {
      var wrap = document.getElementById('manual-admin-zal-coords-wrap');
      if (wrap) wrap.hidden = !show;
    }

    function showZalGeocodeFail(show) {
      var box = document.getElementById('manual-admin-zal-geocode-fail');
      var noPin = document.getElementById('manual-admin-zal-submit-no-pin');
      if (box) box.hidden = !show;
      if (noPin) noPin.hidden = !show;
    }

    function resetZalForm() {
      ['manual-admin-zal-pelna', 'manual-admin-zal-skrocona', 'manual-admin-zal-adres', 'manual-admin-zal-lat', 'manual-admin-zal-lon'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
      });
      var typEl = document.getElementById('manual-admin-zal-typ');
      if (typEl) typEl.value = '';
      var zbiorkaEl = document.getElementById('manual-admin-zal-zbiorka');
      if (zbiorkaEl) zbiorkaEl.value = '';
      showZalGeocodeFail(false);
      showZalCoordsSection(false);
    }

    function parseManualLatLon(latId, lonId) {
      var latRaw = String((document.getElementById(latId) || {}).value || '').trim();
      var lonRaw = String((document.getElementById(lonId) || {}).value || '').trim();
      if (!latRaw && !lonRaw) return null;
      if (!latRaw || !lonRaw) {
        return { error: 'Podaj obie współrzędne: Lat i Lon.' };
      }
      var lat = parseFloat(latRaw.replace(',', '.'));
      var lon = parseFloat(lonRaw.replace(',', '.'));
      if (isNaN(lat) || isNaN(lon)) {
        return { error: 'Nieprawidłowy format współrzędnych (użyj liczb dziesiętnych).' };
      }
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return { error: 'Współrzędne poza zakresem (Lat −90…90, Lon −180…180).' };
      }
      return { lat: lat, lon: lon };
    }

    function persistZaladunekEntry(pelna, skrocona, adres, typ, rodzajZbiorki, coords) {
      var payload = {
        mode: 'addReferenceZaladunek',
        nazwaPelna: pelna,
        nazwaSkrocona: skrocona,
        adres: adres,
        typ: typ,
        rodzajZbiorki: rodzajZbiorki
      };
      if (coords) {
        payload.lat = coords.lat;
        payload.lon = coords.lon;
      }
      return postReferenceData(payload).then(function(resp) {
        if (!resp || !resp.ok) {
          if (resp && resp.error === 'duplicate') {
            setManualAdminStatus('To miejsce już jest w arkuszu.', 'error');
          } else {
            setManualAdminStatus('Nie udało się zapisać — sprawdź Web App.', 'error');
          }
          return false;
        }
        var entry = resp.entry || payload;
        applyReferenceZaladunekEntry(entry, false);
        if (coords) {
          setManualAdminStatus('Zapisano — miejsce załadunku i pinezka dodane.', 'ok');
        } else {
          setManualAdminStatus('Zapisano do listy — bez pinezki (brak współrzędnych).', 'warn');
        }
        resetZalForm();
        return true;
      });
    }

    function setManualAdminBusy(btn, busy) {
      if (!btn) return;
      btn.disabled = !!busy;
      btn.classList.toggle('is-busy', !!busy);
    }

    function openManualAdminModal() {
      var m = document.getElementById('manual-admin-modal');
      if (!m) return;
      setManualAdminStatus('');
      if (!WEBAPP_URL) {
        setManualAdminStatus('Brak URL Web App — zapis na stałe niedostępny.', 'error');
      }
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
    }

    function closeManualAdminModal() {
      var m = document.getElementById('manual-admin-modal');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
    }

    function switchManualAdminTab(tab) {
      ['zal', 'prz', 'dos'].forEach(function(t) {
        var panel = document.getElementById('manual-admin-panel-' + t);
        var btn = document.querySelector('.manual-admin-tabs [data-tab="' + t + '"]');
        if (panel) panel.classList.toggle('active', t === tab);
        if (btn) btn.classList.toggle('active', t === tab);
      });
      setManualAdminStatus('');
    }

    function findLoadPointIdxAdmin(adres, nazwaPelna) {
      for (var i = 0; i < LOAD_POINTS.length; i++) {
        if (LOAD_POINTS[i].adres === adres && LOAD_POINTS[i].nazwaPelna === nazwaPelna) return i;
      }
      return -1;
    }

    function hasListLabelAdmin(list, label) {
      var key = listKeyAdmin({ label: label });
      for (var i = 0; i < list.length; i++) {
        if (listKeyAdmin(list[i]) === key) return true;
      }
      return false;
    }

    /** Po dodaniu pinezki — widok ok. powiatu (nie ulicy). Leaflet ~10–11. */
    var NEW_PIN_FOCUS_ZOOM = 11;

    function addMapMarkerAdmin(point, loadIdx) {
      if (typeof map === 'undefined' || typeof pinIcon !== 'function') return;
      var marker = L.marker([point.lat, point.lon], { icon: pinIcon(point.kolor, false) });
      marker.bindPopup('');
      marker.addTo(map);
      var entry = { p: point, marker: marker, loadIdx: loadIdx };
      markerEntries.push(entry);
      marker.on('popupopen', function() {
        if (!wordDocEnabled) return;
        marker.setPopupContent(buildPopupHtml(point, loadIdx));
        wirePopupControls(marker, loadIdx);
      });
      map.setView([point.lat, point.lon], NEW_PIN_FOCUS_ZOOM);
      if (typeof applyAddressSearch === 'function') applyAddressSearch();
    }

    function applyReferenceZaladunekEntry(entry, fromRemote) {
      if (!entry || !entry.adres) return;
      var pelna = entry.nazwaPelna || entry.nazwaSkrocona || '';
      var skrocona = entry.nazwaSkrocona || entry.nazwaPelna || '';
      if (!pelna && !skrocona) return;
      if (!pelna) pelna = skrocona;
      if (!skrocona) skrocona = pelna;
      if (findLoadPointIdxAdmin(entry.adres, pelna) >= 0) return;

      LOAD_POINTS.push({
        nazwaPelna: pelna,
        nazwaSkrocona: skrocona,
        adres: entry.adres,
        typ: String(entry.typ || '').trim(),
        rodzajZbiorki: String(entry.rodzajZbiorki || '').trim()
      });
      var loadIdx = LOAD_POINTS.length - 1;
      var lat = entry.lat != null ? parseFloat(entry.lat) : NaN;
      var lon = entry.lon != null ? parseFloat(entry.lon) : NaN;
      if (!isNaN(lat) && !isNaN(lon)) {
        var kind = classifyColorKindAdmin(pelna, skrocona, entry.adres, entry.typ);
        var mapPoint = {
          nazwaPelna: pelna,
          nazwaSkrocona: skrocona,
          adres: entry.adres,
          typ: String(entry.typ || '').trim(),
          colorKind: kind,
          lat: lat,
          lon: lon,
          kolor: colorHexForKindAdmin(kind)
        };
        PUNKTY.push(mapPoint);
        addMapMarkerAdmin(mapPoint, loadIdx);
      } else if (!fromRemote) {
        return loadIdx;
      }
      return loadIdx;
    }

    function applyReferencePrzewoznikEntry(entry) {
      if (!entry) return;
      var opt = przewoznikToComboboxJs(entry);
      if (!opt.label) return;
      if (hasListLabelAdmin(PODWYKOLISTA, opt.label)) return;
      PODWYKOLISTA.push(opt);
    }

    function applyReferenceDostawaEntry(entry) {
      if (!entry || !entry.adres) return;
      var opt = deliveryToComboboxJs(entry);
      if (!opt.label) return;
      if (hasListLabelAdmin(MIEJSCA_DOSTAWY, opt.label)) return;
      MIEJSCA_DOSTAWY.push(opt);
    }

    function geocodeAddressAdmin(adres) {
      var url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(adres);
      return fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!Array.isArray(data) || !data.length) return null;
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        })
        .catch(function() { return null; });
    }

    function loadReferenceDataFromSheets() {
      if (!WEBAPP_URL) return Promise.resolve();
      return fetch(WEBAPP_URL + (WEBAPP_URL.indexOf('?') >= 0 ? '&' : '?') + 'action=listReferenceData')
        .then(function(r) { return r.json(); })
        .then(function(resp) {
          if (!resp || !resp.ok || !resp.data) return;
          var data = resp.data;
          (data.zaladunek || []).forEach(function(e) { applyReferenceZaladunekEntry(e, true); });
          (data.przewoznicy || []).forEach(function(e) { applyReferencePrzewoznikEntry(e); });
          (data.miejscaDostawy || []).forEach(function(e) { applyReferenceDostawaEntry(e); });
        })
        .catch(function() { /* cicho — mapa działa z danymi z buildu */ });
    }

    function submitManualZaladunek() {
      var btn = document.getElementById('manual-admin-zal-submit');
      var pelna = (document.getElementById('manual-admin-zal-pelna') || {}).value || '';
      var skrocona = (document.getElementById('manual-admin-zal-skrocona') || {}).value || '';
      var adres = (document.getElementById('manual-admin-zal-adres') || {}).value || '';
      var typ = (document.getElementById('manual-admin-zal-typ') || {}).value || '';
      var rodzajZbiorki = (document.getElementById('manual-admin-zal-zbiorka') || {}).value || '';
      pelna = String(pelna).trim();
      skrocona = String(skrocona).trim();
      adres = String(adres).trim();
      typ = String(typ).trim();
      rodzajZbiorki = String(rodzajZbiorki).trim();
      if (!adres) {
        setManualAdminStatus('Podaj adres.', 'error');
        return;
      }
      if (!pelna && !skrocona) {
        setManualAdminStatus('Podaj nazwę pełną lub skróconą.', 'error');
        return;
      }
      if (!pelna) pelna = skrocona;
      if (!skrocona) skrocona = pelna;
      if (findLoadPointIdxAdmin(adres, pelna) >= 0) {
        setManualAdminStatus('To miejsce już jest na liście.', 'error');
        return;
      }
      if (!WEBAPP_URL) {
        setManualAdminStatus('Brak URL Web App — nie można zapisać.', 'error');
        return;
      }

      var manual = parseManualLatLon('manual-admin-zal-lat', 'manual-admin-zal-lon');
      if (manual && manual.error) {
        setManualAdminStatus(manual.error, 'error');
        showZalCoordsSection(true);
        return;
      }
      if (manual) {
        setManualAdminBusy(btn, true);
        setManualAdminStatus('Zapis do arkusza (współrzędne ręczne)…');
        persistZaladunekEntry(pelna, skrocona, adres, typ, rodzajZbiorki, manual)
          .catch(function() { setManualAdminStatus('Błąd sieci — spróbuj ponownie.', 'error'); })
          .finally(function() { setManualAdminBusy(btn, false); });
        return;
      }

      setManualAdminBusy(btn, true);
      setManualAdminStatus('Geokodowanie adresu…');
      geocodeAddressAdmin(adres).then(function(coords) {
        if (coords) {
          showZalGeocodeFail(false);
          setManualAdminStatus('Zapis do arkusza…');
          return persistZaladunekEntry(pelna, skrocona, adres, typ, rodzajZbiorki, coords);
        }
        showZalGeocodeFail(true);
        showZalCoordsSection(true);
        setManualAdminStatus(
          'Geokodowanie nie powiodło się. Podaj Lat/Lon ręcznie i kliknij Zapisz — albo „Zapisz bez pinezki”.',
          'warn'
        );
      }).catch(function() {
        setManualAdminStatus('Błąd sieci podczas geokodowania — spróbuj ponownie.', 'error');
      }).finally(function() {
        setManualAdminBusy(btn, false);
      });
    }

    function submitManualZaladunekWithoutPin() {
      var btn = document.getElementById('manual-admin-zal-submit-no-pin');
      var pelna = String((document.getElementById('manual-admin-zal-pelna') || {}).value || '').trim();
      var skrocona = String((document.getElementById('manual-admin-zal-skrocona') || {}).value || '').trim();
      var adres = String((document.getElementById('manual-admin-zal-adres') || {}).value || '').trim();
      var typ = String((document.getElementById('manual-admin-zal-typ') || {}).value || '').trim();
      var rodzajZbiorki = String((document.getElementById('manual-admin-zal-zbiorka') || {}).value || '').trim();
      if (!adres) {
        setManualAdminStatus('Podaj adres.', 'error');
        return;
      }
      if (!pelna && !skrocona) {
        setManualAdminStatus('Podaj nazwę pełną lub skróconą.', 'error');
        return;
      }
      if (!pelna) pelna = skrocona;
      if (!skrocona) skrocona = pelna;
      if (!WEBAPP_URL) {
        setManualAdminStatus('Brak URL Web App — nie można zapisać.', 'error');
        return;
      }
      setManualAdminBusy(btn, true);
      setManualAdminStatus('Zapis do arkusza (bez pinezki)…');
      persistZaladunekEntry(pelna, skrocona, adres, typ, rodzajZbiorki, null)
        .catch(function() { setManualAdminStatus('Błąd sieci — spróbuj ponownie.', 'error'); })
        .finally(function() { setManualAdminBusy(btn, false); });
    }

    function submitManualPrzewoznik() {
      var btn = document.getElementById('manual-admin-prz-submit');
      var wysw = String((document.getElementById('manual-admin-prz-wysw') || {}).value || '').trim();
      var protokol = String((document.getElementById('manual-admin-prz-protokol') || {}).value || '').trim();
      var adres = String((document.getElementById('manual-admin-prz-adres') || {}).value || '').trim();
      var nip = String((document.getElementById('manual-admin-prz-nip') || {}).value || '').trim();
      var bdo = String((document.getElementById('manual-admin-prz-bdo') || {}).value || '').trim();
      if (!wysw) {
        setManualAdminStatus('Podaj nazwę wyświetlaną.', 'error');
        return;
      }
      if (!protokol) protokol = wysw;
      if (hasListLabelAdmin(PODWYKOLISTA, wysw)) {
        setManualAdminStatus('Ten przewoźnik już jest na liście.', 'error');
        return;
      }
      if (!WEBAPP_URL) {
        setManualAdminStatus('Brak URL Web App — nie można zapisać.', 'error');
        return;
      }
      setManualAdminBusy(btn, true);
      setManualAdminStatus('Zapis do arkusza…');
      var payload = {
        mode: 'addReferencePrzewoznik',
        nazwaWyswietlana: wysw,
        nazwaDoProtokolu: protokol,
        adres: adres,
        nip: nip,
        bdo: bdo
      };
      postReferenceData(payload).then(function(resp) {
        if (!resp || !resp.ok) {
          setManualAdminStatus(resp && resp.error === 'duplicate'
            ? 'Ten przewoźnik już jest w arkuszu.'
            : 'Nie udało się zapisać — sprawdź Web App.', 'error');
          return;
        }
        applyReferencePrzewoznikEntry(resp.entry || payload);
        setManualAdminStatus('Zapisano przewoźnika.');
        document.getElementById('manual-admin-prz-wysw').value = '';
        document.getElementById('manual-admin-prz-protokol').value = '';
        document.getElementById('manual-admin-prz-adres').value = '';
        document.getElementById('manual-admin-prz-nip').value = '';
        document.getElementById('manual-admin-prz-bdo').value = '';
      }).catch(function() { setManualAdminStatus('Błąd sieci — spróbuj ponownie.', 'error'); })
        .finally(function() { setManualAdminBusy(btn, false); });
    }

    function submitManualDostawa() {
      var btn = document.getElementById('manual-admin-dos-submit');
      var pelna = String((document.getElementById('manual-admin-dos-pelna') || {}).value || '').trim();
      var skrocona = String((document.getElementById('manual-admin-dos-skrocona') || {}).value || '').trim();
      var adres = String((document.getElementById('manual-admin-dos-adres') || {}).value || '').trim();
      var typ = String((document.getElementById('manual-admin-dos-typ') || {}).value || '').trim();
      if (!adres) {
        setManualAdminStatus('Podaj adres.', 'error');
        return;
      }
      if (!pelna && !skrocona) {
        setManualAdminStatus('Podaj nazwę pełną lub skróconą.', 'error');
        return;
      }
      if (!pelna) pelna = skrocona;
      if (!skrocona) skrocona = pelna;
      var label = skrocona || pelna;
      if (hasListLabelAdmin(MIEJSCA_DOSTAWY, label)) {
        setManualAdminStatus('To miejsce dostawy już jest na liście.', 'error');
        return;
      }
      if (!WEBAPP_URL) {
        setManualAdminStatus('Brak URL Web App — nie można zapisać.', 'error');
        return;
      }
      setManualAdminBusy(btn, true);
      setManualAdminStatus('Zapis do arkusza…');
      var payload = {
        mode: 'addReferenceDostawa',
        nazwaPelna: pelna,
        nazwaSkrocona: skrocona,
        adres: adres,
        typ: typ
      };
      postReferenceData(payload)
        .then(function(resp) {
          if (!resp || !resp.ok) {
            setManualAdminStatus(resp && resp.error === 'duplicate'
              ? 'To miejsce już jest w arkuszu.'
              : 'Nie udało się zapisać — sprawdź Web App.', 'error');
            return;
          }
          applyReferenceDostawaEntry(resp.entry || payload);
          setManualAdminStatus('Zapisano miejsce dostawy.');
          document.getElementById('manual-admin-dos-pelna').value = '';
          document.getElementById('manual-admin-dos-skrocona').value = '';
          document.getElementById('manual-admin-dos-adres').value = '';
          document.getElementById('manual-admin-dos-typ').value = '';
        })
        .catch(function() { setManualAdminStatus('Błąd sieci — spróbuj ponownie.', 'error'); })
        .finally(function() { setManualAdminBusy(btn, false); });
    }

    (function wireManualAdmin() {
      var openBtn = document.getElementById('map-manual-add-data');
      if (openBtn) openBtn.addEventListener('click', openManualAdminModal);
      var closeBtn = document.getElementById('manual-admin-close');
      if (closeBtn) closeBtn.addEventListener('click', closeManualAdminModal);
      var modal = document.getElementById('manual-admin-modal');
      if (modal) {
        modal.addEventListener('click', function(ev) {
          if (ev.target === modal) closeManualAdminModal();
        });
      }
      document.querySelectorAll('.manual-admin-tabs button[data-tab]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          switchManualAdminTab(btn.getAttribute('data-tab'));
        });
      });
      var zalBtn = document.getElementById('manual-admin-zal-submit');
      if (zalBtn) zalBtn.addEventListener('click', submitManualZaladunek);
      var zalNoPinBtn = document.getElementById('manual-admin-zal-submit-no-pin');
      if (zalNoPinBtn) zalNoPinBtn.addEventListener('click', submitManualZaladunekWithoutPin);
      var zalToggleCoords = document.getElementById('manual-admin-zal-toggle-coords');
      if (zalToggleCoords) {
        zalToggleCoords.addEventListener('click', function() {
          var wrap = document.getElementById('manual-admin-zal-coords-wrap');
          if (wrap) showZalCoordsSection(wrap.hidden);
        });
      }
      var przBtn = document.getElementById('manual-admin-prz-submit');
      if (przBtn) przBtn.addEventListener('click', submitManualPrzewoznik);
      var dosBtn = document.getElementById('manual-admin-dos-submit');
      if (dosBtn) dosBtn.addEventListener('click', submitManualDostawa);
      loadReferenceDataFromSheets();
    })();
`;
}

export type { ManualOverlay };
