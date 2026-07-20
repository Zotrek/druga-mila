/**
 * Pipeline CLI: points → geocode → buildMapHtml → index.html.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { getConfig } from './config.js';
import { readPoints } from './readPoints.js';
import { readPodwyko } from './readPodwyko.js';
import { attachCoords, geocodeAddresses } from './geocode.js';
import { buildMapHtml } from './buildMapHtml.js';

async function main(): Promise<void> {
  const cfg = getConfig();
  console.log('[druga-mila] generate start');

  const points = readPoints(cfg.pointsXlsxPath);
  const podwyko = readPodwyko(cfg.podwykoXlsxPath);
  console.log(`  punkty (z adresem): ${points.length}`);
  console.log(`  podwyko: ${podwyko.length}`);

  const byKind = { bolecin: 0, cd: 0, plac: 0, puste: 0 };
  for (const p of points) {
    byKind[p.colorKind] += 1;
  }
  console.log(
    `  kolory: CD=${byKind.cd} PLAC=${byKind.plac} puste=${byKind.puste} Bolęcin=${byKind.bolecin}`,
  );

  const { results, stats } = await geocodeAddresses(
    points.map((p) => p.adres),
    {
      cachePath: cfg.geocodeCachePath,
      userAgent: cfg.nominatimUserAgent,
    },
  );

  const withCoords = attachCoords(points, results);
  const onMap = withCoords.filter(
    (p) => p.geocodeStatus === 'ok' && p.lat != null && p.lon != null,
  );

  console.log(
    `  geocode: unique=${stats.unique} cacheHits=${stats.cacheHits} fetched=${stats.fetched} ok=${stats.ok} fail=${stats.fail}`,
  );
  console.log(`  pinezki z coords: ${onMap.length}`);

  const templateBytes = await readFile(cfg.wordTemplatePath);
  const wordEmbed = {
    templateBase64: templateBytes.toString('base64'),
    podwykoOptions: podwyko.map((e) => ({ label: e.label, value: e.value })),
    loadPoints: points.map((p) => ({
      nazwaPelna: p.nazwaPelna,
      nazwaSkrocona: p.nazwaSkrocona,
      adres: p.adres,
      typ: p.typ,
    })),
  };

  const html = buildMapHtml(
    onMap.map((p) => ({
      nazwaPelna: p.nazwaPelna,
      nazwaSkrocona: p.nazwaSkrocona,
      adres: p.adres,
      typ: p.typ,
      colorKind: p.colorKind,
      lat: p.lat!,
      lon: p.lon!,
    })),
    { webAppUrl: cfg.webAppUrl, title: 'Druga Mila', wordEmbed },
  );

  await writeFile(cfg.outputHtml, html, 'utf-8');
  console.log(`  zapisano: ${cfg.outputHtml} (${html.length} B)`);
  console.log(`  word: ${cfg.wordTemplatePath} (${templateBytes.length} B)`);
  console.log(`  webApp: ${cfg.webAppUrl || '(brak — Word bez POST)'}`);
  console.log('[druga-mila] generate OK');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
