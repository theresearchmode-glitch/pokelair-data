// ---------- How we calculate (Nov 1, Sim approved) ----------
// One page that says, in plain words, how every number on the site is made, so a player can see why a team is a B.
// Every statement here was checked against the code it describes (named next to each section below); when that code
// changes, change the words here too. Numbers that can be live are read from the data (never hard-coded).
// The data sources live in ONE list (NP_SOURCES): add, drop or rename a source there and every section follows.
const NP_SOURCES = [
  {k: 'tour', name: 'Limitless', what: 'Online tournaments: every standing, open team sheet and pairing.', use: 'Ratings, top threats, usage, sets, team records, Build me a team, the team-strength model', main: true},
  {k: 'official', name: 'RK9', what: 'Official Regionals and Internationals: top team lists, plus every Masters team and match once 95%+ of an event’s lists can be read.', use: 'Events page, each Pokémon’s official-events row, top-cut sets, cross-check'},
  {k: 'replays', name: 'Pokémon Showdown replays', what: 'The newest public Reg M-C games: team preview, the four each side brought and the leads.', use: 'Bring and lead rates on each Pokémon (shown, not scored)'},
  {k: 'smogon', name: 'Smogon usage stats', what: 'Monthly Showdown ladder stats.', use: 'Usage page (ladder view), common spreads for speed tiers'},
  {k: 'ingame', name: 'op.gg', what: 'The official in-game Ranked Doubles usage order.', use: 'Usage page (in-game view)'},
  {k: 'ladder', name: 'Showdowntier', what: 'Showdown ladder usage and win rates, last 14 days, and its tier list.', use: 'Each Pokémon’s sheet, cross-check'},
  {k: 'prd', name: 'project-red-data', what: 'The top 10% of public Showdown replays, last 30 days.', use: 'Each Pokémon’s sheet, cross-check'},
  {k: 'pika', name: 'Pikalytics', what: 'Tournament usage from about the last two weeks.', use: 'Cross-check only'}];
// themed or restricted cups left out by name (formats.mjs OFF_FORMAT; keep the two in step)
const NP_OFF_WORDS = ['Off-meta', 'Spooky', 'Monotype', 'Small Pokémon', 'Ultra Beast', 'Draft', 'BST', '−1%', 'Under X%', 'Little Cup', 'NFE'];
const NP_BAND_C = {light: ['#E8590C', '#9B4DE0', '#0E9F7E', '#1F6FD1'], dark: ['#E8590C', '#A464EA', '#17A283', '#3F86E6']};
// tips that explain a method end with a link to its section here
const NP_TIP_SEC = {readiness: 'ready', rating: 'rating', checklist: 'checks', bars: 'rating', tiers: 'rating', numbers: 'legend'};
const npLink = (sec, label) => `<button type="button" class="nplink" data-view="method" data-msec="${sec}">${label || 'How we calculate'} <span aria-hidden="true">→</span></button>`;
function methodTipLink(k) { return NP_TIP_SEC[k] ? `<div class="tiplinkrow">${npLink(NP_TIP_SEC[k])}</div>` : ''; }
// a link that opens one section: remember which, close any tip, then the shared [data-view] handler opens the page
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-msec]'); if (!b) return; ui.msec = b.dataset.msec; try { closeTip(); } catch (x) {} }, true);
// "today", "yesterday" or "Oct 31": the newest date any data document carries
function npFresh() { const ts = Object.values(typeof DATA_AT === 'object' ? DATA_AT : {}); if (!ts.length) return ''; const t = Math.max(...ts), d = Math.floor((Date.now() - t) / 864e5);
  return d <= 0 ? 'updated today' : d === 1 ? 'updated yesterday' : 'updated ' + new Date(t).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); }
const npDay = d => { try { return new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-US', {month: 'short', day: 'numeric'}); } catch (e) { return d; } };
const npChip = (cls, big, small) => `<span class="npchip ${cls}"><b>${big}</b>${small ? `<small>${small}</small>` : ''}</span>`;
const npOp = s => `<span class="npop" aria-hidden="true">${s}</span>`;
// the grade, live for your own six when it can be worked out (the same functions My team uses)
function npGradeLive() { try { const ms = members(); if (ms.length !== 6) return '';
    const RD = prepOf(ms); if (!RD) return ''; const CK = proChecks(ms, $('useAbil') ? $('useAbil').checked : true), G = CH.gradeOf(RD, CK, ms); if (!G) return '';
    const mp = G.mp != null ? Math.round(G.mp) : null;
    return `<p class="nplive"><b>Your team:</b> ${CH.gradeSumS(G, RD)} → <b class="npletter">${G.letter}</b>. ${esc(CH.recLine(G))}.</p>`; } catch (e) { return ''; } }
// sections: [key, title, one-line summary, body()]
const NP_SECTIONS = [
  // 60-concept-h.js: CH.gradeOf, CH.GMISS, CH.GMODEL, CH.modelPts, CH.recOf/REC_MIN/recLetter, CH.grade
  ['grade', 'Team grade', 'Readiness, minus missed checks, plus real-game results', () => { const g = META.model && META.model.games;
    return `<div class="npeq" role="img" aria-label="Score equals readiness, minus 6 points per missed team check, plus or minus up to 25 points from real games">${npChip('b', 'Ready %', 'top 30 threats')}${npOp('−')}${npChip('p', CH.GMISS + ' × misses', 'team checks')}${npOp('±')}${npChip('g', 'Real games', 'up to 25')}${npOp('=')}${npChip('k', 'Score', '')}</div>
      <div class="npbands"><span><b>A</b> 90+</span><span><b>B</b> 80+</span><span><b>C</b> 70+</span><span><b>D</b> 60+</span><span><b>F</b> under 60</span></div>${npGradeLive()}
      <ol class="npsteps"><li><b>Start</b> with how ready the team is for the top 30 threats (next section).</li>
      <li><b>Take off ${CH.GMISS} points</b> for each team check it misses. "Ready for the top threats" is a check too, but it's already the starting number, so it isn't charged twice. On 904 tournament teams with records, each missed check cost about 1% of games won, and ${CH.GMISS} points per miss put the letters in the same order as the teams' finishes most often.</li>
      <li><b>Add or take off up to 25 points</b> from the team-strength model${g ? `, trained on ${CH.n(g)} real tournament games` : ''} with each player's skill taken out. It scores these Pokémon, pairs and sets against real tournament teams: a team in the middle of the pack gets 0, and each standard deviation above or below it is ${CH.GMODEL} points.</li>
      <li><b>Real results, blended in.</b> When these exact six have ${CH.REC_MIN}+ tournament games of their own, their win rate counts too, on the same scale (60% wins = 90, 55% = 80, 50% = 70, 45% = 60). The more games, the more it counts: about a quarter of the grade at 30 games, 60% at 150, 80% at 400. The grade stays one number out of 100, and its letter comes from that number.</li></ol>
      <p class="t2">Weather and Taunt or Encore aren't checks: many event winners run neither, and teams without them win just as often. A team with an item problem is marked not legal. The grade describes preparation; it isn't a prediction, because the player decides each game.</p>`; }],
  // 55-threats.js: threatList, vsIn (check/counter/immune/soft), vsThreat (levels, overloaded), PTS, SURE; 46-onboarding.js TIPS.readiness
  ['ready', 'Ready for the top threats', 'Real damage calcs against the 30 Pokémon that make top cut most', () => { const tc = RES && RES.tc && RES.tc.rows;
    const top = tc ? Object.entries(tc).filter(([k, r]) => byName.has(k) && Array.isArray(r)).sort((a, b) => b[1][1] - a[1][1]).slice(0, 10).map(([k]) => byName.get(k)) : [];
    return `${top.length ? `<div class="npmini"><div class="chk">The top 10 right now</div><div class="npspr">${top.map(p => `<span title="${esc(p.d)}">${sprite(p, 'tiny') || esc(p.d)}</span>`).join('')}</div></div>` : ''}
      <ol class="npsteps"><li><b>The 30 threats:</b> the Pokémon on the most top-cut teams at recent tournaments. Recent events count more (half as much after 21 days) and bigger events count more. Each threat counts by how often it makes top cut.</li>
      <li><b>Their sets:</b> what strong players bring, from recent top-cut team sheets when there are 15+ of them; otherwise the moves most players run.</li>
      <li><b>Your side:</b> your own sets, items and Speed, with the weather, terrain, Tailwind and Trick Room your team really has. Every verdict is a damage calc with the same engine as the Damage calc.</li></ol>
      <div class="nplev">${[['Well handled', '2+ solid answers', '1', 'ok'], ['Handled', '1 solid answer', '0.8', 'mid'], ['Shaky', 'partial answers only', '0.4', 'sh'], ['Unanswered', 'nothing', '0', 'no']].map(([a, b, c, k]) => `<div class="${k}"><b>${a}</b><span>${b}</span><em>${c} pt</em></div>`).join('')}</div>
      <p><b>Solid answer:</b> one of yours moves first and OHKOs it; or survives its best hit and OHKOs back; or takes at most half per hit, 2HKOs it, and needs 3+ of its hits to go down; or is immune to its attacks and 2HKOs it. If the KO needs a move under 85% accuracy, it only counts as partial.</p>
      <p><b>Partial answer:</b> a 1-on-1 win that takes a big hit back, walling it, Intimidate on a physical attacker, Will-O-Wisp, Wide Guard against its spread moves, or Taunt against its setup. Support Pokémon (Trick Room, screens, Follow Me) are judged by answers to that job instead.</p>
      <p><b>You bring 4:</b> a threat drops one level when fewer than 3 of your six hold up against it. The score is the share of points, weighted by each threat.</p>
      <p class="t2">Checked on 42 hand-worked matchups against Smogon's Champions calculator and on 31,598 real games. It measures preparation, not who wins.</p>`; }],
  // 06-helpers.js proChecks (+ 11-game-plan.js speed row, 29-fix-planner.js typeShape/spreadUsers, 54-items.js itemProblems)
  ['checks', 'The 7 team checks', 'What most winning tournament teams have', () => {
    const line = k => { try { const t = proLine(k, ''); return /^\d/.test(t) ? `<em>${esc(t)}</em>` : ''; } catch (e) { return ''; } };
    const rows = [['speed', 'Speed control', 'Tailwind, Trick Room (with 2+ slow Pokémon besides the setter) or a weather speed pair. Priority moves alone only count as partly.'],
      ['spread', 'Spread damage', 'At least one Pokémon whose set has a damaging move that hits both foes.'],
      ['fake', 'Lead support', 'Fake Out, Intimidate, Follow Me or Rage Powder.'],
      ['mega', 'Mega Evolution', 'At least one Mega (unless you set Megas on team to 0).'],
      ['stack', 'No major weak spot', 'No attack type hits 3+ more of your Pokémon than resist it.'],
      ['w3', 'Weak spots spread out', 'At most one attack type hits 3 or more of your Pokémon.'],
      ['reach', 'Ready for the top threats', '75%+ passes; 65–74% is partly there.']];
    return `<ol class="npchecks">${rows.map(([k, a, b]) => `<li><b>${a}</b><span>${b}</span>${line(k)}</li>`).join('')}</ol>
      <p><b>Items work</b> shows up as an extra check only when there's a problem: two Pokémon holding the same item (VGC Item Clause) or an item that can't work on that team.</p>
      <p class="t2">~ means partly there and doesn't count as passed. The share of recent event winners that pass each check is measured live from the Events data once there are 20+ winners.</p>`; }],
  // 13-rating.js: RATE_V3, v3Evidence, v3Apply (thin-evidence floor, no-results placeholder); 25-ratings-page.js LTIERS; topcut.mjs
  ['rating', 'Pokémon ratings (0–100)', 'Proven results: top cuts, strong players, conversion, wins', () => { const tc = RES && RES.tc; let n = 0; try { n = lairRows().length; } catch (e) {}
    /* Nov 2: shown on the school scale (RS), no multipliers in the words; the code's weights (RATE_V3) are described, not printed as ×N */
    const R = RATE_V3, edgePt = R.wr * R.slope / 100;
    return `<div class="npeq" role="img" aria-label="Rating adds top-cut share, strong-player usage counted at half weight, conversion and the win-rate edge, scaled so the best shows as ${RS(R.top)}">${npChip('o', 'Top-cut share', 'the core')}${npOp('+')}${npChip('p', 'Strong players', 'counts half as much')}${npOp('+')}${npChip('b', 'Conversion', 'top cut vs use')}${npOp('+')}${npChip('g', 'Win edge', 'vs the field')}</div>
      <p class="t2 npcenter">Each part is on a log scale. The best Pokémon shows as ${RS(R.top)}, and halving a Pokémon's presence costs about 10 points (about 5 inside S, where the top is squeezed).</p>
      <ol class="npsteps"><li><b>Top-cut share:</b> of the teams that reach top cut at tournaments, how many use it. Recent and bigger events count more.</li>
      <li><b>Strong players:</b> its usage with each team weighted by the chance its player is in the top 30% by skill (Elo over every online tournament game), like Smogon's rating-weighted usage.</li>
      <li><b>Conversion:</b> does it make top cut more or less often than its usage predicts.</li>
      <li><b>Win edge:</b> its win rate against the field, pulled toward average until there are enough games (${CH.n(R.K)} games count as half the evidence), so a few lucky runs can't push a rare pick up. With plenty of games, winning 4% more of its games than the field (say 54% wins against 50%) adds about ${Math.round(4 * edgePt)} points (less inside S).</li></ol>
      <p>With only a few games, a rating can't drop below the rough placeholder a never-tried Pokémon gets: a floor from stats, typing and tools, at most ${RS(30)}. With no tournament results at all, that placeholder is its rating. Each rating comes with a range in words (“likely 80–88”) that narrows as the games behind it grow, and a rank among the Pokémon with results${(() => { const k = n ? lairRank(lairRows()[0].p) : null; return k ? ` (“#20 of ${k.of}”)` : ''; })()}.</p>
      <p><b>Shown like school grades.</b> The score is worked out on its own scale, then each tier's band is stretched onto a school band, so the order never changes: S 90+, A 80s, B 70s, C 60s, D 50s, F under 50.</p>
      <div class="npbands">${LTIERS.map(T => `<span>${tierChip(T)} ${tierBand(T)}</span>`).join('')}</div>
      <p class="t2">${n ? `${n} Pokémon rated` : 'Ratings'}${tc && tc.events ? ` from ${CH.n(tc.events)} events up to ${npDay(tc.asOf)}` : ''}. The mix was chosen by building candidates from older events only and checking them against later events' top cuts. The win model isn't used here.</p>
      <div class="nprow">${`<button type="button" class="nplink" data-view="track">How right have they been? <span aria-hidden="true">→</span></button>`}</div>`; }],
  // update.mjs, rk9*.mjs, replays.mjs, ladder.mjs, opgg.mjs, sources.mjs, perf.mjs; 16-outside-performance-data.js activePerf().sources
  ['data', 'Usage, sets and sources', 'Where every number comes from', () => { let pf = null; try { pf = activePerf(); } catch (e) {} const lab = k => pf && pf.sources && pf.sources[k] ? String(pf.sources[k]).replace(/\b\d{4}-\d{2}(-\d{2})?\b/g, d => typeof perfDateText === 'function' ? perfDateText(d) : d) : '';
    const live = s => s.k === 'tour' && RES && RES.source ? RES.source : s.k === 'replays' && RES && RES.tc && RES.tc.games ? `${CH.n(RES.tc.games)} games read` : lab(s.k);
    return `<p><b>Usage</b> is the share of teams that bring a Pokémon. <b>Tournament sets</b> (moves, items, abilities) come from real team sheets of the last 4 weeks, so they follow the current meta.</p>
      <ul class="npsrc">${NP_SOURCES.map(s => { const l = live(s); return `<li${s.main ? ' class="main"' : ''}><b>${esc(s.name)}</b><span>${esc(s.what)}</span><span class="t2">Used for: ${esc(s.use)}</span>${l ? `<span class="npnum">${esc(l)}</span>` : ''}</li>`; }).join('')}</ul>
      <p class="t2">The ratings are scored from tournament results; the other sources are shown next to them so you can compare.</p>`; }],
  // 39-damage-calc-speed.js damage(), critStage, NOT_COUNTED; experiments/calc-check.mjs, fields-audit.mjs
  ['calc', 'Damage calc', 'Level 50 doubles, the game’s own rounding', () => { const nc = typeof NOT_COUNTED === 'object' ? Object.entries(NOT_COUNTED) : [];
    return `<div class="npeq sm">${npChip('b', 'Level 50', '31 IVs')}${npChip('p', '0–32', 'points per stat')}${npChip('g', '16 rolls', '85–100%')}${npChip('o', '× 0.75', 'spread hits')}</div>
      <ul class="npdots"><li>The game's own order and rounding, as Showdown's Champions calculator does it. Checked roll by roll against Smogon's damage calculator.</li>
      <li>A move that hits both foes does 75% to each. Reflect and Light Screen cut damage to about two thirds (the doubles value). Helping Hand ×1.5, Friend Guard ×0.75.</li>
      <li>A critical hit is ×1.5 and ignores screens, the attacker's stat drops and the target's boosts. Crit chance by stage: 1/24, 1/8, 1/2, then always.</li>
      <li>Weather, terrain, abilities, items and stat stages (Intimidate = −1) are applied. Moves that hit 2–5 times count 3 hits (5 with Skill Link).</li></ul>
      ${nc.length ? `<div class="chk" style="margin-top:12px">Not counted (the sets can't tell)</div><div class="npnc">${nc.map(([n, v]) => `<span><b>${esc(n)}</b> ${esc(v[0])}</span>`).join('')}<span><b>Gluttony</b> only changes pinch berries, none legal here</span><span><b>Opportunist</b> copies boosts gained mid-battle</span></div>
      <p class="t2">Nor is anything else the sets can't tell: HP already lost, status, KOs so far or switching.</p>` : ''}`; }],
  // 39-damage-calc-speed.js likelySpeed0, spdCalc; body.html speed hint
  ['speed', 'Speed tiers', 'Who moves first, with real spreads', () => `<ul class="npdots"><li>Your six against the 20 most-used Pokémon, fastest first.</li>
      <li>Their Speed uses the most common real spread from the Showdown ladder stats. Without one: a Speed-raising nature means full Speed points, a Speed-lowering one none, otherwise full points if its base Speed is 70+.</li>
      <li>Switches apply the game's own order: Icy Wind's −1 first, then Choice Scarf ×1.5, weather speed abilities ×2 and Tailwind ×2 chained together, then paralysis ×0.5. Trick Room flips the order. Unburden shows a second number for after its item is used.</li></ul>`],
  // 22-auto-build.js provenBuildGen + the beam search; 29-fix-planner.js planFixes; 35-win-model.js TS_GAIN
  ['build', 'Build me a team and suggestions', 'Real winning teams first, then readiness', () => `<p><b>Build me a team</b></p><ol class="npsteps"><li><b>Proven teams first:</b> exact six-Pokémon teams real players brought at tournaments (3+ players, or 30+ games) that you can field from your box, or all but one (the gap is filled with the best fit). The ones that won more come first, pulled toward average when few players ran them.</li>
      <li><b>Otherwise it grows a real tournament core</b> you can field into six with the team-strength model, then makes the single swaps that ready it for the most top threats. Teams with speed control come first.</li>
      <li>Up to 3 teams that differ from each other by 3+ Pokémon where possible, with the number of Megas you set.</li></ol>
      <p><b>Fix it (My team)</b></p><ul class="npdots"><li>Only Pokémon real players run (2%+ usage, or 0.5%+ if it's in your box), unless you ask for off-meta picks.</li>
      <li>A change has to make the team ready for at least ${typeof TS_GAIN === 'number' ? TS_GAIN : 2} more points of the top threats (each extra change has to earn 2 more). Item fixes come first.</li>
      <li>A suggestion never adds an item problem, never lowers the number of checks passed, never takes away your speed control, never starts a weather clash, and never swaps out a staple for a rare pick.</li>
      <li>If your team has no speed control, one suggestion adds it.</li></ul>`],
  // formats.mjs OFF_FORMAT, oddEvents; update.mjs KEEP and fail-safes; events.mjs
  ['filter', 'What gets left out', 'Themed cups, odd events and thin data', () => `<p><b>Events with extra rules</b> would skew usage and win rates, so every step skips them. By name: ${NP_OFF_WORDS.map(w => `<span class="npw">${esc(w)}</span>`).join(' ')}.</p>
      <p><b>The staples alarm</b> catches the rest: Pokémon on 20%+ of all standard teams always show up at a normal event. If one is expected on 8+ of an event's teams but is on none (about a 1 in 3,000 chance), the event is treated as a restricted format and left out.</p>
      <ul class="npdots"><li>Win rates and team records use teams with all six listed and 3+ games played.</li><li>The Events page lists online events with 32+ players from the last 30 days, plus official events.</li>
      <li>A day that brings far less data than the day before never replaces it: yesterday's numbers stay.</li><li>Left-out events stay saved, so nothing is lost if a name is matched by mistake.</li></ul>`],
  // .github/workflows/update.yml (cron), 43-data-health.js HEALTH, crosscheck.mjs, health.mjs
  ['fresh', 'Updates and cross-checks', 'Every morning, each number with its date', () => { const H = typeof HEALTH === 'object' ? HEALTH : [], at = typeof DATA_AT === 'object' ? DATA_AT : {};
    const rows = H.filter(([k]) => at[k]).map(([k, l]) => `<li><span>${esc(l)}</span><b>${npDay(new Date(at[k]).toISOString())}</b></li>`).join('');
    return `<ul class="npdots"><li>The data job runs every morning and the page picks it up at about 7 AM New York time.</li>
      <li>Every source carries its own date. An amber note appears on Home and the Meta pages when a daily source is more than 2 days old (events and in-game rankings 3, practice games 4, monthly ladder stats 45), and rating inputs past their date are left out. If the daily job finds a source stale or broken, it alerts us the same morning.</li>
      <li><b>Cross-check:</b> each day our numbers are compared with independent sites (recent tournament usage, online vs official events, ladder usage). Big disagreements are flagged in the daily job's report.</li></ul>
      ${rows ? `<div class="chk" style="margin-top:12px">Data on this page</div><ul class="npdates">${rows}</ul>` : ''}`; }]];
/* "How to read our numbers" (Nov 2): one compact card at the top. The rating bands come from LTIERS, the team-grade bands
   from CH.grade itself (probed, so they follow the code), each letter in the same colour everywhere. */
function npLegend() { const col = k => (LTIERS.find(T => T.k === k) || LTIERS[LTIERS.length - 1]);
  let gb = []; try { const L = ['A', 'B', 'C', 'D']; gb = L.map(k => { for (let s = 0; s <= 100; s++) if (CH.grade(s) === k) return [k, s]; return null; }).filter(Boolean); } catch (e) { gb = []; }
  const gl = gb.length ? `${gb.map(([k, s], i) => `<span>${tierChip(col(k))} ${i ? s + 's' : s + '+'}</span>`).join('')}<span>${tierChip(col('F'))} &lt;${gb[gb.length - 1][1]}</span>` : '';
  const rk = (() => { try { const k = lairRank(lairRows()[0].p); return k ? k.of : null; } catch (e) { return null; } })();
  return `<div class="nplegend" id="np-legend"><div class="chk">How to read our numbers</div>
    <div class="nplrow"><b>Pokémon ratings</b><div class="npbands">${LTIERS.map(T => `<span>${tierChip(T)} ${T.k === 'S' ? '90+' : T.k === 'F' ? '&lt;' + LTIERS[LTIERS.length - 2].show : T.show + 's'}</span>`).join('')}</div></div>
    ${gl ? `<div class="nplrow"><b>Team grades</b><div class="npbands">${gl}</div></div>` : ''}
    <ul class="npdots"><li><b>Bars</b> = rank among all Pokémon: 94 beats 94% of them (top 6%).</li>
      <li><b>#20${rk ? ' of ' + rk : ''}</b> = rank among ${rk ? 'the ' + rk + ' ' : ''}Pokémon with tournament results · <b>likely 80–88</b> = the range, from the games so far.</li>
      <li><b>A % always says of what</b>: % of teams, % wins, % ready.</li><li><b>Grade</b> = % ready ± team strength − missed checks.</li></ul></div>`; }
function renderMethod() { const el = $('methodOut'); if (!el) return; const g = META.model && META.model.games, teams = RES && RES.teams;
  const sub = [teams ? `Built from ${CH.n(teams)} tournament teams` : '', g ? `${CH.n(g)} games in the team model` : '', npFresh()].filter(Boolean).join(' · ');
  const T = META.track, tr = T ? `Tracking since ${npDay(T.since)} · ${T.ev.length} event${T.ev.length === 1 ? '' : 's'} checked` : 'Every rating is saved daily and checked against later events';
  const want = ui.msec; ui.msec = null;
  /* round words 2: the "Built from" sentence becomes number cells; the sentence and the intro go behind "?" (moved, not cut) */
  const tq = (k, t, b) => typeof tipText === 'function' ? tipText(k, t, b) : '';
  const fr = npFresh(), wc = (v, l) => `<span class="wdc"><b>${CH.n(v)}</b><small>${l}</small></span>`;
  const cells = teams || g ? `<div class="wdstats npstats"><div class="wdrow" role="group" aria-label="What the numbers are built from"><span class="wdl">${fr ? fr[0].toUpperCase() + fr.slice(1) : 'Built from'}<span class="wdq">${tq('npsrc', 'What the numbers are built from', (sub ? sub.replace(/ · /g, ', ') + '. ' : '') + "Every grade, rating and verdict here comes from real tournament results and real damage calcs. Tap a part to see exactly how it's worked out.")}</span></span>${teams ? wc(teams, 'tournament teams') : ''}${g ? wc(g, 'games') : ''}</div></div>` : '';
  el.innerHTML = CH.head('Reg M‑C doubles · plain words', 'How we calculate', cells ? '' : esc(sub || 'Every number on NastyPlot, and where it comes from.')).replace(/<\/div>$/, cells + '</div>')
    + `<p class="npintro wdsub">Real results and real damage calcs. Tap a part for the working.</p>` + npLegend()
    + NP_SECTIONS.map(([k, t, s, body]) => { let b = ''; try { b = body(); } catch (e) { b = '<p class="t2">This part needs the day’s data.</p>'; } return CH.fold('np_' + k, t, s, b, k === want).replace('<details ', `<details id="np-${k}" `); }).join('')
    + `<button type="button" class="nptrack" data-view="track"><span class="chk">Track record</span><b>How right have our ratings been?</b><span>${esc(tr)}</span><span class="arr" aria-hidden="true">→</span></button>`;
  if (want) { const d = $('np-' + want); if (d) { d.open = true; setTimeout(() => { try { d.scrollIntoView({block: 'start', behavior: 'smooth'}); } catch (e) {} }, 80); } } }
// entry points: "How we calculate →" under the grade's explanation (My team) and under the Ratings heading
CH.gradeWhy = (old => (G, o) => { const h = old(G, o); return h ? h.replace(/<\/div>$/, `<div class="nprow">${npLink('grade', 'How the grade works')}</div></div>`) : h; })(CH.gradeWhy);
CH.wrap('renderLair', () => { const sec = $('lair'), h = sec && sec.querySelector(':scope > .chpghead'); if (!h || sec.querySelector('.nplinks')) return;
  h.insertAdjacentHTML('afterend', `<div class="nplinks">${npLink('rating', 'How ratings work')}<button type="button" class="nplink" data-view="track">Track record <span aria-hidden="true">→</span></button></div>`); });
