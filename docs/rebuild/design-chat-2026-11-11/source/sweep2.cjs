// Second pass: behaviour probes + montages. Usage: node sweep2.cjs <outDir>
const fs = require('fs'), path = require('path'), {createRequire} = require('module');
const OUT = process.argv[2], F = 'file:///C:/Users/simra/AppData/Local/Temp/claude/469e588db1a22171/bb823294-4095-4fd5-ba18-59326258ebc4/scratchpad/art-site/foundation.html';
const log = (...a) => console.log(...a);
(async () => {
  const {chromium} = createRequire('C:/Users/simra/code/pl-ui/')('playwright'), b = await chromium.launch();
  const open = async (vw, vh, route = 'team', theme) => { const cx = await b.newContext({viewport: {width: vw, height: vh}, hasTouch: vw < 900}); const pg = await cx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message.slice(0, 140)));
    await pg.goto(F + '#' + route); await pg.waitForTimeout(1200); if (theme) { await pg.evaluate(t => V2.setTheme(t), theme); await pg.waitForTimeout(600); } return pg; };
  const byText = (pg, t) => pg.locator(`button:visible,a:visible,summary:visible`).filter({hasText: t}).first();
  const state = pg => pg.evaluate(() => ({h: document.documentElement.scrollHeight, score: (document.querySelector('.tm-hero') || document.body).innerText.split('\n').slice(0, 8).join(' | ').slice(0, 160), six: [...document.querySelectorAll('.sx-slot .np-mon b')].map(e => e.textContent.trim()).join(', '), toast: [...document.querySelectorAll('[role=status],[aria-live],.np-toast')].map(e => e.textContent.trim().slice(0, 80)).filter(Boolean).join(' / ')}));

  // A. hidden controls: why can't they be clicked
  { const pg = await open(1440, 900); const r = await pg.evaluate(() => [...document.querySelectorAll('button,summary')].filter(e => /Swap out|Show 4 more|^\?$|Weakness/.test(e.textContent.trim())).map(e => { const q = e.getBoundingClientRect(); const d = e.closest('details'); const top = document.elementFromPoint(q.left + q.width / 2, Math.min(innerHeight - 1, Math.max(0, q.top + q.height / 2))); return {t: e.textContent.trim().slice(0, 30), box: [Math.round(q.left), Math.round(q.top + scrollY), Math.round(q.width), Math.round(q.height)], inDetails: !!d, open: d && d.open, outerOpen: d && d.parentElement.closest('details') && d.parentElement.closest('details').open, vis: getComputedStyle(e).visibility, cv: e.closest('[style*=content-visibility]') ? 'cv' : '', tabbable: e.tabIndex}; }));
    log('A hidden controls', JSON.stringify(r)); await pg.close(); }

  // B. scroll lock with the wheel, per sheet
  for (const name of ['Saved Teams', 'Log a Game', 'Search']) { const pg = await open(1440, 900); const l = byText(pg, name); try { await l.click({timeout: 4000}); } catch (x) { log('B', name, 'CLICK FAILED', String(x.message).split('\n')[0]); await pg.close(); continue; } await pg.waitForTimeout(600); const y0 = await pg.evaluate(() => scrollY); await pg.mouse.move(40, 450); await pg.mouse.wheel(0, 600); await pg.waitForTimeout(400); const y1 = await pg.evaluate(() => scrollY);
    const info = await pg.evaluate(() => { const d = document.querySelector('[role=dialog]'); const s = document.querySelector('.np-scrim'); return {dialog: !!d, label: d && (d.getAttribute('aria-label') || d.getAttribute('aria-labelledby')), close: d ? [...d.querySelectorAll('button')].filter(x => /close|done|cancel|×|✕/i.test((x.textContent || '') + (x.getAttribute('aria-label') || ''))).map(x => (x.textContent.trim() || x.getAttribute('aria-label')) + ' ' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height)).slice(0, 3) : [], inert: [...document.body.children].filter(c => c.inert || c.getAttribute('aria-hidden') === 'true').length}; });
    // tab trap: press Tab 40 times, does focus leave the dialog
    let left = false; for (let i = 0; i < 40; i++) { await pg.keyboard.press('Tab'); if (await pg.evaluate(() => { const d = document.querySelector('[role=dialog]') || document.querySelector('.np-scrim'); return d && !d.contains(document.activeElement); })) { left = true; break; } }
    // click outside closes?
    await pg.mouse.click(20, 450); await pg.waitForTimeout(400); const closed = await pg.evaluate(() => !document.querySelector('.np-scrim') || getComputedStyle(document.querySelector('.np-scrim')).display === 'none');
    log('B sheet', name, 'pageScrolledBehind', y1 - y0, JSON.stringify(info), 'focusEscapes', left, 'outsideClickCloses', closed, pg.errs.join(';')); await pg.close(); }

  // C. flows
  { const pg = await open(1440, 900); const s0 = await state(pg); log('C start', JSON.stringify(s0));
    await byText(pg, 'Remove').click(); await pg.waitForTimeout(700); const s1 = await state(pg); log('C after Remove', JSON.stringify(s1)); const undo = byText(pg, 'Undo'); log('C undo offered', await undo.count());
    if (await undo.count()) { await undo.click(); await pg.waitForTimeout(700); log('C after Undo', JSON.stringify(await state(pg))); }
    await pg.reload(); await pg.waitForTimeout(1200); log('C after reload', JSON.stringify(await state(pg)));
    await byText(pg, 'Apply').click(); await pg.waitForTimeout(800); log('C after Apply', JSON.stringify(await state(pg)), 'undo', await byText(pg, 'Undo').count());
    await byText(pg, 'Night').click().catch(() => {}); await pg.waitForTimeout(400); const th = await pg.evaluate(() => document.documentElement.dataset.theme + ' btn=' + [...document.querySelectorAll('button')].filter(e => /^(Night|Day)$/.test(e.textContent.trim())).map(e => e.textContent.trim() + ' pressed=' + e.getAttribute('aria-pressed')).join()); log('C theme', th);
    // back button after opening a sheet + navigating
    await pg.goto(F + '#team'); await pg.waitForTimeout(800); await byText(pg, 'Info Sheet').click(); await pg.waitForTimeout(600); const hashOpen = await pg.evaluate(() => location.hash); await pg.goBack(); await pg.waitForTimeout(600); log('C sheet hash', hashOpen, 'after Back: hash', await pg.evaluate(() => location.hash), 'sheet still open', await pg.evaluate(() => !!document.querySelector('[role=dialog]')));
    log('C errors', pg.errs.join(';')); await pg.close(); }

  // D. keyboard: tab through the first 30 stops, is focus visible, order sane
  { const pg = await open(1440, 900); const stops = []; for (let i = 0; i < 30; i++) { await pg.keyboard.press('Tab'); stops.push(await pg.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e); const q = e.getBoundingClientRect(); return (e.textContent.trim().replace(/\s+/g, ' ') || e.getAttribute('aria-label') || e.tagName).slice(0, 18) + (s.outlineStyle === 'none' && s.boxShadow === 'none' ? ' [NO RING]' : '') + (q.width === 0 ? ' [HIDDEN]' : ''); })); } log('D tab order', stops.join(' > ')); await pg.close(); }

  // E. tile hit areas and the six on phone
  { const pg = await open(390, 844); const r = await pg.evaluate(() => [...document.querySelectorAll('.sx-slot .np-mon')].map(m => { const q = m.getBoundingClientRect(), i = m.querySelector('img').getBoundingClientRect(), n = m.querySelector('b').getBoundingClientRect(); return {n: m.querySelector('b').textContent.trim(), tile: [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)], img: [Math.round(i.left), Math.round(i.top), Math.round(i.width), Math.round(i.height)], nameTop: Math.round(n.top)}; })); log('E six phone', JSON.stringify(r));
    const nav = await pg.evaluate(() => { const f = [...document.querySelectorAll('nav,div')].filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height < 120 && e.getBoundingClientRect().width > 300).map(e => ({c: String(e.className).slice(0, 20), t: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height)})); return {f, padBottom: getComputedStyle(document.body).paddingBottom, mainPad: getComputedStyle(document.querySelector('main') || document.body).paddingBottom}; }); log('E fixed bars', JSON.stringify(nav));
    await pg.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await pg.waitForTimeout(300); await pg.screenshot({path: path.join(OUT, 's2-phone-bottom.png')}); await pg.evaluate(() => scrollTo(0, 0)); await pg.screenshot({path: path.join(OUT, 's2-phone-top.png')}); await pg.evaluate(() => scrollTo(0, 700)); await pg.waitForTimeout(200); await pg.screenshot({path: path.join(OUT, 's2-phone-2.png')}); await pg.close(); }

  // F. open everything on desktop: details + problems, measure and shoot
  { const pg = await open(1440, 900); await pg.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true)); await pg.waitForTimeout(500); log('F all details open height', await pg.evaluate(() => document.documentElement.scrollHeight)); const q = await pg.evaluate(() => { const e = [...document.querySelectorAll('.u,h2,h3')].find(x => /Team Checks/.test(x.textContent)); const r = e.getBoundingClientRect(); return Math.round(r.top + scrollY); }); await pg.screenshot({path: path.join(OUT, 's2-desk-checks.png'), fullPage: true, clip: {x: 700, y: q - 30, width: 740, height: 1400}}); await pg.close(); }

  // G. montage of phone sheets (shots made by sweep.cjs)
  { const shots = [[5, 'Why this score?'], [14, 'Edit Set'], [16, 'Share'], [17, 'Saved Teams'], [18, 'More'], [42, 'Matchup row'], [37, 'All suggestions'], [58, 'Log a Game']].filter(([i]) => fs.existsSync(path.join(OUT, `sw-click-390-${i}.png`)));
    const uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, f)).toString('base64');
    const html = `<body style="margin:0;background:#ddd;font:600 15px system-ui;display:grid;grid-template-columns:repeat(4,390px);gap:14px;padding:14px">${shots.map(([i, n]) => `<div><div style="padding:4px 0">${n}</div><img src="${uri(`sw-click-390-${i}.png`)}" width="390"></div>`).join('')}</body>`;
    const f = path.join(OUT, 's2-sheets.html'); fs.writeFileSync(f, html); const pg = await (await b.newContext({viewport: {width: 1644, height: 900}})).newPage(); await pg.goto('file:///' + f.replace(/\\/g, '/')); await pg.screenshot({path: path.join(OUT, 's2-sheets.png'), fullPage: true}); await pg.close(); }
  await b.close();
})();
