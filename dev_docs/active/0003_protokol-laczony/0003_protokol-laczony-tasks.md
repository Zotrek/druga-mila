# Tasks: Protokół łączony (dwa miejsca załadunku)

> **Task:** 0003_protokol-laczony  
> **Updated:** 2026-08-03

---

## Phase 0 — Plan

- [x] Zamknięcie decyzji biznesowych (2 miejsca, 1 Word, sklejanie `-`, Bolęcin, UX A)
- [x] Utworzenie `0003_protokol-laczony-{plan,context,tasks}.md`
- [x] Akceptacja planu przez użytkownika

## Phase 1 — Helper + TDD

- [x] Helper sklejania (adres, nazwa, znacznik, `miejsce_zaladunku`) + testy jednostkowe
- [x] Rozszerzenie nazwy pliku Word o oba adresy + testy
- [x] **CHECKPOINT 1:** `npm test` — pass ✅ (2026-08-03, 90 tests)

## Phase 2 — UI + generacja

- [x] Tryb / przycisk „Protokół łączony” (Opcja A; walidacja dokładnie 2)
- [x] Jeden payload + jeden POST + jeden Word (bez pętli hurtu)
- [x] Hurt bez regresji (N=2 nadal osobne protokoły)
- [x] **CHECKPOINT 2:** unit + smoke lokalny (generate) — pass ✅ (2026-08-03)

## Phase 3 — Docs + regresja

- [x] Sync SPEC / FORMATKA_GOOGLE / ARCHITECTURE / SZABLON_WORD_tagi
- [x] Update `-context.md` / `-plan.md` (status)
- [x] **CHECKPOINT 3:** `npm test` full suite — no regressions ✅ (90 tests)
- [ ] Manual smoke na Pages / Web App (1 wiersz, sklejone pola, Bolęcin jeśli cel)
- [x] `npm run generate` (`index.html` zaktualizowany)

## Documentation Updates

- [x] Update `-tasks.md` after each subtask
- [x] Update `-context.md` if decisions change
- [x] Update `-plan.md` if requirements change
