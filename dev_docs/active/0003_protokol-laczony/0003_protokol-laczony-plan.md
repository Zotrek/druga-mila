# Plan: Protokół łączony (dwa miejsca załadunku)

> **Data:** 2026-08-03  
> **Status:** IMPLEMENTED (czekamy na manual smoke / push Pages)  
> **Estymacja:** ~3–5 h | Złożoność: MEDIUM  

---

## Cel

Użytkownik może wygenerować **jeden wspólny protokół Word** i **jeden zbiorczy wiersz** w formatce Google dla **dokładnie dwóch** miejsc załadunku (jeden numer `DM*`, jeden transport).

## Zaakceptowane decyzje (2026-08-03)

| Decyzja | Wartość |
|---------|---------|
| Liczba miejsc | Dokładnie **2** |
| Word | **Jeden** wspólny protokół |
| Ewidencja | **Jeden** wiersz (zbiorczy) |
| Numer | **Jeden** `DM*` |
| Adres odbioru | `Adres1-Adres2` |
| Nazwa kontrahenta | `Nazwa1-Nazwa2` (analogicznie, separator `-`) |
| Kolejność sklejania | Obojętna (stabilna: kolejność zaznaczenia w UI) |
| Znacznik miejsca | Przy różnych typach — **oba**, np. `CD-PLAC`; przy tym samym — jeden |
| Nazwa pliku Word | Oba adresy (sklejone) |
| Bolęcin | Tak — jeden twin-wiersz ze sklejonymi polami |
| UX | **Opcja A** — osobny tryb / przycisk „Protokół łączony”; hurt bez zmian |

## UX (Opcja A)

- Osobna ścieżka obok pojedynczego i hurtu.
- Użytkownik zaznacza / wybiera **dokładnie 2** miejsca → otwiera formularz łączony → wspólne pola (jak dziś) → 1 Word + 1 wiersz.
- Przy ≠2 punktach: walidacja (komunikat), bez generacji.
- **Hurt pozostaje bez zmian:** N punktów → N protokołów + N wierszy.

## Zakres

1. Helper sklejania pól (adres, nazwa, znacznik, `miejsce_zaladunku`, nazwa pliku) + testy jednostkowe
2. UI: tryb „Protokół łączony” (wybór dokładnie 2) w modalu / mapie
3. Payload: jeden POST do Apps Script ze sklejonymi polami (schema kolumn bez zmian)
4. Word: jeden dokument z `miejsce_zaladunku` = sklejone miejsca
5. Sync docs: SPEC, FORMATKA_GOOGLE, ARCHITECTURE, SZABLON_WORD (jeśli potrzeba)
6. Smoke: 2 punkty → 1 `DM*` → 1 wiersz z `Adres1-Adres2`

## Poza zakresem

- Łączenie N>2 miejsc
- Zmiana schematu kolumn formatki
- Zmiana zachowania hurtu
- Zmiana API Apps Script (nadal jeden append / request) — o ile nie wyniknie z review

## Kryteria akceptacji

1. Przycisk / tryb „Protokół łączony” działa niezależnie od hurtu.
2. Dokładnie 2 miejsca → 1 numer, 1 Word, 1 wiersz w zakładce miesiąca.
3. Kolumny Adres / Nazwa / znacznik zawierają wartości sklejone separatorem `-`.
4. Przy celu Bolęcin/Biosystem — jeden twin-wiersz ze sklejonymi polami.
5. Hurt (w tym N=2) nadal generuje osobne protokoły i wiersze.
6. Testy jednostkowe sklejania + pełny `npm test` zielony.
