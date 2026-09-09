# Tasks: Stały odbiór Harmonogram + Uwagi

> **Task:** 0005_staly-odbior-harmonogram  
> **Last Updated:** 2026-09-09

## Documentation

- [x] Create `0005_*` plan / context / tasks
- [x] Update `docs/FORMATKA_SHEET.md`
- [x] Update `docs/FORMATKA_GOOGLE.md`

## Core utils

- [x] `harmonogramDates.ts` + unit tests
- [x] `nextNumber` prefix filter + unit tests
- [x] **CHECKPOINT 1:** `npm test` (dates + numbers) ✅

## Apps Script

- [x] `HEADER_ROW` / `COL.uwagi` (16)
- [x] Skan DM bez DMH; skan / preview / resolve DMH
- [x] GET `listHarmonogram`, `previewNumberHarm`
- [x] POST `addHarmonogram`, `commitHarm`
- [x] POST `updateHarmonogram`, `deleteHarmonogram`

## UI

- [x] Pole Uwagi w modalu + payload
- [x] Przycisk + picker Harmonogram + Dodaj nowy
- [x] Tryb harm: lista dat + multi commitHarm / Word
- [x] Edycja / usuwanie wpisów Harmonogramu (lista + formularz)

## Tests / generate

- [x] Embed tests (harmonogram, DMH, uwagi)
- [x] **CHECKPOINT 2:** full `npm test` ✅
- [x] `npm run generate`
- [ ] **CHECKPOINT 3:** smoke po deploy `.gs` ⏳

## Smoke checklist (manual — po Deploy New version)

1. [ ] Wklej `google-apps-script/formatka-log.gs` → **Deploy → Manage deployments → Edit → New version**
2. [ ] Przycisk „Generuj z Harmonogramu” → lista
3. [ ] Wybór wiersza → popup z datami; Pobierz .docx → N× DMH + Word; Harmonogram bez ubytku
4. [ ] Dodaj nowy wpis do Harmonogramu
5. [ ] Edytuj wpis (Edytuj → Zapisz zmiany) i sprawdź listę
6. [ ] Usuń wpis z listy lub z formularza edycji
