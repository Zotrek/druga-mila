# Plan: Harmonogram — częstotliwość + pierwszy dzień

> **Task:** 0007_harmonogram-czestotliwosc  
> **Status:** done (code)  
> **Accepted:** 2026-09-14

## Zakres

- Select: co tydzień / co dwa tygodnie / co miesiąc
- Pole: Pierwszy dzień obowiązywania (dd.mm.rrrr)
- Propozycja dat przy generacji z Harmonogramu wg częstotliwości
- Kolumny w arkuszu + ensure na istniejących sheetach

## Reguły dat

| Częstotliwość | Zachowanie |
|---------------|------------|
| co tydzień | Jak dotychczas + nie wcześniej niż pierwszy dzień |
| co dwa tygodnie | Co 14 dni od pierwszego dnia (wymagany) |
| co miesiąc | Raz/miesiąc: weekday ≥ dzień-miesiąca kotwicy |
