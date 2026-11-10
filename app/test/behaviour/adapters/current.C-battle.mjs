// Group C (Battle pages) helpers for TODAY's site. Named for what the player does; the rebuild adapter offers the same names.
// Only this file knows today's selectors (data-* attributes, ids). Tests in C-battle.mjs use these plus the main adapter.
const RX = m => m instanceof RegExp ? [m.source, m.flags] : null;

export default (ui, pg) => {
  // ---- small generic bits ----
  /** text of the visible page, without the option lists of drop-downs (they hold ~90 team names / ~345 Pokémon) */
  const cleanText = sel => pg.evaluate(sel => { const root = sel ? document.querySelector(sel) : [...document.querySelectorAll('[data-pane]')].find(e => !e.hidden && e.getClientRects().length);
    if (!root) return ''; const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const p = n.parentElement; if (!p || p.closest('select,option,script,style')) continue;
      if (!p.getClientRects().length || getComputedStyle(p).visibility === 'hidden') continue; out.push(n.nodeValue); }
    return out.join(' ').replace(/\s+/g, ' ').trim(); }, sel || null);
  const clickSel = async (sel, wait = 400) => { const ok = await pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length); if (!e) return false; e.click(); return true; }, sel);
    if (!ok) throw new Error('nothing visible for ' + sel); await pg.waitForTimeout(wait); };
  const pane = () => pg.evaluate(() => { const p = [...document.querySelectorAll('[data-pane]')].find(e => !e.hidden && e.getClientRects().length); return p ? p.dataset.pane : null; });

  const A = {
    /** visible page text without drop-down option lists */
    pageText: () => cleanText(),
    /** wait until the page shows this text (string: case-insensitive contains; RegExp) */
    async waitFor(m, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ui.sees(m)) return true; await pg.waitForTimeout(150); } return false; },
    /** the toast message the page shows (waits for one; '' if none shows) */
    async toast(ms = 2500) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const t = await pg.evaluate(() => { const e = document.getElementById('toast'); return e && !e.hidden && e.getClientRects().length ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }); if (t) return t; await pg.waitForTimeout(100); } return ''; },
    /** is a visible control with this exact-ish label pressed / chosen (aria-pressed / aria-checked / aria-selected) */
    isPressed: label => pg.evaluate(([m, re]) => { const T = e => (e.innerText || e.dataset.slt || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      const R = re ? new RegExp(re[0], re[1]) : null; const els = [...document.querySelectorAll('[aria-pressed],[aria-checked],[aria-selected]')].filter(e => e.getClientRects().length);
      const e = els.find(e => R ? R.test(T(e)) : T(e).toLowerCase() === m.toLowerCase()) || els.find(e => !R && T(e).toLowerCase().startsWith(m.toLowerCase()));
      if (!e) return null; return ['aria-pressed', 'aria-checked', 'aria-selected'].some(a => e.getAttribute(a) === 'true'); }, [String(label), RX(label)]),
    /** is a visible control with this label disabled */
    isDisabled: label => pg.evaluate(m => { const e = [...document.querySelectorAll('button')].filter(e => e.getClientRects().length).find(e => (e.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase().startsWith(m.toLowerCase())); return e ? e.disabled || e.getAttribute('aria-disabled') === 'true' : null; }, label),
    /** tap a "?" help button by its accessible name (e.g. "What the calc counts") and return the bubble's text */
    async openHelp(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('[data-tip]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || '').toLowerCase().includes(n.toLowerCase())); if (!e) return false; e.click(); return true; }, name);
      if (!ok) throw new Error('no help button ' + name); await pg.waitForTimeout(400); return pg.evaluate(() => { const p = document.getElementById('tipPop'); return p && p.getClientRects().length ? p.innerText.replace(/\s+/g, ' ').trim() : ''; }); },
    /** tap a visible control inside the page being shown (not the menu/nav), by its text */
    async tapIn(m, wait = 400) { const p = await pane(); return ui.tap(m, `[data-pane="${p}"]`, wait); },

    // ---- navigation ----
    /** the highlighted main tab (bottom bar on phones, top tabs on wide screens) */
    mainTab: () => pg.evaluate(() => { const e = [...document.querySelectorAll('[role=tab][aria-selected="true"][data-view]')].find(e => e.getClientRects().length); return e ? e.innerText.replace(/\s+/g, ' ').replace(/\s*\d+\/\d+$/, '').trim() : null; }),
    /** tap a main tab (Home / Build / My Team / Battle / Meta) */
    async tapMainTab(name, wait = 700) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('[role=tab][data-view]')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(n.toLowerCase())); if (!e) return false; e.click(); return true; }, name);
      if (!ok) throw new Error('no main tab ' + name); await pg.waitForTimeout(wait); },
    /** open the "More pages and settings" menu */
    async openMenu() { await clickSel('#moreBtn', 600); },
    /** entries of one menu group, in order (menu must be open) */
    menuGroup: name => pg.evaluate(n => { const g = [...document.querySelectorAll('.sgroup')].find(g => (g.innerText || '').trim().split('\n')[0].trim().toLowerCase() === n.toLowerCase());
      return g ? [...g.querySelectorAll('[data-view]')].map(e => e.innerText.replace(/\s+/g, ' ').replace(/\s*\d+\/\d+$/, '').trim()) : null; }, name),
    /** tap a menu entry by its name (menu must be open) */
    async tapMenu(name, wait = 700) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('.sgroup [data-view]')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === n.toLowerCase()); if (!e) return false; e.click(); return true; }, name);
      if (!ok) throw new Error('no menu entry ' + name); await pg.waitForTimeout(wait); },
    /** the Speed tiers / Damage calc / Type chart switch: choose one, and read which is chosen */
    async toolSwitch(name, wait = 700) { const p = await pane(); const ok = await pg.evaluate(([p, n]) => { const e = [...document.querySelectorAll(`[data-pane="${p}"] .toolsw [data-view]`)].find(e => e.getClientRects().length && (e.dataset.slt || e.innerText).trim().toLowerCase() === n.toLowerCase()); if (!e) return false; e.click(); return true; }, [p, name]);
      if (!ok) throw new Error('no tool switch choice ' + name); await pg.waitForTimeout(wait); },
    toolSwitchChosen: () => pane().then(p => pg.evaluate(p => { const e = [...document.querySelectorAll(`[data-pane="${p}"] .toolsw [data-view]`)].find(e => e.getClientRects().length && e.getAttribute('aria-pressed') === 'true'); return e ? (e.dataset.slt || e.innerText).trim() : null; }, p)),
    /** focus the tool switch choice and press Enter (keyboard use) */
    async toolSwitchKey(name, wait = 700) { const p = await pane(); const h = await pg.evaluateHandle(([p, n]) => [...document.querySelectorAll(`[data-pane="${p}"] .toolsw [data-view]`)].find(e => e.getClientRects().length && (e.dataset.slt || e.innerText).trim().toLowerCase() === n.toLowerCase()) || null, [p, name]);
      const el = h.asElement(); if (!el) throw new Error('no tool switch choice ' + name); await el.focus(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(wait); },

    // ---- Battle: their six ----
    /** type into their box n (1-6) without picking */
    async typeOpponent(n, text) { await ui.type(`Their Pokémon ${n}`, text); },
    /** the suggestion list currently open */
    suggestions: () => pg.evaluate(() => [...document.querySelectorAll('[role=option]')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    /** type each name into the next empty box of their six and pick it with Enter */
    async enterOpponents(names) { for (const n of names) { const i = await pg.evaluate(() => { for (let k = 0; k < 6; k++) { const e = document.getElementById('bmOpp' + k); if (e && e.getClientRects().length) return k + 1; } return 0; });
        if (!i) throw new Error('no empty box left in their six'); await ui.type(`Their Pokémon ${i}`, n); await pg.keyboard.press('Enter'); await pg.waitForTimeout(500); } },
    /** names shown in their six (from each filled tile's remove button) */
    opponents: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane=matchup] [aria-label^="Remove "]')].filter(e => e.getClientRects().length).map(e => e.getAttribute('aria-label').slice(7))),
    /** tap × on one of theirs */
    async removeOpponent(name) { await clickSel(`[data-pane=matchup] [aria-label="Remove ${name}"]`, 600); },
    /** which input has the keyboard focus: 'their N' for a box of their six, else its label */
    focused: () => pg.evaluate(() => { const a = document.activeElement; if (!a) return null; const l = a.getAttribute('aria-label') || a.placeholder || a.id; const m = /^Their Pokémon (\d)$/.exec(l || ''); return m ? 'their ' + m[1] : l; }),
    async clearOpponents() { await ui.tap('Clear their six', '[data-pane=matchup]', 600); },
    /** "Practice against a top team" drop-down */
    tournamentTeams: () => pg.evaluate(() => { const s = document.querySelector('#oppTeamSel'); return s && s.getClientRects().length ? [...s.options].map(o => o.text) : null; }),
    tournamentTeamChosen: () => pg.evaluate(() => { const s = document.querySelector('#oppTeamSel'); return s ? s.selectedOptions[0].text : null; }),
    async pickTournamentTeam(index = 1) { await pg.selectOption('#oppTeamSel', {index}); await pg.waitForTimeout(800); },
    /** recent opponents row: the one-tap buttons' labels ("Load a, b, …") */
    recentOpponents: () => pg.evaluate(() => [...document.querySelectorAll('[data-arrecent]')].filter(e => e.getClientRects().length).map(e => e.getAttribute('aria-label'))),
    async loadRecentOpponent(i = 0) { const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('[data-arrecent]')].filter(e => e.getClientRects().length)[i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no recent opponent ' + i); await pg.waitForTimeout(600); },

    // ---- Battle: plan ----
    /** the Plan / Speed / Damage switch: is it on screen, and tap one */
    planSwitchShown: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane=matchup] [data-bmt]')].some(e => e.getClientRects().length && e.getBoundingClientRect().width > 0 && getComputedStyle(e).visibility !== 'hidden')),
    async planSwitch(name) { await clickSel(`[data-pane=matchup] [data-bmt][data-slt="${name}"], [data-pane=matchup] [data-bmt="${name.toLowerCase() === 'damage' ? 'dmg' : name.toLowerCase()}"]`, 500); },
    /** a fold (details/summary) by the start of its title: open / close / read */
    async openFold(title, open = true, wait = 500) { const ok = await pg.evaluate(([t, o]) => { const d = [...document.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); return s && s.getClientRects().length && s.innerText.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(t.toLowerCase()); });
        if (!d) return false; if (d.open !== o) d.querySelector(':scope > summary').click(); return true; }, [title, open]);
      if (!ok) throw new Error('no fold titled ' + title); await pg.waitForTimeout(wait); },
    isFoldOpen: title => pg.evaluate(t => { const d = [...document.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); return s && s.getClientRects().length && s.innerText.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(t.toLowerCase()); }); return d ? d.open : null; }, title),
    /** text inside one fold */
    foldText: title => pg.evaluate(t => { const d = [...document.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); return s && s.getClientRects().length && s.innerText.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(t.toLowerCase()); }); return d ? d.innerText.replace(/\s+/g, ' ').trim() : null; }, title),
    /** the "Who moves first" bar list, top to bottom: [{name, speed}] */
    battleSpeedOrder: () => pg.evaluate(() => { const c = [...document.querySelectorAll('[data-pane=matchup] [data-t="speed"]')][0]; if (!c) return null;
      const T = c.innerText; const i = T.indexOf('Weather:'); const body = T.slice(i).split('\n').slice(1).join('\n'); const j = body.indexOf('Moves that skip');
      const rows = []; const re = /^(.+?)\s*(?:Tie\s*)?\n?\s*(\d+)\b/gm; const lines = (j > 0 ? body.slice(0, j) : body).split('\n').map(s => s.trim()).filter(Boolean);
      for (let k = 0; k < lines.length; k++) { if (/^\d+$/.test(lines[k]) && k > 0) { let n = lines[k - 1]; if (n === 'Tie' && k > 1) n = lines[k - 2]; rows.push({name: n, speed: +lines[k]}); } }
      return rows; }),
    /** the damage grid of "Damage both ways": {rowName: [cell texts]} */
    damageGrid: () => pg.evaluate(() => { const c = document.querySelector('[data-pane=matchup] [data-t="dmg"]'); if (!c) return null; return c.innerText.replace(/\s+/g, ' ').trim(); }),
    /** numbers in "Damage both ways" for one of your rows: all "<n>% <Move>" pairs as [{pct, move}] */
    damageRow: name => pg.evaluate(n => { const c = document.querySelector('[data-pane=matchup] [data-t="dmg"]'); if (!c) return null; const T = c.innerText.replace(/\s+/g, ' ');
      const names = ['Mega Charizard Y', 'Garchomp', 'Whimsicott', 'Rillaboom', 'Incineroar', 'Sneasler']; const i = T.lastIndexOf(n + ' '); if (i < 0) return null;
      let rest = T.slice(i + n.length); const ends = names.filter(x => x !== n).map(x => rest.indexOf(' ' + x + ' ')).filter(x => x > 0).concat([rest.indexOf('% your best hit')]).filter(x => x > 0); const e = Math.min(...ends, rest.length); rest = rest.slice(0, e);
      return [...rest.matchAll(/(\d+)% ([A-Z][A-Za-z' -]+?)(?= \d+%| vs |$)/g)].map(m => ({pct: +m[1], move: m[2].trim()})); }, name),

    // ---- Battle log ----
    /** your six as chips in the Battle log: [{name, on, order}] */
    logChips: () => pg.evaluate(() => [...document.querySelectorAll('[data-logpick]')].filter(e => e.getClientRects().length).map(e => ({name: (e.querySelector('span') || e).innerText.trim(), on: e.getAttribute('aria-pressed') === 'true', order: (e.querySelector('b') || {}).innerText || ''}))),
    async logPick(name) { await clickSel(`[data-logpick="${await pg.evaluate(n => { const e = [...document.querySelectorAll('[data-logpick]')].find(e => (e.querySelector('span') || e).innerText.trim() === n); return e ? e.dataset.logpick : n; }, name)}"]`, 400); },
    /** Win / Loss in the Battle log (result 'W' or 'L') */
    async logResult(r) { await clickSel(`[data-logres="${r}"]`, 700); },
    logResultEnabled: r => pg.evaluate(r => { const e = document.querySelector(`[data-logres="${r}"]`); return e ? !e.disabled : null; }, r),
    /** a whole game: open the Battle log, pick these four (or keep the pre-filled four), tap Win/Loss */
    async logGame(result, four) { await A.openFold('Battle log'); if (four) { for (const c of await A.logChips()) if (c.on) await A.logPick(c.name); for (const n of four) await A.logPick(n); } await A.logResult(result === 'W' || /win/i.test(result) ? 'W' : 'L'); },
    /** rows of "Recent battles" */
    recentBattles: () => pg.evaluate(() => [...document.querySelectorAll('[data-logdel]')].filter(e => e.closest('details') ? true : e.getClientRects().length).map(e => (e.closest('li,tr,div') || e).innerText.replace(/\s+/g, ' ').trim())),
    async deleteBattle(i = 0) { await A.openFold('Recent battles'); const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('[data-logdel]')].filter(e => e.getClientRects().length)[i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no battle row ' + i); await pg.waitForTimeout(600); },
    /** replay import: paste text, or give a file, then read the result line */
    async pasteReplay(text) { await A.openFold('Log a game from a Showdown replay'); await pg.fill('#replayIn', text); await clickSel('#replayAdd', 700); },
    async uploadReplay(path) { await A.openFold('Log a game from a Showdown replay'); await pg.setInputFiles('#replayFile', path); await pg.waitForTimeout(900); },
    replayMessage: () => pg.evaluate(() => { const e = document.getElementById('replayOut'); return e ? e.innerText.trim() : null; }),
    /** saved games (what the page holds; the rebuild maps this to its own log) */
    savedGames: () => ui.peek('(S.log||[]).map(g=>({r:g.r,b:g.b.slice(),o:(g.o||[]).slice()}))'),

    // ---- "Your games · this six" on My team ----
    async quickLogOpen() { await clickSel('[data-qlopen]', 500); },
    async quickLogLead(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('[data-qllead]')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim().startsWith(n)); if (!e) return false; e.click(); return true; }, name); if (!ok) throw new Error('no lead chip ' + name); await pg.waitForTimeout(400); },
    async quickLogResult(r) { await clickSel(`[data-qlres="${r}"]`, 700); },
    async quickLogUndo() { await clickSel('[data-qlundo]', 700); },
    quickLogText: () => pg.evaluate(() => { const b = document.querySelector('[data-qlopen]'); let c = b; while (c && !/Your games/i.test(c.innerText.slice(0, 40))) c = c.parentElement; return c ? c.innerText.replace(/\s+/g, ' ').trim() : ''; }),

    // ---- Damage calc ----
    calcSides: () => pg.evaluate(() => ({a: document.querySelector('#dcA').selectedOptions[0].text, d: document.querySelector('#dcD').selectedOptions[0].text, move: document.querySelector('#dcMv').selectedOptions[0].text})),
    async calcPick(side, name) { const id = side === 'attacker' ? '#dcA' : '#dcD'; const v = await pg.evaluate(([id, n]) => { const o = [...document.querySelector(id).options].find(o => o.text === n); return o ? o.value : null; }, [id, name]);
      if (v == null) throw new Error('no ' + side + ' option ' + name); await pg.selectOption(id, v); await pg.waitForTimeout(600); },
    async calcMove(name) { await clickSel(`[data-ardcmv="${name}"]`, 600); },
    async calcOtherMove(name) { const v = await pg.evaluate(n => { const o = [...document.querySelector('#dcMv').options].find(o => o.text === n); return o ? o.value : null; }, name); if (v == null) throw new Error('no move ' + name); await pg.selectOption('#dcMv', v); await pg.waitForTimeout(600); },
    calcMoveStrips: () => pg.evaluate(() => [...document.querySelectorAll('[data-ardcmv]')].filter(e => e.getClientRects().length).map(e => ({move: e.dataset.ardcmv, on: e.getAttribute('aria-pressed') === 'true'}))),
    /** set one "Set details" field: side 'attacker'|'defender', field 'points'|'hp'|'def'|'spd'|'nature'|'item'|'ability'|'stage' */
    async calcSet(side, field, value) { const M = {attacker: {points: 'dcASp', nature: 'dcANat', item: 'dcAIt', ability: 'dcAAb', stage: 'dcABo'}, defender: {hp: 'dcDHp', def: 'dcDDf', spd: 'dcDSd', nature: 'dcDNat', item: 'dcDIt', ability: 'dcDAb', stage: 'dcDBo'}};
      const id = M[side][field]; await A.openFold('Set details', true, 200).catch(() => {}); await pg.evaluate(id => { document.querySelectorAll('details').forEach(d => { if (d.contains(document.getElementById(id))) d.open = true; }); }, id);
      const v = await pg.evaluate(([id, val]) => { const s = document.getElementById(id); const o = [...s.options].find(o => o.value === String(val) || o.text === String(val) || o.text.startsWith(String(val) + ' ')); return o ? o.value : null; }, [id, value]);
      if (v == null) throw new Error(`no ${field} option ${value}`); await pg.selectOption('#' + id, v); await pg.waitForTimeout(500); },
    calcSetValue: (side, field) => pg.evaluate(([s, f]) => { const id = {attacker: {points: 'dcASp', nature: 'dcANat'}, defender: {hp: 'dcDHp', def: 'dcDDf', spd: 'dcDSd', nature: 'dcDNat'}}[s][f]; const e = document.getElementById(id); return e ? e.selectedOptions[0].text : null; }, [side, field]),
    calcSetChoices: (side, field) => pg.evaluate(([s, f]) => { const id = {attacker: {item: 'dcAIt', nature: 'dcANat', stage: 'dcABo'}, defender: {item: 'dcDIt', nature: 'dcDNat', stage: 'dcDBo'}}[s][f]; const e = document.getElementById(id); return e ? [...e.options].map(o => o.text) : null; }, [side, field]),
    async calcSwap() { await clickSel('#dcSwap', 600); },
    /** the result: big % line, KO line and notes (text of the calc result area) */
    calcResult: () => cleanText('#dcOut'),
    calcPokemonGroups: () => pg.evaluate(() => [...document.querySelectorAll('#dcA optgroup')].map(g => g.label + ':' + g.children.length)),

    // ---- Speed tiers ----
    /** Speed tiers order as shown (race track markers or list rows): names, fastest first unless Trick Room */
    speedOrder: () => pg.evaluate(() => { const p = document.querySelector('[data-pane=speed]'); const els = [...p.querySelectorAll('[data-lt]')].filter(e => e.getClientRects().length);
      return els.map(e => ({name: e.dataset.lt, text: e.innerText.replace(/\s+/g, ' ').trim(), speed: +((/(\d+)\s*$/.exec(e.innerText.replace(/\s+/g, ' ').trim()) || /(\d+)/.exec(e.innerText) || [0, 0])[1])})); }),
    speedRowText: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane=speed] .spdlist > *')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    /** open a Pokémon's info sheet from a marker/row; returns the sheet's text */
    async openInfoSheet(lt) { await clickSel(`[data-pane="${await pane()}"] [data-lt="${lt}"]`, 900); return pg.evaluate(() => { const s = [...document.querySelectorAll('[role=dialog]')].find(e => !e.hidden && e.getClientRects().length); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 400) : ''; }); },
    openDialog: () => pg.evaluate(() => { const s = [...document.querySelectorAll('[role=dialog]')].find(e => !e.hidden && e.getClientRects().length && e.innerText.trim()); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 2000) : ''; }),

    // ---- Type chart ----
    pickedTypes: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane=types] [data-type][aria-pressed="true"]')].map(e => e.innerText.trim())),
    async tapType(t) { await clickSel(`[data-pane=types] [data-type="${t}"]`, 400); },
    async clearTypes() { await clickSel('#typesClear', 400); },
    async lookUpPokemon(text) { await ui.type('Or look up a Pokémon', text); await pg.keyboard.press('Enter'); await pg.waitForTimeout(500); },
    /** the type list under one heading of the result, e.g. '4× weak', 'Immune' */
    typesUnder: head => pg.evaluate(h => { const p = document.querySelector('#typesOut'); if (!p) return null; const T = p.innerText.split('\n').map(s => s.trim()).filter(Boolean);
      const heads = ['4× weak', '2× weak', '½ resist', '¼ resist', 'Immune', 'Everything not listed']; const i = T.findIndex(l => l.toLowerCase() === h.toLowerCase()); if (i < 0) return null;
      const out = []; for (let k = i + 1; k < T.length && !heads.some(x => T[k].toLowerCase().startsWith(x.toLowerCase())); k++) out.push(T[k]); return out; }, head),
    async tapAttackingType(t) { await clickSel(`[data-tcatk="${t}"]`, 400); },
    typeRowText: () => pg.evaluate(() => { const e = document.getElementById('typeRow'); return e && e.getClientRects().length ? e.innerText.replace(/\s+/g, ' ').trim() : null; }),
    typeGridShown: () => pg.evaluate(() => { const e = document.getElementById('typeChart'); return !!(e && e.getClientRects().length && e.querySelectorAll('td,[role=cell]').length >= 18 * 18); }),

    // ---- Test run ----
    async waitTestRun(ms = 30000) { return A.waitFor(/you.re better prepared/i, ms); },
    testRunCards: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane=gauntlet] [data-gaunt]')].filter(e => e.getClientRects().length).map(b => { let c = b; while (c && !/You: ready for/.test(c.innerText.slice(0, 40))) c = c.parentElement; return c ? c.innerText.replace(/\s+/g, ' ').trim() : ''; })),
    async testRunPractice(i = 0) { const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('[data-pane=gauntlet] [data-gaunt]')].filter(e => e.getClientRects().length)[i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no test run card ' + i); await pg.waitForTimeout(900); },
    async testRunCopy(i = 0) { const ok = await pg.evaluate(i => { const e = [...document.querySelectorAll('[data-pane=gauntlet] [data-sdcopy]')].filter(e => e.getClientRects().length)[i]; if (!e) return false; e.click(); return true; }, i); if (!ok) throw new Error('no copy button ' + i); await pg.waitForTimeout(500); },
    /** red "!" marks (Pokémon you have no answer to) on one card */
    testRunNoAnswerMarks: (i = 0) => pg.evaluate(i => { const b = [...document.querySelectorAll('[data-pane=gauntlet] [data-gaunt]')].filter(e => e.getClientRects().length)[i]; let c = b; while (c && !/You: ready for/.test(c.innerText.slice(0, 40))) c = c.parentElement; if (!c) return null;
      return [...c.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === '!' && e.getClientRects().length).length; }, i),

    // ---- Practice ----
    async practicePick(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('[data-prpick]')].find(e => e.getClientRects().length && (e.dataset.prpick === n || e.innerText.replace(/\s+/g, ' ').includes(n))); if (!e) return false; e.click(); return true; }, name); if (!ok) throw new Error('no practice tile ' + name); await pg.waitForTimeout(350); },
    practiceMine: () => pg.evaluate(() => [...document.querySelectorAll('[data-prpick]')].filter(e => e.getClientRects().length).map(e => e.dataset.prpick)),
    practiceScore: () => pg.evaluate(() => { try { return JSON.parse(localStorage.getItem('np.practice')); } catch (e) { return null; } }),

    // ---- My team: matchups ----
    async matchupsView(name) { await clickSel(`[data-pane=report] [data-chsegv][data-slt="${name}"]`, 600); },
    threatRows: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane=report] [data-chthr]')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim() || e.getAttribute('aria-label') || '')),
    async tapThreat(name) { const ok = await pg.evaluate(n => { const e = [...document.querySelectorAll('[data-pane=report] [data-chthr], [data-pane=report] [data-chhthr]')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').includes(n)); if (!e) return false; e.click(); return true; }, name); if (!ok) throw new Error('no threat ' + name); await pg.waitForTimeout(800); },
    scoutSheet: () => pg.evaluate(() => { const s = document.getElementById('chScout'); return s && !s.hidden && s.getClientRects().length ? s.innerText.replace(/\s+/g, ' ').trim() : null; }),
    matchupsText: () => pg.evaluate(() => { const e = document.querySelector('[data-pane=report] [data-chsegv]'); let s = e; while (s && !/Matchups/.test(s.innerText.slice(0, 60))) s = s.parentElement; return s ? s.innerText.replace(/\s+/g, ' ').trim() : ''; }),
    /** the 12 x 6 chart under "Top 12 grid": row count and column count */
    matchupGrid: () => pg.evaluate(() => { const t = document.querySelector('#chVsOut table') || document.querySelector('#chVsOut'); if (!t) return null; const rows = [...t.querySelectorAll('tbody tr, [data-chhthr]')].filter(e => e.getClientRects().length); return {rows: rows.length, cols: rows[0] ? rows[0].querySelectorAll('td').length : 0}; }),
  };
  return A;
};
