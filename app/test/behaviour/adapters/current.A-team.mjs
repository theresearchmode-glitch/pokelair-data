// Page helpers for group A (Team) on TODAY's site. The rebuild adapter must offer the same names (same meaning, its own markup).
// Every function is named for what the player does or sees. This is the only A-team file that knows today's selectors.
const TOASTS = () => { try { if (window.__npT) return; window.__npT = [];
  const hook = () => { const el = document.getElementById('toast'); if (!el) return setTimeout(hook, 50);
    const rec = () => { if (!el.hidden) { const t = el.innerText.replace(/\s+/g, ' ').trim(); if (t && window.__npT[window.__npT.length - 1] !== t) window.__npT.push(t); } };
    new MutationObserver(rec).observe(el, {childList: true, subtree: true, attributes: true, characterData: true}); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook(); } catch (e) {} };

export default (ui, pg, o) => {
  pg.addInitScript(TOASTS).catch(() => {}); pg.evaluate(TOASTS).catch(() => {});
  const vis = sel => pg.evaluate(s => { const e = document.querySelector(s); return !!(e && !e.hidden && e.getClientRects().length); }, sel);
  const txt = sel => pg.evaluate(s => { const e = document.querySelector(s); return e && !e.hidden && e.getClientRects().length ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
  // click the first visible element matching a CSS selector (real mouse click, so focus moves like a player's tap)
  // tap the element a finder returns: a real click first (focus moves like a tap); animated / covered controls fall back to
  // focus + click. Fresh lookup on each try, so a redraw between finding and tapping can't break it.
  const tapFound = async (finder, arg, what, wait = 500) => { let landed = false;
    for (let k = 0; k < 5; k++) { const h = await pg.evaluateHandle(finder, arg); const el = h.asElement();
      // a control that disappeared right after a tap that may have landed: the page moved on, so the tap counts
      if (!el) { if (landed) { await pg.waitForTimeout(wait); return; } if (k >= 2) throw new Error('nothing to tap: ' + what); await pg.waitForTimeout(400); continue; }
      // scrolling can make the page redraw (lazy parts, keep-place): if it scrolled, let it settle and find the control again
      const y0 = await pg.evaluate(() => scrollY); await el.scrollIntoViewIfNeeded({timeout: 1000}).catch(() => {});
      if (k < 3 && Math.abs((await pg.evaluate(() => scrollY)) - y0) > 2) { await pg.waitForTimeout(450); if (!(await el.evaluate(x => x.isConnected).catch(() => false))) continue; }
      // 1) a normal real click (waits for the control to be steady); 2) the slanted tiles animate, so if it never steadies,
      // a real click at its position anyway; 3) if a redraw replaced it meanwhile, find the new one and try again
      try { await el.click({timeout: 900}); await pg.waitForTimeout(wait); return; } catch (e) {}
      if (await el.evaluate(x => x.isConnected).catch(() => false)) { try { await el.click({force: true, timeout: 900}); await pg.waitForTimeout(wait); return; } catch (e) {} }
      landed = true; await pg.waitForTimeout(300); }
    throw new Error('could not tap: ' + what); };
  const click = (sel, wait = 450) => tapFound(s => [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')) || null, sel, sel, wait);
  const has = async sel => (await pg.locator(sel).filter({visible: true}).count()) > 0;
  const q = s => JSON.stringify(s);
  const waitFor = async (fn, ms = 8000, step = 150) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { v = await fn(); if (v) return v; await pg.waitForTimeout(step); } return v; };
  const H = {
    waitFor, vis, has,
    // ---------- generic ----------
    /** wait until the page has finished redrawing (no DOM changes for quietMs, nothing "Working out…") */
    settle: async (quietMs = 600, maxMs = 12000) => { await pg.evaluate(() => { if (window.__npMut) return; window.__npMut = Date.now(); new MutationObserver(() => { window.__npMut = Date.now(); }).observe(document.body, {childList: true, subtree: true, characterData: true}); });
      const t0 = Date.now(); while (Date.now() - t0 < maxMs) { const q = await pg.evaluate(() => ({age: Date.now() - window.__npMut, busy: /Working out/.test(document.body.innerText)})); if (q.age > quietMs && !q.busy) return true; await pg.waitForTimeout(200); } return false; },
    /** Switch team fold: open it and tap a saved team by name */
    switchTeam: async name => { await H.openFold('Switch team'); await tapFound(n => [...document.querySelectorAll('[data-pane="report"] details [data-load]')].find(e => e.getClientRects().length && e.innerText.trim() === n) || null, name, 'switch to ' + name, 1800); },
    /** every toast message shown so far on this page (newest last) */
    toasts: () => pg.evaluate(() => (window.__npT || []).slice()),
    clearToasts: () => pg.evaluate(() => { window.__npT = []; }),
    /** wait until a toast matching re shows; returns its text or null */
    waitToast: (re, ms = 6000) => waitFor(async () => (await pg.evaluate(() => (window.__npT || []).slice())).find(t => re.test(t)) || null, ms),
    /** tap Undo on the toast */
    tapToastUndo: () => click('#toastUndo'),
    press: async (k, wait = 400) => { await pg.keyboard.press(k); await pg.waitForTimeout(wait); },
    /** name / text of the control that has keyboard focus */
    focusName: () => pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return ''; return (e.getAttribute('aria-label') || e.innerText || e.value || e.placeholder || '').replace(/\s+/g, ' ').trim(); }),
    /** is a pressable choice (slider / switch button) with this label currently chosen? null if not found */
    chosen: label => pg.evaluate(l => { const b = [...document.querySelectorAll('button[aria-pressed],[role=tab],[data-arjump]')].filter(e => e.getClientRects().length).find(e => [e.dataset.slt, e.innerText.replace(/\s+/g, ' ').trim()].some(x => x && x.toLowerCase() === l.toLowerCase()));
      return b ? (b.getAttribute('aria-pressed') || b.getAttribute('aria-selected') || b.getAttribute('aria-current')) === 'true' : null; }, label),
    /** tap a pressable choice by its exact label */
    choose: async (label, wait = 700) => { const ok = await pg.evaluate(l => { const b = [...document.querySelectorAll('button[aria-pressed]')].filter(e => e.getClientRects().length).find(e => [e.dataset.slt, e.innerText.replace(/\s+/g, ' ').trim()].some(x => x && x.toLowerCase() === l.toLowerCase())); if (b) b.click(); return !!b; }, label);
      if (!ok) throw new Error('no choice labelled ' + label); await pg.waitForTimeout(wait); },
    /** open (or close) a fold whose title contains the text; returns its text once open */
    openFold: async (title, open = true, wait = 500) => { const ok = await pg.evaluate(([t, open]) => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); });
        if (!d) return false; if (d.open !== open) d.querySelector('summary').click(); return true; }, [title, open]); if (!ok) throw new Error('no fold titled ' + title); await pg.waitForTimeout(wait); },
    foldOpen: title => pg.evaluate(t => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); }); return d ? d.open : null; }, title),
    foldContent: title => pg.evaluate(t => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); }); return d ? d.innerText.replace(/\s+/g, ' ').trim() : null; }, title),
    /** tap a control found by its accessible label (aria-label contains text) */
    tapLabel: (label, wait = 500) => tapFound(l => [...document.querySelectorAll('[aria-label]')].filter(e => e.getClientRects().length && !e.closest('[hidden]')).find(e => e.getAttribute('aria-label').toLowerCase().includes(l.toLowerCase())) || null, label, 'label ' + label, wait),
    labelOf: label => pg.evaluate(l => { const e = [...document.querySelectorAll('[aria-label]')].filter(e => e.getClientRects().length).find(e => e.getAttribute('aria-label').toLowerCase().includes(l.toLowerCase())); return e ? e.getAttribute('aria-label') : null; }, label),
    /** real tap on a visible control whose text matches (moves focus like a finger/mouse) */
    tapText: (m, wait = 500) => tapFound(([m, isRe]) => { const re = isRe ? new RegExp(m[0], m[1]) : null; const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim();
        return [...document.querySelectorAll('button,a,[role=button],summary')].filter(e => e.getClientRects().length && !e.closest('[hidden]')).find(e => re ? re.test(t(e)) : t(e).toLowerCase().includes(m.toLowerCase())) || null; },
      [m instanceof RegExp ? [m.source, m.flags] : m, m instanceof RegExp], 'text ' + m, wait),
    setWidth: async (w, h = 900) => { await pg.setViewportSize({width: w, height: h}); await pg.waitForTimeout(700); },
    pageScrollY: () => pg.evaluate(() => Math.round(window.scrollY)),
    /** wait for a heavy page to finish its first drawing (text containing re appears) */
    waitText: (re, ms = 10000) => waitFor(async () => re.test(await ui.text()), ms),
    copied: () => pg.evaluate(async () => window.__copied || await navigator.clipboard.readText().catch(() => null)),
    grantClipboard: () => pg.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {}),

    // ---------- Pokémon info sheet ----------
    /** tap a Pokémon (tile, row, chip) by its name on the current page */
    tapPokemon: async (name, within = '') => { for (let k = 0; k < 2; k++) { await H.tapPokemonOnce(name, within); if (await waitFor(() => H.infoSheet(), 3000)) return; } },
    tapPokemonOnce: (name, within = '') => tapFound(([n, w]) => { const r = w ? document.querySelector(w) : document; return [...(r || document).querySelectorAll('[data-lt]')].filter(e => e.getClientRects().length && !e.closest('[hidden]') && !e.closest('#lairSheet'))
        .find(e => (e.getAttribute('aria-label') || e.innerText || '').replace(/\s+/g, ' ').toLowerCase().includes(n.toLowerCase())) || null; }, [name, within], 'Pokémon ' + name, 800),
    infoSheet: () => txt('#lairSheet'),
    /** tap a Pokémon listed inside the open info sheet (e.g. a "Brought with" partner) */
    tapPokemonInSheet: name => tapFound(n => [...document.querySelectorAll('#lairSheet [data-lt]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || e.innerText || '').includes(n)) || null, name, 'sheet Pokémon ' + name, 900),
    closeInfoSheet: () => click('#lairSheet button[data-lclose]'),
    infoTab: name => click(`#lairSheet [data-lstab="${name.toLowerCase()}"]`, 600),
    infoTabNow: () => pg.evaluate(() => { const b = document.querySelector('#lairSheet [data-lstab][aria-selected="true"]'); return b ? b.dataset.lstab : null; }),
    infoTabText: () => pg.evaluate(() => { const p = [...document.querySelectorAll('#lairSheet [id^="lstp-"]')].find(e => !e.hidden && e.getClientRects().length); return p ? p.innerText.replace(/\s+/g, ' ').trim() : null; }),

    /** size and position of the open info sheet's panel */
    infoSheetBox: () => pg.evaluate(() => { const s = document.querySelector('#lairSheet'); if (!s || s.hidden) return null; const c = [...s.children].filter(e => e.getClientRects().length && !e.matches('[data-lclose]')).sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0]; if (!c) return null; const r = c.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom)}; }),
    focusInfoTab: () => pg.focus('#lairSheet [data-lstab][aria-selected="true"]'),
    // ---------- Home ----------
    homeHeadline: () => pg.evaluate(() => { const e = document.querySelector('[data-pane="home"] .ar-tag') || [...document.querySelectorAll('[data-pane="home"] h1')].find(e => e.getClientRects().length); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }),
    homeStartButtons: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="home"] .ar-btn[data-view]')].filter(e => e.getClientRects().length && /score my team|build|plan a match/i.test(e.innerText)).map(e => e.innerText.trim())),
    homeTools: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="home"] .htile')].filter(e => e.getClientRects().length).map(e => e.innerText.split('\n')[0].trim())),
    tapTool: async name => { await pg.evaluate(n => { const e = [...document.querySelectorAll('[data-pane="home"] .htile')].find(e => e.innerText.split('\n')[0].trim() === n); e.click(); }, name); await pg.waitForTimeout(700); },
    ratingMoves: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="home"] .ar-mv')].filter(e => e.getClientRects().length).map(e => ({name: e.dataset.lt, text: e.innerText.replace(/\s+/g, ' ').trim(), label: e.getAttribute('aria-label')}))),
    welcomeCardText: () => pg.evaluate(() => { const e = [...document.querySelectorAll('[data-pane="home"] *')].find(e => e.getClientRects().length && /^New Here\?/i.test(e.innerText || '') && e.innerText.length < 800); return e ? e.innerText.replace(/\s+/g, ' ') : null; }),
    closeWhatsNew: () => click('[data-wnewx]'),
    homeTopRows: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="home"] .hmini')].filter(e => e.getClientRects().length).map(e => e.dataset.lt)),

    // ---------- My Team ----------
    /** the Legal badge's rules tooltip */
    rulesTooltip: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] [title]')].map(e => e.title).find(t => /Based on our reading/.test(t)) || null),
    teamHeading: () => pg.evaluate(() => { const p = document.querySelector('[data-pane="report"]'); const h = p && [...p.querySelectorAll('[role=heading][aria-level="1"],h1')].find(e => e.getClientRects().length); return h ? h.innerText.replace(/\s+/g, ' ').trim() : null; }),
    /** Strength Score block: {label, score, band} or null */
    scoreBlock: () => pg.evaluate(() => { const p = document.querySelector('[data-pane="report"]'); if (!p) return null; const t = p.innerText.replace(/\s+/g, ' ');
      const m = t.match(/(Strength Score(?: so far)?) (\d{1,3}) (Top tier|Tournament ready|Solid|Needs work|Missing a basic)/); return m ? {label: m[1], score: +m[2], band: m[3]} : null; }),
    tapWhyScore: () => click('[data-chgrade]', 600),
    whyExpanded: () => pg.evaluate(() => { const b = document.querySelector('[data-chgrade]'); return b ? b.getAttribute('aria-expanded') === 'true' : null; }),
    whyPanel: () => txt('#chGwhy'),
    /** Your Six tiles in the order shown (names as shown) */
    sixTiles: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] [data-chset]')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    emptyTiles: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] .ar-art')].filter(e => e.getClientRects().length && /add a pok/i.test(e.innerText + (e.getAttribute('aria-label') || ''))).length),
    tapTile: name => H.tapLabel(name + ': show its set', 700),
    tilePressed: name => pg.evaluate(n => { const e = [...document.querySelectorAll('[data-pane="report"] [data-chset]')].find(e => (e.getAttribute('aria-label') || '').startsWith(n + ':')); return e ? e.getAttribute('aria-pressed') === 'true' : null; }, name),
    setCard: () => txt('#rzSet'),
    /** show a Pokémon's set card (tap its tile unless its card is already showing) */
    showSet: async name => { if (!(await H.tilePressed(name))) await H.tapTile(name); return H.setCard(); },
    lockOnTile: async name => { if (!(await has(`[data-pane="report"] [data-lock][aria-label*="${name}"]`))) await H.tapTile(name); await click(`[data-pane="report"] [data-lock][aria-label*="${name}"]`, 700); },
    tileLockLabel: name => pg.evaluate(n => { const e = [...document.querySelectorAll('[data-pane="report"] [data-lock]')].find(e => (e.getAttribute('aria-label') || '').includes(n)); return e ? e.getAttribute('aria-label') : null; }, name),
    removeFromTeam: async name => { await H.settle(400, 5000); if (!(await has(`[data-pane="report"] .ar-rmx[aria-label*="${name}"]`))) await H.tapTile(name); await click(`[data-pane="report"] .ar-rmx[aria-label*="${name}"]`, 800); },
    gamePlanLine: () => pg.evaluate(() => { const m = (document.querySelector('[data-pane="report"]') || document.body).innerText.replace(/\s+/g, ' ').match(/Game plan[^.]*\./); return m ? m[0] : null; }),
    homePlanLine: () => pg.evaluate(() => { const m = (document.querySelector('[data-pane="home"]') || document.body).innerText.replace(/\s+/g, ' ').match(/Game plan[^.]*\./); return m ? m[0] : null; }),
    /** ⋯ team menu */
    openMoreActions: async () => { if (!(await pg.evaluate(() => { const s = document.querySelector('summary[aria-label="More team actions"]'); return s && s.parentElement.open; }))) await click('summary[aria-label="More team actions"]', 400); },
    /** tap one of the team actions under Your Six (Saved Teams, My Box, Compare with…, Save team, Share…) */
    teamAction: name => tapFound(n => { const p = document.querySelector('#chActs'); return p ? [...p.querySelectorAll('button')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim() === n) || null : null; }, name, 'team action ' + name, 900),
    teamActions: () => pg.evaluate(() => { const p = document.querySelector('#chActs') || document.querySelector('[data-pane="report"]'); return [...p.querySelectorAll('button,summary')].filter(e => e.getClientRects().length).map(e => (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()).filter(Boolean); }),
    jumpBar: () => pg.evaluate(() => [...document.querySelectorAll('[data-arjump]')].filter(e => e.getClientRects().length).map(e => (e.dataset.slt || e.innerText).trim())),
    jumpTo: name => pg.evaluate(n => { const e = [...document.querySelectorAll('[data-arjump]')].filter(e => e.getClientRects().length).find(e => (e.dataset.slt || e.innerText).trim() === n); e.click(); }, name).then(() => pg.waitForTimeout(900)),
    onScreen: re => pg.evaluate(([s, f]) => { const re = new RegExp(s, f); const e = [...document.querySelectorAll('[data-pane="report"] *')].filter(e => e.getClientRects().length && e.innerText && e.innerText.length < 60 && re.test(e.innerText)).pop(); if (!e) return null; const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, [re.source, re.flags]),
    // matchups
    topThreatRows: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] .chtl10 > .chtr[data-chthr]')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    tapThreat: name => click(`[data-pane="report"] [data-chthr="${name}"]`, 800),
    threatSheet: () => txt('#chScout'),
    tapThreatInSheet: name => click(`#chScout [data-chthr="${name}"]`, 600),
    threatPressedInSheet: () => pg.evaluate(() => { const e = document.querySelector('#chScout [data-chthr][aria-pressed="true"]'); return e ? e.dataset.chthr : null; }),
    /** Top 12 grid: cells per threat row (rows in order) */
    gridRows: () => pg.evaluate(() => { const t = [...document.querySelectorAll('[data-pane="report"] [role=table]')].find(e => e.getClientRects().length); return t ? [...t.querySelectorAll('[data-chhthr]')].map(r => ({name: r.getAttribute('aria-label').split(':')[0], cells: r.querySelectorAll('[role=cell]').length})) : null; }),
    tapGridRow: i => tapFound(i => { const t = [...document.querySelectorAll('[data-pane="report"] [role=table]')].find(e => e.getClientRects().length); return t ? t.querySelectorAll('[data-chhthr]')[i] : null; }, i, 'grid row ' + i, 900),
    /** "?" explainer next to a term; the bubble that opens */
    pickTypeChartMega: name => tapFound(n => [...document.querySelectorAll('[data-megapick]')].find(e => e.getClientRects().length && e.innerText.trim() === n) || null, name, 'Mega pick ' + name, 900),
    tapTip: label => H.tapLabel(label, 500),
    tipBubble: () => txt('#tipPop'),
    /** shortcut for "edit this Pokémon's four moves" (the rebuild may do it through its edit panel) */
    giveMoves: (name, moves) => ui.peek(`(()=>{const i=S.slots.findIndex(s=>s.n===${JSON.stringify(name)});S.slots[i].mv={doubles:${JSON.stringify(moves)}};render();return i})()`).then(() => pg.waitForTimeout(1500)),
    // suggestions
    suggestionCards: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] [data-plan]')].filter(e => e.getClientRects().length && !e.closest('#chScout')).map(b => { let c = b; for (let k = 0; k < 6 && c.parentElement && !/(for|added)/.test(c.innerText.split('Apply')[0]); k++) c = c.parentElement; return c.innerText.replace(/\s+/g, ' ').trim(); })),
    applySuggestionCard: (i = 0) => pg.evaluate(i => { const b = [...document.querySelectorAll('[data-pane="report"] [data-plan]')].filter(e => e.getClientRects().length && !e.closest('#chScout'))[i]; b.click(); }, i).then(() => pg.waitForTimeout(1500)),
    undoBar: () => pg.evaluate(() => { const e = [...document.querySelectorAll('[data-undobar]')].find(e => e.getClientRects().length); if (!e) return null; let c = e.parentElement; return c.innerText.replace(/\s+/g, ' ').trim(); }),
    undoLastApplied: () => click('[data-undobar]', 1500),
    // edit panel
    editPanel: () => pg.evaluate(() => { const e = document.querySelector('#chEdit'); if (!e || e.hidden || !e.getClientRects().length) return null; const h = e.querySelector('h1,h2,h3,b,strong'); return {title: (h ? h.innerText : '').replace(/\s+/g, ' ').trim(), text: e.innerText.replace(/\s+/g, ' ').trim()}; }),
    openEditPanel: async name => { await H.showSet(name); await click('#rzSet [data-chedit]', 900); await H.settle(); },
    closeEditPanel: () => click('#chEditDone', 500),
    editStrip: () => pg.evaluate(() => [...document.querySelectorAll('#chEdit .chst')].filter(e => e.getClientRects().length).map(e => e.getAttribute('aria-label'))),
    tapStrip: i => click(`#chEdit .chst[data-chedit="${i}"]`, 800),
    panelLock: () => click('#chEdit [data-lock]', 700),
    panelLockText: () => txt('#chEdit [data-lock]'),
    /** which slot the edit panel shows (0-5) */
    panelSlot: () => pg.evaluate(() => { const b = document.querySelector('#chEdit .chst[aria-current="true"]'); return b ? +b.dataset.chedit : 0; }),
    pickInPanel: async (what, value, j = 0) => { const i = await H.panelSlot(); const sel = {nature: '#chEdit select[data-spnat="' + i + '"]', ability: '#ab' + i, item: '#it' + i, move: '#mv' + i + '_' + j}[what];
      const loc = pg.locator(sel).first(); const opt = await loc.evaluate((s, v) => { const o = [...s.options].find(o => o.text.split(',')[0].replace(/[★\s]+$/, '').replace(/ \([\d.]+%\)$/, '').trim() === v || o.value === v); return o ? o.value : null; }, value);
      if (opt == null) throw new Error('no ' + what + ' option ' + value); await loc.selectOption(opt); await pg.waitForTimeout(900); },
    panelOptions: async what => { const i = await H.panelSlot(); return pg.evaluate(sel => { const s = document.querySelector(sel); return s ? [...s.options].map(o => o.text.split(',')[0].replace(/[★\s]+$/, '').replace(/ \([\d.]+%\)$/, '').trim()) : []; }, {nature: '#chEdit select[data-spnat="' + i + '"]', ability: '#ab' + i, item: '#it' + i, move3: '#mv' + i + '_3'}[what]); },
    panelMoves: async () => { const i = await H.panelSlot(); return pg.evaluate(i => [0, 1, 2, 3].map(j => { const s = document.getElementById('mv' + i + '_' + j); return s ? s.options[s.selectedIndex].text.split(',')[0].trim() : null; }), i); },
    setStatPoints: async v => { const i = await H.panelSlot(); for (let k = 0; k < 6; k++) { const loc = pg.locator('#chEdit input[data-spi="' + i + ':' + k + '"]').first(); await loc.fill(String(v[k])); await loc.dispatchEvent('input'); } await pg.waitForTimeout(300); },
    saveStatPoints: async () => click('#chEdit [data-spsave2="' + (await H.panelSlot()) + '"]', 900),
    statTotal: async () => txt('#sptot' + (await H.panelSlot())),
    statMsg: async () => txt('#spmsg' + (await H.panelSlot())),
    panelButton: m => H.tapText(m, 900),
    // add a Pokémon (name box with live search)
    nameBox: () => pg.evaluate(() => { const i = [...document.querySelectorAll('#chEdit input,#boxAdd,#qlOppIn')].find(e => e.getClientRects().length && /add a pok|their pok/i.test((e.placeholder || '') + (e.getAttribute('aria-label') || ''))); return i ? {focused: i === document.activeElement, value: i.value} : null; }),
    typeName: async (text, sel = '#chEdit input[placeholder]') => { const loc = pg.locator(sel).filter({visible: true}).first(); await loc.click(); await loc.fill(''); await loc.pressSequentially(text, {delay: 20}); await pg.waitForTimeout(500); },
    nameOptions: () => pg.evaluate(() => { const l = [...document.querySelectorAll('[role=listbox]')].find(e => e.getClientRects().length); return l ? [...l.querySelectorAll('[role=option]')].map(o => o.innerText.replace(/\s+/g, ' ').trim()) : []; }),
    nameListText: () => pg.evaluate(() => { const l = [...document.querySelectorAll('[role=listbox]')].find(e => e.getClientRects().length); return l ? l.innerText.replace(/\s+/g, ' ').trim() : null; }),
    // import / export
    openImport: async () => { await H.openMoreActions(); await click('#importBtn', 800); },
    pasteTeam: async text => { await pg.locator('#pasteIn').fill(text); await click('#pasteLoad', 1500); },
    openExport: async () => { await H.openMoreActions(); await click('#exportBtn', 800); },
    exportText: () => pg.evaluate(() => { const t = [...document.querySelectorAll('#chEdit textarea')].find(e => e.getClientRects().length && e.readOnly); return t ? t.value : null; }),
    clearTeam: async () => { await H.openMoreActions(); await click('#clearTeam', 900); },
    // share
    openShare: () => click('#shareBtn', 1500),
    shareBox: () => pg.evaluate(() => { const b = document.querySelector('#shareBox'); if (!b || b.hidden || !b.getClientRects().length) return null; const i = b.querySelector('img.shareimg'); const h = b.querySelector('.sharehd b');
      return {title: h ? h.innerText.trim() : '', w: i ? i.naturalWidth : 0, h: i ? i.naturalHeight : 0, alt: i ? i.alt : '', src: i ? i.src.slice(0, 30) : '', text: b.innerText.replace(/\s+/g, ' ')}; }),
    shareImagePixel: () => pg.evaluate(async () => { const i = document.querySelector('#shareBox img.shareimg'); if (!i) return null; await i.decode().catch(() => {}); const c = document.createElement('canvas'); c.width = 8; c.height = 8; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 8, 8); const d = x.getImageData(0, 0, 8, 8).data; let s = 0; for (let k = 0; k < d.length; k += 4) s += d[k] + d[k + 1] + d[k + 2]; return s / (d.length / 4) / 3; }),
    waitShareImage: () => waitFor(async () => { const s = await H.shareBox(); return s && s.w > 0 ? s : null; }, 10000),
    closeShare: () => click('#shareBox [data-shareclose]'),
    // your games
    openLogForm: () => click('[data-pane="report"] [data-qlopen]', 600),
    openLogFormByKeyboard: async () => { await pg.focus('[data-pane="report"] [data-qlopen]'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600); },
    undoLoggedGame: async () => { for (let k = 0; k < 3; k++) { await H.settle(400, 4000); if (!(await has('[data-qlundo]'))) return; await click('[data-qlundo]', 600); if (await H.waitToast(/Game removed/, 1500)) return; } },
    pickLead: async name => { await H.settle(300, 3000); if (!(await has(`[data-qllead="${name}"]`))) await H.openLogForm(); return click(`[data-qllead="${name}"]`, 300); },
    pickLeadRaw: name => click(`[data-qllead="${name}"]`, 300),
    useBattleOpponents: () => click('[data-qlbm]', 400),
    logResult: wl => click(`[data-qlres="${wl}"]`, 900),
    myGamesCard: () => txt('#myRec'),
    /** cards per row on the Team Sheet page */
    sheetColumns: () => pg.evaluate(() => { const c = [...document.querySelectorAll('[data-pane="sheet"] [data-tsedit]')].filter(e => e.getClientRects().length); if (!c.length) return 0; const top = Math.round(c[0].getBoundingClientRect().top); return c.filter(e => Math.abs(Math.round(e.getBoundingClientRect().top) - top) < 4).length; }),
    // saved teams
    savedCards: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="teams"] [data-load]')].filter(e => e.getClientRects().length).map(b => { let c = b; while (c.parentElement && !c.parentElement.querySelectorAll('[data-load]')[1] && !c.parentElement.querySelector('[data-sort]') && !/side by side/.test(c.parentElement.innerText) && c.parentElement.dataset.pane !== 'teams') c = c.parentElement; return c.innerText.replace(/\s+/g, ' ').trim(); })),
    savedCardOf: name => H.savedCards().then(a => a.find(t => t.startsWith(name + ' ') || t.includes(name)) || null),
    savedAction: async (name, what) => { const idSel = await pg.evaluate(n => { const s = [...document.querySelectorAll('[data-pane="teams"] summary[aria-label]')].find(e => e.getAttribute('aria-label') === 'More for ' + n); return s ? s.closest('details').querySelector('[data-del]').dataset.del : null; }, name);
      if (!idSel) throw new Error('no saved team ' + name);
      if (what === 'Open') return click(`[data-pane="teams"] [data-load="${idSel}"]`, 1500);
      if (what === 'Compare') return click(`[data-pane="teams"] [data-cmp="${idSel}"]`, 900);
      if (what === 'Copy for Showdown') return click(`[data-pane="teams"] [data-sdcopy="saved:${idSel}"]`, 600);
      await click(`[data-pane="teams"] summary[aria-label="More for ${name}"]`, 400);
      return click(`[data-pane="teams"] [data-${{'Team poster': 'poster', Rename: 'rn', Delete: 'del'}[what]}="${idSel}"]`, 700); },
    typeSaveName: async name => { const l = pg.locator('#saveName'); await l.fill(name); await pg.waitForTimeout(200); },
    typeRename: async name => { const l = pg.locator('[data-pane="teams"] input').filter({visible: true}).first(); await l.fill(name); await pg.waitForTimeout(200); },
    /** storage-level: a team saved in the retired singles mode (players can't make one any more) */
    addRetiredSinglesTeam: name => ui.peek(`S.teams.push({id:'tsg',name:${JSON.stringify(name)},slots:[{n:'Garchomp',a:null,lock:false}],format:'singles',saved:Date.now()});render()`).then(() => pg.waitForTimeout(600)),
    // box
    tapBoxUndo: () => click('#toastBoxUndo, #toastUndo', 900),
    typeBoxLink: async t => { if (!(await vis('#boxLinkField'))) await click('#boxLinkOpen', 400); await pg.locator('#boxLinkField').fill(t, {timeout: 5000}); await pg.waitForTimeout(200); },
    boxNames: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="box"] [data-unbox]')].filter(e => e.getClientRects().length).map(e => e.dataset.unbox)),
    addToBox: async name => { await H.typeName(name, '#boxAdd'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800); },
    removeFromBox: name => click(`[data-pane="box"] [data-unbox="${name}"]`, 700),
    boxSortBy: label => tapFound(l => [...document.querySelectorAll('[data-pane="box"] [data-boxsort]')].find(e => e.getClientRects().length && e.innerText.trim() === l) || null, label, 'box sort ' + label, 700),
    // compare
    pickCompareTeam: async name => { await tapFound(n => [...document.querySelectorAll('[data-pane="compare"] [data-cxset]')].find(e => e.getClientRects().length && e.innerText.includes(n) && e.getAttribute('aria-disabled') !== 'true') || null, name, 'compare pick ' + name, 1500); },
    compareHeads: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="compare"] [data-cxpick]')].filter(e => e.getClientRects().length).map(e => { let c = e; for (let k = 0; k < 4 && c.parentElement && c.innerText.length < 25; k++) c = c.parentElement; return c.innerText.replace(/\s+/g, ' ').trim(); })),
    pasteCompareTeam: async text => { await pg.locator('#cxPaste').fill(text); await click('[data-cxpaste]', 1500); },
    compareCheckRows: () => pg.evaluate(() => [...document.querySelectorAll('[data-pane="compare"] tr, [data-pane="compare"] [role=row], [data-pane="compare"] .cxrow')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /[✓✗?]/.test(t))),
    // shared behaviour
    doubleTapApply: async () => { const b = pg.locator('[data-pane="report"] [data-plan]').filter({visible: true}).first(); await b.scrollIntoViewIfNeeded(); await b.dblclick({delay: 60}); await pg.waitForTimeout(1500); },
    scrollToSuggestions: async () => { await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-pane="report"] [data-plan]')].find(e => e.getClientRects().length); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 300); }); await pg.waitForTimeout(600); },
    goBack: async () => { await pg.goBack().catch(() => {}); await pg.waitForTimeout(800); },
    sliderIndex: label => pg.evaluate(l => { const b = [...document.querySelectorAll('[data-slt]')].find(e => e.getClientRects().length && e.dataset.slt.toLowerCase() === l.toLowerCase()); const g = b && b.closest('.ar-slide'); return g ? g.dataset.sli + '|' + getComputedStyle(g).getPropertyValue('--i') : null; }, label),
    pageLuminance: () => pg.evaluate(() => { const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }),
    // the team the page holds (names; same as ui.team) and saved state helpers
    /** dev-only path: a slot holds a Pokémon that has since left the regulation (as after a roster change) */
    retirePokemonInSlot: (i, name) => ui.peek(`S.slots[${i}]={n:${JSON.stringify(name)},a:null,lock:false};render()`).then(() => pg.waitForTimeout(1200)),
  };
  return H;
};
