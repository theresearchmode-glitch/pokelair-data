// Q84 (Sim, Nov 20: option A for all 12 fixes in docs/rebuild/research/scan-rest-nov20.md):
//  S30 Battle: Their Six empty shows six slanted '?' slots (real buttons with labels), 900+ only; each opens the Their Six sheet (also by keyboard).
//  S31 Compare: an empty Team B lists the 3 newest event winners (1 on phones); one tap compares; "Saved, more winners or paste a team ›" opens the picker.
//  S34 Search: a miss keeps "Nothing called ..." and adds "Or meet today's top six" with six normal rows (today's top six); the status still says no matches.
//  S19 Team Checks: the threats line starts "Damage calc: beats or handles" and ends with "Real games: see Matchups ›", which opens Matchups.
//  S6  Events: two tickets per row from 800 to 1099 (one at 768 and 799), no name or sprite running into the date stub.
//  S29 Speed Tiers (1024+): your six on the solid blue band (white numbers, contrast >= 4.5:1), the top 20 at 60 px, no two overlapping.
//  S35 Suggestions loading: a moving slanted bar, "Plotting your best changes…", two ghost rows; reduced motion: the bar stands still.
//  S21 Home, new visitor (sample team): "A sample six · ...", "Its Strength Score", "Sample leads"; a real team still says "Your ...".
//  S5  My Team band: "6 of 6 · Grassy Terrain · Legal ✓" on one line at 390 and 360.
//  S4  Empty My Team: the six "Add" tiles read Spot 1 ... Spot 6 in slot order, one even row at 1440, 3 x 2 on phones, no Lead / Back /
//      Bench words (Nov 20, Sim: no Lead / Back / Bench on My Team; leads are Battle's call. Was: Lead 1, Lead 2, Back 1 ... Bench 2).
//  S7  The "Tap a Card ..." hint is --ink-3 at weight 500 (not link blue).
//  S3  "No Pokémon here.": the way out is the slanted outline button (np-btn2) on its own line, one line tall.
// Every page: light and dark, no sideways scroll (320 and 2560 too), no page errors. Each check fails on the build before (t1rules 38174f07).
//   PAGE=app/dist/v2.html node app/test/v2-q84.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const b = await chromium.launch(); const fails = [], ok = (c, m) => { console.log((c ? '  pass  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const SCAN = ['Garchomp', 'Kingambit', 'Sneasler', 'Basculegion', 'Archaludon', 'Azumarill'], GRASSY = ['Rillaboom', 'Incineroar', 'Kingambit', 'Sneasler', 'Garchomp', 'Archaludon'];
const lum = c => { const m = c.match(/[\d.]+/g).map(Number).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
const ratio = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const open = async (route, W, th, o = {}) => { const c = await b.newContext({viewport: {width: W, height: W < 700 ? 844 : 900}, colorScheme: th, hasTouch: W < 1100, reducedMotion: o.rm ? 'reduce' : 'no-preference'});
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#' + route, {timeout: 90000}); return {c, p, errs}; };
const go = async (p, route, ms = 1500) => { await p.evaluate(r => { location.hash = '#' + r; }, route); await p.waitForTimeout(ms); };
const side = async (p, tag) => { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(sw <= 0, `${tag}: no sideways scroll (${sw > 0 ? sw + 'px' : 0})`); };
const setTeam = (p, t) => p.evaluate(t => window.__ev(`(() => { S.slots = ${JSON.stringify(t)}.map(n => ({n, a: null, lock: false})); fixSlots(); S.loadedId = null; V2.redraw(); return 1; })()`), t);
const sheet = p => p.evaluate(() => window.__ev('!!V2._sheet'));
const closeSheet = p => p.evaluate(() => window.__ev('V2.closeSheet()'));
// S35: poll from the first paint for the planner's wait (it shows for about 2 s on a new visit)
const waitLoader = async p => { for (let i = 0; i < 120; i++) { const r = await p.evaluate(() => { const w = document.querySelector('#main .sg2-wait'); if (!w) return null; const bs = getComputedStyle(w, '::before');
  return {txt: w.textContent.trim(), anim: bs.animationName, bar: bs.content !== 'none' && parseFloat(bs.height) > 0, fam: getComputedStyle(w).fontFamily, ital: getComputedStyle(w).fontStyle, ghosts: (w.parentElement.querySelectorAll('.sg-ghost') || []).length, stale: !!w.parentElement.querySelector('.sg2-stale')}; });
  if (r) return r; await p.waitForTimeout(100); } return null; };

for (const th of ['light', 'dark']) for (const W of [390, 1440]) { const tag = `${W} ${th}`, P = await open('team', W, th), p = P.p;
  // ---- S35 (a new visitor's first My Team: the sample team's suggestions are worked out) ----
  const L = await waitLoader(p);
  ok(L && L.txt === 'Plotting your best changes…' && L.bar && L.anim === 'sgplot' && /Unbounded/i.test(L.fam) && L.ital === 'italic' && (L.stale || L.ghosts === 2),
    `S35 ${tag}: loading = moving slanted bar + "Plotting your best changes…" (Unbounded slanted) + 2 ghost rows (${L ? JSON.stringify(L) : 'no loader seen'})`);
  await p.waitForTimeout(3000);
  // ---- S21 Home with the sample team ----
  await go(p, 'home', 2500);
  const H = await p.evaluate(() => ({k: (document.querySelector('.sds-k') || {}).textContent || '', rt: (document.querySelector('.sds-rt') || {}).textContent || '', leads: [...document.querySelectorAll('#main *')].some(e => !e.children.length && e.textContent.trim() === 'Sample leads'), yours: [...document.querySelectorAll('#main *')].some(e => !e.children.length && e.textContent.trim() === 'Your leads')}));
  ok(/^A sample six · /.test(H.k) && !/\(sample\)/i.test(H.k) && H.rt === 'Its Strength Score' && H.leads && !H.yours, `S21 ${tag}: sample team = "A sample six · …", "Its Strength Score", "Sample leads" ("${H.k}" / "${H.rt}" / leads ${H.leads})`);
  await side(p, `home ${tag}`);
  // ---- S31 Compare (Team A = My Team, Team B empty) ----
  await go(p, 'compare', 2000);
  const C = await p.evaluate(() => { const q = document.querySelector('.cx2-qp'); if (!q) return null; const vis = e => e.getClientRects().length > 0;
    const opts = [...q.querySelectorAll('.cx2-opt')]; return {k: (q.querySelector('.k') || {}).textContent, n: opts.length, vis: opts.filter(vis).length, btn: opts.every(o => o.tagName === 'BUTTON' && o.textContent.trim().length > 4), win: opts.every(o => /^B\|e:/.test(o.dataset.cxset2)), more: !!q.querySelector('button.more[data-cxp="B"]')}; });
  const nv = W < 700 ? 1 : 3;
  ok(C && C.k === 'Take on a latest winner' && C.n === 3 && C.vis === nv && C.btn && C.win && C.more, `S31 ${tag}: Team B offers the 3 latest winners as buttons, ${nv} shown, + the picker link (${JSON.stringify(C)})`);
  await side(p, `compare ${tag}`);
  if (C) { await p.click('.cx2-qp .more'); await p.waitForTimeout(500); const pk = await p.evaluate(() => !!document.querySelector('.np-sheet .cx2-pick')); await closeSheet(p); await p.waitForTimeout(300);
    await p.click('.cx2-qp .cx2-opt >> nth=0'); let drawn = false; for (let i = 0; i < 60 && !drawn; i++) { await p.waitForTimeout(250); drawn = await p.evaluate(() => !!document.querySelector('.cx2-sum, .cxf-half')); }
    const B = await p.evaluate(() => window.__ev('ui.cx.B'));
    ok(pk && /^e:/.test(B || '') && drawn, `S31 ${tag}: the link opens the picker (${pk}); one tap on a winner sets Team B (${B}) and draws the comparison (${drawn})`); }
  else ok(false, `S31 ${tag}: one tap compares (no quick winners)`);
  // ---- S34 Search miss ----
  await go(p, 'home', 1200); await p.evaluate(() => window.__ev('V2.openSearch()')); await p.waitForTimeout(400); await p.fill('[data-v2q]', 'qwxyz'); await p.waitForTimeout(400);
  const Q = await p.evaluate(() => { const out = document.querySelector('[data-v2hits]'), k = out.querySelector('.miss-k'); let top = []; try { top = window.__ev('lairRows().slice(0, 6).map(x => x.p.n)'); } catch (e) {}
    return {fine: (out.querySelector('.fine') || {}).textContent, k: k && k.textContent, kf: k && getComputedStyle(k).fontFamily, ks: k && getComputedStyle(k).fontStyle, rows: [...out.querySelectorAll('.np-hit[data-v2mon]')].map(x => x.dataset.v2mon), top, say: (document.querySelector('[data-v2hitsay]') || {}).textContent}; });
  ok(/^Nothing called “qwxyz”/.test(Q.fine || '') && Q.k === "Or meet today's top six" && /Unbounded/i.test(Q.kf || '') && Q.ks === 'italic' && Q.rows.length === 6 && Q.rows.join() === Q.top.join() && Q.say === 'No matches',
    `S34 ${tag}: miss line + "Or meet today's top six" + the 6 top-rated as search rows, status "No matches" (${Q.rows.join(', ')}; "${Q.say}")`);
  let monOpen = null; if (Q.rows.length === 6) { await p.click('[data-v2hits] .np-hit[data-v2mon] >> nth=0'); await p.waitForTimeout(800); monOpen = await p.evaluate(() => location.hash); }
  ok(Q.rows.length === 6 && monOpen === '#pokemon=' + Q.rows[0].toLowerCase(), `S34 ${tag}: tapping a top-six row opens its page like any search hit (${monOpen})`); await closeSheet(p); await p.waitForTimeout(300);
  // ---- S30 Battle (no opponent entered) ----
  await go(p, 'battle', 1800);
  const T = await p.evaluate(() => { const bs = [...document.querySelectorAll('.bt-q6 button')]; return {n: bs.length, vis: bs.filter(x => x.getClientRects().length).length, lab: bs.every((x, i) => x.matches('[data-btopp6]') && x.getAttribute('aria-label') === `Enter their Pokémon ${i + 1} of 6`), q: bs.length ? bs[0].textContent.trim() : '', col: bs.length && bs[0].querySelector('i') ? getComputedStyle(bs[0].querySelector('i')).color : '', them: (() => { const s = document.createElement('i'); s.style.color = 'var(--them-text)'; document.body.append(s); const c = getComputedStyle(s).color; s.remove(); return c; })()}; });
  if (W >= 900 && T.n !== 6) ok(false, `S30 ${tag}: six slot buttons (found ${T.n})`);
  else if (W >= 900) { ok(T.n === 6 && T.vis === 6 && T.lab && T.q === '?' && T.col === T.them, `S30 ${tag}: six labelled '?' slot buttons in their colour (${JSON.stringify(T)})`);
    await p.click('.bt-q6 button >> nth=2'); await p.waitForTimeout(500); const s1 = await sheet(p); await closeSheet(p); await p.waitForTimeout(300);
    await p.focus('.bt-q6 button >> nth=0'); await p.keyboard.press('Enter'); await p.waitForTimeout(500); const s2 = await sheet(p); await closeSheet(p); await p.waitForTimeout(300);
    ok(s1 && s2, `S30 ${tag}: a slot opens Their Six by tap (${s1}) and by keyboard Enter (${s2})`); }
  else ok(T.n === 6 && T.vis === 0, `S30 ${tag}: phones keep the button alone (slots built ${T.n}, shown ${T.vis})`);
  await side(p, `battle ${tag}`);
  // ---- S3 No Pokémon here ----
  await go(p, 'pokemon=qwxyz', 1500);
  const N = await p.evaluate(() => { const a = document.querySelector('.pk-404'); if (!a) return null; const r = a.getBoundingClientRect(), sp = a.querySelector('span'), lh = sp ? sp.getClientRects().length : 9;
    return {cls: a.className, inP: !!a.closest('p'), h: Math.round(r.height), lines: lh, txt: a.textContent.trim(), href: a.getAttribute('href')}; });
  ok(N && /\bnp-btn2\b/.test(N.cls) && !N.inP && N.lines === 1 && N.h <= 48 && N.txt === 'Every Pokémon, by tier ›' && N.href === '#meta', `S3 ${tag}: the way out is the outline button on its own line, one line (${JSON.stringify(N)})`);
  await side(p, `pokemon 404 ${tag}`);
  // ---- S19 and S7 with the scan's team ----
  await setTeam(p, SCAN); await go(p, 'team', 4000);
  if (W < 700) await p.evaluate(() => window.__ev("V2.tmShow('tm-ck')"));
  await p.waitForTimeout(300);
  const K = await p.evaluate(() => { const sm = [...document.querySelectorAll('#tm-ck small')].find(s => /^Damage calc: beats or handles/.test(s.textContent.trim()) || /^Beats or handles/.test(s.textContent.trim()));
    const bt = sm && sm.querySelector('button[data-tmgomu]'); return sm ? {t: sm.textContent.trim().replace(/\s+/g, ' '), link: bt ? bt.textContent.trim() : null, last: bt ? sm.lastElementChild === bt : false} : null; });
  ok(K && /^Damage calc: beats or handles (only )?\d+ of the top \d+/.test(K.t) && K.link === 'Real games: see Matchups ›' && K.last, `S19 ${tag}: "${K ? K.t : 'no line'}"`);
  if (K && K.link) { await p.click('#tm-ck button[data-tmgomu]'); await p.waitForTimeout(900);
    const M = await p.evaluate(() => { const s = document.getElementById('tm-mu'); return {tab: window.__ev('V2.tmUi.tab'), off: s ? s.classList.contains('tm-off') : true, top: s ? Math.round(s.getBoundingClientRect().top) : null}; });
    ok(M.tab === 'tm-mu' && !M.off && M.top != null && M.top < 400, `S19 ${tag}: the link opens Matchups (${JSON.stringify(M)})`); }
  else ok(false, `S19 ${tag}: the link opens Matchups (no link)`);
  /* Nov 21: My Team frame (Sim approved): the hint is the frame bar's "tap one to see it" (.mtf-party > .mtf-bar span) on the black bar,
     in the mock's sub colour (--mtf-bar-sub) at 600, never link blue (--plot); the Hand's .mt-hint (--ink-3 at 500) is not drawn for a team */
  const Hf = await p.evaluate(() => { const h = document.querySelector('#main .mtf-party > .mtf-bar span'); if (!h) return null; const tok = v => { const s = document.createElement('i'); s.style.color = `var(${v})`; document.body.append(s); const c = getComputedStyle(s).color; s.remove(); return c; }; const cs = getComputedStyle(h); return {t: h.textContent.trim(), c: cs.color, w: cs.fontWeight, sub: tok('--mtf-bar-sub'), plot: tok('--plot')}; });
  const Hn = Hf ? null : await p.evaluate(() => { const h = document.querySelector('.mt-hint'); if (!h) return null; const s = document.createElement('i'); s.style.color = 'var(--ink-3)'; document.body.append(s); const ink3 = getComputedStyle(s).color; s.remove(); const cs = getComputedStyle(h); return {c: cs.color, w: cs.fontWeight, ink3}; });
  if (Hf) ok(Hf.t === 'tap one to see it' && Hf.c === Hf.sub && Hf.c !== Hf.plot && Hf.w === '600', `S7 ${tag}: the frame's hint is --mtf-bar-sub at 600, not link blue (${JSON.stringify(Hf)})`);
  else if (W < 700) ok(Hn && Hn.c === Hn.ink3 && Hn.w === '500', `S7 ${tag}: the hint is --ink-3 at 500 (${JSON.stringify(Hn)})`);
  else ok(!Hn || (Hn.c === Hn.ink3 && Hn.w === '500'), `S7 ${tag}: the hint, where shown, is --ink-3 at 500 (${JSON.stringify(Hn)})`);
  await side(p, `team ${tag}`);
  // ---- S29 Speed Tiers (desktop track, 1024+) ----
  if (W >= 1024) for (const w of [1024, 1440, 1920]) { await p.setViewportSize({width: w, height: 900}); await go(p, 'speed', 2000);
    const Sp = await p.evaluate(() => { const tr = document.querySelector('.sp2-track.mine'); if (!tr) return null; const pr = document.createElement('i'); pr.style.background = 'var(--sd-hero)'; document.body.append(pr); const hero = getComputedStyle(pr).backgroundColor; pr.remove();
      const bef = getComputedStyle(tr, '::before'), f = [...tr.querySelectorAll('.sp2-m:not(.me)')], me = [...tr.querySelectorAll('.sp2-m.me')];
      const imgs = f.map(x => { const i = x.querySelector('img'); return i ? Math.round(i.getBoundingClientRect().width) : 0; }), R = f.map(x => x.getBoundingClientRect());
      let ov = 0; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], c = R[j]; if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) ov++; }
      const v = me[0] && me[0].querySelector('.v'), nm = me[0] && me[0].querySelector('.nm'), mg = tr.querySelector('.sp2-m.me .mg');
      return {band: bef.backgroundColor, hero, skew: bef.transform !== 'none', imgs: [Math.min(...imgs), Math.max(...imgs)], n: f.length, ov, v: v && getComputedStyle(v).color, nm: nm && getComputedStyle(nm).color, mg: mg && getComputedStyle(mg).color, fv: f[0] && getComputedStyle(f[0].querySelector('.v')).fontSize}; });
    const cv = Sp && Sp.v ? ratio(Sp.v, Sp.hero) : 0, cn = Sp && Sp.nm ? ratio(Sp.nm, Sp.hero) : 0;
    ok(Sp && Sp.band === Sp.hero && Sp.skew && Sp.imgs[0] >= 58 && Sp.imgs[1] <= 62 && Sp.ov === 0 && Sp.fv === '20px' && cv >= 4.5 && cn >= 4.5 && (!Sp.mg || ratio(Sp.mg, Sp.hero) >= 4.5) /* Q86 A (Sim, Nov 20): the Mega word too */,
      `S29 ${w} ${th}: your six on the blue band (number ${cv.toFixed(2)}:1, name ${cn.toFixed(2)}:1${Sp && Sp.mg ? `, Mega ${ratio(Sp.mg, Sp.hero).toFixed(2)}:1` : ''}), top ${Sp ? Sp.n : '?'} at ${Sp ? Sp.imgs.join('-') : '?'} px, ${Sp ? Sp.ov : '?'} overlaps`);
    await p.focus('.sp2-m.me >> nth=1'); await p.keyboard.press('Shift+Tab'); const fo = await p.evaluate(() => { const e = document.activeElement; return e && e.matches('.sp2-m.me:focus-visible') ? getComputedStyle(e).outlineColor : null; });
    ok(fo === 'rgb(255, 255, 255)', `S29 ${w} ${th}: keyboard focus on your six shows a white ring on the band (${fo})`);
    await side(p, `speed ${w} ${th}`); }
  if (W >= 1024) await p.setViewportSize({width: W, height: 900});
  // ---- S5 band with a Grassy Terrain team ----
  await setTeam(p, GRASSY); await go(p, 'team', 2500);
  for (const w of W < 700 ? [390, 360] : [W]) { if (w !== W) { await p.setViewportSize({width: w, height: 844}); await p.waitForTimeout(800); }
    /* Nov 21: My Team frame (Sim approved): the band is the frame header's status line (.mtf-k), "My team · 6 of 6 · <weather> team · Legal for
       <reg> ✓" (the approved mock's words); still one line at 390 and 360 */
    const Bd = await p.evaluate(() => { const f = document.querySelector('#main .mtf-head .mtf-k'), e = f || document.querySelector('.mt-band .tm-eb'); if (!e) return null; const lh = parseFloat(getComputedStyle(e).lineHeight) || 20; return {frame: !!f, t: e.textContent.trim(), h: Math.round(e.getBoundingClientRect().height), lh, shown: e.getClientRects().length > 0}; });
    ok(Bd && (Bd.frame ? /^My team · 6 of 6 · Grassy Terrain team · Legal for Reg \S+ ✓$/.test(Bd.t) : Bd.t === '6 of 6 · Grassy Terrain · Legal ✓') && (!Bd.shown || Bd.h <= Bd.lh * 1.5), `S5 ${w} ${th}: band "${Bd && Bd.t}" (${Bd ? (Bd.shown ? Bd.h + 'px tall' : 'not shown') : '-'})`);
    await side(p, `team grassy ${w} ${th}`); }
  if (W < 700) await p.setViewportSize({width: W, height: 844});
  // ---- S4 empty My Team ----
  await p.evaluate(() => window.__ev('(()=>{S.slots=[];fixSlots();S.loadedId=null;V2.redraw()})()')); await p.waitForTimeout(1200);
  /* Nov 20 (Sim: no Lead / Back / Bench on My Team; leads are Battle's call): Spot 1-6 in slot order, laid out as one even row on desktop */
  const E4 = await p.evaluate(() => [...document.querySelectorAll('.tm-e-six .sx-add')].map(a => (a.querySelector('b') || {}).textContent + '/' + (a.querySelector('small') || {}).textContent + '@' + a.dataset.v2addto));
  ok(E4.join() === 'Add/Spot 1@0,Add/Spot 2@1,Add/Spot 3@2,Add/Spot 4@3,Add/Spot 5@4,Add/Spot 6@5', `S4 ${tag}: empty tiles read Spot 1-6 in slot order (${E4.join(', ')})`);
  const G4 = await p.evaluate(() => { const six = document.querySelector('.tm-e-six'), R = [...document.querySelectorAll('.tm-e-six .sx-add')].map(a => a.getBoundingClientRect());
    const tops = [...new Set(R.map(r => Math.round(r.top)))].sort((a, c) => a - c), rows = tops.map(t => R.map((r, i) => [r, i]).filter(([r]) => Math.abs(Math.round(r.top) - t) <= 1));
    const ws = R.map(r => Math.round(r.width)), lr = rows.every(rw => rw.every(([r], k) => !k || r.left > rw[k - 1][0].right - 1)) /* left to right in slot order */;
    return {rows: rows.map(rw => rw.map(([, i]) => i + 1).join('')), w: [Math.min(...ws), Math.max(...ws)], lr, words: six ? (six.innerText.match(/\b(Lead|Back|Bench)\b/g) || []).join(',') : 'no spots'}; });
  const want4 = W < 700 ? '123|456' : '123456';
  ok(G4.rows.join('|') === want4 && G4.w[1] - G4.w[0] <= 1 && G4.lr && !G4.words, `S4 ${tag}: the spots sit ${W < 700 ? 'three across, two rows' : 'in one even row'} in slot order (rows ${G4.rows.join(' | ')}, widths ${G4.w.join('-')} px, Lead / Back / Bench words: ${G4.words || 'none'})`);
  await side(p, `team empty ${tag}`);
  // ---- S6 Events (resize the desktop page through the tablet widths) ----
  if (W >= 1024) { await go(p, 'events', 2000); const below = [];
    for (const w of [768, 799, 800, 870, 1024, 1099]) { await p.setViewportSize({width: w, height: 900}); await p.waitForTimeout(700);
      const Ev = await p.evaluate(() => { const wl = document.querySelector('.tk-wall'); if (!wl) return null; const cols = getComputedStyle(wl).gridTemplateColumns.split(' ').filter(Boolean).length;
        let over = -999; for (const t of wl.querySelectorAll(':scope>.tk')) { const st = t.querySelector('.tk-stub'); if (!st) continue; const sl = st.getBoundingClientRect().left;
          for (const e of t.querySelectorAll('.tk-name, .tk-five .np-mon img, .tk-k')) { const r = e.getBoundingClientRect(); if (r.width) over = Math.max(over, Math.round(r.right - sl)); } }
        return {cols, over, n: wl.querySelectorAll(':scope>.tk').length}; });
      const want = w >= 800 ? 2 : 1, good = !!Ev && Ev.cols === want && Ev.over <= 0, msg = `${w}: ${Ev ? Ev.cols : '?'} per row (want ${want}), stub ${Ev ? Ev.over : '?'} px`;
      /* 768 and 799 keep one per row: reported with 800, so the line can only pass once two per row starts exactly at 800 */
      if (w < 800) { below.push([good, msg]); } else if (w === 800) { ok(good && below.every(x => x[0]), `S6 ${th}: two tickets per row from 800, one below, nothing into the date stub (${[...below.map(x => x[1]), msg].join('; ')})`); }
      else ok(good, `S6 ${w} ${th}: ${msg}`);
      await side(p, `events ${w} ${th}`); }
    await p.setViewportSize({width: W, height: 900}); }
  ok(!P.errs.length, `${tag}: no page errors${P.errs.length ? ': ' + P.errs[0] : ''}`); await P.c.close(); }

// S30 at 900 / 1024 (slots from 900) and 899 (none)
for (const W of [899, 900, 1024]) { const P = await open('battle', W, 'light'); await P.p.waitForTimeout(3500);
  const n = await P.p.evaluate(() => [...document.querySelectorAll('.bt-q6 button')].filter(x => x.getClientRects().length).length), built = await P.p.evaluate(() => document.querySelectorAll('.bt-q6 button').length);
  ok(built === 6 && n === (W >= 900 ? 6 : 0), `S30 ${W}: slots built ${built}, shown ${n} (want ${W >= 900 ? 6 : 0})`); await side(P.p, `battle ${W}`); ok(!P.errs.length, `battle ${W}: no page errors`); await P.c.close(); }
// S35 with reduced motion: the bar is there and stands still
{ const P = await open('team', 1440, 'light', {rm: true}); const L = await waitLoader(P.p);
  ok(L && L.bar && L.anim === 'none' && L.txt === 'Plotting your best changes…', `S35 reduced motion: the bar stands still (${L ? L.anim : 'no loader seen'})`); await P.p.waitForTimeout(2500); ok(!P.errs.length, 'reduced motion: no page errors'); await P.c.close(); }
// S5 at 360 is covered above; nothing sideways at 320 and 2560 on the touched pages, with the scan's team
for (const W of [320, 2560]) { const P = await open('home', W, 'light'); await P.p.waitForTimeout(3000); await setTeam(P.p, SCAN);
  for (const r of ['home', 'team', 'compare', 'battle', 'events', 'speed', 'pokemon=qwxyz']) { await go(P.p, r, 1800); await side(P.p, `S-all ${r} ${W}`); }
  ok(!P.errs.length, `${W}: no page errors${P.errs.length ? ': ' + P.errs[0] : ''}`); await P.c.close(); }
await b.close(); console.log(fails.length ? `v2-q84: ${fails.length} FAILED` : 'v2-q84: all passed'); process.exit(fails.length ? 1 : 0);
