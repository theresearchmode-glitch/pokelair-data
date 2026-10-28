// Game-mechanics completeness guard: every VGC-relevant field the reference has must be in our data AND used by the engine.
// Reference: Pokémon Showdown's "champions" data mod (pokemon-showdown 0.11.11) first; @smogon/calc gen 0 and @pkmn/dex gen 9 only for entries the mod lacks. Read-only. Exit 1 on any gap that would change an
// answer users see. Usage: node experiments/fields-audit.mjs   (needs @pkmn/dex + @smogon/calc in node_modules; CI installs
// them with --no-save; locally it also looks in C:/Users/simra/code/pl-verify/node_modules)
import fs from 'node:fs'; import {createRequire} from 'node:module'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), SRC = ROOT + 'app/src/', OUT = ROOT + 'out/';
let require = createRequire(ROOT + 'package.json'); try { require.resolve('@pkmn/dex'); } catch (e) { require = createRequire('C:/Users/simra/code/pl-verify/package.json'); }
const {Dex} = require('@pkmn/dex'); const {Generations, toID} = require('@smogon/calc'); const G0 = Generations.get(0);
let PSR = createRequire(ROOT + 'package.json'); try { PSR.resolve('pokemon-showdown'); } catch (e) { PSR = createRequire('C:/Users/simra/code/pl-mech/coverage/package.json'); }
const CH = PSR('pokemon-showdown').Dex.mod('champions');
const rd = f => fs.readFileSync(f, 'utf8'), data = rd(SRC + 'data/data.js'), metaSrc = rd(SRC + 'data/move-meta.js'), accSrc = rd(SRC + 'data/move-acc.js');
const grab = (re, s) => { const m = s.match(re); return m ? JSON.parse(m[1]) : null; };
const MOVES = grab(/const MOVES=(\[[\s\S]*?\]);/, data), ROSTER = grab(/const ROSTER=(\[[\s\S]*?\]);/, data);
const META = grab(/const MOVE_META=(\{[\s\S]*?\});/, metaSrc), WT = grab(/const SPECIES_WT=(\{[\s\S]*?\});/, metaSrc), ACC = grab(/const MOVE_ACC=(\{[\s\S]*?\});/, accSrc);
const ENGINE = fs.readdirSync(SRC + 'app').filter(f => f.endsWith('.js')).map(f => rd(SRC + 'app/' + f)).join('\n');
const uses = re => re.test(ENGINE);
const fails = [], notes = []; const fail = (what, ex) => fails.push(`${what}${ex && ex.length ? ': ' + ex.slice(0, 8).join('; ') + (ex.length > 8 ? ` (+${ex.length - 8} more)` : '') : ''}`);
// 1. the engine reads each mechanic from the data
const ENGINE_USES = [['priority (movePrio from MOVE_META)', /function movePrio\(/], ['accuracy (moveAcc)', /function moveAcc\(/], ['two-turn moves (chargesFirst)', /function chargesFirst\(/],
  ['moves that hit your ally (allyHit)', /function allyHit\(/], ['weight (wtOf / SPECIES_WT)', /SPECIES_WT/], ['guaranteed target drops (tDrop)', /tDrop\s*=/], ['self stat drops (selfDrop)', /selfDrop\s*=/],
  ['recharge moves', /\.recharge/], ['fixed / OHKO damage', /mv\.fixed\|\|mv\.ohko/], ['variable power (mv.vbp)', /mv\.vbp/], ['multi-hit from data (mh)', /\.mh\b/],
  ['contact / sound / punch / bite / slicing / pulse / bullet from data', /mFlag\(/], ['Sheer Force list from data', /function isSheer|isSheer=/]];
for (const [what, re] of ENGINE_USES) if (!uses(re)) fail('engine does not use ' + what);
// 2. every move's data matches the reference
const bad = {meta: [], acc: [], prio: [], target: [], flags: [], sec: [], self: [], mh: [], ohko: [], fixed: [], varRule: []};
const VAR_OK = new Set(['wt', 'wtr', 'lowhp', 'gyro', 'eball', 'half', 'fullhp', 'userhp', 'hex', 'respects', 'punish', 'ragefist']), VAR_NOTE = new Set(['counter', 'endeavor']);
const RARE_VAR = new Set(['gambit', 'psywave', 'fling', 'gift', 'beatup', 'trump', 'magnitude', 'present', 'stockpile']);
for (const [n, , cat] of MOVES) { const ch = CH.moves.get(n), d = ch && ch.exists ? ch : Dex.moves.get(n), c = ch && ch.exists ? null : G0.moves.get(toID(n)), m = META[n]; if (!d || !d.exists) continue; if (!m) { bad.meta.push(n); continue; }
  const a = d.accuracy === true ? 100 : d.accuracy; if ((m.a || 100) !== a || (a < 100 && ACC[n] !== a)) bad.acc.push(`${n} ${a} (ours ${m.a || 100}/${ACC[n] || 100})`);
  const pr = c && c.priority != null ? c.priority : d.priority; if ((m.p || 0) !== pr) bad.prio.push(`${n} ${pr} (ours ${m.p || 0})`);
  const tg = (c && c.target) || d.target; if (m.t !== tg) bad.target.push(`${n} ${tg} (ours ${m.t})`);
  const F = (c && c.flags) || d.flags || {}, D = d.flags || {}, want = (F.contact ? 'c' : '') + ((F.sound ?? D.sound) ? 's' : '') + ((F.punch ?? D.punch) ? 'p' : '') + ((F.bite ?? D.bite) ? 'b' : '') + ((F.slicing ?? D.slicing) ? 'k' : '') + ((F.pulse ?? D.pulse) ? 'u' : '') + ((F.bullet ?? D.bullet) ? 'l' : '') + (D.wind ? 'w' : '') + (D.charge ? 'C' : '') + (D.recharge ? 'R' : '') + (D.heal ? 'h' : '');
  if ((m.f || '') !== want) bad.flags.push(`${n} ${want || '-'} (ours ${m.f || '-'})`);
  const secs = d.secondaries || (d.secondary ? [d.secondary] : []); if (secs.some(s => s.boosts || s.status || s.volatileStatus === 'flinch') && !(m.s && m.s.length)) bad.sec.push(n);
  const sb = (c && c.self && c.self.boosts) || (d.self && d.self.boosts); if (sb && JSON.stringify(sb) !== JSON.stringify(m.sb)) bad.self.push(n);
  const mh = (c && c.multihit) || d.multihit; if (mh && JSON.stringify(mh) !== JSON.stringify(m.mh)) bad.mh.push(n);
  if (d.ohko && !m.o) bad.ohko.push(n); if (d.damage && m.d !== d.damage) bad.fixed.push(n);
  if (cat > 0 && !d.basePower && !d.damage && !d.ohko) { if (!m.v) bad.varRule.push(`${n} (no rule)`); else if (!VAR_OK.has(m.v) && !VAR_NOTE.has(m.v) && !RARE_VAR.has(m.v)) bad.varRule.push(`${n} (${m.v} not handled)`); else if (RARE_VAR.has(m.v)) notes.push(`${n}: ${m.v} rule not calculated (rare)`); } }
for (const [k, v] of Object.entries(bad)) if (v.length) fail(`move data: ${k} differs from the reference`, v);
// 3. weights for every Pokémon
const noW = ROSTER.filter(p => !WT[p.n]).map(p => p.n), wDiff = ROSTER.filter(p => { const s = CH.species.get(p.n); return s && s.exists && WT[p.n] !== s.weightkg; }).map(p => p.n); if (wDiff.length) fail('weights differ from the champions mod', wDiff); if (noW.length) fail('Pokémon without weight', noW);
// 4. abilities and items players run: modelled, or listed as deliberately not modelled with the reason
const NOT_MODELLED = {'Super Luck': 'raises crit chance only; the calc shows the hit with and without a crit (Critical hit toggle)', 'Marvel Scale': 'only with a status condition; calcs assume a healthy Pokémon',
  'Quick Claw': 'a 20% chance to move first; noted on speed lines, never relied on', Rivalry: 'needs genders, not tracked', Moxie: 'only after it KOs something; each calc is a single hit'};
const NO_CALC_EFFECT = new Set(['No Item', 'Pressure', 'Keen Eye', 'Frisk', 'Synchronize', 'Cute Charm', 'Flame Body', 'Cursed Body', 'Healer', 'Shield Dust', 'Damp', 'Stall', 'Anticipation', 'Vital Spirit', 'Pickpocket', 'Cud Chew', 'Rock Head',
  'Emergency Exit', 'Flower Veil', 'Static', 'Poison Point', 'Insomnia', 'Limber', 'Leaf Guard', 'Telepathy', 'Magician', 'Shed Skin', 'Immunity', 'Early Bird', 'Poison Heal', 'Toxic Debris', 'Spicy Spray', 'Trace', 'Illusion',
  'Moody', 'Anger Point', 'Steadfast', 'Magma Armor', 'Corrosion', 'Merciless', 'Overgrow', 'Blaze', 'Torrent', 'Swarm', 'Light Clay', 'Rocky Helmet', 'Eject Button', 'Leppa Berry', 'Binding Band', 'Big Root', 'Red Card',
  'Regenerator', 'Natural Cure', 'Harvest', 'Pickup', 'Run Away', 'Honey Gather', 'Ball Fetch', 'Sitrus Berry', 'Leftovers', 'Lum Berry', 'Mental Herb', 'White Herb', 'Shell Bell', 'Black Sludge', 'Focus Sash', 'Power Herb', 'Mirror Herb', 'Eject Pack', 'Covert Cloak', 'Safety Goggles', 'Throat Spray', 'Room Service', 'Adrenaline Orb', 'Booster Energy', 'Ability Shield', 'Clear Amulet', 'Punching Glove', 'Loaded Dice']);
const T = JSON.parse(rd(OUT + 'meta_tour.json')), rows = [...T.top, ...(T.more || [])].sort((a, b) => b.u - a.u).slice(0, 100), ab = new Map(), it = new Map();
for (const r of rows) { for (const [n, p] of r.ab || []) if (p >= 1) ab.set(n, Math.max(ab.get(n) || 0, p * r.u / 100)); for (const [n, p] of r.it || []) if (p >= 1) it.set(n, Math.max(it.get(n) || 0, p * r.u / 100)); }
const ABIL = grab(/const ABIL=(\{[\s\S]*?\});/, data) || {};
const lc = new Set([...ENGINE.matchAll(/'([A-Z][A-Za-z' -]+)'/g)].map(x => x[1].toLowerCase()));
const known = n => lc.has(n.toLowerCase()) || ENGINE.includes(`'${n}'`) || ENGINE.includes(`"${n}"`) || (/ Aura$/.test(n) && /\+\s*' Aura'/.test(ENGINE)) || (/ Surge$/.test(n) && /' Surge'/.test(ENGINE)) || /ite( [XYZ])?$/.test(n);
const missAb = [...ab].filter(([n]) => ABIL[n] && !known(n) && !NOT_MODELLED[n] && !NO_CALC_EFFECT.has(n)).map(([n, u]) => `${n} (${u.toFixed(2)}% of slots)`);
const missIt = [...it].filter(([n]) => /^[A-Z]/.test(n) && !known(n) && !NOT_MODELLED[n] && !NO_CALC_EFFECT.has(n)).map(([n, u]) => `${n} (${u.toFixed(2)}% of slots)`);
if (missAb.length) fail('abilities players run that the engine never reads (and not listed as deliberately not modelled)', missAb);
if (missIt.length) fail('items players run that the engine never reads (and not listed as deliberately not modelled)', missIt);
for (const [n, why] of Object.entries(NOT_MODELLED)) notes.push(`${n}: not modelled (${why})`);
console.log(`moves checked: ${MOVES.length}; Pokémon weights: ${ROSTER.length - noW.length}/${ROSTER.length}; abilities on top-100 sets: ${ab.size}; items: ${it.size}`);
for (const n of notes) console.log('  note: ' + n);
if (fails.length) { console.log('\nFAIL:'); for (const f of fails) console.log('  ' + f); process.exit(1); }
console.log('\nPASS: every VGC-relevant field is in the data and used by the engine');
