// Page helpers for group B (Build: Build for Me, Build around a core, recent winners) on the REBUILD (app/dist/v2.html). Same names
// and meanings as adapters/current.B-build.mjs, against the new Build page's markup (src/v2/pages/build.js, address #build).
// Where the new build has no equivalent yet, the helper throws Error('not in v2 yet: <what>') so the failure names the missing
// feature; nothing is faked. Build helpers wired Nov 12; My Team / All Suggestions Nov 13; Popular Sets (pages/sets.js), Archetypes
// (pages/archetypes.js, the Weather Map: a style's guide opens from its region), the usage counts (pages/owner.js) and the Blueprint
// sheet (pages/build-sheet.js) Nov 15. Words are read as written: capitals drawn by CSS are switched off while reading (as the base text()).
// Notes on translation (what the player sees, read from the new markup):
//  - "How It Works" is a sheet here (data-bdhow), not a fold: unfold() opens the sheet and returns its text
//  - "Start from a Recent Winner" is an always-open section (.bd-wins) with one fold per winner: unfold() returns the section's text
//  - "Try another" is "Show this one ›" on the next option under Other options (data-bdshow): tryAnother() taps the next one, wrapping
//  - the built six's ids come from the shared engine's shown option (abTeam('doubles'), the same object the page draws from)
//  - the score reads "83 Tournament ready Strength Score" on screen; buildResult() puts "Strength Score 83 Tournament ready" first, as
//    today's card reads (same numbers and words, only the order of the three parts)
//  - toasts are .np-toast elements (one at a time); today's #toastUndo is the button inside it
// Nov 13: My Team's suggestions, All Suggestions, Edit Set and the cross-cutting helpers wired (src/v2/pages/sugs.js, team.js, six.js):
//  - All Suggestions is a sheet over My Team here (V2.openAllSugs, .sga2), not a page: go('All Suggestions') opens My Team, waits for
//    the planner, then taps "See All Suggestions ›" (or, when that link is hidden behind "Show N more", runs the same handler it calls)
//  - "Bigger plans" has no fold of its own: the sheet is ONE list (My Team's suggestions first, then every other plan, the multi-change
//    ones included), so biggerPlans() / unfold('Bigger Plans') read that sheet. Each card is read into today's Bigger plans wording
//    ("Suggestion 1, 2 changes +3 (88 → 91), <band if it changes> <lane> Out → In … Apply Why? N reasons"); swapCards() reads the
//    same cards ({text, button}: the button is the one shown, "Apply"); nothing on them is added that the card doesn't show
//  - My Team's suggestion cards are read into today's wording ("Suggestion 1 → In for Out → In for Out +3 (88 → 91) <lane> Apply …"),
//    as v2.A-team's suggestionCards does; the band word follows the score only when the card shows it (today's CH.gradeMove rule)
//  - today's Plan settings (a fold inside Bigger plans) = My Team's "Adjust suggestions" (Sim Q6, Nov 15-16: Suggest from, Megas on team,
//    Swap my Mega?, Count Abilities?, always shown under the Suggestions) with "Refresh Suggestions" and the "Never Suggest" sheet (Sim Q3 A,
//    Nov 15: Add a Pokémon / Allow Again). All Suggestions is a sheet over My Team, so reaching Plan settings closes it and shows those
//    controls, as a player would. Choices are read as shown, in sentence case (the new site writes buttons in Title Case: "Whole Roster" is
//    today's "Whole roster"); toasts and summary lines are never translated (they are the site's words)
//  - "Problems and Team Checks" is the "Things to Know" fold here ([data-v2fix], A2); Quick add picks are its [data-v2qa] buttons
//  - Edit Set opens from the Set section's "Edit Set" (data-v2edit) for the picked tile; Lock / Remove sit in the strip under the six
//    for the picked tile (data-v2lock / data-v2rm), so those helpers pick the tile first, as a player does
//  - today's "⋯" menu is My Team's More sheet ([data-v2more]); today's "← My Team" link on All Suggestions is the sheet's ✕
//  - the Undo bar is read where the player can see it: inside the open sheet if one is open, else on the page
const NOT = what => { throw new Error('not in v2 yet: ' + what); };
const RE = m => m instanceof RegExp ? [m.source, m.flags] : null;
// today's part names -> the new Build page's parts (other pages' parts are not in v2 yet)
const AREAS = {'built team': '#main .bd-result', 'cores': '#main .bd-cores', 'info sheet': '.np-sheet .ms2, #main .pk' /* Nov 15: the Pokémon page */, 'Build page': '#main .bd2', 'My team page': '#main',
  'My team suggestions': '#main #tm-sg', 'All suggestions page': '.np-sheet .sga2', 'Bigger plans': '.np-sheet .sga2', 'Popular sets page': '#main .st',
  'Plan settings': '#main .sg2-adj' /* My Team's Adjust suggestions (see the notes at the top) */};
// today's parts with no equivalent here (a helper asked for one names it)
const NO_AREA = {};
// today's Plan settings toggles -> the new site's sliders on My Team (data-v2slide keys, sugs.js)
const SETTING = {'Let plans swap my Mega': 'sgswap', 'Count abilities': 'sgabil'};
// the new site writes buttons in Title Case (Sim, Nov 9): a choice is read in sentence case, the way today's labels are written
const SENT = t => { t = (t || '').replace(/\s+/g, ' ').trim(); return t ? t[0] + t.slice(1).toLowerCase() : t; };
// one suggestion card (li) read into today's wording: 'my' = My Team's card, 'big' = today's Bigger plans card. Runs in the page.
const CARD = (li, mode) => { const T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : '';
  const chs = [...li.querySelectorAll('.tm-chg')].map(c => { const sw = [...c.querySelectorAll('.tm-sw')], inn = T(c.querySelector('.tm-sw.in')).replace(/\s*(In your box|To catch)$/, '') /* Nov 17: the card says whether it's yours (COV-04) */, out = sw.length > 1 && !sw[0].classList.contains('in') ? T(sw[0]) : ''; return {inn, out}; });
  const mv = li.querySelector('.tm-mv'), b = mv && mv.querySelector('b'), sp = mv && mv.querySelector('span'), w = mv && mv.querySelector('em');
  const score = b ? `${T(b)} (${T(sp)})${w ? ', ' + T(w) : ''}` : '', lane = T(li.querySelector('.sg2-ln')), btn = T(li.querySelector('[data-v2plan],[data-v2plana]')), why = T(li.querySelector('.sg2-why')), facts = T(li.querySelector('.sga2-facts')), own = [...li.querySelectorAll('.tm-own')].map(T).join(' ') /* Nov 18 (Q5 C): All Suggestions cards show types, tier, role, gem, Ability @ Item */;
  const eb = T(li.querySelector('.np-eyebrow'));
  if (mode === 'big') return [`${eb}, ${chs.length} change${chs.length === 1 ? '' : 's'}`, score, lane, chs.map(c => c.out ? `${c.out} → ${c.inn}` : `+ ${c.inn}`).join(' '), facts, btn, why, own].filter(Boolean).join(' ');
  return [eb, chs.map(c => c.out ? `→ ${c.inn} for ${c.out}` : `+ ${c.inn} added`).join(' '), score, lane, facts, btn, why, own].filter(Boolean).join(' '); };
// a part's visible text with its suggestion cards read through CARD (top-level children in order; hidden cards left out). My Team's
// "Adjust suggestions" block (.sg2-adj) sits at the end of the Suggestions section; it is today's Plan settings (with its "Never suggested:"
// list), not a suggestion, so it is left out here and read as the Plan settings part instead (today's #chSugOut holds no never-suggest list)
const READ = ([sel, mode, CARDs]) => { const CARD = eval('(' + CARDs + ')'), root = [...document.querySelectorAll(sel)].find(e => e.getClientRects().length); if (!root) return '';
  const T = e => e.innerText.replace(/\s+/g, ' ').trim();
  return [...root.children].filter(c => c.getClientRects().length && !c.matches('.sg2-adj')).map(c => c.matches('ol.tm-sug') ? [...c.children].filter(li => li.getClientRects().length).map(li => CARD(li, mode)).join(' ') : T(c)).filter(Boolean).join(' '); };
// today's name boxes on Build -> the new page's ([data-bdfind] = "Build around a Pokémon"); the cores filter box has no equivalent
const BOXES = {'favourite pokémon': '[data-bdfind]', 'with a pokémon': '[data-bdcfind]', 'look up a pokémon': '[data-stq]' /* Popular Sets (pages/sets.js) */};
const NO_BOX = {'exclude a pokémon': 'Never suggest box (All Suggestions › Plan settings)'};
// controls today's Build page has that the new one doesn't (a failed tap on #build names them)
const NO_TAP = [[/details/i, 'Details / Hide details on core rows'], [/^Sets$/, 'the Sets toggle on recent winners (each winner is a fold with its sets here)'],
  [/try another/i, 'Try another'], [/show more/i, 'Show more on cores']];
export default (ui, pg) => {
  const tx = s => (s || '').replace(/\s+/g, ' ').trim();
  /* words as written: capitals drawn by CSS (text-transform) are a look, not the words, so they are switched off while reading (as the base text()) */
  const txt = sel => pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')); if (!e) return '';
    const st = document.createElement('style'); st.textContent = '*,*::before,*::after{text-transform:none!important}'; document.head.append(st); try { return e.innerText.replace(/\s+/g, ' ').trim(); } finally { st.remove(); } }, sel);
  const vis = sel => pg.evaluate(s => [...document.querySelectorAll(s)].some(e => e.getClientRects().length && !e.closest('[hidden]')), sel);
  const click = async (sel, wait = 400) => { const ok = await pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.getClientRects().length && !e.closest('[hidden]')); if (e) { e.click(); return true; } return false; }, sel);
    if (!ok) throw new Error(`nothing visible: ${sel}`); await pg.waitForTimeout(wait); };
  const until = async (fn, ms = 8000, what = 'condition') => { const t0 = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`); await pg.waitForTimeout(150); } };
  const onBuild = () => pg.evaluate(() => !!window.V2 && V2.route() === 'build');
  /* Build's lower part is tabs (Look Q4 B on phones; Build Q1 B on every size): a player taps the section's tab first. A no-op
     when the page has no tab bar showing or the tab is already open. */
  const tabTo = async k => { const t = await pg.evaluate(k => { const b = document.querySelector(`#main .bd-jump [data-bdjump="${k}"]`);
    if (!b || !b.getClientRects().length || b.getAttribute('aria-pressed') === 'true') return 0; b.click(); return 1; }, k); if (t) await pg.waitForTimeout(400); };
  const ev = e => pg.evaluate(e => window.__ev ? window.__ev(e) : undefined, e);
  const boxSel = label => { const l = String(label).toLowerCase(); for (const k in NO_BOX) if (l.includes(k)) NOT(NO_BOX[k]); for (const k in BOXES) if (l.includes(k)) return BOXES[k]; return null; };
  // the shared adapter's (and v2.A-team's) go / tap, wrapped; the kit may merge this file more than once, so keep the first ones
  const text0 = ui.text.__bPrev || ui.text, prevGo = ui.go.__bPrev || ui.go, baseGo = ui.go.__v2base || ui.go, prevTap = ui.tap.__bPrev || ui.tap;
  const ans = '#main .bd-ans';
  // the answer area as today's #abOut reads: kicker, option count, title, "Strength Score n band", rank, then the rest as shown
  const resultText = () => pg.evaluate(() => { const T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; const r = document.querySelector('#main .bd-result'); if (!r || !r.getClientRects().length) return '';
    const st = document.createElement('style'); st.textContent = '*,*::before,*::after{text-transform:none!important}'; document.head.append(st); try {
    const a = r.querySelector('.bd-ans'); if (!a) return T(r);
    const eb = T(a.querySelector('.bd-lock .np-eyebrow')), m = eb.match(/^(Option \d+ of \d+) · (.+)$/) /* one option: the page shows only the kind, and so does this text (no made-up "Option 1 of 1", Nov 15) */, sc = a.querySelector('.bd-score'), n = sc && sc.querySelector('b'), w = sc && sc.querySelector('.w span');
    /* the Blueprint puts the rank in the score's small line ("Strength Score · Top 2% of tournament teams"): it follows the score here, as on today's card */
    const rk = a.classList.contains('bp') && sc ? T(sc.querySelector('small')).replace(/^Strength Score\s*·?\s*/, '') : '';
    const head = m ? `${m[2]} ${m[1]}` : eb, score = n ? `Strength Score ${T(n)} ${T(w)}${rk ? ' ' + rk : ''}` : '';
    /* the Blueprint sheet (pages/build-sheet.js, Nov 14) holds the Notes, the Spec, the Revisions and the actions inside .bd-ans: read all of it, less the eyebrow and score already put first */
    const bp = el => { const hide = [...el.querySelectorAll('.bd-lock .np-eyebrow, .bd-score')], was = hide.map(x => x.style.display); hide.forEach(x => { x.style.display = 'none'; }); try { return T(el); } finally { hide.forEach((x, i) => { x.style.display = was[i]; }); } };
    const rest = [...r.children].map(c => c === a ? (a.classList.contains('bp') ? bp(a) : [...a.querySelectorAll('.bd-lock > :not(.np-eyebrow):not(.bd-score), .bd-six')].map(T).join(' ')) : T(c)).join(' ');
    return [head, score, rest].filter(Boolean).join(' '); } finally { st.remove(); } });
  const optCount = async () => { const e = await txt(ans + ' .bd-lock .np-eyebrow'); if (!e) return null; const m = e.match(/^Option (\d+) of (\d+)/); return m ? [+m[1], +m[2]] : [1, 1]; }; /* no count shown = the only option */
  const toastNow = () => pg.evaluate(() => { const t = [...document.querySelectorAll('.np-toast')].find(e => e.getClientRects().length); if (!t) return '';
    const c = t.cloneNode(true); c.querySelectorAll('button').forEach(b => b.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); });
  // ---- My Team's suggestions and All Suggestions (src/v2/pages/sugs.js, team.js V2.plan) ----
  const sheetOpen = cls => pg.evaluate(c => !!(window.V2 && V2._sheet && V2._sheet.wrap.querySelector(c)), cls);
  /** the planner has finished for the team and settings as they are now (V2.plan, the same key today's page re-plans on) */
  const plansDone = () => ev('!!(V2.plan && !V2.plan.job && V2.plan.plans && V2.plan.key === V2.planKey())');
  const waitPlans = async () => { await until(plansDone, 30000, 'the planner'); await pg.waitForTimeout(400); };
  const readAll = mode => pg.evaluate(READ, ['.np-sheet .sga2', mode, CARD.toString()]);
  const readMine = () => pg.evaluate(READ, ['#main #tm-sg', 'my', CARD.toString()]);
  /** All Suggestions: My Team, wait for the planner, then "See All Suggestions ›"; when that link waits behind "Show N more", the
   *  handler it calls (V2.openAllSugs). An empty team has no All Suggestions (the sheet opens only from a team) */
  const openAll = async (wait = 600) => { if (await sheetOpen('.sga2')) return 'coverage';
    await prevGo('My Team', 400); if (!(await ev('members().length'))) return 'report';
    await waitPlans(); await until(async () => !(await pg.evaluate(() => { const s = document.querySelector('#main #tm-sg'); return !s || /Working out|Plotting your best changes/.test(s.innerText); })), 15000, 'My Team suggestions');
    if (await vis('#main [data-v2sgall]')) await click('#main [data-v2sgall]', wait); else { await pg.evaluate(() => V2.openAllSugs()); await pg.waitForTimeout(wait); }
    return 'coverage'; };
  /** the picked tile's index among the shown six for a slot (data-tmsel counts the six in slot order; members() = the same list) */
  const pickSlot = async i => { const k = await ev(`members().findIndex(m=>m.i===${i})`); if (k == null || k < 0) throw new Error('no Pokémon in slot ' + i);
    if (!(await pg.evaluate(k => { const b = document.querySelector(`#main [data-tmsel="${k}"]`); return !!(b && b.getAttribute('aria-pressed') === 'true'); }, k))) await click(`#main [data-tmsel="${k}"]`, 150); };
  const pickNamed = async name => { const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('#main [data-tmsel]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || '').split(', ')[0] === n); if (!b) return false; if (b.getAttribute('aria-pressed') !== 'true') b.click(); return true; }, name);
    if (!ok) throw new Error('no tile for ' + name + ' on My Team'); await pg.waitForTimeout(300); };
  /** the open Archetypes guide's words as written (capitals drawn by CSS switched off while reading, as the base text()) */
  const guideText = () => pg.evaluate(() => { const g = document.querySelector('#main .ar-guide'); if (!g) return ''; const st = document.createElement('style'); st.textContent = '*,*::before,*::after{text-transform:none!important}'; document.head.append(st);
    try { return g.innerText.replace(/\s+/g, ' ').trim(); } finally { st.remove(); } });
  const undoSel = () => pg.evaluate(() => window.V2 && V2._sheet ? '.np-sheet [data-undobar]' : '#main [data-undobar]');
  const H = {
    area: name => { if (NO_AREA[name]) NOT(NO_AREA[name]); if (!AREAS[name]) NOT(`the "${name}" part (its page is not rebuilt yet)`); return AREAS[name]; },
    until,
    waitSee: (m, ms = 8000) => until(() => ui.sees(m), ms, `"${m}" to show`),

    // ---------------- pages ----------------
    /** Build / Build for Me open #build; "cores" (today's menu entry Build around a core, which scrolls to the cores) has no v2 entry */
    go: async (name, wait = 600) => { const v = ui.PAGES[name] || name;
      /* today's menu entry "Build around a core" has no copy here (decisions.md Nov 13 6:23 PM: on Sim's list); the new site's way in is
         Home's "All Cores ›" (data-hmcores, pages/home.js), which opens Build at the cores: go('cores') takes that way, as a player would */
      if (v === 'cores') { await prevGo('Home', 400); const ok = await pg.evaluate(() => { const b = [...document.querySelectorAll('#main a.hm-all[data-hmcores], #main a[data-hmcores]')]; const e = b.find(x => x.getClientRects().length) || b[0]; if (!e) return false;
          const d = e.closest('details'); if (d && !d.open) d.querySelector(':scope > summary').click(); e.click(); return true; });
        if (!ok) { /* say it once (Nov 16, docs/rebuild/say-it-once.md): Home's More on Home fold (with its cores link) is gone; the way in is Build's own Cores tab */
          await ui.go('Build', 500); const t = await pg.$('#main [data-bdjump="cores"]'); if (!t) NOT('a way to Build\'s cores (no Cores tab on Build)'); await t.click(); }
        await pg.waitForTimeout(wait); return 'auto'; }
      if (v === 'coverage') return openAll(wait);
      if (v !== 'auto') return prevGo(name, wait);
      await pg.evaluate(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); if (location.hash !== '#build') location.hash = '#build'; else if (window.V2) V2.redraw(); }); await pg.waitForTimeout(wait); return 'auto'; },
    /** the shared tap; on the Build page a miss is retried ignoring case (the new build writes buttons in Title Case, as v2.A-team's
     *  tapText), and a control the new page doesn't have is named */
    tap: async (match, within = 'body', wait = 500) => { if (within === 'cores' || within === AREAS.cores) await tabTo('cores'); if (match === '?' && await pg.evaluate(() => !!document.querySelector('#main [data-bdcwhy]'))) { await pg.click('#main [data-bdcwhy]'); await pg.waitForTimeout(wait); return; } /* today's cores "?" = the new page's "How cores are ranked ›" */
      try { return await prevTap(match, within, wait); } catch (e) {
        if (!/nothing visible to tap/.test(e.message)) throw e;
        const src = match instanceof RegExp ? match.source : String(match);
        // today's "⋯" team menu = My Team's More sheet; today's "← My Team" on All Suggestions = the sheet's ✕ (it sits over My Team)
        if (/^\^?⋯\$?$/.test(src) && await vis('#main [data-v2more]')) return click('#main [data-v2more]', wait);
        if (/^\^?← My Team/i.test(src) && await vis('.np-sheet .sga2')) return click('.np-sheet > button.x[data-v2close]', wait);
        /* today's "Refresh plans" (Plan settings) = My Team's "Refresh Suggestions" (Sim Q6; word list: Suggestions, not plans); it sits with
           "See All Suggestions ›", which waits behind "Show N More Suggestions ›" while that is shown */
        if (/^\^?Refresh plans\$?$/i.test(src)) { await toSettings(); if (!(await vis('#main [data-v2replan]')) && await vis('#main [data-v2sgmore]')) await click('#main [data-v2sgmore]', 400); return click('#main [data-v2replan]', wait); }
        // the new build writes buttons and links in Title Case (Sim, Nov 9; as v2.A-team's tapText): a miss is retried ignoring case
        if (match instanceof RegExp && !match.flags.includes('i')) { try { return await prevTap(new RegExp(match.source, match.flags + 'i'), within, wait); } catch (x) {} }
        /* a row button that is a name plus a description (My Team's More sheet: "Clear Team" / "Empties all six spots…"): its name is its first line */
        if (await pg.evaluate(([m, re, w]) => { const rx = re ? new RegExp(re[0], re[1].includes('i') ? re[1] : re[1] + 'i') : null, root = document.querySelector(w) || document.body;
          const b = [...root.querySelectorAll('button,a,[role=button]')].find(e => { if (!e.getClientRects().length || e.closest('[hidden]')) return false; const f = (e.innerText || '').split('\n')[0].trim(); return rx ? rx.test(f) : f.toLowerCase() === m.toLowerCase(); });
          if (b) b.click(); return !!b; }, [String(match), RE(match), within])) { await pg.waitForTimeout(wait); return; }
        else if (typeof match === 'string') { /* strings already match ignoring case */ }
        if (!(await onBuild())) throw e;
        /* Build's lower half is tabs (Sim, Nov 13: Build Q1 B, tabs on every size): a control in a closed tab is reached by its tab first, as a player does */
        for (const k of ['cores', 'wins', 'others']) { if (!(await pg.evaluate(k => { const b = document.querySelector(`#main .bd-jump [data-bdjump="${k}"]`); return !!(b && b.getClientRects().length && b.getAttribute('aria-pressed') !== 'true'); }, k))) continue;
          await tabTo(k); try { return await prevTap(match instanceof RegExp && !match.flags.includes('i') ? new RegExp(match.source, match.flags + 'i') : match, within, wait); } catch (x) {} }
        const s = match instanceof RegExp ? match.source : String(match); for (const [re, what] of NO_TAP) if (re.test(s) || (typeof match === 'string' && re.test(match))) NOT(what + ' on the Build page');
        throw e; } },

    // ---------------- shared bits ----------------
    toast: toastNow,
    waitForToast: (m, ms = 6000) => until(async () => { const t = await toastNow(); return t && (m instanceof RegExp ? m.test(t) : t.toLowerCase().includes(String(m).toLowerCase())) ? t : ''; }, ms, `toast ${m}`),
    toastOffersUndo: () => vis('.np-sheet-undo button, .np-toast #toastUndo'),
    undoToast: () => click('.np-sheet-undo button, .np-toast #toastUndo', 600),
    /** is the visible pressable control with this text pressed? (the new sliders' buttons carry aria-pressed) null if not found */
    pressed: async (m, within = 'body') => (within === AREAS.cores && await tabTo('cores'), pg.evaluate(([m, re, w]) => { { const f = document.querySelector('#main details[data-v2adj]:not([open]) > summary'); if (f) f.click(); } /* Q5 A: settings sit in a fold on desktop too */ const r = re ? new RegExp(re[0], re[1].includes('i') ? re[1] : re[1] + 'i') /* Title Case labels here */ : null, t = e => (e.innerText || '').replace(/\s+/g, ' ').trim();
      const root = document.querySelector(w) || document.body;
      const e = [...root.querySelectorAll('[aria-pressed]')].find(e => e.getClientRects().length && !e.closest('[hidden]') && (r ? r.test(t(e)) : t(e).toLowerCase().includes(m.toLowerCase())));
      if (e) return e.getAttribute('aria-pressed') === 'true';
      /* the Meta tabs here are links that mark the open view with aria-current="page" (pages/archetypes.js, sets.js): selected = aria-current */
      const a = [...root.querySelectorAll('nav a[href]')].find(e => e.getClientRects().length && !e.closest('[hidden]') && (r ? r.test(t(e)) : t(e).toLowerCase().includes(m.toLowerCase())));
      return a ? a.getAttribute('aria-current') === 'page' : null; }, [String(m), RE(m), within])),
    /** open a fold whose heading matches; returns its text (see the notes at the top for How It Works and Start from a Recent Winner) */
    unfold: async (m, within = 'body') => { const s = m instanceof RegExp ? m.source.replace(/^\^/, '') : String(m), is = k => new RegExp('^' + k.replace(/ /g, ' '), 'i').test(s.replace(/\\/g, ''));
      if (await onBuild()) {
        if (is('How It Works')) { if (!(await vis('.np-sheet .bd-how'))) await click('#main [data-bdhow]', 600); return txt('.np-sheet .bd-how'); }
        if (is('Start from a Recent Winner')) { await tabTo('wins'); if (!(await vis('#main .bd-wins'))) NOT('Start from a recent winner (no winners shown)'); return txt('#main .bd-wins'); }
        if (is('Sets and Roles')) NOT('the Sets and Roles fold on the built team (the six tiles show item, role and tier instead)');
        if (is('More Cores')) NOT('the More Cores fold (#4 onward): the new page lists 7 cores, then "Show N more"'); }
      if (is('Bigger Plans')) { if (!(await vis('.np-sheet .sga2'))) await openAll(600); return readAll('big'); }
      if (is('Plan Settings')) { await toSettings(); return txt(AREAS['Plan settings']); }
      if (is('Problems and Team Checks')) { await pg.evaluate(() => { const d = [...document.querySelectorAll('#main details[data-v2fix]')].find(e => e.getClientRects().length); if (d && !d.open) d.querySelector(':scope > summary').click(); }); await pg.waitForTimeout(500);
        const t = await txt('#main details[data-v2fix]'); if (!t) NOT('the Things to Know fold (today\'s Problems and Team Checks) on this page'); return t; }
      const r = await pg.evaluate(([m, re, w]) => { const rx = re ? new RegExp(re[0], re[1]) : null; const root = document.querySelector(w) || document.body;
        const d = [...root.querySelectorAll('details')].find(d => { const s = d.querySelector(':scope > summary'); if (!s || !s.getClientRects().length || d.closest('[hidden]')) return false; const t = s.innerText.replace(/\s+/g, ' ');
          return rx ? rx.test(t) : t.toLowerCase().includes(m.toLowerCase()); });
        if (!d) return null; document.querySelectorAll('[data-bbfold]').forEach(x => x.removeAttribute('data-bbfold')); d.setAttribute('data-bbfold', '1'); if (!d.open) d.querySelector(':scope > summary').click(); return true; }, [String(m), RE(m), within]);
      if (!r && await pg.evaluate(() => !!window.V2 && V2.route() === 'archetypes')) { /* today's guide folds = a region of the Weather Map, which opens that style's guide in its place (pages/archetypes.js; Sim's brief, docs/rebuild/mocks/tournaments-tickets-weather) */
        const k = await pg.evaluate(([m, re]) => { const rx = re ? new RegExp(re[0], re[1]) : null; const b = [...document.querySelectorAll('#main .ar-reg[data-argo]')].find(b => { const n = b.querySelector('.ar-nm'); const t = n ? n.textContent.trim() : ''; return rx ? rx.test(t) : t.toLowerCase().includes(m.toLowerCase()); }); if (!b) return null; b.click(); return b.dataset.argo; }, [String(m), RE(m)]);
        if (!k) NOT(`a style ${m} on the Weather Map`); await pg.waitForTimeout(500); return guideText(); }
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
    infoSheetText: async () => (await txt('.np-sheet .ms2')) || (await txt('#main .pk')), /* Nov 15: the Pokémon page took over from the sheet */

    // ---------------- Pokémon name boxes (Build around) ----------------
    typeInto: async (label, text, enter = false) => { const s = boxSel(label); if (!s) return ui.type(label, text, enter); if (s === BOXES['with a pokémon']) await tabTo('cores');
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
        const t = await resultText(); return !busy && (/Strength Score/.test(t) || await vis('#main .bd-none')) ? t : ''; }, ms, 'a built team')
      /* a person's reaction time before the next tap (as tapBuiltTile, i41): measured Nov 15, a tap on Whole Roster at once after the sheet appeared
         was lost 2 of 3 times (no v2slide event), at 1.5 s and 4 s it worked; reported as unsure, not hidden */
      .then(async t => { await pg.waitForTimeout(400); return resultText().then(t2 => t2 || t); }); },
    tapBuild: () => click('#main [data-bdgo]', 30),
    /** wait until "Option k of n" shows with n >= the given count (the fresh take arrives later); returns n */
    waitOptions: async (n, ms = 30000) => until(async () => { const o = await optCount(); return o && (!n || o[1] >= n) ? o[1] : 0; }, ms, `Option … of ${n}`),
    /** the six on the shown option (ids), as the page draws them: the engine's shown option */
    builtSix: async () => (await vis(ans)) ? ev(`(()=>{const t=abTeam('doubles');return t?t.mons.map(m=>m.n):[]})()`) : [],
    /** Try another = "Show this one ›" on the next option (wrapping after the last) */
    tryAnother: async () => { const o = await optCount(); if (!o || o[1] < 2) NOT('Try another with a single option (no other options shown)');
      await tabTo('others'); await click(`#main .bd-others [data-bdshow="${o[0] % o[1]}"]`, 500); },
    useThisTeam: () => click(ans + ' ~ .bd-acts [data-bduse], #main .bd-result [data-bduse]', 800),
    saveBuiltTeam: () => click('#main .bd-result [data-bdsave]', 600),
    builtSaveButton: () => pg.evaluate(() => { const b = document.querySelector('#main .bd-result [data-bdsave]'); return b ? {disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.title || b.getAttribute('aria-label') || ''} : null; }),
    buildAround: async typed => { await H.typeInto('favourite Pokémon', typed); await pg.keyboard.press('Enter'); await pg.waitForTimeout(500); },
    /** the Build-around chip text ('' if none): its words, then " | " and its ×'s label */
    /* Nov 20: The Plot draws the pick as the filled 'around' plate (.pl-pick, its name set in capitals by CSS): read its words as written */
    buildAroundChip: () => pg.evaluate(() => { const c = [...document.querySelectorAll('#main .bd-pick [data-bdx], #main .pl-pick [data-bdx]')].find(e => e.getClientRects().length); return c ? c.parentElement.textContent.replace(/×/g, '').replace(/\s+/g, ' ').trim() + ' | ' + (c.getAttribute('aria-label') || '') : ''; }),
    clearBuildAround: () => click('#main [data-bdx]', 500),
    /** "My Box N" on the Build-from slider, read as today's "N in your box" line */
    boxCountLine: async () => { const t = await txt('#main [data-v2slide="bdsrc"] > button[data-v="box"]'); const m = t.match(/(\d+)/); return m ? `${m[1]} in your box` : ''; },
    /** copy for Showdown inside a part: the built team, a recent winner; returns the copied text */
    copyForShowdown: async (within = 'body', n = 0) => { 
      await pg.evaluate(() => { window.__copied = null; try { Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: t => { window.__copied = t; return Promise.resolve(); }}}); } catch (e) {} });
      await pg.evaluate(([w, n]) => { const b = [...(document.querySelector(w) || document).querySelectorAll('[data-bdcopy],[data-hmcopy],[data-bdccopy]')].filter(e => e.getClientRects().length)[n]; if (!b) throw new Error('no Copy for Showdown button'); b.click(); }, [within, n]);
      await pg.waitForTimeout(500); return pg.evaluate(() => window.__copied || ''); },
    /** the six on the n-th recent-winner row (display names, as today's card titles) */
    winnerSix: (n = 0) => tabTo('wins').then(() => pg.evaluate(n => { const d = [...document.querySelectorAll('#main .bd-wins [data-bdwin]')].filter(e => e.getClientRects().length)[n]; if (!d) return [];
      return window.__ev(`(()=>{const x=evTeam(${JSON.stringify(d.dataset.bdwin)});return x?x.t.mons.map(m=>byName.get(m.n)?byName.get(m.n).d:m.n):[]})()`); }, n)),

    // ---------------- Cores ----------------
    coresText: async () => { await tabTo('cores'); return txt(AREAS.cores); },
    coreRowCount: async () => { await tabTo('cores'); return pg.evaluate(() => document.querySelectorAll('#main .bd-cores [data-bdcore]').length); },
    /** tap a core's button: today's "Add to my team" is "Add", "Load team" is "Load" here */
    coreTap: async (label, n = 0) => { await tabTo('cores'); const l = label.toLowerCase(), want = /^add/.test(l) ? 'add' : /^load/.test(l) ? 'load' : null;
      if (/^(practice against|set as opponent)/.test(l)) { const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('#main .bd-cores [data-bdcprep]')].filter(e => e.getClientRects().length)[n]; if (!b) return false; b.click(); return true; }, n); if (!ok) throw new Error('no core button ' + label); await pg.waitForTimeout(700); return; }
      if (/^teams with it/.test(l)) { const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('#main .bd-cores [data-bdcteams]')].filter(e => e.getClientRects().length)[n]; if (!b) return false; b.click(); return true; }, n); if (!ok) throw new Error('no core button ' + label); await pg.waitForTimeout(900); return; } /* Nov 15: 'Teams with It ›' */
      if (!want) NOT(`"${label}" on cores`);
      const ok = await pg.evaluate(([w, n]) => { const b = [...document.querySelectorAll('#main .bd-cores [data-bdcore]')].filter(e => e.getClientRects().length && e.innerText.trim().toLowerCase().split(' ')[0] === w)[n] /* 'Load Team' (Sim, Nov 12) counts as today's Load team */; if (!b) return false; b.click(); return true; }, [want, n]);
      if (!ok) throw new Error('no core button ' + label); await pg.waitForTimeout(700); },
    coreMembers: (n = 0) => tabTo('cores').then(() => pg.evaluate(n => { const b = [...document.querySelectorAll('#main .bd-cores [data-bdcore]')].filter(e => e.getClientRects().length)[n]; return b ? b.dataset.bdcore.split('|') : []; }, n)),
    clearCoreFilter: async () => { await tabTo('cores'); await pg.click('[data-bdcmx]'); await pg.waitForTimeout(600); },
    coreFilterChip: () => pg.evaluate(() => { const c = document.querySelector('.bd-cpick'); return c ? c.innerText.trim() : ''; }),
    coresTopOnScreen: () => tabTo('cores').then(() => pg.evaluate(() => { const c = document.querySelector('#main .bd-cores'); return c ? Math.round(c.getBoundingClientRect().top) : null; })),

    /** the page's text; with All Suggestions open, only the sheet (it IS that page here: My Team underneath is not All Suggestions,
     *  so a note on My Team can't pass a check meant for All Suggestions) */
    text: async () => (await sheetOpen('.sga2')) ? txt('.np-sheet') : text0(),
    // ---------------- shared behaviour (scroll, Back, sliders, name boxes, built tiles, usage) ----------------
    scrollSpot: () => pg.evaluate(() => Math.round(window.scrollY)),
    scrollPageTo: y => pg.evaluate(y => window.scrollTo(0, y), y),
    back: async () => { await pg.goBack().catch(() => {}); await pg.waitForTimeout(700); },
    /** the Megas-on-team slider (sgmega, on My Team and Build): its thumb position, its icons, its buttons as a screen reader hears them */
    megasSliderPos: () => pg.evaluate(() => { const s = [...document.querySelectorAll('[data-v2slide="sgmega"]')].find(e => e.getClientRects().length); return s ? +s.style.getPropertyValue('--i') : null; }),
    sliderHasIcons: () => pg.evaluate(() => { const s = [...document.querySelectorAll('[data-v2slide="sgmega"]')].find(e => e.getClientRects().length); return s ? [...s.querySelectorAll(':scope > button')].filter(b => b.querySelector('svg')).length : 0; }),
    megasButtons: () => pg.evaluate(() => { { const f = document.querySelector('#main details[data-v2adj]:not([open]) > summary'); if (f) f.click(); } /* Q5 A */ const s = [...document.querySelectorAll('[data-v2slide="sgmega"]')].find(e => e.getClientRects().length); return s ? [...s.querySelectorAll(':scope > button[aria-pressed]')].map(b => ({name: b.innerText.trim(), pressed: b.getAttribute('aria-pressed')})) : []; }),
    /** the site's own × in the box (Nov 18: V2.CLR, shell.js; the browser's own × is hidden): shown? */
    clearButtonShown: label => { const s = boxSel(label); if (!s) NOT(`the box "${label}"`); return pg.evaluate(s => { const i = [...document.querySelectorAll(s)].find(e => e.getClientRects().length), f = i && i.closest('.np-field'), x = f && f.querySelector('[aria-label="Clear"]');
      return !!x && x.getClientRects().length > 0 && getComputedStyle(x).visibility !== 'hidden'; }, s); },
    /** a real mouse tap on the middle of that × (it never takes focus, so a focused box keeps it) */
    tapClear: async label => { const s = boxSel(label); if (!s) NOT(`the box "${label}"`); const c = await pg.evaluate(s => { const i = [...document.querySelectorAll(s)].find(e => e.getClientRects().length), f = i && i.closest('.np-field'), x = f && f.querySelector('[aria-label="Clear"]');
        if (!x || !x.getClientRects().length) return null; const R = x.getBoundingClientRect(); return [R.left + R.width / 2, R.top + R.height / 2]; }, s);
      if (!c) NOT(`a × (Clear) shown in the box "${label}"`); await pg.mouse.click(c[0], c[1]); await pg.waitForTimeout(400); },
    /** the name list open under the Build around / cores box ('' if closed) */
    nameList: () => txt('#main [data-bdhits], #main [data-bdchits]'),
    focusBox: async label => { const s = boxSel(label); if (!s) NOT(`the box "${label}"`); if (s === BOXES['with a pokémon']) await tabTo('cores'); await pg.evaluate(s => { const i = [...document.querySelectorAll(s)].find(e => e.getClientRects().length); if (i) i.focus(); }, s); await pg.waitForTimeout(900); },
    boxTop: label => { const s = boxSel(label); if (!s) NOT(`the box "${label}"`); return pg.evaluate(s => { const i = [...document.querySelectorAll(s)].find(e => e.getClientRects().length); return i ? Math.round(i.getBoundingClientRect().top) : null; }, s); },
    /** the built team's tiles (each opens that Pokémon's info sheet): the n-th tile's words, and a tap on it (returns its id) */
    builtTileLabel: (i = 0) => pg.evaluate(i => { const b = [...document.querySelectorAll('#main .bd-result .bd-six [data-v2mon]')].filter(e => e.getClientRects().length)[i]; return b ? b.innerText.replace(/\s+/g, ' ').trim() : ''; }, i),
    /** (a real mouse click: a scripted el.click() on these tiles opens nothing, Nov 13; the player's tap does) */
    tapBuiltTile: async (i = 0) => { const b = pg.locator('#main .bd-result .bd-six [data-v2mon]').filter({visible: true}).nth(i); if (!(await b.count())) throw new Error('no built-team tile ' + i);
      const id = await b.getAttribute('data-v2mon'); await pg.waitForTimeout(300); /* a person's reaction time (i41, Nov 13): taps within ~0.3 s of the team appearing can be lost in the browser (touch 7/12 at once, 12/12 after 0.3 s); no person taps that fast */ await b.click(); return id; },
    /** the anonymous usage counts this visit has saved (pages/owner.js, Nov 15: today's counting, same documents usage/<id>); forces the
     *  save a page-hide does. Page keys are the new site's routes ("view:build"); they are read back under today's page ids ("view:auto")
     *  with the same route -> page map as current(), so the test compares like with like. Button keys are as the page writes them. */
    usageCounts: async () => { await pg.evaluate(() => { try { Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'hidden'}); } catch (e) {} document.dispatchEvent(new Event('visibilitychange')); });
      await pg.waitForTimeout(500); const c = await pg.evaluate(() => { const d = window.__acct['usage/u_test']; if (!d || !d.s) return null; const k = Object.keys(d.s)[0]; return k ? d.s[k].c : null; }); if (!c) return c;
      const MAP = {team: 'report', 'team-empty': 'report', battle: 'matchup', build: 'auto', tournaments: 'top', archetypes: 'arch'}, out = {};
      for (const [k, n] of Object.entries(c)) { const m = k.match(/^view:(.+)$/), key = m ? 'view:' + (MAP[m[1]] || m[1]) : k; out[key] = (out[key] || 0) + n; } return out; },
    focusedId: () => pg.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName)),

    // ---------------- My Team pieces used by group B ----------------
    /** Edit Set for slot i: pick its tile, then the Set section's "Edit Set" (data-v2edit) */
    openEditFor: async i => { await pickSlot(i); await click(`#main #tm-set [data-v2edit="${i}"]`, 700); },
    /** the open Edit Set sheet: {title "Edit <name>", strip: how many of the six it shows}; null when closed */
    editPanelState: () => pg.evaluate(() => { const c = document.querySelector('.np-sheet .ed2'); if (!c || !c.getClientRects().length) return null; const h = c.querySelector('h2'), t = h ? h.innerText.replace(/\s+/g, ' ').trim() : '';
      return {title: /^Add a Pok/.test(t) ? t : 'Edit ' + t, strip: [...c.querySelectorAll('.ed-pk')].filter(e => e.getClientRects().length).length}; }),
    tapEditStrip: i => click(`.np-sheet .ed2 .ed-pk[data-k="${i}"]`, 600),
    /** lock a Pokémon (by its shown name): pick its tile, then Lock in the strip under the six */
    lockPokemon: async name => { await pickNamed(name); await tapFoundLock(name); },
    /** remove the Pokémon in slot i with Remove in the strip under the six (its tile picked first, as a player does) */
    removeFromMyTeam: async i => { if (!(await vis(`#main [data-v2rm="${i}"]`))) await pickSlot(i); await click(`#main [data-v2rm="${i}"]`, 50); },
    /** Things to Know › a problem row (today: Problems and team checks): open it and tap its first Quick add pick */
    quickAddFromProblem: async title => { await H.unfold(/^Problems and Team Checks/i);
      const r = await pg.evaluate(t => { const d = [...document.querySelectorAll('#main [data-v2fix] details[data-v2pk]')].find(d => d.getClientRects().length && d.querySelector('summary').innerText.replace(/\s+/g, ' ').trim().startsWith(t)); if (!d) return null; if (!d.open) d.querySelector('summary').click();
        const b = d.querySelector('[data-v2qa]'), fx = d.querySelector('summary').innerText.replace(/\s+/g, ' '); if (!b) return {fixes: fx}; const tx = b.innerText.trim(); b.click(); return {btn: tx, fixes: fx}; }, title);
      await pg.waitForTimeout(900); return r; },
    problems: () => txt('#main [data-v2fix] .sg2-probs'),
    /** a threat on My Team › Matchups opens its scouting sheet (.mu-sh); Best fix's "Apply This Fix" */
    openThreat: async id => { await click(`#main [data-muthr="${id}"]`, 1200); },
    threatSheetText: async () => (await txt('.np-sheet .mu-sh')) || '',
    applyBestFix: () => click('.np-sheet .mu-sh [data-mufix]', 1000),
    /** set one Pokémon's item / moves the way the set editor saves them (shared logic, as today's adapter) */
    setItem: (i, item) => ev(`S.slots[${i}].it={doubles:${JSON.stringify(item)}};render()`),
    setMoves: (i, mv) => ev(`S.slots[${i}].mv={doubles:${JSON.stringify(mv)}};render()`),
    lockState: () => ev('S.slots.map(s=>!!s.lock)'),

    // ---------------- My Team's suggestions ----------------
    waitPlans,
    /** My Team's Suggestions part, its cards read into today's wording (see the notes at the top) */
    mySuggestions: readMine,
    waitMySuggestions: async () => { await waitPlans(); return until(async () => { const busy = await pg.evaluate(() => { const s = document.querySelector('#main #tm-sg'); return !s || /Working out|Plotting your best changes/.test(s.innerText) || !!s.querySelector('[aria-busy=true]'); });
      return busy ? '' : readMine(); }, 25000, 'suggestions'); },
    suggestionsBusy: () => pg.evaluate(() => { const s = document.querySelector('#main #tm-sg'); return !!s && (!!s.querySelector('[aria-busy=true]') || /Working out|Plotting your best changes/.test(s.innerText)); }),
    mySuggestionCount: () => pg.evaluate(() => [...document.querySelectorAll('#main #tm-sg [data-v2plan]')].filter(e => e.getClientRects().length).length),
    applyMySuggestion: (n = 0) => click(`#main #tm-sg [data-v2plan="${n}"]`, 900),
    setSuggestFrom: async label => { await pg.evaluate(() => { const f = document.querySelector('#main details[data-v2adj]:not([open]) > summary'); if (f) f.click(); }); /* Q5 A (Nov 18): the fold on desktop too */ const ok = await pg.evaluate(l => { const b = [...document.querySelectorAll('#main [data-v2slide="sgpool"] > button')].find(e => e.getClientRects().length && e.innerText.trim().toLowerCase() === l.toLowerCase()); if (b) b.click(); return !!b; }, label);
      if (!ok) throw new Error('no Suggest from choice ' + label); await pg.waitForTimeout(700); },
    showMySuggestions: async () => { await pg.evaluate(() => { const o = document.querySelector('#main #tm-sg'); window.scrollBy(0, o.getBoundingClientRect().top - innerHeight / 3); }); await pg.waitForTimeout(400); },
    mySuggestionsTop: () => pg.evaluate(() => Math.round(document.querySelector('#main #tm-sg').getBoundingClientRect().top)),
    firstApplyTop: () => pg.evaluate(() => { const b = [...document.querySelectorAll('#main #tm-sg [data-v2plan]')].find(e => e.getClientRects().length); return b ? Math.round(b.getBoundingClientRect().top) : null; }),
    /** tap "More" to read the rest of a shortened note inside `within` (nothing to do when nothing is shortened, as today's helper) */
    readMore: async within => { await pg.evaluate(w => { const r = document.querySelector(w); const b = r && [...r.querySelectorAll('button')].find(e => e.getClientRects().length && /^More$/i.test(e.innerText.trim())); if (b) b.click(); }, within); await pg.waitForTimeout(300); },
    /** the Undo bar ("Applied … Undo") where the player can see it: in the open sheet, else on the page ('' if none) */
    undoBarText: async () => { const s = await undoSel(); return pg.evaluate(s => { const b = [...document.querySelectorAll(s)].find(e => e.getClientRects().length); return b ? b.parentElement.innerText.replace(/\s+/g, ' ').trim() : ''; }, s); },
    undoAppliedStep: async () => click(await undoSel(), 900),

    // ---------------- All Suggestions (the sheet) ----------------
    /** wait until the All Suggestions sheet shows its cards (or its no-suggestions note) */
    waitSwaps: () => until(() => pg.evaluate(() => { const s = document.querySelector('.np-sheet .sga2'); return !!s && !s.querySelector('.sg2-wait') && (s.querySelectorAll('.tm-sug > li').length > 0 || /No suggestions/.test(s.innerText)); }), 30000, 'All Suggestions cards'), /* Nov 18 (Q5 C): the sheet re-plans in place (Suggest from inside); while it works its faded copy holds the old cards */
    /** the cards on All Suggestions: [{text (read as My Team's cards), button (as shown)}] */
    swapCards: () => pg.evaluate(([CARDs]) => { const CARD = eval('(' + CARDs + ')'); return [...document.querySelectorAll('.np-sheet .sga2 .tm-sug:not(.sga2-big) > li')].filter(e => e.getClientRects().length && !e.closest('[inert]')).map(li => ({text: CARD(li, 'my'), button: ((li.querySelector('[data-v2plana]') || {}).innerText || '').trim()})); }, [CARD.toString()]),
    applySwap: (n = 0) => click(`.np-sheet .sga2 [data-v2plana="${n}"]`, 900),
    /** today's Bigger plans = the All Suggestions sheet's list (see the notes at the top) */
    biggerPlans: async () => { if (!(await sheetOpen('.sga2'))) await openAll(600); await waitPlans(); await H.waitSwaps(); return readAll('big'); },
    /** Nov 18 (Q5 C): the "Bigger Plans" section alone (its heading to the end of the sheet): the two-or-more-change plans */
    biggerPlansSection: async () => { if (!(await sheetOpen('.sga2'))) await openAll(600); await waitPlans(); await H.waitSwaps();
      return pg.evaluate(([CARDs]) => { const CARD = eval('(' + CARDs + ')'), s = document.querySelector('.np-sheet .sga2'); if (!s) return ''; const h = [...s.querySelectorAll('.sga2-h3')].find(e => e.textContent === 'Bigger Plans'); if (!h) return '';
        const out = []; for (let e = h; e; e = e.nextElementSibling) out.push(e.matches('ol.tm-sug') ? [...e.children].map(li => CARD(li, 'big')).join(' ') : e.innerText.replace(/\s+/g, ' ').trim()); return out.filter(Boolean).join(' '); }, [CARD.toString()]); },
    biggerPlansNow: async () => { if (!(await sheetOpen('.sga2'))) await openAll(0); return readAll('big'); },
    biggerPlanCount: () => pg.evaluate(() => [...document.querySelectorAll('.np-sheet .sga2 [data-v2plana]')].filter(e => e.getClientRects().length).length),
    applyPlan: (n = 0) => click(`.np-sheet .sga2 [data-v2plana="${n}"]`, 900),

    /** two quick taps on My Team's first Apply, in one go (as a fast double tap; X-03) */
    applyTwiceQuickly: () => pg.evaluate(() => { const b = [...document.querySelectorAll('#main #tm-sg [data-v2plan]')].find(e => e.getClientRects().length); if (!b) throw new Error('no Apply on My Team'); b.click(); b.click(); }),

    // ---------------- Popular Sets (pages/sets.js, Meta › Pokémon › Popular Sets) ----------------
    /** the Pokémon whose sets are shown (the same ui.setMon today's adapter reads; the page draws its spotlight and sets from it) */
    setsShownPokemonId: () => ev('ui.setMon'),
    findSetsFor: async typed => { await H.typeInto('Look up a Pokémon', typed); await pg.keyboard.press('Enter'); await pg.waitForTimeout(700); },
    /** the Your Team bench: [{name (id), pressed}] */
    setsTeamPicker: () => pg.evaluate(() => [...document.querySelectorAll('#main .st-six [data-v2setmon]')].filter(e => e.getClientRects().length).map(e => ({name: e.getAttribute('data-v2setmon'), pressed: e.getAttribute('aria-pressed')}))),
    showSetsOfTeamMember: n => click(`#main .st-six [data-v2setmon="${n}"]`, 600),
    /** a teammate under "Usually alongside" (today's Teammates chips) */
    tapTeammate: n => click(`#main .us-mates [data-v2setmon="${n}"]`, 900),
    /** the source switch's chosen label (Best data / Tournaments / Showdown) */
    setsSource: () => pg.evaluate(() => { const b = [...document.querySelectorAll('#main [data-v2setsrc][aria-pressed="true"]')].find(e => e.getClientRects().length); const t = b ? b.innerText.trim() : null; return ({'Online tournaments': 'Tournaments', 'Showdown ladder': 'Showdown'})[t] || t; }), /* audit v199 #9 (Nov 17): the new site uses the word-list names */
    tapSetsSource: label => pg.evaluate(l => { l = ({Tournaments: 'Online tournaments', Showdown: 'Showdown ladder'})[l] || l; const b = [...document.querySelectorAll('#main [data-v2setsrc]')].find(e => e.getClientRects().length && e.innerText.trim() === l); if (!b) throw new Error('no source ' + l); b.click(); }, label).then(() => pg.waitForTimeout(700)),
    /** where the sets start on screen (px): "How <Pokémon> is built" (a teammate tap scrolls there, as today's scrolls the pane to its top) */
    paneTop: () => pg.evaluate(() => { const p = [...document.querySelectorAll('#main .st-how')].find(e => e.getClientRects().length) || [...document.querySelectorAll('#main .gs-body')].find(e => e.getClientRects().length); return p ? Math.round(p.getBoundingClientRect().top) : null; }),
    setsText: () => txt('#main .st'),
    archText: () => txt('#main .ar'),
    /** the archetype styles in order, as the Weather Map's regions say them: [{name, share (% of top teams), basis "N of M top teams"}] */
    archGuides: () => pg.evaluate(() => [...document.querySelectorAll('#main .ar-reg[data-argo]')].filter(e => e.getClientRects().length).map(b => { const t = (b.getAttribute('aria-label') || '').trim(), m = t.match(/^(.+?), (\d+)% of top teams, (\d+ of \d+)\./);
      return m ? {name: m[1], share: +m[2], basis: m[3] + ' top teams'} : {name: t}; })),

    // ---------------- Plan settings = My Team's Adjust suggestions, Refresh Suggestions and the Never Suggest sheet (see the notes at the top) ----------------
    /** Pick from = Suggest from (the sgpool slider): the chosen choice, and every choice, as shown (sentence case) */
    pickFrom: async () => { await toSettings(); return SENT(await txt('#main .sg2-adj [data-v2slide="sgpool"] > button[aria-pressed="true"]')) || null; },
    pickFromOptions: async () => { await toSettings(); return (await pg.evaluate(() => [...document.querySelectorAll('#main .sg2-adj [data-v2slide="sgpool"] > button')].filter(e => e.getClientRects().length).map(e => e.innerText))).map(SENT); },
    setPickFrom: async label => { await toSettings(); const ok = await pg.evaluate(l => { const b = [...document.querySelectorAll('#main .sg2-adj [data-v2slide="sgpool"] > button')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim().toLowerCase().startsWith(l.toLowerCase())); if (b) b.click(); return !!b; }, label);
      if (!ok) throw new Error('no Suggest from choice ' + label); await pg.waitForTimeout(700); },
    /** Let plans swap my Mega = "Swap my Mega?" No / Yes; Count abilities = "Count Abilities?" No / Yes: a toggle taps the choice not pressed */
    toggleSetting: async name => { const k = SETTING[name]; if (!k) NOT('Plan settings › ' + name); await toSettings();
      const ok = await pg.evaluate(k => { const b = [...document.querySelectorAll(`#main .sg2-adj [data-v2slide="${k}"] > button`)].find(e => e.getClientRects().length && e.getAttribute('aria-pressed') !== 'true'); if (b) b.click(); return !!b; }, k);
      if (!ok) throw new Error('no ' + name + ' switch'); await pg.waitForTimeout(700); },
    settingOn: async name => { const k = SETTING[name]; if (!k) NOT('Plan settings › ' + name); await toSettings();
      const v = await pg.evaluate(k => { const b = [...document.querySelectorAll(`#main .sg2-adj [data-v2slide="${k}"] > button[aria-pressed="true"]`)].find(e => e.getClientRects().length); return b ? b.dataset.v : null; }, k);
      if (v == null) throw new Error('no ' + name + ' switch'); return v === '1'; },
    /** Never suggest: the Never Suggest sheet's "Add a Pokémon" box; the first match is added (today's box adds the first match on Enter) */
    neverSuggest: async typed => { await openExcl(); const el = pg.locator('.np-sheet [data-exq]').filter({visible: true}).first(); if (!(await el.count())) throw new Error('no "Add a Pokémon" box in Never Suggest');
      await el.click(); await el.fill(''); await el.type(typed, {delay: 15}); await until(() => vis('.np-sheet [data-exhits] [data-exadd]'), 4000, 'a match in Never Suggest');
      await click('.np-sheet [data-exhits] [data-exadd]', 600); },
    /** the Pokémon on the never-suggest list as shown: the open Never Suggest sheet's list, else My Team's "Never suggested: …" line */
    neverSuggestList: async () => (await sheetOpen('.ex2')) ? txt('.np-sheet .ex2-list') : (await toSettings(), txt('#main .sg2-excl')),
    allowAgain: async name => { await openExcl(); await click(`.np-sheet .ex2 [data-exallow="${name}"]`, 600); },
  };
  /** today's Plan settings = My Team's Adjust suggestions: close a sheet that sits over it, open My Team, wait for the suggestions, bring it on screen */
  async function toSettings() { if (await vis(AREAS['Plan settings']) && !(await pg.evaluate(() => !!(window.V2 && V2._sheet)))) return;
    await pg.evaluate(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); }); await pg.waitForTimeout(300);
    if (!(await pg.evaluate(() => !!window.V2 && V2.route() === 'team'))) await prevGo('My Team', 400);
    if (await ev('members().length')) { await waitPlans(); await until(async () => !(await pg.evaluate(() => { const s = document.querySelector('#main #tm-sg'); return !s || /Working out|Plotting your best changes/.test(s.innerText); })), 15000, 'My Team suggestions'); }
    /* Sim, Nov 18 (C): on phones Adjust Suggestions is a fold; open it the way a player does, by tapping its line */
    await pg.evaluate(() => { const m = document.querySelector('#main details[data-v2adj]:not([open]) > summary'); if (m) m.click(); }); await pg.waitForTimeout(200);
    await until(() => vis(AREAS['Plan settings']), 4000, 'Adjust suggestions on My Team');
    await pg.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({block: 'center'}); }, AREAS['Plan settings']); await pg.waitForTimeout(200); }
  /** the Never Suggest sheet, opened the way a player does: "Never Suggest ›" (empty list) or "Change ›" on the Never suggested line */
  async function openExcl() { if (await sheetOpen('.ex2')) return; await toSettings(); await click('#main [data-v2excl]', 600);
    await until(() => sheetOpen('.ex2'), 4000, 'the Never Suggest sheet'); }
  // Lock in the strip under the six for the picked tile (aria-label "Lock <name>: …"); pressed again it says "Unlock"
  const tapFoundLock = async name => { const ok = await pg.evaluate(n => { const b = [...document.querySelectorAll('#main [data-v2lock]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || '').startsWith('Lock ' + n + ':')); if (b) b.click(); return !!b; }, name);
    if (!ok) throw new Error('no Lock for ' + name); await pg.waitForTimeout(600); };
  H.text.__bPrev = text0; if (ui.text.__v2base) H.text.__v2base = ui.text.__v2base; H.go.__bPrev = prevGo; H.go.__v2base = baseGo; H.tap.__bPrev = prevTap;
  return H;
};
