// Damage Calc page check. Nov 21: Plot the hit (Sim approved; calc-options/the-plot/BRIEF.md) replaces "The Arena" (Sim's prompt Nov 19); the
// file keeps its name because CI runs it. At 320, 390, 699, 700, 1024 and 1440, light and dark: every one of today's calc controls is on
// the page and works (sky and ground change the numbers and carry the red "chosen" circle; the five "this turn" switches; the three move
// swipes; All moves; swap; both photos open the Pokemon picker; the set rows change the result; the stage minus / plus; the KO Board bar
// opens the board with your hits and their hits; How the Calc Works, Notes on this hit, and "Report a Mistake" whenever feedback is
// available); the numbers on screen are the calc engine's, in real HP (damage min–max, the defender's HP, the verdict worked out here from
// the engine's 16 rolls, not by the page's own wording); nothing (title, swap, answer, moves) overlaps either photo's picture, also with a
// long name and a Mega; every control is at least 44px tall (and 44 wide under 1024, touch); nothing scrolls sideways; the board's
// length is measured (info, and at most the approved mock's 2.05 screens at 390x844); no page errors. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-arena.mjs   (a --v2 --preview-data build; WIDTHS=390,1440 THEMES=dark for a quick run)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const WIDTHS = (process.env.WIDTHS || '320,390,699,700,1024,1440').split(',').map(Number), THEMES = (process.env.THEMES || 'light,dark').split(',');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const wait = (p, ms = 350) => p.waitForTimeout(ms);
const ev = (p, code) => p.evaluate(c => window.__ev(c), code);
/* Nov 21: Plot the hit (Sim approved): the engine's hit with its 16 rolls; e.pct is kept as the hit's fingerprint ('min–max of hp') for the
   "did it change" checks, now in HP */
const engine = p => ev(p, `(() => { const C = calcData(), r = C.r; return r ? {min: r.min, max: r.max, hp: r.hp, rolls: (r.rolls || []).slice(), pct: r.min + '–' + r.max + ' of ' + r.hp, mv: C.mv.name, a: dc.a, d: dc.d, w: dc.weather, t: dc.terrain} : {mv: C.mv && C.mv.name}; })()`);
/* Nov 21: Plot the hit (Sim approved): the answer as shown (.pc-ans; was the Arena's verdict plate, tag and HP-left plate) */
const shown = p => p.evaluate(() => { const T = s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
  return {dmg: T('.pc-ans .pc-big'), l2: T('.pc-ans .pc-l2'), verdict: T('.pc-ans .pc-vd'), sm: T('.pc-ans .pc-sm')}; });
/* Nov 21: Plot the hit (Sim approved): the answer on screen is the engine's hit: damage 'min–max' HP, '<defender> has <HP> HP', and the
   verdict from the 16 rolls (k at or over the HP: 'Faints a time(s) in b' with k/16 reduced; all 16 'Always faints'; none: a hits verdict,
   'Faints in 2 hits' when the two lowest rolls already knock it out). Returns '' when it matches, else what differs. */
const gcd = (a, b) => b ? gcd(b, a % b) : a;
const mismatch = (s, e) => { if (!e || e.min == null) return 'no engine hit'; const out = [];
  if (s.dmg !== (e.min === e.max ? String(e.min) : `${e.min}–${e.max}`)) out.push(`damage "${s.dmg}" vs engine ${e.min}–${e.max}`);
  if (e.max === 0) { if (s.verdict !== 'No effect') out.push(`verdict "${s.verdict}" for no damage`); return out.join('; '); }
  if (!new RegExp(` has ${e.hp} HP\\.$`).test(s.l2)) out.push(`HP line "${s.l2}" vs engine ${e.hp} HP`);
  if (e.rolls.length !== 16) out.push(`${e.rolls.length} rolls, not 16`);
  const k = e.rolls.filter(v => v >= e.hp).length, g = gcd(k, 16);
  const want = k === 16 ? 'Always faints' : k ? `Faints ${k / g} time${k / g > 1 ? 's' : ''} in ${16 / g}` : null;
  if (want ? s.verdict !== want : !/^(Faints in [23] hits|May faint in 2 hits|Takes \d+\+ hits)/.test(s.verdict) || (2 * e.min >= e.hp && s.verdict !== 'Faints in 2 hits')) out.push(`verdict "${s.verdict}" vs ${k} of 16 rolls knocking out`);
  return out.join('; '); };
const pressed = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.getAttribute('aria-pressed') : null; }, sel);
const click = async (p, sel, ms) => { const h = await p.$(sel); if (!h) return false; await h.click(); await wait(p, ms); return true; };
// pictures vs everything placed on the board: no overlap (1px tolerance); tilted things are checked by their whole bounding box.
// Nov 21: Plot the hit (Sim approved): the pictures are the photos' .pc-pic (was the Arena's .arn-spr); the things are the title row (swap),
// the answer's lines, the moves, the sky and the other photo's picture (the marker rings are drawn round things on purpose, not checked)
const overlaps = p => p.evaluate(() => { const R = e => e.getBoundingClientRect(), vis = e => e && e.getClientRects().length && getComputedStyle(e).display !== 'none';
  const pics = [...document.querySelectorAll('.pc-ph .pc-pic')].filter(vis).map(e => ({n: e.closest('.pc-ph').classList.contains('d') ? 'defender' : 'attacker', r: R(e)}));
  const things = ['.pc-title', '.pc-swap', '.pc-ans .pc-l1', '.pc-ans .pc-big', '.pc-ans .pc-l2', '.pc-ans .pc-vd > span', '.pc-ans .pc-sm', '.pc-mvb', '.pc-sky', '.pc-ph.a .pc-pic', '.pc-ph.d .pc-pic'].map(s => [s, document.querySelector(s)]).filter(([, e]) => vis(e));
  const out = []; for (const pic of pics) for (const [s, e] of things) { if (e.closest('.pc-ph') && e.closest('.pc-ph').classList.contains(pic.n === 'defender' ? 'd' : 'a')) continue; const a = pic.r, c = R(e), w = Math.min(a.right, c.right) - Math.max(a.left, c.left), h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
    if (w > 1 && h > 1) out.push(`${s} on the ${pic.n} (${Math.round(w)}x${Math.round(h)})`); }
  if (pics.length !== 2) out.push(`${pics.length} Pokemon pictures`); return out; });
const sizes = (p, touch) => p.evaluate(touch => { const out = []; for (const e of document.querySelectorAll('.dc2.pc :is(button,select,summary,a[href])')) /* Nov 21: Plot the hit (Sim approved): the page is .dc2.pc (was .arn) */ { if (!e.getClientRects().length) continue;
    const r = e.getBoundingClientRect(), s = getComputedStyle(e); if (s.visibility === 'hidden' || (r.width === 0 && r.height === 0)) continue;
    if (e.matches('select[aria-hidden="true"][tabindex="-1"]') && s.pointerEvents === 'none') continue; if (e.matches('select:disabled')) continue; /* a Mega's fixed stone (disabled: shown, not a control) */ /* Nov 21: Plot the hit (Sim approved): today's hidden select only shows the row's value (on the note, a 28px line under its label); it can't be tapped or reached; the row's own button over the whole row (data-arnset / data-arnpick) is the control, and it is measured here */
    if (e.closest('.arn-kbin')) continue; if (e.closest('.bt-tools')) continue; /* the Battle tools bar is shared navigation, checked with the Battle pages */ /* today's board inside the KO Board (tiles, table): its own checks (v2-q22, v2-minors) */
    if (Math.round(r.height) < 44 || (touch && Math.round(r.width) < 44)) out.push(`${(e.getAttribute('aria-label') || e.textContent || e.id).trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`); }
  return out; }, touch);
const sideways = p => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

for (const W of WIDTHS) for (const th of THEMES) {
  const H = W >= 1024 ? 900 : 844, touch = W < 1024, tag = `${W} ${th}:`;
  const c = await b.newContext({viewport: {width: W, height: H}, colorScheme: th, ...(touch ? {hasTouch: true, isMobile: W < 700} : {})}); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await wait(p, 3500); await p.evaluate(t => { document.documentElement.dataset.theme = t; }, th === 'dark' ? 'night' : 'day'); await wait(p, 300);
  if (!(await p.$('.dc2.pc .pc-board'))) { ok(false, `${tag} Plot the hit is on the page (.pc-board)`); await c.close(); continue; } /* Nov 21: Plot the hit (Sim approved; was .arn-scene) */
  // the default case: the numbers on screen are the engine's (Nov 21: Plot the hit, Sim approved: real HP and the verdict from the 16 rolls; was % and % HP left)
  const E0 = await engine(p), S0 = await shown(p), m0 = mismatch(S0, E0);
  ok(!m0, `${tag} default ${E0.mv} into ${E0.d}: the answer on screen is the engine's (${S0.dmg} of ${E0.hp} HP, "${S0.verdict}")${m0 ? ': ' + m0 : ''}`);
  if (W === 1440 && th === THEMES[0]) console.log(`  info  mock-up sanity (default ${E0.a} ${E0.mv} into ${E0.d}, weather ${E0.w || 'clear'}): ${E0.pct} HP, "${S0.verdict}", "${S0.sm}"`);
  // layout
  let o = await overlaps(p); ok(!o.length, `${tag} nothing on either Pokemon (default)${o.length ? ': ' + o.join('; ') : ''}`);
  let sz = await sizes(p, touch); ok(!sz.length, `${tag} every control at least 44px tall${touch ? ' and wide' : ''}${sz.length ? ': ' + sz.slice(0, 6).join('; ') : ''}`);
  let sw = await sideways(p); ok(sw <= 0, `${tag} no sideways scroll (${sw}px over)`);
  /* Nov 21: Plot the hit (Sim approved): the board is longer than the Arena by design (the brief measured the mock at 2.05 phone screens and
     1.11 desktop screens); the phone limit is the mock's, the desktop length is reported (Sim, Nov 20: phone length is done) */
  if (W === 390) { const h = await p.evaluate(() => document.querySelector('.pc-board').getBoundingClientRect().height); ok(h <= 2.05 * 844, `${tag} board ${Math.round(h)}px = ${(h / 844).toFixed(2)} screens (at most the approved mock's 2.05)`); }
  if (W === 1440) { const bt = await p.evaluate(() => document.querySelector('.pc-board').getBoundingClientRect().bottom + scrollY); console.log(`  info  ${tag} board ends at ${Math.round(bt)}px = ${(bt / 900).toFixed(2)} screens of 1440x900`); }
  // weather: each one in the sky row is chosen and circled (the only red circle in the row); Rain changes the numbers (the engine's)
  // Nov 21: Plot the hit (Sim approved): the sky row .pc-sky (was the Arena's pills and sky class); the circle stands for the sky picture
  const ring = (p, row) => p.evaluate(r => [...document.querySelectorAll(`${r} button`)].filter(b => b.querySelector('.pc-ring')).map(b => b.dataset.dcw ?? b.dataset.dcterr ?? b.dataset.dct), row);
  for (const [v, k] of [['', 'clear'], ['rain', 'rain'], ['sand', 'sand'], ['snow', 'snow'], ['sun', 'sun']]) { await click(p, `.pc-sky [data-dcw="${v}"]`);
    const s = await shown(p), e = await engine(p), rg = await ring(p, '.pc-sky'), mm = mismatch(s, e); ok(rg.length === 1 && rg[0] === v && await pressed(p, `.pc-sky [data-dcw="${v}"]`) === 'true' && e.w === v && !mm, `${tag} weather ${k}: circled (${rg.join(',')}), pressed, the engine's ${e.pct} on screen${mm ? ': ' + mm : ''}`);
    if (k === 'rain') ok(e.pct !== E0.pct, `${tag} Rain changes the damage (${E0.pct} -> ${e.pct})`);
    o = await overlaps(p); if (o.length) ok(false, `${tag} weather ${k}: nothing on either Pokemon: ${o.join('; ')}`); }
  for (const [v, k] of [['grassy', 'grassy'], ['electric', 'electric'], ['psychic', 'psychic'], ['misty', 'misty'], ['', 'none']]) { await click(p, `.pc-gnd [data-dcterr="${v}"]`); /* Nov 21: Plot the hit (Sim approved): the ground row .pc-gnd */
    const s = await shown(p), e = await engine(p), rg = await ring(p, '.pc-gnd'), mm = mismatch(s, e); ok(rg.length === 1 && rg[0] === v && e.t === v && await pressed(p, `.pc-gnd [data-dcterr="${v}"]`) === 'true' && !mm, `${tag} terrain ${k}: circled (${rg.join(',')}), pressed, the engine's ${e.pct} on screen${mm ? ': ' + mm : ''}`); }
  // the five switches
  for (const k of ['spread', 'screen', 'hh', 'fg', 'crit']) { const before = await engine(p), was = await pressed(p, `.pc-sws [data-dct="${k}"]`); await click(p, `.pc-sws [data-dct="${k}"]`); /* Nov 21: Plot the hit (Sim approved): this turn .pc-sws; on = circled */
    const now = await pressed(p, `.pc-sws [data-dct="${k}"]`), e = await engine(p), s = await shown(p), circled = (await ring(p, '.pc-sws')).includes(k), mm = mismatch(s, e);
    ok(now !== was && circled === (now === 'true') && e.pct !== before.pct && !mm, `${tag} switch ${k}: ${was} -> ${now} (circled ${circled}), damage ${before.pct} -> ${e.pct} on screen${mm ? ': ' + mm : ''}`);
    await click(p, `.pc-sws [data-dct="${k}"]`); }
  // moves: each of the three buttons; All moves (today's list) laid over its button
  // Nov 21: Plot the hit (Sim approved): the three move swipes (.pc-mvs; was .arn-mvs); each tap chooses it, circles it, and the answer is the
  // engine's hit and the same HP the swipe showed before the tap; All moves (.pc-all) opens today's move list from its whole button
  const mvs = await p.evaluate(() => [...document.querySelectorAll('.pc-mvs [data-dcmv]')].map(e => [e.dataset.dcmv, (e.querySelector('em') || {}).textContent])); ok(mvs.length === 3, `${tag} three move swipes (${mvs.map(x => x[0]).join(', ')})`);
  for (const [m, was] of [...mvs].reverse()) { const sw = await p.evaluate(m => (document.querySelector(`.pc-mvs [data-dcmv="${m}"] em`) || {}).textContent, m); await click(p, `.pc-mvs [data-dcmv="${m}"]`); const e = await engine(p), s = await shown(p), mm = e.min == null ? '' : mismatch(s, e), circ = await p.evaluate(m => !!document.querySelector(`.pc-mvs [data-dcmv="${m}"] .pc-ring`), m);
    ok(e.mv === m && await pressed(p, `.pc-mvs [data-dcmv="${m}"]`) === 'true' && circ && !mm && (e.min == null || e.max === 0 || s.dmg === sw), `${tag} move ${m}: chosen and circled, ${e.pct || 'no number'} on screen, the swipe showed ${sw}${mm ? ': ' + mm : ''}`); }
  const all = await p.evaluate(() => { const s = document.querySelector('.pc-all #dcMv'), bx = document.querySelector('.pc-all'), bt = bx && bx.querySelector('[data-arnmv]'); if (!s || !bt) return null; const a = bt.getBoundingClientRect(), c = bx.getBoundingClientRect(), cs = getComputedStyle(bx), bw = k => parseFloat(cs['border' + k + 'Width']) || 0;
    /* Nov 21: Plot the hit (Sim approved): All moves has a 3px dashed outline; its button must fill everything inside it (2px tolerance; was 6px around the Arena's 2px border) */
    return {n: s.options.length, cover: Math.abs(a.width - (c.width - bw('Left') - bw('Right'))) < 2 && Math.abs(a.height - (c.height - bw('Top') - bw('Bottom'))) < 2, other: [...s.options].map(o => o.text).find(t => ![...document.querySelectorAll('.pc-mvs [data-dcmv]')].some(b => b.dataset.dcmv === t))}; });
  ok(all && all.n > 3 && all.cover, `${tag} All moves opens today's move list (${all && all.n} moves) from the whole button`);
  if (all && all.other) { await p.selectOption('#dcMv', {label: all.other}); await wait(p); const e = await engine(p); ok(e.mv === all.other, `${tag} All moves: picking ${all.other} puts it in play`); }
  await click(p, `.pc-mvs [data-dcmv="${mvs[0][0]}"]`);
  // photos: each photo is the picker button over the whole photo (Q46 A), with today's Pokemon list behind it; a new defender changes the numbers
  // Nov 21: Plot the hit (Sim approved): the photos .pc-ph (were the Arena's name plates); tapping opens "Choose the attacker / defender"
  const pl = await p.evaluate(() => ['dcA', 'dcD'].map(id => { const s = document.getElementById(id), ph = s && s.closest('.pc-ph'), bt = ph && ph.querySelector(`[data-arnpick="${id}"]`); if (!bt) return null; const a = bt.getBoundingClientRect(), c = ph.getBoundingClientRect(); return s.options.length > 250 && Math.abs(a.width - c.width) < 2 && Math.abs(a.height - c.height) < 2; }));
  ok(pl[0] && pl[1], `${tag} both photos are the Pokemon picker's button (attacker ${pl[0]}, defender ${pl[1]})`);
  for (const [id, who] of [['dcA', 'attacker'], ['dcD', 'defender']]) { await p.evaluate(id => document.querySelector(`[data-arnpick="${id}"]`).click(), id); await wait(p, 500); /* a DOM click: Playwright's click can hang waiting on the sheet's history entry (seen at 320 dark); v2-q46 taps the photos for real */ const d = await p.evaluate(() => { const s = [...document.querySelectorAll('[role=dialog]')].find(e => !e.hidden && e.getClientRects().length); return s ? ((s.getAttribute('aria-label') || '') + ' ' + s.innerText).replace(/\s+/g, ' ').slice(0, 80) : ''; });
    ok(new RegExp('Choose the ' + who, 'i').test(d), `${tag} the ${who}'s photo opens "Choose the ${who}" ("${d.slice(0, 40)}")`); await p.keyboard.press('Escape'); await wait(p, 400); }
  { const d0 = await engine(p); await p.selectOption('#dcD', 'Incineroar'); await wait(p, 500); const e = await engine(p), nm = await p.evaluate(() => document.querySelector('[data-arnname="d"]').textContent), mm = mismatch(await shown(p), e);
    ok(e.d === 'Incineroar' && /Incineroar/.test(nm) && e.pct !== d0.pct && !mm, `${tag} defender photo: Incineroar in, photo and numbers follow (${d0.pct} -> ${e.pct})${mm ? ': ' + mm : ''}`); /* Nov 21: Plot the hit (Sim approved) */
    await p.selectOption('#dcD', d0.d); await wait(p, 500); }
  // swap
  { const e0 = await engine(p); await click(p, '#dcSwap', 500); const e1 = await engine(p), nm = await p.evaluate(() => [document.querySelector('[data-arnname="a"]').textContent, document.querySelector('[data-arnname="d"]').textContent]);
    ok(e1.a === e0.d && e1.d === e0.a && nm[1].replace(/\s+/g, ' ').includes(V2disp(e0.a)) && nm[0].replace(/\s+/g, ' ').includes(V2disp(e0.d)), `${tag} swap: ${e0.a} / ${e0.d} -> ${e1.a} / ${e1.d}, photos follow`); /* Nov 21: Plot the hit (Sim approved): both photos' names checked (was the defender plate only) */
    await click(p, '#dcSwap', 500); }
  // the set cards (today's ids)
  { const set = async (id, val) => { await p.evaluate(id => document.querySelectorAll('details').forEach(d => { if (d.contains(document.getElementById(id))) d.open = true; }), id); await wait(p, 150); await p.selectOption('#' + id, val); await wait(p); };
    const e0 = await engine(p); await set('dcASp', '0'); let e = await engine(p); ok(e.pct !== e0.pct, `${tag} attacker points 32 -> 0 changes the damage (${e0.pct} -> ${e.pct})`); await set('dcASp', '32');
    await set('dcANat', 'Hardy'); e = await engine(p); ok(e.pct !== e0.pct, `${tag} attacker nature changes the damage (${e.pct})`);
    const it = await p.evaluate(() => { const s = document.getElementById('dcAIt'); return s ? [s.disabled, s.options[s.selectedIndex].text] : null; }); ok(it && /Charizardite Y/.test(it[1]), `${tag} attacker item row shows the Mega's stone (${it && it[1]}, fixed ${it && it[0]})`);
    ok(await p.$('#dcAAb') && await p.$('#dcDAb') && await p.$('#dcDIt') && await p.$('#dcDNat'), `${tag} Ability, item and nature rows on both cards`);
    await p.evaluate(() => { const d = document.querySelector('.arn-pts'); if (d) d.open = false; }); await wait(p, 200);
    const sm = await p.$('.arn-pts > summary'); if (sm) { await sm.click(); await wait(p); }
    const pts = await p.evaluate(() => ['dcDHp', 'dcDDf', 'dcDSd'].map(id => { const e = document.getElementById(id); return !!(e && e.getClientRects().length); }));
    ok(pts.every(Boolean), `${tag} the defender's points button opens HP, Def and Sp. Def (${pts.join('/')})`);
    const e1 = await engine(p); await p.selectOption('#dcDHp', '32'); await wait(p); e = await engine(p); ok(e.pct !== e1.pct, `${tag} defender HP points change the damage (${e1.pct} -> ${e.pct})`);
    const lab = await p.evaluate(() => [...document.querySelectorAll('.arn-st .lb')].map(e => e.textContent.trim())); ok(lab.length === 2 && /^(Sp\. Atk|Atk|Def) stage$/.test(lab[0]) && /^(Def|Sp\. Def) stage$/.test(lab[1]), `${tag} stage rows name their stat (${lab.join(' | ')})`);
    const s0 = await engine(p); await click(p, '[data-arnst="a"][data-d="1"]'); let o1 = await p.evaluate(() => document.getElementById('dcABo').textContent); e = await engine(p);
    ok(o1 === '+1' && e.pct !== s0.pct, `${tag} attacker stage plus: ${o1}, damage ${s0.pct} -> ${e.pct}`);
    await click(p, '[data-arnst="a"][data-d="-1"]'); await click(p, '[data-arnst="a"][data-d="-1"]'); o1 = await p.evaluate(() => document.getElementById('dcABo').textContent); ok(o1 === '−1', `${tag} attacker stage minus twice: ${o1}`);
    await click(p, '[data-arnst="a"][data-d="1"]'); const s1 = await engine(p); await click(p, '[data-arnst="d"][data-d="1"]'); e = await engine(p);
    ok(await p.evaluate(() => document.getElementById('dcDBo').textContent) === '+1' && e.pct !== s1.pct, `${tag} defender stage plus changes the damage (${s1.pct} -> ${e.pct})`); await click(p, '[data-arnst="d"][data-d="-1"]'); }
  // the KO Board bar opens today's board: your hits, their hits, every hit's table
  { const bar = await p.evaluate(() => { const s = document.querySelector('.arn-kb > summary'); return s ? s.textContent.replace(/\s+/g, ' ').trim() : ''; });
    ok(/KO Board/.test(bar) && /\d+ down in one hit · \d+ can go down · \d+ survive/.test(bar), `${tag} KO Board bar: "${bar.slice(0, 90)}"`);
    if (!(await p.evaluate(() => document.querySelector('.arn-kb').open))) await click(p, '.arn-kb > summary', 600);
    /* Q57 A / Q58 C (Sim, Nov 19): under 1024 the groups are tabs (one group's tiles on show, the others one tap away); from 1024 the board
       spans the page under the Arena (.arn-kbfull) as rows. So the hits are counted over the whole board, on show or behind a tab */
    const KB = ':is(.arn-kb,.arn-kbfull)', hits = () => p.evaluate(() => { const L = [...document.querySelectorAll('.arn-kb .dc2-kt, .arn-kbfull .kob-r')]; return {all: L.length, shown: L.filter(e => e.getClientRects().length).length}; });
    const t1 = await hits(); ok(t1.all === 30 && t1.shown >= 1 && await pressed(p, `${KB} [data-dcdir="mine"]`) === 'true', `${tag} the board opens with your hits (${t1.all} hits, ${t1.shown} on show)`);
    await click(p, `${KB} [data-dcdir="theirs"]`, 900); const t2 = {...await hits(), ...await p.evaluate(() => ({open: document.querySelector('.arn-kb').open, h: /Each top threat's best hit on your team/.test([...document.querySelectorAll('.arn-kb, .arn-kbfull')].map(e => e.textContent).join(' '))}))};
    ok(t2.open && t2.all === 30 && t2.shown >= 1 && t2.h && await pressed(p, `${KB} [data-dcdir="theirs"]`) === 'true', `${tag} "Their hits on you": ${t2.all} hits (${t2.shown} on show), their every-hit table, board stays open`);
    await click(p, `${KB} [data-dcdir="mine"]`, 900); await click(p, '.arn-kb > summary', 400); }
  // links
  { const L = await p.evaluate(() => ({how: !!document.querySelector('.arn-links a[href="#method"]') && /How the Calc Works/.test(document.querySelector('.arn-links a[href="#method"]').textContent), notes: !!document.querySelector('.arn-links .arn-notes > summary'),
      rep: !!document.querySelector('.arn-links [data-fbmistake="calc"]'), fb: !!(window.V2 && V2.FB && V2.FB.ok), survive: /Fewest points to always survive/.test(document.querySelector('.arn-notes').textContent)}));
    ok(L.how && L.notes && L.rep === L.fb && L.survive, `${tag} How the Calc Works, Notes on this hit (with Fewest points to always survive), "Report a Mistake" ${L.fb ? 'shown' : 'hidden while feedback is off, as today'}`); }
  // worst case: a long defender name, the Mega attacker; still nothing on either Pokemon
  { const long = await p.evaluate(() => [...document.getElementById('dcD').options].map(o => o.value).sort((a, b) => b.length - a.length)[0]); await p.selectOption('#dcD', long); await wait(p, 600);
    o = await overlaps(p); sw = await sideways(p); sz = await sizes(p, touch); ok(!o.length && sw <= 0 && !sz.length, `${tag} long name (${long}): nothing on either Pokemon, no sideways scroll, controls 44px${o.length ? ': ' + o.join('; ') : ''}${sw > 0 ? ' sideways ' + sw : ''}${sz.length ? ' small: ' + sz.slice(0, 3).join('; ') : ''}`); }
  ok(!errs.length, `${tag} no page errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
  await c.close(); }
await b.close();
console.log(fails.length ? `\n${fails.length} failure(s)` : '\nall Damage Calc (Plot the hit) checks pass'); process.exit(fails.length ? 1 : 0);
function V2disp(n) { return n.replace(/^(.*)-Mega(?:-(\w+))?$/, (x, b, y) => 'Mega ' + b + (y ? ' ' + y : '')).replace(/^Mega /, ''); }
