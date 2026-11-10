/* ======================= Sliding pickers (Sim, Nov 10: "do that for every page") =======================
   Every one-choice switch with 2 or 3 choices (switching pages, like Speed Tiers · Damage Calc · Type Chart, and simple settings,
   like Light · Dark or Megas 0 · 1 · 2) looks and moves like the iPhone Control Center picker: one rounded track, an icon in a
   circle over each name, and the chosen circle slides to the new choice. Groups that let you turn on several things at once
   (Field, Speed conditions) and the 5-6 choice ones (Weather, Terrain, box sort) keep their buttons: a sliding circle can't show
   several picks, and 5-6 circles are too cramped on a phone (Sim chose this scope, Nov 10).
   The buttons stay the same buttons (names, data-view, aria-pressed, click handlers): only their inside gets an icon, so taps,
   keyboard, screen readers and tests work as before. A group is turned into a slider only when every choice has an icon here. */
const SLIDE = {
  P: {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    aim: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    grid4: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    bars: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
    list3: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    gem: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16M15 4l-3 16"/>',
    box: '<path d="M3.5 8 12 4l8.5 4v8L12 20l-8.5-4z"/><path d="m3.5 8 8.5 4 8.5-4M12 12v8"/>',
    boxplus: '<path d="M3.5 8 12 4l8.5 4v4.5"/><path d="M3.5 8v8L12 20M3.5 8l8.5 4 8.5-4M12 12v8"/><path d="M18 15v6M15 18h6"/>',
    dots6: '<circle cx="6" cy="8" r="2"/><circle cx="12" cy="8" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="6" cy="16" r="2"/><circle cx="12" cy="16" r="2"/><circle cx="18" cy="16" r="2"/>',
    dots2: '<circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/>',
    dots3: '<circle cx="12" cy="7" r="2.5"/><circle cx="7" cy="16" r="2.5"/><circle cx="17" cy="16" r="2.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    sword: '<path d="M14.5 3H21v6.5L10 20.5 3.5 14z"/><path d="M6 15l3 3M3 21l3-3"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    az: '<path d="M4 18 7.5 6 11 18M5.2 14h4.6M14 6h6l-6 12h6"/>',
    gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/>',
    pad: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="16" cy="11.5" r=".9"/><circle cx="18" cy="13.8" r=".9"/>',
    ladder: '<path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10"/>',
    spark: '<path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z"/><path d="M19 15c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z"/>',
    right: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    left: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    flag: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
    auto: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'
  },
  /* each choice's name (lowercase, as the page writes it) to its icon; a name that starts with a key also matches it */
  N: {'speed tiers': 'bolt', 'damage calc': 'aim', 'type chart': 'grid', 'rating': 'star', 'usage': 'bars', 'sets': 'list',
    'winning teams': 'trophy', 'events': 'cal', 'archetypes': 'layers', 'top rated': 'star', 'hidden gems': 'gem', 'most used': 'bars',
    'my box': 'box', 'box + catch': 'boxplus', 'whole roster': 'dots6', 'no': 'x', 'yes': 'check', 'top 10': 'list3', 'top 12 grid': 'grid4',
    'all 30': 'list', 'offense': 'sword', 'defense': 'shield', 'pairs': 'dots2', 'trios': 'dots3', 'full teams': 'dots6', 'recent': 'clock',
    'name': 'az', 'readiness': 'gauge', 'in-game ranked': 'pad', 'tournaments': 'trophy', 'showdown ladder': 'ladder', 'showdown': 'ladder',
    'best data': 'spark', 'your hits on them': 'right', 'their hits on you': 'left', 'race track': 'flag', 'list view': 'list',
    'auto': 'auto', 'light': 'sun', 'dark': 'moon'},
  icon(t) { t = t.trim().toLowerCase(); if (/^\d$/.test(t)) return {num: t};
    const k = SLIDE.N[t] ? t : Object.keys(SLIDE.N).find(k => t.startsWith(k + ':') || t.startsWith(k + ' ')); return k ? {svg: SLIDE.P[SLIDE.N[k]]} : null; },
  on: b => b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-selected') === 'true' && !b.parentElement.querySelector(':scope > [aria-pressed]') || b.classList.contains('on'),
  btns: s => [...s.querySelectorAll(':scope > button')],
  /* the last choice seen in each group, so a group that is redrawn (or the next page's switcher) slides from where it was */
  mem: {},
  key(s) { const bs = SLIDE.btns(s); if (bs.every(b => b.dataset.view)) return 'nav:' + bs.map(b => b.dataset.view).join(','); const p = s.closest('[data-pane]');
    return (p ? p.dataset.pane : 'side') + ':' + (s.getAttribute('aria-label') || bs.map(b => b.dataset.slt || b.textContent.trim()).join('/')); },
  fits(s) { const bs = SLIDE.btns(s); if (bs.length < 2 || bs.length > 3 || s.querySelector(':scope > :not(button):not(.ar-slpill)')) return false;
    if (bs.some(b => b.getAttribute('aria-pressed') === 'mixed')) return false; return bs.every(b => SLIDE.icon(b.dataset.slt || b.textContent)); },
  dress(b) { if (b.querySelector(':scope > .ar-slic')) return; const t = b.textContent.trim(), ic = SLIDE.icon(b.dataset.slt || t); if (!ic) return; b.dataset.slt = t;
    b.innerHTML = `<span class="ar-slic" aria-hidden="true">${ic.num ? `<b>${ic.num}</b>` : `<svg viewBox="0 0 24 24">${ic.svg}</svg>`}</span><span class="ar-sllb">${esc(t)}</span>`;
    if (typeof TCASE !== 'undefined') TCASE.run(b); /* page names keep their Title Case (Speed Tiers), as on the plain buttons */ },
  reduce: () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
  scan() { SLIDE.queued = false;
    document.querySelectorAll(':is(.seg,.themeseg:not(.tabtheme)):not(.ar-slide)').forEach(s => { if (!SLIDE.fits(s)) return; const bs = SLIDE.btns(s);
      s.classList.add('ar-slide'); if (bs.every(b => /^\d$/.test(b.textContent.trim()))) s.classList.add('ar-slnum');
      s.style.setProperty('--n', bs.length); s.insertAdjacentHTML('afterbegin', '<i class="ar-slpill" aria-hidden="true"></i>'); });
    document.querySelectorAll(':is(.seg,.themeseg).ar-slide').forEach(s => { const bs = SLIDE.btns(s); bs.forEach(SLIDE.dress); const i = bs.findIndex(SLIDE.on);
      s.classList.toggle('ar-slnone', i < 0); if (i < 0) return;
      const vis = !!(s.offsetParent || s.getClientRects().length), k = SLIDE.key(s), m = SLIDE.mem[k];
      if (!vis) { if (s.style.getPropertyValue('--i') !== String(i)) s.style.setProperty('--i', i); delete s.dataset.sli; return; }
      if (s.dataset.sli === String(i)) return;
      if (m != null && m !== i && !SLIDE.reduce()) { s.classList.add('no-anim'); s.style.setProperty('--i', m); void s.offsetWidth; s.classList.remove('no-anim');
        requestAnimationFrame(() => requestAnimationFrame(() => s.style.setProperty('--i', i))); }
      else s.style.setProperty('--i', i);
      s.dataset.sli = i; SLIDE.mem[k] = i; }); },
  queue() { if (SLIDE.queued) return; SLIDE.queued = true; requestAnimationFrame(SLIDE.scan); }
};
safe('slide pickers', () => { SLIDE.scan(); new MutationObserver(SLIDE.queue).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-selected', 'class', 'hidden']}); });
CH.wrap('setView', () => SLIDE.scan());
