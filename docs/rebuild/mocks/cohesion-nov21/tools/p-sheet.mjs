import { card, sentence, w, step, head, links, moves, page, TD } from './lib.mjs';
// Real data: today's Team Sheet (My Team > Team Sheet ↗, V2.openTeamSheet) for the sample team; claude/design6 built Nov 21 with the repo's data files.
// Stats at level 50: [value, points, nature mark (+ / − / ''), team best]
const S = [
 ['Charizard-Mega-Y', 'Mega Charizard Y', 'Charizardite Y', 'Drought', 'Modest', '+SpA −Atk', [['Heat Wave', 'Fire'], ['Protect', 'Normal'], ['Solar Beam', 'Grass'], ['Weather Ball', 'Normal']], [[155, 2, ''], [111, 0, '−'], [98, 0, ''], [232, 32, '+', 1], [135, 0, '', 1], [152, 32, '']]],
 ['Whimsicott', 'Whimsicott', 'Focus Sash', 'Prankster', 'Timid', '+Spe −Atk', [['Encore', 'Normal'], ['Moonblast', 'Fairy'], ['Protect', 'Normal'], ['Tailwind', 'Flying']], [[137, 2, ''], [78, 0, '−'], [105, 0, ''], [129, 32, ''], [95, 0, ''], [184, 32, '+', 1]]],
 ['Basculegion', 'Basculegion', 'Life Orb', 'Adaptability', 'Jolly', '+Spe −SpA', [['Aqua Jet', 'Water'], ['Flip Turn', 'Water'], ['Last Respects', 'Ghost'], ['Wave Crash', 'Water']], [[197, 2, ''], [164, 32, ''], [85, 0, ''], [90, 0, '−'], [95, 0, ''], [143, 32, '+']]],
 ['Kingambit', 'Kingambit', 'Chople Berry', 'Defiant', 'Adamant', '+Atk −SpA', [['Kowtow Cleave', 'Dark'], ['Protect', 'Normal'], ['Sucker Punch', 'Dark'], ['Swords Dance', 'Normal']], [[207, 32, '', 1], [205, 32, '+', 1], [140, 0, '', 1], [72, 0, '−'], [107, 2, ''], [70, 0, '']]],
 ['Garchomp', 'Garchomp', 'Choice Scarf', 'Rough Skin', 'Adamant', '+Atk −SpA', [['Dragon Claw', 'Dragon'], ['Earthquake', 'Ground'], ['Rock Slide', 'Rock'], ['Stomping Tantrum', 'Ground']], [[185, 2, ''], [200, 32, '+'], [115, 0, ''], [90, 0, '−'], [105, 0, ''], [154, 32, '']]],
 ['Sneasler', 'Sneasler', 'White Herb', 'Unburden', 'Adamant', '+Atk −SpA', [['Close Combat', 'Fighting'], ['Dire Claw', 'Poison'], ['Fake Out', 'Normal'], ['Protect', 'Normal']], [[157, 2, ''], [200, 32, '+'], [80, 0, ''], [54, 0, '−'], [100, 0, ''], [172, 32, '']]]];
const SN = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
const stats = st => `<div class=stats>${st.map(([v, p, m, best], i) => `<div class="${best ? 'best' : ''}"><span>${SN[i]}${m === '+' ? '<i class=up>▲</i>' : m === '−' ? '<i class=dn>▼</i>' : ''}</span><b class=u>${v}</b><small>${p} pts</small></div>`).join('')}</div>`;
const body = head({ kicker: 'MY TEAM · THE DOSSIER', h1: 'Team Sheet:<br><em>Sun Tailwind.</em>', lead: 'Sun Tailwind (sample) · Reg M-C doubles · level 50. Spreads: each one’s most common.' }) +
  links(['← My Team', 'Share as Image ›']) + `<a class=go href=#>COPY FOR SHOWDOWN.</a>` +
  `<p class=hint>Tap a card to edit its set. Big number: the stat at level 50 · <b style="color:var(--plot-text)">blue</b> = team best in that stat · ▲ raised by nature · ▼ lowered by nature · pts = stat points (0–32).</p>` +
  step(1, 'The crew, file by file', 'one card per Pokémon', '', `<div class=dossier>${S.map(([n, sh, it, ab, na, nf, mv, st], i) => `<div class=file>${card(n, { shown: sh, num: String(i + 1).padStart(2, '0') })}
   <div class=kv><div><span>Item</span><b>${it}</b></div><div><span>Ability</span><b>${ab}</b></div><div><span>Nature</span><b>${na} <em>${nf}</em></b></div></div>${moves(mv)}${stats(st)}</div>`).join('')}</div>`);
page('sheet', 'My Team', body, `
.dossier{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:72px 24px;padding-top:40px}.file .roster{padding:0}.file>.rcw .rc{min-height:150px;padding-top:80px}
.file .kv{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px}.file .kv div:last-child{grid-column:1/-1}.file .moves .mv{font-size:15px;padding:0 10px}
.stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;margin-top:12px}.stats div{display:grid;justify-items:center;padding:6px 2px;background:var(--card)}
.stats span{font:600 13px/1.2 I;color:var(--ink2)}.stats b{font-size:20px;line-height:1.1;white-space:nowrap}.stats small{font:400 13px/1.2 I;color:var(--ink2)}
.stats .best{box-shadow:inset 0 -4px 0 var(--plot)}.stats .best b{color:var(--plot-text)}.stats i{font:700 13px/1 I;font-style:normal;margin-left:2px;vertical-align:top}.stats .up{color:var(--good)}.stats .dn{color:var(--bad)}
@media (max-width:999.98px){.dossier{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:699.98px){.dossier{grid-template-columns:minmax(0,1fr);gap:56px}.file{display:grid;grid-template-columns:136px minmax(0,1fr);gap:8px 12px;align-items:end}.file .moves,.file .stats{grid-column:1/-1}.file .kv{grid-template-columns:1fr;margin:0}.file>.rcw .rc{min-height:0;padding-top:64px}.file .rc .nm b{font-size:15px}.stats b{font-size:17px}.stats small{display:none}}`);
