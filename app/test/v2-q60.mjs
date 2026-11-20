// Sim, Nov 20 (approved build, option C of docs/rebuild/research/team-meta-length-nov20.md): the Meta page (Grandstand) is shorter on phones.
// A: under 700, each tier's words ("Top of the format") sit under its "90+" inside the colour band and See All sits on the band (no separate line).
// B: under 700, the D and F tiers fold behind one real button "Show D and F tiers ›" + "N more Pokémon, rated under 60" (N from the data),
//    aria-expanded / aria-controls; it opens them in place (focus stays, "Show Fewer"), every D and F Pokémon is reachable, and it folds again.
// Length: at 390 the page is at least 0.5 screens (844px) shorter than before. 'Before' is rebuilt inside the test from the same page and data:
//    the D and F tiers are opened and each tier's words and See All go back into their own line under the band (the old .gs-wd line, whose CSS
//    is still in use on 700+). On fc9fcdb2 that page measured 3406px at 390 (4.04 screens); the rebuilt 'before' is printed beside it.
// 700 and up: unchanged (no fold, the words line under each band). Light and dark; nothing sideways; no page errors. Exit 1 on any failure.
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const st = p => p.evaluate(() => { const vis = e => !!e && e.getClientRects().length > 0, bt = document.querySelector('#main [data-ralow]'), r = bt && bt.getBoundingClientRect();
  const ids = bt ? (bt.getAttribute('aria-controls') || '').split(' ').filter(Boolean) : [], secs = ids.map(id => document.getElementById(id));
  return {btn: vis(bt) ? [...bt.children].map(e => e.textContent.trim()).join(' ') : '', tag: bt ? bt.tagName : '', type: bt ? bt.getAttribute('type') : '', exp: bt ? bt.getAttribute('aria-expanded') : '', ids, h: r ? Math.round(r.height) : 0,
    secsOk: secs.length > 0 && secs.every(Boolean), shown: secs.filter(vis).length, mons: secs.filter(vis).reduce((a, s) => a + s.querySelectorAll('.gs-mon').length, 0),
    focus: document.activeElement === bt, H: document.documentElement.scrollHeight, side: document.documentElement.scrollWidth > innerWidth}; });
// N from each tier's own count (the band's screen-reader line, built from the same rows as the tiles), not from the button; C's band says "60+"
const want = p => p.evaluate(() => { const cnt = k => +((((document.querySelector(`#ra-t-${k} .gs-blk .vh`) || {}).textContent || '').match(/(\d+) Pokémon/) || [0, 0])[1]);
  return {n: cnt('D') + cnt('F'), under: +((((document.querySelector('#ra-t-C .gs-blk .vh') || {}).textContent || '').match(/(\d+)\+/) || [0, 60])[1])}; });
for (const th of ['light', 'dark']) for (const W of [320, 360, 375, 390, 430, 699, 700, 1024, 1440]) {
  const phone = W < 700, c = await b.newContext({viewport: {width: W, height: 844}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})}), p = await c.newPage();
  await p.addInitScript(() => { try { localStorage.removeItem('np2.ra.board'); } catch (e) {} });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#meta', {timeout: 90000}); await p.waitForTimeout(5000); const tag = `${th} ${W}`;
  const bands = await p.evaluate(() => [...document.querySelectorAll('#main .gs-step')].map(s => { const blk = s.querySelector('.gs-blk'), br = blk.getBoundingClientRect(), wd = s.querySelector('.gs-wd'), bw = blk.querySelector('.gs-bw'), all = s.querySelector('[data-ratier]');
    const inside = e => { if (!e || !e.getClientRects().length) return true; const r = e.getBoundingClientRect(); return r.left >= br.left - 1 && r.right <= br.right + 1 && r.top >= br.top - 1 && r.bottom <= br.bottom + 1; };
    return {k: s.dataset.tier, words: bw ? bw.textContent : '', line: !!wd && wd.getClientRects().length > 0, allOnBand: !all || blk.contains(all), allH: all && all.getClientRects().length ? Math.round(all.getBoundingClientRect().height) : 99,
      fit: [...blk.querySelectorAll('.gs-bw>span,[data-ratier],small')].every(inside) && (!bw || [...bw.children].every(x => x.scrollWidth <= x.clientWidth + 1)), fold: s.classList.contains('gs-fold')}; }));
  if (!bands.length) { ok(false, `${tag}: the Grandstand shows its tiers`); await c.close(); continue; }
  let x = await st(p);
  if (!phone) {
    ok(!x.btn && !x.tag && bands.every(t => t.line && !t.words && !t.fold), `${tag}: unchanged: every tier (${bands.length}) keeps its words line, no fold button ("${x.btn}")`);
  } else {
    const w = await want(p);
    ok(bands.every(t => t.words && !t.line && t.allOnBand && t.fit && t.allH >= 44), `${tag}: every tier's words and See All on its band, inside it, no separate line, See All ≥44px (${bands.map(t => t.k + (t.words && !t.line && t.allOnBand && t.fit && t.allH >= 44 ? '' : '!')).join(' ')})`);
    ok(x.tag === 'BUTTON' && x.type === 'button' && x.exp === 'false' && x.secsOk && x.ids.join(' ') === bands.filter(t => t.k === 'D' || t.k === 'F').map(t => 'ra-t-' + t.k).join(' ') && x.h >= 44, `${tag}: a real button, aria-expanded ${x.exp}, aria-controls "${x.ids.join(' ')}", ${x.h}px`);
    ok(x.btn === `Show D and F tiers › ${w.n} more Pokémon, rated under ${w.under}` && x.shown === 0, `${tag}: "${x.btn}" (data: ${w.n} D and F Pokémon), the D and F tiers folded (${x.shown} shown)`);
    ok(bands.filter(t => ['S', 'A', 'B', 'C'].includes(t.k)).every(t => !t.fold), `${tag}: S, A, B and C stay open`);
    if (W === 390) { const L = await p.evaluate(() => { const H = document.documentElement.scrollHeight, back = [];
        document.querySelectorAll('#main .gs-fold').forEach(s => { s.classList.add('on'); back.push(() => s.classList.remove('on')); });
        document.querySelectorAll('#main .gs-step').forEach(s => { const blk = s.querySelector('.gs-blk'), bw = blk.querySelector('.gs-bw'); if (!bw) return; const html = blk.innerHTML;
          const wd = document.createElement('p'); wd.className = 'gs-wd'; wd.innerHTML = `<span>${bw.querySelector('.gs-bd').textContent}</span>`; const all = blk.querySelector('[data-ratier]'); if (all) { all.classList.remove('gs-ball'); wd.appendChild(all); }
          const cnt = blk.querySelector('small'); if (cnt) cnt.remove(); const sm = document.createElement('small'); sm.textContent = 'N Pokémon'; bw.replaceWith(bw.firstElementChild); blk.appendChild(sm); blk.classList.remove('gs-bnd');
          s.querySelector('.gs-main').prepend(wd); back.push(() => { wd.remove(); blk.innerHTML = html; blk.classList.add('gs-bnd'); }); });
        const btn = document.querySelector('#main [data-ralow]'); if (btn) { btn.style.display = 'none'; back.push(() => { btn.style.display = ''; }); }
        const H0 = document.documentElement.scrollHeight; back.forEach(f => f()); return {H, H0, H1: document.documentElement.scrollHeight}; });
      ok((L.H0 - L.H) / 844 >= 0.5 && L.H1 === L.H, `${tag}: page ${L.H}px (${(L.H / 844).toFixed(2)} screens), ${((L.H0 - L.H) / 844).toFixed(2)} shorter than before (${L.H0}px, ${(L.H0 / 844).toFixed(2)}; fc9fcdb2 measured 3406, 4.04); at least 0.5`); }
    if (!x.tag) { ok(false, `${tag}: the D and F fold button is there to open them`); ok(!errs.length, `${tag}: no page errors (${errs.length})`); await c.close(); continue; }
    await p.focus('#main [data-ralow]'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); x = await st(p);
    ok(x.exp === 'true' && x.shown === x.ids.length && x.btn === 'Show Fewer Fold the D and F tiers away' && x.focus, `${tag}: Enter opens D and F in place (${x.shown} shown), aria-expanded ${x.exp}, "${x.btn}", focus stays ${x.focus}`);
    for (const k of ['D', 'F']) { const shut = await p.evaluate(k => { const a = document.querySelector(`#ra-t-${k} [data-ratier]`); return !!a && a.getAttribute('aria-expanded') !== 'true'; }, k); if (shut) { await p.click(`#ra-t-${k} [data-ratier]`); await p.waitForTimeout(600); } }
    x = await st(p); ok(x.exp === 'true' && x.shown === x.ids.length && x.mons === w.n, `${tag}: after See All on D and F (a redraw) they stay open and show every D and F Pokémon (${x.mons} of ${w.n})`);
    await p.focus('#main [data-ralow]'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); x = await st(p);
    ok(x.exp === 'false' && x.shown === 0 && x.btn.startsWith('Show D and F tiers ›') && x.focus, `${tag}: Enter again folds them (${x.shown} shown), "${x.btn}", focus stays ${x.focus}`);
  }
  ok(!x.side, `${tag}: nothing scrolls sideways`); ok(!errs.length, `${tag}: no page errors (${errs.length}${errs.length ? ': ' + errs[0].slice(0, 80) : ''})`); await c.close();
}
await b.close(); console.log(fails.length ? `v2-q60: ${fails.length} failed` : 'v2-q60: all passed'); process.exit(fails.length ? 1 : 0);
