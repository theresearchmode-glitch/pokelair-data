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
  if (s.at.length) { const m = all.find(x => s.at.every(([k, v]) => x.getAttribute(k) === v)); if (m) return m; }
  return all.find(x => KP.txt(x) === s.txt) || null; };
KP.pinned = el => { for (let x = el; x && x !== document.body; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
KP.overlay = () => ['chEdit', 'chScout', 'lairSheet', 'jump', 'fbSheet', 'shareBox'].some(id => { const x = document.getElementById(id); return x && !x.hidden; });
/* window, capture phase: measured before any of the app's own click handlers redraw anything */
addEventListener('click', e => { const el = e.target && e.target.closest && e.target.closest(KP.CTRL); if (!el || el.closest(KP.SKIP) || !document.body.contains(el)) return;
  if (KP.pinned(el)) return;
  const s = KP.sig(el), top = el.getBoundingClientRect().top, y0 = scrollY, t0 = Date.now(), pg0 = document.documentElement.dataset.pg, ov0 = KP.overlay();
  const w = KP.w = {t0}; let y = y0; const fix = () => { if (document.documentElement.dataset.pg !== pg0 || (!ov0 && KP.overlay()) || KP.userAt > t0 || KP.w !== w) return false;
    if (KP.appAt >= t0 && Math.abs(KP.appTo - y0) > 2) return false; // the app scrolled somewhere on purpose (a "jump to" link)
    const n = KP.find(el, s); if (!n) return null; if (KP.pinned(n)) return false; const d = n.getBoundingClientRect().top - top; if (Math.abs(d) <= 4) return true;
    const opened = n.getAttribute('aria-expanded') === 'true' || (n.tagName === 'SUMMARY' && n.parentElement && n.parentElement.open);
    if (d > 0 && (opened || KP.MORE.test(KP.txt(n)) || KP.MORE.test(s.txt))) return false; // "more" opened content above itself: leave it
    KP.own = true; try { scrollBy(0, d); } finally { KP.own = false; } KP.movedAt = Date.now(); y = scrollY; return true; };
  /* checked on every frame for the first 0.8 s, before the screen is painted (Nov 7 shake sweep): a page that redraws in pieces
     (the Undo bar first, the list a moment later) used to show each piece's push for a frame or more before being corrected */
  const t0f = performance.now(), loop = () => { if (fix() === false) return; if (performance.now() - t0f < 800) requestAnimationFrame(loop); };
  requestAnimationFrame(loop); }, true);
/* dropdown menus ("⋯" on My team and Saved teams): an outside tap or Escape closes them (they used to stay open over the page) */
document.addEventListener('click', e => { const open = document.querySelectorAll('details.moremenu[open]'); if (!open.length) return;
  for (const d of open) if (!d.contains(e.target)) d.open = false; }, true);
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; for (const d of document.querySelectorAll('details.moremenu[open]')) { d.open = false; const s = d.querySelector('summary'); if (s && d.contains(document.activeElement)) try { s.focus({preventScroll: true}); } catch (x) {} } });
/* "?" popovers sit on the page, not inside a sheet: when the sheet (or any box) scrolls under them, they close instead of
   drifting over other text (window scroll already closed them) */
document.addEventListener('scroll', e => { if (e.target !== document && typeof closeTip === 'function' && document.getElementById('tipPop')) closeTip(); }, {passive: true, capture: true});
