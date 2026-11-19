// Damage Calc "The Arena" (Sim's prompt Nov 19; mock-ups docs/redesign/arena/). At 320, 390, 699, 700, 1024 and 1440, light and dark:
// every one of today's calc controls is on the page and works (weather and terrain rows change the sky / ground and the numbers; the five
// switches; the three move buttons; All moves; swap; both name plates open the Pokemon picker; the set rows change the result; the stage
// minus / plus; the KO Board bar opens the board with your hits and their hits; How the Calc Works, Notes on this hit, and "Report a
// Mistake" whenever feedback is available); the numbers on screen are the calc engine's for the default case; nothing (plates,
// verdict, tag, swap, the two rows) overlaps either Pokemon's picture box, also with a long name and a Mega; every control is at least
// 44px tall (and 44 wide under 1024, touch); nothing scrolls sideways; the calculator is at most 1.6 screens long at 390x844 and fits
// one 1440x900 screen; no page errors. Exit 1 on any failure.
//   PAGE=app/dist/v2.html node app/test/v2-arena.mjs   (a --v2 --preview-data build; WIDTHS=390,1440 THEMES=dark for a quick run)
import {chromium} from 'playwright'; import path from 'node:path';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const WIDTHS = (process.env.WIDTHS || '320,390,699,700,1024,1440').split(',').map(Number), THEMES = (process.env.THEMES || 'light,dark').split(',');
const b = await chromium.launch(); const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
const wait = (p, ms = 350) => p.waitForTimeout(ms);
const ev = (p, code) => p.evaluate(c => window.__ev(c), code);
const engine = p => ev(p, `(() => { const C = calcData(), r = C.r; return r ? {min: r.min, max: r.max, hp: r.hp, ko: koText(r), pct: V2.dcPct(r), mv: C.mv.name, a: dc.a, d: dc.d, w: dc.weather, t: dc.terrain} : {mv: C.mv && C.mv.name}; })()`);
const shown = p => p.evaluate(() => { const T = s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
  return {verdict: T('.arn-verdict'), tag: T('.arn-tag'), hp: T('.arn-hpt'), sky: (document.querySelector('.arn-scene') || {}).className || ''}; });
const pressed = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.getAttribute('aria-pressed') : null; }, sel);
const click = async (p, sel, ms) => { const h = await p.$(sel); if (!h) return false; await h.click(); await wait(p, ms); return true; };
// pictures vs everything placed on the scene: no overlap (1px tolerance); a tilted tag is checked by its whole bounding box
const overlaps = p => p.evaluate(() => { const R = e => e.getBoundingClientRect(), vis = e => e && e.getClientRects().length && getComputedStyle(e).display !== 'none';
  const pics = [...document.querySelectorAll('.arn-spr img')].filter(vis).map(e => ({n: e.closest('.arn-spr').classList.contains('d') ? 'defender' : 'attacker', r: R(e)}));
  const things = ['.arn-plate.arn-dp', '.arn-plate.arn-ap', '.arn-verdict', '.arn-tag', '.arn-swap', '.arn-pills.arn-wxr', '.arn-pills.arn-trr'].map(s => [s, document.querySelector(s)]).filter(([, e]) => vis(e));
  const out = []; for (const pic of pics) for (const [s, e] of things) { const a = pic.r, c = R(e), w = Math.min(a.right, c.right) - Math.max(a.left, c.left), h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
    if (w > 1 && h > 1) out.push(`${s} on the ${pic.n} (${Math.round(w)}x${Math.round(h)})`); }
  if (pics.length !== 2) out.push(`${pics.length} Pokemon pictures`); return out; });
const sizes = (p, touch) => p.evaluate(touch => { const out = []; for (const e of document.querySelectorAll('.arn :is(button,select,summary,a[href])')) { if (!e.getClientRects().length) continue;
    const r = e.getBoundingClientRect(), s = getComputedStyle(e); if (s.visibility === 'hidden' || (r.width === 0 && r.height === 0)) continue;
    if (e.closest('.arn-kbin')) continue; if (e.closest('.bt-tools')) continue; /* the Battle tools bar is shared navigation, checked with the Battle pages */ /* today's board inside the KO Board (tiles, table): its own checks (v2-q22, v2-minors) */
    if (Math.round(r.height) < 44 || (touch && Math.round(r.width) < 44)) out.push(`${(e.getAttribute('aria-label') || e.textContent || e.id).trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`); }
  return out; }, touch);
const sideways = p => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

for (const W of WIDTHS) for (const th of THEMES) {
  const H = W >= 1024 ? 900 : 844, touch = W < 1024, tag = `${W} ${th}:`;
  const c = await b.newContext({viewport: {width: W, height: H}, colorScheme: th, ...(touch ? {hasTouch: true, isMobile: W < 700} : {})}); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(t => { window.__PL_TEST = 1; try { localStorage.setItem('np.theme', t); } catch (e) {} }, th === 'dark' ? 'night' : 'day');
  await p.goto('file://' + PAGE + '#calc', {timeout: 90000}); await wait(p, 3500); await p.evaluate(t => { document.documentElement.dataset.theme = t; }, th === 'dark' ? 'night' : 'day'); await wait(p, 300);
  if (!(await p.$('.dc2.arn .arn-scene'))) { ok(false, `${tag} the Arena is on the page (.arn-scene)`); await c.close(); continue; }
  // the default case: the numbers on screen are the engine's
  const E0 = await engine(p), S0 = await shown(p), lo = 100 - +E0.pct.split('–')[1].replace('%', ''), hi = 100 - +E0.pct.split('–')[0];
  ok(S0.verdict.includes(E0.pct) || (W >= 1024 && S0.tag.includes(E0.pct)), `${tag} default ${E0.mv} into ${E0.d}: the damage on screen is the engine's ${E0.pct} (verdict "${S0.verdict.slice(0, 60)}", tag "${S0.tag}")`);
  ok(S0.hp === `${Math.max(0, lo)}–${Math.max(0, hi)}% HP left` || S0.hp === `${Math.max(0, lo)}% HP left`, `${tag} defender plate "${S0.hp}" = 100 minus the engine's range`);
  ok(S0.verdict.includes(V2words(E0.ko)), `${tag} the KO words are the engine's "${E0.ko}" in plain words`);
  if (W === 1440 && th === THEMES[0]) console.log(`  info  mock-up sanity (default ${E0.a} ${E0.mv} into ${E0.d}, weather ${E0.w || 'clear'}): ${E0.pct}, ${E0.ko}`);
  // layout
  let o = await overlaps(p); ok(!o.length, `${tag} nothing on either Pokemon (default)${o.length ? ': ' + o.join('; ') : ''}`);
  let sz = await sizes(p, touch); ok(!sz.length, `${tag} every control at least 44px tall${touch ? ' and wide' : ''}${sz.length ? ': ' + sz.slice(0, 6).join('; ') : ''}`);
  let sw = await sideways(p); ok(sw <= 0, `${tag} no sideways scroll (${sw}px over)`);
  if (W === 390) { const h = await p.evaluate(() => document.querySelector('.arn-grid').getBoundingClientRect().height); ok(h <= 1.6 * 844, `${tag} calculator ${Math.round(h)}px = ${(h / 844).toFixed(2)} screens (at most 1.6)`); }
  if (W === 1440) { const bt = await p.evaluate(() => document.querySelector('.arn-grid').getBoundingClientRect().bottom + scrollY); ok(bt <= 900, `${tag} calculator ends at ${Math.round(bt)}px, inside one 1440x900 screen`); }
  // weather: each pill changes the sky; Rain changes the numbers (the engine's)
  for (const [v, k] of [['', 'clear'], ['rain', 'rain'], ['sand', 'sand'], ['snow', 'snow'], ['sun', 'sun']]) { await click(p, `.arn-pills.arn-wxr [data-dcw="${v}"]`);
    const s = await shown(p), e = await engine(p); ok(s.sky.includes('arn-w-' + k) && await pressed(p, `.arn-pills.arn-wxr [data-dcw="${v}"]`) === 'true' && e.w === v && (s.verdict.includes(e.pct) || s.tag.includes(e.pct)), `${tag} weather ${k}: sky arn-w-${k}, pill pressed, numbers ${e.pct} from the engine`);
    if (k === 'rain') ok(e.pct !== E0.pct, `${tag} Rain changes the damage (${E0.pct} -> ${e.pct})`);
    o = await overlaps(p); if (o.length) ok(false, `${tag} weather ${k}: nothing on either Pokemon: ${o.join('; ')}`); }
  for (const [v, k] of [['grassy', 'grassy'], ['electric', 'electric'], ['psychic', 'psychic'], ['misty', 'misty'], ['', 'none']]) { await click(p, `.arn-pills.arn-trr [data-dcterr="${v}"]`);
    const s = await shown(p), e = await engine(p); ok(s.sky.includes('arn-t-' + k) && e.t === v && await pressed(p, `.arn-pills.arn-trr [data-dcterr="${v}"]`) === 'true', `${tag} terrain ${k}: ground arn-t-${k}, pill pressed`); }
  // the five switches
  for (const k of ['spread', 'screen', 'hh', 'fg', 'crit']) { const before = await engine(p), was = await pressed(p, `.arn-sw [data-dct="${k}"]`); await click(p, `.arn-sw [data-dct="${k}"]`);
    const now = await pressed(p, `.arn-sw [data-dct="${k}"]`), e = await engine(p), s = await shown(p);
    ok(now !== was && e.pct !== before.pct && (s.verdict.includes(e.pct) || s.tag.includes(e.pct)), `${tag} switch ${k}: ${was} -> ${now}, damage ${before.pct} -> ${e.pct} on screen`);
    await click(p, `.arn-sw [data-dct="${k}"]`); }
  // moves: each of the three buttons; All moves (today's list) laid over its button
  const mvs = await p.evaluate(() => [...document.querySelectorAll('.arn-mvs [data-dcmv]')].map(e => e.dataset.dcmv)); ok(mvs.length === 3, `${tag} three move buttons (${mvs.join(', ')})`);
  for (const m of [...mvs].reverse()) { await click(p, `.arn-mvs [data-dcmv="${m}"]`); const e = await engine(p), s = await shown(p); ok(e.mv === m && await pressed(p, `.arn-mvs [data-dcmv="${m}"]`) === 'true' && (!e.pct || s.verdict.includes(e.pct) || s.tag.includes(e.pct)), `${tag} move ${m}: chosen, ${e.pct || 'no number'} on screen`); }
  const all = await p.evaluate(() => { const s = document.querySelector('.arn-mv.all #dcMv'), bx = document.querySelector('.arn-mv.all'); if (!s) return null; const a = s.getBoundingClientRect(), c = bx.getBoundingClientRect();
    return {n: s.options.length, cover: Math.abs(a.width - c.width) < 6 && Math.abs(a.height - c.height) < 6, other: [...s.options].map(o => o.text).find(t => ![...document.querySelectorAll('.arn-mvs [data-dcmv]')].some(b => b.dataset.dcmv === t))}; });
  ok(all && all.n > 3 && all.cover, `${tag} All moves opens today's move list (${all && all.n} moves) from the whole button`);
  if (all && all.other) { await p.selectOption('#dcMv', {label: all.other}); await wait(p); const e = await engine(p); ok(e.mv === all.other, `${tag} All moves: picking ${all.other} puts it in play`); }
  await click(p, `.arn-mvs [data-dcmv="${mvs[0]}"]`);
  // name plates: today's Pokemon pickers over the whole plate; a new defender changes the numbers
  const pl = await p.evaluate(() => ['dcA', 'dcD'].map(id => { const s = document.getElementById(id), pl = s && s.closest('.arn-plate'); if (!pl) return null; const a = s.getBoundingClientRect(), c = pl.getBoundingClientRect(); return s.options.length > 250 && Math.abs(a.width - c.width) < 2 && Math.abs(a.height - c.height) < 2; }));
  ok(pl[0] && pl[1], `${tag} both name plates open the Pokemon picker (attacker ${pl[0]}, defender ${pl[1]})`);
  { const d0 = await engine(p); await p.selectOption('#dcD', 'Incineroar'); await wait(p, 500); const e = await engine(p), nm = await p.evaluate(() => document.querySelector('[data-arnname="d"]').textContent);
    ok(e.d === 'Incineroar' && /Incineroar/.test(nm) && e.pct !== d0.pct, `${tag} defender plate: Incineroar in, plate and numbers follow (${d0.pct} -> ${e.pct})`);
    await p.selectOption('#dcD', d0.d); await wait(p, 500); }
  // swap
  { const e0 = await engine(p); await click(p, '#dcSwap', 500); const e1 = await engine(p), nm = await p.evaluate(() => [document.querySelector('[data-arnname="a"]').textContent, document.querySelector('[data-arnname="d"]').textContent]);
    ok(e1.a === e0.d && e1.d === e0.a && nm[1].replace(/\s+/g, ' ').includes(V2disp(e0.a)), `${tag} swap: ${e0.a} / ${e0.d} -> ${e1.a} / ${e1.d}, plates follow`);
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
    const t1 = await p.evaluate(() => [...document.querySelectorAll('.arn-kb .dc2-kt')].filter(e => e.getClientRects().length).length); ok(t1 >= 20 && await pressed(p, '.arn-kb [data-dcdir="mine"]') === 'true', `${tag} the board opens with your hits (${t1} tiles)`);
    await click(p, '.arn-kb [data-dcdir="theirs"]', 900); const t2 = await p.evaluate(() => ({n: [...document.querySelectorAll('.arn-kb .dc2-kt')].filter(e => e.getClientRects().length).length, open: document.querySelector('.arn-kb').open, h: /Each top threat's best hit on your team/.test(document.querySelector('.arn-kb').textContent)}));
    ok(t2.open && t2.n >= 20 && t2.h && await pressed(p, '.arn-kb [data-dcdir="theirs"]') === 'true', `${tag} "Their hits on you": ${t2.n} tiles, their every-hit table, board stays open`);
    await click(p, '.arn-kb [data-dcdir="mine"]', 900); await click(p, '.arn-kb > summary', 400); }
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
console.log(fails.length ? `\n${fails.length} failure(s)` : '\nall Arena checks pass'); process.exit(fails.length ? 1 : 0);
// today's koText in the Arena's plain words (the same table as calc.js V2.ARN_W.long, enough to recognise it)
function V2words(t) { let m; t = t.replace(/ \(Focus Band.*$/, ''); if (t === 'Guaranteed OHKO') return 'Knocks it out'; if ((m = /^(\d+)% chance to OHKO$/.exec(t))) return `${m[1]}% chance to knock it out`;
  if (t === 'Guaranteed 2HKO') return 'Two hits to knock it out'; if ((m = /^(\d+)% chance to 2HKO$/.exec(t))) return `${m[1]}% chance to knock it out in two hits`; if (t === 'Guaranteed 3HKO') return 'Three hits to knock it out';
  if ((m = /^(\d+)HKO or worse$/.exec(t))) return ' hits or more'; return t; }
function V2disp(n) { return n.replace(/^(.*)-Mega(?:-(\w+))?$/, (x, b, y) => 'Mega ' + b + (y ? ' ' + y : '')).replace(/^Mega /, ''); }
