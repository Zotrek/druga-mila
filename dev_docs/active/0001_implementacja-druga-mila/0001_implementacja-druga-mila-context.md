# Context: Implementacja Druga Mila

> **Last Updated:** 2026-07-20  
> **Task:** 0001_implementacja-druga-mila  
> **Status:** Fazy 1–6 done — następna: Faza 7 (multi-select)

## Progress

| Faza | Status |
|------|--------|
| 1 Scaffold | ✅ |
| 2 readPoints + classify | ✅ |
| 3 geocode + cache | ✅ 50/50 OK (`data/geocode-cache.json`) |
| 4 buildMapHtml | ✅ `index.html` 51 pinezek |
| 5 Modal / Word | ✅ embed `pusty.docx` + Biosystem przy manualnej |
| 6 Apps Script | ✅ POST przy generacji + GET preview (wymaga `DRUGA_MILA_WEBAPP_URL`) |
| 7 Multi-select | ⏳ |
| 8 Polish | ⏳ |

### Geocode note (2026-07-20)

Adresy w Excelu to „XX-XXX Miasto Ulica Numer”. Nominatim lepiej bierze „Ulica Numer, XX-XXX Miasto” — `buildGeocodeQueryVariants` próbuje warianty; fail nie jest cache'owany na stałe (retry przy kolejnym generate).

---

## Key files

| Plik | Rola |
|------|------|
| `docs/SPECIFICATION.md` | Biznes |
| `docs/ARCHITECTURE.md` | Technika, moduły, env, testy |
| `docs/FORMATKA_SHEET.md` | Deploy Apps Script |
| `docs/FORMATKA_GOOGLE.md` | Mapowanie kolumn |
| `docs/SZABLON_WORD_tagi.md` | Tagi Word + nazwa pliku |
| `google-apps-script/formatka-log.gs` | Web App (gotowy do wklejenia) |
| `.env.example` | `DRUGA_MILA_WEBAPP_URL`, … |
| `data/druga-mila.xlsx` | Punkty Załadunek |
| `docs/podwyko lista.xlsx` | Przewoźnik / dostawa |
| `docs/pusty.docx` | Szablon DM |

## Decisions (2026-07-20)

| Decyzja | Wartość |
|---------|---------|
| Numer startowy | `DM1` |
| Cache geokodu | `data/geocode-cache.json` |
| Env Web App | `DRUGA_MILA_WEBAPP_URL` |
| `modalData` | Tylko `{ ok, numer }` — bez lastTransportDate |
| Źródło prawdy numeracji | Kolumna w arkuszu (skan); property tylko cache |
| Preview | Nie pali numeru |
| Z mapy | Zawsze auto-numer |
| Usunięcie wierszy | Cofa następny numer (luki wracają) |
| Mieszane prefiksy | OK — max po liczbie końcowej (`ABC100`→`ABC101`) |
| Hosting | Pages branch `/`, bez Actions |
| Stack | Node/TS lokalny build + Leaflet HTML — bez Symfony/Vue/PG |
| Go do kodu | Tak — Faza 1 scaffold dozwolona |

## Dependencies

- Port UX/logiki z `arkusz-mapa` (search, combobox, Word) — kopiuj wzorce, nie podpinaj jako package.
- Osobny arkusz + Web App vs plomby.

## Open questions (biznes)

Brak otwartych — decyzje 2026-07-20 zamknięte.
