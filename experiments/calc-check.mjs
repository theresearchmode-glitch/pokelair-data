// Damage calc check: runs the built page's own damage() on thousands of random and targeted cases and compares every one
// of the 16 rolls with Smogon's damage calculator (@smogon/calc, Champions generation = gen 0: level 50, stat points).
// Mismatches are grouped by cause: each failing case is re-run with one input switched off at a time (ability, item,
// weather, ...); the input whose removal makes the two agree is the cause.
// Setup: npm install --no-save @smogon/calc  in %TEMP%\smogcalc (or set SMOGCALC to the folder holding node_modules).
// Usage: node experiments/calc-check.mjs [n random cases=3000] [--examples]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import {execFileSync} from 'node:child_process'; import {fileURLToPath} from 'node:url'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const SC = process.env.SMOGCALC || path.join(os.tmpdir(), 'smogcalc');
const {Generations, Pokemon, Move, Field, calculate} = (() => { try { return createRequire(path.join(SC, 'x.js'))('@smogon/calc'); } catch (e) { return createRequire(import.meta.url)('@smogon/calc'); } })();
const G0 = Generations.get(0), G9 = Generations.get(9);
const APP = fileURLToPath(new URL('../app/', import.meta.url)), OUT = APP + '../out/', NRAND = +(process.argv[2] || 3000), EXAMPLES = process.argv.includes('--examples');

const page = APP + 'verify-calc.html';
// OLD_CALC=path/to/an/older/39-damage-calc-speed.js checks that version instead (for a before/after match rate)
let html = fs.readFileSync(APP + 'dist/page.html', 'utf8');
if (process.env.OLD_CALC) { const cur = fs.readFileSync(APP + 'src/app/39-damage-calc-speed.js', 'utf8').trim(); if (!html.includes(cur)) throw new Error('calc source not found verbatim in page.html');
  html = html.replace(cur, () => fs.readFileSync(process.env.OLD_CALC, 'utf8').trim()); }
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + html.replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const browser = await chromium.launch(), pg = await (await browser.newContext()).newPage();
pg.on('pageerror', e => console.log('PAGE ERROR', e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false})})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(2500);
const DATA = await pg.evaluate(() => window.__ev(`({R:ROSTER.map(p=>({n:p.n,t:p.t,st:p.st,a:p.a,m:!!p.m})),M:MV.filter(m=>m.bp>0&&m.cat>0&&!m.ohko).map(m=>({name:m.name,type:m.type,cat:m.cat,bp:m.bp,vbp:m.vbp||'',fixed:m.fixed||0,sound:!!m.sound,spread:!!m.spread})),
  L:Object.fromEntries(Object.entries(LEARN).map(([k,v])=>[k,v.map(i=>MV[i]&&MV[i].name).filter(Boolean)])),items:CALC_ITEMS,multi:MULTI_HIT})`));
const byN = new Map(DATA.R.map(p => [p.n, p])), mvN = new Map(DATA.M.map(m => [m.name, m]));
const toID = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const ref = (g, n) => g.moves.get(toID(n));
// ---- data differences (reported, not counted as calc bugs) ----
const dataDiff = [];
for (const m of DATA.M) { const r = ref(G0, m.name); if (!r) { dataDiff.push(`move ${m.name}: not in Smogon's Champions move list`); continue; }
  const cat = {Physical: 1, Special: 2}[r.category], spread = ['allAdjacent', 'allAdjacentFoes'].includes(r.target);
  if (r.basePower !== m.bp && !m.vbp && !m.fixed && !['Weather Ball'].includes(m.name)) dataDiff.push(`move ${m.name}: power ${m.bp} vs Smogon ${r.basePower}`);
  if (r.type !== m.type) dataDiff.push(`move ${m.name}: type ${m.type} vs Smogon ${r.type}`);
  if (cat !== m.cat) dataDiff.push(`move ${m.name}: category ${m.cat} vs Smogon ${r.category}`);
  if (spread !== m.spread) dataDiff.push(`move ${m.name}: spread ${m.spread} vs Smogon target ${r.target}`);
  if (!!(r.flags && r.flags.sound) !== m.sound) dataDiff.push(`move ${m.name}: sound ${m.sound} vs Smogon ${!!(r.flags && r.flags.sound)}`); }
// --lists: print the move groups the page needs (contact, slicing, punch, ...) from Smogon's Champions move data
if (process.argv.includes('--lists')) {
  const grp = f => DATA.M.filter(m => { const r = ref(G0, m.name); return r && f(r, m); }).map(m => m.name).sort();
  const L2 = {NONCONTACT: grp((r, m) => m.cat === 1 && !r.flags.contact), CONTACT_SP: grp((r, m) => m.cat === 2 && r.flags.contact), SHARP: grp(r => r.flags.slicing), PUNCH: grp(r => r.flags.punch),
    BITE: grp(r => r.flags.bite), PULSE: grp(r => r.flags.pulse), BULLET: grp(r => r.flags.bullet), SHEER: grp(r => r.secondaries || r.name === 'Electro Shot'), PRIORITY: grp(r => r.priority > 0),
    RECOIL: grp(r => r.recoil || r.hasCrashDamage), SOUND: grp(r => r.flags.sound)};
  for (const [k, v] of Object.entries(L2)) console.log(`const ${k}=new Set(${JSON.stringify(v).replace(/","/g, "','").replace(/^\["/, "['").replace(/"\]$/, "']")});`);
  await browser.close(); process.exit(0); }
const SK = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
for (const p of DATA.R) { const s = G0.species.get(toID(p.n)); if (!s) { dataDiff.push(`species ${p.n}: not in Smogon's Champions dex`); continue; }
  const st = SK.map(k => s.baseStats[k]); if (st.join() !== p.st.join()) dataDiff.push(`species ${p.n}: stats ${p.st.join('/')} vs Smogon ${st.join('/')}`);
  if (s.types.join() !== p.t.join()) dataDiff.push(`species ${p.n}: types ${p.t.join('/')} vs Smogon ${s.types.join('/')}`); }
// ---- case generation ----
let seed = 12345; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const NATS = ['Hardy', 'Adamant', 'Jolly', 'Modest', 'Timid', 'Brave', 'Quiet', 'Bold', 'Impish', 'Calm', 'Careful', 'Relaxed', 'Sassy', 'Lonely', 'Naughty', 'Mild', 'Rash', 'Hasty', 'Naive', 'Gentle', 'Lax'];
const NOT_CHAMP_ITEMS = new Set(['Choice Band', 'Choice Specs', 'Assault Vest']);
const ITEMS = DATA.items.filter(x => x && !NOT_CHAMP_ITEMS.has(x));
const known = m => ref(G0, m.name);
const MOVES = DATA.M.filter(known);
const pts3 = () => { let a = [ri(0, 32), ri(0, 32), ri(0, 32)]; const s = a[0] + a[1] + a[2]; if (s > 66) a = a.map(x => Math.floor(x * 66 / s)); return a; };
function randCase(o = {}) {
  const ap = o.ap || pick(DATA.R), dp = o.dp || pick(DATA.R);
  const learn = (DATA.L[ap.n] || []).map(n => mvN.get(n)).filter(m => m && known(m));
  const mv = o.mv || (learn.length && rnd() < .75 ? pick(learn) : pick(MOVES));
  const [spA, spS, spDef] = pts3(), [hpSp, defSp, spdSp] = pts3();
  const c = {a: {n: ap.n, spA, spS, spDef, nat: pick(NATS), item: rnd() < .5 ? pick(ITEMS) : '', ability: pick(ap.a), boost: rnd() < .2 ? ri(-2, 2) : 0, burn: false},
    d: {n: dp.n, hpSp, defSp, spdSp, atkSp: Math.min(32, ri(0, 66 - hpSp - defSp - spdSp)), nat: pick(NATS), item: rnd() < .5 ? pick(ITEMS) : '', ability: pick(dp.a), boost: rnd() < .15 ? ri(-2, 2) : 0},
    mv: mv.name, spread: mv.spread && rnd() < .8, weather: rnd() < .25 ? pick(['sun', 'rain', 'sand', 'snow']) : '', terrain: rnd() < .2 ? pick(['grassy', 'electric', 'psychic', 'misty']) : '',
    crit: rnd() < .08, screen: rnd() < .08, hh: rnd() < .08, fg: rnd() < .05, fainted: 0, tag: o.tag || 'random'};
  if (c.a.ability === 'Supreme Overlord') c.fainted = ri(0, 5);
  return o.f ? (o.f(c), c) : c; }
const cases = [];
for (let i = 0; i < NRAND; i++) cases.push(randCase());
const flagMoves = f => MOVES.filter(m => { const r = ref(G0, m.name); return f(r, m); });
const withAb = ab => DATA.R.filter(p => p.a.includes(ab));
const T = (tag, n, o) => { for (let i = 0; i < n; i++) cases.push(randCase({...o, tag, ap: o.apL ? pick(o.apL) : o.ap, dp: o.dpL ? pick(o.dpL) : o.dp, mv: o.mvL ? pick(o.mvL) : o.mv})); };
// only abilities some Champions PokÃ©mon actually has
const notInRoster = new Set();
const atkAb = (ab, mvL) => { const L = withAb(ab); if (!L.length) { notInRoster.add(ab); return; } T('atk ' + ab, 120, {apL: L, mvL, f: c => { c.a.ability = ab; if (ab === 'Supreme Overlord') c.fainted = ri(1, 5); }}); };
atkAb('Tough Claws', flagMoves(r => r.flags.contact)); atkAb('Sharpness', flagMoves(r => r.flags.slicing)); atkAb('Iron Fist', flagMoves(r => r.flags.punch));
atkAb('Strong Jaw', flagMoves(r => r.flags.bite)); atkAb('Mega Launcher', flagMoves(r => r.flags.pulse)); atkAb('Punk Rock', flagMoves(r => r.flags.sound));
atkAb('Sheer Force', flagMoves(r => r.secondaries)); atkAb('Technician', flagMoves(r => r.basePower <= 60)); atkAb('Adaptability'); atkAb('Huge Power', flagMoves(r => r.category === 'Physical'));
atkAb('Supreme Overlord'); atkAb('Skill Link', flagMoves(r => Array.isArray(r.multihit))); atkAb('Liquid Voice', flagMoves(r => r.flags.sound));
for (const ab of ['Aerilate', 'Pixilate', 'Refrigerate', 'Galvanize', 'Dragonize']) atkAb(ab, flagMoves((r, m) => m.type === 'Normal'));
for (const ab of ['Mega Sol', 'Solar Power', 'Sand Force', 'Hustle', 'Guts', 'Mold Breaker', 'Unaware', 'Steelworker', 'Transistor', "Dragon's Maw", 'Rocky Payload', 'Water Bubble', 'Scrappy', 'Tinted Lens', 'Reckless', 'Analytic', 'Sniper', 'Protean', 'Piercing Drill']) atkAb(ab);
const defAb = ab => { const L = withAb(ab); if (!L.length) { notInRoster.add(ab); return; } T('def ' + ab, 100, {dpL: L, f: c => { c.d.ability = ab; }}); };
for (const ab of ['Multiscale', 'Fur Coat', 'Thick Fat', 'Heatproof', 'Water Bubble', 'Fluffy', 'Filter', 'Solid Rock', 'Ice Scales', 'Punk Rock', 'Dry Skin', 'Purifying Salt', 'Levitate', 'Unaware', 'Flash Fire', 'Water Absorb', 'Sap Sipper', 'Marvel Scale', 'Grass Pelt', 'Prism Armor', 'Shadow Shield', 'Friend Guard', 'Intimidate', 'Bulletproof', 'Soundproof', 'Armor Tail', 'Earth Eater'])
  defAb(ab);
for (const it of ITEMS) T('item ' + it, 50, {f: c => { if (rnd() < .5 || ['Focus Sash', 'Sitrus Berry', 'Leftovers'].includes(it) || /Berry/.test(it)) c.d.item = it; else c.a.item = it;
  if (/Berry/.test(it)) { const t = (G0.items.get(toID(it)) || {}).naturalGift; } }});
for (const [w, n] of [['sun', 150], ['rain', 150], ['sand', 100], ['snow', 100]]) T('weather ' + w, n, {f: c => { c.weather = w; }});
for (const t of ['grassy', 'electric', 'psychic', 'misty']) T('terrain ' + t, 120, {f: c => { c.terrain = t; }});
T('crit', 200, {f: c => { c.crit = true; }}); T('burn', 200, {mvL: flagMoves(r => r.category === 'Physical'), f: c => { c.a.burn = true; }});
T('screen', 200, {f: c => { c.screen = true; }}); T('helping hand', 100, {f: c => { c.hh = true; }}); T('friend guard', 100, {f: c => { c.fg = true; }});
T('spread', 300, {mvL: MOVES.filter(m => m.spread), f: c => { c.spread = true; }}); T('boosts', 300, {f: c => { c.a.boost = ri(-2, 2); c.d.boost = ri(-2, 2); }});
T('mega attacker', 200, {apL: DATA.R.filter(p => p.m)}); T('mega defender', 200, {dpL: DATA.R.filter(p => p.m)});
const SPECIAL_MOVES = ['Body Press', 'Foul Play', 'Psyshock', 'Weather Ball', 'Knock Off', 'Acrobatics', 'Facade', 'Triple Axel', 'Freeze-Dry', 'Flying Press', 'Thousand Arrows', 'Terrain Pulse', 'Expanding Force',
  'Rising Voltage', 'Solar Beam', 'Solar Blade', 'Hex', 'Eruption', 'Water Spout', 'Brick Break', 'Psychic Fangs', 'Raging Bull', 'Wicked Blow', 'Surging Strikes', 'Flower Trick', 'Storm Throw', 'Frost Breath',
  'Low Kick', 'Grass Knot', 'Heavy Slam', 'Stored Power', 'Fake Out', 'Population Bomb', 'Grav Apple', 'Misty Explosion', 'Payback', 'Venoshock', 'Lash Out', 'Last Respects', 'Rage Fist', 'Collision Course', 'Electro Drift',
  ...Object.keys(DATA.multi)];
for (const n of [...new Set(SPECIAL_MOVES)]) { const m = mvN.get(n); if (m && known(m)) T('move ' + n, 40, {mv: m, f: c => { c.spread = m.spread; }}); }
// Choice Band / Specs / Assault Vest aren't Champions items: checked against Smogon's Gen 9 calc instead (abilities off)
for (const it of NOT_CHAMP_ITEMS) T('gen9 item ' + it, 80, {mvL: MOVES.filter(m => ref(G9, m.name) && !ref(G9, m.name).secondaries && ref(G9, m.name).basePower === m.bp), f: c => { c.g9 = true; c.a.ability = c.d.ability = ''; c.terrain = ''; if (it === 'Assault Vest') c.d.item = it; else c.a.item = it; }});
// ---- reference (Smogon) ----
const stK = {Atk: 'atk', SpA: 'spa', Def: 'def', SpD: 'spd'};
function smog(c) {
  const g = c.g9 ? G9 : G0, mvP = mvN.get(c.mv), phys = mvP.cat === 1;
  const aStat = c.mv === 'Body Press' ? 'def' : phys ? 'atk' : 'spa', dStat = phys || ['Psyshock', 'Psystrike', 'Secret Sword'].includes(c.mv) ? 'def' : 'spd';
  const mk = (s, role) => { const p = byN.get(s.n); let name = p.n; if (!g.species.get(toID(name))) name = g.species.get(toID(p.n.replace(/-Mega.*$/, ''))) ? p.n.replace(/-Mega.*$/, '') : 'Mew';
    const evs = role === 'a' ? {atk: s.spA, spa: s.spS, def: s.spDef} : {hp: s.hpSp, def: s.defSp, spd: s.spdSp, atk: s.atkSp};
    const opts = {level: 50, nature: s.nat, ability: s.ability || '(none)', item: s.item || undefined, boosts: {[role === 'a' ? aStat : dStat]: s.boost || 0}, status: s.burn ? 'brn' : '',
      overrides: {types: p.t, baseStats: Object.fromEntries(SK.map((k, i) => [k, (role === 'a' && p.n === 'Aegislash' ? [60, 140, 50, 140, 50, 60] : p.st)[i]]))}};
    if (c.g9) { opts.evs = Object.fromEntries(Object.entries(evs).map(([k, v]) => [k, Math.min(252, v * 8)])); opts.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31}; } else opts.evs = evs;
    if (role === 'a' && c.fainted) opts.alliesFainted = c.fainted;
    // a Mega always holds its Mega Stone (the page leaves it out of the item slot); give Smogon a held item with no damage
    // effect so Acrobatics isn't doubled for a Mega attacker
    if (role === 'a' && p.m && !s.item) opts.item = 'Leftovers';
    return new Pokemon(g, name, opts); };
  const A = mk(c.a, 'a'), D = mk(c.d, 'd');
  const move = new Move(g, c.mv, {isCrit: !!c.crit, ability: A.ability, overrides: {...(mvP.vbp || mvP.fixed ? {} : {basePower: mvP.bp}), type: mvP.type, category: phys ? 'Physical' : 'Special', target: c.spread ? 'allAdjacentFoes' : 'normal'}});
  const W = {sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow'}[c.weather], TR = {grassy: 'Grassy', electric: 'Electric', psychic: 'Psychic', misty: 'Misty'}[c.terrain];
  const field = new Field({gameType: 'Doubles', weather: W, terrain: TR, attackerSide: {isHelpingHand: !!c.hh}, defenderSide: {isReflect: !!c.screen && phys, isLightScreen: !!c.screen && !phys, isFriendGuard: !!c.fg}});
  const r = calculate(g, A, D, move, field); let d = r.damage;
  if (typeof d === 'number') d = Array(16).fill(d); else if (Array.isArray(d[0])) d = d[0].map((_, i) => d.reduce((s, h) => s + h[i], 0));
  return {rolls: d, hp: D.maxHP()}; }
// ---- run both ----
const PAGE_FN = `(cases)=>cases.map(c=>{try{const mv=mvByName.get(c.mv);const ph=mv.cat===1;
  const A={p:byName.get(c.a.n),sp:ph?c.a.spA:c.a.spS,spA:c.a.spA,spS:c.a.spS,spDef:c.a.spDef,nat:c.a.nat,item:c.a.item,ability:c.a.ability,boost:c.a.boost,burn:c.a.burn};
  const D={p:byName.get(c.d.n),hpSp:c.d.hpSp,defSp:c.d.defSp,spdSp:c.d.spdSp,atkSp:c.d.atkSp,nat:c.d.nat,item:c.d.item,ability:c.d.ability,boost:c.d.boost};
  // Smogon's calc puts both Dragon Darts on the one target; the page's default is one dart per foe (doubles), so compare like for like
  const r=damage({atk:A,def:D,move:mv,spread:c.spread,weather:c.weather,terrain:c.terrain,screen:c.screen,hh:c.hh,fg:c.fg,crit:c.crit,fainted:c.fainted,dartsBoth:true});
  return r?{rolls:r.rolls.length===16?r.rolls:Array(16).fill(r.rolls[0]),hp:r.hp}:{rolls:Array(16).fill(0),hp:0}}catch(e){return {err:String(e)}}})`;
async function runAll(list) { const out = [];
  for (let i = 0; i < list.length; i += 500) out.push(...await pg.evaluate(([src, cs]) => window.__ev(src)(cs), [PAGE_FN, list.slice(i, i + 500)]));
  return list.map((c, i) => { let s; try { s = smog(c); } catch (e) { s = {err: String(e)}; }
    const p = out[i]; const match = !p.err && !s.err && p.rolls.join() === s.rolls.join();
    return {c, p, s, match}; }); }
const res = await runAll(cases);
// ---- group mismatches by cause ----
const FEATS = [['atk ability', c => { c.a.ability = ''; }, c => c.a.ability], ['def ability', c => { c.d.ability = ''; }, c => c.d.ability], ['atk item', c => { c.a.item = ''; }, c => c.a.item],
  ['def item', c => { c.d.item = ''; }, c => c.d.item], ['weather', c => { c.weather = ''; }, c => c.weather], ['terrain', c => { c.terrain = ''; }, c => c.terrain], ['crit', c => { c.crit = false; }, c => c.crit],
  ['burn', c => { c.a.burn = false; }, c => c.a.burn], ['screen', c => { c.screen = false; }, c => c.screen], ['helping hand', c => { c.hh = false; }, c => c.hh], ['friend guard', c => { c.fg = false; }, c => c.fg],
  ['spread', c => { c.spread = false; }, c => c.spread], ['atk boost', c => { c.a.boost = 0; }, c => c.a.boost], ['def boost', c => { c.d.boost = 0; }, c => c.d.boost], ['fainted', c => { c.fainted = 0; }, c => c.fainted]];
const bad = res.filter(r => !r.match), variants = [];
for (const r of bad) for (const [k, f, v] of FEATS) if (v(r.c)) { const c = structuredClone(r.c); f(c); variants.push({r, k, val: v(r.c), c}); }
const vres = await runAll(variants.map(v => v.c));
const groups = new Map(), add = (k, r) => { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); };
for (const r of bad) { if (r.p.err || r.s.err) { add('error: ' + (r.p.err ? 'page ' + r.p.err : 'smogon ' + r.s.err).slice(0, 90), r); continue; }
  const fixes = variants.map((v, i) => [v, vres[i]]).filter(([v, x]) => v.r === r && x.match).map(([v]) => `${v.k}=${v.val}`);
  add(fixes.length ? fixes.join(' | ') : 'move ' + r.c.mv, r); }
const pct = x => (100 * x).toFixed(2) + '%';
const fmt = r => { const c = r.c; return `${c.a.n} [${c.a.ability || '-'}|${c.a.item || '-'}|${c.a.nat} ${c.a.spA}/${c.a.spS}/${c.a.spDef}${c.a.boost ? ' ' + c.a.boost : ''}${c.a.burn ? ' brn' : ''}] ${c.mv}${c.spread ? ' (spread)' : ''} -> ${c.d.n} [${c.d.ability || '-'}|${c.d.item || '-'}|${c.d.nat} ${c.d.hpSp}/${c.d.defSp}/${c.d.spdSp}${c.d.boost ? ' ' + c.d.boost : ''}]${c.weather ? ' ' + c.weather : ''}${c.terrain ? ' ' + c.terrain : ''}${c.crit ? ' crit' : ''}${c.screen ? ' screen' : ''}${c.hh ? ' HH' : ''}${c.fg ? ' FG' : ''}${c.fainted ? ' fainted ' + c.fainted : ''}${c.g9 ? ' [gen9]' : ''}\n      page ${r.p.rolls ? r.p.rolls[0] + '-' + r.p.rolls[15] : r.p.err} / ${r.p.hp}   smogon ${r.s.rolls ? r.s.rolls[0] + '-' + r.s.rolls[15] : r.s.err} / ${r.s.hp}`; };
const nRand = res.filter(r => r.c.tag === 'random'), hpBad = res.filter(r => r.p.hp && r.s.hp && r.p.hp !== r.s.hp).length;
console.log(`cases: ${res.length} (${nRand.length} random, ${res.length - nRand.length} targeted)   exact 16-roll match: ${pct(res.filter(r => r.match).length / res.length)}   random only: ${pct(nRand.filter(r => r.match).length / nRand.length)}   HP mismatches: ${hpBad}`);
const within1 = bad.filter(r => r.p.rolls && r.s.rolls && r.p.rolls.every((x, i) => Math.abs(x - r.s.rolls[i]) <= 1)).length;
console.log(`mismatches: ${bad.length} (${within1} off by at most 1 HP per roll)\n`);
// known, explained differences: things the page can't know (turn order, gender) or doesn't model on purpose (rare mid-move changes)
const EXPLAINED = [[/Super Fang/, 'Super Fang: @smogon/calc\'s Champions data returns 0; the Showdown simulator takes half the target\'s HP (as the page does). Until Oct 28 the page also returned 0, which matched this reference and hid the bug'], [/Poltergeist/, 'Poltergeist into a Mega: a Mega always holds its Mega Stone, so the move hits; this harness gives Smogon no item for Megas, so Smogon says it fails'], [/Payback/, 'Payback doubles when the user moves last: Smogon decides from Speed, the page assumes it moves first'],
  [/Analytic/, 'Analytic boosts when moving last: Smogon decides from Speed, the page assumes it moves first'], [/Rivalry/, 'Rivalry depends on genders, which the page does not track'],
  [/Freeze-Dry/, 'Freeze-Dry has a 10% freeze chance (a secondary effect in the Showdown move data), so Sheer Force boosts it; the @smogon/calc Champions data leaves that secondary out'], [/(Grass Knot|Low Kick|Heavy Slam|Heat Crash) .*Stance Change/, 'Aegislash is missing from the Smogon Champions data, so its weight there is wrong'],[/Parental Bond.*Berry|Berry.*Parental Bond|Parental Bond \| def item=\w+ Berry/, 'Parental Bond with a resist berry: the berry is eaten by the first hit, the page leaves the second hit full; Smogon halves both'], [/def ability=Disguise/, 'Disguise: the page applies the game rule (the first hit only breaks the disguise for 1/8 HP); Smogon calc shows an ordinary hit'], [/Shell Side Arm/, 'Shell Side Arm turns physical when that hits harder (not modelled; rare)'], [/Forecast/, 'Castform changes type with the weather (not modelled)'],
  [/(Mold Breaker|Teravolt|Turboblaze).*friend guard=true|friend guard=true.*(Mold Breaker|Teravolt|Turboblaze)/, 'Mold Breaker ignores Friend Guard (Showdown marks it breakable; found by the simulator, Oct 28); @smogon/calc still applies it'],
  [/Weak Armor|Stamina|Seed Sower|Wandering Spirit/, 'ability that changes stats/terrain/abilities between hits of a multi-hit move (not modelled)']];
const why = (k, l) => (EXPLAINED.find(([re]) => re.test(k) || l.every(r => re.test(r.c.mv + ' ' + r.c.a.ability + ' ' + r.c.d.ability))) || [])[1];
const unexplained = bad.filter(r => { for (const [k, l] of groups) if (l.includes(r)) return !why(k, l); return true; }).length;
console.log(`unexplained mismatches: ${unexplained}\n`);
for (const [k, list] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${String(list.length).padStart(5)}  ${k}${why(k, list) ? '   [explained: ' + why(k, list) + ']' : ''}`); for (const r of list.slice(0, EXAMPLES ? 3 : 1)) console.log('      ' + fmt(r)); }
console.log(`\nabilities in the targeted lists that no Champions PokÃ©mon has (skipped): ${[...notInRoster].join(', ')}`);
console.log(`\ndata differences vs Smogon's Champions data (${dataDiff.length}):`); for (const d of dataDiff.slice(0, 80)) console.log('  ' + d);
fs.writeFileSync(path.join(os.tmpdir(), 'calc-check-mismatches.json'), JSON.stringify(bad.map(r => ({c: r.c, page: r.p, smogon: r.s})), null, 0));
await browser.close(); try { fs.unlinkSync(page); } catch (e) {}
// the rate counts explained differences (the page follows the game where Smogon's calc doesn't) as agreeing
{ const expl = new Set(); for (const [k, l] of groups) if (why(k, l)) for (const r of l) expl.add(r);
  const raw = res.filter(r => r.match).length / res.length; if (raw < .98) { console.log(`FAIL: raw exact match ${(100 * raw).toFixed(2)}% < 98%`); process.exit(1); }
  const rate = res.filter(r => r.match || expl.has(r)).length / res.length; console.log(`exact or explained: ${(100 * rate).toFixed(2)}%`); if (rate < .995) { console.log(`FAIL: exact or explained ${(100 * rate).toFixed(2)}% < 99.5%`); process.exit(1); } if (hpBad) { console.log(`FAIL: ${hpBad} HP mismatches`); process.exit(1); } }
