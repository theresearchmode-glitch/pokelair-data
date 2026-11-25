// Info sheet concept (Garchomp), desktop and iPhone, from the real sheet's content on the built page (Nov 8 data). Usage: node sheet.cjs <repo> <homeRenderDir> <outDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const [REPO, SP, OUT] = process.argv.slice(2);
const helpers = fs.readFileSync(path.join(REPO, 'app/src/app/15-visual-helpers.js'), 'utf8');
const SPRITE_ID = JSON.parse(helpers.slice(helpers.indexOf('{', helpers.indexOf('SPRITE_ID =')), helpers.indexOf('}', helpers.indexOf('SPRITE_ID =')) + 1));
const png = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
// Every value below is what today's info sheet shows for Garchomp.
const DATA = {d: 'Garchomp', t: ['Dragon', 'Ground'], r: 92, tier: 'S tier', rank: 6, of: 322, use: 13, win: 53.1, games: '8,878', spe: 231, img: png(path.join(SP, SPRITE_ID.Garchomp + '.png')),
  usual: ['Choice Scarf, Adamant, 32 Atk, 32 Spe, 2 HP', 'Protect, Rock Slide, Dragon Claw, Earthquake'],
  stats: [['HP', 108], ['Attack', 130], ['Defense', 95], ['Sp. Atk', 80], ['Sp. Def', 85], ['Speed', 102]], total: 600,
  types: [['4× weak', ['Ice'], 'w'], ['2× weak', ['Dragon', 'Fairy'], 'w'], ['Resists ½', ['Fire', 'Poison', 'Rock'], 'r'], ['Immune', ['Electric'], 'i']],
  speed: [['What players run', 231, '32 Speed points, Adamant (most common spread), Choice Scarf', 98, 'outspeeds 98% of the top 30'], ['No Speed points', 122, 'neutral nature', 43, 'outspeeds 43% of the top 30'],
    ['Max Speed points', 154, '32 points, neutral nature', 62, 'outspeeds 62% of the top 30'], ['Max + Speed nature', 169, '32 points, Speed-boosting nature (Timid, Jolly…)', 70, 'outspeeds 70% of the top 30'],
    ['Choice Scarf', 253, 'max + Speed nature', 100, 'outspeeds 100% of the top 30'], ['In Tailwind', 338, 'max + Speed nature, Speed doubled', 100, 'outspeeds 100% of the top 30'],
    ['Trick Room build', 109, '0 points, Speed-lowering nature', 63, 'moves before 63% of the top 30 under Trick Room']],
  abil: [['Rough Skin', 'Most used, 98%', 'Pokémon making contact with this Pokémon lose 1/8 of their max HP.'], ['Sand Veil', '2.3%', 'If Sandstorm is active, this Pokémon\u2019s evasiveness is 1.25×; immunity to Sandstorm.']]};
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  for (const [mode, vw, dsf, behind] of [['desk', 1440, 1.5, 'nastyplot-myteam-concept.png'], ['mob', 390, 2.5, 'nastyplot-myteam-iphone-first-screen.png']]) {
    const html = fs.readFileSync(path.join(__dirname, 'sheet.tpl.html'), 'utf8').replace('%MODE%', mode).replace('%BEHIND%', png(path.join(OUT, behind))).replace('/*DATA*/', 'const D=' + JSON.stringify(DATA) + ';');
    const f = path.join(OUT, 'sheet-' + mode + '.html'); fs.writeFileSync(f, html);
    const pg = await (await b.newContext({viewport: {width: vw, height: 900}, deviceScaleFactor: dsf})).newPage(); pg.on('pageerror', e => console.log('ERR', e.message));
    await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.evaluate(() => document.fonts.ready); await pg.waitForFunction(() => document.body.dataset.ready, null, {timeout: 20000}).catch(() => console.log('NOT READY'));
    console.log(mode, await pg.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(' ')));
    await pg.screenshot({path: path.join(OUT, 'nastyplot-infosheet-' + (mode === 'desk' ? 'desktop' : 'iphone') + '.png'), fullPage: true}); await pg.close();
  }
  await b.close();
})();
