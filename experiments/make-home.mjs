// Home mock-up (R2): real numbers from today's site, upscaled art, logo -> docs/rebuild/mocks/out/home.html + PNGs.
// Ratings come live from the site through the test harness. The hero, This Week chips, the latest winner and the game plan
// were read from today's Home on Nov 11 (sample team below). The event's organiser handle is left out (no-names rule).
import fs from 'node:fs'; import vm from 'node:vm'; import {fileURLToPath} from 'node:url'; import {chromium} from 'playwright';
import {open, closeAll} from '../app/test/behaviour/harness.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), MOCKS = ROOT + 'docs/rebuild/mocks/', OUT = MOCKS + 'out/';
const helpers = fs.readFileSync(ROOT + 'app/src/app/15-visual-helpers.js', 'utf8'), i0 = helpers.indexOf('SPRITE_ID =');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', i0), helpers.indexOf('}', i0) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(ROOT + 'app/src/data/logos.js', 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const art = n => { const id = SPRITE_ID[n]; const f = ROOT + `docs/rebuild/art/up1024/${id}.webp`; if (!id || !fs.existsSync(f)) throw new Error('no art for ' + n); return 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64'); };
const TEAM = ['Garchomp', 'Sneasler', 'Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit'];
const {ui, close} = await open({team: TEAM, width: 1440});
// Top of the Meta: read from today's Home itself, so the order and ranks are exactly the site's (one source for every number)
await ui.go('home', 1500);
const txt = await ui.peek(`(document.querySelector('.view.on')||document.body).innerText`);
const block = txt.split('Tap one for the breakdown.')[1].split('All ratings')[0].trim().split('\n').map(x => x.trim()).filter(Boolean);
const s = JSON.parse(await ui.peek(`JSON.stringify({names:Object.fromEntries([...byName.values()].map(p=>[p.d,p.n])),under:(()=>{const p=byName.get('Flapple');return {n:p.n,d:p.d};})()})`));
await close(); await closeAll();
s.top = []; for (let i = 0; i + 3 < block.length; i += 4) s.top.push({d: block[i], n: s.names[block[i]], tier: block[i + 1], r: +block[i + 2], rank: +block[i + 3].replace('#', '')});
s.top.forEach(t => { if (!t.n && t.d.startsWith('Mega ')) { const [b, x] = t.d.slice(5).split(/\s/); t.n = b + '-Mega' + (x ? '-' + x : ''); } }); s.top.forEach(t => { t.img = art(t.n); });
const mon = (n, d, extra) => ({n, d, img: art(n), ...extra});
const D = {
  teams: '13,826', src: 'Most used in October, Showdown ladder 1630+. Data as of Nov 10.',
  used: [mon('Sneasler', 'Sneasler', {pct: '35.6'}), mon('Rillaboom', 'Rillaboom', {pct: '35.5'}), mon('Incineroar', 'Incineroar', {pct: '31.8'})],
  week: [{d: 'Whimsicott', up: 1, n: 5}, {d: 'Mega Salamence', up: 1, n: 2}, {d: 'Mega Garchomp Z', up: 0, n: 2}, {d: 'Volcarona', up: 0, n: 2}],
  champ: {event: 'Champions Arena #18', record: '9-1', date: 'Nov 9', players: 66, events: 113, mons: [
    mon('Pelipper', 'Pelipper', {item: 'Sitrus Berry'}), mon('Venusaur-Mega', 'Mega Venusaur', {item: 'Venusaurite'}), mon('Archaludon', 'Archaludon', {item: 'Leftovers'}),
    mon('Charizard-Mega-Y', 'Mega Charizard Y', {item: 'Charizardite Y'}), mon('Grimmsnarl', 'Grimmsnarl', {item: 'Light Clay'}), mon('Annihilape', 'Annihilape', {item: 'Choice Scarf'})]},
  teamName: 'Sun Tailwind', score: 91, band: 'Top tier',
  team: [mon('Garchomp', 'Garchomp'), mon('Sneasler', 'Sneasler'), mon('Charizard-Mega-Y', 'Mega Charizard Y'), mon('Whimsicott', 'Whimsicott'), mon('Basculegion', 'Basculegion'), mon('Kingambit', 'Kingambit')],
  plan: 'lead Garchomp + Sneasler, back Mega Charizard Y + Whimsicott, bench Basculegion + Kingambit.',
  top: s.top, under: {...s.under, img: art(s.under.n)},
  tools: [['Battle Mode', 'Their six in, your four, the leads and turn 1 out'], ['Teams', 'Search every winning team by Pokémon, item or move'], ['Type Chart', 'What hits what, and your team against every type'],
    ['Ratings', 'Every legal Pokémon on one tier board'], ['Damage Calc', 'Real damage with stats, items and spread moves'], ['Events', 'Every recent tournament, top cut and full sets'],
    ['Test Run', 'Run your team into the top 20 tournament teams'], ['Popular Sets', 'Moves, items and natures players run'], ['Speed Tiers', 'Who moves first, with Tailwind and Trick Room'],
    ['Archetypes', 'How to beat Trick Room, Tailwind, rain, sun and more'], ['Winning Cores', 'Pairs and trios that win the most'], ['How We Calculate', 'Where every number comes from']],
  logo: sb.NP_SVG.hdrL, logoD: sb.NP_SVG.hdrD};
fs.writeFileSync(OUT + 'home.html', fs.readFileSync(MOCKS + 'home.tpl.html', 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(D) + ';'));
fs.copyFileSync(MOCKS + 'tokens.css', OUT + 'tokens.css');
console.log('top10', s.top.map(t => `${t.rank}.${t.d} ${t.r}`).join(', '));
const b = await chromium.launch();
for (const [layout, w, h] of [['desktop', 1440, 900], ['ipad', 820, 1180], ['phone', 390, 844]]) for (const theme of ['light', 'dusk']) {
  const pg = await (await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2})).newPage();
  await pg.goto('file://' + OUT + 'home.html#' + theme); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 30000}); await pg.waitForTimeout(500);
  await pg.screenshot({path: OUT + `home-${layout}-${theme}.png`, fullPage: true}); await pg.close(); }
await b.close();
