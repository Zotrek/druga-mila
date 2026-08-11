import { describe, it, expect } from 'vitest';
import {
  parseWeekdaysFromDzienOdbioru,
  datesForWeekdaysInMonth,
  proposeDatesFromDzienOdbioru,
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
    // pn/śr/pt od 11.08: 12(śr), 14(pt), 17(pn), 19, 21, 24, 26, 28, 31
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
