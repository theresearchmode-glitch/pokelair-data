// ---------- Champions arena, group B: My team's sub-pages and the team overlays (theme/arena-team.css) ----------
// Saved teams, My box, Compare, All suggestions, the team editor, the threat sheet, the share card and My team's fold bodies.
// Arena markup only: every number, name and control comes from the app's own data, and every control keeps its element, its
// data-* attributes and its handler. Pokémon shown as plain sprites become art tiles (AR.art's field, sprite and name).
const ARB = {};
/* sprite file -> Pokémon (the reverse of SPRITE_ID), so a drawn sprite can take its own type colours */
ARB._spr = null;
ARB.pOf = img => { if (!ARB._spr) { ARB._spr = new Map(); try { for (const [n, id] of Object.entries(SPRITE_ID)) { const p = byName.get(n); if (p && !ARB._spr.has(String(id))) ARB._spr.set(String(id), p); } } catch (e) {} }
  const m = img && /sp\/(\d+)\.webp/.exec(img.getAttribute('src') || ''); return m ? ARB._spr.get(m[1]) || null : null; };
/* turn an element that holds a sprite into an art tile in place: the element, its children and its attributes stay */
ARB.tile = (el, p, size, name) => { if (!el || !p || el.classList.contains('ar-art')) return;
  el.classList.add('ar-art', 'ar-' + (size || 's'), 'ar-below'); if (AR.isMega(p)) el.classList.add('is-mega');
  el.style.cssText += ';' + AR.tv(p); const img = el.querySelector('img'); if (img) img.classList.add('ar-spr');
  el.insertAdjacentHTML('afterbegin', '<span class="ar-f ar-field" aria-hidden="true"></span>'); if (name) name.classList.add('ar-nm'); };
/* a sprite in a list: a small slanted type field behind it (the .ar-row field, sized for strips and chips) */
ARB.mini = (img, cls) => { if (!img || !img.parentNode || img.parentNode.classList.contains('arb-mf')) return; const p = ARB.pOf(img); if (!p) return;
  const w = document.createElement('span'); w.className = 'arb-mf' + (cls ? ' ' + cls : '') + (AR.isMega(p) ? ' is-mega' : ''); w.style.cssText = AR.tv(p); w.setAttribute('aria-hidden', 'true');
  w.innerHTML = '<span class="arb-mf-f ar-field"></span>'; img.before(w); w.append(img); };

/* ===== Saved teams: each six as art tiles ===== */
ARB.saved = () => { const L = $('savedList'); if (!L) return;
  L.querySelectorAll('.svt').forEach(card => { const six = card.querySelector('.svsix'); if (!six || six.classList.contains('arb-six')) return;
    const k = card.querySelector('[data-load],[data-delok],[data-rnok],[data-cmp]'), id = k && (k.dataset.load || k.dataset.delok || k.dataset.rnok || k.dataset.cmp);
    const t = id && S.teams.find(x => x.id === id); if (!t) return; let ms = []; try { ms = teamRating(t.slots).ms; } catch (e) {}
    six.classList.add('arb-six', 'ar-six'); six.setAttribute('role', 'group');
    six.innerHTML = ms.map(m => AR.art(m.p, {tag: 'div', size: 's', below: 1, name: m.d, attrs: `title="${esc(m.d)}"`})).join('') + Array.from({length: Math.max(0, 6 - ms.length)}, () => AR.emptyArt('s')).join('');
    card.querySelectorAll('.svacts .btn.primary[data-load]').forEach(b => b.classList.add('arb-open')); }); };
CH.wrap('renderSaved', () => ARB.saved());

/* ===== My box: every Pokémon you own as an art tile, its remove button on the tile ===== */
ARB.box = () => { const L = $('boxList'); if (!L) return;
  L.querySelectorAll('.boxchip').forEach(c => { const x = c.querySelector('[data-unbox]'), p = x && byName.get(x.dataset.unbox); if (p) ARB.tile(c, p, 's', c.querySelector(':scope > b')); }); };
CH.wrap('renderBox', () => ARB.box());

/* ===== Compare: the two sixes as art tiles, the picker's teams as small type fields ===== */
ARB.compare = () => { const el = $('cxOut'); if (!el) return;
  el.querySelectorAll('.cxsix > span').forEach(s => { const p = ARB.pOf(s.querySelector('img')); if (p && !s.classList.contains('ar-art')) { s.insertAdjacentHTML('beforeend', `<span class="ar-nm">${escName(p.d)}</span>`); ARB.tile(s, p, 's', s.querySelector('.ar-nm')); } });
  el.querySelectorAll('.cxos img.spr, .cxthr img.spr').forEach(ARB.mini); };
CH.wrap('renderCompare', () => ARB.compare());

/* ===== All suggestions: each suggested Pokémon on its own type field ===== */
ARB.recs = () => { document.querySelectorAll('#recList .addcard .rtop img.spr, #sugs .plan .swap img.spr').forEach(i => ARB.mini(i, 'arb-lg')); };
CH.wrap('renderRecs', () => ARB.recs()); CH.wrap('renderPlans', () => ARB.recs());

/* ===== the overlays: the editor's strip and set card, the threat sheet, Log a game (they redraw often, so one watcher) ===== */
ARB.field = (el, p) => { if (!el || !p || el.querySelector(':scope > .arb-f')) return; el.style.cssText += ';' + AR.tv(p); if (AR.isMega(p)) el.classList.add('is-mega');
  el.insertAdjacentHTML('afterbegin', '<span class="arb-f ar-field" aria-hidden="true"></span>'); };
ARB.overlays = () => { const ed = $('chEdit');
  if (ed && !ed.hidden) { ed.querySelectorAll('.chst').forEach(b => ARB.field(b, ARB.pOf(b.querySelector('img'))));
    ed.querySelectorAll('.tcard .thead > img.tspr').forEach(i => ARB.mini(i, 'arb-xl')); }
  const sc = $('chScout'); if (sc && !sc.hidden) { sc.querySelectorAll('.chdet img.spr, .chlist .it > img.spr, .chbest img.spr').forEach(i => ARB.mini(i, 'arb-lg'));
    sc.querySelectorAll('.chtile[data-chthr]').forEach(b => ARB.field(b, byName.get(b.dataset.chthr)));
    const d = sc.querySelector('.chdet'), p = d && CH.sel && byName.get(CH.sel); if (d && p && !d.dataset.arb) { d.dataset.arb = 1; d.style.cssText += ';' + AR.tv(p); } }
  /* My team's fold bodies: the vs-top-12 chart's sprites and the All 30 rows on small type fields */
  document.querySelectorAll('[data-pane="report"] #chVsOut .chchart img.spr').forEach(i => ARB.mini(i));
  document.querySelectorAll('[data-pane="report"] #thrCard .thrrow > summary > img.spr').forEach(i => ARB.mini(i, 'arb-lg'));
  document.querySelectorAll('.myrec .qlog .logpick, .myrec .qlog [data-qllead]').forEach(b => ARB.field(b, ARB.pOf(b.querySelector('img')))); };
{ let q = false; const run = () => { q = false; try { ARB.overlays(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']}); }

if (window.__PL_TEST) window.__ARB = {setView: v => setView(v), edit: i => chEditOpen(i), scout: n => chScoutOpen(n), share: () => openShareCard(), members: () => members(), S: () => S, ARB};
