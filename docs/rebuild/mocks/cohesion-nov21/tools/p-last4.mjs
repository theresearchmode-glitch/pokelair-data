import { card, w, sentence, step, head, links, page, btnw } from './lib.mjs';
// Real data: today's built Send Feedback (#feedback), empty My Team (#team-empty), not-found (#nowhere) and the owner page's code (pages/owner.js); claude/design6 built Nov 21.

// 26 feedback: the form as a plot sentence
page('feedback', 'Meta', head({ kicker: 'ABOUT · TIP US OFF', h1: 'Tell us<br><em>what’s off.</em>', lead: 'Spotted a bug, a wrong number or a better idea? It goes straight to the people who make NastyPlot.' }) +
  step(1, 'The tip', 'what kind of note is it?', '', sentence(`It’s ${w('something broke')} ${w('confusing')} ${w('an idea', 1)} ${w('I like this')} ${w('wrong info')} and here’s the note:`, false) +
   `<textarea class=field aria-label="Your note" placeholder="Your note" style="margin-top:16px"></textarea><a class=go href=#>SEND IT.</a><p class=hint>Saved with the page you came from, phone or desktop, and the date.</p>`) +
  step(2, 'Anonymous. Always.', '', '', `<p class=lead style="margin:0">We never ask for your name or email. Anything that looks like an email, phone number or @handle is removed before it’s saved.</p>${links(['Show Email ›'])}`));

// 4 team-empty: empty roster slots + today's underdog
const TOP = [['Sneasler', 97, '35.6%'], ['Rillaboom', 97, '35.5%'], ['Kingambit', 96, '26.6%'], ['Incineroar', 95, '31.8%'], ['Charizard-Mega-Y', 94, '21.6%', 'Mega Charizard Y'], ['Raichu-Mega-Y', 93, '14.0%', 'Mega Raichu Y']];
page('team-empty', 'My Team', head({ status: 'My Team · 0 of 6 · No team yet', kicker: 'MY TEAM · RECRUIT YOUR CREW', h1: 'Six spots,<br><em>all yours.</em>', lead: 'Add a Pokémon to start, or let us build a whole team around a favourite.' }) +
  `<a class=go href=#>BUILD ME A TEAM.</a>${links(['Add a Pokémon ›', 'Import a Team ›', 'Saved Teams (1) ›'])}` +
  step(1, 'The empty crew', 'tap a spot to add a Pokémon', '', `<div class="roster spots">${[1, 2, 3, 4, 5, 6].map(i => `<a href=# class=slot><b class=u style="font-size:40px;color:var(--plot-text)">+</b><span>Add · Spot ${i}</span></a>`).join('')}</div>`) +
  step(2, 'Or start from a winner', 'today’s six highest-rated Pokémon · tap one to build a team around it', '', `<div class=roster>${TOP.map(([n, s, u, sh]) => card(n, { score: s, shown: sh, fact: `S tier · ${u} of Showdown ladder teams` })).join('')}</div>`) +
  step(3, 'Today’s underdog', 'Corviknight · somebody’s favourite', 'Or Build Around Your Favourite Pokémon ›', `<div class=hero style="margin-top:110px">${card('Corviknight', { fact: 'Today’s underdog' })}<div><span class=note>Rarely picked in tournaments, but every Pokémon deserves its moment. Maybe it’s yours?</span>
   <div class=links>${btnw('add Corviknight to my team')}<a href=#>Pokémon Page ›</a></div></div></div>`),
  `.spots{padding-top:8px}.spots .slot{display:grid;place-items:center;gap:4px;min-height:160px;text-decoration:none}.spots .slot span{font:600 15px/1.2 I;color:var(--ink2)}
   @media (max-width:699.98px){.spots{gap:8px}.spots .slot{min-height:88px}.spots .slot b{font-size:28px!important}}`);

// 28 notfound: the underdog + a way home
page('notfound', 'Home', head({ kicker: 'PAGE NOT FOUND · WRONG TURN', h1: 'Nothing<br><em>here.</em>', lead: 'This address doesn’t match a page on NastyPlot. It may be an old or mistyped link.' }) +
  `<a class=go href=#>GO TO HOME.</a>` +
  `<div class=hero style="margin-top:120px">${card('Corviknight', { fact: 'Today’s underdog' })}<div><span class=note>Lost? Corviknight’s been here all along.</span>${links(['Corviknight: open its info ›'])}</div></div>`);

// 29 owner: plain, in the kit; numbers are placeholders (the page reads private counts that don't exist in a mock-up)
page('owner', 'Meta', head({ kicker: 'OWNER · ONLY YOU SEE THIS', h1: 'What people<br><em>use and say.</em>', lead: 'Anonymous counts and feedback. No names, nothing typed except feedback people chose to send.' }) +
  `${step(1, 'What people use', 'page or button · people · times', '', `<div class="rows one">${['Page or button A', 'Page or button B', 'Page or button C'].map(t => `<div class=row><span></span><div><b>${t}</b><small>PLACEHOLDER: real counts load on the live site</small></div><div class=val><b class=u>—</b><small>people · times</small></div></div>`).join('')}</div>`)}
   ${step(2, 'Feedback', 'newest first', '', `<div class="rows one"><div class=row><span></span><div><b>PLACEHOLDER: kind · page · phone or desktop · person N</b><small>The preview can’t read feedback. It shows on the real site.</small></div><span></span></div></div>`)}`);
