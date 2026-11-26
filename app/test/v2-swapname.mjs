// Outside audit Nov 20 F1: on My Team at 1440 the swap name in Suggestion 1 broke mid-word ('Sneasle / r') because .tm-sw>span allowed
// breaks anywhere. Every swap name keeps each word whole, and nothing in a suggestion runs past its row, at 390-1920, light and dark.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-swapname.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const th of ['light', 'dark']) for (const W of [390, 700, 900, 1100, 1280, 1366, 1440, 1920]) {
  const c = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th}), p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team', {timeout: 90000});
  await p.waitForFunction(() => document.querySelectorAll('.tm-sw>span').length > 0, null, {timeout: 30000}).catch(() => {});
  await p.evaluate(() => document.fonts ? document.fonts.ready : 0); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const bad = [], out = []; let n = 0;
    for (const s of document.querySelectorAll('.tm-sw>span')) { n++; const tw = document.createTreeWalker(s, NodeFilter.SHOW_TEXT); let t;
      while ((t = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(t.data))) { const rg = document.createRange(); rg.setStart(t, m.index); rg.setEnd(t, m.index + m[0].length);
        if (new Set([...rg.getClientRects()].filter(x => x.width).map(x => Math.round(x.top))).size > 1) bad.push(m[0]); } } }
    for (const li of document.querySelectorAll('.tm-sug li')) { const lr = li.getBoundingClientRect(); for (const e of li.querySelectorAll('.tm-sw, .tm-chg')) { const er = e.getBoundingClientRect(); if (er.width && er.right > lr.right + 1) out.push(e.className); } }
    return {n, bad, out}; });
  ok(r.n > 0, `${th} ${W}: swap names on the page (${r.n})`);
  ok(!r.bad.length, `${th} ${W}: every swap name keeps each word whole (${r.bad.join(', ') || 'none broken'})`);
  ok(!r.out.length && !errs.length, `${th} ${W}: nothing past its suggestion row (${r.out.join(', ') || 'none'}), no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-swapname: ${fails.length} failed` : 'v2-swapname: all passed'); process.exit(fails.length ? 1 : 0);
