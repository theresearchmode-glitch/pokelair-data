// Sim Q77 (Nov 20): the new site's What's New (V2.SD_NEW) carries the final 7 items, in order, with the approved titles; a returning
// player (welcomed, an older seenNew) sees it once on Home with 7 items; a first-time visitor doesn't. 390 and 1440, light and dark,
// nothing sideways, no page errors. Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-wnew.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const T = ['A new look', 'Strength Score', 'A new Home', 'Damage Calculator', 'Battle', 'News and Mystery Gifts', 'Back and Feedback'];
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const th of ['light', 'dark']) for (const W of [390, 1440]) for (const fresh of [false, true]) {
  const c = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th}); const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(f => { window.__PL_TEST = 1; if (!f && !sessionStorage.getItem('t.seeded')) { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2026-10-28b"'); sessionStorage.setItem('t.seeded', '1'); } }, fresh);
  await p.goto('file://' + PAGE + '#home', {timeout: 90000}); await p.waitForTimeout(3000);
  const x = await p.evaluate(() => { const n = document.querySelector('#main .sdp-nw'); return {items: (V2.SD_NEW.items || []).map(i => i[0]), shown: !!n, lis: n ? n.querySelectorAll('li').length : 0, side: document.documentElement.scrollWidth > innerWidth}; });
  const tag = `${th} ${W}${fresh ? ' first visit' : ' returning'}`;
  ok(x.items.join('|') === T.join('|'), `${tag}: the 7 approved titles in order (${x.items.join(', ')})`);
  if (fresh) ok(!x.shown, `${tag}: no What's New on a first visit`); else ok(x.shown && x.lis === 7, `${tag}: What's New shown with 7 items (${x.shown}, ${x.lis})`);
  ok(!x.side && !errs.length, `${tag}: nothing sideways, no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-wnew: ${fails.length} FAILED` : 'v2-wnew: all passed'); process.exit(fails.length ? 1 : 0);
