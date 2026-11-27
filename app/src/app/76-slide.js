/* ======================= Sliding pickers (Sim, Nov 10: "do that for every page") =======================
   Every one-choice switch with 2 or 3 choices (switching pages, like Speed Tiers · Damage Calc · Type Chart, and simple settings,
   like Light · Dark or Megas 0 · 1 · 2) looks and moves like the iPhone Control Center picker: one rounded track, an icon in a
   circle over each name, and the chosen circle slides to the new choice. Groups that let you turn on several things at once
   (Field, Speed conditions) and the 5-6 choice ones (Weather, Terrain, box sort) keep their buttons: a sliding circle can't show
   several picks, and 5-6 circles are too cramped on a phone (Sim chose this scope, Nov 10).
   The buttons stay the same buttons (names, data-view, aria-pressed, click handlers): only their inside gets an icon, so taps,
   keyboard, screen readers and tests work as before. A group is turned into a slider only when every choice has an icon here. */
const SLIDE = {
  P: SLIDE_P,
  /* each choice's name (lowercase, as the page writes it) to its icon; a name that starts with a key also matches it */
  N: SLIDE_N,
  icon(t) { t = t.trim().toLowerCase(); if (/^\d$/.test(t)) return {num: t};
    const k = SLIDE.N[t] ? t : Object.keys(SLIDE.N).find(k => t.startsWith(k + ':') || t.startsWith(k + ' ')); return k ? {svg: SLIDE.P[SLIDE.N[k]]} : null; },
  on: b => b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-selected') === 'true' && !b.parentElement.querySelector(':scope > [aria-pressed]') || b.classList.contains('on'),
  btns: s => [...s.querySelectorAll(':scope > button')],
  /* the last choice seen in each group, so a group that is redrawn (or the next page's switcher) slides from where it was */
  mem: {},
  key(s) { const bs = SLIDE.btns(s); if (bs.every(b => b.dataset.view)) return 'nav:' + bs.map(b => b.dataset.view).join(','); const p = s.closest('[data-pane]');
    return (p ? p.dataset.pane : 'side') + ':' + (s.getAttribute('aria-label') || bs.map(b => b.dataset.slt || b.textContent.trim()).join('/')); },
  fits(s) { const bs = SLIDE.btns(s); if (bs.length < 2 || bs.length > (s.classList.contains('ar-jumps') ? 4 : 3) || s.querySelector(':scope > :not(button):not(.ar-slpill)')) return false;
    if (bs.some(b => b.getAttribute('aria-pressed') === 'mixed')) return false; return bs.every(b => SLIDE.icon(b.dataset.slt || b.textContent)); },
  dress(b) { if (b.querySelector(':scope > .ar-slic')) return; const t = b.textContent.trim(), ic = SLIDE.icon(b.dataset.slt || t); if (!ic) return; b.dataset.slt = t;
    b.innerHTML = `<span class="ar-slic" aria-hidden="true">${ic.num ? `<b>${ic.num}</b>` : `<svg viewBox="0 0 24 24">${ic.svg}</svg>`}</span><span class="ar-sllb">${esc(t)}</span>`;
    try { TCASE.run(b); } catch (e) {} /* page names keep their Title Case (Speed Tiers, My Box), as on the plain buttons; before Title Case has loaded (first draw) this throws, and Title Case then fixes the whole page when it starts */ /* before Title Case has loaded (first draw) this throws; Title Case then fixes the whole page when it starts */ /* page names keep their Title Case (Speed Tiers), as on the plain buttons */ },
  reduce: () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
  /* show the circle at `from` for one painted frame, then slide it to `to`. No forced layout: forcing one (the Nov 10 first
     version) also froze every other redrawn slider's new circle at the first choice, so it jerked across (Sim's video, Build page) */
  slideFrom(s, from, to) { s.classList.add('no-anim'); s.style.setProperty('--i', from);
    requestAnimationFrame(() => { s.classList.remove('no-anim'); requestAnimationFrame(() => s.style.setProperty('--i', to)); }); },
  scan() { SLIDE.queued = false;
    document.querySelectorAll(':is(.seg:not(.lmodes),.themeseg:not(.tabtheme),.ar-jumps):not(.ar-slide)').forEach(s => { if (!SLIDE.fits(s)) return; const bs = SLIDE.btns(s);
      /* the new circle is placed where it belongs before it first shows, so it never slides in from the first choice */
      const i = bs.findIndex(SLIDE.on); s.style.setProperty('--i', Math.max(0, i)); s.style.setProperty('--n', bs.length);
      s.classList.add('ar-slide', 'no-anim'); if (bs.every(b => /^\d$/.test(b.textContent.trim()))) s.classList.add('ar-slnum');
      s.insertAdjacentHTML('afterbegin', '<i class="ar-slpill" aria-hidden="true"></i>'); requestAnimationFrame(() => s.classList.remove('no-anim')); });
    document.querySelectorAll(':is(.seg,.themeseg,.ar-jumps).ar-slide').forEach(s => { const bs = SLIDE.btns(s); bs.forEach(SLIDE.dress); SLIDE.watch(s); const i = bs.findIndex(SLIDE.on);
      s.classList.toggle('ar-slnone', i < 0); if (i < 0) return;
      const vis = !!(s.offsetParent || s.getClientRects().length), k = SLIDE.key(s), m = SLIDE.mem[k];
      if (!vis) { if (s.style.getPropertyValue('--i') !== String(i)) s.style.setProperty('--i', i); delete s.dataset.sli; return; }
      if (s.dataset.sli === String(i)) return;
      const first = s.dataset.sli == null; s.dataset.sli = i; SLIDE.mem[k] = i;
      /* first time on screen (a redraw, or the next page's switcher): slide from the last choice seen; otherwise the same circle simply moves */
      if (first && m != null && m !== i && !SLIDE.reduce()) SLIDE.slideFrom(s, m, i); else s.style.setProperty('--i', i); }); },
  queue() { if (SLIDE.queued) return; SLIDE.queued = true; requestAnimationFrame(SLIDE.scan); },
  /* Polish Batch 1 (Nov 10): no uneven labels. If some names in a group wrap and others don't ("Tier board" on two lines beside
     "Meta map" on one), every name breaks between its words (.ar-slwrap), so they sit as an even set; if that still leaves them
     uneven (a one-word name beside two-word ones), the group goes back to normal wrapping. Measured in a ResizeObserver, after
     layout, so it never forces one (the Nov 10 jumpy-slide lesson) and it follows any window resize. */
  lines(b) { const l = b.querySelector('.ar-sllb'); if (!l) return 1; const r = document.createRange(); r.selectNodeContents(l); const t = new Set(); for (const q of r.getClientRects()) if (q.width > 1 && q.height > 4) t.add(Math.round(q.top / 4)); return t.size || 1; },
  even(s) { if (!s.isConnected || s.classList.contains('ar-slnum') || !s.getClientRects().length) return; const bs = SLIDE.btns(s); s.classList.remove('ar-slwrap');
    let ls = bs.map(SLIDE.lines); if (!(Math.max(...ls) > 1 && Math.min(...ls) === 1)) return;
    s.classList.add('ar-slwrap'); ls = bs.map(SLIDE.lines); if (Math.max(...ls) > 2 || new Set(ls).size > 1) s.classList.remove('ar-slwrap'); },
  ro: null,
  watch(s) { if (s.dataset.slw) return; s.dataset.slw = 1; try { (SLIDE.ro = SLIDE.ro || new ResizeObserver(es => es.forEach(e => SLIDE.even(e.target)))).observe(s); } catch (e) {} }
};
safe('slide pickers', () => { SLIDE.scan(); new MutationObserver(SLIDE.queue).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-selected', 'class', 'hidden']}); });
CH.wrap('setView', () => SLIDE.scan());
