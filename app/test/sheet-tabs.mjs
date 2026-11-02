// The Pokémon sheet's "Info | Meta | Rating" tabs (Nov 2): switching, remembering, keyboard, swipe, the Info tab's numbers
// (base stats from ROSTER, type matchups with abilities, Speed from the app's own speed maths) and the Meta empty state.
// Run on its own (node app/test/sheet-tabs.mjs, after a build) or from run.mjs.
import fs from 'node:fs'; import {chromium} from 'playwright'; import {fileURLToPath} from 'node:url';
const APP = fileURLToPath(new URL('..', import.meta.url)), OUT = APP + '../out/';
const page = APP + 'dist/test-tabs.html';
fs.writeFileSync(page, '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + fs.readFileSync(APP + 'dist/page.html', 'utf8').replace('render();setView(view,false);', 'window.__ev=c=>eval(c);render();setView(view,false);'));
const rd = f => { try { return JSON.parse(fs.readFileSync(OUT + f, 'utf8')); } catch (e) { return null; } };
const L = rd('limitless.json');
const DOCS = {'meta/results': L && L.results, 'meta/perf': L && {adj: L.adj, updated: L.updated.slice(0, 10)}, 'meta/doubles_tour': rd('meta_tour.json'), 'meta/teams': rd('teams.json'),
  'meta/history': rd('history.json'), 'meta/model': rd('model.json'), 'meta/doubles': rd('meta_ladder.json'), 'meta/doubles_ingame': rd('meta_ingame.json'), 'meta/events': rd('events.json')};
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('  FAIL', msg); } else console.log('  ok  ', msg); };
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(D => { window.__PL_TEST = true;
  window.claude = {use: async n => { await new Promise(r => setTimeout(r, 20));
    if (n === 'db') return {doc: p => ({onSnapshot: cb => { setTimeout(() => cb({exists: !!D[p], data: () => D[p]}), 5); return () => {}; }, get: async () => ({exists: false}), set: async () => {}})};
    if (n === 'user') return {id: async () => 'u_test', isOwner: () => true}; return null; }}; }, DOCS);
await pg.goto('file://' + page); await pg.waitForTimeout(2500);
const E = c => pg.evaluate(c => window.__ev(c), c);
const EF = (fn, arg) => E(`(${fn.toString()})(${JSON.stringify(arg === undefined ? null : arg)})`);

const open = n => E(`lairClose();lairSheet(${JSON.stringify(n)});0`);
await E(`localStorage.removeItem('cc2.lstab');LST.cur='info';0`);
const state = () => pg.evaluate(() => { const sh = document.getElementById('lairSheet'), tabs = [...sh.querySelectorAll('[role=tab]')];
  return {tabs: tabs.map(t => (t.querySelector('b') || t).textContent.trim()), sel: tabs.filter(t => t.getAttribute('aria-selected') === 'true').map(t => t.dataset.lstab),
    shown: [...sh.querySelectorAll('[role=tabpanel]')].filter(p => !p.hidden).map(p => p.dataset.lstp), h: Math.round((tabs[0] || {}).getBoundingClientRect ? tabs[0].getBoundingClientRect().height : 0)}; });
// 1. three labelled tabs, Info first for a first-time visitor
await open('Rillaboom'); let s = await state();
ok(s.tabs.join('|') === 'Info|Meta|Rating', `tabs read Info | Meta | Rating (${s.tabs.join('|')})`);
ok(s.sel.join() === 'info' && s.shown.join() === 'info', `first visit opens on Info (${s.sel} / ${s.shown})`);
ok(s.h >= 40, `tabs are at least 40px tall (${s.h}px)`);
// 2. switching: tap Meta, the hero sprite node is kept (no re-render)
await pg.evaluate(() => { const i = document.querySelector('#lairSheet .lshead img'); if (i) i.__keep = 1; });
await pg.click('#lairSheet [data-lstab="meta"]'); s = await state();
ok(s.sel.join() === 'meta' && s.shown.join() === 'meta', 'tapping Meta shows only the Meta panel');
ok(await pg.evaluate(() => { const i = document.querySelector('#lairSheet .lshead img'); return !i || i.__keep === 1; }), 'the hero picture is not recreated when switching');
ok(await pg.evaluate(() => !!document.querySelector('#lairSheet .lstp-meta .chlsdata') && /Typical set/i.test(document.querySelector('#lairSheet .lstp-meta').innerText)), 'Meta has the moves/items block and the typical set');
ok(await pg.evaluate(() => { const t = document.querySelector('#lairSheet .lstp-rating').innerText; return /Why it rates/i.test(t) && /What the data says/i.test(t) && !document.querySelector('#lairSheet .lstp-rating details.chsec'); }), 'Rating has Why it rates + What the data says, unfolded');
ok(await pg.evaluate(() => { const b = document.querySelector('#lairSheet .lsbody'), a = b.querySelector('.lsact'), w = b.querySelector('.lstpw'); return !!a && !!w && (w.compareDocumentPosition(a) & 4) > 0; }), 'actions stay under the panels');
// 3. keyboard: arrows move between tabs
await pg.focus('#lairSheet [data-lstab="meta"]'); await pg.keyboard.press('ArrowRight'); s = await state();
ok(s.sel.join() === 'rating', `ArrowRight moves Meta → Rating (${s.sel})`);
await pg.keyboard.press('ArrowRight'); s = await state(); ok(s.sel.join() === 'info', `ArrowRight wraps Rating → Info (${s.sel})`);
await pg.keyboard.press('ArrowLeft'); s = await state(); ok(s.sel.join() === 'rating', 'ArrowLeft goes back to Rating');
// 4. remembered: reopen, another Pokémon, a teammate button inside the sheet, and a reload
await open('Incineroar'); s = await state(); ok(s.sel.join() === 'rating', `reopening keeps the last tab (${s.sel})`);
await pg.click('#lairSheet [data-lstab="meta"]');
const bw = await pg.evaluate(() => { const b = document.querySelector('#lairSheet .chbw [data-lt]'); if (!b) return null; b.click(); return b.dataset.lt; });
if (bw) { s = await state(); ok(s.sel.join() === 'meta' && await E(`ui.lsheet===${JSON.stringify(bw)}`), `a "Brought with" teammate opens on the same tab (${bw}, ${s.sel})`); }
await pg.reload(); await pg.waitForTimeout(2500); await open('Pelipper'); s = await state();
ok(s.sel.join() === 'meta', `the tab survives a reload (${s.sel})`);
// 5. swipe: a sideways swipe moves to the neighbour, a vertical one doesn't
const swipe = (dx, dy) => pg.evaluate(([dx, dy]) => { const el = document.querySelector('#lairSheet .lstp:not([hidden])'), r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = Math.min(r.top + 60, innerHeight - 120);
  const T = (cx, cy) => new Touch({identifier: 1, target: el, clientX: cx, clientY: cy});
  el.dispatchEvent(new TouchEvent('touchstart', {bubbles: true, touches: [T(x, y)], changedTouches: [T(x, y)]}));
  el.dispatchEvent(new TouchEvent('touchmove', {bubbles: true, touches: [T(x + dx, y + dy)], changedTouches: [T(x + dx, y + dy)]}));
  el.dispatchEvent(new TouchEvent('touchend', {bubbles: true, touches: [], changedTouches: [T(x + dx, y + dy)]})); }, [dx, dy]);
await swipe(-120, 10); s = await state(); ok(s.sel.join() === 'rating', `swipe left: Meta → Rating (${s.sel})`);
await swipe(120, -8); s = await state(); ok(s.sel.join() === 'meta', `swipe right: Rating → Meta (${s.sel})`);
await swipe(30, 300); s = await state(); ok(s.sel.join() === 'meta', 'a vertical swipe does not switch');
await swipe(70, 60); s = await state(); ok(s.sel.join() === 'meta', 'a diagonal swipe does not switch');
// 6. Info: six stats + total equal ROSTER
await pg.click('#lairSheet [data-lstab="info"]');
for (const n of ['Rillaboom', 'Charizard-Mega-Y', 'Floette-Eternal', 'Indeedee-F', 'Arcanine-Hisui']) { await open(n);
  const r = await pg.evaluate(n => { const p = window.__PL.byName.get(n), rows = [...document.querySelectorAll('#lairSheet .lstp-info .lstr')].map(x => +x.querySelector('b').textContent);
    return {got: rows, want: [...p.st, p.st.reduce((a, b) => a + b, 0)], labels: [...document.querySelectorAll('#lairSheet .lstp-info .lstr span')].map(x => x.textContent)}; }, n);
  ok(r.got.join() === r.want.join() && r.labels.join() === 'HP,Attack,Defense,Sp. Atk,Sp. Def,Speed,Total', `${n}: 6 base stats + total match ROSTER (${r.got.join('/')})`); }
// 7. type matchups
const ty = n => EF(n => { lairClose(); lairSheet(n); const g = {}; document.querySelectorAll('#lairSheet .lstp-info .lsty').forEach(r => { g[r.querySelector('.lstyl').textContent.trim()] = [...r.querySelectorAll('.ty')].map(c => c.textContent.trim()); });
  return {g, notes: [...document.querySelectorAll('#lairSheet .lstp-info .lsabn')].map(x => x.innerText.replace(/\s+/g, ' '))}; }, n);
let t = await ty('Rotom-Wash'); ok((t.g['Immune'] || []).includes('Ground') && !(t.g['2× weak'] || []).includes('Ground') && /Levitate/.test(t.notes.join()), `Rotom-Wash (Levitate, its only ability): immune to Ground (${JSON.stringify(t.g)})`);
t = await ty('Charizard-Mega-Y'); ok((t.g['4× weak'] || []).join() === 'Rock' && (t.g['Immune'] || []).join() === 'Ground', 'Mega Charizard Y: 4× weak to Rock, immune to Ground');
t = await ty('Garchomp'); const tz = await ty('Garchomp-Mega-Z');
ok(!(t.g['Immune'] || []).includes('Ground') && (tz.g['Immune'] || []).includes('Ground'), 'Mega Garchomp Z (Levitate) is immune to Ground, Garchomp is not');
t = await ty('Venusaur'); const tv = await ty('Venusaur-Mega');
ok((t.g['2× weak'] || []).includes('Fire') && !(tv.g['2× weak'] || []).includes('Fire') && !(tv.g['2× weak'] || []).includes('Ice') && /Thick Fat/.test(tv.notes.join()), 'Mega Venusaur (Thick Fat) loses its Fire and Ice weaknesses; Venusaur keeps them');
t = await ty('Arcanine-Hisui'); ok(/With Flash Fire/.test(t.notes.join()) && /not counted above/.test(t.notes.join()), 'a choosable ability (Flash Fire on Hisuian Arcanine) is a labelled note, not counted in the lists');
// 8. speed numbers = the app's own speed maths
for (const n of ['Rillaboom', 'Charizard-Mega-Y', 'Pelipper']) { await open(n);
  const r = await EF(n => { const p = byName.get(n), maxN = calcStat(p, 'Spe', 32, 1.1), s = likelySpeed(p, null), run = spdCalc(s.v, s.scarf, abilityOf({p}), '', {});
    const want = {run, none: calcStat(p, 'Spe', 0, 1), max: calcStat(p, 'Spe', 32, 1), maxn: maxN, tw: spdCalc(maxN, false, '', '', {tw: true}), tr: calcStat(p, 'Spe', 0, .9)}; if (!p.m) want.scarf = spdCalc(maxN, true, '', '', {});
    const got = {}; for (const x of LST.speeds(p)) got[x.k] = x.v;
    const shown = [...document.querySelectorAll('#lairSheet .lsvr b')].map(b => +b.textContent);
    const os = document.querySelector('#lairSheet .lsvr.main .lsvo'), ot = outspeedTxt(outspeedOf(run, '', {}));
    return {ok: Object.keys(want).every(k => got[k] === want[k]), shownOk: shown.length >= 6 && shown[0] === run, osOk: !ot || (os && os.textContent === ot), want, got, mega: p.m, hasScarf: 'scarf' in got}; }, n);
  ok(r.ok && r.shownOk && r.osOk && (r.mega ? !r.hasScarf : r.hasScarf), `${n}: Speed rows equal calcStat / spdCalc / likelySpeed (${JSON.stringify(r.got)})`); }
// the same numbers as the Speed tiers page: every threat listed there (no weather, no toggles) shows the same Speed on its sheet
{ await E(`S.slots=[{n:'Staraptor-Mega'},{n:'Gholdengo'},{n:'Raichu-Mega-Y'},{n:'Primarina'},{n:'Rillaboom'},{n:'Incineroar'}];fixSlots();render();0`);
  const r = await EF(() => { setView('speed'); renderSpeed(); const W = spdUi.wx === 'auto' ? (typeof sideField === 'function' ? sideField(members()).weather : '') : spdUi.wx;
    if (W || spdUi.tw || spdUi.twOpp || spdUi.icy || spdUi.par || !spdLast) return {skip: JSON.stringify({W, last: !!spdLast})};
    const rows = spdLast.rows.filter(x => !x.me), bad = rows.filter(x => { const row = LST.speeds(x.p).find(y => y.k === 'run'); return !row || row.v !== x.v; }).map(x => x.p.n);
    setView('ratings'); return {n: rows.length, bad}; });
  ok(!r.skip && (r.n >= 10 && !r.bad.length), `"What players run" equals the Speed tiers page for all ${r.n} threats listed there${r.skip ? ' (skipped: ' + r.skip + ')' : ''}${r.bad && r.bad.length ? ' — differs: ' + r.bad.join(', ') : ''}`); }
// 9. a page link inside the sheet closes it and goes there
await open('Rillaboom'); await pg.click('#lairSheet [data-lstab="info"]'); await pg.click('#lairSheet .lstp-info [data-view="speed"]'); await pg.waitForTimeout(300);
ok(await EF(() => document.getElementById('lairSheet').hidden && view === 'speed'), '"Speed tiers" closes the sheet and opens Speed tiers');
// 10. Meta empty state when there are no sets and no replay partners
const em = await EF(() => { const sf = setFor, bk = brKeyOf; setFor = () => ({mv: [], it: [], ab: [], na: [], tm: [], src: {}, sd: null}); brKeyOf = () => '__none__';
  try { lairClose(); lairSheet('Beedrill'); const m = document.querySelector('#lairSheet .lstp-meta .lsempty'); return m ? m.textContent : ''; } finally { setFor = sf; brKeyOf = bk; lairClose(); } });
ok(/No tournament or ladder sets yet/.test(em), 'Meta tab says "No tournament or ladder sets yet" when there is nothing');
ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
await browser.close(); try { fs.unlinkSync(page); } catch (e) {}
console.log(fails ? `\nsheet tabs: ${fails} FAILED` : '\nsheet tabs: all passed'); process.exit(fails ? 1 : 0);
