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
V2.nameHtml = d => d.startsWith('Mega ') ? `<span class="mg">Mega</span>${V2.esc(d.slice(5))}` : `<span class="mg none" aria-hidden="true">&nbsp;</span>${V2.esc(d)}`;
V2.mon = (n, o = {}) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165, 0];
  return `<div class="np-mon${o.sel ? ' sel' : ''}" style="--cp:${m[0]},${m[1]},${m[2]};--fo:${m[3]}${o.iw ? ';--iw:' + o.iw + 'px' : ''}"><i class="pool" aria-hidden="true"></i>${id ? `<img src="${V2.art(id)}" alt="" loading="lazy">` : ''}<b>${V2.nameHtml(V2.disp(n))}</b>${o.sub ? `<small>${V2.esc(o.sub)}</small>` : ''}</div>`; };
// drawn icons (the ⌕ glyph renders tiny in Instrument Sans)
V2.ICON = {search: '<svg class="np-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'};
// one toast at a time, always just above the team dock and the phone bar (whichever is higher on screen)
V2.toast = (html, ms = 4000) => { document.querySelectorAll('.np-toast').forEach(x => x.remove());
  const t = document.createElement('div'); t.className = 'np-toast'; t.setAttribute('role', 'status'); t.innerHTML = html; document.body.append(t);
  const tops = [...document.querySelectorAll('.np-dock,.np-bar')].map(e => e.getBoundingClientRect()).filter(r => r.height && r.top < innerHeight).map(r => r.top);
  if (tops.length) t.style.bottom = (innerHeight - Math.min(...tops) + 12) + 'px';
  clearTimeout(V2._tt); V2._tt = setTimeout(() => t.remove(), ms); return t; };
V2.places = [['home', 'Home'], ['build', 'Build'], ['team', 'My Team'], ['battle', 'Battle'], ['meta', 'Meta']];
V2.theme = () => document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
V2.setTheme = t => { document.documentElement.dataset.theme = t; V2.LS.set('np2.theme', t); V2.draw(); };
V2.logo = (small) => { const L = typeof NP_SVG === 'object' ? NP_SVG : {}, svg = V2.theme() === 'night' ? L.hdrD : L.hdrL;
  /* the footer copy gets its own mask ids, so the two logos on one page never share an id */
  return svg ? (small ? svg.replace(/nphdr(L|D)/g, 'nphdr$1f') : svg) : '<b class="u">NastyPlot</b>'; };
V2.route = () => { const h = (location.hash || '').slice(1); return V2.pages[h] ? h : (V2.pages.home ? 'home' : Object.keys(V2.pages)[0]); };
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
