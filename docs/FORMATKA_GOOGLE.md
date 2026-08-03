# Formatka Google — Druga Mila

Wzór kolumn (plik w repo, offline): [`../data/formatka-druga-mila.xlsx`](../data/formatka-druga-mila.xlsx).

Docelowy arkusz online (Apps Script dopisuje tu wiersze): [lista-druga-mila](https://docs.google.com/spreadsheets/d/1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0/edit?usp=sharing) — ID `1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0`. Wiersze trafiają na **zakładkę miesiąca** z daty odbioru (np. `Sierpień 2026`); przy pierwszym transporcie miesiąca zakładka jest tworzona z nagłówkami. Numeracja ciągła przez wszystkie zakładki. Nagłówki online **zweryfikowane** — zgodne z mapowaniem poniżej (**15** kolumn).

Przy generacji protokołu z mapy Apps Script dopisuje **jeden wiersz** na zakładkę miesiąca (kolejność kolumn jak w nagłówku formatki). Protokół łączony (2 miejsca) też dopisuje **jeden** wiersz — ze sklejonymi polami adresu / nazwy / znacznika.

**Planowane:** zapis bez protokołu idzie na stałą zakładkę `Planowane` (`Czy protokół = nie`, bez Bolęcina). Realizacja przenosi wiersz do miesiąca (`tak`) + opcjonalnie Bolęcin i generuje Word. Szczegóły: [`FORMATKA_SHEET.md`](FORMATKA_SHEET.md).

| # | Kolumna | Wypełnienie z mapy |
|---|---------|-------------------|
| 1 | Numer faktury | Zawsze puste (brak pola w UI) |
| 2 | Stawka | Z pola „Stawka” w modalu generacji (opcjonalne; **nie** na protokole Word) |
| 3 | Czy protokół zrobiony | `tak` przy generacji / realizacji; `nie` na zakładce `Planowane` |
| 4 | Nr zlecenia transportowego | Ten sam numer co w Word (**auto** z API; numer żyje po zapisie wiersza) |
| 5 | OKNO AWIZACJI | Z pola „Okno awizacji” w modalu (opcjonalne; **nie** na protokole Word) |
| 6 | Adres odbioru | Kolumna C (Adres) wybranego miejsca załadunku z `druga-mila.xlsx`; protokół łączony: `Adres1-Adres2` |
| 7 | Nazwa kontrahenta / podmiot handlowy | Kolumna A (Nazwa pełna) miejsca załadunku; protokół łączony: `Nazwa1-Nazwa2` |
| 8 | Data odbioru | Data załadunku z modala |
| 9 | Kto odbiera | Wybrany przewoźnik |
| 10 | Miejsce zrzutu | Wybrane miejsce dostawy |
| 11 | Rodzaj zbiórki | Z modala: `manualna` / `automatyczna` / `manualna i automatyczna` |
| 12 | Ile worków | Z modala |
| 13 | rodzaj traportu | Z modala (pisownia kolumny jak w formatce) |
| 14 | awizacja | = pole „Dane do awizacji” z modala / Word |
| 15 | znacznik miejsca | Typ punktu z kolumny D Załadunek (`CD` / `PLAC` / puste); łączony: oba przy różnych typach (`CD-PLAC`) |

Szczegóły numeracji i opcjonalności pól: [`SPECIFICATION.md`](SPECIFICATION.md).  
Deploy Web App + API: [`FORMATKA_SHEET.md`](FORMATKA_SHEET.md) (start numeru: **`DM1`**; drugi arkusz Bolęcin przy celu Biosystem/Bolęcin).
