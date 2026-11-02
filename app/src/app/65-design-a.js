// ---------- Design pass A (Nov 2): a signature colour per section, splashier page headers ----------
// Every page belongs to one of six sections. <html data-sec="..."> carries it, and polish.css (DESIGN A block) turns it into
// tokens every page part can reuse: --sec (fill), --sec-ink (text-safe on paper), --sec-soft (tint), --sec-2 (partner colour).
// Build = citron (never the yellow of the one main button), My team = blue, Battle = teal (red stays for opponents),
// Meta = gold, Info = violet, Home = blue with every section's colour in its band.
const PG_SEC = {home: 'home', auto: 'build', cores: 'build', report: 'team', build: 'team', teams: 'team', compare: 'team', box: 'team', coverage: 'team',
  matchup: 'battle', battle: 'battle', practice: 'battle', gauntlet: 'battle', speed: 'battle', calc: 'battle', types: 'battle',
  ratings: 'meta', meta: 'meta', sets: 'meta', top: 'meta', events: 'meta', arch: 'meta', weekly: 'meta', track: 'meta', method: 'meta', about: 'info'};
const SEC_OF_GROUP = {Build: 'build', 'My team': 'team', Battle: 'battle', Meta: 'meta', Info: 'info'};
function secSync() { try { document.documentElement.dataset.sec = PG_SEC[view] || 'home'; } catch (e) {} }
/* menu: each group (and the bottom bar's buttons) wears its section colour on its icons */
function secNav() { try {
  document.querySelectorAll('.sidenav .sgroup').forEach(g => { const l = g.querySelector('.sgl'); g.dataset.sec = l ? SEC_OF_GROUP[l.textContent.trim()] || 'home' : 'home'; });
  document.querySelectorAll('.sidenav [data-view], .bnav [data-view], .tabs [data-view]').forEach(b => { if (!b.dataset.sec) b.dataset.sec = PG_SEC[b.dataset.view] || 'home'; });
} catch (e) {} }
/* sprite collage behind each page's big title: your team on My team pages, the top-rated Pokémon elsewhere.
   Only rebuilt when the Pokémon change, so the sprite-reuse observer has nothing to swap on a plain page switch. */
function pgArt() { try {
  const pane = document.querySelector(`[data-pane="${view}"]`); if (!pane) return;
  const host = [...pane.querySelectorAll('.chpghead')].find(h => h.offsetParent !== null); if (!host) return;
  const sec = PG_SEC[view] || 'home'; let ps = [];
  if (sec === 'team') ps = (S.slots || []).map(s => s && byName.get(s.n)).filter(Boolean).slice(0, 3);
  if (!ps.length && typeof lairRows === 'function') ps = lairRows().slice(0, 3).map(x => x.p);
  const key = ps.map(p => p.n).join('|'); let art = host.querySelector(':scope > .pgart');
  if (!key) { if (art) art.remove(); return; }
  if (art && art.dataset.k === key) return;
  if (!art) { art = document.createElement('span'); art.className = 'pgart'; art.setAttribute('aria-hidden', 'true'); host.prepend(art); }
  art.dataset.k = key; art.innerHTML = ps.map(p => sprite(p, 'pgspr') || '').join('');
  host.classList.add('pghas');
} catch (e) {} }
CH.wrap('setView', () => { secSync(); pgArt(); requestAnimationFrame(pgArt); });
CH.wrap('render', () => pgArt());
secNav(); secSync();
