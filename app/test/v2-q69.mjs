// Sim's Q69-Q71 (Nov 20, 8:17 AM: the recommended option of each, docs/rebuild/research/audit-nov20-options.md A1, A2, B).
// A1 (Q69): My Team's sample note at 700-819 wide: "Build Me a Team ›" and "Import a Team ›" stack, and their 44px tap areas
//   overlapped (36 of 60 taps on Build opened Import). At 700, 768 and 819 (and 820 / 1024 as controls) a grid of points inside each
//   link's own box must hit that link (document.elementFromPoint), so a tap on Build can never open Import, nor the other way round.
// A2 (Q70): News and Home headline links (.dp-hl) on touch screens 1000+ wide get an invisible 44px tap area. At 1024, 1099, 1180
//   and 1366 with touch (pointer: coarse): every visible headline's hit height at its centre is 44px+ (walked with elementFromPoint),
//   every point on its own visible text hits it (no neighbour steals it), and nothing moves: the page height and every headline's
//   place are the same with the headlines put back in place as they were before (inline links, no tap layer).
// B (Q71): My Team at 700-1099: Suggestions full width under Matchups, then Team Checks | Your Games side by side; Adjust Suggestions
//   is a fold (closed) as on phones and desktop, and still opens (its settings show; the layout stays the same when open). At 768 and
//   1024: Suggestions as wide as Matchups, Team Checks and Your Games share a top and sit left | right below Suggestions, the empty
//   strip beside the shorter of them under 100px. Control: 1440 keeps "mu mu" "sg ck" "sg yg".
// Everywhere: light and dark, nothing sideways (scrollWidth <= width), no page errors.
// Could fail: on the build before Q69-Q71 (7f9e3221) A1 fails at 700/768/819 (Import's layer covers Build), A2 fails at every touch
// width (headlines 20-30px), B fails (Suggestions half width beside Team Checks; Adjust Suggestions open, not a fold).
//   PAGE=app/dist/v2.html node app/test/v2-q69.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const open = async (route, W, th, touch, H = 900) => { const c = await b.newContext({viewport: {width: W, height: H}, colorScheme: th, hasTouch: touch}), p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#' + route, {timeout: 90000}); await p.waitForTimeout(3000);
  if (route === 'team') { await p.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await p.waitForTimeout(800); }
  return [p, errs, c]; };
const side = p => p.evaluate(() => document.documentElement.scrollWidth > innerWidth);

// ---------- A1: the sample note's two links ----------
const taps = p => p.evaluate(() => { const L = [...document.querySelectorAll('#main .tm-sample-acts .np-link')].filter(x => x.getClientRects().length);
  if (L.length < 2) return null; L[0].scrollIntoView({block: 'center'});
  return L.map(a => { const q = a.getBoundingClientRect(); let bad = 0, n = 0;
    for (let x = q.left + 2; x < q.right - 1; x += 6) for (const y of [q.top + 2, q.top + q.height / 2, q.bottom - 2]) { n++; const k = document.elementFromPoint(x, y); if (!(k && (k === a || a.contains(k)))) bad++; }
    return {t: a.textContent.trim(), bad, n, top: Math.round(q.top)}; }); });
for (const [W, th] of [[700, 'light'], [768, 'light'], [768, 'dark'], [819, 'light'], [820, 'light'], [1024, 'light']]) {
  const [p, errs, c] = await open('team', W, th, true), tag = `A1 ${W} ${th}`, R = await taps(p);
  ok(R && R.length === 2, `${tag}: the sample note shows Build Me a Team and Import a Team (${R ? R.map(x => x.t).join(' | ') : 'none'})`);
  if (R) for (const x of R) ok(x.bad === 0, `${tag}: ${x.bad}/${x.n} points inside "${x.t}" hit something else (stacked: ${R[0].top !== R[1].top}, pitch ${R[1].top - R[0].top}px)`);
  ok(!(await side(p)), `${tag}: nothing sideways`); ok(!errs.length, `${tag}: no page errors${errs.length ? ': ' + errs[0] : ''}`); await c.close(); }

// ---------- A2: headline links on touch screens 1000+ ----------
const heads = p => p.evaluate(() => { const L = [...document.querySelectorAll('#main .dp-hl')].filter(e => e.getClientRects().length); const out = [];
  for (const e of L) { e.scrollIntoView({block: 'center'}); const q = e.getBoundingClientRect(), cx = q.left + Math.min(q.width, 200) / 2, cy = q.top + q.height / 2;
    const on = (x, y) => { const k = document.elementFromPoint(x, y); return !!k && (k === e || e.contains(k)); };
    let u = 0; while (u < 60 && on(cx, cy - u - 1)) u++; let d = 0; while (d < 60 && on(cx, cy + d + 1)) d++;
    let bad = 0, n = 0; const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); /* the visible words only: not the spoken-only "(opens the full story...)" */
    for (let tn; (tn = tw.nextNode());) { if (tn.parentElement.closest('.vh')) continue; const r = document.createRange(); r.selectNodeContents(tn);
      for (const t of r.getClientRects()) { if (t.width < 4) continue; for (let x = t.left + 2; x < t.right - 2; x += 15) { n++; if (!on(x, t.top + t.height / 2)) bad++; } } }
    out.push({t: e.textContent.trim().slice(0, 40), h: on(cx, cy) ? u + d + 1 : 0, bad, n}); }
  return out; });
/* where each headline's words are (the first and last visible line of its text, x and y), and the page height */
const places = p => p.evaluate(() => ({H: document.documentElement.scrollHeight, y: [...document.querySelectorAll('#main .dp-hl')].filter(e => e.getClientRects().length).map(e => {
  const r = document.createRange(); r.selectNodeContents(e.firstChild); const R = [...r.getClientRects()].filter(t => t.width > 0), f = R[0], l = R[R.length - 1];
  return f ? [f.left, f.top + scrollY, l.right, l.bottom + scrollY].map(Math.round).join(':') : 'none'; })}));
for (const route of ['news', 'home']) for (const W of [1024, 1099, 1180, 1366]) for (const th of ['light', 'dark']) {
  const tag = `A2 ${route} ${W} ${th}`, [p, errs, c] = await open(route, W, th, true), coarse = await p.evaluate(() => matchMedia('(pointer: coarse)').matches);
  ok(coarse, `${tag}: a touch screen (pointer: coarse)`);
  const P = await places(p), R = await heads(p), low = R.filter(x => x.h < 44), stolen = R.filter(x => x.bad);
  ok(R.length > 0 && !low.length, `${tag}: all ${R.length} headlines 44px+ to tap (lowest ${R.length ? Math.min(...R.map(x => x.h)) : '-'}px${low.length ? `; ${low.length} under 44, first "${low[0].t}" ${low[0].h}px` : ''})`);
  ok(!stolen.length, `${tag}: every point on a headline's own text hits that headline${stolen.length ? ` (${stolen.length} not; first "${stolen[0].t}" ${stolen[0].bad}/${stolen[0].n})` : ''}`);
  /* nothing moves: the same page with the headlines put back as before Q70 (inline, no tap layer; test-only style) has the same height and places */
  await p.evaluate(() => { const s = document.createElement('style'); s.className = 'q69-off'; s.textContent = '.dp-hl{display:inline;position:static}.dp-hl::before{content:none}'; document.head.appendChild(s); }); await p.waitForTimeout(300);
  const M = await places(p);
  ok(M.H === P.H && M.y.join() === P.y.join(), `${tag}: nothing moves: page ${P.H}px with the tap layers, ${M.H}px without; ${P.y.length} headlines in the same places (${M.y.join() === P.y.join()})`);
  ok(!(await side(p)), `${tag}: nothing sideways`); ok(!errs.length, `${tag}: no page errors${errs.length ? ': ' + errs[0] : ''}`); await c.close(); }

// ---------- B: My Team at 700-1099 ----------
const lay = p => p.evaluate(() => { const r = id => { const e = document.getElementById(id); if (!e || !e.getClientRects().length) return null; const q = e.getBoundingClientRect(); return {l: q.left, r: q.right, t: q.top + scrollY, b: q.bottom + scrollY, w: q.width, h: q.height}; };
  const w = document.querySelector('#main .tm-work'), f = document.querySelector('#main details[data-v2adj]');
  return {areas: w ? getComputedStyle(w).gridTemplateAreas : '', mu: r('tm-mu'), sg: r('tm-sg'), ck: r('tm-ck'), yg: r('tm-yg'), fold: !!f, open: !!(f && f.open),
    ctl: !!(f && f.open && f.querySelector('.sg2-ctl') && f.querySelector('.sg2-ctl').getClientRects().length), loose: !!document.querySelector('#main .tm-sgs > .sg2-adj')}; });
const shape = (x, tag) => { const {mu, sg, ck, yg} = x; if (!(mu && sg && ck && yg)) { ok(false, `${tag}: Matchups, Suggestions, Team Checks and Your Games all shown`); return; }
  ok(Math.abs(sg.w - mu.w) <= 1 && Math.abs(sg.l - mu.l) <= 1 && sg.t > mu.t, `${tag}: Suggestions full width under Matchups (${Math.round(sg.w)} vs ${Math.round(mu.w)}px)`);
  ok(Math.abs(ck.t - yg.t) <= 1 && ck.r <= yg.l && ck.t >= sg.b, `${tag}: Team Checks | Your Games side by side under Suggestions (tops ${Math.round(ck.t)} / ${Math.round(yg.t)}, ${Math.round(ck.l)}-${Math.round(ck.r)} | ${Math.round(yg.l)}-${Math.round(yg.r)})`);
  const strip = Math.abs(ck.h - yg.h); ok(strip < 100, `${tag}: empty strip beside the shorter one ${Math.round(strip)}px (< 100)`); };
for (const W of [768, 1024]) for (const th of ['light', 'dark']) {
  const tag = `B ${W} ${th}`, [p, errs, c] = await open('team', W, th, true); let x = await lay(p);
  shape(x, tag);
  ok(x.fold && !x.open && !x.loose, `${tag}: Adjust Suggestions is a closed fold (fold ${x.fold}, open ${x.open}, loose settings ${x.loose})`);
  await p.evaluate(() => { const s = document.querySelector('#main details[data-v2adj] > summary'); if (s) s.click(); }); await p.waitForTimeout(700); x = await lay(p);
  ok(x.open && x.ctl, `${tag}: Adjust Suggestions opens and shows its settings (open ${x.open}, settings ${x.ctl})`);
  shape(x, `${tag} (Adjust open)`);
  ok(!(await side(p)), `${tag}: nothing sideways`); ok(!errs.length, `${tag}: no page errors${errs.length ? ': ' + errs[0] : ''}`); await c.close(); }
{ const [p, errs, c] = await open('team', 1440, 'light', false), x = await lay(p);
  ok(x.areas === '"mu mu" "sg ck" "sg yg"', `B 1440 light: desktop unchanged ("mu mu" "sg ck" "sg yg": ${x.areas})`); ok(!errs.length, 'B 1440 light: no page errors'); await c.close(); }
await b.close(); console.log(`v2-q69: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
