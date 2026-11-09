// Do the site's team checks predict winning? (Sim, Nov 9: "fake out is not something that is 100% essential for a team.
// There's plenty of teams that win without fake out right")
// Every real team sheet in out/matches.json (moves, items, Abilities) is loaded the way the site loads a team (memberOf) and
// judged by the site's own proChecks on the built page (app/dist/page.html). Then, on real tournament games:
//   1. head to head: games where one side passes a check and the other fails it; win rate of the side that passes;
//   2. skill-adjusted: one logistic fit of all checks together plus each player's skill (ridge), so a strong player's wins don't
//      count for their team's checks, and checks that come together (Mega and threats, say) are separated.
// Ranges: games resampled by tournament (1000x). What it can't see: whether a check matters for teams our tools build (those
// aren't in real games), and effects smaller than its range.
// Usage: node experiments/checks-real.mjs [outdir]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const DIR = process.argv[2] || '/tmp/checks-real'; fs.mkdirSync(DIR, {recursive: true});
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const MT = rd('matches.json'), teams = MT.teams.map(k => k.split('|'));
const G0 = MT.m.filter(g => g[2] !== .5 && g[0] !== g[1] && g[7] != null && g[8] != null);
// each deck's six (from the games it played) and its sheet: moves, item, Ability per Pokémon
const deckTeam = new Map(); for (const g of G0) { deckTeam.set(g[7], g[0]); deckTeam.set(g[8], g[1]); }
const sheet = d => { const t = teams[deckTeam.get(d)], by = new Map(t.map(n => [n, {n, mv: [], i: null, a: null}]));
  for (const fi of MT.decks[d] || []) { const f = MT.feats[fi], m = f.match(/^(.+?)([:@#])(.+)$/); if (!m || !by.has(m[1])) continue; const o = by.get(m[1]);
    if (m[2] === ':') o.mv.push(m[3]); else if (m[2] === '@') o.i = m[3]; else o.a = m[3]; }
  return [...by.values()]; };
const decks = [...deckTeam.keys()].slice(0, +(process.env.CK_LIMIT || 1e9)); // CK_LIMIT=n: trial on the first n sheets
const DSET = new Set(decks), G = G0.filter(g => DSET.has(g[7]) && DSET.has(g[8]));
let CK; const CKF = DIR + '/checks.json';
if (fs.existsSync(CKF) && process.env.REUSE === '1') CK = JSON.parse(fs.readFileSync(CKF, 'utf8'));
else {
  const page = ROOT + `app/checks-${process.pid}.html`;
  fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
  const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(4000);
  // Mega goal 1 (the site's default question "does it have a Mega?")
  await pg.evaluate(c => window.__ev(c), `S.megaGoal=1;S.maxMega=2;window.__CK=sh=>{try{const ms=sh.map((m,i)=>{const p=byName.get(m.n);if(!p)return null;const mv=m.mv.filter(x=>mvByName.has(x)).slice(0,4);
    return memberOf({n:m.n,a:p.a.includes(m.a)?m.a:null,lock:false,...(mv.length?{mv:{doubles:mv}}:{}),...(!p.m&&m.i?{it:{doubles:m.i}}:{})},i)}).filter(Boolean);
    if(ms.length!==6)return null;const c=proChecks(ms,true);const o={};for(const x of c.items){if(x.skip)continue;o[x.k]=x.ok?1:x.part?.5:0}return o}catch(e){return {err:String(e).slice(0,60)}}};'1'`);
  CK = {}; const B = 200;
  try { for (let s = 0; s < decks.length; s += B) { const part = decks.slice(s, s + B), sh = part.map(sheet);
      const r = JSON.parse(await pg.evaluate(a => JSON.stringify(a.map(x => window.__CK(x))), sh)); part.forEach((d, i) => { CK[d] = r[i]; });
      console.error(`checks ${Math.min(s + B, decks.length)}/${decks.length}`); } }
  finally { await b.close(); fs.unlinkSync(page); }
  fs.writeFileSync(CKF, JSON.stringify(CK));
}
const KEYS = ['speed', 'spread', 'fake', 'mega', 'stack', 'w3', 'reach', 'items'], LAB = {speed: 'Speed control', spread: 'Spread damage', fake: 'Lead support', mega: 'Mega Evolution', stack: 'No major weak spot', w3: 'Weak spots spread out', reach: 'Ready for the top threats', items: 'Items work'};
const ok = (d, k) => { const c = CK[d]; return c && !c.err && c[k] != null ? c[k] : null; };
const errs = Object.values(CK).filter(c => !c || c.err).length;
const evs = [...new Set(G.map(g => g[3]))];
const bootEv = (stat, it = 1000) => { const by = new Map(); G.forEach((g, i) => { (by.get(g[3]) || by.set(g[3], []).get(g[3])).push(i); }); const out = []; let s = 5;
  for (let k = 0; k < it; k++) { const idx = []; for (let j = 0; j < evs.length; j++) { s = (s * 16807) % 2147483647; idx.push(...by.get(evs[s % evs.length])); } out.push(stat(idx)); }
  out.sort((a, b) => a - b); return [out[Math.floor(it * .025)], out[Math.floor(it * .975)]]; };
let rep = `# Team checks vs real games (${G.length} games, ${decks.length} team sheets, ${errs} sheets not loadable)\n\n`;
rep += `| check | teams passing | head to head: games | side that passes wins | 95% range (by tournament) |\n|---|---|---|---|---|\n`;
const h2h = {};
for (const k of KEYS) { const pass = decks.filter(d => ok(d, k) === 1).length, known = decks.filter(d => ok(d, k) != null).length;
  const stat = idx => { let n = 0, w = 0; for (const i of idx) { const g = G[i], a = ok(g[7], k), b = ok(g[8], k); if (a == null || b == null || a === b || (a !== 1 && a !== 0) || (b !== 1 && b !== 0)) continue; n++; w += a === 1 ? g[2] : 1 - g[2]; } return n ? w / n : NaN; };
  const all = [...G.keys()], n = all.filter(i => { const a = ok(G[i][7], k), b = ok(G[i][8], k); return a != null && b != null && a !== b && (a === 1 || a === 0) && (b === 1 || b === 0); }).length;
  const p = stat(all), [lo, hi] = n ? bootEv(stat) : [NaN, NaN]; h2h[k] = {pass, known, n, p, lo, hi};
  rep += `| ${LAB[k]} | ${known ? Math.round(pass / known * 100) : '—'}% | ${n} | ${n ? (p * 100).toFixed(1) + '%' : '—'} | ${n ? (lo * 100).toFixed(1) + ' to ' + (hi * 100).toFixed(1) : '—'} |\n`; }
// skill-adjusted joint fit: P(A wins) = σ(Σ β_k (cA_k − cB_k) + sA − sB), ridge on skills (λs) and a light one on β
const nP = MT.players, K = KEYS.length;
const rows = G.map(g => { const x = KEYS.map(k => { const a = ok(g[7], k), b = ok(g[8], k); return a == null || b == null ? 0 : a - b; }); return {x, pa: g[4], pb: g[5], r: g[2], ev: g[3]}; });
const fitJoint = (idx, LS = 1, LB = .01, it = 400) => { const beta = new Float64Array(K), s = new Float64Array(nP), mb = new Float64Array(K), vb = new Float64Array(K), ms = new Float64Array(nP), vs = new Float64Array(nP); const lr = .05, b1 = .9, b2 = .999;
  for (let t = 1; t <= it; t++) { const gb = new Float64Array(K), gs = new Float64Array(nP);
    for (const i of idx) { const R = rows[i]; let e = R.x.reduce((a, v, j) => a + v * beta[j], 0) + s[R.pa] - s[R.pb]; const p = 1 / (1 + Math.exp(-e)), d = p - R.r; for (let j = 0; j < K; j++) gb[j] += d * R.x[j]; gs[R.pa] += d; gs[R.pb] -= d; }
    const n = idx.length; for (let j = 0; j < K; j++) { const g = gb[j] / n + LB * beta[j]; mb[j] = b1 * mb[j] + (1 - b1) * g; vb[j] = b2 * vb[j] + (1 - b2) * g * g; beta[j] -= lr * (mb[j] / (1 - b1 ** t)) / (Math.sqrt(vb[j] / (1 - b2 ** t)) + 1e-8); }
    for (let j = 0; j < nP; j++) { if (!gs[j] && !s[j]) continue; const g = gs[j] / n + LS * s[j] / n; ms[j] = b1 * ms[j] + (1 - b1) * g; vs[j] = b2 * vs[j] + (1 - b2) * g * g; s[j] -= lr * (ms[j] / (1 - b1 ** t)) / (Math.sqrt(vs[j] / (1 - b2 ** t)) + 1e-8); } }
  return [...beta]; };
const allIdx = [...rows.keys()]; const B0 = fitJoint(allIdx);
const BS = []; { const by = new Map(); rows.forEach((R, i) => { (by.get(R.ev) || by.set(R.ev, []).get(R.ev)).push(i); }); let sd = 9;
  for (let k = 0; k < 100; k++) { const idx = []; for (let j = 0; j < evs.length; j++) { sd = (sd * 16807) % 2147483647; idx.push(...by.get(evs[sd % evs.length])); } BS.push(fitJoint(idx, 1, .01, 200)); console.error(`skill-adjusted resample ${k + 1}/100`); } }
rep += `\nSkill-adjusted, all checks together (each player's skill fitted alongside; 100 resamples by tournament):\n\n| check | effect of passing (win-chance points vs an even game) | 95% range | verdict |\n|---|---|---|---|\n`;
const toPts = b => (1 / (1 + Math.exp(-b)) - .5) * 100; const adj = {};
KEYS.forEach((k, j) => { const v = BS.map(b => b[j]).sort((a, b) => a - b), lo = v[2], hi = v[97]; adj[k] = {beta: B0[j], lo, hi};
  rep += `| ${LAB[k]} | ${toPts(B0[j]) >= 0 ? '+' : ''}${toPts(B0[j]).toFixed(1)} | ${toPts(lo).toFixed(1)} to ${toPts(hi).toFixed(1)} | ${lo > 0 ? 'helps beyond chance' : hi < 0 ? 'hurts beyond chance' : 'within chance (unknown)'} |\n`; });
fs.writeFileSync(DIR + '/report.md', rep); fs.writeFileSync(DIR + '/summary.json', JSON.stringify({h2h, adj, games: G.length, decks: decks.length, errs}));
console.log(rep);
