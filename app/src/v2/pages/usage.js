// ---------- Meta > Pokémon > Usage (Nov 14): "Who gets picked right now." (Sim's Grandstand brief, section 4) ----------
// The Podium (1, 2, 3 on blocks; 4 to 10 on benches), "How <Pokémon> is played" (bars), "Usually alongside", Add to team, Ranks 11–60.
// Every feature of today's Usage (meta-features.md META-01..07) is here, from today's shared logic: SRC / META (the source), setFor +
// setBasis + basis (the bars and "Of N teams"), trendFor (badges), V2.addToTeam.
/* Q13 A (Sim, Nov 19): Usage opens on Online tournaments (updates daily), back to it on a reload; Ranked ladder is one tap away. Usage keeps
   its own source (V2.usUi.src) so that opening it changes nothing elsewhere: the site-wide ui.metaSrc (sets, ratings, threats on every other
   page) still starts on Ranked ladder. Tapping a chip still sets ui.metaSrc as well, as it did before. */
V2.usUi = {q: '', pick: null, all: false, src: 'tour', open: {}};
V2.usDoc = () => META[SRC[V2.usUi.src]];
// shared helpers that read ui.metaSrc (trendFor's badges) see Usage's own source while they run, then it is put back
V2.usAs = f => { const g = ui.metaSrc; ui.metaSrc = V2.usUi.src; try { return f(); } finally { ui.metaSrc = g; } };
V2.usSrcs = [['ingame', 'Ranked ladder'], ['tour', 'Online tournaments'], ['ladder', 'Showdown ladder']]; // today's order (parity, Nov 15)
V2.usLine = d => { const per = d.period && !String(d.source).includes(d.period) ? ' · ' + (/^\d{4}-\d{2}$/.test(d.period) ? new Date(d.period + '-15T12:00:00').toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : d.period) : '';
  return `${d.source || ''}${per}${d.battles ? ` · ${(+d.battles).toLocaleString('en-US')} battles` : ''}`; };
// HOME-04 (Sim Q4a A, Nov 18: moved here from today's Home): the Showdown ladder's numbers are monthly (Smogon posts each month on the 1st
// of the next), so its line says when the next month arrives: ". November's numbers arrive Dec 1." Shown only until that date (as V2.homeNext).
V2.usNext = (d, now = Date.now()) => { const m = /^(\d{4})-(\d{2})/.exec(d && d.period || ''); if (!m) return '';
  const nx = new Date(Date.UTC(+m[1], +m[2], 15)), due = new Date(Date.UTC(+m[1], +m[2] + 1, 1)); if (now >= due.getTime()) return '';
  return `. ${nx.toLocaleString('en-US', {month: 'long', timeZone: 'UTC'})}'s numbers arrive ${due.toLocaleString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'})}.`; };
// one rank of the list, filled in as today: a ranked-ladder row with no sets borrows the tournament set (and says how many teams it is from)
V2.usRow = (t0, kind) => { const p = byName.get(t0.n); let t = t0, sb = null;
  if (p && !(t0.mv && t0.mv.length)) { const st = setFor(p, 'doubles', 'tour'); t = {...t0, mv: st.mv, it: st.it, ab: st.ab, na: st.na, tm: st.tm}; sb = f => { const b = setBasis(p, st, f); return b ? b.html : ''; }; }
  else if (t0.teams) { const h = basis(t0.teams, 'team', 'sets', {pre: 'of'}); sb = () => h; }
  return {t, p, sb, u: t.teams ? (t.u != null ? +t.u : null) : kind === 'ladder' && t.u != null ? +t.u : null, tr: V2.usAs(() => trendFor(t.n, t.r))}; };
V2.usName = R => R.p ? R.p.d : R.t.n;
V2.usNums = R => { const E = V2.esc; return `${R.u != null ? `<b class="u us-u">${(+R.u).toFixed(1)}<small class="us-pct">%</small></b>` : ''}${R.t.teams ? `<small class="us-tm">${basis(R.t.teams, 'team', 'teams', {})}</small>` : ''}${R.tr ? `<i class="us-tr ${E(R.tr.cls)}">${E(R.tr.txt).replace(/ (places?)$/, '<span class="us-trw"> $1</span>')}</i>` : ''}`; }; // phones show '▼1' (the row's spoken label says '▼1 place')
V2.usLabel = R => `${V2.usName(R)}, rank ${R.t.r}${R.u != null ? `, ${(+R.u).toFixed(1)}% of teams` : ''}${R.t.teams ? `, ${(+R.t.teams).toLocaleString('en-US')} teams` : ''}${R.tr ? ', ' + R.tr.txt : ''}`;
/* Kit reskin (hU1, Nov 22; a proposal, not approved): the top ten is "the call sheet": one calm row per rank, a 40px picture, the rank and
   name, and the share of teams drawn as a slanted Plot-blue bar on one shared scale (V2.usScale: the longest bar's next 10%), so the gaps
   between ranks read at a glance; the share, team count and place change sit at the row's end. The same row is used for the top ten,
   Ranks 11–60 and the search results. A list that gives no shares (Ranked ladder) draws no bars: rank and name only. Replaces the
   Podium (Q73 D1's bench Mega tag line belonged to the podium benches and is gone with them). */
V2.usScale = rows => { const m = Math.max(0, ...rows.map(R => R.u != null ? +R.u : 0)); return m > 0 ? Math.min(100, Math.ceil((m + 0.5) / 10) * 10) : 0; };
V2.usFig = (R, cls, sc) => { const E = V2.esc, p = R.p, w = sc && R.u != null ? Math.max(0.5, Math.min(100, 100 * +R.u / sc)) : null;
  return `<button type="button" class="us-fig us-ln ${cls}" data-uspick="${E(R.t.n)}" aria-pressed="${V2.usUi.pick === R.t.n}" aria-label="#${R.t.r} ${E(V2.usLabel(R))}: show how it is played"${p ? ` style="--b1:var(--ty-${p.t[0]});--b2:var(--ty-${p.t[1] || p.t[0]})"` : ''}>
    <span class="us-art" aria-hidden="true">${p ? V2.mon(p.n, {iw: 40, bare: true}) : ''}</span><span class="us-tx"><span class="us-rk u">#${R.t.r}</span><b>${E(V2.usName(R)).replace(/ (\S)$/, '\u00a0$1')}</b></span>${w != null ? `<span class="us-pb" aria-hidden="true"><i style="width:${w.toFixed(1)}%"></i></span>` : ''}<span class="us-nums">${V2.usNums(R)}</span></button>`; };
// the scale over the bars: 10% steps up to the scale's top (aria-hidden: each row's own words carry its share)
V2.usAxis = sc => sc ? `<div class="us-axis" aria-hidden="true"><span class="us-ax">${Array.from({length: sc / 10 + 1}, (_, i) => `<i${i % 2 ? ' class="us-odd"' : ''} style="left:${(100 * i * 10 / sc).toFixed(2)}%">${i ? i * 10 + '%' : '0'}</i>`).join('')}</span><span class="us-axl">Share of teams</span></div>` : '';
V2.usRows = (list, sc, cls, lbl) => `<ol class="us-top${sc ? '' : ' us-nob'}"${lbl ? ` aria-label="${V2.esc(lbl)}"` : ''} style="--tk:${sc ? (1000 / sc).toFixed(3) : 10}%">${list.map(R => `<li>${V2.usFig(R, cls, sc)}</li>`).join('')}</ol>`;
/* Q42 A (Sim chose it, Nov 19, 8:25 PM): a shorter Usage page on phones (under 700 wide; 700+ unchanged). "How <Pokémon> is played" shows
   Moves' top 5 and Items' top 3, each with "N more ›" (N = the rest of the list the page holds), Abilities and Natures side by side,
   Usually alongside one row of 3 plus "N more ›", and the "Also ranked 61–100" line behind its own button. CSS-only cuts (class us-x on
   what phones fold away), so tablet and desktop keep every bar, teammate and the line and never see a button. Each button is a real
   button (aria-expanded, aria-controls) that toggles its list's class with no redraw, so focus stays on it (the Q32 pattern,
   V2.wkTechBtn); its state (V2.usUi.open) is kept across redraws, other picks and the mouse hover swap. */
/* E1 (Nov 20 audit): the button is a flex box, so a plain space before the hidden word was trimmed and "3 more›" lost its space; a
   no-break space after "more" keeps 3px before the ›, as "Ratings ›" (the spoken text stays "3 more moves ›") */
/* Wave 2 (Sim chose A, Nov 22): the kit show-more (V2.kMore), "Show N more" / "Show fewer"; the noun stays for screen readers
   (was "N more ›" and "Also ranked 61–100 ›"; the ranks show as the opened line's own start, "Also ranked 61–100: ...") */
V2.usMoreIn = (k, n, open) => V2.kMoreIn(n, {open, vh: ({mv: 'moves', it: 'items', tm: 'teammates', al: 'ranked Pokémon'})[k]});
V2.usMoreB = (k, n) => { const o = !!V2.usUi.open[k]; return V2.kMore(n, {open: o, vh: ({mv: 'moves', it: 'items', tm: 'teammates', al: 'ranked Pokémon'})[k], attrs: {class: 'us-more', 'data-usmore': k, 'data-n': n, 'aria-controls': 'us-l-' + k}}); };
V2.usCut = {mv: 4, it: 3}; // phones: Moves top 4 (two rows of move tickets: a set's four), Items top 3
V2.usPct = v => v == null ? '' : ((+v) < 1 ? (+v).toFixed(1) : Math.round(+v)) + '%';
V2.usBars = (title, arr, n, bas, tc, k) => { if (!(arr && arr.length)) return ''; const L = arr.slice(0, n), c = k && V2.usCut[k], x = c && L.length > c ? L.length - c : 0;
  const head = `<p class="us-bh">${title}${bas ? ` <small>${bas}</small>` : ''}</p>`, more = x ? V2.usMoreB(k, x) : '', open = x && V2.usUi.open[k] ? ' on' : '', id = x ? ` id="us-l-${k}"` : '';
  // moves: the site's one move ticket (kit V2.kMove: type word on its colour, the name, what it does, the share)
  if (k === 'mv' && V2.kMove) return `<div class="us-bars us-mvs${tc ? ' ' + tc : ''}${open}"${id}>${head}<ul class="k-moves">${L.map(([nm, v], i) => `<li class="us-bar${x && i >= c ? ' us-x' : ''}">${V2.kMove(nm, {pct: V2.usPct(v)})}</li>`).join('')}</ul>${more}</div>`;
  return `<div class="us-bars${tc ? ' ' + tc : ''}${open}"${id}>${head}${L.map(([nm, v], i) => { const q = byName.get(nm);
  return `<p class="us-bar${x && i >= c ? ' us-x' : ''}"><span>${V2.esc(q ? q.d : nm)}</span>${v != null ? `<b class="u">${V2.usPct(v)}</b><i aria-hidden="true"><i style="width:${Math.max(1, Math.min(100, +v))}%"></i></i>` : ''}</p>`; }).join('')}${more}</div>`; };
V2.usHow = (R, d) => { const E = V2.esc, t = R.t, p = R.p, nm = V2.usName(R), sb = R.sb, st = p ? V2.addState(p.n) : 'none';
  const mega = p && p.m && p.a && p.a[0], half = (mega || (t.ab && t.ab.length)) && t.na && t.na.length ? 'us-half' : ''; // Q42: Abilities and Natures share a row on phones only when both are there
  const groups = [V2.usBars('Moves', t.mv, 8, sb && sb('mv'), '', 'mv'), V2.usBars('Items', t.it, 5, sb && sb('it'), '', 'it'), (mega ? `<div class="us-bars${half ? ' ' + half : ''}"><p class="us-bh">Abilities</p><p class="st-stone">Always <b>${V2.esc(p.a[0])}</b> (a Mega's Ability is fixed).</p></div>` /* 4c (Nov 17): tournament sheets list the base form's Ability for Megas */ : V2.usBars('Abilities', t.ab, 3, sb && sb('ab'), half)), V2.usBars('Natures', t.na, 3, sb && sb('na'), half)].filter(Boolean);
  const tm = (t.tm || []).slice(0, 6).filter(([n]) => byName.get(n)), tmX = innerWidth < 700 && tm.length > 3 ? tm.length - 3 : 0;
  const mates = tm.length ? `<div class="us-mates${tmX && V2.usUi.open.tm ? ' on' : ''}"${tmX ? ' id="us-l-tm"' : ''}><p class="np-eyebrow"><span>Teammates</span></p><h3 class="u">Usually alongside</h3>${(tmX ? [tm.slice(0, 3), tm.slice(3)] : [tm]).map((row, ri) => `<div class="gs-row us-bench${ri ? ' us-x' : ''}" style="--c:${innerWidth < 700 ? 3 : row.length}">${row.map(([n, v]) => { const q = byName.get(n);
      return `<button type="button" class="gs-mon" data-v2mon="${E(n)}" style="--b1:var(--ty-${q.t[0]});--b2:var(--ty-${q.t[1] || q.t[0]})" aria-label="${E(q.d)}${v != null ? `, on ${Math.round(+v)}% of its teams` : ''}: open its page"><span class="gs-fig" aria-hidden="true"><i class="gs-base"></i>${V2.mon(q.n, {bare: true})}</span><span class="gs-tx" aria-hidden="true">${q.m ? '<span class="gs-mg u">Mega</span>' : '<span class="gs-mg">&nbsp;</span>'}<b>${E(q.m ? q.d.slice(5) : q.d)}</b>${v != null ? `<small>${Math.round(+v)}% of its teams</small>` : ''}</span></button>`; }).join('')}</div>`).join('')}${tmX ? V2.usMoreB('tm', tmX) : ''}</div>` : '';
  const cc = t.cc && t.cc.length ? `<p class="fine us-cc"><b>Checks and counters:</b> ${t.cc.slice(0, 5).map(([n, v]) => { const q = byName.get(n); return E(q ? q.d : n) + ` <small>${(+v).toFixed(0)}</small>`; }).join(', ')}</p>` : '';
  const add = st === 'ok' ? `<button type="button" class="np-btn2 k-btn" data-v2add="${E(p.n)}" aria-label="Add ${E(nm)} to My Team"><span>Add to My Team</span></button>` : st === 'have' ? '<p class="ra-mine"><i aria-hidden="true"></i>On your team</p>' : '';
  return `<section class="k-step us-how" data-ushow="${E(t.n)}"${p ? ` style="--ty-a:var(--ty-${p.t[0]});--ty-b:var(--ty-${p.t[1] || p.t[0]})"` : ''}><span class="k-n" aria-hidden="true">2</span><div class="k-sec us-hh"><h2 class="k-h2 u">How ${E(nm)} is played</h2><span class="k-note">Tap one above to switch.</span></div>
    ${t.w ? `<p class="us-w">Win rate: <b class="u">${(+t.w).toFixed(1)}%</b>${t.teams ? ' ' + basis(t.teams, 'team', 'teams', {pre: 'from its'}) : ''}</p>` : ''}
    ${groups.length ? `<div class="us-groups">${groups.join('')}</div>` : '<p class="tm-sub">No set details for this one yet.</p>'}${cc}${mates}
    <div class="us-add">${add}<p class="fine">% = share of its sets${t0src(R)}.</p></div></section>`; };
const t0src = R => R.p && !(V2.usDoc() && (V2.usDoc().top || []).find(x => x.n === R.t.n && x.mv && x.mv.length)) ? '. Sets come from tournament teams where this list gives none' : '';
// the spotlight: the most used Pokémon of this list (tag "Most used"; was "right now", player review 3a Nov 17)
/* W2b (Sim, Nov 19): the hero's share and win rate are the chosen list's own numbers. A list that gives none shows "–" (and says so to a
   screen reader; the key line under The Podium says it in words), never another list's number (was V2.raNums, Online tournaments). */
/* kit (hU1, Nov 22): the spotlight is the kit's hero card (the art bursts out of the top), its three facts and the page's one pink move,
   OPEN ITS FILE. (its Pokémon page, "the file"); Add to My Team is the quiet second action. The card's big number is its usage rank; the
   rating moves from a fine line into the facts (Of teams, Win rate, Rating), so the facts row says everything once. */
V2.usOneIn = u => u >= 10 && u < 100 ? `on more than 1 in ${Math.ceil(100 / u)} teams!` : ''; // a true lower bound: 38.1% > 1/3
V2.usSpot = (R, d) => { if (!R || !R.p) return ''; const E = V2.esc, p = R.p, x = lairRows().find(y => y.p.n === p.n), st = V2.addState(p.n), sn = V2.usSrcs.find(y => y[0] === V2.usUi.src);
  const card = V2.kCard(p.n, {size: 'hero', score: '#' + R.t.r});
  const one = R.u != null ? V2.usOneIn(+R.u) : '';
  return `<div class="gs-spot ra-spot us-spot k-hero"><div class="k-hero-card">${card}</div>
    <div class="gs-sinfo k-hero-side"><div class="us-tagl"><p class="gs-tag u">Most used</p><div class="ra-ty">${p.t.map(V2.typeChip).join('')}</div></div>
      <div class="gs-facts us-facts">${R.u != null ? V2.gsShare((+R.u).toFixed(1) + '%', ({ingame: 'ranked ladder', tour: 'online tournament', ladder: 'Showdown ladder'})[V2.usUi.src] || 'these') : `<p><span class="vh">${E(sn ? sn[1] : 'This list')} gives no share of teams</span><span aria-hidden="true">Of teams</span><b class="u" aria-hidden="true">–</b></p>`}${R.t.w ? `<p><span>Win rate</span><b class="u">${(+R.t.w).toFixed(1)}%</b></p>` : `<p><span class="vh">${E(sn ? sn[1] : 'This list')} gives no win rate</span><span aria-hidden="true">Win rate</span><b class="u" aria-hidden="true">–</b></p>`}${x ? `<p><span class="vh">Rated ${RS(x.r.total)}, ${lTier(x.r.total).k} tier</span><span aria-hidden="true">${lTier(x.r.total).k} tier</span><b class="u" aria-hidden="true">${RS(x.r.total)}</b></p>` : ''}</div>
      ${one ? V2.kScrib(one) : ''}
      ${st === 'have' ? '<p class="ra-mine"><i aria-hidden="true"></i>On your team</p>' : ''}</div>
      <div class="ra-acts us-acts">${V2.kGo('OPEN ITS FILE.', {'data-v2mon': p.n, 'aria-label': `Open ${V2.disp(p.n)}'s Pokémon page`})}${st === 'ok' ? `<button type="button" class="k-link us-addl" data-v2add="${E(p.n)}">Add to My Team&nbsp;›</button>` : ''}</div></div>`; };

/* the Podium's key line (audit Nov 19 #5, C3; W2b, Sim Nov 19): the hero above shows only the chosen list's own numbers, so the key line
   says plainly what the list doesn't give (Ranked ladder: no shares or win rates; Showdown ladder: no win rates) instead of naming a
   borrowed source. Each new line is shorter than the line it replaces for that source. */
V2.usKey = rows => { const R = rows[0], has = rows.some(x => x.u != null), noW = R && !R.t.w;
  return has ? 'Tap one to see how it is played.' + (noW ? ' This list gives no win rates.' : '') : 'This list ranks them; it gives no shares' + (noW ? ' or win rates.' : '.'); }; /* kit: the step's title says "The top ten", so the key keeps only what to do and what the list lacks */
V2.pages.usage = {place: 'meta', draw() { const E = V2.esc, U = V2.usUi;
  if (!V2.usDoc()) { const alt = ['tour', 'ingame', 'ladder'].find(k => META[SRC[k]]); if (alt) U.src = alt; }
  const d = V2.usDoc(), kind = d && (d.kind || 'ladder');
  const tabs = `<div class="ra-sub"><nav class="ra-tabs" aria-label="Meta"><a href="#meta" class="on" aria-current="page">Pokémon</a><a href="#tournaments">Tournaments</a></nav>
    <nav class="ra-seg" aria-label="Pokémon views"><a href="#meta">Ratings</a><a href="#usage" class="on" aria-current="page">Usage</a><a href="#sets">Popular Sets</a></nav></div>`;
  const rows = d ? (d.top || []).map(t => V2.usRow(t, kind)) : [];
  const head = `<section class="ra-h"><p class="np-eyebrow"><span>Meta · Usage</span></p><h1 class="k-h1 u"><span>Who gets picked</span> <span class="pl">right now.</span></h1>
    <p class="ra-lede">The most used Pokémon, from the ranked ladder, online tournaments or the Showdown ladder.</p>${tabs}<p class="ra-links"><a class="np-link" href="#meta">Ratings ›</a><a class="np-link" href="#sets">Popular Sets ›</a></p></section>`;
  /* kit: the source is the plot sentence ("Count the picks on [Ranked ladder] [Online tournaments] [Showdown ladder]"); the three boxed words
     keep their group (.us-srcs, data-ussrc) and today's names; the search and the source line sit under it */
  const srcs = `<div class="us-ctl"><div class="k-sent u us-sent"><span>Count the picks on</span> <span class="us-srcs" role="group" aria-label="Source">${V2.usSrcs.map(([k, l]) => `<button type="button" class="k-w" data-ussrc="${k}" aria-pressed="${U.src === k}"${META[SRC[k]] ? '' : ' disabled title="No data from this source yet"'}><span>${l}</span></button>`).join('')}</span></div>
    ${d ? `<p class="fine us-src">${E(V2.usLine(d))}${U.src === 'ladder' ? E(V2.usNext(d)) : ''}</p>` : ''}
    <div class="gs-ctl"><div class="ra-find"><label class="np-field ra-q">${V2.ICON.search}<input type="search" data-usq value="${E(U.q)}" placeholder="Find a Pokémon in the ranks" aria-label="Find a Pokémon in the ranks" autocomplete="off">${V2.CLR}</label></div></div></div>`;
  if (!d) return `<div class="ra gsp us">${`<div class="gs-top">${head}${tabs}</div>`}<div class="gs-body">${srcs}<p class="tm-sub">No meta data loaded yet. Usage appears after the next data refresh.</p></div></div>`;
  const q = U.q.trim().toLowerCase(), byQ = R => V2.usName(R).toLowerCase().includes(q), sc = V2.usScale(rows);
  let body;
  if (q) { const hit = rows.filter(byQ); body = `<p class="us-count"><b class="u">${hit.length}</b> ${hit.length ? `match${hit.length === 1 ? '' : 'es'}` : ''}</p>${hit.length ? `<div class="us-list">${V2.usAxis(sc)}${V2.usRows(hit, sc, 'row', 'Matches')}</div>` : '<p class="k-none">No Pokémon in this list matches that.</p>'}`; }
  else { const pick = rows.find(R => R.t.n === U.pick) || rows[0], ten = rows.slice(0, 10), rest = rows.slice(10);
    const also = d.more && d.more.length ? `${V2.usMoreB('al', Math.min(40, d.more.length)) /* the line shows up to 40 */}<p class="fine us-also${U.open.al ? ' on' : ''}" id="us-l-al">Also ranked ${d.more[0].r}–${d.more[d.more.length - 1].r}: ${d.more.slice(0, 40).map(m => { const p = byName.get(m.n); return E(p ? p.d : m.n); }).join(', ')}${d.more.length > 40 ? ` and ${d.more.length - 40} more` : ''}</p>` : '';
    const step1 = `<section class="k-step us-s1"><span class="k-n" aria-hidden="true">1</span><div class="k-sec gs-title"><h2 class="k-h2 u">The top ten</h2><span class="k-note gs-key">${V2.usKey(rows)}</span></div>
      <div class="us-sheet">${V2.usAxis(sc)}${V2.usRows(ten, sc, 'ten', 'The ten most used')}
      ${rest.length ? `${U.all ? V2.usRows(rest, sc, 'row', `Ranks 11 to ${rows[rows.length - 1].t.r}`) : ''}<button type="button" class="k-link us-rest" data-usrest aria-expanded="${U.all}">${U.all ? 'Show the top 10' : `Ranks 11–${rows[rows.length - 1].t.r}&nbsp;›`}</button>` : ''}
      ${also}${d.note ? `<p class="fine">${E(d.note)}</p>` : ''}</div></section>`;
    body = V2.kPlan(step1 + (pick ? V2.usHow(pick, d) : '')); }
  return `<div class="ra gsp us"><div class="gs-top">${head}<div class="ra-spotw">${V2.usSpot(rows[0], d)}</div>${tabs}</div><div class="gs-body">${srcs}${body}</div></div>`; }};

document.addEventListener('input', e => { const i = e.target.closest && e.target.closest('[data-usq]'); if (!i) return; V2.usUi.q = i.value; const at = i.selectionStart; V2.redraw();
  const n = document.querySelector('[data-usq]'); if (n) { n.focus(); try { n.setSelectionRange(at, at); } catch (x) {} } });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ussrc],[data-uspick],[data-usrest]'); if (!b) return; const U = V2.usUi, d = b.dataset;
  if (d.ussrc) { U.src = d.ussrc; ui.metaSrc = d.ussrc; U.pick = null; }
  else if (d.uspick) { U.pick = d.uspick; V2.redraw(); const h = document.querySelector('[data-ushow]'); if (h && !V2.usUi._hover) h.scrollIntoView({behavior: V2.smooth(), block: 'nearest'}); return; }
  else if (d.usrest != null) U.all = !U.all;
  V2.redraw(); });
// Q42: a phone's "N more ›" / "Also ranked 61–100 ›" opens its list in place (class 'on', no redraw: focus stays on the button)
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-usmore]'); if (!b) return; const k = b.dataset.usmore, l = document.getElementById(b.getAttribute('aria-controls')); if (!l) return;
  const o = V2.usUi.open[k] = !V2.usUi.open[k]; l.classList.toggle('on', o); b.setAttribute('aria-expanded', o); b.innerHTML = V2.usMoreIn(k, b.dataset.n, o); });
/* (kit reskin proposal, hU1 Nov 22) the mouse-hover swap of "How it is played" is left out: in a column of ten rows the pointer crosses every
   row below on its way down to step 2, so the panel always ended on the last row passed (#10). Tap or click picks one, as on phones. */
(() => { const band = () => innerWidth >= 1100 ? 2 : innerWidth >= 700 ? 1 : 0; let b = band(), tm = 0; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (band() === b) return; b = band(); if (document.querySelector('.us')) V2.redraw(); }, 150); }); })();
