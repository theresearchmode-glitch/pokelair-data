// "Room to breathe" homepage concept. Usage: node air.cjs <repo> <homeRenderDir> <outDir> <dsf>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const REPO = process.argv[2], SP = process.argv[3], OUT = process.argv[4], DSF = +(process.argv[5] || 1.5);
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, W = rd('weekly.json'), L = rd('limitless.json'), T = rd('teams.json').teams[0], mons = L.results.mons;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const has = n => fs.existsSync(path.join(SP, SPRITE_ID[n] + '.png')), spr = n => 'data:image/png;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.png')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : '')).replace('Arcanine-Hisui', 'Hisuian Arcanine');
const mon = n => ({n, d: disp(n), r: R[n] || 0, u: mons[n] ? +(mons[n][0] / L.teams * 100).toFixed(1) : 0, w: mons[n] ? +(mons[n][1] * 100).toFixed(1) : 0, img: spr(n)});
// the strongest real pairing (600+ teams) among Pokemon we have art for
const pair = Object.entries(L.results.pairs).map(([k, v]) => ({a: k.split('|')[0], b: k.split('|')[1], n: v[0], w: +(v[1] * 100).toFixed(1)})).filter(p => p.n >= 600 && has(p.a) && has(p.b)).sort((x, y) => y.w - x.w)[0];
const rail = Object.keys(mons).filter(n => has(n) && mons[n][0] / L.teams >= .015).sort((a, b) => R[b] - R[a]).slice(0, 7).map(mon);
const wk = a => a.slice(0, 3).map(x => ({...mon(x[0]), v: x[3]}));
const DATA = {hero: mon(rail[0].n), back: ['Rillaboom', 'Incineroar'].map(mon), extra: ['Whimsicott', 'Sinistcha'].map(mon), rail, pair: {a: mon(pair.a), b: mon(pair.b), n: pair.n, w: pair.w},
  six: T.mons.map(mon), sixP: T.player, sixE: T.event, up: wk(W.up), down: wk(W.down), wk: W.a, teams: L.teams, tours: L.tournaments, games: L.games, base: Math.round(L.results.base * 100),
  doors: ['Garchomp', 'Milotic', 'Annihilape', 'Archaludon'].map(mon)};
console.log('hero', DATA.hero.n, '| pair', pair.a, pair.b, pair.w, pair.n, '| rail', rail.map(m => m.n + ' ' + m.r).join(', '));
const html = fs.readFileSync(path.join(__dirname, 'air.tpl.html'), 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';');
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, 'air.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(900);
  console.log(await pg.evaluate(() => [document.fonts.check('300 40px "Bricolage Grotesque"'), document.documentElement.scrollWidth, document.documentElement.scrollHeight, window.__pal || ''].join(' ')));
  await pg.screenshot({path: path.join(OUT, 'nastyplot-home-concept-air.png'), fullPage: true}); await b.close();
})();
