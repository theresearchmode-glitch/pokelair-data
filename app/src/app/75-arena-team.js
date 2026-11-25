// ---------- Champions arena, group B: My team's sub-pages and the team overlays (theme/arena-team.css) ----------
// Saved teams, My box, Compare, All suggestions, the team editor, the threat sheet, the share card and My team's fold bodies.
// Arena markup only: every number, name and control comes from the app's own data, and every control keeps its element, its
// data-* attributes and its handler. Pokémon shown as plain sprites become art tiles (AR.art's field, sprite and name).
/* ARB is created in 44-share-images.js with the share image renderers (Nov 11); this file adds the arena helpers */
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
    six.innerHTML = ms.map(m => AR.art(m.p, {tag: 'div', size: 's', below: 1, name: ARB.nb(m.d), attrs: `title="${esc(m.d)}"`})).join('') + Array.from({length: Math.max(0, 6 - ms.length)}, () => AR.emptyArt('s')).join('');
    card.querySelectorAll('.svacts .btn.primary[data-load]').forEach(b => b.classList.add('arb-open'));
    const nm = card.querySelector('.svname'); if (nm && nm.children.length === 0) nm.textContent = ARB.nbTitle(nm.textContent); });
  const none = L.querySelector(':scope > .empty-note'); if (none && !none.classList.contains('ar-empty')) { const top = CH.metaSix()[0];
    none.className = 'empty-note ar-empty'; none.innerHTML = `<span class="ar-empty-art" aria-hidden="true">${AR.mascot() || (top && sprite(top)) || ''}</span><div><p>No saved teams yet. Open My team and tap Save team, or let NastyPlot build six for you.</p><div class="ar-acts"><button type="button" class="ar-btn" data-view="report">Open My team</button><button type="button" class="ar-btn" data-view="auto">Build me a team</button></div></div>`; }
  const h = L.querySelector('.cmphint'); if (h && /^Tap /.test(h.firstChild && h.firstChild.textContent || '') && matchMedia('(hover:hover) and (pointer:fine)').matches) h.firstChild.textContent = h.firstChild.textContent.replace(/^Tap /, 'Click '); };
CH.wrap('renderSaved', () => ARB.saved());

/* ===== My box: every Pokémon you own as an art tile, its remove button on the tile ===== */
ARB.box = () => { const L = $('boxList'); if (!L) return;
  L.querySelectorAll('.boxchip').forEach(c => { const x = c.querySelector('[data-unbox]'), p = x && byName.get(x.dataset.unbox); if (p) ARB.tile(c, p, 's', c.querySelector(':scope > b')); });
  ARB.nbIn(L.querySelectorAll('.boxchip > b'));
  const none = L.querySelector(':scope > .none'); if (none && !none.querySelector('.ar-empty-art')) { const top = CH.metaSix()[0];
    none.className = 'none ar-empty'; none.innerHTML = `<span class="ar-empty-art" aria-hidden="true">${AR.mascot() || (top && sprite(top)) || ''}</span><div><p>Your box is empty. Add the Pokémon you own, and Build for me and the suggestions pick from them.</p><div class="ar-acts"><button type="button" class="ar-btn" data-arbfocus="boxAdd">Add a Pokémon</button></div></div>`; } };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-arbfocus]'); if (!b) return; const f = $(b.dataset.arbfocus); if (f) { f.scrollIntoView({block: 'center'}); f.focus(); } });
CH.wrap('renderBox', () => ARB.box());

/* ===== Compare: the two sixes as art tiles, the picker's teams as small type fields ===== */
ARB.compare = () => { const el = $('cxOut'); if (!el) return;
  el.querySelectorAll('.cxsix > span').forEach(s => { const p = ARB.pOf(s.querySelector('img')); if (p && !s.classList.contains('ar-art')) { s.insertAdjacentHTML('beforeend', `<span class="ar-nm">${AR.nm(p.d)}</span>`); ARB.tile(s, p, 's', s.querySelector('.ar-nm')); } });
  el.querySelectorAll('.cxos img.spr, .cxthr img.spr').forEach(ARB.mini);
  /* the team already on the other side can't be picked again (it compared a team with itself; main does the same) */
  el.querySelectorAll('.cxopt.dim:not([aria-disabled])').forEach(o => { const side = (o.dataset.cxset || '').split('|')[0], other = side === 'A' ? 'B' : 'A'; o.setAttribute('aria-disabled', 'true'); o.tabIndex = -1;
    const t = o.querySelector('.cxot'); if (t) t.insertAdjacentHTML('beforeend', `<span class="t2 arb-already">Already team ${other}</span>`); }); };
document.addEventListener('click', e => { const o = e.target && e.target.closest && e.target.closest('#cxOut .cxopt[aria-disabled="true"]'); if (o) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
CH.wrap('renderCompare', () => ARB.compare());

/* ===== All suggestions: each suggested Pokémon on its own type field ===== */
ARB.recs = () => { document.querySelectorAll('#recList .addcard .rtop img.spr, #sugs .plan .swap img.spr').forEach(i => ARB.mini(i, 'arb-lg')); ARB.marks($('recs')); ARB.marks($('planSec')); };
CH.wrap('renderRecs', () => ARB.recs()); CH.wrap('renderPlans', () => ARB.recs());

/* a name never breaks before its last short part ("Mega Charizard Y", "Indeedee (F)") */
ARB.nb = t => String(t).replace(/ (\S{1,2}|\([A-Za-z]\))$/, '\u00a0$1');
ARB.nbIn = els => els.forEach(e => { const n = [...e.childNodes].find(x => x.nodeType === 3 && x.textContent.trim()); if (n && !/\u00a0/.test(n.textContent)) n.textContent = ARB.nb(n.textContent); });
/* shrink an element's font a pixel at a time (to min) until its longest word fits its width; it never breaks inside a word */
ARB.fit = (el, min) => { if (!el || !el.clientWidth) return; el.style.removeProperty('font-size'); let f = parseFloat(getComputedStyle(el).fontSize), n = 0;
  while (el.scrollWidth > el.clientWidth + 1 && f > min && n++ < 16) { f -= 1; el.style.setProperty('font-size', f + 'px', 'important'); } };
/* a Pokémon name inside a team title ("Sun with Mega Charizard Y and Trick Room") keeps its form letter with it */
ARB.nbTitle = t => String(t).replace(/\b(Mega \S+|Charizard|Mewtwo|Raichu) ([XY])\b/g, '$1 $2').replace(/ \(([FMfm])\)/g, ' ($1)').replace(/ (and|or|vs) (?=\S)/g, ' $1 ');
/* icon-only Mega, box and catch chips spelled out as quiet tags (the info sheet does the same) */
ARB.marks = root => root && root.querySelectorAll('.tag.ico').forEach(e => { e.classList.remove('ico'); e.classList.add('ar-mark');
  e.textContent = e.classList.contains('box') ? 'In your box' : e.classList.contains('mega') ? 'Mega' : e.classList.contains('catch') ? 'To catch' : e.textContent; });
/* ===== the overlays: the editor's strip and set card, the threat sheet, Log a game (they redraw often, so one watcher) ===== */
ARB.field = (el, p) => { if (!el || !p || el.querySelector(':scope > .arb-f')) return; el.style.cssText += ';' + AR.tv(p); if (AR.isMega(p)) el.classList.add('is-mega');
  el.insertAdjacentHTML('afterbegin', '<span class="arb-f ar-field" aria-hidden="true"></span>'); };
ARB.overlays = () => { const ed = $('chEdit');
  if (ed && !ed.hidden) { ed.querySelectorAll('.chst').forEach(b => ARB.field(b, ARB.pOf(b.querySelector('img'))));
    ed.querySelectorAll('.tcard .thead > img.tspr').forEach(i => ARB.mini(i, 'arb-xl'));
    /* the set sheet takes the arena type colours (the app's Dark is a brown) for its spine */
    ed.querySelectorAll('.tcard[data-tcard]:not([data-arb])').forEach(c => { const sl = S.slots[+c.dataset.tcard], p = sl && byName.get(sl.n); c.dataset.arb = 1; if (p) c.style.cssText += ';' + AR.tv(p); });
    ARB.marks(ed); const t = $('chEditT'); if (t && !/\u00a0/.test(t.textContent)) t.textContent = ARB.nb(t.textContent);
    /* slot titles: "Mega Charizard Y" keeps its Y; a word that is wider than its column steps the size down instead of breaking */
    ed.querySelectorAll('.thead .sl-name').forEach(n => { ARB.nbIn([n]); ARB.fit(n, 18); }); }
  const sc = $('chScout'); if (sc && !sc.hidden) { ARB.marks(sc); sc.querySelectorAll('.chdet img.spr, .chlist .it > img.spr, .chbest img.spr').forEach(i => ARB.mini(i, 'arb-lg'));
    sc.querySelectorAll('.chtile[data-chthr]').forEach(b => ARB.field(b, byName.get(b.dataset.chthr)));
    const d = sc.querySelector('.chdet'), p = d && CH.sel && byName.get(CH.sel); if (d && p && !d.dataset.arb) { d.dataset.arb = 1; d.style.cssText += ';' + AR.tv(p); } }
  /* My team's fold bodies: the vs-top-12 chart's sprites and the All 30 rows on small type fields */
  document.querySelectorAll('[data-pane="report"] #chVsOut .chchart img.spr').forEach(i => ARB.mini(i));
  ARB.nbIn(document.querySelectorAll('[data-pane="report"] #chVsOut .chcr .th i')); ARB.marks(document.querySelector('[data-pane="report"] .chparts'));
  document.querySelectorAll('[data-pane="report"] #thrCard .thrrow > summary > img.spr, [data-pane="report"] .pfix .qtop > img.spr').forEach(i => ARB.mini(i, 'arb-lg'));
  document.querySelectorAll('.myrec .qlog .logpick, .myrec .qlog [data-qllead]').forEach(b => ARB.field(b, ARB.pOf(b.querySelector('img')))); };
/* the editor's strip is redrawn on every open and switch: decorate it right away too */
CH.wrap('chEditStrip', () => ARB.overlays()); CH.wrap('renderMyRec', () => ARB.overlays()); CH.wrap('chScoutRender', () => ARB.overlays());
/* only mutations inside these parts matter; the work is queued once, after the app's own redraw (not every frame, so the app's
   idle-time drawing still gets its idle moments) */
ARB.WATCH = '#chEdit,#chScout,.myrec,#chVsOut,#thrCard,#needs';
{ let q = 0; const run = () => { q = 0; try { ARB.overlays(); } catch (e) {} };
  new MutationObserver(rs => { if (q) return; for (const r of rs) { const t = r.target; if (t.nodeType === 1 && (t.matches(ARB.WATCH) || t.closest(ARB.WATCH))) { q = setTimeout(run, 30); return; } } })
    .observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']}); }

/* polish pass (P-F15): a type tag ends a short line ("Garchomp takes 4× from [Ice]"), so the full stop that followed the old chip
   is dropped rather than left floating after the slanted tag */
ARB.stops = () => document.querySelectorAll('main :is(.ty,.ar-ty)').forEach(t => { const n = t.nextSibling;
  if (n && n.nodeType === 3 && /^\s*\.\s*$/.test(n.nodeValue) && !t.nextElementSibling) n.nodeValue = ''; });
{ let q = false; const go = () => { q = false; try { ARB.stops(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(go); } }).observe(document.body, {childList: true, subtree: true}); }

buildTeamPoster = ARB.poster;
buildShareCard = function () { return CH.shareKind === 'poster' && !SHARE_KIND ? buildTeamPoster(members()) : ARB.card(); };

/* ===== keyboard: the editor, the threat sheet and the share card keep focus inside while open, Escape closes them, and focus
   goes back to the control that opened them; Log a game closes on Escape; the ⋯ menus move focus to their first item ===== */
ARB.FOC = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
ARB.dlg = () => ['shareBox', 'chEdit', 'chScout'].map(id => $(id)).find(d => d && !d.hidden && d.getClientRects().length);
ARB.back = {};
/* the control that opened a dialog, or (when the page redrew it) the same control again */
ARB.again = t => { if (!t) return null; if (t.isConnected && t.getClientRects().length) return t; const k = ['data-chedit', 'data-chset', 'data-lt', 'id'].find(a => t.getAttribute && t.getAttribute(a) != null);
  if (!k) return null; const v = t.getAttribute(k); return [...document.querySelectorAll(k === 'id' ? '#' + CSS.escape(v) : `[${k}="${CSS.escape(v)}"]`)].find(x => x.getClientRects().length && !x.closest('#chEdit,#chScout,#shareBox')) || null; };
/* the control the last tap or click landed on (a touch tap does not always focus it, so document.activeElement can be the body) */
ARB.hit = null; document.addEventListener('pointerdown', e => { const t = e.target && e.target.closest && e.target.closest('button,a[href],summary,[tabindex]'); ARB.hit = t && !t.closest('#chEdit,#chScout,#shareBox') ? t : null; }, true);
ARB.opener = () => { const a = document.activeElement; return a && a !== document.body && !a.closest('#chEdit,#chScout,#shareBox') ? a : ARB.hit && ARB.hit.isConnected ? ARB.hit : a; };
/* My team moves its action buttons when it redraws after a dialog closes, which drops focus to the body; for a moment after a
   close, focus that falls to the body goes back to the opener again, without scrolling */
ARB.held = null; ARB.hold = t => { ARB.held = {t, until: Date.now() + 1500}; };
new MutationObserver(() => { const h = ARB.held, a = document.activeElement; if (!h) return; if (Date.now() > h.until) { ARB.held = null; return; }
  if (a && a !== document.body) return; const g = ARB.again(h.t); if (g) try { g.focus({preventScroll: true}); } catch (e) {} }).observe(document.body, {childList: true, subtree: true});
{ const oe = chEditOpen; chEditOpen = function () { const ed = $('chEdit'); if (ed && ed.hidden) ARB.back.chEdit = ARB.opener(); return oe.apply(this, arguments); };
  const ce = chEditClose; chEditClose = function () { const ed = $('chEdit'), was = ed && !ed.hidden, r = ce.apply(this, arguments); const t = ARB.back.chEdit; ARB.back.chEdit = null;
    const g = was && ARB.again(t); if (g) { try { g.focus({preventScroll: true}); } catch (e) {} ARB.hold(t); } return r; };
  const os = openShareCard; openShareCard = async function () { const b = $('shareBox'); if (!b || b.hidden) ARB.back.share = document.activeElement; const r = await os.apply(this, arguments);
    const box = $('shareBox'), inn = box && !box.hidden && box.querySelector('.sharein'); if (inn && !inn.contains(document.activeElement)) { inn.setAttribute('tabindex', '-1'); inn.setAttribute('aria-modal', 'true'); try { inn.focus({preventScroll: true}); } catch (e) {} } return r; };
  const cs = closeShare; closeShare = function () { const b = $('shareBox'), was = b && !b.hidden, r = cs.apply(this, arguments); const t = ARB.back.share;
    const g = was && !(b && !b.hidden) && ARB.again(t); if (g) { ARB.back.share = null; try { g.focus({preventScroll: true}); } catch (e) {} } return r; }; }
/* the share card draws its box late (the image is async): focus moves in once it shows */
ARB.shareFocus = () => { const box = $('shareBox'), inn = box && !box.hidden && box.querySelector('.sharein'); if (!inn) return;
  /* the head's Close is the overlay's round × (the one overlay head); same element, data attribute and handler */
  const x = inn.querySelector('.sharehd [data-shareclose]:not(.ar-x)'); if (x) { x.className = 'ar-x'; x.textContent = '×'; x.setAttribute('aria-label', 'Close'); }
  if (inn.contains(document.activeElement)) return; inn.dataset.arbf = 1;
  inn.setAttribute('tabindex', '-1'); try { inn.focus({preventScroll: true}); } catch (e) {} };
new MutationObserver(rs => { if (rs.some(r => r.target.nodeType === 1 && (r.target.id === 'shareBox' || r.target.closest('#shareBox')))) setTimeout(ARB.shareFocus, 0); }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']});
/* Log a game: opening it moves focus to the first lead; closing it puts focus back on its button */
ARB.kb = false; document.addEventListener('keydown', e => { if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') ARB.kb = true; }, true);
document.addEventListener('pointerdown', () => { ARB.kb = false; }, true);
/* only when Log a game itself opened or closed (a redraw for another reason, such as the editor closing, leaves focus alone) */
ARB.qlWas = null;
CH.wrap('renderMyRec', () => { const q = ui.ql || {}, was = ARB.qlWas; ARB.qlWas = !!q.open; const a = document.activeElement; if (was === null || was === !!q.open || !ARB.kb || (a && a !== document.body && a.isConnected)) return;
  const t = document.querySelector(q.open ? '.myrec .qlog [data-qllead], .myrec .qlog button' : '.myrec [data-qlopen]'); if (t) try { t.focus({preventScroll: true}); } catch (e) {} });
/* the threat sheet redraws in place: focus that the redraw dropped goes back into it; on close, back to the threat that opened it */
CH.wrap('chScoutRender', () => { const sc = $('chScout'), a = document.activeElement; if (sc && !sc.hidden && (!a || a === document.body)) { const x = sc.querySelector('[aria-pressed="true"]') || sc.querySelector('.x'); if (x) try { x.focus({preventScroll: true}); } catch (e) {} } });
{ const sc0 = chScoutClose; chScoutClose = function () { const sh = $('chScout'), was = sh && !sh.hidden, last = CH.last, r = sc0.apply(this, arguments); const a = document.activeElement;
    if (was && (!a || a === document.body)) { const g = ARB.again(last) || (last && last.dataset && last.dataset.chthr && [...document.querySelectorAll(`[data-chthr="${CSS.escape(last.dataset.chthr)}"]`)].find(x => x.getClientRects().length && !x.closest('#chScout'))); if (g) try { g.focus({preventScroll: true}); } catch (e) {} } return r; }; }
/* the editor redraws a set while you move through it: focus the redraw dropped goes back to the same control */
document.addEventListener('focusin', e => { const t = e.target; if (t && t.closest && t.closest('#chEdit')) ARB.edFoc = t.id || (t.getAttribute('aria-label') ? '[aria-label="' + CSS.escape(t.getAttribute('aria-label')) + '"]' : ''); }, true);
new MutationObserver(() => { const ed = $('chEdit'), a = document.activeElement; if (!ed || ed.hidden || (a && a !== document.body) || !ARB.edFoc) return;
  const k = ARB.edFoc, x = k.startsWith('[') ? ed.querySelector(k) : document.getElementById(k); if (x && ed.contains(x)) try { x.focus({preventScroll: true}); } catch (er) {} })
  .observe(document.body, {childList: true, subtree: true});
/* a ⋯ menu closes when focus moves to something else (a keyboard user tabbing away). Nov 11: not when focus merely drops to the page,
   which a redraw does (after Remove, or as the day's data lands): that shut the menu under a player's finger and made TEAM-03 flaky.
   A tap outside still closes it (72-keep-place.js). */
document.addEventListener('focusout', e => { const d = e.target && e.target.closest && e.target.closest('details.moremenu[open]'); if (!d) return; setTimeout(() => { const a = document.activeElement; if (a && a !== document.body && !d.contains(a)) d.open = false; }, 0); });
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') ARB.trap(e); }, true);
ARB.trap = e => { const d = ARB.dlg(); if (!d) return; const f = [...d.querySelectorAll(ARB.FOC)].filter(x => x.getClientRects().length && !x.closest('[hidden],details:not([open])>:not(summary)')); if (!f.length) return;
    const a = document.activeElement, i = f.indexOf(a);
    if (!d.contains(a) || i < 0 || (e.shiftKey && i === 0) || (!e.shiftKey && i === f.length - 1)) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus(); } };
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const mm = document.activeElement && document.activeElement.closest && document.activeElement.closest('details.moremenu[open]');
  if (mm) { mm.open = false; const s = mm.querySelector(':scope > summary'); if (s) s.focus(); return; }
  if (ARB.dlg()) return; /* the app's own handlers close the dialogs */
  const q = document.querySelector('.myrec .qlog'); if (q && ui.ql && ui.ql.open) { const b = document.querySelector('.myrec [data-qlopen]'); if (b) { b.click(); const nb = document.querySelector('.myrec [data-qlopen]'); if (nb) nb.focus(); } } });
/* a ⋯ menu opened from the keyboard: focus moves to its first item */
document.addEventListener('toggle', e => { const d = e.target; if (!d || !d.matches || !d.matches('details.moremenu') || !d.open) return; const s = d.querySelector(':scope > summary');
  if (document.activeElement !== s) return; const f = d.querySelector('.mmpop button'); if (f) setTimeout(() => { try { f.focus(); } catch (x) {} }, 0); }, true);

if (window.__PL_TEST) window.__ARB = {setView: v => setView(v), edit: i => chEditOpen(i), scout: n => chScoutOpen(n), share: () => openShareCard(), members: () => members(), S: () => S, ARB};
