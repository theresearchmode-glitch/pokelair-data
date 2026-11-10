// Behaviour tests, group A: Team (docs/rebuild/inventory/A-team.md). One test per inventory entry, keyed by its ID, written from
// the player's side. Today's selectors live in adapters/current.A-team.mjs; this file uses visible words and adapter helpers only.
import {group, open, TEAM, BOX, OPP, expect, sleep} from './harness.mjs';
const t = group('A-team');
const RAIN = ['Pelipper', 'Archaludon', 'Basculegion', 'Incineroar', 'Garchomp', 'Sneasler'];
const SAVED = [{name: 'Rain test', team: RAIN}, {name: 'Sun six', team: TEAM}];
const ok = (cond, msg) => expect(cond, msg);
const has = (tx, s, what) => ok(typeof s === 'string' ? tx.toLowerCase().includes(s.toLowerCase()) : s.test(tx), `${what || 'page'} doesn't show ${s}`);
// one open page shared by read-only checks of the same state (saves ~3 s per test); never used by tests that change things
const SHARED = {};
async function view(key, opts, page) { if (!SHARED[key]) { SHARED[key] = await open(opts); if (page) { await SHARED[key].ui.go(page, 600); await SHARED[key].ui.waitText(/\w/); } }
  const s = SHARED[key]; if (page && (await s.ui.current()) !== s.ui.PAGES[page]) await s.ui.go(page, 600); return s; }
async function myTeam(opts = {team: TEAM}) { const r = await open(opts); await r.ui.go('My Team', 600); await r.ui.waitText(/Strength Score|No team yet|Grade/, 12000); await sleep(600); return r; }
const noErrs = r => ok(!r.errs.length, 'page errors: ' + r.errs.join(' | '));

// ================= 1. Home =================
t('HOME-01', 'Home leads with the tagline "Sharply raise your win rate."', async () => {
  const {ui} = await view('home', {team: TEAM});
  const h = await ui.homeHeadline();
  ok(h === 'Sharply raise your win rate.', `first heading reads "${h}"`); });

t('HOME-02', 'Most used #1 card opens that Pokémon\'s info sheet', async () => {
  const r = await open({team: TEAM}); const tx = await r.ui.text();
  const m = tx.match(/Most used, #1 ([\d.]+)% of teams bring (.+?) [A-Z][a-z]+ [\d.]+%/); ok(m, 'no "Most used, #1 … % of teams bring X" hero');
  await r.ui.tapText('Most used, #1'); const s = await r.ui.infoSheet(); ok(s && s.includes(m[2]), `info sheet for ${m[2]} did not open`); noErrs(r); await r.close(); });

t('HOME-03', 'Runner-up strips (#2, #3) open their info sheets', async () => {
  const r = await open({team: TEAM}); const tx = await r.ui.text(); const m = tx.match(/bring \S+(?: \S+)?? ([A-Z][\w-]+(?: [A-Z]\w*)?) ([\d.]+)% ([A-Z][\w-]+(?: [A-Z]\w*)?) ([\d.]+)%/);
  ok(m, 'no two runner-up strips with name and %'); await r.ui.tapText(`${m[1]} ${m[2]}%`); let s = await r.ui.infoSheet(); ok(s && s.includes(m[1]), `info sheet for ${m[1]} did not open`);
  await r.ui.closeInfoSheet(); await r.ui.tapText(`${m[3]} ${m[4]}%`); s = await r.ui.infoSheet(); ok(s && s.includes(m[3]), `info sheet for ${m[3]} did not open`); await r.close(); });

t('HOME-04', 'Data line names the month, the source and "Data as of <date>"', async () => {
  const {ui} = await view('home', {team: TEAM}); const tx = await ui.text();
  has(tx, /Most used in (January|February|March|April|May|June|July|August|September|October|November|December), (Showdown ladder|Ranked ladder|Online tournaments|Official events)[^.]*\. Data as of [A-Z][a-z]{2} \d{1,2}/, 'Home data line'); });

t('HOME-05', 'This week in the ratings: chips with arrow + number open the matching info sheet', async () => {
  const r = await open({team: TEAM}); const tx = await r.ui.text(); has(tx, 'This week in the ratings');
  const chips = await r.ui.ratingMoves(); ok(chips.length >= 1 && chips.length <= 6, `${chips.length} rating-move chips`);
  for (const c of chips) ok(/[▲▼] \d+$/.test(c.text), `chip "${c.text}" has no arrow and number`);
  const c = chips[0], rating = +(c.label.match(/rating (\d+)/) || [])[1]; ok(rating, 'chip label names no rating: ' + c.label);
  await r.ui.tapPokemon(c.text.replace(/ [▲▼].*/, '')); const s = await r.ui.infoSheet(); ok(s && s.includes(c.text.replace(/ [▲▼].*/, '')), 'chip did not open its info sheet');
  await r.close(); });
t('HOME-05b', 'This week chip\'s rating matches the info sheet it opens', async () => {
  const r = await open({team: TEAM}); const c = (await r.ui.ratingMoves())[0], rating = +(c.label.match(/rating (\d+)/) || [])[1];
  await r.ui.tapPokemon(c.text.replace(/ [▲▼].*/, '')); const s = await r.ui.infoSheet() || '';
  ok(s.startsWith('✕ ' + rating + ' ') || new RegExp('^\\D*' + rating + ' ').test(s), `chip says rating ${rating}, info sheet hero says ${s.slice(0, 12)}`); await r.close(); },
  {known: 'chip label "Whimsicott, rating 78" but its info sheet shows 88 (This week reads the weekly track data, the sheet the live rating)'});

t('HOME-06', 'Start buttons: "Score my team" first with a team, "Build me a team" first with none', async () => {
  const r = await open({team: TEAM}); let b = await r.ui.homeStartButtons();
  ok(b.join('|') === 'Score my team|Build a team|Plan a match', 'with a team buttons are ' + b.join('|'));
  await r.ui.tapText('Score my team'); ok(await r.ui.current() === 'report', 'Score my team did not open My Team'); await r.close();
  const e = await open({team: []}); b = await e.ui.homeStartButtons(); ok(b[0] === 'Build me a team' && b.includes('Score my team') && b.includes('Plan a match'), 'empty team buttons are ' + b.join('|'));
  await e.ui.tapText('Build me a team'); ok(await e.ui.current() === 'auto', 'Build me a team did not open Build'); await e.close(); });

t('HOME-07', '"Import from Showdown" opens My Team with the Import box ready', async () => {
  const r = await open({team: TEAM}); await r.ui.tapText('Import from Showdown', 1200);
  ok(await r.ui.current() === 'report', 'My Team did not open'); const p = await r.ui.editPanel(); ok(p && /Import a team/.test(p.text) && /Replace my team/.test(p.text), 'no "Import a team" box with "Replace my team"');
  ok(/paste/i.test(await r.ui.focused()) || (await r.ui.focused()).includes('Showdown'), 'cursor is not in the paste box (focused: ' + await r.ui.focused() + ')'); await r.close(); });

t('HOME-08', 'All 11 Tools: each card opens the page named on it', async () => {
  const r = await open({team: TEAM}); has(await r.ui.text(), /All 11 Tools/);
  const want = {'Battle Mode': 'matchup', Teams: 'top', 'Type Chart': 'types', Ratings: 'ratings', 'Damage Calc': 'calc', Events: 'events', 'Test Run': 'gauntlet', 'Popular Sets': 'sets', 'Speed Tiers': 'speed', Archetypes: 'arch', 'Winning Cores': 'cores'};
  const tools = await r.ui.homeTools(); ok(tools.length === 11, `${tools.length} tool cards: ${tools.join(', ')}`);
  for (const [name, v] of Object.entries(want)) { ok(tools.includes(name), 'no tool card ' + name); await r.ui.go('Home', 300); await r.ui.tapTool(name); const now = await r.ui.current(); ok(now === v || (v === 'cores' && now === 'auto'), `${name} opened ${now}`); }
  noErrs(r); await r.close(); });

t('HOME-09', 'Champion\'s six: load needs a second tap, loads with Undo; Copy for Showdown copies', async () => {
  const r = await open({team: TEAM}); await r.ui.allowClipboard(); const tx = await r.ui.text();
  ok(/The Champion's Six Latest winner .+ Champion, \d+-\d+, [A-Z][a-z]{2} \d+, \d+ players/.test(tx), 'no champion line with record, date, players');
  ok(/All \d+ events ›/.test(tx), 'no "All N events ›" link');
  await r.ui.tapText('Load this team'); ok(await r.ui.sees('Tap again to replace your team'), 'first tap did not ask to tap again');
  ok((await r.ui.team()).join() === TEAM.join(), 'first tap already replaced the team');
  await r.ui.tapText('Tap again to replace your team', 1200); const now = await r.ui.team(); ok(now.join() !== TEAM.join() && now.length === 6, 'second tap did not load the champion six');
  ok(await r.ui.waitToast(/./) && await r.ui.has('#toastUndo'), 'no Undo toast after loading');
  await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not restore my team');
  await r.ui.go('Home'); await r.ui.clearToasts(); await r.ui.tapText('Copy for Showdown'); ok(await r.ui.waitToast(/Copied.*paste into Showdown/), 'no "Copied — paste into Showdown" toast');
  const c = await r.ui.copied(); ok(c && /@ .+\nAbility: /.test(c), 'clipboard holds no Showdown team'); await r.close(); });

t('HOME-10', 'vs panel: your six, a lead/back/bench plan, Prep vs the Champion sets Battle', async () => {
  const r = await open({fresh: true}); const tx = await r.ui.text();
  has(tx, 'Sun Tailwind (sample)'); has(tx, /Your team: 6\/6 Sun team/);
  ok(/Game plan vs the Champion's six: lead .+ \+ .+, back .+ \+ .+, bench .+ \+ .+\./.test(await r.ui.homePlanLine() || ''), 'no lead/back/bench plan line: ' + await r.ui.homePlanLine());
  has(tx, 'Open my team'); await r.ui.tapText('Prep vs the Champion', 1200); ok(await r.ui.current() === 'matchup', 'Battle did not open');
  ok(await r.ui.waitToast(/Opponent set/), 'no "Opponent set" toast'); const opp = await r.ui.peek('S.opp.filter(Boolean)'); ok(opp && opp.length === 6, 'opponent six not set');
  await r.close();
  const e = await open({team: []}); const et = await e.ui.text(); has(et, 'Your six goes here'); has(et, 'Add your six');
  ok((et.match(/Add a Pokémon/g) || []).length >= 6, 'empty Home team has fewer than six "+ Add a Pokémon" tiles'); await e.ui.tapText('Add your six'); ok(await e.ui.current() === 'report', '"Add your six" did not open My Team'); await e.close(); });

t('HOME-11', 'Sample-team note on Home and My Team; "Import a team" opens Import', async () => {
  const r = await open({fresh: true}); has(await r.ui.text(), 'This is a sample team, here to show how NastyPlot works.', 'Home');
  await r.ui.go('My Team', 1500); has(await r.ui.text(), 'This is a sample team, here to show how NastyPlot works.', 'My Team');
  has(await r.ui.text(), 'Build your own'); await r.ui.tapText('Import a team', 1000); const p = await r.ui.editPanel(); ok(p && /Import a team/.test(p.text), 'Import panel did not open'); await r.close(); });

t('HOME-12', 'Welcome card on first visit; "Got it" hides it for good', async () => {
  const r = await open({fresh: true}); const w = await r.ui.welcomeCard(); ok(w, 'no welcome card for a first-time visitor');
  for (const s of ['How NastyPlot works', 'Get a team', 'Read your scouting report', 'Plan each match', 'Build me a team', 'Copy a top team', 'Got it']) has(w, s, 'welcome card');
  await r.ui.tapText('Got it'); ok(!(await r.ui.welcomeCard()), 'card still there after Got it'); await r.ui.reload(); ok(!(await r.ui.welcomeCard()), 'card came back after reload'); await r.close();
  const back = await open({team: TEAM}); ok(!(await back.ui.welcomeCard()), 'returning visitor sees the welcome card'); await back.close(); });

t('HOME-13', 'What\'s New fold after an update; × dismisses it for good; never for first-time visitors', async () => {
  // the kit re-seeds stored keys on every reload, so seed this one by hand once
  const r = await open({fresh: true}); await r.pg.evaluate(() => { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2020-01-01"'); sessionStorage.clear(); }); await r.ui.reload(); ok(await r.ui.sees(/What's New\s+\d+ updates/), 'no What\'s New fold after an update');
  await r.ui.openFold("What's New"); ok(((await r.ui.foldText("What's New")) || '').length > 80, 'fold lists no updates');
  await r.ui.dismissWhatsNew(); ok(!(await r.ui.sees("What's New")), 'fold still shown after ×'); await r.ui.reload(); ok(!(await r.ui.sees("What's New")), 'fold came back after reload'); await r.close();
  const f = await open({fresh: true}); ok(!(await f.ui.sees("What's New")), 'first-time visitor sees What\'s New'); await f.close(); });

t('HOME-14', 'Top of the Meta: 10 rated rows, Hidden gems switch changes the list, rows open info sheets', async () => {
  const r = await open({team: TEAM}); const tx = await r.ui.text(); has(tx, /NastyPlot ratings: from [\d,]+ tournament teams Top of the Meta/);
  const top = await r.ui.homeTopRows(); ok(top.length === 10, `${top.length} rows`); ok(/Sneasler S \d+ #1|\S+ [SABCD] \d+ #1/.test(tx), 'rows don\'t read "Name S 97 #1"');
  ok(await r.ui.chosen('Top rated') === true, '"Top rated" not chosen by default'); await r.ui.choose('Hidden gems');
  const gems = await r.ui.homeTopRows(); ok(gems.length >= 1 && gems.join() !== top.join(), 'Hidden gems list did not change'); ok(await r.ui.chosen('Hidden gems') === true, 'Hidden gems not shown as chosen');
  const before = tx.match(/Highest NastyPlot ratings[^.]*\./); ok(!(await r.ui.text()).includes(before ? before[0] : '@@'), 'hint line did not change for Hidden gems');
  await r.ui.tapPokemon(gems[0].replace(/-Mega.*/, '')); ok(await r.ui.infoSheet(), 'row did not open the info sheet'); await r.ui.closeInfoSheet(); has(await r.ui.text(), 'All ratings ›'); await r.close(); });

t('HOME-15', 'More on Home fold: pairs, what changed, cores, "Log a game" → Battle; stays open after reload', async () => {
  const r = await open({team: TEAM}); await r.ui.openFold('More on Home'); const f = await r.ui.foldText('More on Home');
  for (const s of [/Doubles Is Played in Pairs/i, /What changed this week/i, /Rising/, /Falling/, /#\d+ → #\d+/, /Winning Cores/i, /All cores ›/, /Your battles/i, /Log a game/]) has(f, s, 'More on Home');
  await r.ui.reload(); ok(await r.ui.foldOpen('More on Home') === true, 'fold closed again after reload');
  await r.ui.tapText(/^Log a game$/, 900); ok(await r.ui.current() === 'matchup', 'Log a game did not open Battle'); await r.close(); });

t('HOME-16', 'Weather chip "Sun team" on Home\'s team card', async () => {
  const {ui} = await view('home', {team: TEAM}); ok(await ui.sees(/Your team: 6\/6 Sun team/), 'no "Sun team" weather chip');
  const r = await open({team: RAIN}); ok(await r.ui.sees(/Your team: 6\/6 Rain team/), 'Rain team shows no "Rain team" chip'); await r.close(); });
