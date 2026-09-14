# Context: Odbiór tylko Bolęcin

> **Task:** 0006_bolecin-only-odbior  
> **Last Updated:** 2026-09-14T16:32:00+02:00

## Key files

- `src/buildMapWordModal.ts` — checkbox + payload + UI sync
- `google-apps-script/formatka-log.gs` — obsługa `bolecinOnly` w commit / realize / commitHarm
- `src/isBolecinDestination.ts` — lustro logiki (client inline w modalu)
- `docs/FORMATKA_SHEET.md`, `docs/ARCHITECTURE.md` — dokumentacja API
- `src/buildMapHtml.test.ts` — smoke HTML

## Decisions

- Flaga `bolecinOnly: true` w body (nie osobny mode) — mniej zmian w client routing.
- Bez numeru DM/DMH przy commit/commitHarm bolecinOnly.
- Realizacja bolecinOnly: usuwa Planowane (numer wraca), zapis tylko Bolęcin.
- Word pozostaje dostępny (te same przyciski).

## Dependencies

- Wymaga redeploy Apps Script Web App po zmianie `.gs`.
- Rebuild mapy (`npm run generate`) po zmianie modala.

## Completion notes

- Checkbox „Nie jest drugą milą (tylko Excel Bolęcin)” — tylko przy celu Bolęcin/Biosystem.
- Działa w single, realize, harm, bulk, combined (przez wspólny `buildFormatkaPayload`).

