// How real Trick Room teams are built, and how they do: for every Limitless team+deck with games, does it run Trick Room,
// how many members are slow (base Speed), does anyone hold Choice Scarf, and its game win rate. Also official top-64 sheets.
// Usage: node experiments/tr-coherence.mjs   (needs app/dist/page.html)
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const ROOT = fileURLToPath(new URL('../', import.meta.url)), APP = ROOT + 'app/', rd = f => JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8'));
const M = rd('matches.json'), OFF = rd('official.json'), teams = M.teams.map(k => k.split('|')), feats = M.feats;
const agg = new Map(); for (const [A, B, r, , , , , dA, dB] of M.m) { if (r === .5) continue; for (const [t, d, w] of [[A, dA, r], [B, dB, 1 - r]]) { const k = t + ',' + d; const e = agg.get(k) || {t, d, w: 0, n: 0}; e.w += w; e.n++; agg.set(k, e); } }
const rows = [...agg.values()].filter(e => e.d != null).map(e => { const it = {}, mv = {}; for (const f of M.decks[e.d] || []) { const s = feats[f], i = s.indexOf('@'), j = s.indexOf(':');
  if (i > 0 && (j < 0 || i < j)) it[s.slice(0, i)] = s.slice(i + 1); else if (j > 0) (mv[s.slice(0, j)] = mv[s.slice(0, j)] || []).push(s.slice(j + 1)); }
  return {src: 'lim', w: e.w, n: e.n, team: teams[e.t].map(n => ({n, it: it[n] || null, mv: mv[n] || []}))}; });
for (const ev of OFF.events) for (const t of ev.teams) rows.push({src: 'off', place: t.st, team: t.mons.map(m => ({n: m.n, it: m.i, mv: m.mv || []}))});
const page = APP + 'trc.html'; fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch(), pg = await b.newPage(); await pg.goto('file://' + page); await pg.waitForTimeout(2500);
const out = await pg.evaluate(rows => window.__ev(`(function(rows){return rows.map(r=>{const ps=r.team.map(m=>byName.get(m.n));if(ps.some(p=>!p))return null;
  const tr=r.team.filter(m=>m.mv.includes('Trick Room')).length,spe=ps.map(p=>p.st[5]),slow60=spe.filter(s=>s<=60).length,slow50=spe.filter(s=>s<=50).length,slow70=spe.filter(s=>s<=70).length;
  const slowNS=r.team.filter((m,i)=>!m.mv.includes('Trick Room')&&spe[i]<=60).length;const scarf=r.team.filter(m=>m.it==='Choice Scarf').length,tw=r.team.filter(m=>m.mv.includes('Tailwind')).length;
  const its=r.team.map(m=>m.it).filter(Boolean),dup=its.length-new Set(its).size;
  return {tr,slow60,slow50,slow70,slowNS,scarf,tw,dup}})})(${JSON.stringify(rows)})`), rows);
await b.close(); fs.unlinkSync(page);
rows.forEach((r, i) => Object.assign(r, out[i] || {skip: true}));
const L = rows.filter(r => r.src === 'lim' && !r.skip), O = rows.filter(r => r.src === 'off' && !r.skip);
const wr = a => { const w = a.reduce((x, r) => x + r.w, 0), n = a.reduce((x, r) => x + r.n, 0); return n ? (100 * w / n).toFixed(1) + '% (' + n + ' games, ' + a.length + ' teams)' : '-'; };
console.log('Limitless team+decks:', L.length, ' with TR:', L.filter(r => r.tr).length, ' duplicate items:', L.filter(r => r.dup).length);
for (const k of ['slow50', 'slow60', 'slow70']) { console.log(`TR teams by ${k}:`); for (let c = 0; c <= 6; c++) { const a = L.filter(r => r.tr && r[k] === c); if (a.length) console.log('  ', c, wr(a)); } }
console.log('TR + Choice Scarf:', wr(L.filter(r => r.tr && r.scarf)), ' TR no scarf:', wr(L.filter(r => r.tr && !r.scarf)));
console.log('TR + Tailwind both:', wr(L.filter(r => r.tr && r.tw)), ' TR only:', wr(L.filter(r => r.tr && !r.tw)));
console.log('all teams:', wr(L));
for (const tw of [0, 1]) { console.log('TR teams ' + (tw ? 'WITH' : 'without') + ' Tailwind, by slow60:'); for (let c = 0; c <= 5; c++) { const a = L.filter(r => r.tr && (r.tw > 0) === !!tw && r.slow60 === c); if (a.length) console.log('  ', c, wr(a)); } }
console.log('TR-only teams (no Tailwind) by slow NON-setters (base Spe<=60):'); for (let c = 0; c <= 5; c++) { const a = L.filter(r => r.tr && !r.tw && r.slowNS === c); if (a.length) console.log('  ', c, wr(a), ' official top64:', O.filter(r => r.tr && !r.tw && r.slowNS === c).length, ' top8:', O.filter(r => r.place <= 8 && r.tr && !r.tw && r.slowNS === c).length); }
console.log('TR-only + scarf:', wr(L.filter(r => r.tr && !r.tw && r.scarf)), ' TR-only no scarf:', wr(L.filter(r => r.tr && !r.tw && !r.scarf)));
console.log('TR setters count: 1', wr(L.filter(r => r.tr === 1)), ' 2+', wr(L.filter(r => r.tr >= 2)));
console.log('Official top-64 with TR:', O.filter(r => r.tr).length, '/', O.length, ' slow60 counts:', JSON.stringify([0, 1, 2, 3, 4, 5, 6].map(c => O.filter(r => r.tr && r.slow60 === c).length)), ' TR+scarf:', O.filter(r => r.tr && r.scarf).length, ' dup items:', O.filter(r => r.dup).length);
console.log('Official top-8 with TR slow60 counts:', JSON.stringify([0, 1, 2, 3, 4, 5, 6].map(c => O.filter(r => r.place <= 8 && r.tr && r.slow60 === c).length)));
