// Sim Q45 A (Nov 19, 8:33 PM): Test Run on phones (under 700) shows the Coin Flips pile's first 5 cards and a button "N more coin flips"
// that opens the rest in place (aria-expanded, focus stays, "Show Fewer" closes). 700 and up: every card, no button. The page at 390 is
// at least 0.8 screens shorter than the same page with every card shown (same data; the CI data and today's data differ in length).
// Light and dark; nothing sideways; no page errors. Exit 1 on any failure.
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const st = p => p.evaluate(() => { const l = document.getElementById('tp-cards-c'), bt = document.querySelector('#main [data-tpmore]');
  const vis = l ? [...l.querySelectorAll('.tp-card')].filter(e => e.getClientRects().length).length : -1;
  return {all: l ? l.querySelectorAll('.tp-card').length : -1, vis, btn: bt && bt.getClientRects().length ? bt.textContent : '', exp: bt ? bt.getAttribute('aria-expanded') : '',
    h: bt && bt.getClientRects().length ? Math.round(bt.getBoundingClientRect().height) : 0, focus: document.activeElement === bt, H: document.documentElement.scrollHeight, side: document.documentElement.scrollWidth > innerWidth}; });
for (const th of ['light', 'dark']) for (const W of [320, 390, 699, 700, 1440]) {
  const phone = W < 700, c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})}), p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#gauntlet', {timeout: 90000}); await p.waitForTimeout(5000);
  let x = await st(p); const tag = `${th} ${W}`;
  if (x.all < 0) { ok(false, `${tag}: Test Run shows its three piles (no Coin Flips pile found)`); await c.close(); continue; }
  if (!phone || x.all <= 5) ok(x.vis === x.all && !x.btn, `${tag}: every Coin Flips card (${x.vis} of ${x.all}), no button ("${x.btn}")`);
  else {
    const n = x.all - 5; ok(x.vis === 5 && x.btn === `${n} more coin flip${n === 1 ? '' : 's'} ›` && x.exp === 'false' && x.h >= 44, `${tag}: 5 of ${x.all} cards + "${x.btn}" (aria-expanded ${x.exp}, ${x.h}px)`);
    if (W === 390) { const L = await p.evaluate(() => { const H = document.documentElement.scrollHeight; document.getElementById('tp-cards-c').classList.add('on'); const H0 = document.documentElement.scrollHeight; document.getElementById('tp-cards-c').classList.remove('on'); return {H, H0}; });
      ok((L.H0 - L.H) / 844 >= 0.8, `${tag}: page ${(L.H / 844).toFixed(2)} screens, ${((L.H0 - L.H) / 844).toFixed(2)} shorter than with every card (${(L.H0 / 844).toFixed(2)}; at least 0.8)`); }
    await p.focus('#main [data-tpmore]'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); x = await st(p);
    ok(x.vis === x.all && x.exp === 'true' && x.btn === 'Show Fewer' && x.focus, `${tag}: Enter opens all ${x.all} (${x.vis}), aria-expanded ${x.exp}, "${x.btn}", focus stays ${x.focus}`);
    await p.keyboard.press('Enter'); await p.waitForTimeout(300); x = await st(p);
    ok(x.vis === 5 && x.exp === 'false' && x.btn.endsWith('›'), `${tag}: Enter again closes back to 5 (${x.vis}), "${x.btn}"`);
  }
  ok(!x.side, `${tag}: nothing scrolls sideways`); ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close();
}
await b.close(); console.log(fails.length ? `v2-q45: ${fails.length} failed` : 'v2-q45: all passed'); process.exit(fails.length ? 1 : 0);
