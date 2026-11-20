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
const SEL = {'#toastUndo': '.np-sheet-undo button, .np-toast #toastUndo', '#toastBoxUndo': '.np-sheet-undo button, .np-toast [data-bxundo]', '[data-qlres]': '.yg2 [data-ygres]', '#jump input': '[data-v2q]'};
// today's name-box selectors -> the new build's search inputs (and the button that opens each, if it's not open yet)
// today's edit panel name box = the add box in the Edit Set sheet's empty spot ([data-adq]); else the search sheet
const NAMEBOX = {'#chEdit input[placeholder]': ['[data-adq],[data-v2q]', '[data-v2search]'], '#boxAdd': ['[data-bxq]', '[data-bxadd]'], '#jump input': ['[data-v2q]', '[data-v2search]'], '#qlOppIn': ['[data-ygq]', null]};

export default (ui, pg, o) => {
  pg.addInitScript(TOASTS).catch(() => {}); pg.evaluate(TOASTS).catch(() => {});
  const vis = sel => pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => !e.hidden && e.getClientRects().length); return !!e; }, SEL[sel] || sel);
  const txt = sel => pg.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => !e.hidden && e.getClientRects().length); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; }, sel);
  // same tapping kit as today's adapter (real click first, then force, fresh lookup each try)
  /* Nov 19 (EDIT-03 failing now and then on a loaded machine and in WebKit): Playwright's click gives up after its timeout while the
     page is still busy handling the click, although the click HAS landed; this used to tap again (a Lock toggled twice, a Card tapped
     twice). Now each try first marks the element, and a click that reached it counts as the tap: never tapped twice (tap-once.mjs). */
  const markTap = el => el.evaluate(x => { window.__npTap = 0; if (!x.__npTapL) { x.__npTapL = 1; x.addEventListener('click', e => { if (e.isTrusted) window.__npTap = (window.__npTap || 0) + 1; }, true); } }).catch(() => {});
  const tapLanded = async () => { await pg.waitForTimeout(150); return (await pg.evaluate(() => window.__npTap || 0).catch(() => 0)) > 0; };
  const tapFound = async (finder, arg, what, wait = 500) => { let landed = false;
    for (let k = 0; k < 5; k++) { const h = await pg.evaluateHandle(finder, arg); const el = h.asElement();
      if (!el) { if (landed) { await pg.waitForTimeout(wait); return; } if (k >= 2) throw new Error('nothing to tap: ' + what); await pg.waitForTimeout(400); continue; }
      const y0 = await pg.evaluate(() => scrollY); await el.scrollIntoViewIfNeeded({timeout: 1000}).catch(() => {});
      if (k < 3 && Math.abs((await pg.evaluate(() => scrollY)) - y0) > 2) { await pg.waitForTimeout(450); if (!(await el.evaluate(x => x.isConnected).catch(() => false))) continue; }
      await markTap(el);
      try { await el.click({timeout: 900}); await pg.waitForTimeout(wait); return; } catch (e) {}
      if (await tapLanded()) { await pg.waitForTimeout(wait); return; } /* the click landed; the page was only slow to answer */
      if (await el.evaluate(x => x.isConnected).catch(() => false)) { try { await el.click({force: true, timeout: 900}); await pg.waitForTimeout(wait); return; } catch (e) {}
        if (await tapLanded()) { await pg.waitForTimeout(wait); return; } }
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
  // the shared adapter's go / current / text (this file wraps them for Home; the kit may merge this file more than once)
  const go0 = ui.go.__v2base || ui.go, cur0 = ui.current.__v2base || ui.current, text0 = ui.text.__v2base || ui.text;
  const H = {
    waitFor, vis, has,
    // ---------- generic ----------
    settle: async (quietMs = 600, maxMs = 12000) => { await pg.evaluate(() => { if (window.__npMut) return; window.__npMut = Date.now(); new MutationObserver(() => { window.__npMut = Date.now(); }).observe(document.body, {childList: true, subtree: true, characterData: true}); });
      const t0 = Date.now(); while (Date.now() - t0 < maxMs) { const q = await pg.evaluate(() => ({age: Date.now() - window.__npMut, busy: /Working out/.test(document.body.innerText)})); if (q.age > quietMs && !q.busy) return true; await pg.waitForTimeout(200); } return false; },
    /** open a saved team from My Team (today: the Switch team fold; here: Saved Teams sheet → Open) */
    switchTeam: async name => { if (await pg.evaluate(() => !!document.querySelector('.np-sheet .sw2'))) return tapFound(n => [...document.querySelectorAll('.sw2 .sw2-t')].find(e => e.querySelector('b') && e.querySelector('b').innerText.trim() === n) || null, name, 'switch to ' + name, 1800);
      await H.openSavedSheet(); await tapFound(n => [...document.querySelectorAll('.svt2 [data-svact="open"]')].find(e => e.getAttribute('aria-label') === 'Open ' + n) || null, name, 'switch to ' + name, 1800); },
    openSavedSheet: async () => { if (await vis('.svt2')) return; if (!(await vis('[data-v2saved]'))) await ui.go('My Team', 500); if (!(await vis('[data-v2saved]'))) NOT('Saved Teams button on this My Team'); await click('[data-v2saved]', 700); },
    toasts: () => pg.evaluate(() => (window.__npT || []).slice()),
    clearToasts: () => pg.evaluate(() => { window.__npT = []; }),
    waitToast: (re, ms = 6000) => waitFor(async () => (await pg.evaluate(() => (window.__npT || []).slice())).find(t => re.test(t)) || null, ms),
    tapToastUndo: () => click('.np-sheet-undo button, .np-toast #toastUndo, .np-toast [data-bxundo]'), /* Sim Q2 (Nov 16): with a sheet open the Undo sits in the sheet */
    /** the pictures on the toast showing now (srcs); null when no toast is showing, so "no picture" can't pass on a missing toast */
    toastImages: () => pg.evaluate(() => { const t = [...document.querySelectorAll('.np-toast')].filter(e => e.getClientRects().length); return t.length ? t.flatMap(e => [...e.querySelectorAll('img,svg image,[style*="background-image"]')].map(i => i.getAttribute('src') || i.getAttribute('href') || i.getAttribute('style'))) : null; }),
    press: async (k, wait = 400) => { await pg.keyboard.press(k); await pg.waitForTimeout(wait); },
    focusName: () => pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return ''; return (e.getAttribute('aria-label') || e.innerText || e.value || e.placeholder || '').replace(/\s+/g, ' ').trim(); }),
    /** is a pressable choice (slider button, tab) with this label chosen? null if not found */
    chosen: label => pg.evaluate(l => { { const f = document.querySelector('#main details[data-v2adj]:not([open]) > summary'); if (f) f.click(); } /* Q5 A (Nov 18): Adjust Suggestions is a fold on phones and desktop; open it as a player would */ const root = (window.V2 && V2._sheet && V2._sheet.wrap) || document; /* an open sheet's controls first (Nov 12: My Team's 'Matchups' tab matched before Saved Teams' sort) */ const b = [...root.querySelectorAll('button[aria-pressed],[role=tab],[data-tmjump]')].filter(e => e.getClientRects().length).find(e => (e.matches('[data-tmjump]') ? e.childNodes[0].textContent : e.innerText).replace(/\s+/g, ' ').trim().toLowerCase() === l.toLowerCase()) /* q59: a My Team tab's own name, without its count ('Suggestions 3') */;
      return b ? ((b.getAttribute('aria-pressed') || b.getAttribute('aria-selected')) === 'true' || /^(true|location|page|step)$/.test(b.getAttribute('aria-current') || '')) : null; }, label), /* audit Nov 16: the On this page links use aria-current="location" */
    choose: async (label, wait = 700) => { await pg.evaluate(() => { const f = document.querySelector('#main details[data-v2adj]:not([open]) > summary'); if (f) f.click(); }); /* Q5 A: open the Adjust Suggestions fold first */ const ok = await pg.evaluate(l => { const b = [...document.querySelectorAll('button[aria-pressed]')].filter(e => e.getClientRects().length).find(e => e.innerText.replace(/\s+/g, ' ').trim().toLowerCase() === l.toLowerCase()); if (b) b.click(); return !!b; }, label);
      if (!ok) throw new Error('no choice labelled ' + label + ' (not in v2 yet, or a different label)'); await pg.waitForTimeout(wait); },
    openFold: async (title, open = true, wait = 500) => { if (/^switch team$/i.test(title)) { if (open) await click('#main [data-v2saved]', wait); else await closeSheet(); return; } /* scan S2 (Nov 20): the quick switch link is gone; the Saved Teams sheet opens a team */ const ok = await pg.evaluate(([t, open]) => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); });
        if (!d) return false; if (d.open !== open) d.querySelector('summary').click(); return true; }, [title, open]); if (!ok) throw new Error('no fold titled ' + title + ' (not in v2 yet)'); await pg.waitForTimeout(wait); },
    foldOpen: title => pg.evaluate(t => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); }); return d ? d.open : null; }, title),
    foldContent: title => /^switch team$/i.test(title) ? sheetText('.svt2') : pg.evaluate(t => { const d = [...document.querySelectorAll('details')].filter(e => e.getClientRects().length).find(e => { const s = e.querySelector('summary'); return s && s.innerText.replace(/\s+/g, ' ').toLowerCase().includes(t.toLowerCase()); }); return d ? d.innerText.replace(/\s+/g, ' ').trim() : null; }, title),
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
    tapPokemon: async (name, within = '') => { for (let k = 0; k < 2; k++) { await H.tapPokemonOnce(name, within); if (await waitFor(async () => (await H.infoSheet()) || (await H.pokemonPage()), 3000)) return; } }, /* the page since Nov 15 */
    tapPokemonOnce: (name, within = '') => tapFound(([n, w]) => { const r = w ? document.querySelector(w) : document; const all = [...(r || document).querySelectorAll('[data-v2mon]')].filter(e => e.getClientRects().length && !e.closest('[hidden]') && !e.closest('.ms2'))
        .filter(e => (e.getAttribute('aria-label') || e.innerText || e.dataset.v2mon || '').replace(/\s+/g, ' ').toLowerCase().includes(n.toLowerCase()) || e.dataset.v2mon.toLowerCase() === n.toLowerCase());
      /* Nov 18: a named control first, brought to the middle of the screen. Home's herd sprites are decorative (aria-hidden,
         stampede-hero.js) and move as the page scrolls: at 390 the tap landed on the fixed header; the ticker's button, scrolled only to the
         screen's edge, sat under the phone bar and the tap opened Battle (PKMN-01 failed here in Chromium, on GitHub in WebKit). */
      const el = all.find(e => !e.closest('[aria-hidden="true"]')) || all[0] || null; if (el) el.scrollIntoView({block: 'center', inline: 'nearest'}); return el; }, [name, within], 'Pokémon ' + name + ' (an element that opens its info sheet)', 800),
    infoSheet: async () => (await sheetText('.ms2')) || (await H.pokemonPage()), /* Nov 15: the Pokémon page took over from the sheet; tests asking for the sheet read the page */
    tapPokemonInSheet: name => tapFound(n => [...document.querySelectorAll('.ms2 [data-v2mon]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || e.innerText || '').includes(n)) || null, name, 'sheet Pokémon ' + name, 900),
    closeInfoSheet: async () => { if (await H.pokemonPage()) { await pg.goBack(); await pg.waitForTimeout(900); return; } return closeSheet(); }, /* the Pokémon page: Back is its close */
    infoTab: name => click(`.ms2 [data-mstab="${name.toLowerCase()}"]`, 600),
    infoTabNow: () => pg.evaluate(() => { const b = document.querySelector('.ms2 [data-mstab][aria-selected="true"]'); return b ? b.dataset.mstab : null; }),
    infoTabText: () => pg.evaluate(() => { const p = [...document.querySelectorAll('.ms2 [data-mspan]')].find(e => !e.hidden && e.getClientRects().length); return p ? p.innerText.replace(/\s+/g, ' ').trim() : null; }),
    infoSheetBox: () => pg.evaluate(() => { const s = document.querySelector('.np-sheet'); if (!s || !s.querySelector('.ms2')) return null; const r = s.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom)}; }),
    focusInfoTab: () => pg.focus('.ms2 [data-mstab][aria-selected="true"]'),
    // ---------- the Pokémon page (#pokemon=<name>, Nov 15: replaces the info sheet; every Pokémon tap opens it) ----------
    pokemonPage: () => pg.evaluate(() => { const m = document.querySelector('#main .pk'); return m && window.V2 && V2.route() === 'pokemon' ? m.innerText.replace(/\s+/g, ' ').trim() : null; }),
    pageHash: () => pg.evaluate(() => location.hash),
    /** taps every 'Show ›' on the Pokémon page (parts fold since Nov 15, Sim Q1 A); returns how many it opened */
    openAllParts: async () => { const n = await pg.evaluate(() => { const bs = [...document.querySelectorAll('#main [data-pkopen][aria-expanded="false"], #main [data-pklists][aria-expanded="false"]')].filter(b => b.getClientRects().length); bs.forEach(b => b.click()); return bs.length; }); await pg.waitForTimeout(500); return n; },
    browserBack: async (wait = 900) => { await pg.goBack(); await pg.waitForTimeout(wait); },
    tapJump: name => tapFound(n => [...document.querySelectorAll('#main .pk-jumps [data-pkjump]')].find(e => e.innerText.trim() === n) || null, name, 'jump link ' + name, 900),
    focusInside: () => pg.evaluate(() => { const a = document.activeElement; const s = a && a.closest && a.closest('section'); return s ? s.getAttribute('aria-labelledby') || '' : (a ? a.id || a.tagName : ''); }),
    tapInPage: name => tapFound(n => [...document.querySelectorAll('#main .pk a, #main .pk button')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || e.innerText || '').replace(/\s+/g, ' ').includes(n)) || null, name, 'on the Pokémon page: ' + name, 1200),
    // ---------- Home (pages/home.js, Nov 12): same names and return shapes as today's adapter ----------
    // Home is the page with no hash too (V2.route falls back to it), so go / current / text treat "#home" and "no hash" alike
    // (the shared v2.mjs only knows hash routes); every other page goes through the shared adapter unchanged.
    go: async (name, wait = 600) => { if ((ui.PAGES[name] || name) !== 'home') return go0(name, wait);
      await pg.evaluate(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); if (location.hash !== '#home') location.hash = '#home'; else if (window.V2) V2.redraw(); }); await pg.waitForTimeout(wait); return 'home'; },
    current: async () => { const c = await cur0(); return /^not-in-v2:#\(none/.test(c || '') && await pg.evaluate(() => !!window.V2 && V2.route() === 'home') ? 'home' : c; },
    text: async () => (await pg.evaluate(() => !location.hash && !!window.V2 && V2.route() === 'home')) ? pg.evaluate(() => { const m = document.querySelector('#main'); return m ? m.innerText.replace(/\s+/g, ' ').trim() : ''; }) : text0(),
    /** the big headline (the tagline) */
    homeHeadline: () => txt('#main .hm-hero h1, #main .sdh h1' /* The Stampede (Nov 18): the hero band's h1 */) || '',
    /** the start buttons under the tagline, as shown */
    homeStartButtons: () => pg.evaluate(() => [...document.querySelectorAll('#main .hm-go a, #main [data-sdgo]' /* The Stampede (Nov 18): the start buttons carry data-sdgo (hero: Score My Team / Build Me a Team; six band: Battle) */)].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    /** the tool tiles' names (the tile's bold name, without its "›") */
    /* The Stampede (Nov 18): the tools band's twelve plates and its More tools row are links carrying data-sdtool="<name>" (18 in all) */
    homeTools: () => pg.evaluate(() => [...document.querySelectorAll('#main .hm-tlinks a, #main .hm-tool, #main .sdt [data-sdtool]')].filter(e => e.getClientRects().length).map(e => { if (e.dataset.sdtool) return e.dataset.sdtool; const b = e.querySelector('b'); return (b ? b.childNodes[0].textContent : e.childNodes[0].textContent).trim(); })), /* Nov 15 night: the tools are links */
    tapTool: name => tapFound(n => [...document.querySelectorAll('#main .hm-tlinks a, #main .hm-tool, #main .sdt [data-sdtool]')].find(e => e.getClientRects().length && (e.dataset.sdtool ? e.dataset.sdtool === n : (e.querySelector('b') ? e.querySelector('b').childNodes[0].textContent : e.childNodes[0].textContent).trim() === n)) || null, name, 'tool ' + name, 700),
    /** The Stampede (Nov 18): the line-up's open rings, by their spoken names ("Add a Pokémon to slot N") */
    homeOpenSlots: () => pg.evaluate(() => [...document.querySelectorAll('#main .sds-rings [data-v2addto]')].filter(e => e.getClientRects().length).map(e => e.getAttribute('aria-label'))),
    /** This week in the ratings, the rows on show: {name, text, label} (desktop: its own column; under 900 px: the switch's "This week") */
    ratingMoves: async () => { /* Sim Q4b B (Nov 18): the week's rating moves live on This Week ("Ratings on the Move"), reached as a player does: its address */ if (!(await pg.$('#main .wk-rm'))) { await pg.evaluate(() => { location.hash = '#weekly'; }); await pg.waitForTimeout(1500); }
      return pg.evaluate(() => [...document.querySelectorAll('#main .wk-rc')].filter(e => e.getClientRects().length).map(e => ({name: e.dataset.v2mon, text: e.innerText.replace(/\s+/g, ' ').trim(), label: e.getAttribute('aria-label')}))) },
    welcomeCardText: () => txt('#main .hm-welcome, #main .sds-wl'), /* Sim Q4c (Nov 18): the Stampede's welcome is in the six band */
    closeWhatsNew: () => click('[data-hmnewx]'),
    /** The Meta, right now: the rows of the list on show (names) */
    homeTopRows: () => pg.evaluate(() => [...document.querySelectorAll('#main .hm-top .hm-rk')].filter(e => e.getClientRects().length).map(e => e.dataset.v2mon)),
    homePlanLine: () => pg.evaluate(() => { const e = [...document.querySelectorAll('#main .hm-you .hm-plan, #main .fn-hero > .hm-plan, #main .sds-plan' /* The Stampede (Nov 18): the plan line on the six band's plan board */) /* Fight Night (Nov 14): the plan runs under both corners */].find(e => e.getClientRects().length); const m = e && e.innerText.replace(/\s+/g, ' ').match(/Game [Pp]lan[^.]*\./); return m ? m[0] : null; }),

    // ---------- My Team ----------
    /** the team's name as the page shows it: a heading if there is one, else the eyebrow "My Team · <saved name>" */
    /** the empty box's picture (the featured underdog, Sim Nov 11) is placed */
    // the harness copies the page into app/test/behaviour/, where art/ isn't served, so this checks a Pokémon sprite is placed (screenshots check it shows)
    /** every picture on the empty My Team, with whether it sits in the "Today's underdog" spot (Sim, Nov 11: the underdog replaces Darkrai) */
    emptyTeamPictures: () => pg.evaluate(() => [...document.querySelectorAll('#main img')].filter(i => i.getClientRects().length).map(i => ({src: i.getAttribute('src') || '', underdog: !!i.closest('.tm-ud')}))),
    /** where the section a jump-bar link leads to sits now: its top edge and the window height */
    jumpTarget: name => pg.evaluate(n => { const a = [...document.querySelectorAll('#main .tm-jump [data-tmjump]')].find(e => e.childNodes[0].textContent.trim() === n); const s = a && document.getElementById(a.dataset.tmjump); return s ? {top: Math.round(s.getBoundingClientRect().top), vh: innerHeight, shown: s.getClientRects().length > 0} : null; }, name), /* q59: on phones a tab's section is hidden until its tab is picked */
    emptyBoxArt: () => pg.evaluate(() => [...document.querySelectorAll('#main .bx-empty img')].some(i => i.getClientRects().length && /art\/\d+\.webp$/.test(i.getAttribute('src') || ''))),
    teamHeading: () => pg.evaluate(() => { const m = document.querySelector('#main'); if (!m) return null; const h = [...m.querySelectorAll('h1')].find(e => e.getClientRects().length && !e.closest('.tm-empty'));
      if (h) return h.innerText.replace(/\s+/g, ' ').trim(); const e = m.querySelector('.tm-eb'); const t = e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; const k = t.indexOf(' · '); return k >= 0 ? t.slice(k + 3) : null; }),
    /** Strength Score block: {label, score, band} ("Solid so far" shows as label "Strength Score so far", band "Solid") */
    scoreBlock: () => pg.evaluate(() => { const e = [...document.querySelectorAll('#main .tm-lock .np-score')].find(e => e.getClientRects().length); if (!e) return null;
      const n = e.querySelector('b'), w = e.querySelector('.w span'), l = e.querySelector('.w small'); if (!n || !w) return null; const word = w.innerText.replace(/\s+/g, ' ').trim(), so = / so far$/.test(word);
      return {label: (l ? l.innerText.trim() : '') + (so ? ' so far' : ''), score: +n.innerText.trim(), band: word.replace(/ so far$/, '')}; }),
    /** "Why this score?" is a sheet here (today: a fold under the score): tap opens it; "expanded" = the sheet is open */
    tapWhyScore: () => click('#main [data-v2why]', 600),
    whyExpanded: () => pg.evaluate(() => !!(window.V2 && V2._sheet && V2._sheet.wrap.querySelector('.why2'))),
    whyPanel: () => sheetText('.why2'),
    /** the Legal mark's rules tooltip (today: a [title] in the report pane) */
    rulesTooltip: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-legal[title]')].map(e => e.title).find(Boolean) || null),
    /** Your Six tiles in the order shown (names) */
    sixTiles: () => pg.evaluate(() => [...document.querySelectorAll('#main [data-tmsel]')].filter(e => e.getClientRects().length).map(e => (e.getAttribute('aria-label') || '').split(', ')[0])),
    /** "+ Add a Pokémon" slot tiles among the six */
    emptyTiles: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-six [data-v2addto]')].filter(e => e.getClientRects().length && /add a pok/i.test(e.getAttribute('aria-label') || '')).length),
    tapTile: name => tapFound(n => [...document.querySelectorAll('#main [data-tmsel]')].find(e => e.getClientRects().length && (e.getAttribute('aria-label') || '').split(', ')[0] === n) || null, name, 'tile ' + name, 700),
    tilePressed: name => pg.evaluate(n => { const e = [...document.querySelectorAll('#main [data-tmsel]')].find(e => (e.getAttribute('aria-label') || '').split(', ')[0] === n); return e ? e.getAttribute('aria-pressed') === 'true' : null; }, name),
    /** the selected Pokémon's set (the Set section) */
    /** the set card: the Set section plus the strip under the six, which carries its place in the plan (Sim's review, Nov 11, item 5) */
    setCard: () => pg.evaluate(() => [...document.querySelectorAll('#main .sx-act, #main #tm-set, #main .mh-slot.on .mh-rate, #main .mh-slot.on .mh-set')].map(e => (e.closest('.mh-slot, .mt-edit') ? e.textContent : e.innerText).replace(/\s+/g, ' ').trim()).join(' ')), /* the strip's 'Editing' is capitals by CSS only; the set's type chips sit in the Card on desktop */ /* The Hand (Sim, Nov 14): the editing strip plus the picked Card's plate and set */
    /** how many moves the set card shows */
    setMoveCount: () => pg.evaluate(() => [...document.querySelectorAll('#main #tm-set .tm-moves > *, #main .mh-slot.on .mh-mv > li, #main #tm-set .mt-emv > li')].filter(e => e.getClientRects().length).length),
    showSet: async name => { if (!(await H.tilePressed(name))) await H.tapTile(name); return H.setCard(); },
    /** the padlock on a tile (as today: shown on the picked tile, so tap the tile first when it isn't showing) */
    lockOnTile: async name => { const f = n => [...document.querySelectorAll('#main [data-v2lock]')].find(e => (e.getAttribute('aria-label') || '').includes(n + ':') && e.getClientRects().length && getComputedStyle(e).opacity !== '0') || null;
      if (!(await pg.evaluate(f, name))) await H.tapTile(name); await tapFound(f, name, 'lock on ' + name, 700); },
    tileLockLabel: name => pg.evaluate(n => { const e = [...document.querySelectorAll('#main [data-v2lock]')].find(e => (e.getAttribute('aria-label') || '').includes(n + ':')); return e ? e.getAttribute('aria-label') : null; }, name),
    /** remove a Pokémon with the × on its tile (tap the tile first when the × isn't showing, as today's phones) */
    removeFromTeam: async name => { await H.settle(400, 5000); const f = n => [...document.querySelectorAll('#main [data-v2rm]')].find(e => (e.getAttribute('aria-label') || '') === 'Remove ' + n + ' from your team' && e.getClientRects().length && getComputedStyle(e).opacity !== '0') || null;
      if (!(await pg.evaluate(f, name))) await H.tapTile(name); await tapFound(f, name, 'remove ' + name, 800); },
    /** the game plan line under the six (its sentence only, not the "Use NastyPlot's pick" button beside it) */
    gamePlanLine: () => txt('#main .sx-plan .sx-pl'),
    /** the team actions are all on show (no ⋯ menu), so there is nothing to open */
    /** My Team's More menu (a sheet; Sim, Nov 11): opened when it isn't already */
    openMoreActions: async () => { if (await pg.evaluate(() => !!document.querySelector('.np-sheet .tm-moremenu'))) return; if (await has('#main [data-v2more]')) await click('#main [data-v2more]', 500); },
    /** tap one of the team actions, by today's name */
    teamAction: async name => { const sel = {'Saved Teams': '[data-v2saved]', 'My Box': 'a[href="#box"]', 'Compare with…': '[data-cxgo2]', 'Save team': '[data-v2save]', 'Update saved team': '[data-v2save]', 'Share': '[data-v2share]', 'Copy for Showdown': '[data-v2copy]', 'Import': '[data-v2import]', 'Clear team': '[data-v2clear]', 'Team Sheet': '[data-v2sheetopen]',
        'Export': '[data-v2export]'}[name]; // Nov 12 (TEAM-13): the More menu's Export row (Sim approved), same name as today's
      if (!sel) NOT('team action ' + name); if (!(await has(sel))) await H.openMoreActions(); return click(sel, 900); },
    /** the team actions on offer, under today's names: the row plus the More menu's items (Sim, Nov 11), read without opening it */
    teamActions: () => pg.evaluate(() => { const m = document.querySelector('#main'); if (!m) return [];
      const MAP = [['data-v2save', 'Save Team', 'Save team'], ['data-v2share', 'Share', 'Share'], ['data-v2sheetopen', 'Team Sheet', 'Team Sheet'], ['data-v2copy', 'Copy for Showdown', 'Copy for Showdown'], ['data-v2import', 'Import', 'Import'], ['data-v2saved', 'Saved Teams', 'Saved Teams'], ['data-cxgo2', 'Compare', 'Compare with…'], ['data-v2clear', 'Clear Team', 'Clear team'], ['data-v2export', 'Export', 'Export']]; // Export row: Nov 12 (TEAM-13)
      const out = []; for (const e of [...m.querySelectorAll('.tm-acts > :not([data-v2more]), .tm-empty button, .tm-empty a'), ...(document.querySelector('.np-sheet .tm-moremenu') ? document.querySelectorAll('.np-sheet .tm-moremenu .tm-mi') : (() => { const d = document.createElement('div'); d.innerHTML = m.querySelector('[data-v2more]') && window.V2 && V2.moreHtml ? V2.moreHtml() : ''; d.style.cssText = 'position:fixed;left:0;top:0;width:400px;opacity:0'; document.body.append(d); const l = [...d.querySelectorAll('.tm-mi')]; setTimeout(() => d.remove(), 0); return l; })())]) { if (!e.getClientRects().length) continue; const t = e.innerText.replace(/\s+/g, ' ').trim().replace(/ \d+$/, '');
        // the action is named by what the button does (its data attribute), so a reworded label still counts as that action
        // the main save button says what it will do (A11, approved Nov 12): "Save Team", "Update Saved Team" (the open saved team
        // has changed) or a quiet "Saved ✓" (unchanged); reported under today's names, and "Saved ✓" as itself (Nov 12)
        const sv = e.hasAttribute('data-v2save') ? (/^Update (Saved )?Team$/i.test(t) ? 'Update saved team' : /^Saved\b/.test(t) ? 'Saved ✓' : 'Save team') : null;
        const hit = MAP.find(([a]) => e.hasAttribute(a)); out.push(sv || (hit ? hit[2] : e.getAttribute('href') === '#box' ? 'My Box' : t)); } return out; }),
    jumpBar: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-jump [data-tmjump]')].filter(e => e.getClientRects().length).map(e => e.childNodes[0].textContent.trim())),
    jumpTo: name => tapFound(n => [...document.querySelectorAll('#main .tm-jump [data-tmjump]')].find(e => e.getClientRects().length && e.childNodes[0].textContent.trim() === n) || null, name, 'jump ' + name, 900),
    onScreen: re => pg.evaluate(([s, f]) => { const re = new RegExp(s, f); const e = [...document.querySelectorAll('#main *')].filter(e => e.getClientRects().length && e.innerText && e.innerText.length < 60 && re.test(e.innerText)).pop(); if (!e) return null; const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, [re.source, re.flags]),
    // matchups (pages/matchups.js): rows read in today's order "<rank> <name> <real-games verdict> Calc: <level>"
    topThreatRows: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-rows > li')].filter(e => e.getClientRects().length).map(e => { const nm = e.querySelector('.nm'), sm = nm && nm.querySelector('small'), v = e.querySelector('.tm-v'), k = e.querySelector('.k');
      const name = nm ? nm.innerText.replace(sm ? sm.innerText : '', '').trim() : ''; return [k ? k.innerText.trim() : '', name, v ? v.innerText.trim() : '', sm ? sm.innerText.trim() : ''].filter(Boolean).join(' ').replace(/\s+/g, ' '); })),
    // a threat row, a "next 20" tile or a grid row on the page opens the threat sheet (a V2.sheet holding .mu-sh)
    /* the section opens on the stand-outs (Sim, Nov 11), so a threat that isn't one of them is reached the way a player reaches it: the
       "Top 10" view lists the top 10 and then the next 20 as tiles (all 30 tappable; phones show 5 rows until "Show 5 More ›") */
    tapThreat: async name => { const S = `#main [data-muthr="${name}"]`, seen = () => pg.evaluate(s => [...document.querySelectorAll(s)].some(e => e.getClientRects().length), S);
      if (!(await seen())) { await pg.evaluate(() => { const b = [...document.querySelectorAll('#main [data-v2slide="thr"] > button')].find(e => e.getClientRects().length && e.dataset.v === 'top'); if (b) b.click(); }); await pg.waitForTimeout(600);
        if (!(await seen())) { await pg.evaluate(() => { const b = [...document.querySelectorAll('#main [data-mumore][aria-expanded="false"]')].find(e => e.getClientRects().length); if (b) b.click(); }); await pg.waitForTimeout(400); } }
      return click(S, 800); },
    threatSheet: () => sheetText('.mu-sh'),
    tapThreatInSheet: name => click(`.mu-sh [data-muthr="${name}"]`, 600),
    threatPressedInSheet: () => pg.evaluate(() => { const e = document.querySelector('.mu-sh [data-muthr][aria-pressed="true"]'); return e ? e.dataset.muthr : null; }),
    /** Top 12 grid: cells per threat row (rows in order) */
    gridRows: () => pg.evaluate(() => { const t = [...document.querySelectorAll('#main [role=table]')].find(e => e.getClientRects().length); return t ? [...t.querySelectorAll('[role=row][data-muthr]')].map(r => ({name: ((r.querySelector('.mu-thb') || r).getAttribute('aria-label') || '').replace(/^Open /, '').split(':')[0], /* Nov 15 (B3): the row is a real row; its label is on the threat's button */ cells: r.querySelectorAll('[role=cell]').length})) : null; }),
    tapGridRow: i => tapFound(i => { const t = [...document.querySelectorAll('#main [role=table]')].find(e => e.getClientRects().length); return t ? t.querySelectorAll('[data-muthr]')[i] : null; }, i, 'grid row ' + i, 900),
    // Nov 12 (PLAY-02): the two-Mega pick sits in the Types part of Things to Know (Defense view): "Show: <Mega> · <Mega>" links
    pickTypeChartMega: name => tapFound(n => [...document.querySelectorAll('#main .ty2 [data-v2megapick]')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim() === n) || null, name, 'Mega pick ' + name, 700),
    /** "?" explainers: tap the one with this label (its aria-label, as today's adapter), read the open bubble */
    tapTip: label => H.tapLabel(label, 500), tipBubble: () => txt('.sg2-tipop'),
    /** shortcut for "edit this Pokémon's four moves" (same state change as today's adapter, through the shared logic) */
    giveMoves: (name, moves) => ui.peek(`(()=>{const i=S.slots.findIndex(s=>s.n===${JSON.stringify(name)});S.slots[i].mv={doubles:${JSON.stringify(moves)}};render();return i})()`).then(() => pg.waitForTimeout(1500)),
    // suggestions, read from the visible card into today's wording
    suggestionCards: () => pg.evaluate(() => [...document.querySelectorAll('#main .tm-sug > li')].filter(e => e.getClientRects().length).map(li => {
      const chs = [...li.querySelectorAll('.tm-chg')].map(c => { const sides = [...c.querySelectorAll('.tm-sw')], nm = s => s ? s.innerText.replace(/\s+/g, ' ').trim() : '';
        const inn = nm(c.querySelector('.tm-sw.in')).replace(/\s*(In your box|To catch)$/, '') /* Nov 17: COV-04 line */, out = sides.length > 1 && !sides[0].classList.contains('in') ? nm(sides[0]) : ''; return out ? `${inn} for ${out}` : `+ ${inn} added`; });
      const mv = li.querySelector('.tm-mv'), b = mv && mv.querySelector('b'), sp = mv && mv.querySelector('span'), ap = li.querySelector('[data-v2plan]');
      return [chs.join(', '), b ? `${b.innerText.trim()} (${sp ? sp.innerText.replace(/\s+/g, ' ').trim() : ''})` : '', ap ? ap.innerText.trim() : ''].filter(Boolean).join(' '); })),
    applySuggestionCard: (i = 0) => pg.evaluate(i => { const b = [...document.querySelectorAll('#main [data-v2plan]')].filter(e => e.getClientRects().length && !e.closest('[inert]'))[i]; /* not the inert old list (Nov 17) */ b.click(); }, i).then(() => pg.waitForTimeout(1500)),
    /** the Undo bar above the suggestions ("Applied <label> Undo"), null when there is none (same reading as today's adapter) */
    undoBar: () => pg.evaluate(() => { const e = [...document.querySelectorAll('#main [data-undobar]')].find(e => e.getClientRects().length); return e ? e.parentElement.innerText.replace(/\s+/g, ' ').trim() : null; }),
    undoLastApplied: () => click('#main [data-undobar]', 1500),
    // edit panel: Edit Set (.ed2), and the other panels today's #chEdit hosts: Import (.imp2), Save (.sv2), Add (search sheet)
    editPanel: () => pg.evaluate(() => { const w = window.V2 && V2._sheet && V2._sheet.wrap, s = w && w.querySelector('.np-sheet'); if (!s) return null; const c = s.querySelector('.ed2,.imp2,.sv2,.np-find'); if (!c) return null;
      const h = c.querySelector('h2'), ht = h ? h.innerText.replace(/\s+/g, ' ').trim() : ''; return {title: c.classList.contains('ed2') && !/^Add a Pok/.test(ht) ? 'Edit ' + ht : ht, text: s.innerText.replace(/\s+/g, ' ').trim()}; }),
    /** is keyboard focus inside the open Edit Set sheet? (today: inside #chEdit) */
    focusInEditPanel: () => pg.evaluate(() => { const s = document.querySelector('.np-sheet'); return !!(s && s.querySelector('.ed2') && s.getClientRects().length && s.contains(document.activeElement)); }),
    /** one field of the Edit Set sheet (Ability, Item, Moves, Nature, Stat points), read as shown: "<label> <tag> …" */
    panelField: label => pg.evaluate(l => { const f = [...document.querySelectorAll('.np-sheet .ed2 .ed-f')].find(f => { const s = f.querySelector('.ed-l > span'); return s && s.innerText.trim() === l; }); return f ? f.innerText.replace(/\s+/g, ' ').trim() : null; }, label),
    openEditPanel: async name => { await H.showSet(name); await click('#main #tm-set [data-v2edit]', 900); await H.settle(); },
    closeEditPanel: () => closeSheet(),
    editStrip: () => pg.evaluate(() => [...document.querySelectorAll('.ed2 .ed-pk')].filter(e => e.getClientRects().length).map(e => e.getAttribute('aria-label'))),
    tapStrip: i => click(`.ed2 .ed-pk[data-k="${i}"]`, 800),
    panelLock: () => click('.ed2 [data-ed="lock"]', 700),
    panelLockText: () => txt('.ed2 [data-ed="lock"]'),
    panelSlot: () => pg.evaluate(() => { const b = document.querySelector('.ed2 .ed-pk[aria-pressed="true"]'); if (b) return +b.dataset.k; const q = document.querySelector('.np-sheet [data-adq]'); return q && q.dataset.adq !== '' ? +q.dataset.adq : 0; }), /* Nov 18: the Add box has no slot strip; its name box says which slot it fills (data-adq) */
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
    nameBox: () => pg.evaluate(() => { const i = [...document.querySelectorAll('[data-adq],[data-v2q],[data-bxq],[data-ygq]')].find(e => e.getClientRects().length); return i ? {focused: i === document.activeElement, value: i.value} : null; }),
    typeName: async (text, sel = '#chEdit input[placeholder]') => { const [s, opener] = NAMEBOX[sel] || [sel, null];
      if (!(await vis(s)) && opener) { if (!(await vis(opener))) NOT('a way to open ' + s + ' here'); await click(opener, 600); }
      const loc = pg.locator(s).filter({visible: true}).first(); await loc.click(); await loc.fill(''); await loc.pressSequentially(text, {delay: 20}); await pg.waitForTimeout(500); },
    nameOptions: () => pg.evaluate(() => { const l = [...document.querySelectorAll('.np-sheet .hits')].find(e => e.getClientRects().length); return l ? [...l.querySelectorAll('.np-hit')].filter(e => e.getClientRects().length).map(o => o.innerText.replace(/\s+/g, ' ').trim()) : []; }),
    nameListText: () => pg.evaluate(() => { const l = [...document.querySelectorAll('.np-sheet .hits')].find(e => e.getClientRects().length); return l ? l.innerText.replace(/\s+/g, ' ').trim() : null; }),
    // import / export
    openImport: async () => { if (!(await has('[data-v2import]'))) await H.openMoreActions(); await click('[data-v2import]', 800); },
    pasteTeam: async text => { await pg.locator('[data-impin]').fill(text); await click('[data-impgo]', 1500); },
    // Nov 12 (IO-02): Export to Showdown is a sheet opened from the More menu's "Export" row; its text is a readonly box
    openExport: async () => { if (!(await has('[data-v2export]'))) await H.openMoreActions(); await click('[data-v2export]', 800); },
    exportText: () => pg.evaluate(() => { const f = [...document.querySelectorAll('.np-sheet [data-expout]')].find(e => e.getClientRects().length); return f ? f.value : null; }),
    /** the Export box as a player meets it: readonly? focused? how much of it is selected (for the "Press Ctrl+C" fallback) */
    exportBox: () => pg.evaluate(() => { const f = [...document.querySelectorAll('.np-sheet [data-expout]')].find(e => e.getClientRects().length); return f ? {readOnly: f.readOnly, focused: document.activeElement === f, selected: f.selectionEnd - f.selectionStart, len: f.value.length} : null; }),
    /** Clear Team is on the page, so an open sheet (e.g. the Add a Pokémon sheet left after Remove) is closed first, as a player would */
    clearTeam: async () => { if (await pg.evaluate(() => !!(window.V2 && V2._sheet) && !document.querySelector('.np-sheet .tm-moremenu'))) await closeSheet(); await H.openMoreActions(); await click('[data-v2clear]', 900); },
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
    /** one Pokémon's card on the Team Sheet (the sheet over My Team), as shown */
    // Nov 14, Tale of the Tape: one Pokémon is a column of the table, not a card. Its "card" text = its column read top to bottom with the
    // row labels, the way today's card reads ("Garchomp Item Choice Scarf Ability Rough Skin ... HP 185 2 ..."), so the same checks apply.
    teamSheetCard: name => pg.evaluate(n => { const T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; for (const tb of document.querySelectorAll('.np-sheet .ts2 table.tt')) { if (!tb.getClientRects().length) continue;
        const hs = [...tb.querySelectorAll('thead th')], k = hs.findIndex(h => T(h.querySelector('.tt-pick')).replace(/ Lead.*$/, '').replace(/^\d\d /, '').startsWith(n.replace(/^Mega /, '')) || (h.querySelector('[aria-label]') || {}).getAttribute?.('aria-label')?.startsWith(n + ':')); if (k < 0) continue;
        /* today's card reading order: name, "↑ Lead <plan>", Item, Ability, the moves, the nature and its spread line, the stats */
        const out = [n], ld = hs[k].querySelector('.tt-lead:not(.no)'); if (ld) out.push('↑ ' + T(ld));
        const rows = [...tb.querySelectorAll('tbody tr')].map(tr => ({h: T(tr.querySelector('th')), d: tr.querySelectorAll('td')[k]})).filter(x => x.h && x.d);
        const by = h => rows.filter(x => x.h === h), rest = rows.filter(x => !['Item', 'Ability', 'Moves', 'Nature'].includes(x.h));
        for (const x of [...by('Item'), ...by('Ability')]) out.push(x.h, T(x.d)); for (const x of by('Moves')) out.push(T(x.d)); for (const x of by('Nature')) out.push(T(x.d).replace(/^(\S+) /, '$1 '));
        for (const x of rest) out.push(x.h, T(x.d).replace(/ (pts|points)/g, '').replace(/[▲▼] /g, '')); return out.join(' '); } return null; }, name),
    focusSheetCard: name => pg.evaluate(n => { const b = [...document.querySelectorAll('.np-sheet .ts2 .tt-pick')].filter(e => e.getClientRects().length).find(e => (e.getAttribute('aria-label') || '').startsWith(n + ':')); if (b) b.focus(); return !!b && document.activeElement === b; }, name),
    // Nov 12 (TEAM-15): the Matchups section's real-games bar is drawn only (aria-hidden), so text can't see it: its three shares
    // (Favoured | Even match | Unfavoured), the section it sits in, and the lines just before and after it; null if not shown
    matchupsBar: () => pg.evaluate(() => { const b = [...document.querySelectorAll('#main .mu-split')].find(e => e.getClientRects().length); if (!b) return null;
      const g = c => { const e = b.querySelector(c); return e ? +e.style.flexGrow || 0 : null; }, T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : '', s = b.closest('section');
      return {fav: g('.sf'), even: g('.se'), unf: g('.su'), section: T(s && s.querySelector('h2')), before: T(b.previousElementSibling), after: T(b.nextElementSibling)}; }),
    sheetColumns: () => pg.evaluate(() => { const c = [...document.querySelectorAll('.ts2 .tt-pick')].filter(e => e.getClientRects().length); if (!c.length) return 0; const top = Math.round(c[0].getBoundingClientRect().top); return c.filter(e => Math.abs(Math.round(e.getBoundingClientRect().top) - top) < 4).length; }),
    // saved teams (.svt2 sheet)
    savedCards: () => pg.evaluate(() => [...document.querySelectorAll('.svt2 .svt2-card:not(.svt2-free)')].filter(e => e.getClientRects().length).map(c => c.innerText.replace(/\s+/g, ' ').trim())),
    savedCardOf: name => H.savedCards().then(a => a.find(t => t.startsWith(name + ' ') || t.includes(name)) || null),
    savedAction: async (name, what) => { if (!(await vis('.svt2'))) await H.openSavedSheet();
      // Nov 12: Compare and Team Poster added (the build has had them on each card since Nov 11; the adapter lagged)
      const a = {Open: 'open', 'Copy for Showdown': 'copy', Rename: 'ren', Delete: 'del', Compare: 'cmp', 'Team poster': 'poster'}[what]; if (!a) NOT('saved team action ' + what);
      const label = {open: 'Open ', copy: 'Copy ', ren: 'Rename ', del: 'Delete ', cmp: 'Compare ', poster: 'Team poster of '}[a] + name + (a === 'copy' ? ' for Showdown' : '');
      return tapFound(([a, l]) => [...document.querySelectorAll(`.svt2 [data-svact="${a}"]`)].find(e => e.getClientRects().length && e.getAttribute('aria-label') === l) || null, [a, label], label, a === 'open' ? 1500 : 700); },
    typeSaveName: async name => { const l = pg.locator('[data-v2savename]'); await l.fill(name); await pg.waitForTimeout(200); },
    typeRename: async name => { const l = pg.locator('.svt2 [data-svname]').filter({visible: true}).first(); await l.fill(name); await pg.waitForTimeout(200); },
    addRetiredSinglesTeam: name => ui.peek(`S.teams.push({id:'tsg',name:${JSON.stringify(name)},slots:[{n:'Garchomp',a:null,lock:false}],format:'singles',saved:Date.now()});render()`).then(() => pg.waitForTimeout(600)),
    // box
    tapBoxUndo: () => click('.np-sheet-undo button, .np-toast [data-bxundo], .np-toast #toastUndo', 900),
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
    compareHeads: () => pg.evaluate(() => [...document.querySelectorAll('#main .cx2-head, #main .cxf-half .cxf-id')] /* the Face-Off poster halves carry the heads now (Nov 14) */.filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim())),
    pasteCompareTeam: async text => { if (!(await vis('[data-cxpaste-in]'))) await click('#main [data-cxp="B"]', 700); await pg.locator('[data-cxpaste-in]').fill(text); await click('[data-cxpaste2]', 1500); },
    compareCheckRows: () => pg.evaluate(() => [...document.querySelectorAll('#main .cx2-row')].filter(e => e.getClientRects().length).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /[✓✗?]/.test(t))),
    // ---------- Nov 12 (helper-tests2): approved new-build designs ----------
    /** the More menu's rows as shown, [{label, sub}] (TEAM-13: the "Export" row and its line); [] when the menu isn't open */
    moreMenuRows: () => pg.evaluate(() => [...document.querySelectorAll('.np-sheet .tm-moremenu .tm-mi')].filter(e => e.getClientRects().length).map(e => { const s = e.querySelector('small'), l = e.querySelector('span');
      return {label: l ? l.innerText.replace(/\s+/g, ' ').trim() : '', sub: s ? s.innerText.replace(/\s+/g, ' ').trim() : ''}; })),
    /** a My Team tile as the six draws it (EDIT-03): its accessible name, whether it is marked locked and shows the padlock */
    tileLock: name => pg.evaluate(n => { const b = [...document.querySelectorAll('#main .sx-slot .tm-pick')].find(e => (e.getAttribute('aria-label') || '').split(', ')[0] === n); if (!b) return null; const s = b.closest('.sx-slot'), p = b.querySelector('.sx-lk');
      return {label: b.getAttribute('aria-label'), locked: s.classList.contains('locked'), padlock: !!(p && p.getClientRects().length), padlockLabel: p ? p.getAttribute('aria-label') : null}; }, name),
    /** the link (an <a>) on My Team whose words are exactly `text`: where it leads (X-02's "Build your own"; #build has no page in this build yet) */
    linkHref: text => pg.evaluate(t => { const a = [...document.querySelectorAll('#main a')].find(e => e.getClientRects().length && e.innerText.replace(/\s+/g, ' ').trim().replace(/ ›$/, '') === t); return a ? a.getAttribute('href') : null; }, text), /* Nov 16: blue links end in › */
    /** the Game Plan sheet (PLAY-01): eyebrow, title, the line under it and each row {label, status, who, note}; null when not open */
    gamePlanSheet: () => pg.evaluate(() => { const g = [...document.querySelectorAll('.np-sheet .gp2:not(.ty2s)')].find(e => e.getClientRects().length); if (!g) return null; const T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : '';
      return {eyebrow: T(g.querySelector('.np-eyebrow')), title: T(g.querySelector('h2')), sub: T(g.querySelector('.tm-sub')), rows: [...g.querySelectorAll('.gp2-rows > li')].map(li => { const w = li.querySelector('.gp2-w'), s = w && w.querySelector('small');
        return {label: T(li.querySelector('.gp2-l')), status: T(li.querySelector('.sg2-sev')), who: w ? [...w.childNodes].filter(n => n !== s).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim() : '', note: T(s)}; })}; }),
    /** the Types part inside the Things to Know fold (PLAY-02), as shown; null if it isn't there */
    typesPart: () => txt('#main details[data-v2fix] .ty2'),
    /** the Full Tables sheet (PLAY-02): title, eyebrow, its headings and each table's column heads and row count */
    typeTables: () => pg.evaluate(() => { const g = [...document.querySelectorAll('.np-sheet .ty2s')].find(e => e.getClientRects().length); if (!g) return null; const T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : '';
      return {eyebrow: T(g.querySelector('.np-eyebrow')), title: T(g.querySelector('h2')), heads: [...g.querySelectorAll('h3')].map(T), tables: [...g.querySelectorAll('table')].map(t => ({cols: [...t.querySelectorAll('thead th')].map(T), rows: t.querySelectorAll('tbody tr').length, first: T(t.querySelector('tbody tr'))}))}; }),
    /** How Scoring Works (SETS-02, X-12): the fold at the end of "Why this score?": is it the sheet's last part, its title, open?, and
     *  each paragraph as shown {text, button ("More" / "Less" / ""), expanded}; null when the fold isn't there */
    howScoring: () => pg.evaluate(() => { const w = document.querySelector('.np-sheet .why2'), d = w && w.querySelector('details.hs2'); if (!d) return null; const T = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : '';
      return {last: w.lastElementChild === d, title: T(d.querySelector('summary')), open: d.open, paras: [...d.querySelectorAll('.hs2-in > p')].map(p => { const b = p.querySelector('[data-hsmore]'); return {text: T(p), button: b ? T(b) : '', expanded: b ? b.getAttribute('aria-expanded') : null}; })}; }),
    /** tap paragraph k's More / Less button in How Scoring Works */
    tapHowMore: k => tapFound(k => { const p = document.querySelectorAll('.np-sheet .why2 details.hs2 .hs2-in > p')[k]; return p ? p.querySelector('[data-hsmore]') : null; }, k, 'More/Less in paragraph ' + k, 400),
    /** remove controls on the Team Sheet's cards (SETS-01: Sim dropped the per-card "−"; the six's "− Remove" covers it) */
    teamSheetRemoves: () => pg.evaluate(() => [...document.querySelectorAll('.np-sheet .ts2 button, .np-sheet .ts2 [role=button]')].filter(e => /remove|^−$/i.test((e.getAttribute('aria-label') || '') + ' ' + e.innerText.trim())).length),
    // shared behaviour
    doubleTapApply: async () => { const b = pg.locator('#main [data-v2plan]').filter({visible: true}).first(); await b.scrollIntoViewIfNeeded(); await b.dblclick({delay: 60}); await pg.waitForTimeout(1500); },
    scrollToSuggestions: async () => { /* q59 (Sim's yes, Nov 20): under 700 Suggestions is a tab; a player taps it first */ await pg.evaluate(() => { const t = document.querySelector('.tm-tabs [data-tmjump="tm-sg"]'); if (t && t.getAttribute('aria-selected') !== 'true') t.click(); }); await pg.waitForTimeout(700);
      /* and waits while it says "Working out the best changes…" (the stacked page used to keep settle() busy until then; a tab tap can come sooner) */ await pg.waitForFunction(() => !document.querySelector('#main .sg2-wait'), null, {timeout: 30000}).catch(() => {}); await pg.waitForTimeout(300); await pg.evaluate(() => { const b =[...document.querySelectorAll('#main [data-v2plan]')].find(e => e.getClientRects().length); if (!b) throw new Error('no Apply on screen: ' + JSON.stringify({all: document.querySelectorAll('#main [data-v2plan]').length, tab: (document.querySelector('.tm-tabs [aria-selected="true"]') || {}).textContent, wait: !!document.querySelector('.sg2-wait'), w: innerWidth, hash: location.hash})); window.scrollTo(0, b.getBoundingClientRect().top + scrollY - 300); }); await pg.waitForTimeout(600); },
    goBack: async () => { await pg.goBack().catch(() => {}); await pg.waitForTimeout(800); },
    sliderIndex: label => pg.evaluate(l => { const b = [...document.querySelectorAll('[data-v2slide] > button')].find(e => e.getClientRects().length && e.innerText.trim().toLowerCase() === l.toLowerCase()); const g = b && b.parentElement; return g ? [...g.querySelectorAll('button')].indexOf(b) + '|' + g.style.getPropertyValue('--i') : null; }, label),
    pageLuminance: () => pg.evaluate(() => { const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }),
    retirePokemonInSlot: (i, name) => ui.peek(`S.slots[${i}]={n:${JSON.stringify(name)},a:null,lock:false};render()`).then(() => pg.waitForTimeout(1200)),
  };
  H.go.__v2base = go0; H.current.__v2base = cur0; H.text.__v2base = text0;
  return H;
};
