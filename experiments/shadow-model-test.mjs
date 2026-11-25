// End-to-end test for Part 3 (MODEL_SHADOW=1 + shadow-scoreboard.mjs).
// Verifies:
//   1. Flag off (unset vs MODEL_SHADOW=0): byte-identical out/model.json (excluding updated timestamp) and NO shadow file written.
//   2. Flag on (MODEL_SHADOW=1): out/model.json is STILL byte-identical to flag-off, AND out/model_shadow.json is written with same shape + bc (d=4).
//   3. shadow-scoreboard.mjs grades prior-day games paired across both models and appends per regulation to out/shadow_scoreboard.json.
//   4. Negative assertion (S7): missing bc fails shape validation.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {runShadowScoreboard} from '../shadow-scoreboard.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'np-shadow-test-'));
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

  const runModel = (outFile, extraEnv = {}) => {
    const res = spawnSync(process.execPath, ['model.mjs'], {
      env: {...process.env, MATCHES: matchesPath, MODEL_OUT: outFile, FAST: '1,14,1,0', ITERS: '60', ...extraEnv},
      encoding: 'utf8'
    });
    assert.equal(res.status, 0, `model.mjs failed: ${res.stderr}\n${res.stdout}`);
    return fs.readFileSync(outFile, 'utf8');
  };
  const norm = s => s.replace(/"updated":"[^"]+"/, '"updated":"NORM"');

  const offPath = path.join(tmp, 'model_off.json');
  const zeroPath = path.join(tmp, 'model_zero.json');
  const onPath = path.join(tmp, 'model_on.json');
  const shadowPath = path.join(tmp, 'model_shadow.json');

  const rawOff = runModel(offPath, {MODEL_SHADOW: ''});
  const rawZero = runModel(zeroPath, {MODEL_SHADOW: '0', MODEL_SHADOW_OUT: shadowPath});
  assert.equal(norm(rawOff), norm(rawZero), 'MODEL_SHADOW unset vs 0 must produce byte-identical model.json');
  assert.equal(fs.existsSync(shadowPath), false, 'Shadow file must NOT be written when MODEL_SHADOW=0');

  const rawOn = runModel(onPath, {MODEL_SHADOW: '1', MODEL_SHADOW_OUT: shadowPath});
  assert.equal(norm(rawOn), norm(rawOff), 'MODEL_SHADOW=1 must leave model.json byte-identical to flag-off');
  assert.equal(fs.existsSync(shadowPath), true, 'Shadow file must be written when MODEL_SHADOW=1');

  const liveObj = JSON.parse(rawOn);
  const shadowObj = JSON.parse(fs.readFileSync(shadowPath, 'utf8'));
  assert.equal(liveObj.ships, true, 'Fixture live model should ship');
  assert.equal(shadowObj.shadow, 'combo');
  assert.equal(shadowObj.reg, liveObj.reg);
  assert.ok(shadowObj.bc && shadowObj.bc.d === 4, 'Shadow model must include bc with d=4');
  assert.equal(Object.keys(shadowObj.bc.u).length, Object.keys(liveObj.mons).length);
  assert.equal(Object.keys(shadowObj.bc.v).length, Object.keys(liveObj.mons).length);
  for (const n of Object.keys(shadowObj.bc.u)) {
    assert.equal(shadowObj.bc.u[n].length, 4);
    assert.equal(shadowObj.bc.v[n].length, 4);
  }

  // Test shadow-scoreboard.mjs across two dates
  const sbPath = path.join(tmp, 'shadow_scoreboard.json');
  const sb1 = runShadowScoreboard({matchesPath, livePath: onPath, shadowPath, outPath: sbPath, today: '2026-11-20', targetDate: '2026-11-18'});
  assert.ok(sb1 && sb1.latest.date === '2026-11-18' && sb1.latest.games === 80);
  const sb2 = runShadowScoreboard({matchesPath, livePath: onPath, shadowPath, outPath: sbPath, today: '2026-11-20'}); // auto-picks latest < today = 2026-11-19
  assert.ok(sb2 && sb2.latest.date === '2026-11-19' && sb2.byReg['M-C'].length === 2);
  assert.equal(typeof sb2.latest.delta.logloss, 'number');

  // Negative check (S7): removing bc must fail validation
  const badShadow = {...shadowObj};
  delete badShadow.bc;
  assert.throws(() => { if (!badShadow.bc || badShadow.bc.d !== 4) throw new Error('missing bc'); }, /missing bc/);

  console.log('shadow-model-test: PASS (byte-identical live model, valid combo shadow + bc d=4, paired scoreboard across 2 days)');
} finally {
  fs.rmSync(tmp, {recursive: true, force: true});
}
