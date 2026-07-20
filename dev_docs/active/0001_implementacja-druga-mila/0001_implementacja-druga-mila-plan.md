# Plan: Implementacja Druga Mila (mapa + Word + formatka)

> **Data:** 2026-07-20  
> **Status:** APPROVED (technicznie) — podpis biznesowy w ARCHITECTURE  
> **Estymacja:** ~2–4 dni | Złożoność: MEDIUM  
> **Numer startowy:** `DM1`

---

## Proponowane Rozwiązanie

Jedna statyczna mapa Leaflet na GitHub Pages (root `index.html`), budowana rzadko lokalnie z Excela. Runtime: Word w przeglądarce + Apps Script → formatka Google. Wzorzec UX z `arkusz-mapa`, **bez** CI/cron.

Źródła prawdy: `docs/SPECIFICATION.md`, `docs/ARCHITECTURE.md`, `docs/FORMATKA_SHEET.md`.

---

## Fazy

| Faza | Zakres | Checkpoint |
|------|--------|------------|
| **1** | Scaffold: `package.json`, TS, Vitest, `config.ts`, `.env.example` | `npm run build` + `npm test` (puste/placeholder OK) |
| **2** | `readPoints` + `classify` + testy | Unit: kolory, pomijanie pustego C |
| **3** | `readPodwyko` + `geocode` + cache `data/geocode-cache.json` | Generate bez HTML: log liczby punktów / cache |
| **4** | `buildMapHtml`: mapa, legenda, search, filtr typu | Otworzyć HTML lokalnie — pinezki + filtry |
| **5** | Modal: pola, Bolęcin→Biosystem, Word (docxtemplater), nazwa pliku | Pobranie `.docx` bez Web App |
| **6** | Apps Script: wdrożenie `formatka-log.gs`, embed URL, POST/GET | Zapis wiersza + `DM1`→`DM2` |
| **7** | Multi-select / hurt + README workflow Pages | Smoke checklist PASS |
| **8** | Polish: empty states, bez Web App graceful, docs sync | CP full |

---

## Security Check

- [ ] Publiczny Pages — OK wg SPEC
- [ ] Web App „Anyone” — jak plomby; akceptacja v1
- [ ] Brak Service Account w repo
- [ ] `.env` nie commitowany

---

## Review

- [x] Start numeru `DM1`
- [x] Env / cache / moduły / testy w ARCHITECTURE
- [x] Podpis biznesowy (mieszane prefiksy + model statyczny + numeracja)
