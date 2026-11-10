// Group B behaviour tests: Build page (Build for Me, Build around a core, recent winners), All suggestions, the suggestion
// system, Popular Sets and Archetypes, plus the shared behaviour of those pages. One test per entry in
// docs/rebuild/inventory/B-build.md, keyed by its ID, written from the player's side. Talk to the page only through `ui`
// (adapters/current.mjs + adapters/current.B-build.mjs); the rebuild adapter offers the same names.
import {group, open, TEAM, BOX, expect, sleep} from './harness.mjs';
const t = group('B-build');
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const has = (tx, re, what) => expect(re instanceof RegExp ? re.test(tx) : tx.includes(re), `${what || 'text'} missing ${re}: «${tx.slice(0, 400)}»`);
const not = (tx, re, what) => expect(!(re instanceof RegExp ? re.test(tx) : tx.includes(re)), `${what || 'text'} should not show ${re}: «${tx.slice(0, 400)}»`);
const SCORE_BAND = /Strength Score \d+ (Top tier|Tournament ready|Solid|Needs work|Missing a basic)/;

// =====================================================================================================
// 0. Shared behaviour
// =====================================================================================================
t('X-01', 'Back steps through pages to the old scroll spot; reload reopens the last page', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.scrollPageTo(700); await sleep(300); const y0 = await ui.pageScrollY(); expect(y0 > 300, 'could not scroll Build');
  await ui.go('All Suggestions'); expect(await ui.current() === 'coverage', 'All suggestions did not open');
  await ui.back(); expect(await ui.current() === 'auto', 'Back did not return to Build: ' + await ui.current());
  const y1 = await ui.pageScrollY(); expect(Math.abs(y1 - y0) < 120, `Back did not restore the scroll spot (${y0} → ${y1})`);
  await ui.reload(); expect(await ui.current() === 'auto', 'reload did not reopen Build: ' + await ui.current()); await close(); });

t('X-02', 'Changes that replace team members show a toast with Undo; Undo brings the old six back', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.coreTap('Add to my team'); const tt = await ui.waitForToast(/^Added/);
  expect(await ui.toastHasUndo(), 'toast has no Undo: ' + tt); expect(!same(await ui.team(), TEAM), 'team did not change');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not restore the six: ' + await ui.team());
  await ui.waitForToast('Change undone'); await close(); });

t('X-03', 'A quick double tap on Apply makes only one change (one Undo step)', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions();
  await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-plan]')].find(e => e.getClientRects().length); b.click(); b.click(); });
  await ui.waitForToast(/^Applied/); const after = await ui.team(); expect(!same(after, TEAM), 'Apply did nothing');
  await ui.undoLastApplied(); expect(same(await ui.team(), TEAM), 'one Undo step did not restore the six: a double tap applied twice? ' + await ui.team()); await close(); });

t('X-04', 'Two/three-choice switches are sliders: the circle slides to the new choice, buttons stay readable', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team');
  expect(await ui.megasSliderPos() === 2, 'Megas slider not at 2: ' + await ui.megasSliderPos()); expect(await ui.sliderHasIcons() >= 3, 'slider has no icons');
  await ui.setMegas(1); expect(await ui.megasSliderPos() === 1, 'circle did not slide to 1');
  const b = await ui.megasButtons(); expect(b.length === 3 && b.map(x => x.pressed).join() === 'false,true,false', 'buttons not three pressed/unpressed: ' + JSON.stringify(b)); await close(); });

t('X-05', 'The × in a Pokémon box empties it and keeps the keyboard up', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('With a Pokémon', 'gar'); expect(await ui.clearShown('With a Pokémon'), '× not shown after typing');
  await ui.tapClear('With a Pokémon'); expect(await ui.boxValue('With a Pokémon') === '', 'box not emptied');
  expect(await ui.boxFocused('With a Pokémon'), 'box lost focus after ×'); await close(); });

t('X-06', 'Pokémon name boxes: type part of a name, Enter picks; no match says so; Esc closes the list', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('favourite Pokémon', 'zzqx'); await ui.waitSee('No matches. Try fewer letters.');
  await ui.typeInto('favourite Pokémon', 'farig'); has(await ui.nameList(), 'Farigiraf', 'name list');
  await pg.keyboard.press('Escape'); await sleep(300); expect(!(await ui.nameList()), 'Esc did not close the list');
  expect(await ui.current() === 'auto', 'Esc closed more than the list');
  await ui.typeInto('favourite Pokémon', 'farig'); await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('Enter'); await sleep(500);
  has(await ui.buildAroundChip(), 'Farigiraf', 'Build around chip'); await close(); });

t('X-07', 'Phone: focusing Build around lifts the box into the upper screen so its list has room', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX, width: 390, height: 760}); await ui.go('Build');
  await ui.focusBox('favourite Pokémon'); const top = await ui.boxTop('favourite Pokémon');
  expect(top != null && top >= 0 && top < 760 * 0.5, 'Build around box not lifted into the upper half: top ' + top); await close(); });

t('X-08', 'Headings and slider labels are in Title Case', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  has(await ui.text(), /Build Me a Team/, 'Build heading'); has(await ui.text(), /Build Around a Core/, 'cores heading');
  await ui.go('All Suggestions'); await ui.waitSwaps(); has(await ui.text(), /One Pokémon In, One Out/, 'swap heading'); await close(); });

t('X-09', 'Page opens and button taps are counted anonymously (counts only, no team data)', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Most used$/);
  const c = await ui.usageCounts(); expect(c, 'nothing counted');
  expect(c['view:auto'] >= 1, 'Build page open not counted: ' + JSON.stringify(c)); expect(Object.keys(c).some(k => k.startsWith('btn:')), 'button tap not counted');
  not(JSON.stringify(c), /Garchomp|Incineroar/, 'usage counts'); await close(); });

t('X-10', 'Tapping a built-team tile opens that Pokémon\'s info sheet', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.buildMeATeam();
  const tile = await ui.builtTileLabel(0); await ui.tapBuiltTile(0); await sleep(600);
  const sh = await ui.infoSheetText(); expect(sh, 'info sheet did not open'); has(sh, tile.split(' ').slice(-1)[0], 'info sheet'); await close(); });

t('X-11', 'Pages draw from the daily data (cores, archetype counts, sets numbers)', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  has(await ui.coresText(), /From [\d,]+ tournament teams\. Average team wins [\d.]+% of games\./, 'cores intro');
  await ui.go('Archetypes'); has(await ui.text(), /From the latest \d+ top tournament teams\./, 'archetype share line');
  await ui.go('Popular Sets'); has(await ui.text(), /\d+(\.\d)?%/, 'sets numbers'); not(await ui.text(), 'No data loaded yet', 'sets'); await close(); });

t('X-12', 'Settings and team are saved: Megas on team 1 survives a reload (account and this browser)', async () => {
  for (const account of [true, false]) { const {ui, acct, ls, close} = await open({team: TEAM, box: BOX, account});
    await ui.go('Build'); await ui.setMegas(1); await sleep(1200);
    const saved = account ? await acct() : await ls('cc2.state'); expect(saved && saved.megaGoal === 1, `Megas not saved (${account ? 'account' : 'browser'}): ` + (saved && saved.megaGoal));
    if (!account) { await ui.reload(); await ui.go('Build'); expect(await ui.megasShown() === 1, 'Megas not 1 after reload'); }
    await close(); } });

// =====================================================================================================
// 2. Build for Me
// =====================================================================================================
t('AUTO-01', 'Build page head and the How It Works fold', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const tx = await ui.text();
  has(tx, /Build\W{1,3}real winning teams/i, 'kicker'); has(tx, 'Build Me a Team'); has(tx, 'Winning tournament teams you can field from your box.');
  expect(await ui.isUnfolded(/^How It Works/) === false, 'How it works should start closed');
  const f = await ui.unfold(/^How It Works/); for (const p of ['Six that work together', 'The why', 'Ready for the top threats']) has(f, new RegExp(p, 'i'), 'How it works');
  await close(); });

t('AUTO-02', 'Build from My box / Whole roster: box count, switching rebuilds, choice is remembered', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  has(await ui.boxCountLine(), '10 in your box'); has(await ui.text(), 'quick build, anything legal');
  const boxed = await ui.buildMeATeam(); has(boxed, SCORE_BAND, 'box build');
  const sr = await ui.unfold(/^Sets and Roles/i); expect((sr.match(/\b(Box|To catch)\b/gi) || []).length >= 6, 'every built Pokémon should say Box or To catch: ' + sr);
  await ui.tap(/^Whole roster/); await ui.until(async () => (await ui.buildResult()) !== boxed && /Strength Score/.test(await ui.buildResult()), 30000, 'rebuild on switch');
  expect(await ui.pressed(/^Whole roster/), 'Whole roster not selected');
  await ui.reload(); await ui.go('Build'); expect(await ui.pressed(/^Whole roster/), 'Whole roster not remembered after reload'); await close(); });

t('AUTO-03', 'Pool rules: a tiny box says how many are usable; Never-suggest Pokémon are never built in', async () => {
  { const {ui, close} = await open({team: TEAM, box: ['Garchomp', 'Incineroar']}); await ui.go('Build');
    const r = await ui.buildMeATeam(); has(r, /Only \d+ usable Pokémon in your box for doubles\. Add more in My box, or switch to Whole roster\./, 'tiny box note'); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); await ui.unfold(/^Bigger Plans/i); await ui.unfold(/^Plan Settings/i);
    await ui.neverSuggest('Kingamb'); await ui.go('Build'); await ui.tap(/^Whole roster/);
    await ui.buildMeATeam(); const n = await ui.waitOptions(); for (let i = 0; i < n; i++) { const six = await ui.builtSix(); expect(!six.includes('Kingambit'), `option ${i + 1} uses never-suggest Kingambit`); if (n > 1) await ui.tryAnother(); }
    await close(); } });

t('AUTO-04', 'Megas on team: 0 rebuilds a no-Mega team with the warning toast; one value shared on all pages', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/); await ui.buildMeATeam();
  expect((await ui.builtSix()).some(n => /-Mega/.test(n)), 'Megas 2 build has no Mega');
  await ui.setMegas(0); await ui.waitForToast(/Teams without Megas: rare \(about 1 in 100 tournament teams\), and they win about a third of their games/);
  await ui.until(async () => { const s = await ui.builtSix(); return s.length === 6 && !s.some(n => /-Mega/.test(n)); }, 30000, 'a no-Mega team');
  await ui.setMegas(1); await ui.waitForToast('Teams aim for 1 Mega');
  await ui.go('My Team'); expect(await ui.megasShown() === 1, 'My team Megas not 1');
  await ui.go('All Suggestions'); expect(await ui.megasShown() === 1, 'All suggestions Megas not 1');
  await ui.unfold(/^Bigger Plans/i); await ui.unfold(/^Plan Settings/i); expect(await ui.pressed('1', '#plset') === true, 'Plan settings Megas not 1'); await close(); });

t('AUTO-05', 'Build around a Pokémon: chip, button label, every option has it, × clears, not saved', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/);
  await ui.buildAround('farig'); has(await ui.buildAroundChip(), 'Farigiraf', 'chip'); has((await ui.buildButton()).label, 'Build around Farigiraf', 'main button');
  await ui.buildMeATeam(); const n = await ui.waitOptions();
  for (let i = 0; i < n; i++) { expect((await ui.builtSix()).includes('Farigiraf'), `option ${i + 1} has no Farigiraf`); if (n > 1) await ui.tryAnother(); }
  await ui.clearBuildAround(); expect(!(await ui.buildAroundChip()), 'chip still there'); not(await ui.buildResult(), /Strength Score/, 'results after clearing the pick');
  expect(await ui.boxFocused('favourite Pokémon'), 'box not focused after ×');
  await ui.buildAround('farig'); await ui.reload(); await ui.go('Build'); expect(!(await ui.buildAroundChip()), 'Build-around pick was saved (should not be)'); await close(); });

t('AUTO-06', '"Build around it" on an info sheet opens Build with the pick, Whole roster, and builds', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Ratings');
  await ui.openInfoSheetFor('Farigiraf'); await ui.tap(/^Build around it/, '#lairSheet', 600);
  expect(await ui.current() === 'auto', 'did not open Build'); has(await ui.buildAroundChip(), 'Farigiraf', 'chip');
  expect(await ui.pressed(/^Whole roster/), 'Whole roster not chosen for a Pokémon outside the box');
  await ui.until(async () => (await ui.builtSix()).includes('Farigiraf'), 40000, 'a team with Farigiraf'); await close(); });

t('AUTO-07', 'Build me a team: busy state with the spinner line, then a team card', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/);
  expect((await ui.buildButton()).primary, 'Build button should be the main (yellow) button before results');
  await ui.tapBuild(); const b = await ui.buildButton(); expect(b.busy && b.disabled, 'button not busy/disabled while building: ' + JSON.stringify(b));
  has(await ui.buildResult(), 'Building your teams… checking each against the top 30 threats.', 'spinner line');
  await ui.until(async () => /Strength Score/.test(await ui.buildResult()), 20000, 'team card');
  const a = await ui.buildButton(); expect(!a.disabled && !a.busy && !a.primary, 'after results the Build button should be enabled and no longer the main button: ' + JSON.stringify(a));
  has(await ui.buildResult(), /Use this team/, 'Use this team'); await close(); });

t('AUTO-08', 'Result card: kicker, title, option count, Strength Score + band + rank, six tiles with items, readiness, checks, why, Sets and roles', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/); await ui.buildMeATeam(); const r = await ui.buildResult();
  has(r, /^(Proven team(, 1 swap)?|Fresh take|Your build)\b/, 'kicker'); has(r, /Option 1 of \d/, 'option count'); has(r, SCORE_BAND, 'score');
  has(r, /(Top|Bottom) \d+% of tournament teams/, 'rank line'); expect((await ui.builtSix()).length === 6, 'not six tiles');
  has(r, /\d+\/30 ready for top threats/, 'readiness'); has(r, /\d\/4 team checks/, 'checks'); not(r, /team checks\W+checks/, 'checks line (stray "checks")');
  has(r, /(players brought this exact team|tournament teams, [\d.]+% wins)/, 'why bullets'); has(r, /ready for the top 30 threats: handles \d+/, 'readiness why');
  has(r, /Mega option/, 'Mega options chip');
  const sr = await ui.unfold(/^Sets and Roles/i); expect((sr.match(/ @ /g) || []).length === 6, 'Sets and roles should list six "name @ item" rows: ' + sr);
  has(sr, /(Tailwind|Trick Room|Fake Out|Redirect|Priority|Setup|Attacker|Sun|Rain|Sand|Snow)/, 'roles'); has(sr, /[SABCD] tier \d+/, 'rating tags'); await close(); });

t('AUTO-09', 'Proven teams lead; a Fresh take slides in as option 2', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/); await ui.buildMeATeam();
  has(await ui.buildResult(), /^Proven team/, 'first option'); const n = await ui.waitOptions(4); expect(n >= 2, 'no second option');
  await ui.tryAnother(); has(await ui.buildResult(), /^Fresh take/, 'option 2 kicker');
  has(await ui.buildResult(), /A fresh take: built on raw power and fit instead of popularity, with at most 2 meta staples\. Fewer people will have prepared for it\./, 'fresh take line');
  // options differ by 3+ Pokémon
  await ui.tryAnother(); const o3 = await ui.builtSix(); await ui.tryAnother(); if (n > 3) await ui.tryAnother(); const o1 = await ui.builtSix();
  expect(o1.filter(x => !o3.includes(x)).length >= 3, 'options 1 and 3 differ by fewer than 3 Pokémon'); await close(); });

t('AUTO-10', 'Use this team: your six become the built six, My team opens, toast with Undo', async () => {
  const {ui, acct, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/); await ui.buildMeATeam();
  const six = await ui.builtSix(); await ui.useThisTeam(); expect(await ui.current() === 'report', 'My team did not open');
  expect(same(await ui.team(), six), 'team is not the built six: ' + await ui.team());
  const tt = await ui.waitForToast('Using the built team'); expect(tt.startsWith('Using the built team. Suggestions and the game plan now describe it.'), 'toast wording: ' + tt);
  await sleep(800); expect(same((await acct()).slots.map(s => s.n).filter(Boolean), six), 'built six not saved to the account');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not restore the old six'); await close(); });

t('AUTO-11', 'Save the built team: toast, "Already saved", listed in Saved teams; disabled at 10', async () => {
  { const {ui, acct, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/); await ui.buildMeATeam();
    await ui.saveBuiltTeam(); const tt = await ui.waitForToast(/^Saved "/); const name = tt.match(/"(.+)"/)[1];
    await ui.saveBuiltTeam(); await ui.waitForToast(/^Already saved as "/);
    await sleep(800); const a = await acct(); expect(a.teams.length === 1, 'not exactly one saved team in the account: ' + a.teams.length);
    await ui.go('Saved Teams'); has(await ui.text(), name.split(/[,·]/)[0].trim(), 'Saved teams page'); await close(); }
  { const saved = Array.from({length: 10}, (_, i) => ({name: 'T' + i, team: TEAM})); const {ui, close} = await open({team: TEAM, box: BOX, saved});
    await ui.go('Build'); await ui.buildMeATeam(); const s = await ui.builtSaveButton(); expect(s.disabled && /10 saved teams already/.test(s.title), 'Save not disabled at 10: ' + JSON.stringify(s)); await close(); } });

t('AUTO-12', 'Try another cycles the options and wraps; hidden with a single option', async () => {
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/); await ui.buildMeATeam(); const n = await ui.waitOptions(4);
    for (let i = 2; i <= n; i++) { await ui.tryAnother(); has(await ui.buildResult(), `Option ${i} of ${n}`, 'Try another'); }
    await ui.tryAnother(); has(await ui.buildResult(), `Option 1 of ${n}`, 'wrap after the last'); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const r = await ui.buildMeATeam();
    if (!/Option \d+ of/.test(r)) not(r, /Try another/, 'single option'); else has(r, /Try another/, 'several options'); await close(); } });

t('AUTO-13', 'Copy for Showdown copies the built six as Showdown text', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/); await ui.buildMeATeam();
  const tx = await ui.copyForShowdown('#abOut'); const blocks = tx.trim().split(/\n\s*\n/);
  expect(blocks.length === 6, 'not six Pokémon in the copy: ' + blocks.length); for (const b of blocks) { has(b, /Ability: /, 'block'); expect((b.match(/^- /gm) || []).length === 4, 'block without 4 moves: ' + b); }
  await ui.waitForToast(/Copied/); await close(); });

t('AUTO-14', 'No-result notes (tiny box, no Mega-capable box) with no "Doubles" label', async () => {
  { const {ui, close} = await open({team: TEAM, box: ['Garchomp', 'Incineroar']}); await ui.go('Build'); const r = await ui.buildMeATeam();
    has(r, /^Only \d+ usable Pokémon in your box for doubles/, 'tiny box (no label before it)'); await close(); }
  { const {ui, close} = await open({team: TEAM, box: ['Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler', 'Kingambit', 'Basculegion', 'Archaludon', 'Farigiraf']}); await ui.go('Build'); const r = await ui.buildMeATeam();
    has(r, /^No strong team with exactly 2 Megas from this pool\. Add Mega-capable Pokémon to your box, switch to Whole roster, or change Megas on team\./, 'no-Mega box'); await close(); } });

t('AUTO-15', 'Start from a recent winner: three cards; Sets; Load team needs a second tap; Practice against; Compare', async () => {
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
    const f = await ui.unfold(/^Start from a Recent Winner/i); has(f, /3 winning teams, full sets, ready to load/, 'fold heading');
    expect((f.match(/Load team/g) || []).length === 3, 'not three winner cards: ' + f.slice(0, 300));
    const want = await ui.winnerSix(0); expect(want.length === 6, 'winner card does not show six: ' + want);
    await ui.tap(/^Sets$/, '[data-pane=auto]'); await sleep(300); has(await ui.text(), /Hide sets/, 'Sets toggle'); has(await ui.text(), /Protect|Fake Out/, 'moves listed');
    await ui.tap(/^Load team/, '[data-pane=auto]'); has(await ui.text(), 'Tap again to replace your team', 'first tap');
    await ui.tap(/Tap again to replace your team/, '[data-pane=auto]', 900); const tt = await ui.waitForToast(/team loaded with its moves and items/);
    expect(await ui.toastHasUndo(), 'no Undo: ' + tt); expect(await ui.current() === 'report', 'My team did not open'); expect(same(await ui.team(), want), 'team is not the winner six');
    const s0 = await ui.slotSet(0); expect(s0.it && s0.it.doubles && s0.mv && s0.mv.doubles && s0.mv.doubles.length === 4, 'player items/moves not loaded: ' + JSON.stringify(s0)); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.unfold(/^Start from a Recent Winner/i);
    await ui.tap(/^Practice against/, '[data-pane=auto]', 800); expect(await ui.current() === 'matchup', 'Battle did not open'); await ui.waitForToast(/Opponent set|as the opponent|as your opponent/);
    await ui.go('Build'); await ui.unfold(/^Start from a Recent Winner/i); await ui.tap(/^Compare/, '[data-pane=auto]', 800); expect(await ui.current() === 'compare', 'Compare did not open: ' + await ui.current()); await close(); } });

t('AUTO-16', 'Build page order: Build me a team, How it works, Build around a core, Start from a recent winner (kept after a build)', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  const at = tx => ['Build Me a Team', 'How It Works', 'Build Around a Core', 'Start from a Recent Winner'].map(s => tx.indexOf(s));
  const p = at(await ui.text()); expect(p.every(i => i >= 0) && p.every((v, i) => !i || v > p[i - 1]), 'order wrong: ' + p);
  await ui.buildMeATeam(); has(await ui.text(), 'Build Around a Core', 'cores after a build'); await close(); });

// =====================================================================================================
// 3. Cores
// =====================================================================================================
t('CORES-01', 'Cores head, intro line with team count and ranking, and the ? explanation', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const c = await ui.coresText();
  has(c, 'Pick a pair or trio that wins, then fill the rest'); has(c, 'Build Around a Core');
  has(c, /From [\d,]+ tournament teams\. Average team wins [\d.]+% of games\. Ranked by win rate, pulled toward the average\./, 'intro');
  await ui.tap('?', '#cores'); has(await ui.openTipText(), /A core is a group of Pokémon/, 'cores ? explanation'); await close(); });

t('CORES-02', 'Kind switch: Pairs, Trios, Full teams (not saved)', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  expect((await ui.coreMembers(0)).length === 2, 'Pairs default not two');
  await ui.tap(/^Trios$/, '#cores'); expect((await ui.coreMembers(0)).length === 3, 'Trios row not three'); has(await ui.coresText(), /\+ .+ \+ .+ [\d.]+% wins/, 'trio row');
  await ui.tap(/^Full teams$/, '#cores'); expect((await ui.coreMembers(0)).length === 6, 'Full teams row not six'); has(await ui.coresText(), /Load team/, 'full teams button');
  await ui.reload(); await ui.go('Build'); expect(await ui.pressed(/^Pairs$/, '#cores'), 'kind should reset to Pairs on reload'); await close(); });

t('CORES-03', 'Sort: Most used changes the ranking line and order', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const first = await ui.coreMembers(0);
  await ui.tap(/^Most used$/, '#cores'); has(await ui.coresText(), 'Ranked by how many teams used it.', 'intro'); expect(!same(await ui.coreMembers(0), first), 'order did not change');
  await ui.tap(/^Top rated$/, '#cores'); has(await ui.coresText(), 'Ranked by win rate, pulled toward the average.', 'intro'); await close(); });

t('CORES-04', 'Filter by a Pokémon: chip, only cores with it, × clears', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('With a Pokémon', 'incin'); await pg.keyboard.press('Enter'); await sleep(600);
  has(await ui.coresText(), /Incineroar ×|Incineroar/, 'chip'); const n = await ui.coreRowCount(); expect(n > 0, 'no cores');
  for (let i = 0; i < n; i++) expect((await ui.coreMembers(i)).some(m => m.startsWith('Incineroar')), `core ${i + 1} has no Incineroar`);
  await ui.clearCoreFilter(); expect((await ui.coreMembers(0)).join() !== '' && !(await ui.coreFilterChip()), 'filter not cleared'); await close(); });

t('CORES-05', 'Core rows: rank, names, tags, % wins; Details shows points vs avg, teams, % of all teams; top 3 then a fold', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const c = await ui.coresText();
  has(c, /1 .+ \+ .+ [\d.]+% wins/, 'row 1'); has(c, /More Cores #4 to #\d+/, 'fold for #4 onward');
  await ui.tap(/^Details$/, '#cores'); const d = await ui.coresText();
  has(d, /[+−-][\d.]+ points vs avg/, 'vs avg'); has(d, /[\d,]+ teams/, 'team count'); has(d, /points together/, 'together'); has(d, /% of all teams/, 'share'); has(d, /Hide details/, 'Hide details');
  await ui.tap(/^Hide details$/, '#cores'); not(await ui.coresText(), /Hide details/, 'after Hide details'); await close(); });

t('CORES-06', 'Show more adds 15 rows', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.unfold(/^More Cores/i, '#cores');
  const n0 = await ui.coreRowCount(); expect(n0 === 10, 'expected 10 rows at start, got ' + n0);
  await ui.tap(/^Show more/, '#cores', 600); expect(await ui.coreRowCount() === 25, 'Show more did not add 15: ' + await ui.coreRowCount()); await close(); });

t('CORES-07', 'Add to my team puts the core on a full team, opens My team, toast with what left, Undo', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const core = await ui.coreMembers(0);
  await ui.coreTap('Add to my team'); expect(await ui.current() === 'report', 'My team did not open');
  const tm = await ui.team(); expect(core.every(c => tm.includes(c)) && tm.length === 6, 'core not on the team: ' + tm);
  expect(tm[0] === core[0] || core.includes(tm[0]), 'core not put first: ' + tm);
  const tt = await ui.waitForToast(/^Added/); has(tt, /removed .+/, 'toast'); has(tt, /Megas? on the team now/, 'toast Mega count');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not restore'); await close(); });

t('CORES-08', 'Full teams › Load team replaces the six (no confirm), opens My team, toast with Undo', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Full teams$/, '#cores'); const six = await ui.coreMembers(0);
  await ui.coreTap('Load team'); expect(await ui.current() === 'report', 'My team did not open (a confirm step?)'); expect(same(await ui.team(), six), 'team not replaced');
  await ui.waitForToast(/team loaded with its moves and items|Loaded the team \(your old team is one tap away: Undo\)/); expect(await ui.toastHasUndo(), 'no Undo');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not restore'); await close(); });

t('CORES-09', 'Teams with it opens Winning teams filtered by the core', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.typeInto('With a Pokémon', 'incin'); await ui.pg.keyboard.press('Enter'); await sleep(500);
  await ui.coreTap('Teams with it'); expect(await ui.current() === 'top', 'Winning teams did not open: ' + await ui.current());
  has(await ui.text(), /Incineroar ×/, 'filter chip'); has(await ui.text(), /Clear/, 'Clear'); await close(); });

t('CORES-10', 'Practice against (full teams) sets the Battle opponent', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Full teams$/, '#cores'); const six = await ui.coreMembers(0);
  await ui.coreTap('Practice against'); expect(await ui.current() === 'matchup', 'Battle did not open'); await ui.waitForToast('Loaded as your opponent');
  expect(same((await ui.opponents()).filter(Boolean), six), 'opponent six not set'); await close(); });

t('CORES-11', 'Copy for Showdown (full teams) gives six blocks', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Full teams$/, '#cores');
  const tx = await ui.copyForShowdown('#cores'); expect(tx.trim().split(/\n\s*\n/).length === 6, 'not six blocks'); await close(); });

t('CORES-12', 'Empty state: a filter with no cores says so', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('With a Pokémon', 'Wailord'); await pg.keyboard.press('Enter'); await sleep(600);
  has(await ui.coresText(), 'No cores match. Try another Pokémon.', 'empty note'); await close(); });

t('CORES-13', 'Menu › Build around a core opens Build scrolled to the cores', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Home'); await ui.go('cores', 900);
  expect(await ui.current() === 'auto', 'Build did not open'); const top = await ui.coresTopOnScreen(); expect(top != null && top > -60 && top < 260, 'cores not at the top of the screen: ' + top); await close(); });
