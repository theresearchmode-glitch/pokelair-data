import { card, w, sentence, step, head, links, page, img, byId, types } from './lib.mjs';
// Real data: today's built My Box (#box), sample box of 36 (Box 1: 30 of 36, A to S); Absol open; claude/design6 built Nov 21 with the repo's data files.
const BOX = ['Absol', 'Archaludon', 'Azumarill', 'Basculegion', 'Blastoise', 'Charizard', 'Corviknight', 'Dragalge', 'Dragonite', 'Drampa', 'Empoleon', 'Garchomp', 'Gardevoir', 'Gengar', 'Glimmora',
  'Greninja', 'Hydreigon', 'Incineroar', 'Kingambit', 'Lucario', 'Meowscarada', 'Mimikyu', 'Pelipper', 'Primarina', 'Rillaboom', 'Salamence', 'Serperior', 'Sneasler', 'Staraptor', 'Steelix'];
const ONTEAM = ['Charizard', 'Garchomp', 'Basculegion', 'Kingambit', 'Sneasler'];
const body = links(['← My Team']) + head({ kicker: 'MY TEAM · YOUR STASH', h1: 'My <em>Box.</em>', lead: '36 Pokémon (sample) · 2 boxes. A sample box to start with: add the Pokémon you own and remove the rest. Build and the suggestions pick from these when set to “My Box”.' }) +
  sentence(`Arrange by ${w('A–Z', 1)} ${w('type')} ${w('newest')} ${w('oldest')} ${w('rating')}`, 'Blue words are buttons. Tap one to arrange the box.') + `<a class=go href=#>ADD A POKÉMON +</a>` +
  step(1, 'Box 1', '30 of 36 · A to S · blue underline: on your team', '', `<div class=pager style="margin-bottom:8px"><a href=#>◀</a>Box 1 of 2<a href=#>▶</a></div><div class=wall>${BOX.map(n => `<a href=# class="slotp${n === 'Absol' ? ' sel' : ''}${ONTEAM.includes(n) ? ' on' : ''}">${img(n)}<span>${n}</span></a>`).join('')}</div>`) +
  step(2, 'The one you tapped', 'rated 26 · F tier', '', `<div class=hero>${card('Absol', { score: 26, fact: 'F tier' })}<div>${types('Absol')}
   <p class=status style="margin-top:12px">Forms · tap one to show it</p><div class=links><a href=#>Absol 26 · F tier</a><a href=#>Mega Absol 33 · F tier</a><a href=#>Mega Absol Z 51 · D tier</a></div>
   <div class=facts><div><b class=u>&lt;0.1%</b><span>of tournament teams</span></div><div><b class=u>Too few</b><span>win rate · 22 games</span></div><div><b class=u>75</b><span>base Speed</span></div></div>
   <a class="btnw" href=# style="margin-top:16px"><span>swap into my team</span></a>${links(['Pokémon Page ›', 'Build Around It ›', 'Remove from Box ›'])}</div></div>`) +
  step(3, 'Your team and the box link', '', 'Open My Team ›', `<div class=six>${['Charizard-Mega-Y', 'Garchomp', 'Whimsicott', 'Sneasler', 'Basculegion', 'Kingambit'].map(n => img(n, 48)).join('')}</div>
   ${links(['Copy Box Link ›', 'Open a Box Link ›', 'Reset Box ›'])}<p class=hint>Saved in this browser only. To use your box on another device, copy its box link.</p>`);
page('box', 'My Team', body, `
.wall{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:6px;padding:12px;background:var(--card);box-shadow:0 10px 24px -14px rgba(23,22,26,.35)}
.slotp{display:grid;justify-items:center;gap:2px;padding:6px 2px;min-height:44px;color:var(--ink);text-decoration:none;font:600 13px/1.2 I;text-align:center}.slotp img{width:56px;height:56px;object-fit:contain}
.slotp.on{box-shadow:inset 0 -4px 0 var(--plot)}.slotp.sel{background:color-mix(in srgb,var(--nasty) 14%,transparent);outline:3px solid var(--nasty)}
@media (max-width:999.98px){.wall{grid-template-columns:repeat(6,minmax(0,1fr))}}
@media (max-width:699.98px){.wall{grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;padding:6px}.slotp img{width:44px;height:44px}.slotp span{display:none}}`);
