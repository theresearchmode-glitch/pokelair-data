// Focus plan f1-luck (Nov 10, from the outside review): are suggestion gains mostly "the luckiest of hundreds"?
// The site's own engine (planFixes on the built page) picks Suggestions 1-3 using a model trained on ONE half of the tournaments
// (even or odd events). The same before/after teams are then priced by the model trained on the OTHER half, which never saw
// the choice. If the picked gain mostly survives in the other half's model, the gain is real signal the model agrees on; if
// it mostly disappears, the pick was mostly noise that happened to look good (the optimizer's curse). Both directions.
// Control: a random legal one-swap of the same team, priced by both halves (shows how much the two halves agree on any swap).
// Can't see: real results (sugg-real.mjs does that); the other half is noisier than a full model, so some shrink is expected
// even for real gains (the random-swap control and the full-model numbers help read it).
// Usage: node experiments/luck-test.mjs <half0-model.json> <half1-model.json> [N=300] [out.json]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const MD = [JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))];
const N = +(process.argv[4] || 300), OUTF = process.argv[5] || null;
const L = rd('limitless.json'), base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const MT = rd('matches.json'), teamsArr = MT.teams.map(k => k.split('|'));
const tGames = new Map(); for (const g of MT.m) { if (g[2] === .5 || g[0] === g[1]) continue; for (const t of [g[0], g[1]]) tGames.set(t, (tGames.get(t) || 0) + 1); }
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pool = [...tGames.entries()].filter(([t, n]) => n >= 10 && teamsArr[t].length === 6).map(([t]) => t);
for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
const sample = pool.slice(0, N);
const page = ROOT + `app/luck-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
async function open(model) { const pg = await (await b.newContext()).newPage(), D = {...base, 'meta/model': model};
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(4000); return pg; }
const pages = [await open(MD[0]), await open(MD[1])];
const ev = async (pg, c) => JSON.parse(await pg.evaluate(c => window.__ev(c), c));
const setTeam = names => `S.slots=${JSON.stringify(names)}.map(n=>({n,a:null,lock:false}));fixSlots();`;
const grade = async (pg, names) => ev(pg, `(()=>{${setTeam(names)}const ms=members();return JSON.stringify(ms.length===6?gradeTeam(ms):null)})()`);
const rows = [];
try {
  for (const [k, ti] of sample.entries()) { const names = teamsArr[ti];
    for (const h of [0, 1]) { const pick = pages[h], price = pages[1 - h];
      let P; try { P = await ev(pick, `(()=>{${setTeam(names)}const ms=members();if(ms.length!==6)return JSON.stringify({err:'n'+ms.length});ui.pool='all';const P=planFixes(ms,suggestPool(),true);
        const pool=suggestPool().filter(p=>!ms.some(m=>m.p.n===p.n));let rs=null;for(let t=0;t<40&&!rs;t++){const p=pool[(${k * 7 + h}+t*13)%pool.length],i=(${k}+t)%6,nm=ms.map(m=>m.p.n);nm[i]=p.n;const bs=nm.map(n=>n.replace(/-Mega.*$/,''));if(nm.every(n=>byName.get(n))&&new Set(bs).size===6)rs=nm;}
        return JSON.stringify({gBase:P.gBase,top:P.slice(0,3).map(pl=>({names:pl.team.map(m=>m.p.n),g:pl._g,n:pl.ch.length})),rs})})()`); } catch (e) { P = {err: String(e).slice(0, 80)}; }
      if (P.err || P.gBase == null) { rows.push({ti, h, err: P.err || 'nobase'}); continue; }
      const row = {ti, h, gA: P.gBase, gB: await grade(price, names), sugg: []};
      for (const [r, s] of P.top.entries()) row.sugg.push({rank: r + 1, n: s.n, aA: s.g, aB: await grade(price, s.names)});
      if (P.rs) row.rand = {aA: await grade(pick, P.rs), aB: await grade(price, P.rs)};
      rows.push(row); }
    if ((k + 1) % 25 === 0) console.error(`${k + 1}/${sample.length}`);
  }
} finally { await b.close(); fs.unlinkSync(page); }
if (OUTF) fs.writeFileSync(OUTF, JSON.stringify(rows));
// summary: promised gain (picking half) vs the same change priced by the other half, with a 95% range by resampling teams
const ok = rows.filter(r => !r.err && r.gB != null);
function summ(lab, f) { const xs = ok.map(f).filter(x => x && x.every(v => v != null && isFinite(v))); if (xs.length < 15) { console.log(`${lab}: ${xs.length} (too few)`); return; }
  const m = (a, i) => a.reduce((s, x) => s + x[i], 0) / a.length, pa = m(xs, 0), pb = m(xs, 1); let q = 5; const bs = [];
  for (let r = 0; r < 1000; r++) { let s0 = 0, s1 = 0; for (let j = 0; j < xs.length; j++) { q = (q * 16807) % 2147483647; const x = xs[q % xs.length]; s0 += x[0]; s1 += x[1]; } bs.push([s0 / xs.length, s1 / xs.length]); }
  const lo = a => a.slice().sort((p, r) => p - r)[Math.floor(.025 * a.length)], hi = a => a.slice().sort((p, r) => p - r)[Math.floor(.975 * a.length)];
  const kept = bs.map(([a, c]) => c / a);
  console.log(`${lab.padEnd(34)} n ${String(xs.length).padStart(4)} · promised ${pa.toFixed(2)} (${lo(bs.map(x => x[0])).toFixed(2)} to ${hi(bs.map(x => x[0])).toFixed(2)}) · other half ${pb.toFixed(2)} (${lo(bs.map(x => x[1])).toFixed(2)} to ${hi(bs.map(x => x[1])).toFixed(2)}) · kept ${(pb / pa * 100).toFixed(0)}% (${(lo(kept) * 100).toFixed(0)} to ${(hi(kept) * 100).toFixed(0)}%)`); }
console.log(`\n${ok.length} team-directions (${sample.length} real teams with 10+ games, both halves picking). Score points.`);
const s1 = r => r.sugg[0] && [r.sugg[0].aA - r.gA, r.sugg[0].aB - r.gB];
summ('Suggestion 1, all', s1);
summ('Suggestions 1-3, all', r => r.sugg.length ? [r.sugg.reduce((s, x) => s + x.aA - r.gA, 0) / r.sugg.length, r.sugg.reduce((s, x) => s + x.aB - r.gB, 0) / r.sugg.length] : null);
for (const [lab, lo, hi] of [['Suggestion 1, start under 70', -1, 70], ['Suggestion 1, start 70-80', 70, 80], ['Suggestion 1, start 80+', 80, 101]]) summ(lab, r => r.gA >= lo && r.gA < hi ? s1(r) : null);
summ('Suggestion 1, one change', r => r.sugg[0] && r.sugg[0].n === 1 ? s1(r) : null);
summ('Suggestion 1, two changes', r => r.sugg[0] && r.sugg[0].n === 2 ? s1(r) : null);
summ('Random legal swap (control)', r => r.rand && r.rand.aA != null && r.rand.aB != null ? [r.rand.aA - r.gA, r.rand.aB - r.gB] : null);
console.log('Starting score, picking half vs other half: mean |gap|', (ok.reduce((s, r) => s + Math.abs(r.gA - r.gB), 0) / ok.length).toFixed(2));
