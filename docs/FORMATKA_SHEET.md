# Formatka Google — integracja z mapą Druga Mila

Rejestr zleceń (arkusz **lista-druga-mila**) synchronizuje się z mapą HTML na GitHub Pages przez **Google Apps Script Web App**.

Szczegóły kolumn: [`FORMATKA_GOOGLE.md`](FORMATKA_GOOGLE.md). Plan techniczny: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Arkusz

- **Nazwa:** lista-druga-mila
- **ID:** `1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0`
- **URL:** https://docs.google.com/spreadsheets/d/1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0/edit
- **Zakładki:** miesięczne, np. `Sierpień 2026` (pełna nazwa PL + rok); stała zakładka **`Planowane`** (rezerwacje bez protokołu); stała zakładka **`Harmonogram`** (szablon stałych odbiorów — bez numeracji DM/DMH). Historyczny `Arkusz1` może pozostać i jest skanowany do numeracji DM.
- **Wiersz 1 — nagłówki (16 kolumn, jak Sierpień 2026):** Numer faktury, Stawka, Czy protokół zrobiony, **uwagi**, Nr zlecenia transportowego, OKNO AWIZACJI, Adres odbioru, Nazwa kontrahenta / podmiot handlowy, Data odbioru, Kto odbiera, Miejsce zrzutu, Rodzaj zbiórki, Ile worków, rodzaj traportu, awizacja, znacznik miejsca
- **Migracja:** Starsze zakładki (np. Lipiec) mogą mieć `Uwagi` na końcu albo bez tej kolumny — Apps Script mapuje zapis/odczyt **po nagłówkach**. Nowe zakładki dostają układ Sierpień.

### Zakładki miesięczne

| Reguła | Zachowanie |
|--------|------------|
| Kiedy nowa zakładka | Przy **pierwszym** zapisie transportu w danym miesiącu (jeśli zakładka jeszcze nie istnieje) |
| Nazwa | `{MiesiącPL} {YYYY}` — np. `Sierpień 2026` |
| Źródło miesiąca | Pole `dataOdbioru` z POST (= Data załadunku / Data odbioru z modala, format `dd.mm.rrrr`) |
| Brak / zła data | Fallback: data bieżąca (timezone skryptu Google) |
| Nagłówki | Przy tworzeniu zakładki kopiowane wiersz 1 (16 kolumn jak wyżej) |
| Numeracja | **Ciągła seria DM*** — skan kolumny „Nr zlecenia” (w tym `Planowane`), **z pominięciem** `DMH*` |

### Zakładka Planowane

| Reguła | Zachowanie |
|--------|------------|
| Nazwa | Stała: `Planowane` (tworzona przy pierwszym zapisie planowanym) |
| Kolumny | Te same 16 co zakładki miesięczne |
| Planowanie | POST `mode: "plan"` — rezerwacja `DM*`, `Czy protokół = nie`, **bez** Worda, **bez** arkusza Bolęcin |
| Realizacja | POST `mode: "realize"` — append do miesiąca (`Czy protokół = tak`) + Bolęcin jeśli trzeba + usunięcie wiersza z `Planowane`; ten sam numer |
| Lista | GET `action=listPlanowane` |
| Update / delete | POST `mode: "updatePlan"` / `"deletePlan"` (bez Word / Bolęcin) |

### Zakładka Harmonogram (stałe odbiory)

| Reguła | Zachowanie |
|--------|------------|
| Nazwa | Stała: `Harmonogram` |
| Kolumny | Stawka, uwagi, Adres odbioru, Nazwa kontrahenta, **II Adres odbioru**, **II Nazwa kontrahenta**, **Dzień odbioru**, Kto odbiera, Miejsce zrzutu, Rodzaj zbiórki, Ile worków, rodzaj traportu, awizacja, znacznik miejsca |
| Lista | GET `action=listHarmonogram` (mapowanie po nagłówkach; kolejność kolumn może się różnić) |
| Dodaj | POST `mode: "addHarmonogram"` — tylko szablon; bez DM/DMH, bez miesiąca, bez Bolęcin |
| Generacja z mapy | UI proponuje daty z „Dzień odbioru” (edytowalne) → N× POST `commitHarm` (seria **DMH1…**) + Word; wiersz Harmonogramu **zostaje** |
| **Łączony (II)** | Gdy **II Adres** lub **II Nazwa** niepuste: jak protokół łączony — na termin **1× DMH*** (adresy `Adres1; Adres2`, nazwy `Nazwa1-Nazwa2`) + **2× Word** (osobno I i II) |
| Numeracja DMH | Osobna pula; GET `previewNumberHarm`; skan tylko `DMH*` |

> Osobny arkusz i osobny Web App względem mapy plomb (`arkusz-mapa`) — **nie** współdzielić numeracji.

## Arkusz Bolęcin (drugi zapis)

Gdy **miejsce zrzutu** to Bolęcin (etykieta/adres zawiera „Bolęcin” / „Bolecin” **lub** „Biosystem”), Apps Script dopisuje wiersz **dodatkowo** do drugiego arkusza — równolegle do formatki głównej (zawsze oba).

- **URL:** https://docs.google.com/spreadsheets/d/14NhJtyAwwM0OVEbzP6gN7DYyA1kJZfzyVEA1N5EL3sc/edit
- **ID:** `14NhJtyAwwM0OVEbzP6gN7DYyA1kJZfzyVEA1N5EL3sc`
- **Zakładki:** miesięczne jak w formatce głównej (`Sierpień 2026`, …) z `dataOdbioru`
- **Kolumny (10):** Okno awizacji, Adres odbioru, Nazwa kontrahenta / podmiot handlowy, Data odbioru, Kto odbiera, Miejsce zrzutu, Rodzaj zbiórki, Ile worków, rodzaj traportu, awizacja
- **Bez** numeracji zlecenia / stawki / znacznika miejsca / „Czy protokół” / **Uwagi**
- Wymaga, by konto wdrażające Web App miało **edycję** tego arkusza (`SpreadsheetApp.openById`)

## Wdrożenie Apps Script (jednorazowo)

1. Otwórz arkusz formatki → **Rozszerzenia → Apps Script**.
2. Skopiuj treść [`google-apps-script/formatka-log.gs`](../google-apps-script/formatka-log.gs) do edytora (usuń / zastąp domyślny `Code.gs`).
3. **Wdróż → Nowe wdrożenie → Typ: Aplikacja internetowa**
   - Wykonaj jako: **Ja**
   - Kto ma dostęp: **Każdy**
4. Skopiuj **URL aplikacji internetowej** (kończy się na `/exec`).
5. W lokalnym `.env` ustaw:
   - `DRUGA_MILA_WEBAPP_URL=https://script.google.com/macros/s/…/exec`
6. Opcjonalnie: `GOOGLE_FORMATKA_SHEETS_ID=1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0`
7. Uruchom lokalnie `npm run generate` — URL trafia do wygenerowanego `index.html`.

Po każdej zmianie kodu `.gs`: **Deploy → Manage deployments → Edit → New version**.

## API Web App

| Metoda | Parametry | Opis |
|--------|-----------|------|
| GET | `action=previewNumber` | Podgląd następnego **DM*** (skan bez `DMH*`, bez rezerwacji) |
| GET | `action=modalData` | Jak previewNumber |
| GET | `action=previewNumberHarm` | Podgląd następnego **DMH*** (bez rezerwacji) |
| GET | `action=listPlanowane` | `{ ok, rows: [{ rowIndex, numer, …pola kolumn }] }` |
| GET | `action=listHarmonogram` | `{ ok, rows: [{ rowIndex, dzienOdbioru, adresOdbioruIi?, nazwaKontrahentaIi?, …pól }] }` |
| POST | JSON w body (`Content-Type: text/plain`) | LockService → wg `mode` (poniżej); zwrot `{ ok, numer? }` |

### POST `mode`

| `mode` | Zachowanie |
|--------|------------|
| *(brak)* / `commit` | Append do zakładki miesiąca + Bolęcin jeśli cel Biosystem/Bolęcin; seria **DM***; pole `uwagi` → kolumna Uwagi |
| `plan` | Append do `Planowane`; wymusza `Czy protokół = nie`; **bez** Bolęcina; numer auto jak commit |
| `realize` | Wymaga `numer` + `planowaneRow`; append miesiąca + Bolęcin; `deleteRow` w `Planowane` |
| `updatePlan` | Wymaga `planowaneRow`; nadpisuje pola wiersza (numer bez zmian); bez Bolęcina |
| `deletePlan` | Wymaga `planowaneRow`; usuwa wiersz z `Planowane` (numer wraca do puli przy następnym skanie) |
| `addHarmonogram` | Append wiersza do `Harmonogram` (12 kolumn); bez numeru / miesiąca / Bolęcin |
| `commitHarm` | Jak commit, ale seria **DMH***; Harmonogram bez zmian |

> Przeglądarka często wysyła POST jako `text/plain` (unikanie preflight CORS) — Web App musi czytać `e.postData.contents` i `JSON.parse`, nie polegać na `application/json`.

### Numeracja

| Reguła | Zachowanie |
|--------|------------|
| Start DM | Brak numerów DM (poza DMH) → **`DM1`** |
| Start DMH | Brak `DMH*` → **`DMH1`** |
| Źródło prawdy DM | Kolumna „Nr zlecenia” — skan z **pominięciem** `DMH*` |
| Źródło prawdy DMH | Ten sam skan, **tylko** `^DMH\d+$` |
| Auto | Inkrement końcowej liczby w danej serii |
| Podgląd | **Nie pali** numeru |
| Usunięcie wierszy | Następny numer **cofa się** w danej serii |
| Mieszane prefiksy (poza DMH) | Max po liczbie końcowej; remis → późniejszy wiersz (zaakceptowane) |
| Property `formatkaLastNumber` | Cache po udanym zapisie — nie jest źródłem prawdy przy preview |

Funkcja **`rebuildFormatkaCounterFromSheet`** (Run) — opcjonalna synchronizacja cache po dużej ręcznej edycji; do poprawnego preview/POST **nie jest wymagana** (i tak jest skan).

### Przykład POST (body)

```json
{
  "numer": "DM2",
  "numerFaktury": "",
  "stawka": "150",
  "czyProtokolZrobiony": "tak",
  "oknoAwizacji": "8:00–12:00",
  "adresOdbioru": "32-540 Bolęcin, ul Fabryczna 5",
  "nazwaKontrahenta": "Przykładowy kontrahent",
  "dataOdbioru": "20.07.2026",
  "ktoOdbiera": "Janex",
  "miejsceZrzutu": "Biosystem",
  "miejsceDostawyAdres": "32-540 Bolęcin, ul Fabryczna 5",
  "rodzajZbiorki": "manualna",
  "ileWorkow": "10",
  "rodzajTransportu": "busy",
  "awizacja": "WX12345",
  "znacznikMiejsca": "CD",
  "uwagi": "uwaga tylko do Google"
}
```
## Lokalnie

W `.env`:

```env
DRUGA_MILA_WEBAPP_URL=https://script.google.com/macros/s/…/exec
GOOGLE_FORMATKA_SHEETS_ID=1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0
GOOGLE_BOLECIN_SHEETS_ID=14NhJtyAwwM0OVEbzP6gN7DYyA1kJZfzyVEA1N5EL3sc
```

Bez `DRUGA_MILA_WEBAPP_URL` mapa generuje protokoły **bez** zapisu do arkusza (bez auto-numeru z API).

## Limity Apps Script

Darmowe konto Google — dzienne limity czasu wykonania i liczby wywołań. Przy typowej pracy kilku osób dziennie wystarcza. Szczegóły: [Google Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).
