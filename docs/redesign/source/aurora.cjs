// "The Plot", second pass: the meta as a field of type colour, clean renders. Usage: node aurora.cjs <repo> <cleanSpriteDir> <outDir> <dsf>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const REPO = process.argv[2], SP = process.argv[3], OUT = process.argv[4], DSF = +(process.argv[5] || 2);
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, W = rd('weekly.json'), L = rd('limitless.json'), T = rd('teams.json').teams[0];
const perf = L.adj.rows.map(r => [r[0], +(r[3] / L.teams * 100).toFixed(1), r[4]]).sort((a, b) => b[1] - a[1]);
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8'), TYPES = {};
for (const m of dataJs.matchAll(/\{"n":"([^"]+)","t":\[([^\]]+)\]/g)) TYPES[m[1]] = JSON.parse('[' + m[2] + ']');
const spr = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.webp')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : ''));
const row = n => perf.find(r => r[0] === n), champ = T.mons, feat = ['Rillaboom', 'Sneasler', 'Kingambit', 'Annihilape'];
const names = [...new Set([...perf.slice(0, 44).map(r => r[0]), ...champ])].filter(n => row(n) && row(n)[2] >= 46.3 && row(n)[1] >= 1.5);
const pts = names.map(n => ({n, d: disp(n), u: row(n)[1], w: row(n)[2], r: R[n] || 0, t: TYPES[n] || ['Normal'], c: champ.includes(n), f: feat.includes(n), img: (champ.includes(n) || feat.includes(n)) ? spr(n) : ''}));
const wk = a => a.slice(0, 3).map(x => ({d: disp(x[0]), v: x[3], img: spr(x[0]), t: TYPES[x[0]] || ['Normal']}));
const DATA = {pts, up: wk(W.up), down: wk(W.down), wk: W.a, teams: L.teams, tours: L.tournaments, games: L.games, champ: {player: T.player, event: T.event}, king: {u: row('Kingambit')[1], w: row('Kingambit')[2], r: R.Kingambit, d: W.up[0][3], t: TYPES.Kingambit}};
console.log(pts.length, 'points; missing types:', pts.filter(p => !TYPES[p.n]).map(p => p.n).join(',') || 'none');
const lg = sb.NP_SVG.hdrD, html = fs.readFileSync(path.join(__dirname, 'aurora.tpl.html'), 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('<!--LOGO-->', lg).replace('<!--LOGO2-->', lg.replace(/nphdrD/g, 'nphdrDx'));
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, 'aurora.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
  console.log(await pg.evaluate(() => [document.fonts.check('900 20px Unbounded'), document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
  await pg.screenshot({path: path.join(OUT, 'nastyplot-home-concept-plot-colour.png'), fullPage: true}); await b.close();
})();
