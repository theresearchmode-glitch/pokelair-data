// ---------- held items: team-aware defaults, Item Clause and items that can't work ----------
// VGC's Item Clause: no two Pokémon on a team may hold the same item. A member's item is either the one you chose
// (heldItem: from the item picker, a Showdown paste or a team link), its Mega Stone, or a default. Defaults are picked
// for the whole team at once: each Pokémon gets the most-used item for it that no teammate holds and that can work on
// this team (no terrain seed without that terrain, no weather rock unless it sets that weather itself, no Choice Scarf
// on a Trick Room team). Chosen items are never changed; problems with them are reported, with a fix.
// Tables live in a function (not top-level consts) so they're ready even if a team is built before this file runs.
let itTabCache = null;
function itTab() { return itTabCache || (itTabCache = {
  seed: {'Psychic Seed': 'psy', 'Grassy Seed': 'grassy', 'Electric Seed': 'elec', 'Misty Seed': 'misty'},
  rock: {'Heat Rock': 'sun', 'Damp Rock': 'rain', 'Smooth Rock': 'sand', 'Icy Rock': 'snow'},
  move: {'Sunny Day': ['w', 'sun'], 'Rain Dance': ['w', 'rain'], 'Sandstorm': ['w', 'sand'], 'Snowscape': ['w', 'snow'], 'Chilly Reception': ['w', 'snow'],
    'Psychic Terrain': ['t', 'psy'], 'Grassy Terrain': ['t', 'grassy'], 'Electric Terrain': ['t', 'elec'], 'Misty Terrain': ['t', 'misty']},
  // a safe spread of common held items, used only when every item players run on a Pokémon is already taken
  fallback: ['Sitrus Berry', 'Leftovers', 'Focus Sash', 'Life Orb', 'Lum Berry', 'Mental Herb', 'Safety Goggles', 'Covert Cloak', 'Expert Belt', 'Wide Lens', 'Shuca Berry', 'Occa Berry', 'Black Glasses', 'Charcoal', 'Mystic Water', 'Magnet']}); }
function memMoveNames(m) { const mv = m && (m._mv && m._mv.length ? m._mv : (m.moves || [])); return (mv || []).map(x => x && x.name).filter(Boolean); }
// the weather and terrain this team can set (abilities, and moves it runs)
function teamField(ms) { const T = itTab(), w = new Set(), t = new Set();
  for (const m of ms || []) { if (!m) continue; const ab = m.ability;
    if (typeof WEATHER_OF === 'object' && WEATHER_OF[ab]) w.add(WEATHER_OF[ab]); if (typeof TERRAIN_OF === 'object' && TERRAIN_OF[ab]) t.add(TERRAIN_OF[ab]);
    for (const n of memMoveNames(m)) { const f = T.move[n]; if (f) (f[0] === 'w' ? w : t).add(f[1]); } }
  return {w, t}; }
function setsField(m, kind, key) { const T = itTab(); if (kind === 'w' && typeof WEATHER_OF === 'object' && WEATHER_OF[m.ability] === key) return true;
  if (kind === 't' && typeof TERRAIN_OF === 'object' && TERRAIN_OF[m.ability] === key) return true; return memMoveNames(m).some(n => { const f = T.move[n]; return f && f[0] === kind && f[1] === key; }); }
const setsTR = m => memMoveNames(m).includes('Trick Room');
const fieldName = k => (typeof ARCH === 'object' && ARCH[k] && ARCH[k].name) || k;
// The Mega Stones in the game (from the roster's Megas, so "Eviolite" never counts as one)
let megaStoneSet = null;
function isMegaStone(item) { if (!megaStoneSet) { megaStoneSet = new Set(); try { for (const p of ROSTER) if (p.m) { const s = stoneFor(p); if (s) megaStoneSet.add(s); } } catch (e) { megaStoneSet = null; return false; } } return megaStoneSet.has(item); }
// Why an item can't work on this team (or '' if it can). Used for defaults and for checking your own picks.
function itemDeadWhy(m, item, ms, F, tr) { const T = itTab(); if (!item) return '';
  if (T.seed[item] && !F.t.has(T.seed[item])) return `${m.d}'s ${item} never activates: nothing on the team sets ${fieldName(T.seed[item])}.${m.ability === 'Unburden' ? ' So Unburden never triggers either.' : ''}`;
  if (T.rock[item] && !setsField(m, 'w', T.rock[item])) return `${m.d}'s ${item} does nothing: it only lengthens ${fieldName(T.rock[item])} that its holder sets, and ${m.d} doesn't set it.`;
  if (item === 'Choice Scarf' && tr) return `${m.d} holds Choice Scarf on a Trick Room team: once Trick Room is up, the Scarf makes it move later.`;
  // extenders only lengthen what their holder sets itself (stress test, Oct 28: these passed as "Items work")
  if (item === 'Light Clay' && !memMoveNames(m).some(n => ['Reflect', 'Light Screen', 'Aurora Veil'].includes(n))) return `${m.d}'s Light Clay does nothing: it only lengthens Reflect, Light Screen or Aurora Veil that its holder sets, and ${m.d} doesn't run any of them.`;
  if (!(m.p && m.p.m) && isMegaStone(item)) return `${m.d} holds ${item}, which does nothing here: a Mega Stone only works when the Mega form of its own Pokémon is on the team.`;
  if (item === 'Terrain Extender' && !['psy', 'grassy', 'elec', 'misty'].some(k => setsField(m, 't', k))) return `${m.d}'s Terrain Extender does nothing: it only lengthens terrain that its holder sets, and ${m.d} doesn't set any.`;
  return ''; }
// Item Clause breaks: the same item on two or more members (by their current items)
function itemClash(ms) { const by = new Map(); for (const m of ms || []) { if (!m || !m.item) continue; if (!by.has(m.item)) by.set(m.item, []); by.get(m.item).push(m); }
  return [...by].filter(([, a]) => a.length > 1).map(([item, a]) => ({item, ms: a})); }
// Items that can't work on this team: dead seeds and rocks, Choice Scarf under your own Trick Room
function deadItems(ms) { const F = teamField(ms), tr = (ms || []).some(m => m && setsTR(m)), out = [];
  for (const m of ms || []) { if (!m || !m.item) continue; const why = itemDeadWhy(m, m.item, ms, F, tr); if (why) out.push({m, item: m.item, why, k: m.item === 'Choice Scarf' ? 'scarftr' : 'dead'}); }
  return out; }
// Everything wrong with a team's items, each with plain words: [{k: 'clause'|'dead'|'scarftr', ms, item, why}]
function itemProblems(ms) { const out = itemClash(ms).map(c => ({k: 'clause', ms: c.ms, item: c.item, why: `${c.ms.map(m => m.d).join(' and ')} both hold ${c.item}. VGC's Item Clause allows each item only once per team, so this team can't be registered.`}));
  for (const d of deadItems(ms)) out.push({k: d.item === 'Choice Scarf' ? 'scarftr' : 'dead', ms: [d.m], item: d.item, why: d.why}); return out; }
// Items players run on a Pokémon, most used first (never Mega Stones, never "nothing")
function itemOptions(p) { try { return (setFor(p).it || []).filter(([n]) => n && typeof n === 'string' && notStone(n) && !/^(nothing|other|none|no item)$/i.test(n)); } catch (e) { return []; } }
// The best item for m that's free on this team and can work here (the "fix" for a problem item, or a default)
function bestFreeItem(m, ms, used, F, tr) { const ok = n => n && !used.has(n) && !itemDeadWhy(m, n, ms, F, tr);
  const o = itemOptions(m.p).find(([n]) => ok(n)); if (o) return o[0];
  return itTab().fallback.find(ok) || (typeof itemPool === 'function' ? itemPool().find(ok) : '') || ''; }
// Fill in default items for the whole team. Returns new member objects (never changes the ones passed in):
// chosen items and Mega Stones stay; the rest get team-aware defaults (itemDefault: true).
function assignItems(ms) { if (!Array.isArray(ms) || !ms.length) return ms;
  const out = ms.map(m => m ? {...m} : m), live = out.filter(m => m && m.p), F = teamField(live), tr = live.some(setsTR), used = new Set();
  for (const m of live) { if (m.p.m) { m.item = m.item && STONE_RE.test(m.item) ? m.item : (defaultItem(m.p) || m.item || ''); m.itemDefault = false; if (m.item) used.add(m.item); }
    else if (m.heldItem) { m.item = m.heldItem; m.itemDefault = false; } }
  // chosen items count as taken even when two of them clash (that clash is reported, not hidden)
  for (const m of live) if (!m.p.m && m.heldItem) used.add(m.heldItem);
  // the rest, the Pokémon most tied to its usual item first (so Mega-less staples keep their signature item)
  const rest = live.filter(m => !m.p.m && !m.heldItem).map(m => ({m, top: +((itemOptions(m.p)[0] || [])[1]) || 0})).sort((a, b) => b.top - a.top || String(a.m.p.n).localeCompare(b.m.p.n));
  for (const {m} of rest) { const it = bestFreeItem(m, live, used, F, tr); m.item = it; m.itemDefault = true; if (it) used.add(it); }
  return out; }
// For a problem item you chose: the item to switch to (most used for it that's free and works on this team)
function itemFixFor(m, ms) { const live = ms.filter(x => x && x.p), F = teamField(live), tr = live.some(setsTR), used = new Set(live.filter(x => x !== m && x.item).map(x => x.item));
  return bestFreeItem(m, live, used, F, tr); }
// ---- forms the roster stores in the wrong stance (Oct 28 reference check) ----
// Palafin is stored as Zero Form, but it switches to Hero Form the first time it leaves the field, which every real player
// plans around: calc, speed and ratings use Hero Form (100/160/97/106/87/100). (Aegislash: Blade Forme when attacking,
// handled in damage().)
try { const pf = byName.get('Palafin'); if (pf && pf.st && pf.st[1] < 100) { pf.stZero = pf.st.slice(); pf.st = [100, 160, 97, 106, 87, 100]; pf.formNote = 'Hero Form'; } } catch (e) {}
// ---- speed from abilities and the field ----
// Chlorophyll / Swift Swim / Sand Rush / Slush Rush double Speed in their weather; Unburden doubles it once the held item is
// used (shown as a second number); paralysis halves it.
const WEATHER_SPD_AB = {Chlorophyll: 'sun', 'Swift Swim': 'rain', 'Sand Rush': 'sand', 'Slush Rush': 'snow'};
function speedMul(ability, weather) { return weather && WEATHER_SPD_AB[ability] === weather ? 2 : 1; }
// ---- the field on turn 1 (for damage): weather/terrain set by the leads ----
// Entry abilities go off fastest first, so the slowest setter's weather stays; a Mega's ability (Mega Charizard Y's
// Drought) only starts once it Mega Evolves at the start of the turn, after every entry ability, so it wins.
const TERR_DC = k => ({psy: 'psychic', elec: 'electric', grassy: 'grassy', misty: 'misty'})[k] || '';
function abilityOf(x) { if (!x || !x.p) return ''; if (x.ability) return x.ability; try { return metaAbility(x.p) || bestAbility(x.p); } catch (e) { return x.p.a[0]; } }
function turnOneField(leads, speedOf) { const ev = [];
  for (const x of leads || []) { const ab = abilityOf(x), w = typeof WEATHER_OF === 'object' ? WEATHER_OF[ab] : null, t = typeof TERRAIN_OF === 'object' ? TERRAIN_OF[ab] : null;
    // Megas evolve at the start of the turn in order of their Speed BEFORE evolving (Showdown sorts the Mega actions by the
    // current, pre-Mega Speed), so the slower one's weather/terrain is set last and stays
    const pre = x.p && x.p.m && typeof byName === 'object' && byName.get(x.p.b) ? {...x, p: byName.get(x.p.b), _orig: x} : x;
    if (w || t) ev.push({x, w, t, mega: !!(x.p && x.p.m), s: speedOf ? speedOf(pre) : 0}); }
  ev.sort((a, b) => (a.mega - b.mega) || (b.s - a.s)); let weather = '', terrain = '', wBy = null, tBy = null;
  for (const e of ev) { if (e.w) { weather = e.w; wBy = e.x; } if (e.t) { terrain = TERR_DC(e.t); tBy = e.x; } }
  // Cloud Nine / Air Lock on ANY Pokémon on the field switches the weather's effects off for everyone (the weather stays
  // set, but damage, Chlorophyll/Swift Swim speed and Weather Ball act as if it weren't there). Use .wx for the effect.
  const negated = (leads || []).some(x => ['Cloud Nine', 'Air Lock'].includes(abilityOf(x)));
  // Trace (Mega Meowstic, Gardevoir…) copies a random opposing ability on entry / Mega Evolution: if a weather or terrain
  // setter is on the field, the tracer may copy it and change the result, so the field can't be called for sure
  const traced = ev.length > 0 && (leads || []).some(x => abilityOf(x) === 'Trace');
  return {weather, terrain, wBy, tBy, negated, wx: negated ? '' : weather, traced}; }
// The field a side sets by itself when it's the only one (for "your hits" tables): one weather and/or one terrain
function sideField(ms) { const F = teamField(ms); return {weather: F.w.size === 1 ? [...F.w][0] : '', terrain: F.t.size === 1 ? TERR_DC([...F.t][0]) : '',
  // Fairy Aura / Dark Aura on the team (Mega Floette…) boosts every move of that type while it's on the field
  auras: (ms || []).map(m => m && abilityOf(m)).filter(a => /^(Fairy|Dark) Aura$/.test(a || ''))}; }
const fieldWords = f => [f.weather ? ({sun: 'sun', rain: 'rain', sand: 'sand', snow: 'snow'})[f.weather] : '', f.terrain ? f.terrain[0].toUpperCase() + f.terrain.slice(1) + ' Terrain' : ''].filter(Boolean).join(' + ');
// Problems a suggestion (plan, build, addition) may not create: counted on a team with team-aware defaults
function itemProblemCount(ms) { try { return itemProblems(assignItems(ms)).length; } catch (e) { return 0; } }
// Team page: a card above the fix plans listing item problems with one-tap fixes (only items you chose can have them)
function itemFixHtml(ms) { if (!ms || !ms.length) return ''; let pr; try { pr = itemProblems(ms); } catch (e) { return ''; } if (!pr.length) return '';
  const rows = pr.map(x => { const tgt = x.k === 'clause' ? x.ms[x.ms.length - 1] : x.ms[0], fix = tgt && tgt.i >= 0 ? itemFixFor(tgt, ms) : '';
    return `<li><span class="warnline">${esc(x.k === 'clause' ? 'Item Clause' : x.k === 'scarftr' ? 'Clashes with Trick Room' : 'Item does nothing')}</span>: ${esc(x.why)}${fix ? ` <button class="btn sm" type="button" data-itfix="${tgt.i}|${esc(fix)}">Give ${esc(tgt.d)} ${esc(fix)}</button>` : ''}</li>`; });
  return `<div class="plan itemfix"><div class="ph"><span class="pt">Fix your items first</span></div><ul>${rows.join('')}</ul></div>`; }
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-itfix]'); if (!b) return;
  const [i, item] = b.dataset.itfix.split('|'); const s = S.slots[+i]; if (!s || !item) return; try { keepUndo(); } catch (er) {}
  s.it = Object.assign({}, s.it || {}, {[S.format]: item}); render(); toast(`Gave ${(byName.get(s.n) || {d: s.n}).d} ${item}`, true); });
