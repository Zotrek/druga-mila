/**
 * Zapis z checkboxa „Nie jest drugą milą”: flaga bolecinOnly i wpisany cel
 * zamiast starego punktu z listy. Ten sam kod musi być w wygenerowanym HTML
 * i w index.html, który idzie na stronę.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { buildMapHtml } from './buildMapHtml.js';

const indexPath = join(dirname(fileURLToPath(import.meta.url)), '../index.html');

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

const PAYLOAD_FNS = [
  'normalizeBolecinTextClient',
  'isBolecinDestinationClient',
  'isBolecinOnlyChecked',
  'buildFormatkaPayload',
] as const;

type PayloadFns = {
  buildFormatkaPayload: (
    zal: Record<string, string>,
    shared: Record<string, unknown>,
    numerOverride: string,
  ) => Record<string, unknown>;
};

function loadPayloadFns(source: string, elements: Record<string, { checked?: boolean; value?: string }>): PayloadFns {
  const code = `${PAYLOAD_FNS.map((name) => functionBody(source, name)).join('\n')}
({ ${PAYLOAD_FNS.join(', ')} })`;
  return runInNewContext(code, {
    document: {
      getElementById(id: string) {
        return elements[id] ?? null;
      },
    },
    formatDateForDoc: () => '06.11.2026',
    resolveRodzajZbiorki: () => 'manualna',
  }) as PayloadFns;
}

const html = buildMapHtml(
  [
    {
      nazwaPelna: 'CD Test',
      nazwaSkrocona: 'TEST',
      adres: '00-001 Warszawa',
      typ: 'CD',
      colorKind: 'cd',
      lat: 52.2,
      lon: 21.0,
    },
  ],
  {
    wordEmbed: {
      templateBase64: 'dGVzdA==',
      podwykoOptions: [{ label: 'BLUECARGO', value: 'BLUECARGO Sp. z o.o.' }],
      deliveryOptions: [{ label: 'BIOSYSTEM', value: '32-540 Bolęcin Fabryczna 5' }],
      loadPoints: [
        { nazwaPelna: 'CD Test', nazwaSkrocona: 'TEST', adres: '00-001 Warszawa', typ: 'CD' },
      ],
    },
  },
);

const zal = { adres: 'ul. Sklep 1', nazwaPelna: 'Sklep SA', typ: 'CD' };

function sharedWith(md: { label: string; value: string }) {
  return {
    stawka: '',
    oknoAwizacji: '',
    dataVal: '2026-11-06',
    pr: { label: 'Jan' },
    md,
    zbiorka: '',
    worki: '4',
    transport: '',
    awizacja: '8-12',
    uwagi: '',
  };
}

describe('bolecin payload in map html', () => {
  it('test_buildFormatkaPayload_stale_list_and_typed_bolecin_sends_typed_text', () => {
    const elements = {
      'doc-chk-bolecin-only': { checked: true },
      'doc-sel-miejsce': { value: 'Magazyn Bolęcin' },
    };
    const payload = loadPayloadFns(html, elements).buildFormatkaPayload(
      zal,
      sharedWith({ label: 'Janex', value: 'Warszawa' }),
      '',
    );
    expect(payload.bolecinOnly).toBe(true);
    expect(payload.miejsceZrzutu).toBe('Magazyn Bolęcin');
    expect(payload.miejsceDostawyAdres).toBe('Magazyn Bolęcin');
  });

  it('test_buildFormatkaPayload_stale_list_and_typed_biosystem_sends_typed_text', () => {
    const elements = {
      'doc-chk-bolecin-only': { checked: true },
      'doc-sel-miejsce': { value: 'BIOSYSTEM' },
    };
    const payload = loadPayloadFns(html, elements).buildFormatkaPayload(
      zal,
      sharedWith({ label: 'Janex', value: 'Warszawa' }),
      '',
    );
    expect(payload.bolecinOnly).toBe(true);
    expect(payload.miejsceZrzutu).toBe('BIOSYSTEM');
    expect(payload.miejsceDostawyAdres).toBe('BIOSYSTEM');
  });

  it('test_buildFormatkaPayload_checked_keeps_bolecin_list_entry', () => {
    const elements = {
      'doc-chk-bolecin-only': { checked: true },
      'doc-sel-miejsce': { value: 'Bolęcin' },
    };
    const payload = loadPayloadFns(html, elements).buildFormatkaPayload(
      zal,
      sharedWith({ label: 'BIOSYSTEM', value: '32-540 Bolęcin Fabryczna 5' }),
      '',
    );
    expect(payload.bolecinOnly).toBe(true);
    expect(payload.miejsceZrzutu).toBe('BIOSYSTEM');
    expect(payload.miejsceDostawyAdres).toBe('32-540 Bolęcin Fabryczna 5');
  });

  it('test_buildFormatkaPayload_unchecked_keeps_list_point', () => {
    const elements = {
      'doc-chk-bolecin-only': { checked: false },
      'doc-sel-miejsce': { value: 'Magazyn Bolęcin' },
    };
    const payload = loadPayloadFns(html, elements).buildFormatkaPayload(
      zal,
      sharedWith({ label: 'Janex', value: 'Warszawa' }),
      '',
    );
    expect(payload.bolecinOnly).toBeUndefined();
    expect(payload.miejsceZrzutu).toBe('Janex');
    expect(payload.miejsceDostawyAdres).toBe('Warszawa');
  });

  it('test_indexHtml_bolecin_payload_matches_builder', () => {
    const committed = readFileSync(indexPath, 'utf8');
    for (const name of ['isBolecinOnlyChecked', 'buildFormatkaPayload'] as const) {
      expect(functionBody(committed, name)).toBe(functionBody(html, name));
    }
  });
});
