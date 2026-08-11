/**
 * Unit: buildMapHtml — embed punktów, legenda, search, filtr.
 */

import { describe, it, expect } from 'vitest';
import { buildMapHtml } from './buildMapHtml.js';
import { COLOR_CD, COLOR_BOLECIN } from './config.js';

describe('buildMapHtml', () => {
  it('test_buildMapHtml_embeds_points_and_controls', () => {
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
        {
          nazwaPelna: 'BIOSYSTEM Bolęcin',
          nazwaSkrocona: 'BIOSYSTEM',
          adres: '32-540 Bolęcin',
          typ: '',
          colorKind: 'bolecin',
          lat: 50.1,
          lon: 19.5,
        },
      ],
      { title: 'Druga Mila' },
    );

    expect(html).toContain('leaflet@1.9.4');
    expect(html).toContain('CD Test');
    expect(html).toContain('map-address-search');
    expect(html).toContain('name="map-type-filter"');
    expect(html).toContain('value="bolecin"');
    expect(html).toContain('name="map-harmonogram-filter"');
    expect(html).toContain('Wg harmonogramu');
    expect(html).toContain('mapPointMatchesWgHarmonogramuFilterMap');
    expect(html).toContain(COLOR_CD);
    expect(html).toContain(COLOR_BOLECIN);
    expect(html).toContain('normalizeForAddressSearchMap');
    expect(html).toContain('Filtr typu');
  });

  it('test_buildMapHtml_embeds_word_modal_when_template_present', () => {
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
    expect(html).toContain('doc-modal');
    expect(html).toContain('Generuj protokół');
    expect(html).toContain('BIOSYSTEM');
    expect(html).toContain('MIEJSCA_DOSTAWY');
    expect(html).toContain('resolveMiejsceDostawy');
    expect(html).toContain('openDocModal');
    expect(html).toContain('docxtemplater');
    expect(html).toContain('appendFormatkaRow');
    expect(html).toContain('czyProtokolZrobiony');
    expect(html).toContain('znacznikMiejsca: String(zal.typ');
    expect(html).toContain('"typ":"CD"');
    expect(html).toContain('map-bulk-panel');
    expect(html).toContain('openBulkDocModal');
    expect(html).toContain('map-manual-generate');
    expect(html).toContain('Generuj (wybór ręczny)');
    expect(html).toContain('map-manual-bulk-generate');
    expect(html).toContain('Hurtowo (wybór ręczny)');
    expect(html).toContain('map-manual-combined-generate');
    expect(html).toContain('Protokół łączony (wybór ręczny)');
    expect(html).toContain('openManualCombinedPicker');
    expect(html).toContain('runCombinedDocGenerate');
    expect(html).toContain('Pobierz 2× .docx');
    expect(html).toContain('downloadBothWord');
    expect(html).toContain('manual-bulk-picker');
    expect(html).toContain('openManualBulkPicker');
    expect(html).toContain('Zaznacz do hurtu');
    expect(html).toContain('Zaznacz do łączonego');
    expect(html).toContain('map-combined-panel');
    expect(html).toContain('openCombinedDocModal');
    expect(html).toContain('clearCombinedSelection');
    expect(html).toContain('__combinedSelectedLoadIdxs');
    expect(html).toContain('defaultDateZaladunkuYmd');
    expect(html).toContain('map-planowane-generate');
    expect(html).toContain('Planowane');
    expect(html).toContain('openPlanowanePicker');
    expect(html).toContain('listPlanowane');
    expect(html).toContain('Zapisz planowane');
    expect(html).toContain("mode === 'realize'");
    expect(html).toContain("'updatePlan' : 'plan'");
    expect(html).toContain("realizePayload.mode = 'realize'");
    expect(html).toContain('doc-btn-save-plan');
    expect(html).toContain('map-harmonogram-generate');
    expect(html).toContain('Generuj stały odbiór');
    expect(html).toContain('listHarmonogram');
    expect(html).toContain('commitHarm');
    expect(html).toContain('previewNumberHarm');
    expect(html).toContain('addHarmonogram');
    expect(html).toContain('doc-inp-uwagi');
    expect(html).toContain('openHarmonogramPicker');
    expect(html).toContain('proposeDatesFromDzienOdbioru');
  });

  it('test_buildMapHtml_empty_points_shows_banner', () => {
    const html = buildMapHtml([], { title: 'Druga Mila' });
    expect(html).toContain('map-empty-banner');
    expect(html).toContain('Brak punktów');
  });
});
