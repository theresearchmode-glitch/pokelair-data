// Edit Set on phones (Sim's Q16 A, Nov 19; design review #21): the Close X sat on top of the dropdowns as the panel scrolled. Now a solid
// strip at the top of the panel holds the X and the content scrolls under it. At 320, 360, 390, 430 (touch), light and dark, with the panel
// scrolled to the top, three middle spots and the bottom: no select / input / button shows inside the X's box or in the X's row (a control's
// visible part is found by hit-testing, so a control hidden under the strip does not count), the X stays on screen, on top and 44px, and
// nothing scrolls sideways. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q16.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
let spots = 0, opened = 0; const hit = [], row = [], xbad = [], side = [];
for (const th of ['light', 'dark']) for (const W of [320, 360, 390, 430]) {
  const ctx = await b.newContext({viewport: {width: W, height: 800}, colorScheme: th, hasTouch: true}); const p = await ctx.newPage();
  await p.addInitScript(() => { window.__PL_TEST = 1; });
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(2000);
  await p.evaluate(() => window.__ev('V2.openEdit(0)')); await p.waitForTimeout(400);
  if (!await p.$('.np-sheet .ed2')) { xbad.push(`${th} ${W}: Edit Set did not open`); await ctx.close(); continue; } opened++;
  const max = await p.evaluate(() => { const s = document.querySelector('.np-sheet'); return s.scrollHeight - s.clientHeight; });
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    const m = await p.evaluate(f => { const s = document.querySelector('.np-sheet'); s.scrollTop = Math.round((s.scrollHeight - s.clientHeight) * f); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => {
      const x = s.querySelector(':scope > .x'), X = x.getBoundingClientRect(), S = s.getBoundingClientRect(), mine = (e, t) => !!t && (t === e || e.contains(t));
      const top = document.elementFromPoint(X.left + X.width / 2, X.top + X.height / 2), out = {X: [X.left, X.top, X.width, X.height].map(Math.round), xTop: mine(x, top), xIn: X.top >= S.top - 0.5 && X.bottom <= S.bottom + 0.5, hit: [], row: []};
      for (const c of s.querySelectorAll('select, input, button, textarea')) { if (c === x || !c.getClientRects().length) continue; const R = c.getBoundingClientRect();
        if (R.bottom <= S.top || R.top >= S.bottom) continue; const name = (c.dataset.ed || c.tagName.toLowerCase()) + ' "' + (c.value || c.textContent || '').trim().slice(0, 24) + '"';
        /* the control's visible part: hit-test down its middle column (and a column near each side) */
        let vt = Infinity, vb = -Infinity; for (const cx of [R.left + 4, R.left + R.width / 2, R.right - 4]) for (let y = Math.max(R.top, S.top) + 1; y < Math.min(R.bottom, S.bottom); y += 2) if (mine(c, document.elementFromPoint(cx, y))) { vt = Math.min(vt, y); vb = Math.max(vb, y); }
        if (vt === Infinity) continue;
        if (R.left < X.right && R.right > X.left && vt < X.bottom && vb > X.top) out.hit.push(name);
        else if (vt < X.bottom - 1 && vb > X.top + 1) out.row.push(name); }
      out.side = document.documentElement.scrollWidth > innerWidth || s.scrollWidth > s.clientWidth; r(out); }))); }, f);
    spots++; const at = `${th} ${W} scroll ${Math.round(f * 100)}% of ${max}px`;
    if (m.hit.length) hit.push(`${at}: ${m.hit.join(', ')}`); if (m.row.length) row.push(`${at}: ${m.row.join(', ')}`);
    if (!m.xTop || !m.xIn || m.X[2] < 44 || m.X[3] < 44) xbad.push(`${at}: X ${m.X.join(',')} on top ${m.xTop} on screen ${m.xIn}`); if (m.side) side.push(at); }
  await ctx.close(); }
ok(opened === 8, `Edit Set opens at 320/360/390/430, light and dark (${opened} of 8)`);
ok(spots > 0 && !hit.length, `no select / input / button shows inside the Close X's box while the panel scrolls (${spots} scroll spots, ${hit.length} with a collision${hit.length ? ', e.g. ' + hit[0] : ''})`);
ok(spots > 0 && !row.length, `the X's row is a solid strip: no control shows beside the X while the panel scrolls (${row.length}${row.length ? ', e.g. ' + row[0] : ''})`);
ok(!xbad.length, `the X stays on screen, on top and at least 44 x 44px (${xbad.length}${xbad.length ? ', e.g. ' + xbad[0] : ''})`);
ok(!side.length, `nothing scrolls sideways (${side.length}${side.length ? ', e.g. ' + side[0] : ''})`);
await b.close(); console.log(`v2-q16: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
