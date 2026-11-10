// Focus plan f1-verdict (Nov 10, site critique): a Matchups row can say "Real games: Unfavoured" and "Calc: Handles it" at once.
// Which verdict predicts real results better? Model and learned matchups trained only on games before Oct 27
// (out/model_dev_site.json); scored on tournament games from Oct 27 up to the sealed set (Nov 9), each side with its Pokémon
// (typical sets). For every game and side: the opponent's Pokémon that are in this team's 30 Matchups rows, with both verdicts.
//   per row: win rate by real verdict and by calc verdict, and where the two disagree, which one was right more often;
//   per game: each verdict summed over the opponent's threats, both sides; does the side with the better sum win more often?
// Can't see: sets actually run (typical sets), player skill (both verdicts face the same skill noise), which four were brought.
// Rows within one game share its result, so row counts overstate certainty; the per-game test is the fair one.
// Usage: node experiments/verdict-test.mjs [maxGames=4000]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8')), MAX = +(process.argv[2] || 4000);
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model_dev_site.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const MT = rd('matches.json'), teams = MT.teams.map(k => k.split('|'));
const G = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6 && MT.events[g[3]][1] >= '2026-10-27' && MT.events[g[3]][1] < '2026-11-09').slice(0, MAX);
const used = [...new Set(G.flatMap(g => [g[0], g[1]]))];
const page = ROOT + `app/vt-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const V = new Map(); // team index -> {threat name: [calcLevel, realPts]}
for (let i = 0; i < used.length; i += 40) { const ch = used.slice(i, i + 40).map(t => [t, teams[t]]);
  const r = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{const out={};for(const [t,names] of ${JSON.stringify(ch)}){try{S.slots=names.map(n=>({n,a:null,lock:false}));fixSlots();const ms=members();if(ms.length!==6)continue;const RD=prepOf(ms);if(!RD||!RD.rows)continue;const o={};for(const r of RD.rows){const R=CH.realVs(r.t.n,ms);o[r.t.n]=[r.level,R?R.pts:null]}out[t]=o}catch(e){}}return JSON.stringify(out)})()`));
  for (const k in r) V.set(+k, r[k]); if (i % 400 === 0) process.stderr.write(`${i}/${used.length} teams\r`); }
await b.close(); fs.unlinkSync(page);
const base = n => n.replace(/-Mega.*$/, ''), rows = [], games = [];
for (const g of G) { const sides = []; for (const [me, op, y] of [[g[0], g[1], g[2]], [g[1], g[0], 1 - g[2]]]) { const v = V.get(me); if (!v) { sides.push(null); continue; } let sc = 0, sr = 0, n = 0;
    for (const o of teams[op]) { const hit = v[o] || v[base(o)]; if (!hit) continue; const [lv, pts] = hit; n++; sc += lv - 1.5; if (pts != null) sr += pts; rows.push({lv, pts, y}); }
    sides.push({sc, sr, n}); }
  if (sides[0] && sides[1]) games.push({dc: sides[0].sc - sides[1].sc, dr: sides[0].sr - sides[1].sr, y: g[2]}); }
const wr = S => S.length ? `${(S.reduce((a, x) => a + x.y, 0) / S.length * 100).toFixed(1)}% (${S.length})` : '—';
const real = p => p == null ? null : p >= 1.5 ? 'Fav' : p <= -1.5 ? 'Unf' : 'Even';
console.log(`${G.length} later games (Oct 27 - Nov 8), ${V.size} teams read, ${rows.length} threat rows`);
console.log('Calc verdict:  Beats it', wr(rows.filter(r => r.lv === 3)), '· Handles it', wr(rows.filter(r => r.lv === 2)), '· Shaky', wr(rows.filter(r => r.lv === 1)), '· No answer', wr(rows.filter(r => r.lv === 0)));
console.log('Real games:    Favoured', wr(rows.filter(r => real(r.pts) === 'Fav')), '· Even match', wr(rows.filter(r => real(r.pts) === 'Even')), '· Unfavoured', wr(rows.filter(r => real(r.pts) === 'Unf')));
const d1 = rows.filter(r => r.lv >= 2 && real(r.pts) === 'Unf'), d2 = rows.filter(r => r.lv <= 1 && real(r.pts) === 'Fav');
console.log(`Disagree, calc says handled but real games Unfavoured: won ${wr(d1)}  (calc right if above 50%)`);
console.log(`Disagree, calc says Shaky/No answer but real games Favoured: won ${wr(d2)}  (real games right if above 50%)`);
let q = 9; const boot = f => { const xs = []; for (let r = 0; r < 1000; r++) { let a = 0, n = 0; for (let k = 0; k < games.length; k++) { q = (q * 16807) % 2147483647; const x = games[q % games.length], s = f(x); if (s === 0) continue; n++; if ((s > 0) === (x.y === 1)) a++; } xs.push(a / n); } xs.sort((p, r) => p - r); return xs; };
for (const [lab, f] of [['calc sum', x => x.dc], ['real-games sum', x => x.dr]]) { const used = games.filter(x => f(x) !== 0), hit = used.filter(x => (f(x) > 0) === (x.y === 1)).length, bs = boot(f);
  console.log(`Per game, side with the better ${lab} wins: ${(hit / used.length * 100).toFixed(1)}% of ${used.length} games (95% ${(bs[25] * 100).toFixed(1)} to ${(bs[975] * 100).toFixed(1)})`); }
const both = games.filter(x => x.dc !== 0 && x.dr !== 0 && (x.dc > 0) !== (x.dr > 0)), rr = both.filter(x => (x.dr > 0) === (x.y === 1)).length;
console.log(`Games where the two sums point opposite ways: ${both.length}; real-games sum right in ${(rr / both.length * 100).toFixed(1)}%, calc right in ${(100 - rr / both.length * 100).toFixed(1)}%`);
