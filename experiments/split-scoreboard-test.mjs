// Checks experiments/split-scoreboard.mjs (Sim, Nov 17: single games first). Exit 1 on failure.
//   node experiments/split-scoreboard-test.mjs                    fixtures: round → phase mapping, the sealed guard, edge scale
//   node experiments/split-scoreboard-test.mjs <summary.json>     also: a pre-Nov 9 run of the default window (4 weeks to 2026-11-09)
//                                                                 must reproduce the Nov 17 helper's measured numbers
// (docs/rebuild/research/score-drift-nov17.md §4.3: best-of-1 1,919 games, picks 54.30%, log-loss 0.68579, edge scale 0.73
//  (0.46 to 0.96); best-of-3 15,885 games, 56.04%, 0.68001, 0.97 (0.87 to 1.06); all 18,642 games, 0.68088, 55.86%).
import fs from 'node:fs'; import {spawnSync} from 'node:child_process';
import {roundMode, windowGuard, edgeScale, bucketStats, SEAL_FROM} from './split-scoreboard.mjs';
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };

// 1. round → phase: phases walked in order, rounds counted cumulatively
const two = [['SWISS', 6, 'BO1'], ['SINGLE_BRACKET', 3, 'BO3']], three = [['SWISS', 5, 'BO1'], ['SWISS', 2, 'BO3'], ['SINGLE_BRACKET', 3, 'BO3']];
ok([1, 6].every(r => roundMode(two, r) === 'BO1') && [7, 9].every(r => roundMode(two, r) === 'BO3'), 'Swiss 6 (BO1) + cut 3 (BO3): rounds 1 and 6 are BO1, 7 and 9 are BO3');
ok(roundMode(two, 10) === 'unknown', 'a round past the last phase is unknown (not guessed from the last phase)');
ok(roundMode(three, 5) === 'BO1' && roundMode(three, 6) === 'BO3' && roundMode(three, 7) === 'BO3' && roundMode(three, 8) === 'BO3' && roundMode(three, 11) === 'unknown', 'three phases: 5 BO1 · 6-7 second phase · 8-10 cut · 11 unknown');
ok(roundMode([['SWISS', 4, 'BO3'], ['SINGLE_BRACKET', 2, 'BO1']], 5) === 'BO1', 'a best-of-1 cut after best-of-3 Swiss maps the cut correctly');
ok(roundMode(two, '7') === 'BO3', 'a round stored as text still maps');
ok([null, undefined, '', 0, -1, 2.5, 'x'].every(r => roundMode(two, r) === 'unknown'), 'no round number, 0, negative or non-whole = unknown');
ok(roundMode(undefined, 3) === 'unknown' && roundMode([], 3) === 'unknown', 'an event with no format record is unknown');
ok(roundMode([['SWISS', 6, 'BO2']], 2) === 'unknown', 'a format other than BO1/BO3 is unknown');

// 2. the window and the sealed guard (until is exclusive)
const g = o => windowGuard(o).ok;
ok(g({from: '2026-10-12', until: '2026-11-09'}), 'a window ending at 2026-11-09 (exclusive) is allowed');
ok(!g({from: '2026-10-12', until: '2026-11-10'}), 'a window reaching 2026-11-09 is refused without --sealed');
ok(!g({from: '2026-11-09', until: '2026-11-16'}) && !g({from: '2026-11-10', until: '2026-11-20'}), 'windows inside the sealed dates are refused without --sealed');
ok(!g({from: '2026-11-09', until: '2026-11-19', sealed: true}), '--sealed without --one-model is refused (rules: model trained before 2026-11-09 only)');
ok(!g({from: '2026-11-02', until: '2026-11-19', sealed: true, oneModel: true}), '--sealed must start exactly at 2026-11-09');
ok(!g({from: '2026-11-09', until: '2026-11-19', sealed: true, oneModel: true, preds: true}), '--sealed cannot reuse old predictions');
ok(g({from: SEAL_FROM, until: '2026-11-19', sealed: true, oneModel: true}), 'the sealed one-model window is allowed with --sealed');
ok(!g({from: '2026-11-01', until: '2026-11-01'}) && !g({from: '2026-11-1', until: '2026-11-08'}), 'empty windows and badly written dates are refused');
// the command line refuses before it reads any data (MATCHES points nowhere: a refusal must still be exit 2, not a crash)
const cli = a => spawnSync('node', [new URL('./split-scoreboard.mjs', import.meta.url).pathname, ...a], {env: {...process.env, MATCHES: '/nonexistent.json'}, encoding: 'utf8'});
const r1 = cli(['--from', '2026-11-02', '--until', '2026-11-10']), r2 = cli(['--sealed', '--from', '2026-11-09', '--until', '2026-11-19']);
ok(r1.status === 2 && /sealed set/.test(r1.stderr), `command line: a window into the sealed dates exits 2 (${r1.status})`);
ok(r2.status === 2 && /one-model/.test(r2.stderr), `command line: --sealed without --one-model exits 2 (${r2.status})`);

// 3. edge scale: games made with true chance σ(0.5·logit p) must give a best scale near 0.5; right-sized chances near 1
let q = 7; const rnd = () => (q = (q * 16807) % 2147483647) / 2147483647, sig = z => 1 / (1 + Math.exp(-z)), lg = p => Math.log(p / (1 - p));
const mk = s => Array.from({length: 40000}, (_, i) => { const p = .3 + .4 * rnd(); return {p, y: rnd() < sig(s * lg(p)) ? 1 : 0, ev: 'e' + (i % 200)}; });
const e5 = edgeScale(mk(.5)), e1 = edgeScale(mk(1));
ok(Math.abs(e5 - .5) < .1 && Math.abs(e1 - 1) < .1, `edge scale recovers 0.5 (${e5.toFixed(3)}) and 1.0 (${e1.toFixed(3)})`);
const B = bucketStats([{p: .7, y: 1, ev: 'a'}, {p: .7, y: 0, ev: 'a'}, {p: .4, y: 0, ev: 'b'}, {p: .5, y: 1, ev: 'b'}], {resamples: 0});
ok(B.games === 4 && B.tournaments === 2 && B.pick === 66.67 && B.cal.length === 2 && B.cal[0].games === 1 && B.cal[1].games === 2, 'pick skips 50/50 games; 10-point bins hold the favourite\'s chance');

// 4. optional: reproduce the Nov 17 helper's measured pre-Nov 9 numbers
const sp = process.argv[2];
if (sp) { const S = JSON.parse(fs.readFileSync(sp, 'utf8')), b = S.buckets;
  ok(S.from === '2026-10-12' && S.until === '2026-11-09' && !S.sealed, `run window is the helper's (${S.from} to ${S.until})`);
  const want = {BO1: {games: 1919, pick: '54.30', ll: '0.68579', s: '0.73', lo: '0.46', hi: '0.96'}, BO3: {games: 15885, pick: '56.04', ll: '0.68001', s: '0.97', lo: '0.87', hi: '1.06'}, all: {games: 18642, pick: '55.86', ll: '0.68088'}};
  for (const [k, w] of Object.entries(want)) { const o = b[k];
    const got = {games: o.games, pick: o.pick.toFixed(2), ll: o.ll.toFixed(5), s: o.edgeScale.toFixed(2), lo: o.edgeScaleRange && o.edgeScaleRange[0].toFixed(2), hi: o.edgeScaleRange && o.edgeScaleRange[1].toFixed(2)};
    const bad = Object.keys(w).filter(x => String(got[x]) !== String(w[x]));
    ok(!bad.length, `${k}: ${JSON.stringify(got)}${bad.length ? ' — differs on ' + bad.join(', ') + ' (want ' + JSON.stringify(w) + ')' : ''}`); }
  ok(b.BO1.games + b.BO3.games + b.unknown.games === b.all.games, `best-of-1 + best-of-3 + unknown = all (${b.unknown.games} unknown)`); }
console.log(`split-scoreboard: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
