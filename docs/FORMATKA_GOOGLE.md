# Formatka Google — Druga Mila

Wzór kolumn (plik w repo, offline): [`../data/formatka-druga-mila.xlsx`](../data/formatka-druga-mila.xlsx).

Docelowy arkusz online (Apps Script dopisuje tu wiersze): [lista-druga-mila](https://docs.google.com/spreadsheets/d/1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0/edit?usp=sharing) — ID `1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0`, zakładka `Arkusz1`. Nagłówki online **zweryfikowane** — zgodne z mapowaniem poniżej (14 kolumn).

Przy generacji protokołu z mapy Apps Script dopisuje **jeden wiersz** (kolejność kolumn jak w nagłówku formatki).

| # | Kolumna | Wypełnienie z mapy |
|---|---------|-------------------|
| 1 | Numer faktury | Zawsze puste (brak pola w UI) |
| 2 | Stawka | Z pola „Stawka” w modalu generacji (opcjonalne; **nie** na protokole Word) |
| 3 | Czy protokół zrobiony | Zawsze `tak` |
| 4 | Nr zlecenia transportowego | Ten sam numer co w Word (**auto** z API; numer żyje po zapisie wiersza) |
| 5 | Adres odbioru | Kolumna C (Adres) wybranego miejsca załadunku z `druga-mila.xlsx` |
| 6 | Nazwa kontrahenta / podmiot handlowy | Kolumna A (Nazwa pełna) miejsca załadunku |
| 7 | Data odbioru | Data załadunku z modala |
| 8 | Kto odbiera | Wybrany przewoźnik |
| 9 | Miejsce zrzutu | Wybrane miejsce dostawy |
| 10 | Rodzaj zbiórki | Z modala: `manualna` / `automatyczna` / `manualna i automatyczna` |
| 11 | Ile worków | Z modala |
| 12 | rodzaj traportu | Z modala (pisownia kolumny jak w formatce) |
| 13 | awizacja | = pole „Dane do awizacji” z modala / Word |
| 14 | znacznik miejsca | Typ punktu z kolumny D Załadunek (`CD` / `PLAC` / puste) |

Szczegóły numeracji i opcjonalności pól: [`SPECIFICATION.md`](SPECIFICATION.md).  
Deploy Web App + API: [`FORMATKA_SHEET.md`](FORMATKA_SHEET.md) (start numeru: **`DM1`**).
