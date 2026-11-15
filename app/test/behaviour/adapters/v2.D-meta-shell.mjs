// Group D (Meta pages and the site shell) for the NEW site (Nov 14). Same helper names as current.D-meta-shell.mjs, reached as ui.D.*.
// Built so far: Meta > Pokémon > Rating (src/v2/pages/meta.js, Sim's approved Meta mock-up). Translation notes for the RATE tests:
//  - Nov 14, The Grandstand (Sim's pick): "Top of the ratings" (today's hot list) is the stand: every tier at once, in rating order.
//  - "Every Pokémon, by Tier" (today a fold) is the "List with win rates" view: the list by tier, each tier its first 12 + "+N more" / "Show fewer".
//  - "Details" (today a button that shows win % and games) is the same "List with win rates" switch.
//  - Search, types, hidden gems and the box show the list; Megas / No Megas filter the stand.
// Every helper for a page or feature the new site doesn't have yet names itself as missing (never a silent pass).
const NOT = w => { throw new Error('not in v2 yet: ' + w); };
export default (ui, pg) => {
  const ev = (fn, arg) => pg.evaluate(([src, a]) => {
    window.__dvis = window.__dvis || (e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0.05);
    window.__dtx = window.__dtx || (e => e ? (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim() : '');
    return (0, eval)('(' + src + ')')(a); }, [fn.toString(), arg]);
  const wait = ms => pg.waitForTimeout(ms);
  const until = async (fn, ms = 4000, step = 100) => { const t = Date.now(); let v; while (Date.now() - t < ms) { v = await fn(); if (v) return v; await wait(step); } return v; };
  const rowsOf = sel => ev(sel => [...document.querySelectorAll(sel)].filter(__dvis).map(e => { const a = e.getAttribute('aria-label') || '', m = a.match(/^(.*?), rated (\d+)(?:, number (\d+))?/) || [];
    let t = e.closest('[data-tier]'); if (!t || !t.matches('section')) { let s = e.previousElementSibling; while (s && !s.matches('.ra-tier')) s = s.previousElementSibling; t = s; }
    return {id: e.dataset.v2mon, name: m[1], rating: +m[2], rank: m[3] ? +m[3] : null, tier: t ? t.dataset.tier : null}; }), sel);
  const D = {
    until,
    // ---------------- Winning Teams (Nov 14, The Winning Hands: src/v2/pages/winning.js) ----------------
    // Translation: today's team cards = the hands and rows (each has one Load team / Replace button); the search box keeps today's id #tsIn.
    teamSearch: async (text, enter = true) => { await pg.fill('#tsIn', ''); await pg.type('#tsIn', text, {delay: 20}); await wait(500); if (enter) { await pg.press('#tsIn', 'Enter'); await wait(600); } },
    teamSearchSuggestions: () => ev(() => [...document.querySelectorAll('.wt [role=option]')].filter(__dvis).map(__dtx)),
    teamSearchMenuText: () => ev(() => { const l = [...document.querySelectorAll('.wt [role=listbox]')].filter(__dvis).pop(); return l ? __dtx(l) : null; }),
    topSearchChips: () => ev(() => [...document.querySelectorAll('.wt [data-tsx]')].filter(__dvis).filter(b => b.dataset.tsx !== '*').map(b => __dtx(b.parentElement).replace(/\s*×$/, '')).join('|')),
    tapOftenWith: async () => { await ev(() => { const b = [...document.querySelectorAll('.wt [data-tsadd]')].filter(__dvis)[0]; if (!b) throw new Error('no Often with chip'); b.click(); }); await wait(600); },
    teamCards: () => ev(() => [...document.querySelectorAll('.wt [data-wtask], .wt [data-wtload], .wt [data-hmload]')].filter(__dvis).length),
    toastHasUndo: () => ev(() => __dvis(document.querySelector('#toastUndo'))),
    // ---------------- Ratings ----------------
    ratingsSearch: async text => { await pg.fill('[data-raq]', text); await wait(500); },
    matchCount: () => ev(() => { const m = __dtx(document.querySelector('.ra-count')).match(/(\d+) of (\d+) match/); return m ? {n: +m[1], of: +m[2]} : null; }),
    /** the top of the ratings (only while nothing is searched or filtered and the full list is closed) */
    topList: async () => (await ev(() => /match/.test(__dtx(document.querySelector('.ra-count'))) || !!document.querySelector('.ra-board'))) ? [] : rowsOf('.gs .gs-mon'),
    /** every row shown when searching / filtering or in the full list: [{id, name, rating, tier}] */
    boardTiles: async () => (await ev(() => /match/.test(__dtx(document.querySelector('.ra-count'))) || !!document.querySelector('.ra-board'))) ? rowsOf('.ra-list .ra-row, .gs .gs-mon') : [],
    boardRows: () => ev(() => [...document.querySelectorAll('.ra-board .ra-tg')].filter(__dvis).map(s => ({tier: s.querySelector('.ra-tier').dataset.tier, head: __dtx(s.querySelector('.ra-tier span')), tiles: s.querySelectorAll('.ra-row').length, more: __dtx(s.querySelector('[data-ratier]'))}))),
    tapTierMore: async tier => { await ev(t => { const b = [...document.querySelectorAll(`[data-ratier="${t}"]`)].find(__dvis); if (!b) throw new Error('no more button on tier ' + t); b.click(); }, tier); await wait(500); },
    showWholeBoard: async () => { for (const T of ['S', 'A', 'B', 'C', 'D', 'F']) { const shut = await ev(t => { const b = document.querySelector(`[data-ratier="${t}"]`); return !!b && b.getAttribute('aria-expanded') !== 'true'; }, T); if (shut) await D.tapTierMore(T); } },
    openFilter: async () => { if (!(await ev(() => __dvis(document.querySelector('.ra-types'))))) { await pg.click('[data-ratypes]'); await wait(400); } },
    filterLabel: () => ev(() => __dtx(document.querySelector('[data-ratypes]'))),
    tapFilterChip: async name => { await ev(n => { const bs = [...document.querySelectorAll('[data-raty], [data-raflag]')].filter(__dvis), clean = b => __dtx(b).replace(/^◆\s*/, '').replace(/\s+\d+$/, '');
      const b = bs.find(b => __dtx(b) === n) || bs.find(b => clean(b) === n.replace(/^◆\s*/, '')); if (!b) throw new Error('no chip ' + n); b.click(); }, name); await wait(500); },
    filterChips: () => ev(() => [...document.querySelectorAll('[data-raty], [data-raflag]:not([data-raflag="all"]):not([data-raflag="clear"])')].filter(__dvis).map(b => ({name: __dtx(b).replace(/^◆\s*/, '').replace(/\s+\d+$/, ''), on: b.getAttribute('aria-pressed') === 'true'}))),
    hotText: () => ev(() => [...document.querySelectorAll('.ra-list, .gs')].filter(__dvis).map(l => __dtx(l) + ' ' + [...l.querySelectorAll('.ra-row, .gs-mon')].map(r => r.getAttribute('aria-label')).join(' ')).join(' ')),
    tapDetails: async () => { await pg.click('[data-raview="list"]'); await wait(500); },
    /** tap a Pokémon by id (Ratings: its row on the list or the stand; any other page: any tappable Pokémon, by id or by the name its label starts with) */
    openPokemon: async id => { await ev(n => { let e = [...document.querySelectorAll('.ra-list [data-v2mon], .gs [data-v2mon]')].filter(__dvis).find(e => e.dataset.v2mon === n);
        if (!e) { const els = [...document.querySelectorAll('#main [data-v2mon]')].filter(__dvis), al = e => e.getAttribute('aria-label') || '';
          e = els.find(e => e.dataset.v2mon === n) || els.find(e => al(e).startsWith(n + ',') || al(e).startsWith(n + ':')); if (e) e.scrollIntoView({block: 'center'}); }
        if (!e) throw new Error('no row ' + n); e.click(); }, id); await until(() => D.sheetIsOpen()); await wait(400); },
    sheetIsOpen: () => ev(() => __dvis(document.querySelector('.np-sheet .ms2'))),
    sheetName: () => ev(() => __dtx(document.querySelector('.np-sheet .ms2 h2'))),
    // folds: "Every Pokémon, by Tier" is the See all switch; the rest are real folds (details) on the page
    foldIsOpen: m => /every pokémon, by tier/i.test(m) ? ev(() => !!document.querySelector('.ra-board')) : ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? d.open : null; }, m),
    toggleFold: async m => { if (/every pokémon, by tier/i.test(m)) { const on = await ev(() => !!document.querySelector('.ra-board')); await pg.click(on ? '[data-raview="stand"]' : '[data-raview="list"]'); await wait(500); return; }
      await ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); if (!d) throw new Error('no fold ' + m); d.querySelector('summary').click(); }, m); await wait(500); },
    foldText: m => ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? __dtx(d) : null; }, m),
    /** is the section whose heading or summary holds m on screen (Nov 15: How We Calculate and About are built) */
    inView: m => ev(m => { const re = m.toLowerCase(); const e = [...document.querySelectorAll('#main summary, #main h2, #main h3')].filter(__dvis).find(x => __dtx(x).toLowerCase().includes(re)); if (!e) return false; const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, m),
    anyOpenInView: () => ev(() => [...document.querySelectorAll('#main details[open]')].some(d => { const r = d.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; })),
    /** How We Calculate's ten parts, and the sources its Usage, Sets and Sources part names (today's ul.npsrc, shared HTML) */
    methodSections: () => ev(() => [...document.querySelectorAll('#main .inf-tile[data-mth]')].map(d => d.dataset.mth)),
    methodSourceNames: () => ev(() => { const d = document.querySelector('#main .inf-tile[data-mth="data"]'); return d ? [...d.querySelectorAll('ul.npsrc > li > b')].map(__dtx).filter(Boolean) : []; }),
    /** any email address in the page? (a mailto link or an @ in the page text; never reads the address out) */
    emailInPage: () => ev(() => !!document.querySelector('a[href^="mailto:"]') || /[A-Za-z0-9._-]+@[A-Za-z0-9-]+\.[a-z]{2,}/.test((document.querySelector('#main') || document.body).innerText)),
    emailShown: () => ev(() => { const a = [...document.querySelectorAll('a[href^="mailto:"]')].find(__dvis); return {mailto: !!a, at: !!a && __dtx(a).includes('@'), copy: [...document.querySelectorAll('#main button')].filter(__dvis).some(b => __dtx(b) === 'Copy')}; }),
    footerText: () => ev(() => __dtx(document.querySelector('footer'))),
    // ---------------- Popular Sets (Nov 14, Grandstand brief section 5): spotlight + "Your team" bench + "How <Pokémon> is built" ----------------
    lookUpSets: async name => { await pg.fill('[data-stq]', name); await wait(500); await ev(n => { const bs = [...document.querySelectorAll('.st-hits [data-v2setmon]')]; const b = bs.find(b => __dtx(b) === n) || bs[0]; if (!b) throw new Error('no match for ' + n); b.click(); }, name); await wait(600); },
    setsShowing: () => ev(() => [...document.querySelectorAll('.st .gs-spot, .st .us-src, .st .st-how')].filter(__dvis).map(e => e.textContent.replace(/\s+/g, ' ').trim()).join(' ')), /* textContent: the headings are capitals by CSS only */
    setsTeamRow: () => ev(() => [...document.querySelectorAll('.st-six [data-v2setmon]')].filter(__dvis).map(b => ({id: b.dataset.v2setmon, on: b.getAttribute('aria-pressed') === 'true'}))),
    tapSetsTeam: async id => { await pg.click(`.st-six [data-v2setmon="${id}"]`); await wait(600); },
    setsSources: () => ev(() => [...document.querySelectorAll('[data-v2setsrc]')].map(b => ({name: __dtx(b), on: b.getAttribute('aria-pressed') === 'true'}))),
    chooseSetsSource: async name => { await ev(n => { const b = [...document.querySelectorAll('[data-v2setsrc]')].find(b => __dtx(b) === n); if (!b) throw new Error('no source ' + n); b.click(); }, name); await wait(600); },
    // ---------------- Usage (Nov 14, The Podium): the top 10 stand on the podium and benches; tapping one shows "How <Pokémon> is played" ----------------
    usageSourceLine: () => ev(() => __dtx(document.querySelector('.us-src'))),
    usageSources: () => ev(() => [...document.querySelectorAll('[data-ussrc]')].map(b => ({name: __dtx(b), on: b.getAttribute('aria-pressed') === 'true'}))),
    chooseUsageSource: async name => { await ev(n => { const b = [...document.querySelectorAll('[data-ussrc]')].find(b => __dtx(b) === n); if (!b) throw new Error('no source ' + n); b.click(); }, name); await wait(500); },
    usageSearch: async text => { await pg.fill('[data-usq]', text); await wait(500); },
    /** every rank shown, in rank order: [{rank, name, text}] */
    usageRows: () => ev(() => [...document.querySelectorAll('.us [data-uspick]')].filter(__dvis).map(b => ({rank: +(__dtx(b.querySelector('.us-rk')).replace('#', '')), name: __dtx(b.querySelector('.us-tx b')), text: __dtx(b) + ' ' + (b.getAttribute('aria-label') || '')})).sort((a, b) => a.rank - b.rank)),
    restButtonShown: () => ev(() => __dvis(document.querySelector('[data-usrest]'))),
    tapRestOfList: async () => { await pg.click('[data-usrest]'); await wait(500); },
    openUsageRow: async name => { await ev(n => { const b = [...document.querySelectorAll('.us [data-uspick]')].filter(__dvis).find(b => __dtx(b.querySelector('.us-tx b')) === n); if (!b) throw new Error('no usage row ' + n); b.click(); }, name); await wait(600); },
    usageRowText: name => ev(n => { const s = document.querySelector('[data-ushow]'); return s && new RegExp('How ' + n + ' is played').test(__dtx(s)) ? __dtx(s) : ''; }, name),
    tapInUsageRow: async (name, re) => { await ev(([n, src]) => { const s = document.querySelector('[data-ushow]'), r = new RegExp(src.replace(/^\/|\/[a-z]*$/g, ''));
      if (!s || !new RegExp('How ' + n + ' is played').test(__dtx(s))) throw new Error('row not open: ' + n); const b = [...s.querySelectorAll('button, a')].filter(__dvis).find(b => r.test(__dtx(b))); if (!b) throw new Error('no ' + src + ' in ' + n); b.click(); }, [name, re.toString()]); await wait(800); },
    toastText: () => ev(() => { const t = [...document.querySelectorAll('.np-toast')].filter(__dvis).pop(); return t ? __dtx(t) : null; }),
    // ---------------- shared page helpers (Nov 15, for Events, Archetypes, This Week, Track Record) ----------------
    scrollY: () => pg.evaluate(() => Math.round(scrollY)),
    scrollTo: async y => { await pg.mouse.move(640, 400); await pg.evaluate(y => scrollTo(0, y), y); await pg.mouse.wheel(0, 1); await wait(300); },
    /** open the "?" whose label matches (the new build's [data-v2tip] bubbles). Translation: where a page explains with a question fold
     *  instead of a "?" (Events: "What counts as an event?"), that fold is the explainer: it is opened and tipText reads its body. */
    openTip: async m => { const how = await ev(m => { const re = new RegExp(m, 'i'), main = document.querySelector('#main') || document.body;
        const b = [...main.querySelectorAll('[data-v2tip]')].filter(__dvis).find(b => re.test(b.getAttribute('aria-label') || '') || re.test(b.dataset.v2tip));
        if (b) { const r = b.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 60) b.scrollIntoView({block: 'center'}); window.__dtipFold = null; return 'tip'; }
        const d = [...main.querySelectorAll('details')].filter(__dvis).find(d => { const s = __dtx(d.querySelector('summary')); return /\?$/.test(s) && re.test(s); });
        if (!d) throw new Error('no tip ' + m); window.__dtipFold = d; d.querySelector('summary').click(); return 'fold'; }, m);
      if (how === 'tip') { await wait(250); await ev(m => { const re = new RegExp(m, 'i'); [...(document.querySelector('#main') || document.body).querySelectorAll('[data-v2tip]')].filter(__dvis).find(b => re.test(b.getAttribute('aria-label') || '') || re.test(b.dataset.v2tip)).click(); }, m); }
      await wait(350); },
    tipText: () => ev(() => { const t = [...document.querySelectorAll('.sg2-tipop')].filter(__dvis).pop(); if (t) return __dtx(t);
      const d = window.__dtipFold; if (!d || !d.isConnected || !d.open) return null; return [...d.children].filter(e => e.tagName !== 'SUMMARY').map(__dtx).join(' ').trim() || null; }),
    /** the first tappable Pokémon on the shown page (in `within`), and every tappable one */
    firstPokemon: within => ev(w => { const e = [...document.querySelectorAll('#main ' + (w ? w + ' ' : '') + '[data-v2mon]')].filter(__dvis)[0]; return e ? e.dataset.v2mon : null; }, within || ''),
    pokemonOnPage: () => ev(() => [...new Set([...document.querySelectorAll('#main [data-v2mon]')].filter(__dvis).map(e => e.dataset.v2mon))]),
    /** "More" on a folded paragraph inside `within` (today's [data-pane=x] is the new build's #main). The new build's folds show their full
     *  text when open (nothing is clamped): then there is nothing to unfold and this checks that every paragraph is shown whole. */
    tapMore: async (within = 'body', label = 'More') => { await ev(([w, l]) => { w = w.replace(/\[data-pane=[^\]]+\]/g, '#main'); const root = [...document.querySelectorAll(w)].filter(__dvis);
        const b = root.flatMap(r => [...r.querySelectorAll('button,[role=button]')]).filter(__dvis).find(b => __dtx(b) === l); if (b) { b.click(); return; }
        if (!root.length) throw new Error('nothing matches ' + w); const cut = root.flatMap(r => [...r.querySelectorAll('p')]).filter(__dvis).filter(p => p.scrollHeight > p.clientHeight + 2);
        if (cut.length) throw new Error('no ' + l + ' button, and ' + cut.length + ' paragraph(s) are cut short'); }, [within, label]); await wait(300); },
    // ---------------- Events (Nov 15, The Ticket Wall: src/v2/pages/events.js) ----------------
    // Translation: today's event cards = the tickets (the latest result across the wall and the rest; each opens the event's placings).
    eventCards: () => ev(() => [...document.querySelectorAll('#main .ev-wall .tk[data-evgo]')].filter(__dvis).map(__dtx)),
    chooseEventFilter: async name => { await ev(n => { const b = [...document.querySelectorAll('#main [data-evf]')].filter(__dvis).find(b => (b.firstChild ? b.firstChild.textContent : '').trim() === n); if (!b) throw new Error('no filter ' + n); b.click(); }, name); await wait(600); },
    openEvent: async m => { await ev(m => { const b = [...document.querySelectorAll('#main .tk[data-evgo]')].filter(__dvis).find(b => __dtx(b).includes(m)); if (!b) throw new Error('no event ' + m); (b.matches('article') ? b.querySelector('.tk-go') : b).click(); }, m); await wait(800); },
    /** number of placings in an open event (each has one Load Team button, or Replace while its question is asked) */
    placings: () => ev(() => [...document.querySelectorAll('#main .ev-open [data-evask], #main .ev-open [data-evload]')].filter(__dvis).length),
    /** Next Events: head, rows {text, countdownOk}, whether rows open a new tab (same reading as today's calendar helper) */
    calendar: () => ev(() => { const box = document.querySelector('#main .ev-plate'), h = box && box.querySelector('.ev-ph'); if (!h) return {head: '', rows: []};
      const rows = [...box.querySelectorAll('.ev-cal .ev-crow')].filter(__dvis), t0 = new Date(); t0.setHours(0, 0, 0, 0);
      const head = [h, ...[...box.children].slice([...box.children].indexOf(h) + 1)].map(__dtx).join(' ').slice(0, 80);
      return {head, newTab: rows.filter(r => r.tagName === 'A').every(r => r.target === '_blank'), rows: rows.map(r => { const day = +r.querySelector('.ev-cd b').textContent.trim(), mon = r.querySelector('.ev-cd small').textContent.trim(), w = __dtx(r.querySelector('.ev-cw'));
        let d = new Date(`${mon} ${day}, ${t0.getFullYear()} 12:00`); if (d - t0 < -200 * 864e5) d = new Date(`${mon} ${day}, ${t0.getFullYear() + 1} 12:00`); const n = Math.round((d.setHours(0, 0, 0, 0) - t0) / 864e5);
        const ok = n <= 0 ? /Live now/i.test(w) : n === 1 ? /Tomorrow/i.test(w) : new RegExp(`in ${n} days`).test(w); return {text: __dtx(r), countdownOk: ok}; })}; }),
    // ---------------- This Week (Nov 15, The Front Page: src/v2/pages/thisweek.js) ----------------
    /** the share image in the open share sheet (today's dialog): its size once drawn */
    shareCard: () => ev(() => { const s = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop(), i = s && s.querySelector('[data-wkimg] img'); if (!i || !i.complete || !i.naturalWidth) return null;
      return {w: i.naturalWidth, h: i.naturalHeight, src: (i.src || '').slice(0, 40), text: __dtx(s)}; }),
    /** tap a button in the open sheet by its words (today's tapInDialog; the new build's dialogs are .np-sheet) */
    tapInDialog: async m => { const ok = await ev(([src, fl]) => { const re = new RegExp(src, fl); const d = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop(); const b = d && [...d.querySelectorAll('button')].filter(__dvis).find(b => re.test(__dtx(b)));
        if (!b) return false; b.click(); return true; }, [m.source, m.flags]); if (!ok) throw new Error('nothing in the sheet matching ' + m); await wait(500); },
    /** the open share image's average brightness, 0 (black) to 1 (white), as today's adapter measures it */
    shareImageBrightness: () => ev(async () => { const d = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop(), i = d && d.querySelector('.sh2-img img'); if (!i) return null;
      if (!i.complete) await new Promise(r => i.onload = r); const c = document.createElement('canvas'); c.width = 60; c.height = 60; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 60, 60);
      const p = x.getImageData(0, 0, 60, 60).data; let t = 0; for (let k = 0; k < p.length; k += 4) t += 0.2126 * p[k] + 0.7152 * p[k + 1] + 0.0722 * p[k + 2]; return t / (p.length / 4) / 255; }),
    /** is the site itself showing in dark (its page background) */
    looksDark: () => ev(() => { const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number); return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 < 0.4; }),
    tapWinner: async () => { await ev(() => { const b = [...document.querySelectorAll('#main .wk-win [data-evgo]')].find(__dvis); if (!b) throw new Error('no winner row'); b.click(); }); await wait(900); },
    /** New Tech's kind markers: the word as written (CSS shows it in capitals) and whether an icon is drawn beside it */
    kindMarkers: () => ev(() => [...document.querySelectorAll('#main .wk-kind')].filter(__dvis).map(k => ({word: k.textContent.trim(), icon: !!k.querySelector('svg')}))),
    // ---------------- Track Record (Nov 15, The Receipt: src/v2/pages/track.js) ----------------
    hasChart: () => ev(() => [...document.querySelectorAll('#main svg')].filter(__dvis).some(s => s.querySelectorAll('path,polyline,line').length > 4)),
    /** number of rows inside a fold */
    foldRows: m => ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); if (!d) return null;
      return [...d.querySelectorAll('li, tr')].filter(__dvis).length; }, m),
  };
  // Archetypes (Nov 15, The Weather Map: src/v2/pages/archetypes.js). Translation: today's guide folds are the map's regions; a region
  // opens its guide (".ar-guide", headed "<style> Guide"), which is the fold's text.
  const fold0 = D.toggleFold, text0 = D.foldText, onArch = () => ev(() => location.hash.replace(/=.*/, '') === '#archetypes');
  D.toggleFold = async m => { if (!(await onArch())) return fold0(m);
    await ev(m => { const l = m.toLowerCase(), b = [...document.querySelectorAll('#main [data-argo]')].filter(__dvis).find(b => __dtx(b.querySelector('.ar-nm') || b).toLowerCase() === l || __dtx(b.querySelector('.ar-nm') || b).toLowerCase().includes(l));
      if (!b) throw new Error('no style ' + m); b.click(); }, m); await wait(500); };
  D.foldText = async m => { if (!(await onArch())) return text0(m);
    return ev(m => { const g = [...document.querySelectorAll('#main .ar-guide')].find(__dvis), h = g && g.querySelector('.ar-gh h2'); return h && __dtx(h).toLowerCase().includes(m.toLowerCase()) ? __dtx(g) : null; }, m); };
  // the other Meta and shell helpers: the pages they belong to aren't rebuilt yet
  for (const k of ['mainTabs', 'activeMainTab', 'teamCount', 'bottomBar', 'tapMainTab', 'openMenu', 'ratingOnRatings', 'filterChipsTop', 'teamLinkCode', 'findRulesCaption'])
    if (!(k in D)) D[k] = () => NOT(`${k} (a Meta/shell helper for a page or feature the new site doesn't have yet)`);
  return {D: new Proxy(D, {get: (o, k) => k in o ? o[k] : (typeof k === 'string' ? () => NOT(`${k} (a Meta/shell helper the new site doesn't have yet)`) : undefined)})};
};
