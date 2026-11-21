import { card, w, sentence, step, head, links, page, img, byId, btnw } from './lib.mjs';
// Real data: today's built Build page (#build), claude/design6 built Nov 21, repo data Nov 20.
const TEAMS = [['9-1', 'Torre Lotta Cup #3', '1st place of 68 players · Nov 7', [902, 983, 10089, 10035, 547, 903]],
  ['11-1', 'Friday Fight Night 80!', '1st place of 139 players · Nov 6', [10308, 10305, 812, 10230, 730, 1000]],
  ['10-2', 'Sitrus-Series · Champions-MC · #81', '1st place of 170 players · Nov 4', [324, 3, 10305, 10051, 727, 445]]];
const PAIRS = [['Basculegion', 'Kingambit', 'Basculegion + Kingambit', '837 teams (6.1%) · +2.3 points together', '54.9%', '+3.9'],
  ['Floette-Mega', 'Kingambit', 'Mega Floette + Kingambit', '650 teams (4.8%) · +1.2 points together', '54.9%', '+3.9'],
  ['Delphox-Mega', 'Incineroar', 'Mega Delphox + Incineroar', 'Fake Out, Intimidate · 475 teams (3.5%) · +2.4 points together', '54.7%', '+3.7'],
  ['Charizard-Mega-Y', 'Kingambit', 'Mega Charizard Y + Kingambit', 'Sun · 701 teams (5.1%) · +1 point together', '54.4%', '+3.4'],
  ['Delphox-Mega', 'Floette-Mega', 'Mega Delphox + Mega Floette', '239 teams (1.8%) · +0.7 points together', '54.4%', '+3.4'],
  ['Delphox-Mega', 'Sinistcha', 'Mega Delphox + Sinistcha', 'Speed control, Redirection · 375 teams (2.8%) · +1.3 points together', '54.3%', '+3.3'],
  ['Floette-Mega', 'Sinistcha', 'Mega Floette + Sinistcha', 'Speed control, Redirection · 276 teams (2.0%) · +1 point together', '54.3%', '+3.3'],
  ['Delphox-Mega', 'Kingambit', 'Mega Delphox + Kingambit', '470 teams (3.4%) · +0.9 points together', '54.3%', '+3.3']];
const body = head({ kicker: 'BUILD · THE PLAN', h1: 'Draw up<br><em>the plan.</em>', lead: 'Winning tournament teams you can field from your box or the whole roster. Real winning teams, Reg M-C doubles.' }) +
  sentence(`My plot: build from ${w('my box')} or ${w('whole roster', 1)} with ${w('0')}${w('1')}${w('2', 1)} Megas, around ${w('any Pokémon ⌕')}`, 'Blue words are buttons. Tap one to change your plot.') +
  `<div class=grid3 style="margin-top:28px"><div class=kv style="grid-template-columns:1fr;margin:0"><div><span>Build from</span><b>My Box: only the Pokémon you own. Whole Roster: any Pokémon.</b></div></div>
   <div class=kv style="grid-template-columns:1fr;margin:0"><div><span>Megas on team</span><b>79% of event winners carry 2 Mega options. Only one can Mega Evolve per battle.</b></div></div>
   <div class=kv style="grid-template-columns:1fr;margin:0"><div><span>Build around a Pokémon · optional</span><b>Type a name, or tap one:</b><div class=links>${['Sneasler', 'Rillaboom', 'Incineroar', 'Kingambit'].map(n => `<a href=#>${n}</a>`).join('')}</div></div></div></div>
  <a class=go href=#>HATCH IT.</a>${links(['Build Me a Team: six from real winning teams, in an instant. How It Works ›'])}` +
  step(2, 'The accomplices', 'waiting for your plot', '', `<div class=cols style="align-items:end"><div class="roster r3 no-phone" style="padding-top:0">${[1, 2, 3].map(() => '<div class=slot>waiting for your plot</div>').join('')}</div>
   <div class=cols style="grid-template-columns:minmax(0,180px) minmax(0,1fr);align-items:end;gap:16px"><div class="roster" style="grid-template-columns:1fr">${card('Corviknight', { fact: 'Today’s underdog' })}</div><div><span class=note>Corviknight is waiting to see what you hatch.</span><p class=hint>Today's underdog. Somebody's favourite.</p>${links(['Corviknight: open its info ›'])}</div></div></div>`) +
  step(3, 'Why it works', 'waiting for your plot', '', '') + step(4, 'Got a Plan B?', 'waiting for your plot', '', '') +
  step(5, 'Plots that worked', 'real winners at recent tournaments · borrow one', '', `<div class=grid3>${TEAMS.map(([rec, ev, line, six]) => `<div class=panel><div class=pline><b class="rec u">${rec}</b><p class=hint>${line}</p>${btnw('load team')}</div><h3 class=u style="margin-top:8px">${ev}</h3><div class=six style="margin:8px 0 0">${six.map(id => img(byId(id), 44)).join('')}</div>${links(['Full sets ›', 'Copy for Showdown ›', 'Set as Opponent ›', 'Compare ›'])}</div>`).join('')}</div>`) +
  step(6, 'Partners in crime', 'pick a pair or trio that wins, then fill the rest', '', sentence(`Show me ${w('pairs', 1)}${w('trios')}${w('full teams')} by ${w('top rated', 1)}${w('most used')} with ${w('a Pokémon ⌕')}`, false) +
   `<p class=hint>533 pairs from 13,631 tournament teams. Average team wins 51.0% of games. Ranked by win rate, pulled toward the average. <a class=link href=#>How Cores Are Ranked ›</a></p>
   <div class=rows>${PAIRS.map(([a, b, nm, sub, pc, vs], i) => `<div class="row${i > 3 ? ' no-phone' : ''}"><div class=pair>${img(a)}${img(b)}</div><div><b>${i + 1}. ${nm}</b><small>${sub}</small><a class=link href=#>Teams with It ›</a></div><div class=val><b class=u>${pc}</b><small>wins · ${vs} vs avg</small><br>${btnw('add')}</div></div>`).join('')}</div><div class=no-phone>${links(['Show 16 More Pairs ›'])}</div><div class=only-phone>${links(['Show 15 More Pairs ›'])}</div>`);
page('build', 'Build', body);
