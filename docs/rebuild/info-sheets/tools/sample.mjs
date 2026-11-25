// LOOK-ONLY: reads C:/Users/simra/code/pl-pcrun. Writes only into this scratch folder.
import fs from 'node:fs';
import zlib from 'node:zlib';
const R = 'C:/Users/simra/code/pl-pcrun/';
const OUT = 'C:/Users/simra/code/pl-info/docs/rebuild/mocks/info-sheets-nov22/tools/';
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
const WIN = 28;
const teams = []; let mons = 0, partial = 0, nev = 0;
for (const T of ev) { if (WIN && lastD - new Date(T.d) > WIN * DAY) continue; nev++;
  for (const p of T.e) { const dk = (p.dk || []).map(canonSet); if (dk.length !== 6) { partial++; continue; }
    teams.push({d: T.d.slice(0, 10), w: p.w, l: p.l, pl: p.pl, P: T.p, mons: dk.map(m => ({n: m.n, i: m.i, a: m.a, mv: [...new Set(m.mv)]}))}); mons += 6; } }
const off = readJSON('out/official.json'); const offTeams = [];
for (const E of off.events) for (const t of E.teams) offTeams.push({d: E.date, mons: t.mons.map(m => ({n: m.n, i: m.i, a: m.a, mv: m.mv}))});
const full = teams.filter(t => t.mons.every(m => m.mv.length === 4 && m.i && m.a)).length;
const N = teams.length, monTot = new Map();
for (const T of teams) for (const m of T.mons) monTot.set(m.n, (monTot.get(m.n) || 0) + 1);
const pick = {mv: ['Rock Slide', 'Fake Out', 'Wide Guard', 'Psych Up', 'Heavy Slam'], a: ['Intimidate', 'Unseen Fist'], i: ['Focus Sash', 'Sitrus Berry']};
const res = {N, first: teams.map(t=>t.d).sort()[0], last: teams.map(t=>t.d).sort().pop()};
for (const [kind, list] of Object.entries(pick)) for (const x of list) {
  const tset = new Set(), users = new Map();
  teams.forEach((T, t) => T.mons.forEach(m => { const has = kind === 'mv' ? m.mv.includes(x) : m[kind] === x; if (has) { tset.add(t); users.set(m.n, (users.get(m.n) || 0) + 1); } }));
  res[x] = {kind, teams: tset.size, pct: +(100 * tset.size / N).toFixed(1), nUsers: users.size, users: [...users].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, c]) => [n, c, +(100 * c / monTot.get(n)).toFixed(0), monTot.get(n)])};
}
fs.writeFileSync(OUT + 'sample-28.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
