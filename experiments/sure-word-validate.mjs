// Does the "how sure" word (CH.sureOf: Low / Medium / High) mean anything on real later results? Measurement only.
// Same 4 windows and training as experiments/whytest-recheck.mjs (cuts 2026-10-28 / 11-04 / 11-11 / 11-18, the last to 11-26):
//   new = the branch's model.mjs with the locked settings (+ six.mjs), reused from NEW_WORK (whytest-recheck's WORK);
//   old = the live model before the fix (EVID_K=1000 EVID_KP=300 LB=40 LP=150 ZERO_CENTER=0, + six.mjs), trained here into WORK.
// Every team sheet in each window's games is graded by the built page (gradeTeam's path: assignItems, THR.teamReport, CH.gradeOf on the
// team's own sheet). Per team result it records the page's win chance against the field (st.e = CH.fieldWin(y)), y, the real result,
// the spread CH.sdOf under (a) old model + its pairSd0, (b) new model + pairSd0 .058, (c) new model + .047, and the six's own games.
// The word is the page's rule (sd <= .12 High, <= .2 Medium, else Low; a six with 100+ games of its own is at least Medium),
// checked against CH.sureOf on every sheet.
// Per word: n, mean e vs real win rate (gap, 95% event-clustered CI), Brier of e; also Brier of the game's own chance
// P = sig(calib·(yA − yB)) (the score against the real opponent). High vs Medium: CI of the Brier and |gap| differences.
// Thresholds: one cut-off c (High if sd <= c) tuned on the dev windows (events before experiments/sealed.json 'from'), then checked once
// on the sealed events, as is.
// Usage: NEW_WORK=<whytest dir> WORK=<dir> node experiments/sure-word-validate.mjs   (build the page first; REUSE=1 keeps old models)
import fs from 'node:fs'; import {execFile} from 'node:child_process'; import {promisify} from 'node:util'; import {createRequire} from 'node:module'; import {roundMode} from '../tour-modes.mjs';
const {chromium} = createRequire(import.meta.url)('playwright'), run = promisify(execFile);
const ROOT = new URL('../', import.meta.url).pathname, WORK = (process.env.WORK || ROOT + 'out/surevalid').replace(/\/?$/, '/'), NEW = process.env.NEW_WORK.replace(/\/?$/, '/'); fs.mkdirSync(WORK, {recursive: true});
const rd = f => { try { return JSON.parse(fs.readFileSync(ROOT + 'out/' + f, 'utf8')); } catch (e) { return null; } };
const M = rd('matches.json'), TM = JSON.parse(fs.readFileSync(ROOT + 'data/tour-modes.json', 'utf8')), SEAL = JSON.parse(fs.readFileSync(ROOT + 'experiments/sealed.json', 'utf8')).from;
const evDates = M.events.map(e => e[1]), G = M.m.filter(g => g[2] !== .5 && g[0] !== g[1]), teams = M.teams.map(k => k.split('|'));
const cuts = [['2026-10-28', '2026-11-04'], ['2026-11-04', '2026-11-11'], ['2026-11-11', '2026-11-18'], ['2026-11-18', '2026-11-26']], MIN_N = 300;
const env0 = {...process.env}; for (const k of ['TRAIN_ONLY', 'TEST_DATE', 'MODEL_SHADOW', 'FAST', 'RETUNE', 'K_GRID']) delete env0[k];
const OLD_ENV = {EVID_K: '1000', EVID_KP: '300', LB: '40', LP: '150', ZERO_CENTER: '0'};
await Promise.all(cuts.map(async ([from]) => { const mt = WORK + `old-${from}.json`, mf = NEW + `matches-${from}.json`;
  if (process.env.REUSE === '1' && fs.existsSync(mt)) return; const t0 = Date.now();
  const a = await run('node', ['model.mjs'], {cwd: ROOT, env: {...env0, ...OLD_ENV, MATCHES: mf, MODEL_OUT: mt}, maxBuffer: 1 << 28});
  await run('node', ['six.mjs'], {cwd: ROOT, env: {...env0, MATCHES: mf, MODEL_FILE: mt}, maxBuffer: 1 << 28});
  console.log(`  [old ${from}] ${((Date.now() - t0) / 1000).toFixed(0)}s: ${a.stdout.trim().split('\n').filter(l => /^(ridge|model:)/.test(l)).join(' | ')}`); }));
const L = rd('limitless.json'), base = {'meta/results': L.results, 'meta/perf': {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json'), 'meta/history': rd('history.json')};
const sheetOf = d => { const set = {}; for (const f of M.decks[d].map(j => M.feats[j])) { const m = f.match(/^(.*?)([@#:])(.*)$/); if (!m) continue; const s = set[m[1]] || (set[m[1]] = {it: null, ab: null, mv: []});
  if (m[2] === '@') s.it = m[3]; else if (m[2] === '#') s.ab = m[3]; else s.mv.push(m[3]); } return set; };
const page = ROOT + `app/surevalid-${process.pid}.html`;
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8">' + fs.readFileSync(ROOT + 'app/dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const br = await chromium.launch(), sig = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
async function grade(MT, SH, sd0s) {
  const pg = await (await br.newContext()).newPage(), errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(D => { localStorage.setItem('cc2.welcomed', '"1"'); window.__PL_TEST = 1; window.claude = {use: async n => n === 'db' ? {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}, update: async () => {}})} : null}; }, {...base, 'meta/model': MT});
  await pg.goto('file://' + page); await pg.waitForTimeout(4000);
  const r = JSON.parse(await pg.evaluate(c => window.__ev(c), `(()=>{ const SH = ${JSON.stringify(SH)}, SD0 = ${JSON.stringify(sd0s)}, shipped = META.model.pairSd0;
    const mk = ns => ns.every(n => byName.get(n)) ? ns.map(n => abMember(byName.get(n))) : null;
    const fromSet = (ns, set) => { if (!set || !ns.every(n => byName.get(n))) return mk(ns); try { return ns.map((n, i) => { const s = set[n] || {}; const p = byName.get(n), mv = (s.mv || []).filter(x => mvByName.has(x)).slice(0, 4);
      return memberOf({n, a: s.ab && p.a.includes(s.ab) ? s.ab : null, lock: false, ...(mv.length ? {mv: {doubles: mv}} : {}), ...(!p.m && s.it ? {it: {doubles: s.it}} : {})}, i); }).filter(Boolean); } catch (e) { return null; } };
    return JSON.stringify(SH.map(x => { try { const t = fromSet(x.mons, x.set); if (!t || t.length !== 6) return null; const ms = typeof assignItems === 'function' ? assignItems(t) : t;
      const RD = THR.teamReport(ms), Gd = CH.gradeOf(RD, proChecks(ms, true), ms); if (!Gd || !Gd.st) return null; const six = CH.sixOf(ms), sw = CH.sureOf(ms, six);
      const sd = SD0.map(v => { META.model.pairSd0 = v == null ? shipped : v; const s = CH.sdOf(ms); META.model.pairSd0 = shipped; return s; });
      return {e: Gd.st.e, y: Gd.st.y, sd, g6: six ? six.g : 0, w: sw ? sw.w : null}; } catch (e) { return null; } })); })()`));
  await pg.close(); return {r, errs};
}
const word = (sd, g6, hi = .12, mid = .2) => { if (sd == null) return null; let k = sd <= hi ? 2 : sd <= mid ? 1 : 0; if (g6 >= 100) k = Math.max(k, 1); return ['Low', 'Medium', 'High'][k]; };
const rows = []; let mism = 0, nNull = 0, errN = 0;
for (const [from, to] of cuts) {
  const MO = JSON.parse(fs.readFileSync(WORK + `old-${from}.json`, 'utf8')), MN = JSON.parse(fs.readFileSync(NEW + `model-${from}.json`, 'utf8'));
  const test = G.filter(g => evDates[g[3]] >= from && evDates[g[3]] < to), keys = [...new Set(test.flatMap(g => [g[0] + ',' + g[7], g[1] + ',' + g[8]]))];
  const SH = keys.map(k => { const [t, d] = k.split(','); return {mons: teams[+t], set: d !== 'null' && d !== 'undefined' && M.decks[+d] ? sheetOf(+d) : null}; });
  const O = await grade(MO, SH, [null]), N = await grade(MN, SH, [.058, .047, null]); errN += O.errs.length + N.errs.length;
  const bo = new Map(keys.map((k, i) => [k, O.r[i]])), bn = new Map(keys.map((k, i) => [k, N.r[i]]));
  for (const x of [...O.r, ...N.r]) if (x && x.w !== word(x.sd[x.sd.length - 1], x.g6)) mism++;
  for (const g of test) { const ka = g[0] + ',' + g[7], kb = g[1] + ',' + g[8], oa = bo.get(ka), ob = bo.get(kb), na = bn.get(ka), nb = bn.get(kb);
    const mode = roundMode(TM[M.events[g[3]][0]], g[6]), sealed = evDates[g[3]] >= SEAL;
    for (const [o, n, oo, no, won] of [[oa, na, ob, nb, g[2]], [ob, nb, oa, na, 1 - g[2]]]) { if (!o || !n || !oo || !no) { nNull++; continue; }
      rows.push({ev: from + ':' + g[3], mode, sealed, won, g6o: o.g6, g6n: n.g6,
        a: {e: o.e, p: sig(MO.calib * (o.y - oo.y)), sd: o.sd[0]}, b: {e: n.e, p: sig(MN.calib * (n.y - no.y)), sd: n.sd[0]}, c: {e: n.e, p: sig(MN.calib * (n.y - no.y)), sd: n.sd[1]}}); } }
  console.log(`  [${from}..${to}] ${test.length} games, ${keys.length} sheets; old pairSd0 ${MO.pairSd0}, new ${MN.pairSd0}`);
}
await br.close(); fs.unlinkSync(page); fs.writeFileSync(WORK + 'rows.json', JSON.stringify(rows));
console.log(`  team results ${rows.length}; not scorable ${nNull}; word rule vs CH.sureOf mismatches ${mism}; page errors ${errN}`);
// statistics
const SET = {a: 'old model, its pairSd0', b: 'new model, pairSd0 .058', c: 'new model, pairSd0 .047'}, W3 = ['High', 'Medium', 'Low'];
const boot = (R, stat, B = 1000) => { const evs = [...new Set(R.map(r => r.ev))], by = new Map(evs.map(e => [e, []])); for (const r of R) by.get(r.ev).push(r);
  let st = 42; const rnd = () => { st = (st * 1664525 + 1013904223) >>> 0; return st / 4294967296; }, v = [];
  for (let i = 0; i < B; i++) { const s = []; for (let j = 0; j < evs.length; j++) s.push(...by.get(evs[Math.floor(rnd() * evs.length)])); const x = stat(s); if (x != null && isFinite(x)) v.push(x); }
  v.sort((p, q) => p - q); return [v[Math.floor(.025 * v.length)], v[Math.floor(.975 * v.length)]]; };
const f = (x, d = 4) => x == null || !isFinite(x) ? '-' : x.toFixed(d), pct = x => (100 * x).toFixed(1);
const grp = (R, k, wf) => { const o = {High: [], Medium: [], Low: []}; for (const r of R) { const w = wf(r); if (w) o[w].push(r); } return o; };
const mstat = (R, k) => { if (!R.length) return null; let e = 0, w = 0, be = 0, bp = 0; for (const r of R) { e += r[k].e; w += r.won; be += (r[k].e - r.won) ** 2; bp += (r[k].p - r.won) ** 2; } const n = R.length; return {n, e: e / n, w: w / n, gap: (e - w) / n, be: be / n, bp: bp / n}; };
const out = [], say = s => { out.push(s); console.log(s); };
const report = (title, R, k, wf) => { say(`  ${title}`); const g = grp(R, k, wf);
  for (const w of W3) { const S = mstat(g[w], k); if (!S) { say(`    ${w.padEnd(7)} n=    0`); continue; }
    if (S.n < MIN_N) { say(`    ${w.padEnd(7)} n=${String(S.n).padStart(5)}  unknown (under ${MIN_N})  [said ${pct(S.e)}% won ${pct(S.w)}%]`); continue; }
    const ci = boot(g[w], s => { const t = mstat(s, k); return t && t.gap; });
    say(`    ${w.padEnd(7)} n=${String(S.n).padStart(5)}  said ${pct(S.e)}% won ${pct(S.w)}%  gap ${pct(S.gap)} pts [95% CI ${pct(ci[0])} to ${pct(ci[1])}]  Brier(e) ${f(S.be)}  Brier(game P) ${f(S.bp)}`); }
  const H = g.High, Md = g.Medium; if (H.length >= MIN_N && Md.length >= MIN_N) {
    const d = (s, fn) => { const a = grp(s, k, wf), x = mstat(a.High, k), y = mstat(a.Medium, k); return x && y ? fn(x, y) : null; };
    const dB = d(R, (x, y) => x.be - y.be), dP = d(R, (x, y) => x.bp - y.bp), dG = d(R, (x, y) => Math.abs(x.gap) - Math.abs(y.gap));
    const cB = boot(R, s => d(s, (x, y) => x.be - y.be)), cP = boot(R, s => d(s, (x, y) => x.bp - y.bp)), cG = boot(R, s => d(s, (x, y) => Math.abs(x.gap) - Math.abs(y.gap)));
    const v = (x, c) => `${f(x)} [${f(c[0])} to ${f(c[1])}]${c[1] < 0 ? ' HIGH BETTER' : c[0] > 0 ? ' HIGH WORSE' : ' no difference shown'}`;
    say(`    High minus Medium: Brier(e) ${v(dB, cB)} · Brier(game P) ${v(dP, cP)} · |gap| ${v(dG, cG)}`);
    return {dB, cB, dP, cP, dG, cG}; } else say('    High vs Medium: unknown (a word has under ' + MIN_N + ' results)'); return null; };
const verdict = [];
for (const [mode, ml] of [['bo1', 'SINGLE GAMES (best-of-1)'], ['bo3', 'BEST-OF-3 ROUNDS (match results)']]) for (const [part, pf] of [['all windows', r => true], ['dev only (before ' + SEAL + ')', r => !r.sealed], ['sealed only', r => r.sealed]]) {
  const R = rows.filter(r => r.mode === mode && pf(r)); say(`\n=== ${ml}, ${part}: ${R.length} team results, ${new Set(R.map(r => r.ev)).size} events ===`);
  for (const k of ['a', 'b', 'c']) { const res = report(`(${k}) ${SET[k]}`, R, k, r => word(r[k].sd, k === 'a' ? r.g6o : r.g6n)); if (part === 'all windows') verdict.push([ml, SET[k], res]); } }
say('\n=== The test: is High better than Medium with a CI that excludes 0? (all windows) ===');
for (const [ml, s, r] of verdict) say(`  ${ml} · ${s}: ${!r ? 'unknown' : [['Brier(e)', r.cB], ['Brier(game P)', r.cP], ['|gap|', r.cG]].map(([n, c]) => `${n} ${c[1] < 0 ? 'HIGH BETTER' : c[0] > 0 ? 'HIGH WORSE' : 'no difference'}`).join(', ')}`);
// thresholds: one cut-off c on setting (c), tuned on dev, checked once on sealed
say('\n=== Proposed cut-off (setting c: new model, pairSd0 .047; one cut: High if sd <= c, else Medium; six 100+ games stays as the page has it) ===');
for (const [mode, ml] of [['bo1', 'single games'], ['bo3', 'best-of-3 rounds']]) {
  const dev = rows.filter(r => r.mode === mode && !r.sealed), sealed = rows.filter(r => r.mode === mode && r.sealed);
  const sds = dev.map(r => r.c.sd).sort((p, q) => p - q), grid = [...new Set(Array.from({length: 19}, (_, i) => +sds[Math.floor((i + 1) / 20 * (sds.length - 1))].toFixed(3)))];
  const split = (R, c) => ({H: R.filter(r => r.c.sd <= c || false), Md: R.filter(r => !(r.c.sd <= c))});
  const diff = (R, c) => { const {H, Md} = split(R, c); if (H.length < MIN_N || Md.length < MIN_N) return null; const x = mstat(H, 'c'), y = mstat(Md, 'c'); return x.bp - y.bp; };
  let best = null; const lines = [];
  for (const c of grid) { const d = diff(dev, c); if (d == null) continue; const ci = boot(dev, s => diff(s, c), 300); lines.push(`${c}: ${f(d)} [${f(ci[0])}, ${f(ci[1])}]`); if (!best || ci[1] < best.ci[1]) best = {c, d, ci}; }
  say(`  ${ml}, dev (${dev.length} results): Brier(game P) High minus Medium by cut-off (objective: the most negative upper CI bound):`); say('    ' + (lines.join(' · ') || 'no cut-off leaves 300+ results on each side'));
  if (!best) { say('    no proposal: too few dev results'); continue; }
  say(`    proposed cut-off ${best.c} (dev: High minus Medium ${f(best.d)} [${f(best.ci[0])}, ${f(best.ci[1])}]; today's page cut-offs are .12 / .2)`);
  const {H, Md} = split(sealed, best.c), d = diff(sealed, best.c); if (d == null) { say(`    sealed check: unknown (High ${H.length}, Medium ${Md.length} results)`); continue; }
  const ci = boot(sealed, s => diff(s, best.c)), x = mstat(H, 'c'), y = mstat(Md, 'c');
  say(`    sealed check ONCE (${sealed.length} results; High ${H.length}, Medium ${Md.length}): Brier(game P) High ${f(x.bp)} vs Medium ${f(y.bp)}, difference ${f(d)} [95% CI ${f(ci[0])} to ${f(ci[1])}] -> ${ci[1] < 0 ? 'HIGH BETTER' : ci[0] > 0 ? 'HIGH WORSE' : 'no difference shown'}`);
}
fs.writeFileSync(WORK + 'result.txt', out.join('\n') + '\n');
