/**
 * Unit: formatowanie przewoźnika / miejsca dostawy do Word.
 */

import { describe, it, expect } from 'vitest';
import {
  formatPrzewoznikForWord,
  formatMiejsceDostawyForWord,
  parseLegacyPodwykoValue,
  przewoznikToComboboxOption,
} from './referenceFormats.js';

describe('formatPrzewoznikForWord', () => {
  it('test_formatPrzewoznikForWord_joins_fields_in_order', () => {
    const s = formatPrzewoznikForWord({
      nazwaWyswietlana: 'BLUECARGO',
      nazwaDoProtokolu: 'BLUECARGO Sp. z o.o.',
      adres: 'Rajska 3, 54-028 Wrocław',
      nip: '8943261149',
      bdo: '000710623',
    });
    expect(s).toContain('BLUECARGO Sp. z o.o.');
    expect(s).toContain('Rajska 3');
    expect(s).toContain('BDO 000710623');
    expect(s).toContain('NIP 8943261149');
  });
});

describe('parseLegacyPodwykoValue', () => {
  it('test_parseLegacyPodwykoValue_extracts_nip_bdo_and_address', () => {
    const r = parseLegacyPodwykoValue(
      'BLUECARGO',
      'BLUECARGO Sp. z o.o. Rajska 3, 54-028 Wrocław BDO 000710623 NIP 8943261149',
    );
    expect(r.nazwaWyswietlana).toBe('BLUECARGO');
    expect(r.nip).toBe('8943261149');
    expect(r.bdo).toBe('000710623');
    expect(r.nazwaDoProtokolu).toContain('BLUECARGO');
  });

  it('test_parseLegacyPodwykoValue_combobox_matches_word_format', () => {
    const legacy =
      'Papirus-Recykling Grzegorz Kołakowski  ul. Szczawiowa 54a, 70-010 Szczecin NIP 8521124660  BDO 000003483';
    const r = parseLegacyPodwykoValue('Papirus', legacy);
    const opt = przewoznikToComboboxOption(r);
    expect(opt.label).toBe('Papirus');
    expect(opt.value).toContain('NIP');
    expect(opt.value).toContain('BDO');
  });
});

describe('formatMiejsceDostawyForWord', () => {
  it('test_formatMiejsceDostawyForWord_joins_name_and_address', () => {
    expect(
      formatMiejsceDostawyForWord({
        nazwaPelna: 'BIOSYSTEM Bolęcin',
        nazwaSkrocona: 'BIOSYSTEM',
        adres: '32-540 Bolęcin Fabryczna 5',
        typ: 'BOLĘCIN',
      }),
    ).toBe('BIOSYSTEM Bolęcin 32-540 Bolęcin Fabryczna 5');
  });
});
