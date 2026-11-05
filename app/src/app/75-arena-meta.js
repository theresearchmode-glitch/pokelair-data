// ---------- Champions arena, phase 2 group D: the Meta pages (purple) ----------
// Ratings, Usage, Popular sets, Winning teams, Events, Archetypes, This week, Track record, How we calculate, About, and the
// info sheet's Meta and Rating tabs (theme/arena-meta.css). Nothing here draws new content or computes new numbers: it only
// (1) gives every Pokémon on these pages its arena type colours (AR.tv: --a, --b and the dark-mode --da, --db, --on) and marks
// Megas, so the CSS can stand each sprite on its own slanted type field with the Mega power-up contour, and (2) gives the old
// segmented controls, buttons and text links on these pages the arena component classes (.ar-seg, .ar-btn, .ar-link), the
// same way AR.parts() does on Home and My team. Elements, attributes and handlers stay exactly as the app drew them.
const ARM = {};
ARM.PANES = ['ratings', 'meta', 'sets', 'top', 'events', 'arch', 'weekly', 'track', 'method', 'about'];
ARM.SCOPE = ARM.PANES.map(v => `[data-pane="${v}"]`).join(',') + ',#lairSheet .lstp-meta,#lairSheet .lstp-rating,#homeOut .wkhome';
/* sprite file id -> Pokémon (for the bare sprites in event, archetype and track rows, which carry no name) */
ARM.sid = null;
ARM.bySrc = src => { if (!ARM.sid) { ARM.sid = new Map(); try { for (const n in SPRITE_ID) { const k = String(SPRITE_ID[n]); if (!ARM.sid.has(k)) ARM.sid.set(k, n); } } catch (e) {} }
  const m = /sp\/(\d+)\.webp/.exec(src || ''); return m ? byName.get(ARM.sid.get(m[1])) : null; };
/* put a Pokémon's arena colours on an element (once) */
ARM.paint = (el, p) => { if (!el || !p || el.dataset.arm) return; el.dataset.arm = '1';
  el.setAttribute('style', `${el.getAttribute('style') || ''};${AR.tv(p)}`.replace(/^;/, '')); if (AR.isMega(p)) el.classList.add('ar-ismega'); };
/* the Meta views carry .ar-mpg, the scope every rule in arena-meta.css starts from */
ARM.mark = () => ARM.PANES.forEach(v => { const el = document.querySelector(`.view[data-pane="${v}"]`); if (el && !el.classList.contains('ar-mpg')) el.classList.add('ar-mpg'); });
ARM.mark();
ARM.run = () => { ARM.mark(); const roots = document.querySelectorAll(ARM.SCOPE); if (!roots.length) return;
  roots.forEach(r => {
    /* anything that names its Pokémon */
    r.querySelectorAll('[data-lt]:not([data-arm]),[data-setmon]:not([data-arm])').forEach(el => ARM.paint(el, byName.get(el.dataset.lt || el.dataset.setmon)));
    /* type-coloured rows and tiles without a name attribute: their sprite says who they are */
    r.querySelectorAll('.tyacc:not([data-arm]),.svm:not([data-arm])').forEach(el => { const i = el.querySelector('img.spr'); ARM.paint(el, i && ARM.bySrc(i.getAttribute('src'))); });
    /* bare sprites in a row (an event's winning six, an archetype's key Pokémon): each stands on its own small field */
    r.querySelectorAll(':is(.evwin,.gkm,.calrow) > img.spr:not([data-arm])').forEach(i => ARM.paint(i, ARM.bySrc(i.getAttribute('src'))));
    /* the arena controls, on the elements the app drew (same handlers) */
    r.querySelectorAll('.seg:not(.ar-seg)').forEach(s => s.classList.add('ar-seg'));
    r.querySelectorAll(':is(.ltype,.lflag,.dbdt,.ttmon):not(.ar-chip)').forEach(b => b.classList.add('ar-chip'));
    r.querySelectorAll(':is(button.btn,button.chghost,button.sdcopy):not(.ar-btn):not(.chprimary)').forEach(b => b.classList.add('ar-btn'));
    r.querySelectorAll(':is(button.linkbtn,button.nplink):not(.ar-link):not(.rzmorebtn)').forEach(b => b.classList.add('ar-link')); });
  const sh = document.querySelector('#lairSheet');
  if (sh) { const p = sh.querySelector('.ar-shero'); if (p) sh.querySelectorAll('.lstp-meta,.lstp-rating').forEach(t => { if (!t.dataset.arm) { t.dataset.arm = '1'; t.setAttribute('style', p.getAttribute('style') || ''); } }); } };
/* run after the app draws (the same observer pattern as 74-arena.js) */
{ let q = false; const go = () => { q = false; try { ARM.run(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(go); } }).observe(document.body, {childList: true, subtree: true}); }
if (window.__PL_TEST) window.__ARM = ARM;
