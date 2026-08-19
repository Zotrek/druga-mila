/**
 * CLI: wypchnięcie wszystkich miejsc załadunku / przewoźników / dostawy do Google Sheets.
 * Wymaga wdrożonego Apps Script z mode seedReferenceData.
 */

import { getConfig } from './config.js';
import { buildReferenceSeedPayload } from './buildReferenceSeedPayload.js';

async function main(): Promise<void> {
  const cfg = getConfig();
  if (!cfg.webAppUrl) {
    console.error('[druga-mila] seed:sheets — brak DRUGA_MILA_WEBAPP_URL w .env');
    process.exit(1);
  }

  console.log('[druga-mila] seed:sheets start');
  const payload = await buildReferenceSeedPayload(cfg);
  console.log(
    `  do wysłania: załadunek=${payload.zaladunek.length}, przewoźnicy=${payload.przewoznicy.length}, dostawa=${payload.miejscaDostawy.length}`,
  );

  const res = await fetch(cfg.webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json: { ok?: boolean; error?: string; counts?: Record<string, number> };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    console.error('[druga-mila] seed:sheets — nieprawidłowa odpowiedź:', text.slice(0, 300));
    process.exit(1);
  }

  if (!json.ok) {
    console.error('[druga-mila] seed:sheets FAIL:', json.error ?? text);
    process.exit(1);
  }

  console.log('[druga-mila] seed:sheets OK', json.counts ?? '');
  console.log('  zakładki: Miejsca załadunku | Przewoźnicy | Miejsca dostawy');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
