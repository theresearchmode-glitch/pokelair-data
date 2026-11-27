// Damage Calc, the KO Board's 30 tiles get their names (Sim's Q22 A, Nov 19). Mouse screens (1280, 1440): hovering or keyboard-focusing a
// tile shows a small label with the tile's own spoken text ("KO: Mega Froslass: your Mega Charizard Y's Weather Ball does 224–265%, down
// in one hit"), inside the window; with no hover or focus it is hidden and the tiles stay clean (no names on them). Phones (touch, no hover;
// 390 and 320): every tile shows a short name under its picture, inside the tile, every row of a group the same number of lines, a cut
// name ends in an ellipsis, and nothing scrolls sideways. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-q22.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const open = async (W, touch) => { const c = await b.newContext({viewport: {width: W, height: 900}, hasTouch: touch, isMobile: touch}), p = await c.newPage();
  await p.addInitScript(() => { window.__PL_TEST = 1; }); await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await p.waitForTimeout(2500);
  /* the Arena (Nov 19): the board sits behind the KO Board bar, one tap away; open it first */ await p.locator('.arn-kb > summary').click(); await p.waitForTimeout(800); return {c, p}; };
// the visible label (any element whose class names a tip, or a tooltip role) and where it sits
const label = p => p.evaluate(() => { const el = [...document.querySelectorAll('.dc2-tip,[role="tooltip"]')].find(x => { const r = x.getBoundingClientRect(), s = getComputedStyle(x);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0; });
  if (!el) return null; const r = el.getBoundingClientRect(), g = document.createRange(); g.selectNodeContents(el); const T = g.getBoundingClientRect();
  return {text: el.textContent.trim(), inside: r.left >= 0 && r.top >= 0 && r.right <= document.documentElement.clientWidth && r.bottom <= innerHeight && T.left >= r.left && T.right <= r.right && T.top >= r.top && T.bottom <= r.bottom}; });
const want = (p, i) => p.evaluate(i => { const t = [...document.querySelectorAll('.dc2-kt')].filter(x => x.getClientRects().length)[i];
  return {name: V2.disp(t.dataset.dckb), say: t.getAttribute('aria-label').replace(/\. Put it on the table$/, '')}; }, i);
const tiles = p => p.locator('.dc2-kt:visible');

/* Q57 A / Q58 C (Sim, Nov 19): under 1024 the board's groups are tabs, one group's tiles on show; from 1024 the board is rows under the Arena
   that show each name and damage as words (no tiles, so no hover label). So the tile checks run on every tab, the mouse ones at 800 and 1000
   (mouse screens under 1024, where the tiles and their hover label remain), and 1280 / 1440 check the rows' names instead. */
const tabsOf = p => p.locator('.arn-kb [role=tab]');
const eachTab = async (p, fn) => { const n = await tabsOf(p).count(); for (let i = 0; i < n; i++) { await tabsOf(p).nth(i).click(); await p.waitForTimeout(200); if (await tiles(p).count()) await fn(i); } await tabsOf(p).nth(0).click(); await p.waitForTimeout(200); };
for (const W of [1280, 1440]) { const {c, p} = await open(W, false), tag = `${W} mouse`;
  const r = await p.evaluate(() => { const rs = [...document.querySelectorAll('.arn-kbfull .kob-r')].filter(x => x.getClientRects().length);
    return {n: rs.length, named: rs.filter(x => { const nm = x.querySelector('.nm'); return nm && nm.getClientRects().length && nm.textContent.replace(/ /g, ' ').trim() === V2.disp(x.dataset.dckb) && nm.scrollWidth <= nm.clientWidth + 1; }).length, tiles: [...document.querySelectorAll('.dc2-kt')].filter(t => t.getClientRects().length).length}; });
  ok(r.n === 30 && r.named === 30 && r.tiles === 0, `${tag}: the board's 30 rows each show the full name on view (${r.named} of ${r.n}; ${r.tiles} tiles)`);
  await p.locator('.arn-kbfull .kob-r').nth(3).hover(); await p.waitForTimeout(150); ok(!(await label(p)), `${tag}: no hover label over a row (its name and damage are on it)`);
  await c.close(); }
for (const W of [800, 1000]) { const {c, p} = await open(W, false); const n = await p.locator('.arn-kb .dc2-kt').count(), bad = [], tag = `${W} mouse`;
  ok(n === 30, `${tag}: the board holds 30 tiles across its three tabs (${n})`);
  const clean = await p.evaluate(() => [...document.querySelectorAll('.dc2-kt')].filter(t => t.getClientRects().length).filter(t => t.innerText.replace(/\bKO\b/, '').trim()).length);
  ok(clean === 0 && !(await label(p)), `${tag}: with no hover the tiles stay clean (${clean} show text besides the KO stamp) and no label shows`);
  for (const dir of ['mine', 'theirs']) { if (dir === 'theirs') { await p.locator('[data-dcdir="theirs"]:visible').first().click(); await p.waitForTimeout(1200); await p.mouse.move(2, 450); await p.waitForTimeout(200); }
    await eachTab(p, async ti => { const k = await tiles(p).count(); for (const i of [...new Set([0, Math.min(4, k - 1), k - 1])]) { const w = await want(p, i); await tiles(p).nth(i).hover(); await p.waitForTimeout(150); const l = await label(p);
      if (!l || !l.text.includes(w.name) || l.text !== w.say || !l.inside) bad.push(`${dir} tab ${ti} hover tile ${i} (${w.name}): ${l ? `"${l.text}"${l.inside ? '' : ' outside the window or its box'}` : 'no label'}`); } await p.mouse.move(2, 450); await p.waitForTimeout(100); });
    await p.mouse.move(2, 450); await p.waitForTimeout(200); if (await label(p)) bad.push(`${dir}: the label stays after the mouse leaves`); }
  await p.locator('[data-dcdir="mine"]:visible').first().click(); await p.waitForTimeout(1200); await p.mouse.move(2, 450);
  for (const i of [0, (await tiles(p).count()) - 1]) { const w = await want(p, i); await tiles(p).nth(i).focus(); await p.waitForTimeout(150); const l = await label(p);
    if (!l || l.text !== w.say || !l.inside) bad.push(`focus tile ${i} (${w.name}): ${l ? `"${l.text}"` : 'no label'}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(100); if (await label(p)) bad.push(`focus tile ${i}: Escape leaves the label`); }
  await tiles(p).nth(3).focus(); await p.keyboard.press('Tab'); await p.waitForTimeout(150); { const w = await want(p, 4), l = await label(p); if (!l || l.text !== w.say) bad.push(`Tab to tile 4: ${l ? `"${l.text}"` : 'no label'}`); }
  await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(150); if (await label(p)) bad.push('the label stays after focus leaves');
  ok(!bad.length, `${tag}: hover and keyboard focus show the tile's own words (name and damage) inside the window, and hide again (${bad.length} wrong${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''})`);
  await c.close(); }

// phones: a short name under every tile
for (const W of [390, 320]) { const {c, p} = await open(W, true), tag = `${W} touch`;
  const one = () => p.evaluate(() => { const ts = [...document.querySelectorAll('.dc2-kt')].filter(t => t.getClientRects().length), out = {n: ts.length, none: [], over: [], cut: 0, noDots: [], rows: [], above: []};
    for (const t of ts) { const T = t.getBoundingClientRect(), nm = [...t.querySelectorAll('*')].find(x => x.children.length === 0 && x.getClientRects().length && x.textContent.trim() && !x.classList.contains('stamp'));
      const d = V2.disp(t.dataset.dckb).replace(/^Mega /, ''); if (!nm) { out.none.push(d); continue; } const N = nm.getBoundingClientRect(), txt = nm.textContent.replace(/ /g, ' ').trim();
      if (!d.startsWith(txt) && !txt.startsWith(d.split(' ')[0])) out.none.push(`${d} reads "${txt}"`);
      if (N.left < T.left - .5 || N.right > T.right + .5 || N.bottom > T.bottom + .5) out.over.push(d);
      const sp = t.querySelector('.np-mon'); if (sp && N.top < sp.getBoundingClientRect().bottom - 1) out.above.push(d);
      if (nm.scrollWidth > nm.clientWidth + 1) { out.cut++; if (getComputedStyle(nm).textOverflow !== 'ellipsis') out.noDots.push(d); }
      t._nl = Math.round(N.height / parseFloat(getComputedStyle(nm).lineHeight)); }
    for (const g of document.querySelectorAll('.dc2-kts')) { const rows = {}; for (const t of g.querySelectorAll('.dc2-kt')) if (t.getClientRects().length && t._nl) (rows[Math.round(t.getBoundingClientRect().top)] ||= new Set()).add(t._nl);
      for (const [y, s] of Object.entries(rows)) if (s.size > 1) out.rows.push(`row at ${y}: ${[...s].join(' and ')} lines`); }
    out.side = document.documentElement.scrollWidth > innerWidth; return out; });
  const m = {n: 0, none: [], over: [], above: [], cut: 0, noDots: [], rows: [], side: false}; /* every tab in turn (Q57 A) */
  await eachTab(p, async () => { const x = await one(); m.n += x.n; for (const k of ['none', 'over', 'above', 'noDots', 'rows']) m[k].push(...x[k]); m.cut += x.cut; m.side ||= x.side; });
  ok(m.n === 30, `${tag}: the board shows 30 tiles across its three tabs (${m.n})`);
  ok(!m.none.length, `${tag}: every tile shows its name (${m.none.length} without${m.none.length ? ', e.g. ' + m.none.slice(0, 3).join(', ') : ''})`);
  ok(!m.over.length && !m.above.length, `${tag}: each name sits under its picture, inside its tile (${m.over.length} out, ${m.above.length} not under${m.over.length ? ', e.g. ' + m.over[0] : ''})`);
  ok(!m.noDots.length, `${tag}: a name that has to be cut ends in an ellipsis (${m.cut} cut, ${m.noDots.length} without the dots)`);
  ok(!m.rows.length, `${tag}: every row's names take the same number of lines (${m.rows.length} uneven${m.rows.length ? ', e.g. ' + m.rows[0] : ''})`);
  ok(!m.side, `${tag}: nothing scrolls sideways`);
  await p.locator('.dc2-kt:visible').first().dispatchEvent('focusin'); await p.waitForTimeout(150);
  ok(!(await label(p)), `${tag}: no hover label on touch screens (the names are on the tiles)`);
  await c.close(); }
await b.close(); console.log(`v2-q22: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
