// ---------- Home (R4 Home, Nov 12): built piece by piece from the approved mock-up (docs/rebuild/mocks/home.tpl.html) ----------
// Every Home feature of today's site is kept (behaviour tests HOME-01..16). Numbers come from shared logic (05-home-data.js,
// CH.metaSix, RES), so both sites say the same thing. Piece 1: the hero (tagline, start buttons, Import, Most used right now).
// ---------- Fight Night (Sim's pick, Nov 14; refined mock-up docs/rebuild/mocks/home3, approved "lets go with this. i love it!") ----------
// The poster: the band, the headline with today's start buttons and Import, then the face-off: your corner (your six with lead / back /
// bench from the game plan, weather word, sample note), the Strength Score belt and VS, the Champion's corner (latest winner's six,
// Load / Copy / All events). Behaviour and words are today's Home (HOME-06/07/09/10/11/16): same data hooks, same rules.
V2.homeFight = () => { const E = V2.esc, ms = members(), has = ms.length > 0, n = (typeof RES === 'object' && RES && RES.teams) || 0, C = homeChamp();
  const go = has ? `<a class="np-btn" href="#team">Score My Team</a><a class="np-btn2" href="#build"><span>Build a Team</span></a>`
    : `<a class="np-btn" href="#build">Build Me a Team</a><a class="np-btn2" href="#team"><span>Score My Team</span></a>`;
  const cpOf = nm => { const m = (typeof ART_META === 'object' && ART_META[SPRITE_ID[nm]]) || [150, 150, 165]; return `${m[0]},${m[1]},${m[2]}`; };
  const fighter = (nm, it, lead) => `<button type="button" class="ff${lead ? ' lead' : ''}" style="--cp:${cpOf(nm)}" data-v2mon="${E(nm)}" aria-label="${E(V2.disp(nm))}${it ? ', ' + E(it) : ''}${lead ? ', lead' : ''}: open its info">${V2.mon(nm, {bare: true, tag: true})}<b>${V2.disp(nm).startsWith('Mega ') ? '<span class="ffm">Mega </span>' : ''}${V2.tileName(V2.disp(nm))}</b><small>${it ? V2.keepForm(E(it)) : '&nbsp;'}${lead ? ' · <em class="ff-ld">Lead</em>' : ''}</small></button>`;
  let FC = null; try { FC = C && ms.length >= 4 ? CH.fourVs(ms, C.six.map(x => x.p.n)) : null; } catch (e) { FC = null; }
  // your six: lead, back, bench for the plan vs the Champion's six (or the meta's six without one); your own lead pick wins (today's AR.home)
  let F = FC, vs = C ? "vs the Champion's six" : '';
  if (!F && ms.length >= 4) { try { F = CH.four(ms); vs = "vs the meta's top six"; } catch (e) { F = null; } }
  const UL = userLeads(ms); if (UL && F) { F = {lead: UL.map(m => m.p.n), back: F.lead.concat(F.back).filter(x => !UL.some(m => m.p.n === x)).slice(0, 2)}; vs = vs ? vs + ', your leads' : 'your leads'; }
  const byN = x => ms.find(m => m.p.n === x), lead = F ? F.lead.map(byN).filter(Boolean) : [], back = F ? F.back.map(byN).filter(Boolean).filter(m => !lead.includes(m)) : [];
  const bench = ms.filter(m => !lead.includes(m) && !back.includes(m)), ord = [...lead, ...back, ...bench].slice(0, 6), pair = g => g.map(m => E(m.d)).join(' + ');
  const title = has ? teamTitleFor(ms) : '', s = V2.scoreNow ? V2.scoreNow() : null;
  let G = null; try { const RD = has ? prepOf(ms) : null; G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } catch (e) {}
  const band = G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid' : 'solid';
  let wx = ''; try { const k = has ? wxKeyOf(ms) : null; if (k) wx = wxName(k); } catch (e) {} // today's weather word (HOME-16)
  const belt = s != null && G ? `<div class="np-score fn-belt" style="--bd:var(--band-${band})"><b class="u">${s}</b><div class="w"><span class="u">${E(CH.wordOf(G.s))}</span><small>Strength Score</small></div></div>`
    : `<div class="fn-belt none"><b class="u" aria-hidden="true">?</b><div class="w"><span class="u">No score yet</span><small>Add six to get your Strength Score</small></div></div>`;
  const yours = has ? ord.map(m => fighter(m.p.n, m.heldItem || m.item || '', lead.includes(m))).join('')
    : Array.from({length: 6}, (_, i) => `<button type="button" class="ff add" data-v2search aria-label="Add a Pokémon to slot ${i + 1}"><span class="ff-plus u" aria-hidden="true">+</span><b>Add a Pokémon</b><small>slot ${i + 1}</small></button>`).join('');
  const sample = /\(sample\)\s*$/i.test(title) ? `<p class="fine hm-sample">This is a sample team, here to show how NastyPlot works. <span class="tm-sample-acts"><a class="np-link" href="#build">Build Your Own</a><span class="tm-sep" aria-hidden="true"> · </span><button type="button" class="np-link" data-v2homeimport>Import a Team</button></span></p>` : '';
  const you = `<div class="fn-corner hm-you"><div class="fn-chd"><p class="fn-k">Your corner</p><p class="u fn-name">${has ? E(title) : 'Your six goes here.'}${wx ? ` <small class="fn-wx">${E(wx)}</small>` : ''}</p>${sample}</div><div class="fn-six">${yours}</div><p class="fn-cacts">${has ? '<a class="np-link" href="#team">Open My Team ›</a>' : '<a class="np-link" href="#meta" data-hmwelcome>Copy a Top Team ›</a>'}</p></div>`;
  let them = '';
  if (C) { const {ev, t} = C, key = ev.id + '#' + ev.top.indexOf(t), sure = V2.hmUi.sure === key;
    them = `<div class="fn-corner them hm-them"><div class="fn-chd"><p class="fn-k">The Champion's corner · latest winner</p><p class="u fn-name">${E(V2.evTitle(ev.name))}</p><p class="fn-who"><b>${E(teamWho(t))}</b> · ${E(evDate(ev.date))}${ev.players ? ` · ${ev.players} players` : ''}</p></div>
      <div class="fn-six">${C.six.map(x => fighter(x.p.n, x.it, false)).join('')}</div>
      <p class="fn-cacts"><button type="button" class="np-link" data-hmload="${E(key)}">${sure ? 'Tap Again to Replace Your Team' : 'Load This Team'}</button><button type="button" class="np-link" data-hmcopy="${E(key)}">Copy for Showdown</button><a class="np-link" href="#meta">All ${C.n} events ›</a></p></div>`; }
  const prep = has ? (C && FC ? `<button type="button" class="np-btn fn-prep" data-hmprep="${E(C.ev.id + '#' + C.ev.top.indexOf(C.t))}">Prep vs the Champion</button>` : '') : '<a class="np-btn fn-prep" href="#team">Add Your Six</a>';
  const plan = lead.length >= 2 ? `<p class="fn-plan hm-plan"><strong class="u">Game Plan</strong> <span>${E(vs)}: lead <b>${pair(lead)}</b>${back.length ? `, back ${pair(back)}` : ''}${bench.length ? `, bench ${pair(bench)}` : ''}.</span></p>`
    : `<p class="fn-plan hm-plan"><strong class="u">Game Plan</strong> <span>${has ? 'Add at least four Pokémon and NastyPlot plans your four and two leads.' : 'Add your six and NastyPlot plans your four and two leads against the Champion.'}</span></p>`;
  return `<section class="fn-hero hm-hero"><p class="fn-band"><span class="live">Tonight's main event</span><span>Pokémon Champions · Reg M-C · VGC doubles</span><span>${n ? homeNum(n) + ' real tournament teams' : 'Real tournament results'}</span></p>
    <div class="fn-top"><h1 class="u fn-h hm-tag"><span>Sharply raise</span> <span class="pl">your win rate.</span></h1><div class="fn-go"><p class="hm-intro">Score your team, see what beats it, and plan every match, from ${n ? homeNum(n) + ' real tournament teams' : 'real tournament results'}.</p>
      <div class="h3-go hm-go">${go}<a class="np-btn2" href="#battle"><span>Plan a Match</span></a></div><p class="hm-imp">Already have a team? <button type="button" class="np-link" data-v2homeimport>Import from Showdown</button></p></div></div>
    <div class="fn-ring${C ? '' : ' solo'}">${you}<div class="fn-mid">${belt}${C ? '<p class="u fn-vs" aria-hidden="true">VS</p>' : ''}${prep}</div>${them}</div>${plan}</section>`; };
// Ringside: the three most used right now (today's hero "Most used right now", HOME-02/03/04): the same buttons, sizes fitted by V2.fitUsed
V2.homeRing = () => { const E = V2.esc, six = CH.metaSix();
  const used = (p, rank) => p ? `<button type="button" class="hm-used${rank === 1 ? ' one' : ''}" data-v2mon="${E(p.n)}" aria-label="${E(V2.disp(p.n))}, most used #${rank}, ${homePct(p)}% of teams: open its info">${V2.mon(p.n, {bare: true})}<span class="hm-ut"><b>${V2.nameHtml(V2.disp(p.n))}</b><small><span class="num">${homePct(p)}<span class="unit">%</span></span> of ladder teams${rank === 1 ? ' · #1' : ''}</small></span></button>` : '';
  return `<section class="fn-ringside"><div class="fn-rh"><p class="fn-k">Ringside</p><h2 class="u">Most used right now.</h2><p class="fine hm-src">${E(homeSrcLine())}</p></div>
    <div class="fn-crowd"><div class="hm-three"><i class="hm-floor" aria-hidden="true"></i>${used(six[1], 2)}${used(six[0], 1)}${used(six[2], 3)}</div></div></section>`; };
// Piece 2: the duel (mock-up "duel"; today's HOME-09 / HOME-10): the Champion's six beside your six. Both sides share the same
// rows (head, six, plan, actions: one grid, subgrid rows), so the two sixes always start on the same line (Sim, Nov 12).
V2.hmUi = V2.hmUi || {};
// the event's name as a heading (Home duel): today's evName, minus emoji and a trailing prize line, so a title such as
// "Amyverse VGC Champions Arena #18 ❤️ Cash Prize!" reads "Amyverse VGC Champions Arena #18", and a trailing money prize ("50€ Amazon
// Gift Cards") goes too (the mock-up showed a short name)
V2.evTitle = n => evName(n).replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ').replace(/[\s\-–|·:!]*(cash prizes?|prize pool|prizes?|\$\s?\d[\d,.]*\s*(usd|prize( pool)?)?)[\s!]*$/i, '').replace(/\s+(?:[$€£]\s?\d[\d,.]*|\d[\d,.]*\s?[$€£])\s*(?:amazon|gift|cash|prize|usd|eur)?[^#]*$/i, '').replace(/\s+/g, ' ').trim().replace(/ (#\d+)$/, '\u00a0$1') || evName(n); // "#18" stays with the name (Sim, Nov 12)
// Home piece 3 (mock-up R2): Top of the Meta (Top rated / Hidden gems, today's lairRows, isGem, lairRank and words) beside today's
// underdog and This week in the ratings (META.track.mv, up to 12 kept since Nov 12: Sim asked for more rows to fill the space).
// A move is shown on the same scale as the ratings people see (RS), so "up 5 points" matches the numbers on the Ratings page.
V2.hmUi = V2.hmUi || {}; try { V2.hmUi.top = (localStorage.getItem('np2.seg.homegems') || '0').replace(/[^012]/g, '') || '0'; } catch (e) { V2.hmUi.top = '0'; }
V2.homeWeek = (max = 7) => { const M = META.track && META.track.mv; if (!M || !M.list) return [];
  return M.list.map(m => ({n: m.n, r: RS(m.r), d: RS(m.r) - RS(m.r - m.d)})).filter(x => x.d && V2.byName.get(x.n)).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, max); };
// a name in a list row: "Mega" inline in blue (Sim, Nov 12: the same as My Team), no reserved space before other names
V2.rowName = d => d.startsWith('Mega ') ? `<span class="mg">Mega</span> ${V2.esc(d.slice(5)).replace(/ ([XYZ])$/, '\u00a0$1')}` : V2.esc(d);
// The switch (Sim, Nov 12, option 2): Top rated / Hidden gems everywhere, plus "This week" where the columns stack (under 900:
// phone and iPad), which then replaces the separate This week list. Each view is its own panel; CSS shows the one picked, and on a
// wide screen "This week" falls back to Top rated because its own column is beside it.
V2.homeMeta = () => { const E = V2.esc, rows = lairRows(), top = rows.slice(0, 10), gems = rows.filter(x => isGem(x.p)).slice(0, 10), W = V2.homeWeek();
  let show = V2.hmUi.top === '1' && gems.length ? '1' : '0';
  // the undercard (Fight Night): today's top 10 / hidden gems as fighter cards; each keeps today's spoken label and opens the info sheet (HOME-14)
  const card = (x, G) => { const R = monRating(x.p), lr = lairRank(x.p), rk = lr ? lr.rank : null;
    return `<li><button type="button" class="hm-rk fn-uc" style="--ta:var(--ty-${x.p.t[0]})" data-v2mon="${E(x.p.n)}" aria-label="${E(x.p.d)}, ${R ? R.tier + ' tier, rated ' + R.n : ''}${rk ? ', rank ' + rk : ''}: open its info"><i class="fn-ur u">${rk || '·'}</i>${V2.mon(x.p.n, {bare: true})}<b class="fn-unm">${V2.nameHtml(x.p.d)}${G ? ' <i class="hm-gem" aria-hidden="true">◆</i>' : ''}</b><small>${R ? E(R.tier) + ' tier' : ''}</small><span class="fn-us u">${R ? R.n : ''}</span></button></li>`; };
  const sw = [['0', 'Top Rated'], ['1', 'Hidden Gems']].filter(x => x[0] === '0' || gems.length);
  const panel = (k, hint, items) => `<div class="hm-p hm-p${k}"><p class="hm-hint">${hint}</p><ol class="fn-cards">${items}</ol></div>`;
  const under = `<section class="fn-under"><div class="hm-top" data-show="${show}"><div class="fn-uh"><div><p class="fn-k">The undercard</p><h2 class="u">The Meta, right now.</h2><p class="hm-sub"><span class="hm-p hm-p0">NastyPlot ratings, from ${homeNum(RES && RES.teams)} tournament teams</span><span class="hm-p hm-p1">Hidden gems · rarely used, winning more than expected</span></p></div>
      <div class="fn-uact">${sw.length > 1 ? `<div class="hm-sw">${V2.slide('homegems', sw, show, 'Show')}</div>` : ''}<a class="np-link hm-all" href="#meta">All ratings ›</a></div></div>
    ${panel('0', 'Highest ratings right now, with their rank. Tap one for the breakdown.', top.map(x => card(x, false)).join(''))}
    ${gems.length ? panel('1', 'Rarely used, but they make top cut more often than their usage predicts, over 300+ games.', gems.map(x => card(x, true)).join('') + (gems.length < 10 ? `<li class="hm-gemnote"><p>Only ${gems.length === 1 ? 'one Pokémon counts' : gems.length + ' Pokémon count'} as a hidden gem right now. More show up here as new results come in.</p></li>` : '')) : ''}</div></section>`;
  const n = V2.underdog(), d = E(V2.disp(n));
  const dog = `<div class="hm-ud fn-dog" style="--cp:${(m => m ? m.slice(0, 3).join(',') : '150,150,165')((typeof ART_META === 'object' && ART_META[SPRITE_ID[n]]) || null)}"><button type="button" class="hm-udst2" data-v2mon="${E(n)}" tabindex="-1" aria-label="${d}: open its info">${V2.mon(n, {bare: true, ft: true})}</button><div><p class="fn-k">The underdog of the night</p><h3 class="u ud-nm" data-v2mon="${E(n)}">${d}. <span>Somebody's favourite.</span></h3>
    <p>Rarely picked in tournaments, but every Pokémon deserves its moment. Maybe it's yours?</p>
    <div class="row hm-acts"><button type="button" class="np-btn2" data-hmaround="${E(n)}"><span>Build Around It</span></button><button type="button" class="np-link" data-v2mon="${E(n)}">Info Sheet</button></div>
    <a class="np-link hm-fav" href="#build">Or build around your favourite Pokémon <span aria-hidden="true">→</span></a></div></div>`;
  const wk = W.length ? `<div class="hm-wk fn-weigh"><p class="fn-k">The weigh-in</p><h3 class="u">This Week in the Ratings</h3><p class="hm-hint">Biggest moves in rating since last week. Tap one for its info sheet.</p>
    <ul>${W.map(w => `<li><button type="button" class="hm-mv" data-v2mon="${E(w.n)}" aria-label="${E(V2.disp(w.n))}, rating ${w.r}, ${w.d > 0 ? 'up' : 'down'} ${Math.abs(w.d)} points this week"><span class="hm-mvn">${V2.mon(w.n, {bare: true})}<span>${V2.rowName(V2.disp(w.n))}</span></span><i class="${w.d > 0 ? 'up' : 'dn'}" aria-hidden="true"><b class="u fn-wn" data-n="${w.d > 0 ? '+' : '−'}${Math.abs(w.d)}"></b><small>${w.d > 0 ? '▲ up' : '▼ down'} ${Math.abs(w.d)} <span class="unit">points</span></small></i></button></li>`).join('')}</ul></div>` : '';
  return `${under}<section class="fn-pair${wk ? '' : ' solo'}">${dog}${wk}</section>`; };
document.addEventListener('v2slide', e => { if (e.detail.key !== 'homegems') return; V2.hmUi.top = e.detail.value; try { localStorage.setItem('np2.seg.homegems', e.detail.value); } catch (x) {} V2.redraw(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-hmaround]'); if (!b) return; const p = byName.get(b.dataset.hmaround); if (!p) return;
  ui.abLock = p.n; if (typeof inBox === 'function' && !inBox(p)) ui.abSrc = 'all'; if (V2.closeSheet && b.closest('.ms2')) V2.closeSheet(true); location.hash = '#build';
  if (typeof runAutoBuild === 'function') { runAutoBuild(); V2.redraw(); } }); // and starts building, as today's 52-sleepers.js does (audit AUTO-06)
// Home piece 4 (mock-up R2): Everything NastyPlot does, 12 even tiles (11 tools + How We Calculate), no half-filled row at 4, 3 or
// 2 columns. Names as in the mock-up, descriptions are today's (HOME_TILES). Each tile opens the page today's site files the tool
// under (32-views.js VIEW_PARENT / VIEW_ALIAS): Battle, Meta (Pokémon + Tournaments) or Build (cores); the tool's own spot inside
// that page comes when the page is rebuilt.
V2.HOME_TOOLS = [['Battle Mode', 'Their six in, your four, the leads and turn 1 out', 'battle'], ['Teams', 'Search every winning team by Pokémon, item or move', 'meta'],
  ['Type Chart', 'What hits what, and your team against every type', 'battle'], ['Ratings', 'Every legal Pokémon on one tier board', 'meta'],
  ['Damage Calc', 'Real damage with stats, items and spread moves', 'battle'], ['Events', 'Every recent tournament, top cut and full sets', 'meta'],
  ['Test Run', 'Run your team into the top 20 tournament teams', 'battle'], ['Popular Sets', 'Moves, items and natures players run', 'meta'],
  ['Speed Tiers', 'Who moves first, with Tailwind and Trick Room', 'battle'], ['Archetypes', 'How to beat Trick Room, Tailwind, rain, sun and more', 'meta'],
  ['Winning Cores', 'Pairs and trios that win the most', 'build'], ['How We Calculate', 'Where every number comes from', 'meta']];
V2.homeTools = () => `<section class="fn-tools hm-tools"><p class="fn-k">The full card</p><h2 class="u">Everything NastyPlot does.</h2><p class="hm-sub">${V2.HOME_TOOLS.length} tools, one tap each</p>
  <div class="fn-tg">${V2.HOME_TOOLS.map(([n, d, to]) => `<a class="hm-tool" href="#${to}"><b class="u">${V2.esc(n)}</b><span>${V2.esc(d)}</span></a>`).join('')}</div></section>`;
// Home piece 5 (mock-up R2): the More on Home fold, closed by default, with today's four parts and words (60-concept-h.js):
// Doubles is played in pairs (homePairs), What changed this week (homeTrendData), Winning cores (RES.cores) and Your battles
// (logStats on S.log), then the ratings' source line. Data helpers shared in 05-home-data.js (today's Home proven unchanged).
V2.hmUi.more = (() => { try { return localStorage.getItem('np2.fold.homemore') === '1'; } catch (e) { return false; } })();
V2.homeMore = () => { const E = V2.esc, img = n => { const id = typeof SPRITE_ID === 'object' ? SPRITE_ID[n] : null; return id ? `<img src="${V2.art(id)}" alt="" loading="lazy">` : ''; };
  const games = RES && RES.tc && RES.tc.games, pairs = homePairs(CH.metaSix(), 4);
  const pr = pairs.length >= 2 ? `<div class="hm-mp"><p class="np-eyebrow">Team preview · Showdown replays${games ? ` · ${homeNum(games)} games` : ''}</p><h3 class="u">Doubles is played in <span>pairs.</span></h3>
    <div class="hm-pairs">${pairs.map(x => `<button type="button" class="hm-pair" data-v2mon="${E(x.b.n)}" aria-label="${E(x.a.d)} and ${E(x.b.d)}: brought together ${x.pct}%"><span class="hm-pi">${img(x.a.n)}${img(x.b.n)}</span><span><b class="hm-pp">${x.pct}<span class="unit">%</span></b><span class="hm-pn">${V2.rowName(x.a.d)} + ${V2.rowName(x.b.d)}</span><small>${homeNum(x.g)} games</small></span></button>`).join('')}</div>
    <p class="hm-hint">% = how often the pair is brought together when both are on the team.</p></div>` : '';
  let T = null; try { T = homeTrendData(); } catch (e) { T = null; }
  const h = META.history, item = (x, good) => `<li><button type="button" class="hm-tr" data-v2mon="${E(x.p.n)}"><span class="hm-ri">${img(x.p.n)}</span><span class="hm-rnm">${V2.rowName(x.p.d)}</span><span class="hm-trd ${good ? 'up' : 'dn'}">${x.d == null ? (good ? 'New' : 'Out') : (good ? '▲ ' : '▼ ') + Math.abs(x.d) + (Math.abs(x.d) === 1 ? ' place' : ' places')}<small>${x.d == null ? (x.r ? 'now #' + x.r : 'out of top 40') : `#${x.r + x.d} → #${x.r}`}</small></span></button></li>`;
  const tr = T && (T.up.length || T.dn.length) ? `<div class="hm-mp"><h3 class="u hm-mh">What Changed This Week</h3><p class="hm-hint">Tournament usage rank now vs ${E(new Date(T.past.d + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}))} · ${E(typeof basisText === 'function' ? basisText(h.days.length, 'day', 'days', {pre: 'from'}) : '')} of ranks</p>
    <div class="hm-trs"><div><h4>Rising</h4>${T.up.length ? `<ul>${T.up.map(x => item(x, true)).join('')}</ul>` : '<p class="hm-hint">No big risers.</p>'}</div><div><h4>Falling</h4>${T.dn.length ? `<ul>${T.dn.map(x => item(x, false)).join('')}</ul>` : '<p class="hm-hint">No big drops.</p>'}</div></div></div>` : '';
  const cores = RES && Array.isArray(RES.cores) ? RES.cores.filter(c => c[3] >= 60 && c.slice(0, 3).every(n => byName.get(n))).sort((a, b) => b[4] - a[4]).slice(0, 3) : [];
  const co = cores.length ? `<div class="hm-mp"><h3 class="u hm-mh">Winning Cores</h3><p class="hm-hint">Trios with the best win rates at tournaments (60+ teams each).</p>
    <div class="hm-cores">${cores.map(c => { const ps = c.slice(0, 3).map(n => byName.get(n)); return `<a class="hm-core" href="#build" data-hmcores><span class="hm-pi">${ps.map(p => img(p.n)).join('')}</span><span class="hm-pn">${ps.map(p => V2.rowName(p.d)).join(' · ')}</span><small><b>${E(winFmt(c[4] * 100))}</b> wins · ${homeNum(c[3])} teams</small></a>`; }).join('')}</div><a class="np-link hm-all" href="#build" data-hmcores>All cores ›</a></div>` : '';
  const L = Array.isArray(S.log) ? S.log : [], ls = L.length ? logStats(L) : null;
  const bt = `<div class="hm-mp"><h3 class="u hm-mh">Your Battles${ls ? ' · ' + ls.w + '–' + ls.l : ''}</h3>${ls ? `<div class="hm-log"><p><b>${ls.w}–${ls.l}</b><span>${ls.pct}% wins</span></p><p><b>${ls.n}</b><span>logged</span></p><p class="hm-dots" aria-label="Last ${Math.min(10, L.length)} games">${L.slice(-10).map(e => `<i class="${e.r === 'W' ? 'w' : 'l'}">${e.r === 'W' ? 'W' : 'L'}</i>`).join('')}</p></div><a class="np-link hm-all" href="#battle">Battle Log ›</a>`
    : `<p class="hm-hint">Log your games after each match and your record shows up here.</p><div class="row hm-acts"><a class="np-btn2" href="#battle"><span>Log a Game</span></a></div>`}</div>`;
  const sub = 'Doubles is played in pairs' + (tr ? ' · What Changed This Week' : '') + (co ? ' · Winning Cores' : '') + ' · Your Battles'; // the section names as headed (title case, Sim's Nov 12 rule)
  return `<section class="hm-moresec"><details class="sg2-fold hm-more" data-hmmore${V2.hmUi.more ? ' open' : ''}><summary><span class="t">More on Home</span><span class="s">${E(sub)}</span></summary>
    <div class="hm-moreb">${pr}${tr}${co}${bt}<p class="hm-hint hm-src">${E((RES && RES.source) || '')}${RES && RES.source ? ' · ' : ''}Ratings: top-cut presence, conversion and win rate at real tournaments.</p></div></details></section>`; };
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('[data-hmmore]')) return; V2.hmUi.more = d.open; try { localStorage.setItem('np2.fold.homemore', d.open ? '1' : '0'); } catch (x) {} }, true);
// First visit and after an update (today's 46-onboarding.js / 53-feedback.js rules and saved keys, so a player's state carries
// over at the switch): the welcome card until "Got It" or a path is tapped (cc2.welcomed); What's New once, the visit right after
// an update (cc2.seenNew + this visit's np.wnew), never for a first-time visitor. Words: the Nov 9 word list (proposal, Sim to OK).
V2.homeWelcome = () => { let seen = false; try { seen = !!LS.get('cc2.welcomed', ''); } catch (e) {} if (seen) return '';
  return `<section class="hm-welcome"><div class="hm-wl"><p class="np-eyebrow">New here?</p><h2 class="u">How fight night works.</h2>
    <p class="hm-hint">The team in your corner is a sample to explore. Replace it any time: Build a Team above, or copy a top team.</p>
    <div class="row hm-acts"><a class="np-btn2" href="#meta" data-hmwelcome><span>Copy a Top Team</span></a><button type="button" class="np-link" data-hmwelcome>Got It</button></div></div>
    <ol class="hm-steps"><li><b>Get a team</b><span>Let us build one from real winning teams, copy a top team, or type your own six.</span></li>
    <li><b>Read your Strength Score</b><span>How strong your six is, its Matchups against the top threats, and exactly what to change.</span></li>
    <li><b>Plan each match</b><span>Scout their six, see who moves first, run the damage, and get a turn 1 plan.</span></li></ol></section>`; };
V2.homeNew = () => { let seen = '', welcomed = ''; try { seen = LS.get('cc2.seenNew', ''); welcomed = LS.get('cc2.welcomed', ''); } catch (e) {}
  if (!welcomed) { try { LS.set('cc2.seenNew', WHATS_NEW.id); } catch (e) {} return ''; }
  let sess = ''; try { sess = sessionStorage.getItem('np.wnew') || ''; } catch (e) {}
  if (seen === WHATS_NEW.id && sess !== WHATS_NEW.id) return '';
  try { LS.set('cc2.seenNew', WHATS_NEW.id); sessionStorage.setItem('np.wnew', WHATS_NEW.id); } catch (e) {}
  const E = V2.esc;
  return `<section class="hm-newsec"><details class="sg2-fold hm-new"><summary><span class="t">What's New</span><span class="s">${WHATS_NEW.items.length} updates: ${WHATS_NEW.items.slice(0, 2).map(([t]) => E(t)).join(', ')}…</span></summary>
    <ul class="hm-newl">${WHATS_NEW.items.map(([t, d]) => `<li><b>${E(t)}</b> <span>${E(d)}</span></li>`).join('')}</ul></details><button type="button" class="hm-newx" data-hmnewx aria-label="Dismiss What's New">×</button></section>`; };
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-hmwelcome],[data-hmnewx]'); if (!t) return;
  if (t.hasAttribute('data-hmwelcome')) { try { LS.set('cc2.welcomed', '1'); } catch (x) {} if (t.tagName === 'BUTTON') { e.preventDefault(); V2.redraw(); } return; }
  e.preventDefault(); try { LS.set('cc2.seenNew', WHATS_NEW.id); sessionStorage.removeItem('np.wnew'); } catch (x) {} const s = t.closest('.hm-newsec'); if (s) s.remove(); });
// Sim, Nov 13 ("make sure there's no overhang in the most used 3"): a name that doesn't fit its button (one long word such as
// "Squawkabilly (Yellow)" or "Mega Crabominable" can't wrap) steps down the type scale until it does; names that fit keep their size.
// Measured before: the 12 longest names in our data stuck out by up to 48 px at 320-360 (scratchpad look/ovB.cjs).
V2.fitUsed = () => { const steps = ['--t34', '--t28', '--t26', '--t24', '--t22', '--t20', '--t17', '--t16', '--t15'], root = getComputedStyle(document.documentElement);
  document.querySelectorAll('.hm-three .hm-used').forEach(btn => { const b = btn.querySelector('.hm-ut b'); if (!b) return; b.style.fontSize = ''; b.style.fontStretch = ''; b.style.hyphens = '';
    const over = () => { const br = btn.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(b); /* the text's own lines, not its box (a capped box can fit while a long word spills out of it) */
      return [...rg.getClientRects()].some(r => r.width && (r.left < br.left - 0.5 || r.right > br.right + 0.5)); };
    if (!over()) return; const cur = parseFloat(getComputedStyle(b).fontSize);
    for (const s of steps) { if (parseFloat(root.getPropertyValue(s)) >= cur) continue; b.style.fontSize = `var(${s})`; if (!over()) return; }
    // still too wide at 15 px (narrow side spots on phones): the approved narrower letters (88%, then 75%, as Home and My Box use), then 13 px
    for (const [fs, st] of [['--t15', '88%'], ['--t15', '75%'], ['--t13', '75%']]) { b.style.fontSize = `var(${fs})`; b.style.fontStretch = st; if (!over()) return; }
    // last resort (one long word in a 67 px side spot at 700-760): break it with a hyphen rather than let it stick out
    b.style.hyphens = 'auto'; }); };
addEventListener('resize', () => { if (V2.route() === 'home') requestAnimationFrame(V2.fitUsed); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (V2.route && V2.route() === 'home') V2.fitUsed(); });
V2.pages.home = {place: 'home', draw() { return `<div class="hm2 fn">${V2.homeFight()}${V2.homeNew()}${V2.homeWelcome()}${V2.homeRing()}${V2.homeMeta()}${V2.homeTools()}${V2.homeMore()}</div>`; }, after() { V2.fitUsed(); }};
// Load this team (HOME-09): with a team of your own, the first tap asks ("Tap again"); the second loads it with Undo (today's loadSheet)
document.addEventListener('click', async e => { const L = e.target.closest('[data-hmload]'), Cp = e.target.closest('[data-hmcopy]'), P = e.target.closest('[data-hmprep]');
  if (L) { const k = L.dataset.hmload, x = evTeam(k); if (!x) return; if (members().length && V2.hmUi.sure !== k) { V2.hmUi.sure = k; clearTimeout(V2.hmUi.t); V2.hmUi.t = setTimeout(() => { V2.hmUi.sure = null; if (V2.route() === 'home' || V2.route() === 'build') V2.redraw(); }, 6000); V2.redraw(); return; }
    V2.hmUi.sure = null; keepUndo(); S.slots = sheetSlots(x.t); S.format = 'doubles'; S.loadedId = null; location.hash = '#team'; render(); toast(`${teamWho(x.t).split(' · ')[0]}'s team loaded with its moves and items`, true); return; }
  if (Cp) { const x = evTeam(Cp.dataset.hmcopy); if (!x) return; const r = sheetPaste(x.t.mons); toast((await V2.copy(r.text)) ? (r.filled ? 'Team copied for Showdown. ' + SD_NOTE_TOUR : 'Team copied for Showdown') : 'Copy failed. Try again.'); return; }
  if (P) { const x = evTeam(P.dataset.hmprep); if (!x) return; const ns = x.t.mons.map(m => m.n); V2.btSetOpp(ns, {who: x.t.player, key: ns.slice().sort().join('|')}); /* remembered in recent opponents too, today's rule (HOME-10) */ location.hash = '#battle'; toast(`Opponent set: ${teamWho(x.t)}`); } });
// "Import from Showdown" (HOME-07): My Team with the Import box open, as today
document.addEventListener('click', e => { if (!e.target.closest('[data-v2homeimport]')) return; location.hash = '#team'; setTimeout(() => V2.openImport(), 120); });
