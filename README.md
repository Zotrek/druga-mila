# Druga Mila

Osobna, **w miarę statyczna** mapa sieci **Druga Mila** na **GitHub Pages** — niezależna od mapy plomb (`arkusz-mapa`).

**Jedna strona:** punkty z Excela **Załadunek** (kolory: CD / PLAC / puste / Bolęcin), wyszukiwarka i filtr typu, generacja protokołu Word (szablon DM) oraz zapis do Google według formatki Druga Mila. Protokoły i Sheets działają w przeglądarce — **bez** przebudowy strony przy każdym zapisie.

## Status

Implementacja **Fazy 1–8** (mapa + Word + formatka + hurt). Numer startowy: **`DM1`**.

## Dokumentacja

| Plik | Opis |
|------|------|
| [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) | Specyfikacja biznesowa |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Plan techniczny (build lokalny, Pages, moduły, testy) |
| [`docs/FORMATKA_GOOGLE.md`](docs/FORMATKA_GOOGLE.md) | Mapowanie kolumn Google |
| [`docs/FORMATKA_SHEET.md`](docs/FORMATKA_SHEET.md) | Deploy Apps Script + API Web App |
| [`docs/SZABLON_WORD_tagi.md`](docs/SZABLON_WORD_tagi.md) | Tagi szablonu Word |
| [`docs/pusty.docx`](docs/pusty.docx) | Szablon protokołu DM + tagi |
| [`docs/podwyko lista.xlsx`](docs/podwyko%20lista.xlsx) | Przewoźnik + miejsca dostawy |
| [`data/druga-mila.xlsx`](data/druga-mila.xlsx) | Punkty Załadunek / Rozładunek |
| [`.env.example`](.env.example) | `DRUGA_MILA_WEBAPP_URL`, ID arkusza, cache |
| [`google-apps-script/formatka-log.gs`](google-apps-script/formatka-log.gs) | Kod Web App |

## Lokalny rebuild

```bash
cd druga-mila
cp .env.example .env
# ustaw DRUGA_MILA_WEBAPP_URL=…/exec  (po wdrożeniu Apps Script — docs/FORMATKA_SHEET.md)
npm install
npm test
npm run generate       # → index.html (+ data/geocode-cache.json)
```

Otwórz `index.html` w przeglądarce.

### Smoke checklist

- [ ] Pinezki + legenda + search + filtr typu
- [ ] Popup → Generuj protokół → Word + wiersz w formatce (z Web App)
- [ ] Zaznacz kilka punktów → Generuj hurtowo → osobne `.docx` i kolejne numery
- [ ] Zbiórka `manualna` → podpowiedź dostawy **Biosystem**
- [ ] Bez `DRUGA_MILA_WEBAPP_URL`: Word działa, bez zapisu do Sheets

## Publikacja GitHub Pages

1. Settings → Pages → Source: **Deploy from a branch**
2. Branch: `main`, folder: **`/ (root)`**
3. Commit i push `index.html` (+ ewentualnie `data/geocode-cache.json`)

**Bez GitHub Actions.** Po zmianie Excela: lokalnie `npm run generate` → commit → push.

> Pages przy branch deploy obsługuje tylko `/` lub `/docs` — stąd publikacja z roota.

## Aktualizacja danych

1. Edytuj `data/druga-mila.xlsx` i/lub `docs/podwyko lista.xlsx` / `docs/pusty.docx`.
2. `npm run generate`
3. Commit `index.html` (+ cache) → push → Pages odświeża pinezki / listy.

## Sync reguł Cursora (opcjonalnie)

```bash
pwsh ../scripts/cursor-sync.ps1 -Source ..
```
