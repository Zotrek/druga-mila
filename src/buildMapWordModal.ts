/**
 * Fragmenty HTML/CSS/JS modala Word + multi-select / hurt / protokół łączony
 * (osadzane w buildMapHtml).
 */

export interface WordMapEmbed {
  templateBase64: string;
  /** Przewoźnik — z docs/podwyko lista.xlsx. */
  podwykoOptions: Array<{ label: string; value: string }>;
  /**
   * Miejsce dostawy — z arkusza Rozładunek (data/druga-mila.xlsx).
   * label = nazwa skrócona (UI); value = nazwa pełna + adres (Word).
   * Gdy brak / puste, modal używa podwykoOptions jako fallback.
   */
  deliveryOptions?: Array<{ label: string; value: string }>;
  loadPoints: Array<{
    nazwaPelna: string;
    nazwaSkrocona: string;
    adres: string;
    /** Kolumna D z Załadunek (CD / PLAC / puste) → formatka „znacznik miejsca”. */
    typ: string;
  }>;
}

/** Kolor pinezki zaznaczonej do hurtu. */
export const COLOR_BULK_SELECTED = '#ea3aed';
/** Kolor pinezki zaznaczonej do protokołu łączonego. */
export const COLOR_COMBINED_SELECTED = '#b45309';

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
    .doc-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; flex-wrap: wrap; }
    .doc-modal-actions button { padding: 8px 14px; border-radius: 6px; border: 1px solid #ccc; background: #f8f8f8; cursor: pointer; font-size: 14px; }
    .doc-modal-actions button.primary { background: #0d6efd; color: #fff; border-color: #0d6efd; }
    .doc-modal-actions button.excel { background: #198754; color: #fff; border-color: #198754; }
    .doc-modal-actions button:disabled { opacity: 0.7; cursor: wait; }
    .doc-modal-actions button.primary.is-busy,
    .doc-modal-actions button.excel.is-busy { position: relative; padding-left: 34px; }
    .doc-modal-actions button.primary.is-busy::before,
    .doc-modal-actions button.excel.is-busy::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 50%;
      width: 14px;
      height: 14px;
      margin-top: -7px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: doc-spin 0.7s linear infinite;
    }
    @keyframes doc-spin { to { transform: rotate(360deg); } }
    .doc-modal-hint { font-size: 11px; color: #666; margin-top: 8px; }
    .doc-modal-hint.is-busy { color: #0d6efd; font-weight: 600; }
    .doc-date-row { display: flex; gap: 8px; align-items: center; }
    .doc-date-cal-btn { width: 38px; height: 38px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; padding: 0; border: 1px solid #ccc; border-radius: 6px; background: #f8f8f8; color: #333; cursor: pointer; }
    .doc-date-cal-btn:hover { background: #eee; }
    .doc-date-picker-hidden { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; overflow: hidden; clip: rect(0,0,0,0); }
    .doc-date-range { margin-top: 2px; display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
    .doc-date-range-field { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .doc-date-range-field > span { font-size: 11px; font-weight: 600; color: #555; }
    .doc-date-range-field .doc-date-row { width: 100%; }
    .doc-date-range-field input[type="text"] { width: 110px; padding: 6px 8px; font-size: 13px; }
    .doc-date-range-hint { font-size: 11px; color: #666; margin: 4px 0 0; width: 100%; }
    .doc-bulk-points-wrap { margin-top: 8px; max-height: 160px; overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 6px; padding: 8px 10px; background: #fafafa; }
    .doc-bulk-points-title { font-size: 12px; font-weight: 600; margin: 0 0 6px; color: #333; }
    .doc-bulk-points-list { margin: 0; padding: 0 0 0 16px; font-size: 12px; color: #444; line-height: 1.45; }
    .doc-bulk-numer-info { font-size: 12px; color: #0d6efd; margin: 8px 0 0; min-height: 1.2em; }
    .popup-actions { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
    .popup-actions button { padding: 6px 10px; font-size: 13px; border-radius: 6px; border: 1px solid #0d6efd; background: #0d6efd; color: #fff; cursor: pointer; }
    .popup-actions button:disabled { opacity: 0.45; cursor: not-allowed; }
    .popup-bulk-select { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; color: #333; margin: 0; font-weight: 400; }
    .popup-bulk-select input { margin: 0; flex-shrink: 0; }
    .map-manual-gen-wrap { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8e8e8; display: flex; flex-direction: column; gap: 6px; }
    .map-manual-generate { width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #0d6efd; background: #0d6efd; color: #fff; cursor: pointer; }
    .map-manual-generate:hover { filter: brightness(1.05); }
    .map-manual-bulk-generate { width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #198754; background: #198754; color: #fff; cursor: pointer; }
    .map-manual-bulk-generate:hover { filter: brightness(1.05); }
    .map-manual-combined-generate { width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #b45309; background: #b45309; color: #fff; cursor: pointer; }
    .map-manual-combined-generate:hover { filter: brightness(1.05); }
    .map-planowane-generate { width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #6f42c1; background: #6f42c1; color: #fff; cursor: pointer; }
    .map-planowane-generate:hover { filter: brightness(1.05); }
    .map-harmonogram-generate { width: 100%; padding: 8px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #0d9488; background: #0d9488; color: #fff; cursor: pointer; }
    .map-harmonogram-generate:hover { filter: brightness(1.05); }
    .planowane-list { margin-top: 8px; max-height: min(360px, 55vh); overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 6px; padding: 6px 8px; background: #fafafa; }
    .planowane-list-item { display: flex; flex-direction: column; gap: 2px; width: 100%; text-align: left; padding: 8px 10px; margin: 0 0 6px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 12px; color: #333; }
    .planowane-list-item:hover { background: #f3eef9; border-color: #6f42c1; }
    .planowane-list-item strong { font-size: 13px; }
    .planowane-list-meta { color: #666; font-size: 11px; }
    .planowane-list-empty { font-size: 12px; color: #666; margin: 8px 0; }
    #harmonogram-picker .planowane-list-item:hover { background: #e6f7f5; border-color: #0d9488; }
    .harm-dates-list { margin-top: 6px; max-height: min(220px, 40vh); overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 6px; padding: 6px 8px; background: #fafafa; }
    .harm-dates-list-row { display: flex; gap: 8px; align-items: center; margin: 0 0 6px; }
    .harm-dates-list-row input { flex: 1; min-width: 0; padding: 6px 8px; font-size: 13px; border: 1px solid #ccc; border-radius: 6px; }
    .harm-dates-list-row button { flex-shrink: 0; padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #ccc; background: #f8f8f8; cursor: pointer; }
    .harm-weekday-group { margin-top: 4px; display: flex; flex-direction: column; gap: 4px; border: 1px solid #e8e8e8; border-radius: 6px; padding: 8px 10px; background: #fafafa; }
    .harm-weekday-group label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 400; color: #333; margin: 0; cursor: pointer; }
    .harm-weekday-group input { margin: 0; flex-shrink: 0; }
    .doc-modal-actions button.harm-secondary { background: #0d9488; color: #fff; border-color: #0d9488; }
    .doc-modal-actions button.secondary { background: #6f42c1; color: #fff; border-color: #6f42c1; }
    .doc-modal-actions button.danger { background: #f8f8f8; color: #b02a37; border-color: #dc3545; }
    .manual-bulk-list { margin-top: 8px; max-height: min(320px, 50vh); overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 6px; padding: 6px 8px; background: #fafafa; }
    .manual-bulk-list label { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; font-weight: 400; color: #333; margin: 0; padding: 4px 2px; cursor: pointer; }
    .manual-bulk-list label:hover { background: #eef5ff; border-radius: 4px; }
    .manual-bulk-list input { margin: 2px 0 0; flex-shrink: 0; }
    .manual-bulk-list .manual-bulk-meta { color: #666; font-size: 11px; }
    .manual-bulk-count-hint { font-size: 12px; color: #0d6efd; margin: 8px 0 0; min-height: 1.2em; }
    .map-bulk-panel { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8e8e8; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .map-bulk-panel[hidden] { display: none !important; }
    .map-bulk-count { font-size: 12px; color: #333; flex: 1; min-width: 120px; }
    .map-bulk-generate { padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #198754; background: #198754; color: #fff; cursor: pointer; }
    .map-bulk-clear { padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #ccc; background: #f8f9fa; cursor: pointer; }
    .map-combined-generate { padding: 6px 10px; font-size: 12px; border-radius: 6px; border: 1px solid #b45309; background: #b45309; color: #fff; cursor: pointer; }
    .map-combined-generate:disabled { opacity: 0.45; cursor: not-allowed; }
  `;
}

export function wordModalHtml(): string {
  return `  <div id="manual-bulk-picker" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="manual-bulk-title">
      <h3 id="manual-bulk-title">Hurt — wybór załadunków</h3>
      <label for="manual-bulk-search">Filtr listy</label>
      <input type="search" id="manual-bulk-search" placeholder="Nazwa skrócona / pełna / adres…" autocomplete="off" spellcheck="false" />
      <div id="manual-bulk-list" class="manual-bulk-list" role="group" aria-label="Miejsca załadunku"></div>
      <p id="manual-bulk-count-hint" class="manual-bulk-count-hint" aria-live="polite">0 wybranych</p>
      <div class="doc-modal-actions">
        <button type="button" id="manual-bulk-cancel">Anuluj</button>
        <button type="button" id="manual-bulk-next" class="primary">Dalej</button>
      </div>
    </div>
  </div>
  <div id="planowane-picker" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="planowane-title">
      <h3 id="planowane-title">Planowane transporty</h3>
      <p id="planowane-status" class="doc-modal-hint" aria-live="polite">Ładowanie…</p>
      <div id="planowane-list" class="planowane-list" role="list"></div>
      <div class="doc-modal-actions">
        <button type="button" id="planowane-cancel">Zamknij</button>
        <button type="button" id="planowane-refresh" class="secondary">Odśwież</button>
      </div>
    </div>
  </div>
  <div id="harmonogram-picker" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="harmonogram-title">
      <h3 id="harmonogram-title">Harmonogram</h3>
      <p id="harmonogram-status" class="doc-modal-hint" aria-live="polite">Ładowanie…</p>
      <div id="harmonogram-list" class="planowane-list" role="list"></div>
      <div class="doc-modal-actions">
        <button type="button" id="harmonogram-cancel">Zamknij</button>
        <button type="button" id="harmonogram-refresh" class="harm-secondary">Odśwież</button>
        <button type="button" id="harmonogram-add-btn" class="primary">Dodaj nowy</button>
      </div>
    </div>
  </div>
  <div id="harmonogram-add" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="harmonogram-add-title">
      <h3 id="harmonogram-add-title">Dodaj do Harmonogramu</h3>
      <label for="harm-add-stawka">Stawka</label>
      <input type="text" id="harm-add-stawka" maxlength="80" autocomplete="off" />
      <label for="harm-add-uwagi">Uwagi</label>
      <input type="text" id="harm-add-uwagi" maxlength="200" autocomplete="off" />
      <label for="harm-add-nazwa">Nazwa kontrahenta</label>
      <div class="doc-combobox-wrap">
        <input type="text" id="harm-add-nazwa" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Nazwa skrócona / pełna / adres…" />
        <input type="hidden" id="harm-add-val-nazwa" value="" />
        <ul id="harm-add-nazwa-list" class="doc-combobox-list" role="listbox" hidden></ul>
      </div>
      <label for="harm-add-adres">Adres odbioru</label>
      <input type="text" id="harm-add-adres" maxlength="200" autocomplete="off" />
      <label for="harm-add-nazwa-ii">II Nazwa kontrahenta (opcjonalnie — łączony)</label>
      <div class="doc-combobox-wrap">
        <input type="text" id="harm-add-nazwa-ii" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Drugie miejsce — nazwa skrócona / pełna / adres…" />
        <input type="hidden" id="harm-add-val-nazwa-ii" value="" />
        <ul id="harm-add-nazwa-ii-list" class="doc-combobox-list" role="listbox" hidden></ul>
      </div>
      <label for="harm-add-adres-ii">II Adres odbioru (opcjonalnie — łączony)</label>
      <input type="text" id="harm-add-adres-ii" maxlength="200" autocomplete="off" />
      <label id="harm-add-dzien-label">Dzień odbioru</label>
      <div class="harm-weekday-group" role="group" aria-labelledby="harm-add-dzien-label">
        <label><input type="checkbox" class="harm-add-dzien-cb" value="poniedziałek" /> poniedziałek</label>
        <label><input type="checkbox" class="harm-add-dzien-cb" value="wtorek" /> wtorek</label>
        <label><input type="checkbox" class="harm-add-dzien-cb" value="środa" /> środa</label>
        <label><input type="checkbox" class="harm-add-dzien-cb" value="czwartek" /> czwartek</label>
        <label><input type="checkbox" class="harm-add-dzien-cb" value="piątek" /> piątek</label>
        <label><input type="checkbox" class="harm-add-dzien-cb" value="sobota" /> sobota</label>
        <label><input type="checkbox" class="harm-add-dzien-cb" value="niedziela" /> niedziela</label>
      </div>
      <label for="harm-add-kto">Kto odbiera</label>
      <div class="doc-combobox-wrap">
        <input type="text" id="harm-add-kto" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Wpisz fragment…" />
        <input type="hidden" id="harm-add-val-kto" value="" />
        <ul id="harm-add-kto-list" class="doc-combobox-list" role="listbox" hidden></ul>
      </div>
      <label for="harm-add-zrzut">Miejsce zrzutu</label>
      <div class="doc-combobox-wrap">
        <input type="text" id="harm-add-zrzut" class="doc-combobox-input" autocomplete="off" spellcheck="false" placeholder="Wpisz fragment…" />
        <input type="hidden" id="harm-add-val-zrzut" value="" />
        <ul id="harm-add-zrzut-list" class="doc-combobox-list" role="listbox" hidden></ul>
      </div>
      <label for="harm-add-zbiorka">Rodzaj zbiórki</label>
      <select id="harm-add-zbiorka">
        <option value="">—</option>
        <option value="manualna">manualna</option>
        <option value="automatyczna">automatyczna</option>
        <option value="manualna i automatyczna">manualna i automatyczna</option>
      </select>
      <label for="harm-add-worki">Ile worków</label>
      <input type="text" id="harm-add-worki" maxlength="40" autocomplete="off" />
      <label for="harm-add-transport">Rodzaj transportu</label>
      <input type="text" id="harm-add-transport" maxlength="80" autocomplete="off" />
      <label for="harm-add-awizacja">Awizacja</label>
      <input type="text" id="harm-add-awizacja" maxlength="120" autocomplete="off" />
      <label for="harm-add-znacznik">Znacznik miejsca</label>
      <input type="text" id="harm-add-znacznik" maxlength="40" autocomplete="off" />
      <div class="doc-modal-actions">
        <button type="button" id="harmonogram-add-cancel">Anuluj</button>
        <button type="button" id="harmonogram-add-save" class="primary">Zapisz</button>
      </div>
    </div>
  </div>
  <div id="doc-modal" class="doc-modal-overlay" style="display:none" aria-hidden="true">
    <div class="doc-modal-panel" role="dialog" aria-labelledby="doc-modal-title">
      <h3 id="doc-modal-title">Generuj protokół Word</h3>
      <div id="doc-single-numer-wrap">
        <label for="doc-inp-numer">Numer zlecenia</label>
        <input type="text" id="doc-inp-numer" maxlength="120" placeholder="podgląd / auto" autocomplete="off" />
      </div>
      <p id="doc-bulk-numer-info" class="doc-bulk-numer-info" hidden aria-live="polite"></p>
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
      <label for="doc-sel-zbiorka">Rodzaj zbiórki (tylko Google)</label>
      <select id="doc-sel-zbiorka">
        <option value="">—</option>
        <option value="manualna">manualna</option>
        <option value="automatyczna">automatyczna</option>
        <option value="manualna i automatyczna">manualna i automatyczna</option>
      </select>
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
      <label for="doc-inp-okno-awizacji">Okno awizacji (tylko Google)</label>
      <input type="text" id="doc-inp-okno-awizacji" maxlength="120" autocomplete="off" spellcheck="false" placeholder="np. 8:00–12:00" />
      <div id="doc-single-date-wrap">
        <label for="doc-inp-data-od">Data załadunku</label>
        <div class="doc-date-range" id="doc-data-range">
          <div class="doc-date-range-field">
            <span>Od</span>
            <div class="doc-date-row">
              <input type="text" id="doc-inp-data-od" maxlength="10" placeholder="dd.mm.rrrr" inputmode="numeric" autocomplete="off" spellcheck="false" />
              <button type="button" id="doc-btn-data-od-cal" class="doc-date-cal-btn" title="Kalendarz Od" aria-label="Wybierz datę załadunku Od">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm12 8H5v10h14V10zm0-4H5v2h14V6z"/>
                </svg>
              </button>
              <input type="date" id="doc-inp-data-od-picker" class="doc-date-picker-hidden" tabindex="-1" aria-hidden="true" />
            </div>
          </div>
          <div class="doc-date-range-field">
            <span>Do (opcjonalne)</span>
            <div class="doc-date-row">
              <input type="text" id="doc-inp-data-do" maxlength="10" placeholder="dd.mm.rrrr" inputmode="numeric" autocomplete="off" spellcheck="false" />
              <button type="button" id="doc-btn-data-do-cal" class="doc-date-cal-btn" title="Kalendarz Do" aria-label="Wybierz datę załadunku Do">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm12 8H5v10h14V10zm0-4H5v2h14V6z"/>
                </svg>
              </button>
              <input type="date" id="doc-inp-data-do-picker" class="doc-date-picker-hidden" tabindex="-1" aria-hidden="true" />
            </div>
          </div>
          <p class="doc-date-range-hint">Tylko Od → 13.08.2026. Od i Do → 13.08/14.08.2026 (dni nie muszą być kolejne).</p>
        </div>
      </div>
      <div id="doc-harm-dates-wrap" hidden>
        <p class="doc-bulk-points-title">Terminy w tym miesiącu</p>
        <div id="doc-harm-dates-list" class="harm-dates-list" role="list"></div>
        <div class="doc-modal-actions" style="justify-content:flex-start;margin-top:8px">
          <button type="button" id="doc-btn-harm-add-date">Dodaj datę</button>
        </div>
      </div>
      <label for="doc-inp-stawka">Stawka (tylko Google)</label>
      <input type="text" id="doc-inp-stawka" maxlength="80" autocomplete="off" />
      <label for="doc-inp-worki">Ile worków (tylko Google)</label>
      <input type="text" id="doc-inp-worki" maxlength="40" autocomplete="off" />
      <label for="doc-inp-transport">Rodzaj transportu (tylko Google)</label>
      <input type="text" id="doc-inp-transport" maxlength="80" autocomplete="off" />
      <label for="doc-inp-uwagi">Uwagi (tylko Google)</label>
      <input type="text" id="doc-inp-uwagi" maxlength="200" autocomplete="off" />
      <p class="doc-modal-hint" id="doc-modal-hint" aria-live="polite">Pola opcjonalne. Bez Web App: Word lokalnie, bez auto-numeru.</p>
      <div class="doc-modal-actions">
        <button type="button" id="doc-btn-cancel">Anuluj</button>
        <button type="button" id="doc-btn-delete-plan" class="danger" hidden>Usuń z planowanych</button>
        <button type="button" id="doc-btn-save-plan" class="secondary" hidden>Zapisz planowane</button>
        <button type="button" id="doc-btn-save-excel" class="excel" hidden>Tylko zapisz w Excelu</button>
        <button type="button" id="doc-btn-generate" class="primary">Pobierz .docx</button>
      </div>
    </div>
  </div>
`;
}

/** Skrypt przeglądarkowy — modal, comboboxy, Word, POST, hurt, protokół łączony. */
export function wordModalBrowserScript(): string {
  return `
    var COLOR_BULK_SELECTED = ${JSON.stringify(COLOR_BULK_SELECTED)};
    var COLOR_COMBINED_SELECTED = ${JSON.stringify(COLOR_COMBINED_SELECTED)};
    window.__docModalMode = 'single';
    window.__manualPickerKind = 'bulk';
    window.__bulkSelectedLoadIdxs = window.__bulkSelectedLoadIdxs || {};
    window.__combinedSelectedLoadIdxs = window.__combinedSelectedLoadIdxs || {};
    window.__bulkDocLoadIdxs = [];
    window.__realizePlan = null;
    window.__harmDates = [];
    window.__harmRow = null;

    function joinWithDash(parts) {
      return parts.map(function(p) { return String(p || '').trim(); })
        .filter(function(p) { return p.length > 0; })
        .join('-');
    }
    function joinWithAddrSep(parts) {
      return parts.map(function(p) { return String(p || '').trim(); })
        .filter(function(p) { return p.length > 0; })
        .join('; ');
    }
    function combineZnacznikMiejsca(typA, typB) {
      var a = String(typA || '').trim();
      var b = String(typB || '').trim();
      if (a && b) return a === b ? a : joinWithDash([a, b]);
      return a || b;
    }
    function combineLoadPoints(a, b) {
      var shortA = String((a && (a.nazwaSkrocona || a.nazwaPelna)) || '').trim();
      var shortB = String((b && (b.nazwaSkrocona || b.nazwaPelna)) || '').trim();
      var miejsceA = [a && a.nazwaPelna, a && a.adres].filter(Boolean).join(' ');
      var miejsceB = [b && b.nazwaPelna, b && b.adres].filter(Boolean).join(' ');
      return {
        nazwaPelna: joinWithDash([a && a.nazwaPelna, b && b.nazwaPelna]),
        nazwaSkrocona: joinWithDash([shortA, shortB]),
        adres: joinWithAddrSep([a && a.adres, b && b.adres]),
        typ: combineZnacznikMiejsca(a && a.typ, b && b.typ),
        miejsceZaladunkuWord: joinWithAddrSep([miejsceA, miejsceB])
      };
    }

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
      if (selected) {
        if (isCombinedLoadSelected(loadIdx)) {
          delete window.__combinedSelectedLoadIdxs[loadIdx];
          updateCombinedSelectionUi();
        }
        window.__bulkSelectedLoadIdxs[loadIdx] = true;
      } else {
        delete window.__bulkSelectedLoadIdxs[loadIdx];
      }
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
      refreshAllMarkerIcons();
    }
    function getCombinedSelectedLoadIdxs() {
      var out = [];
      var sel = window.__combinedSelectedLoadIdxs || {};
      Object.keys(sel).forEach(function(k) {
        if (!sel[k]) return;
        var idx = parseInt(k, 10);
        if (!isNaN(idx) && LOAD_POINTS[idx]) out.push(idx);
      });
      out.sort(function(a, b) { return a - b; });
      return out;
    }
    function isCombinedLoadSelected(loadIdx) {
      return !!(window.__combinedSelectedLoadIdxs && window.__combinedSelectedLoadIdxs[loadIdx]);
    }
    function setCombinedLoadSelected(loadIdx, selected) {
      if (!window.__combinedSelectedLoadIdxs) window.__combinedSelectedLoadIdxs = {};
      if (selected) {
        var cur = getCombinedSelectedLoadIdxs();
        if (cur.length >= 2 && !isCombinedLoadSelected(loadIdx)) {
          alert('Protokół łączony: maksymalnie 2 miejsca. Odznacz jedno, żeby dodać inne.');
          refreshPopupForLoadIdx(loadIdx);
          return false;
        }
        if (isBulkLoadSelected(loadIdx)) {
          delete window.__bulkSelectedLoadIdxs[loadIdx];
          updateBulkSelectionUi();
        }
        window.__combinedSelectedLoadIdxs[loadIdx] = true;
      } else {
        delete window.__combinedSelectedLoadIdxs[loadIdx];
      }
      updateCombinedSelectionUi();
      return true;
    }
    function clearCombinedSelection() {
      window.__combinedSelectedLoadIdxs = {};
      updateCombinedSelectionUi();
    }
    function updateCombinedSelectionUi() {
      var indices = getCombinedSelectedLoadIdxs();
      var panel = document.getElementById('map-combined-panel');
      var countEl = document.getElementById('map-combined-count');
      var genBtn = document.getElementById('map-combined-generate');
      if (panel) panel.hidden = indices.length === 0;
      if (countEl) {
        countEl.textContent = indices.length === 2
          ? '2 / 2 miejsca — gotowe'
          : (indices.length + ' / 2 miejsca zaznaczone');
      }
      if (genBtn) genBtn.disabled = indices.length !== 2;
      refreshAllMarkerIcons();
    }
    function refreshAllMarkerIcons() {
      if (typeof markerEntries === 'undefined') return;
      markerEntries.forEach(function(entry) {
        refreshMarkerIcon(entry);
      });
    }
    function refreshPopupForLoadIdx(loadIdx) {
      if (typeof markerEntries === 'undefined') return;
      var entry = markerEntries.find(function(e) { return e.loadIdx === loadIdx; });
      if (!entry || !entry.marker || !entry.p) return;
      entry.marker.setPopupContent(buildPopupHtml(entry.p, loadIdx));
      wirePopupControls(entry.marker, loadIdx);
    }
    function refreshMarkerIcon(entry) {
      if (!entry || !entry.marker) return;
      var inputEl = document.getElementById('map-address-search');
      var raw = inputEl ? inputEl.value : '';
      var hasSearch = String(raw).trim().length > 0;
      var sMatch = !hasSearch || mapPointMatchesSearchMap(entry.p, raw);
      var bulk = entry.loadIdx >= 0 && isBulkLoadSelected(entry.loadIdx);
      var combined = entry.loadIdx >= 0 && isCombinedLoadSelected(entry.loadIdx);
      var fill = combined ? COLOR_COMBINED_SELECTED : (bulk ? COLOR_BULK_SELECTED : entry.p.kolor);
      entry.marker.setIcon(pinIcon(fill, (hasSearch && sMatch) || bulk || combined));
    }
    function buildPopupHtml(p, loadIdx) {
      var typeLabel = COLOR_LABEL[p.colorKind] || p.typ || '—';
      var bulkSelected = loadIdx >= 0 && isBulkLoadSelected(loadIdx);
      var combinedSelected = loadIdx >= 0 && isCombinedLoadSelected(loadIdx);
      var multiSelected = bulkSelected || combinedSelected;
      var html =
        '<div class="popup-name">' + escapeHtmlMap(p.nazwaPelna) + '</div>' +
        '<div class="popup-short">' + escapeHtmlMap(p.nazwaSkrocona) + '</div>' +
        '<div class="popup-address">' + escapeHtmlMap(p.adres) + '</div>' +
        '<div class="popup-type">Typ: ' + escapeHtmlMap(typeLabel) + '</div>';
      if (wordDocEnabled && loadIdx >= 0) {
        html += '<div class="popup-actions">' +
          '<label class="popup-bulk-select"><input type="checkbox" class="popup-bulk-cb" data-load-idx="' + loadIdx + '"' +
          (bulkSelected ? ' checked' : '') + ' /> Zaznacz do hurtu</label>' +
          '<label class="popup-bulk-select"><input type="checkbox" class="popup-combined-cb" data-load-idx="' + loadIdx + '"' +
          (combinedSelected ? ' checked' : '') + ' /> Zaznacz do łączonego</label>' +
          '<button type="button" class="btn-gen-doc"' + (multiSelected ? ' disabled' : '') +
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
          refreshPopupForLoadIdx(loadIdx);
        };
      }
      var cbCombined = el.querySelector('.popup-combined-cb');
      if (cbCombined) {
        cbCombined.onchange = function() {
          setCombinedLoadSelected(loadIdx, cbCombined.checked);
          refreshPopupForLoadIdx(loadIdx);
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
      var isCombined = mode === 'combined';
      var isRealize = mode === 'realize';
      var isHarm = mode === 'harmonogram';
      var isSingleLike = mode === 'single' || isRealize;
      var titleEl = document.getElementById('doc-modal-title');
      var zalWrap = document.getElementById('doc-single-zaladunek-wrap');
      var bulkWrap = document.getElementById('doc-bulk-points-wrap');
      var bulkTitle = document.querySelector('#doc-bulk-points-wrap .doc-bulk-points-title');
      var numerWrap = document.getElementById('doc-single-numer-wrap');
      var bulkNumerInfo = document.getElementById('doc-bulk-numer-info');
      var dateWrap = document.getElementById('doc-single-date-wrap');
      var harmDatesWrap = document.getElementById('doc-harm-dates-wrap');
      var okBtn = document.getElementById('doc-btn-generate');
      var savePlanBtn = document.getElementById('doc-btn-save-plan');
      var saveExcelBtn = document.getElementById('doc-btn-save-excel');
      var deletePlanBtn = document.getElementById('doc-btn-delete-plan');
      var numerEl = document.getElementById('doc-inp-numer');
      var n = (window.__bulkDocLoadIdxs || []).length;
      var harmN = (window.__harmDates || []).length;
      if (titleEl) {
        if (isHarm) {
          titleEl.textContent = harmRowHasSecondLoad(window.__harmRow)
            ? 'Stały odbiór (łączony)'
            : 'Stały odbiór';
        }
        else if (isRealize) titleEl.textContent = 'Realizuj planowane';
        else if (isCombined) titleEl.textContent = 'Protokół łączony (2 miejsca)';
        else if (isBulk) titleEl.textContent = 'Generuj protokoły Word (' + n + ' punktów)';
        else titleEl.textContent = 'Generuj protokół Word';
      }
      if (zalWrap) {
        zalWrap.hidden = isBulk || isCombined || (isHarm && harmRowHasSecondLoad(window.__harmRow));
      }
      if (bulkWrap) {
        bulkWrap.hidden = !(isBulk || isCombined || (isHarm && harmRowHasSecondLoad(window.__harmRow)));
      }
      if (bulkTitle) {
        if (isCombined || (isHarm && harmRowHasSecondLoad(window.__harmRow))) {
          bulkTitle.textContent = 'Miejsca załadunku (łączone)';
        } else {
          bulkTitle.textContent = 'Wybrane punkty';
        }
      }
      if (numerWrap) numerWrap.hidden = isBulk;
      if (bulkNumerInfo) bulkNumerInfo.hidden = !isBulk && !isCombined;
      if (dateWrap) dateWrap.hidden = isHarm;
      if (harmDatesWrap) harmDatesWrap.hidden = !isHarm;
      if (okBtn) {
        if (isHarm) {
          okBtn.textContent = harmN === 1
            ? 'Pobierz .docx (1 termin)'
            : ('Pobierz .docx (' + harmN + ' terminów)');
        } else if (isBulk) okBtn.textContent = 'Pobierz wszystkie .docx';
        else if (isCombined) okBtn.textContent = 'Pobierz 2× .docx';
        else okBtn.textContent = 'Pobierz .docx';
      }
      if (savePlanBtn) {
        savePlanBtn.hidden = !isSingleLike;
        savePlanBtn.textContent = isRealize ? 'Zapisz zmiany' : 'Zapisz planowane';
      }
      if (saveExcelBtn) {
        saveExcelBtn.hidden = !WEBAPP_URL;
        if (isHarm) {
          saveExcelBtn.textContent = harmN === 1
            ? 'Tylko zapisz w Excelu (1 termin)'
            : ('Tylko zapisz w Excelu (' + harmN + ' terminów)');
        } else if (isBulk) saveExcelBtn.textContent = 'Tylko zapisz w Excelu (wszystkie)';
        else if (isCombined) saveExcelBtn.textContent = 'Tylko zapisz w Excelu';
        else saveExcelBtn.textContent = 'Tylko zapisz w Excelu';
      }
      if (deletePlanBtn) deletePlanBtn.hidden = !isRealize;
      if (numerEl) numerEl.readOnly = isRealize;
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
    /** Lista miejsc z obiektów (Harmonogram łączony — nie tylko indeksy mapy). */
    function renderNamedPointsList(points) {
      var listEl = document.getElementById('doc-bulk-points-list');
      if (!listEl) return;
      listEl.innerHTML = '';
      (points || []).forEach(function(p) {
        if (!p) return;
        var li = document.createElement('li');
        li.textContent = (p.nazwaSkrocona || p.nazwaPelna || '—') +
          (p.adres ? ' — ' + p.adres : '');
        listEl.appendChild(li);
      });
    }
    function openDocModal(prefillIdx) {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled) return;
      window.__bulkDocLoadIdxs = [];
      window.__realizePlan = null;
      window.__harmRow = null;
      window.__harmDates = [];
      setDocModalMode('single');
      resetDocModal();
      var hasPrefill = typeof prefillIdx === 'number' && LOAD_POINTS[prefillIdx];
      if (hasPrefill) {
        selectZaladunek(prefillIdx);
      }
      setDataZaladunkuValue(formatDateForDoc(defaultDateZaladunkuYmd()));
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      previewNumerFromApi();
      if (!hasPrefill) {
        var zalInp = document.getElementById('doc-sel-zaladunek');
        if (zalInp) {
          setTimeout(function() { zalInp.focus(); }, 0);
        }
      }
    }
    function openBulkDocModal(indicesOpt) {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled) return;
      var indices = (indicesOpt && indicesOpt.length) ? indicesOpt.slice() : getBulkSelectedLoadIdxs();
      if (indices.length === 0) {
        alert('Zaznacz co najmniej jeden punkt do hurtu.');
        return;
      }
      window.__bulkDocLoadIdxs = indices.slice();
      window.__realizePlan = null;
      window.__harmRow = null;
      window.__harmDates = [];
      setDocModalMode('bulk');
      resetDocModal();
      renderBulkPointsList(indices);
      setDataZaladunkuValue(formatDateForDoc(defaultDateZaladunkuYmd()));
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
    function openCombinedDocModal(indicesOpt) {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled) return;
      var indices = (indicesOpt && indicesOpt.length) ? indicesOpt.slice() : getCombinedSelectedLoadIdxs();
      if (indices.length !== 2) {
        alert('Protokół łączony wymaga dokładnie dwóch miejsc załadunku.');
        return;
      }
      if (!LOAD_POINTS[indices[0]] || !LOAD_POINTS[indices[1]]) {
        alert('Nieprawidłowy wybór miejsc załadunku.');
        return;
      }
      window.__bulkDocLoadIdxs = indices.slice();
      window.__realizePlan = null;
      window.__harmRow = null;
      window.__harmDates = [];
      setDocModalMode('combined');
      resetDocModal();
      renderBulkPointsList(indices);
      setDataZaladunkuValue(formatDateForDoc(defaultDateZaladunkuYmd()));
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      var bulkNumerInfo = document.getElementById('doc-bulk-numer-info');
      var hint = document.getElementById('doc-modal-hint');
      if (bulkNumerInfo) {
        bulkNumerInfo.textContent = 'Jeden numer DM, jeden wiersz ewidencji, dwa protokoły Word (po jednym miejscu).';
      }
      if (hint) {
        hint.textContent = 'Ewidencja: Adres1; Adres2. Word: dwa pliki z tym samym numerem — inne tylko miejsce załadunku.';
      }
      previewNumerFromApi();
    }
    window.__manualBulkPickIdxs = window.__manualBulkPickIdxs || {};
    function getManualBulkPickIdxs() {
      var out = [];
      var sel = window.__manualBulkPickIdxs || {};
      Object.keys(sel).forEach(function(k) {
        if (!sel[k]) return;
        var idx = parseInt(k, 10);
        if (!isNaN(idx) && LOAD_POINTS[idx]) out.push(idx);
      });
      out.sort(function(a, b) { return a - b; });
      return out;
    }
    function updateManualBulkCountHint() {
      var el = document.getElementById('manual-bulk-count-hint');
      if (!el) return;
      var n = getManualBulkPickIdxs().length;
      if (window.__manualPickerKind === 'combined') {
        el.textContent = n === 2 ? '2 wybrane — OK' : (n + ' / 2 wymagane');
        return;
      }
      el.textContent = n === 1 ? '1 wybrany' : (n + ' wybranych');
    }
    function syncManualPickerChrome() {
      var titleEl = document.getElementById('manual-bulk-title');
      var nextBtn = document.getElementById('manual-bulk-next');
      var isCombined = window.__manualPickerKind === 'combined';
      if (titleEl) {
        titleEl.textContent = isCombined
          ? 'Protokół łączony — wybór 2 załadunków'
          : 'Hurt — wybór załadunków';
      }
      if (nextBtn) nextBtn.textContent = 'Dalej';
      updateManualBulkCountHint();
    }
    function openManualBulkPicker() {
      window.__manualPickerKind = 'bulk';
      openManualLoadPicker();
    }
    function openManualCombinedPicker() {
      window.__manualPickerKind = 'combined';
      openManualLoadPicker();
    }
    function openManualLoadPicker() {
      var m = document.getElementById('manual-bulk-picker');
      if (!m || !wordDocEnabled) return;
      window.__manualBulkPickIdxs = {};
      var searchEl = document.getElementById('manual-bulk-search');
      if (searchEl) searchEl.value = '';
      syncManualPickerChrome();
      renderManualBulkList();
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      if (searchEl) {
        setTimeout(function() { searchEl.focus(); }, 0);
      }
    }
    function closeManualBulkPicker() {
      var m = document.getElementById('manual-bulk-picker');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
    }
    function confirmManualBulkPicker() {
      var indices = getManualBulkPickIdxs();
      if (window.__manualPickerKind === 'combined') {
        if (indices.length !== 2) {
          alert('Zaznacz dokładnie dwa miejsca załadunku.');
          return;
        }
        closeManualBulkPicker();
        openCombinedDocModal(indices);
        return;
      }
      if (indices.length === 0) {
        alert('Zaznacz co najmniej jedno miejsce załadunku.');
        return;
      }
      closeManualBulkPicker();
      openBulkDocModal(indices);
    }
    function renderManualBulkList() {
      var listEl = document.getElementById('manual-bulk-list');
      var searchEl = document.getElementById('manual-bulk-search');
      if (!listEl) return;
      var q = normQ(searchEl ? searchEl.value : '');
      listEl.innerHTML = '';
      var shown = 0;
      for (var i = 0; i < LOAD_POINTS.length; i++) {
        var p = LOAD_POINTS[i];
        if (!p) continue;
        var label = p.nazwaSkrocona || p.nazwaPelna || '';
        var hay = normQ(label + ' ' + (p.nazwaPelna || '') + ' ' + (p.adres || ''));
        if (q && hay.indexOf(q) === -1) continue;
        var row = document.createElement('label');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.dataset.loadIdx = String(i);
        cb.checked = !!(window.__manualBulkPickIdxs && window.__manualBulkPickIdxs[i]);
        cb.addEventListener('change', function() {
          var ix = parseInt(this.dataset.loadIdx, 10);
          if (!window.__manualBulkPickIdxs) window.__manualBulkPickIdxs = {};
          if (this.checked) window.__manualBulkPickIdxs[ix] = true;
          else delete window.__manualBulkPickIdxs[ix];
          updateManualBulkCountHint();
        });
        var textWrap = document.createElement('span');
        textWrap.innerHTML = escapeHtmlMap(label) +
          '<div class="manual-bulk-meta">' + escapeHtmlMap(p.adres || '') + '</div>';
        row.appendChild(cb);
        row.appendChild(textWrap);
        listEl.appendChild(row);
        shown++;
      }
      if (shown === 0) {
        var empty = document.createElement('p');
        empty.className = 'manual-bulk-meta';
        empty.textContent = 'Brak dopasowań';
        listEl.appendChild(empty);
      }
      updateManualBulkCountHint();
    }
    function closeDocModal() {
      var m = document.getElementById('doc-modal');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
      window.__docModalMode = 'single';
      window.__realizePlan = null;
      window.__harmRow = null;
      window.__harmDates = [];
      var numerEl = document.getElementById('doc-inp-numer');
      if (numerEl) numerEl.readOnly = false;
    }
    function resetDocModal() {
      ['doc-sel-zaladunek','doc-sel-przewoznik','doc-sel-miejsce','doc-inp-awizacja','doc-inp-okno-awizacji','doc-inp-stawka','doc-inp-worki','doc-inp-transport','doc-inp-uwagi','doc-inp-numer'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
      });
      ['doc-val-zaladunek','doc-val-przewoznik','doc-val-miejsce'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
      });
      var z = document.getElementById('doc-sel-zbiorka'); if (z) z.value = '';
      ['doc-inp-data-od','doc-inp-data-do','doc-inp-data-od-picker','doc-inp-data-do-picker'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
      });
      if (window.__docModalMode !== 'harmonogram') {
        window.__harmDates = [];
        var harmDatesWrap = document.getElementById('doc-harm-dates-wrap');
        if (harmDatesWrap) harmDatesWrap.hidden = true;
        var harmList = document.getElementById('doc-harm-dates-list');
        if (harmList) harmList.innerHTML = '';
      }
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
    /** Mirror src/harmonogramDates.ts — weekday parse + propose dates for browser. */
    var WEEKDAY_BY_NORM = {
      niedziela: 0, niedziele: 0,
      poniedzialek: 1, poniedzialki: 1,
      wtorek: 2, wtorki: 2,
      sroda: 3, srody: 3,
      czwartek: 4, czwartki: 4,
      piatek: 5, piatki: 5,
      sobota: 6, soboty: 6
    };
    function normalizePlDayToken(raw) {
      return String(raw || '')
        .toLowerCase()
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z]/g, '');
    }
    function parseWeekdaysFromDzienOdbioru(raw) {
      var text = String(raw || '').trim();
      if (!text) return [];
      var found = {};
      var parts = text.split(/[/;,]+|\\s+/);
      for (var pi = 0; pi < parts.length; pi++) {
        var norm = normalizePlDayToken(parts[pi].replace(/zaproponowano/gi, ''));
        if (!norm) continue;
        for (var name in WEEKDAY_BY_NORM) {
          if (!Object.prototype.hasOwnProperty.call(WEEKDAY_BY_NORM, name)) continue;
          if (norm === name || norm.indexOf(name) !== -1) {
            found[WEEKDAY_BY_NORM[name]] = true;
          }
        }
      }
      return Object.keys(found).map(function(k) { return Number(k); }).sort(function(a, b) { return a - b; });
    }
    function formatDotDateLocal(d) {
      var dd = String(d.getDate()).padStart(2, '0');
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var yyyy = d.getFullYear();
      return dd + '.' + mm + '.' + yyyy;
    }
    function datesForWeekdaysInMonth(weekdays, today) {
      if (!weekdays || !weekdays.length) return [];
      var wanted = {};
      for (var wi = 0; wi < weekdays.length; wi++) wanted[weekdays[wi]] = true;
      var base = today || new Date();
      var year = base.getFullYear();
      var month = base.getMonth();
      var startDay = base.getDate();
      var lastDay = new Date(year, month + 1, 0).getDate();
      var out = [];
      for (var day = startDay; day <= lastDay; day++) {
        var d = new Date(year, month, day);
        if (wanted[d.getDay()]) out.push(formatDotDateLocal(d));
      }
      return out;
    }
    function proposeDatesFromDzienOdbioru(raw, today) {
      return datesForWeekdaysInMonth(parseWeekdaysFromDzienOdbioru(raw), today || new Date());
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
      function() { return MIEJSCA_DOSTAWY; },
      function(it) { return it.label; },
      function(ix, it) {
        document.getElementById('doc-val-miejsce').value = String(ix);
        document.getElementById('doc-sel-miejsce').value = it.label;
      }
    );
    wireCombobox('harm-add-kto', 'harm-add-val-kto', 'harm-add-kto-list',
      function() { return PODWYKOLISTA; },
      function(it) { return it.label; },
      function(ix, it) {
        document.getElementById('harm-add-val-kto').value = String(ix);
        document.getElementById('harm-add-kto').value = it.label;
      }
    );
    wireCombobox('harm-add-zrzut', 'harm-add-val-zrzut', 'harm-add-zrzut-list',
      function() { return MIEJSCA_DOSTAWY; },
      function(it) { return it.label; },
      function(ix, it) {
        document.getElementById('harm-add-val-zrzut').value = String(ix);
        document.getElementById('harm-add-zrzut').value = it.label;
      }
    );
    wireCombobox('harm-add-nazwa', 'harm-add-val-nazwa', 'harm-add-nazwa-list',
      function() { return LOAD_POINTS; },
      function(it) { return it.nazwaSkrocona || it.nazwaPelna; },
      function(ix, it) {
        document.getElementById('harm-add-val-nazwa').value = String(ix);
        document.getElementById('harm-add-nazwa').value = it.nazwaPelna || it.nazwaSkrocona || '';
        var adresEl = document.getElementById('harm-add-adres');
        if (adresEl) adresEl.value = it.adres || '';
        var znacznikEl = document.getElementById('harm-add-znacznik');
        if (znacznikEl) znacznikEl.value = it.typ || '';
      }
    );
    wireCombobox('harm-add-nazwa-ii', 'harm-add-val-nazwa-ii', 'harm-add-nazwa-ii-list',
      function() { return LOAD_POINTS; },
      function(it) { return it.nazwaSkrocona || it.nazwaPelna; },
      function(ix, it) {
        document.getElementById('harm-add-val-nazwa-ii').value = String(ix);
        document.getElementById('harm-add-nazwa-ii').value = it.nazwaPelna || it.nazwaSkrocona || '';
        var adresIiEl = document.getElementById('harm-add-adres-ii');
        if (adresIiEl) adresIiEl.value = it.adres || '';
      }
    );

    function findBiosystemIdx() {
      for (var i = 0; i < MIEJSCA_DOSTAWY.length; i++) {
        if (String(MIEJSCA_DOSTAWY[i].label).toLowerCase() === 'biosystem') return i;
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
            var it = MIEJSCA_DOSTAWY[bi];
            document.getElementById('doc-val-miejsce').value = String(bi);
            document.getElementById('doc-sel-miejsce').value = it.label;
          }
        }
      });
    }
    var harmZbiorkaEl = document.getElementById('harm-add-zbiorka');
    if (harmZbiorkaEl) {
      harmZbiorkaEl.addEventListener('change', function() {
        var v = harmZbiorkaEl.value;
        if (v === 'manualna' || v === 'manualna i automatyczna') {
          var bi = findBiosystemIdx();
          if (bi >= 0) {
            var it = MIEJSCA_DOSTAWY[bi];
            var hz = document.getElementById('harm-add-val-zrzut');
            var hi = document.getElementById('harm-add-zrzut');
            if (hz) hz.value = String(bi);
            if (hi) hi.value = it.label;
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
    /** Jak arkusz-mapa: dz = dd.mm.rrrr, dzPlik = dd.mm.rr; zakres → 13.08/14.08.2026 */
    function formatLoadDates(dataZaladunku) {
      var s = String(dataZaladunku || '').trim();
      if (!s) return { doc: '', file: '' };
      var range = s.match(/^(\\d{1,2})\\.(\\d{1,2})\\/(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})$/);
      if (range) {
        var dd1 = String(range[1]).padStart(2, '0');
        var mm1 = String(range[2]).padStart(2, '0');
        var dd2r = String(range[3]).padStart(2, '0');
        var mm2r = String(range[4]).padStart(2, '0');
        var yyyyR = range[5];
        return {
          doc: dd1 + '.' + mm1 + '/' + dd2r + '.' + mm2r + '.' + yyyyR,
          file: dd1 + '.' + mm1 + '-' + dd2r + '.' + mm2r + '.' + yyyyR.slice(-2)
        };
      }
      var iso = s.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
      if (iso) {
        var yyyy = iso[1];
        var mm = iso[2];
        var dd = iso[3];
        var y = parseInt(yyyy, 10);
        var mo = parseInt(mm, 10) - 1;
        var d = parseInt(dd, 10);
        var chk = new Date(y, mo, d);
        if (chk.getFullYear() !== y || chk.getMonth() !== mo || chk.getDate() !== d) {
          return { doc: s, file: sanitizeFileNamePart(s) };
        }
        return { doc: dd + '.' + mm + '.' + yyyy, file: dd + '.' + mm + '.' + yyyy.slice(-2) };
      }
      var dotted = s.match(/^(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})$/);
      if (dotted) {
        var dd2 = String(dotted[1]).padStart(2, '0');
        var mm2 = String(dotted[2]).padStart(2, '0');
        var yyyy2 = dotted[3];
        return { doc: dd2 + '.' + mm2 + '.' + yyyy2, file: dd2 + '.' + mm2 + '.' + yyyy2.slice(-2) };
      }
      return { doc: s, file: sanitizeFileNamePart(s) };
    }
    function formatDateForDoc(isoOrDot) {
      return formatLoadDates(isoOrDot).doc;
    }
    function formatDateForFile(isoOrDot) {
      return formatLoadDates(isoOrDot).file;
    }
    function docDateToIso(docDate) {
      var formatted = formatLoadDates(docDate).doc;
      var m = formatted.match(/^(\\d{2})\\.(\\d{2})\\.(\\d{4})$/);
      if (!m) return '';
      return m[3] + '-' + m[2] + '-' + m[1];
    }
    /** Tylko Od → 13.08.2026; Od i Do → 13.08/14.08.2026 */
    function formatDataZaladunkuRange(odVal, doVal) {
      var left = formatLoadDates(odVal);
      if (!left.doc) return '';
      var right = formatLoadDates(doVal);
      if (!right.doc || right.doc === left.doc) return left.doc;
      var leftDm = left.doc.slice(0, 5);
      if (!/^\\d{2}\\.\\d{2}$/.test(leftDm) || !/^\\d{2}\\.\\d{2}\\.\\d{4}$/.test(right.doc)) return left.doc;
      return leftDm + '/' + right.doc;
    }
    function splitDataZaladunkuRange(value) {
      var s = String(value || '').trim();
      var range = s.match(/^(\\d{1,2})\\.(\\d{1,2})\\/(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})$/);
      if (range) {
        var yyyy = range[5];
        return {
          od: String(range[1]).padStart(2, '0') + '.' + String(range[2]).padStart(2, '0') + '.' + yyyy,
          doDate: String(range[3]).padStart(2, '0') + '.' + String(range[4]).padStart(2, '0') + '.' + yyyy
        };
      }
      return { od: formatLoadDates(s).doc, doDate: '' };
    }
    function getDataZaladunkuValue() {
      var odEl = document.getElementById('doc-inp-data-od');
      var doEl = document.getElementById('doc-inp-data-do');
      return formatDataZaladunkuRange(odEl ? odEl.value : '', doEl ? doEl.value : '');
    }
    function setDataZaladunkuValue(value) {
      var parts = splitDataZaladunkuRange(value);
      var odEl = document.getElementById('doc-inp-data-od');
      var doEl = document.getElementById('doc-inp-data-do');
      if (odEl) odEl.value = parts.od || '';
      if (doEl) doEl.value = parts.doDate || '';
      syncDateFieldPickerFromText('doc-inp-data-od', 'doc-inp-data-od-picker');
      syncDateFieldPickerFromText('doc-inp-data-do', 'doc-inp-data-do-picker');
    }
    function syncDateFieldPickerFromText(textId, pickId) {
      var textEl = document.getElementById(textId);
      var pickEl = document.getElementById(pickId);
      if (!textEl || !pickEl) return;
      var iso = docDateToIso(textEl.value);
      if (iso) pickEl.value = iso;
    }
    function syncDateFieldTextFromPicker(textId, pickId) {
      var textEl = document.getElementById(textId);
      var pickEl = document.getElementById(pickId);
      if (!textEl || !pickEl || !pickEl.value) return;
      textEl.value = formatDateForDoc(pickEl.value);
    }
    function openDateFieldCalendar(textId, pickId) {
      var pickEl = document.getElementById(pickId);
      if (!pickEl) return;
      syncDateFieldPickerFromText(textId, pickId);
      try {
        if (typeof pickEl.showPicker === 'function') {
          pickEl.showPicker();
          return;
        }
      } catch (err) { /* ignore */ }
      pickEl.focus();
      pickEl.click();
    }
    function wireDateField(textId, pickId, calBtnId) {
      var textEl = document.getElementById(textId);
      var pickEl = document.getElementById(pickId);
      var calBtn = document.getElementById(calBtnId);
      if (textEl) {
        textEl.addEventListener('blur', function() {
          var f = formatLoadDates(textEl.value).doc;
          if (f) textEl.value = f;
          syncDateFieldPickerFromText(textId, pickId);
        });
        textEl.addEventListener('change', function() { syncDateFieldPickerFromText(textId, pickId); });
      }
      if (pickEl) {
        pickEl.addEventListener('change', function() { syncDateFieldTextFromPicker(textId, pickId); });
        pickEl.addEventListener('input', function() { syncDateFieldTextFromPicker(textId, pickId); });
      }
      if (calBtn) {
        calBtn.addEventListener('click', function(ev) {
          ev.preventDefault();
          openDateFieldCalendar(textId, pickId);
        });
      }
    }
    function buildDocxDownloadName(shortName, dataVal, adres) {
      var name = sanitizeFileNamePart(shortName) || 'protokol';
      var datePart = formatDateForFile(dataVal);
      var addr = sanitizeFileNamePart(adres);
      var base = [name, datePart, addr].filter(function(x) { return x.length > 0; }).join(' ');
      if (base.length > 80) base = base.slice(0, 77).trim() + '...';
      return base + '.docx';
    }
    function resolveListEntry(list, hiddenId, inputId) {
      var hid = document.getElementById(hiddenId);
      var inp = document.getElementById(inputId);
      if (hid && hid.value !== '') {
        var ix = Number(hid.value);
        if (list[ix]) return list[ix];
      }
      var typed = inp ? String(inp.value).trim() : '';
      if (!typed) return { label: '', value: '' };
      return { label: typed, value: typed };
    }
    function resolvePodwyko(hiddenId, inputId) {
      return resolveListEntry(PODWYKOLISTA, hiddenId, inputId);
    }
    function resolveMiejsceDostawy(hiddenId, inputId) {
      return resolveListEntry(MIEJSCA_DOSTAWY, hiddenId, inputId);
    }
    function resolveZaladunek() {
      var hid = document.getElementById('doc-val-zaladunek');
      if (hid && hid.value !== '') {
        var ix = Number(hid.value);
        if (LOAD_POINTS[ix]) return LOAD_POINTS[ix];
      }
      var typed = document.getElementById('doc-sel-zaladunek');
      var t = typed ? String(typed.value).trim() : '';
      var plan = window.__realizePlan || window.__harmRow;
      if (plan) {
        return {
          nazwaPelna: plan.nazwaKontrahenta || t,
          nazwaSkrocona: t || plan.nazwaKontrahenta || '',
          adres: plan.adresOdbioru || '',
          typ: plan.znacznikMiejsca || ''
        };
      }
      return { nazwaPelna: t, nazwaSkrocona: t, adres: '', typ: '' };
    }
    window.__docPreviewNumer = '';
    function previewNumerFromApi() {
      var numerEl = document.getElementById('doc-inp-numer');
      var hint = document.getElementById('doc-modal-hint');
      window.__docPreviewNumer = '';
      if (!WEBAPP_URL) {
        if (hint) {
          if (window.__docModalMode === 'harmonogram') {
            hint.textContent = harmRowHasSecondLoad(window.__harmRow)
              ? 'Brak Web App — na termin: 2× Word (I i II), bez zapisu do Google.'
              : 'Brak Web App — Word lokalnie dla każdego terminu, bez zapisu do Google.';
          } else if (window.__docModalMode === 'combined') {
            hint.textContent = 'Brak Web App — dwa Word lokalnie (po jednym miejscu, ten sam numer), bez zapisu do Google.';
          } else {
            hint.textContent = 'Brak Web App — Word lokalnie, bez zapisu do arkusza Google.';
          }
        }
        return;
      }
      if (window.__docModalMode === 'realize') {
        if (hint) {
          hint.textContent = 'Realizacja: „Pobierz .docx” zapisze do miesiąca, wygeneruje Word i usunie z Planowane. „Tylko zapisz w Excelu” — to samo bez Worda. „Zapisz zmiany” aktualizuje plan.';
        }
        return;
      }
      if (hint) hint.textContent = 'Pobieranie podglądu numeru…';
      var action = window.__docModalMode === 'harmonogram' ? 'previewNumberHarm' : 'modalData';
      fetch(WEBAPP_URL + (WEBAPP_URL.indexOf('?') >= 0 ? '&' : '?') + 'action=' + action)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.ok && data.numer) {
            window.__docPreviewNumer = String(data.numer);
            if (numerEl && !String(numerEl.value).trim()) {
              numerEl.value = window.__docPreviewNumer;
            }
          }
          if (hint) {
            if (window.__docModalMode === 'harmonogram') {
              hint.textContent = harmRowHasSecondLoad(window.__harmRow)
                ? 'Łączony: każdy termin = 1× DMH* (Adres1; Adres2) + 2 protokoły Word. „Tylko zapisz w Excelu” — bez Worda. Harmonogram bez zmian.'
                : 'Stały odbiór: każdy termin = wiersz DMH* + .docx. „Tylko zapisz w Excelu” — bez Worda. Harmonogram bez zmian.';
            } else if (window.__docModalMode === 'combined') {
              hint.textContent = 'Oba miejsca → jeden wiersz (Adres1; Adres2) i dwa protokoły Word. „Tylko zapisz w Excelu” — tylko wiersz, bez Worda.';
            } else {
              hint.textContent = 'Pola opcjonalne. „Pobierz .docx” zapisze wiersz do formatki Google i pobierze Word. „Tylko zapisz w Excelu” — to samo bez Worda. „Zapisz planowane” tylko rezerwuje numer.';
            }
          }
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
    function findLoadIdxForPlanRow(row) {
      if (!row) return -1;
      var adres = String(row.adresOdbioru || '').trim();
      var nazwa = String(row.nazwaKontrahenta || '').trim();
      var i;
      if (adres) {
        for (i = 0; i < LOAD_POINTS.length; i++) {
          if (String(LOAD_POINTS[i].adres || '').trim() === adres) return i;
        }
      }
      if (nazwa) {
        for (i = 0; i < LOAD_POINTS.length; i++) {
          if (String(LOAD_POINTS[i].nazwaPelna || '').trim() === nazwa) return i;
        }
      }
      return -1;
    }
    /** Harmonogram z niepustym II Adres / II Nazwa → generacja jak protokół łączony. */
    function harmRowHasSecondLoad(row) {
      if (!row) return false;
      return String(row.adresOdbioruIi || '').trim() !== '' ||
        String(row.nazwaKontrahentaIi || '').trim() !== '';
    }
    /** Buduje punkt załadunku z pól Harmonogramu (dopasowanie do mapy albo tekst z arkusza). */
    function loadPointFromHarmPart(nazwa, adres, typFallback) {
      var n = String(nazwa || '').trim();
      var a = String(adres || '').trim();
      var t = String(typFallback || '').trim();
      var i;
      if (a) {
        for (i = 0; i < LOAD_POINTS.length; i++) {
          if (String(LOAD_POINTS[i].adres || '').trim() === a) return LOAD_POINTS[i];
        }
      }
      if (n) {
        for (i = 0; i < LOAD_POINTS.length; i++) {
          if (String(LOAD_POINTS[i].nazwaPelna || '').trim() === n) return LOAD_POINTS[i];
        }
      }
      return {
        nazwaPelna: n,
        nazwaSkrocona: n,
        adres: a,
        typ: t
      };
    }
    function selectListByLabel(list, hiddenId, inputId, label) {
      var target = String(label || '').trim();
      var inp = document.getElementById(inputId);
      var hid = document.getElementById(hiddenId);
      if (!target) {
        if (inp) inp.value = '';
        if (hid) hid.value = '';
        return;
      }
      for (var i = 0; i < list.length; i++) {
        if (String(list[i].label || '').trim() === target) {
          if (inp) inp.value = list[i].label;
          if (hid) hid.value = String(i);
          return;
        }
      }
      if (inp) inp.value = target;
      if (hid) hid.value = '';
    }
    function selectPodwykoByLabel(hiddenId, inputId, label) {
      selectListByLabel(PODWYKOLISTA, hiddenId, inputId, label);
    }
    function selectMiejsceDostawyByLabel(hiddenId, inputId, label) {
      selectListByLabel(MIEJSCA_DOSTAWY, hiddenId, inputId, label);
    }
    function openPlanowanePicker() {
      var m = document.getElementById('planowane-picker');
      if (!m || !wordDocEnabled) return;
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      loadPlanowaneList();
    }
    function closePlanowanePicker() {
      var m = document.getElementById('planowane-picker');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
    }
    var planowaneListSeq = 0;
    function loadPlanowaneList() {
      var statusEl = document.getElementById('planowane-status');
      var listEl = document.getElementById('planowane-list');
      if (!listEl) return;
      var seq = ++planowaneListSeq;
      listEl.innerHTML = '';
      if (!WEBAPP_URL) {
        if (statusEl) statusEl.textContent = 'Brak Web App — nie można wczytać planowanych.';
        return;
      }
      if (statusEl) statusEl.textContent = 'Ładowanie…';
      fetch(WEBAPP_URL + (WEBAPP_URL.indexOf('?') >= 0 ? '&' : '?') + 'action=listPlanowane')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (seq !== planowaneListSeq) return;
          listEl.innerHTML = '';
          if (!data || !data.ok) {
            if (statusEl) statusEl.textContent = 'Błąd API: ' + (data && data.error ? data.error : 'nieznany');
            return;
          }
          var rows = data.rows || [];
          if (statusEl) {
            statusEl.textContent = rows.length === 0
              ? 'Brak planowanych transportów.'
              : (rows.length + ' planowanych — kliknij, aby zrealizować.');
          }
          rows.forEach(function(row) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'planowane-list-item';
            btn.setAttribute('role', 'listitem');
            var title = (row.numer || '—') + ' · ' + (row.nazwaKontrahenta || row.adresOdbioru || 'bez nazwy');
            btn.innerHTML = '<strong>' + escapeHtmlMap(title) + '</strong>' +
              '<span class="planowane-list-meta">' + escapeHtmlMap(row.adresOdbioru || '') + '</span>' +
              '<span class="planowane-list-meta">' +
              escapeHtmlMap([row.dataOdbioru, row.ktoOdbiera, row.miejsceZrzutu].filter(Boolean).join(' · ')) +
              '</span>';
            btn.addEventListener('click', function() {
              closePlanowanePicker();
              openRealizeDocModal(row);
            });
            listEl.appendChild(btn);
          });
        })
        .catch(function(err) {
          if (seq !== planowaneListSeq) return;
          console.error(err);
          if (statusEl) statusEl.textContent = 'Nie udało się wczytać listy planowanych.';
        });
    }
    function openRealizeDocModal(row) {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled || !row) return;
      window.__bulkDocLoadIdxs = [];
      window.__realizePlan = row;
      window.__harmRow = null;
      window.__harmDates = [];
      setDocModalMode('realize');
      resetDocModal();
      var loadIdx = findLoadIdxForPlanRow(row);
      if (loadIdx >= 0) {
        selectZaladunek(loadIdx);
      } else {
        var zalInp = document.getElementById('doc-sel-zaladunek');
        if (zalInp) zalInp.value = row.nazwaKontrahenta || row.adresOdbioru || '';
      }
      var numerEl = document.getElementById('doc-inp-numer');
      if (numerEl) numerEl.value = String(row.numer || '');
      window.__docPreviewNumer = String(row.numer || '');
      var z = document.getElementById('doc-sel-zbiorka');
      if (z) z.value = row.rodzajZbiorki || '';
      selectPodwykoByLabel('doc-val-przewoznik', 'doc-sel-przewoznik', row.ktoOdbiera);
      selectMiejsceDostawyByLabel('doc-val-miejsce', 'doc-sel-miejsce', row.miejsceZrzutu);
      var aw = document.getElementById('doc-inp-awizacja');
      if (aw) aw.value = row.awizacja || '';
      var okno = document.getElementById('doc-inp-okno-awizacji');
      if (okno) okno.value = row.oknoAwizacji || '';
      setDataZaladunkuValue(
        row.dataOdbioru
          ? formatDateForDoc(row.dataOdbioru)
          : formatDateForDoc(defaultDateZaladunkuYmd())
      );
      var stawka = document.getElementById('doc-inp-stawka');
      if (stawka) stawka.value = row.stawka || '';
      var worki = document.getElementById('doc-inp-worki');
      if (worki) worki.value = row.ileWorkow || '';
      var transport = document.getElementById('doc-inp-transport');
      if (transport) transport.value = row.rodzajTransportu || '';
      var uwagiRealize = document.getElementById('doc-inp-uwagi');
      if (uwagiRealize) uwagiRealize.value = row.uwagi || '';
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      previewNumerFromApi();
    }
    function openHarmonogramPicker() {
      var m = document.getElementById('harmonogram-picker');
      if (!m || !wordDocEnabled) return;
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      loadHarmonogramList();
    }
    function closeHarmonogramPicker() {
      var m = document.getElementById('harmonogram-picker');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
    }
    var harmonogramListSeq = 0;
    function loadHarmonogramList() {
      var statusEl = document.getElementById('harmonogram-status');
      var listEl = document.getElementById('harmonogram-list');
      if (!listEl) return;
      var seq = ++harmonogramListSeq;
      listEl.innerHTML = '';
      if (!WEBAPP_URL) {
        if (statusEl) statusEl.textContent = 'Brak Web App — nie można wczytać Harmonogramu.';
        return;
      }
      if (statusEl) statusEl.textContent = 'Ładowanie…';
      fetch(WEBAPP_URL + (WEBAPP_URL.indexOf('?') >= 0 ? '&' : '?') + 'action=listHarmonogram')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (seq !== harmonogramListSeq) return;
          listEl.innerHTML = '';
          if (!data || !data.ok) {
            if (statusEl) statusEl.textContent = 'Błąd API: ' + (data && data.error ? data.error : 'nieznany');
            return;
          }
          var rows = data.rows || [];
          if (statusEl) {
            statusEl.textContent = rows.length === 0
              ? 'Brak stałych odbiorów w Harmonogramie.'
              : (rows.length + ' stałych — kliknij, aby wygenerować.');
          }
          rows.forEach(function(row) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'planowane-list-item';
            btn.setAttribute('role', 'listitem');
            var title = (row.nazwaKontrahenta || row.adresOdbioru || 'bez nazwy') +
              (row.dzienOdbioru ? ' · ' + row.dzienOdbioru : '') +
              (harmRowHasSecondLoad(row) ? ' · łączony' : '');
            var adresMeta = row.adresOdbioru || '';
            if (harmRowHasSecondLoad(row)) {
              var a2 = String(row.adresOdbioruIi || '').trim();
              var n2 = String(row.nazwaKontrahentaIi || '').trim();
              if (a2 || n2) {
                adresMeta = (adresMeta ? adresMeta + '; ' : '') + (a2 || n2);
              }
            }
            btn.innerHTML = '<strong>' + escapeHtmlMap(title) + '</strong>' +
              '<span class="planowane-list-meta">' + escapeHtmlMap(adresMeta) + '</span>' +
              '<span class="planowane-list-meta">' +
              escapeHtmlMap([row.ktoOdbiera, row.miejsceZrzutu, row.rodzajZbiorki].filter(Boolean).join(' · ')) +
              '</span>';
            btn.addEventListener('click', function() {
              closeHarmonogramPicker();
              openHarmonogramDocModal(row);
            });
            listEl.appendChild(btn);
          });
        })
        .catch(function(err) {
          if (seq !== harmonogramListSeq) return;
          console.error(err);
          if (statusEl) statusEl.textContent = 'Nie udało się wczytać listy Harmonogramu.';
        });
    }
    function syncHarmDatesFromInputs() {
      var listEl = document.getElementById('doc-harm-dates-list');
      if (!listEl) return;
      var inputs = listEl.querySelectorAll('input[type="text"]');
      var next = [];
      for (var i = 0; i < inputs.length; i++) {
        next.push(String(inputs[i].value || '').trim());
      }
      window.__harmDates = next;
    }
    function updateHarmGenerateButtonLabel() {
      if (window.__docModalMode !== 'harmonogram') return;
      var okBtn = document.getElementById('doc-btn-generate');
      var excelBtn = document.getElementById('doc-btn-save-excel');
      var n = (window.__harmDates || []).filter(function(d) { return String(d || '').trim(); }).length;
      if (okBtn) {
        okBtn.textContent = n === 1
          ? 'Pobierz .docx (1 termin)'
          : ('Pobierz .docx (' + n + ' terminów)');
      }
      if (excelBtn && WEBAPP_URL) {
        excelBtn.textContent = n === 1
          ? 'Tylko zapisz w Excelu (1 termin)'
          : ('Tylko zapisz w Excelu (' + n + ' terminów)');
      }
    }
    function renderHarmDatesList() {
      var listEl = document.getElementById('doc-harm-dates-list');
      if (!listEl) return;
      listEl.innerHTML = '';
      var dates = window.__harmDates || [];
      if (dates.length === 0) {
        var empty = document.createElement('p');
        empty.className = 'planowane-list-empty';
        empty.textContent = 'Brak terminów — dodaj datę lub popraw „Dzień odbioru” w Harmonogramie.';
        listEl.appendChild(empty);
      }
      dates.forEach(function(dateStr, idx) {
        var row = document.createElement('div');
        row.className = 'harm-dates-list-row';
        row.setAttribute('role', 'listitem');
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.maxLength = 10;
        inp.placeholder = 'dd.mm.rrrr';
        inp.value = dateStr || '';
        inp.addEventListener('change', function() {
          var f = formatLoadDates(inp.value).doc;
          if (f) inp.value = f;
          syncHarmDatesFromInputs();
          updateHarmGenerateButtonLabel();
        });
        inp.addEventListener('blur', function() {
          var f = formatLoadDates(inp.value).doc;
          if (f) inp.value = f;
          syncHarmDatesFromInputs();
          updateHarmGenerateButtonLabel();
        });
        var rm = document.createElement('button');
        rm.type = 'button';
        rm.textContent = 'Usuń';
        rm.addEventListener('click', function() {
          syncHarmDatesFromInputs();
          window.__harmDates.splice(idx, 1);
          renderHarmDatesList();
          updateHarmGenerateButtonLabel();
        });
        row.appendChild(inp);
        row.appendChild(rm);
        listEl.appendChild(row);
      });
      updateHarmGenerateButtonLabel();
    }
    function addHarmDateRow() {
      syncHarmDatesFromInputs();
      if (!window.__harmDates) window.__harmDates = [];
      window.__harmDates.push(formatDateForDoc(defaultDateZaladunkuYmd()));
      renderHarmDatesList();
    }
    function openHarmonogramDocModal(row) {
      var m = document.getElementById('doc-modal');
      if (!m || !wordDocEnabled || !row) return;
      window.__bulkDocLoadIdxs = [];
      window.__realizePlan = null;
      window.__harmRow = row;
      setDocModalMode('harmonogram');
      resetDocModal();
      var isCombinedHarm = harmRowHasSecondLoad(row);
      var loadIdx = findLoadIdxForPlanRow(row);
      if (isCombinedHarm) {
        var zalA = loadPointFromHarmPart(row.nazwaKontrahenta, row.adresOdbioru, row.znacznikMiejsca);
        var zalB = loadPointFromHarmPart(row.nazwaKontrahentaIi, row.adresOdbioruIi, '');
        renderNamedPointsList([zalA, zalB]);
      } else if (loadIdx >= 0) {
        selectZaladunek(loadIdx);
      } else {
        var zalInp = document.getElementById('doc-sel-zaladunek');
        if (zalInp) zalInp.value = row.nazwaKontrahenta || row.adresOdbioru || '';
      }
      var z = document.getElementById('doc-sel-zbiorka');
      if (z) z.value = row.rodzajZbiorki || '';
      selectPodwykoByLabel('doc-val-przewoznik', 'doc-sel-przewoznik', row.ktoOdbiera);
      selectMiejsceDostawyByLabel('doc-val-miejsce', 'doc-sel-miejsce', row.miejsceZrzutu);
      var aw = document.getElementById('doc-inp-awizacja');
      if (aw) aw.value = row.awizacja || '';
      var stawka = document.getElementById('doc-inp-stawka');
      if (stawka) stawka.value = row.stawka || '';
      var worki = document.getElementById('doc-inp-worki');
      if (worki) worki.value = row.ileWorkow || '';
      var transport = document.getElementById('doc-inp-transport');
      if (transport) transport.value = row.rodzajTransportu || '';
      var uwagi = document.getElementById('doc-inp-uwagi');
      if (uwagi) uwagi.value = row.uwagi || '';
      window.__harmDates = proposeDatesFromDzienOdbioru(row.dzienOdbioru);
      renderHarmDatesList();
      setDocModalMode('harmonogram');
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
      previewNumerFromApi();
    }
    function resetHarmonogramAddForm() {
      ['harm-add-stawka','harm-add-uwagi','harm-add-adres','harm-add-nazwa','harm-add-val-nazwa',
        'harm-add-adres-ii','harm-add-nazwa-ii','harm-add-val-nazwa-ii',
        'harm-add-kto','harm-add-val-kto','harm-add-zrzut','harm-add-val-zrzut','harm-add-zbiorka',
        'harm-add-worki','harm-add-transport','harm-add-awizacja','harm-add-znacznik'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
      });
      document.querySelectorAll('.harm-add-dzien-cb').forEach(function(cb) {
        cb.checked = false;
      });
    }
    function collectHarmAddDzienOdbioru() {
      var days = [];
      document.querySelectorAll('.harm-add-dzien-cb:checked').forEach(function(cb) {
        var v = String(cb.value || '').trim();
        if (v) days.push(v);
      });
      return days.join('/');
    }
    function openHarmonogramAddForm() {
      var m = document.getElementById('harmonogram-add');
      if (!m || !wordDocEnabled) return;
      resetHarmonogramAddForm();
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
    }
    function closeHarmonogramAddForm() {
      var m = document.getElementById('harmonogram-add');
      if (!m) return;
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
    }
    function submitHarmonogramAddForm() {
      if (!WEBAPP_URL) {
        alert('Dodanie do Harmonogramu wymaga Web App (DRUGA_MILA_WEBAPP_URL).');
        return;
      }
      var pr = resolvePodwyko('harm-add-val-kto', 'harm-add-kto');
      var md = resolveMiejsceDostawy('harm-add-val-zrzut', 'harm-add-zrzut');
      var nazwaHid = document.getElementById('harm-add-val-nazwa');
      var nazwaInp = document.getElementById('harm-add-nazwa');
      var nazwaKontrahenta = nazwaInp ? String(nazwaInp.value).trim() : '';
      var adresOdbioru = (document.getElementById('harm-add-adres') || {}).value || '';
      var znacznikMiejsca = (document.getElementById('harm-add-znacznik') || {}).value || '';
      if (nazwaHid && nazwaHid.value !== '' && LOAD_POINTS[Number(nazwaHid.value)]) {
        var lp = LOAD_POINTS[Number(nazwaHid.value)];
        nazwaKontrahenta = lp.nazwaPelna || lp.nazwaSkrocona || nazwaKontrahenta;
        if (!String(adresOdbioru).trim()) adresOdbioru = lp.adres || '';
        if (!String(znacznikMiejsca).trim()) znacznikMiejsca = lp.typ || '';
      }
      var nazwaIiHid = document.getElementById('harm-add-val-nazwa-ii');
      var nazwaIiInp = document.getElementById('harm-add-nazwa-ii');
      var nazwaKontrahentaIi = nazwaIiInp ? String(nazwaIiInp.value).trim() : '';
      var adresOdbioruIi = (document.getElementById('harm-add-adres-ii') || {}).value || '';
      if (nazwaIiHid && nazwaIiHid.value !== '' && LOAD_POINTS[Number(nazwaIiHid.value)]) {
        var lpIi = LOAD_POINTS[Number(nazwaIiHid.value)];
        nazwaKontrahentaIi = lpIi.nazwaPelna || lpIi.nazwaSkrocona || nazwaKontrahentaIi;
        if (!String(adresOdbioruIi).trim()) adresOdbioruIi = lpIi.adres || '';
      }
      var payload = {
        mode: 'addHarmonogram',
        stawka: (document.getElementById('harm-add-stawka') || {}).value || '',
        uwagi: (document.getElementById('harm-add-uwagi') || {}).value || '',
        adresOdbioru: adresOdbioru,
        nazwaKontrahenta: nazwaKontrahenta,
        adresOdbioruIi: adresOdbioruIi,
        nazwaKontrahentaIi: nazwaKontrahentaIi,
        dzienOdbioru: collectHarmAddDzienOdbioru(),
        ktoOdbiera: pr.label || ((document.getElementById('harm-add-kto') || {}).value || ''),
        miejsceZrzutu: md.label || ((document.getElementById('harm-add-zrzut') || {}).value || ''),
        rodzajZbiorki: (document.getElementById('harm-add-zbiorka') || {}).value || '',
        ileWorkow: (document.getElementById('harm-add-worki') || {}).value || '',
        rodzajTransportu: (document.getElementById('harm-add-transport') || {}).value || '',
        awizacja: (document.getElementById('harm-add-awizacja') || {}).value || '',
        znacznikMiejsca: znacznikMiejsca
      };
      if (!String(payload.nazwaKontrahenta).trim() && !String(payload.adresOdbioru).trim()) {
        alert('Podaj nazwę kontrahenta lub adres odbioru.');
        return;
      }
      var btn = document.getElementById('harmonogram-add-save');
      if (btn) btn.disabled = true;
      appendFormatkaRow(payload).then(function(resp) {
        if (!resp || !resp.ok) {
          alert('Nie udało się dodać do Harmonogramu: ' + (resp && resp.error ? resp.error : 'błąd API'));
          return;
        }
        closeHarmonogramAddForm();
        loadHarmonogramList();
      }).catch(function(err) {
        console.error(err);
        alert('Nie udało się dodać do Harmonogramu (sieć / Web App).');
      }).finally(function() {
        if (btn) btn.disabled = false;
      });
    }
    function runHarmonogramDocGenerate(options) {
      var opts = options || {};
      var skipWord = !!opts.skipWord;
      if (skipWord && !WEBAPP_URL) {
        alert('Zapis w Excelu wymaga Web App (DRUGA_MILA_WEBAPP_URL).');
        return;
      }
      syncHarmDatesFromInputs();
      var dates = (window.__harmDates || []).map(function(d) {
        return formatDateForDoc(d);
      }).filter(function(d) { return d; });
      if (dates.length === 0) {
        alert('Dodaj co najmniej jedną datę odbioru.');
        return;
      }
      var harmRow = window.__harmRow;
      var isCombinedHarm = harmRowHasSecondLoad(harmRow);
      var zalA = null;
      var zalB = null;
      var zalSheet;
      if (isCombinedHarm) {
        zalA = loadPointFromHarmPart(
          harmRow.nazwaKontrahenta, harmRow.adresOdbioru, harmRow.znacznikMiejsca
        );
        zalB = loadPointFromHarmPart(
          harmRow.nazwaKontrahentaIi, harmRow.adresOdbioruIi, ''
        );
        zalSheet = combineLoadPoints(zalA, zalB);
      } else {
        zalSheet = resolveZaladunek();
      }
      var shared = collectSharedForm();
      var numerEl = document.getElementById('doc-inp-numer');
      var statusLabel = skipWord
        ? ('Zapis stałego odbioru do Excela (' + dates.length + ' terminów)…')
        : (isCombinedHarm
          ? ('Generowanie stałego odbioru łączonego (' + dates.length + ' terminów × 2 Word)…')
          : ('Generowanie stałego odbioru (' + dates.length + ' terminów)…'));
      setDocGenerateBusy(true, statusLabel, skipWord ? 'Zapisywanie…' : 'Generowanie…');
      var startChain = skipWord ? Promise.resolve() : ensureDocxLibrariesLoaded();
      startChain.then(function() {
        var generated = 0;
        var failed = 0;
        var chain = Promise.resolve();
        dates.forEach(function(dateVal, jobIdx) {
          chain = chain.then(function() {
            updateDocGenerateStatus(
              (skipWord ? 'Zapis ' : 'Generowanie ') + (jobIdx + 1) + ' / ' + dates.length + ': ' + dateVal
            );
            var sharedForDate = {
              pr: shared.pr,
              md: shared.md,
              dataVal: dateVal,
              awizacja: shared.awizacja,
              oknoAwizacji: shared.oknoAwizacji,
              stawka: shared.stawka,
              zbiorka: shared.zbiorka,
              worki: shared.worki,
              transport: shared.transport,
              uwagi: shared.uwagi
            };
            function downloadWordsForDate(numer) {
              if (skipWord) {
                generated += 1;
                return Promise.resolve();
              }
              if (isCombinedHarm) {
                var wordChain = Promise.resolve();
                [zalA, zalB].forEach(function(p, wIdx) {
                  wordChain = wordChain.then(function() {
                    updateDocGenerateStatus(
                      'Termin ' + (jobIdx + 1) + '/' + dates.length +
                      ' — protokół ' + (wIdx + 1) + '/2: ' +
                      (p.nazwaSkrocona || p.nazwaPelna)
                    );
                    renderAndDownloadDocx(
                      p, shared.pr, shared.md, dateVal, shared.awizacja, numer,
                      { closeModal: false }
                    );
                    return delayMs(450);
                  });
                });
                return wordChain.then(function() {
                  generated += 1;
                  return delayMs(200);
                });
              }
              renderAndDownloadDocx(
                zalSheet, shared.pr, shared.md, dateVal, shared.awizacja, numer,
                { closeModal: false }
              );
              generated += 1;
              return delayMs(450);
            }
            if (!WEBAPP_URL) {
              return downloadWordsForDate('');
            }
            var payload = buildFormatkaPayload(zalSheet, sharedForDate, '');
            payload.mode = 'commitHarm';
            payload.czyProtokolZrobiony = 'tak';
            return appendFormatkaRow(payload).then(function(resp) {
              if (!resp || !resp.ok) {
                throw new Error(resp && resp.error ? resp.error : 'błąd API');
              }
              var numer = String(resp.numer || '');
              if (numerEl) numerEl.value = numer;
              return downloadWordsForDate(numer);
            });
          }).catch(function(err) {
            console.error(err);
            failed += 1;
          });
        });
        return chain.then(function() {
          closeDocModal();
          if (failed > 0) {
            alert(
              (skipWord ? 'Stały odbiór (Excel): zapisano ' : 'Stały odbiór: zapisano/pobrano ') +
              generated + ', błędy: ' + failed + '.'
            );
          } else if (skipWord) {
            alert('Zapisano w Excelu: ' + generated + ' termin(ów).');
          }
        });
      }).catch(function(err) {
        console.error(err);
        alert(skipWord
          ? 'Nie udało się zapisać stałego odbioru w Excelu.'
          : 'Nie udało się uruchomić generacji stałego odbioru.');
      }).finally(function() {
        setDocGenerateBusy(false);
      });
    }
    function savePlanowaneFromModal() {
      if (!WEBAPP_URL) {
        alert('Zapisz planowane wymaga Web App (DRUGA_MILA_WEBAPP_URL).');
        return;
      }
      var isRealize = window.__docModalMode === 'realize';
      var plan = window.__realizePlan;
      if (isRealize && (!plan || !plan.rowIndex)) {
        alert('Brak wiersza planowanego do aktualizacji.');
        return;
      }
      var zal = resolveZaladunek();
      var shared = collectSharedForm();
      var numerEl = document.getElementById('doc-inp-numer');
      var numerWpisany = numerEl ? String(numerEl.value).trim() : '';
      var btn = document.getElementById('doc-btn-save-plan');
      if (btn) btn.disabled = true;
      var payload = buildFormatkaPayload(zal, shared, isRealize ? numerWpisany : (numerWpisany && numerWpisany !== String(window.__docPreviewNumer || '') ? numerWpisany : ''));
      payload.mode = isRealize ? 'updatePlan' : 'plan';
      payload.czyProtokolZrobiony = 'nie';
      if (isRealize) payload.planowaneRow = plan.rowIndex;
      appendFormatkaRow(payload).then(function(resp) {
        if (!resp || !resp.ok) {
          alert('Nie udało się zapisać planowanego: ' + (resp && resp.error ? resp.error : 'błąd API'));
          return;
        }
        var numer = String(resp.numer || numerWpisany || '');
        if (numerEl) numerEl.value = numer;
        if (isRealize && window.__realizePlan) {
          window.__realizePlan.numer = numer;
          alert('Zaktualizowano planowane (' + numer + ').');
        } else {
          alert('Zapisano w Planowane: ' + numer);
          closeDocModal();
        }
      }).catch(function(err) {
        console.error(err);
        alert('Nie udało się zapisać planowanego (sieć / Web App).');
      }).finally(function() {
        if (btn) btn.disabled = false;
      });
    }
    function deletePlanowaneFromModal() {
      if (!WEBAPP_URL) {
        alert('Usuwanie wymaga Web App.');
        return;
      }
      var plan = window.__realizePlan;
      if (!plan || !plan.rowIndex) {
        alert('Brak wiersza planowanego.');
        return;
      }
      if (!window.confirm('Usunąć ' + (plan.numer || '') + ' z Planowane? Numer wróci do puli.')) {
        return;
      }
      var btn = document.getElementById('doc-btn-delete-plan');
      if (btn) btn.disabled = true;
      appendFormatkaRow({ mode: 'deletePlan', planowaneRow: plan.rowIndex }).then(function(resp) {
        if (!resp || !resp.ok) {
          alert('Nie udało się usunąć: ' + (resp && resp.error ? resp.error : 'błąd API'));
          return;
        }
        closeDocModal();
        openPlanowanePicker();
      }).catch(function(err) {
        console.error(err);
        alert('Nie udało się usunąć planowanego.');
      }).finally(function() {
        if (btn) btn.disabled = false;
      });
    }
    function renderAndDownloadDocx(zal, pr, md, dataVal, awizacja, numer, options) {
      var opts = options || {};
      var miejsceWord = zal.miejsceZaladunkuWord
        ? String(zal.miejsceZaladunkuWord)
        : [zal.nazwaPelna, zal.adres].filter(Boolean).join(' ');
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
        md: resolveMiejsceDostawy('doc-val-miejsce', 'doc-sel-miejsce'),
        dataVal: getDataZaladunkuValue(),
        awizacja: document.getElementById('doc-inp-awizacja').value,
        oknoAwizacji: document.getElementById('doc-inp-okno-awizacji').value,
        stawka: document.getElementById('doc-inp-stawka').value,
        zbiorka: document.getElementById('doc-sel-zbiorka').value,
        worki: document.getElementById('doc-inp-worki').value,
        transport: document.getElementById('doc-inp-transport').value,
        uwagi: document.getElementById('doc-inp-uwagi').value
      };
    }
    function buildFormatkaPayload(zal, shared, numerOverride) {
      return {
        numer: numerOverride != null ? numerOverride : '',
        numerFaktury: '',
        stawka: String(shared.stawka || '').trim(),
        czyProtokolZrobiony: 'tak',
        oknoAwizacji: String(shared.oknoAwizacji || '').trim(),
        adresOdbioru: zal.adres || '',
        nazwaKontrahenta: zal.nazwaPelna || '',
        dataOdbioru: formatDateForDoc(shared.dataVal),
        ktoOdbiera: shared.pr.label || '',
        miejsceZrzutu: shared.md.label || '',
        miejsceDostawyAdres: shared.md.value || '',
        rodzajZbiorki: String(shared.zbiorka || '').trim(),
        ileWorkow: String(shared.worki || '').trim(),
        rodzajTransportu: String(shared.transport || '').trim(),
        awizacja: String(shared.awizacja || '').trim(),
        znacznikMiejsca: String(zal.typ || '').trim(),
        uwagi: String(shared.uwagi || '').trim()
      };
    }
    function delayMs(ms) {
      return new Promise(function(resolve) { window.setTimeout(resolve, ms); });
    }
    var __docGenBusyLabel = '';
    var __docExcelBusyLabel = '';
    function setDocGenerateBusy(busy, statusText, busyLabel) {
      var btn = document.getElementById('doc-btn-generate');
      var excelBtn = document.getElementById('doc-btn-save-excel');
      var savePlanBtn = document.getElementById('doc-btn-save-plan');
      var deletePlanBtn = document.getElementById('doc-btn-delete-plan');
      var hint = document.getElementById('doc-modal-hint');
      if (busy) {
        if (btn && !btn.getAttribute('data-busy')) {
          btn.setAttribute('data-busy', '1');
          __docGenBusyLabel = btn.textContent || 'Pobierz .docx';
        }
        if (excelBtn && !excelBtn.getAttribute('data-busy')) {
          excelBtn.setAttribute('data-busy', '1');
          __docExcelBusyLabel = excelBtn.textContent || 'Tylko zapisz w Excelu';
        }
        if (btn) {
          btn.disabled = true;
          btn.classList.add('is-busy');
          btn.setAttribute('aria-busy', 'true');
          btn.textContent = busyLabel || 'Generowanie…';
        }
        if (excelBtn) {
          excelBtn.disabled = true;
          if (busyLabel === 'Zapisywanie…') {
            excelBtn.classList.add('is-busy');
            excelBtn.setAttribute('aria-busy', 'true');
            excelBtn.textContent = 'Zapisywanie…';
          }
        }
        if (savePlanBtn) savePlanBtn.disabled = true;
        if (deletePlanBtn) deletePlanBtn.disabled = true;
        if (hint) {
          hint.classList.add('is-busy');
          if (statusText) hint.textContent = statusText;
        }
      } else {
        if (btn) {
          btn.classList.remove('is-busy');
          btn.removeAttribute('aria-busy');
          btn.removeAttribute('data-busy');
          if (__docGenBusyLabel) btn.textContent = __docGenBusyLabel;
          btn.disabled = false;
        }
        if (excelBtn) {
          excelBtn.classList.remove('is-busy');
          excelBtn.removeAttribute('aria-busy');
          excelBtn.removeAttribute('data-busy');
          if (__docExcelBusyLabel) excelBtn.textContent = __docExcelBusyLabel;
          excelBtn.disabled = false;
        }
        if (savePlanBtn) savePlanBtn.disabled = false;
        if (deletePlanBtn) deletePlanBtn.disabled = false;
        if (hint) hint.classList.remove('is-busy');
      }
    }
    function updateDocGenerateStatus(statusText) {
      var hint = document.getElementById('doc-modal-hint');
      if (hint && statusText) hint.textContent = statusText;
    }
    function generateDocxLocal(options) {
      var opts = options || {};
      var skipWord = !!opts.skipWord;
      if (!wordDocEnabled && !skipWord) return;
      if (skipWord && !WEBAPP_URL) {
        alert('Zapis w Excelu wymaga Web App (DRUGA_MILA_WEBAPP_URL).');
        return;
      }
      if (window.__docModalMode === 'bulk') {
        runBulkDocGenerate({ skipWord: skipWord });
        return;
      }
      if (window.__docModalMode === 'combined') {
        runCombinedDocGenerate({ skipWord: skipWord });
        return;
      }
      if (window.__docModalMode === 'harmonogram') {
        runHarmonogramDocGenerate({ skipWord: skipWord });
        return;
      }
      var zal = resolveZaladunek();
      var shared = collectSharedForm();
      var numerEl = document.getElementById('doc-inp-numer');
      var numerWpisany = numerEl ? String(numerEl.value).trim() : '';
      var isRealize = window.__docModalMode === 'realize';
      var plan = window.__realizePlan;
      setDocGenerateBusy(
        true,
        WEBAPP_URL
          ? (skipWord
            ? (isRealize ? 'Realizacja: zapisuję w Google…' : 'Zapisuję w Google Sheets…')
            : (isRealize
              ? 'Realizacja: zapisuję w Google i generuję protokół…'
              : 'Zapisuję w Google Sheets i generuję protokół…'))
          : 'Generowanie protokołu Word…',
        skipWord ? 'Zapisywanie…' : 'Generowanie…'
      );

      var startChain = skipWord ? Promise.resolve() : ensureDocxLibrariesLoaded();
      startChain.then(function() {
        updateDocGenerateStatus(WEBAPP_URL
          ? 'Łączenie z Web App / zapis w arkuszu…'
          : 'Składanie dokumentu Word…');
        if (!WEBAPP_URL) {
          renderAndDownloadDocx(zal, shared.pr, shared.md, shared.dataVal, shared.awizacja, numerWpisany);
          return;
        }
        if (isRealize) {
          if (!plan || !plan.rowIndex) {
            alert('Brak wiersza planowanego do realizacji.');
            return;
          }
          var realizePayload = buildFormatkaPayload(zal, shared, numerWpisany || String(plan.numer || ''));
          realizePayload.mode = 'realize';
          realizePayload.planowaneRow = plan.rowIndex;
          realizePayload.czyProtokolZrobiony = 'tak';
          return appendFormatkaRow(realizePayload).then(function(resp) {
            if (!resp || !resp.ok) {
              alert('Nie udało się zrealizować planowanego: ' + (resp && resp.error ? resp.error : 'błąd API'));
              return;
            }
            var numer = String(resp.numer || numerWpisany || plan.numer || '');
            if (numerEl) numerEl.value = numer;
            if (skipWord) {
              alert('Zapisano w Excelu: ' + numer);
              closeDocModal();
              return;
            }
            updateDocGenerateStatus('Pobieranie pliku .docx…');
            renderAndDownloadDocx(zal, shared.pr, shared.md, shared.dataVal, shared.awizacja, numer);
          });
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
          if (skipWord) {
            alert('Zapisano w Excelu: ' + numer);
            closeDocModal();
            return;
          }
          updateDocGenerateStatus('Pobieranie pliku .docx…');
          renderAndDownloadDocx(zal, shared.pr, shared.md, shared.dataVal, shared.awizacja, numer);
        });
      }).catch(function(err) {
        console.error(err);
        alert(skipWord
          ? 'Nie udało się zapisać w Excelu (sieć / Web App).'
          : 'Nie udało się wygenerować / zapisać (biblioteki Word, sieć lub Web App).');
      }).finally(function() {
        setDocGenerateBusy(false);
      });
    }
    function runCombinedDocGenerate(options) {
      var opts = options || {};
      var skipWord = !!opts.skipWord;
      if (skipWord && !WEBAPP_URL) {
        alert('Zapis w Excelu wymaga Web App (DRUGA_MILA_WEBAPP_URL).');
        return;
      }
      var indices = window.__bulkDocLoadIdxs || [];
      if (indices.length !== 2) {
        alert('Protokół łączony wymaga dokładnie dwóch miejsc załadunku.');
        return;
      }
      var a = LOAD_POINTS[indices[0]];
      var b = LOAD_POINTS[indices[1]];
      if (!a || !b) {
        alert('Nieprawidłowy wybór miejsc załadunku.');
        return;
      }
      var zalSheet = combineLoadPoints(a, b);
      var wordPoints = [a, b];
      var shared = collectSharedForm();
      var numerEl = document.getElementById('doc-inp-numer');
      var numerWpisany = numerEl ? String(numerEl.value).trim() : '';
      setDocGenerateBusy(
        true,
        WEBAPP_URL
          ? (skipWord
            ? 'Zapisuję w Google Sheets…'
            : 'Zapisuję w Google Sheets i generuję 2 protokoły…')
          : 'Generowanie 2 protokołów Word…',
        skipWord ? 'Zapisywanie…' : 'Generowanie…'
      );

      function downloadBothWord(numer) {
        if (skipWord) {
          clearCombinedSelection();
          closeDocModal();
          alert('Zapisano w Excelu: ' + numer);
          return Promise.resolve();
        }
        var chain = Promise.resolve();
        wordPoints.forEach(function(p, jobIdx) {
          chain = chain.then(function() {
            updateDocGenerateStatus('Pobieranie protokołu ' + (jobIdx + 1) + ' / 2: ' +
              (p.nazwaSkrocona || p.nazwaPelna));
            renderAndDownloadDocx(
              p, shared.pr, shared.md, shared.dataVal, shared.awizacja, numer,
              { closeModal: false }
            );
            return delayMs(450);
          });
        });
        return chain.then(function() {
          clearCombinedSelection();
          closeDocModal();
        });
      }

      var startChain = skipWord ? Promise.resolve() : ensureDocxLibrariesLoaded();
      startChain.then(function() {
        if (!WEBAPP_URL) {
          return downloadBothWord(numerWpisany);
        }
        updateDocGenerateStatus('Łączenie z Web App / zapis w arkuszu…');
        var manual = numerWpisany && numerWpisany !== String(window.__docPreviewNumer || '');
        var payload = buildFormatkaPayload(zalSheet, shared, manual ? numerWpisany : '');
        return appendFormatkaRow(payload).then(function(resp) {
          if (!resp || !resp.ok) {
            alert('Nie udało się zapisać wiersza w arkuszu: ' + (resp && resp.error ? resp.error : 'błąd API'));
            return;
          }
          var numer = String(resp.numer || numerWpisany || '');
          if (numerEl) numerEl.value = numer;
          return downloadBothWord(numer);
        });
      }).catch(function(err) {
        console.error(err);
        alert(skipWord
          ? 'Nie udało się zapisać w Excelu (sieć / Web App).'
          : 'Nie udało się wygenerować protokołu łączonego (biblioteki Word, sieć lub Web App).');
      }).finally(function() {
        setDocGenerateBusy(false);
      });
    }
    function runBulkDocGenerate(options) {
      var opts = options || {};
      var skipWord = !!opts.skipWord;
      if (skipWord && !WEBAPP_URL) {
        alert('Zapis w Excelu wymaga Web App (DRUGA_MILA_WEBAPP_URL).');
        return;
      }
      var indices = window.__bulkDocLoadIdxs || [];
      if (indices.length === 0) {
        alert('Brak zaznaczonych punktów.');
        return;
      }
      var shared = collectSharedForm();
      setDocGenerateBusy(
        true,
        skipWord
          ? ('Zapis hurtowy do Excela (' + indices.length + ')…')
          : ('Przygotowanie generacji hurtowej (' + indices.length + ')…'),
        skipWord ? 'Zapisywanie…' : 'Generowanie…'
      );
      var startChain = skipWord ? Promise.resolve() : ensureDocxLibrariesLoaded();
      startChain.then(function() {
        var generated = 0;
        var failed = 0;
        var chain = Promise.resolve();
        indices.forEach(function(loadIdx, jobIdx) {
          chain = chain.then(function() {
            var zal = LOAD_POINTS[loadIdx];
            if (!zal) return Promise.resolve();
            updateDocGenerateStatus(
              (skipWord ? 'Zapis ' : 'Generowanie ') + (jobIdx + 1) + ' / ' + indices.length + ': ' +
              (zal.nazwaSkrocona || zal.nazwaPelna)
            );
            if (!WEBAPP_URL) {
              renderAndDownloadDocx(zal, shared.pr, shared.md, shared.dataVal, shared.awizacja, '', { closeModal: false });
              generated += 1;
              return delayMs(400);
            }
            return appendFormatkaRow(buildFormatkaPayload(zal, shared, '')).then(function(resp) {
              if (!resp || !resp.ok) {
                throw new Error(resp && resp.error ? resp.error : 'błąd API');
              }
              if (!skipWord) {
                renderAndDownloadDocx(
                  zal, shared.pr, shared.md, shared.dataVal, shared.awizacja,
                  String(resp.numer || ''),
                  { closeModal: false }
                );
              }
              generated += 1;
              return delayMs(skipWord ? 150 : 450);
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
            alert(
              (skipWord ? 'Hurt (Excel): zapisano ' : 'Hurt: zapisano/pobrano ') +
              generated + ', błędy: ' + failed + '.'
            );
          } else if (skipWord) {
            alert('Zapisano w Excelu: ' + generated + ' wiersz(y).');
          }
        });
      }).catch(function(err) {
        console.error(err);
        alert(skipWord
          ? 'Nie udało się zapisać hurtowo w Excelu.'
          : 'Nie udało się uruchomić generacji hurtowej.');
      }).finally(function() {
        setDocGenerateBusy(false);
      });
    }
    document.getElementById('doc-btn-cancel').addEventListener('click', closeDocModal);
    document.getElementById('doc-btn-generate').addEventListener('click', function() {
      generateDocxLocal();
    });
    var saveExcelBtnEl = document.getElementById('doc-btn-save-excel');
    if (saveExcelBtnEl) {
      saveExcelBtnEl.addEventListener('click', function() {
        generateDocxLocal({ skipWord: true });
      });
    }
    var savePlanBtnEl = document.getElementById('doc-btn-save-plan');
    if (savePlanBtnEl) savePlanBtnEl.addEventListener('click', savePlanowaneFromModal);
    var deletePlanBtnEl = document.getElementById('doc-btn-delete-plan');
    if (deletePlanBtnEl) deletePlanBtnEl.addEventListener('click', deletePlanowaneFromModal);
    document.getElementById('doc-modal').addEventListener('click', function(ev) {
      if (ev.target === this) closeDocModal();
    });
    var manualBulkCancel = document.getElementById('manual-bulk-cancel');
    var manualBulkNext = document.getElementById('manual-bulk-next');
    var manualBulkSearch = document.getElementById('manual-bulk-search');
    var manualBulkPicker = document.getElementById('manual-bulk-picker');
    if (manualBulkCancel) manualBulkCancel.addEventListener('click', closeManualBulkPicker);
    if (manualBulkNext) manualBulkNext.addEventListener('click', confirmManualBulkPicker);
    if (manualBulkSearch) manualBulkSearch.addEventListener('input', renderManualBulkList);
    if (manualBulkPicker) {
      manualBulkPicker.addEventListener('click', function(ev) {
        if (ev.target === this) closeManualBulkPicker();
      });
    }
    var planowaneCancel = document.getElementById('planowane-cancel');
    var planowaneRefresh = document.getElementById('planowane-refresh');
    var planowanePicker = document.getElementById('planowane-picker');
    if (planowaneCancel) planowaneCancel.addEventListener('click', closePlanowanePicker);
    if (planowaneRefresh) planowaneRefresh.addEventListener('click', loadPlanowaneList);
    if (planowanePicker) {
      planowanePicker.addEventListener('click', function(ev) {
        if (ev.target === this) closePlanowanePicker();
      });
    }
    var harmonogramCancel = document.getElementById('harmonogram-cancel');
    var harmonogramRefresh = document.getElementById('harmonogram-refresh');
    var harmonogramAddBtn = document.getElementById('harmonogram-add-btn');
    var harmonogramPicker = document.getElementById('harmonogram-picker');
    if (harmonogramCancel) harmonogramCancel.addEventListener('click', closeHarmonogramPicker);
    if (harmonogramRefresh) harmonogramRefresh.addEventListener('click', loadHarmonogramList);
    if (harmonogramAddBtn) harmonogramAddBtn.addEventListener('click', openHarmonogramAddForm);
    if (harmonogramPicker) {
      harmonogramPicker.addEventListener('click', function(ev) {
        if (ev.target === this) closeHarmonogramPicker();
      });
    }
    var harmonogramAddCancel = document.getElementById('harmonogram-add-cancel');
    var harmonogramAddSave = document.getElementById('harmonogram-add-save');
    var harmonogramAdd = document.getElementById('harmonogram-add');
    if (harmonogramAddCancel) harmonogramAddCancel.addEventListener('click', closeHarmonogramAddForm);
    if (harmonogramAddSave) harmonogramAddSave.addEventListener('click', submitHarmonogramAddForm);
    if (harmonogramAdd) {
      harmonogramAdd.addEventListener('click', function(ev) {
        if (ev.target === this) closeHarmonogramAddForm();
      });
    }
    var harmAddDateBtn = document.getElementById('doc-btn-harm-add-date');
    if (harmAddDateBtn) harmAddDateBtn.addEventListener('click', addHarmDateRow);
    wireDateField('doc-inp-data-od', 'doc-inp-data-od-picker', 'doc-btn-data-od-cal');
    wireDateField('doc-inp-data-do', 'doc-inp-data-do-picker', 'doc-btn-data-do-cal');
  `;
}
