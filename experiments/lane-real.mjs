// Focus plan Part 3, f3-test check 3 (Nov 10): copy of sugg-real.mjs that also records each suggestion's lane (Fix / Small edge /
// Option, 36-lanes.js) and the number its card shows, then compares the shown number with the real neighbours' gain, per lane.
// Original purpose (Deep Check d5-sugg, Nov 9): do the site's suggestions move a team toward real teams that WIN MORE? A check the grade does not
// decide: real game results of the closest real teams (same 5 of 6 Pokémon, Megas counted as their base Pokémon).
// For a sample of real teams (all real teams with 10+ games, not just top cut, which are picked for winning), the site's
// Suggestion 1 is computed on the built page (app/dist/page.html, whole roster). Then, leaving the STARTING team out of both
// sides (a suggestion changes one Pokémon, so the starting team would otherwise count as its neighbour, with its own wins):
//   before = real win rate of the starting team's neighbours;  after = real win rate of the suggestion's neighbours.
// Neither side counts its own exact six. Both sides need 30+ neighbour games. Resampled by starting team (2000x) for a 95% range.
// What it can't see: whether the PLAYER wins more after the change (that's f4-win), sets/spreads, and teams with thin neighbourhoods.
// Usage: node experiments/lane-real.mjs [N=200] [outfile]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const N = +(process.argv[2] || 200), OUTF = process.argv[3] || null;
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const MT = rd('matches.json');
const base = n => n.replace(/-Mega.*$/, '');
const teamsArr = MT.teams.map(k => k.split('|')), baseSets = teamsArr.map(t => new Set(t.map(base)));
const tGames = new Map(); for (const g of MT.m) { if (g[2] === .5 || g[0] === g[1]) continue; for (const [t, w] of [[g[0], g[2]], [g[1], 1 - g[2]]]) { const a = tGames.get(t) || [0, 0]; a[0]++; a[1] += w; tGames.set(t, a); } }
const exactIdx = new Map(teamsArr.map((t, i) => [t.slice().sort().join('|'), i]));
// real win rate of the teams sharing 5+ of these 6 (base) Pokémon, leaving out the given team indices
const hood = (names, skip) => { const bs = new Set(names.map(base)); let ng = 0, nw = 0, nb = 0;
  for (let i = 0; i < baseSets.length; i++) { if (skip.has(i)) continue; let s = 0; for (const b of bs) if (baseSets[i].has(b)) s++; if (s >= 5) { const r = tGames.get(i); if (r) { nb++; ng += r[0]; nw += r[1]; } } }
  return {nb, ng, wr: ng ? nw / ng : null}; };
// sample: real teams with 10+ games, seeded shuffle (same sample every run)
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pool = [...tGames.entries()].filter(([, r]) => r[0] >= 10).map(([i]) => i);
for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
const sample = pool.slice(0, N);

const page = ROOT + `app/sugg-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
const ev = async c => JSON.parse(await pg.evaluate(c => window.__ev(c), c));
const rows = [];
try {
  for (const [k, ti] of sample.entries()) {
    const names = teamsArr[ti];
    let P; try { P = await ev(`(()=>{S.slots=${JSON.stringify(names)}.map(n=>({n,a:null,lock:false}));fixSlots();const ms=members();if(ms.length!==6)return JSON.stringify({err:'n'+ms.length});ui.pool='all';const P=planFixes(ms,suggestPool(),true);
      return JSON.stringify({gBase:P.gBase,top:P.slice(0,3).map(pl=>({names:pl.team.map(m=>m.p.n),ch:pl.ch.map(x=>(x.out?x.out.p.n:'(empty)')+' -> '+x.c.p.n),g:pl._g,why:(pl.gap&&pl.gap.why)||[],lane:pl._lane?pl._lane.k:null,shown:pl._lane?(pl._lane.k==='fix'?(pl._lane.fixes[0].pts||null):pl._lane.k==='swap'?pl._lane.real:null):null,fixk:pl._lane&&pl._lane.fixes?pl._lane.fixes[0].k:null})),nothing:!!P.nothing})})()`); } catch (e) { P = {err: String(e).slice(0, 80)}; }
    const row = {ti, names, own: tGames.get(ti), err: P.err || null, gBase: P.gBase ?? null, sugg: []};
    if (!P.err) { const skipT = new Set([ti]), before = hood(names, skipT);
      row.before = before;
      for (const [r, s] of (P.top || []).entries()) { const sx = exactIdx.get(s.names.slice().sort().join('|')), skip = new Set([ti]); if (sx != null) skip.add(sx);
        row.sugg.push({rank: r + 1, ch: s.ch, g: s.g, check: s.why.some(w => /check/.test(w)), lane: s.lane, shown: s.shown, fixk: s.fixk, after: hood(s.names, skip)}); } }
    rows.push(row);
    if ((k + 1) % 20 === 0) console.error(`${k + 1}/${sample.length}`);
  }
} finally { await b.close(); fs.unlinkSync(page); }
if (OUTF) fs.writeFileSync(OUTF, JSON.stringify(rows));

// ---------- results ----------
const boot = (d, it = 2000) => { const m = d.reduce((a, x) => a + x, 0) / d.length; const ms = []; let s2 = 11;
  for (let i = 0; i < it; i++) { let t = 0; for (let j = 0; j < d.length; j++) { s2 = (s2 * 16807) % 2147483647; t += d[s2 % d.length]; } ms.push(t / d.length); }
  ms.sort((a, b) => a - b); return {m, lo: ms[Math.floor(it * .025)], hi: ms[Math.floor(it * .975)], n: d.length}; };
const pct = x => (x * 100).toFixed(1);
console.log(`${rows.length} real starting teams (10+ games each), ${rows.filter(r => r.err).length} errors, ${rows.filter(r => !r.err && !r.sugg.length).length} with no suggestion`);
for (const [lab, pick] of [['Suggestion 1', r => r.sugg.filter(s => s.rank === 1)], ['Suggestions 1-3', r => r.sugg], ['grade-raising (not check fixes), rank 1', r => r.sugg.filter(s => s.rank === 1 && !s.check)]]) {
  const d = [], dg = []; for (const r of rows) { if (r.err || !r.before || r.before.ng < 30) continue; for (const s of pick(r)) { if (s.after.ng < 30) continue; d.push(s.after.wr - r.before.wr); if (s.g != null && r.gBase != null) dg.push(s.g - r.gBase); } }
  if (!d.length) { console.log(`${lab}: no pairs with 30+ games on both sides`); continue; }
  const B = boot(d), G = dg.length ? dg.reduce((a, x) => a + x, 0) / dg.length : null;
  console.log(`${lab}: ${B.n} pairs · closest real teams' win rate after minus before ${B.m >= 0 ? '+' : ''}${pct(B.m)} pts (95% range ${pct(B.lo)} to ${pct(B.hi)}) · grade change shown ${G == null ? '—' : (G >= 0 ? '+' : '') + G.toFixed(1)}` +
    ` · ${B.lo > 0 ? 'HELPS beyond chance' : B.hi < 0 ? 'HURTS beyond chance' : 'within chance (unknown)'}`); }

// ---------- per lane (Part 3): the number the card shows vs the closest real teams' change, both in win-chance points ----------
console.log(`\n# lanes: ${rows.filter(r => !r.err && r.nothing).length} of ${rows.filter(r => !r.err).length} teams get "Nothing to fix"`);
for (const lane of ['fix', 'swap', 'option']) for (const rk of [1, null]) {
  const d = [], sh = []; for (const r of rows) { if (r.err || !r.before || r.before.ng < 30) continue; for (const s of r.sugg) { if (s.lane !== lane || (rk && s.rank !== rk) || s.after.ng < 30) continue; d.push(s.after.wr - r.before.wr); if (s.shown != null) sh.push(s.shown); } }
  if (d.length < 10) { console.log(`${lane}${rk ? ' rank 1' : ' all'}: ${d.length} pairs (too few to tell)`); continue; }
  const B = boot(d), S = sh.length ? sh.reduce((a, x) => a + x, 0) / sh.length : null;
  console.log(`${lane}${rk ? ' rank 1' : ' all'}: ${B.n} pairs · real ${B.m >= 0 ? '+' : ''}${pct(B.m)} pts (95% ${pct(B.lo)} to ${pct(B.hi)}) · card shows ${S == null ? 'no number' : '+' + S.toFixed(1)}`); }
