// Battle: the real-games verdict (Favoured / Even match / Unfavoured) gets one plain line under it ONLY when turn one has a risk
// (Sim's Q14 A, Nov 19: "go with recommended"): "How six-vs-six matchups like this went. It doesn't see turn one: yours has a risk
// (see Watch)." Over 20+ real opponents (each event's winning six), 390 and 1440, light and dark: the line shows exactly when the
// Watch line shows and a verdict exists, in the page's small-line style (Instrument Sans, 13 or 15px), inside its box, no sideways
// scroll. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q14.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const LINE = "How six-vs-six matchups like this went. It doesn't see turn one: yours has a risk (see Watch).";
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
let opps = 0, withRisk = 0, noRisk = 0; const wrong = [], style = [], over = [];
for (const th of ['light', 'dark']) for (const W of [390, 1440]) {
  const p = await b.newPage({viewport: {width: W, height: 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#battle', {timeout: 90000}); await p.waitForTimeout(2500);
  const n = await p.evaluate(() => window.__ev('(META.events && META.events.events || []).length'));
  for (let i = 0; i < Math.min(n, 30); i++) {
    const has = await p.evaluate(i => window.__ev(`(META.events.events[${i}].top || []).length && META.events.events[${i}].top[0].mons ? 1 : 0`), i); if (!has) continue;
    await p.evaluate(i => window.__ev(`S.opp = META.events.events[${i}].top[0].mons.map(m => m.n); V2.redraw()`), i); await p.waitForTimeout(250);
    const m = await p.evaluate(LINE => { const v = document.querySelector('.bt-verdict'), w = document.querySelector('.bt-warn'),
      ls = [...document.querySelectorAll('.bt-verdict *')].filter(x => x.children.length === 0 && x.textContent.trim() === LINE), l = ls[0];
      const r = {verdict: !!v, watch: !!w, line: ls.length, side: document.documentElement.scrollWidth > innerWidth};
      if (l) { const cs = getComputedStyle(l), L = l.getBoundingClientRect(), V = v.getBoundingClientRect();
        r.font = cs.fontFamily; r.size = parseFloat(cs.fontSize); r.ital = cs.fontStyle;
        r.inside = L.left >= V.left - 0.5 && L.right <= V.right + 0.5 && L.top >= V.top - 0.5 && L.bottom <= V.bottom + 0.5 && l.scrollWidth <= l.clientWidth + 1; }
      return r; }, LINE);
    opps++; const want = m.verdict && m.watch; if (want) withRisk++; else noRisk++;
    const tag = `${th} ${W} ev${i}`;
    if (m.line !== (want ? 1 : 0)) wrong.push(`${tag}: verdict ${m.verdict}, Watch ${m.watch}, line shown ${m.line}x`);
    if (m.line) { if (!/Instrument Sans/.test(m.font) || ![13, 15].includes(m.size) || m.ital !== 'normal') style.push(`${tag}: ${m.size}px ${m.ital} ${m.font}`);
      if (!m.inside) over.push(`${tag}: the line falls out of the verdict box`); }
    if (m.side) over.push(`${tag}: the page scrolls sideways`); }
  await p.close(); }
ok(opps >= 80 && withRisk > 0 && noRisk > 0, `enough real opponents to tell (${opps} checks over 4 views: ${withRisk} with a verdict and a Watch line, ${noRisk} without)`);
ok(!wrong.length, `the line shows exactly when turn one has a Watch line and a verdict exists (${wrong.length} wrong${wrong.length ? ', e.g. ' + wrong[0] : ''})`);
ok(!style.length, `the line is the page's small-line style: Instrument Sans, 13 or 15px, upright (${style.length} off${style.length ? ', e.g. ' + style[0] : ''})`);
ok(!over.length, `the line stays inside the verdict box and nothing scrolls sideways (${over.length}${over.length ? ', e.g. ' + over[0] : ''})`);
await b.close(); console.log(`v2-q14: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
