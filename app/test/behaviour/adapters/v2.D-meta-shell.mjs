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
    openPokemon: async id => { await ev(n => { const e = [...document.querySelectorAll('.ra-list [data-v2mon], .gs [data-v2mon]')].filter(__dvis).find(e => e.dataset.v2mon === n); if (!e) throw new Error('no row ' + n); e.click(); }, id); await until(() => D.sheetIsOpen()); await wait(400); },
    sheetIsOpen: () => ev(() => __dvis(document.querySelector('.np-sheet .ms2'))),
    sheetName: () => ev(() => __dtx(document.querySelector('.np-sheet .ms2 h2'))),
    // folds: "Every Pokémon, by Tier" is the See all switch; the rest are real folds (details) on the page
    foldIsOpen: m => /every pokémon, by tier/i.test(m) ? ev(() => !!document.querySelector('.ra-board')) : /pokémon ratings/i.test(m) ? NOT('How We Calculate page (the "Pokémon Ratings" section)') : ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? d.open : null; }, m),
    toggleFold: async m => { if (/every pokémon, by tier/i.test(m)) { const on = await ev(() => !!document.querySelector('.ra-board')); await pg.click(on ? '[data-raview="stand"]' : '[data-raview="list"]'); await wait(500); return; }
      await ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); if (!d) throw new Error('no fold ' + m); d.querySelector('summary').click(); }, m); await wait(500); },
    foldText: m => ev(m => { const d = [...document.querySelectorAll('#main details')].filter(__dvis).find(d => __dtx(d.querySelector('summary')).toLowerCase().includes(m.toLowerCase())); return d ? __dtx(d) : null; }, m),
    inView: m => NOT('inView ' + m + ' (How We Calculate page)'),
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
  };
  // the other Meta and shell helpers: the pages they belong to aren't rebuilt yet
  for (const k of ['mainTabs', 'activeMainTab', 'teamCount', 'bottomBar', 'tapMainTab', 'openMenu', 'ratingOnRatings', 'filterChipsTop', 'teamLinkCode', 'findRulesCaption'])
    if (!(k in D)) D[k] = () => NOT(`${k} (a Meta/shell helper for a page or feature the new site doesn't have yet)`);
  return {D: new Proxy(D, {get: (o, k) => k in o ? o[k] : (typeof k === 'string' ? () => NOT(`${k} (a Meta/shell helper the new site doesn't have yet)`) : undefined)})};
};
