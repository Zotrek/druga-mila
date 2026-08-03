# Context: Zakładki miesięczne w formatce Google

> **Last Updated:** 2026-08-03  
> **Task:** 0002_zakladki-miesieczne-formatka  
> **Status:** WAITING_DEPLOY — kod + docs gotowe; wymaga redeploy Web App

## Progress

| Krok | Status |
|------|--------|
| Decyzje biznesowe | ✅ |
| Helpers TS + testy | ✅ (10 testów) |
| Apps Script | ✅ |
| Docs sync | ✅ |
| Redeploy Web App (manual) | ⏳ użytkownik |

## Key files

| Plik | Rola |
|------|------|
| `google-apps-script/formatka-log.gs` | Runtime: zakładka miesiąca + skan wszystkich |
| `src/monthSheetName.ts` | Lustro logiki nazwy zakładki (testowane) |
| `docs/FORMATKA_SHEET.md` | Kontrakt API / zachowanie |
| `docs/SPECIFICATION.md` | Reguła biznesowa |

## Decisions (2026-08-03)

| Decyzja | Wartość |
|---------|---------|
| Format nazwy | `{MiesiącPL} {YYYY}` np. `Sierpień 2026` |
| Numeracja | Globalna przez wszystkie zakładki |
| Miesiąc z | `dataOdbioru` (`dd.mm.rrrr`) |
| Fallback daty | Dziś (gdy puste / nieparsowalne) |
| Historyczny `Arkusz1` | Zostaje; skanowany; nowe wpisy → zakładki miesięczne |
