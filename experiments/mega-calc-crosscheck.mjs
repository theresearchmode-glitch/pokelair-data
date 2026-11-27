// Mega Evolution damage calc cross-check against @smogon/calc (Champions gen 0: level 50, stat points).
// Tests EVERY Mega in ROSTER x 5 common moves x 3 fields (clear, sun+grassy, rain+psychic+spread).
// Groups every mismatch by cause via single-feature ablation and exits 1 on any unexplained mismatch.
// Usage: node experiments/mega-calc-crosscheck.mjs [--examples]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const SC = process.env.SMOGCALC || path.join(os.tmpdir(), 'smogcalc');
const {Generations, Pokemon, Move, Field, calculate} = (() => {
  try { return createRequire(path.join(SC, 'x.js'))('@smogon/calc'); }
  catch (e) { return require('@smogon/calc'); }
})();
const G0 = Generations.get(0);
const APP = fileURLToPath(new URL('../app/', import.meta.url));
const EXAMPLES = process.argv.includes('--examples');

const pagePath = APP + 'verify-mega-calc.html';
const html = fs.readFileSync(APP + 'dist/page.html', 'utf8');
fs.writeFileSync(pagePath, '<!doctype html><meta charset="utf-8">' +
  html.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));

const browser = await chromium.launch();
const pg = await (await browser.newContext()).newPage();
await pg.addInitScript(() => {
  window.claude = {use: async () => ({doc: () => ({onSnapshot: cb => { setTimeout(() => cb({exists: false}), 5); return () => {}; }, get: async () => ({exists: false})})})};
});
await pg.goto('file://' + pagePath);
await pg.waitForTimeout(1800);

const DATA = await pg.evaluate(() => window.__ev(`({
  R: ROSTER.map(p => ({n: p.n, t: p.t, st: p.st, a: p.a, m: !!p.m})),
  M: MV.filter(m => m.bp > 0 && m.cat > 0 && !m.ohko).map(m => ({name: m.name, type: m.type, cat: m.cat, bp: m.bp, vbp: m.vbp || '', fixed: m.fixed || 0, sound: !!m.sound, spread: !!m.spread})),
  L: Object.fromEntries(Object.entries(LEARN).map(([k, v]) => [k, v.map(i => MV[i] && MV[i].name).filter(Boolean)]))
})`));

const byN = new Map(DATA.R.map(p => [p.n, p]));
const mvN = new Map(DATA.M.map(m => [m.name, m]));
const toID = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const ref = n => G0.moves.get(toID(n));
const SK = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

// 5 common VGC/weather moves (fallback/pad when a Mega has fewer than 5 standard damaging moves in LEARN)
const COMMON_POOL = ['Weather Ball', 'Solar Beam', 'Earthquake', 'Dazzling Gleam', 'Flamethrower', 'Hydro Steam', 'Rock Slide', 'Hyper Voice'];
const FIELDS = [
  {name: 'clear', weather: '', terrain: '', spread: false},
  {name: 'sun+grassy', weather: 'sun', terrain: 'grassy', spread: false},
  {name: 'rain+psychic+spread', weather: 'rain', terrain: 'psychic', spread: true},
];
const DEF = byN.get('Incineroar') || DATA.R.find(p => !p.m);
const MEGAS = DATA.R.filter(p => p.m);
const SPECIAL_SKIP = new Set(['Fling', 'Beat Up', 'Final Gambit']);

const cases = [];
for (const mega of MEGAS) {
  const learned = (DATA.L[mega.n] || [])
    .map(n => mvN.get(n))
    .filter(m => m && ref(m.name) && !SPECIAL_SKIP.has(m.name));
  const picked = [];
  const seen = new Set();
  for (const m of learned) {
    if (picked.length >= 5) break;
    if (!seen.has(m.name)) { seen.add(m.name); picked.push(m); }
  }
  for (const n of COMMON_POOL) {
    if (picked.length >= 5) break;
    const m = mvN.get(n);
    if (m && ref(m.name) && !seen.has(m.name)) { seen.add(m.name); picked.push(m); }
  }
  const ab = mega.a[0] || '';
  for (const mv of picked) {
    for (const f of FIELDS) {
      cases.push({
        a: {n: mega.n, spA: 32, spS: 32, spDef: 0, nat: 'Hardy', item: '', ability: ab, boost: 0, burn: false},
        d: {n: DEF.n, hpSp: 32, defSp: 0, spdSp: 0, atkSp: 0, nat: 'Hardy', item: '', ability: DEF.a[0] || '', boost: 0},
        mv: mv.name,
        spread: f.spread && mv.spread,
        weather: f.weather,
        terrain: f.terrain,
        fieldName: f.name,
      });
    }
  }
}

function smog(c) {
  const mvP = mvN.get(c.mv);
  const phys = mvP.cat === 1;
  const mk = (s, role) => {
    const p = byN.get(s.n);
    let name = p.n;
    if (!G0.species.get(toID(name))) name = G0.species.get(toID(p.n.replace(/-Mega.*$/, ''))) ? p.n.replace(/-Mega.*$/, '') : 'Mew';
    const evs = role === 'a' ? {atk: s.spA, spa: s.spS, def: s.spDef} : {hp: s.hpSp, def: s.defSp, spd: s.spdSp, atk: s.atkSp};
    const opts = {
      level: 50, nature: s.nat, ability: s.ability || '(none)',
      item: role === 'a' && p.m && !s.item ? 'Leftovers' : (s.item || undefined),
      evs,
      overrides: {types: p.t, baseStats: Object.fromEntries(SK.map((k, i) => [k, p.st[i]]))},
    };
    return new Pokemon(G0, name, opts);
  };
  const A = mk(c.a, 'a'), D = mk(c.d, 'd');
  const move = new Move(G0, c.mv, {
    ability: A.ability,
    overrides: {...(mvP.vbp || mvP.fixed ? {} : {basePower: mvP.bp}), type: mvP.type, category: phys ? 'Physical' : 'Special', target: c.spread ? 'allAdjacentFoes' : 'normal'},
  });
  const W = {sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow'}[c.weather];
  const TR = {grassy: 'Grassy', electric: 'Electric', psychic: 'Psychic', misty: 'Misty'}[c.terrain];
  const field = new Field({gameType: 'Doubles', weather: W, terrain: TR});
  const r = calculate(G0, A, D, move, field);
  let d = r.damage;
  if (typeof d === 'number') d = Array(16).fill(d);
  else if (Array.isArray(d[0])) d = d[0].map((_, i) => d.reduce((s, h) => s + h[i], 0));
  return {rolls: d, hp: D.maxHP()};
}

const PAGE_FN = `(cases) => cases.map(c => {
  try {
    const mv = mvByName.get(c.mv), ph = mv.cat === 1;
    const A = {p: byName.get(c.a.n), sp: ph ? c.a.spA : c.a.spS, spA: c.a.spA, spS: c.a.spS, spDef: c.a.spDef, nat: c.a.nat, item: c.a.item, ability: c.a.ability, boost: c.a.boost, burn: c.a.burn};
    const D = {p: byName.get(c.d.n), hpSp: c.d.hpSp, defSp: c.d.defSp, spdSp: c.d.spdSp, atkSp: c.d.atkSp, nat: c.d.nat, item: c.d.item, ability: c.d.ability, boost: c.d.boost};
    const r = damage({atk: A, def: D, move: mv, spread: c.spread, weather: c.weather, terrain: c.terrain, dartsBoth: true});
    return r ? {rolls: r.rolls.length === 16 ? r.rolls : Array(16).fill(r.rolls[0]), hp: r.hp} : {rolls: Array(16).fill(0), hp: 0};
  } catch (e) { return {err: String(e)}; }
})`;

async function runAll(list) {
  const out = [];
  for (let i = 0; i < list.length; i += 400) {
    out.push(...await pg.evaluate(([src, cs]) => window.__ev(src)(cs), [PAGE_FN, list.slice(i, i + 400)]));
  }
  return list.map((c, i) => {
    let s; try { s = smog(c); } catch (e) { s = {err: String(e)}; }
    const p = out[i];
    const match = !p.err && !s.err && p.rolls.join() === s.rolls.join();
    return {c, p, s, match};
  });
}

const res = await runAll(cases);
const bad = res.filter(r => !r.match);

const FEATS = [
  ['atk ability', c => { c.a.ability = ''; }, c => c.a.ability],
  ['def ability', c => { c.d.ability = ''; }, c => c.d.ability],
  ['weather', c => { c.weather = ''; }, c => c.weather],
  ['terrain', c => { c.terrain = ''; }, c => c.terrain],
  ['spread', c => { c.spread = false; }, c => c.spread],
];
const variants = [];
for (const r of bad) for (const [k, f, v] of FEATS) if (v(r.c)) { const c = structuredClone(r.c); f(c); variants.push({r, k, val: v(r.c), c}); }
const vres = await runAll(variants.map(v => v.c));

const groups = new Map();
const add = (k, r) => { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); };
for (const r of bad) {
  if (r.p.err || r.s.err) { add('error: ' + (r.p.err || r.s.err).slice(0, 90), r); continue; }
  const fixes = variants.map((v, i) => [v, vres[i]]).filter(([v, x]) => v.r === r && x.match).map(([v]) => `${v.k}=${v.val}`);
  add(fixes.length ? fixes.join(' | ') : 'move ' + r.c.mv, r);
}

const EXPLAINED = [
  [/Super Fang/, 'Super Fang: @smogon/calc Champions returns 0; page halves target HP (Showdown simulator)'],
  [/Payback/, 'Payback: Smogon decides turn order from Speed; page assumes moving first'],
  [/Freeze-Dry/, 'Freeze-Dry: 10% freeze secondary missing in @smogon/calc Champions data (Sheer Force)'],
  [/Shell Side Arm/, 'Shell Side Arm: adaptive physical/special split not modelled'],
];
const why = (k, l) => (EXPLAINED.find(([re]) => re.test(k) || l.every(r => re.test(r.c.mv + ' ' + r.c.a.ability))) || [])[1];

console.log(`mega-calc-crosscheck: ${MEGAS.length} Megas x 5 moves x ${FIELDS.length} fields = ${res.length} cases`);
console.log(`exact 16-roll match: ${res.filter(r => r.match).length}/${res.length} (${(100 * res.filter(r => r.match).length / Math.max(1, res.length)).toFixed(2)}%)`);
let unexplained = 0;
for (const [k, list] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
  const ex = why(k, list);
  if (!ex) unexplained += list.length;
  console.log(`${String(list.length).padStart(4)}  ${k}${ex ? '  [explained: ' + ex + ']' : ''}`);
  for (const r of list.slice(0, EXAMPLES ? 3 : 1)) {
    console.log(`      ${r.c.a.n} [${r.c.a.ability}] ${r.c.mv} (${r.c.fieldName}) -> page ${r.p.rolls ? r.p.rolls[0] + '-' + r.p.rolls[15] : r.p.err} vs smogon ${r.s.rolls ? r.s.rolls[0] + '-' + r.s.rolls[15] : r.s.err}`);
  }
}

await browser.close();
try { fs.unlinkSync(pagePath); } catch (e) {}
if (unexplained > 0) {
  console.log(`FAIL: ${unexplained} unexplained Mega calc mismatch(es)`);
  process.exit(1);
}
console.log('PASS: 0 unexplained Mega calc mismatches');
