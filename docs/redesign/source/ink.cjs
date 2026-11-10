// "Colour is earned" homepage concept from NastyPlot's real data. Usage: node ink.cjs <repo> <outDir> <dsf>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const REPO = process.argv[2], OUT = process.argv[3], DSF = +(process.argv[4] || 2);
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, L = rd('limitless.json'), W = rd('weekly.json'), mons = L.results.mons;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const spr = n => 'data:image/webp;base64,' + fs.readFileSync(path.join(REPO, 'app/sp', SPRITE_ID[n] + '.webp')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : ''));
const mon = n => ({n, d: disp(n), r: R[n] || 0, u: +(mons[n][0] / L.teams * 100).toFixed(1), img: spr(n)});
// the list: the eight highest-rated Pokemon among the 16 most used
const top16 = Object.keys(mons).sort((a, b) => mons[b][0] - mons[a][0]).slice(0, 16), list = top16.sort((a, b) => R[b] - R[a]).slice(0, 8).map(mon);
const DATA = {list, picked: ['Sneasler', 'Kingambit', 'Charizard-Mega-Y'], hover: 'Rillaboom', up: W.up.slice(0, 4).map(x => [disp(x[0]), x[3]]), down: W.down.slice(0, 3).map(x => [disp(x[0]), x[3]]), teams: L.teams, tours: L.tournaments, games: L.games};
console.log(list.map(m => m.n + ' ' + m.r).join(', '));
const html = fs.readFileSync(path.join(__dirname, 'ink.tpl.html'), 'utf8').replace('%LOGO%', sb.NP_SVG.hdrD).replace('%LOGO2%', sb.NP_SVG.hdrD.replace(/nphdrD/g, 'nphdrDx')).replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';');
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, 'ink.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
  console.log(await pg.evaluate(() => [document.fonts.check('900 20px Unbounded'), document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
  await pg.screenshot({path: path.join(OUT, 'nastyplot-home-concept-ink.png'), fullPage: true}); await b.close();
})();
