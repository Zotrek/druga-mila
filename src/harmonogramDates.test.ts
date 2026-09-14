import { describe, it, expect } from 'vitest';
import {
  parseWeekdaysFromDzienOdbioru,
  datesForWeekdaysInMonth,
  proposeDatesFromDzienOdbioru,
  parseHarmFrequency,
  parseDotDate,
  proposeHarmonogramDates,
  HARM_FREQUENCY_WEEKLY,
  HARM_FREQUENCY_BIWEEKLY,
  HARM_FREQUENCY_MONTHLY,
} from './harmonogramDates.js';

describe('parseWeekdaysFromDzienOdbioru', () => {
  it('test_parseWeekdaysFromDzienOdbioru_single_poniedzialek', () => {
    expect(parseWeekdaysFromDzienOdbioru('poniedziałek')).toEqual([1]);
  });

  it('test_parseWeekdaysFromDzienOdbioru_multi_slash', () => {
    expect(parseWeekdaysFromDzienOdbioru('poniedziałek/środa/piątek')).toEqual([1, 3, 5]);
  });

  it('test_parseWeekdaysFromDzienOdbioru_zaproponowano_piatek', () => {
    expect(parseWeekdaysFromDzienOdbioru('zaproponowano piątek')).toEqual([5]);
  });

  it('test_parseWeekdaysFromDzienOdbioru_empty_returns_empty', () => {
    expect(parseWeekdaysFromDzienOdbioru('')).toEqual([]);
    expect(parseWeekdaysFromDzienOdbioru('do ustalenia')).toEqual([]);
  });
});

describe('parseHarmFrequency', () => {
  it('test_parseHarmFrequency_default_weekly', () => {
    expect(parseHarmFrequency('')).toBe(HARM_FREQUENCY_WEEKLY);
    expect(parseHarmFrequency('co tydzień')).toBe(HARM_FREQUENCY_WEEKLY);
  });

  it('test_parseHarmFrequency_biweekly', () => {
    expect(parseHarmFrequency('co dwa tygodnie')).toBe(HARM_FREQUENCY_BIWEEKLY);
  });

  it('test_parseHarmFrequency_monthly', () => {
    expect(parseHarmFrequency('co miesiąc')).toBe(HARM_FREQUENCY_MONTHLY);
  });
});

describe('parseDotDate', () => {
  it('test_parseDotDate_valid', () => {
    const d = parseDotDate('01.09.2026');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(8);
    expect(d!.getDate()).toBe(1);
  });

  it('test_parseDotDate_invalid_empty', () => {
    expect(parseDotDate('')).toBeNull();
    expect(parseDotDate('32.01.2026')).toBeNull();
  });
});

describe('datesForWeekdaysInMonth', () => {
  it('test_datesForWeekdaysInMonth_tuesday_from_aug_11_2026', () => {
    // 11.08.2026 = wtorek → 11, 18, 25
    const today = new Date(2026, 7, 11);
    expect(datesForWeekdaysInMonth([2], today)).toEqual(['11.08.2026', '18.08.2026', '25.08.2026']);
  });

  it('test_datesForWeekdaysInMonth_includes_today_when_matches', () => {
    const monday = new Date(2026, 7, 10); // 10.08.2026 = poniedziałek
    expect(datesForWeekdaysInMonth([1], monday)[0]).toBe('10.08.2026');
  });

  it('test_datesForWeekdaysInMonth_excludes_past_days_in_month', () => {
    const wed = new Date(2026, 7, 12); // 12.08.2026 = środa
    // poniedziałki po 12.08: 17, 24, 31
    expect(datesForWeekdaysInMonth([1], wed)).toEqual(['17.08.2026', '24.08.2026', '31.08.2026']);
  });

  it('test_datesForWeekdaysInMonth_empty_weekdays', () => {
    expect(datesForWeekdaysInMonth([], new Date(2026, 7, 11))).toEqual([]);
  });

  it('test_datesForWeekdaysInMonth_multi_days_sorted_unique', () => {
    const today = new Date(2026, 7, 11); // wtorek
    expect(datesForWeekdaysInMonth([1, 3, 5], today)).toEqual([
      '12.08.2026',
      '14.08.2026',
      '17.08.2026',
      '19.08.2026',
      '21.08.2026',
      '24.08.2026',
      '26.08.2026',
      '28.08.2026',
      '31.08.2026',
    ]);
  });

  it('test_datesForWeekdaysInMonth_before_22_only_current_month', () => {
    const today = new Date(2026, 7, 21);
    expect(datesForWeekdaysInMonth([1], today)).toEqual([
      '24.08.2026',
      '31.08.2026',
    ]);
  });

  it('test_datesForWeekdaysInMonth_from_22_includes_next_month', () => {
    const today = new Date(2026, 7, 22);
    expect(datesForWeekdaysInMonth([1], today)).toEqual([
      '24.08.2026',
      '31.08.2026',
      '07.09.2026',
      '14.09.2026',
      '21.09.2026',
      '28.09.2026',
    ]);
  });

  it('test_datesForWeekdaysInMonth_december_rolls_to_january', () => {
    const today = new Date(2026, 11, 22);
    expect(datesForWeekdaysInMonth([2], today)).toEqual([
      '22.12.2026',
      '29.12.2026',
      '05.01.2027',
      '12.01.2027',
      '19.01.2027',
      '26.01.2027',
    ]);
  });
});

describe('proposeDatesFromDzienOdbioru', () => {
  it('test_proposeDatesFromDzienOdbioru_poniedzialek_from_aug_11', () => {
    const today = new Date(2026, 7, 11);
    expect(proposeDatesFromDzienOdbioru('poniedziałek', today)).toEqual([
      '17.08.2026',
      '24.08.2026',
      '31.08.2026',
    ]);
  });
});

describe('proposeHarmonogramDates', () => {
  it('test_proposeHarmonogramDates_weekly_respects_first_day', () => {
    const today = new Date(2026, 7, 11);
    expect(
      proposeHarmonogramDates({
        dzienOdbioru: 'poniedziałek',
        czestotliwosc: 'co tydzień',
        pierwszyDzienObowiazywania: '20.08.2026',
        today,
      }),
    ).toEqual(['24.08.2026', '31.08.2026']);
  });

  it('test_proposeHarmonogramDates_weekly_first_day_does_not_widen_window', () => {
    // today 11.08; firstDay 25.08 (≥22) — okno nadal tylko sierpień (od today), nie wrzesień
    expect(
      proposeHarmonogramDates({
        dzienOdbioru: 'poniedziałek',
        czestotliwosc: 'co tydzień',
        pierwszyDzienObowiazywania: '25.08.2026',
        today: new Date(2026, 7, 11),
      }),
    ).toEqual(['31.08.2026']);
  });

  it('test_proposeHarmonogramDates_biweekly_from_anchor', () => {
    // 03.08.2026 = poniedziałek → 03, 17, 31
    expect(
      proposeHarmonogramDates({
        dzienOdbioru: 'poniedziałek',
        czestotliwosc: 'co dwa tygodnie',
        pierwszyDzienObowiazywania: '03.08.2026',
        today: new Date(2026, 7, 3),
      }),
    ).toEqual(['03.08.2026', '17.08.2026', '31.08.2026']);
  });

  it('test_proposeHarmonogramDates_biweekly_skips_off_grid_week', () => {
    expect(
      proposeHarmonogramDates({
        dzienOdbioru: 'poniedziałek',
        czestotliwosc: 'co dwa tygodnie',
        pierwszyDzienObowiazywania: '03.08.2026',
        today: new Date(2026, 7, 11),
      }),
    ).toEqual(['17.08.2026', '31.08.2026']);
  });

  it('test_proposeHarmonogramDates_monthly_weekday_after_day_of_month', () => {
    // firstDay 05.08.2026; pn → 10.08 (pierwszy pn >= 5)
    expect(
      proposeHarmonogramDates({
        dzienOdbioru: 'poniedziałek',
        czestotliwosc: 'co miesiąc',
        pierwszyDzienObowiazywania: '05.08.2026',
        today: new Date(2026, 7, 1),
      }),
    ).toEqual(['10.08.2026']);
  });

  it('test_proposeHarmonogramDates_monthly_from_22_includes_next_month', () => {
    expect(
      proposeHarmonogramDates({
        dzienOdbioru: 'poniedziałek',
        czestotliwosc: 'co miesiąc',
        pierwszyDzienObowiazywania: '05.08.2026',
        today: new Date(2026, 7, 22),
      }),
    ).toEqual(['07.09.2026']);
  });
});
