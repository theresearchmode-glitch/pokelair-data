// ---------- archetype guides: how each common team style wins, how often it shows up, and what you have against it ----------
const GUIDE = {
  tr: {what: 'Sets Trick Room so its slow, hard-hitting Pokémon move first for 4 turns.',
    beat: ['Fake Out or Taunt the setter on turn 1, or double-target it before it moves', 'Imprison or your own Trick Room cancels theirs', 'Protect and stall the 4 turns with your slow or bulky Pokémon', 'Keep a slow attacker in back that still moves first under their room'],
    tools: {moves: ['Fake Out', 'Taunt', 'Imprison', 'Trick Room', 'Encore', 'Quash'], abil: ['Prankster']}},
  tw: {what: 'Sets Tailwind to double its side\'s Speed for 4 turns, then overwhelms you with fast attackers.',
    beat: ['Set your own Tailwind or Trick Room in response', 'Icy Wind or Electroweb to drop their Speed', 'Fake Out the setter and attack the partner', 'Protect through the turns and come back when it ends'],
    tools: {moves: ['Tailwind', 'Trick Room', 'Icy Wind', 'Electroweb', 'Fake Out', 'Taunt', 'Thunder Wave', 'Quick Guard'], abil: ['Prankster', 'Intimidate']}},
  rain: {what: 'Rain powers Water moves by 50%, makes Hurricane and Thunder always hit, and doubles Swift Swim Speed.',
    beat: ['Bring your own weather setter to overwrite the rain', 'Water Absorb, Storm Drain or Grass types to take the Water hits', 'Trick Room or Tailwind against Swift Swim speed', 'Pressure the setter (Pelipper, Politoed) so it can\'t come back in'],
    tools: {moves: ['Trick Room', 'Tailwind', 'Wide Guard'], abil: ['Drought', 'Sand Stream', 'Snow Warning', 'Water Absorb', 'Storm Drain', 'Dry Skin'], types: ['Grass', 'Dragon']}},
  sun: {what: 'Sun powers Fire moves by 50%, weakens Water, makes Solar Beam one turn and doubles Chlorophyll Speed.',
    beat: ['Bring your own weather setter to overwrite the sun', 'Flash Fire or Fire resists to take Heat Wave', 'Rock Slide and Wide Guard against Charizard and spread fire', 'Trick Room or Tailwind against Chlorophyll speed'],
    tools: {moves: ['Wide Guard', 'Trick Room', 'Tailwind', 'Rock Slide'], abil: ['Drizzle', 'Sand Stream', 'Snow Warning', 'Flash Fire', 'Well-Baked Body'], types: ['Water', 'Rock', 'Dragon']}},
  sand: {what: 'Sand chips non-Rock/Ground/Steel Pokémon, boosts Rock Sp. Def and Sand Rush or Sand Force abusers.',
    beat: ['Overwrite the sand with your own weather', 'Water, Grass and Fighting attacks into the Rock and Ground cores', 'Trick Room against Sand Rush'],
    tools: {moves: ['Trick Room'], abil: ['Drizzle', 'Drought', 'Snow Warning'], types: ['Water', 'Grass', 'Fighting']}},
  snow: {what: 'Snow boosts Ice types\' Defense, makes Blizzard always hit and enables Aurora Veil.',
    beat: ['Overwrite the snow with your own weather', 'Fire, Steel and Fighting attacks into the Ice types', 'Break Aurora Veil with Brick Break or wait it out'],
    tools: {moves: ['Brick Break', 'Psychic Fangs'], abil: ['Drizzle', 'Drought', 'Sand Stream'], types: ['Fire', 'Steel', 'Fighting']}},
  psy: {what: 'Psychic Terrain blocks priority on grounded Pokémon and powers Psychic moves; Expanding Force hits both of you.',
    beat: ['Flying or Levitate Pokémon ignore the terrain', 'Dark types are immune to Psychic moves', 'It blocks Fake Out and other priority moves into grounded Pokémon, so plan on Taunt or double-targeting instead', 'Your own terrain setter replaces theirs'],
    tools: {moves: ['Taunt'], abil: ['Grassy Surge', 'Electric Surge', 'Misty Surge', 'Levitate'], types: ['Dark', 'Flying', 'Steel']}},
  grassy: {what: 'Grassy Terrain heals grounded Pokémon, powers Grass moves and gives Grassy Glide priority; it also halves Earthquake.',
    beat: ['Fire, Flying and Poison attacks into Rillaboom', 'Your own terrain setter replaces theirs', 'Intimidate and Wide Guard blunt the physical spread pressure'],
    tools: {moves: ['Wide Guard'], abil: ['Psychic Surge', 'Electric Surge', 'Misty Surge', 'Intimidate'], types: ['Fire', 'Flying', 'Poison']}}};
const GUIDE_ORDER = ['tr', 'tw', 'rain', 'sun', 'sand', 'snow', 'psy', 'grassy'];
function renderGuides() { const el = $('guideOut'); if (!el) return;
  const T = (META.teams && META.teams.teams) || [];
  // how common: share of recent top teams whose read archetype includes this style
  const counts = {}; let n = 0;
  for (const t of T) { const th = t.mons.map(x => byName.get(x)).filter(Boolean).map(oppMember); if (th.length < 6) continue; n++;
    let lab = ''; try { const a = teamArchetype(th); lab = (a && a.label || '').toLowerCase(); } catch (e) {}
    // weather and terrain only count when the team has the setter; Trick Room and Tailwind come from the team's read plan
    for (const k of GUIDE_ORDER) { const A = ARCH[k]; const has = A.setAb ? th.some(o => A.setAb.includes(o.ability)) : lab.includes(A.name.toLowerCase());
      if (has) counts[k] = (counts[k] || 0) + 1; } }
  // key Pokémon: setters and abusers by usage; for Trick Room and Tailwind, the Pokémon that run the move most
  const doc = META.doubles_tour || META.doubles;
  const moveUsers = mv => (doc && doc.top || []).filter(r => (r.mv || []).some(([m, pc]) => m === mv && pc >= 30)).slice(0, 6).map(r => byName.get(r.n)).filter(Boolean);
  const keyMons = k => { if (k === 'tr') return moveUsers('Trick Room'); if (k === 'tw') return moveUsers('Tailwind');
    const A = ARCH[k]; return ROSTER.filter(p => (A.setAb || []).some(a => p.a.includes(a)) || (A.abN || []).includes(p.n)).sort((a, b) => U(b) - U(a)).slice(0, 6); };
  const ms = members();
  const yours = k => { const t = GUIDE[k].tools, out = [];
    for (const m of ms) { const mv = new Set(memberMoves(m).moves.map(x => x.name)); const why = [];
      (t.moves || []).forEach(x => { if (mv.has(x)) why.push(x); }); (t.abil || []).forEach(a => { if (m.ability === a) why.push(a); });
      (t.types || []).forEach(ty => { if (m.types.includes(ty) && !why.includes(ty + ' type')) why.push(ty + ' type'); });
      if (why.length) out.push(`<b>${esc(m.d)}</b> (${why.slice(0, 3).map(esc).join(', ')})`); }
    return out; };
  el.innerHTML = `<p class="t2">${n ? `Read from the latest ${n} top tournament teams.` : 'Usage numbers appear once top teams load.'} Tap a guide to see how to play into it.</p>` + GUIDE_ORDER.map(k => { const g = GUIDE[k], c = counts[k] || 0, km = keyMons(k), y = ms.length ? yours(k) : null;
    return `<details class="plan guide"><summary><span class="pt">${esc(ARCH[k].name)}</span>${n ? `<span class="vsub">${Math.round(100 * c / n)}% of top teams</span>` : ''}<span class="gkm">${km.slice(0, 5).map(p => sprite(p, 'mini') || '').join('')}</span></summary>
      <p>${esc(g.what)}</p>${km.length ? `<p class="t2">Key Pokémon: ${km.map(p => esc(p.d)).join(', ')}</p>` : ''}
      <h4>How to beat it</h4><ul>${g.beat.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      ${y ? `<h4>What your team has</h4><p>${y.length ? y.join(' · ') : '<span class="no">Nothing that directly counters it. Consider one of the tools above.</span>'}</p>` : ''}</details>`; }).join(''); }
