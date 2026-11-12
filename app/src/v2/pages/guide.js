// ---------- Style guide (R3): every component at its real sizes, day and night. Sim reviews it; the checks test against it. ----------
V2.pages.guide = {place: null, draw() {
  const team = ['Garchomp', 'Charizard-Mega-Y', 'Sneasler', 'Whimsicott', 'Basculegion', 'Kingambit'], items = ['Choice Scarf', 'Charizardite Y', 'White Herb', 'Focus Sash', 'Life Orb', 'Chople Berry'];
  const sw = (n, v) => `<div class="sw"><i style="background:var(${v})"></i><span>${n}<br><span class="fine">${v}</span></span></div>`;
  return `<section class="sg">
  <div class="np-eyebrow">Rebuild · style guide · the new foundation</div>
  <h1 class="u">Every piece, one rule each.</h1>
  <p class="lede">The building blocks of the new NastyPlot, drawn from the design system. Switch day and night at the top right and resize the window: each piece must look right at its smallest and largest size. Team shown: the sample team (Sun, Tailwind).</p>

  <h2 class="u">Colour</h2>
  <div class="swatches">${sw('Page', '--bg')}${sw('Surface', '--surface')}${sw('Wash', '--wash')}${sw('Ink', '--ink')}${sw('Ink 2', '--ink-2')}${sw('Ink 3', '--ink-3')}${sw('PLOT blue', '--plot')}${sw('Pink', '--pick')}${sw('Good', '--good')}${sw('Mid', '--mid')}${sw('Low', '--low')}${sw('Main action', '--main')}</div>

  <h2 class="u">Type</h2>
  <div class="type"><div class="u" style="font-size:var(--d-hero)">Sharply raise <span style="color:var(--plot)">your win rate.</span></div>
  <div class="u" style="font-size:var(--t34)">Headline 34 · Unbounded, slanted</div><div class="u" style="font-size:var(--t22)">Section 22</div>
  <p style="font-size:var(--t17)">Body 17 for lead paragraphs. Instrument Sans, line height 1.5.</p><p>Body 16 for running text.</p><p style="font-size:var(--t15)">Label 15 for buttons, rows and tabs.</p><p class="fine">Small 13, the smallest size used anywhere.</p></div>

  <h2 class="u">Actions</h2>
  <div class="row"><a class="np-btn" href="#guide">Save Team</a><a class="np-btn2" href="#guide"><span>Share</span></a><a class="np-btn2" href="#guide"><span>Copy for Showdown</span></a><a class="np-link" href="#guide">See all suggestions ›</a></div>
  <p class="fine" style="margin-top:12px">One filled main action per block (black by day, the blue action at night); outline buttons and links for the rest.</p>

  <h2 class="u">Chips and types</h2>
  <div class="row"><button class="np-chip" aria-pressed="true">Top 10</button><button class="np-chip" aria-pressed="false">Grid</button><button class="np-chip" aria-pressed="false">All 30</button>
  ${['Dragon', 'Ground', 'Fire', 'Flying', 'Water', 'Electric', 'Fairy', 'Steel'].map(V2.typeChip).join('')}</div>

  <h2 class="u">Tabs</h2>
  <div class="np-tabs" role="tablist"><button role="tab" aria-selected="true">Set</button><button role="tab" aria-selected="false">Matchups <small>30</small></button><button role="tab" aria-selected="false">Suggestions</button><button role="tab" aria-selected="false">Team Sheet <small>6</small></button></div>

  <h2 class="u">Score</h2>
  <div class="row" style="gap:48px"><div class="np-score" style="--band:var(--band-top)"><b>91</b><div class="w"><span>Top tier</span><small>Strength Score</small></div></div>
  <div class="np-score sm" style="--band:var(--band-ready)"><b>84</b><div class="w"><span>Tournament ready</span><small>Strength Score</small></div></div></div>
  <p class="fine" style="margin-top:12px">91 is the sample team's real Strength Score today; 84 shows the second band's colour.</p>

  <h2 class="u">Pokémon on the floor</h2>
  <div class="six">${team.map((n, i) => V2.mon(n, {sel: i === 0, sub: items[i]})).join('')}</div>
  <p class="fine" style="margin-top:12px">Every Pokémon stands on a pool of its own colour; feet and names sit on one line; the selected one stands on its tilted panel.</p>

  <h2 class="u">Slider</h2>
  ${V2.slide('guide-meta', [['rating', 'Rating'], ['usage', 'Usage'], ['sets', 'Sets']], 'rating', 'Show')} ${V2.slide('guide-box', [['all', 'Whole roster'], ['box', 'My Box'], ['catch', 'Box + catch']], 'all', 'Pokémon to use')}

  <h2 class="u">Search field</h2>
  <label class="np-field" style="max-width:520px">${V2.ICON.search}<input type="search" id="sg-search" placeholder="Find a Pokémon, move or item" aria-label="Find a Pokémon, move or item"></label>

  <h2 class="u">Forms strip</h2>
  <div class="np-forms" style="max-width:560px"><div class="k"><span>Forms · tap one to open it</span><a class="np-link" href="#guide">Compare all 3 ›</a></div>
  <div class="r" role="tablist">${V2.mon('Garchomp', {sel: true, sub: 'S tier'})}${V2.mon('Garchomp-Mega', {sub: 'D tier'})}${V2.mon('Garchomp-Mega-Z', {sub: 'A tier'})}</div></div>

  <h2 class="u">Sheet and toast</h2>
  <div class="row"><button type="button" class="np-btn2" data-v2sheet><span>Open a sheet</span></button><button type="button" class="np-btn2" data-v2toast><span>Show a toast</span></button></div>

  <h2 class="u">Today's underdog</h2>
  <div class="np-under" style="max-width:720px">${V2.mon('Flapple', {bare: true, ft: true})}
  <div><div class="np-eyebrow">Today's underdog</div><h3 class="u">Flapple. <span>Somebody's favourite.</span></h3><p>Rarely picked in tournaments, but every Pokémon deserves its moment. Maybe it's yours?</p>
  <div class="acts"><a class="np-btn" href="#guide">Build around it</a><a class="np-link" href="#guide">Info Sheet</a></div><p class="np-or"><a class="np-link" href="#guide">Or build around your favourite Pokémon ›</a></p></div></div>
</section>
<div class="np-dock"><b class="u" style="font-size:var(--t20)">91</b><span class="fine">Sun Tailwind</span><div class="six">${team.map(n => `<img src="${V2.art(SPRITE_ID[n])}" alt="${V2.esc(V2.disp(n))}">`).join('')}</div><a class="np-btn2" href="#guide"><span>Open My Team</span></a></div>`; },
  after() {}
};
// sheet and toast demos use the shell's real ones
document.addEventListener('click', e => {
  if (e.target.closest('[data-v2sheet]')) V2.sheet(`<div style="padding:var(--s8)"><h2 class="u" style="font-size:var(--t28)">A sheet</h2><p style="margin-top:var(--s3);color:var(--ink-2)">A solid surface over the page. Close it with ✕, Escape or a tap outside; the keyboard returns to the button that opened it.</p></div>`, {label: 'Example sheet'});
  if (e.target.closest('[data-v2toast]')) V2.toast('Garchomp added to your team <button type="button">Undo</button>');
});
