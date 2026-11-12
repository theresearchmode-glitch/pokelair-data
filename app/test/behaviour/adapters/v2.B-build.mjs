// Page helpers for group B (Build: Build for Me, Build around a core, recent winners) on the REBUILD (app/dist/v2.html). Same names
// and meanings as adapters/current.B-build.mjs, against the new Build page's markup (src/v2/pages/build.js, address #build).
// Where the new build has no equivalent yet, the helper throws Error('not in v2 yet: <what>') so the failure names the missing
// feature; nothing is faked. Only the Build page helpers the AUTO-* and CORES-* tests call are wired here (Nov 12); the other
// group B helpers (All Suggestions, Popular Sets, Archetypes, My Team pieces) throw "not wired for v2 yet" until their pages exist.
// Notes on translation (what the player sees, read from the new markup):
//  - "How It Works" is a sheet here (data-bdhow), not a fold: unfold() opens the sheet and returns its text
//  - "Start from a Recent Winner" is an always-open section (.bd-wins) with one fold per winner: unfold() returns the section's text
//  - "Try another" is "Show this one ›" on the next option under Other options (data-bdshow): tryAnother() taps the next one, wrapping
//  - the built six's ids come from the shared engine's shown option (abTeam('doubles'), the same object the page draws from)
//  - the score reads "83 Tournament ready Strength Score" on screen; buildResult() puts "Strength Score 83 Tournament ready" first, as
//    today's card reads (same numbers and words, only the order of the three parts)
//  - toasts are .np-toast elements (one at a time); today's #toastUndo is the button inside it
const NOT = what => { throw new Error('not in v2 yet: ' + what); };
const RE = m => m instanceof RegExp ? [m.source, m.flags] : null;
// today's part names -> the new Build page's parts (other pages' parts are not in v2 yet)
const AREAS = {'built team': '#main .bd-result', 'cores': '#main .bd-cores', 'info sheet': '.np-sheet .ms2', 'Build page': '#main .bd2', 'My team page': '#main'};
// today's name boxes on Build -> the new page's ([data-bdfind] = "Build around a Pokémon"); the cores filter box has no equivalent
const BOXES = {'favourite pokémon': '[data-bdfind]', 'with a pokémon': '[data-bdcfind]'};
const NO_BOX = {'exclude a pokémon': 'Never suggest box (All Suggestions › Plan settings)', 'look up a pokémon': 'Popular Sets look-up box'};
// controls today's Build page has that the new one doesn't (a failed tap on #build names them)
const NO_TAP = [[/details/i, 'Details / Hide details on core rows'], [/^Sets$/, 'the Sets toggle on recent winners (each winner is a fold with its sets here)'],
  [/teams with it/i, 'Teams with it on cores'], [/try another/i, 'Try another'], [/show more/i, 'Show more on cores']];
export default (ui, pg) => {
  const tx = s => (s || '').replace(/\s+/g, ' ').trim();
  const txt = sel => pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const vis = sel => pg.evaluate(s => [...document.querySelectorAll(s)].some(e => e.getClientRects().length && !e.closest('[hidden]')), sel);
  const click = async (sel, wait = 400) => { const ok = await pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')); if (e) { e.click(); return true; } return false; }, sel);
    if (!ok) throw new Error(`nothing visible: ${sel}`); await pg.waitForTimeout(wait); };
  const until = async (fn, ms = 8000, what = 'condition') => { const t0 = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`); await pg.waitForTimeout(150); } };
  const onBuild = () => pg.evaluate(() => !!window.V2 && V2.route() === 'build');
  const ev = e => pg.evaluate(e => window.__ev ? window.__ev(e) : undefined, e);
  const boxSel = label => { const l = String(label).toLowerCase(); for (const k in NO_BOX) if (l.includes(k)) NOT(NO_BOX[k]); for (const k in BOXES) if (l.includes(k)) return BOXES[k]; return null; };
  // the shared adapter's (and v2.A-team's) go / tap, wrapped; the kit may merge this file more than once, so keep the first ones
  const prevGo = ui.go.__bPrev || ui.go, baseGo = ui.go.__v2base || ui.go, prevTap = ui.tap.__bPrev || ui.tap;
  const ans = '#main .bd-ans';
  // the answer area as today's #abOut reads: kicker, option count, title, "Strength Score n band", rank, then the rest as shown
  const resultText = () => pg.evaluate(() => { const T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; const r = document.querySelector('#main .bd-result'); if (!r || !r.getClientRects().length) return '';
    const a = r.querySelector('.bd-ans'); if (!a) return T(r);
    const eb = T(a.querySelector('.bd-lock .np-eyebrow')), m = (/^Option \d+ of \d+ · /.test(eb) ? eb : 'Option 1 of 1 · ' + eb).match(/^(Option \d+ of \d+) · (.+)$/) /* one option: the page shows only the kind */, sc = a.querySelector('.bd-score'), n = sc && sc.querySelector('b'), w = sc && sc.querySelector('.w span');
    const head = m ? `${m[2]} ${m[1]}` : eb, score = n ? `Strength Score ${T(n)} ${T(w)}` : '';
    const rest = [...r.children].map(c => c === a ? [...a.querySelectorAll('.bd-lock > :not(.np-eyebrow):not(.bd-score), .bd-six')].map(T).join(' ') : T(c)).join(' ');
    return [head, score, rest].filter(Boolean).join(' '); });
  const optCount = async () => { const e = await txt(ans + ' .bd-lock .np-eyebrow'); if (!e) return null; const m = e.match(/^Option (\d+) of (\d+)/); return m ? [+m[1], +m[2]] : [1, 1]; }; /* no count shown = the only option */
  const toastNow = () => pg.evaluate(() => { const t = [...document.querySelectorAll('.np-toast')].find(e => e.getClientRects().length); if (!t) return '';
    const c = t.cloneNode(true); c.querySelectorAll('button').forEach(b => b.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); });
  const H = {
    area: name => { if (!AREAS[name]) NOT(`the "${name}" part (its page is not rebuilt yet)`); return AREAS[name]; },
    until,
    waitSee: (m, ms = 8000) => until(() => ui.sees(m), ms, `"${m}" to show`),

    // ---------------- pages ----------------
    /** Build / Build for Me open #build; "cores" (today's menu entry Build around a core, which scrolls to the cores) has no v2 entry */
    go: async (name, wait = 600) => { const v = ui.PAGES[name] || name;
      if (v === 'cores') NOT('a menu entry "Build around a core" that opens Build scrolled to the cores');
      if (v !== 'auto') return prevGo(name, wait);
      await pg.evaluate(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); if (location.hash !== '#build') location.hash = '#build'; else if (window.V2) V2.redraw(); }); await pg.waitForTimeout(wait); return 'auto'; },
    /** the shared tap; on the Build page a miss is retried ignoring case (the new build writes buttons in Title Case, as v2.A-team's
     *  tapText), and a control the new page doesn't have is named */
    tap: async (match, within = 'body', wait = 500) => { if (match === '?' && await pg.evaluate(() => !!document.querySelector('#main [data-bdcwhy]'))) { await pg.click('#main [data-bdcwhy]'); await pg.waitForTimeout(wait); return; } /* today's cores "?" = the new page's "How cores are ranked ›" */
      try { return await prevTap(match, within, wait); } catch (e) {
        if (!/nothing visible to tap/.test(e.message) || !(await onBuild())) throw e;
        if (match instanceof RegExp && !match.flags.includes('i')) { try { return await prevTap(new RegExp(match.source, match.flags + 'i'), within, wait); } catch (x) {} }
        const s = match instanceof RegExp ? match.source : String(match); for (const [re, what] of NO_TAP) if (re.test(s) || (typeof match === 'string' && re.test(match))) NOT(what + ' on the Build page');
        throw e; } },

    // ---------------- shared bits ----------------
    toast: toastNow,
    waitForToast: (m, ms = 6000) => until(async () => { const t = await toastNow(); return t && (m instanceof RegExp ? m.test(t) : t.toLowerCase().includes(String(m).toLowerCase())) ? t : ''; }, ms, `toast ${m}`),
    toastOffersUndo: () => vis('.np-toast #toastUndo'),
    undoToast: () => click('.np-toast #toastUndo', 600),
    /** is the visible pressable control with this text pressed? (the new sliders' buttons carry aria-pressed) null if not found */
    pressed: (m, within = 'body') => pg.evaluate(([m, re, w]) => { const r = re ? new RegExp(re[0], re[1]) : null, t = e => (e.innerText || '').replace(/\s+/g, ' ').trim();
      const root = document.querySelector(w) || document.body;
      const e = [...root.querySelectorAll('[aria-pressed]')].find(e => e.getClientRects().length && !e.closest('[hidden]') && (r ? r.test(t(e)) : t(e).toLowerCase().includes(m.toLowerCase())));
      return e ? e.getAttribute('aria-pressed') === 'true' : null; }, [String(m), RE(m), within]),
    /** open a fold whose heading matches; returns its text (see the notes at the top for How It Works and Start from a Recent Winner) */
    unfold: async (m, within = 'body') => { const s = m instanceof RegExp ? m.source.replace(/^\^/, '') : String(m), is = k => new RegExp('^' + k.replace(/ /g, ' '), 'i').test(s.replace(/\\/g, ''));
      if (await onBuild()) {
        if (is('How It Works')) { if (!(await vis('.np-sheet .bd-how'))) await click('#main [data-bdhow]', 600); return txt('.np-sheet .bd-how'); }
        if (is('Start from a Recent Winner')) { if (!(await vis('#main .bd-wins'))) NOT('Start from a recent winner (no winners shown)'); return txt('#main .bd-wins'); }
        if (is('Sets and Roles')) NOT('the Sets and Roles fold on the built team (the six tiles show item, role and tier instead)');
        if (is('More Cores')) NOT('the More Cores fold (#4 onward): the new page lists 7 cores, then "Show N more"'); }
      const r = await pg.evaluate(([m, re, w]) => { const rx = re ? new RegExp(re[0], re[1]) : null; const root = document.querySelector(w) || document.body;
        const d = [...root.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); if (!s || !s.getClientRects().length || d.closest('[hidden]')) return false; const t = s.innerText.replace(/\s+/g, ' ');
          return rx ? rx.test(t) : t.toLowerCase().includes(m.toLowerCase()); });
        if (!d) return null; document.querySelectorAll('[data-bbfold]').forEach(x => x.removeAttribute('data-bbfold')); d.setAttribute('data-bbfold', '1'); if (!d.open) d.querySelector(':scope > summary').click(); return true; }, [String(m), RE(m), within]);
      if (!r) NOT(`a fold ${m} on this page`); await pg.waitForTimeout(400);
      return pg.evaluate(() => { const d = document.querySelector('[data-bbfold]'); return d ? d.innerText.replace(/\s+/g, ' ').trim() : ''; }); },
    isUnfolded: async m => { const s = m instanceof RegExp ? m.source.replace(/^\^/, '') : String(m);
      if (await onBuild() && /^How It Works/i.test(s)) return vis('.np-sheet .bd-how');
      return pg.evaluate(([m, re]) => { const rx = re ? new RegExp(re[0], re[1]) : null;
        const d = [...document.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); if (!s || !s.getClientRects().length) return false; const t = s.innerText.replace(/\s+/g, ' '); return rx ? rx.test(t) : t.toLowerCase().includes(m.toLowerCase()); });
        return d ? d.open : null; }, [String(m), RE(m)]); },
    /** Megas on team (the "sgmega" slider, shared with My Team): the pressed value, a tap */
    megasShown: () => pg.evaluate(() => { const b = [...document.querySelectorAll('[data-v2slide="sgmega"] > button[aria-pressed="true"]')].find(e => e.getClientRects().length); return b ? +b.dataset.v : null; }),
    setMegas: (n, wait = 600) => click(`[data-v2slide="sgmega"] > button[data-v="${n}"]`, wait),
    /** reload the page as the same player: what was saved (this browser and the account) survives, like a real reload */
    reloadAsSamePlayer: async (wait = 1500) => {
      if (!pg.__keepInit) { pg.__keepInit = true; await pg.addInitScript(() => { try { const k = sessionStorage.getItem('__keep'); if (!k) return; const v = JSON.parse(k);
        for (const [key, val] of Object.entries(v.ls)) localStorage.setItem(key, val); if (v.acct) window.__acct = v.acct; } catch (e) {} }); }
      await pg.evaluate(() => { const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); } sessionStorage.setItem('__keep', JSON.stringify({ls, acct: window.__acct})); });
      await pg.reload(); await pg.waitForTimeout(wait); },
    /** the player's team as the page names them (display names) */
    teamNames: () => ev('S.slots.filter(s=>s.n).map(s=>byName.get(s.n).d)'),
    slotSet: i => ev(`JSON.parse(JSON.stringify(S.slots[${i}]))`),
    battleOpponentIds: () => ev('S.opp.slice()'),
    openTipText: () => pg.evaluate(() => { const w = document.querySelector('.np-sheet .bd-cwhy'); return w ? w.innerText.replace(/\s+/g, ' ').trim() : ''; }),
    openInfoSheetFor: async id => { if (!ui.tapPokemon) NOT('opening an info sheet from this page'); await ui.tapPokemon(id); },
    infoSheetText: () => txt('.np-sheet .ms2'),

    // ---------------- Pokémon name boxes (Build around) ----------------
    typeInto: async (label, text, enter = false) => { const s = boxSel(label); if (!s) return ui.type(label, text, enter);
      const el = pg.locator(s).filter({visible: true}).first(); if (!(await el.count())) throw new Error(`no visible input for "${label}"`);
      await el.click(); await el.fill(''); await el.type(text, {delay: 15}); if (enter) await el.press('Enter'); await pg.waitForTimeout(400); },
    boxValue: label => { const s = boxSel(label) || 'input'; return pg.evaluate(s => { const i = [...document.querySelectorAll(s)].find(i => i.getClientRects().length); return i ? i.value : null; }, s); },
    boxFocused: label => { const s = boxSel(label); if (!s) NOT(`the box "${label}"`); return pg.evaluate(s => !!document.activeElement && document.activeElement.matches(s), s); },

    // ---------------- Build for Me ----------------
    buildResult: resultText,
    /** the main Build button: {disabled, busy, label, primary (the main yellow button style, np-btn)} */
    buildButton: () => pg.evaluate(() => { const b = [...document.querySelectorAll('#main [data-bdgo]')].find(e => e.getClientRects().length); return b ? {disabled: b.disabled, busy: b.getAttribute('aria-busy') === 'true', label: b.innerText.replace(/\s+/g, ' ').trim(), primary: b.classList.contains('np-btn')} : null; }),
    /** tap Build and wait until a team or a no-result note shows; returns the result text */
    buildMeATeam: async (ms = 40000) => { await click('#main [data-bdgo]', 100);
      return until(async () => { const busy = await pg.evaluate(() => { const b = document.querySelector('#main [data-bdgo]'); return !!(b && b.getAttribute('aria-busy') === 'true') || !!document.querySelector('#main .bd-busy'); });
        const t = await resultText(); return !busy && (/Strength Score/.test(t) || await vis('#main .bd-none')) ? t : ''; }, ms, 'a built team'); },
    tapBuild: () => click('#main [data-bdgo]', 30),
    /** wait until "Option k of n" shows with n >= the given count (the fresh take arrives later); returns n */
    waitOptions: async (n, ms = 30000) => until(async () => { const o = await optCount(); return o && (!n || o[1] >= n) ? o[1] : 0; }, ms, `Option … of ${n}`),
    /** the six on the shown option (ids), as the page draws them: the engine's shown option */
    builtSix: async () => (await vis(ans)) ? ev(`(()=>{const t=abTeam('doubles');return t?t.mons.map(m=>m.n):[]})()`) : [],
    /** Try another = "Show this one ›" on the next option (wrapping after the last) */
    tryAnother: async () => { const o = await optCount(); if (!o || o[1] < 2) NOT('Try another with a single option (no other options shown)');
      await click(`#main .bd-others [data-bdshow="${o[0] % o[1]}"]`, 500); },
    useThisTeam: () => click(ans + ' ~ .bd-acts [data-bduse], #main .bd-result [data-bduse]', 800),
    saveBuiltTeam: () => click('#main .bd-result [data-bdsave]', 600),
    builtSaveButton: () => pg.evaluate(() => { const b = document.querySelector('#main .bd-result [data-bdsave]'); return b ? {disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.title || b.getAttribute('aria-label') || ''} : null; }),
    buildAround: async typed => { await H.typeInto('favourite Pokémon', typed); await pg.keyboard.press('Enter'); await pg.waitForTimeout(500); },
    /** the Build-around chip text ('' if none): its words, then " | " and its ×'s label */
    buildAroundChip: () => pg.evaluate(() => { const c = [...document.querySelectorAll('#main .bd-pick [data-bdx]')].find(e => e.getClientRects().length); return c ? c.parentElement.innerText.replace(/\s+/g, ' ').trim() + ' | ' + (c.getAttribute('aria-label') || '') : ''; }),
    clearBuildAround: () => click('#main [data-bdx]', 500),
    /** "My Box N" on the Build-from slider, read as today's "N in your box" line */
    boxCountLine: async () => { const t = await txt('#main [data-v2slide="bdsrc"] > button[data-v="box"]'); const m = t.match(/(\d+)/); return m ? `${m[1]} in your box` : ''; },
    /** copy for Showdown inside a part: the built team, a recent winner; returns the copied text */
    copyForShowdown: async (within = 'body', n = 0) => { 
      await pg.evaluate(() => { window.__copied = null; try { Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: t => { window.__copied = t; return Promise.resolve(); }}}); } catch (e) {} });
      await pg.evaluate(([w, n]) => { const b = [...(document.querySelector(w) || document).querySelectorAll('[data-bdcopy],[data-hmcopy],[data-bdccopy]')].filter(e => e.getClientRects().length)[n]; if (!b) throw new Error('no Copy for Showdown button'); b.click(); }, [within, n]);
      await pg.waitForTimeout(500); return pg.evaluate(() => window.__copied || ''); },
    /** the six on the n-th recent-winner row (display names, as today's card titles) */
    winnerSix: (n = 0) => pg.evaluate(n => { const d = [...document.querySelectorAll('#main .bd-wins [data-bdwin]')].filter(e => e.getClientRects().length)[n]; if (!d) return [];
      return window.__ev(`(()=>{const x=evTeam(${JSON.stringify(d.dataset.bdwin)});return x?x.t.mons.map(m=>byName.get(m.n)?byName.get(m.n).d:m.n):[]})()`); }, n),

    // ---------------- Cores ----------------
    coresText: () => txt(AREAS.cores),
    coreRowCount: () => pg.evaluate(() => document.querySelectorAll('#main .bd-cores [data-bdcore]').length),
    /** tap a core's button: today's "Add to my team" is "Add", "Load team" is "Load" here */
    coreTap: async (label, n = 0) => { const l = label.toLowerCase(), want = /^add/.test(l) ? 'add' : /^load/.test(l) ? 'load' : null;
      if (/^practice against/.test(l)) { const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('#main .bd-cores [data-bdcprep]')].filter(e => e.getClientRects().length)[n]; if (!b) return false; b.click(); return true; }, n); if (!ok) throw new Error('no core button ' + label); await pg.waitForTimeout(700); return; }
      if (!want) NOT(`"${label}" on cores`);
      const ok = await pg.evaluate(([w, n]) => { const b = [...document.querySelectorAll('#main .bd-cores [data-bdcore]')].filter(e => e.getClientRects().length && e.innerText.trim().toLowerCase().split(' ')[0] === w)[n] /* 'Load Team' (Sim, Nov 12) counts as today's Load team */; if (!b) return false; b.click(); return true; }, [want, n]);
      if (!ok) throw new Error('no core button ' + label); await pg.waitForTimeout(700); },
    coreMembers: (n = 0) => pg.evaluate(n => { const b = [...document.querySelectorAll('#main .bd-cores [data-bdcore]')].filter(e => e.getClientRects().length)[n]; return b ? b.dataset.bdcore.split('|') : []; }, n),
    clearCoreFilter: async () => { await pg.click('[data-bdcmx]'); await pg.waitForTimeout(600); },
    coreFilterChip: () => pg.evaluate(() => { const c = document.querySelector('.bd-cpick'); return c ? c.innerText.trim() : ''; }),
    coresTopOnScreen: () => pg.evaluate(() => { const c = document.querySelector('#main .bd-cores'); return c ? Math.round(c.getBoundingClientRect().top) : null; }),
  };
  H.go.__bPrev = prevGo; H.go.__v2base = baseGo; H.tap.__bPrev = prevTap;
  // the rest of today's group B helpers belong to pages not rebuilt yet (All Suggestions, Popular Sets, Archetypes) or to My Team
  for (const k of ['neverSuggest', 'waitSwaps', 'swapCards', 'biggerPlans', 'setsText', 'archText', 'usageCounts', 'builtTileLabel', 'tapBuiltTile'])
    if (!(k in ui) || ui[k].__v2b) { const f = () => NOT(`${k} (group B helper not wired for v2 yet)`); f.__v2b = 1; H[k] = f; }
  return H;
};
