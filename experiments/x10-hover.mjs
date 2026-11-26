// i41 (Nov 13, look-only): run with PAGE=app/dist/v2.html ADAPTER=v2 node experiments/<this file>
const H = await import('../app/test/behaviour/harness.mjs');
const HOVER = process.env.HOVER === '1'; let pass = 0;
for (let run = 0; run < 10; run++) { const {ui, pg, close} = await H.open({team: H.TEAM, box: H.BOX});
  await ui.go('Build'); await ui.buildMeATeam(); await ui.builtTileLabel(0);
  if (HOVER) { const l = pg.locator('#main .bd-result .bd-six [data-v2mon]').filter({visible: true}).nth(0); await l.hover(); }
  await ui.tapBuiltTile(0); await H.sleep(600); if (await ui.infoSheetText()) pass++; await close(); }
console.log((HOVER ? 'hover first: ' : 'as the test: ') + pass + ' of 10 passed'); process.exit(0);
