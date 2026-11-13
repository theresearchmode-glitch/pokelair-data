// Behaviour tests, group A: Team (docs/rebuild/inventory/A-team.md). One test per inventory entry, keyed by its ID, written from
// the player's side. Today's selectors live in adapters/current.A-team.mjs; this file uses visible words and adapter helpers only.
import {group, open, TEAM, BOX, OPP, expect, sleep, eventually} from './harness.mjs';
// which wording to expect (Sim, Nov 12): today's page keeps its words; the new build uses the word list and the approved
// My Team designs (A2 "Things to Know", A4 one verdict per row). Each test expects its page's own words, never either.
const NEW = (process.env.ADAPTER || 'current') === 'v2';
const t = group('A-team');
// The kit merges every group's adapter helpers into one ui, so another group's helper with the same name would silently replace
// ours. Re-apply this group's helpers last, so A-team tests always get A-team's meaning (same file name pattern for any adapter).
const MINE = (await import(`./adapters/${process.env.ADAPTER || 'current'}.A-team.mjs`)).default;
async function aopen(o = {}) { const r = await open(o); Object.assign(r.ui, MINE(r.ui, r.pg, o)); return r; }
const RAIN = ['Pelipper', 'Archaludon', 'Basculegion', 'Incineroar', 'Garchomp', 'Sneasler'];
const SAVED = [{name: 'Rain test', team: RAIN}, {name: 'Sun six', team: TEAM}];
const ok = (cond, msg) => expect(cond, msg);
const has = (tx, s, what) => ok(typeof s === 'string' ? tx.toLowerCase().includes(s.toLowerCase()) : s.test(tx), `${what || 'page'} doesn't show ${s}`);
// one open page shared by read-only checks of the same state (saves ~3 s per test); never used by tests that change things
const SHARED = {};
async function view(key, opts, page) { if (!SHARED[key]) { SHARED[key] = await aopen(opts); if (page) { await SHARED[key].ui.go(page, 600); await SHARED[key].ui.waitText(/\w/); } }
  const s = SHARED[key]; if (page && !s.settled) { await s.ui.settle(); s.settled = true; } if (page && (await s.ui.current()) !== s.ui.PAGES[page]) await s.ui.go(page, 600); return s; }
// My Team, drawn and settled. Speed: while a test runs, the next "harness team" page is already loading in the background
// (most tests start from it), so a test rarely waits for a page to open. Each test still gets its own fresh page.
async function warm(o) { const r = await aopen({...o, wait: 200}); await r.ui.go('My Team', 300); await r.ui.waitText(/Strength Score|No team yet|Grade/, 12000); await r.ui.settle(); return r; }
const POOL = new Map(), keyOf = o => JSON.stringify(o);
const prefetch = o => { const k = keyOf(o); if (!POOL.has(k)) POOL.set(k, warm(o).catch(() => null)); };
async function myTeam(o = {team: TEAM}) { const k = keyOf(o), p = POOL.get(k); POOL.delete(k); let r = p ? await p : null;
  if (r && r.pg.isClosed()) r = null; if (!r) r = await warm(o); prefetch({team: TEAM}); return r; }
// Home with the harness team, same idea (a page that has just opened on Home, nothing tapped yet)
let HOMEP = null; const warmHome = () => aopen({team: TEAM}).catch(() => null);
async function homePage() { let r = HOMEP ? await HOMEP : null; HOMEP = warmHome(); if (!r || r.pg.isClosed()) r = await aopen({team: TEAM}); return r; }
const noErrs = r => ok(!r.errs.length, 'page errors: ' + r.errs.join(' | '));

// ================= 1. Home =================
t('HOME-01', 'Home leads with the tagline "Sharply raise your win rate."', async () => {
  const {ui} = await view('home', {team: TEAM});
  const h = await ui.homeHeadline();
  ok(h === 'Sharply raise your win rate.', `first heading reads "${h}"`); });

t('HOME-02', 'Most used #1 card opens that Pokémon\'s info sheet', async () => {
  if (NEW) { /* new build (Home piece 1, decisions.md Nov 12, from the approved mock-up; Preview v74, Sim "love it"): "Most used right
    now", three tiles #2 · #1 · #3, each "<name> N% of ladder teams", the #1 marked "· #1" ("ladder teams": decisions.md Nov 12 3:50 PM) (aria-label "<name>, most used #1, …") */
    const r = await homePage(); const tx = await r.ui.text(); const m = tx.match(/Most used right now .+? [\d.]+% of ladder teams (.+?) ([\d.]+)% of ladder teams · #1 /); ok(m, 'no "Most used right now … <name> N% of ladder teams · #1" hero');
    await r.ui.tapText('most used #1'); const s = await r.ui.infoSheet(); ok(s && s.includes(m[1]), `info sheet for ${m[1]} did not open`); noErrs(r); await r.close(); return; }
  const r = await homePage(); const tx = await r.ui.text();
  const m = tx.match(/Most used, #1 ([\d.]+)% of teams bring (.+?) [A-Z][a-z]+ [\d.]+%/); ok(m, 'no "Most used, #1 … % of teams bring X" hero');
  await r.ui.tapText('Most used, #1'); const s = await r.ui.infoSheet(); ok(s && s.includes(m[2]), `info sheet for ${m[2]} did not open`); noErrs(r); await r.close(); });

t('HOME-03', 'Runner-up strips (#2, #3) open their info sheets', async () => {
  if (NEW) { /* new build (Home piece 1, decisions.md Nov 12; Preview v74): #2 and #3 are tiles either side of #1, "<name> N% of ladder teams" */
    const r = await homePage(); const tx = await r.ui.text(); const m = tx.match(/Most used right now (.+?) ([\d.]+)% of ladder teams .+? [\d.]+% of ladder teams · #1 (.+?) ([\d.]+)% of ladder teams/);
    ok(m, 'no #2 and #3 tiles with name and %'); await r.ui.tapText(`${m[1]} ${m[2]}%`); let s = await r.ui.infoSheet(); ok(s && s.includes(m[1]), `info sheet for ${m[1]} did not open`);
    await r.ui.closeInfoSheet(); await r.ui.tapText(`${m[3]} ${m[4]}%`); s = await r.ui.infoSheet(); ok(s && s.includes(m[3]), `info sheet for ${m[3]} did not open`); await r.close(); return; }
  const r = await homePage(); const tx = await r.ui.text(); const m = tx.match(/bring \S+(?: \S+)?? ([A-Z][\w-]+(?: [A-Z]\w*)?) ([\d.]+)% ([A-Z][\w-]+(?: [A-Z]\w*)?) ([\d.]+)%/);
  ok(m, 'no two runner-up strips with name and %'); await r.ui.tapText(`${m[1]} ${m[2]}%`); let s = await r.ui.infoSheet(); ok(s && s.includes(m[1]), `info sheet for ${m[1]} did not open`);
  await r.ui.closeInfoSheet(); await r.ui.tapText(`${m[3]} ${m[4]}%`); s = await r.ui.infoSheet(); ok(s && s.includes(m[3]), `info sheet for ${m[3]} did not open`); await r.close(); });

t('HOME-04', 'Data line names the month, the source and "Data as of <date>"', async () => {
  const {ui} = await view('home', {team: TEAM}); const tx = await ui.text();
  has(tx, /Most used in (January|February|March|April|May|June|July|August|September|October|November|December), (Showdown ladder|Ranked ladder|Online tournaments|Official events)[^.]*\. Data as of [A-Z][a-z]{2} \d{1,2}/, 'Home data line'); });

t('HOME-05', 'This week in the ratings: chips with arrow + number open the matching info sheet', async () => {
  const r = await homePage(); const tx = await r.ui.text(); has(tx, 'This week in the ratings');
  // new build (decisions.md Nov 12, Sim "add a few more"): up to 7 rows on desktop, each "<name> ▲ up N points" (shown scale)
  const chips = await r.ui.ratingMoves(); ok(chips.length >= 1 && chips.length <= (NEW ? 7 : 6), `${chips.length} rating-move chips`);
  for (const c of chips) ok((NEW ? /[▲▼] (up|down) \d+ points$/ : /[▲▼] \d+$/).test(c.text), `chip "${c.text}" has no arrow and number`);
  const c = chips[0], rating = +(c.label.match(/rating (\d+)/) || [])[1]; ok(rating, 'chip label names no rating: ' + c.label);
  await r.ui.tapPokemon(c.text.replace(/ [▲▼].*/, '')); const s = await r.ui.infoSheet(); ok(s && s.includes(c.text.replace(/ [▲▼].*/, '')), 'chip did not open its info sheet');
  await r.close(); });
t('HOME-05b', 'This week chip\'s rating matches the info sheet it opens', async () => {
  const r = await homePage(); const c = (await r.ui.ratingMoves())[0], rating = +(c.label.match(/rating (\d+)/) || [])[1];
  await r.ui.tapPokemon(c.text.replace(/ [▲▼].*/, '')); const s = await r.ui.infoSheet() || '';
  ok(s.startsWith('✕ ' + rating + ' ') || new RegExp('^\\D*' + rating + ' ').test(s), `chip says rating ${rating}, info sheet hero says ${s.slice(0, 12)}`); await r.close(); },
  {known: NEW ? '' : 'chip label "Whimsicott, rating 78" but its info sheet shows 88 (This week reads the weekly track data, the sheet the live rating)'});

t('HOME-06', 'Start buttons: "Score my team" first with a team, "Build me a team" first with none', async () => {
  // new build: Title Case on buttons (decisions.md Nov 11, "Title Case on buttons and headings"); same buttons, same order
  const r = await homePage(); let b = await r.ui.homeStartButtons();
  ok(b.join('|') === (NEW ? 'Score My Team|Build a Team|Plan a Match' : 'Score my team|Build a team|Plan a match'), 'with a team buttons are ' + b.join('|'));
  await r.ui.tapText('Score my team'); ok(await r.ui.current() === 'report', 'Score my team did not open My Team'); await r.close();
  const e = await aopen({team: []}); b = await e.ui.homeStartButtons(); ok(NEW ? b[0] === 'Build Me a Team' && b.includes('Score My Team') && b.includes('Plan a Match') : b[0] === 'Build me a team' && b.includes('Score my team') && b.includes('Plan a match'), 'empty team buttons are ' + b.join('|'));
  await e.ui.tapText('Build me a team'); ok(await e.ui.current() === 'auto', 'Build me a team did not open Build'); await e.close(); });

t('HOME-07', '"Import from Showdown" opens My Team with the Import box ready', async () => {
  const r = await homePage(); await r.ui.tapText('Import from Showdown', 1200);
  // new build: the import sheet is headed "Paste a Team", its button "Replace My Team" (as IO-01's new-build branch; Title Case, decisions.md Nov 11)
  ok(await r.ui.current() === 'report', 'My Team did not open'); const p = await r.ui.editPanel(); ok(p && (NEW ? p.title === 'Paste a Team' && /Replace My Team/.test(p.text) : /Import a team/.test(p.text) && /Replace my team/.test(p.text)), 'no "Import a team" box with "Replace my team"');
  ok(/paste/i.test(await r.ui.focusName()) || (await r.ui.focusName()).includes('Showdown'), 'cursor is not in the paste box (focused: ' + await r.ui.focusName() + ')'); await r.close(); });

t('HOME-08', 'All 11 Tools: each card opens the page named on it', async () => {
  if (NEW) { /* new build (Home piece 4, decisions.md Nov 12, published Preview v76): "Everything NastyPlot does.", 12 tiles (today's 11
    + How We Calculate); each opens the page today's site files the tool under (32-views.js VIEW_PARENT/VIEW_ALIAS): Battle, Meta or Build */
    const r = await homePage(); has(await r.ui.text(), /Everything NastyPlot does\. 12 tools/);
    const B = 'matchup', M = 'meta', BU = 'auto', want = {'Battle Mode': B, Teams: M, 'Type Chart': B, Ratings: M, 'Damage Calc': B, Events: M, 'Test Run': B, 'Popular Sets': M, 'Speed Tiers': B, Archetypes: M, 'Winning Cores': BU, 'How We Calculate': M};
    const tools = await r.ui.homeTools(); ok(tools.length === 12, `${tools.length} tool cards: ${tools.join(', ')}`);
    for (const [name, v] of Object.entries(want)) { ok(tools.includes(name), 'no tool card ' + name); await r.ui.go('Home', 300); await r.ui.tapTool(name); const now = await r.ui.current(); ok(now === v || (v === 'auto' && now === 'build'), `${name} opened ${now}`); }
    noErrs(r); await r.close(); return; }
  const r = await homePage(); has(await r.ui.text(), /All 11 Tools/);
  const want = {'Battle Mode': 'matchup', Teams: 'top', 'Type Chart': 'types', Ratings: 'ratings', 'Damage Calc': 'calc', Events: 'events', 'Test Run': 'gauntlet', 'Popular Sets': 'sets', 'Speed Tiers': 'speed', Archetypes: 'arch', 'Winning Cores': 'cores'};
  const tools = await r.ui.homeTools(); ok(tools.length === 11, `${tools.length} tool cards: ${tools.join(', ')}`);
  for (const [name, v] of Object.entries(want)) { ok(tools.includes(name), 'no tool card ' + name); await r.ui.go('Home', 300); await r.ui.tapTool(name); const now = await r.ui.current(); ok(now === v || (v === 'cores' && now === 'auto'), `${name} opened ${now}`); }
  noErrs(r); await r.close(); });

t('HOME-09', 'Champion\'s six: load needs a second tap, loads with Undo; Copy for Showdown copies', async () => {
  const r = await homePage(); await r.ui.grantClipboard(); const tx = await r.ui.text();
  // new build (Home piece 2, the mock-up's duel; Preview v74, Sim "love it"; decisions.md Nov 12): the same line with "·" between parts
  ok((NEW ? /The Champion's six · latest winner .+ Champion · \d+-\d+ · [A-Z][a-z]{2} \d+ · \d+ players/ : /The Champion's Six Latest winner .+ Champion, \d+-\d+, [A-Z][a-z]{2} \d+, \d+ players/).test(tx), 'no champion line with record, date, players');
  ok(/All \d+ events ›/.test(tx), 'no "All N events ›" link');
  await r.ui.tapText('Load this team'); ok(await r.ui.sees('Tap again to replace your team'), 'first tap did not ask to tap again');
  ok((await r.ui.team()).join() === TEAM.join(), 'first tap already replaced the team');
  await r.ui.tapText('Tap again to replace your team', 1200); const now = await r.ui.team(); ok(now.join() !== TEAM.join() && now.length === 6, 'second tap did not load the champion six');
  ok(await r.ui.waitToast(/./) && await r.ui.has('#toastUndo'), 'no Undo toast after loading');
  await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not restore my team');
  // new build: the copy toast reads "Team copied for Showdown" (as IO-03's new-build branch, Sim Nov 11)
  await r.ui.go('Home'); await r.ui.clearToasts(); await r.ui.tapText('Copy for Showdown'); ok(await r.ui.waitToast(NEW ? /^Team copied for Showdown/ : /Copied.*paste into Showdown/), 'no "Copied — paste into Showdown" toast');
  const c = await r.ui.copied(); ok(c && /@ .+\nAbility: /.test(c), 'clipboard holds no Showdown team'); await r.close(); });

t('HOME-10', 'vs panel: your six, a lead/back/bench plan, Prep vs the Champion sets Battle', async () => {
  const r = await aopen({fresh: true}); const tx = await r.ui.text();
  // new build (decisions.md Nov 12): the weather word sits in the eyebrow "Your six · <team name> · Sun team"
  has(tx, 'Sun Tailwind (sample)'); has(tx, NEW ? /Your six · Sun Tailwind \(sample\) · Sun team/ : /Your team: 6\/6 Sun team/);
  ok(/Game [Pp]lan vs the Champion's six: lead .+ \+ .+, back .+ \+ .+, bench .+ \+ .+\./.test(await r.ui.homePlanLine() || ''), 'no lead/back/bench plan line: ' + await r.ui.homePlanLine());
  has(tx, 'Open my team'); await r.ui.tapText('Prep vs the Champion', 1200); ok(await r.ui.current() === 'matchup', 'Battle did not open');
  ok(await r.ui.waitToast(/Opponent set/), 'no "Opponent set" toast'); const opp = await r.ui.peek('S.opp.filter(Boolean)'); ok(opp && opp.length === 6, 'opponent six not set');
  await sleep(1000); const ac = await r.acct(); ok(ac && ac.opp.filter(Boolean).length === 6 && Array.isArray(ac.recentOpp) && ac.recentOpp.some(x => x.join() === opp.join()), 'opponent / recent opponents not saved to the account: ' + JSON.stringify(ac && ac.recentOpp));
  await r.close();
  const e = await aopen({team: []}); const et = await e.ui.text(); has(et, 'Your six goes here'); has(et, 'Add your six');
  ok((et.match(/Add a Pokémon/g) || []).length >= 6, 'empty Home team has fewer than six "+ Add a Pokémon" tiles'); await e.ui.tapText('Add your six'); ok(await e.ui.current() === 'report', '"Add your six" did not open My Team'); await e.close(); });

t('HOME-11', 'Sample-team note on Home and My Team; "Import a team" opens Import', async () => {
  const r = await aopen({fresh: true}); has(await r.ui.text(), 'This is a sample team, here to show how NastyPlot works.', 'Home');
  await r.ui.go('My Team', 1500); await r.ui.settle(); has(await r.ui.text(), 'This is a sample team, here to show how NastyPlot works.', 'My Team');
  has(await r.ui.text(), 'Build your own'); await r.ui.tapText('Import a team', 1000); const p = await r.ui.editPanel(); /* new build: the import sheet is headed "Paste a Team" (as HOME-07 / IO-01's new-build branches) */ ok(p && (NEW ? p.title === 'Paste a Team' : /Import a team/.test(p.text)), 'Import panel did not open'); await r.close(); });

t('HOME-12', 'Welcome card on first visit; "Got it" hides it for good', async () => {
  const r = await aopen({fresh: true}); const w = await r.ui.welcomeCardText(); ok(w, 'no welcome card for a first-time visitor');
  // new build (Sim approved the words and buttons, decisions.md Nov 12): "Read your Strength Score"; buttons Copy a Top Team + Got It,
  // no "Build me a team" in the card (the hero above has the start buttons)
  if (NEW) { for (const s of ['How NastyPlot works', 'Get a team', 'Read your Strength Score', 'Plan each match', 'Copy a Top Team', 'Got It']) has(w, s, 'welcome card'); ok(!/Build me a team/i.test(w), 'welcome card repeats "Build me a team"'); }
  else for (const s of ['How NastyPlot works', 'Get a team', 'Read your scouting report', 'Plan each match', 'Build me a team', 'Copy a top team', 'Got it']) has(w, s, 'welcome card');
  await r.ui.tapText('Got it'); ok(!(await r.ui.welcomeCardText()), 'card still there after Got it'); await r.ui.reload(); ok(!(await r.ui.welcomeCardText()), 'card came back after reload'); await r.close();
  const back = await homePage(); ok(!(await back.ui.welcomeCardText()), 'returning visitor sees the welcome card'); await back.close(); });

t('HOME-13', 'What\'s New fold after an update; × dismisses it for good; never for first-time visitors', async () => {
  // the kit re-seeds stored keys on every reload, so seed this one by hand once
  const r = await aopen({fresh: true}); await r.pg.evaluate(() => { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2020-01-01"'); sessionStorage.clear(); }); await r.ui.reload(); ok(await r.ui.sees(/What's New\s+\d+ updates/), 'no What\'s New fold after an update');
  await r.ui.openFold("What's New"); ok(((await r.ui.foldContent("What's New")) || '').length > 80, 'fold lists no updates');
  await r.ui.closeWhatsNew(); ok(!(await r.ui.sees("What's New")), 'fold still shown after ×'); await r.ui.reload(); ok(!(await r.ui.sees("What's New")), 'fold came back after reload'); await r.close();
  const f = await aopen({fresh: true}); ok(!(await f.ui.sees("What's New")), 'first-time visitor sees What\'s New'); await f.close(); });

t('HOME-14', 'Top of the Meta: 10 rated rows, Hidden gems switch changes the list, rows open info sheets', async () => {
  // new build (decisions.md Nov 12, Sim chose the headline "The Meta, right now."; piece 3 rows from the mock-up, Preview v75): headline
  // first, then "NastyPlot ratings, from N tournament teams"; each row "<rank> <name> <letter> tier <rating>" (word list: "S tier"); hint words differ
  const r = await homePage(); const tx = await r.ui.text(); has(tx, NEW ? /The Meta, right now\. NastyPlot ratings, from [\d,]+ tournament teams/ : /NastyPlot ratings: from [\d,]+ tournament teams Top of the Meta/);
  const top = await r.ui.homeTopRows(); ok(top.length === 10, `${top.length} rows`); ok((NEW ? /\b1 \S+(?: \S+)?(?: [XYZ])? [SABCD] tier \d+ 2 / : /Sneasler S \d+ #1|\S+ [SABCD] \d+ #1/).test(tx), 'rows don\'t read "Name S 97 #1"');
  ok(await r.ui.chosen('Top rated') === true, '"Top rated" not chosen by default'); await r.ui.choose('Hidden gems');
  const gems = await r.ui.homeTopRows(); ok(gems.length >= 1 && gems.join() !== top.join(), 'Hidden gems list did not change'); ok(await r.ui.chosen('Hidden gems') === true, 'Hidden gems not shown as chosen');
  const before = tx.match(NEW ? /Highest ratings right now[^.]*\./ : /Highest NastyPlot ratings[^.]*\./); ok(!(await r.ui.text()).includes(before ? before[0] : '@@'), 'hint line did not change for Hidden gems');
  await r.ui.tapPokemon(gems[0].replace(/-Mega.*/, '')); ok(await r.ui.infoSheet(), 'row did not open the info sheet'); await r.ui.closeInfoSheet(); has(await r.ui.text(), 'All ratings ›'); await r.close(); });

t('HOME-15', 'More on Home fold: pairs, what changed, cores, "Log a game" → Battle; stays open after reload', async () => {
  const r = await homePage(); await r.ui.openFold('More on Home'); const f = await r.ui.foldContent('More on Home');
  // new build: "Log a Game" in Title Case (decisions.md Nov 11, Title Case on buttons)
  for (const s of [/Doubles Is Played in Pairs/i, /What changed this week/i, /Rising/, /Falling/, /#\d+ → #\d+/, /Winning Cores/i, /All cores ›/, /Your battles/i, NEW ? /Log a Game/ : /Log a game/]) has(f, s, 'More on Home');
  await r.ui.reload(); ok(await r.ui.foldOpen('More on Home') === true, 'fold closed again after reload');
  await r.ui.tapText(/^Log a game$/, 900); ok(await r.ui.current() === 'matchup', 'Log a game did not open Battle'); await r.close(); });

t('HOME-16', 'Weather chip "Sun team" on Home\'s team card', async () => {
  // new build (decisions.md Nov 12): the weather word ends the eyebrow "Your six · <team name> · Sun team"
  const {ui} = await view('home', {team: TEAM}); ok(await ui.sees(NEW ? /Your six · .+ · Sun team/ : /Your team: 6\/6 Sun team/), 'no "Sun team" weather chip');
  const r = await aopen({team: RAIN}); ok(await r.ui.sees(NEW ? /Your six · .+ · Rain team/ : /Your team: 6\/6 Rain team/), 'Rain team shows no "Rain team" chip'); await r.close(); });

// ================= 2. My Team =================
t('TEAM-01', 'Header: "My team: N of 6, Sun team" and the team name as heading; "No team yet" when empty', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); let tx = await r.ui.text(); has(tx, /My [Tt]eam(?::| ·) 6 of 6(?:,| ·) Sun team/); // today "My team: 6 of 6, Sun team"; new build "My Team · 6 of 6 · Sun team"
  ok(/Sun|Tailwind|Balance|Terrain/.test(await r.ui.teamHeading()), 'heading is not the archetype label: ' + await r.ui.teamHeading());
  await r.ui.switchTeam('Rain test'); ok(await r.ui.teamHeading() === 'Rain test', 'heading after opening a saved team: ' + await r.ui.teamHeading());
  has(await r.ui.text(), /My [Tt]eam(?::| ·) 6 of 6(?:,| ·) Rain team/);
  await r.ui.clearTeam(); tx = await r.ui.text(); has(tx, 'No team yet'); has(tx, /My [Tt]eam(?::| ·) 0 of 6/); await r.close(); });

t('TEAM-02', 'A Pokémon that left the regulation is kept but a note says it\'s left out', async () => {
  const r = await myTeam(); await r.ui.retirePokemonInSlot(5, 'Mewtwo'); const tx = await r.ui.text();
  ok(/Mewtwo/.test(tx) && /left out|isn't in|not in/i.test(tx), 'no note about the Pokémon left out'); ok(!(await r.ui.sixTiles()).some(n => /Mewtwo/.test(n)), 'retired Pokémon is drawn as a tile'); await r.close(); });

t('TEAM-03', 'Strength Score: number + band word + win line + rank; "so far" for 1-5; none when empty', async () => {
  const r = await myTeam({fresh: true}); let s = await r.ui.scoreBlock(); ok(s && s.label === 'Strength Score', 'no Strength Score block');
  ok(s.score === 93 && s.band === 'Top tier', `sample team scores ${s.score} ${s.band}, expected 93 Top tier`);
  const tx = await r.ui.text(); has(tx, /Teams scoring like this win about \d+% against today.s tournament teams/); has(tx, /Top \d+% of tournament teams/); has(tx, 'Why this score?');
  ok(!/\bGrade\b/.test(tx.slice(0, 400)), 'old "Grade" wording shown');
  await r.ui.removeFromTeam('Kingambit'); s = await r.ui.scoreBlock(); ok(s && s.label === 'Strength Score so far', 'five Pokémon not labelled "Strength Score so far"');
  await r.ui.clearTeam(); ok(await eventually(async () => !(await r.ui.scoreBlock()) && !(await r.ui.sees(/Strength Score \d/))), 'a score shows with no team'); await r.close(); });

t('TEAM-04', '"Why this score?" opens the breakdown; its parts add up to the score', async () => {
  const r = await myTeam({fresh: true}); const s = await r.ui.scoreBlock(); ok(await r.ui.whyExpanded() === false, 'button not collapsed at first');
  await r.ui.tapWhyScore(); ok(await r.ui.whyExpanded() === true, 'button not marked expanded'); const w = await r.ui.whyPanel(); ok(w, 'no breakdown panel');
  const base = w.match(/(\d+) from how its Pokémon/); ok(base, 'no "N from how its Pokémon…" part: ' + w.slice(0, 200));
  const adds = [...w.matchAll(/([+−-]\s?\d+) (?:for|from)/g)].map(m => +m[1].replace('−', '-').replace(/\s/g, ''));
  const sum = +base[1] + adds.reduce((a, b) => a + b, 0); ok(Math.abs(sum - s.score) <= 1, `parts add to ${sum}, score is ${s.score} (${w.slice(0, 300)})`);
  has(w, /How sure/); has(w, /How the (grade|Strength Score) works/); await r.ui.tapText(/How the (grade|Strength Score) works/, 900); ok(await r.ui.current() === 'method', 'link did not open How we calculate'); await r.close(); });

t('TEAM-05', 'Switch team fold lists saved teams; tapping one opens it with an Undo toast', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); has(await r.ui.text(), /Switch [Tt]eam \d+ saved/);
  await r.ui.openFold('Switch team'); const f = await r.ui.foldContent('Switch team'); has(f, 'Rain test', 'switch fold');
  await r.ui.switchTeam('Rain test'); ok(await r.ui.teamHeading() === 'Rain test', 'heading did not change'); ok((await r.ui.team()).join() === RAIN.join(), 'team did not switch');
  ok(await r.ui.waitToast(/Opened .Rain test/), 'no "Opened "Rain test"" toast'); ok(await r.ui.has('#toastUndo'), 'toast has no Undo'); await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not return'); await r.close(); });

t('TEAM-06', '"Team Sheet" button opens the Team Sheet page with all six sets', async () => {
  const r = await myTeam(); await r.ui.tapText(/^Team Sheet$/, 900); ok(await r.ui.current() === 'sheet', 'Team Sheet page did not open');
  const tx = await r.ui.text(); has(tx, 'Team Sheet'); for (const n of ['Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler', 'Mega Charizard Y']) has(tx, n, 'Team Sheet'); await r.close(); });

t('TEAM-07', 'Phone jump bar: Suggestions | Matchups | How it plays | Sets; "Sets" scrolls to All Six Sets and opens the sheet', async () => {
  if (NEW) { /* new build (decided Nov 11, r4-team-gaps.md): one jump bar Set | Matchups | Suggestions | Team Checks at every width;
    a link scrolls its section to just under the bar and marks itself (A7, approved Nov 12: on phones the mark follows the scroll) */
    const r = await myTeam({team: TEAM, width: 390}); const j = await r.ui.jumpBar(); ok(j.join('|') === 'Set|Matchups|Suggestions|Team Checks', 'jump bar: ' + j.join('|'));
    ok(await r.ui.chosen('Set') === true, '"Set" not marked at the top of the page'); const b = await r.ui.jumpTarget('Suggestions'); ok(b && b.top > b.vh, 'Suggestions already on screen before the jump: ' + JSON.stringify(b));
    await r.ui.jumpTo('Suggestions'); await sleep(900); const a = await r.ui.jumpTarget('Suggestions'); ok(a && a.top >= 0 && a.top < a.vh / 2, 'Suggestions not scrolled to the top of the screen: ' + JSON.stringify(a));
    ok(await r.ui.chosen('Suggestions') === true && await r.ui.chosen('Set') === false, '"Suggestions" not the marked link after the jump'); ok(await r.ui.noSideScroll(), 'sideways scroll at 390'); await r.close();
    const d = await myTeam({team: TEAM, width: 1280}); ok((await d.ui.jumpBar()).join('|') === 'Set|Matchups|Suggestions|Team Checks', 'desktop jump bar: ' + (await d.ui.jumpBar()).join('|')); await d.close(); return; }
  const r = await myTeam({team: TEAM, width: 390}); const j = await r.ui.jumpBar(); ok(j.join('|') === 'Suggestions|Matchups|How it plays|Sets', 'jump bar: ' + j.join('|'));
  await r.ui.jumpTo('Sets'); ok(await r.ui.onScreen(/^Open Team Sheet/), 'All Six Sets (its Open Team Sheet fold) not scrolled into view'); ok(await r.ui.foldOpen('Open Team Sheet') === true, 'team sheet fold not opened');
  ok(await r.ui.chosen('Sets') === true, '"Sets" not kept highlighted'); ok(await r.ui.noSideScroll(), 'sideways scroll at 390'); await r.close();
  const d = await myTeam({team: TEAM, width: 1280}); ok(!(await d.ui.jumpBar()).length, 'jump bar shows on desktop'); await d.close(); });

t('TEAM-08', 'Your Six: six tiles lead/back/bench; tapping a tile shows its set, tapping again hides it', async () => {
  if (NEW) { /* new build (decided Nov 11, approved mock-up): no "Your Six" heading; the picked Pokémon's set always shows (the first
    lead's before any tap, on phones too), so there is no "Tap a Pokémon…" hint and tapping the picked tile again keeps its set */
    const r = await myTeam({team: TEAM, width: 390}); const tiles = await r.ui.sixTiles(); ok(tiles.length === 6, `${tiles.length} tiles`); ok(!(await r.ui.sees(/Your Six/)), 'a "Your Six" heading shows (removed by design)');
    const plan = await r.ui.gamePlanLine(); const m = plan.match(/lead (.+?) \+ (.+?), back (.+?) \+ (.+?), bench (.+?) \+ (.+?)\./); ok(m, 'no plan line'); ok(tiles.join('|') === m.slice(1).join('|'), `tiles ${tiles.join(',')} not in lead/back/bench order ${m.slice(1).join(',')}`);
    ok(!(await r.ui.sees('Tap a Pokémon to see its set')), 'old "Tap a Pokémon to see its set" hint shows'); ok(new RegExp('Set ' + tiles[0] + ' ').test(await r.ui.setCard()) && await r.ui.tilePressed(tiles[0]), `phone does not show the first lead's (${tiles[0]}) set before any tap`);
    await r.ui.tapTile('Garchomp'); let c = await r.ui.setCard(); ok(/Set Garchomp /.test(c) && !new RegExp('Set ' + tiles[0] + ' ').test(c), 'no set card for Garchomp: ' + c.slice(0, 80)); ok(await r.ui.tilePressed('Garchomp') && !(await r.ui.tilePressed(tiles[0])), 'Garchomp\'s tile not the marked one');
    await r.ui.tapTile('Garchomp'); c = await r.ui.setCard(); ok(/Set Garchomp /.test(c) && await r.ui.tilePressed('Garchomp'), 'second tap hid Garchomp\'s set (the picked set always shows)'); await r.close();
    const d = await myTeam({team: TEAM}), d0 = (await d.ui.sixTiles())[0]; ok(d0 && new RegExp('Set ' + d0 + ' ').test(await d.ui.setCard()), 'desktop did not open the first lead\'s set'); await d.close(); return; }
  const r = await myTeam({team: TEAM, width: 390}); const tiles = await r.ui.sixTiles(); ok(tiles.length === 6, `${tiles.length} tiles`); has(await r.ui.text(), 'Your Six');
  const plan = await r.ui.gamePlanLine(); const m = plan.match(/lead (.+?) \+ (.+?), back (.+?) \+ (.+?), bench (.+?) \+ (.+?)\./); ok(m, 'no plan line'); ok(tiles.join('|') === m.slice(1).join('|'), `tiles ${tiles.join(',')} not in lead/back/bench order ${m.slice(1).join(',')}`);
  ok(await r.ui.sees('Tap a Pokémon to see its set'), 'phone shows no "Tap a Pokémon to see its set" hint'); ok(!(await r.ui.setCard()), 'phone opened a set card before any tap');
  await r.ui.tapTile('Garchomp'); let c = await r.ui.setCard(); ok(c && c.includes('Garchomp'), 'no set card for Garchomp'); ok(await r.ui.tilePressed('Garchomp'), 'tile not marked');
  await r.ui.tapTile('Garchomp'); c = await r.ui.setCard(); ok(!c, 'second tap did not close the card'); await r.close();
  const d = await myTeam({team: TEAM}); ok(await d.ui.setCard(), 'desktop did not open the first lead\'s set'); await d.close(); });

t('TEAM-09', 'Lock and Remove on a tile: lock label flips; × removes with Undo', async () => {
  const r = await myTeam(); ok(/^Lock Whimsicott/.test(await r.ui.tileLockLabel('Whimsicott') || (await r.ui.tapTile('Whimsicott'), await r.ui.tileLockLabel('Whimsicott'))), 'no "Lock Whimsicott…" control');
  await r.ui.lockOnTile('Whimsicott'); ok(/^Unlock Whimsicott/.test(await r.ui.tileLockLabel('Whimsicott')), 'label after lock: ' + await r.ui.tileLockLabel('Whimsicott'));
  ok(await r.ui.peek('S.slots[3].lock') === true, 'lock not kept'); await sleep(1000); const a = await r.acct(); ok(a.slots[3].lock === true, 'lock not saved to the account');
  for (const c of await r.ui.suggestionCards()) ok(!/for Whimsicott/.test(c), 'a suggestion swaps out the locked Whimsicott: ' + c);
  await r.ui.removeFromTeam('Rillaboom'); ok(await r.ui.waitToast(/Removed Rillaboom/), 'no "Removed Rillaboom" toast'); ok(!(await r.ui.team()).includes('Rillaboom'), 'not removed');
  await r.ui.tapToastUndo(); ok(await r.ui.waitToast(/Change undone/), 'no "Change undone"'); ok((await r.ui.team()).includes('Rillaboom'), 'Undo did not bring it back'); await r.close(); });

t('TEAM-10', 'Set card: plan role, rating, item, ability, nature, stat points, 4 moves; Edit set and Info sheet', async () => {
  const r = await myTeam(); await r.ui.tapTile('Garchomp'); const c = await r.ui.setCard();
  // button words in any casing (the new build writes buttons in Title Case, Sim Nov 9); the move strips are counted by the adapter
  for (const s of [/Garchomp/, /Dragon/, /Ground/, /(Leads with|In the back with|On the bench)/, /\d+ [SABCD] tier rating/, /Item \S/, /Ability \S/, /Nature \w+ (most run|yours)/, /Stat points \d+ \w+, \d+ \w+/, /Edit set/i, /Info sheet ›/i]) has(c, s, 'set card');
  const moves = await r.ui.setMoveCount(); ok(moves >= 4, `${moves} move strips`);
  await r.ui.tapText('Edit set', 900); let p = await r.ui.editPanel(); ok(p && /Edit Garchomp/.test(p.title + ' ' + p.text), 'Edit set did not open "Edit Garchomp"'); await r.ui.closeEditPanel();
  await r.ui.tapText('Info sheet ›', 900); const s = await r.ui.infoSheet(); ok(s && s.includes('Garchomp'), 'Info sheet did not open'); await r.close(); });

t('TEAM-11', 'Set as lead: plan says "your pick" (saved to the account); "Use NastyPlot\'s pick" goes back; Home follows', async () => {
  const r = await myTeam(); await r.ui.tapTile('Sneasler'); has(await r.ui.setCard(), /Set as [Ll]ead/); await r.ui.tapText(NEW ? 'Set as Lead' : 'Set as lead', 1200);
  ok(await r.ui.waitToast(/Sneasler now leads/), 'no "Sneasler now leads" toast'); let pl = await r.ui.gamePlanLine(); ok(/your pick/.test(pl) && /lead (Sneasler \+|.+ \+ Sneasler)/.test(pl), 'plan line: ' + pl);
  await sleep(1000); const a = await r.acct(); ok(a && Array.isArray(a.leads) && a.leads.includes('Sneasler'), 'lead pick not saved to the account: ' + JSON.stringify(a && a.leads));
  await r.ui.go('Home'); ok(/your leads|Sneasler/.test(await r.ui.homePlanLine()), 'Home plan ignores the pick: ' + await r.ui.homePlanLine());
  await r.ui.go('My Team', 1000); await r.ui.tapText("Use NastyPlot's pick", 1200); ok(await r.ui.waitToast(/Back to NastyPlot.s lead pick/), 'no "Back to NastyPlot\'s lead pick" toast');
  pl = await r.ui.gamePlanLine(); ok(!/your pick/.test(pl), 'still "your pick": ' + pl); await r.close(); });

t('TEAM-12', 'Game plan line names two leads, two back, two bench', async () => {
  const {ui} = await view('team', {team: TEAM}, 'My Team'); ok(/^Game [Pp]lan vs the meta's top six: lead .+ \+ .+, back .+ \+ .+, bench .+ \+ .+\.$/.test(await ui.gamePlanLine() || ''), 'plan line: ' + await ui.gamePlanLine());
  const r = await myTeam({team: ['Garchomp', 'Incineroar']}); ok(/in team order/.test(await r.ui.gamePlanLine() || ''), 'under 4: no "in team order" line'); await r.close(); });

t('TEAM-13', 'Team actions row: Save/Update label, ⋯ menu; empty team keeps only Saved Teams, My Box, ⋯ Import', async () => {
  if (NEW) { /* new build (Sim, Nov 11-12): Save Team, Share, Saved Teams and More ⋯ on the page; the More menu holds Team Sheet, Copy for
    Showdown, Export ("The Showdown text to read, select or copy", opens "Export to Showdown"), Import, Compare, My Box, Clear Team. No
    "Update saved team" for a saved team just opened: it shows "Saved ✓" (A11). Empty team: no save / share / export / clear; "Open a
    saved team", "Import a team" stay, and My Box is the header icon (rule 5) */
    const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.openMoreActions(); const a = await r.ui.teamActions();
    for (const s of ['Saved Teams', 'My Box', 'Compare with…', 'Copy for Showdown', 'Save team', 'Share', 'Import', 'Export', 'Clear team', 'Team Sheet']) ok(a.includes(s), 'no action ' + s + ' in ' + a.join('|'));
    const ex = (await r.ui.moreMenuRows()).find(x => x.label === 'Export'); ok(ex && ex.sub === 'The Showdown text to read, select or copy', 'More menu has no "Export" row with its line: ' + JSON.stringify(await r.ui.moreMenuRows()));
    await r.ui.teamAction('Export'); const p = await r.ui.editPanel(); ok(p && p.title === 'Export to Showdown', '"Export" did not open "Export to Showdown" (' + (p && p.title) + ')'); await r.ui.closeEditPanel();
    await r.ui.teamAction('Saved Teams'); ok(await r.ui.current() === 'teams', 'Saved Teams did not open'); await r.ui.go('My Team', 800);
    await r.ui.teamAction('My Box'); ok(await r.ui.current() === 'box', 'My Box did not open'); await r.ui.go('My Team', 800);
    await r.ui.teamAction('Compare with…'); ok(await r.ui.current() === 'compare', 'Compare did not open'); await r.ui.go('My Team', 800);
    await r.ui.switchTeam('Rain test'); const b = await r.ui.teamActions(); ok(b.includes('Saved ✓') && !b.includes('Update saved team') && !b.includes('Save team'), 'saved team just opened: not "Saved ✓": ' + b.join('|'));
    await r.ui.clearTeam(); await r.ui.openMoreActions(); const e = await r.ui.teamActions();
    for (const s of ['Save team', 'Update saved team', 'Saved ✓', 'Share', 'Export', 'Copy for Showdown', 'Clear team']) ok(!e.includes(s), 'empty team still shows ' + s + ': ' + e.join('|'));
    for (const s of ['Saved Teams', 'Import']) ok(e.includes(s), 'empty team lost ' + s + ': ' + e.join('|'));
    await r.ui.tapLabel('My Box', 900); ok(await r.ui.current() === 'box', 'empty team: the My Box icon did not open My Box'); await r.close(); return; }
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.openMoreActions(); const a = await r.ui.teamActions();
  for (const s of ['Saved Teams', 'My Box', 'Compare with…', 'Copy for Showdown', 'Save team', 'Share', 'Import', 'Export', 'Clear team']) ok(a.includes(s), 'no action ' + s + ' in ' + a.join('|'));
  await r.ui.teamAction('Saved Teams'); ok(await r.ui.current() === 'teams', 'Saved Teams did not open'); await r.ui.go('My Team', 800);
  await r.ui.teamAction('My Box'); ok(await r.ui.current() === 'box', 'My Box did not open'); await r.ui.go('My Team', 800);
  await r.ui.teamAction('Compare with…'); ok(await r.ui.current() === 'compare', 'Compare did not open'); await r.ui.go('My Team', 800);
  await r.ui.switchTeam('Rain test'); ok((await r.ui.teamActions()).includes('Update saved team'), 'open saved team: no "Update saved team"');
  await r.ui.clearTeam(); await r.ui.openMoreActions(); const e = await r.ui.teamActions();
  for (const s of ['Save team', 'Update saved team', 'Share']) ok(!e.includes(s), 'empty team still shows ' + s);
  for (const s of ['Saved Teams', 'My Box', 'Import']) ok(e.includes(s), 'empty team lost ' + s); await r.close(); });

t('TEAM-14', 'Clear team: "No team yet", toast "Team cleared"; Undo restores the six and the open saved team', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.switchTeam('Rain test');
  await r.ui.clearTeam(); ok(await r.ui.waitToast(/Team cleared/), 'no "Team cleared" toast'); has(await r.ui.text(), 'No team yet'); ok(!(await r.ui.foldOpen('More team actions')), '⋯ menu stayed open');
  await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === RAIN.join(), 'six not restored'); ok(await r.ui.teamHeading() === 'Rain test', 'open saved team not restored'); await r.close(); });

t('TEAM-15', 'Matchups summary: Favoured/Even/Unfavoured add to 30 and match the Matchups legend', async () => {
  if (NEW) { /* new build (Sim, Nov 12): no Matchups summary in the header; the Matchups section opens with "N Favoured N Even match
    N Unfavoured" (adds to 30), the bar, then "Damage calc: No answer a, Shaky b, Handles it c, Beats it d" (adds to 30) */
    const {ui} = await view('team', {team: TEAM}, 'My Team'); const tx = await ui.text(), at = tx.indexOf('Matchups Against the top 30 threats.');
    ok(at > 0, 'no Matchups section "Against the top 30 threats."'); const pre = tx.slice(0, at).match(/.{0,60}\b(Favoured|Even match|Unfavoured)\b.{0,60}/);
    ok(!pre, 'a Matchups summary shows before the Matchups section: …' + (pre && pre[0]) + '…');
    const m = tx.slice(at).match(/^Matchups Against the top 30 threats\. Verdicts from real tournament games with your Pokémon; a row notes when the calc disagrees\. (\d+) Favoured (\d+) Even match (\d+) Unfavoured Damage calc: No answer (\d+), Shaky (\d+), Handles it (\d+), Beats it (\d+) /);
    ok(m, 'Matchups section does not open with "N Favoured N Even match N Unfavoured" then "Damage calc: …": ' + tx.slice(at, at + 300));
    const [f, e, u, a, b, c, d] = m.slice(1).map(Number); ok(f + e + u === 30, 'Favoured/Even match/Unfavoured add to ' + (f + e + u)); ok(a + b + c + d === 30, 'Damage calc levels add to ' + (a + b + c + d));
    const bar = await ui.matchupsBar(); ok(bar && bar.section === 'Matchups' && bar.before === `${f} Favoured ${e} Even match ${u} Unfavoured` && /^Damage calc: /.test(bar.after), 'the bar is not between the summary and the Damage calc line: ' + JSON.stringify(bar));
    for (const [k, n] of [['fav', f], ['even', e], ['unf', u]]) ok(Math.abs(bar[k] - n / 30 * 100) < 0.1, `the bar's ${k} share is ${bar[k]}, not ${n} of 30`); return; }
  const {ui} = await view('team', {team: TEAM}, 'My Team'); const tx = await ui.text();
  const m = tx.match(/Matchups (\d+) Favoured (\d+) Even (\d+) Unfavoured vs the top 30 threats in real games/); ok(m, 'no "N Favoured / N Even / N Unfavoured" summary');
  ok(+m[1] + +m[2] + +m[3] === 30, 'numbers add to ' + (+m[1] + +m[2] + +m[3])); has(tx, /Damage calc: covers \d+ of 30/);
  const l = tx.match(/Unfavoured (\d+) Even match (\d+) Favoured (\d+)/); ok(l && l[1] === m[3] && l[2] === m[2] && l[3] === m[1], 'header numbers differ from the Matchups legend'); });

t('TEAM-16', 'Legal and "Team checks 4/4" badge with the rules tooltip', async () => {
  const r = await myTeam({fresh: true}); const tx = await r.ui.text(); has(tx, /\bLegal\b/); if (NEW) has(tx, /All 4 basics( and all \d+ notes)? pass/); else has(tx, /Team checks 4\/4/); /* new build (Sim, Nov 12, C1: names only on tabs): the 4/4 count left the tab; the Team Checks section says it in words. (Correction, Nov 13: an earlier note here said the count moved to the heading; it did not.) */ // today one badge "Legal Team checks 4/4"; new build a Legal mark + the Team Checks count
  ok(/Based on our reading of the Reg M-C rules/.test(await r.ui.rulesTooltip() || ''), 'no rules tooltip'); await r.close();
  const {ui} = await view('team', {team: TEAM}, 'My Team'); const t2 = await ui.text(); has(t2, /\bLegal\b/); if (NEW) { ok(!/All 4 basics/.test(t2), 'a 2/4 team says all 4 basics pass'); has(t2, /Team Checks/); } else has(t2, /Team checks 2\/4/); });

t('TEAM-18', 'Weather backdrop behind a sun team\'s header', async () => {}, {skip: 'decorative animation on the old header, mostly covered by the arena layout (inventory unsure it shows); needs a visual check, not a behaviour test'});

t('TEAM-19', 'Empty team: Darkrai, invitation, "Add your first Pokémon" opens the add box; six "+ Add a Pokémon"', async () => {
  if (NEW) { /* new build (Sim, Nov 11): "Six spots, all yours." with Build Me a Team / Add a Pokémon / Import a team, and today's
    underdog (a rotating Pokémon from the bottom of our ratings) instead of Darkrai; no six "+ Add" tiles */
    const r = await myTeam({team: []}); const tx = await r.ui.text();
    has(tx, /^My Team · 0 of 6 · No team yet Six spots, all yours\. Add a Pokémon to start, or let us build a whole team around a favourite\. Build Me a Team Add a Pokémon Import a [Tt]eam /); /* Title Case (Sim, Nov 12) */
    has(tx, /Today's underdog (.+?)\. Somebody's favourite\. Rarely picked in tournaments, but every Pokémon deserves its moment\. Maybe it's yours\? Add \1 to My Team Info Sheet/);
    /* Sim, Nov 13 (First visit Q1 B, the approved first-visit mock-up): six empty spots beside the lead, and "Or Start from a
       Winner" (today's six highest-rated) beside the underdog; still no Darkrai: one underdog sprite + six winner sprites */
    const pics = await r.ui.emptyTeamPictures(), ud = pics.filter(x => x.underdog), other = pics.filter(x => !x.underdog);
    ok(ud.length === 1 && /art\/\d+\.webp$/.test(ud[0].src) && other.length === 6 && other.every(x => /art\/\d+\.webp$/.test(x.src)), 'pictures on the empty My Team are not the underdog + six winners (no Darkrai): ' + JSON.stringify(pics));
    has(tx, /Or Start from a Winner Today's six highest-rated Pokémon\. Tap one to build a team around it\./);
    ok(await r.ui.emptyTiles() === 6, 'not six "+ Add a Pokémon" spots'); ok(!/Suggestions|Matchups|Who Beats You|Team Checks/.test(tx), 'parts 1-3 still shown');
    await r.ui.tapText(/^Add a Pokémon$/, 900); const nb = await r.ui.nameBox(); ok(nb && nb.focused, 'Add a Pokémon did not open the add box with the name box focused'); await r.ui.closeEditPanel(); await r.ui.settle();
    await r.ui.tapText(/^Build Me a Team$/, 900); ok(await r.ui.current() === 'auto', 'Build Me a Team did not open Build (' + await r.ui.current() + ')'); await r.close(); return; }
  const r = await myTeam({team: []}); const tx = await r.ui.text();
  has(tx, 'Add your six and NastyPlot scouts the top 30 threats for you.'); has(tx, 'Build me a team'); ok(await r.ui.emptyTiles() === 6, 'not six "+ Add a Pokémon" tiles');
  ok(await r.ui.pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] img')].some(i => i.getClientRects().length && i.src === window.NP_MASCOT)), 'no Darkrai picture');
  ok(!/Suggestions What to Change|Who Beats You/.test(tx), 'parts 1-3 still shown'); has(tx, /Tap a Slot to Add a Pokémon/i);
  await r.ui.tapText('Add your first Pokémon', 900); const p = await r.ui.editPanel(); ok(p && /Add a Pokémon/.test(p.title + p.text), 'add panel did not open');
  const nb = await r.ui.nameBox(); ok(nb && nb.focused, 'name box not focused'); await r.ui.closeEditPanel(); await r.ui.settle();
  await r.ui.tapText(/^Build me a team$/, 900); ok(await r.ui.current() === 'auto', 'Build me a team did not open Build'); await r.close(); });

t('TEAM-20', 'Partial team: "so far" score, "+ X added" suggestions, no Your games, Save/Share available', async () => {
  const r = await myTeam({team: ['Garchomp', 'Incineroar']}); const s = await r.ui.scoreBlock(); ok(s && s.label === 'Strength Score so far', 'score not "so far"');
  const c = await r.ui.suggestionCards(); ok(c.length && /\+ ?\S+.* added/.test(c[0]), 'first suggestion is not "+ X added": ' + c[0]);
  ok(!(await r.ui.myGamesCard()), '"Your games" shows for 2 Pokémon'); const a = await r.ui.teamActions(); for (const x of ['Compare with…', 'Save team', 'Share']) ok(a.includes(x), 'no ' + x);
  ok(await r.ui.emptyTiles() === 4, 'not four empty tiles'); await r.close(); });
t('TEAM-13b', 'Empty team: the ⋯ menu hides Export and Clear team (only Import stays)', async () => {
  const r = await myTeam({team: []}); await r.ui.openMoreActions(); const e = await r.ui.teamActions();
  for (const s of ['Export', 'Clear team']) ok(!e.includes(s), 'empty team still shows ' + s); ok(e.includes('Import'), 'Import missing'); await r.close(); },
  {known: NEW ? '' : 'inventory says Export and Clear team are hidden with an empty team; today they still show in the ⋯ menu (inventory or code is wrong: Sim to decide)'});

// ================= My Team · Part 1 Suggestions =================
// a sample-team player whose saved data lives in this browser only (the kit re-seeds the fake account on reload, so reload
// checks of saved settings use browser storage); note: without the account the kit serves no daily data
const localSample = () => aopen({account: false});

t('SUG-01', 'Suggest from: My Box | Box + catch | Whole roster; toast; remembered after reload', async () => {
  const r = await myTeam(); ok(await r.ui.chosen('Box + catch') === true, '"Box + catch" is not the default');
  await r.ui.choose('Whole roster', 1200); ok(await r.ui.waitToast(/Suggestions use the full roster/), 'no full-roster toast'); ok(await r.ui.chosen('Whole roster') === true, 'not marked chosen');
  await r.ui.choose('My Box', 1200); ok(await r.ui.waitToast(/Suggestions only use your box/), 'no box-only toast');
  await r.ui.choose('Whole roster', 800); await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.chosen('Whole roster') === true, 'pool not remembered after reload'); await r.close(); });

t('SUG-02', 'Megas on team 0/1/2: toast explains, choice saved to the account (and kept after reload)', async () => {
  const r = await myTeam(); ok(await r.ui.chosen('2') === true, 'Megas default is not 2');
  await r.ui.choose('0', 1500); ok(await r.ui.waitToast(/Teams without Megas: rare/), 'no "Teams without Megas" toast'); await sleep(1000);
  ok((await r.acct()).megaGoal === 0, 'Mega goal not saved to the account'); await r.ui.choose('2', 1200); ok(await r.ui.waitToast(/Teams aim for 2 Megas/), 'no "Teams aim for 2 Megas" toast'); await r.close();
  const l = await localSample(); await l.ui.go('My Team', 2500); await l.ui.choose('0', 1200); await l.ui.reload(2500); await l.ui.go('My Team', 2500); ok(await l.ui.chosen('0') === true, '0 not kept after reload'); await l.close(); });

t('SUG-03', 'Swap my Mega? No | Yes with toasts', async () => {
  const r = await myTeam(); ok(await r.ui.chosen('No') === true, '"No" not default');
  await r.ui.choose('Yes', 1200); ok(await r.ui.waitToast(/Plans can now swap your Mega/), 'no "Plans can now swap your Mega" toast'); ok(await r.ui.chosen('Yes') === true, 'Yes not chosen');
  await r.ui.choose('No', 1200); ok(await r.ui.waitToast(/Your Mega is protected again/), 'no "Your Mega is protected again" toast'); await r.close(); });
t('SUG-03b', 'Swap my Mega? choice is kept after reload (like Megas on team)', async () => {
  const l = await localSample(); await l.ui.go('My Team', 2500); await l.ui.choose('Yes', 1000); await l.ui.reload(2500); await l.ui.go('My Team', 2500);
  ok(await l.ui.chosen('Yes') === true, '"Yes" reset to "No" after reload'); await l.close(); }, {known: NEW ? '' : 'inventory #22: "Swap my Mega?" is a hidden checkbox and resets on reload while "Megas on team" is saved'});

t('SUG-04', 'Suggestion cards: Apply, "Why?" reasons, "Show N more" then "See all suggestions ›"', async () => {
  const r = await myTeam({team: TEAM, width: 390}); let c = await r.ui.suggestionCards(); ok(c.length === 1, `${c.length} cards shown at first`);
  ok(/\S+ for \S+/.test(c[0]) && /[+±−-]\d+ \(\d+ → \d+\)/.test(c[0]) && /Apply/.test(c[0]), 'first card lacks "X for Y", score change or Apply: ' + c[0]);
  await r.ui.openFold('Why?'); const w = await r.ui.foldContent('Why?'); ok(w && w.length > 60, 'Why? fold lists no reasons');
  const more = (await r.ui.text()).match(/Show (\d) more suggestions?/); ok(more, 'no "Show N more suggestions"'); await r.ui.tapText(more[0], 1200);
  c = await r.ui.suggestionCards(); ok(c.length === 1 + +more[1], `${c.length} cards after Show more`); ok(await r.ui.sees('See all suggestions ›'), 'link did not become "See all suggestions ›"');
  await r.ui.tapText('See all suggestions ›', 1200); ok(await r.ui.current() === 'coverage', 'See all did not open All suggestions'); await r.close(); });

t('SUG-05', 'Apply swaps the Pokémon in with an Undo toast; the one swapped out isn\'t offered straight back', async () => {
  const r = await myTeam(); const c = (await r.ui.suggestionCards())[0]; const m = c.match(/(?:→ )?(.+?) for (.+?)(?=[+±−-]\d)/); ok(m, 'card names no swap: ' + c);
  const [inn, out] = [m[1].replace(/^.*→ /, '').trim(), m[2].trim()]; await r.ui.applySuggestionCard(0); await r.ui.settle();
  ok(await r.ui.waitToast(/^Applied: /), 'no "Applied:" toast'); ok(await r.ui.has('#toastUndo'), 'toast has no Undo');
  const tiles = (await r.ui.sixTiles()).join('|'); ok(tiles.includes(inn) && !tiles.includes(out), `tiles after Apply: ${tiles} (expected ${inn} in, ${out} out)`);
  for (const x of await r.ui.suggestionCards()) ok(!x.replace(/^\W*/, '').startsWith(out + ' for '), 'swapped-out Pokémon offered straight back: ' + x); await r.close(); });

t('SUG-06', 'Undo bar: steps back one Apply at a time', async () => {
  const r = await myTeam({team: TEAM, saved: [], width: 1280}); await r.ui.choose('Whole roster', 1500); await r.ui.settle();
  const start = (await r.ui.team()).join();
  await r.ui.applySuggestionCard(0); await r.ui.settle(); const b1 = await r.ui.undoBar(); ok(b1 && /Applied .+ Undo/.test(b1), 'no "Applied … Undo" bar: ' + b1); const after1 = (await r.ui.team()).join();
  ok((await r.ui.suggestionCards()).length, 'no second suggestion to apply'); await r.ui.applySuggestionCard(0); await r.ui.settle(); const b2 = await r.ui.undoBar(); ok(b2 && b2 !== b1, 'bar did not show the second Apply');
  await r.ui.undoLastApplied(); await r.ui.settle(); ok(await r.ui.waitToast(/^Undone: /), 'no "Undone:" toast'); ok((await r.ui.team()).join() === after1, 'first Undo did not step back one');
  ok(await r.ui.undoBar() === b1, 'bar does not show the first Apply again: ' + await r.ui.undoBar());
  await r.ui.undoLastApplied(); await r.ui.settle(); ok((await r.ui.team()).join() === start, 'second Undo did not return to the start'); ok(!(await r.ui.undoBar()), 'bar still shown'); await r.close(); });

t('SUG-07', 'Protect fix: with Protect on only one Pokémon, "Add Protect" puts it in the named sets', async () => {
  const r = await myTeam(); await r.ui.giveMoves('Charizard-Mega-Y', ['Heat Wave', 'Solar Beam', 'Weather Ball', 'Hurricane']); await r.ui.giveMoves('Whimsicott', ['Encore', 'Moonblast', 'Tailwind', 'Taunt']); await r.ui.settle();
  const tx = await r.ui.text(); const m = tx.match(/Fix only (\d) of your six runs? Protect[^]*?Their usual sets run it: ([^.]+?)(?:\.| Add Protect)/); ok(m, 'no Protect fix card');
  const named = m[2].split(/,| and /).map(x => x.trim()).filter(Boolean); await r.ui.tapText(/^Add Protect$/, 1500); ok(await r.ui.waitToast(/Protect/), 'no toast after Add Protect');
  for (const n of named) { const card = await r.ui.showSet(n) || ''; ok(/Protect/.test(card), `${n}'s set has no Protect`); } await r.close(); });

t('SUG-08', '"Nothing to fix" card with Battle and Sets on a complete team', async () => {
  const r = await myTeam({fresh: true, width: 390}); const tx = await r.ui.text(); has(tx, 'Nothing to fix. Your team has every basic and no swap clearly beats it in real games.'); has(tx, /Your edge now comes from how you play it/);
  await r.ui.setWidth(1280); await r.ui.tapText(/^Battle$/, 900); ok(await r.ui.current() === 'matchup', 'Battle button did not open Battle'); await r.ui.go('My Team', 1500); await r.ui.tapText(/^Sets$/, 900); ok(await r.ui.current() === 'sets', 'Sets button did not open Popular sets'); await r.close(); });

t('SUG-09', 'When nothing raises the score: a no-gain message instead of plain Apply cards', async () => {
  const r = await myTeam({fresh: true});
  ok(await r.ui.sees(/Nothing raises this team.s Strength Score right now|No single change from this pool raises the team.s Strength Score|every other swap would lower it|Nothing to fix\. Your team has every basic and no swap clearly beats it/), 'no no-gain message'); await r.close(); });

t('SUG-10', 'Problems and Team Checks: count line, Ice row with Quick add; "Swap out Rillaboom" applies with Undo', async () => {
  /* new build (A2, Sim approved Nov 12): the fold is "Things to Know"; the checks are listed once, in the section above it; Types joined the fold, Sim approved Nov 12 */
  const r = await myTeam(), t0 = await r.ui.text(), FT = NEW ? 'Things to Know' : 'Problems and Team Checks'; has(t0, NEW ? /Things to Know 7 things, types, legal/ : /Problems and Team Checks 7 to look at, 2\/4 checks, legal/);
  await r.ui.openFold(FT, true, 1500); const f0 = await r.ui.foldContent(FT), f = FT === 'Things to Know' ? f0 + '\n' + await r.ui.pg.evaluate(() => { document.querySelectorAll('#tm-ck details').forEach(d => { d.open = true; }); return document.querySelector('#tm-ck').innerText; }) : f0;
  for (const s of [NEW ? /[Ww]eakness Ice 3 weak/ : /Weakness Ice 3 weak/, /Quick add/, /Swap out Rillaboom/, /Show \d+ more/, NEW ? /Team Checks/ : /Team checks 2 of 4 checks/, /Mega Evolution/, /No major weak spot/, /Weak spots spread out/, NEW ? /Handles the top threats/ : /Ready for the top threats/, /Notes, not counted/, /Speed control/, /Spread damage/, /Lead support/, /No answer for/, /Shaky against/, /Type balance/]) has(f, s, 'Problems fold');
  ok(await r.ui.foldOpen('Weakness Ice') === true, 'first fixable problem not opened automatically');
  await r.ui.tapText(/^Show \d+ more$/, 700); ok(await r.ui.waitFor(async () => /Show less/.test(await r.ui.foldContent(FT) || ''), 4000), 'Problems fold shows no "Show less"');
  await r.ui.tapText('Swap out Rillaboom', 1500); await r.ui.settle(); ok(await r.ui.has('#toastUndo'), 'no Undo toast'); ok(!(await r.ui.team()).includes('Rillaboom'), 'Rillaboom not swapped out');
  ok(await r.ui.undoBar(), 'no Undo bar'); await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.foldOpen(FT) === true, 'fold not remembered open'); await r.close(); });

t('SUG-11', '"?" explainer: bubble titled "Ready for the top threats", Escape closes it', async () => {
  /* new build (A2): the fold is "Things to Know" and the threats "?" sits on its check in the section's list */
  const r = await myTeam(), FT = NEW ? 'Things to Know' : 'Problems and Team Checks'; await r.ui.openFold(FT, true, 1200); await r.ui.settle(); if (FT === 'Things to Know') await r.ui.pg.evaluate(() => document.querySelectorAll('#tm-ck details').forEach(d => { d.open = true; })); await r.ui.tapTip(NEW ? 'What is Handles the top threats?' : 'What is Ready for the top threats?');
  const b = await r.ui.waitFor(() => r.ui.tipBubble(), 3000); ok(b && (NEW ? /Handles the top threats/ : /Ready for the top threats/).test(b), 'no bubble titled ' + (NEW ? '"Handles the top threats"' : '"Ready for the top threats"')); ok(/How we calculate|How we work it out|→/.test(b), 'bubble has no link to How we calculate: ' + b);
  await r.ui.press('Escape'); ok(!(await r.ui.tipBubble()), 'Escape did not close the bubble'); await r.close(); });

// ================= My Team · Part 2 Matchups =================
t('MU-01', 'Matchups view switch Top 10 | Top 12 grid | All 30 is remembered', async () => {
  const r = await myTeam(); ok(await r.ui.chosen('Top 10') === true || await r.ui.chosen('Stand-outs') === true, 'neither Top 10 (today) nor Stand-outs (new build, Sim Nov 11) is the default'); await r.ui.choose('All 30', 1200);
  await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.chosen('All 30') === true, 'All 30 not remembered'); await r.close(); });

t('MU-02', 'Top 10 threats with real-games verdict and calc level; phone shows 5 + "Show 5 more"; row opens threat sheet', async () => {
  const r = await myTeam({team: TEAM, width: 390}); if (await r.ui.chosen('Stand-outs') === true) await r.ui.choose('Top 10', 1200); let rows = await r.ui.topThreatRows(); // new build opens on Stand-outs (Sim, Nov 11) ok(rows.length === 5, `${rows.length} rows on a phone`);
  /* new build (A4, Sim approved Nov 12): one verdict per row; the calc shows only when it disagrees ("Calc disagrees: X") */
  for (const x of rows) ok(NEW ? /^\d+ .+ (Favoured|Even match|Unfavoured)( Calc disagrees: (Beats it|Handles it|Shaky|No answer))?$/.test(x) || /^\d+ .+Calc disagrees: (Beats it|Handles it|Shaky|No answer).* (Favoured|Unfavoured)$/.test(x) : /^\d+ .+ (Favoured|Even match|Unfavoured) Calc: (Beats it|Handles it|Shaky|No answer)$/.test(x), 'row reads ' + x);
  const tx = await r.ui.text(); has(tx, /Verdicts from real tournament games/); has(tx, /Unfavoured \d+ Even match \d+ Favoured \d+|\d+ Favoured \d+ Even match \d+ Unfavoured/); has(tx, /Damage calc: No answer \d+, Shaky \d+, Handles it \d+, Beats it \d+/);
  await r.ui.tapText('Show 5 more', 700); rows = await r.ui.topThreatRows(); ok(rows.length === 10, `${rows.length} rows after Show 5 more`); ok(await r.ui.sees('Show top 5 only'), 'no "Show top 5 only"');
  await r.ui.tapThreat('Archaludon'); const s = await r.ui.threatSheet(); ok(s && /Archaludon/.test(s) && await r.ui.threatPressedInSheet() === 'Archaludon', 'threat sheet did not open on Archaludon'); await r.close();
  const {ui} = await view('team', {team: TEAM}, 'My Team'); if (await ui.chosen('Stand-outs') === true) await ui.choose('Top 10', 1200); const dr = await ui.topThreatRows(); ok(dr.length === 10, 'desktop shows ' + dr.length + ' rows: ' + dr.slice(0, 12).map(x => x.slice(0, 14)).join(' / ')); has(await ui.text(), /The next 20, worst first/); });

t('MU-03', 'Top 12 grid: 12 threat rows × 6 cells; a row opens its threat sheet', async () => {
  const r = await myTeam(); await r.ui.choose('Top 12 grid', 1200); const g = await r.ui.gridRows(); ok(g && g.length === 12, `${g && g.length} grid rows`);
  ok(g.every(x => x.cells === 6), 'a row lacks 6 cells'); has(await r.ui.text(), /Tap one for the full matchup/);
  await r.ui.tapGridRow(0); const s = await r.ui.threatSheet(); ok(s && s.includes(g[0].name), 'grid row did not open the threat sheet for ' + g[0].name); await r.close(); });

t('MU-04', 'All 30: "Threat preparation" groups; a threat opens to its calc reasons; Biggest threats list', async () => {
  const r = await myTeam(); await r.ui.choose('All 30', 1500); const tx = await r.ui.text();
  for (const s of [/Threat preparation/, NEW ? /Beats or handles \d+ of the top 30 threats/ : /Ready for \d+% of the top 30 threats/, /Shaky \d+ threats?/, /Handles it \d+ threats?/, /Beats it \d+ threats?/, /Meta Pokémon that hit several of yours hard/]) has(tx, s, 'All 30');
  const first = await r.ui.pg.evaluate(() => { const d = [...document.querySelectorAll('[data-pane="report"] details details, #main details details')].find(e => e.getClientRects().length && /% of top cuts/.test(e.querySelector('summary').innerText)); if (!d) return null; d.querySelector('summary').click(); return d.querySelector('summary').innerText.split('\n')[0]; });
  ok(first, 'no threat fold to open'); await sleep(500); const ft = await r.ui.foldContent(first); ok(ft && /(✓|~|✗)/.test(ft) && /usual set/i.test(ft), `threat ${first} shows no calc reasons / usual set: ${ft && ft.slice(0, 200)}`); await r.close(); });

t('MU-05', 'Threat sheet: opens on the threat, other tiles switch detail, Escape closes and focus returns', async () => {
  const r = await myTeam(); await r.ui.tapThreat('Archaludon'); let s = await r.ui.threatSheet(); ok(s, 'sheet did not open');
  for (const x of [/Scouting report: top 30 threats/, /\d+ threats? need a plan|Ready for every top threat/, /handles \d+ of the top 30/, /% of top cuts/, /Team [Cc]hecks: \d\/4/, /Close/]) has(s, x, 'threat sheet');
  ok(await r.ui.threatPressedInSheet() === 'Archaludon', 'sheet not on Archaludon'); await r.ui.tapThreatInSheet('Farigiraf'); ok(await r.ui.threatPressedInSheet() === 'Farigiraf', 'tile did not switch the detail'); has(await r.ui.threatSheet(), 'Farigiraf');
  await r.ui.press('Escape'); ok(!(await r.ui.threatSheet()), 'Escape did not close');
  await r.ui.tapThreat('Archaludon'); await r.ui.tapText(/^Close$/); ok(!(await r.ui.threatSheet()), 'Close did not close'); await r.close(); });
t('MU-05d', 'Closing the threat sheet puts focus back on the threat row that opened it', async () => {
  const r = await myTeam(); await r.ui.tapThreat('Archaludon'); await r.ui.press('Escape'); ok(/Archaludon/.test(await r.ui.focusName()), 'focus not back on the row: "' + await r.ui.focusName() + '"'); await r.close(); });
t('MU-05b', 'Threat sheet ring shows the Strength Score number and band, not the old letter', async () => {
  const r = await myTeam(); const sc = await r.ui.scoreBlock(); await r.ui.tapThreat('Archaludon'); const s = await r.ui.threatSheet();
  ok(!/^[×✕] Scouting report: top 30 threats \d+ threats? need a plan\. [A-F][+−-]? /.test(s), 'ring shows a grade letter: ' + s.slice(0, 90)); ok(s.includes(sc.band), 'ring has no band word'); await r.close(); },
  {known: NEW ? '' : 'inventory #15: the threat sheet ring still shows the old letter ("B 82.5") instead of the Strength Score and band word'});
t('MU-05c', 'Threat sheet "Best fix" never offers a change that doesn\'t raise the score', async () => {
  const r = await myTeam({fresh: true}); await r.ui.tapThreat('Archaludon'); const s = await r.ui.threatSheet();
  ok(!/Best fix:[^.]*±0/.test(s), 'Best fix offers ±0: ' + (s.match(/Best fix:.{0,60}/) || [''])[0]); await r.close(); },
  {known: 'inventory #14: "Best fix: ±0 (93 → 93)" with "Apply this fix" on the sample team'});

// ================= My Team · Part 3 and 4 =================
t('PLAY-01', 'Game Plan fold: rows with Covered/Missing/Partly; Speed control covered by Whimsicott with Tailwind', async () => {
  if (NEW) { /* new build (Sim, Nov 12): no Game Plan fold; the six's plan line starts with a "Game plan" link that opens a "Game Plan"
    sheet: eyebrow "My Team · <archetype>", one row per gamePlan() row (label, Covered / Partly / Missing / Optional, who, note).
    Nothing is remembered: after a reload no sheet is open and there is no Game Plan fold */
    const r = await myTeam(); ok(/^Game [Pp]lan vs the meta's top six: lead /.test(await r.ui.gamePlanLine() || ''), 'plan line does not start with "Game Plan": ' + await r.ui.gamePlanLine());
    await r.ui.tapText(/^Game [Pp]lan$/, 900); const g = await r.ui.gamePlanSheet(); ok(g && g.title === 'Game Plan', '"Game plan" did not open the Game Plan sheet: ' + JSON.stringify(g));
    const W = s => String(s || '').replace(/\s+/g, ' ').trim();
    const want = await r.ui.peek("[(teamArchetype(members()) || {}).label || '', gamePlan(members()).rows.map(r => [r.label, ({ok: 'Covered', part: 'Partly', miss: 'Missing', opt: 'Optional'})[r.st] || 'Optional', r.who || '', r.note || ''])]");
    ok(want && want[1].length >= 7, 'no gamePlan() rows to compare: ' + JSON.stringify(want)); ok(g.eyebrow === 'My Team' + (want[0] ? ' · ' + want[0] : ''), 'eyebrow "' + g.eyebrow + '", want the archetype "' + want[0] + '"');
    ok(g.rows.length === want[1].length, `${g.rows.length} rows, gamePlan() has ${want[1].length}`);
    want[1].forEach(([l, st, w, n], k) => { const x = g.rows[k] || {}; ok(x.label === l && x.status === st && x.who === W(w) && x.note === W(n), `row ${k + 1} reads ${JSON.stringify(x)}, want ${JSON.stringify([l, st, W(w), W(n)])}`); });
    const sp = g.rows.find(x => x.label === 'Speed control'); ok(sp && /^(Covered|Partly)$/.test(sp.status) && /Whimsicott · Tailwind/.test(sp.who), 'Speed control row: ' + JSON.stringify(sp));
    for (const s of ['Backup speed', 'Weather', 'Terrain', 'Lead support', 'Priority attacks', 'Answer to their speed control']) ok(g.rows.some(x => x.label === s), 'no Game Plan row ' + s);
    await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(!(await r.ui.gamePlanSheet()), 'Game Plan sheet came back after a reload'); ok(await r.ui.foldOpen('Game Plan') === null, 'a Game Plan fold shows'); await r.close(); return; }
  const r = await myTeam(); await r.ui.openFold('Game Plan', true, 800); const f = await r.ui.foldContent('Game Plan');
  has(f, /Speed control (Covered|Partly)[^]*Whimsicott with Tailwind/, 'Game Plan'); for (const s of ['Backup speed', 'Weather', 'Terrain', 'Lead support', 'Priority attacks', 'Answer to their speed control']) has(f, s, 'Game Plan');
  has(f, /(Covered|Missing|Partly|Optional)/); await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.foldOpen('Game Plan') === true, 'Game Plan fold not remembered'); await r.close(); });

t('PLAY-02', 'Types fold: Offense/Defense switch, type grid, Mega pick with two Megas', async () => {
  if (NEW) { /* new build (Sim, Nov 12): a "Types" part inside the Things to Know fold: Offense / Defense slider (kept in np2.seg.types
    across reloads), offense headline "You OHKO or 2HKO N of the top 30 threats", defense headline weaknesses vs resistances, the type
    rows, the two-Mega pick when the team has two Megas, and "Full Tables ›" opening a "Full Tables" sheet with two tables */
    const r = await myTeam({team: ['Charizard-Mega-Y', 'Salamence-Mega', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler']}); await r.ui.openFold('Things to Know', true, 800);
    let f = await r.ui.typesPart() || ''; ok(await r.ui.chosen('Offense') === true && await r.ui.chosen('Defense') === false, 'Offense is not the first view');
    const o = f.match(/^Types Offense Defense What you hit\. You OHKO or 2HKO (\d+) of the top 30 threats (\d+)\/18 types hit super effectively by at least one of yours /);
    ok(o && +o[1] <= 30 && +o[2] <= 18, 'Offense view: ' + f.slice(0, 200)); has(f, /Nobody hits super effectively /, 'Offense view'); ok(!/Only one Mega Evolves/.test(f), 'the Mega pick shows on Offense');
    await r.ui.choose('Defense', 900); f = await r.ui.typesPart() || ''; ok(await r.ui.chosen('Defense') === true, 'Defense not chosen'); ok(await r.ls('np2.seg.types') === 'def', 'Defense not kept in np2.seg.types: ' + await r.ls('np2.seg.types'));
    has(f, /^Types Offense Defense What hits you\. (\d+ more weakness(es)? than resistances|Every weakness is covered by a resist) 6\/6 Pokémon /, 'Defense view');
    for (const s of ['More weak than resist', 'Nobody resists', 'Even split']) has(f, s, 'Defense view');
    has(f, /Only one Mega Evolves per battle, so this reads Mega Charizard Y as the Mega and the others in base form\. Show: Mega Charizard Y · Mega Salamence /, 'two-Mega pick');
    await r.ui.pickTypeChartMega('Mega Salamence'); has(await r.ui.typesPart() || '', /so this reads Mega Salamence as the Mega/, 'Mega pick');
    await r.ui.tapText(/^Full Tables ›$/, 900); const T = await r.ui.typeTables(); ok(T && T.title === 'Full Tables' && T.eyebrow === 'My Team · Types', 'Full Tables sheet: ' + JSON.stringify(T && {title: T.title, eyebrow: T.eyebrow}));
    ok(T.heads.join('|') === 'Offense: what you hit|Defense: what hits you' && T.tables.length === 2, 'Full Tables parts: ' + T.heads.join('|') + ', ' + T.tables.length + ' tables');
    ok(T.tables[0].rows === 18 && T.tables[0].cols.join('|') === 'Defending type|Best|Who hits it super effectively', 'offense table: ' + JSON.stringify(T.tables[0]));
    ok(T.tables[1].rows >= 18 && T.tables[1].cols[0] === 'Attack' && T.tables[1].cols.slice(-3).join('|') === 'Weak|Resist|Net' && T.tables[1].cols.length === 6 + 4, 'defense grid: ' + JSON.stringify(T.tables[1]));
    await r.ui.closeEditPanel().catch(() => {}); await r.ui.pg.evaluate(() => { if (window.V2 && V2._sheet) V2.closeSheet(true); });
    await r.ui.reload(2500); await r.ui.go('My Team', 2500); await r.ui.openFold('Things to Know', true, 800); ok(await r.ui.chosen('Defense') === true, 'Defense view not kept after reload'); has(await r.ui.typesPart() || '', /^Types Offense Defense What hits you\./, 'Types after reload'); await r.close(); return; }
  const r = await myTeam({team: ['Charizard-Mega-Y', 'Salamence-Mega', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler']}); await r.ui.openFold('Types', true, 800);
  let f = await r.ui.foldContent('Types What you hit'); has(f, /You OHKO or 2HKO \d+ of the top 30 threats|types hit super effectively/, 'Offense');
  await r.ui.choose('Defense: what hits you', 1000); f = await r.ui.foldContent('Types What you hit'); has(f, /\d+ more weaknesses than resistances|resistances/, 'Defense'); has(f, /More weak than resist/); has(f, /Only one Mega Evolves per battle, so the chart reads Mega Charizard Y as the Mega/);
  await r.ui.pickTypeChartMega('Mega Salamence'); has(await r.ui.foldContent('Types What you hit'), /reads Mega Salamence as the Mega/, 'Mega pick');
  await r.ui.openFold('Full Tables', true, 500); const rows = await r.ui.pg.evaluate(() => { const t = [...document.querySelectorAll('[data-pane="report"] table')].filter(e => e.getClientRects().length).find(t => /Weak|Net/i.test(t.innerText)); return t ? t.querySelectorAll('tbody tr').length : 0; });
  ok(rows >= 18, `defense type grid has ${rows} rows (want one per attacking type)`); await r.close(); });

t('SETS-01', 'Open Team Sheet fold: one card per Pokémon; tapping opens its edit panel; "−" removes with Undo', async () => {
  if (NEW) { /* new build (Sim, Nov 12): today's "Open Team Sheet" fold is the Team Sheet sheet: one card per Pokémon (item, Ability,
    stats), the two leads marked "↑ Lead vs the meta's top six" (the plan line's lead pair, no other card), a card opens Edit Set. Sim
    dropped the per-card "−": the six's "− Remove" (with Undo) covers removing */
    const r = await myTeam(); const pl = (await r.ui.gamePlanLine() || '').match(/^Game [Pp]lan (vs the meta's top six): lead (.+?) \+ (.+?), back /); ok(pl, 'plan line: ' + await r.ui.gamePlanLine());
    await r.ui.go('Team Sheet', 900); const leads = [pl[2], pl[3]], names = ['Mega Charizard Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'];
    for (const n of names) { const c = await r.ui.teamSheetCard(n) || ''; ok(/ Item .+ Ability /.test(c) && /HP \d+ \d+/.test(c), `${n}'s card misses item / Ability / stats: ` + c.slice(0, 120));
      if (leads.includes(n)) ok(c.startsWith(`${n} ↑ Lead ${pl[1]} Item `), `lead ${n}'s card has no "↑ Lead ${pl[1]}": ` + c.slice(0, 80)); else ok(!/↑ Lead/.test(c), `${n} is not a lead but its card says "↑ Lead": ` + c.slice(0, 80)); }
    ok(await r.ui.teamSheetRemoves() === 0, 'a Team Sheet card still has a remove control'); await r.ui.tapLabel('Whimsicott: edit its set', 1000); const p = await r.ui.editPanel(); ok(p && p.title === 'Edit Whimsicott', 'card did not open "Edit Whimsicott" (' + (p && p.title) + ')'); await r.ui.closeEditPanel();
    await r.ui.removeFromTeam('Whimsicott'); ok(await r.ui.waitToast(/^Removed Whimsicott/), 'no removal toast'); ok(await r.ui.has('#toastUndo'), 'no Undo'); ok(!(await r.ui.team()).includes('Whimsicott'), 'not removed'); await r.close(); return; }
  const r = await myTeam(); await r.ui.openFold('Open Team Sheet', true, 900); const f = await r.ui.foldContent('Open Team Sheet');
  for (const s of ['Whimsicott', 'Garchomp', /Item /, /Ability /, /HP \d+/, /Spe\+? \d+/]) has(f, s, 'team sheet fold');
  await r.ui.tapLabel('Whimsicott: edit its set', 1000); const p = await r.ui.editPanel(); ok(p && /Edit Whimsicott/.test(p.text), 'card did not open "Edit Whimsicott"'); await r.ui.closeEditPanel();
  await r.ui.tapLabel('Remove Whimsicott from the team', 900); ok(await r.ui.waitToast(/Removed Whimsicott/), 'no removal toast'); ok(await r.ui.has('#toastUndo'), 'no Undo'); ok(!(await r.ui.team()).includes('Whimsicott'), 'not removed'); await r.close();
  const ph = await myTeam({team: TEAM, width: 390}); ok(await ph.ui.foldOpen('Open Team Sheet') === false, 'fold open by default on a phone'); await ph.close(); });

t('SETS-02', 'How Scoring Works fold explains Ready for the top threats', async () => {
  if (NEW) { /* new build (Sim, Nov 12): "How Scoring Works" is a fold at the end of the "Why this score?" sheet; its first paragraph now
    starts "Matchups: the 30 Pokémon that make top cut most often" (word list; Sim approved the wording and this test change) */
    const r = await myTeam(); await r.ui.tapWhyScore(); let h = await r.ui.howScoring(); ok(h && h.last && h.title === 'How Scoring Works' && h.open === false, 'no closed "How Scoring Works" fold at the end of Why this score?: ' + JSON.stringify(h && {last: h.last, title: h.title, open: h.open}));
    await r.ui.openFold('How Scoring Works', true, 600); h = await r.ui.howScoring(); ok(h.open, 'fold did not open');
    ok(/^Matchups: the 30 Pokémon that make top cut most often \(weighted by how often\), and for each one whether your team is prepared\. More$/.test(h.paras[0].text), 'first paragraph: ' + h.paras[0].text);
    has(await r.ui.foldContent('How Scoring Works'), /Matchups: the 30 Pokémon that make top cut most often/, 'How Scoring Works'); ok(!/Ready for the top threats/i.test(await r.ui.foldContent('How Scoring Works')), 'still says "Ready for the top threats"'); await r.close(); return; }
  const r = await myTeam(); await r.ui.openFold('How Scoring Works', true, 600); has(await r.ui.foldContent('How Scoring Works'), /Ready for the top threats: the 30 Pokémon that make top cut most often/, 'How Scoring Works'); await r.close(); });

// ================= 3. Edit panel =================
t('EDIT-01', 'Edit panel opens titled "Edit <name>"; Done, Escape and the backdrop close it', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); let p = await r.ui.editPanel(); ok(p && p.title === 'Edit Garchomp', 'panel title: ' + (p && p.title));
  ok(await r.ui.focusInEditPanel(), 'focus did not move into the panel'); // Nov 12: read through the adapter (was today's #chEdit, read here)
  await r.ui.press('Escape'); ok(!(await r.ui.editPanel()), 'Escape did not close');
  await r.ui.openEditPanel('Garchomp'); await r.ui.closeEditPanel(); ok(!(await r.ui.editPanel()), 'Done did not close');
  await r.ui.openEditPanel('Garchomp'); await r.ui.pg.mouse.click(5, 5); await sleep(500); ok(!(await r.ui.editPanel()), 'backdrop tap did not close');
  await r.ui.tapLabel('Garchomp: edit its set').catch(() => {}); await r.close(); });
t('EDIT-01b', 'Closing the edit panel puts focus back on "Edit set"', async () => {
  // the new build writes the button in Title Case, "Edit Set" (Sim's rule); each page is checked for its own exact words
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); await r.ui.press('Escape'); ok((NEW ? /^Edit Set$/ : /^Edit set$/).test(await r.ui.focusName()), 'focus is on "' + await r.ui.focusName() + '"');
  // the new build's sheet is itself labelled "Edit Set", so also make sure it closed and focus is on a button
  if (NEW) ok(!(await r.ui.editPanel()) && await r.ui.pg.evaluate(() => document.activeElement && document.activeElement.tagName === 'BUTTON'), 'focus is not back on the "Edit Set" button (sheet still open?)'); await r.close(); });

t('EDIT-02', 'Six-slot strip in the panel switches the panel to that Pokémon', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); const st = await r.ui.editStrip(); ok(st.length === 6 && st.every(x => /^Edit /.test(x)), 'strip: ' + st.join(','));
  await r.ui.tapStrip(2); ok((await r.ui.editPanel()).title === 'Edit Incineroar', 'third sprite did not switch to Incineroar'); await r.close(); });

t('EDIT-03', 'Slot header: Lock → "Locked" (tile shows locked), types, Mega/rating tags, usage', async () => {
  if (NEW) { /* new build (Sim, Nov 12): Edit Set's line under the name: type chips, "<N> <X> tier rating", "<share> of teams" (the same
    rating and share the shared logic gives: monRating, lairHead); the Mega shows as the Ability's "Mega Ability" and the Item's "Mega
    Stone" tags. Lock reads Lock / Locked; the six's tile is then marked locked (padlock "Locked", accessible name "…, locked") */
    const r = await myTeam(); await r.ui.openEditPanel('Mega Charizard Y'); const p = await r.ui.editPanel();
    const want = await r.ui.peek("(() => { const P = byName.get('Charizard-Mega-Y'), R = monRating(P); let H = null; try { H = lairHead(P); } catch (e) {} return [(P.t || []).join(' '), R ? R.n : null, R ? R.tier : null, H ? V2.shareTxt(H) : null]; })()");
    ok(want && want[1] != null && want[2] && want[3], 'no rating / share to compare: ' + JSON.stringify(want));
    const head = `✕ Edit Set Mega Charizard Y ${want[0]} ${want[1]} ${want[2]} tier rating ${want[3]} of teams `; ok(p.text.startsWith(head), `Edit Set header reads "${p.text.slice(0, head.length + 20)}", want "${head}"`);
    ok(want[0] === 'Fire Flying', 'types: ' + want[0]); has(p.text, /Ability Mega Ability Drought/, 'Edit Set'); has(p.text, /Item Mega Stone Charizardite Y/, 'Edit Set');
    ok(await r.ui.panelLockText() === 'Lock', 'lock reads ' + await r.ui.panelLockText()); let t0 = await r.ui.tileLock('Mega Charizard Y'); ok(t0 && !t0.locked && !t0.padlock, 'tile already locked: ' + JSON.stringify(t0));
    await r.ui.panelLock(); ok(await r.ui.panelLockText() === 'Locked', 'lock did not read "Locked": ' + await r.ui.panelLockText()); has((await r.ui.editPanel()).text, /Locked Suggestions never swap out a locked Pokémon\./, 'Edit Set foot');
    await r.ui.closeEditPanel(); t0 = await r.ui.tileLock('Mega Charizard Y');
    ok(t0 && t0.locked && t0.padlock && t0.padlockLabel === 'Locked' && /^Mega Charizard Y, \w+, locked$/.test(t0.label), 'tile not shown locked: ' + JSON.stringify(t0));
    const g = await r.ui.tileLock('Garchomp'); ok(g && !g.locked && !g.padlock, 'Garchomp\'s tile shows locked too: ' + JSON.stringify(g)); await r.close(); return; }
  const r = await myTeam(); await r.ui.openEditPanel('Mega Charizard Y'); const p = await r.ui.editPanel();
  for (const s of [/Fire Flying/, /Mega/, /S tier \d+/, /[\d.]+% of teams/]) has(p.text, s, 'slot header'); ok(/^Lock$/.test(await r.ui.panelLockText()), 'lock reads ' + await r.ui.panelLockText());
  await r.ui.panelLock(); ok(/^Locked$/.test(await r.ui.panelLockText()), 'lock did not read "Locked"'); await r.ui.closeEditPanel(); ok(/^Unlock/.test(await r.ui.tileLockLabel('Mega Charizard Y') || ''), 'tile padlock not locked'); await r.close(); });

t('EDIT-04', 'Nature picker: choosing saves at once ("Nature saved"), set card says "yours"; "Use <most run>" restores', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); has((await r.ui.editPanel()).text, /Nature Most run/);
  await r.ui.pickInPanel('nature', 'Jolly'); ok(await r.ui.waitToast(/Nature saved/), 'no "Nature saved" toast'); has((await r.ui.editPanel()).text, /Your pick/); await sleep(900);
  const a = await r.acct(); ok(a.slots[1].sp && a.slots[1].sp.doubles && a.slots[1].sp.doubles.nat === 'Jolly', 'nature not saved to the account');
  await r.ui.closeEditPanel(); has(await r.ui.showSet('Garchomp'), /Nature Jolly yours/, 'set card');
  await r.ui.openEditPanel('Garchomp'); await r.ui.panelButton(/^Use Adamant$/); await r.ui.closeEditPanel(); has(await r.ui.showSet('Garchomp'), /Nature Adamant most run/, 'set card after reset'); await r.close(); });

t('EDIT-05', 'Stat points: live total, over-66 warning, Save stat points; Team Sheet shows the new stats', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); has(await r.ui.statTotal() || '', /66 of 66/, 'total');
  await r.ui.setStatPoints([32, 32, 0, 0, 2, 32]); has(await r.ui.statTotal() || '', /98 of 66/, 'total after HP 32'); await r.ui.saveStatPoints();
  has(await r.ui.statMsg() || '', /That's 98 points; Champions allows 66/, 'message');
  await r.ui.setStatPoints([32, 32, 0, 0, 2, 0]); await r.ui.saveStatPoints(); ok(await r.ui.waitToast(/Stat points saved/), 'no "Stat points saved" toast');
  // the new build tags every own choice "Your pick" with its reset beside it (as Nature, Item, Ability); read on the Stat points field itself
  if (NEW) has(await r.ui.panelField('Stat points') || '', /^Stat points Your pick Use the most common 66 of 66 /, 'Stat points field'); else has((await r.ui.editPanel()).text, /Yours/);
  // the new build's Team Sheet is a sheet over My Team, so its Garchomp card is read on its own (the page text starts with My Team's)
  await r.ui.closeEditPanel(); await r.ui.go('Team Sheet', 900); const tx = await r.ui.text(); const g = NEW ? await r.ui.teamSheetCard('Garchomp') || '' : tx.slice(tx.indexOf('Garchomp'), tx.indexOf('Garchomp') + 400);
  if (NEW) has(g, /^Garchomp .* Your spread HP \d+ 32 /, 'Team Sheet Garchomp');
  has(g, /HP \d+ 32/, 'Team Sheet Garchomp'); has(g, /Spe \d+ 0/, 'Team Sheet Garchomp'); await r.close(); });

t('EDIT-06', 'Ability picker: a rarer ability names the common one; "Use Prankster" restores', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Whimsicott'); const other = (await r.ui.panelOptions('ability')).find(x => x && x !== 'Prankster');
  ok(other, 'no other ability to pick'); await r.ui.pickInPanel('ability', other); ok(await r.ui.waitToast(new RegExp(other + ' set \\(most players run Prankster\\)')), 'toast does not name the common ability');
  // reset toast: today "…most-used ability…"; the new build capitalises the game term, "Back to the most-used Ability" (word list)
  has((await r.ui.editPanel()).text, /Your pick/); await r.ui.panelButton(/^Use Prankster$/); ok(await r.ui.waitToast(NEW ? /^Back to the most-used Ability\b/ : /most-used ability/), 'no reset toast'); await r.close(); });

t('EDIT-07', 'Item picker: "Sitrus Berry" gives a toast, "Your pick" tag and "Use Focus Sash"', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Whimsicott'); has((await r.ui.editPanel()).text, /Item Most used/);
  await r.ui.pickInPanel('item', 'Sitrus Berry'); ok(await r.ui.waitToast(/^Sitrus Berry/), 'no item toast'); const p = (await r.ui.editPanel()).text; has(p, /Your pick/); has(p, /Use Focus Sash/);
  await sleep(900); ok(((await r.acct()).slots[3].it || {}).doubles === 'Sitrus Berry', 'item not saved to the account'); await r.close(); });
t('EDIT-07b', 'Item toast uses today\'s words (matchups), not the old "ready for N%" readiness', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Whimsicott'); await r.ui.pickInPanel('item', 'Sitrus Berry'); const tt = await r.ui.waitToast(/^Sitrus Berry/);
  ok(tt && !/ready for \d+% → \d+% of the top threats/.test(tt), 'toast: ' + tt); await r.close(); }, {known: NEW ? '' : 'inventory #20: item toast still says "ready for 85% → 87% of the top threats"'});

t('EDIT-08', 'Moves: change move 4 → toast mentions Offense; "Reset to popular" brings the popular four back', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); const before = await r.ui.panelMoves(); ok(before.length === 4, 'not four move pickers');
  const other = (await r.ui.panelOptions('move3')).find(x => x && x !== '(no move)' && !before.includes(x));
  if (NEW) { /* new build (decided Nov 11, r4-team-gaps.md): the toast says how the Strength Score moved, not "Offense N of 18"; the
    Moves field is tagged "Your pick" like the other fields, and its reset reads "Back to the popular set" (same action as today's "Reset to popular") */
    await r.ui.pickInPanel('move', other, 3); const tt = await r.ui.waitToast(new RegExp('^' + other + ' replaces ' + before[3] + ' · Strength Score (stays at \\d+|\\d+ → \\d+)$'));
    ok(tt, 'no "<move> replaces <old> · Strength Score …" toast: ' + (await r.ui.toasts()).join(' | ')); ok(!/Offense/.test(tt), 'toast still mentions Offense');
    ok((await r.ui.panelMoves()).includes(other), 'move not changed'); has(await r.ui.panelField('Moves') || '', /^Moves Your pick Back to the popular set /, 'Moves field');
    await r.ui.panelButton(/^Back to the popular set$/); ok(await r.ui.waitToast(/^Back to the popular set · Strength Score/), 'no reset toast'); ok((await r.ui.panelMoves()).join() === before.join(), 'popular four not back'); await r.close(); return; }
  await r.ui.pickInPanel('move', other, 3); ok(await r.ui.waitToast(new RegExp(other + ' replaces .*Offense')), 'no "<move> replaces … Offense" toast');
  ok((await r.ui.panelMoves()).includes(other), 'move not changed'); has((await r.ui.editPanel()).text, /Your set/);
  await r.ui.panelButton(/^Reset to popular$/); ok(await r.ui.waitToast(/Back to the popular set/), 'no reset toast'); ok((await r.ui.panelMoves()).join() === before.join(), 'popular four not back'); await r.close(); });

t('EDIT-09', '"Full popular sets ›" closes the panel and opens Popular sets on this Pokémon', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); await r.ui.panelButton('Full popular sets ›'); ok(!(await r.ui.editPanel()), 'panel still open');
  ok(await r.ui.current() === 'sets', 'Popular sets did not open'); has(await r.ui.text(), 'Garchomp', 'Popular sets'); await r.close(); });

t('EDIT-10', 'Weak / Resists fold shows resistances and the ability text', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); await r.ui.openFold('Weak'); const f = await r.ui.foldContent('Weak');
  has(f, /Ice 4×|Ice/, 'fold'); has(f, /Resists/, 'fold'); has(f, /Rough Skin|contact/i, 'fold (ability text)'); await r.close(); });

t('EDIT-11', '"Remove <name> from the team" in the panel: Undo toast, panel becomes "Add a Pokémon"', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); await r.ui.panelButton('Remove Garchomp from the team');
  ok(await r.ui.waitToast(/Removed Garchomp/), 'no "Removed Garchomp" toast'); ok(await r.ui.has('#toastUndo'), 'no Undo'); ok((await r.ui.editPanel()).title === 'Add a Pokémon', 'panel did not switch to "Add a Pokémon"'); await r.close(); });

t('EDIT-12', '"Save team" opens "Edit team" with the save box and all six editors', async () => {
  if (NEW) { /* new build (Sim approved, Nov 12): no stacked "Edit team" panel. "Save Team" opens its own small Save Team sheet (title,
    name box focused, no set editors); each set is edited in Edit Set, whose strip of the six switches Pokémon (EDIT-02 covers the strip
    more closely) */
    const r = await myTeam(); await r.ui.tapText(/^Save team$/, 1000); const p = await r.ui.editPanel(); ok(p && p.title === 'Save Team', 'save sheet title: ' + (p && p.title));
    ok(await r.ui.focusName() === 'Team name', 'the name box is not focused (focus on "' + await r.ui.focusName() + '")'); ok(!/Edit team|Save stat points/i.test(p.text), 'the save sheet holds set editors: ' + p.text.slice(0, 120));
    await r.ui.closeEditPanel(); ok(!(await r.ui.editPanel()), 'save sheet did not close');
    await r.ui.openEditPanel('Garchomp'); const st = await r.ui.editStrip(), six = (await r.ui.team()).map(n => (n === 'Charizard-Mega-Y' ? 'Mega Charizard Y' : n));
    ok(st.join() === six.map(n => 'Edit ' + n).join(), 'Edit Set strip: ' + st.join(',') + ' (team ' + six.join(',') + ')');
    await r.ui.tapStrip(5); const q = await r.ui.editPanel(); ok(q && q.title === 'Edit ' + six[5] && await r.ui.panelSlot() === 5, 'strip did not switch to ' + six[5] + ' (' + (q && q.title) + ')'); await r.close(); return; }
  const r = await myTeam(); await r.ui.tapText(/^Save team$/, 1000); const p = await r.ui.editPanel(); ok(p && /Edit team/.test(p.title + p.text.slice(0, 30)), 'panel not "Edit team"');
  has(p.text, /Save this doubles team/i); ok((p.text.match(/Save stat points/g) || []).length === 6, 'not six set editors'); await r.close(); });

// ================= 4. Adding a Pokémon =================
t('ADD-01', 'Name box: live search, Enter adds, species already on the team are left out', async () => {
  const r = await myTeam({team: TEAM.slice(0, 5)}); await r.ui.tapLabel('Add a Pokémon to slot 6', 900); const nb = await r.ui.nameBox(); ok(nb && nb.focused, 'name box not focused');
  await r.ui.typeName('mega sal'); const opts = await r.ui.nameOptions(); ok(opts.length >= 1 && opts.length <= 8 && /Mega Salamence/.test(opts[0]), 'list: ' + opts.join(' / '));
  ok(/%|–/.test(opts[0]), 'option shows no usage share'); await r.ui.press('Escape'); ok(!(await r.ui.nameOptions()).length && await r.ui.editPanel(), 'Escape closed more than the list');
  await r.ui.typeName('mega sal'); await r.ui.press('Enter', 1200); ok(await r.ui.waitToast(/Mega Salamence added/), 'no "Mega Salamence added" toast'); ok((await r.ui.editPanel()).title === 'Edit Mega Salamence', 'title not "Edit Mega Salamence"');
  await r.ui.panelButton('Remove Mega Salamence from the team'); ok((await r.ui.editPanel()).title === 'Add a Pokémon', 'slot not empty again'); await r.ui.typeName('garch'); ok(/already here/.test(await r.ui.nameListText() || ''), 'no "already here" note: ' + await r.ui.nameListText());
  ok(!(await r.ui.nameOptions()).some(o => /^Garchomp/.test(o)), 'Garchomp offered twice');
  await r.ui.typeName('zzzq'); ok(/No matches/.test(await r.ui.nameListText() || ''), 'no "No matches" note'); await r.close(); });

t('ADD-02', 'Typing in the name box survives a redraw', async () => {
  const r = await myTeam({team: TEAM.slice(0, 5)}); await r.ui.tapLabel('Add a Pokémon to slot 6', 900); await r.ui.typeName('drag');
  await r.ui.peek('render()'); await sleep(800); const nb = await r.ui.nameBox(); ok(nb && nb.value === 'drag' && nb.focused, 'text or focus lost after a redraw: ' + JSON.stringify(nb)); await r.close(); });

// ================= 5. Showdown import / export / copy =================
const PASTE = `Garchomp @ Choice Band
Ability: Rough Skin
Level: 50
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Rock Slide
- Protect

Mewtwo @ Life Orb
Ability: Pressure
- Psychic

Incineroar @ Sitrus Berry
Ability: Intimidate
EVs: 252 HP / 4 Atk / 252 SpD
Careful Nature
- Fake Out
- Bogus Move
- Parting Shot
- Flare Blitz`;
t('IO-01', 'Import a team: legal Pokémon load, skipped ones reported, Undo restores', async () => {
  // the new build's import sheet is headed "Paste a Team" under "Import" (Title Case), its button "Replace My Team"
  const r = await myTeam(); await r.ui.openImport(); const p = await r.ui.editPanel();
  if (NEW) { ok(p && p.title === 'Paste a Team', 'import sheet title: ' + (p && p.title)); has(p.text, /^✕ Import Paste a Team A Showdown team or a NastyPlot team link\. /); has(p.text, /Replace My Team/); }
  else { has(p.text, /Import a team/); has(p.text, /Replace my team/); } has(p.text, /Pokepaste links can't be opened from here/);
  await r.ui.pasteTeam(PASTE); const tt = await r.ui.waitToast(/^Imported 2 Pokémon/); ok(tt, 'no "Imported 2 Pokémon" toast: ' + (await r.ui.toasts()).join(' | '));
  has(tt, /Mewtwo/, 'toast'); has(tt, /Bogus Move/, 'toast'); ok((await r.ui.team()).join() === 'Garchomp,Incineroar', 'team after import: ' + (await r.ui.team()).join());
  await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not restore'); await r.close(); });

t('IO-02', 'Export to Showdown: Showdown text with item, Ability, Level 50, EVs, nature, moves; Copy', async () => {
  if (NEW) { /* new build (Sim, Nov 12): More menu "Export" opens the sheet "Export to Showdown": a readonly box holding exportPaste()
    and "Copy" (toast "Copied"; when the browser blocks copying, the text is selected and the toast says "Press Ctrl+C to copy") */
    const r = await myTeam(); await r.ui.grantClipboard(); await r.ui.openExport(); const p = await r.ui.editPanel(); ok(p && p.title === 'Export to Showdown', 'export sheet title: ' + (p && p.title));
    has(p.text, /^✕ Export Export to Showdown Your team as Showdown text: items, Abilities, level 50, stat points as EVs, natures and moves\. Copy$/, 'export sheet');
    const x = await r.ui.exportText(), want = await r.ui.peek('exportPaste()'); ok(x && want && x === want, 'export box is not the Showdown export: ' + String(x).slice(0, 60));
    ok(/^Charizard @ Charizardite Y\nAbility: \w+/.test(x), 'export starts: ' + x.slice(0, 60)); for (const s of [/Level: 50/, /EVs: /, /\w+ Nature/, /\n- /]) has(x, s, 'export'); ok((x.match(/ @ /g) || []).length === 6, 'not six Pokémon in the export');
    ok((await r.ui.exportBox()).readOnly === true, 'export box can be typed in');
    await r.ui.panelButton(/^Copy$/); ok(await r.ui.waitToast(/^Copied$/), 'no "Copied" toast: ' + (await r.ui.toasts()).join(' | ')); ok(await r.ui.copied() === x, 'clipboard is not the export');
    // copying blocked by the browser (both ways the shared copyText tries): the box's text is selected for Ctrl+C
    await r.ui.clearToasts(); await r.pg.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('blocked')); document.execCommand = () => false; });
    await r.ui.panelButton(/^Copy$/); ok(await r.ui.waitToast(/^Press Ctrl\+C to copy$/), 'no "Press Ctrl+C to copy" toast: ' + (await r.ui.toasts()).join(' | '));
    const b = await r.ui.exportBox(); ok(b && b.focused && b.selected === b.len && b.len > 0, 'export text not focused and selected: ' + JSON.stringify(b)); await r.close(); return; }
  const r = await myTeam(); await r.ui.grantClipboard(); await r.ui.openExport(); const p = await r.ui.editPanel(); has(p.text, /Export to Showdown/);
  const x = await r.ui.exportText(); ok(x, 'no export text'); ok(/^Charizard @ Charizardite Y\nAbility: \w+/.test(x), 'export starts: ' + x.slice(0, 60));
  for (const s of [/Level: 50/, /EVs: /, /\w+ Nature/, /\n- /]) has(x, s, 'export'); ok((x.match(/ @ /g) || []).length === 6, 'not six Pokémon in the export');
  await r.ui.panelButton(/^Copy$/); ok(await r.ui.waitToast(/Copied|Press Ctrl\+C/), 'no copy toast'); await r.close(); });

t('IO-03', 'Copy for Showdown on My Team: toast and six Showdown blocks on the clipboard', async () => {
  // new build (Sim, Nov 11): Copy for Showdown sits in My Team's More menu, and its toast reads "Team copied for Showdown"
  const r = await myTeam(); await r.ui.grantClipboard();
  if (NEW) { await r.ui.teamAction('Copy for Showdown'); ok(await r.ui.waitToast(/^Team copied for Showdown$/), 'no "Team copied for Showdown" toast: ' + (await r.ui.toasts()).join(' | ')); }
  else { await r.ui.tapText('Copy for Showdown'); ok(await r.ui.waitToast(/Copied — paste into Showdown's teambuilder/), 'no copy toast'); }
  const c = await r.ui.copied(); ok(c && c.trim().split(/\n\s*\n/).length === 6, 'clipboard does not hold six blocks'); await r.close(); });

t('IO-04', 'Team Sheet "Copy as text" copies the team', async () => {
  if (NEW) { /* new build (Sim, Nov 12): the Team Sheet's copy button is "Copy for Showdown" (one name per idea; it IS today's "Copy as
    text"): the same Showdown export (exportPaste) and My Team's toast "Team copied for Showdown" */
    const r = await myTeam(); await r.ui.grantClipboard(); await r.ui.go('Team Sheet', 900); await r.ui.tapText(/^Copy for Showdown$/);
    ok(await r.ui.waitToast(/^Team copied for Showdown$/), 'no "Team copied for Showdown" toast: ' + (await r.ui.toasts()).join(' | '));
    const c = await r.ui.copied(), want = await r.ui.peek('exportPaste()'); ok(c && want && c === want, 'clipboard is not the Showdown export: ' + String(c).slice(0, 80));
    ok(c.trim().split(/\n\s*\n/).length === 6 && /Garchomp/.test(c), 'clipboard does not hold the six'); await r.close(); return; }
  const r = await myTeam(); await r.ui.grantClipboard(); await r.ui.go('Team Sheet', 900); await r.ui.tapText('Copy as text'); ok(await r.ui.waitToast(/Team copied as text/), 'no "Team copied as text" toast');
  ok(/Garchomp/.test(await r.ui.copied() || ''), 'clipboard has no team'); await r.close(); });

// ================= 6. Share =================
t('SHARE-01', 'Share box: Team Card / Poster / Sheet switch, Light / Dark style, Save image, Copy team link; Escape closes', async () => {
  const r = await myTeam(); await r.ui.openShare(); let s = await r.ui.waitShareImage(); ok(s, 'no share image');
  for (const x of ['Team Card', 'Team Poster', 'Team Sheet', 'Light', 'Dark', 'Save image', 'Copy team link', 'press and hold the image']) has(s.text, x, 'share box');
  ok(s.w > s.h, 'Team Card is not landscape'); const light = await r.ui.shareImagePixel();
  await r.ui.choose('Team Poster', 1500); s = await r.ui.waitShareImage(); ok(s.h > s.w, 'Team Poster is not portrait');
  await r.ui.choose('Dark', 1500); await r.ui.waitShareImage(); const dark = await r.ui.shareImagePixel(); ok(dark < light - 20, `dark image not darker (${Math.round(light)} → ${Math.round(dark)})`);
  await r.ui.press('Escape'); ok(!(await r.ui.shareBox()), 'Escape did not close'); await r.close();
  // Sim, Nov 12: on an empty team neither site shows a Share button (checked), so the new build skips this step; it pressed a
  // hidden button no player can reach. Today's page keeps it unchanged.
  if (!NEW) { const e = await myTeam({team: []}); await e.ui.peek(`$('shareBtn').click()`); ok(await e.ui.waitToast(/Add some Pokémon first/), 'empty team: no "Add some Pokémon first"'); await e.close(); } });

t('SHARE-02', 'Team Card image is 1200×675', async () => {
  // the new build's share sheet is titled "Share Your Team" for every kind; the Team Card choice is the one picked
  const r = await myTeam(); await r.ui.openShare(); const s = await r.ui.waitShareImage(); ok(s.w === 1200 && s.h === 675, `card is ${s.w}×${s.h}`); ok(s.title === (NEW ? 'Share Your Team' : 'Share card'), 'title: ' + s.title);
  if (NEW) ok(await r.ui.chosen('Team Card') === true, '"Team Card" not the picked kind'); await r.close(); });

t('SHARE-03', 'Team Poster image is 1080×1350', async () => {
  const r = await myTeam(); await r.ui.openShare(); await r.ui.choose('Team Poster', 1500); const s = await r.ui.waitShareImage(); ok(s.w === 1080 && s.h === 1350, `poster is ${s.w}×${s.h}`);
  // new build: the sheet keeps its title "Share Your Team"; the poster is marked by the picked "Team Poster" choice
  if (NEW) { ok(s.title === 'Share Your Team', 'title: ' + s.title); ok(await r.ui.chosen('Team Poster') === true && await r.ui.chosen('Team Card') === false, '"Team Poster" not the picked kind'); } else ok(/poster/i.test(s.title), 'title: ' + s.title); await r.close(); });

t('SHARE-04', 'Team Sheet page "Share as image" opens the box titled "Team Sheet" (1080×1350)', async () => {
  if (NEW) { /* new build (Sim, Nov 12): "Share as Image" closes the Team Sheet and opens the share sheet ("Share Your Team", its title
    for every kind) with the "Team Sheet" kind picked */
    const r = await myTeam(); await r.ui.go('Team Sheet', 900); await r.ui.tapText(/^Share as Image$/, 1500); const s = await r.ui.waitShareImage();
    ok(s && s.title === 'Share Your Team', 'title: ' + (s && s.title)); ok(await r.ui.chosen('Team Sheet') === true && await r.ui.chosen('Team Card') === false, '"Team Sheet" not the picked kind');
    ok(s.w === 1080 && s.h === 1350, `sheet image is ${s.w}×${s.h}`); ok(!(await r.ui.sees('Tap a card to edit its set')), 'the Team Sheet stayed open'); await r.close(); return; }
  const r = await myTeam(); await r.ui.go('Team Sheet', 900); await r.ui.tapText('Share as image', 1500); const s = await r.ui.waitShareImage();
  ok(s && s.title === 'Team Sheet', 'title: ' + (s && s.title)); ok(s.w === 1080 && s.h === 1350, `sheet image is ${s.w}×${s.h}`); await r.close(); });

t('SHARE-05', 'Save image: downloads "<team name> - NastyPlot.png" or says saving isn\'t available here', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.switchTeam('Rain test'); await r.ui.openShare(); await r.ui.waitShareImage();
  const dl = r.pg.waitForEvent('download', {timeout: 4000}).catch(() => null); await r.ui.tapText(/^Save image$/, 800); const d = await dl;
  if (d) ok(d.suggestedFilename() === 'Rain test - NastyPlot.png', 'file name: ' + d.suggestedFilename());
  else ok(await r.ui.sees(/Saving is not available here|Saved\.|Not saved\./), 'neither a download nor a saving message'); await r.close(); });

t('SHARE-06', 'Team link: "Copy team link" copies #team=…; opening it offers "Load it" / "Not now"', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.grantClipboard(); await r.ui.switchTeam('Rain test'); await r.ui.openShare(); await r.ui.waitShareImage();
  await r.ui.tapText('Copy team link', 800); ok(await r.ui.waitToast(/Team link copied/), 'no "Team link copied" toast'); const link = await r.ui.copied(); ok(link && /#team=/.test(link), 'clipboard: ' + link); await r.close();
  const hash = link.slice(link.indexOf('#team='));
  // new build: the offer's button reads "Open This Team" (today "Load it"); its pages are hash routes, so the link's #team=… gives way
  // to My Team's own route (#team) instead of an empty hash
  const o = await aopen({team: TEAM, hash}); ok(await o.ui.waitFor(() => o.ui.sees(/Shared team[\s\S]{0,80}Rain test/)), 'no "Shared team Rain test" bar'); await o.ui.tapText(NEW ? /^Open This Team$/ : /^Load it$/, 1500);
  ok((await o.ui.team()).join() === RAIN.join(), 'team not loaded: ' + (await o.ui.team()).join()); ok(await o.ui.current() === 'report', 'My Team not opened'); ok(await o.ui.waitToast(/Loaded .Rain test. \(6 Pokémon\)/), 'no "Loaded" toast');
  ok(await o.ui.has('#toastUndo'), 'no Undo'); const h = await o.pg.evaluate(() => location.hash); ok(NEW ? h === '#team' : !h, 'hash not removed: ' + h); await o.close();
  const n = await aopen({team: TEAM, hash}); await n.ui.waitFor(() => n.ui.sees('Shared team')); await n.ui.tapText(/^Not now$/, 800); ok(!(await n.ui.sees(/Shared team[\s\S]{0,120}Load it/)), 'bar still there');
  ok((await n.ui.team()).join() === TEAM.join(), 'team changed after Not now'); await n.close(); });

// ================= 7. Your games =================
t('LOG-01', 'Your games card on a full six: "None logged yet." and "Log a game"', async () => {
  // the new build's section reads "Your Games / None logged yet / Log a Game" (Title Case heading and button, Sim's rule)
  const {ui} = await view('team', {team: TEAM}, 'My Team'); const c = await ui.myGamesCard();
  ok(c && (NEW ? /^Your Games None logged yet Log a Game$/.test(c) : /Your games: this six/.test(c) && /None logged yet\./.test(c) && /Log a game/.test(c)), 'card: ' + c); });

t('LOG-02', 'Log a game: two leads, their six from Battle mode, Win → "1–0"; saved to the account', async () => {
  const r = await myTeam({team: TEAM, opp: OPP}); await r.ui.openLogForm(); const f = await r.ui.myGamesCard();
  for (const s of [/Your two leads/, /Their team/, /Use their 6 from Battle mode/, /Win/, /Loss/, /Paste its log/]) has(f, s, 'log form');
  await r.ui.pickLead('Garchomp'); await r.ui.pickLead('Incineroar'); await r.ui.useBattleOpponents(); await r.ui.logResult('W');
  ok(/1–0/.test(await r.ui.myGamesCard()), 'card does not show 1–0: ' + await r.ui.myGamesCard()); await sleep(1000);
  const a = await r.acct(); ok(a.log && a.log.length === 1 && a.log[0].r === 'W' && a.log[0].b.slice(0, 2).join() === 'Garchomp,Incineroar' && a.log[0].o.length === 6, 'log entry not saved: ' + JSON.stringify(a.log)); await r.close(); });

t('LOG-02b', 'Opening "Log a game" with the keyboard moves focus to the first lead', async () => {
  const r = await myTeam(); await r.ui.openLogFormByKeyboard(); ok(/^Mega Charizard Y/.test(await r.ui.focusName()), 'keyboard focus is on "' + await r.ui.focusName() + '"'); await r.close(); });
t('LOG-03', 'After a result: "Loss logged. Undo" removes it ("Game removed")', async () => {
  const r = await myTeam(); await r.ui.openLogForm(); await r.ui.logResult('L'); const c = await r.ui.myGamesCard(); ok(/Loss logged\. ?Undo/.test(c) && /0–1/.test(c), 'card: ' + c);
  await r.ui.undoLoggedGame(); ok(await r.ui.waitToast(/Game removed/), 'no "Game removed": ' + (await r.ui.toasts()).join(' | ') + ' / ' + await r.ui.myGamesCard()); ok(/None logged yet/.test(await r.ui.myGamesCard()), 'record not back'); await r.close(); });

t('LOG-04', 'After 5 games with their teams: "You lose most to …"', async () => {
  const r = await myTeam({team: TEAM, opp: OPP}); await r.ui.openLogForm();
  for (const wl of ['L', 'L', 'W', 'L', 'W']) { if (wl === 'W') has(await r.ui.myGamesCard() || '', /Log \d more games? with this six to see who you lose to most/, 'Your games under 5'); if (!(await r.ui.has('[data-qlres]'))) await r.ui.openLogForm(); await r.ui.pickLead('Garchomp'); await r.ui.pickLead('Sneasler'); await r.ui.useBattleOpponents(); await r.ui.logResult(wl); }
  const c = await r.ui.myGamesCard(); ok(/2–3/.test(c), 'record not 2–3: ' + c); has(c, /You lose most to/, 'Your games'); has(c, /Most used leads/, 'Your games'); await r.close(); });

t('LOG-05', 'Logged games show on the matching saved team and in Compare', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.openLogForm(); await r.ui.logResult('W'); await r.ui.go('Saved Teams', 900);
  // the new build's saved card says "Your games 1–0" in its footer (the card is the six, so no "with this six"); Compare's row is
  // "Your games with this six" with each side's record
  has(await r.ui.savedCardOf('Sun six') || '', NEW ? /\b2\/4 checks Your games 1–0 Open\b/ : /Your games 1–0 with this six/, 'Sun six card'); ok(!/Your games/.test(await r.ui.savedCardOf('Rain test') || ''), 'Rain test shows a record');
  await r.ui.savedAction('Sun six', 'Compare'); await r.ui.savedAction('Rain test', 'Compare'); await r.ui.settle(); has(await r.ui.text(), NEW ? /Your games with this six 1–0 1 game you logged None logged/ : /Your games with this six/, 'Compare'); await r.close(); });

// ================= 8. Team Sheet page =================
// new build (Sim, Nov 12): the Team Sheet opens as a sheet over My Team (from its "Team Sheet" link / More menu); eyebrow
// "← My Team · <team title> · Reg M-C doubles · level 50", heading "Team Sheet", "Copy for Showdown" and "Share as Image", a key line
// that starts "Tap a card to edit its set", and cards that open Edit Set (click, Enter, Space)
t('SHEET-01', 'Team Sheet head: "<team name>: Reg M-C doubles, level 50", "← My Team" back link', async () => {
  if (NEW) { const r = await myTeam({fresh: true}); await r.ui.go('Team Sheet', 900); ok(await r.ui.current() === 'sheet', 'Team Sheet did not open (' + await r.ui.current() + ')');
    has(await r.ui.text(), / ← My Team · Sun Tailwind \(sample\) · Reg M-C doubles · level 50 Team Sheet Copy for Showdown /, 'Team Sheet head');
    await r.ui.tapText(/^← My Team$/, 900); ok(await r.ui.current() === 'report', '"← My Team" did not return to My Team (' + await r.ui.current() + ')'); await r.close(); return; }
  const r = await myTeam({fresh: true}); await r.ui.go('Team Sheet', 900); has(await r.ui.text(), /Sun Tailwind \(sample\): Reg M.C doubles, level 50 Team Sheet/);
  await r.ui.tapText('← My Team', 900); ok(await r.ui.current() === 'report', 'back link did not return to My Team'); await r.close(); });

t('SHEET-02', 'Team Sheet actions and key line', async () => {
  if (NEW) { const r = await myTeam(); await r.ui.go('Team Sheet', 900); const tx = await r.ui.text();
    has(tx, /Team Sheet Copy for Showdown Share as Image Tap a card to edit its set · Big number: the stat at level 50 · small number: stat points \(0–32\) · \+ \/ − nature Mega Charizard Y /, 'Team Sheet actions and key line');
    ok(!/Copy as text/i.test(tx), 'the Team Sheet still says "Copy as text" (one name per idea: Copy for Showdown)'); await r.close(); return; }
  const r = await myTeam(); await r.ui.go('Team Sheet', 900); const tx = await r.ui.text();
  for (const s of ['Share as image', 'Copy as text', 'Big number: the stat at level 50, small number: stat points (0–32), +/− nature']) has(tx, s, 'Team Sheet'); await r.close(); });

t('SHEET-03', 'Six set cards (item, ability, moves, nature, stats); tapping one opens My Team with its edit panel', async () => {
  if (NEW) { const r = await myTeam(); await r.ui.go('Team Sheet', 900); const tx = await r.ui.text();
    for (const n of ['Mega Charizard Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler']) has(tx, n, 'Team Sheet');
    ok((tx.match(/Item /g) || []).length >= 6 && (tx.match(/Ability /g) || []).length >= 6 && (tx.match(/HP \d+ \d+/g) || []).length >= 6, 'cards miss item / ability / stats');
    has(tx, /(Most common spread|yours|your nature)/i);
    // each card opens Edit Set for its own Pokémon: by click, by Enter, by Space (a card is a role=button with tabindex 0)
    for (const [n, how] of [['Garchomp', 'click'], ['Incineroar', 'Enter'], ['Sneasler', 'Space']]) {
      if (how === 'click') await r.ui.tapLabel(n + ': edit its set', 1200); else { ok(await r.ui.focusSheetCard(n), `${n}'s card can't take keyboard focus`); await r.ui.press(how, 1200); }
      ok(await r.ui.current() === 'report', `${how} on ${n}'s card: the Team Sheet is still open`); const p = await r.ui.editPanel(); ok(p && p.title === 'Edit ' + n, `${how} on ${n}'s card: no "Edit ${n}" sheet (${p && p.title})`);
      await r.ui.closeEditPanel(); if (how !== 'Space') await r.ui.go('Team Sheet', 900); }
    await r.close();
    for (const [w, cols] of [[1280, 3], [390, 1]]) { const x = await myTeam({team: TEAM, width: w}); await x.ui.go('Team Sheet', 900); const c = await x.ui.sheetColumns(); ok(c === cols, `${w} wide: ${c} columns, want ${cols}`); await x.close(); } return; }
  const r = await myTeam(); await r.ui.go('Team Sheet', 900); const tx = await r.ui.text();
  for (const n of ['Mega Charizard Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler']) has(tx, n, 'Team Sheet');
  ok((tx.match(/Item /g) || []).length >= 6 && (tx.match(/Ability /g) || []).length >= 6 && (tx.match(/HP \d+ \d+/g) || []).length >= 6, 'cards miss item / ability / stats');
  has(tx, /(Most common spread|yours|your nature)/i); await r.ui.tapLabel('Garchomp', 1200); ok(await r.ui.current() === 'report', 'My Team did not open'); const p = await r.ui.editPanel(); ok(p && p.title === 'Edit Garchomp', 'no "Edit Garchomp" panel'); await r.close();
  for (const [w, cols] of [[1280, 3], [390, 1]]) { const x = await myTeam({team: TEAM, width: w}); await x.ui.go('Team Sheet', 900); const c = await x.ui.sheetColumns(); ok(c === cols, `${w} wide: ${c} columns, want ${cols}`); await x.close(); } });

t('SHEET-04', 'Team Sheet with no team: "No team yet…" and "Open My Team"', async () => {
  if (NEW) { /* the empty My Team has no More menu and no Team Sheet link, so the sheet is opened the way the page's own code does it
    (V2.openTeamSheet, through the adapter's peek); its "Add a Pokémon" button opens search with the name box focused */
    const r = await myTeam({team: []}); await r.ui.peek('V2.openTeamSheet()'); await sleep(600); ok(await r.ui.current() === 'sheet', 'Team Sheet did not open (' + await r.ui.current() + ')');
    has(await r.ui.text(), / ← My Team · Reg M-C doubles · level 50 Team Sheet No team yet\. Add Pokémon on My Team and their full sets show here\. Add a Pokémon$/, 'empty Team Sheet');
    await r.ui.tapText(/^Add a Pokémon$/, 900); const p = await r.ui.editPanel(); ok(p && p.title === 'Search', '"Add a Pokémon" did not open search (' + (p && p.title) + ')');
    const nb = await r.ui.nameBox(); ok(nb && nb.focused, 'search name box not focused'); await r.close(); return; }
  const r = await myTeam({team: []}); await r.ui.go('Team Sheet', 900); has(await r.ui.text(), 'No team yet. Add Pokémon on My Team and their full sets show here.');
  await r.ui.tapText(/^Open My Team$/i, 900); ok(await r.ui.current() === 'report', 'Open My Team did not'); await r.close(); });

// ================= 9. Saved teams =================
t('SAVED-01', 'Save team: name box, "Save as new" → toast "Saved "Test"", button becomes "Update saved team"; saved to the account', async () => {
  if (NEW) { /* new build: a small "Save Team" sheet ("Give this six a name.", the count, Save Team / Cancel); after saving, the main
    button is a quiet "Saved ✓" while the six is unchanged and "Update Saved Team" once it changes (A11, approved Nov 12) */
    const r = await myTeam(); await r.ui.tapText(/^Save team$/, 1000); const p = await r.ui.editPanel(); ok(p && p.title === 'Save Team', 'save sheet title: ' + (p && p.title));
    has(p.text, /Give this six a name\. 0 of 10 saved Save Team Cancel$/, 'save sheet');
    await r.ui.typeSaveName('Test'); await r.ui.tapText(/^Save Team$/, 1200); ok(await r.ui.waitToast(/^Saved .Test.$/), 'no "Saved "Test"" toast'); ok(!(await r.ui.editPanel()), 'save sheet still open');
    let a = await r.ui.teamActions(); ok(a.includes('Saved ✓') && !a.includes('Save team'), 'button not "Saved ✓": ' + a.join('|')); await sleep(1000);
    const ac = await r.acct(); ok(ac.teams.some(x => x.name === 'Test' && x.slots.filter(s => s.n).length === 6) && ac.teams.find(x => x.name === 'Test').id === ac.loadedId, 'saved team not in the account / not open');
    await r.ui.removeFromTeam('Sneasler'); await r.ui.settle(); a = await r.ui.teamActions(); ok(a.includes('Update saved team'), 'button not "Update Saved Team" after a change: ' + a.join('|')); await r.close(); return; }
  const r = await myTeam(); await r.ui.tapText(/^Save team$/, 1000); const p = await r.ui.editPanel(); has(p.text, /Save this doubles team/i); has(p.text, /Save as new/); has(p.text, /Cancel/);
  await r.ui.typeSaveName('Test'); await r.ui.tapText(/^Save as new$/, 1200); ok(await r.ui.waitToast(/Saved .Test./), 'no "Saved "Test"" toast');
  await r.ui.closeEditPanel().catch(() => {}); ok((await r.ui.teamActions()).includes('Update saved team'), 'button not "Update saved team"'); await sleep(1000);
  const a = await r.acct(); ok(a.teams.some(x => x.name === 'Test' && x.slots.filter(s => s.n).length === 6) && a.teams.find(x => x.name === 'Test').id === a.loadedId, 'saved team not in the account / not open'); await r.close(); });
t('SAVED-01b', 'Save panel: empty name saves as "Untitled team"; 10 saved teams disable "Save as new"', async () => {
  const ten = Array.from({length: 10}, (_, i) => ({name: 'Team ' + i, team: TEAM.slice(0, 2)}));
  const r = await myTeam({team: TEAM, saved: ten}); await r.ui.tapText(/^Save team$/, 1000); has((await r.ui.editPanel()).text, /You have 10 saved teams/, 'save panel');
  // the save button found by its label in the open save panel (was today's #saveNew, read directly): today "Save as new", new build "Save Team"
  const SAVE = NEW ? 'Save Team' : 'Save as new', saveBtn = () => r.ui.pg.evaluate(l => { const d = [...document.querySelectorAll('[role=dialog]')].filter(e => e.getClientRects().length && !e.hidden).pop() || document;
    const b = [...d.querySelectorAll('button')].filter(e => e.getClientRects().length).find(e => e.innerText.replace(/\s+/g, ' ').trim() === l); return b ? {disabled: b.disabled} : null; }, SAVE);
  const sb = await saveBtn(); ok(sb && sb.disabled, `"${SAVE}" not disabled at 10: ` + JSON.stringify(sb)); await r.close();
  const e = await myTeam(); await e.ui.tapText(/^Save team$/, 1000); await e.ui.typeSaveName(''); await e.ui.tapText(NEW ? /^Save Team$/ : /^Save as new$/, 1200); ok(await e.ui.waitToast(/Saved .Untitled team./), 'empty name not saved as "Untitled team"'); await e.close(); });

t('SAVED-02', 'Saved Teams head: count (N/10) and where it\'s stored (account vs this browser)', async () => {
  if (NEW) { /* new build (Sim, Nov 12): eyebrow "← My Team · N of 10 saved" ("← My Team" closes the sheet, back on My Team), then
    "Up to 10 teams. Saved and kept in step across your devices." (account) or "Up to 10 teams. Saved in this browser only." */
    const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.go('Saved Teams', 900); const tx = await r.ui.text();
    has(tx, / ← My Team · 2 of 10 saved Saved Teams Up to 10 teams\. Saved and kept in step across your devices\. /, 'Saved Teams head (account): ' + tx.slice(tx.indexOf('← My Team'), tx.indexOf('← My Team') + 130)); ok(!/this browser only/.test(tx), 'account: still says "this browser only"');
    await r.ui.tapText(/^← My Team$/, 900); ok(await r.ui.current() === 'report' && !(await r.ui.pg.evaluate(() => !!(window.V2 && V2._sheet))), '"← My Team" did not close the sheet back to My Team (' + await r.ui.current() + ')'); await r.close();
    const l = await aopen({team: TEAM, saved: SAVED, account: false}); await l.ui.go('Saved Teams', 900); const lx = await l.ui.text();
    has(lx, / ← My Team · 2 of 10 saved Saved Teams Up to 10 teams\. Saved in this browser only\. /, 'Saved Teams head (this browser)'); ok(!/kept in step/.test(lx), 'browser only: still says "kept in step"'); await l.close(); return; }
  const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.go('Saved Teams', 900); const tx = await r.ui.text(); has(tx, /Up to 10 teams\. Saved to your Claude account and kept in step across your devices\./); has(tx, '← My Team'); await r.close();
  const l = await aopen({team: TEAM, saved: SAVED, account: false}); await l.ui.go('Saved Teams', 900); has(await l.ui.text(), /Saved in this browser only: this device isn.t connected to your Claude account\./); await l.close(); });

t('SAVED-02b', 'Saved Teams shows how many of the 10 places are used ("2/10")', async () => {
  const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.go('Saved Teams', 900); has(await r.ui.text(), /2\/10/, 'Saved Teams'); await r.close(); },
  {known: 'inventory SAVED-02 says the head shows the count "(3/10)"; today the count element exists but is hidden (display:none parent), so players never see it'});
t('SAVED-03', 'Sort Recent | Name | Readiness; "Name" is alphabetical', async () => {
  const r = await aopen({team: TEAM, saved: [{name: 'Zed', team: RAIN}, {name: 'alpha', team: TEAM}, {name: 'Mid', team: TEAM.slice(0, 3)}]}); await r.ui.go('Saved Teams', 900);
  // the new build's sort reads Newest | Name | Matchups (word list: Matchups, not "Readiness"; today "Recent | Name | Readiness")
  const [RECENT, READY] = NEW ? ['Newest', 'Matchups'] : ['Recent', 'Readiness'];
  ok(await r.ui.chosen(RECENT) === true, RECENT + ' not default'); if (NEW) ok(await r.ui.chosen('Recent') === null && await r.ui.chosen('Readiness') === null, 'old sort words still shown');
  await r.ui.choose('Name', 700); const names = (await r.ui.savedCards()).map(c => c.split(' ')[0]);
  ok(names.join() === 'alpha,Mid,Zed', 'Name order: ' + names.join()); await r.ui.choose(READY, 700); if (NEW) ok(await r.ui.chosen(READY) === true, READY + ' sort not marked chosen'); ok((await r.ui.savedCards()).length === 3, 'Readiness sort lost cards'); await r.close(); });

t('SAVED-04', 'Saved team card: name, six tiles, Strength Score badge or "N/6 Pokémon", checks, actions', async () => {
  const r = await aopen({team: TEAM, saved: [{name: 'Rain test', team: RAIN}, {name: 'Two', team: ['Garchomp', 'Incineroar']}]}); await r.ui.go('Saved Teams', 900); await r.ui.settle();
  const c = await r.ui.savedCardOf('Rain test'); for (const s of [/Pelipper/, /Archaludon/, /\b\d{2}\b/, /\d\/4 checks/, /Compare/, /Open/, /Copy for Showdown/]) has(c, s, 'Rain test card');
  // a partial team's card: today "2/6 Pokémon", new build "2 of 6 picked" (the same words as My Team's partial score)
  has(await r.ui.savedCardOf('Two') || '', NEW ? /^Two Garchomp Incineroar Empty Empty Empty Empty 2 of 6 picked Open / : /2\/6 Pokémon/, 'partial card'); await r.close(); });

t('SAVED-05', 'Open a saved team: My Team shows its name, toast "Opened …" with Undo', async () => {
  const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.go('Saved Teams', 900); await r.ui.savedAction('Rain test', 'Open');
  ok(await r.ui.current() === 'report', 'My Team did not open'); await r.ui.settle(); ok(await r.ui.teamHeading() === 'Rain test', 'heading: ' + await r.ui.teamHeading()); ok(await r.ui.waitToast(/Opened .Rain test./), 'no toast');
  await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not return the previous team'); await r.close(); });

t('SAVED-06', '⋯ menu: Rename (Enter saves) and Delete (asks first); deleting the open team un-links My Team', async () => {
  const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.go('Saved Teams', 900); await r.ui.savedAction('Rain test', 'Rename');
  await r.ui.typeRename('Rain'); await r.ui.press('Enter', 900); ok((await r.ui.savedCards()).some(c => /^Rain /.test(c) && !/Rain test/.test(c)), 'card not renamed');
  await r.ui.savedAction('Rain', 'Delete'); ok(await eventually(async () => /Delete Rain\?/.test(await r.ui.text())), 'delete confirm'); has(await r.ui.text(), /Keep/); ok(await eventually(async () => { try { await r.ui.tapText(/^Delete$/, 900); return true; } catch (e) { return false; } }), 'nothing to tap: Delete');
  ok(await r.ui.waitToast(/Deleted .Rain./), 'no "Deleted" toast'); ok(!(await r.ui.savedCards()).some(c => /^Rain /.test(c)), 'card still there');
  await r.ui.savedAction('Sun six', 'Open'); await r.ui.go('Saved Teams', 900); await r.ui.savedAction('Sun six', 'Delete'); ok(await eventually(async () => { try { await r.ui.tapText(/^Delete$/, 900); return true; } catch (e) { return false; } }), 'nothing to tap: Delete (open team)');
  ok(await r.ui.peek('S.loadedId') === null, 'My Team still linked to the deleted team'); ok((await r.ui.team()).length === 6, 'deleting cleared the team'); await r.close(); });

t('SAVED-07', '⋯ → Team poster opens the share box with that team\'s poster', async () => {
  const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.go('Saved Teams', 900); await r.ui.savedAction('Rain test', 'Team poster'); const s = await r.ui.waitShareImage();
  ok(s && s.w === 1080 && s.h === 1350, 'no poster image'); ok(/Rain test/.test(s.alt + s.title + s.text), 'poster is not for Rain test: ' + s.alt); await r.close(); });

t('SAVED-08', 'Compare on two saved teams opens Compare with both', async () => {
  const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.go('Saved Teams', 900); has(await r.ui.text(), /(Click|Tap) Compare on two teams to see them side by side/);
  await r.ui.savedAction('Rain test', 'Compare'); has(await r.ui.text(), /Picked ✓/); has(await r.ui.text(), /Compare:? Rain test is picked\. Pick one more saved team, or/); has(await r.ui.text(), NEW ? /Pick one more saved team, or Compare with My Team · Cancel/ : 'Compare with my current team'); // new build: Title Case "Compare with My Team"
  await r.ui.savedAction('Sun six', 'Compare'); ok(await r.ui.current() === 'compare', 'Compare did not open'); await r.ui.settle(); const tx = await r.ui.text(); has(tx, 'Rain test', 'Compare'); has(tx, 'Sun six', 'Compare'); await r.close(); });

t('SAVED-09', 'No saved teams: Darkrai, "No saved teams yet…", "Open My team", "Build me a team"', async () => {
  if (NEW) { // Sim, Nov 12 (option B): the new build's empty list says why to save and offers one main button that opens Save Team; no Darkrai
    const r = await homePage(); await r.ui.go('Saved Teams', 900); const tx = await r.ui.text();
    has(tx, /No saved teams yet\. Save this six to come back to it, compare it, or try changes without losing it\./);
    ok(await r.ui.pg.evaluate(() => ![...document.querySelectorAll('.np-sheet img')].some(i => /darkrai/i.test(i.src + i.alt))), 'a Darkrai picture in the empty list');
    await r.ui.tapText(/^Save This Team$/, 700); has(await r.ui.pg.evaluate(() => (document.querySelector('.np-sheet') || {}).innerText || ''), /Save Team[\s\S]*Give this six a name/); await r.close(); return; }
  const r = await homePage(); await r.ui.go('Saved Teams', 900); const tx = await r.ui.text(); has(tx, /No saved teams yet\. Open My team and tap Save team, or let NastyPlot build six for you\./);
  ok(await r.ui.pg.evaluate(() => [...document.querySelectorAll('[data-pane="teams"] img')].some(i => i.getClientRects().length && i.src === window.NP_MASCOT)), 'no Darkrai');
  await r.ui.tapText(/^Build me a team$/, 900); ok(await r.ui.current() === 'auto', 'Build me a team did not open Build'); await r.ui.go('Saved Teams', 700); await r.ui.tapText(/^Open My team$/i, 900); ok(await r.ui.current() === 'report', 'Open My team did not'); await r.close(); });

t('SAVED-10', 'Older singles teams are kept, not shown, but count toward the 10', async () => {
  const nine = Array.from({length: 9}, (_, i) => ({name: 'Team ' + i, team: TEAM.slice(0, 2)}));
  const r = await myTeam({team: TEAM, saved: nine}); await r.ui.addRetiredSinglesTeam('Old singles'); await r.ui.go('Saved Teams', 900);
  ok(!(await r.ui.savedCards()).some(c => /Old singles/.test(c)), 'singles team shown'); ok((await r.ui.savedCards()).length === 9, 'not nine cards');
  await r.ui.go('My Team', 900); await r.ui.tapText(/^Save team$/, 1000); has((await r.ui.editPanel()).text, /You have 10 saved teams/, 'save panel (the hidden team uses a place)'); await r.close(); });

// ================= 10. My Box =================
t('BOX-01', 'My Box head: count, explanation, sync line', async () => {
  const r = await aopen({team: TEAM, box: BOX}); await r.ui.go('My Box', 900); const tx = await r.ui.text();
  for (const s of ['← My Team', 'The Pokémon you own', 'My Box', '10 Pokémon', /Build for [Mm]e and the suggestions pick from these/,
    // new build (Sim's My Box item 20, Nov 12): plain sync words, "Saved and kept in step across your devices." / "Saved in this browser only…"
    NEW ? /Saved and kept in step across your devices\.|Saved in this browser only\. To use your box on another device, copy its box link\./ : /Saved to your Claude account|this browser/]) has(tx, s, 'My Box'); await r.close(); });

t('BOX-02', 'Add a Pokémon to the box (base forms only): toast and a new tile; saved to the account', async () => {
  const r = await aopen({team: TEAM, box: BOX}); await r.ui.go('My Box', 900); await r.ui.typeName('mega dra', '#boxAdd'); ok(!(await r.ui.nameOptions()).some(o => /^Mega /.test(o)), 'box search offers Megas');
  await r.ui.typeName('garch', '#boxAdd'); ok(!(await r.ui.nameOptions()).some(o => /^Garchomp/.test(o)), 'offers a Pokémon already in the box');
  await r.ui.addToBox('Pelipper'); ok(await r.ui.waitToast(/Pelipper added to your box/), 'no toast'); ok((await r.ui.boxNames()).includes('Pelipper'), 'no Pelipper tile'); await sleep(1000);
  ok((await r.acct()).box.includes('Pelipper'), 'box not saved to the account'); await r.close(); });

t('BOX-03', 'Remove from the box with Undo ("Box restored")', async () => {
  const r = await aopen({team: TEAM, box: BOX}); await r.ui.go('My Box', 900); await r.ui.removeFromBox('Absol'); ok(await r.ui.waitToast(/Removed Absol from your box/), 'no toast'); ok(!(await r.ui.boxNames()).includes('Absol'), 'still there');
  await r.ui.tapBoxUndo(); ok((await r.ui.boxNames()).includes('Absol'), 'Undo did not bring it back'); ok(await r.ui.waitToast(/Box restored/), 'no "Box restored"'); await r.close(); });

t('BOX-04', 'Box sort A–Z | Type | Newest | Oldest | Rating, remembered', async () => {
  const r = await aopen({team: TEAM, box: BOX}); await r.ui.go('My Box', 900); const az = await r.ui.boxNames(); ok(az.join() === [...az].sort().join(), 'not A–Z by default');
  await r.ui.boxSortBy('Newest'); ok((await r.ui.boxNames())[0] === BOX[BOX.length - 1], 'Newest not last-added first'); await r.ui.boxSortBy('Rating'); const rt = await r.ui.boxNames(); ok(rt.join() !== az.join(), 'Rating order same as A–Z');
  await r.ui.reload(); await r.ui.go('My Box', 900); ok((await r.ui.boxNames()).join() === rt.join(), 'Rating sort not remembered'); await r.close(); });

t('BOX-05', 'Reset box needs a second tap, resets to the default list, Undo restores', async () => {
  const r = await aopen({team: TEAM, box: BOX}); await r.ui.go('My Box', 900); await r.ui.tapText(/^Reset box$/, 500); has(await r.ui.text(), 'Tap again to reset');
  ok((await r.ui.boxNames()).length === 10, 'first tap already reset'); await r.ui.tapText('Tap again to reset', 900); ok((await r.ui.boxNames()).length === 36, 'box not back to the 36 default');
  await r.ui.tapBoxUndo(); ok((await r.ui.boxNames()).length === 10, 'Undo did not restore'); await r.close(); });

t('BOX-06', 'Box links: copy, open a box link, "Add to my box"; a #box= link opens My Box filled in', async () => {
  const r = await aopen({team: TEAM, box: BOX}); await r.ui.grantClipboard(); await r.ui.go('My Box', 900); await r.ui.tapText(/^Copy box link$/, 800); ok(await r.ui.waitToast(/Box link copied \(10 Pokémon\)/), 'no copy toast');
  const link = await r.ui.copied(); ok(/#box=/.test(link || ''), 'clipboard: ' + link); await r.ui.tapText(/^Open a box link$/, 600); has(await r.ui.text(), /Paste a box link or code/);
  await r.ui.typeBoxLink('nonsense'); await r.ui.tapText(/^Add to my box$/, 900); ok(await r.ui.sees(/doesn.t look like a box link/), 'no bad-link message');
  await r.ui.typeBoxLink(link); await r.ui.tapText(/^Add to my box$/, 900); ok(await r.ui.sees('Everything in that link is already in your box'), 'no "already in your box" note'); await r.close();
  const o = await aopen({team: TEAM, box: ['Absol'], hash: link.slice(link.indexOf('#box='))}); await o.ui.waitFor(async () => (await o.ui.current()) === 'box'); ok(await o.ui.current() === 'box', 'link did not open My Box');
  ok((await o.ui.boxNames()).join() === 'Absol', 'box changed before Add/Replace'); await o.ui.tapText(/^Replace my box$/, 900); ok((await o.ui.boxNames()).length === 10, 'Replace did not load the linked box');
  ok(await o.ui.has('#toastBoxUndo') || await o.ui.has('#toastUndo'), 'no Undo'); await o.close(); });

t('BOX-07', 'Empty box: its picture (today Darkrai; the new build the featured underdog), "Your box is empty…", "Add a Pokémon" focuses the search', async () => {
  const r = await aopen({team: TEAM, box: ['Absol']}); await r.ui.go('My Box', 900); await r.ui.removeFromBox('Absol'); const tx = await r.ui.text();
  has(tx, /Your box is empty\. Add the Pokémon you own, and Build for [Mm]e and the suggestions pick from them\./);
  ok(await r.ui.emptyBoxArt(), 'no picture on the empty box');
  await r.ui.tapText(/^Add a Pokémon$/, 500); ok(/Add a Pokémon/.test(await r.ui.focusName()), 'search not focused: ' + await r.ui.focusName()); await r.close(); });

// ================= 11. Compare =================
t('CMP-01', 'My Team "Compare with…": Compare page with My team as A, "Pick team B"', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.teamAction('Compare with…'); ok(await r.ui.current() === 'compare', 'Compare did not open'); const tx = await r.ui.text();
  has(tx, /Compare · two teams side by side|Compare Teams|Compare teams/i); has(tx, /Pick [Tt]eam B/); has(tx, /My team, open now|My Team/); has(tx, '← My Team'); await r.close(); });

t('CMP-02', 'Team headers A/B with source and Change; "Swap A and B" swaps the columns', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.teamAction('Compare with…'); await r.ui.pickCompareTeam('Rain test'); await r.ui.settle();
  let h = await r.ui.compareHeads(); ok(h.length === 2 && /My team/i.test(h[0]) && /Rain test/.test(h[1]) && /Saved team/.test(h[1]), 'heads: ' + h.join(' || ')); has(h.join(' '), /Change/);
  await r.ui.tapText(/Swap A and B/, 1200); await r.ui.settle(); h = await r.ui.compareHeads(); ok(/Rain test/.test(h[0]) && /My team/i.test(h[1]), 'not swapped: ' + h.join(' || ')); await r.close(); });

t('CMP-03', 'Team picker: My Team (greyed when already A), saved teams, winners, paste a Showdown team; never changes my team', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.teamAction('Compare with…'); const tx = await r.ui.text();
  for (const s of ['Saved Teams', 'Rain test', /Winning [Tt]eams:? event winners, newest first/, /Show 10 more winners/, /Any other tournament team: tap Compare on its card in Winning [Tt]eams/, /Paste a Showdown [Tt]eam/, /Use [Tt]his [Tt]eam/, /Already team A/]) has(tx, s, 'picker');
  await r.ui.tapText(/^Show 10 more winners$/, 700); ok(((await r.ui.text()).match(/Champion Won/g) || []).length >= 16, 'Show 10 more did not add winners');
  await r.ui.pasteCompareTeam(PASTE); await r.ui.settle(); has((await r.ui.compareHeads()).join(' '), /From a Showdown paste/, 'B head'); ok((await r.ui.team()).join() === TEAM.join(), 'my team changed'); await r.close(); });

t('CMP-04', 'Comparison: "What\'s different" (Tailwind, sun vs rain), Strength Score row, Same-on-both fold', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED});
  await r.ui.teamAction('Compare with…'); await r.ui.pickCompareTeam('Rain test'); await r.ui.waitText(/What.s different|line up the same/, 15000); const tx = await r.ui.text();
  has(tx, /What.s [Dd]ifferent/); has(tx, /Tailwind/); has(tx, /(sun|Sun)[^]*?(rain|Rain)|(rain|Rain)[^]*?(sun|Sun)/); has(tx, /Strength Score/); has(tx, /Ready for the top 30 threats|Matchups \(damage calc, top 30\)/); has(tx, /Same on both[ ·]*\d+ rows?/); has(tx, /Why these (grades|scores)/i); await r.close(); });
t('CMP-04b', 'Compare lists Speed control as a note, not a counted team check', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.teamAction('Compare with…'); await r.ui.pickCompareTeam('Rain test'); await r.ui.waitText(/What.s different|line up the same/, 15000); await r.ui.openFold('Same on both', true, 500);
  ok(!(await r.ui.compareCheckRows()).some(x => /Speed control/.test(x)), 'Speed control shown as a team check row'); await r.close(); },
  {known: 'inventory #19: Compare still lists "Speed control" as a team check row (a note, not counted, since Nov 9)'});

// ================= 12. Pokémon info sheet =================
t('PKMN-01', 'Info sheet opens from Home; ✕ and Escape close it, focus returns; desktop is a wide two-column panel', async () => {
  const r = await homePage(); await r.ui.tapPokemon('Kingambit'); ok(await r.ui.infoSheet(), 'sheet did not open');
  ok((await r.ui.infoSheetBox()).w >= 900, 'desktop sheet is not a wide panel: ' + JSON.stringify(await r.ui.infoSheetBox()));
  await r.ui.press('Escape'); ok(!(await r.ui.infoSheet()), 'Escape did not close'); ok(/Kingambit/.test(await r.ui.focusName()), 'focus not back on the tile: ' + await r.ui.focusName());
  await r.ui.tapPokemon('Kingambit'); await r.ui.closeInfoSheet(); ok(!(await r.ui.infoSheet()), '✕ did not close'); await r.close();
  const p = await aopen({team: TEAM, width: 390}); await p.ui.tapPokemon('Kingambit'); const b = await p.ui.infoSheetBox(); ok(b && b.w <= 390 && b.bottom >= 880, 'phone sheet is not a bottom sheet: ' + JSON.stringify(b)); ok(await p.ui.noSideScroll(), 'sideways scroll'); await p.close(); });

t('PKMN-02', 'Hero: rating numeral, "<letter> tier, #N of M with results", name, types, three numbers', async () => {
  const r = await homePage(); await r.ui.tapPokemon('Kingambit'); const s = await r.ui.infoSheet();
  ok((NEW ? /^✕ (\d+) [SABCD] tier Rating · #\d+ of \d+ with results Kingambit Dark Steel/ /* the approved sheet mock-up's words (Sim, Nov 12, decision 16) */ : /^✕ (\d+) \? [SABCD] tier, #\d+ of \d+ with results Kingambit Dark Steel/).test(s), 'hero reads: ' + s.slice(0, 90));
  for (const x of [/[\d.]+% of teams of [\d.]+k/, /[\d.]+% win rate [\d,]+ games/, /\d+ Speed at level 50/]) has(s, x, 'hero'); await r.close(); });

t('PKMN-03', 'Add to team fills the first empty slot ("On your team" after); Build around it; Popular Sets', async () => {
  const r = await aopen({team: TEAM.slice(0, 5)}); await r.ui.tapPokemon('Kingambit'); has(await r.ui.infoSheet(), NEW ? 'Add to My Team' : 'Add to team'); await r.ui.tapText(NEW ? /^Add to My Team$/ /* word list: My Team (Sim, Nov 12, decisions 15-16) */ : /^Add to team$/, 1000);
  ok(await r.ui.waitToast(/Kingambit added to your team/), 'no toast'); has(await r.ui.infoSheet() || '', 'On your team', 'sheet after adding'); ok((await r.ui.team()).includes('Kingambit'), 'not on the team');
  await r.ui.tapText(/^Popular Sets$/, 900); ok(await r.ui.current() === 'sets' && !(await r.ui.infoSheet()), 'Popular Sets did not open'); has(await r.ui.text(), 'Kingambit', 'Popular Sets');
  await r.ui.go('Home', 600); await r.ui.tapPokemon('Rillaboom'); has(await r.ui.infoSheet(), /On your team/); await r.ui.tapText(/^Build around it$/, 1200); ok(await r.ui.current() === 'auto', 'Build around it did not open Build'); await r.close();
  const f = await homePage(); await f.ui.tapPokemon('Kingambit'); has(await f.ui.infoSheet(), /Team full|already on your team/, 'full team sheet'); await f.close(); });

t('PKMN-04', 'Tabs Info | Meta | Rating: last tab remembered; arrow keys move between tabs', async () => {
  const r = await homePage(); await r.ui.tapPokemon('Kingambit'); ok(await r.ui.infoTabNow() === 'info', 'Info not first'); await r.ui.infoTab('Meta'); ok(await r.ui.infoTabNow() === 'meta', 'Meta not shown');
  await r.ui.closeInfoSheet(); await r.ui.tapPokemon('Rillaboom'); ok(await r.ui.infoTabNow() === 'meta', 'last tab not remembered');
  await r.ui.focusInfoTab(); await r.ui.press('ArrowRight', 500); ok(await r.ui.infoTabNow() === 'rating', 'ArrowRight did not move to Rating'); await r.ui.press('Home', 500); ok(await r.ui.infoTabNow() === 'info', 'Home key did not go to Info');
  await r.ui.reload(); await r.ui.tapPokemon('Rillaboom'); ok(await r.ui.infoTabNow() === 'info', 'tab not kept after reload'); await r.close(); });

t('PKMN-05', 'Info tab: usual set, base stats, abilities with "Most used", type matchups, speed rows, Speed Tiers link', async () => {
  const r = await homePage(); await r.ui.tapPokemon('Kingambit'); const s = await r.ui.infoTabText();
  for (const x of [/Usually .+, Adamant/, /Full set ›/, /Base Stats HP \d+ Attack \d+/, /Abilities Defiant Most used, \d+%/, /Type Matchups/, /(4|2)× weak/, /Resists/, /Speed at Level 50/i, /What players run \d+/, /Trick Room build \d+/, /outspeeds \d+% of the top 30/, /Speed Tiers →/]) has(s, x, 'Info tab');
  await r.ui.tapText('Full set ›', 600); ok(await r.ui.infoTabNow() === 'meta', 'Full set › did not open Meta'); await r.ui.infoTab('Info'); await r.ui.tapText('Speed Tiers →', 900); ok(await r.ui.current() === 'speed', 'Speed Tiers link did not open Speed Tiers'); await r.close(); });

t('PKMN-06', 'Meta tab: typical set, moves and items with %, "Brought with" opens the partner\'s sheet', async () => {
  const r = await homePage(); await r.ui.tapPokemon('Kingambit'); await r.ui.infoTab('Meta'); const s = await r.ui.infoTabText();
  for (const x of NEW ? [/Typical set Ability \w+ \d+%/, /in-game ranked battles/, /Items \S.* \d+%/, /Brought with (\w+) (\d+)% · ([\d,]+) games/] /* approved sheet mock-up words (Sim, Nov 12, decision 16) */ : [/Typical Set Ability \w+ \d+%/, /Moves: in-game ranked battles/, /Items \S.* \d+%/, /Brought with (\w+) (\d+)% ([\d,]+) games/]) has(s, x, 'Meta tab');
  const partner = s.match(/Brought with (\w+)/)[1]; await r.ui.tapPokemonInSheet(partner); ok(new RegExp(partner).test((await r.ui.infoSheet() || '').slice(0, 140)), 'partner sheet did not open'); await r.close(); });

t('PKMN-07', 'Rating tab: "Why it rates N", four bars, What the Data Says, other tier lists, links', async () => {
  const r = await homePage(); await r.ui.tapPokemon('Kingambit'); await r.ui.infoTab('Rating'); const s = await r.ui.infoTabText();
  for (const x of [/Why It Rates \d+/i, /Top-cut presence \d+/, /Picked by strong players \d+/, /Converts to top cut \d+/, /Win rate \d+/, /What the Data Says/i, /Other Tier Lists/i, /How ratings work →/, /Track Record →/]) has(s, x, 'Rating tab');
  await r.ui.tapText('Track Record →', 900); ok(await r.ui.current() === 'track', 'Track Record link did not open'); await r.close(); });

// ================= 13. Shared behaviour =================
t('X-01', 'Every change saves to this browser and to the account', async () => {
  const r = await myTeam(); await r.ui.removeFromTeam('Rillaboom'); await sleep(1300);
  ok(!(await r.acct()).slots.some(s => s.n === 'Rillaboom'), 'account still has Rillaboom'); const l = await r.ls('cc2.state'); ok(l && !l.slots.some(s => s.n === 'Rillaboom'), 'browser copy still has Rillaboom'); await r.close();
  const o = await aopen({account: false}); await o.ui.go('My Team', 2000); await o.ui.removeFromTeam('Kingambit'); await o.ui.reload(2500); ok(!(await o.ui.team()).includes('Kingambit'), 'browser-only change lost on reload'); await o.close(); });
t('X-01b', 'A change on another device arrives live ("Updated from your other device"), waiting while you type', async () => {}, {skip: 'needs two signed-in devices sharing a real account; the kit\'s fake account has no live updates from another device'});

t('X-02', 'First visit: sample six "Sun Tailwind (sample)", saved and open, default box of 36', async () => {
  if (NEW) { /* new build (Sim, Nov 12): first visit shows the sample "Sun Tailwind (sample)" with the note "This is a sample team, here to
    show how NastyPlot works." + "Build your own" (#build; no Build page in this build yet, so where it leads is checked) · "Import a
    team" (opens Import). It is saved and open; My Box holds the default 36 ("36 Pokémon · 2 boxes"). The Saved Teams sheet is closed
    with its "← My Team" before going to My Box, as a player would (the sheet covers the page) */
    const r = await aopen({fresh: true}); await r.ui.go('My Team', 2500); const tx = await r.ui.text(); ok(await r.ui.teamHeading() === 'Sun Tailwind (sample)', 'heading: ' + await r.ui.teamHeading());
    has(tx, / Sun Tailwind \(sample\) This is a sample team, here to show how NastyPlot works\. Build your own · Import a [Tt]eam /, 'sample note');
    ok(await r.ui.linkHref('Build your own') === '#build', '"Build your own" leads to ' + await r.ui.linkHref('Build your own'));
    await r.ui.tapText(/^Import a team$/, 900); const p = await r.ui.editPanel(); ok(p && p.title === 'Paste a Team', '"Import a team" did not open Import (' + (p && p.title) + ')'); await r.ui.closeEditPanel();
    await r.ui.go('Saved Teams', 900); has(await r.ui.savedCardOf('Sun Tailwind (sample)') || '', /^Sun Tailwind \(sample\) Open now /, 'saved sample');
    await r.ui.tapText(/^← My Team$/, 900); ok(await r.ui.current() === 'report', 'Saved Teams did not close');
    await r.ui.go('My Box', 900); ok(await r.ui.current() === 'box', 'My Box did not open'); has(await r.ui.text(), / My Box 36 Pokémon · 2 boxes /, 'My Box'); await r.close(); return; }
  const r = await aopen({fresh: true}); await r.ui.go('My Team', 2500); has(await r.ui.text(), 'Sun Tailwind (sample)'); has(await r.ui.text(), 'This is a sample team');
  await r.ui.go('Saved Teams', 900); has(await r.ui.savedCardOf('Sun Tailwind (sample)') || '', 'Open now', 'saved sample'); await r.ui.go('My Box', 900); has(await r.ui.text(), '36 Pokémon'); await r.close(); });

t('X-03', 'Toasts: Undo puts the team back ("Change undone"); plain confirmations carry Darkrai', async () => {
  const r = await myTeam(); await r.ui.removeFromTeam('Sneasler'); ok(await r.ui.waitToast(/Removed Sneasler/), 'no toast'); await r.ui.tapToastUndo(); ok(await r.ui.waitToast(/Change undone/), 'no "Change undone"'); ok((await r.ui.team()).includes('Sneasler'), 'not restored');
  await r.ui.clearTeam(); ok(await r.ui.waitToast(/Team cleared/), 'no "Team cleared"');
  // new build (Sim, Nov 11): Darkrai is cut, so the confirmation toast carries no picture at all (checked while the toast shows)
  if (NEW) { const im = await r.ui.toastImages(); ok(Array.isArray(im) && im.length === 0, 'confirmation toast ' + (im ? 'has a picture (Darkrai is cut): ' + im.join(', ') : 'not showing')); }
  else ok(await r.ui.pg.evaluate(() => { const i = document.querySelector('#toast img'); return !!(i && i.src === window.NP_MASCOT); }), 'no Darkrai on the confirmation'); await r.close(); });

t('X-04', 'Double-tap on Apply applies only once', async () => {
  const r = await myTeam(); const start = await r.ui.team(); await r.ui.doubleTapApply(); await r.ui.settle(); const now = await r.ui.team();
  ok(now.filter(n => !start.includes(n)).length === 1, 'changed ' + now.filter(n => !start.includes(n)).length + ' Pokémon: ' + now.join()); await r.close(); });

t('X-05', 'Apply keeps your place: the page does not jump to the top', async () => {
  const r = await myTeam({team: TEAM, width: 390}); await r.ui.scrollToSuggestions(); const y0 = await r.ui.pageScrollY(); ok(y0 > 300, 'did not scroll down'); await r.ui.applySuggestionCard(0); await r.ui.settle();
  const y1 = await r.ui.pageScrollY(); ok(Math.abs(y1 - y0) < 400, `page jumped from ${y0} to ${y1}`); await r.close(); });

t('X-06', 'Back closes what\'s open on top first and stays on the page', async () => {
  const r = await myTeam(); await r.ui.tapText('Info sheet ›', 900); ok(await r.ui.infoSheet(), 'sheet did not open'); await r.ui.goBack();
  ok(!(await r.ui.infoSheet()), 'Back did not close the sheet'); ok(await r.ui.current() === 'report', 'Back left My Team');
  await r.ui.openEditPanel('Garchomp'); await r.ui.goBack(); ok(!(await r.ui.editPanel()), 'Back did not close the edit panel'); ok(await r.ui.current() === 'report', 'left My Team');
  await r.ui.go('Saved Teams', 700); await r.ui.goBack(); ok(await r.ui.current() === 'report', 'Back did not return to the previous page'); await r.close(); });

t('X-07', 'Folds and views stay as left after reload (Game Plan, Types view, info-sheet tab, box sort, pool)', async () => {
  if (NEW) { /* new build (Sim, Nov 12): Game Plan is a sheet from the plan line (nothing remembered: no sheet after a reload); Types sits
    in the Things to Know fold (fold kept open, cc2.chf.rfix) and keeps its Offense / Defense view (np2.seg.types); the pool is kept */
    const r = await myTeam(); await r.ui.openFold('Things to Know', true, 600); await r.ui.choose('Defense', 800); await r.ui.choose('Whole roster', 900);
    await r.ui.tapText(/^Game [Pp]lan$/, 900); ok(await r.ui.gamePlanSheet(), 'Game Plan sheet did not open');
    await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(!(await r.ui.gamePlanSheet()), 'Game Plan sheet came back after a reload');
    ok(await r.ui.foldOpen('Things to Know') === true, 'Things to Know closed'); ok(await r.ui.chosen('Defense') === true && /^Types Offense Defense What hits you\./.test(await r.ui.typesPart() || ''), 'Types view not kept');
    ok(await r.ui.chosen('Whole roster') === true, 'pool not kept'); await r.close(); return; }
  const r = await myTeam(); await r.ui.openFold('Game Plan', true, 600); await r.ui.openFold('Types', true, 600); await r.ui.choose('Defense: what hits you', 800); await r.ui.choose('Whole roster', 900);
  await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.foldOpen('Game Plan') === true, 'Game Plan closed'); ok(await r.ui.foldOpen('Types') === true, 'Types closed');
  ok(await r.ui.chosen('Defense: what hits you') === true, 'Types view not kept'); ok(await r.ui.chosen('Whole roster') === true, 'pool not kept'); await r.close(); });

t('X-08', 'Sliding pickers: tapping a choice moves the highlight and reports pressed', async () => {
  const r = await myTeam(); const before = await r.ui.sliderIndex('Box + catch'); await r.ui.choose('Whole roster', 900); ok(await r.ui.chosen('Whole roster') === true && await r.ui.chosen('Box + catch') === false, 'pressed state did not move');
  ok(await r.ui.sliderIndex('Whole roster') !== before, 'highlight did not slide'); await r.close(); });

t('X-09', 'A saved team name keeps its own casing ("rain test")', async () => {
  const r = await aopen({team: TEAM, saved: [{name: 'rain test', team: RAIN}]}); await r.ui.go('Saved Teams', 900); const cards = (await r.ui.savedCards()).join(' | '); ok(/\brain test\b/.test(cards) && !/Rain [Tt]est/.test(cards), 'name re-cased: ' + cards);
  await r.ui.savedAction('rain test', 'Open'); await r.ui.settle(); ok(await r.ui.teamHeading() === 'rain test', 'heading: ' + await r.ui.teamHeading());
  // My Team drew the opened team (today under its "Your Six" heading; the new build has no such heading by design, as TEAM-08)
  if (NEW) { ok(!/Your Six/.test(await r.ui.text()), 'a "Your Six" heading shows (removed by design)'); ok((await r.ui.sixTiles()).length === 6, 'opened team\'s six tiles not drawn'); } else has(await r.ui.text(), 'Your Six'); await r.close(); });

t('X-10', 'Dark mode: My Team draws on a dark page', async () => {
  const r = await myTeam({team: TEAM, mode: 'dark'}); const lum = await r.ui.pageLuminance(); ok(lum < 0.25, 'page not dark in dark mode: ' + lum.toFixed(2)); await r.close();
  const l = await myTeam({team: TEAM, mode: 'light'}); ok(await l.ui.pageLuminance() > 0.6, 'page not light in light mode'); await l.close(); });

t('X-11', 'Search (Ctrl K): type a saved team\'s name, Enter → it opens on My Team', async () => {
  const r = await aopen({team: TEAM, saved: SAVED}); await r.ui.press('Control+k', 600); ok(await r.ui.has('#jump input'), 'search did not open'); await r.ui.typeName('Rain test', '#jump input'); await r.ui.press('Enter', 1500);
  ok(await r.ui.current() === 'report', 'My Team did not open'); await r.ui.settle(); ok(await r.ui.teamHeading() === 'Rain test', 'saved team not opened: ' + await r.ui.teamHeading()); await r.close(); });

t('X-12', 'Long paragraphs show the first sentence and "More"', async () => {
  if (NEW) { /* new build (Sim, Nov 12): in How Scoring Works (end of "Why this score?") each long paragraph shows its first sentence and
    "More"; More shows the rest and turns into "Less" (aria-expanded), Less folds it back */
    const r = await myTeam(); await r.ui.tapWhyScore(); await r.ui.openFold('How Scoring Works', true, 600); const h = await r.ui.howScoring(); ok(h && h.paras.length === 8, 'How Scoring Works paragraphs: ' + (h && h.paras.length));
    const long = h.paras.filter(p => p.button); ok(long.length >= 6, `only ${long.length} paragraphs have "More"`);
    for (const p of long) { ok(p.button === 'More' && p.expanded === 'false', 'button reads ' + p.button + ' / ' + p.expanded); const s = p.text.replace(/ More$/, ''); ok(/\.$/.test(s) && !/\. [A-Z(]/.test(s), 'shows more than its first sentence: ' + s.slice(0, 120)); }
    const k = h.paras.indexOf(long[0]); await r.ui.tapHowMore(k); let n = (await r.ui.howScoring()).paras;
    ok(n[k].text.length > h.paras[k].text.length + 40 && n[k].button === 'Less' && n[k].expanded === 'true', '"More" did not show the rest: ' + JSON.stringify({len: n[k].text.length, was: h.paras[k].text.length, b: n[k].button, x: n[k].expanded}));
    ok(n.every((p, j) => j === k || p.text === h.paras[j].text), '"More" opened another paragraph too');
    await r.ui.tapHowMore(k); n = (await r.ui.howScoring()).paras; ok(n[k].text === h.paras[k].text && n[k].button === 'More' && n[k].expanded === 'false', '"Less" did not fold it back: ' + n[k].text.slice(-60)); await r.close(); return; }
  const r = await myTeam(); await r.ui.openFold('How Scoring Works', true, 600); const before = (await r.ui.foldContent('How Scoring Works')).length; await r.ui.tapText(/^More$/, 500);
  ok((await r.ui.foldContent('How Scoring Works')).length > before + 40, '"More" did not show more text'); await r.close(); });

t('X-13', 'Links out of this scope still work: replay "Paste its log" → Battle; How ratings work → How we calculate', async () => {
  const r = await myTeam(); await r.ui.openLogForm(); await r.ui.tapText('Paste its log', 1200); ok(await r.ui.current() === 'matchup', '"Paste its log" did not open Battle');
  await r.ui.go('Home', 600); await r.ui.tapPokemon('Kingambit'); await r.ui.infoTab('Rating'); await r.ui.tapText('How ratings work →', 900); ok(await r.ui.current() === 'method', 'How ratings work did not open How we calculate'); await r.close(); });

// ================= Inventory "looks broken" items that a player can hit (correct behaviour, marked known) =================
t('HOME-11b', 'Sample note "Build your own" on My Team opens Build', async () => {
  const r = await myTeam({fresh: true}); await r.ui.tapText(/^Build your own$/, 1000); ok(await r.ui.current() === 'auto', '"Build your own" stayed on ' + await r.ui.current()); await r.close(); },
  {known: NEW ? '' /* the new site has a real Build page now (Nov 12): the link works */ : 'inventory #16: on My Team the note\'s "Build your own" points at `build`, which is My Team itself, so nothing visible happens'});
t('HOME-10b', 'Home empty tile "Add a Pokémon to slot N" opens the add box for that slot', async () => {
  const r = await aopen({team: []}); await r.ui.tapLabel('Add a Pokémon to slot 3', 1200); const p = await r.ui.editPanel(); const nb = await r.ui.nameBox();
  ok(p && /Add a Pokémon/.test(p.title) && await r.ui.panelSlot() === 2 && nb && nb.focused, 'tile opened ' + await r.ui.current() + ' without the slot-3 add box'); await r.close(); },
  {known: 'inventory #17: Home\'s empty tiles say "Add a Pokémon to slot N" but only open My Team'});
