import { card, sentence, w, step, head, links, page } from './lib.mjs';
// Real data: today's built Battle page (#battle) before their six is entered; claude/design6 built Nov 21 with the repo's data files.
const SIX = [['Charizard-Mega-Y', 'Mega Charizard Y'], ['Whimsicott'], ['Basculegion'], ['Kingambit'], ['Garchomp'], ['Sneasler']];
const body = links(['Damage Calculator ›', '~Battle', 'Team Preview Practice ›', 'Test Run ›', 'Speed Tiers ›', 'Type Chart ›']) +
  head({ kicker: 'BATTLE · THE GAME PLAN', h1: 'Who are you facing?<br><em>Plan the match.</em>', lead: 'Enter their six as you see them at team preview, or pick a top tournament team.' }) +
  sentence(`They brought ${w('their six ⌕')} or ${w('a top tournament team')}`, 'Blue words are buttons. <a class=link href=#>What is team preview? ›</a>') +
  step(1, 'The face-off', 'your six against theirs', '', `<p class=status style="margin:0">Your six</p><div class=roster>${SIX.map(([n, sh]) => card(n, { shown: sh })).join('')}</div>${links(['Change on My Team ›'])}
   <p class="vs u">VS</p><p class=status style="margin:0">Their six</p><div class="roster slots">${[1, 2, 3, 4, 5, 6].map(() => '<div class=slot><b class=u>?</b></div>').join('')}</div>
   <a class=go href=#>ENTER THEIR SIX.</a><p class=hint>Everything below fills in once their six is in: which four to bring, who leads, and turn one.</p>`) +
  step(2, 'Bring four, lead two', 'waiting for their six', '', '') + step(3, 'Turn one', 'waiting for their six', '', '') +
  step(4, 'Your games', 'none logged yet', '', `<p class=lead style="margin:0">After the match, log the result with your four: <b>0 of 4 picked</b> (tap to change).</p>${links(['Pick Your Four First ›', 'Log from a Showdown Replay ›'])}`) +
  step(5, 'More ways to prep', '', '', `<div class=grid4>${[['Team Preview Practice', 'Pick four and two leads against real ladder teams.'], ['Damage Calculator', 'Any attacker into any defender.'], ['Test Run', 'Your team into the latest top teams.'], ['Speed Tiers', 'Your six against the 20 most-used Pokémon.']].map(([t, s]) => `<a href=# class=panel style="color:inherit;text-decoration:none"><h3 class=u>${t} ›</h3><span class=hint>${s}</span></a>`).join('')}</div>${links(['Type Chart ›'])}`);
page('battle', 'Battle', body, `.vs{margin:20px 0 8px;font-size:clamp(48px,6vw,84px);line-height:1;color:var(--nasty-text)}
.roster.slots{padding-top:8px}.slots .slot{min-height:200px;padding:0}.slots .slot b{font-size:84px;color:var(--rule)}
@media (max-width:699.98px){.roster.slots{padding-top:0;row-gap:12px}.slots .slot{min-height:120px}.slots .slot b{font-size:56px}}`);
