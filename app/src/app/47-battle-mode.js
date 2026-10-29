// ---------- Battle mode: one screen for the 90 seconds of team preview ----------
// Enter their six (or read a screenshot) and everything that matters sits on one phone-sized page: your four and the
// leads, what to watch out for (immunities, Intimidate, Fake Out, redirection, weather), live speed order with Tailwind /
// Trick Room toggles, and damage both ways. It shares their six with Matchup (S.opp), so either page can fill it.
// weather 'auto' = whatever the likely leads set on turn 1 (sun from Mega Charizard Y, rain from Pelipper...)
let bmUi = {tab: 'plan', tw: false, twOpp: false, tr: false, icy: false, weather: 'auto', intMe: false, intThem: false, t0: 0, timer: null};
// best hit with the field toggles: weather/terrain, and -1 Attack on physical moves when that side is Intimidated.
// aMem/dMem: your own member on that side, so its real item and spread are used
function bmHit(aP, moves, dP, weather, intim, aMem, dMem, terrain) {
  let best = null; const A = {p: aP, ...sideDefaults(aP, 'atk', aMem)}, D = {p: dP, ...sideDefaults(dP, 'def', dMem)};
  for (const mv of moves || []) { if (!mv || !mv.bp) continue;
    const r = damage({atk: {...A, boost: intim && mv.cat === 1 ? -1 : 0}, def: D, move: mv, spread: !!mv.spread, weather, terrain: terrain || ''}); if (!r || !r.hp) continue;
    // weigh by what you can count on (accuracy, charging turn, recharge), the same way the hit tables do
    const ch = chargesFirst(mv, weather, A.item), acc = moveAcc(mv, A.ability, weather, D, A.item), val = r.max * acc / 100 * (ch ? .5 : 1) * (mv.recharge ? .7 : 1);
    if (!best || val > best.val) best = {mv, r, val, charge: ch, acc, recharge: !!mv.recharge}; }
  return best; }
// weather: the weather in play (Chlorophyll/Swift Swim/Sand Rush/Slush Rush double Speed in theirs); Unburden's doubled
// speed after its item is used comes back as unb
function bmSpeed(p, me, mem, weather) { const s = likelySpeed(p, me ? mem : null), ab = me && mem ? mem.ability : abilityOf(mem && mem.p ? mem : {p});
  const o = {tw: me ? bmUi.tw : bmUi.twOpp, icy: !me && bmUi.icy, par: !me && bmUi.par}, v = spdCalc(s.v, s.scarf, ab, weather || '', o);
  return {v, s, wxUp: speedMul(ab, weather || '') > 1, ab, unb: ab === 'Unburden' && !s.scarf ? spdCalc(s.v, s.scarf, ab, weather || '', {...o, unb: true}) : null}; }
// What to watch on each of their Pokémon, against your four
const BM_IMMUNE = {Levitate: 'Ground', 'Earth Eater': 'Ground', 'Flash Fire': 'Fire', 'Well-Baked Body': 'Fire', 'Water Absorb': 'Water', 'Storm Drain': 'Water', 'Dry Skin': 'Water',
  'Volt Absorb': 'Electric', 'Lightning Rod': 'Electric', 'Motor Drive': 'Electric', 'Sap Sipper': 'Grass'};
const BM_WEATHER = {Drought: 'sets sun', Drizzle: 'sets rain', 'Sand Stream': 'sets sand', 'Snow Warning': 'sets snow', 'Orichalcum Pulse': 'sets sun',
  'Psychic Surge': 'sets Psychic Terrain', 'Grassy Surge': 'sets Grassy Terrain', 'Electric Surge': 'sets Electric Terrain', 'Misty Surge': 'sets Misty Terrain'};
function bmWatch(C, theirs) {
  const dmg = m => memberMoves(m).moves.filter(x => x && x.bp > 0), mvset = m => new Set(memberMoves(m).moves.map(x => x.name));
  const prio = C.filter(m => { const s = mvset(m); return s.has('Fake Out') || ROLE.prio.some(x => s.has(x)); });
  const phys = C.filter(m => dmg(m).some(x => x.cat === 1) && m.p.st[1] >= m.p.st[3]);
  const spreaders = C.filter(m => dmg(m).some(x => x.spread));
  return theirs.map(o => { const out = [], ab = o.ability || '', mv = new Set((o.moves || []).map(x => x.name)), nm = ms => ms.map(m => esc(m.d)).join(', ');
    const t = BM_IMMUNE[ab];
    if (t) { const hit = C.filter(m => dmg(m).some(x => x.type === t)); const draw = ['Lightning Rod', 'Storm Drain'].includes(ab);
      if (hit.length) out.push(['hi', `${esc(ab)}: ${draw ? 'pulls in and absorbs' : 'immune to'} ${t} moves`, `${nm(hit)}'s ${t} attacks`]); }
    if (ab === 'Intimidate' && phys.length) out.push(['mid', 'Intimidate', `−1 Attack to ${nm(phys)}`]);
    if (mv.has('Fake Out')) out.push(['mid', 'Fake Out', 'can flinch one of your leads turn 1']);
    if (mv.has('Follow Me') || mv.has('Rage Powder')) out.push(['mid', mv.has('Rage Powder') ? 'Rage Powder' : 'Follow Me', 'pulls your single-target attacks']);
    // durations as in the main games (Champions keeps them): Trick Room 5 turns and Tailwind 4, each counting the turn it's used
    if (mv.has('Trick Room')) out.push(['hi', 'Trick Room', 'slow Pokémon move first for the next 4 turns (5 counting the turn it\'s set)']);
    if (mv.has('Tailwind')) out.push(['mid', 'Tailwind', 'their side doubles Speed for the next 3 turns (4 counting the turn it\'s set)']);
    if (ab === 'Prankster') out.push(['mid', 'Prankster', 'status moves go first']);
    if (mv.has('Wide Guard') && spreaders.length) out.push(['mid', 'Wide Guard', `blocks spread moves from ${nm(spreaders)}`]);
    // Quick Guard (+3) blocks priority moves for its side this turn, Fake Out included
    if (mv.has('Quick Guard') && prio.length) out.push(['mid', 'Quick Guard', `blocks priority and Fake Out from ${nm(prio)} for a turn`]);
    // Protect variants that punish contact: Spiky Shield (1/8 damage), Baneful Bunker (poison), King's Shield (−1 Attack)
    for (const [k, w] of [['Spiky Shield', 'hurts contact attackers for 1/8 of their HP'], ['Baneful Bunker', 'poisons contact attackers'], ["King's Shield", 'lowers a contact attacker\'s Attack by 1']])
      if (mv.has(k)) { const ct = C.filter(m => dmg(m).some(x => x.contact)); if (ct.length) out.push(['lo', k, `protects (+4) and ${w}: ${nm(ct)}`]); }
    if (prio.length && (['Armor Tail', 'Queenly Majesty', 'Dazzling'].includes(ab) || ab === 'Psychic Surge')) out.push(['hi', esc(ab), `blocks priority and Fake Out from ${nm(prio)}`]);
    if (BM_WEATHER[ab]) out.push(['lo', esc(ab), BM_WEATHER[ab]]);
    if (o.p.m) out.push(['lo', 'Mega', 'likely their Mega this game']);
    return {o, out}; }).filter(x => x.out.length); }
function renderBattle() {
  const el = $('bmOut'); if (!el) return;
  const mine = members(), theirs = S.opp.map(n => byName.get(n)).filter(Boolean).map(oppMember), dbl = S.format === 'doubles';
  // their six
  const slots = S.opp.map((n, i) => { const p = byName.get(n);
    return p ? `<div class="bmslot on">${sprite(p, 'bmspr')}<span class="bmn">${esc(p.d)}</span><button class="x" type="button" data-bmx="${i}" aria-label="Remove ${esc(p.d)}">×</button></div>`
      : `<div class="bmslot"><div class="cb"><input class="field" id="bmOpp${i}" placeholder="${i + 1}" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Their Pokémon ${i + 1}"></div></div>`; }).join('');
  const top = `<div class="bmbar"><button type="button" class="btn sm ghost" id="bmClear">Clear their six</button></div>
    <div class="bmopp">${slots}</div>`;
  let body = ''; bmUi.four = null;
  if (mine.length < 4) body = '<div class="empty-note">Add at least 4 Pokémon on My team first.<div style="margin-top:12px"><button type="button" class="chghost" data-view="build">Go to My team</button></div></div>';
  else if (!theirs.length) body = '<div class="empty-note">Type their Pokémon as you see them at team preview. Everything below fills in as you go.</div>';
  else {
    const r = planMatchup(mine, theirs, true), C = r.chosen.map(i => mine[i]);
    bmUi.four = [...r.lead, ...r.back].map(i => mine[i].p.n);
    const card = (i, tag) => `<div class="bmpick${tag === 'Lead' ? ' lead' : ''}">${sprite(mine[i].p, 'bmpspr')}<span class="bmpn">${esc(mine[i].d)}</span><span class="tag">${tag.toUpperCase()}</span></div>`;
    const ll = r.B && theirs.length >= 2 ? likelyLead(theirs, r.B) : [];
    const bring = `<div class="plan bmcard" data-t="plan"><div class="ph"><span class="pt">Bring</span><span class="vsub">${dbl ? 'lead 2, back 2' : 'lead 1'}</span></div>
      <div class="bmpicks">${r.lead.map(i => card(i, 'Lead')).join('')}${r.back.map(i => card(i, 'Back')).join('')}</div>
      ${r.bench.length ? `<p class="t2" style="margin:0">Leave home: ${r.bench.map(i => esc(mine[i].d)).join(', ')}</p>` : ''}
      ${ll.length === 2 ? `<p class="t2" style="margin:0">Their likely lead: <b>${esc(ll[0].d)}</b> + <b>${esc(ll[1].d)}</b></p>` : ''}
      ${r.chosen.filter(i => mine[i].mega).length > 1 ? '<p class="t2" style="margin:0">Only one Mega can Mega Evolve this battle.</p>' : ''}</div>`;
    // turn-1 field from both sides' leads (yours and their likely lead), used when the weather is on Auto
    const spdOf = x => { const o = x._orig || x, s = likelySpeed(x.p, C.includes(o) ? o : null); return s.scarf ? Math.floor(s.v * 1.5) : s.v; };
    const F1 = typeof turnOneField === 'function' ? turnOneField([...r.lead.map(i => mine[i]), ...(ll.length === 2 ? ll : theirs.slice(0, 2))], spdOf) : {weather: '', terrain: ''};
    const wNow = bmUi.weather === 'auto' ? (F1.wx != null ? F1.wx : F1.weather) : bmUi.weather, tNow = bmUi.weather === 'auto' ? F1.terrain : '';
    const W = bmWatch(C, theirs);
    const watch = `<div class="plan bmcard" data-t="plan"><div class="ph"><span class="pt">Watch out</span></div>${W.length ? W.map(w => `<div class="bmw">${sprite(w.o.p, 'bmwspr')}<div><b>${esc(w.o.d)}</b>${w.out.map(([c, t, d]) => `<div class="bmwl"><span class="sev ${c}">${t}</span><span class="t2">${d}</span></div>`).join('')}</div></div>`).join('')
      : '<p class="t2" style="margin:0">Nothing on their side shuts down your four.</p>'}</div>`;
    // speed
    const rows = [...C.map(m => ({x: m, me: true})), ...theirs.map(o => ({x: o, me: false}))].map(q => ({...q, ...bmSpeed(q.x.p, q.me, q.x, wNow)}));
    rows.sort((a, b) => bmUi.tr ? a.v - b.v : b.v - a.v); const mx = Math.max(...rows.map(q => q.v), 1);
    const tog = (k, t) => `<button type="button" data-bms="${k}" aria-pressed="${!!bmUi[k]}">${t}</button>`;
    // your moves that always drop their Speed (Icy Wind, Electroweb…): the "−1" toggle is the order after you use one
    const spDrop = [...new Set(C.flatMap(m => memberMoves(m).moves.filter(mv => mv && (mv.sec || []).some(s => s[0] >= 100 && s[1] && s[1].spe < 0)).map(mv => mv.name)))];
    // moves that change turn order this battle: their bracket, from the move data (Fake Out +3, Protect +4, Trick Room −7…)
    const prioOf = (x, me) => { const ab = me ? x.ability : abilityOf(x); return (me ? memberMoves(x).moves : (x.moves || [])).filter(Boolean)
      .map(mv => [mv, movePrio(mv, ab, {terrain: tNow})]).filter(([mv, p]) => p !== 0 && !(mv.tg === 'self' && p === 4)).map(([mv, p]) => `${esc(mv.name)} ${p > 0 ? '+' : '−'}${Math.abs(p)}${mv.name === 'Grassy Glide' && p === 1 ? ' (Grassy Terrain)' : ''} (${esc(x.d)})`); };
    const prioList = [...C.flatMap(m => prioOf(m, true)), ...theirs.flatMap(o => prioOf(o, false))];
    const speed = `<div class="plan bmcard" data-t="speed"><div class="ph"><span class="pt">Speed</span><span class="vsub">${bmUi.tr ? 'slowest moves first' : 'fastest first'}</span></div>
      <div class="seg segwrap" role="group" aria-label="Speed conditions">${tog('tw', 'Your Tailwind')}${tog('twOpp', 'Their Tailwind')}${tog('icy', spDrop.length ? `Them −1 (after your ${esc(spDrop[0])})` : 'Them −1')}${tog('par', 'They\'re paralyzed')}${tog('tr', 'Trick Room')}</div>${wNow ? `<p class="t2" style="margin:0">Weather: ${esc(wNow)} (set it under Damage).</p>` : ''}
      <div class="bmspd">${rows.map((q, i) => { const tie = rows.some((o, j) => j !== i && o.v === q.v && o.me !== q.me);
        return `<div class="bmsr${q.me ? ' me' : ''}"><span class="bmsn">${esc(q.x.d)}${tie ? ' <span class="tag spdtie">TIE</span>' : ''}</span><span class="bmsb"><i style="width:${Math.max(4, 100 * q.v / mx).toFixed(1)}%"></i></span><span class="bmsv">${q.v}${q.s.scarf ? '<em>Scarf</em>' : ''}${q.wxUp ? `<em> ${esc(q.ab)}</em>` : ''}${q.unb ? `<em> → ${q.unb} after item</em>` : ''}</span></div>`; }).join('')}</div>
      ${prioList.length ? `<p class="t2" style="margin:0">Moves that skip the Speed order (higher bracket goes first, Speed only breaks ties inside a bracket): ${prioList.join(', ')}.</p>` : ''}
      <p class="t2" style="margin:0">Your side: your items (and your spreads where you set them). Their side <span class="asm" title="Their real spreads and items are hidden until the battle shows them">assumed</span>: the most common spreads, natures and items. Ties are a coin flip.</p></div>`;
    // damage both ways
    const cls = (b) => { if (!b) return 'z'; const lo = b.r.min / b.r.hp, hi = b.r.max / b.r.hp; return lo >= 1 ? 'k1' : hi >= 1 ? 'k1m' : lo >= .5 ? 'k2' : hi >= .5 ? 'k2m' : 'k3'; };
    const pc = b => b ? Math.min(999, Math.round(100 * b.r.max / b.r.hp)) : '–';
    const wseg = [['auto', `Leads${F1.weather || F1.terrain ? ': ' + fieldWords(F1) : ': none'}`], ['', 'No weather'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']].map(([k, t]) => `<button type="button" data-bmw="${k}" aria-pressed="${bmUi.weather === k}">${esc(t)}</button>`).join('');
    const grid = `<div class="tablewrap"><table class="bmdt"><thead><tr><th></th>${theirs.map(o => `<th title="${esc(o.d)}">${sprite(o.p, 'dcth')}<span>${esc(o.d.replace(/^Mega /, 'M-'))}</span></th>`).join('')}</tr></thead><tbody>
      ${C.map(m => `<tr><th>${sprite(m.p, 'dcth')}<span>${esc(m.d)}</span></th>${theirs.map(o => { const a = bmHit(m.p, memberMoves(m).moves, o.p, wNow, bmUi.intMe, m, null, tNow), d = bmHit(o.p, o.moves, m.p, wNow, bmUi.intThem, null, m, tNow);
        return `<td title="${a ? `${esc(m.d)} ${esc(a.mv.name)}: up to ${pc(a)}%` : ''}${d ? ` · ${esc(o.d)} ${esc(d.mv.name)}: up to ${pc(d)}%` : ''}"><span class="bo ${cls(a)}">${pc(a)}<i>${a ? esc(a.mv.name) : ''}</i></span><span class="bd ${cls(d)}">${pc(d)}<i>${d ? esc(d.mv.name) : ''}</i></span></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
    const dmgCard = `<div class="plan bmcard bmdmg" data-t="dmg"><div class="ph"><span class="pt">Damage both ways</span></div>
      <div class="seg segwrap" role="group" aria-label="Weather">${wseg}</div>
      <div class="seg segwrap" role="group" aria-label="Intimidate"><button type="button" data-bmi="intMe" aria-pressed="${bmUi.intMe}">You're Intimidated</button><button type="button" data-bmi="intThem" aria-pressed="${bmUi.intThem}">They're Intimidated</button></div>
      ${grid}<p class="t2 bmleg" style="margin:0"><span class="bo k2">%</span> your best hit on them · <span class="bd k2">%</span> their best hit on you. Max roll, % of HP, each side's usual set. Green = can KO, gold = 2 hits.</p></div>`;
    let t1 = ''; if (dbl) { try { t1 = turnOnePlan(mine, theirs, r); } catch (e) {} }
    body = `<div class="seg bmtabs" role="group" aria-label="Show">${[['plan', 'Plan'], ['speed', 'Speed'], ['dmg', 'Damage']].map(([k, t]) => `<button type="button" data-bmt="${k}" aria-pressed="${bmUi.tab === k}">${t}</button>`).join('')}</div><div class="bmgrid" data-tab="${bmUi.tab}">${bring}${watch}${speed}${t1 ? `<div class="bmt1" data-t="plan">${t1}</div>` : ''}${dmgCard}</div>`; }
  el.innerHTML = top + body;
  safe('log', () => renderLog());
  S.opp.forEach((n, i) => { const inp = $('bmOpp' + i); if (inp) bindMonInput(inp, p => { S.opp[i] = p.n; persist(); renderMatchup(); const nx = S.opp.findIndex(x => !byName.get(x)); const f = nx >= 0 && $('bmOpp' + nx); if (f) f.focus(); }, p => !S.opp.includes(p.n)); });
  }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bms],[data-bmw],[data-bmi],[data-bmx],[data-bmt],#bmClear,[data-battle]'); if (!b) return;
  const d = b.dataset;
  if (d.battle != null) { setView('matchup'); return; }
  if (d.bms) bmUi[d.bms] = !bmUi[d.bms]; else if (d.bmw != null) bmUi.weather = d.bmw; else if (d.bmi) bmUi[d.bmi] = !bmUi[d.bmi];
  else if (d.bmt) bmUi.tab = d.bmt;
  else if (d.bmx != null) { S.opp[+d.bmx] = ''; persist(); keepScroll(() => renderMatchup()); const f = $('bmOpp' + d.bmx); if (f) f.focus(); return; }
  else if (b.id === 'bmClear') { S.opp = ['', '', '', '', '', '']; persist(); renderMatchup(); return; }
  keepScroll(() => renderBattle());
  if (d.bmx != null) { const f = $('bmOpp' + d.bmx); if (f) f.focus(); } });
