// Top-tier overlap with the outside tier lists: each list's top tier vs our S+A, for two rating dumps (old, new).
// Usage: node experiments/tier-overlap.mjs old.json new.json
import fs from 'node:fs';
const rd = f => { const s = fs.readFileSync(f, 'utf8'); const j = JSON.parse(s.slice(s.search(/[\[{]/))); return Array.isArray(j) ? j : j.all; };
const src = fs.readFileSync('app/src/app/13-rating.js', 'utf8'), OUT = JSON.parse(src.match(/data: (\{"pz".*\})\};/)[1]);
const topTier = {pz: 4, synergy: 3, poketools: 4};
for (const f of process.argv.slice(2)) { const R = new Map(rd(f).map(x => [x.n, x.t])), SA = new Set([...R].filter(([, t]) => t >= 70).map(([n]) => n)), S = new Set([...R].filter(([, t]) => t >= 80).map(([n]) => n));
  const row = {}; for (const [k, L] of Object.entries(OUT)) { const tt = Object.keys(L).filter(n => L[n] === topTier[k]); row[k] = `${tt.filter(n => SA.has(n)).length}/${tt.length} in our S+A, ${tt.filter(n => S.has(n)).length} in S`; }
  const consensus = Object.keys(OUT.pz).concat(Object.keys(OUT.synergy), Object.keys(OUT.poketools)), cs = new Set(consensus);
  row.ourS_notInAnyList = [...S].filter(n => !cs.has(n)); console.log(f.split(/[\\/]/).pop(), JSON.stringify(row)); }
