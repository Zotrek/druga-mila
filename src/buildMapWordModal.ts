/**
 * Fragmenty HTML/CSS/JS modala Word + multi-select / hurt (osadzane w buildMapHtml).
 */

export interface WordMapEmbed {
  templateBase64: string;
  podwykoOptions: Array<{ label: string; value: string }>;
  loadPoints: Array<{
    nazwaPelna: string;
    nazwaSkrocona: string;
    adres: string;
  }>;
}

/** Kolor pinezki zaznaczonej do hurtu. */
export const COLOR_BULK_SELECTED = '#ea3aed';

export function wordModalCss(): string {
  return `
    .doc-modal-overlay { position: fixed; inset: 0; z-index: 20000; background: rgba(0,0,0,0.45); display: flex; align-items: flex-start; justify-content: center; padding: 24px 12px; overflow: auto; }
    .doc-modal-panel { background: #fff; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); padding: 18px 20px; width: min(440px, 100%); margin-top: 24px; }
    .doc-modal-panel h3 { margin: 0 0 12px; font-size: 16px; }
    .doc-modal-panel label { display: block; font-size: 12px; font-weight: 600; margin: 10px 0 4px; color: #333; }
    .doc-modal-panel input[type="text"], .doc-modal-panel input[type="date"], .doc-modal-panel input[type="number"], .doc-modal-panel select { width: 100%; padding: 8px 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 6px; }
    .doc-combobox-wrap { position: relative; }
    .doc-combobox-list { position: absolute; z-index: 5; left: 0; right: 0; max-height: 180px; overflow: auto; margin: 0; padding: 4px 0; list-style: none; background: #fff; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
    .doc-combobox-list li { padding: 6px 10px; font-size: 13px; cursor: pointer; }
    .doc-combobox-list li:hover, .doc-combobox-list li[aria-selected="true"] { background: #eef5ff; }
    .doc-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .doc-modal-actions button { padding: 8px 14px; border-radius: 6px; border: 1px solid #ccc; background: #f8f8f8; cursor: pointer; font-size: 14px; }
    .doc-modal-actions button.primary { background: #0d6efd; color: #fff; border-color: #0d6efd; }
    .doc-modal-hint { font-size: 11px; color: #666; margin-top: 8px; }
    .doc-bulk-points-wrap { margin-top: 8px; max-height: 160px; overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 6px; padding: 8px 10px; background: #fafafa; }
    .doc-bulk-points-title { font-size: 12px; font-weight: 600; margin: 0 0 6px; color: #333; }
    .doc-bulk-points-list { margin: 0; padding: 0 0 0 16px; font-size: 12px; color: #444; line-height: 1.45; }
    .doc-bulk-numer-info { font-size: 12px; color: #0d6efd; margin: 8px 0 0; min-height: 1.2em; }
    .popup-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
    .popup-actions button { padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #0d6efd; background: #0d6efd; color: #fff; cursor: pointer; }
    .popup-actions button:disabled { opacity: 0.45; cursor: not-allowed; }
    .popup-bulk-select { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; color: #333; margin: 0; font-weight: 400; }
    .popup-bulk-select input { margin: 0; flex-shrink: 0; }
    .map-bulk-panel { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8e8e8; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .map-bulk-panel[hidden] { display: none !important; }
    .map-bulk-count { font-size: 12px; color: #333; flex: 1; min-width: 120px; }
    .map-bulk-generate { padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #198754; background: #198754; color: #fff; cursor: pointer; }
    .map-bulk-clear { padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #ccc; background: #f8f9fa; cursor: pointer; }
  `;
}

export function wordModalHtml(): string {
  return `  <div id="doc-modal" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="doc-modal-title">
      <h3 id="doc-modal-title">Generuj protokół Word</h3>
      <div id="doc-single-zaladunek-wrap">
        <label for="doc-sel-zaladunek">Miejsce załadunku</label>
        <div class="doc-combobox-wrap">
          <input type="text" id="doc-sel-zaladunek" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Nazwa skrócona / pełna / adres…" />
          <input type="hidden" id="doc-val-zaladunek" value="" />
          <ul id="doc-sel-zaladunek-list" class="doc-combobox-list" role="listbox" hidden></ul>
        </div>
      </div>
      <div id="doc-bulk-points-wrap" class="doc-bulk-points-wrap" hidden>
        <p class="doc-bulk-points-title">Wybrane punkty</p>
        <ul id="doc-bulk-points-list" class="doc-bulk-points-list"></ul>
      </div>
      <label for="doc-sel-przewoznik">Przewoźnik</label>
      <div class="doc-combobox-wrap">
        <input type="text" id="doc-sel-przewoznik" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Wpisz fragment…" />
        <input type="hidden" id="doc-val-przewoznik" value="" />
        <ul id="doc-sel-przewoznik-list" class="doc-combobox-list" role="listbox" hidden></ul>
      </div>
      <label for="doc-sel-miejsce">Miejsce dostawy</label>
      <div class="doc-combobox-wrap">
        <input type="text" id="doc-sel-miejsce" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Wpisz fragment…" />
        <input type="hidden" id="doc-val-miejsce" value="" />
        <ul id="doc-sel-miejsce-list" class="doc-combobox-list" role="listbox" hidden></ul>
      </div>
      <label for="doc-inp-awizacja">Dane do awizacji</label>
      <input type="text" id="doc-inp-awizacja" maxlength="120" autocomplete="off" spellcheck="false" />
      <label for="doc-inp-data">Data załadunku</label>
      <input type="date" id="doc-inp-data" />
      <label for="doc-inp-stawka">Stawka (tylko Google)</label>
      <input type="text" id="doc-inp-stawka" maxlength="80" autocomplete="off" />
      <label for="doc-sel-zbiorka">Rodzaj zbiórki (tylko Google)</label>
      <select id="doc-sel-zbiorka">
        <option value="">—</option>
        <option value="manualna">manualna</option>
        <option value="automatyczna">automatyczna</option>
        <option value="manualna i automatyczna">manualna i automatyczna</option>
      </select>
      <label for="doc-inp-worki">Ile worków (tylko Google)</label>
      <input type="text" id="doc-inp-worki" maxlength="40" autocomplete="off" />
      <label for="doc-inp-transport">Rodzaj transportu (tylko Google)</label>
      <input type="text" id="doc-inp-transport" maxlength="80" autocomplete="off" />
      <div id="doc-single-numer-wrap">
        <label for="doc-inp-numer">Numer zlecenia</label>
        <input type="text" id="doc-inp-numer" maxlength="120" placeholder="podgląd / auto" autocomplete="off" />
      </div>
      <p id="doc-bulk-numer-info" class="doc-bulk-numer-info" hidden aria-live="polite"></p>
      <p class="doc-modal-hint" id="doc-modal-hint">Pola opcjonalne. Bez Web App: Word lokalnie, bez auto-numeru.</p>
      <div class="doc-modal-actions">
        <button type="button" id="doc-btn-cancel">Anuluj</button>
        <button type="button" id="doc-btn-generate" class="primary">Pobierz .docx</button>
      </div>
    </div>
  </div>
`;
}

/** Skrypt przeglądarkowy — modal, comboboxy, Word, POST, hurt. */
export function wordModalBrowserScript(): string {
  return `
    var COLOR_BULK_SELECTED = ${JSON.stringify(COLOR_BULK_SELECTED)};
    window.__docModalMode = 'single';
    window.__bulkSelectedLoadIdxs = window.__bulkSelectedLoadIdxs || {};
    window.__bulkDocLoadIdxs = [];

    function getBulkSelectedLoadIdxs() {
      var out = [];
      var sel = window.__bulkSelectedLoadIdxs || {};
      Object.keys(sel).forEach(function(k) {
        if (!sel[k]) return;
        var idx = parseInt(k, 10);
        if (!isNaN(idx) && LOAD_POINTS[idx]) out.push(idx);
      });
      out.sort(function(a, b) { return a - b; });
      return out;
    }
    function isBulkLoadSelected(loadIdx) {
      return !!(window.__bulkSelectedLoadIdxs && window.__bulkSelectedLoadIdxs[loadIdx]);
    }
    function setBulkLoadSelected(loadIdx, selected) {
      if (!window.__bulkSelectedLoadIdxs) window.__bulkSelectedLoadIdxs = {};
      if (selected) window.__bulkSelectedLoadIdxs[loadIdx] = true;
      else delete window.__bulkSelectedLoadIdxs[loadIdx];
      updateBulkSelectionUi();
    }
    function clearBulkSelection() {
      window.__bulkSelectedLoadIdxs = {};
      updateBulkSelectionUi();
    }
    function updateBulkSelectionUi() {
      var indices = getBulkSelectedLoadIdxs();
      var panel = document.getElementById('map-bulk-panel');
      var countEl = document.getElementById('map-bulk-count');
      if (panel) panel.hidden = indices.length === 0;
      if (countEl) {
        countEl.textContent = indices.length === 1
          ? '1 punkt zaznaczony'
          : indices.length + ' punktów zaznaczonych';
      }
      if (typeof markerEntries !== 'undefined') {
        markerEntries.forEach(function(entry) {
          refreshMarkerIcon(entry);
        });
      }
    }
    function refreshMarkerIcon(entry) {
      if (!entry || !entry.marker) return;
      var inputEl = document.getElementById('map-address-search');
      var raw = inputEl ? inputEl.value : '';
      var hasSearch = String(raw).trim().length > 0;
      var sMatch = !hasSearch || mapPointMatchesSearchMap(entry.p, raw);
      var bulk = entry.loadIdx >= 0 && isBulkLoadSelected(entry.loadIdx);
      var fill = bulk ? COLOR_BULK_SELECTED : entry.p.kolor;
      entry.marker.setIcon(pinIcon(fill, (hasSearch && sMatch) || bulk));
    }
    function buildPopupHtml(p, loadIdx) {
      var typeLabel = COLOR_LABEL[p.colorKind] || p.typ || '—';
      var bulkSelected = loadIdx >= 0 && isBulkLoadSelected(loadIdx);
      var html =
        '<div class="popup-name">' + escapeHtmlMap(p.nazwaPelna) + '</div>' +
        '<div class="popup-short">' + escapeHtmlMap(p.nazwaSkrocona) + '</div>' +
        '<div class="popup-address">' + escapeHtmlMap(p.adres) + '</div>' +
        '<div class="popup-type">Typ: ' + escapeHtmlMap(typeLabel) + '</div>';
      if (wordDocEnabled && loadIdx >= 0) {
        html += '<div class="popup-actions">' +
          '<label class="popup-bulk-select"><input type="checkbox" class="popup-bulk-cb" data-load-idx="' + loadIdx + '"' +
          (bulkSelected ? ' checked' : '') + ' /> Zaznacz do hurtu</label>' +
          '<button type="button" class="btn-gen-doc"' + (bulkSelected ? ' disabled' : '') +
          ' data-load-idx="' + loadIdx + '">Generuj protokół</button></div>';
      }
      return html;
    }
    function wirePopupControls(marker, loadIdx) {
      if (!wordDocEnabled || loadIdx < 0) return;
      var el = marker.getPopup() && marker.getPopup().getElement();
      if (!el) return;
      var cb = el.querySelector('.popup-bulk-cb');
      if (cb) {
        cb.onchange = function() {
          setBulkLoadSelected(loadIdx, cb.checked);
          var entry = markerEntries.find(function(e) { return e.loadIdx === loadIdx; });
          var point = entry ? entry.p : null;
          if (point) {
            marker.setPopupContent(buildPopupHtml(point, loadIdx));
            wirePopupControls(marker, loadIdx);
          }
        };
      }
      var btn = el.querySelector('.btn-gen-doc');
      if (btn && !btn.disabled) {
        btn.onclick = function(ev) {
          if (ev.stopPropagation) ev.stopPropagation();
          openDocModal(loadIdx);
        };
      }
    }

    function setDocModalMode(mode) {
      window.__docModalMode = mode;
      var isBulk = mode === 'bulk';
      var titleEl = document.getElementById('doc-modal-title');
      var zalWrap = document.getElementById('doc-single-zaladunek-wrap');
      var bulkWrap = document.getElementById('doc-bulk-points-wrap');
      var numerWrap = document.getElementById('doc-single-numer-wrap');
      var bulkNumerInfo = document.getElementById('doc-bulk-numer-info');
      var okBtn = document.getElementById('doc-btn-generate');
      var n = (window.__bulkDocLoadIdxs || []).length;
      if (titleEl) {
        titleEl.textContent = isBulk
          ? 'Generuj protokoły Word (' + n + ' punktów)'
          : 'Generuj protokół Word';
      }
      if (zalWrap) zalWrap.hidden = isBulk;
      if (bulkWrap) bulkWrap.hidden = !isBulk;
      if (numerWrap) numerWrap.hidden = isBulk;
      if (bulkNumerInfo) bulkNumerInfo.hidden = !isBulk;
      if (okBtn) okBtn.textContent = isBulk ? 'Pobierz wszystkie .docx' : 'Pobierz .docx';
    }
    function renderBulkPointsList(indices) {
      var listEl = document.getElementById('doc-bulk-points-list');
      if (!listEl) return;
      listEl.innerHTML = '';
      indices.forEach(function(idx) {
        var p = LOAD_POINTS[idx];
        if (!p) return;
        var li = document.createElement('li');
        li.textContent = (p.nazwaSkrocona || p.nazwaPelna) + ' — ' + p.adres;
        listEl.appendChild(li);
      });
    }
    function openDocModal(prefillIdx) {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled) return;
      window.__bulkDocLoadIdxs = [];
      setDocModalMode('single');
      resetDocModal();
      if (typeof prefillIdx === 'number' && LOAD_POINTS[prefillIdx]) {
        selectZaladunek(prefillIdx);
      }
      var dateEl = document.getElementById('doc-inp-data');
      if (dateEl) dateEl.value = defaultDateZaladunkuYmd();
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      previewNumerFromApi();
    }
    function openBulkDocModal() {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled) return;
      var indices = getBulkSelectedLoadIdxs();
      if (indices.length === 0) {
        alert('Zaznacz co najmniej jeden punkt do hurtu.');
        return;
      }
      window.__bulkDocLoadIdxs = indices.slice();
      setDocModalMode('bulk');
      resetDocModal();
      renderBulkPointsList(indices);
      var dateElBulk = document.getElementById('doc-inp-data');
      if (dateElBulk) dateElBulk.value = defaultDateZaladunkuYmd();
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      var bulkNumerInfo = document.getElementById('doc-bulk-numer-info');
      var hint = document.getElementById('doc-modal-hint');
      if (!WEBAPP_URL) {
        if (bulkNumerInfo) bulkNumerInfo.textContent = 'Bez Web App — Word lokalnie, bez zapisu i auto-numeru.';
        if (hint) hint.textContent = 'Wspólne pola dla wszystkich punktów. Każdy punkt = osobny plik.';
        return;
      }
      if (bulkNumerInfo) bulkNumerInfo.textContent = 'Pobieranie podglądu numeracji…';
      fetch(WEBAPP_URL + (WEBAPP_URL.indexOf('?') >= 0 ? '&' : '?') + 'action=modalData')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var preview = data && data.ok && data.numer ? String(data.numer) : '';
          window.__docPreviewNumer = preview;
          if (bulkNumerInfo) {
            bulkNumerInfo.textContent = preview
              ? ('Numery auto kolejno (od ' + preview + '). Każdy punkt = wiersz + .docx.')
              : 'Numery zostaną nadane automatycznie kolejno.';
          }
          if (hint) hint.textContent = 'Wspólne pola (przewoźnik, dostawa, data…). Załadunek z zaznaczenia.';
        })
        .catch(function() {
          if (bulkNumerInfo) bulkNumerInfo.textContent = 'Nie udało się pobrać podglądu — przy generacji i tak auto z API.';
        });
    }
    function closeDocModal() {
      var m = document.getElementById('doc-modal');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
      window.__docModalMode = 'single';
    }
    function resetDocModal() {
      ['doc-sel-zaladunek','doc-sel-przewoznik','doc-sel-miejsce','doc-inp-awizacja','doc-inp-stawka','doc-inp-worki','doc-inp-transport','doc-inp-numer'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
      });
      ['doc-val-zaladunek','doc-val-przewoznik','doc-val-miejsce'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
      });
      var z = document.getElementById('doc-sel-zbiorka'); if (z) z.value = '';
      var d = document.getElementById('doc-inp-data'); if (d) d.value = '';
      hideAllComboboxLists();
    }
    function hideAllComboboxLists() {
      document.querySelectorAll('.doc-combobox-list').forEach(function(ul) { ul.hidden = true; });
    }
    /** Jak arkusz-mapa: pon–pt &lt;04:00 dziś; od 04:00 jutro; pt≥04 → pon; sob/niedz → pon. */
    function defaultDateZaladunkuYmd() {
      var d = new Date();
      var dow = d.getDay();
      var hour = d.getHours();
      if (dow === 6) {
        d.setDate(d.getDate() + 2);
      } else if (dow === 0) {
        d.setDate(d.getDate() + 1);
      } else if (dow === 5) {
        if (hour >= 4) {
          d.setDate(d.getDate() + 3);
        }
      } else {
        var dayOffset = hour >= 0 && hour < 4 ? 0 : 1;
        d.setDate(d.getDate() + dayOffset);
      }
      var y = d.getFullYear();
      var mo = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return y + '-' + mo + '-' + day;
    }
    function normQ(t) {
      return normalizeForAddressSearchMap(t);
    }
    function selectZaladunek(idx) {
      var p = LOAD_POINTS[idx];
      if (!p) return;
      var inp = document.getElementById('doc-sel-zaladunek');
      var hid = document.getElementById('doc-val-zaladunek');
      if (inp) inp.value = p.nazwaSkrocona || p.nazwaPelna;
      if (hid) hid.value = String(idx);
    }
    function wireCombobox(inputId, hiddenId, listId, getItems, getLabel, onPick) {
      var input = document.getElementById(inputId);
      var hidden = document.getElementById(hiddenId);
      var list = document.getElementById(listId);
      if (!input || !hidden || !list) return;
      function render() {
        var q = normQ(input.value);
        var items = getItems();
        list.innerHTML = '';
        var shown = 0;
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var label = getLabel(it, i);
          var hay = normQ(label + ' ' + (it.adres || '') + ' ' + (it.nazwaPelna || '') + ' ' + (it.value || ''));
          if (q && hay.indexOf(q) === -1) continue;
          var li = document.createElement('li');
          li.setAttribute('role', 'option');
          li.textContent = label;
          li.dataset.idx = String(i);
          li.addEventListener('mousedown', function(ev) {
            ev.preventDefault();
            var ix = Number(this.dataset.idx);
            onPick(ix, items[ix]);
            list.hidden = true;
          });
          list.appendChild(li);
          shown++;
          if (shown >= 40) break;
        }
        list.hidden = shown === 0;
      }
      input.addEventListener('focus', render);
      input.addEventListener('input', function() { hidden.value = ''; render(); });
      input.addEventListener('blur', function() { setTimeout(function() { list.hidden = true; }, 150); });
    }
    wireCombobox('doc-sel-zaladunek', 'doc-val-zaladunek', 'doc-sel-zaladunek-list',
      function() { return LOAD_POINTS; },
      function(it) { return it.nazwaSkrocona || it.nazwaPelna; },
      function(ix) { selectZaladunek(ix); }
    );
    wireCombobox('doc-sel-przewoznik', 'doc-val-przewoznik', 'doc-sel-przewoznik-list',
      function() { return PODWYKOLISTA; },
      function(it) { return it.label; },
      function(ix, it) {
        document.getElementById('doc-val-przewoznik').value = String(ix);
        document.getElementById('doc-sel-przewoznik').value = it.label;
      }
    );
    wireCombobox('doc-sel-miejsce', 'doc-val-miejsce', 'doc-sel-miejsce-list',
      function() { return PODWYKOLISTA; },
      function(it) { return it.label; },
      function(ix, it) {
        document.getElementById('doc-val-miejsce').value = String(ix);
        document.getElementById('doc-sel-miejsce').value = it.label;
      }
    );

    function findBiosystemIdx() {
      for (var i = 0; i < PODWYKOLISTA.length; i++) {
        if (String(PODWYKOLISTA[i].label).toLowerCase() === 'biosystem') return i;
      }
      return -1;
    }
    var zbiorkaEl = document.getElementById('doc-sel-zbiorka');
    if (zbiorkaEl) {
      zbiorkaEl.addEventListener('change', function() {
        var v = zbiorkaEl.value;
        if (v === 'manualna' || v === 'manualna i automatyczna') {
          var bi = findBiosystemIdx();
          if (bi >= 0) {
            var it = PODWYKOLISTA[bi];
            document.getElementById('doc-val-miejsce').value = String(bi);
            document.getElementById('doc-sel-miejsce').value = it.label;
          }
        }
      });
    }

    function b64ToUint8(b64) {
      var bin = atob(b64);
      var u = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return u;
    }
    var wordTemplateBytesCache = null;
    function getWordTemplateBytes() {
      if (!wordTemplateBytesCache) wordTemplateBytesCache = b64ToUint8(WORD_TEMPLATE_B64);
      return wordTemplateBytesCache;
    }
    var docxLibsPromise = null;
    function loadScriptOnce(src) {
      return new Promise(function(resolve, reject) {
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) {
          if (existing.getAttribute('data-loaded') === '1') { resolve(); return; }
          existing.addEventListener('load', function() { resolve(); });
          existing.addEventListener('error', function() { reject(new Error(src)); });
          return;
        }
        var s = document.createElement('script');
        s.src = src; s.crossOrigin = '';
        s.onload = function() { s.setAttribute('data-loaded', '1'); resolve(); };
        s.onerror = function() { reject(new Error(src)); };
        document.head.appendChild(s);
      });
    }
    function ensureDocxLibrariesLoaded() {
      if (typeof PizZip !== 'undefined' && typeof docxtemplater !== 'undefined' && typeof saveAs !== 'undefined') {
        return Promise.resolve();
      }
      if (!docxLibsPromise) {
        docxLibsPromise = loadScriptOnce('https://unpkg.com/pizzip@3.1.7/dist/pizzip.min.js')
          .then(function() { return loadScriptOnce('https://unpkg.com/docxtemplater@3.50.0/build/docxtemplater.js'); })
          .then(function() { return loadScriptOnce('https://unpkg.com/file-saver@2.0.5/dist/FileSaver.min.js'); });
      }
      return docxLibsPromise;
    }
    function sanitizeFileNamePart(text) {
      return String(text).replace(/[\\\\/:*?"<>|]+/g, ' ').replace(/\\s+/g, ' ').trim();
    }
    function formatDateForDoc(isoOrDot) {
      var s = String(isoOrDot || '').trim();
      var m = s.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
      if (m) return m[3] + '.' + m[2] + '.' + m[1];
      return s;
    }
    function formatDateForFile(isoOrDot) {
      var s = String(isoOrDot || '').trim();
      var m = s.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
      if (m) return m[3] + '.' + m[2] + '.' + m[1].slice(2);
      var d = s.match(/^(\\d{2})\\.(\\d{2})\\.(\\d{4})$/);
      if (d) return d[1] + '.' + d[2] + '.' + d[3].slice(2);
      return sanitizeFileNamePart(s);
    }
    function buildDocxDownloadName(shortName, dataVal, adres) {
      var name = sanitizeFileNamePart(shortName) || 'protokol';
      var datePart = formatDateForFile(dataVal);
      var addr = sanitizeFileNamePart(adres);
      var base = [name, datePart, addr].filter(function(x) { return x.length > 0; }).join(' ');
      if (base.length > 80) base = base.slice(0, 77).trim() + '...';
      return base + '.docx';
    }
    function resolvePodwyko(hiddenId, inputId) {
      var hid = document.getElementById(hiddenId);
      var inp = document.getElementById(inputId);
      if (hid && hid.value !== '') {
        var ix = Number(hid.value);
        if (PODWYKOLISTA[ix]) return PODWYKOLISTA[ix];
      }
      var typed = inp ? String(inp.value).trim() : '';
      if (!typed) return { label: '', value: '' };
      return { label: typed, value: typed };
    }
    function resolveZaladunek() {
      var hid = document.getElementById('doc-val-zaladunek');
      if (hid && hid.value !== '') {
        var ix = Number(hid.value);
        if (LOAD_POINTS[ix]) return LOAD_POINTS[ix];
      }
      var typed = document.getElementById('doc-sel-zaladunek');
      var t = typed ? String(typed.value).trim() : '';
      return { nazwaPelna: t, nazwaSkrocona: t, adres: '' };
    }
    window.__docPreviewNumer = '';
    function previewNumerFromApi() {
      var numerEl = document.getElementById('doc-inp-numer');
      var hint = document.getElementById('doc-modal-hint');
      window.__docPreviewNumer = '';
      if (!WEBAPP_URL) {
        if (hint) hint.textContent = 'Brak Web App — Word lokalnie, bez zapisu do arkusza Google.';
        return;
      }
      if (hint) hint.textContent = 'Pobieranie podglądu numeru…';
      fetch(WEBAPP_URL + (WEBAPP_URL.indexOf('?') >= 0 ? '&' : '?') + 'action=modalData')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.ok && data.numer) {
            window.__docPreviewNumer = String(data.numer);
            if (numerEl && !String(numerEl.value).trim()) {
              numerEl.value = window.__docPreviewNumer;
            }
          }
          if (hint) hint.textContent = 'Pola opcjonalne. „Pobierz .docx” zapisze wiersz do formatki Google i pobierze Word.';
        })
        .catch(function() {
          if (hint) hint.textContent = 'Nie udało się pobrać numeru — sprawdź Web App / sieć.';
        });
    }
    function appendFormatkaRow(payload) {
      return fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).then(function(res) { return res.json(); });
    }
    function renderAndDownloadDocx(zal, pr, md, dataVal, awizacja, numer, options) {
      var opts = options || {};
      var miejsceWord = [zal.nazwaPelna, zal.adres].filter(Boolean).join(' ');
      var zip = new PizZip(getWordTemplateBytes());
      var Doc = window.docxtemplater;
      var doc = new Doc(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } });
      doc.render({
        numer_zlecenia_transportowego: String(numer || '').trim(),
        miejsce_zaladunku: miejsceWord,
        przewoznik: pr.value || pr.label || '',
        miejsce_dostawy: md.value || md.label || '',
        dane_do_awizacji: String(awizacja || '').trim(),
        data_zaladunku: formatDateForDoc(dataVal)
      });
      var out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      saveAs(out, buildDocxDownloadName(zal.nazwaSkrocona || zal.nazwaPelna, dataVal, zal.adres));
      if (opts.closeModal !== false) closeDocModal();
    }
    function collectSharedForm() {
      return {
        pr: resolvePodwyko('doc-val-przewoznik', 'doc-sel-przewoznik'),
        md: resolvePodwyko('doc-val-miejsce', 'doc-sel-miejsce'),
        dataVal: document.getElementById('doc-inp-data').value,
        awizacja: document.getElementById('doc-inp-awizacja').value,
        stawka: document.getElementById('doc-inp-stawka').value,
        zbiorka: document.getElementById('doc-sel-zbiorka').value,
        worki: document.getElementById('doc-inp-worki').value,
        transport: document.getElementById('doc-inp-transport').value
      };
    }
    function buildFormatkaPayload(zal, shared, numerOverride) {
      return {
        numer: numerOverride != null ? numerOverride : '',
        numerFaktury: '',
        stawka: String(shared.stawka || '').trim(),
        czyProtokolZrobiony: 'tak',
        adresOdbioru: zal.adres || '',
        nazwaKontrahenta: zal.nazwaPelna || '',
        dataOdbioru: formatDateForDoc(shared.dataVal),
        ktoOdbiera: shared.pr.label || '',
        miejsceZrzutu: shared.md.label || '',
        rodzajZbiorki: String(shared.zbiorka || '').trim(),
        ileWorkow: String(shared.worki || '').trim(),
        rodzajTransportu: String(shared.transport || '').trim(),
        awizacja: String(shared.awizacja || '').trim(),
        znacznikMiejsca: ''
      };
    }
    function delayMs(ms) {
      return new Promise(function(resolve) { window.setTimeout(resolve, ms); });
    }
    function generateDocxLocal() {
      if (!wordDocEnabled) return;
      if (window.__docModalMode === 'bulk') {
        runBulkDocGenerate();
        return;
      }
      var btn = document.getElementById('doc-btn-generate');
      if (btn) btn.disabled = true;
      var zal = resolveZaladunek();
      var shared = collectSharedForm();
      var numerEl = document.getElementById('doc-inp-numer');
      var numerWpisany = numerEl ? String(numerEl.value).trim() : '';

      ensureDocxLibrariesLoaded().then(function() {
        if (!WEBAPP_URL) {
          renderAndDownloadDocx(zal, shared.pr, shared.md, shared.dataVal, shared.awizacja, numerWpisany);
          return;
        }
        var manual = numerWpisany && numerWpisany !== String(window.__docPreviewNumer || '');
        var payload = buildFormatkaPayload(zal, shared, manual ? numerWpisany : '');
        return appendFormatkaRow(payload).then(function(resp) {
          if (!resp || !resp.ok) {
            alert('Nie udało się zapisać wiersza w arkuszu: ' + (resp && resp.error ? resp.error : 'błąd API'));
            return;
          }
          var numer = String(resp.numer || numerWpisany || '');
          if (numerEl) numerEl.value = numer;
          renderAndDownloadDocx(zal, shared.pr, shared.md, shared.dataVal, shared.awizacja, numer);
        });
      }).catch(function(err) {
        console.error(err);
        alert('Nie udało się wygenerować / zapisać (biblioteki Word, sieć lub Web App).');
      }).finally(function() {
        if (btn) btn.disabled = false;
      });
    }
    function runBulkDocGenerate() {
      var indices = window.__bulkDocLoadIdxs || [];
      if (indices.length === 0) {
        alert('Brak zaznaczonych punktów.');
        return;
      }
      var btn = document.getElementById('doc-btn-generate');
      var hint = document.getElementById('doc-modal-hint');
      var shared = collectSharedForm();
      if (btn) btn.disabled = true;
      ensureDocxLibrariesLoaded().then(function() {
        var generated = 0;
        var failed = 0;
        var chain = Promise.resolve();
        indices.forEach(function(loadIdx, jobIdx) {
          chain = chain.then(function() {
            var zal = LOAD_POINTS[loadIdx];
            if (!zal) return Promise.resolve();
            if (hint) {
              hint.textContent = 'Generowanie ' + (jobIdx + 1) + ' / ' + indices.length + ': ' +
                (zal.nazwaSkrocona || zal.nazwaPelna);
            }
            if (!WEBAPP_URL) {
              renderAndDownloadDocx(zal, shared.pr, shared.md, shared.dataVal, shared.awizacja, '', { closeModal: false });
              generated += 1;
              return delayMs(400);
            }
            return appendFormatkaRow(buildFormatkaPayload(zal, shared, '')).then(function(resp) {
              if (!resp || !resp.ok) {
                throw new Error(resp && resp.error ? resp.error : 'błąd API');
              }
              renderAndDownloadDocx(
                zal, shared.pr, shared.md, shared.dataVal, shared.awizacja,
                String(resp.numer || ''),
                { closeModal: false }
              );
              generated += 1;
              return delayMs(450);
            });
          }).catch(function(err) {
            console.error(err);
            failed += 1;
          });
        });
        return chain.then(function() {
          clearBulkSelection();
          closeDocModal();
          if (failed > 0) {
            alert('Hurt: zapisano/pobrano ' + generated + ', błędy: ' + failed + '.');
          }
        });
      }).catch(function(err) {
        console.error(err);
        alert('Nie udało się uruchomić generacji hurtowej.');
      }).finally(function() {
        if (btn) btn.disabled = false;
      });
    }
    document.getElementById('doc-btn-cancel').addEventListener('click', closeDocModal);
    document.getElementById('doc-btn-generate').addEventListener('click', generateDocxLocal);
    document.getElementById('doc-modal').addEventListener('click', function(ev) {
      if (ev.target === this) closeDocModal();
    });
  `;
}
