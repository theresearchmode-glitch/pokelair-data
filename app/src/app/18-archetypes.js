// ---------- Archetypes: how a team plans to win, read the way players read team preview ----------
// Speed mode (Tailwind, Trick Room, both, none) + field (weather, terrain) + control plans (Perish trap).
// Matchup rules come from VGC archetype theory (Smogon archetype series, VGCGuide, MetaVGC) and Reg M-C results.
const WEATHER_KEYS = ['sun', 'rain', 'sand', 'snow'], TERRAIN_KEYS = ['psy', 'grassy', 'elec', 'misty'];
function teamArchetype(ms) {
  if (!ms.length) return null;
  const r = teamRoles(ms), gp = gamePlan(ms), c = gp.c;
  const tw = c.tw >= .5, tr = c.tr >= .5, slow = ms.filter(m => isSlow(m.p)).length;
  const field = r.arch.filter(a => WEATHER_KEYS.includes(a.key) || TERRAIN_KEYS.includes(a.key));
  const weather = field.filter(a => WEATHER_KEYS.includes(a.key)), terrain = field.filter(a => TERRAIN_KEYS.includes(a.key));
  const perish = ms.some(m => relMove(m, ['Perish Song'])[0] >= .3) && ms.some(m => ['Shadow Tag', 'Arena Trap'].includes(m.ability) || relMove(m, ['Mean Look', 'Block', 'Spirit Shackle'])[0] >= .3);
  // Hard Trick Room = the team is built around the room: 3+ slow attackers besides the setters and at most one fast
  // Pokémon (base Speed 90+). A Trick Room setter on an otherwise fast team is just "Trick Room" (a second mode).
  const trSet = ms.filter(m => relMove(m, ['Trick Room'])[0] >= .5), slowAtt = ms.filter(m => isSlow(m.p) && !trSet.includes(m)).length,
    fast = ms.filter(m => (m.p.st ? m.p.st[5] : m.p.sp) >= 90).length;
  const speed = tw && tr ? 'tailroom' : tr ? (slowAtt >= 3 && fast <= 1 ? 'hardtr' : 'tr') : tw ? 'tw' : 'none';
  const SPEED_NAME = {tailroom: 'TailRoom', hardtr: 'Hard Trick Room', tr: 'Trick Room', tw: 'Tailwind', none: ''};
  const wn = weather.filter(a => a.active || weather.length > 1).map(a => a.name), tn = terrain.filter(a => a.active).map(a => a.name);
  const parts = [];
  if (perish) parts.push('Perish Trap');
  if (wn.length) parts.push(wn.length === 2 && wn.includes('Sun') && wn.includes('Rain') ? 'Sun-Rain' : wn.join('-'));
  parts.push(...tn);
  if (SPEED_NAME[speed]) parts.push(SPEED_NAME[speed]);
  const label = parts.length ? parts.slice(0, 3).join(' · ') : (c.fake >= .5 ? 'Balance (Fake Out pressure)' : 'Balance');
  const by = k => ms.filter(m => relMove(m, ROLE[k])[0] >= .5);
  const trappers = perish ? ms.filter(m => ['Shadow Tag', 'Arena Trap'].includes(m.ability) || relMove(m, ['Perish Song'])[0] >= .3) : [];
  return {label, speed, perish, trappers, slow, weather: weather.map(a => a.key), terrain: terrain.map(a => a.key), field, c,
    setters: {tw: by('tw'), tr: by('tr')}, anti: by('anti'), fake: by('fake'), redir: by('redir'), prio: by('prio'), drop: by('drop'),
    ghosts: ms.filter(m => (m.types || m.p.t).includes('Ghost')), chop: ms.filter(m => relMove(m, ['Throat Chop', 'Taunt'])[0] >= .3),
    flyers: ms.filter(m => !grounded(m)), quake: ms.filter(m => relMove(m, ['Earthquake', 'Bulldoze'])[0] >= .4)};
}
const archName = k => ARCH[k] ? ARCH[k].name : k;
const listD = ms => ms.slice(0, 3).map(m => m.d).join(', ');
// What happens when archetype A (you) meets B (them). Returns notes {tone: good|bad|even, t: title, d: detail}.
function archMatchup(A, B, mine) {
  const out = [], add = (tone, t, d) => out.push({tone, t, d});
  const fastSpeed = s => s === 'tw', trS = s => s === 'tr' || s === 'hardtr';
  // speed modes
  if (trS(B.speed) || B.speed === 'tailroom') {
    if (trS(A.speed) || A.speed === 'tailroom') add('even', 'Trick Room mirror', `Both of you can set Trick Room. Setting it again ends it, so time yours to undo theirs or let theirs run out with Protect.`);
    else if (A.anti.length) add('even', 'Stop their Trick Room', `${listD(A.anti)} can Taunt or Encore ${listD(B.setters.tr) || 'their setter'} before it sets the room.${B.terrain.includes('psy') ? '' : ' Fake Out also buys a turn.'}`);
    else add('bad', 'Their Trick Room flips your speed', `${listD(B.setters.tr) || 'Their setter'} can reverse turn order for the next 4 turns. You have no Taunt or Imprison, so ${B.terrain.includes('psy') ? 'hit the setter hard turn 1 (their Psychic Terrain blocks Fake Out)' : 'pressure or Fake Out the setter turn 1'}, or Protect and switch to stall the turns out.`);
  }
  if (fastSpeed(B.speed) || B.speed === 'tailroom') {
    if (trS(A.speed) || A.speed === 'tailroom') add('good', 'Your Trick Room beats their Tailwind', `Under your room their Tailwind speed works against them. Watch for Taunt on ${listD(A.setters.tr)}.`);
    else if (A.speed === 'tw') add('even', 'Tailwind mirror', `Whoever sets Tailwind first and keeps it up usually wins. ${A.drop.length ? listD(A.drop) + ' can slow them back down.' : 'Speed drops like Icy Wind help here.'}`);
    else add('bad', 'They control speed, you don\'t', `${listD(B.setters.tw) || 'Their setter'} can double their speed for the next 3 turns. Protect through it or knock the setter out turn 1.`);
  }
  if (B.speed === 'none' && A.speed !== 'none') add('good', 'You control speed', `They have no Tailwind or Trick Room, so your ${A.speed === 'tw' ? 'Tailwind' : 'Trick Room'} should decide turn order.`);
  // weather war
  const aw = A.weather, bw = B.weather;
  if (aw.length && bw.length && !aw.some(w => bw.includes(w))) {
    const beats = {rain: ['sun', 'sand'], sand: ['sun'], sun: [], snow: []};
    const good = aw.some(w => bw.some(x => (beats[w] || []).includes(x))), bad = bw.some(x => aw.some(w => (beats[x] || []).includes(w)));
    add(good && !bad ? 'good' : bad && !good ? 'bad' : 'even', `Weather war: your ${aw.map(archName).join('/')} vs their ${bw.map(archName).join('/')}`, `The last setter to come in wins the weather, and a Mega setter (Mega Charizard Y) sets it on its Mega turn. Keep your setter in the back if you need to overwrite theirs late.`);
  } else if (bw.length && !aw.length) {
    const ts = bw.map(w => W_TYPE[w]), hurt = mine.filter(m => ts.some(t => mult(t, m.types || m.p.t, m.ability, true) >= 2));
    add(hurt.length >= 2 ? 'bad' : 'even', `They bring ${bw.map(w => archName(w).toLowerCase()).join(' and ')}`, `${ts.join(' and ')}-type attacks get 50% stronger in it${hurt.length ? `, and ${listD(hurt)} ${hurt.length === 1 ? 'is' : 'are'} weak to ${ts.length > 1 ? 'one of them' : ts[0]}` : ''}. You have no setter to take the weather back.`);
  }
  const sameW = aw.filter(w => bw.includes(w)), sameT = A.terrain.filter(t => B.terrain.includes(t));
  if (sameW.length) add('even', `${archName(sameW[0])} mirror`, `You both use ${archName(sameW[0]).toLowerCase()}, so it helps their attackers as much as yours. The edge goes to whoever wins speed and keeps their abusers healthy${sameW[0] === 'rain' || sameW[0] === 'sun' ? '; a Mega setter or a late switch-in can also refresh the turns' : ''}.`);
  if (sameT.length) add('even', `${archName(sameT[0])} mirror`, 'The terrain boosts both sides. Re-setting it with a switch-in only refreshes the turns, so play for speed and positioning instead.');
  // terrain
  if (B.terrain.includes('psy')) {
    const reliant = A.fake.length + A.prio.length;
    add(reliant >= 2 ? 'bad' : 'even', 'Psychic Terrain blocks priority', `Their ${listD(B.field.find(a => a.key === 'psy').setters)} stops Fake Out and priority moves into grounded targets${reliant ? `, which shuts off ${listD([...A.fake, ...A.prio])}` : ''}. ${A.flyers.length ? 'It doesn\'t protect their Flying or Levitate Pokémon.' : ''}`);
  }
  if (B.terrain.includes('grassy') && A.quake.length) add('bad', 'Grassy Terrain halves Earthquake', `${listD(A.quake)} ${A.quake.length === 1 ? 'deals' : 'deal'} half damage with Earthquake into grounded foes, and their side heals every turn. Watch for Grassy Glide priority.`);
  if (B.terrain.includes('elec')) add('even', 'Electric Terrain', `Their Electric moves hit 30% harder and nobody grounded can be put to sleep. Electric Seed users (often Sneasler) get a speed boost when it goes up.`);
  if (A.terrain.length && B.terrain.length && !A.terrain.some(t => B.terrain.includes(t))) add('even', `Terrain war: your ${A.terrain.map(archName).join('/')} vs their ${B.terrain.map(archName).join('/')}`, 'Terrain setters overwrite each other on switch-in, so the last one in wins. Save a switch-in to reset yours.');
  // control
  if (B.perish) add(A.ghosts.length || A.chop.length ? 'even' : 'bad', 'Perish trap', `They trap you and use Perish Song. ${A.ghosts.length ? listD(A.ghosts) + ' (Ghost) can\'t be trapped. ' : ''}${A.chop.length ? listD(A.chop) + ' can Throat Chop or Taunt to stop the song. ' : ''}${!A.ghosts.length && !A.chop.length ? 'Pivot moves and early pressure on the trapper are your outs.' : ''}`);
  if (A.perish && !B.ghosts.length) add('good', 'Your Perish trap', 'They have no Ghost types to escape the trap.');
  if (!out.length) add('even', 'No archetype edge', 'Neither side has a speed or field plan that counters the other. Type matchups and play decide it.');
  return out;
}
// Their most likely lead pair: field or speed setters first, then Fake Out.
function likelyLead(theirs, B) { const score = o => (B.setters.tr.includes(o) ? 3 : 0) + (B.setters.tw.includes(o) ? 2.5 : 0) + (B.field.some(a => a.setters.includes(o)) ? 2.5 : 0) + (B.fake.includes(o) ? 2 : 0) + (B.redir.includes(o) ? 1 : 0) + viability(o.p) / 50;
  return theirs.slice().sort((a, b) => score(b) - score(a)).slice(0, 2); }

function renderOppSlots() {
  const el = $('oppSlots'); if (!el) return;
  el.innerHTML = S.opp.map((n, i) => { const p = byName.get(n);
    return p ? `<div class="oppslot filled"><span class="sl-num">${i + 1}</span><span class="on">${esc(p.d)}</span><span class="chips">${p.t.map(t => chip(t)).join('')}</span><button class="x" type="button" data-unopp="${i}" aria-label="Remove ${esc(p.d)}">×</button></div>`
             : `<div class="oppslot"><span class="sl-num">${i + 1}</span><div class="cb"><input class="field" id="opp${i}" placeholder="Their Pokémon" autocomplete="off" role="combobox" aria-expanded="false" aria-label="Opponent Pokémon ${i + 1}"></div></div>`; }).join('');
  S.opp.forEach((n, i) => { const inp = $('opp' + i); if (inp) bindMonInput(inp, p => { S.opp[i] = p.n; persist(); renderMatchup(); const nx = S.opp.findIndex(x => !byName.get(x)); const f = nx >= 0 && $('opp' + nx); if (f) f.focus(); }); });
}
function renderMatchup() {
  renderOppSlots();
  { const q = $('oppQuick'), d = META.teams; if (q) { if (!d || !d.teams.length) q.innerHTML = '';
      else if (!q.dataset.ver || q.dataset.ver !== String(metaVersion)) { q.dataset.ver = String(metaVersion);
        q.innerHTML = `<label class="lbl" for="oppTeamSel">Practice against a top team</label><select class="field" id="oppTeamSel"><option value="">Pick a tournament team…</option>${d.teams.map((t, i) => `<option value="${i}">${esc(t.player)} ${esc(t.record)} · ${esc(teamPlanLabel(t.mons))}</option>`).join('')}</select>`; } } }
  const el = $('mu'); if (!el) return;
  const useA = $('useAbil').checked; const mine = members(); const theirs = S.opp.map(n => byName.get(n)).filter(Boolean).map(oppMember);
  if (!mine.length) { el.innerHTML = '<div class="empty-note">Build your team on the Build tab first.</div>'; if (view === 'matchup') safe('battle', renderBattle); return; }
  if (!theirs.length) { el.innerHTML = '<div class="empty-note">Add their Pokémon above first.</div>'; if (view === 'matchup') safe('battle', renderBattle); return; }
  const r = planMatchup(mine, theirs, useA);
  const nm = i => esc(mine[i].d), th = j => esc(theirs[j].d);
  const handles = i => theirs.map((o, j) => j).filter(j => r.h.M[i][j] >= 1);
  const monLine = (i, tag) => { const hs = handles(i);
    return `<div class="muline"><span class="mutag ${tag === 'Lead' ? 'lead' : ''}">${tag}</span><span class="in">${nm(i)}</span><span class="chips">${mine[i].types.map(t => chip(t)).join('')}</span><span class="t2">${hs.length ? 'Good into ' + hs.map(th).join(', ') : 'Flexible pick, no standout matchup'}</span></div>`; };
  // their biggest threats: who hits several of your picks super effectively
  const threats = theirs.map((o, j) => { const hit = r.chosen.filter(i => r.h.def[i][j] && r.h.def[i][j].x >= 2);
    const ans = r.chosen.filter(i => r.h.M[i][j] >= 1); return {j, hit, ans, move: hit.length ? r.h.def[hit[0]][j].e.move : ''}; })
    .filter(t => t.hit.length >= 2 || (t.hit.length && !t.ans.length)).sort((a, b) => b.hit.length - a.hit.length).slice(0, 4);
  const grid = `<details class="foot"><summary>Full matchup grid</summary><div class="tablewrap" style="margin-top:8px"><table><tr><th class="t">You ↓ / Them →</th>${theirs.map(o => `<th title="${esc(o.d)}">${esc(o.d.replace('Mega ', 'M·').slice(0, 12))}</th>`).join('')}</tr>
    ${mine.map((m, i) => `<tr><td class="t">${nm(i)}</td>${theirs.map((o, j) => { const v = r.h.M[i][j]; const c = v >= 1.5 ? 'mq' : v >= .75 ? 'mh' : v <= -1.5 ? 'm4' : v <= -.75 ? 'm2' : ''; return `<td><span class="m ${c}">${v > 0 ? '+' : ''}${Math.round(v * 4) / 4}</span></td>`; }).join('')}</tr>`).join('')}</table></div>
    <p>Plus means you hit them harder than they hit you, using each side's most common moves and abilities. Speed breaks ties.</p></details>`;
  const archBlock = r.A && r.B ? (() => { const notes = archMatchup(r.A, r.B, mine), ll = likelyLead(theirs, r.B);
    return `<div class="plan archmu"><div class="ph"><span class="pt">Archetype matchup</span></div>
      <div class="archvs"><div><span class="lbl">You</span><span class="archchips">${archChips(r.A.label)}</span></div><span class="vs">vs</span><div><span class="lbl">Them</span><span class="archchips">${archChips(r.B.label)}</span></div></div>
      ${notes.map(n => `<div class="prob-row"><span class="sev ${n.tone === 'good' ? 'ok' : n.tone === 'bad' ? 'hi' : 'mid'}">${n.tone === 'good' ? 'Edge' : n.tone === 'bad' ? 'Watch' : 'Note'}</span><div><b>${esc(n.t)}</b>: ${esc(n.d)}</div></div>`).join('')}
      ${ll.length === 2 ? `<p class="t2" style="margin:0">Likely lead: <b>${esc(ll[0].d)}</b> + <b>${esc(ll[1].d)}</b> (their speed and field setters, then Fake Out).</p>` : ''}</div>`; })() : '';
  // Battle mode (47-battle-mode.js) shows the four, the leads and turn 1; this is the deeper read underneath it
  const thr = `<div class="plan"><div class="ph"><span class="pt">Their threats</span><span class="vsub">to your four</span></div><div class="problems">${threats.length ? threats.map(t => `<div class="prob-row"><span class="sev ${t.ans.length ? 'mid' : 'hi'}">Watch</span><div><b>${th(t.j)}</b>: ${esc(t.move)} hits ${t.hit.map(nm).join(', ')} super effectively. ${t.ans.length ? 'Answer: ' + t.ans.map(nm).join(', ') + '.' : 'No clean answer in your 4, so keep it in check with speed control or double-targeting.'}</div></div>`).join('')
      : '<div class="prob-row"><span class="sev ok">Clear</span><div>None of their Pokémon threatens several of your picks at once.</div></div>'}</div></div>`;
  el.innerHTML = archBlock + thr + grid;
  if (typeof view !== 'undefined' && view === 'matchup') safe('battle', renderBattle);
}

// Biggest threats to your team from the current meta list.
function renderThreats(ms, useA) {
  const el = $('threats'); if (!el) return;
  const d = metaDoc();
  if (!ms.length) { el.innerHTML = '<div class="empty-note">Add Pokémon to see which meta threats hit your team hardest.</div>'; return; }
  if (!d || !d.top || !d.top.length) { el.innerHTML = '<div class="empty-note">Threats appear once meta data has loaded.</div>'; return; }
  let RDx = null; try { RDx = prepOf(ms); } catch (e) {} const rdLv = n => { if (!RDx) return null; const b = (byName.get(n) || {}).b; const row = RDx.rows.find(x => x.t && x.t.n === n) || RDx.rows.find(x => x.t && (byName.get(x.t.n) || {}).b === b); return row ? row.level : null; }; const rdName = (n, d) => { if (!RDx) return d; const b = (byName.get(n) || {}).b, row = RDx.rows.find(x => x.t && x.t.n === n) || RDx.rows.find(x => x.t && (byName.get(x.t.n) || {}).b === b); return row ? row.t.d : d; };
  const theirs = d.top.slice(0, 20).map(t => { const p = byName.get(t.n); return p ? oppMember(megaFormFor(p, t)) : null; }).filter(Boolean);
  const h = headToHead(ms, theirs, useA);
  const rows = theirs.map((o, j) => { const hit = ms.map((m, i) => i).filter(i => h.def[i][j] && h.def[i][j].x >= 2);
    const ans = ms.map((m, i) => i).filter(i => h.M[i][j] >= 1);
    return {o, j, hit, ans, danger: hit.length * 2 + (ans.length ? 0 : 3) - ans.length * .5 + viability(o.p) / 50}; })
    .filter(r => r.hit.length >= 2 || !r.ans.length).sort((a, b) => b.danger - a.danger).slice(0, 8);
  const allRows = rows.length; if (PHONE() && !ui.threatsAll) rows.length = Math.min(rows.length, 4);
  el.innerHTML = rows.length ? rows.map(r => `<div class="item"><div style="min-width:0"><div class="t1">${esc(rdName(r.o.p.n, (byName.get(r.o.p.n) || r.o).d))} <span class="chips" style="display:inline-flex;vertical-align:middle">${r.o.types.map(t => chip(t)).join('')}</span></div>
      <div class="t2">${r.hit.length ? `Hits ${r.hit.length} of yours super effectively (${r.hit.map(i => esc(ms[i].d)).join(', ')})` : 'Hard to hit back'}. ${r.ans.length ? 'Your answers: ' + r.ans.map(i => esc(ms[i].d)).join(', ') : rdLv(r.o.p.n) >= 2 ? 'Answered by your scouting report (speed control, support or a combined KO), not 1-on-1' : '<span class="no">No clean answer</span>'}${(() => { try { let b = null; ms.forEach(m => { const x = bestHitOn(r.o.p, r.o.moves || [], m.p, null, m); if (x && (!b || x.r.max / x.r.hp > b.x.r.max / b.x.r.hp)) b = {x, m}; });
        return b ? `<br>Hardest hit: ${esc(b.x.mv.name)} does up to ${Math.round(100 * b.x.r.max / b.x.r.hp)}% to ${esc(b.m.d)}.` : ''; } catch (e) { return ''; } })()}</div></div>
      ${(() => { const lv = rdLv(r.o.p.n); return lv != null ? `<span class="pill ${['b3', 'b2', 'b1', 'b1'][lv]}">${['Unanswered', 'Shaky', 'Handled', 'Well handled'][lv]}</span>` : `<span class="pill ${r.ans.length ? (r.hit.length >= 3 ? 'b2' : 'b1') : 'b3'}">${r.ans.length ? (r.hit.length >= 3 ? 'Dangerous' : 'Manageable') : 'Unanswered'}</span>`; })()}</div>`).join('')
    : '<div class="empty-note">No top meta Pokémon hits several of yours super effectively while going unanswered. Nice.</div>';
  if (allRows > rows.length) el.innerHTML += `<div class="morebar"><button class="btn sm" type="button" id="threatsAllBtn">Show all ${allRows}</button></div>`;
}

// Top teams library.
function cleanTeams(d) { if (!d || typeof d !== 'object' || !Array.isArray(d.teams)) return null;
  return {source: str(d.source), updated: str(d.updated, 40), teams: d.teams.slice(0, 90).map(t => t && Array.isArray(t.mons) ? {player: str(t.player, 60), event: str(t.event, 120), record: str(t.record, 20), section: str(t.section, 60) || 'Teams',
    mons: inferMegas(t.mons.filter(n => typeof n === 'string' && byName.has(n)).slice(0, 6))} : null).filter(t => t && t.mons.length >= 4)}; }
// Team lists from Pokémon Zone name species only, so a Mega user shows as plain Garchomp or Raichu. Use the Mega when
// a real Limitless list with the same six species ran one, else when the Mega is 85%+ of that species' play.
function inferMegas(mons) { if (!mons.length || mons.some(n => (byName.get(n) || {}).m)) return mons;
  const base = n => (byName.get(n) || {}).b || n, key = ms => ms.map(base).sort().join('|');
  const pr = RES && Array.isArray(RES.proven) ? RES.proven.find(x => Array.isArray(x[0]) && x[0].length === mons.length && key(x[0]) === key(mons) && x[0].some(n => (byName.get(n) || {}).m)) : null;
  if (pr) { const left = pr[0].slice(); return mons.map(n => { const i = left.findIndex(m => base(m) === base(n)); return i >= 0 ? left.splice(i, 1)[0] : n; }); }
  const PD = activePerf(), U = (PD && (Object.keys(PD.smogon || {}).length ? PD.smogon : null)) || {}, T = (PD && PD.doubles) || {};
  const share = (q, fam) => { for (const D of [U, T]) { const g = n => D[n] == null ? 0 : (Array.isArray(D[n]) ? D[n][0] : D[n]); const tot = fam.reduce((a, f) => a + g(f.n), 0); if (tot > 0) return g(q.n) / tot; } return 0; };
  let best = null;
  for (const n of mons) { const p = byName.get(n); if (!p || p.n !== p.b && p.n !== 'Floette-Eternal') continue; const fam = ROSTER.filter(f => f.b === p.b && (f.n === p.n || f.m));
    for (const q of fam.filter(f => f.m)) { const sh = share(q, fam); if (sh >= .85 && (!best || sh > best.sh)) best = {n, q: q.n, sh}; } }
  return best ? mons.map(n => n === best.n ? best.q : n) : mons; }
// Run fn with off-meta scoring switched on (power and fit over popularity), then switch it back.
function withOffMeta(fn) { const keep = OFFMETA; OFFMETA = true; try { return fn(); } finally { OFFMETA = keep; } }
// The page is doubles only, so this just runs fn (kept for callers that still name the format).
function withFormat(fmt, fn) { return fn(); }
let ttLabelCache = new Map();
function teamPlanLabel(mons) { const key = metaVersion + '|' + mons.join(','); if (ttLabelCache.has(key)) return ttLabelCache.get(key); const v = teamPlanLabel_(mons); if (ttLabelCache.size > 300) ttLabelCache.clear(); ttLabelCache.set(key, v); return v; }
function teamPlanLabel_(mons) {
  const ms = () => mons.map(n => byName.get(n)).filter(Boolean).map(oppMember);
  const a = teamArchetype(ms()); return a ? a.label : 'Balance';
}
// Run the winning-team checklist on any 6-name doubles team (cached per meta update).
let ttGradeCache = new Map();
function gradeNames(names, itemsKnown) {
  const key = metaVersion + '|' + (itemsKnown ? 'k|' : '') + names.join(','); if (ttGradeCache.has(key)) return ttGradeCache.get(key);
  let g = null;
  try { const ms = names.map(n => byName.get(n)).filter(Boolean).map(p => abMember(p)); if (ms.length === 6) g = proChecks(ms, true, {itemsUnknown: !itemsKnown && !names.some(n => /-Mega/.test(n))});
  } catch (e) { g = null; }
  if (ttGradeCache.size > 200) ttGradeCache.clear(); ttGradeCache.set(key, g); return g;
}
const miniGrades = c => c ? `<span class="minick${c.pass === c.n ? ' all' : ''}" title="${esc(c.items.map(x => (x.skip ? '? ' : x.ok ? '✓ ' : x.part ? '~ ' : '✗ ') + x.label + (x.skip ? ' (items not listed)' : '')).join('\n'))}"><b>${c.pass}/${c.n}</b> checks${c.pass < c.n ? `<i>missing: ${esc(c.items.filter(x => !x.ok && !x.skip).map(x => x.label.toLowerCase()).join(', '))}</i>` : ''}${c.items.some(x => x.skip) ? '<i class="unkn">Mega not counted: items not listed</i>' : ''}</span>` : '';
// the raw source line is written for the data log; say it in plain words when it has the usual shape
function ttSourceText(src) { src = String(src || ''); const on = src.match(/top (\d+) of Reg M-C events with (\d+)\+ players/), off = src.match(/official events \(top (\d+)\)/);
  if (!on) return src; return `Top ${on[1]} from online events with ${on[2]}+ players${off ? `, top ${off[1]} from official events` : ''}`; }
function renderTopTeams() {
  const el = $('ttList'); if (!el) return; const d = META.teams;
  $('ttSource').textContent = d ? `${ttSourceText(d.source)}${d.updated ? ' · updated ' + new Date(d.updated).toLocaleDateString([], {month: 'short', day: 'numeric'}) : ''}` : '';
  if (!d || !d.teams.length) { el.innerHTML = '<div class="empty-note">Top teams appear here after the next data refresh.</div>'; return; }
  const sections = [...new Set(d.teams.map(t => t.section))];
  // your own team is graded exactly as the Team page grades it (your moves, abilities and items), so the two never disagree
  const mine = members(); let mg = null; if (mine.length === 6) { try { mg = proChecks(mine, $('useAbil') ? $('useAbil').checked : true); } catch (e) { mg = gradeNames(mine.map(m => m.p.n), true); } }
  const yours = `<div class="ttyours"><div><div class="lbl">Your team</div><div class="t2">${mine.length === 6 ? esc(mine.map(m => m.d).join(' · ')) : 'Add six Pokémon on My team to compare.'}</div></div><div class="ttright">${miniGrades(mg)}${mine.length === 6 ? `<span class="archchips">${archChips(teamPlanLabel(mine.map(m => m.p.n)))}</span>` : ''}</div></div>`;
  ui.ttMore = ui.ttMore || {};
  el.innerHTML = yours + sections.map(sec => { const all = d.teams.map((t, k) => ({t, k})).filter(x => x.t.section === sec), cap = ui.ttMore[sec] ? all.length : 5;
    return `<h3 class="lbl" style="margin:8px 0 2px">${esc(sec)} <span class="vsub">${all.length}</span></h3>` + all.slice(0, cap).map(({t, k}) => {
    const confirm = ui.ttConfirm === k;
    const g = gradeNames(t.mons), miss = g ? g.items.filter(x => !x.ok && !x.skip).map(x => x.label.toLowerCase()) : [];
    return `<div class="plan ttcard"><div class="ttwho"><div class="pt">${esc(t.player)} <span class="vsub">${esc(t.record)}</span></div><div class="t2">${esc(t.event)}</div></div>
      ${teamGrid(t.mons)}
      <div class="ttmeta">${g ? `<span class="ttck${g.pass === g.n ? ' all' : ''}${miss.length ? ' wide' : ''}" title="${esc(g.items.map(x => (x.skip ? '? ' : x.ok ? '✓ ' : '✗ ') + x.label).join('\n'))}"><b>${g.pass}/${g.n}</b> checks${miss.length ? ` · missing ${esc(miss.join(', '))}` : ''}</span>` : ''}<span class="archchips">${archChips(teamPlanLabel(t.mons))}</span></div>
      <div class="row evbtns">${confirm ? `<span class="inline-confirm" style="color:var(--ink)">Replace your current team?</span><button class="btn sm primary" type="button" data-ttload="${k}">Replace</button><button class="btn sm" type="button" data-ttx="1">Cancel</button>`
        : `<button class="btn sm" type="button" data-ttask="${k}">Load team</button><button class="linkbtn" type="button" data-ttvs="${k}">Practice against</button>`}</div></div>`; }).join('')
      + (all.length > cap ? `<button class="btn ttmore" type="button" data-ttmore="${esc(sec)}">Show ${all.length - cap} more</button>` : ''); }).join('');
}
function loadTopTeam(k) { const t = META.teams && META.teams.teams[k]; if (!t) return;
  // the same team from an event's full sheet (moves, items, abilities) when we have it (Oct 30 audit: it loaded popular sets)
  try { const key = t.mons.slice().sort().join('|'), E = META.events && META.events.events || [];
    for (const ev of E) for (const x of ev.top || []) if (x.player === t.player && x.mons.map(m => m.n).sort().join('|') === key) { ui.ttConfirm = null; loadSheet(x); return; } } catch (e) {}
  keepUndo();
  S.slots = normSlots(t.mons.map(n => ({n, a: null, lock: false})));
  // tournament teams are VGC doubles teams
  S.format = 'doubles'; S.loadedId = null; ui.ttConfirm = null; render(); setView('build'); toast(`Loaded ${t.player}'s team`, true); }

// Trends: compare each Pokémon's rank today with about a week ago.
function cleanHistory(d) { if (!d || !Array.isArray(d.days)) return null;
  const obj = o => { const out = {}; if (o && typeof o === 'object') for (const k of Object.keys(o).slice(0, 80)) { const v = num(o[k]); if (v != null && typeof k === 'string') out[k] = v; } return out; };
  return {days: d.days.slice(-40).filter(x => x && typeof x.d === 'string').map(x => ({d: x.d.slice(0, 10), ing: obj(x.ing), tour: obj(x.tour), lad: obj(x.lad)}))}; }
function trendKey() { return {ingame: 'ing', tour: 'tour', ladder: 'lad'}[ui.metaSrc]; }
function trendFor(name, rank) {
  const h = META.history; if (!h || h.days.length < 2) return null;
  const k = trendKey(); const latest = h.days[h.days.length - 1];
  const cutoff = new Date(new Date(latest.d).getTime() - 7 * 864e5).toISOString().slice(0, 10);
  const past = h.days.slice(0, -1).filter(x => x.d >= cutoff)[0] || h.days[h.days.length - 2];
  if (!past || !past[k] || !Object.keys(past[k]).length) return null;
  const was = past[k][name]; if (was == null) return {cls: 'new', txt: 'NEW'};
  const diff = was - rank; if (!diff) return null;
  return {cls: diff > 0 ? 'up' : 'down', txt: (diff > 0 ? '▲' : '▼') + Math.abs(diff)};
}


document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ttmore]'); if (!b) return; ui.ttMore = ui.ttMore || {}; ui.ttMore[b.dataset.ttmore] = true; renderTopTeams(); });
// "Practice against": a top team becomes the opponent in Battle mode
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ttvs]'); if (!b) return;
  const t = META.teams && META.teams.teams[+b.dataset.ttvs]; if (!t) return;
  S.opp = t.mons.slice(0, 6); while (S.opp.length < 6) S.opp.push(''); ui.oppFrom = {who: t.player, key: S.opp.slice().sort().join('|')}; persist(); setView('matchup'); toast(`${t.player}'s team is your opponent`); });
