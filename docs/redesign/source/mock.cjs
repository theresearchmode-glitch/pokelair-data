// Builds the homepage concept mock from NastyPlot's real data and screenshots it. Usage: node mock.cjs <repo> <outDir>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const REPO = process.argv[2], OUT = process.argv[3];
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, W = rd('weekly.json'), L = rd('limitless.json'), perf = L.adj.rows.map(r => [r[0], +(r[3] / L.teams * 100).toFixed(1), r[4]]).sort((a, b) => b[1] - a[1]), T = rd('teams.json').teams[0];
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const LIGHT = process.argv[5] === 'light', LOGO = LIGHT ? sb.NP_SVG.hdrL : sb.NP_SVG.hdrD;
const spr = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(REPO, 'app/sp', SPRITE_ID[n] + '.webp')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : '')).replace('Basculegion-F', 'Basculegion â™€').replace('Indeedee-F', 'Indeedee â™€').replace('Arcanine-Hisui', 'Hisuian Arcanine').replace('Ninetales-Alola', 'Alolan Ninetales');
const row = n => perf.find(r => r[0] === n);
const champ = T.mons, feat = ['Rillaboom', 'Sneasler', 'Kingambit', 'Annihilape'];
const names = [...new Set([...perf.slice(0, 44).map(r => r[0]), ...champ])].filter(n => row(n) && row(n)[2] >= 46.3 && row(n)[1] >= 1.5);
const pts = names.map(n => ({n, d: disp(n), u: row(n)[1], w: row(n)[2], r: R[n] || 0, c: champ.includes(n), f: feat.includes(n), img: (champ.includes(n) || feat.includes(n)) ? spr(n) : ''}));
const wk = (a, k) => a.slice(0, 3).map(x => ({d: disp(x[0]), v: x[3], img: spr(x[0])}));
const DATA = {pts, up: wk(W.up), down: wk(W.down), wk: W.a, teams: L.teams, tours: L.tournaments, games: L.games, champ: {player: T.player, event: T.event}, king: {img: spr('Kingambit'), u: row('Kingambit')[1], w: row('Kingambit')[2], r: R.Kingambit, d: W.up[0][3]}};
console.log(pts.filter(p => p.c).map(p => [p.n, p.u, p.w, p.r].join(' ')).join(' | '));
const html = fs.readFileSync(path.join(__dirname, 'mock.tpl.html'), 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('<!--LOGO-->', LOGO).replace('<!--LOGO2-->', LOGO.replace(/nphdr([DL])/g, 'nphdr$1x'));
const CSS = fs.readFileSync(path.join(__dirname, 'light.css'), 'utf8').replace(/^\uFEFF/, ''), NAME = LIGHT ? 'nastyplot-home-concept-light' : 'nastyplot-home-concept';
const page = !LIGHT ? html : html.replace(/rgba\(255,255,255,/g, 'rgba(22,20,26,').replace(/rgba\(243,240,235,/g, 'rgba(22,20,26,').replace(/#FF5CBE/g, '#E6359B').replace(/#4AAEF5/g, '#0078BF').replace(/stroke="#F3F0EB"/g, 'stroke="#16141A"').replace('</style>', CSS + '</style>');
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(path.join(OUT, 'mock.html'), page);
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright');
  const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: +(process.argv[4] || 2)})).newPage();
  pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + path.join(OUT, 'mock.html').replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
  console.log(await pg.evaluate(() => [document.fonts.check('900 20px Unbounded'), document.fonts.check('500 16px "Instrument Sans"'), document.documentElement.scrollHeight].join(' ')));
  await pg.screenshot({path: path.join(OUT, NAME + '.png'), fullPage: true}); await b.close();
})();




