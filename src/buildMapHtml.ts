/**
 * Budowa statycznej mapy Leaflet: pinezki, legenda, search, filtr, modal Word.
 */

import {
  COLOR_BOLECIN,
  COLOR_CD,
  COLOR_PLAC,
  COLOR_PUSTE,
  type PointColorKind,
} from './config.js';
import {
  wordModalCss,
  wordModalHtml,
  wordModalBrowserScript,
  type WordMapEmbed,
} from './buildMapWordModal.js';

export interface MapHtmlPoint {
  nazwaPelna: string;
  nazwaSkrocona: string;
  adres: string;
  typ: string;
  colorKind: PointColorKind;
  lat: number;
  lon: number;
}

export interface BuildMapHtmlOptions {
  title?: string;
  webAppUrl?: string;
  wordEmbed?: WordMapEmbed | null;
}

export type { WordMapEmbed };

const COLOR_LABEL: Record<PointColorKind, string> = {
  cd: 'CD',
  plac: 'PLAC',
  puste: 'Puste',
  bolecin: 'Bolęcin',
};

export function buildMapHtml(
  points: MapHtmlPoint[],
  options: BuildMapHtmlOptions = {},
): string {
  const title = options.title ?? 'Druga Mila';
  const webAppUrl = options.webAppUrl ?? '';
  const wordEmbed = options.wordEmbed ?? null;
  const wordEnabled = Boolean(wordEmbed?.templateBase64);
  const payload = points.map((p) => ({
    nazwaPelna: p.nazwaPelna,
    nazwaSkrocona: p.nazwaSkrocona,
    adres: p.adres,
    typ: p.typ,
    colorKind: p.colorKind,
    lat: p.lat,
    lon: p.lon,
    kolor:
      p.colorKind === 'bolecin'
        ? COLOR_BOLECIN
        : p.colorKind === 'cd'
          ? COLOR_CD
          : p.colorKind === 'plac'
            ? COLOR_PLAC
            : COLOR_PUSTE,
  }));

  const counts = { cd: 0, plac: 0, puste: 0, bolecin: 0 };
  for (const p of points) {
    counts[p.colorKind] += 1;
  }

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; }
    #map { width: 100%; height: 100vh; }
    .leaflet-popup-content-wrapper { border-radius: 8px; }
    .leaflet-popup-content { margin: 12px 16px; min-width: 220px; }
    .popup-name { font-weight: 600; margin-bottom: 4px; color: #1a1a1a; }
    .popup-short { font-size: 0.92em; color: #333; margin-bottom: 4px; }
    .popup-address { font-size: 0.9em; color: #444; margin-bottom: 4px; }
    .popup-type { font-size: 0.85em; color: #0d6efd; margin-top: 4px; }
    .pin-dm { background: none !important; border: none !important; }
    .map-legend { background: #fff; padding: 10px 14px; border-radius: 8px; box-shadow: 0 1px 5px rgba(0,0,0,0.4); font-size: 12px; line-height: 1.5; }
    .map-legend h3 { margin: 0 0 6px 0; font-size: 13px; }
    .map-legend ul { margin: 0; padding: 0; list-style: none; }
    .map-legend li { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .map-legend li:last-child { margin-bottom: 0; }
    .map-legend .legend-swatch { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,0.2); flex-shrink: 0; }
    .map-search-panel { background: #fff; padding: 10px 12px; border-radius: 8px; box-shadow: 0 1px 5px rgba(0,0,0,0.35); min-width: 220px; max-width: min(420px, calc(100vw - 48px)); }
    .map-search-label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #333; }
    .map-search-input-row { display: flex; align-items: center; gap: 8px; }
    .map-search-input { flex: 1; min-width: 0; padding: 8px 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 6px; }
    .map-zoom-inline { display: flex; flex-direction: row; flex-shrink: 0; }
    .map-zoom-inline button { width: 32px; height: 32px; padding: 0; border: 1px solid #ccc; background: #fff; cursor: pointer; font-size: 18px; line-height: 1; color: #333; display: flex; align-items: center; justify-content: center; }
    .map-zoom-inline button:hover { background: #f4f4f4; }
    .map-zoom-inline button:first-child { border-radius: 4px 0 0 4px; border-right: none; }
    .map-zoom-inline button:last-child { border-radius: 0 4px 4px 0; }
    .map-search-status { margin-top: 6px; font-size: 11px; color: #555; min-height: 1.2em; }
    .map-type-filter { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8e8e8; }
    .map-type-filter-title { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #333; }
    .map-type-filter-options { display: flex; flex-direction: column; gap: 4px; }
    .map-type-filter-options label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #444; cursor: pointer; margin: 0; }
    .map-brand { position: absolute; z-index: 1000; left: 50%; top: 10px; transform: translateX(-50%); background: rgba(255,255,255,0.92); padding: 6px 14px; border-radius: 8px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); font-weight: 700; font-size: 14px; pointer-events: none; }
    .map-empty-banner { position: absolute; z-index: 1100; left: 50%; top: 48px; transform: translateX(-50%); background: #fff3cd; border: 1px solid #ffc107; color: #664d03; padding: 10px 16px; border-radius: 8px; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); max-width: min(420px, calc(100vw - 24px)); text-align: center; }
${wordEnabled ? wordModalCss() : ''}  </style>
</head>
<body>
  <div class="map-brand">${escapeHtml(title)}</div>
${
  points.length === 0
    ? `  <div class="map-empty-banner" role="status">Brak punktów z współrzędnymi. Sprawdź Excel Załadunek i uruchom <code>npm run generate</code>.</div>\n`
    : ''
}  <div id="map"></div>
${wordEnabled ? wordModalHtml() : ''}  <script>
    const PUNKTY = ${JSON.stringify(payload)};
    const COLOR_COUNTS = ${JSON.stringify(counts)};
    const WEBAPP_URL = ${JSON.stringify(webAppUrl)};
    const COLOR_LABEL = ${JSON.stringify(COLOR_LABEL)};
    const wordDocEnabled = ${JSON.stringify(wordEnabled)};
    const WORD_TEMPLATE_B64 = ${JSON.stringify(wordEmbed?.templateBase64 ?? '')};
    const PODWYKOLISTA = ${JSON.stringify(wordEmbed?.podwykoOptions ?? [])};
    const LOAD_POINTS = ${JSON.stringify(wordEmbed?.loadPoints ?? [])};

    const map = L.map('map', { zoomControl: false }).setView([52.1, 19.4], 6);
    var attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/attributions/">CARTO</a> | ' + attribution
    }).addTo(map);

    function pinIcon(kolor, highlight) {
      var shadow = highlight
        ? '0 0 0 3px #ea3aed, 0 1px 4px rgba(0,0,0,0.45)'
        : '0 1px 4px rgba(0,0,0,0.4)';
      return L.divIcon({
        className: 'pin-dm',
        html: '<span style="display:block;width:24px;height:24px;border-radius:50%;background:' + kolor + ';border:2px solid #fff;box-shadow:' + shadow + '"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
    }

    function normalizeForAddressSearchMap(text) {
      var s = String(text).normalize('NFD').replace(/\\p{M}/gu, '');
      s = s
        .replace(/ł/g, 'l').replace(/Ł/g, 'l')
        .replace(/ą/g, 'a').replace(/Ą/g, 'a')
        .replace(/ć/g, 'c').replace(/Ć/g, 'c')
        .replace(/ę/g, 'e').replace(/Ę/g, 'e')
        .replace(/ń/g, 'n').replace(/Ń/g, 'n')
        .replace(/ó/g, 'o').replace(/Ó/g, 'o')
        .replace(/ś/g, 's').replace(/Ś/g, 's')
        .replace(/ź/g, 'z').replace(/Ź/g, 'z')
        .replace(/ż/g, 'z').replace(/Ż/g, 'z');
      return s.toLowerCase().replace(/\\s+/g, ' ').trim();
    }

    function mapPointMatchesSearchMap(p, query) {
      var q = normalizeForAddressSearchMap(query);
      if (!q) return true;
      if (normalizeForAddressSearchMap(p.adres).indexOf(q) !== -1) return true;
      if (normalizeForAddressSearchMap(p.nazwaPelna).indexOf(q) !== -1) return true;
      if (normalizeForAddressSearchMap(p.nazwaSkrocona).indexOf(q) !== -1) return true;
      return false;
    }

    function mapPointMatchesColorFilterMap(colorKind, mode) {
      return mode === 'wszystkie' || colorKind === mode;
    }

    function escapeHtmlMap(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    var markerEntries = [];
    PUNKTY.forEach(function(p) {
      var loadIdx = -1;
      for (var li = 0; li < LOAD_POINTS.length; li++) {
        if (LOAD_POINTS[li].adres === p.adres && LOAD_POINTS[li].nazwaPelna === p.nazwaPelna) {
          loadIdx = li;
          break;
        }
      }
      var marker = L.marker([p.lat, p.lon], { icon: pinIcon(p.kolor, false) });
      marker.bindPopup(wordDocEnabled ? '' : (
        '<div class="popup-name">' + escapeHtmlMap(p.nazwaPelna) + '</div>' +
        '<div class="popup-short">' + escapeHtmlMap(p.nazwaSkrocona) + '</div>' +
        '<div class="popup-address">' + escapeHtmlMap(p.adres) + '</div>'
      ));
      marker.addTo(map);
      var entry = { p: p, marker: marker, loadIdx: loadIdx };
      markerEntries.push(entry);
      marker.on('popupopen', function() {
        if (!wordDocEnabled) return;
        marker.setPopupContent(buildPopupHtml(p, loadIdx));
        wirePopupControls(marker, loadIdx);
      });
    });

    if (markerEntries.length > 0) {
      var group = L.featureGroup(markerEntries.map(function(e) { return e.marker; }));
      map.fitBounds(group.getBounds().pad(0.08));
    }

    function getColorFilterMode() {
      var el = document.querySelector('input[name="map-type-filter"]:checked');
      return el ? el.value : 'wszystkie';
    }

    function setMarkerClickable(marker, on) {
      if (on) {
        if (marker._icon) marker._icon.style.pointerEvents = '';
        marker.options.interactive = true;
      } else {
        if (marker._icon) marker._icon.style.pointerEvents = 'none';
        marker.options.interactive = false;
      }
    }

    var searchTimer = null;
    function scheduleSearchViewport(matches) {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(function() {
        if (!matches.length) return;
        if (matches.length === 1) {
          map.setView(matches[0].getLatLng(), 16);
          return;
        }
        var g = L.featureGroup(matches);
        map.fitBounds(g.getBounds().pad(0.12), { maxZoom: 16 });
      }, 300);
    }

    function applyAddressSearch() {
      var inputEl = document.getElementById('map-address-search');
      var statusEl = document.getElementById('map-search-status');
      var raw = inputEl ? inputEl.value : '';
      var hasSearch = String(raw).trim().length > 0;
      var mode = getColorFilterMode();
      var matchMarkers = [];
      var matchCount = 0;
      var visibleCount = 0;

      markerEntries.forEach(function(entry) {
        var cMatch = mapPointMatchesColorFilterMap(entry.p.colorKind, mode);
        if (!cMatch) {
          entry.marker.setOpacity(0);
          setMarkerClickable(entry.marker, false);
          entry.marker.setIcon(pinIcon(entry.p.kolor, false));
          return;
        }
        var sMatch = mapPointMatchesSearchMap(entry.p, raw);
        if (hasSearch && !sMatch) {
          entry.marker.setOpacity(0.28);
          setMarkerClickable(entry.marker, true);
          entry.marker.setIcon(pinIcon(entry.p.kolor, false));
          return;
        }
        visibleCount++;
        if (hasSearch && sMatch) {
          matchCount++;
          matchMarkers.push(entry.marker);
        }
        entry.marker.setOpacity(1);
        setMarkerClickable(entry.marker, true);
        if (typeof refreshMarkerIcon === 'function') {
          refreshMarkerIcon(entry);
        } else {
          entry.marker.setIcon(pinIcon(entry.p.kolor, hasSearch && sMatch));
        }
      });

      if (statusEl) {
        if (hasSearch) {
          statusEl.textContent = matchCount === 0
            ? 'Brak dopasowań'
            : (matchCount === 1 ? '1 dopasowanie' : matchCount + ' dopasowań');
        } else {
          statusEl.textContent = 'Widoczne: ' + visibleCount;
        }
      }
      if (hasSearch) scheduleSearchViewport(matchMarkers);
    }

    var searchControl = L.control({ position: 'topleft' });
    searchControl.onAdd = function() {
      var wrap = L.DomUtil.create('div', 'map-search-panel');
      wrap.innerHTML =
        '<label class="map-search-label" for="map-address-search">Szukaj na mapie</label>' +
        '<div class="map-search-input-row">' +
        '<input type="search" id="map-address-search" class="map-search-input" placeholder="Nazwa lub adres…" autocomplete="off" />' +
        '<div class="map-zoom-inline">' +
        '<button type="button" id="map-zoom-in" title="Przybliż" aria-label="Przybliż">+</button>' +
        '<button type="button" id="map-zoom-out" title="Oddal" aria-label="Oddal">−</button>' +
        '</div></div>' +
        '<div id="map-search-status" class="map-search-status" role="status" aria-live="polite"></div>' +
        '<div class="map-type-filter" role="group" aria-labelledby="map-type-filter-title">' +
        '<span id="map-type-filter-title" class="map-type-filter-title">Filtr typu</span>' +
        '<div class="map-type-filter-options">' +
        '<label><input type="radio" name="map-type-filter" value="wszystkie" checked /> Wszystkie</label>' +
        '<label><input type="radio" name="map-type-filter" value="cd" /> CD</label>' +
        '<label><input type="radio" name="map-type-filter" value="plac" /> PLAC</label>' +
        '<label><input type="radio" name="map-type-filter" value="puste" /> Puste</label>' +
        '<label><input type="radio" name="map-type-filter" value="bolecin" /> Bolęcin</label>' +
        '</div></div>' +
        (wordDocEnabled
          ? '<div id="map-bulk-panel" class="map-bulk-panel" hidden>' +
            '<span id="map-bulk-count" class="map-bulk-count"></span>' +
            '<button type="button" id="map-bulk-generate" class="map-bulk-generate">Generuj hurtowo</button>' +
            '<button type="button" id="map-bulk-clear" class="map-bulk-clear">Wyczyść</button>' +
            '</div>'
          : '');
      L.DomEvent.disableClickPropagation(wrap);
      L.DomEvent.disableScrollPropagation(wrap);
      return wrap;
    };
    searchControl.addTo(map);

    document.getElementById('map-address-search').addEventListener('input', applyAddressSearch);
    document.querySelectorAll('input[name="map-type-filter"]').forEach(function(el) {
      el.addEventListener('change', applyAddressSearch);
    });
    document.getElementById('map-zoom-in').addEventListener('click', function() { map.zoomIn(); });
    document.getElementById('map-zoom-out').addEventListener('click', function() { map.zoomOut(); });
${
  wordEnabled
    ? `
    var bulkGenBtn = document.getElementById('map-bulk-generate');
    var bulkClearBtn = document.getElementById('map-bulk-clear');
    if (bulkGenBtn) bulkGenBtn.addEventListener('click', function() { openBulkDocModal(); });
    if (bulkClearBtn) bulkClearBtn.addEventListener('click', function() { clearBulkSelection(); });
`
    : ''
}
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      var div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML =
        '<h3>Legenda</h3><ul>' +
        '<li><span class="legend-swatch" style="background:${COLOR_CD}"></span>CD (' + COLOR_COUNTS.cd + ')</li>' +
        '<li><span class="legend-swatch" style="background:${COLOR_PLAC}"></span>PLAC (' + COLOR_COUNTS.plac + ')</li>' +
        '<li><span class="legend-swatch" style="background:${COLOR_PUSTE}"></span>Puste (' + COLOR_COUNTS.puste + ')</li>' +
        '<li><span class="legend-swatch" style="background:${COLOR_BOLECIN}"></span>Bolęcin (' + COLOR_COUNTS.bolecin + ')</li>' +
        '</ul>';
      return div;
    };
    legend.addTo(map);

${wordEnabled ? wordModalBrowserScript() : '    void WEBAPP_URL;\n'}
    applyAddressSearch();
  </script>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
