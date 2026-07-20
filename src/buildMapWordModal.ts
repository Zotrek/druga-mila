/**
 * Fragmenty HTML/CSS/JS modala Word (osadzane w buildMapHtml).
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
    .popup-actions { margin-top: 10px; }
    .popup-actions button { padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #0d6efd; background: #0d6efd; color: #fff; cursor: pointer; }
  `;
}

export function wordModalHtml(): string {
  return `  <div id="doc-modal" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="doc-modal-title">
      <h3 id="doc-modal-title">Generuj protokół Word</h3>
      <label for="doc-sel-zaladunek">Miejsce załadunku</label>
      <div class="doc-combobox-wrap">
        <input type="text" id="doc-sel-zaladunek" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Nazwa skrócona / pełna / adres…" />
        <input type="hidden" id="doc-val-zaladunek" value="" />
        <ul id="doc-sel-zaladunek-list" class="doc-combobox-list" role="listbox" hidden></ul>
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
      <label for="doc-inp-numer">Numer zlecenia</label>
      <input type="text" id="doc-inp-numer" maxlength="120" placeholder="podgląd / auto" autocomplete="off" />
      <p class="doc-modal-hint" id="doc-modal-hint">Pola opcjonalne. Bez Web App: Word lokalnie, bez auto-numeru.</p>
      <div class="doc-modal-actions">
        <button type="button" id="doc-btn-cancel">Anuluj</button>
        <button type="button" id="doc-btn-generate" class="primary">Pobierz .docx</button>
      </div>
    </div>
  </div>
`;
}

/** Skrypt przeglądarkowy — modal, comboboxy, Word (bez POST w Fazie 5 checkpoint). */
export function wordModalBrowserScript(): string {
  return `
    function openDocModal(prefillIdx) {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled) return;
      resetDocModal();
      if (typeof prefillIdx === 'number' && LOAD_POINTS[prefillIdx]) {
        selectZaladunek(prefillIdx);
      }
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      previewNumerFromApi();
    }
    function closeDocModal() {
      var m = document.getElementById('doc-modal');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
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
    function previewNumerFromApi() {
      var numerEl = document.getElementById('doc-inp-numer');
      var hint = document.getElementById('doc-modal-hint');
      if (!WEBAPP_URL) {
        if (hint) hint.textContent = 'Brak Web App — Word lokalnie, wpisz numer ręcznie lub zostaw pusty.';
        return;
      }
      if (hint) hint.textContent = 'Pobieranie podglądu numeru…';
      fetch(WEBAPP_URL + '?action=modalData')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.ok && data.numer && numerEl && !String(numerEl.value).trim()) {
            numerEl.value = String(data.numer);
          }
          if (hint) hint.textContent = 'Pola opcjonalne. Numer z podglądu — zapis do Sheets przy generacji (Faza 6).';
        })
        .catch(function() {
          if (hint) hint.textContent = 'Nie udało się pobrać numeru — możesz wpisać ręcznie.';
        });
    }
    function generateDocxLocal() {
      if (!wordDocEnabled) return;
      var btn = document.getElementById('doc-btn-generate');
      if (btn) btn.disabled = true;
      ensureDocxLibrariesLoaded().then(function() {
        var zal = resolveZaladunek();
        var pr = resolvePodwyko('doc-val-przewoznik', 'doc-sel-przewoznik');
        var md = resolvePodwyko('doc-val-miejsce', 'doc-sel-miejsce');
        var dataVal = document.getElementById('doc-inp-data').value;
        var awizacja = document.getElementById('doc-inp-awizacja').value;
        var numer = document.getElementById('doc-inp-numer').value;
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
        closeDocModal();
      }).catch(function(err) {
        console.error(err);
        alert('Nie udało się wygenerować Word (biblioteki lub szablon).');
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
