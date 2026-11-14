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
    logResultEnabled: r => pg.evaluate(r => { const e = document.querySelector(`[data-btlres="${r}"]`); return e ? !e.disabled : null; }, r),
    async logGame(result, four) { if (four) { for (const c of await A.logChips()) if (c.on) await A.logPick(c.name); for (const n of four) await A.logPick(n); } await A.logResult(result === 'W' || /win/i.test(result) ? 'W' : 'L'); },
    async recentBattles() { await closeSheet(); await click('[data-btrecord]', 500); return pg.evaluate(() => [...document.querySelectorAll('.bt-rlist li')].map(e => e.innerText.replace(/\s+/g, ' ').trim())); },
    async deleteBattle(i = 0) { await closeSheet(); await click('[data-btrecord]', 500); const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('[data-btldel]')][i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no battle ' + i); await pg.waitForTimeout(500); },
    async pasteReplay(text) { if (!(await pg.$('.np-sheet [data-btrepin]'))) { await closeSheet(); await click('[data-btreplay]', 500); } await pg.fill('[data-btrepin]', text); await click('[data-btrepgo]', 700); },
    async uploadReplay(path) { if (!(await pg.$('.np-sheet [data-btrepin]'))) { await closeSheet(); await click('[data-btreplay]', 500); } await pg.setInputFiles('[data-btrepfile]', path); await pg.waitForTimeout(900); },
    replayMessage: () => pg.evaluate(() => { const e = document.querySelector('[data-btrepout]'); return e ? e.innerText.trim() : null; }),
    savedGames: () => ui.peek('(S.log||[]).map(g=>({r:g.r,b:g.b.slice(),o:(g.o||[]).slice()}))'),
    async openFold(name, open = true) { if (/^(battle log|recent battles|log a game)/i.test(name)) return; if (/your six vs the field/i.test(name)) return; if (/best hit/i.test(name)) { await pg.evaluate(o => { const d = document.querySelector('[data-dcfold="g"]'); if (d) d.open = o; }, open); await pg.waitForTimeout(300); return; } const k = TABS[String(name).toLowerCase()]; if (k) return tab(k, open); if (/watch out/i.test(name)) { if (!open) NOT('closing Watch out (always open, no fold)'); return; } NOT('fold ' + name); },
    async isFoldOpen(name) { const k = TABS[String(name).toLowerCase()]; if (k) return pg.evaluate(k => { const b = document.querySelector(`[data-bttab="${k}"]`); return b ? b.getAttribute('aria-expanded') === 'true' : null; }, k); if (/watch out/i.test(name)) NOT('remembering Watch out open/closed (always open)'); NOT('fold ' + name); },
    async foldText(name) { if (/your six vs the field/i.test(name)) return pg.evaluate(() => { const d = document.querySelector('.sp2-sum'); return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; }); if (/best hit/i.test(name)) return pg.evaluate(() => { const d = document.querySelector('[data-dcfold="g"]'); return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; }); if (/^battle log/i.test(name)) { await closeSheet(); let t = await pg.evaluate(() => { const e = document.querySelector('.bt-log'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; });
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
    openHelp: name => NOT(`the "?" tip "${name}" on Battle`),
    // ---- Speed Tiers (Nov 13, src/v2/pages/speed.js) and the tools bar. Translation notes: "Race track" / "List view" are the Track / List
    // slider; "Your six vs the field" is the always-open line per member under the track; the tools bar (700+) is today's tool switch.
    async toolSwitch(name, wait = 700) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('.bt-tools a')].find(e => e.getClientRects().length && e.innerText.trim().toLowerCase() === n.toLowerCase()); if (e) { e.click(); return true; } return false; }, name); if (!ok) throw new Error('no tool ' + name + ' in the tools bar'); await pg.waitForTimeout(wait); },
    toolSwitchChosen: () => pg.evaluate(() => { const e = [...document.querySelectorAll('.bt-tools a.on')].find(e => e.getClientRects().length); return e ? e.innerText.trim() : null; }),
    async toolSwitchKey(name, wait = 700) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('.bt-tools a')].find(e => e.getClientRects().length && e.innerText.trim().toLowerCase() === n.toLowerCase()); if (e) { e.focus(); return true; } return false; }, name); if (!ok) throw new Error('no tool ' + name); await pg.keyboard.press('Enter'); await pg.waitForTimeout(wait); },
    speedOrder: () => pg.evaluate(() => [...document.querySelectorAll('.sp2 .sp2-m,.sp2 .sp2-vs .chip2,.sp2 .sp2-list .sp2-li')].filter(e => e.getClientRects().length).map(e => (e.getAttribute('aria-label') || e.innerText).split(',')[0].replace(/\s+/g, ' ').trim())),
    speedRowText: () => pg.evaluate(() => [...document.querySelectorAll('.sp2 .sp2-list li')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    async openInfoSheet(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('#main [data-v2mon]')].find(e => e.getClientRects().length && e.dataset.v2mon === n); if (e) { e.click(); return true; } return false; }, name); if (!ok) throw new Error('no ' + name + ' to tap');
      await pg.waitForTimeout(900); return pg.evaluate(() => { const s = [...document.querySelectorAll('[role=dialog]')].find(e => !e.hidden && e.getClientRects().length); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 400) : ''; }); },
    // ---- Damage Calc (Nov 14, "Their Side", src/v2/pages/calc.js). Translation notes: the move strips are the move in play + the hand
    // (data-dcmv); weather and terrain are field cards with a list each (data-dcfield), so "Sun"/"Rain"/"No weather"... read and set
    // that list; the set boxes keep today's ids inside the two set folds; the best-hits table is the fold under the KO Board.
    calcSides: () => pg.evaluate(() => ({a: document.querySelector('#dcA').selectedOptions[0].text, d: document.querySelector('#dcD').selectedOptions[0].text, move: document.querySelector('#dcMv').selectedOptions[0].text})),
    async calcPick(side, name) { const id = side === 'attacker' ? '#dcA' : '#dcD'; const v = await pg.evaluate(([id, n]) => { const o = [...document.querySelector(id).options].find(o => o.text === n); return o ? o.value : null; }, [id, name]);
      if (v == null) throw new Error('no Pokémon ' + name); await pg.selectOption(id, v); await pg.waitForTimeout(600); },
    async calcMove(name) { const cur = await pg.evaluate(() => window.__ev('dc.mv')); if (cur === name) return; await click(`.dc2 [data-dcmv="${name}"]`, 600); },
    async calcOtherMove(name) { const v = await pg.evaluate(n => { const o = [...document.querySelector('#dcMv').options].find(o => o.text === n); return o ? o.value : null; }, name); if (v == null) throw new Error('no move ' + name); await pg.selectOption('#dcMv', v); await pg.waitForTimeout(600); },
    calcMoveStrips: () => pg.evaluate(() => { const play = document.querySelector('.dc2-mv.play .nm'); return [...(play ? [{move: play.textContent.trim(), on: true}] : []), ...[...document.querySelectorAll('.dc2-hand [data-dcmv]')].map(e => ({move: e.dataset.dcmv, on: false}))]; }),
    async calcSet(side, field, value) { const M = {attacker: {points: 'dcASp', nature: 'dcANat', item: 'dcAIt', ability: 'dcAAb', stage: 'dcABo'}, defender: {hp: 'dcDHp', def: 'dcDDf', spd: 'dcDSd', nature: 'dcDNat', item: 'dcDIt', ability: 'dcDAb', stage: 'dcDBo'}};
      const id = M[side][field]; await pg.evaluate(id => { document.querySelectorAll('details').forEach(d => { if (d.contains(document.getElementById(id))) d.open = true; }); }, id); await pg.waitForTimeout(150);
      const v = await pg.evaluate(([id, val]) => { const s = document.getElementById(id); const o = [...s.options].find(o => o.value === String(val) || o.text === String(val) || o.text.startsWith(String(val) + ' ')); return o ? o.value : null; }, [id, value]);
      if (v == null) throw new Error(`no ${field} option ${value}`); await pg.selectOption('#' + id, v); await pg.waitForTimeout(500); },
    calcSetValue: (side, field) => pg.evaluate(([s, f]) => { const id = {attacker: {points: 'dcASp', nature: 'dcANat'}, defender: {hp: 'dcDHp', def: 'dcDDf', spd: 'dcDSd', nature: 'dcDNat'}}[s][f]; const e = document.getElementById(id); return e ? e.selectedOptions[0].text : null; }, [side, field]),
    calcSetChoices: (side, field) => pg.evaluate(([s, f]) => { const id = {attacker: {item: 'dcAIt', nature: 'dcANat', stage: 'dcABo'}, defender: {item: 'dcDIt', nature: 'dcDNat', stage: 'dcDBo'}}[s][f]; const e = document.getElementById(id); return e ? [...e.options].map(o => o.text) : null; }, [side, field]),
    async calcSwap() { await click('#dcSwap', 600); },
    calcResult: () => pg.evaluate(() => [...document.querySelectorAll('.dc2-res,.dc2-dl')].map(e => e.innerText).join(' ').replace(/\s+/g, ' ').trim()),
    calcResultOnly: () => pg.evaluate(() => [...document.querySelectorAll('.dc2-res,.dc2-dl')].map(e => e.innerText).join(' ').replace(/\s+/g, ' ').trim()),
    calcPokemonGroups: () => pg.evaluate(() => [...document.querySelectorAll('#dcA optgroup')].map(g => g.label + ':' + g.children.length)),
    calcPinnedBar: async () => null, // the new calc has no pinned mini bar (today's is switched off too: Sim, Nov 7)
    tapCalcPinnedBar: () => NOT('the pinned result bar (the new calc has none)'),
    calcResultOnScreen: () => pg.evaluate(() => { const e = document.querySelector('.dc2-res'); const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }),
    scrollToEnd: () => pg.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)).then(() => pg.waitForTimeout(300)),
    openDialog: () => pg.evaluate(() => { const s = [...document.querySelectorAll('[role=dialog]')].find(e => !e.hidden && e.getClientRects().length && e.innerText.trim()); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 2000) : ''; }),
    // pressed state: the calc's weather / terrain lists answer for their values; everything else reads aria-pressed like today's helper
    isPressed: label => pg.evaluate(([m, re]) => { const R = re ? new RegExp(re[0], re[1]) : null, hit = t => R ? R.test(t) : t.toLowerCase() === String(m).toLowerCase();
      for (const s of document.querySelectorAll('.dc2 [data-dcfield]')) for (const o of s.options) { const names = [o.text, o.text.replace(/^No (weather|terrain)$/i, 'No $1')]; if (names.some(hit)) return s.value === o.value; }
      const T = e => (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      const els = [...document.querySelectorAll('[aria-pressed],[aria-selected]')].filter(e => e.getClientRects().length); const e = els.find(e => hit(T(e))) || els.find(e => !R && T(e).toLowerCase().includes(String(m).toLowerCase()));
      return e ? (e.getAttribute('aria-pressed') || e.getAttribute('aria-selected')) === 'true' : null; }, [String(label), label instanceof RegExp ? [label.source, label.flags] : null]),
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
