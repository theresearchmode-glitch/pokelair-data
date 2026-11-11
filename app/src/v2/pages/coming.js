// ---------- Preview only (Sim, Nov 11): the Preview opens straight into the new site ----------
// Pages not rebuilt yet show "Coming next" with the approved mock-up they're built from (files beside the Preview). Never in a
// real build: only the --preview-data build sets __NP_PREVIEW, and a page drops out of this list the moment it exists.
if (window.__NP_PREVIEW) {
  const MOCK = {home: ['home', 'Home', 'Score, build or plan, the most used Pokémon, the latest winner beside your six, Top of the Meta and today\'s underdog.'],
    build: ['build', 'Build', 'Build me a team around a Pokémon: the best team first with its Strength Score, then other options and cores.'],
    battle: ['battle', 'Battle', 'Bring these four, lead the pair: the plan against an opponent\'s six, turn one in move order.'],
    meta: ['ratings', 'Meta', 'Who wins right now: ratings, usage, winning teams, events and archetypes.']};
  for (const [k, [f, name, what]] of Object.entries(MOCK)) if (!V2.pages[k]) V2.pages[k] = {place: k, draw: () => {
    const dk = V2.theme() === 'night', img = `thumbs/${f}-${dk ? 'dusk' : 'light'}.jpg`, href = `${f}.html#${dk ? 'dusk' : 'light'}`;
    return `<section class="cm2"><div class="cm2-t"><div class="np-eyebrow"><span>${name} · coming next</span></div><h1 class="u">${name}</h1>
      <p class="tm-sub">This page is being rebuilt in the new design. Until then, here is the approved mock-up it's built from (a picture with real data; its buttons don't work yet).</p>
      <p class="tm-sub cm2-what">${V2.esc(what)}</p><div class="row"><a class="np-btn" href="${href}">Open the ${name} Mock-up</a><a class="np-btn2" href="#team"><span>Go to My Team</span></a><a class="np-link cm2-all" href="gallery.html">All mock-ups</a></div></div>
      <a class="cm2-shot" href="${href}" aria-label="Open the ${name} mock-up"><img src="${img}" alt="The approved ${name} mock-up" loading="lazy"></a></section>`; }};
  // land on the first rebuilt page, not a placeholder
  if (!location.hash || !V2.pages[location.hash.slice(1)]) { try { history.replaceState(null, '', location.pathname + location.search + '#team'); } catch (e) {} }
}
