// "Room to breathe", second version. Usage: node air2.cjs <repo> <homeRenderDir> <outDir> <dsf>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const REPO = process.argv[2], SP = process.argv[3], OUT = process.argv[4], DSF = +(process.argv[5] || 1.5);
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, W = rd('weekly.json'), L = rd('limitless.json'), mons = L.results.mons;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8'), dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const has = n => fs.existsSync(path.join(SP, SPRITE_ID[n] + '.png')), spr = n => 'data:image/png;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.png')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : ''));
const info = n => { const i = dataJs.indexOf('{"n":"' + n + '",'), s = dataJs.slice(i, i + 400); return {t: JSON.parse(s.match(/"t":(\[[^\]]+\])/)[1]), sp: +s.match(/"sp":(\d+)/)[1]}; };
const mon = n => ({n, d: disp(n), r: R[n] || 0, u: mons[n] ? +(mons[n][0] / L.teams * 100).toFixed(1) : 0, w: mons[n] ? +(mons[n][1] * 100).toFixed(1) : 0, ...info(n), img: spr(n)});
const pair = Object.entries(L.results.pairs).map(([k, v]) => ({a: k.split('|')[0], b: k.split('|')[1], n: v[0], w: +(v[1] * 100).toFixed(1)})).filter(p => p.n >= 700 && has(p.a) && has(p.b)).sort((x, y) => y.w - x.w)[0];
const byUse = Object.keys(mons).sort((a, b) => mons[b][0] - mons[a][0]);
const rail = byUse.filter(n => has(n) && mons[n][0] / L.teams >= .015).sort((a, b) => R[b] - R[a]).slice(0, 7).map(mon);
const wk = a => a.slice(0, 3).map(x => ({...mon(x[0]), v: x[3]}));
// The grade scene shows the site's own sample team. Its grade and game plan were read from the built page (My team view, Nov 8 data).
const SAMPLE = {name: 'Sun Tailwind', letter: 'A', score: 99, ready: 83, of: 30, handled: 22, shaky: 8, lead: ['Garchomp', 'Sneasler'], back: ['Charizard-Mega-Y', 'Whimsicott'], bench: ['Basculegion', 'Kingambit']};
const DATA = {hero: mon(rail[0].n), back: ['Rillaboom', 'Incineroar'].map(mon), extra: ['Whimsicott', 'Sinistcha'].map(mon), rail, pair: {a: mon(pair.a), b: mon(pair.b), n: pair.n, w: pair.w},
  sample: SAMPLE, team: [...SAMPLE.lead, ...SAMPLE.back, ...SAMPLE.bench].map(mon), them: ['Sneasler', 'Rillaboom', 'Incineroar', 'Kingambit', 'Charizard-Mega-Y', 'Archaludon'].map(mon), /* the site's own "meta's top six" (CH.metaSix on the built page) */ speed: ['Kingambit', 'Incineroar', 'Rillaboom', 'Garchomp', 'Sneasler', 'Dragapult'].map(mon),
  up: wk(W.up), down: wk(W.down), wk: W.a, teams: L.teams, tours: L.tournaments, games: L.games, base: Math.round(L.results.base * 100), doors: ['Garchomp', 'Milotic', 'Annihilape', 'Archaludon'].map(mon)};
console.log('pair', pair.a, pair.b, pair.w, pair.n, '| them', DATA.them.map(m => m.n).join(','), '| speed', DATA.speed.map(m => m.n + ' ' + m.sp).join(', '), '| hero', DATA.hero.n, DATA.hero.t.join('/'));
const MOB = process.argv[8] === 'm', VW = MOB ? 390 : 1440, TAG = (MOB ? '-iphone' : '') + (process.argv[7] === 'dark' ? '-dark' : '');
const html = fs.readFileSync(path.join(__dirname, MOB ? 'air2m.tpl.html' : 'air2.tpl.html'), 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('<html lang="en">', '<html lang="en" data-theme="' + (process.argv[7] || 'light') + '">');
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, 'air2.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: VW, height: MOB ? 844 : 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 20000}).catch(() => console.log('NOT READY'));
  console.log(await pg.evaluate(() => [document.fonts.check('300 40px "Bricolage Grotesque"'), document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
  await pg.screenshot({path: path.join(OUT, 'nastyplot-home-concept-air-v2' + TAG + '.png'), fullPage: true});
  if (process.argv[6]) for (const id of process.argv[6].split(',')) { const r = await pg.evaluate(id => { const b = document.getElementById(id).getBoundingClientRect(); return {x: 0, y: b.top + scrollY, width: innerWidth, height: b.height}; }, id); await pg.screenshot({path: path.join(OUT, 'v2-' + id + '.png'), clip: r, fullPage: true}); } await b.close();
})();
