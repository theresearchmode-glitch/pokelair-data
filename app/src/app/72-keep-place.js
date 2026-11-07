/* ===== Keep your place (Nov 4, after Sim's sheet-tab report: "little bugs like that") =====
   A sweep (tools/jumpsweep.mjs) tapped every in-place control on every page at 390 (touch) and 1280. Many of them redraw part
   of the page; when the content above the control changes height, the control jumped away under the finger (the type chips on
   Ratings and Type chart, the picks in "Log a game", Tournaments / Ladder on Popular sets, Apply, Load team, folding a long list).
   This keeps the tapped control where it was on screen:
   - after the tap, once the page has redrawn (next frame, and again shortly after for redraws that wait a frame), the same control
     is found again (the same element, or one with the same data-* / id / label, or the same text) and the page is scrolled by
     however far it moved;
   - not when the tap went to another page or opened a sheet or the search (going to the top of a new page is intended), not when
     the app itself scrolled on purpose (a "jump to the result" link), not when the reader has scrolled since the tap, not for
     controls in a fixed or sticky bar, and not when a "more" button opens content above itself (the new rows appear where the
     reader is looking; the button moving down is the point).
   Nothing is removed and no control changes; this only scrolls. */
const KP = {userAt: 0, CTRL: 'button,summary,[role=tab],[role=button],label,input[type=checkbox],input[type=radio]',
  SKIP: '[data-view],[data-lt],[data-chset],[data-lsheet],[data-chthr],.chtr,.chtile,.jumpbtn,a[href],#lairSheet *,#chEdit *,#chScout *,#jump *,#fbSheet *,#shareBox *,.bnav *,.sidenav *,.side *,#tipPop *',
  MORE: /\bmore\b|show all|^\+\d|^ranks \d|more ideas|showing \d/i};
['wheel', 'touchmove', 'keydown'].forEach(t => { try { addEventListener(t, () => { KP.userAt = Date.now(); }, {passive: true, capture: true}); } catch (e) {} });
/* the app's own scrolls (scrollTo / scrollBy / scrollIntoView) are recorded, so a deliberate "jump to the result" is left alone;
   the browser's scroll anchoring and clamping are not scrolls the app asked for */
KP.appAt = 0; KP.appTo = 0; KP.own = false;
/* iPhone (Sim, Nov 7: "the menu bar is stuck under the page", fine again after a reload): when the page scrolls itself while the
   reader's finger or momentum is scrolling it, iOS can leave a fixed bar drawn in the wrong place. After any scroll the page
   makes itself, the bottom bar and the top bar are redrawn once the scrolling settles (a one-frame layer refresh, nothing moves). */
KP.redrawBars = (() => { let t = 0; const go = () => { t = 0; for (const n of document.querySelectorAll('.bnav,.topbar,header.top')) { const v = n.style.transform; n.style.transform = 'translateZ(0)'; void n.offsetHeight; requestAnimationFrame(() => { n.style.transform = v; }); } };
  return () => { clearTimeout(t); t = setTimeout(go, 220); }; })();
addEventListener('scroll', () => { if (Date.now() - KP.appAt < 1500 || KP.ownAt && Date.now() - KP.ownAt < 1500) KP.redrawBars(); }, {passive: true});
// also once the page has loaded (fonts in, first redraws done) and whenever the visible screen changes size (the app's own bars
// showing or hiding, rotation): the same redraw (Sim, Nov 7: the bar was below the screen on first opening)
addEventListener('load', () => { KP.redrawBars(); setTimeout(KP.redrawBars, 1500); });
try { document.fonts && document.fonts.ready.then(() => KP.redrawBars()); } catch (e) {}
try { if (window.visualViewport) visualViewport.addEventListener('resize', () => KP.redrawBars()); } catch (e) {}
addEventListener('resize', () => KP.redrawBars());
{ const W = window, sTo = W.scrollTo.bind(W), sBy = W.scrollBy.bind(W), sIV = Element.prototype.scrollIntoView;
  const note = to => { if (!KP.own) { KP.appAt = Date.now(); KP.appTo = to; } };
  W.scrollTo = function (a, b) { note(typeof a === 'object' && a ? (a.top != null ? +a.top : scrollY) : +b); return sTo.apply(null, arguments); };
  W.scrollBy = function (a, b) { note(scrollY + (typeof a === 'object' && a ? +(a.top || 0) : +b || 0)); return sBy.apply(null, arguments); };
  Element.prototype.scrollIntoView = function () { if (!this.closest || !this.closest('#lairSheet,#chEdit,#jump,.subnav')) note(-1e9); return sIV.apply(this, arguments); }; }
KP.txt = el => (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60);
KP.sig = el => ({tag: el.tagName, at: [...el.attributes].filter(a => (/^data-/.test(a.name) || a.name === 'id' || a.name === 'aria-label') && !/^data-(swid|ctj|pm)$/.test(a.name)).map(a => [a.name, a.value]), txt: KP.txt(el)});
KP.vis = el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
KP.find = (el, s) => { if (el.isConnected && KP.vis(el)) return el;
  const all = [...document.querySelectorAll(s.tag)].filter(KP.vis);
  /* the same control redrawn: same attributes and the same label (numbers in it may change, "Show more (450 left)"); a
     different card that took its place ("Swap out Delphox" where "Swap out Salamence" was) is not it (Nov 7 shake sweep) */
  const nt = t => t.replace(/\d+/g, '#'), st = nt(s.txt);
  if (s.at.length) { const m = all.find(x => s.at.every(([k, v]) => x.getAttribute(k) === v) && nt(KP.txt(x)) === st); if (m) return m; }
  return all.find(x => KP.txt(x) === s.txt) || null; };
KP.pinned = el => { for (let x = el; x && x !== document.body; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
KP.overlay = () => ['chEdit', 'chScout', 'lairSheet', 'jump', 'fbSheet', 'shareBox'].some(id => { const x = document.getElementById(id); return x && !x.hidden; });
/* window, capture phase: measured before any of the app's own click handlers redraw anything */
addEventListener('click', e => { const el = e.target && e.target.closest && e.target.closest(KP.CTRL); if (!el || el.closest(KP.SKIP) || !document.body.contains(el)) return;
  if (KP.pinned(el)) return;
  const s = KP.sig(el), top = el.getBoundingClientRect().top, y0 = scrollY, t0 = Date.now(), pg0 = document.documentElement.dataset.pg, ov0 = KP.overlay();
  const w = KP.w = {t0}; KP.last = {el, s, t0}; let y = y0; const fix = () => { if (document.documentElement.dataset.pg !== pg0 || (!ov0 && KP.overlay()) || KP.userAt > t0 || KP.w !== w) return false;
    if (KP.appAt >= t0 && Math.abs(KP.appTo - y0) > 2) return false; // the app scrolled somewhere on purpose (a "jump to" link)
    const n = KP.find(el, s); if (!n) return null; if (KP.pinned(n)) return false; const d = n.getBoundingClientRect().top - top; if (Math.abs(d) <= 4) return true;
    // a "more" button opened rows above itself: leave it (the rows appear where you're looking). A Details button that opens a
    // line above itself stays under the finger (Nov 7 shake sweep)
    if (d > 0 && (KP.MORE.test(KP.txt(n)) || KP.MORE.test(s.txt))) return false;
    KP.own = true; try { scrollBy(0, d); } finally { KP.own = false; } KP.movedAt = KP.ownAt = Date.now(); y = scrollY; return true; };
  /* checked on every frame for the first 0.8 s, before the screen is painted (Nov 7 shake sweep): a page that redraws in pieces
     (the Undo bar first, the list a moment later) used to show each piece's push for a frame or more before being corrected */
  const t0f = performance.now(), loop = () => { if (fix() === false) return; if (performance.now() - t0f < 800) requestAnimationFrame(loop); };
  KP.lastFix = fix; requestAnimationFrame(loop);
  /* and whenever the page changes size in that time: a resize is reported after the page is laid out and before it is drawn,
     so a redraw that runs late in a frame (after the check above) is caught in the same frame (Nov 7 shake sweep) */
  try { if (KP.ro) KP.ro.disconnect(); const pane = document.querySelector('[data-pane]:not([hidden])') || document.body; let stop = false;
    KP.ro = new ResizeObserver(() => { if (stop || performance.now() - t0f > 1200 || fix() === false) { stop = true; KP.ro && KP.ro.disconnect(); } }); KP.ro.observe(pane); } catch (e) {} }, true);
/* a redraw that lands later (the suggestions finish working out): the tapped control is put back at once, before the screen is
   drawn, and watched for another 0.8 s */
KP.hold = () => { const f = KP.lastFix; if (!f || !KP.recent()) return false; if (f() === false) return false; const t = performance.now(), loop = () => { if (f() === false) return; if (performance.now() - t < 800) requestAnimationFrame(loop); }; requestAnimationFrame(loop); return true; };
/* the control tapped in the last 4 s, as it is on the page now (null once the reader has scrolled): a redraw that finishes
   later (the suggestions working out) keeps this in place rather than the first thing on screen (Nov 7 shake sweep) */
KP.recent = () => { const L = KP.last; if (!L || Date.now() - L.t0 > 4000 || KP.userAt > L.t0) return null; const n = KP.find(L.el, L.s); return n && !KP.pinned(n) ? n : null; };
/* dropdown menus ("⋯" on My team and Saved teams): an outside tap or Escape closes them (they used to stay open over the page) */
document.addEventListener('click', e => { const open = document.querySelectorAll('details.moremenu[open]'); if (!open.length) return;
  for (const d of open) if (!d.contains(e.target)) d.open = false; }, true);
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; for (const d of document.querySelectorAll('details.moremenu[open]')) { d.open = false; const s = d.querySelector('summary'); if (s && d.contains(document.activeElement)) try { s.focus({preventScroll: true}); } catch (x) {} } });
/* "?" popovers sit on the page, not inside a sheet: when the sheet (or any box) scrolls under them, they close instead of
   drifting over other text (window scroll already closed them) */
document.addEventListener('scroll', e => { if (e.target !== document && typeof closeTip === 'function' && document.getElementById('tipPop')) closeTip(); }, {passive: true, capture: true});
