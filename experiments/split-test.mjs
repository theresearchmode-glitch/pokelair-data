// Checks the split of the one-spelling fix (Sim, Nov 18, morning question 8; docs/rebuild/research/data-fixes-effect-nov18.md):
//  - what players SEE (out/meta_tour.json, the sets page) shows each item, Ability and move in its list spelling ("protect" -> "Protect");
//  - the GRADE's input (out/matches.json's set features, read by model.mjs and six.mjs) keeps the sheets as typed ("protect" stays);
//  - the Mega Stone reading applies to both ("raichunite y" makes Raichu its Mega Y on the sets page AND in the games).
// It runs the real update.mjs, offline, in a scratch folder on a tiny made-up event (4 players, 6 games); every network call
// answers "nothing new", so only the files below are read. Fails on the old code (no fold, no stone reading) and on the
// unsplit fix (6c6d227f: the grade's features folded too). Exit 1 on failure.
// Run from the repo root: node experiments/split-test.mjs   (SPLIT_SRC=<folder> tests another copy of the code)
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import {execFileSync} from 'node:child_process';
const SRC = path.resolve(process.env.SPLIT_SRC || new URL('../', import.meta.url).pathname);
const W = fs.mkdtempSync(path.join(os.tmpdir(), 'split-test-'));
let log = '';
const fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
try {
  // the job's code and the lists names.mjs reads (paths are relative to the working folder)
  for (const f of ['update.mjs', 'pid.mjs', 'tour-modes.mjs', 'topcut.mjs', 'formats.mjs', 'http.mjs', 'names.mjs', 'roster.json', 'data/regmc-items.txt', 'app/src/data/data.js']) {
    if (!fs.existsSync(path.join(SRC, f))) continue; fs.mkdirSync(path.dirname(path.join(W, f)), {recursive: true}); fs.copyFileSync(path.join(SRC, f), path.join(W, f)); }
  for (const d of ['data/t', 'data/t2', 'data/p', 'out']) fs.mkdirSync(path.join(W, d), {recursive: true});
  // one standard event: every team has Kingambit with "protect" typed in lower case and Raichu holding "raichunite y"
  const ID = 'splittest01', P = n => 'P000000000' + n, rec = [[2, 1], [2, 1], [1, 2], [1, 2]];
  const rest = [['Incineroar', 'Sitrus Berry', 'Intimidate', ['Fake Out', 'Parting Shot', 'Flare Blitz', 'Knock Off']],
    ['Rillaboom', 'Choice Scarf', 'Grassy Surge', ['Fake Out', 'Grassy Glide', 'Wood Hammer', 'U-turn']],
    ['Sinistcha', 'Rocky Helmet', 'Hospitality', ['Matcha Gotcha', 'Rage Powder', 'Trick Room', 'Protect']],
    ['Pelipper', 'Focus Sash', 'Drizzle', ['Hurricane', 'Weather Ball', 'Tailwind', 'Protect']]];
  const dk = () => [{n: 'Kingambit', i: 'Black Glasses', a: 'Defiant', mv: ['protect', 'Sucker Punch', 'Kowtow Cleave', 'Swords Dance'], t: '', nt: 'Adamant'},
    {n: 'Raichu', i: 'raichunite y', a: 'Lightning Rod', mv: ['Fake Out', 'Thunderbolt', 'Protect', 'Nasty Plot'], t: '', nt: 'Timid'},
    ...rest.map(([n, i, a, mv]) => ({n, i, a, mv, t: '', nt: 'Jolly'}))];
  const keys = ['Kingambit', 'Raichu|MY', ...rest.map(r => r[0])], d = '2026-10-20T15:00:00.000Z';
  fs.writeFileSync(path.join(W, 'data/index.json'), JSON.stringify({tournaments: {[ID]: {d, p: 4, name: 'Split Test Cup', f: 'M-C'}}}));
  fs.writeFileSync(path.join(W, `data/t/${ID}.json`), JSON.stringify({d, p: 4, f: 'M-C', e: rec.map(([w, l], k) => [P(k + 1), w, l, keys])}));
  fs.writeFileSync(path.join(W, `data/t2/${ID}.json`), JSON.stringify({v: 3, d, p: 4, name: 'Split Test Cup', f: 'M-C',
    e: rec.map(([w, l], k) => ({id: P(k + 1), nm: P(k + 1), pl: k + 1, w, l, ti: 0, dk: dk()}))}));
  // 6 games: 1 and 2 win twice, 3 and 4 once (matching the records above)
  fs.writeFileSync(path.join(W, `data/p/${ID}.json`), JSON.stringify([[1, P(1), P(3), P(1)], [1, P(2), P(4), P(2)], [2, P(1), P(2), P(2)], [2, P(3), P(4), P(3)], [3, P(1), P(4), P(1)], [3, P(2), P(3), P(3)]]));
  fs.writeFileSync(path.join(W, 'stub.mjs'), "globalThis.fetch = async () => new Response('[]', {status: 200, headers: {'content-type': 'application/json'}});\n");
  try { log = execFileSync('node', ['--import', './stub.mjs', 'update.mjs'], {cwd: W, encoding: 'utf8', env: {...process.env, MAX_FETCH: '0', MAX_MODES: '0', GAP: '0'}, stdio: ['ignore', 'pipe', 'pipe']}); }
  catch (e) { log = String(e.stdout || '') + String(e.stderr || ''); ok(false, 'update.mjs ran on the made-up event: ' + log.split('\n').slice(-4).join(' | ')); }
  const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(W, f), 'utf8')); } catch (e) { return null; } };
  const MT = rd('out/meta_tour.json'), MA = rd('out/matches.json'), rows = MT ? [...MT.top, ...MT.more] : [], row = n => rows.find(r => r.n === n);
  const shown = (n, k) => ((row(n) || {})[k] || []).map(x => x[0]), feats = new Set(MA ? MA.feats : []);
  ok(!!MT && !!MA && MA.m.length === 6, `the job built the sets page and the games file (${MA ? MA.m.length : 0} of 6 games)`);
  // what players see: folded
  ok(shown('Kingambit', 'mv').includes('Protect') && !shown('Kingambit', 'mv').includes('protect'), `sets page: Kingambit's "protect" shows as "Protect" (moves shown: ${shown('Kingambit', 'mv').join(', ')})`);
  ok(row('Raichu-Mega-Y') && shown('Raichu-Mega-Y', 'it').includes('Raichunite Y'), `sets page: "raichunite y" shows as Raichu-Mega-Y holding "Raichunite Y" (items: ${shown('Raichu-Mega-Y', 'it').join(', ') || 'no Raichu-Mega-Y row'})`);
  // the grade's input: as typed, with the stone read
  ok(feats.has('Kingambit:protect') && !feats.has('Kingambit:Protect'), `grade input: Kingambit's move stays as typed, "Kingambit:protect" (Kingambit features: ${[...feats].filter(f => f.startsWith('Kingambit:')).join(', ')})`);
  ok(feats.has('Raichu-Mega-Y@raichunite y'), `grade input: the item stays as typed, and the stone still makes the Mega ("Raichu-Mega-Y@raichunite y")`);
  ok(MA && MA.teams.length && MA.teams.every(t => t.split('|').includes('Raichu-Mega-Y')), `grade input: every six has Raichu-Mega-Y (${MA ? MA.teams.join(' / ') : 'none'})`);
} finally { if (process.env.SPLIT_KEEP) console.log(log, W); else fs.rmSync(W, {recursive: true, force: true}); }
console.log(`split: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
