// Page helpers for group A (Team) on the REBUILD (app/dist/v2.html). Same names and meanings as adapters/current.A-team.mjs,
// against the new build's markup (src/v2/pages/*.js). Where the new build has no equivalent yet, the helper throws
// Error('not in v2 yet: <what>') so the failure names the missing feature; nothing is faked.
// Notes on translation (what the player sees, read from the new markup):
//  - today's side panels (edit panel, Saved Teams page, Team Sheet page, info sheet, share box) are sheets here (V2.sheet, .np-sheet)
//  - toasts are .np-toast elements appended to <body>, one at a time
//  - Suggestion cards are read from their visible parts (In / Out sprites' names, the score change) into today's card wording
//    ("<in> for <out> +3 (90 → 93) Apply" / "+ <in> added …"), so tests can check what each suggestion does
const TOASTS = () => { try { if (window.__npT) return; window.__npT = [];
  const rec = el => { const t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim(); if (t) window.__npT.push(t); };
  const hook = () => { if (!document.body) return setTimeout(hook, 50);
    new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList.contains('np-toast')) rec(n); }).observe(document.body, {childList: true}); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook(); } catch (e) {} };
const NOT = what => { throw new Error('not in v2 yet: ' + what); };
// today's raw selectors that tests pass to has() -> the new build's element with the same meaning
const SEL = {'#toastUndo': '.np-toast #toastUndo', '#toastBoxUndo': '.np-toast [data-bxundo]', '[data-qlres]': '.yg2 [data-ygres]', '#jump input': '[data-v2q]'};
// today's name-box selectors -> the new build's search inputs (and the button that opens each, if it's not open yet)
const NAMEBOX = {'#chEdit input[placeholder]': ['[data-v2q]', '[data-v2search]'], '#boxAdd': ['[data-bxq]', '[data-bxadd]'], '#jump input': ['[data-v2q]', '[data-v2search]'], '#qlOppIn': ['[data-ygq]', null]};

export default (ui, pg, o) => {
  pg.addInitScript(TOASTS).catch(() => {}); pg.evaluate(TOASTS).catch(() => {});
  const vis = sel => pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => !e.hidden && e.getClientRects().length); return !!e; }, SEL[sel] || sel);
  const txt = sel => pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => !e.hidden && e.getClientRects().length); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
  // same tapping kit as today's adapter (real click first, then force, fresh lookup each try)
  const tapFound = async (finder, arg, what, wait = 500) => { let landed = false;
    for (let k = 0; k < 5; k++) { const h = await pg.evaluateHandle(finder, arg); const el = h.asElement();
      if (!el) { if (landed) { await pg.waitForTimeout(wait); return; } if (k >= 2) throw new Error('nothing to tap: ' + what); await pg.waitForTimeout(400); continue; }
      const y0 = await pg.evaluate(() => scrollY); await el.scrollIntoViewIfNeeded({timeout: 1000}).catch(() => {});
      if (k < 3 && Math.abs((await pg.evaluate(() => scrollY)) - y0) > 2) { await pg.waitForTimeout(450); if (!(await el.evaluate(x => x.isConnected).catch(() => false))) continue; }
      try { await el.click({timeout: 900}); await pg.waitForTimeout(wait); return; } catch (e) {}
      if (await el.evaluate(x => x.isConnected).catch(() => false)) { try { await el.click({force: true, timeout: 900}); await pg.waitForTimeout(wait); return; } catch (e) {} }
      landed = true; await pg.waitForTimeout(300); }
    throw new Error('could not tap: ' + what); };
  const click = (sel, wait = 450) => tapFound(s => [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')) || null, sel, sel, wait);
  const has = async sel => (await pg.locator(SEL[sel] || sel).filter({visible: true}).count()) > 0;
  const waitFor = async (fn, ms = 8000, step = 150) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { v = await fn(); if (v) return v; await pg.waitForTimeout(step); } return v; };
  // the open sheet (its panel), if it holds `cls`
  const sheetText = cls => pg.evaluate(c => { const w = window.V2 && V2._sheet && V2._sheet.wrap; const s = w && w.querySelector('.np-sheet'); return s && s.querySelector(c) ? s.innerText.replace(/\s+/g, ' ').trim() : null; }, cls);
  const closeSheet = () => click('.np-sheet > button.x[data-v2close]', 500);
  // the name shown for a Pokémon tile / button (aria-label "Garchomp, Lead" -> "Garchomp")
  const tileName = `e => (e.getAttribute('aria-label') || '').split(', ')[0]`;
  const optName = t => t.split(' · ')[0].replace(/[★\s]+$/, '').replace(/ \([\d.]+%\)$/, '').trim();
  const H = {
    waitFor, vis, has,
    // ---------- generic ----------
    settle: async (quietMs = 600, maxMs = 12000) => { await pg.evaluate(() => { if (window.__npMut) return; window.__npMut = Date.now(); new MutationObserver(() => { window.__npMut = Date.now(); }).observe(document.body, {childList: true, subtree: true, characterData: true}); });
      const t0 = Date.now(); while (Date.now() - t0 < maxMs) { const q = await pg.evaluate(() => ({age: Date.now() - window.__npMut, busy: /Working out/.test(document.body.innerText)})); if (q.age > quietMs && !q.busy) return true; await pg.waitForTimeout(200); } return false; },
    /** open a saved team from My Team (today: the Switch team fold; here: Saved Teams sheet → Open) */
    switchTeam: async name => { await H.openSavedSheet(); await tapFound(n => [...document.querySelectorAll('.svt2 [data-svact="open"]')].find(e => e.getAttribute('aria-label') === 'Open ' + n) || null, name, 'switch to ' + name, 1800); },
    openSavedSheet: async () => { if (await vis('.svt2')) return; if (!(await vis('[data-v2saved]'))) await ui.go('My Team', 500); if (!(await vis('[data-v2saved]'))) NOT('Saved Teams button on this My Team'); await click('[data-v2saved]', 700); },
    toasts: () => pg.evaluate(() => (window.__npT || []).slice()),
    clearToasts: () => pg.evaluate(() => { window.__npT = []; }),
    waitToast: (re, ms = 6000) => waitFor(async () => (await pg.evaluate(() => (window.__npT || []).slice())).find(t => re.test(t)) || null, ms),
    tapToastUndo: () => click('.np-toast #toastUndo, .np-toast [data-bxundo]'),
    press: async (k, wait = 400) => { await pg.keyboard.press(k); await pg.waitForTimeout(wait); },
    focusName: () => pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return ''; return (e.getAttribute('aria-label') || e.innerText || e.value || e.placeholder || '').replace(/\s+/g, ' ').trim(); }),
    /** is a pressable choice (slider button, tab) with this label chosen? null if not found */
    chosen: label => pg.evaluate(l => { const b = [...document.querySelectorAll('button[aria-pressed],[role=tab],[data-tmjump]')].filter(e => e.getClientRects().length).find(e => e.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === l.toLowerCase());
      return b ? (b.getAttribute('aria-pressed') || b.getAttribute('aria-selected') || b.getAttribute('aria-current')) === 'true' : null; }, label),
    choose: async (label, wait = 700) => { const ok = await pg.evaluate(l => { const b = [...document.querySelectorAll('button[aria-pressed]')].filter(e => e.getClientRects().length).find(e => e.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === l.toLowerCase()); if (b) b.click(); return !!b; }, label);
      if (!ok) throw new Error('no choice labelled ' + label + ' (not in v2 yet, or a different label)'); await pg.waitForTimeout(wait); },
    openFold: async (title, open = true, wait = 500) => { const ok = await pg.evaluate(([t, open]) => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); });
        if (!d) return false; if (d.open !== open) d.querySelector('summary').click(); return true; }, [title, open]); if (!ok) throw new Error('no fold titled ' + title + ' (not in v2 yet)'); await pg.waitForTimeout(wait); },
    foldOpen: title => pg.evaluate(t => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); }); return d ? d.open : null; }, title),
    foldContent: title => pg.evaluate(t => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); }); return d ? d.innerText.replace(/\s+/g, ' ').trim() : null; }, title),
    tapLabel: (label, wait = 500) => tapFound(l => [...document.querySelectorAll('[aria-label]')].filter(e => e.getClientRects().length && !e.closest('[hidden]')).find(e => e.getAttribute('aria-label').toLowerCase().includes(l.toLowerCase())) || null, label, 'label ' + label, wait),
    labelOf: label => pg.evaluate(l => { const e = [...document.querySelectorAll('[aria-label]')].filter(e => e.getClientRects().length).find(e => e.getAttribute('aria-label').toLowerCase().includes(l.toLowerCase())); return e ? e.getAttribute('aria-label') : null; }, label),
    // casing never counts (the new build writes buttons in Title Case, Sim Nov 9); a button's accessible name counts as its words too
    tapText: (m, wait = 500) => tapFound(([m, isRe]) => { const re = isRe ? new RegExp(m[0], m[1].includes('i') ? m[1] : m[1] + 'i') : null; const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim(), al = e => (e.getAttribute && e.getAttribute('aria-label')) || '';
        // an open sheet sits over the page: look in it first (a player can only reach the sheet)
        const root = (window.V2 && V2._sheet && V2._sheet.wrap) || document;
        return [...root.querySelectorAll('button,a,[role=button],summary')].filter(e => e.getClientRects().length && !e.closest('[hidden]')).find(e => re ? (re.test(t(e)) || re.test(al(e))) : (t(e) + ' ' + al(e)).toLowerCase().includes(m.toLowerCase())) || null; },
      [m instanceof RegExp ? [m.source, m.flags] : m, m instanceof RegExp], 'text ' + m, wait),
    setWidth: async (w, h = 900) => { await pg.setViewportSize({width: w, height: h}); await pg.waitForTimeout(700); },
    pageScrollY: () => pg.evaluate(() => Math.round(window.scrollY)),
    waitText: (re, ms = 10000) => waitFor(async () => { try { return re.test(await ui.text()); } catch (e) { return false; } }, ms),
    copied: () => pg.evaluate(async () => window.__copied || await navigator.clipboard.readText().catch(() => null)),
    grantClipboard: () => pg.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {}),

    // ---------- Pokémon info sheet (.ms2 in a sheet) ----------
    tapPokemon: async (name, within = '') => { for (let k = 0; k < 2; k++) { await H.tapPokemonOnce(name, within); if (await waitFor(() => H.infoSheet(), 3000)) return; } },
    tapPokemonOnce: (name, within = '') => tapFound(([n, w]) => { const r = w ? document.querySelector(w) : document; return [...(r || document).querySelectorAll('[data-v2mon]')].filter(e => e.getClientRects().length && !e.closest('[hidden]') && !e.closest('.ms2'))
        .find(e => (e.getAttribute('aria-label') || e.innerText || e.dataset.v2mon || '').replace(/\s+/g, ' ').toLowerCase().includes(n.toLowerCase()) || e.dataset.v2mon.toLowerCase() === n.toLowerCase()) || null; }, [name, within], 'Pokémon ' + name + ' (an element that opens its info sheet)', 800),
    infoSheet: () => sheetText('.ms2'),
    tapPokemonInSheet: name => tapFound(n => [...document.querySelectorAll('.ms2 [data-v2mon]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || e.innerText || '').includes(n)) || null, name, 'sheet Pokémon ' + name, 900),
    closeInfoSheet: () => closeSheet(),
    infoTab: name => click(`.ms2 [data-mstab="${name.toLowerCase()}"]`, 600),
    infoTabNow: () => pg.evaluate(() => { const b = document.querySelector('.ms2 [data-mstab][aria-selected="true"]'); return b ? b.dataset.mstab : null; }),
    infoTabText: () => pg.evaluate(() => { const p = [...document.querySelectorAll('.ms2 [data-mspan]')].find(e => !e.hidden && e.getClientRects().length); return p ? p.innerText.replace(/\s+/g, ' ').trim() : null; }),
    infoSheetBox: () => pg.evaluate(() => { const s = document.querySelector('.np-sheet'); if (!s || !s.querySelector('.ms2')) return null; const r = s.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom)}; }),
    focusInfoTab: () => pg.focus('.ms2 [data-mstab][aria-selected="true"]'),
    // ---------- Home: not built in the new build yet (only the Preview shows a mock-up) ----------
    homeHeadline: () => NOT('Home page'), homeStartButtons: () => NOT('Home page'), homeTools: () => NOT('Home page (All 11 Tools)'), tapTool: () => NOT('Home page (All 11 Tools)'),
    ratingMoves: () => NOT('Home page (This week in the ratings)'), welcomeCardText: () => NOT('Home page (welcome card)'), closeWhatsNew: () => NOT("Home page (What's New)"),
    homeTopRows: () => NOT('Home page (Top of the Meta)'), homePlanLine: () => NOT('Home page (game plan vs the Champion)'),

    // ---------- My Team ----------
    /** the team's name as the page shows it: a heading if there is one, else the eyebrow "My Team · <saved name>" */
    teamHeading: () => pg.evaluate(() => { const m = document.querySelector('#main'); if (!m) return null; const h = [...m.querySelectorAll('h1')].find(e => e.getClientRects().length && !e.closest('.tm-empty'));
      if (h) return h.innerText.replace(/\s+/g, ' ').trim(); const e = m.querySelector('.tm-eb'); const t = e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; const k = t.indexOf(' · '); return k >= 0 ? t.slice(k + 3) : null; }),
    /** Strength Score block: {label, score, band} ("Solid so far" shows as label "Strength Score so far", band "Solid") */
    scoreBlock: () => pg.evaluate(() => { const e = [...document.querySelectorAll('#main .tm-lock .np-score')].find(e => e.getClientRects().length); if (!e) return null;
      const n = e.querySelector('b'), w = e.querySelector('.w span'), l = e.querySelector('.w small'); if (!n || !w) return null; const word = w.innerText.replace(/\s+/g, ' ').trim(), so = / so far$/.test(word);
      return {label: (l ? l.innerText.trim() : '') + (so ? ' so far' : ''), score: +n.innerText.trim(), band: word.replace(/ so far$/, '')}; }),
    tapWhyScore: () => NOT('"Why this score?" breakdown'), whyExpanded: () => NOT('"Why this score?" breakdown'), whyPanel: () => NOT('"Why this score?" breakdown'),
    /** Your Six tiles in the order shown (names) */
    sixTiles: () => pg.evaluate(() => [...document.querySelectorAll('#main [data-tmsel]')].filter(e => e.getClientRects().length).map(e => (e.getAttribute('aria-label') || '').split(', ')[0])),
    /** "+ Add a Pokémon" slot tiles among the six */
    emptyTiles: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-six > *')].filter(e => e.getClientRects().length && /add a pok/i.test(e.innerText + (e.getAttribute('aria-label') || ''))).length),
    tapTile: name => tapFound(n => [...document.querySelectorAll('#main [data-tmsel]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || '').split(', ')[0] === n) || null, name, 'tile ' + name, 700),
    tilePressed: name => pg.evaluate(n => { const e = [...document.querySelectorAll('#main [data-tmsel]')].find(e => (e.getAttribute('aria-label') || '').split(', ')[0] === n); return e ? e.getAttribute('aria-pressed') === 'true' : null; }, name),
    /** the selected Pokémon's set (the Set section) */
    setCard: () => txt('#main #tm-set'),
    showSet: async name => { if (!(await H.tilePressed(name))) await H.tapTile(name); return H.setCard(); },
    lockOnTile: () => NOT('lock control on the team tile (Lock is inside Edit Set)'),
    tileLockLabel: () => NOT('lock state shown on the team tile (Lock is inside Edit Set)'),
    /** remove a Pokémon from the team (here: Edit Set → "Remove <name>") */
    removeFromTeam: async name => { await H.settle(400, 5000); await H.openEditPanel(name); await click('.ed2 [data-ed="rm"]', 800); },
    gamePlanLine: () => NOT('"Game plan vs the meta\'s top six: lead …, back …, bench …" line (tiles show Lead/Back/Bench)'),
    /** the team actions are all on show (no ⋯ menu), so there is nothing to open */
    openMoreActions: async () => {},
    /** tap one of the team actions, by today's name */
    teamAction: name => { const sel = {'Saved Teams': '[data-v2saved]', 'My Box': '#main a[href="#box"]', 'Compare with…': '[data-cxgo2]', 'Save team': '[data-v2save]', 'Update saved team': '[data-v2save]', 'Share': '[data-v2share]', 'Copy for Showdown': '#main [data-v2copy]', 'Import': '[data-v2import]', 'Clear team': '[data-v2clear]', 'Team Sheet': '#main [data-v2sheetopen]'}[name];
      if (!sel) NOT('team action ' + name); return click(sel, 900); },
    /** the team actions on show, under today's names (the button's own label is read; only its wording is mapped) */
    teamActions: () => pg.evaluate(() => { const m = document.querySelector('#main'); if (!m) return [];
      const MAP = [['data-v2save', 'Save Team', 'Save team'], ['data-v2share', 'Share', 'Share'], ['data-v2sheetopen', 'Team Sheet', 'Team Sheet'], ['data-v2copy', 'Copy for Showdown', 'Copy for Showdown'], ['data-v2import', 'Import', 'Import'], ['data-v2saved', 'Saved Teams', 'Saved Teams'], ['data-cxgo2', 'Compare', 'Compare with…'], ['data-v2clear', 'Clear Team', 'Clear team']];
      const out = []; for (const e of m.querySelectorAll('.tm-acts > *, .tm-empty button, .tm-empty a')) { if (!e.getClientRects().length) continue; const t = e.innerText.replace(/\s+/g, ' ').trim().replace(/ \d+$/, '');
        // the action is named by what the button does (its data attribute), so a reworded label still counts as that action
        const hit = MAP.find(([a]) => e.hasAttribute(a)); out.push(hit ? hit[2] : e.getAttribute('href') === '#box' ? 'My Box' : t); } return out; }),
    jumpBar: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-jump [data-tmjump]')].filter(e => e.getClientRects().length).map(e => e.childNodes[0].textContent.trim())),
    jumpTo: name => tapFound(n => [...document.querySelectorAll('#main .tm-jump [data-tmjump]')].find(e => e.getClientRects().length && e.childNodes[0].textContent.trim() === n) || null, name, 'jump ' + name, 900),
    onScreen: re => pg.evaluate(([s, f]) => { const re = new RegExp(s, f); const e = [...document.querySelectorAll('#main *')].filter(e => e.getClientRects().length && e.innerText && e.innerText.length < 60 && re.test(e.innerText)).pop(); if (!e) return null; const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, [re.source, re.flags]),
    // matchups: rows read in today's order "<name> <real-games verdict> Calc: <level>" (no rank number is shown here)
    topThreatRows: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-rows > li')].filter(e => e.getClientRects().length).map(e => { const nm = e.querySelector('.nm'), sm = nm && nm.querySelector('small'), v = e.querySelector('.tm-v');
      const name = nm ? [...nm.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent).join('').trim() : ''; return [name, v ? v.innerText.trim() : '', sm ? sm.innerText.trim() : ''].filter(Boolean).join(' ').replace(/\s+/g, ' '); })),
    tapThreat: () => NOT('threat sheet (matchup rows are not tappable)'), threatSheet: () => NOT('threat sheet'), tapThreatInSheet: () => NOT('threat sheet'), threatPressedInSheet: () => NOT('threat sheet'),
    gridRows: () => NOT('Top 12 grid'), tapGridRow: () => NOT('Top 12 grid'),
    pickTypeChartMega: () => NOT('Types fold (type chart, Mega pick)'),
    tapTip: () => NOT('"?" explainer bubbles'), tipBubble: () => NOT('"?" explainer bubbles'),
    /** shortcut for "edit this Pokémon's four moves" (same state change as today's adapter, through the shared logic) */
    giveMoves: (name, moves) => ui.peek(`(()=>{const i=S.slots.findIndex(s=>s.n===${JSON.stringify(name)});S.slots[i].mv={doubles:${JSON.stringify(moves)}};render();return i})()`).then(() => pg.waitForTimeout(1500)),
    // suggestions, read from the visible card into today's wording
    suggestionCards: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-sug > li')].filter(e => e.getClientRects().length).map(li => {
      const chs = [...li.querySelectorAll('.tm-chg')].map(c => { const sides = [...c.querySelectorAll('.tm-sw')], nm = s => s ? s.innerText.replace(/\s+/g, ' ').trim() : '';
        const inn = nm(c.querySelector('.tm-sw.in')), out = sides.length > 1 && !sides[0].classList.contains('in') ? nm(sides[0]) : ''; return out ? `${inn} for ${out}` : `+ ${inn} added`; });
      const mv = li.querySelector('.tm-mv'), b = mv && mv.querySelector('b'), sp = mv && mv.querySelector('span'), ap = li.querySelector('[data-v2plan]');
      return [chs.join(', '), b ? `${b.innerText.trim()} (${sp ? sp.innerText.replace(/\s+/g, ' ').trim() : ''})` : '', ap ? ap.innerText.trim() : ''].filter(Boolean).join(' '); })),
    applySuggestionCard: (i = 0) => pg.evaluate(i => { const b = [...document.querySelectorAll('#main [data-v2plan]')].filter(e => e.getClientRects().length)[i]; b.click(); }, i).then(() => pg.waitForTimeout(1500)),
    undoBar: () => NOT('Undo bar for applied suggestions (only the toast Undo)'), undoLastApplied: () => NOT('Undo bar for applied suggestions (only the toast Undo)'),
    // edit panel: Edit Set (.ed2), and the other panels today's #chEdit hosts: Import (.imp2), Save (.sv2), Add (search sheet)
    editPanel: () => pg.evaluate(() => { const w = window.V2 && V2._sheet && V2._sheet.wrap, s = w && w.querySelector('.np-sheet'); if (!s) return null; const c = s.querySelector('.ed2,.imp2,.sv2,.np-find'); if (!c) return null;
      const h = c.querySelector('h2'), ht = h ? h.innerText.replace(/\s+/g, ' ').trim() : ''; return {title: c.classList.contains('ed2') && !/^Add a Pok/.test(ht) ? 'Edit ' + ht : ht, text: s.innerText.replace(/\s+/g, ' ').trim()}; }),
    openEditPanel: async name => { await H.showSet(name); await click('#main #tm-set [data-v2edit]', 900); await H.settle(); },
    closeEditPanel: () => closeSheet(),
    editStrip: () => pg.evaluate(() => [...document.querySelectorAll('.ed2 .ed-pk')].filter(e => e.getClientRects().length).map(e => e.getAttribute('aria-label'))),
    tapStrip: i => click(`.ed2 .ed-pk[data-k="${i}"]`, 800),
    panelLock: () => click('.ed2 [data-ed="lock"]', 700),
    panelLockText: () => txt('.ed2 [data-ed="lock"]'),
    panelSlot: () => pg.evaluate(() => { const b = document.querySelector('.ed2 .ed-pk[aria-pressed="true"]'); return b ? +b.dataset.k : 0; }),
    pickInPanel: async (what, value, j = 0) => { const sel = {nature: '.ed2 select[data-ed="nat"]', ability: '.ed2 select[data-ed="ab"]', item: '.ed2 select[data-ed="it"]', move: `.ed2 select[data-ed="mv"][data-j="${j}"]`}[what];
      const loc = pg.locator(sel).first(); const opt = await loc.evaluate((s, v) => { const nm = t => t.split(' · ')[0].replace(/[★\s]+$/, '').replace(/ \([\d.]+%\)$/, '').trim(); const o = [...s.options].find(o => nm(o.text) === v || o.value === v); return o ? o.value : null; }, value);
      if (opt == null) throw new Error('no ' + what + ' option ' + value); await loc.selectOption(opt); await pg.waitForTimeout(900); },
    panelOptions: what => pg.evaluate(sel => { const s = document.querySelector(sel); const nm = t => t.split(' · ')[0].replace(/[★\s]+$/, '').replace(/ \([\d.]+%\)$/, '').trim(); return s ? [...s.options].map(o => nm(o.text)) : []; },
      {nature: '.ed2 select[data-ed="nat"]', ability: '.ed2 select[data-ed="ab"]', item: '.ed2 select[data-ed="it"]', move3: '.ed2 select[data-ed="mv"][data-j="3"]'}[what]),
    panelMoves: () => pg.evaluate(() => [0, 1, 2, 3].map(j => { const s = document.querySelector(`.ed2 select[data-ed="mv"][data-j="${j}"]`); return s ? s.options[s.selectedIndex].text.split(' · ')[0].trim() : null; })),
    setStatPoints: async v => { for (let k = 0; k < 6; k++) { const loc = pg.locator(`.ed2 input[data-ed="pt"][data-j="${k}"]`).first(); await loc.fill(String(v[k])); await loc.dispatchEvent('input'); } await pg.waitForTimeout(300); },
    saveStatPoints: () => click('.ed2 [data-ed="ptsave"]', 900),
    statTotal: () => txt('.ed2 [data-ed-tot]'),
    statMsg: () => txt('.ed2 [data-ed-msg]'),
    panelButton: m => H.tapText(m, 900),
    // add a Pokémon: the search sheet (data-v2q), the box's add sheet (data-bxq), the log form's opponent search (data-ygq)
    nameBox: () => pg.evaluate(() => { const i = [...document.querySelectorAll('[data-v2q],[data-bxq],[data-ygq]')].find(e => e.getClientRects().length); return i ? {focused: i === document.activeElement, value: i.value} : null; }),
    typeName: async (text, sel = '#chEdit input[placeholder]') => { const [s, opener] = NAMEBOX[sel] || [sel, null];
      if (!(await vis(s)) && opener) { if (!(await vis(opener))) NOT('a way to open ' + s + ' here'); await click(opener, 600); }
      const loc = pg.locator(s).filter({visible: true}).first(); await loc.click(); await loc.fill(''); await loc.pressSequentially(text, {delay: 20}); await pg.waitForTimeout(500); },
    nameOptions: () => pg.evaluate(() => { const l = [...document.querySelectorAll('.np-sheet .hits')].find(e => e.getClientRects().length); return l ? [...l.querySelectorAll('.np-hit')].filter(e => e.getClientRects().length).map(o => o.innerText.replace(/\s+/g, ' ').trim()) : []; }),
    nameListText: () => pg.evaluate(() => { const l = [...document.querySelectorAll('.np-sheet .hits')].find(e => e.getClientRects().length); return l ? l.innerText.replace(/\s+/g, ' ').trim() : null; }),
    // import / export
    openImport: () => click('[data-v2import]', 800),
    pasteTeam: async text => { await pg.locator('[data-impin]').fill(text); await click('[data-impgo]', 1500); },
    openExport: () => NOT('Export to Showdown panel (only Copy for Showdown)'), exportText: () => NOT('Export to Showdown panel (only Copy for Showdown)'),
    clearTeam: () => click('#main [data-v2clear]', 900),
    // share (.sh2 sheet)
    openShare: () => click('#main [data-v2share]', 1500),
    shareBox: () => pg.evaluate(() => { const b = document.querySelector('.np-sheet .sh2'); if (!b || !b.getClientRects().length) return null; const i = b.querySelector('[data-sh2img] img'), h = b.querySelector('h2');
      return {title: h ? h.innerText.replace(/\s+/g, ' ').trim() : '', w: i ? i.naturalWidth : 0, h: i ? i.naturalHeight : 0, alt: i ? i.alt : '', src: i ? i.src.slice(0, 30) : '', text: b.innerText.replace(/\s+/g, ' ')}; }),
    shareImagePixel: () => pg.evaluate(async () => { const i = document.querySelector('.np-sheet .sh2 [data-sh2img] img'); if (!i) return null; await i.decode().catch(() => {}); const c = document.createElement('canvas'); c.width = 8; c.height = 8; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 8, 8); const d = x.getImageData(0, 0, 8, 8).data; let s = 0; for (let k = 0; k < d.length; k += 4) s += d[k] + d[k + 1] + d[k + 2]; return s / (d.length / 4) / 3; }),
    waitShareImage: () => waitFor(async () => { const s = await H.shareBox(); return s && s.w > 0 ? s : null; }, 10000),
    closeShare: () => closeSheet(),
    // your games (#tm-yg section; the log form is a sheet, read with the card as today's form sits inside the card)
    openLogForm: () => click('#main [data-yglog]', 600),
    openLogFormByKeyboard: async () => { await pg.focus('#main [data-yglog]'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(600); },
    undoLoggedGame: async () => { for (let k = 0; k < 3; k++) { await H.settle(400, 4000); if (!(await has('[data-ygundo]'))) return; await click('[data-ygundo]', 600); if (await H.waitToast(/Game removed/, 1500)) return; } },
    pickLead: async name => { await H.settle(300, 3000); if (!(await has(`[data-yglead="${name}"]`))) await H.openLogForm(); return click(`[data-yglead="${name}"]`, 300); },
    pickLeadRaw: name => click(`[data-yglead="${name}"]`, 300),
    useBattleOpponents: () => click('[data-ygbm]', 400),
    logResult: wl => click(`[data-ygres="${wl}"]`, 900),
    myGamesCard: () => pg.evaluate(() => { const c = [...document.querySelectorAll('#main #tm-yg')].find(e => e.getClientRects().length), f = document.querySelector('.np-sheet .yg2');
      return c || f ? [c, f].filter(Boolean).map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' ') : null; }),
    sheetColumns: () => pg.evaluate(() => { const c = [...document.querySelectorAll('.ts2 .ts2-card')].filter(e => e.getClientRects().length); if (!c.length) return 0; const top = Math.round(c[0].getBoundingClientRect().top); return c.filter(e => Math.abs(Math.round(e.getBoundingClientRect().top) - top) < 4).length; }),
    // saved teams (.svt2 sheet)
    savedCards: () => pg.evaluate(() => [...document.querySelectorAll('.svt2 .svt2-card:not(.svt2-free)')].filter(e => e.getClientRects().length).map(c => c.innerText.replace(/\s+/g, ' ').trim())),
    savedCardOf: name => H.savedCards().then(a => a.find(t => t.startsWith(name + ' ') || t.includes(name)) || null),
    savedAction: async (name, what) => { if (!(await vis('.svt2'))) await H.openSavedSheet();
      const a = {Open: 'open', 'Copy for Showdown': 'copy', Rename: 'ren', Delete: 'del'}[what]; if (!a) NOT('saved team action ' + what);
      const label = {open: 'Open ', copy: 'Copy ', ren: 'Rename ', del: 'Delete '}[a] + name + (a === 'copy' ? ' for Showdown' : '');
      return tapFound(([a, l]) => [...document.querySelectorAll(`.svt2 [data-svact="${a}"]`)].find(e => e.getClientRects().length && e.getAttribute('aria-label') === l) || null, [a, label], label, a === 'open' ? 1500 : 700); },
    typeSaveName: async name => { const l = pg.locator('[data-v2savename]'); await l.fill(name); await pg.waitForTimeout(200); },
    typeRename: async name => { const l = pg.locator('.svt2 [data-svname]').filter({visible: true}).first(); await l.fill(name); await pg.waitForTimeout(200); },
    addRetiredSinglesTeam: name => ui.peek(`S.teams.push({id:'tsg',name:${JSON.stringify(name)},slots:[{n:'Garchomp',a:null,lock:false}],format:'singles',saved:Date.now()});render()`).then(() => pg.waitForTimeout(600)),
    // box
    tapBoxUndo: () => click('.np-toast [data-bxundo], .np-toast #toastUndo', 900),
    typeBoxLink: async t => { if (!(await vis('[data-bxlinkin]'))) await click('[data-bxlink="open"]', 400); await pg.locator('[data-bxlinkin]').fill(t, {timeout: 5000}); await pg.waitForTimeout(200); },
    /** every Pokémon in the box, as shown: box by box (boxes of 30), then back to the box that was showing */
    boxNames: async () => { const read = () => pg.evaluate(() => [...document.querySelectorAll('#main .bx-grid [data-bxsel]')].filter(e => e.getClientRects().length).map(e => e.dataset.bxsel));
      const pages = await pg.evaluate(() => [...document.querySelectorAll('#main [data-bxpage]')].filter(e => e.getClientRects().length).length); if (pages < 2) return read();
      const was = await pg.evaluate(() => { const b = document.querySelector('#main [data-bxpage][aria-pressed="true"]'); return b ? +b.dataset.bxpage : 0; }); let all = [];
      for (let i = 0; i < pages; i++) { await click(`#main [data-bxpage="${i}"]`, 300); all = all.concat(await read()); } await click(`#main [data-bxpage="${was}"]`, 300); return all; },
    addToBox: async name => { await H.typeName(name, '#boxAdd'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800); },
    /** pick it in the box, then "Remove from Box" on its summary */
    removeFromBox: async name => { await click(`#main [data-bxsel="${name}"]`, 500); await click(`[data-bxrm="${name}"]`, 700); },
    boxSortBy: label => tapFound(l => [...document.querySelectorAll('#main [data-v2slide="box-sort"] > button')].find(e => e.getClientRects().length && e.innerText.trim() === l) || null, label, 'box sort ' + label, 700),
    // compare
    pickCompareTeam: async name => { if (!(await vis('.cx2-pick'))) { await waitFor(() => vis('.cx2-pick'), 1500); if (!(await vis('.cx2-pick'))) await click('#main [data-cxp="B"]', 700); }
      await tapFound(n => [...document.querySelectorAll('.cx2-pick [data-cxset2]')].find(e => e.getClientRects().length && e.innerText.includes(n) && e.getAttribute('aria-disabled') !== 'true') || null, name, 'compare pick ' + name, 1500); },
    compareHeads: () => pg.evaluate(() => [...document.querySelectorAll('#main .cx2-head')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    pasteCompareTeam: async text => { if (!(await vis('[data-cxpaste-in]'))) await click('#main [data-cxp="B"]', 700); await pg.locator('[data-cxpaste-in]').fill(text); await click('[data-cxpaste2]', 1500); },
    compareCheckRows: () => pg.evaluate(() => [...document.querySelectorAll('#main .cx2-row')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /[✓✗?]/.test(t))),
    // shared behaviour
    doubleTapApply: async () => { const b = pg.locator('#main [data-v2plan]').filter({visible: true}).first(); await b.scrollIntoViewIfNeeded(); await b.dblclick({delay: 60}); await pg.waitForTimeout(1500); },
    scrollToSuggestions: async () => { await pg.evaluate(() => { const b = [...document.querySelectorAll('#main [data-v2plan]')].find(e => e.getClientRects().length); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 300); }); await pg.waitForTimeout(600); },
    goBack: async () => { await pg.goBack().catch(() => {}); await pg.waitForTimeout(800); },
    sliderIndex: label => pg.evaluate(l => { const b = [...document.querySelectorAll('[data-v2slide] > button')].find(e => e.getClientRects().length && e.innerText.trim().toLowerCase() === l.toLowerCase()); const g = b && b.parentElement; return g ? [...g.querySelectorAll('button')].indexOf(b) + '|' + g.style.getPropertyValue('--i') : null; }, label),
    pageLuminance: () => pg.evaluate(() => { const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }),
    retirePokemonInSlot: (i, name) => ui.peek(`S.slots[${i}]={n:${JSON.stringify(name)},a:null,lock:false};render()`).then(() => pg.waitForTimeout(1200)),
  };
  return H;
};
