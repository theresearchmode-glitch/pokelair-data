// Strength Score fix lock (Nov 25, HH with Sim): the Pokémon and pair ridge (lb, lp in model-settings.json) must stay locked when the
// model is re-tuned (RETUNE=1, K_GRID=…), in the daily run, with FAST=… (weekly-recheck.mjs, walk-forward.mjs), and an LB / LP env override must still win. Runs model.mjs from the repo
// root (so it reads the real model-settings.json) on a small synthetic fixture (the one experiments/shadow-model-test.mjs uses).
// Checks the shipped pairSd0 (= sqrt(1/(2·lp)), so it shows the lp the run really used) and model.mjs's "ridge lb … lp …" line.
// LOCK_TEST_MODEL=<file in the repo root> runs another model.mjs (e.g. the version before the lock, to see this test fail).
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import assert from 'node:assert/strict'; import {spawnSync} from 'node:child_process';
const ROOT = new URL('../', import.meta.url).pathname, SCRIPT = process.env.LOCK_TEST_MODEL || 'model.mjs';
const S = JSON.parse(fs.readFileSync(ROOT + 'model-settings.json', 'utf8'));
assert.ok(S.lb > 0 && S.lp > 0, 'model-settings.json must lock lb and lp');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'np-lock-test-'));
try {
  // Deterministic synthetic matches.json fixture (10 events across 14 days, 12 mons, 12 teams, 240 decided games)
  const mons = ['Garchomp', 'Incineroar', 'Flutter Mane', 'Rillaboom', 'Amoonguss', 'Urshifu', 'Tornadus', 'Chi-Yu', 'Landorus', 'Farigiraf', 'Raging Bolt', 'Charizard-Mega-Y'];
  const teams = [];
  for (let i = 0; i < 12; i++) {
    const six = [];
    for (let k = 0; k < 6; k++) six.push(mons[(i + k) % mons.length]);
    teams.push(six.sort().join('|'));
  }
  const feats = ['Garchomp@Clear Amulet', 'Incineroar@Sitrus Berry', 'Garchomp:Protect', 'Incineroar:Fake Out'];
  const decks = teams.map((_, i) => [i % 2, 2 + (i % 2)]);
  const events = [];
  for (let e = 0; e < 10; e++) {
    const d = new Date(Date.UTC(2026, 10, 10 + e)).toISOString().slice(0, 10);
    events.push([`ev_${e}`, d, 32]);
  }
  const m = [];
  let st = 42;
  const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; };
  // Give teams distinct true strengths + strong player-skill confounding in train so model.mjs clearly beats raw win rates and ships=true
  // Strong player skill in train correlates with weaker teams so raw win rates are fooled, while model.mjs separates skill from team strength
  const trueMon = [1.2, 0.9, 0.6, 0.3, 0.1, 0.0, -0.1, -0.3, -0.5, -0.7, -0.9, -1.1];
  const teamStr = teams.map(k => k.split('|').reduce((a, n) => a + trueMon[mons.indexOf(n)], 0));
  const plSkill = Array.from({length: 16}, (_, i) => i < 8 ? 1.8 : -1.8);
  for (let e = 0; e < 10; e++) {
    for (let g = 0; g < 80; g++) {
      const A = Math.floor(rnd() * 12);
      let B = Math.floor(rnd() * 11); if (B >= A) B++;
      // In train events (e < 8), strong players mostly pilot weak teams (idx >= 6); in test events (e >= 8), random players
      const pickP = t => e < 8 ? (t >= 6 ? Math.floor(rnd() * 8) : 8 + Math.floor(rnd() * 8)) : Math.floor(rnd() * 16);
      const pa = pickP(A);
      let pb = pickP(B); if (pb === pa) pb = (pb + 1) % 16;
      const pWin = 1 / (1 + Math.exp(-(teamStr[A] - teamStr[B] + plSkill[pa] - plSkill[pb])));
      const res = rnd() < pWin ? 1 : 0;
      m.push([A, B, res, e, pa, pb, (g % 6) + 1, A, B]);
    }
  }
  const matchesPath = path.join(tmp, 'matches.json');
  fs.writeFileSync(matchesPath, JSON.stringify({reg: 'M-C', updated: '2026-11-20T00:00:00Z', events, teams, players: 16, feats, decks, m}));
  const run = (name, env) => { const out = path.join(tmp, name + '.json');
    const E = {...process.env}; for (const k of ['RETUNE', 'K_GRID', 'FAST', 'LB', 'LP', 'PAIR_SHRINK', 'EVID_K', 'EVID_KP', 'ZERO_CENTER', 'MODEL_SHADOW']) delete E[k];
    const r = spawnSync(process.execPath, [SCRIPT], {cwd: ROOT, env: {...E, MATCHES: matchesPath, MODEL_OUT: out, ITERS: '40', ...env}, encoding: 'utf8'});
    assert.equal(r.status, 0, `${name}: model.mjs failed: ${r.stderr}\n${r.stdout}`);
    const md = JSON.parse(fs.readFileSync(out, 'utf8'));
    return {md, log: r.stdout}; };
  const sd = lp => +Math.sqrt(1 / (2 * lp)).toFixed(3), cases = [
    ['daily (locked settings)', {}, S.lb, S.lp],
    ['RETUNE=1', {RETUNE: '1'}, S.lb, S.lp],
    ['K_GRID=1,3,100', {K_GRID: '1,3,100'}, S.lb, S.lp],
    ['FAST=1,14,1,0 (weekly re-check / walk-forward)', {FAST: '1,14,1,0'}, S.lb, S.lp],
    ['RETUNE=1 with LB=50 LP=300 (env wins)', {RETUNE: '1', LB: '50', LP: '300'}, 50, 300]];
  const runs = cases.map(([name, env, lb, lp]) => ({name, lb, lp, ...run(name.replace(/\W+/g, '_'), env)}));
  // 1. the lp each run really used, read from its shipped pairSd0 (works on any version of model.mjs; only a shipped model has one,
  //    and the daily run must ship)
  for (const {name, lp, md} of runs) if (md.ships || name.startsWith('daily')) assert.equal(md.pairSd0, sd(lp), `${name}: pairSd0 ${md.pairSd0} means lp ${(1 / (2 * md.pairSd0 ** 2)).toFixed(0)}; expected lp ${lp} (pairSd0 ${sd(lp)})`);
  // 2. lb and lp as model.mjs reports them
  for (const {name, lb, lp, md, log} of runs) { const m = log.match(/ridge lb (\S+) lp (\S+)/); assert.ok(m, `${name}: no "ridge lb … lp …" line in the model.mjs log`);
    assert.deepEqual([+m[1], +m[2]], [lb, lp], `${name}: ridge lb ${m[1]} lp ${m[2]}, expected lb ${lb} lp ${lp}`);
    console.log(`  ok   ${name}: lb ${m[1]} lp ${m[2]}, pairSd0 ${md.pairSd0}`); }
  console.log('score-ebfix-lock-test: PASS (lb and lp stay locked in the daily run and the re-tune; LB/LP env still override)');
} finally { fs.rmSync(tmp, {recursive: true, force: true}); }
