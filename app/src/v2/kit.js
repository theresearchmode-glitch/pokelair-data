// ---------- The shared kit (site-wide reskin; Sim approved approach A, Nov 21, 11:58 AM: "shared kit first, then page by page") ----------
// HTML-string helpers for the kit's parts (css/kit.css, class prefix k-). Look: docs/rebuild/mocks/cohesion-nov21/ (THEME.md, HYBRID.md).
// Every text argument is escaped (V2.esc); only the arguments named ...Html are written as given. No page uses the kit yet.
// Checked by app/test/kit-page.mjs (overflow, overlaps, taps, sizes, rows of six, lone letters; 320-2560, day and night).
V2.kAttrs = o => Object.entries(o || {}).map(([k, v]) => { if (!/^[a-zA-Z_:][\w:.-]*$/.test(k) || v == null || v === false) return ''; return v === true ? ` ${k}` : ` ${k}="${V2.esc(v)}"`; }).join('');
V2.K_CHEV = '<svg class="k-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// the page header (THEME 2.2): {kicker: 'META · THE LINE-UP', h1Html: 'Who\'s <em>running</em> the show.', lead: '...'} (leadHtml to write it as given)
V2.kHead = ({kicker, h1Html, lead, leadHtml} = {}) => `<header class="k-head">${kicker ? `<p class="k-kicker">${V2.esc(kicker)}</p>` : ''}<h1 class="k-h1 u">${h1Html || ''}</h1>${leadHtml ? `<p class="k-lead">${leadHtml}</p>` : lead ? `<p class="k-lead">${V2.esc(lead)}</p>` : ''}</header>`;
// the plot sentence (THEME 2.2, HYBRID 5): parts are plain text or a boxed word {w, on, menu, attrs}. A boxed word is a real <button>
// (aria-pressed when it is one of a set; the on one is filled); {menu: true} adds the ▾ (more options than fit, one word opens them).
// At most 6 boxed words in one sentence: more must become one "[word ▾]" (HYBRID 5), so the helper refuses them.
V2.kSent = (parts, o = {}) => { const ws = (parts || []).filter(p => p && typeof p === 'object');
  if (ws.length > 6) throw new Error('V2.kSent: ' + ws.length + ' boxed words; at most 6, make the rest one [word ▾]');
  const body = (parts || []).map(p => p == null ? '' : typeof p !== 'object' ? `<span>${V2.esc(p)}</span>`
    : `<button type="button" class="k-w${p.menu ? ' k-menu' : ''}"${p.menu ? ' aria-haspopup="true"' : ` aria-pressed="${p.on ? 'true' : 'false'}"`}${V2.kAttrs(p.attrs)}><span>${V2.esc(p.w)}${p.menu ? V2.K_CHEV : ''}</span></button>`).join(' ');
  const hint = o.hint === false ? '' : `<p class="k-hint">${V2.esc(o.hint || 'Blue words are buttons.')}</p>`;
  return `<div class="k-sent u"${o.label ? ` role="group" aria-label="${V2.esc(o.label)}"` : ''}>${body}</div>${hint}`; };
// the plan line (THEME 2.3): V2.kPlan(steps) holds the page; each V2.kStep is a numbered section. o.link = {label, attrs}: the step's one quiet link (HYBRID 4)
V2.kPlan = html => `<div class="k-plan">${html}</div>`;
V2.kStep = (n, title, note, bodyHtml, o = {}) => `<section class="k-step"><span class="k-n" aria-hidden="true">${V2.esc(n)}</span><div class="k-sec"><h2 class="k-h2 u">${V2.esc(title)}</h2>${note ? `<span class="k-note">${V2.esc(note)}</span>` : ''}${o.link ? V2.kLink(o.link.label, o.link.attrs) : ''}</div>${bodyHtml || ''}</section>`;
V2.kLink = (label, attrs = {}) => `<a class="k-link"${V2.kAttrs(Object.assign({href: '#'}, attrs))}>${V2.esc(label)}&nbsp;›</a>`;
// a Pokémon's card name in two parts: the form on the small line above ('Mega', 'Paldean · Combat', 'Female', 'Yellow') and the name.
// A lone form letter stays with the word before it ('Charizard Y'), so a name line never ends with one letter (HYBRID 7).
V2.kName = n => { let d = V2.disp(n), form = '', m;
  const SEX = {F: 'Female', M: 'Male'}, part = s => s.split(/\s+/).map(w => SEX[w] || w).join(' ');
  if ((m = d.match(/^Mega (.+)$/))) { form = 'Mega'; d = m[1]; }
  if ((m = d.match(/^(Alolan|Galarian|Hisuian|Paldean) (.+)$/))) { form = (form ? form + ' · ' : '') + m[1]; d = m[2]; }
  if ((m = d.match(/^(.+?) \((.+)\)$/))) { form = (form ? form + ' · ' : '') + part(m[2]); d = m[1]; }
  return {form, name: d.replace(/ (\S)$/, ' $1')}; };
// the roster card (THEME 2.4): one Pokémon card for the whole site. o: {score, tier, form, fact, size: 'hero'|'normal'|'small', sel, mine, attrs}.
// With attrs it is a <button> (the whole card is the tap); mine (true or a word) puts the separate ink "yours" chip on it (HYBRID 3).
V2.kCard = (n, o = {}) => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null, p = V2.byName.get(n), t = p && p.t && p.t[0], k = V2.kName(n);
  const form = o.form != null ? o.form : k.form, size = o.size === 'hero' ? ' k-hero-c' : o.size === 'small' ? ' k-small' : '', tag = o.attrs ? 'button' : 'div';
  /* Sim, Nov 21 (~12:25 PM, "the numbers are on top of the pokemon sprites it looks terrible"): nothing is drawn over the art. The score sits in
     the name row on the right (Plot blue, its tier word under it); the form line ('Mega') is in the name block */
  const sc = o.score != null && o.score !== '' ? `<span class="k-sc"><b class="k-score u">${V2.esc(o.score)}</b>${o.tier ? `<small class="k-tier">${V2.esc(o.tier)}</small>` : ''}</span>` : '';
  const inner = `${o.mine ? V2.kMine(o.mine === true ? 'Yours' : o.mine) : ''}<span class="k-plate">${id ? `<img class="k-art" src="${V2.art(id, true)}" alt="" loading="lazy" decoding="async">` : ''}<span class="k-nm"><span class="k-id"><small class="k-form" data-kmax="2">${form ? V2.esc(form) : '&nbsp;'}</small><b class="k-name u" data-kmax="5">${V2.esc(k.name)}</b>${o.fact ? `<i class="k-fact">${V2.esc(o.fact)}</i>` : ''}</span>${sc}</span></span>`;
  return `<${tag}${tag === 'button' ? ' type="button"' : ''} class="k-card${size}${o.sel ? ' k-sel' : ''}"${V2.TYPES.includes(t) ? ` style="--kc:var(--tyn-${t})"` : ''}${o.sel && tag === 'button' ? ' aria-pressed="true"' : ''}${V2.kAttrs(o.attrs)}>${inner}</${tag}>`; };
// a row of cards: six across on desktop, 3 x 2 on phones (never 5 + 1); four or two go 2 across on phones
V2.kRoster = cards => `<ul class="k-roster" data-n="${Math.min(6, (cards || []).length)}">${(cards || []).map(c => `<li>${c}</li>`).join('')}</ul>`;
// the hero (THEME 2.4/2.8, HYBRID 6): the star card beside its facts and the page's one move; facts = [[value, label, key?]]
V2.kHero = (cardHtml, sideHtml) => `<div class="k-hero"><div class="k-hero-card">${cardHtml}</div><div class="k-hero-side">${sideHtml || ''}</div></div>`;
V2.kFacts = facts => `<ul class="k-facts">${(facts || []).map(([v, l, key]) => `<li><b class="u${key ? ' k-key' : ''}">${V2.esc(v)}</b><span>${V2.esc(l)}</span></li>`).join('')}</ul>`;
V2.kScrib = text => `<span class="k-scrib u">${V2.esc(text)}</span>`;
// the page's ONE big pink move (THEME 2.5): an <a> when attrs.href is given, else a <button>
V2.kGo = (label, attrs = {}) => attrs && attrs.href ? `<a class="k-go u" data-kmax="2"${V2.kAttrs(attrs)}>${V2.esc(label)}</a>` : `<button type="button" class="k-go u" data-kmax="2"${V2.kAttrs(attrs)}>${V2.esc(label)}</button>`;
// the one verdict tag (THEME 2.6): good = blue, bad = pink, live = pink, neutral = outlined
V2.kTag = (kind, text) => `<span class="k-tag u k-${['good', 'bad', 'live', 'neutral'].includes(kind) ? kind : 'neutral'}">${V2.esc(text)}</span>`;
V2.kMine = (text = 'Yours') => `<span class="k-mine">${V2.esc(text)}</span>`;
// names drop a size before they wrap (HYBRID 7): each [data-kmax] steps down its levels (kit.css) until its line fits its box; every
// name in one roster then takes the smallest size any of them needed, so a row reads even. Runs when kit parts arrive, on resize and once the fonts load.
V2.kFit = root => { const r = root || document, over = e => e.scrollWidth > e.clientWidth + 1;
  const fit = e => { const max = +e.dataset.kmax || 0; e.dataset.kf = '0'; if (e.clientWidth < 2) return 0; let f = 0; while (f < max && over(e)) e.dataset.kf = String(++f); return f; };
  const els = r.querySelectorAll ? [...r.querySelectorAll('[data-kmax]')] : []; if (r.matches && r.matches('[data-kmax]')) els.push(r);
  const lv = new Map(els.map(e => [e, fit(e)]));
  const rows = new Set(els.map(e => e.closest('.k-roster')).filter(Boolean));
  for (const row of rows) for (const sel of ['.k-name', '.k-form']) { const g = [...row.querySelectorAll(sel)], m = Math.max(0, ...g.map(e => lv.has(e) ? lv.get(e) : +e.dataset.kf || 0)); for (const e of g) if ((+e.dataset.kf || 0) < m && e.clientWidth > 1) e.dataset.kf = String(m); } };
try { new MutationObserver(ms => { const add = []; for (const m of ms) for (const nd of m.addedNodes) if (nd.nodeType === 1 && (nd.matches('[data-kmax]') || nd.querySelector('[data-kmax]'))) add.push(nd);
  if (add.length) for (const nd of add) if (nd.isConnected) V2.kFit(nd.closest('.k-roster') || nd); }).observe(document.documentElement, {childList: true, subtree: true}); } catch (e) {}
addEventListener('resize', () => { cancelAnimationFrame(V2._kfR); V2._kfR = requestAnimationFrame(() => { if (document.querySelector('[data-kmax]')) V2.kFit(); }); });
try { document.fonts.addEventListener('loadingdone', () => { if (document.querySelector('[data-kmax]')) V2.kFit(); }); } catch (e) {}
