# Plan: Odbiór tylko do Excela Bolęcin (nie 2 mila)

> **Task:** 0006_bolecin-only-odbior  
> **Status:** in progress  
> **Accepted:** 2026-09-14

## Cel

W modalu mapy — przy celu Bolęcin/Biosystem — możliwość oznaczenia odbioru jako **nie druga mila**: zapis **tylko** do arkusza Bolęcin, **bez** formatki `lista-druga-mila` i **bez** spalenia numeru DM/DMH.

## UX (zaakceptowane)

1. Checkbox widoczny **tylko** gdy miejsce dostawy = Bolęcin/Biosystem.
2. Dotyczy: pojedynczy odbiór, realizacja z Planowanych, stały odbiór (harmonogram), hurt, protokół łączony.
3. Przyciski bez zmian: „Pobierz .docx” + „Tylko zapisz w Excelu” (Word opcjonalnie jak dziś).

## Zachowanie

| Tryb | Z `bolecinOnly` |
|------|-----------------|
| `commit` / `commitHarm` | Tylko `appendBolecinRow_`; bez formatki; bez numeru |
| `realize` | Tylko Bolęcin + usuń z Planowane; numer z Planowane wraca do puli (Word może go użyć) |
| `plan` / `updatePlan` | Flaga ignorowana / „Zapisz planowane” wyłączone gdy checkbox zaznaczony |

## Technicznie

- POST: flaga `bolecinOnly: true` + istniejące `mode`
- Apps Script: walidacja `isBolecinDestination_`; inaczej błąd
- Modal: sync widoczności checkboxa przy zmianie miejsca dostawy
