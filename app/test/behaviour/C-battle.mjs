// Behaviour tests, group C: Battle pages (docs/rebuild/inventory/C-battle.md). One test per inventory entry, keyed by its ID,
// written from the player's side. Talks to the page only through the adapter (adapters/<name>.mjs + adapters/<name>.C-battle.mjs).
// Run: node app/test/behaviour/run.mjs C-battle [--only=ID,ID]
import fs from 'node:fs'; import {group, open, TEAM, OPP, expect, HERE, tests} from './harness.mjs';
const t = group('C-battle');
const NEW = (process.env.ADAPTER || 'current') === 'v2'; // the rebuild: words from the approved mock-up (docs/rebuild/mocks/battle.tpl.html)

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
  { const {ui, close} = await open({team: []}); await ui.go('Battle'); const tx = await ui.pageText();
    if (NEW) expect(/Battle a team · Team preview/.test(tx) && /Who are you facing\? Plan the match\./.test(tx), 'empty head is not the mock-up\'s "Battle a team · Team preview / Who are you facing? Plan the match.": ' + tx.slice(0, 120));
    else expect(/team preview/i.test(tx) && /your team\s+vs\s+their six/i.test(tx), 'empty Battle head is not "Team preview · Your team vs their six": ' + tx.slice(0, 120)); await close(); }
  const {ui, close} = await open({team: TEAM}); await ui.go('Battle'); let tx = await ui.pageText();
  if (NEW) { /* mock-up: the typing help sits in the Their six sheet (Sim, Nov 12, Q2 = A); the head names the team once a sheet is in */
    await ui.enterOpponents(['Kingambit']); tx = await ui.pageText(); expect(/Bring these four\. Lead the pair\./.test(tx), 'no plan head with 1 of theirs');
    await ui.pickTournamentTeam(1); tx = await ui.pageText(); hasAll(tx, ['Battle a team · Their real open team sheet', 'Champion', 'players'], 'real-sheet head');
    await close(); return; }
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
  await ui.reloadSignedIn(true); await ui.go('Battle');
  expect((await ui.opponents()).includes('Pelipper'), 'their six lost after reload (signed in, from the account)');
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
  await ui.reloadSignedIn(true); await ui.go('Battle');
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
  const {ui, ctx, close} = await open({team: TEAM}); await ui.go('Battle');
  const SHEET = NEW ? 'Their real open team sheet' : 'Their open team sheet'; /* new build: the head's kicker says it (mock-up), beside Copy for Showdown */
  expect(!(await ui.sees(SHEET)), 'copy shown before a known sheet is loaded');
  if (NEW) expect(!(await ui.sees('Copy for Showdown')), 'Copy for Showdown shown before a known sheet is loaded');
  await ui.pickTournamentTeam(1); expect(await ui.sees(SHEET), `no "${SHEET}" after loading a sheet`);
  try { await ctx.grantPermissions(['clipboard-read', 'clipboard-write']); } catch (e) {}
  await ui.watchClipboard(); await ui.tapIn('Copy for Showdown', 600);
  const txt = await ui.copiedText();
  const toastT = await ui.toast(1000);
  expect(txt || /Copied/i.test(toastT), 'nothing copied and no sheet shown');
  if (txt) { expect((txt.match(/Ability:/g) || []).length === 6, 'copied text is not six full sets'); expect(/^- /m.test(txt), 'copied sets have no moves'); }
  await close(); });

t('BATTLE-07', 'empty and partial states: under 4 of yours, none of theirs, then the plan fills in', async () => {
  { const {ui, close} = await open({team: TEAM.slice(0, 3)}); await ui.go('Battle');
    expect(await ui.sees('Add at least 4 Pokémon on My team first'), 'no "Add at least 4" message with 3');
    await ui.tapIn('Go to My team'); expect(await ui.current() === 'report', '"Go to My team" did not open My team'); await close(); }
  const {ui, close} = await open({team: TEAM.slice(0, 4)}); await ui.go('Battle');
  if (NEW) expect(await ui.sees('Everything below fills in once their six is in'), 'no "Everything below fills in…" message with 4 and none of theirs');
  else expect(await ui.sees('Type their Pokémon as you see them at team preview. Everything below fills in as you go.'), 'no "Type their Pokémon…" message with 4 and none of theirs');
  expect(!(await ui.sees(/bring these four/i)), 'plan shows with none of theirs');
  await ui.enterOpponents(['Kingambit', 'Pelipper']); const tx = await ui.pageText();
  hasAll(tx, ['The read', 'Bring these four', 'Turn one, in move order'], 'Battle with 2 of theirs');
  await close(); });

t('BATTLE-08', 'The read: your lead, their likely lead, biggest threat, Fake Out count', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); const tx = await ui.pageText();
  expect(/The read/i.test(tx), 'no "The read"');
  if (NEW) { /* mock-up: your lead is the Lead group of Your six, their likely lead is tagged on their six, The read keeps threat + Fake Out */
    expect(/Lead Mega Charizard Y \S+ Y Rillaboom/i.test(tx), 'your Lead group not Mega Charizard Y + Rillaboom');
    expect(/Pelipper Likely lead/.test(tx) && /Indeedee \(F\) Likely lead/.test(tx), 'their likely lead not tagged on Indeedee (F) + Pelipper');
    expect(/Biggest threat Farigiraf Trick Room/i.test(tx), 'biggest threat not "Farigiraf, Trick Room"'); }
  else { expect(/Your lead Mega Charizard Y \+ Rillaboom/i.test(tx), 'your lead not "Mega Charizard Y + Rillaboom"');
  expect(/Their likely lead Indeedee \(F\) \+ Pelipper/i.test(tx), 'their likely lead not "Indeedee (F) + Pelipper"');
  expect(/Biggest threat Farigiraf,? Trick Room/i.test(tx), 'biggest threat not "Farigiraf, Trick Room"'); }
  expect(/\b0 Fake Out on their side/i.test(tx), 'no "0 Fake Out on their side"');
  await ui.removeOpponent('Farigiraf'); expect(!/Biggest threat Farigiraf/i.test(await ui.pageText()), 'The read did not update after removing Farigiraf');
  await close(); });

t('BATTLE-09', 'Plan / Speed / Damage switch filters cards on phones; hidden on desktop where all cards show', async () => {
  if (NEW) { /* approved mock-up: no Plan/Speed/Damage switch; the plan shows on every width and the detail sits in three tabs, one open at a time */
    for (const width of [390, 1280]) { const {ui, close} = await open({team: TEAM, opp: OPP, width}); await ui.go('Battle');
      expect(/bring these four/i.test(await ui.text()), `${width}: plan not shown`);
      for (const [k, re] of [['Who moves first', /Who moves first[^]*Fastest first/i], ['Damage both ways', /Damage both ways[^]*Your four against their six/i]]) { await ui.openFold(k);
        const tx = await ui.text(); expect(re.test(tx), `${width}: ${k} tab did not open`); expect(await ui.pg.evaluate(() => document.querySelectorAll('.bt-pane').length) === 1, `${width}: more than one tab open`); }
      await close(); } return; }
  { const {ui, close} = await open({team: TEAM, opp: OPP, width: 390}); await ui.go('Battle');
    expect(await ui.planSwitchShown(), 'phone: switch not shown');
    const SPD = /Who moves first,? fastest first/i;
    await ui.planSwitch('Speed'); let tx = await ui.text();
    expect(SPD.test(tx) && !/bring these four/i.test(tx) && !has(tx, 'Damage both ways'), 'phone Speed: not only the speed card');
    await ui.planSwitch('Damage'); tx = await ui.text();
    expect(has(tx, 'Damage both ways') && !SPD.test(tx) && !/bring these four/i.test(tx), 'phone Damage: not only the damage card');
    await ui.planSwitch('Plan'); tx = await ui.text();
    expect(/bring these four/i.test(tx) && has(tx, 'From real games') && /watch out/i.test(tx) && has(tx, 'Turn one') && !SPD.test(tx) && !has(tx, 'Damage both ways'), 'phone Plan: not the plan cards');
    await close(); }
  const {ui, close} = await open({team: TEAM, opp: OPP, width: 1280}); await ui.go('Battle');
  expect(!(await ui.planSwitchShown()), 'desktop: the Plan/Speed/Damage switch is shown');
  const tx = await ui.text(); expect(/bring these four/i.test(tx) && /Who moves first,? fastest first/i.test(tx) && has(tx, 'Damage both ways'), 'desktop: not all cards show');
  await close(); });

t('BATTLE-10', 'Bring these four, lead the pair; one-Mega note when two Megas come', async () => {
  { const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); const tx = await ui.pageText();
    if (NEW) { hasAll(tx, ['Bring these four. Lead the pair.', 'Lead pair tested on 13,000 ladder games'], 'Bring head');
      expect(/Lead Mega Charizard Y \S+ Y Rillaboom [^]*Back Incineroar [^]*Whimsicott/i.test(tx), 'Lead/Back not Mega Charizard Y + Rillaboom / Incineroar + Whimsicott');
      expect(/Leave home Garchomp [^]*Sneasler/i.test(tx), 'no "Leave home: Garchomp, Sneasler"'); await close(); }
    else { hasAll(tx, ["NastyPlot's pick", 'Bring these four. Lead the pair.', 'Tested on 13,000 ladder games'], 'Bring card');
    expect(/Lead Mega Charizard Y Rillaboom Back Incineroar Whimsicott/i.test(tx), 'Lead/Back not Mega Charizard Y + Rillaboom / Incineroar + Whimsicott');
    expect(/Leave home: Garchomp, Sneasler/i.test(tx), 'no "Leave home: Garchomp, Sneasler"'); await close(); } }
  const {ui, close} = await open({team: MEGAS, opp: OPP2}); await ui.go('Battle');
  expect(await ui.sees('Only one Mega can Mega Evolve this battle'), 'no one-Mega note with two Megas brought');
  await close(); });

t('BATTLE-11', 'From real games: approved verdict words, "so far" under six, gone under four', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle');
  const card = async () => { const tx = await ui.pageText(); if (NEW) { /* Battle Q2 B (Sim, Nov 13): the verdict and game count are said once, at the top ('From real games' in the head); the section 'From Real Games' keeps the pairings */ const h = tx.indexOf('From real games'), sct = tx.lastIndexOf('From Real Games'); return h < 0 && sct < 0 ? null : (h >= 0 ? tx.slice(h, h + 120) : '') + ' ' + (sct >= 0 ? tx.slice(sct, sct + 260) : ''); } const i = tx.indexOf('From real games'); return i < 0 ? null : tx.slice(i, i + 260); }; /* new page: the head's verdict says it first */
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
  if (NEW) { /* approved mock-up: Watch out is always open beside The read (nothing to remember) */
    const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle');
    expect(/Watch out.*\d of their six can shut something down/i.test(await ui.pageText()), 'Watch out title missing its count');
    hasAll(await ui.foldText('Watch out'), ['Farigiraf', 'Trick Room', 'Armor Tail'], 'Watch out'); await close(); return; }
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
  expect((NEW ? /1 You Rillaboom · 107 Speed, \+3 priority Fake Out Pelipper/i : /1 You: Rillaboom 107 Speed, \+3 Fake Out Pelipper/i).test(tx), 'step 1 is not Rillaboom Fake Out on Pelipper'); /* new: the mock-up's step format */
  expect((NEW ? /2 You Mega Charizard Y · \d+ Speed Weather Ball/i : /2 You: Mega Charizard Y \d+ Speed Weather Ball/i).test(tx), 'step 2 is not Mega Charizard Y Weather Ball');
  expect((NEW ? /3 Them .+4 Them /i : /3 Them: .+4 Them: /i).test(tx), 'steps 3-4 are not theirs');
  expect(/Watch ?Pelipper's Weather Ball can KO Rillaboom\. Consider Protect\./i.test(tx), 'no KO warning');
  expect((NEW ? /Field on turn 1: sun \+ Psychic Terrain \(Mega Charizard Y\)/i : /Field on turn 1 sun \+ Psychic Terrain \(Mega Charizard Y\)/i).test(tx), 'no field line');
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
  if (NEW) { /* new page: Deeper read is a tab under the plan, offered once their Pokémon are in (mock-up); same content, the mock-up's words */
    { const {ui, close} = await open({team: TEAM}); await ui.go('Battle'); expect(!(await ui.sees('Deeper read')) && await ui.sees('Everything below fills in once their six is in'), 'Deeper read offered before their Pokémon are in'); await close(); }
    const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); const f = await ui.foldText('Deeper read');
    hasAll(f, ['Archetypes, their threats', 'You:', 'Them: Rain', 'Psychic Terrain', 'Pelipper:', '(super effective)'], 'Deeper read');
    expect(/\b(Edge|Watch|Note)\b/.test(f), 'no Edge/Watch/Note rows');
    expect(await ui.pg.evaluate(() => document.querySelectorAll('.bt-mg td').length) === 36, 'full grid is not 6×6');
    await close(); return; }
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
  expect((NEW ? /lead Mega Charizard Y \+ Rillaboom, back Incineroar \+ Whimsicott/i : /Order: lead Mega Charizard Y \+ Rillaboom, back Incineroar \+ Whimsicott/i).test(f), 'order line wrong'); /* new: the four sit in the mock-up's sentence */
  await ui.logPick('Whimsicott'); f = await ui.foldText('Battle log'); expect((NEW ? /3 of 4 picked/ : /3\/4 picked/).test(f), 'no "3 of 4 picked" after tapping one off'); /* new: the count shows once, on the four button (Sim, Battle Q2 B, Nov 13) */
  await ui.logPick('Sneasler'); f = await ui.foldText('Battle log'); expect(/4\/4 picked/.test(f), 'no "4/4 picked"');
  expect(/back Incineroar \+ Sneasler/i.test(f), 'order line did not update');
  await close();
  { const {ui, close} = await open({team: TEAM.slice(0, 3), opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
    expect(await ui.sees(NEW ? 'Add at least 4 Pokémon on My Team first' : 'Add at least 4 Pokémon to your team to log a battle'), 'no under-4 message in Battle log'); await close(); } }); /* new page: one under-4 message for the whole page */

t('LOG-02', 'Win/Loss disabled until four are picked; Win logs the game, saved and kept after reload', async () => {
  const {ui, acct, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
  await ui.logPick('Whimsicott'); expect(await ui.logResultEnabled('W') === false, 'Win enabled with 3 picked');
  await ui.logPick('Sneasler'); expect(await ui.logResultEnabled('W') === true, 'Win not enabled with 4 picked');
  await ui.logResult('W'); expect(/Win logged/i.test(await ui.toast()), 'no "Win logged" toast');
  expect(/1[–-]0/.test(await ui.pageText()), 'record does not read 1-0');
  await ui.pg.waitForTimeout(1200); const a = await acct(); const g = a && a.log && a.log[a.log.length - 1];
  expect(g && g.r === 'W' && g.b.length === 4 && g.b[0] === 'Charizard-Mega-Y' && g.tm.length === 6 && g.o.includes('Farigiraf'), 'game not saved with result, four in order, six and their six: ' + JSON.stringify(g));
  await ui.reloadSignedIn(true); await ui.go('Battle'); expect(/1[–-]0/.test(await ui.pageText()), 'record lost after reload (signed in, from the account)');
  await close(); });

t('LOG-03', 'Your record: overall %, this team, lead pairs after games', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
  expect(await ui.sees(NEW ? 'No games logged yet' : 'No battles logged yet'), 'empty record message missing'); /* new: the mock-up's words */
  await ui.logResult('W'); await ui.logResult('W'); await ui.logResult('L');
  const f = await ui.foldText('Battle log');
  expect(/2[–-]1 overall,?( ·)? 67%/i.test(f), 'no "2-1 overall · 67%": ' + f.slice(0, 300));
  expect(/2[–-]1 this team/i.test(f), 'no "this team" record');
  expect(/3 battles logged/i.test(f), 'no "3 battles logged"');
  expect(/Lead pairs/i.test(f) && /Mega Charizard Y \+ Rillaboom/i.test(f), 'no lead pair row');
  expect(/Your Pokémon/i.test(f), 'no "Your Pokémon" bars');
  await close(); });

t('LOG-04', 'delete a logged game from Recent battles', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle'); await ui.openFold('Battle log');
  await ui.logResult('W'); await ui.logResult('L');
  await ui.deleteBattle(0); expect(/Battle deleted/i.test(await ui.toast()), 'no "Battle deleted" toast');
  const g = await ui.savedGames(); expect(g.length === 1 && g[0].r === 'W', 'the newest game was not the one deleted: ' + JSON.stringify(g));
  expect(/1[–-]0 overall/i.test(await ui.foldText('Battle log')), 'record did not drop by one');
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
  { const {ui, close} = await open({team: ['Absol', 'Azumarill', 'Gholdengo', 'Sylveon', 'Venusaur', 'Milotic']}); await ui.go('Battle');
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

// ============================== CALC: Damage calc ==============================
t('CALC-01', 'Damage calc head and "How the calc works →" link', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  hasAll(await ui.pageText(), NEW ? ['Damage Calc · level 50 doubles', 'assumed spread'] /* Sim's 'Their Side' brief 10: the title is one small line, no big heading */ : ['Common sets, auto-filled', 'Damage calc', 'Level 50 doubles damage. Each side starts with its most common set.'], 'calc head');
  await ui.tapIn('How the calc works'); expect(await ui.current() === 'method', 'link did not open How we calculate');
  expect(await ui.sees(/damage/i), 'How we calculate does not show the damage section'); await close(); });

t('CALC-02', 'attacker/defender defaults and pickers grouped Your team / Top of the meta / Everyone', async () => {
  { const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
    let s = await ui.calcSides(); expect(s.a === 'Mega Charizard Y' && s.d === 'Sneasler', 'defaults are ' + JSON.stringify(s));
    const gr = await ui.calcPokemonGroups(); expect(/^Your team:6/.test(gr[0]) && /^Top of the meta:/.test(gr[1]) && /^Everyone:/.test(gr[2]) && +gr[2].split(':')[1] > 250, 'picker groups: ' + gr.join(','));
    if (NEW) expect(/\d+–\d+%/.test(await ui.calcResultOnly()) && / of \d+ HP/.test(await ui.calcResultOnly()), 'result: no range / HP line'); else hasAll(await ui.calcResultOnly(), ['% of HP'], 'result'); // brief 10: 'x–y of z HP' beside the range
    const r0 = await ui.calcResultOnly(); await ui.calcPick('defender', 'Incineroar'); s = await ui.calcSides();
    expect(s.d === 'Incineroar', 'defender not Incineroar'); expect(await ui.calcResultOnly() !== r0, 'result did not change for the new defender');
    expect(/Assumed spread|Estimated spread/i.test(await ui.pageText()), 'no "assumed/estimated spread" tag'); await close(); }
  const {ui, close} = await open({team: []}); await ui.go('Damage Calc');
  const s = await ui.calcSides(); expect(s.a === 'Garchomp' && s.d !== 'Garchomp', 'empty-team defaults are ' + JSON.stringify(s)); await close(); });

t('CALC-03', 'move strips and "Other moves" change the result', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  let st = await ui.calcMoveStrips(); expect(st.length >= 3 && st.find(x => x.on).move === 'Heat Wave', 'default move is not Heat Wave: ' + JSON.stringify(st));
  const r0 = await ui.calcResultOnly(); await ui.calcMove('Solar Beam');
  st = await ui.calcMoveStrips(); expect(st.find(x => x.on).move === 'Solar Beam', 'Solar Beam strip not pressed');
  const r1 = await ui.calcResultOnly(); expect(r1 !== r0, 'result did not change for Solar Beam');
  await ui.calcOtherMove('Air Slash'); expect((await ui.calcSides()).move === 'Air Slash' && await ui.calcResultOnly() !== r1, 'Other moves pick did not update the result');
  await close(); });

t('CALC-04', 'Set details: defender points kept legal (66 total); changing nature drops "assumed spread"', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  await ui.calcSet('defender', 'hp', 32); await ui.calcSet('defender', 'def', 32); await ui.calcSet('defender', 'spd', 32);
  const hp = +await ui.calcSetValue('defender', 'hp').then(x => parseInt(x)), df = +await ui.calcSetValue('defender', 'def').then(x => parseInt(x)), sd = +await ui.calcSetValue('defender', 'spd').then(x => parseInt(x));
  expect(sd === 32 && hp + df + sd === 66 && df === 2, `defender points ${hp}/${df}/${sd} not kept at 66 (Def should drop to 2)`);
  const nat = await ui.calcSetChoices('attacker', 'nature'); expect(nat.length === 21, '21 natures expected, got ' + nat.length);
  const items = await ui.calcSetChoices('attacker', 'item'); expect(items.some(i => /Charizardite Y/.test(i)), "a Mega's stone is not offered as its item");
  hasAll((await ui.calcSetChoices('defender', 'item')).join(','), ['None', 'Life Orb', 'Choice Scarf', 'Focus Sash', 'Sitrus Berry', 'Leftovers'], 'item list');
  const before = await ui.pageText(); const tags0 = (before.match(/Assumed spread/gi) || []).length;
  await ui.calcSet('attacker', 'nature', 'Timid'); const tags1 = ((await ui.pageText()).match(/Assumed spread/gi) || []).length;
  expect(tags1 < tags0, 'attacker "assumed spread" tag did not go away after changing its nature');
  await close(); });

t('CALC-05', 'Swap trades attacker and defender; move resets to the new attacker\'s', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  await ui.calcSwap(); const s = await ui.calcSides();
  expect(s.a === 'Sneasler' && s.d === 'Mega Charizard Y', 'swap gave ' + JSON.stringify(s));
  expect((await ui.calcMoveStrips()).some(x => x.move === 'Close Combat'), "Sneasler's own moves not shown"); await close(); });

t('CALC-06', 'field: weather follows the attacker\'s setter until you pick; Rain halves Fire', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  expect(await ui.isPressed('Sun') === true, 'Mega Charizard Y attacking: Sun not pressed by itself');
  const pct = r => +(((NEW ? /(\d+)–(\d+)%/ : /(\d+)–(\d+)% of HP/).exec(r) || [0, 0, 0])[2]);
  const sun = pct(await ui.calcResultOnly()); await ui.tapIn(/^Rain$/, 500); const rain = pct(await ui.calcResultOnly());
  expect(await ui.isPressed('Rain') === true, 'Rain not pressed'); expect(rain > 0 && rain < sun * 0.4, `Fire damage in rain ${rain}% vs sun ${sun}% (should be about a third: ×1.5 → ×0.5)`);
  await ui.calcPick('attacker', 'Garchomp'); expect(await ui.isPressed('Sun') === true && await ui.isPressed('Rain') === false, 'weather did not follow the new attacker (no setter: your team\'s sun)');
  for (const b of ['Hits both foes', 'Screen up', 'Helping Hand', 'Friend Guard', 'Critical hit']) expect(await ui.isPressed(b) !== null, `no "${b}" toggle`);
  const r0 = await ui.calcResultOnly(); await ui.tapIn('Critical hit', 500); expect(await ui.calcResultOnly() !== r0, 'Critical hit did not change the result');
  await close(); });

t('CALC-07', 'result: Sneasler Close Combat into Mega Charizard Y; Garchomp Earthquake into Corviknight is No effect', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  await ui.calcPick('attacker', 'Sneasler'); await ui.calcPick('defender', 'Mega Charizard Y'); await ui.calcMove('Close Combat');
  const r = await ui.calcResultOnly();
  expect((NEW ? /45–52%/ : /45–52% of HP/).test(r) && /20% chance to 2HKO/.test(r) && /Fighting is resisted/.test(r), 'result: ' + r.slice(0, 200)); // new calc: '% of HP' is shown as 'x–y of z HP' (brief 10)
  expect(/of 155 HP/.test(r) && /Fewest points to always survive/.test(r), 'HP numbers or survive line missing');
  await ui.calcPick('attacker', 'Garchomp'); await ui.calcPick('defender', 'Corviknight'); await ui.calcOtherMove('Earthquake').catch(() => ui.calcMove('Earthquake'));
  expect((NEW ? /No effect.*Corviknight is immune to Ground/ : /No effect\. Corviknight is immune to Ground/).test(await ui.calcResultOnly()), 'no "No effect" for Earthquake into Corviknight');
  await close(); });

t('CALC-08', '"Report a mistake" under the result opens feedback pre-filled with the calc', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  expect(await ui.sees('Report a mistake'), 'no "Report a mistake"');
  await ui.tapIn('Report a mistake', 800); const d = await ui.openDialog();
  expect(d && /Mega Charizard Y/.test(d) && /Sneasler/.test(d), 'feedback sheet not pre-filled with the calc: ' + (d || '').slice(0, 200)); await close(); });

t('CALC-09', 'best hits table: your hits on them / their hits on you', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  await ui.openFold('Your best hit on each top threat'); let f = await ui.foldText('Your best hit');
  expect(await ui.isPressed('Your hits on them') === true, '"Your hits on them" not chosen');
  expect((f.match(/\d+% /g) || []).length >= 6 * 12, 'table is not your six × 12+ threats');
  await ui.tapIn('Their hits on you', 500); expect(await ui.isPressed('Their hits on you') === true, '"Their hits on you" not chosen');
  expect(/Each top threat's best hit on your team/i.test(await ui.pageText()), 'heading did not change'); await close(); });

t('CALC-10', '"No effect" pinned mini bar jumps back to the result', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Damage Calc');
  await ui.calcPick('attacker', 'Garchomp'); await ui.calcPick('defender', 'Corviknight'); await ui.calcOtherMove('Earthquake').catch(() => ui.calcMove('Earthquake'));
  await ui.scrollToEnd();
  // new site: no pinned bar at all (Sim, Nov 14, Calc Q3 A: the pinned bar was switched off Nov 7; the No-effect one was a leftover)
  if (NEW) { expect(!(await ui.calcPinnedBar()), 'the new calc shows a pinned bar'); await close(); return; }
  const bar = await ui.calcPinnedBar(); expect(bar && /No effect/.test(bar), 'no pinned "No effect" bar while the result is off screen');
  await ui.tapCalcPinnedBar(); expect(await ui.calcResultOnScreen(), 'tapping the bar did not bring the result on screen'); await close(); });

// ============================== SPEED: Speed tiers ==============================
t('SPEED-01', 'Speed tiers head', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers');
  hasAll(await ui.pageText(), NEW ? ['Speed Tiers · level 50', 'Who moves first.', 'Fastest first, with each side'] /* approved mock-up (Speed Q1/Q2) */ : ['Speed tiers: level 50', 'Who moves first', 'Your six against the 20 most-used Pokémon, fastest first.'], 'Speed head'); await close(); });

t('SPEED-02', 'Trick Room puts the slowest first', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers');
  for (const b of NEW ? ['Your Tailwind', 'Their Tailwind', 'Them −1', "They're Paralyzed", 'Trick Room'] /* the mock-up's chip words */ : ['Your Tailwind', 'Their Tailwind', 'Their −1 Speed', "They're paralyzed", 'Trick Room']) expect(await ui.isPressed(b) === false, `toggle "${b}" missing or on`);
  await ui.tapIn(NEW ? /^List$/ : 'List view'); const r0 = await ui.speedRowText(); await ui.tapIn('Trick Room', 600); const r1 = await ui.speedRowText();
  const sp = r => +(/^(\d+)/.exec(r) || [0, 0])[1];
  expect(sp(r0[0]) > sp(r0[r0.length - 1]), 'list not fastest first'); expect(sp(r1[0]) < sp(r1[r1.length - 1]), 'Trick Room: slowest not first');
  expect(await ui.sees('Trick Room: the slowest moves first'), 'no Trick Room note'); await close(); });

t('SPEED-03', 'weather picker: Chlorophyll doubles Venusaur in sun only', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers'); await ui.tapIn(NEW ? /^List$/ : 'List view');
  expect(await ui.isPressed(NEW ? /^Your Weather \(sun\)/ : /^Your weather \(sun\)/) === true, '"Your weather (sun)" not chosen for a sun team');
  const ven = async () => (await ui.speedRowText()).find(r => / Venusaur /.test(' ' + r + ' ')) || '';
  await ui.tapIn('No weather', 500); const v0 = await ven(); await ui.tapIn(/^Sun$/, 500); const v1 = await ven();
  const sp = r => +(/^(\d+)/.exec(r) || [0, 0])[1];
  expect(sp(v1) === sp(v0) * 2, `Venusaur ${sp(v0)} -> ${sp(v1)} in sun`); expect(/Chlorophyll ×2 in sun/.test(v1) && !/Chlorophyll ×2/.test(v0), 'Chlorophyll note wrong'); await close(); });

t('SPEED-04', 'Your six vs the field: outspeed % per Pokémon, falls under their Tailwind', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers'); await ui.openFold('Your six vs the field');
  let f = await ui.foldText('Your six vs the field'); const p0 = [...f.matchAll(/outspeeds (\d+)% of the top 30 threats/g)].map(m => +m[1]);
  expect(p0.length === 6, 'not six lines: ' + f.slice(0, 200)); expect(/more Speed points .* outspeeds|can't outspeed/.test(f), 'no Speed point tip');
  await ui.tapIn('Their Tailwind', 600); f = await ui.foldText('Your six vs the field'); const p1 = [...f.matchAll(/outspeeds (\d+)% of the top 30 threats/g)].map(m => +m[1]);
  expect(p1.reduce((a, b) => a + b, 0) < p0.reduce((a, b) => a + b, 0) && /\(their Tailwind\)/.test(f), 'percentages did not fall with their Tailwind'); await close(); });

t('SPEED-05', 'race track / list view (remembered), markers open the info sheet, track scrolls on narrow screens', async () => {
  { const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers');
    expect(await ui.isPressed(NEW ? /^Track$/ : 'Race track') === true, 'Race track not the default');
    const o = await ui.speedOrder(); expect(o.length >= 20 + 6 - 1, 'track has too few markers: ' + o.length);
    const sh = await ui.openInfoSheet('Garchomp'); expect(/Garchomp/.test(sh), 'tapping Garchomp did not open its info sheet');
    await ui.pg.keyboard.press('Escape'); await ui.tapIn(NEW ? /^List$/ : 'List view'); await ui.reload(); await ui.go('Speed Tiers');
    expect(await ui.isPressed(NEW ? /^List$/ : 'List view') === true, 'List view not remembered after reload');
    const rows = await ui.speedRowText(); expect(rows.some(r => /You/.test(r) && /Speed points/.test(r)), 'list rows lack "YOU" tags or how the number was worked out'); await close(); }
  const {ui, pg, close} = await open({team: TEAM, width: 390}); await ui.go('Speed Tiers');
  if (!NEW) expect(await ui.sees(/(Swipe|Scroll) the track/i), 'no "Swipe the track" hint on a phone'); // the new phone track is vertical (Speed Q2/Q4): nothing scrolls sideways, so no hint
  expect(await ui.noSideScroll(), 'the page itself scrolls sideways'); await close(); });

t('SPEED-06', 'no team: message and "Go to My team"; footnote with its tip', async () => {
  { const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers');
    if (NEW) expect(await ui.sees('Level 50, 31 IVs.') && await ui.sees('Weather speed Abilities (Chlorophyll, Swift Swim, Sand Rush, Slush Rush) double Speed'), 'no footnote (the new page shows the tip\'s words in full)');
    else { expect(await ui.sees('Level 50, 31 IVs. Theirs assumed: common sets'), 'no footnote'); const h = await ui.openHelp('How speeds are worked out'); expect(h.length > 20, 'no footnote tip'); } await close(); }
  const {ui, close} = await open({team: []}); await ui.go('Speed Tiers');
  expect(await ui.sees(NEW ? 'Add Pokémon on My Team to place them against the top' : 'Add Pokémon on My team to place them against the top threats'), 'no empty message');
  expect(await ui.isPressed('Trick Room') === false, 'toggles hidden with no team');
  await ui.tapIn('Go to My team'); expect(await ui.current() === 'report', '"Go to My team" did not open My team'); await close(); });

// ============================== TYPES: Type chart ==============================
t('TYPES-01', 'pick up to two types (third replaces the older), Clear', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Type Chart');
  expect(JSON.stringify(await ui.pickedTypes()) === '["Fire","Flying"]', 'does not open on your first Pokémon\'s types: ' + await ui.pickedTypes());
  await ui.clearTypes(); expect((await ui.pickedTypes()).length === 0, 'Clear did not empty the pick');
  expect(await ui.sees('Pick one or two types above, or look up a Pokémon'), 'no empty hint after Clear');
  await ui.tapType('Water'); await ui.tapType('Fire'); await ui.tapType('Grass');
  expect(JSON.stringify((await ui.pickedTypes()).sort()) === '["Fire","Grass"]', 'third pick did not replace the oldest: ' + await ui.pickedTypes()); await close(); });

t('TYPES-02', 'look up a Pokémon: ability changes the defence (Heat Rotom, Levitate)', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Type Chart');
  await ui.lookUpPokemon('Heat Rot'); const tx = await ui.pageText();
  expect(/Showing Heat Rotom\s*,?\s*ability Levitate/i.test(tx), 'no "Showing Heat Rotom · ability Levitate"');
  expect((await ui.typesUnder('Immune') || []).includes('Ground'), 'Ground not under Immune');
  expect(/Levitate changes Ground from .+× to 0×/.test(tx), 'no "Levitate changes Ground from …× to 0×"'); await close(); });

t('TYPES-03', 'your team quick picks', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Type Chart');
  await ui.tapIn(/^Garchomp$/); expect(/Showing Garchomp\s*,?\s*ability Rough Skin \(from your team\)/i.test(await ui.pageText()), 'no "Showing Garchomp, ability Rough Skin (from your team)"');
  expect(await ui.isPressed('Garchomp') !== false, 'Garchomp not highlighted'); await close(); });

t('TYPES-04', 'Fire/Flying result: Rock 4× weak, Ground immune, STAB lines', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Type Chart'); await ui.clearTypes(); await ui.tapType('Fire'); await ui.tapType('Flying');
  expect(JSON.stringify(await ui.typesUnder('4× weak')) === '["Rock"]', '4× weak is not Rock: ' + JSON.stringify(await ui.typesUnder('4× weak')));
  expect((await ui.typesUnder('Immune') || []).includes('Ground'), 'Ground not immune');
  hasAll(await ui.pageText(), ['Everything not listed hits it for normal damage', 'Attacking with its own types', 'Fire attacks', '2× on'], 'type result'); await close(); });

t('TYPES-05', 'full type chart: 18×18 grid on wide screens, attacking-type picker on phones', async () => {
  { const {ui, close} = await open({team: TEAM}); await ui.go('Type Chart'); await ui.openFold('Full type chart');
    expect(await ui.typeGridShown(), 'no 18×18 grid on desktop'); expect(await ui.sees('Rows attack, columns defend'), 'no grid note'); await close(); }
  const {ui, close} = await open({team: TEAM, width: 390}); await ui.go('Type Chart'); await ui.openFold('Full type chart');
  await ui.tapAttackingType('Ghost'); const r = await ui.typeRowText();
  expect(/Super effective \(2×\) Psychic Ghost|Super effective \(2×\) Ghost Psychic/.test(r), 'Ghost 2×: ' + r);
  expect(/Not very effective \(½×\) Dark/.test(r) && /No effect \(0×\) Normal/.test(r), 'Ghost ½× / 0× wrong: ' + r); await close(); });

// ============================== TEST: Test run ==============================
t('TEST-01', 'Test run head and "How it works" fold', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun();
  hasAll(await ui.pageText(), ['The latest top tournament teams', 'Take a test run'], 'Test run head');
  await ui.openFold('How it works'); const f = await ui.foldText('How it works'); expect(f && f.length > 120 && /same calcs as your scouting report/i.test(f), 'How it works has no explanation'); await close(); });

t('TEST-02', 'Test run empty state under 4 Pokémon; falls back to built-in team lists without daily data', async () => {
  const {ui, close} = await open({team: TEAM.slice(0, 3)}); await ui.go('Test Run');
  expect(await ui.sees('Add at least 4 Pokémon on My team to run the gauntlet. You have 3.'), 'no "You have 3." message');
  await ui.tapIn('Go to My team'); expect(await ui.current() === 'report', '"Go to My team" did not open My team'); await close();
  // "no team data" message: not reachable today. Without meta/teams the page falls back to the proven team lists built into the
  // page itself (RESULTS), so the message never shows; checked Nov 10 with meta/teams and meta/results both missing.
  { const {ui, close} = await open({team: TEAM}); await ui.reloadWithout('meta/teams'); await ui.go('Test Run', 1500); await ui.waitTestRun();
    expect((await ui.testRunCards()).length >= 1, 'without the daily team data Test run shows no fallback teams'); await close(); } });

t('TEST-03', 'summary counts: better prepared / about even / they\'re better prepared', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun();
  const m = /(\d+) you're better prepared (\d+) about even (\d+) they're better prepared/.exec(await ui.pageText());
  expect(m && +m[1] + +m[2] + +m[3] === 20, 'summary counts missing or not adding to 20'); await close(); });

t('TEST-04', 'one card per top team, least prepared first, no-answer marks', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun();
  const c = await ui.testRunCards(); expect(c.length === 3, 'not 3 cards shown first: ' + c.length);
  const ready = c.map(x => +(/You: ready for (\d+) of their 6/.exec(x) || [0, 99])[1]);
  expect(ready[0] <= ready[1] && ready[1] <= ready[2], 'not least prepared first: ' + ready);
  expect(/Them: ready for \d+ of your 6/.test(c[0]) && /Bring .+ \+ .+ up front, .+ \+ .+ in back\./.test(c[0]), 'card lacks "Them: ready for" or the bring line');
  expect((await ui.testRunNoAnswer(0)).length >= 1 && /Watch /.test(c[0]), 'first card marks no Pokémon as "No answer"'); await close(); });

t('TEST-05', 'Matchup prep fold: level words for each Pokémon both ways (also MATCHUPS-07)', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun(); await ui.openFold('Matchup prep');
  const f = await ui.foldText('Matchup prep'); expect(/You against their six/i.test(f) && /Their six against yours/i.test(f), 'no two sides');
  const n = (f.match(/\b(No answer|Shaky|Handles it|Beats it)\b/g) || []).length; expect(n === 12, 'expected 6 + 6 level words, got ' + n);
  expect(!/\b(Well handled|Unanswered|Dangerous|Manageable)\b/.test(f), 'old level words used'); await close(); });

t('TEST-06', '"Practice in Battle mode" loads the team into Battle', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun();
  await ui.testRunPractice(0); expect(await ui.current() === 'matchup', 'Battle did not open');
  expect((await ui.opponents()).length === 6, 'their six not loaded'); expect(/Loaded as your opponent/i.test(await ui.toast()), 'no "Loaded as your opponent" toast');
  expect(await ui.sees('Their real open team sheet'), 'their sheet not named in the head'); await close(); });

t('TEST-07', '"Copy for Showdown" on a Test run card', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun();
  await ui.watchClipboard(); await ui.testRunCopy(0); const txt = await ui.copiedText();
  expect(/Copied/i.test(await ui.toast()) || txt, 'no "Copied…" toast'); if (txt) expect((txt.match(/Ability:/g) || []).length === 6, 'copied text is not six sets'); await close(); });

t('TEST-08', 'show more teams / show fewer', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun();
  await ui.tapIn('17 more teams'); expect((await ui.testRunCards()).length === 20, '20 cards not shown');
  await ui.tapIn('Show fewer'); expect((await ui.testRunCards()).length === 3, 'did not fold back to 3'); await close(); });

t('TEST-09', 'Test run footnote and its tip', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Test Run'); await ui.waitTestRun();
  expect(await ui.sees('Real damage calcs, least prepared matchups first'), 'no footnote');
  expect((await ui.openHelp('How each verdict is worked out')).length > 20, 'no footnote tip'); await close(); });

// ============================== PRAC: Team preview practice ==============================
t('PRAC-01', 'start screen: "Use my team" needs exactly six; real-team mode otherwise', async () => {
  { const {ui, close} = await open({team: TEAM}); await ui.go('Practice');
    hasAll(await ui.pageText(), ['Pick your four', 'Pick four and two leads against a real ladder team', 'From the Showdown ladder'], 'Practice start');
    expect(await ui.isPressed(/^Use my team/) === true, '"Use my team" not chosen with six'); await close(); }
  { const {ui, close} = await open({team: TEAM.slice(0, 4)}); await ui.go('Practice');
    expect(await ui.isPressed(/^Practice with a real team/) === true, '"Practice with a real team" not chosen with 4');
    expect(await ui.sees('Add six Pokémon on My team to use it (you have 4)'), 'no "you have 4" note');
    expect(await ui.sees('Go to My team'), 'no "Go to My team"'); await close(); }
  const {ui, close} = await open({team: TEAM}); await ui.reloadWithout('meta/practice'); await ui.go('Practice');
  expect(await ui.sees('Practice games appear after the next data refresh'), 'no "after the next data refresh" without data'); await close(); });

t('PRAC-02', 'pick four, then two leads; Reveal enabled only after 4 + 2', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Practice'); await ui.tapIn(/^Start/, 700);
  expect(/Their six\W*as seen at team preview/i.test(await ui.pageText()), 'their six not shown');
  expect(await ui.isDisabled('Reveal what strong players chose') === true, 'Reveal enabled before picking');
  for (const n of ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Rillaboom']) await ui.practicePick(n);
  expect(await ui.sees('Now tap two of your four to lead'), 'no "Now tap two of your four to lead"');
  await ui.practicePick('Whimsicott'); expect(/Four are picked/i.test(await ui.toast()), 'no "Four are picked" toast on a fifth');
  await ui.practicePick('Garchomp'); await ui.practicePick('Incineroar');
  expect(/Bringing .+ Leading Garchomp \+ Incineroar/i.test(await ui.pageText()), 'no "Bringing … Leading Garchomp + Incineroar" line');
  expect(await ui.isDisabled('Reveal what strong players chose') === false, 'Reveal not enabled after 4 + 2'); await close(); });

t('PRAC-03', 'reveal: banner, both fours, per-Pokémon bars, score saved, next team', async () => {
  const {ui, ls, close} = await open({team: TEAM}); await ui.go('Practice'); await ui.tapIn(/^Start/, 700);
  const six0 = await ui.pageText();
  for (const n of ['Charizard-Mega-Y', 'Garchomp', 'Incineroar', 'Rillaboom', 'Garchomp', 'Incineroar']) await ui.practicePick(n);
  await ui.tapIn('Reveal what strong players chose', 900); const tx = await ui.pageText();
  expect(/You matched the strong players' four|A different four from the strong players|No score this round/i.test(tx), 'no reveal banner');
  expect(/Your pick/i.test(tx) && /Strong players' four/i.test(tx), 'both fours not shown');
  expect(/Each of your six against this team/i.test(tx), 'no per-Pokémon bars');
  const sc = await ls('np.practice'); expect(sc && sc.played === 1, 'score not saved with played = 1: ' + JSON.stringify(sc));
  const six1 = (/as seen at team preview (.+?) (Strong|Ladder)/i.exec(await ui.pageText()) || [])[1];
  await ui.tapIn('Next team', 900); const tx2 = await ui.pageText(); expect(/Bring four 0\/4/i.test(tx2), 'Next team did not start a new pick');
  expect(six1 && !tx2.toLowerCase().includes(('as seen at team preview ' + six1).toLowerCase()), 'Next team shows the same six'); await close(); });

t('PRAC-04', 'score line after one round', async () => {
  const {ui, close} = await open({team: TEAM, stored: {'np.practice': JSON.stringify({streak: 1, best: 2, played: 1, matched: 1})}}); await ui.go('Practice');
  expect(/1 in a row,? 2 best,? 1 of 1 matched/i.test(await ui.pageText()), 'no score line "1 in a row · 2 best · 1 of 1 matched"'); await close(); });

// ============================== TRACK: Track record ==============================
t('TRACK-01', 'Track record head, stats and how it works', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Track Record'); const tx = await ui.pageText();
  hasAll(tx, ['Track record', 'How right have our ratings been?', 'tracking since', 'days of ratings saved', 'events checked so far', 'Ratings saved each morning', 'An event is played', 'Its top 8 compared', 'A fair test: the ratings never saw these events'], 'Track record'); await close(); });

t('TRACK-02', 'top-8 teams by rating band with a verdict line', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Track Record'); const tx = await ui.pageText();
  expect(/Top-8 teams, by the rating we gave/i.test(tx), 'no band card');
  expect((tx.match(/Rated (90\+|\d+–\d+|Under \d+) \d+ of \d+ Pokémon made a top 8/g) || []).length === 4, 'not four rating bands');
  expect(/Pokémon we rated 90\+ were on top-8 teams .+ as often as Pokémon we rated under/i.test(tx), 'no verdict line (34 events)'); await close(); });

t('TRACK-03', 'biggest hits / misses; tap a Pokémon for its sheet', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Track Record');
  hasAll(await ui.pageText(), ['Biggest hits', 'Biggest misses', 'Tap a Pokémon for its sheet'], 'Track record');
  const sh = await ui.openInfoSheet('Sneasler'); expect(/Sneasler/.test(sh), 'Sneasler sheet did not open'); await close(); });

t('TRACK-04', 'week by week chart with a line per band', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Track Record'); const tx = await ui.pageText();
  expect(/Week by week/i.test(tx) && /Rated 90\+ Rated 70–89/.test(tx), 'no week-by-week chart with band legend');
  expect(await ui.trackChartLines() >= 4, 'chart has no band lines'); await close(); });

t('TRACK-06', 'events checked fold and "How ratings work →"', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Track Record');
  await ui.openFold('Events checked'); const f = await ui.foldText('Events checked');
  expect(/\d+ events, newest first/.test(f) && /players/.test(f) && /ratings from/.test(f), 'events list wrong: ' + f.slice(0, 150));
  await ui.tapIn('How ratings work'); expect(await ui.current() === 'method', 'link did not open How we calculate'); await close(); });

t('TRACK-07', 'no data: "Collecting"', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.reloadWithout('meta/track'); await ui.go('Track Record');
  expect(await ui.sees("The first results appear here after the next morning's data refresh"), 'no "Collecting" message without data'); await close(); });

// ============================== MATCHUPS: threat lists (My team) ==============================
t('MATCHUPS-01', 'top 10 threats with real-games word and calc level; phones show 5 + "Show 5 more"; tap opens the sheet', async () => {
  { const {ui, close} = await open({team: TEAM}); await ui.go('My Team', 1200);
    const r = await ui.threatRows(); const top = r.filter(x => /^\d+ /.test(x));
    expect(top.length === 10, 'not 10 top threats on desktop: ' + top.length);
    expect(top.every(x => /\b(Favoured|Even match|Unfavoured)\b/.test(x) && /Calc: (Beats it|Handles it|Shaky|No answer)/.test(x)), 'a row lacks its words: ' + top.find(x => !/Calc:/.test(x)));
    expect(/Verdicts from real tournament games/.test(await ui.matchupsText()) && /The next 20, worst first/i.test(await ui.matchupsText()), 'intro or "next 20" missing');
    expect(r.length >= 30, 'next 20 tiles missing');
    await ui.tapThreat('Archaludon'); const s = await ui.scoutSheet(); expect(s && /Scouting report/i.test(s) && /Archaludon/.test(s), 'tapping a threat did not open the scouting sheet'); await close(); }
  const {ui, close} = await open({team: TEAM, width: 390}); await ui.go('My Team', 1200);
  expect((await ui.threatRows()).filter(x => /^\d+ /.test(x)).length === 5, 'phone does not show 5');
  await ui.tapIn('Show 5 more'); expect((await ui.threatRows()).filter(x => /^\d+ /.test(x)).length === 10, '"Show 5 more" did not show 10');
  expect(await ui.sees('Show top 5 only'), 'no "Show top 5 only"'); await close(); });

t('MATCHUPS-02', 'legend counts in the approved words', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('My Team', 1200); const m = await ui.matchupsText();
  const a = /Unfavoured (\d+),? Even match (\d+),? Favoured (\d+)/.exec(m), b = /Damage calc: No answer (\d+),? Shaky (\d+),? Handles it (\d+),? Beats it (\d+)/.exec(m);
  expect(a && b, 'legend rows missing: ' + m.slice(0, 200)); expect(+b[1] + +b[2] + +b[3] + +b[4] === 30, 'calc legend does not add to 30'); await close(); });

t('MATCHUPS-03', 'scouting report sheet: one threat at a time; Escape closes it', async () => {
  const {ui, pg, close} = await open({team: TEAM}); await ui.go('My Team', 1200); await ui.tapThreat('Archaludon');
  const s = await ui.scoutSheet(); hasAll(s, ['Scouting report', 'top 30 threats', 'Strength Score', 'Archaludon', 'Team checks'], 'scouting sheet');
  expect(/\d+ threats? need a plan|Ready for every top threat/i.test(s), 'no "<n> threats need a plan"');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(500); expect(!(await ui.scoutSheet()), 'Escape did not close the sheet'); await close(); });

t('MATCHUPS-04', 'your six vs the top 12 chart; tap a row for the full matchup', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('My Team', 1200); await ui.matchupsView('Top 12 grid');
  const m = await ui.matchupsText(); expect(/Rows are the top 12 threats/i.test(m) && /Tap one for the full matchup/i.test(m), 'chart text missing');
  expect(/✓ answers it/.test(m) && /✗ loses 1-on-1/.test(m), 'chart legend missing');
  const g = await ui.matchupGrid(); expect(g && g.rows === 12, 'chart is not 12 rows: ' + JSON.stringify(g));
  await ui.tapThreat('Farigiraf'); const s = await ui.scoutSheet(); expect(s && /Farigiraf/.test(s), 'tapping a row did not open the sheet on it'); await close(); });

t('MATCHUPS-05', 'threat preparation card: ready %, groups by level', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('My Team', 1200); await ui.matchupsView('All 30');
  const m = await ui.matchupsText(); expect(/Threat preparation/i.test(m) && /Ready for \d+% of the top 30 threats/.test(m), 'no "Ready for <x>% of the top 30 threats"');
  expect(/Shaky \d+ threats/.test(m) && /Handles it \d+ threats/.test(m) && /Beats it \d+ threats/.test(m), 'level groups missing'); await close(); });

t('MATCHUPS-06', 'meta threats list uses the scouting level words', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('My Team', 1200); await ui.matchupsView('All 30');
  const m = await ui.matchupsText(); const i = m.indexOf('Meta Pokémon that hit several of yours'); expect(i >= 0, 'meta threats list not shown');
  const part = m.slice(i, i + 1500); expect(/Hits \d+ of yours/.test(part), 'no "Hits <n> of yours"');
  expect(!/\b(Dangerous|Manageable)\b/.test(part), 'old pill words "Dangerous / Manageable" shown'); await close(); });

// ============================== cross-cutting ==============================
t('X-01', 'their six and your picks show as Pokémon art tiles', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  const n = await ui.opponentPictures();
  expect(n === 6, 'their six do not all show a sprite: ' + n); await close(); });

t('X-02', 'two- and three-choice switches show exactly one choice and move with a tap', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers');
  for (const [a, b] of [NEW ? [/^Track$/, /^List$/] : ['Race track', 'List view']]) { await ui.tapIn(b); expect(await ui.isPressed(b) === true && await ui.isPressed(a) === false, `${a}/${b} switch did not move`); }
  await ui.go('Damage Calc'); await ui.openFold('Your best hit'); await ui.tapIn('Their hits on you');
  expect(await ui.isPressed('Their hits on you') === true && await ui.isPressed('Your hits on them') === false, 'hits switch did not move'); await close(); });

t('X-03', 'folds remember open/closed per device (Speed tiers fold)', async () => {
  const {ui, close} = await open({team: TEAM}); await ui.go('Speed Tiers');
  const was = await ui.isFoldOpen('Your six vs the field'); await ui.openFold('Your six vs the field', !was);
  await ui.reload(); await ui.go('Speed Tiers'); expect(await ui.isFoldOpen('Your six vs the field') === !was, 'fold state not remembered'); await close(); });

t('X-04', 'a calc button stays under your finger when the page redraws', async () => {
  const {ui, pg, close} = await open({team: TEAM, width: 390}); await ui.go('Damage Calc');
  await ui.buttonTop('Rain', true); await pg.waitForTimeout(300);
  const y0 = await ui.buttonTop('Rain'); await ui.tapIn(/^Rain$/, 600); const y1 = await ui.buttonTop('Rain');
  expect(y0 != null && Math.abs(y1 - y0) <= 12, `Rain moved from ${y0} to ${y1} px`); await close(); });

t('X-05', 'browser Back closes an open sheet first, then steps back a page', async () => {
  const {ui, pg, close} = await open({team: TEAM}); await ui.go('Battle'); await ui.go('My Team', 1200); await ui.tapThreat('Archaludon');
  expect(await ui.scoutSheet(), 'sheet did not open'); await pg.goBack(); await pg.waitForTimeout(600);
  expect(!(await ui.scoutSheet()) && await ui.current() === 'report', 'Back did not close the sheet first');
  await pg.goBack(); await pg.waitForTimeout(600); expect(await ui.current() === 'matchup', 'second Back did not return to Battle: ' + await ui.current()); await close(); });

t('X-06', 'Battle toggles are not swallowed by the double-tap guard', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP}); await ui.go('Battle');
  await ui.doubleTap('Trick Room');
  expect(await ui.isPressed('Trick Room') === false && await ui.sees(/fastest first/i), 'second quick tap on Trick Room was ignored'); await close(); });

t('X-07', 'their six and the log update live from another device', async () => {}, {skip: "the kit's fake account fires onSnapshot once at load; a later remote change can't be pushed (kit change needed)"});

t('X-08', 'Battle text uses the site\'s punctuation (no " · " left in sentences)', async () => {
  const {ui, close} = await open({team: TEAM, opp: OPP2}); await ui.go('Battle');
  expect(!/\w · \w/.test(await ui.pageText()), '" · " separators left in Battle text'); await close(); });

t('X-09', 'keyboard: arrows + Enter pick in their six, Escape closes the list, Tab stays in the open sheet', async () => {
  const {ui, pg, close} = await open({team: TEAM}); await ui.go('Battle');
  await ui.typeOpponent(1, 'Ki'); const s = await ui.suggestions(); expect(s.length >= 2, 'not enough suggestions for "Ki"');
  await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(500);
  const got = (await ui.opponents())[0]; expect(got && s[1].startsWith(got) || (got && s[0].startsWith(got)), 'arrow + Enter did not pick a suggestion: ' + got);
  await ui.typeOpponent(2, 'Pel'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); expect((await ui.suggestions()).length === 0, 'Escape did not close the list');
  await ui.go('My Team', 1200); await ui.tapThreat('Archaludon');
  for (let k = 0; k < 25; k++) await pg.keyboard.press('Tab');
  expect(await ui.focusInSheet(), 'Tab left the open sheet'); await close(); });

// the rebuild: tests for pieces that wait for pages not rebuilt yet (rule C10: no links to pages that don't exist). Listed, never dropped.
if (NEW) { const WAIT = {'BATTLE-16': 'the calc picker comes with the Damage Calc page (not rebuilt yet)', 'BATTLE-17': 'the Practice entry comes with the Practice page (not rebuilt yet)',
  'BATTLE-20': 'the "What the calc counts" tip sits on the calc picker; the damage legend is shown in full, nothing behind "More"'};
  for (const T of tests()) if (T.group === 'C-battle' && WAIT[T.id]) T.skip = WAIT[T.id]; }
