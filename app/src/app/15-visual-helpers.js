// a Pokémon name for display, with its form letter kept on the same line ("Mega Charizard Y" never ends a line on "Y")
const escName = n => esc(n).replace(/ ([XYZ])$/, '\u00a0$1');
// ---------- visual helpers shared by every page ----------
// Pokémon sprites: Pokémon HOME renders from the PokéAPI sprite collection, cropped and shrunk to 160px WebP (about 7 KB
// each), published next to the page as sp/<PokéAPI id>.webp. Loaded lazily; a missing file just disappears.
const SPRITE_ID = {"Venusaur":3,"Venusaur-Mega":10033,"Charizard":6,"Charizard-Mega-X":10034,"Charizard-Mega-Y":10035,"Blastoise":9,"Blastoise-Mega":10036,"Beedrill":15,"Beedrill-Mega":10090,"Pidgeot":18,"Pidgeot-Mega":10073,"Arbok":24,"Pikachu":25,"Raichu":26,"Raichu-Alola":10100,"Raichu-Mega-X":10304,"Raichu-Mega-Y":10305,"Clefable":36,"Clefable-Mega":10278,"Ninetales":38,"Ninetales-Alola":10104,"Wigglytuff":40,"Vileplume":45,"Persian":53,"Persian-Alola":10108,"Perrserker":863,"Arcanine":59,"Arcanine-Hisui":10230,"Politoed":186,"Alakazam":65,"Alakazam-Mega":10037,"Machamp":68,"Victreebel":71,"Victreebel-Mega":10279,"Slowbro":80,"Slowbro-Mega":10071,"Slowbro-Galar":10165,"Slowking":199,"Slowking-Galar":10172,"Farfetch\u2019d":83,"Sirfetch\u2019d":865,"Gengar":94,"Gengar-Mega":10038,"Steelix":208,"Steelix-Mega":10072,"Rhyperior":464,"Kangaskhan":115,"Kangaskhan-Mega":10039,"Starmie":121,"Starmie-Mega":10280,"Mr. Mime":122,"Mr. Rime":866,"Scizor":212,"Scizor-Mega":10046,"Kleavor":900,"Pinsir":127,"Pinsir-Mega":10040,"Tauros":128,"Tauros-Paldea-Combat":10250,"Tauros-Paldea-Blaze":10251,"Tauros-Paldea-Aqua":10252,"Gyarados":130,"Gyarados-Mega":10041,"Ditto":132,"Vaporeon":134,"Jolteon":135,"Flareon":136,"Espeon":196,"Umbreon":197,"Leafeon":470,"Glaceon":471,"Sylveon":700,"Aerodactyl":142,"Aerodactyl-Mega":10042,"Snorlax":143,"Dragonite":149,"Dragonite-Mega":10281,"Meganium":154,"Meganium-Mega":10282,"Typhlosion":157,"Typhlosion-Hisui":10233,"Feraligatr":160,"Feraligatr-Mega":10283,"Ariados":168,"Ampharos":181,"Ampharos-Mega":10045,"Azumarill":184,"Farigiraf":981,"Forretress":205,"Gliscor":472,"Qwilfish":211,"Overqwil":904,"Heracross":214,"Heracross-Mega":10047,"Weavile":461,"Sneasler":903,"Mamoswine":473,"Skarmory":227,"Skarmory-Mega":10284,"Houndoom":229,"Houndoom-Mega":10048,"Wyrdeer":899,"Tyranitar":248,"Tyranitar-Mega":10049,"Sceptile":254,"Sceptile-Mega":10065,"Blaziken":257,"Blaziken-Mega":10050,"Swampert":260,"Swampert-Mega":10064,"Pelipper":279,"Gardevoir":282,"Gardevoir-Mega":10051,"Gallade":475,"Gallade-Mega":10068,"Sableye":302,"Sableye-Mega":10066,"Mawile":303,"Mawile-Mega":10052,"Aggron":306,"Aggron-Mega":10053,"Medicham":308,"Medicham-Mega":10054,"Manectric":310,"Manectric-Mega":10055,"Roserade":407,"Swalot":317,"Sharpedo":319,"Sharpedo-Mega":10070,"Camerupt":323,"Camerupt-Mega":10087,"Torkoal":324,"Altaria":334,"Altaria-Mega":10067,"Milotic":350,"Castform":351,"Banette":354,"Banette-Mega":10056,"Chimecho":358,"Chimecho-Mega":10306,"Absol":359,"Absol-Mega":10057,"Absol-Mega-Z":10307,"Glalie":362,"Glalie-Mega":10074,"Froslass":478,"Froslass-Mega":10285,"Salamence":373,"Salamence-Mega":10089,"Metagross":376,"Metagross-Mega":10076,"Torterra":389,"Infernape":392,"Empoleon":395,"Staraptor":398,"Staraptor-Mega":10308,"Luxray":405,"Rampardos":409,"Bastiodon":411,"Lopunny":428,"Lopunny-Mega":10088,"Spiritomb":442,"Garchomp":445,"Garchomp-Mega":10058,"Garchomp-Mega-Z":10309,"Lucario":448,"Lucario-Mega":10059,"Lucario-Mega-Z":10310,"Hippowdon":450,"Toxicroak":454,"Abomasnow":460,"Abomasnow-Mega":10060,"Rotom":479,"Rotom-Heat":10008,"Rotom-Wash":10009,"Rotom-Frost":10010,"Rotom-Fan":10011,"Rotom-Mow":10012,"Serperior":497,"Emboar":500,"Emboar-Mega":10286,"Samurott":503,"Samurott-Hisui":10236,"Watchog":505,"Liepard":510,"Simisage":512,"Simisear":514,"Simipour":516,"Musharna":518,"Excadrill":530,"Excadrill-Mega":10287,"Audino":531,"Audino-Mega":10069,"Conkeldurr":534,"Scolipede":545,"Scolipede-Mega":10288,"Whimsicott":547,"Basculegion":902,"Basculegion-F":10248,"Krookodile":553,"Scrafty":560,"Scrafty-Mega":10289,"Cofagrigus":563,"Runerigus":867,"Garbodor":569,"Zoroark":571,"Zoroark-Hisui":10239,"Reuniclus":579,"Vanilluxe":584,"Emolga":587,"Eelektross":604,"Eelektross-Mega":10290,"Chandelure":609,"Chandelure-Mega":10291,"Beartic":614,"Stunfisk":618,"Stunfisk-Galar":10180,"Golurk":623,"Golurk-Mega":10313,"Hydreigon":635,"Volcarona":637,"Chesnaught":652,"Chesnaught-Mega":10292,"Delphox":655,"Delphox-Mega":10293,"Greninja":658,"Greninja-Mega":10294,"Diggersby":660,"Talonflame":663,"Vivillon":666,"Pyroar":668,"Pyroar-Mega":10295,"Floette-Eternal":10061,"Floette-Mega":10296,"Florges":671,"Gogoat":673,"Pangoro":675,"Furfrou":676,"Meowstic":678,"Meowstic-F-Mega":10326,"Aegislash":681,"Aromatisse":683,"Slurpuff":685,"Malamar":687,"Malamar-Mega":10297,"Barbaracle":689,"Barbaracle-Mega":10298,"Dragalge":691,"Dragalge-Mega":10299,"Clawitzer":693,"Heliolisk":695,"Tyrantrum":697,"Aurorus":699,"Hawlucha":701,"Hawlucha-Mega":10300,"Dedenne":702,"Goodra":706,"Goodra-Hisui":10242,"Klefki":707,"Trevenant":709,"Gourgeist":711,"Gourgeist-Small":10030,"Gourgeist-Large":10031,"Gourgeist-Super":10032,"Avalugg":713,"Avalugg-Hisui":10243,"Noivern":715,"Decidueye":724,"Decidueye-Hisui":10244,"Incineroar":727,"Primarina":730,"Toucannon":733,"Crabominable":740,"Crabominable-Mega":10315,"Lycanroc":745,"Lycanroc-Midnight":10126,"Lycanroc-Dusk":10152,"Toxapex":748,"Mudsdale":750,"Araquanid":752,"Salazzle":758,"Tsareena":763,"Oranguru":765,"Passimian":766,"Golisopod":768,"Golisopod-Mega":10316,"Drampa":780,"Drampa-Mega":10302,"Kommo-o":784,"Rillaboom":812,"Cinderace":815,"Inteleon":818,"Corviknight":823,"Thievul":828,"Flapple":841,"Appletun":842,"Sandaconda":844,"Toxtricity":849,"Toxtricity-Low-Key":10184,"Grapploct":853,"Polteageist":855,"Hatterene":858,"Grimmsnarl":861,"Alcremie":869,"Falinks":870,"Falinks-Mega":10303,"Pincurchin":871,"Indeedee":876,"Indeedee-F":10186,"Morpeko":877,"Dragapult":887,"Meowscarada":908,"Skeledirge":911,"Quaquaval":914,"Houndstone":972,"Espathra":956,"Palafin":964,"Arboliva":930,"Scovillain":952,"Scovillain-Mega":10320,"Bellibolt":939,"Orthworm":968,"Maushold":925,"Baxcalibur":998,"Baxcalibur-Mega":10325,"Pawmot":923,"Squawkabilly":931,"Squawkabilly-Blue":10260,"Squawkabilly-Yellow":10261,"Squawkabilly-White":10262,"Garganacl":934,"Glimmora":970,"Glimmora-Mega":10321,"Mabosstiff":943,"Gholdengo":1000,"Tinkaton":959,"Armarouge":936,"Ceruledge":937,"Kingambit":983,"Annihilape":979,"Sinistcha":1013,"Archaludon":1018,"Hydrapple":1019,"Meowstic-M-Mega":10314,"Mimikyu":778};
// a sprite the page has already shown loads straight from memory (no lazy load, no async decode), so redraws never blank it
const SPR_SEEN = new Set();
// sprites are 512px HOME renders (Nov 1, Sim: keep sprites high quality; the info sheet draws them at 248 CSS px)
function sprite(p, cls) { const id = p && SPRITE_ID[p.n]; if (!id) return ''; const src = `sp/${id}.webp`;
  return `<img class="spr${cls ? ' ' + cls : ''}" src="${src}" alt=""${SPR_SEEN.has(src) ? '' : ' loading="lazy" decoding="async"'} width="160" height="160">`; }
// No flicker on redraws (Sim, Oct 30): a redraw replaces whole sections, which made every picture reload and flash on phones.
// When a redraw removes a sprite and adds the same one back, the old, already-decoded picture is put back in place of the
// new copy before the screen paints (observer callbacks run before paint), taking the new copy's class and attributes.
if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('load', e => { const t = e.target; if (t && t.classList && t.classList.contains('spr')) SPR_SEEN.add(t.getAttribute('src')); }, true);
  // pictures removed in the last second stay available, for sections that clear first and refill a moment later
  let sprRecent = new Map(), sprT = 0;
  const sprMO = new MutationObserver(recs => { const pool = new Map(), all = sprRecent, added = [], put = (m, k, v) => (m.get(k) || m.set(k, []).get(k)).push(v);
    clearTimeout(sprT); sprT = setTimeout(() => { sprRecent = new Map(); }, 1000);
    for (const r of recs) { for (const n of r.removedNodes) if (n.nodeType === 1 && !n.isConnected) for (const im of (n.matches('img.spr') ? [n] : n.querySelectorAll('img.spr'))) if (im.complete && im.naturalWidth) { const k = im.getAttribute('src'); put(pool, r.target, [k, im]); put(all, k, im); }
      for (const n of r.addedNodes) if (n.nodeType === 1) added.push([r.target, n]); }
    if (!all.size) return;
    // each section takes back its own pictures first (a redraw rebuilds hidden pages too, which must not take the visible ones)
    const take = (t, k) => { for (const [kk, im] of (pool.get(t) || [])) if (kk === k && !im.isConnected) return im; for (const im of (all.get(k) || [])) if (!im.isConnected) return im; return null; }; // a picture already put back is connected again, so it's never used twice
    for (const [t, n] of added) { if (!n.isConnected) continue; for (const im of (n.matches('img.spr') ? [n] : n.querySelectorAll('img.spr'))) { const old = take(t, im.getAttribute('src')); if (!old) continue;
      for (const a of [...old.attributes]) if (!im.hasAttribute(a.name)) old.removeAttribute(a.name);
      for (const a of [...im.attributes]) if (a.name !== 'src' && old.getAttribute(a.name) !== a.value) old.setAttribute(a.name, a.value);
      im.replaceWith(old); } }
    sprMO.takeRecords(); }); // drop the records of our own swaps, so they never trigger more swaps
  sprMO.observe(document.documentElement, {childList: true, subtree: true}); }
// a sprite that fails to load becomes an empty box of the same size, so grid rows (speed tiers, hit tables) keep their columns
if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('error', e => { const t = e.target; if (t && t.classList && t.classList.contains('spr')) { const s = document.createElement('span'); s.className = t.className + ' sprx'; s.setAttribute('aria-hidden', 'true'); t.replaceWith(s); } }, true);
// rating badge: the shown (school-scale) rating with its tier letter, in the tier's colour (Nov 2: it printed the internal
// score in a gold/silver/bronze palette of its own; now the same LTIERS colours and numbers as everywhere else)
function ratingTag(p) { const r = rating(p), t = RS(r.total), T = lTier(r.total), rk = typeof rankTxt === 'function' ? rankTxt(p) : '';
  return `<span class="tag rating lt" style="background:${tierBg(T.c)};color:${tierInk(T.c)};box-shadow:none" title="NastyPlot rating ${t} · ${T.k} tier${rk ? ' · ' + rk : ''} · ${esc(rRange(r))} · ${esc(evidenceLine(p))}" aria-label="NastyPlot rating ${t}, ${T.k} tier">${T.k} ${t}</span>`; }
/* Design pass A (Nov 2, item 1): numbers wear their band colour. bandAt(total) = ' data-band="S"' for an internal rating total;
   winSpan(v) marks a win rate as above / below the 50% average (.wrv[data-wr]). Since the Nov 2 declutter neither is coloured
   (numbers are plain ink); the markup stays so a future style can use it. */
function bandAt(total) { try { return ` data-band="${lTier(total).k}"`; } catch (e) { return ''; } }
function winSpan(v, avg) { if (v == null || v === '' || !isFinite(+v)) return winFmt(v); const d = +v - (avg == null ? 50 : avg);
  return `<span class="wrv" data-wr="${d >= 0.5 ? 'up' : d <= -0.5 ? 'down' : 'even'}">${winFmt(v)}</span>`; }
// Archetype labels as coloured chips (rain blue, sun orange, Grassy green, Trick Room purple...).
const ARCH_COLOR = {'Rain': '#2f7bff', 'Sun': '#ff7a1a', 'Sun-Rain': 'linear-gradient(90deg,#ff7a1a,#2f7bff)', 'Sand': '#c99a4a', 'Snow': '#7fd3ff',
  'Grassy Terrain': '#2fae4a', 'Psychic Terrain': '#ff4f9a', 'Electric Terrain': '#f2c200', 'Misty Terrain': '#f08ad0',
  'Tailwind': '#2fd0bd', 'Trick Room': '#9a64ff', 'Hard Trick Room': '#7a3dff', 'TailRoom': 'linear-gradient(90deg,#2fd0bd,#9a64ff)', 'Perish Trap': '#5b3fa8',
  'Balance': '#6f7a8f', 'Balance (Fake Out pressure)': '#6f7a8f', 'Offense': '#e2475b', 'Rocks + offense': '#a0765a'};
// chip text colour from the chip's own colours (Oct 31): dark ink when it reads better than white on every colour stop, else white
// (gradient chips also get a light shade under white text, see polish.css). Was a hand list that left TailRoom at 1.9:1.
const lumOf = hex => { const h = hex.replace('#', ''); return .2126 * lin(parseInt(h.slice(0, 2), 16)) + .7152 * lin(parseInt(h.slice(2, 4), 16)) + .0722 * lin(parseInt(h.slice(4, 6), 16)); }, lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05), INK_L = lumOf('#1a1206');
const archDark = c => { const st = (String(c).match(/#[0-9a-f]{6}/gi) || ['#6f7a8f']).map(lumOf); return Math.min(...st.map(l => cr(l, INK_L))) >= 4.5; }; /* legibility (Nov 2): dark text only where it reaches 4.5:1 on every stop, else white on a measured veil */
const ARCH_DARK_TEXT = {has: x => archDark(ARCH_COLOR[x] || '#6f7a8f')};
// Two-style tags (Sun-Snow, TailRoom) are a gradient of their two colours; --ac stays a solid colour so the chip is never
// see-through when the shared darkening layer replaces the background image (Oct 29: those chips were white on pale grey)
function archChips(label) { return String(label || '').split(' · ').filter(Boolean).map(x => { let c = ARCH_COLOR[x];
    if (!c && x.includes('-')) { const parts = x.split('-').map(y => ARCH_COLOR[y] || ARCH_COLOR[y.charAt(0).toUpperCase() + y.slice(1).toLowerCase()]).filter(y => y && !y.startsWith('linear')); if (parts.length === 2) c = `linear-gradient(90deg,${parts[0]},${parts[1]})`; }
    c = c || '#6f7a8f'; const g = c.startsWith('linear'), solid = g ? (c.match(/#[0-9a-f]{6}/i) || ['#6f7a8f'])[0] : c;
    const dk = ARCH_DARK_TEXT.has(x), sh = dk ? 0 : archShade(c);
    return `<span class="archchip${dk ? ' dk' : ''}${g ? ' grad' : ''}" style="--ac:${solid}${g ? `;--acg:${c}` : ''}${sh ? `;--acd:${sh}` : ''}">${esc(x)}</span>`; }).join(''); }
/* legibility (Nov 2): white chip text must reach 4.5:1 on every colour stop, so light chips get just enough of a dark
   veil (--acd, polish.css LEGIBILITY) instead of a lighter shade */
function archShade(c) { const st = (String(c).match(/#[0-9a-f]{6}/gi) || ['#6f7a8f']).map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
  for (let a = 0; a <= .75; a += .05) { const ok = st.every(([r, g, b]) => { const m = [r, g, b].map((v, i) => v * (1 - a) + [20, 18, 40][i] * a); return cr(1, .2126 * lin(m[0]) + .7152 * lin(m[1]) + .0722 * lin(m[2])) >= 4.6; }); if (ok) return +a.toFixed(2); }
  return .75; }


// a team's six as a compact grid (3 across on phones, 6 on wide screens): sprite + name, small Mega mark
function teamGrid(names, hl) { return `<div class="tgrid">${names.map(n => { const p = byName.get(n); if (!p) return '';
  return `<span class="tgm tyacc${hl && hl.has(p.d.toLowerCase()) ? ' hl' : ''}" style="${tyv(p)}" title="${esc(p.d)}">${sprite(p, 'tgs')}<span class="tgn${tgFit(tgName(p))}">${esc(tgName(p))}</span>${p.m ? '<i class="tgmk" title="Mega Evolution">M</i>' : ''}</span>`; }).join('')}</div>`; }
const tgFit = d => { d = String(d); const w = Math.max(...d.split(' ').map(x => x.length)); return w >= 11 || d.length >= 14 ? ' xs' : w >= 10 || d.length >= 10 ? ' sm' : ''; };
// the M mark says Mega, so the grid drops the word and keeps the name whole
const tgName = p => p.m ? String(p.d).replace(/^Mega /, '') : p.d;
/* ---------- Design pass B (Nov 2): type accents, mini graphics, "Details" taps ---------- */
/* a Pokémon's two type colours as CSS vars (a single type uses its colour twice; q = a partner whose first type is the
   second colour, for pairs); rows and cards with class "tyacc" get a side stripe and a soft wash (polish.css, design B block) */
function tyv(p, q) { if (!p || !p.t) return ''; const a = TC[p.t[0]] || '#8a90a6', b = q && q.t ? TC[q.t[0]] || a : TC[p.t[1] || p.t[0]] || a; return `--ta:${a};--tb:${b}`; }
/* a sprite sitting on a soft halo of its type colours (a background gradient on the picture itself: cheap, no filters) */
function sprH(p, cls) { const s = sprite(p, (cls ? cls + ' ' : '') + 'tyh'); return s ? s.replace('<img ', `<img style="${tyv(p)}" `) : ''; }
/* a small filled usage bar: v as a share of the list's biggest value (the number beside it says the real %) */
function ubar(v, max, tc) { v = +v || 0; max = +max || 0; if (!(v > 0) || !(max > 0)) return ''; const w = Math.max(4, Math.min(100, 100 * v / max));
  return `<i class="dbbar" aria-hidden="true"${tc ? ` style="--bc:${tc}"` : ''}><em style="width:${w.toFixed(0)}%"></em></i>`; }
/* a 7-day sparkline of a Pokémon's usage rank, from the daily history (tournament list; the other lists have no history).
   Higher on the chart = better rank. Green-ish when the rank improved, indigo when it slipped (never red). */
function rankSpark(name) { const h = typeof META !== 'undefined' && META.history; if (!h || !h.days || h.days.length < 3 || typeof trendKey !== 'function') return '';
  const k = trendKey(), d = h.days.slice(-8).map(x => x[k] && x[k][name]).filter(v => v != null); if (d.length < 3) return '';
  const lo = Math.min(...d), hi = Math.max(...d), W = 40, H = 14, sp = Math.max(1, hi - lo), pts = d.map((v, i) => `${(i * W / (d.length - 1)).toFixed(1)},${(1.5 + (v - lo) * (H - 3) / sp).toFixed(1)}`);
  const c = d[d.length - 1] < d[0] ? 'up' : d[d.length - 1] > d[0] ? 'dn' : 'fl', last = pts[pts.length - 1].split(',');
  return `<svg class="dbspark ${c}" viewBox="-2 -1 44 16" width="44" height="16" role="img" aria-label="Usage rank over ${d.length} days: #${d[0]} to #${d[d.length - 1]}"><title>Usage rank, last ${d.length} days: #${d.join(', #')}</title><polyline points="${pts.join(' ')}"/><circle cx="${last[0]}" cy="${last[1]}" r="2"/></svg>`; }
/* a ring that fills with how many of the top threats a team handles ("27 of 30"); the number inside is the handled count */
function hRing(h, sz) { if (!h || !h.n) return ''; const s = sz || 30, r = s / 2 - 3, C = 2 * Math.PI * r, f = Math.max(0, Math.min(1, h.x / h.n)), m = s / 2;
  return `<svg class="dbring" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true"><circle cx="${m}" cy="${m}" r="${r}" class="bg"/><circle cx="${m}" cy="${m}" r="${r}" class="fg" stroke-dasharray="${(C * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${m} ${m})"/>${s >= 24 ? `<text x="${m}" y="${m}" dy=".36em" text-anchor="middle">${h.x}</text>` : ''}</svg>`; }
/* "Details": secondary numbers wait behind one small tap. A box marked with dbAttr(key) shows its .dbsec parts once its
   Details button (dbBtn(key)) is pressed; the choice holds through redraws for this visit. */
var DB_OPEN = new Set();
function dbAttr(key) { return ` data-dbbox="${esc(key)}"${DB_OPEN.has(key) ? ' data-dbo="1"' : ''}`; }
function dbBtn(key, what) { const on = DB_OPEN.has(key); return `<button type="button" class="dbdt" data-dbdt="${esc(key)}" aria-expanded="${on}"${what ? ` aria-label="${on ? 'Hide' : 'Show'} details: ${esc(what)}"` : ''}>${on ? 'Hide details' : 'Details'}</button>`; }
if (typeof document !== 'undefined' && document.addEventListener) document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-dbdt]'); if (!b) return; e.preventDefault(); e.stopPropagation();
  const k = b.dataset.dbdt, on = !DB_OPEN.has(k); if (on) DB_OPEN.add(k); else DB_OPEN.delete(k);
  document.querySelectorAll('[data-dbbox]').forEach(x => { if (x.dataset.dbbox === k) { if (on) x.setAttribute('data-dbo', '1'); else x.removeAttribute('data-dbo'); } });
  document.querySelectorAll('[data-dbdt]').forEach(x => { if (x.dataset.dbdt !== k) return; x.setAttribute('aria-expanded', on); x.textContent = on ? 'Hide details' : 'Details'; const l = x.getAttribute('aria-label'); if (l) x.setAttribute('aria-label', l.replace(/^(Show|Hide)/, on ? 'Hide' : 'Show')); }); }, true);
