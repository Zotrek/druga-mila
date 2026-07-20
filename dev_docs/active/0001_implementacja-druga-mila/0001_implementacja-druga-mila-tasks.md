# Tasks: Implementacja Druga Mila

> **Task:** 0001_implementacja-druga-mila  
> **Updated:** 2026-07-20

---

## Documentation (przed kodem)

- [x] Numer startowy = `DM1` (SPEC + ARCH + FORMATKA_SHEET + `.gs`)
- [x] `.env.example` + wyjątek w `.gitignore`
- [x] `docs/FORMATKA_SHEET.md` (deploy + API)
- [x] `google-apps-script/formatka-log.gs`
- [x] Moduły / npm / testy / cache w ARCHITECTURE
- [x] Nazwa pliku Word zamrożona w SZABLON_WORD_tagi
- [x] Plan + context + tasks (ten folder)
- [x] Mieszane prefiksy OK (`ABC100`→`ABC101`)
- [x] Auto z mapy; preview nie pali; delete cofa numerację
- [x] Podpis / go do kodu (ARCHITECTURE checklist)

## Implementation

- [x] Faza 1: scaffold npm/TS/Vitest/`config.ts`
- [x] **CHECKPOINT 1:** `npm run build` + `npm test` — pass ✅ (2026-07-20)
- [x] Faza 2: `readPoints` + `classify` + testy
- [x] **CHECKPOINT 2:** unit classify/points — pass ✅ (2026-07-20)
- [x] Faza 3: `readPodwyko` + `geocode` + cache
- [x] **CHECKPOINT 3:** generate loguje punkty / zapisuje cache ✅ (2026-07-20, 50/50 ok)
- [x] Faza 4: `buildMapHtml` (mapa, legenda, search, filtr)
- [x] **CHECKPOINT 4:** lokalny HTML — pinezki + filtry OK ✅ (2026-07-20, 51 pinezek)
- [x] Faza 5: modal + Word + reguła Biosystem
- [x] **CHECKPOINT 5:** pobranie `.docx` bez Web App ✅ (kod + embed; smoke w przeglądarce: pinezka → Generuj → Pobierz)
- [x] Faza 6: wdrożenie Web App + POST/GET w mapie
- [x] **CHECKPOINT 6:** POST przy „Pobierz .docx” + preview numeru ✅ (2026-07-20)
- [x] Faza 7: multi-select + README Pages
- [x] **CHECKPOINT 7:** smoke hurt + dokumentacja workflow ✅ (2026-07-20)
- [x] Faza 8: polish + sync docs
- [x] **CHECKPOINT 8:** full smoke — no regressions vs SPEC ✅ (unit 60 pass; empty banner; graceful bez Web App)

## Documentation Updates

- [x] Update `-tasks.md` after each subtask
- [x] Update `-context.md` if decisions change
- [x] Update `-plan.md` if requirements change
- [x] Update README (Pages + smoke checklist)
