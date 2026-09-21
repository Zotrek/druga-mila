# Plan: Popraw adres w Druga Mila

> **Task:** 0008_popraw-adres  
> **Status:** in progress  
> **Accepted:** 2026-09-21

## Cel

Dodać w mapie Druga Mila opcję **Popraw adres** wzorowaną na arkusz-mapa: poprawka współrzędnych z popupia / modala, zapis do arkusza Google, natychmiastowe przesunięcie pinezki oraz uwzględnienie przy `npm run generate`.

## Decyzje

- Osobna zakładka **Popraw adres** (nie edycja „Miejsca załadunku”).
- Pola DM: `nazwaPelna`, `nazwaSkrocona`, `adres`, `lat`, `lon`, `uwagi`.
- Klucz upsert: `adres|nazwaPelna|nazwaSkrocona` (znormalizowany).
- Po zapisie: live `setLatLng`; przy starcie: `listReferenceData.poprawAdres` nakłada poprawki.
- Generate: GET Web App → merge do `geocode-cache.json` przed `attachCoords`.
- `seedReferenceData` **nie** czyści zakładki Popraw adres.

## Poza zakresem

- Województwo / podmiot / sklep (model plomb).
- Delete UI dla miejsc załadunku.
