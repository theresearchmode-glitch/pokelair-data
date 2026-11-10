// Homepage v3 (breathable + NastyPlot's voice + review fixes). Usage: node air5.cjs <repo> <homeRenderDir> <outDir> <dsf> <light|dark> <desktop|iphone> [clipIds]
// No player names anywhere in this mock (site rule): the only team shown is NastyPlot's own sample team.
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const [REPO, SP, OUT] = process.argv.slice(2), DSF = +(process.argv[5] || 1.5), THEME = process.argv[6] || 'light', MOB = process.argv[7] === 'iphone', CLIPS = process.argv[8] || '';
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8')), here = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const R = rd('ratings_log.json').days.slice(-1)[0].r, W = rd('weekly.json'), L = rd('limitless.json'), mons = L.results.mons;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8'), dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const LG = sb.NP_SVG[THEME === 'dark' ? 'hdrD' : 'hdrL'], LG2 = LG.replace(/nphdr([DL])/g, 'nphdr$1x');
const has = n => fs.existsSync(path.join(SP, SPRITE_ID[n] + '.png')), spr = n => 'data:image/png;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.png')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : ''));
const info = n => { const i = dataJs.indexOf('{"n":"' + n + '",'), s = dataJs.slice(i, i + 400); return {t: JSON.parse(s.match(/"t":(\[[^\]]+\])/)[1]), sp: +s.match(/"sp":(\d+)/)[1]}; };
const mon = n => ({n, d: disp(n), r: R[n] || 0, u: mons[n] ? +(mons[n][0] / L.teams * 100).toFixed(1) : 0, w: mons[n] ? +(mons[n][1] * 100).toFixed(1) : 0, ...info(n), img: spr(n)});
const pair = Object.entries(L.results.pairs).map(([k, v]) => ({a: k.split('|')[0], b: k.split('|')[1], n: v[0], w: +(v[1] * 100).toFixed(1)})).filter(p => p.n >= 700 && has(p.a) && has(p.b)).sort((x, y) => y.w - x.w)[0];
const rail = Object.keys(mons).filter(n => has(n) && mons[n][0] / L.teams >= .015).sort((a, b) => R[b] - R[a]).slice(0, 7).map(mon);
const wk = a => a.slice(0, 3).map(x => ({...mon(x[0]), v: x[3]}));
const SAMPLE = {name: 'Sun Tailwind', letter: 'A', score: 99, ready: 83, of: 30, handled: 22, shaky: 8, lead: ['Garchomp', 'Sneasler'], back: ['Charizard-Mega-Y', 'Whimsicott'], bench: ['Basculegion', 'Kingambit']};
const DATA = {hero: mon(rail[0].n), back: ['Rillaboom', 'Incineroar'].map(mon), extra: ['Whimsicott', 'Sinistcha'].map(mon), rail, pair: {a: mon(pair.a), b: mon(pair.b), n: pair.n, w: pair.w},
  sample: SAMPLE, team: [...SAMPLE.lead, ...SAMPLE.back, ...SAMPLE.bench].map(mon), them: ['Sneasler', 'Rillaboom', 'Incineroar', 'Kingambit', 'Charizard-Mega-Y', 'Archaludon'].map(mon),
  speed: ['Kingambit', 'Incineroar', 'Rillaboom', 'Garchomp', 'Sneasler', 'Dragapult'].map(mon),
  up: wk(W.up), down: wk(W.down), wk: W.a, teams: L.teams, tours: L.tournaments, games: L.games, base: Math.round(L.results.base * 100), doors: ['Garchomp', 'Milotic', 'Annihilape', 'Archaludon'].map(mon)};
const VW = MOB ? 390 : 1440, NAME = 'nastyplot-home-v3' + (MOB ? '-iphone' : '') + (THEME === 'dark' ? '-dark' : '');
let html = here(MOB ? 'air2m.tpl.html' : 'air4.tpl.html');
// bigger hero, now that the art is sharp enough to carry it
const swap = (a, b) => { if (!html.includes(a)) console.log('MISSING', a.slice(0, 40)); html = html.replace(a, b); };
if (MOB) { swap('stand(H,196,770,330,{refl:1})', 'stand(H,196,770,376,{refl:1})'); swap("img(wh,292,404,84,", "img(wh,306,366,72,"); }
else { swap('stand(H,965,790,500,{refl:1})', 'stand(H,980,790,580,{refl:1})'); swap('left:764px;top:176px;width:480px;height:540px;', 'left:772px;top:150px;width:486px;height:590px;');
  swap('<div class="plate" style="left:790px;top:258px">', '<div class="plate" style="left:800px;top:214px">'); swap('<div class="cap" style="left:965px;top:812px;', '<div class="cap" style="left:980px;top:812px;'); swap('.spec{position:absolute;z-index:5;left:1268px;width:170px}', '.spec{position:absolute;z-index:5;left:1284px;width:150px}'); }
if (MOB) html = html.replace('<header><div class="wm">Nasty<span>Plot</span></div>', '<header><div class="logo">%LOGO%</div>').replace('<footer><div class="wm">Nasty<span>Plot</span></div>', '<footer><div class="logo">%LOGO2%</div>')
  .replace('family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Instrument+Sans', 'family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Unbounded:wght@300..900&family=Instrument+Sans');
html = html.replace('</style></head>', here(MOB ? 'mob-over.css' : 'desk-over.css') + '</style></head>').replace('document.body.dataset.ready=1;', here(MOB ? 'mob-over.js' : 'desk-over.js') + '\ndocument.body.dataset.ready=1;')
  .replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('<html lang="en">', '<html lang="en" data-theme="' + THEME + '">').replace('%LOGO%', LG).replace('%LOGO2%', LG2);
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
