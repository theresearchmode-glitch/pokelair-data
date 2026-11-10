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

// ================= 2. My Team =================
t('TEAM-01', 'Header: "My team: N of 6, Sun team" and the team name as heading; "No team yet" when empty', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); let tx = await r.ui.text(); has(tx, /My team: 6 of 6, Sun team/);
  ok(/Sun|Tailwind|Balance|Terrain/.test(await r.ui.teamHeading()), 'heading is not the archetype label: ' + await r.ui.teamHeading());
  await r.ui.openFold('Switch team'); await r.ui.tapText(/^Rain test/, 2000); ok(await r.ui.teamHeading() === 'Rain test', 'heading after opening a saved team: ' + await r.ui.teamHeading());
  has(await r.ui.text(), /My team: 6 of 6, Rain team/);
  await r.ui.clearTeam(); tx = await r.ui.text(); has(tx, 'No team yet'); has(tx, 'My team: 0 of 6'); await r.close(); });

t('TEAM-02', 'A Pokémon that left the regulation is kept but a note says it\'s left out', async () => {
  const r = await myTeam(); await r.ui.retirePokemonInSlot(5, 'Mewtwo'); const tx = await r.ui.text();
  ok(/Mewtwo/.test(tx) && /left out|isn't in|not in/i.test(tx), 'no note about the Pokémon left out'); ok(!(await r.ui.sixTiles()).some(n => /Mewtwo/.test(n)), 'retired Pokémon is drawn as a tile'); await r.close(); });

t('TEAM-03', 'Strength Score: number + band word + win line + rank; "so far" for 1-5; none when empty', async () => {
  const r = await myTeam({fresh: true}); let s = await r.ui.scoreBlock(); ok(s && s.label === 'Strength Score', 'no Strength Score block');
  ok(s.score === 93 && s.band === 'Top tier', `sample team scores ${s.score} ${s.band}, expected 93 Top tier`);
  const tx = await r.ui.text(); has(tx, /Teams scoring like this win about \d+% against today.s tournament teams/); has(tx, /Top \d+% of tournament teams/); has(tx, 'Why this score?');
  ok(!/\bGrade\b/.test(tx.slice(0, 400)), 'old "Grade" wording shown');
  await r.ui.removeFromTeam('Kingambit'); s = await r.ui.scoreBlock(); ok(s && s.label === 'Strength Score so far', 'five Pokémon not labelled "Strength Score so far"');
  await r.ui.clearTeam(); ok(!(await r.ui.scoreBlock()) && !(await r.ui.sees(/Strength Score \d/)), 'a score shows with no team'); await r.close(); });

t('TEAM-04', '"Why this score?" opens the breakdown; its parts add up to the score', async () => {
  const r = await myTeam({fresh: true}); const s = await r.ui.scoreBlock(); ok(await r.ui.whyExpanded() === false, 'button not collapsed at first');
  await r.ui.tapWhyScore(); ok(await r.ui.whyExpanded() === true, 'button not marked expanded'); const w = await r.ui.whyPanel(); ok(w, 'no breakdown panel');
  const base = w.match(/(\d+) from how its Pokémon/); ok(base, 'no "N from how its Pokémon…" part: ' + w.slice(0, 200));
  const adds = [...w.matchAll(/([+−-]\s?\d+) (?:for|from)/g)].map(m => +m[1].replace('−', '-').replace(/\s/g, ''));
  const sum = +base[1] + adds.reduce((a, b) => a + b, 0); ok(Math.abs(sum - s.score) <= 1, `parts add to ${sum}, score is ${s.score} (${w.slice(0, 300)})`);
  has(w, /How sure/); has(w, /How the grade works/); await r.ui.tapText('How the grade works', 900); ok(await r.ui.current() === 'method', 'link did not open How we calculate'); await r.close(); });

t('TEAM-05', 'Switch team fold lists saved teams; tapping one opens it with an Undo toast', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); has(await r.ui.text(), /Switch team \d+ saved/);
  await r.ui.openFold('Switch team'); const f = await r.ui.foldText('Switch team'); has(f, 'Rain test', 'switch fold');
  await r.ui.tapText(/^Rain test/, 2000); ok(await r.ui.teamHeading() === 'Rain test', 'heading did not change'); ok((await r.ui.team()).join() === RAIN.join(), 'team did not switch');
  ok(await r.ui.waitToast(/Opened .Rain test/), 'no "Opened "Rain test"" toast'); ok(await r.ui.has('#toastUndo'), 'toast has no Undo'); await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not return'); await r.close(); });

t('TEAM-06', '"Team Sheet" button opens the Team Sheet page with all six sets', async () => {
  const r = await myTeam(); await r.ui.tapText(/^Team Sheet$/, 900); ok(await r.ui.current() === 'sheet', 'Team Sheet page did not open');
  const tx = await r.ui.text(); has(tx, 'Team Sheet'); for (const n of ['Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler', 'Mega Charizard Y']) has(tx, n, 'Team Sheet'); await r.close(); });

t('TEAM-07', 'Phone jump bar: Suggestions | Matchups | How it plays | Sets; "Sets" scrolls to All Six Sets and opens the sheet', async () => {
  const r = await myTeam({team: TEAM, width: 390}); const j = await r.ui.jumpBar(); ok(j.join('|') === 'Suggestions|Matchups|How it plays|Sets', 'jump bar: ' + j.join('|'));
  await r.ui.jumpTo('Sets'); ok(await r.ui.inView(/All Six Sets/i), '"All Six Sets" not scrolled into view'); ok(await r.ui.foldOpen('Open Team Sheet') === true, 'team sheet fold not opened');
  ok(await r.ui.chosen('Sets') === true, '"Sets" not kept highlighted'); ok(await r.ui.noSideScroll(), 'sideways scroll at 390'); await r.close();
  const d = await myTeam({team: TEAM, width: 1280}); ok(!(await d.ui.jumpBar()).length, 'jump bar shows on desktop'); await d.close(); });

t('TEAM-08', 'Your Six: six tiles lead/back/bench; tapping a tile shows its set, tapping again hides it', async () => {
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
  for (const s of [/Garchomp/, /Dragon/, /Ground/, /(Leads with|In the back with|On the bench)/, /\d+ [SABCD] tier rating/, /Item \S/, /Ability \S/, /Nature \w+ (most run|yours)/, /Stat points \d+ \w+, \d+ \w+/, /Edit set/, /Info sheet ›/]) has(c, s, 'set card');
  const moves = await r.ui.pg.evaluate(() => [...document.querySelectorAll('#rzSet [class*=mv], #rzSet li')].filter(e => e.getClientRects().length && e.children.length <= 3).length); ok(moves >= 4, `${moves} move strips`);
  await r.ui.tapText('Edit set', 900); let p = await r.ui.editPanel(); ok(p && /Edit Garchomp/.test(p.text), 'Edit set did not open "Edit Garchomp"'); await r.ui.closeEditPanel();
  await r.ui.tapText('Info sheet ›', 900); const s = await r.ui.infoSheet(); ok(s && s.includes('Garchomp'), 'Info sheet did not open'); await r.close(); });

t('TEAM-11', 'Set as lead: plan says "your pick" (saved to the account); "Use NastyPlot\'s pick" goes back; Home follows', async () => {
  const r = await myTeam(); await r.ui.tapTile('Sneasler'); has(await r.ui.setCard(), 'Set as lead'); await r.ui.tapText('Set as lead', 1200);
  ok(await r.ui.waitToast(/Sneasler now leads/), 'no "Sneasler now leads" toast'); let pl = await r.ui.gamePlanLine(); ok(/your pick/.test(pl) && /lead (Sneasler \+|.+ \+ Sneasler)/.test(pl), 'plan line: ' + pl);
  await sleep(1000); const a = await r.acct(); ok(a && Array.isArray(a.leads) && a.leads.includes('Sneasler'), 'lead pick not saved to the account: ' + JSON.stringify(a && a.leads));
  await r.ui.go('Home'); ok(/your leads|Sneasler/.test(await r.ui.homePlanLine()), 'Home plan ignores the pick: ' + await r.ui.homePlanLine());
  await r.ui.go('My Team', 1000); await r.ui.tapText("Use NastyPlot's pick", 1200); ok(await r.ui.waitToast(/Back to NastyPlot.s lead pick/), 'no "Back to NastyPlot\'s lead pick" toast');
  pl = await r.ui.gamePlanLine(); ok(!/your pick/.test(pl), 'still "your pick": ' + pl); await r.close(); });

t('TEAM-12', 'Game plan line names two leads, two back, two bench', async () => {
  const {ui} = await view('team', {team: TEAM}, 'My Team'); ok(/^Game plan vs the meta's top six: lead .+ \+ .+, back .+ \+ .+, bench .+ \+ .+\.$/.test(await ui.gamePlanLine() || ''), 'plan line: ' + await ui.gamePlanLine());
  const r = await myTeam({team: ['Garchomp', 'Incineroar']}); ok(/in team order/.test(await r.ui.gamePlanLine() || ''), 'under 4: no "in team order" line'); await r.close(); });

t('TEAM-13', 'Team actions row: Save/Update label, ⋯ menu; empty team keeps only Saved Teams, My Box, ⋯ Import', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.openMoreActions(); const a = await r.ui.teamActions();
  for (const s of ['Saved Teams', 'My Box', 'Compare with…', 'Copy for Showdown', 'Save team', 'Share', 'Import', 'Export', 'Clear team']) ok(a.includes(s), 'no action ' + s + ' in ' + a.join('|'));
  await r.ui.tapText('Saved Teams', 900); ok(await r.ui.current() === 'teams', 'Saved Teams did not open'); await r.ui.go('My Team', 800);
  await r.ui.tapText(/^My Box$/, 900); ok(await r.ui.current() === 'box', 'My Box did not open'); await r.ui.go('My Team', 800);
  await r.ui.tapText('Compare with…', 900); ok(await r.ui.current() === 'compare', 'Compare did not open'); await r.ui.go('My Team', 800);
  await r.ui.openFold('Switch team'); await r.ui.tapText(/^Rain test/, 1800); ok((await r.ui.teamActions()).includes('Update saved team'), 'open saved team: no "Update saved team"');
  await r.ui.clearTeam(); await r.ui.openMoreActions(); const e = await r.ui.teamActions();
  for (const s of ['Save team', 'Update saved team', 'Share', 'Export', 'Clear team', 'Copy for Showdown', 'Compare with…']) ok(!e.includes(s), 'empty team still shows ' + s);
  for (const s of ['Saved Teams', 'My Box', 'Import']) ok(e.includes(s), 'empty team lost ' + s); await r.close(); });

t('TEAM-14', 'Clear team: "No team yet", toast "Team cleared"; Undo restores the six and the open saved team', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.openFold('Switch team'); await r.ui.tapText(/^Rain test/, 1800);
  await r.ui.clearTeam(); ok(await r.ui.waitToast(/Team cleared/), 'no "Team cleared" toast'); has(await r.ui.text(), 'No team yet'); ok(!(await r.ui.foldOpen('More team actions')), '⋯ menu stayed open');
  await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === RAIN.join(), 'six not restored'); ok(await r.ui.teamHeading() === 'Rain test', 'open saved team not restored'); await r.close(); });

t('TEAM-15', 'Matchups summary: Favoured/Even/Unfavoured add to 30 and match the Matchups legend', async () => {
  const {ui} = await view('team', {team: TEAM}, 'My Team'); const tx = await ui.text();
  const m = tx.match(/Matchups (\d+) Favoured (\d+) Even (\d+) Unfavoured vs the top 30 threats in real games/); ok(m, 'no "N Favoured / N Even / N Unfavoured" summary');
  ok(+m[1] + +m[2] + +m[3] === 30, 'numbers add to ' + (+m[1] + +m[2] + +m[3])); has(tx, /Damage calc: covers \d+ of 30/);
  const l = tx.match(/Unfavoured (\d+) Even match (\d+) Favoured (\d+)/); ok(l && l[1] === m[3] && l[2] === m[2] && l[3] === m[1], 'header numbers differ from the Matchups legend'); });

t('TEAM-16', 'Legal and "Team checks 4/4" badge with the rules tooltip', async () => {
  const r = await myTeam({fresh: true}); const tx = await r.ui.text(); has(tx, /Legal Team checks 4\/4/);
  ok(await r.ui.pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] [title]')].some(e => /Based on our reading of the Reg M-C rules/.test(e.title))), 'no rules tooltip'); await r.close();
  const {ui} = await view('team', {team: TEAM}, 'My Team'); has(await ui.text(), /Legal Team checks 2\/4/); });

t('TEAM-18', 'Weather backdrop behind a sun team\'s header', async () => {}, {skip: 'decorative animation on the old header, mostly covered by the arena layout (inventory unsure it shows); needs a visual check, not a behaviour test'});

t('TEAM-19', 'Empty team: Darkrai, invitation, "Add your first Pokémon" opens the add box; six "+ Add a Pokémon"', async () => {
  const r = await myTeam({team: []}); const tx = await r.ui.text();
  has(tx, 'Add your six and NastyPlot scouts the top 30 threats for you.'); has(tx, 'Build me a team'); ok(await r.ui.emptyTiles() === 6, 'not six "+ Add a Pokémon" tiles');
  ok(await r.ui.pg.evaluate(() => [...document.querySelectorAll('[data-pane="report"] img')].some(i => i.getClientRects().length && i.src === window.NP_MASCOT)), 'no Darkrai picture');
  ok(!/Suggestions What to Change|Who Beats You/.test(tx), 'parts 1-3 still shown'); has(tx, /Tap a Slot to Add a Pokémon/i);
  await r.ui.tapText('Add your first Pokémon', 900); const p = await r.ui.editPanel(); ok(p && /Add a Pokémon/.test(p.title + p.text), 'add panel did not open');
  const nb = await r.ui.nameBox(); ok(nb && nb.focused, 'name box not focused'); await r.ui.closeEditPanel();
  await r.ui.tapText('Build me a team', 900); ok(await r.ui.current() === 'auto', 'Build me a team did not open Build'); await r.close(); });

t('TEAM-20', 'Partial team: "so far" score, "+ X added" suggestions, no Your games, Save/Share available', async () => {
  const r = await myTeam({team: ['Garchomp', 'Incineroar']}); const s = await r.ui.scoreBlock(); ok(s && s.label === 'Strength Score so far', 'score not "so far"');
  const c = await r.ui.suggestionCards(); ok(c.length && /\+ ?\S+.* added/.test(c[0]), 'first suggestion is not "+ X added": ' + c[0]);
  ok(!(await r.ui.myGamesCard()), '"Your games" shows for 2 Pokémon'); const a = await r.ui.teamActions(); for (const x of ['Compare with…', 'Save team', 'Share']) ok(a.includes(x), 'no ' + x);
  ok(await r.ui.emptyTiles() === 4, 'not four empty tiles'); await r.close(); });
