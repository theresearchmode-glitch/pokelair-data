import { card, w, sentence, step, head, links, page, img, btnw } from './lib.mjs';
// Real data: today's built Winning Teams page (#tournaments), claude/design6 built Nov 21 with the repo's data files (banner: saved copy Nov 9).
const SUB = links(['~Pokémon', 'Tournaments ›', '~Winning Teams', 'Events ›', 'Archetypes ›', 'This Week ›']);
const T1 = [['Gholdengo'], ['Excadrill'], ['Tyranitar-Mega', 'Mega Tyranitar'], ['Staraptor-Mega', 'Mega Staraptor'], ['Sinistcha'], ['Milotic']];
const RUN = [['Challenger · 2nd place', '4/4 checks', 'Grassy Terrain', ['Garchomp-Mega', 'Sneasler', 'Floette-Mega', 'Incineroar', 'Rillaboom', 'Kingambit']],
  ['Challenger · 3rd place', '4/4 checks', 'Sun · Tailwind', ['Kingambit', 'Sneasler', 'Salamence-Mega', 'Basculegion', 'Charizard-Mega-Y', 'Whimsicott']]];
const acts = links(['Copy for Showdown ›', 'Set as Opponent ›', 'Compare ›']);
const body = SUB + head({ kicker: 'META · THE WINNING CREWS', h1: 'The teams that<br><em>won it.</em>', lead: 'Top-cut teams from real tournaments. Load one, practice against it, or compare it with yours. 90 top-cut teams · 32 from official events · 58 from the last 7 days.' }) +
  sentence(`Show me ${w('official events · 32', 1)} ${w('last 7 days · 58')} or ${w('search ⌕')}`, 'Blue words are buttons. Top 4 from online tournaments with 32+ players, top 8 from official events.') +
  `<div class=panel style="margin-top:24px;max-width:640px"><div class=pline><b class="rec u">4/4</b><p class=hint>checks · the four basics</p><span class="tag hit u">Sun</span><span class="tag hit u">Tailwind</span></div><h3 class=u style="margin-top:8px">Your Team</h3><div class=six>${['Charizard-Mega-Y', 'Whimsicott', 'Basculegion', 'Kingambit', 'Garchomp', 'Sneasler'].map(n => img(n, 40)).join('')}</div><p class=hint>Mega Charizard Y · Whimsicott · Basculegion · Kingambit · Garchomp · Sneasler. Tap one for its page.</p></div>` +
  step(1, 'The champion', '2027 Gdańsk Pokémon Regional Championships · 758 players · official event', '', `<div class=roster>${T1.map(([n, sh]) => card(n, { shown: sh })).join('')}</div>
   <div class=pline style="margin-top:16px"><b class=u style="font-size:20px">3/4 checks</b><p class=hint>missing: weak spots spread out</p><span class="tag hit u">Sand</span><span class="tag hit u">TailRoom</span></div>
   <a class=go href=#>USE THIS TEAM.</a>${acts}<p class=hint>Tap a card for its page.</p>`) +
  step(2, 'The runners-up', 'official event · same tournament', 'More Winning Teams · 32 in all ›', `<div class=cols>${RUN.map(([pl, ck, tg, six]) => `<div class=panel><div class=pline><b class="u" style="font-size:22px">${pl}</b>${btnw('use this team')}</div><div class=six style="margin:12px 0">${six.map(n => img(n, 52)).join('')}</div><div class=pline><b class=u style="font-size:17px">${ck}</b>${tg.split(' · ').map(t => `<span class="tag hit u">${t}</span>`).join('')}</div>${acts}</div>`).join('')}</div>`);
page('tournaments', 'Meta', body);
