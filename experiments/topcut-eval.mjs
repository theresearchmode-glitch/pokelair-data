// Ratings v3 lab: builds per-Pokemon top-cut evidence from every Limitless event (placements in data/t2) and tests
// candidate rating recipes: (a) forward, built from events before a cut date and scored on the events after it, and
// (b) against outside tier lists. Usage: node experiments/topcut-eval.mjs <old ratings dump.json>
import fs from 'node:fs';
const rd = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch (e) { return d; } };
const OLD = rd(process.argv[2], []), oldBy = new Map(OLD.map(x => [x.n, x]));
// ---- Limitless names -> page names (same rules as update.mjs) ----
const ROSTER = rd('roster.json', []), names = new Set(ROSTER), REG = {Hisuian: 'Hisui', Alolan: 'Alola', Galarian: 'Galar', Paldean: 'Paldea'};
const key = m => { const it = m.i || ''; const z = it.match(/^(.*)ite( [XYZ])?$/); return z && it !== 'Eviolite' ? m.n + '|M' + (z[2] ? z[2].trim() : '') : m.n; };
function lmap(k) { let [n, mega] = k.split('|'); if (/^Eternal Flower Floette$/.test(n) && mega == null) return 'Floette-Eternal'; n = n.replace(/^Eternal Flower /, '');
  { const r = n.match(/^(Wash|Heat|Frost|Fan|Mow) Rotom$/); if (r) n = 'Rotom-' + r[1]; }
  n = n.replace(/'/g, '’').replace(/^Lycanroc (Dusk|Midnight)$/, 'Lycanroc-$1').replace(/^Low Key Toxtricity$/, 'Toxtricity-Low-Key').replace(/^Paldean Tauros (Aqua|Blaze|Combat) Breed$/, 'Tauros-Paldea-$1');
  let m = n.match(/^(Hisuian|Alolan|Galarian|Paldean) (.*)$/); if (m) n = m[2] + '-' + REG[m[1]];
  n = n.replace(/ ♀$/, '-F').replace(/ ♂$/, ''); m = n.match(/^(.*?) \((.*)\)$/); if (m) n = m[1] + ({'Dusk Form': '-Dusk', 'Midnight Form': '-Midnight', 'Low Key Form': '-Low-Key'}[m[2]] || '');
  if (mega != null) { const s = mega.slice(1); for (const c of [n + '-Mega' + (s ? '-' + s : ''), n.replace(/-F$/, '') + '-F-Mega', n + '-Mega']) if (names.has(c)) return c; return null; }
  if (names.has(n)) return n; const b = n.split('-')[0]; return names.has(b) ? b : null; }
// ---- events: field teams, top-cut teams, games ----
export const cutSize = p => p < 16 ? 2 : p < 32 ? 4 : p < 96 ? 8 : p < 192 ? 16 : 32;
const EV = fs.readdirSync('data/t2').map(f => rd('data/t2/' + f)).filter(T => T && T.e).map(T => {
  const ents = T.e.filter(p => p.dk && p.dk.length === 6).map(p => ({ms: [...new Set(p.dk.map(m => lmap(key(m))).filter(Boolean))], pl: p.pl, w: p.w, l: p.l})).filter(x => x.ms.length === 6);
  const cut = cutSize(T.p || ents.length); return {d: T.d.slice(0, 10), p: T.p || ents.length, ents, top: ents.filter(x => x.pl != null && x.pl <= cut)}; }).filter(E => E.ents.length >= 8).sort((a, b) => a.d < b.d ? -1 : 1);
console.log('events', EV.length, 'with top cut', EV.filter(e => e.top.length).length, EV[0].d, 'â†’', EV[EV.length - 1].d);
// evidence from a set of events, recency-weighted toward `asOf`
export function evidence(evs, asOf, half = 21) { const S = new Map(), g = n => { let o = S.get(n); if (!o) S.set(n, o = {f: 0, t: 0, ex: 0, w: 0, gm: 0}); return o; };
  let F = 0, Tt = 0, W = 0, GM = 0;
  for (const E of evs) { const age = (new Date(asOf) - new Date(E.d)) / 864e5, rw = Math.pow(.5, Math.max(0, age) / half), sw = Math.log2(Math.max(8, E.p) / 4);
    const cnt = new Map(); for (const x of E.ents) for (const m of x.ms) cnt.set(m, (cnt.get(m) || 0) + 1);
    const nE = E.ents.length;
    for (const x of E.ents) { F += rw; for (const m of x.ms) { const o = g(m); o.f += rw; o.w += rw * x.w; o.gm += rw * (x.w + x.l); } W += rw * x.w; GM += rw * (x.w + x.l); }
    if (E.top.length) { const ew = rw * sw; Tt += ew * E.top.length; for (const x of E.top) for (const m of x.ms) g(m).t += ew;
      for (const [m, c] of cnt) g(m).ex += ew * E.top.length * c / nE; } }
  const base = W / GM; const out = new Map();
  for (const [n, o] of S) out.set(n, {field: o.f / F, top: o.t / (Tt || 1), lift: (o.t + 6) / (o.ex + 6), topN: o.t, wr: o.gm ? o.w / o.gm : base, games: o.gm, base});
  return out; }
// ---- candidate recipes: score per PokÃ©mon from evidence (+ ladder popularity, model from the old dump) ----
const lg = x => Math.log(Math.max(1e-4, x));
const RECIPES = {
  old: (n) => oldBy.has(n) ? oldBy.get(n).t : null,
  presence: (n, e) => e ? lg(e.top) : null,
  field: (n, e) => e ? lg(e.field) : null,
  v3: (n, e) => { if (!e) return null; const sh = (e.wr - e.base) * e.games / (e.games + 1500), sm = oldBy.get(n) && oldBy.get(n).smog != null ? lg(oldBy.get(n).smog / 100) : lg(.0005);
    return lg(e.top) + lg(e.lift) + 8 * sh; },
  v3b: (n, e) => { if (!e) return null; const sh = (e.wr - e.base) * e.games / (e.games + 1500), sm = oldBy.get(n) && oldBy.get(n).smog != null ? lg(oldBy.get(n).smog / 100) : lg(.0005);
    return .8 * lg(e.top) + .2 * lg(e.field) + .5 * lg(e.lift) + 8 * sh + .2 * sm; },
};
// Spearman over a common set
function spear(a, b) { const rk = v => { const o = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]), r = new Array(v.length); for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2; i = j + 1; } return r; };
  const ra = rk(a), rb = rk(b), n = a.length, ma = ra.reduce((x, y) => x + y, 0) / n, mb = rb.reduce((x, y) => x + y, 0) / n; let s = 0, sa = 0, sb = 0;
  for (let i = 0; i < n; i++) { s += (ra[i] - ma) * (rb[i] - mb); sa += (ra[i] - ma) ** 2; sb += (rb[i] - mb) ** 2; } return s / Math.sqrt(sa * sb); }
function forward(cutFrac) { const k = Math.floor(EV.length * cutFrac), past = EV.slice(0, k), fut = EV.slice(k), asOf = past[past.length - 1].d;
  const eP = evidence(past, asOf), eF = evidence(fut, fut[fut.length - 1].d, 1e9);
  const pool = [...eF.keys()].filter(n => (eF.get(n).field >= .005 || (eP.get(n) && eP.get(n).field >= .005)));
  const res = {}; for (const [name, R] of Object.entries(RECIPES)) { const xs = [], ys = [], yc = [], rows = [];
    for (const n of pool) { const s = R(n, eP.get(n)); if (s == null) continue; xs.push(s); ys.push(eF.get(n).top); yc.push(eF.get(n).lift); rows.push([n, s, eF.get(n).top]); }
    const top10 = new Set(rows.slice().sort((a, b) => b[2] - a[2]).slice(0, 10).map(r => r[0])), mine = rows.slice().sort((a, b) => b[1] - a[1]).slice(0, 10).map(r => r[0]);
    res[name] = {n: xs.length, spTop: +spear(xs, ys).toFixed(3), spLift: +spear(xs, yc).toFixed(3), top10: mine.filter(n => top10.has(n)).length}; }
  return {cut: asOf, pastEv: past.length, futEv: fut.length, res}; }
// outside tier lists (13-rating.js OUTSIDE.data)
const src13 = fs.readFileSync('app/src/app/13-rating.js', 'utf8'), OUT = JSON.parse(src13.match(/data: (\{"pz".*\})\};/)[1]);
function outside(score) { const r = {}; for (const [k, L] of Object.entries(OUT)) { const ns = Object.keys(L).filter(n => score(n) != null); r[k] = +spear(ns.map(n => score(n)), ns.map(n => L[n])).toFixed(3); } return r; }
const eAll = evidence(EV, EV[EV.length - 1].d);
for (const f of [.6, .75]) console.log('forward', JSON.stringify(forward(f)));
for (const [name, R] of Object.entries(RECIPES)) console.log('outside', name, JSON.stringify(outside(n => R(n, eAll.get(n)))));
// current-data table for the v3 recipe
const v3 = [...eAll.keys()].map(n => [n, RECIPES[process.env.REC || 'v3'](n, eAll.get(n)), eAll.get(n)]).filter(x => x[1] != null).sort((a, b) => b[1] - a[1]);
console.log(v3.slice(0, 40).map((x, i) => `${i + 1} ${x[0]} s=${x[1].toFixed(2)} top=${(x[2].top * 100).toFixed(1)}% field=${(x[2].field * 100).toFixed(1)}% lift=${x[2].lift.toFixed(2)} wr=${(x[2].wr * 100).toFixed(1)} g=${Math.round(x[2].games)} old=${oldBy.get(x[0]) ? oldBy.get(x[0]).t : '-'}`).join('\n'));
fs.writeFileSync(process.env.TEMP + '/tc_evidence.json', JSON.stringify(Object.fromEntries(eAll)));
