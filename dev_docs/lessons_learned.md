# Lessons Learned — Druga Mila

> Pamięć projektowa. Zapisujemy błędy, odkrycia i wnioski.
> Pełniejszy dziennik monorepo: [`../../dev_docs/lessons_learned.md`](../../dev_docs/lessons_learned.md).

---

## Wpisy

### Issue #1: Modal „Dodaj dane ręcznie” bez formularza — Event zamiast zakładki (2026-09-29)

#### Co wykryto:
- Po „+ Dodaj dane (ręcznie)” widać tylko zakładki i „Zamknij” — brak pól (nazwa, adres, Zapisz).
- Pinezka załadunku „nie pojawia się na mapie”, bo użytkownik nie może dokończyć zapisu.

#### Root Cause:
- `addEventListener('click', openManualAdminModal)` → pierwszy argument to **MouseEvent**, nie `'zal'`.
- `switchManualAdminTab(event)` nie aktywuje żadnego panelu.

#### Rozwiązanie:
1. **Fix:** Listener z jawnym `openManualAdminModal('zal')` + guard `typeof tab === 'string'`.
2. **Proces:** Nie przekazywać funkcji z parametrem biznesowym bezpośrednio do `addEventListener`.
3. **Automatyzacja:** Aserty w `buildMapHtml.test.ts` na wzorzec listenera.

Szczegóły (monorepo): Issue #4 w `dev_docs/lessons_learned.md`.
