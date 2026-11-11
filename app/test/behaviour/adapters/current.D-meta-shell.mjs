// Group D (Meta pages and the site shell): page helpers for TODAY's site. The rebuild adapter (adapters/rebuild.D-meta-shell.mjs)
// implements the same function names its own way. This is the only D file that knows today's selectors and internals.
// Every helper is named for what the player does or sees. They are exposed as ui.D.* (not merged flat into ui) because the harness
// merges every group's adapter file into one object and same-named helpers from other groups would silently replace each other.
export default (ui, pg) => {
  // run a function in the page; `vis` (is it on screen?) and `tx` (its visible text) are available inside as globals
  const ev = (fn, arg) => pg.evaluate(([src, a]) => {
    window.__dvis = window.__dvis || (e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0.05);
    window.__dtx = window.__dtx || (e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : '');
    return (0, eval)('(' + src + ')')(a); }, [fn.toString(), arg]);
  const wait = ms => pg.waitForTimeout(ms);
  /** wait until fn() (async) is truthy; returns its value or the last value after `ms` */
  const until = async (fn, ms = 4000, step = 100) => { const t = Date.now(); let v; while (Date.now() - t < ms) { v = await fn(); if (v) return v; await wait(step); } return v; };
  const pane = `[...document.querySelectorAll('[data-pane]')].find(e => !e.hidden && e.getClientRects().length) || document.body`;

  const D = {
    until,
    // ---------------- navigation ----------------
    /** names of the main tabs the player can see (desktop header tabs or phone bottom bar) */
    mainTabs: () => ev(() => [...document.querySelectorAll('nav.tabs [data-view], nav.bnav [data-view]')].filter(__dvis).map(b => __dtx(b).replace(/\s*\d\/6$/, ''))),
    /** the highlighted main tab */
    activeMainTab: () => ev(() => { const b = [...document.querySelectorAll('nav.tabs [data-view], nav.bnav [data-view]')].filter(__dvis).find(b => b.getAttribute('aria-selected') === 'true' || b.classList.contains('on'));
      return b ? __dtx(b).replace(/\s*\d\/6$/, '') : null; }),
    /** the "x/6" count beside My Team in the main tabs */
    teamCount: () => ev(() => { const b = [...document.querySelectorAll('nav.tabs [data-view="report"], nav.bnav [data-view="report"]')].find(__dvis); const m = b && __dtx(b).match(/(\d)\/6/); return m ? m[0] : null; }),
    /** is the phone bottom bar on screen, and where (its top edge in the window) */
    bottomBar: () => ev(() => { const n = document.querySelector('nav.bnav'); if (!__dvis(n)) return null; const r = n.getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), names: [...n.querySelectorAll('[data-view]')].map(__dtx)}; }),
    tapMainTab: async name => { await ev(n => { const b = [...document.querySelectorAll('nav.tabs [data-view], nav.bnav [data-view]')].filter(__dvis).find(b => __dtx(b).replace(/\s*\d\/6$/, '').toLowerCase() === n.toLowerCase()); if (!b) throw new Error('no main tab ' + n); b.click(); }, name); await wait(600); },
    /** the "⋯" menu */
    openMenu: async () => { await pg.click('[aria-label="More pages and settings"]'); await until(() => D.menuIsOpen()); await wait(250); },
    menuIsOpen: () => ev(() => { const s = document.querySelector('#side'); return !!s && s.classList.contains('open') && __dvis(document.querySelector('.sidenav')); }),
    menuButtonOn: () => ev(() => { const b = document.querySelector('#moreBtn'); return !!b && b.classList.contains('on'); }),
    /** page names listed in the menu, in order */
    menuPages: () => ev(() => [...document.querySelectorAll('.sidenav [data-view]')].filter(__dvis).map(b => __dtx(b.querySelector('.nl') || b))),
    /** the page marked as current in the menu */
    menuCurrent: () => ev(() => { const b = [...document.querySelectorAll('.sidenav [data-view]')].find(b => b.getAttribute('aria-selected') === 'true'); return b ? __dtx(b.querySelector('.nl') || b) : null; }),
    menuGroups: () => ev(() => [...document.querySelectorAll('.sidenav .sgroup')].filter(__dvis).map(g => ({name: __dtx(g.querySelector('.sgl')) || __dtx(g.querySelector('[data-view]')), color: getComputedStyle(g.querySelector('[data-view]')).getPropertyValue('--ar-sec') || getComputedStyle(g).color}))),
    tapMenuPage: async name => { await ev(n => { const b = [...document.querySelectorAll('.sidenav [data-view]')].filter(__dvis).find(b => __dtx(b.querySelector('.nl') || b).toLowerCase() === n.toLowerCase()); if (!b) throw new Error('no menu row ' + n); b.click(); }, name); await wait(600); },
    /** close the menu: 'x' | 'backdrop' | 'escape' | 'back' */
    closeMenu: async (how = 'x') => { if (how === 'x') await pg.click('#sideClose'); else if (how === 'backdrop') await pg.mouse.click(5, 450); else if (how === 'escape') await pg.keyboard.press('Escape'); else await pg.goBack().catch(() => {});
      await until(async () => !(await D.menuIsOpen())); await wait(250); },
    /** is keyboard focus inside the open menu / the open dialog? */
    focusInMenu: () => ev(() => !!document.activeElement && !!document.activeElement.closest('#side')),
    focusName: () => ev(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || __dtx(a)).slice(0, 80) : null; }),
    /** Pokémon | Tournaments row at the top of Meta pages */
    sectionSwitch: () => ev(new Function(`const p = ${pane}; const n = [...p.querySelectorAll('.subnav')].find(__dvis); if (!n) return null;
      const b = [...n.querySelectorAll('button')]; return {items: b.map(__dtx), selected: (b.find(x => x.getAttribute('aria-selected') === 'true') || {}).innerText || null};`)),
    tapSection: async name => { await ui.tap(new RegExp('^' + name + '$'), '[data-pane]:not([hidden]) .subnav'); await wait(300); },
    /** the sliding picker under it: Rating / Usage / Sets or Winning Teams / Events / Archetypes */
    pageSwitch: () => ev(new Function(`const p = ${pane}; const n = [...p.querySelectorAll('.seg.teamsw')].find(__dvis); if (!n) return null;
      const b = [...n.querySelectorAll('button')]; return {items: b.map(__dtx), selected: __dtx(b.find(x => x.getAttribute('aria-pressed') === 'true')),
        announced: b.filter(x => x.getAttribute('aria-pressed') === 'true' || x.getAttribute('aria-selected') === 'true').map(__dtx)};`)),
    tapPageSwitch: async name => { const from = await ui.current(); await ev(new Function('n', `const p = ${pane}; const b = [...p.querySelectorAll('.seg.teamsw button')].filter(__dvis).find(b => __dtx(b) === n); if (!b) throw new Error('no switch ' + n); b.click();`), name);
      await until(async () => await ui.current() !== from && ((await D.pageSwitch()) || {}).selected === name, 4000); await wait(300); },
    /** the "← name" back link on a sub-page */
    backLink: () => ev(new Function(`const p = ${pane}; const b = [...p.querySelectorAll('button,a')].filter(__dvis).find(b => /^←/.test(__dtx(b))); return b ? __dtx(b) : null;`)),
    tapBackLink: async () => { await ui.tap(/^←/, '[data-pane]:not([hidden])'); await wait(400); },
    browserBack: async () => { await pg.goBack({timeout: 3000}).catch(() => {}); await wait(700); },
    address: () => pg.url(),
    scrollY: () => pg.evaluate(() => Math.round(scrollY)),
    scrollTo: async y => { await pg.mouse.move(640, 400); await pg.evaluate(y => scrollTo(0, y), y); await pg.mouse.wheel(0, 1); await wait(300); },
    scrollToBottom: async () => { await pg.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await pg.mouse.wheel(0, 50); await wait(400); },
    /** the accent colour of the current section */
    accent: () => pg.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ar-sec').trim().toUpperCase()),
    pageTitle: () => pg.title(),
    /** the top heading the player reads (big title or kicker) */
    headings: () => ev(new Function(`const p = ${pane}; return [...p.querySelectorAll('h1,h2,h3,.cht,.chpt,.ar-h')].filter(__dvis).map(__dtx).filter(Boolean).slice(0, 30);`)),

    // ---------------- search (jump) ----------------
    openSearch: async (via = 'button') => { if (via === 'button') await pg.click('[data-jumpbtn], .jumpbtn'); else if (via === 'keys') await pg.keyboard.press('Control+k'); else await pg.keyboard.press('/');
      await wait(400); },
    searchIsOpen: () => ev(() => __dvis(document.querySelector('#jumpIn'))),
    searchHasFocus: () => ev(() => document.activeElement && document.activeElement.id === 'jumpIn'),
    search: async text => { await pg.fill('#jumpIn', ''); await pg.type('#jumpIn', text, {delay: 15}); await wait(350); },
    /** result rows: {name, sub, kind, selected} */
    searchResults: () => ev(() => [...document.querySelectorAll('#jumpList [role=option]')].filter(__dvis).map(li => ({name: __dtx(li.querySelector('b')), sub: __dtx(li.querySelector('.jl span, .jl > span:last-child')), kind: __dtx(li.querySelector('.jk')), kindShown: __dvis(li.querySelector('.jk')), selected: li.getAttribute('aria-selected') === 'true', text: __dtx(li)}))),
    searchMessage: () => ev(() => __dtx(document.querySelector('#jumpList')) + ' ' + __dtx(document.querySelector('.jbox'))),
    tapSearchResult: async name => { await ev(n => { const li = [...document.querySelectorAll('#jumpList [role=option]')].filter(__dvis).find(li => __dtx(li.querySelector('b')) === n); if (!li) throw new Error('no result ' + n); li.click(); }, name); await wait(700); },
    closeSearchByBackdrop: async () => { await pg.mouse.click(8, 890); await wait(400); },
    key: async k => { await pg.keyboard.press(k); await wait(250); },
    typeKeys: async s => { await pg.keyboard.type(s, {delay: 20}); await wait(300); },
    focusField: async placeholder => { await pg.click(`input[placeholder*="${placeholder}"]:visible`); await wait(150); },
    fieldValue: placeholder => ev(p => { const i = [...document.querySelectorAll('input,textarea')].filter(__dvis).find(i => (i.placeholder || '').includes(p)); return i ? i.value : null; }, placeholder),
    /** tap the × inside a search field */
    clearField: async placeholder => { await ev(p => { const i = [...document.querySelectorAll('input')].filter(__dvis).find(i => (i.placeholder || '').includes(p)); const x = i && i.parentElement.querySelector('.clrx, [aria-label="Clear"]'); if (!x || !__dvis(x)) throw new Error('no visible × in ' + p); x.click(); }, placeholder); await wait(400); },
    clearShown: placeholder => ev(p => { const i = [...document.querySelectorAll('input')].filter(__dvis).find(i => (i.placeholder || '').includes(p)); const x = i && i.parentElement.querySelector('.clrx, [aria-label="Clear"]'); return __dvis(x); }, placeholder),
    focusedPlaceholder: () => ev(() => (document.activeElement && document.activeElement.placeholder) || null),

    // ---------------- theme ----------------
    /** does the page look dark? (background luminance) */
    looksDark: () => pg.evaluate(() => { const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 < 0.4; }),
    themeButton: () => ev(() => { const b = document.querySelector('#thmBtn'); return __dvis(b) ? b.getAttribute('aria-label') : null; }),
    tapThemeButton: async () => { await pg.click('#thmBtn'); await wait(400); },
    /** choose Auto / Light / Dark in the ⋯ menu */
    chooseTheme: async name => { if (!(await D.menuIsOpen())) await D.openMenu();
      await ev(n => { const b = [...document.querySelectorAll('[data-thm]')].filter(__dvis).find(b => __dtx(b).toLowerCase() === n.toLowerCase()); if (!b) throw new Error('no theme choice ' + n); b.click(); }, name); await wait(400); },
    themeChoices: () => ev(() => [...document.querySelectorAll('[data-thm]')].filter(__dvis).map(b => ({name: __dtx(b), on: b.getAttribute('aria-pressed') === 'true'}))),
    deviceDark: async on => { await pg.emulateMedia({colorScheme: on ? 'dark' : 'light'}); await wait(500); },
    reduceMotion: async () => { await pg.emulateMedia({reducedMotion: 'reduce'}); await wait(200); },

    // ---------------- shell parts ----------------
    footerText: () => ev(() => __dtx(document.querySelector('footer'))),
    tapFooter: async m => { await ui.tap(m, 'footer'); await wait(500); },
    headerControls: () => ev(() => [...document.querySelectorAll('header button, header a')].filter(__dvis).map(b => b.getAttribute('aria-label') || __dtx(b))),
    headerFits: () => ev(() => { const h = document.querySelector('header'); return [...h.querySelectorAll('button,a')].filter(__dvis).every(b => { const r = b.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; }); }),
    toastText: () => ev(() => { const t = document.querySelector('#toast'); if (!t || !__dvis(t)) return null; const r = t.getBoundingClientRect(); return r.top < innerHeight - 4 && r.bottom > 0 ? __dtx(t) || null : null; }),
    toastHasPicture: () => ev(() => { const t = document.querySelector('#toast'); return !!t && [...t.querySelectorAll('img, [class*=dk]')].some(__dvis); }),
    tapUndo: async () => { await pg.click('#toastUndo'); await wait(500); },
    /** open the "?" tip whose label matches (within the shown page) */
    openTip: async m => { await ev(new Function('m', `const p = ${pane}; const re = new RegExp(m, 'i'); const b = [...p.querySelectorAll('[data-tip]')].filter(__dvis).find(b => re.test(b.getAttribute('aria-label') || '') || re.test(b.dataset.tip)); if (!b) throw new Error('no tip ' + m); const r = b.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 60) b.scrollIntoView({block: 'center'});`), m);
      await wait(250); await ev(new Function('m', `const p = ${pane}; const re = new RegExp(m, 'i'); [...p.querySelectorAll('[data-tip]')].filter(__dvis).find(b => re.test(b.getAttribute('aria-label') || '') || re.test(b.dataset.tip)).click();`), m); await wait(350); },
    tipText: () => ev(() => { const t = document.querySelector('#tipPop'); return __dvis(t) ? __dtx(t) : null; }),
    tipHasPicture: () => ev(() => { const t = document.querySelector('#tipPop'); return !!t && [...t.querySelectorAll('img')].length > 0; }),
    /** tap a link inside the open tip */
    tapInTip: async m => { await ui.tap(m, '#tipPop'); await wait(600); },
    /** folds: open state of the fold whose title matches; toggle it */
    foldIsOpen: m => ev(m => { const d = [...document.querySelectorAll('details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? d.open : null; }, m),
    toggleFold: async m => { await ev(m => { const d = [...document.querySelectorAll('details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); if (!d) throw new Error('no fold ' + m); d.querySelector('summary').click(); }, m); await wait(500); },
    foldText: m => ev(m => { const d = [...document.querySelectorAll('details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? __dtx(d) : null; }, m),
    /** "More" / "Less" on folded paragraphs inside `within` */
    tapMore: async (within = 'body', label = 'More') => { await ev(([w, l]) => { const b = [...document.querySelectorAll(w + ' .rzmorebtn')].filter(__dvis).find(b => __dtx(b) === l); if (!b) throw new Error('no ' + l + ' button'); b.click(); }, [within, label]); await wait(300); },
    moreButtons: (within = 'body') => ev(w => [...document.querySelectorAll(w + ' .rzmorebtn')].filter(__dvis).map(__dtx), within),
    /** "Details" / "Hide details" toggle on the shown page */
    tapDetails: async () => { await ev(new Function(`const p = ${pane}; const b = [...p.querySelectorAll('[data-dbdt]')].filter(__dvis)[0]; if (!b) throw new Error('no Details button'); b.click();`)); await wait(400); },
    detailsLabel: () => ev(new Function(`const p = ${pane}; const b = [...p.querySelectorAll('[data-dbdt]')].filter(__dvis)[0]; return b ? __dtx(b) : null;`)),
    /** first-visit welcome card */
    welcomeCard: () => ev(() => { const w = document.querySelector('#welcomeCard'); return __dvis(w) ? __dtx(w) : null; }),
    whatsNew: () => ev(() => { const w = [...document.querySelectorAll('details, .wnew, [data-wnew]')].filter(__dvis).find(d => /What's new/i.test(__dtx(d))); return w ? __dtx(w) : null; }),
    dismissWhatsNew: async () => { await pg.click('[data-wnewx]'); await wait(400); },
    /** banner for a shared team link */
    sharedBanner: () => ev(() => { const b = [...document.querySelectorAll('div,section,aside')].filter(__dvis).find(e => /^Shared team/i.test(__dtx(e)) && e.querySelectorAll('button').length >= 2 && e.querySelectorAll('button').length < 6); return b ? __dtx(b) : null; }),
    /** a dialog (feedback, share card, copy for Showdown) that is open */
    dialogText: () => ev(() => { const d = [...document.querySelectorAll('[role=dialog]')].filter(__dvis).filter(d => d.id !== 'side' && !d.closest('#lairSheet') && !d.classList.contains('jbox')).pop(); return d ? __dtx(d) : null; }),
    dialogFields: () => ev(() => { const d = [...document.querySelectorAll('[role=dialog]')].filter(__dvis).pop(); return d ? [...d.querySelectorAll('input,textarea,select')].filter(__dvis).map(i => ({type: i.type || i.tagName, ph: i.placeholder || '', label: i.getAttribute('aria-label') || ''})) : []; }),
    /** tap a button inside the dialog that is open on top (feedback, share card, copy dialog) */
    tapInDialog: async m => { const ok = await ev(([src, fl]) => { const re = new RegExp(src, fl); const d = [...document.querySelectorAll('[role=dialog]')].filter(__dvis).pop(); const b = d && [...d.querySelectorAll('button')].filter(__dvis).find(b => re.test(__dtx(b)));
        if (!b) return false; b.click(); return true; }, [m.source, m.flags]); if (!ok) throw new Error('nothing in the dialog matching ' + m); await wait(500); },
    /** tap a button inside one usage row */
    tapInUsageRow: async (name, m) => { await ev(([n, src]) => { const d = [...document.querySelectorAll('[data-pane=meta] details.mrow')].filter(__dvis).find(d => (d.querySelector('.nm').firstChild.textContent || '').trim() === n);
        const b = d && [...d.querySelectorAll('button')].filter(__dvis).find(b => new RegExp(src).test(__dtx(b))); if (!b) throw new Error('no ' + src + ' in row ' + n); b.click(); }, [name, m.source]); await wait(600); },
    closeDialog: async () => { await pg.keyboard.press('Escape'); await wait(400); },
    openFeedback: async () => { await ui.tap(/^Send feedback$/, 'footer'); await wait(500); },
    /** the share image dialog: returns {image size, picker choices} */
    shareCard: () => ev(() => { const d = [...document.querySelectorAll('[role=dialog]')].filter(__dvis).find(d => d.querySelector('img,canvas')); if (!d) return null; const i = d.querySelector('img,canvas');
      return {w: i.naturalWidth || i.width, h: i.naturalHeight || i.height, src: (i.src || '').slice(0, 40), text: __dtx(d)}; }),
    shareImageData: () => ev(() => { const d = [...document.querySelectorAll('[role=dialog]')].filter(__dvis).find(d => d.querySelector('img,canvas')); const i = d && d.querySelector('img,canvas'); return i ? (i.src || (i.toDataURL && i.toDataURL()) || '').slice(-400) : null; }),
    /** average brightness of the share image (0 dark .. 1 light) */
    shareImageBrightness: () => ev(async () => { const d = [...document.querySelectorAll('[role=dialog]')].filter(__dvis).find(d => d.querySelector('img,canvas')); const i = d && d.querySelector('img,canvas'); if (!i) return null;
      if (i.complete === false) await new Promise(r => i.onload = r); const c = document.createElement('canvas'); c.width = 60; c.height = 60; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 60, 60);
      const p = x.getImageData(0, 0, 60, 60).data; let s = 0; for (let k = 0; k < p.length; k += 4) s += (p[k] + p[k + 1] + p[k + 2]) / 3; return s / (p.length / 4) / 255; }),

    // ---------------- Pokémon info sheet ----------------
    /** tap a Pokémon (by display name or id) on the shown page */
    openPokemon: async name => { await ev(new Function('n', `const p = ${pane}; const els = [...p.querySelectorAll('[data-lt]')].filter(__dvis);
        const e = els.find(e => e.dataset.lt === n) || els.find(e => (e.getAttribute('aria-label') || '').startsWith(n + ',') || (e.getAttribute('aria-label') || '').startsWith(n + ':')) || els.find(e => __dtx(e).includes(n));
        if (!e) throw new Error('no tappable ' + n); e.scrollIntoView({block: 'center'}); e.focus && e.focus(); e.click();`), name);
      await until(() => D.sheetIsOpen()); await wait(400); },
    /** the first tappable Pokémon on the shown page (in `within`) */
    firstPokemon: within => ev(new Function('w', `const p = ${pane}; const e = [...p.querySelectorAll((w ? w + ' ' : '') + '[data-lt]')].filter(__dvis)[0]; return e ? e.dataset.lt : null;`), within || ''),
    pokemonOnPage: () => ev(new Function(`const p = ${pane}; return [...new Set([...p.querySelectorAll('[data-lt]')].filter(__dvis).map(e => e.dataset.lt))];`)),
    sheetIsOpen: () => ev(() => __dvis(document.querySelector('#lairSheet .lspanel'))),
    sheetName: () => ev(() => __dtx(document.querySelector('#lairSheet .lsname h3'))),
    sheetText: () => ev(() => __dtx(document.querySelector('#lairSheet .lspanel'))),
    /** the big rating number on the sheet */
    sheetRating: () => ev(() => { const s = document.querySelector('#lairSheet'); const b = [...s.querySelectorAll('.lsring b, .ar-shero-big, .chlsr b')].find(__dvis) || s.querySelector('.lsring b'); return b ? Number(__dtx(b) || b.textContent) : null; }),
    sheetFocusInside: () => ev(() => !!document.activeElement && !!document.activeElement.closest('#lairSheet')),
    /** close the sheet: 'x' | 'backdrop' | 'escape' | 'back' */
    closeSheet: async (how = 'x') => { if (how === 'x') await ev(() => [...document.querySelectorAll('#lairSheet .lsx')].find(__dvis).click()); else if (how === 'backdrop') await pg.mouse.click(4, 4);
      else if (how === 'escape') await pg.keyboard.press('Escape'); else await pg.goBack().catch(() => {}); await until(async () => !(await D.sheetIsOpen())); await wait(300); },
    sheetTabs: () => ev(() => [...document.querySelectorAll('#lairSheet [data-lstab]')].filter(__dvis).map(b => ({name: __dtx(b), on: b.getAttribute('aria-selected') === 'true' || b.classList.contains('on')}))),
    tapSheetTab: async name => { await ev(n => { const b = [...document.querySelectorAll('#lairSheet [data-lstab]')].filter(__dvis).find(b => __dtx(b).toLowerCase().startsWith(n.toLowerCase())); if (!b) throw new Error('no sheet tab ' + n); b.click(); }, name); await wait(400); },
    /** text of the sheet's shown tab panel */
    sheetPanel: () => ev(() => { const s = document.querySelector('#lairSheet'); const ps = [...s.querySelectorAll('[data-lspanel], .lstp, [role=tabpanel]')].filter(__dvis); return ps.length ? ps.map(__dtx).join(' ') : __dtx(s.querySelector('.lspanel')); }),
    tapInSheet: async m => { await ui.tap(m, '#lairSheet .lspanel'); await wait(500); },

    // ---------------- Ratings ----------------
    ratingsSearch: async text => { await pg.fill('#lairQ', ''); await pg.type('#lairQ', text, {delay: 15}); await wait(500); },
    /** the "N of 345 match" line */
    matchCount: () => ev(new Function(`const p = ${pane}; const m = __dtx(p).match(/(\\d+) of (\\d+) match/); return m ? {n: +m[1], of: +m[2]} : null;`)),
    /** the top list: [{id, name, rank, rating}] in screen order (hero first) */
    topList: () => ev(() => [...document.querySelectorAll('[data-pane=ratings] #chHot [data-lt]')].filter(__dvis).map(e => { const a = e.getAttribute('aria-label') || '';
      const m = a.match(/^(.*?), rated (\d+)(?:, #(\d+))?/) || []; const rk = m[3] || ((__dtx(e).match(/#(\d+) of/) || [])[1]); return {id: e.dataset.lt, name: m[1], rating: +m[2], rank: rk ? +rk : null}; })),
    /** board tiles shown: [{id, name, rating, tier}] */
    boardTiles: () => ev(() => [...document.querySelectorAll('[data-pane=ratings] .lboard [data-lt]')].filter(__dvis).map(e => { const t = e.getAttribute('title') || ''; const m = t.match(/^(.*?) · rated (\d+)/) || [];
      return {id: e.dataset.lt, name: m[1] || __dtx(e.querySelector('.ltn')), rating: +(m[2] || __dtx(e.querySelector('.lts'))), tier: (e.closest('.ltier') && __dtx(e.closest('.ltier').querySelector('.ltl b'))) || null, est: !!e.querySelector('.lts.dash, .lts.est') || /estimate/.test(t)}; })),
    boardRows: () => ev(() => [...document.querySelectorAll('[data-pane=ratings] .lboard .ltier')].filter(__dvis).map(r => ({tier: __dtx(r.querySelector('.ltl b')), head: __dtx(r.querySelector('.ltd')), tiles: r.querySelectorAll('[data-lt]').length, more: __dtx([...r.querySelectorAll('button.more, [data-ltier]')].find(__dvis))}))),
    tapTierMore: async tier => { await ev(t => { const b = [...document.querySelectorAll(`[data-pane=ratings] [data-ltier="${t}"]`)].find(__dvis); if (!b) throw new Error('no more button on tier ' + t); b.click(); }, tier); await wait(500); },
    openFilter: async () => { if (!(await ev(() => __dvis(document.querySelector('#lairTypes'))))) { await pg.click('[data-pane=ratings] .ar-lfilt'); await wait(400); } },
    filterLabel: () => ev(() => __dtx(document.querySelector('[data-pane=ratings] .ar-lfilt'))),
    tapFilterChip: async name => { await ev(n => { const b = [...document.querySelectorAll('#lairTypes button, #lairFlags button, [data-pane=ratings] button')].filter(__dvis).find(b => __dtx(b) === n); if (!b) throw new Error('no chip ' + n); b.click(); }, name); await wait(500); },
    filterChips: () => ev(() => [...document.querySelectorAll('#lairTypes button, #lairFlags button')].filter(__dvis).map(b => ({name: __dtx(b), on: b.getAttribute('aria-pressed') === 'true'}))),
    /** a Pokémon's displayed rating on the Ratings page (top list, else the board) */
    ratingOnRatings: async name => { const t = (await D.topList()).find(r => r.name === name || r.id === name); if (t) return t.rating;
      if (!(await D.foldIsOpen('Every Pokémon, by Tier'))) await D.toggleFold('Every Pokémon, by Tier');
      await D.ratingsSearch(name); const b = (await D.boardTiles()).find(r => r.name === name || r.id === name); await D.ratingsSearch(''); return b ? b.rating : null; },

    // ---------------- Usage ----------------
    usageSources: () => ev(() => [...document.querySelectorAll('[data-pane=meta] [data-src]')].filter(__dvis).map(b => ({name: __dtx(b), on: b.getAttribute('aria-pressed') === 'true', disabled: b.disabled}))),
    chooseUsageSource: async name => { await ev(n => { const b = [...document.querySelectorAll('[data-pane=meta] [data-src]')].filter(__dvis).find(b => __dtx(b) === n); if (!b) throw new Error('no source ' + n); b.click(); }, name); await wait(700); },
    usageSourceLine: () => ev(() => __dtx(document.querySelector('#metaSource'))),
    usageRows: () => ev(() => [...document.querySelectorAll('[data-pane=meta] details.mrow')].filter(__dvis).map(d => ({rank: +__dtx(d.querySelector('.rk')), name: (d.querySelector('.nm').firstChild.textContent || '').trim(), text: __dtx(d.querySelector('summary'))}))),
    usageSearch: async text => { await pg.fill('#chMetaQ', ''); await pg.type('#chMetaQ', text, {delay: 15}); await wait(500); },
    openUsageRow: async name => { await ev(n => { const d = [...document.querySelectorAll('[data-pane=meta] details.mrow')].filter(__dvis).find(d => (d.querySelector('.nm').firstChild.textContent || '').trim() === n); if (!d) throw new Error('no usage row ' + n); d.querySelector('summary').click(); }, name); await wait(500); },
    usageRowText: name => ev(n => { const d = [...document.querySelectorAll('[data-pane=meta] details.mrow')].filter(__dvis).find(d => (d.querySelector('.nm').firstChild.textContent || '').trim() === n); return d ? __dtx(d) : null; }, name),
    tapRestOfList: async () => { await pg.click('#chMetaMore'); await wait(500); },

    // ---------------- Popular Sets ----------------
    lookUpSets: async name => { await pg.fill('#setMonIn', ''); await pg.type('#setMonIn', name, {delay: 20}); await wait(400);
      const picked = await ev(n => { const o = [...document.querySelectorAll('[role=option]')].filter(__dvis).find(o => __dtx(o).toLowerCase().startsWith(n.toLowerCase())); if (o) { o.dispatchEvent(new MouseEvent('mousedown', {bubbles: true})); o.click(); return true; } return false; }, name);
      if (!picked) await pg.press('#setMonIn', 'Enter'); await wait(600); },
    setsShowing: () => ev(() => { const p = document.querySelector('[data-pane=sets]'); const h = [...p.querySelectorAll('h2,h3,.sname,.ar-h,.cht,b')].filter(__dvis).map(__dtx); return __dtx(p); }),
    setsTeamRow: () => ev(() => [...document.querySelectorAll('[data-pane=sets] [data-setmon].ar-art')].filter(__dvis).map(b => ({id: b.dataset.setmon, on: b.getAttribute('aria-pressed') === 'true'}))),
    tapSetsTeam: async id => { await pg.click(`[data-pane=sets] [data-setmon="${id}"].ar-art`); await wait(600); },
    setsSources: () => ev(() => [...document.querySelectorAll('[data-pane=sets] [data-setsrc]')].filter(__dvis).map(b => ({name: __dtx(b), on: b.getAttribute('aria-pressed') === 'true'}))),
    chooseSetsSource: async name => { await ev(n => { const b = [...document.querySelectorAll('[data-pane=sets] [data-setsrc]')].filter(__dvis).find(b => __dtx(b) === n); if (!b) throw new Error('no source ' + n); b.click(); }, name); await wait(600); },
    /** "S tier, rated 94" pill on Popular Sets -> 94 */
    setsRating: () => ev(() => { const m = __dtx(document.querySelector('[data-pane=sets]')).match(/[SABCDF] tier, rated (\d+)/); return m ? +m[1] : null; }),

    // ---------------- Winning Teams ----------------
    teamSearch: async (text, enter = true) => { await pg.fill('#tsIn', ''); await pg.type('#tsIn', text, {delay: 20}); await wait(500); if (enter) { await pg.press('#tsIn', 'Enter'); await wait(600); } },
    teamSearchSuggestions: () => ev(() => [...document.querySelectorAll('[role=option]')].filter(__dvis).map(__dtx)),
    teamSearchMenuText: () => ev(() => { const l = [...document.querySelectorAll('[role=listbox]')].filter(__dvis).pop(); return l ? __dtx(l) : null; }),
    filterChipsTop: () => ev(() => [...document.querySelectorAll('[data-pane=top] [data-tsx]')].filter(__dvis).map(b => __dtx(b.closest('.chip, span, div') || b))),
    teamCards: () => ev(() => [...document.querySelectorAll('[data-pane=top] [data-ttask], [data-pane=top] [data-evask], [data-pane=top] [data-evload], [data-pane=events] [data-evload], [data-pane=events] [data-evask]')].filter(__dvis).length),
    // ---------------- Events ----------------
    chooseEventFilter: async name => { await ev(n => { const b = [...document.querySelectorAll('[data-pane=events] [data-evf]')].filter(__dvis).find(b => __dtx(b) === n); if (!b) throw new Error('no filter ' + n); b.click(); }, name); await wait(600); },
    eventCards: () => ev(() => [...document.querySelectorAll('[data-pane=events] [data-evopen]')].filter(__dvis).filter(b => !b.classList.contains('linkbtn')).map(b => __dtx(b))),
    openEvent: async m => { await ev(m => { const b = [...document.querySelectorAll('[data-pane=events] [data-evopen], [data-wkev]')].filter(__dvis).find(b => __dtx(b).includes(m)); if (!b) throw new Error('no event ' + m); b.click(); }, m); await wait(800); },

    // ---------------- more helpers used by the D tests ----------------
    /** move keyboard focus onto a Pokémon row (as a keyboard user tabbing to it) */
    focusPokemon: async name => { await ev(new Function('n', `const p = ${pane}; const e = [...p.querySelectorAll('[data-lt]')].filter(__dvis).find(e => e.dataset.lt === n || (e.getAttribute('aria-label') || '').startsWith(n + ','));
      if (!e) throw new Error('no row ' + n); e.scrollIntoView({block: 'center'}); e.focus();`), name); await wait(150); },
    focusIsPokemon: id => ev(i => { const a = document.activeElement; return !!a && !!a.closest && !!a.closest(`[data-lt="${i}"]`); }, id),
    hasFavicon: () => ev(() => [...document.querySelectorAll('link[rel~=icon]')].length > 0),
    /** font of the page's big headline */
    headlineFont: () => ev(new Function(`const p = ${pane}; const h = [...p.querySelectorAll('h1,h2,.ar-h,.chpt,.cht')].find(__dvis); if (!h) return null; const s = getComputedStyle(h); return {family: s.fontFamily, style: s.fontStyle, text: __dtx(h)};`)),
    logoShown: () => ev(() => [...document.querySelectorAll('header [aria-label="NastyPlot"], header .ar-logo, header .nplk')].some(__dvis)),
    healthNote: () => ev(() => { const e = document.querySelector('#healthBar'); return __dvis(e) && __dtx(e) ? __dtx(e) : null; }),
    regBanner: () => ev(() => { const e = document.querySelector('#regBar'); return __dvis(e) && __dtx(e) ? __dtx(e) : null; }),
    /** is the fold / heading with this title within the window? */
    inView: m => ev(m => { const l = m.toLowerCase(); const e = [...document.querySelectorAll('details, h2, h3, h4, .cht')].filter(__dvis).find(d => __dtx(d.matches('details') ? d.querySelector('summary') : d).toLowerCase().includes(l))
        || [...document.querySelectorAll('[data-pane]:not([hidden]) *')].filter(x => x.children.length <= 2 && __dvis(x)).find(x => __dtx(x).toLowerCase().startsWith(l));
      if (!e) return false; const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top > -60 && r.top < innerHeight - 40; }, m),
    anyOpenInView: () => ev(() => [...document.querySelectorAll('[data-pane=method] details[open]')].filter(__dvis).some(d => { const r = d.getBoundingClientRect(); return r.bottom > 40 && r.top > -60 && r.top < innerHeight - 40; })),
    toastHasUndo: () => ev(() => __dvis(document.querySelector('#toastUndo'))),
    /** apply the first suggestion on the shown page */
    applySuggestion: async () => { const before = JSON.stringify(await ui.team()); for (let k = 0; k < 3; k++) {
      await until(() => ev(new Function(`const p = ${pane}; return [...p.querySelectorAll('button')].filter(__dvis).some(b => /^Apply$/.test(__dtx(b)) && !b.disabled);`)), 8000); await ev(new Function(`const p = ${pane}; const b = [...p.querySelectorAll('button')].filter(__dvis).find(b => /^Apply$/.test(__dtx(b)) && !b.disabled); if (!b) throw new Error('no suggestion to apply'); b.click();`)); if (await until(async () => JSON.stringify(await ui.team()) !== before, 4000)) break; } await wait(1200); },
    tapUndoBar: async () => { await pg.click('[data-undobar]:visible'); await wait(600); },
    tipCount: () => ev(() => document.querySelectorAll('#tipPop').length),
    /** visible text of the Ratings top list */
    hotText: () => ev(() => __dtx(document.querySelector('[data-pane=ratings] #chHot'))),
    /** has the sliding highlight moved under this choice? */
    sliderMoved: name => ev(n => { const b = [...document.querySelectorAll('[aria-pressed="true"]')].filter(__dvis).find(b => __dtx(b) === n); const g = b && b.closest('.ar-slide'); if (!g) return false;
      const pill = g.querySelector('.ar-slpill'); if (!pill) return false; const i = [...g.querySelectorAll('button')].indexOf(b); return +getComputedStyle(g).getPropertyValue('--i') === i || g.dataset.sli === String(i); }, name),
    /** open every "+N more" on the tier board */
    showWholeBoard: async () => { for (let k = 0; k < 8; k++) { const did = await ev(() => { const b = [...document.querySelectorAll('[data-pane=ratings] .lboard [data-ltier]')].filter(__dvis).find(b => /more/.test(__dtx(b))); if (b) { b.click(); return true; } return false; }); if (!did) break; await wait(250); } },
    typeFeedback: async text => { const ta = (await pg.$$('[role=dialog] textarea')).pop(); await ta.fill(''); await ta.type(text, {delay: 5}); await wait(200); },
    /** what the fake account stored for this viewer's feedback / usage counts */
    savedFeedback: () => pg.evaluate(() => window.__acct['feedback/u_test'] || null),
    savedUsage: () => pg.evaluate(() => window.__acct['usage/u_test'] || null),
    /** the player switches to another tab (the page saves what it was holding) */
    leaveTab: async () => { await pg.evaluate(() => { Object.defineProperty(document, 'visibilityState', {value: 'hidden', configurable: true}); Object.defineProperty(document, 'hidden', {value: true, configurable: true}); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); }); await wait(800); },
    /** the code in the player's own team link / box link (what "Copy team link" / "Copy box link" would give) */
    teamLinkCode: () => ui.peek('teamCode()'),
    boxLinkCode: () => ui.peek('boxCode()'),
    allowClipboard: async () => { try { await pg.context().grantPermissions(['clipboard-read', 'clipboard-write']); } catch (e) {} await pg.evaluate(() => { window.__clip = null; try { const w = navigator.clipboard.writeText.bind(navigator.clipboard); navigator.clipboard.writeText = t => { window.__clip = t; return w(t).catch(() => {}); }; } catch (e) {} }); },
    /** text copied for Showdown (clipboard, or the copy-by-hand dialog) */
    showdownText: () => pg.evaluate(() => { if (window.__clip) return window.__clip; const d = [...document.querySelectorAll('[role=dialog] textarea, [role=dialog] pre')].find(e => e.getClientRects().length); return d ? (d.value || d.textContent) : null; }),
    /** tap Save image; returns the offered file name */
    saveShareImage: async () => { const dl = pg.waitForEvent('download', {timeout: 5000}).catch(() => null); await D.tapInDialog(/^Save image$/); const f = await dl; return f ? f.suggestedFilename() : await D.toastText(); },
    /** is the Darkrai picture shown (within) */
    mascotShown: (within = '[data-pane]:not([hidden])') => ev(w => { const m = window.NP_MASCOT; return [...document.querySelectorAll(w + ' img')].filter(__dvis).some(i => (m && i.src === m) || /darkrai|mascot|dk/i.test(i.className + ' ' + (i.parentElement && i.parentElement.className))); }, within),
    /** two taps on a sheet button, 80 ms apart */
    doubleTapInSheet: async m => { const b = await pg.evaluateHandle(src => { const re = new RegExp(src); return [...document.querySelectorAll('#lairSheet button')].find(b => b.getClientRects().length && re.test(b.innerText.trim())); }, m.source);
      const el = b.asElement(); if (!el) throw new Error('no ' + m); const r = await el.boundingBox(); await pg.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await wait(80); await pg.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await wait(600); },
    chipTop: name => ev(n => { const b = [...document.querySelectorAll('#lairTypes button, #lairFlags button')].filter(__dvis).find(b => __dtx(b) === n); return b ? Math.round(b.getBoundingClientRect().top) : null; }, name),
    /** animations running now (page fade, foil shimmer), ignoring zero-length ones */
    runningAnimations: () => pg.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && (a.effect && a.effect.getTiming().duration > 0)).map(a => (a.animationName || a.transitionProperty || 'anim') + ':' + (a.effect.target && a.effect.target.className || '').toString().slice(0, 30))),
    /** sprite + colour field for each Pokémon on the Ratings page */
    pokemonArt: () => ev(() => [...document.querySelectorAll('[data-pane=ratings] #chHot [data-lt], [data-pane=ratings] .lboard [data-lt]')].filter(__dvis).map(e => { const s = e.getAttribute('style') || '';
      return {id: e.dataset.lt, sprite: !!e.querySelector('img.spr[src*="sp/"]') || /sp\/\d+/.test(getComputedStyle(e).backgroundImage), field: /--a:|--ta:|--t1:/.test(s), mega: e.classList.contains('ar-ismega') || e.classList.contains('is-mega') || !!e.querySelector('.ar-ismega, .is-mega')}; })),
    /** the sheet fits the window: panel inside it, no text cut off at the side, and no sideways scrolling for the player */
    sheetFits: () => ev(() => { const p = document.querySelector('#lairSheet .lspanel'); const r = p.getBoundingClientRect(); const ox = getComputedStyle(p).overflowX;
      const cut = [...p.querySelectorAll('*')].filter(e => __dvis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).filter(e => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 || b.left < -1; });
      return r.left >= -1 && r.right <= innerWidth + 1 && !cut.length && (p.scrollWidth <= p.clientWidth + 2 || ox === 'hidden' || ox === 'clip'); }),
    /** "Brought with" partners on the sheet's Meta tab (ids) */
    broughtWith: () => ev(() => { const s = document.querySelector('#lairSheet'); const h = [...s.querySelectorAll('*')].filter(__dvis).find(e => e.children.length < 3 && /^Brought with/.test(__dtx(e))); let box = h; while (box && box.querySelectorAll('[data-lt]').length === 0) box = box.parentElement;
      return box ? [...box.querySelectorAll('[data-lt]')].filter(__dvis).map(e => e.dataset.lt).slice(0, 6) : []; }),
    outsideLinksNewTab: () => ev(() => { const a = [...document.querySelectorAll('#lairSheet a[href^="http"]')].filter(__dvis); return a.length > 0 && a.every(x => x.target === '_blank'); }),
    restButtonShown: () => ev(() => __dvis(document.querySelector('#chMetaMore'))),
    topSearchChips: () => ev(() => [...document.querySelectorAll('[data-pane=top] [data-tsx]')].filter(__dvis).filter(b => b.dataset.tsx !== '*').map(b => __dtx(b.parentElement).replace(/\s*×$/, '')).join('|')),
    tapOftenWith: async () => { await ev(() => { const b = [...document.querySelectorAll('[data-pane=top] [data-tsadd]')].filter(__dvis)[0]; if (!b) throw new Error('no Often with chip'); b.click(); }); await wait(600); },
    /** Events calendar: head, rows {text, countdownOk}, whether rows open a new tab */
    calendar: () => ev(() => { const box = document.querySelector('[data-pane=events] .calbox'); if (!box) return {head: '', rows: []}; const rows = [...box.querySelectorAll('.calrow')].filter(__dvis);
      const t0 = new Date(); t0.setHours(0, 0, 0, 0);
      return {head: __dtx(box).slice(0, 80), newTab: rows.filter(r => r.tagName === 'A').every(r => r.target === '_blank'), rows: rows.map(r => { const day = +__dtx(r.querySelector('.calday b')), mon = __dtx(r.querySelector('.calday span')), w = __dtx(r.querySelector('.calcd'));
        let d = new Date(`${mon} ${day}, ${t0.getFullYear()} 12:00`); if (d - t0 < -200 * 864e5) d = new Date(`${mon} ${day}, ${t0.getFullYear() + 1} 12:00`); const n = Math.round((d.setHours(0, 0, 0, 0) - t0) / 864e5);
        const ok = n <= 0 ? /Live now/i.test(w) : n === 1 ? /Tomorrow/i.test(w) : new RegExp(`in ${n} days`).test(w); return {text: __dtx(r), countdownOk: ok}; })}; }),
    /** number of placing cards in an open event */
    placings: () => ev(() => [...document.querySelectorAll('[data-pane=events] button')].filter(__dvis).filter(b => /^Load team$|Tap again/.test(__dtx(b))).length),
    tapWinner: async () => { await ev(() => { const b = [...document.querySelectorAll('[data-wkev]')].find(__dvis); if (!b) throw new Error('no winner row'); b.click(); }); await wait(900); },
    kindMarkers: () => ev(() => [...document.querySelectorAll('[data-pane=weekly] .kind')].filter(__dvis).map(k => ({word: __dtx(k), icon: !!k.querySelector('svg')}))),
    hasChart: () => ev(() => [...document.querySelectorAll('[data-pane=track] svg')].filter(__dvis).some(s => s.querySelectorAll('path,polyline,line').length > 4)),
    /** number of rows inside a fold */
    foldRows: m => ev(m => { const d = [...document.querySelectorAll('details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).includes(m)); if (!d) return null; const b = d.querySelector('.chbody') || d;
      const kids = [...b.querySelectorAll('li, tr, .trev, .trrow')].filter(__dvis); return kids.length; }, m),
    methodSections: () => ev(() => [...document.querySelectorAll('[data-pane=method] details[data-chf^="np_"]')].filter(__dvis).map(d => __dtx(d.querySelector('.cht')))),
    /** source names listed in How We Calculate's "Usage, Sets and Sources" */
    methodSourceNames: () => ev(() => { const d = [...document.querySelectorAll('[data-pane=method] details')].find(d => /Usage, Sets and Sources/.test(__dtx(d.querySelector('summary')))); if (!d) return [];
      return [...new Set([...d.querySelectorAll('b, dt, strong, th')].filter(__dvis).map(__dtx).filter(s => s && s.length < 40 && /^[A-Z0-9a-z]/.test(s)).map(s => s.replace(/[:,.].*$/, '').trim()))]; }),
    /** is any email address in the page? (checks for a mailto link or an @ in an About text node; never reads the address out) */
    emailInPage: () => pg.evaluate(() => !!document.querySelector('a[href^="mailto:"]') || /[A-Za-z0-9._-]+@[A-Za-z0-9-]+\.[a-z]{2,}/.test((document.querySelector('[data-pane=about]') || document.body).innerText)),
    emailShown: () => ev(() => { const a = [...document.querySelectorAll('a[href^="mailto:"]')].find(__dvis); return {mailto: !!a, at: !!a && __dtx(a).includes('@'), copy: [...document.querySelectorAll('[data-pane=about] button')].filter(__dvis).some(b => __dtx(b) === 'Copy')}; }),
    /** look for the rules caption on the pages that make legality statements */
    findRulesCaption: async () => { await ui.go('My Team'); try { await ui.tap(/^Import/); } catch (e) {} if (await ui.sees('Based on our reading of the Reg M-C rules')) return 'My Team import';
      for (const p of ['Type Chart', 'Speed Tiers', 'Damage Calc']) { await ui.go(p); if (await ui.sees('Based on our reading of the Reg M-C rules')) return p; } return null; },
  };
  return {D};
};
