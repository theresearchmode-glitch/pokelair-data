// ---------- Battle mode: one screen for the 90 seconds of team preview ----------
// Enter their six (or read a screenshot) and everything that matters sits on one phone-sized page: your four and the
// leads, what to watch out for (immunities, Intimidate, Fake Out, redirection, weather), live speed order with Tailwind /
// Trick Room toggles, and damage both ways. It shares their six with Matchup (S.opp), so either page can fill it.
let bmUi = {tw: false, twOpp: false, tr: false, icy: false, weather: '', intMe: false, intThem: false, t0: 0, timer: null};
// best hit with the field toggles: weather, and -1 Attack on physical moves when that side is Intimidated
function bmHit(aP, moves, dP, weather, intim) {
  let best = null; const A = {p: aP, ...sideDefaults(aP, 'atk')}, D = {p: dP, ...sideDefaults(dP, 'def')};
  for (const mv of moves || []) { if (!mv || !mv.bp) continue;
    const r = damage({atk: {...A, boost: intim && mv.cat === 1 ? -1 : 0}, def: D, move: mv, spread: !!mv.spread, weather});
    if (r && r.hp && (!best || r.max > best.r.max)) best = {mv, r}; }
  return best; }
function bmSpeed(p, me) { const s = likelySpeed(p); let v = s.scarf ? Math.floor(s.v * 1.5) : s.v;
  if (me && bmUi.tw) v *= 2; if (!me && bmUi.twOpp) v *= 2; if (!me && bmUi.icy) v = Math.floor(v * BOOST(-1)); return {v, s}; }
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
    if (mv.has('Trick Room')) out.push(['hi', 'Trick Room', 'slow Pokémon move first for 4 turns']);
    if (mv.has('Tailwind')) out.push(['mid', 'Tailwind', 'their side doubles Speed for 4 turns']);
    if (ab === 'Prankster') out.push(['mid', 'Prankster', 'status moves go first']);
    if (mv.has('Wide Guard') && spreaders.length) out.push(['mid', 'Wide Guard', `blocks spread moves from ${nm(spreaders)}`]);
    if (prio.length && (['Armor Tail', 'Queenly Majesty', 'Dazzling'].includes(ab) || ab === 'Psychic Surge')) out.push(['hi', esc(ab), `blocks priority and Fake Out from ${nm(prio)}`]);
    if (BM_WEATHER[ab]) out.push(['lo', esc(ab), BM_WEATHER[ab]]);
    if (o.p.m) out.push(['lo', 'Mega', 'likely their Mega this game']);
    return {o, out}; }).filter(x => x.out.length); }
function bmTimer() { const el = $('bmClock'); if (!el) { clearInterval(bmUi.timer); bmUi.timer = null; return; }
  const left = bmUi.t0 ? Math.max(0, 90 - Math.floor((Date.now() - bmUi.t0) / 1000)) : 90;
  el.textContent = bmUi.t0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '1:30';
  el.parentElement.classList.toggle('run', !!bmUi.t0 && left > 0); el.parentElement.classList.toggle('low', !!bmUi.t0 && left <= 15);
  if (bmUi.t0 && left === 0) { clearInterval(bmUi.timer); bmUi.timer = null; } }
function renderBattle() {
  const el = $('bmOut'); if (!el) return;
  const mine = members(), theirs = S.opp.map(n => byName.get(n)).filter(Boolean).map(oppMember), dbl = S.format === 'doubles';
  // their six
  const slots = S.opp.map((n, i) => { const p = byName.get(n);
    return p ? `<div class="bmslot on">${sprite(p, 'bmspr')}<span class="bmn">${esc(p.d)}</span><button class="x" type="button" data-bmx="${i}" aria-label="Remove ${esc(p.d)}">×</button></div>`
      : `<div class="bmslot"><div class="cb"><input class="field" id="bmOpp${i}" placeholder="${i + 1}" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Their Pokémon ${i + 1}"></div></div>`; }).join('');
  const shotOk = typeof shot === 'object' && shot.ready;
  const top = `<div class="bmbar"><button type="button" class="bmclock" id="bmClockBtn" aria-label="Start the 90 second team preview timer"><span id="bmClock">1:30</span><i>${bmUi.t0 ? 'Reset' : 'Start timer'}</i></button>
    ${shotOk ? '<button type="button" class="btn sm" id="bmShot">Read screenshot</button>' : ''}<button type="button" class="btn sm ghost" id="bmClear">Clear</button></div>
    ${shotOk && shot.res ? `<div class="bmshot t2">${shot.res.busy ? '<span class="spin" aria-hidden="true"></span> Reading their team…' : shot.res.err ? esc(shot.res.err) : shot.res.found ? `Read ${shot.res.found.length} of 6 from your screenshot${shot.res.found.some(x => !x.sure) ? '. Double-check: ' + shot.res.found.filter(x => !x.sure).map(x => esc(x.p.d)).join(', ') : ''}.` : ''}</div>` : ''}
    <div class="bmopp">${slots}</div>`;
  let body = '';
  if (mine.length < 4) body = '<div class="empty-note">Add at least 4 Pokémon on the Team page first.</div>';
  else if (!theirs.length) body = '<div class="empty-note">Type their Pokémon as you see them at team preview. Everything below fills in as you go.</div>';
  else {
    const r = planMatchup(mine, theirs, true), C = r.chosen.map(i => mine[i]);
    const card = (i, tag) => `<div class="bmpick${tag === 'Lead' ? ' lead' : ''}">${sprite(mine[i].p, 'bmpspr')}<span class="bmpn">${esc(mine[i].d)}</span><span class="tag">${tag.toUpperCase()}</span></div>`;
    const ll = r.B && theirs.length >= 2 ? likelyLead(theirs, r.B) : [];
    const bring = `<div class="plan bmcard"><div class="ph"><span class="pt">Bring</span><span class="vsub">${dbl ? 'lead 2, back 2' : 'lead 1'}</span></div>
      <div class="bmpicks">${r.lead.map(i => card(i, 'Lead')).join('')}${r.back.map(i => card(i, 'Back')).join('')}</div>
      ${r.bench.length ? `<p class="t2" style="margin:0">Leave home: ${r.bench.map(i => esc(mine[i].d)).join(', ')}</p>` : ''}
      ${ll.length === 2 ? `<p class="t2" style="margin:0">Their likely lead: <b>${esc(ll[0].d)}</b> + <b>${esc(ll[1].d)}</b></p>` : ''}
      ${r.chosen.filter(i => mine[i].mega).length > 1 ? '<p class="t2" style="margin:0">Only one Mega can Mega Evolve this battle.</p>' : ''}</div>`;
    const W = bmWatch(C, theirs);
    const watch = `<div class="plan bmcard"><div class="ph"><span class="pt">Watch out</span></div>${W.length ? W.map(w => `<div class="bmw">${sprite(w.o.p, 'bmwspr')}<div><b>${esc(w.o.d)}</b>${w.out.map(([c, t, d]) => `<div class="bmwl"><span class="sev ${c}">${t}</span><span class="t2">${d}</span></div>`).join('')}</div></div>`).join('')
      : '<p class="t2" style="margin:0">Nothing on their side shuts down your four.</p>'}</div>`;
    // speed
    const rows = [...C.map(m => ({x: m, me: true})), ...theirs.map(o => ({x: o, me: false}))].map(q => ({...q, ...bmSpeed(q.x.p, q.me)}));
    rows.sort((a, b) => bmUi.tr ? a.v - b.v : b.v - a.v); const mx = Math.max(...rows.map(q => q.v), 1);
    const tog = (k, t) => `<button type="button" data-bms="${k}" aria-pressed="${!!bmUi[k]}">${t}</button>`;
    const speed = `<div class="plan bmcard"><div class="ph"><span class="pt">Speed</span><span class="vsub">${bmUi.tr ? 'slowest moves first' : 'fastest first'}</span></div>
      <div class="seg segwrap" role="group" aria-label="Speed conditions">${tog('tw', 'Your Tailwind')}${tog('twOpp', 'Their Tailwind')}${tog('icy', 'Them −1')}${tog('tr', 'Trick Room')}</div>
      <div class="bmspd">${rows.map((q, i) => { const tie = rows.some((o, j) => j !== i && o.v === q.v && o.me !== q.me);
        return `<div class="bmsr${q.me ? ' me' : ''}"><span class="bmsn">${esc(q.x.d)}${tie ? ' <span class="tag spdtie">TIE</span>' : ''}</span><span class="bmsb"><i style="width:${Math.max(4, 100 * q.v / mx).toFixed(1)}%"></i></span><span class="bmsv">${q.v}${q.s.scarf ? '<em>Scarf</em>' : ''}</span></div>`; }).join('')}</div>
      <p class="t2" style="margin:0">Most common spreads, natures and items. Ties are a coin flip.</p></div>`;
    // damage both ways
    const cls = (b) => { if (!b) return 'z'; const lo = b.r.min / b.r.hp, hi = b.r.max / b.r.hp; return lo >= 1 ? 'k1' : hi >= 1 ? 'k1m' : lo >= .5 ? 'k2' : hi >= .5 ? 'k2m' : 'k3'; };
    const pc = b => b ? Math.min(999, Math.round(100 * b.r.max / b.r.hp)) : '–';
    const wseg = [['', 'No weather'], ['sun', 'Sun'], ['rain', 'Rain'], ['sand', 'Sand'], ['snow', 'Snow']].map(([k, t]) => `<button type="button" data-bmw="${k}" aria-pressed="${bmUi.weather === k}">${t}</button>`).join('');
    const grid = `<div class="tablewrap"><table class="bmdt"><thead><tr><th></th>${theirs.map(o => `<th title="${esc(o.d)}">${sprite(o.p, 'dcth')}<span>${esc(o.d.replace(/^Mega /, 'M-'))}</span></th>`).join('')}</tr></thead><tbody>
      ${C.map(m => `<tr><th>${sprite(m.p, 'dcth')}<span>${esc(m.d)}</span></th>${theirs.map(o => { const a = bmHit(m.p, memberMoves(m).moves, o.p, bmUi.weather, bmUi.intMe), d = bmHit(o.p, o.moves, m.p, bmUi.weather, bmUi.intThem);
        return `<td title="${a ? `${esc(m.d)} ${esc(a.mv.name)}: up to ${pc(a)}%` : ''}${d ? ` · ${esc(o.d)} ${esc(d.mv.name)}: up to ${pc(d)}%` : ''}"><span class="bo ${cls(a)}">${pc(a)}<i>${a ? esc(a.mv.name) : ''}</i></span><span class="bd ${cls(d)}">${pc(d)}<i>${d ? esc(d.mv.name) : ''}</i></span></td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
    const dmgCard = `<div class="plan bmcard bmdmg"><div class="ph"><span class="pt">Damage both ways</span></div>
      <div class="seg segwrap" role="group" aria-label="Weather">${wseg}</div>
      <div class="seg segwrap" role="group" aria-label="Intimidate"><button type="button" data-bmi="intMe" aria-pressed="${bmUi.intMe}">You're Intimidated</button><button type="button" data-bmi="intThem" aria-pressed="${bmUi.intThem}">They're Intimidated</button></div>
      ${grid}<p class="t2 bmleg" style="margin:0"><span class="bo k2">%</span> your best hit on them · <span class="bd k2">%</span> their best hit on you. Max roll, % of HP, each side's usual set. Green = can KO, gold = 2 hits.</p></div>`;
    let t1 = ''; if (dbl) { try { t1 = turnOnePlan(mine, theirs, r); } catch (e) {} }
    const after = `<div class="plan bmcard bmafter"><div class="qlog"><span class="vsub">After the game, played these four?</span><button class="btn logwin" type="button" data-qlog="W">Won</button><button class="btn logloss" type="button" data-qlog="L">Lost</button></div></div>`;
    body = `<div class="bmgrid">${bring}${watch}${speed}${t1 ? `<div class="bmt1">${t1}</div>` : ''}${dmgCard}${after}</div>`; }
  el.innerHTML = top + body;
  S.opp.forEach((n, i) => { const inp = $('bmOpp' + i); if (inp) bindMonInput(inp, p => { S.opp[i] = p.n; persist(); renderBattle(); const nx = S.opp.findIndex(x => !byName.get(x)); const f = nx >= 0 && $('bmOpp' + nx); if (f) f.focus(); }, p => !S.opp.includes(p.n)); });
  bmTimer(); }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bms],[data-bmw],[data-bmi],[data-bmx],#bmClear,#bmShot,#bmClockBtn,[data-battle]'); if (!b) return;
  const d = b.dataset;
  if (d.battle != null) { setView('battle'); return; }
  if (d.bms) bmUi[d.bms] = !bmUi[d.bms]; else if (d.bmw != null) bmUi.weather = d.bmw; else if (d.bmi) bmUi[d.bmi] = !bmUi[d.bmi];
  else if (d.bmx != null) { S.opp[+d.bmx] = ''; persist(); }
  else if (b.id === 'bmClear') { S.opp = ['', '', '', '', '', '']; persist(); }
  else if (b.id === 'bmShot') { const f = $('shotFile'); if (f) f.click(); return; }
  else if (b.id === 'bmClockBtn') { if (bmUi.t0) { bmUi.t0 = 0; clearInterval(bmUi.timer); bmUi.timer = null; } else { bmUi.t0 = Date.now(); clearInterval(bmUi.timer); bmUi.timer = setInterval(bmTimer, 250); } }
  keepScroll(() => renderBattle());
  if (d.bmx != null) { const f = $('bmOpp' + d.bmx); if (f) f.focus(); } });
