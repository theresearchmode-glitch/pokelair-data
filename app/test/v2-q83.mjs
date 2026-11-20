// Q83 (Sim, Nov 20, 11:30 AM): the Build sheet's light touch (Q82 A) and its refinements. Checks, light and dark, 320 / 390 / 820 / 1100 / 1440 / 1920:
//  0 light touch: fainter grid tokens, soft frame, solid slanted numbers 01-06, the score on a blue plate with a white number
//  1 Sheet 0 before a build: six empty rings with "?", the Spec (Build from, Megas, Build around) and Build Me a Team as the one main button;
//    phone page length (390) kept near today's; pressing it fills the sheet in place
//  2 one Load Team, right under the six at every width
//  3 Revisions rows show each option's six as small sprites
//  5 Build around: the pick is figure 01 with a "Built around" tag (display only; Load Team keeps the engine's six)
//  6 Rebuild: a solid slanted stamp (data-bdgo), not the outline button
//  7 Reference sheets: solid slanted "1st" tags, bigger sprites (64 desktop, 44 phone), soft rules
//  9 the score sticker is filled with its band's colour for every band, its words readable (4.5:1+), on a white rim
// plus no sideways scroll and no page errors.   PAGE=app/dist/v2.html node app/test/v2-q83.mjs   Exit 1 on any failure.
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const BANDS = {A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'};
const built = p => p.waitForFunction(() => window.__ev('!!(ui.ab && !ui.ab.busy && !(ui.ab.doubles && ui.ab.doubles.freshPending))') && document.querySelector('.bd-ans.bp .bp-six'), null, {timeout: 120000}).catch(() => {});
const sheet0 = p => p.evaluate(() => { const s = document.querySelector('.bp0'), vis = e => !!(e && e.getClientRects().length), go = [...document.querySelectorAll('[data-bdgo]')].filter(vis), cs = s && getComputedStyle(s);
  const no = s ? [...s.querySelectorAll('.bp-no')].map(e => { const c = getComputedStyle(e); return {t: e.textContent.trim(), col: c.color, stroke: c.webkitTextStrokeWidth}; }) : [];
  return {has: vis(s), plate: s ? (s.querySelector('.bp-plate') || {}).textContent : '', q: s ? [...s.querySelectorAll('.bp-six0 .bp-q')].filter(vis).map(e => e.textContent.trim()) : [], no,
    src: !!(s && vis(s.querySelector('[data-v2slide="bdsrc"]'))), meg: !!(s && vis(s.querySelector('[data-v2slide="sgmega"]'))), find: !!(s && vis(s.querySelector('[data-bdfind]'))),
    go: go.length, goIn: !!(go[0] && s && s.contains(go[0])), goMain: !!(go[0] && go[0].classList.contains('np-btn')), oldOpts: [...document.querySelectorAll('.bd-opts:not(.bp-spec)')].filter(vis).length,
    grid: cs ? [cs.getPropertyValue('--bp-grid').trim().toLowerCase(), cs.getPropertyValue('--bp-grid5').trim().toLowerCase()] : [], border: cs ? cs.borderTopColor : '',
    rule: (() => { const d = document.createElement('i'); d.style.color = 'var(--rule)'; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; })(),
    H: document.documentElement.scrollHeight, side: document.documentElement.scrollWidth > innerWidth}; });
const result = p => p.evaluate(() => { const vis = e => !!(e && e.getClientRects().length), a = document.querySelector('.bd-ans.bp'), six = a && a.querySelector('.bp-six'), use = [...document.querySelectorAll('[data-bduse]')].filter(vis), u = use[0];
  const meas = a && a.querySelector('.bp-meas'), plate = meas ? getComputedStyle(meas, '::before').backgroundColor : '', num = a && a.querySelector('.bp-score>b'), stk = a && a.querySelector('.bp-stk'), st = a && a.querySelector('.bp-stamp');
  const tok = v => { const d = document.createElement('i'); d.style.color = v; (a || document.body).append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const go = [...document.querySelectorAll('[data-bdgo]')].filter(vis), g = go[0], gc = g && getComputedStyle(g);
  const revs = a ? [...a.querySelectorAll('.bp-rev:not(.bp-revwait)')].map(r => [...r.querySelectorAll('.bp-rsix .np-mon img')].filter(vis).map(i => Math.round(i.getBoundingClientRect().width))) : [];
  const no = a ? [...a.querySelectorAll('.bp-six .bp-no')].map(e => getComputedStyle(e)) : [];
  return {use: use.length, gap: six && u ? Math.round(u.getBoundingClientRect().top - six.getBoundingClientRect().bottom) : null, inNear: !!(u && u.closest('.bp-near')), inRight: !!(u && u.closest('.bp-right')),
    plate, hero: tok('var(--sd-hero)'), num: num ? getComputedStyle(num).color : '', white: tok('var(--sd-on-band)'),
    stkBg: stk ? getComputedStyle(stk).backgroundColor : '', rim: tok('var(--bp-rim)'), stBg: st ? getComputedStyle(st).backgroundColor : '', stFg: st ? getComputedStyle(st).color : '', band: tok('var(--band)'), stRot: stk ? getComputedStyle(stk).rotate : '',
    nos: no.length, noSolid: no.every(c => c.color !== 'rgba(0, 0, 0, 0)' && parseFloat(c.webkitTextStrokeWidth || '0') === 0),
    go: go.length, goCls: g ? g.className : '', goTxt: g ? g.innerText.trim() : '', goBg: gc ? gc.backgroundColor : '', goTf: gc ? gc.transform : '', goIn: !!(g && a && a.contains(g)), revs,
    side: document.documentElement.scrollWidth > innerWidth, H: document.documentElement.scrollHeight}; });
const refs = p => p.evaluate(() => { const vis = e => !!(e && e.getClientRects().length), w = document.querySelector('.bp-ref'); if (!w || !vis(w)) return null; const t = w.querySelector('.bp-wplace'), c = t && getComputedStyle(t), win = w.querySelector('.bd-win');
  return {bg: c ? c.backgroundColor : '', bw: c ? parseFloat(c.borderTopWidth) : -1, clip: c ? c.clipPath : '', sp: [...w.querySelectorAll('.bd-win>summary .bd-wsix>*')].filter(vis).slice(0, 6).map(e => Math.round(e.getBoundingClientRect().width)),
    rule: (() => { if (!win) return ''; win.open = true; const x = getComputedStyle(win).borderLeftColor; win.open = false; return x; })() /* an open sheet's frame (closed rows have no rule; sugs.css drops the top line) */, ruleTok: (() => { const d = document.createElement('i'); d.style.color = 'var(--rule)'; w.append(d); const x = getComputedStyle(d).color; d.remove(); return x; })()}; });
const lum = c => { const m = c.match(/[\d.]+/g).map(Number), f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
const ratio = (x, y) => { const a = lum(x), c = lum(y); return (Math.max(a, c) + .05) / (Math.min(a, c) + .05); };
const GRID = {light: ['#0078bf0d', '#0078bf1a'], dark: ['#62bef70a', '#62bef714']};
for (const th of ['light', 'dark']) for (const W of [320, 390, 820, 1100, 1440, 1920]) { const phone = W < 700;
  const c = await b.newContext({viewport: {width: W, height: 900}, colorScheme: th, ...(phone ? {isMobile: true, hasTouch: true} : {})}); const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + PAGE + '#build', {timeout: 90000}); await p.waitForTimeout(2500); const k = `${W} ${th}`;
  // 1 Sheet 0
  const z = await sheet0(p);
  ok(z.has && /^Sheet 0$/.test((z.plate || '').trim()), `${k}: before a build the page shows Sheet 0 (${JSON.stringify(z.plate)})`);
  ok(z.q.length === 6 && z.q.every(x => x === '?'), `${k}: Sheet 0 has six empty rings with "?" (${z.q.length})`);
  ok(z.no.length === 6 && z.no.map(x => x.t).join() === '01,02,03,04,05,06', `${k}: Sheet 0 rings numbered 01-06`);
  ok(z.src && z.meg && z.find, `${k}: Sheet 0 holds the Spec: Build from, Megas on team, Build around (${z.src}, ${z.meg}, ${z.find})`);
  ok(z.go === 1 && z.goIn && z.goMain, `${k}: one Build Me a Team, in Sheet 0, the main button (${z.go}, ${z.goIn}, ${z.goMain})`);
  ok(z.oldOpts === 0, `${k}: the old form row is gone (${z.oldOpts})`);
  // 0 light touch
  ok(z.grid[0] === GRID[th][0] && z.grid[1] === GRID[th][1], `${k}: grid paper fainter (${z.grid.join(' ')})`);
  ok(z.border && z.border === z.rule, `${k}: the sheet's frame is the soft rule (${z.border} vs ${z.rule})`);
  ok(z.no.length && z.no.every(x => x.col !== 'rgba(0, 0, 0, 0)' && parseFloat(x.stroke || '0') === 0), `${k}: numbers solid, not outlined`);
  if (W === 390) ok(z.H <= 1700, `390 ${th}: page before a build kept short: ${z.H} px (today 1,397; limit 1,700)`);
  ok(!z.side, `${k}: no sideways scroll before a build`);
  const rf = await refs(p); if (rf) { ok(rf.bg !== 'rgba(0, 0, 0, 0)' && rf.bw === 0 && /polygon/.test(rf.clip), `${k}: Recent Winners "1st" tags solid and slanted (${rf.bg}, border ${rf.bw})`);
    const want = W >= 700 ? 64 : W >= 380 ? 44 : W >= 340 ? 40 : 36; ok(rf.sp.length === 6 && rf.sp.every(x => x === want), `${k}: Recent Winners sprites ${want} px (${rf.sp.join(',')})`);
    ok(rf.rule === rf.ruleTok, `${k}: an open Recent Winner's frame is the soft rule (${rf.rule})`); } else ok(false, `${k}: Recent Winners reference sheet shown`);
  // build
  await p.click('[data-bdgo]'); await built(p); await p.waitForTimeout(600); const r = await result(p);
  ok(!(await p.$('.bp0')), `${k}: pressing Build fills the sheet (Sheet 0 gone)`);
  ok(r.use === 1 && r.inNear && !r.inRight && r.gap != null && r.gap >= 0 && r.gap <= 64, `${k}: one Load Team, right under the six (${r.use}, ${r.gap} px, near ${r.inNear}, in Notes ${r.inRight})`);
  ok(r.plate === r.hero && r.num === r.white, `${k}: the score on the blue plate, white number (${r.plate} / ${r.num})`);
  ok(r.nos === 6 && r.noSolid, `${k}: the six's numbers solid (${r.nos})`);
  ok(r.stBg === r.band && r.stkBg === r.rim && r.stRot !== 'none', `${k}: score sticker filled with its band colour on a rim, tilted (${r.stBg} = ${r.band}; rim ${r.stkBg})`);
  ok(ratio(r.stFg, r.stBg) >= 4.5, `${k}: sticker words readable (${ratio(r.stFg, r.stBg).toFixed(2)}:1)`);
  ok(r.go === 1 && r.goIn && /\bbp-rebuild\b/.test(r.goCls) && !/np-btn/.test(r.goCls) && /^Rebuild/.test(r.goTxt) && r.goBg !== 'rgba(0, 0, 0, 0)' && r.goTf !== 'none', `${k}: Rebuild is a solid slanted stamp (${r.goCls}, "${r.goTxt}", ${r.goBg})`);
  ok(r.revs.length >= 2 && r.revs.every(x => x.length === 6 && x.every(w => w >= 32 && w <= 40)), `${k}: every Revision shows its six as 32-40 px sprites (${r.revs.map(x => x.length + '@' + x[0]).join(' ')})`);
  ok(!r.side, `${k}: no sideways scroll after a build`);
  // 9 every band on the plate (forced scores), 1440 and 390
  if (W === 1440 || W === 390) for (const [L, key] of Object.entries(BANDS)) {
    const s = {A: 93, B: 84, C: 74, D: 64, F: 48}[L];
    await p.evaluate(([L, s]) => window.__ev(`(()=>{ if (!window.__g0) window.__g0 = CH.gradeOf; const g = window.__g0; CH.gradeOf = (...a) => { const G = g(...a); return G && Object.assign({}, G, {s: ${s}, band: '${L}'}); }; V2.redraw(); })()`), [L, s]); await p.waitForTimeout(300);
    const x = await p.evaluate(key => { const st = document.querySelector('.bd-ans .bp-stamp'), d = document.createElement('i'); d.style.color = `var(--band-${key})`; st.parentNode.append(d); const want = getComputedStyle(d).color; d.remove(); const c = getComputedStyle(st); return {bg: c.backgroundColor, fg: c.color, want, word: st.textContent.trim()}; }, key);
    ok(x.bg === x.want && ratio(x.fg, x.bg) >= 4.5, `${k}: band ${key} sticker "${x.word}" in its own colour (${x.bg}), words ${ratio(x.fg, x.bg).toFixed(2)}:1`); }
  if (W === 1440 || W === 390) await p.evaluate(() => window.__ev('(()=>{ if (window.__g0) CH.gradeOf = window.__g0; V2.redraw(); })()'));
  // 5 build around (light only: one engine run per width)
  if (th === 'light' && (W === 390 || W === 1440)) {
    await p.evaluate(() => window.__ev(`(()=>{ ui.abLock = 'Garchomp'; ui.abSrc = 'all'; ui.ab = null; V2.redraw(); })()`)); await p.waitForTimeout(400);
    const z0 = await p.evaluate(() => { const f = document.querySelector('.bp0 .bp-fig0'); return {ba: !!(f && f.classList.contains('bp-ba')), mon: !!(f && f.querySelector('.np-mon')), q: document.querySelectorAll('.bp0 .bp-q').length, go: (document.querySelector('.bp0 [data-bdgo]') || {}).innerText || ''}; });
    ok(z0.ba && z0.mon && z0.q === 5 && /Build Around Garchomp/.test(z0.go), `${k}: Sheet 0 with a pick: Garchomp stands in ring 01, five "?" left, "Build Around Garchomp" (${JSON.stringify(z0)})`);
    await p.click('[data-bdgo]'); await built(p); await p.waitForTimeout(600);
    const f = await p.evaluate(() => { const f = document.querySelector('.bd-ans .bp-six .bp-fig'), tag = f && f.querySelector('.bp-batag'); return {first: f ? f.dataset.v2mon : '', tag: tag ? tag.textContent.trim() : '', tags: document.querySelectorAll('.bd-ans .bp-batag').length, label: f ? f.getAttribute('aria-label') : '', eng: window.__ev('abTeam("doubles").mons.map(m=>m.n).join("|")'), go: (document.querySelector('.bd-ans [data-bdgo]') || {}).innerText || ''}; });
    ok(f.first === 'Garchomp' && f.tag === 'Built around' && f.tags === 1 && /built around/.test(f.label), `${k}: built around Garchomp: figure 01 with the "Built around" tag (${f.first}, "${f.tag}", ${f.tags})`);
    ok(/^Rebuild Around Garchomp/.test(f.go.trim()), `${k}: Rebuild names the pick ("${f.go.trim()}")`);
    await p.click('[data-bduse]'); await p.waitForTimeout(1000); const sl = await p.evaluate(() => window.__ev('S.slots.map(s=>s.n).join("|")'));
    ok(sl === f.eng, `${k}: Load Team loads the engine's six in the engine's order (display-only reorder)`); }
  ok(!errs.length, `${k}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
await b.close(); console.log(fails.length ? `v2-q83: ${fails.length} FAILED` : 'v2-q83: all passed'); process.exit(fails.length ? 1 : 0);
