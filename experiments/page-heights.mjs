// Page heights (rebuild rule, Sim Nov 11): full page height of every page of TODAY's site, default state (nothing expanded),
// full sample team, at phone 390x844, iPad 820x1180, desktop 1440x900, day mode. Prints JSON; writes docs/rebuild/test-runs/page-heights-today.json
import fs from 'node:fs'; import {fileURLToPath} from 'node:url';
import {open, closeAll, TEAM} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const VIEWS = ['home','report','auto','coverage','teams','compare','box','matchup','practice','gauntlet','speed','calc','types','weekly','ratings','meta','sets','top','events','arch','track','method','about'];
const SIZES = [['phone',390,844],['ipad',820,1180],['desktop',1440,900]];
const out = {};
for (const [k, w, h] of SIZES) {
  const {ui, pg, close} = await open({team: TEAM, width: w, height: h});
  for (const v of VIEWS) { try { await ui.go(v, 900); await pg.evaluate(() => scrollTo(0, 0));
      const H = await pg.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, ...[...document.querySelectorAll('main,.main,#app,.view.on,[data-view-root]')].map(e => e.scrollHeight)));
      (out[v] ||= {})[k] = H; } catch (e) { (out[v] ||= {})[k] = 'error: ' + e.message.slice(0, 60); } }
  await close(); }
await closeAll();
fs.mkdirSync(ROOT + 'docs/rebuild/test-runs', {recursive: true});
fs.writeFileSync(ROOT + 'docs/rebuild/test-runs/page-heights-today.json', JSON.stringify({ran: new Date().toISOString(), out}, null, 1));
console.log(JSON.stringify(out));
