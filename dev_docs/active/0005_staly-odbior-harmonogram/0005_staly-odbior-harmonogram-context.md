# Context: 0005 Stały odbiór Harmonogram

> **Last Updated:** 2026-09-09  
> **Task:** 0005_staly-odbior-harmonogram  
> **Status:** code done — czekamy na deploy `.gs` (CP3 smoke); 2026-09-09: update/delete Harmonogram

## Key files

| Plik | Rola |
|------|------|
| `google-apps-script/formatka-log.gs` | Uwagi, DMH, listHarmonogram, add/update/deleteHarmonogram, commitHarm |
| `src/harmonogramDates.ts` | Parser „Dzień odbioru” + daty miesiąca |
| `src/nextNumber.ts` | Filtr prefiksu DMH (lustro .gs) |
| `src/buildMapWordModal.ts` | UI picker / modal / multi-gen; edycja/usuwanie Harmonogramu |
| `src/buildMapHtml.ts` | Przycisk mapy |
| `index.html` | Wygenerowany |

## Decisions

- Seria numerów stałego odbioru: **DMH1+** (osobna od DM)
- Harmonogram nie jest usuwany przy generacji
- Daty: propozycja → edycja w popupie → dopiero Pobierz .docx
- Uwagi: tylko formatka miesiąca / Planowane; nie Bolęcin; nie Word
- Skan DM pomija `DMH*`; skan DMH tylko `DMH*`
- **II Adres / II Nazwa** (opcjonalne w Harmonogramie): niepuste → jak protokół łączony (1× DMH* ze sklejonymi polami + 2× Word I/II)
- **Update / delete Harmonogram:** jak Planowane (`updatePlan` / `deletePlan`) — `harmonogramRow` + ten sam formularz co „Dodaj nowy”