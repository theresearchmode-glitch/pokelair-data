// "Room to breathe", second version. Usage: node air3.cjs <repo> <homeRenderDir> <outDir> <dsf> <light|dark> <desktop|iphone> [clipIds]
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const [REPO, SP, OUT] = process.argv.slice(2), DSF = +(process.argv[5] || 1.5), THEME = process.argv[6] || 'light', MOB = process.argv[7] === 'iphone', FLAIR = process.argv[7] === 'flair', CLIPS = process.argv[8] || '';
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, W = rd('weekly.json'), L = rd('limitless.json'), mons = L.results.mons;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8'), dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const has = n => fs.existsSync(path.join(SP, SPRITE_ID[n] + '.png')), spr = n => 'data:image/png;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.png')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : ''));
const info = n => { const i = dataJs.indexOf('{"n":"' + n + '",'), s = dataJs.slice(i, i + 400); return {t: JSON.parse(s.match(/"t":(\[[^\]]+\])/)[1]), sp: +s.match(/"sp":(\d+)/)[1]}; };
const mon = n => ({n, d: disp(n), r: R[n] || 0, u: mons[n] ? +(mons[n][0] / L.teams * 100).toFixed(1) : 0, w: mons[n] ? +(mons[n][1] * 100).toFixed(1) : 0, ...info(n), img: spr(n)});
const pair = Object.entries(L.results.pairs).map(([k, v]) => ({a: k.split('|')[0], b: k.split('|')[1], n: v[0], w: +(v[1] * 100).toFixed(1)})).filter(p => p.n >= 700 && has(p.a) && has(p.b)).sort((x, y) => y.w - x.w)[0];
const rail = Object.keys(mons).filter(n => has(n) && mons[n][0] / L.teams >= .015).sort((a, b) => R[b] - R[a]).slice(0, 7).map(mon);
const wk = a => a.slice(0, 3).map(x => ({...mon(x[0]), v: x[3]}));
// The grade scene shows the site's own sample team. Its grade and game plan were read from the built page (My team view, Nov 8 data).
const SAMPLE = {name: 'Sun Tailwind', letter: 'A', score: 99, ready: 83, of: 30, handled: 22, shaky: 8, lead: ['Garchomp', 'Sneasler'], back: ['Charizard-Mega-Y', 'Whimsicott'], bench: ['Basculegion', 'Kingambit']};
const DATA = {hero: mon(rail[0].n), back: ['Rillaboom', 'Incineroar'].map(mon), extra: ['Whimsicott', 'Sinistcha'].map(mon), rail, pair: {a: mon(pair.a), b: mon(pair.b), n: pair.n, w: pair.w},
  sample: SAMPLE, team: [...SAMPLE.lead, ...SAMPLE.back, ...SAMPLE.bench].map(mon),
  them: ['Sneasler', 'Rillaboom', 'Incineroar', 'Kingambit', 'Charizard-Mega-Y', 'Archaludon'].map(mon), // the site's own "meta's top six" (CH.metaSix on the built page)
  speed: ['Kingambit', 'Incineroar', 'Rillaboom', 'Garchomp', 'Sneasler', 'Dragapult'].map(mon),
  up: wk(W.up), down: wk(W.down), wk: W.a, teams: L.teams, tours: L.tournaments, games: L.games, base: Math.round(L.results.base * 100), doors: ['Garchomp', 'Milotic', 'Annihilape', 'Archaludon'].map(mon)};
const VW = MOB ? 390 : 1440, NAME = 'nastyplot-home-concept-air-v2' + (MOB ? '-iphone' : FLAIR ? '-flair' : '') + (THEME === 'dark' ? '-dark' : '');
const sb = {}; require('vm').createContext(sb); require('vm').runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb); const LG = sb.NP_SVG[THEME === 'dark' ? 'hdrD' : 'hdrL'];
const html = fs.readFileSync(path.join(__dirname, MOB ? 'air2m.tpl.html' : FLAIR ? 'air4.tpl.html' : 'air2.tpl.html'), 'utf8').replace('%LOGO%', LG).replace('%LOGO2%', LG.replace(/nphdr([DL])/g, 'nphdr$1x')).replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('<html lang="en">', '<html lang="en" data-theme="' + THEME + '">');
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, NAME + '.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: VW, height: MOB ? 844 : 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 20000}).catch(() => console.log('NOT READY'));
  const H = await pg.evaluate(() => document.documentElement.scrollHeight); console.log(NAME, await pg.evaluate(() => document.documentElement.scrollWidth), H);
  await pg.screenshot({path: path.join(OUT, NAME + '.png'), fullPage: true});
  const top = id => pg.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return [r.top + scrollY, r.height]; }, id);
  for (const id of CLIPS.split(',').filter(Boolean)) { const [y, h] = await top(id); await pg.screenshot({path: path.join(OUT, 'clip-' + id + '.png'), clip: {x: 0, y, width: VW, height: h}, fullPage: true}); }
  if (MOB) { const [cut] = await top('prev');
    await pg.screenshot({path: path.join(OUT, NAME + '-part1.png'), clip: {x: 0, y: 0, width: VW, height: cut}, fullPage: true});
    await pg.screenshot({path: path.join(OUT, NAME + '-part2.png'), clip: {x: 0, y: cut, width: VW, height: H - cut}, fullPage: true}); }
  await b.close();
})();
