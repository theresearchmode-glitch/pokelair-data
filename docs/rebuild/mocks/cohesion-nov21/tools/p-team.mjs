import { card, types, w, sentence, step, head, links, moves, page, art } from './lib.mjs';
// Real data: today's built My Team (sample team "Sun Tailwind"), app/dist/v2.html#team, Nov 21 build of claude/design6 with the repo's data files.
// Phone length (THEME.md 4): 4 steps; secondary text one line + a link on phones (only-phone short line, no-phone full line); lists as dense rows.
const SIX = [['Charizard-Mega-Y', 94, 'S'], ['Whimsicott', 88, 'A'], ['Basculegion', 92, 'S'], ['Kingambit', 96, 'S'], ['Garchomp', 92, 'S'], ['Sneasler', 97, 'S']];
const SHOWN = { 'Charizard-Mega-Y': 'Mega Charizard Y' };
const THREATS = [['Charizard-Mega-Y', 'Mega Charizard Y', 'Unfavoured', 'Mirror · Calc: beats it'], ['Farigiraf', 'Farigiraf', 'Unfavoured'], ['Salamence-Mega', 'Mega Salamence', 'Unfavoured'], ['Indeedee-F', 'Indeedee (F)', 'Unfavoured'],
  ['Raichu-Mega-Y', 'Mega Raichu Y', 'Favoured'], ['Volcarona', 'Volcarona', 'Favoured'], ['Sinistcha', 'Sinistcha', 'Favoured'], ['Golisopod-Mega', 'Mega Golisopod', 'Favoured']];
const two = (full, short) => `<span class=no-phone>${full}</span><span class=only-phone>${short}</span>`;
const header = head({ status: 'My team · 6 of 6 · Sun team · Legal for Reg M-C ✓', kicker: 'MY TEAM · THE CREW', h1: 'Sun <em>Tailwind</em> <span class=sub>(sample)</span>',
  lead: 'This is a sample team, here to show how NastyPlot works.' }) +
  `<div class=score><b class=u>94</b><div><strong>Top tier</strong><span>${two('Strength Score. Teams scoring like this win about 61% against today’s tournament teams. Top 1% of tournament teams.', 'Strength Score · wins about 61% · top 1%')}</span></div></div>` +
  links(['Why This Score? ›', 'Team Sheet ↗', 'Share as Image ›', 'Saved Teams (1) ›', 'More ⋯', '~Saved ✓']) +
  sentence(`New crew? ${w('build me a team')} or ${w('import a team')}`, 'Blue words are buttons. Jump to: Matchups · Suggestions · Team Checks');
const crew = (frame) => step(1, 'The crew', 'your six · tap one to see it', '', `${frame ? '<div class=warroom>' : ''}<div class=roster>${SIX.map(([n, s, t], i) => card(n, { score: s, fact: `${t} tier`, sel: i === 0, num: i + 1, shown: SHOWN[n] })).join('')}</div>
 <div class="detail cols"><div><div class=pager><a href=#>‹</a>1 of 6<a href=#>›</a></div>${types('Charizard-Mega-Y')}
   </div><div class=no-phone><h3 class=u style="margin:0;font-size:28px">Mega Charizard Y <span class=sub style="font-size:20px">94 · S tier</span></h3></div><div><div class=kv style="margin-top:0"><div><span>Item</span><b>Charizardite Y</b></div><div><span>Ability</span><b>Drought</b></div><div><span>Nature</span><b>Modest <em>most used</em></b></div><div><span>Stat points</span><b>32 SpA, 32 Spe, 2 HP <em>most used</em></b></div></div></div><div>${moves([['Heat Wave', 'Fire'], ['Protect', 'Normal'], ['Solar Beam', 'Grass'], ['Weather Ball', 'Normal']])}
   ${links(['Edit Set ›', 'Replace ›', 'Remove ›', 'Lock ›', 'Pokémon Page ›'])}</div></div>${frame ? '</div>' : ''}`);
const rest = `${step(2, 'The upgrade and the plan', 'Suggestions · Game Plan', 'See All Suggestions ›', `<p class=lead style="margin:0">${two('Nothing to fix. Your team has every basic and no swap clearly beats it in real games. Your edge now comes from how you play it: plan each matchup in Battle, and tune your sets.', 'Nothing to fix: no swap clearly beats it in real games.')}</p>${links(['Battle ›', 'Popular Sets ›'])}
 <p class=status style="margin-top:12px">Optional swaps:</p>
 <div class=swap>${card('Sneasler', { score: 97, fact: 'out' })}<span class=arr>→</span>${card('Floette-Mega', { shown: 'Mega Floette', fact: 'in · To catch' })}
  <div class=why><b class=u>+1 &nbsp;94 → 95</b><p>${two('Option a small change: real games can’t tell it apart from what you have.', 'A small change: real games can’t tell them apart.')}</p><div class=links>${'<a href=# class=btnw><span>apply</span></a>'}<a href=#>Why? 13 reasons ›</a></div>${links(['Never Suggest ›', 'Refresh Suggestions ›', 'Adjust Suggestions ›'])}<p class="hint no-phone">Box + Catch · 2 Megas · Swap Mega: No · Abilities: Yes</p></div></div>
 <p class=lead>How to play this six against the meta’s top six: who leads depends on who you face.</p><a class=go href=#>PLAN IT IN BATTLE.</a>${links(['Game Plan ›', 'Legal for Reg M-C', 'Team Sheet ↗'])}`)}
${step(3, 'Who we’re up against', 'Matchups · the top 30 threats', '', `<p class=lead style="margin:0">${two('Verdicts from real tournament games with your Pokémon; a card notes when the calc disagrees.', 'Verdicts from real tournament games.')}</p>
 <div class=counts><div class=good><b class=u>4</b><span>Favoured</span></div><div><b class=u>22</b><span>Even match</span></div><div class=bad><b class=u>4</b><span>Unfavoured</span></div></div>
 <p class=hint>Damage calc: No answer 0, Shaky 9, Handles it 9, Beats it 12</p>
 ${sentence(`Show me ${w('stand-outs', 1)} ${w('top 10')} ${w('top 12 grid')} ${w('all 30')}`, false)}
 <div class="rows tiles">${THREATS.map(([n, sh, v, note]) => `<div class=row><img src="${art(n)}" alt=""><div><b>${sh}</b>${note ? `<small>${note}</small>` : ''}</div><span class="tag ${v === 'Favoured' ? 'hit' : 'miss'} u">${v}</span></div>`).join('')}</div>`)}
${step(4, 'Checks and record', 'Team Checks · Your Games', '', `<div class=checks><div class=chk><i>✓</i><div><b>All 4 basics and all 3 notes pass</b><small>The 4 basics count toward the score; the notes are advice. What is “Handles the top threats”? ›</small></div><a class=link href=#>?</a></div>
 <div class=chk><i>!</i><div><b>Things to Know</b><small>7 minor weak spots, type chart, legal</small></div><a class=link href=#>›</a></div>
 <div class=chk><i>0</i><div><b>Your Games: none logged yet</b><small>After 5 logged games, Build Me a Team weighs your own results and this record shows what beats you.</small></div><a class=link href=#>Log a Game ›</a></div></div>`)}`;
page('team', 'My Team', header + crew(false) + rest);
// B: the same page with today's approved Night frame around the crew ("the war room"; Sim approved the frame 7:47 AM Nov 21)
page('team-b', 'My Team', header.replace('MY TEAM · THE CREW', 'MY TEAM · THE WAR ROOM') + crew(true) + rest,
  `.warroom{position:relative;margin:8px 14px 0 -16px;padding:8px 24px 32px;background:#17161A;box-shadow:14px 14px 0 var(--nasty);--ink:#F1EDE7;--ink2:#B9B3C2;--card:#211F2C;--rule:rgba(241,237,231,.16);--plot:#5BB6F2;--plot-text:#5BB6F2;color:#F1EDE7}
   .warroom .roster{padding-top:64px}@media (max-width:699.98px){.warroom{margin:8px 8px 0 -12px;padding:4px 8px 20px;box-shadow:8px 8px 0 var(--nasty)}.warroom .roster{padding-top:40px}}`);
