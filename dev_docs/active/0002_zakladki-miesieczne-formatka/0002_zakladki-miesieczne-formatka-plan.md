# Plan: Zakładki miesięczne w formatce Google

> **Data:** 2026-08-03  
> **Status:** IMPLEMENTED (czekamy na redeploy Web App)  
> **Estymacja:** ~1–2 h | Złożoność: LOW  

---

## Cel

Przy pierwszym transporcie w nowym miesiącu Apps Script zakłada **nową zakładkę** w arkuszu lista-druga-mila, nazwaną od miesiąca. Kolejne transporty tego miesiąca idą na tę zakładkę.

## Zaakceptowane decyzje (2026-08-03)

| Decyzja | Wartość |
|---------|---------|
| Nazwa zakładki | `Sierpień 2026` (pełna PL + rok) |
| Numeracja | **Ciągła** — skan **wszystkich** zakładek |
| Źródło miesiąca | `dataOdbioru` z POST (Data załadunku / Data odbioru) |
| Brak / zła data | Fallback: data bieżąca (timezone skryptu) |
| Istniejący `Arkusz1` | Zostaje; nadal skanowany do numeracji; nowe wpisy → zakładki miesięczne |

## Zakres

1. `formatka-log.gs` — `getOrCreateMonthSheet_`, skan wszystkich sheets, nagłówki przy create
2. Lustro TS + testy jednostkowe (parse daty, nazwa miesiąca)
3. Sync docs: SPEC, FORMATKA_SHEET, FORMATKA_GOOGLE, ARCHITECTURE

## Po wdrożeniu kodu

Użytkownik: **Deploy → Manage deployments → Edit → New version** w Apps Script.
