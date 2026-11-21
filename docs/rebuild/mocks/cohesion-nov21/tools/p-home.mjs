import { card, w, step, links, page, img, btnw } from './lib.mjs';
// Real data: today's built Home (#home), claude/design6 built Nov 21 with the repo's data files (the page's own banner dates them Nov 9).
const TICK = ['Mega Charizard Y 94', 'Mega Raichu Y 93', 'Garchomp 92', 'Basculegion 92', 'Mega Floette 92', 'Archaludon 91', 'Gholdengo 91', 'Farigiraf 89', 'Pelipper 89', 'Whimsicott 88', 'Mega Garchomp Z 87', 'Mega Salamence 87', 'Mega Staraptor 86', 'Sinistcha 86', 'Hisuian Arcanine 85', 'Volcarona 85'];
const SIX = [['Charizard-Mega-Y', 'Mega Charizard Y', 'Charizardite Y · Lead'], ['Garchomp', 'Garchomp', 'Choice Scarf · Lead'], ['Whimsicott', 'Whimsicott', 'Focus Sash'], ['Kingambit', 'Kingambit', 'Chople Berry'], ['Basculegion', 'Basculegion', 'Life Orb'], ['Sneasler', 'Sneasler', 'White Herb']];
const TOOLS = [['Speed Tiers', 'See who moves first: the highest rated, slowest to fastest by base Speed.', 'Kingambit', '50 Kingambit … 130 Mega Raichu Y'],
  ['Type Chart', 'What your six resists, and what hits it.', 'Charizard-Mega-Y', '18 types'], ['Ratings', 'All 345 Pokémon, rated out of 100.', 'Rillaboom', '97 Rillaboom · 97 Sneasler · 96 Kingambit'],
  ['Damage Calculator', 'Run the damage first.', 'Sneasler', 'Dire Claw 81–96% into Rillaboom'], ['Winning Teams', 'Every top-cut team, ready to load. This six won ValkrixVGC Champions League #09 on Nov 8: 57 players, 9-2.', 'Camerupt-Mega', 'Load Team › · Copy for Showdown ›'],
  ['Battle', 'Scout their six and get a turn 1 plan.', 'Whimsicott', 'Mega Charizard Y + Whimsicott vs Mega Camerupt + Sylveon'], ['Winning Cores', 'Pairs that keep winning together.', 'Basculegion', 'Basculegion + Kingambit'],
  ['Archetypes', 'Tailwind, Sun and the other ways teams win.', 'Pelipper', 'Tailwind · Sun'], ['Team Preview Practice', 'Practice picking your four at team preview.', 'Incineroar', 'Pick 4'],
  ['Popular Sets', 'The items and moves top players run.', 'Sneasler', 'Sneasler · Psychic Seed'], ['Events', 'Recent tournaments and who won them. Next: LAIC, São Paulo, Nov 20–22.', 'Sylveon', '115 events'],
  ['How We Calculate', 'Every number on NastyPlot is built from them. See how each one is worked out.', 'Farigiraf', '13,631 tournament teams']];
const GIFTS = [['Aug ’26', '2026 Worlds Outfit Set (red cap and shirt)', 'Serial code · ended Sep 3'], ['Jun ’26', 'Raichu', 'Event gift · ended Sep 1 · opens Raichu’s page'], ['Jun ’26', '100 Quick Coupons', 'Serial code · ended Aug 31'], ['Apr ’26', 'Machamp', 'Serial code · ended Aug 31 · opens its nature and moves']];
const NEWS = [['Campaign · Nov 25', 'A New Mystery Gift Campaign'], ['Battle Pass · Nov 25', 'Season M-9 Battle Passes'], ['Update · Nov 18', 'Wednesday, December 2, 2026 Battle Balance Adjustments'], ['Battle Pass · Nov 4', 'Season M-8 Battle Passes'], ['Ranked Battles · Nov 4', 'Ranked Battles Season M-8 Underway!']];
const hero = `<section class=herd><h1 class=u>Sharply raise <em>your win rate.</em></h1>
 <div class="roster r4">${[['Kingambit', 96], ['Sneasler', 97], ['Rillaboom', 97], ['Incineroar', 95]].map(([n, s]) => card(n, { score: s, top1: s === 97 })).join('')}</div>
 <div class=herd-foot><p>Every one of the 345 Pokémon NastyPlot rates is in this charge. The bigger it stands, the higher its rating, worked out from 13,631 real tournament teams. <a class=link href=#>All Ratings ›</a></p><div><a class=go href=#>SCORE MY TEAM.</a> ${btnw('build me a team')}</div></div></section>
 <div class=tick><div class=u>${TICK.map(t => `<span>${t.replace(/ (\d+)$/, ' <b>$1</b>')}</span>`).join('')}</div><a href=# aria-label="Pause the moving ratings">❚❚</a></div>`;
const body = `<div class="status">A sample six · Sun Tailwind · Sun team</div>` +
  step(1, 'Call six out of the herd.', 'build your six, see its Strength Score, and plan each match', '', `<p class=hint style="margin:0 0 8px">A sample team, here to show how NastyPlot works.</p>
  <div class=cols><div><h3 class=u style="margin:0 0 8px;font-size:22px">New here?</h3><div class=checks>
   <div class=chk><i>1</i><div><b>Get a team</b><small>Let us build one from real winning teams, copy a top team, or type your own six.</small></div></div>
   <div class=chk><i>2</i><div><b>Read your Strength Score</b><small>How strong your six is, its Matchups against the top threats, and exactly what to change.</small></div></div>
   <div class=chk><i>3</i><div><b>Plan each match</b><small>Scout their six, see who moves first, run the damage, and get a turn 1 plan.</small></div></div></div>
   <div class=links>${btnw('copy a top team')}<a href=#>Got It</a></div></div>
   <div class=panel><p class=hint style="margin:0">Strength Score report · Sample team</p><div class=score style="margin-top:8px"><b class=u>94</b><div><strong>Top tier</strong><span>out of 100 · Top 1% of tournament teams</span></div></div>
    <p class=hint>Missing a basic · Needs work · Solid · Tournament ready · <b>Top tier</b></p>
    <div class=kv style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><b>Matchups</b><span>against the top threats</span></div><div><b>Suggestions</b><span>what to change</span></div><div><b>Team Checks</b><span>the basics covered</span></div></div>${links(['Open My Team ›'])}</div></div>
  <div class=roster>${SIX.map(([n, sh, f]) => card(n, { shown: sh, fact: f })).join('')}</div><div class=links>${btnw('build me a team')}<a href=#>Import a Team ›</a></div>`) +
  step(2, 'Walk in with a turn 1 plan.', 'sample leads', '', `<div class="roster r4">${card('Charizard-Mega-Y', { shown: 'Mega Charizard Y', fact: 'yours · Weather Ball' })}${card('Garchomp', { fact: 'yours · Dragon Claw' })}${card('Rillaboom', { fact: 'their likely lead' })}${card('Farigiraf', { fact: 'their likely lead' })}</div>
  <p class=lead>Their side: the latest winner’s six, ValkrixVGC Champions League #09, Nov 8. Battle sets it as your opponent. <b>Game Plan</b> vs the Champion’s six: lead Mega Charizard Y + Garchomp, back Whimsicott + Kingambit, bench Basculegion + Sneasler.</p>${links(['Battle ›'])}`) +
  step(3, 'Same herd. <em style="font-style:inherit;color:var(--plot-text)">Twelve tools.</em>', 'every tool uses the same 345 rated Pokémon', '', `<div class=grid4>${TOOLS.map(([t, line, n, fact]) => `<a href=# class="panel tool">${img(n)}<h3 class=u>${t}</h3><span>${line}</span><b>${fact}</b></a>`).join('')}</div>
  ${links(['~More tools', 'Test Run ›', 'Compare Teams ›', 'This Week ›', 'Track Record ›', 'Usage ›', 'My Box ›'])}`) +
  step(4, 'The post is in.', 'gift codes before they run out, and the news from Pokémon Champions', '', `<div class=cols><div class=panel><div class=sec style="margin:0 0 8px"><h3 class=u style="margin:0">Mystery Gifts</h3><a href=#>All 10 Gifts ›</a></div>
   <span class="tag miss u">1 DAY LEFT</span><p class=hint>2 Training Tickets · sent Nov 11 · collect by Nov 22 · serial code</p><div class=pline><b class="u code">LA1CTRA1N1NG27</b>${btnw('copy code')}</div>
   <div class="rows one" style="margin-top:12px">${GIFTS.map(([m, t, s]) => `<div class=row><span class=rk>${m}</span><div><b>${t}</b><small>${s}</small></div><span></span></div>`).join('')}
   <div class=row><span class=rk>40d</span><div><b>100 Quick Coupons</b><small>40 days left</small></div><div class=val><b class="u code" style="font-size:20px">10M1NTRNR</b><br>${btnw('copy code')}</div></div></div></div>
   <div class=panel><div class=sec style="margin:0 0 8px"><h3 class=u style="margin:0">Champions News</h3><a href=#>All 69 Stories ›</a></div><p class=hint style="margin:0">No. 69 · Late edition · Saturday, November 21, 2026</p>
   <div class="rows one">${NEWS.map(([k, t]) => `<a href=# class=row style="color:inherit;text-decoration:none"><span></span><div><small>${k}</small><b>${t} ↗</b></div><span></span></a>`).join('')}
   <div class=row><span></span><div><small>Next event</small><b>LAIC, São Paulo · Nov 20–22</b></div><span class="tag miss u">LIVE NOW</span></div></div></div></div>`);
page('home', 'Home', hero + body, `
.wrap{padding-top:0}.herd{position:relative;margin:0 -24px 0 -72px;padding:40px 24px 28px 72px;color:#fff;background:linear-gradient(180deg,rgba(0,82,140,.55),rgba(23,22,26,.92) 70%),url(../../../../../app/src/v2/art/crowd-0.webp) center/cover,#0B4F82}
.herd h1{max-width:1000px;font-size:clamp(48px,8vw,112px);line-height:.92;color:#fff}.herd h1 em{color:#62BEF7}
.herd .roster{max-width:960px;--card:#FFFFFF;--ink:#17161A;--ink2:#5E5A66;color:#17161A}
.herd-foot{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:end;margin-top:28px}.herd-foot p{margin:0;max-width:560px;font-size:17px}.herd-foot .link{color:#62BEF7}
.herd .btnw{border-color:#fff;color:#fff;margin-left:12px}
.tick{display:flex;align-items:center;margin:0 -24px 40px -72px;background:var(--nasty);color:#fff;transform:rotate(-1deg)}.tick div{display:flex;gap:36px;overflow:hidden;padding:12px 24px 12px 72px;white-space:nowrap;font-size:22px}.tick b{color:#17161A}
.tick a{display:grid;place-items:center;flex:none;width:52px;height:52px;background:#17161A;color:#fff;text-decoration:none;font:900 17px/1 I}
.grid4{margin-top:64px;row-gap:72px}.tool{position:relative;display:grid;align-content:start;gap:6px;padding-top:72px;color:inherit;text-decoration:none}
.tool img{position:absolute;right:8px;top:-52px;width:112px;height:112px;object-fit:contain;filter:drop-shadow(0 8px 6px rgba(0,0,0,.2))}.tool h3{margin:0;font-size:22px}.tool span{font-size:15px;color:var(--ink2)}.tool b{font-size:15px;color:var(--plot-text)}
.code{font-size:26px;letter-spacing:.02em}

@media (max-width:699.98px){.herd{margin:0 -16px 0 -52px;padding:28px 16px 24px 52px}.herd-foot{grid-template-columns:1fr}.herd .btnw{margin:12px 0 0}.herd .roster.r4{grid-template-columns:repeat(2,minmax(0,1fr))}
 .tick{margin:0 -16px 24px -52px}.tick div{padding-left:52px;font-size:17px}.grid4{gap:64px 12px}.tool img{width:80px;height:80px;top:-40px}.tool{padding:52px 12px 12px}.tool h3{font-size:17px}.tool span{display:none}.code{font-size:20px}}`);
