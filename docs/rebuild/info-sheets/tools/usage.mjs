// LOOK-ONLY: reads C:/Users/simra/code/pl-pcrun. Writes only into this scratch folder.
import fs from 'node:fs';
import zlib from 'node:zlib';
const R = 'C:/Users/simra/code/pl-pcrun/';
const OUT = 'C:/Users/simra/AppData/Local/Temp/claude/469e588db1a22171/bb823294-4095-4fd5-ba18-59326258ebc4/scratchpad/info-sheets/usage/';
process.chdir(R);
const {readJSON, canonSet} = await import('file:///' + R + 'names.mjs');
const {offFormat, oddEvents, sameReg} = await import('file:///' + R + 'formats.mjs');
const RG = readJSON('out/reg.json'); const FORMAT = RG.id;
const index = readJSON('data/index.json');
const KEEP0 = Object.keys(index.tournaments).filter(id => sameReg(index.tournaments[id], FORMAT) && !offFormat(index.tournaments[id].name));
const ODD = oddEvents(KEEP0, id => readJSON(`data/t/${id}.json`, null), () => {});
const KEEP = KEEP0.filter(id => !ODD.has(id));
const ev = KEEP.map(id => { const T = readJSON(`data/t2/${id}.json`, null); return T ? {id, ...T} : null; }).filter(Boolean).sort((a, b) => new Date(a.d) - new Date(b.d));
const DAY = 864e5, lastD = new Date(ev[ev.length - 1].d).getTime();
const WIN = process.argv.includes('--28') ? 28 : 0;
const teams = []; let mons = 0, partial = 0, nev = 0;
for (const T of ev) { if (WIN && lastD - new Date(T.d) > WIN * DAY) continue; nev++;
  for (const p of T.e) { const dk = (p.dk || []).map(canonSet); if (dk.length !== 6) { partial++; continue; }
    teams.push({d: T.d.slice(0, 10), w: p.w, l: p.l, pl: p.pl, P: T.p, mons: dk.map(m => ({n: m.n, i: m.i, a: m.a, mv: [...new Set(m.mv)]}))}); mons += 6; } }
const off = readJSON('out/official.json'); const offTeams = [];
for (const E of off.events) for (const t of E.teams) offTeams.push({d: E.date, mons: t.mons.map(m => ({n: m.n, i: m.i, a: m.a, mv: m.mv}))});
const full = teams.filter(t => t.mons.every(m => m.mv.length === 4 && m.i && m.a)).length;
const dates = teams.map(t => t.d).sort();
console.log(`Limitless sheets: ${ev.length} events kept on disk, window=${WIN || 'all'} -> ${nev} events, ${dates[0]}..${dates[dates.length - 1]}; full-6 teams ${teams.length}, mon entries ${mons}, non-6 skipped ${partial}; teams where every mon has 4 moves+item+Ability ${full}; with w/l ${teams.filter(t => t.w != null).length}, with placing ${teams.filter(t => t.pl != null).length}`);
const od = off.events.map(e => e.date).sort();
console.log(`official.json: ${off.events.length} events ${od[0]}..${od[od.length - 1]}, teams ${offTeams.length}, mon entries ${offTeams.reduce((s, t) => s + t.mons.length, 0)}`);
function usage(TS) {
  const K = {mv: new Map(), i: new Map(), a: new Map()}; const N = TS.length;
  const add = (kind, x, n, t) => { if (!x) return; let o = K[kind].get(x); if (!o) K[kind].set(x, o = {teams: new Set(), users: new Map(), w: 0, g: 0});
    if (!o.teams.has(t)) { o.teams.add(t); if (TS[t].w != null) { o.w += TS[t].w; o.g += TS[t].w + TS[t].l; } } o.users.set(n, (o.users.get(n) || 0) + 1); };
  TS.forEach((T, t) => T.mons.forEach(m => { for (const x of m.mv) add('mv', x, m.n, t); add('i', m.i, m.n, t); add('a', m.a, m.n, t); }));
  const out = {N};
  for (const kind of ['mv', 'i', 'a']) out[kind] = [...K[kind]].map(([x, o]) => ({x, teams: o.teams.size, pct: +(100 * o.teams.size / N).toFixed(1), wr: o.g ? +(100 * o.w / o.g).toFixed(1) : null, g: o.g,
    users: [...o.users].sort((a, b) => b[1] - a[1])})).sort((a, b) => b.teams - a.teams);
  return out;
}
const U = usage(teams), UO = usage(offTeams);
const fmt = (r, k) => r.slice(0, k).map((e, i) => { const tot = e.users.reduce((s, u) => s + u[1], 0);
  return `${i + 1}. ${e.x} ${e.pct}% (${e.teams}) wr ${e.wr ?? '-'}% | users ${e.users.length}: ` + e.users.slice(0, 3).map(([n, c]) => `${n} ${(100 * c / tot).toFixed(0)}%`).join(', '); }).join('\n');
console.log(`\nTOUR N=${U.N}\nMOVES\n${fmt(U.mv, 15)}\nITEMS\n${fmt(U.i, 10)}\nABILITIES\n${fmt(U.a, 10)}`);
console.log(`\nOFFICIAL N=${UO.N}\nMOVES\n${fmt(UO.mv, 6)}\nITEMS\n${fmt(UO.i, 4)}`);
console.log(`\ndistinct seen: moves ${U.mv.length}, items ${U.i.length}, abilities ${U.a.length} (official: ${UO.mv.length}/${UO.i.length}/${UO.a.length})`);
const s = fs.readFileSync('app/src/data/move-meta.js', 'utf8');
const MM = JSON.parse(s.match(/const MOVE_META=(\{.*?\});?\s*$/m)[1]);
const legal = Object.keys(MM); const seen = new Map(U.mv.map(e => [e.x, e.teams]));
const b = th => legal.filter(m => (seen.get(m) || 0) < th).length;
console.log(`move-meta moves ${legal.length}: 0 teams ${b(1)}; <5 ${b(5)}; <20 ${b(20)}; <50 ${b(50)}; <100 ${b(100)}; >=100 ${legal.length - b(100)}; raw moves not in move-meta: ${U.mv.filter(e => !MM[e.x]).map(e => e.x + '(' + e.teams + ')').slice(0, 8).join(', ')}`);
const ib = (L, th) => L.filter(e => e.teams < th).length;
console.log(`items seen ${U.i.length}: <20 teams ${ib(U.i, 20)}; abilities seen ${U.a.length}: <20 teams ${ib(U.a, 20)}`);
const MT = readJSON('out/meta_tour.json'); const rows = [...MT.top, ...MT.more]; const top12 = new Map(); const covered = new Set();
for (const r of rows) for (const [m, p] of r.mv) { top12.set(m, (top12.get(m) || 0) + p * r.teams / 100); covered.add(m); }
console.log(`\nmeta_tour (${MT.period}; ${MT.source}; ${rows.length} mon rows): distinct moves across top-12 lists ${covered.size}`);
if (WIN === 28) {
  const raw = new Map(); for (const T of teams) for (const m of T.mons) for (const x of m.mv) raw.set(x, (raw.get(x) || 0) + 1);
  const lost = [...raw.keys()].filter(m => !covered.has(m)); const lostTeams = U.mv.filter(e => !covered.has(e.x));
  const totRaw = [...raw.values()].reduce((a, b) => a + b, 0), totKept = [...top12.values()].reduce((a, b) => a + b, 0);
  console.log(`28d raw distinct moves ${raw.size}; in NO top-12 list: ${lost.length}; of those on 20+ teams: ${lostTeams.filter(e => e.teams >= 20).map(e => e.x + ' ' + e.teams).join(', ')}`);
  console.log(`mon-move uses raw ${totRaw}, kept by top-100 rows x top-12 ~${Math.round(totKept)} (${(100 * totKept / totRaw).toFixed(1)}%)`);
  console.log(U.mv.slice(0, 15).map(e => `${e.x}: raw mon-uses ${raw.get(e.x)} vs top12-sum ${Math.round(top12.get(e.x) || 0)} (${(100 * (top12.get(e.x) || 0) / raw.get(e.x)).toFixed(0)}%)`).join('\n'));
  // a team-% from top-12 sums can't be built (no team ids); show naive "sum of per-mon % x mon usage" vs true team %
  console.log('naive sum-of-mons team% vs true team%: ' + U.mv.slice(0, 8).map(e => `${e.x} ${Math.min(999, 100 * (top12.get(e.x) || 0) / U.N).toFixed(1)} vs ${e.pct}`).join('; '));
}
for (const k of [5, 8]) { const t2 = {};
  for (const kind of ['mv', 'i', 'a']) t2[kind] = Object.fromEntries(U[kind].map(e => { const tot = e.users.reduce((s, u) => s + u[1], 0); return [e.x, [e.pct, e.teams, e.users.slice(0, k).map(([n, c]) => [n, Math.round(1000 * c / tot) / 10])]]; }));
  const j = JSON.stringify(t2); fs.writeFileSync(OUT + `table-top${k}-${WIN || 'all'}.json`, j);
  console.log(`table top-${k} users: ${(j.length / 1024).toFixed(1)} KB raw, ${(zlib.gzipSync(j).length / 1024).toFixed(1)} KB gzip`); }
// thin-data CI: 95% half-width at given n for p=10%,50%
console.log('95% margin (pct points) at p=50%: ' + [20, 50, 100, 200, 400].map(n => `n=${n} ±${(196 * Math.sqrt(.25 / n)).toFixed(1)}`).join(', '));
// win rate spread
const wr = U.mv.filter(e => e.teams >= 200).map(e => e.wr); console.log(`move team win rates (200+ teams): min ${Math.min(...wr)} max ${Math.max(...wr)}; base all teams ${(100 * teams.reduce((s, t) => s + t.w, 0) / teams.reduce((s, t) => s + t.w + t.l, 0)).toFixed(1)}`);
fs.writeFileSync(OUT + `full-${WIN || 'all'}.json`, JSON.stringify({N: U.N, mv: U.mv.map(e => [e.x, e.teams, e.pct, e.wr, e.g]), i: U.i.map(e => [e.x, e.teams, e.pct, e.wr, e.g]), a: U.a.map(e => [e.x, e.teams, e.pct, e.wr, e.g])}));
