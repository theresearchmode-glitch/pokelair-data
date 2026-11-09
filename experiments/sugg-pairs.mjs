// d5-sugg (Nov 9): do suggestions that BREAK a pair real players run together do worse? For each Suggestion 1 (rows from
// sugg-real.mjs), pair support = how many distinct real tournament sixes (out/matches.json teams with 1+ game) contain both
// Pokémon (base forms). lost = the removed Pokémon's strongest pair with the five that stay; gained = the added one's.
// Split by lost − gained (pair support given up) and compare the real change (closest real teams, as in sugg-real.mjs).
// Usage: node experiments/sugg-pairs.mjs <rows.json>
import fs from 'node:fs';
const ROOT = new URL('../', import.meta.url).pathname, MT = JSON.parse(fs.readFileSync(ROOT + 'out/matches.json', 'utf8')), R = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const base = n => n.replace(/-Mega.*$/, ''), played = new Set(); for (const g of MT.m) { played.add(g[0]); played.add(g[1]); }
const pc = new Map(), key = (a, b) => a < b ? a + '|' + b : b + '|' + a;
MT.teams.forEach((k, i) => { if (!played.has(i)) return; const t = [...new Set(k.split('|').map(base))]; for (let a = 0; a < t.length; a++) for (let b = a + 1; b < t.length; b++) { const q = key(t[a], t[b]); pc.set(q, (pc.get(q) || 0) + 1); } });
const pair = (a, b) => pc.get(key(base(a), base(b))) || 0;
const band = g => g < 60 ? 'under 60' : g < 85 ? '60-85' : '85+', rows = [];
for (const r of R) { if (r.err || !r.before || r.before.ng < 30) continue; const s = r.sugg.find(x => x.rank === 1); if (!s || s.after.ng < 30 || s.ch.length !== 1) continue;
  const [o, n] = s.ch[0].split(' -> '); if (o === '(empty)') continue; const keep = r.names.filter(x => x !== o);
  const lost = Math.max(...keep.map(k => pair(o, k))), gained = Math.max(...keep.map(k => pair(n, k)));
  rows.push({b: band(r.gBase), lost, gained, d: lost - gained, real: (s.after.wr - r.before.wr) * 100, o, n}); }
const boot = d => { if (d.length < 5) return `${d.length} teams (too few)`; let q = 11; const m = []; for (let i = 0; i < 2000; i++) { let t = 0; for (let j = 0; j < d.length; j++) { q = (q * 16807) % 2147483647; t += d[q % d.length]; } m.push(t / d.length); } m.sort((a, b) => a - b); return `${d.length} teams, real ${(d.reduce((a, x) => a + x, 0) / d.length).toFixed(1)} (${m[50].toFixed(1)} to ${m[1949].toFixed(1)})`; };
const all = rows.map(x => x.d).sort((a, b) => a - b), med = all[all.length >> 1];
console.log(`${rows.length} one-swap Suggestion 1s · pair support given up (lost − gained), median ${med} sixes`);
for (const B of ['under 60', '60-85', 'all']) { const S = rows.filter(x => B === 'all' || x.b === B);
  console.log(`${B}: gives up more pair support (> ${med}): ${boot(S.filter(x => x.d > med).map(x => x.real))} · gives up less: ${boot(S.filter(x => x.d <= med).map(x => x.real))}`);
  const lm = S.map(x => x.lost).sort((a, b) => a - b), gm = S.map(x => x.gained).sort((a, b) => a - b); console.log(`   median strongest pair lost ${lm[lm.length >> 1]}, gained ${gm[gm.length >> 1]}`); }
