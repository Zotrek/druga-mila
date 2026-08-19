/**
 * CLI: pobierz przewoźników z Google Sheets → data/reference-przewoznicy.json
 * + opcjonalnie sync docs/podwyko lista.xlsx (--sync-xlsx).
 */

import { writeFileSync } from 'node:fs';
import { getConfig } from './config.js';
import { syncPodwykoXlsxFromReference } from './readPodwyko.js';

interface ListReferenceResponse {
  ok?: boolean;
  data?: {
    przewoznicy?: Array<Record<string, unknown>>;
  };
}

async function main(): Promise<void> {
  const cfg = getConfig();
  if (!cfg.webAppUrl) {
    console.error('[druga-mila] pull:przewoznicy — brak DRUGA_MILA_WEBAPP_URL w .env');
    process.exit(1);
  }

  const url =
    cfg.webAppUrl +
    (cfg.webAppUrl.includes('?') ? '&' : '?') +
    'action=listReferenceData';
  console.log('[druga-mila] pull:przewoznicy start');
  const res = await fetch(url);
  const json = (await res.json()) as ListReferenceResponse;
  const raw = json.data?.przewoznicy ?? [];
  const przewoznicy = raw
    .filter((r) => !String(r.nazwaWyswietlana ?? '').startsWith('__DEPLOY_CHECK'))
    .map((r) => ({
      nazwaWyswietlana: r.nazwaWyswietlana,
      nazwaDoProtokolu: r.nazwaDoProtokolu,
      adres: r.adres,
      nip: r.nip,
      bdo: r.bdo,
    }));

  writeFileSync(cfg.referencePrzewoznicyPath, `${JSON.stringify(przewoznicy, null, 2)}\n`);
  console.log(`  zapisano ${przewoznicy.length} → ${cfg.referencePrzewoznicyPath}`);

  if (process.argv.includes('--sync-xlsx')) {
    syncPodwykoXlsxFromReference(cfg.referencePrzewoznicyPath, cfg.podwykoXlsxPath);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
