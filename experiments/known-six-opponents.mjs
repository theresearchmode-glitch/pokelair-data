// Cause (c) in one number per bin: how strong (page win chance against the field, e) the OPPONENTS of each prior-games bin were,
// next to the field average a random real sheet would face (50% by construction of e). Reads the same capture as known-six-bias.mjs.
// Usage: NEW_WORK=<dir> WORK=<dir> node experiments/known-six-opponents.mjs
import fs from 'node:fs';
const WORK = process.env.WORK.replace(/\/?$/, '/'), NEW = process.env.NEW_WORK.replace(/\/?$/, '/'), C = JSON.parse(fs.readFileSync(WORK + 'capture.json', 'utf8'));
const B = [['0', n => n === 0], ['1-29', n => n >= 1 && n < 30], ['30-99', n => n >= 30 && n < 100], ['100-299', n => n >= 100 && n < 300], ['300+', n => n >= 300]], acc = {};
let all = [0, 0, 0];
for (const w of C.windows) { const MF = JSON.parse(fs.readFileSync(NEW + `matches-${w.from}.json`, 'utf8')), cnt = new Map();
  for (const g of MF.m) { if (g[2] === .5 || g[0] === g[1]) continue; for (const t of [g[0], g[1]]) { const k = MF.teams[t].split('|').slice().sort().join('|'); cnt.set(k, (cnt.get(k) || 0) + 1); } }
  for (const [ia, ib, r, , mode] of w.games) { const A = w.sheets[ia], O = w.sheets[ib]; if (!A || !O) continue;
    for (const [S, P, won] of [[A, O, r], [O, A, 1 - r]]) { const n = cnt.get(S.key) || 0, b = B.find(x => x[1](n))[0], k = mode + ' ' + b, a = acc[k] || (acc[k] = [0, 0, 0, 0]);
      a[0]++; a[1] += S.e; a[2] += P.e; a[3] += won; all[0]++; all[1] += S.e; all[2] += won; } } }
console.log(`all team results: ${all[0]}; mean said (e) ${(100 * all[1] / all[0]).toFixed(1)}%, mean won ${(100 * all[2] / all[0]).toFixed(1)}%`);
for (const m of ['bo1', 'bo3']) for (const [b] of B) { const a = acc[m + ' ' + b]; if (a) console.log(`  ${m} ${b.padEnd(8)} n=${String(a[0]).padStart(5)}  said ${(100 * a[1] / a[0]).toFixed(1)}%  won ${(100 * a[3] / a[0]).toFixed(1)}%  opponents' own e ${(100 * a[2] / a[0]).toFixed(1)}%`); }
