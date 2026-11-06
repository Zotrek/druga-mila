/**
 * Wiersz Bolęcin z formatka-log.gs: nagłówki, cel, flaga bolecinOnly.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const gasPath = join(dirname(fileURLToPath(import.meta.url)), '../google-apps-script/formatka-log.gs');

function functionBody(source: string, name: string): string {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) {
    throw new Error(`missing ${name}`);
  }
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }
  throw new Error(`unclosed ${name}`);
}

const source = readFileSync(gasPath, 'utf8');
const names = [
  'padDatePart_',
  'sheetCellDateText_',
  'normalizeBolecinText_',
  'isBolecinDestination_',
  'isBolecinOnly_',
  'bolecinFieldKey_',
  'buildBolecinRowForHeaders_',
  'bolecinFixedRow_',
] as const;

type GasBolecin = {
  isBolecinDestination_: (body: Record<string, unknown> | null) => boolean;
  isBolecinOnly_: (body: Record<string, unknown> | null) => boolean;
  bolecinFieldKey_: (header: string) => string;
  buildBolecinRowForHeaders_: (
    headers: string[],
    body: Record<string, unknown>,
  ) => string[] | null;
  bolecinFixedRow_: (body: Record<string, unknown>) => string[];
};

const gas = runInNewContext(
  `${names.map((name) => functionBody(source, name)).join('\n')}\n({ ${names.join(', ')} })`,
  {},
) as GasBolecin;

const CANONICAL = [
  'Okno awizacji',
  'Adres odbioru',
  'Nazwa kontrahenta / podmiot handlowy',
  'Data odbioru',
  'Kto odbiera',
  'Miejsce zrzutu',
  'Rodzaj zbiórki',
  'Ile worków',
  'rodzaj traportu',
  'awizacja',
];

describe('formatka-log bolecin row', () => {
  it('test_isBolecinDestination_biosystem_and_bolecin_true', () => {
    expect(gas.isBolecinDestination_({ miejsceZrzutu: 'BIOSYSTEM', miejsceDostawyAdres: '' })).toBe(
      true,
    );
    expect(gas.isBolecinDestination_({ miejsceZrzutu: 'Magazyn Bolęcin' })).toBe(true);
    expect(gas.isBolecinDestination_({ miejsceZrzutu: 'Janex', miejsceDostawyAdres: 'Warszawa' })).toBe(
      false,
    );
  });

  it('test_isBolecinOnly_true_string_and_false', () => {
    expect(gas.isBolecinOnly_({ bolecinOnly: true })).toBe(true);
    expect(gas.isBolecinOnly_({ bolecinOnly: 'true' })).toBe(true);
    expect(gas.isBolecinOnly_({ bolecinOnly: false })).toBe(false);
    expect(gas.isBolecinOnly_(null)).toBe(false);
  });

  it('test_bolecinFieldKey_okno_awizacji_is_not_awizacja', () => {
    expect(gas.bolecinFieldKey_('Okno awizacji')).toBe('oknoAwizacji');
    expect(gas.bolecinFieldKey_('awizacja')).toBe('awizacja');
    expect(gas.bolecinFieldKey_('Adres odbioru')).toBe('adresOdbioru');
  });

  it('test_buildBolecinRowForHeaders_when_column_inserted_should_keep_address_under_its_header', () => {
    const headers = ['Nr', ...CANONICAL];
    const row = gas.buildBolecinRowForHeaders_(headers, {
      adresOdbioru: 'ul. Sklep 1',
      nazwaKontrahenta: 'Sklep SA',
      dataOdbioru: '06.11.2026',
      miejsceZrzutu: 'BIOSYSTEM',
      awizacja: '8-12',
      ileWorkow: '4',
    });
    expect(row).not.toBeNull();
    expect(row?.[0]).toBe('');
    expect(row?.[2]).toBe('ul. Sklep 1');
    expect(row?.[3]).toBe('Sklep SA');
    expect(row?.[4]).toBe('06-11-2026');
    expect(row?.[6]).toBe('BIOSYSTEM');
    expect(row?.[8]).toBe('4');
    expect(row?.[10]).toBe('8-12');
  });

  it('test_buildBolecinRowForHeaders_canonical_matches_fixed_row', () => {
    const body = {
      oknoAwizacji: '8:00',
      adresOdbioru: 'ul. A 1',
      nazwaKontrahenta: 'Firma',
      dataOdbioru: '06.11.2026',
      ktoOdbiera: 'Jan',
      miejsceZrzutu: 'BIOSYSTEM',
      rodzajZbiorki: 'manualna',
      ileWorkow: '2',
      rodzajTransportu: 'bus',
      awizacja: 'rano',
    };
    expect(gas.buildBolecinRowForHeaders_(CANONICAL, body)).toEqual(gas.bolecinFixedRow_(body));
  });

  it('test_appendBolecinRow_expands_table_after_header_mapped_write', () => {
    const append = functionBody(source, 'appendBolecinRow_');
    expect(append).toContain('buildBolecinRowForHeaders_');
    expect(append).toContain('expandBolecinSheetQuiet_');
  });
});
