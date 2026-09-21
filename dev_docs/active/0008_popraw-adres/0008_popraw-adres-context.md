# Context: Popraw adres w Druga Mila

> **Task:** 0008_popraw-adres  
> **Last Updated:** 2026-09-21T19:28:00+02:00

## Key files

| File | Role |
|------|------|
| `src/poprawAdres.ts` | Klucz, match, merge do geocode cache |
| `src/buildMapManualAdmin.ts` | Zakładka UI + POST + apply z Sheets |
| `src/buildMapWordModal.ts` | Przycisk w popupie |
| `src/run.ts` | Fetch poprawek przy generate |
| `google-apps-script/formatka-log.gs` | Arkusz + `addPoprawAdres` + list |
| `docs/FORMATKA_SHEET.md` | Kontrakt API |
| `docs/ARCHITECTURE.md` | Opis pipeline |

## Decisions

- Wzorzec arkusz-mapa, pola dostosowane do DM (bez wojewodztwo).
- Live pin move + runtime apply (lepsze UX niż sam regenerate).
- Redeploy Web App wymagany po zmianie `.gs`.

## Changes (2026-09-21)

- Dodano moduł, UI, Apps Script, hook generate.
- Testy: 163 pass.

## Dependencies

- `DRUGA_MILA_WEBAPP_URL` w `.env` (generate + runtime).
