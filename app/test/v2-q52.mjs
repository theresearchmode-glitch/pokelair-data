// Sim Q52 B (Nov 19, 10:26 PM): in the Arena calc the KO Board bar's title ("KO Board: your six against the top 30") is 17 on 1024-1439
// wide screens (20 from 1440, unchanged), so it fits on one line from 1280 up, as it already does at 1440. Light and dark.
// Exit 1 on any failure.
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const th of ['light', 'dark']) for (const W of [1024, 1180, 1280, 1366, 1439, 1440, 1680]) {
  const c = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th}), p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await p.waitForTimeout(4000); const tag = `${th} ${W}`;
  const m = await p.evaluate(() => { const t = document.querySelector('.arn-kbbar .t'); if (!t) return null; const r = t.getClientRects(), cs = getComputedStyle(t), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    return {fs: parseFloat(cs.fontSize), lines: Math.round(t.getBoundingClientRect().height / lh), sx: document.documentElement.scrollWidth > innerWidth}; });
  if (!m) { ok(false, `${tag}: the KO Board bar is on the page`); await c.close(); continue; }
  if (W < 1440) ok(m.fs === 17, `${tag}: title at 17 (${m.fs})`); else ok(m.fs === 20, `${tag}: title stays at 20 (${m.fs})`);
  if (W >= 1280) ok(m.lines === 1, `${tag}: title on one line (${m.lines})`);
  ok(!m.sx && !errs.length, `${tag}: no sideways scroll, no page errors (${errs.length})`); await c.close();
}
await b.close(); console.log(fails.length ? `v2-q52: ${fails.length} failed` : 'v2-q52: all passed'); process.exit(fails.length ? 1 : 0);
