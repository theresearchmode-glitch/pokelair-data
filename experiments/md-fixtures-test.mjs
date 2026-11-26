// Reg M-D fixture validation + current-model Strength Score test (Job 56).
// Usage: node experiments/md-fixtures-test.mjs [path/to/md-teams.json]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {deckBasics} from '../team-basics.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const require = createRequire(import.meta.url);
const {Dex, TeamValidator} = require('pokemon-showdown');

const fixturePath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, 'experiments/fixtures/md-teams.json');

const id = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

// Load main's regulation profile, Reg M-C legal list, ROSTER, items, and current model
const regData = JSON.parse(fs.readFileSync(path.join(ROOT, 'regulation.json'), 'utf8'));
const regMD = regData.regs['M-D'];
const mcLegalBases = new Set(
  fs.readFileSync(path.join(ROOT, 'experiments/regmc-legal.txt'), 'utf8')
    .split(/\r?\n/).filter(Boolean).map(id)
);
const rosterCtx = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'app/src/data/data.js'), 'utf8') + ';this.ROSTER=ROSTER;', rosterCtx);
const rosterByName = new Map(rosterCtx.ROSTER.map(r => [r.n, r]));
const mcItems = new Set(
  fs.readFileSync(path.join(ROOT, 'data/regmc-items.txt'), 'utf8')
    .split(/\r?\n/).filter(Boolean).map(s => s.trim())
);
const model = JSON.parse(fs.readFileSync(path.join(ROOT, 'out/model.json'), 'utf8'));

// Announced Reg M-D additions from regulation.json
const mdNewBase = new Set((regMD.announced?.new || []).map(id));
const mdNewMegas = new Set((regMD.announced?.newMegas || []).map(id));
const mdMegaAbilities = regMD.announced?.megaAbilities || {};
const mdExtraStones = new Set(['Heatranite', 'Tatsugirinite']);
const legalMDItems = new Set([...mcItems, ...mdExtraStones]);

// Official Dec 2, 2026 balance patch move additions (news.pokemon-home.com/en/page/877.html)
const DEC2_MOVES = new Map([
  ...[
    'Alakazam', 'Alakazam-Mega', 'Starmie', 'Starmie-Mega', 'Mr. Mime', 'Mawile', 'Mawile-Mega',
    'Altaria', 'Altaria-Mega', 'Castform', 'Castform-Sunny', 'Castform-Rainy', 'Castform-Snowy',
    'Absol', 'Absol-Mega', 'Absol-Mega-Z', 'Roserade', 'Weavile',
    'Rotom', 'Rotom-Heat', 'Rotom-Wash', 'Rotom-Frost', 'Rotom-Fan', 'Rotom-Mow',
    'Liepard', 'Musharna', 'Audino', 'Audino-Mega', 'Cofagrigus', 'Slurpuff',
    'Drampa', 'Drampa-Mega', 'Annihilape',
  ].map(mon => [`${id(mon)}:psychup`, {mon, move: 'Psych Up'}]),
  ['hydreigon:roost', {mon: 'Hydreigon', move: 'Roost'}],
  ['beedrill:roost', {mon: 'Beedrill', move: 'Roost'}],
  ['beedrillmega:roost', {mon: 'Beedrill-Mega', move: 'Roost'}],
  ['emboar:slackoff', {mon: 'Emboar', move: 'Slack Off'}],
  ['emboarmega:slackoff', {mon: 'Emboar-Mega', move: 'Slack Off'}],
]);

const C = Dex.mod('champions');
const validatorMC = new TeamValidator('gen9championsvgc2026regmc');

const SP_MIN = regMD.rules?.points?.[0] ?? 0;
const SP_MAX = regMD.rules?.points?.[1] ?? 32;
const SP_TOTAL = 66;

const baseOf = name => {
  const sp = C.species.get(name);
  if (sp && sp.exists) return sp.baseSpecies;
  return String(name || '').replace(/-(Alola|Galar|Hisui|Paldea.*|Mega.*|F|M|Wash|Heat|Mow|Frost|Fan)$/, '');
};

const isLegalMDSpecies = name => {
  const spId = id(name);
  const bId = id(baseOf(name));
  if (mdNewBase.has(bId) || mdNewMegas.has(spId)) return true;
  if (rosterByName.has(name) && mcLegalBases.has(bId)) return true;
  return false;
};

const hasLearnsetMove = (species, moveName) => {
  const mvId = id(moveName);
  const spKey = id(species.name);
  if (DEC2_MOVES.has(`${spKey}:${mvId}`)) return true;
  const chain = [species.id];
  if (species.changesFrom && id(species.changesFrom) !== species.id) chain.push(id(species.changesFrom));
  if (species.baseSpecies && id(species.baseSpecies) !== species.id) chain.push(id(species.baseSpecies));
  let cur = species;
  while (cur && cur.prevo) {
    const pre = C.species.get(cur.prevo);
    if (!pre || !pre.exists) break;
    chain.push(pre.id);
    cur = pre;
  }
  for (const k of chain) {
    const ls = C.data.Learnsets[k]?.learnset;
    if (ls && Array.isArray(ls[mvId]) && ls[mvId].some(s => /^[9]|^10/.test(s))) return true;
  }
  return false;
};

// Exact Strength Score calculation matching app/src/app/35-win-model.js + app/src/app/60-concept-h.js
const sig = z => 1 / (1 + Math.exp(-z));
const SS_MID = 80;
const SS_K = 122;
const WORDS = [[90, 'Top tier'], [80, 'Tournament ready'], [70, 'Solid'], [60, 'Needs work'], [-1, 'Missing a basic']];
const wordOf = s => WORDS.find(w => s >= w[0])[1];

const spFeatMap = new Map();
for (const k of Object.keys(model.sets || {})) {
  const sp = k.split(/[@:#]/)[0];
  if (!spFeatMap.has(sp)) spFeatMap.set(sp, []);
  spFeatMap.get(sp).push(k);
}
const testedSet = new Set(Array.isArray(model.tested) ? model.tested : []);

function setOneScore(mon) {
  const sets = model.sets || {};
  const fq = model.setFreq || {};
  const keys = spFeatMap.get(mon.name) || [];
  if (!keys.length) return 0;
  const mvSet = new Set(mon.moves || []);
  const abLower = String(mon.ability || '').toLowerCase();
  if (model.center) {
    let u = 0;
    for (const k of keys) {
      const c = k[mon.name.length];
      const v = k.slice(mon.name.length + 1);
      const has = c === '@' ? v === mon.item : c === '#' ? v.toLowerCase() === abLower : mvSet.has(v);
      u += sets[k] * ((has ? 1 : 0) - (fq[k] || 0));
    }
    const r = model.setRange && model.setRange[mon.name];
    return r ? Math.max(r[0], Math.min(r[1], u)) : u;
  }
  let x = mon.item ? (sets[`${mon.name}@${mon.item}`] || 0) : 0;
  for (const mv of mon.moves || []) x += sets[`${mon.name}:${mv}`] || 0;
  return x;
}

function strengthPct(x) {
  const q = model.dist && Array.isArray(model.dist.q) && model.dist.q.length === 101 ? model.dist.q : null;
  if (!q) return null;
  if (x <= q[0]) return 0;
  if (x >= q[100]) return 100;
  let i = 0;
  while (i < 99 && q[i + 1] < x) i++;
  const lo = q[i], hi = q[i + 1];
  return i + (hi > lo ? (x - lo) / (hi - lo) : 0);
}

function fieldWin(y) {
  const q = model.dist && Array.isArray(model.dist.q) && model.dist.q.length === 101 ? model.dist.q : null;
  if (!q) return null;
  const c = model.calib > 0 && model.calib < 3 ? model.calib : 1;
  let t = 0;
  for (const v of q) t += sig(c * (y - v));
  return t / q.length;
}

function scoreTeam(team) {
  const mons = team.mons;
  const names = mons.map(m => m.name);
  let x = 0;
  for (const n of names) x += model.mons[n] || 0;
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const pair = names[i] < names[j] ? `${names[i]}|${names[j]}` : `${names[j]}|${names[i]}`;
      x += model.pairs[pair] || 0;
    }
  }
  const byN = new Map(mons.map(m => [m.name, m]));
  const isMega = n => /-Mega/.test(n) || !!(rosterByName.get(n)?.m);
  const val = n => (model.mons[n] || 0) + setOneScore(byN.get(n));
  const megas = names.filter(isMega).sort((a, b) => val(b) - val(a));
  const extraMegas = new Set(megas.slice(2));
  for (const n of extraMegas) x -= model.mons[n] || 0;
  for (const m of mons) if (!extraMegas.has(m.name)) x += setOneScore(m);

  // team-wide basics (matching team-basics.mjs + 35-win-model.js)
  const featList = [];
  for (const m of mons) {
    featList.push(m.name);
    if (m.ability) featList.push(`${m.name}#${m.ability}`);
    if (m.item) featList.push(`${m.name}@${m.item}`);
    for (const mv of m.moves || []) featList.push(`${m.name}:${mv}`);
  }
  const basics = deckBasics(featList) || {};
  basics.noMega = megas.length ? 0 : 1;
  for (const [k, w] of Object.entries(model.team || {})) {
    if (basics[k]) x += w;
  }

  let tested = 0;
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const pair = names[i] < names[j] ? `${names[i]}|${names[j]}` : `${names[j]}|${names[i]}`;
      if (testedSet.has(pair)) tested++;
    }
  }
  const mx = model.meanX || 0;
  const cr = model.supK ? 0.75 + 0.25 * Math.min(1, tested / model.supK) : 1;
  const dv = x - mx;
  const xAdj = mx + (dv > 0 ? dv * cr : dv);
  const sixKey = names.slice().sort().join('|');
  const sixRec = model.sixes && Array.isArray(model.sixes[sixKey]) ? +model.sixes[sixKey][0] || 0 : 0;
  const y = xAdj + sixRec;
  const e = fieldWin(y);
  const pct = strengthPct(y);
  const ss = Math.max(0, Math.min(100, SS_MID + SS_K * (e - 0.5)));
  const knownMons = names.filter(n => Object.prototype.hasOwnProperty.call(model.mons, n)).length;
  return {
    ss: Math.round(ss * 10) / 10,
    word: wordOf(ss),
    winPct: Math.round(e * 1000) / 10,
    rankPct: Math.round(pct * 10) / 10,
    knownMons,
    testedPairs: tested,
  };
}

// --- Run checks ---
const failures = [];
const fail = msg => failures.push(msg);

let data;
try {
  data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
} catch (e) {
  console.error(`FAIL: could not read/parse ${fixturePath}: ${e.message}`);
  process.exit(1);
}

const teams = Array.isArray(data.teams) ? data.teams : [];
if (teams.length !== 12) fail(`Expected 12 teams, got ${teams.length}`);

const teamIds = new Set();
const scored = [];
const coverage = {
  megaHeatran: 0,
  dozoTatsuCommander: 0,
  trickRoom: 0,
  tailwind: 0,
  sun: 0,
  rain: 0,
  dec2PsychUp: 0,
  dec2RoostHydreigon: 0,
};

for (let ti = 0; ti < teams.length; ti++) {
  const t = teams[ti];
  const label = `Team #${ti + 1} (${t.id || t.name || 'unnamed'})`;
  if (!t.id) fail(`${label}: missing id`);
  else if (teamIds.has(t.id)) fail(`${label}: duplicate team id "${t.id}"`);
  else teamIds.add(t.id);

  const mons = Array.isArray(t.mons) ? t.mons : [];
  if (mons.length !== 6) {
    fail(`${label}: expected 6 Pokemon, got ${mons.length}`);
    continue;
  }

  const basesSeen = new Set();
  const itemsSeen = new Set();
  let hasDondozo = false;
  let hasTatsuCommander = false;
  let hasTR = false;
  let slowNonTR = 0;

  for (let mi = 0; mi < mons.length; mi++) {
    const m = mons[mi];
    const mLabel = `${label} slot ${mi + 1} (${m.name || 'missing'})`;

    // Species existence + M-D roster check
    const sp = C.species.get(m.name);
    if (!sp || !sp.exists) {
      fail(`${mLabel}: species "${m.name}" does not exist in Showdown champions mod`);
      continue;
    }
    if (!isLegalMDSpecies(m.name)) {
      fail(`${mLabel}: species "${m.name}" is not in Reg M-D roster (Reg M-C + regulation.json M-D announced)`);
    }

    // Species Clause
    const bKey = id(sp.baseSpecies);
    if (basesSeen.has(bKey)) fail(`${mLabel}: duplicate base species "${sp.baseSpecies}" (Species Clause)`);
    basesSeen.add(bKey);

    // Item legality + Item Clause
    if (!m.item || typeof m.item !== 'string') {
      fail(`${mLabel}: missing item`);
    } else {
      if (!legalMDItems.has(m.item)) fail(`${mLabel}: item "${m.item}" is not in Reg M-D legal items`);
      const itObj = C.items.get(m.item);
      if (!itObj || !itObj.exists) fail(`${mLabel}: item "${m.item}" does not exist in Showdown champions mod`);
      if (sp.requiredItem && m.item !== sp.requiredItem) {
        fail(`${mLabel}: Mega species "${m.name}" requires "${sp.requiredItem}", got "${m.item}"`);
      }
      if (itemsSeen.has(id(m.item))) fail(`${mLabel}: duplicate item "${m.item}" (Item Clause)`);
      itemsSeen.add(id(m.item));
    }

    // Ability legality (Showdown champions mod + official regulation.json M-D Mega ability)
    const sdAbilities = Object.values(sp.abilities || {});
    const announcedMegaAb = mdMegaAbilities[m.name];
    const legalAbilities = announcedMegaAb ? [announcedMegaAb, ...sdAbilities] : sdAbilities;
    if (!m.ability || !legalAbilities.includes(m.ability)) {
      fail(`${mLabel}: illegal ability "${m.ability}" (allowed: ${legalAbilities.join(', ')})`);
    }

    // Moves legality (4 distinct moves, Showdown champions mod learnset + official Dec 2 additions)
    if (!Array.isArray(m.moves) || m.moves.length !== 4) {
      fail(`${mLabel}: expected 4 moves, got ${Array.isArray(m.moves) ? m.moves.length : typeof m.moves}`);
    } else {
      const mvSeen = new Set();
      for (const mv of m.moves) {
        const mvObj = C.moves.get(mv);
        if (!mvObj || !mvObj.exists) {
          fail(`${mLabel}: unknown move "${mv}"`);
          continue;
        }
        if (mvSeen.has(mvObj.id)) fail(`${mLabel}: duplicate move "${mv}"`);
        mvSeen.add(mvObj.id);
        if (!hasLearnsetMove(sp, mv)) {
          fail(`${mLabel}: "${m.name}" cannot learn "${mv}" in Showdown champions mod (or Dec 2 patch)`);
        }
      }
    }

    // Nature
    const nat = C.natures.get(m.nature);
    if (!nat || !nat.exists) fail(`${mLabel}: invalid nature "${m.nature}"`);

    // Champions stat points (0..32 each, sum <= 66)
    if (!Array.isArray(m.points) || m.points.length !== 6) {
      fail(`${mLabel}: points must be a 6-number array [hp,atk,def,spa,spd,spe]`);
    } else {
      const badPt = m.points.some(n => !Number.isInteger(n) || n < SP_MIN || n > SP_MAX);
      const sum = m.points.reduce((a, b) => a + b, 0);
      if (badPt) fail(`${mLabel}: each stat point must be an integer in ${SP_MIN}..${SP_MAX}, got [${m.points.join(',')}]`);
      if (sum > SP_TOTAL) fail(`${mLabel}: total stat points ${sum} exceeds Champions cap ${SP_TOTAL}`);
    }

    // Cross-check M-C species directly with Showdown's TeamValidator('gen9championsvgc2026regmc')
    const isNewMD = mdNewBase.has(bKey) || mdNewMegas.has(id(m.name));
    if (!isNewMD && Array.isArray(m.moves) && m.moves.length === 4 && Array.isArray(m.points) && m.points.length === 6) {
      const psSet = {
        name: m.name,
        species: m.name,
        item: m.item,
        ability: m.ability,
        moves: m.moves,
        nature: m.nature,
        evs: {hp: m.points[0], atk: m.points[1], def: m.points[2], spa: m.points[3], spd: m.points[4], spe: m.points[5]},
        level: 50,
      };
      const errs = validatorMC.validateSet(psSet) || [];
      const unexpected = errs.filter(err => {
        const match = err.match(/can't learn ([^.]+)\./i);
        if (match && DEC2_MOVES.has(`${id(m.name)}:${id(match[1])}`)) return false;
        return true;
      });
      for (const u of unexpected) fail(`${mLabel}: Showdown TeamValidator -> ${u}`);
    }

    // Archetype coverage tracking
    if (m.name === 'Heatran-Mega' && m.item === 'Heatranite') coverage.megaHeatran++;
    if (m.name === 'Dondozo') hasDondozo = true;
    if (m.name === 'Tatsugiri' && m.ability === 'Commander') hasTatsuCommander = true;
    if ((m.moves || []).includes('Trick Room')) hasTR = true;
    else if (sp.baseStats.spe <= 60) slowNonTR++;
    if ((m.moves || []).includes('Tailwind')) coverage.tailwind++;
    if (m.ability === 'Drought') coverage.sun++;
    if (m.ability === 'Drizzle') coverage.rain++;
    if ((m.moves || []).includes('Psych Up') && DEC2_MOVES.has(`${id(m.name)}:psychup`)) coverage.dec2PsychUp++;
    if (m.name === 'Hydreigon' && (m.moves || []).includes('Roost')) coverage.dec2RoostHydreigon++;
  }

  if (hasDondozo && hasTatsuCommander) coverage.dozoTatsuCommander++;
  if (hasTR && slowNonTR >= 2) coverage.trickRoom++;

  // Score team with current model
  try {
    const sc = scoreTeam(t);
    if (!Number.isFinite(sc.ss) || sc.ss < 0 || sc.ss > 100) {
      fail(`${label}: invalid Strength Score ${sc.ss}`);
    }
    scored.push({id: t.id, name: t.name, archetype: t.archetype, ...sc});
  } catch (e) {
    fail(`${label}: scoring threw error: ${e.message}`);
  }
}

// Verify all required archetypes/cores from Job 56
if (coverage.megaHeatran < 1) fail('Missing required archetype: Mega Heatran');
if (coverage.dozoTatsuCommander < 1) fail('Missing required archetype: Dondozo + Tatsugiri (Commander)');
if (coverage.trickRoom < 1) fail('Missing required archetype: Trick Room (with >=2 slow attackers)');
if (coverage.tailwind < 1) fail('Missing required archetype: Tailwind');
if (coverage.sun < 1) fail('Missing required archetype: Sun (Drought)');
if (coverage.rain < 1) fail('Missing required archetype: Rain (Drizzle)');
if (coverage.dec2PsychUp < 1) fail('Missing required Dec 2 patch move: Psych Up on an official Dec 2 species');
if (coverage.dec2RoostHydreigon < 1) fail('Missing required Dec 2 patch move: Roost on Hydreigon');

// Print Strength Score table
console.log(`Fixture: ${path.relative(ROOT, fixturePath)} (model ${model.reg} ${String(model.updated || '').slice(0, 10)})`);
console.log('');
console.log(' # | Team                                    | Score | Band             | Win%  | Rank% | Model');
console.log('---+-----------------------------------------+-------+------------------+-------+-------+------');
scored.forEach((r, idx) => {
  const num = String(idx + 1).padStart(2);
  const nm = String(r.name || r.id).slice(0, 39).padEnd(39);
  const ss = r.ss.toFixed(1).padStart(5);
  const wd = r.word.padEnd(16);
  const wp = (r.winPct.toFixed(1) + '%').padStart(5);
  const rk = (r.rankPct.toFixed(1) + '%').padStart(5);
  const kn = `${r.knownMons}/6`;
  console.log(`${num} | ${nm} | ${ss} | ${wd} | ${wp} | ${rk} | ${kn}`);
});
console.log('');
console.log('Archetype coverage:', JSON.stringify(coverage));

if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  for (const f of failures) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
console.log(`\nALL PASSED (${teams.length} teams, ${teams.length * 6} sets verified legal and scored)`);
