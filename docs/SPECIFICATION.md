# SPECIFICATION.md — Druga Mila

> **Status:** Zaakceptowana (Faza 1)  
> **Ostatnia aktualizacja:** 2026-07-20  
> **Właściciel:** Zespół Zwrotka  
> **Źródło:** Plan produktowy + doprecyzowanie Word / formatka Google / Excel Załadunek

---

## Cel Biznesowy

**Co chcemy osiągnąć?**

Osobna, **w miarę statyczna** mapa sieci **Druga Mila** na **GitHub Pages** (niezależna od mapy plomb `arkusz-mapa`): **jedna strona** z pinezkami z pliku Załadunek (kolory według typu). Z niej użytkownik generuje protokół Word (szablon DM) i zapisuje wiersz do Google Sheets według formatki Druga Mila — bez przebudowy strony przy każdym protokole.

**Dlaczego to robimy?**

Osobny proces i dane względem plomb: CD / place / Bolęcin, własna formatka Google, protokół bez listy plomb, z polem awizacji. W przeciwieństwie do `arkusz-mapa` strona **nie jest cyklicznie regenerowana** przez GitHub Actions — lista punktów i podwykonawców zmienia się rzadko (Excel w repo).

---

## Użytkownicy (Persony)

| Persona | Rola | Potrzeby | Przykład |
|---------|------|----------|----------|
| Koordynator transportu | Operacje | Widzieć punkty, wyszukać, wygenerować protokół + zapis Google | Wybiera załadunek → przewoźnik → dostawa → pobiera Word |
| Dyspozytor | Planowanie | Hurt wielu punktów; protokół łączony 2 miejsc | Multi-select → seria dokumentów; łączony → 2 Word (ten sam DM*) + 1 wiersz |
| Osoba utrzymująca dane | Excel w repo | Rzadka aktualizacja punktów / podwykonawców | Edycja `data/druga-mila.xlsx` lub `docs/podwyko lista.xlsx` → lokalny `npm run generate` → commit `index.html` (root) → push; Pages pokazuje nowe dane |

---

## Źródło punktów mapy

Plik: [`data/druga-mila.xlsx`](../data/druga-mila.xlsx) (arkusz **Załadunek**).

| Arkusz | Rola |
|--------|------|
| **Załadunek** | Jedyna lista pinezek + combobox „Miejsce załadunku” |
| **Rozładunek** | Nie na mapie v1; miejsce dostawy = lista jak w `arkusz-mapa` (`podwyko lista`) |

### Kolumny Załadunek

| Kolumna | Znaczenie |
|--------|-----------|
| A — Nazwa pełna | Search; Google „Nazwa kontrahenta”; część tekstu Word |
| B — Nazwa skrócona | Etykieta w comboboxie załadunku; search |
| C — Adres | Geokodowanie; search; Google „Adres odbioru”; część tekstu Word |
| D — Typ | `CD` / `PLAC` / puste |
| E — Rodzaj zbiórki | `manualna` / `automatyczna` / `manualna i automatyczna` (opcjonalnie) |

Wiersze **bez adresu** — bez pinezki. W comboboxie załadunku tylko wiersze z niepustym adresem (C).

---

## Kluczowe Funkcjonalności (Must Have)

### 1. Mapa — typy i kolory

Klasyfikacja (kolejność reguł):

1. **Bolęcin** — nazwa lub adres zawiera „Bolęcin” / „Bolecin” → `#fd7e14`
2. **CD** — Typ = `CD` → `#0d6efd`
3. **PLAC** — Typ = `PLAC` → `#198754`
4. **Puste** — Typ pusty i nie Bolęcin → `#6f42c1`

Legenda na mapie. Popup: nazwy, adres, typ; akcje: generuj / zaznacz do hurtu / zaznacz do łączonego.

### 2. Wyszukiwarka na mapie

Jak sklepy w `arkusz-mapa`:

- Match po: Nazwa pełna + Nazwa skrócona + Adres (normalizacja PL).
- Niedopasowane przygaszone; 1 wynik → zoom; wiele → `fitBounds`.

### 3. Filtr po typie

Kontrolka jak filtr zbiórki w mapie plomb:

**Wszystkie | CD | PLAC | Puste | Bolęcin**

Niewybrane typy ukryte. Iloczyn z wyszukiwarką.

### 4. Modal generacji protokołu

Wszystkie pola **nieobowiązkowe**. Brak wartości → pusty string w Word / pusta komórka w Google (z wyjątkami poniżej). Generacja zawsze dozwolona.

#### Miejsce załadunku (combobox)

| Warstwa | Wartość |
|---------|---------|
| Etykieta na liście | Nazwa **skrócona** (B) |
| Wyszukiwarka listy | Pełna + skrócona + adres (jak arkusz-mapa) |
| Word `{{miejsce_zaladunku}}` | **Nazwa pełna + adres** (A + C), jedna linia |
| Google Adres odbioru | Kolumna **C** |
| Google Nazwa kontrahenta | Kolumna **A** |

Klik pinezki może podpowiedzieć ten punkt w comboboxie; pole nadal edytowalne / opcjonalne.

#### Pozostałe pola modala

| Pole UI | Na Word | Na Google | Zachowanie |
|---------|---------|-----------|------------|
| Numer zlecenia | Tak | Tak | **Zawsze auto** z API przy generacji z mapy (podgląd nie rezerwuje; numer „żyje” dopiero po zapisie wiersza). Pole w UI może pokazywać podgląd; awaryjny nadpis ręczny tylko przez API |
| Przewoźnik | Tak | „Kto odbiera” | Lista `podwyko` jak arkusz-mapa + search |
| Miejsce dostawy | Tak | „Miejsce zrzutu” | Lista jak arkusz-mapa + search |
| Dane do awizacji | Tak | „awizacja” | Nr rejestracyjny, **bez walidacji** |
| Data załadunku | Tak | „Data odbioru” | Od obowiązkowe do złożenia daty; Do opcjonalne. Tylko Od → `dd.mm.rrrr`. Od i Do → `13.08/14.08.2026` (dni nie muszą być kolejne). Ta sama wartość na protokole Word, w Google i w nazwie pliku (w nazwie `/` → `-`) |
| Stawka | **Nie** | „Stawka” | Wpis ręczny w modalu; **nie** trafia do protokołu Word |
| Okno awizacji | **Nie** | „OKNO AWIZACJI” | Wpis ręczny (np. godziny); **nie** zakres dat — zakres jest w Data załadunku |
| Rodzaj zbiórki | **Nie** | „Rodzaj zbiórki” | Combobox + podpowiedź: `manualna` / `automatyczna` / `manualna i automatyczna` |
| Ile worków | **Nie** | „Ile worków” | Wpis ręczny |
| Rodzaj transportu | **Nie** | „rodzaj traportu” | Wpis ręczny |

**Numer faktury** — brak pola w UI; kolumna Google zawsze pusta (nic nie podajesz).

Stałe w szablonie Word (bez formularza): rodzaj odpadów (`15 01 06`), operator KSK Zwrotka, ilość worków jako kropki w szablonie, uwagi / podstawa prawna. **Bez** listy plomb.

### 5. Reguła Bolęcin

Gdy rodzaj zbiórki zawiera **manualną** — tj. `manualna` **lub** `manualna i automatyczna` — domyślnie podpowiedz miejsce dostawy = **„Biosystem”** — pozycja z listy `podwyko lista.xlsx` (Nazwa = „Biosystem”, adres w kolumnie „Dane” to `32-540 Bolęcin, ul Fabryczna 5`). Na liście miejsc dostawy **nie ma** wiersza nazwanego literalnie „Bolęcin” — to etykieta „Biosystem” odpowiada adresowi w Bolęcinie (edytowalne).  
Przy **czystej `automatyczna`** — brak auto-podstawienia; pole „miejsce dostawy” zostaje puste do wyboru z listy.  
Zmiana zbiórki w tej samej sesji nie kasuje ręcznie wybranego celu. Nowy modal + zbiórka z manualną → znowu „Biosystem”.

### 6. Multi-select / hurt

Jak mapa plomb: zaznaczenie wielu → wspólne pola → osobny Word + osobny wiersz Google na punkt (kolejne numery z API).

### 6a. Protokół łączony (dokładnie 2 miejsca)

Osobny tryb UI (**nie** zmienia hurtu): zaznaczenie **dokładnie dwóch** miejsc na mapie (checkbox „Zaznacz do łączonego”) **lub** przycisk „Protokół łączony (wybór ręczny)” → wspólne pola formularza → **jeden** numer `DM*`, **jeden** wiersz w formatce (adresy sklejone `; `), **dwa** pliki Word (po jednym miejscu załadunku, ten sam numer).

| Pole | Sklejanie |
|------|-----------|
| Adres odbioru (ewidencja) | `Adres1; Adres2` |
| Nazwa kontrahenta (ewidencja) | `NazwaPelna1-NazwaPelna2` |
| znacznik miejsca | ten sam typ → jeden; różne → `Typ1-Typ2` (np. `CD-PLAC`) |
| Word `miejsce_zaladunku` | **Osobno w każdym pliku** — pełna + adres danego miejsca |
| Nazwa pliku `.docx` | skrócona nazwa + data + adres **tego** miejsca (2 pliki) |

Kolejność sklejania = kolejność wyboru na liście (obojętna biznesowo). Przy celu Bolęcin/Biosystem — jeden twin-wiersz ze sklejonymi polami (jak przy pojedynczym zapisie).

### 7. Zapis do Google (formatka)

Wzór kolumn (offline): [`data/formatka-druga-mila.xlsx`](../data/formatka-druga-mila.xlsx). Opis: [`FORMATKA_GOOGLE.md`](FORMATKA_GOOGLE.md).

**Docelowy arkusz online**, do którego faktycznie dopisują się wpisy: [lista-druga-mila](https://docs.google.com/spreadsheets/d/1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0/edit?usp=sharing) (ID: `1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0`). Wpisy idą na **zakładkę miesiąca** nazwaną `{MiesiącPL} {YYYY}` (np. `Sierpień 2026`) — zakładana automatycznie przy pierwszym transporcie w danym miesiącu (miesiąc z Data załadunku / Data odbioru). Numeracja zleceń **ciągła** przez wszystkie zakładki. Nagłówki zweryfikowane — zgodne z tabelą poniżej. Szczegóły Apps Script: [`ARCHITECTURE.md`](ARCHITECTURE.md#formatka-google), [`FORMATKA_SHEET.md`](FORMATKA_SHEET.md).

| Kolumna | Przy generacji z mapy |
|---------|------------------------|
| Numer faktury | Zawsze puste (brak pola w UI) |
| Stawka | Z modala (opcjonalne; nie na Word) |
| Czy protokół zrobiony | **`tak`** przy generacji / realizacji; **`nie`** przy zapisie na `Planowane` |
| Nr zlecenia transportowego | Ten sam co w Word |
| OKNO AWIZACJI | Z modala (opcjonalne; nie na Word) |
| Adres odbioru | Adres (C) miejsca załadunku; protokół łączony: `Adres1; Adres2` |
| Nazwa kontrahenta / podmiot handlowy | Nazwa pełna (A); protokół łączony: `Nazwa1-Nazwa2` |
| Data odbioru | Data z modala |
| Kto odbiera | Przewoźnik |
| Miejsce zrzutu | Miejsce dostawy |
| Rodzaj zbiórki | Z modala |
| Ile worków | Z modala |
| rodzaj traportu | Z modala |
| awizacja | = Dane do awizacji |
| znacznik miejsca | Typ punktu (kolumna D Załadunek: `CD` / `PLAC` / puste); łączony: oba przy różnych typach |

**Drugi arkusz (Bolęcin):** gdy miejsce dostawy = Bolęcin / Biosystem — ten sam transport jest też dopisywany do [arkusza Bolęcin](https://docs.google.com/spreadsheets/d/14NhJtyAwwM0OVEbzP6gN7DYyA1kJZfzyVEA1N5EL3sc/edit) (zakładki miesięczne; kolumny: Okno awizacji, Adres odbioru, Nazwa kontrahenta, Data odbioru, Kto odbiera, Miejsce zrzutu, Rodzaj zbiórki, Ile worków, rodzaj traportu, awizacja). Zapis **równoległy** z formatką główną. Szczegóły: [`FORMATKA_SHEET.md`](FORMATKA_SHEET.md).

### 7a. Planowane + realizacja

Osobna ścieżka **bez** protokołu Word (jedyna w v1):

1. **Zapisz planowane** (modal single) — rezerwacja `DM*` + wiersz na zakładkę **`Planowane`** (`Czy protokół = nie`). Bez Worda, bez arkusza Bolęcin. Pola jak dziś (opcjonalne).
2. **Planowane** (przycisk na mapie) — lista z API → wybór → modal z prefillem (ten sam numer).
3. **Realizacja** — „Pobierz .docx”: Word + wiersz w zakładce miesiąca (`Czy protokół = tak`) + Bolęcin jeśli cel Biosystem/Bolęcin + usunięcie z `Planowane`. Numer bez zmian.
4. **Tylko zapisz w Excelu** — ten sam zapis co „Pobierz .docx” / realizacja / hurt / łączony / stały odbiór (`Czy protokół = tak`, Bolęcin jeśli dotyczy), **bez** generacji i pobierania Worda. Wymaga Web App.
5. Opcjonalnie: zapis zmian w planowanym / usunięcie (anulowanie rezerwacji).

Hurt i protokół łączony **nie** obsługują planowania w v1. Brak zapisu „bez protokołu” (`Czy protokół = nie`) prosto do zakładki miesiąca — „Tylko zapisz w Excelu” zapisuje do miesiąca z `Czy protokół = tak`, tylko bez pliku Word.

### 8. Numeracja zlecenia

- Podgląd (`previewNumber` / `modalData`) + atomowy POST jak w `arkusz-mapa` (Apps Script + LockService).
- Ten sam numer → Word i kolumna „Nr zlecenia transportowego”.
- Prefiks tekstowy: `asd123` → następny `asd124`; `ABC100` → `ABC101` (mieszane prefiksy OK).
- Czysto numeryczne: `1460` → `1461`.
- **Brak numerów na żadnej zakładce:** pierwszy auto-numer = **`DM1`**, potem `DM2`, `DM3`, … (ciągłość przez miesiące — nowa zakładka **nie** resetuje numeracji).
- **Z mapy zawsze auto-numer** — nie wysyłamy pustego numeru przy generacji (przy realizacji: numer z planowanego).
- **Nie „palić” numeru przy podglądzie** — otwarcie modala / preview tylko pokazuje kandydat; rezerwacja dopiero po udanym zapisie wiersza (`Planowane` lub miesiąc).
- **Usunięcie wierszy** (w tym z `Planowane`) — następny numer cofa się według max na **wszystkich** zakładkach. Przykład: były `DM1`…`DM5`, skasowano `DM4` i `DM5` → następny = `DM4`.
- Źródło prawdy i API: [`FORMATKA_SHEET.md`](FORMATKA_SHEET.md).

---

## Zasady Biznesowe

- Na mapie tylko punkty z Załadunek z niepustym adresem.
- Bolęcin ma pierwszeństwo przed „puste” przy klasyfikacji koloru.
- „Bolęcin” jako kolor/typ pinezki na mapie (z `druga-mila.xlsx`) i „Biosystem” jako pozycja listy dostawy (z `podwyko lista.xlsx`) to dwa różne, niepowiązane źródła — auto-podstawienie przy zbiórce manualnej wybiera etykietę **„Biosystem”** z listy dostawy, nie „Bolęcin”.
- Wszystkie pola modala opcjonalne.
- Przy zapisie z generacji / realizacji: „Czy protokół zrobiony” = `tak`; przy planowaniu = `nie`.
- Bez Web App: Word możliwy lokalnie; bez auto-numeru / bez zapisu Sheets.
- Mapa nie edytuje Excela punktów (źródło = plik w repo).
- Generacja protokołu / zapis do Sheets **nie** wymaga przebudowy strony ani Actions.
- Aktualizacja pinezek / list podwykonawców = zmiana Excela + rzadki lokalny rebuild (nie harmonogram CI).

---

## Model wdrożenia i aktualizacja danych

Aplikacja to **jedna statyczna strona** HTML (Leaflet) na GitHub Pages.

| Co | Jak |
|----|-----|
| Codzienna praca (protokoły) | Przeglądarka: Word + POST do Apps Script → formatka Google |
| Zmiana punktów Załadunek | Edycja `data/druga-mila.xlsx` |
| Zmiana przewoźników / miejsc dostawy | Edycja `docs/podwyko lista.xlsx` |
| Odświeżenie mapy po zmianie Excela | Lokalnie: `npm run generate` → commit wygenerowanego `index.html` w rootcie → push |
| Publikacja na Pages | **Bez GitHub Actions.** Pages → „Deploy from a branch”: `main`, folder **`/ (root)`** (GitHub pozwala tylko `/` lub `/docs` — nie `/site`) |

Geokodowanie adresów dzieje się **tylko przy rebuildzie** (cache JSON), nie przy zapisie transportu.

---

## Dane wejściowe (pliki)

| Plik | Opis |
|------|------|
| [`data/druga-mila.xlsx`](../data/druga-mila.xlsx) | Punkty Załadunek / Rozładunek |
| [`docs/pusty.docx`](pusty.docx) | Szablon protokołu DM + tagi |
| [`docs/SZABLON_WORD_tagi.md`](SZABLON_WORD_tagi.md) | Dokumentacja tagów Word |
| [`docs/podwyko lista.xlsx`](podwyko%20lista.xlsx) | Przewoźnik + miejsca dostawy (kopia z `arkusz-mapa/docs/`; kolumna A = etykieta, B = treść do Worda) |
| Formatka Google | [`data/formatka-druga-mila.xlsx`](../data/formatka-druga-mila.xlsx) |

---

## Out of Scope v1

- Symfony / Vue SPA / PostgreSQL.
- Edycja punktów z mapy.
- Pinezki z arkusza Rozładunek.
- Lista plomb w protokole.
- Wypełnianie „Numer faktury” z mapy (Stawka / Okno awizacji — tak, tylko w modalu → Google; znacznik miejsca = typ CD/PLAC z Załadunek).
- Scalenie z mapą plomb.
- Cykliczna regeneracja mapy przez GitHub Actions / `on.schedule` / zewnętrzny cron (model `arkusz-mapa`).

---

## Notatki

- Wzorzec UX: `arkusz-mapa` (search, combobox, Pages, Apps Script), osobny produkt, dane i **model wdrożenia** (statyczna strona + rzadki lokalny rebuild).
- Nazwa kolumny „rodzaj traportu” — jak w formatce (literówka zachowana).

---

**Stack v1:** jedna statyczna strona Leaflet na GitHub Pages + rzadki lokalny build (Node/TS) + Excel w repo + Google Sheets / Apps Script.  
**Nie:** Symfony / Vue / PostgreSQL / cykliczne CI generate.
