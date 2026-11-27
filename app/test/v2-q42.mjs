// A shorter Usage page on phones (Sim's Q42 A, Nov 19, 8:25 PM): under 700 wide "How <Pokémon> is played" shows Moves' top 5 and Items'
// top 3, each with a real button "N more ›" (N = the rest of the list the page holds, from the data), Abilities and Natures side by side in
// two equal columns, Usually alongside one row of 3 plus "N more ›", and "Also ranked 61–100" folded behind its own button (same words
// inside). Each button: aria-expanded, aria-controls, opens and closes from the keyboard, focus stays on it, "Show Fewer" when open, its
// state kept across a redraw. 390 x 844: at least 0.4 screens shorter than the same page with the cuts undone in place (same data; the CI
// data differs from today's, so no fixed screen number). Tablet and desktop (700, 1440) unchanged: every bar, teammate and the line, no
// button. Kit reskin (hU1, Nov 22, proposal): Moves are the kit's move tickets two across, so phones show the top 4 (two even rows;
// a set's four moves) instead of 5. Light and dark: nothing out of its box, nothing sideways, no lone teammate, no page errors. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q42.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (W, th, phone) => { const c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})});
  const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#usage', {timeout: 90000}); await p.waitForTimeout(4000); return [p, errs, c]; };
// what the data holds for the Pokémon "How it is played" shows first (the most used of the chosen list), as usage.js reads it
const want = p => p.evaluate(() => window.__ev(`(() => { const d = V2.usDoc(), R = V2.usRow(d.top[0], d.kind || 'ladder'), t = R.t, m = d.more || [];
  return {mv: (t.mv || []).slice(0, 8).length, it: (t.it || []).slice(0, 5).length, tm: (t.tm || []).slice(0, 6).filter(([n]) => byName.get(n)).length, alN: Math.min(40, m.length), al: m.length ? m[0].r + '–' + m[m.length - 1].r : ''}; })()`));
const look = p => p.evaluate(() => { const q = s => document.querySelector('#main ' + s), vis = e => !!e && e.getClientRects().length > 0, txt = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : '';
  const bars = [...document.querySelectorAll('#main .us-how .us-bars')], cnt = i => bars[i] ? [...bars[i].querySelectorAll('.us-bar')].filter(vis).length : 0;
  const btn = k => { const e = q(`[data-usmore="${k}"]`); return {t: vis(e) ? txt(e) : '', tag: e ? e.tagName : '', exp: e ? e.getAttribute('aria-expanded') : '', ctl: e && document.getElementById(e.getAttribute('aria-controls')) ? 'ok' : 'missing', h: vis(e) ? Math.round(e.getBoundingClientRect().height) : 0, focus: document.activeElement === e}; };
  const ab = bars[2] && bars[2].getBoundingClientRect(), na = bars[3] && bars[3].getBoundingClientRect();
  const rows = [...document.querySelectorAll('#main .us-mates .us-bench')].filter(vis).map(r => [...r.querySelectorAll('.gs-mon')].filter(vis).length);
  return {mv: cnt(0), it: cnt(1), side: !!(ab && na && Math.abs(ab.top - na.top) < 1 && Math.abs(ab.width - na.width) < 1 && na.left > ab.right), abW: ab ? Math.round(ab.width) : 0, naW: na ? Math.round(na.width) : 0,
    tm: rows.reduce((a, x) => a + x, 0), rows: rows.join('+'), also: vis(q('.us-also')), alsoT: txt(q('.us-also')).slice(0, 40), b: {mv: btn('mv'), it: btn('it'), tm: btn('tm'), al: btn('al')}}; });
const boxes = p => p.evaluate(() => { const W = innerWidth, bad = [];
  for (const el of document.querySelectorAll('#main .us *')) { if (!el.getClientRects().length || el.children.length || el.closest('.vh')) continue; const r = el.getBoundingClientRect(); if (!r.width) continue;
    if (r.left < -1 || r.right > W + 1) bad.push('off screen: ' + (el.textContent || el.className).trim().slice(0, 24)); }
  for (const g of document.querySelectorAll('#main .us-how .us-bars')) { const r = g.getBoundingClientRect(); for (const k of g.querySelectorAll('span, b, small')) { if (!k.getClientRects().length || k.closest('.vh')) continue; const z = k.getBoundingClientRect(); if (z.left < r.left - 1 || z.right > r.right + 1) bad.push('out of its column: ' + k.textContent.slice(0, 20)); } }
  return {bad, side: document.documentElement.scrollWidth > W}; });
// Wave 2 (Nov 23): the buttons are the kit show-more (V2.kMore) now: "Show N more" with the noun for screen readers (was "N more moves ›"),
// "Show fewer" + noun when open (was "Show Fewer"), and "Also ranked 61–100 ›" became "Show 40 more" (the line starts "Also ranked 61–100:")
const lab = (k, n, w) => `Show ${n} more ${w}`, NOUN = {mv: 'moves', it: 'items', tm: 'teammates', al: 'ranked Pokémon'};
for (const th of ['light', 'dark']) {
  for (const W of [320, 390, 699]) { const [p, errs, c] = await open(W, th, true), n = await want(p); let x = await look(p);
    ok(n.mv > 4 && x.mv === 4 && x.b.mv.t === lab('mv', n.mv - 4, 'moves') && x.b.mv.tag === 'BUTTON' && x.b.mv.exp === 'false' && x.b.mv.ctl === 'ok' && x.b.mv.h >= 44, `${th} ${W}: Moves shows 4 of ${n.mv} + "${x.b.mv.t}" (${x.b.mv.tag}, aria-expanded ${x.b.mv.exp}, controls ${x.b.mv.ctl}, ${x.b.mv.h}px)`);
    ok(n.it > 3 && x.it === 3 && x.b.it.t === lab('it', n.it - 3, 'items') && x.b.it.exp === 'false' && x.b.it.ctl === 'ok' && x.b.it.h >= 44, `${th} ${W}: Items shows 3 of ${n.it} + "${x.b.it.t}" (${x.b.it.h}px)`);
    ok(x.side, `${th} ${W}: Abilities and Natures side by side in two equal columns (${x.abW} and ${x.naW}px wide)`);
    ok(n.tm > 3 && x.tm === 3 && x.rows === '3' && x.b.tm.t === lab('tm', n.tm - 3, 'teammates') && x.b.tm.exp === 'false' && x.b.tm.ctl === 'ok' && x.b.tm.h >= 44, `${th} ${W}: Usually alongside shows one row of 3 of ${n.tm} (rows ${x.rows}) + "${x.b.tm.t}" (${x.b.tm.h}px)`);
    ok(!!n.al && !x.also && x.b.al.t === lab('al', n.alN, NOUN.al) && x.alsoT.startsWith(`Also ranked ${n.al}`) /* the ranks from the data now open the folded line itself */ && x.b.al.exp === 'false' && x.b.al.ctl === 'ok' && x.b.al.h >= 44, `${th} ${W}: the "Also ranked ${n.al}" line is folded behind "${x.b.al.t}" (line shown: ${x.also})`);
    if (W === 390) { // relative to the same page with Q42's phone cuts undone in place (same data)
      const L = await p.evaluate(() => { const H = document.documentElement.scrollHeight, q = s => [...document.querySelectorAll('#main ' + s)];
        q('.us-how .us-bars, .us-mates, .us-also').forEach(e => e.classList.add('on')); q('.us-more').forEach(e => e.style.setProperty('display', 'none'));
        q('.us-groups').forEach(e => e.style.setProperty('grid-template-columns', 'repeat(auto-fit,minmax(240px,1fr))')); q('.us-groups > *').forEach(e => e.style.setProperty('grid-column', 'auto'));
        return {H, H0: document.documentElement.scrollHeight}; });
      await p.reload(); await p.waitForTimeout(4000);
      ok((L.H0 - L.H) / 844 >= 0.4, `${th} 390: page ${(L.H / 844).toFixed(2)} screens, ${((L.H0 - L.H) / 844).toFixed(2)} shorter than without Q42's cuts (${(L.H0 / 844).toFixed(2)}; at least 0.4; measured 0.54 today, 0.52 on the CI data, Nov 19)`); }
    let bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box, nothing sideways (${bx.bad.slice(0, 3).join('; ') || 'clean'}${bx.side ? ', scrolls sideways' : ''})`);
    for (const [k, all, cut, nm] of [['mv', n.mv, 4, 'Moves'], ['it', n.it, 3, 'Items'], ['tm', n.tm, 3, 'Usually alongside'], ['al', 1, 0, 'Also ranked']]) {
      if (!x.b[k].t) { ok(false, `${th} ${W}: no ${nm} button to open`); continue; }
      const closed = x.b[k].t; await p.focus(`#main [data-usmore="${k}"]`); await p.keyboard.press('Enter'); await p.waitForTimeout(250); x = await look(p);
      const got = k === 'al' ? (x.also ? 1 : 0) : x[k];
      ok(got === all && x.b[k].exp === 'true' && x.b[k].t === `Show fewer ${NOUN[k]}` && x.b[k].focus, `${th} ${W}: Enter on the ${nm} button opens all ${all} (${got}), aria-expanded ${x.b[k].exp}, "${x.b[k].t}", focus stays ${x.b[k].focus}`);
      if (k === 'tm') { const full = (all - 3) % 3 === 0; console.log(`  ${full ? 'info' : 'note'}  ${th} ${W}: opened teammates in rows ${x.rows}${full ? ', no lone one' : ' (the 3 + rest split is from before Q42; only 6 teammates fill both rows)'}`); }
      if (k === 'mv') { await p.evaluate(() => window.__ev('V2.redraw()')); await p.waitForTimeout(300); const y = await look(p); ok(y.mv === all && y.b.mv.exp === 'true', `${th} ${W}: Moves stays open after a redraw (${y.mv}, aria-expanded ${y.b.mv.exp})`); }
      bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: ${nm} open, nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
      await p.focus(`#main [data-usmore="${k}"]`); await p.keyboard.press('Space'); await p.waitForTimeout(250); x = await look(p);
      const back = k === 'al' ? (x.also ? 1 : 0) : x[k];
      ok(back === cut && x.b[k].exp === 'false' && x.b[k].t === closed && x.b[k].focus, `${th} ${W}: Space closes ${nm} again (${back}, "${x.b[k].t}", focus stays ${x.b[k].focus})`); }
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
  for (const W of [700, 1440]) { const [p, errs, c] = await open(W, th, false), n = await want(p), x = await look(p);
    const anyBtn = Object.values(x.b).some(v => v.t);
    ok(x.mv === n.mv && x.it === n.it && x.tm === n.tm && x.also && !anyBtn, `${th} ${W}: unchanged, all ${n.mv} moves (${x.mv}), ${n.it} items (${x.it}), ${n.tm} teammates (${x.tm}, rows ${x.rows}), the Also ranked line shown (${x.also}), no button (${anyBtn})`);
    const bx = await boxes(p); ok(!bx.bad.length && !bx.side, `${th} ${W}: nothing out of its box (${bx.bad.slice(0, 3).join('; ') || 'clean'})`);
    ok(!errs.length, `${th} ${W}: no page errors (${errs.length})`); await c.close(); }
}
await b.close(); console.log(`v2-q42: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
