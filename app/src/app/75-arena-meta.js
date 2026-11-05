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
ARM.paint = (el, p) => { if (!el || !p || el.classList.contains('ar-tv')) return; el.classList.add('ar-tv');
  el.setAttribute('style', `${el.getAttribute('style') || ''};${AR.tv(p)}`.replace(/^;/, '')); if (AR.isMega(p)) el.classList.add('ar-ismega'); };
/* the Meta views carry .ar-mpg, the scope every rule in arena-meta.css starts from */
ARM.mark = () => ARM.PANES.forEach(v => { const el = document.querySelector(`.view[data-pane="${v}"]`); if (el && !el.classList.contains('ar-mpg')) el.classList.add('ar-mpg'); });
ARM.mark();
ARM.run = () => { ARM.mark(); const roots = document.querySelectorAll(ARM.SCOPE); if (!roots.length) return;
  roots.forEach(r => {
    /* anything that names its Pokémon */
    r.querySelectorAll('[data-lt]:not(.ar-tv),[data-setmon]:not(.ar-tv)').forEach(el => ARM.paint(el, byName.get(el.dataset.lt || el.dataset.setmon)));
    /* type-coloured rows and tiles without a name attribute: their sprite says who they are */
    r.querySelectorAll('.tyacc:not(.ar-tv),.svm:not(.ar-tv),.gyou:not(.ar-tv),.trmon:not(.ar-tv)').forEach(el => { const i = el.querySelector('img.spr'); ARM.paint(el, i && ARM.bySrc(i.getAttribute('src'))); });
    /* bare sprites in a row (an event's winning six, an archetype's key Pokémon): each stands on its own small field */
    r.querySelectorAll('.wkteb .wkst > img.spr:not(.ar-tv)').forEach(i => ARM.paint(i, ARM.bySrc(i.getAttribute('src'))));
    /* (the field is a skewed ::before on a small wrapper, .ar-sf, so it has the system's slant and corners; the sprite node
       itself is moved, never replaced, so the sprite-reuse observer in 15-visual-helpers.js is unaffected) */
    r.querySelectorAll(':is(.evwin,.gkm,.wksix) > img.spr').forEach(i => { const p = ARM.bySrc(i.getAttribute('src')); if (!p) return;
      const w = document.createElement('span'); w.className = 'ar-sf'; w.setAttribute('aria-hidden', 'true'); i.before(w); w.append(i); ARM.paint(w, p); if (AR.isMega(p)) i.classList.add('ar-mega-s'); });
    r.querySelectorAll('.npspr > span:not(.ar-tv)').forEach(s => { const i = s.querySelector('img.spr'), p = i && ARM.bySrc(i.getAttribute('src')); if (!p) return; s.classList.add('ar-sf'); ARM.paint(s, p); if (AR.isMega(p)) i.classList.add('ar-mega-s'); });
    /* one naming everywhere: a Mega tile says "Mega Floette", not "Floette" plus an M flag (the contour marks it too) */
    r.querySelectorAll(':is(.tgm,.ltile).ar-ismega > :is(.tgn,.ltn):not(.ar-nmd)').forEach(n => { const t = n.parentElement, i = t.querySelector('img.spr'), p = byName.get(t.dataset.lt) || (i && ARM.bySrc(i.getAttribute('src')));
      if (!p) return; n.classList.add('ar-nmd'); n.innerHTML = AR.nm(p.d); });
    /* an archetype's share: "53%" (the old "53%, 48 of 90" string left a comma before the basis, which now sits on its own line) */
    r.querySelectorAll('#guideOut details.guide > summary > .vsub:not(.ar-nmd)').forEach(v => { v.classList.add('ar-nmd'); const t = v.firstChild; if (t && t.nodeType === 3) t.nodeValue = t.nodeValue.replace(/,\s*$/, ''); });
    /* the arena controls, on the elements the app drew (same handlers) */
    r.querySelectorAll('.seg:not(.ar-seg)').forEach(s => s.classList.add('ar-seg'));
    r.querySelectorAll(':is(.ltype,.lflag,.dbdt,.ttmon):not(.ar-chip)').forEach(b => b.classList.add('ar-chip'));
    r.querySelectorAll(':is(button.btn,button.chghost,button.sdcopy):not(.ar-btn):not(.chprimary)').forEach(b => b.classList.add('ar-btn'));
    r.querySelectorAll(':is(button.linkbtn,button.nplink):not(.ar-link):not(.rzmorebtn)').forEach(b => b.classList.add('ar-link')); });
  /* one head order on every Meta sub-page: the page switcher ("Winning teams / Events / Archetypes", "Rating / Usage / Sets")
     sits above the title, as on Ratings and Archetypes (Winning teams and Events drew it under the lede). The node is moved,
     not redrawn, so its buttons and handlers stay. */
  ARM.PANES.forEach(v => { const pane = document.querySelector(`.view[data-pane="${v}"]`); if (!pane) return;
    pane.querySelectorAll('.seg.teamsw').forEach(sw => { let h = sw.previousElementSibling; while (h && !h.classList.contains('chpghead')) h = h.previousElementSibling; if (h) h.before(sw); }); });
  /* the one main action on a Meta page ("Share this week"): the yellow strip with the arena go disc, as on every other page */
  document.querySelectorAll(`${ARM.PANES.map(v => `[data-pane="${v}"]`).join(',')}`).forEach(p => p.querySelectorAll('button.chprimary:not(.ar-primary)').forEach(b => { b.classList.add('ar-btn', 'ar-primary');
    b.querySelectorAll(':scope > span[aria-hidden="true"]').forEach(s => { if (/[➜→›]/.test(s.textContent)) s.hidden = true; }); if (!b.querySelector('.ar-go')) b.insertAdjacentHTML('beforeend', AR.ICON.go); }));
  /* This week's "How we decide what changed" is the fold strip like every other fold (same <details> and content) */
  document.querySelectorAll('[data-pane="weekly"] details.wkfoot:not(.chsec)').forEach(d => { const s = d.querySelector(':scope > summary'); if (!s) return; d.classList.add('chsec', 'ar-wkfold');
    const t = s.textContent.trim(); s.innerHTML = `${CH.tog()}<span class="cht">${esc(t)}</span>`; });
  const sh = document.querySelector('#lairSheet');
  if (sh) { const p = sh.querySelector('.ar-shero'); if (p) sh.querySelectorAll('.lstp-meta,.lstp-rating').forEach(t => { if (!t.classList.contains('ar-tv')) { t.classList.add('ar-tv'); t.setAttribute('style', p.getAttribute('style') || ''); } }); } };
/* run after the app draws (the same observer pattern as 74-arena.js) */
{ let q = false; const go = () => { q = false; try { ARM.run(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(go); } }).observe(document.body, {childList: true, subtree: true}); }
if (window.__PL_TEST) window.__ARM = ARM;
