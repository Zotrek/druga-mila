# Context: 0005 Stały odbiór Harmonogram

> **Last Updated:** 2026-08-12  
> **Task:** 0005_staly-odbior-harmonogram  
> **Status:** code done — czekamy na deploy `.gs` (CP3 smoke); 2026-08-12: kolumny II → generacja jak łączony

## Key files

| Plik | Rola |
|------|------|
| `google-apps-script/formatka-log.gs` | Uwagi, DMH, listHarmonogram (nagłówki + II), addHarmonogram, commitHarm |
| `src/harmonogramDates.ts` | Parser „Dzień odbioru” + daty miesiąca |
| `src/nextNumber.ts` | Filtr prefiksu DMH (lustro .gs) |
| `src/buildMapWordModal.ts` | UI picker / modal / multi-gen; II → 1 wiersz + 2× Word |
| `src/buildMapHtml.ts` | Przycisk mapy |
| `index.html` | Wygenerowany |

## Decisions

- Seria numerów stałego odbioru: **DMH1+** (osobna od DM)
- Harmonogram nie jest usuwany przy generacji
- Daty: propozycja → edycja w popupie → dopiero Pobierz .docx
- Uwagi: tylko formatka miesiąca / Planowane; nie Bolęcin; nie Word
- Skan DM pomija `DMH*`; skan DMH tylko `DMH*`
- **II Adres / II Nazwa** (opcjonalne w Harmonogramie): niepuste → jak protokół łączony (1× DMH* ze sklejonymi polami + 2× Word I/II)
