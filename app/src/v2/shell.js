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
V2.nameHtml = d => d.startsWith('Mega ') ? `<span class="mg">Mega</span> ${V2.esc(d.slice(5))}` : `<span class="mg none" aria-hidden="true">&nbsp;</span>${V2.esc(d)}`;
// a Pokémon's own colour (already normalised: hue kept, saturation 72%+, lightness 56%) as an r,g,b triplet for rgba()
V2.cp = n => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165]; return m[0] + ',' + m[1] + ',' + m[2]; };
V2.mon = (n, o = {}) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165, 0];
  return `<div class="np-mon${o.sel ? ' sel' : ''}" style="--cp:${m[0]},${m[1]},${m[2]};--fo:${m[3]}${o.iw ? ';--iw:' + o.iw + 'px' : ''}"><div class="st"><i class="pool" aria-hidden="true"></i>${id ? `<img src="${V2.art(id)}" alt="" loading="lazy">` : ''}</div>${o.bare ? '' : `<b>${V2.nameHtml(V2.disp(n))}</b>`}${o.sub ? `<small>${V2.esc(o.sub)}</small>` : ''}</div>`; };
// drawn icons (the ⌕ glyph renders tiny in Instrument Sans)
V2.ICON = {search: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'};
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
  const set = () => { raf = 0; const kb = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)); document.documentElement.style.setProperty('--kb', kb + 'px');
    const a = document.activeElement; if (kb && a && a.closest && a.closest('.np-sheet') && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) a.scrollIntoView({block: 'nearest'}); };
  const later = () => { if (!raf) raf = requestAnimationFrame(set); };
  vv.addEventListener('resize', later); vv.addEventListener('scroll', later); set(); })();
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
  try { if (history.state && history.state.v2sh) { V2.hist.skip++; history.back(); } } catch (e) {} });
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
  if (e.key !== 'Tab') return; const f = [...S.wrap.querySelectorAll('.np-sheet a[href],.np-sheet button,.np-sheet input,.np-sheet [tabindex="0"]')].filter(x => x.offsetParent);
  if (!f.length) return; const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } });

// ---------- search: places and Pokémon, from the header button or the / key ----------
V2.find = q => { q = q.trim().toLowerCase(); if (!q) return {places: [], mons: []};
  const norm = x => x.toLowerCase().replace(/[^a-z0-9]/g, ''), nq = norm(q);
  const places = V2.places.filter(([, n]) => n.toLowerCase().includes(q));
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
      : r.places.map(([k, n]) => `<a class="np-hit" href="#${k}" data-v2close><span class="pg">Page</span><b>${n}</b></a>`).join('')
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
V2.places = [['home', 'Home'], ['build', 'Build'], ['team', 'My Team'], ['battle', 'Battle'], ['meta', 'Meta']];
V2.theme = () => document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
V2.setTheme = t => { document.documentElement.dataset.theme = t; V2.LS.set('np2.theme', t); V2.draw(); };
V2.logo = (small) => { const L = typeof NP_SVG === 'object' ? NP_SVG : {}, svg = V2.theme() === 'night' ? L.hdrD : L.hdrL;
  /* the footer copy gets its own mask ids, so the two logos on one page never share an id */
  return svg ? (small ? svg.replace(/nphdr(L|D)/g, 'nphdr$1f') : svg) : '<b class="u">NastyPlot</b>'; };
V2.route = () => { const h = (location.hash || '').slice(1); return V2.pages[h] ? h : (V2.pages.home ? 'home' : Object.keys(V2.pages)[0]); };
// redraw the current page after data arrives, keeping the reader's place and focus (no scroll jump)
V2.redraw = () => { const y = scrollY, f = document.activeElement && document.activeElement.id; V2.draw(); scrollTo(0, y); if (f) { const e = document.getElementById(f); if (e) e.focus({preventScroll: true}); } };
V2.draw = () => { const app = document.getElementById('app'); if (!app) return; const r = V2.route(), P = V2.pages[r], place = P && P.place || r;
  const nav = V2.places.map(([k, n]) => `<a href="#${k}"${k === place ? ' aria-current="page"' : ''}>${n}</a>`).join('');
  app.innerHTML = `<a class="vh" href="#main">Skip to the page</a>
<header class="np-head"><a class="logo" href="#home" aria-label="NastyPlot, Home">${V2.logo()}</a><nav class="np-nav" aria-label="Main">${nav}</nav>
  <div class="tools"><button type="button" class="np-search" data-v2search aria-label="Search Pokémon, tools and teams">${V2.ICON.search}<span class="lbl">Search</span><kbd>/</kbd></button>
  <button type="button" class="np-theme" data-v2theme aria-label="Switch to ${V2.theme() === 'night' ? 'day' : 'night'} mode">${V2.theme() === 'night' ? 'Day' : 'Night'}</button></div></header>
<main class="np-main" id="main">${P ? P.draw() : ''}</main>
<footer class="np-foot">${V2.logo(true)}<span>NastyPlot is an unofficial, fan-made tool.</span><nav aria-label="About"><a href="#method">How We Calculate</a><a href="#about">About</a><a href="#feedback">Send Feedback</a></nav></footer>
<nav class="np-bar" aria-label="Main">${nav}</nav>`;
  if (P && P.after) try { P.after(); } catch (e) { console.error(e); } };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-v2theme]'); if (t) V2.setTheme(V2.theme() === 'night' ? 'day' : 'night'); });
addEventListener('hashchange', () => { V2.draw(); scrollTo(0, 0); });
