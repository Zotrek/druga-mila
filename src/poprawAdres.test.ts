import { describe, expect, it } from 'vitest';
import {
  buildPoprawAdresIndex,
  buildPoprawAdresLookupKey,
  findPoprawAdresMatch,
  mergePoprawAdresIntoGeocodeCache,
  parsePoprawAdresEntry,
  parsePoprawAdresList,
  parsePoprawCoord,
} from './poprawAdres.js';
import { normalizeAddressKey, type GeocodeCache } from './geocode.js';

describe('poprawAdres', () => {
  it('test_buildPoprawAdresLookupKey_normalizes_case_and_spaces', () => {
    const a = buildPoprawAdresLookupKey('  Górki 26, 82-500 Górki ', 'GPW Plac', 'GPW GDAŃSK');
    const b = buildPoprawAdresLookupKey('gorki 26 82-500 gorki', 'gpw plac', 'gpw gdansk');
    expect(a).toBe(b);
  });

  it('test_parsePoprawCoord_accepts_pl_comma_decimal', () => {
    expect(parsePoprawCoord('53,730945')).toBeCloseTo(53.730945, 5);
    expect(parsePoprawCoord(18.96)).toBeCloseTo(18.96, 2);
  });

  it('test_parsePoprawAdresEntry_requires_adres_and_coords', () => {
    expect(parsePoprawAdresEntry({ adres: 'x' })).toBeNull();
    expect(
      parsePoprawAdresEntry({
        adres: 'Górki 26, 82-500 Górki',
        lat: 53.73,
        lon: 18.96,
        nazwaPelna: 'GPW Plac Pośredni Gdańsk',
        nazwaSkrocona: 'GPW GDAŃSK',
      }),
    ).toMatchObject({
      adres: 'Górki 26, 82-500 Górki',
      lat: 53.73,
      lon: 18.96,
      nazwaSkrocona: 'GPW GDAŃSK',
    });
  });

  it('test_parsePoprawAdresEntry_accepts_lng_alias', () => {
    const e = parsePoprawAdresEntry({
      adres: 'A',
      lat: 50,
      lng: 19,
    });
    expect(e).toMatchObject({ lon: 19 });
  });

  it('test_findPoprawAdresMatch_full_key', () => {
    const index = buildPoprawAdresIndex([
      {
        nazwaPelna: 'GPW Plac Pośredni Gdańsk',
        nazwaSkrocona: 'GPW GDAŃSK',
        adres: 'Górki 26, 82-500 Górki',
        lat: 53.73,
        lon: 18.96,
      },
    ]);
    const hit = findPoprawAdresMatch(index, {
      nazwaPelna: 'GPW Plac Pośredni Gdańsk',
      nazwaSkrocona: 'GPW GDAŃSK',
      adres: 'Górki 26, 82-500 Górki',
    });
    expect(hit?.lat).toBe(53.73);
  });

  it('test_findPoprawAdresMatch_address_only_entry', () => {
    const index = buildPoprawAdresIndex([
      {
        nazwaPelna: '',
        nazwaSkrocona: '',
        adres: 'Górki 26, 82-500 Górki',
        lat: 53.73,
        lon: 18.96,
      },
    ]);
    const hit = findPoprawAdresMatch(index, {
      nazwaPelna: 'GPW Plac Pośredni Gdańsk',
      nazwaSkrocona: 'GPW GDAŃSK',
      adres: 'Górki 26, 82-500 Górki',
    });
    expect(hit?.lon).toBe(18.96);
  });

  it('test_findPoprawAdresMatch_partial_wildcard_names', () => {
    const index = buildPoprawAdresIndex([
      {
        nazwaPelna: 'GPW Plac Pośredni Gdańsk',
        nazwaSkrocona: '',
        adres: 'Górki 26, 82-500 Górki',
        lat: 1,
        lon: 2,
      },
    ]);
    const hit = findPoprawAdresMatch(index, {
      nazwaPelna: 'GPW Plac Pośredni Gdańsk',
      nazwaSkrocona: 'GPW GDAŃSK',
      adres: 'Górki 26, 82-500 Górki',
    });
    expect(hit?.lat).toBe(1);
  });

  it('test_mergePoprawAdresIntoGeocodeCache_overrides_by_address_key', () => {
    const cache: GeocodeCache = {
      [normalizeAddressKey('Górki 26, 82-500 Górki')]: {
        lat: 52.62,
        lon: 18.95,
        status: 'ok',
      },
    };
    const n = mergePoprawAdresIntoGeocodeCache(cache, [
      {
        nazwaPelna: 'X',
        nazwaSkrocona: 'Y',
        adres: 'Górki 26, 82-500 Górki',
        lat: 53.73094520613153,
        lon: 18.964791430162425,
      },
    ]);
    expect(n).toBe(1);
    const entry = cache[normalizeAddressKey('Górki 26, 82-500 Górki')];
    expect(entry?.lat).toBeCloseTo(53.73094520613153, 8);
    expect(entry?.status).toBe('ok');
  });

  it('test_parsePoprawAdresList_skips_invalid', () => {
    const list = parsePoprawAdresList([
      { adres: 'A', lat: 50, lon: 19 },
      { adres: '' },
      null,
    ]);
    expect(list).toHaveLength(1);
    expect(list[0]?.adres).toBe('A');
  });
});
