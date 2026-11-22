// Sim Q8 (Nov 15): one tab row for the four Tournaments views, This Week added as the fourth (it was only reachable from Home's closed fold)
V2.tourTabs = on => { const T = [['tournaments', 'Winning Teams'], ['events', 'Events'], ['archetypes', 'Archetypes'], ['weekly', 'This Week']];
  return `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta">Pokémon</a><a href="#tournaments" class="on" aria-current="page">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Tournament views">${T.map(([h, t]) => `<a href="#${h}"${h === on ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}</nav></div>`; };
// ---------- Meta > Tournaments > Winning Teams, on the shared kit (Nov 22): Sim's PC mock-up "THE WINNING CREWS" (Keep as drawn, HYBRID.md) ----------
// docs/rebuild/mocks/cohesion-nov21/pages/tournaments.html on origin/claude/cohesion-mocks. Every feature of today's Winning Teams (meta-features.md
// TOP-01..07) from today's shared logic: META.teams, ttSourceText, gradeNames, proChecks, teamPlanLabel, teamWho, tsPool / tsTerms / tsMatch
// (search), sdNames (Copy for Showdown), sheetSlots (Load). The group chips are the kit's plot sentence; the page is the plan line:
// 1 the group's top team as six roster cards and the page's one pink move (USE THIS TEAM.), 2 the two runners-up as calm panels,
// 3 (after "More Winning Teams") the rest as rows in words with six small pictures. Only three teams show until asked (Sim's taste, Nov 22).
V2.wtUi = V2.wtUi || {grp: null, more: 0, sure: null, f: [], q: '', fmore: 0};
V2.wtList = () => { const d = META.teams; return d && d.teams && d.teams.length ? d.teams.map((t, k) => ({t, k})) : []; };
V2.wtGroups = () => { const g = new Map(); V2.wtList().forEach(x => g.set(x.t.section, (g.get(x.t.section) || 0) + 1)); return [...g]; };
V2.wtPlace = t => { const m = String(t.record || '').match(/#(\d+)/); return m ? +m[1] : 0; };
V2.wtOfficial = t => /official/.test(t.record || '');
V2.wtWL = t => (String(t.record || '').match(/\b(\d+-\d+(?:-\d+)?)\b/) || [])[1] || '';
V2.wtChecks = (g, long) => { if (!g) return ''; const miss = g.items.filter(x => !x.ok && !x.skip && !x.note).map(x => x.label.toLowerCase());
  return `<span class="wt-ck${g.pass === g.n ? ' all' : ''}"><b class="u">${g.pass}/${g.n}</b> checks${long && miss.length ? `, missing ${V2.esc(miss.join(', ')).replace(/ (\S+)$/, '&nbsp;$1')}` /* re-verify #14: the last word never sits alone */ : ''}</span>`; };
V2.wtChips = names => { const L = String(teamPlanLabel(names) || '').split(' · ').filter(Boolean); return L.length ? `<span class="wt-chips">${L.map(x => `<span class="wt-chip">${V2.esc(x)}</span>`).join('')}</span>` : ''; }; /* today's style names (teamPlanLabel), as plain chips (Events' placings use these) */
// one Card (Events' placings still draw it): tap opens the Pokémon's info sheet (as everywhere a Card is shown)
V2.wtCard = (n, iw, i) => { const p = byName.get(n); if (!p) return ''; const d = V2.disp(n);
  return `<button type="button" class="wt-card" style="--i:${i}" data-v2mon="${V2.esc(n)}" aria-label="${V2.esc(d)}: open its page">${V2.msCard(p, n, `<h3 class="u">${V2.nameHtml(d)}</h3>`, '', iw)}</button>`; };
// the kit's look for a team's checks and styles: "3/4 checks" big, what is missing in grey, the style names as the kit's neutral tags
// (not blue: blue is only for taps, HYBRID 3)
V2.wtPl = (g, names, cls = '') => { const E = V2.esc, miss = g ? g.items.filter(x => !x.ok && !x.skip && !x.note).map(x => x.label.toLowerCase()) : [], L = String(teamPlanLabel(names) || '').split(' · ').filter(Boolean);
  return `<p class="wt2-pl${cls}">${g ? `<b class="u">${g.pass}/${g.n} checks</b>${miss.length ? `<span class="wt2-miss">missing ${E(miss.join(', ')).replace(/ (\S+)$/, '&nbsp;$1')}</span>` : ''}` : ''}${L.length ? `<span class="wt2-tags">${L.map(x => V2.kTag('neutral', x)).join('')}</span>` : ''}</p>`; };
// six small pictures, each the tap to its Pokémon's page (the names are written under them in words)
V2.wtSix = (names, iw, cls = '') => `<div class="wt2-six${cls}">${names.map(n => byName.get(n) ? `<button type="button" class="wt2-m" data-v2mon="${V2.esc(n)}" aria-label="${V2.esc(V2.disp(n))}: open its page">${V2.mon(n, {iw, bare: true})}</button>` : '').join('')}</div>`;
V2.wtNames = names => `<p class="wt-names">${names.map(n => V2.esc(V2.disp(n))).join('&nbsp;· ')}</p>`; /* a line never starts with the dot */
// a team's actions: the top team's is the page's one pink move (USE THIS TEAM., THEME 2.5); the others keep today's Load Team.
// Copy for Showdown stays on the page, so it has no "›"; Set as Opponent and Compare go somewhere, so they do.
V2.wtActs = (k, who, mode) => { const E = V2.esc, sure = V2.wtUi.sure === k, of = who ? `: ${E(String(who).replace(/^Challenger · /, '').replace(/^([^,]+)/, '$1 team'))}` : '', al = t => of ? ` aria-label="${t}${of}"` : ''; /* stress test (Nov 16): three cards' buttons had the same names; each names its team, starting with the visible words */
  if (mode === 'btn') return sure ? '' : `<button type="button" class="np-btn2" data-wtask="${k}"${al('Load Team')}><span>Load Team</span></button>`;
  if (sure) return `<div class="wt-acts wt-sure wt2-acts" role="group" aria-label="Load this team"><span class="wt-q">Replace your current team?</span><button type="button" class="np-btn" data-wtload="${k}"><span>Replace</span></button><button type="button" class="np-btn2" data-wtx><span>Cancel</span></button></div>`;
  const links = `<p class="wt2-links"><button type="button" class="np-link k-link" data-wtcopy="${k}"${al('Copy for Showdown')}>Copy for Showdown</button><button type="button" class="np-link k-link" data-wtvs="${k}"${al('Set as Opponent')}>Set as Opponent&nbsp;›</button><button type="button" class="np-link k-link" data-cxgo2="cur|t:${k}"${al('Compare')}>Compare&nbsp;›</button></p>`;
  if (mode === 'links') return links;
  return mode === 'go' ? `<div class="wt2-go">${V2.kGo('USE THIS TEAM.', {'data-wtask': k, 'aria-label': 'Use This Team' + (who ? ': ' + String(who).replace(/^Challenger · /, '').replace(/^([^,]+)/, '$1 team') : '')} /* kAttrs escapes it */)}${links}</div>`
    : `<div class="wt2-acts"><button type="button" class="np-btn2" data-wtask="${k}"${al('Load Team')}><span>Load Team</span></button>${links}</div>`; };
V2.wtEv = t => V2.esc(t.event || '') + (V2.wtOfficial(t) ? ' · official event' : ''); /* plain words, not a blue tag: blue is only for taps (HYBRID 3) */
V2.wtWho = t => teamWho(t) + (t.event ? ', ' + V2.evTitle(t.event).replace(/ · [\d,]+ players$/, '') : '');
// step 1: the group's top team, its six as roster cards (6 across on desktop, 3 x 2 on phones)
V2.wtTop = (x, sameEv) => { const {t, k} = x, E = V2.esc, pl = V2.wtPlace(t) || 1, wl = V2.wtWL(t), g = gradeNames(t.mons);
  const note = [t.event, wl ? wl + ' record' : '', V2.wtOfficial(t) ? 'official event' : ''].filter(Boolean).join(' · ');
  const cards = V2.kRoster(t.mons.filter(n => byName.get(n)).map(n => V2.kCard(n, {attrs: {'data-v2mon': n, 'aria-label': `${V2.disp(n)}: open its page`}})));
  return V2.kStep(1, pl === 1 ? 'The champion.' : `The ${ordTxt(pl)} place team.`, note, `<article class="wt2-top" aria-label="${E(teamWho(t))}">${cards}<p class="k-hint wt2-tap">Tap a card for its page.</p>${V2.wtPl(g, t.mons, ' big')}${V2.wtActs(k, V2.wtWho(t), 'go')}</article>`); };
// step 2: the next two, as calm panels side by side (stacked on phones)
V2.wtRun = (x, sameEv) => { const {t, k} = x, E = V2.esc, g = gradeNames(t.mons);
  return `<article class="wt2-run" aria-label="${E(teamWho(t))}"><header class="wt2-rh"><h3 class="u">${E(teamWho(t)).replace(/ · /g, '&nbsp;· ')}</h3>${V2.wtActs(k, V2.wtWho(t), 'btn')}</header>${sameEv ? '' : `<p class="wt2-ev">${V2.wtEv(t)}</p>`}
    ${V2.wtSix(t.mons, 52)}${V2.wtNames(t.mons)}${V2.wtPl(g, t.mons)}${V2.wtActs(k, V2.wtWho(t), 'links')}</article>`; };
// step 3 (after More Winning Teams): every team after the third, as rows in words with six small pictures
V2.wtRow = x => { const {t, k} = x, E = V2.esc, g = gradeNames(t.mons), pl = V2.wtPlace(t);
  return `<article class="wt2-row" aria-label="${E(teamWho(t))}"><span class="wt2-no u" aria-hidden="true">${pl || ''}</span><div class="wt2-rt"><p class="wt2-rhd"><b class="u">${E(teamWho(t))}</b></p><p class="wt2-ev">${V2.wtEv(t)}</p>${V2.wtSix(t.mons, 40, ' sm')}${V2.wtNames(t.mons)}${V2.wtPl(g, t.mons)}${V2.wtActs(k, V2.wtWho(t), 'row')}</div></article>`; };
// Your Team, in the header spotlight (today's strip: checks as the Team page grades them, style names, the six)
V2.wtYours = () => { const E = V2.esc, mine = members();
  if (mine.length !== 6) return `<div class="wt-spot wt2-yours"><p class="gs-tag u">Your Team</p><p class="tm-sub">Add six Pokémon on My Team to compare.</p><a class="np-btn2" href="#team"><span>Go to My Team</span></a></div>`;
  let mg = null; try { mg = proChecks(mine, true); } catch (e) { mg = gradeNames(mine.map(m => m.p.n), true); }
  const L = String(teamPlanLabel(mine.map(m => m.p.n)) || '').split(' · ').filter(Boolean);
  return `<div class="wt-spot wt2-yours"><p class="gs-tag u">Your Team</p><p class="wt2-yrec">${mg ? `<b class="u">${mg.pass}/${mg.n}</b> <span>checks · the four basics</span>` : ''}${L.length ? `<span class="wt2-tags">${L.map(x => V2.kTag('neutral', x)).join('')}</span>` : ''}</p>
    <div class="wt2-six sm" aria-hidden="true">${mine.map(m => V2.mon(m.p.n, {iw: 40, bare: true})).join('')}</div><p class="wt-names">${mine.map(m => E(m.d)).join('&nbsp;· ')}</p></div>`; };
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
  const row = x => { const ns = x.t.mons.map(m => m.n), key = x.key, of = `: ${E(String(teamWho(x.t)).replace(/^Challenger · /, ''))} team, ${E(V2.evTitle(x.ev.name))}`, sure = V2.hmUi && V2.hmUi.sure === key;
    return `<article class="wt2-row" aria-label="${E(teamWho(x.t))}"><span class="wt2-no u" aria-hidden="true">${x.t.place || ''}</span>
      <div class="wt2-rt"><p class="wt2-rhd"><b class="u">${E(teamWho(x.t))}</b></p><p class="wt2-ev">${E(V2.evTitle(x.ev.name))} · ${E(evDate(x.ev.date))} · ${x.ev.players} players${x.ev.src === 'official' ? ' · official event' : ''}</p>${V2.wtSix(ns, 40, ' sm')}
      <p class="wt-names">${x.t.mons.map(m => `${E(V2.disp(m.n))}${m.i ? ` @ ${E(m.i)}` : ''}`).join(' · ')}</p>${V2.wtPl(null, ns)}
      ${sure ? V2.hmSure(key) : ''}<div class="wt2-acts">${sure ? '' : `<button type="button" class="np-btn2" data-hmload="${E(key)}" aria-label="Load Team${of}"><span>Load Team</span></button>`}<p class="wt2-links"><button type="button" class="np-link k-link" data-hmcopy="${E(key)}" aria-label="Copy for Showdown${of}">Copy for Showdown</button><button type="button" class="np-link k-link" data-hmprep="${E(key)}" aria-label="Set as Opponent${of}">Set as Opponent&nbsp;›</button><button type="button" class="np-link k-link" data-cxgo2="cur|e:${E(key)}" aria-label="Compare${of}">Compare&nbsp;›</button></p></div></div></article>`; };
  const note = hits.length ? `${hits.filter(x => x.t.place === 1).length} won their event` : '';
  return `<section class="wt-res" aria-live="polite"><p class="wt-cnt"><b class="u">${homeNum(hits.length)}</b>&nbsp;team${hits.length === 1 ? '' : 's'} match${note ? ', ' + note : ''}<span class="wt-pool"> · searched all ${homeNum(pool.length)} event team sheets</span></p>
    ${mates.length && hits.length >= 3 ? `<p class="wt-mates"><span>Often with:</span>${mates.map(([n, k]) => `<button type="button" class="np-chip" data-tsadd="${E(n)}">${E(V2.disp(n))}&nbsp;<b>${Math.round(100 * k / hits.length)}%</b></button>`).join('')}</p>` : ''}
    ${hits.length ? `<div class="wt2-rows">${hits.slice(0, cap).map(row).join('')}</div>` : '<p class="tm-sub">No winning team has all of these. Remove a filter.</p>'}
    ${hits.length > cap ? `<button type="button" class="np-link wt-more" data-tsmore>Show More · ${hits.length - cap} left ›</button>` : ''}</section>`; };

V2.pages.tournaments = {place: 'meta', draw() { const E = V2.esc, d = META.teams, U = V2.wtUi, G = V2.wtGroups();
  if (!U.grp || !G.some(([g]) => g === U.grp)) U.grp = G.length ? G[0][0] : null;
  const tabs = `${V2.tourTabs('tournaments')}`;
  /* Nov 15 (audit #6): the header counts the top-cut list, the search looks through every event team sheet; each line now says which; re-audit nov15b #9: the group numbers are teams (32 + 58 = 90), so 'from official events', and the button says 'teams' */
  const facts = G.length ? `<p class="wt-facts"><b>${homeNum(V2.wtList().length)}</b> top-cut teams${G.map(([g, n]) => ` · <b>${n}</b> from ${/^last/i.test(g) ? 'the ' : ''}${E(g.toLowerCase())}`).join('')}</p>` : '';
  /* the Meta pages' shared header (eyebrow, headline, intro, then the Pokémon / Tournaments tabs: v2-minors measures it on every Meta page);
     the eyebrow is the kit's kicker chip, "SECTION · THE PLAN-NAME" (THEME 2.2) */
  const head = `<section class="ra-h"><p class="np-eyebrow wt2-kick"><span>META · THE WINNING CREWS</span></p><h1 class="u"><span>The teams that</span> <span class="pl">won it.</span></h1>
    <p class="ra-lede">Top-cut teams from real tournaments. Load one, practice against it, or compare it with yours.</p>${tabs}${facts}</section>`;
  const src = d ? `${E(ttSourceText(d.source))}${d.updated && V2.otherDay(new Date(d.updated).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})) ? ', updated ' + E(new Date(d.updated).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})) : ''}` : '';
  const top = `<div class="gs-top wt-top">${head}<div class="ra-spotw wt-spot-w">${V2.wtYours()}</div>${tabs}</div>`;
  /* player review 2d (Nov 17): on phones and tablets the search comes first; Your Team moves under it (shown once per width) */
  const spotN = `<div class="ra-spotw wt-spot-n">${V2.wtYours()}</div>`;
  if (!G.length) return `<div class="ra gsp wt wt2">${top}<div class="gs-body"><p class="tm-sub">Top teams appear here after the next data refresh.</p></div></div>`;
  /* the group chips as the kit's plot sentence (Show me [Official events · 32] [Last 7 days · 58]), the search right under it */
  const sent = U.f.length ? '' : V2.kSent(['Show me', ...G.map(([g, n]) => ({w: `${g} · ${n}`, on: g === U.grp, attrs: {'data-wtgrp': g}}))], {label: 'Which teams', hint: false});
  const ctl = `<div class="wt2-ctl">${sent}<div class="wt2-find">${U.f.length ? '' : '<span class="k-sent u wt2-or">or search</span>'}${V2.wtSearch()}</div>${src ? `<p class="k-hint wt-src">${U.f.length ? '' : 'Blue words are buttons. '}${src}</p>` : ''}</div>`;
  if (U.f.length) return `<div class="ra gsp wt wt2">${top}<div class="gs-body">${ctl}${spotN}${V2.kPlan(V2.kStep(1, 'The matches.', 'every event team sheet with all of these', V2.wtResults()))}</div></div>`;
  const all = V2.wtList().filter(x => x.t.section === U.grp), three = all.slice(0, 3), evs = new Set(three.map(x => x.t.event)), same = evs.size === 1;
  const step = 6, shown = U.more ? all.slice(3, 3 + step * U.more) : [], left = all.length - 3 - shown.length;
  const s1 = three[0] ? V2.wtTop(three[0], same) : '';
  const moreLink = all.length > 3 && !U.more ? `<button type="button" class="np-link k-link wt-open" data-wtmore>More Winning Teams · ${all.length} in all&nbsp;›</button>` : '';
  const s2 = three.length > 1 ? V2.kStep(2, three.length > 2 ? 'The runners-up.' : 'The runner-up.', same ? 'same tournament' : 'the next teams in the list', `<div class="wt2-two">${three.slice(1).map(x => V2.wtRun(x, same)).join('')}</div>`)
    .replace(/(<div class="k-sec">[\s\S]*?)<\/div>/, (m, a) => a + moreLink + '</div>') : '';
  const s3 = U.more ? V2.kStep(3, 'More Winning Teams', `${3 + shown.length} of ${all.length} shown`, `<div class="wt2-rows">${shown.map(V2.wtRow).join('')}</div>
      <p class="wt-mbtns">${left > 0 ? `<button type="button" class="np-btn2" data-wtmore><span>Show More · ${left} left</span></button>` : ''}<button type="button" class="np-link k-link" data-wtless>Show Fewer</button></p>`) : '';
  const lone = three.length === 1 && moreLink ? `<p class="wt2-lone">${moreLink}</p>` : '';
  return `<div class="ra gsp wt wt2">${top}<div class="gs-body">${ctl}${spotN}${V2.kPlan(s1 + s2 + lone + s3)}</div></div>`; }};

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
  else if (d.wtless != null) { U.more = 0; V2.redraw(); document.querySelector('#main .wt2-two')?.scrollIntoView({block: 'nearest'}); return; }
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
