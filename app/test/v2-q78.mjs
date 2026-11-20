// Q78 A (Sim, Nov 20): on desktop (1100, 1180, 1440, 1920) opening Adjust Suggestions keeps My Team's layout: the work grid's areas and
// Matchups' width are the same open and closed, and the Matchups cards don't overlap. 768 checked too (Q71 layout). Light and dark.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q78.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const look = p => p.evaluate(() => { const w = document.querySelector('.tm-work'), mu = document.getElementById('tm-mu') || document.querySelector('.tm-mus');
  const cards = [...document.querySelectorAll('#tm-mu li')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()).filter(r => r.width > 40 && r.top === r.top);
  let over = 0; for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) { const a = cards[i], c = cards[j]; if (Math.abs(a.top - c.top) < 4 && a.right > c.left + 1 && c.right > a.left + 1) over++; }
  return {areas: w ? getComputedStyle(w).gridTemplateAreas : '', muW: mu ? Math.round(mu.getBoundingClientRect().width) : 0, over, side: document.documentElement.scrollWidth > innerWidth}; });
for (const th of ['light', 'dark']) for (const W of [768, 1100, 1180, 1440, 1920]) { const c = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th}); const p = await c.newPage();
  await p.addInitScript(() => { window.__PL_TEST = 1; }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + PAGE + '#team', {timeout: 90000}); await p.waitForTimeout(3000); await p.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await p.waitForTimeout(800);
  const A = await look(p); const has = await p.evaluate(() => { const f = document.querySelector('.sg2-fold'); if (!f) return false; f.open = true; return true; }); await p.waitForTimeout(600); const B = await look(p);
  const tag = `${th} ${W}`; ok(has, `${tag}: Adjust Suggestions fold found`);
  ok(A.areas === B.areas && Math.abs(A.muW - B.muW) <= 1, `${tag}: same layout open and closed (${A.areas} / ${B.areas}; Matchups ${A.muW} -> ${B.muW}px)`);
  ok(B.over === 0 && !B.side, `${tag}: open: no overlapping Matchups cards (${B.over}), nothing sideways`);
  ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-q78: ${fails.length} FAILED` : 'v2-q78: all passed'); process.exit(fails.length ? 1 : 0);
