// ---------- turn 1: drawing (today's page). The logic, turnOneData, is shared: 40-turn-one-data.js (moved Nov 12 so the rebuild's Battle has it) ----------
function turnOnePlan(mine, theirs, r) { return drawTurnOne(turnOneData(mine, theirs, r)); }
function drawTurnOne(T) { if (!T) return '';
  const L = T.leads, opp = T.opp, F0 = T.field;
  /* trial v2: turn one told as a strip in move order. Your moves on blue, their threat on pink; the why stays one short line */
  const tc = x => { try { return TC[x.p.t[0]] || '#888'; } catch (e) { return '#888'; } };
  const beats = T.beats.map((o, k) => `<li class="rzbeat ${o.me ? 'you' : 'them'}" style="--tc:${tc(o.x)}"><span class="rzbn" aria-hidden="true">${k + 1}</span>${sprite(o.x.p, 'rzbspr') || ''}
      <div class="rzbt"><span class="rzbwho">${o.me ? 'You' : 'Them'} · ${esc(o.x.d)} <small>${o.speed} Speed${o.prio ? ` · ${o.prio > 0 ? '+' : '−'}${Math.abs(o.prio)}` : ''}</small></span><b class="rzmove">${esc(o.act)}</b><span class="t2">${esc(o.why)}</span></div></li>`).join('');
  return `<div class="plan t1plan rzt1"><div class="ph"><span class="pt">Turn one, in move order</span><span class="vsub">your ${esc(L[0].d)} + ${esc(L[1].d)} vs their likely ${esc(opp[0].d)} + ${esc(opp[1].d)}</span></div>
    <ol class="rzbeats">${beats}</ol>
    ${T.warn.length ? `<p class="rzwarn"><b>Watch</b> ${T.warn.map(esc).join('; ')}. Consider Protect.</p>` : ''}
    ${F0.weather || T.terrain ? `<p class="rzfield"><span class="k">Field on turn 1</span> ${esc(fieldWords(F0))}${F0.wBy ? ` (${esc(F0.wBy.d)})` : ''}${F0.negated && F0.weather ? ', cancelled by Cloud Nine / Air Lock while it\'s out' : ''}${F0.traced ? '. A Trace user may copy it' : ''}</p>` : ''}
    ${''/* Turn order line removed (Nov 8): the numbered beats above already run in move order with each speed */}</div>`;
}
