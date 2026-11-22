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
  const rowsOf = sel => ev(sel => [...document.querySelectorAll(sel)].filter(__dvis).map(e => { const a = e.getAttribute('aria-label') || '', m = a.match(/^(.*?), rated (\d+)(?:, number (\d+))?/) || (a.match(/^(.*?) (\d+): rated(?: number (\d+))?/) /* pl-5d (Nov 17): tiles say their visible words first */) || [];
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
    /* Nov 15: a Pokémon tap opens its page (#pokemon=<name>); the page counts as the opened sheet, its name as the sheet's name */
    sheetIsOpen: () => ev(() => __dvis(document.querySelector('.np-sheet .ms2')) || (V2.route() === 'pokemon' && !!document.querySelector('#main .pk'))),
    sheetName: () => ev(() => __dtx(document.querySelector('.np-sheet .ms2 h2')) || (V2.route() === 'pokemon' ? __dtx(document.querySelector('#main #pk-name .pk-nm')).replace(/\.$/, '') : '')), /* reskin (Nov 21): the h1 reads "The file on <name>." */
    // folds: "Every Pokémon, by Tier" is the See all switch; the rest are real folds (details) on the page
    foldIsOpen: m => /every pokémon, by tier/i.test(m) ? ev(() => !!document.querySelector('.ra-board')) : ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? d.open : null; }, m),
    toggleFold: async m => { if (/every pokémon, by tier/i.test(m)) { const on = await ev(() => !!document.querySelector('.ra-board')); await pg.click(on ? '[data-raview="stand"]' : '[data-raview="list"]'); await wait(500); return; }
      await ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); if (!d) throw new Error('no fold ' + m); d.querySelector('summary').click(); }, m); await wait(500); },
    foldText: m => ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? __dtx(d) : null; }, m),
    /** is the section whose heading or summary holds m on screen (Nov 15: How We Calculate and About are built) */
    inView: m => ev(m => { const re = m.toLowerCase(); const e = [...document.querySelectorAll('#main summary, #main h2, #main h3, #main .chk')].filter(__dvis).find(x => __dtx(x).toLowerCase().includes(re)); if (!e) return false; const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }, m),
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
    setsSources: () => ev(() => [...document.querySelectorAll('[data-v2setsrc]')].map(b => ({name: ({'Online tournaments': 'Tournaments', 'Showdown ladder': 'Showdown'})[__dtx(b)] || __dtx(b), on: b.getAttribute('aria-pressed') === 'true'}))), /* audit v199 #9: word-list names on the new site */
    chooseSetsSource: async name => { name = ({Tournaments: 'Online tournaments', Showdown: 'Showdown ladder'})[name] || name; await ev(n => { const b = [...document.querySelectorAll('[data-v2setsrc]')].find(b => __dtx(b) === n); if (!b) throw new Error('no source ' + n); b.click(); }, name); await wait(600); },
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
    eventDetailTop: () => pg.evaluate(() => { const o = document.querySelector('.ev-open'); return o ? Math.round(o.getBoundingClientRect().top) : null; }),
    scrollTo: async y => { await pg.mouse.move(640, 400); await pg.evaluate(y => scrollTo(0, y), y); await pg.mouse.wheel(0, 1).catch(() => pg.evaluate(() => dispatchEvent(new Event('scroll')))) /* phone-mode WebKit has no mouse wheel (Nov 17) */; await wait(300); },
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
    // Nov 22 (Events on the kit): the latest result is plan step 1 (article.ev2-latest, its "See the placings" button opens it); the rest are
    // the wall's tickets (button.ev2-tk). The filter words are the plot sentence's boxed words ("all 115": the word, then its count).
    eventCards: () => ev(() => [...document.querySelectorAll('#main .ev2-latest, #main .ev-wall .ev2-tk[data-evgo]')].filter(__dvis).map(__dtx)),
    chooseEventFilter: async name => { await ev(n => { const b = [...document.querySelectorAll('#main [data-evf]')].filter(__dvis).find(b => { const s = b.querySelector('span') || b; return (s.firstChild ? s.firstChild.textContent : '').trim().toLowerCase() === n.toLowerCase(); }); if (!b) throw new Error('no filter ' + n); b.click(); }, name); await wait(600); },
    openEvent: async m => { await ev(m => { const b = [...document.querySelectorAll('#main .ev2-latest, #main .ev2-tk[data-evgo]')].filter(__dvis).find(b => __dtx(b).includes(m)); if (!b) throw new Error('no event ' + m); (b.matches('article') ? b.querySelector('[data-evgo]') : b).click(); }, m); await wait(800); },
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
  // ================= the site shell and the rest (Nov 15): header, phone bar, search, theme, sheets, toasts, footer, Home cards =================
  // Where the new site has no such part (the ⋯ menu, the Auto/Light/Dark picker, a footer "More", the stale-data note...), the helper still
  // looks for it the way a player would and reports what it finds (null / false / a "site has no ..." error), so the test fails honestly.
  const GAP = w => { throw new Error('site has no ' + w); };
  const tapEl = async (finder, arg, what, ms = 500) => { await ev(() => 0); /* defines __dvis / __dtx in the page */ const h = await pg.evaluateHandle(finder, arg), el = h.asElement(); if (!el) throw new Error('nothing to tap: ' + what);
    await el.scrollIntoViewIfNeeded({timeout: 1000}).catch(() => {}); try { await el.click({timeout: 1500}); } catch (e) { await el.evaluate(x => x.click()); } await wait(ms); };
  const X = {
    // ---------- main tabs (header .np-nav) and the phone bar (.np-bar): the lit one carries aria-current="page" ----------
    mainTabs: () => ev(() => [...document.querySelectorAll('.np-nav a, .np-bar a')].filter(__dvis).map(a => __dtx(a).replace(/\s*\d\/6$/, ''))),
    activeMainTab: () => ev(() => { const a = [...document.querySelectorAll('.np-nav a, .np-bar a')].filter(__dvis).find(a => a.getAttribute('aria-current') === 'page'); return a ? __dtx(a).replace(/\s*\d\/6$/, '') : null; }),
    /** the "x/6" beside My Team in the main tabs (null when no count is shown) */
    teamCount: () => ev(() => { const a = [...document.querySelectorAll('.np-nav a, .np-bar a')].filter(__dvis).find(a => a.getAttribute('href') === '#team'); const m = a && __dtx(a).match(/(\d)\/6/); return m ? m[0] : null; }),
    bottomBar: () => ev(() => { const n = document.querySelector('.np-bar'); if (!__dvis(n)) return null; const r = n.getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), names: [...n.querySelectorAll('a')].map(__dtx)}; }),
    tapMainTab: async name => { await tapEl(n => [...document.querySelectorAll('.np-nav a, .np-bar a')].filter(__dvis).find(a => __dtx(a).replace(/\s*\d\/6$/, '').toLowerCase() === n.toLowerCase()) || null, name, 'main tab ' + name, 600); },
    // ---------- the ⋯ "More pages and settings" menu: the new header has none (checked: its controls are Back, logo, Forward, the five tabs,
    // Search, My Box, Day/Night). openMenu looks for it as a player would and fails with what the header does have. ----------
    menuButtonOn: () => ev(() => { const b = [...document.querySelectorAll('header button, header a')].filter(__dvis).find(b => /more pages/i.test(b.getAttribute('aria-label') || '')); return !!b && (b.classList.contains('on') || b.getAttribute('aria-current') === 'page' || b.getAttribute('aria-pressed') === 'true'); }),
    openMenu: async () => { const ok = await ev(() => { const b = [...document.querySelectorAll('header button, header a')].filter(__dvis).find(b => /more pages/i.test(b.getAttribute('aria-label') || '')); if (b) b.click(); return !!b; });
      if (!ok) GAP('⋯ "More pages" menu: no header control is labelled "More pages" (header: ' + (await D.headerControls()).join(' | ') + ')'); await wait(400); },
    menuIsOpen: () => ev(() => [...document.querySelectorAll('[role=dialog], nav')].filter(__dvis).some(e => /more pages|all pages/i.test(e.getAttribute('aria-label') || ''))),
    menuPages: async () => { await D.openMenu(); return []; }, menuCurrent: async () => { await D.openMenu(); return null; }, focusInMenu: async () => { await D.openMenu(); return false; },
    tapMenuPage: async () => D.openMenu(), closeMenu: async () => D.openMenu(),
    themeChoices: async () => { const c = await ev(() => [...document.querySelectorAll('[data-thm], [data-v2thm]')].filter(__dvis).map(b => ({name: __dtx(b), on: b.getAttribute('aria-pressed') === 'true'}))); if (!c.length) GAP('Auto / Light / Dark theme picker (only the Day/Night button in the header)'); return c; },
    chooseTheme: async name => { const ok = await ev(n => { const b = [...document.querySelectorAll('[data-thm], [data-v2thm]')].filter(__dvis).find(b => __dtx(b).toLowerCase() === n.toLowerCase()); if (b) b.click(); return !!b; }, name);
      if (!ok) GAP('Auto / Light / Dark theme picker (only the Day/Night button in the header, which has no Auto)'); await wait(400); },
    // ---------- Meta's two switches: Pokémon | Tournaments (nav.ra-tabs) and the page slider under it (nav.ra-seg); both are links, the shown one aria-current ----------
    sectionSwitch: () => ev(() => { const n = [...document.querySelectorAll('#main nav.ra-tabs')].find(__dvis); if (!n) return null; const b = [...n.querySelectorAll('a,button')];
      return {items: b.map(__dtx), selected: (b.find(x => x.getAttribute('aria-current') === 'page' || x.getAttribute('aria-selected') === 'true') || {}).innerText || null}; }),
    tapSection: async name => { await tapEl(n => [...document.querySelectorAll('#main nav.ra-tabs a, #main nav.ra-tabs button')].filter(__dvis).find(b => __dtx(b) === n) || null, name, 'section ' + name, 600); },
    pageSwitch: () => ev(() => { const n = [...document.querySelectorAll('#main nav.ra-seg')].find(__dvis); if (!n) return null; const b = [...n.querySelectorAll('a,button')], on = x => x.getAttribute('aria-current') === 'page' || x.getAttribute('aria-pressed') === 'true' || x.getAttribute('aria-selected') === 'true';
      return {items: b.map(__dtx), selected: __dtx(b.find(x => x.getAttribute('aria-current') === 'page' || x.getAttribute('aria-pressed') === 'true')), announced: b.filter(on).map(__dtx)}; }),
    tapPageSwitch: async name => { await tapEl(n => [...document.querySelectorAll('#main nav.ra-seg a, #main nav.ra-seg button')].filter(__dvis).find(b => __dtx(b) === n) || null, name, 'page switch ' + name, 300);
      await until(async () => ((await D.pageSwitch()) || {}).selected === name, 4000); await wait(300); },
    /** the "← name" back link on a sub-page (any link or button in the page whose words start with an arrow back) */
    backLink: () => ev(() => { const b = [...document.querySelectorAll('#main button, #main a')].filter(__dvis).find(b => /^[←‹]/.test(__dtx(b))); return b ? __dtx(b) : null; }),
    tapBackLink: async () => { await tapEl(() => [...document.querySelectorAll('#main button, #main a')].filter(__dvis).find(b => /^[←‹]/.test(__dtx(b))) || null, null, 'a ← back link in the page', 600); },
    browserBack: async () => { await pg.goBack({timeout: 3000}).catch(() => {}); await wait(700); },
    address: () => pg.url(),
    scrollToBottom: async () => { await pg.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await pg.mouse.wheel(0, 50).catch(() => pg.evaluate(() => dispatchEvent(new Event('scroll')))); await wait(400); },
    /** the current section's accent: the colour of the lit main tab's marker (the new site draws it with --plot); no lit tab: --plot itself */
    accent: () => ev(() => { const a = [...document.querySelectorAll('.np-nav a, .np-bar a')].filter(__dvis).find(a => a.getAttribute('aria-current') === 'page');
      let c = a ? getComputedStyle(a, '::after').backgroundColor : ''; if (!c || c === 'rgba(0, 0, 0, 0)') { const t = document.createElement('i'); t.style.color = 'var(--plot)'; document.body.append(t); c = getComputedStyle(t).color; t.remove(); } return c.toUpperCase(); }),
    // ---------- keyboard ----------
    key: async k => { await pg.keyboard.press(k); await wait(250); },
    typeKeys: async s => { await pg.keyboard.type(s, {delay: 20}); await wait(300); },
    focusName: () => ev(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || __dtx(a)).slice(0, 80) : null; }),
    focusPokemon: async name => { await ev(n => { const e = [...document.querySelectorAll('#main [data-v2mon]')].filter(__dvis).find(e => e.dataset.v2mon === n || (e.getAttribute('aria-label') || '').startsWith(n + ','));
      if (!e) throw new Error('no row ' + n); e.scrollIntoView({block: 'center'}); e.focus(); }, name); await wait(150); },
    focusIsPokemon: id => ev(i => { const a = document.activeElement; return !!a && !!a.closest && !!a.closest(`[data-v2mon="${i}"]`); }, id),
    // ---------- search (a sheet with [data-v2q]; header button [data-v2search], Ctrl+K, "/") ----------
    openSearch: async (via = 'button') => { if (via === 'button') await pg.click('header [data-v2search]'); else if (via === 'keys') await pg.keyboard.press('Control+k'); else await pg.keyboard.press('/'); await wait(400); },
    searchIsOpen: () => ev(() => __dvis(document.querySelector('[data-v2q]'))),
    searchHasFocus: () => ev(() => !!document.activeElement && document.activeElement.matches('[data-v2q]')),
    search: async text => { await pg.fill('[data-v2q]', ''); await pg.type('[data-v2q]', text, {delay: 15}); await wait(350); },
    /** result rows: {name, sub (the row's words after its name), kind (its "Page" / "Saved team" label), kindShown, selected (focused, or the one Enter picks), text}.
     *  A Pokémon row shows its rating as "96 · S tier" and names it for screen readers as "Rated 96, S tier" (shell.js, aria-label); sub reads
     *  that line by its own spoken words, which are today's row words ("Rated N, …"), so nothing is added that the row doesn't say */
    searchResults: () => ev(() => { const hs = [...document.querySelectorAll('[data-v2hits] .np-hit')].filter(__dvis), a = document.activeElement, inBox = a && a.matches('[data-v2q]');
      return hs.map((h, i) => { const b = h.querySelector('b'), k = h.querySelector('.pg'), name = __dtx(b), all = __dtx(h); let sub = all; if (k) sub = sub.replace(__dtx(k), ''); sub = sub.replace(name, '').trim(); const sm = h.querySelector('.nm small[aria-label^="Rated "]'); if (sm) sub = sub.replace(__dtx(sm), sm.getAttribute('aria-label')).trim();
        return {name, sub, kind: k ? __dtx(k) : '', kindShown: __dvis(k), selected: a === h || (inBox && i === 0), text: all}; }); }),
    searchMessage: () => ev(() => __dtx(document.querySelector('[data-v2hits]'))),
    tapSearchResult: async name => { await tapEl(n => [...document.querySelectorAll('[data-v2hits] .np-hit')].filter(__dvis).find(h => __dtx(h.querySelector('b')) === n) || null, name, 'search result ' + name, 700); },
    /** tap the dimmed backdrop beside the open sheet (a point where the backdrop is what the finger lands on) */
    tapBackdrop: async () => { const p = await ev(() => { for (const [x, y] of [[6, innerHeight - 6], [6, 6], [innerWidth - 6, innerHeight - 6], [innerWidth / 2, innerHeight - 4]]) { const e = document.elementFromPoint(x, y); if (e && e.matches('.np-scrim')) return [x, y]; } return null; });
      if (!p) throw new Error('no backdrop showing beside the sheet'); await pg.mouse.click(p[0], p[1]); await wait(400); },
    closeSearchByBackdrop: () => D.tapBackdrop(),
    // ---------- text boxes ----------
    focusField: async ph => { await pg.click(`input[placeholder*="${ph}"]:visible`); await wait(150); },
    fieldValue: ph => ev(p => { const i = [...document.querySelectorAll('input,textarea')].filter(__dvis).find(i => (i.placeholder || '').includes(p)); return i ? i.value : null; }, ph),
    focusedPlaceholder: () => ev(() => (document.activeElement && document.activeElement.placeholder) || null),
    /** the × in a box: a clear button beside it, or (type="search", no CSS hiding it) the browser's own × that shows while there is text */
    clearShown: ph => ev(p => { const i = [...document.querySelectorAll('input')].filter(__dvis).find(i => (i.placeholder || '').includes(p)); if (!i) return false;
      const x = i.parentElement.querySelector('.clrx, [aria-label="Clear"], [aria-label^="Clear "]'); if (x) return __dvis(x); return i.type === 'search' && i.value !== ''; }, ph),
    clearField: async ph => { const r = await ev(p => { const i = [...document.querySelectorAll('input')].filter(__dvis).find(i => (i.placeholder || '').includes(p)); if (!i) return null;
        const x = i.parentElement.querySelector('.clrx, [aria-label="Clear"], [aria-label^="Clear "]'); if (x && __dvis(x)) { x.click(); return 'done'; }
        if (i.type !== 'search' || !i.value) return null; const b = i.getBoundingClientRect(), pr = parseFloat(getComputedStyle(i).paddingRight) || 0; return [b.right - pr - 8, b.top + b.height / 2]; }, ph);
      if (!r) throw new Error('no visible × in ' + ph); if (Array.isArray(r)) { await pg.mouse.click(r[0], r[1]); } await wait(400); },
    // ---------- theme ----------
    themeButton: () => ev(() => { const b = document.querySelector('header [data-v2theme]'); return __dvis(b) ? b.getAttribute('aria-label') : null; }),
    tapThemeButton: async () => { await pg.click('header [data-v2theme]'); await wait(400); },
    deviceDark: async on => { await pg.emulateMedia({colorScheme: on ? 'dark' : 'light'}); await wait(500); },
    reduceMotion: async () => { await pg.emulateMedia({reducedMotion: 'reduce'}); await wait(200); },
    // ---------- header, title, fonts ----------
    pageTitle: () => pg.title(),
    hasFavicon: () => ev(() => [...document.querySelectorAll('link[rel~=icon]')].length > 0),
    headlineFont: () => ev(() => { const h = [...document.querySelectorAll('#main h1, #main h2')].find(__dvis); if (!h) return null; const s = getComputedStyle(h); return {family: s.fontFamily, style: s.fontStyle, text: __dtx(h)}; }),
    headerControls: () => ev(() => [...document.querySelectorAll('header button, header a')].filter(__dvis).map(b => b.getAttribute('aria-label') || __dtx(b))),
    headerFits: () => ev(() => [...document.querySelector('header').querySelectorAll('button,a')].filter(__dvis).every(b => { const r = b.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; })),
    logoShown: () => ev(() => [...document.querySelectorAll('header a.logo')].some(a => __dvis(a) && /NastyPlot/.test(a.getAttribute('aria-label') || '') && !!a.querySelector('svg, b'))),
    // ---------- notes and banners: found by their words anywhere in the page (the new site has no fixed bar for them) ----------
    healthNote: () => ev(() => { const e = [...document.querySelectorAll('#app *')].filter(e => __dvis(e) && /older than usual/i.test(e.textContent || '')).pop(); return e ? __dtx(e.closest('p,div,section,aside') || e) : null; }),
    regBanner: () => ev(() => { const e = [...document.querySelectorAll('#app *')].filter(e => __dvis(e) && /New regulation/i.test(e.textContent || '')).pop(); return e ? __dtx(e.closest('p,div,section,aside') || e) : null; }),
    // ---------- footer ----------
    tapFooter: async m => { await ui.tap(m, 'footer'); await wait(500); },
    moreButtons: (within = 'body') => ev(w => [...document.querySelectorAll(w + ' button')].filter(__dvis).map(__dtx).filter(t => /^(More|Less)$/.test(t)), within),
    // ---------- toasts and undo ----------
    tapUndo: async () => { await pg.click('#toastUndo'); await wait(500); },
    /* skips the old list kept on screen, inert, while the planner works (sugs.js); WebKit, Nov 17: the tap landed there */
    applySuggestion: async () => { const before = JSON.stringify(await ui.team());
      await until(() => ev(() => [...document.querySelectorAll('#main [data-v2plan]')].filter(__dvis).filter(b => !b.closest('[inert]')).some(b => !b.disabled)), 8000);
      await tapEl(() => [...document.querySelectorAll('#main [data-v2plan]')].filter(__dvis).filter(b => !b.closest('[inert]')).find(b => !b.disabled) || null, null, 'an Apply button on a suggestion', 500);
      await until(async () => JSON.stringify(await ui.team()) !== before, 4000); await wait(700); },
    tapUndoBar: async () => { await tapEl(() => [...document.querySelectorAll('#main [data-undobar]')].find(__dvis) || null, null, 'the Undo bar', 1200); },
    // ---------- "?" tips (.sg2-tipop) ----------
    tipHasPicture: () => ev(() => { const t = [...document.querySelectorAll('.sg2-tipop')].find(__dvis); return !!t && t.querySelectorAll('img, svg').length > 0; }),
    tipCount: () => ev(() => [...document.querySelectorAll('.sg2-tipop')].filter(__dvis).length),
    tapInTip: async m => { await ui.tap(m, '.sg2-tipop'); await wait(600); },
    // ---------- Ratings extras ----------
    /** today's "Details" = the new site's "List with win rates" view; its label is the switch's other choice (what you tap to go back) */
    detailsLabel: () => ev(() => { const b = [...document.querySelectorAll('[data-raview]')].filter(__dvis).find(b => b.getAttribute('aria-pressed') !== 'true'); return b ? __dtx(b) : null; }),
    /** today's sliding pickers (a pill slides to the choice) are chip groups on the new site (Usage source: .ra-chip, one pressed at a time).
     *  "The highlight moved to the choice" = the chosen chip is pressed and drawn highlighted: its colours differ from every other chip's,
     *  and the others all look alike (so exactly one chip is lit, and it is the chosen one) */
    sliderMoved: name => ev(n => { const g = [...document.querySelectorAll('[data-ussrc], [data-v2setsrc]')].filter(__dvis), c = g.find(b => __dtx(b) === n); if (!c) return false;
      const bs = g.filter(b => b.parentElement === c.parentElement), look = b => { const s = getComputedStyle(b); return [s.backgroundColor, s.color, s.borderColor].join('|'); }, rest = bs.filter(b => b !== c);
      return c.getAttribute('aria-pressed') === 'true' && rest.length > 0 && rest.every(b => look(b) !== look(c)) && new Set(rest.map(look)).size === 1; }, name),
    chipTop: name => ev(n => { const b = [...document.querySelectorAll('[data-raty], [data-raflag]')].filter(__dvis).find(b => __dtx(b).replace(/\s+\d+$/, '') === n); return b ? Math.round(b.getBoundingClientRect().top) : null; }, name),
    ratingOnRatings: async name => { const t = (await D.topList()).find(r => r.name === name || r.id === name); if (t) return t.rating;
      await D.ratingsSearch(name); const b = (await D.boardTiles()).find(r => r.name === name || r.id === name); await D.ratingsSearch(''); return b ? b.rating : null; },
    /** sprite, colour field and Mega mark for each Pokémon on Ratings (the stand's figures and the list's rows) */
    pokemonArt: () => ev(() => [...document.querySelectorAll('#main .gs [data-v2mon], #main .ra-list [data-v2mon]')].filter(__dvis).map(e => { const m = e.querySelector('.np-mon'), s = (e.getAttribute('style') || '') + ' ' + (m ? m.getAttribute('style') || '' : '');
      return {id: e.dataset.v2mon, sprite: !!e.querySelector('img[src*="art/"]'), field: /--b1:|--cp:/.test(s), mega: !!e.querySelector('.np-megatag') || /^mega$/i.test(((e.querySelector('.gs-mg, .mg:not(.none)') || {}).textContent || '').trim())}; })),
    /** the rating Popular Sets shows for the looked-up Pokémon: the spotlight's big number (pages/sets.js .gs-big: "96" beside "S tier" and
     *  "Rated 96, #3 of 321"); today's "X tier, rated N" wording if a page still writes it */
    setsRating: () => ev(() => { const b = [...document.querySelectorAll('#main .st .gs-big > b')].find(__dvis); if (b && /^\d+$/.test(__dtx(b))) return +__dtx(b);
      const m = __dtx(document.querySelector('#main')).match(/[SABCDF] tier, rated (\d+)/); return m ? +m[1] : null; }),
    // ---------- Home: the welcome card and What's New ----------
    welcomeCard: () => ev(() => { const w = [...document.querySelectorAll('#main .hm-welcome, #main .sds-wl')].find(__dvis); return w ? __dtx(w) : null; }),
    whatsNew: () => ev(() => { const w = [...document.querySelectorAll('#main .hm-newsec')].find(__dvis); return w ? __dtx(w) : null; }),
    dismissWhatsNew: async () => { await pg.click('[data-hmnewx]'); await wait(400); },
    // ---------- dialogs. Translation: Send Feedback is its own page here (#feedback, from the footer), so while it is shown it is the "dialog" ----------
    dialogText: () => ev(() => { const s = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop(); if (s) return __dtx(s);
      const f = location.hash.replace(/=.*/, '') === '#feedback' && document.querySelector('#main'); return f ? __dtx(f) : null; }),
    dialogFields: () => ev(() => { const s = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop() || (location.hash.replace(/=.*/, '') === '#feedback' ? document.querySelector('#main') : null);
      return s ? [...s.querySelectorAll('input,textarea,select')].filter(__dvis).map(i => ({type: i.type || i.tagName, ph: i.placeholder || '', label: i.getAttribute('aria-label') || (i.labels && i.labels[0] ? __dtx(i.labels[0]) : '')})) : []; }),
    tapInDialog: async m => { const ok = await ev(([src, fl]) => { const re = new RegExp(src, fl); const d = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop() || (location.hash.replace(/=.*/, '') === '#feedback' ? document.querySelector('#main') : null);
        const b = d && [...d.querySelectorAll('button')].filter(__dvis).find(b => re.test(__dtx(b))); if (!b) return false; b.click(); return true; }, [m.source, m.flags]); if (!ok) throw new Error('nothing in the sheet matching ' + m); await wait(500); },
    closeDialog: async () => { await pg.keyboard.press('Escape'); await wait(400); },
    openFeedback: async () => { await ui.tap(/^Send feedback$/i, 'footer'); await wait(600); },
    typeFeedback: async text => { const ta = await pg.evaluateHandle(() => { const s = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop() || document.querySelector('#main'); return [...s.querySelectorAll('textarea')].filter(__dvis).pop() || null; });
      const el = ta.asElement(); if (!el) throw new Error('no feedback box'); await el.fill(''); await el.type(text, {delay: 5}); await wait(200); },
    savedFeedback: () => pg.evaluate(() => window.__acct['feedback/u_test'] || null),
    /** the viewer's usage record; page visits are written 'view:<the new site's route>', read back under today's page ids (as current() does: meta = ratings, usage = meta...) */
    savedUsage: () => pg.evaluate(() => { const u = window.__acct['usage/u_test']; if (!u) return null; const M = {meta: 'ratings', usage: 'meta', tournaments: 'top', archetypes: 'arch', team: 'report', battle: 'matchup', build: 'auto'};
      return JSON.parse(JSON.stringify(u).replace(/"view:([a-z-]+)"/g, (m, k) => '"view:' + (M[k] || k) + '"')); }),
    leaveTab: async () => { await pg.evaluate(() => { Object.defineProperty(document, 'visibilityState', {value: 'hidden', configurable: true}); Object.defineProperty(document, 'hidden', {value: true, configurable: true}); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('pagehide')); }); await wait(800); },
    // ---------- links, copying, the share image ----------
    /** the code in the player's own team / box link (the shared logic's teamCode() / boxCode(), as today's adapter reads it) */
    teamLinkCode: () => ui.peek('teamCode()'),
    boxLinkCode: () => ui.peek('boxCode()'),
    /** the shared-team sheet a team link opens (headed "Shared team") */
    sharedBanner: () => ev(() => { const s = [...document.querySelectorAll('.np-sheet')].filter(__dvis).find(s => /^Shared team/i.test(s.getAttribute('aria-label') || '') || /Shared team/i.test(__dtx(s).slice(0, 40))); return s ? __dtx(s) : null; }),
    allowClipboard: async () => { try { await pg.context().grantPermissions(['clipboard-read', 'clipboard-write']); } catch (e) {} },
    showdownText: () => pg.evaluate(() => { if (window.__copied) return window.__copied; const d = [...document.querySelectorAll('.np-sheet textarea, .np-sheet pre')].find(e => e.getClientRects().length); return d ? (d.value || d.textContent) : null; }),
    saveShareImage: async () => { const dl = pg.waitForEvent('download', {timeout: 5000}).catch(() => null); await D.tapInDialog(/^Save image$/i); const f = await dl; return f ? f.suggestedFilename() : await D.toastText(); },
    /** Darkrai: Sim cut him from the rebuild (Nov 11; empty screens show a rotating underdog instead), so the new site cannot have him */
    mascotShown: () => NOT('Darkrai on empty screens: cut from the rebuild by Sim (Nov 11, CLAUDE.md), replaced by the rotating featured underdog'),
    runningAnimations: () => pg.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && (a.effect && a.effect.getTiming().duration > 0)).map(a => (a.animationName || a.transitionProperty || 'anim') + ':' + (a.effect.target && a.effect.target.className || '').toString().slice(0, 30))),
    // ---------- the Pokémon info sheet, and the Pokémon page that replaces it (Nov 15: a tap opens #pokemon=<name>, pages/pokemon.js) ----------
    // Translation for the page: "the sheet" = the page's #main; its old tabs (Info / Meta / Rating) are parts of one page, all shown at once,
    // so tapping a tab is a jump to that part where the page has one (else nothing to do), and sheetTabs reports the tabs the page really has.
    // ✕ / backdrop have no meaning on a page: closeSheet('back') goes Back, 'escape' presses Escape; ✕ / backdrop fail honestly on the page.
    sheetText: () => ev(() => { const s = [...document.querySelectorAll('.np-sheet')].filter(__dvis).find(s => s.querySelector('.ms2')); if (s) return __dtx(s);
      return window.V2 && V2.route() === 'pokemon' && __dvis(document.querySelector('#main .pk')) ? __dtx(document.querySelector('#main')) : null; }),
    sheetRating: () => ev(() => { const b = [...document.querySelectorAll('.np-sheet .ms2 .ms-rate b, #main .pk-rate > b')].find(__dvis); return b ? Number(__dtx(b)) : null; }),
    sheetFocusInside: () => ev(() => { const a = document.activeElement, s = a && a.closest && a.closest('.np-sheet'); if (s) return !!s.querySelector('.ms2');
      return !!(window.V2 && V2.route() === 'pokemon' && a && a.closest && a.closest('#main')); }),
    /* closeSheet() with no way named = "close it the usual way": on the Pokémon page that is Back (the page's own way out); a test that
       names ✕ or the backdrop (SHEET-01) still gets the honest failure, since a page has neither */
    closeSheet: async how => { const page = await ev(() => !!(window.V2 && V2.route() === 'pokemon' && !document.querySelector('.np-sheet .ms2'))); if (how == null) how = page ? 'back' : 'x';
      if (how === 'back') await pg.goBack().catch(() => {}); else if (how === 'escape') await pg.keyboard.press('Escape');
      else if (page) throw new Error('the Pokémon page has no ' + (how === 'x' ? '✕ close button' : 'backdrop') + ' (it is a page: Back leaves it)');
      else if (how === 'x') await pg.click('.np-sheet > button.x[data-v2close]'); else await D.tapBackdrop();
      await until(async () => !(await D.sheetIsOpen())); await wait(300); },
    sheetTabs: () => ev(() => [...document.querySelectorAll('.np-sheet .ms2 [data-mstab], #main .pk [role=tab]')].filter(__dvis).map(b => ({name: __dtx(b), on: b.getAttribute('aria-selected') === 'true'}))),
    tapSheetTab: async name => { const where = await ev(n => { const l = n.toLowerCase(), b = [...document.querySelectorAll('.np-sheet .ms2 [data-mstab]')].filter(__dvis).find(b => __dtx(b).toLowerCase().startsWith(l));
        if (b) return 'sheet'; if (!(window.V2 && V2.route() === 'pokemon')) return null; const j = [...document.querySelectorAll('#main [data-pkjump]')].filter(__dvis).find(b => __dtx(b).toLowerCase().startsWith(l)); if (j) { j.click(); return 'page'; }
        /* the old tabs' contents are parts of the page (pages/pokemon.js): Info = parts 3-5 (what beats it, speed, abilities), Meta = parts 1-2
           (how to build it, who it teams with), Rating = part 6 (why it rates N). Folded parts open with their "Show ›", as a player taps them */
        const P = {info: ['pk-s3', 'pk-s4', 'pk-s5'], meta: ['pk-s1', 'pk-s2'], rating: ['pk-s6']}[l.split(' ')[0]] || [];
        for (const id of P) { const o = document.querySelector(`#main [data-pkopen="${id}"]`); if (o && o.getAttribute('aria-expanded') !== 'true') o.click(); }
        const first = P.map(id => document.getElementById(id)).find(Boolean); if (first) first.scrollIntoView({block: 'start'}); return 'page'; }, name);
      if (where === 'sheet') await tapEl(n => [...document.querySelectorAll('.np-sheet .ms2 [data-mstab]')].filter(__dvis).find(b => __dtx(b).toLowerCase().startsWith(n.toLowerCase())) || null, name, 'sheet tab ' + name, 400);
      else if (!where) throw new Error('no sheet tab ' + name); else await wait(300); },
    sheetPanel: () => ev(() => { const p = [...document.querySelectorAll('.np-sheet .ms2 [data-mspan]')].filter(x => !x.hidden && __dvis(x)); if (p.length) return p.map(__dtx).join(' ');
      return window.V2 && V2.route() === 'pokemon' && document.querySelector('#main .pk') ? __dtx(document.querySelector('#main')) : null; }),
    tapInSheet: async m => { const page = await ev(() => !!(window.V2 && V2.route() === 'pokemon' && !document.querySelector('.np-sheet .ms2')));
      /* reskin (Nov 21, Sim approved the "file" mock-up): on the Pokémon page "Add to My Team" is the page's pink USE THIS SET. (the same
         data-v2add tap, the same toast and "On your team ✓" line), so the old words tap that button */
      if (page && /Add to (My )?team/i.test(m instanceof RegExp ? m.source : String(m))) { const did = await ev(() => { const b = [...document.querySelectorAll('#main [data-v2add]')].find(__dvis); if (b) b.click(); return !!b; }); if (did) { await wait(500); return; } }
      if (page) await ev(([src, fl]) => { const re = new RegExp(src, fl.includes('i') ? fl : fl + 'i') /* Title Case on the new site */, ok = b => re.test(__dtx(b)) || re.test((b.textContent || '').replace(/\s+/g, ' ').trim());
        if ([...document.querySelectorAll('#main button, #main a')].filter(__dvis).some(ok)) return; /* already on screen */
        const f = [...document.querySelectorAll('#main .pk-fold:not(.open)')].find(s => [...s.querySelectorAll('button, a')].some(ok)); const o = f && f.querySelector('[data-pkopen]'); if (o) o.click(); }, [m instanceof RegExp ? m.source : String(m), m instanceof RegExp ? m.flags : 'i']);
      await ui.tap(m, page ? '#main' : '.np-sheet'); await wait(500); },
    doubleTapInSheet: async m => { const h = await pg.evaluateHandle(([s, f]) => { const re = new RegExp(s, f), root = document.querySelector('.np-sheet') || (window.V2 && V2.route() === 'pokemon' ? document.querySelector('#main') : null);
        const page = !document.querySelector('.np-sheet') && window.V2 && V2.route() === 'pokemon', add = page && /Add to (My )?team/i.test(s) ? root.querySelector('[data-v2add]') : null; /* reskin (Nov 21): the page's USE THIS SET. is its Add to My Team */
        return add && add.getClientRects().length ? add : root ? [...root.querySelectorAll('button')].find(b => b.getClientRects().length && re.test(b.innerText.trim())) || null : null; }, [m.source, m.flags]);
      const el = h.asElement(); if (!el) throw new Error('no ' + m + ' in the sheet / Pokémon page'); await el.scrollIntoViewIfNeeded(); const r = await el.boundingBox(); /* the page's button can sit below the first screen */ await pg.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await wait(80); await pg.mouse.click(r.x + r.width / 2, r.y + r.height / 2); await wait(600); },
    sheetFits: () => ev(() => { const p = [...document.querySelectorAll('.np-sheet')].filter(__dvis).pop() || (window.V2 && V2.route() === 'pokemon' ? document.querySelector('#main .pk') : null); if (!p) return false; const r = p.getBoundingClientRect(), ox = getComputedStyle(p).overflowX;
      /* text inside a row that scrolls sideways on its own (overflow-x auto/scroll and wider than it shows: the phone's swipe rows) is reached by a swipe, not cut */
      const swipe = e => { for (let a = e.parentElement; a && a !== p.parentElement; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if ((o === 'auto' || o === 'scroll') && a.scrollWidth > a.clientWidth + 1) { const b = a.getBoundingClientRect(); return b.left >= -1 && b.right <= innerWidth + 1; } } return false; };
      const cut = [...p.querySelectorAll('*')].filter(e => __dvis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !e.closest('[aria-hidden="true"]')).filter(e => { const b = e.getBoundingClientRect(); return (b.right > innerWidth + 1 || b.left < -1) && !swipe(e); });
      /* a sheet is its own scroll box, so it must not be wider inside than it shows; the Pokémon page is part of the page, which must not
         side-scroll (the document check); its decorative giant name and glow are clipped by their card (overflow hidden, aria-hidden) */
      return r.left >= -1 && r.right <= innerWidth + 1 && !cut.length && (p.scrollWidth <= p.clientWidth + 2 || ox === 'hidden' || ox === 'clip' || !p.matches('.np-sheet')) && document.documentElement.scrollWidth <= innerWidth + 1; }),
    /** "Brought with" partners (ids): the sheet's partner buttons, or the page's partner cards (links to #pokemon=<name>) */
    broughtWith: () => ev(() => { const s = [...document.querySelectorAll('.np-sheet .ms2 .ms-bwi[data-v2mon]')].filter(__dvis).map(e => e.dataset.v2mon); if (s.length) return s.slice(0, 6);
      const R = typeof ROSTER === 'object' ? ROSTER : []; return [...document.querySelectorAll('#main a.pk-pc[href^="#pokemon="]')].filter(__dvis).map(a => { let k = ''; try { k = decodeURIComponent(a.getAttribute('href').split('=')[1]).toLowerCase(); } catch (e) {} const q = R.find(q => q.n.toLowerCase() === k); return q ? q.n : null; }).filter(Boolean).slice(0, 6); }),
    outsideLinksNewTab: () => ev(() => { const root = document.querySelector('.np-sheet') || (window.V2 && V2.route() === 'pokemon' ? document.querySelector('#main') : null); const a = root ? [...root.querySelectorAll('a[href^="http"]')].filter(__dvis) : []; return a.length > 0 && a.every(x => x.target === '_blank'); }),
    // ---------- About: the rules caption under legality statements elsewhere ----------
    findRulesCaption: async () => { const W = /Based on our reading of the Reg M-[A-Z] rules/; await ui.go('My Team'); try { await ui.tap(/^Import/i); } catch (e) {} if (await ui.sees(W)) return 'My Team import';
      /* the new site's My Team says whether the team is legal inside "Things to Know" ([data-v2fix], Sim A2), with the caption under it: open that fold as a player would */
      await ev(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); const d = [...document.querySelectorAll('#main details[data-v2fix]')].find(__dvis); if (d && !d.open) d.querySelector(':scope > summary').click(); }); await wait(500);
      if (await ui.sees(W)) return 'My Team, Things to Know';
      await ev(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); });
      for (const p of ['Type Chart', 'Speed Tiers', 'Damage Calc']) { await ui.go(p); if (await ui.sees(W)) return p; } return null; },
  };
  for (const k in X) if (!(k in D)) D[k] = X[k];
  // the info sheet: the tests close it by ✕ / backdrop / Escape / Back; openPokemon (above) already waits for it
  D.closeSheet = X.closeSheet;
  // openPokemon (above) taps with a script click: a real tap on a button also focuses it (Chromium), so the sheet can hand focus back there;
  // and on the Pokémon page the partners are links (#pokemon=<name>), not [data-v2mon] buttons, so those are tapped as links
  const open0 = D.openPokemon;
  D.openPokemon = async id => { const how = await ev(n => { const els = [...document.querySelectorAll('#main [data-v2mon], .np-sheet [data-v2mon]')].filter(__dvis), al = e => e.getAttribute('aria-label') || '';
      const e = els.find(e => e.dataset.v2mon === n) || els.find(e => al(e).startsWith(n + ',') || al(e).startsWith(n + ':')); if (e) { e.focus({preventScroll: true}); return 'mon'; }
      const a = [...document.querySelectorAll('#main a[href^="#pokemon="]')].filter(__dvis).find(a => { try { return decodeURIComponent(a.getAttribute('href').split('=')[1]).toLowerCase() === n.toLowerCase(); } catch (x) { return false; } });
      if (a) { a.focus({preventScroll: true}); a.click(); return 'link'; } return 'mon'; }, id);
    if (how === 'link') { await until(async () => (await D.sheetName()) && (await ev(n => decodeURIComponent((location.hash.split('=')[1] || '')).toLowerCase() === n.toLowerCase(), id))); await wait(400); return; }
    return open0(id); };
  // Archetypes (Nov 15, The Weather Map: src/v2/pages/archetypes.js). Translation: today's guide folds are the map's regions; a region
  // opens its guide (".ar-guide", headed "<style> Guide"), which is the fold's text.
  const fold0 = D.toggleFold, text0 = D.foldText, onArch = () => ev(() => location.hash.replace(/=.*/, '') === '#archetypes');
  D.toggleFold = async m => { if (!(await onArch())) return fold0(m);
    await ev(m => { const l = m.toLowerCase(), b = [...document.querySelectorAll('#main [data-argo]')].filter(__dvis).find(b => __dtx(b.querySelector('.ar-nm') || b).toLowerCase() === l || __dtx(b.querySelector('.ar-nm') || b).toLowerCase().includes(l));
      if (!b) throw new Error('no style ' + m); b.click(); }, m); await wait(500); };
  D.foldText = async m => { if (!(await onArch())) return text0(m);
    return ev(m => { const g = [...document.querySelectorAll('#main .ar-guide')].find(__dvis), h = g && g.querySelector('.ar-gh h2'); return h && __dtx(h).toLowerCase().includes(m.toLowerCase()) ? __dtx(g) : null; }, m); };
  // the other Meta and shell helpers: the pages they belong to aren't rebuilt yet
  // Page ids (Nov 15): this group's tests (and B / C) use today's ids, where Ratings is 'ratings' and Usage is 'meta'; the new site's
  // #meta is Ratings and #usage is Usage, which the shared current() reports as 'meta' and 'usage'. A-team's tests instead call the Meta
  // tab's page (#meta) 'meta', so the shared adapter keeps its reading and this group translates on top of it. __dPrev: the kit merges
  // this file twice for a D test, so the translation wraps the same reading both times; __v2base lets A-team's own current() skip it.
  const cur0 = ui.current.__dPrev || ui.current, base = ui.current.__v2base || cur0;
  const current = async () => { const c = await cur0(); return c === 'meta' ? 'ratings' : c === 'usage' ? 'meta' : c; };
  current.__dPrev = cur0; current.__v2base = base;
  return {current, D: new Proxy(D, {get: (o, k) => k in o ? o[k] : (typeof k === 'string' ? () => NOT(`${k} (a Meta/shell helper the new site doesn't have yet)`) : undefined)})};
};
