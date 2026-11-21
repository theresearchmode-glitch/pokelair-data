import { card, w, sentence, step, head, links, page, img, byId, btnw } from './lib.mjs';
// Real data: today's built Compare (#compare): A = your team, B not picked yet, three latest winners offered; winners' sixes from the Events data (same build).
const A = [['Charizard-Mega-Y', 'Mega Charizard Y'], ['Whimsicott'], ['Basculegion'], ['Kingambit'], ['Garchomp'], ['Sneasler']];
const WIN = [['Grassy Terrain · Hard Trick Room', 'Won ValkrixVGC Champions League #09 · Nov 8', [10087, 700, 812, 981, 727, 10305]],
  ['Psychic Terrain · Trick Room', 'Won Trinity Championship 18 (Double Format) · Nov 8', [10051, 10307, 903, 10186, 936, 784]],
  ['Grassy Terrain · Tailwind', 'Won Sketch Academy Sunday Regulation M-C Tournament · Nov 8', [10281, 903, 10296, 812, 902, 983]]];
const body = links(['← My Team']) + head({ kicker: 'MY TEAM · HEAD TO HEAD', h1: 'Compare <em>Teams.</em>', lead: 'Two teams side by side. Pick two: your team, a saved one, an event winner or a pasted Showdown team.' }) +
  step(1, 'Head to head', 'team A against team B', '', `<div class=h2h><div><p class=status style="margin:0"><b class=u style="font-size:22px">A</b> · Sun Tailwind (sample) · my team, open now <a class=link href=#>Change ›</a></p><div class="roster r3 no-phone">${A.map(([n, sh]) => card(n, { shown: sh })).join('')}</div><div class="six only-phone" style="justify-content:space-between;margin-top:8px">${A.map(([n]) => img(n, 52)).join('')}</div></div>
   <b class="vs u">VS</b><div><p class=status style="margin:0"><b class=u style="font-size:22px">B</b> · not picked yet</p><div class="roster r3 slots6">${[1, 2, 3, 4, 5, 6].map(() => '<div class=slot><b class=u style="font-size:40px;color:var(--rule)">?</b></div>').join('')}</div></div></div>
   <p class=hint>Once both are picked, every row is worked out the same way as on My Team.</p>`) +
  step(2, 'Pick team B', 'take on a latest winner', 'Saved, more winners or paste a team ›', `<div class="rows one only-phone">${WIN.map(([st, line, six]) => `<div class=row><span></span><div><b>${st}</b><div class=six>${six.map(id => img(byId(id), 28)).join('')}</div></div><div class=val>${btnw('pick')}</div></div>`).join('')}</div><div class="grid3 no-phone">${WIN.map(([st, line, six]) => `<a href=# class=panel style="color:inherit;text-decoration:none"><h3 class=u>${st}</h3><p class=hint style="margin:0">${line}</p><div class=six style="margin:10px 0">${six.map(id => img(byId(id), 40)).join('')}</div>${btnw('pick team b')}</a>`).join('')}</div>`);
page('compare', 'My Team', body, `
.h2h{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:24px;align-items:center}.h2h .vs{font-size:clamp(40px,5vw,72px);color:var(--nasty-text)}
.h2h .roster{padding-top:48px;gap:56px 10px}.h2h .slot{min-height:150px}
@media (max-width:999.98px){.h2h{grid-template-columns:minmax(0,1fr)}.h2h .vs{justify-self:start}}
@media (max-width:699.98px){.h2h{gap:4px}.h2h .roster.slots6{grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;padding-top:8px}.h2h .slot{min-height:56px;border-width:2px}.h2h .slot b{font-size:24px!important}.h2h .vs{font-size:34px}}`);
