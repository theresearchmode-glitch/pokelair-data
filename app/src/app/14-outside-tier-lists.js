// ---------- Outside tier lists (snapshot Oct 23, 2026), used to keep our rating in line with the community ----------
// Names are as the sources list them; a base name stands for its Mega when the Pokémon has one (usage lists merge them).
const EXT_TIERS = {
  showdowntier: {date: '2026-10-22', label: 'Showdown Tier (ladder, Oct 8–22)', score: {A: 90, B: 76, C: 62, D: 48, E: 34},
    tiers: {A: ['Sneasler'], B: ['Rillaboom', 'Incineroar', 'Garchomp', 'Archaludon', 'Raichu', 'Kingambit', 'Charizard', 'Pelipper', 'Golisopod', 'Basculegion', 'Salamence', 'Basculegion-F'],
      C: ['Indeedee-F', 'Farigiraf', 'Gholdengo', 'Volcarona', 'Tyranitar', 'Milotic', 'Sylveon', 'Politoed', 'Floette-Eternal', 'Grimmsnarl', 'Venusaur', 'Staraptor', 'Indeedee', 'Excadrill', 'Gardevoir', 'Arcanine-Hisui', 'Froslass', 'Swampert'],
      D: ['Whimsicott', 'Sinistcha', 'Torkoal', 'Kommo-o', 'Dragonite', 'Armarouge', 'Primarina', 'Annihilape', 'Glimmora', 'Delphox', 'Aerodactyl'],
      E: ['Gengar', 'Metagross', 'Lucario', 'Ninetales-Alola', 'Corviknight', 'Dragapult', 'Blaziken', 'Talonflame', 'Sableye', 'Camerupt', 'Blastoise', 'Toxapex', 'Baxcalibur', 'Hatterene', 'Maushold', 'Espathra', 'Typhlosion-Hisui', 'Sceptile', 'Hydreigon', 'Absol', 'Mawile', 'Rotom-Wash', 'Pawmot', 'Rotom-Heat', 'Ceruledge', 'Alakazam', 'Gallade', 'Meganium', 'Grapploct', 'Clefable', 'Tsareena', 'Zoroark-Hisui', 'Drampa', 'Scovillain', 'Meowscarada', 'Kangaskhan', 'Vivillon', 'Lopunny', 'Gliscor', 'Chandelure']}},
  pokemonzone: {date: '2026-10-23', label: 'Pokémon Zone (tournament win rate, 443 events)', score: {A: 90, B: 78, C: 66, D: 54},
    tiers: {A: ['Arcanine-Hisui', 'Floette-Eternal', 'Raichu', 'Charizard', 'Gholdengo'], B: ['Excadrill', 'Staraptor', 'Kingambit', 'Rillaboom', 'Sneasler', 'Salamence', 'Archaludon', 'Incineroar'],
      C: ['Grimmsnarl', 'Tyranitar', 'Indeedee', 'Basculegion', 'Milotic', 'Sinistcha', 'Garchomp', 'Pelipper', 'Sylveon', 'Farigiraf', 'Volcarona'], D: ['Gardevoir', 'Whimsicott', 'Golisopod', 'Indeedee-F']}},
  game8: {date: '2026-09-14', label: 'Game8 (ranked doubles)', score: {S: 92, 'A+': 80, A: 68, B: 55, C: 42},
    tiers: {S: ['Floette-Eternal', 'Charizard', 'Rillaboom', 'Incineroar', 'Garchomp', 'Sneasler', 'Kingambit', 'Basculegion'],
      'A+': ['Delphox', 'Staraptor', 'Swampert', 'Salamence', 'Dragonite', 'Gengar', 'Blastoise', 'Froslass', 'Raichu', 'Sylveon', 'Indeedee-F', 'Archaludon', 'Whimsicott', 'Venusaur', 'Sinistcha', 'Grimmsnarl', 'Armarouge', 'Farigiraf'],
      A: ['Golisopod', 'Aerodactyl', 'Camerupt', 'Scovillain', 'Tyranitar', 'Kangaskhan', 'Torkoal', 'Milotic', 'Pelipper', 'Talonflame', 'Excadrill', 'Toxapex', 'Annihilape', 'Gholdengo'],
      B: ['Absol', 'Lucario', 'Glimmora', 'Scizor', 'Mawile', 'Gardevoir', 'Blaziken', 'Pyroar', 'Politoed', 'Rotom-Wash', 'Ninetales-Alola', 'Primarina', 'Aegislash', 'Mamoswine'],
      C: ['Crabominable', 'Scrafty', 'Kommo-o', 'Meowscarada', 'Corviknight', 'Espathra', 'Dragapult']}}};
// Average outside score for p (doubles only), or null if no source lists it. A listed base name counts fully for its
// Mega forms; the plain form of a Pokémon whose listing really means its Mega gets the score minus 15.
let extCache = null;
function extScore(p) {
  if (S.format !== 'doubles') return null;
  if (!extCache) { extCache = new Map();
    for (const src of Object.values(EXT_TIERS)) for (const [t, names] of Object.entries(src.tiers)) for (const n of names) {
      const sc = src.score[t], q = byName.get(n), forms = ROSTER.filter(r => r.n === n || (q && r.b === q.b && (r.m || r.n === q.n)));
      for (const f of (forms.length ? forms : [])) { const megaExists = q && !q.m && ROSTER.some(r => r.m && r.b === q.b);
        const v = f.m || !megaExists || f.n !== q.n ? sc : sc - 15; const a = extCache.get(f.n) || []; a.push(v); extCache.set(f.n, a); } } }
  const a = extCache.get(p.n); return a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
}

// One line of real evidence for a Pokémon, for cards and rankings.
function evidenceLine(p) { const r = rating(p);
  if (r.src) { const t = r.src.tour, o = r.src.official, bits = [];
    if (t) bits.push(`${t[0]}% of tournament teams, ${t[1]}% of ${t[2].toLocaleString()} games won`);
    if (o && o[2] >= 50) bits.push(`official events ${o[1]}% of ${o[2].toLocaleString()}`);
    if (r.src.prd != null) bits.push(`${r.src.prd}% of top-10% ladder teams`);
    if (bits.length) return bits.join(' · '); }
  if (r.usage != null) return `On ${r.usage}% of tournament teams${r.matches ? `, ${r.wr}% of ${r.matches.toLocaleString()} games won` : ''}`;
  if (r.rank != null) return `#${r.rank} most used on the singles ladder`;
  return 'No tournament or ladder data yet'; }

