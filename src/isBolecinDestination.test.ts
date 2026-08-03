import { describe, expect, it } from 'vitest';
import { isBolecinDestination } from './isBolecinDestination.js';

describe('isBolecinDestination', () => {
  it('test_isBolecinDestination_biosystem_label_true', () => {
    expect(isBolecinDestination('Biosystem')).toBe(true);
  });

  it('test_isBolecinDestination_bolecin_in_label_true', () => {
    expect(isBolecinDestination('Magazyn Bolęcin')).toBe(true);
  });

  it('test_isBolecinDestination_bolecin_without_diacritic_true', () => {
    expect(isBolecinDestination('Bolecin')).toBe(true);
  });

  it('test_isBolecinDestination_address_only_true', () => {
    expect(isBolecinDestination('Inny kontrahent', '32-540 Bolęcin, ul Fabryczna 5')).toBe(
      true,
    );
  });

  it('test_isBolecinDestination_other_place_false', () => {
    expect(isBolecinDestination('Janex', 'Warszawa')).toBe(false);
  });

  it('test_isBolecinDestination_empty_false', () => {
    expect(isBolecinDestination('')).toBe(false);
  });
});
