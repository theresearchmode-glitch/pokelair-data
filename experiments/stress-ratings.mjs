// Stress test: ratings v3 under perturbation. Rebuilds the top-cut evidence (topcut.mjs) from the raw Limitless events
// with one thing changed (drop an event, drop 10% of teams, move the date window, duplicate an event, inject a fake 8-0
// team of junk Pokémon), loads it into the page and compares the ratings and hidden-gem tags with the baseline.
// Ratings must move sensibly, and one junk team must never create a top-rated Pokémon or a gem.
// Usage: node experiments/stress-ratings.mjs   (exit 1 on any failure)
import fs from 'node:fs'; import {fileURLToPath} from 'node:url'; import {openPage} from './stress-lib.mjs'; import {topcut, makeNameOf} from '../topcut.mjs';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), rdj = f => { try { return JSON.parse(fs.readFileSync(ROOT + f, 'utf8').replace(/^﻿/, '')); } catch (e) { return null; } };
const V2 = fs.readdirSync(ROOT + 'data/t2').map(f => rdj('data/t2/' + f)).filter(T => T && T.v === 3);
const R = rdj('out/replays.json'), REP = Array.isArray(R) ? R : R ? (Object.values(R).find(Array.isArray) || []) : [];
const nameOf = makeNameOf(rdj('roster.json') || []), M = rdj('out/matches.json');
const clone = x => JSON.parse(JSON.stringify(x));
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const big = V2.map((T, i) => ({i, p: T.p || 0, d: T.d})).sort((a, b) => b.p - a.p);
const newest = V2.map(T => String(T.d).slice(0, 10)).sort().pop();
const shift = days => { const cut = new Date(new Date(newest) - days * 864e5).toISOString().slice(0, 10); return V2.filter(T => String(T.d).slice(0, 10) <= cut); };
// the fake: a 1st-place 8-0 team of six Pokémon real players never bring, at the newest big event
const junkSets = ['Watchog', 'Vileplume', 'Wigglytuff', 'Dedenne', 'Sableye', 'Chimecho'].map(n => ({n, i: 'Leftovers', a: '', mv: ['Protect'], t: '', nt: 'Hardy'}));
const inject = (copies) => { const V = clone(V2); const ev = V.filter(T => (T.p || 0) >= 64).sort((a, b) => String(b.d).localeCompare(String(a.d)))[0];
  for (let k = 0; k < copies; k++) ev.e.push({id: 'fake' + k, nm: 'Fake ' + k, pl: 1, w: 8, l: 0, ti: 0, dk: clone(junkSets)}); return V; };
const variants = [['baseline', V2],
  ...big.slice(0, 3).map(b => [`drop biggest event #${big.indexOf(b) + 1} (${b.p} players)`, V2.filter((_, i) => i !== b.i)]),
  ['drop a random mid event', (() => { const mid = big[Math.floor(big.length / 2)]; return V2.filter((_, i) => i !== mid.i); })()],
  ...[1, 2, 3].map(s => [`drop 10% of teams (seed ${s})`, (seed = s * 101, V2.map(T => ({...T, e: (T.e || []).filter(() => rnd() >= .1)})))]),
  ['window 3 days earlier', shift(3)], ['window 7 days earlier', shift(7)],
  ['duplicate the biggest event', [...V2, clone(V2[big[0].i])]],
  ['inject one fake 8-0 junk team', inject(1)], ['inject three fake 8-0 junk teams', inject(3)]];
const tcs = variants.map(([k, V]) => [k, topcut(V, nameOf, M, REP)]);
const {ev, errs, close} = await openPage();
const out = [];
for (const [k, tc] of tcs) out.push([k, await ev(`(()=>{RES.tc=__arg;ratingCache={key:null};trapCache={key:null,set:null};const m=ratings();
  return ROSTER.map(p=>{const r=m.get(p.n);return [p.n,r?r.total:0,isGem(p)?1:0,r&&r.tc?Math.round(r.tc.g):0]})})()`, tc)]);
await close();
const base = new Map(out[0][1].map(r => [r[0], r])), fails = [], must = (c, m) => { if (!c) fails.push(m); };
const rank = arr => { const s = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), r = new Array(arr.length); let i = 0; while (i < s.length) { let j = i; while (j + 1 < s.length && s[j + 1][0] === s[i][0]) j++; for (let k = i; k <= j; k++) r[s[k][1]] = (i + j) / 2; i = j + 1; } return r; };
const spear = (a, b) => { const ra = rank(a), rb = rank(b), n = a.length, ma = ra.reduce((x, y) => x + y, 0) / n, mb = rb.reduce((x, y) => x + y, 0) / n; let c = 0, va = 0, vb = 0; for (let i = 0; i < n; i++) { c += (ra[i] - ma) * (rb[i] - mb); va += (ra[i] - ma) ** 2; vb += (rb[i] - mb) ** 2; } return c / Math.sqrt(va * vb); };
const top = (rows, n) => new Set(rows.slice().sort((a, b) => b[1] - a[1]).slice(0, n).map(r => r[0]));
const bTop10 = top(out[0][1], 10), bTop40 = top(out[0][1], 40), bGems = new Set(out[0][1].filter(r => r[2]).map(r => r[0]));
console.log(`baseline: ${out[0][1].filter(r => r[3] > 0).length} rated from results; top 10: ${[...bTop10].join(', ')}; gems: ${[...bGems].join(', ') || 'none'}`);
for (const [k, rows] of out.slice(1)) {
  const used = rows.filter(r => base.get(r[0])[3] >= 300), a = used.map(r => base.get(r[0])[1]), b = used.map(r => r[1]);
  const rho = spear(a, b), d = rows.map(r => [r[0], r[1] - base.get(r[0])[1], base.get(r[0])[3]]), big = d.filter(x => x[2] >= 300).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]))[0];
  const t10 = [...top(rows, 10)].filter(n => bTop10.has(n)).length, newTop = [...top(rows, 20)].filter(n => !bTop40.has(n));
  const gems = rows.filter(r => r[2]).map(r => r[0]), newGems = gems.filter(n => !bGems.has(n));
  console.log(`${k.padEnd(34)} rho ${rho.toFixed(3)}  top-10 kept ${t10}/10  biggest move (300+ games) ${big[0]} ${big[1] > 0 ? '+' : ''}${big[1]}  new in top 20: ${newTop.join(', ') || '-'}  new gems: ${newGems.join(', ') || '-'}`);
  const junk = junkSets.map(s => s.n).map(n => rows.find(r => r[0] === n)).filter(Boolean);
  if (/junk/.test(k)) { console.log(`   junk ratings: ${junk.map(r => `${r[0]} ${base.get(r[0])[1]}->${r[1]}${r[2] ? ' GEM' : ''}`).join(', ')}`);
    for (const r of junk) { must(r[1] < 50, `${k}: ${r[0]} rated ${r[1]} from one fake team`); must(!r[2], `${k}: ${r[0]} became a hidden gem from one fake team`); } }
  must(!newGems.length || /window/.test(k), `${k}: hidden gems appear from noise: ${newGems.join(', ')}`);
  must(rho >= (/10%|drop/.test(k) ? .93 : .9), `${k}: rank agreement only ${rho.toFixed(3)}`);
  must(t10 >= 7, `${k}: only ${t10} of the top 10 kept`);
  must(!newTop.length || /window 7/.test(k), `${k}: new top-20 Pokémon from outside the old top 40: ${newTop.join(', ')}`);
  must(Math.abs(big[1]) <= (/window 7/.test(k) ? 20 : 15), `${k}: ${big[0]} moved ${big[1]} points`);
}
for (const f of fails) console.log('  FAIL', f);
console.log(`page errors: ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
console.log(fails.length || errs.length ? `STRESS RATINGS: ${fails.length + errs.length} failures` : 'STRESS RATINGS CLEAN'); process.exit(fails.length || errs.length ? 1 : 0);
