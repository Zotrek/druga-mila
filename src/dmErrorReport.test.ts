import { describe, expect, it } from 'vitest';
import { DM_ERROR_CARD_SCRIPT, formatDrugaMilaError } from './dmErrorReport.js';

describe('formatDrugaMilaError', () => {
  it('test_formatDrugaMilaError_matches_the_card_clipboard_block', () => {
    const report = {
      code: 'DM-E-DOC-NUMBER',
      place: 'buildMapWordModal.ts previewNumerFromApi',
      summary: 'Nie udało się pobrać podglądu numeru.',
      effect: 'Numer możesz wpisać ręcznie.',
      technical: 'Failed to fetch',
    };
    const fromNode = formatDrugaMilaError(report);
    const fromCard = new Function(
      `${DM_ERROR_CARD_SCRIPT}\nreturn dmErrorReportText(${JSON.stringify(report)});`,
    )() as string;

    expect(fromNode).toBe(fromCard);
    expect(fromNode).toContain('DRUGA-MILA-ERROR');
    expect(fromNode).toContain('kod: DM-E-DOC-NUMBER');
    expect(fromNode).toContain('technicznie: Failed to fetch');
    expect(DM_ERROR_CARD_SCRIPT).not.toContain('</script>');
  });

  it('test_dmApiErrorCard_skips_session_and_password_mismatch', () => {
    const alerts = new Function(
      `var alerts = [];
      var window = { alert: function(msg) { alerts.push(msg); } };
      var document = { getElementById: function() { return null; } };
      ${DM_ERROR_CARD_SCRIPT}
      var report = { code: 'DM-E-SHEET-SAVE', summary: 'Nie zapisano.', effect: 'Wiersz nie wszedł.', place: 't', technical: 'x' };
      dmApiErrorCard_(report, { ok: false, error: 'proxy_auth_mismatch' }, null);
      dmApiErrorCard_(report, { ok: false, error: 'unauthorized', status: 401 }, null);
      dmApiErrorCard_(report, { ok: false, error: 'boom' }, null);
      return alerts;`,
    )() as string[];

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toContain('Nie zapisano.');
    expect(alerts[0]).toContain('technicznie: x');
  });
});
