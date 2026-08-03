# Context: Protokół łączony (dwa miejsca załadunku)

> **Last Updated:** 2026-08-03 17:30  
> **Task:** 0003_protokol-laczony  
> **Status:** IMPLEMENTED — kod + docs + `index.html`; czekamy na manual smoke / push Pages

## Progress

| Krok | Status |
|------|--------|
| Decyzje biznesowe | ✅ (zaktualizowane 2026-08-03 17:26) |
| UX (Opcja A + wybór z mapy) | ✅ |
| Plan w `dev_docs` | ✅ |
| Helper + testy | ✅ |
| UI + generacja | ✅ |
| Docs sync | ✅ |
| `npm run generate` | ✅ |
| Manual smoke Pages / Web App | ⏳ użytkownik |

## Key files

| Plik | Rola |
|------|------|
| `src/combineLoadPoints.ts` | Sklejanie adresów / nazw / znacznika (ewidencja) |
| `src/wordFileName.ts` | Nazwy plików Word (per miejsce) |
| `src/buildMapWordModal.ts` | Tryb `combined`, picker, mapa, 1 POST + 2 Word |
| `src/buildMapHtml.ts` | Przyciski + panel mapy łączonego |
| `index.html` | Wygenerowany artefakt Pages |
| `docs/SPECIFICATION.md` | §6a |
| `docs/FORMATKA_GOOGLE.md` | Sklejanie kolumn |
| `docs/ARCHITECTURE.md` | Flow łączony |
| `docs/SZABLON_WORD_tagi.md` | `miejsce_zaladunku` per plik |

## Decisions (2026-08-03)

| Decyzja | Wartość |
|---------|---------|
| Cardinality | Dokładnie 2 |
| Word | **2** pliki — te same dane formularza, inne tylko `miejsce_zaladunku` |
| Ewidencja | **1** wiersz (`Adres1; Adres2`, nazwy `-`) |
| Numer | **Ten sam** `DM*` na obu Wordach |
| Separator adresów | `; ` |
| Separator nazw / znacznika | `-` |
| Kolejność | Kolejność wyboru |
| Znacznik | Oba przy różnicy typów; jeden gdy typ wspólny |
| Bolęcin twin | Tak (jeden twin ze sklejonymi polami) |
| UX | Mapa (checkbox) + wybór ręczny; hurt bez zmian |
| Apps Script | Bez zmian API — agregacja po stronie klienta |

## Implementation notes

- Picker listy współdzielony z hurtem (`__manualPickerKind`: `bulk` \| `combined`).
- Zaznaczenie z mapy: `__combinedSelectedLoadIdxs` + panel „Generuj łączony” (max 2).
- Modal mode `combined`: lista 2 punktów + numer + „Pobierz 2× .docx”.
- `runCombinedDocGenerate`: 1× `appendFormatkaRow(combineLoadPoints)` → 2× `renderAndDownloadDocx` (po punkcie, ten sam numer).
