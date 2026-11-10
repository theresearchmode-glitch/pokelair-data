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
t('X-01', 'Back steps through pages and lands at the old scroll spot', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.scrollPageTo(700); await sleep(300); const y0 = await ui.pageScrollY(); expect(y0 > 300, 'could not scroll Build');
  await ui.go('All Suggestions'); expect(await ui.current() === 'coverage', 'All suggestions did not open');
  await ui.back(); expect(await ui.current() === 'auto', 'Back did not return to Build: ' + await ui.current());
  const y1 = await ui.pageScrollY(); expect(Math.abs(y1 - y0) < 120, `Back did not restore the scroll spot (${y0} → ${y1})`);
  // (inventory also says "reload → same page opens"; today the site always opens on Home: cc2.view is written, never read. Not asserted; reported.)
  await close(); });

t('X-02', 'Changes that replace team members show a toast with Undo; Undo brings the old six back', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.coreTap('Add to my team'); const tt = await ui.waitForToast(/^Added/);
  expect(await ui.toastOffersUndo(), 'toast has no Undo: ' + tt); expect(!same(await ui.team(), TEAM), 'team did not change');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not restore the six: ' + await ui.team());
  await ui.waitForToast('Change undone'); await close(); });

t('X-03', 'A quick double tap on Apply makes only one change (one Undo step)', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions();
  await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-plan]')].find(e => e.getClientRects().length); b.click(); b.click(); });
  await ui.waitForToast(/^Applied/); const after = await ui.team(); expect(!same(after, TEAM), 'Apply did nothing');
  await ui.until(async () => /^Applied/.test(await ui.undoBarText()), 15000, 'the Undo bar'); await sleep(600); await ui.undoLastApplied();
  await ui.until(async () => same(await ui.team(), TEAM), 5000, 'undo').catch(() => {}); expect(same(await ui.team(), TEAM), 'one Undo step did not restore the six: a double tap applied twice? ' + await ui.team()); await close(); });

t('X-04', 'Two/three-choice switches are sliders: the circle slides to the new choice, buttons stay readable', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team');
  expect(await ui.megasSliderPos() === 2, 'Megas slider not at 2: ' + await ui.megasSliderPos()); expect(await ui.sliderHasIcons() >= 3, 'slider has no icons');
  await ui.setMegas(1); expect(await ui.megasSliderPos() === 1, 'circle did not slide to 1');
  const b = await ui.megasButtons(); expect(b.length === 3 && b.map(x => x.pressed).join() === 'false,true,false', 'buttons not three pressed/unpressed: ' + JSON.stringify(b)); await close(); });

t('X-05', 'The × in a Pokémon box empties it and keeps the keyboard up', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('With a Pokémon', 'gar'); expect(await ui.clearButtonShown('With a Pokémon'), '× not shown after typing');
  await ui.tapClear('With a Pokémon'); expect(await ui.boxValue('With a Pokémon') === '', 'box not emptied');
  expect(await ui.boxFocused('With a Pokémon'), 'box lost focus after ×'); await close(); });

t('X-06', 'Pokémon name boxes: type part of a name, Enter picks; no match says so; Esc closes the list', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('favourite Pokémon', 'zzqx'); await ui.waitSee('No matches. Try fewer letters.');
  await ui.typeInto('favourite Pokémon', 'farig'); has(await ui.nameList(), 'Farigiraf', 'name list');
  await pg.keyboard.press('Escape'); await sleep(300); expect(!(await ui.nameList()), 'Esc did not close the list');
  expect(await ui.current() === 'auto', 'Esc closed more than the list');
  await ui.typeInto('favourite Pokémon', 'farig'); await pg.keyboard.press('Enter'); await sleep(500);
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
    if (!account) { await ui.reloadAsSamePlayer(); await ui.go('Build'); expect(await ui.megasShown() === 1, 'Megas not 1 after reload'); }
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
  await ui.reloadAsSamePlayer(); await ui.go('Build'); expect(await ui.pressed(/^Whole roster/), 'Whole roster not remembered after reload'); await close(); });

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
  await ui.unfold(/^Bigger Plans/i); await ui.unfold(/^Plan Settings/i); expect(await ui.pressed('1', ui.area('Plan settings')) === true, 'Plan settings Megas not 1'); await close(); });

t('AUTO-05', 'Build around a Pokémon: chip, button label, every option has it, × clears, not saved', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Whole roster/);
  await ui.buildAround('farig'); has(await ui.buildAroundChip(), 'Farigiraf', 'chip'); has((await ui.buildButton()).label, 'Build around Farigiraf', 'main button');
  await ui.buildMeATeam(); const n = await ui.waitOptions();
  for (let i = 0; i < n; i++) { expect((await ui.builtSix()).includes('Farigiraf'), `option ${i + 1} has no Farigiraf`); if (n > 1) await ui.tryAnother(); }
  await ui.clearBuildAround(); expect(!(await ui.buildAroundChip()), 'chip still there'); not(await ui.buildResult(), /Strength Score/, 'results after clearing the pick');
  expect(await ui.boxFocused('favourite Pokémon'), 'box not focused after ×');
  await ui.buildAround('farig'); await ui.reloadAsSamePlayer(); await ui.go('Build'); expect(!(await ui.buildAroundChip()), 'Build-around pick was saved (should not be)'); await close(); });

t('AUTO-06', '"Build around it" on an info sheet opens Build with the pick, Whole roster, and builds', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Ratings');
  await ui.openInfoSheetFor('Farigiraf'); await ui.tap(/^Build around it/, ui.area('info sheet'), 600);
  expect(await ui.current() === 'auto', 'did not open Build'); has(await ui.buildAroundChip(), 'Farigiraf', 'chip');
  await ui.until(async () => (await ui.builtSix()).includes('Farigiraf'), 40000, 'a team with Farigiraf');
  expect(await ui.pressed(/^Whole roster/), 'Whole roster not chosen for a Pokémon outside the box'); await close(); });

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
  const tx = await ui.copyForShowdown(ui.area('built team')); const blocks = tx.trim().split(/\n\s*\n/);
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
    await ui.tap(/^Sets$/, ui.area('Build page')); await sleep(300); has(await ui.text(), /Hide sets/, 'Sets toggle'); has(await ui.text(), /Protect|Fake Out/, 'moves listed');
    await ui.tap(/^Load team/, ui.area('Build page'), 700); has(await ui.text(), 'Tap again to replace your team', 'first tap');
    await ui.tap(/Tap again to replace your team/, ui.area('Build page'), 900); const tt = await ui.waitForToast(/team loaded with its moves and items/);
    expect(await ui.toastOffersUndo(), 'no Undo: ' + tt); expect(await ui.current() === 'report', 'My team did not open'); expect(same(await ui.teamNames(), want), 'team is not the winner six: ' + await ui.teamNames() + ' vs ' + want);
    const s0 = await ui.slotSet(0); expect(s0.it && s0.it.doubles && s0.mv && s0.mv.doubles && s0.mv.doubles.length === 4, 'player items/moves not loaded: ' + JSON.stringify(s0)); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.unfold(/^Start from a Recent Winner/i);
    await ui.tap(/^Practice against/, ui.area('Build page'), 800); expect(await ui.current() === 'matchup', 'Battle did not open'); await ui.waitForToast(/Opponent set|as the opponent|as your opponent/);
    await ui.go('Build'); await ui.unfold(/^Start from a Recent Winner/i); await ui.tap(/^Compare/, ui.area('Build page'), 800); expect(await ui.current() === 'compare', 'Compare did not open: ' + await ui.current()); await close(); } });

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
  await ui.tap('?', ui.area('cores')); has(await ui.openTipText(), /A core is a group of Pokémon/, 'cores ? explanation'); await close(); });

t('CORES-02', 'Kind switch: Pairs, Trios, Full teams (not saved)', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  expect((await ui.coreMembers(0)).length === 2, 'Pairs default not two');
  await ui.tap(/^Trios$/, ui.area('cores')); expect((await ui.coreMembers(0)).length === 3, 'Trios row not three'); has(await ui.coresText(), /\+ .+ \+ .+ [\d.]+% wins/, 'trio row');
  await ui.tap(/^Full teams$/, ui.area('cores')); expect((await ui.coreMembers(0)).length === 6, 'Full teams row not six'); has(await ui.coresText(), /Load team/, 'full teams button');
  await ui.reloadAsSamePlayer(); await ui.go('Build'); expect(await ui.pressed(/^Pairs$/, ui.area('cores')), 'kind should reset to Pairs on reload'); await close(); });

t('CORES-03', 'Sort: Most used changes the ranking line and order', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const first = await ui.coreMembers(0);
  await ui.tap(/^Most used$/, ui.area('cores')); has(await ui.coresText(), 'Ranked by how many teams used it.', 'intro'); expect(!same(await ui.coreMembers(0), first), 'order did not change');
  await ui.tap(/^Top rated$/, ui.area('cores')); has(await ui.coresText(), 'Ranked by win rate, pulled toward the average.', 'intro'); await close(); });

t('CORES-04', 'Filter by a Pokémon: chip, only cores with it, × clears', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('With a Pokémon', 'incin'); await pg.keyboard.press('Enter'); await sleep(600);
  has(await ui.coresText(), /Incineroar ×|Incineroar/, 'chip'); const n = await ui.coreRowCount(); expect(n > 0, 'no cores');
  for (let i = 0; i < n; i++) expect((await ui.coreMembers(i)).some(m => m.startsWith('Incineroar')), `core ${i + 1} has no Incineroar`);
  await ui.clearCoreFilter(); expect((await ui.coreMembers(0)).join() !== '' && !(await ui.coreFilterChip()), 'filter not cleared'); await close(); });

t('CORES-05', 'Core rows: rank, names, tags, % wins; Details shows points vs avg, teams, % of all teams; top 3 then a fold', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const c = await ui.coresText();
  has(c, /1 .+ \+ .+ [\d.]+% wins/, 'row 1'); has(c, /More Cores #4 to #\d+/, 'fold for #4 onward');
  await ui.tap(/^Details$/, ui.area('cores')); const d = await ui.coresText();
  has(d, /[+−-][\d.]+ points vs avg/, 'vs avg'); has(d, /[\d,]+ teams/, 'team count'); has(d, /points together/, 'together'); has(d, /% of all teams/, 'share'); has(d, /Hide details/, 'Hide details');
  await ui.tap(/^Hide details$/, ui.area('cores')); not(await ui.coresText(), /Hide details/, 'after Hide details'); await close(); });

t('CORES-06', 'Show more adds 15 rows', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.unfold(/^More Cores/i, ui.area('cores'));
  const n0 = await ui.coreRowCount(); expect(n0 === 10, 'expected 10 rows at start, got ' + n0);
  await ui.tap(/^Show more/, ui.area('cores'), 600); expect(await ui.coreRowCount() === 25, 'Show more did not add 15: ' + await ui.coreRowCount()); await close(); });

t('CORES-07', 'Add to my team puts the core on a full team, opens My team, toast with what left, Undo', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); const core = await ui.coreMembers(0);
  await ui.coreTap('Add to my team'); expect(await ui.current() === 'report', 'My team did not open');
  const tm = await ui.team(); expect(core.every(c => tm.includes(c)) && tm.length === 6, 'core not on the team: ' + tm);
  expect(tm[0] === core[0] || core.includes(tm[0]), 'core not put first: ' + tm);
  const tt = await ui.waitForToast(/^Added/); has(tt, /removed .+/, 'toast');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not restore'); await close(); });

t('CORES-08', 'Full teams › Load team replaces the six (no confirm), opens My team, toast with Undo', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Full teams$/, ui.area('cores')); const six = await ui.coreMembers(0);
  await ui.coreTap('Load team'); expect(await ui.current() === 'report', 'My team did not open (a confirm step?)'); expect(same(await ui.team(), six), 'team not replaced');
  await ui.waitForToast(/team loaded with its moves and items|Loaded the team \(your old team is one tap away: Undo\)/); expect(await ui.toastOffersUndo(), 'no Undo');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not restore'); await close(); });

t('CORES-09', 'Teams with it opens Winning teams filtered by the core', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.typeInto('With a Pokémon', 'incin'); await ui.pg.keyboard.press('Enter'); await sleep(500);
  await ui.coreTap('Teams with it'); expect(await ui.current() === 'top', 'Winning teams did not open: ' + await ui.current());
  has(await ui.text(), /Incineroar ×/, 'filter chip'); has(await ui.text(), /Clear/, 'Clear'); await close(); });

t('CORES-10', 'Practice against (full teams) sets the Battle opponent', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Full teams$/, ui.area('cores')); const six = await ui.coreMembers(0);
  await ui.coreTap('Practice against'); expect(await ui.current() === 'matchup', 'Battle did not open'); await ui.waitForToast('Loaded as your opponent');
  expect(same((await ui.battleOpponentIds()).filter(Boolean), six), 'opponent six not set'); await close(); });

t('CORES-11', 'Copy for Showdown (full teams) gives six blocks', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Build'); await ui.tap(/^Full teams$/, ui.area('cores'));
  const tx = await ui.copyForShowdown(ui.area('cores')); expect(tx.trim().split(/\n\s*\n/).length === 6, 'not six blocks'); await close(); });

t('CORES-12', 'Empty state: a filter with no cores says so', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('Build');
  await ui.typeInto('With a Pokémon', 'Luxray'); await pg.keyboard.press('Enter'); await sleep(600);
  has(await ui.coresText(), 'No cores match. Try another Pokémon.', 'empty note'); await close(); });

t('CORES-13', 'Menu › Build around a core opens Build scrolled to the cores', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Home'); await ui.go('cores', 900);
  expect(await ui.current() === 'auto', 'Build did not open'); const top = await ui.coresTopOnScreen(); expect(top != null && top > -60 && top < 260, 'cores not at the top of the screen: ' + top); await close(); });

// =====================================================================================================
// 1. Build pane pieces that now live on My team (Edit panel, team actions, locks, Problems, Plan settings)
//    BUILD-03 (Full sets / Grid switch) and BUILD-05 ("New team: where do you want to start?") are never visible:
//    concept-h.css hides #sixHead and #startCard inside the Edit panel. No test (reported). BUILD-08 is dead (inventory).
// =====================================================================================================
const NO_SPEED = ['Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Basculegion'];

t('BUILD-01', 'Edit panel: Edit set opens "Edit <name>" with the six strip; strip switches; Remove with Undo; Esc closes', async () => {
  const {ui, pg, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team');
  await ui.openEditFor(1); let e = await ui.editPanelState(); expect(e && e.title === 'Edit Garchomp' && e.strip === 6, 'panel not "Edit Garchomp" with six sprites: ' + JSON.stringify(e));
  await ui.tapEditStrip(2); e = await ui.editPanelState(); expect(e && e.title === 'Edit Incineroar', 'strip did not switch: ' + JSON.stringify(e));
  await ui.tap(/^Remove Incineroar from the team/); expect(!(await ui.team()).includes('Incineroar'), 'Incineroar not removed');
  await ui.waitForToast('Removed Incineroar'); expect(await ui.toastOffersUndo(), 'no Undo');
  await pg.keyboard.press('Escape'); await sleep(500); expect(!(await ui.editPanelState()), 'Esc did not close the panel'); await close(); });

t('BUILD-02', 'Team actions: Save team names and saves (then "Update saved team"); ⋯ › Clear team empties with Undo', async () => {
  const {ui, acct, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team');
  await ui.tap(/^Save team$/, 'body', 700); await ui.typeInto('Team name', 'Test', true); await ui.waitForToast('Saved "Test"');
  await ui.waitSee('Update saved team'); await sleep(800); expect((await acct()).teams.some(x => x.name === 'Test'), 'Test not saved to the account');
  await ui.tap(/^⋯$/); await ui.tap(/^Clear team$/, 'body', 700); expect((await ui.team()).length === 0, 'team not cleared');
  await ui.waitForToast('Team cleared'); expect(await ui.toastOffersUndo(), 'no Undo'); await ui.undoToast(); expect(same(await ui.team(), TEAM), 'Undo did not bring the six back'); await close(); });

t('BUILD-04', 'A locked Pokémon is never swapped out (All suggestions, cores)', async () => {
  const {ui, acct, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.lockPokemon('Rillaboom'); await sleep(800);
  expect((await acct()).slots.find(s => s.n === 'Rillaboom').lock === true, 'lock not saved');
  await ui.go('All Suggestions'); await ui.waitSwaps(); await ui.tap(/^Whole roster/, ui.area('All suggestions page')); await ui.waitSwaps();
  for (const c of await ui.swapCards()) not(c.button, 'Swap out Rillaboom', 'swap card'); not(await ui.biggerPlans(), /Rillaboom →/, 'Bigger plans');
  await ui.go('Build'); await ui.coreTap('Add to my team'); expect((await ui.team()).includes('Rillaboom'), 'adding a core removed locked Rillaboom'); await close(); });

t('BUILD-06', 'Problems and team checks: summary line, a Speed control row with fixes; Quick add puts the pick on the team with Undo', async () => {
  const {ui, close} = await open({team: NO_SPEED, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions();
  const f = await ui.unfold(/^Problems and Team Checks/i); has(f, /\d+ to look at, \d\/4 checks, legal/i, 'summary line');
  has(f, /Speed control .*?\d+ fixes/, 'Speed control row'); has(f, /Ready \+\d+%|Good fit/, 'pick readiness');
  const before = await ui.team(); const r = await ui.quickAddFromProblem('Speed control'); expect(r && r.btn, 'no Quick add pick: ' + JSON.stringify(r));
  const tt = await ui.waitForToast(/^Added|→/); expect(await ui.toastOffersUndo(), 'no Undo'); expect((await ui.team()).length === 6 && !same(await ui.team(), before), 'pick not added: ' + tt);
  await ui.undoToast(); expect(same(await ui.team(), before), 'Undo did not restore'); await close(); });

t('BUILD-07', 'Plan settings: Pick from, Swap my Mega, Count abilities, Refresh, Never suggest (with toasts, saved)', async () => {
  const {ui, acct, ls, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); await ui.unfold(/^Bigger Plans/i);
  const ps = await ui.unfold(/^Plan Settings/i); has(ps, /Box \+ catch, 2 Megas/, 'summary'); has(ps, 'Nothing excluded');
  expect((await ui.pickFromOptions()).join('|').match(/My box\|Box \+ catch.*\|Whole roster/), 'Pick from choices: ' + await ui.pickFromOptions());
  await ui.setPickFrom('Whole roster'); expect(await ls('cc2.pool') === 'all', 'Pick from not saved'); await ui.toggleSetting('Let plans swap my Mega'); await ui.waitForToast('Plans can now swap your Mega');
  await ui.toggleSetting('Count abilities'); await ui.waitForToast('Plans updated'); expect(!(await ui.settingOn('Count abilities')), 'Count abilities still on');
  await ui.tap(/^Refresh plans$/); await ui.waitForToast('Plans refreshed');
  await ui.neverSuggest('Kingamb'); await ui.waitForToast(/Kingambit won.t be suggested/); has(await ui.neverSuggestList(), 'Kingambit', 'never-suggest chips'); has(await ui.text(), /1 excluded/, 'count');
  await sleep(800); expect(((await acct()).excl || []).includes('Kingambit'), 'never-suggest not saved');
  await ui.toggleSetting('Count abilities'); await ui.go('My Team'); expect(await ui.pressed(/^Whole roster/, ui.area('My team suggestions')) ?? await ui.pressed(/^Whole roster/), 'My team "Suggest from" does not show Whole roster');
  not(await ui.waitMySuggestions(), 'Kingambit', 'My team suggestions'); await ui.go('All Suggestions'); await ui.waitSwaps(); for (const c of await ui.swapCards()) not(c.text.slice(0, 40), 'Kingambit', 'swap card');
  not(await ui.biggerPlans(), /→ Kingambit|Kingambit for/, 'Bigger plans');
  await ui.unfold(/^Plan Settings/i); await ui.allowAgain('Kingambit'); await ui.waitForToast('Kingambit can be suggested again'); await close(); });

// =====================================================================================================
// 4. All suggestions (COV-10 Team checks list is dead: drawn then hidden. No test.)
// =====================================================================================================
t('COV-01', 'All suggestions head; reached from "See all suggestions ›"; ← My Team goes back', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions();
  await ui.tap(/^See all suggestions/); expect(await ui.current() === 'coverage', 'All suggestions did not open'); const tx = await ui.text();
  has(tx, 'Every swap and plan for your team', 'kicker'); has(tx, 'All Suggestions', 'title'); has(tx, 'Pokémon that ready your team for more of the top threats without breaking it, best first.', 'hint');
  await ui.tap(/^← My Team/); expect(await ui.current() === 'report', 'back link did not open My team'); await close(); });

t('COV-02', 'Opening after a team change shows at once with a working line, then the cards', async () => {
  const {ui, close} = await open({team: ['Garchomp', 'Incineroar', 'Whimsicott', 'Sneasler', 'Kingambit', 'Farigiraf'], box: BOX});
  await ui.go('All Suggestions', 0); expect(await ui.current() === 'coverage', 'page did not show at once');
  const early = await ui.text(); const sawWorking = /Working out the best swaps for your team/.test(early);
  await ui.waitSwaps(); expect((await ui.swapCards()).length > 0 || /Nothing in your box/.test(await ui.text()), 'no cards after working');
  expect(sawWorking || (await ui.swapCards()).length > 0, 'neither the working line nor cards'); await close(); });

t('COV-03', 'Suggest from My box / Whole roster changes the list and is remembered (separate from My team\'s)', async () => {
  const {ui, ls, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps();
  const a = (await ui.swapCards()).map(c => c.text.slice(0, 30)).join('|'); await ui.tap(/^Whole roster/, ui.area('All suggestions page')); await ui.waitSwaps();
  const b = (await ui.swapCards()).map(c => c.text.slice(0, 30)).join('|'); expect(a !== b, 'list did not change'); has((await ui.swapCards()).map(c => c.text).join(' '), /To catch/, 'Whole roster picks');
  expect(await ls('cc2.recsrc') === 'all', 'not saved'); await ui.reloadAsSamePlayer(); await ui.go('All Suggestions'); expect(await ui.pressed(/^Whole roster/, ui.area('All suggestions page')), 'Whole roster not kept after reload');
  await ui.go('My Team'); expect(await ui.pressed(/^Box \+ catch/), 'My team Suggest from changed too (should be separate)'); await close(); });

t('COV-04', 'Swap/add cards: "Pokémon to Add" on a short team, "One Pokémon In, One Out" on a full one, with their details', async () => {
  { const {ui, close} = await open({team: TEAM.slice(0, 4), box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); has(await ui.text(), 'Pokémon to Add', 'heading');
    const c = await ui.swapCards(); expect(c.length && c.every(x => x.button === 'Add to team'), 'add cards: ' + JSON.stringify(c.map(x => x.button))); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); has(await ui.text(), 'One Pokémon In, One Out', 'heading');
    const c = await ui.swapCards(); expect(c.length > 0, 'no swap cards'); const x = c[0];
    expect(/^Swap out /.test(x.button), 'button: ' + x.button); has(x.text, /[\d,]+ teams/, 'card'); has(x.text, /In your box|To catch/, 'card'); has(x.text, /[SABCD] tier \d+/, 'card');
    has(x.text, /[+−-]\d+ \(\d+ → \d+\)/, 'grade chip'); has(x.text, /Weak \d+ → \d+/, 'change chip'); has(x.text, /(Covers|Loses) .+: .+ → /, 'threat lines'); has(x.text, /replaces \w+/, 'why line'); await close(); } });

t('COV-05', 'Swap/Add applies in place with a toast and Undo', async () => {
  const {ui, close} = await open({team: TEAM.slice(0, 4), box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps();
  const name = (await ui.swapCards())[0].text.split(/ (Normal|Fire|Water|Grass|Electric|Ice|Fighting|Poison|Ground|Flying|Psychic|Bug|Rock|Ghost|Dragon|Dark|Steel|Fairy) /)[0];
  await ui.applySwap(0); expect(await ui.current() === 'coverage', 'left the page'); const tt = await ui.waitForToast(/^Added /); has(tt, name, 'toast');
  expect((await ui.team()).length === 5, 'not added'); await ui.undoToast(); await ui.waitForToast('Change undone'); expect(same(await ui.team(), TEAM.slice(0, 4)), 'Undo did not restore'); await close(); });

t('COV-06', 'Only 3 cards first; "N More Swaps · Showing 3 of N" unfolds the rest; More suggestions loads more', async () => {
  const {ui, close} = await open({team: TEAM.slice(0, 4), box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); await ui.tap(/^Whole roster/, ui.area('All suggestions page')); await ui.waitSwaps();
  expect((await ui.swapCards()).length === 3, 'not 3 cards first: ' + (await ui.swapCards()).length); const m = (await ui.text()).match(/(\d+) More Swaps? Showing 3 of (\d+)/i); expect(m, 'no "N more swaps · Showing 3 of N" strip');
  await ui.tap(/More Swaps? Showing 3 of/i, ui.area('All suggestions page'), 600); expect((await ui.swapCards()).length === +m[2], 'strip did not unfold all ' + m[2]);
  has(await ui.text(), /More suggestions \d+ more options, including rarely used picks and side-grades/, 'More suggestions button');
  const n0 = (await ui.swapCards()).length; await ui.tap(/^More suggestions/, ui.area('All suggestions page'), 800); await ui.waitSwaps();
  expect((await ui.swapCards()).length > n0, 'More suggestions added nothing'); has(await ui.text(), /Rarely used picks and different options/i, 'more label'); await close(); });

t('COV-07', 'Nothing improves: the honest note pointing to Whole roster', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0);
  await ui.go('All Suggestions'); await ui.waitSwaps();
  has(await ui.text(), 'Nothing in your box improves this team without costing something (every swap gives up some defense, offense, readiness for a top threat or a game-plan job). Try "Whole roster" to see what to catch.', 'note'); await close(); });

t('COV-08', 'Too few Pokémon: note and Go to My team', async () => {
  const {ui, close} = await open({team: ['Garchomp'], box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps();
  has(await ui.text(), 'Add at least two Pokémon on My team to get suggestions.', 'note'); await ui.tap(/^Go to My team/, ui.area('All suggestions page')); expect(await ui.current() === 'report', 'did not open My team'); await close(); });

t('COV-09', 'Game-plan gap note shows on All suggestions when nothing in the pool closes the gap', async () => {
  const box = ['Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Basculegion', 'Archaludon', 'Azumarill'];
  const {ui, close} = await open({team: [...NO_SPEED, 'Archaludon'], box}); await ui.go('My Team'); await ui.setSuggestFrom('My box'); await ui.waitMySuggestions();
  await ui.go('All Suggestions'); await ui.waitSwaps(); await ui.readMore(ui.area('All suggestions page'));
  has(await ui.text(), /Nothing in your box fixes it without weakening the team: try "Box \+ catch" or "Whole roster"|try "Whole roster" above/, 'gap note'); await close(); });

t('COV-11', 'Bigger plans fold: settings, multi-change suggestions only, hint', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); has(await ui.text(), /Bigger Plans Two or more changes at once/, 'fold heading');
  const bp = await ui.biggerPlans(); has(bp, 'Plan Settings', 'settings inside'); has(bp, 'Item problems first, then the plans that ready the team for the most top threats. Your Mega and locked Pokémon stay put.', 'hint');
  const ks = [...bp.matchAll(/Suggestion \d+, (\d+) changes?/g)].map(m => +m[1]); expect(ks.length || /Every one-change suggestion is a swap above/.test(bp), 'no plans and no dedupe note');
  expect(ks.every(k => k >= 2), 'a one-change plan shown again in Bigger plans: ' + ks); await close(); });

t('COV-12', 'How Scoring Works lives at the bottom of My team', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); const tx = await ui.text();
  expect(tx.lastIndexOf('How Scoring Works') > tx.indexOf('Suggestions'), 'not at the bottom'); const f = await ui.unfold(/^How Scoring Works/i);
  has(f, /ready/i, 'readiness'); has(f, /check/i, 'team checks'); expect(f.length > 400, 'explainer too short'); await close(); });

// =====================================================================================================
// 5. The suggestion system (SUGG-18 Quick add = BUILD-06, tested there)
// =====================================================================================================
const NO_SPEED6 = [...NO_SPEED, 'Archaludon'];

t('SUGG-01', 'One planner everywhere: My team, Bigger plans and the threat sheet show the same top suggestion', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); const my = await ui.waitMySuggestions();
  const m = my.match(/→ (\S+) for (\S+) → (\S+) for (\S+) ([+−-]\d+ \(\d+ → \d+\))/); expect(m, 'My team top card not readable: ' + my);
  await ui.openThreat('Archaludon'); const sh = await ui.threatSheetText(); has(sh, 'Best fix', 'threat sheet'); has(sh, m[5], 'threat sheet best fix score');
  await ui.pg.keyboard.press('Escape'); await ui.go('All Suggestions'); await ui.waitSwaps(); const bp = await ui.biggerPlans();
  has(bp, `${m[2]} → ${m[1]}`, 'Bigger plans suggestion 1'); has(bp, `${m[4]} → ${m[3]}`, 'Bigger plans suggestion 1'); has(bp, m[5], 'Bigger plans score'); await close(); });

t('SUGG-02', 'My team sliders Suggest from / Megas / Swap my Mega are the same settings as Plan settings', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions();
  await ui.setSuggestFrom('Whole roster'); await ui.waitForToast('Suggestions use the full roster');
  await ui.tap(/^Yes$/, ui.area('My team page'), 500); await ui.go('All Suggestions'); await ui.waitSwaps(); await ui.unfold(/^Bigger Plans/i); await ui.unfold(/^Plan Settings/i);
  has(await ui.pickFrom(), 'Whole roster', 'Pick from'); expect(await ui.settingOn('Let plans swap my Mega'), 'Let plans swap my Mega not on'); await close(); });

t('SUGG-03', 'My team suggestion card: out → in, score chip, lane line, Apply, Why? reasons', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); const s = await ui.waitMySuggestions();
  has(s, /→ \S+ for \S+/, 'change line'); has(s, /[+−-]\d+ \(\d+ → \d+\), (Top tier|Tournament ready|Solid|Needs work|Missing a basic)/, 'score chip'); has(s, /Apply/, 'Apply');
  has(s, /(Fix|Small edge|Option) \S/, 'lane line'); const w = await ui.unfold(/^Why\? \d+ reasons/i, ui.area('My team suggestions')); has(w, /Weak spots: \d+ → \d+|weak spot/i, 'Why reasons'); await close(); });

t('SUGG-04', 'Bigger plans card: Suggestion N · K changes, score, lane, rows with set line, more reasons, Apply suggestion N', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); const bp = await ui.biggerPlans();
  has(bp, /Suggestion 1, \d changes [+−-]\d+ \(\d+ → \d+\)/, 'card head'); has(bp, /(Fix|Small edge|Option) \S/, 'lane'); has(bp, /\S+ → \S+ [\d,]+ teams/, 'change row');
  has(bp, /@ .+?, [\d.]+% usage/, 'set line'); has(bp, /Apply suggestion 1/, 'Apply button');
  const more = await ui.unfold(/^\d+ more reasons/i, ui.area('Bigger plans')); expect(more.length > 60, 'more reasons fold empty'); await close(); });

t('SUGG-05', 'Planner rules: locked Pokémon stay; Pokémon just swapped out are not offered back', async () => {
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team');
    for (const n of ['Mega Charizard Y', 'Garchomp', 'Incineroar', 'Whimsicott', 'Sneasler']) await ui.lockPokemon(n);
    await ui.waitMySuggestions(); const before = await ui.team(); await ui.applyMySuggestion(0); const after = await ui.team();
    const changed = before.filter((n, i) => after[i] !== n); expect(changed.length >= 1 && changed.every(n => n === 'Rillaboom'), 'a locked Pokémon was swapped: ' + changed); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0);
    not(await ui.waitMySuggestions(), /(Rillaboom|Incineroar) for/, 'My team suggestions'); await ui.go('All Suggestions'); await ui.waitSwaps();
    not(await ui.biggerPlans(), /→ (Rillaboom|Incineroar)\b/, 'Bigger plans'); await close(); } });

t('SUGG-06', 'Lanes: Fix / Small edge / Option lines on My team and on every All suggestions card', async () => {
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team');
    has(await ui.waitMySuggestions(), /Small edge about \d+ more wins in 100 games in real play/, 'My team lane');
    await ui.go('All Suggestions'); await ui.waitSwaps(); const c = await ui.swapCards(); expect(c.length > 0, 'no cards');
    for (const x of c) has(x.text, /(Fix|Small edge|Option) (two of|adds|makes|about|covers|a small change)/, 'swap card lane line'); await close(); }
  { const {ui, close} = await open({team: NO_SPEED6, box: BOX}); await ui.go('My Team');
    has(await ui.waitMySuggestions(), /Fix adds a Mega: teams with no Mega won about \d+ fewer games in 100/, 'Fix lane'); await close(); } });

t('SUGG-07', 'Add Protect card: shown when few run Protect; Add Protect puts it in their sets', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX});
  await ui.setMoves(1, ['Earthquake', 'Rock Slide', 'Dragon Claw', 'Stomping Tantrum']); await ui.setMoves(2, ['Fake Out', 'Flare Blitz', 'Parting Shot', 'Knock Off']); await ui.setMoves(4, ['Fake Out', 'Grassy Glide', 'Wood Hammer', 'U-turn']);
  await ui.setMoves(5, ['Fake Out', 'Close Combat', 'Dire Claw', 'Gunk Shot']);
  await ui.go('My Team'); const s = await ui.waitMySuggestions(); const m = s.match(/Fix only (\d) of your six run Protect: .+? Their usual sets run it: (.+?)\. Add Protect/);
  expect(m, 'no Add Protect card: ' + s.slice(0, 300)); await ui.tap(/^Add Protect$/, ui.area('My team page'), 800);
  await ui.waitForToast(/^Protect added: it.s in each set now, change it any time/);
  const named = m[2].split(/, | and /); for (const [i, n] of [[1, 'Garchomp'], [2, 'Incineroar'], [4, 'Rillaboom'], [5, 'Sneasler']]) if (named.includes(n)) expect((await ui.slotSet(i)).mv.doubles.includes('Protect'), n + ' has no Protect');
  await close(); });

t('SUGG-07', 'Add Protect: the toast offers Undo, and Undo takes Protect back out', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); const mv = ['Fake Out', 'Close Combat', 'Dire Claw', 'Gunk Shot'];
  await ui.setMoves(1, ['Earthquake', 'Rock Slide', 'Dragon Claw', 'Stomping Tantrum']); await ui.setMoves(2, ['Fake Out', 'Flare Blitz', 'Parting Shot', 'Knock Off']); await ui.setMoves(4, ['Fake Out', 'Grassy Glide', 'Wood Hammer', 'U-turn']); await ui.setMoves(5, mv);
  await ui.go('My Team'); await ui.waitMySuggestions(); await ui.tap(/^Add Protect$/, ui.area('My team page'), 800); await ui.waitForToast(/^Protect added/);
  expect(await ui.toastOffersUndo(), 'the toast offers no Undo'); await ui.undoToast(); expect(JSON.stringify((await ui.slotSet(5)).mv.doubles) === JSON.stringify(mv), 'Undo did not take Protect back out'); await close(); },
  {known: 'the "Protect added" toast offers no Undo (the change is not stored as an undo step)'});

t('SUGG-08', 'Nothing to fix: card with Battle and Sets, then side-grades that keep every check', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0); const s = await ui.waitMySuggestions();
  has(s, 'Nothing to fix. Your team has every basic and no swap clearly beats it in real games.', 'card'); has(s, 'Your edge now comes from how you play it', 'card');
  has(s, /Nothing raises this team.s Strength Score right now\. (These swaps keep every check and about the same grade, with a different look:|and every other swap would lower it\.)/, 'side-grade lead');
  await ui.tap(/^Battle$/, ui.area('My team suggestions'), 700); expect(await ui.current() === 'matchup', 'Battle button did not open Battle'); await close(); });

t('SUGG-09', 'Apply: writes the plan, keeps the scroll spot, toast with the score move and Undo', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions();
  const y0 = await ui.pageScrollY(); await ui.applyMySuggestion(0); const tt = await ui.waitForToast(/^Applied: /);
  has(tt, /^Applied: \S+ and \S+ [+−-]\d+ \(\d+ → \d+\), (Top tier|Tournament ready|Solid|Needs work)/, 'toast'); expect(await ui.toastOffersUndo(), 'no Undo');
  expect(!same(await ui.team(), TEAM), 'team unchanged'); expect(Math.abs(await ui.pageScrollY() - y0) < 80, 'page jumped');
  await ui.undoToast(); expect(same(await ui.team(), TEAM), 'toast Undo did not restore'); await close(); });

t('SUGG-10', 'Undo bar: shows on My team and Bigger plans, steps back with "Undone: …", disappears after another change', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0);
  await ui.until(async () => /^Applied .+ for .+ Undo/.test(await ui.undoBarText()), 15000, 'Undo bar on My team');
  await ui.go('All Suggestions'); await ui.waitSwaps(); await ui.biggerPlans(); await ui.until(async () => /^Applied .+ for /.test(await ui.undoBarText()), 15000, 'Undo bar in Bigger plans');
  await sleep(500); await ui.undoLastApplied(); await ui.waitForToast(/^Undone: .+ for /); expect(same(await ui.team(), TEAM), 'Undo bar did not restore the six');
  await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0); await ui.until(async () => !!(await ui.undoBarText()), 15000, 'bar');
  await sleep(600); await ui.removeFromMyTeam(5); await sleep(1200); expect(!(await ui.undoBarText()), 'Undo bar stayed after another change'); await close(); });

t('SUGG-11', 'Show N more suggestions opens the next ones, then See all suggestions › opens All suggestions', async () => {
  const {ui, close} = await open({team: NO_SPEED6, box: BOX}); await ui.go('My Team'); has(await ui.waitMySuggestions(), /Show 2 more suggestions/, 'Show more');
  expect(await ui.mySuggestionCount() === 1, 'more than one card first'); await ui.tap(/^Show 2 more suggestions/, ui.area('My team suggestions'), 600);
  expect(await ui.mySuggestionCount() === 3, 'not 3 cards after Show more: ' + await ui.mySuggestionCount());
  await ui.tap(/^See all suggestions/, ui.area('My team suggestions'), 700); expect(await ui.current() === 'coverage', 'All suggestions did not open'); await close(); });

t('SUGG-12', 'Bigger plans › More suggestions adds 3 per tap', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); await ui.waitSwaps(); const bp = await ui.biggerPlans();
  has(bp, /More suggestions \d+ more suggestions?, including different options and rarely used picks/, 'More suggestions'); const n0 = await ui.biggerPlanCount();
  await ui.tap(/^More suggestions/, ui.area('Bigger plans'), 900); await ui.until(async () => await ui.biggerPlanCount() >= n0 + 3, 15000, '3 more plans'); await close(); });

t('SUGG-13', 'While suggestions are worked out after an edit, the old ones fade and cannot be tapped, then refresh', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions();
  await ui.removeFromMyTeam(3); let busy = false; for (let i = 0; i < 20 && !busy; i++) { busy = await ui.suggestionsBusy(); if (!busy) await sleep(25); }
  expect(busy, 'never saw the working state after an edit'); await ui.until(async () => !(await ui.suggestionsBusy()), 20000, 'suggestions refreshed'); await close(); });

t('SUGG-14', 'No-plan messages: nothing for an empty team; Bigger plans says no change raises the score', async () => {
  { const {ui, close} = await open({team: [], box: BOX}); await ui.go('My Team'); expect(!(await ui.mySuggestions()), 'suggestions shown for an empty team'); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0);
    await ui.go('All Suggestions'); await ui.waitSwaps(); has(await ui.biggerPlans(), /No change from this pool raises the team's Strength Score \(it's at [\d.]+\)\. Keep this team, or try "Whole roster" or unlock a Pokémon\./, 'no-plan note'); await close(); } });

t('SUGG-14', 'No-plan wording is exact: the score as shown elsewhere, and no "no change" verdict while still working', async () => {
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0);
    await ui.go('All Suggestions'); await ui.waitSwaps(); has(await ui.biggerPlans(), /\(it's at \d+\)\./, 'score in the no-plan note'); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('All Suggestions'); const early = await ui.biggerPlansNow();
    const later = await ui.biggerPlans(); if (/Suggestion 1/.test(later)) not(early, /No change from this pool (improves|raises)/, 'Bigger plans while still working'); await close(); } },
  {known: 'the note shows the score with a decimal ("it\'s at 91.2") while the Strength Score shows 91 elsewhere; and opening All suggestions straight away, Bigger plans first says "No change from this pool improves the team" for 1-2 s before Suggestion 1 appears'});

t('SUGG-15', 'Mega-over-goal note and game-plan gap note on My team and All suggestions', async () => {
  { const {ui, close} = await open({team: ['Charizard-Mega-Y', 'Garchomp-Mega-Z', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'], box: BOX}); await ui.go('My Team'); await ui.setMegas(1);
  const note = 'Your team has 2 Megas and Megas on team is set to 1. Turn on "Let plans swap my Mega" to see swaps without them.';
  has(await ui.waitMySuggestions(), note, 'My team'); await ui.go('All Suggestions'); await ui.waitSwaps(); has(await ui.text(), note, 'All suggestions'); await close(); }
  // the game-plan gap note: nothing in the box closes the gap
  { const box = ['Garchomp', 'Incineroar', 'Kingambit', 'Sneasler', 'Basculegion', 'Archaludon', 'Azumarill'];
    const {ui, close} = await open({team: [...NO_SPEED, 'Archaludon'], box}); await ui.go('My Team'); await ui.setSuggestFrom('My box'); await ui.waitMySuggestions(); await ui.readMore(ui.area('My team suggestions'));
    has(await ui.mySuggestions(), 'Nothing in your box fixes it without weakening the team: try "Box + catch" or "Whole roster".', 'gap note'); await close(); } });

t('SUGG-16', 'Fix your items first: Item Clause card, Give X Y with Undo, card gone', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.setItem(1, 'Sitrus Berry'); await ui.setItem(2, 'Sitrus Berry');
  await ui.go('All Suggestions'); await ui.waitSwaps(); const bp = await ui.biggerPlans(); has(bp, 'Fix your items first', 'card'); has(bp, /Item Clause: Garchomp and Incineroar both hold Sitrus Berry/, 'card');
  const g = bp.match(/Give (Garchomp|Incineroar) ([A-Z][\w ]+?) (Based|Item|Set|Fix|Suggestion)/); expect(g, 'no Give button'); await ui.tap(new RegExp('^Give ' + g[1]), ui.area('Bigger plans'), 900);
  await ui.waitForToast(`Gave ${g[1]} ${g[2]}`); expect(await ui.toastOffersUndo(), 'no Undo'); not(await ui.biggerPlans(), 'Item Clause:', 'after the fix'); await close(); });

t('SUGG-17', 'Set check tips: a rare item gets "X: Y instead of Z" with Use Y', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.setItem(1, 'Big Root');
  await ui.go('All Suggestions'); await ui.waitSwaps(); const bp = await ui.biggerPlans(); has(bp, /Set Check: What Most Players Run/i, 'tips heading');
  const m = bp.match(/Garchomp: ([A-Z][\w ]+?) instead of Big Root \(item\)/); expect(m, 'no Garchomp item tip'); has(bp, 'This tip comes from what players run, not from the grade.', 'tip note');
  await ui.tap(new RegExp('^Use ' + m[1] + '$'), ui.area('Bigger plans'), 900); await ui.until(async () => ((await ui.slotSet(1)).it || {}).doubles === m[1], 5000, 'item changed'); await close(); });

t('SUGG-19', 'Threat sheet Best fix: shows the fix and Apply this fix applies it', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.openThreat('Archaludon');
  const sh = await ui.threatSheetText(); has(sh, /Best fix/, 'sheet'); has(sh, /[+−-]\d+ \(\d+ → \d+\)/, 'score move'); has(sh, /Apply this fix/, 'sheet'); await ui.applyBestFix();
  expect(!same(await ui.team(), TEAM), 'team unchanged'); await ui.waitForToast(/^Applied: /); await close(); });

t('SUGG-19', 'Threat sheet Best fix: the sheet closes after Apply this fix', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.waitMySuggestions(); await ui.openThreat('Archaludon'); await ui.applyBestFix();
  expect(!(await ui.threatSheetText()), 'sheet did not close'); await close(); },
  {known: 'Apply this fix applies the plan but the threat sheet stays open (also with a real mouse click)'});

// =====================================================================================================
// 6. Popular sets
// =====================================================================================================
t('SETS-01', 'Popular sets head and the Rating · Usage · Sets switch', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Popular Sets'); expect(await ui.current() === 'sets', 'not on Popular sets');
  const tx = await ui.text(); has(tx, /^Pokémon Tournaments Rating Usage Sets/, 'tabs and switch'); has(tx, 'Popular Sets', 'title'); has(tx, 'What players run on any Pokémon.', 'hint');
  expect(await ui.pressed(/^Sets$/), 'Sets not selected'); await ui.tap(/^Usage$/, ui.area('Popular sets page'), 700); expect(await ui.current() === 'meta', 'Usage did not open'); await close(); });

t('SETS-02', 'Look up a Pokémon shows its sets, empties the box, and is remembered', async () => {
  const {ui, ls, close} = await open({team: TEAM, box: BOX}); await ui.go('Popular Sets'); await ui.findSetsFor('kingam');
  expect(await ui.setsShownPokemonId() === 'Kingambit', 'not showing Kingambit'); has(await ui.text(), /Kingambit Dark Steel/, 'header'); expect(await ui.boxValue('Look up a Pokémon') === '', 'box not emptied');
  expect(await ls('cc2.setMon') === 'Kingambit', 'not saved'); await ui.reloadAsSamePlayer(); await ui.go('Popular Sets'); expect(await ui.setsShownPokemonId() === 'Kingambit', 'not remembered'); await close(); });

t('SETS-03', 'Your team picker: six tiles, the shown one highlighted on first open, tap switches', async () => {
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Popular Sets'); const p = await ui.setsTeamPicker();
    expect(p.length === 6, 'not six tiles'); expect(p.filter(x => x.pressed === 'true').map(x => x.name).join() === 'Charizard-Mega-Y', 'first open highlight: ' + JSON.stringify(p));
    await ui.showSetsOfTeamMember('Garchomp'); expect(await ui.setsShownPokemonId() === 'Garchomp', 'tap did not switch'); expect((await ui.setsTeamPicker()).find(x => x.name === 'Garchomp').pressed === 'true', 'Garchomp not highlighted'); await close(); }
  { const {ui, close} = await open({team: [], box: BOX}); await ui.go('Popular Sets'); expect((await ui.setsTeamPicker()).length === 0, 'picker shown without a team'); not(await ui.text(), 'Your Team', 'no-team page'); await close(); } });

t('SETS-04', 'Which Pokémon opens first: last looked up, else first team member, else the top-rated', async () => {
  { const {ui, close} = await open({team: TEAM, box: BOX, stored: {'cc2.setMon': '"Kingambit"'}}); await ui.go('Popular Sets'); expect(await ui.setsShownPokemonId() === 'Kingambit', 'saved pick not first'); await close(); }
  { const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Popular Sets'); expect(await ui.setsShownPokemonId() === 'Charizard-Mega-Y', 'first team member not first'); await close(); }
  { const {ui, close} = await open({team: [], box: BOX}); await ui.go('Popular Sets'); has(await ui.text(), /#1 of \d+ Pokémon with tournament results/, 'top-rated Pokémon'); await close(); } });

t('SETS-05', 'Pokémon header: tier, rating, rank, and your own set when it is on your team', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Popular Sets'); const tx = await ui.text();
  has(tx, /Mega Charizard Y Fire Flying Mega S tier, rated \d+, #\d+ of \d+ Pokémon with tournament results/, 'header'); has(tx, /Your Mega Charizard Y: Drought @ Charizardite Y/, 'your set line'); await close(); });

t('SETS-06', 'Source switch Best data · Tournaments · Showdown changes the numbers and is remembered', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Popular Sets'); const a = await ui.text(); expect(await ui.setsSource() === 'Best data', 'default not Best data');
  await ui.tapSetsSource('Tournaments');
  expect(await ui.setsSource() === 'Tournaments', 'Tournaments not selected'); expect(await ui.text() !== a, 'numbers did not change');
  await ui.reloadAsSamePlayer(); await ui.go('Popular Sets'); expect(await ui.setsSource() === 'Tournaments', 'not remembered'); await close(); });

t('SETS-07', 'Set card: moves, item, ability, nature, teammates (tap → their sets), source note', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Popular Sets'); const tx = await ui.text();
  has(tx, /Moves .+ \d+(\.\d)?%/, 'moves'); has(tx, /Item .+/, 'item'); has(tx, /Ability /, 'ability'); has(tx, /Nature /, 'nature'); has(tx, /Teammates /, 'teammates'); has(tx, /From .+ battles|From .+ teams|From /, 'source note');
  await ui.scrollPageTo(900); await ui.tapTeammate('Kingambit'); expect(await ui.setsShownPokemonId() === 'Kingambit', 'teammate tap did not switch'); const top = await ui.paneTop(); expect(top > -200 && top < 120, 'did not scroll back up to the sets: pane top ' + top); await close(); });

t('SETS-08', 'Ways in: Nothing-to-fix Sets button, the editor\'s Full popular sets, the info sheet', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); await ui.openEditFor(1); await ui.tap(/^Full popular sets/, 'body', 800);
  expect(await ui.current() === 'sets' && await ui.setsShownPokemonId() === 'Garchomp', 'Full popular sets did not open Garchomp'); expect(!(await ui.editPanelState()), 'editor stayed open');
  await ui.go('Ratings'); await ui.openInfoSheetFor('Farigiraf'); await ui.tap(/^Popular Sets$/, ui.area('info sheet'), 800); expect(await ui.current() === 'sets' && await ui.setsShownPokemonId() === 'Farigiraf', 'info sheet link');
  await ui.go('My Team'); await ui.waitMySuggestions(); await ui.applyMySuggestion(0); await ui.waitMySuggestions(); await ui.tap(/^Sets$/, ui.area('My team suggestions'), 800);
  expect(await ui.current() === 'sets', 'Nothing-to-fix Sets button'); await close(); });

// =====================================================================================================
// 7. Archetypes
// =====================================================================================================
const ARCHS = ['Tailwind', 'Trick Room', 'Rain', 'Sun', 'Sand', 'Snow', 'Psychic Terrain', 'Grassy Terrain'];
t('ARCH-01', 'Archetypes head and the Winning teams · Events · Archetypes switch', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Archetypes'); expect(await ui.current() === 'arch', 'not on Archetypes');
  const tx = await ui.text(); has(tx, 'Winning Teams Events Archetypes', 'switch'); expect(await ui.pressed(/^Archetypes$/), 'Archetypes not selected');
  has(tx, "The team styles you'll face most, how they win, and how to play into them. Tap a guide to open it.", 'hint'); await close(); });

t('ARCH-02', 'Share line from the latest top teams', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Archetypes'); has(await ui.text(), /From the latest \d+ top tournament teams\./, 'share line'); await close(); });

t('ARCH-03', 'Eight guides, most common first, each with share and basis', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Archetypes'); const g = await ui.archGuides();
  expect(g.length === 8 && same(g.map(x => x.name), ARCHS), 'not the eight guides: ' + JSON.stringify(g.map(x => x.name)));
  expect(g.every((x, i) => !i || x.share <= g[i - 1].share), 'not most common first: ' + g.map(x => x.share)); expect(g.every(x => /^\d+ of \d+ top teams$/.test(x.basis)), 'basis missing'); await close(); });

t('ARCH-04', 'Guide body: what it does, Key Pokémon, How to beat it, What your team has', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('Archetypes'); const f = await ui.unfold(/^Trick Room/);
  has(f, 'Key Pokémon'); has(f, 'How to beat it'); has(f, 'What your team has'); has(f, /Incineroar Fake Out ✓/, 'your answers'); await close(); });

t('ARCH-05', 'Archetype words label teams elsewhere (My team, built teams)', async () => {
  const {ui, close} = await open({team: TEAM, box: BOX}); await ui.go('My Team'); has(await ui.text(), /Sun, Grassy Terrain, Tailwind/, 'My team label');
  await ui.go('Build'); await ui.tap(/^Whole roster/); const r = await ui.buildMeATeam(); has(r, new RegExp('^(Proven team(, 1 swap)?|Fresh take|Your build) (' + [...ARCHS, 'Hard Trick Room', 'TailRoom', 'Electric Terrain', 'Sun-Rain'].join('|') + ')'), 'built card title'); await close(); });
