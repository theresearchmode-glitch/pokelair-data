// Group B (Build, Build for Me, Cores, All suggestions, suggestions, Popular Sets, Archetypes): helpers for TODAY's site.
// The rebuild adapter must offer the same names with the same meaning. Named for what the player does or sees; every
// today-specific selector or internal read for group B lives here, never in B-build.mjs.
const RE = m => m instanceof RegExp ? [m.source, m.flags] : null;
export default (ui, pg) => {
  // visible text of the first visible element matching sel ('' if none)
  const txt = sel => pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const vis = sel => pg.evaluate(s => [...document.querySelectorAll(s)].some(e => e.getClientRects().length && !e.closest('[hidden]')), sel);
  const click = async (sel, wait = 400) => { const ok = await pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')); if (e) { e.click(); return true; } return false; }, sel);
    if (!ok) throw new Error(`nothing visible: ${sel}`); await pg.waitForTimeout(wait); };
  const until = async (fn, ms = 8000, what = 'condition') => { const t0 = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`); await pg.waitForTimeout(150); } };
  const H = {
    /** generic waiting: resolve when fn() is truthy (polls; no fixed sleeps) */
    until,
    /** wait until this text is visible somewhere on the page */
    waitSee: (m, ms = 8000) => until(() => ui.sees(m), ms, `"${m}" to show`),
    /** the toast message showing now ('' if none) */
    toast: () => txt('#toast'),
    /** wait for a toast whose text matches; returns its text */
    waitForToast: (m, ms = 6000) => until(async () => { const t = await txt('#toast'); return t && (m instanceof RegExp ? m.test(t) : t.toLowerCase().includes(String(m).toLowerCase())) ? t : ''; }, ms, `toast ${m}`),
    /** does the showing toast offer Undo? */
    toastHasUndo: () => vis('#toastUndo'),
    /** tap Undo in the toast */
    undoToast: () => click('#toastUndo', 600),
    /** is the visible control (button/tab) with this text pressed/selected? (aria-pressed) null if not found */
    pressed: (m, within = 'body') => pg.evaluate(([m, re, w]) => { const r = re ? new RegExp(re[0], re[1]) : null, t = e => (e.innerText || e.getAttribute('data-slt') || '').replace(/\s+/g, ' ').trim();
      const root = document.querySelector(w) || document.body;
      const e = [...root.querySelectorAll('[aria-pressed]')].find(e => e.getClientRects().length && !e.closest('[hidden]') && (r ? r.test(t(e)) || r.test(e.getAttribute('data-slt') || '') : t(e).toLowerCase().includes(m.toLowerCase())));
      return e ? e.getAttribute('aria-pressed') === 'true' : null; }, [String(m), RE(m), within]),
    /** open a fold (details) whose heading matches; returns the fold's text */
    unfold: async (m, within = 'body') => { const r = await pg.evaluate(([m, re, w]) => { const rx = re ? new RegExp(re[0], re[1]) : null; const root = document.querySelector(w) || document.body;
        const d = [...root.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); if (!s || !s.getClientRects().length || d.closest('[hidden]')) return false; const t = s.innerText.replace(/\s+/g, ' ');
          return rx ? rx.test(t) : t.toLowerCase().includes(m.toLowerCase()); });
        if (!d) return null; if (!d.open) d.querySelector(':scope > summary').click(); return true; }, [String(m), RE(m), within]);
      if (!r) throw new Error(`no fold ${m}`); await pg.waitForTimeout(400);
      return pg.evaluate(([m, re, w]) => { const rx = re ? new RegExp(re[0], re[1]) : null; const root = document.querySelector(w) || document.body;
        const d = [...root.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); if (!s || !s.getClientRects().length) return false; const t = s.innerText.replace(/\s+/g, ' '); return rx ? rx.test(t) : t.toLowerCase().includes(m.toLowerCase()); });
        return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; }, [String(m), RE(m), within]); },
    /** is that fold open? (null if not shown) */
    isUnfolded: m => pg.evaluate(([m, re]) => { const rx = re ? new RegExp(re[0], re[1]) : null;
      const d = [...document.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); if (!s || !s.getClientRects().length) return false; const t = s.innerText.replace(/\s+/g, ' '); return rx ? rx.test(t) : t.toLowerCase().includes(m.toLowerCase()); });
      return d ? d.open : null; }, [String(m), RE(m)]),
    /** the Megas-on-team value shown on this page (0/1/2), from the visible pressed control */
    megasShown: () => pg.evaluate(() => { const b = [...document.querySelectorAll('[data-megas][aria-pressed=true]')].find(e => e.getClientRects().length); return b ? +b.dataset.megas : null; }),
    /** tap a Megas-on-team choice on this page */
    setMegas: (n, wait = 600) => click(`[data-megas="${n}"]`, wait),
    /** the sliding picker's circle position (0-based) of the visible Megas control */
    megasSliderPos: () => pg.evaluate(() => { const b = [...document.querySelectorAll('[data-megas]')].find(e => e.getClientRects().length); const s = b && b.closest('.ar-slide'); return s ? +getComputedStyle(s).getPropertyValue('--i') : null; }),
    /** a choice button's icon count inside a sliding picker */
    sliderHasIcons: () => pg.evaluate(() => { const b = [...document.querySelectorAll('[data-megas]')].find(e => e.getClientRects().length); const s = b && b.closest('.ar-slide'); return s ? s.querySelectorAll('svg').length : 0; }),
    /** the screen-reader view of the visible Megas control: [{name, pressed}] */
    megasButtons: () => pg.evaluate(() => { const b = [...document.querySelectorAll('[data-megas]')].find(e => e.getClientRects().length); const g = b && (b.closest('.ar-slide') || b.parentElement);
      return g ? [...g.querySelectorAll('button[aria-pressed]')].map(x => ({name: (x.getAttribute('data-slt') || x.innerText).trim(), pressed: x.getAttribute('aria-pressed')})) : []; }),



    // ---------------- misc for group B ----------------
    /** the anonymous usage counts this visit has saved (forces the save a page-hide would do) */
    usageCounts: async () => { await pg.evaluate(() => { try { Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'hidden'}); } catch (e) {} document.dispatchEvent(new Event('visibilitychange')); });
      await pg.waitForTimeout(500); return pg.evaluate(() => { const d = window.__acct['usage/u_test']; if (!d || !d.s) return null; const k = Object.keys(d.s)[0]; return k ? d.s[k].c : null; }); },
    /** the label on a built-team tile */
    builtTileLabel: (i = 0) => pg.evaluate(i => { const b = [...document.querySelectorAll('#abOut [data-lt]')].filter(e => e.getClientRects().length)[i]; return b ? b.innerText.replace(/\s+/g, ' ').trim() : ''; }, i),
    /** open the info sheet of a Pokémon shown on the current page (tap its row / tile) */
    openInfoSheetFor: async id => { await H.until(() => pg.evaluate(id => { const e = [...document.querySelectorAll(`[data-lt="${id}"]`)].find(e => e.getClientRects().length); if (e) { e.click(); return true; } return false; }, id), 8000, 'Pokémon ' + id); await pg.waitForTimeout(700); },
    /** the built card's Save button: {disabled, title} */
    builtSaveButton: () => pg.evaluate(() => { const b = document.querySelector('#abOut [data-absave]'); return b ? {disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.title || b.getAttribute('data-tipx') || b.getAttribute('aria-label') || ''} : null; }),
    /** the six on the n-th recent-winner card (by Pokémon id) */
    winnerSix: (n = 0) => pg.evaluate(n => { const b = [...document.querySelectorAll('[data-pane=auto] [data-evload]')].filter(e => e.getClientRects().length)[n]; const c = b && b.closest('.evteam'); return c ? [...new Set([...c.querySelectorAll('[data-lt]')].map(e => e.getAttribute('data-lt')))] : []; }, n),
    /** the text of the explanation opened by a ? button */
    openTipText: () => txt('#tipPop'),
    clearCoreFilter: () => click('#cores [data-corex]', 600),
    coreFilterChip: () => pg.evaluate(() => { const b = [...document.querySelectorAll('#cores [data-corex]')].find(e => e.getClientRects().length); return b ? b.parentElement.innerText.trim() : ''; }),
    /** the Battle opponents (ids) */
    opponents: () => pg.evaluate(() => window.__ev('S.opp.slice()')),

    // ---------------- Pokémon name boxes ----------------
    /** type into a visible box found by its placeholder / label (retries if the page redraws under the finger) */
    typeInto: async (label, text, enter = false) => { for (let k = 0; ; k++) { try { await ui.type(label, text, enter); return; } catch (e) { if (k >= 3 || !/not attached|detached/i.test(e.message)) throw e; await pg.waitForTimeout(500); } } },
    /** the value now in that box */
    boxValue: label => pg.evaluate(m => { const l = m.toLowerCase(); const i = [...document.querySelectorAll('input')].find(i => i.getClientRects().length && ((i.placeholder || '').toLowerCase().includes(l) || (i.getAttribute('aria-label') || '').toLowerCase().includes(l))); return i ? i.value : null; }, label),
    /** is that box focused? */
    boxFocused: label => pg.evaluate(m => { const l = m.toLowerCase(), i = document.activeElement; return !!i && i.tagName === 'INPUT' && ((i.placeholder || '').toLowerCase().includes(l) || (i.getAttribute('aria-label') || '').toLowerCase().includes(l)); }, label),
    /** the × (Clear) inside that box: shown? */
    clearShown: label => pg.evaluate(m => { const l = m.toLowerCase(); const i = [...document.querySelectorAll('input')].find(i => i.getClientRects().length && (i.placeholder || '').toLowerCase().includes(l)); const b = i && i.parentElement.querySelector('[aria-label=Clear]'); return !!b && b.getClientRects().length > 0 && getComputedStyle(b).visibility !== 'hidden' && getComputedStyle(b).display !== 'none'; }, label),
    tapClear: async label => { await pg.evaluate(m => { const l = m.toLowerCase(); const i = [...document.querySelectorAll('input')].find(i => i.getClientRects().length && (i.placeholder || '').toLowerCase().includes(l)); const b = i.parentElement.querySelector('[aria-label=Clear]');
        b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); b.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true})); b.click(); }, label); await pg.waitForTimeout(400); },
    /** the name list (combobox) open under a box: its text, '' if closed */
    nameList: () => txt('[role=listbox]'),
    /** the box's top edge on screen (px) */
    boxTop: label => pg.evaluate(m => { const l = m.toLowerCase(); const i = [...document.querySelectorAll('input')].find(i => i.getClientRects().length && (i.placeholder || '').toLowerCase().includes(l)); return i ? Math.round(i.getBoundingClientRect().top) : null; }, label),
    focusBox: async label => { await pg.evaluate(m => { const l = m.toLowerCase(); const i = [...document.querySelectorAll('input')].find(i => i.getClientRects().length && (i.placeholder || '').toLowerCase().includes(l)); i.focus(); }, label); await pg.waitForTimeout(900); },

    // ---------------- Build for Me ----------------
    /** the build result area text (after a build) */
    buildResult: () => txt('#abOut'),
    /** state of the main Build button: {disabled, busy, label} */
    buildButton: () => pg.evaluate(() => { const b = document.getElementById('abBtn'); return b ? {disabled: b.disabled, busy: b.getAttribute('aria-busy') === 'true', label: b.innerText.trim(), primary: b.classList.contains('ar-primary')} : null; }),
    /** tap "Build me a team" and wait until a team or a no-result note shows; returns the result text */
    buildMeATeam: async (ms = 40000) => { await click('#abBtn', 100);
      return until(async () => { const b = await pg.evaluate(() => { const b = document.getElementById('abBtn'); return b && b.getAttribute('aria-busy') === 'true'; });
        const t = await txt('#abOut'); return !b && /Strength Score|usable Pokémon|No strong team|No legal team/.test(t) ? t : ''; }, ms, 'a built team'); },
    /** tap the main button without waiting (for the busy state) */
    tapBuild: () => click('#abBtn', 30),
    /** wait until the build option count settles to "Option k of n" (the fresh take arrives later); returns n */
    waitOptions: async (n, ms = 30000) => until(async () => { const m = (await txt('#abOut')).match(/Option (\d+) of (\d+)/); return m && (!n || +m[2] >= n) ? +m[2] : 0; }, ms, `Option … of ${n}`),
    /** the six names on the built team card (as the page names them) */
    builtSix: () => pg.evaluate(() => [...document.querySelectorAll('#abOut [data-lt]')].filter(e => e.getClientRects().length && e.closest('.ar-art,button')).map(e => e.getAttribute('data-lt')).filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)),
    tryAnother: () => ui.tap(/^Try another/, '#abOut', 500),
    useThisTeam: () => ui.tap(/^Use this team/, '#abOut', 800),
    saveBuiltTeam: () => ui.tap(/^Save$/, '#abOut', 600),
    /** pick "Build around" Pokémon by typing part of its name and pressing Enter */
    buildAround: async typed => { await H.typeInto('favourite Pokémon', typed); await pg.keyboard.press('Enter'); await pg.waitForTimeout(500); },
    /** the Build-around chip text ('' if none) */
    buildAroundChip: () => pg.evaluate(() => { const i = document.getElementById('abAroundIn'); const w = i && (i.closest('#abAround') || i.parentElement.parentElement); const c = w && [...w.querySelectorAll('[data-abaroundclr]')].find(e => e.getClientRects().length); return c ? (c.closest('span,div') || c).innerText.replace(/\s+/g, ' ').trim() + ' ' + (c.getAttribute('aria-label') || '') : ''; }),
    clearBuildAround: () => click('[data-abaroundclr]', 500),
    /** the open Showdown text after tapping a Copy for Showdown button (the n-th visible one inside `within`) */
    copyForShowdown: async (within = 'body', n = 0) => { await pg.evaluate(() => { window.__copied = null; try { Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: t => { window.__copied = t; return Promise.resolve(); }}}); } catch (e) {} });
      await pg.evaluate(([w, n]) => { const b = [...(document.querySelector(w) || document).querySelectorAll('[data-sdcopy]')].filter(e => e.getClientRects().length)[n]; if (!b) throw new Error('no Copy for Showdown button'); b.click(); }, [within, n]);
      await pg.waitForTimeout(500); return pg.evaluate(() => window.__copied || (document.getElementById('sdText') || {}).value || ''); },
    /** is the Pokémon info sheet open, and its text */
    infoSheetText: () => txt('#lairSheet'),
    /** tap a built-team tile (by position) */
    tapBuiltTile: (i = 0) => pg.evaluate(i => { const b = [...document.querySelectorAll('#abOut [data-lt]')].filter(e => e.getClientRects().length)[i]; b.click(); return b.getAttribute('data-lt'); }, i),
    /** the "In your box" count line under My box */
    boxCountLine: () => txt('#abBoxN'),

    // ---------------- Cores ----------------
    coresText: () => txt('#cores'),
    /** number of core rows listed (big cards + fold rows) */
    coreRowCount: () => pg.evaluate(() => document.querySelectorAll('#cores [data-coreuse]').length),
    /** the first visible core's "use" button text and key */
    coreTap: async (label, n = 0) => { await pg.evaluate(([l, n]) => { const b = [...document.querySelectorAll('#cores button')].filter(e => e.getClientRects().length && e.innerText.trim().toLowerCase().startsWith(l.toLowerCase()))[n]; if (!b) throw new Error('no core button ' + l); b.click(); }, [label, n]); await pg.waitForTimeout(700); },
    /** names in the n-th visible core (from its Add/Load button) */
    coreMembers: (n = 0) => pg.evaluate(n => { const b = [...document.querySelectorAll('#cores [data-coreuse]')].filter(e => e.getClientRects().length)[n]; return b ? b.dataset.coreuse.split('|') : []; }, n),
    /** is the cores section near the top of the screen? */
    coresTopOnScreen: () => pg.evaluate(() => { const c = document.getElementById('cores'); if (!c) return null; const r = c.getBoundingClientRect(); return Math.round(r.top); }),

    // ---------------- All suggestions / suggestions ----------------
    /** the swap / add cards on All suggestions: [{text, button}] */
    swapCards: () => pg.evaluate(() => [...document.querySelectorAll('#recList [data-rec]')].filter(e => e.getClientRects().length).map(b => { const c = b.closest('.card,.rec,article,li,div'); let k = b; for (let i = 0; i < 6 && k.parentElement && !k.parentElement.matches('#recList'); i++) k = k.parentElement;
      return {text: k.innerText.replace(/\s+/g, ' ').trim(), button: b.innerText.trim()}; })),
    /** tap the n-th swap card's button */
    applySwap: (n = 0) => click(`#recList [data-rec="${n}"]`, 900),
    /** wait until the All suggestions list has finished working */
    waitSwaps: () => until(async () => !(await ui.sees('Working out the best swaps')) && (await pg.evaluate(() => document.querySelectorAll('#recList [data-rec]').length || /Add at least two|Nothing in your box|Nothing in this pool/i.test(document.getElementById('recs')?.innerText || ''))), 20000, 'swap cards'),
    /** My team's Suggestions part text */
    mySuggestions: () => txt('#chSugOut'),
    /** wait until My team's suggestions have finished working; returns their text */
    waitMySuggestions: () => until(async () => { const t = await txt('#chSugOut'); return t && !/Working out/.test(t) && !(await pg.evaluate(() => !!document.querySelector('#chSugOut [aria-busy=true]'))) ? t : ''; }, 25000, 'suggestions'),
    /** tap Apply on the n-th suggestion on My team */
    applyMySuggestion: (n = 0) => click(`#chSugOut [data-plan="${n}"]`, 900),
    /** "Bigger plans" text on All suggestions (opens the fold) */
    biggerPlans: async () => { await H.unfold(/^Bigger Plans/i); return until(async () => { const t = await txt('#planSec'); return t && !/Working out/.test(t) ? t : ''; }, 25000, 'bigger plans'); },
    /** apply the n-th plan inside Bigger plans */
    applyPlan: (n = 0) => click(`#planSec [data-plan="${n}"]`, 900),
    /** the Undo bar text where it shows ('' if none) */
    undoBarText: () => pg.evaluate(() => { const b = [...document.querySelectorAll('[data-undobar]')].find(e => e.getClientRects().length); const h = b && (b.closest('.chundohost') || b.parentElement); return h ? h.innerText.replace(/\s+/g, ' ').trim() : ''; }),
    undoLastApplied: () => click('[data-undobar]', 900),
    /** the plan settings: Pick from value (label) */
    pickFrom: () => pg.evaluate(() => { const s = document.getElementById('poolSel'); return s ? s.options[s.selectedIndex].text : null; }),
    setPickFrom: async label => { await pg.evaluate(l => { const s = document.getElementById('poolSel'); const o = [...s.options].find(o => o.text.toLowerCase().startsWith(l.toLowerCase())); s.value = o.value; s.dispatchEvent(new Event('change', {bubbles: true})); }, label); await pg.waitForTimeout(600); },
    pickFromOptions: () => pg.evaluate(() => [...document.getElementById('poolSel').options].map(o => o.text)),
    /** Plan settings toggles */
    toggleSetting: async (name) => { const id = {'Let plans swap my Mega': 'swapMega', 'Count abilities': 'useAbil'}[name]; await pg.evaluate(id => { const c = document.getElementById(id); c.click(); }, id); await pg.waitForTimeout(500); },
    settingOn: name => pg.evaluate(id => document.getElementById(id).checked, {'Let plans swap my Mega': 'swapMega', 'Count abilities': 'useAbil'}[name]),
    /** Never suggest: add a Pokémon */
    neverSuggest: async typed => { await H.typeInto('Exclude a Pokémon', typed); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600); },
    neverSuggestList: () => txt('#exclList'),
    allowAgain: name => click(`#exclList [aria-label*="${name}"]`, 600),
    /** the problem rows text (My team › Problems and team checks) */
    problems: () => txt('#needs'),
    /** the edit panel (My team) */
    editPanelState: () => pg.evaluate(() => { const t = document.getElementById('chEditT'); const p = t && t.closest('[role=dialog],aside,section,div'); const open = t && t.getClientRects().length > 0; return open ? {title: t.innerText.trim(), strip: [...document.querySelectorAll('#chEdit [data-chedit]')].filter(e => e.getClientRects().length).length} : null; }),
    openEditFor: i => click(`[data-chedit="${i}"]`, 700),
    /** set one Pokémon's item / moves the way the set editor saves them (player edits a set) */
    setItem: (i, item) => pg.evaluate(([i, it]) => window.__ev(`S.slots[${i}].it={doubles:${JSON.stringify(it)}};render()`), [i, item]),
    setMoves: (i, mv) => pg.evaluate(([i, mv]) => window.__ev(`S.slots[${i}].mv={doubles:${JSON.stringify(mv)}};render()`), [i, mv]),
    slotSet: i => pg.evaluate(i => window.__ev(`JSON.parse(JSON.stringify(S.slots[${i}]))`), i),
    lockState: () => pg.evaluate(() => window.__ev('S.slots.map(s=>!!s.lock)')),

    // ---------------- Popular sets / Archetypes ----------------
    setsShownFor: () => txt('#setsOut h2, #setsOut h3, #sets .sethead, #sets h3'),
    /** the Your-team picker on Popular sets: [{name, pressed}] */
    setsTeamPicker: () => pg.evaluate(() => [...document.querySelectorAll('[data-setmon]')].filter(e => e.getClientRects().length && e.closest('#setQuick')).map(e => ({name: e.getAttribute('data-setmon'), pressed: e.getAttribute('aria-pressed')}))),
    showSetsOfTeamMember: n => click(`#setQuick [data-setmon="${n}"]`, 600),
    tapTeammate: n => click(`#sets [data-setmon="${n}"]:not(#setQuick *)`, 700),
    setsText: () => txt('[data-pane="sets"]'),
    archText: () => txt('[data-pane="arch"]'),
    pageScrollY: () => pg.evaluate(() => Math.round(pageScrollY)),
    scrollPageTo: y => pg.evaluate(y => window.scrollPageTo(0, y), y),
    back: async () => { await pg.goBack(); await pg.waitForTimeout(700); },
    focusedId: () => pg.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName)),
    inputValue: id => pg.evaluate(id => (document.getElementById(id) || {}).value, id),
  };
  return H;
};
