// ---------- Champions arena (Sim picked direction C, Nov 5): Home, My team and the info sheet ----------
// Draws the arena markup for Home, the top of My team and the info sheet's hero (theme/arena.css, theme/arena-p1.css,
// theme/ARENA.md). Every number, name and control comes from the app's own data and functions; nothing new is computed except
// colours. Controls keep the attributes the app's handlers listen for (data-lt, data-view, data-chset, data-chgrade,
// data-chedit, data-evload, data-evvs, data-sdcopy), and the moved nodes (#rzSet, #chGwhy, #chActs) keep their handlers.
const AR = {};
/* arena type palette: the app's type colours, except Dark, which reads brown on a field (Sim: no brown fills) */
AR.TC = Object.assign({}, TC, {Dark: '#5E5068'});
AR.tv = p => { const t = (p && p.t) || ['Normal']; return `--a:${AR.TC[t[0]] || TC.Normal};--b:${AR.TC[t[1] || t[0]] || TC.Normal}`; };
/* text on a filled type tag: white where it reaches 4.5:1, ink otherwise */
AR.lum = h => { const c = [1, 3, 5].map(i => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
AR.onType = t => { const L = AR.lum(AR.TC[t] || TC.Normal); return 1.05 / (L + .05) >= 4.5 ? '#fff' : '#16141A'; };
AR.tag = t => `<span class="ar-ty" style="--t:${AR.TC[t] || TC.Normal};color:${AR.onType(t)}"><span>${esc(t)}</span></span>`;
/* move name -> type (the moves table: [name, type index, ...]) */
AR.mt = null;
AR.moveType = n => { if (!AR.mt) { AR.mt = new Map(); try { for (const r of MOVES) AR.mt.set(r[0], TYPES[r[1]]); } catch (e) {} } return AR.mt.get(n) || 'Normal'; };
AR.isMega = p => !!(p && (p.m || /-Mega/.test(p.n || '')));
AR.spr = (p, cls) => sprite(p, 'ar-spr' + (cls ? ' ' + cls : '')) || '';
/* one art tile; o: {tag, size, below, name, sub, attrs, sel} */
AR.art = (p, o = {}) => { const tag = o.tag || 'button', cls = `ar-art ar-${o.size || 'm'}${o.below ? ' ar-below' : ''}${AR.isMega(p) ? ' is-mega' : ''}${o.sel ? ' is-sel' : ''}`;
  return `<${tag} ${tag === 'button' ? 'type="button" ' : ''}class="${cls}" style="${AR.tv(p)}" ${o.attrs || ''}><span class="ar-f ar-field" aria-hidden="true"></span>${AR.spr(p)}${o.sel ? '<span class="ar-cursor" aria-hidden="true"></span>' : ''}`
    + `<span class="ar-nm">${escName(o.name || p.d)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></${tag}>`; };
AR.emptyArt = size => `<div class="ar-art ar-${size || 'm'} ar-below is-empty" aria-hidden="true"><span class="ar-f"></span><span class="ar-nm">&nbsp;</span></div>`;
AR.ICON = {
  grade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  build: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>',
  battle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  go: '<span class="ar-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></span>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>'};
/* the page's one speed-line burst, white, from behind the hero Pokémon (drawn on the sprite's half only) */
AR.BURST = '<svg class="ar-lines" viewBox="0 0 400 350" preserveAspectRatio="none" aria-hidden="true"><g stroke="#fff" stroke-width="3" stroke-linecap="round">'
  + ['400 20', '400 70', '400 120', '400 180', '400 240', '400 300', '330 0', '370 0', '260 0', '220 0', '190 30', '350 350', '280 350', '220 350', '190 300'].map(e => `<path d="M300 150 L${e}"/>`).join('') + '</g></svg>';
/* "A + B" from a list of members */
AR.pair = L => L.map(m => escName(m.d)).join(' + ');
AR.plan = (lead, back, bench, vs) => lead.length ? `<p class="ar-gameplan">Game plan ${vs}: lead <b>${AR.pair(lead)}</b>${back.length ? `, back ${AR.pair(back)}` : ''}${bench.length ? `, bench ${AR.pair(bench)}` : ''}.</p>` : '';
/* the latest event winner with a full, known six (the same pick as Home's old champion card) */
AR.champ = () => { const E = META.events; if (!E || !Array.isArray(E.events)) return null;
  for (const e of E.events) { const t = (e.top || []).find(x => x && x.place === 1 && x.mons && x.mons.length === 6 && x.mons.every(m => byName.get(m.n))); if (t) return {ev: e, t, n: E.events.length, six: t.mons.map(m => ({p: byName.get(m.n), it: m.i || '', ab: m.a || ''}))}; }
  return null; };

/* ======================= Home ======================= */
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
  const tools = `<nav class="ar-tools" aria-label="Start here">${has ? b('report', ' ar-primary', AR.ICON.grade, 'Grade my team') + b('auto', '', AR.ICON.build, 'Build a team', 'var(--ar-gold)')
    : b('auto', ' ar-primary', AR.ICON.build, 'Build me a team') + b('report', '', AR.ICON.grade, 'Grade my team', 'var(--ar-blue)')}${b('matchup', '', AR.ICON.battle, 'Plan a match', 'var(--ar-orange)')}</nav>`;
  /* the champion's six */
  let them = '', FC = null, sameSix = false;
  if (C) { const {ev, t} = C, key = esc(ev.id) + '#' + ev.top.indexOf(t); sameSix = ms.length === 6 && t.mons.every(m => ms.some(x => x.p.n === m.n));
    try { FC = ms.length >= 4 ? CH.fourVs(ms, C.six.map(x => x.p.n)) : null; } catch (e) { FC = null; }
    them = `<section class="ar-side ar-pink" aria-labelledby="arChamp"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2" id="arChamp">The champion's six</h2></div>
      <div class="ar-winner"><p class="ar-meta">Latest winner</p><p class="ar-ev">${esc(evName(ev.name))}</p><p class="ar-meta"><b>${esc(t.player)}${t.record ? ', ' + esc(String(t.record).replace(/\s*·.*$/, '')) : ''}</b>, ${esc(evDate(ev.date))}${ev.players ? `, ${ev.players} players` : ''}</p>${sameSix ? '<p class="ar-meta"><b>Same six as yours</b></p>' : ''}</div>
      <div class="ar-six">${C.six.map(x => AR.art(x.p, {size: 'm', below: 1, sub: x.it, attrs: `data-lt="${esc(x.p.n)}" aria-label="${esc(x.p.d)}${x.it ? ', ' + esc(x.it) : ''}: open its info"`})).join('')}</div>
      <div class="ar-acts"><button type="button" class="ar-btn" data-evload="${key}">Load this team</button>${sdBtn('ev:' + ev.id + '#' + ev.top.indexOf(t), 'ar-btn')}<button type="button" class="ar-link" data-view="events">All ${C.n} events ›</button></div></section>`; }
  /* your six: ordered lead, back, bench for the plan shown under it (vs the champion's six, or the meta's six without one) */
  let F = FC, vs = C ? `vs ${esc(C.t.player)}'s six` : '';
  if (!F && ms.length >= 4) { try { F = CH.four(ms); vs = "vs the meta's top six"; } catch (e) { F = null; } }
  const byN = n => ms.find(m => m.p.n === n), lead = F ? F.lead.map(byN).filter(Boolean) : [], back = F ? F.back.map(byN).filter(Boolean).filter(m => !lead.includes(m)) : [];
  const bench = ms.filter(m => !lead.includes(m) && !back.includes(m)), ord = [...lead, ...back, ...bench].slice(0, 6);
  let title = ms.length ? teamTitleFor(ms) : 'Your six goes here', wx = ''; try { const k = wxKeyOf(ms); if (k) wx = ` ${esc(wxName(k))}`; } catch (e) {}
  const you = `<section class="ar-side ar-blue" aria-labelledby="arYours"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2" id="arYours">${esc(title)}</h2></div>
    <div class="ar-winner">${ms.length ? `<p class="ar-meta">Your team: <b>${ms.length}/6</b>${wx}</p>` : '<p class="ar-meta">Add six Pokémon and NastyPlot scouts the top threats for you.</p>'}</div>
    <div class="ar-six">${ms.length ? ord.map(m => AR.art(m.p, {size: 'm', below: 1, name: m.d, attrs: `data-lt="${esc(m.p.n)}" aria-label="${esc(m.d)}: open its info"`})).join('') : Array.from({length: 6}, () => AR.emptyArt('m')).join('')}</div>
    ${AR.plan(lead, back, bench, vs)}
    <div class="ar-acts">${ms.length ? `<button type="button" class="ar-btn" data-view="report">Open my team</button>${C && FC && !sameSix ? `<button type="button" class="ar-link" data-evvs="${esc(C.ev.id)}#${C.ev.top.indexOf(C.t)}">Prep vs the champion ›</button>` : ''}`
      : '<button type="button" class="ar-btn" data-view="build">Add your six</button>'}</div></section>`;
  const html = `<div class="ar-home"><div class="ar-deck"><div class="ar-deck-main"><div class="ar-h1 ar-hh" role="heading" aria-level="2">Plot your win.</div>${hero}</div>
    <div class="ar-deck-side"><div class="ar-runners">${ru.map(runner).join('')}</div><p class="ar-caption">${esc(MG.srcLine())}</p>${tools}</div></div>
    <div class="ar-versus">${them}${them ? '<div class="ar-vs" aria-hidden="true"><span class="ar-num ar-mp">vs</span></div>' : ''}${you}</div></div>`;
  out.insertAdjacentHTML('afterbegin', html); out.classList.add('ar-on');
  /* the weekly teaser lives in the old phone column (hidden now): it moves under the two sixes */
  const wk = out.querySelector('.chmh .wkhome'); if (wk) out.querySelector('.ar-home').append(wk); };
CH.wrap('renderHome', () => AR.home());

/* ======================= My team ======================= */
/* the lineup the stage and the set card use: the planner's four vs the meta's six (CH.four), the rest on the bench */
AR.lineup = ms => { const L = MG.lineup(ms); return {lead: L.lead, back: L.back, bench: L.home, by: L.by}; };
AR.roleOf = (m, L) => { const has = g => g.some(x => x.i === m.i), other = g => g.filter(x => x.i !== m.i).map(x => escName(x.d)).join(' + ');
  if (has(L.lead)) return `Leads with ${other(L.lead) || 'its partner'}`; if (has(L.back)) return `In the back with ${other(L.back) || 'its partner'}`; return 'On the bench'; };
AR.VS_META = "vs the meta's top six";
AR.cell = (v, u, extra) => `<div class="ar-stat"><span class="ar-num">${v}</span><span class="ar-unit">${u}${extra || ''}</span></div>`;
AR.team = () => { const head = $('chTeam'); if (!head) return; const th = head.querySelector(':scope > .chthead'); if (!th) return;
  const old = head.querySelector(':scope > .ar-team'); if (old) old.remove();
  const ms = members(), v = ui.vsum || {}, RD = ms.length ? prepOf(ms) : null; let G = null; try { G = RD ? CH.gradeOf(RD, v.CK, ms) : null; } catch (e) {}
  const hd = CH.hand(RD), c = CH.lvCount(RD), tp = k => typeof tip === 'function' ? tip(k) : '';
  let wx = ''; try { const k = wxKeyOf(ms); if (k) wx = `, ${esc(wxName(k))}`; } catch (e) {}
  /* the score: the big number is always what the letter comes from. With 30+ real games the letter comes from the record's win
     rate (one decimal, so 59.6% never reads as an A's "60%"); otherwise it is the grade out of 100 (Sim: "93, Grade A"). */
  let score = '';
  if (G) { const why = `<button type="button" class="ar-link ar-why" data-chgrade="1" aria-expanded="${ui.gwhy ? 'true' : 'false'}" aria-controls="chGwhy">Why ${esc(G.letter)}?</button>`;
    score = G.rec ? `<div class="ar-score"><span class="ar-num ar-mp">${(G.rec.wr * 100).toFixed(1)}<small>%</small></span><span class="ar-grade">Grade ${esc(G.letter)}</span><span class="ar-basis">tournament win rate</span>${why}</div>`
      : `<div class="ar-score"><span class="ar-num ar-mp">${G.s}</span><span class="ar-grade">Grade ${esc(G.letter)}${G.partial ? ' so far' : ''}</span><span class="ar-basis">out of 100</span>${why}</div>`; }
  /* the stats under the title: the record (when the grade comes from it), our check, legality */
  let stats = '';
  if (RD) { const rec = G && G.rec ? `<div class="ar-st" role="group" aria-label="Tournament record"><h3 class="ar-sth">Tournament record${tp('numbers')}</h3><div class="ar-trio">${AR.cell(G.rec.g.toLocaleString('en-US'), 'games')}${AR.cell(G.rec.n.toLocaleString('en-US'), G.rec.n === 1 ? 'player' : 'players')}</div></div>` : '';
    const sc = G && G.rec ? AR.cell(G.s, 'score') : '';
    const chk = `<div class="ar-st" role="group" aria-label="Our check against the top ${hd ? hd.n : 30} threats"><h3 class="ar-sth">Our check, top ${hd ? hd.n : 30} threats${G && !G.rec ? tp('numbers') : ''}</h3>
      <div class="ar-trio${sc ? ' ar-four' : ''}">${sc}<div class="ar-stat"><span class="ar-num ar-mp">${RD.score}%</span><span class="ar-unit">ready${tp('readiness')}</span></div>${hd ? AR.cell(hd.x, 'handled') : ''}${c[1] ? AR.cell(c[1], 'shaky') : ''}${c[0] ? AR.cell(c[0], 'unanswered') : ''}</div>
      <span class="ar-bar" aria-hidden="true"><i style="--v:${Math.max(0, Math.min(100, RD.score))}%;--c:var(--ar-green)"></i></span>${G && !G.rec && !G.partial ? `<p class="ar-sum">${CH.gradeSum(G, RD)}</p>` : ''}</div>`;
    const ck = v.CK, legal = v.legal === false ? 'Not legal yet' : 'Legal';
    const leg = `<div class="ar-legal${v.legal === false ? ' is-bad' : ''}" title="Based on our reading of the ${esc(typeof REG_NAME === 'string' ? REG_NAME : 'Reg M-C')} rules. Check the official rules before an event."><b>${legal}</b>${ck ? `<span>${ck.pass}/${ck.n} checks</span><span class="ar-pips" aria-hidden="true">${Array.from({length: ck.n}, (_, i) => `<i${i < ck.pass ? '' : ' class="off"'}></i>`).join('')}</span>` : ''}</div>`;
    stats = `<div class="ar-tstats">${rec}${chk}${leg}</div>`; }
  else stats = `<div class="ar-tstats"><p class="ar-lede">Add your six and NastyPlot scouts the top 30 threats for you.</p></div>`;
  /* the stage: all six as equal art tiles (no roles on the art), the game plan line under them */
  let stage = '';
  if (ms.length) { const L = AR.lineup(ms), ord = [...L.lead, ...L.back, ...L.bench], sel = ui.rzSet;
    const tiles = ord.map(m => AR.art(m.p, {size: 'l', name: m.d, sel: sel === m.i, attrs: `data-chset="${m.i}" aria-pressed="${sel === m.i}" aria-controls="rzSet" aria-label="${esc(m.d)}: show its set"`})).join('');
    const plan = L.lead.length >= 2 ? AR.plan(L.lead, L.back, L.bench, L.by === 'meta' ? AR.VS_META : '(team order)') : '';
    stage = `<section class="ar-stage" aria-labelledby="arSix"><div class="ar-shead"><span class="ar-tab" aria-hidden="true"></span><h2 class="ar-h2" id="arSix">Your six</h2></div>
      <div class="ar-six ar-two" role="group" aria-label="Your six: tap one to see its set">${tiles}</div>${plan}<div class="ar-sheetwrap ar-setwrap"></div></section>`; }
  else stage = `<div class="ar-empty"><span class="ar-empty-art" aria-hidden="true">${(CH.metaSix()[0] && sprite(CH.metaSix()[0])) || ''}</span><div><p>No Pokémon yet. Add your first, or let NastyPlot build six from real winning teams.</p>
    <div class="ar-acts"><button type="button" class="ar-btn ar-primary" data-chedit="0"><span>Add your first Pokémon</span>${AR.ICON.go}</button><button type="button" class="ar-btn" data-view="auto">Build me a team</button></div></div></div>`;
  const sec = document.createElement('section'); sec.className = 'ar-team'; sec.setAttribute('aria-label', 'My team');
  sec.innerHTML = `<div class="ar-thead"><p class="ar-kick">My team: <b>${ms.length} of 6</b>${wx}</p><div class="ar-titlerow"><div class="ar-h1 ar-tname" role="heading" aria-level="1">${esc(ms.length ? teamTitleFor(ms) : 'No team yet')}</div>${score}</div></div>
    <div class="ar-tgrid">${stats}${stage}<div class="ar-tacts"></div></div>`;
  head.prepend(sec); head.classList.add('ar-on');
  /* the existing nodes move in, handlers and ids intact */
  const gw = $('chGwhy'); if (gw) sec.querySelector('.ar-thead').append(gw);
  const set = $('rzSet'), sw = sec.querySelector('.ar-setwrap'); if (set && sw) { set.classList.add('ar-sheet'); sw.append(set); }
  const acts = $('chActs'); if (acts) sec.querySelector('.ar-tacts').append(acts);
  /* first visit: the first lead's set is open (a tap anywhere else moves it) */
  if (ui.rzSet === undefined && ms.length && !AR.pre) { AR.pre = 1; const f = sec.querySelector('[data-chset]'); if (f) setTimeout(() => f.click(), 0); } };
/* the tapped tile: yellow ring and cursor follow ui.rzSet (the app's own handler in 70-riso2.js fills #rzSet) */
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('.ar-team [data-chset]'); if (!b) return;
  setTimeout(() => document.querySelectorAll('.ar-team .ar-art[data-chset]').forEach(t => { const on = +t.dataset.chset === ui.rzSet; t.classList.toggle('is-sel', on);
    const cur = t.querySelector('.ar-cursor'); if (on && !cur) t.querySelector('.ar-f').insertAdjacentHTML('afterend', '<span class="ar-cursor" aria-hidden="true"></span>'); if (!on && cur) cur.remove(); }), 0); });
/* the set card (replaces the riso set panel): avatar on its type field, slanted type tags, its place in the game plan, the
   rating, item and ability, the four moves as battle-menu strips with a move-type edge, Edit set and the info sheet */
rzSetHtml = function (m, i) {
  let r = null, tier = ''; try { r = rating(m.p).total; tier = lTier(r).k; } catch (e) {}
  const ms = members(), L = ms.length >= 4 ? AR.lineup(ms) : null, t = m.p.t || ['Normal'];
  const role = L && L.lead.length ? `<p class="ar-role">${AR.roleOf(m, L)}${L.by === 'meta' ? ` ${AR.VS_META}` : ''}</p>` : '';
  const mv = (m.moves || []).filter(Boolean).map(x => `<li class="ar-strip" style="--m:${AR.TC[AR.moveType(x.name)] || TC.Normal}"><span>${esc(x.name)}</span></li>`).join('');
  return `<div class="ar-sethd"><span class="ar-av" style="${AR.tv(m.p)}" aria-hidden="true"><span class="ar-av-f ar-field"></span>${sprite(m.p, 'rzsetspr') || ''}</span>
      <div class="ar-setti"><h3 class="ar-h2 ar-setname">${escName(m.d)}</h3><div class="ar-tys" aria-label="${esc(t.join(' and '))} type">${t.map(AR.tag).join('')}</div>${role}</div></div>
    <div class="ar-setia">${r != null ? `<div class="ar-setr"><span class="ar-num ar-mp">${Math.round(r)}</span><small>${AR.ICON.star}${tier ? esc(tier) + ' tier rating' : 'Rating'}</small></div>` : ''}<div><span>Item</span><b>${esc(m.item || 'No item')}</b></div><div><span>Ability</span><b>${esc(m.ability || 'None')}</b></div></div>
    ${mv ? `<ul class="ar-strips" aria-label="Moves">${mv}</ul>` : ''}
    <div class="ar-setacts"><button type="button" class="ar-btn" data-chedit="${i}">Edit set</button><button type="button" class="ar-link" data-lt="${esc(m.p.n)}">Info sheet ›</button></div>`; };
MG.team = () => {}; /* the manga stage is replaced by the arena stage */
MG.home = () => {}; /* the manga cover and spread are replaced by the arena Home */
CH.wrap('chTeamRender', () => AR.team());
/* the My team parts below the fold: numbered step plates and arena controls on the existing markup (CSS does the rest) */
AR.parts = () => { document.querySelectorAll('#chTeam ~ .chparts .chparth > .n:not(.ar-step)').forEach(n => { n.classList.add('ar-step'); if (!n.querySelector('span')) n.innerHTML = `<span>${esc(n.textContent)}</span>`; });
  document.querySelectorAll('[data-pane="report"] .seg:not(.ar-seg), [data-pane="home"] .chhtop .seg:not(.ar-seg)').forEach(s => s.classList.add('ar-seg'));
  /* the older secondary buttons and text links on these pages take the arena menu-strip and link styles (same elements, same handlers) */
  document.querySelectorAll('[data-pane="report"] :is(button.chghost,button.btn,button.sdcopy):not(.ar-btn):not(.chapply), #homeOut.ar-on :is(button.chghost,button.btn,button.sdcopy):not(.ar-btn), #lairSheet .lsact button.btn:not(.ar-btn)').forEach(b => {
    if (b.closest('#chActs,.mmpop,.chsheet,.wnew,.hpick')) return; b.classList.add('ar-btn'); });
  document.querySelectorAll('[data-pane="report"] button.linkbtn:not(.ar-link), #homeOut.ar-on button.linkbtn:not(.ar-link):not(.npmore)').forEach(b => b.classList.add('ar-link')); };

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
  if (cell && cq) { if (tq) cq.append(tq); cell.hidden = true; cell.classList.add('mgmoved'); }
  const stats = sh.querySelector('.chlstats');
  if (stats && !stats.querySelector('.mgspd')) { let r0 = null; try { r0 = LST.speeds(p).find(x => x.main) || null; } catch (e) {}
    if (r0) stats.insertAdjacentHTML('beforeend', `<div class="mgspd"><b>${r0.v}</b><span>Speed at level 50</span></div>`); }
  const add = sh.querySelector('.lsact [data-laddteam]'); if (stats && add && !sh.querySelector('.mgadd')) { const w = document.createElement('div'); w.className = 'mgadd'; stats.after(w); w.append(add); }
  const x = sh.querySelector('.lsx'); if (x) x.classList.add('ar-x'); };
MG.sheet = n => AR.sheet(n);

/* run after the app draws (the same observer pattern as the other theme layers) */
{ let q = false; const run = () => { q = false; try { AR.parts(); } catch (e) {} };
  new MutationObserver(() => { if (!q) { q = true; requestAnimationFrame(run); } }).observe(document.body, {childList: true, subtree: true}); }
if (window.__PL_TEST) window.__AR = AR;
