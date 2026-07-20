# Druga Mila

Osobna, **w miarę statyczna** mapa sieci **Druga Mila** na **GitHub Pages** — niezależna od mapy plomb (`arkusz-mapa`).

**Jedna strona:** punkty z Excela **Załadunek** (kolory: CD / PLAC / puste / Bolęcin), wyszukiwarka i filtr typu, generacja protokołu Word (szablon DM) oraz zapis do Google według formatki Druga Mila. Protokoły i Sheets działają w przeglądarce — **bez** przebudowy strony przy każdym zapisie.

W przeciwieństwie do `arkusz-mapa` mapa **nie jest cyklicznie regenerowana** przez GitHub Actions. Lista punktów i podwykonawców aktualizowana rzadko przez pliki Excel w repo + lokalny rebuild.

## Status

Dokumentacja Fazy 1–2 uzupełniona (mapa, Word, formatka, model statyczny). **Kod aplikacji jeszcze nie.**

## Dokumentacja

| Plik | Opis |
|------|------|
| [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) | Specyfikacja biznesowa |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Plan techniczny (build lokalny, Pages) |
| [`docs/FORMATKA_GOOGLE.md`](docs/FORMATKA_GOOGLE.md) | Mapowanie kolumn Google |
| [`docs/SZABLON_WORD_tagi.md`](docs/SZABLON_WORD_tagi.md) | Tagi szablonu Word |
| [`docs/pusty.docx`](docs/pusty.docx) | Szablon protokołu DM + tagi |
| [`docs/podwyko lista.xlsx`](docs/podwyko%20lista.xlsx) | Przewoźnik + miejsca dostawy (kopia z `arkusz-mapa`) |
| [`data/druga-mila.xlsx`](data/druga-mila.xlsx) | Punkty Załadunek / Rozładunek |
| [`data/formatka-druga-mila.xlsx`](data/formatka-druga-mila.xlsx) | Wzór formatki Google |

## Zakres w skrócie

- Mapa: CD (niebieski), PLAC (zielony), puste (fiolet), Bolęcin (pomarańcz)
- Search + filtr typu; combobox załadunku = nazwa skrócona (search po A/B/C; Word = pełna + adres)
- Word: numer, załadunek, przewoźnik, dostawa, awizacja, data — wszystko opcjonalne
- Google: formatka z „Czy protokół zrobiony” = tak; Stawka z modala (nie na Word); Numer faktury puste; numeracja `asd123`→`asd124`
- Hosting: GitHub Pages (statyczny HTML)

## Aktualizacja danych (po wdrożeniu kodu)

1. Edytuj `data/druga-mila.xlsx` i/lub `docs/podwyko lista.xlsx`.
2. Lokalnie: `npm run generate`.
3. Commit `site/` (+ cache geokodu) → push.
4. Pages pokazuje nowe pinezki / listy — publikacja przez „Deploy from a branch”, **bez GitHub Actions**.

## Następny krok

Implementacja kodu (osobne zadanie) — bez Symfony/Vue/PostgreSQL w v1.

## Sync reguł Cursora (opcjonalnie)

```bash
pwsh ../scripts/cursor-sync.ps1 -Source ..
```
