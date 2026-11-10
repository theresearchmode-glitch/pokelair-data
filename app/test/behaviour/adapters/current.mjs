// Adapter for TODAY's site (the build live on Nov 10). The rebuild gets adapters/rebuild.mjs with the SAME function names, so
// every behaviour test runs unchanged on both. Keep this file the only place that knows today's class names and internals.
// Add a function here when a test needs one; name it for what the player does, not for how today's page does it.
const slot = n => ({n, a: null, lock: false});
export default {
  name: 'current',
  /** the saved state for a player who has this team / box / opponents / saved teams */
  stateFor(o) { const st = {slots: (o.team || []).map(slot), box: o.box || [], teams: [], loadedId: null, format: 'doubles', maxMega: 1, opp: o.opp || [], excl: [], log: []};
    while (st.slots.length < 6) st.slots.push({n: '', a: null, lock: false});
    (o.saved || []).forEach((t, i) => st.teams.push({id: 't' + i, name: t.name, slots: t.team.map(slot), format: 'doubles', saved: Date.now() - i * 1000}));
    return st; },
  bind(pg) { const A = {
    pg,
    /** player-facing page names -> today's views */
    PAGES: {'Home': 'home', 'My Team': 'report', 'Build': 'auto', 'Build for Me': 'auto', 'Cores': 'auto', 'All Suggestions': 'coverage',
      'Battle': 'matchup', 'Speed Tiers': 'speed', 'Damage Calc': 'calc', 'Type Chart': 'types', 'Test Run': 'gauntlet', 'Practice': 'practice',
      'Track Record': 'track', 'Ratings': 'ratings', 'Usage': 'meta', 'Popular Sets': 'sets', 'Winning Teams': 'top', 'Events': 'events',
      'Archetypes': 'arch', 'This Week': 'weekly', 'How We Calculate': 'method', 'About': 'about', 'Saved Teams': 'teams', 'My Box': 'box',
      'Compare': 'compare', 'Team Sheet': 'sheet'},
    /** go to a page the way a player does (its menu or link); falls back to the page's own router */
    async go(name, wait = 600) { const v = A.PAGES[name] || name;
      const ok = await pg.evaluate(v => { const b = document.querySelector(`.sidenav [data-view="${v}"]`) || [...document.querySelectorAll(`[data-view="${v}"]`)].find(e => e.getClientRects().length);
        if (b) { b.click(); return true; } return false; }, v);
      if (!ok) await pg.evaluate(v => window.__ev && window.__ev(`setView(${JSON.stringify(v)})`), v);
      await pg.waitForTimeout(wait); return v; },
    /** which page is showing */
    current: () => pg.evaluate(() => { const p = [...document.querySelectorAll('[data-pane]')].find(e => !e.hidden && e.getClientRects().length); return p ? p.dataset.pane : null; }),
    /** the visible text of the page being shown */
    text: () => pg.evaluate(() => { const p = [...document.querySelectorAll('[data-pane]')].find(e => !e.hidden && e.getClientRects().length); return (p || document.body).innerText.replace(/\s+/g, ' ').trim(); }),
    /** click the first VISIBLE control whose text matches (string = contains, case-insensitive; RegExp = test) */
    async tap(match, within = 'body', wait = 400) { const ok = await pg.evaluate(([m, isRe, w]) => {
        const re = isRe ? new RegExp(m[0], m[1]) : null, t = e => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim();
        const root = document.querySelector(w) || document.body;
        const els = [...root.querySelectorAll('button,a,[role=button],[role=tab],summary,label,[data-view],[tabindex]')].filter(e => e.getClientRects().length && !e.closest('[hidden]'));
        const e = els.find(e => re ? re.test(t(e)) : t(e).toLowerCase().includes(m.toLowerCase())); if (!e) return false; e.click(); return true; },
        [match instanceof RegExp ? [match.source, match.flags] : match, match instanceof RegExp, within]);
      if (!ok) throw new Error(`nothing visible to tap matching ${match}`); await pg.waitForTimeout(wait); },
    /** is something with this text visible on the page? */
    sees: m => pg.evaluate(([m, isRe]) => { const re = isRe ? new RegExp(m[0], m[1]) : null; const T = document.body.innerText; return re ? re.test(T) : T.toLowerCase().includes(m.toLowerCase()); },
      [m instanceof RegExp ? [m.source, m.flags] : m, m instanceof RegExp]),
    /** the player's current team / box as names (what the page holds now) */
    team: () => pg.evaluate(() => window.__ev ? window.__ev('S.slots.map(s=>s.n).filter(Boolean)') : null),
    box: () => pg.evaluate(() => window.__ev ? window.__ev('S.box.slice()') : null),
    /** read today's page state, only for checks a player can't see directly (e.g. what was saved). The rebuild adapter
     *  must offer the same expressions' meaning through its own functions; prefer adding a named function here. */
    peek: expr => pg.evaluate(e => window.__ev ? window.__ev(e) : undefined, expr),
    /** type into a visible input found by its placeholder, aria-label or label text */
    async type(labelOrPlaceholder, text, enter = false) { const h = await pg.evaluateHandle(m => { const l = m.toLowerCase();
        return [...document.querySelectorAll('input,textarea')].find(i => i.getClientRects().length && ((i.placeholder || '').toLowerCase().includes(l) || (i.getAttribute('aria-label') || '').toLowerCase().includes(l) || (i.labels && [...i.labels].some(x => x.innerText.toLowerCase().includes(l))))) || null; }, labelOrPlaceholder);
      const el = h.asElement(); if (!el) throw new Error(`no visible input for "${labelOrPlaceholder}"`); await el.click(); await el.fill(''); await el.type(text, {delay: 15}); if (enter) await el.press('Enter'); await pg.waitForTimeout(400); },
    /** no sideways scroll on the page */
    noSideScroll: () => pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    reload: async (wait = 1500) => { await pg.reload(); await pg.waitForTimeout(wait); },
  }; return A; },
};
