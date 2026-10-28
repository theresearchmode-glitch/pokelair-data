// Threat preparation check (permanent; exits 1 on failure). Runs the page's own engine (55-threats.js) in the built page.
// 1) 42 one-on-one verdicts, each written from VGC knowledge before the engine existed, plus the damage behind each verdict
//    compared with Smogon's Champions calc (@smogon/calc gen 0): verdict must match and damage must agree within 1 point of %.
// 2) Support threats judged by their job (Trick Room, screens, redirection), not by "can you KO it".
// 3) Real teams: the user's team that once scored 97 shows its real gaps; regional #1/#2 teams score high readiness.
// Needs playwright and @smogon/calc (npm install --no-save --no-package-lock playwright@1.49.1 @smogon/calc@0.12.0).
// Usage: node experiments/threat-check.mjs
import fs from 'node:fs'; import {createRequire} from 'node:module';
const require = createRequire(import.meta.url), {chromium} = require('playwright'), SC = require('@smogon/calc'), {Generations, Pokemon, Move, Field, calculate} = SC, G0 = Generations.get(0);
const APP = new URL('../app/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = APP + '../out/', rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), DOCS = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
const page = APP + 'verify-threats.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext({viewport: {width: 1200, height: 900}})).newPage(); const errs = [];
pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})} : null}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(3500);
const ev = (c, a) => pg.evaluate(([c, a]) => window.__ev(`(${c})`)(a), [c, a]);
const n = x => typeof x === 'string' ? {n: x} : x;
const SNEAS_SEED = {n: 'Sneasler', item: 'Psychic Seed', ability: 'Unburden', nat: 'Adamant', sp: {hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32}, moves: ['Close Combat', 'Dire Claw', 'Protect', 'Fake Out']};
const HYD = {n: 'Hydreigon', item: 'Choice Scarf', ability: 'Levitate', nat: 'Modest', sp: {hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32}, moves: ['Dark Pulse', 'Draco Meteor', 'Earth Power', 'Snarl']};
const TORK = {n: 'Torkoal'}, FARI = {n: 'Farigiraf'};
// [member, threat, team (null = alone), expected kind, note]
const C = [
  ['Incineroar', 'Kingambit', null, 'solid+warn', 'Flare Blitz is SE and Kingambit hits Incineroar weakly; but Intimidate triggers Defiant'],
  ['Rillaboom', 'Charizard-Mega-Y', null, 'none', 'Zard OHKOs Rilla in its own sun, Rilla does little'],
  ['Charizard-Mega-Y', 'Rillaboom', null, 'solid', 'faster, sun Heat Wave/Weather Ball OHKOs'],
  ['Rillaboom', 'Basculegion', null, 'solid', 'Grassy Glide priority in its own terrain, SE'],
  ['Sneasler', 'Kingambit', null, 'solid', 'faster, Close Combat 4x'],
  ['Kingambit', 'Sneasler', null, 'none', 'Sneasler outspeeds and KOs; Kingambit has nothing SE'],
  ['Gholdengo', 'Floette-Mega', null, 'solid', 'Make It Rain SE, resists Fairy'],
  ['Floette-Mega', 'Gholdengo', null, 'none', 'Fairy resisted by Steel, Gholdengo hits it SE'],
  [{n: 'Archaludon'}, 'Pelipper', [{n: 'Archaludon'}, {n: 'Pelipper'}], 'solid', 'rain Electro Shot (no charge) 4x on Pelipper'],
  ['Farigiraf', 'Rillaboom', null, 'not-solid', 'no real answer: neutral both ways'],
  ['Sneasler', 'Incineroar', null, 'any', 'Close Combat SE but Incineroar is bulky; check numbers'],
  ['Charizard-Mega-Y', 'Incineroar', null, 'not-solid', 'Incineroar resists Fire; Zard is not an answer'],
  ['Garchomp', 'Raichu-Mega-Y', null, 'any', 'Earthquake SE; depends on speed and bulk'],
  ['Whimsicott', 'Kingambit', null, 'none', 'Fairy resisted, Whimsicott does nothing'],
  [TORK, 'Kingambit', [TORK, FARI, {n: 'Snorlax'}, {n: 'Incineroar'}], 'any', 'TR team: slow Torkoal moves first under TR'],
  ['Incineroar', 'Sneasler', null, 'soft', 'Sneasler wins with CC; Intimidate helps (Unburden does not block it)'],
  ['Primarina', 'Garchomp', null, 'any', 'Moonblast SE; Primarina bulky but slower'],
  ['Volcarona', 'Rillaboom', null, 'solid', 'Fire/Bug Heat Wave SE, faster, resists Grass'],
  ['Kingambit', 'Gholdengo', null, 'solid', 'Kowtow Cleave SE, Steel resists Make It Rain'],
  ['Gholdengo', 'Kingambit', null, 'none', 'Kingambit resists Steel and hits SE'],
  ['Pelipper', 'Charizard-Mega-Y', [{n: 'Pelipper'}], 'solid', 'your rain: Weather Ball/Hydro SE on Zard'],
  ['Basculegion', 'Charizard-Mega-Y', null, 'solid', 'Wave Crash SE, Adaptability; usually faster'],
  ['Charizard-Mega-Y', 'Kingambit', null, 'solid', 'sun Heat Wave 2x on Steel, Zard faster'],
  ['Kingambit', 'Charizard-Mega-Y', null, 'none', 'Zard faster and KOs with Fire'],
  ['Garchomp', 'Archaludon', null, 'any', 'Earthquake SE; Archaludon Draco back'],
  ['Rillaboom', 'Archaludon', null, 'answer', 'High Horsepower SE on Steel: Rillaboom wins the 1-on-1 but takes about half back (the original "none" expectation forgot High Horsepower)'],
  ['Archaludon', 'Rillaboom', null, 'any', 'resists Grass, hits neutral'],
  ['Farigiraf', 'Sneasler', null, 'solid', 'Psychic 4x on Poison/Fighting, Farigiraf resists Fighting'],
  ['Raichu-Mega-X', 'Pelipper', null, 'solid', 'Electric 4x on Water/Flying'],
  [HYD, 'Gholdengo', null, 'solid', 'Scarf, Dark Pulse/Earth Power SE'],
  [{n: 'Whimsicott', moves: ['Taunt', 'Tailwind', 'Moonblast', 'Encore']}, 'Gholdengo', null, 'none', 'Good as Gold blocks Taunt; Fairy resisted'],
  ['Sinistcha', 'Basculegion', null, 'any', 'Matcha Gotcha SE on Water'],
  ['Incineroar', 'Rillaboom', null, 'solid', 'Flare Blitz SE, resists Grass'],
  [TORK, 'Garchomp', [TORK], 'none', 'not a TR team: Torkoal is slower and weak to Ground'],
  ['Garchomp', 'Raichu-Mega-Y', [{n: 'Garchomp'}, {n: 'Whimsicott'}], 'any', 'with Tailwind Garchomp moves first'],
  [SNEAS_SEED, 'Raichu-Mega-Y', [SNEAS_SEED, {n: 'Indeedee-F'}], 'any', 'Psychic Surge partner pops the seed: Unburden 2x speed'],
  [SNEAS_SEED, 'Kingambit', [SNEAS_SEED, {n: 'Raichu-Mega-X'}], 'solid', 'no Psychic Terrain (seed dead) but Sneasler is faster anyway'],
  [HYD, 'Raichu-Mega-Y', null, 'any', 'user team: Scarf Hydreigon resists Psychic, Dark Pulse SE'],
  ['Venusaur', 'Basculegion', null, 'any', 'Grass SE on Water; Basculegion faster'],
  ['Arcanine-Hisui', 'Kingambit', null, 'any', 'Fighting-weak Rock/Fire; Intimidate vs Defiant'],
  ['Tyranitar-Mega', 'Charizard-Mega-Y', null, 'solid', 'Sand Stream overrides sun, Rock moves 4x'],
  ['Milotic', 'Charizard-Mega-Y', null, 'any', 'Water SE but sun halves Water when Zard sets it'],
];
const W = {sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow'}, T = {grassy: 'Grassy', electric: 'Electric', psychic: 'Psychic', misty: 'Misty'};
function smogon(aS, dS, mv, field) {
  try { const mk = s => new Pokemon(G0, s.n, {level: 50, nature: s.nat, evs: {hp: s.sp.hp, atk: s.sp.atk, def: s.sp.def, spa: s.sp.spa, spd: s.sp.spd, spe: s.sp.spe}, ability: s.ability, item: s.item || undefined});
    const r = calculate(G0, mk(aS), mk(dS), new Move(G0, mv), new Field({gameType: 'Doubles', weather: W[field.weather], terrain: T[field.terrain]}));
    const d = Array.isArray(r.damage) ? r.damage : [r.damage]; const hp = r.defender.maxHP(); return [+(100 * Math.min(...d) / hp).toFixed(1), +(100 * Math.max(...d) / hp).toFixed(1)]; }
  catch (e) { return null; } }
let pass = 0, nPass = 0, nCmp = 0; const lines = [], fails = [];
for (const [m, t, team, exp, note] of C) {
  const ms = n(m), ts = n(t), tm = team ? team.map(n) : null;
  const r = await ev(`(a) => THR.one(a[0], a[1], a[2])`, [ms, ts, tm]);
  const pr = await ev(`(a) => [THR.pair(a[0], a[1], a[2]), THR.pair(a[1], a[0], a[2])]`, [ms, ts, r.field]);
  let num = '', numOK = true;
  for (const [P, mv] of [[pr[0], r.o && (r.o.name || r.o.mv)], [pr[1], r.d && (r.d.name || r.d.mv)]]) { if (!mv) continue; const mine = P.out.find(x => x.mv === mv); const ref = smogon(P.a, P.d, mv, r.field); if (!ref) continue; nCmp++;
    const ok = Math.abs(ref[0] - mine.pct[0]) <= 1 && Math.abs(ref[1] - mine.pct[1]) <= 1; if (ok) nPass++; else numOK = false;
    num += ` | ${P.a.n} ${mv}: page ${mine.pct[0]}-${mine.pct[1]}% vs Smogon ${ref.join('-')}%`; }
  const got = r.kind, verdictOK = exp === 'any' || (exp === 'answer' && (got === 'solid' || got === 'soft')) || (exp === 'not-solid' ? got !== 'solid' : exp === 'solid+warn' ? got === 'solid' : got === exp);
  if (verdictOK && numOK) pass++; else fails.push(`${ms.n} vs ${ts.n}: expected ${exp}, got ${got}${numOK ? '' : ' (damage differs from Smogon)'}`);
  lines.push(`${verdictOK && numOK ? 'PASS' : 'FAIL'} ${ms.n} vs ${ts.n}: expected ${exp}, got ${got}${r.why ? ' (' + r.why + ')' : ''} [field ${r.field.weather || '-'}/${r.field.terrain || '-'}; speed ${r.sm} vs ${r.st}${r.first ? ', first ' + r.how : ''}; hits ${r.nM} vs ${r.nT}]${num}`);
}
// 1b) accuracy: a sub-85% move can't make a solid answer; No Guard and rain-Hurricane always hit
for (const [m, t, chk, note] of [
  [{n: 'Hydreigon', moves: ['Focus Blast']}, 'Kingambit', r => r.o && r.o.acc === 70 && r.kind !== 'solid', 'Focus Blast is 70%: never a solid answer'],
  [{n: 'Raichu-Mega-Y', moves: ['Focus Blast']}, 'Kingambit', r => r.o && r.o.acc === 100, 'No Guard: Focus Blast always hits'],
  [{n: 'Pelipper', ability: 'Drizzle', moves: ['Hurricane']}, 'Rillaboom', r => r.o && r.o.acc === 100, 'Hurricane always hits in rain']]) {
  const r = await ev(`(a) => THR.one(a[0], a[1], null)`, [n(m), n(t)]); const ok = !!chk(r);
  if (ok) pass++; else fails.push(`accuracy: ${note} (got ${r.kind}, ${r.o && r.o.mv})`); C.push(0);
  lines.push(`${ok ? 'PASS' : 'FAIL'} accuracy: ${note} (${r.kind}; ${r.o && r.o.mv})`); }
// 2) support threats, judged as a whole team
const BB = {n: 'Kingambit', moves: ['Kowtow Cleave', 'Sucker Punch', 'Brick Break', 'Protect']};
const S2 = [
  [[{n: 'Charizard-Mega-Y'}, BB, {n: 'Garchomp'}, {n: 'Whimsicott'}], 'Grimmsnarl', 'handled', 'Brick Break removes its screens'],
  [[{n: 'Charizard-Mega-Y'}, {n: 'Kingambit'}, {n: 'Garchomp'}, {n: 'Basculegion'}], 'Grimmsnarl', 'not-handled', 'no screen breaker, no Infiltrator'],
  [[{n: 'Whimsicott', moves: ['Taunt', 'Tailwind', 'Moonblast', 'Protect']}, {n: 'Charizard-Mega-Y'}, {n: 'Garchomp'}], 'Farigiraf', 'handled', 'Taunt stops its Trick Room (Armor Tail doesn\'t block Taunt)'],
  [[{n: 'Garchomp'}, {n: 'Basculegion'}, {n: 'Kingambit'}], 'Farigiraf', 'not-handled', 'no Taunt, no Trick Room of its own, nothing OHKOs it'],
  [[{n: 'Farigiraf'}, {n: 'Torkoal'}, {n: 'Snorlax'}, {n: 'Incineroar'}], 'Farigiraf', 'handled', 'a Trick Room team already plays under Trick Room'],
  [[{n: 'Charizard-Mega-Y'}, {n: 'Garchomp'}, {n: 'Kingambit'}], 'Indeedee-F', 'not-handled', 'spread attacks beat its Follow Me, but nothing stops its Trick Room'],
  [[{n: 'Charizard-Mega-Y'}, {n: 'Garchomp'}, {n: 'Kingambit', moves: ['Kowtow Cleave', 'Sucker Punch', 'Taunt', 'Protect']}], 'Indeedee-F', 'handled', 'spread attacks beat Follow Me and a normal-priority Taunt stops Trick Room'],
  [[{n: 'Charizard-Mega-Y'}, {n: 'Garchomp'}, {n: 'Whimsicott', moves: ['Taunt', 'Tailwind', 'Moonblast', 'Protect']}], 'Indeedee-F', 'not-handled', 'Prankster Taunt fails into Indeedee-F in its own Psychic Terrain'],
];
let p2 = 0; const l2 = [];
for (const [team, t, exp, note] of S2) { let r; try { r = await ev(`(a) => THR.teamVs(a[0], a[1])`, [team, {n: t}]); } catch (e) { r = {label: 'error: ' + e.message.slice(0, 80), level: -1}; }
  const ok = exp === 'handled' ? r.level >= 2 : r.level <= 1; if (ok) p2++; else fails.push(`support ${t} vs ${team.map(x => x.n).join('/')}: expected ${exp}, got ${r.label}`);
  l2.push(`${ok ? 'PASS' : 'FAIL'} ${t} vs ${team.map(x => x.n).join(', ')}: expected ${exp}, got ${r.label}${r.mode ? ' [judged by ' + r.mode.join(', ') + ']' : ''}${r.solid && r.solid.length ? ' — ' + r.solid[0] : r.soft && r.soft.length ? ' — ' + r.soft[0] : ''}  (${note})`); }
// 3) real teams
const USER = [
  {n: 'Raichu-Mega-X', item: 'Raichunite X', ability: 'Lightning Rod', nat: 'Jolly', sp: {hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32}, moves: ['Fake Out', 'Protect', 'Volt Tackle', 'Volt Switch']},
  SNEAS_SEED,
  {n: 'Primarina', item: 'Leftovers', ability: 'Liquid Voice', nat: 'Modest', sp: {hp: 32, atk: 0, def: 0, spa: 32, spd: 2, spe: 0}, moves: ['Hyper Voice', 'Protect', 'Moonblast', 'Calm Mind']},
  {n: 'Charizard-Mega-Y', item: 'Charizardite Y', ability: 'Blaze', nat: 'Timid', sp: {hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32}, moves: ['Heat Wave', 'Protect', 'Weather Ball', 'Solar Beam']},
  {n: 'Farigiraf', item: 'Sitrus Berry', ability: 'Armor Tail', nat: 'Bold', sp: {hp: 27, atk: 0, def: 20, spa: 0, spd: 19, spe: 0}, moves: ['Trick Room', 'Helping Hand', 'Psychic', 'Thunderbolt']}, HYD];
const OFF = rd('official.json'), REG = [];
for (const e of OFF.events) for (const t of e.teams) if (t.st <= 2 && REG.length < 10 && t.mons.length === 6) REG.push({who: `${t.player} #${t.st} · ${e.name}`, team: t.mons.map(m => ({n: m.n, item: m.i, ability: m.a, nat: m.nt, moves: m.mv}))});
const rep = async team => ev(`(a) => { const r = THR.report(a); return {score: r.score, un: r.rows.filter(x => x.level === 0).map(x => x.t.n), shaky: r.rows.filter(x => x.level === 1).map(x => x.t.n)} }`, team);
const user = await rep(USER), regs = []; for (const r of REG) { try { regs.push({who: r.who, ...(await rep(r.team))}); } catch (e) { regs.push({who: r.who, error: e.message.slice(0, 80)}); } }
const regScores = regs.filter(r => r.score != null).map(r => r.score).sort((a, b) => a - b), med = regScores[regScores.length >> 1];
if (!(user.un.length >= 2)) fails.push(`user team should show 2+ unanswered threats (got ${user.un.join(', ') || 'none'})`);
if (!(med >= 80)) fails.push(`regional #1/#2 median readiness should be 80+ (got ${med})`);
if (!(user.score < med)) fails.push(`user team (${user.score}) should be below the regional median (${med})`);
const report = [...lines, '', `one-on-one verdict+numbers pass: ${pass}/${C.length}; damage within 1% of Smogon: ${nPass}/${nCmp}`, '', ...l2, `support threats pass: ${p2}/${S2.length}`, '',
  `user team readiness ${user.score}%: unanswered ${user.un.join(', ') || '-'}; shaky ${user.shaky.join(', ') || '-'}`,
  ...regs.map(r => `${r.who}: ${r.error || r.score + '%' + (r.un.length ? ' (unanswered ' + r.un.join(', ') + ')' : '')}`), `regional #1/#2 median readiness: ${med}%`,
  ...(errs.length ? ['page errors: ' + errs.slice(0, 3).join(' | ')] : [])];
fs.writeFileSync(APP + '../threat-check.out.txt', report.join('\n') + '\n'); console.log(report.join('\n'));
await b.close(); fs.unlinkSync(page);
if (pass < C.length || p2 < S2.length || fails.length || errs.length) { console.log('\nFAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('\nPASS');
