// Sim Q47 A (Nov 19, 8:33 PM): in the Arena calc "All moves" and each set row open sheets in the site's search-sheet style instead of the
// phone's plain dropdown. All moves opens "Choose a move": focus in the search box, the same moves as today's #dcMv (same count and order,
// its set first), each row with the calc engine's own damage against the current defender (3 rows checked against what the Arena shows
// once that move is picked), typing filters, Enter or a tap picks (#dcMv changes, the verdict follows, focus back on All moves), Escape
// closes with no change. Each set row (item, Ability, nature, points on the attacker; item, Ability, nature on the defender) opens its own
// short sheet with today's options, the current one marked selected and at most one marked "most used"; a pick changes the matching
// select (and the result where that choice moves the damage). Today's selects stay in the page, hidden and out of the tab order.
// At 390 and 1440, light and dark; no page errors. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q47.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const wait = (p, ms = 500) => p.waitForTimeout(ms);
/* Nov 21, 8:39 AM (Sim): % of HP first everywhere, HP beside it (was real HP first, Q100); the engine's % rounded like the KO Board.
   Earlier: Plot the hit (Sim approved): the answer is .pc-ans and shows the damage in real HP (.pc-big, 'min–max' from the engine's min and max:
   e.hp); Nov 21 (Sim, Nov 20: real HP numbers, not %): the sheet's rows show 'min–max of N HP' too (e.row, built here from the engine's
   min, max and the defender's HP, not from the page's own helpers), so a row is checked against the engine and the answer against the same hit */
const engine = p => p.evaluate(() => window.__ev(`(() => { const C = calcData(), r = C.r, d = r && r.max > 0 ? (r.min === r.max ? String(r.min) : r.min + '–' + r.max) : '', q = v => Math.round(100 * v / r.hp), pc = d ? (r.min === r.max ? q(r.min) + '%' : q(r.min) + '–' + q(r.max) + '%') : ''; return {mv: dc.mv, row: d ? pc + ' · ' + d + ' of ' + r.hp + ' HP' : (r ? 'none' : ''), hp: pc, min: r && r.min, max: r && r.max}; })()`));
const verdict = p => p.evaluate(() => { const e = document.querySelector('.pc-ans'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; });
const big = p => p.evaluate(() => { const e = document.querySelector('.pc-ans .pc-big'); return e ? e.textContent.trim() : ''; });

const sheet = p => p.evaluate(() => { const s = document.querySelector('[role=dialog]'); if (!s) return null; const a = document.activeElement;
  return {label: s.getAttribute('aria-label'), search: !!(a && a.matches('input[type=search]') && s.contains(a)), heads: [...s.querySelectorAll('.arn-grp')].map(h => h.textContent.trim()),
    mv: [...s.querySelectorAll('[data-arnpickmv]')].map(r => ({n: r.dataset.arnpickmv, dm: ((r.querySelector('.arn-mvd b') || {}).textContent || '').trim(), edge: r.style.getPropertyValue('--tc')})),
    opt: [...s.querySelectorAll('[data-arnopt]')].map(r => ({v: r.dataset.arnopt, cur: r.getAttribute('aria-current') === 'true', mu: !!r.querySelector('.arn-mu')}))}; });
const opts = (p, id) => p.evaluate(id => { const s = document.getElementById(id); return s ? {v: s.value, dis: s.disabled, hid: s.tabIndex === -1 && s.getAttribute('aria-hidden') === 'true', o: [...s.options].map(o => ({v: o.value, t: o.text, g: o.parentElement.label || ''}))} : null; }, id);
const focusOn = (p, sel) => p.evaluate(s => !!(document.activeElement && document.activeElement.matches(s)), sel);
for (const th of ['light', 'dark']) for (const W of [390, 1440]) {
  const phone = W < 700, c = await b.newContext({viewport: {width: W, height: phone ? 844 : 900}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})}), p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day'); await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await p.waitForTimeout(4500); const tag = `${th} ${W}`;
  const o0 = await opts(p, 'dcMv'); ok(!!o0 && o0.o.length > 3, `${tag}: today's move list #dcMv is on the page (${o0 && o0.o.length} moves)`);
  if (!(await p.locator('[data-arnmv]').count())) { ok(false, `${tag}: All moves is a button that opens "Choose a move" (none found)`); await c.close(); continue; }
  ok(o0.hid, `${tag}: today's move list is hidden and out of the tab order`);
  // open: title, focus, rows = today's options in the same order (its set first)
  await p.locator('[data-arnmv]').click(); await wait(p, 800); let sh = await sheet(p);
  ok(sh && sh.label === 'Choose a move' && sh.search, `${tag}: All moves opens "${sh && sh.label}" with focus in the search box (${sh && sh.search})`);
  const same = sh && sh.mv.length === o0.o.length && sh.mv.every((r, i) => r.n === o0.o[i].t);
  ok(same, `${tag}: the rows are today's ${o0.o.length} moves in the same order (${sh && sh.mv.length} rows)`);
  const setN = o0.o.filter(x => x.g === 'Its set').length;
  ok(sh && (setN ? /^Its (usual set|set on your team)$/.test(sh.heads[0]) && sh.heads[1] === 'Every other move' : sh.heads[0] === 'Every other move'), `${tag}: its set first (${setN} moves), then every other move (headings: ${sh && sh.heads.join(' | ')})`);
  ok(sh && sh.mv.every(r => /^var\(--ty-[A-Z][a-z]+\)$/.test(r.edge)), `${tag}: every row has its type colour edge`);
  const withN = sh ? sh.mv.filter(r => /^\d+(–\d+)?% · \d+(–\d+)? of \d+ HP$/.test(r.dm)) : []; ok(withN.length >= 3, `${tag}: ${withN.length} rows show the damage as % of HP first, HP beside it ('${withN[0] && withN[0].dm}')`);
  await p.keyboard.press('Escape'); await wait(p); ok(!(await sheet(p)) && (await opts(p, 'dcMv')).v === o0.v, `${tag}: Escape closes it with no change (${o0.v})`);
  // 3 rows: the damage on the row equals what the Arena shows once that move is picked (a tap)
  const pickN = [withN.find(r => r.n !== o0.v), withN.filter(r => r.n !== o0.v)[Math.floor(withN.length / 2)], withN.filter(r => r.n !== o0.v).slice(-1)[0]].filter(Boolean);
  for (const r of pickN) { const v0 = await verdict(p); await p.locator('[data-arnmv]').click(); await wait(p, 800);
    await p.locator(`[role=dialog] [data-arnpickmv="${r.n.replace(/"/g, '\\"')}"]`).click(); await wait(p, 900);
    const e = await engine(p), v1 = await verdict(p), b1 = await big(p), mv = (await opts(p, 'dcMv')).v, gone = !(await sheet(p)), foc = await focusOn(p, '[data-arnmv]');
    ok(gone && mv === r.n && e.mv === r.n && e.row === r.dm && b1 === e.hp && v1 !== v0, `${tag}: a tap on ${r.n} (row ${r.dm}) puts it in play: #dcMv ${mv}, the engine ${e.row}, the answer shows ${b1} ("${v1.slice(0, 48)}")`); /* Nov 21: Plot the hit (Sim approved): the row's HP is the engine's and the answer's HP is the same hit's */
    ok(foc, `${tag}: focus back on All moves after the pick (${foc})`); }
  // typing filters; Enter picks the first row
  await p.locator('[data-arnmv]').click(); await wait(p, 800); const cur = (await opts(p, 'dcMv')).v, all = (await opts(p, 'dcMv')).o.map(x => x.t);
  const target = all.find(t => t !== cur && t.length > 5 && all.filter(u => u.toLowerCase().includes(t.slice(0, 5).toLowerCase())).length < all.length / 2);
  const q = target.slice(0, 5).trim(); await p.keyboard.type(q); await wait(p, 400); sh = await sheet(p);
  const exp = all.filter(t => t.toLowerCase().includes(q.toLowerCase()));
  ok(sh && sh.mv.length === exp.length && sh.mv.length < all.length && sh.mv.every(r => r.n.toLowerCase().includes(q.toLowerCase())), `${tag}: typing "${q}" filters to ${sh && sh.mv.length} of ${all.length} (${sh && sh.mv.slice(0, 4).map(r => r.n).join(', ')})`);
  const first = sh && sh.mv[0] && sh.mv[0].n; const vb = await verdict(p); await p.keyboard.press('Enter'); await wait(p, 900);
  ok(!(await sheet(p)) && (await opts(p, 'dcMv')).v === first && (await engine(p)).mv === first && (first === cur || (await verdict(p)) !== vb), `${tag}: Enter picks ${first} (#dcMv ${(await opts(p, 'dcMv')).v})`);
  ok(await focusOn(p, '[data-arnmv]'), `${tag}: focus back on All moves after Enter`);
  // a Mega's item row is its fixed stone (no sheet); then a non-Mega attacker (Garchomp, through today's picker) so every row is tested
  { const it = await opts(p, 'dcAIt'); if (it && it.dis) ok(!(await p.locator('[data-arnset="dcAIt"]').count()), `${tag}: the Mega's item row stays fixed (${it.o[0] && it.o[0].t}): no sheet`);
    await p.selectOption('#dcA', 'Garchomp'); await wait(p, 1200); ok((await p.evaluate(() => document.getElementById('dcA').value)) === 'Garchomp', `${tag}: attacker Garchomp for the set rows`); }
  // put a strong move back so the set rows move the damage
  { await p.locator('[data-arnmv]').click(); await wait(p, 800); const s2 = await sheet(p); const pick = s2.mv.find(r => / HP$/.test(r.dm)); await p.locator(`[role=dialog] [data-arnpickmv="${pick.n}"]`).click(); await wait(p, 900); }
  // the set rows
  const rows = [['dcAIt', /^Attacker's item$/, 1], ['dcAAb', /^Attacker's Ability$/, 0], ['dcANat', /^Attacker's nature$/, 1], ['dcASp', /^Attacker's .*points$/, 1], ['dcDIt', /^Defender's item$/, 0], ['dcDAb', /^Defender's Ability$/, 0], ['dcDNat', /^Defender's nature$/, 1]];
  const mus = [];
  for (const [id, title, moves] of rows) { const s0 = await opts(p, id); if (!s0) { ok(false, `${tag}: ${id} is on the page`); continue; }
    const btn = p.locator(`[data-arnset="${id}"]`);
    if (s0.dis) { ok(!(await btn.count()), `${tag}: ${id} is fixed (${s0.o[0] && s0.o[0].t}, a Mega's stone): no sheet, today's row as it is`); continue; }
    if (!(await btn.count())) { ok(false, `${tag}: the ${id} row is a button that opens its sheet (none found)`); continue; }
    ok(s0.hid, `${tag}: today's ${id} is hidden and out of the tab order`);
    await btn.click(); await wait(p, 700); const s = await sheet(p);
    ok(s && title.test(s.label) && s.opt.length === s0.o.length && s.opt.every((r, i) => r.v === s0.o[i].v), `${tag}: ${id} opens "${s && s.label}" with today's ${s0.o.length} options (${s && s.opt.length} rows)`);
    const curR = s ? s.opt.filter(r => r.cur) : [], muR = s ? s.opt.filter(r => r.mu) : []; mus.push(`${id}: ${muR.map(r => r.v || 'None').join(',') || '-'}`);
    ok(curR.length === 1 && curR[0].v === s0.v && muR.length <= 1, `${tag}: ${id}: the current choice (${s0.v || 'None'}) is marked selected; most used: ${muR.map(r => r.v || 'None').join(', ') || 'none marked'}`);
    if (s0.o.length < 2) { await p.keyboard.press('Escape'); await wait(p); console.log(`  info  ${tag}: ${id} has one choice (${s0.o[0].t}); no other to pick`); continue; }
    // pick: a nature that moves the stat, 0 points, Life Orb / None, else the next option
    const spec = await p.evaluate(() => window.__ev(`(() => { const m = mvByName.get(dc.mv); return !!(m && m.cat === 2); })()`));
    const want = id === 'dcANat' ? (s0.v === 'Adamant' ? 'Modest' : 'Adamant') : id === 'dcDNat' ? (spec ? (s0.v === 'Gentle' ? 'Calm' : 'Gentle') : (s0.v === 'Lonely' ? 'Bold' : 'Lonely')) : id === 'dcASp' ? (s0.v === '0' ? '32' : '0') : id === 'dcAIt' ? (s0.v === 'Life Orb' ? '' : 'Life Orb') : s0.o.find(o => o.v !== s0.v).v;
    const e0 = await engine(p); await p.locator(`[role=dialog] [data-arnopt="${want}"]`).click(); await wait(p, 900); const s1 = await opts(p, id), e1 = await engine(p);
    ok(!(await sheet(p)) && s1.v === want && (!moves || e1.min !== e0.min || e1.max !== e0.max), `${tag}: ${id}: a tap on "${want || 'None'}" sets it (${s0.v || 'None'} -> ${s1.v || 'None'})${moves ? `, damage ${e0.row} -> ${e1.row}` : ''}`);
    ok(await focusOn(p, `[data-arnset="${id}"]`), `${tag}: ${id}: focus back on its row`);
    await btn.click(); await wait(p, 600); await p.keyboard.press('Escape'); await wait(p); ok(!(await sheet(p)) && (await opts(p, id)).v === want, `${tag}: ${id}: Escape closes its sheet with no change`); }
  console.log(`  info  ${tag}: most used marks: ${mus.join('; ')}`);
  ok(!errs.length, `${tag}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close();
}
await b.close(); console.log(fails.length ? `v2-q47: ${fails.length} failed` : 'v2-q47: all passed'); process.exit(fails.length ? 1 : 0);
