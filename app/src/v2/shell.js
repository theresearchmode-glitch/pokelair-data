// ---------- NastyPlot v2 shell (R3, Nov 11): header, navigation, phone bar, footer, theme, routing ----------
// Pages register themselves in V2.pages; the shell draws the frame and the current page from location.hash (#home, #team...).
// Art: one place for every Pokémon picture (V2.art), so the art can be swapped in one line (ownership rule, Nov 11).
const V2 = window.V2 = {pages: {}, ART_BASE: window.NP_ART || 'art/'};
V2.art = (id, big) => id == null || id === '' ? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' : (big ? V2.ART_BASE : V2.ART_SMALL) + id + '.webp';
// Sim (Nov 17, sprites A): every direct sprite image is drawn 80px or smaller (measured on every page, 320-1920), so it takes the 240px file
// (art-s/, looks the same at iPhone 3x; all sprites 7.6 -> 4.7 MB); V2.mon keeps today's 384px file unless it is set to 80px or less.
// If a small file is missing the image falls back to the full-size one (V2.artFix).
// Claude-hosted builds (--one-art-size: an artifact holds at most 511 files) keep one size: the small spots use the 384px file too.
V2.ART_SMALL = window.NP_ONE_ART ? V2.ART_BASE : V2.ART_BASE.replace(/\/?$/, '') + '-s/';
V2.artFix = e => { const i = e.target; if (i && i.tagName === 'IMG' && i.src.includes('-s/') && !i.dataset.full) { i.dataset.full = 1; i.src = i.src.replace(/-s\/(\d+\.webp)/, '/$1'); } };
addEventListener('error', V2.artFix, true); /* code review C8: a Pokémon with no picture asked for v2art/undefined.webp; now a blank 1px image */
V2.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[m]);
V2.LS = {get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }, del: k => { try { localStorage.removeItem(k); } catch (e) {} }};
// the five places, in the order players use them (Sim, Nov 11: Home is in the menu)
// type colours live in app/src/v2/css/tokens.css (--ty-Dragon...); an unknown type falls back to --type-none
V2.TYPES = ['Dragon','Ground','Fighting','Poison','Dark','Steel','Fire','Water','Grass','Fairy','Flying','Ghost','Psychic','Ice','Rock','Electric','Normal','Bug'];
// type symbols (Sim approved the look, Nov 21, 3:35 PM; mock docs/rebuild/mocks/type-symbols): the chip shows the type's symbol before its word,
// never the symbol alone. V2.kTy lives in kit.js, which loads after this file, so it is looked up when a chip is drawn, not here.
// V2.typeWord is the chip without the symbol, for the dense spots where a symbol would crowd (Ratings rows, the Suggestions defence
// table: docs/rebuild/research/type-symbols-nov21.md). Both take only the type, so .map(V2.typeChip) stays safe.
V2.typeChipX = (t, sym) => { const ok = V2.TYPES.includes(t), ic = sym && ok && V2.kTy ? V2.kTy(t) : '';
  return `<span class="np-type${ic ? ' sym' : ''}"${ok ? ` style="--tc:var(--ty-${t})"` : ''}>${ic}${V2.esc(t)}</span>`; };
V2.typeChip = t => V2.typeChipX(t, true);
V2.typeWord = t => V2.typeChipX(t, false);
// a Pokémon by its site name (ROSTER .n), drawn standing on its floor; opts: {sel, sub, iw}
V2.byName = new Map((typeof ROSTER === 'object' ? ROSTER : []).map(p => [p.n, p]));
V2.disp = n => { const p = V2.byName.get(n); return p && p.d ? p.d : n.replace(/^(.*)-Mega(?:-(\w+))?$/, (m, b, x) => 'Mega ' + b + (x ? ' ' + x : '')); };
// a form letter never sits alone on a line ("Charizard Y"); a long Mega name breaks only after "Mega" (Sim, Nov 12)
// a lone form letter stays with the word before it ('Charizard Y', 'Charizardite Y', 'Charizard Y\'s'; Nov 12 rule), for text built elsewhere
V2.keepForm = h => String(h).replace(/([A-Za-z]) ([XYZ])(?![A-Za-z])/g, '$1\u00a0$2');
V2.tileName = d => V2.esc(String(d).replace(/^Mega /, '')).replace(/ ([XYZ])$/, '\u00a0$1'); // a tile's name without 'Mega' (the tag says it)
V2.nameHtml = d => d.startsWith('Mega ') ? `<span class="mg">Mega</span> ${V2.esc(d.slice(5)).replace(/ ([XYZ])$/, '\u00a0$1')}` : `<span class="mg none" aria-hidden="true">&nbsp;</span>${V2.esc(d)}`;
// a Pokémon's own colour (already normalised: hue kept, saturation 72%+, lightness 56%) as an r,g,b triplet for rgba()
V2.cp = n => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165]; return m[0] + ',' + m[1] + ',' + m[2]; };
// A9 (Sim, Nov 12: "fix pls"): on a Pokémon tile "Mega" is a small slanted tag on the picture's corner, so every name block is the
// same shape (no reserved blank line above every name); elsewhere (rows, sentences) Mega stays inline before the name (nameHtml)
// o.tag (i42, Nov 13): a bare tile that writes its own name still gets the corner Mega tag (A9), so its name never wraps below its neighbours
V2.mon = (n, o = {}) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165, 0];
  return `<div class="np-mon${o.sel ? ' sel' : ''}${o.ft ? ' ft' : ''}" style="--cp:${m[0]},${m[1]},${m[2]};--fo:${m[3]}${o.iw ? ';--iw:' + o.iw + 'px' : ''}"><div class="st"><i class="pool" aria-hidden="true"></i>${id ? `<img src="${V2.art(id, !(o.iw && o.iw <= 80) || o.big)}" alt="" loading="lazy" decoding="async">` : ''}${V2.disp(n).startsWith('Mega ') && (!o.bare || o.tag) ? '<span class="np-megatag">Mega</span>' : ''}</div>${o.bare ? '' : `<b>${V2.esc(V2.disp(n).replace(/^Mega /, ''))}</b>`}${o.sub ? `<small>${V2.esc(o.sub)}</small>` : ''}</div>`; };
// drawn icons (the ⌕ glyph renders tiny in Instrument Sans)
V2.ICON = {fwd: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5 16.5 12 9 19.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>', back: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4.5 7.5 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>', search: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  // My Box: a storage box (lid, body, handle slot), drawn like the search glass
  // My Box (Sim, Nov 12): a Pokémon PC with a Poké Ball on its screen (option A: "easiest to identify"), same line weight as the other icons
  box: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/><circle cx="12" cy="10" r="3.4"/><path d="M8.6 10h6.8"/></g></svg>',
  // Day/Night as a sun and a moon (Sim, Nov 12: not the words; today's site shows the mode you're in: a sun by day, a moon at night)
  sun: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/></g></svg>',
  auto: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 3.6a8.4 8.4 0 0 1 0 16.8z" fill="currentColor"/></svg>',
  moon: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>'};
// The site's own × in every search box (behaviour test X-05; today's site has had one since Oct 30, 61-concept-h-pages.js clrWrap).
// Each box puts V2.CLR right after its input inside the .np-field. CSS shows it only while the box has text (:placeholder-shown) and
// hides the browser's own × (Chrome draws one, iPhone Safari may not), so there is one × everywhere. One tap empties the box, keeps
// focus in it (pointerdown/mousedown never take focus, so the phone keyboard stays up) and fires the box's 'input', so its list updates.
// Not a Tab stop (as today's): the keyboard clears with select-all and Delete, and Tab goes from the box straight on.
V2.CLR = '<button type="button" class="np-clr" data-v2clr tabindex="-1" aria-label="Clear"><svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>';
for (const ev of ['pointerdown', 'mousedown']) document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('[data-v2clr]')) e.preventDefault(); }, true);
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2clr]'); if (!b) return; e.preventDefault();
  const f = b.closest('.np-field'), i = f && f.querySelector('input'); if (!i) return;
  try { i.focus({preventScroll: true}); } catch (x) { i.focus(); } i.value = ''; i.dispatchEvent(new Event('input', {bubbles: true}));
  if (i.isConnected && document.activeElement !== i) try { i.focus({preventScroll: true}); } catch (x) {} });
// one toast at a time, always just above the team dock and the phone bar (whichever is higher on screen)
// code review C8: one Undo for actions outside the team's own Undo (a deleted game, cleared Their Six): the toast's button runs restore
/* one Undo time everywhere: 10 s (Sim's design review #2, Nov 18: 'one Undo time of at least 10 s, paused on hover/focus'; the pause is in V2.toast) */
V2.UNDO_MS = 10000;
V2.undoToast = (msg, restore) => { V2._undoFn = restore; return V2.toast(V2.esc(msg) + ' <button type="button" data-v2undo>Undo</button>', V2.UNDO_MS); };
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-v2undo]'))) return; const f = V2._undoFn; V2._undoFn = null; document.querySelectorAll('.np-toast,.np-sheet-undo').forEach(x => x.remove()); if (f) { try { f(); } catch (x) { console.error(x); } V2.toast('Undone'); } });
/* review Nov 18 (C1, C2): a place hold (Apply's in sugs.js, Remove's V2.rmHold in six.js) lets go on the player's wheel, touch, pointer
   or key, and also on any scroll it didn't make itself: a screen reader moving its cursor, find-in-page, a link to a spot, a script.
   It knows its own scrolls (mark() after each scrollBy, and each frame). A scroll that comes with a layout change (the held element
   moved in the page, or the page got shorter or longer: scroll anchoring, a clamp) is the layout's, so the hold keeps it. Leaving the
   page (hashchange, popstate) ends it too. tgt() is the element the hold keeps in place; the hold asks on() each frame. */
/* Nov 19 (CI run 1365, BR-C1b): a layout change landing in the same frame as an outside scroll (the suggestions' redraw as a script
   scrolls 1500px) made the whole scroll count as the layout's, and the hold pulled the page back. A layout's own scroll is never larger
   than the layout change itself (the held element's move or the page's change in height), so a bigger scroll is not the layout's. */
V2.holdGuard = tgt => { const ev = ['wheel', 'touchstart', 'pointerdown', 'keydown'], at = () => { const e = tgt(); return [e ? Math.round(e.getBoundingClientRect().top + scrollY) : null, document.documentElement.scrollHeight]; };
  let y = scrollY, sig = at(), done = false; const stop = () => { if (done) return; done = true; ev.forEach(n => removeEventListener(n, stop, true)); removeEventListener('scroll', seen); removeEventListener('hashchange', stop); removeEventListener('popstate', stop); };
  const lay = s => (s[0] == null) !== (sig[0] == null) ? Infinity : Math.max(Math.abs((s[0] || 0) - (sig[0] || 0)), Math.abs(s[1] - sig[1])); /* how far the layout moved since the hold's last look */
  const seen = () => { if (done) return; const s = at(), d = Math.abs(scrollY - y); if (d > 1 && d > lay(s) + 2 && !(performance.now() - (V2._smoothAt || -1e9) < 1500)) return stop(); y = scrollY; sig = s; }; /* a site smooth scroll from the last 1.5 s is the site's: the hold corrects it */
  ev.forEach(n => addEventListener(n, stop, {capture: true, passive: true})); addEventListener('scroll', seen, {passive: true}); addEventListener('hashchange', stop); addEventListener('popstate', stop);
  return {mark: () => { y = scrollY; sig = at(); }, stop, on: () => !done}; };
// smooth scrolling only when the device doesn't ask for reduced motion (code review C7: eight scrolls ignored it)
/* review Nov 18 (C1): when a smooth scroll starts is kept (V2._smoothAt): one the site started can still be gliding when a hold begins
   (a Card tap's, then Remove at once: it landed after the hold's first frame), and a hold must not take it for the player's */
V2.smooth = () => { try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'auto'; } catch (e) { return 'auto'; } V2._smoothAt = performance.now(); return 'smooth'; };
V2.toast = (html, ms = 4000) => { document.querySelectorAll('.np-toast').forEach(x => x.remove());
  const t = document.createElement('div'); t.className = 'np-toast'; t.setAttribute('role', 'status'); t.innerHTML = html; document.body.append(t);
  const tops = [...document.querySelectorAll('.np-dock,.np-bar')].map(e => e.getBoundingClientRect()).filter(r => r.height && r.top < innerHeight).map(r => r.top);
  if (tops.length) t.style.setProperty('--tb', (innerHeight - Math.min(...tops) + 12) + 'px'); // a custom property, so an open sheet can still move it (components.css)
  // code review B9b: a toast stays while it has keyboard focus or the pointer (its Undo was gone after 4 s even mid-reach)
  /* Sim Q2 (Nov 16, recommended A): while a sheet is open the toast sits under its backdrop (his Nov 11 rule), so an Undo moves into a bar at
     the top of the sheet (the Undo bar style Suggestions uses); the words stay in the toast; the bar goes with the next change or the sheet */
  { const sh = document.querySelector('.np-sheet'), ub = t.querySelector('#toastUndo,[data-v2undo],[data-bxundo]'); document.querySelectorAll('.np-sheet-undo').forEach(x => x.remove());
    if (sh && ub) { const bar = document.createElement('div'), m = document.createElement('span'); bar.className = 'sg2-undo np-sheet-undo'; bar.setAttribute('role', 'status');
      /* the toast keeps its own Undo (full test run, Nov 16: Clear Team closes its sheet right after, and an Undo moved into it went with it);
         the sheet's bar has a twin that presses the toast's, and the toast stays (under the backdrop) while the bar is up */
      const tw = document.createElement('button'); tw.type = 'button'; tw.className = 'np-btn2'; tw.innerHTML = '<span>Undo</span>'; tw.addEventListener('click', () => { if (ub.isConnected) ub.click(); bar.remove(); });
      m.textContent = t.textContent.replace(/\s*Undo\s*$/, ''); bar.append(m, tw); V2._ubar = bar;
      const host = [...sh.children].find(c => !c.classList.contains('x') && c.tagName !== 'BUTTON') || sh; host.prepend(bar); } }
  const gone = () => { if (t.matches(':focus-within,:hover') || (V2._ubar && V2._ubar.isConnected && t.contains(t.querySelector('#toastUndo,[data-v2undo],[data-bxundo]')))) { V2._tt = setTimeout(gone, 1000); return; } t.remove(); }; clearTimeout(V2._tt); V2._tt = setTimeout(gone, ms); return t; };
// Form errors reach the field (Sim's design review, Nov 19, #6; the non-visual part, nothing on screen changes): V2.fieldErr marks the
// field(s) in error with aria-invalid="true" and links them (aria-describedby) to the line that already explains the error, and moves the
// focus to the first one; V2.fieldOk takes both off again once it's fixed. Sim's W3b A (Nov 19): a 2px red edge on the field and the line in red
// with a '!' (.np-errmsg, components.css). Test: app/test/v2-formerr.mjs
V2.fieldErr = (fields, note, focus = true) => { fields = [].concat(fields).filter(Boolean); if (!fields.length) return;
  if (note && !note.id) note.id = 'np-err-' + (V2._errN = (V2._errN || 0) + 1);
  fields.forEach(f => { f.setAttribute('aria-invalid', 'true'); if (!note) return; f.dataset.errNote = note.id;
    const ids = (f.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean); if (!ids.includes(note.id)) f.setAttribute('aria-describedby', ids.concat(note.id).join(' ')); });
  if (note) note.classList.add('np-errmsg'); /* Sim's W3b A (Nov 19): the line shows as an error (components.css) */
  if (focus) fields[0].focus({preventScroll: false}); };
V2.fieldOk = fields => [].concat(fields).filter(Boolean).forEach(f => { f.removeAttribute('aria-invalid'); const id = f.dataset.errNote; if (!id) return; delete f.dataset.errNote;
  /* the line stops looking like an error once no field it explains is still in error */ const n = document.getElementById(id); if (n && !document.querySelector(`[data-err-note="${id}"]`)) n.classList.remove('np-errmsg');
  const ids = (f.getAttribute('aria-describedby') || '').split(/\s+/).filter(x => x && x !== id); if (ids.length) f.setAttribute('aria-describedby', ids.join(' ')); else f.removeAttribute('aria-describedby'); });
// Focus on slanted controls (audit P0, Nov 16): a control whose own shape (or a near parent's) is clipped gets .np-fin while focused, so its
// ring is drawn inside the shape (base.css); checked on focus, so any slanted control, now or later, is covered without a list of classes
document.addEventListener('focusin', e => { const t = e.target; if (!(t instanceof Element) || t.classList.contains('np-fin')) return;
  for (let el = t, k = 0; el && k < 3; el = el.parentElement, k++) { const cp = getComputedStyle(el).clipPath; if (cp && cp !== 'none' && !/^inset\(50%/.test(cp)) { t.classList.add('np-fin'); return; } } }, true);
// ---------- phones: keep an open sheet above the on-screen keyboard (Sim, Nov 11: the keyboard covered Save Team) ----------
// iOS draws the keyboard over fixed elements; visualViewport says how much of the screen is left, so --kb lifts and shortens
// the sheet (components.css), and the box being typed in is scrolled into view inside it.
(() => { const vv = window.visualViewport; if (!vv) return; let raf = 0;
  // Sim, Nov 12 (iPhone): scrolling an info sheet made it flash. Scrolling and bouncing resize the app's bars, so innerHeight vs
  // visualViewport flickered and the sheet's bottom/height (--kb) jumped with it. A keyboard can only be open while a text box has
  // focus, so --kb is 0 otherwise, and the properties are written only when they change.
  let last = '';
  const set = () => { raf = 0; const a = document.activeElement, typing = !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
    const kb = typing ? Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)) : 0, R = document.documentElement.style;
    const vals = [kb, typing ? Math.max(0, Math.round(vv.offsetTop)) : 0, typing ? Math.round(vv.height) : 0], key = vals.join(',');
    if (key !== last) { last = key; R.setProperty('--kb', vals[0] + 'px'); if (typing) { R.setProperty('--vvt', vals[1] + 'px'); R.setProperty('--vvh', vals[2] + 'px'); } }
    if (kb && a.closest && a.closest('.np-sheet')) a.scrollIntoView({block: 'nearest'}); };
  const later = () => { if (!raf) raf = requestAnimationFrame(set); };
  vv.addEventListener('resize', later); vv.addEventListener('scroll', later); set(); })();
// Sim, Nov 11 (iPhone, Claude app): typing in a sheet sent it off screen; inside the app's frame the keyboard height can't be
// trusted. While a box in a sheet has focus, the sheet pins to the top of what is visible instead (kbo, components.css).
document.addEventListener('focusin', e => { const t = e.target; if (t && t.closest && t.closest('.np-sheet') && /^(INPUT|TEXTAREA)$/.test(t.tagName)) document.documentElement.classList.add('kbo'); });
document.addEventListener('focusout', () => setTimeout(() => { const a = document.activeElement; if (!(a && a.closest && a.closest('.np-sheet') && /^(INPUT|TEXTAREA)$/.test(a.tagName))) document.documentElement.classList.remove('kbo'); }, 60));
// ---------- sheets: one at a time; focus moves in, stays in (Tab wraps), and returns to what opened it ----------
// Back closes what's open on top (X-06, as today's site): opening a sheet adds one history step at the same address, so the phone
// or browser Back button closes it and the page keeps its place; closing it with ✕, the backdrop or Escape takes that step back
// out quietly. A sheet closed by a move to another page leaves its step behind; Back steps over it.
V2.hist = {skip: 0, pop: false, t: null};
V2.histOpen = () => { clearTimeout(V2.hist.t); try { if (!(history.state && history.state.v2sh)) history.pushState(Object.assign({}, history.state, {v2sh: 1}), ''); } catch (e) {} };
V2.histClose = () => { if (V2.hist.pop) return; clearTimeout(V2.hist.t);
  V2.hist.t = setTimeout(() => { try { if (!V2._sheet && history.state && history.state.v2sh) { V2.hist.skip++; history.back(); } } catch (e) {} }, 0); };
addEventListener('popstate', () => { if (V2.hist.skip) { V2.hist.skip--; return; }
  if (V2._sheet) { V2.hist.pop = true; try { V2.closeSheet(); } finally { V2.hist.pop = false; } return; }
  // a sheet's leftover step: skip it the way you're travelling (arriving from deeper = going back; same depth = going forward)
  try { if (history.state && history.state.v2sh) { V2.hist.skip++; if ((history.state.v2d || 0) >= (V2.nav ? V2.nav.d : 0)) history.forward(); else history.back(); } } catch (e) {} });
// Safari, iPhone/iPad and WebKit on Windows never focus a button on a mouse click or tap (WebKit: form controls are not mouse-
// focusable except on its Linux ports), so when a tap opens a sheet document.activeElement is still <body> and focus came back to
// nothing on close (EDIT-01b in WebKit on Windows, Nov 19-20). Remember the control a click landed on; a sheet opened within a moment
// of it returns focus there. Chrome focuses the clicked button anyway, so there it is the same element as before.
V2._tap = null;
document.addEventListener('click', e => { const c = e.target && e.target.closest && e.target.closest('a[href],button,summary,input,select,textarea,[tabindex],[role="button"]'); V2._tap = c ? {el: c, t: Date.now()} : null; }, true);
document.addEventListener('keydown', e => { if (e.key !== 'Enter' && e.key !== ' ') V2._tap = null; }, true);
V2.opener = () => { const a = document.activeElement, t = V2._tap; return t && t.el.isConnected && Date.now() - t.t < 1500 && !(a && a !== document.body && a.contains(t.el)) ? t.el : a; };
V2.sheet = (html, o = {}) => { const prev = V2._sheet, back = prev ? prev.back : V2.opener(); V2._tap = null; V2.closeSheet(true, true); V2.histOpen();
  const wrap = document.createElement('div'); wrap.className = 'np-sheetwrap';
  wrap.innerHTML = `<div class="np-scrim" data-v2close></div><div class="np-sheet${o.small ? ' sm' : ''}${o.fit ? ' fit' : ''}" role="dialog" aria-modal="true" aria-label="${V2.esc(o.label || 'Details')}" tabindex="-1"><button class="x" type="button" data-v2close aria-label="Close">✕</button>${html}</div>`;
  document.body.append(wrap); document.documentElement.classList.add('np-locked'); { const app = document.getElementById('app'); if (app) app.inert = true; } /* B9e: the page behind an open sheet is inert */
  V2._sheet = {wrap, back, onClose: o.onClose};
  const first = wrap.querySelector(o.focus || '.np-sheet'); (first || wrap.querySelector('.np-sheet')).focus({preventScroll: true});
  return wrap.querySelector('.np-sheet'); };
V2.closeSheet = (quiet, swap) => { const S = V2._sheet; if (!S) return; V2._sheet = null; if (V2.ed) V2.ed.rep = null; /* a Replace box closed without a pick leaves nothing behind */ S.wrap.remove(); document.documentElement.classList.remove('np-locked'); { const app = document.getElementById('app'); if (app) app.inert = false; } if (!swap) V2.histClose();
  if (S.onClose) try { S.onClose(!!swap); } catch (e) {} /* Nov 15: onClose learns whether another sheet is replacing this one */ if (!quiet && S.back && S.back.isConnected) { const b = S.back; if (!b.matches('a[href],button,input,select,textarea,summary,[tabindex]')) { b.tabIndex = -1; b.addEventListener('blur', () => b.removeAttribute('tabindex'), {once: true}); } b.focus({preventScroll: true}); } else if (!quiet || S.back) { const h = document.querySelector('#main h1'); if (h && !(document.activeElement && document.activeElement !== document.body && document.activeElement.isConnected)) { if (!h.hasAttribute('tabindex')) { h.tabIndex = -1; h.addEventListener('blur', () => h.removeAttribute('tabindex'), {once: true}); } h.focus({preventScroll: true}); } } }; /* Nov 16 audit: the opener was redrawn away (Import), focus fell to <body>; now the page heading */ /* stress test (Nov 16): a heading opener (Home's Import lands on My Team's h1) can't take focus without a temporary tabindex: focus fell to <body> */ /* stress test (Nov 16): the opener was gone (Home's Import opens My Team), focus fell to <body>; now the page heading */
document.addEventListener('click', e => { if (V2._sheet && e.target.closest('[data-v2close]')) V2.closeSheet(); });
document.addEventListener('keydown', e => { const S = V2._sheet; if (!S) return;
  if (e.key === 'Escape') { const t = e.target; if (t && t.matches && t.matches('[data-btfind]') && t.value) return; /* code review B1: a filled Their Six box clears first (its own handler); the next Escape closes */ e.preventDefault(); V2.closeSheet(); return; }
  // focus stays in the sheet (Sim's check, Nov 12: in the info sheet Tab left after 6 stops, because the inactive tabs, tabindex -1,
  // were counted as stops). Only controls that really take Tab count: not tabindex -1, not disabled, shown, not in a closed fold.
  if (e.key !== 'Tab') return; const shown = x => x.getClientRects().length && !x.closest('[hidden],[inert]') && !(x.closest('details:not([open])') && !(x.matches('summary') && x.parentElement.matches('details:not([open])')));
  const f = [...S.wrap.querySelectorAll('.np-sheet :is(a[href],button,input,select,textarea,summary,[tabindex])')].filter(x => x.tabIndex >= 0 && !x.disabled && shown(x)); /* the toast is not in this loop: while a sheet is open it sits under the backdrop (Sim, Nov 11), so its Undo can't be seen there (sweep, Nov 15) */
  if (!f.length) return; const i = f.indexOf(document.activeElement);
  if (i < 0) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus(); return; }
  if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } });

// ---------- search: places and Pokémon, from the header button or the / key ----------
V2.find = q => { q = q.trim().toLowerCase(); if (!q) return {places: [], mons: []};
  // accents count as their plain letter ("é" = "e", as in Pokémon); a query that is all punctuation finds nothing (Sim's check E16,
  // Nov 12: "é" became an empty query, which matched every name, so the most-used Pokémon showed up)
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''), nq = norm(q);
  if (!nq) return {places: V2.findOk().filter(([, n]) => n.toLowerCase().includes(q)), mons: []};
  const places = V2.findOk().filter(([k, n]) => n.toLowerCase().includes(q) || (V2.placeAlias[n] || []).some(a => a.includes(q)) || (q.length >= 4 && new RegExp('\\b' + q.replace(/[^a-z0-9 ]/g, '')).test((V2.placeLines[k] || '').toLowerCase()))).slice(0, 6); /* Nov 15: by a word of its line too ('damage', 'speed') */
  const mons = [...V2.byName.values()].map(p => { const d = norm(V2.disp(p.n)), n = norm(p.n); const at = Math.min(...[d.indexOf(nq), n.indexOf(nq)].filter(i => i >= 0).concat(99));
    return {p, at: at === 99 ? null : at}; }).filter(x => x.at !== null).sort((a, b) => a.at - b.at || (b.p.u || 0) - (a.p.u || 0) || V2.disp(a.p.n).length - V2.disp(b.p.n).length).slice(0, 8).map(x => x.p);
  return {places, mons}; };
V2.openSearch = () => { const sh = V2.sheet(`<div class="np-find"><h2 class="u">Search</h2><label class="np-field">${V2.ICON.search}<input type="search" data-v2q placeholder="Find a Pokémon, move, item, team style or page" aria-label="Find a Pokémon, move, item, Ability, team style, saved team or page" autocomplete="off">${V2.CLR}</label><p class="vh" data-v2hitsay role="status"></p><div class="hits" data-v2hits></div></div>`, {label: 'Search', small: true, focus: '[data-v2q]'});
  const inp = sh.querySelector('[data-v2q]'), out = sh.querySelector('[data-v2hits]');
  // saved teams by name too (today's search does): choosing one opens it, like Open in Saved Teams
  const teams = q => { q = q.trim().toLowerCase(); return q && typeof S === 'object' ? S.teams.filter(t => t.format !== 'singles' && String(t.name).toLowerCase().includes(q)).slice(0, 4) : []; };
  /* player review 2c (Nov 17): moves, items, Abilities (from the winning team sheets, tsTerms) and team styles (Archetypes) too; a move,
     item or Ability opens Winning Teams filtered by it, a style opens its Archetype guide */
  const terms = q => { q = q.trim().toLowerCase(); if (q.length < 3) return {t: [], st: []}; let t = [], st = [];
    try { t = tsTerms().filter(x => x.k !== 'mon' && x.label.toLowerCase().includes(q)).sort((a, b) => (b.label.toLowerCase().startsWith(q) ? 1 : 0) - (a.label.toLowerCase().startsWith(q) ? 1 : 0) || b.c - a.c).slice(0, 5); } catch (e) {}
    try { st = GUIDE_ORDER.filter(k => ARCH[k] && ARCH[k].name.toLowerCase().includes(q)).slice(0, 2); } catch (e) {}
    return {t, st}; };
  const KW = {move: 'Move', item: 'Item', ability: 'Ability'};
  const monHit = p => `<button type="button" class="np-hit" data-v2mon="${V2.esc(p.n)}"><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy" decoding="async"><span class="nm"><b>${V2.nameHtml(V2.disp(p.n))}</b>${(() => { try { const r = rating(p).total; return r ? `<small aria-label="Rated ${RS(r)}, ${V2.esc(lTier(r).k)} tier">${RS(r)}\u00a0·\u00a0${V2.esc(lTier(r).k)}\u00a0tier</small>` : ''; } catch (e) { return ''; } })()}</span><span class="ty">${(p.t || []).map(V2.typeChip).join('')}</span></button>`;
  /* scan S34 A (Sim, Nov 20): a miss offers today's six highest-rated Pokémon as normal search rows (the same six as empty My Team's
     'Start from a Winner'), so a typo leads somewhere instead of a dead end */
  const missTop = () => { let top = []; try { top = lairRows().slice(0, 6).map(x => x.p); } catch (e) {} return top.length ? `<p class="miss-k">Or meet today's top six</p>${top.map(monHit).join('')}` : ''; };
  const draw = () => { const r = V2.find(inp.value), tm = teams(inp.value), T = terms(inp.value);
    out.innerHTML = !inp.value.trim() ? '<p class="fine">Type a Pokémon\'s name, a saved team, or a page like Battle.</p>' + V2.TOOLS.map(k => { const pl = V2.findPlaces.find(x => x[0] === k && !x[2]); return pl ? `<a class="np-hit" href="#${k}" data-v2close><span class="pg">Page</span><span class="nm"><b>${pl[1]}</b><small>${V2.esc(V2.placeLines[k] || '')}</small></span></a>` : ''; }).join('') /* the tools, as today's empty search lists them (Nov 15) */
      : !r.places.length && !r.mons.length && !tm.length && !T.t.length && !T.st.length ? `<p class="fine">Nothing called “${V2.esc(inp.value.trim())}”. Try part of the name.</p>${missTop()}`
      : r.places.map(([k, n, act]) => act ? `<button type="button" class="np-hit" data-v2place="${V2.findPlaces.findIndex(x => x[1] === n)}"><span class="pg">Page</span><b>${n}</b></button>` : `<a class="np-hit" href="#${k}" data-v2close><span class="pg">Page</span><span class="nm"><b>${n}</b>${V2.placeLines[k] ? `<small>${V2.esc(V2.placeLines[k])}</small>` : ''}</span></a>`).join('')
        + r.mons.map(monHit).join('')
        + tm.map(t => `<button type="button" class="np-hit" data-svact="open" data-id="${V2.esc(t.id)}"><span class="pg">Saved team</span><b>${V2.esc(t.name)}</b></button>`).join('')
        + T.st.map(k => `<a class="np-hit" href="#archetypes" data-v2close data-v2style="${V2.esc(k)}"><span class="pg">Team style</span><span class="nm"><b>${V2.esc(ARCH[k].name)}</b><small>How it plays and how to beat it</small></span></a>`).join('')
        + T.t.map(x => `<a class="np-hit" href="#tournaments" data-v2close data-v2term="${V2.esc(x.k)}" data-v2termv="${V2.esc(x.v)}"><span class="pg">${KW[x.k] || 'Term'}</span><span class="nm"><b>${V2.esc(x.label)}</b><small>On ${x.c.toLocaleString('en-US')} winning team sheet${x.c === 1 ? '' : 's'}</small></span></a>`).join(''); };
  /* a11y stress (Nov 16): the list itself re-announced every hit on each keystroke; now a short status says how many (or that nothing matched) */
  const say = sh.querySelector('[data-v2hitsay]'), draw2 = () => { draw(); if (!say) return; const q = inp.value.trim(), n = out.querySelector('.miss-k') ? 0 : out.querySelectorAll('.np-hit').length; /* S34: the top six after a miss aren't matches */ say.textContent = !q ? '' : n ? `${n} result${n === 1 ? '' : 's'}` : 'No matches'; };
  inp.addEventListener('input', draw2);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const h = !out.querySelector('.miss-k') && out.querySelector('.np-hit'); if (h) { e.preventDefault(); h.click(); } } });
  draw(); };
/* a move, item or Ability from the search filters Winning Teams by it; a team style opens its Archetype guide (player review 2c) */
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-v2term],[data-v2style]'); if (!a) return;
  if (a.dataset.v2style) { if (V2.arUi) V2.arUi.open = a.dataset.v2style; const t0 = Date.now(), go = () => { const g = location.hash === '#archetypes' && document.querySelector('.ar-guide'); if (g) g.scrollIntoView({block: 'start'}); else if (Date.now() - t0 < 3000) requestAnimationFrame(go); }; requestAnimationFrame(go); /* land on the guide, as a style tap on Archetypes does */ }
  else if (V2.wtUi) { V2.wtUi.f = [{k: a.dataset.v2term, v: a.dataset.v2termv}]; V2.wtUi.q = ''; V2.wtUi.fmore = 0; } }, true);
// a Pokémon picked anywhere opens its info sheet; pages replace V2.openMon when the full sheet is built (R4)
V2.openMon = n => { const p = V2.byName.get(n); if (!p) return;
  V2.sheet(`<div class="np-monsheet">${V2.mon(n, {iw: 220, bare: true})}<div><h2 class="u">${V2.esc(V2.disp(n))}</h2><div class="ty">${(p.t || []).map(V2.typeChip).join('')}</div><p class="fine">Abilities: ${(p.a || []).map(V2.esc).join(', ')}</p>${V2.addBtn ? V2.addBtn(n) : ''}</div></div>`, {label: V2.disp(n), small: true}); };
document.addEventListener('click', e => { const m = e.target.closest('[data-v2mon]'); if (m) { e.preventDefault(); V2.openMon(m.dataset.v2mon); }
  if (e.target.closest('[data-v2search]')) V2.openSearch(); });
document.addEventListener('keydown', e => { if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.altKey) { e.preventDefault(); if (!V2._sheet) V2.openSearch(); else if (document.querySelector('.np-sheet .np-find')) V2.closeSheet(); return; } /* a second Ctrl+K closes Search, as today (JUMP-01) */ if (e.key === '/' && !V2._sheet && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); V2.openSearch(); } });
// ---------- the Apple-style slider (Sim's favourite, kept from today's site; design-system.md "Slider") ----------
// 2-4 choices, each an icon beside its name; the dark plate slides to the chosen one. Same icons as today's sliders (SLIDE_P /
// SLIDE_N in 05-icons.js, found by the choice's name). Real buttons with aria-pressed; arrow keys move between choices; picking
// one fires a "v2slide" event {key, value} on document, so pages just listen.
V2.slideIcon = (t, ik) => { t = String(t).trim().toLowerCase(); if (typeof SLIDE_P !== 'object') return '';
  const k = ik || (SLIDE_N[t] ? SLIDE_N[t] : (Object.keys(SLIDE_N).find(x => t.startsWith(x + ':') || t.startsWith(x + ' ')) || null) && SLIDE_N[Object.keys(SLIDE_N).find(x => t.startsWith(x + ':') || t.startsWith(x + ' '))]);
  return k && SLIDE_P[k] ? `<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true">${SLIDE_P[k]}</svg>` : ''; };
V2.slide = (key, items, on, label) => { const i = Math.max(0, items.findIndex(x => x[0] === on));
  return `<div class="np-slide" role="group" aria-label="${V2.esc(label || key)}" data-v2slide="${V2.esc(key)}" style="--n:${items.length};--i:${i}"><span class="thumb" aria-hidden="true"></span>${items.map(([v, t, ik], k) =>
    `<button type="button" data-v="${V2.esc(v)}" aria-pressed="${k === i}">${V2.slideIcon(t, ik)}<span>${V2.esc(t)}</span></button>`).join('')}</div>`; };
V2.slidePick = (sl, b) => { const bs = [...sl.querySelectorAll('button')], i = bs.indexOf(b); if (i < 0) return;
  bs.forEach((x, k) => x.setAttribute('aria-pressed', k === i ? 'true' : 'false')); sl.style.setProperty('--i', i);
  document.dispatchEvent(new CustomEvent('v2slide', {detail: {key: sl.dataset.v2slide, value: b.dataset.v}})); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2slide] > button'); if (b) V2.slidePick(b.parentElement, b); });
document.addEventListener('keydown', e => { const b = e.target.closest && e.target.closest('[data-v2slide] > button'); if (!b || !/^Arrow(Left|Right)$/.test(e.key)) return;
  const bs = [...b.parentElement.querySelectorAll('button')], n = bs[(bs.indexOf(b) + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
  e.preventDefault(); n.focus(); V2.slidePick(b.parentElement, n); });
V2.places = [['home', 'Home'], ['build', 'Build'], ['team', 'My Team'], ['battle', 'Battle'], ['meta', 'Meta']]; // the top bar
// search finds these too: rebuilt places inside My Team (audit JUMP-05; today's search finds them); pages are links, sheets open over
// My Team as their buttons do. Search only: the top bar stays the five above.
V2.findPlaces = [...V2.places, ['box', 'My Box'], ['compare', 'Compare Teams'], ['team', 'Saved Teams', () => V2.openSavedTeams && V2.openSavedTeams()],
  ['team', 'Team Sheet', () => V2.openTeamSheet && V2.openTeamSheet()], ['team', 'All Suggestions', () => V2.openAllSugs && V2.openAllSugs()],
  /* Nov 15 (parity with today's search): every page can be found, by its name or a word of its line */
  ['meta', 'Ratings'], ['usage', 'Usage'], ['sets', 'Popular Sets'], ['tournaments', 'Winning Teams'], ['events', 'Events'], ['archetypes', 'Archetypes'], ['weekly', 'This Week'],
  ['speed', 'Speed Tiers'], ['calc', 'Damage Calculator'], ['types', 'Type Chart'], ['practice', 'Team Preview Practice'], ['gauntlet', 'Test Run'],
  ['track', 'Track Record'], ['method', 'How We Calculate'],
  /* Sim, Nov 18 (morning questions 1f): the Post Room and the Dispatch are found by Search; the top bar keeps its five places and Home's post band stays the main way in */
  ['gifts', 'Mystery Gifts'], ['news', 'Champions News'], ['about', 'About & Legal'], ['feedback', 'Send Feedback'],
  /* known-bug BROKEN-10 (Nov 17): Build's two tools by name, the core section reached straight from search */
  ['build', 'Build Me a Team'], ['build', 'Build Around a Core', () => { V2.bdUi.jtab = 'cores'; V2.bdUi.toCores = true; V2.redraw(); }]]; /* the same way Home's core cards open Build at the cores (CORES-13) */
// today's site's menu names and plurals still find the new page (returning players), shown under the new name
V2.placeAlias = {'Damage Calculator': ['damage calc', 'calc', 'calculator'], 'Build Me a Team': ['build for me'], 'Build Around a Core': ['cores', 'winning cores'], Battle: ['battle a team'], Ratings: ['pokémon ratings', 'pokemon ratings', 'meta rankings'],
  'Mystery Gifts': ['gifts', 'codes', 'gift codes', 'serial codes', 'post room'], 'Champions News': ['news', 'dispatch', 'champions dispatch']};
V2.findOk = () => V2.findPlaces.filter(([k]) => k !== 'feedback' || (V2.FB && V2.FB.ok)); /* Send Feedback only where it can send (function sweep, Nov 15: listed in the Preview) */
// one line per page, shown when the search box is empty (today's search lists its tools) and searched too ("speed", "damage")
V2.TOOLS = ['home', 'build', 'team', 'battle', 'meta', 'tournaments', 'sets', 'speed', 'calc', 'types', 'practice', 'gauntlet', 'compare', 'box']; // the empty search's list (14, Home first)
V2.placeLines = {home: 'Start here', build: 'Build a team around a Pokémon, or from winning teams', team: 'Your six, its Strength Score and matchups', battle: 'Plan a game against an opponent',
  meta: 'Every Pokémon rated, by tier', box: 'The Pokémon you have', compare: 'Two teams side by side', usage: 'The most used Pokémon', sets: 'What players run on each Pokémon',
  tournaments: 'Top teams from recent events', events: 'Recent and upcoming events', archetypes: 'The team styles winning right now', weekly: 'What changed this week',
  speed: 'Your six against the 20 most-used Pokémon', calc: 'Any attacker into any defender', types: '18 types, or look up a Pokémon', practice: 'Pick four and two leads against real ladder teams',
  gauntlet: 'Your team into the latest top teams', track: 'How our ratings did at real events', gifts: 'Live Mystery Gift codes and every gift so far', news: 'Official Pokémon Champions news, in one paper', method: 'How every number is worked out', about: 'Sources, privacy and the rules', feedback: 'Tell us what to fix or add'};
V2.goPlace = i => { const pl = V2.findPlaces[i]; if (!pl) return; const [k, , act] = pl;
  if (!act) { location.hash = '#' + k; return; } V2.closeSheet(true); if (location.hash !== '#' + k) location.hash = '#' + k; setTimeout(act, 60); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2place]'); if (b) V2.goPlace(+b.dataset.v2place); });
V2.theme = () => document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
/* Q10 (Sim, Nov 18, answer A): the Day/Night button has three states, Day, Night and Auto (Auto = nothing saved, the page follows the
   device live, the same as a first visit). The mode lives in memory (head.html sets window.__npThMode before first paint).
   Order: from Auto the first tap always changes the look (THEME-02v: a light device gives Night), the next tap pins the other look,
   the third goes back to Auto. So on a dark device it runs Day > Night > Auto; on a light device Night > Day > Auto. Only the step
   back into Auto can leave the look as it is, and the button's icon and label say "Auto" there */
V2.devTheme = () => { try { return matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'; } catch (e) { return 'day'; } };
V2.themeMode = () => { const m = window.__npThMode; return m === 'day' || m === 'night' ? m : 'auto'; };
V2.themeNext = () => { const m = V2.themeMode(), dv = V2.devTheme(); return m === 'auto' ? (V2.theme() === 'night' ? 'day' : 'night') : m !== dv ? dv : 'auto'; };
V2.THEME_WORD = {day: 'Day mode', night: 'Night mode', auto: 'Auto: follows your device'};
// ---------- data note (parity, Nov 15): today's #healthBar and #regBar (43-data-health.js), one calm line on Home and the Meta
// pages: a source past its usual age is named with its day, and a new or changed regulation is said plainly. Empty when all is current.
V2.dataNote = () => { const E = V2.esc, out = [];
  /* review Nov 18 (C5): a --split Preview whose preview.json couldn't be read (missing, 404, offline) says so, on every page (V2.shell),
     rather than showing the built-in numbers as if they were today's */
  if (window.__NP_PVFAIL) out.push(`<b>This Preview couldn't read today's data</b> (preview.json: ${E(window.__NP_PVFAIL)}). The numbers shown are the built-in copy and may be out of date. Reload to try again.`);
  try { const r = typeof regInfo === 'function' && regInfo();
    if (r && r.now) out.push(`<b>New regulation: Reg ${E(r.now.id)} started ${E(regDay(r.now.since))}.</b> Numbers are from Reg ${E(r.id)} until there's enough Reg ${E(r.now.id)} data; the two are never mixed. ${r.now.events ? `${r.now.events.toLocaleString('en-US')} Reg ${E(r.now.id)} event${r.now.events === 1 ? '' : 's'} so far${r.now.need ? `, switches at ${r.now.need}` : ''}.` : `Seen on the Showdown ladder; no Reg ${E(r.now.id)} tournaments yet.`}`); /* known-bug SHELL-05 (Nov 17): how far along it is, as today's page says */
    else if (r && r.id !== PAGE_REG) out.push(`<b>Numbers are from Reg ${E(r.id)}.</b> Anything new in Reg ${E(r.id)} may be missing until NastyPlot is updated for it.`); } catch (e) {}
  try { const st = typeof healthStale === 'function' ? healthStale() : [];
    if (st.length && window.__NP_PREVIEW) out.push(`<b>This Preview uses a saved copy of the data</b> from ${E(st[0].day)}; the live site updates every morning.`);
    else if (st.length) { const by = {}; st.forEach(x => { (by[x.day] = by[x.day] || []).push(x.label.charAt(0).toLowerCase() + x.label.slice(1)); });
      const and = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0];
      out.push(`<b>Some data is older than usual:</b> ${Object.keys(by).map(d => `${and(by[d])}, last updated ${E(d)}`).join('; ').replace(/^./, c => c.toUpperCase())}. Everything else is current.`); } } catch (e) {}
  return out.length ? `<p class="np-dnote" role="status"><i aria-hidden="true"></i><span>${out.join(' ')}</span></p>` : ''; };
// keyboard focus never hides under the sticky header or the phone bar (function sweep, Nov 15): only Tab focus (:focus-visible) on the page
// itself; sheets scroll on their own. Sections that are jumped to keep their own scroll-margin, so no page-wide scroll-padding.
document.addEventListener('focusin', e => { const t = e.target; try { if (!t.matches(':focus-visible') || t.closest('.np-head, .np-bar, .np-sheet, .np-dock')) return; } catch (x) { return; }
  const r = t.getBoundingClientRect(), hd = document.querySelector('.np-head'), bar = document.querySelector('.np-bar'), top = (hd ? hd.getBoundingClientRect().bottom : 0) + 8,
    bot = (bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect().top : innerHeight) - 8;
  if (r.top < top) scrollBy(0, r.top - top); else if (r.bottom > bot && r.height < bot - top) scrollBy(0, r.bottom - bot); });
V2.setTheme = m => { m = m === 'day' || m === 'night' ? m : 'auto'; const t = m === 'auto' ? V2.devTheme() : m; window.__npThMode = m;
  V2._thLast = t; /* the observer below then knows this change is already redrawn (code review B-m1: it redrew twice) */ document.documentElement.dataset.theme = t; document.documentElement.dataset.look = t === 'night' ? 'dark' : 'light'; /* the shared share-image code reads data-look (code review C8) */
  if (m === 'auto') { V2.LS.del('np2.theme'); V2.LS.del('cc2.theme'); /* Auto saves nothing; today's site's old choice must not come back on reload */ } else V2.LS.set('np2.theme', m);
  V2.redraw(); }; // in place: focus stays on Day/Night (A5)
/* Sim, Nov 16: the theme can change without the theme button (the phone or app switching to dark on its own: head.html listens for it);
   whatever changes it, the page redraws once, so theme-drawn parts (the button's label, Build's lighting) follow */
try { V2._thLast = document.documentElement.dataset.theme; new MutationObserver(() => { const t = document.documentElement.dataset.theme; if (t === V2._thLast) return; V2._thLast = t;
  clearTimeout(V2._thT); V2._thT = setTimeout(() => { if (V2.redraw && V2.draw) V2.redraw(); }, 50); }).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']}); } catch (e) {}
/* Q10: with Day or Night pinned, the device switching doesn't change the look, but it changes what the button's next tap does
   (themeNext), so its label is redrawn to stay true. In Auto the observer above already redraws */
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (V2.themeMode() !== 'auto' && V2.redraw && V2.draw) V2.redraw(); }); } catch (e) {}
/* The logo "Sly Devil" (Sim, Nov 16; files from his designer in docs/brand/sly-devil, NP_LOGO from experiments/gen-logo-sly.mjs).
   ONE logo for day and night: its white sticker edge carries its own background, so the light/night pair and the night overrides are gone.
   Drawn as an image (no ids to clash between the header and footer copies, and its soft shadow is painted once, not on every scroll frame).
   Header: the full logo at 44px on wide screens, logo-small (no block shadow, simpler face) on phones; footer: logo-small.
   The link around it carries the name ("NastyPlot, Home"), so the image itself is alt="" */
V2.logo = (foot) => { const L = typeof NP_LOGO === 'object' ? NP_LOGO : null; if (!L) return '<b class="u">NastyPlot</b>';
  const u = V2._lgu || (V2._lgu = {full: 'data:image/svg+xml,' + encodeURIComponent(L.full), small: 'data:image/svg+xml,' + encodeURIComponent(L.small), mark: 'data:image/svg+xml,' + encodeURIComponent(L.markSmall)});
  return foot ? `<img class="np-lg" src="${u.small}" alt="NastyPlot" width="183" height="32" decoding="async">`
    : `<picture class="np-lg"><source media="(max-width:413.98px)" srcset="${u.mark}"><source media="(max-width:999.98px)" srcset="${u.small}"><img src="${u.full}" alt="" width="241" height="44" decoding="async"></picture>`; };
// say it once (Nov 16): a page's own data date shows only when it differs from the footer's 'Data as of' (V2.otherDay('Nov 10') -> '' when the same)
V2.otherDay = d => { const a = V2.asOf && V2.asOf(); return d && a && new RegExp('\\b' + d.replace(/\s+/g, '\\s') + '\\b').test(a) ? '' : (d || ''); };
// the data's date (Sim's review item 18): "Data as of Nov 11", plus "(N days old)" when stale; shared with today's site
/* functions stress test (Nov 16): with storage blocked, Save still said "Saved" and nothing survived a reload; one check, and the save words say so */
V2.canStore = (() => { try { localStorage.setItem('np2.probe', '1'); localStorage.removeItem('np2.probe'); return true; } catch (e) { return false; } })();
V2.noStoreTxt = 'This browser blocks saving, so it lasts until you close the page.';
V2.asOf = () => { try { const t = typeof dataDateText === 'function' ? dataDateText() : ''; if (t) return t;
  /* no live data (SHELL-29, Nov 16): the built-in snapshot's own date, as the Ratings line used to show it, so the footer is never dateless */
  const pf = typeof activePerf === 'function' ? activePerf() : null, u = pf && pf.updated ? Date.parse(String(pf.updated).slice(0, 10) + 'T12:00:00Z') : NaN; if (isNaN(u)) return '';
  const days = calDays(u, Date.now()); return 'Data as of ' + new Date(u).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) + (days > 2 ? ' (' + days + ' days old)' : ''); } catch (e) { return ''; } };
/* Sim's Q24 A (Nov 19): an address that matches no page (#nonsense) shows a not-found page in the 'No Pokémon here.' style (pokemon.js):
   eyebrow, headline, one line and Go to Home; no top tab lit (place ''), title 'Page not found' (V2.setTitle). It was Home on the real site
   and My Team in the Preview (coming.js). No address at all is still Home. Visitors to #owner get the same page (owner.js). Test: app/test/v2-q24.mjs */
/* scan S33 (Nov 20, Sim: 'go with your recommendations'): both not-found screens carry today's underdog (V2.underdog, team.js: the same
   rotating featured Pokémon as the empty My Team, Home and the empty Box) with one playful line. No grades or team data on these screens. */
V2.lostDog = () => { const n = V2.underdog ? V2.underdog() : 'Flapple', d = V2.esc(V2.disp(n));
  return `<aside class="nf-dog" aria-label="Today's underdog"><button type="button" class="nf-dogst" data-v2mon="${V2.esc(n)}" aria-label="${d}: open its info">${V2.mon(n, {bare: true, ft: true})}</button><div class="nf-dogtx"><p class="np-eyebrow"><span>Today's underdog</span></p><p class="nf-dogl u">Lost? ${d}'s been here all along.</p></div></aside>`; };
V2.nfHtml = () => `<div class="ra gsp nf-pg" data-v2nf><section class="ra-h"><p class="np-eyebrow"><span>Page not found</span></p><h1 class="u">Nothing here.</h1><p class="ra-lede">This address doesn't match a page on NastyPlot. It may be an old or mistyped link.</p><p class="nf-go"><a class="np-btn" href="#home">Go to Home</a></p></section>${V2.lostDog()}</div>`;
V2.pages.notfound = {place: '', draw: () => V2.nfHtml()};
/* own keys only: '#constructor' or '#toString' found the object's built-ins and broke the draw */
V2.route = () => { const h = (location.hash || '').slice(1).split('=')[0]; /* Nov 15: '#method=rating' opens How We Calculate at that part */ return Object.prototype.hasOwnProperty.call(V2.pages, h) ? h : h ? 'notfound' : (V2.pages.home ? 'home' : Object.keys(V2.pages)[0]); };
// Word list (Sim, Nov 9; Nov 12: "fix them based on your recommendation"): the idea is Matchups and its levels are Beats it /
// Handles it, never "ready". Shared logic (also today's site) still writes "Ready for ..."; the new site says it the word list's way.
// The "81%" in "Ready for 81% of the top 30" is a weighted score, not a share of threats, so the plain count is shown instead.
V2.wl = (t, hand) => String(t == null ? '' : t)
  .replace(/\bReady for the top threats\b/g, 'Handles the top threats') /* the check's name as My Team shows it (audit #8, Nov 15) */
  .replace(/Ready for \d+% of the top (\d+) threats(?:,| ·) handles (\d+) of \d+/g, 'Beats or handles $2 of the top $1 threats')
  .replace(/Ready for only (\d+)% of the top (\d+) threats/g, (m, p, n) => hand ? `Beats or handles only ${hand.x} of the top ${hand.n}` : `Matchups ${p}% against the top ${n} threats`) /* scan S24 (Nov 20): the miss line said "Ready for only" */
  .replace(/; not ready for /g, '; no answer to ') /* scan S24: the Matchups level's own words */
  .replace(/\band only 0 resist\b/g, 'and none resist') /* scan S1 (Nov 20) */
  .replace(/Ready for \d+% of the top (\d+) threats/g, (m, n) => hand ? `Beats or handles ${hand.x} of the top ${hand.n}` : m)
  .replace(/([Rr])eady for (\d+)\/(\d+) top threats/g, (m, r, x, n) => `${r === 'R' ? 'B' : 'b'}eats or handles ${x} of ${n} top threats`)
  .replace(/Ready for (\d+)\/(\d+) → (\d+)\/(\d+) top threats/g, 'Beats or handles $1 → $3 of $2 top threats')
  .replace(/Ready for top threats: (\d+)\/(\d+) → (\d+)\/(\d+)/g, 'Beats or handles $1 → $3 of the top $2 threats') /* the suggestion Why? line (FP-3, Nov 16) */
  .replace(/(\d+)% → (\d+)% ready for the top (\d+) threats/g, 'Matchups $1% → $2% against the top $3 threats')
  .replace(/(\d+)% ready for the top (\d+) threats/g, 'Matchups $1% against the top $2 threats')
  .replace(/(.+) is ready for more of the top (\d+) threats \((\d+)% vs (\d+)% ready\)/g, '$1 has the better matchups against the top $2 threats ($3% vs $4%, weighted by how often each threat makes top cut)')
  .replace(/\b(grassy|electric|psychic|misty) terrain\b/g, (m, t) => t[0].toUpperCase() + t.slice(1) + ' Terrain') // Nov 15 (re-audit #13): terrain names as the rest of the site writes them // Compare (i42, word list); Nov 15 (re-audit #8): say it's weighted, so it doesn't read against the Beats it / Handles it counts
  .replace(/Ready for the top threats/g, 'Handles the top threats')
  .replace(/\bReady ([+−-]\d+%)/g, 'Matchups $1') // Quick add: the change to the matchup score
  .replace(/how many your team is ready for: it Beats them or Handles them/g, 'how many your team Beats or Handles');
// copy without losing your place (Sim's check E15, Nov 12): the shared copyText falls back to a hidden text box when the clipboard is
// blocked, which takes focus and is then removed; focus goes back to the control you pressed
V2.copy = async t => { const a = document.activeElement, ok = await copyText(t); if (a && a !== document.body && a.isConnected && document.activeElement !== a) a.focus({preventScroll: true}); return ok; };
// redraw the current page after data arrives or a choice changes, keeping the reader's place and focus (no scroll jump).
// Fix plan A5 (Sim, Nov 11): a redraw used to rebuild the whole page, header included, so focus fell back to the page top
// (the next Tab went to "Skip to the page") and a button could be replaced under the pointer. Now the new page is built
// off-screen and only the parts that differ are changed in place (V2.morph); what didn't change, and the focused control,
// stay the same elements. If the focused control itself had to be replaced, focus goes to its new copy (V2.focusKey).
V2.focusKey = el => { if (!el || el === document.body || !el.closest || !el.closest('#app')) return null; if (el.id) return {sel: '#' + CSS.escape(el.id), i: 0};
  const ds = [...el.attributes].filter(a => a.name.startsWith('data-') || a.name === 'href' || a.name === 'aria-label'), sel = el.tagName.toLowerCase() + ds.map(a => `[${a.name}="${CSS.escape(a.value)}"]`).join('');
  return {sel, i: [...document.querySelectorAll('#app ' + sel)].indexOf(el)}; };
// make old (live) look like new (built off-screen): same nodes kept where they match, attributes and text updated in place
// An element whose action markers (data-* attributes) differ is a different control: it is replaced, never changed in place, so a
// tap that is still being handled can't reach a different action (found Nov 12: "Show 2 more" became "See all" in place and the
// same click then opened All Suggestions; behaviour test SUG-04).
V2.dataSig = e => [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).sort().join('&');
V2.morph = (o, n) => { if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || (o.nodeType === 1 && (o.id !== n.id || V2.dataSig(o) !== V2.dataSig(n)))) { o.replaceWith(n); return; }
  if (o.nodeType !== 1) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
  /* code review A1-I3 (Nov 17): a redraw used to close every fold the visitor had opened (the fresh HTML has no "open"). A fold keeps
     the visitor's choice while the page's own wish for it is unchanged; when the page changes its mind, the page wins. */
  const fold = o.nodeName === 'DETAILS', want = fold && n.hasAttribute('open'), keep = fold && o._pg === want ? o.open : null; if (fold) o._pg = want;
  if (o.isEqualNode(n)) { if ('value' in o && /^(INPUT|TEXTAREA|SELECT)$/.test(o.nodeName)) V2.morphField(o, n); return; }
  for (const a of [...o.attributes]) if (!n.hasAttribute(a.name)) o.removeAttribute(a.name);
  for (const a of [...n.attributes]) if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
  // a select merges its options inside morphField (and sets its value after): merging them a second time here dropped the options the
  // first pass had just moved in, so a longer list fell back to its first option (Nov 14: the calc's set boxes after a new Pokemon)
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(o.nodeName)) { V2.morphField(o, n); if (o.nodeName === 'SELECT') return; }
  if (keep !== null && o.open !== keep) o.open = keep;
  V2.morphKids(o, n); };
// the page's wish for a fold, noted when the visitor first taps it (until then the fold is as the page drew it). A tap, not the
// "toggle" event: browsers also fire "toggle" when a fold is first drawn open, which would note the wrong wish.
document.addEventListener('click', e => { const s = e.target && e.target.closest && e.target.closest('summary'), d = s && s.parentElement; if (d && d.nodeName === 'DETAILS' && d._pg === undefined) d._pg = d.open; }, true);
V2.morphKids = (o, n) => { const oc = [...o.childNodes], nc = [...n.childNodes], k = Math.min(oc.length, nc.length);
  for (let i = 0; i < k; i++) V2.morph(oc[i], nc[i]); for (let i = k; i < oc.length; i++) oc[i].remove(); for (let i = k; i < nc.length; i++) o.append(nc[i]); };
// a form field ends up as a full redraw would leave it (value and ticks from the new page), so code that clears a box still works
V2.morphField = (o, n) => { if (o.nodeName === 'SELECT') { V2.morphKids(o, n); o.value = [...n.options].find(x => x.hasAttribute('selected'))?.value ?? o.value; return; }
  if (o.type === 'checkbox' || o.type === 'radio') o.checked = n.hasAttribute('checked'); else if (o.value !== (n.getAttribute('value') ?? n.textContent ?? '')) o.value = n.getAttribute('value') ?? (o.nodeName === 'TEXTAREA' ? n.textContent : ''); };
/* `pre` (speed, pl-2c): the page's HTML already built by V2.shell() in an earlier step (V2.warmDraw), still current (V2.preOk); else built here */
V2.redraw = pre => { const app = document.getElementById('app'); if (!app || !app.firstChild) { V2.draw(); return; }
  const y = scrollY, act = document.activeElement, key = V2.focusKey(act), r = pre && pre.tag === V2.preOk && V2.preOk(pre) ? pre.r : V2.shell(), t = document.createElement('template'); t.innerHTML = r.html;
  V2.rdN = (V2.rdN || 0) + 1; /* counted after the check above, so a pre-built HTML is never stale against this very redraw */
  V2.morphKids(app, t.content); if (scrollY !== y) scrollTo(0, y); /* only when the merge moved it (code review B-m2) */
  if (key && !act.isConnected) { const e = [...document.querySelectorAll('#app ' + key.sel)][Math.max(0, key.i)]; if (e) e.focus({preventScroll: true}); }
  /* stress test (Nov 16): a focused heading kept by the merge loses its temporary tabindex (copied from the fresh HTML) and the browser drops focus to <body>; put both back */
  else if (act && act !== document.body && act.isConnected && document.activeElement !== act && !(V2._sheet)) { if (!act.matches('a[href],button,input,select,textarea,summary,[tabindex]')) { act.tabIndex = -1; act.addEventListener('blur', () => act.removeAttribute('tabindex'), {once: true}); } act.focus({preventScroll: true}); }
  /* a page's after() runs after EVERY redraw, not only on entry: it must be safe to repeat (measure and lay out; anything that opens,
     focuses or announces must guard itself to run once, as #sheet and the Pokémon page's name focus do; code review B9c) */
  if (r.P && r.P.after) try { r.P.after(); } catch (e) { console.error(e); } if (V2.fitWords) try { V2.fitWords(); } catch (e) { console.error(e); } V2.setTitle(); };
// the whole page as HTML (header, the page, footer, phone bar); V2.draw puts it in fresh, V2.redraw merges it in place
// one page's error never blanks the whole site (audit SHELL-34; today's safe() wrapper does the same per section): the header, menus
// and footer still draw, the page says what happened, and the error goes to the console for the checks to catch
V2.safeDraw = P => { try { return P.draw(); } catch (e) { console.error(e); return '<section class="cm2"><div class="cm2-t"><h1 class="u">This page didn\u2019t load.</h1><p class="tm-sub">Something went wrong drawing it. Reload to try again; the rest of the site still works.</p></div></section>'; } };
/* pre-launch check 1 (Nov 17): the page shipped with built-in numbers drew them first and swapped ~1.2 s later (Home 10,209 -> 13,826
   teams, the Game Plan's lead and bench flipped, Strength Score 92 -> 93). Numbers are drawn only once every daily document has answered
   (META_SEEN, 03-persistence.js), or there is no data store (a plain file, the tests, signed out), or after 8 s (a document that never
   answers: the built-in numbers rather than nothing). Until then the main area shows the loading panel (V2.loadingHtml). */
// speed fix 2 (Nov 17, pre-launch 2c): when today's numbers arrive, the ratings for every Pokémon and your team's report are worked out
// as their own steps (both are kept and reused by the drawing), then the page is drawn: three shorter tasks instead of one ~1 s freeze.
// The loading panel stays up until the draw, so nothing old or half-done shows.
/* pl-2c (Nov 19): the draw itself was still one task (Home ~0.5 s, My Team ~0.33 s at 4x CPU): working out the page's HTML, then putting it on the page.
   Now two steps: V2.shell() builds the HTML, and the next step puts that same HTML in (V2.redraw(pre)). The HTML is only reused while
   nothing it depends on has changed in between (V2.preOk: the address, the theme, the data version, the team, no other draw); otherwise
   the redraw builds it afresh, exactly as before. The page as finally drawn is the same; test app/test/v2-longtask.mjs. */
V2.preStamp = () => { let t = ''; try { t = JSON.stringify(S.slots) + '|' + (S.leads || []).join(); } catch (e) {}
  return [location.hash, document.documentElement.dataset.theme, typeof metaVersion !== 'undefined' ? metaVersion : '', V2.rdN || 0, V2.drawN || 0, t].join('\n'); };
V2.preOk = pre => pre.stamp === V2.preStamp();
V2.warmDraw = () => { let pre = null; const P = V2.pages[V2.route()], warm = (P && P.warm) || []; /* a page's own cached parts, each its own step (Home: its tools plate) */
  const steps = [() => ratings(), () => { const ms = members(); if (ms.length) prepOf(ms); }, ...warm,
    () => { const stamp = V2.preStamp(); V2.prePend = true; pre = {tag: V2.preOk, stamp, r: V2.shell()}; }]; let i = 0;
  /* V2.prePend: while built HTML waits for the next step, code the draw set up to look at the page "just after the draw" waits too
     (V2.afterPre; sugs.js ckWinSoon): without it, the winners pass found no Suggestions on the page and started at once (+0.5 s of blocking) */
  const next = () => { if (i < steps.length) { try { steps[i++](); } catch (e) { pre = null; } setTimeout(next, 0); } else try { V2.redraw(pre); } finally { V2.prePend = false; } }; setTimeout(next, 0); };
V2.afterPre = fn => { const go = () => { if (V2.prePend) setTimeout(go, 0); else fn(); }; setTimeout(go, 0); };
V2.dataReady = () => { if (V2._dataOk) return true; let ok = false;
  try { const c = window.__NP_CLAUDE || window.claude; ok = !c || !c.use || META_NODB || META_KEYS.every(k => META_SEEN.has(k)) || performance.now() > 8000; } catch (e) { ok = true; }
  return ok ? (V2._dataOk = true) : false; };
setTimeout(() => { if (!V2._dataOk) { V2._dataOk = true; fixMetaSrc(); clearCaches(); V2.redraw(); } }, 8000);
// pre-launch check 1 (Nov 17): shown in the main area until today's numbers are in (V2.dataReady, bridge.js): the logo and one line,
// announced once (role=status), so a slow phone shows that something is coming instead of old numbers or an empty page
V2.loadingHtml = () => `<section class="np-loading" aria-busy="true"><div class="np-ldlogo" aria-hidden="true">${V2.logo(true)}</div><p class="np-ldtxt" role="status">Getting today’s numbers…</p><div class="np-ldbar" aria-hidden="true"></div></section>`;
V2.shell = () => { const r = V2.route(), P = V2.pages[r], place = P && P.place || r;
  /* Sim, Nov 19 (B): the top bar's Battle opens Damage Calculator, the first of Battle's tabs; it stays lit on every Battle page */
  const nav = V2.places.map(([k, n]) => `<a href="#${k}"${ /* Sim, Nov 20 (scan S26): the top bar's Battle opens the Battle page (was Damage Calculator, Nov 19 B) */ ''}${k === place ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  return {P, html: `<a class="vh np-skip" href="#main" data-v2skip>Skip to the page</a>
<header class="np-head">${V2.backBtn()}<a class="logo" href="#home" aria-label="NastyPlot, Home">${V2.logo()}</a>${V2.fwdBtn()}<nav class="np-nav" aria-label="Main">${nav}</nav>
  <div class="tools"><button type="button" class="np-search" data-v2search aria-label="Search Pokémon, tools and teams">${V2.ICON.search}<span class="lbl">Search</span><kbd>/</kbd></button>
  <a class="np-theme np-boxlink" href="${r === 'box' ? V2.esc(V2.boxFrom || '#team') : '#box'}" aria-label="${r === 'box' ? 'My Box is open. Back to ' + V2.esc(V2.pageName(V2.boxFrom)) : 'My Box'}" title="${r === 'box' ? 'Back to ' + V2.esc(V2.pageName(V2.boxFrom)) : 'My Box'}"${r === 'box' ? ' aria-current="page"' : ''}>${V2.ICON.box}</a>
  <button type="button" class="np-theme" data-v2theme data-mode="${V2.themeMode()}" aria-label="${V2.themeMode() === 'auto' ? `Auto mode is on, following your device (${V2.theme()} now)` : V2.THEME_WORD[V2.themeMode()] + ' is on'}. Switch to ${V2.themeNext() === 'auto' ? 'auto: follow your device' : V2.themeNext() + ' mode'}" title="${V2.THEME_WORD[V2.themeMode()]}">${V2.ICON[V2.themeMode() === 'auto' ? 'auto' : V2.themeMode() === 'night' ? 'moon' : 'sun']}</button></div></header>
<main class="np-main" id="main">${!V2.dataReady() ? V2.loadingHtml() : `${((place === 'home' || place === 'meta') && r !== 'pokemon') || window.__NP_PVFAIL ? V2.dataNote() : ''}${P ? V2.safeDraw(P) : ''}`}</main>
<footer class="np-foot">${V2.logo(true)}<div class="np-ftxt">${place === 'home' ? '' : '<p class="np-ftag u">Sharply raise <span>your win rate.</span></p>'}<span>NastyPlot is an unofficial, fan&#8209;made tool, not affiliated with Nintendo, The Pok&eacute;mon Company or Game Freak; Pok&eacute;mon names are trademarks of their owners.${V2.dataReady() && V2.asOf() ? ` <span class="np-asof">${V2.esc(V2.asOf())}.</span>` : ''}</span></div><nav aria-label="About"><a href="#method">How We Calculate</a><a href="#about">About</a><a href="#about=priv">Privacy</a><a href="#about=contact">Contact</a>${V2.FB && V2.FB.ok ? '<a href="#feedback">Send Feedback</a>' : ''}${V2.OWN ? `<a href="#owner">Owner</a>` : ``}<button type="button" class="np-fsrcb" data-fsrc aria-expanded="false" aria-controls="np-fsrc">Sources and Credits</button></nav><p class="np-fsrc" id="np-fsrc" hidden>${(() => { try { return DATA_SOURCES.map(x => V2.esc(x.name)).join(' · '); } catch (e) { return ''; } })()}. Type symbols: pokemon-type-icons by James Watkins (MIT). Each used by its own rules; details in <a class="np-link" href="#about=data">About</a>.</p></footer>
<nav class="np-bar" aria-label="Main">${nav}</nav>`}; };
/* audit Nov 16 (WCAG 2.4.2): each page has its own browser title, its name as the menu and search show it ("Meta · NastyPlot"); Home keeps "NastyPlot";
   Pokémon pages set their own fuller title (pages/pokemon.js) */
V2.setTitle = () => { try { const r = V2.route(); if (r === 'pokemon') return; const h = document.querySelector('#main h1'); if (document.querySelector('#main [data-v2nf]')) { if (document.title !== 'Page not found · NastyPlot') document.title = 'Page not found · NastyPlot'; return; } /* Q24: the not-found page, #owner for visitors included */
  const nm = ((V2.findPlaces || []).find(([k, n]) => k === (r === 'team-empty' ? 'team' : r) && typeof n === 'string') || [])[1]; /* design audit #14: the empty-team view is My Team too */
  const t = r === 'home' ? 'NastyPlot' : nm ? nm + ' · NastyPlot' : h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) + ' · NastyPlot' : 'NastyPlot'; if (document.title !== t) document.title = t; } catch (e) {} };
/* V2.drawN counts arrivals (a full draw), so a page can do arrival-only things, like scrolling to a linked part, once per arrival and
   never again on a redraw (code review A1-I4, Nov 17) */
// pre-launch check 6e (Nov 17): say once, after the first draw, when this device's saved data couldn't be read (01-state.js)
setTimeout(() => { try { if (STATE_UNREADABLE && !V2._unrSaid) { V2._unrSaid = 1; V2.toast("Your saved teams on this device couldn't be read, so the sample team is showing. A copy of the old data was kept.", 10000); } } catch (e) {} }, 1500);
V2.draw = () => { const app = document.getElementById('app'); if (!app) return; V2.drawN = (V2.drawN || 0) + 1; const {P, html} = V2.shell();
  // Sim, Nov 11 (iPhone recording): a redraw rebuilt every picture, so all six Pokémon blanked for a moment on each tap. Keep the
  // pictures already on screen and put them back in place of their identical new copies (same src), so nothing re-decodes.
  const keep = new Map(); for (const i of app.querySelectorAll('img[src]')) { const k = i.getAttribute('src'); if (!keep.has(k)) keep.set(k, []); keep.get(k).push(i); }
  app.innerHTML = html;
  if (keep.size) for (const n of app.querySelectorAll('img[src]')) { const l = keep.get(n.getAttribute('src')), o = l && l.shift(); if (!o) continue;
    for (const a of [...o.attributes]) if (a.name !== 'src' && !n.hasAttribute(a.name)) o.removeAttribute(a.name);
    for (const a of [...n.attributes]) if (a.name !== 'src' && a.name !== 'loading' && o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
    o.removeAttribute('loading'); n.replaceWith(o); }
  if (P && P.after) try { P.after(); } catch (e) { console.error(e); } if (V2.fitWords) try { V2.fitWords(); } catch (e) { console.error(e); } V2.setTitle(); };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-v2theme]'); if (t) V2.setTheme(V2.themeNext()); });
// My Box toggles (Sim, Nov 12): the box icon opens My Box; pressed again while in the box, it goes back to the screen you came from
// (that screen's address, so a team or box link isn't replayed); straight into the box with no screen before it: My Team
V2.boxFrom = null;
V2.pageName = h => { const k = String(h || '#team').replace(/^#/, '').split('=')[0]; return {home: 'Home', team: 'My Team', build: 'Build', battle: 'Battle', meta: 'Meta'}[k] || V2.placeTitle(h) || 'My Team'; };
addEventListener('hashchange', e => { let was = ''; try { was = new URL(e.oldURL).hash; } catch (x) {} const y = V2.navStep(was);
  if (V2.route() === 'box' && was && !/^#box\b/.test(was) && !/^#(team|box)=/.test(was)) V2.boxFrom = was;
  const a = document.activeElement, used = !!(a && a !== document.body && a !== document.documentElement); V2.draw(); scrollTo(0, y);
  // code review B9a: when the player was using the page (a link or button had focus), focus moves to the new page's heading, so
  // keyboard and screen-reader users land on the new page instead of at the end of the document; tabindex only while focused
  // a link to a part of a page (#method=rating, #about=priv) scrolls there: focus the first control in view, not the h1 above it (sweep, Nov 15)
  if (used && !V2._sheet && /=/.test(location.hash) && V2.route() !== 'pokemon') { requestAnimationFrame(() => requestAnimationFrame(() => { const cur = document.activeElement; if (cur && cur !== document.body && cur.closest && cur.closest('#main')) return; /* the page placed focus itself */ const top = (document.querySelector('.np-head') || {}).offsetHeight || 0;
    const f = [...document.querySelectorAll('#main :is(summary,a[href],button)')].find(x => { const q = x.getBoundingClientRect(); return q.height && q.top >= top && q.bottom <= innerHeight; }); if (f) f.focus({preventScroll: true}); })); return; }
  const fa = document.activeElement; if (fa && fa !== document.body && fa.closest && fa.closest('#main')) return; /* the page already placed focus itself (the Pokémon page's name) */
  if (used && !V2._sheet) { const h = document.querySelector('#main h1') || document.getElementById('main'); if (h) { h.setAttribute('tabindex', '-1'); h.setAttribute('data-pgfocus', ''); h.focus({preventScroll: true}); h.addEventListener('blur', () => { h.removeAttribute('tabindex'); h.removeAttribute('data-pgfocus'); }, {once: true}); } } });

// ---------- Back button (Sim, Nov 12: "go to where we previously were"; pressing again goes further back) ----------
// Every page change is already one step in the browser's history (its address). Each step is marked with how deep in the site it is
// (v2d), the page it came from (v2p) and where it was scrolled (v2y). Back = one real history step, so it matches the phone swipe and
// the browser's Back exactly: same page, same scroll; a sheet that's open closes first (the sheets' own step, above). It shows only
// when there's a step on this site to go back to (depth > 0), so it can never take you out of NastyPlot.
V2.nav = {d: 0, p: '', ready: false, t: null, max: 0, hs: []}; // max: the deepest step you can go forward to; hs: each step's address (for Forward's label)
try { history.scrollRestoration = 'manual'; } catch (e) {}
V2.navMark = o => { try { history.replaceState(Object.assign({}, history.state, o), ''); } catch (e) {} };
V2.navInit = () => { if (V2.nav.ready) return; V2.nav.ready = true; const st = history.state || {};
  if (st.v2d == null) V2.navMark({v2d: 0, v2p: ''}); else { V2.nav.d = st.v2d; V2.nav.p = st.v2p || ''; } V2.nav.max = V2.nav.d; V2.nav.hs[V2.nav.d] = location.hash || '#home'; };
// called first thing on every address change: an entry we've marked before is a step back (or forward): return its scroll;
// an unmarked one is a new step: mark it one deeper and start at the top
V2.navStep = was => { V2.navInit(); const st = history.state || {};
  if (st.v2d != null) { V2.nav.d = st.v2d; V2.nav.p = st.v2p || ''; V2.nav.hs[V2.nav.d] = location.hash || '#home'; if (V2.nav.d > V2.nav.max) V2.nav.max = V2.nav.d; return st.v2y || 0; }
  // a new step after going back drops the steps you could go forward to (as in any browser)
  // the Back arrow's safety net (below) is a step back, not a new one
  // (a step back or forward keeps the steps you can go forward to, as the browser would)
  if (V2.nav.fb) { const fb = V2.nav.fb; V2.nav.fb = null; V2.nav.d = fb.d; V2.nav.p = fb.p; V2.nav.hs[V2.nav.d] = location.hash || '#home'; if (V2.nav.d > V2.nav.max) V2.nav.max = V2.nav.d; V2.navMark({v2d: fb.d, v2p: fb.p, v2y: 0}); return 0; }
  V2.nav.d++; V2.nav.p = was || '#home'; V2.nav.max = V2.nav.d; V2.nav.hs.length = V2.nav.d; V2.nav.hs[V2.nav.d] = location.hash || '#home'; V2.navMark({v2d: V2.nav.d, v2p: V2.nav.p, v2y: 0}); return 0; };
// remember where this step is scrolled: right before any tap that may change the page, and when the page is hidden or left.
// Sim, Nov 14 (Claude app on iPhone, every long page): the scroll bar flashed after scrolling a moment. Writing to the history while
// scrolling (each 200 ms pause) was the likely cause, so scrolling itself no longer touches the history; Back still returns to the spot.
const navSaveY = () => { if (!V2._sheet && V2.nav.ready) V2.navMark({v2y: Math.round(scrollY)}); };
addEventListener('pagehide', navSaveY); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') navSaveY(); });
document.addEventListener('click', navSaveY, true);
V2.navName = h => { const k = String(h || '#home').replace(/^#/, '').split('=')[0] || 'home';
  return {home: 'Home', build: 'Build', team: 'My Team', battle: 'Battle', meta: 'Meta', box: 'My Box', compare: 'Compare', sheet: 'Team Sheet', guide: 'the Guide',
    method: 'How We Calculate', about: 'About', feedback: 'Send Feedback'}[k] || V2.placeTitle(h) || 'the last page'; };
// any other page by its Search name, a Pokémon page by the Pokémon (function sweep, Nov 15: 13 pages read 'the last page')
V2.placeTitle = h => { const [k, v] = String(h || '').replace(/^#/, '').split('='); try { if (k === 'pokemon' && v) { const n = decodeURIComponent(v); for (const q of byName.values()) if (q.n.toLowerCase() === n) return V2.disp(q.n); return ''; } } catch (e) { return ''; }
  const f = (V2.findPlaces || []).find(x => x[0] === k && !x[2]); return f ? f[1] : ''; };
V2.backBtn = () => { V2.navInit(); const n = V2.esc(V2.navName(V2.nav.p));
  return `<button type="button" class="np-goback" data-v2back aria-label="Back to ${n}" title="Back to ${n}"${V2.nav.d > 0 ? '' : ' hidden'}>${V2.ICON.back}</button>`; };
// Forward (Sim, Nov 12): the mirror of Back, right of the logo; one real history step forward, only when there is one
V2.fwdBtn = () => { V2.navInit(); const can = V2.nav.d < V2.nav.max, n = V2.esc(V2.navName(V2.nav.hs[V2.nav.d + 1]));
  return `<button type="button" class="np-gofwd" data-v2fwd aria-label="Forward to ${n}" title="Forward to ${n}"${can ? '' : ' hidden'}>${V2.ICON.fwd}</button>`; };
// One step back or forward (dir -1 / +1), for both arrows. It takes a real history step, so it matches the browser's own buttons and
// the phone swipe. Safety net (Sim, Nov 18, Claude desktop app, Preview): the page's frame can swallow history steps (Back did nothing,
// Forward never showed). If the address hasn't moved after 350 ms, the page goes straight to that step itself, and from then on (this
// tab) it does so at once, with no wait (Sim: 'a little laggy' at 700 ms). Tests: app/test/v2-back.mjs.
V2.navNoHist = (() => { try { return sessionStorage.getItem('np.nohist') === '1'; } catch (e) { return false; } })();
V2.navGo = dir => { const d0 = V2.nav.d, t = d0 + dir; if (t < 0 || t > V2.nav.max) return;
  const h0 = location.hash, to = dir < 0 ? (V2.nav.p || V2.nav.hs[t] || '#home') : (V2.nav.hs[t] || ''); if (!to) return;
  const direct = () => { if (location.hash !== h0 || V2.nav.d !== d0 || V2._sheet || to === h0) return;
    V2.nav.fb = {d: t, p: t > 0 ? (V2.nav.hs[t - 1] || '#home') : ''}; location.hash = to; };
  if (V2.navNoHist) { direct(); return; }
  try { dir < 0 ? history.back() : history.forward(); } catch (x) {}
  clearTimeout(V2.nav.fbT); V2.nav.fbT = setTimeout(() => { if (location.hash !== h0 || V2.nav.d !== d0) return;
    V2.navNoHist = true; try { sessionStorage.setItem('np.nohist', '1'); } catch (e) {} direct(); }, 350); };
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-v2fwd]'))) return; if (V2._sheet) { V2.closeSheet(); return; } V2.navGo(1); });
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-v2back]'))) return; if (V2._sheet) { V2.closeSheet(); return; } V2.navGo(-1); });
// Double taps (today's 34-events.js TAP_ACT, Oct 31; audit X-03/X-04, Nov 12): right after an action that changes the team, the box,
// their six, the log or the page, a second tap within 450 ms is ignored, so a double tap can't apply twice, save twice, or land on
// whatever the redraw put under the finger. One capture-phase listener, as today; the two per-button guards in sugs.js stay harmless.
V2.TAP_ACT = /* Nov 21: + data-v2add (the Pokémon page's USE THIS SET. stays under the finger after it adds) */ /* today's set mapped to the new buttons (plan, absave, abuse, chrm, rec, qa, evload, abaround, clearTeam) + the audit's Use/Save/core/Load + the log's Win/Loss */
  '[data-v2add],[data-v2plan],[data-v2plana],[data-v2qa],[data-v2rm],[data-v2fix],[data-mufix],[data-v2clear],[data-bduse],[data-bdsave],[data-bdcore],[data-hmload],[data-hmaround],[data-bdgo],[data-btlres]';
V2._tapAt = 0; V2._tapXY = [0, 0];
// code review B9d: only a second tap near the same spot counts as the double tap (it blocked every click on the site for 450 ms, ✕ and
// Undo included); a keyboard Enter (no position) on the same control within 450 ms is still ignored
document.addEventListener('click', e => { const now = Date.now(), kb = !e.detail && !e.clientX && !e.clientY;
  if (now - V2._tapAt < 450 && (kb ? e.target === V2._tapEl : Math.hypot(e.clientX - V2._tapXY[0], e.clientY - V2._tapXY[1]) < 24)) { e.stopImmediatePropagation(); e.preventDefault(); return; }
  const b = e.target && e.target.closest && e.target.closest(V2.TAP_ACT); if (b) { V2._tapAt = now; V2._tapXY = [e.clientX, e.clientY]; V2._tapEl = e.target; } }, true);
// ---------- ↑/↓ through a name box's suggestions (audit JUMP-04 / X-09; today's search and name boxes have it) ----------
// One rule for every box: ↓ from the box moves focus to the first suggestion, ↑/↓ move between them, ↑ from the first goes back to
// the box. Focus shows the site's usual focus ring, Enter/Space picks (they are buttons and links). The add box (six.js) keeps its own.
V2.ARROW_LISTS = [['[data-v2q]', () => '[data-v2hits] .np-hit'], ['[data-bxq]', () => '[data-bxhits] .np-hit:not([aria-disabled])'],
  ['[data-bdfind]', () => '[data-bdhits] [data-bdpick]'], ['[data-bdcfind]', () => '[data-bdchits] [data-bdcpick]'],
  ['[data-btfind]', i => `[data-bthits="${i.dataset.btfind}"] [data-btpick]`]];
document.addEventListener('keydown', e => { if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' || e.altKey || e.ctrlKey || e.metaKey || !e.target.closest) return;
  for (const [sel, list] of V2.ARROW_LISTS) {
    const inp = e.target.matches(sel) ? e.target : null, items = inp ? [...document.querySelectorAll(list(inp))].filter(x => x.getClientRects().length) : null;
    if (inp) { if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); items[0].focus(); } return; }
    for (const box of document.querySelectorAll(sel)) { const its = [...document.querySelectorAll(list(box))].filter(x => x.getClientRects().length), k = its.indexOf(e.target);
      if (k < 0) continue; e.preventDefault(); const n = k + (e.key === 'ArrowDown' ? 1 : -1);
      if (n < 0) box.focus(); else if (n < its.length) its[n].focus(); return; } } });

// footer: "Sources and Credits" sits with the links (no row of its own, so pages stay within their heights) and opens the list below
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fsrc]'); if (!b) return; const p = document.getElementById('np-fsrc'); if (!p) return; const open = p.hidden; p.hidden = !open; b.setAttribute('aria-expanded', open); });

// the skip link (code review A1, Nov 15): moves keyboard focus to the page instead of changing the address (#main sent it to Home)
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-v2skip]'); if (!a) return; e.preventDefault(); const m = document.getElementById('main'); if (m) { m.setAttribute('tabindex', '-1'); m.focus({preventScroll: false}); m.addEventListener('blur', () => m.removeAttribute('tabindex'), {once: true}); } }); /* tabindex only while focused: a lasting one made <main> read as one big control (6 Meta tests tapped it) */
