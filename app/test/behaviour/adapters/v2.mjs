// Adapter for the REBUILD (the new build, app/dist/v2.html from app/parts-v2.json): the same function names and meanings as
// adapters/current.mjs, against the new build's own markup. Run: PAGE=<v2.html> ADAPTER=v2 node app/test/behaviour/run.mjs A-team
// Rules: read what the player sees; where the new build has no equivalent yet, throw Error('not in v2 yet: …') instead of faking it.
// The new build shares today's logic (S, render(), persist...), so the few helpers that read today's state (team, box, peek) work
// unchanged through its test hook (src/v2/test-hook.js sets window.__ev when window.__PL_TEST is set before load).
const slot = n => ({n, a: null, lock: false});
// player-facing page names -> the ids the tests use (today's view names). The new build's hash routes and page-like sheets map onto them.
const ROUTE = {report: '#team', box: '#box', compare: '#compare'};
// sheets that ARE a page in today's site (Saved Teams, Team Sheet, All Suggestions): current() reports them as that page
const PAGE_SHEETS = [['.svt2', 'teams'], ['.ts2', 'sheet'], ['.sga2', 'coverage']];
export default {
  name: 'v2',
  /** the saved state for a player who has this team / box / opponents / saved teams (the new build reads today's saved state) */
  stateFor(o) { const st = {slots: (o.team || []).map(slot), box: o.box || [], teams: [], loadedId: null, format: 'doubles', maxMega: 1, opp: o.opp || [], excl: [], log: []};
    while (st.slots.length < 6) st.slots.push({n: '', a: null, lock: false});
    (o.saved || []).forEach((t, i) => st.teams.push({id: 't' + i, name: t.name, slots: t.team.map(slot), format: 'doubles', saved: Date.now() - i * 1000}));
    return st; },
  bind(pg) { const A = {
    pg,
    /** player-facing page names -> the page ids tests compare with current() (same values as today's adapter) */
    PAGES: {'Home': 'home', 'My Team': 'report', 'Build': 'auto', 'Build for Me': 'auto', 'Cores': 'auto', 'All Suggestions': 'coverage',
      'Battle': 'matchup', 'Speed Tiers': 'speed', 'Damage Calc': 'calc', 'Type Chart': 'types', 'Test Run': 'gauntlet', 'Practice': 'practice',
      'Track Record': 'track', 'Ratings': 'ratings', 'Usage': 'meta', 'Popular Sets': 'sets', 'Winning Teams': 'top', 'Events': 'events',
      'Archetypes': 'arch', 'This Week': 'weekly', 'How We Calculate': 'method', 'About': 'about', 'Saved Teams': 'teams', 'My Box': 'box',
      'Compare': 'compare', 'Team Sheet': 'sheet'},
    /** go to a page the way a player does: its hash route (header menu / links), or for Saved Teams and Team Sheet the My Team button */
    async go(name, wait = 600) { const v = A.PAGES[name] || name;
      const closeSheet = () => pg.evaluate(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); });
      if (ROUTE[v]) { await closeSheet(); await pg.evaluate(h => { if (location.hash !== h) location.hash = h; else if (window.V2) V2.redraw(); }, ROUTE[v]); await pg.waitForTimeout(wait); return v; }
      if (v === 'teams' || v === 'sheet') { await A.go('My Team', 400); const sel = v === 'teams' ? '[data-v2saved]' : '[data-v2sheetopen]';
        const tapIt = () => pg.evaluate(s => { const b = [...document.querySelectorAll(s)].find(e => e.getClientRects().length); if (b) { b.click(); return true; } return false; }, sel);
        let ok = await tapIt(); if (!ok && await pg.evaluate(() => { const m = document.querySelector('#main [data-v2more]'); if (m) { m.click(); return true; } return false; })) { await pg.waitForTimeout(400); ok = await tapIt(); }
        if (!ok) throw new Error(`not in v2 yet: ${name} with this team (My Team shows no ${name} button)`); await pg.waitForTimeout(wait); return v; }
      throw new Error(`not in v2 yet: ${name} page`); },
    /** which page is showing (today's ids); a hash the new build has no page for reads "not-in-v2:<hash>" */
    current: () => pg.evaluate(([PS]) => { if (!window.V2) return null; if (V2._sheet) { for (const [c, id] of PS) if (V2._sheet.wrap.querySelector(c)) return id; }
      const h = (location.hash || '').slice(1).replace(/=.*/, ''); if (!V2.pages[h]) return 'not-in-v2:#' + (h || '(none: Home)');
      return {team: 'report', sheet: 'report', 'team-empty': 'report', box: 'box', compare: 'compare', battle: 'matchup', build: 'auto'}[h] || h; }, [PAGE_SHEETS]),
    /** the visible text of the page being shown (a page-like sheet counts as the page: Saved Teams, Team Sheet, Compare's team picker) */
    text: () => pg.evaluate(() => { const T = e => e.innerText.replace(/\s+/g, ' ').trim(); const h = (location.hash || '').slice(1).replace(/=.*/, '');
      if (!window.V2 || !V2.pages[h]) throw new Error('not in v2 yet: page "' + (h ? '#' + h : 'Home (no hash)') + '"');
      const m = document.querySelector('#main'), s = V2._sheet && V2._sheet.wrap.querySelector('.svt2,.ts2,.cx2-pick,.sga2');
      return [m ? T(m) : '', s ? T(s) : ''].filter(Boolean).join(' '); }),
    /** click the first VISIBLE control whose text matches (string = contains, case-insensitive; RegExp = test) */
    async tap(match, within = 'body', wait = 500) { const ok = await pg.evaluate(([m, isRe, w]) => {
        const re = isRe ? new RegExp(m[0], m[1]) : null, t = e => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim();
        const root = document.querySelector(w) || document.body;
        const els = [...root.querySelectorAll('button,a,[role=button],[role=tab],summary,label,[tabindex]')].filter(e => e.getClientRects().length && !e.closest('[hidden]'));
        const e = els.find(e => re ? re.test(t(e)) : t(e).toLowerCase().includes(m.toLowerCase())); if (!e) return false; e.click(); return true; },
        [match instanceof RegExp ? [match.source, match.flags] : match, match instanceof RegExp, within]);
      if (!ok) throw new Error(`nothing visible to tap matching ${match}`); await pg.waitForTimeout(wait); },
    /** is something with this text visible on the page? */
    sees: m => pg.evaluate(([m, isRe]) => { const re = isRe ? new RegExp(m[0], m[1]) : null; const T = document.body.innerText; return re ? re.test(T) : T.toLowerCase().includes(m.toLowerCase()); },
      [m instanceof RegExp ? [m.source, m.flags] : m, m instanceof RegExp]),
    /** the player's current team / box as names (the shared logic's state, as today's adapter reads it) */
    team: () => pg.evaluate(() => window.__ev ? window.__ev('S.slots.map(s=>s.n).filter(Boolean)') : null),
    box: () => pg.evaluate(() => window.__ev ? window.__ev('S.box.slice()') : null),
    /** read the shared logic's state (same expressions as today's adapter; today's DOM ids don't exist here) */
    peek: expr => pg.evaluate(e => window.__ev ? window.__ev(e) : undefined, expr),
    /** type into a visible input found by its placeholder, aria-label or label text */
    async type(labelOrPlaceholder, text, enter = false) { const h = await pg.evaluateHandle(m => { const l = m.toLowerCase();
        return [...document.querySelectorAll('input,textarea')].find(i => i.getClientRects().length && ((i.placeholder || '').toLowerCase().includes(l) || (i.getAttribute('aria-label') || '').toLowerCase().includes(l) || (i.labels && [...i.labels].some(x => x.innerText.toLowerCase().includes(l))))) || null; }, labelOrPlaceholder);
      const el = h.asElement(); if (!el) throw new Error(`no visible input for "${labelOrPlaceholder}"`); await el.click(); await el.fill(''); await el.type(text, {delay: 15}); if (enter) await el.press('Enter'); await pg.waitForTimeout(400); },
    noSideScroll: () => pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1),
    reload: async (wait = 1500) => { await pg.reload(); await pg.waitForTimeout(wait); },
  }; return A; },
};
