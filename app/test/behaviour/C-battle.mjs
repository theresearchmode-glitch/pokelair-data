// Behaviour tests, group C: Battle pages (docs/rebuild/inventory/C-battle.md). One test per inventory entry, keyed by its ID,
// written from the player's side. Talks to the page only through the adapter (adapters/<name>.mjs + adapters/<name>.C-battle.mjs).
// Run: node app/test/behaviour/run.mjs C-battle [--only=ID,ID]
import fs from 'node:fs'; import {group, open, TEAM, OPP, expect, HERE} from './harness.mjs';
const t = group('C-battle');

// the inventory's worked example: their six with a Trick Room setter, Armor Tail, rain and Psychic Terrain
const OPP2 = ['Kingambit', 'Pelipper', 'Archaludon', 'Basculegion', 'Farigiraf', 'Indeedee-F'];
const MEGAS = ['Charizard-Mega-Y', 'Raichu-Mega-Y', 'Gardevoir-Mega', 'Salamence-Mega', 'Floette-Mega', 'Staraptor-Mega'];
const has = (txt, s) => (txt || '').toLowerCase().includes(String(s).toLowerCase());
const hasAll = (txt, list, where) => { for (const s of list) expect(has(txt, s), `${where || 'page'} doesn't show "${s}"`); };
const lacks = (txt, s, where) => expect(!has(txt, s), `${where || 'page'} still shows "${s}"`);
const noErrors = errs => expect(!errs.length, 'page errors: ' + errs.join(' | '));
/** sum of the % numbers shown next to these move names in a text */
const pctOf = (txt, moves) => moves.reduce((a, m) => a + [...txt.matchAll(new RegExp('(\\d+)% ' + m, 'g'))].reduce((s, x) => s + +x[1], 0), 0);

// ============================== NAV: getting to the Battle pages ==============================
t('NAV-01', 'Battle tab opens Battle and stays highlighted on its sub-pages', async () => {
  for (const width of [1280, 390]) { const {ui, errs, close} = await open({team: TEAM, width});
    await ui.tapMainTab('Battle');
    expect(await ui.current() === 'matchup', `${width}: Battle tab didn't open Battle`);
    expect(await ui.sees('Team preview'), `${width}: Battle page head "Team preview" missing`);
    expect(await ui.mainTab() === 'Battle', `${width}: Battle tab not highlighted on Battle (got ${await ui.mainTab()})`);
    for (const p of ['Speed Tiers', 'Damage Calc', 'Type Chart', 'Test Run', 'Practice']) { await ui.go(p);
      expect(await ui.mainTab() === 'Battle', `${width}: Battle tab not highlighted on ${p} (got ${await ui.mainTab()})`); }
    noErrors(errs); await close(); } });

t('NAV-02', 'menu group "Battle" lists the six Battle pages in order, each opens its page', async () => {
  const {ui, close} = await open({team: TEAM});
  await ui.openMenu(); const g = (await ui.menuGroup('Battle') || []).map(s => s.toLowerCase());
  const want = ['battle a team', 'team preview practice', 'test run', 'speed tiers', 'damage calc', 'type chart'];
  expect(JSON.stringify(g) === JSON.stringify(want), 'Battle menu group is ' + JSON.stringify(g));
  expect((await ui.menuGroup('Meta') || []).some(s => /track record/i.test(s)), 'Track record is not in the Meta group');
  const pane = {'battle a team': 'matchup', 'team preview practice': 'practice', 'test run': 'gauntlet', 'speed tiers': 'speed', 'damage calc': 'calc', 'type chart': 'types'};
  for (const n of want) { await ui.openMenu(); await ui.tapMenu(n); expect(await ui.current() === pane[n], `menu "${n}" opened ${await ui.current()}`); }
  await close(); });

t('NAV-03', '"← Battle" back link on the five Battle sub-pages; "← Pokémon ratings" on Track record', async () => {
  const {ui, close} = await open({team: TEAM});
  await ui.openMenu(); await ui.tapMenu('Damage calc'); await ui.tapIn('← Battle');
  expect(await ui.current() === 'matchup', 'Damage calc "← Battle" did not open Battle');
  for (const p of ['Test Run', 'Practice', 'Speed Tiers', 'Type Chart']) { await ui.go(p); expect(has(await ui.text(), '← Battle'), `${p} has no "← Battle"`); }
  await ui.go('Track Record'); await ui.tapIn('← Pokémon ratings');
  expect(await ui.current() === 'ratings', 'Track record back link did not open Pokémon ratings');
  await close(); });

t('NAV-04', 'tool switch Speed tiers · Damage calc · Type chart (tap and keyboard)', async () => {
  const {ui, close} = await open({team: TEAM});
  await ui.go('Speed Tiers'); expect(/speed tiers/i.test(await ui.toolSwitchChosen() || ''), 'Speed tiers not chosen on its own page');
  await ui.toolSwitch('Damage calc'); expect(await ui.current() === 'calc', 'switch did not open Damage calc');
  expect(/damage calc/i.test(await ui.toolSwitchChosen() || ''), 'switch does not show Damage calc as chosen');
  await ui.toolSwitchKey('Type chart'); expect(await ui.current() === 'types', 'keyboard Enter on Type chart did not open it');
  await close(); });

t('NAV-05', '"More ways to prep" cards on Battle open the four tools', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  expect(await ui.sees(/more ways to prep/i), 'no "More ways to prep" on Battle');
  for (const [txt, pane] of [['Any attacker into any defender', 'calc'], ['Your team against the latest top teams', 'gauntlet'], ['Who moves first across the meta', 'speed'], ['What hits what', 'types']]) {
    await ui.go('Battle'); await ui.tapIn(txt); expect(await ui.current() === pane, `"${txt}" opened ${await ui.current()}`); }
  await close(); });

t('NAV-06', '"Practice against" on Winning teams loads that six into Battle with its real sheet', async () => {
  const {ui, errs, close} = await open({team: TEAM}); await ui.go('Winning Teams', 1200);
  await ui.tapIn('Practice against', 700);
  expect(await ui.current() === 'matchup', 'Battle did not open');
  expect((await ui.opponents()).length === 6, 'their six is not filled: ' + (await ui.opponents()).join(','));
  expect(/Opponent set/i.test(await ui.toast()), 'no "Opponent set" toast');
  const tx = await ui.text(); hasAll(tx, ['Their real open team sheet', 'finished', 'players'], 'Battle head');
  noErrors(errs); await close(); });

// ============================== BATTLE: Battle mode ==============================
t('BATTLE-01', 'page head: "Team preview · <team> vs their six", real sheet kicker and event line', async () => {
  { const {ui, close} = await open({}); await ui.go('Battle'); const tx = await ui.pageText();
    expect(/team preview/i.test(tx) && /your team\s+vs\s+their six/i.test(tx), 'empty Battle head is not "Team preview · Your team vs their six": ' + tx.slice(0, 120)); await close(); }
  const {ui, close} = await open({team: TEAM}); await ui.go('Battle'); let tx = await ui.pageText();
  expect(/vs\s+their six/i.test(tx), 'head does not say "vs their six" with none of theirs in');
  lacks(tx, 'as you see them at team preview. Type', 'head');
  await ui.enterOpponents(['Kingambit']); tx = await ui.pageText();
  expect(has(tx, 'Type their six as you see them at team preview'), 'the "Type their six…" line is missing with 1 of theirs');
  await ui.pickTournamentTeam(1); tx = await ui.pageText();
  hasAll(tx, ['Their real open team sheet', 'Champion', 'finished 1st at', 'players'], 'real-sheet head');
  lacks(tx, 'Type their six as you see them', 'head with six in');
  await close(); });

t('BATTLE-02', 'their six: type, Enter picks, focus moves on, no duplicates, × removes and refocuses, survives reload', async () => {
  const {ui, acct, close} = await open({team: TEAM}); await ui.go('Battle');
  await ui.typeOpponent(1, 'Kingam'); expect((await ui.suggestions()).some(s => /Kingambit/.test(s)), 'Kingambit not suggested');
  await ui.pg.keyboard.press('Enter'); await ui.pg.waitForTimeout(500);
  expect((await ui.opponents()).includes('Kingambit'), 'Kingambit not shown as theirs');
  expect(await ui.focused() === 'their 2', 'focus did not move to box 2: ' + await ui.focused());
  await ui.typeOpponent(2, 'Kingam'); expect(!(await ui.suggestions()).some(s => /Kingambit/.test(s)), 'Kingambit offered twice');
  await ui.pg.keyboard.press('Escape'); await ui.typeOpponent(2, 'Pelipp'); await ui.pg.keyboard.press('Enter'); await ui.pg.waitForTimeout(500);
  await ui.removeOpponent('Kingambit');
  expect(!(await ui.opponents()).includes('Kingambit'), 'Kingambit still there after ×');
  expect(await ui.focused() === 'their 1', 'removed box does not have focus: ' + await ui.focused());
  await ui.pg.waitForTimeout(1200); const a = await acct(); expect(a && (a.opp || []).includes('Pelipper'), 'their six not saved to the account');
  await ui.reload(); await ui.go('Battle');
  expect((await ui.opponents()).includes('Pelipper'), 'their six lost after reload');
  await close(); });

t('BATTLE-03', '"Clear their six" empties all six and the plan disappears', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  expect(await ui.sees(/bring these four/i), 'plan not shown with six in');
  await ui.clearOpponents();
  expect((await ui.opponents()).length === 0, 'their six not empty');
  expect(!(await ui.sees(/bring these four/i)), 'plan cards still shown');
  expect(!(await ui.sees('Clear their six')), '"Clear their six" still shown with none in');
  await close(); });

t('BATTLE-04', 'recent opponents: a past six is one tap away, and survives reload when signed in', async () => {
  const {ui, acct, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  await ui.pickTournamentTeam(1); const B = await ui.opponents();
  const rec = await ui.recentOpponents(); expect(rec.length >= 1, 'no recent opponents row');
  const label = rec.find(l => OPP.every(n => has(l, n))); expect(label, 'six A not offered: ' + JSON.stringify(rec));
  expect(!rec.some(l => B.every(n => has(l, n))), 'the current six is offered as a recent opponent');
  await ui.loadRecentOpponent(rec.indexOf(label));
  const now = await ui.opponents(); expect(OPP.every(n => now.includes(n)), 'six A not loaded back: ' + now.join(','));
  expect(/Recent opponent loaded/i.test(await ui.toast()), 'no "Recent opponent loaded" toast');
  await ui.pg.waitForTimeout(1200); const a = await acct(); expect(a && Array.isArray(a.recentOpp) && a.recentOpp.length >= 1, 'recent opponents not saved to the account');
  await ui.reload(); await ui.go('Battle');
  expect((await ui.recentOpponents()).some(l => B.every(n => has(l, n))), 'recent opponents lost after reload (signed in)');
  await close(); });

t('BATTLE-05', '"Practice against a top team" loads a tournament six; select resets when the six changes', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Battle');
  const opts = await ui.tournamentTeams(); expect(opts && opts.length > 20, 'tournament team list missing or short');
  expect(/Pick a tournament team/i.test(opts[0]), 'first choice is not "Pick a tournament team…"');
  await ui.pickTournamentTeam(1);
  expect((await ui.opponents()).length === 6, 'their six not filled');
  expect(/Loaded .+ team as the opponent/i.test(await ui.toast()), 'no "Loaded … team as the opponent" toast');
  expect(await ui.sees('Their real open team sheet'), 'head does not say "Their real open team sheet"');
  const one = (await ui.opponents())[2]; await ui.removeOpponent(one);
  expect(/Pick a tournament team/i.test(await ui.tournamentTeamChosen()), 'select did not go back to "Pick a tournament team…"');
  await close(); });

t('BATTLE-06', '"Copy for Showdown" for their open team sheet copies six full sets', async () => {
  const {ui, ctx, pg, close} = await open({team: TEAM}); await ui.go('Battle');
  expect(!(await ui.sees('Their open team sheet')), 'copy shown before a known sheet is loaded');
  await ui.pickTournamentTeam(1); expect(await ui.sees('Their open team sheet'), 'no "Their open team sheet" after loading a sheet');
  try { await ctx.grantPermissions(['clipboard-read', 'clipboard-write']); } catch (e) {}
  await pg.evaluate(() => { window.__copied = null; const c = navigator.clipboard; if (c) c.writeText = async s => { window.__copied = s; }; });
  await ui.tapIn('Copy for Showdown', 600);
  let txt = await pg.evaluate(() => window.__copied || (document.querySelector('#sdSheet textarea') || {}).value || '');
  const toastT = await ui.toast(1000);
  expect(txt || /Copied/i.test(toastT), 'nothing copied and no sheet shown');
  if (txt) { expect((txt.match(/Ability:/g) || []).length === 6, 'copied text is not six full sets'); expect(/^- /m.test(txt), 'copied sets have no moves'); }
  await close(); });

t('BATTLE-07', 'empty and partial states: under 4 of yours, none of theirs, then the plan fills in', async () => {
  { const {ui, close} = await open({team: TEAM.slice(0, 3)}); await ui.go('Battle');
    expect(await ui.sees('Add at least 4 Pokémon on My team first'), 'no "Add at least 4" message with 3');
    await ui.tapIn('Go to My team'); expect(await ui.current() === 'report', '"Go to My team" did not open My team'); await close(); }
  const {ui, close} = await open({team: TEAM.slice(0, 4)}); await ui.go('Battle');
  expect(await ui.sees('Type their Pokémon as you see them at team preview. Everything below fills in as you go.'), 'no "Type their Pokémon…" message with 4 and none of theirs');
  expect(!(await ui.sees(/bring these four/i)), 'plan shows with none of theirs');
  await ui.enterOpponents(['Kingambit', 'Pelipper']); const tx = await ui.pageText();
  hasAll(tx, ['The read', 'Bring these four', 'Turn one, in move order'], 'Battle with 2 of theirs');
  await close(); });

t('BATTLE-08', 'The read: your lead, their likely lead, biggest threat, Fake Out count', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); const tx = await ui.pageText();
  expect(/The read/i.test(tx), 'no "The read"');
  expect(/Your lead Mega Charizard Y \+ Rillaboom/i.test(tx), 'your lead not "Mega Charizard Y + Rillaboom"');
  expect(/Their likely lead Indeedee \(F\) \+ Pelipper/i.test(tx), 'their likely lead not "Indeedee (F) + Pelipper"');
  expect(/Biggest threat Farigiraf,? Trick Room/i.test(tx), 'biggest threat not "Farigiraf, Trick Room"');
  expect(/\b0 Fake Out on their side/i.test(tx), 'no "0 Fake Out on their side"');
  await ui.removeOpponent('Farigiraf'); expect(!/Biggest threat Farigiraf/i.test(await ui.pageText()), 'The read did not update after removing Farigiraf');
  await close(); });

t('BATTLE-09', 'Plan / Speed / Damage switch filters cards on phones; hidden on desktop where all cards show', async () => {
  { const {ui, close} = await open({team: TEAM, opp: OPP, width: 390}); await ui.go('Battle');
    expect(await ui.planSwitchShown(), 'phone: switch not shown');
    await ui.planSwitch('Speed'); let tx = await ui.text();
    expect(has(tx, 'Who moves first') && !/bring these four/i.test(tx) && !has(tx, 'Damage both ways'), 'phone Speed: not only the speed card');
    await ui.planSwitch('Damage'); tx = await ui.text();
    expect(has(tx, 'Damage both ways') && !has(tx, 'Who moves first') && !/bring these four/i.test(tx), 'phone Damage: not only the damage card');
    await ui.planSwitch('Plan'); tx = await ui.text();
    expect(/bring these four/i.test(tx) && has(tx, 'From real games') && /watch out/i.test(tx) && has(tx, 'Turn one') && !has(tx, 'Who moves first'), 'phone Plan: not the plan cards');
    await close(); }
  const {ui, close} = await open({team: TEAM, opp: OPP, width: 1280}); await ui.go('Battle');
  expect(!(await ui.planSwitchShown()), 'desktop: the Plan/Speed/Damage switch is shown');
  const tx = await ui.text(); expect(/bring these four/i.test(tx) && has(tx, 'Who moves first') && has(tx, 'Damage both ways'), 'desktop: not all cards show');
  await close(); });

t('BATTLE-10', 'Bring these four, lead the pair; one-Mega note when two Megas come', async () => {
  { const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); const tx = await ui.pageText();
    hasAll(tx, ["NastyPlot's pick", 'Bring these four. Lead the pair.', 'Tested on 13,000 ladder games'], 'Bring card');
    expect(/Lead Mega Charizard Y Rillaboom Back Incineroar Whimsicott/i.test(tx), 'Lead/Back not Mega Charizard Y + Rillaboom / Incineroar + Whimsicott');
    expect(/Leave home: Garchomp, Sneasler/i.test(tx), 'no "Leave home: Garchomp, Sneasler"'); await close(); }
  const {ui, close} = await open({team: MEGAS, opp: OPP2}); await ui.go('Battle');
  expect(await ui.sees('Only one Mega can Mega Evolve this battle'), 'no one-Mega note with two Megas brought');
  await close(); });

t('BATTLE-11', 'From real games: approved verdict words, "so far" under six, gone under four', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle');
  const card = async () => { const tx = await ui.pageText(); const i = tx.indexOf('From real games'); return i < 0 ? null : tx.slice(i, i + 260); };
  let c = await card(); expect(c, 'no "From real games" card');
  expect(/39,052 tournament games/.test(c), 'games count not shown');
  expect(/\b(Favoured|Even match|Unfavoured)\b/.test(c), 'verdict is not Favoured / Even match / Unfavoured: ' + c.slice(0, 80));
  expect(!/\b(Favored|Slight edge|Slightly behind|Behind)\b/.test(c), 'old verdict words still used: ' + c.slice(0, 80));
  expect(/(Helps you|Hurts you)[^]*Your .+ vs their /i.test(c) || /No Pokémon pairing here stands out/i.test(c), 'no pair lines');
  await ui.removeOpponent('Kingambit'); await ui.removeOpponent('Pelipper');
  c = await card(); expect(c && /so far/i.test(c), 'with 4 of theirs the verdict does not say "so far"');
  await ui.removeOpponent('Archaludon'); expect(!(await card()), 'card still shows with 3 of theirs');
  await close(); });

t('BATTLE-12', 'Watch out fold lists what shuts you down; open/closed remembered', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle');
  expect(/Watch out.*\d of their six can shut something down/i.test(await ui.pageText()), 'Watch out title missing its count');
  await ui.openFold('Watch out'); const f = await ui.foldText('Watch out');
  hasAll(f, ['Farigiraf', 'Trick Room', 'Armor Tail'], 'Watch out');
  await ui.openFold('Watch out', false); await ui.reload(); await ui.go('Battle');
  expect(await ui.isFoldOpen('Watch out') === false, 'Watch out did not stay closed after reload');
  await ui.openFold('Watch out'); await ui.reload(); await ui.go('Battle');
  expect(await ui.isFoldOpen('Watch out') === true, 'Watch out did not stay open after reload');
  await close(); });

t('BATTLE-13', 'Turn one in move order with the planned moves, KO warning and field', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); const tx = await ui.pageText();
  expect(/Turn one, in move order your Mega Charizard Y \+ Rillaboom vs their likely Indeedee \(F\) \+ Pelipper/i.test(tx), 'turn one title wrong');
  expect(/1 You: Rillaboom 107 Speed, \+3 Fake Out Pelipper/i.test(tx), 'step 1 is not Rillaboom Fake Out on Pelipper');
  expect(/2 You: Mega Charizard Y \d+ Speed Weather Ball/i.test(tx), 'step 2 is not Mega Charizard Y Weather Ball');
  expect(/3 Them: .+4 Them: /i.test(tx), 'steps 3-4 are not theirs');
  expect(/Watch Pelipper's Weather Ball can KO Rillaboom\. Consider Protect\./i.test(tx), 'no KO warning');
  expect(/Field on turn 1 sun \+ Psychic Terrain \(Mega Charizard Y\)/i.test(tx), 'no field line');
  await ui.clearOpponents(); await ui.enterOpponents(['Kingambit']);
  expect(!/Turn one, in move order/i.test(await ui.pageText()), 'turn one shows with 1 of theirs');
  await close(); });

t('BATTLE-14', 'Who moves first: Trick Room reverses the order, their Tailwind doubles their Speed', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle');
  const o0 = await ui.battleSpeedOrder(); expect(o0 && o0.length >= 8, 'speed list not read: ' + JSON.stringify(o0));
  expect(o0[0].speed >= o0[o0.length - 1].speed, 'list not fastest first');
  await ui.tapIn("Trick Room", 500); const o1 = await ui.battleSpeedOrder();
  expect(await ui.sees('slowest moves first'), 'subtitle did not change to "slowest moves first"');
  expect(o1[0].speed <= o1[o1.length - 1].speed, 'Trick Room did not reverse the list');
  await ui.tapIn("Trick Room", 500); const king0 = (await ui.battleSpeedOrder()).find(r => r.name === 'Kingambit');
  await ui.tapIn("Their Tailwind", 500); const king1 = (await ui.battleSpeedOrder()).find(r => r.name === 'Kingambit');
  expect(king0 && king1 && king1.speed === king0.speed * 2, `their Tailwind: Kingambit ${king0 && king0.speed} -> ${king1 && king1.speed}`);
  expect(/Fake Out \+3 \(Incineroar\)/.test(await ui.pageText()) && /Trick Room −7 \(Farigiraf\)/.test(await ui.pageText()), 'priority line missing');
  await close(); });

t('BATTLE-15', 'Damage both ways: Rain changes Water and Fire hits; Intimidate lowers your physical hits', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  const g0 = await ui.damageGrid(); expect(g0 && has(g0, 'Damage both ways'), 'no damage grid');
  await ui.tapIn(/^Rain$/, 500); const g1 = await ui.damageGrid();
  expect(pctOf(g1, ['Flare Blitz']) < pctOf(g0, ['Flare Blitz']), 'Rain did not lower Fire hits');
  expect(pctOf(g1, ['Wave Crash']) > pctOf(g0, ['Wave Crash']), 'Rain did not raise Water hits');
  await ui.tapIn(/^Leads: /, 400); const g2 = await ui.damageGrid();
  await ui.tapIn("You're Intimidated", 500); const g3 = await ui.damageGrid();
  expect(pctOf(g3, ['Earthquake', 'Dragon Claw', 'High Horsepower']) < pctOf(g2, ['Earthquake', 'Dragon Claw', 'High Horsepower']) , 'Intimidate did not lower your physical hits');
  await close(); });

t('BATTLE-16', 'Damage calc card: tap one of yours to open the calc against their first Pokémon', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  expect(await ui.sees(/Pick an attacker to hit their Incineroar/i), 'card does not name their first Pokémon');
  await ui.tapIn(/^Garchomp$/, 800);
  expect(await ui.current() === 'calc', 'calc did not open'); const s = await ui.calcSides();
  expect(s.a === 'Garchomp' && s.d === 'Incineroar', 'calc pair is ' + JSON.stringify(s));
  await close(); });

t('BATTLE-17', 'Team preview practice entry opens Practice', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  await ui.tapIn('Team preview practice'); expect(await ui.current() === 'practice', 'Practice did not open'); await close(); });

t('BATTLE-18', 'Deeper read: archetype matchup, their threats, full 6×6 matchup grid', async () => {
  { const {ui, close} = await open({team: TEAM}); await ui.go('Battle'); await ui.openFold('Deeper read');
    expect(await ui.sees('Add their Pokémon above first'), 'empty Deeper read message missing'); await close(); }
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Deeper read');
  const f = await ui.foldText('Deeper read');
  hasAll(f, ['Archetype matchup', 'Rain', 'Psychic Terrain', 'Likely lead: Indeedee (F) + Pelipper', 'Their threats'], 'Deeper read');
  expect(/\b(Edge|Watch|Note)\b/.test(f), 'no Edge/Watch/Note rows');
  await ui.openFold('Full matchup grid'); const g = await ui.foldText('Full matchup grid');
  expect((g.match(/[+-]\d+\.\d\d/g) || []).length >= 36, 'full grid is not 6×6 signed numbers');
  await close(); });

t('BATTLE-20', '"?" tips explain, long notes fold behind "More"', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  const b = await ui.openHelp('What the calc counts'); expect(b && b.length > 20, 'no help bubble for "What the calc counts"');
  const before = await ui.damageGrid(); await ui.tap('More', '[data-pane=matchup]'); const after = await ui.damageGrid();
  expect(after.length > before.length + 40 && /Less/.test(after), '"More" did not show the rest of the legend');
  await close(); });

// ============================== LOG: logging games and your record ==============================
const REPLAY = me => ['|player|p1|Alpha|1', '|player|p2|Bravo|2', '|gametype|doubles',
  ...['Charizard', 'Garchomp', 'Incineroar', 'Whimsicott', 'Rillaboom', 'Sneasler'].map(n => `|poke|p1|${n}, L50|`),
  ...OPP2.map(n => `|poke|p2|${n.replace('-F', '-F')}, L50|`), '|start',
  '|switch|p1a: Zard|Charizard, L50|100/100', '|switch|p1b: Bloom|Rillaboom, L50|100/100', '|switch|p2a: A|Kingambit, L50|100/100', '|switch|p2b: B|Pelipper, L50|100/100',
  '|turn|1', '|switch|p1a: Roar|Incineroar, L50|100/100', '|turn|2', '|switch|p1b: Whim|Whimsicott, L50|100/100', '|turn|3', `|win|${me ? 'Alpha' : 'Bravo'}`].join('\n');

t('LOG-01', 'Battle log is pre-filled with the plan\'s four in order; picks update the order line', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
  let c = await ui.logChips(); const on = c.filter(x => x.on);
  expect(on.length === 4, 'not four pre-picked: ' + JSON.stringify(c));
  const ord = n => (c.find(x => x.name === n) || {}).order;
  expect(ord('Mega Charizard Y') === 'Lead 1' && ord('Rillaboom') === 'Lead 2' && ord('Incineroar') === 'Back 3' && ord('Whimsicott') === 'Back 4', 'chips do not match "Bring these four": ' + JSON.stringify(c));
  let f = await ui.foldText('Battle log'); expect(/Filled in from the plan/i.test(f) && /saved with their 6/i.test(f), 'no "Filled in from the plan … saved with their 6"');
  expect(/Order: lead Mega Charizard Y \+ Rillaboom, back Incineroar \+ Whimsicott/i.test(f), 'order line wrong');
  await ui.logPick('Whimsicott'); f = await ui.foldText('Battle log'); expect(/3\/4 picked/.test(f), 'no "3/4 picked" after tapping one off');
  await ui.logPick('Sneasler'); f = await ui.foldText('Battle log'); expect(/4\/4 picked/.test(f), 'no "4/4 picked"');
  expect(/back Incineroar \+ Sneasler/i.test(f), 'order line did not update');
  await close();
  { const {ui, close} = await open({team: TEAM.slice(0, 3), opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
    expect(await ui.sees('Add at least 4 Pokémon to your team to log a battle'), 'no under-4 message in Battle log'); await close(); } });

t('LOG-02', 'Win/Loss disabled until four are picked; Win logs the game, saved and kept after reload', async () => {
  const {ui, acct, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
  await ui.logPick('Whimsicott'); expect(await ui.logResultEnabled('W') === false, 'Win enabled with 3 picked');
  await ui.logPick('Sneasler'); expect(await ui.logResultEnabled('W') === true, 'Win not enabled with 4 picked');
  await ui.logResult('W'); expect(/Win logged/i.test(await ui.toast()), 'no "Win logged" toast');
  expect(/1[–-]0/.test(await ui.pageText()), 'record does not read 1-0');
  await ui.pg.waitForTimeout(1200); const a = await acct(); const g = a && a.log && a.log[a.log.length - 1];
  expect(g && g.r === 'W' && g.b.length === 4 && g.b[0] === 'Charizard-Mega-Y' && g.tm.length === 6 && g.o.includes('Farigiraf'), 'game not saved with result, four in order, six and their six: ' + JSON.stringify(g));
  await ui.reload(); await ui.go('Battle'); expect(/1[–-]0/.test(await ui.pageText()), 'record lost after reload');
  await close(); });

t('LOG-03', 'Your record: overall %, this team, lead pairs after games', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
  expect(await ui.sees('No battles logged yet'), 'empty record message missing');
  await ui.logResult('W'); await ui.logResult('W'); await ui.logResult('L');
  const f = await ui.foldText('Battle log');
  expect(/2-1 overall,? 67%/i.test(f), 'no "2-1 overall · 67%": ' + f.slice(0, 300));
  expect(/2-1 this team/i.test(f), 'no "this team" record');
  expect(/3 battles logged/i.test(f), 'no "3 battles logged"');
  expect(/Lead pairs/i.test(f) && /Mega Charizard Y \+ Rillaboom/i.test(f), 'no lead pair row');
  expect(/Your Pokémon/i.test(f), 'no "Your Pokémon" bars');
  await close(); });

t('LOG-04', 'delete a logged game from Recent battles', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
  await ui.logResult('W'); await ui.logResult('L');
  await ui.deleteBattle(0); expect(/Battle deleted/i.test(await ui.toast()), 'no "Battle deleted" toast');
  const g = await ui.savedGames(); expect(g.length === 1 && g[0].r === 'W', 'the newest game was not the one deleted: ' + JSON.stringify(g));
  expect(/1-0 overall/i.test(await ui.foldText('Battle log')), 'record did not drop by one');
  await close(); });

t('LOG-05', 'log a game from a Showdown replay (paste or file); errors for bad logs', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Battle');
  await ui.pasteReplay('hello'); expect(/No battle log found/i.test(await ui.replayMessage()), 'no "No battle log found" error');
  await ui.pasteReplay(REPLAY(true).replace(/\|win\|.*$/, '')); expect(/no result yet/i.test(await ui.replayMessage()), 'no "no result yet" error');
  await ui.pasteReplay(REPLAY(true));
  const m = await ui.replayMessage(); expect(/^Win logged: Alpha vs Bravo, you brought Mega Charizard Y, Rillaboom, Incineroar, Whimsicott/i.test(m), 'replay result line: ' + m);
  expect(/Win logged from replay/i.test(await ui.toast()), 'no "Win logged from replay" toast');
  let g = await ui.savedGames(); expect(g.length === 1 && g[0].o.includes('Farigiraf'), 'replay game not saved with their six');
  const f = HERE + `_replay-${process.pid}.html`; fs.writeFileSync(f, '<html><body><script type="text/plain" class="battle-log-data">' + REPLAY(false) + '</script></body></html>');
  try { await ui.uploadReplay(f); } finally { fs.unlinkSync(f); }
  expect(/^Loss logged/i.test(await ui.replayMessage()), 'replay file not logged: ' + await ui.replayMessage());
  g = await ui.savedGames(); expect(g.length === 2, 'file replay not saved');
  await close();
  { const {ui, close} = await open({team: ['Absol', 'Azumarill', 'Kingambit', 'Basculegion', 'Archaludon', 'Pelipper']}); await ui.go('Battle');
    await ui.pasteReplay(REPLAY(true)); expect(/Neither side matches your current team/i.test(await ui.replayMessage()), 'no "Neither side matches" error'); await close(); } });

t('LOG-06', '"Your games · this six" on My team: log a loss with leads, then Undo', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('My Team', 1200);
  expect(/Your games:? this six/i.test(await ui.quickLogText()) && /None logged yet/i.test(await ui.quickLogText()), 'card missing or not "None logged yet"');
  await ui.quickLogOpen(); expect(/Your two leads/i.test(await ui.quickLogText()), 'panel did not open');
  await ui.quickLogLead('Garchomp'); await ui.quickLogLead('Incineroar'); await ui.quickLogResult('L');
  let q = await ui.quickLogText(); expect(/Loss logged/i.test(q) && /Undo/i.test(q), 'no "Loss logged. Undo"');
  expect(/0[–-]1/.test(q), 'card does not read 0-1');
  const g = await ui.savedGames(); expect(g.length === 1 && g[0].r === 'L' && g[0].b.join() === 'Garchomp,Incineroar', 'saved game wrong: ' + JSON.stringify(g));
  await ui.quickLogUndo(); q = await ui.quickLogText(); expect(/None logged yet/i.test(q), 'Undo did not remove the game');
  await close(); });

t('LOG-07', 'a logged win shows on Home as "1–0"', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log'); await ui.logResult('W');
  await ui.go('Home', 900); expect(/1[–-]0/.test(await ui.pageText()), 'Home does not show the 1–0 record'); await close(); });
