// My Team drawn in the breathable style, from the real page content (sample team, Nov 8 data). Usage: node myteam.cjs <repo> <homeRenderDir> <outDir> <dsf> <light|dark>
const fs = require('fs'), path = require('path'), vm = require('vm'), {createRequire} = require('module');
const [REPO, SP, OUT] = process.argv.slice(2), DSF = +(process.argv[5] || 1.5), THEME = process.argv[6] || 'light';
const R = JSON.parse(fs.readFileSync(path.join(REPO, 'out/ratings_log.json'), 'utf8')).days.slice(-1)[0].r;
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const sb = {}; vm.createContext(sb); vm.runInContext(fs.readFileSync(path.join(REPO, 'app/src/data/logos.js'), 'utf8').replace(/\b(const|let)\s+NP_SVG/, 'NP_SVG'), sb);
const LG = sb.NP_SVG[THEME === 'dark' ? 'hdrD' : 'hdrL'];
const spr = n => 'data:image/png;base64,' + fs.readFileSync(path.join(SP, SPRITE_ID[n] + '.png')).toString('base64');
const disp = n => n.replace(/^(.*)-Mega(-[XYZ])?$/, (m, a, b) => 'Mega ' + a + (b ? ' ' + b.slice(1) : ''));
// Everything below is what the built My Team page shows for its sample team (read from the page on the Nov 8 data).
const team = [
  ['Garchomp', 'Lead', 'Life Orb', 'Rough Skin', ['Protect', 'Rock Slide', 'Dragon Claw', 'Earthquake'], 'Leads vs the meta\u2019s six'],
  ['Sneasler', 'Lead', 'White Herb', 'Unburden', ['Close Combat', 'Dire Claw', 'Protect', 'Fake Out'], ''],
  ['Charizard-Mega-Y', 'Back', 'Charizardite Y', 'Drought', ['Heat Wave', 'Protect', 'Weather Ball', 'Solar Beam'], 'Weather Ball OHKOs Rillaboom'],
  ['Whimsicott', 'Back', 'Focus Sash', 'Prankster', ['Tailwind', 'Moonblast', 'Encore', 'Protect'], ''],
  ['Basculegion', 'Bench', 'Choice Scarf', 'Adaptability', ['Last Respects', 'Wave Crash', 'Aqua Jet', 'Protect'], ''],
  ['Kingambit', 'Bench', 'Chople Berry', 'Defiant', ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Protect'], '']
].map(t => ({n: t[0], d: disp(t[0]), role: t[1], item: t[2], ab: t[3], mv: t[4], note: t[5], r: R[t[0]], img: spr(t[0])}));
const threats = [['Rillaboom', 'Handled'], ['Sneasler', 'Well handled'], ['Incineroar', 'Well handled'], ['Kingambit', 'Well handled'], ['Charizard-Mega-Y', 'Well handled'], ['Raichu-Mega-Y', 'Well handled'], ['Gholdengo', 'Well handled'], ['Garchomp', 'Well handled'], ['Archaludon', 'Shaky'], ['Basculegion', 'Well handled']]
  .map(t => ({n: t[0], d: disp(t[0]), s: t[1], img: spr(t[0])}));
const DATA = {team, threats, name: 'Sun Tailwind', letter: 'A', score: 99, ready: 83, handled: 22, shaky: 8, legal: '7/7', all: {un: 0, sh: 8, ha: 9, wh: 13},
  sel: {types: ['Dragon', 'Ground'], tier: 'S tier', nature: 'Adamant', pts: '32 Atk, 32 Spe, 2 HP', mvT: ['Normal', 'Rock', 'Dragon', 'Ground']}};
const NAME = 'nastyplot-myteam-concept' + (THEME === 'dark' ? '-dark' : '');
const html = fs.readFileSync(path.join(__dirname, 'myteam.tpl.html'), 'utf8').replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';').replace('<html lang="en">', '<html lang="en" data-theme="' + THEME + '">').replace('%LOGO%', LG).replace('%LOGO2%', LG.replace(/nphdr([DL])/g, 'nphdr$1x'));
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  fs.mkdirSync(OUT, {recursive: true}); const f = path.join(OUT, NAME + '.html'); fs.writeFileSync(f, html);
  const pg = await (await b.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: DSF})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 20000}).catch(() => console.log('NOT READY'));
  console.log(NAME, await pg.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
  await pg.screenshot({path: path.join(OUT, NAME + '.png'), fullPage: true}); await b.close();
})();
