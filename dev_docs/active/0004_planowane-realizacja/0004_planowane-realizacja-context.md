# Context: Planowane + realizacja

> **Last Updated:** 2026-08-03  
> **Task:** 0004_planowane-realizacja  
> **Status:** IMPLEMENTED — kod + docs + `index.html`; czekamy na Deploy `.gs` + smoke

## Progress

| Krok | Status |
|------|--------|
| Decyzje biznesowe | ✅ |
| Plan w `dev_docs` | ✅ |
| Docs SPEC / FORMATKA / ARCH | ✅ |
| Apps Script | ✅ |
| UI modal + lista | ✅ |
| Testy + generate | ✅ (`npm test` 90) |
| Deploy Apps Script (manual) | ⏳ użytkownik |

## Key files

| Plik | Rola |
|------|------|
| `google-apps-script/formatka-log.gs` | Planowane sheet + API modes |
| `src/buildMapWordModal.ts` | Zapisz planowane, lista, realize |
| `src/buildMapHtml.ts` | Przycisk „Planowane” |
| `index.html` | Wygenerowany artefakt Pages |
| `docs/FORMATKA_SHEET.md` | Kontrakt API |
| `docs/SPECIFICATION.md` | §7a planowane |
| `docs/ARCHITECTURE.md` | Flow |

## Decisions (2026-08-03)

| Decyzja | Wartość |
|---------|---------|
| Jedyna ścieżka bez protokołu | Zakładka `Planowane` |
| Kolumny Planowane | Te same 15 co miesiące |
| `czyProtokolZrobiony` | `nie` na planie; `tak` przy realizacji |
| Numeracja | Skan obejmuje `Planowane` |
| Realizacja | `mode: realize` + ten sam `numer` + `planowaneRow` |

## Implementation notes

- POST body `mode`: brak / `commit` = dotychczasowy zapis; `plan` / `realize` / `updatePlan` / `deletePlan`.
- GET `action=listPlanowane` → `{ ok, rows: [{ rowIndex, …pola }] }`.
- UI realize: numer read-only; „Zapisz zmiany” = `updatePlan`; „Usuń” = `deletePlan`.
- Prefill załadunku: match adres / nazwa vs `LOAD_POINTS`; fallback z wiersza planowanego.
