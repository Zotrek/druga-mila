# Szablon Word — znaczniki Druga Mila

Źródło wizualne: zlecenie DM (Grodków). W repo: [`pusty.docx`](pusty.docx) — kopia DM z wstawionymi tagami `{{…}}`.

Mapa wypełnia dokument tylko tam, gdzie w `.docx` są DOKŁADNIE takie fragmenty (podwójne nawiasy klamrowe):

| Tag | Znaczenie |
|-----|-----------|
| `{{numer_zlecenia_transportowego}}` | Numer z pola / API (ten sam co w formatce Google) |
| `{{miejsce_zaladunku}}` | Nazwa pełna + Adres (kolumny A+C z Załadunek), jedna linia |
| `{{przewoznik}}` | Treść z kolumny B listy podwyko dla wybranej nazwy |
| `{{miejsce_dostawy}}` | Jak przewoźnik: kolumna B dla wybranej nazwy z listy |
| `{{dane_do_awizacji}}` | Nr rejestracyjny z pola awizacji (bez walidacji) |
| `{{data_zaladunku}}` | Data z modala, format `dd.mm.rrrr` |

## Stałe w szablonie (bez tagów)

- Rodzaj transportowanych odpadów: odpad … kodzie 15 01 06
- Operator: KSK Zwrotka S.A. …
- Ilość odebranych worków: kropki + „sztuk” jak w szablonie DM
- Uwagi / podstawa prawna

**Brak** listy plomb (w przeciwieństwie do `arkusz-mapa`).

## Nie trafiają do Word (tylko modal → Google)

- stawka  
- rodzaj zbiórki  
- ile worków  
- rodzaj transportu  

**Numer faktury** — w ogóle nie ma w modalu (kolumna Google zawsze pusta).

Wszystkie tagi mogą być pustymi stringami — pola nieobowiązkowe.

## Jak wstawiać znaczniki

1. Wklej **cały** znacznik naraz (np. `{{miejsce_zaladunku}}`), bez klikania w środek.
2. Przykład: `Miejsce załadunku: {{miejsce_zaladunku}}`
3. Nie używaj pojedynczych nawiasów `{tylko_jeden}`.

## Lista podwykonawców (przewoźnik / miejsce dostawy)

Jak `arkusz-mapa`: `podwyko lista.xlsx`

- Kolumna A — nazwa w UI  
- Kolumna B — treść do Worda („Dane”)  
- Puste B → do dokumentu idzie treść z A  

## Nazwa pobieranego pliku (v1 — zamrożone)

`{nazwa_skrócona} {dd.mm.rr} {fragment_adresu}.docx`

- Nazwa skrócona załadunku (kolumna B); jeśli pusta → `protokol`.
- Data z modala w formacie `dd.mm.rr` (rok 2-cyfrowy); jeśli pusta → bez segmentu daty.
- Fragment adresu (kolumna C), obcięty; znaki niedozwolone w nazwie pliku (`\/:*?"<>|`) → spacje; wielokrotne spacje → jedna; trim; limit całej nazwy bazowej ~80 znaków.
