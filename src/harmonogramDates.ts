/**
 * Propozycja dat stałego odbioru z kolumny „Dzień odbioru” Harmonogramu.
 * JS getDay(): 0=nd, 1=pn, …, 6=sb.
 *
 * Częstotliwość: co tydzień | co dwa tygodnie | co miesiąc.
 * Pierwszy dzień obowiązywania: kotwica (biweekly) + nie proponuj wcześniej.
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

export type HarmFrequency = 'co tydzień' | 'co dwa tygodnie' | 'co miesiąc';

export const HARM_FREQUENCY_WEEKLY: HarmFrequency = 'co tydzień';
export const HARM_FREQUENCY_BIWEEKLY: HarmFrequency = 'co dwa tygodnie';
export const HARM_FREQUENCY_MONTHLY: HarmFrequency = 'co miesiąc';

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

/** Normalizuje tekst częstotliwości → kanoniczna wartość lub weekly. */
export function parseHarmFrequency(raw: string | undefined | null): HarmFrequency {
  const n = normalizePlDayToken(String(raw || ''));
  if (!n) {
    return HARM_FREQUENCY_WEEKLY;
  }
  if (n.includes('dwa') && n.includes('tygod')) {
    return HARM_FREQUENCY_BIWEEKLY;
  }
  if (n.includes('miesiac') || n.includes('miesiecz')) {
    return HARM_FREQUENCY_MONTHLY;
  }
  return HARM_FREQUENCY_WEEKLY;
}

/** Parsuje dd.mm.rrrr (lub Date z arkusza już jako Date w UI nie dotyczy). */
export function parseDotDate(raw: string): Date | null {
  const s = String(raw || '').trim();
  if (!s) {
    return null;
  }
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) {
    return null;
  }
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return null;
  }
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) {
    return null;
  }
  return startOfLocalDay(d);
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

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime();
  return Math.round(ms / 86400000);
}

/** Od tego dnia miesiąca proponujemy też cały kolejny miesiąc. */
export const INCLUDE_NEXT_MONTH_FROM_DAY = 22;

/** Koniec okna propozycji (włącznie): koniec bieżącego miesiąca lub następnego. */
export function proposalWindowEnd(today: Date = new Date()): Date {
  const base = startOfLocalDay(today);
  const year = base.getFullYear();
  const month = base.getMonth();
  if (base.getDate() >= INCLUDE_NEXT_MONTH_FROM_DAY) {
    return new Date(year, month + 2, 0);
  }
  return new Date(year, month + 1, 0);
}

/**
 * Daty weekdays w miesiącu `today` od dnia >= dziś (bez dat wstecz).
 * Od dnia {@link INCLUDE_NEXT_MONTH_FROM_DAY} dołącza też cały następny miesiąc.
 * Zwraca dd.mm.rrrr chronologicznie.
 */
export function datesForWeekdaysInMonth(weekdays: number[], today: Date = new Date()): string[] {
  if (!weekdays.length) {
    return [];
  }
  const wanted = new Set(weekdays);
  const base = startOfLocalDay(today);
  const year = base.getFullYear();
  const month = base.getMonth();
  const dayOfMonth = base.getDate();
  const out: string[] = [];

  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let day = dayOfMonth; day <= lastDay; day++) {
    const d = new Date(year, month, day);
    if (wanted.has(d.getDay())) {
      out.push(formatDotDate(d));
    }
  }

  if (dayOfMonth >= INCLUDE_NEXT_MONTH_FROM_DAY) {
    const lastDayNext = new Date(year, month + 2, 0).getDate();
    for (let day = 1; day <= lastDayNext; day++) {
      const d = new Date(year, month + 1, day);
      if (wanted.has(d.getDay())) {
        out.push(formatDotDate(d));
      }
    }
  }

  return out;
}

function firstWeekdayOnOrAfter(from: Date, weekday: number): Date {
  let d = startOfLocalDay(from);
  const delta = (weekday - d.getDay() + 7) % 7;
  return addDays(d, delta);
}

/** Co tydzień — weekdays w oknie liczonym od `today`; start dat = max(today, firstDay). */
function proposeWeekly(
  weekdays: number[],
  today: Date,
  firstDay: Date | null,
): string[] {
  const candidates = datesForWeekdaysInMonth(weekdays, today);
  if (!firstDay) {
    return candidates;
  }
  const floor = startOfLocalDay(firstDay);
  return candidates.filter((s) => {
    const d = parseDotDate(s);
    return d != null && d >= floor;
  });
}

/**
 * Co dwa tygodnie: dla każdego weekday — pierwsza data >= max(today, firstDay)
 * leżąca na siatce 14 dni od pierwszej takiej daty weekday >= firstDay (lub today).
 */
function proposeBiweekly(
  weekdays: number[],
  today: Date,
  firstDay: Date | null,
): string[] {
  if (!weekdays.length) {
    return [];
  }
  const anchor = firstDay || today;
  const start = today > anchor ? today : anchor;
  const end = proposalWindowEnd(today);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const wd of weekdays) {
    const gridStart = firstWeekdayOnOrAfter(anchor, wd);
    let d = firstWeekdayOnOrAfter(start, wd);
    // Wyrównaj do siatki 14 dni od gridStart
    let diff = daysBetween(gridStart, d);
    if (diff < 0) {
      d = gridStart;
      if (d < start) {
        const lag = daysBetween(d, start);
        const steps = Math.ceil(lag / 14);
        d = addDays(d, steps * 14);
      }
      diff = daysBetween(gridStart, d);
    }
    const rem = ((diff % 14) + 14) % 14;
    if (rem !== 0) {
      d = addDays(d, 14 - rem);
    }
    while (d <= end) {
      if (d >= start) {
        const key = formatDotDate(d);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(key);
        }
      }
      d = addDays(d, 14);
    }
  }

  return out.sort((a, b) => {
    const pa = parseDotDate(a)!;
    const pb = parseDotDate(b)!;
    return pa.getTime() - pb.getTime();
  });
}

/**
 * Co miesiąc: w każdym miesiącu okna — dla każdego weekday pierwsza data
 * w miesiącu z dniem >= dzień-miesiąca kotwicy (pierwszyDzień / today).
 */
function proposeMonthly(
  weekdays: number[],
  today: Date,
  firstDay: Date | null,
): string[] {
  const anchor = firstDay || today;
  const start = today > anchor ? today : anchor;
  const end = proposalWindowEnd(today);
  const dayOfMonth = anchor.getDate();
  const out: string[] = [];
  const seen = new Set<string>();

  let y = start.getFullYear();
  let m = start.getMonth();
  const endY = end.getFullYear();
  const endM = end.getMonth();

  while (y < endY || (y === endY && m <= endM)) {
    const lastDay = new Date(y, m + 1, 0).getDate();
    const fromDay = Math.min(dayOfMonth, lastDay);

    if (!weekdays.length) {
      const d = new Date(y, m, fromDay);
      if (d >= start && d <= end) {
        const key = formatDotDate(d);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(key);
        }
      }
    } else {
      for (const wd of weekdays) {
        let d = firstWeekdayOnOrAfter(new Date(y, m, fromDay), wd);
        if (d.getMonth() !== m) {
          continue;
        }
        if (d >= start && d <= end) {
          const key = formatDotDate(d);
          if (!seen.has(key)) {
            seen.add(key);
            out.push(key);
          }
        }
      }
    }

    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }

  return out.sort((a, b) => {
    const pa = parseDotDate(a)!;
    const pb = parseDotDate(b)!;
    return pa.getTime() - pb.getTime();
  });
}

export interface ProposeHarmonogramDatesOpts {
  dzienOdbioru: string;
  czestotliwosc?: string;
  /** dd.mm.rrrr */
  pierwszyDzienObowiazywania?: string;
  today?: Date;
}

/**
 * Propozycja dat wg częstotliwości.
 * Brak / nieznana częstotliwość → co tydzień (kompatybilność wstecz).
 */
export function proposeHarmonogramDates(opts: ProposeHarmonogramDatesOpts): string[] {
  const today = startOfLocalDay(opts.today || new Date());
  const weekdays = parseWeekdaysFromDzienOdbioru(opts.dzienOdbioru);
  const freq = parseHarmFrequency(opts.czestotliwosc);
  const firstDay = parseDotDate(opts.pierwszyDzienObowiazywania || '');

  if (freq === HARM_FREQUENCY_BIWEEKLY) {
    return proposeBiweekly(weekdays, today, firstDay);
  }
  if (freq === HARM_FREQUENCY_MONTHLY) {
    return proposeMonthly(weekdays, today, firstDay);
  }
  return proposeWeekly(weekdays, today, firstDay);
}

/** Skrót: raw „Dzień odbioru” → proponowane daty dd.mm.rrrr (co tydzień). */
export function proposeDatesFromDzienOdbioru(raw: string, today: Date = new Date()): string[] {
  return proposeHarmonogramDates({ dzienOdbioru: raw, today });
}
