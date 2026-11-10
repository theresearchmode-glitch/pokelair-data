// ---------- Champions arena (Sim picked direction C, Nov 5): Home, My team and the info sheet ----------
// Draws the arena markup for Home, the top of My team and the info sheet's hero (theme/arena.css, theme/arena-p1.css,
// theme/ARENA.md). Every number, name and control comes from the app's own data and functions; nothing new is computed except
// colours. Controls keep the attributes the app's handlers listen for (data-lt, data-view, data-chset, data-chgrade,
// data-chedit, data-evload, data-evvs, data-sdcopy), and the moved nodes (#rzSet, #chGwhy, #chActs) keep their handlers.
const AR = {};
/* arena type palette: the app's type colours, except two. Dark (#5F4536) reads brown and Normal (#ABA88A) reads khaki on a field
   (Sim: no brown, olive or khaki fills). Dark becomes a slate violet and Normal a cool lilac-grey. The app's own TC is changed
   too, before anything renders, so every older page part (Home's rating rows, the Type chart, tables, the share card) draws
   the same two colours as the arena components. */
AR.TC_FIX = {Dark: '#5E5068', Normal: '#A6A2AE'};
try { Object.assign(TC, AR.TC_FIX); } catch (e) {}
AR.TC = Object.assign({}, TC, AR.TC_FIX);
/* dark-mode field colours (true black): every type at the same vivid chroma, cool and red hues at a mid lightness, the
   orange-to-yellow hues (Fire, Electric, Ground, Rock, Normal...) lighter, because a dark orange or yellow reads brown (Sim:
   no brown fills). --on is the text colour that reads on the first type's dark field (white or ink, whichever is 4.5:1+). */
AR._d = new Map(); AR._k = new Map();
AR.dark = t => { if (AR._d.has(t)) return AR._d.get(t); let v = TC.Normal;
  try { const [C, H] = MG.ok(AR.TC[t] || TC.Normal), h = (H + 360) % 360, L = C < .03 ? .7 : h >= 70 && h < 130 ? .76 : h >= 38 && h < 70 ? .64 : .5, c = Math.max(Math.min(C, .17), Math.min(C, .05));
    v = MG.hex(L, c, H); AR._k.set(t, {L, c, h}); } catch (e) {}
  AR._d.set(t, v); return v; };
/* the middle stop of a dark dual-type field. It always lies between the two types' hues, the short way round the hue circle,
   so a field never shows a colour that belongs to neither type (Indeedee was crimson, blue, then khaki). Three guards keep it
   off brown, olive and khaki:
   - a near-neutral type (Normal, C < .03) has no hue of its own: the middle takes the other type's hue (pink to grey stays
     pink, then greys out), and a warm partner simply holds its own colour to the middle (a dimmed orange or gold is tan);
   - a middle that lands on a warm hue (orange to yellow-green, 30 to 135) is lifted to L .78 and kept vivid (C .13 or more),
     a light gold, never a brown or a khaki;
   - two hues exactly opposite (180 apart) go round through the cooler side. */
AR.warm = h => { h = (h + 360) % 360; return h >= 30 && h < 135; };
AR.mid = (a, b) => { if (a === b) return AR.dark(a); AR.dark(a); AR.dark(b); const A = AR._k.get(a), B = AR._k.get(b); if (!A || !B) return AR.dark(a);
  try { const nA = A.c < .03, nB = B.c < .03;
    if (nA && nB) return MG.hex((A.L + B.L) / 2, (A.c + B.c) / 2, A.h);
    if (nA || nB) { const V = nA ? B : A, N = nA ? A : B; if (AR.warm(V.h)) return AR.dark(nA ? b : a);
      return MG.hex((V.L * 2 + N.L) / 3, V.c, V.h); }
    let d = ((B.h - A.h + 540) % 360) - 180; if (Math.abs(Math.abs(d) - 180) < 1e-6) { const m1 = A.h + 90, m2 = A.h - 90; d = AR.warm(m1) && !AR.warm(m2) ? -180 : 180; }
    const h = (A.h + d / 2 + 360) % 360; let L = (A.L + B.L) / 2, c = Math.max(.1, (A.c + B.c) / 2);
    if (AR.warm(h)) { L = Math.max(L, .78); c = Math.max(c, .13); }
    return MG.hex(L, c, h); } catch (e) { return AR.dark(a); } };
AR.tv = p => { const t = (p && p.t) || ['Normal'], a = t[0], b = t[1] || t[0], da = AR.dark(a), db = AR.dark(b);
  return `--a:${AR.TC[a] || TC.Normal};--b:${AR.TC[b] || TC.Normal};--da:${da};--dm:${AR.mid(a, b)};--db:${db};--on:${AR.on(da)}`; };
/* the text colour on the first type's dark field: white or ink, whichever has the better contrast. Text on a hero field sits
   on the first type only (the hero fields hold --da across their text half, then blend to --db behind the sprite) */
AR.cr = (x, y) => (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
AR.on = da => { const l = AR.lum(da), w = AR.cr(1, l), k = AR.cr(AR.lum('#16141A'), l); return w >= 4.5 || w >= k ? '#fff' : '#16141A'; };
/* text on a filled type tag: white where it reaches 4.5:1, ink otherwise */
AR.lum = h => { const c = [1, 3, 5].map(i => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
AR.onType = t => { const L = AR.lum(AR.TC[t] || TC.Normal); return 1.05 / (L + .05) >= 4.5 ? '#fff' : '#16141A'; };
/* a list sprite on a small slanted type field (.ar-mini in arena.css) */
AR.mini = (p, cls) => `<span class="ar-mini${AR.isMega(p) ? ' is-mega' : ''}${cls ? ' ' + cls : ''}" style="${AR.tv(p)}" aria-hidden="true">${sprite(p) || ''}</span>`;
AR.tag = t => `<span class="ar-ty" style="--t:${AR.TC[t] || TC.Normal};color:${AR.onType(t)}"><span>${esc(t)}</span></span>`;
/* move name -> type (the moves table: [name, type index, ...]) */
AR.mt = null;
AR.moveType = n => { if (!AR.mt) { AR.mt = new Map(); try { for (const r of MOVES) AR.mt.set(r[0], TYPES[r[1]]); } catch (e) {} } return AR.mt.get(n) || 'Normal'; };
AR.isMega = p => !!(p && (p.m || /-Mega/.test(p.n || '')));
AR.spr = (p, cls) => sprite(p, 'ar-spr' + (cls ? ' ' + cls : '')) || '';
/* one art tile; o: {tag, size, below, name, sub, attrs, sel} */
AR.art = (p, o = {}) => { const tag = o.tag || 'button', cls = `ar-art ar-${o.size || 'm'}${o.below ? ' ar-below' : ''}${AR.isMega(p) ? ' is-mega' : ''}${o.sel ? ' is-sel' : ''}`;
  return `<${tag} ${tag === 'button' ? 'type="button" ' : ''}class="${cls}" style="${AR.tv(p)}" ${o.attrs || ''}><span class="ar-f ar-field" aria-hidden="true"></span>${AR.spr(p)}${o.sel ? '<span class="ar-cursor" aria-hidden="true"></span>' : ''}`
    + `<span class="ar-nm">${AR.nm(o.name || p.d)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></${tag}>`; };
/* an open slot: with o.attrs a button (a faint section field, a "+", "Add a Pokémon" under it) that opens what attrs say;
   without, a quiet placeholder */
/* Darkrai (Sim, Nov 9): the picture on empty screens, set by app/build.mjs as window.NP_MASCOT; null when it isn't set */
AR.mascot = () => (typeof window !== 'undefined' && window.NP_MASCOT) ? `<img class="spr ar-darkrai" src="${window.NP_MASCOT}" alt="" width="464" height="473" decoding="async">` : null;
AR.emptyArt = (size, o = {}) => o.attrs ? `<button type="button" class="ar-art ar-${size || 'm'} ar-below is-empty" ${/aria-label=/.test(o.attrs) ? '' : 'aria-label="Add a Pokémon" '}${o.attrs}><span class="ar-f" aria-hidden="true"></span><span class="ar-plus" aria-hidden="true">+</span><span class="ar-nm">${o.label || '<span class="ar-addl">Add</span><span class="ar-addr"> a Pokémon</span>'}</span></button>`
  : `<div class="ar-art ar-${size || 'm'} ar-below is-empty" aria-hidden="true"><span class="ar-f"></span><span class="ar-nm">&nbsp;</span></div>`;
AR.ICON = {
  grade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  build: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>',
  battle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  /* Plan a match (Sim, Nov 6: the plain X read as a clear button): a clipboard with a checklist, same line style */
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 3h6v3H9z"/><path d="m8.5 11.5 1.5 1.5 2.5-2.5M14.5 12h1.5M8.5 17h7"/></svg>',
  go: '<span class="ar-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></span>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>'};
/* the page's one speed-line burst, white, from behind the hero Pokémon (drawn on the sprite's half only) */
AR.BURST = '<svg class="ar-lines" viewBox="0 0 400 350" preserveAspectRatio="none" aria-hidden="true"><g stroke="#fff" stroke-width="3" stroke-linecap="round">'
  + ['400 20', '400 70', '400 120', '400 180', '400 240', '400 300', '330 0', '370 0', '260 0', '220 0', '190 30', '350 350', '280 350', '220 350', '190 300'].map(e => `<path d="M300 150 L${e}"/>`).join('') + '</g></svg>';
/* "A + B" from a list of members */
/* a display name that never strands its last part: "Mega Charizard Y", "Indeedee (F)" */
/* AR.nm is the one display-name helper: always "Mega X", never the old short "M-X" (a roster id such as "Charizard-Mega-Y" is
   turned into "Mega Charizard Y" too), and the last part never stands alone ("Mega Charizard&nbsp;Y", "Indeedee&nbsp;(F)").
   AR.mega(n) is the same without the HTML escaping. */
AR.mega = n => { n = String(n == null ? '' : n).trim(); const id = /^([A-Za-z.' ]+?)-Mega(?:-([XYZ]))?$/.exec(n); if (id) { const p = byName && byName.get && byName.get(n); return p && p.d ? p.d : `Mega ${id[1]}${id[2] ? ' ' + id[2] : ''}`; }
  return n.replace(/^M-(?=\S)/, 'Mega '); };
AR.nm = n => escName(AR.mega(n)).replace(/ \(([FMfm])\)/g, '\u00a0($1)');
/* This week in the ratings (Sim, Nov 5): the week's biggest real rating moves from the daily snapshots (track.mjs mv), each a
   tap into its info sheet; nothing shows until the data has them */
AR.week = () => { const M = META.track && META.track.mv; if (!M || !M.list || !M.list.length) return '';
  const it = M.list.map(m => { const p = byName.get(m.n); if (!p) return ''; const up = m.d > 0;
    return `<button type="button" class="ar-mv" data-lt="${esc(m.n)}" aria-label="${esc(p.d)}, rating ${m.r}, ${up ? 'up' : 'down'} ${Math.abs(m.d)} this week"><b>${AR.nm(p.d)}</b><span class="ar-mvd ${up ? 'up' : 'dn'}" aria-hidden="true">${up ? '▲' : '▼'} ${Math.abs(m.d)}</span></button>`; }).join('');
  return it ? `<div class="ar-week"><span class="ar-weekk">This week in the ratings</span><div class="ar-mvs">${it}</div></div>` : ''; };
/* Quick team switch (Sim, Nov 5): a "Switch team" fold under the My team title lists your other saved teams; each opens with
   the same data-load action as Saved teams' Open (34-events.js), Undo included */
AR.switcher = () => { const ts = (S.teams || []).filter(t => t && t.id !== S.loadedId && Array.isArray(t.slots) && t.slots.some(x => x && x.n)).slice(0, 8);
  if (!ts.length) return '';
  const row = t => { const ns = t.slots.filter(x => x && x.n).map(x => byName.get(x.n)).filter(Boolean);
    return `<button type="button" class="ar-tsw" data-load="${esc(t.id)}"><span class="ar-tswm" aria-hidden="true">${ns.slice(0, 6).map(p => sprite(p, 'tiny') || '').join('')}</span><b>${esc(t.name || 'Saved team')}</b></button>`; };
  return `<details class="ar-tswitch"><summary><span class="ar-tswt">Switch team</span> <span class="ar-tswn">${ts.length} saved</span></summary><div class="ar-tswl">${ts.map(row).join('')}</div></details>`; };
/* Jump links (Sim, Nov 5): My team is long on phones, so a row under the head goes straight to each numbered part */
/* the jump bar is a sliding picker (Sim, Nov 10): the part you last jumped to keeps the circle, also after the page redraws */
AR.jumpOn = null;
AR.jumps = () => `<nav class="ar-jumps" aria-label="Jump to">${[['chP1', 'Suggestions'], ['chP2', 'Matchups'], ['chP3', 'How it plays'], ['chSets', 'Sets']].map(([id, t]) => `<button type="button" class="ar-jump${AR.jumpOn === id ? ' on' : ''}" data-arjump="${id}"${AR.jumpOn === id ? ' aria-current="true"' : ''}>${t}</button>`).join('')}</nav>`;
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-arjump]'); if (!b) return; const t = $(b.dataset.arjump); if (!t) return;
  if (b.classList.contains('ar-jump')) { AR.jumpOn = b.dataset.arjump; b.parentElement.querySelectorAll('.ar-jump').forEach(x => { const on = x === b; x.classList.toggle('on', on); if (on) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); }); }
  if (t.matches('details:not([open])')) t.open = true;
  t.querySelectorAll('details.ar-sheetfold:not([open])').forEach(d => { d.open = true; });
  t.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  const h = t.querySelector('h2,h3,summary,button'); if (h && h.focus) setTimeout(() => h.focus({preventScroll: true}), 400); });
/* the sample team (Sim, Nov 5): first-time visitors see NastyPlot's sample six, so it says so, with one way to start their own */
AR.isSample = t => /\(sample\)\s*$/i.test(String(t || ''));
AR.sampleNote = () => `<div class="ar-sample"><p>This is a sample team, here to show how NastyPlot works.</p><div class="ar-sample-acts"><button type="button" class="ar-btn" data-view="build">Build your own</button><button type="button" class="ar-btn" data-arimport>Import a team</button></div></div>`;
AR.pair = L => L.map(m => AR.nm(m.d)).join(' + ');
AR.plan = (lead, back, bench, vs) => lead.length ? `<p class="ar-gameplan">Game plan${/^vs /.test(vs) ? ' ' + vs : ', ' + vs}: lead <b>${AR.pair(lead)}</b>${back.length ? `, back ${AR.pair(back)}` : ''}${bench.length ? `, bench ${AR.pair(bench)}` : ''}.</p>` : '';
/* the latest event winner with a full, known six (the same pick as Home's old champion card) */
AR.champ = () => { const E = META.events; if (!E || !Array.isArray(E.events)) return null;
  for (const e of E.events) { const t = (e.top || []).find(x => x && x.place === 1 && x.mons && x.mons.length === 6 && x.mons.every(m => byName.get(m.n))); if (t) return {ev: e, t, n: E.events.length, six: t.mons.map(m => ({p: byName.get(m.n), it: m.i || '', ab: m.a || ''}))}; }
  return null; };

/* ======================= Home ======================= */
/* the Top of the meta rows: one naming everywhere ("Mega Charizard Y", not "M-Charizard Y"), the Mega contour on the small
   sprite, and the sprite loads with the page (a lazy sprite far down Home could show an empty field) */
{ const hm = homeMini; homeMini = function (p, r, extra) { let h = hm(p, r, extra); if (!p) return h;
  h = h.replace(/<span class="hmn">[^<]*<\/span>/, `<span class="hmn">${escName(p.d)}</span>`).replace(/ loading="lazy" decoding="async"/, '');
  if (AR.isMega(p)) h = h.replace('class="spr hmspr"', `class="spr hmspr ar-mega-s" style="${AR.tv(p)}"`);
  return h; }; }
AR.home = () => { const out = $('homeOut'); if (!out || out.querySelector(':scope > .ar-home')) return;
  const ms = members(), six = CH.metaSix(), C = AR.champ();
  /* hero: the most-used Pokémon; the next two as runner strips */
  const top = six[0], ru = six.slice(1, 3), pct = p => MG.pct(p);
  const hero = top ? `<button type="button" class="ar-hero" style="${AR.tv(top)}" data-lt="${esc(top.n)}" aria-label="${esc(top.d)}, most used, ${pct(top)}% of teams: open its info">
      <span class="ar-hero-bg ar-field" aria-hidden="true">${AR.BURST}</span>${AR.spr(top, 'ar-hero-mon')}
      <span class="ar-hero-rank">Most used, <b>#1</b></span>
      <span class="ar-hero-copy"><span class="ar-num ar-mp ar-hero-big">${pct(top)}<small>%</small></span><span class="ar-hero-of">of teams</span><span class="ar-plate" style="${AR.tv(top)}"><span>bring ${escName(top.d)}</span></span></span></button>` : '';
  const runner = (p, i) => `<button type="button" class="ar-runner" style="${AR.tv(p)}" data-lt="${esc(p.n)}" aria-label="${esc(p.d)}, most used #${i + 2}, ${pct(p)}% of teams: open its info"><span class="ar-runner-f ar-field" aria-hidden="true"></span>`
    + `<span class="ar-runner-in"><span class="ar-runner-nm">${escName(p.d)}</span><span class="ar-num">${pct(p)}%</span></span>${AR.spr(p, 'ar-runner-mon')}</button>`;
  const has = ms.length > 0, b = (v, cls, ic, l, edge) => `<button type="button" class="ar-btn${cls}" data-view="${v}"${edge ? ` style="--edge:${edge}"` : ''}>${ic}<span>${l}</span>${cls ? AR.ICON.go : ''}</button>`;
  const tools = `<nav class="ar-tools" aria-label="Start here">${has ? b('report', ' ar-primary', AR.ICON.grade, 'Score my team') + b('auto', '', AR.ICON.build, 'Build a team', 'var(--ar-gold)')
    : b('auto', ' ar-primary', AR.ICON.build, 'Build me a team') + b('report', '', AR.ICON.grade, 'Score my team', 'var(--ar-blue)')}${b('matchup', '', AR.ICON.plan, 'Plan a match', 'var(--ar-orange)')}</nav>`
    + `<p class="ar-imp">Already have a team? <button type="button" class="ar-link" data-arimport>Import from Showdown</button></p>`;
  /* the Champion's six */
  let them = '', FC = null, sameSix = false;
  if (C) { const {ev, t} = C, key = esc(ev.id) + '#' + ev.top.indexOf(t); sameSix = ms.length === 6 && t.mons.every(m => ms.some(x => x.p.n === m.n));
    try { FC = ms.length >= 4 ? CH.fourVs(ms, C.six.map(x => x.p.n)) : null; } catch (e) { FC = null; }
    them = `<section class="ar-side ar-pink" aria-labelledby="arChamp"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2" id="arChamp">The Champion's six</h2></div>
      <div class="ar-winner"><p class="ar-meta">Latest winner</p><p class="ar-ev">${esc(evName(ev.name))}</p><p class="ar-meta"><b>${esc(teamWho(t))}</b>, ${esc(evDate(ev.date))}${ev.players ? `, ${ev.players} players` : ''}</p>${sameSix ? '<p class="ar-meta"><b>Same six as yours</b></p>' : ''}</div>
      <div class="ar-six">${C.six.map(x => AR.art(x.p, {size: 'm', below: 1, sub: x.it, attrs: `data-lt="${esc(x.p.n)}" aria-label="${esc(x.p.d)}${x.it ? ', ' + esc(x.it) : ''}: open its info"`})).join('')}</div>
      <div class="ar-acts"><button type="button" class="ar-btn" data-evload="${key}">Load this team</button>${sdBtn('ev:' + ev.id + '#' + ev.top.indexOf(t), 'ar-btn')}<button type="button" class="ar-link" data-view="events">All ${C.n} events ›</button></div></section>`; }
  /* your six: ordered lead, back, bench for the plan shown under it (vs the Champion's six, or the meta's six without one) */
  let F = FC, vs = C ? `vs the Champion's six` : '';
  if (!F && ms.length >= 4) { try { F = CH.four(ms); vs = "vs the meta's top six"; } catch (e) { F = null; } }
  const UL = AR.userLeads(ms); if (UL && F) { F = {lead: UL.map(m => m.p.n), back: F.lead.concat(F.back).filter(n => !UL.some(m => m.p.n === n)).slice(0, 2)}; vs = vs ? vs + ', your leads' : 'your leads'; }
  const byN = n => ms.find(m => m.p.n === n), lead = F ? F.lead.map(byN).filter(Boolean) : [], back = F ? F.back.map(byN).filter(Boolean).filter(m => !lead.includes(m)) : [];
  const bench = ms.filter(m => !lead.includes(m) && !back.includes(m)), ord = [...lead, ...back, ...bench].slice(0, 6);
  let title = ms.length ? teamTitleFor(ms) : 'Your six goes here', wx = ''; try { const k = wxKeyOf(ms); if (k) wx = ` ${esc(wxName(k))}`; } catch (e) {}
  const you = `<section class="ar-side ar-blue" aria-labelledby="arYours"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2${title.length > 16 ? ' ar-long' : ''}" id="arYours"${ms.length ? ' data-notc' : ''/* a team's name keeps its own casing (Title Case never touches team names) */}>${esc(title)}</h2></div>
    <div class="ar-winner">${ms.length && AR.isSample(title) ? AR.sampleNote() : ''}${ms.length ? `<p class="ar-meta">Your team: <b>${ms.length}/6</b>${wx}</p>` : '<p class="ar-meta">Add six Pokémon and NastyPlot scouts the top threats for you.</p>'}</div>
    <div class="ar-six">${ms.length ? ord.map(m => AR.art(m.p, {size: 'm', below: 1, name: m.d, attrs: `data-lt="${esc(m.p.n)}" aria-label="${esc(m.d)}: open its info"`})).join('') : Array.from({length: 6}, (_, i) => AR.emptyArt('m', {attrs: `data-view="build" aria-label="Add a Pokémon to slot ${i + 1}"`})).join('')}</div>
    ${AR.plan(lead, back, bench, vs)}
    <div class="ar-acts">${ms.length ? `<button type="button" class="ar-btn" data-view="report">Open my team</button>${C && FC && !sameSix ? `<button type="button" class="ar-link" data-evvs="${esc(C.ev.id)}#${C.ev.top.indexOf(C.t)}">Prep vs the Champion ›</button>` : ''}`
      : '<button type="button" class="ar-btn" data-view="build">Add your six</button>'}</div></section>`;
  const html = `<div class="ar-home"><div class="ar-deck"><div class="ar-deck-main"><div class="ar-h1 ar-hh ar-tag" role="heading" aria-level="2">Sharply raise <br><span class="ar-tag2">your win rate.</span></div>${hero}</div>
    <div class="ar-deck-side"><div class="ar-runners">${ru.map(runner).join('')}</div><p class="ar-caption">${esc(MG.srcLine())}</p>${AR.week()}${tools}</div></div>
    <div class="ar-versus">${them}${them ? '<div class="ar-vs" aria-hidden="true"><span class="ar-num ar-mp">vs</span></div>' : ''}${you}</div></div>`;
  out.insertAdjacentHTML('afterbegin', html); out.classList.add('ar-on');
  /* All 11 tools (Sim, Nov 5: "a very big part of our site") moves up, right under the hero and the three main buttons */
  const home = out.querySelector('.ar-home'), tl = out.querySelector(':scope > .chhtools'); if (tl) home.querySelector('.ar-deck').after(tl);
  /* the weekly teaser lives in the old phone column (hidden now): it moves under the two sixes */
  const wk = out.querySelector('.chmh .wkhome'); if (wk) home.append(wk); };
CH.wrap('renderHome', () => AR.home());

/* ======================= My team ======================= */
/* the lineup the stage and the set card use: the planner's four vs the meta's six (CH.four), the rest on the bench */
/* your lead pick (Sim, Nov 5): S.leads holds two names you chose with "Set as lead"; it wins over NastyPlot's pick while both
   are on the team. "Use NastyPlot's pick" clears it. */
AR.userLeads = ms => { const U = (S.leads || []).map(n => ms.find(m => m.p.n === n)).filter(Boolean); return U.length === 2 && U[0] !== U[1] ? U : null; };
AR.lineup = ms => { const L = MG.lineup(ms), U = AR.userLeads(ms);
  if (U) { const rest = [...L.lead, ...L.back, ...L.home].filter(m => !U.includes(m)); return {lead: U, back: rest.slice(0, 2), bench: rest.slice(2), by: 'you'}; }
  return {lead: L.lead, back: L.back, bench: L.home, by: L.by}; };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-arlead]'); if (!b) return;
  const ms = members(), n = b.dataset.arlead;
  if (n === '') S.leads = null;
  else { const L = AR.lineup(ms), base = L.lead.map(m => m.p.n); if (base.includes(n)) return; S.leads = [n, base[0]]; }
  persist(); safe('my team', chTeamRender); safe('home', () => typeof render === 'function' && render());
  const pk = n && ms.find(m => m.p.n === n); toast(pk ? `${pk.d} now leads` : "Back to NastyPlot's lead pick"); });
AR.roleOf = (m, L) => { const has = g => g.some(x => x.i === m.i), other = g => g.filter(x => x.i !== m.i).map(x => escName(x.d)).join(' + ');
  if (has(L.lead)) return `Leads with ${other(L.lead) || 'its partner'}`; if (has(L.back)) return `In the back with ${other(L.back) || 'its partner'}`; return 'On the bench'; };
AR.VS_META = "vs the meta's top six";
AR.cell = (v, u, extra) => `<div class="ar-stat"><span class="ar-num">${v}</span><span class="ar-unit">${u}${extra || ''}</span></div>`;
AR.team = () => { const head = $('chTeam'); if (!head) return; const th = head.querySelector(':scope > .chthead'); if (!th) return;
  /* the all-sets fold lives in the old team section between draws: put it back in its part first, or the redraw throws it away */
  { const keep = $('chSets'), p4b = document.querySelector('#chP4 .chpartb'); if (keep && p4b && !p4b.contains(keep)) p4b.append(keep); }
  const old = head.querySelector(':scope > .ar-team'); if (old) old.remove();
  const ms = members(), v = ui.vsum || {}, RD = ms.length ? prepOf(ms) : null; let G = null; try { G = RD ? CH.gradeOf(RD, v.CK, ms) : null; } catch (e) {}
  const hd = CH.hand(RD), c = CH.lvCount(RD), tp = k => typeof tip === 'function' ? tip(k) : '';
  let wx = ''; try { const k = wxKeyOf(ms); if (k) wx = `, ${esc(wxName(k))}`; } catch (e) {}
  /* the score: the big number is always what the letter comes from. With 30+ real games the letter comes from the record's win
     rate (one decimal, so 59.6% never reads as an A's "60%"); otherwise it is the grade out of 100 (Sim: "93, Grade A"). */
  let score = '';
  if (G) { const why = `<button type="button" class="ar-link ar-why" data-chgrade="1" aria-expanded="${ui.gwhy ? 'true' : 'false'}" aria-controls="chGwhy">${G.v === 2 ? 'Why this score?' : `Why ${esc(G.letter)}?`}</button>`;
    /* the grade is the hero (Sim, Nov 5): the big letter, then what it's based on in words, so a win rate is never read as a score */
    /* grade v2 (Nov 7, Sim): the letter, the expected win rate against today's field, and the rank among real teams with what
       it rests on (its own real games, or our estimate) */
    /* Strength Score (Nov 9, Preview): a ring filled to the score in its band colour, the number inside, the band word under it,
       what it means in real games, and the rank as small print. The old block stays for the old check (model not loaded). */
    if (G.v === 2) { const sc = Math.round(G.s), col = CH.gcol(G.letter), C = 2 * Math.PI * 44, fill = Math.max(0, Math.min(100, G.s)) / 100 * C;
      const ring = `<svg class="ar-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" class="ar-ringbg"/><circle cx="50" cy="50" r="44" class="ar-ringfg" style="stroke:${col}" stroke-dasharray="${fill.toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/></svg>`;
      score = `<div class="ar-score ar-gscore ar-ss" role="group" aria-label="Strength Score ${sc} out of 100${G.partial ? ' so far' : ''}: ${esc(CH.wordOfL(G.letter))}"><span class="ar-glabel">Strength Score${G.partial ? ' so far' : ''}</span><div class="ar-ssrow"><div class="ar-ringw">${ring}<span class="ar-num ar-mp ar-ssn">${sc}</span></div><div class="ar-ssw"><b class="ar-ssword" style="color:${col}">${esc(CH.wordOfL(G.letter))}</b><span class="ar-ssline">Teams scoring like this win about ${Math.round(G.e)}% against today\u2019s tournament teams</span><small class="ar-gsub">${CH.pctTxt(G)}</small></div></div>${G.st && G.st.su && G.st.su.w === 'Low' ? '<small class="ar-gsub">Few real games back this mix yet, so it\'s a best guess</small>' : ''}${why}</div>`; }
    else score = `<div class="ar-score ar-gscore"><span class="ar-glabel">Grade${G.partial ? ' so far' : ''}</span><span class="ar-num ar-mp ar-gletter">${esc(G.letter)}</span><span class="ar-basis ar-gnum">${G.v === 2 ? `<b>${CH.rankShort(CH.rkOf(G))}</b><small class="ar-gsub">of tournament teams</small>` : `<b>${G.s}</b> / 100`}</span>${G.st && G.st.su && G.st.su.w === 'Low' ? '<small class="ar-gsub">Few real games back this mix yet, so it\'s a best guess</small>' : ''}${why}</div>`; }
  /* the stats under the title: the record (when the grade comes from it), our check, legality */
  let stats = '';
  if (RD) {
    /* plain words (Nov 9): one number here; the counts per level are in the Matchups section below. A short line names what's left. */
    let cells = [`<div class="ar-stat"><span class="ar-num ar-mp">${hd ? hd.x + '/' + hd.n : RD.score + '%'}</span><span class="ar-unit">ready for top threats</span></div>`];
    const left = (c[0] || 0) + (c[1] || 0); let muLine = left ? `${c[0] ? `${c[0]} with no answer${c[1] ? ', ' : ''}` : ''}${c[1] ? `${c[1]} shaky` : ''}` : 'Every top threat has an answer';
    /* Nov 10 (Sim: "show me all 3"): which verdict leads the headline. 1 = real games first, damage calc underneath;
       2 = the calc count named as such, with the real-games line beside it; 3 = as it was. Preview only until Sim picks. */
    let muBar = '';
    const MH = typeof window !== 'undefined' && window.NP_MUHEAD || 1; /* Sim picked option 1 (Nov 10) */
    if (MH !== 3 && hd) { const rv = RD.rows.map(r => ({r, R: CH.realVs(r.t.n, ms)})).filter(x => x.R), cnt = k => rv.filter(x => x.R.c === k).length, bad = rv.filter(x => x.R.c === 'bad').sort((p, q) => q.r.t.w - p.r.t.w).map(x => x.r.t.d);
      if (MH === 1 && rv.length) { cells = [`<div class="ar-stat ar-mu3"><span class="ar-num ar-mp">${cnt('ok')}<small>Favoured</small></span><span class="ar-num ar-mp">${cnt('mid')}<small>Even</small></span><span class="ar-num ar-mp">${cnt('bad')}<small>Unfavoured</small></span><span class="ar-unit">vs the top ${rv.length} threats in real games</span></div>`];
        muLine = `Damage calc: covers ${hd.x} of ${hd.n}`; muBar = `<span class="ar-bar ar-mubar3" aria-hidden="true"><i style="flex:${cnt('ok')}"></i><i style="flex:${cnt('mid')}"></i><i style="flex:${cnt('bad')}"></i></span>`; }
      if (MH === 2) { cells = [`<div class="ar-stat ar-mu2"><span class="ar-num ar-mp">${hd.x}/${hd.n}</span><span class="ar-unit">covered in damage calcs</span></div>`];
        muLine = rv.length ? (bad.length ? `Real games: Unfavoured vs ${bad.length} (${bad.slice(0, 3).map(esc).join(', ')}${bad.length > 3 ? ', …' : ''})` : 'Real games: no Unfavoured matchups') : muLine; } }
    const rec = '';
    /* matchups get their own verdict (Sim, Nov 7: "98 and 6 shaky?"): the grade says how strong the team is, this says what can
       still beat it, named, worst first, with a jump to Threats */
    /* the Fix first tiles were removed (Sim, Nov 8: "i really dont like the fix first section"); Threats has the full list */
    /* what's behind the grade (Nov 7, Sim): the parts that add up to it first, then readiness against the top threats */
    /* one place to learn about the grade (Sim, Nov 7): "Why A?" under the letter. The breakdown that used to sit here lives there */
    const chk = `<div class="ar-st ar-mu" role="group" aria-label="Matchups"><h3 class="ar-sth ar-muh">Matchups</h3>
      <div class="ar-trio">${cells.join('')}<span class="ar-muline">${muLine}</span></div>
      ${muBar || `<span class="ar-bar" aria-hidden="true"><i style="--v:${Math.max(0, Math.min(100, RD.score))}%;--c:var(--ar-green)"></i></span>`}</div>`;
    const ck = v.CK, legal = v.legal === false ? 'Not legal yet' : 'Legal';
    const leg = `<div class="ar-legal${v.legal === false ? ' is-bad' : ''}" title="Based on our reading of the ${esc(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C')} rules. Check the official rules before an event."><b>${legal}</b>${ck ? `<span>Team checks ${ck.pass}/${ck.n}</span><span class="ar-pips" aria-hidden="true">${Array.from({length: ck.n}, (_, i) => `<i${i < ck.pass ? '' : ' class="off"'}></i>`).join('')}</span>` : ''}</div>`;
    stats = `<div class="ar-tstats ar-c${Math.max(3, cells.length)}">${rec}${chk}${leg}</div>`; }
  else stats = '';
  /* the stage: all six as equal art tiles (no roles on the art), the game plan line under them */
  let stage = '';
  if (ms.length) { const L = AR.lineup(ms), ord = [...L.lead, ...L.back, ...L.bench], sel = ui.rzSet;
    const used = new Set(ms.map(m => m.i)), open = [0, 1, 2, 3, 4, 5].filter(i => !used.has(i)).slice(0, 6 - ord.length);
    /* each one has a small X to take it off the team in one tap (Sim, Nov 7); it uses the same remove as the editor, with Undo */
    const tiles = ord.map(m => `<div class="ar-slot${sel === m.i ? ' is-sel' : ''}">${AR.art(m.p, {size: 'l', name: m.d, sel: sel === m.i, attrs: `data-chset="${m.i}" aria-pressed="${sel === m.i}" aria-controls="rzSet" aria-label="${esc(m.d)}: show its set"`})}<button type="button" class="ar-lockx${S.slots[m.i] && S.slots[m.i].lock ? ' on' : ''}" data-lock="${m.i}" aria-pressed="${!!(S.slots[m.i] && S.slots[m.i].lock)}" aria-label="${S.slots[m.i] && S.slots[m.i].lock ? 'Unlock' : 'Lock'} ${esc(m.d)}: suggestions never swap out a locked Pokémon" title="${S.slots[m.i] && S.slots[m.i].lock ? 'Locked: suggestions keep it' : 'Lock it so suggestions keep it'}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="${S.slots[m.i] && S.slots[m.i].lock ? 'M9 11V8a3 3 0 0 1 6 0v3' : 'M9 11V8a3 3 0 0 1 5.8-1'}"/></svg></button><button type="button" class="ar-rmx" data-chrm="${m.i}" aria-label="Remove ${esc(m.d)} from your team"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg></button></div>`).join('')
      + open.map(i => AR.emptyArt('l', {attrs: `data-chedit="${i}" aria-label="Add a Pokémon to slot ${i + 1}"`})).join('');
    const plan = L.lead.length >= 2 ? AR.plan(L.lead, L.back, L.bench, L.by === 'meta' ? AR.VS_META : L.by === 'you' ? 'your pick' : 'in team order')
      + (L.by === 'you' ? `<button type="button" class="ar-link ar-leadreset" data-arlead="">Use NastyPlot's pick</button>` : '') : '';
    stage = `<section class="ar-stage" aria-labelledby="arSix"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2" id="arSix">Your six</h2></div>
      <div class="ar-six ar-two" role="group" aria-label="Your six: tap one to see its set">${tiles}</div><p class="ar-taphint">Tap a Pokémon to see its set</p>${plan}<div class="ar-sheetwrap ar-setwrap"></div></section>`; }
  else { /* no team yet: the line and the two actions, then the same stage as a full team, six add tiles (as Home's empty six) */
    const tiles = [0, 1, 2, 3, 4, 5].map(i => AR.emptyArt('l', {attrs: `data-chedit="${i}" aria-label="Add a Pokémon to slot ${i + 1}"`})).join('');
    /* Darkrai (Sim, Nov 9; was Shady Paw): shown where window.NP_MASCOT is set, which app/build.mjs does; without it, the sprite */
    const paw = typeof window !== 'undefined' && window.NP_MASCOT;
    stats = `<div class="ar-empty ar-tempty${paw ? ' ar-haspaw' : ''}">${paw ? `<img class="ar-paw" src="${paw}" alt="" width="464" height="473" decoding="async">` : `<span class="ar-empty-art" aria-hidden="true">${(CH.metaSix()[0] && sprite(CH.metaSix()[0])) || ''}</span>`}<div><p>Add your six and NastyPlot scouts the top 30 threats for you. Start with one, or let NastyPlot build six from real winning teams.</p>
    <div class="ar-acts"><button type="button" class="ar-btn ar-primary" data-chedit="0"><span>Add your first Pokémon</span>${AR.ICON.go}</button><button type="button" class="ar-btn" data-view="auto">Build me a team</button></div></div></div>`;
    stage = `<section class="ar-stage" aria-labelledby="arSix"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2" id="arSix">Your six</h2></div>
      <div class="ar-six ar-two" role="group" aria-label="Your six: tap a slot to add a Pokémon">${tiles}</div></section>`; }
  const sec = document.createElement('section'); sec.className = 'ar-team' + (ms.length ? '' : ' is-empty'); sec.setAttribute('aria-label', 'My team');
  sec.innerHTML = `<div class="ar-thead">${ms.length && AR.isSample(teamTitleFor(ms)) ? AR.sampleNote() : ''}${goneNote(S.slots) ? `<p class="ar-meta ar-gone" role="status">${goneNote(S.slots)}</p>` : ''}<p class="ar-kick">My team: <b>${ms.length} of 6</b>${wx}</p><div class="ar-titlerow"><div class="ar-h1 ar-tname${ms.length && teamTitleFor(ms).length > 16 ? ' ar-long' : ''}" role="heading" aria-level="1">${esc(ms.length ? teamTitleFor(ms) : 'No team yet').replace(/(Mega \S+) ([XYZ])\b/g, '$1\u00a0$2').replace(/ \(([FM])\)/g, '\u00a0($1)')}</div>${score}</div>${ms.length ? `<div class="ar-trow2">${AR.switcher()}<button type="button" class="ar-tsopen" data-tsopen="1">Team Sheet</button></div>` : AR.switcher()}</div>${ms.length ? AR.jumps() : ''}
    <div class="ar-tgrid">${stats}${stage}<div class="ar-tacts"></div></div>`;
  head.prepend(sec); head.classList.add('ar-on');
  /* the existing nodes move in, handlers and ids intact */
  const gw = $('chGwhy'); if (gw) sec.querySelector('.ar-thead').append(gw);
  const set = $('rzSet'), sw = sec.querySelector('.ar-setwrap'); if (set && sw) { set.classList.add('ar-sheet'); sw.append(set); }
  const acts = $('chActs'); if (acts) sec.querySelector('.ar-tacts').append(acts);
  /* Nov 10: "Your games" sits in the team grid under the actions (it can be drawn before this grid exists) */
  const mr = $('myRec'); if (mr) sec.querySelector('.ar-tgrid').append(mr);
  AR.cols(sec);
  /* first visit: the first lead's set is open (a tap anywhere else moves it) */
  /* Nov 10 (Sim): on phones the set card waits for a tap (the page was ~7 screens); tablets and desktop open the first lead's */
  if (ui.rzSet === undefined && ms.length && !AR.pre && !(typeof matchMedia === 'function' && matchMedia('(max-width:599px)').matches)) { AR.pre = 1; const f = sec.querySelector('[data-chset]'); if (f) setTimeout(() => f.click(), 0); } };
/* Nov 10 (Sim: no empty strips): on desktop My Team is two balanced columns. Left: Your Six, then the actions (two across);
   right: the numbers, the tapped Pokémon's set card beside the tiles, then Your games. Phones and tablets keep one column. */
AR.colsMQ = typeof matchMedia === 'function' ? matchMedia('(min-width:1001px)') : null;
AR.cols = sec => { const g = sec.querySelector('.ar-tgrid'); if (!g || !AR.colsMQ || !AR.colsMQ.matches || sec.classList.contains('is-empty')) return;
  const st = g.querySelector(':scope>.ar-stage'), ts = g.querySelector(':scope>.ar-tstats'), ac = g.querySelector(':scope>.ar-tacts'); if (!st || !ts || !ac) return;
  const L = document.createElement('div'), R = document.createElement('div'); L.className = 'ar-tcol ar-tcolL'; R.className = 'ar-tcol ar-tcolR';
  const sw = sec.querySelector('.ar-setwrap'), mr = g.querySelector(':scope>#myRec');
  L.append(st, ac); R.append(ts); if (sw) R.append(sw); if (mr) R.append(mr); g.append(L, R); g.classList.add('ar-cols'); };
if (AR.colsMQ) AR.colsMQ.addEventListener('change', () => { if (typeof view !== 'undefined' && (view === 'report' || view === 'build')) safe('concept h team', chTeamRender); });
/* dismissing What's new removes its wrapper too (the app's own handler removes the card) */
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('.ar-wnew > [data-wnewx]'); if (b) setTimeout(() => { const w = b.closest('.ar-wnew'); if (w && !w.querySelector('#wnewCard')) w.remove(); }, 0); });
/* the tapped tile: yellow ring and cursor follow ui.rzSet (the app's own handler in 70-riso2.js fills #rzSet) */
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('.ar-team [data-chset]'); if (!b) return;
  setTimeout(() => document.querySelectorAll('.ar-team .ar-art[data-chset]').forEach(t => { const on = +t.dataset.chset === ui.rzSet; t.classList.toggle('is-sel', on); const sl = t.closest('.ar-slot'); if (sl) sl.classList.toggle('is-sel', on);
    const cur = t.querySelector('.ar-cursor'); if (on && !cur) t.querySelector('.ar-f').insertAdjacentHTML('afterend', '<span class="ar-cursor" aria-hidden="true"></span>'); if (!on && cur) cur.remove(); }), 0); });
/* the set card (replaces the riso set panel): avatar on its type field, slanted type tags, its place in the game plan, the
   rating, item and ability, the four moves as battle-menu strips with a move-type edge, Edit set and the info sheet */
/* Nature and stat points on the set card (Sim, Nov 6: "its nature is so important and we just dont have that"): yours when
   set (paste, link or Edit set), else what most players run; stat points read as words, biggest first */
AR.natCells = m => { let sp = m.spread, own = !!(sp && sp.nat && !sp.assumed), nat = sp && sp.nat, note = own ? 'yours' : '';
  if (!nat) { try { const st = setFor(m.p); if (st.na && st.na.length) nat = st.na[0][0]; } catch (e) {} }
  let cs = null; try { cs = commonSpread(m.p); } catch (e) {}
  if (!nat && cs) nat = cs.nat; if (nat && !own) note = sp && sp.assumed ? 'yours' : 'most run';
  const pts = sp && !sp.assumed ? sp : cs, ptsNote = sp && !sp.assumed ? 'yours' : pts ? 'most run' : '';
  const L = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'], K = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const words = pts ? K.map((k, j) => [pts[k], L[j]]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).map(x => `${x[0]}\u00a0${x[1]}`).join(', ') : '';
  const cell = (lab, val, n) => `<div class="ar-setnat"><span>${lab}</span><b>${esc(val)}</b>${n ? `<i>${n}</i>` : ''}</div>`;
  return (nat ? cell('Nature', nat, note) : '') + (words ? cell('Stat points', words, ptsNote) : ''); };
rzSetHtml = function (m, i) {
  let r = null, tier = ''; try { r = rating(m.p).total; tier = lTier(r).k; } catch (e) {}
  const ms = members(), L = ms.length >= 4 ? AR.lineup(ms) : null, t = m.p.t || ['Normal'];
  const role = L && L.lead.length ? `<p class="ar-role">${AR.roleOf(m, L)}${L.by === 'meta' ? ` ${AR.VS_META}` : ''}</p>` : '';
  const mv = (m.moves || []).filter(Boolean).map(x => `<li class="ar-strip" style="--m:${AR.TC[AR.moveType(x.name)] || TC.Normal}"><span>${esc(x.name)}</span></li>`).join('');
  return `<div class="ar-sethd"><span class="ar-av" style="${AR.tv(m.p)}" aria-hidden="true"><span class="ar-av-f ar-field"></span>${sprite(m.p, 'rzsetspr') || ''}</span>
      <div class="ar-setti"><h3 class="ar-h2 ar-setname">${AR.nm(m.d)}</h3><div class="ar-tys" aria-label="${esc(t.join(' and '))} type">${t.map(AR.tag).join('')}</div>${role}</div></div>
    <div class="ar-setia">${r != null ? `<div class="ar-setr"><span class="ar-num ar-mp">${RS(r)}</span><small>${AR.ICON.star}${tier ? esc(tier) + ' tier rating' : 'Rating'}</small></div>` : ''}<div><span>Item</span><b>${esc(m.item || 'No item')}</b></div><div><span>Ability</span><b>${esc(m.ability || 'None')}</b></div>${AR.natCells(m)}</div>
    ${mv ? `<ul class="ar-strips" aria-label="Moves">${mv}</ul>` : ''}
    <div class="ar-setacts"><button type="button" class="ar-btn" data-chedit="${i}">Edit set</button>${L && L.lead.length && !L.lead.some(x => x.i === m.i) ? `<button type="button" class="ar-btn" data-arlead="${esc(m.p.n)}">Set as lead</button>` : ''}<button type="button" class="ar-link" data-lt="${esc(m.p.n)}">Info sheet ›</button></div>`; };
MG.team = () => {}; /* the manga stage is replaced by the arena stage */
MG.home = () => {}; /* the manga cover and spread are replaced by the arena Home */
CH.wrap('chTeamRender', () => AR.team());
/* the My team parts below the fold: numbered step plates and arena controls on the existing markup (CSS does the rest) */
AR.parts = () => { document.querySelectorAll('#chTeam ~ .chparts .chparth > .n:not(.ar-step)').forEach(n => { n.classList.add('ar-step'); if (!n.querySelector('span')) n.innerHTML = `<span>${esc(n.textContent)}</span>`; });
  document.querySelectorAll('#chTeam ~ .chparts .chparth h2').forEach(h => { if (h.textContent.trim() === 'Your six') h.textContent = 'Sets and team sheet'; });
  /* usability 5 (Nov 7): on phones the full team sheet (about a screen of text) is a fold; each set is also one tap away on
     the Pokémon above. Open on iPad and desktop; the choice is remembered, and the Sets jump link opens it */
  { const so = $('chSheetOut'); if (so && !so.closest('details.ar-sheetfold')) { const n = (members() || []).length, w = document.createElement('div');
      w.innerHTML = CH.fold('sheet2', 'Open team sheet', `${n ? n + ' sets, ' : ''}Reg M-C, bring 6, pick 4`, '', false); const d = w.firstElementChild;
      d.classList.add('ar-sheetfold'); d.id = 'chSets'; so.before(d); d.querySelector('.chbody').append(so); } }
  /* Nov 10 (Sim): section 4 is back as its own compact part: "All Six Sets", one fold, closed until opened */
  document.querySelectorAll('[data-pane="report"] .seg:not(.ar-seg), [data-pane="home"] .chhtop .seg:not(.ar-seg)').forEach(s => s.classList.add('ar-seg'));
  AR.fit();
  /* every sub-page has a back link (32-views.js adds most; This week, How we calculate and About were the ones without) */
  [['weekly', 'ratings', 'Meta'], ['method', 'ratings', 'Meta'], ['about', 'ratings', 'Meta']].forEach(([v, to, name]) => { const pane = document.querySelector(`[data-pane="${v}"]`);
    if (pane && !pane.querySelector(':scope > .chback')) pane.insertAdjacentHTML('afterbegin', `<button type="button" class="chback" data-view="${to}"><span aria-hidden="true">←</span> ${name}</button>`); });
  /* the older damage tables and chart labels print the short "M-Charizard Y"; one naming everywhere: "Mega Charizard Y" */
  document.querySelectorAll('main th span, main svg text, #lairSheet th span').forEach(e => { const t = e.firstChild; if (t && t.nodeType === 3 && /^M-\S/.test(t.textContent)) t.textContent = AR.mega(t.textContent).replace(/ ([XYZ])$/, '\u00a0$1'); });
  /* What's new: the dismiss x is its own button next to the fold, not inside its <summary> (a button in a summary has no tap
     area or focus of its own); the card and the x share a wrapper */
  const wn = $('wnewCard'); if (wn && !wn.parentElement.classList.contains('ar-wnew')) { const x = wn.querySelector('summary [data-wnewx]');
    if (x) { const w = document.createElement('div'); w.className = 'ar-wnew'; wn.before(w); w.append(wn, x); } }
  /* Fix it: the suggestion list never gets shorter while the same team is shown (a new "Suggest from" choice works the plans out
     again and can bring back a shorter list a second later), so the folds under it never jump up under a finger. A new team
     starts afresh. */
  const so = $('chSugOut'); if (so) { let k = ''; try { k = members().map(m => m.p.n).join(','); } catch (e) {}
    if (so.dataset.ark !== k) { so.dataset.ark = k; so.dataset.arh = 0; so.style.minHeight = ''; }
    // (Nov 7) not while the old list is still showing for a new team (it is being worked out): that height belongs to the old team
    const h = so.classList.contains('planstale') ? 0 : so.offsetHeight; if (h > +so.dataset.arh) so.dataset.arh = h; if (+so.dataset.arh > 0) so.style.minHeight = so.dataset.arh + 'px'; }
  /* the older secondary buttons and text links on these pages take the arena menu-strip and link styles (same elements, same handlers) */
  document.querySelectorAll('[data-pane="report"] :is(button.chghost,button.btn,button.sdcopy):not(.ar-btn):not(.chapply), #homeOut.ar-on :is(button.chghost,button.btn,button.sdcopy):not(.ar-btn), #lairSheet .lsact button.btn:not(.ar-btn)').forEach(b => {
    if (b.closest('#chActs,.mmpop,.chsheet,.wnew,.hpick,#welcomeCard') || b.matches('[data-welcomex]')) return; b.classList.add('ar-btn'); });
  document.querySelectorAll('[data-pane="report"] button.linkbtn:not(.ar-link), #homeOut.ar-on button.linkbtn:not(.ar-link):not(.npmore)').forEach(b => { if (!b.closest('#welcomeCard') && !b.matches('[data-welcomex]')) b.classList.add('ar-link'); }); };


/* names on the art. A name never breaks inside a word: while its longest word is wider than the name box, the size steps down
   after the narrower cut of the face, one type-scale step at a time (never under 15px; --nmf, arena-p1.css), and a name that still does not
   fit takes the tile's full width (.is-nmw). A name on the art that still takes two lines marks its tile .is-nm2,
   which shrinks the sprite so the name keeps clear of it. In dark mode the name sits on an ink plate that hugs its longest
   line (--nw), so a two-line name is one tidy plate, not a box out to the tile's edge. */
AR.fit = all => { document.querySelectorAll(all ? '.ar-art .ar-nm' : '.ar-art .ar-nm:not([data-nf])').forEach(n => { if (!n.getClientRects().length) return;
  const t = n.firstChild, tile = n.closest('.ar-art'), on = tile && !tile.classList.contains('ar-below'); if (!t || t.nodeType !== 3 || !t.textContent.trim()) return;
  n.dataset.nf = 1; n.style.removeProperty('--nmf'); delete n.dataset.ns; if (tile) tile.classList.remove('is-nmw'); if (on) n.style.removeProperty('--nw');
  const over = () => n.scrollWidth > n.clientWidth + 1;
  /* 1: the narrower cut of the display face; 2: one px at a time, never under 15px; 3: the name takes the tile's full width */
  if (over()) n.dataset.ns = 1;
  let f = parseFloat(getComputedStyle(n).fontSize), k = 0;
  // the box's 3-across phone tiles are narrower: there a name may go down to 13px, the smallest size on the scale (Nov 7, Sim)
  const fmin = tile && (tile.closest('[data-pane="box"]') || !on || (tile.closest('.ar-stage') && matchMedia('(max-width:599px)').matches)) ? 13 : 15; /* Nov 10: My Team's 3-across phone tiles too */
  /* Polish Batch 1 (Nov 10): step down through the type scale only (17, 16, 15, 13), never to an in-between size like 14px */
  const SC = [28, 26, 24, 22, 20, 17, 16, 15, 13];
  while (over() && f > fmin && k++ < 8) { const nx = SC.find(x => x < f - .5 && x >= fmin); if (nx == null) break; f = nx; n.style.setProperty('--nmf', f + 'px'); }
  if (over() && tile) tile.classList.add('is-nmw');
  const r = document.createRange(); r.selectNodeContents(t); const L = [...r.getClientRects()].filter(x => x.width > 1); if (!L.length) return;
  if (on) { tile.classList.toggle('is-nm2', new Set(L.map(x => Math.round(x.top))).size > 1);
    const w = Math.ceil(Math.max(...L.map(x => x.width))); if (w > 0) n.style.setProperty('--nw', w + 'px'); } }); };
addEventListener('resize', () => { clearTimeout(AR._ft); AR._ft = setTimeout(() => { AR.fit(1); try { AR.glue(); } catch (e) {} }, 120); });
try { document.fonts.ready.then(() => AR.fit(1)); } catch (e) {}

/* ======================= Info sheet: the hero ======================= */
/* a diagonal type band with the Pokémon breaking out of it and the sheet's one speed-line burst; the rating as a big numeral and
   its tier and rank on a slanted plate (the rating cell's "?" tip moves next to it, the cell hides, as before) */
AR.sheet = n => { const sh = $('lairSheet'), p = n && byName.get(n); if (!sh || sh.hidden || !p) return; const head = sh.querySelector('.lshead'); if (!head || head.querySelector('.ar-shero')) return;
  let r = null, T = null; try { r = rating(p); T = lTier(r.total); } catch (e) {}
  const rk = typeof rankTxt === 'function' ? rankTxt(p, 'cap') : '', cap = [T ? `${T.k} tier` : '', rk].filter(Boolean).join(', ');
  head.insertAdjacentHTML('afterbegin', `<div class="ar-shero${AR.isMega(p) ? ' is-mega' : ''}" style="${AR.tv(p)}"><span class="ar-shero-bg ar-field" aria-hidden="true">${AR.BURST}</span>${AR.spr(p, 'ar-shero-mon')}`
    + `${r ? `<span class="ar-shero-copy"><span class="ar-num ar-mp ar-shero-big">${RS(r.total)}</span>${cap ? `<span class="ar-shero-cap"><span class="ar-plate ar-sm" style="${AR.tv(p)}"><span>${esc(cap)}</span></span></span>` : ''}</span>` : ''}</div>`);
  head.classList.add('ar-head', 'mghead');
  const cell = sh.querySelector('.chlsr'), tq = cell && cell.querySelector('.tipq'), cq = head.querySelector('.ar-shero-cap');
  if (cell && cq) { if (tq) cq.prepend(tq); cell.hidden = true; cell.classList.add('mgmoved'); }
  const stats = sh.querySelector('.chlstats');
  if (stats && !stats.querySelector('.mgspd')) { let r0 = null; try { r0 = LST.speeds(p).find(x => x.main) || null; } catch (e) {}
    if (r0) stats.insertAdjacentHTML('beforeend', `<div class="mgspd"><b>${r0.v}</b><span>Speed at level&nbsp;50</span></div>`); }
  const add = sh.querySelector('.lsact [data-laddteam]'); if (stats && add && !sh.querySelector('.mgadd')) { const w = document.createElement('div'); w.className = 'mgadd'; stats.after(w); w.append(add); }
  const x = sh.querySelector('.lsx'); if (x) x.classList.add('ar-x');
  /* the name: a smaller title for long names (no "Indeedee / (F)" or "Mega / Charizard Y" orphans), the name ends kept together */
  const nm = sh.querySelector('.lsname'), h3 = nm && nm.querySelector('h3');
  if (h3) { h3.innerHTML = AR.nm(p.d); nm.classList.toggle('ar-long', p.d.length > 11); }
  /* the types as the slanted type tags the set card uses; Mega and box marks spelled out as quiet tags (no icon-only chips) */
  const ch = nm && nm.querySelector('.chips');
  if (ch && !ch.querySelector('.ar-ty')) { ch.querySelectorAll('.ty').forEach(e => e.remove());
    ch.insertAdjacentHTML('afterbegin', (p.t || ['Normal']).map(AR.tag).join(''));
    ch.querySelectorAll('.tag.ico').forEach(e => { e.classList.remove('ico'); e.classList.add('ar-mark'); e.textContent = e.classList.contains('box') ? 'In your box' : e.classList.contains('mega') ? 'Mega' : e.textContent; });
    ch.classList.add('ar-tys'); }
  /* Meta tab (phones too): "Items: Ability: Rough Skin 98%" reads as one run; the label is "Items", the ability its own line
     (the same split the desktop sheet makes) */
  sh.querySelectorAll('.lstp-meta .chlsdata .chk').forEach(ih => { if (ih.querySelector('.lsabn')) return; const m = /^Items\s*(?:·|:)\s*Ability: (.+)$/.exec(ih.textContent.trim()); if (!m) return;
    ih.textContent = 'Items'; /* Nov 7: the ability line moved to the Typical set (it read as an item) */ });
  const t = p.t || ['Normal']; sh.style.setProperty('--ar-ta', AR.TC[t[0]] || TC.Normal); sh.style.setProperty('--ar-tb', AR.TC[t[1] || t[0]] || TC.Normal); };
MG.sheet = n => AR.sheet(n);

/* run after the app draws (the same observer pattern as the other theme layers) */
/* polish pass: a "?" tip never wraps alone onto a line: it is glued to the last word before it (the button is moved, not
   rebuilt, so its handler and label stay); a hyphenated word in a sentence ("double-targeting") never splits at its hyphen */
AR._gl = new WeakSet(); /* elements already glued (a WeakSet, not a data attribute: controls keep their attributes) */
AR.glue = () => { document.querySelectorAll('main .tipq').forEach(b => { if (AR._gl.has(b)) return; AR._gl.add(b); const t = b.previousSibling;
    if (!t || t.nodeType !== 3 || b.parentElement.closest('.ar-nobr') || /flex|grid/.test(getComputedStyle(b.parentElement).display)) return; const m = /(\S+)(\s*)$/.exec(t.nodeValue); if (!m) return;
    t.nodeValue = t.nodeValue.slice(0, m.index); const w = document.createElement('span'); w.className = 'ar-nobr'; t.after(w); w.append(m[1] + (m[2] ? '\u00a0' : ''), b); });
  /* a "More" toggle stays on the line of the word before it (no lone "More" under a sentence) */
  /* an empty slot says "Add a Pokémon"; where that would take two lines on a narrow tile it says "Add" (its button keeps the full
     accessible name) */
  document.querySelectorAll('.ar-art.is-empty .ar-nm:has(.ar-addr)').forEach(n => { if (!n.getClientRects().length) return; n.classList.remove('is-short');
    const r = n.querySelector('.ar-addl').getBoundingClientRect(), e = n.querySelector('.ar-addr').getClientRects(); if (e.length && Math.abs(e[e.length - 1].bottom - r.bottom) > 4) n.classList.add('is-short'); });
  document.querySelectorAll('.rzmorebtn').forEach(b => { if (AR._gl.has(b)) return; AR._gl.add(b); let t = b.previousSibling; if (t && t.nodeType === 3 && /^\s+$/.test(t.nodeValue)) { const s = t; t = t.previousSibling; s.remove(); }
    if (!t || t.nodeType !== 3) return; const m = /(\S+)(\s*)$/.exec(t.nodeValue); if (!m) return; t.nodeValue = t.nodeValue.slice(0, m.index);
    const w = document.createElement('span'); w.className = 'ar-nobr ar-moreg'; b.before(w); w.append(m[1] + '\u00a0', b); });
  document.querySelectorAll('main :is(.prob-row>div,.wdsub,.chpgs,.hint,.empty-note,.mgempty,.pmain,.ltd,.cht,p,li,dd,b,a,span.t2,span:not([class]))').forEach(e => { if (AR._gl.has(e)) return; AR._gl.add(e);
    const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), L = []; let n; while ((n = tw.nextNode())) if (/\w[-\u2013]\w/.test(n.nodeValue) && !n.parentElement.closest('.ar-nobr,svg,textarea,script,style')) L.push(n);
    L.forEach(n => { const f = document.createElement('span'); f.innerHTML = esc(n.nodeValue).replace(/([A-Za-z0-9(]+(?:[-\u2013][A-Za-z0-9)%]+)+)/g, '<span class="ar-nobr">$1</span>'); n.replaceWith(...f.childNodes); }); }); };
/* the glued "More" toggle opens the text that follows its glue span (70-riso2.js looks for it right after the button) */
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('.ar-moreg > .rzmorebtn'); if (!b) return;
  const rest = b.parentElement.nextElementSibling; if (!rest || !rest.classList.contains('rzrest')) return; const open = rest.hidden; rest.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Less' : 'More'; });
{ let q = false; const run = () => { q = false; try { AR.parts(); } catch (e) {} try { AR.glue(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true}); }
if (window.__PL_TEST) { window.__AR = AR; window.__ARX = {TC, ROSTER, SPRITE_ID, lairSheet, lairClose}; }
/* Buried actions (Sim, Nov 5): opening "Problems and checklist" also opens the first problem that has a fix button, so a
   fix like "Swap out Whimsicott" is one tap away, not two folds deep. */
document.addEventListener('toggle', e => { const d = e.target; if (!d || d.id !== 'chfFix' || !d.open) return;
  const first = [...d.querySelectorAll('details')].find(x => x.querySelector('button[data-rec], .qact button, button.primary'));
  if (first && ![...d.querySelectorAll('details')].some(x => x.open)) first.open = true; }, true);
/* Recent opponents (Sim, Nov 5): every full six typed or loaded into Battle mode is remembered (the last five, newest first,
   S.recentOpp), and shows as one-tap chips under "Their six", so a rematch doesn't mean typing six Pokémon again. */
(() => { if (typeof persist !== 'function' || typeof CH !== 'object' || !CH.wrap) return;
  const keyOf = a => a.slice().sort().join('|');
  const op = persist; persist = function () { try { const o = (S.opp || []).filter(Boolean);
    if (o.length === 6 && o.every(n => byName.has(n))) { const k = keyOf(o), R = (S.recentOpp || []).filter(x => Array.isArray(x) && keyOf(x) !== k); R.unshift(o.slice()); S.recentOpp = R.slice(0, 5); } } catch (e) {}
    return op.apply(this, arguments); };
  CH.wrap('renderBattle', () => { try { const out = $('bmOut'), at = out && (out.querySelector('.bmopp') || $('oppSlots')); if (!at) return;
      const old = out.parentElement.querySelector('.ar-recent'); if (old) old.remove();
      const cur = keyOf((S.opp || []).filter(Boolean)), R = (S.recentOpp || []).filter(x => Array.isArray(x) && x.length === 6 && x.every(n => byName.has(n)) && keyOf(x) !== cur).slice(0, 4);
      if (R.length) at.insertAdjacentHTML('afterend', `<div class="ar-recent"><span class="ar-recentk">Recent opponents</span><div class="ar-recentl">${R.map(x => {
        const ps = x.map(n => byName.get(n)); return `<button type="button" class="ar-rcopp" data-arrecent="${esc(x.join('|'))}" aria-label="Load ${esc(ps.map(p => p.d).join(', '))}">${ps.map(p => sprite(p, 'tiny') || '').join('')}</button>`; }).join('')}</div></div>`); } catch (e) {} }); })();
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-arrecent]'); if (!b) return;
  const six = b.dataset.arrecent.split('|').filter(n => byName.has(n)); if (six.length !== 6) return;
  S.opp = six.slice(); ui.oppFrom = null; persist(); renderMatchup(); if (typeof renderBattle === 'function') safe('battle', renderBattle); toast('Recent opponent loaded'); });

/* Usability (Sim, Nov 7): on Meta the ratings list comes first. "About the ratings" moves under the list, and the 18 type chips
   and the Megas / hidden gems flags sit behind one Filter button next to the search (open while any filter is on, with a count). */
CH.wrap('renderLair', () => { const sec = $('lair'); if (!sec) return;
  const about = [...sec.querySelectorAll(':scope > details.chsec.chfold')].find(d => /About the ratings/.test(d.textContent)), hot = $('chHot');
  if (about && hot && (about.compareDocumentPosition(hot) & Node.DOCUMENT_POSITION_FOLLOWING)) hot.after(about);
  const ty = $('lairTypes'), fl = $('lairFlags'), ctl = sec.querySelector(':scope > .lctl'); if (!ty || !fl || !ctl) return;
  const n = (ui.lty || []).length + Object.values(ui.lf || {}).filter(Boolean).length;
  let btn = ctl.querySelector('.ar-lfilt');
  if (!btn) { btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ar-btn ar-lfilt'; btn.setAttribute('aria-controls', 'lairTypes lairFlags'); ctl.append(btn);
    btn.addEventListener('click', () => { AR.lfOpen = !sec.classList.contains('ar-lfopen'); sec.classList.toggle('ar-lfopen', AR.lfOpen); btn.setAttribute('aria-expanded', String(AR.lfOpen)); }); }
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>Filter${n ? ` <b class="ar-lfn">${n}</b>` : ''}`;
  const open = !!AR.lfOpen || n > 0; sec.classList.toggle('ar-lfopen', open); btn.setAttribute('aria-expanded', String(open)); });

/* Usability (Sim, Nov 7): importing a Showdown team was three screens down, inside My team's ⋯ menu. These buttons open the same
   import panel from Home and from the sample-team note. */
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-arimport]'); if (!b) return; e.preventDefault();
  setView('report'); setTimeout(() => { const i = $('importBtn'); if (i) i.click(); }, 60); });
/* Sim (Nov 7): light/dark is one tap from every page. The sun/moon button (61-concept-h-pages.js) sits in the header right
   before the ⋯ menu, on phone and desktop: a moon while dark mode shows, a sun while light shows, each tap switches.
   Auto / Light / Dark stays in the ⋯ menu for following the device */
safe('theme button in header', () => { const t = $('thmBtn'), band = document.querySelector('.band'); if (!t || !band) return;
  const dots = [...band.querySelectorAll('button')].find(b => /moreBtn|chmenubtn/.test(b.id + ' ' + b.className) && b !== t);
  if (dots && t.nextElementSibling !== dots) dots.before(t); t.classList.add('ar-thm'); });
