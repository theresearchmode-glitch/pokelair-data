// Ratings metrics lab (Oct 27): computes every candidate rating ingredient from events before a cut date and tests
// whether adding (or swapping in) each one improves (a) the forward test: Spearman with the later events' top-cut share
// and conversion, and later top-10 named, on two cut dates; (b) agreement with five outside lists, split into
// usage/top-cut style (PokeSynergy, PokeTools, Showdowntier) and win-rate style (Pokémon Zone, Suckerpunch).
// Usage: node experiments/metrics-lab.mjs   (outside refs: experiments/outside-refs.json)
import fs from 'node:fs';
import {makeNameOf, cutSize} from '../topcut.mjs';
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const nameOf = makeNameOf(rd('roster.json')), DAY = 864e5;
// ---- Limitless events with placements and player names ----
const EV = fs.readdirSync('data/t2').map(f => ({id: f.replace('.json', ''), ...rd('data/t2/' + f)})).filter(T => T.v === 3 && T.e).map(T => {
  const ents = T.e.filter(p => p.dk && p.dk.length === 6).map(p => ({nm: String(p.nm || p.id).toLowerCase().trim(), ms: [...new Set(p.dk.map(nameOf).filter(Boolean))], pl: p.pl, w: p.w || 0, l: p.l || 0})).filter(x => x.ms.length === 6);
  const cut = cutSize(T.p || ents.length); return {id: T.id, d: T.d.slice(0, 10), p: T.p || ents.length, ents, cut, top: ents.filter(x => x.pl != null && x.pl <= cut)}; }).filter(E => E.ents.length >= 8).sort((a, b) => a.d < b.d ? -1 : 1);
// ---- games (both teams known) for player skill, skill-adjusted results and results vs threats ----
const M = rd('out/matches.json'), MT = M.teams.map(k => k.split('|')), evDate = M.events.map(e => e[1]);
const GAMES = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]).map(g => ({A: g[0], B: g[1], r: g[2], d: evDate[g[3]], ev: g[3], pa: g[4], pb: g[5], rd: g[6] || 0})).sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.rd - b.rd);
// ---- replays (team preview: brought 4 and leads) ----
const REP = (() => { try { const r = rd('out/replays.json'); return Array.isArray(r) ? r : Array.isArray(r.games) ? r.games : Array.isArray(r.replays) ? r.replays : Object.values(r).find(Array.isArray) || []; } catch (e) { return []; } })();
const lg = x => Math.log(Math.max(1e-4, x)), sig = x => 1 / (1 + Math.exp(-x));
function wilsonLB(p, n, z = 1.645) { if (!n) return 0; const d = 1 + z * z / n, c = p + z * z / (2 * n), s = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return (c - s) / d; }
// every ingredient for every Pokémon, from events up to asOf (recency half-life 21 days)
function ingredients(evs, games, asOf, half = 21) { const rwOf = d => Math.pow(.5, Math.max(0, (new Date(asOf) - new Date(d)) / DAY) / half);
  const S = new Map(), g = n => { let o = S.get(n); if (!o) S.set(n, o = {f: 0, t: 0, ex: 0, w: 0, gm: 0, ent: 0, tcN: 0, ww: 0, win: 0, ply: new Set(), evc: [], rwf: 0, sk: 0, skn: 0, th: 0, thn: 0}); return o; };
  let F = 0, Tt = 0, W = 0, GM = 0, WW = 0;
  const PW = pl => pl === 1 ? 4 : pl === 2 ? 3 : pl <= 4 ? 2 : pl <= 8 ? 1.5 : 1;
  for (const E of evs) { const rw = rwOf(E.d), sw = Math.log2(Math.max(8, E.p) / 4), cnt = new Map(), tcnt = new Map();
    for (const x of E.ents) for (const m of x.ms) cnt.set(m, (cnt.get(m) || 0) + 1);
    for (const x of E.ents) { F += rw; W += rw * x.w; GM += rw * (x.w + x.l); for (const m of x.ms) { const o = g(m); o.f += rw; o.w += rw * x.w; o.gm += rw * (x.w + x.l); o.ent += rw; } }
    if (E.top.length) { const ew = rw * sw; Tt += ew * E.top.length; for (const x of E.top) { WW += ew * PW(x.pl); for (const m of x.ms) { const o = g(m); o.t += ew; o.tcN += rw; o.ww += ew * PW(x.pl); if (x.pl === 1) o.win += rw; o.ply.add(x.nm); tcnt.set(m, (tcnt.get(m) || 0) + 1); } }
      for (const [m, c] of cnt) { const o = g(m); o.ex += ew * E.top.length * c / E.ents.length; if (c >= 2) o.evc.push(((tcnt.get(m) || 0) / E.top.length) / (c / E.ents.length)); } } }
  // player skill: Elo over the games so far (chronological), then each entry weighted by P(player above the 70th percentile)
  const elo = new Map(), get = p => elo.get(p) ?? 1500;
  for (const G of games) { const a = get(G.pa), b = get(G.pb), e = 1 / (1 + Math.pow(10, (b - a) / 400)); elo.set(G.pa, a + 24 * (G.r - e)); elo.set(G.pb, b - 24 * (G.r - e)); }
  const els = [...elo.values()].sort((a, b) => a - b), q70 = els[Math.floor(els.length * .7)] || 1500;
  const usage = new Map(); for (const [n, o] of S) o.top = o.t / (Tt || 1);
  const seen = new Set(); let RWF = 0; const top8 = [...S].sort((a, b) => b[1].f - a[1].f).slice(0, 8).map(x => x[0]), T8 = new Set(top8);
  for (const G of games) { const rw = rwOf(G.d);
    for (const [p, t] of [[G.pa, G.A], [G.pb, G.B]]) { const k = G.ev + '|' + p; if (seen.has(k)) continue; seen.add(k); const w = rw * sig((get(p) - q70) / 40); RWF += w; for (const m of MT[t]) g(m).rwf += w; }
    // skill-adjusted result: actual minus what the two players' Elo expected, credited to every Pokémon on each side
    const e = 1 / (1 + Math.pow(10, (get(G.pb) - get(G.pa)) / 400)), res = G.r - e;
    const thB = MT[G.B].some(m => T8.has(m)), thA = MT[G.A].some(m => T8.has(m));
    for (const m of MT[G.A]) { const o = g(m); o.sk += rw * res; o.skn += rw; if (thB) { o.th += rw * res; o.thn += rw; } }
    for (const m of MT[G.B]) { const o = g(m); o.sk -= rw * res; o.skn += rw; if (thA) { o.th -= rw * res; o.thn += rw; } } }
  const base = W / GM, out = new Map(), mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  for (const [n, o] of S) { const p = o.gm ? o.w / o.gm : base, v = o.evc.length >= 4 ? Math.sqrt(mean(o.evc.map(x => (x - mean(o.evc)) ** 2))) : null;
    out.set(n, {field: o.f / F, top: o.top, lift: (o.t + 6) / (o.ex + 6), edge: (p - base) * o.gm / (o.gm + 1500), wilson: wilsonLB(p, o.gm) - base, rwField: o.rwf / (RWF || 1),
      convEnt: (o.tcN + 2) / (o.ent + 20), wwTop: o.ww / (WW || 1), wins: o.win, breadth: o.ply.size, skEdge: o.skn ? (o.sk / o.skn) * o.skn / (o.skn + 1500) : 0, thEdge: o.thn ? (o.th / o.thn) * o.thn / (o.thn + 800) : 0, consist: v, g: o.gm}); }
  return out; }
// bring / lead rates from replays (when on the team): shown only
function bringLead(reps) { const S = new Map(); for (const R of reps) for (let s = 0; s < 2; s++) { const team = (R.p || [])[s] || [], br = new Set(((R.b || [])[s]) || []), ld = new Set(((R.l || [])[s]) || []); if (!br.size) continue;
    for (const m of team) { const o = S.get(m) || {n: 0, b: 0, l: 0}; o.n++; if (br.has(m)) o.b++; if (ld.has(m)) o.l++; S.set(m, o); } } return S; }
// ---- recipes ----
const BASE = e => lg(e.top) + lg(e.lift) + 8 * e.edge;
const VARIANTS = {
  base: e => BASE(e),
  'usage only': e => lg(e.field),
  'rating-weighted usage only': e => lg(e.rwField),
  '+ usage': e => BASE(e) + .5 * lg(e.field),
  '+ rating-weighted usage': e => BASE(e) + .5 * lg(e.rwField),
  'swap top-cut share -> winner-weighted': e => lg(e.wwTop) + lg(e.lift) + 8 * e.edge,
  'swap conversion -> PokeSynergy conv (TC/entries)': e => lg(e.top) + lg(e.convEnt / .1) + 8 * e.edge,
  '+ event wins': e => BASE(e) + .15 * Math.log1p(e.wins),
  'swap win rate -> Wilson 90% lower bound': e => lg(e.top) + lg(e.lift) + 8 * e.wilson,
  'swap win rate -> skill-adjusted edge': e => lg(e.top) + lg(e.lift) + 8 * e.skEdge,
  '+ skill-adjusted edge': e => BASE(e) + 8 * e.skEdge,
  '+ results vs top threats (skill-adj)': e => BASE(e) + 8 * e.thEdge,
  '+ breadth (distinct top-cut players)': e => BASE(e) + .3 * Math.log1p(e.breadth),
  '- inconsistency (conversion spread)': e => BASE(e) - (e.consist == null ? 0 : .3 * e.consist),
  '+ .25 rating-weighted usage': e => BASE(e) + .25 * lg(e.rwField),
  '+ 1.0 rating-weighted usage': e => BASE(e) + 1 * lg(e.rwField),
  '+ .5 rwUsage + Wilson': e => lg(e.top) + lg(e.lift) + 8 * e.wilson + .5 * lg(e.rwField),
  '+ .5 rwUsage - inconsistency': e => BASE(e) + .5 * lg(e.rwField) - (e.consist == null ? 0 : .3 * e.consist),
  '+ .5 rwUsage + Wilson - inconsistency': e => lg(e.top) + lg(e.lift) + 8 * e.wilson + .5 * lg(e.rwField) - (e.consist == null ? 0 : .3 * e.consist),
};
function spear(a, b) { const rk = v => { const o = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]), r = new Array(v.length); for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let k = i; k <= j; k++) r[o[k][1]] = (i + j) / 2; i = j + 1; } return r; };
  const ra = rk(a), rb = rk(b), n = a.length, ma = ra.reduce((x, y) => x + y, 0) / n, mb = rb.reduce((x, y) => x + y, 0) / n; let s = 0, sa = 0, sb = 0;
  for (let i = 0; i < n; i++) { s += (ra[i] - ma) * (rb[i] - mb); sa += (ra[i] - ma) ** 2; sb += (rb[i] - mb) ** 2; } return s / Math.sqrt(sa * sb); }
const FWD = [.6, .75].map(fr => { const k = Math.floor(EV.length * fr), past = EV.slice(0, k), fut = EV.slice(k), asOf = past[past.length - 1].d;
  const P = ingredients(past, GAMES.filter(G => G.d <= asOf), asOf), Fu = ingredients(fut, [], fut[fut.length - 1].d, 1e9);
  const pool = [...Fu.keys()].filter(n => Fu.get(n).field >= .005 || (P.get(n) && P.get(n).field >= .005)); return {asOf, P, Fu, pool}; });
const ALL = ingredients(EV, GAMES, EV[EV.length - 1].d);
// outside references: OUTSIDE (13-rating.js) + Showdowntier + Suckerpunch (base-species names -> our most-used form)
const src13 = fs.readFileSync('app/src/app/13-rating.js', 'utf8'), OUT = JSON.parse(src13.match(/data: (\{"pz".*\})\};/)[1]), EXT = rd('experiments/outside-refs.json');
const ours = n => { let x = nameOf.lmap(n) || n; if (/^Floette/.test(x)) x = 'Floette-Mega'; const c = [x, x + '-Mega', x + '-Mega-X', x + '-Mega-Y', x + '-Mega-Z'].filter(k => ALL.has(k)); return c.sort((a, b) => ALL.get(b).field - ALL.get(a).field)[0] || null; };
const REFS = {pz: OUT.pz, synergy: OUT.synergy, poketools: OUT.poketools};
for (const [k, L] of Object.entries(EXT)) { if (k.startsWith('_')) continue; const m = {}; for (const [n, v] of Object.entries(L)) { const o = ours(n); if (o && m[o] == null) m[o] = v; } REFS[k] = m; }
const GROUP = {usage: ['synergy', 'poketools', 'showdowntier'], winrate: ['pz', 'suckerpunch']};
const rows = [];
for (const [name, R] of Object.entries(VARIANTS)) { const f = FWD.map(({P, Fu, pool}) => { const xs = [], ys = [], yc = [], tab = [];
    for (const n of pool) { const e = P.get(n); if (!e) continue; const s = R(e); xs.push(s); ys.push(Fu.get(n).top); yc.push(Fu.get(n).lift); tab.push([n, s, Fu.get(n).top]); }
    const t10 = new Set(tab.slice().sort((a, b) => b[2] - a[2]).slice(0, 10).map(r => r[0])); return {sp: spear(xs, ys), spc: spear(xs, yc), t10: tab.sort((a, b) => b[1] - a[1]).slice(0, 10).filter(r => t10.has(r[0])).length}; });
  const cons = {}; for (const [k, L] of Object.entries(REFS)) { const ns = Object.keys(L).filter(n => ALL.has(n)); cons[k] = spear(ns.map(n => R(ALL.get(n))), ns.map(n => L[n])); }
  const g = ks => ks.reduce((a, k) => a + cons[k], 0) / ks.length, rank = [...ALL].map(([n, e]) => [n, R(e)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  rows.push({variant: name, fwdTop: +((f[0].sp + f[1].sp) / 2).toFixed(3), fwdConv: +((f[0].spc + f[1].spc) / 2).toFixed(3), top10: f[0].t10 + f[1].t10, consUsage: +g(GROUP.usage).toFixed(3), consWR: +g(GROUP.winrate).toFixed(3),
    ann: rank.indexOf('Annihilape') + 1, zard: rank.indexOf('Charizard-Mega-Y') + 1, top3: rank.slice(0, 3).join(',')}); }
console.table(rows);
// supports check and the shown-only metrics
const BL = bringLead(REP), tr = (() => { const last = EV[EV.length - 1].d, cut = new Date(new Date(last) - 14 * DAY).toISOString().slice(0, 10); const a = ingredients(EV.filter(E => E.d > cut), [], last, 1e9), b = ingredients(EV.filter(E => E.d <= cut), [], cut, 1e9); return n => a.get(n) && b.get(n) ? a.get(n).field / b.get(n).field : null; })();
const show = ['Sneasler', 'Rillaboom', 'Incineroar', 'Kingambit', 'Charizard-Mega-Y', 'Floette-Mega', 'Indeedee-F', 'Whimsicott', 'Farigiraf', 'Annihilape', 'Kommo-o', 'Basculegion-F'];
console.log('replays:', REP.length, 'games');
console.table(show.map(n => { const e = ALL.get(n), b = BL.get(n); return {n, usage: +(100 * e.field).toFixed(1), rwUsage: +(100 * e.rwField).toFixed(1), top: +(100 * e.top).toFixed(1), lift: +e.lift.toFixed(2), convEnt: +(100 * e.convEnt).toFixed(1), wins: +e.wins.toFixed(1), breadth: e.breadth, wilson: +(100 * e.wilson).toFixed(1), skEdge: +(100 * e.skEdge).toFixed(2), thEdge: +(100 * e.thEdge).toFixed(2), consist: e.consist == null ? null : +e.consist.toFixed(2), trend: tr(n) == null ? null : +tr(n).toFixed(2), bring: b ? `${Math.round(100 * b.b / b.n)}% of ${b.n}` : '-', lead: b ? Math.round(100 * b.l / b.n) + '%' : '-'}; }));
