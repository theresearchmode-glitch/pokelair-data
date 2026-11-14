// ---------- Preview only (Sim, Nov 11): the Preview opens straight into the new site ----------
// Pages not rebuilt yet show "Coming next" with the approved mock-up they're built from (files beside the Preview). Never in a
// real build: only the --preview-data build sets __NP_PREVIEW, and a page drops out of this list the moment it exists.
if (window.__NP_PREVIEW) {
  const MOCK = {home: ['home', 'Home', 'Score, build or plan, the most used Pokémon, the latest winner beside your six, The Meta, right now and today\'s underdog.'],
    build: ['build', 'Build', 'Build me a team around a Pokémon: the best team first with its Strength Score, then other options and cores.'],
    battle: ['battle', 'Battle', 'Bring these four, lead the pair: the plan against an opponent\'s six, turn one in move order.'],
    meta: ['ratings', 'Meta', 'Who wins right now: ratings, usage, winning teams, events and archetypes.']};
  // Battle's tools (Nov 12, Q6): not rebuilt yet and no mock-up of their own; the page says so and points to today's site
  const TOOLS = {practice: 'Team Preview Practice', gauntlet: 'Test Run', speed: 'Speed Tiers', calc: 'Damage Calc', types: 'Type Chart'};
  for (const [k, name] of Object.entries(TOOLS)) if (!V2.pages[k]) V2.pages[k] = {place: 'battle', draw: () => `<section class="cm2"><div class="cm2-t"><div class="np-eyebrow"><span>Battle · ${name} · coming next</span></div><h1 class="u">${name}</h1>
      <p class="tm-sub">This page is being rebuilt in the new design. It works on today's NastyPlot site until the switch.</p><div class="row"><a class="np-btn" href="#battle">Back to Battle</a></div></div></section>`};
  // Pages linked from the footer and from inside pages, not rebuilt yet and with no mock-up of their own (Nov 12, audit i19, rule C10):
  // the same 'coming next' page as Battle's tools, instead of falling through to Home
  const INFO = {method: ['meta', 'How We Calculate'], sets: ['meta', 'Popular Sets'], usage: ['meta', 'Usage'], tournaments: ['meta', 'Tournaments'], track: ['meta', 'Track Record'], about: ['', 'About & Legal'], feedback: ['', 'Send Feedback']}; /* footer pages: no top tab lit */;
  for (const [k, [place, name]] of Object.entries(INFO)) if (!V2.pages[k]) V2.pages[k] = {place, draw: () => `<section class="cm2"><div class="cm2-t"><div class="np-eyebrow"><span>${name} · coming next</span></div><h1 class="u">${name}</h1>
      <p class="tm-sub">This page is being rebuilt in the new design. It works on today's NastyPlot site until the switch.</p><div class="row"><a class="np-btn" href="#team">Go to My Team</a></div></div></section>`};
  for (const [k, [f, name, what]] of Object.entries(MOCK)) if (!V2.pages[k]) V2.pages[k] = {place: k, draw: () => {
    const dk = V2.theme() === 'night', img = `thumbs/${f}-${dk ? 'dusk' : 'light'}.jpg`, href = `${f}.html#${dk ? 'dusk' : 'light'}`;
    return `<section class="cm2"><div class="cm2-t"><div class="np-eyebrow"><span>${name} · coming next</span></div><h1 class="u">${name}</h1>
      <p class="tm-sub">This page is being rebuilt in the new design. Until then, here is the approved mock-up it's built from (a picture with real data; its buttons don't work yet).</p>
      <p class="tm-sub cm2-what">${V2.esc(what)}</p><div class="row"><a class="np-btn" href="${href}">Open the ${name} Mock-up</a><a class="np-btn2" href="#team"><span>Go to My Team</span></a><a class="np-link cm2-all" href="gallery.html">All mock-ups</a></div></div>
      <a class="cm2-shot" href="${href}" aria-label="Open the ${name} mock-up"><img src="${img}" alt="The approved ${name} mock-up" loading="lazy"></a></section>`; }};
  // land on the first rebuilt page, not a placeholder
  if (!/^#(team|box)=/.test(location.hash) && (!location.hash || !V2.pages[location.hash.slice(1)])) { /* Nov 12 fix: team and box links pass through (they were swallowed here) */ try { history.replaceState(null, '', location.pathname + location.search + '#team'); } catch (e) {} }
}
