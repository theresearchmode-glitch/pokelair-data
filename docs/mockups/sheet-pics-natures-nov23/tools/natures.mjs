// LOOK-ONLY: nature usage on Online tournament teams, last 28 days, same filter as info-sheets-nov22/tools/sample.mjs.
// Reads C:/Users/simra/code/pl-pcrun, writes natures-28.json next to this file.
import fs from 'node:fs';
const R = 'C:/Users/simra/code/pl-pcrun/', OUT = new URL('./natures-28.json', import.meta.url);
process.chdir(R);
const {readJSON, canonSet} = await import('file:///' + R + 'names.mjs');
const {offFormat, oddEvents, sameReg} = await import('file:///' + R + 'formats.mjs');
const FORMAT = readJSON('out/reg.json').id, index = readJSON('data/index.json');
const KEEP0 = Object.keys(index.tournaments).filter(id => sameReg(index.tournaments[id], FORMAT) && !offFormat(index.tournaments[id].name));
const ODD = oddEvents(KEEP0, id => readJSON(`data/t/${id}.json`, null), () => {});
const ev = KEEP0.filter(id => !ODD.has(id)).map(id => readJSON(`data/t2/${id}.json`, null)).filter(Boolean).sort((a, b) => new Date(a.d) - new Date(b.d));
const DAY = 864e5, lastD = new Date(ev[ev.length - 1].d).getTime();
const NAT = ['Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile','Relaxed','Impish','Lax','Timid','Hasty','Serious','Jolly','Naive','Modest','Mild','Quiet','Bashful','Rash','Calm','Gentle','Sassy','Careful','Quirky'];
const canonNat = s => { const t = (s || '').trim().toLowerCase(); return NAT.find(n => n.toLowerCase() === t) || null; };
let N = 0, slots = 0, noNat = 0, odd = new Map(), first = null, last = null;
const cnt = new Map(), teamsWith = new Map(), monTot = new Map(), monNat = new Map();
for (const T of ev) { if (lastD - new Date(T.d) > 28 * DAY) continue; const d = T.d.slice(0, 10); first = first && first < d ? first : d; last = last && last > d ? last : d;
  for (const p of T.e) { const raw = p.dk || []; if (raw.length !== 6) continue; N++; const seen = new Set();
    raw.forEach(m0 => { const m = canonSet(m0), nat = canonNat(m0.nt); slots++;
      if (!nat) { noNat++; if (m0.nt) odd.set(m0.nt, (odd.get(m0.nt) || 0) + 1); return; }
      cnt.set(nat, (cnt.get(nat) || 0) + 1); seen.add(nat); monTot.set(m.n, (monTot.get(m.n) || 0) + 1);
      const k = nat + '|' + m.n; monNat.set(k, (monNat.get(k) || 0) + 1); });
    seen.forEach(n => teamsWith.set(n, (teamsWith.get(n) || 0) + 1)); } }
const withNat = slots - noNat, res = {N, slots, withNat, noNat, odd: [...odd].sort((a, b) => b[1] - a[1]).slice(0, 12), first, last, nat: {}};
for (const n of NAT) { const users = [...monNat].filter(([k]) => k.startsWith(n + '|')).map(([k, c]) => [k.split('|')[1], c, monTot.get(k.split('|')[1])]).sort((a, b) => b[1] - a[1]);
  res.nat[n] = {mons: cnt.get(n) || 0, pctMons: +(100 * (cnt.get(n) || 0) / withNat).toFixed(1), teams: teamsWith.get(n) || 0, pctTeams: +(100 * (teamsWith.get(n) || 0) / N).toFixed(1),
    nUsers: users.length, users: users.slice(0, 8).map(([p, c, t]) => [p, c, +(100 * c / t).toFixed(0), t])}; }
fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
console.log(`teams ${N}, Pokemon ${slots}, with nature ${withNat}, none/unreadable ${noNat}; ${first}..${last}`);
console.log(NAT.map(n => [n, res.nat[n].pctMons, res.nat[n].pctTeams, res.nat[n].users.slice(0, 3).map(u => u[0] + ' ' + u[2] + '%').join(', ')]).sort((a, b) => b[1] - a[1]).map(r => r.join(' | ')).join('\n'));
console.log('odd values', JSON.stringify(res.odd));
