// Regression tests for Job 16 Champions mechanics & data fixes (S7: every case fails on 0fbfbe78, passes after patch).
// Runs against the built page (app/dist/page.html) via Playwright by default (same way experiments/calc-check.mjs loads it),
// or directly against source files with --src (pure Node vm, no Playwright needed).
// Usage: node experiments/rules-fixes-test.mjs [--src]
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const APP = ROOT + 'app/';
const USE_SRC = process.argv.includes('--src') || !fs.existsSync(APP + 'dist/page.html');

const ADDED_CALC_ITEMS = [
  'Muscle Band', 'Wise Glasses', 'Normal Gem', 'Light Ball',
  'Electric Seed', 'Grassy Seed', 'Psychic Seed', 'Misty Seed',
  'Air Balloon', 'Iron Ball', 'Scope Lens', 'Leek',
  'Wide Lens', 'Zoom Lens', 'Bright Powder', 'Rocky Helmet',
  'Focus Band', "King's Rock",
];

// Code evaluated inside the page (or vm context) that runs all 8 checks and returns {results: [{name, ok, detail}]}
const PROBE_EXPR = `(() => {
  const results = [];
  const check = (name, fn) => {
    try {
      const msg = fn();
      results.push({name, ok: !msg, detail: msg || 'ok'});
    } catch (e) {
      results.push({name, ok: false, detail: 'THREW: ' + (e && e.message || e)});
    }
  };

  // 1. Meowstic-F in ROSTER, LEARN, and paste
  check('1a. ROSTER has Meowstic-F with Competitive and base stats without shifting indices', () => {
    const mf = ROSTER.find(p => p.n === 'Meowstic-F');
    if (!mf) return 'Meowstic-F missing from ROSTER';
    if (ROSTER.indexOf(mf) !== ROSTER.length - 1) return 'Meowstic-F not appended at end (index ' + ROSTER.indexOf(mf) + ' of ' + ROSTER.length + ')';
    if (mf.t.join('/') !== 'Psychic') return 'wrong type: ' + mf.t.join('/');
    if (mf.a.join(',') !== 'Keen Eye,Infiltrator,Competitive') return 'wrong abilities: ' + mf.a.join(',');
    if (mf.st.join('/') !== '74/48/76/83/81/104') return 'wrong stats: ' + mf.st.join('/');
    if (mf.b !== 'Meowstic' || mf.m !== 0) return 'wrong base/mega flags';
  });
  check('1b. LEARN has Meowstic-F (56 moves matching Female Champions learnset)', () => {
    const l = LEARN['Meowstic-F'];
    if (!Array.isArray(l)) return 'LEARN["Meowstic-F"] missing';
    if (l.length !== 56) return 'expected 56 moves, got ' + l.length;
    const names = new Set(l.map(i => (typeof MV !== 'undefined' && MV[i] ? MV[i].name : MOVES[i][0])));
    for (const req of ['Extrasensory', 'Future Sight']) if (!names.has(req)) return 'missing Female move: ' + req;
    for (const ban of ['Imprison', 'Mean Look', 'Misty Terrain', 'Quick Guard', 'Wish']) if (names.has(ban)) return 'has Male-only move: ' + ban;
  });
  check('1c. speciesFromPaste resolves Meowstic-F and Meowstic-Female to Meowstic-F', () => {
    const a = speciesFromPaste('Meowstic-F');
    const b = speciesFromPaste('Meowstic-Female');
    if (!a || a.n !== 'Meowstic-F') return 'Meowstic-F resolved to ' + (a && a.n);
    if (!b || b.n !== 'Meowstic-F') return 'Meowstic-Female resolved to ' + (b && b.n);
  });

  // 2. Mega Sol: chargesFirst + moveAcc
  check('2a. Mega Sol Solar Beam & Solar Blade do not charge first in clear/rain', () => {
    const sb = {name: 'Solar Beam', charge: true, bp: 120, cat: 2, type: 'Grass'};
    const sbl = {name: 'Solar Blade', charge: true, bp: 125, cat: 1, type: 'Grass'};
    if (chargesFirst(sb, '', '', 'Mega Sol') !== false) return 'Solar Beam still charges for Mega Sol';
    if (chargesFirst(sbl, 'rain', '', 'Mega Sol') !== false) return 'Solar Blade still charges in rain for Mega Sol';
    if (chargesFirst(sb, '', '', 'Overgrow') !== true) return 'Solar Beam stopped charging for Overgrow';
  });
  check('2b. Mega Sol: Thunder/Hurricane as in sun; Sand Veil, Snow Cloak and Blizzard follow field weather (Showdown)', () => {
    const ep = {name: 'Earth Power', acc: 100, cat: 2};
    const th = {name: 'Thunder', acc: 70, cat: 2};
    const hu = {name: 'Hurricane', acc: 70, cat: 2};
    const bl = {name: 'Blizzard', acc: 70, cat: 2};
    const a1 = moveAcc(ep, 'Mega Sol', 'sand', {ability: 'Sand Veil'});
    const a2 = moveAcc(ep, 'Mega Sol', 'snow', {ability: 'Snow Cloak'});
    const a3 = moveAcc(th, 'Mega Sol', '', {});
    const a4 = moveAcc(hu, 'Mega Sol', 'rain', {});
    const a5 = moveAcc(bl, 'Mega Sol', 'snow', {});
    /* Scout's review (Nov 24), Showdown data/abilities.ts sandveil/snowcloak check FIELD weather: Mega Sol does not cancel them */
    if (a1 !== 80) return 'vs Sand Veil in sand: expected 80, got ' + a1;
    if (a2 !== 80) return 'vs Snow Cloak in snow: expected 80, got ' + a2;
    if (a3 !== 50) return 'Thunder in clear: expected 50, got ' + a3;
    if (a4 !== 50) return 'Hurricane in rain: expected 50, got ' + a4;
    /* Showdown blizzard: field weather snow = never misses, whoever uses it */
    if (a5 !== 100) return 'Blizzard in snow: expected 100, got ' + a5;
  });

  // 3. Eelevate & Iron Ball grounding in allyHit
  check('3. allyHit: Eelevate immune to Ground; Iron Ball grounds Flying/Levitate/Eelevate/Air Balloon', () => {
    const eq = {name: 'Earthquake', type: 'Ground', ally: true};
    const hEel = allyHit(eq, {p: {t: ['Electric']}, ability: 'Eelevate', item: 'Eelektrossite'});
    const hEelIron = allyHit(eq, {p: {t: ['Electric']}, ability: 'Eelevate', item: 'Iron Ball'});
    const hFlyIron = allyHit(eq, {p: {t: ['Fire', 'Flying']}, ability: 'Gale Wings', item: 'Iron Ball'});
    const hLevIron = allyHit(eq, {p: {t: ['Dragon', 'Ground']}, ability: 'Levitate', item: 'Iron Ball'});
    const hBal = allyHit(eq, {p: {t: ['Steel', 'Ghost']}, ability: 'Good as Gold', item: 'Air Balloon'});
    if (hEel !== false) return 'Eelevate partner hit by ally EQ';
    if (hEelIron !== true) return 'Eelevate + Iron Ball partner not hit by ally EQ';
    if (hFlyIron !== true) return 'Flying + Iron Ball partner not hit by ally EQ';
    if (hLevIron !== true) return 'Levitate + Iron Ball partner not hit by ally EQ';
    if (hBal !== false) return 'Air Balloon partner hit by ally EQ';
  });

  // 4. Iron Ball speed rounding order
  check('4. Iron Ball applied in spdCalc 4096 chain after stat stages (not pre-halved)', () => {
    const sStage = spdCalc(103, false, '', '', {up: true, iron: true});
    if (sStage !== 77) return 'base 103 +1 stage + Iron Ball: expected 77, got ' + sStage;
    const sTw = spdCalc(103, false, '', '', {tw: true, iron: true});
    if (sTw !== 103) return 'base 103 + Tailwind + Iron Ball: expected 103, got ' + sTw;
    const fakeMon = {n: '__Test103', st: [80, 80, 80, 80, 80, 83], a: ['Swift Swim']};
    const ls = likelySpeed(fakeMon, {item: 'Iron Ball', spread: {nat: 'Hardy', hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, mine: true}});
    /* Scout's review: v stays halved for direct readers (Battle, Compare...); v0 is the unhalved stat spdCalc callers use with iron */
    if (ls.v !== 51 || ls.v0 !== 103 || ls.iron !== true) return 'likelySpeed: expected v 51 (halved), v0 103, iron true: ' + JSON.stringify(ls);
    if (typeof speedMul === 'function') {
      const ds = dcSpeed({p: fakeMon, item: 'Iron Ball', ability: 'Swift Swim'}, 'rain');
      if (ds !== 135) return 'dcSpeed 135 (32 SP) Swift Swim in rain + Iron Ball: expected 135, got ' + ds;
    }
  });

  // 5. data.js ABIL text
  check('5. data.js ABIL updated for Healer, Unseen Fist, Run Away (Flash Fire, Stalwart from Dec 2)', () => {
    if (ABIL['Healer'] !== "Each turn, 50% chance to cure an adjacent ally's status.") return 'Healer text: ' + ABIL['Healer'];
    if (ABIL['Unseen Fist'] !== 'Contact moves hit through protection, for 1/4 of their damage.') return 'Unseen Fist text: ' + ABIL['Unseen Fist'];
    if (ABIL['Run Away'] !== "This Pokémon can always switch out: moves and Abilities that trap don't hold it.") return 'Run Away text: ' + ABIL['Run Away'];
    /* HH, Nov 24: Flash Fire and Stalwart change with the Dec 2 patch; until then the old text stays live. On/after Dec 2 (UTC) these two lines must have the new text. */
    if (Date.now() >= Date.parse('2026-12-02T01:59:00Z')) { if (!/Fire Boost/.test(ABIL['Flash Fire']) || !/Mega Evolves/.test(ABIL['Flash Fire'])) return 'Flash Fire text: ' + ABIL['Flash Fire'];
    if (!/substitutes/i.test(ABIL['Stalwart'])) return 'Stalwart text: ' + ABIL['Stalwart']; }
  });

  // 6. CALC_ITEMS has the 18 legal Champions items, all in REGMC_ITEMS
  check('6. CALC_ITEMS contains all 18 legal Champions battle items and zero illegal items', () => {
    const req = ${JSON.stringify(ADDED_CALC_ITEMS)};
    const miss = req.filter(x => !CALC_ITEMS.includes(x));
    if (miss.length) return 'missing from CALC_ITEMS: ' + miss.join(', ');
    if (typeof REGMC_ITEMS !== 'undefined') {
      const reg = new Set(REGMC_ITEMS);
      const illegal = CALC_ITEMS.filter(x => x && !reg.has(x));
      if (illegal.length) return 'illegal items in CALC_ITEMS: ' + illegal.join(', ');
    }
  });

  // 8. Neutral natures in team links map to Hardy while NATURES stays unchanged
  check('8. Hand-edited team links with Docile/Serious/Bashful/Quirky map to Hardy (NATURES unchanged)', () => {
    for (const bad of ['Docile', 'Serious', 'Bashful', 'Quirky']) {
      if (NATURES.includes(bad)) return 'NATURES should NOT include ' + bad;
    }
    const neutrals = ['Docile', 'Serious', 'Bashful', 'Quirky'];
    const payload = {
      v: 1,
      f: 'doubles',
      s: [
        ['Garchomp', '', 0, '', 'Docile:0/32/0/0/0/32'],
        ['Incineroar', '', 0, '', 'Serious:a'],
        ['Rillaboom', '', 0, '', 'Bashful:32/32/0/0/0/2'],
        ['Gholdengo', '', 0, '', 'Quirky:a'],
      ],
    };
    const code = tlB64(JSON.stringify(payload));
    const dec = decodeTeam('#team=' + code);
    if (!dec || dec.slots.length !== 4) return 'decodeTeam failed';
    for (let i = 0; i < 4; i++) {
      const nat = dec.slots[i].sp && dec.slots[i].sp.doubles && dec.slots[i].sp.doubles.nat;
      if (nat !== 'Hardy') return 'decodeTeam slot ' + i + ' (' + neutrals[i] + ') -> ' + nat;
    }
    const normed = normSlots([
      {n: 'Garchomp', sp: {doubles: {nat: 'Docile', v: [0, 32, 0, 0, 0, 32]}}},
      {n: 'Incineroar', sp: {doubles: {nat: 'Serious', assumed: true}}},
      {n: 'Rillaboom', sp: {doubles: {nat: 'Bashful', v: [32, 32, 0, 0, 0, 2]}}},
      {n: 'Gholdengo', sp: {doubles: {nat: 'Quirky', assumed: true}}},
    ]);
    for (let i = 0; i < 4; i++) {
      const nat = normed[i].sp && normed[i].sp.doubles && normed[i].sp.doubles.nat;
      if (nat !== 'Hardy') return 'normSlots slot ' + i + ' (' + neutrals[i] + ') -> ' + nat;
    }
  });

  return results;
})()`;

async function runPlaywright() {
  const {chromium} = createRequire(import.meta.url)('playwright');
  const page = APP + 'verify-rules-fixes.html';
  const html = fs.readFileSync(APP + 'dist/page.html', 'utf8');
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + html.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const browser = await chromium.launch();
  try {
    const pg = await (await browser.newContext()).newPage();
    await pg.addInitScript(() => {
      window.claude = {use: async () => ({doc: () => ({onSnapshot: cb => { setTimeout(() => cb({exists: false}), 5); return () => {}; }, get: async () => ({exists: false})})})};
    });
    await pg.goto('file://' + page);
    await pg.waitForTimeout(1500);
    return await pg.evaluate(expr => window.__ev(expr), PROBE_EXPR);
  } finally {
    await browser.close();
    if (fs.existsSync(page)) fs.unlinkSync(page);
  }
}

function runSourceVm() {
  const sandbox = {
    window: {},
    document: {addEventListener() {}, getElementById() { return null; }, createElement() { return {}; }},
    location: {hostname: 'localhost', protocol: 'http:', origin: 'http://localhost', pathname: '/', hash: '', search: ''},
    history: {replaceState() {}},
    LS: {get: (_, d) => d, set() {}},
    S: {slots: [], opp: [], teams: [], log: [], box: []},
    META: {doubles: null, doubles_ingame: null, doubles_tour: null, singles: null, teams: [], history: []},
    TextEncoder, TextDecoder, btoa, atob, console, setTimeout: () => 0, clearTimeout: () => {},
    builtinOk: () => true,
    cleanMeta: x => x, cleanTeams: x => x, cleanHistory: x => x,
    fixTeams() {},
    blank: () => ({n: '', a: null, lock: false}),
    esc: s => String(s),
    EFF: {
      Ground: {Normal: 1, Fire: 2, Water: 1, Electric: 2, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 2, Ground: 1, Flying: 0, Psychic: 1, Bug: 0.5, Rock: 2, Ghost: 1, Dragon: 1, Dark: 1, Steel: 2, Fairy: 1},
    },
    speedMul: (ab, w) => (ab === 'Swift Swim' && w === 'rain') || (ab === 'Chlorophyll' && w === 'sun') || (ab === 'Sand Rush' && w === 'sand') || (ab === 'Slush Rush' && w === 'snow') ? 2 : 1,
    members: () => [],
    setFor: () => ({na: [], it: [], ab: [], mv: []}),
    ownKey: p => p.b || p.n,
    itemPool: () => [],
    keepUndo() {}, render() {}, setView() {}, toast() {},
  };
  vm.createContext(sandbox);
  const files = [
    'app/src/data/data.js',
    'app/src/data/items-list.js',
  ];
  let bundle = files.map(f => fs.readFileSync(ROOT + f, 'utf8')).join('\n');
  bundle += `
const byName = new Map(ROSTER.map(p => [p.n, p]));
const MV = MOVES.map(m => ({name: m[0], type: m[1], cat: m[2], bp: m[3]}));
const mvByName = new Map(MV.map(m => [m.name, m]));
`;
  for (const f of [
    'app/src/app/02-set-data.js',
    'app/src/app/19-showdown-paste.js',
    'app/src/app/39-damage-calc-speed.js',
    'app/src/app/45-team-links.js',
  ]) {
    bundle += '\n' + fs.readFileSync(ROOT + f, 'utf8');
  }
  return vm.runInContext(bundle + '\n;' + PROBE_EXPR, sandbox);
}

const results = USE_SRC ? runSourceVm() : await runPlaywright();
let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : ' — ' + r.detail}`);
  if (!r.ok) failed++;
}
console.log(`\n${results.length - failed}/${results.length} passed (${USE_SRC ? 'source vm' : 'dist/page.html'})`);
assert.equal(failed, 0, `${failed} check(s) failed`);
