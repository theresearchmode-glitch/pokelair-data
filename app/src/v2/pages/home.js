// ---------- Home (R4 Home, Nov 12): built piece by piece from the approved mock-up (docs/rebuild/mocks/home.tpl.html) ----------
// Every Home feature of today's site is kept (behaviour tests HOME-01..16). Numbers come from shared logic (05-home-data.js,
// CH.metaSix, RES), so both sites say the same thing. Piece 1: the hero (tagline, start buttons, Import, Most used right now).
V2.homeHero = () => { const E = V2.esc, ms = members(), has = ms.length > 0, six = CH.metaSix(), n = (typeof RES === 'object' && RES && RES.teams) || 0;
  // start buttons (today's order: Score my team first with a team, Build me a team first with none; then Plan a match)
  const go = has ? `<a class="np-btn" href="#team">Score My Team</a><a class="np-btn2" href="#build"><span>Build a Team</span></a>`
    : `<a class="np-btn" href="#build">Build Me a Team</a><a class="np-btn2" href="#team"><span>Score My Team</span></a>`;
  // Most used: the mock-up's three on one floor (Nov 12, Sim: keep every detail of the mock-up): #1 bigger, its name big and slanted;
  // each % big and slanted with a small unit; a floor line across all three at the feet
  const used = (p, rank) => p ? `<button type="button" class="hm-used${rank === 1 ? ' one' : ''}" data-v2mon="${E(p.n)}" aria-label="${E(V2.disp(p.n))}, most used #${rank}, ${homePct(p)}% of teams: open its info">${V2.mon(p.n, {iw: rank === 1 ? 260 : 150, bare: true})}<span class="hm-ut"><b>${V2.nameHtml(V2.disp(p.n))}</b><small><span class="num">${homePct(p)}<span class="unit">%</span></span> of ladder teams${rank === 1 ? ' · #1' : ''}</small></span></button>` : '';
  return `<section class="hm-hero"><div class="hm-lead"><div class="np-eyebrow"><span>Pokémon Champions · Reg M-C · VGC doubles</span></div>
    <h1 class="u hm-tag"><span>Sharply raise</span> <span class="pl">your win rate.</span></h1>
    <p class="hm-intro">Score your team, see what beats it, and plan every match, from ${n ? homeNum(n) + ' real tournament teams' : 'real tournament results'}.</p>
    <div class="hm-go">${go}<a class="np-btn2" href="#battle"><span>Plan a Match</span></a></div>
    <p class="hm-imp">Already have a team? <button type="button" class="np-link" data-v2homeimport>Import from Showdown</button></p></div>
    <div class="hm-usedw"><p class="hm-k">Most used right now</p><div class="hm-three"><i class="hm-floor" aria-hidden="true"></i>${used(six[1], 2)}${used(six[0], 1)}${used(six[2], 3)}</div><p class="fine hm-src">${E(homeSrcLine())}</p></div></section>`; };
// Piece 2: the duel (mock-up "duel"; today's HOME-09 / HOME-10): the Champion's six beside your six. Both sides share the same
// rows (head, six, plan, actions: one grid, subgrid rows), so the two sixes always start on the same line (Sim, Nov 12).
V2.hmUi = V2.hmUi || {};
// the event's name as a heading (Home duel): today's evName, minus emoji and a trailing prize line, so a title such as
// "Amyverse VGC Champions Arena #18 ❤️ Cash Prize!" reads "Amyverse VGC Champions Arena #18", and a trailing money prize ("50€ Amazon
// Gift Cards") goes too (the mock-up showed a short name)
V2.evTitle = n => evName(n).replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ').replace(/[\s\-–|·:!]*(cash prizes?|prize pool|prizes?|\$\s?\d[\d,.]*\s*(usd|prize( pool)?)?)[\s!]*$/i, '').replace(/\s+(?:[$€£]\s?\d[\d,.]*|\d[\d,.]*\s?[$€£])\s*(?:amazon|gift|cash|prize|usd|eur)?[^#]*$/i, '').replace(/\s+/g, ' ').trim().replace(/ (#\d+)$/, '\u00a0$1') || evName(n); // "#18" stays with the name (Sim, Nov 12)
V2.homeDuel = () => { const E = V2.esc, C = homeChamp(), ms = members();
  const tile = (n, sub, attrs) => `<button type="button" class="hm-pk" ${attrs}>${V2.mon(n, {iw: 96, bare: true})}<b>${V2.nameHtml(V2.disp(n))}</b><small>${sub ? E(sub) : '&nbsp;'}</small></button>`;
  let them = '<div class="hm-side"></div>', FC = null;
  if (C) { const {ev, t} = C, key = ev.id + '#' + ev.top.indexOf(t), sure = V2.hmUi.sure === key;
    try { FC = ms.length >= 4 ? CH.fourVs(ms, C.six.map(x => x.p.n)) : null; } catch (e) { FC = null; }
    them = `<div class="hm-side hm-them"><div class="hm-hd"><p class="hm-k2">The Champion's six · latest winner</p><h3 class="u">${E(V2.evTitle(ev.name))}</h3>
      <p class="hm-who"><b>${E(teamWho(t))}</b> <small>· ${E(evDate(ev.date))}${ev.players ? ` · ${ev.players} players` : ''}</small></p></div>
      <div class="hm-six">${C.six.map(x => tile(x.p.n, x.it, `data-v2mon="${E(x.p.n)}" aria-label="${E(V2.disp(x.p.n))}${x.it ? ', ' + E(x.it) : ''}: open its info"`)).join('')}</div>
      <div class="row hm-acts"><button type="button" class="np-btn2" data-hmload="${E(key)}"><span>${sure ? 'Tap Again to Replace Your Team' : 'Load This Team'}</span></button><button type="button" class="np-btn2" data-hmcopy="${E(key)}"><span>Copy for Showdown</span></button><a class="np-link" href="#meta">All ${C.n} events ›</a></div></div>`; }
  // your six: lead, back, bench for the plan vs the Champion's six (or the meta's six without one); your own lead pick wins (today's AR.home)
  let F = FC, vs = C ? "vs the Champion's six" : '';
  if (!F && ms.length >= 4) { try { F = CH.four(ms); vs = "vs the meta's top six"; } catch (e) { F = null; } }
  const UL = userLeads(ms); if (UL && F) { F = {lead: UL.map(m => m.p.n), back: F.lead.concat(F.back).filter(n => !UL.some(m => m.p.n === n)).slice(0, 2)}; vs = vs ? vs + ', your leads' : 'your leads'; }
  const byN = n => ms.find(m => m.p.n === n), lead = F ? F.lead.map(byN).filter(Boolean) : [], back = F ? F.back.map(byN).filter(Boolean).filter(m => !lead.includes(m)) : [];
  const bench = ms.filter(m => !lead.includes(m) && !back.includes(m)), ord = [...lead, ...back, ...bench].slice(0, 6), pair = g => g.map(m => E(m.d)).join(' + ');
  const title = ms.length ? teamTitleFor(ms) : '', s = V2.scoreNow ? V2.scoreNow() : null;
  let G = null; try { const RD = ms.length ? prepOf(ms) : null; G = RD ? CH.gradeOf(RD, proChecks(ms, true), ms) : null; } catch (e) {}
  const band = G ? ({A: 'top', B: 'ready', C: 'solid', D: 'work', F: 'miss'})[G.band] || 'solid' : 'solid';
  const score = s != null && G ? `<div class="np-score sm hm-score" style="--band:var(--band-${band})"><b>${s}</b><div class="w"><span>${E(CH.wordOf(G.s))}</span><small>Strength Score</small></div></div>` : '';
  const six = ms.length ? ord.map(m => tile(m.p.n, '', `data-v2mon="${E(m.p.n)}" aria-label="${E(m.d)}: open its info"`)).join('')
    : Array.from({length: 6}, (_, i) => `<button type="button" class="hm-pk hm-add" data-v2search aria-label="Add a Pokémon to slot ${i + 1}"><span class="hm-plus" aria-hidden="true">+</span><b>Add a Pokémon</b><small>&nbsp;</small></button>`).join('');
  const plan = lead.length >= 2 ? `<p class="hm-plan"><strong>Game plan ${E(vs)}:</strong> lead ${pair(lead)}${back.length ? `, back ${pair(back)}` : ''}${bench.length ? `, bench ${pair(bench)}` : ''}.</p>` : '<div class="hm-plan"></div>';
  const acts = ms.length ? `${C && FC ? `<button type="button" class="np-btn" data-hmprep="${E(C.ev.id + '#' + C.ev.top.indexOf(C.t))}">Prep vs the Champion</button>` : ''}<a class="np-link" href="#team">Open My Team ›</a>` : '<a class="np-btn" href="#team">Add Your Six</a>';
  let wx = ''; try { const k = ms.length ? wxKeyOf(ms) : null; if (k) wx = wxName(k); } catch (e) {} // today's weather word (HOME-16)
  const you = `<div class="hm-side hm-you"><div class="hm-hd"><p class="hm-k2">Your six${title ? " · " + E(title) : ""}${wx ? ' · ' + E(wx) : ''}</p>${score}${/\(sample\)\s*$/i.test(title) ? `<p class="fine hm-sample">This is a sample team, here to show how NastyPlot works. <span class="tm-sample-acts"><a class="np-link" href="#build">Build your own</a> · <button type="button" class="np-link" data-v2homeimport>Import a team</button></span></p>` : ''}</div><div class="hm-six">${six}</div>${plan}<div class="row hm-acts">${acts}</div></div>`;
  return `<section class="hm-duel">${them}${you}</section>`; };
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
  let show = V2.hmUi.top || '0'; if (show === '1' && !gems.length) show = '0'; if (show === '2' && !W.length) show = '0';
  const row = (x, G) => { const R = monRating(x.p), lr = lairRank(x.p), rk = lr ? lr.rank : null, id = typeof SPRITE_ID === 'object' ? SPRITE_ID[x.p.n] : null;
    return `<li><button type="button" class="hm-rk" data-v2mon="${E(x.p.n)}" aria-label="${E(x.p.d)}, ${R ? R.tier + ' tier, rated ' + R.n : ''}${rk ? ', rank ' + rk : ''}: open its info"><i class="hm-rn">${rk || '·'}</i><span class="hm-ri">${id ? `<img src="${V2.art(id)}" alt="" loading="lazy">` : ''}</span><span class="hm-rnm">${V2.rowName(x.p.d)}${G ? ' <i class="hm-gem" aria-hidden="true">◆</i>' : ''}</span><span class="hm-rt">${R ? E(R.tier) + ' tier' : ''}</span><b class="hm-rr">${R ? R.n : ''}</b></button></li>`; };
  const mv = w => `<li><button type="button" class="hm-mv" data-v2mon="${E(w.n)}" aria-label="${E(V2.disp(w.n))}, rating ${w.r}, ${w.d > 0 ? 'up' : 'down'} ${Math.abs(w.d)} points this week"><span class="hm-mvn">${(id => id ? `<span class="hm-ri"><img src="${V2.art(id)}" alt="" loading="lazy"></span>` : '')(typeof SPRITE_ID === 'object' ? SPRITE_ID[w.n] : null)}<span>${V2.rowName(V2.disp(w.n))}</span></span><i class="${w.d > 0 ? 'up' : 'dn'}" aria-hidden="true">${w.d > 0 ? '▲ up' : '▼ down'} ${Math.abs(w.d)} <span class="unit">points</span></i></button></li>`;
  const panel = (k, sub, hint, items) => `<div class="hm-p hm-p${k}"><p class="hm-hint">${hint}</p><ol class="hm-rks${k === '2' ? ' hm-wkl' : ''}">${items}</ol></div>`;
  const sw = [['0', 'Top rated'], ['1', 'Hidden gems']].filter(x => x[0] === '0' || gems.length);
  const sliders = (sw.length > 1 ? `<div class="hm-sw hm-sw-w">${V2.slide('homegems', sw, show === '1' ? '1' : '0', 'Show')}</div>` : '')
    + (W.length || sw.length > 1 ? `<div class="hm-sw hm-sw-n">${V2.slide('homegems', W.length ? sw.concat([['2', 'This week', 'cal']]) : sw, show, 'Show')}</div>` : '');
  const left = `<div class="hm-top" data-show="${show}"><h2 class="u">The Meta, right now.</h2><p class="hm-sub"><span class="hm-p hm-p0">NastyPlot ratings, from ${homeNum(RES && RES.teams)} tournament teams</span><span class="hm-p hm-p1">Hidden gems · rarely used, winning more than expected</span><span class="hm-p hm-p2">This week in the ratings</span></p>${sliders}
    ${panel('0', `NastyPlot ratings, from ${homeNum(RES && RES.teams)} tournament teams`, 'Highest ratings right now, with their rank. Tap one for the breakdown.', top.map(x => row(x, false)).join(''))}
    ${gems.length ? panel('1', 'Hidden gems · rarely used, winning more than expected', 'Rarely used, but they make top cut more often than their usage predicts, over 300+ games.', gems.map(x => row(x, true)).join('') + (gems.length < 10 ? `<li class="hm-gemnote"><p>Only ${gems.length === 1 ? 'one Pokémon counts' : gems.length + ' Pokémon count'} as a hidden gem right now. More show up here as new results come in.</p></li>` : '')) : ''}
    ${W.length ? panel('2', 'This week in the ratings', 'Biggest moves in rating since last week. Tap one for its info sheet.', W.map(mv).join('')) : ''}
    <a class="np-link hm-all" href="#meta">All ratings ›</a></div>`;
  const n = V2.underdog(), d = E(V2.disp(n));
  const dog = `<div class="hm-ud"><div class="hm-udst" style="--fo:${(typeof ART_META === 'object' && ART_META[SPRITE_ID[n]] || [0, 0, 0, 0])[3]}"><i class="pool" aria-hidden="true"></i><i class="pool b" aria-hidden="true"></i>${SPRITE_ID[n] ? `<img src="${V2.art(SPRITE_ID[n])}" alt="${d}" loading="lazy">` : ''}</div><div><p class="np-eyebrow hm-udk">Today's underdog</p><h3 class="u">${d}. <span>Somebody's favourite.</span></h3>
    <p>Rarely picked in tournaments, but every Pokémon deserves its moment. Maybe it's yours?</p>
    <div class="row hm-acts"><button type="button" class="np-btn2" data-hmaround="${E(n)}"><span>Build Around It</span></button><button type="button" class="np-link" data-v2mon="${E(n)}">Info Sheet</button></div>
    <a class="np-link hm-fav" href="#build">Or build around your favourite Pokémon <span aria-hidden="true">→</span></a></div></div>`;
  const wk = W.length ? `<div class="hm-wk"><h3 class="u">This week in the ratings</h3><p class="hm-hint">Biggest moves in rating since last week. Tap one for its info sheet.</p>
    <ul>${W.map(w => `<li><button type="button" class="hm-mv" data-v2mon="${E(w.n)}" aria-label="${E(V2.disp(w.n))}, rating ${w.r}, ${w.d > 0 ? 'up' : 'down'} ${Math.abs(w.d)} points this week"><span class="hm-mvn">${(id => id ? `<span class="hm-ri"><img src="${V2.art(id)}" alt="" loading="lazy"></span>` : '')(typeof SPRITE_ID === 'object' ? SPRITE_ID[w.n] : null)}<span>${V2.rowName(V2.disp(w.n))}</span></span><i class="${w.d > 0 ? 'up' : 'dn'}" aria-hidden="true">${w.d > 0 ? '▲ up' : '▼ down'} ${Math.abs(w.d)} <span class="unit">points</span></i></button></li>`).join('')}</ul></div>` : '';
  return `<section class="hm-meta">${left}<div class="hm-side2">${dog}${wk}</div></section>`; };
document.addEventListener('v2slide', e => { if (e.detail.key !== 'homegems') return; V2.hmUi.top = e.detail.value; try { localStorage.setItem('np2.seg.homegems', e.detail.value); } catch (x) {} V2.redraw(); });
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-hmaround]'); if (!b) return; const p = byName.get(b.dataset.hmaround); if (!p) return;
  ui.abLock = p.n; if (typeof inBox === 'function' && !inBox(p)) ui.abSrc = 'all'; if (V2.closeSheet && b.closest('.ms2')) V2.closeSheet(true); location.hash = '#build'; });
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
V2.homeTools = () => `<section class="hm-tools"><h2 class="u">Everything NastyPlot does.</h2><p class="hm-sub">${V2.HOME_TOOLS.length} tools, one tap each</p>
  <div class="hm-tgrid">${V2.HOME_TOOLS.map(([n, d, to]) => `<a class="hm-tool" href="#${to}"><b>${V2.esc(n)}<i aria-hidden="true">›</i></b><span>${V2.esc(d)}</span></a>`).join('')}</div></section>`;
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
  const tr = T && (T.up.length || T.dn.length) ? `<div class="hm-mp"><h3 class="u hm-mh">What changed this week</h3><p class="hm-hint">Tournament usage rank now vs ${E(new Date(T.past.d + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}))} · ${E(typeof basisText === 'function' ? basisText(h.days.length, 'day', 'days', {pre: 'from'}) : '')} of ranks</p>
    <div class="hm-trs"><div><h4>Rising</h4>${T.up.length ? `<ul>${T.up.map(x => item(x, true)).join('')}</ul>` : '<p class="hm-hint">No big risers.</p>'}</div><div><h4>Falling</h4>${T.dn.length ? `<ul>${T.dn.map(x => item(x, false)).join('')}</ul>` : '<p class="hm-hint">No big drops.</p>'}</div></div></div>` : '';
  const cores = RES && Array.isArray(RES.cores) ? RES.cores.filter(c => c[3] >= 60 && c.slice(0, 3).every(n => byName.get(n))).sort((a, b) => b[4] - a[4]).slice(0, 3) : [];
  const co = cores.length ? `<div class="hm-mp"><h3 class="u hm-mh">Winning cores</h3><p class="hm-hint">Trios with the best win rates at tournaments (60+ teams each).</p>
    <div class="hm-cores">${cores.map(c => { const ps = c.slice(0, 3).map(n => byName.get(n)); return `<a class="hm-core" href="#build"><span class="hm-pi">${ps.map(p => img(p.n)).join('')}</span><span class="hm-pn">${ps.map(p => V2.rowName(p.d)).join(' · ')}</span><small><b>${E(winFmt(c[4] * 100))}</b> wins · ${homeNum(c[3])} teams</small></a>`; }).join('')}</div><a class="np-link hm-all" href="#build">All cores ›</a></div>` : '';
  const L = Array.isArray(S.log) ? S.log : [], ls = L.length ? logStats(L) : null;
  const bt = `<div class="hm-mp"><h3 class="u hm-mh">Your battles${ls ? ' · ' + ls.w + '–' + ls.l : ''}</h3>${ls ? `<div class="hm-log"><p><b>${ls.w}–${ls.l}</b><span>${ls.pct}% wins</span></p><p><b>${ls.n}</b><span>logged</span></p><p class="hm-dots" aria-label="Last ${Math.min(10, L.length)} games">${L.slice(-10).map(e => `<i class="${e.r === 'W' ? 'w' : 'l'}">${e.r === 'W' ? 'W' : 'L'}</i>`).join('')}</p></div><a class="np-link hm-all" href="#battle">Battle log ›</a>`
    : `<p class="hm-hint">Log your games after each match and your record shows up here.</p><div class="row hm-acts"><a class="np-btn2" href="#battle"><span>Log a Game</span></a></div>`}</div>`;
  const sub = 'Doubles is played in pairs' + (tr ? ' · What changed this week' : '') + (co ? ' · Winning cores' : '') + ' · Your battles';
  return `<section class="hm-moresec"><details class="sg2-fold hm-more" data-hmmore${V2.hmUi.more ? ' open' : ''}><summary><span class="t">More on Home</span><span class="s">${E(sub)}</span></summary>
    <div class="hm-moreb">${pr}${tr}${co}${bt}<p class="hm-hint hm-src">${E((RES && RES.source) || '')}${RES && RES.source ? ' · ' : ''}Ratings: top-cut presence, conversion and win rate at real tournaments.</p></div></details></section>`; };
document.addEventListener('toggle', e => { const d = e.target; if (!d.matches || !d.matches('[data-hmmore]')) return; V2.hmUi.more = d.open; try { localStorage.setItem('np2.fold.homemore', d.open ? '1' : '0'); } catch (x) {} }, true);
// First visit and after an update (today's 46-onboarding.js / 53-feedback.js rules and saved keys, so a player's state carries
// over at the switch): the welcome card until "Got It" or a path is tapped (cc2.welcomed); What's New once, the visit right after
// an update (cc2.seenNew + this visit's np.wnew), never for a first-time visitor. Words: the Nov 9 word list (proposal, Sim to OK).
V2.homeWelcome = () => { let seen = false; try { seen = !!LS.get('cc2.welcomed', ''); } catch (e) {} if (seen) return '';
  return `<section class="hm-welcome"><div class="hm-wl"><p class="np-eyebrow">New here?</p><h2 class="u">How NastyPlot works.</h2>
    <p class="hm-hint">The team on My Team is a sample to explore. Replace it any time: Build a Team above, or copy a top team.</p>
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
V2.pages.home = {place: 'home', draw() { return `<div class="hm2">${V2.homeHero()}${V2.homeNew()}${V2.homeWelcome()}${V2.homeDuel()}${V2.homeMeta()}${V2.homeTools()}${V2.homeMore()}</div>`; }};
// Load this team (HOME-09): with a team of your own, the first tap asks ("Tap again"); the second loads it with Undo (today's loadSheet)
document.addEventListener('click', async e => { const L = e.target.closest('[data-hmload]'), Cp = e.target.closest('[data-hmcopy]'), P = e.target.closest('[data-hmprep]');
  if (L) { const k = L.dataset.hmload, x = evTeam(k); if (!x) return; if (members().length && V2.hmUi.sure !== k) { V2.hmUi.sure = k; clearTimeout(V2.hmUi.t); V2.hmUi.t = setTimeout(() => { V2.hmUi.sure = null; if (V2.route() === 'home') V2.redraw(); }, 6000); V2.redraw(); return; }
    V2.hmUi.sure = null; keepUndo(); S.slots = sheetSlots(x.t); S.format = 'doubles'; S.loadedId = null; location.hash = '#team'; render(); toast(`${teamWho(x.t).split(' · ')[0]}'s team loaded with its moves and items`, true); return; }
  if (Cp) { const x = evTeam(Cp.dataset.hmcopy); if (!x) return; const r = sheetPaste(x.t.mons); toast((await V2.copy(r.text)) ? (r.filled ? 'Team copied for Showdown. ' + SD_NOTE_TOUR : 'Team copied for Showdown') : 'Copy failed. Try again.'); return; }
  if (P) { const x = evTeam(P.dataset.hmprep); if (!x) return; S.opp = x.t.mons.map(m => m.n); ui.oppFrom = {who: x.t.player, key: S.opp.slice().sort().join('|')}; persist(); location.hash = '#battle'; toast(`Opponent set: ${teamWho(x.t)}`); } });
// "Import from Showdown" (HOME-07): My Team with the Import box open, as today
document.addEventListener('click', e => { if (!e.target.closest('[data-v2homeimport]')) return; location.hash = '#team'; setTimeout(() => V2.openImport(), 120); });
