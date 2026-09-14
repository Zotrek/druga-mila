# Code Review: Harmonogram częstotliwość + bolecinOnly

> **Last Updated:** 2026-09-14  
> **Scope:** `harmonogramDates.ts`, browser mirror in `buildMapWordModal.ts`, Apps Script Harmonogram columns + bolecinOnly handlers  
> **Tasks:** 0007_harmonogram-czestotliwosc, 0006_bolecin-only-odbior  
> **Focus:** Correctness bugs only (not style)

---

## Executive Summary

One **critical** template-escape bug breaks browser `parseDotDateLocal`: `\d` is emitted as literal `d`, so first-day parsing always fails. That blocks saving biweekly entries, rejects any filled „pierwszy dzień”, and makes frequency proposals ignore the anchor in the UI.

Secondary: weekly proposals use `firstDay`’s day-of-month for the „from day 22 include next month” window (should use `today`), so early-in-month sessions with a late `firstDay` over-propose into the next month. TS module and browser mirror share this logic once parsing works.

bolecinOnly handlers and Harmonogram column ensure/mapping look sound for the intended flows.

---

## Critical Issues (must fix)

### C1. Browser `parseDotDateLocal` regex — `\d` eaten by template literal

**Where:** `src/buildMapWordModal.ts` (~1034), inside `wordModalBrowserScript()` template string.

**Source (wrong):**
```js
s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
```

**Emitted into HTML (broken):**
```js
s.match(/^(d{1,2})[./-](d{1,2})[./-](d{4})$/)
```

**Why:** Untagged template literals treat `\d` as identity escape → `d`. Other date parsers in the same file correctly use `\\d`.

**Impact:**
1. `parseDotDateLocal(...)` always returns `null` for real dates (`25.08.2026`, etc.).
2. **Save biweekly is impossible:** form requires `pierwszyDzien`, then validation `!parseDotDateLocal(firstDayRaw)` always fails → alert „użyj formatu dd.mm.rrrr”.
3. Weekly/monthly save with a filled first day also fails for the same reason.
4. Generation from Harmonogram: `pierwszyDzienObowiazywania` never applied → biweekly grid anchors on `today`; monthly uses today as day-of-month (wrong dates vs TS/`harmonogramDates.ts`).

**Verified:** evaluated emitted script → `parseDotDateLocal('25.08.2026') === null`; monthly from row with `05.08.2026` / today `22.08` returned `24.08` + `28.09` instead of TS’s `07.09.2026`.

**Fix:** Escape like neighboring helpers:
```js
s.match(/^(\\d{1,2})[.\\/-](\\d{1,2})[.\\/-](\\d{4})$/)
```
(or equivalent double-escaped form that emits `\d` in the browser). Re-run `npm run generate` and smoke-test save + propose with first day set.

---

## Important Improvements (should fix)

### I1. Weekly window keyed off `firstDay`, not `today`

**Where:** `src/harmonogramDates.ts` — `proposeWeekly` → `datesForWeekdaysInMonth(weekdays, start)`; mirrored in browser `proposeHarmonogramDates` weekly branch.

**Bug:** `datesForWeekdaysInMonth` decides „include next month” from `start.getDate() >= 22`. When `firstDay` is later than `today` and falls on day ≥ 22, next month is included even if `today` is before the 22nd.

**Example (TS, after C1 fixed):**  
`today = 11.08.2026`, `firstDay = 25.08.2026`, `poniedziałek` →  
`['31.08.2026', '07.09.2026', …]`  
Expected (window = current month only): `['31.08.2026']`.

Biweekly/monthly correctly use `proposalWindowEnd(today)`.

**Fix:** Drive the proposal window from `today` (e.g. filter `datesForWeekdaysInMonth(weekdays, today)` with `d >= max(today, firstDay)`, or pass an explicit end / `filterStart` separate from window base). Mirror the same change in the browser copy. Add a unit test for this case.

### I2. Browser biweekly multi-weekday list not sorted

**Where:** Browser `proposeHarmonogramDates` biweekly branch returns `out` without sort; TS `proposeBiweekly` sorts chronologically.

**Impact:** e.g. `poniedziałek/środa` → browser order all Mondays then Wednesdays (`03, 17, 31, 05, 19…`); TS → chronological. Excel/Word commit follows list order.

**Fix:** Sort by parsed date before return (same as TS), or share one implementation.

### I3. Biweekly without `pierwszyDzien` on generate

**Where:** `proposeBiweekly` / browser mirror: `anchor = firstDay || today`. Form save requires first day for biweekly; sheet rows edited by hand / pre-C1 saves can omit it.

**Impact:** Silent wrong 14-day grid (anchored on „today” each open).

**Fix:** If biweekly and missing/invalid first day, show empty list + hint (or block generate), consistent with save validation.

---

## Medium / Edge cases

### M1. Monthly with empty weekdays still proposes day-of-month

Empty / unparseable `dzienOdbioru` → weekly/biweekly `[]`; monthly still emits calendar day of anchor (`05.08.2026` for „do ustalenia”). Confirm product intent; if weekdays are required, return `[]` like other frequencies.

### M2. bolecinOnly + Word: empty `numer`

`commit` / `commitHarm` bolecinOnly responses omit `numer` (correct). Client still downloads Word with blank number when not „tylko Excel”. Acceptable per plan; optional UX: skip Word number preview or warn.

### M3. `ensureHarmonogramExtraColumns_` appends at end

Existing sheets get „Częstotliwość” / „Pierwszy dzień…” as **last** columns; new sheets get them after „Dzień odbioru”. Safe because read/write go through `fieldKeyFromHeader_` / `buildHarmonogramRowValuesForSheet_`. Document for operators; optional later: insert at canonical index only if migrating carefully with data shift.

### M4. Client vs Apps Script Bolęcin normalize differ (NFD vs explicit PL map)

Both match „bolęcin” / „biosystem” for normal labels; low risk of UI showing checkbox but server rejecting (or vice versa) on exotic unicode. Align only if a real mismatch appears.

---

## What looks correct

### Frequency logic (`harmonogramDates.ts`)

- Weekday parsing (diacritics, slash lists, „zaproponowano …”) — solid; tests pass.
- `parseHarmFrequency` defaults unknown → weekly (backward compatible).
- Biweekly 14-day grid from first weekday on/after anchor — correct for covered tests.
- Monthly „first weekday on/after day-of-month of anchor” + `proposalWindowEnd(today)` from day 22 — correct when first day parses.
- `parseDotDate` validation (incl. invalid calendar days) — correct in TS module.

### Harmonogram UI / payload (`buildMapWordModal.ts`)

- Select values `co tydzień` / `co dwa tygodnie` / `co miesiąc` match parser.
- Payload includes `czestotliwosc` + `pierwszyDzienObowiazywania`; edit fill/reset defaults weekly.
- Biweekly requires first day on save (intent correct; blocked today by C1).
- Proposed dates are editable/removable before commit.

### Apps Script — Harmonogram columns (`formatka-log.gs`)

- `HARMONOGRAM_HEADER_ROW` + `HARM_COL` include new fields.
- `ensureHarmonogramExtraColumns_` + call sites on get/list — good for existing sheets.
- `fieldKeyFromHeader_`: „pierwszy dzień…” before „dzień odbioru”; częstotliwość with/without diacritics — correct, avoids mis-map.
- `buildHarmonogramRowValues_` / `ForSheet_` write both new fields; `cellStr_` formats sheet Dates to `dd.mm.rrrr`.

### Apps Script + UI — bolecinOnly (0006)

- `isBolecinOnly_` accepts boolean / `'true'` / `1`.
- `commit` / `commitHarm` → Bolęcin only, no formatka, no DM/DMH — correct.
- `realize` → Bolęcin + `deleteRow` Planowane + `syncCounterAfterWrite_` (number returns to pool) — correct.
- Rejects bolecinOnly when destination is not Bolęcin/Biosystem.
- Checkbox hidden unless destination matches; unchecked when destination changes away; „Zapisz planowane” disabled — matches plan.
- `buildFormatkaPayload` sets `bolecinOnly: true` for single / bulk / harm / realize / combined paths that use it.

---

## Architecture Considerations

- Duplicated date logic (TS module vs large browser string) caused C1 to land only in the mirror while unit tests stayed green. Prefer generating the mirror from `harmonogramDates.ts`, or a shared smoke test that evaluates `wordModalBrowserScript()` and asserts `parseDotDateLocal('01.09.2026')` and a known `proposeHarmonogramDates` vector.
- bolecinOnly as a flag on existing modes (not a new mode) keeps routing simple and matches the accepted plan.

---

## Next Steps

1. **Fix C1** (`\\d` in `parseDotDateLocal`) — unblock biweekly save and first-day proposals.
2. **Fix I1** (weekly window from `today`) + unit test; sync browser mirror.
3. **Fix I2** (sort biweekly in browser) and optionally **I3** (block/empty on biweekly without anchor).
4. Redeploy Apps Script if not already; `npm run generate` after modal fixes.
5. Manual smoke: add biweekly with first day → list → generate; bolecinOnly commit/realize/commitHarm.

---

**Please review the findings and approve which changes to implement before I proceed with any fixes.**
