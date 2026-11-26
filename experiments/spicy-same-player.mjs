// spicy-same-player.mjs (HH, Nov 26 night): does a rare pick win because of the PLAYER or the Pokémon? Within-player comparison:
// players who brought the Pokémon at some Reg M-C events and not at others; their game win rate with vs without it.
import fs from 'fs'; import path from 'path';
const idx = JSON.parse(fs.readFileSync('data/index.json', 'utf8')).tournaments, mons = (process.argv[2] || 'Annihilape,Basculegion-F,Kommo-o,Glimmora,Rillaboom').split(',');
const P = new Map(); // player -> list of {set:Set, w, g}
for (const [id, v] of Object.entries(idx)) { if (v.f !== 'M-C') continue; let d; try { d = JSON.parse(fs.readFileSync(path.join('data/t2', id + '.json'), 'utf8')); } catch (e) { continue; }
  for (const x of d.e || []) { if (!x.id || !Array.isArray(x.dk) || x.dk.length < 6) continue; const g = (x.w || 0) + (x.l || 0); if (!g) continue;
    if (!P.has(x.id)) P.set(x.id, []); P.get(x.id).push({set: new Set(x.dk.map(m => m.n === 'Basculegion' && /F/.test(m.g || '') ? 'Basculegion-F' : m.n)), w: x.w, g}); } }
for (const m of mons) { let n = 0, gW = 0, gWo = 0, dSum = 0, wSum = 0;
  for (const runs of P.values()) { const a = runs.filter(r => r.set.has(m)), b = runs.filter(r => !r.set.has(m)); if (!a.length || !b.length) continue;
    const ga = a.reduce((s, r) => s + r.g, 0), gb = b.reduce((s, r) => s + r.g, 0); if (ga < 5 || gb < 5) continue;
    const wa = a.reduce((s, r) => s + r.w, 0) / ga, wb = b.reduce((s, r) => s + r.w, 0) / gb, wt = Math.min(ga, gb); n++; gW += ga; gWo += gb; dSum += (wa - wb) * wt; wSum += wt; }
  console.log(`${m}: ${n} players with 5+ games both ways (${gW} games with, ${gWo} without) · same player, with minus without: ${n ? (dSum / wSum * 100 >= 0 ? '+' : '') + (dSum / wSum * 100).toFixed(1) + ' points' : 'n/a'}`); }
