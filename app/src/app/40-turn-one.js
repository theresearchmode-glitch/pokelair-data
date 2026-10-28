// ---------- turn 1: what your two leads should do into their likely leads ----------
// Built from each side's usual moves, real damage (39-damage-calc-speed.js) and likely speed.
// Fake Out the biggest threat, set speed control when they outspeed you, otherwise take the best KO or the best damage.
function turnOnePlan(mine, theirs, r) {
  if (r.lead.length < 2 || theirs.length < 2) return '';
  const opp = r.B ? likelyLead(theirs, r.B) : theirs.slice(0, 2);
  const L = r.lead.map(i => mine[i]), names = m => new Set(memberMoves(m).moves.map(x => x.name));
  // your leads use their real items and spreads; the weather/terrain the four leads set is in play for every hit
  const mineM = m => { const o = m && m._orig || m; return L.includes(o) ? o : null; }; // _orig: the pre-Mega stand-in turnOneField passes
  const spe = m => { const s = likelySpeed(m.p, mineM(m)); return s.scarf ? Math.floor(s.v * 1.5) : s.v; };
  // a Cloud Nine / Air Lock lead switches the weather's effects off for every hit and speed (F0.wx)
  const F0 = typeof turnOneField === 'function' ? turnOneField([...L, ...opp], spe) : {}, F = {...F0, weather: F0.wx != null ? F0.wx : F0.weather};
  const hitOn = (a, moves, d) => bestHitOn(a.p, moves, d.p, mineM(a), mineM(d), F);
  // speed in that field: Chlorophyll / Swift Swim / Sand Rush / Slush Rush double in their weather
  const speF = x => spe(x) * (typeof speedMul === 'function' ? speedMul(abilityOf(x), F.weather) : 1);
  // their threat to each of my leads: the hardest single hit
  const danger = opp.map(o => { let worst = null; for (const m of L) { const h = hitOn(o, o.moves || [], m); if (h && (!worst || h.r.max / h.r.hp > worst.pct)) worst = {pct: h.r.max / h.r.hp, h, on: m}; } return {o, worst}; })
    .sort((a, b) => (b.worst ? b.worst.pct : 0) - (a.worst ? a.worst.pct : 0));
  const fast = opp.filter(o => L.some(m => speF(o) > speF(m))).length;
  const lines = [], used = new Set(), mvOf = (m, n) => memberMoves(m).moves.find(x => x && x.name === n) || mvByName.get(n);
  // each action carries its priority bracket (Fake Out +3, Prankster Tailwind +1, Trick Room −7…) for the turn order below
  const pr = (m, n) => movePrio(mvOf(m, n), m.ability, {terrain: F.terrain, grounded: grounded(m)});
  for (const m of L) { const mv = names(m), partner = L.find(x => x !== m);
    if (mv.has('Fake Out') && danger[0] && !used.has('fake')) { used.add('fake'); lines.push([m, `Fake Out ${esc(danger[0].o.d)}`, danger[0].worst ? `its ${esc(danger[0].worst.h.mv.name)} does up to ${Math.round(100 * danger[0].worst.pct)}% to ${esc(danger[0].worst.on.d)}` : 'their biggest threat', pr(m, 'Fake Out')]); continue; }
    if (mv.has('Tailwind') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Tailwind', `${fast} of their leads outspeed your side`, pr(m, 'Tailwind')]); continue; }
    if (mv.has('Trick Room') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Trick Room', 'they are faster; Trick Room goes up last this turn (−7) and flips the order from next turn', pr(m, 'Trick Room')]); continue; }
    // attack: prefer a KO, then the most damage; spread moves count both targets; a move that charges first or hits your own
    // partner says so
    let best = null;
    for (const o of opp) { const h = hitOn(m, memberMoves(m).moves, o); if (!h) continue; const pct = h.r.max / h.r.hp, ko = h.r.min >= h.r.hp && !h.charge;
      const hitsAlly = h.mv.ally && allyHit(h.mv, partner);
      const val = (ko ? 2 : 0) + pct * (h.charge ? .3 : 1) * (h.acc / 100) + (h.mv.spread ? .3 : 0) - (hitsAlly ? .4 : 0); if (!best || val > best.val) best = {o, h, pct, ko, val, hitsAlly}; }
    if (best) { const nt = hitNote(best.h), ally = best.hitsAlly ? (() => { const r2 = hitOn(m, [best.h.mv], partner); return `; also hits your ${esc(partner.d)}${r2 ? ' for up to ' + Math.round(100 * r2.r.max / r2.r.hp) + '%' : ''}`; })() : '';
      lines.push([m, `${esc(best.h.mv.name)} ${best.h.mv.spread ? '(hits both)' : 'into ' + esc(best.o.d)}`, `${best.ko ? 'KOs' : 'up to ' + Math.round(100 * best.pct) + '%'}${best.h.mv.spread ? ' on ' + esc(best.o.d) : ''}${nt ? ' (' + nt + ')' : ''}${ally}`, pr(m, best.h.mv.name)]); }
    else lines.push([m, 'Protect or switch', 'no good attack into these leads', 4]); }
  const warn = danger.filter(x => x.worst && x.worst.pct >= .8).map(x => `${esc(x.o.d)}'s ${esc(x.worst.h.mv.name)} can KO ${esc(x.worst.on.d)}`);
  // turn order: priority bracket first (your planned move; theirs: Fake Out if they carry it), then Speed inside a bracket
  const oPr = o => (o.moves || []).some(x => x && x.name === 'Fake Out') ? 3 : 0;
  const order = [...L, ...opp].map(x => { const me = L.includes(x), ln = me ? lines.find(l => l[0] === x) : null; return {x, s: speF(x), me, p: me ? (ln ? ln[3] || 0 : 0) : oPr(x)}; })
    .sort((a, b) => b.p - a.p || b.s - a.s);
  return `<div class="plan t1plan"><div class="ph"><span class="pt">Turn 1</span><span class="vsub">your ${esc(L[0].d)} + ${esc(L[1].d)} vs their likely ${esc(opp[0].d)} + ${esc(opp[1].d)}</span></div>
    ${lines.map(([m, act, why]) => `<div class="t1row"><b>${esc(m.d)}</b><span class="t1act">${act}</span><span class="t2">${why}</span></div>`).join('')}
    ${warn.length ? `<p class="t2 t1warn">Watch: ${warn.join('; ')}. Consider Protect.</p>` : ''}
    ${F0.weather || F.terrain ? `<p class="t2" style="margin:0">Field on turn 1: ${esc(fieldWords(F0))}${F0.wBy ? ` (${esc(F0.wBy.d)})` : ''}${F0.negated && F0.weather ? ', but Cloud Nine / Air Lock cancels the weather while it\'s out' : ''}${F0.traced ? '. A Trace user may copy a weather or terrain ability and change this' : ''}. Damage above includes it.</p>` : ''}
    <p class="t2" style="margin:0">Turn order: ${order.map(o => `<span class="${o.me ? 't1me' : ''}">${esc(o.x.d)} ${o.s}${o.p ? ` (${o.p > 0 ? '+' : '−'}${Math.abs(o.p)}${!o.me ? ' if Fake Out' : ''})` : ''}</span>`).join(' › ')}</p></div>`;
}
