// ---------- turn 1: what your two leads should do into their likely leads ----------
// Built from each side's usual moves, real damage (39-damage-calc-speed.js) and likely speed.
// Fake Out the biggest threat, set speed control when they outspeed you, otherwise take the best KO or the best damage.
function turnOnePlan(mine, theirs, r) {
  if (r.lead.length < 2 || theirs.length < 2) return '';
  const opp = r.B ? likelyLead(theirs, r.B) : theirs.slice(0, 2);
  const L = r.lead.map(i => mine[i]), names = m => new Set(memberMoves(m).moves.map(x => x.name));
  const spe = m => { const s = likelySpeed(m.p); return s.scarf ? Math.floor(s.v * 1.5) : s.v; };
  const hitOn = (a, moves, d) => bestHitOn(a.p, moves, d.p);
  // their threat to each of my leads: the hardest single hit
  const danger = opp.map(o => { let worst = null; for (const m of L) { const h = hitOn(o, o.moves || [], m); if (h && (!worst || h.r.max / h.r.hp > worst.pct)) worst = {pct: h.r.max / h.r.hp, h, on: m}; } return {o, worst}; })
    .sort((a, b) => (b.worst ? b.worst.pct : 0) - (a.worst ? a.worst.pct : 0));
  const fast = opp.filter(o => L.some(m => spe(o) > spe(m))).length;
  const lines = [], used = new Set();
  for (const m of L) { const mv = names(m);
    if (mv.has('Fake Out') && danger[0] && !used.has('fake')) { used.add('fake'); lines.push([m, `Fake Out ${esc(danger[0].o.d)}`, danger[0].worst ? `its ${esc(danger[0].worst.h.mv.name)} does up to ${Math.round(100 * danger[0].worst.pct)}% to ${esc(danger[0].worst.on.d)}` : 'their biggest threat']); continue; }
    if (mv.has('Tailwind') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Tailwind', `${fast} of their leads outspeed your side`]); continue; }
    if (mv.has('Trick Room') && fast && !used.has('speed')) { used.add('speed'); lines.push([m, 'Trick Room', 'they are faster; Trick Room flips it']); continue; }
    // attack: prefer a KO, then the most damage; spread moves count both targets
    let best = null;
    for (const o of opp) { const h = hitOn(m, memberMoves(m).moves, o); if (!h) continue; const pct = h.r.max / h.r.hp, ko = h.r.min >= h.r.hp;
      const val = (ko ? 2 : 0) + pct + (h.mv.spread ? .3 : 0); if (!best || val > best.val) best = {o, h, pct, ko, val}; }
    if (best) lines.push([m, `${esc(best.h.mv.name)} ${best.h.mv.spread ? '(hits both)' : 'into ' + esc(best.o.d)}`, `${best.ko ? 'KOs' : 'up to ' + Math.round(100 * best.pct) + '%'}${best.h.mv.spread ? ' on ' + esc(best.o.d) : ''}`]);
    else lines.push([m, 'Protect or switch', 'no good attack into these leads']); }
  const warn = danger.filter(x => x.worst && x.worst.pct >= .8).map(x => `${esc(x.o.d)}'s ${esc(x.worst.h.mv.name)} can KO ${esc(x.worst.on.d)}`);
  const order = [...L, ...opp].map(x => ({x, s: spe(x), me: L.includes(x)})).sort((a, b) => b.s - a.s);
  return `<div class="plan t1plan"><div class="ph"><span class="pt">Turn 1</span><span class="vsub">your ${esc(L[0].d)} + ${esc(L[1].d)} vs their likely ${esc(opp[0].d)} + ${esc(opp[1].d)}</span></div>
    ${lines.map(([m, act, why]) => `<div class="t1row"><b>${esc(m.d)}</b><span class="t1act">${act}</span><span class="t2">${why}</span></div>`).join('')}
    ${warn.length ? `<p class="t2 t1warn">Watch: ${warn.join('; ')}. Consider Protect.</p>` : ''}
    <p class="t2" style="margin:0">Speed order: ${order.map(o => `<span class="${o.me ? 't1me' : ''}">${esc(o.x.d)} ${o.s}</span>`).join(' › ')}</p></div>`;
}
