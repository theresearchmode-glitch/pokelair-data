// No long freeze while the page starts on a phone (Plans pl-2c, Nov 19). When today's numbers arrive, the page is worked out and drawn
// in several shorter steps (V2.warmDraw, shell.js): the ratings, your team's report, Home's tools plate, the page's HTML, then putting
// that HTML on the page. Before, the last two were one task: Home ~0.5-0.6 s at 4x CPU on our cloud machine, My Team ~0.33 s.
// Two checks:
//   1. (exact) the draw after the data arrives uses the HTML built in the step before it: V2.shell() runs in an earlier task than the
//      merge, and the merge reuses that HTML (no second build). Fails on the build before pl-2c (one task builds and merges).
//   2. (timing) phone 390x844, CPU 4x (CDP), #home and #team, 3 runs each, median: the longest task from the first daily document
//      to the page being drawn, as a share of all the main-thread time in that window. A share, not milliseconds, so a slower or
//      faster machine moves both sides together. Measured Nov 19 on our cloud machine (3 runs each, medians): Home before 0.47
//      (longest 451-512 ms), after 0.21 (181-240 ms); My Team before 0.37 (261-288 ms), after 0.30 (190-265 ms). Fails over 0.42:
//      between Home's two values. My Team's before and after are both under it, so on My Team only check 1 tells them apart.
//      Set LT_ALERT=1 to report check 2 without failing (for shared CI runners, whose load moves single tasks around).
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-longtask.mjs   (a --v2 --preview-data build: the data must
// arrive from a data store for the start-up draw to run; a build without data draws at once and is reported as such)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), RUNS = +process.env.LT_RUNS || 3, LIMIT = 0.42, ALERT = !!process.env.LT_ALERT;
const fails = [], ok = (c, msg, soft) => { console.log((c ? '  pass  ' : soft ? '  ALERT ' : '  FAIL  ') + msg); if (!c && !soft) fails.push(msg); };
const b = await chromium.launch();
const one = async (route, probe) => {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 3, isMobile: true, hasTouch: true});
  await ctx.addInitScript(() => { window.__PL_TEST = 1; window.__LT = []; window.__T0 = null; window.__MAIN = null;
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__LT.push([e.startTime, e.duration]); }).observe({type: 'longtask', buffered: true}); } catch (e) {}
    // the first daily document's answer: the start of the window
    let w; Object.defineProperty(window, '__NP_CLAUDE', {configurable: true, get: () => w, set: v => { w = v && v.use ? {use: async n => { const r = await v.use(n); if (n !== 'db' || !r) return r;
      return {doc: x => { const d = r.doc(x); return Object.assign({}, d, {onSnapshot: cb => d.onSnapshot(sn => { if (window.__T0 == null) window.__T0 = performance.now(); cb(sn); })}); }}; }} : v; }});
    const chk = () => { const m = document.getElementById('main'); if (window.__MAIN == null && m && !m.querySelector('.np-loading') && m.textContent.length > 200) window.__MAIN = performance.now(); };
    new MutationObserver(chk).observe(document, {subtree: true, childList: true, characterData: true}); });
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  // the probe wraps V2.shell and V2.redraw as soon as the page's script has run (a 0 ms timer queued when the test hook appears runs
  // after the whole script and before the first daily document answers), and counts tasks with a timer that moves once per task
  if (probe) await p.addInitScript(() => { let ev; Object.defineProperty(window, '__ev', {configurable: true, get: () => ev, set: v => { ev = v; setTimeout(() => v(`(() => {
    const sh = V2.shell, rd = V2.redraw; window.__PR = {shells: [], merges: []}; let task = 0; const tick = () => { task++; if (task < 5000) setTimeout(tick, 0); }; tick();
    V2.shell = function () { if (V2._dataOk) __PR.shells.push(task); return sh.apply(this, arguments); };
    V2.redraw = function (pre) { if (V2._dataOk) __PR.merges.push({task, pre: !!(pre && pre.r)}); return rd.apply(this, arguments); }; })()`), 0); }}); });
  await p.goto('file://' + PAGE + '#' + route);
  await p.waitForFunction(() => window.__MAIN != null && performance.now() > window.__MAIN + 300, null, {timeout: 60000, polling: 100});
  const r = await p.evaluate(() => ({T0: window.__T0, main: window.__MAIN, lt: window.__LT, pr: window.__PR || null}));
  await ctx.close(); return {...r, errs};
};
// 1. exact: the HTML is built in one task and put on the page in a later one, without being built again
for (const route of ['home', 'team']) { const r = await one(route, true);
  if (r.T0 == null) { ok(false, `#${route}: no daily document answered: this check needs a --preview-data build`); continue; }
  const m = r.pr.merges[0], first = r.pr.shells.filter(t => t <= (m ? m.task : Infinity));
  ok(m && m.pre && first.length >= 1 && first[first.length - 1] < m.task && r.pr.shells.filter(t => t === m.task).length === 0,
    `#${route}: when today's numbers arrive, the page's HTML is built in its own step and the next step puts it on the page, without building it again (built in task ${first.join(',')}, put on the page in task ${m && m.task}, pre-built ${m && m.pre})`);
  ok(!r.errs.length, `#${route}: no page errors (${r.errs.slice(0, 2).join(' | ')})`); }
// 2. timing
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const route of ['home', 'team']) { const share = [], longest = [], busy = [];
  for (let i = 0; i < RUNS; i++) { const r = await one(route, false); if (r.T0 == null) continue;
    const win = r.lt.filter(([s, d]) => s + d > r.T0 && s < r.main + 50); const L = Math.max(0, ...win.map(t => t[1])), B = win.reduce((s, t) => s + t[1], 0);
    longest.push(Math.round(L)); busy.push(Math.round(B)); share.push(B ? L / B : 0); }
  if (!share.length) { ok(false, `#${route}: no daily document answered: needs a --preview-data build`); continue; }
  const s = med(share);
  ok(s <= LIMIT, `#${route}: at 4x CPU the longest start-up task is ${s.toFixed(2)} of the main-thread time from the first daily document to the drawn page (limit ${LIMIT}; longest ${longest.join('/')} ms of ${busy.join('/')} ms in long tasks, ${RUNS} runs)`, ALERT); }
await b.close();
console.log(`v2-longtask: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
