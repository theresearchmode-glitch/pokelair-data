// Track Record's receipt and its big TOTAL figure stay inside the screen at every width (Sim, Nov 18: "receipt seems off center and the
// x is clipping" after the headline became the real figure, 290×; Q12 A: TOTAL takes its own line when the figure can't fit beside it).
// Light and dark, 320-2560: the receipt is no wider than its column, the figure is inside the receipt, the page has no sideways scroll.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-trkfit.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
for (const th of ['light', 'dark']) for (const W of [320, 340, 360, 375, 390, 414, 699, 700, 1099, 1100, 1440, 2560]) {
  const p = await b.newPage({viewport: {width: W, height: 900}, colorScheme: th}); await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#track', {timeout: 90000}); await p.waitForTimeout(2500);
  const m = await p.evaluate(() => { const rc = document.querySelector('.trk-rc'), bb = document.querySelector('.trk-tot b'); if (!rc || !bb) return null;
    const B = bb.getBoundingClientRect(), R = rc.getBoundingClientRect();
    return {x: bb.textContent, rc: rc.offsetWidth, col: rc.parentElement.offsetWidth, numIn: B.right <= R.right + 0.5 && B.left >= R.left - 0.5, over: document.documentElement.scrollWidth > innerWidth}; });
  if (!m) { ok(true, `${th} ${W}: no TOTAL figure shown (too few events), nothing to check`); await p.close(); continue; }
  ok(m.rc <= m.col && m.numIn && !m.over, `${th} ${W}: receipt ${m.rc}px in a ${m.col}px column, ${m.x} inside it, no sideways scroll`); await p.close(); }
await b.close(); console.log(`v2-trkfit: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
