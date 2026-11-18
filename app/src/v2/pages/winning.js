// Sim Q8 (Nov 15): one tab row for the four Tournaments views, This Week added as the fourth (it was only reachable from Home's closed fold)
V2.tourTabs = on => { const T = [['tournaments', 'Winning Teams'], ['events', 'Events'], ['archetypes', 'Archetypes'], ['weekly', 'This Week']];
  return `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta">Pokémon</a><a href="#tournaments" class="on" aria-current="page">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Tournament views">${T.map(([h, t]) => `<a href="#${h}"${h === on ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}</nav></div>`; };
// ---------- Meta > Tournaments > Winning Teams (Nov 14): Sim's pick "The Winning Hands" (docs/rebuild/mocks/winning-hands/BRIEF.md) ----------
// Every feature of today's Winning Teams (meta-features.md TOP-01..07) from today's shared logic: META.teams, ttSourceText, gradeNames,
// proChecks, teamPlanLabel / archChips, teamWho, tsPool / tsTerms / tsMatch (search), sdNames (Copy for Showdown), sheetSlots (Load).
// The top three teams of the chosen group are fanned hands of Cards (V2.msCard, the Card of the info sheet and My Team); the rest are rows.
V2.wtUi = V2.wtUi || {grp: null, more: 0, sure: null, f: [], q: '', fmore: 0};
V2.wtList = () => { const d = META.teams; return d && d.teams && d.teams.length ? d.teams.map((t, k) => ({t, k})) : []; };
V2.wtGroups = () => { const g = new Map(); V2.wtList().forEach(x => g.set(x.t.section, (g.get(x.t.section) || 0) + 1)); return [...g]; };
V2.wtPlace = t => { const m = String(t.record || '').match(/#(\d+)/); return m ? +m[1] : 0; };
V2.wtOfficial = t => /official/.test(t.record || '');
V2.wtChecks = (g, long) => { if (!g) return ''; const miss = g.items.filter(x => !x.ok && !x.skip && !x.note).map(x => x.label.toLowerCase());
  return `<span class="wt-ck${g.pass === g.n ? ' all' : ''}"><b class="u">${g.pass}/${g.n}</b> checks${long && miss.length ? `, missing ${V2.esc(miss.join(', ')).replace(/ (\S+)$/, '&nbsp;$1')}` /* re-verify #14: the last word never sits alone */ : ''}</span>`; };
V2.wtChips = names => { const L = String(teamPlanLabel(names) || '').split(' · ').filter(Boolean); return L.length ? `<span class="wt-chips">${L.map(x => `<span class="wt-chip">${V2.esc(x)}</span>`).join('')}</span>` : ''; }; /* today's style names (teamPlanLabel), as plain chips: archChips writes its own colours */
// one Card: tap opens the Pokémon's info sheet (as everywhere a Card is shown)
V2.wtCard = (n, iw, i) => { const p = byName.get(n); if (!p) return ''; const d = V2.disp(n);
  return `<button type="button" class="wt-card" style="--i:${i}" data-v2mon="${V2.esc(n)}" aria-label="${V2.esc(d)}: open its page">${V2.msCard(p, n, `<h3 class="u">${V2.nameHtml(d)}</h3>`, '', iw)}</button>`; };
V2.wtActs = (k, who) => { const E = V2.esc, sure = V2.wtUi.sure === k, of = who ? `: ${E(String(who).replace(/^Challenger · /, '').replace(/^([^,]+)/, '$1 team'))}` : '', al = t => of ? ` aria-label="${t}${of}"` : ''; /* stress test (Nov 16): three cards' buttons had the same names; each names its team, starting with the visible words */
  return sure ? `<div class="wt-acts wt-sure" role="group" aria-label="Load this team"><span class="wt-q">Replace your current team?</span><button type="button" class="np-btn" data-wtload="${k}"><span>Replace</span></button><button type="button" class="np-btn2" data-wtx><span>Cancel</span></button></div>`
    : `<div class="wt-acts"><button type="button" class="np-btn2" data-wtask="${k}"${al('Load Team')}><span>Load Team</span></button><button type="button" class="np-btn2" data-wtcopy="${k}"${al('Copy for Showdown')}><span>Copy for Showdown</span></button><button type="button" class="np-link" data-wtvs="${k}"${al('Set as Opponent')}>Set as Opponent ›</button><button type="button" class="np-link" data-cxgo2="cur|t:${k}"${al('Compare')}>Compare ›</button></div>`; };
V2.wtTag = t => V2.wtOfficial(t) ? '<span class="wt-off">Official event</span>' : '';
// a hand: the top three of a group (place 1 big; 2 and 3 smaller)
V2.wtHand = (x, rank, sameEv) => { const {t, k} = x, E = V2.esc, g = gradeNames(t.mons), pl = V2.wtPlace(t) || rank;
  return `<article class="wt-hand r${rank}" aria-label="${E(teamWho(t))}"><header class="wt-hh"><span class="wt-no u" aria-hidden="true">${pl}</span><h3 class="u">${E(teamWho(t))}</h3>${V2.wtTag(t)}</header>
    ${sameEv ? '' : `<p class="wt-ev">${E(t.event)}</p>`}
    <div class="wt-fan">${t.mons.map((n, i) => V2.wtCard(n, rank === 1 ? 180 : 112, i)).join('')}</div>
    <p class="wt-meta">${V2.wtChecks(g, true)}${V2.wtChips(t.mons)}</p>${V2.wtActs(k, teamWho(t) + (t.event ? ', ' + V2.evTitle(t.event).replace(/ · [\d,]+ players$/, '') : ''))}</article>`; };
// a row: every team after the third
V2.wtRow = (x, sameEv) => { const {t, k} = x, E = V2.esc, g = gradeNames(t.mons), pl = V2.wtPlace(t);
  return `<article class="wt-row" aria-label="${E(teamWho(t))}"><span class="wt-no u" aria-hidden="true">${pl || ''}</span><div class="wt-six">${t.mons.map((n, i) => V2.wtCard(n, 64, i)).join('')}</div>
    <div class="wt-rt"><p class="wt-rh"><b class="u">${E(teamWho(t))}</b>${V2.wtTag(t)}</p>${sameEv ? '' : `<p class="wt-ev">${E(t.event)}</p>`}<p class="wt-names">${t.mons.map(n => E(V2.disp(n))).join(' · ')}</p>
    <p class="wt-meta">${V2.wtChecks(g, true)}${V2.wtChips(t.mons)}</p>${V2.wtActs(k, teamWho(t) + (t.event ? ', ' + V2.evTitle(t.event).replace(/ · [\d,]+ players$/, '') : ''))}</div></article>`; };
// Your Team, in the header spotlight (today's strip: checks as the Team page grades them, style chips, the six)
V2.wtYours = () => { const E = V2.esc, mine = members();
  if (mine.length !== 6) return `<div class="wt-spot"><p class="gs-tag u">Your Team</p><p class="tm-sub">Add six Pokémon on My Team to compare.</p><a class="np-btn2" href="#team"><span>Go to My Team</span></a></div>`;
  let mg = null; try { mg = proChecks(mine, true); } catch (e) { mg = gradeNames(mine.map(m => m.p.n), true); }
  return `<div class="wt-spot"><p class="gs-tag u">Your Team</p><p class="wt-big">${mg ? `<b class="u">${mg.pass}/${mg.n}</b><span><i class="u">checks</i><small>the four basics</small></span>` : ''}</p>${V2.wtChips(mine.map(m => m.p.n))}
    <p class="wt-names">${mine.map(m => E(m.d)).join(' · ')}</p><div class="wt-fan wt-mini" aria-hidden="true">${mine.map((m, i) => V2.wtCard(m.p.n, 64, i).replace('<button type="button"', '<button type="button" tabindex="-1"')).join('')}</div></div>`; };
// team search (today's TOP-02 / TOP-03): suggestions by kind and count, chips, "Often with", matching teams
V2.wtSearch = () => { const E = V2.esc, U = V2.wtUi, label = f => f.k === 'mon' ? (byName.get(f.v) || {}).d || f.v : f.v;
  const chips = U.f.length ? `<div class="wt-chipsrow">${U.f.map((f, i) => `<span class="np-chip wt-f">${f.k === 'mon' ? '' : `<i>${TS_KIND[f.k]}</i> `}${E(label(f))}<button type="button" data-tsx="${i}" aria-label="Remove ${E(label(f))}">×</button></span>`).join('')}<button type="button" class="np-link" data-tsx="*">Clear</button></div>` : '';
  return `<div class="wt-find"><label class="np-field wt-q">${V2.ICON.search}<input type="search" id="tsIn" data-wtq value="${E(U.q)}" placeholder="Search winning teams" aria-label="Search winning teams by Pokémon, item, move or ability" autocomplete="off" role="combobox" aria-expanded="${!!U.q}" aria-controls="wt-sug">${V2.CLR}</label>${V2.wtSug()}</div>${chips}`; };
V2.wtSug = () => { const E = V2.esc, U = V2.wtUi, q = norm(U.q || ''); if (!q) return '';
  const have = new Set(U.f.map(f => f.k + ':' + f.v)), r = tsTerms().filter(x => !have.has(x.k + ':' + x.v) && norm(x.label).includes(q)).sort((a, b) => (norm(b.label).startsWith(q) ? 1 : 0) - (norm(a.label).startsWith(q) ? 1 : 0) || b.c - a.c).slice(0, 8);
  return `<div class="wt-sug" id="wt-sug" role="listbox" aria-label="Matches">${r.length ? r.map((x, i) => `<button type="button" role="option" id="wt-o${i}" tabindex="-1" aria-selected="${i === 0}" class="wt-opt" data-tsk="${x.k}" data-tsv="${E(x.v)}"><span class="on">${E(x.label)}</span><span class="np-chip">${TS_KIND[x.k]}</span><small>${x.c} team${x.c === 1 ? '' : 's'}</small></button>`).join('') : '<p class="tm-sub">Nothing in the winning teams matches that.</p>'}</div>`; };
V2.wtResults = () => { const E = V2.esc, U = V2.wtUi, pool = tsPool(), hits = pool.filter(x => U.f.every(f => tsMatch(x.t, f))).sort((a, b) => (b.ev.src === 'official') - (a.ev.src === 'official') || a.t.place - b.t.place || (b.ev.date > a.ev.date ? 1 : -1));
  const cap = 8 + U.fmore * 8, c = new Map(); hits.forEach(x => new Set(x.t.mons.map(m => m.n)).forEach(n => { if (!U.f.some(f => f.k === 'mon' && f.v === n)) c.set(n, (c.get(n) || 0) + 1); }));
  const mates = [...c].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const row = x => { const ns = x.t.mons.map(m => m.n), key = x.key, of = `: ${E(String(teamWho(x.t)).replace(/^Challenger · /, ''))} team, ${E(V2.evTitle(x.ev.name))}`;
    return `<article class="wt-row" aria-label="${E(teamWho(x.t))}"><span class="wt-no u" aria-hidden="true">${x.t.place || ''}</span><div class="wt-six">${ns.map((n, i) => V2.wtCard(n, 64, i)).join('')}</div>
      <div class="wt-rt"><p class="wt-rh"><b class="u">${E(teamWho(x.t))}</b>${x.ev.src === 'official' ? '<span class="wt-off">Official event</span>' : ''}</p><p class="wt-ev">${E(V2.evTitle(x.ev.name))} · ${E(evDate(x.ev.date))} · ${x.ev.players} players</p>
      <p class="wt-names">${x.t.mons.map(m => `${E(V2.disp(m.n))}${m.i ? ` @ ${E(m.i)}` : ''}`).join(' · ')}</p>${V2.wtChips(ns)}
      ${V2.hmUi && V2.hmUi.sure === key ? V2.hmSure(key) : ''}<div class="wt-acts">${V2.hmUi && V2.hmUi.sure === key ? '' : `<button type="button" class="np-btn2" data-hmload="${E(key)}" aria-label="Load Team${of}"><span>Load Team</span></button>`}<button type="button" class="np-btn2" data-hmcopy="${E(key)}" aria-label="Copy for Showdown${of}"><span>Copy for Showdown</span></button><button type="button" class="np-link" data-hmprep="${E(key)}" aria-label="Set as Opponent${of}">Set as Opponent ›</button><button type="button" class="np-link" data-cxgo2="cur|e:${E(key)}" aria-label="Compare${of}">Compare ›</button></div></div></article>`; };
  return `<section class="wt-res" aria-live="polite"><p class="wt-cnt"><b class="u">${homeNum(hits.length)}</b>&nbsp;team${hits.length === 1 ? '' : 's'} match${hits.length ? `, ${hits.filter(x => x.t.place === 1).length} won their event` : ''}<span class="wt-pool"> · searched all ${homeNum(pool.length)} event team sheets</span></p>
    ${mates.length && hits.length >= 3 ? `<p class="wt-mates"><span>Often with:</span>${mates.map(([n, k]) => `<button type="button" class="np-chip" data-tsadd="${E(n)}">${E(V2.disp(n))}&nbsp;<b>${Math.round(100 * k / hits.length)}%</b></button>`).join('')}</p>` : ''}
    ${hits.length ? `<div class="wt-rows">${hits.slice(0, cap).map(row).join('')}</div>` : '<p class="tm-sub">No winning team has all of these. Remove a filter.</p>'}
    ${hits.length > cap ? `<button type="button" class="np-link wt-more" data-tsmore>Show More · ${hits.length - cap} left ›</button>` : ''}</section>`; };

// full sweep, Nov 15: in a fanned hand each name must fit the strip of its card left showing before the next card (at 700-768 five
// champion names ran under the next card); shrink a name 1px at a time, never below 13px. Runs after every draw (safe to repeat) and on resize.
V2.wtFit = () => { for (const fan of document.querySelectorAll('#main .wt-fan:not(.wt-mini)')) { const cards = [...fan.querySelectorAll('.wt-card')], hs = cards.map(c => c.querySelector('.mc-id h3')); hs.forEach(h => { if (h) h.style.fontSize = ''; });
  if (getComputedStyle(fan).display === 'grid' || !hs[0]) continue; const w = h => { const r = document.createRange(); r.selectNodeContents(h); return r.getBoundingClientRect().width; };
  const fs0 = parseFloat(getComputedStyle(hs[0]).fontSize), fits = i => { const h = hs[i], c = cards[i]; if (!h) return true; const nx = cards[i + 1], room = (nx ? nx.getBoundingClientRect().left : c.getBoundingClientRect().right) - h.getBoundingClientRect().left - 6; return w(h) <= room; };
  const steps = [17, 16, 15, 13].filter(x => x < fs0); cards.forEach((c, i) => { for (const st of steps) { if (!hs[i] || fits(i)) break; hs[i].style.fontSize = st + 'px'; } }); } }; /* Sim Q5 (Nov 16, B): only the name that needs it shrinks, so the rest keep the big slanted look; the sizes step down the type scale (17/16/15/13; 1px steps gave 14px) */
{ let t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (document.querySelector('#main .wt-fan')) V2.wtFit(); }, 120); }); }
V2.pages.tournaments = {place: 'meta', after() { V2.wtFit(); }, draw() { const E = V2.esc, d = META.teams, U = V2.wtUi, G = V2.wtGroups();
  if (!U.grp || !G.some(([g]) => g === U.grp)) U.grp = G.length ? G[0][0] : null;
  const tabs = `${V2.tourTabs('tournaments')}`;
  /* Nov 15 (audit #6): the header counts the top-cut list, the search looks through every event team sheet; each line now says which; re-audit nov15b #9: the group numbers are teams (32 + 58 = 90), so 'from official events', and the button says 'teams' */
  const facts = G.length ? `<p class="wt-facts"><b>${homeNum(V2.wtList().length)}</b> top-cut teams${G.map(([g, n]) => ` · <b>${n}</b> from ${/^last/i.test(g) ? 'the ' : ''}${E(g.toLowerCase())}`).join('')}</p>` : '';
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Tournaments · Winning Teams</span></p><h1 class="u"><span>The teams that</span> <span class="pl">won it.</span></h1>
    <p class="ra-lede">Top-cut teams from real tournaments. Load one, practice against it, or compare it with yours.</p>${tabs}${facts}</section>`;
  const src = d ? `<p class="fine wt-src">${E(ttSourceText(d.source))}${d.updated && V2.otherDay(new Date(d.updated).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})) ? ', updated ' + E(new Date(d.updated).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})) : ''}</p>` : '';
  const top = `<div class="gs-top wt-top">${head}<div class="ra-spotw wt-spot-w">${V2.wtYours()}</div>${tabs}</div>`;
  /* player review 2d (Nov 17): on phones and tablets the search comes first; Your Team moves under it (shown once per width) */
  const spotN = `<div class="ra-spotw wt-spot-n">${V2.wtYours()}</div>`;
  if (!G.length) return `<div class="ra gsp wt">${top}<div class="gs-body"><p class="tm-sub">Top teams appear here after the next data refresh.</p></div></div>`;
  const ctl = `<div class="wt-ctl">${V2.wtSearch()}${U.f.length ? '' : `<div class="ra-filt wt-grps" role="group" aria-label="Which teams">${G.map(([g, n]) => `<button type="button" class="ra-chip" data-wtgrp="${E(g)}" aria-pressed="${g === U.grp}">${E(g)} <b>${n}</b></button>`).join('')}</div>`}</div>${src}`;
  if (U.f.length) return `<div class="ra gsp wt">${top}<div class="gs-body">${ctl}${spotN}${V2.wtResults()}</div></div>`;
  const all = V2.wtList().filter(x => x.t.section === U.grp), three = all.slice(0, 3), evs = new Set(three.map(x => x.t.event)), same = evs.size === 1;
  const step = 6, shown = U.more ? all.slice(3, 3 + step * U.more) : [], left = all.length - 3 - shown.length;
  const hands = `<section class="wt-hands"><div class="wt-th"><h2 class="u">The Winning Hands</h2><p>${same ? `${E(three[0].t.event)}. ` : ''}Tap a card for its page.</p></div>
    ${three[0] ? V2.wtHand(three[0], 1, same) : ''}${three.length > 1 ? `<div class="wt-two">${three.slice(1).map((x, i) => V2.wtHand(x, i + 2, same)).join('')}</div>` : ''}</section>`;
  const more = all.length > 3 ? `<section class="wt-more-s">${U.more ? `<h2 class="u wt-mh">More Winning Teams</h2><div class="wt-rows">${shown.map(x => V2.wtRow(x, false)).join('')}</div>
      <p class="wt-mbtns">${left > 0 ? `<button type="button" class="np-btn2" data-wtmore><span>Show More · ${left} left</span></button>` : ''}<button type="button" class="np-link" data-wtless>Show Fewer</button></p>`
    : `<button type="button" class="np-link wt-open" data-wtmore>More Winning Teams · ${all.length} in all ›</button>`}</section>` : '';
  return `<div class="ra gsp wt">${top}<div class="gs-body">${ctl}${spotN}${hands}${more}</div></div>`; }};

// ---- actions ----
V2.wtLoad = k => { const t = META.teams && META.teams.teams[k]; if (!t) return; V2.wtUi.sure = null;
  // the same team from an event's full sheet (moves, items, abilities) when we have it (today's loadTopTeam, 18-archetypes.js)
  const sheet = sdSheetFor(t.mons, t.player); keepUndo();
  S.slots = sheet ? sheetSlots(sheet) : normSlots(t.mons.map(n => ({n, a: null, lock: false}))); S.format = 'doubles'; S.loadedId = null;
  location.hash = '#team'; render(); toast(`${teamWho(t).split(' · ')[0]}'s team loaded${sheet ? ' with its moves and items' : ''}`, true); };
document.addEventListener('click', async e => { const b = e.target.closest && e.target.closest('[data-wtask],[data-wtload],[data-wtx],[data-wtcopy],[data-wtvs],[data-wtgrp],[data-wtmore],[data-wtless],[data-tsx],[data-tsadd],[data-tsmore],.wt-opt'); if (!b) return; const d = b.dataset, U = V2.wtUi;
  if (d.wtask != null) { if (!members().length) { V2.wtLoad(+d.wtask); return; } U.sure = +d.wtask; V2.redraw(); const r = document.querySelector('[data-wtload]'); if (r) r.focus({preventScroll: true}); return; }
  if (d.wtload != null) { V2.wtLoad(+d.wtload); return; }
  if (d.wtx != null) { U.sure = null; V2.redraw(); return; }
  if (d.wtcopy != null) { const t = META.teams && META.teams.teams[+d.wtcopy]; if (!t) return; const r = sdNames(t.mons, t.player); toast((await V2.copy(r.text)) ? (r.note ? 'Team copied for Showdown. ' + r.note : 'Team copied for Showdown') : 'Copy failed. Try again.'); return; }
  if (d.wtvs != null) { const t = META.teams && META.teams.teams[+d.wtvs]; if (!t) return; V2.btSetOpp(t.mons.filter(n => byName.get(n)).slice(0, 6) /* known Pokémon only, as elsewhere (code review A1-M6) */, {who: t.player, label: teamWho(t), key: t.mons.slice().sort().join('|'), ev: evShort(t.event)}); /* Nov 15: the head said 'Vs Challenger' for a winner (no label / event) */ location.hash = '#battle'; toast(`Opponent set: ${teamWho(t)}`); return; }
  if (d.wtgrp) { U.grp = d.wtgrp; U.more = 0; U.sure = null; }
  else if (d.wtmore != null) U.more++;
  else if (d.wtless != null) { U.more = 0; const h = document.querySelector('.wt-hands'); V2.redraw(); if (h) document.querySelector('.wt-more-s')?.scrollIntoView({block: 'nearest'}); return; }
  else if (b.classList.contains('wt-opt')) { U.f.push({k: d.tsk, v: d.tsv}); U.q = ''; U.fmore = 0; V2.redraw(); const n = document.getElementById('tsIn'); if (n) n.focus(); return; }
  else if (d.tsx === '*') { U.f = []; U.fmore = 0; }
  else if (d.tsx != null) { U.f.splice(+d.tsx, 1); U.fmore = 0; }
  else if (d.tsadd) { U.f.push({k: 'mon', v: d.tsadd}); U.fmore = 0; }
  else if (d.tsmore != null) U.fmore++;
  V2.redraw(); });
document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-wtq]'); if (!i) return; V2.wtUi.q = i.value; const s = document.querySelector('.wt-sug'), w = i.closest('.wt-find');
  if (s) s.remove(); if (w) w.insertAdjacentHTML('beforeend', V2.wtSug()); V2.wtK = 0; i.setAttribute('aria-expanded', String(!!i.value)); V2.wtMark(i); });
/* audit Nov 16 (keyboard): a real combobox: Up/Down move the highlighted match (screen readers follow it), Enter picks it, Escape closes;
   the matches are not Tab stops */
V2.wtMark = i => { const os = [...document.querySelectorAll('.wt-sug .wt-opt')]; os.forEach((o, k) => o.setAttribute('aria-selected', String(k === (V2.wtK || 0))));
  const o = os[V2.wtK || 0]; if (o && i.getAttribute('aria-expanded') === 'true') { i.setAttribute('aria-activedescendant', o.id); o.scrollIntoView({block: 'nearest'}); } else i.removeAttribute('aria-activedescendant'); };
document.addEventListener('keydown', e => { const i = e.target.closest && e.target.closest('[data-wtq]'); if (!i) return;
  const os = [...document.querySelectorAll('.wt-sug .wt-opt')];
  if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && os.length) { e.preventDefault(); i.setAttribute('aria-expanded', 'true'); V2.wtK = ((V2.wtK || 0) + (e.key === 'ArrowDown' ? 1 : -1) + os.length) % os.length; V2.wtMark(i); }
  else if (e.key === 'Enter') { const o = os[V2.wtK || 0] || os[0]; if (o) { e.preventDefault(); o.click(); } }
  else if (e.key === 'Escape') { V2.wtUi.q = ''; i.value = ''; V2.wtK = 0; const s = document.querySelector('.wt-sug'); if (s) s.remove(); i.setAttribute('aria-expanded', 'false'); i.removeAttribute('aria-activedescendant'); } });
