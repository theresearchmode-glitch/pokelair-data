// Generates app/src/data/move-meta.js (MOVE_META, SPECIES_WT) and app/src/data/move-acc.js (MOVE_ACC).
// SOURCE OF TRUTH: Pokémon Showdown's "champions" data mod with Reg M-C data, built from GitHub source pinned at commit
// 1242c1e2d9763ba5b85d33f13aecb89bae19ae3d (C:/Users/simra/code/pl-mech/sim). Not the npm release 0.11.11: it stops at Reg M-B and has
// outdated Z-Mega abilities. Filtered to our own Reg M-C move and Pokémon lists.
// Fallbacks, only where the mod lacks an entry: @smogon/calc gen 0, then @pkmn/dex gen 9 (each such case is printed).
// Values are never typed by hand; only the RULE each variable-power move follows is named (the data keeps callbacks as code).
// Run: node experiments/gen-move-meta.mjs [dir with pokemon-showdown] [dir with @smogon/calc + @pkmn/dex]
import fs from 'node:fs'; import {createRequire} from 'node:module'; import {fileURLToPath} from 'node:url';
const PS = createRequire((process.argv[2] || 'C:/Users/simra/code/pl-mech/sim/').replace(/\/?$/, '/') + 'x.js');
const REF = createRequire((process.argv[3] || 'C:/Users/simra/code/pl-verify/').replace(/\/?$/, '/') + 'x.js');
const {Dex: PSDex} = PS('pokemon-showdown'), CH = PSDex.mod('champions');
const {Dex} = REF('@pkmn/dex'); const {Generations, toID} = REF('@smogon/calc'); const G0 = Generations.get(0);
const APP = fileURLToPath(new URL('../app/src/', import.meta.url)), data = fs.readFileSync(APP + 'data/data.js', 'utf8');
const grab = re => JSON.parse(data.match(re)[1]);
const MOVES = grab(/const MOVES=(\[[\s\S]*?\]);/), ROSTER = grab(/const ROSTER=(\[[\s\S]*?\]);/);
// variable, fixed or conditional power: the rule each move uses (damage() applies it; "cond" moves keep their listed power
// and the calc says when they'd double)
const VAR = {'Low Kick': 'wt', 'Grass Knot': 'wt', 'Heavy Slam': 'wtr', 'Heat Crash': 'wtr', Flail: 'lowhp', Reversal: 'lowhp', 'Gyro Ball': 'gyro', 'Electro Ball': 'eball',
  'Super Fang': 'half', Ruination: 'half', "Nature's Madness": 'half', Endeavor: 'endeavor', Counter: 'counter', 'Mirror Coat': 'counter', 'Metal Burst': 'counter', Comeuppance: 'counter',
  'Final Gambit': 'gambit', Psywave: 'psywave', 'Crush Grip': 'fullhp', 'Wring Out': 'fullhp', 'Hard Press': 'fullhp', Eruption: 'userhp', 'Water Spout': 'userhp', 'Dragon Energy': 'userhp',
  Hex: 'hex', 'Last Respects': 'respects', Punishment: 'punish', 'Rage Fist': 'ragefist', 'Fling': 'fling', 'Natural Gift': 'gift', 'Beat Up': 'beatup', 'Trump Card': 'trump', Magnitude: 'magnitude', Present: 'present', 'Spit Up': 'stockpile',
  'Stomping Tantrum': 'cond', 'Temper Flare': 'cond', Payback: 'cond', Round: 'cond', Avalanche: 'cond', Revenge: 'cond', Retaliate: 'cond', 'Fishious Rend': 'cond', 'Bolt Beak': 'cond', Assurance: 'cond', 'Lash Out': 'cond', Facade: 'cond', Venoshock: 'cond', Brine: 'cond', 'Barb Barrage': 'cond', 'Infernal Parade': 'cond', 'Bitter Malice': 'cond', 'Stored Power': 'cond', 'Power Trip': 'cond', Acrobatics: 'cond', 'Weather Ball': 'cond', 'Terrain Pulse': 'cond', 'Rising Voltage': 'cond', 'Expanding Force': 'cond', 'Misty Explosion': 'cond', 'Knock Off': 'cond', 'Solar Beam': 'cond', 'Solar Blade': 'cond', 'Collision Course': 'cond', 'Electro Drift': 'cond', 'Grav Apple': 'cond', 'Psyblade': 'cond', 'Hydro Steam': 'cond', 'Poltergeist': 'cond', 'Triple Axel': 'multi', 'Water Shuriken': 'multi'};
const meta = {}, acc = {}, notes = [], fall = [];
const ref = n => { const c = CH.moves.get(n); if (c && c.exists) return {m: c, src: 'champions'}; const g = G0.moves.get(toID(n)); if (g) return {m: {...Dex.moves.get(n), ...g, flags: {...(Dex.moves.get(n).flags || {}), ...(g.flags || {})}}, src: 'calc'}; const d = Dex.moves.get(n); return d && d.exists ? {m: d, src: 'dex'} : null; };
const names = MOVES.map(r => r[0]); if (!names.includes("King's Shield")) names.push("King's Shield");
for (const n of names) { const R = ref(n); if (!R) { notes.push(n + ' (in no reference)'); continue; } const d = R.m; if (R.src !== 'champions') fall.push(`${n} (${R.src})`);
  const o = {}; if (d.priority) o.p = d.priority; o.t = d.target;
  const F = d.flags || {}; const fl = (F.contact ? 'c' : '') + (F.sound ? 's' : '') + (F.punch ? 'p' : '') + (F.bite ? 'b' : '') + (F.slicing ? 'k' : '') + (F.pulse ? 'u' : '') + (F.bullet ? 'l' : '') + (F.wind ? 'w' : '') + (F.charge ? 'C' : '') + (F.recharge ? 'R' : '') + (F.heal ? 'h' : ''); if (fl) o.f = fl;
  const a = d.accuracy === true ? 100 : d.accuracy; if (a < 100) { o.a = a; acc[n] = a; }
  const secs = d.secondaries || (d.secondary ? [d.secondary] : []);
  const S = secs.map(s => [s.chance || 100, s.boosts || 0, s.status || 0, s.volatileStatus === 'flinch' ? 1 : 0]).filter(s => s[1] || s[2] || s[3]); if (S.length) o.s = S;
  if (secs.length || d.hasSheerForce) o.sf = 1;
  const sb = d.self && d.self.boosts; if (sb) o.sb = sb;
  if (d.category === 'Status' && d.boosts && d.target !== 'self' && !['allySide', 'adjacentAlly'].includes(d.target)) o.tb = d.boosts;
  if (d.recoil) o.rc = d.recoil; if (d.mindBlownRecoil) o.rc = [1, 2];
  if (d.drain) o.dr = d.drain; if (d.multihit) o.mh = d.multihit;
  if (d.critRatio && d.critRatio > 1) o.cr = d.critRatio; if (d.willCrit) o.cr = 9;
  if (d.ohko) o.o = d.ohko === true ? 1 : d.ohko; if (d.damage) o.d = d.damage;
  if (VAR[n]) o.v = VAR[n]; else if (d.basePowerCallback && d.category !== 'Status') notes.push(`${n} (variable power, no rule)`);
  if (d.category !== 'Status' && !d.basePower && !o.d && !o.o && !o.v) notes.push(`${n} (0 power, no rule)`);
  if (d.flags && d.flags.protect === undefined && d.category !== 'Status') o.np = 1;
  meta[n] = o; }
const wt = {}; for (const p of ROSTER) { const c = CH.species.get(p.n), s = G0.species.get(toID(p.n)), ds = Dex.species.get(p.n);
  const w = (c && c.exists && c.weightkg) || (s && s.weightkg) || (ds && ds.exists ? ds.weightkg : null); if (!(c && c.exists)) fall.push(`${p.n} weight (${w ? 'fallback' : 'none'})`); if (w) wt[p.n] = w; else notes.push(p.n + ' (no weight)'); }
const head = `// Generated by experiments/gen-move-meta.mjs from Pokémon Showdown's "champions" data mod (GitHub build 1242c1e, Reg M-C). Do not edit by hand.\n`;
fs.writeFileSync(APP + 'data/move-meta.js', head + '// MOVE_META[name]: p priority, t target, f flags (c contact s sound p punch b bite k slicing u pulse l bullet w wind C charge R recharge h heal),\n' +
  '// a accuracy, s secondaries [chance, target boosts, status, flinch], sf has a secondary (Sheer Force), sb self boosts, tb status-move target boosts,\n// rc recoil, dr drain, mh hits, cr crit ratio, o OHKO, d fixed damage, v power rule, np hits through Protect\n' +
  'const MOVE_META=' + JSON.stringify(meta) + ';\n// SPECIES_WT[name]: weight in kg (Megas have their own); SPECIES_W is the same table under the name the coverage map reads\nconst SPECIES_WT=' + JSON.stringify(wt) + ';\nconst SPECIES_W=SPECIES_WT;\n');
fs.writeFileSync(APP + 'data/move-acc.js', head + '// Accuracy of every move under 100% (attacks and status). Moves not listed always hit.\nconst MOVE_ACC=' + JSON.stringify(acc) + ';\n');
console.log(`moves ${Object.keys(meta).length}, under 100% accuracy ${Object.keys(acc).length}, weights ${Object.keys(wt).length}/${ROSTER.length}`);
if (fall.length) console.log('not in the champions mod (fallback used):', fall.join('; '));
if (notes.length) console.log('notes:', notes.join('; '));
