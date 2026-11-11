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
  const s = SHARED[key]; if (page && !s.settled) { await s.ui.settle(); s.settled = true; } if (page && (await s.ui.current()) !== s.ui.PAGES[page]) await s.ui.go(page, 600); return s; }
async function myTeam(opts = {team: TEAM}) { const r = await open(opts); await r.ui.go('My Team', 600); await r.ui.waitText(/Strength Score|No team yet|Grade/, 12000); await r.ui.settle(); return r; }
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
  ok(/paste/i.test(await r.ui.focusName()) || (await r.ui.focusName()).includes('Showdown'), 'cursor is not in the paste box (focused: ' + await r.ui.focusName() + ')'); await r.close(); });

t('HOME-08', 'All 11 Tools: each card opens the page named on it', async () => {
  const r = await open({team: TEAM}); has(await r.ui.text(), /All 11 Tools/);
  const want = {'Battle Mode': 'matchup', Teams: 'top', 'Type Chart': 'types', Ratings: 'ratings', 'Damage Calc': 'calc', Events: 'events', 'Test Run': 'gauntlet', 'Popular Sets': 'sets', 'Speed Tiers': 'speed', Archetypes: 'arch', 'Winning Cores': 'cores'};
  const tools = await r.ui.homeTools(); ok(tools.length === 11, `${tools.length} tool cards: ${tools.join(', ')}`);
  for (const [name, v] of Object.entries(want)) { ok(tools.includes(name), 'no tool card ' + name); await r.ui.go('Home', 300); await r.ui.tapTool(name); const now = await r.ui.current(); ok(now === v || (v === 'cores' && now === 'auto'), `${name} opened ${now}`); }
  noErrs(r); await r.close(); });

t('HOME-09', 'Champion\'s six: load needs a second tap, loads with Undo; Copy for Showdown copies', async () => {
  const r = await open({team: TEAM}); await r.ui.grantClipboard(); const tx = await r.ui.text();
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
  const r = await open({fresh: true}); const w = await r.ui.welcomeCardText(); ok(w, 'no welcome card for a first-time visitor');
  for (const s of ['How NastyPlot works', 'Get a team', 'Read your scouting report', 'Plan each match', 'Build me a team', 'Copy a top team', 'Got it']) has(w, s, 'welcome card');
  await r.ui.tapText('Got it'); ok(!(await r.ui.welcomeCardText()), 'card still there after Got it'); await r.ui.reload(); ok(!(await r.ui.welcomeCardText()), 'card came back after reload'); await r.close();
  const back = await open({team: TEAM}); ok(!(await back.ui.welcomeCardText()), 'returning visitor sees the welcome card'); await back.close(); });

t('HOME-13', 'What\'s New fold after an update; × dismisses it for good; never for first-time visitors', async () => {
  // the kit re-seeds stored keys on every reload, so seed this one by hand once
  const r = await open({fresh: true}); await r.pg.evaluate(() => { localStorage.setItem('cc2.welcomed', '"1"'); localStorage.setItem('cc2.seenNew', '"2020-01-01"'); sessionStorage.clear(); }); await r.ui.reload(); ok(await r.ui.sees(/What's New\s+\d+ updates/), 'no What\'s New fold after an update');
  await r.ui.openFold("What's New"); ok(((await r.ui.foldContent("What's New")) || '').length > 80, 'fold lists no updates');
  await r.ui.closeWhatsNew(); ok(!(await r.ui.sees("What's New")), 'fold still shown after ×'); await r.ui.reload(); ok(!(await r.ui.sees("What's New")), 'fold came back after reload'); await r.close();
  const f = await open({fresh: true}); ok(!(await f.ui.sees("What's New")), 'first-time visitor sees What\'s New'); await f.close(); });

t('HOME-14', 'Top of the Meta: 10 rated rows, Hidden gems switch changes the list, rows open info sheets', async () => {
  const r = await open({team: TEAM}); const tx = await r.ui.text(); has(tx, /NastyPlot ratings: from [\d,]+ tournament teams Top of the Meta/);
  const top = await r.ui.homeTopRows(); ok(top.length === 10, `${top.length} rows`); ok(/Sneasler S \d+ #1|\S+ [SABCD] \d+ #1/.test(tx), 'rows don\'t read "Name S 97 #1"');
  ok(await r.ui.chosen('Top rated') === true, '"Top rated" not chosen by default'); await r.ui.choose('Hidden gems');
  const gems = await r.ui.homeTopRows(); ok(gems.length >= 1 && gems.join() !== top.join(), 'Hidden gems list did not change'); ok(await r.ui.chosen('Hidden gems') === true, 'Hidden gems not shown as chosen');
  const before = tx.match(/Highest NastyPlot ratings[^.]*\./); ok(!(await r.ui.text()).includes(before ? before[0] : '@@'), 'hint line did not change for Hidden gems');
  await r.ui.tapPokemon(gems[0].replace(/-Mega.*/, '')); ok(await r.ui.infoSheet(), 'row did not open the info sheet'); await r.ui.closeInfoSheet(); has(await r.ui.text(), 'All ratings ›'); await r.close(); });

t('HOME-15', 'More on Home fold: pairs, what changed, cores, "Log a game" → Battle; stays open after reload', async () => {
  const r = await open({team: TEAM}); await r.ui.openFold('More on Home'); const f = await r.ui.foldContent('More on Home');
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
  await r.ui.switchTeam('Rain test'); ok(await r.ui.teamHeading() === 'Rain test', 'heading after opening a saved team: ' + await r.ui.teamHeading());
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
  await r.ui.openFold('Switch team'); const f = await r.ui.foldContent('Switch team'); has(f, 'Rain test', 'switch fold');
  await r.ui.switchTeam('Rain test'); ok(await r.ui.teamHeading() === 'Rain test', 'heading did not change'); ok((await r.ui.team()).join() === RAIN.join(), 'team did not switch');
  ok(await r.ui.waitToast(/Opened .Rain test/), 'no "Opened "Rain test"" toast'); ok(await r.ui.has('#toastUndo'), 'toast has no Undo'); await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not return'); await r.close(); });

t('TEAM-06', '"Team Sheet" button opens the Team Sheet page with all six sets', async () => {
  const r = await myTeam(); await r.ui.tapText(/^Team Sheet$/, 900); ok(await r.ui.current() === 'sheet', 'Team Sheet page did not open');
  const tx = await r.ui.text(); has(tx, 'Team Sheet'); for (const n of ['Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler', 'Mega Charizard Y']) has(tx, n, 'Team Sheet'); await r.close(); });

t('TEAM-07', 'Phone jump bar: Suggestions | Matchups | How it plays | Sets; "Sets" scrolls to All Six Sets and opens the sheet', async () => {
  const r = await myTeam({team: TEAM, width: 390}); const j = await r.ui.jumpBar(); ok(j.join('|') === 'Suggestions|Matchups|How it plays|Sets', 'jump bar: ' + j.join('|'));
  await r.ui.jumpTo('Sets'); ok(await r.ui.onScreen(/^Open Team Sheet/), 'All Six Sets (its Open Team Sheet fold) not scrolled into view'); ok(await r.ui.foldOpen('Open Team Sheet') === true, 'team sheet fold not opened');
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
  await r.ui.switchTeam('Rain test'); ok((await r.ui.teamActions()).includes('Update saved team'), 'open saved team: no "Update saved team"');
  await r.ui.clearTeam(); await r.ui.openMoreActions(); const e = await r.ui.teamActions();
  for (const s of ['Save team', 'Update saved team', 'Share']) ok(!e.includes(s), 'empty team still shows ' + s);
  for (const s of ['Saved Teams', 'My Box', 'Import']) ok(e.includes(s), 'empty team lost ' + s); await r.close(); });

t('TEAM-14', 'Clear team: "No team yet", toast "Team cleared"; Undo restores the six and the open saved team', async () => {
  const r = await myTeam({team: TEAM, saved: SAVED}); await r.ui.switchTeam('Rain test');
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
t('TEAM-13b', 'Empty team: the ⋯ menu hides Export and Clear team (only Import stays)', async () => {
  const r = await myTeam({team: []}); await r.ui.openMoreActions(); const e = await r.ui.teamActions();
  for (const s of ['Export', 'Clear team']) ok(!e.includes(s), 'empty team still shows ' + s); ok(e.includes('Import'), 'Import missing'); await r.close(); },
  {known: 'inventory says Export and Clear team are hidden with an empty team; today they still show in the ⋯ menu (inventory or code is wrong: Sim to decide)'});

// ================= My Team · Part 1 Suggestions =================
// a sample-team player whose saved data lives in this browser only (the kit re-seeds the fake account on reload, so reload
// checks of saved settings use browser storage); note: without the account the kit serves no daily data
const localSample = () => open({account: false});

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
  ok(await l.ui.chosen('Yes') === true, '"Yes" reset to "No" after reload'); await l.close(); }, {known: 'inventory #22: "Swap my Mega?" is a hidden checkbox and resets on reload while "Megas on team" is saved'});

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
  ok(await r.ui.sees(/Nothing raises this team.s Strength Score right now|No single change from this pool raises the team.s Strength Score|every other swap would lower it/), 'no no-gain message'); await r.close(); });

t('SUG-10', 'Problems and Team Checks: count line, Ice row with Quick add; "Swap out Rillaboom" applies with Undo', async () => {
  const r = await myTeam(); has(await r.ui.text(), /Problems and Team Checks 7 to look at, 2\/4 checks, legal/);
  await r.ui.openFold('Problems and Team Checks', true, 1500); const f = await r.ui.foldContent('Problems and Team Checks');
  for (const s of [/Weakness Ice 3 weak/, /Quick add/, /Swap out Rillaboom/, /Show \d+ more/, /Team checks 2 of 4 checks/, /Mega Evolution/, /No major weak spot/, /Weak spots spread out/, /Ready for the top threats/, /Notes, not counted/, /Speed control/, /Spread damage/, /Lead support/, /No answer for/, /Shaky against/, /Type balance/]) has(f, s, 'Problems fold');
  ok(await r.ui.foldOpen('Weakness Ice') === true, 'first fixable problem not opened automatically');
  await r.ui.tapText(/^Show \d+ more$/, 700); has(await r.ui.foldContent('Problems and Team Checks'), /Show less/, 'Problems fold');
  await r.ui.tapText('Swap out Rillaboom', 1500); await r.ui.settle(); ok(await r.ui.has('#toastUndo'), 'no Undo toast'); ok(!(await r.ui.team()).includes('Rillaboom'), 'Rillaboom not swapped out');
  ok(await r.ui.undoBar(), 'no Undo bar'); await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.foldOpen('Problems and Team Checks') === true, 'fold not remembered open'); await r.close(); });

t('SUG-11', '"?" explainer: bubble titled "Ready for the top threats", Escape closes it', async () => {
  const r = await myTeam(); await r.ui.openFold('Problems and Team Checks', true, 1200); await r.ui.tapTip('What is Ready for the top threats?');
  const b = await r.ui.tipBubble(); ok(b && /Ready for the top threats/.test(b), 'no bubble titled "Ready for the top threats"'); ok(/How we calculate|How we work it out|→/.test(b), 'bubble has no link to How we calculate: ' + b);
  await r.ui.press('Escape'); ok(!(await r.ui.tipBubble()), 'Escape did not close the bubble'); await r.close(); });

// ================= My Team · Part 2 Matchups =================
t('MU-01', 'Matchups view switch Top 10 | Top 12 grid | All 30 is remembered', async () => {
  const r = await myTeam(); ok(await r.ui.chosen('Top 10') === true, 'Top 10 not default'); await r.ui.choose('All 30', 1200);
  await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.chosen('All 30') === true, 'All 30 not remembered'); await r.close(); });

t('MU-02', 'Top 10 threats with real-games verdict and calc level; phone shows 5 + "Show 5 more"; row opens threat sheet', async () => {
  const r = await myTeam({team: TEAM, width: 390}); let rows = await r.ui.topThreatRows(); ok(rows.length === 5, `${rows.length} rows on a phone`);
  for (const x of rows) ok(/^\d+ .+ (Favoured|Even match|Unfavoured) Calc: (Beats it|Handles it|Shaky|No answer)$/.test(x), 'row reads ' + x);
  const tx = await r.ui.text(); has(tx, /Verdicts from real tournament games/); has(tx, /Unfavoured \d+ Even match \d+ Favoured \d+/); has(tx, /Damage calc: No answer \d+, Shaky \d+, Handles it \d+, Beats it \d+/);
  await r.ui.tapText('Show 5 more', 700); rows = await r.ui.topThreatRows(); ok(rows.length === 10, `${rows.length} rows after Show 5 more`); ok(await r.ui.sees('Show top 5 only'), 'no "Show top 5 only"');
  await r.ui.tapThreat('Archaludon'); const s = await r.ui.threatSheet(); ok(s && /Archaludon/.test(s) && await r.ui.threatPressedInSheet() === 'Archaludon', 'threat sheet did not open on Archaludon'); await r.close();
  const {ui} = await view('team', {team: TEAM}, 'My Team'); const dr = await ui.topThreatRows(); ok(dr.length === 10, 'desktop shows ' + dr.length + ' rows: ' + dr.slice(0, 12).map(x => x.slice(0, 14)).join(' / ')); has(await ui.text(), /The next 20, worst first/); });

t('MU-03', 'Top 12 grid: 12 threat rows × 6 cells; a row opens its threat sheet', async () => {
  const r = await myTeam(); await r.ui.choose('Top 12 grid', 1200); const g = await r.ui.gridRows(); ok(g && g.length === 12, `${g && g.length} grid rows`);
  ok(g.every(x => x.cells === 6), 'a row lacks 6 cells'); has(await r.ui.text(), /Tap one for the full matchup/);
  await r.ui.tapGridRow(0); const s = await r.ui.threatSheet(); ok(s && s.includes(g[0].name), 'grid row did not open the threat sheet for ' + g[0].name); await r.close(); });

t('MU-04', 'All 30: "Threat preparation" groups; a threat opens to its calc reasons; Biggest threats list', async () => {
  const r = await myTeam(); await r.ui.choose('All 30', 1500); const tx = await r.ui.text();
  for (const s of [/Threat preparation/, /Ready for \d+% of the top 30 threats/, /Shaky \d+ threats?/, /Handles it \d+ threats?/, /Beats it \d+ threats?/, /Meta Pokémon that hit several of yours hard/]) has(tx, s, 'All 30');
  const first = await r.ui.pg.evaluate(() => { const d = [...document.querySelectorAll('[data-pane="report"] details details')].find(e => e.getClientRects().length && /% of top cuts/.test(e.querySelector('summary').innerText)); if (!d) return null; d.querySelector('summary').click(); return d.querySelector('summary').innerText.split('\n')[0]; });
  ok(first, 'no threat fold to open'); await sleep(500); const ft = await r.ui.foldContent(first); ok(ft && /(✓|~|✗)/.test(ft) && /usual set/i.test(ft), `threat ${first} shows no calc reasons / usual set: ${ft && ft.slice(0, 200)}`); await r.close(); });

t('MU-05', 'Threat sheet: opens on the threat, other tiles switch detail, Escape closes and focus returns', async () => {
  const r = await myTeam(); await r.ui.tapThreat('Archaludon'); let s = await r.ui.threatSheet(); ok(s, 'sheet did not open');
  for (const x of [/Scouting report: top 30 threats/, /\d+ threats? need a plan|Ready for every top threat/, /handles \d+ of the top 30/, /% of top cuts/, /Team checks: \d\/4/, /Close/]) has(s, x, 'threat sheet');
  ok(await r.ui.threatPressedInSheet() === 'Archaludon', 'sheet not on Archaludon'); await r.ui.tapThreatInSheet('Farigiraf'); ok(await r.ui.threatPressedInSheet() === 'Farigiraf', 'tile did not switch the detail'); has(await r.ui.threatSheet(), 'Farigiraf');
  await r.ui.press('Escape'); ok(!(await r.ui.threatSheet()), 'Escape did not close');
  await r.ui.tapThreat('Archaludon'); await r.ui.tapText(/^Close$/); ok(!(await r.ui.threatSheet()), 'Close did not close'); await r.close(); });
t('MU-05d', 'Closing the threat sheet puts focus back on the threat row that opened it', async () => {
  const r = await myTeam(); await r.ui.tapThreat('Archaludon'); await r.ui.press('Escape'); ok(/Archaludon/.test(await r.ui.focusName()), 'focus not back on the row: "' + await r.ui.focusName() + '"'); await r.close(); },
  {known: 'measured headless: after scrolling the Top 10 into view, the list redraws while the sheet is open, so the opener is gone and focus falls to the page (works when nothing redraws)'});
t('MU-05b', 'Threat sheet ring shows the Strength Score number and band, not the old letter', async () => {
  const r = await myTeam(); const sc = await r.ui.scoreBlock(); await r.ui.tapThreat('Archaludon'); const s = await r.ui.threatSheet();
  ok(!/^× Scouting report: top 30 threats \d+ threats? need a plan\. [A-F][+−-]? /.test(s), 'ring shows a grade letter: ' + s.slice(0, 90)); ok(s.includes(sc.band), 'ring has no band word'); await r.close(); },
  {known: 'inventory #15: the threat sheet ring still shows the old letter ("B 82.5") instead of the Strength Score and band word'});
t('MU-05c', 'Threat sheet "Best fix" never offers a change that doesn\'t raise the score', async () => {
  const r = await myTeam({fresh: true}); await r.ui.tapThreat('Archaludon'); const s = await r.ui.threatSheet();
  ok(!/Best fix:[^.]*±0/.test(s), 'Best fix offers ±0: ' + (s.match(/Best fix:.{0,60}/) || [''])[0]); await r.close(); },
  {known: 'inventory #14: "Best fix: ±0 (93 → 93)" with "Apply this fix" on the sample team'});

// ================= My Team · Part 3 and 4 =================
t('PLAY-01', 'Game Plan fold: rows with Covered/Missing/Partly; Speed control covered by Whimsicott with Tailwind', async () => {
  const r = await myTeam(); await r.ui.openFold('Game Plan', true, 800); const f = await r.ui.foldContent('Game Plan');
  has(f, /Speed control (Covered|Partly)[^]*Whimsicott with Tailwind/, 'Game Plan'); for (const s of ['Backup speed', 'Weather', 'Terrain', 'Lead support', 'Priority attacks', 'Answer to their speed control']) has(f, s, 'Game Plan');
  has(f, /(Covered|Missing|Partly|Optional)/); await r.ui.reload(2500); await r.ui.go('My Team', 2500); ok(await r.ui.foldOpen('Game Plan') === true, 'Game Plan fold not remembered'); await r.close(); });

t('PLAY-02', 'Types fold: Offense/Defense switch, type grid, Mega pick with two Megas', async () => {
  const r = await myTeam({team: ['Charizard-Mega-Y', 'Salamence-Mega', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler']}); await r.ui.openFold('Types', true, 800);
  let f = await r.ui.foldContent('Types What you hit'); has(f, /You OHKO or 2HKO \d+ of the top 30 threats|types hit super effectively/, 'Offense');
  await r.ui.choose('Defense: what hits you', 1000); f = await r.ui.foldContent('Types What you hit'); has(f, /\d+ more weaknesses than resistances|resistances/, 'Defense'); has(f, /More weak than resist/); has(f, /Only one Mega Evolves per battle, so the chart reads Mega Charizard Y as the Mega/);
  await r.ui.pickTypeChartMega('Mega Salamence'); has(await r.ui.foldContent('Types What you hit'), /reads Mega Salamence as the Mega/, 'Mega pick');
  await r.ui.openFold('Full Tables', true, 500); const rows = await r.ui.pg.evaluate(() => { const t = [...document.querySelectorAll('[data-pane="report"] table')].filter(e => e.getClientRects().length).find(t => /Weak|Net/i.test(t.innerText)); return t ? t.querySelectorAll('tbody tr').length : 0; });
  ok(rows >= 18, `defense type grid has ${rows} rows (want one per attacking type)`); await r.close(); });

t('SETS-01', 'Open Team Sheet fold: one card per Pokémon; tapping opens its edit panel; "−" removes with Undo', async () => {
  const r = await myTeam(); await r.ui.openFold('Open Team Sheet', true, 900); const f = await r.ui.foldContent('Open Team Sheet');
  for (const s of ['Whimsicott', 'Garchomp', /Item /, /Ability /, /HP \d+/, /Spe\+? \d+/]) has(f, s, 'team sheet fold');
  await r.ui.tapLabel('Whimsicott: edit its set', 1000); const p = await r.ui.editPanel(); ok(p && /Edit Whimsicott/.test(p.text), 'card did not open "Edit Whimsicott"'); await r.ui.closeEditPanel();
  await r.ui.tapLabel('Remove Whimsicott from the team', 900); ok(await r.ui.waitToast(/Removed Whimsicott/), 'no removal toast'); ok(await r.ui.has('#toastUndo'), 'no Undo'); ok(!(await r.ui.team()).includes('Whimsicott'), 'not removed'); await r.close();
  const ph = await myTeam({team: TEAM, width: 390}); ok(await ph.ui.foldOpen('Open Team Sheet') === false, 'fold open by default on a phone'); await ph.close(); });

t('SETS-02', 'How Scoring Works fold explains Ready for the top threats', async () => {
  const r = await myTeam(); await r.ui.openFold('How Scoring Works', true, 600); has(await r.ui.foldContent('How Scoring Works'), /Ready for the top threats: the 30 Pokémon that make top cut most often/, 'How Scoring Works'); await r.close(); });

// ================= 3. Edit panel =================
t('EDIT-01', 'Edit panel opens titled "Edit <name>"; Done, Escape and the backdrop close it', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); let p = await r.ui.editPanel(); ok(p && p.title === 'Edit Garchomp', 'panel title: ' + (p && p.title));
  ok(await r.ui.pg.evaluate(() => document.querySelector('#chEdit').contains(document.activeElement)), 'focus did not move into the panel');
  await r.ui.press('Escape'); ok(!(await r.ui.editPanel()), 'Escape did not close');
  await r.ui.openEditPanel('Garchomp'); await r.ui.closeEditPanel(); ok(!(await r.ui.editPanel()), 'Done did not close');
  await r.ui.openEditPanel('Garchomp'); await r.ui.pg.mouse.click(5, 5); await sleep(500); ok(!(await r.ui.editPanel()), 'backdrop tap did not close');
  await r.ui.tapLabel('Garchomp: edit its set').catch(() => {}); await r.close(); });
t('EDIT-01b', 'Closing the edit panel puts focus back on "Edit set"', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); await r.ui.press('Escape'); ok(/^Edit set$/.test(await r.ui.focusName()), 'focus is on "' + await r.ui.focusName() + '"'); await r.close(); });

t('EDIT-02', 'Six-slot strip in the panel switches the panel to that Pokémon', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); const st = await r.ui.editStrip(); ok(st.length === 6 && st.every(x => /^Edit /.test(x)), 'strip: ' + st.join(','));
  await r.ui.tapStrip(2); ok((await r.ui.editPanel()).title === 'Edit Incineroar', 'third sprite did not switch to Incineroar'); await r.close(); });

t('EDIT-03', 'Slot header: Lock → "Locked" (tile shows locked), types, Mega/rating tags, usage', async () => {
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
  await r.ui.setStatPoints([32, 32, 0, 0, 2, 0]); await r.ui.saveStatPoints(); ok(await r.ui.waitToast(/Stat points saved/), 'no "Stat points saved" toast'); has((await r.ui.editPanel()).text, /Yours/);
  await r.ui.closeEditPanel(); await r.ui.go('Team Sheet', 900); const tx = await r.ui.text(); const g = tx.slice(tx.indexOf('Garchomp'), tx.indexOf('Garchomp') + 400);
  has(g, /HP \d+ 32/, 'Team Sheet Garchomp'); has(g, /Spe \d+ 0/, 'Team Sheet Garchomp'); await r.close(); });

t('EDIT-06', 'Ability picker: a rarer ability names the common one; "Use Prankster" restores', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Whimsicott'); const other = (await r.ui.panelOptions('ability')).find(x => x && x !== 'Prankster');
  ok(other, 'no other ability to pick'); await r.ui.pickInPanel('ability', other); ok(await r.ui.waitToast(new RegExp(other + ' set \\(most players run Prankster\\)')), 'toast does not name the common ability');
  has((await r.ui.editPanel()).text, /Your pick/); await r.ui.panelButton(/^Use Prankster$/); ok(await r.ui.waitToast(/Prankster: the most-used ability/), 'no reset toast'); await r.close(); });

t('EDIT-07', 'Item picker: "Sitrus Berry" gives a toast, "Your pick" tag and "Use Focus Sash"', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Whimsicott'); has((await r.ui.editPanel()).text, /Item Most used/);
  await r.ui.pickInPanel('item', 'Sitrus Berry'); ok(await r.ui.waitToast(/^Sitrus Berry/), 'no item toast'); const p = (await r.ui.editPanel()).text; has(p, /Your pick/); has(p, /Use Focus Sash/);
  await sleep(900); ok(((await r.acct()).slots[3].it || {}).doubles === 'Sitrus Berry', 'item not saved to the account'); await r.close(); });
t('EDIT-07b', 'Item toast uses today\'s words (matchups), not the old "ready for N%" readiness', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Whimsicott'); await r.ui.pickInPanel('item', 'Sitrus Berry'); const tt = await r.ui.waitToast(/^Sitrus Berry/);
  ok(tt && !/ready for \d+% → \d+% of the top threats/.test(tt), 'toast: ' + tt); await r.close(); }, {known: 'inventory #20: item toast still says "ready for 85% → 87% of the top threats"'});

t('EDIT-08', 'Moves: change move 4 → toast mentions Offense; "Reset to popular" brings the popular four back', async () => {
  const r = await myTeam(); await r.ui.openEditPanel('Garchomp'); const before = await r.ui.panelMoves(); ok(before.length === 4, 'not four move pickers');
  const other = (await r.ui.panelOptions('move3')).find(x => x && x !== '(no move)' && !before.includes(x));
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
  const r = await myTeam(); await r.ui.tapText(/^Save team$/, 1000); const p = await r.ui.editPanel(); ok(p && /Edit team/.test(p.title + p.text.slice(0, 30)), 'panel not "Edit team"');
  has(p.text, /Save this doubles team/i); ok((p.text.match(/Save stat points/g) || []).length === 6, 'not six set editors'); await r.close(); });

// ================= 4. Adding a Pokémon =================
t('ADD-01', 'Name box: live search, Enter adds, species already on the team are left out', async () => {
  const r = await myTeam({team: TEAM.slice(0, 5)}); await r.ui.tapLabel('Add a Pokémon to slot 6', 900); const nb = await r.ui.nameBox(); ok(nb && nb.focused, 'name box not focused');
  await r.ui.typeName('mega sal'); const opts = await r.ui.nameOptions(); ok(opts.length >= 1 && opts.length <= 8 && /Mega Salamence/.test(opts[0]), 'list: ' + opts.join(' / '));
  ok(/%|–/.test(opts[0]), 'option shows no usage share'); await r.ui.press('Escape'); ok(!(await r.ui.nameOptions()).length && await r.ui.editPanel(), 'Escape closed more than the list');
  await r.ui.typeName('mega sal'); await r.ui.press('Enter', 1200); ok(await r.ui.waitToast(/Mega Salamence added/), 'no "Mega Salamence added" toast'); ok((await r.ui.editPanel()).title === 'Edit Mega Salamence', 'title not "Edit Mega Salamence"');
  await r.ui.removeFromTeam('Mega Salamence').catch(() => {}); await r.ui.closeEditPanel().catch(() => {});
  await r.ui.tapLabel('Add a Pokémon to slot 6', 900); await r.ui.typeName('garch'); ok(/already here/.test(await r.ui.nameListText() || ''), 'no "already here" note: ' + await r.ui.nameListText());
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
  const r = await myTeam(); await r.ui.openImport(); const p = await r.ui.editPanel(); has(p.text, /Import a team/); has(p.text, /Replace my team/); has(p.text, /Pokepaste links can't be opened from here/);
  await r.ui.pasteTeam(PASTE); const tt = await r.ui.waitToast(/^Imported 2 Pokémon/); ok(tt, 'no "Imported 2 Pokémon" toast: ' + (await r.ui.toasts()).join(' | '));
  has(tt, /Mewtwo/, 'toast'); has(tt, /Bogus Move/, 'toast'); ok((await r.ui.team()).join() === 'Garchomp,Incineroar', 'team after import: ' + (await r.ui.team()).join());
  await r.ui.tapToastUndo(); ok((await r.ui.team()).join() === TEAM.join(), 'Undo did not restore'); await r.close(); });

t('IO-02', 'Export to Showdown: Showdown text with item, Ability, Level 50, EVs, nature, moves; Copy', async () => {
  const r = await myTeam(); await r.ui.grantClipboard(); await r.ui.openExport(); const p = await r.ui.editPanel(); has(p.text, /Export to Showdown/);
  const x = await r.ui.exportText(); ok(x, 'no export text'); ok(/^Charizard @ Charizardite Y\nAbility: \w+/.test(x), 'export starts: ' + x.slice(0, 60));
  for (const s of [/Level: 50/, /EVs: /, /\w+ Nature/, /\n- /]) has(x, s, 'export'); ok((x.match(/ @ /g) || []).length === 6, 'not six Pokémon in the export');
  await r.ui.panelButton(/^Copy$/); ok(await r.ui.waitToast(/Copied|Press Ctrl\+C/), 'no copy toast'); await r.close(); });

t('IO-03', 'Copy for Showdown on My Team: toast and six Showdown blocks on the clipboard', async () => {
  const r = await myTeam(); await r.ui.grantClipboard(); await r.ui.tapText('Copy for Showdown'); ok(await r.ui.waitToast(/Copied — paste into Showdown's teambuilder/), 'no copy toast');
  const c = await r.ui.copied(); ok(c && c.trim().split(/\n\s*\n/).length === 6, 'clipboard does not hold six blocks'); await r.close(); });

t('IO-04', 'Team Sheet "Copy as text" copies the team', async () => {
  const r = await myTeam(); await r.ui.grantClipboard(); await r.ui.go('Team Sheet', 900); await r.ui.tapText('Copy as text'); ok(await r.ui.waitToast(/Team copied as text/), 'no "Team copied as text" toast');
  ok(/Garchomp/.test(await r.ui.copied() || ''), 'clipboard has no team'); await r.close(); });
