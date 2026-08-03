# Context: Protokół łączony (dwa miejsca załadunku)

> **Last Updated:** 2026-08-03 17:00  
> **Task:** 0003_protokol-laczony  
> **Status:** IMPLEMENTED — kod + docs + `index.html` wygenerowane; czekamy na manual smoke / push Pages

## Progress

| Krok | Status |
|------|--------|
| Decyzje biznesowe | ✅ |
| UX (Opcja A) | ✅ |
| Plan w `dev_docs` | ✅ |
| Helper + testy | ✅ |
| UI + generacja | ✅ |
| Docs sync | ✅ |
| `npm run generate` | ✅ |
| Manual smoke Pages / Web App | ⏳ użytkownik |

## Key files

| Plik | Rola |
|------|------|
| `src/combineLoadPoints.ts` | Sklejanie adresów / nazw / znacznika / Word |
| `src/wordFileName.ts` | `buildCombinedDocxDownloadName` |
| `src/buildMapWordModal.ts` | Tryb `combined`, picker, 1 POST + 1 Word |
| `src/buildMapHtml.ts` | Przycisk „Protokół łączony” |
| `index.html` | Wygenerowany artefakt Pages |
| `docs/SPECIFICATION.md` | §6a |
| `docs/FORMATKA_GOOGLE.md` | Sklejanie kolumn |
| `docs/ARCHITECTURE.md` | Flow łączony |
| `docs/SZABLON_WORD_tagi.md` | `miejsce_zaladunku` łączony |

## Decisions (2026-08-03)

| Decyzja | Wartość |
|---------|---------|
| Cardinality | Dokładnie 2 |
| Word + wiersz + numer | 1 + 1 + 1 |
| Separator | `-` |
| Kolejność | Kolejność wyboru na liście (obojętna biznesowo) |
| Znacznik | Oba przy różnicy typów; jeden gdy typ wspólny |
| Plik Word | Oba adresy w nazwie |
| Bolęcin twin | Tak (ten sam payload → istniejąca logika Apps Script) |
| UX | Opcja A — osobny przycisk; hurt bez zmian |
| Apps Script | Bez zmian API — agregacja po stronie klienta |

## Implementation notes

- Picker listy załadunków współdzielony z hurtem (`__manualPickerKind`: `bulk` \| `combined`).
- Modal mode `combined`: lista 2 punktów + pole numeru (jak single) + jeden download.
- `renderAndDownloadDocx` respektuje `zal.miejsceZaladunkuWord` gdy obecne.
