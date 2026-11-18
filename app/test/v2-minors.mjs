// Small fixes from the code review (Nov 17), one check each; every check fails on the build before its fix.
//   A1-M1  Matchups never says "Ready for every top threat" (word list: answers, not readiness)
//   A1-M2  Build's "Copy for Showdown" uses the shared copy with its fallback (it failed where the clipboard API is blocked)
//   A1-M3  Build's Save says "for this visit" when the browser can't keep it (it always said "Saved")
//   DP-1..12  The Champions Dispatch (#news): source links, what goes on the front, the same numbers as the site, the coupon, contrast, widths, the small piece
//   SDP-1..6  Home's post band (The Stampede, band 4): the Post Room and Dispatch pieces with live POST data, the Pelipper clear of text, widths, empty states
//   OL-i39  Report a Mistake on a Pokémon page sends its numbers (rating, tier, rank, tournament numbers, moves, items), as today's site did
//   OL-i15  Build's Blueprint shows the catch tip, "X isn't in your box" and every plan chip (no cap of 3), in even rows
//   Stampede polish 1/1b/2 (Nov 18): the hero/six seam, the three parts starting and ending together, the receipt's band names readable
// Exit 1 on any failure.   PAGE=app/dist/v2.html node app/test/v2-minors.mjs   (a --v2 --preview-data build)
import {chromium} from 'playwright'; import path from 'node:path'; import fs from 'node:fs';
const PAGE = path.resolve(process.env.PAGE || 'app/dist/v2.html');
const fails = [], ok = (c, msg) => { console.log((c ? '  pass  ' : '  FAIL  ') + msg); if (!c) fails.push(msg); };
ok(!/Ready for every top threat/.test(fs.readFileSync(PAGE, 'utf8')), 'A1-M1: the page never says "Ready for every top threat"');
{ const h = fs.readFileSync(PAGE, 'utf8'); ok(/<div id="app"><a class="vh np-skip"[\s\S]*?class="np-head"/.test(h), 'B-I3: the header is in the page before the script runs (static first screen)'); if (h.includes('__NP_PREVIEW=1')) ok(/const D=JSON\.parse\("/.test(h), 'B-m5: the Preview\'s data is read with JSON.parse, not as a big object literal'); }
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1280, height: 900}});
await p.addInitScript(() => { window.__PL_TEST = 1; });
await p.goto('file://' + PAGE + '#build'); await p.waitForTimeout(2500);
await p.getByRole('button', {name: 'Build Me a Team'}).first().click();
await p.waitForSelector('[data-bdcopy]', {timeout: 30000}).catch(() => {});
const has = await p.$('[data-bdcopy]');
ok(!!has, 'Build made a team with its Copy and Save buttons');
const lab = await p.evaluate(() => ({core: document.querySelectorAll('.bp-core').length, roles: [...document.querySelectorAll('.bp-role')].map(e => e.textContent.trim()).filter(t => t && t !== '\u00a0')}));
{ const tx = await p.evaluate(() => document.querySelector('#main').innerText); ok(!/Best core/.test(tx), `Sim (Nov 17): Build says "Best trio", not "Best core" (${(tx.match(/Best (core|trio)[^\n]{0,24}/) || ['none'])[0]})`); }
ok(lab.core === 0 && lab.roles.length === 0, `Sim (Nov 17): Build's team cards carry no Core badge and no role heading (${JSON.stringify(lab)})`);
const toastAfter = async fn => { await p.evaluate(() => document.querySelectorAll('.np-toast').forEach(t => t.remove())); await fn(); await p.waitForTimeout(500);
  return p.evaluate(() => [...document.querySelectorAll('.np-toast')].map(t => t.textContent).join(' | ')); };
if (has) {
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => true; });
  const t1 = await toastAfter(() => p.click('[data-bdcopy]'));
  ok(/copied/i.test(t1), `A1-M2: with the clipboard API blocked, Copy still copies through the fallback (toast: ${t1.slice(0, 60)})`);
  await p.evaluate(() => window.__ev('V2.canStore = false'));
  const t2 = await toastAfter(() => p.click('[data-bdsave]'));
  ok(/for this visit/.test(t2), `A1-M3: Save says "for this visit" when the browser can't keep it (toast: ${t2.slice(0, 80)})`);
  const m4 = await p.evaluate(() => window.__ev(`(() => { const g = CH.gradeOf; CH.gradeOf = () => { throw new Error('test'); }; try { V2.redraw(); } finally { CH.gradeOf = g; } const b = document.querySelector('#app .bd-alt-sc b, #app .np-score b'); const t = b ? b.textContent.trim() : 'none'; V2.redraw(); return t; })()`));
  ok(m4 === '–' || m4 === 'none', `A1-M4: if the score can't be worked out, Build shows "–", not the builder's own number (${m4})`); }
await p.goto('file://' + PAGE + '#meta'); await p.waitForTimeout(2500);
const im = await p.evaluate(() => { const i = [...document.querySelectorAll('img[src*=".webp"]')]; return {n: i.length, a: i.filter(x => x.decoding === 'async').length}; });
ok(im.n > 0 && im.a === im.n, `B-I6 (part): every sprite decodes off the main thread (${im.a} of ${im.n} on Meta)`);
const m8 = await p.evaluate(() => window.__ev(`(() => { V2.ql.opp = ['Charizard']; const b = document.createElement('button'); b.dataset.ygopp = 'Charizard-Mega-Y'; document.body.append(b); b.click(); b.remove(); return V2.ql.opp.join(','); })()`));
ok(m8 === 'Charizard', `A1-M8: Their Team in the game log takes one of each Pokémon (Charizard, then Mega Charizard Y: ${m8})`);
const m6 = await p.evaluate(() => window.__ev(`(() => { const T = META.teams && META.teams.teams; if (!T || !T.length) return 'no teams'; const keep = T[0].mons; T[0].mons = [...keep.slice(0, 5), 'Notamon']; const b = document.createElement('button'); b.dataset.wtvs = '0'; document.body.append(b); b.click(); b.remove(); T[0].mons = keep; return S.opp.filter(Boolean).join(','); })()`));
ok(!/Notamon/.test(m6), `A1-M6: an unknown name from a winning team never reaches their six (${m6.slice(0, 60)})`);
const m7 = await p.evaluate(() => window.__ev(`(() => { const keep = S.log; S.log = [{r: 'W', t: 0, b: [], o: []}, {r: 'L', t: 0, b: [], o: []}, {r: 'W', t: 5, b: [], o: []}];
  const b = document.createElement('button'); b.dataset.btldel = '0'; document.body.append(b); b.click(); b.remove(); const n = S.log.length; S.log = keep; persist(); return n; })()`));
ok(m7 === 2, `A1-M7: deleting one game removes one game, even when old games share no time (${m7} of 3 left)`);
await p.evaluate(() => window.__ev(`(() => { window.__cxi = cxInfo; cxInfo = () => { throw new Error('test'); }; V2.cxGo('cur', 't:0'); location.hash = '#compare'; })()`)); await p.waitForTimeout(2500);
const m9 = await p.evaluate(() => window.__ev(`(() => { const t = (document.querySelector('#app .cx2') || {}).textContent || ''; cxInfo = window.__cxi; return {busy: !!V2.cxBusy, msg: /couldn't be worked out/.test(t), working: /Working out both teams/.test(t)}; })()`));
ok(!m9.busy && m9.msg && !m9.working, `A1-M9: Compare stops and says so when a team can't be worked out (${JSON.stringify(m9)})`);
await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2500);
const a7 = await p.evaluate(() => window.__ev(`(() => { const n0 = S.slots.filter(s => s.n).length; keepUndo(); const gone = S.slots[0].n; S.slots[0] = blank(); render(); toast('Removed ' + gone, true);
  const s1 = S.slots.find(s => s.n); s1.a = (byName.get(s1.n).a || []).find(a => a !== s1.a) || s1.a; s1.lock = !s1.lock; render(); /* an unrelated change after it */
  const u = document.querySelector('#toastUndo'); if (!u) return 'no undo button'; u.click(); return {back: S.slots[0].n === gone, n: S.slots.filter(s => s.n).length, n0}; })()`));
ok(a7 && a7.back === false, `A2-M7: a toast's Undo doesn't roll back a later, unrelated change (${JSON.stringify(a7)})`);
const m5 = await p.evaluate(() => window.__ev(`(() => { activePerf(); const k1 = perfCache.key, now = Date.now; Date.now = () => now() + 3 * 864e5; try { activePerf(); return k1 !== perfCache.key; } finally { Date.now = now; } })()`));
ok(m5, 'A2-M5: the ratings data in use is re-checked for age each day, not only when data arrives');
const a8 = await p.evaluate(() => window.__ev(`(() => { const keep = Object.assign({}, DATA_AT); for (const k in DATA_AT) delete DATA_AT[k];
  DATA_AT.results = Date.parse('2026-11-01T12:00:00'); DATA_AT.teams = Date.parse('2026-11-01T12:00:00'); DATA_AT.track = Date.now(); const t = dataDateText();
  for (const k in DATA_AT) delete DATA_AT[k]; Object.assign(DATA_AT, keep); return t; })()`));
ok(/Nov 1\b/.test(a8), `A2-M8: "Data as of" follows the data the scores stand on, not a fresher side part (${a8})`);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(2500); /* the sample six again */
const pf = await p.evaluate(() => window.__ev(`(() => { const ms = members(); if (ms.length !== 6) return 'members ' + ms.length; const mv = [['Protect'], ['Protect'], ['Detect'], ['Detect'], ['Spiky Shield'], ['Tailwind']];
  const t = ms.map((m, i) => ({...m, moves: mv[i].map(n => mvByName.get(n)).filter(Boolean), _mv: null})); const o = teamBasicsOf(t.map(m => m.p.n), t); return o && o.protectLow; })()`));
ok(pf === 0, `A2-I5 / Sim 2B: 2 Protect + 2 Detect + 1 Spiky Shield counts as five Protect users, no penalty (protectLow ${pf})`);
const mu = await p.evaluate(async () => { const t = [...document.querySelectorAll('#main button')].find(x => /^\s*Top 10\s*$/.test(x.textContent)); if (t) t.click(); await new Promise(r => setTimeout(r, 800));
  const rows = [...document.querySelectorAll('#main .mu-rows .mu-row')].filter(r => r.getClientRects().length); if (!rows.length) return 'no rows';
  return rows.map(r => { const v = r.querySelector('.tm-v'), n = r.querySelector('.nm'); return !v ? 'ok' : v.scrollWidth <= v.clientWidth + 1 && v.getBoundingClientRect().left >= n.getBoundingClientRect().right - 1 ? 'ok' : v.textContent + ' cut'; }); });
ok(Array.isArray(mu) && mu.every(x => x === 'ok'), `Sim (Nov 17): Top 10 verdicts sit right of the name, in full (${JSON.stringify(mu).slice(0, 120)})`);
await p.evaluate(() => document.querySelector('#main #tm-set [data-v2edit]') && document.querySelector('#main #tm-set [data-v2edit]').click()); await p.waitForTimeout(1200);
const dd = await p.evaluate(() => { const s = document.querySelector('.np-sheet .ed-sel select'); if (!s) return 'no dropdown'; const c = getComputedStyle(s), a = getComputedStyle(s.parentElement, '::after');
  return {app: c.appearance || c.webkitAppearance, arrow: a.content !== 'none' && a.content !== 'normal' && parseFloat(a.width) > 0}; });
ok(dd.app === 'none' && dd.arrow, `Sim Q1 (Nov 17): Edit Set dropdowns draw our own arrow, not the device's box (${JSON.stringify(dd)})`);
{ const lab = {}; for (const [r, re] of [['meta', /On (?:[\d.]+% of )?tournament teams/ /* Q2 A (Nov 17): the hero shows "Of teams"; its spoken label keeps the base */], ['weekly', /% of this week's tournament teams/], ['team-empty', /% of ladder teams/]]) { await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1800); lab[r] = re.test(await p.evaluate(() => document.querySelector('#main').innerText)); }
  ok(Object.values(lab).every(Boolean), `Player review 1a-c (Nov 17): each share names its base (tournament / this week's tournament / ladder teams) (${JSON.stringify(lab)})`); }
{ const mv = await p.evaluate(() => window.__ev(`(() => { let n = 0, bad = []; for (const p of ROSTER) { let h = ''; try { h = V2.pkBuild(p); } catch (e) { continue; } const d = document.createElement('div'); d.innerHTML = h;
    const us = [...d.querySelectorAll('.pk-usual li')].filter(li => li.querySelector('small')).map(li => li.querySelector('b').textContent.trim()); const L = [...d.querySelectorAll('.pk-list')].find(x => /Moves/.test(x.querySelector('h3') ? x.querySelector('h3').textContent : ''));
    if (!us.length || !L) continue; n++; const names = [...L.querySelectorAll('.ms-br span')].map(s => s.textContent.trim()); const miss = us.filter(m => !names.includes(m)); if (miss.length) bad.push(p.n + ':' + miss.join('/')); } return {n, bad: bad.slice(0, 6), nb: bad.length}; })()`));
  ok(mv.nb === 0, `Player review 1d (Nov 17): every move 'Usually' names is in the Moves list below it (${mv.n} Pokémon; missing on ${mv.nb}: ${mv.bad.join(', ')})`); }
{ await p.goto('file://' + PAGE + '#pokemon=garchomp'); await p.waitForTimeout(2000); const t = await p.evaluate(() => (document.querySelector('#main .pk-n:last-child') || {}).textContent || '');
  ok(/Choice Scarf/.test(t) || !/Speed/.test(t), `Player review 1e (Nov 17): a Speed with the usual Choice Scarf says so (Garchomp: ${t.replace(/\s+/g, ' ').trim()})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(2200);
  const t = await p.evaluate(() => document.querySelector('#main').innerText); ok(/After 5 logged games, Build Me a Team weighs your own results/.test(t), 'Player review 2b (Nov 17): empty Your Games says what logging unlocks'); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(1800); await p.evaluate(() => V2.openSearch()); await p.fill('[data-v2q]', 'trick room'); await p.waitForTimeout(400);
  const hits = await p.evaluate(() => [...document.querySelectorAll('[data-v2hits] .np-hit')].map(h => h.innerText.replace(/\s+/g, ' ').trim()));
  ok(hits.some(h => /^Move Trick Room/.test(h)) && hits.some(h => /^Team style Trick Room/.test(h)), `Player review 2c (Nov 17): site search finds the move and the team style 'Trick Room' (${hits.slice(0, 4).join(' | ')})`);
  await p.click('[data-v2hits] [data-v2term="move"]'); await p.waitForTimeout(1500);
  const wt = await p.evaluate(() => ({h: location.hash, f: (V2.wtUi && V2.wtUi.f || []).map(x => x.v).join(','), txt: (document.querySelector('#main .wt-find') || {}).innerText || ''}));
  ok(wt.h === '#tournaments' && /Trick Room/.test(wt.f), `Player review 2c: picking the move opens Winning Teams filtered by it (${JSON.stringify(wt).slice(0, 120)})`); }
{ const vp = p.viewportSize(); await p.setViewportSize({width: 390, height: 844}); await p.goto('file://' + PAGE + '#tournaments'); await p.reload(); await p.waitForTimeout(2200);
  const w = await p.evaluate(() => { const vis = el => el && el.offsetParent !== null && el.getBoundingClientRect().height > 0, f = document.querySelector('#main .wt-find');
    const spots = [...document.querySelectorAll('#main .ra-spotw')].filter(vis); return {find: f ? Math.round(f.getBoundingClientRect().top + scrollY) : -1, spots: spots.length,
      spot: spots[0] ? Math.round(spots[0].getBoundingClientRect().top + scrollY) : -1}; });
  ok(w.find > 0 && w.find < 844 && w.spots === 1 && w.spot > w.find, `Player review 2d (Nov 17): on a 390-wide phone the Winning Teams search is on the first screen, above Your Team, with one Your Team shown (search at ${w.find}px, Your Team at ${w.spot}px, ${w.spots} shown)`);
  await p.setViewportSize(vp); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(1800);
  /* Player review 3a, moved for Sim's Nov 18 redesign (the Stampede): Home no longer shows the ladder's Most used (it lives on the Usage page,
     feature map HOME-02/04 in docs/rebuild/stampede/AUDIT-mockups-nov18.md; its spotlight tag is checked below). The wording rule still holds
     for the whole new Home: nothing on it says "right now" (the post band, built separately, is left out: its gift wording is its own check) */
  const h = await p.evaluate(() => ({sd: !!document.querySelector('#main .sd'), t: [...document.querySelectorAll('#main .sd > .sd-band:not(.sd-post)')].map(e => e.innerText).join(' '), old: !!document.querySelector('#main .fn-ringside'), per: window.__ev('(META[S.format] || {}).period || ""'),
    a: typeof V2.homeNext === 'function' ? V2.homeNext(Date.UTC(2026, 10, 17)) : null, b: typeof V2.homeNext === 'function' ? V2.homeNext(Date.UTC(2026, 11, 2)) : null,
    hd: typeof V2.homeHead === 'function' ? [V2.homeHead(Date.UTC(2026, 10, 17)).h, V2.homeHead(Date.UTC(2026, 11, 5)).h] : []})); const t = h.t.replace(/\s+/g, ' ');
  ok(h.sd && !h.old && t.length > 200 && !/right now/i.test(t) && !/Most used (?:in|last month|on the ladder)/.test(t), `Player review 3a (Nov 17; moved Nov 18 to the Stampede Home): Home calls no numbers "right now" and shows no month's ladder figures (Stampede ${h.sd}, old Ringside ${h.old}, ${t.length} characters read${/right now/i.test(t) ? ': "' + t.match(/.{0,40}right now.{0,20}/i)[0] + '"' : ''})`);
  ok(h.per !== '2026-10' || (h.hd[0] === 'Most used last month.' && h.hd[1] === 'Most used on the ladder.'), `Player review 3a: "last month" only while it's true (Nov 17: ${h.hd[0]}; Dec 5: ${h.hd[1]})`);
  ok(h.per !== '2026-10' || (/^\. November's numbers arrive Dec 1\.$/.test(h.a || '') && h.b === ''), `Player review 3a: the data line says how old October's numbers are until Dec 1, then drops the note (Nov 17: "${h.a}", Dec 2: "${h.b}")`); }
{ await p.goto('file://' + PAGE + '#usage'); await p.waitForTimeout(1800); const g = await p.evaluate(() => (document.querySelector('#main .gs-tag') || {}).textContent || '');
  ok(g && !/right now/i.test(g), `Player review 3a: the Usage spotlight tag doesn't say "right now" ("${g}")`); }
{ await p.goto('file://' + PAGE + '#meta'); await p.waitForTimeout(2000);
  const t = await p.evaluate(() => window.__ev(`(() => { const xs = lairRows().filter(x => x.r.tc), bad = []; for (let i = 1; i < xs.length; i++) { const a = xs[i - 1], b = xs[i], ka = lairRank(a.p).rank, kb = lairRank(b.p).rank;
    if (RS(a.r.total) === RS(b.r.total) ? ka !== kb : kb !== i + 1) bad.push(a.p.d + ' ' + RS(a.r.total) + ' #' + ka + ' / ' + b.p.d + ' ' + RS(b.r.total) + ' #' + kb); } return {n: xs.length, bad: bad.slice(0, 4), nb: bad.length}; })()`));
  ok(t.nb === 0, `Player review 3b (Nov 17): Pokémon showing the same rating share a rank, and the next one skips ahead (${t.n} rated; ${t.nb} wrong: ${t.bad.join(', ')})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(3500);
  const m = await p.evaluate(() => { const team = new Set(JSON.parse(window.__ev('JSON.stringify(members().map(x => x.p.n))'))), rows = [...document.querySelectorAll('#main .tm-mus [data-muthr]')].filter(b => b.querySelector('.mu-dis, .nm'));
    const mir = rows.filter(b => team.has(b.dataset.muthr)), other = rows.filter(b => !team.has(b.dataset.muthr));
    return {n: rows.length, mir: mir.map(b => b.dataset.muthr + ':' + /Mirror match/.test(b.innerText)), wrong: other.filter(b => /Mirror match/.test(b.innerText)).length}; });
  ok(m.mir.length > 0 && m.mir.every(x => /:true$/.test(x)) && m.wrong === 0, `Player review 3e (Nov 17): a threat that is also on your team says "Mirror match", no other row does (${m.mir.join(', ')}; ${m.wrong} wrong of ${m.n})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(5000);
  const s2 = await p.evaluate(() => { const d = document.querySelector('[data-v2fix] summary'); return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; });
  ok(/^Things to Know \d+ weak spots?, type chart, (legal|not legal yet)$|^Things to Know No weak spots, type chart/.test(s2), `Player review 3f (Nov 17): Things to Know names what it holds ("${s2}")`); }
{ await p.goto('file://' + PAGE + '#practice'); await p.waitForTimeout(2500);
  const pp = await p.evaluate(() => [...document.querySelectorAll('#main .hm-pair .hm-pp')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  ok(pp.length >= 2 && pp.every(t => /^\d+% brought together$/.test(t)), `Player review 3g (Nov 17): each pair % says "brought together" beside it (${pp.slice(0, 2).join(' | ')})`); }
{ await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#box'); await p.reload(); await p.waitForTimeout(2500);
  const bx0 = await p.evaluate(() => (document.querySelector('#main .bx-count') || {}).textContent || '');
  await p.evaluate(() => window.__ev('(() => { S.box = S.box.slice(1); render(); })()')); await p.waitForTimeout(900);
  const bx1 = await p.evaluate(() => (document.querySelector('#main .bx-count') || {}).textContent || '');
  ok(/\(sample\)/.test(bx0) && !/\(sample\)/.test(bx1), `Player review 3j (Nov 17): a first visit's box says "(sample)", and stops once changed ("${bx0}" -> "${bx1}")`); }
{ const vp = p.viewportSize(), rowsAt = async w => { await p.setViewportSize({width: w, height: 900}); await p.waitForTimeout(500);
    return p.evaluate(() => { const L = [...document.querySelectorAll('#main .tm-mus .mu-cards li')], t = {}; L.forEach(l => { const k = Math.round(l.getBoundingClientRect().top); t[k] = (t[k] || 0) + 1; }); return Object.values(t); }); };
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.goto('file://' + PAGE + '#team'); await p.reload(); await p.waitForTimeout(3500);
  const out = {}; for (const w of [320, 360, 390, 404, 430, 768, 1024]) out[w] = await rowsAt(w); await p.setViewportSize(vp);
  const bad = Object.entries(out).filter(([w, r]) => r.length && new Set(r).size > 1);
  ok(Object.values(out).some(r => r.length) && !bad.length, `Player review 3d (Nov 17): Stand-Outs rows are even at every width (${Object.entries(out).map(([w, r]) => w + ':' + r.join('+')).join(' ')})`); }
{ await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(2000);
  const run = txt => p.evaluate(t => window.__ev(`JSON.stringify((() => { const s = JSON.stringify(S.slots); const r = importPaste(${JSON.stringify(t)}); S.slots = JSON.parse(s); return r; })())`), txt).then(JSON.parse);
  const a = await run('Garchmp @ Choice Scarf\n- Earthquake\n\nSneasler @ Focus Sash\n- Close Combat'), b2 = await run('hello this is not a team, just me typing a sentence here');
  const c = await run(['Garchomp', 'Sneasler', 'Rillaboom', 'Kingambit'].map(n => n + ' @ Choice Scarf\n- Protect').join('\n\n'));
  ok(/did you mean Garchomp\?/.test(a.msg || ''), `Pre-launch 6a (Nov 17): a typo gets "did you mean" (${a.msg || a.error})`);
  ok(/doesn't look like a team/.test(b2.error || ''), `Pre-launch 6b: a sentence gets "doesn't look like a team" (${b2.error || b2.msg})`);
  ok(/Item Clause: 4 hold Choice Scarf/.test(c.msg || ''), `Pre-launch 6c: the same item on four is flagged at import (${c.msg || c.error})`); }
{ await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(1500); await p.evaluate(() => { const d = document.querySelector('[data-v2save], [data-v2saveopen]'); if (d) d.click(); }); await p.waitForTimeout(600);
  const cnt = await p.evaluate(() => { const i = document.querySelector('[data-v2savename]'); if (!i) return 'no field'; i.value = 'Wonderfully Overgrown Rain Team Name'; i.dispatchEvent(new Event('input', {bubbles: true}));
    const c = i.parentElement.querySelector('[data-v2cnt]'); return (c ? c.textContent : 'no counter') + ' | ' + i.getAttribute('aria-label'); });
  ok(/^36\/40 \| Team name, up to 40 characters$/.test(cnt), `Pre-launch 6d: the team name shows its length from 30 characters and says the limit (${cnt})`); }
{ const ctx = await b.newContext(); const q = await ctx.newPage(); await q.addInitScript(() => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', 1); localStorage.setItem('cc2.state', '{"slots":[broken'); } window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(3000);
  const u = await q.evaluate(() => ({toast: (document.querySelector('.np-toast') || {}).textContent || '', kept: localStorage.getItem('cc2.state.unreadable')}));
  ok(/couldn't be read/.test(u.toast) && u.kept === '{"slots":[broken', `Pre-launch 6e: unreadable saved data is kept aside and the player is told ("${u.toast.slice(0, 60)}", copy kept: ${u.kept === '{"slots":[broken'})`); await ctx.close(); }
{ await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(2000);
  const tb = await p.evaluate(() => window.__ev(`(() => { const raw = {since: '2026-10-29', ev: []}, out = [];
    cleanTrack(Object.assign({}, raw, {bands: [80, 70, 60]})); out.push(TR_BANDS.join(' / ')); cleanTrack(raw); out.push(TR_BANDS.join(' / ')); return out.join(' | '); })()`));
  ok(tb === '90+ / 80–89 / 70–79 / Under 70 | 90+ / 70–89 / 53–69 / Under 53', `Player review 3h (Nov 17): Track Record's groups follow the data's cut-offs (tier lines when it says so, the old ones otherwise): ${tb}`); }
{ const ctx = await b.newContext({viewport: {width: 1280, height: 900}}); const q = await ctx.newPage();
  await q.addInitScript(() => { window.__PL_TEST = 1; if (!sessionStorage.getItem('h10')) { sessionStorage.setItem('h10', 1); localStorage.setItem('cc2.state', JSON.stringify({slots: [{n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}], teams: []})); localStorage.setItem('cc2.welcomed', '"1"'); } });
  /* HOME-10b, updated with Sim's yes (Nov 18, decisions.md 10:30 PM): an empty team on Home is the mock-up's view, three open rings plus the three
     most used, under "Your six goes here." (was: six add tiles). Each open ring still opens the Add box for its own slot, name box focused */
  await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const v = await q.evaluate(() => ({eye: ((document.querySelector('#main .sds-k') || {}).textContent || '').trim(), open: [...document.querySelectorAll('#main .sds-rings [data-v2addto]')].map(e => e.getAttribute('aria-label')), named: document.querySelectorAll('#main .sds-rings .sds-slot.on').length}));
  const got = []; for (const k of [1, 3, 5]) { const t = q.locator(`#main .sds-rings [aria-label="Add a Pokémon to slot ${k}"]`); if (!(await t.count())) { got.push(k + ': no ring'); continue; } await t.first().click(); await q.waitForTimeout(700);
    got.push(k + ': ' + await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('[role="dialog"]'); return (s ? s.getAttribute('aria-label') : 'no sheet') + ' / spot ' + (V2.ed ? V2.ed.i + 1 : '?') + (document.activeElement && document.activeElement.matches('[data-adq]') ? ' / name box focused' : ''); })()`)));
    await q.keyboard.press('Escape'); await q.waitForTimeout(400); }
  ok(v.eye === 'Your six goes here.' && v.named === 3 && v.open.length === 3 && got.join(' | ') === '1: Add a Pokémon / spot 1 / name box focused | 3: Add a Pokémon / spot 3 / name box focused | 5: Add a Pokémon / spot 5 / name box focused',
    `HOME-10b (Nov 17; Nov 18 with Sim's yes): an empty team shows "Your six goes here.", three open rings and the three most used; each open ring opens the Add box for its own slot (${v.eye}; ${v.named} named, ${v.open.length} open; ${got.join(' | ')})`); await ctx.close(); }
{ const ctx = await b.newContext({viewport: {width: 1280, height: 900}}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.evaluate(() => window.__ev('clearSlot(5);render()')); await q.waitForTimeout(9000);
  const own = await q.evaluate(() => [...document.querySelectorAll('.tm-chg')].map(c => c.getAttribute('aria-label') + ' [' + ((c.querySelector('.tm-own') || {}).textContent || '') + ']').join(' | '));
  ok(/\[(In your box|To catch)\]/.test(own) && !/\[\]/.test(own), `Known-bug COV-04 (Nov 17): each suggestion says whether the Pokémon coming in is in your box or still to catch (${own.slice(0, 160)})`); await ctx.close(); }
{ const ctx = await b.newContext({viewport: {width: 412, height: 823}}); const q = await ctx.newPage();
  await q.addInitScript(() => { window.__PL_TEST = 1; let w; Object.defineProperty(window, '__NP_CLAUDE', {configurable: true, get: () => w, set: v => {
    w = v && v.use ? {use: async n => { const r = await v.use(n); if (n !== 'db' || !r) return r;
      return {doc: x => { const d = r.doc(x); return Object.assign({}, d, {onSnapshot: cb => d.onSnapshot(sn => setTimeout(() => cb(sn), 1200))}); }}; }} : v; }}); });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(400);
  await q.evaluate(() => window.__ev(`(() => { window.__ord = []; const R = ratings, D = V2.redraw; let inDraw = false;
    ratings = function () { if (!__ord.length || __ord[__ord.length - 1] !== (inDraw ? 'ratings inside draw' : 'ratings')) __ord.push(inDraw ? 'ratings inside draw' : 'ratings'); return R.apply(this, arguments); };
    V2.redraw = function () { if (!V2._dataOk) return D.apply(this, arguments); inDraw = true; __ord.push('draw'); try { return D.apply(this, arguments); } finally { inDraw = false; } }; })()`));
  await q.waitForTimeout(3500); const ord = (await q.evaluate(() => window.__ord.slice(0, 3))).join(' > ');
  ok(/^ratings > draw/.test(ord), `Speed fix 2 (Nov 17, pre-launch 2c): when today's numbers arrive the ratings are worked out as their own step before the page is drawn (${ord})`); await ctx.close(); }
{ await p.goto('file://' + PAGE + '#about'); await p.waitForTimeout(2500);
  const st = await p.evaluate(() => window.__ev(`(() => { const mf = memberFrom, pn = performance.now; let n = 0, fake = pn.call(performance); memberFrom = function () { n++; return mf.apply(this, arguments); };
    performance.now = () => (fake += 10); /* a slow phone: every clock reading 10 ms later */
    try { const g = planFixesG(members(), suggestPool(), true); g.next(); return n; } finally { memberFrom = mf; performance.now = pn; } })()`));
  ok(st > 0 && st <= 5, `Speed fix 3 (Nov 17, pre-launch 2d): on a slow clock the planner's first step stops after a few candidates (pauses by time, not by count; ${st} built)`);
  const rg = await p.evaluate(() => window.__ev(`(() => { if (typeof THR.teamReportG !== 'function') return {none: 1}; const ms = assignItems(members()), sig = r => JSON.stringify([r.score, r.rows.map(x => [x.t.n, x.level, x.solid.map(y => y.why), x.soft.map(y => y.why)])]);
    THR.noCache(false); const g = THR.teamReportG(ms); let r, n = 0; do { r = g.next(); n++; } while (!r.done); const a = sig(r.value); THR.noCache(false); const b = sig(THR.teamReport(ms));
    return {n, threats: THR.threatList().length, same: a === b}; })()`));
  ok(rg.same && rg.n === rg.threats + 1, `Speed fix 3c (Nov 18, pre-launch 2d): the planner works a team's matchup report out one threat per step (${rg.n} steps for ${rg.threats} threats), with the same report as in one go (${rg.same})`); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500);
  const rn = await p.evaluate(() => window.__ev(`(() => { const R = {id: 'M-C', since: '2026-09-01', now: {id: 'M-D', since: '2026-12-02', events: 3, need: {events: 20}}}, P = META.perf, o1 = META.reg, o2 = P && P.reg; META.reg = R; if (P) P.reg = R; try { return V2.dataNote().replace(/<[^>]+>/g, ''); } finally { META.reg = o1; if (P) P.reg = o2; } })()`));
  ok(/3 Reg M-D events so far, switches at 20\./.test(rn), `Known-bug SHELL-05 (Nov 17): the new-regulation note says how far along it is (${String(rn).slice(0, 200)})`); }
{ const lin = [];
  /* Home's ranks and most used moved for Sim's Nov 18 redesign (the Stampede): the hero's plates, tags and ticker (ratings) and the six's ring
     names stand in for .hm-rk / .hm-used; on Home every such button is read, not only the first */
  for (const [route, sel] of [['meta', '.gs-mon'], ['speed', '.sp2-m'], ['home', '.sdh-plate'], ['home', '.sdh-tag:not([hidden])'], ['home', '.sdh-tick li:not([hidden]) button'], ['home', '.sds-rings .sds-nm[data-v2mon]'], ['usage', '.us-fig']]) {
    await p.goto('file://' + PAGE + '#' + route); await p.waitForTimeout(2000);
    lin.push(await p.evaluate(([sel, all]) => { const norm = x => x.toLowerCase().replace(/[^a-z0-9%.# ]+/g, ' ').replace(/\s+/g, ' ').trim(); const es = [...document.querySelectorAll('#main ' + sel)].filter(x => x.getClientRects().length && x.getAttribute('aria-label')); if (!es.length) return sel + ' none';
      return (all ? es : es.slice(0, 1)).map(e => { const vis = norm((e.querySelector('.us-tx') || e).innerText).split(' ').slice(0, 2).join(' ') /* a Usage figure's podium number is decoration; its label text is .us-tx */, raw = e.getAttribute('aria-label'), al = norm(raw);
        return al.startsWith(vis) && !/\[object|undefined|NaN/.test(raw) ? '' : sel + ': "' + vis + '" vs "' + raw.slice(0, 60) + '"'; }).filter(Boolean).slice(0, 2).join(' | '); }, [sel, route === 'home'])); }
  const bad = lin.filter(Boolean); ok(!bad.length, `pl-5d (Nov 17; Home re-pointed to the Stampede Nov 18): spoken names start with the visible words and hold no "[object Object]" (rating tiles, speed rows, Home's hero plates, tags, ticker and ring names, Usage figures)${bad.length ? ': ' + bad.join(' | ') : ''}`); }
/* Sim, Nov 18 (C): from 360 the Hand is three across and the panel opens under the whole Hand (checked below); the Nov 17 B placement stays at 320 (two across) */
{ const ctx = await b.newContext({viewport: {width: 320, height: 844}}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.evaluate(() => document.querySelectorAll('[data-tmsel]')[0].click()); await q.waitForTimeout(500);
  const pos = await q.evaluate(() => { const c = document.querySelector('[data-tmsel][aria-pressed="true"]').closest('.mh-slot').getBoundingClientRect(), r = document.querySelector('[data-v2rep]'), m = document.querySelector('[data-v2rm]'); return r && m ? Math.round(m.getBoundingClientRect().bottom - c.bottom) : -1; });
  await q.evaluate(() => { const r = document.querySelector('[data-v2rep]'); if (r) r.click(); }); await q.waitForTimeout(400); const head = await q.evaluate(() => (document.querySelector('.np-sheet h2') || {}).textContent || '');
  await q.keyboard.type('incin'); await q.waitForTimeout(400); await q.keyboard.press('Enter'); await q.waitForTimeout(700);
  const after = await q.evaluate(() => window.__ev('members().map(m => m.p.n).join(",")')), tst = await q.evaluate(() => (document.querySelector('.np-toast') || {}).textContent || '');
  await q.evaluate(() => document.getElementById('toastUndo') && document.getElementById('toastUndo').click()); await q.waitForTimeout(500); const undone = await q.evaluate(() => window.__ev('members().map(m => m.p.n).join(",")'));
  ok(pos > 0 && pos < 650 && /^Replace /.test(head) && /Incineroar/.test(after) && /^Replaced .+ with Incineroar/.test(tst) && /Charizard-Mega-Y/.test(undone) && !/Incineroar/.test(undone), `Sim (Nov 17, B; Nov 18 C keeps it under 360): tapping a Lead Card at 320 puts Replace, Edit Set and Remove right under it (Remove ${pos}px below the Card); Replace swaps in one step and Undo brings the old one back (${head} | ${tst.slice(0, 50)})`); await ctx.close(); }
{ const ms = []; for (const w of [700, 740, 820]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#team'); await p.waitForTimeout(1500);
    ms.push(await p.evaluate(() => Math.min(...[...document.querySelectorAll('.tm-acts > button')].filter(b => b.getClientRects().length && !b.classList.contains('tm-saved')).map(b => { const br = b.getBoundingClientRect(), tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let L = 1e9, R = -1e9, n;
      while ((n = tw.nextNode())) { if (!n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const c of rg.getClientRects()) if (c.width) { L = Math.min(L, c.left); R = Math.max(R, c.right); } } return Math.round(Math.min(L - br.left, br.right - R)); })))); }
  await p.setViewportSize({width: 1280, height: 900}); ok(ms.every(x => x >= 12), `Audit v199 #1 (Nov 17): My Team's action buttons keep their words clear of the slanted edges at 700-820 (closest ${ms.join(' / ')} px; was -1 at 700)`); }
{ const tg = []; for (const w of [320, 390, 1024, 1100, 1180, 1280, 1366, 1920]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(1800);
    tg.push(await p.evaluate(() => { const r = [...document.querySelectorAll('.trk-slip')].map(s => { const st = s.querySelector('.trk-st'), L = s.querySelector('.trk-sr').getBoundingClientRect().left; let R = -1e9; const tw = document.createTreeWalker(st, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const rg = document.createRange(); rg.selectNodeContents(n); for (const c of rg.getClientRects()) if (c.width) R = Math.max(R, c.right); } return Math.round(L - Math.max(R, st.querySelector('.trk-stamp').getBoundingClientRect().right)); }); return r.length ? Math.min(...r) : 99; })); }
  await p.setViewportSize({width: 1280, height: 900}); ok(tg.every(x => x >= 4), `Audit v199 #2 (Nov 17): Track Record cards keep their words and stamp left of the dashed tear line at 320-1920 (closest ${tg.join(' / ')} px; was -41 / -46 / -14 at 1100 / 1180 / 1280)`); }
{ const sg = {}; for (const w of [320, 390, 600]) for (const r of ['tournaments', 'events', 'archetypes', 'weekly']) { await p.setViewportSize({width: w, height: 844}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    (sg[w] = sg[w] || []).push(await p.evaluate(() => { const n = [...document.querySelectorAll('.ra-seg[aria-label="Tournament views"]')].find(e => e.getClientRects().length); /* the shown copy (the page writes the bar twice, one hidden per width) */ return n ? [...n.querySelectorAll('a')].map(a => { const cs = getComputedStyle(a), rg = document.createRange(); rg.selectNodeContents(a);
      return cs.fontSize + '/' + new Set([...rg.getClientRects()].filter(c => c.width).map(c => Math.round(c.top))).size; }).join(' ') : 'none'; })); }
  await p.setViewportSize({width: 1280, height: 900}); const same = Object.values(sg).every(v => v.every(x => x === v[0] && x !== 'none'));
  ok(same, `Audit v199 #3 (Nov 17): the Tournaments tab bar has the same type size and line breaks on Winning Teams, Events, Archetypes and This Week (${Object.entries(sg).map(([w, v]) => w + ': ' + [...new Set(v)].join(' | ')).join('; ')})`); }
{ await p.setViewportSize({width: 1280, height: 900}); await p.goto('file://' + PAGE + '#speed'); await p.waitForTimeout(2000);
  const sv = await p.evaluate(() => { const h = (document.querySelector('.sp2-h h1') || {}).textContent || '', lines = [...document.querySelectorAll('.sp2-sum p')].map(x => x.textContent);
    const cnt = t => [...t.matchAll(/(?:of|vs)\s+the\s+(?:top\s+)?(\d+)/g)].map(m => +m[1]), hn = cnt(h)[0], ln = [...new Set(lines.flatMap(cnt))], note = ((document.querySelector('.sp2-sum-k') || {}).textContent || '').replace(/\s+/g, ' ');
    return {n: lines.length, hn, ln, note, ok: ln.every(x => x === hn || (note.includes('top ' + x) && note.includes('shows the ' + hn)))}; });
  ok(sv.n > 0 && sv.ok, `Audit v199 #7 (Nov 17): Speed Tiers says once what its shares count: headline top ${sv.hn}, lines of the top ${sv.ln.join('/')}, note "${sv.note}"`); }
/* Audit v199 #6, moved for Sim's Nov 18 redesign (the Stampede): the slanted lead tiles are gone; Home's 'Lead' marks now sit under the line-up's
   names (.sds-ld, the sample team's two leads). Same rule: each stays clear of its spot's edges (and so of the next name) at 360-1920; none found fails */
{ const ld = []; for (const w of [360, 420, 700, 900, 1024, 1180, 1280, 1366, 1440, 1920]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(1500);
    ld.push(await p.evaluate(() => { const L = [...document.querySelectorAll('#main .sds-rings .sds-ld')].filter(e => e.getClientRects().length); if (L.length !== 2) return 'found ' + L.length;
      return Math.min(...L.map(e => { const t = e.closest('.sds-cap').getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect(); return Math.round(Math.min(t.right - r.right, r.left - t.left)); })); })); }
  await p.setViewportSize({width: 1280, height: 900}); ok(ld.every(x => typeof x === 'number' && x >= 4), `Audit v199 #6 (Nov 17; moved Nov 18 to the Stampede line-up): Home's two 'Lead' marks stay clear of their spot's edges at 360-1920 (closest ${ld.join(' / ')} px)`); }
{ const ta = []; const tctx = await b.newContext({hasTouch: true}), tq = await tctx.newPage();
  for (const [w, r, sel] of [[820, 'build', '.np-nav a'], [820, 'build', '.bd-side .np-link'], [820, 'battle', '.bt-lfour'], [1024, 'calc', '.dc2-top .np-link'], [320, 'types', '.tc-tm'], [320, 'events', '.ev-fc']]) { /* the phone header logo is an open layout item for Sim (overlaps the arrows), not checked here */
    await tq.setViewportSize({width: w, height: 900}); await tq.goto('file://' + PAGE + '#' + r); await tq.waitForTimeout(1500);
    ta.push(...await tq.evaluate(([sel, w, r]) => [...document.querySelectorAll(sel)].filter(x => x.getClientRects().length).map(e => { e.scrollIntoView({block: 'center'}); const R = e.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2;
      const hit = (x, y) => { const h = document.elementFromPoint(x, y); return h && (h === e || e.contains(h)); }, ext = (dx, dy) => { let d = 0; while (d < 80 && hit(cx + dx * (d + 1), cy + dy * (d + 1))) d++; return d; };
      return [w + ' ' + r + ' ' + (e.textContent.trim() || 'logo').slice(0, 12), ext(-1, 0) + ext(1, 0) + 1, ext(0, -1) + ext(0, 1) + 1]; }), [sel, w, r])); }
  await tctx.close(); const small = ta.filter(x => x[1] < 44 || x[2] < 44);
  ok(ta.length > 10 && !small.length, `Audit v199 #11 (Nov 17): measured by where a tap lands, every listed button and link is at least 44 x 44 (${ta.length} checked; too small: ${small.map(x => x[0] + ' ' + x[1] + 'x' + x[2]).join(', ') || 'none'})`); }
{ const sc = []; for (const w of [320, 390, 430]) for (const r of ['sets', 'usage']) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    sc.push(await p.evaluate(([w, r]) => { const g = document.querySelector('.us-srcs'); if (!g) return [w, r, 'none', 99, 0]; const bs = [...g.querySelectorAll('button')], G = g.getBoundingClientRect(), last = bs[bs.length - 1].getBoundingClientRect();
      return [w, r, bs.map(b => b.textContent.trim()).join('/'), Math.round(G.right - last.right), Math.round(Math.max(...bs.map(b => b.getBoundingClientRect().width)) - Math.min(...bs.map(b => b.getBoundingClientRect().width)))]; }, [w, r])); }
  await p.setViewportSize({width: 1280, height: 900}); const words = sc.filter(x => x[1] === 'sets').every(x => /Online tournaments\/Showdown ladder$/.test(x[2]));
  ok(words && sc.every(x => x[3] <= 4 && x[4] <= 2), `Audit v199 #9 (Nov 17): source chips use the word-list names and fill the row in three even columns on phones (${sc.map(x => x[0] + ' ' + x[1] + ': gap ' + x[3] + ', widths differ ' + x[4]).join('; ')}; Sets: ${(sc.find(x => x[1] === 'sets') || [])[2]})`); }
{ await p.setViewportSize({width: 1280, height: 900}); await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(1500);
  const tc = await p.evaluate(() => [...document.querySelectorAll('.trk-slip')].map(s => [s.querySelector('.trk-st span').textContent, s.getAttribute('aria-label')]));
  ok(tc.length > 0 && tc.every(([t, a]) => !/·|\bRated\b/.test(t) && /rated \d+/.test(a)), `Sim (Nov 17, Q1 recommended): Track Record cards have no dots and don't repeat 'Rated N' (the big number says it; screen readers still hear it) ("${(tc[0] || [''])[0]}")`); }
{ await p.goto('file://' + PAGE + '#track'); await p.waitForTimeout(1200); /* review Nov 17 #8: a card's text is already escaped HTML; escaping it again in the label made '&' read "amp" */
  const tl = await p.evaluate(() => { const n = [...document.querySelectorAll('.trk-slip')].map(s => s.dataset.v2mon)[0]; if (!n) return ['(no card on Track Record)', ''];
    const t = document.createElement('template'); t.innerHTML = V2.trSlip({n, r: 80}, true, 'on 2 top-8 teams<br>won ' + V2.esc('Players\' Cup "A" & B <C>'), 0); const s = t.content.querySelector('.trk-slip');
    return [s ? s.getAttribute('aria-label') : '(no card drawn)', s ? s.querySelector('.trk-st span').textContent : '']; });
  ok(tl[0].includes(`top-8 teams, won Players' Cup "A" & B <C>.`) && tl[1].endsWith(`won Players' Cup "A" & B <C>`), `Review Nov 17 #8: Track Record card labels read event titles as written, with no "amp" or "#39" ('${tl[0]}')`); }
{ const tt = []; await p.setViewportSize({width: 390, height: 844}); for (const r of ['meta', 'usage', 'sets', 'tournaments', 'events', 'archetypes', 'weekly']) { await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    tt.push([r, await p.evaluate(() => { const t = [...document.querySelectorAll('#main .ra-tabs')].find(e => e.getClientRects().length), h = document.querySelector('#main .ra-lede') || document.querySelector('#main h1'); if (!t || !h) return [9999, 999];
      const T = t.closest('.ra-sub').getBoundingClientRect(); return [Math.round(T.top + scrollY), Math.round(T.top - h.getBoundingClientRect().bottom)]; })]); }
  await p.setViewportSize({width: 1280, height: 900}); const ys = tt.map(x => x[1][0]);
  ok(Math.max(...ys) <= 450 && tt.every(x => x[1][1] >= 0 && x[1][1] <= 24), `Sim (Nov 17, Q2 recommended): on phones the Pokémon / Tournaments tabs come right after the headline and intro line on every Meta page (${tt.map(x => x[0] + ' ' + x[1][0] + ' (+' + x[1][1] + ')').join(', ')} px)`); }
{ const fo = [], FW = [390, 900, 1099, 1100, 1280], FR = ['meta', 'usage', 'sets', 'tournaments', 'events', 'archetypes', 'weekly']; for (const w of FW) for (const r of FR) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    const sr = await p.getByRole('navigation', {name: 'Meta'}).count(); /* a hidden copy is not heard: role queries skip display:none */
    const st = await p.evaluate(() => { const top = document.querySelector('#main .gs-top, #main .wk-mast'), vis = e => e.getClientRects().length > 0, T = [...document.querySelectorAll('#main .ra-sub')].find(vis);
      if (!top || !T) return null; const R = T.getBoundingClientRect(), y0 = R.top + scrollY, y1 = R.bottom + scrollY;
      /* reading order: each visible line or control of the top block wholly above the tab bar comes before it in the page, each one wholly below comes after */
      const bad = [...top.querySelectorAll('h1, p, a, button, li')].filter(e => vis(e) && !T.contains(e) && !e.contains(T)).flatMap(e => { const r = e.getBoundingClientRect(), a = r.top + scrollY, z = r.bottom + scrollY, pre = !!(T.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING);
        return (z <= y0 && !pre) || (a >= y1 && pre) ? [(e.textContent.trim() || e.tagName).slice(0, 16)] : []; });
      top.setAttribute('tabindex', '-1'); top.focus(); return {y0: Math.round(y0), y1: Math.round(y1), bad, n: T.querySelectorAll('a').length}; });
    if (!st) { fo.push([w, r, 'no tab bar']); continue; }
    const seq = []; for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); /* real Tab presses from the start of the top block */
      const f = await p.evaluate(() => { const e = document.activeElement, top = document.querySelector('#main .gs-top, #main .wk-mast'); if (!e || !top || e === top || !top.contains(e)) return null; const r = e.getBoundingClientRect();
        return {t: (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 16), a: Math.round(r.top + scrollY), z: Math.round(r.bottom + scrollY), tab: !!e.closest('.ra-sub'), vis: e.getClientRects().length > 0}; });
      if (!f) break; seq.push(f); }
    const ti = seq.map((f, i) => f.tab ? i : -1).filter(i => i >= 0), first = Math.min(...ti), last = Math.max(...ti);
    const wrong = seq.filter((f, i) => !f.tab && ((f.z <= st.y0 && i > first) || (f.a >= st.y1 && i < last))).map(f => f.t + ' (y ' + f.a + ')');
    if (!(st.bad.length === 0 && sr === 1 && ti.length === st.n && last - first === st.n - 1 && seq.every(f => f.vis) && wrong.length === 0))
      fo.push([w, r, `tabs at y ${st.y0}; focus ${seq.map(f => (f.tab ? '[' + f.t + ']' : f.t) + ' ' + f.a).join(' > ')}; focused out of order: ${wrong.join(', ') || 'none'}; read out of order: ${st.bad.join(', ') || 'none'}; Meta tab bars heard: ${sr}; tab links focused ${ti.length} of ${st.n}`]); }
  await p.setViewportSize({width: 1280, height: 900});
  ok(!fo.length, `Review Nov 17 evening #2: on every Meta page at ${FW.join(', ')}, keyboard focus and screen-reader order follow what is seen around the Pokémon / Tournaments tabs (what is above them comes first, what is below after; one tab bar heard)${fo.length ? ': ' + fo.map(x => x.join(' ')).join(' | ') : ' (' + FW.length * FR.length + ' page views)'}`); }
{ const hg = []; for (const w of [390, 900, 1099]) for (const r of ['meta', 'usage', 'sets', 'tournaments', 'events', 'archetypes', 'about', 'method', 'feedback']) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    hg.push([w, r, await p.evaluate(() => { const h = document.querySelector('#main .gs-top>.ra-h'); if (!h) return null; const B = s => { const e = h.querySelector(s); return e && e.getClientRects().length ? e.getBoundingClientRect() : null; }, e = B('.np-eyebrow'), t = B('h1'), l = B('.ra-lede');
      const s = h.parentElement.querySelector(':scope>.ra-spotw'), S = s && s.getClientRects().length ? s.getBoundingClientRect() : null;
      return e && t && l ? [Math.round(t.top - e.bottom), Math.round(l.top - t.bottom), h.querySelector('.ra-sub') || !S ? null : Math.round(S.top - l.bottom)] : null; })]); }
  await p.setViewportSize({width: 1280, height: 900});
  const hbad = hg.filter(([, , g]) => !g || g[0] !== 12 || g[1] !== 12 || (g[2] !== null && g[2] !== 40));
  ok(!hbad.length, `Review Nov 17 evening #4: under 1100 the headline keeps its 12px line spacing (eyebrow to headline, headline to intro) on the Meta pages and on About, How We Calculate and Feedback, and those three keep their 40px to the card below (were 16 / 16 and 20 after the Nov 17 tab move)${hbad.length ? ': ' + hbad.map(([w, r, g]) => w + ' ' + r + ' ' + (g ? g.filter(x => x !== null).join('/') : 'no headline')).join(', ') : ' (' + hg.length + ' page views)'}`); }
{ const ch = []; for (const w of [320, 390, 599, 600, 640, 700, 759, 760, 820, 899, 1280]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#speed'); await p.waitForTimeout(1500);
    ch.push(await p.evaluate(w => { const cs = [...document.querySelectorAll('.sp2 .np-chip')].filter(c => c.getClientRects().length), sizes = [...new Set(cs.map(c => getComputedStyle(c).fontSize))];
      const wx = [...document.querySelectorAll('.sp2-wx .np-chip')].filter(c => c.getClientRects().length), rows = {}; wx.forEach(c => { const t = Math.round(c.getBoundingClientRect().top); rows[t] = (rows[t] || 0) + 1; }); const r = Object.values(rows);
      return [w, sizes.join('/'), r.join('+'), cs.length, wx.length]; }, w)); }
  await p.setViewportSize({width: 1280, height: 900}); /* review Nov 17 #3/#6: chips must be found (6 weather chips), and the weather rows are even at every width under 900, not only on phones (640-759 had 5 + 1) */
  ok(ch.every(x => x[3] > 0 && x[4] === 6 && x[1] && !x[1].includes('/')) && ch.filter(x => x[0] < 900).every(x => new Set(x[2].split('+')).size === 1), `Audit v199 #12 (Nov 17): Speed Tiers chips are one size, and under 900 the six weather chips fill even rows (${ch.map(x => x[0] + ': ' + x[1] + ', rows ' + x[2] + (x[4] === 6 ? '' : ', ' + x[4] + ' weather chips')).join('; ')})`); }
{ const wl = []; await p.setViewportSize({width: 1280, height: 900}); for (const r of ['battle', 'team', 'weekly', 'method']) { await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1500);
    wl.push(...await p.evaluate(r => { const t = document.querySelector('#main').textContent; return [[/Build for Me\b/, 'Build for Me'], [/Count abilities/, 'Count abilities'], [/items, moves and abilities/, 'abilities (lower case)'], [/in the checklist/, 'the checklist']].filter(([re]) => re.test(t)).map(x => r + ': ' + x[1]); }, r)); }
  ok(!wl.length, `Audit v199 #16 (Nov 17): word-list names on Battle, My Team, This Week and How We Calculate (Build Me a Team, Abilities, Team Checks) (slips: ${wl.join(', ') || 'none'})`); }
{ await p.setViewportSize({width: 390, height: 900}); const lk = []; for (const n of ['Whimsicott', 'Incineroar', 'Flapple']) { await p.goto('file://' + PAGE + '#pokemon=' + n); await p.waitForTimeout(1500);
    lk.push(await p.evaluate(() => ((document.querySelector('.pk-rate small') || {}).textContent || 'none').trim() + (document.querySelector('.pk-gauge .pk-rg') ? '' : ' (no band)'))); }
  await p.setViewportSize({width: 1280, height: 900}); ok(lk.every(t => t !== 'none' && !/likely|\d+\s*[–-]\s*\d+|no band/.test(t)), `Sim (Nov 17): the Pokémon page rating line has no 'likely 81-92' words; the bar keeps its shaded band (Sim, later) (${lk.join(' | ')})`); }
{ const hd = []; const hctx = await b.newContext({hasTouch: true}), hq = await hctx.newPage();
  for (const w of [320, 360, 390, 414, 700, 1024, 1440]) { await hq.setViewportSize({width: w, height: 800}); await hq.goto('file://' + PAGE + '#home'); await hq.waitForTimeout(1200);
    await hq.evaluate(() => { location.hash = '#events'; }); await hq.waitForTimeout(800); await hq.evaluate(() => { location.hash = '#types'; }); await hq.waitForTimeout(800); await hq.goBack(); await hq.waitForTimeout(1000);
    hd.push(await hq.evaluate(w => { const q = s => document.querySelector(s), B = q('.np-goback'), L = q('.np-head .logo'), F = q('.np-gofwd'), g = e => (e.querySelector('svg,img') || e).getBoundingClientRect();
      const hit = e => { const R = e.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2, h = x => { const t = document.elementFromPoint(x, cy); return t && (t === e || e.contains(t)); }; let a = 0, z = 0; while (a < 80 && h(cx - a - 1)) a++; while (z < 80 && h(cx + z + 1)) z++; return a + z + 1; };
      const tools = q('.np-head .tools'), over = tools ? Math.round(tools.getBoundingClientRect().left - F.getBoundingClientRect().right) : 99;
      return [w, Math.round(g(L).left - g(B).right), Math.round(g(F).left - g(L).right), hit(B), hit(L), hit(F), over, document.documentElement.scrollWidth <= innerWidth]; }, w)); }
  await hctx.close(); const bad = hd.filter(([w, a, c, tb, tl, tf, ov, fit]) => Math.abs(a - c) > 1 || tb < 44 || tl < 44 || tf < 44 || ov < 0 || !fit);
  ok(!bad.length, `Sim (Nov 17): header back / logo / forward: the same gap on both sides of the logo and 44px taps for all three, nothing pushed off (${hd.map(x => x[0] + ': ' + x[1] + '|' + x[2] + ' taps ' + x[3] + '/' + x[4] + '/' + x[5]).join('; ')})`); }
{ await p.setViewportSize({width: 390, height: 900}); await p.goto('file://' + PAGE + '#compare'); await p.waitForTimeout(1500);
  await p.evaluate(() => window.__ev('ui.cx.A = null; ui.cx.B = null; V2.redraw()')); await p.waitForTimeout(300); /* review Nov 17 #6: always the empty state, so the check reads its words (it passed when no hint was shown) */
  const cx = await p.evaluate(() => { const h = document.querySelector('.cx2-hint'); return h && h.getClientRects().length ? [h.textContent, document.querySelectorAll('.cx2 tr, .cx2-row').length] : ['(no hint shown)', -1]; });
  ok(cx[1] === 0 && /^Pick two teams/.test(cx[0]) && !/rows? below/.test(cx[0]), `Audit v199 #21 (Nov 17): Compare's empty state doesn't point at rows that aren't there ("${cx[0].slice(0, 90)}")`); }
{ const gs = [], gm = []; const gctx = await b.newContext(), gq = await gctx.newPage(); await gq.addInitScript(() => { window.__PL_TEST = 1; }); /* fresh storage: the sample six are on the team, so 'on your team' bars show */
  for (const w of [390, 700, 1280]) { await gq.setViewportSize({width: w, height: 900}); await gq.goto('file://' + PAGE + '#meta'); await gq.waitForTimeout(1800);
    /* review Nov 17 #6: grouped by shelf row (the .gs-row; on phones .gs-row is display:contents and the .gs-rows scroller is the row), not by tile top, so a tile pushed down is still compared with its row */
    const [d, m] = await gq.evaluate(() => { const rows = new Map(); [...document.querySelectorAll('.gs-row .gs-mon')].filter(m => m.getClientRects().length).forEach(m => { const r = m.parentElement, k = getComputedStyle(r).display === 'contents' ? r.closest('.gs-rows') : r; if (!rows.has(k)) rows.set(k, []); rows.get(k).push(m.querySelector('.gs-sc').getBoundingClientRect().top); });
      const d = [...rows.values()].filter(v => v.length > 1).map(v => Math.max(...v) - Math.min(...v));
      const mine = [...document.querySelectorAll('.gs-mon .gs-mine')].filter(x => x.getClientRects().length).map(x => x.getBoundingClientRect().top - x.closest('.gs-mon').querySelector('.gs-sc').getBoundingClientRect().bottom);
      return [d.length ? Math.round(Math.max(...d)) : 99, mine.length ? Math.round(Math.min(...mine)) + ' (' + mine.length + ')' : 'none']; }); gs.push(d); gm.push(m); }
  await gctx.close(); ok(gs.every(x => x <= 1), `Audit v199 #13 (Nov 17): Meta Grandstand numbers line up across each shelf row, even when a name takes two lines (worst ${gs.join(' / ')} px; was 16-17)`);
  ok(gm.every(x => x !== 'none' && parseInt(x) >= 0), `Review Nov 17 #5: the Grandstand 'on your team' bar sits under its number, never over it (space between, at 390 / 700 / 1280: ${gm.join(' / ')} px)`); }
{ const ut = []; for (const w of [390, 1280]) for (const r of ['usage', 'sets']) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1800);
    ut.push(await p.evaluate(([w, r]) => { const tx = [...document.querySelectorAll('#main .gs-row .gs-tx')].filter(t => t.getClientRects().length && !t.closest('.gs-rows'));
      const gap = tx.map(t => t.getBoundingClientRect().bottom - Math.max(...[...t.children].filter(c => c.getClientRects().length).map(c => c.getBoundingClientRect().bottom)));
      return [w, r, tx.length, tx.length ? Math.round(Math.max(...gap)) : 99]; }, [w, r])); }
  await p.setViewportSize({width: 1280, height: 900}); /* the Ratings Grandstand's 'on your team' bar row (Audit v199 #13) belongs to the Ratings shelves only */
  ok(ut.every(x => x[2] > 0 && x[3] <= 1), `Review Nov 17 #5: Usage and Sets teammate and bench tiles keep no empty row under their last line (${ut.map(x => x[0] + ' ' + x[1] + ': ' + x[2] + ' tiles, ' + x[3] + ' px').join('; ')}; was 8)`); }
{ await p.setViewportSize({width: 1280, height: 900}); await p.goto('file://' + PAGE + '#build'); await p.waitForTimeout(1500);
  const ph = await p.evaluate(() => (document.querySelector('[data-bdfind]') || {}).placeholder || '(none)');
  ok(!/^optional$/i.test(ph), `Audit v199 #22 (Nov 17): Build's 'Build around a Pokémon · optional' box doesn't say 'Optional' again (placeholder "${ph}")`); }
{ const ig = []; const ictx = await b.newContext({hasTouch: true}), iq = await ictx.newPage(); for (const w of [390, 1024, 1280]) { await iq.setViewportSize({width: w, height: 900}); await iq.goto('file://' + PAGE + '#team'); await iq.waitForTimeout(1800);
    ig.push(await iq.evaluate(w => { const el = [...document.querySelectorAll('#main p.tm-sample')][0]; if (!el) return [w, 'none', 0]; const rg = document.createRange(); rg.selectNodeContents(el); const tops = [...new Set([...rg.getClientRects()].map(r => Math.round(r.top)))].sort((a, b) => a - b), gaps = tops.slice(1).map((t, i) => t - tops[i]).filter(g => g > 4);
      const taps = [...el.querySelectorAll('.np-link')].map(a => { const R = a.getBoundingClientRect(), cx = R.left + R.width / 2, cy = R.top + R.height / 2, h = y => { const t = document.elementFromPoint(cx, y); return t && (t === a || a.contains(t)); }; let u = 0, d = 0; while (u < 40 && h(cy - u - 1)) u++; while (d < 40 && h(cy + d + 1)) d++; return u + d + 1; });
      return [w, gaps.length ? Math.max(...gaps) - Math.min(...gaps) : 0, Math.min(...taps)]; }, w)); }
  await ictx.close(); ok(ig.every(x => x[1] !== 'none' && x[1] <= 2 && x[2] >= 40), `Audit v199 #22 (Nov 17): My Team's intro lines are evenly spaced (the links' tap areas don't stretch a line) and its links stay easy to tap (${ig.map(x => x[0] + ': spread ' + x[1] + ', tap ' + x[2]).join('; ')})`); }
// SUGG-09 again (Nov 18): Suggestions kept its place only for one frame after Apply; on a slow phone the parts above redraw later
// and the page still jumped (the behaviour test failed under load). A late 120px change above Suggestions must not move it.
{ const q = await b.newPage({viewport: {width: 390, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.addStyleTag({content: 'html,body{overflow-anchor:none}'}); // as a browser without scroll anchoring
  await q.evaluate(() => window.__ev(`(() => { const T = ['Incineroar','Garchomp','Sneasler','Kingambit','Basculegion','Sinistcha']; S.slots.forEach((s, i) => { s.n = T[i]; }); persist(); V2.redraw(); })()`));
  await q.waitForSelector('#tm-sg [data-v2plan]', {timeout: 20000}).catch(() => {});
  // Nov 18 (full test run): the planner works in steps now and redraws Suggestions after the first Apply shows, so wait until it settles
  await q.waitForFunction(() => { const s = document.querySelector('#tm-sg'); return s && !s.querySelector('[aria-busy=true]') && !/Working out/.test(s.innerText) && s.querySelector('[data-v2plan]'); }, null, {timeout: 30000}).catch(() => {});
  // the place under the finger (Nov 18, SUGG-09 inside Suggestions): an Apply (the faded copy's while the planner works, then the next
  // suggestion's) where the tapped one was; with none left, Suggestions' top
  const at = () => q.evaluate(() => { const s = document.querySelector('#tm-sg'), A = s && [...s.querySelectorAll('[data-v2plan]')].find(e => e.getClientRects().length); return s ? Math.round((A || s).getBoundingClientRect().top) + (A ? ' Apply' : ' top') : null; });
  const y0 = await q.evaluate(() => { const s = document.querySelector('#tm-sg'), a = s && s.querySelector('[data-v2plan]'); if (!a) return null; scrollBy(0, a.getBoundingClientRect().top - innerHeight * 2 / 3); return Math.round(s.getBoundingClientRect().top); });
  const a = await q.$('#tm-sg [data-v2plan]'); let y1 = null, a0 = null;
  if (y0 != null && a) { a0 = await at(); await q.locator('#tm-sg [data-v2plan]').first().click(); /* a fresh lookup: a held handle can go stale on a redraw */ await q.waitForTimeout(700);
    await q.evaluate(() => { const d = document.createElement('div'); d.style.height = '120px'; d.id = 'zz-late'; const m = document.querySelector('#main'); m.insertBefore(d, m.firstChild); });
    await q.waitForTimeout(1200); y1 = await at(); }
  const want = y1 && / Apply$/.test(y1) ? parseInt(a0) : y0;
  ok(y0 != null && y1 != null && Math.abs(parseInt(y1) - want) <= 4, `SUGG-09 (Nov 18): after Apply, the place under the finger stays put when the parts above change height later (${a0}, Suggestions top ${y0} -> ${y1})`);
  await q.close(); }
// SUGG-09, inside Suggestions (Nov 18): with the CPU 4x slower, the faded list sat under the new 'Applied … Undo' bar while the next
// suggestions were worked out, so the Apply under the finger dropped about 175px (600 -> 775), then moved again when the new list came.
// Every frame from the tap until the list has settled: an Apply (the faded copy's, then the next suggestion's) stays where the tapped one
// was; with no Apply left (nothing to fix), Suggestions stays where it was. One six ends with a next suggestion, one with none.
for (const [nm, T] of [['next suggestion', ['Flapple', 'Pikachu', 'Garchomp', 'Incineroar', 'Whimsicott', 'Sneasler']], ['nothing to fix', ['Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Basculegion', 'Sinistcha']]]) {
  const q = await b.newPage({viewport: {width: 390, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.addStyleTag({content: 'html,body{overflow-anchor:none}'}); // as Safari: no scroll anchoring
  await q.evaluate(T => window.__ev(`(() => { const T = ${JSON.stringify(T)}; S.slots.forEach((s, i) => { s.n = T[i]; }); persist(); V2.redraw(); })()`), T);
  await q.waitForFunction(() => { const s = document.querySelector('#tm-sg'); return s && !s.querySelector('[aria-busy=true]') && !/Working out/.test(s.innerText) && s.querySelector('[data-v2plan]'); }, null, {timeout: 30000}).catch(() => {});
  const cdp = await q.context().newCDPSession(q); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  const s0 = await q.evaluate(() => { const s = document.querySelector('#tm-sg'), a = s && s.querySelector('[data-v2plan]'); if (!a) return null; scrollBy(0, a.getBoundingClientRect().top - 600); return Math.round(s.getBoundingClientRect().top); });
  const a = await q.$('#tm-sg [data-v2plan]'), seen = [], bad = []; let busy = 0, live = 0, msg = '';
  if (s0 != null && a) { const y0 = await a.evaluate(e => Math.round(e.getBoundingClientRect().top)); await a.click(); const t0 = Date.now(); let calm = 0;
    while (Date.now() - t0 < 30000) { // measured in a frame, after the page's own frame work, as the player sees it
      const r = await q.evaluate(() => new Promise(res => requestAnimationFrame(() => { const s = document.querySelector('#tm-sg'), A = s && [...s.querySelectorAll('[data-v2plan]')].find(e => e.getClientRects().length);
        const u = s && s.querySelector('.sg2-undo'), U = u && u.getBoundingClientRect(), t = document.querySelector('.np-toast');
        res({ap: A ? Math.round(A.getBoundingClientRect().top) : null, stale: !!(A && A.closest('.sg2-stale')), sec: s ? Math.round(s.getBoundingClientRect().top) : null, busy: !!(s && (s.querySelector('[aria-busy=true]') || /Working out/.test(s.innerText))),
          bar: !!(U && U.top >= 0 && U.bottom <= innerHeight), toast: !!(t && t.getClientRects().length && /^Applied/.test(t.innerText))}); })));
      if (!msg) msg = r.bar && r.toast ? 'two' : r.bar ? 'bar' : r.toast ? 'toast' : ''; if (r.busy) busy++; else if (r.ap != null && !r.stale) live++;
      const at = r.ap != null ? ['Apply' + (r.stale ? ' (faded)' : ''), r.ap, y0] : ['Suggestions', r.sec, s0]; seen.push(at[0][0] + at[1]); if (Math.abs(at[1] - at[2]) > 4) bad.push(`${at[0]} ${at[2]} -> ${at[1]} at ${Date.now() - t0} ms`);
      if (r.busy) calm = 0; else if (!calm) calm = Date.now(); else if (Date.now() - calm > 1500) break; await q.waitForTimeout(80); } }
  ok(s0 != null && busy > 0 && (nm === 'nothing to fix' ? !live : live > 0) && (msg === 'bar' || msg === 'toast') && !bad.length, `SUGG-09 inside Suggestions (Nov 18), ${nm}, 4x slower CPU: what is under the finger after Apply never moves, through the working state and when the new list comes (${bad.length ? bad.slice(0, 3).join('; ') : 'held'}; ${busy} working frames, ${live} with a new Apply, message: ${msg || 'none'}; ${[...new Set(seen)].slice(0, 8).join(' ')})`);
  await q.close(); }
// X-05 helper's find (Nov 18): Build's sticky Recent Winners / Cores bar covered one row of the 'Build around' name list on a phone
{ const q = await b.newPage({viewport: {width: 390, height: 844}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#build'); await q.waitForTimeout(2000); const f = await q.$('[data-bdfind]'); let r = 'no box';
  if (f) { await f.click(); await f.type('gar'); await q.waitForTimeout(600);
    r = await q.evaluate(() => { const h = document.querySelector('.bd-hits'); if (!h || !h.children.length) return 'no list';
      const rows = [...h.querySelectorAll('button,a,li')].filter(e => e.getClientRects().length && e.getBoundingClientRect().bottom < innerHeight);
      const hid = rows.filter(e => { const b = e.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !t || !h.contains(t); });
      return `${hid.length} of ${rows.length} rows covered`; }); }
  ok(/^0 of [1-9]/.test(r), `Build: the 'Build around' name list sits above the sticky tab bar at 390 (${r})`); await q.close(); }
{ const sp = []; for (const [w, r] of [[390, 'build'], [390, 'speed'], [1280, 'calc'], [1280, 'battle'], [390, 'team']]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#' + r); await p.waitForTimeout(1800);
    sp.push(await p.evaluate(() => { const im = [...document.querySelectorAll('#main img[src*=".webp"]')].filter(i => i.getClientRects().length); const sm = im.filter(i => i.getAttribute('src').includes('-s/') || i.dataset.full); /* GitHub (Nov 17): no sprite files beside the test page, so a small file can already have fallen back to the big one (V2.artFix sets data-full) */
      const big = sm.filter(i => { const m = i.closest('.np-mon'), iw = m ? parseFloat(((m.getAttribute('style') || '').match(/--iw:([\d.]+)px/) || [])[1]) : NaN; return m && !(iw <= 80); }); return [sm.length, big.length, im.length]; })); }
  await p.setViewportSize({width: 1280, height: 900}); const used = sp.reduce((a, x) => a + x[0], 0), wrong = sp.reduce((a, x) => a + x[1], 0), one = await p.evaluate(() => !!window.NP_ONE_ART), all = sp.reduce((a, x) => a + x[2], 0);
  if (one) ok(all > 0 && used === 0, `Sprites A on Claude hosting (Nov 17): a --one-art-size build asks for no small file, since an artifact holds at most 511 files (${used} small of ${all} sprites on 5 pages; review Nov 17 #6: no sprites at all fails)`);
  else ok(used > 0 && wrong === 0, `Sprites A (Nov 17): small spots use the 240px files (${used} on 5 pages) and no sprite set larger than 80px gets one (${wrong})`); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500); await p.evaluate(() => V2.openSearch()); await p.waitForTimeout(300);
  const fnd = []; for (const q of ['cores', 'build for me', 'battle a team', 'pokémon ratings']) { await p.fill('[data-v2q]', q); await p.waitForTimeout(300); fnd.push(q + ' > ' + await p.evaluate(() => { const b = document.querySelector('[data-v2hits] .np-hit b'); return b ? b.textContent : 'nothing'; })); }
  await p.fill('[data-v2q]', 'cores'); await p.waitForTimeout(300); if (await p.$('[data-v2hits] .np-hit')) await p.click('[data-v2hits] .np-hit'); await p.waitForTimeout(1200);
  const cs = await p.evaluate(() => { const c = document.querySelector('#main .bd-cores'); return location.hash + (c && c.getClientRects().length ? ' cores shown' : ' cores hidden'); });
  ok(fnd.join(' | ') === 'cores > Build Around a Core | build for me > Build Me a Team | battle a team > Battle | pokémon ratings > Ratings' && cs === '#build cores shown', `Known-bug BROKEN-10 (Nov 17): search finds the cores and today's menu names, and 'cores' opens Build at its cores (${fnd.join(' | ')}; ${cs})`); await p.keyboard.press('Escape'); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500); await p.evaluate(() => V2.openSearch()); await p.waitForTimeout(300);
  await p.fill('[data-v2q]', 'garch'); await p.waitForTimeout(400);
  const hits = await p.evaluate(() => [...document.querySelectorAll('[data-v2hits] .np-hit')].map(h => h.querySelector('b') ? h.querySelector('b').textContent.trim() : '').slice(0, 4).join(' | '));
  ok(/^Garchomp\b/.test(hits) && hits.indexOf('Garchomp') < hits.indexOf('Garchompite'), `Known-bug JUMP-03 (Nov 17): Search lists the Pokémon before its items ("garch": ${hits})`); await p.keyboard.press('Escape'); }
{ await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(2500);
  const mj = await p.evaluate(() => window.__ev(`(() => { const fake = docs => ({doc: n => ({onSnapshot: (cb, err) => { const v = docs[n]; setTimeout(() => cb({exists: v !== undefined, data: () => v}), n.endsWith('_2') ? 20 : 0); }})});
    const out = []; const run = (name, docs) => new Promise(res => { const got = []; metaJoin(fake(docs), name, s => got.push(s.exists ? s.data() : null)); setTimeout(() => res(got), 80); });
    return Promise.all([run('t1', {'meta/t1': {a: [1]}}), run('t2', {'meta/t2': {a: [1]}, 'meta/t2_2': undefined}), run('t3', {'meta/t3': {_part: {id: 'x'}, a: [1]}, 'meta/t3_2': {_part: {id: 'x'}, a: [2]}})])
      .then(([g1, g2, g3]) => JSON.stringify({one: g1.length, emptyPart2: g2.length, joined: g3.length ? g3[g3.length - 1].a : null, counts: typeof META_EMITS === "object" ? [META_EMITS.doubles, META_EMITS.perf] : [1, 1]})); })()`));
  const m = JSON.parse(mj); ok(m.one === 1 && m.emptyPart2 === 1 && JSON.stringify(m.joined) === '[1,2]' && m.counts.every(c => c === 1), `Speed fix 1 (Nov 17): each daily document reaches the page once (an empty second part no longer sends it again); two parts still join (${mj})`); }
{ const q = await b.newPage({viewport: {width: 700, height: 900}}); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500);
  const yn = await q.evaluate(() => Math.round(Math.min(...[...document.querySelectorAll('.sg2-ctl .np-slide button')].map(x => x.getBoundingClientRect().width).filter(Boolean))));
  ok(yn >= 44, `Nov 17: at 700 the Adjust Suggestions Yes/No buttons are at least 44px wide (narrowest ${yn}px; was 30, letters cut by the slant)`); await q.close(); }
{ const q = await b.newPage({viewport: {width: 390, height: 844}}); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500);
  await q.evaluate(() => document.querySelectorAll('[data-tmsel]')[4].click()); await q.waitForTimeout(400);
  await q.evaluate(() => { const r = document.querySelector('[data-v2rm]'); scrollTo(0, r.getBoundingClientRect().top + scrollY - 400); r.click(); }); await q.waitForTimeout(800);
  const ad = await q.evaluate(() => { const a = document.querySelector('[data-v2addto]'); if (!a) return 'no Add spot'; const r = a.getBoundingClientRect(); return Math.round(r.top) + ' to ' + Math.round(r.bottom) + (document.activeElement === a ? ', focused' : ''); });
  const m = ad.match(/^(-?\d+) to (-?\d+), focused$/); ok(!!m && +m[1] >= 72 && +m[2] <= 844 - 72, `Sim (Nov 17): after Remove, the empty spot's Add is on screen (clear of the header and tab bar) and focused (${ad})`); await q.close(); }
{ const q = await b.newPage({viewport: {width: 390, height: 844}}); await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500);
  const yg = await q.evaluate(() => { const s = document.querySelector('#tm-yg'), n = s && s.querySelector('.tm-yg-0 span'), w = s && s.querySelector('.tm-yg-why'), t = s && s.querySelector('.tm-yg-0 [data-v2tip]'); if (!n || !w) return 'missing';
    const L = e => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)); /* Sim, Nov 18 (C): on phones the note sits behind a "?" beside 'None logged yet' */
    return L(n) + ' / ' + (w.getClientRects().length ? L(w) : t && t.getClientRects().length && (t.click(), ((document.querySelector('.sg2-tipop p') || {}).textContent || '') === w.textContent.trim()) ? 'behind ?' : 'hidden, no ?'); });
  ok(/^1 \/ ([123]|behind \?)$/.test(yg), `Nov 12 re-check (Nov 17; Nov 18 C): Your Games at 390 keeps 'None logged yet' on one line and its note on three lines at most or, since Sim's Nov 18 choice, behind a "?" with the same words, was 7 (lines: ${yg})`); /* GitHub's machine wraps it to 3 */ await q.close(); }
{ await p.goto('file://' + PAGE + '#sets'); await p.waitForTimeout(2500); await p.evaluate(() => window.__ev(`(() => { ui.setSrc = 'tour'; ui.setMon = 'Garchomp'; V2.redraw(); })()`)); await p.waitForTimeout(800);
  const sp = await p.evaluate(() => { const e = document.querySelector('.st-sp'); return e ? e.innerText.replace(/\s+/g, ' ') : 'no stat points'; });
  ok(/STAT POINTS|Stat points/.test(sp) && /Adamant: 2 HP \/ 32 Atk \/ 32 Spe 27%/.test(sp) && /Showdown ladder 1630\+.*don't include them/.test(sp), `Plans pr-4c (Nov 17): Popular Sets shows the top stat-point spreads with their share and source, even with Tournaments picked (${sp.slice(0, 120)})`); }
{ await p.goto('file://' + PAGE + '#sets'); await p.waitForTimeout(2500); const st = {};
  for (const src of ['ingame', 'tour']) { await p.evaluate(s => window.__ev(`(() => { ui.setSrc = '${s}'; ui.setMon = 'Charizard-Mega-Y'; V2.redraw(); })()`), src); await p.waitForTimeout(800);
    st[src] = await p.evaluate(() => ((document.querySelector('#main .st-side') || {}).innerText || '').replace(/\s+/g, ' ')); }
  ok(/Always Drought/.test(st.tour) && !/Blaze/.test(st.tour), `Player review 4c (Nov 17): a Mega's Ability reads "Always Drought", not the base form's Blaze (${st.tour.slice(0, 90)})`);
  ok(/No usage numbers in this source/.test(st.ingame), `Player review 4c: Best data says where the nature numbers are (${st.ingame.slice(-120)})`); }
{ await p.goto('file://' + PAGE + '#usage'); await p.waitForTimeout(2000); await p.evaluate(() => window.__ev(`(() => { ui.metaSrc = 'tour'; V2.redraw(); })()`)); await p.waitForTimeout(800);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#main [data-v2mon], #main button')].find(x => /Charizard Y/.test(x.textContent)); if (b) b.click(); }); await p.waitForTimeout(800);
  const u = await p.evaluate(() => document.querySelector('#main').innerText.replace(/\s+/g, ' ')), k = u.search(/ABILITIES/i);
  ok(k >= 0 && /Always Drought/.test(u.slice(k, k + 120)) && !/Blaze \d/.test(u), `Player review 4c: Usage (tournaments) gives Mega Charizard Y "Always Drought" (${u.slice(k, k + 80)})`); }
{ await p.goto('file://' + PAGE + '#speed'); await p.waitForTimeout(2500);
  const calc = await p.evaluate(() => window.__ev(`JSON.stringify([spdCalc(200, false, '', null, {up: true}), spdCalc(201, true, '', null, {up: true}), spdCalc(201, true, '', null, {})])`));
  const chip = await p.evaluate(() => !!document.querySelector('#main [data-spd="up"]'));
  const mine = () => p.evaluate(() => [...document.querySelectorAll('#main .sp2 [data-spme], #main .sp2 .me')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).join('|').slice(0, 200));
  const before = await mine(); if (chip) { await p.click('#main [data-spd="up"]'); await p.waitForTimeout(700); } const after = await mine();
  ok(calc === '[300,451,301]' && chip && before !== after, `Player review 4b (Nov 17): "You +1" raises your six one Speed stage in the game's order (200 -> 300; 201 with Scarf -> 451; chip ${chip}, your rows changed ${before !== after}; ${calc})`); }
{ const ctx = await b.newContext({viewport: {width: 390, height: 844}, javaScriptEnabled: false}); const q = await ctx.newPage(); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(600);
  const st = await q.evaluate(() => ({main: ((document.querySelector('#main') || {}).innerText || '').trim(), logo: !!document.querySelector('#main .np-ldlogo img, #main .np-ldlogo picture')}));
  ok(/Getting today.s numbers/.test(st.main) && st.logo, `Pre-launch 2b (Nov 17): before any code runs, the page shows the logo and "Getting today's numbers" (main: "${st.main.slice(0, 40)}", logo ${st.logo})`); await ctx.close(); }
/* X-05 (Nov 18, behaviour test "the × in a Pokémon box empties it and keeps the keyboard up"): the site's own × (V2.CLR) in five search boxes,
   by a phone tap at 390 and a mouse click at 1280. Fails on the build before it (no ×; only the browser's own, which iPhone Safari may not draw). */
{ const xr = []; for (const touch of [true, false]) { const xc = await b.newContext({hasTouch: touch, viewport: touch ? {width: 390, height: 844} : {width: 1280, height: 900}}), xq = await xc.newPage(); await xq.addInitScript(() => { window.__PL_TEST = 1; });
    for (const [r, prep, sel, list] of [['build', '', '[data-bdfind]', '[data-bdhits]'], ['build', 'cores', '[data-bdcfind]', '[data-bdchits]'], ['home', 'search', '[data-v2q]', '[data-v2hits]'], ['tournaments', '', '[data-wtq]', '.wt-find'], ['meta', '', '[data-raq]', '.ra-count']]) {
      await xq.goto('file://' + PAGE + '#' + r); await xq.waitForTimeout(1800);
      if (prep === 'cores') await xq.evaluate(() => document.querySelector('#main [data-bdjump="cores"]').click()); if (prep === 'search') await xq.evaluate(() => V2.openSearch()); await xq.waitForTimeout(500);
      const st = () => xq.evaluate(([sel, list]) => { const i = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length), f = i && i.closest('.np-field'), x = f && f.querySelector('[aria-label="Clear"]'), L = document.querySelector(list);
        const vis = !!x && x.getClientRects().length > 0, R = vis && x.getBoundingClientRect(), cx = R && R.left + R.width / 2, cy = R && R.top + R.height / 2;
        const hit = (a, c) => { const h = document.elementFromPoint(a, c); return !!h && (h === x || x.contains(h)); }, ext = (dx, dy) => { let d = 0; while (d < 60 && hit(cx + dx * (d + 1), cy + dy * (d + 1))) d++; return d; };
        return {v: i ? i.value : null, foc: !!i && document.activeElement === i, x: vis, cx, cy, w: vis ? ext(-1, 0) + ext(1, 0) + 1 : 0, h: vis ? ext(0, -1) + ext(0, 1) + 1 : 0,
          nat: i ? (() => { const walk = rs => [...rs].some(c => !c.selectorText ? !!c.cssRules && walk(c.cssRules) : c.style.display === 'none' &&c.selectorText.split(',').some(s => /::-webkit-search-cancel-button\s*$/.test(s) && i.matches(s.replace(/::-webkit-search-cancel-button\s*$/, '')))); /* Chrome's getComputedStyle can't read this pseudo, so: a rule that hides it on this box */
            return [...document.styleSheets].some(s => { try { return walk(s.cssRules); } catch (e) { return false; } }) ? 'none' : 'shown'; })() : '', fh: f ? Math.round(f.getBoundingClientRect().height) : 0, list: L ? L.innerText.replace(/\s+/g, ' ').trim() : ''}; }, [sel, list]);
      const el = xq.locator(sel).filter({visible: true}).first(); await el.scrollIntoViewIfNeeded(); await xq.evaluate(s => { const i = [...document.querySelectorAll(s)].find(e => e.getClientRects().length); scrollTo(0, i.getBoundingClientRect().top + scrollY - 160); }, sel);
      const s0 = await st(); if (touch) await el.tap(); else await el.click(); await xq.keyboard.type('gar', {delay: 20}); await xq.waitForTimeout(700); const s1 = await st();
      if (s1.x) { if (touch) await xq.touchscreen.tap(s1.cx, s1.cy); else await xq.mouse.click(s1.cx, s1.cy); } await xq.waitForTimeout(700); const s2 = await st();
      const bad = [!s0.x || 'shown when empty', s1.x || 'no ×', s1.w >= 44 && s1.h >= 44 || `tap ${s1.w}x${s1.h}`, s1.nat === 'none' || 'browser × too (' + s1.nat + ')', s1.fh === s0.fh || `box ${s0.fh}->${s1.fh}px`, s1.list !== s0.list || 'list ignored typing',
        s2.v === '' || 'not emptied', s2.foc || 'focus lost', !s2.x || '× left after clear', s2.list === s0.list || 'list not back'].filter(z => z !== true);
      xr.push(`${touch ? 390 : 1280} ${prep || r}: ${bad.length ? bad.join(', ') : 'ok ' + s1.w + 'x' + s1.h}`); }
    await xc.close(); }
  ok(xr.every(x => / ok /.test(x)), `X-05 (Nov 18): the site's own × in search boxes (Build around, Cores, Search, Winning Teams, Meta; phone tap and mouse): hidden when empty, a 44px tap, the browser's own × hidden, the box no taller; one tap empties the box, keeps focus (keyboard up) and the list goes back (${xr.join('; ')})`); }
// Audit v199 #5 (Sim, Nov 17, 7:52 PM, option A for both): fill the empty desktop halves from 1100 up; under 1100 the stacked layout stays
{ const bw = []; for (const w of [1024, 1099, 1100, 1150, 1180, 1220, 1280, 1339, 1366, 1440, 1500, 1600, 1920, 2560]) { const q = await b.newPage({viewport: {width: w, height: 900}}); await q.goto('file://' + PAGE + '#battle'); await q.waitForTimeout(1800);
    bw.push(await q.evaluate(w => { const q = s => document.querySelector(s), R = s => q(s).getBoundingClientRect(); if (!q('.bt2.bt-noopp') || !q('.bt-log') || !q('.bt-empty')) return [w, 'no empty Battle'];
      const h1 = q('.bt-head h1'), lines = Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).lineHeight)), body = R('.bt-body'), log = R('.bt-log'), lgl = R('.bt-lgl'), emp = R('.bt-empty'), btn = R('.bt-theirs .bt-acts');
      const fit = document.documentElement.scrollWidth <= innerWidth;
      if (w < 1100) return [w, log.top >= body.bottom ? 'stacked' : 'beside', fit];
      return [w, lines, Math.round(log.left - body.right), Math.round(Math.abs(body.width - log.width)), Math.round(Math.abs(R('.bt-theirs .bt-lab').top - R('.bt-lgl h2').top)), Math.round(Math.abs(body.width - parseFloat(getComputedStyle(q('.bt-body')).paddingRight) - lgl.width)),
        emp.top >= btn.bottom && emp.right <= log.left + 1, getComputedStyle(q('.bt-log')).borderLeftWidth, fit]; }, w)); await q.close(); }
  const bad = bw.filter(x => x[0] < 1100 ? x[1] !== 'stacked' || !x[2] : (([w, l, gap, even, dt, ev, under, rule, fit]) => l !== 2 || gap < 0 || even > 1 || dt > 2 || ev > 2 || !under || rule !== '1px' || !fit)(x));
  ok(!bad.length, `Audit v199 #5 Battle A (Sim, Nov 17): before their six is in, from 1100 up the headline is 2 lines, Their Six | Your Games are two even columns with a thin rule between (headings level), "Everything below..." under Enter, nothing past the edge; under 1100 stacked (${bw.map(x => x[0] + ': ' + x.slice(1).join('/')).join('; ')})`); }
// Sim Q2 A (Nov 17, audit v199 #14): the Ratings / Usage / Popular Sets heroes' share label reads "Of teams" (spoken label keeps the
// base); from 360 up every label keeps one line, so the labels sit level and no fact runs past the hero
{ const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const q = await ctx.newPage(); const res = {};
  for (const w of [360, 375, 390, 412, 420]) { await q.setViewportSize({width: w, height: 844}); for (const r of ['meta', 'usage', 'sets']) { await q.goto('file://' + PAGE + '#' + r); await q.waitForTimeout(1500);
    res[r + '@' + w] = await q.evaluate(() => { const f = document.querySelector('#main .gs-facts'); if (!f) return 'no hero'; const hb = f.closest('.gs-spot').getBoundingClientRect(), rg = document.createRange();
      const ps = [...f.querySelectorAll(':scope > p')].map(p => { const s = [...p.querySelectorAll('span')].find(x => !x.classList.contains('vh')), v = p.querySelector('b'); rg.selectNodeContents(s); const a = rg.getBoundingClientRect(); rg.selectNodeContents(v); const c = rg.getBoundingClientRect();
        return {t: s.textContent.trim(), top: Math.round(s.getBoundingClientRect().top), lines: Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)), right: Math.max(a.right, c.right)}; });
      const share = ps.find(x => /teams/i.test(x.t)), spoken = (f.querySelector('.vh') || {}).textContent || '';
      return share && share.t === 'Of teams' && /of .*teams/.test(spoken) && ps.every(x => x.lines === 1 && x.top === ps[0].top && x.right <= hb.right + 0.5) ? 'ok' : ps.map(x => `${x.t}:${x.lines}L@${x.top}${x.right > hb.right + 0.5 ? ' past the hero' : ''}`).join('/') + (spoken ? '' : ' (no spoken label)'); }); } }
  const bad = Object.entries(res).filter(([, v]) => v !== 'ok');
  ok(!bad.length, `Sim Q2 A (Nov 17): the heroes' share reads "Of teams", every label on one line and level, inside the hero, 360-420 (${bad.length ? bad.slice(0, 4).map(([k, v]) => k + ' ' + v).join('; ') : '15 of 15 ok'})`);
// Sim Q5 B (Nov 17, audit v199 #20): the phone bar's five words sit on one line (the current page's word was 10.8px lower); its
// blue mark stays just above its word, and every tap target stays 44px or taller
  const bar = {}; for (const w of [320, 340, 360, 390, 412, 600, 699]) { await q.setViewportSize({width: w, height: 844}); for (const r of ['battle', 'meta']) { await q.goto('file://' + PAGE + '#' + r); await q.waitForTimeout(900);
    bar[r + '@' + w] = await q.evaluate(() => { const as = [...document.querySelectorAll('.np-bar a')]; if (!as.length || !as[0].getClientRects().length) return 'no bar'; const rg = document.createRange();
      const m = as.map(a => { const t = [...a.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); rg.selectNodeContents(t || a); const tb = rg.getBoundingClientRect(), ab = a.getBoundingClientRect(); return {top: tb.top, bottom: tb.bottom, h: ab.height, cur: a.getAttribute('aria-current') === 'page', at: ab.top}; });
      const c = m.find(x => x.cur), cs = c && getComputedStyle(as[m.indexOf(c)], '::before'), mb = c ? c.at + parseFloat(cs.top) + parseFloat(cs.height) : NaN, spread = Math.max(...m.map(x => x.top)) - Math.min(...m.map(x => x.top));
      return spread < 0.5 && m.every(x => x.h >= 44) && c && mb <= c.top && c.top - mb <= 8 ? 'ok' : `words ${spread.toFixed(1)}px apart, mark gap ${c ? (c.top - mb).toFixed(1) : '-'}, tap ${Math.min(...m.map(x => x.h)).toFixed(0)}px`; }); } }
  const bb = Object.entries(bar).filter(([, v]) => v !== 'ok');
  ok(!bb.length, `Sim Q5 B (Nov 17): the phone bar's five words sit on one line with the mark just above the current one, 320-699 (${bb.length ? bb.slice(0, 3).map(([k, v]) => k + ' ' + v).join('; ') : '14 of 14 ok'})`); await ctx.close(); }
{ /* audit v199 #18 (Sim, Nov 17: Option A): from 700 the Pokémon page's Card sits left of the rating block, forms as even tiles; at 700-819
     the tier word stays on one line and the three numbers keep a clear gap (at 700 'F tier' wrapped and 0.1% 39% 152 nearly touched) */
  const top = async (w, m) => { const q = await b.newPage({viewport: {width: w, height: 1000}}); await q.goto('file://' + PAGE + '#pokemon=' + m); await q.waitForTimeout(2200);
    const r = await q.evaluate(() => { const R = s => { const e = document.querySelector(s); return e && e.getBoundingClientRect(); }, c = R('.pk-card'), s = R('.pk-is'), em = document.querySelector('.pk-rate em');
      const tx = e => { const g = document.createRange(); g.selectNodeContents(e); const a = [...g.getClientRects()]; return {l: Math.min(...a.map(x => x.left)), r: Math.max(...a.map(x => x.right)), n: new Set(a.map(x => Math.round(x.top))).size}; };
      const nb = [...document.querySelectorAll('.pk-n b')].map(tx), fs = document.querySelector('.pk-forms'), fw = [...document.querySelectorAll('.pk-forms a')].map(a => a.getBoundingClientRect());
      return {side: !!(c && s && c.right <= s.left && c.top < s.bottom && s.top < c.bottom), tierLines: em ? tx(em).n : 0, gap: Math.round(Math.min(...nb.slice(1).map((x, i) => x.l - nb[i].r))),
        forms: fw.length, formSpread: fw.length ? Math.round(Math.max(...fw.map(x => x.width)) - Math.min(...fw.map(x => x.width))) : 0, formRows: new Set(fw.map(x => Math.round(x.top))).size, formScroll: fs ? /auto|scroll/.test(getComputedStyle(fs).overflowX) && fs.scrollWidth > fs.clientWidth + 1 : false, /* a sideways scroller with tiles out of view */
        formOut: fs && fw.length ? Math.round(Math.max(...fw.map(x => x.right)) - fs.getBoundingClientRect().right) : 0}; }); /* the slanted tiles' corners may stick out a few px */
    await q.close(); return r; };
  const t768 = await top(768, 'charizard'), t700 = await top(700, 'charizard-mega-y'), t700r = await top(700, 'rotom-wash'), t810 = await top(810, 'dragonite-mega'), t699 = await top(699, 'charizard');
  ok(t768.side && t768.forms === 3 && t768.formSpread <= 2 && t768.formRows === 1 && !t768.formScroll && t768.formOut <= 8, `audit #18 (Nov 17): at 768 the Card sits left of the rating block and the 3 forms are even tiles in one row (${JSON.stringify(t768)})`);
  ok(t700.side && t700.tierLines === 1 && t700.gap >= 12 && t700r.tierLines === 1 && t700r.gap >= 12 && t810.tierLines === 1 && t810.gap >= 12, `audit #18: at 700-819 the tier word is on one line and the three numbers are 12px+ apart (94 S tier ${t700.tierLines} line(s), gap ${t700.gap}; Wash Rotom ${t700r.tierLines}, ${t700r.gap}; 80 A tier at 810 ${t810.tierLines}, ${t810.gap})`);
  ok(t700r.forms === 6 && t700r.formRows === 2 && t700r.formSpread <= 2 && !t700r.formScroll && t700r.formOut <= 8, `audit #18: six forms at 700 sit as 3 + 3 even tiles, nothing hidden off to the side (${JSON.stringify(t700r)})`);
  ok(!t699.side, `audit #18: under 700 (phones) the Card stays above the rating block (${JSON.stringify(t699)})`);
  /* the widest rating ('80 A tier') must fit its column at 700-899 (at 700 the 120 px number ran 58 px past it): every number and tier shown */
  const fit = async w => { const q = await b.newPage({viewport: {width: w, height: 1000}}); await q.goto('file://' + PAGE + '#pokemon=dragonite-mega'); await q.waitForTimeout(2200);
    const r = await q.evaluate(() => { const nb = document.querySelector('.pk-rate>b'), em = document.querySelector('.pk-rate em'), is = document.querySelector('.pk-is'); let worst = -99, wv = '';
      for (const n of ['80', '88', '40', '11', '94']) for (const t of ['A', 'S', 'C', 'F']) { nb.textContent = n; em.textContent = t + ' tier'; const R = is.getBoundingClientRect();
        const o = Math.max(...[...document.querySelectorAll('.pk-rate *')].map(e => e.getBoundingClientRect().right)) - R.right, wide = R.right - document.querySelector('.pk-top').getBoundingClientRect().right;
        if (Math.max(o, wide) > worst) { worst = Math.round(Math.max(o, wide)); wv = n + ' ' + t; } } return {worst, wv}; }); await q.close(); return r; };
  const f700 = await fit(700), f768 = await fit(768), f849 = await fit(849);
  ok(f700.worst <= 0 && f768.worst <= 0 && f849.worst <= 0, `audit #18: the widest rating and tier stay inside the rating column (px past it: 700 ${f700.worst} for ${f700.wv}, 768 ${f768.worst}, 849 ${f849.worst})`); }
{ /* audit v199 #19 (Sim, Nov 17: Option A): under 430 This Week's Most Used is a ranked 5-row list (rank, sprite, name, 'of teams', share right);
     it was 3 + 2 tiles whose slanted plates crossed. No name breaks mid-word at 320. 430 up keeps the strip of five tiles */
  const wk = async w => { const q = await b.newPage({viewport: {width: w, height: 900}}); await q.goto('file://' + PAGE + '#weekly'); await q.waitForTimeout(2000);
    const r = await q.evaluate(() => { const L = [...document.querySelectorAll('.wk-top li')], R = e => e.getBoundingClientRect(), vis = e => !!e && getComputedStyle(e).display !== 'none';
      const broken = []; for (const s of document.querySelectorAll('.wk-top .wk-tm span')) { const tn = s.firstChild; if (!tn || tn.nodeType !== 3) continue; let i = 0;
        for (const wd of tn.data.split(' ')) { const g = document.createRange(); g.setStart(tn, i); g.setEnd(tn, i + wd.length); if (wd && new Set([...g.getClientRects()].map(x => Math.round(x.top))).size > 1) broken.push(wd); i += wd.length + 1; } }
      const tops = new Set(L.map(e => Math.round(R(e).top))).size, lefts = new Set(L.map(e => Math.round(R(e).left))).size;
      const pr = L.map(e => Math.round(R(e).right - R(e.querySelector('.wk-tm b')).right)), rk = L.map(e => vis(e.querySelector('.wk-rk')) ? e.querySelector('.wk-rk').textContent : '').join('');
      return {n: L.length, rows: tops, cols: lefts, ranks: rk, ofTeams: L.filter(e => vis(e.querySelector('.wk-tm small'))).length, shareRight: Math.max(...pr), broken, hs: document.documentElement.scrollWidth - innerWidth}; }); await q.close(); return r; };
  const w390 = await wk(390), w320 = await wk(320), w429 = await wk(429), w430 = await wk(430), w1280 = await wk(1280);
  ok(w390.n === 5 && w390.rows === 5 && w390.cols === 1 && w390.ranks === '12345' && w390.ofTeams === 5 && w390.shareRight <= 4, `audit #19 (Nov 17): at 390 Most Used is a ranked list of 5 rows, 'of teams' under each name, the share on the right (${JSON.stringify(w390)})`);
  ok(w320.rows === 5 && w320.cols === 1 && !w320.broken.length && w320.hs <= 0 && w429.rows === 5 && !w429.broken.length, `audit #19: at 320 and 429 the list holds: 5 rows, no name broken mid-word, no sideways scroll (320 ${JSON.stringify(w320)})`);
  ok(w430.rows === 1 && w430.cols === 5 && !w430.ranks && !w430.ofTeams && w1280.rows === 1 && w1280.cols === 5 && !w1280.ranks, `audit #19: from 430 the five stay one strip of tiles, no ranks or 'of teams' (430 ${JSON.stringify(w430)}, 1280 rows ${w1280.rows})`); }
// The Post Room (#gifts, Nov 18): a test fixture (made-up gifts, set inside the page; post.js is never touched); each check fails on the skeleton page
{ const FX = `{checked: '2026-11-17', news: [], gifts: [{id: 'a', name: 'Training Ticket', amount: 2, how: 'Serial Code', code: 'AB1CD0E', start: '2026-11-01T00:00:00Z', end: '2026-11-22T23:59:00Z'},
    {id: 'b', name: 'Quick Coupons', amount: 100, how: 'Event Gift', start: '2026-11-01T00:00:00Z', end: '2026-12-31T23:59:00Z'}].concat(Array.from({length: 14}, (_, i) => i % 2
    ? {id: 'p' + i, kind: 'pokemon', mon: 'Incineroar', name: 'Incineroar', how: 'Battle Pass', start: '2026-08-01T00:00:00Z', end: '2026-09-0' + (i % 9 + 1) + 'T23:59:00Z'}
    : {id: 'p' + i, kind: 'item', item: 'VP', name: 'VP', amount: 5000, how: 'Serial Code', start: '2026-08-01T00:00:00Z', end: '2026-09-0' + (i % 9 + 1) + 'T23:59:00Z'}))}`;
  const NOW = Date.parse('2026-11-17T17:00:00Z'), redraw = `const n = Date.now; Date.now = () => ${NOW}; try { V2.redraw(); } finally { Date.now = n; }`;
  const q = await b.newPage({viewport: {width: 1280, height: 900}, timezoneId: 'America/New_York'}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#gifts'); await q.waitForTimeout(2500); await q.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => true; });
  const draw = () => q.evaluate(([fx, r]) => window.__ev(`(() => { POST = ${fx}; V2.prUi = {f: 'all', all: false}; ${r} })()`), [FX, redraw]);
  await draw(); await q.waitForTimeout(500);
  const pr = await q.evaluate(() => { const m = document.querySelector('#main'), st = [...m.querySelectorAll('.pr-sw')];
    return {parcels: m.querySelectorAll('.pr-parcel').length, stamps: st.length, more: ((m.querySelector('[data-prmore]') || {}).textContent || '').trim(), rub: [...m.querySelectorAll('.pr-rub')].map(r => (r.className.match(/pr-(soon|plenty)/) || ['', '?'])[1] + ':' + r.textContent.trim()).join(' | '),
      code: (m.querySelector('.pr-parcel .pr-cv') || {}).innerHTML || '', spell: ((m.querySelector('.pr-spell') || {}).textContent || ''), nocode: ((m.querySelector('.pr-none') || {}).textContent || ''), codes: m.querySelectorAll('.pr-parcel .pr-cv').length,
      monBtn: st.filter(x => x.querySelector('button.pr-st[data-v2mon],button.pr-st[data-prset]')).length, itemDiv: st.filter(x => x.querySelector('div.pr-st')).length, cols: new Set(st.map(x => Math.round(x.getBoundingClientRect().left))).size}; });
  ok(pr.parcels === 2 && pr.stamps === 12 && /^Show All 14 Stamps/.test(pr.more), `Post Room: 2 live gifts make 2 parcels, 14 past gifts show 12 stamps and "Show All 14 Stamps" (${pr.parcels} parcels, ${pr.stamps} stamps, "${pr.more}")`);
  ok(pr.cols === 6 && pr.monBtn === 6 && pr.itemDiv === 6, `Post Room: six stamps across at 1280; Pokémon stamps are buttons, item stamps are not (${pr.cols} across, ${pr.monBtn} buttons, ${pr.itemDiv} items)`);
  ok(pr.rub === 'soon:5 days left | plenty:44 days left', `Post Room: days left count from the viewer's local day, red at 7 or fewer, blue above (Nov 17 in New York: ${pr.rub})`);
  ok(pr.code === 'AB<b class="pr-d">1</b>CD<b class="pr-d">0</b>E' && pr.spell === 'A, B, 1, C, D, 0, E', `Post Room: in the code only digits are blue, and screen readers get it spelled (${pr.code} / ${pr.spell})`);
  ok(pr.codes === 1 && /^No code: it waits in your in-game mailbox/.test(pr.nocode), `Post Room: a gift with no code shows no code area and says why (${pr.codes} code areas; "${pr.nocode}")`);
  await q.evaluate(() => document.querySelectorAll('.np-toast').forEach(t => t.remove())); if (await q.$('[data-prcopy]')) await q.click('[data-prcopy]'); await q.waitForTimeout(500);
  const t = await q.evaluate(() => [...document.querySelectorAll('.np-toast')].map(x => x.textContent).join(' | '));
  ok(t === 'Copied AB1CD0E', `Post Room: Copy Code uses the shared copy with its fallback (clipboard blocked) and says "Copied <code>" (${t || 'no toast'})`);
  await q.setViewportSize({width: 390, height: 844}); await q.waitForTimeout(400);
  const vis = () => q.evaluate(() => { const v = [...document.querySelectorAll('#main .pr-sheet > li')].filter(x => x.getClientRects().length); return `${new Set(v.map(x => Math.round(x.getBoundingClientRect().left))).size} across, ${v.length} spaces, ${v.filter(x => x.classList.contains('pr-blank')).length} blank`; });
  const ph = await vis(); ok(ph === '3 across, 12 spaces, 0 blank', `Post Room: three stamps across on a phone, every row full (${ph})`);
  await q.evaluate(r => window.__ev(`(() => { V2.prUi.all = true; ${r} })()`), redraw); await q.waitForTimeout(400);
  const ph2 = await vis(); ok(ph2 === '3 across, 15 spaces, 1 blank', `Post Room: with all 14 stamps on a phone, one blank space finishes the last row (${ph2})`);
  await q.evaluate(() => { localStorage.setItem('np2.theme', 'night'); }); await q.reload(); await q.waitForTimeout(2500); await draw(); await q.waitForTimeout(400);
  const dim = await q.evaluate(() => { const e = document.querySelector('#main .pr-label'); if (!e) return {theme: document.documentElement.dataset.theme, label: 'none'}; const c = getComputedStyle(e).backgroundColor.match(/\d+/g).map(Number), pg = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number), L = a => (a[0] * .3 + a[1] * .59 + a[2] * .11) / 255; return {label: L(c).toFixed(2), page: L(pg).toFixed(2), theme: document.documentElement.dataset.theme}; });
  ok(dim.theme === 'night' && +dim.label > .75 && +dim.page < .2, `Post Room "Dim Paper": at night the page is dark and the label stays paper (lightness label ${dim.label}, page ${dim.page})`);
  await q.evaluate(() => window.__ev(`(() => { POST = {checked: null, news: [], gifts: [{id: 'old', name: 'VP', amount: 10, how: 'Serial Code', start: '2026-01-01T00:00:00Z', end: '2026-02-01T00:00:00Z'}]}; V2.redraw(); })()`)); await q.waitForTimeout(400);
  const em = await q.evaluate(() => { const m = document.querySelector('#main'); return {shelf: ((m.querySelector('.pr-shelf') || {}).textContent || '').replace(/\s+/g, ' ').trim(), stamps: m.querySelectorAll('.pr-sw').length, plate: ((m.querySelector('.pr-stats .ev-pk') || {}).textContent || '')}; });
  ok(/Nothing at the counter right now\.\s*The next gift will wait here\./.test(em.shelf) && em.stamps === 1 && em.plate === 'Nothing live right now', `Post Room empty state: no live gift shows the empty shelf and its line, and the stamp sheet still shows (${JSON.stringify(em)})`);
  await q.close(); }
// Stampede tools band (Nov 18; docs/rebuild/stampede/BRIEF.md section 3): live data, every tool reachable, every row full, nothing spills
{ const q = await b.newPage({viewport: {width: 1440, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const d = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('#main .sdt'); if (!s) return JSON.stringify({none: true});
    const go = [...s.querySelectorAll('.sdt-go')].map(a => [a.dataset.sdtool, a.getAttribute('href')]), more = [...s.querySelectorAll('.sdt-more a')].map(a => [a.dataset.sdtool, a.getAttribute('href')]);
    const want = V2.HOME_TOOLS.map(([n, , to]) => n + '>#' + to).sort().join('|'), got = go.concat(more).map(([n, h]) => n + '>' + h).sort().join('|');
    const R = lairRows().filter(x => x.r.tc), top9 = R.slice(0, 9).map(x => ({n: x.p.n, s: x.p.st[5]})).sort((a, b) => a.s - b.s).map(x => x.n);
    const race = [...s.querySelectorAll('.sdt-run')].map(e => e.dataset.v2mon);
    const TY = [...s.querySelectorAll('.sdt-types li')].map(li => [li.querySelector('.sdt-flag').textContent.trim(), (li.querySelector('[data-v2mon]') || {}).dataset ? li.querySelector('[data-v2mon]').dataset.v2mon : '']);
    const tyOk = TY.length === 18 && TY.every(([t, n]) => (R.find(x => (x.p.t || []).includes(t)) || {p: {}}).p.n === n);
    const pod = [...s.querySelectorAll('.sdt-step')].map(e => [e.className.match(/s(\\d)/)[1], e.querySelector('.sdt-blk b').textContent]);
    const tieOk = pod.length === 3 && pod.every(a => pod.every(b => (a[1] === b[1]) === (a[0] === b[0])));
    const big = [...s.querySelectorAll('.sdt-big b')].map(e => e.textContent.replace(/,/g, ''));
    return JSON.stringify({plates: go.length, toolsOk: want === got, raceOk: race.length === 9 && race.join() === top9.join(), tyOk, tieOk, pod, nums: big.join('/') === META.events.events.length + '/' + RES.teams, big}); })()`));
  const m = JSON.parse(d);
  ok(m.plates === 12 && m.toolsOk, `Stampede tools (Nov 18): twelve plates and a More tools row reach all ${''}18 of today's Home tools, same pages (${m.plates} plates, match ${m.toolsOk})`);
  ok(m.raceOk && m.tyOk, `Stampede tools: Speed Tiers is the nine highest rated by base Speed, and each type flag stands its highest-rated Pokémon (race ${m.raceOk}, types ${m.tyOk})`);
  ok(m.tieOk && m.nums, `Stampede tools: tied ratings share a podium step; Events and How We Calculate show the Events page's count and RES.teams (${JSON.stringify(m.pod)}, ${JSON.stringify(m.big)})`);
  const lay = []; for (const [w, th] of [[320, 'day'], [390, 'night'], [820, 'day'], [1100, 'night'], [1440, 'day']]) { await q.evaluate(t => { try { localStorage.setItem('np2.theme', t); } catch (e) {} }, th); await q.setViewportSize({width: w, height: 900}); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(1800);
    await q.evaluate(() => document.fonts.ready.then(() => 1)); await q.waitForTimeout(200); /* measure in the real fonts: a fallback font is wider (a name 'spilling' under load, Nov 18) */
    lay.push(w + ': ' + await q.evaluate(() => { const s = document.querySelector('#main .sdt'); if (!s) return 'no band'; const out = []; if (document.documentElement.scrollWidth > innerWidth) out.push('sideways');
      for (const e of s.querySelectorAll('.sdt-mn,.sdt-t a,.sdt-d span,.sdt-blk b,.sdt-flag span,.sdt-item,.sdt-big b,.sdt-spe,.sdt-chip')) { if (!e.getClientRects().length) continue; if (parseFloat(getComputedStyle(e).fontSize) < 13) out.push('under 13px');
        const box = (e.closest('.sdt-m') ? e.parentElement : e.closest('.sdt-p')).getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e);
        if ([...rg.getClientRects()].some(r => r.width && (r.left < box.left - 1 || r.right > box.right + 1))) out.push('spills: ' + e.textContent.slice(0, 16)); }
      const g = s.querySelector('.sdt-grid'), gb = g.getBoundingClientRect(), rows = {}; for (const c of g.children) { const r = c.getBoundingClientRect(); (rows[Math.round(r.top / 4)] = rows[Math.round(r.top / 4)] || []).push(r); }
      for (const rs of Object.values(rows)) if (Math.min(...rs.map(r => r.left)) - gb.left > 2 || gb.right - Math.max(...rs.map(r => r.right)) > 2) out.push('row not full');
      return out.length ? out.join(', ') : 'ok'; })); }
  ok(lay.every(x => / ok$/.test(x)), `Stampede tools: at 320 / 390 / 820 / 1100 / 1440 (day and night) no sideways scroll, no text under 13px or out of its spot, every row of plates full (${lay.join(' | ')})`);
  await q.evaluate(() => { try { localStorage.removeItem('np2.theme'); } catch (e) {} }); await q.close(); }
{ /* The Champions Dispatch (#news; Sim, Nov 18, docs/rebuild/dispatch/BRIEF.md). Each check fails on the skeleton page (one h1, no paper). */
  const q = await b.newPage({viewport: {width: 1440, height: 1000}});
  /* a page without the Dispatch (the skeleton) answers with {err}, so each check prints FAIL instead of stopping the run */
  const qe = (f, x) => q.evaluate(f, x).catch(e => ({err: String(e.message).split('\n')[0].slice(0, 80)})), qc = s => q.click(s, {timeout: 3000}).catch(() => {}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#news'); await q.waitForTimeout(2500);
  const d1 = await qe(() => { const a = [...document.querySelectorAll('.dp-paper .dp-hl')]; return {n: a.length, bad: a.filter(x => !x.href || x.target !== '_blank' || !/noopener/.test(x.rel)).length}; });
  ok(d1.n >= 5 && d1.bad === 0, `DP-1: every front-page headline links to its source in a new tab with rel=noopener (${JSON.stringify(d1)})`);
  const d2 = await qe(() => window.__ev(`(() => { const D = V2.dpParts(V2.postNow()), shown = [...document.querySelectorAll('.dp-paper .dp-hl')].map(a => a.textContent.replace(/\\s*\\(opens[^)]*\\)\\s*$/, '').replace(/\\u2060/g, '').trim());
    const maint = shown.filter(t => /^Maintenance( Completion)? Notice$/i.test(t)).length, others = D.all.filter(x => !V2.dpMaint(x)).length;
    const earl = (document.querySelector('[data-dpmore]') || {}).textContent || '', n = +((earl.match(/(\\d[\\d,]*) more stor/) || [])[1] || '-1').replace(/,/g, '');
    return {maint, others, shown: shown.length, all: D.all.length, earlier: n}; })()`));
  ok(d2.others > 0 && d2.maint === 0 && d2.earlier === d2.all - d2.shown, `DP-2: no maintenance notice on the front while other stories exist; Earlier Editions counts every story not on the front (${JSON.stringify(d2)})`);
  const d3 = await qe(() => window.__ev(`(() => { const rows = lairRows().filter(x => x.r && x.r.tc).slice(0, 5).map(x => (lairRank(x.p) || {}).rank + ' ' + x.p.d + ' ' + monRating(x.p).n);
    const seen = [...document.querySelectorAll('.dp-tb .dp-row')].map(r => r.querySelector('.dp-rk1').textContent + ' ' + r.querySelector('.dp-rn').textContent.replace(/\\u00a0/g, ' ') + ' ' + r.querySelector('.dp-rv').textContent);
    const c = homeChamp(), ev = (document.querySelector('.dp-evt') || {}).textContent || '', six = [...document.querySelectorAll('.dp-six [data-v2mon]')].map(x => x.dataset.v2mon).join(',');
    const S = POST.series || [], G = POST.gifts || [], lead = V2.dpParts(V2.postNow()).lead, yr = ((S.find(r => lead && r.src === lead.url) || {}).month || 'none').slice(0, 4);
    const cells = [...document.querySelectorAll('.dp-rd')].map(li => { const m = li.querySelector('[data-v2mon]'); return m ? m.dataset.v2mon : ''; }).join(',');
    return {rows: rows.join('|'), seen: seen.join('|'), ev: ev === V2.evTitle(c.ev.name), six: six === c.t.mons.map(m => m.n).join(','), series: cells, want: S.filter(r => r.month.startsWith(yr)).map(r => r.mon || (G.find(g => g.id === r.gift) || {}).mon || '').join(',')}; })()`));
  ok(!!d3.seen && d3.seen.split('|').length === 5 && d3.rows === d3.seen, `DP-3: The Standings are the Ratings page's top five, shared ranks and shown ratings (${d3.seen})`);
  ok(d3.ev && d3.six, `DP-4: Latest Result is homeChamp(): the same event name and the winner's six (${JSON.stringify({ev: d3.ev, six: d3.six})})`);
  ok(d3.series && d3.series === d3.want, `DP-5: the series row shows each round's gift from POST.series, in order (${d3.series} vs ${d3.want})`);
  const nx = await qe(() => (((document.querySelector('.dp-fix [data-dpcal]') || {}).textContent || '').match(/All (\d+) Next Events/) || [])[1] || 'none');
  await qc('.dp-fix [data-dpcal]'); await q.waitForTimeout(1500);
  const ev = await qe(() => ({hash: location.hash, n: [...document.querySelectorAll('.ev-plate .ev-cal li')].length}));
  ok(ev.hash === '#events' && String(ev.n) === nx, `DP-6: 'All ${nx} Next Events' opens Events with the same ${ev.n} upcoming events listed (${JSON.stringify(ev)})`);
  /* a gift live for five more days (a test POST through the test hook; never in post.js): the coupon, its blue digits and Copy Code with the clipboard blocked */
  await q.goto('file://' + PAGE + '#news'); await q.waitForTimeout(2000);
  const cp = await qe(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => true;
    return window.__ev(`(() => { const keep = POST; window.__dpKeep = keep; POST = {checked: null, gifts: [{name: 'Test Gift', code: 'AB1CD0', how: 'Serial Code', start: new Date(Date.now() - 864e5).toISOString(), end: new Date(Date.now() + 5 * 864e5).toISOString()}],
      news: [{title: 'Test lead', date: new Date(Date.now() - 864e5).toISOString(), type: 'Tournament', url: 'https://example.org/t', end: new Date(Date.now() - 36e5).toISOString()}]}; V2.redraw();
      const c = document.querySelector('.dp-cpn'); return {nums: [...c.querySelectorAll('.pr-cv .pr-d')].map(x => x.textContent).join(''), code: (c.querySelector('.pr-cv') || {}).textContent, said: (c.querySelector('.pr-spell') || {}).textContent, upright: getComputedStyle(c.querySelector('.pr-cv')).fontStyle, bar: !!c.querySelector('.dp-bar2'), btn: (b => b ? [getComputedStyle(b).backgroundColor, getComputedStyle(c).backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(c.closest('.dp-paper')).backgroundColor : getComputedStyle(c).backgroundColor] : null)(c.querySelector('[data-prcopy].np-btn')), left: /5 days left/.test(c.textContent), stamp: !!document.querySelector('.dp-stamp'), post: (document.querySelector('.dp-pk') || {}).textContent || ''}; })()`); });
  await qe(() => document.querySelectorAll('.np-toast').forEach(t => t.remove())); await qc('.dp-cpn [data-prcopy]'); await q.waitForTimeout(500);
  const toast = await qe(() => [...document.querySelectorAll('.np-toast')].map(t => t.textContent).join(''));
  ok(cp.nums === '10' && cp.code === 'AB1CD0' && cp.left && /1 gift waiting/.test(cp.post), `DP-7: the coupon shows the live gift's code as text, digits blue, days left, and In the Post counts it (${JSON.stringify(cp)})`);
  ok(cp.said === 'A, B, 1, C, D, 0' && cp.upright === 'normal' && !cp.bar && !!cp.btn && cp.btn[0] !== 'rgb(255, 255, 255)' && cp.btn[0] !== cp.btn[1], `DP-7b (Nov 18): the coupon uses the Post Room's code (upright, spelled for screen readers) and its ink Copy Code button straight on the coupon, not a white box in a black bar (${JSON.stringify({said: cp.said, upright: cp.upright, bar: cp.bar, btn: cp.btn})})`);
  ok(cp.stamp, 'DP-8: an ended lead story carries the Ended stamp');
  ok(/copied/i.test(toast), `DP-9: Copy Code copies through the fallback when the clipboard API is blocked (toast: ${toast})`);
  await qe(() => window.__ev('POST = window.__dpKeep; V2.redraw()'));
  /* Lamplight and day: the paper stays cream and every text on it reads at 4.5:1 or better (WCAG AA), on its own background */
  for (const th of ['day', 'night']) { await qe(t => { localStorage.setItem('np2.theme', t); }, th); await q.reload(); await q.waitForTimeout(2200);
    const k = await qe(() => { const rgb = s => (s.match(/[\d.]+/g) || []).map(Number), L = c => { const v = c.slice(0, 3).map(x => x / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
      const paper = rgb(getComputedStyle(document.querySelector('.dp-paper')).backgroundColor.replace(/.*,\s*(rgb[^)]*\))\s*$/, '$1')), bgOf = e => { for (let a = e; a; a = a.parentElement) { const s = getComputedStyle(a); const c = rgb(s.backgroundColor); if (a.classList.contains('dp-paper')) return rgb(s.backgroundColor.match(/rgb\([^)]*\)\s*$/) ? s.backgroundColor.match(/rgb\([^)]*\)\s*$/)[0] : s.backgroundColor); if (c.length >= 3 && (c.length === 3 || c[3] > .5)) return c; } return [255, 255, 255]; };
      let worst = 99, at = ''; for (const e of document.querySelectorAll('.dp-paper *')) { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; if (e.closest('.vh,[aria-hidden="true"]') || !e.getClientRects().length) continue;
        const f = rgb(getComputedStyle(e).color), g = bgOf(e), a = L(f), z = L(g), r = (Math.max(a, z) + .05) / (Math.min(a, z) + .05); if (r < worst) { worst = Math.round(r * 100) / 100; at = e.className + ' "' + e.textContent.trim().slice(0, 20) + '"'; } }
      return {paperL: Math.round(L(paper) * 100) / 100, worst, at}; });
    ok(k.paperL > .6 && k.worst >= 4.5, `DP-10 (${th}): the paper stays light (luminance ${k.paperL}) and its least-contrast text is ${k.worst}:1 (${k.at})`); }
  await qe(() => localStorage.setItem('np2.theme', 'day'));
  /* every width: no sideways scroll, the name inside the paper, nothing sticking out of the paper */
  const out = []; for (const w of [320, 412, 768, 1100, 1366, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(400);
    const m = await qe(() => { const p = document.querySelector('.dp-paper').getBoundingClientRect(), h = document.querySelector('.dp-name'); let spill = 0, what = '';
      for (const e of document.querySelectorAll('.dp-paper *')) { const r = e.getBoundingClientRect(); if (!r.width || e.closest('.vh')) continue; const o = Math.max(p.left - r.left, r.right - p.right); if (o > spill + .5) { spill = Math.round(o); what = e.className; } }
      return {hs: document.documentElement.scrollWidth - innerWidth, name: h.scrollWidth - h.clientWidth, spill, what}; });
    if (m.err || m.hs > 0 || m.name > 0 || m.spill > 0) out.push(w + ':' + JSON.stringify(m)); }
  ok(!out.length, `DP-11: 320 to 2560 wide: no sideways scroll, the name fits, nothing spills out of the paper (${out.join(' ') || 'all clean'})`);
  /* the piece for Home's post band */
  const sm = await qe(() => window.__ev(`(() => { const d = document.createElement('div'); d.style.width = '340px'; d.innerHTML = V2.dpFront(V2.postNow(), {compact: true}); document.querySelector('#main').append(d);
    const p = d.querySelector('.dp-small'), r = p ? p.getBoundingClientRect() : null, o = p ? Math.max(...[...p.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - r.right : 99;
    const res = {small: !!p, lead: !!(p && p.querySelector('.dp-lh .dp-hl[href]')), bar: !!(p && p.querySelector('.dp-nbar')), more: p ? [...p.querySelectorAll('.dp-more li')].filter(li => li.getClientRects().length).length : 0, over: Math.round(o)}; d.remove(); return res; })()`));
  ok(sm.small && sm.lead && sm.bar && sm.more === 2 && sm.over <= 0, `DP-12: V2.dpFront(post, {compact: true}) draws the small paper (lead link, two more stories in a 340 slot, Next event bar, nothing out of it) (${JSON.stringify(sm)})`);
  await q.close(); }
// ---------- Home, The Stampede: the hero band (Nov 18; app/src/v2/pages/stampede-hero.js, css/sd-hero.css, sd-shared.css) ----------
{ const hero = async (w, h, o = {}) => { const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: w < 700, reducedMotion: o.rm || "no-preference"}); const q = await ctx.newPage();
    await q.addInitScript(e => { window.__PL_TEST = 1; if (e) try { localStorage.clear(); } catch (x) {} }, !!o.empty); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
    if (o.empty) await q.evaluate(() => window.__ev(`(() => { S.slots = S.slots.map(() => blank()); render(); })()`)); if (o.night) await q.evaluate(() => V2.setTheme('night'));
    if (o.wait) await q.waitForFunction(() => document.querySelectorAll('#main .sdh-c').length > 0, null, {timeout: 20000}).catch(() => {}); await q.waitForTimeout(400);
    const r = await q.evaluate(o.fn || (() => { const g = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const x = e.getBoundingClientRect(); return {t: Math.round(x.top), b: Math.round(x.bottom), l: Math.round(x.left), r: Math.round(x.right)}; };
      const bar = document.querySelector('.np-bar'), fold = bar && getComputedStyle(bar).position === 'fixed' ? bar.getBoundingClientRect().top : innerHeight;
      return {b1: g('#main .sdh-b1'), b2: g('#main .sdh-b2'), fold: Math.round(fold), first: (document.querySelector('#main .sdh-go a') || {}).textContent || '', hs: document.documentElement.scrollWidth - innerWidth}; }));
    await ctx.close(); return r; };
  // 1. the tagline is the page's one h1, the named Pokémon are buttons that open their page, the crowd is hidden from screen readers
  const a = await hero(1440, 900, {wait: true, fn: () => { const h1 = [...document.querySelectorAll('#main h1')].map(e => e.textContent.replace(/\s+/g, ' ').trim());
    const named = [...document.querySelectorAll('#main .sdh-plate, #main .sdh-tag:not([hidden]), #main .sdh-tick li:not([hidden]) button')].filter(e => e.getClientRects().length);
    const bad = named.filter(e => e.tagName !== 'BUTTON' || !e.dataset.v2mon || !e.getAttribute('aria-label').startsWith(e.innerText.replace(/\s+/g, ' ').trim())).map(e => e.innerText);
    const deco = [...document.querySelectorAll('#main .sdh-crowd, #main .sdh-f, #main .sdh-m, #main .sdh-lines')].filter(e => e.getAttribute('aria-hidden') !== 'true').length;
    return {h1, named: named.length, bad, deco, plates: document.querySelectorAll('#main .sdh-plate').length}; }});
  ok(a.h1.length === 1 && a.h1[0] === 'Sharply raise your win rate.' && a.plates === 4 && a.named >= 8 && !a.bad.length && !a.deco, `Stampede hero 1: one h1 "Sharply raise your win rate.", four plates, every named Pokémon a button whose spoken name starts with its words, the herd aria-hidden (${JSON.stringify(a)})`);
  // 2. every Pokémon the Ratings page rates is in the herd, the line says that number, and sizes follow ratings (the ones with tournament
  //    results: a lower rating never stands larger; the rest stand at the back, smaller than all of them)
  for (const [w, h] of [[1440, 900], [390, 844]]) { const c = await hero(w, h, {wait: true, fn: () => window.__ev(`(() => { const D = V2.sdData(), H = D.herd || [], sz = e => e.getBoundingClientRect().width;
    const shown = [...document.querySelectorAll('#main .sdh-f, #main .sdh-m, #main .sdh-c')].filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none' && !e.hidden);
    const box = e => e.classList.contains('sdh-f') ? e.firstElementChild : e, byN = new Map(); for (const e of shown) { const n = e.dataset.v2mon || (H[+e.dataset.sdhi] || {}).n; if (n && !byN.has(n)) byN.set(n, sz(box(e))); }
    const tc = H.filter(x => x.tc), bad = []; for (let i = 0; i < tc.length; i++) for (let j = i + 1; j < tc.length; j++) if (tc[j].r < tc[i].r && byN.get(tc[j].n) > byN.get(tc[i].n) + 1) { bad.push(tc[j].n + '>' + tc[i].n); if (bad.length > 3) break; }
    const minTc = Math.min(...tc.map(x => byN.get(x.n) || 0)), back = H.filter(x => !x.tc).filter(x => byN.get(x.n) > minTc + 1).length;
    return {herd: H.length, drawn: byN.size, missing: H.filter(x => !byN.has(x.n)).map(x => x.n).slice(0, 4), bad, back, said: (document.querySelector('#main .sdh-say') || {}).textContent || ''}; })()`)});
    ok(c.herd >= 300 && c.drawn === c.herd && !c.missing.length && !c.bad.length && !c.back && c.said.includes('Every one of the ' + c.herd.toLocaleString('en-US') + ' Pokémon'), `Stampede hero 2 (${w}): all ${c.herd} rated Pokémon drawn, the line says ${c.herd}, no lower rating larger than a higher one (${JSON.stringify(c).slice(0, 300)})`); }
  { const q = await b.newPage({viewport: {width: 1280, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#meta'); await q.waitForTimeout(2500);
    const lg = await q.evaluate(() => ((document.querySelector('.ra-legend') || {}).textContent || '').match(/(\d[\d,]*) rated/)); const nh = await q.evaluate(() => window.__ev('(V2.sdData().herd || []).length')); await q.close();
    ok(lg && +lg[1].replace(/,/g, '') === nh, `Stampede hero 2b: the herd holds as many Pokémon as the Ratings page rates (${lg && lg[1]} vs ${nh})`); }
  // 3. the buttons: today's Home order (HOME-06) and on the first screen (above the phone tab bar) at the sizes Sim checks
  const full = await hero(1440, 900), none = await hero(1440, 900, {empty: true});
  ok(/Score My Team/.test(full.first) && /Build Me a Team/.test(none.first), `Stampede hero 3 (HOME-06): Score My Team first with a team (${full.first}), Build Me a Team first with none (${none.first})`);
  const fold = []; for (const [w, h] of [[390, 844], [390, 664], [375, 667], [1280, 800], [1366, 768], [1440, 900], [1920, 1080]]) { const r = await hero(w, h); if (!r.b1 || !r.b2 || Math.max(r.b1.b, r.b2.b) > r.fold || r.b1.t < 0) fold.push(`${w}x${h}: ${JSON.stringify(r)}`); }
  ok(!fold.length, `Stampede hero 3b: both start buttons are on the first screen at 390x844, 390x664, 375x667, 1280x800, 1366x768, 1440x900, 1920x1080${fold.length ? ': ' + fold.join(' | ') : ''}`);
  // 4. the crowd comes after the first screen: the first draw holds about 12 pictures; the crowd arrives later
  const d = await hero(1440, 900, {fn: () => ({html: (V2.sdHero().match(/<img/g) || []).length, crowdInHtml: /sdh-c\b/.test(V2.sdHero())})});
  ok(d.html > 0 && d.html <= 16 && !d.crowdInHtml, `Stampede hero 4: the first draw asks for ${d.html} pictures, none from the crowd (it is added once the first screen's own pictures are in)`);
  // 5. every width: no sideways scroll; the ticker shows whole names inside the window, and what it hides can't take focus
  const wd = []; for (const w of [320, 340, 360, 390, 412, 600, 768, 820, 900, 1024, 1100, 1180, 1366, 1500, 1920, 2560]) { const r = await hero(w, 900, {rm: 'reduce', fn: () => { const L = [...document.querySelectorAll('#main .sdh-tick li')];
      const vis = L.filter(l => l.getClientRects().length && !l.hidden), cut = vis.filter(l => { const x = l.getBoundingClientRect(); return x.left < 0 || x.right > innerWidth; }).map(l => l.innerText);
      return {hs: document.documentElement.scrollWidth - innerWidth, vis: vis.length, cut, hiddenFocusable: L.filter(l => l.hidden && l.getClientRects().length).length}; }});
    if (r.hs > 0 || !r.vis || r.cut.length || r.hiddenFocusable) wd.push(w + ': ' + JSON.stringify(r)); }
  ok(!wd.length, `Stampede hero 5 (reduced motion: the still strip): 320-2560 (odd widths too) no sideways scroll, the ticker shows whole names only${wd.length ? ': ' + wd.join(' | ') : ''}`);
  // 6. contrast from the tokens (both themes): white on the hero blue and the red 4.5:1+, the tagline's second line and the ticker numbers 3:1+ (display / 24px+ bold)
  for (const night of [false, true]) { const c = await hero(1440, 900, {night, fn: () => { const v = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      const L = hx => { const m = hx.replace('#', ''), c = [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
      const cr = (a, b) => { const x = L(v(a)), y = L(v(b)); return +((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2); };
      return {hero: cr('--sd-on-band', '--sd-hero'), line2: cr('--sd-line2', '--sd-hero'), flag: cr('--sd-on-band', '--sd-flag'), num: cr('--sd-flag-num', '--sd-flag'), link: cr('--sd-link', '--sd-ink'), plate: cr('--sd-plate-num', '--sd-plate'), tick: (t => t ? parseFloat(getComputedStyle(t).fontSize) : 0)(document.querySelector('#main .sdh-tick button'))}; }});
    ok(c.hero >= 4.5 && c.flag >= 4.5 && c.link >= 4.5 && c.plate >= 4.5 && c.line2 >= 3 && c.num >= 3 && c.tick >= 24, `Stampede hero 6 (${night ? 'night' : 'day'}): contrast white on blue ${c.hero}, on red ${c.flag}, link ${c.link}, plate number ${c.plate} (4.5+); second line ${c.line2}, ticker numbers ${c.num} at ${c.tick}px (3+ at 24px+)`); } }
/* Home, The Stampede: motion (Nov 18; css/sd-motion.css, V2.sdhTick in stampede-hero.js). A watcher records, every frame from the first
   draw for 1.5 s, every animation or transition running inside the hero, so a surge, a marquee or a stray transition is caught. */
{ const watch = async (w, h, rm, after) => { const ctx = await b.newContext({viewport: {width: w, height: h}, isMobile: w < 700, hasTouch: w < 700, reducedMotion: rm}); const q = await ctx.newPage();
    await q.addInitScript(() => { window.__PL_TEST = 1; window.NP_SD_MOTION = 1; /* motion is off until Sim's yes; the checks turn it on */ const seen = window.__sdhSeen = {n: 0, names: {}, ends: 0, first: ''}; const t0 = performance.now();
      const tick = () => { const S = document.querySelector('#main .sdh'); if (S) { if (!seen.first) seen.first = S.className; for (const a of S.getAnimations({subtree: true})) if (a.playState === 'running') { seen.n++; const nm = a.animationName || a.transitionProperty || 'anim'; seen.names[nm] = 1;
        if (a.animationName && a.animationName.startsWith('sdh-surge')) { const t = a.effect.getComputedTiming(); seen.ends = Math.max(seen.ends, t.endTime); } } } if (performance.now() - t0 < 6000) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); });
    await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500); const r = await q.evaluate(after); await ctx.close(); return r; };
  const still = () => { const S = document.querySelector('#main .sdh'), t = S.querySelector('.sdh-tick'); return {seen: window.__sdhSeen, running: S.getAnimations({subtree: true}).filter(a => a.playState === 'running').length, trk: !!S.querySelector('.sdh-trk'), pz: !!S.querySelector('.sdh-tpz'), uls: t ? t.querySelectorAll('ul').length : 0}; };
  // 1. reduced motion: nothing in the hero runs an animation or transition at any moment from the first draw, no marquee copy, no pause button
  for (const [w, h] of [[1440, 900], [390, 844]]) { const r = await watch(w, h, 'reduce', still);
    ok(r.seen.first && !r.seen.n && !r.running && !r.trk && !r.pz && r.uls === 1, `Stampede motion 1 (${w}, reduced motion): no animation or transition runs in the hero from the first draw (${Object.keys(r.seen.names).join(',') || 'none'}), the ticker stays the one still list (${JSON.stringify({n: r.seen.n, trk: r.trk, pz: r.pz, uls: r.uls})})`); }
  // 2. motion on: the surge plays on the first draw (front row and herd), is over by 900ms, and never touches the buttons; a redraw does not replay it
  const m = await watch(1440, 900, 'no-preference', () => window.__ev(`(() => { const S = document.querySelector('#main .sdh'), seen = window.__sdhSeen; const go = [...S.querySelectorAll('.sdh-go a, .sdh-plate')].some(e => e.getAnimations().length || getComputedStyle(e).animationName !== 'none');
    V2.redraw(); const S2 = document.querySelector('#main .sdh'); return JSON.stringify({first: seen.first, names: Object.keys(seen.names).sort().join(','), ends: Math.round(seen.ends), go, again: S2.classList.contains('sdh-surge')}); })()`)).then(x => JSON.parse(x));
  ok(/sdh-surge/.test(m.first) && /sdh-surge,sdh-surge-m/.test(m.names) && m.ends > 0 && m.ends <= 900 && !m.go && !m.again, `Stampede motion 2: the surge runs once on arrival (${m.names}), ends by ${m.ends}ms (900 at most), the buttons and plates never move, a redraw does not replay it (${JSON.stringify(m)})`);
  // 3. the ticker: list + aria-hidden copy (buttons out of the tab order) moving as one track, seamless (the copy matches), a pause button 44px+ that pauses it
  for (const [w, h] of [[1440, 900], [390, 844], [320, 700], [2560, 1200]]) { const t = await watch(w, h, 'no-preference', async () => { const tk = document.querySelector('#main .sdh-tick'), U = [...tk.querySelectorAll('.sdh-trk ul')], tr = tk.querySelector('.sdh-trk'), pz = tk.querySelector('.sdh-tpz');
      const names = u => [...u.children].filter(l => !l.hidden).map(l => l.innerText.replace(/\s+/g, ' ')).join('|'), pr = pz ? pz.getBoundingClientRect() : {};
      const res = {uls: U.length, same: U.length === 2 && names(U[0]) === names(U[1]) && Math.abs(U[0].offsetWidth - U[1].offsetWidth) < 1 && Math.abs(tr.scrollWidth - 2 * U[0].offsetWidth) < 2, hid: U[1] && U[1].getAttribute('aria-hidden') === 'true' && [...U[1].querySelectorAll('button')].every(x => x.tabIndex === -1), anim: tr ? getComputedStyle(tr).animationName : '',
        pz: pz ? Math.round(Math.min(pr.width, pr.height)) : 0, inWin: pz ? pr.left >= 0 && pr.right <= innerWidth : false, label: pz && pz.getAttribute('aria-label'), hs: document.documentElement.scrollWidth - innerWidth};
      if (!tr || !pz) return res; tk.scrollIntoView({block: 'center'}); await new Promise(r => setTimeout(r, 300)); pz.click(); await new Promise(r => setTimeout(r, 100)); const a = tr.getAnimations()[0]; const x0 = getComputedStyle(tr).transform; await new Promise(r => setTimeout(r, 400));
      res.paused = pz.getAttribute('aria-pressed') === 'true' && a && a.playState === 'paused' && getComputedStyle(tr).transform === x0; pz.click(); await new Promise(r => setTimeout(r, 400)); res.resumed = a.playState === 'running' && getComputedStyle(tr).transform !== x0; return res; });
    ok(t.uls === 2 && t.same && t.hid && t.anim === 'sdh-mq' && t.pz >= 44 && t.inWin && t.paused && t.resumed && t.hs <= 0, `Stampede motion 3 (${w}): the ticker scrolls as list + matching aria-hidden copy (copy buttons tabindex -1), the ${t.pz}px pause button (${t.label}) pauses and restarts it, no sideways scroll (${JSON.stringify(t)})`); }
  // 4. a keyboard user: tabbing into the ticker stops it at its start, so the focused name is on screen
  const k = await (async () => {
    const ctx = await b.newContext({viewport: {width: 1440, height: 900}}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; window.NP_SD_MOTION = 1; }); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
    await q.evaluate(() => document.querySelector('#main .sdh-tick').scrollIntoView({block: 'center'})); await q.waitForTimeout(1500); await q.focus('#main .sdh-go a:last-child'); await q.keyboard.press('Tab'); await q.waitForTimeout(200);
    const r = await q.evaluate(() => { const a = document.activeElement, x = a.getBoundingClientRect(); return {inTick: !!a.closest('.sdh-trk ul:not([aria-hidden])'), tf: (t => t ? getComputedStyle(t).transform : 'no track')(document.querySelector('#main .sdh-trk')), on: x.left >= 0 && x.right <= innerWidth}; }); await ctx.close(); return r; })();
  ok(k.inTick && k.tf === 'none' && k.on, `Stampede motion 4: Tab from the start buttons lands on the ticker's first name, the ticker stops at its start and the name is on screen (${JSON.stringify(k)})`); }
/* Home, The Stampede, band 2 "Call six out of the herd" (Nov 18; stampede-six.js): live data, word list, the old Home's features, fit */
{ const q = await (await b.newContext({viewport: {width: 1440, height: 900}})).newPage(); /* a fresh visitor: the sample team */ await q.addInitScript(() => { window.__PL_TEST = 1; }); await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const set = t => q.evaluate(t => window.__ev(`(() => { S.slots = ${JSON.stringify(t)}.map(n => ({n, a: null, lock: false})); S.loadedId = null; V2.redraw(); V2.sdSixAfter && V2.sdSixAfter(); return 1; })()`), t);
  const six = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('.sds'); if (!s) return 'no band'; const ms = members(), G = CH.gradeOf(prepOf(ms), proChecks(ms, true), ms);
    return JSON.stringify({named: [...s.querySelectorAll('.sds-rings .sds-slot.on')].length, eye: s.querySelector('.sds-k').innerText, note: !!s.querySelector('.sds-note'), n: (s.querySelector('.sds-n') || {}).textContent, want: String(Math.round(G.s)), w: (s.querySelector('.sds-w .u') || {}).textContent, wantW: CH.wordOf(G.s),
      bands: [...s.querySelectorAll('.sds-b span')].map(x => x.textContent).join('|'), plan: (s.querySelector('.sds-plan') || {}).innerText || '', them: s.querySelectorAll('.sds-tk.them').length, you: s.querySelectorAll('.sds-tk.you').length, prep: !!s.querySelector('[data-hmprep][data-sdgo]'), imp: !!s.querySelector('[data-v2homeimport]'), arrows: s.querySelectorAll('.sds-arw .ln').length}); })()`)).then(x => { try { return JSON.parse(x); } catch (e) { return {err: x}; } });
  ok(six.named === 6 && /Sun Tailwind \(sample\) · Sun team/.test(six.eye) && six.note, `Stampede six (Nov 18): the sample six fills six rings, its eyebrow names it with its weather word, and the sample note shows (${JSON.stringify([six.named, six.eye, six.note])})`);
  ok(/^\d+$/.test(six.n || '') && six.n === six.want && !!six.w && six.w === six.wantW, `Stampede six: the receipt shows the team's real Strength Score and band word (${six.n} ${six.w}; live ${six.want} ${six.wantW})`);
  ok(six.bands === 'Missing a basic|Needs work|Solid|Tournament ready|Top tier', `Stampede six: the band strip uses the word list, low to high (${six.bands})`);
  ok(/^Game Plan vs the Champion's six: lead .+ \+ .+, back .+ \+ .+, bench .+ \+ .+\.$/.test(String(six.plan || '').replace(/\s+/g, ' ').trim()) && six.them === 2 && six.you === 2 && six.prep && six.imp, `Stampede six: the plan board has two leads a side, the lead/back/bench line, Battle sets the Champion as opponent, Import is there (${String(six.plan || '').slice(0, 60)}; ${six.them}/${six.you})`);
  ok(six.arrows >= 1, `Stampede six: the board draws at least one turn 1 arrow from the real plan (${six.arrows})`);
  // baseline: the three parts end within 32px of each other on desktop (the receipt is tilted 2 degrees)
  const bl = await q.evaluate(() => { const y = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : null; }; return [y('.sds-acts'), y('.sds-rc'), y('.sds-bt')]; });
  ok(bl.every(v => v != null) && Math.max(...bl) - Math.min(...bl) <= 32, `Stampede six: at 1440 the line-up, receipt and plan board end on one baseline (bottoms ${bl.join(', ')})`);
  // no team: the three most used by tournament share (the Ratings page's numbers), open rings for slots 1, 3, 5, and "?"
  await set(['', '', '', '', '', '']); await q.waitForTimeout(500);
  const em = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('.sds'), top = lairRows().map(x => ({n: x.p.n, u: V2.raNums(x.p).u})).filter(x => x.u != null && lairHead(byName.get(x.n)).tOK).sort((a, b) => b.u - a.u).slice(0, 3);
    return JSON.stringify({shown: [...s.querySelectorAll('.sds-slot.on .sds-nm')].map(e => e.dataset.v2mon).sort().join(), want: top.map(x => x.n).sort().join(), u: [...s.querySelectorAll('.sds-u b')].map(e => e.textContent).sort().join(), wantU: top.map(x => V2.raPct(x.u)).sort().join(),
      add: [...s.querySelectorAll('[data-v2addto]')].map(e => e.dataset.v2addto + ':' + e.getAttribute('aria-label')).join('|'), q: (s.querySelector('.sds-q') || {}).textContent}); })()`)).then(x => JSON.parse(x));
  ok(em.shown === em.want && em.u === em.wantU, `Stampede six: with no team, the three rings show the three most used by tournament share with the Ratings page's numbers (${em.shown} ${em.u}; live ${em.want} ${em.wantU})`);
  ok(em.add === '0:Add a Pokémon to slot 1|2:Add a Pokémon to slot 3|4:Add a Pokémon to slot 5' && em.q === '?', `Stampede six: with no team, the open rings add to their own slots and the receipt shows "?" (${em.add}; ${em.q})`);
  // long names fit at 320 and 1100, never under 13px (Sim, Nov 18: Mega Crabominable, Squawkabilly (Yellow), Paldean Tauros (Combat))
  await set(['Crabominable-Mega', 'Squawkabilly-Yellow', 'Tauros-Paldea-Combat', 'Charizard-Mega-Y', 'Basculegion', 'Indeedee-F']);
  for (const w of [320, 390, 1100, 1440]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(500); await q.evaluate(() => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))); await q.evaluate(() => window.V2.sdSixAfter()); /* fit after the fonts and the resize's own redraw (a name read as 'out' under load, Nov 18) */
    const f = await q.evaluate(() => { const bad = []; document.querySelectorAll('.sds .sds-nm, .sds .sds-sub, .sds .sds-tg').forEach(e => { if (!e.getClientRects().length) return; const box = e.closest('.sds-cap') || e.closest('.sds-board'), br = box.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e);
        if ([...rg.getClientRects()].some(r => r.width && (r.left < br.left - 1 || r.right > br.right + 1))) bad.push(e.textContent.trim() + ' out'); if (parseFloat(getComputedStyle(e).fontSize) < 13) bad.push(e.textContent.trim() + ' under 13px'); });
      return {bad, sw: document.documentElement.scrollWidth, vw: innerWidth}; });
    ok(!f.bad.length && f.sw <= f.vw, `Stampede six: at ${w} every name and item stays in its spot at 13px or more, no sideways scroll (${f.bad.slice(0, 3).join('; ') || 'all in'}; ${f.sw}/${f.vw})`); }
  await q.close(); }
/* Home, The Stampede, band 4 "The post is in." (Nov 18; stampede-post.js, css/sd-post.css): the Post Room's and the Dispatch's own pieces
   with live POST data, empty states, the Pelipper clear of every word, widths, sizes, taps, contrast. Each check fails on the placeholder band. */
{ const q = await b.newPage({viewport: {width: 1440, height: 900}}); await q.addInitScript(() => { window.__PL_TEST = 1; });
  const qe = (f, x) => q.evaluate(f, x).catch(e => ({err: String(e.message).split('\n')[0].slice(0, 80)}));
  const ev = s => qe(x => window.__ev(x), s).then(x => { try { return typeof x === 'string' ? JSON.parse(x) : x; } catch (e) { return {err: String(x).slice(0, 80)}; } });
  await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500);
  const d = await ev(`(() => { const s = document.querySelector('.sdp'); if (!s) return JSON.stringify({none: true}); const P = V2.postNow(), live = P.live.map(V2.prG), past = P.past.map(V2.prG);
    const first = live.find(g => g.code) || live[0], next = live.find(g => g !== first && g.code), A = [...s.querySelectorAll('.sdp-all')].map(a => a.getAttribute('href') + ' ' + a.textContent.trim());
    return JSON.stringify({h2: (s.querySelector('h2') || {}).textContent, parcel: (s.querySelector('.sdp-gifts .pr-parcel.pr-cpt .pr-what dd') || {}).textContent, want: first && first.name, rub: !!s.querySelector('.sdp-gifts .pr-parcel .pr-rub'),
      stamps: [...s.querySelectorAll('.sdp-stamps .pr-sw .pr-nm')].map(e => e.textContent).join('|'), wantSt: past.slice(0, 4).map(g => g.name).join('|'),
      slip: (s.querySelector('.sdp-slip .pr-cv') || {}).textContent, wantSlip: next && next.code, slipBtn: (s.querySelector('.sdp-slip [data-prcopy]') || {}).dataset?.prcopy,
      links: A.join(' | '), wantLinks: '#gifts All ' + (live.length + past.length) + ' Gifts › | #news All ' + P.news.length + ' Stories ›', paper: !!s.querySelector('.sdp-news .dp-paper.dp-small'),
      bird: !!s.querySelector('.sdp-bird[aria-hidden="true"] .np-mon img'), copies: document.querySelectorAll('.sdp .pr-label').length + '/' + document.querySelectorAll('.sdp .dp-paper').length}); })()`);
  ok(d.h2 === 'The post is in.' && d.parcel && d.parcel === d.want && d.rub && d.paper && d.bird, `SDP-1: the post band: h2 "The post is in.", the Post Room's compact parcel for the first live gift with its days-left stamp, the Dispatch's small paper, a decorative Pelipper sprite (${JSON.stringify({h2: d.h2, parcel: d.parcel, want: d.want, rub: d.rub, paper: d.paper, bird: d.bird})})`);
  ok(!!d.stamps && d.stamps === d.wantSt && d.slip === d.wantSlip && d.slipBtn === d.wantSlip && d.links === d.wantLinks && d.copies === '1/1', `SDP-2: live POST data: the four newest past-gift stamps, the next live code on its slip with Copy Code, "All N Gifts" (live + past) and "All N Stories"; one parcel label and one paper, no copies (${JSON.stringify(d).slice(0, 420)})`);
  /* the Pelipper (its visible middle: the picture box less 15% each side) covers no word of the tools band or the post band's heading and line */
  const fly = []; for (const w of [2560, 1920, 1440, 1366, 1100, 820, 520, 390, 360, 320]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(500);
    const r = await qe(() => { const im = document.querySelector('.sdp-bird img'); if (!im) return 'no bird'; const a = im.getBoundingClientRect(), k = .15, B = {l: a.left + a.width * k, r: a.right - a.width * k, t: a.top + a.height * k, b: a.bottom - a.height * k}, hit = [];
      for (const e of document.querySelectorAll('.sd-tools *, .sdp-top h2, .sdp-top p, .sdp-ch *')) { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || !e.getClientRects().length) continue; const rg = document.createRange(); rg.selectNodeContents(e);
        for (const x of rg.getClientRects()) if (x.width && x.right > B.l && x.left < B.r && x.bottom > B.t && x.top < B.b) { hit.push(e.textContent.trim().slice(0, 16)); break; } }
      const band = document.querySelector('.sdp').getBoundingClientRect(); return {hit, over: Math.round(band.top - B.t)}; });
    if (typeof r === 'string' || r.err || r.hit.length || r.over < 16) fly.push(w + ':' + JSON.stringify(r)); }
  ok(!fly.length, `SDP-3: the Pelipper flies in over the band's top edge (16px or more above it) and covers no text, 320 to 2560 (${fly.join(' ') || 'clear'})`);
  /* the columns: side by side and ending level on desktop; gifts above news on phones; 4 stamps on desktop, 3 on phones */
  const lay = []; for (const w of [2560, 1920, 1440, 1366, 1100, 390, 360]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(500);
    lay.push(w + ':' + await qe(() => { const g = document.querySelector('.sdp-gifts'), n = document.querySelector('.sdp-news'); if (!g || !n) return 'missing'; const a = g.getBoundingClientRect(), z = n.getBoundingClientRect();
      const st = [...document.querySelectorAll('.sdp-stamps .pr-sw')].filter(e => e.getClientRects().length).length, gb = document.querySelector('.sdp-gb').getBoundingClientRect().bottom, pb = document.querySelector('.sdp-tilt').getBoundingClientRect().bottom;
      return (Math.abs(a.top - z.top) < 2 ? (Math.abs(gb - pb) <= 12 ? 'level' : 'uneven ' + Math.round(gb - pb)) : z.top >= a.bottom ? 'stacked' : 'overlap') + ',' + st; })); }
  const want = {2560: 'level,4', 1920: 'level,4', 1440: 'level,4', 1366: 'level,4', 1100: 'stacked,4', 390: 'stacked,3', 360: 'stacked,3'};
  ok(lay.every(x => x.split(':')[1] === want[x.split(':')[0]]), `SDP-4: gifts and news side by side ending level from 1360, stacked gifts first below; 4 stamps, 3 on phones (${lay.join(' | ')})`);
  /* every width, day and night: no sideways scroll, no text under 13px or outside the band, the code slip's parts never overlap, white text 4.5:1 on the red, every link and button 44px tall */
  const wd = []; for (const th of ['day', 'night']) { await qe(t => localStorage.setItem('np2.theme', t), th); await q.reload(); await q.waitForTimeout(2200);
    for (const w of [320, 340, 412, 600, 768, 1024, 1180, 1366, 1440, 1500, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(450);
      const r = await qe(() => { const s = document.querySelector('.sdp'); if (!s) return {err: 'no band'}; const out = [], br = s.getBoundingClientRect(), rgb = c => (c.match(/[\d.]+/g) || []).map(Number),
        L = c => { const v = c.slice(0, 3).map(x => x / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; }, cr = (a, b) => (Math.max(L(a), L(b)) + .05) / (Math.min(L(a), L(b)) + .05);
        if (document.documentElement.scrollWidth > innerWidth) out.push('sideways');
        for (const e of s.querySelectorAll('*')) { if (!e.getClientRects().length || e.closest('.vh,[aria-hidden="true"]') || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          if (parseFloat(getComputedStyle(e).fontSize) < 13) out.push('13px:' + e.className);
          for (const n of e.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const rg = document.createRange(); rg.selectNodeContents(n); if ([...rg.getClientRects()].some(x => x.width && (x.left < br.left - 1 || x.right > br.right + 1))) { out.push('out:' + e.className); break; } } }
        { const sl = s.querySelector('.sdp-slip'); if (sl) { const box = e => { const out = [], w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) { if (!n.textContent.trim() || n.parentElement.closest('.vh')) continue; const rg = document.createRange(); rg.selectNodeContents(n); out.push(...[...rg.getClientRects()].filter(x => x.width)); } return out; }, parts = [...sl.children].map(box);
          for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) if (parts[i].some(a => parts[j].some(z => a.right > z.left + 1 && a.left < z.right - 1 && a.bottom > z.top + 1 && a.top < z.bottom - 1))) out.push('slip overlap ' + i + '/' + j); } }
        const red = rgb(getComputedStyle(s, '::before').backgroundColor), low = [...s.querySelectorAll('.sdp-top h2, .sdp-lede, .sdp-ch h3, .sdp-all, .sdp-none')].filter(e => e.getClientRects().length).map(e => [e.className, Math.round(cr(rgb(getComputedStyle(e).color), red) * 100) / 100]).filter(x => x[1] < (/sdp-h/.test(x[0]) ? 3 : 4.5));
        if (low.length) out.push('contrast:' + JSON.stringify(low));
        for (const e of s.querySelectorAll('a[href], button')) { const r = e.getBoundingClientRect(); if (r.width && r.height < 43.5 && !e.closest('.dp-paper')) out.push('tap:' + (e.className || e.tagName) + ' ' + Math.round(r.height)); }
        return out; });
      if (r.err || r.length) wd.push(th + ' ' + w + ':' + JSON.stringify(r).slice(0, 200)); } }
  await qe(() => localStorage.setItem('np2.theme', 'day')); await q.reload(); await q.waitForTimeout(2200);
  ok(!wd.length, `SDP-5: 320 to 2560, day and night: no sideways scroll, nothing under 13px or out of the band, slip parts apart, white on red 4.5:1 (heading 3:1, display size), every link and button 44px tall (${wd.join(' | ') || 'all clean'})`);
  /* empty states (a test POST through the test hook; never in post.js): no live gift, then no news */
  await q.setViewportSize({width: 1440, height: 900});
  const em = await ev(`(() => { const keep = POST, day = 864e5, t = Date.now(), iso = x => new Date(x).toISOString(), out = {};
    try { POST = {checked: null, gifts: [{name: 'Old Gift', how: 'Event Gift', start: iso(t - 9 * day), end: iso(t - 2 * day)}], news: keep.news}; V2.redraw();
      let s = document.querySelector('.sdp'); out.none = !!(s && s.querySelector('.sdp-none a[href="#gifts"]')) && !s.querySelector('.pr-parcel') && s.querySelectorAll('.sdp-stamps .pr-sw').length === 1;
      POST = {checked: null, gifts: [{name: 'Gift A', code: 'AB12', how: 'Serial Code', start: iso(t - day), end: iso(t + 5 * day)}, {name: 'Gift B', how: 'Event Gift', start: iso(t - day), end: iso(t + 9 * day)}], news: []}; V2.redraw();
      s = document.querySelector('.sdp'); const c = s && s.querySelector('.sdp-cols'), g = s && s.querySelector('.sdp-gifts'), two = s && [...s.querySelectorAll('.sdp-two > *')].map(e => e.getBoundingClientRect());
      out.solo = !!c && !s.querySelector('.sdp-news') && c.classList.contains('sdp-solo') && Math.abs(g.getBoundingClientRect().width - c.getBoundingClientRect().width) < 2 && two.length === 2 && Math.abs(two[0].top - two[1].top) < 2 && two[1].left > two[0].right;
    } finally { POST = keep; V2.redraw(); } return JSON.stringify(out); })()`);
  ok(em.none === true && em.solo === true, `SDP-6: empty states: no live gift = one line with a link to #gifts and the stamps; no news = no news column, the gifts take the full width as two parcels side by side (${JSON.stringify(em)})`);
  await q.close(); }
// Sim, Nov 18 (My Team Q1 C and Q2 option 1): phone length and the desktop links row. Each of these failed on the build before the change.
{ const mtOpen = async (W, long) => { const c = await b.newContext({viewport: {width: W, height: 844}, hasTouch: W < 1100}), q = await c.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
    await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2000); const settle = async () => { await q.waitForTimeout(600); await q.waitForFunction(() => !document.querySelector('.sg2-wait'), null, {timeout: 90000}).catch(() => {}); await q.waitForTimeout(1200); };
    await settle();
    if (long) { await q.locator('[data-v2more]').first().click(); await q.waitForTimeout(400); await q.locator('.np-sheet [data-v2import]').first().click(); await q.waitForTimeout(400);
      await q.fill('[data-impin]', ['Tauros-Paldea-Combat', 'Squawkabilly-Yellow', 'Toxtricity-Low-Key', 'Crabominable-Mega', 'Lycanroc-Midnight', 'Typhlosion-Hisui'].join('\n\n')); await q.locator('[data-impgo]').click(); await settle(); }
    return {q, c}; };
  // 1. page length at 390 (the sample team, folds as they open): about 4 screens (5.6 before)
  { const {q, c} = await mtOpen(390); const r = await q.evaluate(() => ({H: document.documentElement.scrollHeight, scr: +(document.documentElement.scrollHeight / 844).toFixed(2)}));
    ok(r.scr <= 4.3, `Sim, Nov 18 (C): My Team at 390 is at most 4.3 screens long (${r.scr} screens, ${r.H}px)`);
    // 2. the Hand three across; the editing panel shut until a Card is tapped, with the hint; tapped, it opens under the whole Hand with Replace, Edit Set, Remove and Lock
    const h = await q.evaluate(() => { const g = [...document.querySelectorAll('#main .mh-hand .mh-grp')].map(e => e.getBoundingClientRect()), hint = document.querySelector('#main .mt-hint');
      return {n: g.length, cols: new Set(g.map(r => Math.round(r.left))).size, level: new Set(g.map(r => Math.round(r.top))).size === 1, panel: !!document.querySelector('#main .mt-edit'), hint: hint ? hint.textContent : ''}; });
    await q.locator('#main [data-tmsel="2"]').first().click(); await q.waitForTimeout(900);
    const t = await q.evaluate(() => { const e = document.querySelector('#main .mt-edit'), cards = [...document.querySelectorAll('#main .mh-hand .mh-pick')].map(x => x.getBoundingClientRect().bottom + scrollY);
      return e ? {below: e.getBoundingClientRect().top + scrollY >= Math.max(...cards), btn: ['[data-v2rep]', '[data-v2edit]', '[data-v2rm]', '[data-v2lock]'].every(s => e.querySelector(s) && e.querySelector(s).getClientRects().length), seen: e.getBoundingClientRect().top < innerHeight} : null; });
    ok(h.n === 3 && h.cols === 3 && h.level && !h.panel && /Tap a Card/.test(h.hint) && t && t.below && t.btn && t.seen, `Sim, Nov 18 (C): at 390 the Hand is three across (Lead | Back | Bench), the editing panel is shut with "Tap a Card…" until a Card is tapped, then opens under the whole Hand, on screen, with Replace, Edit Set, Remove and Lock (${JSON.stringify({...h, open: t})})`);
    await c.close(); }
  // 3. the three Suggestions links in one row: phones 360-699 and desktop 1100-1280 (they already were from 1440)
  { const rows = []; for (const W of [360, 390, 600, 1100, 1180, 1280]) { const {q, c} = await mtOpen(W); rows.push(W + ':' + await q.evaluate(() => { const a = [...document.querySelectorAll('#main .tm-sgs .sg2-links .sg2-all')].filter(x => x.getClientRects().length);
      const T = a.map(x => Math.round(x.getBoundingClientRect().top)), H = a.map(x => Math.round(x.getBoundingClientRect().height)); return a.length === 3 && new Set(T).size === 1 && new Set(H).size === 1 && a.every(x => x.scrollWidth <= x.clientWidth + 1) ? (() => { /* every two words drawn side by side keep a space between them (a block part inside the flex link dropped it: 'See AllSuggestions') */ const tight = []; a.forEach(x => { const R = []; const tw = document.createTreeWalker(x, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const r = rg.getBoundingClientRect(); R.push([m[0], r.left, r.right, Math.round(r.top)]); } }
        for (let k = 1; k < R.length; k++) if (R[k][3] === R[k - 1][3] && R[k][1] - R[k - 1][2] < 2) tight.push(R[k - 1][0] + R[k][0]); }); return tight.length ? 'words run together: ' + tight.join(', ') : 'row'; })() : T.join('/'); })); await c.close(); }
    ok(rows.every(x => /:row$/.test(x)), `Sim, Nov 18 (C and Q2 option 1): the three Suggestions links sit in one even row at 360-699 and 1100-1280, their words spaced (${rows.join(', ')})`); }
  // 4. long names on the three-across Cards: none past its Card or over two lines, never under 13px (320 keeps two across)
  { const out = []; for (const W of [320, 360, 390]) { const {q, c} = await mtOpen(W, true); out.push(await q.evaluate(W => { const g = [...document.querySelectorAll('#main .mh-hand .mh-grp')].map(e => Math.round(e.getBoundingClientRect().left));
      const bad = [...document.querySelectorAll('#main .mh .mc-id h3')].map(h => { const cr = h.closest('.ms-card').getBoundingClientRect(), r = h.getBoundingClientRect(), lh = parseFloat(getComputedStyle(h).lineHeight), fs = parseFloat(getComputedStyle(h).fontSize);
        const past = Math.round(Math.max(cr.left - r.left, r.right - cr.right)); return past > 0 || h.offsetHeight > 2 * lh + 2 || fs < 13 || h.scrollWidth > h.clientWidth + 1 ? `${h.textContent.trim()} ${past}px ${Math.round(h.offsetHeight / lh)} lines ${fs}px` : ''; }).filter(Boolean);
      const three = new Set(g).size === 3; return `${W}: ${W >= 360 && !three ? 'not three across; ' : ''}${bad.length ? bad.join('; ') : 'ok'}`; }, W)); await c.close(); }
    ok(out.every(x => /: ok$/.test(x)), `Sim, Nov 18 (C): six long names (Paldean Tauros (Combat), Squawkabilly (Yellow), Mega Crabominable...) fit their Cards at 320/360/390 (three across from 360): none past the edge or over two lines, none under 13px (${out.join(' | ')})`); }
  // 5. Stand-Outs four across from 360 with level verdicts; Adjust Suggestions folded with its settings line; Your Games' note behind "?"
  { const out = []; for (const W of [360, 390, 430]) { const {q, c} = await mtOpen(W); out.push(await q.evaluate(W => { const li = [...document.querySelectorAll('#main .mu-cards li')], rows = {};
      li.forEach(l => { const t = Math.round(l.getBoundingClientRect().top), v = l.querySelector('.tm-v'); (rows[t] = rows[t] || []).push(v ? Math.round(v.getBoundingClientRect().top) : -1); });
      const R = Object.values(rows), adj = document.querySelector('#main [data-v2adj]'), why = document.querySelector('#main .tm-yg-why'), tip = document.querySelector('#main .tm-yg-0 [data-v2tip]');
      const ok4 = li.length === 8 ? R.length === 2 && R.every(r => r.length === 4 && new Set(r).size === 1) : false;
      return `${W}: ${ok4 ? 'four across, level' : 'rows ' + R.map(r => r.length).join('+')}; adjust ${adj && !adj.open && /Mega/.test(adj.querySelector('summary').textContent) ? 'folded' : 'open'}; note ${why && !why.getClientRects().length && tip && tip.getClientRects().length ? 'behind ?' : 'shown'}`; }, W)); await c.close(); }
    ok(out.every(x => /four across, level; adjust folded; note behind \?$/.test(x)), `Sim, Nov 18 (C): on phones Stand-Outs go four across with the verdicts level, Adjust Suggestions is folded with its settings on the closed line, Your Games' note is behind a "?" (${out.join(' | ')})`); } }
// OL-i39 (Nov 18): Report a Mistake on a Pokémon page sends that Pokémon's numbers, as today's site did (53-feedback.js fbMisContext);
// the page still shows only its name, and the entry carries nothing personal (the same six fields as every feedback entry)
{ const q = await (await b.newContext({viewport: {width: 1280, height: 900}})).newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#pokemon=incineroar'); await q.waitForTimeout(2500);
  await q.evaluate(() => window.__ev(`(() => { V2.FB.ok = true; window.__fbSaved = null; V2.FB.ref = {get: async () => ({exists: false}), set: async d => { window.__fbSaved = d; }, update: async d => { window.__fbSaved = d; }}; V2.redraw(); return 1; })()`));
  await q.waitForTimeout(400); await q.evaluate(() => document.querySelector('[data-fbmistake="pokemon"]').click()) /* part 6 can be folded */; await q.waitForTimeout(1200);
  const seen = await q.evaluate(() => ((document.querySelector('.inf-ctx') || {}).innerText || '').replace(/\s+/g, ' ').trim());
  await q.evaluate(() => { window.__NP_PREVIEW = 0; }); await q.fill('#fbText2', 'The rating looks off'); await q.click('[data-fbsend2]'); await q.waitForTimeout(600);
  const e = await q.evaluate(() => { const m = window.__fbSaved && window.__fbSaved.m; return m ? Object.values(m)[0] : null; });
  const c = (e && e.c) || '';
  ok(/^Incineroar\n/.test(c) && /rated \d+ \(likely [\d–]+, [SABCD] tier, #\d+ of \d+/.test(c) && /Tournaments: [\d.]+% of teams, [\d.]+% won, [\d,]+ games/.test(c) && /Moves shown: .*Fake Out \d/.test(c) && /Items shown: /.test(c),
    `OL-i39: Report a Mistake on a Pokémon page sends its rating, tier, rank, tournament numbers, moves and items (${JSON.stringify(c.slice(0, 160))})`);
  ok(seen === "Sent with what was on screen: Incineroar Don't send it", `OL-i39: the page still shows only the name (${seen})`);
  ok(!!e && Object.keys(e).sort().join() === 'c,d,k,t,v,w' && e.k === 'mistake' && !/@/.test(c), `OL-i39: the entry keeps the same fields, nothing personal (${e ? Object.keys(e).sort().join() : 'nothing saved'})`);
  await q.close(); }
// OL-i15 (Nov 18): the Blueprint shows the engine's catch tip and "X isn't in your box" lines (22-auto-build.js), and every plan chip
// (no cap of 3), in rows that never leave one chip alone; it never shows the readiness line (word list) or the two-weather line (not asked)
{ const q = await (await b.newContext({viewport: {width: 1440, height: 900}})).newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#build'); await q.waitForTimeout(2500);
  const run = async src => { await q.evaluate(s => window.__ev(`(() => { ui.abSrc = '${s}'; ui.ab = null; V2.redraw(); return 1; })()`), src); await q.waitForTimeout(300);
    await q.getByRole('button', {name: 'Build Me a Team'}).first().click(); await q.waitForFunction(() => window.__ev('!!(ui.ab && !ui.ab.busy && ui.ab.doubles && ui.ab.doubles.teams)'), null, {timeout: 60000}); await q.waitForTimeout(800); };
  const show = i => q.evaluate(i => window.__ev(`(() => { ui.abIdx = ui.abIdx || {}; ui.abIdx.doubles = ${i}; V2.redraw(); return 1; })()`), i);
  const pick = re => q.evaluate(re => window.__ev(`ui.ab.doubles.teams.findIndex(t => (t.why || []).some(w => ${re}.test(w)))`), re);
  const sheetTx = () => q.evaluate(() => (document.querySelector('.bp .bp-right') || {}).innerText || '');
  // the engine's catch search and plan chips can differ between runs on a busy machine (time-sliced search), so when this build has
  // none, the test gives option 1 the engine's own sentence and all four chips (22-auto-build.js line 121; 11-game-plan.js labels)
  await run('box'); let ic = await pick('/^(Best single catch|To reach 90\\+)/'), made = '';
  if (ic < 0) { ic = 0; made = ', test-made'; await q.evaluate(() => window.__ev(`ui.ab.doubles.teams[0].why.push('Best single catch: Farigiraf for Empoleon, which takes this team from 73 to 77'); 1`)); }
  if (await q.evaluate(() => window.__ev(`ui.ab.doubles.teams.findIndex(t => (t.gp || []).length >= 4)`)) < 0) { made += ', test-made chips'; await q.evaluate(() => window.__ev(`ui.ab.doubles.teams[0].gp = ['Speed control', 'Weather', 'Terrain', 'Lead support']; 1`)); }
  { await show(ic); await q.waitForTimeout(400); const w = await q.evaluate(i => window.__ev(`ui.ab.doubles.teams[${i}].why.find(w => /^(Best single catch|To reach 90\\+)/.test(w))`), ic), tx = await sheetTx();
    ok(tx.includes(w), `OL-i15: the Blueprint shows the catch tip (${w.slice(0, 70)}${made})`); }
  const i4 = await q.evaluate(() => window.__ev(`ui.ab.doubles.teams.findIndex(t => (t.gp || []).length >= 4)`));
  if (i4 < 0) ok(false, 'OL-i15: no option with 4 plan chips to check (unknown, not a pass)');
  else { await show(i4); for (const w of [320, 390, 768, 1100, 1440, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(400);
    const r = await q.evaluate(i => { const want = window.__ev(`ui.ab.doubles.teams[${i}].gp.join('|')`), cs = [...document.querySelectorAll('.bp .bp-chips .np-chip')], rows = {};
      cs.forEach(c => { const y = Math.round(c.getBoundingClientRect().top); rows[y] = (rows[y] || 0) + 1; }); const box = document.querySelector('.bp .bp-chips'), bb = box && box.getBoundingClientRect(), out = cs.some(c => c.getBoundingClientRect().right > (bb ? bb.right : 0) + 1);
      return {got: cs.map(c => c.textContent).join('|'), want, rows: Object.values(rows), out, sw: document.documentElement.scrollWidth, vw: innerWidth}; }, i4);
    ok(r.got === r.want && !r.rows.includes(1) && new Set(r.rows).size === 1 && !r.out && r.sw <= r.vw, `OL-i15: at ${w} all ${r.want.split('|').length} plan chips show, in even rows (${r.got}; rows ${r.rows.join('+')}; ${r.sw}/${r.vw})`); }
    await q.setViewportSize({width: 1440, height: 900}); }
  await run('all'); const ib = await pick(`/isn't in your box: /`);
  if (ib < 0) ok(false, 'OL-i15: a Whole Roster build gave no "isn\'t in your box" line to check (unknown, not a pass)');
  else { await show(ib); await q.waitForTimeout(400); const ws = await q.evaluate(i => window.__ev(`JSON.stringify(ui.ab.doubles.teams[${i}].why.filter(w => /isn't in your box: /.test(w)))`), ib).then(JSON.parse), tx = await sheetTx();
    ok(ws.every(w => tx.includes(w)), `OL-i15: the Blueprint shows every "isn't in your box" line (${ws.length}: ${ws[0].slice(0, 50)})`); }
  const bad = await q.evaluate(() => /ready for the top|Sets both /.test((document.querySelector('.bp') || {}).innerText || ''));
  ok(!bad, 'OL-i15: the readiness line and the two-weather line stay off the Blueprint');
  await q.close(); }
/* Home, The Stampede, polish of the joined bands (Nov 18): the seam under the hero and the receipt's band strip (sd-hero.css, sd-six.css) */
{ const seam = [], start = [], strip = [];
  for (const empty of [false, true]) { const ctx = await b.newContext({viewport: {width: 1440, height: 900}}); const q = await ctx.newPage();
    await q.addInitScript(e => { window.__PL_TEST = 1; if (e && !sessionStorage.getItem('pz')) { sessionStorage.setItem('pz', 1); localStorage.setItem('cc2.state', JSON.stringify({slots: [{n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}, {n: ''}], teams: []})); localStorage.setItem('cc2.welcomed', '"1"'); } }, empty);
    await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2200);
    for (const w of [1100, 1280, 1440, 1920, 2560]) { await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(400); await q.evaluate(() => window.V2.sdSixAfter && window.V2.sdSixAfter());
      const m = await q.evaluate(() => { const tk = document.querySelector('#main .sdh-tick'), k = document.querySelector('#main .sds-k'); if (!tk || !k) return {err: 'no ticker or line-up'};
        /* the ticker is tilted with the bands: its bottom edge, at x, from its rotated corners (bottom-left is the lowest point) */
        const T = tk.getBoundingClientRect(), tan = Math.tan(Math.abs(parseFloat(getComputedStyle(tk).rotate) || 0) * Math.PI / 180), K = k.getBoundingClientRect(), gap = Math.round(K.top - (T.bottom - (K.left - T.left) * tan));
        const P = [...document.querySelectorAll('#main .sds-part')].map(e => e.getBoundingClientRect()), side = P.length === 3 && Math.abs(P[0].top - P[2].top) < P[0].height && P[2].left > P[0].right;
        const rings = [...document.querySelectorAll('#main .sds-rings .sds-ring')].map(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; });
        return {gap, side, topGap: side ? Math.round(P[0].top - Math.min(P[1].top, P[2].top)) : 0, ends: side ? Math.round(Math.max(...P.map(r => r.bottom)) - Math.min(...P.map(r => r.bottom))) : 0, ringSpread: Math.round(Math.max(...rings) - Math.min(...rings))}; });
      const tag = (empty ? 'empty ' : '') + w;
      seam.push(m.err ? tag + ' ' + m.err : m.gap >= 16 && m.gap <= 80 ? '' : `${tag}: line-up ${m.gap}px under the ticker`);
      if (m.side) start.push(m.topGap <= 8 && m.ends <= 32 && m.ringSpread <= 2 ? '' : `${tag}: line-up starts ${m.topGap}px under the board, ends ${m.ends}px apart, rings ${m.ringSpread}px off one line`); }
    for (const night of [false, true]) for (const w of night ? [390, 1440] : [320, 340, 360, 390, 412, 600, 700, 768, 820, 1024, 1100, 1180, 1280, 1366, 1440, 1500, 1920, 2560]) {
      if (night) await q.evaluate(() => { document.documentElement.dataset.theme = 'night'; });
      await q.setViewportSize({width: w, height: 900}); await q.waitForTimeout(300);
      const r = await q.evaluate(() => { const ol = document.querySelector('#main .sds-bands'); if (!ol) return 'no strip'; const B = ol.getBoundingClientRect(), bad = [];
        const L = [...ol.querySelectorAll('.sds-b span')].map(s => { const rg = document.createRange(); rg.selectNodeContents(s); return {t: s.textContent, f: parseFloat(getComputedStyle(s).fontSize), rs: [...rg.getClientRects()].filter(c => c.width)}; });
        for (let i = 0; i < L.length; i++) { if (L[i].f < 13) bad.push(L[i].t + ' ' + L[i].f + 'px'); for (const a of L[i].rs) { if (a.left < B.left - .5 || a.right > B.right + .5) bad.push(L[i].t + ' out of the strip');
          for (let j = i + 1; j < L.length; j++) for (const c of L[j].rs) if (Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 1) { const g = c.left >= a.right ? c.left - a.right : a.left >= c.right ? a.left - c.right : -1; if (g < 8) bad.push(`${L[i].t} / ${L[j].t} ${Math.round(g)}px apart`); } } }
        /* the chosen band's bar grows 1.5x with a 4px ring (box-shadow): no name may sit under it */
        const on = ol.querySelector('.sds-b.on i'); if (on) { const R = on.getBoundingClientRect(), x0 = R.left - 4, x1 = R.right + 4, y0 = R.top - 4, y1 = R.bottom + 4;
          for (const l of L) for (const a of l.rs) if (a.left < x1 && a.right > x0 && a.top < y1 && a.bottom > y0) bad.push(l.t + ' under the chosen bar'); }
        return bad.slice(0, 2).join(', '); });
      strip.push(r ? `${empty ? 'empty ' : ''}${night ? 'night ' : ''}${w}: ${r}` : ''); }
    await ctx.close(); }
  ok(!seam.filter(Boolean).length, `Stampede polish 1 (Nov 18): at 1100-2560 (sample team and empty team) the line-up starts 16-80px under the pink ticker, no empty ink strip between them${seam.filter(Boolean).length ? ': ' + seam.filter(Boolean).join(' | ') : ''}`);
  ok(start.length >= 6 && !start.filter(Boolean).length, `Stampede polish 1b: where the three parts stand side by side (1280-2560) the line-up starts with the board (no strip above its headline), all three end on one baseline and the six rings stay on one line${start.filter(Boolean).length ? ': ' + start.filter(Boolean).join(' | ') : ` (${start.length} views)`}`);
  ok(!strip.filter(Boolean).length, `Stampede polish 2 (Nov 18): the receipt's five band names are 13px or more, inside the strip, at least 8px apart and clear of the chosen bar's ring at 320-2560, day and night, team and no team${strip.filter(Boolean).length ? ': ' + strip.filter(Boolean).slice(0, 4).join(' | ') : ''}`); }
await b.close();
console.log(`v2-minors: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
