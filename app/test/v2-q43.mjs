// Mystery Gifts on phones (Sim's Q43 A, Nov 19, 8:25 PM): under 700 wide The Stamp Sheet shows its first 6 stamps (two full rows of 3)
// and a real button "Show All N Stamps ›" (N = the stamps in the chosen filter, from the data) opens the rest in place: aria-expanded,
// aria-controls, keyboard opens and closes, focus stays on it, "Show Fewer Stamps" when open. A filter (All / Pokémon / Items) with 6 or
// fewer: no button, every stamp. 390 x 844: at least 0.1 screens shorter than the same page with the cut undone in place (same data).
// Tablet and desktop (700, 1440) unchanged: every stamp (up to 12), no button. Light and dark: nothing out of its box, nothing sideways,
// no lone stamp on a row, no page errors. A fixture of 9 stamps (4 Pokémon, 5 items) checks the cut too when the live list is short.
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q43.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (W, th, phone) => { const c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})});
  const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#gifts', {timeout: 90000}); await p.waitForTimeout(3000); return [p, errs, c]; };
const FIX = `(() => { const s = (i, mon) => mon ? {id: 'm' + i, kind: 'pokemon', mon: 'Incineroar', name: 'Incineroar', how: 'Event Gift', start: '2026-0' + (i + 1) + '-01T00:00:00Z', end: '2026-0' + (i + 1) + '-20T00:00:00Z'}
  : {id: 'i' + i, kind: 'item', item: 'VP', name: 'VP', amount: 500, how: 'Serial Code', start: '2026-0' + (i + 1) + '-01T00:00:00Z', end: '2026-0' + (i + 1) + '-21T00:00:00Z'};
  POST = {checked: '2026-11-17', news: [], gifts: Array.from({length: 9}, (_, i) => s(i, i < 4))}; V2.prUi = {f: 'all', all: false}; V2.redraw(); })()`;
const want = p => p.evaluate(() => window.__ev(`(() => { const P = V2.postNow().past.map(V2.prG); return {all: P.length, mon: P.filter(g => g.isMon).length, item: P.filter(g => !g.isMon).length}; })()`));
const look = p => p.evaluate(() => { const vis = e => !!e && e.getClientRects().length > 0, btn = document.querySelector('#main [data-prmore]');
  const li = [...document.querySelectorAll('#main .pr-sheet > li')].filter(vis), rows = {}; li.forEach(x => { const t = Math.round(x.getBoundingClientRect().top + scrollY); rows[t] = (rows[t] || 0) + 1; });
  return {n: li.length, rows: Object.keys(rows).map(Number).sort((a, c) => a - c).map(k => rows[k]).join('+'), btn: vis(btn) ? btn.textContent.trim() : '', tag: btn ? btn.tagName : '', exp: btn ? btn.getAttribute('aria-expanded') : '', ctl: btn && document.getElementById(btn.getAttribute('aria-controls')) ? 'ok' : 'missing',
    h: vis(btn) ? Math.round(btn.getBoundingClientRect().height) : 0, focus: !!btn && document.activeElement === btn, f: (document.querySelector('#main [data-prf][aria-pressed="true"]') || {}).dataset?.prf}; });
const boxes = p => p.evaluate(() => { const W = innerWidth, bad = [];
  for (const el of document.querySelectorAll('#main .pr-stamps *')) { if (!el.getClientRects().length || el.children.length || el.closest('.vh')) continue; const r = el.getBoundingClientRect(); if (!r.width) continue;
    if (r.left < -1 || r.right > W + 1) bad.push('off screen: ' + (el.textContent || el.className).trim().slice(0, 24)); }
  for (const s of document.querySelectorAll('#main .pr-sw')) { if (!s.getClientRects().length) continue; const r = s.getBoundingClientRect(); for (const k of s.querySelectorAll('.pr-nm, b')) { if (!k.getClientRects().length) continue; const z = k.getBoundingClientRect(); if (z.left < r.left - 1 || z.right > r.right + 1) bad.push('out of its stamp: ' + k.textContent.slice(0, 20)); } }
  return {bad, side: document.documentElement.scrollWidth > W}; });
const lone = r => { const a = r.split('+').map(Number); return a.length > 1 && a[a.length - 1] === 1; };
// one phone round: the cut, the button, keyboard open and close, every filter
const phone = async (p, th, W, tag) => { const n = await want(p); let x = await look(p);
  if (n.all <= 6) { ok(x.n === n.all && !x.btn, `${th} ${W}${tag}: ${n.all} stamps, 6 or fewer: all shown (${x.n}), no button`); return n; }
  ok(x.n === 6 && x.rows === '3+3' && x.btn === `Show All ${n.all} Stamps ›` && x.tag === 'BUTTON' && x.exp === 'false' && x.ctl === 'ok' && x.h >= 44, `${th} ${W}${tag}: first 6 of ${n.all} stamps in two full rows (${x.n}, rows ${x.rows}) + "${x.btn}" (${x.tag}, aria-expanded ${x.exp}, controls ${x.ctl}, ${x.h}px)`);
  let bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}${tag}: nothing out of its box, nothing sideways (${bx.bad.slice(0, 3).join('; ') || 'clean'}${bx.side ? ', scrolls sideways' : ''})`);
  if (!x.btn) { ok(false, `${th} ${W}${tag}: no Show All button to open`); return n; }
  await p.focus('#main [data-prmore]'); await p.keyboard.press('Enter'); await p.waitForTimeout(400); x = await look(p);
  ok(x.n === n.all && x.exp === 'true' && x.btn === 'Show Fewer Stamps' && x.focus, `${th} ${W}${tag}: Enter opens all ${n.all} (${x.n}, rows ${x.rows}), aria-expanded ${x.exp}, "${x.btn}", focus stays ${x.focus}`);
  if (lone(x.rows)) console.log(`  note  ${th} ${W}${tag}: opened, rows ${x.rows} (the open sheet's rows are from before Q43, Sim Nov 18: 3+3+1 for 7)`);
  bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}${tag}: opened, nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
  await p.focus('#main [data-prmore]'); await p.keyboard.press('Space'); await p.waitForTimeout(400); x = await look(p);
  ok(x.n === 6 && x.exp === 'false' && x.btn === `Show All ${n.all} Stamps ›` && x.focus, `${th} ${W}${tag}: Space closes it again (${x.n}, "${x.btn}", focus stays ${x.focus})`);
  for (const f of ['mon', 'item', 'all']) { await p.click(`#main [data-prf="${f}"]`); await p.waitForTimeout(400); x = await look(p); const k = n[f];
    ok(k > 6 ? x.n === 6 && x.btn === `Show All ${k} Stamps ›` && !lone(x.rows) : x.n === k && !x.btn && (k < 3 || !lone(x.rows)), `${th} ${W}${tag}: filter ${f} (${k} stamps): ${x.n} shown, rows ${x.rows || 'none'}, button "${x.btn || 'none'}"`); }
  return n; };
for (const th of ['light', 'dark']) {
  for (const W of [320, 390, 699]) { const [p, errs, c] = await open(W, th, true); const n = await phone(p, th, W, '');
    if (W === 390) { const L = await p.evaluate(() => { const H = document.documentElement.scrollHeight; document.querySelectorAll('#main .pr-sheet').forEach(e => e.classList.add('on')); document.querySelectorAll('#main .pr-mph').forEach(e => e.style.setProperty('display', 'none'));
        return {H, H0: document.documentElement.scrollHeight}; });
      if (n.all > 6) ok((L.H0 - L.H) / 844 >= 0.1, `${th} 390: page ${(L.H / 844).toFixed(2)} screens, ${((L.H0 - L.H) / 844).toFixed(2)} shorter than without Q43's cut (${(L.H0 / 844).toFixed(2)}; at least 0.1)`);
      else console.log(`  note  ${th} 390: the live list has ${n.all} stamps, 6 or fewer, so nothing to cut; the fixture checks the length`);
      await p.reload(); await p.waitForTimeout(3000); }
    await p.evaluate(fx => window.__ev(fx), FIX); await p.waitForTimeout(400); await phone(p, th, W, ' (fixture 9)');
    if (W === 390) { const L = await p.evaluate(() => { const H = document.documentElement.scrollHeight; document.querySelectorAll('#main .pr-sheet').forEach(e => e.classList.add('on')); document.querySelectorAll('#main .pr-mph').forEach(e => e.style.setProperty('display', 'none')); return {H, H0: document.documentElement.scrollHeight}; });
      ok((L.H0 - L.H) / 844 >= 0.1, `${th} 390 (fixture 9): ${((L.H0 - L.H) / 844).toFixed(2)} screens shorter than without the cut (at least 0.1)`); }
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
  for (const W of [700, 760, 819, 820, 1440]) { const [p, errs, c] = await open(W, th, false); for (const tag of ['', ' (fixture 9)']) { if (tag) { await p.evaluate(fx => window.__ev(fx), FIX); await p.waitForTimeout(400); }
      const n = await want(p), x = await look(p);
      ok(x.n === Math.min(n.all, 12) && !x.btn, `${th} ${W}${tag}: unchanged, all ${n.all} stamps (${x.n}, rows ${x.rows}), no button`);
      const bx = await boxes(p);
      // Sim Q56 A (Nov 19, 10:42 PM): with 5 stamps across at 700-819 the names are 13 with less side padding, so "Incineroar" stays inside
      ok(!bx.bad.length && !bx.side, `${th} ${W}${tag}: nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`); }
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length})`); await c.close(); }
}
await b.close(); console.log(`v2-q43: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
