// Team Preview Practice on phones (Sim's Q25 A, Nov 19, design review #13): while picking, your six are the same 3 x 2 cards as their six
// (before: one 88px row each, 649px in all at 390). At 320-699, light and dark, several real ladder teams: your six sit 3 columns x 2 rows;
// each card is as wide as theirs, has the same sprite size, and the same frame around its name (card height less its name: a Mega's extra
// 'Mega' line may make a card taller, as on theirs); the block is at most 400px tall at 390; no name runs out of its card; nothing scrolls
// sideways (320-1440); each card is a 44px+ tap target. Picking four and two leads by tapping still works, and the reveal keeps its rows.
// At 700 and 1440 your six are unchanged (one column of plates as wide as theirs, sprite left of the name, types shown).
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-q25.mjs
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const grid = [], size = [], tall = [], over = [], tap = [], wide = [], flow = [], words = [];
let seen = 0, block390 = 0, forced = 0, forcedMeow = 0;
const measure = () => { const q = s => [...document.querySelectorAll(s)];
  const me = q('.pp2-plate.me'), them = q('.pp2-plate.them'); if (me.length !== 6 || them.length !== 6) return null;
  /* each card's own height (not stretched to its row): measured with align-self:start, then put back */
  const own = es => { es.forEach(e => { e.style.alignSelf = 'start'; }); const r = es.map(e => { const c = e.getBoundingClientRect(), nm = e.querySelector('.nm').getBoundingClientRect(), st = e.querySelector('.np-mon .st').getBoundingClientRect();
    return {l: Math.round(c.left), t: Math.round(c.top), w: c.width, h: c.height, frame: c.height - nm.height, sw: st.width, sh: st.height, sl: st.left, nl: nm.left, name: e.querySelector('.nm').textContent.trim(),
      ov: e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll('.nm, .nm *')].some(x => { const r = x.getBoundingClientRect(); return r.width && (r.left < c.left - 0.5 || r.right > c.right + 0.5); }),
      ty: (() => { const t = e.querySelector('.ty'); return !!t && getComputedStyle(t).display !== 'none'; })(), op: +getComputedStyle(e).opacity}; }); es.forEach(e => { e.style.alignSelf = ''; }); return r; };
  const tapH = me.map(e => e.getBoundingClientRect().height), side = document.querySelector('.pp2-side.mine').getBoundingClientRect();
  return {me: own(me), them: own(them), tapH, block: side.height, side: document.documentElement.scrollWidth > innerWidth}; };
const cols = a => new Set(a.map(x => x.l)).size, rows = a => new Set(a.map(x => x.t)).size;
for (const th of ['light', 'dark']) for (const W of [320, 360, 390, 430, 699, 700, 1440]) {
  const phone = W < 700, ctx = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th, hasTouch: phone, isMobile: false}), p = await ctx.newPage();
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#practice', {timeout: 90000}); await p.waitForTimeout(2000);
  /* Nov 20: besides 4 random rounds, the rounds with the longest name (Meowscarada; it split at 320 on GitHub and in 5 rounds here)
     are always checked, so the test no longer depends on luck */
  const fixed = await p.evaluate(() => window.__ev("(()=>{const P=META.practice;return P.rounds.map((r,i)=>[i,r.mine.concat((P.opp[r.o]||{}).six||[])]).filter(x=>x[1].some(n=>/Meowscarada/.test(n))).map(x=>x[0]).slice(0,5)})()"));
  for (let k = 0; k < 4 + fixed.length; k++) {
    if (k < 4) await p.evaluate(() => window.__ev("prStart('real'); V2.redraw()"));
    else await p.evaluate(i => window.__ev(`(()=>{prStart('real'); const r=META.practice.rounds[${i}]; pr.ri=${i}; pr.oi=r.o; pr.six=r.mine.slice(); V2.redraw();})()`), fixed[k - 4]);
    await p.waitForTimeout(300);
    /* Nov 19 (night): on a loaded machine the logo font can land late; names are fitted again on 'loadingdone' (monsheet.js), so measure
       once the fonts are ready and two frames have passed (a split name failed here twice under load and never alone) */
    await p.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))));
    const m = await p.evaluate(`(${measure})()`); if (!m) { grid.push(`${th} ${W} #${k}: practice did not show two sixes`); continue; } seen++; if (k >= 4) { forced++; if (await p.evaluate(() => [...document.querySelectorAll('.pp2-plate .nm')].some(e => /Meowscarada/.test(e.textContent)))) forcedMeow++; }
    /* Nov 19 (Claude's review of the helper's 320 picture: 'Charizar|d', 'Golisopo|d'): no name word breaks across two lines */
    const split = await p.evaluate(() => { const bad = []; document.querySelectorAll('.pp2-plate .nm').forEach(b => { const tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let t;
      while ((t = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(t.data))) { const rg = document.createRange(); rg.setStart(t, m.index); rg.setEnd(t, m.index + m[0].length);
        if (new Set([...rg.getClientRects()].filter(x => x.width).map(x => Math.round(x.top))).size > 1) bad.push(m[0]); } } }); return bad; });
    /* Nov 20: GitHub's runner once split 'Meowscarada' at 320 (run 44804692099) while every round with it measured whole here (forced
       rounds 0-14, 320 and 360): the names are fitted again when the font lands, so a split counts only if it is still there 600 ms later */
    let still = split; if (split.length) { await p.waitForTimeout(600); still = await p.evaluate(() => { const bad = []; document.querySelectorAll('.pp2-plate .nm').forEach(b => { const tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let t;
      while ((t = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(t.data))) { const rg = document.createRange(); rg.setStart(t, m.index); rg.setEnd(t, m.index + m[0].length);
        if (new Set([...rg.getClientRects()].filter(x => x.width).map(x => Math.round(x.top))).size > 1) bad.push(m[0]); } } }); return bad; }); }
    for (const w of still) words.push(`${th} ${W} #${k}: '${w}' breaks mid-word`);
    const at = `${th} ${W} #${k}`, med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
    if (m.side) over.push(`${at}: the page scrolls sideways`);
    if (phone) {
      for (const c of m.me) if (c.ov) over.push(`${at}: '${c.name}' runs out of its card`);
      if (cols(m.me) !== 3 || rows(m.me) !== 2) grid.push(`${at}: your six in ${cols(m.me)} columns x ${rows(m.me)} rows`);
      for (const c of m.them) if (c.ov) over.push(`${at}: their '${c.name}' runs out of its card`);
      const tw = med(m.them.map(x => x.w)), tsw = med(m.them.map(x => x.sw)), tsh = med(m.them.map(x => x.sh)), tf = med(m.them.map(x => x.frame));
      for (const c of m.me) if (Math.abs(c.w - tw) > 2 || Math.abs(c.sw - tsw) > 2 || Math.abs(c.sh - tsh) > 2 || Math.abs(c.frame - tf) > 2)
        size.push(`${at} '${c.name}': ${Math.round(c.w)}px wide, sprite ${Math.round(c.sw)}x${Math.round(c.sh)}, frame ${Math.round(c.frame)} vs theirs ${Math.round(tw)}, ${Math.round(tsw)}x${Math.round(tsh)}, ${Math.round(tf)}`);
      if (W === 390) { block390 = Math.max(block390, m.block); if (m.block > 400) tall.push(`${at}: your six ${Math.round(m.block)}px tall`); }
      for (const h of m.tapH) if (h < 44) tap.push(`${at}: a card ${Math.round(h)}px tall`);
      for (const c of m.me) if (c.op < 0.8) tap.push(`${at}: '${c.name}' faded to ${c.op}`);
    } else {
      /* unchanged on tablet and desktop: one column of plates, as wide as theirs, sprite left of the name, types shown */
      const tw = med(m.them.map(x => x.w));
      if (cols(m.me) !== 1 || rows(m.me) !== 6 || m.me.some(c => Math.abs(c.w / tw - 1) > 0.01 || !(c.sl < c.nl) || !c.ty || c.h < 100))
        wide.push(`${at}: ${cols(m.me)} columns x ${rows(m.me)} rows, width ratio ${(m.me[0].w / tw).toFixed(2)}, sprite left ${m.me[0].sl < m.me[0].nl}, types ${m.me[0].ty}, ${Math.round(m.me[0].h)}px`);
    } }
  /* the pick still works by tapping: four, then two leads; the reveal keeps one plate per row on phones */
  if (W === 390 || W === 1440) {
    await p.evaluate(() => window.__ev("prStart('real'); V2.redraw()")); await p.waitForTimeout(300);
    const names = await p.evaluate(() => [...document.querySelectorAll('.pp2-plate.me')].map(e => e.dataset.ppick));
    for (const n of [names[0], names[1], names[2], names[3], names[0], names[2]]) { const s = `.pp2-plate.me[data-ppick="${n}"]`; if (phone) await p.tap(s); else await p.click(s); await p.waitForTimeout(120); }
    const r = await p.evaluate(() => ({on: document.querySelectorAll('.pp2-plate.me.on').length, ld: document.querySelectorAll('.pp2-plate.me.ld').length, go: !document.querySelector('[data-pprev]').disabled}));
    if (r.on !== 4 || r.ld !== 2 || !r.go) flow.push(`${th} ${W}: after tapping four and two leads: ${r.on} picked, ${r.ld} leads, reveal ${r.go ? 'on' : 'off'}`);
    if (phone) { const g = await p.evaluate(`(${measure})()`); if (!g || cols(g.me) !== 3 || rows(g.me) !== 2) flow.push(`${th} ${W}: picked cards left the 3 x 2 grid`); }
    if (phone) await p.tap('[data-pprev]'); else await p.click('[data-pprev]'); await p.waitForTimeout(400);
    const v = await p.evaluate(() => { const me = [...document.querySelectorAll('.pp2.rev .pp2-plate.me')]; return {n: me.length, cols: new Set(me.map(e => Math.round(e.getBoundingClientRect().left))).size}; });
    if (v.n !== 6 || (phone && v.cols !== 1)) flow.push(`${th} ${W}: the reveal shows ${v.n} plates in ${v.cols} columns`); }
  await ctx.close(); }
ok(forced >= 70 && forcedMeow === forced, `the 5 practice rounds with the longest name (Meowscarada) are checked at every width and theme (${forced} views, ${forcedMeow} show it)`);
ok(seen >= 50 && !grid.length, `phones 320-699: your six sit 3 columns x 2 rows while picking (${seen} views, ${grid.length} not${grid.length ? ', e.g. ' + grid[0] : ''})`);
ok(seen >= 50 && !size.length, `phones: each of your cards is as wide as theirs, same sprite and frame, within 2px (${size.length} off${size.length ? ', e.g. ' + size[0] : ''})`);
ok(block390 > 0 && !tall.length, `at 390 your six take at most 400px (tallest ${Math.round(block390)}px${tall.length ? '; ' + tall[0] : ''})`);
ok(!over.length, `phones: no name runs out of a card (yours or theirs); nothing scrolls sideways, 320-1440 (${over.length}${over.length ? ', e.g. ' + over[0] : ''})`);
ok(!words.length, `phones and desktop: every name keeps each word whole on one line (${words.length}${words.length ? ', e.g. ' + words[0] : ''})`);
ok(!tap.length, `phones: every card of your six is a 44px+ tap target and not faded below 0.8 (${tap.length}${tap.length ? ', e.g. ' + tap[0] : ''})`);
ok(!wide.length, `700 and 1440: your six unchanged, one column of plates as wide as theirs with sprite, name and types (${wide.length}${wide.length ? ', e.g. ' + wide[0] : ''})`);
ok(!flow.length, `picking four and two leads by tap/click still works, and the reveal keeps one plate per row on phones (${flow.length}${flow.length ? ', e.g. ' + flow[0] : ''})`);
await b.close(); console.log(`v2-q25: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
