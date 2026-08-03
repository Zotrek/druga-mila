# Plan: Planowane + realizacja

> **Data:** 2026-08-03  
> **Status:** IMPLEMENTED (czekamy na Deploy `.gs` + smoke)  
> **Estymacja:** ~4–6 h | Złożoność: MEDIUM  

---

## Cel

Użytkownik może **zaplanować** transport (rezerwacja `DM*` + dane na zakładce `Planowane`, bez protokołu Word i bez Bolęcina), a później **zrealizować** go z mapy (prefill → Word + wiersz w miesiącu + Bolęcin + usunięcie z `Planowane`).

## Zaakceptowane decyzje (2026-08-03)

| Decyzja | Wartość |
|---------|---------|
| Ścieżka „bez protokołu” | Tylko zakładka **Planowane** |
| Zapis niepełny do miesiąca | Nie (poza zakresem) |
| Dociąganie Worda do wiersza w miesiącu | Nie (poza zakresem) |
| Kompletność pól przy realizacji | Jak dziś — wszystkie opcjonalne; protokół po kliknięciu |
| Hurt / łączony + planowanie | Poza zakresem v1 |
| Bolęcin przy planowaniu | Nie |
| Numer przy realizacji | Ten sam zarezerwowany `DM*` |

## Zakres

1. Apps Script: zakładka `Planowane`, mode `plan` / `realize` / `updatePlan` / `deletePlan`, GET `listPlanowane`
2. UI: przycisk „Planowane”, lista, „Zapisz planowane”, tryb realize w modalu
3. Docs: SPEC, FORMATKA_SHEET, ARCHITECTURE, FORMATKA_GOOGLE
4. Testy + `npm run generate`

## Kryteria akceptacji

1. „Zapisz planowane” → tylko `Planowane`, numer zarezerwowany, bez `.docx`, bez Bolęcina.
2. Następny transport dostaje kolejny `DM*` (planowane w skanie).
3. Realizacja → Word + miesiąc (+ Bolęcin) + usunięcie z `Planowane`; ten sam numer.
4. `deletePlan` → numer wraca do puli przy preview.
5. Ścieżka „Pobierz .docx” od razu bez regresji.
6. `npm test` zielony; po deployu `.gs` — smoke.
