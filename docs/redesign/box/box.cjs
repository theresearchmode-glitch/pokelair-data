// My Box concept: the redesign style crossed with an in-game Pokemon box. Uses the site's own sample box (36 Pokemon). Usage: node box.cjs <repo> <homeRenderDir> <outDir> <dsf>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const [REPO, SP, OUT] = process.argv.slice(2), DSF = +(process.argv[5] || 1.5);
const rd = f => JSON.parse(fs.readFileSync(path.join(REPO, 'out', f), 'utf8'));
const R = rd('ratings_log.json').days.slice(-1)[0].r, L = rd('limitless.json'), mons = L.results.mons;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8'), dataJs = fs.readFileSync(path.join(REPO, 'app/src/data/data.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const LG = sb.NP_SVG.hdrL, spr = n => 'data:image/png;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.png')).toString('base64');
const info = n => { const i = dataJs.indexOf('{"n":"' + n + '",'), s = dataJs.slice(i, i + 400); return {t: JSON.parse(s.match(/"t":(\[[^\]]+\])/)[1]), sp: +s.match(/"sp":(\d+)/)[1]}; };
// the box the built page starts with (S.box), in the page's A-Z order
const BOX = ['Rotom-Wash', 'Glimmora', 'Tyranitar', 'Absol', 'Incineroar', 'Corviknight', 'Archaludon', 'Blastoise', 'Staraptor', 'Rillaboom', 'Pelipper', 'Meowscarada', 'Sylveon', 'Primarina', 'Salamence', 'Lucario', 'Hydreigon', 'Gardevoir', 'Kingambit', 'Dragonite', 'Mimikyu', 'Dragalge', 'Serperior', 'Swampert', 'Tinkaton', 'Greninja', 'Empoleon', 'Drampa', 'Whimsicott', 'Steelix', 'Azumarill', 'Gengar', 'Charizard', 'Basculegion', 'Garchomp', 'Sneasler'];
const disp = n => n === 'Rotom-Wash' ? 'Wash Rotom' : n, TEAM = [['Garchomp', 'Lead'], ['Sneasler', 'Lead'], ['Charizard', 'Back'], ['Whimsicott', 'Back'], ['Basculegion', 'Bench'], ['Kingambit', 'Bench']];
const box = BOX.map(n => ({n, d: disp(n), r: R[n] || 0, team: TEAM.some(t => t[0] === n), img: spr(n), ...(n === 'Garchomp' ? {...info(n), u: +(mons[n][0] / L.teams * 100).toFixed(1), w: +(mons[n][1] * 100).toFixed(1), tier: R[n] >= 90 ? 'S tier' : R[n] >= 80 ? 'A tier' : 'B tier'} : {})})).sort((a, b) => a.d.localeCompare(b.d));
const DATA = {box, sel: 'Garchomp', team: TEAM.map(t => ({d: t[0] === 'Charizard' ? 'Mega Charizard Y' : t[0], role: t[1], img: spr(t[0] === 'Charizard' ? 'Charizard-Mega-Y' : t[0])}))};
console.log(box.slice(0, 30).map(m => m.d).join(', '), '| sel', JSON.stringify({r: box.find(m => m.n === 'Garchomp').r, tier: box.find(m => m.n === 'Garchomp').tier}));
const html = fs.readFileSync(path.join(__dirname, 'box.tpl.html'), 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('%LOGO%', LG).replace('%LOGO2%', LG.replace(/nphdrL/g, 'nphdrLx'));
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, 'box.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 20000}).catch(() => console.log('NOT READY'));
  console.log(await pg.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
  await pg.screenshot({path: path.join(OUT, 'nastyplot-mybox-concept.png'), fullPage: true}); await b.close();
})();
