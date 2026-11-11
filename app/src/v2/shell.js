// ---------- NastyPlot v2 shell (R3, Nov 11): header, navigation, phone bar, footer, theme, routing ----------
// Pages register themselves in V2.pages; the shell draws the frame and the current page from location.hash (#home, #team...).
// Art: one place for every Pokémon picture (V2.art), so the art can be swapped in one line (ownership rule, Nov 11).
const V2 = window.V2 = {pages: {}, ART_BASE: window.NP_ART || 'art/'};
V2.art = id => V2.ART_BASE + id + '.webp';
V2.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[m]);
V2.LS = {get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }};
// the five places, in the order players use them (Sim, Nov 11: Home is in the menu)
// type colours for chips with white text (dark enough for 4.5:1; the rebuild mock-ups' set)
V2.TYPE = {Dragon: '#5060E1', Ground: '#9A6230', Fighting: '#D9631B', Poison: '#8E3FC8', Dark: '#5A4A56', Steel: '#4F8FA6', Fire: '#DD4420', Water: '#2A78D8', Grass: '#2E9A46',
  Fairy: '#C953C2', Flying: '#5F97D8', Ghost: '#6A4BB8', Psychic: '#D93E78', Ice: '#1E9FBF', Rock: '#8F8556', Electric: '#B88A00', Normal: '#8E908C', Bug: '#7F9A12'};
V2.typeChip = t => `<span class="np-type" style="--tc:${V2.TYPE[t] || '#8E908C'}">${V2.esc(t)}</span>`;
// a Pokémon by its site name (ROSTER .n), drawn standing on its floor; opts: {sel, sub, iw}
V2.byName = new Map((typeof ROSTER === 'object' ? ROSTER : []).map(p => [p.n, p]));
V2.disp = n => { const p = V2.byName.get(n); return p && p.d ? p.d : n.replace(/^(.*)-Mega(?:-(\w+))?$/, (m, b, x) => 'Mega ' + b + (x ? ' ' + x : '')); };
V2.nameHtml = d => d.startsWith('Mega ') ? `<span class="mg">Mega</span>${V2.esc(d.slice(5))}` : `<span class="mg none" aria-hidden="true">&nbsp;</span>${V2.esc(d)}`;
V2.mon = (n, o = {}) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, m = (typeof ART_META === 'object' && ART_META[id]) || [150, 150, 165, 0];
  return `<div class="np-mon${o.sel ? ' sel' : ''}" style="--cp:${m[0]},${m[1]},${m[2]};--fo:${m[3]}${o.iw ? ';--iw:' + o.iw + 'px' : ''}"><i class="pool" aria-hidden="true"></i>${id ? `<img src="${V2.art(id)}" alt="" loading="lazy">` : ''}<b>${V2.nameHtml(V2.disp(n))}</b>${o.sub ? `<small>${V2.esc(o.sub)}</small>` : ''}</div>`; };
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
  <div class="tools"><button type="button" class="np-search" data-v2search aria-label="Search Pokémon, tools and teams"><span aria-hidden="true">⌕</span><span class="lbl">Search</span><kbd>/</kbd></button>
  <button type="button" class="np-theme" data-v2theme aria-label="Switch to ${V2.theme() === 'night' ? 'day' : 'night'} mode">${V2.theme() === 'night' ? 'Day' : 'Night'}</button></div></header>
<main class="np-main" id="main">${P ? P.draw() : ''}</main>
<footer class="np-foot">${V2.logo(true)}<span>NastyPlot is an unofficial, fan-made tool.</span><nav aria-label="About"><a href="#method">How We Calculate</a><a href="#about">About</a><a href="#feedback">Send Feedback</a></nav></footer>
<nav class="np-bar" aria-label="Main">${nav}</nav>`;
  if (P && P.after) try { P.after(); } catch (e) { console.error(e); } };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-v2theme]'); if (t) V2.setTheme(V2.theme() === 'night' ? 'day' : 'night'); });
addEventListener('hashchange', () => { V2.draw(); scrollTo(0, 0); });
