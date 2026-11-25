// i41 (Nov 13, look-only): run with PAGE=app/dist/v2.html ADAPTER=v2 node experiments/<this file>
const H = await import('../app/test/behaviour/harness.mjs');
let pass = 0;
for (let run = 0; run < 10; run++) { const {ui, pg, close} = await H.open({team: H.TEAM, box: H.BOX, width: 390, touch: true});
  await ui.go('Build'); await ui.buildMeATeam(); await ui.builtTileLabel(0);
  const l = pg.locator('#main .bd-result .bd-six [data-v2mon]').filter({visible: true}).nth(0); await l.tap();
  await H.sleep(600); if (await ui.infoSheetText()) pass++; await close(); }
console.log('touch tap at 390, straight away: ' + pass + ' of 10 passed'); process.exit(0);
