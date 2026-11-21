// Page helpers for group C (Battle) on the REBUILD (app/dist/v2.html, address #battle). Same names and meanings as
// adapters/current.C-battle.mjs, read from the new Battle page's markup (src/v2/pages/battle.js). Only the Battle-page helpers the
// BATTLE-* tests call are wired (Nov 12); the other Battle pages (Speed Tiers, Damage Calc, Type Chart, Test Run, Practice, Track
// record) and features the new page doesn't have yet throw Error('not in v2 yet: …') so a failure names what is missing. Nothing faked.
// Translation notes (what the player sees):
//  - their six are typed in a sheet ("Enter their six", data-btopp) with six name boxes, not six boxes on the page; × is per box
//  - "Practice against a top team" is the sheet's list of the top 10 tournament teams (buttons), not a drop-down; pickTournamentTeam(k)
//    keeps today's numbering (1 = the first team; today's 0 is the "Pick a tournament team…" placeholder)
//  - "Watch out" is an always-open list (no fold); "Deeper read", "Damage both ways" and "Who moves first" are tabs under the plan
//    (one open at a time): openFold / foldText map onto them
//  - toasts are .np-toast elements
const NOT = what => { throw new Error('not in v2 yet: ' + what); };
const TABS = {'deeper read': 'deep', 'damage both ways': 'dmg', 'who moves first': 'spd', 'full matchup grid': 'deep'};
export default (ui, pg) => {
  const T = s => (s || '').replace(/\s+/g, ' ').trim();
  const click = async (sel, wait = 400) => { const ok = await pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')); if (e) { e.click(); return true; } return false; }, sel);
    if (!ok) throw new Error(`nothing visible: ${sel}`); await pg.waitForTimeout(wait); };
  const sheetOpen = () => pg.evaluate(() => !!(window.V2 && V2._sheet && V2._sheet.wrap.querySelector('.bt-osheet')));
  const openSheet = async () => { if (!(await sheetOpen())) await click('[data-btopp]', 500); };
  const closeSheet = async () => { await pg.evaluate(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); }); await pg.waitForTimeout(300); };
  const tab = async (k, open = true) => { const on = await pg.evaluate(k => { const b = document.querySelector(`[data-bttab="${k}"]`); return b ? b.getAttribute('aria-expanded') === 'true' : null; }, k);
    if (on === null) throw new Error('no Battle tab ' + k + ' (needs their Pokémon in)'); if (on !== open) await click(`[data-bttab="${k}"]`, 600); };
  const A = {
    pageText: () => pg.evaluate(() => { const m = document.querySelector('#main'); return m ? m.innerText.replace(/\s+/g, ' ').trim() : ''; }),
    async reloadSignedIn(otherDevice = false, wait = 1500) { const acc = await pg.evaluate(() => window.__acct);
      await pg.addInitScript(([a, wipe]) => { window.__acct = a; if (wipe) try { localStorage.removeItem('cc2.state'); } catch (e) {} }, [acc, otherDevice]);
      await pg.reload(); await pg.waitForTimeout(wait); },
    async waitFor(m, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ui.sees(m)) return true; await pg.waitForTimeout(150); } return false; },
    async toast(ms = 2500) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const t = await pg.evaluate(() => { const e = document.querySelector('.np-toast'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }); if (t) return t; await pg.waitForTimeout(100); } return ''; },
    async tapIn(m, wait = 400) { // the calc's weather / terrain names pick from their field card's list
      const f = await pg.evaluate(([src, fl]) => { const R = fl != null ? new RegExp(src, fl) : null; for (const s of document.querySelectorAll('.dc2 [data-dcfield]')) for (const o of s.options) if (R ? R.test(o.text) : o.text.toLowerCase() === src.toLowerCase()) return [s.dataset.dcfield, o.value]; return null; }, m instanceof RegExp ? [m.source, m.flags] : [String(m), null]);
      if (f) { await pg.selectOption(`.dc2 [data-dcfield="${f[0]}"]`, f[1]); await pg.waitForTimeout(wait); return; } return ui.tap(m, '#main', wait); },
    // ---- navigation (Nov 15): the five main tabs are the shell's (v2.D-meta-shell.mjs exposes them as ui.D); the new site has no ⋯ menu
    // (approved, parity-nov15.md "Deliberate differences"), so the Battle pages are reached through the Battle tools bar (700+, Sim Q6 A)
    mainTab: () => ui.D.activeMainTab(),
    async tapMainTab(name, wait = 700) { await ui.D.tapMainTab(name); await pg.waitForTimeout(wait); },
    /** the Battle tools bar's links, left to right, as shown (700+ only; [] when it is not on screen) */
    toolsBar: () => pg.evaluate(() => [...document.querySelectorAll('.bt-tools a')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    // ---- their six ----
    async typeOpponent(k, text) { await openSheet(); const sel = `.bt-osheet [data-btfind="${k - 1}"]`;
      if (!(await pg.$(sel))) throw new Error(`their box ${k} is filled (no name box to type in)`); await pg.fill(sel, ''); await pg.type(sel, text, {delay: 15}); await pg.waitForTimeout(300); },
    suggestions: () => pg.evaluate(() => { const f = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.btfind; const box = document.querySelector(`[data-bthits="${f}"]`) || document.querySelector('[data-bthits]');
      return box ? [...box.querySelectorAll('[data-btpick]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) : []; }),
    async enterOpponents(names) { for (const n of names) { await openSheet(); const k = await pg.evaluate(() => { const i = document.querySelector('.bt-osheet [data-btfind]'); return i ? +i.dataset.btfind : -1; });
        if (k < 0) throw new Error('their six is full'); await A.typeOpponent(k + 1, n); await pg.keyboard.press('Enter'); await pg.waitForTimeout(400); } await closeSheet(); },
    opponents: () => pg.evaluate(() => window.__ev ? window.__ev('S.opp.filter(n=>n&&byName.get(n)).map(n=>byName.get(n).d)') : []),
    focused: () => pg.evaluate(() => { const a = document.activeElement; return a && a.dataset && a.dataset.btfind != null ? 'their ' + (+a.dataset.btfind + 1) : (a ? a.tagName : null); }),
    async removeOpponent(name) { await openSheet(); const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('.bt-osheet [data-btox]')].find(b => (b.getAttribute('aria-label') || '').toLowerCase() === ('remove ' + n).toLowerCase()); if (!b) return false; b.click(); return true; }, name);
      if (!ok) throw new Error('no × for ' + name); await pg.waitForTimeout(400); const inSheet = await sheetOpen(); if (!inSheet) return; },
    async clearOpponents() { await closeSheet(); await click('[data-btclear]', 500); },
    // every tournament team: the sheet's "Show all N tournament teams" list (today's drop-down, same order: index k-1 = option k)
    async tournamentTeams() { await openSheet(); if (await pg.$('.bt-osheet [data-btall]')) await click('.bt-osheet [data-btall]', 500);
      const t = await pg.evaluate(() => [...document.querySelectorAll('.bt-osheet [data-btteamall]')].map(e => e.innerText.replace(/\s+/g, ' ').trim())); return ['Pick a tournament team…', ...t]; },
    /** which tournament team their six came from: its name, or today's placeholder once the six was changed by hand */
    tournamentTeamChosen: () => pg.evaluate(() => window.__ev('ui.oppFrom ? ui.oppFrom.label : "Pick a tournament team…"')),
    async pickTournamentTeam(k) { await A.tournamentTeams(); await click(`.bt-osheet [data-btteamall="${k - 1}"]`, 2500); },
    async recentOpponents() { await openSheet(); return pg.evaluate(() => [...document.querySelectorAll('.bt-osheet [data-btrecent]')].map(e => (e.getAttribute('aria-label') || '').replace(/^Load /, ''))); },
    async loadRecentOpponent(i) { await openSheet(); await click(`.bt-osheet [data-btrecent="${i}"]`, 800); },
    // ---- clipboard ----
    async watchClipboard() { await pg.evaluate(() => { window.__copied = ''; const w = navigator.clipboard && navigator.clipboard.writeText; if (navigator.clipboard) navigator.clipboard.writeText = t => { window.__copied = t; return w ? w.call(navigator.clipboard, t).catch(() => {}) : Promise.resolve(); }; }); },
    copiedText: () => pg.evaluate(() => window.__copied || ''),
    // ---- plan views ----
    planSwitchShown: async () => false, // the new page has tabs under the plan on every width, no Plan/Speed/Damage switch
    planSwitch: () => NOT('the phone Plan / Speed / Damage switch (the new page uses tabs under the plan on every width)'),
    // ---- Battle log (piece 4a): always open on the page; Your record and the replay box are sheets ----
    // the six pick buttons live in a sheet (mock-up: "the plan's four … (tap to change)"); open it first
    logChips: async () => { if (!(await pg.$('.np-sheet .bt-lsheet'))) { await closeSheet(); await click('[data-btlfour]', 500); } return pg.evaluate(() => [...document.querySelectorAll('.bt-lp')].map(e => ({name: e.querySelector('span').innerText.replace(/\s+/g, ' ').trim(), on: e.getAttribute('aria-pressed') === 'true', order: e.querySelector('small').innerText.trim()}))); },
    async logPick(name) { if (!(await pg.$('.np-sheet .bt-lsheet'))) { await closeSheet(); await click('[data-btlfour]', 500); } const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('.bt-lp')].find(e => e.querySelector('span').innerText.replace(/\s+/g, ' ').trim() === n); if (!e) return false; e.click(); return true; }, name); if (!ok) throw new Error('no log chip ' + name); await pg.waitForTimeout(400); },
    async logResult(r) { await closeSheet(); await click(`[data-btlres="${r}"]`, 700); },
    logResultEnabled: r => pg.evaluate(r => { const e = document.querySelector(`[data-btlres="${r}"]`); return e ? !e.disabled : (document.querySelector('[data-btlfour]') ? false : null); }, r), /* v2 (Nov 16): before four are picked Win/Loss are not shown, 'Pick Your Four First ›' is: the player can't log yet */
    async logGame(result, four) { if (four) { for (const c of await A.logChips()) if (c.on) await A.logPick(c.name); for (const n of four) await A.logPick(n); } await A.logResult(result === 'W' || /win/i.test(result) ? 'W' : 'L'); },
    async recentBattles() { await closeSheet(); await click('[data-btrecord]', 500); return pg.evaluate(() => [...document.querySelectorAll('.bt-rlist li')].map(e => e.innerText.replace(/\s+/g, ' ').trim())); },
    async deleteBattle(i = 0) { await closeSheet(); await click('[data-btrecord]', 500); const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('[data-btldel]')][i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no battle ' + i); await pg.waitForTimeout(500); },
    async pasteReplay(text) { if (!(await pg.$('.np-sheet [data-btrepin]'))) { await closeSheet(); await click('[data-btreplay]', 500); } await pg.fill('[data-btrepin]', text); await click('[data-btrepgo]', 700); },
    async uploadReplay(path) { if (!(await pg.$('.np-sheet [data-btrepin]'))) { await closeSheet(); await click('[data-btreplay]', 500); } await pg.setInputFiles('[data-btrepfile]', path); await pg.waitForTimeout(900); },
    replayMessage: () => pg.evaluate(() => { const e = document.querySelector('[data-btrepout]'); return e ? e.innerText.trim() : null; }),
    savedGames: () => ui.peek('(S.log||[]).map(g=>({r:g.r,b:g.b.slice(),o:(g.o||[]).slice()}))'),
    async openFold(name, open = true) { if (/^(battle log|recent battles|log a game)/i.test(name)) return; if (/^events checked/i.test(name) && await pg.$('#main details.trk-evs')) { if (await pg.evaluate(o => document.querySelector('#main details.trk-evs').open !== o, open)) await click('#main details.trk-evs > summary', 400); return; } if (/^more on home/i.test(name)) { const flip = await pg.evaluate(o => { const d = document.querySelector('#main details[data-hmmore]'); return d ? d.open !== o : null; }, open); if (flip === null) NOT('fold More on Home'); if (flip) await click('#main details[data-hmmore] > summary', 500); return; } if (/your six vs the field/i.test(name)) return; if (/best hit/i.test(name)) { await pg.evaluate(o => { const k = document.querySelector('.arn-kb'); if (k && o) k.open = true; /* the Arena (Nov 19): the table sits in the board behind the KO Board bar */ const d = document.querySelector('[data-dcfold="g"]'); if (d) d.open = o; }, open); await pg.waitForTimeout(300); return; } if (/full type chart/i.test(name)) { await pg.evaluate(o => { const d = document.querySelector('[data-tcfold]'); if (d) d.open = o; }, open); await pg.waitForTimeout(300); return; } if (/^how it works$/i.test(name) && await pg.$('#main [data-trfold]')) { await pg.evaluate(o => { const d = document.querySelector('#main [data-trfold]'); if (d) d.open = o; }, open); await pg.waitForTimeout(300); return; } if (/^matchup prep$/i.test(name) && await pg.$('#main .tr-prep')) { await pg.evaluate(o => { const d = document.querySelector('#main .tr-card .tr-prep'); if (d) d.open = o; }, open); await pg.waitForTimeout(300); return; } const k = TABS[String(name).toLowerCase()]; if (k) return tab(k, open); if (/watch out/i.test(name)) { if (!open) NOT('closing Watch out (always open, no fold)'); return; } { const h = await pg.evaluateHandle(t => [...document.querySelectorAll('#main details > summary')].find(s => s.getClientRects().length && s.innerText.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(t.toLowerCase())) || null, String(name)); const el = h.asElement(); if (el) { if (await el.evaluate(s => s.parentElement.open) !== open) { await el.click(); await pg.waitForTimeout(400); } return; } } NOT('fold ' + name); },
    async isFoldOpen(name) { const k = TABS[String(name).toLowerCase()]; if (k) return pg.evaluate(k => { const b = document.querySelector(`[data-bttab="${k}"]`); return b ? b.getAttribute('aria-expanded') === 'true' : null; }, k); if (/watch out/i.test(name)) NOT('remembering Watch out open/closed (always open)'); const g = await pg.evaluate(t => { const d = [...document.querySelectorAll('#main details')].find(e => { const s = e.querySelector(':scope > summary'); return s && s.getClientRects().length && s.innerText.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(t.toLowerCase()); }); return d ? d.open : null; }, String(name)); if (g != null) return g; NOT('fold ' + name); },
    async foldText(name) { if (/^events checked/i.test(name) && await pg.$('#main details.trk-evs')) return pg.evaluate(() => document.querySelector('#main details.trk-evs').innerText.replace(/\s+/g, ' ').trim()); if (/^how it works$/i.test(name) && await pg.$('#main [data-trfold]')) return pg.evaluate(() => document.querySelector('#main [data-trfold]').innerText.replace(/\s+/g, ' ').trim()); if (/^matchup prep$/i.test(name) && await pg.$('#main .tr-prep')) return pg.evaluate(() => document.querySelector('#main .tr-card .tr-prep').innerText.replace(/\s+/g, ' ').trim()); if (/your six vs the field/i.test(name)) return pg.evaluate(() => { const d = document.querySelector('.sp2-sum'); return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; }); if (/best hit/i.test(name)) return pg.evaluate(() => { const k = document.querySelector('.arn-kb'); if (k) k.open = true; const d = document.querySelector('[data-dcfold="g"]'); return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; }); if (/^battle log/i.test(name)) { await closeSheet(); let t = await pg.evaluate(() => { const e = document.querySelector('.bt-log'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; });
        if (await pg.$('[data-btrecord]')) { await click('[data-btrecord]', 500); t += ' ' + await pg.evaluate(() => { const e = document.querySelector('.np-sheet .bt-rec'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }); await closeSheet(); } return t; }
      const k = TABS[String(name).toLowerCase()]; if (k) { await tab(k, true); return pg.evaluate(() => { const p = document.querySelector('.bt-pane'); return p ? p.innerText.replace(/\s+/g, ' ').trim() : ''; }); }
      if (/watch out/i.test(name)) return pg.evaluate(() => { const w = document.querySelector('.bt-watch'); return w ? w.innerText.replace(/\s+/g, ' ').trim() : ''; }); NOT('fold ' + name); },
    async battleSpeedOrder() { await tab('spd', true); return pg.evaluate(() => [...document.querySelectorAll('.bt-spd li')].map(li => { const nm = li.querySelector('.nm'); const t = nm.cloneNode(true); t.querySelectorAll('small,.sd').forEach(x => x.remove());
      return {name: t.innerText.replace(/\s+/g, ' ').trim(), side: li.classList.contains('me') ? 'you' : 'them', speed: +li.querySelector('.v').innerText.replace(/\D/g, '')}; })); },
    async damageGrid() { await tab('dmg', true); return pg.evaluate(() => { const p = document.querySelector('.bt-pane'); if (!p) return '';
      // the desktop table or the phone list, whichever shows; cells read "<n>% <KO> <move>" like today's grid text
      const parts = [...p.querySelectorAll('.bt-hx,.bt-dv')].filter(e => e.getClientRects().length).map(e => { const b = e.querySelector('b'), i = e.querySelector('i'), mv = e.querySelector('.mv,small'); return `${b ? b.innerText : ''} ${mv ? mv.innerText : ''} ${i ? i.innerText : ''}`; });
      return 'Damage both ways ' + parts.join(' | ').replace(/\s+/g, ' '); }); },
    damageRow: () => NOT('damageRow (not used by the Battle-page tests)'),
    // "?" tips: the new site's tip button (aria-label = the tip's title) and its bubble
    async openHelp(name) { const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('#main [data-v2tip]')].find(x => (x.getAttribute('aria-label') || '').toLowerCase() === n.toLowerCase()); if (!b) return false; b.click(); return true; }, String(name));
      if (!ok) NOT(`the "?" tip "${name}" on Battle`); await pg.waitForTimeout(300); return pg.evaluate(() => { const e = document.querySelector('.sg2-tipop'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }); },
    // ---- Test Run (Nov 14, src/v2/pages/gauntlet.js). A card's "You: ready for X of their 6 / Them: ready for Y of your 6" is the tug bar's
    // label (its screen-reader text; on screen it is the two bars with X/6 and Y/6), so a card's text here is its label + its words.
    async waitTestRun(ms = 30000) { return ui.waitFor(/you.re better prepared/i, ms); },
    // Nov 14, Three Piles (Sim's pick): every team is a card in one of three piles; no bare scores on screen. A card's text here is today's
    // readiness label from the same rows the page draws (V2.trCache), then the card's own words, then the open card's words when it is open.
    testRunCards: () => pg.evaluate(() => { const R = (V2.trCache && V2.trCache.rows) || [], n = (document.querySelectorAll('#main .tp-card').length && window.__ev ? window.__ev('members().length') : 6);
      const cards = [...document.querySelectorAll('#main .tp-card')].filter(e => e.getClientRects().length); if (!cards.length) return [...document.querySelectorAll('#main .tr-card')].filter(e => e.getClientRects().length).map(c => c.innerText.replace(/\s+/g, ' ').trim());
      const open = document.querySelector('#main .tp-open'), T = e => (e.getAttribute('aria-label') || '') + ' ' + e.innerText;
      return cards.map(c => { const x = R.find(r => r.ix === +c.dataset.tpflip), pr = x && x.pr, lab = pr ? `You: ready for ${pr.yN} of their ${pr.n}. Them: ready for ${pr.tN} of your ${n}. ` : '';
        return (lab + T(c) + (c.classList.contains('on') && open ? ' ' + open.innerText : '')).replace(/\s+/g, ' ').trim(); }); }),
    async testRunPractice(i = 0) { const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('#main [data-trbat]')].filter(e => e.getClientRects().length)[i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no test run card ' + i); await pg.waitForTimeout(900); },
    async testRunCopy(i = 0) { const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('#main [data-trcopy]')].filter(e => e.getClientRects().length)[i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no copy button ' + i); await pg.waitForTimeout(500); },
    /** Pokémon on one card marked "No answer" (the red "!"): their names, from each sprite's label */
    testRunNoAnswer: (i = 0) => pg.evaluate(i => { const c = [...document.querySelectorAll('#main .tr-card')].filter(e => e.getClientRects().length)[i]; if (!c) return null;
      return [...c.querySelectorAll('.tr-six .m.no')].map(e => (e.getAttribute('aria-label') || '').split(':')[0]); }, i),
    // ---- My Team · Matchups (src/v2/pages/matchups.js): the view slider (Stand-Outs | Top 10 | Top 12 Grid | All 30), rows / tiles /
    // grid rows are [data-muthr]; a tap opens the threat sheet (.mu-sh, today's scouting report). Names match case-insensitively
    // (title case on the new site: "Top 12 Grid" for today's "Top 12 grid").
    async matchupsView(name) { const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('#main [data-v2slide="thr"] > button')].find(b => b.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === n.toLowerCase()); if (!b) return false; b.click(); return true; }, name);
      if (!ok) throw new Error('no Matchups view ' + name); await pg.waitForTimeout(600); },
    threatRows: () => pg.evaluate(() => [...document.querySelectorAll('#main [data-muthr]')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim() || e.getAttribute('aria-label') || '')),
    async tapThreat(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('#main [data-muthr]')].find(e => e.getClientRects().length && (e.innerText.replace(/\s+/g, ' ').includes(n) || (e.getAttribute('aria-label') || '').includes(n))); if (!e) return false; e.click(); return true; }, name);
      if (!ok) throw new Error('no threat ' + name); await pg.waitForTimeout(800); },
    scoutSheet: () => pg.evaluate(() => { const s = document.querySelector('.np-sheet .mu-sh'); return s && s.getClientRects().length ? s.innerText.replace(/\s+/g, ' ').trim() : null; }),
    matchupsText: () => pg.evaluate(() => { const s = document.querySelector('#main #tm-mu'); return s ? s.innerText.replace(/\s+/g, ' ').trim() : ''; }),
    matchupGrid: () => pg.evaluate(() => { const g = document.querySelector('#main .mu-grid'); if (!g || !g.getClientRects().length) return null; const rows = [...g.querySelectorAll('[role=row][data-muthr]')].filter(e => e.getClientRects().length);
      return {rows: rows.length, cols: rows[0] ? rows[0].querySelectorAll('[role=cell]').length : 0}; }),
    /** is the keyboard focus inside the open sheet (the threat sheet) */
    focusInSheet: () => pg.evaluate(() => { const s = document.querySelector('.np-sheet'); return !!(s && s.contains(document.activeElement)); }),
    // ---- Battle: their six shown as art (the poster's "Their Six" half; the two-column page's .bt-theirs before their plan is in) ----
    opponentPictures: () => pg.evaluate(() => new Set([...document.querySelectorAll('#main .pbp-half.them [data-v2mon], #main .bt-theirs [data-v2mon]')].filter(b => b.getClientRects().length && b.querySelector('img')).map(b => b.dataset.v2mon)).size),
    /** top (px) of a visible button with this exact text in the page; the calc's weather / terrain names answer for their field card's list */
    buttonTop: (label, scrollToMiddle = false) => pg.evaluate(([l, sc]) => { let b = [...document.querySelectorAll('#main button')].find(e => e.innerText.trim() === l && e.getClientRects().length);
      if (!b) { const s = [...document.querySelectorAll('#main .dc2 [data-dcfield]')].find(s => [...s.options].some(o => o.text === l)); b = s && (s.closest('label,.dc2-fc,[class*=field]') || s); }
      if (!b || !b.getClientRects().length) return null; if (sc) b.scrollIntoView({block: 'center'}); return b.getBoundingClientRect().top; }, [label, scrollToMiddle]),
    /** two quick taps (150 ms apart) on a visible button in the page by its exact text */
    async doubleTap(label) { for (let k = 0; k < 2; k++) { const ok = await pg.evaluate(l => { const b = [...document.querySelectorAll('#main button')].find(e => e.innerText.trim() === l && e.getClientRects().length); if (!b) return false; b.click(); return true; }, label);
        if (!ok) throw new Error('no visible button ' + label); await pg.waitForTimeout(150); } await pg.waitForTimeout(300); },
    // ---- Track Record (src/v2/pages/track.js): the week-by-week chart is svg.trk-svg, one polyline per band ----
    trackChartLines: () => pg.evaluate(() => Math.max(0, ...[...document.querySelectorAll('#main svg.trk-svg')].map(s => s.querySelectorAll('path,polyline').length))),
    // ---- "Your Games" on My Team (record.js: V2.ygSec on the page, V2.ygHtml the Log a Game sheet). Today's quickLogText reads the card
    // with its open panel; here the panel is a sheet, so the card's text and the open sheet's text are read together.
    async quickLogOpen() { await click('[data-yglog]', 500); },
    async quickLogLead(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('[data-yglead]')].find(e => e.getClientRects().length && (e.dataset.yglead === n || (e.getAttribute('aria-label') || '').replace(/, lead$/, '').trim() === n)); if (!e) return false; e.click(); return true; }, name);
      if (!ok) throw new Error('no lead chip ' + name); await pg.waitForTimeout(400); },
    async quickLogResult(r) { await click(`[data-ygres="${r}"]`, 700); },
    async quickLogUndo() { await click('[data-ygundo]', 700); },
    quickLogText: () => pg.evaluate(() => { const T = e => e && e.getClientRects().length ? e.innerText.replace(/\s+/g, ' ').trim() : ''; return [T(document.querySelector('#main .tm-yg')), T(document.querySelector('.np-sheet .yg2'))].filter(Boolean).join(' '); }),
    // ---- Speed Tiers (Nov 13, src/v2/pages/speed.js) and the tools bar. Translation notes: "Race track" / "List view" are the Track / List
    // slider; "Your six vs the field" is the always-open line per member under the track; the tools bar (700+) is today's tool switch.
    async toolSwitch(name, wait = 700) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('.bt-tools a')].find(e => e.getClientRects().length && e.innerText.trim().toLowerCase() === n.toLowerCase()); if (e) { e.click(); return true; } return false; }, name); if (!ok) throw new Error('no tool ' + name + ' in the tools bar'); await pg.waitForTimeout(wait); },
    toolSwitchChosen: () => pg.evaluate(() => { const e = [...document.querySelectorAll('.bt-tools a.on')].find(e => e.getClientRects().length); return e ? e.innerText.trim() : null; }),
    async toolSwitchKey(name, wait = 700) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('.bt-tools a')].find(e => e.getClientRects().length && e.innerText.trim().toLowerCase() === n.toLowerCase()); if (e) { e.focus(); return true; } return false; }, name); if (!ok) throw new Error('no tool ' + name); await pg.keyboard.press('Enter'); await pg.waitForTimeout(wait); },
    speedOrder: () => pg.evaluate(() => [...document.querySelectorAll('.sp2 .sp2-m,.sp2 .sp2-vs .chip2,.sp2 .sp2-list .sp2-li')].filter(e => e.getClientRects().length).map(e => (e.getAttribute('aria-label') || e.innerText).split(/[,:]/)[0].replace(/^\d+\s+/, '').replace(/\s+/g, ' ').trim())), /* pl-5d: '231 Garchomp: Speed' */
    speedRowText: () => pg.evaluate(() => [...document.querySelectorAll('.sp2 .sp2-list li')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    async openInfoSheet(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('#main [data-v2mon]')].find(e => e.getClientRects().length && e.dataset.v2mon === n); if (e) { e.click(); return true; } return false; }, name); if (!ok) throw new Error('no ' + name + ' to tap');
      await pg.waitForTimeout(900); return pg.evaluate(() => { const s = [...document.querySelectorAll('[role=dialog]')].find(e => !e.hidden && e.getClientRects().length); if (s) return s.innerText.replace(/\s+/g, ' ').slice(0, 400); const pk = document.querySelector('#main .pk'); return pk && V2.route() === 'pokemon' ? pk.innerText.replace(/\s+/g, ' ').slice(0, 400) : ''; }); }, /* Nov 15: a Pokémon tap opens its page */
    // ---- Damage Calc (Nov 14, "Their Side", src/v2/pages/calc.js). Translation notes: the move strips are the move in play + the hand
    // (data-dcmv); weather and terrain are field cards with a list each (data-dcfield), so "Sun"/"Rain"/"No weather"... read and set
    // that list; the set boxes keep today's ids inside the two set folds; the best-hits table is the fold under the KO Board.
    calcSides: () => pg.evaluate(() => ({a: document.querySelector('#dcA').selectedOptions[0].text, d: document.querySelector('#dcD').selectedOptions[0].text, move: document.querySelector('#dcMv').selectedOptions[0].text})),
    async calcPick(side, name) { const id = side === 'attacker' ? '#dcA' : '#dcD'; const v = await pg.evaluate(([id, n]) => { const o = [...document.querySelector(id).options].find(o => o.text === n); return o ? o.value : null; }, [id, name]);
      if (v == null) throw new Error('no Pokémon ' + name); await pg.selectOption(id, v); await pg.waitForTimeout(600); },
    async calcMove(name) { const cur = await pg.evaluate(() => window.__ev('dc.mv')); if (cur === name) return; await click(`.dc2 [data-dcmv="${name}"]`, 600); },
    async calcOtherMove(name) { const v = await pg.evaluate(n => { const o = [...document.querySelector('#dcMv').options].find(o => o.text === n); return o ? o.value : null; }, name); if (v == null) throw new Error('no move ' + name); await pg.selectOption('#dcMv', v); await pg.waitForTimeout(600); },
    calcMoveStrips: () => pg.evaluate(() => [...document.querySelectorAll('.pc-mvs [data-dcmv]')].filter(e => e.getClientRects().length).map(e => ({move: e.dataset.dcmv, on: e.getAttribute('aria-pressed') === 'true', dmg: (e.querySelector('em') || {}).textContent || ''}))), /* Nov 21: Plot the hit (Sim approved): the three move swipes (.pc-mvs; was the Arena's .arn-mvs), the chosen one pressed; dmg = the damage in HP written on the swipe */
    /* Nov 21: Plot the hit (Sim approved): the answer as the player reads it (damage in HP, the defender's HP, the circled verdict, the small line)
       beside the engine's own hit for the same state (calcData().r: min, max, HP and the 16 rolls), so a test can compare the two */
    calcAnswer: () => pg.evaluate(() => { const a = document.querySelector('.pc-ans'); if (!a || !a.getClientRects().length) return null; const q = s => { const e = a.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
      let eng = null; try { const r = window.__ev('calcData().r'); if (r) eng = {min: r.min, max: r.max, hp: r.hp, rolls: (r.rolls || []).slice()}; } catch (e) {}
      return {l1: q('.pc-l1'), dmg: q('.pc-big'), l2: q('.pc-l2'), verdict: q('.pc-vd'), sm: q('.pc-sm'), eng}; }),
    async calcSet(side, field, value) { const M = {attacker: {points: 'dcASp', nature: 'dcANat', item: 'dcAIt', ability: 'dcAAb', stage: 'dcABo'}, defender: {hp: 'dcDHp', def: 'dcDDf', spd: 'dcDSd', nature: 'dcDNat', item: 'dcDIt', ability: 'dcDAb', stage: 'dcDBo'}};
      if (field === 'stage') { const w = side === 'attacker' ? 'a' : 'd'; for (let k = 0; k < 8; k++) { const cur = await pg.evaluate(w => { const o = document.getElementById(w === 'a' ? 'dcABo' : 'dcDBo'); return o ? +o.textContent.replace('±', '').replace('−', '-') : null; }, w); if (cur === null) throw new Error('no stage row'); if (cur === +value) return; await click(`[data-arnst="${w}"][data-d="${cur < +value ? 1 : -1}"]`, 300); } throw new Error('stage ' + value + ' not reached'); } /* the Arena (Nov 19): the stage is minus / plus, not a list */
      const id = M[side][field]; await pg.evaluate(id => { document.querySelectorAll('details').forEach(d => { if (d.contains(document.getElementById(id))) d.open = true; }); }, id); await pg.waitForTimeout(150);
      const v = await pg.evaluate(([id, val]) => { const s = document.getElementById(id); const o = [...s.options].find(o => o.value === String(val) || o.text === String(val) || o.text.startsWith(String(val) + ' ')); return o ? o.value : null; }, [id, value]);
      if (v == null) throw new Error(`no ${field} option ${value}`); await pg.selectOption('#' + id, v); await pg.waitForTimeout(500); },
    calcSetValue: (side, field) => pg.evaluate(([s, f]) => { const id = {attacker: {points: 'dcASp', nature: 'dcANat'}, defender: {hp: 'dcDHp', def: 'dcDDf', spd: 'dcDSd', nature: 'dcDNat'}}[s][f]; const e = document.getElementById(id); return e ? e.selectedOptions[0].text : null; }, [side, field]),
    calcSetChoices: (side, field) => field === 'stage' ? Promise.resolve(['-2', '-1', '0', '+1', '+2']) /* the Arena: minus / plus within -2..+2 (no list to read) */ : pg.evaluate(([s, f]) => { const id = {attacker: {item: 'dcAIt', nature: 'dcANat', stage: 'dcABo'}, defender: {item: 'dcDIt', nature: 'dcDNat', stage: 'dcDBo'}}[s][f]; const e = document.getElementById(id); return e ? [...e.options].map(o => o.text) : null; }, [side, field]),
    async calcSwap() { await click('#dcSwap', 600); },
    // reload with some data documents missing (today's helper, unchanged)
    async reloadWithout(doc, wait = 1500) { await pg.addInitScript(d => { d = [].concat(d); const c = window.claude; if (!c) return; const use = c.use; window.claude = {use: async n => { const r = await use(n); if (n !== 'db' || !r) return r;
        const doc = p => d.includes(p) ? {get: async () => ({exists: false, data: () => undefined}), set: async () => {}, update: async () => {}, onSnapshot: cb => { setTimeout(() => cb({exists: false, metadata: {}, data: () => undefined}), 5); return () => {}; }} : r.doc(p);
        return {doc, collection: k => ({doc: x => doc(k + '/' + x)})}; }}; }, doc); await pg.reload(); await pg.waitForTimeout(wait); },
    // ---- Team Preview Practice (Nov 14, Arena VS) ----
    async practicePick(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('.pp2 [data-ppick]')].find(e => e.getClientRects().length && (e.dataset.ppick === n || e.innerText.replace(/\s+/g, ' ').includes(n))); if (!e) return false; e.click(); return true; }, name); if (!ok) NOT('practice pick ' + name + ' (not in your six on screen)'); await pg.waitForTimeout(300); },
    practiceMine: () => pg.evaluate(() => [...document.querySelectorAll('.pp2 [data-ppick]')].filter(e => e.getClientRects().length).map(e => e.dataset.ppick)),
    isDisabled: label => pg.evaluate(l => { const b = [...document.querySelectorAll('button')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === String(l).toLowerCase()); return b ? b.disabled : null; }, label),
    // ---- Type Chart (Nov 14, concept A): read the page as a person would ----
    pickedTypes: () => pg.evaluate(() => [...document.querySelectorAll('.tc [data-tctype][aria-pressed="true"]')].map(e => e.innerText.trim())),
    async tapType(t) { await click(`.tc [data-tctype="${t}"]`, 400); },
    async clearTypes() { await click('.tc [data-tcclear]', 400); },
    async lookUpPokemon(text) { await pg.fill('.tc [data-tcfind]', text); await pg.waitForTimeout(300); await pg.press('.tc [data-tcfind]', 'Enter'); await pg.waitForTimeout(600); },
    typesUnder: head => pg.evaluate(h => { const k = {'4× weak': 'b4', '2× weak': 'b2', '½ resist': 'bh', '¼ resist': 'bq', 'Immune': 'b0'}[h]; const b = k && document.querySelector(`.tc-band.${k}`);
      return b ? [...b.querySelectorAll('.ts .np-type')].map(e => e.innerText.trim()) : null; }, head),
    async tapAttackingType(t) { await click(`.tc-prow [data-tcatk="${t}"]`, 400); },
    typeRowText: () => pg.evaluate(() => { const e = document.querySelector('.tc-prow'); return e && e.getClientRects().length ? e.innerText.replace(/\s+/g, ' ').trim() : null; }),
    typeGridShown: () => pg.evaluate(() => { const e = document.querySelector('.tc-grid'); return !!(e && e.getClientRects().length && e.querySelectorAll('td').length >= 18 * 18); }),
    calcResult: () => pg.evaluate(() => [...document.querySelectorAll('.pc-ans,.arn-notes')].map(e => e.textContent).join(' ').replace(/\s+/g, ' ').trim()), /* Nov 21: Plot the hit (Sim approved): the answer (.pc-ans; was the Arena's verdict plate) and Notes on this hit (today's Details, in a fold: read whole) */
    calcResultOnly: () => pg.evaluate(() => [...document.querySelectorAll('.pc-ans,.arn-notes')].map(e => e.textContent).join(' ').replace(/\s+/g, ' ').trim()), /* Nov 21: Plot the hit (Sim approved): the answer (.pc-ans; was the Arena's .arn-verdict plate) and Notes on this hit */
    calcPokemonGroups: () => pg.evaluate(() => [...document.querySelectorAll('#dcA optgroup')].map(g => g.label + ':' + g.children.length)),
    calcPinnedBar: () => pg.evaluate(() => { const e = [...document.querySelectorAll('.dc2 *')].find(x => /^(fixed|sticky)$/.test(getComputedStyle(x).position) && x.getClientRects().length); return e ? e.innerText.replace(/\s+/g, ' ').trim() || 'pinned' : null; }), // looks for any pinned element in the calc (Sim, Nov 14, Q3 A: none)
    tapCalcPinnedBar: () => NOT('the pinned result bar (the new calc has none)'),
    calcResultOnScreen: () => pg.evaluate(() => { const e = document.querySelector('.pc-vd'); /* Nov 21: Plot the hit (Sim approved): the circled verdict (was .arn-verdict) */ const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }),
    scrollToEnd: () => pg.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)).then(() => pg.waitForTimeout(300)),
    openDialog: () => pg.evaluate(() => { const s = [...document.querySelectorAll('[role=dialog]')].find(e => !e.hidden && e.getClientRects().length && e.innerText.trim()); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 2000) : ''; }),
    // pressed state: the calc's weather / terrain lists answer for their values; everything else reads aria-pressed like today's helper
    isPressed: label => pg.evaluate(([m, re]) => { const R = re ? new RegExp(re[0], re[1]) : null, hit = t => R ? R.test(t) : t.toLowerCase() === String(m).toLowerCase();
      for (const s of document.querySelectorAll('.dc2 [data-dcfield]')) for (const o of s.options) { const names = [o.text, o.text.replace(/^No (weather|terrain)$/i, 'No $1')]; if (names.some(hit)) return s.value === o.value; }
      const T = e => (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      const els = [...document.querySelectorAll('[aria-pressed],[aria-selected],[aria-checked]')].filter(e => e.getClientRects().length); const e = els.find(e => hit(T(e))) || els.find(e => !R && T(e).toLowerCase().includes(String(m).toLowerCase()));
      return e ? (e.getAttribute('aria-pressed') || e.getAttribute('aria-selected') || e.getAttribute('aria-checked')) === 'true' : null; }, [String(label), label instanceof RegExp ? [label.source, label.flags] : null]),
  };
  // the other Battle pages: every helper the current adapter has that isn't wired here names itself as missing
  const OTHER = ['mainTab', 'tapMainTab', 'openMenu', 'menuGroup', 'tapMenu', 'toolSwitch', 'toolSwitchChosen', 'toolSwitchKey', 'opponentPictures', 'buttonTop', 'doubleTap', 'trackChartLines', 'scrollToEnd', 'focusInSheet',
    'quickLogOpen', 'quickLogLead', 'quickLogResult', 'quickLogUndo', 'quickLogText',
    'calcPick', 'calcMove', 'calcOtherMove', 'calcMoveStrips', 'calcSet', 'calcSetValue', 'calcSetChoices', 'calcSwap', 'calcResult', 'calcPokemonGroups', 'speedOrder', 'speedRowText', 'openInfoSheet', 'openDialog', 'pickedTypes', 'tapType', 'clearTypes',
    'lookUpPokemon', 'typesUnder', 'tapAttackingType', 'typeRowText', 'typeGridShown', 'waitTestRun', 'testRunCards', 'testRunPractice', 'testRunCopy', 'testRunNoAnswer', 'calcResultOnly', 'calcPinnedBar', 'tapCalcPinnedBar', 'calcResultOnScreen',
    'reloadWithout', 'practicePick', 'practiceMine', 'practiceScore', 'matchupsView', 'threatRows', 'tapThreat', 'scoutSheet', 'matchupsText', 'matchupGrid', 'isPressed', 'isDisabled'];
  for (const k of OTHER) if (!(k in A) && !(k in ui)) A[k] = () => NOT(`${k} (a Battle-group helper for a page or feature the new site doesn't have yet)`);
  return A;
};
