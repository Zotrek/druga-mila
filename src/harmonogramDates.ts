/**
 * Propozycja dat stałego odbioru z kolumny „Dzień odbioru” Harmonogramu.
 * JS getDay(): 0=nd, 1=pn, …, 6=sb.
 */

/** Nazwa dnia (PL, bez diakrytyków) → getDay. */
const WEEKDAY_BY_NORM: Record<string, number> = {
  niedziela: 0,
  niedziele: 0,
  poniedzialek: 1,
  poniedzialki: 1,
  wtorek: 2,
  wtorki: 2,
  sroda: 3,
  srody: 3,
  czwartek: 4,
  czwartki: 4,
  piatek: 5,
  piatki: 5,
  sobota: 6,
  soboty: 6,
};

/** Usuwa diakrytyki PL (w tym ł) → token ASCII do matchowania. */
export function normalizePlDayToken(raw: string): string {
  return String(raw || '')
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/[^a-z]/g, '');
}

/**
 * Wyciąga unikalne dni tygodnia (getDay) z tekstu
 * („poniedziałek”, „poniedziałek/środa/piątek”, „zaproponowano piątek”).
 */
export function parseWeekdaysFromDzienOdbioru(raw: string): number[] {
  const text = String(raw || '').trim();
  if (!text) {
    return [];
  }
  const found = new Set<number>();
  // Tokeny: po / , ; lub spacji — oraz cały znormalizowany ciąg na wypadek sklejenia
  const parts = text.split(/[/;,]+|\s+/);
  for (const part of parts) {
    const norm = normalizePlDayToken(part.replace(/zaproponowano/gi, ''));
    if (!norm) continue;
    for (const [name, day] of Object.entries(WEEKDAY_BY_NORM)) {
      if (norm === name || norm.includes(name)) {
        found.add(day);
      }
    }
  }
  return [...found].sort((a, b) => a - b);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDotDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Daty w miesiącu `today` (ten sam miesiąc/rok) z dnia >= dziś,
 * których getDay() ∈ weekdays. Zwraca dd.mm.rrrr posortowane.
 */
export function datesForWeekdaysInMonth(weekdays: number[], today: Date = new Date()): string[] {
  if (!weekdays.length) {
    return [];
  }
  const wanted = new Set(weekdays);
  const base = startOfLocalDay(today);
  const year = base.getFullYear();
  const month = base.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const out: string[] = [];
  for (let day = base.getDate(); day <= lastDay; day++) {
    const d = new Date(year, month, day);
    if (wanted.has(d.getDay())) {
      out.push(formatDotDate(d));
    }
  }
  return out;
}

/** Skrót: raw „Dzień odbioru” → proponowane daty dd.mm.rrrr. */
export function proposeDatesFromDzienOdbioru(raw: string, today: Date = new Date()): string[] {
  return datesForWeekdaysInMonth(parseWeekdaysFromDzienOdbioru(raw), today);
}
