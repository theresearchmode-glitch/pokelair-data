// The "how sure" word (CH.sureOf: Low / Medium / High) on every distinct real team sheet of the last 45 days, with the new model's
// pairSd0 (.047, from lp 225) against the value the verified variant kept (.058). Same sheets and loader as score-ebfix-table.mjs.
// MODEL=<new model file>; OLD_MODEL=<old model file> (optional) adds the word with the old model as it stands, for context.
// Usage: MODEL=… [OLD_MODEL=…] node experiments/sure-word-check.mjs   (build the page first)
import fs from 'node:fs'; import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
const ROOT = new URL('../', import.meta.url).pathname, rd = f => { try { return JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json'), M = rd('matches.json');
const base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json')};
const evDate = M.events.map(e => e[1]), last = evDate.reduce((a, d) => d > a ? d : a, ''), s45 = new Date(new Date(last).getTime() - 45 * 864e5).toISOString().slice(0, 10);
const sheetOf = d => { const set = {}; for (const f of M.decks[d].map(j => M.feats[j])) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m) continue; const s = set[m[1]] || (set[m[1]] = {it: null, ab: null, mv: []});
  if (m[2] === '@') s.it = m[3]; else if (m[2] === '#') s.ab = m[3]; else s.mv.push(m[3]); } return set; };
const seen = new Set(), sheets = [];
for (const g of M.m) { if (g[2] === .5 || g[0] === g[1] || evDate[g[3]] < s45) continue; for (const [t, d] of [[g[0], g[7]], [g[1], g[8]]]) { const k = t + ',' + d; if (seen.has(k)) continue; seen.add(k); sheets.push({mons: M.teams[t].split('|'), set: d != null && M.decks[d] ? sheetOf(d) : null}); } }
const page = ROOT + `app/sure-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const b = await chromium.launch();
async function words(modelFile, sd0s) {
  const pg = await (await b.newContext()).newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, {...base, 'meta/model': JSON.parse(fs.readFileSync(modelFile, 'utf8'))});
  await pg.goto('file://' + page); await pg.waitForTimeout(4000);
  const r = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{ const SH = ${JSON.stringify(sheets)}, SD0 = ${JSON.stringify(sd0s)};
    const mk = ns => ns.every(n => byName.get(n)) ? ns.map(n => abMember(byName.get(n))) : null;
    const fromSet = (ns, set) => { if (!set || !ns.every(n => byName.get(n))) return mk(ns); try { return ns.map((n, i) => { const s = set[n] || {}; const p = byName.get(n), mv = (s.mv || []).filter(x => mvByName.has(x)).slice(0, 4);
      return memberOf({n, a: s.ab && p.a.includes(s.ab) ? s.ab : null, lock: false, ...(mv.length ? {mv: {doubles: mv}} : {}), ...(!p.m && s.it ? {it: {doubles: s.it}} : {})}, i); }).filter(Boolean); } catch (e) { return null; } };
    const MS = SH.map(x => fromSet(x.mons, x.set)), shipped = META.model.pairSd0;
    const out = {shipped, w: {}}; for (const v of SD0) { META.model.pairSd0 = v == null ? shipped : v; out.w[v == null ? 'shipped' : v] = MS.map(ms => { if (!ms || ms.length !== 6) return null; const s = CH.sureOf(ms, CH.sixOf(ms)); return s ? s.w : null; }); }
    META.model.pairSd0 = shipped; return JSON.stringify(out); })()`));
  await pg.close(); return {...r, errs};
}
const N = await words(process.env.MODEL, [.047, .058]), O = process.env.OLD_MODEL ? await words(process.env.OLD_MODEL, [null]) : null;
await b.close(); fs.unlinkSync(page);
const cnt = a => { const c = {Low: 0, Medium: 0, High: 0, none: 0}; for (const w of a) c[w || 'none']++; return c; }, pc = (n, t) => (100 * n / t).toFixed(1) + '%';
const A = N.w['0.047'], B = N.w['0.058'], T = sheets.length; let ch = 0; const moves = {}; A.forEach((w, i) => { if (w !== B[i]) { ch++; const k = B[i] + ' -> ' + w; moves[k] = (moves[k] || 0) + 1; } });
console.log(`=== sure-word-check: ${T} distinct real team sheets since ${s45}; new model ${process.env.MODEL} (shipped pairSd0 ${N.shipped}) ===`);
for (const [lbl, a] of [['pairSd0 .058 (as the verified variant)', B], ['pairSd0 .047 (new, from lp 225)', A], ...(O ? [[`old model as live (pairSd0 ${O.shipped})`, O.w.shipped]] : [])]) { const c = cnt(a); console.log(`  ${lbl.padEnd(40)} Low ${c.Low} (${pc(c.Low, T)}) · Medium ${c.Medium} (${pc(c.Medium, T)}) · High ${c.High} (${pc(c.High, T)}) · no word ${c.none}`); }
console.log(`  sheets that change word .058 -> .047: ${ch} of ${T} (${pc(ch, T)}) ${JSON.stringify(moves)}`);
if (O) { let c2 = 0; O.w.shipped.forEach((w, i) => { if (w !== A[i]) c2++; }); console.log(`  sheets that change word, old live model -> new model (.047): ${c2} of ${T} (${pc(c2, T)})`); }
console.log(`  page errors: ${N.errs.length + (O ? O.errs.length : 0)}`);
