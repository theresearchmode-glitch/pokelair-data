// Deep Check, Plans step d3-break (Nov 8): the "broken-team tests". Take strong REAL tournament teams, remove one basic at a
// time (Mega; speed control; Tailwind/Trick Room only; turn-1 support; Fake Out; Intimidate; Protect on most; spread damage),
// grade the original and the broken six with the page's own grade (CH.gradeOf in the built page), and compare the drop with
// what real tournament rounds say that basic is worth. A test only counts if it could have failed: if the grade barely moves
// while real teams lacking the basic lose much more, the grade is "too soft" for that basic.
//   grade side   out/model.json (as shipped), the built page app/dist/page.html (not rebuilt here)
//   real side    out/matches_dev.json (no sealed games), each side's own team sheet; best-of-1 / best-of-3 per round from
//                data/tour-modes.json. Two estimates per basic:
//                (1) WORTH: joint logistic over all rounds, win ~ player skill gap (each player's record in OTHER events)
//                    + every "lacks basic" flag at once. What lacking it costs, head to head vs a side that has it.
//                (2) BEYOND THE GRADE: later rounds only (from 2026-10-27), win ~ k·(grade gap from the page with
//                    out/model_dev_site.json, trained only on earlier games) + skill gap (earlier games) + flags. ~0 = the
//                    grade already prices real teams lacking it; negative = the grade is too soft on them.
//                ± = 95% ranges grouped by team (two-way cluster-robust by each side's six).
// Usage: node experiments/broken-teams.mjs [out.json]
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), OUT = ROOT + 'out/', rd = f => JSON.parse(fs.readFileSync(OUT + f, 'utf8'));
const M = rd('matches_dev.json'), MODES = JSON.parse(fs.readFileSync(ROOT + 'data/tour-modes.json', 'utf8'));
const teams = M.teams.map(k => k.split('|')), FROM = '2026-10-27';
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1] && teams[g[0]].length === 6 && teams[g[1]].length === 6 && g[7] != null && g[8] != null);
const modeOf = g => { const P = MODES[M.events[g[3]][0]]; if (!P) return '?'; let r = 0; for (const [, n, md] of P) { r += n; if (g[6] <= r) return md; } return P[P.length - 1][2]; };
// a side's sheet: names + {item, moves} per Pokémon (decks hold items and moves; no Abilities)
const sheetOf = (t, d) => { const set = {}; for (const n of teams[t]) set[n] = {it: null, ab: null, mv: []};
  for (const f of (M.decks[d] || []).map(f => M.feats[f])) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m || !set[m[1]]) continue; if (m[2] === '@') set[m[1]].it = m[3]; else if (m[2] === '#') set[m[1]].ab = m[3]; else set[m[1]].mv.push(m[3]); }
  return {ns: teams[t], set}; };
// ---- the page
const L = rd('limitless.json'), base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json')};
const page = ROOT + `app/bt-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const browser = await chromium.launch();
async function openPage(model) { const D = {...base, 'meta/model': model}, pg = await (await browser.newContext()).newPage();
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(4000); return pg; }
const ev = (pg, c) => pg.evaluate(c => window.__ev(c), c).then(JSON.parse);
// grade a list of sheets exactly as site-board.mjs does (the six's real items/moves; Ability only when the sheet has one)
const GRADE = list => `(()=>{const out=[];for(const T of ${JSON.stringify(list)}){try{const ps=T.ns.map(n=>byName.get(n));if(ps.some(p=>!p)){out.push(null);continue}
  const ms=ps.map(p=>{const s=T.set[p.n]||{},m=abMember(p),mv=(s.mv||[]).map(x=>mvByName.get(x)).filter(Boolean);return {...m,...(s.it&&!p.m?{item:s.it,heldItem:s.it}:{}),...(s.ab?{ability:s.ab,abChosen:true}:{}),...(mv.length?{moves:mv,_mv:mv,custom:true}:{})}});
  const RD=THR.teamReport(ms),Gr=CH.gradeOf(RD,proChecks(ms,true),ms),st=Gr&&Gr.st;if(!st){out.push(null);continue}const d6=st.six?st.six.d:0;
  out.push({s:Gr.s,e:st.e,y:st.y,x0:strengthX(T.ns,ms).x0,ready:RD?RD.score:null,six:d6,sixG:st.six?st.six.g:0,s0:strengthPct(st.y-d6),e0:CH.fieldWin(st.y-d6),letter:Gr.letter,miss:(Gr.miss||[]).map(x=>x.k)})}catch(e){out.push({err:String(e.message).slice(0,80)})}}return JSON.stringify(out)})()`;
async function gradeAll(pg, list, step = 40) { const r = []; for (let i = 0; i < list.length; i += step) r.push(...await ev(pg, GRADE(list.slice(i, i + step)))); return r; }
const pg = await openPage(rd('model.json'));
// page facts: default Ability and Ability list per species, move facts
const allN = [...new Set(teams.flat())];
const INFO = await ev(pg, `(()=>{const ab={};for(const n of ${JSON.stringify(allN)}){const p=byName.get(n);if(!p)continue;ab[n]={def:abMember(p).ability,all:p.a||[],mega:!!p.m,base:p.b||p.n}}
  const mv={};for(const m of Object.values(MV))if(m&&m.name)mv[m.name]={bp:m.bp,cat:m.cat,spread:!!m.spread,pr:m.pr||0};return JSON.stringify({ab,mv})})()`);
// ---- the basics, read the same way on both sides
const PROT = new Set(['Protect', 'Detect', 'Spiky Shield', "King's Shield", 'Baneful Bunker', 'Silk Trap', 'Burning Bulwark', 'Obstruct']);
const SPEEDMV = new Set(['Tailwind', 'Trick Room', 'Icy Wind', 'Electroweb', 'Thunder Wave', 'Bulldoze', 'Rock Tomb', 'Scary Face', 'Glaciate', 'String Shot', 'Cotton Spore']);
const isPri = n => { const m = INFO.mv[n]; return !!m && m.pr > 0 && m.bp > 0 && n !== 'Fake Out'; };
const isSpread = n => { const m = INFO.mv[n]; return !!m && m.spread && m.bp > 0; };
const isSpeed = n => SPEEDMV.has(n) || isPri(n), isTWTR = n => n === 'Tailwind' || n === 'Trick Room', isT1mv = n => n === 'Fake Out' || n === 'Follow Me' || n === 'Rage Powder';
const abOf = (T, n) => T.set[n].ab || (INFO.ab[n] || {}).def;
const FLAGS = {
  'no Mega': T => T.ns.some(n => (INFO.ab[n] || {}).mega) ? 0 : 1,
  'no speed control (any)': T => T.ns.some(n => T.set[n].mv.some(isSpeed) || T.set[n].it === 'Choice Scarf') ? 0 : 1,
  'no Tailwind or Trick Room': T => T.ns.some(n => T.set[n].mv.some(isTWTR)) ? 0 : 1,
  'no turn-1 support (Fake Out, Intimidate, redirection)': T => T.ns.some(n => T.set[n].mv.some(isT1mv) || abOf(T, n) === 'Intimidate') ? 0 : 1,
  'no Fake Out': T => T.ns.some(n => T.set[n].mv.includes('Fake Out')) ? 0 : 1,
  'no Intimidate': T => T.ns.some(n => abOf(T, n) === 'Intimidate') ? 0 : 1,
  'Protect on 2 or fewer': T => T.ns.filter(n => T.set[n].mv.some(x => PROT.has(x))).length <= 2 ? 1 : 0,
  'no spread damage': T => T.ns.some(n => T.set[n].mv.some(isSpread)) ? 0 : 1,
};
const FN = Object.keys(FLAGS);
// ---- usage on real sheets: each species' moves and items by how often they're run; each species' most common complete set
const mvUse = new Map(), itUse = new Map(), setUse = new Map(), seenTD = new Set();
for (const g of G) for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) { const k = t + ':' + d; if (seenTD.has(k)) continue; seenTD.add(k); const T = sheetOf(t, d);
  for (const n of T.ns) { const s = T.set[n]; const a = mvUse.get(n) || new Map(); for (const x of s.mv) a.set(x, (a.get(x) || 0) + 1); mvUse.set(n, a);
    if (s.it) { const b = itUse.get(n) || new Map(); b.set(s.it, (b.get(s.it) || 0) + 1); itUse.set(n, b); }
    const c = setUse.get(n) || new Map(), sk = JSON.stringify([s.it, [...s.mv].sort()]); c.set(sk, (c.get(sk) || 0) + 1); setUse.set(n, c); } }
const byUse = m => [...(m || new Map())].sort((a, b) => b[1] - a[1]).map(([x]) => x);
// replace the moves `bad` flags with that species' next most common moves that aren't flagged; returns the changed moves
function stripMoves(T, bad, onlyFor) { const ch = []; for (const n of T.ns) { if (onlyFor && !onlyFor.includes(n)) continue; const s = T.set[n], keep = s.mv.filter(x => !bad(x)); if (keep.length === s.mv.length) continue;
    const fill = byUse(mvUse.get(n)).filter(x => !bad(x) && !keep.includes(x)); const out = [...keep]; while (out.length < s.mv.length && fill.length) out.push(fill.shift());
    ch.push(`${n}: −${s.mv.filter(bad).join(', −')}${out.length > keep.length ? ' +' + out.slice(keep.length).join(', +') : ''}`); s.mv = out; } return ch; }
const clone = T => ({ns: [...T.ns], set: Object.fromEntries(T.ns.map(n => [n, {...T.set[n], mv: [...T.set[n].mv]}]))});
// the most common real replacement for a Pokémon: the species most often seen with the rest of the six (4+ of the 5 others;
// 3+ if none), that keeps the six legal and isn't a Mega (for the Mega test); with its most common complete set whose item is free
const teamSets = M.teams.map(k => new Set(k.split('|')));
function replacement(T, out, ok) { const rest = T.ns.filter(n => n !== out), bases = new Set(rest.map(n => (INFO.ab[n] || {}).base || n));
  for (const need of [4, 3, 2]) { const c = new Map(); for (const S of teamSets) { let k = 0; for (const n of rest) if (S.has(n)) k++; if (k < need) continue; for (const n of S) if (!rest.includes(n) && n !== out) c.set(n, (c.get(n) || 0) + 1); }
    const cand = [...c].sort((a, b) => b[1] - a[1]).map(([n]) => n).filter(n => INFO.ab[n] && !bases.has(INFO.ab[n].base) && ok(n) && setUse.has(n));
    if (cand.length) { const n = cand[0], items = new Set(rest.map(x => T.set[x].it).filter(Boolean));
      const sets = byUse(setUse.get(n)).map(s => JSON.parse(s)).filter(([it]) => !it || !items.has(it)); const [it, mv] = sets[0] || [null, []];
      return {n, set: {it, ab: null, mv}, seen: c.get(n), need}; } }
  return null; }
function swap(T, out, ok) { const r = replacement(T, out, ok); if (!r) return null; const U = clone(T); U.ns = U.ns.map(n => n === out ? r.n : n).sort(); delete U.set[out]; U.set[r.n] = r.set; return {U, note: `${out} → ${r.n} (${r.set.it || 'no item'}; seen with ${r.need}+ of the other five on ${r.seen} real teams)`}; }
const BREAK = {
  'no Mega': T => { let U = T, notes = []; for (const n of T.ns.filter(n => INFO.ab[n] && INFO.ab[n].mega)) { const r = swap(U, n, x => !INFO.ab[x].mega); if (!r) return null; U = r.U; notes.push(r.note); } return {U, note: notes.join('; ')}; },
  'no speed control (any)': T => { const U = clone(T), ch = stripMoves(U, isSpeed); for (const n of U.ns) if (U.set[n].it === 'Choice Scarf') { const used = new Set(U.ns.map(x => U.set[x].it)); const it = byUse(itUse.get(n)).find(x => x !== 'Choice Scarf' && !used.has(x) && !/ite$/.test(x)); ch.push(`${n}: Choice Scarf → ${it}`); U.set[n].it = it || null; } return {U, note: ch.join('; ')}; },
  'no Tailwind or Trick Room': T => { const U = clone(T); return {U, note: stripMoves(U, isTWTR).join('; ')}; },
  'no turn-1 support (Fake Out, Intimidate, redirection)': T => { const U = clone(T), ch = stripMoves(U, isT1mv);
    for (const n of U.ns) if (abOf(U, n) === 'Intimidate') { const alt = (INFO.ab[n].all || []).find(a => a !== 'Intimidate'); if (!alt) return null; U.set[n].ab = alt; ch.push(`${n}: Intimidate → ${alt}`); } return {U, note: ch.join('; ')}; },
  'no Fake Out': T => { const U = clone(T); return {U, note: stripMoves(U, x => x === 'Fake Out').join('; ')}; },
  'no Intimidate': T => { const U = clone(T), ch = []; for (const n of U.ns) if (abOf(U, n) === 'Intimidate') { const alt = (INFO.ab[n].all || []).find(a => a !== 'Intimidate'); if (!alt) return null; U.set[n].ab = alt; ch.push(`${n}: Intimidate → ${alt}`); } return {U, note: ch.join('; ')}; },
  'Protect on 2 or fewer': T => { const U = clone(T), withP = U.ns.filter(n => U.set[n].mv.some(x => PROT.has(x))); return {U, note: stripMoves(U, x => PROT.has(x), withP.slice(2)).join('; ')}; },
  'no spread damage': T => { const U = clone(T); return {U, note: stripMoves(U, isSpread).join('; ')}; },
};
// ---- ~30 strong, well-played real teams: (six, sheet) with 15+ decided rounds and 60%+ wins, best lower bound first, one per six
const rec = new Map(); for (const g of G) for (const [t, d, w] of [[g[0], g[7], g[2] === 1], [g[1], g[8], g[2] !== 1]]) { const k = t + ':' + d, o = rec.get(k) || {t, d, n: 0, w: 0}; o.n++; o.w += w ? 1 : 0; rec.set(k, o); }
const lb = o => { const p = o.w / o.n, z = 1.96; return (p + z * z / (2 * o.n) - z * Math.sqrt(p * (1 - p) / o.n + z * z / (4 * o.n * o.n))) / (1 + z * z / o.n); };
const strong = [], usedSix = new Set(); for (const o of [...rec.values()].filter(o => o.n >= 15 && o.w / o.n >= .6).sort((a, b) => lb(b) - lb(a))) { if (usedSix.has(o.t)) continue; const T = sheetOf(o.t, o.d); usedSix.add(o.t); strong.push({...o, T}); if (strong.length >= 30) break; }
const jobs = []; for (const s of strong) { jobs.push({s, b: 'original', T: s.T}); for (const f of FN) { if (FLAGS[f](s.T)) continue; const r = BREAK[f](s.T); if (!r || !r.note) continue; if (!FLAGS[f](r.U)) { console.error('not broken:', f, s.T.ns.join(','), r.note); continue; } jobs.push({s, b: f, T: r.U, note: r.note}); } }
const GR = await gradeAll(pg, jobs.map(j => j.T));
// ---- real side (2): later rounds graded by the page with the model trained only on earlier games
const late = G.filter(g => M.events[g[3]][1] >= FROM), needL = new Map(); for (const g of late) for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) needL.set(t + ':' + d, sheetOf(t, d));
// every real sheet: the shipped model's species+pairs strength (no sets) and full strength, to compare "similar teams"
const allK = [...seenTD], XS = new Map();
for (let i = 0; i < allK.length; i += 300) { const ch = allK.slice(i, i + 300).map(k => { const [t, d] = k.split(':').map(Number); return sheetOf(t, d); });
  const r = await ev(pg, `(()=>{const out=[];for(const T of ${JSON.stringify(ch)}){try{const ps=T.ns.map(n=>byName.get(n));if(ps.some(p=>!p)){out.push(null);continue}
    const ms=ps.map(p=>{const s=T.set[p.n]||{},m=abMember(p),mv=(s.mv||[]).map(x=>mvByName.get(x)).filter(Boolean);return {...m,...(s.it&&!p.m?{item:s.it,heldItem:s.it}:{}),...(s.ab?{ability:s.ab,abChosen:true}:{}),...(mv.length?{moves:mv,_mv:mv,custom:true}:{})}});
    out.push([teamX(T.ns,null),strengthX(T.ns,ms).x0])}catch(e){out.push(null)}}return JSON.stringify(out)})()`);
  r.forEach((v, j) => XS.set(allK[i + j], v)); }
const pg2 = await openPage(rd('model_dev_site.json')), keysL = [...needL.keys()], GL = await gradeAll(pg2, keysL.map(k => needL.get(k)), 60), YL = new Map(keysL.map((k, i) => [k, GL[i] && GL[i].y]));
await browser.close(); fs.unlinkSync(page);
// ---- fits
const sig = z => 1 / (1 + Math.exp(-z)), logit = p => Math.log(p / (1 - p)), pts = v => (sig(v) - .5) * 100;
function fitJoint(rows, X) { const p = X(rows[0]).length, w = new Float64Array(p), lam = 1;
  const pass = () => { const g = new Float64Array(p), H = Array.from({length: p}, () => new Float64Array(p)); for (const d of rows) { const x = X(d), q = sig(x.reduce((s, v, j) => s + v * w[j], 0)); for (let a = 0; a < p; a++) { g[a] += (d.y - q) * x[a]; for (let c = 0; c < p; c++) H[a][c] += q * (1 - q) * x[a] * x[c]; } } for (let a = 0; a < p; a++) { g[a] -= lam * w[a] * (a > 0 ? 1 : 0); H[a][a] += a > 0 ? lam : 1e-6; } return {g, H}; };
  for (let it = 0; it < 20; it++) { const {g, H} = pass(), st = solve(H, g); for (let a = 0; a < p; a++) w[a] += st[a]; }
  const {H} = pass(), byA = new Map(), byB = new Map(), byAB = new Map();
  for (const d of rows) { const x = X(d), q = sig(x.reduce((s, v, j) => s + v * w[j], 0)), sc = x.map(v => (d.y - q) * v); for (const [Mm, k] of [[byA, d.ka], [byB, d.kb], [byAB, d.ka + '#' + d.kb]]) { const t = Mm.get(k) || new Float64Array(p); for (let a = 0; a < p; a++) t[a] += sc[a]; Mm.set(k, t); } }
  const meat = Array.from({length: p}, () => new Float64Array(p)); for (const [Mm, sg] of [[byA, 1], [byB, 1], [byAB, -1]]) for (const t of Mm.values()) for (let a = 0; a < p; a++) for (let c = 0; c < p; c++) meat[a][c] += sg * t[a] * t[c];
  const Hi = inv(H), V = mul(mul(Hi, meat), Hi); return {w, se: [...Array(p)].map((_, j) => Math.sqrt(Math.max(V[j][j], 0))), n: rows.length}; }
function solve(A, b) { const n = b.length, Mx = A.map((r, i) => [...r, b[i]]); for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(Mx[r][i]) > Math.abs(Mx[m][i])) m = r; [Mx[i], Mx[m]] = [Mx[m], Mx[i]]; const pv = Mx[i][i] || 1e-12; for (let r = 0; r < n; r++) if (r !== i) { const f = Mx[r][i] / pv; for (let c = i; c <= n; c++) Mx[r][c] -= f * Mx[i][c]; } } return Mx.map((r, i) => r[n] / (r[i] || 1e-12)); }
function inv(A) { const n = A.length, R = [...Array(n)].map(() => new Array(n).fill(0)); for (let j = 0; j < n; j++) solve(A, [...Array(n)].map((_, i) => +(i === j))).forEach((v, i) => { R[i][j] = v; }); return R; }
function mul(A, B) { return A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0))); }
// player skill: record in OTHER events (worth) / in games before FROM (beyond the grade), shrunk toward 50% with 10 games
const pl = new Map(), plE = new Map(), plEarly = new Map(); const addP = (Mp, k, w) => { const o = Mp.get(k) || [0, 0]; o[0] += w; o[1]++; Mp.set(k, o); };
for (const g of G) for (const [p, w] of [[g[4], g[2] === 1 ? 1 : 0], [g[5], g[2] === 1 ? 0 : 1]]) { addP(pl, p, w); addP(plE, p + '#' + g[3], w); if (M.events[g[3]][1] < FROM) addP(plEarly, p, w); }
const skill = (p, e) => { const a = pl.get(p) || [0, 0], b = plE.get(p + '#' + e) || [0, 0]; return logit((a[0] - b[0] + 5) / (a[1] - b[1] + 10)); }, skillE = p => { const a = plEarly.get(p) || [0, 0]; return logit((a[0] + 5) / (a[1] + 10)); };
const flagCache = new Map(), flagsOf = (t, d) => { const k = t + ':' + d; if (!flagCache.has(k)) { const T = sheetOf(t, d); flagCache.set(k, FN.map(f => FLAGS[f](T))); } return flagCache.get(k); };
const rowsAll = G.map(g => ({g, y: g[2] === 1 ? 1 : 0, sk: skill(g[4], g[3]) - skill(g[5], g[3]), fa: flagsOf(g[0], g[7]), fb: flagsOf(g[1], g[8]), ka: g[0], kb: g[1], mode: modeOf(g)}));
const Xw = d => [d.sk, ...FN.map((_, i) => d.fa[i] - d.fb[i])]; // [skill, flags...] (no intercept: the side order is arbitrary)
const res = {}; const share = (rows, i) => rows.reduce((s, d) => s + d.fa[i] + d.fb[i], 0) / (2 * rows.length) * 100, differ = (rows, i) => rows.filter(d => d.fa[i] !== d.fb[i]).length;
const raw = (rows, i) => { let n = 0, w = 0; for (const d of rows) { if (d.fa[i] === d.fb[i]) continue; n++; w += d.fa[i] ? d.y : 1 - d.y; } return n ? {n, wr: w / n * 100} : {n: 0}; };
rowsAll.forEach(d => { const a = XS.get(d.g[0] + ':' + d.g[7]), b = XS.get(d.g[1] + ':' + d.g[8]); d.xn = a && b ? a[0] - b[0] : null; d.x0 = a && b ? a[1] - b[1] : null; });
{ const R = rowsAll.filter(d => d.xn != null); for (const [nm, rows, j] of [['similar Pokémon (species+pairs strength as input), all rounds', R, 'xn'], ['similar Pokémon, best-of-1 rounds', R.filter(d => d.mode === 'BO1'), 'xn'], ['beyond the shipped model (in-sample, full strength as input), all rounds', R, 'x0']]) {
  const J = fitJoint(rows, d => [d.sk, d[j], ...FN.map((_, i) => d.fa[i] - d.fb[i])]); res[nm] = FN.map((f, i) => ({f, share: share(rows, i), differ: differ(rows, i), raw: raw(rows, i), eff: pts(J.w[2 + i]), lo: pts(J.w[2 + i] - 1.96 * J.se[2 + i]), hi: pts(J.w[2 + i] + 1.96 * J.se[2 + i])})); res[nm].n = rows.length; } }
for (const [nm, rows] of [['all rounds', rowsAll], ['best-of-1 rounds', rowsAll.filter(d => d.mode === 'BO1')], ['best-of-3 rounds', rowsAll.filter(d => d.mode === 'BO3')]]) { const J = fitJoint(rows, Xw); res[nm] = FN.map((f, i) => ({f, share: share(rows, i), differ: differ(rows, i), raw: raw(rows, i), eff: pts(J.w[1 + i]), lo: pts(J.w[1 + i] - 1.96 * J.se[1 + i]), hi: pts(J.w[1 + i] + 1.96 * J.se[1 + i]), z: J.w[1 + i] / (J.se[1 + i] || 1e9)})); res[nm].n = rows.length; res[nm].skill = J.w[0]; }
const rowsL = late.map(g => ({g, y: g[2] === 1 ? 1 : 0, za: YL.get(g[0] + ':' + g[7]), zb: YL.get(g[1] + ':' + g[8]), sk: skillE(g[4]) - skillE(g[5]), fa: flagsOf(g[0], g[7]), fb: flagsOf(g[1], g[8]), ka: g[0], kb: g[1], mode: modeOf(g)})).filter(d => d.za != null && d.zb != null);
{ const J = fitJoint(rowsL, d => [d.za - d.zb, d.sk, ...FN.map((_, i) => d.fa[i] - d.fb[i])]); res.beyond = FN.map((f, i) => ({f, share: share(rowsL, i), differ: differ(rowsL, i), eff: pts(J.w[2 + i]), lo: pts(J.w[2 + i] - 1.96 * J.se[2 + i]), hi: pts(J.w[2 + i] + 1.96 * J.se[2 + i])})); res.beyond.n = rowsL.length; res.beyond.k = J.w[0]; }
// ---- report
const f1 = v => (v >= 0 ? '+' : '') + v.toFixed(1), med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };
console.log(`${strong.length} strong real teams (15+ decided rounds, 60%+ wins, one sheet per six). Grade = the page's own (CH.gradeOf), 0-100; win chance = vs today's field.`);
const by = new Map(); jobs.forEach((j, i) => { j.g = GR[i]; }); const orig = new Map(jobs.filter(j => j.b === 'original').map(j => [j.s, j.g]));
for (const j of jobs) if (j.b !== 'original' && j.g && orig.get(j.s)) { const o = orig.get(j.s), a = by.get(j.b) || []; a.push({j, ds: j.g.s - o.s, de: (j.g.e - o.e) * 100, ds0: j.g.s0 - o.s0, de0: (j.g.e0 - o.e0) * 100, lostSix: o.sixG > 0 && !j.g.sixG}); by.set(j.b, a); }
const og = [...orig.values()].filter(Boolean); console.log(`originals: median grade ${med(og.map(g => g.s)).toFixed(1)}, median win chance vs field ${med(og.map(g => g.e * 100)).toFixed(1)}%, ${og.filter(g => g.sixG).length} with their own record`);
console.log('\nGRADE DROP when the basic is removed (median, range over teams) · in brackets: same, with the six\'s own record taken out of both');
for (const f of FN) { const a = by.get(f) || []; if (!a.length) { console.log(`  ${f}: no team could be broken`); continue; }
  const q = k => `${f1(med(a.map(x => x[k])))} [${f1(Math.min(...a.map(x => x[k])))} … ${f1(Math.max(...a.map(x => x[k])))}]`;
  console.log(`  ${f.padEnd(52)} ${String(a.length).padStart(2)} teams  grade ${q('ds')}  win ${q('de')} pts   (no own record: grade ${f1(med(a.map(x => x.ds0)))}, win ${f1(med(a.map(x => x.de0)))})   ${a.filter(x => x.ds >= 0).length} didn't drop`); }
console.log('\nWHAT REAL RESULTS SAY lacking it is worth (head to head vs a side that has it, win-chance pts; joint model with player skill; ± 95% grouped by team)');
for (const nm of ['all rounds', 'best-of-1 rounds', 'best-of-3 rounds', 'similar Pokémon (species+pairs strength as input), all rounds', 'similar Pokémon, best-of-1 rounds', 'beyond the shipped model (in-sample, full strength as input), all rounds']) { console.log(`  ${nm} (${res[nm].n} rounds)`); for (const r of res[nm]) console.log(`    ${r.f.padEnd(52)} lacking on ${r.share.toFixed(1).padStart(4)}% of sides, ${String(r.differ).padStart(5)} rounds differ, raw ${r.raw.n ? r.raw.wr.toFixed(1) + '%' : '—'}  adjusted ${f1(r.eff)} [${f1(r.lo)} … ${f1(r.hi)}]`); }
console.log(`\nBEYOND THE GRADE: later rounds (${res.beyond.n}, from ${FROM}), grade from a model trained on earlier games (fit scale ${res.beyond.k.toFixed(2)})`);
for (const r of res.beyond) console.log(`    ${r.f.padEnd(52)} lacking on ${r.share.toFixed(1).padStart(4)}%, ${String(r.differ).padStart(4)} rounds differ  ${f1(r.eff)} [${f1(r.lo)} … ${f1(r.hi)}]`);
console.log('\nEXAMPLES (biggest win-chance gap between the grade drop and nothing):');
for (const f of FN) { const a = (by.get(f) || []).slice().sort((x, y) => y.de - x.de).slice(0, 2); for (const x of a) console.log(`  ${f}: ${x.j.s.T.ns.join(', ')} (${x.j.s.w}-${x.j.s.n - x.j.s.w}) grade ${orig.get(x.j.s).s} → ${x.j.g.s}, win ${(orig.get(x.j.s).e * 100).toFixed(1)} → ${(x.j.g.e * 100).toFixed(1)}%  · ${x.j.note}${x.lostSix ? ' · (loses its own record)' : ''}`); }
const errs = GR.filter(g => !g || g.err).length + GL.filter(g => !g || g.err).length; if (errs) console.log(`\n${errs} sheets could not be graded`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({res, jobs: jobs.map(j => ({six: j.s.T.ns, rec: [j.s.w, j.s.n], b: j.b, note: j.note, g: j.g}))}, null, 1));
