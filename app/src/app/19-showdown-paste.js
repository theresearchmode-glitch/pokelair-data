// ---------- Showdown paste import / export ----------
// Showdown writes a Mega as its base species holding the Mega Stone, with the base form's ability.
// Every Mega's stone, matched from the official item list (the names are irregular, so never guessed).
const MEGA_STONE = {"Venusaur-Mega":"Venusaurite","Charizard-Mega-X":"Charizardite X","Charizard-Mega-Y":"Charizardite Y","Blastoise-Mega":"Blastoisinite","Beedrill-Mega":"Beedrillite","Pidgeot-Mega":"Pidgeotite","Raichu-Mega-X":"Raichunite X","Raichu-Mega-Y":"Raichunite Y","Clefable-Mega":"Clefablite","Alakazam-Mega":"Alakazite","Victreebel-Mega":"Victreebelite","Slowbro-Mega":"Slowbronite","Gengar-Mega":"Gengarite","Steelix-Mega":"Steelixite","Kangaskhan-Mega":"Kangaskhanite","Starmie-Mega":"Starminite","Scizor-Mega":"Scizorite","Pinsir-Mega":"Pinsirite","Gyarados-Mega":"Gyaradosite","Aerodactyl-Mega":"Aerodactylite","Dragonite-Mega":"Dragoninite","Meganium-Mega":"Meganiumite","Feraligatr-Mega":"Feraligite","Ampharos-Mega":"Ampharosite","Heracross-Mega":"Heracronite","Skarmory-Mega":"Skarmorite","Houndoom-Mega":"Houndoominite","Tyranitar-Mega":"Tyranitarite","Sceptile-Mega":"Sceptilite","Blaziken-Mega":"Blazikenite","Swampert-Mega":"Swampertite","Gardevoir-Mega":"Gardevoirite","Gallade-Mega":"Galladite","Sableye-Mega":"Sablenite","Mawile-Mega":"Mawilite","Aggron-Mega":"Aggronite","Medicham-Mega":"Medichamite","Manectric-Mega":"Manectite","Sharpedo-Mega":"Sharpedonite","Camerupt-Mega":"Cameruptite","Altaria-Mega":"Altarianite","Banette-Mega":"Banettite","Chimecho-Mega":"Chimechite","Absol-Mega":"Absolite","Absol-Mega-Z":"Absolite Z","Glalie-Mega":"Glalitite","Froslass-Mega":"Froslassite","Salamence-Mega":"Salamencite","Metagross-Mega":"Metagrossite","Staraptor-Mega":"Staraptite","Lopunny-Mega":"Lopunnite","Garchomp-Mega":"Garchompite","Garchomp-Mega-Z":"Garchompite Z","Lucario-Mega":"Lucarionite","Lucario-Mega-Z":"Lucarionite Z","Abomasnow-Mega":"Abomasite","Emboar-Mega":"Emboarite","Excadrill-Mega":"Excadrite","Audino-Mega":"Audinite","Scolipede-Mega":"Scolipite","Scrafty-Mega":"Scraftinite","Eelektross-Mega":"Eelektrossite","Chandelure-Mega":"Chandelurite","Golurk-Mega":"Golurkite","Chesnaught-Mega":"Chesnaughtite","Delphox-Mega":"Delphoxite","Greninja-Mega":"Greninjite","Pyroar-Mega":"Pyroarite","Floette-Mega":"Floettite","Meowstic-M-Mega":"Meowsticite","Meowstic-F-Mega":"Meowsticite","Malamar-Mega":"Malamarite","Barbaracle-Mega":"Barbaracite","Dragalge-Mega":"Dragalgite","Hawlucha-Mega":"Hawluchanite","Crabominable-Mega":"Crabominite","Golisopod-Mega":"Golisopite","Drampa-Mega":"Drampanite","Falinks-Mega":"Falinksite","Scovillain-Mega":"Scovillainite","Baxcalibur-Mega":"Baxcalibrite","Glimmora-Mega":"Glimmoranite"};
function stoneFor(p) {
  const base = byName.get(p.b) || p;
  const fits = it => STONE_RE.test(it) && megaFormFor(base, {it: [[it, 100]]}).n === p.n;
  for (const doc of [META.doubles_ingame, META.doubles, META.singles, META.doubles_tour]) {
    if (!doc || !doc.top) continue;
    const t = doc.top.find(x => x.n === p.n || x.n === p.b);
    if (t && t.it) { const hit = t.it.find(([it]) => fits(it)); if (hit) return hit[0]; }
  }
  // the official in-game data lists the stones under the base form
  if (typeof SETS === 'object') for (const f of ['D', 'S']) { const r = SETS[f][gameKey(p)]; if (!r) continue;
    for (let i = 0; i < r[1].length; i += 2) { const it = SETS.IT[r[1][i]]; if (it && fits(it)) return it; } }
  if (MEGA_STONE[p.n]) return MEGA_STONE[p.n];   // the game's own stone names (Dragoninite, Heracronite, Sablenite...)
  const suf = (p.n.match(/-Mega-([XYZ])$/) || [])[1];
  return p.b + 'ite' + (suf ? ' ' + suf : '');
}
function exportPaste() {
  return members().map(m => {
    const p = m.p, base = byName.get(p.b) || p;
    const species = p.n === 'Meowstic-F-Mega' ? 'Meowstic-F' : p.m ? base.n : p.n, ti = topItems(p), item = m.item || (ti ? ti.it[0][0] : '');
    const ability = p.m ? (metaAbility(base) || bestAbility(base)) : m.ability;
    const mv = slotMoves(S.slots[m.i], p).names.filter(Boolean);
    // stat points: the most common real spread from the Showdown ladder (Champions stores them as EVs, 0-32 each)
    const cs = m.spread || (typeof commonSpread === 'function' ? commonSpread(p) : null), nat = cs && cs.nat ? cs.nat : (setFor(p).na[0] || [])[0];
    let ev = cs ? [['HP', cs.hp], ['Atk', cs.atk], ['Def', cs.def], ['SpA', cs.spa], ['SpD', cs.spd], ['Spe', cs.spe]].filter(x => x[1] > 0).map(([k, v]) => `${v} ${k}`).join(' / ') : '';
    // your own all-zero spread is written out, so re-importing it doesn't fall back to the assumed common spread
    if (!ev && cs && cs.mine && !cs.assumed) ev = '0 HP';
    return `${species}${item ? ' @ ' + item : ''}\nAbility: ${ability}\nLevel: 50${ev ? '\nEVs: ' + ev : ''}${nat ? '\n' + nat + ' Nature' : ''}\n${mv.map(x => '- ' + x).join('\n')}`.trim();
  }).join('\n\n');
}
// Nature and stat points from a paste: 'EVs: 2 HP / 32 Atk / 32 Spe' (Champions stat points, 0-32 each) and 'Jolly Nature'.
// Classic EVs (any value over 32) are converted at 8 EVs per stat point. Returns {nat, v: [hp, atk, def, spa, spd, spe]} or null.
function pasteSpread(lines) { const ev = (lines.find(l => /^EVs:/i.test(l)) || '').replace(/^EVs:\s*/i, ''), natL = lines.find(l => /^\w+\s+Nature\s*$/i.test(l));
  const nat = natL ? natL.replace(/\s+Nature\s*$/i, '').trim() : null, K = {hp: 0, atk: 1, def: 2, spa: 3, spd: 4, spe: 5}, v = [0, 0, 0, 0, 0, 0]; let any = false;
  for (const part of ev.split('/')) { const m = part.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i); if (!m) continue; v[K[m[2].toLowerCase()]] = +m[1]; any = true; }
  if (v.some(x => x > 32)) for (let i = 0; i < 6; i++) v[i] = Math.min(32, Math.floor(v[i] / 8));
  const okNat = nat && typeof NATURES !== 'undefined' && NATURES.includes(nat) ? nat : null;
  // ev: false when the paste has no readable EVs line (none at all, as on tournament team sheets, or one with nothing
  // parseable in it): the stat points are then assumed, not 0. "EVs: 0 HP" is a readable line, so it means 0.
  return any || okNat ? {nat: okNat, v, ev: any} : null; }
// An item from a paste is kept only if Champions has it: any item players run (usage data) or one the calc knows.
// Choice Band, Choice Specs and Assault Vest aren't in Champions. With no usage data loaded yet, anything is kept.
function pasteItemOK(it) { const NOT = ['Choice Band', 'Choice Specs', 'Assault Vest']; if (NOT.includes(it)) return false;
  // Covert Cloak, Safety Goggles and Clear Amulet are not in Champions (Showdown's Champions data marks them "Past")
  const extra = ['White Herb', 'Mental Herb', 'Lum Berry'], legal = typeof REGMC_ITEMS === 'object' ? REGMC_ITEMS : [];
  // before usage data arrives (a team link opened on load), the Reg M-C item list decides (stress test, Oct 28: anything was kept)
  let pool = []; try { pool = itemPool(); } catch (e) {} if (!pool.length) return legal.includes(it) || extra.includes(it);
  const known = new Set([...pool, ...legal, ...(typeof CALC_ITEMS !== 'undefined' ? CALC_ITEMS : []), ...extra]);
  return known.has(it); }
const pnorm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
function speciesFromPaste(name) {
  const k = pnorm(name); if (!k) return null;
  for (const p of ROSTER) if (pnorm(p.n) === k) return p;
  const alias = {meowsticf: 'Meowstic', meowsticm: 'Meowstic', meowsticmale: 'Meowstic', indeedeefemale: 'Indeedee-F', basculegionfemale: 'Basculegion-F', meowsticfemale: 'Meowstic', floette: 'Floette-Eternal', floetteeternalflower: 'Floette-Eternal', aegislashshield: 'Aegislash'};
  if (alias[k]) return byName.get(alias[k]) || null;
  for (const p of ROSTER) if (pnorm(p.d) === k) return p;
  return null;
}
// Returns {slots, notes}. Unknown Pokémon and moves are skipped and reported, never guessed.
// Moves from the paste become that Pokémon's moves for the current format.
function parsePaste(text) {
  const notes = [], slots = [], assumed = [];
  const blocks = String(text || '').replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).slice(0, 6);
  for (const b of blocks) {
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean); if (!lines.length) continue;
    let head = lines[0], item = '';
    const at = head.lastIndexOf(' @ '); if (at >= 0) { item = head.slice(at + 3).trim(); head = head.slice(0, at).trim(); if (typeof canonItem === 'function') item = canonItem(item); }
    const female = /\(F\)\s*$/.test(head); head = head.replace(/\s*\((M|F)\)\s*$/, '');
    const paren = head.match(/\(([^()]+)\)\s*$/); const speciesName = paren ? paren[1] : head;
    let p = speciesFromPaste(speciesName);
    if (!p) { notes.push(`Skipped "${speciesName}": not on the M-C roster`); continue; }
    if (item && !p.m && /ite( [XYZ])?$|inite/.test(item)) { const mf = megaFormFor(p, {it: [[item, 100]]}); if (mf !== p) p = mf;
      // Meowstic has a Mega for each gender: Showdown writes the female as "Meowstic-F" (stress test, Oct 28)
      if (p.n === 'Meowstic-M-Mega' && (female || pnorm(speciesName) === 'meowsticf') && byName.get('Meowstic-F-Mega')) p = byName.get('Meowstic-F-Mega'); }
    const abl = (lines.find(l => /^Ability:/i.test(l)) || '').replace(/^Ability:\s*/i, '').trim();
    // a Mega's ability is fixed by its form (Showdown pastes write the base form's), so it is filled in on import
    const ability = p.m ? (p.a[0] || null) : p.a.includes(abl) ? abl : null;
    const learn = new Set((LEARN[p.n] || []).map(k => MV[k].name)), mv = [];
    for (const l of lines.filter(l => l.startsWith('-'))) { const name = l.replace(/^-\s*/, '').replace(/\s*\[.*\]$/, '').trim();
      const m = [...mvByName.values()].find(x => pnorm(x.name) === pnorm(name));
      if (m && learn.has(m.name)) mv.push(m.name); else notes.push(`${p.d}: skipped move "${name}"`); }
    if (slots.some(s => byName.get(s.n).b === p.b)) { notes.push(`Skipped a second ${p.b} (one per species)`); continue; }
    const slot = {n: p.n, a: ability, lock: false};
    if (mv.length) { const c = mv.slice(0, 4); while (c.length < 4) c.push(''); slot.mv = {doubles: c}; }
    // the held item you registered (a Mega's stone is implied by the form), your nature and stat points
    if (item && !p.m && !STONE_RE.test(item) && item.length <= 40) { if (pasteItemOK(item)) slot.it = {doubles: item}; else notes.push(`${p.d}: skipped item "${item}" (not in Champions)`); }
    const sp = pasteSpread(lines), spSum = sp ? sp.v.reduce((a, x) => a + x, 0) : 0;
    // a nature with no EVs line (team sheets list none): your nature with the most common stat points, marked as assumed (stress test, Oct 28)
    if (sp && !sp.ev) { slot.sp = {doubles: {nat: sp.nat, assumed: true}}; assumed.push(p.d); }
    else if (sp && spSum > SP_TOTAL) notes.push(`${p.d}: skipped stat points (${spSum} in total; Champions allows ${SP_TOTAL})`); else if (sp) slot.sp = {doubles: {nat: sp.nat, v: sp.v}};
    slots.push(slot);
  }
  if (assumed.length) notes.push(`No stat points in the paste for ${assumed.join(', ')}: using the most common spread with your nature`);
  return {slots, notes};
}
function renderPastePanel() {
  const el = $('pastePanel'); if (!ui.paste) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  if (ui.paste === 'export') {
    el.innerHTML = `<div class="plan"><div class="ph"><span class="pt">Export to Showdown</span><button class="x" type="button" data-pastex="1" aria-label="Close">×</button></div>
      <textarea class="field paste" id="pasteOut" readonly rows="10">${esc(exportPaste())}</textarea>
      <div class="row"><button class="btn sm primary" type="button" id="pasteCopy">Copy</button><span class="t2">Paste into Showdown's teambuilder with Import from text. Items, natures and stat points are yours where you set them, otherwise the most common ones from real play (never two Pokémon on one item).</span></div></div>`;
  } else {
    el.innerHTML = `<div class="plan"><div class="ph"><span class="pt">Import a team</span><button class="x" type="button" data-pastex="1" aria-label="Close">×</button></div>
      <textarea class="field paste" id="pasteIn" rows="10" placeholder="Paste a NastyPlot team link, or a Showdown team (from Showdown, Pokémon Zone, Pikalytics or Victory Road)."></textarea>
      <div class="row"><button class="btn sm primary" type="button" id="pasteLoad">Replace my team</button><span class="t2">Pokepaste links can't be opened from here; copy the team text instead.</span></div>
      <div id="pasteNotes" class="t2"></div></div>`;
  }
}

