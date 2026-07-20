/**
 * Testy scaffold Fazy 1 — config (env, stałe kolorów, ścieżki).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getConfig,
  getWebAppUrl,
  COL_NAZWA_PELNA,
  COL_NAZWA_SKROCONA,
  COL_ADRES,
  COL_TYP,
  COLOR_BOLECIN,
  COLOR_CD,
  COLOR_PLAC,
  COLOR_PUSTE,
  START_NUMBER,
  DEFAULT_FORMATKA_SHEETS_ID,
  POINT_COLOR_HEX,
  PROJECT_ROOT,
} from './config.js';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DRUGA_MILA_WEBAPP_URL;
    delete process.env.GEOCODE_CACHE_PATH;
    delete process.env.OUTPUT_HTML;
    delete process.env.GOOGLE_FORMATKA_SHEETS_ID;
    delete process.env.NOMINATIM_USER_AGENT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('column indices (Załadunek)', () => {
    it('test_col_nazwa_pelna_is_0', () => {
      expect(COL_NAZWA_PELNA).toBe(0);
    });

    it('test_col_nazwa_skrocona_is_1', () => {
      expect(COL_NAZWA_SKROCONA).toBe(1);
    });

    it('test_col_adres_is_2', () => {
      expect(COL_ADRES).toBe(2);
    });

    it('test_col_typ_is_3', () => {
      expect(COL_TYP).toBe(3);
    });
  });

  describe('point colors (SPEC)', () => {
    it('test_color_bolecin_hex', () => {
      expect(COLOR_BOLECIN).toBe('#fd7e14');
      expect(POINT_COLOR_HEX.bolecin).toBe('#fd7e14');
    });

    it('test_color_cd_hex', () => {
      expect(COLOR_CD).toBe('#0d6efd');
    });

    it('test_color_plac_hex', () => {
      expect(COLOR_PLAC).toBe('#198754');
    });

    it('test_color_puste_hex', () => {
      expect(COLOR_PUSTE).toBe('#6f42c1');
    });
  });

  describe('start number', () => {
    it('test_start_number_is_DM1', () => {
      expect(START_NUMBER).toBe('DM1');
    });
  });

  describe('getConfig / getWebAppUrl', () => {
    it('test_getWebAppUrl_empty_when_unset', () => {
      expect(getWebAppUrl()).toBe('');
    });

    it('test_getWebAppUrl_reads_env', () => {
      process.env.DRUGA_MILA_WEBAPP_URL = ' https://script.google.com/macros/s/abc/exec ';
      expect(getWebAppUrl()).toBe('https://script.google.com/macros/s/abc/exec');
    });

    it('test_getConfig_defaults_without_env', () => {
      const cfg = getConfig();
      expect(cfg.webAppUrl).toBe('');
      expect(cfg.formatkaSheetsId).toBe(DEFAULT_FORMATKA_SHEETS_ID);
      expect(cfg.geocodeCachePath).toContain('geocode-cache.json');
      expect(cfg.outputHtml).toContain('index.html');
      expect(cfg.pointsXlsxPath).toContain('druga-mila.xlsx');
      expect(cfg.podwykoXlsxPath).toContain('podwyko lista.xlsx');
      expect(cfg.wordTemplatePath).toContain('pusty.docx');
      expect(cfg.nominatimUserAgent.length).toBeGreaterThan(0);
    });

    it('test_getConfig_respects_env_overrides', () => {
      process.env.DRUGA_MILA_WEBAPP_URL = 'https://example.com/exec';
      process.env.GEOCODE_CACHE_PATH = '/tmp/cache.json';
      process.env.OUTPUT_HTML = '/tmp/out.html';
      process.env.GOOGLE_FORMATKA_SHEETS_ID = 'custom-id';
      process.env.NOMINATIM_USER_AGENT = 'test-ua';

      const cfg = getConfig();
      expect(cfg.webAppUrl).toBe('https://example.com/exec');
      expect(cfg.geocodeCachePath).toBe('/tmp/cache.json');
      expect(cfg.outputHtml).toBe('/tmp/out.html');
      expect(cfg.formatkaSheetsId).toBe('custom-id');
      expect(cfg.nominatimUserAgent).toBe('test-ua');
    });

    it('test_project_root_points_above_src', () => {
      expect(PROJECT_ROOT).toMatch(/druga-mila$/);
    });
  });
});
