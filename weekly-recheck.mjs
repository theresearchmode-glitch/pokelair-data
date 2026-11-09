// Weekly settings re-check (Accuracy Lab step 4, Nov 9, Sim approved). The daily model is built with LOCKED settings
// (model-settings.json: Pokémon shrink, recency half-life, player-skill shrink, set shrink) and never re-checks them. This
// closes that blind spot. It only REPORTS; it never changes the settings (that stays Sim's decision).
// 1. A full retune (RETUNE=1 node model.mjs) says which value of each setting scores best on validation games now.
// 2. If any differ from the locked ones, the suggested settings run through the walk-forward scoreboard (weeks before the
//    sealed set, each scored by a model trained only on earlier events) and are compared game for game with today's settings
//    by the agreed rule (experiments/compare.mjs): KEEP only if the whole 95% range of the log-loss gap is better.
// Writes out/recheck.json. Usage: node weekly-recheck.mjs      (needs app/dist/page.html for the top-cut part)
import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
const ROOT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const L = JSON.parse(fs.readFileSync(ROOT + 'model-settings.json', 'utf8')), locked = {shrink: L.shrink, half: L.half, skill: L.skill, sets: L.sets};
const run = (args, env) => execFileSync('node', args, {cwd: ROOT, env: {...process.env, ...env}, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'inherit']});
fs.mkdirSync(ROOT + 'out/wf', {recursive: true});
console.log('full retune (every setting re-picked on validation games)…');
const log = run(['model.mjs'], {RETUNE: '1', MODEL_OUT: ROOT + 'out/wf/retune-model.json'});
// the grid lines model.mjs prints while picking: "shrink 10 0.6838", "recency half-life 14 0.6824", "player-skill shrink 3 0.682", "sets shrink 60 0.6801"
const grid = (re) => [...log.matchAll(re)].map(m => [+m[1], +m[2]]);
const G = {shrink: grid(/^shrink ([\d.]+) ([\d.]+)$/gm), half: grid(/^recency half-life ([\d.]+) ([\d.]+)$/gm), skill: grid(/^player-skill shrink ([\d.]+) ([\d.]+)$/gm), sets: grid(/^sets shrink ([\d.]+) ([\d.]+)$/gm)};
const best = a => a.length ? a.reduce((m, x) => x[1] < m[1] ? x : m)[0] : null;
const picked = {shrink: best(G.shrink) ?? locked.shrink, half: best(G.half) ?? locked.half, skill: locked.skill, sets: best(G.sets) ?? locked.sets};
// player-skill: model.mjs only moves off 1 when another value is better by .002+ (noise guard); the same rule here
// (its grid has no 1: the score to beat is the best recency score, the step before, as in model.mjs)
{ const base = G.half.length ? Math.min(...G.half.map(x => x[1])) : Infinity, b = G.skill.reduce((m, x) => x[1] < m[1] ? x : m, [1, base]); picked.skill = b[1] < base - .002 ? b[0] : 1; }
const differ = Object.keys(locked).filter(k => picked[k] != null && +picked[k] !== +locked[k]);
const out = {date: new Date().toISOString().slice(0, 10), locked, picked, grid: G, differ, verdict: null};
console.log(`locked ${JSON.stringify(locked)} · retune picks ${JSON.stringify(picked)}`);
if (!differ.length) { out.verdict = 'same settings: nothing to check'; }
else {
  console.log(`different: ${differ.join(', ')}. Walk-forward: today's settings vs the retune's…`);
  const fast = s => [s.shrink, s.half, s.skill, s.sets].join(',');
  run(['experiments/walk-forward.mjs', 'recheck-locked', '4'], {FAST: fast(locked), WF_TOPCUT: '0'});
  run(['experiments/walk-forward.mjs', 'recheck-picked', '4'], {FAST: fast(picked), WF_TOPCUT: '0'});
  const row = '+ own sets + this six\'s own record  [site today, minus matchups]';
  const c = run(['experiments/compare.mjs', 'out/wf/recheck-locked/pred.json', 'out/wf/recheck-picked/pred.json', row, row]);
  const A = JSON.parse(fs.readFileSync(ROOT + 'out/wf/recheck-locked/summary.json', 'utf8')), B = JSON.parse(fs.readFileSync(ROOT + 'out/wf/recheck-picked/summary.json', 'utf8'));
  out.walk = {locked: {ll: A.ll, pick: A.pick, calGap: A.calGap}, picked: {ll: B.ll, pick: B.pick, calGap: B.calGap}, games: A.games, compare: c.trim().split('\n').slice(-4)};
  out.verdict = /KEEP/.test(c) ? `KEEP suggested: the retune's ${differ.join(', ')} predict later games better beyond chance. Ask Sim before changing model-settings.json.` : 'no difference beyond chance: keep the locked settings';
  console.log(c); }
fs.writeFileSync(ROOT + 'out/recheck.json', JSON.stringify(out, null, 1));
console.log(`\nverdict: ${out.verdict}`);
