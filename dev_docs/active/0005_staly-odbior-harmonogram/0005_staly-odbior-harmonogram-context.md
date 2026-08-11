# Context: 0005 Stały odbiór Harmonogram

> **Last Updated:** 2026-08-11  
> **Task:** 0005_staly-odbior-harmonogram  
> **Status:** code done — czekamy na deploy `.gs` (CP3 smoke)

## Key files

| Plik | Rola |
|------|------|
| `google-apps-script/formatka-log.gs` | Uwagi col 16, GMH, listHarmonogram, addHarmonogram, commitHarm |
| `src/harmonogramDates.ts` | Parser „Dzień odbioru” + daty miesiąca |
| `src/nextNumber.ts` | Filtr prefiksu GMH (lustro .gs) |
| `src/buildMapWordModal.ts` | UI picker / modal / multi-gen |
| `src/buildMapHtml.ts` | Przycisk mapy |
| `index.html` | Wygenerowany 2026-08-11 |

## Decisions

- Seria numerów stałego odbioru: **GMH1+** (osobna od DM)
- Harmonogram nie jest usuwany przy generacji
- Daty: propozycja → edycja w popupie → dopiero Pobierz .docx
- Uwagi: tylko formatka miesiąca / Planowane; nie Bolęcin; nie Word
- Skan DM pomija `GMH*`; skan GMH tylko `GMH*`
