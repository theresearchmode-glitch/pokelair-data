// ---------- NastyPlot v2 shell (R3, Nov 11): header, navigation, phone bar, footer, theme, routing ----------
// Pages register themselves in V2.pages; the shell draws the frame and the current page from location.hash (#home, #team...).
// Art: one place for every Pokémon picture (V2.art), so the art can be swapped in one line (ownership rule, Nov 11).
const V2 = window.V2 = {pages: {}, ART_BASE: window.NP_ART || 'art/'};
V2.art = id => V2.ART_BASE + id + '.webp';
V2.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[m]);
V2.LS = {get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }};
// the five places, in the order players use them (Sim, Nov 11: Home is in the menu)
// type colours live in tokens.css (--ty-Dragon...); an unknown type falls back to --type-none
V2.TYPES = ['Dragon','Ground','Fighting','Poison','Dark','Steel','Fire','Water','Grass','Fairy','Flying','Ghost','Psychic','Ice','Rock','Electric','Normal','Bug'];
V2.typeChip = t => `<span class="np-type"${V2.TYPES.includes(t) ? ` style="--tc:var(--ty-${t})"` : ''}>${V2.esc(t)}</span>`;
// a Pokémon by its site name (ROSTER .n), drawn standing on its floor; opts: {sel, sub, iw}
V2.byName = new Map((typeof ROSTER === 'object' ? ROSTER : []).map(p => [p.n, p]));
V2.disp = n => { const p = V2.byName.get(n); return p && p.d ? p.d : n.replace(/^(.*)-Mega(?:-(\w+))?$/, (m, b, x) => 'Mega ' + b + (x ? ' ' + x : '')); };
// a form letter never sits alone on a line ("Charizard Y"); a long Mega name breaks only after "Mega" (Sim, Nov 12)
// a lone form letter stays with the word before it ('Charizard Y', 'Charizardite Y', 'Charizard Y\'s'; Nov 12 rule), for text built elsewhere
V2.keepForm = h => String(h).replace(/([A-Za-z]) ([XYZ])(?![A-Za-z])/g, '$1\u00a0$2');
V2.nameHtml = d => d.startsWith('Mega ') ? `<span class="mg">Mega</span> ${V2.esc(d.slice(5)).replace(/ ([XYZ])$/, '\u00a0$1')}` : `<span class="mg none" aria-hidden="true">&nbsp;</span>${V2.esc(d)}`;
// a Pokémon's own colour (already normalised: hue kept, saturation 72%+, lightness 56%) as an r,g,b triplet for rgba()
V2.cp = n => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165]; return m[0] + ',' + m[1] + ',' + m[2]; };
// A9 (Sim, Nov 12: "fix pls"): on a Pokémon tile "Mega" is a small slanted tag on the picture's corner, so every name block is the
// same shape (no reserved blank line above every name); elsewhere (rows, sentences) Mega stays inline before the name (nameHtml)
V2.mon = (n, o = {}) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165, 0];
  return `<div class="np-mon${o.sel ? ' sel' : ''}${o.ft ? ' ft' : ''}" style="--cp:${m[0]},${m[1]},${m[2]};--fo:${m[3]}${o.iw ? ';--iw:' + o.iw + 'px' : ''}"><div class="st"><i class="pool" aria-hidden="true"></i>${id ? `<img src="${V2.art(id)}" alt="" loading="lazy">` : ''}${V2.disp(n).startsWith('Mega ') && !o.bare ? '<span class="np-megatag">Mega</span>' : ''}</div>${o.bare ? '' : `<b>${V2.esc(V2.disp(n).replace(/^Mega /, ''))}</b>`}${o.sub ? `<small>${V2.esc(o.sub)}</small>` : ''}</div>`; };
// drawn icons (the ⌕ glyph renders tiny in Instrument Sans)
V2.ICON = {fwd: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5 16.5 12 9 19.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>', back: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4.5 7.5 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>', search: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  // My Box: a storage box (lid, body, handle slot), drawn like the search glass
  // My Box (Sim, Nov 12): a Pokémon PC with a Poké Ball on its screen (option A: "easiest to identify"), same line weight as the other icons
  box: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/><circle cx="12" cy="10" r="3.4"/><path d="M8.6 10h6.8"/></g></svg>',
  // Day/Night as a sun and a moon (Sim, Nov 12: not the words; today's site shows the mode you're in: a sun by day, a moon at night)
  sun: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/></g></svg>',
  moon: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>'};
// one toast at a time, always just above the team dock and the phone bar (whichever is higher on screen)
V2.toast = (html, ms = 4000) => { document.querySelectorAll('.np-toast').forEach(x => x.remove());
  const t = document.createElement('div'); t.className = 'np-toast'; t.setAttribute('role', 'status'); t.innerHTML = html; document.body.append(t);
  const tops = [...document.querySelectorAll('.np-dock,.np-bar')].map(e => e.getBoundingClientRect()).filter(r => r.height && r.top < innerHeight).map(r => r.top);
  if (tops.length) t.style.setProperty('--tb', (innerHeight - Math.min(...tops) + 12) + 'px'); // a custom property, so an open sheet can still move it (components.css)
  clearTimeout(V2._tt); V2._tt = setTimeout(() => t.remove(), ms); return t; };
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
V2.sheet = (html, o = {}) => { const prev = V2._sheet, back = prev ? prev.back : document.activeElement; V2.closeSheet(true, true); V2.histOpen();
  const wrap = document.createElement('div'); wrap.className = 'np-sheetwrap';
  wrap.innerHTML = `<div class="np-scrim" data-v2close></div><div class="np-sheet${o.small ? ' sm' : ''}${o.fit ? ' fit' : ''}" role="dialog" aria-modal="true" aria-label="${V2.esc(o.label || 'Details')}" tabindex="-1"><button class="x" type="button" data-v2close aria-label="Close">✕</button>${html}</div>`;
  document.body.append(wrap); document.documentElement.classList.add('np-locked');
  V2._sheet = {wrap, back, onClose: o.onClose};
  const first = wrap.querySelector(o.focus || '.np-sheet'); (first || wrap.querySelector('.np-sheet')).focus({preventScroll: true});
  return wrap.querySelector('.np-sheet'); };
V2.closeSheet = (quiet, swap) => { const S = V2._sheet; if (!S) return; V2._sheet = null; S.wrap.remove(); document.documentElement.classList.remove('np-locked'); if (!swap) V2.histClose();
  if (S.onClose) try { S.onClose(); } catch (e) {} if (!quiet && S.back && S.back.isConnected) S.back.focus({preventScroll: true}); };
document.addEventListener('click', e => { if (V2._sheet && e.target.closest('[data-v2close]')) V2.closeSheet(); });
document.addEventListener('keydown', e => { const S = V2._sheet; if (!S) return;
  if (e.key === 'Escape') { e.preventDefault(); V2.closeSheet(); return; }
  // focus stays in the sheet (Sim's check, Nov 12: in the info sheet Tab left after 6 stops, because the inactive tabs, tabindex -1,
  // were counted as stops). Only controls that really take Tab count: not tabindex -1, not disabled, shown, not in a closed fold.
  if (e.key !== 'Tab') return; const shown = x => x.getClientRects().length && !x.closest('[hidden],[inert]') && !(x.closest('details:not([open])') && !(x.matches('summary') && x.parentElement.matches('details:not([open])')));
  const f = [...S.wrap.querySelectorAll('.np-sheet :is(a[href],button,input,select,textarea,summary,[tabindex])')].filter(x => x.tabIndex >= 0 && !x.disabled && shown(x));
  if (!f.length) return; const i = f.indexOf(document.activeElement);
  if (i < 0) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus(); return; }
  if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } });

// ---------- search: places and Pokémon, from the header button or the / key ----------
V2.find = q => { q = q.trim().toLowerCase(); if (!q) return {places: [], mons: []};
  // accents count as their plain letter ("é" = "e", as in Pokémon); a query that is all punctuation finds nothing (Sim's check E16,
  // Nov 12: "é" became an empty query, which matched every name, so the most-used Pokémon showed up)
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''), nq = norm(q);
  if (!nq) return {places: V2.findPlaces.filter(([, n]) => n.toLowerCase().includes(q)), mons: []};
  const places = V2.findPlaces.filter(([, n]) => n.toLowerCase().includes(q));
  const mons = [...V2.byName.values()].map(p => { const d = norm(V2.disp(p.n)), n = norm(p.n); const at = Math.min(...[d.indexOf(nq), n.indexOf(nq)].filter(i => i >= 0).concat(99));
    return {p, at: at === 99 ? null : at}; }).filter(x => x.at !== null).sort((a, b) => a.at - b.at || (b.p.u || 0) - (a.p.u || 0) || V2.disp(a.p.n).length - V2.disp(b.p.n).length).slice(0, 8).map(x => x.p);
  return {places, mons}; };
V2.openSearch = () => { const sh = V2.sheet(`<div class="np-find"><h2 class="u">Search</h2><label class="np-field">${V2.ICON.search}<input type="search" data-v2q placeholder="Find a Pokémon, a saved team or a page" aria-label="Find a Pokémon, a saved team or a page" autocomplete="off"></label><div class="hits" data-v2hits aria-live="polite"></div></div>`, {label: 'Search', small: true, focus: '[data-v2q]'});
  const inp = sh.querySelector('[data-v2q]'), out = sh.querySelector('[data-v2hits]');
  // saved teams by name too (today's search does): choosing one opens it, like Open in Saved Teams
  const teams = q => { q = q.trim().toLowerCase(); return q && typeof S === 'object' ? S.teams.filter(t => t.format !== 'singles' && String(t.name).toLowerCase().includes(q)).slice(0, 4) : []; };
  const draw = () => { const r = V2.find(inp.value), tm = teams(inp.value);
    out.innerHTML = !inp.value.trim() ? '<p class="fine">Type a Pokémon\'s name, a saved team, or a page like Battle.</p>'
      : !r.places.length && !r.mons.length && !tm.length ? `<p class="fine">Nothing called “${V2.esc(inp.value.trim())}”. Try part of the name.</p>`
      : r.places.map(([k, n, act]) => act ? `<button type="button" class="np-hit" data-v2place="${V2.findPlaces.findIndex(x => x[1] === n)}"><span class="pg">Page</span><b>${n}</b></button>` : `<a class="np-hit" href="#${k}" data-v2close><span class="pg">Page</span><b>${n}</b></a>`).join('')
        + tm.map(t => `<button type="button" class="np-hit" data-svact="open" data-id="${V2.esc(t.id)}"><span class="pg">Saved team</span><b>${V2.esc(t.name)}</b></button>`).join('')
        + r.mons.map(p => `<button type="button" class="np-hit" data-v2mon="${V2.esc(p.n)}"><img src="${V2.art(SPRITE_ID[p.n])}" alt="" loading="lazy"><b>${V2.nameHtml(V2.disp(p.n))}</b><span class="ty">${(p.t || []).map(V2.typeChip).join('')}</span></button>`).join(''); };
  inp.addEventListener('input', draw);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const h = out.querySelector('.np-hit'); if (h) { e.preventDefault(); h.click(); } } });
  draw(); };
// a Pokémon picked anywhere opens its info sheet; pages replace V2.openMon when the full sheet is built (R4)
V2.openMon = n => { const p = V2.byName.get(n); if (!p) return;
  V2.sheet(`<div class="np-monsheet">${V2.mon(n, {iw: 220, bare: true})}<div><h2 class="u">${V2.esc(V2.disp(n))}</h2><div class="ty">${(p.t || []).map(V2.typeChip).join('')}</div><p class="fine">Abilities: ${(p.a || []).map(V2.esc).join(', ')}</p>${V2.addBtn ? V2.addBtn(n) : ''}</div></div>`, {label: V2.disp(n), small: true}); };
document.addEventListener('click', e => { const m = e.target.closest('[data-v2mon]'); if (m) { e.preventDefault(); V2.openMon(m.dataset.v2mon); }
  if (e.target.closest('[data-v2search]')) V2.openSearch(); });
document.addEventListener('keydown', e => { if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.altKey) { e.preventDefault(); if (!V2._sheet) V2.openSearch(); return; } if (e.key === '/' && !V2._sheet && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); V2.openSearch(); } });
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
  ['team', 'Team Sheet', () => V2.openTeamSheet && V2.openTeamSheet()], ['team', 'All Suggestions', () => V2.openAllSugs && V2.openAllSugs()]];
V2.goPlace = i => { const pl = V2.findPlaces[i]; if (!pl) return; const [k, , act] = pl;
  if (!act) { location.hash = '#' + k; return; } V2.closeSheet(true); if (location.hash !== '#' + k) location.hash = '#' + k; setTimeout(act, 60); };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-v2place]'); if (b) V2.goPlace(+b.dataset.v2place); });
V2.theme = () => document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
V2.setTheme = t => { document.documentElement.dataset.theme = t; V2.LS.set('np2.theme', t); V2.redraw(); }; // in place: focus stays on Day/Night (A5)
V2.logo = (small) => { const L = typeof NP_SVG === 'object' ? NP_SVG : {}, svg = V2.theme() === 'night' ? L.hdrD : L.hdrL;
  /* the footer copy gets its own mask ids, so the two logos on one page never share an id */
  return svg ? (small ? svg.replace(/nphdr(L|D)/g, 'nphdr$1f') : svg) : '<b class="u">NastyPlot</b>'; };
// the data's date (Sim's review item 18): "Data as of Nov 11", plus "(N days old)" when stale; shared with today's site
V2.asOf = () => { try { return typeof dataDateText === 'function' ? dataDateText() : ''; } catch (e) { return ''; } };
V2.route = () => { const h = (location.hash || '').slice(1); return V2.pages[h] ? h : (V2.pages.home ? 'home' : Object.keys(V2.pages)[0]); };
// Word list (Sim, Nov 9; Nov 12: "fix them based on your recommendation"): the idea is Matchups and its levels are Beats it /
// Handles it, never "ready". Shared logic (also today's site) still writes "Ready for ..."; the new site says it the word list's way.
// The "81%" in "Ready for 81% of the top 30" is a weighted score, not a share of threats, so the plain count is shown instead.
V2.wl = (t, hand) => String(t == null ? '' : t)
  .replace(/Ready for \d+% of the top (\d+) threats(?:,| ·) handles (\d+) of \d+/g, 'Beats or handles $2 of the top $1 threats')
  .replace(/Ready for \d+% of the top (\d+) threats/g, (m, n) => hand ? `Beats or handles ${hand.x} of the top ${hand.n}` : m)
  .replace(/([Rr])eady for (\d+)\/(\d+) top threats/g, (m, r, x, n) => `${r === 'R' ? 'B' : 'b'}eats or handles ${x} of ${n} top threats`)
  .replace(/Ready for (\d+)\/(\d+) → (\d+)\/(\d+) top threats/g, 'Beats or handles $1 → $3 of $2 top threats')
  .replace(/(\d+)% → (\d+)% ready for the top (\d+) threats/g, 'Matchups $1% → $2% against the top $3 threats')
  .replace(/(\d+)% ready for the top (\d+) threats/g, 'Matchups $1% against the top $2 threats')
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
  if (o.isEqualNode(n)) { if ('value' in o && /^(INPUT|TEXTAREA|SELECT)$/.test(o.nodeName)) V2.morphField(o, n); return; }
  for (const a of [...o.attributes]) if (!n.hasAttribute(a.name)) o.removeAttribute(a.name);
  for (const a of [...n.attributes]) if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(o.nodeName)) V2.morphField(o, n);
  V2.morphKids(o, n); };
V2.morphKids = (o, n) => { const oc = [...o.childNodes], nc = [...n.childNodes], k = Math.min(oc.length, nc.length);
  for (let i = 0; i < k; i++) V2.morph(oc[i], nc[i]); for (let i = k; i < oc.length; i++) oc[i].remove(); for (let i = k; i < nc.length; i++) o.append(nc[i]); };
// a form field ends up as a full redraw would leave it (value and ticks from the new page), so code that clears a box still works
V2.morphField = (o, n) => { if (o.nodeName === 'SELECT') { V2.morphKids(o, n); o.value = [...n.options].find(x => x.hasAttribute('selected'))?.value ?? o.value; return; }
  if (o.type === 'checkbox' || o.type === 'radio') o.checked = n.hasAttribute('checked'); else if (o.value !== (n.getAttribute('value') ?? n.textContent ?? '')) o.value = n.getAttribute('value') ?? (o.nodeName === 'TEXTAREA' ? n.textContent : ''); };
V2.redraw = () => { const app = document.getElementById('app'); if (!app || !app.firstChild) { V2.draw(); return; }
  const y = scrollY, act = document.activeElement, key = V2.focusKey(act), r = V2.shell(), t = document.createElement('template'); t.innerHTML = r.html;
  V2.morphKids(app, t.content); scrollTo(0, y);
  if (key && !act.isConnected) { const e = [...document.querySelectorAll('#app ' + key.sel)][Math.max(0, key.i)]; if (e) e.focus({preventScroll: true}); }
  if (r.P && r.P.after) try { r.P.after(); } catch (e) { console.error(e); } };
// the whole page as HTML (header, the page, footer, phone bar); V2.draw puts it in fresh, V2.redraw merges it in place
// one page's error never blanks the whole site (audit SHELL-34; today's safe() wrapper does the same per section): the header, menus
// and footer still draw, the page says what happened, and the error goes to the console for the checks to catch
V2.safeDraw = P => { try { return P.draw(); } catch (e) { console.error(e); return '<section class="cm2"><div class="cm2-t"><h1 class="u">This page didn\u2019t load.</h1><p class="tm-sub">Something went wrong drawing it. Reload to try again; the rest of the site still works.</p></div></section>'; } };
V2.shell = () => { const r = V2.route(), P = V2.pages[r], place = P && P.place || r;
  const nav = V2.places.map(([k, n]) => `<a href="#${k}"${k === place ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  return {P, html: `<a class="vh" href="#main">Skip to the page</a>
<header class="np-head">${V2.backBtn()}<a class="logo" href="#home" aria-label="NastyPlot, Home">${V2.logo()}</a>${V2.fwdBtn()}<nav class="np-nav" aria-label="Main">${nav}</nav>
  <div class="tools"><button type="button" class="np-search" data-v2search aria-label="Search Pokémon, tools and teams">${V2.ICON.search}<span class="lbl">Search</span><kbd>/</kbd></button>
  <a class="np-theme np-boxlink" href="${r === 'box' ? V2.esc(V2.boxFrom || '#team') : '#box'}" aria-label="${r === 'box' ? 'My Box is open. Back to ' + V2.esc(V2.pageName(V2.boxFrom)) : 'My Box'}" title="${r === 'box' ? 'Back to ' + V2.esc(V2.pageName(V2.boxFrom)) : 'My Box'}"${r === 'box' ? ' aria-current="page"' : ''}>${V2.ICON.box}</a>
  <button type="button" class="np-theme" data-v2theme aria-label="${V2.theme() === 'night' ? 'Night mode is on. Switch to day mode' : 'Day mode is on. Switch to night mode'}" title="${V2.theme() === 'night' ? 'Night mode' : 'Day mode'}">${V2.theme() === 'night' ? V2.ICON.moon : V2.ICON.sun}</button></div></header>
<main class="np-main" id="main">${P ? V2.safeDraw(P) : ''}</main>
<footer class="np-foot">${V2.logo(true)}<span>NastyPlot is an unofficial, fan&#8209;made tool.${V2.asOf() ? ` <span class="np-asof">${V2.esc(V2.asOf())}.</span>` : ''}</span><nav aria-label="About"><a href="#method">How We Calculate</a><a href="#about">About</a><a href="#feedback">Send Feedback</a></nav></footer>
<nav class="np-bar" aria-label="Main">${nav}</nav>`}; };
V2.draw = () => { const app = document.getElementById('app'); if (!app) return; const {P, html} = V2.shell();
  // Sim, Nov 11 (iPhone recording): a redraw rebuilt every picture, so all six Pokémon blanked for a moment on each tap. Keep the
  // pictures already on screen and put them back in place of their identical new copies (same src), so nothing re-decodes.
  const keep = new Map(); for (const i of app.querySelectorAll('img[src]')) { const k = i.getAttribute('src'); if (!keep.has(k)) keep.set(k, []); keep.get(k).push(i); }
  app.innerHTML = html;
  if (keep.size) for (const n of app.querySelectorAll('img[src]')) { const l = keep.get(n.getAttribute('src')), o = l && l.shift(); if (!o) continue;
    for (const a of [...o.attributes]) if (a.name !== 'src' && !n.hasAttribute(a.name)) o.removeAttribute(a.name);
    for (const a of [...n.attributes]) if (a.name !== 'src' && a.name !== 'loading' && o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
    o.removeAttribute('loading'); n.replaceWith(o); }
  if (P && P.after) try { P.after(); } catch (e) { console.error(e); } };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-v2theme]'); if (t) V2.setTheme(V2.theme() === 'night' ? 'day' : 'night'); });
// My Box toggles (Sim, Nov 12): the box icon opens My Box; pressed again while in the box, it goes back to the screen you came from
// (that screen's address, so a team or box link isn't replayed); straight into the box with no screen before it: My Team
V2.boxFrom = null;
V2.pageName = h => { const k = String(h || '#team').replace(/^#/, '').split('=')[0]; return {home: 'Home', team: 'My Team', build: 'Build', battle: 'Battle', meta: 'Meta'}[k] || 'My Team'; };
addEventListener('hashchange', e => { let was = ''; try { was = new URL(e.oldURL).hash; } catch (x) {} const y = V2.navStep(was);
  if (V2.route() === 'box' && was && !/^#box\b/.test(was) && !/^#(team|box)=/.test(was)) V2.boxFrom = was; V2.draw(); scrollTo(0, y); });

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
  V2.nav.d++; V2.nav.p = was || '#home'; V2.nav.max = V2.nav.d; V2.nav.hs.length = V2.nav.d; V2.nav.hs[V2.nav.d] = location.hash || '#home'; V2.navMark({v2d: V2.nav.d, v2p: V2.nav.p, v2y: 0}); return 0; };
// remember where this step is scrolled: when scrolling settles, and right before any tap that may change the page
addEventListener('scroll', () => { clearTimeout(V2.nav.t); V2.nav.t = setTimeout(() => { if (!V2._sheet) V2.navMark({v2y: Math.round(scrollY)}); }, 200); }, {passive: true});
document.addEventListener('click', () => { if (!V2._sheet && V2.nav.ready) { clearTimeout(V2.nav.t); V2.navMark({v2y: Math.round(scrollY)}); } }, true);
V2.navName = h => { const k = String(h || '#home').replace(/^#/, '').split('=')[0] || 'home';
  return {home: 'Home', build: 'Build', team: 'My Team', battle: 'Battle', meta: 'Meta', box: 'My Box', compare: 'Compare', sheet: 'Team Sheet', guide: 'the Guide',
    method: 'How We Calculate', about: 'About', feedback: 'Send Feedback'}[k] || 'the last page'; };
V2.backBtn = () => { V2.navInit(); const n = V2.esc(V2.navName(V2.nav.p));
  return `<button type="button" class="np-goback" data-v2back aria-label="Back to ${n}" title="Back to ${n}"${V2.nav.d > 0 ? '' : ' hidden'}>${V2.ICON.back}</button>`; };
// Forward (Sim, Nov 12): the mirror of Back, right of the logo; one real history step forward, only when there is one
V2.fwdBtn = () => { V2.navInit(); const can = V2.nav.d < V2.nav.max, n = V2.esc(V2.navName(V2.nav.hs[V2.nav.d + 1]));
  return `<button type="button" class="np-gofwd" data-v2fwd aria-label="Forward to ${n}" title="Forward to ${n}"${can ? '' : ' hidden'}>${V2.ICON.fwd}</button>`; };
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-v2fwd]'))) return; if (V2._sheet) { V2.closeSheet(); return; }
  if (V2.nav.d < V2.nav.max) try { history.forward(); } catch (x) {} });
document.addEventListener('click', e => { if (!(e.target.closest && e.target.closest('[data-v2back]'))) return; if (V2._sheet) { V2.closeSheet(); return; }
  if (V2.nav.d > 0) try { history.back(); } catch (x) {} });
// Double taps (today's 34-events.js TAP_ACT, Oct 31; audit X-03/X-04, Nov 12): right after an action that changes the team, the box,
// their six, the log or the page, a second tap within 450 ms is ignored, so a double tap can't apply twice, save twice, or land on
// whatever the redraw put under the finger. One capture-phase listener, as today; the two per-button guards in sugs.js stay harmless.
V2.TAP_ACT = /* today's set mapped to the new buttons (plan, absave, abuse, chrm, rec, qa, evload, abaround, clearTeam) + the audit's Use/Save/core/Load + the log's Win/Loss */
  '[data-v2plan],[data-v2plana],[data-v2qa],[data-v2rm],[data-v2fix],[data-mufix],[data-v2clear],[data-bduse],[data-bdsave],[data-bdcore],[data-hmload],[data-hmaround],[data-bdgo],[data-btlres]';
V2._tapAt = 0;
document.addEventListener('click', e => { const now = Date.now(); if (now - V2._tapAt < 450) { e.stopImmediatePropagation(); e.preventDefault(); return; }
  const b = e.target && e.target.closest && e.target.closest(V2.TAP_ACT); if (b) V2._tapAt = now; }, true);
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
