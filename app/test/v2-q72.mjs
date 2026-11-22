// Sim's Nov 20 picks from the outside audit (docs/rebuild/research/audit-nov20-options.md; Sim took every recommended option, 8:17 AM):
//  C  (Q72) Home 700-1279: the Events and How We Calculate titles share one left edge (700-1099); the six "More tools" links sit in one
//     row (700-1279) spread across the full width (700-1099); the headline "Same herd. Twelve tools." breaks after "herd." with
//     "Twelve tools." whole on line 2 (700-1279, and phones as before); one line from 1280 as before.
//  D1 (Q73) Usage podium benches (since the kit reskin proposal, Nov 22: the top-ten rows, see the D1 block), 320-599: a Mega name puts "MEGA" on the tag line (.gs-mg, as "Usually alongside" does), so every
//     bench row's numbers sit level (0px spread); 600+ keeps "Mega Charizard Y" on the name line and level rows.
//  D2 (Q74) Events and Gifts filter chips: at 320-430 the chips fill their row (0px empty); at 390-1440 each chip's words are centred
//     in its 44px chip (top and bottom space within 2px).
//  E1 Usage "3 more ›" on phones: a space before the › (the gap 2-5px, as "Ratings ›"), the spoken text still "3 more moves ›".
//  E2 (Q75) Track Record: "29 of 29 made at least one top 8" (no "Pokémon made a top 8"), four bands, each line one line long.
// Every page: light and dark, no sideways scroll, no page errors.
// Could fail: on the build before (7f9e3221) the titles are 10-28px apart, More tools is 3 by 2, the headline breaks "Twelve / tools.",
// the bench rows differ by 16-17px, chips leave 32-137px empty with the words 1px from the top, "3 more›" has 0px, and the text says
// "Pokémon made a top 8".
//   PAGE=app/dist/v2.html node app/test/v2-q72.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const open = async (route, W, th) => { const c = await b.newContext({viewport: {width: W, height: W < 700 ? 844 : 900}, colorScheme: th, hasTouch: W < 1100});
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#' + route, {timeout: 90000}); await p.waitForTimeout(3500); return {c, p, errs}; };
const done = async ({c, p, errs}, tag) => { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(sw <= 0, `${tag}: no sideways scroll (${sw > 0 ? sw + 'px' : 0})`); ok(!errs.length, `${tag}: no page errors${errs.length ? ': ' + errs[0] : ''}`); await c.close(); };
const r1 = n => Math.round(n * 10) / 10;

for (const th of ['light', 'dark']) {
  // C: Home
  for (const W of [390, 700, 720, 768, 800, 820, 1024, 1099, 1100, 1279, 1280, 1440]) { const tag = `home ${W} ${th}`, P = await open('home', W, th);
    const R = await P.p.evaluate(() => { const q = s => document.querySelector(s);
      const h = q('.sdt-h'), sp = h && h.querySelector('span');
      const ev = q('.sdt-ends .sdt-end.ev .sdt-t'), hw = q('.sdt-ends .sdt-end.hw .sdt-t'), vis = e => e && e.getClientRects().length;
      const more = q('.sdt-more'), li = more ? [...more.querySelectorAll('li a')].map(a => a.getBoundingClientRect()) : [];
      const mr = more && more.getBoundingClientRect(), cs = more && getComputedStyle(more);
      // the top of each word of the headline (a Range per word), so the break is read from where the words really sit
      const words = []; if (h) { const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let tn; while ((tn = w.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(tn.data))) {
        const rg = document.createRange(); rg.setStart(tn, m.index); rg.setEnd(tn, m.index + m[0].length); words.push([m[0], Math.round(rg.getBoundingClientRect().top)]); } } }
      return {span: sp ? {txt: sp.textContent, words} : null,
        ev: vis(ev) ? ev.getBoundingClientRect().left : null, hw: vis(hw) ? hw.getBoundingClientRect().left : null,
        n: li.length, tops: li.map(r => Math.round(r.top)), l0: li.length ? li[0].left - (mr.left + parseFloat(cs.paddingLeft)) : null,
        rEnd: li.length ? (mr.right - parseFloat(cs.paddingRight)) - li[li.length - 1].right : null}; });
    const S = R.span, top = k => { const x = S && S.words.find(([t]) => t === k); return x ? x[1] : null; }, rows = S ? S.words.map(([t, y]) => `${t}@${y}`).join(' ') : 'no headline';
    const [tS, tH, tW, tT] = ['Same', 'herd.', 'Twelve', 'tools.'].map(top), seen = [tS, tH, tW, tT].every(v => v != null);
    if (W < 1280) ok(S && S.txt === 'Twelve tools.' && seen && tS === tH && tW > tH && tW === tT, `${tag}: headline breaks after "herd.", "Twelve tools." whole on line 2 (${rows})`);
    else ok(seen && tS === tH && tH === tW && tW === tT, `${tag}: headline on one line as before (${rows})`);
    if (W >= 700 && W < 1100) ok(R.ev != null && R.hw != null && Math.abs(R.ev - R.hw) <= 0.5, `${tag}: Events and How We Calculate titles share one left edge (${R.ev != null ? r1(R.ev) : '-'} / ${R.hw != null ? r1(R.hw) : '-'})`);
    if (W >= 700) { const one = R.n === 6 && Math.max(...R.tops) - Math.min(...R.tops) <= 1;
      ok(one, `${tag}: the six More tools links in one row (${R.n} links, tops ${[...new Set(R.tops)].join('/')})`);
      if (W < 1100) ok(one && Math.abs(R.l0) <= 1 && Math.abs(R.rEnd) <= 1, `${tag}: the row spans the full width (first link ${r1(R.l0)}px from the left edge, last ${r1(R.rEnd)}px from the right)`); }
    await done(P, tag); }

  // D1 + E1: Usage
  for (const W of [320, 360, 390, 430, 599, 600, 1024, 1440]) { const tag = `usage ${W} ${th}`, P = await open('usage', W, th);
    /* kit reskin (hU1, Nov 22, proposal): the podium benches are gone; the top ten is one row per rank (the call sheet). D1's aim, every
       row's numbers level and Mega names whole, is checked on the rows: each share sits on its name's line, each row's parts stay inside
       the row, and a name keeps its last word whole on one line (no "Mega Charizard / Y") */
    const R = await P.p.evaluate(() => { const rows = [...document.querySelectorAll('.us-sheet .ten')].filter(r => r.getClientRects().length);
      const spread = rows.map(r => { const u = r.querySelector('.us-u'), n = r.querySelector('.us-tx b'); if (!u || !n) return 99; const a = u.getBoundingClientRect(), z = n.getBoundingClientRect(); return Math.max(0, Math.abs((a.top + a.bottom) / 2 - (z.top + parseFloat(getComputedStyle(n).lineHeight) / 2)) - 6); });
      const outR = rows.filter(r => { const R0 = r.getBoundingClientRect(); return [...r.querySelectorAll('.us-tx b, .us-u, .us-tm, .us-tr, .us-pb')].some(e => { const q = e.getBoundingClientRect(); return q.width && (q.left < R0.left - 1 || q.right > R0.right + 1 || q.top < R0.top - 1 || q.bottom > R0.bottom + 1); }); }).length;
      const megas = rows.map(r => r.querySelector('.us-tx b')).filter(x => /^Mega /.test(x.textContent.trim())).map(x => { const rg = document.createRange(), t = x.firstChild, L = t.data.length, i = Math.max(0, t.data.lastIndexOf(' ') + 1); /* the last word: 'Charizard\u00a0Y' is one (usage.js joins a lone end letter) */
        rg.setStart(t, i); rg.setEnd(t, L); const lines = new Set([...rg.getClientRects()].map(q => Math.round(q.top))).size; return {txt: x.textContent.trim(), tag: lines === 1, inline: lines === 1, h: x.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(x).lineHeight)}; });
      const more = [...document.querySelectorAll('.us-more')].filter(x => x.getClientRects().length && /\d+ more/.test(x.textContent)).map(x => {
        const walk = document.createTreeWalker(x, NodeFilter.SHOW_TEXT); let tn, mr = null, ar = null; while ((tn = walk.nextNode())) { if (tn.parentElement.closest('.vh')) continue;
          const i = tn.data.indexOf('more'), j = tn.data.indexOf('›'), rg = document.createRange();
          if (i >= 0) { rg.setStart(tn, i + 3); rg.setEnd(tn, i + 4); mr = rg.getBoundingClientRect().right; } if (j >= 0) { rg.setStart(tn, j); rg.setEnd(tn, j + 1); ar = rg.getBoundingClientRect().left; } }
        return {t: x.textContent.replace(/\s+/g, ' ').trim(), gap: mr != null && ar != null ? ar - mr : null}; });
      return {rows: spread.length, spread, megas, more, outR}; });
    ok(R.rows === 10 && R.spread.every(s => s <= 0.5) && !R.outR, `${tag}: every top-ten row's share sits on its name's line, parts inside the row (${R.rows} rows, off by ${R.spread.map(r1).join('/')}px, ${R.outR} rows spilling)`);
    ok(R.megas.length > 0, `${tag}: a Mega in the top ten to check (${R.megas.map(m => m.txt).join(', ') || 'none'})`);
    ok(R.megas.length && R.megas.every(m => m.tag) && (W < 360 || R.megas.every(m => m.h <= m.lh * 1.5)), `${tag}: Mega names keep their last word whole, one line from 360 (${R.megas.map(m => `${m.txt} ${r1(m.h)}px${m.tag ? '' : ' split'}`).join('; ')})`);
    if (W < 700) { ok(R.more.length >= 2, `${tag}: the "N more ›" buttons to check (${R.more.length})`);
      ok(R.more.length && R.more.every(m => m.gap >= 2 && m.gap <= 5), `${tag}: a space before the › in every "N more ›" (${R.more.map(m => `"${m.t}" ${m.gap == null ? '-' : r1(m.gap)}px`).join('; ')})`);
      ok(R.more.length && R.more.every(m => /^\d+ more (moves|items|teammates) ›$/.test(m.t)), `${tag}: the spoken text still "N more moves ›" (${R.more.map(m => m.t).join(' | ')})`); }
    await done(P, tag); }

  // D2: Events and Gifts chips
  for (const route of ['events', 'gifts']) for (const W of [320, 360, 390, 430, 768, 1024, 1440]) { const tag = `${route} ${W} ${th}`, P = await open(route, W, th);
    const R = await P.p.evaluate(() => { const f = [...document.querySelectorAll('#main .ev-f')].find(x => x.getClientRects().length && x.querySelector('.ev-fc')); if (!f) return null;
      const ch = [...f.querySelectorAll('.ev-fc')].map(c => { const r = c.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(c); const t = rg.getBoundingClientRect();
        return {l: r.left, r: r.right, top: r.top, h: r.height, above: t.top - r.top, below: r.bottom - t.bottom}; });
      const fr = f.getBoundingClientRect(), cs = getComputedStyle(f), inner = fr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const oneRow = Math.max(...ch.map(c => c.top)) - Math.min(...ch.map(c => c.top)) <= 1;
      return {n: ch.length, oneRow, empty: oneRow ? (fr.right - parseFloat(cs.paddingRight)) - Math.max(...ch.map(c => c.r)) + (Math.min(...ch.map(c => c.l)) - fr.left - parseFloat(cs.paddingLeft)) : null, inner, ch}; });
    if (!R) { ok(false, `${tag}: filter chips found`); await done(P, tag); continue; }
    /* Nov 22 (Events on the kit, proposal): Events' filter is the kit's plot sentence ("Show me [all 115] [official 8] [100+ players 25]"), words that wrap
       like a sentence, so only Gifts' chips still fill a row; both still keep 44px taps with their words centred (below) */
    if (W <= 430 && route !== 'events') ok(R.oneRow && Math.abs(R.empty) <= 1, `${tag}: the ${R.n} chips fill their row (${R.oneRow ? r1(R.empty) + 'px empty' : 'not one row'})`);
    if (W >= 390) ok(R.ch.every(c => c.h >= 44 && Math.abs(c.above - c.below) <= 2), `${tag}: each chip's words centred in its 44px chip (${R.ch.map(c => `${r1(c.h)}px: ${r1(c.above)} above / ${r1(c.below)} below`).join('; ')})`);
    await done(P, tag); }

  // E2: Track Record
  for (const W of [390, 1440]) { const tag = `track ${W} ${th}`, P = await open('track', W, th);
    const R = await P.p.evaluate(() => { const s = [...document.querySelectorAll('.trk-lines li small')]; return {tx: document.querySelector('#main').innerText,
      lines: s.map(x => ({t: x.textContent, one: x.getClientRects().length === 1 && x.getBoundingClientRect().height <= parseFloat(getComputedStyle(x).lineHeight) * 1.5}))}; });
    const n = (R.tx.match(/\d+ of \d+ made at least one top 8/g) || []).length;
    ok(n === 4, `${tag}: four bands read "N of N made at least one top 8" (${n}; e.g. "${R.lines[0] ? R.lines[0].t : '-'}")`);
    ok(!/Pokémon made a top 8/.test(R.tx), `${tag}: no "Pokémon made a top 8" left`);
    ok(R.lines.length === 4 && R.lines.every(l => l.one), `${tag}: each band line on one line (${R.lines.filter(l => !l.one).map(l => l.t).join(' | ') || 'all'})`);
    await done(P, tag); }
}
await b.close(); console.log(`v2-q72: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
