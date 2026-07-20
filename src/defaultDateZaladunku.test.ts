import { describe, it, expect } from 'vitest';
import { defaultDateZaladunkuYmd } from './defaultDateZaladunku.js';

describe('defaultDateZaladunkuYmd', () => {
  it('test_defaultDateZaladunkuYmd_when_friday_after_4am_should_be_next_monday', () => {
    expect(defaultDateZaladunkuYmd(new Date(2026, 5, 5, 10, 0, 0))).toBe('2026-06-08');
  });

  it('test_defaultDateZaladunkuYmd_when_friday_before_4am_should_be_today', () => {
    expect(defaultDateZaladunkuYmd(new Date(2026, 5, 5, 2, 0, 0))).toBe('2026-06-05');
  });

  it('test_defaultDateZaladunkuYmd_when_saturday_should_be_next_monday', () => {
    expect(defaultDateZaladunkuYmd(new Date(2026, 5, 6, 15, 0, 0))).toBe('2026-06-08');
  });

  it('test_defaultDateZaladunkuYmd_when_sunday_should_be_next_monday', () => {
    expect(defaultDateZaladunkuYmd(new Date(2026, 5, 7, 2, 0, 0))).toBe('2026-06-08');
  });

  it('test_defaultDateZaladunkuYmd_when_weekday_before_4am_should_be_today', () => {
    expect(defaultDateZaladunkuYmd(new Date(2026, 5, 4, 2, 0, 0))).toBe('2026-06-04');
  });

  it('test_defaultDateZaladunkuYmd_when_weekday_after_4am_should_be_tomorrow', () => {
    expect(defaultDateZaladunkuYmd(new Date(2026, 5, 4, 10, 0, 0))).toBe('2026-06-05');
  });
});
