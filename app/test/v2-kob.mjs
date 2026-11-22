// Sim Q57 A + Q58 C (Nov 19): the opened KO Board in the Damage Calculator ("The Arena").
// Under 1024 wide (390 phone, 1023): three count tabs under the direction switch and the intro line (role=tablist, each role=tab with
// aria-selected and aria-controls to its tile list, role=tabpanel); the counts equal the KO Board bar's numbers; the first tab chosen is
// "down in one hit"; choosing a tab shows only that group's tiles (as many as its count); arrow keys, Home and End move between the tabs;
// the counts and labels line up (same tops); a tile tap puts that hit on the table (the Arena's attacker, defender and move change as the
// old board did) and the chosen tab is remembered while the board stays open.
// From 1024 (1024, 1440): the opened board spans the page under the Arena (as wide as the Arena's grid), the three groups side by side as
// columns, each with as many rows as its count; each row shows the threat's name and a damage range; a row tap does what a tile does;
// closing the bar hides it. Both directions ("Your hits on them" / "Their hits on you"), light and dark at 390 and 1440; no sideways
// scroll, tap targets at least 44px, no page errors. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-kob.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const wait = (p, ms = 500) => p.waitForTimeout(ms);
const engine = p => p.evaluate(() => window.__ev(`({a: dc.a, d: dc.d, mv: dc.mv, dir: dc.dir || 'mine'})`));
const bar = p => p.evaluate(() => { const t = (document.querySelector('.arn-kbbar .c') || {}).textContent || '', n = re => { const m = t.match(re); return m ? +m[1] : -1; };
  return {ko: n(/(\d+) down in one hit/), can: n(/(\d+) can go down/), sv: n(/(\d+) survive/), open: !!(document.querySelector('.arn-kb') || {}).open}; });
const vis = e => !!(e && e.getClientRects().length);
const RUNS = [[390, 'light'], [390, 'dark'], [1023, 'dark'], [1024, 'dark'], [1440, 'light'], [1440, 'dark']];
for (const [W, th] of RUNS) {
  const phone = W < 700, wide = W >= 1024, tag = `${W} ${th}`;
  const c = await b.newContext({viewport: {width: W, height: phone ? 844 : 900}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})}), p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await wait(p, 4500);
  await p.locator('.arn-kb > summary').click(); await wait(p, 900);
  for (const dir of ['mine', 'theirs']) { const dt = `${tag} ${dir}`;
    if (dir === 'theirs') { await p.locator('[data-dcdir="theirs"]:visible').first().click(); await wait(p, 1500); }
    const B = await bar(p); ok(B.open && B.ko >= 0 && B.ko + B.can + B.sv === 30, `${dt}: the bar is open and counts 30 (${B.ko} / ${B.can} / ${B.sv})`);
    ok((await engine(p)).dir === dir && await p.locator(`[data-dcdir="${dir}"]:visible`).getAttribute('aria-pressed') === 'true', `${dt}: the direction switch says ${dir}`);
    if (!wide) {
      // the tabs
      const T = await p.evaluate(() => { const tl = document.querySelector('.arn-kb [role=tablist]'); if (!tl || !vis(tl)) return null;
        function vis(e) { return !!(e && e.getClientRects().length); }
        const tabs = [...tl.querySelectorAll('[role=tab]')], dirEl = document.querySelector('.arn-kb .dc2-dir'), intro = document.querySelector('.arn-kb .dc2-kb > .fine');
        return {n: tabs.length, below: !!(dirEl && intro && tl.getBoundingClientRect().top >= intro.getBoundingClientRect().bottom - 1 && intro.getBoundingClientRect().top >= dirEl.getBoundingClientRect().bottom - 1),
          tabs: tabs.map(t => { const pn = document.getElementById(t.getAttribute('aria-controls') || ''), bb = t.querySelector('b'), sp = t.querySelector('span'), r = t.getBoundingClientRect();
            return {n: +(bb && bb.textContent), lab: sp && sp.textContent.trim(), sel: t.getAttribute('aria-selected'), btn: t.tagName === 'BUTTON', panel: !!(pn && pn.getAttribute('role') === 'tabpanel'), pvis: vis(pn),
              ntop: Math.round(bb.getBoundingClientRect().top), ltop: Math.round(sp.getBoundingClientRect().top), w: r.width, h: r.height,
              lines: Math.round(sp.getBoundingClientRect().height / parseFloat(getComputedStyle(sp).lineHeight)), slant: getComputedStyle(bb).fontStyle, fam: getComputedStyle(bb).fontFamily}; })}; });
      ok(!!T && T.n === 3, `${dt}: three tabs in a role=tablist (${T && T.n})`);
      if (!T || T.n !== 3) continue;
      ok(T.below, `${dt}: the tabs sit under the direction switch and the intro line`);
      ok(T.tabs.every(t => t.btn && t.panel), `${dt}: each tab is a button with aria-controls to a role=tabpanel`);
      ok(T.tabs.map(t => t.lab).join('|') === 'down in one hit|can go down|survive', `${dt}: tab labels (${T.tabs.map(t => t.lab).join(' | ')})`);
      ok(T.tabs[0].n === B.ko && T.tabs[1].n === B.can && T.tabs[2].n === B.sv, `${dt}: tab counts equal the bar's (${T.tabs.map(t => t.n).join(' / ')})`);
      ok(T.tabs.every(t => /italic|oblique/.test(t.slant) && /Unbounded/i.test(t.fam)), `${dt}: the counts are Unbounded, slanted`);
      ok(new Set(T.tabs.map(t => t.ntop)).size === 1 && new Set(T.tabs.map(t => t.ltop)).size === 1, `${dt}: counts and labels line up (count tops ${[...new Set(T.tabs.map(t => t.ntop))]}, label tops ${[...new Set(T.tabs.map(t => t.ltop))]}; label lines ${T.tabs.map(t => t.lines).join('/')})`);
      ok(T.tabs.every(t => t.h >= 44 && t.w >= 44), `${dt}: tabs at least 44px (${T.tabs.map(t => Math.round(t.w) + 'x' + Math.round(t.h)).join(', ')})`);
      if (dir === 'mine') ok(T.tabs[0].sel === 'true' && T.tabs[1].sel === 'false' && T.tabs[2].sel === 'false' && T.tabs.filter(t => t.pvis).length === 1 && T.tabs[0].pvis, `${dt}: "down in one hit" is chosen first and only its panel shows`);
      // each tab shows its own group
      const want = {ko: B.ko, can: B.can, sv: B.sv};
      for (const [i, k] of ['ko', 'can', 'sv'].entries()) { await p.locator('.arn-kb [role=tab]').nth(i).click(); await wait(p, 250);
        const s = await p.evaluate(k => { const tabs = [...document.querySelectorAll('.arn-kb [role=tab]')], ps = [...document.querySelectorAll('.arn-kb [role=tabpanel]')].filter(e => e.getClientRects().length);
          const ts = [...document.querySelectorAll('.arn-kb .dc2-kt')].filter(e => e.getClientRects().length);
          return {sel: tabs.map(t => t.getAttribute('aria-selected')).join(','), np: ps.length, id: ps[0] && ps[0].id, n: ts.length, kinds: [...new Set(ts.map(t => ['ko', 'can', 'sv'].find(x => t.classList.contains(x))))].join(','), none: !!(ps[0] && /None in this group/.test(ps[0].textContent))}; }, k);
        ok(s.np === 1 && s.sel.split(',')[i] === 'true' && s.n === want[k] && (want[k] ? s.kinds === k : s.none), `${dt}: tab ${k} shows its ${want[k]} tiles only (${s.n} shown, kinds ${s.kinds || 'none'}${want[k] ? '' : ', says none'})`); }
      // keyboard
      await p.locator('.arn-kb [role=tab]').nth(0).click(); await wait(p, 200); await p.locator('.arn-kb [role=tab]').nth(0).focus();
      const kseq = []; for (const [key, exp] of [['ArrowRight', 1], ['ArrowRight', 2], ['ArrowRight', 0], ['ArrowLeft', 2], ['Home', 0], ['End', 2]]) { await p.keyboard.press(key); await wait(p, 120);
        const r = await p.evaluate(() => { const tabs = [...document.querySelectorAll('.arn-kb [role=tab]')]; return {f: tabs.indexOf(document.activeElement), s: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'), ti: tabs.map(t => t.tabIndex).join(',')}; });
        kseq.push(`${key}->${r.f}/${r.s}`); if (r.f !== exp || r.s !== exp || r.ti.split(',').filter(x => x === '0').length !== 1) kseq.push('WRONG'); }
      ok(!kseq.includes('WRONG'), `${dt}: arrows, Home and End move focus and choice between the tabs (${kseq.join(' ')})`);
      // a tile tap puts the hit on the table; the chosen tab stays
      const pick = B.can ? 1 : B.sv ? 2 : 0; await p.locator('.arn-kb [role=tab]').nth(pick).click(); await wait(p, 250);
      const t0 = await p.evaluate(() => { const t = [...document.querySelectorAll('.arn-kb .dc2-kt')].filter(e => e.getClientRects().length).slice(-1)[0]; return t ? {n: t.dataset.dckb, o: t.dataset.dckbo, m: t.dataset.dckbm} : null; });
      await p.locator('.arn-kb .dc2-kt:visible').last().click(); await wait(p, 1500); const e1 = await engine(p);
      const put = t0 && (dir === 'mine' ? e1.d === t0.n && e1.a === t0.o : e1.a === t0.n && e1.d === t0.o) && e1.mv === t0.m;
      const after = await p.evaluate(() => { const tabs = [...document.querySelectorAll('.arn-kb [role=tab]')]; const on = document.querySelector('.arn-kb .dc2-kt.on'); return {sel: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'), open: document.querySelector('.arn-kb').open, on: on ? on.dataset.dckb : null}; });
      ok(put, `${dt}: a tile tap puts ${t0 && t0.n} (${t0 && t0.m}) on the table (attacker ${e1.a}, defender ${e1.d}, move ${e1.mv})`);
      ok(after.open && after.sel === pick && after.on === (t0 && t0.n), `${dt}: the board stays open on the same tab (${after.sel}) with the tapped tile outlined (${after.on})`);
      ok(!(await p.$('.arn-kbfull')), `${dt}: no full-width board under 1024`);
    } else {
      const F = await p.evaluate(() => { const f = document.querySelector('.arn-kbfull'), g = document.querySelector('.pc-board'); /* Nov 21: Plot the hit (Sim approved): the board .pc-board (was the Arena's .arn-grid) */ if (!f || !f.getClientRects().length) return null;
        const cols = [...f.querySelectorAll('.kob-col')], fr = f.getBoundingClientRect(), gr = g.getBoundingClientRect(), pl = document.querySelector('.pck .k-plan'), st = pl ? pl.getBoundingClientRect() : null; /* Nov 21 Calc reskin (Sim approved): the graph paper sits inside the plan line's indent; the opened board runs the plan's full width under it */
        return {w: fr.width, gw: st ? st.width : gr.width, below: fr.top >= gr.bottom - 1, tiles: [...document.querySelectorAll('.dc2-kt')].filter(e => e.getClientRects().length).length,
          dir: !!f.querySelector('.dc2-dir'), intro: !!f.querySelector('.dc2-kb > .fine'), fold: !!f.querySelector('.dc2-all'),
          cols: cols.map(c => { const r = c.getBoundingClientRect(), rows = [...c.querySelectorAll('.kob-r')], h = c.querySelector('h3 b');
            return {g: c.dataset.g, top: Math.round(r.top), left: Math.round(r.left), right: Math.round(r.right), n: rows.length, hn: +(h && h.textContent), none: /None in this group/.test(c.textContent),
              rowsOk: rows.every(x => { const nm = x.querySelector('.nm'), pc = x.querySelector('.pc'), R = x.getBoundingClientRect(); return nm && nm.textContent.replace(/ /g, ' ').trim() === V2.disp(x.dataset.dckb) && nm.scrollWidth <= nm.clientWidth + 1 && /^\d+–\d+%$/.test(pc.textContent) && R.height >= 44 && x.tagName === 'BUTTON'; }),
              slant: h ? getComputedStyle(h).fontStyle : ''}; })}; });
      ok(!!F, `${dt}: the opened board shows under the Arena at full width`);
      if (!F) continue;
      ok(F.below && Math.abs(F.w - F.gw) <= 2, `${dt}: full page width under the Arena (${Math.round(F.w)} of ${Math.round(F.gw)}px)`);
      ok(F.dir && F.intro && F.fold && F.tiles === 0, `${dt}: it has the direction switch, the intro line and the every-hit fold; no tiles (${F.tiles})`);
      ok(F.cols.length === 3 && F.cols.map(x => x.g).join() === 'ko,can,sv' && new Set(F.cols.map(x => x.top)).size === 1 && F.cols[0].right <= F.cols[1].left && F.cols[1].right <= F.cols[2].left, `${dt}: three columns side by side (tops ${[...new Set(F.cols.map(x => x.top))]})`);
      ok(F.cols[0].n === B.ko && F.cols[1].n === B.can && F.cols[2].n === B.sv && F.cols.every(x => x.hn === x.n && (x.n || x.none)), `${dt}: rows per column equal the bar's counts (${F.cols.map(x => x.n).join(' / ')})`);
      ok(F.cols.every(x => x.rowsOk && /italic|oblique/.test(x.slant)), `${dt}: every row is a button at least 44px with the full name and a damage range; the counts are slanted`);
      const r0 = await p.evaluate(() => { const rs = [...document.querySelectorAll('.arn-kbfull .kob-r')]; const r = rs[Math.floor(rs.length / 2)]; return {n: r.dataset.dckb, o: r.dataset.dckbo, m: r.dataset.dckbm, i: Math.floor(rs.length / 2)}; });
      await p.locator('.arn-kbfull .kob-r').nth(r0.i).click(); await wait(p, 1500); const e1 = await engine(p);
      const put = (dir === 'mine' ? e1.d === r0.n && e1.a === r0.o : e1.a === r0.n && e1.d === r0.o) && e1.mv === r0.m;
      ok(put, `${dt}: a row tap puts ${r0.n} (${r0.m}) on the table (attacker ${e1.a}, defender ${e1.d}, move ${e1.mv})`);
      const on = await p.evaluate(() => { const f = document.querySelector('.arn-kbfull'), o = document.querySelector('.arn-kbfull .kob-r.on'); return {vis: !!(f && f.getClientRects().length), on: o ? o.dataset.dckb : null}; });
      ok(on.vis && on.on === r0.n, `${dt}: the board stays open with the tapped row outlined (${on.on})`);
    }
    ok(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), `${dt}: no sideways scroll`);
  }
  if (wide) { await p.locator('.arn-kb > summary').click(); await wait(p, 400); ok(!(await p.evaluate(() => { const f = document.querySelector('.arn-kbfull'); return !!(f && f.getClientRects().length); })), `${tag}: closing the bar hides the full-width board`); }
  ok(!errs.length, `${tag}: no page errors${errs.length ? ': ' + errs[0] : ''}`);
  await c.close(); }
await b.close(); console.log(`v2-kob: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
