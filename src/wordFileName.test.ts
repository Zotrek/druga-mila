import { describe, it, expect } from 'vitest';
import {
  sanitizeFileNamePart,
  formatDateForFileName,
  formatDateForDoc,
  buildDocxDownloadName,
  buildMiejsceZaladunkuWord,
} from './wordFileName.js';

describe('wordFileName', () => {
  it('test_sanitizeFileNamePart_strips_illegal_chars', () => {
    expect(sanitizeFileNamePart('a/b:c*d')).toBe('a b c d');
  });

  it('test_formatDateForFileName_iso_and_dotted', () => {
    expect(formatDateForFileName('2026-07-20')).toBe('20.07.26');
    expect(formatDateForFileName('20.07.2026')).toBe('20.07.26');
    expect(formatDateForFileName('')).toBe('');
  });

  it('test_formatDateForDoc_iso_to_dotted', () => {
    expect(formatDateForDoc('2026-07-20')).toBe('20.07.2026');
  });

  it('test_buildDocxDownloadName_uses_short_name_date_address', () => {
    expect(buildDocxDownloadName('GRODKÓW', '2026-07-20', '49-200 Grodków')).toBe(
      'GRODKÓW 20.07.26 49-200 Grodków.docx',
    );
  });

  it('test_buildDocxDownloadName_fallback_protokol', () => {
    expect(buildDocxDownloadName('', '', '')).toBe('protokol.docx');
  });

  it('test_buildMiejsceZaladunkuWord_joins_full_and_address', () => {
    expect(buildMiejsceZaladunkuWord('CD Test', '00-001 Wawa')).toBe('CD Test 00-001 Wawa');
  });
});
