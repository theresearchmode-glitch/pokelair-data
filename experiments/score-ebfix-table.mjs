// Before/after Strength Scores for the Nov 25 Strength Score fix (Kip job 35): the built page (app/dist/page.html) is loaded twice
// with today's out/ data, once with OLD_MODEL and once with NEW_MODEL as META.model, and the page's own gradeTeam scores the teams.
//   teams: the first 20 of out/teams.json; 10 random tournament teams (seed 7) from the last 7 days of out/matches.json;
//          3 teams with rarely used Pokémon (2 real teams holding the least-used Pokémon, 1 top team with one slot swapped for a
//          Pokémon with no games). Default sets (abMember: each Pokémon's most common complete tournament set), as the site shows them.
//   bands: every distinct real team sheet (team + its items, Abilities and moves) played in the last 45 days, built by the site's
//          own loader (memberOf, as experiments/golden.mjs does), share in each band.
// Usage: OLD_MODEL=<file> NEW_MODEL=<file> node experiments/score-ebfix-table.mjs   (build the page first)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, rd = f => { try { return JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), M = rd('matches.json'), T = rd('teams.json');
const base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': T, 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json')};
const evDate = M.events.map(e => e[1]), last = evDate.reduce((a, d) => d > a ? d : a, ''), since = d => new Date(new Date(last).getTime() - d * 864e5).toISOString().slice(0, 10);
const G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]);
// team appearances (distinct teams in games) per Pokémon
const used = new Set(); for (const g of G) { used.add(g[0]); used.add(g[1]); }
const monN = new Map(); for (const t of used) for (const n of M.teams[t].split('|')) monN.set(n, (monN.get(n) || 0) + 1);
// sheets
const sheetOf = d => { const set = {}; for (const f of M.decks[d].map(j => M.feats[j])) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m) continue; const s = set[m[1]] || (set[m[1]] = {it: null, ab: null, mv: []});
  if (m[2] === '@') s.it = m[3]; else if (m[2] === '#') s.ab = m[3]; else s.mv.push(m[3]); } return set; };
const s45 = since(45), seen = new Set(), sheets = [];
for (const g of G) { if (evDate[g[3]] < s45) continue; for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) { const k = t + ',' + d; if (seen.has(k)) continue; seen.add(k); sheets.push({mons: M.teams[t].split('|'), set: d != null && M.decks[d] ? sheetOf(d) : null}); } }
// 10 random tournament teams of the last 7 days (not ladder "events")
let st = 7; const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; };
const s7 = since(7), recent = [...new Set(G.filter(g => evDate[g[3]] >= s7 && !String(M.events[g[3]][0]).startsWith('sd-')).flatMap(g => [g[0], g[1]]))].sort((a, b) => a - b);
const pick = []; while (pick.length < 10 && pick.length < recent.length) { const t = recent[Math.floor(rnd() * recent.length)]; if (!pick.includes(t)) pick.push(t); }
// rare: real teams holding the least-used Pokémon (1-5 team appearances), the two with the rarest member
const rareReal = [...used].map(t => ({t, mons: M.teams[t].split('|')})).map(o => ({...o, r: Math.min(...o.mons.map(n => monN.get(n)))})).filter(o => o.r <= 5).sort((a, b) => a.r - b.r || a.t - b.t).slice(0, 2);
const groups = [
  ...T.teams.slice(0, 20).map(t => ({grp: 'top20', mons: t.mons, note: t.event + ' ' + t.record})),
  ...pick.map(t => ({grp: 'recent', mons: M.teams[t].split('|'), note: 'played ' + M.events[G.filter(g => (g[0] === t || g[1] === t) && evDate[g[3]] >= s7).at(-1)[3]][1]})),
  ...rareReal.map(o => ({grp: 'rare', mons: o.mons, note: 'real team; rarest member on ' + o.r + ' team(s)'}))];
const page = ROOT + `app/score-ebfix-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
async function scoreWith(modelFile) {
  const D = {...base, 'meta/model': JSON.parse(fs.readFileSync(modelFile, 'utf8'))};
  const pg = await (await b.newContext()).newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, D);
  await pg.goto('file://' + page); await pg.waitForTimeout(4000);
  const res = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{ const GR = ${JSON.stringify(groups)}, SH = ${JSON.stringify(sheets)};
    const g = ms => { try { return gradeTeam(ms); } catch (e) { return null; } }, mk = ns => ns.every(n => byName.get(n)) ? ns.map(n => abMember(byName.get(n))) : null;
    const fromSet = (ns, set) => { if (!set || !ns.every(n => byName.get(n))) return mk(ns); try { return ns.map((n, i) => { const s = set[n] || {}; const p = byName.get(n), mv = (s.mv || []).filter(x => mvByName.has(x)).slice(0, 4);
      return memberOf({n, a: s.ab && p.a.includes(s.ab) ? s.ab : null, lock: false, ...(mv.length ? {mv: {doubles: mv}} : {}), ...(!p.m && s.it ? {it: {doubles: s.it}} : {})}, i); }).filter(Boolean); } catch (e) { return null; } };
    /* the constructed rare team: the first top team with one non-Mega slot swapped for a legal Pokémon with no games (unseen) */
    const usedN = new Set(${JSON.stringify([...monN.keys()])}), top = GR[0].mons, unseen = ROSTER.filter(p => !p.m && !isExcl(p) && !usedN.has(p.n) && !top.some(n => (byName.get(n) || {}).b === p.b)).sort((a, b) => viability(b) - viability(a))[0];
    const swapAt = top.findIndex(n => !(byName.get(n) || {}).m && !/Incineroar|Rillaboom/.test(n)), cons = top.slice(); if (unseen && swapAt >= 0) cons[swapAt] = unseen.n;
    const rows = [...GR, {grp: 'rare', mons: cons, note: 'constructed: ' + top[swapAt] + ' swapped for ' + (unseen && unseen.n) + ' (no games)'}].map(r => { const ms = mk(r.mons), s = ms ? g(ms) : null; return {...r, s, w: s == null ? '' : CH.wordOf(s)}; });
    const sh = SH.map(x => { const ms = fromSet(x.mons, x.set); return ms && ms.length === 6 ? g(ms) : null; });
    return JSON.stringify({rows, sh, meanX: META.model.meanX}); })()`));
  await pg.close(); return {...res, errs};
}
const O = await scoreWith(process.env.OLD_MODEL), N = await scoreWith(process.env.NEW_MODEL);
await b.close(); fs.unlinkSync(page);
const f1 = v => v == null ? '  -  ' : v.toFixed(1).padStart(5);
console.log(`=== score-ebfix-table (matches updated ${M.updated}, last event ${last}) old=${process.env.OLD_MODEL} (meanX ${O.meanX}) new=${process.env.NEW_MODEL} (meanX ${N.meanX})`);
console.log('group  | team | old | new | change');
O.rows.forEach((r, i) => { const n = N.rows[i]; console.log(`${r.grp.padEnd(6)} | ${r.mons.join(', ')} | ${f1(r.s)} ${r.w} | ${f1(n.s)} ${n.w} | ${r.s != null && n.s != null ? (n.s - r.s >= 0 ? '+' : '') + (n.s - r.s).toFixed(1) : '-'} | ${r.note}`); });
const bands = [[90, 'Top tier'], [80, 'Tournament ready'], [70, 'Solid'], [60, 'Needs work'], [-1, 'Missing a basic']];
const share = arr => { const v = arr.filter(x => x != null); return {n: v.length, nul: arr.length - v.length, b: bands.map(([lo], i) => v.filter(x => x >= lo && (i === 0 || x < bands[i - 1][0])).length / v.length), bad: v.filter(x => !isFinite(x) || x < 0 || x > 100).length, med: v.slice().sort((a, c) => a - c)[v.length >> 1]}; };
const so = share(O.sh), sn = share(N.sh), d = O.sh.map((x, i) => x != null && N.sh[i] != null ? N.sh[i] - x : null).filter(x => x != null).sort((a, c) => a - c);
console.log(`\nBand shares, ${sheets.length} distinct real team sheets of the last 45 days (since ${s45}), page scores (old n=${so.n}, new n=${sn.n}; not scorable old ${so.nul}, new ${sn.nul}):`);
bands.forEach(([lo, w], i) => console.log(`  ${w.padEnd(17)} old ${(so.b[i] * 100).toFixed(1).padStart(5)}%   new ${(sn.b[i] * 100).toFixed(1).padStart(5)}%`));
console.log(`  median old ${so.med} new ${sn.med}; change per sheet: min ${d[0].toFixed(1)}, 5% ${d[Math.floor(d.length * .05)].toFixed(1)}, median ${d[d.length >> 1].toFixed(1)}, 95% ${d[Math.floor(d.length * .95)].toFixed(1)}, max ${d[d.length - 1].toFixed(1)}`);
console.log(`  outside 0-100 or not finite: old ${so.bad}, new ${sn.bad}; page errors: old ${O.errs.length}, new ${N.errs.length}${O.errs.concat(N.errs).length ? ' ' + JSON.stringify(O.errs.concat(N.errs).slice(0, 3)) : ''}`);
