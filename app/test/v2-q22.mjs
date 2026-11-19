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

// mouse screens
for (const W of [1280, 1440]) { const {c, p} = await open(W, false); const n = await tiles(p).count(), bad = [], tag = `${W} mouse`;
  ok(n === 30, `${tag}: the board shows 30 tiles (${n})`);
  const clean = await p.evaluate(() => [...document.querySelectorAll('.dc2-kt')].filter(t => t.getClientRects().length).filter(t => t.innerText.replace(/\bKO\b/, '').trim()).length);
  ok(clean === 0 && !(await label(p)), `${tag}: with no hover the tiles stay clean (${clean} show text besides the KO stamp) and no label shows`);
  for (const dir of ['mine', 'theirs']) { if (dir === 'theirs') { await p.locator('[data-dcdir="theirs"]:visible').first().click(); await p.waitForTimeout(1200); await p.mouse.move(2, 450); await p.waitForTimeout(200); }
    for (const i of [0, 4, 14, 15, 19, 29]) { const w = await want(p, i); await tiles(p).nth(i).hover(); await p.waitForTimeout(150); const l = await label(p);
      if (!l || !l.text.includes(w.name) || l.text !== w.say || !l.inside) bad.push(`${dir} hover tile ${i} (${w.name}): ${l ? `"${l.text}"${l.inside ? '' : ' outside the window or its box'}` : 'no label'}`); }
    await p.mouse.move(2, 450); await p.waitForTimeout(200); if (await label(p)) bad.push(`${dir}: the label stays after the mouse leaves`); }
  await p.locator('[data-dcdir="mine"]:visible').first().click(); await p.waitForTimeout(1200); await p.mouse.move(2, 450);
  for (const i of [0, 29]) { const w = await want(p, i); await tiles(p).nth(i).focus(); await p.waitForTimeout(150); const l = await label(p);
    if (!l || l.text !== w.say || !l.inside) bad.push(`focus tile ${i} (${w.name}): ${l ? `"${l.text}"` : 'no label'}`);
    await p.keyboard.press('Escape'); await p.waitForTimeout(100); if (await label(p)) bad.push(`focus tile ${i}: Escape leaves the label`); }
  await tiles(p).nth(3).focus(); await p.keyboard.press('Tab'); await p.waitForTimeout(150); { const w = await want(p, 4), l = await label(p); if (!l || l.text !== w.say) bad.push(`Tab to tile 4: ${l ? `"${l.text}"` : 'no label'}`); }
  await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(150); if (await label(p)) bad.push('the label stays after focus leaves');
  ok(!bad.length, `${tag}: hover and keyboard focus show the tile's own words (name and damage) inside the window, and hide again (${bad.length} wrong${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''})`);
  await c.close(); }

// phones: a short name under every tile
for (const W of [390, 320]) { const {c, p} = await open(W, true), tag = `${W} touch`;
  const m = await p.evaluate(() => { const ts = [...document.querySelectorAll('.dc2-kt')].filter(t => t.getClientRects().length), out = {n: ts.length, none: [], over: [], cut: 0, noDots: [], rows: [], above: []};
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
  ok(m.n === 30, `${tag}: the board shows 30 tiles (${m.n})`);
  ok(!m.none.length, `${tag}: every tile shows its name (${m.none.length} without${m.none.length ? ', e.g. ' + m.none.slice(0, 3).join(', ') : ''})`);
  ok(!m.over.length && !m.above.length, `${tag}: each name sits under its picture, inside its tile (${m.over.length} out, ${m.above.length} not under${m.over.length ? ', e.g. ' + m.over[0] : ''})`);
  ok(!m.noDots.length, `${tag}: a name that has to be cut ends in an ellipsis (${m.cut} cut, ${m.noDots.length} without the dots)`);
  ok(!m.rows.length, `${tag}: every row's names take the same number of lines (${m.rows.length} uneven${m.rows.length ? ', e.g. ' + m.rows[0] : ''})`);
  ok(!m.side, `${tag}: nothing scrolls sideways`);
  await p.locator('.dc2-kt:visible').first().dispatchEvent('focusin'); await p.waitForTimeout(150);
  ok(!(await label(p)), `${tag}: no hover label on touch screens (the names are on the tiles)`);
  await c.close(); }
await b.close(); console.log(`v2-q22: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
