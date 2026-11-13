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
    async tapIn(m, wait = 400) { return ui.tap(m, '#main', wait); },
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
    async openFold(name, open = true) { if (/^(battle log|recent battles|log a game)/i.test(name)) return; const k = TABS[String(name).toLowerCase()]; if (k) return tab(k, open); if (/watch out/i.test(name)) { if (!open) NOT('closing Watch out (always open, no fold)'); return; } NOT('fold ' + name); },
    async isFoldOpen(name) { const k = TABS[String(name).toLowerCase()]; if (k) return pg.evaluate(k => { const b = document.querySelector(`[data-bttab="${k}"]`); return b ? b.getAttribute('aria-expanded') === 'true' : null; }, k); if (/watch out/i.test(name)) NOT('remembering Watch out open/closed (always open)'); NOT('fold ' + name); },
    async foldText(name) { if (/^battle log/i.test(name)) { await closeSheet(); let t = await pg.evaluate(() => { const e = document.querySelector('.bt-log'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; });
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
    calcSides: () => NOT('Damage Calc page'),
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
