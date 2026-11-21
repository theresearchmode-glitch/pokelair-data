// Q83 (Sim, Nov 20, 11:30 AM): the Build sheet's light touch (Q82 A) and its refinements. Checks, light and dark, 320 / 390 / 820 / 1100 / 1440 / 1920:
//  0 light touch: fainter grid tokens, soft frame, solid slanted numbers 01-06, the score on a blue plate with a white number
//  1 before a build (Nov 20: The Plot replaced Sheet 0): the plot sentence holds the Spec (Build from, Megas, Build around) and Hatch it
//    (Build Me a Team) as the one main action; 44 px targets; phone page length (390) kept near today's; pressing it builds
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
/* Nov 20 (Sim locked The Plot, 7:51 PM): the page before a build is the plot sentence (build-plot.js), not the Blueprint's Sheet 0.
   Same promises, checked on the new page: the Spec's three controls in it, one main action, short on phones, nothing sideways. */
const sheet0 = p => p.evaluate(() => { const s = document.querySelector('.pl0'), vis = e => !!(e && e.getClientRects().length), go = [...document.querySelectorAll('[data-bdgo]')].filter(vis);
  const tgt = s ? [...s.querySelectorAll('.pl-pl, .pl-go, .pl-chip')].filter(vis).map(e => Math.round(e.getBoundingClientRect().height)) : [];
  return {has: vis(s), src: !!(s && vis(s.querySelector('[data-v2slide="bdsrc"]'))), meg: !!(s && vis(s.querySelector('[data-v2slide="sgmega"]'))), find: !!(s && vis(s.querySelector('[data-bdfind]'))),
    srcN: s ? s.querySelectorAll('[data-v2slide="bdsrc"] button').length : 0, megN: s ? s.querySelectorAll('[data-v2slide="sgmega"] button').length : 0,
    go: go.length, goIn: !!(go[0] && s && s.contains(go[0])), oldOpts: [...document.querySelectorAll('.bd-opts')].filter(vis).length, minT: tgt.length ? Math.min(...tgt) : 0,
    out: s ? [...s.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > document.documentElement.clientWidth + 1; }).length : -1,
    H: document.documentElement.scrollHeight, side: document.documentElement.scrollWidth > innerWidth}; });
const result = p => p.evaluate(() => { const vis = e => !!(e && e.getClientRects().length), a = document.querySelector('.bd-ans.bp'), six = a && a.querySelector('.bp-six'), use = [...document.querySelectorAll('[data-bduse]')].filter(vis), u = use[0];
  const meas = a && a.querySelector('.bp-meas'), plate = meas ? getComputedStyle(meas, '::before').backgroundColor : '', num = a && a.querySelector('.bp-score>b'), stk = a && a.querySelector('.bp-stk'), st = a && a.querySelector('.bp-stamp');
  const tok = v => { const d = document.createElement('i'); d.style.color = v; (a || document.body).append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const go = [...document.querySelectorAll('[data-bdgo]')].filter(vis), g = go[0], gc = g && getComputedStyle(g);
  /* Nov 20 (The Plot piece 4): the other options are Got a Plan B? columns, each with its six on the red line and a Switch (data-bdshow) */
  const revs = a ? [...a.querySelectorAll('.pl-plan:not(.pl-pwait)')].map(r => [...r.querySelectorAll('.pl-psix img')].filter(vis).map(i => Math.round(i.getBoundingClientRect().height))) : [], sws = a ? a.querySelectorAll('.pl-plans [data-bdshow]').length : 0;
  const no = a ? [...a.querySelectorAll('.bp-six .bp-no')].map(e => getComputedStyle(e)) : [];
  const sl = a && a.querySelector('.pl-seal'), sb = sl && sl.querySelector('b'), sw = sl && sl.querySelector('.w span'), slc = sl && getComputedStyle(sl);
  return {seal: !!sl, slBg: slc ? slc.backgroundColor : '', slNum: sb ? getComputedStyle(sb).color : '', slWord: sw ? getComputedStyle(sw).color : '', onMark: tok('var(--on-plot-seal)'), slW: sl ? Math.round(sl.getBoundingClientRect().width) : 0, slH: sl ? Math.round(sl.getBoundingClientRect().height) : 0, use: use.length, gap: six && u ? Math.round(u.getBoundingClientRect().top - six.getBoundingClientRect().bottom) : null, inNear: !!(u && u.closest('.bp-near')), inRight: !!(u && u.closest('.bp-right')),
    plate, hero: tok('var(--sd-hero)'), num: num ? getComputedStyle(num).color : '', white: tok('var(--sd-on-band)'),
    stkBg: stk ? getComputedStyle(stk).backgroundColor : '', rim: tok('var(--bp-rim)'), stBg: st ? getComputedStyle(st).backgroundColor : '', stFg: st ? getComputedStyle(st).color : '', band: tok('var(--band)'), stRot: stk ? getComputedStyle(stk).rotate : '',
    nos: no.length, noSolid: no.every(c => c.color !== 'rgba(0, 0, 0, 0)' && parseFloat(c.webkitTextStrokeWidth || '0') === 0),
    sws, go: go.length, goCls: g ? g.className : '', goTxt: g ? g.innerText.trim() : '', goBg: gc ? gc.backgroundColor : '', goTf: gc ? gc.transform : '', goIn: !!(g && a && a.contains(g)), revs,
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
  // 1 the plot sentence (was Sheet 0)
  const z = await sheet0(p);
  ok(z.has, `${k}: before a build the page shows the plot sentence`);
  ok(z.src && z.meg && z.find && z.srcN === 2 && z.megN === 3, `${k}: the sentence holds the Spec: Build from (2 plates), Megas (3), Build around (${z.src}, ${z.meg}, ${z.find}, ${z.srcN}, ${z.megN})`);
  ok(z.go === 1 && z.goIn, `${k}: one Hatch it (Build Me a Team), in the sentence (${z.go}, ${z.goIn})`);
  ok(z.oldOpts === 0, `${k}: the old form row is gone (${z.oldOpts})`);
  ok(z.minT >= 44, `${k}: every plate and chip at least 44 px tall (${z.minT})`);
  ok(z.out === 0, `${k}: nothing in the sentence runs past the page edge (${z.out})`);
  /* Nov 20: the limit follows the design Sim approved (Q95 measured the plot page at 2,220 px at 390; the Blueprint's was 1,700) */
  if (W === 390) ok(z.H <= 2220, `390 ${th}: page before a build kept short: ${z.H} px (approved design 2,220)`);
  ok(!z.side, `${k}: no sideways scroll before a build`);
  const rf = await refs(p); if (rf) { ok(rf.bg !== 'rgba(0, 0, 0, 0)' && rf.bw === 0 && /polygon/.test(rf.clip), `${k}: Recent Winners "1st" tags solid and slanted (${rf.bg}, border ${rf.bw})`);
    const want = W >= 700 ? 64 : W >= 380 ? 44 : W >= 340 ? 40 : 36; ok(rf.sp.length === 6 && rf.sp.every(x => x === want), `${k}: Recent Winners sprites ${want} px (${rf.sp.join(',')})`);
    ok(rf.rule === rf.ruleTok, `${k}: an open Recent Winner's frame is the soft rule (${rf.rule})`); } else ok(false, `${k}: Recent Winners reference sheet shown`);
  // build
  await p.click('[data-bdgo]'); await built(p); await p.waitForTimeout(600); const r = await result(p);
  ok(!(await p.$('.pl0')), `${k}: pressing Hatch it builds the team (the plot sentence page gives way to the result)`);
  ok(r.use === 1 && r.inNear && !r.inRight && r.gap != null && r.gap >= 0 && r.gap <= 64, `${k}: one Load Team, right under the six (${r.use}, ${r.gap} px, near ${r.inNear}, in Notes ${r.inRight})`);
  /* Nov 20 (The Plot, Q97 A): the score is an upright seal, not the Blueprint's blue plate and tilted sticker */
  ok(r.seal && r.slNum === r.onMark && ratio(r.slWord, r.slBg) >= 4.5 && ratio(r.slNum, r.slBg) >= 4.5, `${k}: the score in the red seal, number and band word readable (${r.slBg}; word ${r.seal ? ratio(r.slWord, r.slBg).toFixed(2) : '-'}:1)`);
  ok(r.nos === 6 && r.noSolid, `${k}: the six's numbers solid (${r.nos})`);
  ok(r.go === 1 && /\bpl-go\b/.test(r.goCls) && /^Hatch another/i.test(r.goTxt) && r.goBg !== 'rgba(0, 0, 0, 0)', `${k}: one HATCH ANOTHER (rebuild) in the plot's control row, a solid red plate (${r.goCls}, "${r.goTxt}", ${r.goBg})`);
  ok(r.revs.length >= 2 && r.sws === r.revs.length && r.revs.every(x => x.length === 6 && x.every(h => h >= 20 && h <= 56)), `${k}: every Plan B/C/D shows its six (sprites 20-56 px tall) and a Switch (${r.revs.map(x => x.length + '@' + x[0]).join(' ')}; ${r.sws} switches)`);
  ok(!r.side, `${k}: no sideways scroll after a build`);
  // 9 every band on the plate (forced scores), 1440 and 390
  if (W === 1440 || W === 390) for (const [L, key] of Object.entries(BANDS)) {
    const s = {A: 93, B: 84, C: 74, D: 64, F: 48}[L];
    await p.evaluate(([L, s]) => window.__ev(`(()=>{ if (!window.__g0) window.__g0 = CH.gradeOf; const g = window.__g0; CH.gradeOf = (...a) => { const G = g(...a); return G && Object.assign({}, G, {s: ${s}, band: '${L}'}); }; V2.redraw(); })()`), [L, s]); await p.waitForTimeout(300);
    const x = await p.evaluate(() => { const sl = document.querySelector('.bd-ans .pl-seal'), w = sl && sl.querySelector('.w span'), q = sl && sl.getBoundingClientRect(); return sl ? {bg: getComputedStyle(sl).backgroundColor, fg: getComputedStyle(w).color, word: w.textContent.trim(), num: sl.querySelector('b').textContent.trim(), w: Math.round(q.width), h: Math.round(q.height)} : null; });
    ok(x && x.num === String(s) && ratio(x.fg, x.bg) >= 4.5 && x.w === r.slW && x.h === r.slH, `${k}: band ${key}: the seal shows ${s} "${x && x.word}", same size (${x && x.w}x${x && x.h} vs ${r.slW}x${r.slH}), words ${x ? ratio(x.fg, x.bg).toFixed(2) : '-'}:1`); }
  if (W === 1440 || W === 390) await p.evaluate(() => window.__ev('(()=>{ if (window.__g0) CH.gradeOf = window.__g0; V2.redraw(); })()'));
  // 5 build around (light only: one engine run per width)
  if (th === 'light' && (W === 390 || W === 1440)) {
    await p.evaluate(() => window.__ev(`(()=>{ ui.abLock = 'Garchomp'; ui.abSrc = 'all'; ui.ab = null; V2.redraw(); })()`)); await p.waitForTimeout(400);
    const z0 = await p.evaluate(() => { const k = document.querySelector('.pl0 .pl-pick'); return {pick: k ? k.textContent.replace(/\s+/g, ' ').trim() : '', img: !!(k && k.querySelector('img')), x: !!(k && k.querySelector('[data-bdx]')), go: (document.querySelector('.pl0 [data-bdgo]') || {}).textContent || ''}; });
    ok(/Garchomp/.test(z0.pick) && z0.img && z0.x && /Build Around Garchomp/.test(z0.go), `${k}: the plot with a pick: Garchomp fills the "around" plate with its sprite and a clear ×, "Build Around Garchomp" (${JSON.stringify(z0)})`);
    await p.click('[data-bdgo]'); await built(p); await p.waitForTimeout(600);
    const f = await p.evaluate(() => { const f = document.querySelector('.bd-ans .bp-six .bp-fig'), tag = f && f.querySelector('.bp-batag'); return {first: f ? f.dataset.v2mon : '', tag: tag ? tag.textContent.trim() : '', tags: document.querySelectorAll('.bd-ans .bp-batag').length, label: f ? f.getAttribute('aria-label') : '', eng: window.__ev('abTeam("doubles").mons.map(m=>m.n).join("|")'), go: (document.querySelector('.pl1 [data-bdgo] .vh') || {}).textContent || ''}; }); /* Nov 20: the rebuild is HATCH ANOTHER in the control row; its spoken name says the pick */
    ok(f.first === 'Garchomp' && f.tag === 'Built around' && f.tags === 1 && /built around/.test(f.label), `${k}: built around Garchomp: figure 01 with the "Built around" tag (${f.first}, "${f.tag}", ${f.tags})`);
    ok(/^Rebuild Around Garchomp/.test(f.go.trim()), `${k}: Rebuild names the pick ("${f.go.trim()}")`);
    await p.click('[data-bduse]'); await p.waitForTimeout(1000); const sl = await p.evaluate(() => window.__ev('S.slots.map(s=>s.n).join("|")'));
    ok(sl === f.eng, `${k}: Load Team loads the engine's six in the engine's order (display-only reorder)`); }
  ok(!errs.length, `${k}: no page errors (${errs.length}${errs.length ? ': ' + errs[0] : ''})`); await c.close(); }
{ /* Sim, Nov 20 (after Q83): the Cores Parts list numbers are solid like the sheet's 01-06 */
  for (const th of ['light', 'dark']) { const c = await b.newContext({viewport: {width: 1440, height: 900}, colorScheme: th}); const p = await c.newPage(); await p.addInitScript(() => { window.__PL_TEST = 1; });
    await p.goto('file://' + PAGE + '#build', {timeout: 90000}); await p.waitForTimeout(2500);
    await p.evaluate(() => { const t = [...document.querySelectorAll('button,a,[role=tab]')].find(e => e.textContent.trim() === 'Cores'); if (t) t.click(); }); await p.waitForTimeout(1200);
    const n = await p.evaluate(() => [...document.querySelectorAll('.bp-parts .bd-cn')].filter(e => e.getClientRects().length).map(e => { const cs = getComputedStyle(e); return {col: cs.color, stroke: cs.webkitTextStrokeWidth}; }));
    ok(n.length > 0 && n.every(x => x.col !== 'rgba(0, 0, 0, 0)' && parseFloat(x.stroke || '0') === 0), `${th} 1440: Parts list numbers solid, not outlined (${n.length} numbers)`); await c.close(); } }
await b.close(); console.log(fails.length ? `v2-q83: ${fails.length} FAILED` : 'v2-q83: all passed'); process.exit(fails.length ? 1 : 0);
