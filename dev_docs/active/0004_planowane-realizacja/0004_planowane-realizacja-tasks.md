# Tasks: Planowane + realizacja

> **Task:** 0004_planowane-realizacja  
> **Last Updated:** 2026-08-07

## Documentation

- [x] Create `0004_*` plan / context / tasks
- [x] Update `docs/FORMATKA_SHEET.md` (API planowane)
- [x] Update `docs/SPECIFICATION.md` (§ planowane / realizacja)
- [x] Update `docs/ARCHITECTURE.md`
- [x] Update `docs/FORMATKA_GOOGLE.md` (Czy protokół / Planowane)

## Apps Script

- [x] Zakładka `Planowane` + `getOrCreatePlanowaneSheet_`
- [x] POST `mode: plan` (bez Bolęcina, `czyProtokol=nie`)
- [x] GET `listPlanowane`
- [x] POST `mode: realize` (miesiąc + Bolęcin + delete)
- [x] POST `mode: updatePlan` / `deletePlan`
- [x] Istniejący POST bez mode bez regresji
- [x] **FIX 2026-08-07:** `updatePlan` — poprawne `getRange(..., numRows=1, …)` (Zapisz zmiany bez protokołu)

## UI

- [x] Przycisk mapy „Planowane” + overlay listy
- [x] „Zapisz planowane” w modalu single
- [x] Tryb `realize` (prefill, Word + realize POST)
- [x] Update / delete planowanego z UI

## Tests / generate

- [x] Testy embed (`Zapisz planowane`, `listPlanowane`, `mode`)
- [x] **CHECKPOINT 1:** `npm test` — 90 passed ✅
- [x] `npm run generate` (index.html)
- [ ] **CHECKPOINT 2:** smoke checklist (po deploy `.gs`) ⏳

## Smoke checklist (manual — po Deploy New version)

1. [ ] Wklej `google-apps-script/formatka-log.gs` → **Deploy → Manage deployments → Edit → New version**
2. [ ] Modal single → „Zapisz planowane” → wiersz tylko w `Planowane`, bez `.docx`, bez Bolęcina; numer `DM*`
3. [ ] Nowy transport (Pobierz .docx) → kolejny numer (planowane w skanie)
4. [ ] Przycisk „Planowane” → wybór → prefill → „Pobierz .docx” → Word + miesiąc (+ Bolęcin) + usunięcie z `Planowane`; ten sam numer
5. [ ] „Zapisz zmiany” na planowanym (bez Word) → nadpis wiersza w `Planowane`, bez błędu
6. [ ] „Usuń z planowanych” → numer wraca przy preview
7. [ ] Dotychczasowa ścieżka „Pobierz .docx” od razu nadal działa
8. [ ] Push `index.html` na Pages (gdy gotowe)

## Documentation Updates

- [x] Update `-tasks.md` after each subtask
- [x] Update `-context.md` if decisions changed
- [x] Update `-plan.md` if requirements changed
