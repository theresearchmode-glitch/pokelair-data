// Never-get-worse gate (Accuracy Lab step 3, Nov 9, Sim approved). Replaces the fixed "75% of top-cut teams grade B or
// better" bar, which was set on a number that partly counted each team's own wins and swung 72-81% with the sample.
// Re-runs the walk-forward scoreboard on the last 2 weeks before the sealed set (each week scored by a model trained only on
// earlier events) and compares with the approved baseline (experiments/accuracy-baseline.json). Fails (exit 1) if:
//   1. the share of top-4 teams graded B or better before their event is clearly below the baseline (more than 2 standard
//      errors), or below 60% at all (twice what chance gives: B or better is the top 30%);
//   2. the log-loss on those weeks' games is worse than the baseline by more than 0.005 (the daily model guard's tolerance).
// What it can't see: a change smaller than those margins (judge those with walk-forward.mjs + compare.mjs), and the sealed games.
// Usage: node experiments/accuracy-gate.mjs        (needs app/dist/page.html)
import fs from 'node:fs'; import {execFileSync} from 'node:child_process';
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const B = JSON.parse(fs.readFileSync(ROOT + 'experiments/accuracy-baseline.json', 'utf8'));
execFileSync('node', ['experiments/walk-forward.mjs', 'gate', String(B.cuts.length)], {cwd: ROOT, stdio: 'inherit', env: process.env});
const S = JSON.parse(fs.readFileSync(ROOT + 'out/wf/gate/summary.json', 'utf8'));
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
if (JSON.stringify(S.cuts) !== JSON.stringify(B.cuts)) console.log(`  note: the weeks moved (${S.cuts.join(', ')} vs baseline ${B.cuts.join(', ')}): the sealed set changed; re-record the baseline with Sim`);
const p = B.topCut.share, se = Math.sqrt(p * (1 - p) / B.topCut.n), bar = Math.max(.6, p - 2 * se), T = S.topCut;
ok(T && T.n >= 40 && T.share >= bar, `top-4 teams graded B or better before their event: ${T ? `${T.good} of ${T.n} (${(T.share * 100).toFixed(1)}%)` : 'none'} · baseline ${(p * 100).toFixed(1)}% · bar ${(bar * 100).toFixed(1)}% (2 standard errors below, never under 60%)`);
ok(S.ll <= B.ll + .005, `log-loss on ${S.games} later games: ${S.ll} · baseline ${B.ll} · allowed up to ${(B.ll + .005).toFixed(5)}`);
console.log(`  (higher grade wins ${S.pick}% · calibration gap ${S.calGap} pts)`);
console.log(fails.length ? `\n${fails.length} FAILED` : '\nGATE PASSED'); process.exit(fails.length ? 1 : 0);
