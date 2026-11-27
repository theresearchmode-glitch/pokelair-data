// Strength Score source line (Sim, Wed Nov 25, 6:52 AM): before Reg M-D has results the score falls back to the old check against the
// built-in Reg M-C usage snapshot, and says so: "Graded against Reg M‑C's teams until Reg M‑D results arrive". Never on today's data.
// It could fail: the build before this change never shows the line (check 2 fails), and a wrong condition would show it today (check 1).
//   PAGE=app/dist/v2.html node experiments/score-src-test.mjs   (a --v2 build on frozen data; exit 1 on any failure)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html'), RX = /Graded against Reg\sM.C's teams until Reg\sM.D results arrive/;
const b = await chromium.launch(); let fails = 0; const ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails++; };
const page = async () => { const p = await b.newPage({viewport: {width: 1440, height: 900}}); await p.addInitScript(() => { window.__PL_TEST = 1; }); return p; };
{ const p = await page(); await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(3000); const t = await p.evaluate(() => document.body.innerText);
  ok(!RX.test(t) && /Strength Score/.test(t), "today's data: My Team shows its Strength Score and no M-C source line"); await p.close(); }
{ const p = await page(); await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => window.__ev(`(() => { const R = {id: 'M-D', since: '2026-12-02', now: null}; META.reg = R; if (META.perf) META.perf.reg = R; META.model = null;
    if (typeof RES === 'object' && RES) RES.tc = null; if (typeof S === 'object') META[S.format] = null; V2.draw(); return 1; })()`));
  await p.waitForTimeout(1500); const t = await p.evaluate(() => document.body.innerText); const m = t.match(/[^\n]*Graded against[^\n]*/);
  ok(RX.test(t) && /Strength Score/.test(t), `M-D day one: My Team keeps the score and says where it comes from (${m ? m[0].slice(0, 120) : 'no line'})`);
  ok(!/\.\s*\.\s*$/m.test(m ? m[0] : '') && !/\. \./.test(m ? m[0] : ''), 'no stray dots after the line');
  await p.close(); }
await b.close(); console.log(fails ? `score-src-test: ${fails} FAILED` : 'score-src-test: all passed'); process.exit(fails ? 1 : 0);
