// Deep Check Step 3, v2 (Nov 8), rebuilt after the independent review (docs/deep-check.md "Independent review").
// Single games WITH TEAM SHEETS: each game of Showdown's best-of-3 Champions format (out/replays_bo3.json, forced open team
// sheets), so every factor is read from the real sets, not guessed. Never used to train the grade.
// - each side is graded exactly as the page grades an imported team (parsePaste -> members -> strengthX), the Mega form
//   comes from the Mega Stone on the sheet (not from what happened in the game)
// - one JOINT logistic model: win ~ k·(grade gap) + Σ b·(factor gap) + the 15 most common Pokémon, so a factor can't take
//   credit for the Pokémon that usually carries it
// - ± ranges grouped by team (two-way cluster-robust by each side's six); a factor counts only past a strict bar (|z| > 3,
//   because ~20 factors are tested at once), and too few games = "unknown"
// - also a split by TEAM (each six in one half only) instead of by date
// Usage: node app/build.mjs && node experiments/deep-factors2.mjs [games.json]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const SRC = process.argv[2] || OUT + 'replays_bo3.json';
// LADDER=1: ladder replays (no team sheets). Each side becomes its six base species with typical sets and NO Mega
// information (what shows in a replay depends on how the game went), and the rating gap is an extra input.
const LADDER = process.env.LADDER === '1';
const R = JSON.parse(fs.readFileSync(SRC, 'utf8')).games.map(g => LADDER && g.p ? {...g, s: g.p.map(t => t.map(n => ({n: n.replace(/-Mega.*$/, ''), i: '', a: '', mv: [], nt: ''})))} : g)
  .filter(g => g.s && g.s[0].length === 6 && g.s[1].length === 6 && (g.w === 0 || g.w === 1));
const L = rd('limitless.json'), D = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + `app/df2-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await (await b.newContext()).newPage();
await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
await pg.goto('file://' + page); await pg.waitForTimeout(4000);
// a side's team sheet as Showdown paste text (the page's own importer then reads it)
const paste = s => s.map(x => `${x.n}${x.i ? ' @ ' + x.i : ''}\n${x.a ? 'Ability: ' + x.a + '\n' : ''}${x.nt ? x.nt + ' Nature\n' : ''}${x.mv.map(m => '- ' + m).join('\n')}`).join('\n\n');
const sideKey = s => s.map(x => [x.n, x.i, x.a, [...x.mv].sort().join(',')].join('/')).sort().join('|');
const sides = new Map(); for (const g of R) for (const s of g.s) sides.set(sideKey(s), paste(s));
const code = ch => `(()=>{const o={};const PRI=new Set(['Sucker Punch','Extreme Speed','Aqua Jet','Grassy Glide','Bullet Punch','Ice Shard','Shadow Sneak','Mach Punch','Quick Attack','Vacuum Wave','Jet Punch','First Impression','Accelerock','Thunderclap']);
 const WX=new Set(['Drought','Drizzle','Sand Stream','Snow Warning']);const SPREAD=new Set(Object.values(MV).filter(m=>m&&m.spread&&m.cat!=='Status').map(m=>m.name));
 for(const [k,txt] of ${JSON.stringify(ch)}){try{const P=parsePaste(txt);if(P.slots.length!==6)continue;S.slots=P.slots;const ms=members();if(ms.length!==6)continue;const ns=ms.map(m=>m.p.n);
  const x=strengthX(ns,ms).xRaw;const mv=ms.map(m=>(m.moves||[]).map(z=>z&&(z.name||z)).filter(Boolean));const has=n=>mv.some(L=>L.includes(n));const cnt=n=>mv.filter(L=>L.includes(n)).length;
  const phys=ms.filter(m=>m.p.st&&m.p.st[1]>m.p.st[3]).length;const wx=new Set(ms.map(m=>m.ability).filter(a=>WX.has(a)));const megas=ms.filter(m=>m.p.m).length;
  o[k]=[x,ns,{
   'no Mega Stone':megas===0?1:0,'two or more Mega Stones':megas>=2?1:0,
   'Fake Out':has('Fake Out')?1:0,'two Fake Out users':cnt('Fake Out')>=2?1:0,'Intimidate':ms.some(m=>m.ability==='Intimidate')?1:0,
   'redirection (Follow Me / Rage Powder)':has('Follow Me')||has('Rage Powder')?1:0,'Tailwind':has('Tailwind')?1:0,'Trick Room':has('Trick Room')?1:0,
   'Tailwind AND Trick Room':has('Tailwind')&&has('Trick Room')?1:0,'no Tailwind or Trick Room':!has('Tailwind')&&!has('Trick Room')?1:0,
   'Icy Wind / Electroweb':has('Icy Wind')||has('Electroweb')?1:0,'priority attack':mv.some(L=>L.some(n=>PRI.has(n)))?1:0,
   'Wide Guard':has('Wide Guard')?1:0,'Protect on 4+':cnt('Protect')>=4?1:0,'Protect on 2 or fewer':cnt('Protect')<=2?1:0,
   'spread attack on 3+':mv.filter(L=>L.some(n=>SPREAD.has(n))).length>=3?1:0,'5+ physical attackers':phys>=5?1:0,
   'two weather setters':wx.size>=2?1:0,'Choice Scarf':ms.some(m=>/Choice Scarf/.test(m.item||m.heldItem||''))?1:0,
   'Focus Sash':ms.some(m=>/Focus Sash/.test(m.item||m.heldItem||''))?1:0}]}catch(e){}}return JSON.stringify(o)})()`;
const F = {}, all = [...sides];
for (let i = 0; i < all.length; i += 100) Object.assign(F, JSON.parse(await pg.evaluate(c => window.__ev(c), code(all.slice(i, i + 100)))));
await b.close(); fs.unlinkSync(page);
const G = R.map(g => { const A = F[sideKey(g.s[0])], B = F[sideKey(g.s[1])]; if (!A || !B) return null; return {z: A[0] - B[0], rg: LADDER && g.r && g.r[0] && g.r[1] ? (g.r[0] - g.r[1]) / 100 : 0, y: g.w === 0 ? 1 : 0, A, B, ka: A[1].slice().sort().join('|'), kb: B[1].slice().sort().join('|')}; }).filter(Boolean);
const FN = Object.keys(Object.values(F)[0][2]).filter(f => !LADDER || !/Mega/.test(f));
// the 15 most common Pokémon as their own inputs
const cnt = new Map(); for (const d of G) for (const n of [...d.A[1], ...d.B[1]]) { const base = n.replace(/-Mega.*$/, ''); cnt.set(base, (cnt.get(base) || 0) + 1); }
const TOP = [...cnt].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([n]) => n);
const hasMon = (s, n) => s[1].some(x => x.replace(/-Mega.*$/, '') === n) ? 1 : 0;
const sig = z => 1 / (1 + Math.exp(-z));
// design: [grade gap, factor gaps..., top-Pokémon gaps...]
const X = d => [d.z, ...(LADDER ? [d.rg] : []), ...FN.map(f => d.A[2][f] - d.B[2][f]), ...TOP.map(n => hasMon(d.A, n) - hasMon(d.B, n))];
function fitJoint(rows) { const p = X(rows[0]).length, w = new Float64Array(p), lam = 1;
  for (let it = 0; it < 25; it++) { const g = new Float64Array(p), H = Array.from({length: p}, () => new Float64Array(p));
    for (const d of rows) { const x = X(d), q = sig(x.reduce((s, v, j) => s + v * w[j], 0)); for (let a = 0; a < p; a++) { g[a] += (d.y - q) * x[a]; for (let c = 0; c < p; c++) H[a][c] += q * (1 - q) * x[a] * x[c]; } }
    for (let a = 1; a < p; a++) { g[a] -= lam * w[a]; H[a][a] += lam; }
    const step = solve(H, g); for (let a = 0; a < p; a++) w[a] += step[a]; }
  // two-way cluster-robust covariance by each side's six: V = Hinv (M_A + M_B − M_AB) Hinv
  const H = Array.from({length: p}, () => new Float64Array(p)); const byA = new Map(), byB = new Map(), byAB = new Map();
  for (const d of rows) { const x = X(d), q = sig(x.reduce((s, v, j) => s + v * w[j], 0)); for (let a = 0; a < p; a++) for (let c = 0; c < p; c++) H[a][c] += q * (1 - q) * x[a] * x[c];
    const sc = x.map(v => (d.y - q) * v); for (const [M, k] of [[byA, d.ka], [byB, d.kb], [byAB, d.ka + '#' + d.kb]]) { const t = M.get(k) || new Float64Array(p); for (let a = 0; a < p; a++) t[a] += sc[a]; M.set(k, t); } }
  for (let a = 1; a < p; a++) H[a][a] += lam;
  const meat = Array.from({length: p}, () => new Float64Array(p)); for (const [M, sgn] of [[byA, 1], [byB, 1], [byAB, -1]]) for (const t of M.values()) for (let a = 0; a < p; a++) for (let c = 0; c < p; c++) meat[a][c] += sgn * t[a] * t[c];
  const Hi = inv(H), V = mul(mul(Hi, meat), Hi); return {w, se: [...Array(p)].map((_, j) => Math.sqrt(Math.max(V[j][j], 0))), n: rows.length}; }
function solve(A, b) { const n = b.length, M = A.map((r, i) => [...r, b[i]]); for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[m][i])) m = r; [M[i], M[m]] = [M[m], M[i]]; const pv = M[i][i] || 1e-12; for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / pv; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; } } return M.map((r, i) => r[n] / (r[i] || 1e-12)); }
function inv(A) { const n = A.length; return [...Array(n)].map((_, j) => solve(A, [...Array(n)].map((_, i) => +(i === j)))).reduce((acc, col, j) => { col.forEach((v, i) => { acc[i][j] = v; }); return acc; }, [...Array(n)].map(() => new Array(n).fill(0))); }
function mul(A, B) { return A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0))); }
// split by team: a game goes to a half only if both sixes hash to that half
const h = s => { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x % 2; };
const half = [G.filter(d => h(d.ka) === 0 && h(d.kb) === 0), G.filter(d => h(d.ka) === 1 && h(d.kb) === 1)];
const pts = v => (sig(v) - .5) * 100, prev = f => (G.filter(d => d.A[2][f]).length + G.filter(d => d.B[2][f]).length) / (2 * G.length) * 100;
const acc = G.filter(d => (d.z > 0) === !!d.y && d.z !== 0).length / G.filter(d => d.z !== 0).length;
console.log(`${G.length} single games with team sheets (${SRC.split('/').pop()}), ${Object.keys(F).length} distinct sheets; the grade picks the winner ${(acc * 100).toFixed(1)}%`);
const J = fitJoint(G), H0 = half[0].length > 200 ? fitJoint(half[0]) : null, H1 = half[1].length > 200 ? fitJoint(half[1]) : null;
console.log(`grade confidence that fits these games: ${J.w[0].toFixed(2)} ±${(1.96 * J.se[0]).toFixed(2)} (page uses ${(+rd('model.json').calib).toFixed(2)})`);
console.log(`\neffect of each factor BEYOND the grade, all fitted together, in win-chance points (± = 95% range grouped by team); halves split by team (${half[0].length} / ${half[1].length} games)`);
if (LADDER) console.log(`rating gap: ${pts(J.w[1]).toFixed(1)} win-chance pts per 100 rating`);
const OFF = LADDER ? 2 : 1;
FN.forEach((f, i) => { const j = i + OFF, e = pts(J.w[j]), r = pts(1.96 * J.se[j]), zz = J.w[j] / (J.se[j] || 1e9), share = prev(f);
  const v = share < 3 || share > 97 ? 'too few teams differ to tell' : Math.abs(zz) > 3 ? (e > 0 ? 'GRADE UNDERRATES IT' : 'GRADE OVERRATES IT') : Math.abs(zz) > 1.96 ? 'leaning, not proven' : 'not proven either way';
  const hs = [H0, H1].map(H => H ? (pts(H.w[j]) >= 0 ? '+' : '') + pts(H.w[j]).toFixed(1) : '—').join(' / ');
  console.log(`  ${f.padEnd(40)} on ${share.toFixed(0).padStart(3)}% of teams   ${(e >= 0 ? '+' : '') + e.toFixed(1)} ±${r.toFixed(1)}   halves ${hs}   ${v}`); });
console.log('\npopular Pokémon beyond the grade (context): ' + TOP.map((n, i) => `${n} ${(pts(J.w[OFF + FN.length + i]) >= 0 ? '+' : '') + pts(J.w[OFF + FN.length + i]).toFixed(1)}`).join(', '));
