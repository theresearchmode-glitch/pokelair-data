// Small fixes from the code review (Nov 17), one check each; every check fails on the build before its fix.
//   A1-M1  Matchups never says "Ready for every top threat" (word list: answers, not readiness)
//   A1-M2  Build's "Copy for Showdown" uses the shared copy with its fallback (it failed where the clipboard API is blocked)
//   A1-M3  Build's Save says "for this visit" when the browser can't keep it (it always said "Saved")
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
  const h = await p.evaluate(() => ({t: (document.querySelector('#main .fn-ringside .fn-rh') || {}).innerText || '', per: window.__ev('(META[S.format] || {}).period || ""'),
    a: typeof V2.homeNext === 'function' ? V2.homeNext(Date.UTC(2026, 10, 17)) : null, b: typeof V2.homeNext === 'function' ? V2.homeNext(Date.UTC(2026, 11, 2)) : null,
    hd: typeof V2.homeHead === 'function' ? [V2.homeHead(Date.UTC(2026, 10, 17)).h, V2.homeHead(Date.UTC(2026, 11, 5)).h] : []})); const t = h.t.replace(/\s+/g, ' ');
  ok(!/right now/i.test(t) && /Most used (?:last month|on the ladder)\. [A-Z][a-z]+, Showdown ladder/.test(t) && (t.match(/Most used/g) || []).length === 1, `Player review 3a (Nov 17): Home doesn't call a past month's numbers "right now" (${t.slice(0, 120)})`);
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
  await q.goto('file://' + PAGE + '#home'); await q.waitForTimeout(2500); const t = q.locator('[aria-label="Add a Pokémon to slot 3"]'); if (await t.count()) await t.first().click(); await q.waitForTimeout(800);
  const h = await q.evaluate(() => window.__ev(`(() => { const s = document.querySelector('[role="dialog"]'); return (s ? s.getAttribute('aria-label') : 'no sheet') + ' / spot ' + (V2.ed ? V2.ed.i + 1 : '?') + (document.activeElement && document.activeElement.matches('[data-adq]') ? ' / name box focused' : ''); })()`));
  ok(h === 'Add a Pokémon / spot 3 / name box focused', `Known-bug HOME-10b (Nov 17): Home's empty 'Add a Pokémon, slot 3' opens the Add box for spot 3 (${h})`); await ctx.close(); }
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
  for (const [route, sel] of [['meta', '.gs-mon'], ['speed', '.sp2-m'], ['home', '.hm-used'], ['home', '.hm-rk'], ['usage', '.us-fig']]) {
    await p.goto('file://' + PAGE + '#' + route); await p.waitForTimeout(2000);
    lin.push(await p.evaluate(sel => { const norm = x => x.toLowerCase().replace(/[^a-z0-9%.# ]+/g, ' ').replace(/\s+/g, ' ').trim(); const e = [...document.querySelectorAll('#main ' + sel)].find(x => x.getClientRects().length && x.getAttribute('aria-label')); if (!e) return sel + ' none';
      const vis = norm((e.querySelector('.us-tx') || e).innerText).split(' ').slice(0, 2).join(' ') /* a Usage figure's podium number is decoration; its label text is .us-tx */, al = norm(e.getAttribute('aria-label')); return al.startsWith(vis) ? '' : sel + ': "' + vis + '" vs "' + al.slice(0, 50) + '"'; }, sel)); }
  const bad = lin.filter(Boolean); ok(!bad.length, `pl-5d (Nov 17): spoken names start with the visible words (rating tiles, speed rows, Home most used and ranks, Usage figures)${bad.length ? ': ' + bad.join(' | ') : ''}`); }
{ const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const q = await ctx.newPage(); await q.addInitScript(() => { window.__PL_TEST = 1; });
  await q.goto('file://' + PAGE + '#team'); await q.waitForTimeout(2500); await q.evaluate(() => document.querySelectorAll('[data-tmsel]')[0].click()); await q.waitForTimeout(500);
  const pos = await q.evaluate(() => { const c = document.querySelector('[data-tmsel][aria-pressed="true"]').closest('.mh-slot').getBoundingClientRect(), r = document.querySelector('[data-v2rep]'), m = document.querySelector('[data-v2rm]'); return r && m ? Math.round(m.getBoundingClientRect().bottom - c.bottom) : -1; });
  await q.evaluate(() => { const r = document.querySelector('[data-v2rep]'); if (r) r.click(); }); await q.waitForTimeout(400); const head = await q.evaluate(() => (document.querySelector('.np-sheet h2') || {}).textContent || '');
  await q.keyboard.type('incin'); await q.waitForTimeout(400); await q.keyboard.press('Enter'); await q.waitForTimeout(700);
  const after = await q.evaluate(() => window.__ev('members().map(m => m.p.n).join(",")')), tst = await q.evaluate(() => (document.querySelector('.np-toast') || {}).textContent || '');
  await q.evaluate(() => document.getElementById('toastUndo') && document.getElementById('toastUndo').click()); await q.waitForTimeout(500); const undone = await q.evaluate(() => window.__ev('members().map(m => m.p.n).join(",")'));
  ok(pos > 0 && pos < 650 && /^Replace /.test(head) && /Incineroar/.test(after) && /^Replaced .+ with Incineroar/.test(tst) && /Charizard-Mega-Y/.test(undone) && !/Incineroar/.test(undone), `Sim (Nov 17, B): tapping a Lead Card at 390 puts Replace, Edit Set and Remove right under it (Remove ${pos}px below the Card); Replace swaps in one step and Undo brings the old one back (${head} | ${tst.slice(0, 50)})`); await ctx.close(); }
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
{ const ld = []; for (const w of [360, 420, 700, 900, 1024, 1180, 1280, 1366, 1440, 1920]) { await p.setViewportSize({width: w, height: 900}); await p.goto('file://' + PAGE + '#home'); await p.waitForTimeout(1500);
    ld.push(await p.evaluate(() => { const L = [...document.querySelectorAll('.ff.lead .ff-ld')].filter(e => e.getClientRects().length); if (!L.length) return 'none'; /* review Nov 17 #6: no Lead found fails (was 99, a pass) */
      return Math.min(...L.map(e => { const t = e.closest('.ff').getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect(), f = y => (y - t.top) / t.height; /* the tile is slanted 10px: right edge leans in toward the bottom, left edge toward the top */
        return Math.round(Math.min(t.right - 10 * f(r.bottom) - r.right, r.left - (t.left + 10 * (1 - f(r.top))))); })); })); }
  await p.setViewportSize({width: 1280, height: 900}); ok(ld.every(x => typeof x === 'number' && x >= 4), `Audit v199 #6 (Nov 17): Home's 'Lead' stays clear of the tile's slanted edge at 360-1920 (closest ${ld.join(' / ')} px from the slant)`); }
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
  const y0 = await q.evaluate(() => { const s = document.querySelector('#tm-sg'), a = s && s.querySelector('[data-v2plan]'); if (!a) return null; scrollBy(0, a.getBoundingClientRect().top - innerHeight * 2 / 3); return Math.round(s.getBoundingClientRect().top); });
  const a = await q.$('#tm-sg [data-v2plan]'); let y1 = null;
  if (y0 != null && a) { await a.click(); await q.waitForTimeout(700);
    await q.evaluate(() => { const d = document.createElement('div'); d.style.height = '120px'; d.id = 'zz-late'; const m = document.querySelector('#main'); m.insertBefore(d, m.firstChild); });
    await q.waitForTimeout(1200); y1 = await q.evaluate(() => { const s = document.querySelector('#tm-sg'); return s ? Math.round(s.getBoundingClientRect().top) : null; }); }
  ok(y0 != null && y1 != null && Math.abs(y1 - y0) <= 4, `SUGG-09 (Nov 18): after Apply, Suggestions stays put when the parts above change height later (top ${y0} -> ${y1})`);
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
  const yg = await q.evaluate(() => { const s = document.querySelector('#tm-yg'), n = s && s.querySelector('.tm-yg-0 span'), w = s && s.querySelector('.tm-yg-why'); if (!n || !w) return 'missing';
    const L = e => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)); return L(n) + ' / ' + L(w); });
  ok(/^1 \/ [123]$/.test(yg), `Nov 12 re-check (Nov 17): Your Games at 390 keeps 'None logged yet' on one line and its note on three at most, was 7 (lines: ${yg})`); /* GitHub's machine wraps it to 3 */ await q.close(); }
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
await b.close();
console.log(`v2-minors: ${fails.length ? fails.length + ' failed' : 'all passed'}`); process.exit(fails.length ? 1 : 0);
