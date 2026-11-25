// "Plot City": the meta as a lit skyline. Usage: node city.cjs <repo> <cleanSpriteDir> <outDir> <dsf>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const REPO = process.argv[2], SP = process.argv[3], OUT = process.argv[4], DSF = +(process.argv[5] || 2);
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, W = rd('weekly.json'), L = rd('limitless.json');
const perf = L.adj.rows.map(r => [r[0], +(r[3] / L.teams * 100).toFixed(1), r[4]]);
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8'), TYPES = {};
for (const m of dataJs.matchAll(/\{"n":"([^"]+)","t":\[([^\]]+)\]/g)) TYPES[m[1]] = JSON.parse('[' + m[2] + ']');
const spr = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.webp')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : '')).replace('Arcanine-Hisui', 'Hisuian Arcanine').replace('Basculegion-F', 'Basculegion \u2640');
// the 24 highest-rated Pokemon that at least 1.5% of teams use
const top = perf.filter(r => r[1] >= 1.5 && R[r[0]] && SPRITE_ID[r[0]] && TYPES[r[0]]).sort((a, b) => R[b[0]] - R[a[0]] || b[1] - a[1]).slice(0, 24)
  .map(r => ({n: r[0], d: disp(r[0]), u: r[1], w: r[2], r: R[r[0]], t: TYPES[r[0]], img: spr(r[0])}));
const wk = a => a.slice(0, 3).map(x => ({d: disp(x[0]), v: x[3], img: spr(x[0]), t: TYPES[x[0]] || ['Normal']}));
const DATA = {top, up: wk(W.up), down: wk(W.down), wk: W.a, teams: L.teams, tours: L.tournaments, games: L.games, kd: W.up[0][3]};
console.log(top.map(m => m.n + ' ' + m.r).join(', '));
const lg = sb.NP_SVG.hdrD, html = fs.readFileSync(path.join(__dirname, 'city.tpl.html'), 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('<!--LOGO-->', lg).replace('<!--LOGO2-->', lg.replace(/nphdrD/g, 'nphdrDx'));
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, 'city.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
  console.log(await pg.evaluate(() => [document.fonts.check('900 20px Unbounded'), document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
  await pg.screenshot({path: path.join(OUT, 'nastyplot-home-concept-city.png'), fullPage: true}); await b.close();
})();
