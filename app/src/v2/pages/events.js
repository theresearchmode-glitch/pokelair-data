// Nov 15: every event name shown here goes through the shared cleaner V2.evTitle (raw names had emoji and prize text, up to 9 lines at 320)
// ---------- Meta > Tournaments > Events (Nov 15): Sim's pick "The Ticket Wall" (docs/rebuild/mocks/tournaments-tickets-weather/BRIEF.md) ----------
// Everything today's Events tab does (49-events.js renderEvents + 63-weekly.js calendarHTML), from the same shared helpers and data:
// META.events (evDate, placeTxt, evTeam, sheetSlots, sdNames), META.calendar (CAL), teamWho, teamPlanLabel. The three counts and
// "What counts as an event?", Next Events, the All / Official / 100+ players filter, every event with its date, player count, name and
// winner's six, an event opened to its placings, and Show More. Same order (newest first), same numbers.
// Each event is a ticket stub (V2.ticket, shared with This Week's winners): its colours are the type colours of the winner's first
// Pokémon (our --ty-* tokens, each measured 4.6:1 or better with white text), an official event's ticket is gold.
V2.evUi = V2.evUi || {open: null, filter: 'all', more: 0, sure: null, sets: {}, cal: false};
V2.evSrc = x => { x = String(x || ''); const m = x.match(/Limitless \((\d+)\+ players, last (\d+) days, top (\d+)\)/), o = x.match(/official events \(top (\d+)\)/);
  return m ? `Online tournaments with ${m[1]}+ players from the last ${m[2]} days (top ${m[3]})${o ? ` and official events (top ${o[1]})` : ''}.` : x; }; // today's evSourceText words
V2.evTy = n => { const p = byName.get(n), t = (p && p.t) || [], a = V2.TYPES.includes(t[0]) ? t[0] : 'Normal', b = V2.TYPES.includes(t[1]) ? t[1] : a; return `--ta:var(--ty-${a});--tb:var(--ty-${b})`; };
V2.evMonth = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {month: 'short'}); } catch (e) { return ''; } };
V2.evDay = d => { try { return new Date(d + 'T12:00:00').getDate(); } catch (e) { return ''; } };
// one ticket. big: the latest result across the wall. The five other Pokémon are pictures here; their names are in the label and the placings.
V2.ticket = (ev, big) => { const E = V2.esc, w = ev.top[0], ns = w ? w.mons.map(m => m.n) : [], off = ev.src === 'official', lead = ns[0], rest = ns.slice(1);
  const say = `${V2.evTitle(ev.name)}, ${evDate(ev.date)}, ${homeNum(ev.players)} players${off ? ', official event' : ''}. Winner's team: ${ns.map(n => V2.disp(n)).join(', ')}.`;
  const k = `<span class="tk-k">${off ? '<b>Official event</b> · ' : ''}Winner's team</span>`;
  const stub = `<span class="tk-stub" aria-hidden="true"><small class="tk-mo">${E(V2.evMonth(ev.date))}</small><b class="u">${V2.evDay(ev.date)}</b><small>${homeNum(ev.players)} players</small><i class="tk-bar"></i></span>`;
  const hero = `<span class="tk-hero" aria-hidden="true">${lead ? V2.mon(lead, {bare: true}) : ''}<b class="tk-seal u">1st</b>${big && lead ? `<span class="tk-ln u">${E(V2.disp(lead))}</span>` : ''}</span>`;
  if (!big) return `<button type="button" class="tk${off ? ' off' : ''}" style="${V2.evTy(lead)}" data-evgo="${E(ev.id)}" aria-label="${E(say)} Open the placings.">${hero}
    <span class="tk-mid" aria-hidden="true">${k}<b class="tk-name u">${E(V2.evTitle(ev.name)).replace(/\b([A-Z])-([A-Z])\b/g, '$1-⁠$2')}</b></span><span class="tk-five" aria-hidden="true">${rest.map(n => V2.mon(n, {bare: true})).join('')}</span>${stub}</button>`;
  return `<article class="tk big${off ? ' off' : ''}" style="${V2.evTy(lead)}" data-evgo="${E(ev.id)}" aria-label="Latest result. ${E(say)}">${hero}
    <div class="tk-mid"><span class="tk-tag u">Latest result</span>${k}<h3 class="tk-name u">${E(V2.evTitle(ev.name))}</h3>
      <ul class="tk-five">${rest.map(n => `<li>${V2.mon(n, {bare: true})}<span>${E(V2.disp(n)).replace(/ (\S{1,2})$/, '\u00a0$1')}</span></li>`).join('')}</ul>
      <button type="button" class="tk-go" data-evgo="${E(ev.id)}">See the placings, 1st to ${placeTxt(ev.top.length)} ›</button></div>${stub}</article>`; };
// Next Events (today's calendarHTML: the next events with a countdown, Show all, the recent official ones with results, the source)
V2.evCal = () => { const C = META.calendar, E = V2.esc;
  if (!C || typeof CAL === 'undefined') return '<p class="ev-none">The event calendar appears after the next data refresh.</p>';
  const t = CAL.today(), next = C.ev.filter(e => e.e >= t && e.t !== 'national'), past = C.ev.filter(e => e.e < t && ['regional', 'sc', 'international', 'worlds'].includes(e.t)).slice(-3).reverse();
  const shown = V2.evUi.cal ? next : next.slice(0, 2) /* two, so the plate stays level with the headline (audit: an empty strip beside a tall plate) */, age = C.checked ? CAL.days(t, C.checked) : 0;
  const row = e => { const [k, w] = CAL.when(e), d = new Date(e.s + 'T12:00:00'), place = e.t === 'online' ? '' : [e.city !== e.n ? e.city : '', CAL.country(e.cc)].filter(Boolean).join(', ');
    const inner = `<span class="ev-cd" aria-hidden="true"><b class="u">${d.getDate()}</b><small>${d.toLocaleDateString('en-US', {month: 'short'})}</small></span><span class="ev-cm"><b>${E(e.n)}</b><small>${E(CAL.range(e))}${place ? ' · ' + E(place) : ''}${e.n.toLowerCase().includes(CAL.type[e.t].toLowerCase()) ? '' : ' · ' + CAL.type[e.t]}</small></span><span class="ev-cw ${k}">${w}</span>`;
    return `<li>${e.url ? `<a class="ev-crow" href="${E(e.url)}" target="_blank" rel="noopener" aria-label="${E(e.n)}, ${E(CAL.range(e))}, ${w}: details (opens a new tab)">${inner}</a>` : `<span class="ev-crow">${inner}</span>`}</li>`; };
  const pastH = past.length ? `<p class="ev-cpast">Recent: ${past.map(e => { const r = CAL.results(e); return r ? `<button type="button" class="np-link" data-evgo="${E(r.id)}">${E(e.n)} Results ›</button>` : `<span>${E(e.n)} · results not in yet</span>`; }).join('')}</p>` : '';
  return `${shown.length ? `<ul class="ev-cal">${shown.map(row).join('')}</ul>` : '<p class="ev-none">No upcoming events listed right now.</p>'}
    ${next.length > shown.length || V2.evUi.cal ? `<button type="button" class="np-link ev-call" data-evcal aria-expanded="${V2.evUi.cal}">${V2.evUi.cal ? 'Show Fewer' : `Show All ${next.length} ›`}</button>` : ''}${pastH}
    <p class="fine ev-csrc">From <a href="${E(C.src.url || 'https://victoryroad.pro/')}" target="_blank" rel="noopener">${E(C.src.name)}</a>${C.checked ? `, checked ${E(evDate(C.checked))}${age > 2 ? ` (${age} days ago)` : ''}` : ''}. VGC days, in each event's local dates.</p>`; };
// the plate at the top right: counted this regulation, what counts, Next Events
V2.evPlate = () => { const E = META.events, ev = E ? E.events : [], on = ev.filter(e => e.src !== 'official').length, off = ev.length - on;
  const cell = (v, l) => `<span class="ev-n"><b class="u">${homeNum(v)}</b><small>${l}</small></span>`;
  return `<aside class="ev-plate" aria-label="Next events"><h2 class="u ev-ph">Next Events</h2>${V2.evCal()}</aside>`; };
/* say it once (Nov 16, re-verify #2): the counts sit under the headline (they were said twice, and the left column stood half empty beside the tall plate) */
V2.evCounts = () => { const E = META.events, ev = E ? E.events : [], on = ev.filter(e => e.src !== 'official').length, off = ev.length - on;
  const cell = (v, l) => `<span class="ev-n"><b class="u">${homeNum(v)}</b><small>${l}</small></span>`;
  return E ? `<div class="ev-counts"><p class="ev-pk u">Counted this regulation</p><p class="ev-ns" role="group" aria-label="Events counted">${cell(ev.length, 'events')}${off ? cell(on, 'online') + cell(off, 'official') : ''}</p>
    <details class="ev-what"><summary>What counts as an event?</summary><p>${V2.esc(V2.evSrc(E.source))}</p></details></div>` : ''; };
// an event opened: its placings, each with today's actions (Load Team, Sets, Set as Opponent, Compare, Copy for Showdown)
V2.evActs = key => { const E = V2.esc, U = V2.evUi, sure = U.sure === key, open = !!U.sets[key];
  return sure ? `<div class="wt-acts wt-sure" role="group" aria-label="Load this team"><span class="wt-q">Replace your current team?</span><button type="button" class="np-btn" data-evload="${E(key)}"><span>Replace</span></button><button type="button" class="np-btn2" data-evx><span>Cancel</span></button></div>`
    : `<div class="wt-acts"><button type="button" class="np-btn2" data-evask="${E(key)}"><span>Load Team</span></button><button type="button" class="np-btn2" data-evcopy="${E(key)}"><span>Copy for Showdown</span></button><button type="button" class="np-link" data-evsets="${E(key)}" aria-expanded="${open}">${open ? 'Hide Sets' : 'Sets'}</button><button type="button" class="np-link" data-evvs="${E(key)}">Set as Opponent ›</button><button type="button" class="np-link" data-cxgo2="cur|e:${E(key)}">Compare ›</button></div>`; };
V2.evRow = (ev, t, i) => { const E = V2.esc, key = ev.id + '#' + i, ns = t.mons.map(m => m.n), open = !!V2.evUi.sets[key];
  const sets = open ? `<ul class="ev-sets">${t.mons.map(m => { const p = byName.get(m.n); return p ? `<li>${V2.mon(m.n, {iw: 56, bare: true})}<div><b>${E(p.d)}</b>${m.i ? ` @ ${E(m.i)}` : ''}<small>${E(m.a || '')}${m.nt ? ' · ' + E(m.nt) : ''}</small><span>${(m.mv || []).map(E).join(' · ')}</span></div></li>` : ''; }).join('')}</ul>` : '';
  return `<article class="wt-row ev-row" aria-label="${E(placeTxt(t.place || i + 1))}: ${E(teamWho(t))}"><span class="wt-no u ev-pl p${Math.min(t.place || i + 1, 4)}" aria-hidden="true">${E(placeTxt(t.place || i + 1))}</span>
    <div class="wt-six">${ns.map((n, j) => V2.wtCard(n, 64, j)).join('')}</div>
    <div class="wt-rt"><p class="wt-rh"><b class="u">${E(teamWho(t))}</b></p><p class="wt-names">${ns.map(n => E(V2.disp(n))).join(' · ')}</p><p class="wt-meta">${V2.wtChips(ns)}</p>${sets}${V2.evActs(key)}</div></article>`; };
V2.evOpen = ev => { const E = V2.esc, off = ev.src === 'official';
  const field = ev.field && ev.field.length ? `<section class="ev-field"><h3 class="u">Most brought by the whole field</h3><p class="fine">Of ${homeNum(ev.players)} players</p><ul>${ev.field.map(([n, pc]) => { const p = byName.get(n); return p ? `<li><button type="button" class="ev-fm" data-v2mon="${E(n)}" aria-label="${E(p.d)}, ${E(pctTxt(pc))} of players: open its page">${V2.mon(n, {iw: 48, bare: true})}<span>${E(p.d)}</span><b class="u">${E(pctTxt(pc))}</b></button></li>` : ''; }).join('')}</ul></section>` : '';
  return `<section class="ev-open wt"><button type="button" class="np-link ev-back" data-evback>‹ All Events</button>
    <header class="ev-oh" style="${V2.evTy(ev.top[0] && ev.top[0].mons[0] && ev.top[0].mons[0].n)}"><div><p class="tk-k">${off ? '<b>Official event</b> · ' : ''}${E(evDate(ev.date))} · ${homeNum(ev.players)} players</p><h2 class="u">${E(V2.evTitle(ev.name))}</h2>
      <p class="ev-osub">${off ? 'Official Pokémon event (Victory Road)' : 'Online (Limitless)'} · top ${ev.top.length}</p></div></header>${field}
    <h3 class="u ev-plh">The Placings, 1st to ${placeTxt(ev.top.length)}</h3><div class="wt-rows ev-rows">${ev.top.map((t, i) => V2.evRow(ev, t, i)).join('')}</div></section>`; };
V2.pages.events = {place: 'meta', draw() { const E = V2.esc, D = META.events, U = V2.evUi;
  const tabs = `${V2.tourTabs('events')}`;
  const ev = D ? D.events : [], on = ev.filter(e => e.src !== 'official').length;
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Tournaments · Events</span></p><h1 class="u"><span>Every result,</span> <span class="pl">event by event.</span></h1>
    <p class="ra-lede">Recent tournaments and who won them, with every top-cut team sheet inside.</p>${D ? V2.evCounts() : ''}</section>`;
  const top = `<div class="gs-top wt-top ev-top">${head}<div class="ra-spotw">${V2.evPlate()}</div></div>`;
  if (!D) return `<div class="ra gsp ev">${top}${tabs}<div class="gs-body"><p class="tm-sub">Tournament results appear here after the next data refresh.</p></div></div>`;
  const opened = U.open && ev.find(e => e.id === U.open);
  if (opened) return `<div class="ra gsp ev">${top}${tabs}<div class="gs-body">${V2.evOpen(opened)}</div></div>`;
  let list = ev; if (U.filter === 'official') list = list.filter(e => e.src === 'official'); else if (U.filter === 'big') list = list.filter(e => e.players >= 100);
  const cap = 13 + U.more * 12, shown = list.slice(0, cap), small = shown.slice(1);
  const n = {all: ev.length, official: ev.filter(e => e.src === 'official').length, big: ev.filter(e => e.players >= 100).length};
  const seg = `<div class="ev-f" role="group" aria-label="Which events">${[['all', 'All'], ['official', 'Official'], ['big', '100+ players']].map(([k, t]) => `<button type="button" class="np-chip ev-fc" data-evf="${k}" aria-pressed="${U.filter === k}">${t}<small>${n[k]}</small></button>`).join('')}</div>`;
  /* the two-column wall keeps every row full: an odd last ticket runs the full width (filters can leave an odd count) */
  const wall = shown.length ? `${V2.ticket(shown[0], true)}<div class="tk-wall${small.length % 2 ? ' odd' : ''}">${small.map(e => V2.ticket(e)).join('')}</div>` : '<p class="tm-sub">No events here yet.</p>';
  return `<div class="ra gsp ev">${top}${tabs}<div class="gs-body"><section class="ev-wall"><header class="ev-wh"><h2 class="u">The Ticket Wall</h2><p>Newest first. Each ticket shows the winner's six, the winner's first Pokémon up front. Tap a ticket for the event's placings.</p></header>
    ${seg}${wall}${list.length > cap ? `<button type="button" class="np-link ev-more" data-evmore>Show More · ${list.length - cap} left ›</button>` : ''}</section></div></div>`; }};
// bring an opened event (or, on the way back, its card) just under the sticky header, once the page has drawn
V2.evScrollTo = sel => { let n = 0; const go = () => { const el = document.querySelector(sel); if (!el) { if (++n < 20) requestAnimationFrame(go); return; } const h = (document.querySelector('.np-head') || {}).offsetHeight || 0; scrollTo({top: Math.max(0, el.getBoundingClientRect().top + scrollY - h - 16)});
  const f = el.matches('button,a[href]') ? el : el.querySelector('[data-evback], button, a[href]'); if (f) f.focus({preventScroll: true}); }; requestAnimationFrame(go); }; /* focus follows: '‹ All Events' when an event opens, the card's button on the way back (sweep, Nov 15) */
document.addEventListener('click', async e => { const b = e.target.closest && e.target.closest('[data-evgo],[data-evback],[data-evf],[data-evmore],[data-evcal],[data-evask],[data-evload],[data-evx],[data-evcopy],[data-evsets],[data-evvs]'); if (!b) return; const d = b.dataset, U = V2.evUi;
  if (d.evgo) { U.open = d.evgo; U.sure = null; if (location.hash !== '#events') location.hash = '#events'; else V2.redraw(); V2.evScrollTo('.ev-open'); return; } /* function sweep, Nov 15: was scrollTo top, which left the opened results off screen on phones */
  if (d.evback != null) { const was = U.open; U.open = null; U.sure = null; V2.redraw(); if (was) V2.evScrollTo(`[data-evgo="${CSS.escape(was)}"]`); return; }
  if (d.evf) { U.filter = d.evf; U.more = 0; }
  else if (d.evmore != null) U.more++;
  else if (d.evcal != null) U.cal = !U.cal;
  else if (d.evsets) U.sets[d.evsets] = !U.sets[d.evsets];
  else if (d.evx != null) U.sure = null;
  else if (d.evask || d.evload) { const x = evTeam(d.evask || d.evload); if (!x) return;
    if (d.evask && members().length) { U.sure = d.evask; V2.redraw(); const r = document.querySelector('[data-evload]'); if (r) r.focus({preventScroll: true}); return; }
    U.sure = null; keepUndo(); S.slots = sheetSlots(x.t); S.format = 'doubles'; S.loadedId = null; location.hash = '#team'; render(); toast(`${teamWho(x.t).split(' · ')[0]}'s team loaded with its moves and items`, true); return; }
  else if (d.evcopy) { const x = evTeam(d.evcopy); if (!x) return; const r = sdNames(x.t.mons.map(m => m.n), x.t.player); toast((await V2.copy(r.text)) ? (r.note ? 'Team copied for Showdown. ' + r.note : 'Team copied for Showdown') : 'Copy failed. Try again.'); return; }
  else if (d.evvs) { const x = evTeam(d.evvs); if (!x) return; const ns = x.t.mons.map(m => m.n); V2.btSetOpp(ns, {who: x.t.player, label: teamWho(x.t), key: ns.slice().sort().join('|'), ev: evShort(x.ev.name)}); location.hash = '#battle'; toast(`Opponent set: ${teamWho(x.t)}`); return; }
  V2.redraw(); });
// a ticket is a button except the latest result, which is an article with its own button; a tap anywhere on it opens the placings too
/* code review C8: a tap on a ticket's body is handled by the [data-evgo] listener above (the card carries it); a second listener here clicked its button too: two redraws, two scrolls */
