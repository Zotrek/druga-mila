# Druga Mila

Osobna, **w miarę statyczna** mapa sieci **Druga Mila** na **GitHub Pages** — niezależna od mapy plomb (`arkusz-mapa`).

**Jedna strona:** punkty z Excela **Załadunek** (kolory: CD / PLAC / puste / Bolęcin), wyszukiwarka i filtr typu, generacja protokołu Word (szablon DM) oraz zapis do Google według formatki Druga Mila. Protokoły i Sheets działają w przeglądarce — **bez** przebudowy strony przy każdym zapisie.

W przeciwieństwie do `arkusz-mapa` mapa **nie jest cyklicznie regenerowana** przez GitHub Actions. Lista punktów i podwykonawców aktualizowana rzadko przez pliki Excel w repo + lokalny rebuild.

## Status

Dokumentacja Fazy 1–2 **gotowa do implementacji** (SPEC + ARCH + kontrakt Apps Script). Numer startowy: **`DM1`**.  
**Kod aplikacji (mapa / `src/`) jeszcze nie** — zadanie: `dev_docs/active/0001_implementacja-druga-mila/`.

## Dokumentacja

| Plik | Opis |
|------|------|
| [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) | Specyfikacja biznesowa |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Plan techniczny (build lokalny, Pages, moduły, testy) |
| [`docs/FORMATKA_GOOGLE.md`](docs/FORMATKA_GOOGLE.md) | Mapowanie kolumn Google |
| [`docs/FORMATKA_SHEET.md`](docs/FORMATKA_SHEET.md) | Deploy Apps Script + API Web App |
| [`docs/SZABLON_WORD_tagi.md`](docs/SZABLON_WORD_tagi.md) | Tagi szablonu Word |
| [`docs/pusty.docx`](docs/pusty.docx) | Szablon protokołu DM + tagi |
| [`docs/podwyko lista.xlsx`](docs/podwyko%20lista.xlsx) | Przewoźnik + miejsca dostawy (kopia z `arkusz-mapa`) |
| [`data/druga-mila.xlsx`](data/druga-mila.xlsx) | Punkty Załadunek / Rozładunek |
| [`data/formatka-druga-mila.xlsx`](data/formatka-druga-mila.xlsx) | Wzór formatki Google |
| [`.env.example`](.env.example) | `DRUGA_MILA_WEBAPP_URL`, ID arkusza, cache |
| [`google-apps-script/formatka-log.gs`](google-apps-script/formatka-log.gs) | Kod Web App (wkleić do arkusza formatki) |

## Zakres w skrócie

- Mapa: CD (niebieski), PLAC (zielony), puste (fiolet), Bolęcin (pomarańcz)
- Search + filtr typu; combobox załadunku = nazwa skrócona (search po A/B/C; Word = pełna + adres)
- Word: numer, załadunek, przewoźnik, dostawa, awizacja, data — wszystko opcjonalne
- Google: formatka z „Czy protokół zrobiony” = tak; Stawka z modala (nie na Word); Numer faktury puste; numeracja **`DM1`→`DM2`…**
- Hosting: GitHub Pages (statyczny HTML)

## Aktualizacja danych (po wdrożeniu kodu)

1. Edytuj `data/druga-mila.xlsx` i/lub `docs/podwyko lista.xlsx`.
2. Lokalnie: `npm run generate`.
3. Commit `index.html` (+ cache geokodu) → push.
4. Pages pokazuje nowe pinezki / listy — publikacja przez „Deploy from a branch” (`main`, folder **`/ (root)`**), **bez GitHub Actions**.

Na razie w rootcie jest `index.html` (placeholder); po implementacji build zastąpi go mapą.

> Uwaga: GitHub Pages przy „Deploy from a branch” obsługuje tylko foldery `/` i `/docs` — stąd publikacja z roota, nie z `/site`.

## Następny krok

Implementacja kodu wg `dev_docs/active/0001_implementacja-druga-mila/` — bez Symfony/Vue/PostgreSQL w v1.

## Sync reguł Cursora (opcjonalnie)

```bash
pwsh ../scripts/cursor-sync.ps1 -Source ..
```
