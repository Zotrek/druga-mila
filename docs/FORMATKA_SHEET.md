# Formatka Google — integracja z mapą Druga Mila

Rejestr zleceń (arkusz **lista-druga-mila**) synchronizuje się z mapą HTML na GitHub Pages przez **Google Apps Script Web App**.

Szczegóły kolumn: [`FORMATKA_GOOGLE.md`](FORMATKA_GOOGLE.md). Plan techniczny: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Arkusz

- **Nazwa:** lista-druga-mila
- **ID:** `1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0`
- **URL:** https://docs.google.com/spreadsheets/d/1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0/edit
- **Zakładka:** `Arkusz1`
- **Wiersz 1 — nagłówki (14 kolumn):** Numer faktury, Stawka, Czy protokół zrobiony, Nr zlecenia transportowego, Adres odbioru, Nazwa kontrahenta / podmiot handlowy, Data odbioru, Kto odbiera, Miejsce zrzutu, Rodzaj zbiórki, Ile worków, rodzaj traportu, awizacja, znacznik miejsca

> Osobny arkusz i osobny Web App względem mapy plomb (`arkusz-mapa`) — **nie** współdzielić numeracji.

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
| GET | `action=previewNumber` | Podgląd następnego numeru (**skan arkusza**, bez rezerwacji) |
| GET | `action=modalData` | Jak preview — `{ ok, numer }` (**bez** ostatniej daty transportu) |
| POST | JSON w body (`Content-Type: text/plain`) | LockService → append wiersza → dopiero wtedy numer jest „zużyty”; zwrot `numer` |

> Przeglądarka często wysyła POST jako `text/plain` (unikanie preflight CORS) — Web App musi czytać `e.postData.contents` i `JSON.parse`, nie polegać na `application/json`.

### Numeracja

| Reguła | Zachowanie |
|--------|------------|
| Start | Pusty arkusz → następny = **`DM1`** |
| Źródło prawdy | Kolumna „Nr zlecenia transportowego” w arkuszu (skan przy każdym preview/POST) |
| Auto | Inkrement końcowej liczby względem **max w arkuszu**: `DM1`→`DM2`, `ABC100`→`ABC101` |
| Podgląd | **Nie pali** numeru — tylko czyta skan; zamknięcie modala bez generacji nic nie rezerwuje |
| Z mapy | **Zawsze auto** przy generacji (POST bez pustego numeru / serwer wylicza z arkusza) |
| Usunięcie wierszy | Następny numer **cofa się** (brakuje `DM5` w arkuszu → znowu można dostać `DM5`) |
| Mieszane prefiksy | Max po liczbie końcowej; remis → późniejszy wiersz (zaakceptowane) |
| Ręczny `numer` w POST | Tylko awaryjnie (API); mapa v1 nie polega na nadpisie |
| Property `formatkaLastNumber` | Cache po udanym zapisie — nie jest źródłem prawdy przy preview |

Funkcja **`rebuildFormatkaCounterFromSheet`** (Run) — opcjonalna synchronizacja cache po dużej ręcznej edycji; do poprawnego preview/POST **nie jest wymagana** (i tak jest skan).

### Przykład POST (body)

```json
{
  "numer": "DM2",
  "numerFaktury": "",
  "stawka": "150",
  "czyProtokolZrobiony": "tak",
  "adresOdbioru": "32-540 Bolęcin, ul Fabryczna 5",
  "nazwaKontrahenta": "Przykładowy kontrahent",
  "dataOdbioru": "20.07.2026",
  "ktoOdbiera": "Janex",
  "miejsceZrzutu": "Biosystem — …",
  "rodzajZbiorki": "manualna",
  "ileWorkow": "10",
  "rodzajTransportu": "busy",
  "awizacja": "WX12345",
  "znacznikMiejsca": ""
}
```

## Lokalnie

W `.env`:

```env
DRUGA_MILA_WEBAPP_URL=https://script.google.com/macros/s/…/exec
GOOGLE_FORMATKA_SHEETS_ID=1-qRyFnpjvAI1pZYkVXOUKKV9oYlxGsLidDXCtxYWzS0
```

Bez `DRUGA_MILA_WEBAPP_URL` mapa generuje protokoły **bez** zapisu do arkusza (bez auto-numeru z API).

## Limity Apps Script

Darmowe konto Google — dzienne limity czasu wykonania i liczby wywołań. Przy typowej pracy kilku osób dziennie wystarcza. Szczegóły: [Google Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).
